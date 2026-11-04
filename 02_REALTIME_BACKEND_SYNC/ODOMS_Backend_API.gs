/**
 * =========================================================================================
 * DỰ ÁN: HỆ THỐNG QUẢN LÝ ĐƠN HÀNG ĐA KÊNH THÔNG MINH (ODOMS)
 * TỆP TIN: S:\HTTT\02_REALTIME_BACKEND_SYNC\ODOMS_Backend_API.gs
 * MÔ TẢ:
 *   Backend Serverless trên Google Apps Script kết nối Cơ sở dữ liệu Google Sheets (5 bảng chuẩn PascalCase)
 *   kế thừa kiến trúc khóa tương tranh LockService & bộ Parser từ FIFO_Engine.gs.
 *   1. Tự động khởi tạo & chuyển đổi 5 Sheet chuẩn Tiếng Việt không dấu (PascalCase):
 *      - DatHang (18 cột)
 *      - TonKho (15 cột)
 *      - LuuKho (8 cột)
 *      - NhanSu (14 cột)
 *      - NhatKy (7 cột)
 *   2. Cổng doGet(e): Trả toàn bộ trạng thái 5 bảng dưới dạng JSON chuẩn cho Web App ODOMS & AppSheet.
 *   3. Cổng doPost(e): Nhận đồng bộ 2 chiều từ Web App (CloudSyncAdapter) và Webhook Postman
 *      với cơ chế khóa độc quyền LockService.getScriptLock() chống xung đột cho <= 10 người dùng.
 * =========================================================================================
 */

const ODOMS_CONFIG = {
  SHEETS: {
    ORDERS: "DatHang",
    INVENTORY: "TonKho",
    BATCHES: "LuuKho",
    USERS: "NhanSu",
    LOGS: "NhatKy"
  },
  LEGACY_SHEET_MAP: {
    Orders: "DatHang",
    Inventory_ATP: "TonKho",
    Batches: "LuuKho",
    Users_RBAC: "NhanSu",
    AuditLogs: "NhatKy"
  },
  HEADERS: {
    DatHang: [
      "MaDonGoc",
      "SanTMDT",
      "ThoiGianDat",
      "MaSanPhamSKU",
      "TenSanPham",
      "SoLuong",
      "DonGia",
      "KhachHang",
      "SoDienThoai",
      "DiaChiGiao",
      "TrangThaiSan",
      "PhuongThucThanhToan",
      "NguonTiepNhan",
      "TrangThaiDieuPhoi",
      "ThuTuGiuHang",
      "PhanBoLoHang",
      "MaVanDon",
      "ThoiGianCapNhat"
    ],
    TonKho: [
      "MaSanPhamSKU",
      "TenSanPham",
      "NhomHang",
      "DonViTinh",
      "DonGia",
      "SucChuaToiDa",
      "TonKho",
      "KhachDat",
      "CoTheBan",
      "GiuChoShopee",
      "GiuChoTikTok",
      "GiuChoLazada",
      "GiuChoFacebook",
      "GiuChoPOS",
      "ThoiGianCapNhat"
    ],
    LuuKho: [
      "MaLoHang",
      "MaQR",
      "MaSanPhamSKU",
      "NgayNhapKho",
      "HanSuDung",
      "SoLuongBanDau",
      "SoLuongConLai",
      "ThoiGianCapNhat"
    ],
    NhanSu: [
      "MaNhanSu",
      "TenDangNhap",
      "MatKhau",
      "HoVaTen",
      "KyHieuAvatar",
      "VaiTro",
      "PhongBan",
      "CaLamViec",
      "TrangThaiTaiKhoan",
      "QuyenQuanTriGoc",
      "TaiKhoanDuPhongAn",
      "TamNgungDen",
      "LyDoTamNgung",
      "ThoiGianCapNhat"
    ],
    NhatKy: [
      "MaNhatKy",
      "ThoiGianThucHien",
      "TenDangNhap",
      "HoVaTen",
      "NoiDungThaoTac",
      "DiaChiIP",
      "KetQua"
    ]
  },
  LOCK_TIMEOUT_MS: 30000,
  DEFAULT_SECRET_TOKEN: "ODOMS_SECURE_TOKEN_2026"
};

