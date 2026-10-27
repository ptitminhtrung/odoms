/**
 * =========================================================================================
 * DỰ ÁN: QUẢN LÝ VẬT TƯ & THIẾT BỊ VIỄN THÔNG - QLVT-V1 (CÔNG TY TNHH VIỄN THÔNG TRƯỜNG TIẾN)
 * MODULE: ENGINE TÍNH TOÁN TỒN KHO & GIÁ VỐN FIFO TRONG BỘ NHỚ (ENTERPRISE FIFO ENGINE V6)
 * CÁC TÍNH NĂNG NÂNG CẤP XỬ LÝ SỐ LIỆU ĐỘC LẬP:
 *   1. Tách biệt 2 hàm Parser:
 *      • parseCurrencyVND: Chuẩn hóa tiền tệ VNĐ (số nguyên làm tròn).
 *      • parseQuantity: Hỗ trợ số lượng thập phân (Decimal) cho các đơn vị đo: Mét cáp, Cuộn dây, Kg phụ trợ...
 *        (Xử lý triệt để lỗi thổi phồng số lượng 1.5 -> 15).
 *   2. LockService bọc try/catch trong finally: Chống Exception khi Lock tự hết hạn.
 *   3. Pre-condition Guard Clauses: Kiểm tra bắt buộc các cột khóa chính chống crash TypeError.
 *   4. Single Trigger Source (Webhook Only): Loại bỏ onEditTrigger chống Double Trigger.
 *   5. PropertiesService: Lưu Secret Token bảo mật ở tầng quản trị.
 *   6. parseDateTimeCustom: Phân loại chuẩn xác YYYY-MM-DD vs DD/MM/YYYY.
 * =========================================================================================
 */

// Cấu hình tham số hệ thống
const CONFIG = {
  SHEET_VATTU: "tbl_VatTu",
  SHEET_GIAODICH: "tbl_GiaoDich",
  HEADER_ROW_VATTU: 4,                  // Dòng chứa tiêu đề cột tbl_VatTu (Dòng 4 trong schema v9)
  DATA_START_ROW_VATTU: 5,              // Dòng bắt đầu dữ liệu tbl_VatTu
  HEADER_ROW_GIAODICH: 4,               // Dòng chứa tiêu đề cột tbl_GiaoDich (Dòng 4 trong schema v9)
  DATA_START_ROW_GIAODICH: 5,           // Dòng bắt đầu dữ liệu tbl_GiaoDich
  DEFAULT_PRICE_MARGIN: 500000,         // Độ lệch giá: Don_Gia_Ban = Don_Gia_Nhap + 500.000 VNĐ
  LOCK_TIMEOUT_MS: 30000,               // Thời gian chờ khóa tương tranh tối đa: 30 giây
  DEFAULT_SECRET_FALLBACK: "QLVT_TRUONGTIEN_SECURE_2026"
};

/**
 * HÀM KHỞI TẠO BẢO MẬT: LƯU SECRET TOKEN VÀO PROPERTIES SERVICE (CHẠY 1 LẦN KHI SETUP)
 */
function setupScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty("SECRET_TOKEN", CONFIG.DEFAULT_SECRET_FALLBACK);
  Logger.log("Đã khởi tạo thành công SECRET_TOKEN: " + CONFIG.DEFAULT_SECRET_FALLBACK);
}

/**
 * LẤY SECRET TOKEN TỪ PROPERTIES SERVICE
 */
function getSecretToken() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty("SECRET_TOKEN") || CONFIG.DEFAULT_SECRET_FALLBACK;
}

/**
 * =========================================================================================
 * HÀM CHÍNH 1: TÍNH TOÁN TOÀN BỘ GIÁ TRỊ TỒN KHO FIFO VÀ CẬP NHẬT XUỐNG TBL_VATTU
 * HỖ TRỢ ĐƠN VỊ TÍNH NGUYÊN CHIẾC (CÁI) LẪN SỐ LƯỢNG LẺ (MÉT CÁP, CUỘN, KG)
 * =========================================================================================
 */
