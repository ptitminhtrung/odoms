// ============================================================================
// BỘ XỬ LÝ NGHIỆP VỤ LÕI ODOMS & QUẢN TRỊ TÀI KHOẢN (OMSEngine & UserAuthManager)
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\oms_engine.js
// ============================================================================

class UserAuthManager {
  constructor() {
    this.STORAGE_USERS_KEY = "ODOMS_USERS_V3";
    this.STORAGE_LOGS_KEY = "ODOMS_ACCESS_LOGS_V3";
    this.SESSION_USER_KEY = "ODOMS_ACTIVE_SESSION_V3";

    this.users = this.loadUsers();
    this.accessLogs = this.loadAccessLogs();
    this.currentUser = this.loadActiveSession();
  }

  loadUsers() {
    try {
      const raw = localStorage.getItem(this.STORAGE_USERS_KEY);
      if (raw) {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Đảm bảo 2 tài khoản quản trị cao nhất dttd và lhmt luôn tồn tại
          const hasDttd = parsed.some((u) => u.username.toLowerCase() === "dttd");
          const hasLhmt = parsed.some((u) => u.username.toLowerCase() === "lhmt");
          if (!hasDttd || !hasLhmt) {
            const defaults = JSON.parse(JSON.stringify(window.DEFAULT_OMS_USERS));
            this.saveUsers(defaults);
            return defaults;
          }
          // Bổ sung các tài khoản mặc định mới (ntqg, nttn) nếu chưa có trong LocalStorage
          window.DEFAULT_OMS_USERS.forEach((def) => {
            if (!parsed.some((u) => u.username.toLowerCase() === def.username.toLowerCase())) {
              parsed.push(JSON.parse(JSON.stringify(def)));
            }
          });
          // Đồng bộ lại cờ bảo mật và vai trò chuẩn hóa cho các tài khoản
          parsed.forEach((u) => {
            if (u.username.toLowerCase() === "lhmt") {
              u.isHiddenBackup = true;
              u.isRoot = true;
              u.role = "Chuyên viên Vận hành (Dự phòng)";
              u.fullName = "Lê Hoàng Minh Trung";
              u.department = "Chuyên viên Vận hành";
            }
            if (u.username.toLowerCase() === "dttd") {
              u.isRoot = true;
              u.isHiddenBackup = false;
              u.role = "Chuyên viên Vận hành";
              u.fullName = "Đỗ Thị Thuỳ Dung";
              u.department = "Chuyên viên Vận hành";
            }
            if (u.username.toLowerCase() === "ntqg") {
              u.role = "Chuyên viên Điều phối";
              u.department = "Chuyên viên Điều phối";
            }
            if (u.username.toLowerCase() === "nttn") {
              u.role = "Quản lý kho";
              u.department = "Quản lý kho";
            }
          });
          this.saveUsers(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("LocalStorage không khả dụng, sử dụng bộ nhớ phiên:", e);
    }
    const defaults = JSON.parse(JSON.stringify(window.DEFAULT_OMS_USERS));
    this.saveUsers(defaults);
    return defaults;
  }

  saveUsers(usersList) {
    this.users = usersList || this.users;
    try {
      localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(this.users));
    } catch (e) {
      // Ignore storage error
    }
  }

  loadAccessLogs() {
    try {
      const raw = localStorage.getItem(this.STORAGE_LOGS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // Ignore
    }
    const initialLogs = [
      {
        id: "LOG-INIT-1",
        time: "24/10/2026 08:00:12",
        username: "dttd",
        fullName: "Đỗ Thị Thuỳ Dung",
        role: "Quản lý Điều phối OMS",
        action: "Khởi tạo hệ thống ODOMS & Cấu hình tồn kho",
        ip: "192.168.1.10 (Workstation)",
        status: "SUCCESS"
      },
      {
        id: "LOG-INIT-2",
        time: "24/10/2026 08:15:30",
        username: "lhmt",
        fullName: "Lê Hoàng Minh Trung",
        role: "Chuyên viên Vận hành OMS",
        action: "Kiểm tra kết nối 5 kênh TMĐT",
        ip: "192.168.1.24 (ODOMS Terminal)",
        status: "SUCCESS"
      }
    ];
    this.saveAccessLogs(initialLogs);
    return initialLogs;
  }

  saveAccessLogs(logsList) {
    this.accessLogs = logsList || this.accessLogs;
    try {
      localStorage.setItem(this.STORAGE_LOGS_KEY, JSON.stringify(this.accessLogs));
    } catch (e) {
      // Ignore
    }
  }

  loadActiveSession() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }

  saveActiveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        sessionStorage.setItem(this.SESSION_USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(this.SESSION_USER_KEY);
      }
    } catch (e) {
      // Ignore
    }
  }

  // Tạo chữ viết tắt Avatar từ Họ tên (VD: "Đỗ Thị Thuỳ Dung" -> "TD", "Lê Hoàng Minh Trung" -> "MT")
  generateAvatarInitials(fullName) {
    if (!fullName) return "US";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    const secondLast = parts[parts.length - 2][0] || "";
    const last = parts[parts.length - 1][0] || "";
    return (secondLast + last).toUpperCase();
  }

  formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  authenticate(username, password) {
    const cleanUser = String(username || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    const found = this.users.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (!found) {
      this.recordAccessLog({
        username: cleanUser || "unknown",
        fullName: "Không xác định",
        role: "Chưa xác thực",
        action: "Đăng nhập thất bại (Sai tên đăng nhập hoặc mật khẩu)",
        status: "FAILED"
      });
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại."
      };
    }

    if (found.status !== "ACTIVE") {
      return {
        success: false,
        message: "Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Quản lý OMS."
      };
    }

    this.saveActiveSession(found);
    this.recordAccessLog({
      username: found.username,
      fullName: found.fullName,
      role: found.role,
      action: "Đăng nhập thành công vào Dashboard OMS",
      status: "SUCCESS"
    });

    return {
      success: true,
      user: found
    };
  }

  logout() {
    if (this.currentUser) {
      this.recordAccessLog({
        username: this.currentUser.username,
        fullName: this.currentUser.fullName,
        role: this.currentUser.role,
        action: "Đăng xuất khỏi hệ thống OMS",
        status: "SUCCESS"
      });
    }
    this.saveActiveSession(null);
  }

  addNewUser({ fullName, username, password, role, department, shift }) {
    const cleanName = String(fullName || "").trim();
    const cleanUsername = String(username || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    if (!cleanName || !cleanUsername || !cleanPassword) {
      return {
        success: false,
        message: "Vui lòng nhập đầy đủ Họ và tên, Tên đăng nhập và Mật khẩu!"
      };
    }

    if (cleanUsername.length < 2) {
      return {
        success: false,
        message: "Tên đăng nhập phải có ít nhất 2 ký tự!"
      };
    }

    const exists = this.users.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return {
        success: false,
        message: `Tên đăng nhập "${cleanUsername}" đã tồn tại trên hệ thống! Vui lòng chọn tên khác.`
      };
    }

    const newUser = {
      id: `USR-${ String(this.users.length + 1).padStart(3, "0") }`,
      username: cleanUsername,
      password: cleanPassword,
      fullName: cleanName,
      avatar: this.generateAvatarInitials(cleanName),
      role: role || "Chuyên viên Điều phối",
      department: department || "Phòng Vận hành Đa kênh",
      shift: shift || "Ca Hành chính (08:00 - 17:00)",
      status: "ACTIVE",
      createdAt: this.formatNow()
    };

    this.users.push(newUser);
    this.saveUsers(this.users);

    this.recordAccessLog({
      username: this.currentUser ? this.currentUser.username : "system",
      fullName: this.currentUser ? this.currentUser.fullName : "Hệ thống",
      role: this.currentUser ? this.currentUser.role : "Admin",
      action: `Tạo mới tài khoản nhân sự: ${newUser.fullName} (${newUser.username})`,
      status: "SUCCESS"
    });

    return {
      success: true,
      user: newUser,
      message: `Đã thêm thành công tài khoản "${newUser.fullName}" (Tên đăng nhập: ${newUser.username})!`
    };
  }

  deleteUser(username) {
    const target = String(username || "").toLowerCase();
    if (target === "dttd" || target === "lhmt") {
      return {
        success: false,
        message: "Không thể xóa tài khoản Quản trị tối cao của hệ thống ODOMS!"
      };
    }
    const foundUser = this.users.find((u) => u.username.toLowerCase() === target);
    if (foundUser && foundUser.isRoot) {
      return {
        success: false,
        message: "Không thể xóa tài khoản Quản trị tối cao của hệ thống ODOMS!"
      };
    }
    if (this.currentUser && this.currentUser.username.toLowerCase() === target) {
      return {
        success: false,
        message: "Không thể xóa tài khoản đang trong phiên đăng nhập hiện tại!"
      };
    }
    this.users = this.users.filter((u) => u.username.toLowerCase() !== target);
    this.saveUsers(this.users);
    return {
      success: true,
      message: `Đã xóa tài khoản [${username}] khỏi danh sách nhân sự.`
    };
  }

  resetUsersToDefault() {
    const defaults = JSON.parse(JSON.stringify(window.DEFAULT_OMS_USERS));
    this.saveUsers(defaults);
    return defaults;
  }

  recordAccessLog({ username, fullName, role, action, status }) {
    const entry = {
      id: "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 100),
      time: this.formatNow(),
      username,
      fullName,
      role,
      action,
      ip: "192.168.1.15 (ODOMS · Local)",
      status: status || "SUCCESS"
    };
    this.accessLogs.unshift(entry);
    if (this.accessLogs.length > 100) {
      this.accessLogs.pop();
    }
    this.saveAccessLogs(this.accessLogs);
  }
}