/**
 * =========================================================================================
 * 1. KHỞI TẠO & CHUYỂN ĐỔI CƠ SỞ DỮ LIỆU 5 BẢNG CHUẨN PASCALCASE TRÊN GOOGLE SHEETS
 * =========================================================================================
 */
function migrateLegacySheets(ss) {
  const legacyMap = ODOMS_CONFIG.LEGACY_SHEET_MAP;
  Object.keys(legacyMap).forEach(function (oldName) {
    const newName = legacyMap[oldName];
    const oldSheet = ss.getSheetByName(oldName);
    const newSheet = ss.getSheetByName(newName);
    if (oldSheet && !newSheet) {
      oldSheet.setName(newName);
    }
  });
}

function applySheetHeaderRow(sheet, headers) {
  if (!sheet || !headers || headers.length === 0) return;
  const maxCols = Math.max(sheet.getLastColumn(), headers.length);
  if (maxCols > headers.length) {
    sheet.getRange(1, headers.length + 1, Math.max(1, sheet.getLastRow()), maxCols - headers.length).clearContent();
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0A2947");
  headerRange.setFontColor("#F3E4C9");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function setupODOMSDatabase() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SECRET_TOKEN")) {
    props.setProperty("SECRET_TOKEN", ODOMS_CONFIG.DEFAULT_SECRET_TOKEN);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  migrateLegacySheets(ss);

  const sheetNames = Object.values(ODOMS_CONFIG.SHEETS);
  sheetNames.forEach(function (sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = ODOMS_CONFIG.HEADERS[sheetName];
    applySheetHeaderRow(sheet, headers);
  });

  seedDefaultDataIfEmpty(ss);

  return {
    status: "SUCCESS",
    message: "Đã khởi tạo hoàn tất 5 bảng chuẩn PascalCase ODOMS (DatHang, TonKho, LuuKho, NhanSu, NhatKy).",
    sheets: sheetNames,
    timestamp: formatNowVN()
  };
}

function ensureSheetsInitialized() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  migrateLegacySheets(ss);

  const missingOrLegacyHeader = Object.values(ODOMS_CONFIG.SHEETS).some(function (name) {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() === 0) return true;
    const expectedFirstCol = ODOMS_CONFIG.HEADERS[name][0];
    const actualFirstCol = String(sh.getRange(1, 1).getValue() || "").trim();
    return actualFirstCol !== expectedFirstCol;
  });

  if (missingOrLegacyHeader) {
    setupODOMSDatabase();
  }
  return ss;
}

