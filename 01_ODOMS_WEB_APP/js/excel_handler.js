// ============================================================================
// BỘ XỬ LÝ NẠP & XUẤT FILE EXCEL (.xlsx / .csv) ĐA KÊNH CHO HỆ THỐNG ODOMS
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\excel_handler.js
// ============================================================================

const ExcelHandler = {
  // Đọc file người dùng chọn từ máy tính (.xlsx, .xls, .csv)
  parseUploadedFile(file, callback) {
    const fileName = file.name.toLowerCase();

    if ((fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) && typeof XLSX !== "undefined") {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          let allRows = [];
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            allRows = allRows.concat(rows);
          });
          callback(null, allRows);
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
  },

  // Bộ đọc CSV nội bộ (hoạt động cả khi không có mạng Internet)
  parseCSVText(csvText) {
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
          inQuotes = !inQuotes;
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

    const headers = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] !== undefined ? cols[idx] : "";
      });
      rows.push(obj);
    }
    return rows;
  },

  // Chuyển mảng đối tượng thành chuỗi CSV có BOM UTF-8 (Mở trực tiếp bằng Microsoft Excel chuẩn tiếng Việt)
  toCSVWithBOM(rows) {
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
  },

  // Tải xuống file Excel (.xlsx nếu có SheetJS, hoặc .csv chuẩn Excel nếu offline)
  downloadDataset(rows, baseFileName, sheetName = "Data") {
    if (typeof XLSX !== "undefined") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${baseFileName}.xlsx`);
    } else {
      const csvContent = this.toCSVWithBOM(rows);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseFileName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },

  // Tải file Excel mẫu chứa 5 Sheet (1 Sheet Gom chung + 4 Sheet từng sàn)
  downloadAllSampleExcelWorkbook() {
    if (typeof XLSX !== "undefined") {
      const wb = XLSX.utils.book_new();

      const unifiedRows = window.UNIFIED_SAMPLE_DATASET.map((r) => {
        const norm = window.omsEngine.normalizeRawOrder(r);
        return {
          "Mã đơn hàng": norm.orderId,
          "Sàn TMĐT": norm.channel,
          "Thời gian đặt hàng": norm.orderTime,
          "Mã SKU": norm.sku,
          "Tên sản phẩm": norm.productName,
          "Số lượng": norm.quantity,
          "Đơn giá": norm.unitPrice,
          "Khách hàng": norm.customerName,
          "Số điện thoại": norm.customerPhone,
          "Địa chỉ nhận hàng": norm.shippingAddress
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unifiedRows), "1_Bang_Gom_Chung_5_Kenh");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(window.SAMPLE_EXCEL_DATASETS.SHOPEE), "2_Mau_Don_Shopee");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(window.SAMPLE_EXCEL_DATASETS.TIKTOK), "3_Mau_Don_TikTokShop");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(window.SAMPLE_EXCEL_DATASETS.LAZADA), "4_Mau_Don_Lazada");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS), "5_Mau_Don_FB_POS");

      XLSX.writeFile(wb, "Bo_Du_Lieu_Don_Hang_Da_Kenh_OMS_Mau.xlsx");
    } else {
      this.downloadDataset(window.UNIFIED_SAMPLE_DATASET, "Bo_Du_Lieu_Don_Hang_Da_Kenh_OMS_Mau");
    }
  },

  // Xuất kết quả Đối chiếu & Phân bổ Tồn kho ra Excel để nộp báo cáo
  exportAllocatedReport() {
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
      "Tiền thu hộ COD (₫)":
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
      this.downloadDataset(orderReportRows, "Bao_Cao_Ket_Qua_Doi_Chieu_Ton_Kho_OMS");
    }
  }
};

window.ExcelHandler = ExcelHandler;