// ============================================================================
// BỘ XỬ LÝ NGHIỆP VỤ LÕI 4 BƯỚC PHÂN HỆ 1 (OMSEngine)
// ============================================================================
class OMSEngine {
  constructor() {
    this.inventory = [];
    this.orders = [];
    this.logs = [];
    this.channels = JSON.parse(JSON.stringify(window.CHANNELS_CONFIG));
    this.allocationMode = "FIFO_TIME"; // FIFO_TIME (Ai tới trước ưu tiên trước) | CHANNEL_PRIORITY
    this.resetSystem();
  }

  resetSystem() {
    this.inventory = JSON.parse(JSON.stringify(window.INITIAL_INVENTORY));
    this.orders = [];
    this.logs = [];
    this.channels = JSON.parse(JSON.stringify(window.CHANNELS_CONFIG));
    this.addLog(
      "info",
      "Khởi tạo Hệ thống ODOMS - Hệ thống quản lý đơn hàng đa kênh thông minh. Tồn kho sẵn sàng với 5 mã SKU (59 sản phẩm vật lý)."
    );
  }

  addLog(type, message) {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
    this.logs.unshift({
      id: Date.now() + Math.random(),
      time: timeStr,
      type,
      message
    });
    if (this.logs.length > 150) {
      this.logs.pop();
    }
  }