function runFIFOInventoryCalculation() {
  const startTime = new Date().getTime();
  
  // 1. KHÓA TƯƠNG TRANH (LOCK SERVICE)
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
  
  if (!hasLock) {
    Logger.log("Cảnh báo: Hệ thống đang bận xử lý tiến trình khác (Lock Timeout).");
    return {
      success: false,
      message: "Hệ thống đang bận xử lý giao dịch khác (Lock Timeout). Vui lòng thử lại sau."
    };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetVatTu = ss.getSheetByName(CONFIG.SHEET_VATTU);
    const sheetGiaoDich = ss.getSheetByName(CONFIG.SHEET_GIAODICH);
    
    if (!sheetVatTu || !sheetGiaoDich) {
      Logger.log("Lỗi: Không tìm thấy sheet tbl_VatTu hoặc tbl_GiaoDich.");
      return { success: false, message: "Không tìm thấy sheet nguồn/đích" };
    }

    // 2. Đọc và kiểm tra cấu trúc bảng tbl_VatTu
    const vatTuLastRow = sheetVatTu.getLastRow();
    const vatTuLastCol = sheetVatTu.getLastColumn();
    if (vatTuLastRow < CONFIG.DATA_START_ROW_VATTU) {
      return { success: false, message: "Bảng tbl_VatTu không có dữ liệu" };
    }

    const vatTuHeaders = sheetVatTu.getRange(CONFIG.HEADER_ROW_VATTU, 1, 1, vatTuLastCol).getValues()[0];
    const vatTuData = sheetVatTu.getRange(CONFIG.DATA_START_ROW_VATTU, 1, vatTuLastRow - CONFIG.DATA_START_ROW_VATTU + 1, vatTuLastCol).getValues();

    // Map chỉ số cột tbl_VatTu
    const colVatTu = mapHeaderIndexes(vatTuHeaders);
    
    // KIỂM TRA PHÒNG VỆ: Bắt buộc phải có các cột khóa chính của tbl_VatTu
    const requiredVatTuCols = ["ID_VatTu", "Don_Gia"];
    for (const colName of requiredVatTuCols) {
      if (colVatTu[colName] === undefined) {
        Logger.log(`Lỗi nghiêm trọng: Bảng tbl_VatTu thiếu cột bắt buộc '${colName}'.`);
        return {
          success: false,
          message: `Bảng tbl_VatTu thiếu cột bắt buộc '${colName}' tại dòng tiêu đề ${CONFIG.HEADER_ROW_VATTU}.`
        };
      }
    }
    
    // Tự động thêm 2 cột mới nếu chưa có
    let colIndex_DonGiaFIFO = colVatTu["Don_Gia_Binh_Quan_FIFO"];
    let colIndex_GiaTriTon = colVatTu["Gia_Tri_Ton_Kho"];
    
    let addedCols = 0;
    if (colIndex_DonGiaFIFO === undefined) {
      colIndex_DonGiaFIFO = vatTuHeaders.length;
      sheetVatTu.getRange(CONFIG.HEADER_ROW_VATTU, colIndex_DonGiaFIFO + 1).setValue("Don_Gia_Binh_Quan_FIFO");
      addedCols++;
    }
    if (colIndex_GiaTriTon === undefined) {
      colIndex_GiaTriTon = vatTuHeaders.length + addedCols;
      sheetVatTu.getRange(CONFIG.HEADER_ROW_VATTU, colIndex_GiaTriTon + 1).setValue("Gia_Tri_Ton_Kho");
      addedCols++;
    }

    // Tạo Map lưu thông tin vật tư & xác định Đơn giá Nhập (Tiền tệ VNĐ)
    const vatTuMap = new Map();
    for (let i = 0; i < vatTuData.length; i++) {
      const row = vatTuData[i];
      if (!row || !Array.isArray(row)) continue;

      const rawId = row[colVatTu["ID_VatTu"]];
      if (rawId === null || rawId === undefined) continue;

      const idVatTu = String(rawId).trim();
      if (idVatTu !== "" && idVatTu !== "undefined") {
        const donGiaBan = parseCurrencyVND(row[colVatTu["Don_Gia"]]);
        const tenVatTu = colVatTu["Ten_VatTu"] !== undefined ? row[colVatTu["Ten_VatTu"]] : idVatTu;
        
        // Cơ chế phân giải Đơn giá Nhập (VNĐ)
        let donGiaNhap = 0;
        if (colVatTu["Don_Gia_Nhap"] !== undefined && parseCurrencyVND(row[colVatTu["Don_Gia_Nhap"]]) > 0) {
          donGiaNhap = parseCurrencyVND(row[colVatTu["Don_Gia_Nhap"]]);
        } else if (donGiaBan > CONFIG.DEFAULT_PRICE_MARGIN) {
          donGiaNhap = donGiaBan - CONFIG.DEFAULT_PRICE_MARGIN;
        } else if (donGiaBan > 0) {
          donGiaNhap = Math.round(donGiaBan * 0.8);
        }

        vatTuMap.set(idVatTu, {
          rowIndex: i,
          tenVatTu: tenVatTu,
          donGiaBan: donGiaBan,
          donGiaNhap: donGiaNhap,
          queue: [], // Hàng đợi chứa { soLuongNhap, donGiaNhap, soLuongConLai, ngayGio }
          soLuongTon: 0,
          giaTriTonKho: 0,
          donGiaBinhQuanFIFO: 0
        });
      }
    }

    // 3. Đọc và kiểm tra cấu trúc bảng tbl_GiaoDich
    const gdLastRow = sheetGiaoDich.getLastRow();
    const gdLastCol = sheetGiaoDich.getLastColumn();
    
    if (gdLastRow >= CONFIG.DATA_START_ROW_GIAODICH) {
      const gdHeaders = sheetGiaoDich.getRange(CONFIG.HEADER_ROW_GIAODICH, 1, 1, gdLastCol).getValues()[0];
      const gdData = sheetGiaoDich.getRange(CONFIG.DATA_START_ROW_GIAODICH, 1, gdLastRow - CONFIG.DATA_START_ROW_GIAODICH + 1, gdLastCol).getValues();
      const colGD = mapHeaderIndexes(gdHeaders);

      // KIỂM TRA PHÒNG VỆ: Bắt buộc phải có các cột khóa chính của tbl_GiaoDich
      const requiredGDCols = ["ID_VatTu", "Loai_Giao_Dich", "So_Luong_Cai", "Ngay_Gio"];
      for (const colName of requiredGDCols) {
        if (colGD[colName] === undefined) {
          Logger.log(`Lỗi nghiêm trọng: Bảng tbl_GiaoDich thiếu cột bắt buộc '${colName}'.`);
          return {
            success: false,
            message: `Bảng tbl_GiaoDich thiếu cột bắt buộc '${colName}' tại dòng tiêu đề ${CONFIG.HEADER_ROW_GIAODICH}.`
          };
        }
      }

      // Chuyển đổi dữ liệu giao dịch & chuẩn hóa ngày giờ + số lượng (hỗ trợ số lẻ)
      const transactionList = [];
      for (let r = 0; r < gdData.length; r++) {
        const row = gdData[r];
        if (!row || !Array.isArray(row)) continue;

        const rawId = row[colGD["ID_VatTu"]];
        if (rawId === null || rawId === undefined) continue;

        const idVatTu = String(rawId).trim();
        const loaiGD = String(row[colGD["Loai_Giao_Dich"]] || "").trim();
        const soLuong = parseQuantity(row[colGD["So_Luong_Cai"]]); // Hỗ trợ số lượng thập phân (ví dụ: 1.5 cuộn, 2.5m)
        const rawDate = row[colGD["Ngay_Gio"]];
        const parsedDate = parseDateTimeCustom(rawDate);
        const idGiaoDich = colGD["ID_GiaoDich"] !== undefined ? row[colGD["ID_GiaoDich"]] : `GD_${r}`;

        if (idVatTu !== "" && vatTuMap.has(idVatTu) && soLuong > 0 && parsedDate) {
          transactionList.push({
            idGiaoDich: idGiaoDich,
            ngayGio: parsedDate,
            loaiGD: loaiGD,
            idVatTu: idVatTu,
            soLuong: soLuong
          });
        }
      }

      // SẮP XẾP TOÀN BỘ GIAO DỊCH THEO TRÌNH TỰ THỜI GIAN TĂNG DẦN
      transactionList.sort((a, b) => a.ngayGio.getTime() - b.ngayGio.getTime());

      // THỰC THI THUẬT TOÁN FIFO TRÊN TỪNG GIAO DỊCH
      for (const tx of transactionList) {
        const vt = vatTuMap.get(tx.idVatTu);
        const isNhapKho = tx.loaiGD.toLowerCase().includes("nhập");
        const isXuatKho = tx.loaiGD.toLowerCase().includes("xuất");

        if (isNhapKho) {
          // ENQUEUE: Đưa lô nhập mới vào cuối hàng đợi
          vt.queue.push({
            soLuongNhap: tx.soLuong,
            donGiaNhap: vt.donGiaNhap,
            soLuongConLai: tx.soLuong,
            ngayGio: tx.ngayGio
          });
        } else if (isXuatKho) {
          // DEQUEUE & DEDUCT: Khấu trừ theo nguyên tắc lô cũ nhất nhập trước (hỗ trợ số lượng lẻ)
          let canXuat = tx.soLuong;

          while (canXuat > 0.000001 && vt.queue.length > 0) {
            const oldestBatch = vt.queue[0];

            if (oldestBatch.soLuongConLai <= canXuat + 0.000001) {
              canXuat -= oldestBatch.soLuongConLai;
              oldestBatch.soLuongConLai = 0;
              vt.queue.shift(); // Hết hàng trong lô -> pop khỏi queue
            } else {
              oldestBatch.soLuongConLai -= canXuat;
              // Làm tròn 4 chữ số thập phân để chống sai số dấu phẩy động (Floating Point Precision)
              oldestBatch.soLuongConLai = Math.round(oldestBatch.soLuongConLai * 10000) / 10000;
              canXuat = 0;
            }
          }

          if (canXuat > 0.000001) {
            Logger.log(`Cảnh báo: Vật tư ${tx.idVatTu} xuất vượt quá tồn kho thực tế.`);
          }
        }
      }
    }

    // 4. TỔNG HỢP GIÁ TRỊ TỒN KHO & ĐƠN GIÁ BÌNH QUÂN FIFO
    const outputDonGiaFIFO = [];
    const outputGiaTriTon = [];
    const outputSoLuongTon = [];

    for (let i = 0; i < vatTuData.length; i++) {
      const row = vatTuData[i];
      const rawId = row ? row[colVatTu["ID_VatTu"]] : null;
      const idVatTu = (rawId !== null && rawId !== undefined) ? String(rawId).trim() : "";

      if (idVatTu !== "" && vatTuMap.has(idVatTu)) {
        const vt = vatTuMap.get(idVatTu);
        let tongSoLuongTon = 0;
        let tongGiaTriTonKho = 0;

        for (const batch of vt.queue) {
          tongSoLuongTon += batch.soLuongConLai;
          tongGiaTriTonKho += (batch.soLuongConLai * batch.donGiaNhap);
        }

        // Làm tròn số lượng tồn đến 2 chữ số thập phân (nếu là số lẻ)
        tongSoLuongTon = Math.round(tongSoLuongTon * 100) / 100;
        const donGiaBinhQuan = tongSoLuongTon > 0 ? (tongGiaTriTonKho / tongSoLuongTon) : vt.donGiaNhap;

        outputSoLuongTon.push([tongSoLuongTon]);
        outputDonGiaFIFO.push([Math.round(donGiaBinhQuan)]); // Đơn giá VNĐ làm tròn số nguyên
        outputGiaTriTon.push([Math.round(tongGiaTriTonKho)]); // Tổng giá trị VNĐ làm tròn số nguyên
      } else {
        outputSoLuongTon.push([0]);
        outputDonGiaFIFO.push([0]);
        outputGiaTriTon.push([0]);
      }
    }

    // 5. GHI KẾT QUẢ XUỐNG GOOGLE SHEETS BẰNG 1 LẦN BATCH UPDATE
    const rowCount = vatTuData.length;
    sheetVatTu.getRange(CONFIG.DATA_START_ROW_VATTU, colIndex_DonGiaFIFO + 1, rowCount, 1).setValues(outputDonGiaFIFO);
    sheetVatTu.getRange(CONFIG.DATA_START_ROW_VATTU, colIndex_GiaTriTon + 1, rowCount, 1).setValues(outputGiaTriTon);

    const duration = new Date().getTime() - startTime;
    Logger.log(`Đã hoàn tất tính toán FIFO cho ${rowCount} vật tư trong ${duration} ms (Đã giải phóng Lock).`);

    return {
      success: true,
      processedItems: rowCount,
      executionTimeMs: duration,
      timestamp: new Date().toISOString()
    };

  } finally {
    // BỌC AN TOÀN KHI GIẢI PHÓNG KHÓA: Phòng ngừa Lock tự động hết hạn/hủy trước khi kịp release
    try {
      lock.releaseLock();
    } catch (lockError) {
      Logger.log("Lưu ý: Khóa LockService đã tự giải phóng hoặc hết hạn: " + lockError.toString());
    }
  }
}

