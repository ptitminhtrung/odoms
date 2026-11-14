// ============================================================================
// BỘ XỬ LÝ NẠP & XUẤT FILE EXCEL (.xlsx / .csv) ĐA KÊNH CHO HỆ THỐNG ODOMS
// Thiết kế chuẩn RDBMS Serverless (Tham chiếu: rdbms-schema-truong-tien-v9.xlsx)
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\excel_handler.js
// ============================================================================

class ExcelHandler {
  // Cấu trúc ánh xạ cột dữ liệu đơn hàng đa kênh và tồn kho (Chuẩn hóa OOP theo DKDT_OOP.md)
  static COLUMN_MAPPING = {
    ORDER_COLUMNS: {
      orderId: ["Mã đơn hàng", "Order ID", "orderNumber", "Ma_Don", "Order_ID", "Mã Đơn", "order_id"],
      channel: ["Sàn TMĐT", "Channel", "channel", "Kenh_Ban", "Kênh bán", "Nguồn đơn", "San_TMDT"],
      orderTime: ["Thời gian đặt hàng", "Created Time", "createTime", "Thoi_Gian_Dat", "Ngày đặt", "Order Time", "timestamp"],
      sku: ["SKU phân loại", "Seller SKU", "sellerSku", "Ma_SKU", "SKU", "Mã SKU", "sku"],
      productName: ["Tên sản phẩm", "Product Name", "itemName", "Ten_SP", "Sản phẩm", "product_name"],
      unit: ["Đơn vị tính", "Unit", "Don_Vi_Tinh", "ĐVT", "unit"],
      quantity: ["Số lượng", "Quantity", "qty", "So_Luong", "SL", "quantity"],
      unitPrice: ["Đơn giá", "Unit Price", "unitPrice", "Don_Gia", "Giá bán", "price"],
      totalAmount: ["Thành tiền (VNĐ)", "Thành tiền (Formula)", "Thành tiền", "Total Amount", "Thanh_Tien"],
      customerName: ["Người Mua", "Recipient", "customerName", "Ten_Khach", "Khách hàng", "customer_name"],
      customerPhone: ["Số điện thoại", "Phone", "customerPhone", "SDT", "SĐT", "phone"],
      shippingAddress: ["Địa chỉ nhận hàng", "Shipping Address", "shippingAddress", "Dia_Chi", "Địa chỉ", "address"],
      platformStatus: ["Trạng thái đơn hàng", "Trạng thái", "Trang_Thai", "Order Status", "order_status", "status"],
      paymentMethod: ["Phương thức thanh toán", "Payment Method", "paymentMethod", "Hinh_Thuc_TT", "Thanh toán"]
    },
    INVENTORY_COLUMNS: {
      sku: "Mã SKU",
      name: "Tên sản phẩm",
      physicalStock: "Tồn Vật Lý (Trong kho)",
      reservedStock: "Tổng Đang Giữ Chỗ",
      availableStock: "Tồn Khả Dụng (Đồng bộ 5 kênh)"
    }
  };

  constructor() {
    this.columnMapping = ExcelHandler.COLUMN_MAPPING;
  }

  // Phương thức chuẩn OOP (Mục II.4 DKDT_OOP.md): Đọc dữ liệu từ file Excel/CSV
  static parseWorkbook(file, callback) {
    return ExcelHandler.parseUploadedFile(file, callback);
  }

  // Kiểm tra một dòng mảng có phải là dòng tiêu đề cột (Header Row) của bảng đơn hàng hay không
  static isOrderHeaderRow(rowArray) {
    if (!Array.isArray(rowArray) || rowArray.length < 3) return false;
    const normalizedCells = rowArray.map((c) => String(c || "").trim().toLowerCase());
    const orderIdCandidates = ExcelHandler.COLUMN_MAPPING.ORDER_COLUMNS.orderId.map((k) => k.toLowerCase());
    const skuCandidates = ExcelHandler.COLUMN_MAPPING.ORDER_COLUMNS.sku.map((k) => k.toLowerCase());
    const hasOrderIdCol = normalizedCells.some((cell) => orderIdCandidates.includes(cell));
    const hasSkuCol = normalizedCells.some((cell) => skuCandidates.includes(cell));
    return hasOrderIdCol && hasSkuCol;
  }

  // Trích xuất các dòng đơn hàng từ ma trận 2 chiều của 1 Sheet (Hỗ trợ cả Header ở Dòng 1 hoặc Dòng 4 chuẩn rdbms-schema-truong-tien-v9)
  static extractOrderRowsFromMatrix(matrix, sheetName = "") {
    const sNameLower = String(sheetName || "").toLowerCase();
    // Bỏ qua các sheet mục lục tổng quan hoặc bảng danh mục tồn kho
    if (
      sNameLower.includes("overview") ||
      sNameLower.includes("tong_quan") ||
      sNameLower.includes("ton_kho") ||
      sNameLower.includes("doi_chieu_ton_kho")
    ) {
      return [];
    }

    if (!Array.isArray(matrix) || matrix.length === 0) return [];

    // Tìm dòng Header thực sự trong 10 dòng đầu tiên (Dòng 1 hoặc Dòng 4 sau Banner tiêu đề)
    let headerRowIdx = -1;
    for (let r = 0; r < Math.min(matrix.length, 10); r++) {
      if (ExcelHandler.isOrderHeaderRow(matrix[r])) {
        headerRowIdx = r;
        break;
      }
    }

    if (headerRowIdx === -1) {
      return [];
    }

    const headers = matrix[headerRowIdx].map((h) => String(h || "").trim());
    const orderIdKeys = ExcelHandler.COLUMN_MAPPING.ORDER_COLUMNS.orderId;
    const rows = [];

    for (let r = headerRowIdx + 1; r < matrix.length; r++) {
      const rowCells = matrix[r];
      if (!Array.isArray(rowCells)) continue;

      const obj = {};
      let nonEmptyCount = 0;
      headers.forEach((h, colIdx) => {
        if (!h) return;
        const val = rowCells[colIdx] !== undefined && rowCells[colIdx] !== null ? rowCells[colIdx] : "";
        if (String(val).trim() !== "") nonEmptyCount++;
        obj[h] = val;
      });

      if (nonEmptyCount === 0) continue;

      // Kiểm tra giá trị cột Mã đơn hàng để loại bỏ dòng tổng cộng / chú thích cuối bảng
      let orderIdVal = "";
      for (const k of orderIdKeys) {
        if (obj[k] !== undefined && String(obj[k]).trim() !== "") {
          orderIdVal = String(obj[k]).trim();
          break;
        }
      }
      if (
        !orderIdVal ||
        orderIdVal.toUpperCase().startsWith("TỔNG") ||
        orderIdVal.toUpperCase().startsWith("TONG") ||
        orderIdVal.toUpperCase().startsWith("TOTAL") ||
        orderIdVal.startsWith("←")
      ) {
        continue;
      }

      rows.push(obj);
    }

    return rows;
  }

  // Trích xuất các dòng đơn hàng từ đối tượng Sheet của SheetJS
  static extractOrderRowsFromSheet(sheet, sheetName = "") {
    if (typeof XLSX === "undefined" || !sheet) return [];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    return ExcelHandler.extractOrderRowsFromMatrix(matrix, sheetName);
  }

