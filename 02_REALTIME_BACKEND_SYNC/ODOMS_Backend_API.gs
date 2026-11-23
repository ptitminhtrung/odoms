/**
 * =========================================================================================
 * DỰ ÁN: HỆ THỐNG QUẢN LÝ ĐƠN HÀNG ĐA KÊNH THÔNG MINH (ODOMS)
 * TỆP TIN: S:\HTTT\02_REALTIME_BACKEND_SYNC\ODOMS_Backend_API.gs
 * MÔ TẢ:
 *   Mã nguồn Google Apps Script độc lập kết nối Sổ dữ liệu Google Sheets chuẩn 6 trang tính
 *   Tiếng Việt không dấu (PascalCase) — copy dán 1 lần và triển khai (Deploy) trên Google Sheets:
 *     1. DatHang (19 cột — bổ sung cột DonViVanChuyen theo quy tắc ĐVVC 3 tầng)
 *     2. TonKho  (15 cột — Tồn kho vật lý, đang giữ theo từng sàn và khả dụng)
 *     3. LuuKho  (8 cột  — Lô hàng & mã QR truy xuất)
 *     4. VanDon  (21 cột — Danh sách vận đơn, trạng thái giao nhận và hành trình)
 *     5. NhanSu  (14 cột — Bảo toàn 4 tài khoản phân quyền dttd, lhmt, ntqg, nttn)
 *     6. NhatKy  (7 cột  — Nhật ký hoạt động hệ thống)
 *   - Khóa chống ghi đè đồng thời (LockService) hỗ trợ nhiều nhân viên thao tác cùng lúc.
 *   - Tự động nâng cấp an toàn bảng DatHang 18 cột cũ sang 19 cột (chèn cột DonViVanChuyen
 *     ngay trước MaVanDon) không làm lệch dữ liệu cũ.
 * =========================================================================================
 */