function seedDefaultDataIfEmpty(ss) {
  const nowStr = formatNowVN();

  // 1. Seed TonKho & LuuKho nếu đang trống
  const invSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.INVENTORY);
  const batchSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.BATCHES);
  if (invSheet && invSheet.getLastRow() <= 1) {
    const defaultInvRows = [
      ["SP-AO-POLO-01", "Áo Polo Nam Coolmate Pro (Đen - Size L)", "Thời trang", "Cái", 250000, 25, 10, 0, 10, 0, 0, 0, 0, 0, nowStr],
      ["SP-TAI-NGHE-02", "Tai nghe Bluetooth Không dây TWS ANC Pro", "Phụ kiện số", "Hộp", 490000, 30, 15, 0, 15, 0, 0, 0, 0, 0, nowStr],
      ["SP-BALO-LAP-03", "Balo Laptop Chống Nước 15.6 inch Urban", "Túi & Balo", "Chiếc", 380000, 20, 8, 0, 8, 0, 0, 0, 0, 0, nowStr],
      ["SP-BINH-NHIET-04", "Bình Giữ Nhiệt Inox 304 Lock&Lock 900ml", "Gia dụng", "Bình", 310000, 40, 20, 0, 20, 0, 0, 0, 0, 0, nowStr],
      ["SP-BAN-PHIM-05", "Bàn Phím Cơ Không Dây RGB K68 Hotswap", "Phụ kiện số", "Bộ", 650000, 20, 6, 0, 6, 0, 0, 0, 0, 0, nowStr]
    ];
    invSheet.getRange(2, 1, defaultInvRows.length, defaultInvRows[0].length).setValues(defaultInvRows);
  }

  if (batchSheet && batchSheet.getLastRow() <= 1) {
    const defaultBatchRows = [
      ["LO-2026-A1", "OD-POLO-1001", "SP-AO-POLO-01", "2026-10-01", "2027-10-01", 6, 6, nowStr],
      ["LO-2026-A2", "OD-POLO-1010", "SP-AO-POLO-01", "2026-10-10", "2027-10-10", 4, 4, nowStr],
      ["LO-2026-B1", "OD-TWS-1003", "SP-TAI-NGHE-02", "2026-10-03", "2028-04-03", 10, 10, nowStr],
      ["LO-2026-B2", "OD-TWS-1012", "SP-TAI-NGHE-02", "2026-10-12", "2028-04-12", 5, 5, nowStr],
      ["LO-2026-C1", "OD-BALO-1005", "SP-BALO-LAP-03", "2026-10-05", "2028-10-05", 5, 5, nowStr],
      ["LO-2026-C2", "OD-BALO-1015", "SP-BALO-LAP-03", "2026-10-15", "2028-10-15", 3, 3, nowStr],
      ["LO-2026-D1", "OD-BINH-1002", "SP-BINH-NHIET-04", "2026-10-02", "2029-10-02", 20, 20, nowStr],
      ["LO-2026-E1", "OD-KEYB-1008", "SP-BAN-PHIM-05", "2026-10-08", "2028-10-08", 6, 6, nowStr]
    ];
    batchSheet.getRange(2, 1, defaultBatchRows.length, defaultBatchRows[0].length).setValues(defaultBatchRows);
  }

  // 2. Seed NhanSu nếu đang trống
  const userSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.USERS);
  if (userSheet && userSheet.getLastRow() <= 1) {
    const defaultUsers = [
      ["USR-001", "dttd", "dttd123", "Đỗ Thị Thuỳ Dung", "TD", "Chuyên viên Vận hành", "Phòng Vận hành Đa kênh", "Ca Hành chính (08:00 - 17:00)", "ACTIVE", true, false, "", "", "2026-10-01 08:00:00"],
      ["USR-002", "lhmt", "lhmt123", "Lê Hoàng Minh Trung", "MT", "Chuyên viên Vận hành (Dự phòng)", "Phòng Vận hành Đa kênh", "Toàn thời gian (Cứu hộ hệ thống)", "ACTIVE", true, true, "", "", "2026-10-05 09:15:00"],
      ["USR-003", "ntqg", "ntqg123", "Nguyễn Thị Quỳnh Giao", "QG", "Chuyên viên Điều phối", "Phòng Điều phối Đơn hàng", "Ca Sáng (07:30 - 16:30)", "ACTIVE", false, false, "", "", "2026-10-10 08:30:00"],
      ["USR-004", "nttn", "nttn123", "Nguyễn Thị Thúy Ngân", "TN", "Quản lý kho", "Bộ phận Kho Vận", "Ca Chiều (13:00 - 21:00)", "ACTIVE", false, false, "", "", "2026-10-12 13:00:00"]
    ];
    userSheet.getRange(2, 1, defaultUsers.length, defaultUsers[0].length).setValues(defaultUsers);
  }

  // 3. Seed NhatKy (7 cột, không có VaiTro) nếu đang trống
  const logSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.LOGS);
  if (logSheet && logSheet.getLastRow() <= 1) {
    const defaultLogs = [
      ["LOG-INIT-1", nowStr, "dttd", "Đỗ Thị Thuỳ Dung", "Khởi tạo cơ sở dữ liệu 5 bảng chuẩn PascalCase trên Google Sheets", "Google Cloud Apps Script", "SUCCESS"]
    ];
    logSheet.getRange(2, 1, defaultLogs.length, defaultLogs[0].length).setValues(defaultLogs);
  }
}

/**
 * =========================================================================================
 * 2. CỔNG ĐỌC DỮ LIỆU THỜI GIAN THỰC: doGet(e)
 * =========================================================================================
 */
function doGet(e) {
  try {
    const ss = ensureSheetsInitialized();
    const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).toUpperCase() : "PULL_ALL";

    if (action === "PING") {
      return jsonResponse({
        status: "SUCCESS",
        service: "ODOMS_Backend_API",
        message: "Kết nối Google Apps Script ODOMS hoạt động ổn định!",
        serverTime: formatNowVN()
      });
    }

    const state = readAllSheetsState(ss);
    return jsonResponse({
      status: "SUCCESS",
      action: action,
      serverTime: formatNowVN(),
      data: state
    });
  } catch (err) {
    return jsonResponse({
      status: "ERROR",
      message: "Lỗi doGet ODOMS: " + err.toString()
    });
  }
}