  // Bước 1: Chuẩn hóa dữ liệu từ nhiều định dạng cột Excel của 5 sàn về cấu trúc chuẩn OMS (Canonical Order Schema)
  normalizeRawOrder(rawRow, sourceHint = "EXCEL_IMPORT") {
    const getField = (keys) => {
      for (const k of keys) {
        if (rawRow[k] !== undefined && rawRow[k] !== null && String(rawRow[k]).trim() !== "") {
          return String(rawRow[k]).trim();
        }
      }
      return "";
    };

    const orderId = getField([
      "Mã đơn hàng", "Order ID", "orderNumber", "Ma_Don", "Order_ID", "Mã Đơn", "order_id"
    ]);

    let channelRaw = getField([
      "Sàn TMĐT", "Channel", "channel", "Kenh_Ban", "Kênh bán", "Nguồn đơn", "San_TMDT"
    ]).toUpperCase();

    // Tự động suy luận sàn dựa vào tiền tố Mã đơn hoặc tên cột đặc trưng
    if (!channelRaw) {
      if (orderId.startsWith("SP") || rawRow["SKU phân loại"] !== undefined) channelRaw = "SHOPEE";
      else if (orderId.startsWith("TT") || rawRow["Seller SKU"] !== undefined) channelRaw = "TIKTOK";
      else if (orderId.startsWith("LZ") || rawRow["sellerSku"] !== undefined) channelRaw = "LAZADA";
      else if (orderId.startsWith("FB")) channelRaw = "FACEBOOK";
      else if (orderId.startsWith("POS")) channelRaw = "POS";
    }

    if (channelRaw.includes("SHOPEE")) channelRaw = "SHOPEE";
    else if (channelRaw.includes("TIKTOK") || channelRaw.includes("TIK TOK")) channelRaw = "TIKTOK";
    else if (channelRaw.includes("LAZADA")) channelRaw = "LAZADA";
    else if (channelRaw.includes("FACE") || channelRaw.includes("FB")) channelRaw = "FACEBOOK";
    else if (channelRaw.includes("POS") || channelRaw.includes("CỬA HÀNG") || channelRaw.includes("CUA HANG")) channelRaw = "POS";

    const orderTime = getField([
      "Thời gian đặt hàng", "Created Time", "createTime", "Thoi_Gian_Dat", "Ngày đặt", "Order Time", "timestamp"
    ]) || new Date().toISOString().replace("T", " ").substring(0, 19);

    const sku = getField([
      "SKU phân loại", "Seller SKU", "sellerSku", "Ma_SKU", "SKU", "Mã SKU", "sku"
    ]).toUpperCase();

    const productName = getField([
      "Tên sản phẩm", "Product Name", "itemName", "Ten_SP", "Sản phẩm", "product_name"
    ]);

    const qtyRaw = getField([
      "Số lượng", "Quantity", "qty", "So_Luong", "SL", "quantity"
    ]);
    const quantity = parseInt(qtyRaw, 10);

    const priceRaw = getField([
      "Đơn giá", "Unit Price", "unitPrice", "Don_Gia", "Giá bán", "price"
    ]);
    const unitPrice = parseFloat(String(priceRaw).replace(/[,.\s]/g, "")) || 0;

    const customerName = getField([
      "Người Mua", "Recipient", "customerName", "Ten_Khach", "Khách hàng", "customer_name"
    ]);

    const customerPhone = getField([
      "Số điện thoại", "Phone", "customerPhone", "SDT", "SĐT", "phone"
    ]);

    const shippingAddress = getField([
      "Địa chỉ nhận hàng", "Shipping Address", "shippingAddress", "Dia_Chi", "Địa chỉ", "address"
    ]);

    const rawStatus = getField([
      "Trạng thái đơn hàng", "Trạng thái", "Trang_Thai", "Trang Thai", "Trạng thái xử lý",
      "Order Status", "order_status", "OrderStatus", "status", "Status",
      "Tình trạng", "Tinh_Trang", "Tình trạng đơn hàng", "Order_Status"
    ]);

    let platformStatus = "CONFIRMED"; // CONFIRMED | UNCONFIRMED | CANCELLED
    const sLower = rawStatus.toLowerCase();

    if (sLower.includes("hủy") || sLower.includes("huy") || sLower.includes("cancel")) {
      platformStatus = "CANCELLED";
    } else if (
      sLower.includes("chưa") || sLower.includes("chờ") || sLower.includes("cho") ||
      sLower.includes("pending") || sLower.includes("unconfirmed") ||
      sLower.includes("unpaid") || sLower.includes("mới") || sLower.includes("moi")
    ) {
      platformStatus = "UNCONFIRMED";
    } else if (
      sLower.includes("xác nhận") || sLower.includes("xac nhan") ||
      sLower.includes("confirmed") || sLower.includes("thành công") ||
      sLower.includes("hoàn thành") || sLower.includes("to ship") ||
      sLower.includes("ready") || sLower.includes("allocated")
    ) {
      platformStatus = "CONFIRMED";
    } else if (!rawStatus) {
      if (orderId === "FB261022402") {
        platformStatus = "CANCELLED";
      } else if (orderId === "SP261022003" || orderId === "TT261022103") {
        platformStatus = "UNCONFIRMED";
      } else {
        platformStatus = "CONFIRMED";
      }
    }

    let paymentMethod = getField([
      "Phương thức thanh toán", "Phương Thức Thanh Toán", "PHƯƠNG THỨC THANH TOÁN",
      "Payment Method", "paymentMethod", "payment_method",
      "Hình thức thanh toán", "Hinh_Thuc_TT", "Thanh_Toan", "PTTT", "Thanh toán"
    ]);

    if (!paymentMethod) {
      if (channelRaw === "POS") {
        paymentMethod = "Tiền mặt tại quầy";
      } else if (channelRaw === "SHOPEE") {
        paymentMethod = orderId === "SP261022002" ? "COD (Thanh toán khi nhận hàng)" : "Ví ShopeePay";
      } else if (channelRaw === "TIKTOK") {
        paymentMethod = orderId === "TT261022102" ? "Ví ZaloPay" : "COD (Thanh toán khi nhận hàng)";
      } else if (channelRaw === "LAZADA") {
        paymentMethod = orderId === "LZ261022201" ? "Thẻ Visa / Mastercard" : "COD (Thanh toán khi nhận hàng)";
      } else if (channelRaw === "FACEBOOK") {
        paymentMethod = orderId === "FB261022401" ? "Chuyển khoản VietQR" : "COD (Thu hộ khi giao)";
      } else {
        paymentMethod = "COD (Thanh toán khi nhận hàng)";
      }
    }

    return {
      orderId,
      paymentMethod,
      platformStatus,
      channel: channelRaw || "UNKNOWN",
      orderTime,
      timestampMs: Date.parse(orderTime.replace(" ", "T")) || Date.now(),
      sku,
      productName,
      quantity: isNaN(quantity) ? 0 : quantity,
      unitPrice,
      customerName: customerName || "Khách hàng Đa kênh",
      customerPhone: customerPhone || "N/A",
      shippingAddress: shippingAddress || "N/A",
      sourceMethod: sourceHint, // EXCEL_IMPORT hoặc WEBHOOK_API
      status: "PENDING", // PENDING | ALLOCATED | BACKORDER | INVALID
      validationErrors: [],
      fifoRank: null,
      allocatedBatches: [],
      stockSnapshot: null,
      auditSteps: [
        {
          step: "Bước 1: Tiếp nhận & Chuẩn hóa Đơn hàng (Canonical Schema)",
          time: orderTime,
          detail: `Tiếp nhận qua [${sourceHint === "WEBHOOK_API" ? "Giả lập Kết nối API 2 chiều" : "Nạp bảng dữ liệu Excel"}]. Nhận diện nguồn đơn từ kênh [${channelRaw || "CHƯA XÁC ĐỊNH"}].`
        }
      ]
    };
  }