const ODOMS_CONFIG = {
  SHEETS: {
    ORDERS: "DatHang",
    INVENTORY: "TonKho",
    BATCHES: "LuuKho",
    SHIPMENTS: "VanDon",
    USERS: "NhanSu",
    LOGS: "NhatKy"
  },
  LEGACY_SHEET_MAP: {
    Orders: "DatHang",
    Inventory_ATP: "TonKho",
    Batches: "LuuKho",
    Shipments: "VanDon",
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
      "DonViVanChuyen",
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
    VanDon: [
      "MaVanDon",
      "MaDonGoc",
      "SanTMDT",
      "DonViVanChuyen",
      "DichVuGiao",
      "PhiVanChuyen",
      "MienPhiVanChuyen",
      "TienThuHoCOD",
      "TrangThaiVanChuyen",
      "NguoiNhan",
      "SoDienThoaiNhan",
      "DiaChiNhan",
      "TomTatHangHoa",
      "MaLoHang",
      "BuuTaPhuTrach",
      "SoDienThoaiBuuTa",
      "ViTriHienTai",
      "TienDoPhanTram",
      "ThoiGianBanGiao",
      "LichSuHanhTrinh",
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
  CARRIER_POS_LABEL: "Tại quầy",
  CARRIER_UNASSIGNED_LABEL: "Chưa gán ĐVVC",
  PHONE_TEXT_COLUMNS: {
    DatHang: ["SoDienThoai"],
    VanDon: ["SoDienThoaiNhan", "SoDienThoaiBuuTa"]
  },
  DEFAULT_SENDER: {
    name: "ODOMS Store — Kho Phường Bình Phú",
    phone: "02877776868",
    address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
  },
  LOCK_TIMEOUT_MS: 30000,
  DEFAULT_SECRET_TOKEN: "ODOMS_SECURE_TOKEN_2026",
  DATASET_VERSION: "FASHION_2026_V4",
  MIN_FASHION_SKU_COUNT: 25,
  MAX_ALLOWED_INVALID_ORDERS: 3,
  // Danh sách đen (blocklist) duy nhất dùng để chặn các bản Web/Vercel cũ đẩy 4 nhóm mã phi thời trang & 11 đơn tháng 10 (261022)
  LEGACY_BLOCKED_SKUS: [
    "SP-TAI-NGHE-02",
    "SP-BALO-LAP-03",
    "SP-BALO-LAP-04",
    "SP-BINH-NHIET-04",
    "SP-BINH-NHIET-05",
    "SP-BAN-PHIM-03",
    "SP-BAN-PHIM-05"
  ],
  LEGACY_BLOCKED_ORDER_PREFIXES: [
    "SP261022",
    "TT261022",
    "LZ261022",
    "POS261022",
    "FB261022"
  ]
};

/**
 * =========================================================================================
 * 1. KHỞI TẠO & NÂNG CẤP AN TOÀN SỔ DỮ LIỆU 6 TRANG TÍNH CHUẨN PASCALCASE
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

function migrateDatHangAddCarrierColumn(ss) {
  const sheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.ORDERS);
  if (!sheet || sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) return;

  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return String(h || "").trim();
  });

  if (headerRow.indexOf("DonViVanChuyen") !== -1) {
    return;
  }

  // Chèn cột DonViVanChuyen ngay trước MaVanDon (nếu có) để không làm lệch dữ liệu cột cũ
  const trackingIdx = headerRow.indexOf("MaVanDon");
  const updatedIdx = headerRow.indexOf("ThoiGianCapNhat");
  let insertCol1Based = lastCol + 1;

  if (trackingIdx >= 0) {
    insertCol1Based = trackingIdx + 1;
    sheet.insertColumnBefore(insertCol1Based);
  } else if (updatedIdx >= 0) {
    insertCol1Based = updatedIdx + 1;
    sheet.insertColumnBefore(insertCol1Based);
  }

  sheet.getRange(1, insertCol1Based).setValue("DonViVanChuyen");

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const shipmentsIndex = buildShipmentLookupMaps(readShipmentsList(ss));
    const currentLastCol = sheet.getLastColumn();
    const updatedHeaders = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0].map(function (h) {
      return String(h || "").trim();
    });
    const orderIdIdx = updatedHeaders.indexOf("MaDonGoc");
    const channelIdx = updatedHeaders.indexOf("SanTMDT");
    const newTrackingIdx = updatedHeaders.indexOf("MaVanDon");
    const bodyValues = sheet.getRange(2, 1, lastRow - 1, currentLastCol).getValues();

    const carrierCells = bodyValues.map(function (row) {
      const ordObj = {
        orderId: orderIdIdx >= 0 ? String(row[orderIdIdx] || "").trim() : "",
        channel: channelIdx >= 0 ? String(row[channelIdx] || "").trim() : "",
        trackingCode: newTrackingIdx >= 0 ? String(row[newTrackingIdx] || "").trim() : "",
        carrier: ""
      };
      return [resolveOrderCarrierBackend(ordObj, shipmentsIndex.byOrderId, shipmentsIndex.byTracking)];
    });

    sheet.getRange(2, insertCol1Based, carrierCells.length, 1).setValues(carrierCells);
  }
}

function hasExpectedHeaders(sheet, expectedHeaders) {
  if (!sheet || sheet.getLastRow() === 0) return false;
  if (sheet.getLastColumn() < expectedHeaders.length) return false;
  const actualHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
  for (let i = 0; i < expectedHeaders.length; i++) {
    if (String(actualHeaders[i] || "").trim() !== expectedHeaders[i]) {
      return false;
    }
  }
  return true;
}

function applySheetHeaderRow(sheet, headers) {
  if (!sheet || !headers || headers.length === 0) return;
  const maxCols = Math.max(sheet.getLastColumn(), headers.length);
  if (maxCols > headers.length) {
    sheet
      .getRange(1, headers.length + 1, Math.max(1, sheet.getLastRow()), maxCols - headers.length)
      .clearContent();
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0A2947");
  headerRange.setFontColor("#F3E4C9");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function applyPhoneTextFormatToSheet(sheet, columnNames, minDataRows) {
  if (!sheet || !Array.isArray(columnNames) || columnNames.length === 0) return;
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  let headerRow = [];
  if (sheet.getLastRow() >= 1) {
    headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
      return String(h || "").trim();
    });
  }
  const fallbackHeaders = ODOMS_CONFIG.HEADERS[sheet.getName()] || [];
  const effectiveHeaders = headerRow.length >= fallbackHeaders.length ? headerRow : fallbackHeaders;
  const maxRows = typeof sheet.getMaxRows === "function" ? sheet.getMaxRows() : 0;
  const dataRowCount = Math.max(maxRows - 1, sheet.getLastRow() - 1, Number(minDataRows || 0), 1);

  columnNames.forEach(function (colName) {
    const idx = effectiveHeaders.indexOf(colName);
    if (idx >= 0) {
      sheet.getRange(2, idx + 1, dataRowCount, 1).setNumberFormat("@");
    }
  });
}

function applyPhoneTextFormatToAllSheets(ss) {
  if (!ss) return;
  const map = ODOMS_CONFIG.PHONE_TEXT_COLUMNS || {};
  Object.keys(map).forEach(function (sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      applyPhoneTextFormatToSheet(sheet, map[sheetName], 1);
    }
  });
}

function setupODOMSDatabase() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SECRET_TOKEN")) {
    props.setProperty("SECRET_TOKEN", ODOMS_CONFIG.DEFAULT_SECRET_TOKEN);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  migrateLegacySheets(ss);
  migrateDatHangAddCarrierColumn(ss);

  const sheetNames = Object.values(ODOMS_CONFIG.SHEETS);
  sheetNames.forEach(function (sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = ODOMS_CONFIG.HEADERS[sheetName];
    applySheetHeaderRow(sheet, headers);
  });

  applyPhoneTextFormatToAllSheets(ss);
  seedDefaultDataIfEmpty(ss);

  return {
    status: "SUCCESS",
    message:
      "Đã khởi tạo hoàn tất sổ dữ liệu 6 trang tính chuẩn ODOMS (DatHang, TonKho, LuuKho, VanDon, NhanSu, NhatKy).",
    sheets: sheetNames,
    timestamp: formatNowVN()
  };
}

function ensureSheetsInitialized() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  migrateLegacySheets(ss);
  migrateDatHangAddCarrierColumn(ss);

  const needsSetup = Object.values(ODOMS_CONFIG.SHEETS).some(function (name) {
    const sh = ss.getSheetByName(name);
    const expected = ODOMS_CONFIG.HEADERS[name];
    return !hasExpectedHeaders(sh, expected);
  });

  if (needsSetup) {
    setupODOMSDatabase();
  } else {
    applyPhoneTextFormatToAllSheets(ss);
  }
  return ss;
}

function seedDefaultDataIfEmpty(ss) {
  const nowStr = formatNowVN();

  // 1. Khởi tạo TonKho & LuuKho Thời trang (25 mã SP, 40 lô hàng — bảo toàn kịch bản SP-AO-POLO-01: 10 cái) nếu đang trống
  const invSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.INVENTORY);
  const batchSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.BATCHES);
  if ((invSheet && invSheet.getLastRow() <= 1) || (batchSheet && batchSheet.getLastRow() <= 1)) {
    const fashionCatalog = getFashion2026InventoryCatalog_();
    writeInventoryAndBatchesSheets(ss, fashionCatalog);
  }

  // 2. Khởi tạo VanDon Thời trang (10 vận đơn) nếu đang trống
  const shipSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.SHIPMENTS);
  if (shipSheet && shipSheet.getLastRow() <= 1) {
    const fashionShipments = getFashion2026ShipmentsSeed_();
    writeShipmentsSheet(ss, fashionShipments);
  }

  // 3. Khởi tạo NhanSu nếu đang trống (bảo toàn tuyệt đối 4 tài khoản dttd, lhmt ẩn dự phòng, ntqg, nttn)
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

  // 4. Khởi tạo NhatKy nếu đang trống
  const logSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.LOGS);
  if (logSheet && logSheet.getLastRow() <= 1) {
    const defaultLogs = [
      ["LOG-INIT-1", nowStr, "dttd", "Đỗ Thị Thuỳ Dung", "Khởi tạo sổ dữ liệu 6 trang tính ODOMS ngành Thời trang (25 sản phẩm) trên Google Sheets", "Sổ dữ liệu Google Sheets", "SUCCESS"]
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
    const action = e && e.parameter && e.parameter.action ? String(e.parameter.action).toUpperCase() : "PULL_ALL";

    if (action === "PING") {
      return jsonResponse({
        status: "SUCCESS",
        service: "ODOMS_SHEETS_SYNC",
        message: "Kết nối Sổ dữ liệu Google Sheets 6 trang tính đang hoạt động ổn định.",
        sheets: Object.values(ODOMS_CONFIG.SHEETS),
        serverTime: formatNowVN()
      });
    }

    const state = readAllSheetsState(ss);
    return jsonResponse({
      status: "SUCCESS",
      action: action,
      datasetVersion: ODOMS_CONFIG.DATASET_VERSION,
      serverTime: formatNowVN(),
      data: state
    });
  } catch (err) {
    return jsonResponse({
      status: "ERROR",
      message: "Không thể đọc dữ liệu từ Sổ Google Sheets: " + err.toString()
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
      message: "Sổ Google Sheets đang bận cập nhật từ một nhân viên khác. Vui lòng thử lại sau vài giây."
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

    if (action === "SEED_FASHION_2026") {
      const seedRes = seedFashion2026DataInternal_(ss);
      return jsonResponse(seedRes);
    }

    if (action === "SYNC_ALL" || action === "PUSH_STATE") {
      const guardRes = validateIncomingSyncPayload_(ss, payload, action);
      if (!guardRes.allowed) {
        return jsonResponse({
          status: guardRes.status || "REJECTED_LEGACY_DATA",
          action: action,
          reason: guardRes.reason || "BLOCKED_BY_SERVER_GUARD",
          message: guardRes.message,
          serverTime: formatNowVN()
        });
      }

      const syncResult = writeFullStateToSheets(ss, payload);
      return jsonResponse({
        status: "SUCCESS",
        action: action,
        datasetVersion: ODOMS_CONFIG.DATASET_VERSION,
        message:
          "Đã đồng bộ đầy đủ 6 trang tính lên Sổ Google Sheets (DatHang, TonKho, LuuKho, VanDon, NhanSu, NhatKy) thành công.",
        details: syncResult,
        serverTime: formatNowVN()
      });
    }

    if (action === "SYNC_SHIPMENTS") {
      const incomingShipments = Array.isArray(payload.shipments) ? payload.shipments : [];
      const shipCount = writeShipmentsSheet(ss, incomingShipments);
      // Tự động cập nhật ngược ĐVVC & Mã vận đơn cho các đơn hàng khớp trên DatHang
      const currentState = readAllSheetsState(ss);
      const updatedOrdersCount = writeOrdersSheet(ss, currentState.orders, currentState.shipments);
      return jsonResponse({
        status: "SUCCESS",
        action: "SYNC_SHIPMENTS",
        message: "Đã cập nhật trang tính VanDon và tự động đồng bộ Đơn vị vận chuyển sang trang tính DatHang.",
        details: { shipments: shipCount, orders: updatedOrdersCount },
        serverTime: formatNowVN()
      });
    }

    if (action === "SYNC_USERS" || action === "AUDIT_LOGS_SYNC" || action === "USERS_RBAC_SYNC") {
      // Chỉ ghi riêng bảng NhanSu và NhatKy, tuyệt đối không chạm vào DatHang, TonKho, LuuKho, VanDon
      let userCount = 0;
      let logCount = 0;
      if (Array.isArray(payload.users) && payload.users.length > 0) {
        userCount = writeUsersSheet(ss, payload.users);
      }
      if (Array.isArray(payload.auditLogs) && payload.auditLogs.length > 0) {
        logCount = writeAuditLogsSheet(ss, payload.auditLogs);
      }
      return jsonResponse({
        status: "SUCCESS",
        action: action,
        details: { users: userCount, auditLogs: logCount },
        message: "Đã đồng bộ riêng danh sách Nhân sự và Nhật ký hoạt động lên Google Sheets (bảo toàn nguyên vẹn Đặt hàng & Tồn kho).",
        serverTime: formatNowVN()
      });
    }

    if (action === "WEBHOOK_ORDER" || action === "INGEST_ORDERS") {
      const currentState = readAllSheetsState(ss);
      const shipmentsIndex = buildShipmentLookupMaps(currentState.shipments);
      const incomingOrders = Array.isArray(payload.orders)
        ? payload.orders
        : payload.order
        ? [payload.order]
        : [payload];

      let added = 0;
      incomingOrders.forEach(function (ord) {
        const orderId = String(
          ord.orderId || ord.MaDonGoc || ord.original_sn || ord["Mã đơn hàng"] || "OD-" + Date.now()
        ).trim();
        const exists = currentState.orders.some(function (o) {
          return String(o.orderId) === orderId;
        });
        if (!exists) {
          const channelVal = String(
            ord.channel || ord.SanTMDT || ord.channel_id || ord["Sàn TMĐT"] || "SHOPEE"
          ).toUpperCase();
          const rawCarrier = pickVal(
            ord,
            [
              "carrier",
              "DonViVanChuyen",
              "Đơn vị vận chuyển",
              "ĐVVC",
              "Don_Vi_Van_Chuyen",
              "Shipping Provider",
              "shippingProvider",
              "Shipping Carrier",
              "shippingCarrier",
              "Carrier",
              "carrier",
              "Logistics",
              "Nhà vận chuyển"
            ],
            ""
          );
          const rawTracking = String(
            pickVal(ord, ["trackingCode", "MaVanDon", "Mã vận đơn", "Tracking Code"], "")
          ).trim();
          const newOrderObj = {
            orderId: orderId,
            channel: channelVal,
            orderTime: ord.orderTime || ord.ThoiGianDat || formatNowVN(),
            sku: String(ord.sku || ord.MaSanPhamSKU || ord.internal_sku || ord["SKU phân loại"] || "SP-AO-POLO-01").toUpperCase(),
            productName: ord.productName || ord.TenSanPham || ord["Tên sản phẩm"] || "",
            quantity: parseQuantity(ord.quantity || ord.SoLuong || ord.order_qty || ord["Số lượng"] || 1),
            unitPrice: parseCurrencyVND(ord.unitPrice || ord.DonGia || ord["Đơn giá"] || 250000),
            customerName: ord.customerName || ord.KhachHang || ord["Người Mua"] || "Khách đặt từ kênh bán",
            customerPhone: normalizePhoneVN(ord.customerPhone || ord.SoDienThoai || ord["Số điện thoại"] || ""),
            shippingAddress: ord.shippingAddress || ord.DiaChiGiao || ord.delivery_city || ord["Địa chỉ nhận hàng"] || "TP.HCM",
            platformStatus: ord.platformStatus || ord.TrangThaiSan || "CONFIRMED",
            paymentMethod: ord.paymentMethod || ord.PhuongThucThanhToan || "COD",
            sourceMethod: "WEBHOOK_API",
            status: ord.status || ord.TrangThaiDieuPhoi || "ALLOCATED",
            fifoRank: ord.fifoRank || ord.ThuTuGiuHang || "",
            allocatedBatches: ord.allocatedBatches || [],
            carrier: rawCarrier,
            trackingCode: rawTracking
          };
          newOrderObj.carrier = resolveOrderCarrierBackend(
            newOrderObj,
            shipmentsIndex.byOrderId,
            shipmentsIndex.byTracking
          );
          if (!newOrderObj.trackingCode && shipmentsIndex.byOrderId[orderId]) {
            newOrderObj.trackingCode = shipmentsIndex.byOrderId[orderId].trackingCode || "";
          }
          currentState.orders.push(newOrderObj);
          added++;
        }
      });

      writeOrdersSheet(ss, currentState.orders, currentState.shipments);
      return jsonResponse({
        status: "SUCCESS",
        action: action,
        addedCount: added,
        totalOrders: currentState.orders.length,
        message: "Đã tiếp nhận " + added + " đơn hàng mới vào trang tính DatHang.",
        serverTime: formatNowVN()
      });
    }

    return jsonResponse({
      status: "SUCCESS",
      action: action,
      message: "Đã tiếp nhận và xử lý yêu cầu đồng bộ thành công.",
      serverTime: formatNowVN()
    });
  } catch (error) {
    return jsonResponse({
      status: "ERROR",
      message: "Không thể cập nhật dữ liệu lên Sổ Google Sheets: " + error.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (lockErr) {
      Logger.log("Giải phóng khóa đồng bộ: " + lockErr.toString());
    }
  }
}

/**
 * =========================================================================================
 * 4. CƠ CHẾ XÁC ĐỊNH ĐƠN VỊ VẬN CHUYỂN (ĐVVC) CHUẨN NGHIỆP VỤ 3 TẦNG
 * =========================================================================================
 */
function isAssignedCarrierValue(val) {
  const s = String(val || "").trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  return (
    lower !== "chưa gán đvvc" &&
    lower !== "chua gan dvvc" &&
    lower !== "n/a" &&
    lower !== "null" &&
    lower !== "undefined" &&
    s !== "-" &&
    s !== "—"
  );
}

function buildShipmentLookupMaps(shipments) {
  const byOrderId = {};
  const byTracking = {};
  (shipments || []).forEach(function (s) {
    if (!s) return;
    const ordId = String(s.orderId || "").trim();
    const trk = String(s.trackingCode || "").trim();
    if (ordId) byOrderId[ordId] = s;
    if (trk) byTracking[trk] = s;
  });
  return { byOrderId: byOrderId, byTracking: byTracking };
}

/**
 * Quy tắc ĐVVC 3 tầng:
 *  - Tầng 1: Đối chiếu vận đơn thực tế trong bảng VanDon (khớp MaDonGoc hoặc MaVanDon).
 *  - Tầng 2: Đọc trực tiếp từ trường DonViVanChuyen của đơn hàng (từ Sàn TMĐT / Excel / DatHang).
 *  - Tầng 3: Theo nguồn phát sinh đơn — POS tự động gán "Tại quầy"; Facebook / ngoài sàn chưa có vận đơn -> "Chưa gán ĐVVC".
 */
function resolveOrderCarrierBackend(orderObj, shipmentsByOrderId, shipmentsByTracking) {
  const ord = orderObj || {};
  const orderId = String(ord.orderId || "").trim();
  const trackingCode = String(ord.trackingCode || "").trim();
  const channelUpper = String(ord.channel || "").trim().toUpperCase();

  // Tầng 1: Ưu tiên ĐVVC thực tế từ bảng VanDon
  const matchedShipment =
    (orderId && shipmentsByOrderId && shipmentsByOrderId[orderId]) ||
    (trackingCode && shipmentsByTracking && shipmentsByTracking[trackingCode]) ||
    null;
  if (matchedShipment && isAssignedCarrierValue(matchedShipment.carrier)) {
    return String(matchedShipment.carrier).trim();
  }

  // Tầng 2: Trường ĐVVC gốc từ Sàn TMĐT / tệp Excel / DatHang
  if (isAssignedCarrierValue(ord.carrier)) {
    return String(ord.carrier).trim();
  }

  // Tầng 3: Mặc định chuẩn theo nguồn phát sinh đơn
  if (channelUpper === "POS" || channelUpper.indexOf("POS") !== -1) {
    return ODOMS_CONFIG.CARRIER_POS_LABEL;
  }
  return ODOMS_CONFIG.CARRIER_UNASSIGNED_LABEL;
}

/**
 * =========================================================================================
 * 5. CÁC HÀM ĐỌC / GHI 6 TRANG TÍNH TRÊN GOOGLE SHEETS
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

function getShippingTierLabelBackend(tierCode) {
  const t = String(tierCode || "TIEU_CHUAN").toUpperCase();
  if (t === "HOA_TOC") return "⚡ Hỏa Tốc (2H)";
  if (t === "NHANH") return "🚀 Giao Nhanh (24H)";
  return "📦 Tiêu Chuẩn";
}

function getShipmentStatusLabelBackend(statusCode) {
  const st = String(statusCode || "PENDING_PICKUP").toUpperCase();
  if (st === "IN_TRANSIT") return "🚚 Đang giao hàng";
  if (st === "DELIVERED") return "✅ Giao thành công";
  if (st === "FAILED_RETURNING") return "❌ Giao thất bại / Chờ chuyển hoàn";
  return "⏳ Chờ lấy hàng";
}

function sanitizePipeField(val) {
  return String(val || "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "/")
    .trim();
}

function formatTimelineForSheet(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) return "";
  return timeline
    .map(function (step) {
      return [
        sanitizePipeField(step.time),
        sanitizePipeField(step.title),
        sanitizePipeField(step.desc),
        sanitizePipeField(step.location)
      ].join(" | ");
    })
    .join("\n");
}

function parseTimelineFromSheet(rawVal) {
  const s = String(rawVal || "").trim();
  if (!s) return [];
  if (s.charAt(0) === "[") {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return s
    .split(/\r?\n|;;/)
    .map(function (line) {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const parts = trimmed.split("|").map(function (p) {
        return p.trim();
      });
      return {
        time: parts[0] || "",
        title: parts[1] || "Cập nhật vận chuyển",
        desc: parts[2] || "",
        location: parts[3] || "Kho ODOMS Phường Bình Phú"
      };
    })
    .filter(function (item) {
      return item !== null;
    });
}

function readShipmentsList(ss) {
  const shipRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.SHIPMENTS);
  return shipRaw.map(function (s) {
    const tierCode = String(pickVal(s, ["DichVuGiao", "shippingTier"], "TIEU_CHUAN")).toUpperCase();
    const statusCode = String(pickVal(s, ["TrangThaiVanChuyen", "status"], "PENDING_PICKUP")).toUpperCase();
    const isFreeRaw = pickVal(s, ["MienPhiVanChuyen", "isFreeship"], false);
    const feeNum = parseCurrencyVND(pickVal(s, ["PhiVanChuyen", "shippingFee"], 0));
    const isFreeship = isFreeRaw === true || String(isFreeRaw).toLowerCase() === "true" || feeNum === 0;
    const progressNum = parseQuantity(pickVal(s, ["TienDoPhanTram", "progressPercent"], 20));

    return {
      trackingCode: String(pickVal(s, ["MaVanDon", "trackingCode"], "")).trim(),
      orderId: String(pickVal(s, ["MaDonGoc", "orderId"], "")).trim(),
      channel: String(pickVal(s, ["SanTMDT", "channel"], "SHOPEE")).trim().toUpperCase(),
      carrier: String(pickVal(s, ["DonViVanChuyen", "carrier"], "")).trim(),
      shippingTier: tierCode,
      shippingTierLabel: getShippingTierLabelBackend(tierCode),
      shippingFee: feeNum,
      isFreeship: isFreeship,
      totalCod: parseCurrencyVND(pickVal(s, ["TienThuHoCOD", "totalCod"], 0)),
      status: statusCode,
      statusLabel: getShipmentStatusLabelBackend(statusCode),
      sender: {
        name: ODOMS_CONFIG.DEFAULT_SENDER.name,
        phone: ODOMS_CONFIG.DEFAULT_SENDER.phone,
        address: ODOMS_CONFIG.DEFAULT_SENDER.address
      },
      receiver: {
        name: String(pickVal(s, ["NguoiNhan", "receiverName"], "")).trim(),
        phone: normalizePhoneVN(pickVal(s, ["SoDienThoaiNhan", "receiverPhone"], "")),
        address: String(pickVal(s, ["DiaChiNhan", "receiverAddress"], "")).trim()
      },
      itemsSummary: String(pickVal(s, ["TomTatHangHoa", "itemsSummary"], "")).trim(),
      batchCode: String(pickVal(s, ["MaLoHang", "batchCode"], "")).trim(),
      shipperName: String(pickVal(s, ["BuuTaPhuTrach", "shipperName"], "Đang điều phối bưu tá")).trim(),
      shipperPhone: normalizePhoneVN(pickVal(s, ["SoDienThoaiBuuTa", "shipperPhone"], "")),
      currentLocation: String(pickVal(s, ["ViTriHienTai", "currentLocation"], "")).trim(),
      progressPercent: progressNum,
      handoverTime: String(pickVal(s, ["ThoiGianBanGiao", "handoverTime"], "")).trim(),
      lastUpdateTime: String(pickVal(s, ["ThoiGianCapNhat", "lastUpdateTime"], "")).trim(),
      timeline: parseTimelineFromSheet(pickVal(s, ["LichSuHanhTrinh", "timeline"], ""))
    };
  });
}

function readOrdersList(ss, shipmentsIndexOpt) {
  const shipmentsIndex = shipmentsIndexOpt || buildShipmentLookupMaps(readShipmentsList(ss));
  const ordersRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.ORDERS);

  return ordersRaw.map(function (r) {
    const rawBatchesVal = pickVal(r, ["PhanBoLoHang", "allocatedBatchesJson"], "");
    const rawSourceVal = pickVal(r, ["NguonTiepNhan", "sourceMethod"], "NhapTuFileExcel");
    const rankVal = pickVal(r, ["ThuTuGiuHang", "fifoRank"], "");
    const orderId = String(pickVal(r, ["MaDonGoc", "orderId"], "")).trim();
    const channel = String(pickVal(r, ["SanTMDT", "channel"], "SHOPEE")).trim();
    const rawCarrier = String(
      pickVal(r, ["DonViVanChuyen", "carrier", "Don_Vi_Van_Chuyen", "Đơn vị vận chuyển"], "")
    ).trim();
    let trackingCode = String(pickVal(r, ["MaVanDon", "trackingCode"], "")).trim();

    if (!trackingCode && shipmentsIndex.byOrderId[orderId]) {
      trackingCode = shipmentsIndex.byOrderId[orderId].trackingCode || "";
    }

    const resolvedCarrier = resolveOrderCarrierBackend(
      { orderId: orderId, channel: channel, carrier: rawCarrier, trackingCode: trackingCode },
      shipmentsIndex.byOrderId,
      shipmentsIndex.byTracking
    );

    return {
      orderId: orderId,
      channel: channel,
      orderTime: String(pickVal(r, ["ThoiGianDat", "orderTime"], "")),
      sku: String(pickVal(r, ["MaSanPhamSKU", "sku"], "")),
      productName: String(pickVal(r, ["TenSanPham", "productName"], "")),
      quantity: parseQuantity(pickVal(r, ["SoLuong", "quantity"], 0)),
      unitPrice: parseCurrencyVND(pickVal(r, ["DonGia", "unitPrice"], 0)),
      customerName: String(pickVal(r, ["KhachHang", "customerName"], "")),
      customerPhone: normalizePhoneVN(pickVal(r, ["SoDienThoai", "customerPhone"], "")),
      shippingAddress: String(pickVal(r, ["DiaChiGiao", "shippingAddress"], "")),
      platformStatus: String(pickVal(r, ["TrangThaiSan", "platformStatus"], "CONFIRMED")),
      paymentMethod: String(pickVal(r, ["PhuongThucThanhToan", "paymentMethod"], "COD")),
      sourceMethod: parseSourceMethodFromSheet(rawSourceVal),
      status: String(pickVal(r, ["TrangThaiDieuPhoi", "status"], "PENDING")),
      fifoRank: rankVal !== "" && rankVal !== null ? Number(rankVal) : null,
      allocatedBatches: parseAllocatedBatchesFromSheet(rawBatchesVal),
      carrier: resolvedCarrier,
      trackingCode: trackingCode
    };
  });
}

function readAllSheetsState(ss) {
  const shipments = readShipmentsList(ss);
  const shipmentsIndex = buildShipmentLookupMaps(shipments);
  const orders = readOrdersList(ss, shipmentsIndex);
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
      ip: String(pickVal(l, ["DiaChiIP", "ip"], "Sổ dữ liệu Google Sheets")),
      status: String(pickVal(l, ["KetQua", "status"], "SUCCESS"))
    };
  });

  return {
    datasetVersion: ODOMS_CONFIG.DATASET_VERSION,
    orders: orders,
    inventory: inventory,
    shipments: shipments,
    users: users,
    auditLogs: auditLogs
  };
}

/**
 * Tường lửa kiểm định dữ liệu phía máy chủ trước khi cho phép SYNC_ALL / PUSH_STATE ghi đè Google Sheets:
 *  1. Bắt buộc payload.datasetVersion === "FASHION_2026_V4" (từ chối mọi bản Web/Vercel cũ chưa nâng cấp).
 *  2. Từ chối 100% nếu chứa bất kỳ mã sản phẩm phi thời trang cũ nào trong LEGACY_BLOCKED_SKUS.
 *  3. Từ chối 100% nếu chứa bất kỳ mã đơn tháng 10 cũ nào (261022 / LEGACY_BLOCKED_ORDER_PREFIXES).
 *  4. Từ chối nếu danh mục tồn kho gửi lên < 25 mã Thời trang hoặc số đơn bị đánh dấu INVALID > 3 đơn.
 *  5. Chặn xóa trắng bảng DatHang khi trên Sổ Google Sheets đang có dữ liệu đơn hàng mà payload gửi mảng rỗng.
 */
function validateIncomingSyncPayload_(ss, payload, action) {
  const data = payload || {};
  const expectedVer = ODOMS_CONFIG.DATASET_VERSION;

  // 1. Kiểm tra cờ phiên bản bộ dữ liệu chuẩn FASHION_2026_V4
  if (String(data.datasetVersion || "").trim() !== expectedVer) {
    return {
      allowed: false,
      status: "REJECTED_OUTDATED_CLIENT",
      reason: "MISSING_OR_MISMATCHED_DATASET_VERSION",
      message:
        "Từ chối đồng bộ: Phiên bản trang Web đang mở đã cũ (thiếu định danh " +
        expectedVer +
        "). Vui lòng tải lại trang để nhận dữ liệu mới nhất từ Sổ Google Sheets."
    };
  }

  const blockedSkus = ODOMS_CONFIG.LEGACY_BLOCKED_SKUS || [];
  const blockedOrderPrefixes = ODOMS_CONFIG.LEGACY_BLOCKED_ORDER_PREFIXES || [];
  const incomingInv = Array.isArray(data.inventory) ? data.inventory : [];
  const incomingOrders = Array.isArray(data.orders) ? data.orders : [];

  // 2. Quét danh sách đen mã sản phẩm cũ trong tồn kho & đơn hàng
  for (let i = 0; i < incomingInv.length; i++) {
    const sku = String((incomingInv[i] && (incomingInv[i].sku || incomingInv[i].MaSanPhamSKU)) || "")
      .trim()
      .toUpperCase();
    if (blockedSkus.indexOf(sku) !== -1) {
      return {
        allowed: false,
        status: "REJECTED_LEGACY_DATA",
        reason: "LEGACY_SKU_IN_INVENTORY:" + sku,
        message: "Từ chối đồng bộ: Phát hiện mã hàng ngành cũ (" + sku + ") không thuộc danh mục Thời trang 2026."
      };
    }
  }

  let invalidOrderCount = 0;
  for (let j = 0; j < incomingOrders.length; j++) {
    const ord = incomingOrders[j] || {};
    const ordId = String(ord.orderId || ord.MaDonGoc || "").trim().toUpperCase();
    const ordSku = String(ord.sku || ord.MaSanPhamSKU || "").trim().toUpperCase();
    const ordStatus = String(ord.status || ord.TrangThaiDieuPhoi || "").trim().toUpperCase();

    if (blockedSkus.indexOf(ordSku) !== -1) {
      return {
        allowed: false,
        status: "REJECTED_LEGACY_DATA",
        reason: "LEGACY_SKU_IN_ORDERS:" + ordSku,
        message: "Từ chối đồng bộ: Đơn hàng chứa mã sản phẩm cũ (" + ordSku + ") không hợp lệ."
      };
    }

    const hasLegacyOrderPrefix =
      ordId.indexOf("261022") !== -1 ||
      blockedOrderPrefixes.some(function (prefix) {
        return ordId.indexOf(prefix) === 0;
      });
    if (hasLegacyOrderPrefix) {
      return {
        allowed: false,
        status: "REJECTED_LEGACY_DATA",
        reason: "LEGACY_ORDER_ID:" + ordId,
        message: "Từ chối đồng bộ: Phát hiện mã đơn hàng mẫu cũ tháng 10 (" + ordId + "). Đã khóa bảo vệ Sổ Google Sheets."
      };
    }

    if (ordStatus === "INVALID") {
      invalidOrderCount++;
    }
  }

  // 3. Kiểm tra số lượng danh mục tồn kho Thời trang tối thiểu (>= 25 mã)
  const minSkuCount = ODOMS_CONFIG.MIN_FASHION_SKU_COUNT || 25;
  if (incomingInv.length < minSkuCount) {
    return {
      allowed: false,
      status: "REJECTED_INVENTORY_DOWNGRADE",
      reason: "INVENTORY_COUNT_TOO_LOW:" + incomingInv.length,
      message:
        "Từ chối đồng bộ: Số lượng mã sản phẩm gửi lên (" +
        incomingInv.length +
        ") nhỏ hơn chuẩn 25 mã Thời trang 2026. Đã chặn ghi đè bảng TonKho."
    };
  }

  // 4. Chặn lỗi lệch kho biến hàng loạt đơn Thời trang thành INVALID (> 3 đơn)
  const maxInvalid = ODOMS_CONFIG.MAX_ALLOWED_INVALID_ORDERS || 3;
  if (invalidOrderCount > maxInvalid) {
    return {
      allowed: false,
      status: "REJECTED_MASS_INVALID_ORDERS",
      reason: "TOO_MANY_INVALID_ORDERS:" + invalidOrderCount,
      message:
        "Từ chối đồng bộ: Phát hiện " +
        invalidOrderCount +
        " đơn hàng bị đánh dấu sai mã sản phẩm. Đã chặn ghi đè để bảo vệ bảng DatHang."
    };
  }

  // 5. Chặn xóa trắng bảng DatHang khi trên Sổ Google Sheets đang có đơn hàng mà gói đẩy lên bị rỗng
  if (ss && typeof ss.getSheetByName === "function") {
    const orderSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.ORDERS);
    const existingOrderRows = orderSheet ? Math.max(0, orderSheet.getLastRow() - 1) : 0;
    if (existingOrderRows >= 15 && incomingOrders.length === 0 && !data.allowEmptyOrdersReset) {
      return {
        allowed: false,
        status: "REJECTED_EMPTY_ORDERS_WIPE",
        reason: "EMPTY_ORDERS_AGAINST_POPULATED_SHEET:" + existingOrderRows,
        message:
          "Từ chối đồng bộ: Sổ Google Sheets đang có " +
          existingOrderRows +
          " đơn hàng, không cho phép ghi đè danh sách đơn rỗng."
      };
    }
  }

  return {
    allowed: true,
    status: "ALLOWED",
    reason: "VALID_FASHION_2026_V4_PAYLOAD",
    message: "Dữ liệu đồng bộ hợp lệ chuẩn Thời trang 2026."
  };
}

function writeFullStateToSheets(ss, payload) {
  const counts = {
    orders: 0,
    inventory: 0,
    batches: 0,
    shipments: 0,
    users: 0,
    auditLogs: 0
  };

  // Ghi VanDon trước để bảng DatHang đối chiếu chính xác ĐVVC 3 tầng
  let effectiveShipments = null;
  if (Array.isArray(payload.shipments)) {
    counts.shipments = writeShipmentsSheet(ss, payload.shipments);
    effectiveShipments = payload.shipments;
  } else {
    effectiveShipments = readShipmentsList(ss);
    counts.shipments = effectiveShipments.length;
  }

  if (Array.isArray(payload.orders)) {
    counts.orders = writeOrdersSheet(ss, payload.orders, effectiveShipments);
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

function writeOrdersSheet(ss, orders, shipmentsOpt) {
  const sheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.ORDERS);
  const headers = ODOMS_CONFIG.HEADERS.DatHang;
  clearSheetDataRows(sheet, headers);

  if (!orders || orders.length === 0) {
    applyPhoneTextFormatToSheet(sheet, ODOMS_CONFIG.PHONE_TEXT_COLUMNS.DatHang, 1);
    return 0;
  }
  const effectiveShipments = Array.isArray(shipmentsOpt) ? shipmentsOpt : readShipmentsList(ss);
  const shipmentsIndex = buildShipmentLookupMaps(effectiveShipments);
  const nowStr = formatNowVN();

  const rows = orders.map(function (o) {
    const ch = o.channel || "SHOPEE";
    const orderId = String(o.orderId || "").trim();
    const matchedShip =
      (orderId && shipmentsIndex.byOrderId[orderId]) ||
      (o.trackingCode && shipmentsIndex.byTracking[String(o.trackingCode).trim()]) ||
      null;
    const trackingCode = String(o.trackingCode || (matchedShip ? matchedShip.trackingCode : "") || "").trim();
    const resolvedCarrier = resolveOrderCarrierBackend(
      { orderId: orderId, channel: ch, carrier: o.carrier, trackingCode: trackingCode },
      shipmentsIndex.byOrderId,
      shipmentsIndex.byTracking
    );

    return [
      orderId,
      ch,
      o.orderTime || "",
      o.sku || "",
      o.productName || "",
      Number(o.quantity || 0),
      Number(o.unitPrice || 0),
      o.customerName || "",
      normalizePhoneVN(o.customerPhone || ""),
      o.shippingAddress || "",
      o.platformStatus || "CONFIRMED",
      o.paymentMethod || "COD",
      formatSourceMethodForSheet(o.sourceMethod, ch),
      o.status || "PENDING",
      o.fifoRank !== null && o.fifoRank !== undefined ? o.fifoRank : "",
      formatAllocatedBatchesForSheet(o.allocatedBatches),
      resolvedCarrier,
      trackingCode,
      nowStr
    ];
  });
  // Bắt buộc đặt định dạng Văn bản thuần "@" cho cột SoDienThoai TRƯỚC khi ghi setValues() để không mất số 0 đầu
  applyPhoneTextFormatToSheet(sheet, ODOMS_CONFIG.PHONE_TEXT_COLUMNS.DatHang, rows.length);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return rows.length;
}

function writeShipmentsSheet(ss, shipments) {
  const sheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.SHIPMENTS);
  const headers = ODOMS_CONFIG.HEADERS.VanDon;
  clearSheetDataRows(sheet, headers);

  if (!shipments || shipments.length === 0) {
    applyPhoneTextFormatToSheet(sheet, ODOMS_CONFIG.PHONE_TEXT_COLUMNS.VanDon, 1);
    return 0;
  }
  const nowStr = formatNowVN();
  const rows = shipments.map(function (s) {
    const receiver = s.receiver || {};
    const feeNum = Number(s.shippingFee || 0);
    const isFreeship = s.isFreeship !== undefined ? Boolean(s.isFreeship) : feeNum === 0;
    return [
      String(s.trackingCode || "").trim(),
      String(s.orderId || "").trim(),
      String(s.channel || "SHOPEE").trim().toUpperCase(),
      String(s.carrier || "").trim(),
      String(s.shippingTier || "TIEU_CHUAN").trim().toUpperCase(),
      feeNum,
      isFreeship,
      Number(s.totalCod || 0),
      String(s.status || "PENDING_PICKUP").trim().toUpperCase(),
      String(receiver.name || s.receiverName || s.customerName || "").trim(),
      normalizePhoneVN(receiver.phone || s.receiverPhone || s.customerPhone || ""),
      String(receiver.address || s.receiverAddress || s.address || "").trim(),
      String(s.itemsSummary || "").trim(),
      String(s.batchCode || "").trim(),
      String(s.shipperName || "Đang điều phối bưu tá").trim(),
      normalizePhoneVN(s.shipperPhone || ""),
      String(s.currentLocation || "").trim(),
      Number(s.progressPercent || 20),
      String(s.handoverTime || nowStr).trim(),
      formatTimelineForSheet(s.timeline),
      String(s.lastUpdateTime || nowStr).trim()
    ];
  });
  // Bắt buộc đặt định dạng Văn bản thuần "@" cho 2 cột SoDienThoaiNhan & SoDienThoaiBuuTa TRƯỚC khi ghi setValues()
  applyPhoneTextFormatToSheet(sheet, ODOMS_CONFIG.PHONE_TEXT_COLUMNS.VanDon, rows.length);
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
      l.id || "LOG-" + Date.now(),
      l.time || formatNowVN(),
      l.username || "system",
      l.fullName || "Hệ thống",
      l.action || l.message || "",
      l.ip || "Sổ dữ liệu Google Sheets",
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
    if (
      !row ||
      row.every(function (cell) {
        return cell === "" || cell === null;
      })
    ) {
      continue;
    }
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = String(headers[c] || "").trim();
      if (key) {
        let cellVal = row[c];
        if (cellVal instanceof Date && !isNaN(cellVal.getTime())) {
          const pad = function (n) {
            return String(n).padStart(2, "0");
          };
          cellVal =
            pad(cellVal.getDate()) +
            "/" +
            pad(cellVal.getMonth() + 1) +
            "/" +
            cellVal.getFullYear() +
            " " +
            pad(cellVal.getHours()) +
            ":" +
            pad(cellVal.getMinutes()) +
            ":" +
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
 * 6. CÁC HÀM TIỆN ÍCH & CHUẨN HÓA SỐ LIỆU
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
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
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

/**
 * Chuẩn hóa số điện thoại Việt Nam dạng chuỗi văn bản:
 * - Giữ nguyên số 0 ở đầu (dạng String)
 * - Tự động bù "0" nếu bị Google Sheets / Excel cắt còn 9 chữ số (bắt đầu bằng 3, 5, 7, 8, 9)
 * - Chuyển đổi đầu +84 / 84 về đầu 0 chuẩn nội địa
 */
function normalizePhoneVN(rawVal) {
  if (rawVal === null || rawVal === undefined) return "";
  const str = String(rawVal).trim();
  if (!str) return "";
  const upper = str.toUpperCase();
  if (upper === "N/A" || upper === "NULL" || upper === "UNDEFINED") return "";
  const cleaned = str.replace(/^'+/, "").trim();
  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return cleaned;
  if (digits.length === 11 && digits.indexOf("84") === 0 && /^[35789]/.test(digits.charAt(2))) {
    return "0" + digits.slice(2);
  }
  if (digits.length === 9 && /^[35789]/.test(digits.charAt(0))) {
    return "0" + digits;
  }
  if (digits.length === 10 && digits.charAt(0) === "2") {
    return "0" + digits;
  }
  if (digits.length === 10 && digits.charAt(0) === "0") {
    return digits;
  }
  if (
    (digits.length === 11 && digits.indexOf("02") === 0) ||
    ((digits.length === 8 || digits.length === 10) && (digits.indexOf("1800") === 0 || digits.indexOf("1900") === 0))
  ) {
    return digits;
  }
  return cleaned;
}

/**
 * =========================================================================================
 * 7. HÀM KHỞI TẠO & NẠP SẠCH DỮ LIỆU NGÀNH THỜI TRANG 2026 (01/2026 – 22/11/2026)
 *    - Bấm Chạy (Run) trực tiếp hàm seedFashion2026Data() một lần trên Apps Script Editor:
 *      + Xóa sạch dữ liệu 5 mã sản phẩm cũ trên DatHang, TonKho, LuuKho, VanDon
 *      + Nạp đủ 25 mã Thời trang (5 danh mục, 40 lô hàng, 409 SP vật lý) chuẩn S:\HTTT\fashion68.js
 *      + Nạp 30 đơn hàng 5 sàn (01/2026 – 22/11/2026) có cột DonViVanChuyen 3 tầng
 *      + Nạp 10 vận đơn Thời trang (4 trạng thái giao nhận) khớp 1:1 với Web App & 5 tệp CSV
 *      + Giữ nguyên kịch bản tranh chấp tồn kho SP-AO-POLO-01 (10 cái: LO-2026-A1 6 cái + LO-2026-A2 4 cái)
 *      + Bảo toàn tuyệt đối 4 tài khoản gốc trong trang tính NhanSu (không ghi đè bảng NhanSu)
 * =========================================================================================
 */
function seedFashion2026Data() {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    hasLock = lock.tryLock(ODOMS_CONFIG.LOCK_TIMEOUT_MS);
  } catch (e) {
    hasLock = false;
  }

  try {
    const ss = ensureSheetsInitialized();
    const res = seedFashion2026DataInternal_(ss);
    Logger.log(JSON.stringify(res));
    return res;
  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (releaseErr) {
        Logger.log("Giải phóng khóa seedFashion2026Data: " + releaseErr.toString());
      }
    }
  }
}

function seedFashion2026DataInternal_(ss) {
  // Đảm bảo đủ 6 trang tính chuẩn (có DonViVanChuyen & VanDon) và định dạng cột SĐT dạng "@"
  applyPhoneTextFormatToAllSheets(ss);

  const inventory = getFashion2026InventoryCatalog_();
  const orders = getFashion2026OrdersSeed_();
  const shipments = getFashion2026ShipmentsSeed_();

  // Chạy phân bổ tồn kho FIFO/FEFO và đối chiếu ĐVVC 3 tầng đồng nhất với OMSEngine
  allocateFashionSeedData_(inventory, orders, shipments);

  // Ghi VanDon trước để DatHang đối chiếu chính xác ĐVVC 3 tầng & Mã vận đơn
  const shipCount = writeShipmentsSheet(ss, shipments);
  const orderCount = writeOrdersSheet(ss, orders, shipments);
  const invRes = writeInventoryAndBatchesSheets(ss, inventory);

  // Bảo toàn tuyệt đối trang tính NhanSu: chỉ khởi tạo 4 tài khoản gốc nếu trang tính đang trống
  const userSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.USERS);
  let nhanSuPreserved = true;
  if (userSheet && userSheet.getLastRow() <= 1) {
    const defaultUsers = [
      ["USR-001", "dttd", "dttd123", "Đỗ Thị Thuỳ Dung", "TD", "Chuyên viên Vận hành", "Phòng Vận hành Đa kênh", "Ca Hành chính (08:00 - 17:00)", "ACTIVE", true, false, "", "", "2026-10-01 08:00:00"],
      ["USR-002", "lhmt", "lhmt123", "Lê Hoàng Minh Trung", "MT", "Chuyên viên Vận hành (Dự phòng)", "Phòng Vận hành Đa kênh", "Toàn thời gian (Cứu hộ hệ thống)", "ACTIVE", true, true, "", "", "2026-10-05 09:15:00"],
      ["USR-003", "ntqg", "ntqg123", "Nguyễn Thị Quỳnh Giao", "QG", "Chuyên viên Điều phối", "Phòng Điều phối Đơn hàng", "Ca Sáng (07:30 - 16:30)", "ACTIVE", false, false, "", "", "2026-10-10 08:30:00"],
      ["USR-004", "nttn", "nttn123", "Nguyễn Thị Thúy Ngân", "TN", "Quản lý kho", "Bộ phận Kho Vận", "Ca Chiều (13:00 - 21:00)", "ACTIVE", false, false, "", "", "2026-10-12 13:00:00"]
    ];
    userSheet.getRange(2, 1, defaultUsers.length, defaultUsers[0].length).setValues(defaultUsers);
    nhanSuPreserved = false;
  }
  const userCount = userSheet ? Math.max(0, userSheet.getLastRow() - 1) : 0;

  // Ghi nhận vào trang tính NhatKy (không xóa nhật ký cũ nếu đã có)
  const logSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.LOGS);
  if (logSheet) {
    const nextRow = Math.max(2, logSheet.getLastRow() + 1);
    logSheet.getRange(nextRow, 1, 1, ODOMS_CONFIG.HEADERS.NhatKy.length).setValues([
      [
        "LOG-SEED-2026",
        formatNowVN(),
        "dttd",
        "Đỗ Thị Thuỳ Dung",
        "Nạp bộ dữ liệu Thời trang 2026 (01/2026 - 22/11/2026): " +
          invRes.inventoryCount +
          " mã SP, " +
          invRes.batchCount +
          " lô hàng, " +
          orderCount +
          " đơn hàng, " +
          shipCount +
          " vận đơn (bảo toàn NhanSu)",
        "Sổ dữ liệu Google Sheets",
        "SUCCESS"
      ]
    ]);
  }

  return {
    status: "SUCCESS",
    action: "SEED_FASHION_2026",
    message:
      "Đã xóa sạch dữ liệu cũ và nạp trọn bộ 25 mã Thời trang (40 lô hàng), 30 đơn hàng (01/2026 - 22/11/2026) và 10 vận đơn chuẩn ĐVVC 3 tầng lên Google Sheets; bảo toàn nguyên vẹn trang tính NhanSu.",
    details: {
      inventory: invRes.inventoryCount,
      batches: invRes.batchCount,
      orders: orderCount,
      shipments: shipCount,
      users: userCount,
      nhanSuPreserved: nhanSuPreserved
    },
    serverTime: formatNowVN()
  };
}

function parseVNOrderTimeMs_(timeStr) {
  const s = String(timeStr || "").trim();
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmy) {
    return new Date(
      Number(dmy[3]),
      Number(dmy[2]) - 1,
      Number(dmy[1]),
      Number(dmy[4] || 0),
      Number(dmy[5] || 0),
      Number(dmy[6] || 0)
    ).getTime();
  }
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymd) {
    return new Date(
      Number(ymd[1]),
      Number(ymd[2]) - 1,
      Number(ymd[3]),
      Number(ymd[4] || 0),
      Number(ymd[5] || 0),
      Number(ymd[6] || 0)
    ).getTime();
  }
  return 0;
}