/**
 * =========================================================================================
 * 3. CỔNG GHI & ĐỒNG BỘ DỮ LIỆU CÓ KHÓA TƯƠNG TRANH: doPost(e)
 * =========================================================================================
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(ODOMS_CONFIG.LOCK_TIMEOUT_MS);

  if (!hasLock) {
    return jsonResponse({
      status: "BUSY",
      message: "Hệ thống đang xử lý đồng bộ từ người dùng khác (LockService Timeout). Vui lòng thử lại sau giây lát."
    });
  }

  try {
    const ss = ensureSheetsInitialized();
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = String(payload.action || "SYNC_ALL").toUpperCase();

    if (action === "SETUP_DB") {
      const setupRes = setupODOMSDatabase();
      return jsonResponse(setupRes);
    }

    if (action === "SYNC_ALL" || action === "PUSH_STATE") {
      const syncResult = writeFullStateToSheets(ss, payload);
      return jsonResponse({
        status: "SUCCESS",
        action: action,
        message: "Đã đồng bộ trạng thái ODOMS lên 5 bảng Google Sheets (DatHang, TonKho, LuuKho, NhanSu, NhatKy) thành công!",
        details: syncResult,
        serverTime: formatNowVN()
      });
    }

    if (action === "SYNC_USERS") {
      if (Array.isArray(payload.users)) {
        writeUsersSheet(ss, payload.users);
      }
      if (Array.isArray(payload.auditLogs)) {
        writeAuditLogsSheet(ss, payload.auditLogs);
      }
      return jsonResponse({
        status: "SUCCESS",
        action: "SYNC_USERS",
        message: "Đã đồng bộ bảng NhanSu và NhatKy lên Google Sheets.",
        serverTime: formatNowVN()
      });
    }

    if (action === "WEBHOOK_ORDER" || action === "INGEST_ORDERS") {
      const currentState = readAllSheetsState(ss);
      const incomingOrders = Array.isArray(payload.orders)
        ? payload.orders
        : payload.order
        ? [payload.order]
        : [payload];

      let added = 0;
      incomingOrders.forEach(function (ord) {
        const orderId = String(ord.orderId || ord.MaDonGoc || ord.original_sn || ord["Mã đơn hàng"] || ("OD-" + Date.now())).trim();
        const exists = currentState.orders.some(function (o) {
          return String(o.orderId) === orderId;
        });
        if (!exists) {
          currentState.orders.push({
            orderId: orderId,
            channel: String(ord.channel || ord.SanTMDT || ord.channel_id || ord["Sàn TMĐT"] || "SHOPEE").toUpperCase(),
            orderTime: ord.orderTime || ord.ThoiGianDat || formatNowVN(),
            sku: String(ord.sku || ord.MaSanPhamSKU || ord.internal_sku || ord["SKU phân loại"] || "SP-AO-POLO-01").toUpperCase(),
            productName: ord.productName || ord.TenSanPham || ord["Tên sản phẩm"] || "",
            quantity: parseQuantity(ord.quantity || ord.SoLuong || ord.order_qty || ord["Số lượng"] || 1),
            unitPrice: parseCurrencyVND(ord.unitPrice || ord.DonGia || ord["Đơn giá"] || 250000),
            customerName: ord.customerName || ord.KhachHang || ord["Người Mua"] || "Khách đặt qua Webhook",
            customerPhone: ord.customerPhone || ord.SoDienThoai || ord["Số điện thoại"] || "N/A",
            shippingAddress: ord.shippingAddress || ord.DiaChiGiao || ord.delivery_city || ord["Địa chỉ nhận hàng"] || "TP.HCM",
            platformStatus: ord.platformStatus || ord.TrangThaiSan || "CONFIRMED",
            paymentMethod: ord.paymentMethod || ord.PhuongThucThanhToan || "COD",
            sourceMethod: "WEBHOOK_API",
            status: ord.status || ord.TrangThaiDieuPhoi || "ALLOCATED",
            fifoRank: ord.fifoRank || ord.ThuTuGiuHang || "",
            allocatedBatches: ord.allocatedBatches || [],
            trackingCode: ord.trackingCode || ord.MaVanDon || ""
          });
          added++;
        }
      });

      writeOrdersSheet(ss, currentState.orders);
      return jsonResponse({
        status: "SUCCESS",
        action: action,
        addedCount: added,
        totalOrders: currentState.orders.length,
        serverTime: formatNowVN()
      });
    }

    return jsonResponse({
      status: "SUCCESS",
      action: action,
      message: "Đã tiếp nhận yêu cầu doPost thành công.",
      serverTime: formatNowVN()
    });
  } catch (error) {
    return jsonResponse({
      status: "ERROR",
      message: "Lỗi xử lý doPost ODOMS: " + error.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (lockErr) {
      Logger.log("Lock đã giải phóng: " + lockErr.toString());
    }
  }
}

/**
 * =========================================================================================
 * 4. CÁC HÀM ĐỌC / GHI 5 BẢNG TRÊN GOOGLE SHEETS (HỖ TRỢ TƯƠNG THÍCH 2 CHIỀU PASCALCASE)
 * =========================================================================================
 */
