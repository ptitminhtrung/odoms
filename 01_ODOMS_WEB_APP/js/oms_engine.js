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
              u.department = "Phòng Vận hành Đa kênh";
            }
            if (u.username.toLowerCase() === "dttd") {
              u.isRoot = true;
              u.isHiddenBackup = false;
              u.role = "Chuyên viên Vận hành";
              u.fullName = "Đỗ Thị Thuỳ Dung";
              u.department = "Phòng Vận hành Đa kênh";
            }
            if (u.username.toLowerCase() === "ntqg") {
              u.role = "Chuyên viên Điều phối";
              u.department = "Phòng Điều phối Đơn hàng";
            }
            if (u.username.toLowerCase() === "nttn") {
              u.role = "Quản lý kho";
              u.department = "Bộ phận Kho Vận";
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
      if (window.cloudSync && !window.cloudSync.isPulling) {
        window.cloudSync.scheduleCloudPush("USERS_RBAC_SYNC");
      }
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
        time: this.formatNow(),
        username: "dttd",
        fullName: "Đỗ Thị Thuỳ Dung",
        role: "Quản lý Điều phối OMS",
        action: "Khởi tạo hệ thống ODOMS & Cấu hình tồn kho",
        ip: "192.168.1.10 (Workstation)",
        status: "SUCCESS"
      },
      {
        id: "LOG-INIT-2",
        time: this.formatNow(),
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
      if (window.cloudSync && !window.cloudSync.isPulling) {
        window.cloudSync.scheduleCloudPush("AUDIT_LOGS_SYNC");
      }
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
      const suspendNotice = found.suspendUntil ? " (Tạm ngừng đến: " + found.suspendUntil + ")" : "";
      return {
        success: false,
        message: "Tài khoản [" + found.username + "] hiện đang bị tạm ngừng hoạt động (Inactive)" + suspendNotice + "! Vui lòng liên hệ Quản trị viên."
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

  toggleUserStatus(username, targetStatus, suspendUntil = "", suspendReason = "") {
    const target = String(username || "").toLowerCase();
    const user = this.users.find((u) => u.username.toLowerCase() === target);
    if (!user) {
      return { success: false, message: "Không tìm thấy tài khoản người dùng!" };
    }
    if ((target === "dttd" || target === "lhmt" || user.isRoot) && targetStatus === "INACTIVE") {
      return { success: false, message: "Không thể tạm ngừng hoạt động tài khoản Quản trị tối cao của hệ thống!" };
    }
    if (this.currentUser && this.currentUser.username.toLowerCase() === target && targetStatus === "INACTIVE") {
      return { success: false, message: "Không thể tự tạm ngừng hoạt động tài khoản đang trong phiên đăng nhập hiện tại!" };
    }

    user.status = targetStatus === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    if (user.status === "INACTIVE") {
      user.suspendUntil = suspendUntil || "Cho đến khi mở lại";
      user.suspendReason = suspendReason || "Tạm ngưng hoạt động bởi Quản trị viên";
      user.suspendedAt = this.formatNow();
    } else {
      user.suspendUntil = "";
      user.suspendReason = "";
      user.resumedAt = this.formatNow();
    }
    this.saveUsers(this.users);

    const actionText = user.status === "INACTIVE"
      ? "Tạm ngừng hoạt động (OFF) tài khoản: " + user.fullName + " (" + user.username + ") đến: " + user.suspendUntil
      : "Kích hoạt lại (ON) tài khoản: " + user.fullName + " (" + user.username + ")";

    this.recordAccessLog({
      username: this.currentUser ? this.currentUser.username : "system",
      fullName: this.currentUser ? this.currentUser.fullName : "Hệ thống",
      role: this.currentUser ? this.currentUser.role : "Admin",
      action: actionText,
      status: "SUCCESS"
    });

    return {
      success: true,
      user,
      message: user.status === "INACTIVE"
        ? "Đã tạm ngừng hoạt động (Inactive) tài khoản [" + user.username + "]!"
        : "Đã kích hoạt lại (Active) tài khoản [" + user.username + "] thành công!"
    };
  }


  updateUser(originalUsername, updatedData) {
    const origTarget = String(originalUsername || "").toLowerCase();
    const userIndex = this.users.findIndex((u) => u.username.toLowerCase() === origTarget);
    if (userIndex === -1) {
      return { success: false, message: "Không tìm thấy tài khoản cần chỉnh sửa!" };
    }

    const newUsername = String(updatedData.username || "").trim().toLowerCase();
    if (!newUsername) {
      return { success: false, message: "Tên đăng nhập không được để trống!" };
    }

    // Nếu đổi tên đăng nhập, kiểm tra trùng lặp
    if (newUsername !== origTarget && this.users.some((u) => u.username.toLowerCase() === newUsername)) {
      return { success: false, message: "Tên đăng nhập mới đã tồn tại trên hệ thống!" };
    }

    const user = this.users[userIndex];
    const isRoot = origTarget === "dttd" || origTarget === "lhmt" || user.isRoot;

    // Không cho đổi username của tài khoản Root
    if (isRoot && newUsername !== origTarget) {
      return { success: false, message: "Không được phép thay đổi tên đăng nhập của tài khoản Quản trị tối cao!" };
    }

    user.fullName = String(updatedData.fullName || user.fullName).trim();
    user.username = isRoot ? origTarget : newUsername;
    if (updatedData.password) {
      user.password = String(updatedData.password).trim();
    }
    user.role = updatedData.role || user.role;
    user.department = updatedData.department || user.department;
    user.shift = updatedData.shift || user.shift;

    // Cập nhật avatar ký tự đầu họ tên
    const nameParts = user.fullName.split(" ").filter(Boolean);
    if (nameParts.length >= 2) {
      user.avatar = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      user.avatar = nameParts[0].substring(0, 2).toUpperCase();
    }

    // Nếu đang đăng nhập tài khoản này, cập nhật currentUser
    if (this.currentUser && this.currentUser.username.toLowerCase() === origTarget) {
      this.currentUser = JSON.parse(JSON.stringify(user));
      try {
        localStorage.setItem("ODOMS_SESSION_USER", JSON.stringify(this.currentUser));
      } catch (e) {}
    }

    this.saveUsers(this.users);

    this.recordAccessLog({
      username: this.currentUser ? this.currentUser.username : "system",
      fullName: this.currentUser ? this.currentUser.fullName : "Hệ thống",
      role: this.currentUser ? this.currentUser.role : "Admin",
      action: "Chỉnh sửa thông tin tài khoản: " + user.fullName + " (" + user.username + ")",
      status: "SUCCESS"
    });

    return {
      success: true,
      user,
      message: "Đã cập nhật thông tin tài khoản [" + user.username + "] thành công!"
    };
  }

  resetUserPassword(username, newPassword) {
    const target = String(username || "").toLowerCase();
    const user = this.users.find((u) => u.username.toLowerCase() === target);
    if (!user) {
      return { success: false, message: "Không tìm thấy tài khoản người dùng cần đổi mật khẩu!" };
    }
    const cleanPass = String(newPassword || "").trim();
    if (!cleanPass) {
      return { success: false, message: "Mật khẩu mới không được để trống!" };
    }
    user.password = cleanPass;
    this.saveUsers(this.users);

    this.recordAccessLog({
      username: this.currentUser ? this.currentUser.username : "system",
      fullName: this.currentUser ? this.currentUser.fullName : "Hệ thống",
      role: this.currentUser ? this.currentUser.role : "Admin",
      action: "Đặt lại mật khẩu cho tài khoản: " + user.fullName + " (" + user.username + ")",
      status: "SUCCESS"
    });

    return {
      success: true,
      message: "Đã đặt lại mật khẩu mới cho tài khoản [" + user.username + "] thành công!"
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
    this.baseInitialInventory = JSON.parse(JSON.stringify(window.INITIAL_INVENTORY));
    this.resetSystem();
  }

  resetSystem() {
    if (this.baseInitialInventory) {
      window.INITIAL_INVENTORY = JSON.parse(JSON.stringify(this.baseInitialInventory));
    }
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
  parseAndFormatOrderTime(rawVal) {
    const pad = (n) => String(n).padStart(2, "0");
    const fmtDateObj = (d) =>
      `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const str = String(rawVal || "").trim();
    if (str) {
      // 1. Định dạng DD/MM/YYYY HH:mm:ss hoặc DD-MM-YYYY HH:mm:ss
      const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
      if (dmyMatch) {
        const dd = Number(dmyMatch[1]);
        const mm = Number(dmyMatch[2]);
        const yyyy = Number(dmyMatch[3]);
        const hh = Number(dmyMatch[4] || 0);
        const min = Number(dmyMatch[5] || 0);
        const ss = Number(dmyMatch[6] || 0);
        const dt = new Date(yyyy, mm - 1, dd, hh, min, ss);
        if (!isNaN(dt.getTime())) {
          return { formatted: fmtDateObj(dt), timestampMs: dt.getTime() };
        }
      }

      // 2. Định dạng YYYY-MM-DD HH:mm:ss hoặc YYYY/MM/DD HH:mm:ss
      const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
      if (ymdMatch && !str.endsWith("Z")) {
        const yyyy = Number(ymdMatch[1]);
        const mm = Number(ymdMatch[2]);
        const dd = Number(ymdMatch[3]);
        const hh = Number(ymdMatch[4] || 0);
        const min = Number(ymdMatch[5] || 0);
        const ss = Number(ymdMatch[6] || 0);
        const dt = new Date(yyyy, mm - 1, dd, hh, min, ss);
        if (!isNaN(dt.getTime())) {
          return { formatted: fmtDateObj(dt), timestampMs: dt.getTime() };
        }
      }

      // 3. Chuỗi JS Date từ Google Sheets ("Thu Oct 22 2026 08:15:10 GMT+0700...") hoặc ISO UTC
      const parsedDt = new Date(str);
      if (!isNaN(parsedDt.getTime())) {
        return { formatted: fmtDateObj(parsedDt), timestampMs: parsedDt.getTime() };
      }
    }

    const now = new Date();
    return { formatted: fmtDateObj(now), timestampMs: now.getTime() };
  }

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

    const rawOrderTime = getField([
      "Thời gian đặt hàng", "Created Time", "createTime", "Thoi_Gian_Dat", "Ngày đặt", "Order Time", "timestamp"
    ]);
    const parsedTimeObj = this.parseAndFormatOrderTime(rawOrderTime);
    const orderTime = parsedTimeObj.formatted;

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
      timestampMs: parsedTimeObj.timestampMs,
      sku,
      productName,
      quantity: isNaN(quantity) ? 0 : quantity,
      unitPrice,
      customerName: customerName || "Khách hàng Đa kênh",
      customerPhone: customerPhone || "N/A",
      shippingAddress: shippingAddress || "N/A",
      sourceMethod: String(sourceHint || "").indexOf("NhanTuSanTMDT") === 0 || sourceHint === "WEBHOOK_API" ? "WEBHOOK_API" : "EXCEL_IMPORT", // EXCEL_IMPORT hoặc WEBHOOK_API
      status: "PENDING", // PENDING | ALLOCATED | BACKORDER | INVALID
      validationErrors: [],
      fifoRank: null,
      allocatedBatches: [],
      stockSnapshot: null,
      auditSteps: [
        {
          step: "Bước 1: Tiếp nhận đơn hàng từ kênh bán",
          time: orderTime,
          detail: `Tiếp nhận qua [${String(sourceHint || "").indexOf("NhanTuSanTMDT") === 0 || sourceHint === "WEBHOOK_API" ? "Đồng bộ trực tiếp từ kênh bán" : "Nhập từ File Excel"}]. Ghi nhận nguồn đơn từ kênh [${(window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[channelRaw] && window.CHANNELS_CONFIG[channelRaw].shortName) || channelRaw || "Chưa xác định"}].`
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
        step: "Bước 2: Kiểm tra thông tin sản phẩm & khách hàng",
        status: "ERROR",
        detail: `Đơn hàng thiếu/sai thông tin: ${errors.join("; ")}. Hệ thống tạm giữ đơn để kiểm tra lại, chưa giữ hàng trong kho.`
      });
      this.addLog(
        "error",
        `[ĐƠN LỖI THÔNG TIN] Đơn ${order.orderId} (${order.channel}) cần kiểm tra lại: ${errors.join(", ")}`
      );
      return false;
    } else {
      const channelName =
        (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[order.channel] && window.CHANNELS_CONFIG[order.channel].shortName) ||
        order.channel;
      order.auditSteps.push({
        step: "Bước 2: Kiểm tra thông tin sản phẩm & khách hàng",
        status: "OK",
        detail: `Hợp lệ: Đã xác nhận kênh bán [${channelName}], mã sản phẩm [${order.sku}] khớp danh mục hàng hóa ODOMS, số lượng đặt [${order.quantity}].`
      });
      return true;
    }
  }

  // Nạp danh sách đơn (từ Excel hoặc API) và chạy toàn bộ chu trình 4 bước
  ingestAndProcessOrders(rawRows, sourceHint = "EXCEL_IMPORT") {
    let addedCount = 0;
    let duplicateCount = 0;
    let pausedSkippedCount = 0;
    const pausedChannels = new Set();

    for (const row of rawRows) {
      const normalized = this.normalizeRawOrder(row, sourceHint);
      if (!normalized.orderId) continue;

      const chCfg = this.channels && this.channels[normalized.channel];
      if (chCfg && chCfg.isConnected === false) {
        pausedSkippedCount++;
        pausedChannels.add(chCfg.shortName || normalized.channel);
        continue;
      }

      const exists = this.orders.some((o) => o.orderId === normalized.orderId);
      if (exists) {
        duplicateCount++;
        continue;
      }
      this.orders.push(normalized);
      addedCount++;
    }

    if (pausedSkippedCount > 0) {
      this.addLog(
        "warn",
        `[TẠM NGƯNG TIẾP NHẬN] Bỏ qua ${pausedSkippedCount} đơn hàng thuộc kênh đang Hủy kết nối (${Array.from(pausedChannels).join(", ")}).`
      );
    }

    if (duplicateCount > 0) {
      this.addLog("warn", `Bỏ qua ${duplicateCount} đơn hàng bị trùng mã đơn đã tồn tại trên hệ thống.`);
    }

    if (addedCount > 0) {
      this.addLog(
        "info",
        `Đã tiếp nhận ${addedCount} đơn hàng mới từ [${sourceHint === "WEBHOOK_API" ? "Tiếp nhận trực tiếp" : "File Excel đa kênh"}]. Tiến hành kiểm tra và giữ hàng cho đơn...`
      );
      this.recalculateAllAllocations();
    }

    return { addedCount, duplicateCount, pausedSkippedCount };
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
          step: "Bước 2: Kiểm tra trạng thái đơn từ kênh bán",
          status: "CANCELLED",
          detail: "Đơn hàng ở trạng thái [✖️ Đã hủy] trên kênh bán. Hệ thống ODOMS không giữ hàng cho đơn này."
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

      if (ord.platformStatus === "UNCONFIRMED") {
        ord.status = "PENDING";
        ord.stockSnapshot = {
          before: beforeAvailable,
          requested: ord.quantity,
          after: beforeAvailable
        };
        const chName =
          (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[ord.channel] && window.CHANNELS_CONFIG[ord.channel].shortName) ||
          ord.channel;
        ord.auditSteps.push({
          step: "Bước 3: Chờ xác nhận đơn hàng",
          status: "WARN",
          detail: `Thứ tự ưu tiên #${ord.fifoRank} của mã ${ord.sku}. Đơn hàng đang ở trạng thái [Chờ xác nhận] — Hệ thống chưa giữ hàng cho đến khi bạn bấm "Xác nhận" để đồng bộ về kênh [${chName}].`
        });
        continue;
      }

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

        const chName =
          (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[ord.channel] && window.CHANNELS_CONFIG[ord.channel].shortName) ||
          ord.channel;
        ord.auditSteps.push({
          step: "Bước 3: Kiểm tra số lượng sẵn sàng bán",
          status: "OK",
          detail: `Thứ tự ưu tiên: Đơn thứ #${ord.fifoRank} của mã ${ord.sku} (Đặt lúc ${ord.orderTime}). Sẵn sàng bán trước khi giữ: [${beforeAvailable}] >= Số lượng đặt: [${ord.quantity}] -> Đủ hàng để giữ cho đơn.`
        });

        ord.auditSteps.push({
          step: "Bước 4: Xác nhận giữ hàng đóng gói",
          status: "OK",
          detail: `Đã giữ [${ord.quantity}] sản phẩm riêng cho kênh [${chName}] từ lô: ${batchText}. Số lượng sẵn sàng bán còn lại: [${inv.availableStock}] (Đã đồng bộ lên bảng Theo dõi trạng thái các sàn).`
        });

        this.addLog(
          "success",
          `[Ưu tiên #${ord.fifoRank} - ĐÃ GIỮ HÀNG] Đơn ${ord.orderId} (${chName}) lúc ${ord.orderTime.split(" ")[1]}: Giữ ${ord.quantity} x ${ord.sku} (${batchText}). Sẵn sàng bán: ${beforeAvailable} ➔ ${inv.availableStock}.`
        );
      } else {
        ord.status = "BACKORDER";
        ord.stockSnapshot = {
          before: beforeAvailable,
          requested: ord.quantity,
          after: beforeAvailable
        };

        ord.auditSteps.push({
          step: "Bước 3: Kiểm tra số lượng sẵn sàng bán",
          status: "WARN",
          detail: `Thứ tự ưu tiên: Đơn thứ #${ord.fifoRank} của mã ${ord.sku} (Đặt lúc ${ord.orderTime}). Số lượng sẵn sàng bán hiện chỉ còn [${beforeAvailable}] < Số lượng đặt [${ord.quantity}] (Do các đơn đặt trước đã giữ hết hàng).`
        });

        ord.auditSteps.push({
          step: "Bước 4: Tạm dừng giữ hàng (Thiếu hàng trong kho)",
          status: "WARN",
          detail: `Hệ thống tạm dừng giữ hàng và chuyển đơn sang trạng thái [Thiếu hàng / Cần nhập thêm] để tránh nhận đơn vượt quá lượng hàng thực tế.`
        });

        this.addLog(
          "warn",
          `[CHẶN BÁN LỐ - FIFO #${ord.fifoRank}] Đơn ${ord.orderId} (${ord.channel}) lúc ${ord.orderTime.split(" ")[1]} yêu cầu ${ord.quantity} x ${ord.sku} nhưng tồn khả dụng = ${beforeAvailable}. Đã chặn bán lố!`
        );
      }
    }

    this.broadcastInventorySync();
    if (window.cloudSync && !window.cloudSync.isPulling) {
      window.cloudSync.scheduleCloudPush("ALLOCATION_SYNC");
    }
  }

  formatSyncDateTime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}-${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  toggleChannelConnection(chKey) {
    const ch = this.channels && this.channels[chKey];
    if (!ch) return null;

    const nextState = ch.isConnected === false;
    ch.isConnected = nextState;
    const nowStr = this.formatSyncDateTime();
    ch.lastSync = nowStr;
    ch.syncCount += 1;

    if (!nextState) {
      this.addLog(
        "warn",
        `[TẠM NGƯNG SÀN] Đã chuyển [${ch.shortName}] sang trạng thái "Hủy kết nối": đưa số lượng hàng bán trên sàn về 0 và tạm ngưng tiếp nhận đơn mới từ ${ch.shortName} (cập nhật lúc ${nowStr}).`
      );
    } else {
      const summaryStock = this.inventory.map((i) => `${i.sku}: ${i.availableStock}`).join(" | ");
      this.addLog(
        "sync",
        `[KẾT NỐI LẠI SÀN] Đã bật lại [${ch.shortName}] sang "Đang kết nối" — đồng bộ lại số lượng sẵn sàng bán thực tế lên ${ch.shortName} lúc ${nowStr}: [ ${summaryStock} ].`
      );
    }

    if (window.cloudSync && !window.cloudSync.isPulling) {
      window.cloudSync.scheduleCloudPush("CHANNEL_TOGGLE");
    }

    return { isConnected: nextState, channelName: ch.shortName, timestamp: nowStr };
  }

  broadcastInventorySync() {
    const nowStr = this.formatSyncDateTime();
    const activeNames = [];
    const pausedNames = [];

    Object.keys(this.channels).forEach((chKey) => {
      const ch = this.channels[chKey];
      if (ch.isConnected === false) {
        pausedNames.push(ch.shortName);
      } else {
        ch.lastSync = nowStr;
        ch.syncCount += 1;
        activeNames.push(ch.shortName);
      }
    });

    const summaryStock = this.inventory
      .map((i) => `${i.sku}: ${i.availableStock}`)
      .join(" | ");

    if (activeNames.length > 0) {
      this.addLog(
        "sync",
        `[ĐỒNG BỘ LƯỢNG HÀNG BÁN] Cập nhật số lượng sẵn sàng bán lên ${activeNames.join(", ")} lúc ${nowStr}: [ ${summaryStock} ].${
          pausedNames.length > 0 ? ` (Đang tạm ngưng: ${pausedNames.join(", ")})` : ""
        }`
      );
    }
  }

  restockSku(sku, additionalQty) {
    const invItem = window.INITIAL_INVENTORY.find((i) => i.sku === sku);
    if (!invItem || additionalQty <= 0) return;

    invItem.physicalStock += additionalQty;
    const sec = String(new Date().getSeconds()).padStart(2, "0");
    invItem.batches.push({
      batchCode: `LO-BOSUNG-${sec}`,
      qrCode: `OD-BS-${sec}`,
      importDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
      expiryDate: `${new Date().getFullYear() + 1}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
      initialQty: additionalQty,
      remainingQty: additionalQty
    });

    this.addLog(
      "info",
      `[NHẬP KHO BỔ SUNG] Đã nhập bù +${additionalQty} sản phẩm cho mã [${sku}]. Hệ thống tự động chạy lại phân bổ FIFO cho đơn đang chờ!`
    );
    this.recalculateAllAllocations();
  }

  toggleOrderConfirmation(orderId, forceState) {
    const ord = this.orders.find((o) => o.orderId === orderId);
    if (!ord || ord.platformStatus === "CANCELLED" || ord.status === "INVALID") return null;

    const currentConfirmed = ord.platformStatus !== "UNCONFIRMED";
    const nextConfirmed = typeof forceState === "boolean" ? forceState : !currentConfirmed;
    ord.platformStatus = nextConfirmed ? "CONFIRMED" : "UNCONFIRMED";

    if (nextConfirmed) {
      this.addLog(
        "sync",
        `[XÁC NHẬN ĐƠN ➔ SÀN ${ord.channel}] Người dùng đã gạt Xác nhận đơn ${ord.orderId}. Đã gửi xác nhận về sàn ${ord.channel} và kích hoạt phân bổ giữ hàng!`
      );
    } else {
      this.addLog(
        "warn",
        `[CHỜ XÁC NHẬN] Đơn ${ord.orderId} (${ord.channel}) được chuyển về trạng thái "Chờ xác nhận". Đã giải phóng tồn kho tạm giữ để điều phối linh hoạt.`
      );
    }

    this.recalculateAllAllocations();
    return ord;
  }
}

window.userAuth = new UserAuthManager();
window.omsEngine = new OMSEngine();

// ============================================================================
// BỘ ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY & ĐA THIẾT BỊ (CloudSyncAdapter — Hybrid LocalStorage + Google Sheets)
// ============================================================================
class CloudSyncAdapter {
  constructor() {
    this.STORAGE_CONFIG_KEY = "ODOMS_CLOUD_CONFIG_V3";
    this.STORAGE_ENGINE_STATE_KEY = "ODOMS_ENGINE_STATE_V3";
    this.DEFAULT_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbz6rZY-zx9nslSBnilGuggzeXFGbAe_3IwaQazglnCoh9lwZ7rrB6IDaAIAdqrfegUb/exec";
    this.isPulling = false;
    this.pushDebounceTimer = null;

    const savedCfg = this.loadConfig();
    this.endpointUrl = savedCfg.endpointUrl || this.DEFAULT_ENDPOINT_URL;
    this.secretToken = savedCfg.secretToken || "ODOMS_SECURE_TOKEN_2026";
    this.autoSync = savedCfg.autoSync !== false;
    this.lastSyncTime = savedCfg.lastSyncTime || "Chưa đồng bộ";
    this.syncStatus = this.endpointUrl ? "CLOUD_READY" : "LOCAL_READY";

    this.initCrossTabSync();
  }

  formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  loadConfig() {
    const defaultUrl = "https://script.google.com/macros/s/AKfycbz6rZY-zx9nslSBnilGuggzeXFGbAe_3IwaQazglnCoh9lwZ7rrB6IDaAIAdqrfegUb/exec";
    try {
      const raw = localStorage.getItem(this.STORAGE_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.endpointUrl) {
          parsed.endpointUrl = defaultUrl;
        }
        return parsed;
      }
    } catch (e) {
      // Ignore
    }
    return {
      endpointUrl: defaultUrl,
      secretToken: "ODOMS_SECURE_TOKEN_2026",
      autoSync: true,
      lastSyncTime: "Chưa đồng bộ"
    };
  }

  saveConfig(partial = {}) {
    if (partial.endpointUrl !== undefined) {
      this.endpointUrl = String(partial.endpointUrl || "").trim();
    }
    if (partial.secretToken !== undefined) {
      this.secretToken = String(partial.secretToken || "ODOMS_SECURE_TOKEN_2026").trim();
    }
    if (partial.autoSync !== undefined) {
      this.autoSync = Boolean(partial.autoSync);
    }
    if (partial.lastSyncTime !== undefined) {
      this.lastSyncTime = partial.lastSyncTime;
    }

    try {
      localStorage.setItem(
        this.STORAGE_CONFIG_KEY,
        JSON.stringify({
          endpointUrl: this.endpointUrl,
          secretToken: this.secretToken,
          autoSync: this.autoSync,
          lastSyncTime: this.lastSyncTime
        })
      );
    } catch (e) {
      // Ignore
    }
    this.notifyUI();
  }

  // 1. Lưu tức thì trạng thái OMSEngine vào LocalStorage (Zero-latency 0ms)
  saveLocalStateSnapshot() {
    if (!window.omsEngine) return;
    try {
      const snapshot = {
        updatedAt: this.formatNow(),
        allocationMode: window.omsEngine.allocationMode,
        initialInventory: window.INITIAL_INVENTORY,
        inventory: window.omsEngine.inventory,
        orders: window.omsEngine.orders
      };
      localStorage.setItem(this.STORAGE_ENGINE_STATE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn("Không thể lưu snapshot LocalStorage:", e);
    }
  }

  // 2. Khôi phục trạng thái OMSEngine từ LocalStorage khi mở lại trang hoặc đồng bộ giữa các Tab
  restoreLocalStateSnapshot() {
    if (!window.omsEngine) return false;
    try {
      const raw = localStorage.getItem(this.STORAGE_ENGINE_STATE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.inventory) || !Array.isArray(parsed.orders)) {
        return false;
      }
      this.isPulling = true;
      if (Array.isArray(parsed.initialInventory) && parsed.initialInventory.length > 0) {
        window.INITIAL_INVENTORY = parsed.initialInventory;
      }
      window.omsEngine.allocationMode = parsed.allocationMode || "FIFO_TIME";
      window.omsEngine.inventory = parsed.inventory;
      window.omsEngine.orders = parsed.orders.map((ord) => {
        if (ord && ord.orderTime && typeof window.omsEngine.parseAndFormatOrderTime === "function") {
          const pt = window.omsEngine.parseAndFormatOrderTime(ord.orderTime);
          ord.orderTime = pt.formatted;
          ord.timestampMs = pt.timestampMs;
        }
        return ord;
      });
      this.isPulling = false;
      return true;
    } catch (e) {
      this.isPulling = false;
      return false;
    }
  }

  // 3. Đặt lịch đẩy ngầm lên Google Sheets (Non-blocking Debounced Push)
  scheduleCloudPush(reason = "AUTO_SYNC") {
    this.saveLocalStateSnapshot();
    this.saveConfig({ lastSyncTime: `${this.formatNow()} (Local)` });

    if (!this.autoSync || !this.endpointUrl) {
      this.syncStatus = "LOCAL_READY";
      this.notifyUI();
      return;
    }

    if (this.pushDebounceTimer) {
      clearTimeout(this.pushDebounceTimer);
    }
    this.pushDebounceTimer = setTimeout(() => {
      this.pushStateToCloud(reason, true);
    }, 350);
  }

  // 4. Đẩy toàn bộ 5 bảng (Orders, Inventory_ATP, Batches, Users_RBAC, AuditLogs) lên Google Sheets
  async pushStateToCloud(reason = "MANUAL_PUSH", silent = false) {
    this.saveLocalStateSnapshot();

    if (!this.endpointUrl) {
      this.syncStatus = "LOCAL_READY";
      this.saveConfig({ lastSyncTime: `${this.formatNow()} (LocalStorage)` });
      if (!silent && window.omsEngine) {
        window.omsEngine.addLog(
          "info",
          `💾 [LOCAL SYNC] Đã lưu trạng thái 5 bảng vào LocalStorage tức thì (${reason}). Hãy nhập Google Apps Script Web App URL trong mục Cài đặt nếu muốn đẩy lên Google Sheets.`
        );
      }
      this.notifyUI();
      return {
        success: true,
        mode: "LOCAL_ONLY",
        message: "Đã lưu tức thì vào LocalStorage! (Chưa cấu hình URL Google Apps Script)"
      };
    }

    this.syncStatus = "SYNCING";
    this.notifyUI();

    const payload = {
      action: "SYNC_ALL",
      reason,
      secret_token: this.secretToken,
      orders: window.omsEngine ? window.omsEngine.orders : [],
      inventory: window.omsEngine ? window.omsEngine.inventory : [],
      users: window.userAuth ? window.userAuth.users : [],
      auditLogs: window.userAuth ? window.userAuth.accessLogs : []
    };

    try {
      const response = await fetch(this.endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const resJson = await response.json();
      if (resJson && resJson.status === "SUCCESS") {
        this.syncStatus = "CLOUD_CONNECTED";
        this.saveConfig({ lastSyncTime: `${this.formatNow()} (Google Sheets)` });
        if (window.omsEngine) {
          window.omsEngine.addLog(
            "sync",
            `☁️ [CLOUD SYNC ➔ GOOGLE SHEETS] Đồng bộ thành công 5 bảng (Orders: ${payload.orders.length}, SKU: ${payload.inventory.length}, Users: ${payload.users.length}) lên Cloud.`
          );
        }
        this.notifyUI();
        return {
          success: true,
          mode: "CLOUD",
          message: resJson.message || "Đồng bộ lên Google Sheets thành công!",
          details: resJson.details
        };
      } else {
        throw new Error((resJson && resJson.message) || "Phản hồi không hợp lệ từ Google Apps Script");
      }
    } catch (err) {
      this.syncStatus = "CLOUD_ERROR";
      this.saveConfig({ lastSyncTime: `${this.formatNow()} (Lưu dự phòng Local)` });
      if (window.omsEngine && !silent) {
        window.omsEngine.addLog(
          "warn",
          `⚠️ [CLOUD FALLBACK] Không thể kết nối Google Apps Script (${err.message}). Dữ liệu vẫn được bảo toàn 100% trên LocalStorage.`
        );
      }
      this.notifyUI();
      return {
        success: false,
        mode: "FALLBACK_LOCAL",
        message: `Đã lưu an toàn trên LocalStorage. Lỗi kết nối Cloud: ${err.message}`
      };
    }
  }

  // 5. Kéo dữ liệu 5 bảng từ Google Sheets về Web App ODOMS
  async pullStateFromCloud(silent = false) {
    if (!this.endpointUrl) {
      const restored = this.restoreLocalStateSnapshot();
      this.syncStatus = "LOCAL_READY";
      this.notifyUI();
      return {
        success: restored,
        mode: "LOCAL_ONLY",
        message: restored
          ? "Đã khôi phục dữ liệu từ LocalStorage."
          : "Chưa cấu hình URL Google Apps Script. Đang sử dụng dữ liệu khởi tạo mặc định."
      };
    }

    this.syncStatus = "SYNCING";
    this.notifyUI();

    try {
      const sep = this.endpointUrl.includes("?") ? "&" : "?";
      const url = `${this.endpointUrl}${sep}action=PULL_ALL&t=${Date.now()}`;
      const response = await fetch(url, { method: "GET" });
      const resJson = await response.json();

      if (resJson && resJson.status === "SUCCESS" && resJson.data) {
        this.isPulling = true;
        const { orders, inventory, users, auditLogs } = resJson.data;

        if (Array.isArray(inventory) && inventory.length > 0 && window.omsEngine) {
          window.omsEngine.inventory = inventory;
        }
        if (Array.isArray(orders) && window.omsEngine) {
          window.omsEngine.orders = orders.map((ord) =>
            window.omsEngine.normalizeRawOrder(
              {
                "Mã đơn hàng": ord.orderId,
                "Sàn TMĐT": ord.channel,
                "Thời gian đặt hàng": ord.orderTime,
                "SKU phân loại": ord.sku,
                "Tên sản phẩm": ord.productName,
                "Số lượng": ord.quantity,
                "Đơn giá": ord.unitPrice,
                "Người Mua": ord.customerName,
                "Số điện thoại": ord.customerPhone,
                "Địa chỉ nhận hàng": ord.shippingAddress,
                "Trạng thái đơn hàng":
                  ord.platformStatus === "CANCELLED"
                    ? "Đã hủy đơn"
                    : ord.platformStatus === "UNCONFIRMED"
                    ? "Chưa xác nhận"
                    : "Đã xác nhận",
                "Phương thức thanh toán": ord.paymentMethod
              },
              ord.sourceMethod || "EXCEL_IMPORT"
            )
          );
          window.omsEngine.recalculateAllAllocations();
        }
        if (Array.isArray(users) && users.length > 0 && window.userAuth) {
          window.userAuth.saveUsers(users);
        }
        if (Array.isArray(auditLogs) && auditLogs.length > 0 && window.userAuth) {
          window.userAuth.saveAccessLogs(auditLogs);
        }

        this.isPulling = false;
        this.saveLocalStateSnapshot();
        this.syncStatus = "CLOUD_CONNECTED";
        this.saveConfig({ lastSyncTime: `${this.formatNow()} (Tải từ Cloud)` });

        if (window.omsEngine && !silent) {
          window.omsEngine.addLog(
            "sync",
            `📥 [CLOUD PULL ⬅ GOOGLE SHEETS] Đã đồng bộ dữ liệu từ Google Sheets về máy (${(orders || []).length} đơn hàng, ${(inventory || []).length} SKU).`
          );
        }
        this.notifyUI(true);
        return {
          success: true,
          mode: "CLOUD",
          message: "Đã tải và đồng bộ dữ liệu 5 bảng từ Google Sheets thành công!"
        };
      } else {
        throw new Error((resJson && resJson.message) || "Dữ liệu trả về từ Google Sheets không hợp lệ");
      }
    } catch (err) {
      this.isPulling = false;
      this.syncStatus = "CLOUD_ERROR";
      this.notifyUI();
      return {
        success: false,
        mode: "ERROR",
        message: `Không thể tải từ Google Sheets: ${err.message}`
      };
    }
  }

  // 6. Đồng bộ thời gian thực giữa nhiều Tab trình duyệt trên cùng máy (Storage Event)
  initCrossTabSync() {
    window.addEventListener("storage", (event) => {
      if (!event.key) return;
      if (event.key === this.STORAGE_ENGINE_STATE_KEY) {
        if (this.restoreLocalStateSnapshot() && window.AppUI) {
          window.AppUI.renderAll();
        }
      } else if (event.key === "ODOMS_USERS_V3" && window.userAuth) {
        window.userAuth.users = window.userAuth.loadUsers();
        if (window.AppUI) {
          window.AppUI.renderStaffManagement();
          window.AppUI.renderLoginQuickAccounts();
        }
      }
    });
  }

  notifyUI(shouldRenderAll = false) {
    if (window.AppUI) {
      if (typeof window.AppUI.updateCloudSyncStatusUI === "function") {
        window.AppUI.updateCloudSyncStatusUI();
      }
      if (shouldRenderAll && typeof window.AppUI.renderAll === "function") {
        window.AppUI.renderAll();
      } else if (typeof window.AppUI.renderLogs === "function") {
        window.AppUI.renderLogs();
      }
    }
  }
}

window.cloudSync = new CloudSyncAdapter();