function allocateFashionSeedData_(inventory, orders, shipments) {
  const shipmentsIndex = buildShipmentLookupMaps(shipments);
  const invMap = {};
  inventory.forEach(function (item) {
    invMap[item.sku] = item;
  });

  const validOrders = [];
  orders.forEach(function (ord) {
    ord.allocatedBatches = [];
    ord.fifoRank = null;
    ord.customerPhone = normalizePhoneVN(ord.customerPhone);
    const matchedShip = shipmentsIndex.byOrderId[ord.orderId];
    if (matchedShip && matchedShip.trackingCode) {
      ord.trackingCode = matchedShip.trackingCode;
    }
    ord.carrier = resolveOrderCarrierBackend(ord, shipmentsIndex.byOrderId, shipmentsIndex.byTracking);

    if (ord.platformStatus === "CANCELLED") {
      ord.status = "CANCELLED";
      return;
    }
    if (!invMap[ord.sku] || !ord.quantity || ord.quantity <= 0) {
      ord.status = "INVALID";
      return;
    }
    validOrders.push(ord);
  });

  validOrders.sort(function (a, b) {
    return parseVNOrderTimeMs_(a.orderTime) - parseVNOrderTimeMs_(b.orderTime);
  });

  const skuRankCounter = {};
  validOrders.forEach(function (ord) {
    skuRankCounter[ord.sku] = (skuRankCounter[ord.sku] || 0) + 1;
    ord.fifoRank = skuRankCounter[ord.sku];

    if (ord.platformStatus === "UNCONFIRMED") {
      ord.status = "PENDING";
      return;
    }

    const inv = invMap[ord.sku];
    if (inv.availableStock >= ord.quantity) {
      let needQty = ord.quantity;
      const batchDetails = [];
      for (let i = 0; i < inv.batches.length; i++) {
        if (needQty <= 0) break;
        const b = inv.batches[i];
        if (b.remainingQty > 0) {
          const take = Math.min(b.remainingQty, needQty);
          b.remainingQty -= take;
          needQty -= take;
          batchDetails.push({
            batchCode: b.batchCode,
            qrCode: b.qrCode || b.batchCode,
            takenQty: take
          });
        }
      }
      inv.reservedStock += ord.quantity;
      inv.availableStock = inv.physicalStock - inv.reservedStock;
      inv.channelReserved[ord.channel] = (inv.channelReserved[ord.channel] || 0) + ord.quantity;
      ord.status = "ALLOCATED";
      ord.allocatedBatches = batchDetails;
    } else {
      ord.status = "BACKORDER";
    }
  });
}