function pickVal(row, keys, defaultVal) {
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      return row[k];
    }
  }
  return defaultVal !== undefined ? defaultVal : "";
}

function formatSourceMethodForSheet(sourceMethod, channel) {
  const src = String(sourceMethod || "").trim();
  const chUpper = String(channel || "SHOPEE").trim().toUpperCase();
  const channelNameMap = {
    SHOPEE: "Shopee",
    TIKTOK: "TikTok",
    LAZADA: "Lazada",
    FACEBOOK: "Facebook",
    POS: "POS"
  };
  const chLabel = channelNameMap[chUpper] || chUpper || "Shopee";

  if (src === "WEBHOOK_API" || src.indexOf("NhanTuSanTMDT") === 0) {
    return "NhanTuSanTMDT_" + chLabel;
  }
  return "NhapTuFileExcel";
}

function parseSourceMethodFromSheet(rawVal) {
  const s = String(rawVal || "").trim();
  if (s === "WEBHOOK_API" || s.indexOf("NhanTuSanTMDT") === 0) {
    return "WEBHOOK_API";
  }
  return "EXCEL_IMPORT";
}

function formatAllocatedBatchesForSheet(batches) {
  if (!Array.isArray(batches) || batches.length === 0) {
    return "ChuaPhanBo";
  }
  return batches
    .map(function (b) {
      const code = String(b.batchCode || b.MaLoHang || "LO").trim();
      const qty = parseQuantity(b.takenQty !== undefined ? b.takenQty : b.quantity);
      return code + " (" + qty + " SP)";
    })
    .join(" + ");
}

