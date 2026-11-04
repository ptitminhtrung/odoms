/**
 * =========================================================================================
 * DỰ ÁN: HỆ THỐNG QUẢN LÝ ĐƠN HÀNG ĐA KÊNH THÔNG MINH (ODOMS)
 * TỆP TIN: S:\HTTT\02_REALTIME_BACKEND_SYNC\ODOMS_Backend_API.gs
 * MÔ TẢ:
 *   Backend Serverless trên Google Apps Script kết nối Cơ sở dữ liệu Google Sheets (5 bảng chuẩn)
 *   kế thừa kiến trúc khóa tương tranh LockService & bộ Parser từ FIFO_Engine.gs.
 *   1. Tự động khởi tạo 5 Sheet chuẩn: Orders, Inventory_ATP, Batches, Users_RBAC, AuditLogs.
 *   2. Cổng doGet(e): Trả toàn bộ trạng thái 5 bảng dưới dạng JSON chuẩn cho Web App ODOMS & AppSheet.
 *   3. Cổng doPost(e): Nhận đồng bộ 2 chiều từ Web App (CloudSyncAdapter) và Webhook Postman
 *      với cơ chế khóa độc quyền LockService.getScriptLock() chống xung đột cho <= 10 người dùng.
 * =========================================================================================
 */

const ODOMS_CONFIG = {
  SHEETS: {
    ORDERS: "Orders",
    INVENTORY: "Inventory_ATP",
    BATCHES: "Batches",
    USERS: "Users_RBAC",
    LOGS: "AuditLogs"
  },
  HEADERS: {
    Orders: [
      "orderId",
      "channel",
      "orderTime",
      "sku",
      "productName",
      "quantity",
      "unitPrice",
      "customerName",
      "customerPhone",
      "shippingAddress",
      "platformStatus",
      "paymentMethod",
      "sourceMethod",
      "status",
      "fifoRank",
      "allocatedBatchesJson",
      "trackingCode",
      "updatedAt"
    ],
    Inventory_ATP: [
      "sku",
      "name",
      "category",
      "unit",
      "price",
      "maxCapacity",
      "physicalStock",
      "reservedStock",
      "availableStock",
      "holdShopee",
      "holdTikTok",
      "holdLazada",
      "holdFacebook",
      "holdPOS",
      "updatedAt"
    ],
    Batches: [
      "batchCode",
      "qrCode",
      "sku",
      "importDate",
      "expiryDate",
      "initialQty",
      "remainingQty",
      "updatedAt"
    ],
    Users_RBAC: [
      "id",
      "username",
      "password",
      "fullName",
      "avatar",
      "role",
      "department",
      "shift",
      "status",
      "isRoot",
      "isHiddenBackup",
      "suspendUntil",
      "suspendReason",
      "createdAt"
    ],
    AuditLogs: [
      "id",
      "time",
      "username",
      "fullName",
      "role",
      "action",
      "ip",
      "status"
    ]
  },
  LOCK_TIMEOUT_MS: 30000,
  DEFAULT_SECRET_TOKEN: "ODOMS_SECURE_TOKEN_2026"
};

/**
 * =========================================================================================
 * 1. KHỞI TẠO CƠ SỞ DỮ LIỆU 5 BẢNG CHUẨN TRÊN GOOGLE SHEETS (CHẠY LẦN ĐẦU HOẶC TỰ ĐỘNG)
 * =========================================================================================
 */
function setupODOMSDatabase() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SECRET_TOKEN")) {
    props.setProperty("SECRET_TOKEN", ODOMS_CONFIG.DEFAULT_SECRET_TOKEN);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = Object.values(ODOMS_CONFIG.SHEETS);

  sheetNames.forEach(function (sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = ODOMS_CONFIG.HEADERS[sheetName];
    if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0A2947");
      headerRange.setFontColor("#F3E4C9");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });

  seedDefaultDataIfEmpty(ss);

  return {
    status: "SUCCESS",
    message: "Đã khởi tạo hoàn tất 5 bảng chuẩn ODOMS (Orders, Inventory_ATP, Batches, Users_RBAC, AuditLogs).",
    sheets: sheetNames,
    timestamp: formatNowVN()
  };
}