function getFashion2026InventoryCatalog_() {
  const mkHold = function () {
    return { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 };
  };
  const catalog = [
    // DANH MỤC 1: ÁO (5 SẢN PHẨM)
    {
      sku: "SP-AO-POLO-01",
      name: "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      category: "Áo",
      unit: "Cái",
      price: 250000,
      maxCapacity: 25,
      physicalStock: 10,
      reservedStock: 0,
      availableStock: 10,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-A1", qrCode: "OD-POLO-1001", importDate: "2026-10-01", expiryDate: "2027-10-01", initialQty: 6, remainingQty: 6 },
        { batchCode: "LO-2026-A2", qrCode: "OD-POLO-1010", importDate: "2026-10-10", expiryDate: "2027-10-10", initialQty: 4, remainingQty: 4 }
      ]
    },
    {
      sku: "SP-AO-THUN-02",
      name: "Áo Thun Cotton Oversize Unisex (Trắng - Size M)",
      category: "Áo",
      unit: "Cái",
      price: 190000,
      maxCapacity: 40,
      physicalStock: 25,
      reservedStock: 0,
      availableStock: 25,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-B1", qrCode: "OD-THUN-1002", importDate: "2026-10-02", expiryDate: "2027-10-02", initialQty: 15, remainingQty: 15 },
        { batchCode: "LO-2026-B2", qrCode: "OD-THUN-1012", importDate: "2026-10-12", expiryDate: "2027-10-12", initialQty: 10, remainingQty: 10 }
      ]
    },
    {
      sku: "SP-AO-SOMI-03",
      name: "Áo Sơ Mi Oxford Dài Tay Chống Nhăn (Xanh Nhạt - Size L)",
      category: "Áo",
      unit: "Cái",
      price: 320000,
      maxCapacity: 30,
      physicalStock: 12,
      reservedStock: 0,
      availableStock: 12,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-C1", qrCode: "OD-SOMI-1003", importDate: "2026-10-03", expiryDate: "2027-10-03", initialQty: 12, remainingQty: 12 }
      ]
    },
    {
      sku: "SP-AO-KHOAC-04",
      name: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL)",
      category: "Áo",
      unit: "Cái",
      price: 420000,
      maxCapacity: 20,
      physicalStock: 8,
      reservedStock: 0,
      availableStock: 8,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-D1", qrCode: "OD-KHOAC-1004", importDate: "2026-10-04", expiryDate: "2028-04-04", initialQty: 5, remainingQty: 5 },
        { batchCode: "LO-2026-D2", qrCode: "OD-KHOAC-1014", importDate: "2026-10-14", expiryDate: "2028-04-14", initialQty: 3, remainingQty: 3 }
      ]
    },
    {
      sku: "SP-AO-HOODIE-05",
      name: "Áo Hoodie Nỉ Bông Form Rộng (Nâu - Size L)",
      category: "Áo",
      unit: "Cái",
      price: 390000,
      maxCapacity: 30,
      physicalStock: 14,
      reservedStock: 0,
      availableStock: 14,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-E1", qrCode: "OD-HOOD-1005", importDate: "2026-10-05", expiryDate: "2028-04-05", initialQty: 14, remainingQty: 14 }
      ]
    },
    // DANH MỤC 2: QUẦN (5 SẢN PHẨM)
    {
      sku: "SP-QUAN-JEANS-06",
      name: "Quần Jeans Nam Slim-fit Co Giãn (Xanh Đậm - Size 31)",
      category: "Quần",
      unit: "Chiếc",
      price: 450000,
      maxCapacity: 35,
      physicalStock: 18,
      reservedStock: 0,
      availableStock: 18,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-F1", qrCode: "OD-JEAN-1006", importDate: "2026-10-02", expiryDate: "2028-10-02", initialQty: 10, remainingQty: 10 },
        { batchCode: "LO-2026-F2", qrCode: "OD-JEAN-1015", importDate: "2026-10-15", expiryDate: "2028-10-15", initialQty: 8, remainingQty: 8 }
      ]
    },
    {
      sku: "SP-QUAN-KAKI-07",
      name: "Quần Kaki Chinos Công Sở (Be - Size 30)",
      category: "Quần",
      unit: "Chiếc",
      price: 380000,
      maxCapacity: 30,
      physicalStock: 15,
      reservedStock: 0,
      availableStock: 15,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-G1", qrCode: "OD-KAKI-1007", importDate: "2026-10-04", expiryDate: "2028-04-04", initialQty: 15, remainingQty: 15 }
      ]
    },
    {
      sku: "SP-QUAN-SHORT-08",
      name: "Quần Short Thể Thao Vải Gió (Đen - Size L)",
      category: "Quần",
      unit: "Chiếc",
      price: 180000,
      maxCapacity: 50,
      physicalStock: 30,
      reservedStock: 0,
      availableStock: 30,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-H1", qrCode: "OD-SHRT-1008", importDate: "2026-10-06", expiryDate: "2027-10-06", initialQty: 20, remainingQty: 20 },
        { batchCode: "LO-2026-H2", qrCode: "OD-SHRT-1016", importDate: "2026-10-16", expiryDate: "2027-10-16", initialQty: 10, remainingQty: 10 }
      ]
    },
    {
      sku: "SP-QUAN-TAY-09",
      name: "Quần Tây Âu Ống Đứng Cao Cấp (Xám Than - Size 31)",
      category: "Quần",
      unit: "Chiếc",
      price: 490000,
      maxCapacity: 25,
      physicalStock: 9,
      reservedStock: 0,
      availableStock: 9,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-I1", qrCode: "OD-QTAY-1009", importDate: "2026-10-07", expiryDate: "2028-04-07", initialQty: 9, remainingQty: 9 }
      ]
    },
    {
      sku: "SP-QUAN-JOGGER-10",
      name: "Quần Jogger Thun Nỉ Thể Thao (Ghi Sáng - Size M)",
      category: "Quần",
      unit: "Chiếc",
      price: 290000,
      maxCapacity: 25,
      physicalStock: 12,
      reservedStock: 0,
      availableStock: 12,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-J1", qrCode: "OD-JOGG-1010", importDate: "2026-10-08", expiryDate: "2027-10-08", initialQty: 7, remainingQty: 7 },
        { batchCode: "LO-2026-J2", qrCode: "OD-JOGG-1017", importDate: "2026-10-17", expiryDate: "2027-10-17", initialQty: 5, remainingQty: 5 }
      ]
    },
    // DANH MỤC 3: VÁY & ĐẦM (5 SẢN PHẨM)
    {
      sku: "SP-DAM-MIDI-11",
      name: "Đầm Midi Lụa Xếp Ly Dự Tiệc (Kem - Size S)",
      category: "Váy & Đầm",
      unit: "Chiếc",
      price: 550000,
      maxCapacity: 25,
      physicalStock: 10,
      reservedStock: 0,
      availableStock: 10,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-K1", qrCode: "OD-MIDI-1011", importDate: "2026-10-03", expiryDate: "2027-10-03", initialQty: 6, remainingQty: 6 },
        { batchCode: "LO-2026-K2", qrCode: "OD-MIDI-1013", importDate: "2026-10-13", expiryDate: "2027-10-13", initialQty: 4, remainingQty: 4 }
      ]
    },
    {
      sku: "SP-CHAN-VAY-12",
      name: "Chân Váy Chữ A Công Sở Dáng Ngắn (Đen - Size M)",
      category: "Váy & Đầm",
      unit: "Chiếc",
      price: 260000,
      maxCapacity: 30,
      physicalStock: 16,
      reservedStock: 0,
      availableStock: 16,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-L1", qrCode: "OD-CVAY-1012", importDate: "2026-10-05", expiryDate: "2027-10-05", initialQty: 16, remainingQty: 16 }
      ]
    },
    {
      sku: "SP-DAM-MAXI-13",
      name: "Đầm Maxi Hoa Nhí Voan Mềm (Hồng Pastel - Size M)",
      category: "Váy & Đầm",
      unit: "Chiếc",
      price: 480000,
      maxCapacity: 30,
      physicalStock: 14,
      reservedStock: 0,
      availableStock: 14,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-M1", qrCode: "OD-MAXI-1013", importDate: "2026-10-06", expiryDate: "2027-10-06", initialQty: 8, remainingQty: 8 },
        { batchCode: "LO-2026-M2", qrCode: "OD-MAXI-1018", importDate: "2026-10-18", expiryDate: "2027-10-18", initialQty: 6, remainingQty: 6 }
      ]
    },
    {
      sku: "SP-SET-BLAZER-14",
      name: "Set Vest Blazer Nữ & Chân Váy (Trắng Kem - Size S)",
      category: "Váy & Đầm",
      unit: "Bộ",
      price: 720000,
      maxCapacity: 20,
      physicalStock: 7,
      reservedStock: 0,
      availableStock: 7,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-N1", qrCode: "OD-BLAZ-1014", importDate: "2026-10-09", expiryDate: "2028-04-09", initialQty: 7, remainingQty: 7 }
      ]
    },
    {
      sku: "SP-DAM-THUN-15",
      name: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M)",
      category: "Váy & Đầm",
      unit: "Chiếc",
      price: 240000,
      maxCapacity: 35,
      physicalStock: 20,
      reservedStock: 0,
      availableStock: 20,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-O1", qrCode: "OD-DTHN-1015", importDate: "2026-10-04", expiryDate: "2027-10-04", initialQty: 12, remainingQty: 12 },
        { batchCode: "LO-2026-O2", qrCode: "OD-DTHN-1014", importDate: "2026-10-14", expiryDate: "2027-10-14", initialQty: 8, remainingQty: 8 }
      ]
    },
    // DANH MỤC 4: GIÀY & DÉP (5 SẢN PHẨM)
    {
      sku: "SP-GIAY-SNEAKER-16",
      name: "Giày Sneaker Da Trắng Cổ Thấp (Trắng - Size 41)",
      category: "Giày & Dép",
      unit: "Đôi",
      price: 620000,
      maxCapacity: 30,
      physicalStock: 15,
      reservedStock: 0,
      availableStock: 15,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-P1", qrCode: "OD-SNEK-1016", importDate: "2026-10-02", expiryDate: "2028-10-02", initialQty: 10, remainingQty: 10 },
        { batchCode: "LO-2026-P2", qrCode: "OD-SNEK-1012", importDate: "2026-10-12", expiryDate: "2028-10-12", initialQty: 5, remainingQty: 5 }
      ]
    },
    {
      sku: "SP-GIAY-CHAYBO-17",
      name: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42)",
      category: "Giày & Dép",
      unit: "Đôi",
      price: 750000,
      maxCapacity: 25,
      physicalStock: 11,
      reservedStock: 0,
      availableStock: 11,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-Q1", qrCode: "OD-RUNG-1017", importDate: "2026-10-06", expiryDate: "2028-10-06", initialQty: 11, remainingQty: 11 }
      ]
    },
    {
      sku: "SP-GIAY-LOAFER-18",
      name: "Giày Lười Da Bò Nam Công Sở (Nâu Bò - Size 40)",
      category: "Giày & Dép",
      unit: "Đôi",
      price: 890000,
      maxCapacity: 20,
      physicalStock: 9,
      reservedStock: 0,
      availableStock: 9,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-R1", qrCode: "OD-LOAF-1018", importDate: "2026-10-05", expiryDate: "2029-10-05", initialQty: 6, remainingQty: 6 },
        { batchCode: "LO-2026-R2", qrCode: "OD-LOAF-1015", importDate: "2026-10-15", expiryDate: "2029-10-15", initialQty: 3, remainingQty: 3 }
      ]
    },
    {
      sku: "SP-SANDAL-NU-19",
      name: "Giày Sandal Cao Gót Quai Mảnh 5cm (Be - Size 37)",
      category: "Giày & Dép",
      unit: "Đôi",
      price: 390000,
      maxCapacity: 30,
      physicalStock: 14,
      reservedStock: 0,
      availableStock: 14,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-S1", qrCode: "OD-SAND-1019", importDate: "2026-10-08", expiryDate: "2028-04-08", initialQty: 14, remainingQty: 14 }
      ]
    },
    {
      sku: "SP-DEP-DUC-20",
      name: "Dép Quai Ngang Đúc Nguyên Khối EVA (Đen - Size 41)",
      category: "Giày & Dép",
      unit: "Đôi",
      price: 150000,
      maxCapacity: 50,
      physicalStock: 30,
      reservedStock: 0,
      availableStock: 30,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-T1", qrCode: "OD-DEPE-1020", importDate: "2026-10-01", expiryDate: "2028-10-01", initialQty: 18, remainingQty: 18 },
        { batchCode: "LO-2026-T2", qrCode: "OD-DEPE-1011", importDate: "2026-10-11", expiryDate: "2028-10-11", initialQty: 12, remainingQty: 12 }
      ]
    },
    // DANH MỤC 5: PHỤ KIỆN THỜI TRANG (5 SẢN PHẨM)
    {
      sku: "SP-TUI-DEO-21",
      name: "Túi Đeo Chéo Da PU Chống Nước (Đen)",
      category: "Phụ kiện thời trang",
      unit: "Chiếc",
      price: 340000,
      maxCapacity: 30,
      physicalStock: 15,
      reservedStock: 0,
      availableStock: 15,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-U1", qrCode: "OD-TUID-1021", importDate: "2026-10-03", expiryDate: "2028-10-03", initialQty: 9, remainingQty: 9 },
        { batchCode: "LO-2026-U2", qrCode: "OD-TUID-1013", importDate: "2026-10-13", expiryDate: "2028-10-13", initialQty: 6, remainingQty: 6 }
      ]
    },
    {
      sku: "SP-THAT-LUNG-22",
      name: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen)",
      category: "Phụ kiện thời trang",
      unit: "Chiếc",
      price: 320000,
      maxCapacity: 35,
      physicalStock: 18,
      reservedStock: 0,
      availableStock: 18,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-V1", qrCode: "OD-BELT-1022", importDate: "2026-10-07", expiryDate: "2029-10-07", initialQty: 18, remainingQty: 18 }
      ]
    },
    {
      sku: "SP-NON-KET-23",
      name: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu)",
      category: "Phụ kiện thời trang",
      unit: "Chiếc",
      price: 160000,
      maxCapacity: 40,
      physicalStock: 25,
      reservedStock: 0,
      availableStock: 25,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-W1", qrCode: "OD-NONK-1023", importDate: "2026-10-04", expiryDate: "2028-04-04", initialQty: 15, remainingQty: 15 },
        { batchCode: "LO-2026-W2", qrCode: "OD-NONK-1016", importDate: "2026-10-16", expiryDate: "2028-04-16", initialQty: 10, remainingQty: 10 }
      ]
    },
    {
      sku: "SP-KINH-MAT-24",
      name: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng)",
      category: "Phụ kiện thời trang",
      unit: "Chiếc",
      price: 280000,
      maxCapacity: 25,
      physicalStock: 12,
      reservedStock: 0,
      availableStock: 12,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-X1", qrCode: "OD-KINH-1024", importDate: "2026-10-09", expiryDate: "2028-10-09", initialQty: 12, remainingQty: 12 }
      ]
    },
    {
      sku: "SP-TAT-CO-25",
      name: "Set 5 Đôi Tất Cổ Ngắn Khử Mùi Bamboo (Mix Màu)",
      category: "Phụ kiện thời trang",
      unit: "Hộp",
      price: 120000,
      maxCapacity: 60,
      physicalStock: 40,
      reservedStock: 0,
      availableStock: 40,
      channelReserved: mkHold(),
      batches: [
        { batchCode: "LO-2026-Y1", qrCode: "OD-TATC-1025", importDate: "2026-10-02", expiryDate: "2027-10-02", initialQty: 25, remainingQty: 25 },
        { batchCode: "LO-2026-Y2", qrCode: "OD-TATC-1014", importDate: "2026-10-14", expiryDate: "2027-10-14", initialQty: 15, remainingQty: 15 }
      ]
    }
  ];

  // Bổ sung 24 lô nhập dự trữ cao điểm (15/11/2026 – 22/11/2026, +20 SP/lô) cho 24 mã từ SP-AO-THUN-02 đến SP-TAT-CO-25
  // TUYỆT ĐỐI bảo toàn nguyên vẹn SP-AO-POLO-01 (index 0: đúng 10 cái, 2 lô LO-2026-A1 & LO-2026-A2)
  for (let idx = 1; idx < catalog.length; idx++) {
    const item = catalog[idx];
    const numStr = String(idx + 1).padStart(2, "0");
    const importDay = 15 + ((idx - 1) % 8); // 15/11/2026 -> 22/11/2026
    const dayStr = String(importDay).padStart(2, "0");
    const extraQty = 20;
    item.physicalStock += extraQty;
    item.availableStock += extraQty;
    item.maxCapacity = Math.max(Number(item.maxCapacity || 30), item.physicalStock + 10);
    item.batches.push({
      batchCode: "LO-2026-B" + numStr,
      qrCode: "OD-RESV-11" + numStr,
      importDate: "2026-11-" + dayStr,
      expiryDate: "2028-11-" + dayStr,
      initialQty: extraQty,
      remainingQty: extraQty
    });
  }
  return catalog;
}