function parseAllocatedBatchesFromSheet(rawVal) {
  const s = String(rawVal || "").trim();
  if (!s || s === "ChuaPhanBo") return [];

  if (s.charAt(0) === "[") {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return s
    .split("+")
    .map(function (part) {
      const trimmed = part.trim();
      const m = trimmed.match(/^([A-Za-z0-9\-_]+)\s*\((\d+)/);
      if (m) {
        return {
          batchCode: m[1],
          qrCode: m[1],
          takenQty: parseInt(m[2], 10) || 1
        };
      }
      return null;
    })
    .filter(function (item) {
      return item !== null;
    });
}

function readAllSheetsState(ss) {
  const ordersRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.ORDERS);
  const invRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.INVENTORY);
  const batchesRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.BATCHES);
  const usersRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.USERS);
  const logsRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.LOGS);

  const inventory = invRaw.map(function (row) {
    const skuCode = String(pickVal(row, ["MaSanPhamSKU", "sku"], "")).trim();
    const skuBatches = batchesRaw
      .filter(function (b) {
        return String(pickVal(b, ["MaSanPhamSKU", "sku"], "")).trim() === skuCode;
      })
      .map(function (b) {
        const bCode = String(pickVal(b, ["MaLoHang", "batchCode"], ""));
        return {
          batchCode: bCode,
          qrCode: String(pickVal(b, ["MaQR", "qrCode"], bCode)),
          importDate: String(pickVal(b, ["NgayNhapKho", "importDate"], "")),
          expiryDate: String(pickVal(b, ["HanSuDung", "expiryDate"], "")),
          initialQty: parseQuantity(pickVal(b, ["SoLuongBanDau", "initialQty"], 0)),
          remainingQty: parseQuantity(pickVal(b, ["SoLuongConLai", "remainingQty"], 0))
        };
      });

    return {
      sku: skuCode,
      name: String(pickVal(row, ["TenSanPham", "name"], "")),
      category: String(pickVal(row, ["NhomHang", "category"], "")),
      unit: String(pickVal(row, ["DonViTinh", "unit"], "Cái")),
      price: parseCurrencyVND(pickVal(row, ["DonGia", "price"], 0)),
      maxCapacity: parseQuantity(pickVal(row, ["SucChuaToiDa", "maxCapacity"], 25)) || 25,
      physicalStock: parseQuantity(pickVal(row, ["TonKho", "physicalStock"], 0)),
      reservedStock: parseQuantity(pickVal(row, ["KhachDat", "reservedStock"], 0)),
      availableStock: parseQuantity(pickVal(row, ["CoTheBan", "availableStock"], 0)),
      channelReserved: {
        SHOPEE: parseQuantity(pickVal(row, ["GiuChoShopee", "holdShopee"], 0)),
        TIKTOK: parseQuantity(pickVal(row, ["GiuChoTikTok", "holdTikTok"], 0)),
        LAZADA: parseQuantity(pickVal(row, ["GiuChoLazada", "holdLazada"], 0)),
        FACEBOOK: parseQuantity(pickVal(row, ["GiuChoFacebook", "holdFacebook"], 0)),
        POS: parseQuantity(pickVal(row, ["GiuChoPOS", "holdPOS"], 0))
      },
      batches: skuBatches
    };
  });

  const orders = ordersRaw.map(function (r) {
    const rawBatchesVal = pickVal(r, ["PhanBoLoHang", "allocatedBatchesJson"], "");
    const rawSourceVal = pickVal(r, ["NguonTiepNhan", "sourceMethod"], "NhapTuFileExcel");
    const rankVal = pickVal(r, ["ThuTuGiuHang", "fifoRank"], "");

    return {
      orderId: String(pickVal(r, ["MaDonGoc", "orderId"], "")),
      channel: String(pickVal(r, ["SanTMDT", "channel"], "SHOPEE")),
      orderTime: String(pickVal(r, ["ThoiGianDat", "orderTime"], "")),
      sku: String(pickVal(r, ["MaSanPhamSKU", "sku"], "")),
      productName: String(pickVal(r, ["TenSanPham", "productName"], "")),
      quantity: parseQuantity(pickVal(r, ["SoLuong", "quantity"], 0)),
      unitPrice: parseCurrencyVND(pickVal(r, ["DonGia", "unitPrice"], 0)),
      customerName: String(pickVal(r, ["KhachHang", "customerName"], "")),
      customerPhone: String(pickVal(r, ["SoDienThoai", "customerPhone"], "")),
      shippingAddress: String(pickVal(r, ["DiaChiGiao", "shippingAddress"], "")),
      platformStatus: String(pickVal(r, ["TrangThaiSan", "platformStatus"], "CONFIRMED")),
      paymentMethod: String(pickVal(r, ["PhuongThucThanhToan", "paymentMethod"], "COD")),
      sourceMethod: parseSourceMethodFromSheet(rawSourceVal),
      status: String(pickVal(r, ["TrangThaiDieuPhoi", "status"], "PENDING")),
      fifoRank: rankVal !== "" && rankVal !== null ? Number(rankVal) : null,
      allocatedBatches: parseAllocatedBatchesFromSheet(rawBatchesVal),
      trackingCode: String(pickVal(r, ["MaVanDon", "trackingCode"], ""))
    };
  });

  const users = usersRaw.map(function (u) {
    const isRootRaw = pickVal(u, ["QuyenQuanTriGoc", "isRoot"], false);
    const isHiddenRaw = pickVal(u, ["TaiKhoanDuPhongAn", "isHiddenBackup"], false);
    return {
      id: String(pickVal(u, ["MaNhanSu", "id"], "")),
      username: String(pickVal(u, ["TenDangNhap", "username"], "")),
      password: String(pickVal(u, ["MatKhau", "password"], "")),
      fullName: String(pickVal(u, ["HoVaTen", "fullName"], "")),
      avatar: String(pickVal(u, ["KyHieuAvatar", "avatar"], "US")),
      role: String(pickVal(u, ["VaiTro", "role"], "Chuyên viên Điều phối")),
      department: String(pickVal(u, ["PhongBan", "department"], "Phòng Vận hành Đa kênh")),
      shift: String(pickVal(u, ["CaLamViec", "shift"], "Ca Hành chính (08:00 - 17:00)")),
      status: String(pickVal(u, ["TrangThaiTaiKhoan", "status"], "ACTIVE")),
      isRoot: isRootRaw === true || String(isRootRaw).toLowerCase() === "true",
      isHiddenBackup: isHiddenRaw === true || String(isHiddenRaw).toLowerCase() === "true",
      suspendUntil: String(pickVal(u, ["TamNgungDen", "suspendUntil"], "")),
      suspendReason: String(pickVal(u, ["LyDoTamNgung", "suspendReason"], "")),
      createdAt: String(pickVal(u, ["ThoiGianCapNhat", "createdAt"], ""))
    };
  });

  const auditLogs = logsRaw.map(function (l) {
    return {
      id: String(pickVal(l, ["MaNhatKy", "id"], "")),
      time: String(pickVal(l, ["ThoiGianThucHien", "time"], "")),
      username: String(pickVal(l, ["TenDangNhap", "username"], "system")),
      fullName: String(pickVal(l, ["HoVaTen", "fullName"], "Hệ thống")),
      role: "Quản trị viên OMS",
      action: String(pickVal(l, ["NoiDungThaoTac", "action"], "")),
      ip: String(pickVal(l, ["DiaChiIP", "ip"], "ODOMS Cloud Sync")),
      status: String(pickVal(l, ["KetQua", "status"], "SUCCESS"))
    };
  });

  return {
    orders: orders,
    inventory: inventory,
    users: users,
    auditLogs: auditLogs
  };
}