  // Bộ đọc dự phòng cho file .xlsx không nén (STORE ZIP) khi chạy hoàn toàn Offline không có CDN SheetJS
  static parseUncompressedXlsxBuffer(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const decoder = new TextDecoder("utf-8");
    const entries = {};
    let offset = 0;

    while (offset + 30 <= bytes.length) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break;
      const compression = view.getUint16(offset + 8, true);
      const compSize = view.getUint32(offset + 18, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const nameBytes = bytes.subarray(offset + 30, offset + 30 + nameLen);
      const fileName = decoder.decode(nameBytes);
      const dataStart = offset + 30 + nameLen + extraLen;
      if (compression === 0 && dataStart + compSize <= bytes.length) {
        entries[fileName] = decoder.decode(bytes.subarray(dataStart, dataStart + compSize));
      }
      offset = dataStart + compSize;
    }

    const allRows = [];
    const seenOrderIds = new Set();
    const orderIdKeys = ExcelHandler.COLUMN_MAPPING.ORDER_COLUMNS.orderId;

    Object.keys(entries)
      .filter((p) => p.startsWith("xl/worksheets/sheet") && p.endsWith(".xml"))
      .forEach((sheetPath) => {
        const xmlText = entries[sheetPath];
        if (typeof DOMParser === "undefined") return;
        const doc = new DOMParser().parseFromString(xmlText, "application/xml");
        const rowNodes = Array.from(doc.getElementsByTagName("row"));
        const matrix = [];

        rowNodes.forEach((rNode) => {
          const rowArr = [];
          const cellNodes = Array.from(rNode.getElementsByTagName("c"));
          cellNodes.forEach((cNode) => {
            const ref = cNode.getAttribute("r") || "A1";
            const colLetters = ref.replace(/[0-9]/g, "");
            let colIdx = 0;
            for (let i = 0; i < colLetters.length; i++) {
              colIdx = colIdx * 26 + (colLetters.charCodeAt(i) - 64);
            }
            colIdx -= 1;

            const tNodes = cNode.getElementsByTagName("t");
            const vNodes = cNode.getElementsByTagName("v");
            let val = "";
            if (tNodes.length > 0) {
              val = tNodes[0].textContent || "";
            } else if (vNodes.length > 0) {
              const rawV = vNodes[0].textContent || "";
              val = isNaN(Number(rawV)) ? rawV : Number(rawV);
            }
            rowArr[colIdx] = val;
          });
          matrix.push(rowArr);
        });

        const sheetRows = ExcelHandler.extractOrderRowsFromMatrix(matrix, sheetPath);
        sheetRows.forEach((rowObj) => {
          let oid = "";
          for (const k of orderIdKeys) {
            if (rowObj[k] !== undefined && String(rowObj[k]).trim() !== "") {
              oid = String(rowObj[k]).trim().toUpperCase();
              break;
            }
          }
          if (oid && seenOrderIds.has(oid)) return;
          if (oid) seenOrderIds.add(oid);
          allRows.push(rowObj);
        });
      });

    return allRows;
  }