function getFashion2026OrdersSeed_() {
  return [
    // SHOPEE (8 đơn — khớp 1:1 với mock_data.js và 2_Don_Hang_Shopee_Mau.csv)
    { orderId: "SP261122001", channel: "SHOPEE", orderTime: "22/11/2026 08:15:10", sku: "SP-AO-POLO-01", productName: "Áo Polo Nam Coolmate Pro (Đen - Size L)", quantity: 4, unitPrice: 250000, customerName: "Nguyễn Văn An", customerPhone: "0901234567", shippingAddress: "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "Ví ShopeePay", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "VD-SP-261122-8801" },
    { orderId: "SP260115002", channel: "SHOPEE", orderTime: "15/01/2026 09:20:00", sku: "SP-AO-THUN-02", productName: "Áo Thun Cotton Oversize Unisex (Trắng - Size M)", quantity: 5, unitPrice: 190000, customerName: "Trần Thị Bích", customerPhone: "0912345678", shippingAddress: "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "VD-SP-260115-1102" },
    { orderId: "SP260318003", channel: "SHOPEE", orderTime: "18/03/2026 14:10:00", sku: "SP-QUAN-JEANS-06", productName: "Quần Jeans Nam Slim-fit Co Giãn (Xanh Đậm - Size 31)", quantity: 4, unitPrice: 450000, customerName: "Lê Hoàng Nam", customerPhone: "0987654321", shippingAddress: "88 Cầu Giấy, Phường Cầu Giấy, TP.Hà Nội", platformStatus: "CONFIRMED", paymentMethod: "Ví ShopeePay", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "" },
    { orderId: "SP260520004", channel: "SHOPEE", orderTime: "20/05/2026 10:35:00", sku: "SP-DAM-MIDI-11", productName: "Đầm Midi Lụa Xếp Ly Dự Tiệc (Kem - Size S)", quantity: 3, unitPrice: 550000, customerName: "Phạm Ngọc Hân", customerPhone: "0905112233", shippingAddress: "210 Phan Xích Long, Phường Cầu Kiệu, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "Ví ShopeePay", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "" },
    { orderId: "SP260812005", channel: "SHOPEE", orderTime: "12/08/2026 16:40:00", sku: "SP-GIAY-SNEAKER-16", productName: "Giày Sneaker Da Trắng Cổ Thấp (Trắng - Size 41)", quantity: 4, unitPrice: 620000, customerName: "Vũ Minh Đức", customerPhone: "0913456789", shippingAddress: "19 Hùng Vương, Phường Thuận Hóa, TP.Huế", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "" },
    { orderId: "SP261106006", channel: "SHOPEE", orderTime: "06/11/2026 11:15:00", sku: "SP-SET-BLAZER-14", productName: "Set Vest Blazer Nữ & Chân Váy (Trắng Kem - Size S)", quantity: 5, unitPrice: 720000, customerName: "Nguyễn Thùy Dương", customerPhone: "0908223344", shippingAddress: "72 Hai Bà Trưng, Phường Hoàn Kiếm, TP.Hà Nội", platformStatus: "CONFIRMED", paymentMethod: "Ví ShopeePay", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "" },
    { orderId: "SP261117007", channel: "SHOPEE", orderTime: "17/11/2026 15:05:00", sku: "SP-AO-KHOAC-04", productName: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL)", quantity: 5, unitPrice: 420000, customerName: "Đặng Thị Thảo", customerPhone: "0933445588", shippingAddress: "78 Quang Trung, Phường Gò Vấp, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "VD-SP-261117-5519" },
    { orderId: "SP261122008", channel: "SHOPEE", orderTime: "22/11/2026 09:25:30", sku: "SP-TUI-DEO-21", productName: "Túi Đeo Chéo Da PU Chống Nước (Đen)", quantity: 3, unitPrice: 340000, customerName: "Trương Gia Huy", customerPhone: "0978123456", shippingAddress: "154 Nguyễn Trãi, Phường Bến Thành, TP.HCM", platformStatus: "UNCONFIRMED", paymentMethod: "Ví ShopeePay", sourceMethod: "EXCEL_IMPORT", carrier: "SPX Express", trackingCode: "" },
    // TIKTOK (7 đơn — khớp 1:1 với mock_data.js và 3_Don_Hang_TikTokShop_Mau.csv)
    { orderId: "TT261122101", channel: "TIKTOK", orderTime: "22/11/2026 08:16:05", sku: "SP-AO-POLO-01", productName: "Áo Polo Nam Coolmate Pro (Đen - Size L)", quantity: 4, unitPrice: 250000, customerName: "Phạm Minh Tuấn", customerPhone: "0933445566", shippingAddress: "56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "VD-TT-261122-4420" },
    { orderId: "TT260214102", channel: "TIKTOK", orderTime: "14/02/2026 10:15:00", sku: "SP-CHAN-VAY-12", productName: "Chân Váy Chữ A Công Sở Dáng Ngắn (Đen - Size M)", quantity: 5, unitPrice: 260000, customerName: "Hoàng Thùy Linh", customerPhone: "0977889900", shippingAddress: "12 Trần Phú, Phường Nha Trang, tỉnh Khánh Hòa", platformStatus: "CONFIRMED", paymentMethod: "Ví ZaloPay", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "" },
    { orderId: "TT260422103", channel: "TIKTOK", orderTime: "22/04/2026 13:50:00", sku: "SP-AO-HOODIE-05", productName: "Áo Hoodie Nỉ Bông Form Rộng (Nâu - Size L)", quantity: 4, unitPrice: 390000, customerName: "Đặng Quốc Khánh", customerPhone: "0966112233", shippingAddress: "90 Lạch Tray, Phường Lê Chân, TP.Hải Phòng", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "" },
    { orderId: "TT260719104", channel: "TIKTOK", orderTime: "19/07/2026 19:20:00", sku: "SP-DAM-MAXI-13", productName: "Đầm Maxi Hoa Nhí Voan Mềm (Hồng Pastel - Size M)", quantity: 5, unitPrice: 480000, customerName: "Lý Thảo Nhi", customerPhone: "0935667788", shippingAddress: "31 Nguyễn Văn Cừ, Phường Ninh Kiều, TP.Cần Thơ", platformStatus: "CONFIRMED", paymentMethod: "Ví ZaloPay", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "" },
    { orderId: "TT261010105", channel: "TIKTOK", orderTime: "10/10/2026 20:15:00", sku: "SP-DEP-DUC-20", productName: "Dép Quai Ngang Đúc Nguyên Khối EVA (Đen - Size 41)", quantity: 8, unitPrice: 150000, customerName: "Phan Anh Khoa", customerPhone: "0942778899", shippingAddress: "64 Lê Duẩn, Phường Buôn Ma Thuột, tỉnh Đắk Lắk", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "" },
    { orderId: "TT261114106", channel: "TIKTOK", orderTime: "14/11/2026 14:30:00", sku: "SP-GIAY-CHAYBO-17", productName: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42)", quantity: 4, unitPrice: 750000, customerName: "Bùi Tiến Dũng", customerPhone: "0983556677", shippingAddress: "102 Trần Hưng Đạo, Phường An Đông, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "VD-TT-261114-4418" },
    { orderId: "TT261120107", channel: "TIKTOK", orderTime: "20/11/2026 16:45:00", sku: "SP-QUAN-JOGGER-10", productName: "Quần Jogger Thun Nỉ Thể Thao (Ghi Sáng - Size M)", quantity: 3, unitPrice: 290000, customerName: "Mai Phương Anh", customerPhone: "0916998877", shippingAddress: "28 Phan Đình Phùng, Phường Ba Đình, TP.Hà Nội", platformStatus: "UNCONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "J&T Express", trackingCode: "" },
    // LAZADA (6 đơn — khớp 1:1 với mock_data.js và 4_Don_Hang_Lazada_Mau.csv)
    { orderId: "LZ261122201", channel: "LAZADA", orderTime: "22/11/2026 08:18:45", sku: "SP-AO-POLO-01", productName: "Áo Polo Nam Coolmate Pro (Đen - Size L)", quantity: 3, unitPrice: 250000, customerName: "Võ Thành Đạt", customerPhone: "0944556677", shippingAddress: "78 Nguyễn Văn Linh, Phường Tân Thuận, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "Thẻ Visa / Mastercard", sourceMethod: "EXCEL_IMPORT", carrier: "GHN (Giao Hàng Nhanh)", trackingCode: "" },
    { orderId: "LZ260308202", channel: "LAZADA", orderTime: "08/03/2026 11:05:00", sku: "SP-AO-SOMI-03", productName: "Áo Sơ Mi Oxford Dài Tay Chống Nhăn (Xanh Nhạt - Size L)", quantity: 4, unitPrice: 320000, customerName: "Nguyễn Quốc Bảo", customerPhone: "0907334455", shippingAddress: "145 Điện Biên Phủ, Phường Gia Định, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "Thẻ Visa / Mastercard", sourceMethod: "EXCEL_IMPORT", carrier: "GHN (Giao Hàng Nhanh)", trackingCode: "" },
    { orderId: "LZ260615203", channel: "LAZADA", orderTime: "15/06/2026 09:40:00", sku: "SP-QUAN-KAKI-07", productName: "Quần Kaki Chinos Công Sở (Be - Size 30)", quantity: 5, unitPrice: 380000, customerName: "Ngô Thanh Vân", customerPhone: "0918273645", shippingAddress: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "GHN (Giao Hàng Nhanh)", trackingCode: "VD-LZ-260615-6603" },
    { orderId: "LZ260909204", channel: "LAZADA", orderTime: "09/09/2026 15:25:00", sku: "SP-SANDAL-NU-19", productName: "Giày Sandal Cao Gót Quai Mảnh 5cm (Be - Size 37)", quantity: 5, unitPrice: 390000, customerName: "Đinh Hồng Nhung", customerPhone: "0939112244", shippingAddress: "51 Nguyễn Văn Thoại, Phường Ngũ Hành Sơn, TP.Đà Nẵng", platformStatus: "CONFIRMED", paymentMethod: "Thẻ Visa / Mastercard", sourceMethod: "EXCEL_IMPORT", carrier: "GHN (Giao Hàng Nhanh)", trackingCode: "" },
    { orderId: "LZ261110205", channel: "LAZADA", orderTime: "10/11/2026 10:12:00", sku: "SP-GIAY-LOAFER-18", productName: "Giày Lười Da Bò Nam Công Sở (Nâu Bò - Size 40)", quantity: 5, unitPrice: 890000, customerName: "Tô Hoàng Long", customerPhone: "0903667799", shippingAddress: "18 Lý Tự Trọng, Phường Sài Gòn, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "Thẻ Visa / Mastercard", sourceMethod: "EXCEL_IMPORT", carrier: "GHN (Giao Hàng Nhanh)", trackingCode: "" },
    { orderId: "LZ261120206", channel: "LAZADA", orderTime: "20/11/2026 13:20:00", sku: "SP-THAT-LUNG-22", productName: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen)", quantity: 5, unitPrice: 320000, customerName: "Hồ Nhật Minh", customerPhone: "0914889922", shippingAddress: "67 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "COD (Thanh toán khi nhận hàng)", sourceMethod: "EXCEL_IMPORT", carrier: "GHN (Giao Hàng Nhanh)", trackingCode: "VD-LZ-261120-9102" },
    // POS & FACEBOOK (9 đơn — khớp 1:1 với mock_data.js và 5_Don_Hang_Facebook_POS_Mau.csv)
    { orderId: "POS261122301", channel: "POS", orderTime: "22/11/2026 08:17:20", sku: "SP-AO-POLO-01", productName: "Áo Polo Nam Coolmate Pro (Đen - Size L)", quantity: 2, unitPrice: 250000, customerName: "Khách lẻ tại Quầy POS Phường Bình Phú", customerPhone: "0909888777", shippingAddress: "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)", platformStatus: "CONFIRMED", paymentMethod: "Tiền mặt tại quầy", sourceMethod: "EXCEL_IMPORT", carrier: "Tại quầy", trackingCode: "" },
    { orderId: "POS260405302", channel: "POS", orderTime: "05/04/2026 15:10:00", sku: "SP-QUAN-SHORT-08", productName: "Quần Short Thể Thao Vải Gió (Đen - Size L)", quantity: 6, unitPrice: 180000, customerName: "Lương Văn Hải (Mua tại quầy)", customerPhone: "0902445566", shippingAddress: "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)", platformStatus: "CONFIRMED", paymentMethod: "Tiền mặt tại quầy", sourceMethod: "EXCEL_IMPORT", carrier: "Tại quầy", trackingCode: "" },
    { orderId: "POS260828303", channel: "POS", orderTime: "28/08/2026 17:30:00", sku: "SP-QUAN-TAY-09", productName: "Quần Tây Âu Ống Đứng Cao Cấp (Xám Than - Size 31)", quantity: 5, unitPrice: 490000, customerName: "Trịnh Công Sơn (Mua tại quầy)", customerPhone: "0915223311", shippingAddress: "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)", platformStatus: "CONFIRMED", paymentMethod: "Chuyển khoản VietQR", sourceMethod: "EXCEL_IMPORT", carrier: "Tại quầy", trackingCode: "" },
    { orderId: "POS261117304", channel: "POS", orderTime: "17/11/2026 10:45:00", sku: "SP-TAT-CO-25", productName: "Set 5 Đôi Tất Cổ Ngắn Khử Mùi Bamboo (Mix Màu)", quantity: 8, unitPrice: 120000, customerName: "Châu Ngọc Lan (Mua tại quầy)", customerPhone: "0938776655", shippingAddress: "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)", platformStatus: "CONFIRMED", paymentMethod: "Tiền mặt tại quầy", sourceMethod: "EXCEL_IMPORT", carrier: "Tại quầy", trackingCode: "" },
    { orderId: "FB260225401", channel: "FACEBOOK", orderTime: "25/02/2026 20:00:00", sku: "SP-DAM-THUN-15", productName: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M)", quantity: 5, unitPrice: 240000, customerName: "Nguyễn Thị Thanh Trúc (Chốt đơn Livestream FB)", customerPhone: "0922334455", shippingAddress: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội", platformStatus: "CONFIRMED", paymentMethod: "Chuyển khoản VietQR", sourceMethod: "EXCEL_IMPORT", carrier: "", trackingCode: "VD-FB-260225-2201" },
    { orderId: "FB260626402", channel: "FACEBOOK", orderTime: "26/06/2026 21:15:00", sku: "SP-NON-KET-23", productName: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu)", quantity: 6, unitPrice: 160000, customerName: "Phạm Quang Vinh (Chốt đơn Livestream FB)", customerPhone: "0979443322", shippingAddress: "85 Cộng Hòa, Phường Bảy Hiền, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "COD (Thu hộ khi giao)", sourceMethod: "EXCEL_IMPORT", carrier: "", trackingCode: "VD-FB-260626-6602" },
    { orderId: "FB261102403", channel: "FACEBOOK", orderTime: "02/11/2026 19:40:00", sku: "SP-KINH-MAT-24", productName: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng)", quantity: 4, unitPrice: 280000, customerName: "Bùi Anh Tuấn (Chốt đơn Livestream FB)", customerPhone: "0928112233", shippingAddress: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội", platformStatus: "CONFIRMED", paymentMethod: "Chuyển khoản VietQR", sourceMethod: "EXCEL_IMPORT", carrier: "", trackingCode: "VD-FB-261102-3351" },
    { orderId: "FB261118404", channel: "FACEBOOK", orderTime: "18/11/2026 20:30:00", sku: "SP-AO-THUN-02", productName: "Áo Thun Cotton Oversize Unisex (Trắng - Size M)", quantity: 4, unitPrice: 190000, customerName: "Lê Ngọc Bích (Inbox Fanpage)", customerPhone: "0965334411", shippingAddress: "112 Cách Mạng Tháng 8, Phường Xuân Hòa, TP.HCM", platformStatus: "CONFIRMED", paymentMethod: "COD (Thu hộ khi giao)", sourceMethod: "EXCEL_IMPORT", carrier: "", trackingCode: "" },
    { orderId: "FB261122405", channel: "FACEBOOK", orderTime: "22/11/2026 08:24:00", sku: "SP-MA-LOI-999", productName: "Áo Khoác Gió — Sai mã sản phẩm", quantity: 2, unitPrice: 350000, customerName: "Đỗ Mỹ Linh", customerPhone: "0938111222", shippingAddress: "15 Hai Bà Trưng, Phường Tân Định, TP.HCM", platformStatus: "CANCELLED", paymentMethod: "COD (Thu hộ khi giao)", sourceMethod: "EXCEL_IMPORT", carrier: "", trackingCode: "" }
  ].concat(generateExtendedFashion2026To2027Seed_().orders);
}

/**
 * Bộ sinh ngẫu nhiên tất định (Deterministic PRNG — Seed cố định 20262027):
 * - Sinh đúng 72 đơn hàng từ 23/11/2026 đến hết 30/06/2027 (nâng tổng đơn từ 30 lên 102 đơn):
 *   + 23/11/2026 – 30/11/2026: 6 đơn (đúng 2 đơn sáng 23/11/2026 lúc 08:35 & 10:15, 4 đơn từ 24/11 đến 30/11/2026)
 *   + 01/12/2026 – 31/12/2026: 12 đơn (cao điểm cuối năm)
 *   + 01/01/2027 – 30/06/2027: 54 đơn (9 đơn/tháng × 6 tháng, kết thúc đúng ngày 30/06/2027)
 * - Chỉ sử dụng 24 mã Thời trang từ SP-AO-THUN-02 đến SP-TAT-CO-25 (TUYỆT ĐỐI không chạm vào SP-AO-POLO-01).
 * - Sinh kèm 25 vận đơn tương ứng (nâng tổng vận đơn từ 10 lên 35 vận đơn).
 */
function generateExtendedFashion2026To2027Seed_() {
  const catalog24 = [
    { sku: "SP-AO-THUN-02", name: "Áo Thun Cotton Oversize Unisex (Trắng - Size M)", price: 190000, batch: "LO-2026-B02" },
    { sku: "SP-AO-SOMI-03", name: "Áo Sơ Mi Oxford Dài Tay Chống Nhăn (Xanh Nhạt - Size L)", price: 320000, batch: "LO-2026-B03" },
    { sku: "SP-AO-KHOAC-04", name: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL)", price: 420000, batch: "LO-2026-B04" },
    { sku: "SP-AO-HOODIE-05", name: "Áo Hoodie Nỉ Bông Form Rộng (Nâu - Size L)", price: 390000, batch: "LO-2026-B05" },
    { sku: "SP-QUAN-JEANS-06", name: "Quần Jeans Nam Slim-fit Co Giãn (Xanh Đậm - Size 31)", price: 450000, batch: "LO-2026-B06" },
    { sku: "SP-QUAN-KAKI-07", name: "Quần Kaki Chinos Công Sở (Be - Size 30)", price: 380000, batch: "LO-2026-B07" },
    { sku: "SP-QUAN-SHORT-08", name: "Quần Short Thể Thao Vải Gió (Đen - Size L)", price: 180000, batch: "LO-2026-B08" },
    { sku: "SP-QUAN-TAY-09", name: "Quần Tây Âu Ống Đứng Cao Cấp (Xám Than - Size 31)", price: 490000, batch: "LO-2026-B09" },
    { sku: "SP-QUAN-JOGGER-10", name: "Quần Jogger Thun Nỉ Thể Thao (Ghi Sáng - Size M)", price: 290000, batch: "LO-2026-B10" },
    { sku: "SP-DAM-MIDI-11", name: "Đầm Midi Lụa Xếp Ly Dự Tiệc (Kem - Size S)", price: 550000, batch: "LO-2026-B11" },
    { sku: "SP-CHAN-VAY-12", name: "Chân Váy Chữ A Công Sở Dáng Ngắn (Đen - Size M)", price: 260000, batch: "LO-2026-B12" },
    { sku: "SP-DAM-MAXI-13", name: "Đầm Maxi Hoa Nhí Voan Mềm (Hồng Pastel - Size M)", price: 480000, batch: "LO-2026-B13" },
    { sku: "SP-SET-BLAZER-14", name: "Set Vest Blazer Nữ & Chân Váy (Trắng Kem - Size S)", price: 720000, batch: "LO-2026-B14" },
    { sku: "SP-DAM-THUN-15", name: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M)", price: 240000, batch: "LO-2026-B15" },
    { sku: "SP-GIAY-SNEAKER-16", name: "Giày Sneaker Da Trắng Cổ Thấp (Trắng - Size 41)", price: 620000, batch: "LO-2026-B16" },
    { sku: "SP-GIAY-CHAYBO-17", name: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42)", price: 750000, batch: "LO-2026-B17" },
    { sku: "SP-GIAY-LOAFER-18", name: "Giày Lười Da Bò Nam Công Sở (Nâu Bò - Size 40)", price: 890000, batch: "LO-2026-B18" },
    { sku: "SP-SANDAL-NU-19", name: "Giày Sandal Cao Gót Quai Mảnh 5cm (Be - Size 37)", price: 390000, batch: "LO-2026-B19" },
    { sku: "SP-DEP-DUC-20", name: "Dép Quai Ngang Đúc Nguyên Khối EVA (Đen - Size 41)", price: 150000, batch: "LO-2026-B20" },
    { sku: "SP-TUI-DEO-21", name: "Túi Đeo Chéo Da PU Chống Nước (Đen)", price: 340000, batch: "LO-2026-B21" },
    { sku: "SP-THAT-LUNG-22", name: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen)", price: 320000, batch: "LO-2026-B22" },
    { sku: "SP-NON-KET-23", name: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu)", price: 160000, batch: "LO-2026-B23" },
    { sku: "SP-KINH-MAT-24", name: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng)", price: 280000, batch: "LO-2026-B24" },
    { sku: "SP-TAT-CO-25", name: "Set 5 Đôi Tất Cổ Ngắn Khử Mùi Bamboo (Mix Màu)", price: 120000, batch: "LO-2026-B25" }
  ];

  const channels = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
  const prefixMap = { SHOPEE: "SP", TIKTOK: "TT", LAZADA: "LZ", POS: "POS", FACEBOOK: "FB" };
  const defaultCarrierMap = {
    SHOPEE: "SPX Express",
    TIKTOK: "J&T Express",
    LAZADA: "GHN (Giao Hàng Nhanh)",
    POS: "Tại quầy",
    FACEBOOK: ""
  };
  const customers = [
    "Nguyễn Hoàng Phúc", "Trần Ngọc Mai", "Lê Quang Khải", "Phạm Thanh Hà", "Võ Minh Khôi",
    "Đặng Bích Phương", "Bùi Quốc Tuấn", "Hoàng Yến Nhi", "Đỗ Gia Bảo", "Ngô Phương Thảo",
    "Dương Tuấn Kiệt", "Lý Khánh Linh", "Trương Minh Quân", "Phan Bảo Ngọc", "Huỳnh Tấn Tài",
    "Mai Thanh Trúc", "Đinh Quốc Việt", "Vương Thảo Vy", "Hồ Anh Dũng", "Châu Minh Thư",
    "Tạ Quang Huy", "Lương Mỹ Duyên", "Cao Tuấn Anh", "Đoàn Ngọc Ánh"
  ];
  const addresses = [
    "245 Nguyễn Thị Minh Khai, Phường Nguyễn Cư Trinh, TP.HCM",
    "118 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM",
    "56 Hoàng Diệu, Phường Hải Châu, TP.Đà Nẵng",
    "102 Phố Huế, Phường Hai Bà Trưng, TP.Hà Nội",
    "89 Nguyễn Văn Linh, Phường Hưng Lợi, TP.Cần Thơ",
    "34 Trần Phú, Phường Lộc Thọ, tỉnh Khánh Hòa",
    "19 Đại lộ Bình Dương, Phường Thủ Dầu Một, tỉnh Bình Dương",
    "77 Điện Biên Phủ, Phường Đa Kao, TP.HCM",
    "150 Cầu Giấy, Phường Quan Hoa, TP.Hà Nội",
    "62 Phan Chu Trinh, Phường Minh An, tỉnh Quảng Nam",
    "208 Võ Văn Ngân, Phường Linh Chiểu, TP.HCM",
    "41 Lê Hồng Phong, Phường Đông Khê, TP.Hải Phòng"
  ];

  // 72 mốc ngày giờ cụ thể từ 23/11/2026 đến 30/06/2027
  const slots = [
    // 1. Giai đoạn 23/11/2026 – 30/11/2026 (6 đơn: đúng 2 đơn sáng 23/11 trước 12:00, 4 đơn từ 24/11 đến 30/11)
    { d: "23/11/2026", t: "08:35:00", yy: "26", mm: "11", dd: "23" },
    { d: "23/11/2026", t: "10:15:00", yy: "26", mm: "11", dd: "23" },
    { d: "24/11/2026", t: "14:20:00", yy: "26", mm: "11", dd: "24" },
    { d: "26/11/2026", t: "09:45:00", yy: "26", mm: "11", dd: "26" },
    { d: "28/11/2026", t: "16:10:00", yy: "26", mm: "11", dd: "28" },
    { d: "30/11/2026", t: "19:30:00", yy: "26", mm: "11", dd: "30" },
    // 2. Tháng 12/2026 (12 đơn cao điểm cuối năm)
    { d: "02/12/2026", t: "09:10:00", yy: "26", mm: "12", dd: "02" },
    { d: "05/12/2026", t: "11:25:00", yy: "26", mm: "12", dd: "05" },
    { d: "07/12/2026", t: "15:40:00", yy: "26", mm: "12", dd: "07" },
    { d: "10/12/2026", t: "10:05:00", yy: "26", mm: "12", dd: "10" },
    { d: "12/12/2026", t: "13:50:00", yy: "26", mm: "12", dd: "12" },
    { d: "15/12/2026", t: "17:15:00", yy: "26", mm: "12", dd: "15" },
    { d: "18/12/2026", t: "08:50:00", yy: "26", mm: "12", dd: "18" },
    { d: "20/12/2026", t: "14:30:00", yy: "26", mm: "12", dd: "20" },
    { d: "22/12/2026", t: "19:05:00", yy: "26", mm: "12", dd: "22" },
    { d: "25/12/2026", t: "10:45:00", yy: "26", mm: "12", dd: "25" },
    { d: "28/12/2026", t: "16:20:00", yy: "26", mm: "12", dd: "28" },
    { d: "30/12/2026", t: "20:10:00", yy: "26", mm: "12", dd: "30" },
    // 3. Tháng 01/2027 (9 đơn)
    { d: "03/01/2027", t: "09:15:00", yy: "27", mm: "01", dd: "03" },
    { d: "06/01/2027", t: "11:30:00", yy: "27", mm: "01", dd: "06" },
    { d: "10/01/2027", t: "14:45:00", yy: "27", mm: "01", dd: "10" },
    { d: "14/01/2027", t: "16:00:00", yy: "27", mm: "01", dd: "14" },
    { d: "17/01/2027", t: "10:20:00", yy: "27", mm: "01", dd: "17" },
    { d: "21/01/2027", t: "13:35:00", yy: "27", mm: "01", dd: "21" },
    { d: "24/01/2027", t: "15:50:00", yy: "27", mm: "01", dd: "24" },
    { d: "27/01/2027", t: "18:25:00", yy: "27", mm: "01", dd: "27" },
    { d: "30/01/2027", t: "20:00:00", yy: "27", mm: "01", dd: "30" },
    // 4. Tháng 02/2027 (9 đơn - tháng 2 có 28 ngày)
    { d: "02/02/2027", t: "08:40:00", yy: "27", mm: "02", dd: "02" },
    { d: "05/02/2027", t: "10:55:00", yy: "27", mm: "02", dd: "05" },
    { d: "09/02/2027", t: "14:10:00", yy: "27", mm: "02", dd: "09" },
    { d: "12/02/2027", t: "16:30:00", yy: "27", mm: "02", dd: "12" },
    { d: "15/02/2027", t: "09:25:00", yy: "27", mm: "02", dd: "15" },
    { d: "18/02/2027", t: "13:15:00", yy: "27", mm: "02", dd: "18" },
    { d: "22/02/2027", t: "15:45:00", yy: "27", mm: "02", dd: "22" },
    { d: "25/02/2027", t: "17:50:00", yy: "27", mm: "02", dd: "25" },
    { d: "28/02/2027", t: "19:20:00", yy: "27", mm: "02", dd: "28" },
    // 5. Tháng 03/2027 (9 đơn)
    { d: "03/03/2027", t: "09:05:00", yy: "27", mm: "03", dd: "03" },
    { d: "07/03/2027", t: "11:40:00", yy: "27", mm: "03", dd: "07" },
    { d: "10/03/2027", t: "14:25:00", yy: "27", mm: "03", dd: "10" },
    { d: "13/03/2027", t: "16:15:00", yy: "27", mm: "03", dd: "13" },
    { d: "15/03/2027", t: "10:30:00", yy: "27", mm: "03", dd: "15" },
    { d: "19/03/2027", t: "13:45:00", yy: "27", mm: "03", dd: "19" },
    { d: "23/03/2027", t: "15:20:00", yy: "27", mm: "03", dd: "23" },
    { d: "27/03/2027", t: "18:10:00", yy: "27", mm: "03", dd: "27" },
    { d: "30/03/2027", t: "20:05:00", yy: "27", mm: "03", dd: "30" },
    // 6. Tháng 04/2027 (9 đơn - tháng 4 có 30 ngày)
    { d: "02/04/2027", t: "08:50:00", yy: "27", mm: "04", dd: "02" },
    { d: "06/04/2027", t: "10:35:00", yy: "27", mm: "04", dd: "06" },
    { d: "10/04/2027", t: "14:00:00", yy: "27", mm: "04", dd: "10" },
    { d: "14/04/2027", t: "16:25:00", yy: "27", mm: "04", dd: "14" },
    { d: "18/04/2027", t: "09:30:00", yy: "27", mm: "04", dd: "18" },
    { d: "21/04/2027", t: "13:55:00", yy: "27", mm: "04", dd: "21" },
    { d: "25/04/2027", t: "15:40:00", yy: "27", mm: "04", dd: "25" },
    { d: "28/04/2027", t: "17:30:00", yy: "27", mm: "04", dd: "28" },
    { d: "30/04/2027", t: "19:15:00", yy: "27", mm: "04", dd: "30" },
    // 7. Tháng 05/2027 (9 đơn)
    { d: "03/05/2027", t: "09:20:00", yy: "27", mm: "05", dd: "03" },
    { d: "07/05/2027", t: "11:10:00", yy: "27", mm: "05", dd: "07" },
    { d: "11/05/2027", t: "14:35:00", yy: "27", mm: "05", dd: "11" },
    { d: "15/05/2027", t: "16:50:00", yy: "27", mm: "05", dd: "15" },
    { d: "19/05/2027", t: "10:05:00", yy: "27", mm: "05", dd: "19" },
    { d: "22/05/2027", t: "13:25:00", yy: "27", mm: "05", dd: "22" },
    { d: "26/05/2027", t: "15:30:00", yy: "27", mm: "05", dd: "26" },
    { d: "29/05/2027", t: "18:00:00", yy: "27", mm: "05", dd: "29" },
    { d: "31/05/2027", t: "20:20:00", yy: "27", mm: "05", dd: "31" },
    // 8. Tháng 06/2027 (9 đơn - tháng 6 có đúng 30 ngày, kết thúc 30/06/2027)
    { d: "02/06/2027", t: "08:45:00", yy: "27", mm: "06", dd: "02" },
    { d: "06/06/2027", t: "10:50:00", yy: "27", mm: "06", dd: "06" },
    { d: "10/06/2027", t: "14:15:00", yy: "27", mm: "06", dd: "10" },
    { d: "14/06/2027", t: "16:40:00", yy: "27", mm: "06", dd: "14" },
    { d: "18/06/2027", t: "09:35:00", yy: "27", mm: "06", dd: "18" },
    { d: "21/06/2027", t: "13:20:00", yy: "27", mm: "06", dd: "21" },
    { d: "25/06/2027", t: "15:55:00", yy: "27", mm: "06", dd: "25" },
    { d: "28/06/2027", t: "18:10:00", yy: "27", mm: "06", dd: "28" },
    { d: "30/06/2027", t: "19:45:00", yy: "27", mm: "06", dd: "30" }
  ];

  // PRNG tất định (LCG seed 20262027)
  let seed = 20262027;
  const nextRand = function (mod) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed % mod;
  };

  const orders = [];
  const shipments = [];
  const phonePrefixes = ["090", "091", "093", "094", "096", "097", "098", "035", "038", "077"];

  for (let i = 0; i < slots.length; i++) {
    const sl = slots[i];
    const channel = channels[i % channels.length];
    const prefix = prefixMap[channel];
    const seqStr = String(501 + i);
    const orderId = prefix + sl.yy + sl.mm + sl.dd + seqStr;
    const item = catalog24[i % catalog24.length];
    const quantity = (i % 2) + 1; // 1 hoặc 2 SP/đơn (tổng mỗi SKU chỉ ~4-5 SP xuyên 72 đơn, luôn nhỏ hơn lượng tồn +20 SP)
    const custName = customers[(i + nextRand(5)) % customers.length];
    const phoneBody = String(1000000 + ((i * 137911 + nextRand(899999)) % 8999999)).slice(0, 7);
    const custPhone = phonePrefixes[i % phonePrefixes.length] + phoneBody;
    const addr =
      channel === "POS"
        ? "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)"
        : addresses[(i + nextRand(3)) % addresses.length];

    let platformStatus = "CONFIRMED";
    if (i === 17 || i === 44) {
      platformStatus = "CANCELLED";
    } else if (i === 5 || i === 35 || i === 68) {
      platformStatus = "UNCONFIRMED";
    }

    let paymentMethod = "COD (Thanh toán khi nhận hàng)";
    if (channel === "POS") {
      paymentMethod = i % 2 === 0 ? "Tiền mặt tại quầy" : "Chuyển khoản VietQR";
    } else if (channel === "SHOPEE") {
      paymentMethod = i % 2 === 0 ? "Ví ShopeePay" : "COD (Thanh toán khi nhận hàng)";
    } else if (channel === "TIKTOK") {
      paymentMethod = i % 2 === 0 ? "COD (Thanh toán khi nhận hàng)" : "Ví ZaloPay";
    } else if (channel === "LAZADA") {
      paymentMethod = i % 2 === 0 ? "Thẻ Visa / Mastercard" : "COD (Thanh toán khi nhận hàng)";
    } else if (channel === "FACEBOOK") {
      paymentMethod = i % 2 === 0 ? "Chuyển khoản VietQR" : "COD (Thu hộ khi giao)";
    }

    let carrier = defaultCarrierMap[channel];
    let trackingCode = "";

    // Sinh 25 vận đơn cho các đơn CONFIRMED ngoài POS (bao gồm cả đơn sáng 23/11/2026 và trải đều đến 30/06/2027)
    const shouldCreateShipment =
      platformStatus === "CONFIRMED" &&
      channel !== "POS" &&
      (i === 0 || i === 1 || i % 2 === 0);

    if (shouldCreateShipment && shipments.length < 25) {
      const shPrefix = channel.slice(0, 2);
      trackingCode = "VD-" + shPrefix + "-" + sl.yy + sl.mm + sl.dd + "-" + String(7101 + shipments.length);
      const effectiveCarrier =
        channel === "FACEBOOK"
          ? i % 2 === 0
            ? "GHTK (Giao Hàng Tiết Kiệm)"
            : "Viettel Post"
          : carrier;
      carrier = effectiveCarrier;

      const shipStatuses = ["DELIVERED", "IN_TRANSIT", "PENDING_PICKUP", "DELIVERED", "IN_TRANSIT"];
      const shipStatus = i <= 1 ? "IN_TRANSIT" : shipStatuses[shipments.length % shipStatuses.length];
      const shipTiers = ["NHANH", "TIEU_CHUAN", "HOA_TOC"];
      const tier = shipTiers[shipments.length % shipTiers.length];
      const fee = shipments.length % 2 === 0 ? 0 : 25000;
      const isCod = paymentMethod.indexOf("COD") !== -1;
      const totalCod = isCod ? quantity * item.price : 0;
      const orderTimeFull = sl.d + " " + sl.t;
      const progressPct = shipStatus === "DELIVERED" ? 100 : shipStatus === "IN_TRANSIT" ? 75 : 25;

      shipments.push({
        trackingCode: trackingCode,
        orderId: orderId,
        channel: channel,
        carrier: effectiveCarrier,
        shippingTier: tier,
        shippingTierLabel: getShippingTierLabelBackend(tier),
        shippingFee: fee,
        isFreeship: fee === 0,
        totalCod: totalCod,
        status: shipStatus,
        statusLabel: getShipmentStatusLabelBackend(shipStatus),
        sender: {
          name: "ODOMS Store — Kho Phường Bình Phú",
          phone: "02877776868",
          address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
        },
        receiver: {
          name: custName,
          phone: custPhone,
          address: addr
        },
        itemsSummary: item.name + " × " + quantity,
        batchCode: item.batch,
        shipperName: "Bưu tá điều phối (" + effectiveCarrier + ")",
        shipperPhone: "0908" + String(200000 + shipments.length * 1423).slice(0, 6),
        currentLocation:
          shipStatus === "DELIVERED"
            ? "Đã giao thành công — Người nhận đã ký nhận đủ kiện hàng"
            : shipStatus === "IN_TRANSIT"
            ? "Đang trên tuyến đường giao đến " + addr
            : "Đã đóng gói tại Kho Phường Bình Phú — Chờ bưu tá nhận hàng",
        progressPercent: progressPct,
        handoverTime: orderTimeFull,
        lastUpdateTime: orderTimeFull,
        timeline: [
          {
            time: sl.t,
            title: "Xuất kho ODOMS & Đóng gói",
            desc: "Đã đóng gói " + quantity + " " + item.name + " từ lô " + item.batch + ".",
            location: "Kho ODOMS Phường Bình Phú"
          }
        ]
      });
    }

    orders.push({
      orderId: orderId,
      channel: channel,
      orderTime: sl.d + " " + sl.t,
      sku: item.sku,
      productName: item.name,
      quantity: quantity,
      unitPrice: item.price,
      customerName: custName,
      customerPhone: custPhone,
      shippingAddress: addr,
      platformStatus: platformStatus,
      paymentMethod: paymentMethod,
      sourceMethod: "EXCEL_IMPORT",
      carrier: carrier,
      trackingCode: trackingCode
    });
  }

  return { orders: orders, shipments: shipments };
}

function getFashion2026ShipmentsSeed_() {
  return [
    {
      trackingCode: "VD-SP-261122-8801",
      orderId: "SP261122001",
      channel: "SHOPEE",
      carrier: "SPX Express",
      shippingTier: "HOA_TOC",
      shippingFee: 0,
      isFreeship: true,
      totalCod: 0,
      status: "IN_TRANSIT",
      receiver: { name: "Nguyễn Văn An", phone: "0901234567", address: "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM" },
      itemsSummary: "Áo Polo Nam Coolmate Pro (Đen - Size L) × 4",
      batchCode: "LO-2026-A1",
      shipperName: "Trần Quốc Bảo (Bưu tá SPX Express)",
      shipperPhone: "0934567890",
      currentLocation: "Đang trên đường phát — Cách người nhận 1.2 km (Gần Ngã tư Lê Lợi - Pasteur, Phường Sài Gòn, TP.HCM)",
      progressPercent: 80,
      handoverTime: "22/11/2026 08:30:15",
      lastUpdateTime: "22/11/2026 14:20:00",
      timeline: [
        { time: "08:15:10", title: "Xuất kho ODOMS & Đóng gói", desc: "Đã xuất kho tại 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "09:00:25", title: "Bưu tá đã nhận hàng", desc: "Bưu tá SPX Express Trần Quốc Bảo đã tiếp nhận kiện hàng tại kho.", location: "186 An Dương Vương, Phường Bình Phú, TP.HCM" },
        { time: "11:15:40", title: "Đến điểm trung chuyển", desc: "Kiện hàng đã qua trung tâm phân loại Trung tâm TP.HCM.", location: "Điểm phân loại SPX Phường Sài Gòn" },
        { time: "13:45:00", title: "Đang trên đường giao", desc: "Bưu tá đang di chuyển phát hàng đến địa chỉ 123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM.", location: "Tuyến đường Lê Lợi - Nguyễn Huệ, Phường Sài Gòn, TP.HCM" }
      ]
    },
    {
      trackingCode: "VD-TT-261122-4420",
      orderId: "TT261122101",
      channel: "TIKTOK",
      carrier: "J&T Express",
      shippingTier: "NHANH",
      shippingFee: 25000,
      isFreeship: false,
      totalCod: 1000000,
      status: "IN_TRANSIT",
      receiver: { name: "Phạm Minh Tuấn", phone: "0933445566", address: "56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM" },
      itemsSummary: "Áo Polo Nam Coolmate Pro (Đen - Size L) × 4 (Chia 2 lô A1 + A2)",
      batchCode: "LO-2026-A1 + LO-2026-A2",
      shipperName: "Lê Minh Tuấn (J&T Express)",
      shipperPhone: "0908776554",
      currentLocation: "Đang giao hàng — Cách người nhận 2.0 km (Khu vực Phường Thủ Đức)",
      progressPercent: 70,
      handoverTime: "22/11/2026 09:10:00",
      lastUpdateTime: "22/11/2026 13:50:00",
      timeline: [
        { time: "08:45:00", title: "Xuất kho ODOMS & Bàn giao", desc: "Xuất từ Kho 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "09:30:10", title: "J&T Express đã nhận", desc: "Kiện hàng đã nhập bưu cục J&T Phường Bình Phú.", location: "Bưu cục J&T Phường Bình Phú" },
        { time: "11:40:20", title: "Chuyển giao bưu cục phát", desc: "Kiện hàng đã tới bưu cục phát Phường Thủ Đức.", location: "Bưu cục J&T Phường Thủ Đức" },
        { time: "13:30:00", title: "Đang giao hàng", desc: "Bưu tá đang gọi khách hẹn nhận tại 56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM.", location: "Đường Võ Văn Ngân, Phường Thủ Đức, TP.HCM" }
      ]
    },
    {
      trackingCode: "VD-LZ-261120-9102",
      orderId: "LZ261120206",
      channel: "LAZADA",
      carrier: "GHN (Giao Hàng Nhanh)",
      shippingTier: "TIEU_CHUAN",
      shippingFee: 0,
      isFreeship: true,
      totalCod: 1600000,
      status: "PENDING_PICKUP",
      receiver: { name: "Hồ Nhật Minh", phone: "0914889922", address: "67 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM" },
      itemsSummary: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen) × 5",
      batchCode: "LO-2026-V1",
      shipperName: "Phạm Văn Hùng (GHN TP.HCM)",
      shipperPhone: "0977123456",
      currentLocation: "Đã đóng gói — Chờ bưu tá GHN tới nhận tại Kho ODOMS Phường Bình Phú",
      progressPercent: 25,
      handoverTime: "20/11/2026 14:15:00",
      lastUpdateTime: "20/11/2026 15:00:00",
      timeline: [
        { time: "20/11 13:55", title: "Duyệt đơn & Đóng gói", desc: "Đã đóng gói 5 Thắt Lưng Nam Da Thật từ lô LO-2026-V1.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "20/11 14:15", title: "Báo đơn vị vận chuyển lấy hàng", desc: "Đã gửi yêu cầu bưu tá GHN tới kho tiếp nhận kiện hàng.", location: "Kho ODOMS Phường Bình Phú" }
      ]
    },
    {
      trackingCode: "VD-FB-261102-3351",
      orderId: "FB261102403",
      channel: "FACEBOOK",
      carrier: "GHTK (Giao Hàng Tiết Kiệm)",
      shippingTier: "NHANH",
      shippingFee: 35000,
      isFreeship: false,
      totalCod: 0,
      status: "PENDING_PICKUP",
      receiver: { name: "Bùi Anh Tuấn", phone: "0928112233", address: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội" },
      itemsSummary: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng) × 4",
      batchCode: "LO-2026-X1",
      shipperName: "Nguyễn Hoàng Hải (Điều phối GHTK)",
      shipperPhone: "0909609200",
      currentLocation: "Đã đóng gói chống sốc — Chờ bưu tá GHTK tới lấy tại 186 An Dương Vương, Phường Bình Phú, TP.HCM",
      progressPercent: 20,
      handoverTime: "02/11/2026 20:10:00",
      lastUpdateTime: "02/11/2026 20:25:00",
      timeline: [
        { time: "02/11 20:05", title: "Duyệt đơn & Đóng gói", desc: "Đã in vận đơn VD-FB-261102-3351 và đóng hộp bảo vệ kính mát.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "02/11 20:25", title: "Báo đơn vị vận chuyển lấy hàng", desc: "Đã gửi yêu cầu bưu tá GHTK ghé kho lấy kiện hàng.", location: "Kho ODOMS Phường Bình Phú" }
      ]
    },
    {
      trackingCode: "VD-SP-261117-5519",
      orderId: "SP261117007",
      channel: "SHOPEE",
      carrier: "SPX Express",
      shippingTier: "TIEU_CHUAN",
      shippingFee: 0,
      isFreeship: true,
      totalCod: 2100000,
      status: "FAILED_RETURNING",
      receiver: { name: "Đặng Thị Thảo", phone: "0933445588", address: "78 Quang Trung, Phường Gò Vấp, TP.HCM" },
      itemsSummary: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL) × 5",
      batchCode: "LO-2026-D1",
      shipperName: "Vũ Đình Trọng (SPX Express)",
      shipperPhone: "0961889900",
      currentLocation: "Bưu tá gọi 3 cuộc không nghe máy — Lưu kho Phường Gò Vấp chờ giao lại lần 2",
      progressPercent: 60,
      handoverTime: "17/11/2026 16:00:00",
      lastUpdateTime: "19/11/2026 15:10:00",
      timeline: [
        { time: "17/11 16:00", title: "Xuất kho ODOMS", desc: "Xuất 5 Áo Khoác Dù từ lô LO-2026-D1 tại Kho Phường Bình Phú.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "18/11 09:00", title: "Nhập kho bưu cục Phường Gò Vấp", desc: "Kiện hàng đã tới bưu cục phát.", location: "Bưu cục SPX Phường Gò Vấp" },
        { time: "19/11 14:30", title: "Giao không thành công lần 1", desc: "Thuê bao không liên lạc được lúc 14:15, 14:22, 14:30.", location: "Đường Quang Trung, Phường Gò Vấp, TP.HCM" },
        { time: "19/11 15:10", title: "Chờ giao lại lần 2", desc: "Kiện hàng lưu tạm tại bưu cục, dự kiến giao lại sáng hôm sau.", location: "Bưu cục SPX Phường Gò Vấp" }
      ]
    },
    {
      trackingCode: "VD-TT-261114-4418",
      orderId: "TT261114106",
      channel: "TIKTOK",
      carrier: "J&T Express",
      shippingTier: "NHANH",
      shippingFee: 28000,
      isFreeship: false,
      totalCod: 3000000,
      status: "IN_TRANSIT",
      receiver: { name: "Bùi Tiến Dũng", phone: "0983556677", address: "102 Trần Hưng Đạo, Phường An Đông, TP.HCM" },
      itemsSummary: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42) × 4",
      batchCode: "LO-2026-Q1",
      shipperName: "Đỗ Thanh Tùng (J&T Express)",
      shipperPhone: "0919334455",
      currentLocation: "Đang giao hàng — Bưu tá đang trên tuyến đường Trần Hưng Đạo, Phường An Đông",
      progressPercent: 75,
      handoverTime: "14/11/2026 15:20:00",
      lastUpdateTime: "16/11/2026 10:40:00",
      timeline: [
        { time: "14/11 15:20", title: "Xuất kho ODOMS & Đóng hộp", desc: "Xuất 4 đôi Giày Chạy Bộ từ lô LO-2026-Q1.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "15/11 08:30", title: "Đến bưu cục Phường An Đông", desc: "Kiện hàng đã hoàn tất phân loại nội thành.", location: "Bưu cục J&T Phường An Đông" },
        { time: "16/11 10:40", title: "Đang giao hàng", desc: "Bưu tá đang giao kiện hàng tới địa chỉ người nhận.", location: "Phường An Đông, TP.HCM" }
      ]
    },
    {
      trackingCode: "VD-SP-260115-1102",
      orderId: "SP260115002",
      channel: "SHOPEE",
      carrier: "SPX Express",
      shippingTier: "TIEU_CHUAN",
      shippingFee: 0,
      isFreeship: true,
      totalCod: 950000,
      status: "DELIVERED",
      receiver: { name: "Trần Thị Bích", phone: "0912345678", address: "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng" },
      itemsSummary: "Áo Thun Cotton Oversize Unisex (Trắng - Size M) × 5",
      batchCode: "LO-2026-B1",
      shipperName: "Nguyễn Tấn Phát (SPX Đà Nẵng)",
      shipperPhone: "0905887766",
      currentLocation: "Đã giao thành công — Khách ký nhận lúc 10:25 ngày 17/01/2026",
      progressPercent: 100,
      handoverTime: "15/01/2026 11:00:00",
      lastUpdateTime: "17/01/2026 10:25:00",
      timeline: [
        { time: "15/01 11:00", title: "Xuất kho ODOMS Phường Bình Phú", desc: "Xuất 5 Áo Thun Cotton Oversize từ lô LO-2026-B1.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "16/01 18:10", title: "Đến kho trung chuyển Đà Nẵng", desc: "Kiện hàng đã tới trung tâm khai thác miền Trung.", location: "Kho SPX TP.Đà Nẵng" },
        { time: "17/01 10:25", title: "Giao thành công", desc: "Khách hàng Trần Thị Bích đã nhận đủ hàng và thanh toán thu hộ.", location: "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng" }
      ]
    },
    {
      trackingCode: "VD-FB-260225-2201",
      orderId: "FB260225401",
      channel: "FACEBOOK",
      carrier: "GHTK (Giao Hàng Tiết Kiệm)",
      shippingTier: "NHANH",
      shippingFee: 32000,
      isFreeship: false,
      totalCod: 0,
      status: "DELIVERED",
      receiver: { name: "Nguyễn Thị Thanh Trúc", phone: "0922334455", address: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội" },
      itemsSummary: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M) × 5",
      batchCode: "LO-2026-O1",
      shipperName: "Trần Văn Mạnh (GHTK Hà Nội)",
      shipperPhone: "0984221100",
      currentLocation: "Đã giao thành công — Khách đã nhận đủ kiện hàng",
      progressPercent: 100,
      handoverTime: "26/02/2026 08:30:00",
      lastUpdateTime: "28/02/2026 15:40:00",
      timeline: [
        { time: "26/02 08:30", title: "Xuất kho ODOMS & Bàn giao GHTK", desc: "Xuất 5 Đầm Thun Suông từ lô LO-2026-O1.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "27/02 20:00", title: "Đến kho khai thác Hà Nội", desc: "Kiện hàng đã đến bưu cục phát Phường Cửa Nam.", location: "Kho GHTK Hà Nội" },
        { time: "28/02 15:40", title: "Giao thành công", desc: "Người nhận Nguyễn Thị Thanh Trúc đã ký nhận hoàn tất.", location: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội" }
      ]
    },
    {
      trackingCode: "VD-LZ-260615-6603",
      orderId: "LZ260615203",
      channel: "LAZADA",
      carrier: "GHN (Giao Hàng Nhanh)",
      shippingTier: "TIEU_CHUAN",
      shippingFee: 0,
      isFreeship: true,
      totalCod: 1900000,
      status: "DELIVERED",
      receiver: { name: "Ngô Thanh Vân", phone: "0918273645", address: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ" },
      itemsSummary: "Quần Kaki Chinos Công Sở (Be - Size 30) × 5",
      batchCode: "LO-2026-G1",
      shipperName: "Phạm Văn Hùng (GHN Cần Thơ)",
      shipperPhone: "0977123456",
      currentLocation: "Đã giao thành công — Khách ký nhận lúc 11:28 ngày 17/06/2026",
      progressPercent: 100,
      handoverTime: "15/06/2026 14:00:00",
      lastUpdateTime: "17/06/2026 11:28:00",
      timeline: [
        { time: "15/06 14:00", title: "Xuất kho ODOMS Phường Bình Phú", desc: "Xuất 5 Quần Kaki Chinos từ lô LO-2026-G1.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "16/06 06:30", title: "Rời trung tâm phân loại TP.HCM", desc: "Kiện hàng lên xe vận chuyển đi Tây Nam Bộ.", location: "Kho trung chuyển GHN Tân Bình" },
        { time: "17/06 07:15", title: "Đến bưu cục Phường An Cư", desc: "Đã tới bưu cục phát Cần Thơ.", location: "Bưu cục GHN Phường An Cư, TP.Cần Thơ" },
        { time: "17/06 11:28", title: "Giao thành công", desc: "Khách hàng Ngô Thanh Vân đã nhận hàng và thanh toán đủ tiền thu hộ.", location: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ" }
      ]
    },
    {
      trackingCode: "VD-FB-260626-6602",
      orderId: "FB260626402",
      channel: "FACEBOOK",
      carrier: "GHTK (Giao Hàng Tiết Kiệm)",
      shippingTier: "TIEU_CHUAN",
      shippingFee: 22000,
      isFreeship: false,
      totalCod: 960000,
      status: "DELIVERED",
      receiver: { name: "Phạm Quang Vinh", phone: "0979443322", address: "85 Cộng Hòa, Phường Bảy Hiền, TP.HCM" },
      itemsSummary: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu) × 6",
      batchCode: "LO-2026-W1",
      shipperName: "Lý Quốc Cường (GHTK TP.HCM)",
      shipperPhone: "0937665544",
      currentLocation: "Đã giao thành công — Hoàn tất thu hộ nội thành TP.HCM",
      progressPercent: 100,
      handoverTime: "27/06/2026 09:00:00",
      lastUpdateTime: "28/06/2026 16:15:00",
      timeline: [
        { time: "27/06 09:00", title: "Xuất kho ODOMS & Bàn giao GHTK", desc: "Xuất 6 Nón Kết Lưỡi Trai từ lô LO-2026-W1.", location: "Kho ODOMS Phường Bình Phú" },
        { time: "28/06 16:15", title: "Giao thành công", desc: "Khách hàng Phạm Quang Vinh đã nhận đủ hàng và thanh toán thu hộ.", location: "85 Cộng Hòa, Phường Bảy Hiền, TP.HCM" }
      ]
    }
  ].concat(generateExtendedFashion2026To2027Seed_().shipments);
}