function writeFullStateToSheets(ss, payload) {
  const counts = {
    orders: 0,
    inventory: 0,
    batches: 0,
    users: 0,
    auditLogs: 0
  };

  if (Array.isArray(payload.orders)) {
    counts.orders = writeOrdersSheet(ss, payload.orders);
  }
  if (Array.isArray(payload.inventory)) {
    const invRes = writeInventoryAndBatchesSheets(ss, payload.inventory);
    counts.inventory = invRes.inventoryCount;
    counts.batches = invRes.batchCount;
  }
  if (Array.isArray(payload.users)) {
    counts.users = writeUsersSheet(ss, payload.users);
  }
  if (Array.isArray(payload.auditLogs)) {
    counts.auditLogs = writeAuditLogsSheet(ss, payload.auditLogs);
  }

  return counts;
}

function writeOrdersSheet(ss, orders) {
  const sheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.ORDERS);
  const headers = ODOMS_CONFIG.HEADERS.DatHang;
  clearSheetDataRows(sheet, headers);

  if (!orders || orders.length === 0) return 0;
  const nowStr = formatNowVN();
  const rows = orders.map(function (o) {
    const ch = o.channel || "SHOPEE";
    return [
      o.orderId || "",
      ch,
      o.orderTime || "",
      o.sku || "",
      o.productName || "",
      Number(o.quantity || 0),
      Number(o.unitPrice || 0),
      o.customerName || "",
      o.customerPhone || "",
      o.shippingAddress || "",
      o.platformStatus || "CONFIRMED",
      o.paymentMethod || "COD",
      formatSourceMethodForSheet(o.sourceMethod, ch),
      o.status || "PENDING",
      o.fifoRank !== null && o.fifoRank !== undefined ? o.fifoRank : "",
      formatAllocatedBatchesForSheet(o.allocatedBatches),
      o.trackingCode || "",
      nowStr
    ];
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return rows.length;
}

function writeInventoryAndBatchesSheets(ss, inventory) {
  const invSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.INVENTORY);
  const batchSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.BATCHES);
  const invHeaders = ODOMS_CONFIG.HEADERS.TonKho;
  const batchHeaders = ODOMS_CONFIG.HEADERS.LuuKho;

  clearSheetDataRows(invSheet, invHeaders);
  clearSheetDataRows(batchSheet, batchHeaders);

  const nowStr = formatNowVN();
  const invRows = [];
  const batchRows = [];

  (inventory || []).forEach(function (item) {
    const ch = item.channelReserved || {};
    invRows.push([
      item.sku || "",
      item.name || "",
      item.category || "",
      item.unit || "Cái",
      Number(item.price || 0),
      Number(item.maxCapacity || 25),
      Number(item.physicalStock || 0),
      Number(item.reservedStock || 0),
      Number(item.availableStock || 0),
      Number(ch.SHOPEE || 0),
      Number(ch.TIKTOK || 0),
      Number(ch.LAZADA || 0),
      Number(ch.FACEBOOK || 0),
      Number(ch.POS || 0),
      nowStr
    ]);

    (item.batches || []).forEach(function (b) {
      batchRows.push([
        b.batchCode || "",
        b.qrCode || b.batchCode || "",
        item.sku || "",
        b.importDate || "",
        b.expiryDate || "",
        Number(b.initialQty || 0),
        Number(b.remainingQty || 0),
        nowStr
      ]);
    });
  });

  if (invRows.length > 0) {
    invSheet.getRange(2, 1, invRows.length, invHeaders.length).setValues(invRows);
  }
  if (batchRows.length > 0) {
    batchSheet.getRange(2, 1, batchRows.length, batchHeaders.length).setValues(batchRows);
  }

  return {
    inventoryCount: invRows.length,
    batchCount: batchRows.length
  };
}