/**
 * =========================================================================================
 * HÀM CHÍNH 2: WEBHOOK POST TỪ APPSHEET VỚI XÁC THỰC SECRET TOKEN
 * KÊNH KÍCH HOẠT DUY NHẤT (SINGLE TRIGGER SOURCE)
 * =========================================================================================
 */
function doPost(e) {
  try {
    let payload = null;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const currentSecret = getSecretToken();

    // KIỂM TRA XÁC THỰC BẢO MẬT
    if (!payload || String(payload.secret_token).trim() !== String(currentSecret).trim()) {
      Logger.log("CẢNH BÁO: Phát hiện yêu cầu Webhook không hợp lệ hoặc sai Secret Token.");
      return ContentService.createTextOutput(JSON.stringify({
        status: "FORBIDDEN",
        message: "Từ chối truy cập: Mã bí mật Secret Token không hợp lệ!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    Logger.log("Xác thực Webhook thành công với Giao dịch: " + JSON.stringify(payload.ID_GiaoDich));

    // THỰC THI TÍNH TOÁN FIFO CÓ KHÓA ĐỘC QUYỀN
    const result = runFIFOInventoryCalculation();

    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Tính toán FIFO hoàn tất thành công",
      details: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Lỗi xử lý Webhook: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * =========================================================================================
 * HÀM HELPER 1: CHUẨN HÓA NGÀY THÁNG ĐA ĐỊNH DẠNG (PHÂN BIỆT YYYY-MM-DD VS DD/MM/YYYY)
 * =========================================================================================
 */
function parseDateTimeCustom(val) {
  if (!val) return null;
  if (val instanceof Date) return val;

  const str = String(val).trim();
  if (!str) return null;

  // 1. Trường hợp chuỗi bắt đầu bằng 4 chữ số (Chuẩn quốc tế YYYY-MM-DD hoặc ISO 8601)
  const ymdRegex = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/;
  const matchYMD = str.match(ymdRegex);
  if (matchYMD) {
    const year = parseInt(matchYMD[1], 10);
    const month = parseInt(matchYMD[2], 10) - 1; // Month index từ 0 -> 11
    const day = parseInt(matchYMD[3], 10);
    const hours = matchYMD[4] ? parseInt(matchYMD[4], 10) : 0;
    const minutes = matchYMD[5] ? parseInt(matchYMD[5], 10) : 0;
    const seconds = matchYMD[6] ? parseInt(matchYMD[6], 10) : 0;
    return new Date(year, month, day, hours, minutes, seconds);
  }

  // 2. Trường hợp chuỗi bắt đầu bằng 1-2 chữ số (Chuẩn Việt Nam DD/MM/YYYY)
  const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/;
  const matchDMY = str.match(dmyRegex);
  if (matchDMY) {
    const day = parseInt(matchDMY[1], 10);
    const month = parseInt(matchDMY[2], 10) - 1; // Month index từ 0 -> 11
    const year = parseInt(matchDMY[3], 10);
    const hours = matchDMY[4] ? parseInt(matchDMY[4], 10) : 0;
    const minutes = matchDMY[5] ? parseInt(matchDMY[5], 10) : 0;
    const seconds = matchDMY[6] ? parseInt(matchDMY[6], 10) : 0;
    return new Date(year, month, day, hours, minutes, seconds);
  }

  // 3. Fallback: Parse tự nhiên qua đối tượng Date
  const fallbackDate = new Date(str);
  return isNaN(fallbackDate.getTime()) ? new Date(0) : fallbackDate;
}

/**
 * =========================================================================================
 * HÀM HELPER 2: TẠO BẢN ĐỒ HEADER INDEXES (LOẠI BỎ CỘT RỖNG / NULL)
 * =========================================================================================
 */
function mapHeaderIndexes(headers) {
  const map = {};
  if (!headers || !Array.isArray(headers)) return map;

  for (let i = 0; i < headers.length; i++) {
    const cellValue = headers[i];
    // Bỏ qua hoàn toàn các ô tiêu đề rỗng, null hoặc khoảng trắng
    if (cellValue === null || cellValue === undefined || String(cellValue).trim() === "") {
      continue;
    }

    const cleanHeader = String(cellValue).trim();
    map[cleanHeader] = i;

    // Bổ sung xử lý bỏ đuôi Formula
    if (cleanHeader.includes(" (Formula)")) {
      const baseName = cleanHeader.replace(" (Formula)", "").trim();
      if (baseName !== "") {
        map[baseName] = i;
      }
    }
  }
  return map;
}

/**
 * =========================================================================================
 * HÀM HELPER 3: CHUẨN HÓA TIỀN TỆ VNĐ (LÀM TRÒN SỐ NGUYÊN)
 * =========================================================================================
 */
function parseCurrencyVND(val) {
  if (typeof val === "number") return Math.round(val);
  if (val === null || val === undefined) return 0;

  // Tận dụng parseQuantity để lọc sạch tiếng Việt có dấu, ký hiệu tiền tệ & chuẩn hóa định dạng
  const num = parseQuantity(val);
  return Math.round(num);
}

/**
 * =========================================================================================
 * HÀM HELPER 4: CHUẨN HÓA SỐ LƯỢNG VẬT TƯ THÔNG MINH (ENTERPRISE SMART NUMERIC PARSER)
 * - Lọc sạch 100% ký tự Unicode tiếng Việt có dấu (mét, cuộn, hộp, bộ, kiện, đồng...)
 * - Phân biệt chính xác phân cách hàng nghìn vs thập phân cho cả chuẩn US (1,250,000.50)
 *   và chuẩn VN/EU (1.250.000,50 / 1,5 / 1.5)
 * - Chống triệt để lỗi giảm/thổi phồng số lượng: 1,250,000 -> 1.25 hay 1.5 -> 15
 * - Xử lý an toàn chuỗi nhiều dấu chấm/phẩy hoặc gõ nhầm (1.2.5)
 * =========================================================================================
 */
function parseQuantity(val) {
  if (typeof val === "number") return val;
  if (val === null || val === undefined) return 0;

  let str = String(val).trim();
  if (!str) return 0;

  const isNegative = str.startsWith("-");

  // 1. Lọc sạch toàn bộ ký tự ngoài tập số, dấu chấm, dấu phẩy (loại bỏ sạch tiếng Việt có dấu & ký hiệu rác)
  str = str.replace(/[^\d.,]/g, "");
  if (!str) return 0;

  // 2. Xử lý dấu phân cách
  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    if (lastComma > lastDot) {
      // Dạng VN/EU: 1.250.000,50 -> Bỏ dấu chấm hàng nghìn, đổi phẩy thành chấm
      str = str.replace(/\./g, "").replace(/,/g, ".");
    } else {
      // Dạng US: 1,250,000.50 -> Bỏ dấu phẩy hàng nghìn
      str = str.replace(/,/g, "");
    }
  } else if (hasComma) {
    // Chỉ có dấu phẩy: xét số lượng và vị trí dấu phẩy
    const commaCount = (str.match(/,/g) || []).length;
    if (commaCount > 1) {
      // Nhiều dấu phẩy: 1,250,000 -> Phân cách hàng nghìn kiểu US -> Xóa hết phẩy
      str = str.replace(/,/g, "");
    } else {
      // Đúng 1 dấu phẩy:
      const parts = str.split(",");
      if (parts[1].length === 3 && parts[0] !== "0" && parts[0] !== "") {
        // Ví dụ: 1,000 hoặc 25,000 -> Phân cách hàng nghìn kiểu US
        str = str.replace(/,/g, "");
      } else {
        // Ví dụ: 1,5 hoặc 1,25 hoặc 0,500 -> Số thập phân kiểu VN -> Đổi thành dấu chấm
        str = str.replace(",", ".");
      }
    }
  } else if (hasDot) {
    // Chỉ có dấu chấm: xét số lượng và vị trí dấu chấm
    const dotCount = (str.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Nhiều dấu chấm: 1.250.000 -> Phân cách hàng nghìn chuẩn VN -> Xóa hết chấm
      str = str.replace(/\./g, "");
    } else {
      // Đúng 1 dấu chấm:
      const parts = str.split(".");
      if (parts[1].length === 3 && parts[0] !== "0" && parts[0] !== "") {
        // Ví dụ: 1.000 hoặc 25.000 -> Phân cách hàng nghìn chuẩn VN
        str = str.replace(/\./g, "");
      } else {
        // Ví dụ: 1.5 hoặc 1.25 hoặc 0.500 -> Số thập phân chuẩn JS -> Giữ nguyên dấu chấm
      }
    }
  }

  // 3. Đảm bảo chỉ còn tối đa 1 dấu chấm thập phân (phòng ngừa lỗi gõ nhầm dạng 1.2.5)
  const finalDots = (str.match(/\./g) || []).length;
  if (finalDots > 1) {
    const lastDotIdx = str.lastIndexOf(".");
    str = str.substring(0, lastDotIdx).replace(/\./g, "") + "." + str.substring(lastDotIdx + 1);
  }

  if (isNegative) str = "-" + str;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}