function ensureSheetsInitialized() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const missing = Object.values(ODOMS_CONFIG.SHEETS).some(function (name) {
    return !ss.getSheetByName(name);
  });
  if (missing) {
    setupODOMSDatabase();
  }
  return ss;
}

function seedDefaultDataIfEmpty(ss) {
  const nowStr = formatNowVN();

  // 1. Seed Inventory_ATP & Batches nếu đang trống
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

  // 2. Seed Users_RBAC nếu đang trống
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

  // 3. Seed AuditLogs nếu đang trống
  const logSheet = ss.getSheetByName(ODOMS_CONFIG.SHEETS.LOGS);
  if (logSheet && logSheet.getLastRow() <= 1) {
    const defaultLogs = [
      ["LOG-INIT-1", nowStr, "dttd", "Đỗ Thị Thuỳ Dung", "Quản lý Điều phối OMS", "Khởi tạo cơ sở dữ liệu 5 bảng trên Google Sheets", "Google Cloud Apps Script", "SUCCESS"]
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
        message: "Đã đồng bộ trạng thái ODOMS lên 5 bảng Google Sheets thành công!",
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
        message: "Đã đồng bộ bảng Users_RBAC và AuditLogs lên Google Sheets.",
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
        const orderId = String(ord.orderId || ord.original_sn || ord["Mã đơn hàng"] || ("OD-" + Date.now())).trim();
        const exists = currentState.orders.some(function (o) {
          return String(o.orderId) === orderId;
        });
        if (!exists) {
          currentState.orders.push({
            orderId: orderId,
            channel: String(ord.channel || ord.channel_id || ord["Sàn TMĐT"] || "SHOPEE").toUpperCase(),
            orderTime: ord.orderTime || formatNowVN(),
            sku: String(ord.sku || ord.internal_sku || ord["SKU phân loại"] || "SP-AO-POLO-01").toUpperCase(),
            productName: ord.productName || ord["Tên sản phẩm"] || "",
            quantity: parseQuantity(ord.quantity || ord.order_qty || ord["Số lượng"] || 1),
            unitPrice: parseCurrencyVND(ord.unitPrice || ord["Đơn giá"] || 250000),
            customerName: ord.customerName || ord["Người Mua"] || "Khách đặt qua Webhook",
            customerPhone: ord.customerPhone || ord["Số điện thoại"] || "N/A",
            shippingAddress: ord.shippingAddress || ord.delivery_city || ord["Địa chỉ nhận hàng"] || "TP.HCM",
            platformStatus: ord.platformStatus || "CONFIRMED",
            paymentMethod: ord.paymentMethod || "COD",
            sourceMethod: "WEBHOOK_API",
            status: ord.status || "ALLOCATED",
            fifoRank: ord.fifoRank || "",
            allocatedBatches: ord.allocatedBatches || [],
            trackingCode: ord.trackingCode || ""
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
 * 4. CÁC HÀM ĐỌC / GHI 5 BẢNG TRÊN GOOGLE SHEETS (BATCH READ / WRITE)
 * =========================================================================================
 */
function readAllSheetsState(ss) {
  const ordersRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.ORDERS);
  const invRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.INVENTORY);
  const batchesRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.BATCHES);
  const usersRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.USERS);
  const logsRaw = readSheetObjects(ss, ODOMS_CONFIG.SHEETS.LOGS);

  const inventory = invRaw.map(function (row) {
    const skuCode = String(row.sku || "").trim();
    const skuBatches = batchesRaw
      .filter(function (b) {
        return String(b.sku || "").trim() === skuCode;
      })
      .map(function (b) {
        return {
          batchCode: String(b.batchCode || ""),
          qrCode: String(b.qrCode || b.batchCode || ""),
          importDate: String(b.importDate || ""),
          expiryDate: String(b.expiryDate || ""),
          initialQty: parseQuantity(b.initialQty),
          remainingQty: parseQuantity(b.remainingQty)
        };
      });

    return {
      sku: skuCode,
      name: String(row.name || ""),
      category: String(row.category || ""),
      unit: String(row.unit || "Cái"),
      price: parseCurrencyVND(row.price),
      maxCapacity: parseQuantity(row.maxCapacity) || 25,
      physicalStock: parseQuantity(row.physicalStock),
      reservedStock: parseQuantity(row.reservedStock),
      availableStock: parseQuantity(row.availableStock),
      channelReserved: {
        SHOPEE: parseQuantity(row.holdShopee),
        TIKTOK: parseQuantity(row.holdTikTok),
        LAZADA: parseQuantity(row.holdLazada),
        FACEBOOK: parseQuantity(row.holdFacebook),
        POS: parseQuantity(row.holdPOS)
      },
      batches: skuBatches
    };
  });

  const orders = ordersRaw.map(function (r) {
    let parsedBatches = [];
    if (r.allocatedBatchesJson) {
      try {
        parsedBatches = JSON.parse(r.allocatedBatchesJson);
      } catch (e) {
        parsedBatches = [];
      }
    }
    return {
      orderId: String(r.orderId || ""),
      channel: String(r.channel || "SHOPEE"),
      orderTime: String(r.orderTime || ""),
      sku: String(r.sku || ""),
      productName: String(r.productName || ""),
      quantity: parseQuantity(r.quantity),
      unitPrice: parseCurrencyVND(r.unitPrice),
      customerName: String(r.customerName || ""),
      customerPhone: String(r.customerPhone || ""),
      shippingAddress: String(r.shippingAddress || ""),
      platformStatus: String(r.platformStatus || "CONFIRMED"),
      paymentMethod: String(r.paymentMethod || "COD"),
      sourceMethod: String(r.sourceMethod || "EXCEL_IMPORT"),
      status: String(r.status || "PENDING"),
      fifoRank: r.fifoRank ? Number(r.fifoRank) : null,
      allocatedBatches: parsedBatches,
      trackingCode: String(r.trackingCode || "")
    };
  });

  const users = usersRaw.map(function (u) {
    return {
      id: String(u.id || ""),
      username: String(u.username || ""),
      password: String(u.password || ""),
      fullName: String(u.fullName || ""),
      avatar: String(u.avatar || "US"),
      role: String(u.role || "Chuyên viên Điều phối"),
      department: String(u.department || "Phòng Vận hành Đa kênh"),
      shift: String(u.shift || "Ca Hành chính (08:00 - 17:00)"),
      status: String(u.status || "ACTIVE"),
      isRoot: u.isRoot === true || String(u.isRoot).toLowerCase() === "true",
      isHiddenBackup: u.isHiddenBackup === true || String(u.isHiddenBackup).toLowerCase() === "true",
      suspendUntil: String(u.suspendUntil || ""),
      suspendReason: String(u.suspendReason || ""),
      createdAt: String(u.createdAt || "")
    };
  });

  return {
    orders: orders,
    inventory: inventory,
    users: users,
    auditLogs: logsRaw
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
  const headers = ODOMS_CONFIG.HEADERS.Orders;
  clearSheetDataRows(sheet, headers);

  if (!orders || orders.length === 0) return 0;
  const nowStr = formatNowVN();
  const rows = orders.map(function (o) {
    return [
      o.orderId || "",
      o.channel || "",
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
      o.sourceMethod || "EXCEL_IMPORT",
      o.status || "PENDING",
      o.fifoRank !== null && o.fifoRank !== undefined ? o.fifoRank : "",
      JSON.stringify(o.allocatedBatches || []),
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
  const invHeaders = ODOMS_CONFIG.HEADERS.Inventory_ATP;
  const batchHeaders = ODOMS_CONFIG.HEADERS.Batches;

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
  const headers = ODOMS_CONFIG.HEADERS.Users_RBAC;
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
  const headers = ODOMS_CONFIG.HEADERS.AuditLogs;
  clearSheetDataRows(sheet, headers);

  if (!logs || logs.length === 0) return 0;
  const limited = logs.slice(0, 100);
  const rows = limited.map(function (l) {
    return [
      l.id || ("LOG-" + Date.now()),
      l.time || formatNowVN(),
      l.username || "system",
      l.fullName || "Hệ thống",
      l.role || "OMS",
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
      if (key) obj[key] = row[c];
    }
    result.push(obj);
  }
  return result;
}

function clearSheetDataRows(sheet, headers) {
  if (!sheet) return;
  if (sheet.getLastRow() === 0 && headers) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
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