function writeUsersSheet(ss, users) {
  const sheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.USERS);
  const headers = ODOMS_CONFIG.HEADERS.NhanSu;
  clearSheetDataRows(sheet, headers);

  if (!users || users.length === 0) return 0;
  const rows = users.map(function (u) {
    return [
      u.id || "",
      u.username || "",
      u.password || "",
      u.fullName || "",
      u.avatar || "US",
      u.role || "",
      u.department || "",
      u.shift || "",
      u.status || "ACTIVE",
      Boolean(u.isRoot),
      Boolean(u.isHiddenBackup),
      u.suspendUntil || "",
      u.suspendReason || "",
      u.createdAt || formatNowVN()
    ];
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return rows.length;
}

function writeAuditLogsSheet(ss, logs) {
  const sheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.LOGS);
  const headers = ODOMS_CONFIG.HEADERS.NhatKy;
  clearSheetDataRows(sheet, headers);

  if (!logs || logs.length === 0) return 0;
  const limited = logs.slice(0, 100);
  const rows = limited.map(function (l) {
    return [
      l.id || ("LOG-" + Date.now()),
      l.time || formatNowVN(),
      l.username || "system",
      l.fullName || "Hệ thống",
      l.action || l.message || "",
      l.ip || "ODOMS Cloud Sync",
      l.status || "SUCCESS"
    ];
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return rows.length;
}

function readSheetObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const result = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (!row || row.every(function (cell) { return cell === "" || cell === null; })) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = String(headers[c] || "").trim();
      if (key) {
        let cellVal = row[c];
        if (cellVal instanceof Date && !isNaN(cellVal.getTime())) {
          const pad = function (n) { return String(n).padStart(2, "0"); };
          cellVal =
            pad(cellVal.getDate()) + "/" +
            pad(cellVal.getMonth() + 1) + "/" +
            cellVal.getFullYear() + " " +
            pad(cellVal.getHours()) + ":" +
            pad(cellVal.getMinutes()) + ":" +
            pad(cellVal.getSeconds());
        }
        obj[key] = cellVal;
      }
    }
    result.push(obj);
  }
  return result;
}

function clearSheetDataRows(sheet, headers) {
  if (!sheet) return;
  applySheetHeaderRow(sheet, headers);
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), headers ? headers.length : 1);
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
}

/**
 * =========================================================================================
 * 5. CÁC HÀM TIỆN ÍCH & PARSER KẾ THỪA TỪ FIFO_Engine.gs
 * =========================================================================================
 */
function formatNowVN() {
  const d = new Date();
  const pad = function (n) {
    return String(n).padStart(2, "0");
  };
  return (
    pad(d.getDate()) +
    "/" +
    pad(d.getMonth() + 1) +
    "/" +
    d.getFullYear() +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds())
  );
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function parseCurrencyVND(val) {
  if (typeof val === "number") return Math.round(val);
  if (val === null || val === undefined) return 0;
  return Math.round(parseQuantity(val));
}

function parseQuantity(val) {
  if (typeof val === "number") return val;
  if (val === null || val === undefined) return 0;
  let str = String(val).trim();
  if (!str) return 0;
  const isNegative = str.startsWith("-");
  str = str.replace(/[^\d.,]/g, "");
  if (!str) return 0;
  str = str.replace(/,/g, "");
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
}