  // Đọc file người dùng chọn từ máy tính (.xlsx, .xls, .csv)
  static parseUploadedFile(file, callback) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          if (typeof XLSX !== "undefined") {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            let allRows = [];
            const seenOrderIds = new Set();
            const orderIdKeys = ExcelHandler.COLUMN_MAPPING.ORDER_COLUMNS.orderId;

            workbook.SheetNames.forEach((sheetName) => {
              const sheet = workbook.Sheets[sheetName];
              const sheetRows = ExcelHandler.extractOrderRowsFromSheet(sheet, sheetName);
              sheetRows.forEach((rowObj) => {
                let oid = "";
                for (const k of orderIdKeys) {
                  if (rowObj[k] !== undefined && String(rowObj[k]).trim() !== "") {
                    oid = String(rowObj[k]).trim().toUpperCase();
                    break;
                  }
                }
                // Khử trùng lặp tự động khi file mẫu có cả Sheet gom chung (11 đơn) lẫn 4 Sheet sàn lẻ
                if (oid && seenOrderIds.has(oid)) {
                  return;
                }
                if (oid) {
                  seenOrderIds.add(oid);
                }
                allRows.push(rowObj);
              });
            });
            callback(null, allRows);
          } else {
            const fallbackRows = ExcelHandler.parseUncompressedXlsxBuffer(e.target.result);
            callback(null, fallbackRows);
          }
        } catch (err) {
          callback(err, null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const text = e.target.result;
          const rows = ExcelHandler.parseCSVText(text);
          callback(null, rows);
        } catch (err) {
          callback(err, null);
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  }

  // Bộ đọc CSV nội bộ (hoạt động cả khi không có mạng Internet, hỗ trợ nhận diện dòng Header tự động)
  static parseCSVText(csvText) {
    const cleanText = csvText.replace(/^\uFEFF/, "").trim();
    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) return [];

    const parseLine = (line) => {
      const result = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === "," && !inQuotes) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += ch;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const parsedMatrix = lines.map(parseLine);
    let headerIdx = 0;
    for (let i = 0; i < Math.min(parsedMatrix.length, 10); i++) {
      if (ExcelHandler.isOrderHeaderRow(parsedMatrix[i])) {
        headerIdx = i;
        break;
      }
    }

    const headers = parsedMatrix[headerIdx];
    const orderIdKeys = ExcelHandler.COLUMN_MAPPING.ORDER_COLUMNS.orderId;
    const rows = [];

    for (let i = headerIdx + 1; i < parsedMatrix.length; i++) {
      const cols = parsedMatrix[i];
      // Bỏ qua các dòng trống toàn dấu phẩy (ví dụ: ,,,,,,,,,,,)
      const hasAnyValue = cols.some((c) => String(c || "").trim() !== "");
      if (!hasAnyValue) continue;

      const obj = {};
      headers.forEach((h, idx) => {
        if (!h) return;
        obj[h] = cols[idx] !== undefined ? cols[idx] : "";
      });

      let oid = "";
      for (const k of orderIdKeys) {
        if (obj[k] !== undefined && String(obj[k]).trim() !== "") {
          oid = String(obj[k]).trim();
          break;
        }
      }
      if (!oid || oid.toUpperCase().startsWith("TỔNG") || oid.toUpperCase().startsWith("TOTAL")) {
        continue;
      }

      rows.push(obj);
    }
    return rows;
  }

  // Chuyển mảng đối tượng thành chuỗi CSV có BOM UTF-8 (Mở trực tiếp bằng Microsoft Excel chuẩn tiếng Việt)
  static toCSVWithBOM(rows) {
    if (!rows || rows.length === 0) return "\uFEFF";
    const headers = Object.keys(rows[0]);
    const escapeCell = (val) => {
      const str = val === null || val === undefined ? "" : String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    const headerLine = headers.map(escapeCell).join(",");
    const dataLines = rows.map((r) => headers.map((h) => escapeCell(r[h])).join(","));
    return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  }

  // Tải xuống file dữ liệu đơn lẻ
  static downloadDataset(rows, baseFileName, sheetName = "Data") {
    if (typeof XLSX !== "undefined") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${baseFileName}.xlsx`);
    } else {
      const csvContent = ExcelHandler.toCSVWithBOM(rows);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      ExcelHandler.triggerBlobDownload(blob, `${baseFileName}.csv`);
    }
  }

  static triggerBlobDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // ==========================================================================
  // BỘ KHỞI TẠO FILE EXCEL (.XLSX) ĐỊNH DẠNG CAO CẤP CHUẨN RDBMS SERVERLESS
  // Tham chiếu 100% bảng màu, font chữ & bố cục của rdbms-schema-truong-tien-v9.xlsx
  // ==========================================================================

  static escapeXml(str) {
    return String(str === null || str === undefined ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  static colIndexToLetter(colIdx0) {
    let n = colIdx0 + 1;
    let s = "";
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  // Đóng gói danh sách file XML thành chuẩn ZIP (.xlsx) không nén (Store) — Tương thích 100% Excel & SheetJS
  static buildZipArchiveBlob(filesList) {
    const encoder = new TextEncoder();
    const crcTable = (() => {
      const table = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
      }
      return table;
    })();

    const crc32 = (bytes) => {
      let c = 0xffffffff;
      for (let i = 0; i < bytes.length; i++) {
        c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
      }
      return (c ^ 0xffffffff) >>> 0;
    };

    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const item of filesList) {
      const nameBytes = encoder.encode(item.path);
      const dataBytes = encoder.encode(item.content);
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      // Local File Header (30 bytes + filename)
      const lfh = new Uint8Array(30 + nameBytes.length);
      const lfhView = new DataView(lfh.buffer);
      lfhView.setUint32(0, 0x04034b50, true); // Signature
      lfhView.setUint16(4, 20, true); // Version needed
      lfhView.setUint16(6, 0x0800, true); // UTF-8 flag
      lfhView.setUint16(8, 0, true); // Store (0)
      lfhView.setUint16(10, 0x4800, true); // Mod time
      lfhView.setUint16(12, 0x5d61, true); // Mod date
      lfhView.setUint32(14, crc, true);
      lfhView.setUint32(18, size, true);
      lfhView.setUint32(22, size, true);
      lfhView.setUint16(26, nameBytes.length, true);
      lfhView.setUint16(28, 0, true);
      lfh.set(nameBytes, 30);

      localParts.push(lfh, dataBytes);

      // Central Directory Header (46 bytes + filename)
      const cdh = new Uint8Array(46 + nameBytes.length);
      const cdhView = new DataView(cdh.buffer);
      cdhView.setUint32(0, 0x02014b50, true);
      cdhView.setUint16(4, 20, true);
      cdhView.setUint16(6, 20, true);
      cdhView.setUint16(8, 0x0800, true);
      cdhView.setUint16(10, 0, true);
      cdhView.setUint16(12, 0x4800, true);
      cdhView.setUint16(14, 0x5d61, true);
      cdhView.setUint32(16, crc, true);
      cdhView.setUint32(20, size, true);
      cdhView.setUint32(24, size, true);
      cdhView.setUint16(28, nameBytes.length, true);
      cdhView.setUint16(30, 0, true);
      cdhView.setUint16(32, 0, true);
      cdhView.setUint16(34, 0, true);
      cdhView.setUint16(36, 0, true);
      cdhView.setUint32(38, 0, true);
      cdhView.setUint32(42, offset, true);
      cdh.set(nameBytes, 46);

      centralParts.push(cdh);
      offset += lfh.length + size;
    }

    let centralSize = 0;
    centralParts.forEach((p) => {
      centralSize += p.length;
    });

    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, filesList.length, true);
    eocdView.setUint16(10, filesList.length, true);
    eocdView.setUint32(12, centralSize, true);
    eocdView.setUint32(16, offset, true);
    eocdView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, eocd], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
  }

  // Bảng Style chuẩn của rdbms-schema-truong-tien-v9.xlsx:
  // - XF 0: Mặc định (Calibri 11pt)
  // - XF 1: Tiêu đề lớn Dòng 1 (Times New Roman 16pt, Bold, Navy #1F4E79)
  // - XF 2: Phụ đề Dòng 2 (Times New Roman 11pt, Italic, #333333)
  // - XF 3: Khung mô tả Dòng 4 tại tbl_Overview (Times New Roman 11pt, WrapText, Vertical Center)
  // - XF 4: Tiêu đề Mục (Section Title) 12pt Bold Navy #1F4E79
  // - XF 5: Header Bảng Dòng 4 (Nền Navy #1F4E79, Chữ Trắng 11pt Bold, Căn giữa, Viền Medium/Thin)
  // - XF 6: Khóa chính PK - Căn trái/giữa (Nền Vàng nhạt #FFE699, Times New Roman 11pt Bold, Viền Thin)
  // - XF 7: Khóa chính PK - Text thường (Nền Vàng nhạt #FFE699, Times New Roman 11pt, Viền Thin)
  // - XF 8: Khóa ngoại FK / Sàn / SKU - Căn giữa (Nền Xanh lá nhạt #C6E0B4, Times New Roman 11pt Bold, Viền Thin)
  // - XF 9: Khóa ngoại FK - Căn trái (Nền Xanh lá nhạt #C6E0B4, Times New Roman 11pt, Viền Thin)
  // - XF 10: Dữ liệu Trắng - Căn trái (Nền Trắng, Times New Roman 11pt, Viền Thin, WrapText)
  // - XF 11: Dữ liệu Zebra - Căn trái (Nền Xám xanh #F2F5F8, Times New Roman 11pt, Viền Thin, WrapText)
  // - XF 12: Dữ liệu Trắng - Căn giữa (Nền Trắng, Times New Roman 11pt, Viền Thin)
  // - XF 13: Dữ liệu Zebra - Căn giữa (Nền Xám xanh #F2F5F8, Times New Roman 11pt, Viền Thin)
  // - XF 14: Tiền tệ/Số lượng Trắng - Căn phải (#,##0, Nền Trắng, Times New Roman 11pt, Viền Thin)
  // - XF 15: Tiền tệ/Số lượng Zebra - Căn phải (#,##0, Nền Xám xanh #F2F5F8, Times New Roman 11pt, Viền Thin)
  // - XF 16: Trường Công thức (Formula) - Căn phải (#,##0, Nền Xanh cỏ nhạt #E2EFDA, Times New Roman 11pt Bold, Viền Thin)
  // - XF 17: Trường Công thức (Formula) - Căn giữa (Nền Xanh cỏ nhạt #E2EFDA, Times New Roman 11pt Bold, Viền Thin)
  // - XF 18: Link điều hướng Trắng (Chữ Xanh #0563C1 Bold Underline, Nền Trắng, Viền Thin)
  // - XF 19: Link điều hướng Zebra (Chữ Xanh #0563C1 Bold Underline, Nền #F2F5F8, Viền Thin)
  // - XF 20: Chữ Đậm Trắng - Căn trái (Nền Trắng, Times New Roman 11pt Bold, Viền Thin)
  // - XF 21: Chữ Đậm Zebra - Căn trái (Nền #F2F5F8, Times New Roman 11pt Bold, Viền Thin)
  static buildStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="#,##0"/>
    <numFmt numFmtId="165" formatCode="dd/mm/yyyy hh:mm:ss"/>
  </numFmts>
  <fonts count="8">
    <font><sz val="11"/><color rgb="FF000000"/><name val="Times New Roman"/></font>
    <font><b/><sz val="16"/><color rgb="FF1F4E79"/><name val="Times New Roman"/></font>
    <font><i/><sz val="11"/><color rgb="FF1E293B"/><name val="Times New Roman"/></font>
    <font><b/><sz val="12"/><color rgb="FF1F4E79"/><name val="Times New Roman"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Times New Roman"/></font>
    <font><b/><sz val="11"/><color rgb="FF000000"/><name val="Times New Roman"/></font>
    <font><b/><u/><sz val="11"/><color rgb="FF0563C1"/><name val="Times New Roman"/></font>
    <font><b/><sz val="11"/><color rgb="FF14532D"/><name val="Times New Roman"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="lightGray"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor rgb="FF1F4E79"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFE699"/><bgColor rgb="FFFFE699"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF2F5F8"/><bgColor rgb="FFF2F5F8"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFC6E0B4"/><bgColor rgb="FFC6E0B4"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2EFDA"/><bgColor rgb="FFE2EFDA"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD9D9D9"/></left>
      <right style="thin"><color rgb="FFD9D9D9"/></right>
      <top style="medium"><color rgb="FF1F4E79"/></top>
      <bottom style="medium"><color rgb="FF1F4E79"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FFD9D9D9"/></left>
      <right style="thin"><color rgb="FFD9D9D9"/></right>
      <top style="thin"><color rgb="FFD9D9D9"/></top>
      <bottom style="thin"><color rgb="FFD9D9D9"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="22">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="164" fontId="0" fillId="4" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="164" fontId="7" fillId="6" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="6" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle xfId="0" name="Normal" builtinId="0"/>
  </cellStyles>
  <dxfs count="0"/>
</styleSheet>`;
  }

  // Tạo XML cho một Worksheet từ cấu trúc { cols, rows, hyperlinks }
  static buildWorksheetXml({ cols, rows, hyperlinks = [], showGridLines = false }) {
    const colsXml = cols
      .map((w, idx) => `<col customWidth="1" min="${idx + 1}" max="${idx + 1}" width="${w}"/>`)
      .join("");

    const rowsXml = rows
      .map((rObj) => {
        const htAttr = rObj.ht ? ` ht="${rObj.ht}" customHeight="1"` : "";
        const cellsXml = (rObj.cells || [])
          .map((cell) => {
            if (!cell || cell.skip) return "";
            const ref = `${ExcelHandler.colIndexToLetter(cell.col)}${rObj.r}`;
            const sAttr = cell.s !== undefined ? ` s="${cell.s}"` : "";
            if (cell.f !== undefined) {
              const vTag = cell.v !== undefined ? `<v>${ExcelHandler.escapeXml(cell.v)}</v>` : "";
              return `<c r="${ref}"${sAttr}><f>${ExcelHandler.escapeXml(cell.f)}</f>${vTag}</c>`;
            }
            if (cell.t === "n") {
              return `<c r="${ref}"${sAttr}><v>${Number(cell.v) || 0}</v></c>`;
            }
            const textVal = ExcelHandler.escapeXml(cell.v !== undefined ? cell.v : "");
            return `<c r="${ref}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${textVal}</t></is></c>`;
          })
          .join("");
        return `<row r="${rObj.r}"${htAttr}>${cellsXml}</row>`;
      })
      .join("");

    const hyperlinksXml =
      hyperlinks.length > 0
        ? `<hyperlinks>${hyperlinks
            .map(
              (h) =>
                `<hyperlink ref="${h.ref}" location="${ExcelHandler.escapeXml(h.location)}" display="${ExcelHandler.escapeXml(h.display)}"/>`
            )
            .join("")}</hyperlinks>`
        : "";

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetPr><pageSetUpPr/></sheetPr>
  <sheetViews><sheetView showGridLines="${showGridLines ? 1 : 0}" workbookViewId="0"/></sheetViews>
  <sheetFormatPr customHeight="1" defaultColWidth="14.43" defaultRowHeight="18.0"/>
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${hyperlinksXml}
  <printOptions/>
  <pageMargins bottom="0.75" footer="0.3" header="0.3" left="0.7" right="0.7" top="0.75"/>
  <pageSetup orientation="landscape"/>
</worksheet>`;
  }

  // Xây dựng Sheet 1: tbl_Overview (Trang Tổng quan & Mục lục điều hướng chuẩn rdbms-schema-truong-tien-v9.xlsx)
  static buildOverviewSheetSpec() {
    const cols = [34, 30, 68, 48];
    const rows = [
      {
        r: 1,
        ht: 26,
        cells: [
          {
            col: 0,
            s: 1,
            v: "HỆ THỐNG CƠ SỞ DỮ LIỆU ĐƠN HÀNG ĐA KÊNH THÔNG MINH (ODOMS) - BỘ DỮ LIỆU CHUẨN RDBMS"
          }
        ]
      },
      {
        r: 2,
        ht: 19,
        cells: [
          {
            col: 0,
            s: 2,
            v: "Phiên bản 3.0: Tích hợp Gom đơn 5 Kênh TMĐT (Shopee, TikTok Shop, Lazada, Facebook, POS), Đối chiếu ATP & Phân bổ Lô hàng FEFO"
          }
        ]
      },
      {
        r: 4,
        ht: 66,
        cells: [
          {
            col: 0,
            s: 3,
            v: "Hệ thống cơ sở dữ liệu mẫu ODOMS này được thiết kế đồng bộ theo chuẩn RDBMS Serverless nhằm kiểm thử toàn diện:\n1. Tiếp nhận & Chuẩn hóa đơn hàng đa kênh (Canonical Order Schema) từ 5 nguồn bán hàng trực tuyến và tại quầy POS.\n2. Kiểm tra tính hợp lệ, tính toán Tồn kho khả dụng (ATP = Tồn vật lý - Đang giữ chỗ), ưu tiên giữ hàng FIFO/FEFO và tự động chặn bán lố (Anti-Overselling)."
          }
        ]
      },
      {
        r: 6,
        ht: 22,
        cells: [{ col: 0, s: 4, v: "CHÚ GIẢI KÝ HIỆU & MÀU SẮC THIẾT KẾ" }]
      },
      {
        r: 7,
        ht: 24,
        cells: [
          { col: 0, s: 5, v: "Màu sắc đại diện" },
          { col: 1, s: 5, v: "Phân loại trường dữ liệu" },
          { col: 2, s: 5, v: "Vai trò kỹ thuật trong hệ thống ODOMS" }
        ]
      },
      {
        r: 8,
        ht: 22,
        cells: [
          { col: 0, s: 7, v: "Màu Vàng nhạt (#FFE699)" },
          { col: 1, s: 20, v: "Khóa chính (Primary Key - PK)" },
          {
            col: 2,
            s: 10,
            v: "Chứa giá trị duy nhất định danh cho từng đơn hàng hoặc sản phẩm (Mã đơn hàng, Order ID, orderNumber, Ma_Don, Mã SKU)."
          }
        ]
      },
      {
        r: 9,
        ht: 22,
        cells: [
          { col: 0, s: 9, v: "Màu Xanh lá nhạt (#C6E0B4)" },
          { col: 1, s: 20, v: "Khóa ngoại (Foreign Key - FK / Ref)" },
          {
            col: 2,
            s: 10,
            v: "Cột liên kết Kênh bán hàng (SHOPEE, TIKTOK, LAZADA, POS, FACEBOOK) và ánh xạ Mã SKU về danh mục kho trung tâm."
          }
        ]
      },
      {
        r: 10,
        ht: 22,
        cells: [
          { col: 0, s: 10, v: "Màu Trắng / Xám nhạt (#F2F5F8)" },
          { col: 1, s: 20, v: "Trường Nhập dữ liệu (Input)" },
          {
            col: 2,
            s: 10,
            v: "Thông tin thời gian đặt hàng (đến từng giây phục vụ xếp hàng FIFO), số lượng đặt, đơn giá, khách hàng, SĐT, địa chỉ, trạng thái & thanh toán."
          }
        ]
      },
      {
        r: 11,
        ht: 22,
        cells: [
          { col: 0, s: 17, v: "Màu Xanh cỏ nhạt (#E2EFDA)" },
          { col: 1, s: 20, v: "Trường Ảo / Công thức (Formula / Virtual)" },
          {
            col: 2,
            s: 10,
            v: "Cột tự động tính toán bằng công thức Excel thời gian thực (Thành tiền = Số lượng × Đơn giá, Tồn khả dụng ATP = Tồn vật lý - Giữ chỗ)."
          }
        ]
      },
      {
        r: 14,
        ht: 22,
        cells: [{ col: 0, s: 4, v: "DANH MỤC CÁC BẢNG DỮ LIỆU LIÊN KẾT (TOC)" }]
      },
      {
        r: 15,
        ht: 24,
        cells: [
          { col: 0, s: 5, v: "Bấm để chuyển Sheet" },
          { col: 1, s: 5, v: "Tên bảng cơ sở" },
          { col: 2, s: 5, v: "Vai trò nghiệp vụ trong kiến trúc ODOMS" },
          { col: 3, s: 5, v: "Mối quan hệ liên kết & Quy mô dữ liệu" }
        ]
      }
    ];

    const tocEntries = [
      {
        sheet: "1_Bang_Gom_Chung_5_Kenh",
        desc: "Bảng tổng hợp toàn bộ 11 đơn hàng từ 5 kênh đã chuẩn hóa về Canonical Order Schema.",
        rel: "Hợp nhất từ 5 kênh (Shopee, TikTok, Lazada, POS, FB) — Đủ 14 trường thông số"
      },
      {
        sheet: "2_Mau_Don_Shopee",
        desc: "Bảng dữ liệu đơn hàng xuất nguyên bản từ Shopee Seller Centre (3 đơn hàng mẫu).",
        rel: "Liên kết kênh SHOPEE & đối chiếu tồn kho mã SP-AO-POLO-01, SP-TAI-NGHE-02, SP-BAN-PHIM-05"
      },
      {
        sheet: "3_Mau_Don_TikTokShop",
        desc: "Bảng dữ liệu đơn hàng xuất nguyên bản từ TikTok Shop Seller Center (Header tiếng Anh).",
        rel: "Liên kết kênh TIKTOK & kiểm thử tự động ánh xạ tên cột tiếng Anh sang chuẩn nội bộ"
      },
      {
        sheet: "4_Mau_Don_Lazada",
        desc: "Bảng dữ liệu đơn hàng xuất nguyên bản từ Lazada Seller Center (Header camelCase).",
        rel: "Liên kết kênh LAZADA & kiểm thử kịch bản Chặn bán lố (Anti-Overselling) đơn LZ261022201"
      },
      {
        sheet: "5_Mau_Don_FB_POS",
        desc: "Bảng dữ liệu đơn hàng từ Facebook Livestream/Fanpage và Cửa hàng vật lý POS.",
        rel: "Bao gồm đơn ưu tiên tại quầy POS (POS261022301) và đơn lỗi SKU / Đã hủy (FB261022402)"
      },
      {
        sheet: "6_Danh_Muc_Ton_Kho_FEFO",
        desc: "Danh mục 5 mã SKU sản phẩm, tồn kho vật lý (59 SP), tồn khả dụng ATP và danh sách Lô hàng FEFO.",
        rel: "Bảng Cha (Master Data) cung cấp tồn kho gốc và hạn sử dụng lô hàng cho Bước 3 & Bước 4"
      }
    ];

    const hyperlinks = [];
    tocEntries.forEach((item, idx) => {
      const rowNum = 16 + idx;
      const isZebra = idx % 2 === 1;
      const linkText = `Go to ${item.sheet} →`;
      rows.push({
        r: rowNum,
        ht: 21,
        cells: [
          { col: 0, s: isZebra ? 19 : 18, v: linkText },
          { col: 1, s: isZebra ? 21 : 20, v: item.sheet },
          { col: 2, s: isZebra ? 11 : 10, v: item.desc },
          { col: 3, s: isZebra ? 11 : 10, v: item.rel }
        ]
      });
      hyperlinks.push({
        ref: `A${rowNum}`,
        location: `'${item.sheet}'!A1`,
        display: linkText
      });
    });

    return ExcelHandler.buildWorksheetXml({ cols, rows, hyperlinks, showGridLines: false });
  }

  // Xây dựng Sheet Đơn hàng chuẩn hóa hoặc theo từng sàn (Header ở Dòng 4, Dữ liệu từ Dòng 5 giống rdbms-schema-truong-tien-v9.xlsx)
  static buildOrderSheetSpec({ title, subtitle, columnsSpec, dataRows }) {
    const cols = columnsSpec.map((c) => c.width || 18);
    const lastColIdx = columnsSpec.length - 1;
    const backLinkCol = Math.min(lastColIdx, 12);
    const backLinkRef = `${ExcelHandler.colIndexToLetter(backLinkCol)}2`;

    const rows = [
      {
        r: 1,
        ht: 25,
        cells: [{ col: 0, s: 1, v: title }]
      },
      {
        r: 2,
        ht: 19,
        cells: [
          { col: 0, s: 2, v: subtitle },
          { col: backLinkCol, s: 18, v: "← Quay về tbl_Overview" }
        ]
      },
      {
        r: 4,
        ht: 25,
        cells: columnsSpec.map((colDef, cIdx) => ({
          col: cIdx,
          s: 5,
          v: colDef.header
        }))
      }
    ];

    const hyperlinks = [
      {
        ref: backLinkRef,
        location: "tbl_Overview!A1",
        display: "← Quay về tbl_Overview"
      }
    ];

    dataRows.forEach((record, rIdx) => {
      const excelRowNum = 5 + rIdx;
      const isZebra = rIdx % 2 === 1;

      const cells = columnsSpec.map((colDef, cIdx) => {
        if (colDef.type === "formula_total") {
          const qtyColLetter = ExcelHandler.colIndexToLetter(colDef.qtyColIdx);
          const priceColLetter = ExcelHandler.colIndexToLetter(colDef.priceColIdx);
          const qtyVal = Number(record[columnsSpec[colDef.qtyColIdx].key]) || 0;
          const priceVal = Number(record[columnsSpec[colDef.priceColIdx].key]) || 0;
          return {
            col: cIdx,
            s: 16,
            f: `${qtyColLetter}${excelRowNum}*${priceColLetter}${excelRowNum}`,
            v: qtyVal * priceVal
          };
        }

        const rawVal = record[colDef.key] !== undefined ? record[colDef.key] : "";

        if (colDef.role === "pk") {
          return { col: cIdx, s: 6, v: rawVal };
        }
        if (colDef.role === "fk_center") {
          return { col: cIdx, s: 8, v: rawVal };
        }
        if (colDef.role === "fk_left") {
          return { col: cIdx, s: 9, v: rawVal };
        }
        if (colDef.type === "number") {
          return {
            col: cIdx,
            s: isZebra ? 13 : 12,
            t: "n",
            v: Number(rawVal) || 0
          };
        }
        if (colDef.type === "currency") {
          return {
            col: cIdx,
            s: isZebra ? 15 : 14,
            t: "n",
            v: Number(rawVal) || 0
          };
        }
        if (colDef.align === "center") {
          return { col: cIdx, s: isZebra ? 13 : 12, v: rawVal };
        }
        return { col: cIdx, s: isZebra ? 11 : 10, v: rawVal };
      });

      rows.push({
        r: excelRowNum,
        ht: 21,
        cells
      });
    });

    return ExcelHandler.buildWorksheetXml({ cols, rows, hyperlinks, showGridLines: false });
  }

  // Xây dựng Sheet 6: Danh mục Tồn kho Khả dụng (ATP) & Lô hàng FEFO (Tham chiếu tbl_VatTu & tbl_QuanLyThung)
  static buildInventoryFefoSheetSpec() {
    const cols = [18, 42, 16, 14, 16, 16, 22, 16, 24, 34];
    const rows = [
      {
        r: 1,
        ht: 25,
        cells: [
          {
            col: 0,
            s: 1,
            v: "BẢNG DỮ LIỆU: 6_DANH_MUC_TON_KHO_FEFO - DANH MỤC SẢN PHẨM (SKU), TỒN KHO KHẢ DỤNG ATP & LÔ HÀNG FEFO"
          }
        ]
      },
      {
        r: 2,
        ht: 19,
        cells: [
          {
            col: 0,
            s: 2,
            v: "Bảng Cha (Master Data) lưu trữ cấu hình tồn kho gốc (59 SP vật lý) và danh sách Lô hàng xuất theo nguyên tắc Hết hạn trước - Xuất trước (FEFO)."
          },
          { col: 9, s: 18, v: "← Quay về tbl_Overview" }
        ]
      },
      {
        r: 4,
        ht: 25,
        cells: [
          { col: 0, s: 5, v: "Mã SKU (PK)" },
          { col: 1, s: 5, v: "Tên sản phẩm thương mại" },
          { col: 2, s: 5, v: "Danh mục" },
          { col: 3, s: 5, v: "Đơn vị tính" },
          { col: 4, s: 5, v: "Tồn Vật Lý" },
          { col: 5, s: 5, v: "Đang Giữ Chỗ" },
          { col: 6, s: 5, v: "Tồn Khả Dụng ATP (Formula)" },
          { col: 7, s: 5, v: "Đơn Giá Bán (VND)" },
          { col: 8, s: 5, v: "Giá Trị Tồn Kho (Formula)" },
          { col: 9, s: 5, v: "Danh sách Lô FEFO & Mã QR Định danh" }
        ]
      }
    ];

    const invList = window.INITIAL_INVENTORY || [];
    invList.forEach((item, idx) => {
      const rNum = 5 + idx;
      const isZebra = idx % 2 === 1;
      const batchSummary = (item.batches || [])
        .map((b) => `${b.batchCode} (QR: ${b.qrCode} | HSD: ${b.expiryDate} | SL: ${b.initialQty})`)
        .join("; ");

      rows.push({
        r: rNum,
        ht: 22,
        cells: [
          { col: 0, s: 6, v: item.sku },
          { col: 1, s: isZebra ? 21 : 20, v: item.name },
          { col: 2, s: isZebra ? 13 : 12, v: item.category },
          { col: 3, s: isZebra ? 13 : 12, v: item.unit },
          { col: 4, s: isZebra ? 13 : 12, t: "n", v: item.physicalStock },
          { col: 5, s: isZebra ? 13 : 12, t: "n", v: item.reservedStock },
          {
            col: 6,
            s: 17,
            f: `E${rNum}-F${rNum}`,
            v: item.physicalStock - item.reservedStock
          },
          { col: 7, s: isZebra ? 15 : 14, t: "n", v: item.price },
          {
            col: 8,
            s: 16,
            f: `E${rNum}*H${rNum}`,
            v: item.physicalStock * item.price
          },
          { col: 9, s: 9, v: batchSummary }
        ]
      });
    });

    const hyperlinks = [
      {
        ref: "J2",
        location: "tbl_Overview!A1",
        display: "← Quay về tbl_Overview"
      }
    ];

    return ExcelHandler.buildWorksheetXml({ cols, rows, hyperlinks, showGridLines: false });
  }

  // Tạo trọn bộ Workbook OOXML (.xlsx) có đầy đủ định dạng như rdbms-schema-truong-tien-v9.xlsx
  static createStyledWorkbookBlob(sheetsConfig) {
    const files = [];

    // 1. [Content_Types].xml
    const sheetOverrides = sheetsConfig
      .map(
        (_, i) =>
          `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
      )
      .join("");

    files.push({
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetOverrides}
</Types>`
    });

    // 2. _rels/.rels
    files.push({
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    });

    // 3. xl/workbook.xml
    const sheetsTags = sheetsConfig
      .map(
        (s, i) =>
          `<sheet state="visible" name="${ExcelHandler.escapeXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 2}"/>`
      )
      .join("");

    files.push({
      path: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr/>
  <sheets>${sheetsTags}</sheets>
  <definedNames/>
  <calcPr fullCalcOnLoad="1"/>
</workbook>`
    });

    // 4. xl/_rels/workbook.xml.rels
    const sheetRels = sheetsConfig
      .map(
        (_, i) =>
          `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
      )
      .join("");

    files.push({
      path: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  ${sheetRels}
</Relationships>`
    });

    // 5. xl/styles.xml
    files.push({
      path: "xl/styles.xml",
      content: ExcelHandler.buildStylesXml()
    });

    // 6. xl/worksheets/sheet1..N.xml
    sheetsConfig.forEach((s, i) => {
      files.push({
        path: `xl/worksheets/sheet${i + 1}.xml`,
        content: s.xml
      });
    });

    return ExcelHandler.buildZipArchiveBlob(files);
  }

  // Tải file Excel mẫu Bo_Du_Lieu_Don_Hang_Da_Kenh_OMS_Mau.xlsx (Đầy đủ thông số & định dạng chuẩn rdbms-schema-truong-tien-v9.xlsx)
  static downloadAllSampleExcelWorkbook() {
    const unitMap = {};
    (window.INITIAL_INVENTORY || []).forEach((item) => {
      unitMap[item.sku] = item.unit || "Cái";
    });

    const statusLabelMap = {
      CONFIRMED: "Đã xác nhận",
      UNCONFIRMED: "Chưa xác nhận",
      CANCELLED: "Đã hủy đơn"
    };

    // Chuẩn hóa đầy đủ 11 đơn hàng cho Sheet 1 (1_Bang_Gom_Chung_5_Kenh) - Không thiếu bất kỳ trường nào
    const unifiedRows = (window.UNIFIED_SAMPLE_DATASET || []).map((r) => {
      const norm = window.omsEngine.normalizeRawOrder(r);
      return {
        "Mã đơn hàng": norm.orderId,
        "Sàn TMĐT": norm.channel,
        "Thời gian đặt hàng": norm.orderTime,
        "SKU phân loại": norm.sku,
        "Tên sản phẩm": norm.productName,
        "Đơn vị tính": unitMap[norm.sku] || "Cái",
        "Số lượng": norm.quantity,
        "Đơn giá": norm.unitPrice,
        "Người Mua": norm.customerName,
        "Số điện thoại": norm.customerPhone,
        "Địa chỉ nhận hàng": norm.shippingAddress,
        "Trạng thái đơn hàng": statusLabelMap[norm.platformStatus] || "Đã xác nhận",
        "Phương thức thanh toán": norm.paymentMethod
      };
    });

    const unifiedColumns = [
      { header: "Mã đơn hàng", key: "Mã đơn hàng", width: 17, role: "pk" },
      { header: "Sàn TMĐT", key: "Sàn TMĐT", width: 14, role: "fk_center" },
      { header: "Thời gian đặt hàng", key: "Thời gian đặt hàng", width: 21, align: "center" },
      { header: "SKU phân loại", key: "SKU phân loại", width: 18, role: "fk_center" },
      { header: "Tên sản phẩm", key: "Tên sản phẩm", width: 40 },
      { header: "Đơn vị tính", key: "Đơn vị tính", width: 13, align: "center" },
      { header: "Số lượng", key: "Số lượng", width: 12, type: "number" },
      { header: "Đơn giá", key: "Đơn giá", width: 15, type: "currency" },
      { header: "Thành tiền (Formula)", type: "formula_total", qtyColIdx: 6, priceColIdx: 7, width: 20 },
      { header: "Người Mua", key: "Người Mua", width: 28 },
      { header: "Số điện thoại", key: "Số điện thoại", width: 15, align: "center" },
      { header: "Địa chỉ nhận hàng", key: "Địa chỉ nhận hàng", width: 46 },
      { header: "Trạng thái đơn hàng", key: "Trạng thái đơn hàng", width: 19, align: "center" },
      { header: "Phương thức thanh toán", key: "Phương thức thanh toán", width: 28 }
    ];

    const shopeeColumns = [
      { header: "Mã đơn hàng", key: "Mã đơn hàng", width: 17, role: "pk" },
      { header: "Sàn TMĐT", key: "Sàn TMĐT", width: 14, role: "fk_center" },
      { header: "Thời gian đặt hàng", key: "Thời gian đặt hàng", width: 21, align: "center" },
      { header: "SKU phân loại", key: "SKU phân loại", width: 18, role: "fk_center" },
      { header: "Tên sản phẩm", key: "Tên sản phẩm", width: 40 },
      { header: "Số lượng", key: "Số lượng", width: 12, type: "number" },
      { header: "Đơn giá", key: "Đơn giá", width: 15, type: "currency" },
      { header: "Thành tiền (Formula)", type: "formula_total", qtyColIdx: 5, priceColIdx: 6, width: 20 },
      { header: "Người Mua", key: "Người Mua", width: 24 },
      { header: "Số điện thoại", key: "Số điện thoại", width: 15, align: "center" },
      { header: "Địa chỉ nhận hàng", key: "Địa chỉ nhận hàng", width: 44 },
      { header: "Trạng thái đơn hàng", key: "Trạng thái đơn hàng", width: 19, align: "center" },
      { header: "Phương thức thanh toán", key: "Phương thức thanh toán", width: 28 }
    ];

    const tiktokColumns = [
      { header: "Order ID", key: "Order ID", width: 17, role: "pk" },
      { header: "Channel", key: "Channel", width: 14, role: "fk_center" },
      { header: "Created Time", key: "Created Time", width: 21, align: "center" },
      { header: "Seller SKU", key: "Seller SKU", width: 18, role: "fk_center" },
      { header: "Product Name", key: "Product Name", width: 40 },
      { header: "Quantity", key: "Quantity", width: 12, type: "number" },
      { header: "Unit Price", key: "Unit Price", width: 15, type: "currency" },
      { header: "Total Amount (Formula)", type: "formula_total", qtyColIdx: 5, priceColIdx: 6, width: 21 },
      { header: "Recipient", key: "Recipient", width: 24 },
      { header: "Phone", key: "Phone", width: 15, align: "center" },
      { header: "Shipping Address", key: "Shipping Address", width: 44 },
      { header: "Order Status", key: "Order Status", width: 19, align: "center" },
      { header: "Payment Method", key: "Payment Method", width: 28 }
    ];

    const lazadaColumns = [
      { header: "orderNumber", key: "orderNumber", width: 17, role: "pk" },
      { header: "channel", key: "channel", width: 14, role: "fk_center" },
      { header: "createTime", key: "createTime", width: 21, align: "center" },
      { header: "sellerSku", key: "sellerSku", width: 18, role: "fk_center" },
      { header: "itemName", key: "itemName", width: 40 },
      { header: "qty", key: "qty", width: 12, type: "number" },
      { header: "unitPrice", key: "unitPrice", width: 15, type: "currency" },
      { header: "totalAmount (Formula)", type: "formula_total", qtyColIdx: 5, priceColIdx: 6, width: 21 },
      { header: "customerName", key: "customerName", width: 24 },
      { header: "customerPhone", key: "customerPhone", width: 15, align: "center" },
      { header: "shippingAddress", key: "shippingAddress", width: 44 },
      { header: "order_status", key: "order_status", width: 19, align: "center" },
      { header: "paymentMethod", key: "paymentMethod", width: 28 }
    ];

    const fbPosColumns = [
      { header: "Ma_Don", key: "Ma_Don", width: 17, role: "pk" },
      { header: "Kenh_Ban", key: "Kenh_Ban", width: 14, role: "fk_center" },
      { header: "Thoi_Gian_Dat", key: "Thoi_Gian_Dat", width: 21, align: "center" },
      { header: "Ma_SKU", key: "Ma_SKU", width: 18, role: "fk_center" },
      { header: "Ten_SP", key: "Ten_SP", width: 42 },
      { header: "So_Luong", key: "So_Luong", width: 12, type: "number" },
      { header: "Don_Gia", key: "Don_Gia", width: 15, type: "currency" },
      { header: "Thanh_Tien (Formula)", type: "formula_total", qtyColIdx: 5, priceColIdx: 6, width: 20 },
      { header: "Ten_Khach", key: "Ten_Khach", width: 32 },
      { header: "SDT", key: "SDT", width: 15, align: "center" },
      { header: "Dia_Chi", key: "Dia_Chi", width: 48 },
      { header: "Trang_Thai", key: "Trang_Thai", width: 19, align: "center" },
      { header: "Hinh_Thuc_TT", key: "Hinh_Thuc_TT", width: 26 }
    ];

    const sheetsConfig = [
      {
        name: "tbl_Overview",
        xml: ExcelHandler.buildOverviewSheetSpec()
      },
      {
        name: "1_Bang_Gom_Chung_5_Kenh",
        xml: ExcelHandler.buildOrderSheetSpec({
          title: "BẢNG DỮ LIỆU: 1_BANG_GOM_CHUNG_5_KENH - BẢNG GOM ĐƠN HÀNG ĐA KÊNH TỔNG HỢP (11 ĐƠN)",
          subtitle:
            "Tổng hợp toàn bộ 11 đơn hàng từ 5 kênh (Shopee, TikTok Shop, Lazada, POS, Facebook) đã chuẩn hóa đầy đủ 14 trường thông số Canonical Schema.",
          columnsSpec: unifiedColumns,
          dataRows: unifiedRows
        })
      },
      {
        name: "2_Mau_Don_Shopee",
        xml: ExcelHandler.buildOrderSheetSpec({
          title: "BẢNG DỮ LIỆU: 2_MAU_DON_SHOPEE - ĐƠN HÀNG XUẤT TỪ SHOPEE SELLER CENTRE",
          subtitle:
            "Dữ liệu đơn hàng xuất nguyên bản từ sàn Shopee Mall (3 đơn hàng). Cột Thành tiền tự động nhân Số lượng × Đơn giá.",
          columnsSpec: shopeeColumns,
          dataRows: window.SAMPLE_EXCEL_DATASETS.SHOPEE || []
        })
      },
      {
        name: "3_Mau_Don_TikTokShop",
        xml: ExcelHandler.buildOrderSheetSpec({
          title: "BẢNG DỮ LIỆU: 3_MAU_DON_TIKTOKSHOP - ĐƠN HÀNG XUẤT TỪ TIKTOK SHOP SELLER CENTER",
          subtitle:
            "Dữ liệu đơn hàng xuất nguyên bản từ TikTok Shop (Header tiếng Anh chuẩn của sàn). Bộ đọc ODOMS tự động ánh xạ về Canonical Schema.",
          columnsSpec: tiktokColumns,
          dataRows: window.SAMPLE_EXCEL_DATASETS.TIKTOK || []
        })
      },
      {
        name: "4_Mau_Don_Lazada",
        xml: ExcelHandler.buildOrderSheetSpec({
          title: "BẢNG DỮ LIỆU: 4_MAU_DON_LAZADA - ĐƠN HÀNG XUẤT TỪ LAZADA SELLER CENTER",
          subtitle:
            "Dữ liệu đơn hàng xuất nguyên bản từ Lazada Mall (Header camelCase). Minh họa kịch bản đơn LZ261022201 đặt trễ bị chặn bán lố (Anti-Overselling).",
          columnsSpec: lazadaColumns,
          dataRows: window.SAMPLE_EXCEL_DATASETS.LAZADA || []
        })
      },
      {
        name: "5_Mau_Don_FB_POS",
        xml: ExcelHandler.buildOrderSheetSpec({
          title: "BẢNG DỮ LIỆU: 5_MAU_DON_FB_POS - ĐƠN HÀNG TỪ FACEBOOK LIVESTREAM & CỬA HÀNG POS",
          subtitle:
            "Bao gồm đơn mua trực tiếp tại quầy POS Phường Bình Phú (POS261022301) và đơn lỗi mã SKU / Đã hủy (FB261022402) để kiểm thử Validation Engine.",
          columnsSpec: fbPosColumns,
          dataRows: window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS || []
        })
      },
      {
        name: "6_Danh_Muc_Ton_Kho_FEFO",
        xml: ExcelHandler.buildInventoryFefoSheetSpec()
      }
    ];

    const blob = ExcelHandler.createStyledWorkbookBlob(sheetsConfig);
    ExcelHandler.triggerBlobDownload(blob, "Bo_Du_Lieu_Don_Hang_Da_Kenh_OMS_Mau.xlsx");
  }

  // Phương thức xuất báo cáo theo đúng ngữ cảnh tab hiện tại trên giao diện
  static exportContextReport() {
    const activeTab = window.AppUI && window.AppUI.currentMenuTab;
    if (activeTab === "ingest") {
      return ExcelHandler.exportOrdersStatusReport();
    }
    return ExcelHandler.exportAllocatedReport();
  }

  // Phương thức chuẩn OOP (Mục II.4 DKDT_OOP.md): Xuất báo cáo tổng hợp ra file Excel
  static exportReportToExcel() {
    return ExcelHandler.exportContextReport();
  }

  // Xuất tình trạng Bảng Điều Phối Đơn Hàng Đa Kênh ra Excel (dành riêng cho tab Tiếp nhận / Gom đơn)
  static exportOrdersStatusReport() {
    const engine = window.omsEngine;
    const channelsCfg = window.CHANNELS_CONFIG || {};
    const rows = (engine.orders || []).map((o) => {
      const channelName = (channelsCfg[o.channel] && channelsCfg[o.channel].shortName) || o.channel || "";
      let holdStatusText = "Đang kiểm tra";
      if (o.status === "ALLOCATED") holdStatusText = "Đã giữ hàng";
      else if (o.status === "BACKORDER") holdStatusText = "Thiếu hàng (Cần nhập thêm)";
      else if (o.status === "PENDING") holdStatusText = "Chờ xác nhận";
      else if (o.status === "CANCELLED") holdStatusText = "Đã hủy đơn";
      else if (o.status === "INVALID") holdStatusText = "Đơn lỗi thông tin";

      const platformStatusText =
        o.platformStatus === "CONFIRMED"
          ? "Đã xác nhận"
          : o.platformStatus === "UNCONFIRMED"
          ? "Chờ xác nhận"
          : "Đã hủy";

      const sourceText =
        String(o.sourceMethod || "").indexOf("NhanTuSanTMDT") === 0 || o.sourceMethod === "WEBHOOK_API"
          ? "Tiếp nhận trực tiếp"
          : "File Excel";

      const isCod =
        (o.paymentMethod || "").toUpperCase().includes("COD") ||
        (o.paymentMethod || "").toLowerCase().includes("thu hộ");

      return {
        "Thứ tự ưu tiên": o.fifoRank ? `#${o.fifoRank}` : "-",
        "Mã đơn hàng": o.orderId,
        "Kênh bán": channelName,
        "Thời gian đặt": o.orderTime,
        "Hình thức nhận đơn": sourceText,
        "Sản phẩm": o.productName,
        "Mã SKU": o.sku,
        "Số lượng": o.quantity,
        "Tình trạng giữ hàng": holdStatusText,
        "Trạng thái đơn": platformStatusText,
        "Thanh toán": o.paymentMethod || "COD (Thanh toán khi nhận hàng)",
        "Tiền thu hộ COD (VND)": isCod ? (o.quantity || 0) * (o.unitPrice || 0) : 0,
        "Khách hàng": o.customerName || "",
        "Số điện thoại": o.customerPhone || "",
        "Địa chỉ nhận hàng": o.customerAddress || ""
      };
    });

    ExcelHandler.downloadDataset(
      rows,
      "Bao_Cao_Tinh_Trang_Dieu_Phoi_Don_Hang_Da_Kenh",
      "Bang_Dieu_Phoi_Don_Hang"
    );
  }

  // Xuất kết quả Đối chiếu & Phân bổ Tồn kho ra Excel để nộp báo cáo (dành cho tab Kho)
  static exportAllocatedReport() {
    const engine = window.omsEngine;
    const orderReportRows = engine.orders.map((o) => ({
      "Thứ tự ưu tiên FIFO": o.fifoRank ? `FIFO #${o.fifoRank}` : "N/A",
      "Mã đơn hàng": o.orderId,
      "Kênh bán (Sàn)": o.channel,
      "Thời gian đặt hàng": o.orderTime,
      "Nguồn tiếp nhận": o.sourceMethod === "WEBHOOK_API" ? "API 2 chiều" : "File Excel",
      "Mã SKU": o.sku,
      "Tên sản phẩm": o.productName,
      "Số lượng đặt": o.quantity,
      "Tồn trước khi trừ": o.stockSnapshot ? o.stockSnapshot.before : "-",
      "Tồn sau khi trừ": o.stockSnapshot ? o.stockSnapshot.after : "-",
      "Trạng thái Xử lý (Sàn)":
        o.platformStatus === "CONFIRMED"
          ? "Đã xác nhận"
          : o.platformStatus === "UNCONFIRMED"
          ? "Chưa xác nhận"
          : "Đã hủy đơn",
      "Phương thức thanh toán": o.paymentMethod || "COD (Thanh toán khi nhận hàng)",
      "Tiền thu hộ COD (VND)":
        (o.paymentMethod || "").toUpperCase().includes("COD") || (o.paymentMethod || "").toLowerCase().includes("thu hộ")
          ? (o.quantity || 0) * (o.unitPrice || 0)
          : 0,
      "Khách hàng": o.customerName,
      "SĐT": o.customerPhone
    }));

    const inventoryReportRows = engine.inventory.map((inv) => ({
      "Mã SKU": inv.sku,
      "Tên sản phẩm": inv.name,
      "Tồn Vật Lý (Trong kho)": inv.physicalStock,
      "Tổng Đang Giữ Chỗ": inv.reservedStock,
      "Tồn Khả Dụng (Đồng bộ 5 kênh)": inv.availableStock,
      "Giữ cho Shopee": inv.channelReserved.SHOPEE || 0,
      "Giữ cho TikTok Shop": inv.channelReserved.TIKTOK || 0,
      "Giữ cho Lazada": inv.channelReserved.LAZADA || 0,
      "Giữ cho Facebook": inv.channelReserved.FACEBOOK || 0,
      "Giữ cho POS": inv.channelReserved.POS || 0
    }));

    if (typeof XLSX !== "undefined") {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderReportRows), "Ket_Qua_Phan_Bo_Don_Hang");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inventoryReportRows), "Doi_Chieu_Ton_Kho_Da_Kenh");
      XLSX.writeFile(wb, "Bao_Cao_Ket_Qua_Doi_Chieu_Ton_Kho_OMS.xlsx");
    } else {
      ExcelHandler.downloadDataset(orderReportRows, "Bao_Cao_Ket_Qua_Doi_Chieu_Ton_Kho_OMS");
    }
  }

  // Hỗ trợ gọi qua instance (nếu khởi tạo bằng từ khóa new ExcelHandler())
  parseWorkbook(file, callback) {
    return ExcelHandler.parseWorkbook(file, callback);
  }

  exportReportToExcel() {
    return ExcelHandler.exportReportToExcel();
  }
}

window.ExcelHandler = ExcelHandler;
window.excelHandler = new ExcelHandler();