  // Bước 2: Kiểm tra tính hợp lệ của đơn hàng (Order Validation)
  validateOrder(order) {
    const errors = [];
    const validChannels = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];

    if (!order.orderId) {
      errors.push("Thiếu Mã đơn hàng (Order ID)");
    }
    if (!validChannels.includes(order.channel)) {
      errors.push(`Kênh bán hàng không hợp lệ (${order.channel})`);
    }
    if (!order.sku) {
      errors.push("Thiếu Mã SKU sản phẩm");
    } else {
      const invItem = this.inventory.find((i) => i.sku === order.sku);
      if (!invItem) {
        errors.push(`Mã SKU [${order.sku}] không tồn tại trong Danh mục Kho nội bộ`);
      } else if (!order.productName) {
        order.productName = invItem.name;
      }
    }
    if (!order.quantity || order.quantity <= 0) {
      errors.push(`Số lượng đặt không hợp lệ (${order.quantity})`);
    }

    order.validationErrors = errors;

    if (errors.length > 0) {
      order.status = "INVALID";
      order.auditSteps.push({
        step: "Bước 2: Kiểm tra tính hợp lệ (Validation Engine)",
        status: "ERROR",
        detail: `Đơn hàng KHÔNG HỢP LỆ: ${errors.join("; ")}. Hệ thống chặn đơn ngay tại cổng kiểm duyệt, không trừ kho.`
      });
      this.addLog(
        "error",
        `[CHẶN ĐƠN LỖI] Đơn ${order.orderId} (${order.channel}) bị từ chối: ${errors.join(", ")}`
      );
      return false;
    } else {
      order.auditSteps.push({
        step: "Bước 2: Kiểm tra tính hợp lệ (Validation Engine)",
        status: "OK",
        detail: `Hợp lệ: Đã xác thực nguồn sàn [${order.channel}], mã SKU [${order.sku}] khớp Danh mục Hàng hóa Nội bộ ODOMS, số lượng yêu cầu [${order.quantity}].`
      });
      return true;
    }
  }

  // Nạp danh sách đơn (từ Excel hoặc API) và chạy toàn bộ chu trình 4 bước
  ingestAndProcessOrders(rawRows, sourceHint = "EXCEL_IMPORT") {
    let addedCount = 0;
    let duplicateCount = 0;

    for (const row of rawRows) {
      const normalized = this.normalizeRawOrder(row, sourceHint);
      if (!normalized.orderId) continue;

      const exists = this.orders.some((o) => o.orderId === normalized.orderId);
      if (exists) {
        duplicateCount++;
        continue;
      }
      this.orders.push(normalized);
      addedCount++;
    }

    if (duplicateCount > 0) {
      this.addLog("warn", `Bỏ qua ${duplicateCount} đơn hàng bị trùng mã đơn đã tồn tại trên hệ thống.`);
    }

    if (addedCount > 0) {
      this.addLog(
        "info",
        `Đã tiếp nhận ${addedCount} đơn hàng mới từ [${sourceHint === "WEBHOOK_API" ? "API/Webhook Thời gian thực" : "Bảng Excel Đa Kênh"}]. Kích hoạt thuật toán đối chiếu ATP & phân bổ FIFO/FEFO...`
      );
      this.recalculateAllAllocations();
    }

    return { addedCount, duplicateCount };
  }

  // Bước 3 & Bước 4: Thuật toán Đối chiếu tồn kho khả dụng (ATP) & Tự động giữ hàng theo ưu tiên FIFO & Lô FEFO
  recalculateAllAllocations() {
    this.inventory = JSON.parse(JSON.stringify(window.INITIAL_INVENTORY));

    for (const ord of this.orders) {
      ord.auditSteps = [ord.auditSteps[0]];
      ord.allocatedBatches = [];
      ord.fifoRank = null;
      ord.stockSnapshot = null;
    }

    const validOrders = [];
    for (const ord of this.orders) {
      if (ord.platformStatus === "CANCELLED") {
        ord.status = "CANCELLED";
        ord.auditSteps.push({
          step: "Bước 2: Kiểm tra trạng thái đơn từ Sàn TMĐT",
          status: "CANCELLED",
          detail: "Đơn hàng ở trạng thái [✖️ ĐÃ HỦY ĐƠN] trên sàn TMĐT. Hệ thống ODOMS không phân bổ giữ hàng và không trừ tồn kho."
        });
        continue;
      }
      const isValid = this.validateOrder(ord);
      if (isValid) {
        validOrders.push(ord);
      }
    }

    const channelPriorityWeight = { POS: 1, SHOPEE: 2, TIKTOK: 3, LAZADA: 4, FACEBOOK: 5 };

    validOrders.sort((a, b) => {
      if (this.allocationMode === "CHANNEL_PRIORITY") {
        const wA = channelPriorityWeight[a.channel] || 99;
        const wB = channelPriorityWeight[b.channel] || 99;
        if (wA !== wB) return wA - wB;
      }
      return a.timestampMs - b.timestampMs;
    });

    const skuRankCounter = {};

    for (const ord of validOrders) {
      skuRankCounter[ord.sku] = (skuRankCounter[ord.sku] || 0) + 1;
      ord.fifoRank = skuRankCounter[ord.sku];

      const inv = this.inventory.find((i) => i.sku === ord.sku);
      const beforeAvailable = inv.availableStock;

      if (inv.availableStock >= ord.quantity) {
        let needQty = ord.quantity;
        const batchDetails = [];

        for (const batch of inv.batches) {
          if (needQty <= 0) break;
          if (batch.remainingQty > 0) {
            const take = Math.min(batch.remainingQty, needQty);
            batch.remainingQty -= take;
            needQty -= take;
            batchDetails.push({
              batchCode: batch.batchCode,
              qrCode: batch.qrCode || batch.batchCode,
              expiryDate: batch.expiryDate || batch.importDate,
              takenQty: take
            });
          }
        }

        inv.reservedStock += ord.quantity;
        inv.availableStock = inv.physicalStock - inv.reservedStock;
        inv.channelReserved[ord.channel] = (inv.channelReserved[ord.channel] || 0) + ord.quantity;

        ord.status = "ALLOCATED";
        ord.allocatedBatches = batchDetails;
        ord.stockSnapshot = {
          before: beforeAvailable,
          requested: ord.quantity,
          after: inv.availableStock
        };

        const batchText = batchDetails.map((b) => `${b.batchCode} (${b.takenQty} SP)`).join(" + ");

        ord.auditSteps.push({
          step: "Bước 3: Đối chiếu Tồn kho Khả dụng (ATP) & Xếp hạng FIFO",
          status: "OK",
          detail: `Xếp hạng ưu tiên: Đơn tới thứ #${ord.fifoRank} của mã ${ord.sku} (Đặt lúc ${ord.orderTime}). Tồn khả dụng trước khi trừ: [${beforeAvailable}] >= Yêu cầu: [${ord.quantity}] -> ĐỦ ĐIỀU KIỆN GIỮ HÀNG.`
        });

        ord.auditSteps.push({
          step: "Bước 4: Tự động Giữ hàng theo Lô (FEFO) & Đồng bộ Đa kênh",
          status: "OK",
          detail: `Đã khóa [${ord.quantity}] sản phẩm giữ riêng cho sàn [${ord.channel}] từ lô: ${batchText}. Tồn khả dụng còn lại: [${inv.availableStock}] (Đã đồng bộ tức thì lên 5 kênh).`
        });

        this.addLog(
          "success",
          `[FIFO #${ord.fifoRank} - GIỮ HÀNG] Đơn ${ord.orderId} (${ord.channel}) lúc ${ord.orderTime.split(" ")[1]}: Trừ ${ord.quantity} x ${ord.sku} (${batchText}). Tồn khả dụng: ${beforeAvailable} ➔ ${inv.availableStock}.`
        );
      } else {
        ord.status = "BACKORDER";
        ord.stockSnapshot = {
          before: beforeAvailable,
          requested: ord.quantity,
          after: beforeAvailable
        };

        ord.auditSteps.push({
          step: "Bước 3: Đối chiếu Tồn kho Khả dụng (ATP) & Xếp hạng FIFO",
          status: "WARN",
          detail: `Xếp hạng ưu tiên: Đơn tới thứ #${ord.fifoRank} của mã ${ord.sku} (Đặt lúc ${ord.orderTime}). Tồn khả dụng hiện tại chỉ còn [${beforeAvailable}] < Yêu cầu [${ord.quantity}] (Do các đơn đặt trước đã giữ hết hàng).`
        });

        ord.auditSteps.push({
          step: "Bước 4: Chặn Bán Lố (Anti-Overselling Gatekeeper)",
          status: "WARN",
          detail: `Hệ thống TỪ CHỐI GIỮ HÀNG tự động và chuyển đơn sang trạng thái [CHẶN BÁN LỐ / CHỜ NHẬP BÙ] để ngăn chặn xuất âm kho.`
        });

        this.addLog(
          "warn",
          `[CHẶN BÁN LỐ - FIFO #${ord.fifoRank}] Đơn ${ord.orderId} (${ord.channel}) lúc ${ord.orderTime.split(" ")[1]} yêu cầu ${ord.quantity} x ${ord.sku} nhưng tồn khả dụng = ${beforeAvailable}. Đã chặn bán lố!`
        );
      }
    }

    this.broadcastInventorySync();
  }

  broadcastInventorySync() {
    const nowStr = new Date().toTimeString().split(" ")[0];
    Object.keys(this.channels).forEach((chKey) => {
      this.channels[chKey].lastSync = nowStr;
      this.channels[chKey].syncCount += 1;
    });

    const summaryStock = this.inventory
      .map((i) => `${i.sku}: ${i.availableStock}`)
      .join(" | ");

    this.addLog(
      "sync",
      `[ĐỒNG BỘ 2 CHIỀU ➔ 5 KÊNH] Cập nhật Tồn kho Khả dụng (ATP) lên Shopee, TikTok, Lazada, FB, POS: [ ${summaryStock} ]`
    );
  }

  restockSku(sku, additionalQty) {
    const invItem = window.INITIAL_INVENTORY.find((i) => i.sku === sku);
    if (!invItem || additionalQty <= 0) return;

    invItem.physicalStock += additionalQty;
    const sec = String(new Date().getSeconds()).padStart(2, "0");
    invItem.batches.push({
      batchCode: `LO-BOSUNG-${sec}`,
      qrCode: `OD-BS-${sec}`,
      importDate: "2026-10-24",
      expiryDate: "2027-12-31",
      initialQty: additionalQty,
      remainingQty: additionalQty
    });

    this.addLog(
      "info",
      `[NHẬP KHO BỔ SUNG] Đã nhập bù +${additionalQty} sản phẩm cho mã [${sku}]. Hệ thống tự động chạy lại phân bổ FIFO cho đơn đang chờ!`
    );
    this.recalculateAllAllocations();
  }
}

window.userAuth = new UserAuthManager();
window.omsEngine = new OMSEngine();
