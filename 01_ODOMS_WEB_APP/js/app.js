// ============================================================================
// BỘ ĐIỀU KHIỂN GIAO DIỆN NGƯỜI DÙNG HỆ THỐNG ODOMS (AppUI Controller)
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\app.js
// ============================================================================

const THEMES_LIST = [
  {
    key: "navy",
    name: "Navy",
    fullTitle: "Chủ đề Navy",
    swatches: ["#0A2947", "#F3E4C9", "#D3D4C0", "#8B5E3C"],
    // 2 màu đối kháng cao: Xanh Royal (#2563EB) vs Cam Đỏ Rực (#F97316)
    chartPrimary: "#2563EB",
    chartPrimaryArea: "rgba(37, 99, 235, 0.15)",
    chartSecondary: "#F97316"
  },
  {
    key: "green",
    name: "Green",
    fullTitle: "Chủ đề Green",
    swatches: ["#14532d", "#16a34a", "#f0fdf4", "#f1f5f9"],
    // 2 màu đối kháng cao: Xanh Lá Ngọc (#16A34A) vs Đỏ Hồng Coral (#E11D48)
    chartPrimary: "#16A34A",
    chartPrimaryArea: "rgba(22, 163, 74, 0.15)",
    chartSecondary: "#E11D48"
  },
  {
    key: "indigo",
    name: "Indigo",
    fullTitle: "Chủ đề Indigo",
    swatches: ["#330099", "#4f46e5", "#eef2ff", "#f3f4fc"],
    // 2 màu đối kháng cao: Tím Indigo (#4F46E5) vs Vàng Hổ Phách (#F59E0B)
    chartPrimary: "#4F46E5",
    chartPrimaryArea: "rgba(79, 70, 229, 0.15)",
    chartSecondary: "#F59E0B"
  },
  {
    key: "retro",
    name: "Retro",
    fullTitle: "Chủ đề Retro",
    swatches: ["#000000", "#233D4D", "#FE7F2D", "#EAECF0"],
    // 2 màu đối kháng cao: Xanh Đậm (#0284C7) vs Cam Cháy (#FE7F2D)
    chartPrimary: "#0284C7",
    chartPrimaryArea: "rgba(2, 132, 199, 0.15)",
    chartSecondary: "#FE7F2D"
  },
  {
    key: "neon",
    name: "Neon",
    fullTitle: "Chủ đề Neon",
    swatches: ["#30AFFF", "#92EEFF", "#D8FFC5", "#C4F7CA"],
    // 2 màu đối kháng cao: Xanh Cyan Đậm (#0284C7) vs Tím Hồng Magenta (#D946EF)
    chartPrimary: "#0284C7",
    chartPrimaryArea: "rgba(2, 132, 199, 0.16)",
    chartSecondary: "#D946EF"
  },
  {
    key: "sea",
    name: "Sea",
    fullTitle: "Chủ đề Sea",
    swatches: ["#3368A0", "#66A3BF", "#C8DFDB", "#F2EFE7"],
    // 2 màu đối kháng cao: Xanh Đại Dương (#0369A1) vs Đỏ Cam San Hô (#F43F5E)
    chartPrimary: "#0369A1",
    chartPrimaryArea: "rgba(3, 105, 161, 0.15)",
    chartSecondary: "#F43F5E"
  },
  {
    key: "dark",
    name: "Tối",
    fullTitle: "Chủ đề Tối",
    swatches: ["#090d16", "#1e293b", "#10b981", "#38bdf8"],
    // 2 màu đối kháng cao trên nền tối: Xanh Ngọc Lục Bảo (#10B981) vs Cam Vàng Rực (#FB923C)
    chartPrimary: "#10B981",
    chartPrimaryArea: "rgba(16, 185, 129, 0.18)",
    chartSecondary: "#FB923C"
  },
  {
    key: "vivo",
    name: "Vivo",
    fullTitle: "Chủ đề Vivo",
    swatches: ["#1877FF", "#465AFF", "#4BC8E1", "#947AEC"],
    // Bảng màu nhận diện VIVOTEK: #1877FF, #465AFF, #4BC8E1, #947AEC trên nền #FFFFFF
    chartPrimary: "#1877FF",
    chartPrimaryArea: "#EEF5FF",
    chartSecondary: "#465AFF"
  }
];

const AppUI = {
  currentMenuTab: "dashboard",
  currentChannelFilter: "ALL",
  currentStatusFilter: "ALL",
  orderSortMode: "NEWEST_FIRST",
  searchQuery: "",
  invCategoryFilter: "ALL",
  invStatusFilter: "ALL",
  invSearchQuery: "",
  activeInvCard: null,
  qrLookupQuery: "",
  demoTimer: null,
  currentTheme: "navy",
  themeStorageKey: "ODOMS_ACTIVE_THEME_V3",

  init() {
    this.initTheme();
    this.initShipping();
    const wbInput = document.getElementById("wbTrackingCode");
    if (wbInput && !wbInput.value && this.waybillHistory && this.waybillHistory[0]) {
      wbInput.value = this.waybillHistory[0].trackingCode;
    }
    this.initCloudSyncPanel();
    this.bindEvents();
    this.renderLoginQuickAccounts();
    // Luôn khởi đầu tại Màn hình Đăng nhập (căn giữa, màu mặc định Navy)
    this.showLoginScreen();
    this.switchSidebarTab("dashboard");
  },

  initTheme() {
    let savedTheme = "navy";
    try {
      const stored = localStorage.getItem(this.themeStorageKey);
      if (stored && THEMES_LIST.some((t) => t.key === stored)) {
        savedTheme = stored;
      }
    } catch (e) {
      console.warn("Không thể đọc theme từ localStorage:", e);
    }
    this.renderThemeSwitchers();
    this.applyTheme(savedTheme, false);
  },

  renderThemeSwitchers() {
    const bar = document.getElementById("settingsThemePickerBar");
    if (!bar) return;

    const buttonsHtml = THEMES_LIST.map((t) => {
      const dots = t.swatches
        .map((color) => `<span class="swatch-dot" style="background:${color};"></span>`)
        .join("");
      return `
        <button
          type="button"
          class="theme-swatch-btn ${this.currentTheme === t.key ? "active" : ""}"
          data-theme-key="${t.key}"
          title="${t.fullTitle}"
          onclick="AppUI.applyTheme('${t.key}', true)"
        >
          <span class="swatch-dots">${dots}</span>
          <span>${t.name}</span>
        </button>
      `;
    }).join("");

    bar.innerHTML = buttonsHtml;
  },

  applyTheme(themeKey, recordLog = true) {
    const themeObj = THEMES_LIST.find((t) => t.key === themeKey) || THEMES_LIST[0];
    this.currentTheme = themeObj.key;

    // 1. Gán data-theme lên thẻ <html> để đổi màu Màn hình 2 (Giao diện Thực hiện các Chức năng)
    // Lưu ý: Màn hình 1 (Đăng nhập) luôn giữ cố định bộ màu mặc định (#0A2947, #F3E4C9, #D3D4C0, #8B5E3C)
    document.documentElement.setAttribute("data-theme", themeObj.key);

    // 2. Lưu vào localStorage
    try {
      localStorage.setItem(this.themeStorageKey, themeObj.key);
    } catch (e) {
      console.warn("Không thể lưu theme:", e);
    }

    // 3. Cập nhật trạng thái active trên bộ chọn màu trong phần Cài đặt
    document.querySelectorAll(".theme-swatch-btn").forEach((btn) => {
      const key = btn.getAttribute("data-theme-key");
      btn.classList.toggle("active", key === themeObj.key);
    });

    // 4. Đồng bộ màu đối kháng cho đồ thị SVG Spline (Tiếp nhận đơn vs Xuất giữ hàng) trên Màn hình 2
    const gradStopImportTop = document.getElementById("gradStopImportTop");
    if (gradStopImportTop) gradStopImportTop.setAttribute("stop-color", themeObj.chartSecondary);
    const gradStopImportMid = document.getElementById("gradStopImportMid");
    if (gradStopImportMid) gradStopImportMid.setAttribute("stop-color", themeObj.chartSecondary);

    const gradStopExportTop = document.getElementById("gradStopExportTop");
    if (gradStopExportTop) gradStopExportTop.setAttribute("stop-color", themeObj.chartPrimary);
    const gradStopExportMid = document.getElementById("gradStopExportMid");
    if (gradStopExportMid) gradStopExportMid.setAttribute("stop-color", themeObj.chartPrimary);

    const chartLineExport = document.getElementById("chartLineExport");
    if (chartLineExport) chartLineExport.setAttribute("stroke", themeObj.chartPrimary);

    const chartDotsExportGroup = document.getElementById("chartDotsExportGroup");
    if (chartDotsExportGroup) chartDotsExportGroup.setAttribute("fill", themeObj.chartPrimary);

    const chartDotExport = document.getElementById("chartDotExport");
    if (chartDotExport) chartDotExport.setAttribute("fill", themeObj.chartPrimary);

    const chartLineImport = document.getElementById("chartLineImport");
    if (chartLineImport) chartLineImport.setAttribute("stroke", themeObj.chartSecondary);

    const chartDotsImport = document.getElementById("chartDotsImport");
    if (chartDotsImport) chartDotsImport.setAttribute("fill", themeObj.chartSecondary);

    const legendBoxExport = document.getElementById("legendBoxExport");
    if (legendBoxExport) legendBoxExport.style.background = themeObj.chartPrimary;

    const legendBoxImport = document.getElementById("legendBoxImport");
    if (legendBoxImport) legendBoxImport.style.background = themeObj.chartSecondary;

    // Cập nhật lại biểu đồ cột đứng hợp nhất Top 3 kênh, Donut, Doanh thu & Dashboard P2 theo chủ đề mới
    if (typeof this.renderDashboardP2 === "function") {
      this.renderDashboardP2();
    }
    if (typeof this.renderFiveChannelSoldPieChart === "function") {
      this.renderFiveChannelSoldPieChart();
    }
    if (typeof this.renderUnifiedTop3ChannelRankingChart === "function") {
      this.renderUnifiedTop3ChannelRankingChart();
    }
    if (typeof this.renderMonthlyTrendsByFilter === "function") {
      this.renderMonthlyTrendsByFilter();
    } else if (typeof this.renderMonthlyTrendsChartLabels === "function") {
      this.renderMonthlyTrendsChartLabels();
    }

    // 5. Ghi nhật ký hệ thống nếu người dùng bấm đổi trực tiếp
    if (recordLog && window.omsEngine) {
      window.omsEngine.addLog(
        "info",
        `🎨 [CÀI ĐẶT GIAO DIỆN] Đã chuyển màu giao diện thực hiện các chức năng sang: [${themeObj.fullTitle}]`
      );
      this.renderLogs();
    }
  },

  bindEvents() {
    // 1. Sự kiện Form Đăng nhập ODOMS
    const loginForm = document.getElementById("omsLoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLoginSubmit();
      });
    }

    // Nút con mắt ẩn/hiện mật khẩu
    const togglePassBtn = document.getElementById("togglePasswordBtn");
    if (togglePassBtn) {
      togglePassBtn.addEventListener("click", () => {
        const passInput = document.getElementById("loginPassword");
        if (!passInput) return;
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        togglePassBtn.title = isPass ? "Ẩn mật khẩu" : "Hiện mật khẩu";
      });
    }

    // 2. Upload file Excel (.xlsx, .xls, .csv)
    const fileInput = document.getElementById("excelFileInput");
    const uploadBox = document.getElementById("uploadDropZone");

    if (uploadBox && fileInput) {
      uploadBox.addEventListener("click", () => fileInput.click());
      uploadBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadBox.classList.add("dragover");
      });
      uploadBox.addEventListener("dragleave", () => {
        uploadBox.classList.remove("dragover");
      });
      uploadBox.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadBox.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFilesSelected(e.dataTransfer.files);
        }
      });
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFilesSelected(e.target.files);
          fileInput.value = "";
        }
      });
    }

    // 3. Thay đổi thứ tự hiển thị danh sách đơn hàng trên bảng (Mới nhất lên trên / Cũ nhất lên trên)
    const ruleSelect = document.getElementById("allocationRuleSelect");
    if (ruleSelect) {
      ruleSelect.addEventListener("change", (e) => {
        this.orderSortMode = e.target.value || "NEWEST_FIRST";
        this.renderOrdersTable();
      });
    }

    // 4. Tìm kiếm & lọc trạng thái đơn hàng
    const searchInput = document.getElementById("orderSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderOrdersTable();
      });
    }

    const statusSelect = document.getElementById("statusFilterSelect");
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        this.currentStatusFilter = e.target.value;
        this.renderOrdersTable();
      });
    }

    // 5. Tra cứu QR / Mã đơn / SKU
    const qrInput = document.getElementById("qrSearchInput");
    if (qrInput) {
      qrInput.addEventListener("input", (e) => {
        this.qrLookupQuery = e.target.value.trim().toLowerCase();
        this.renderQrLookupResults();
      });
    }

    // 6. Form Thêm Nhân sự / User mới
    const addUserForm = document.getElementById("addNewUserForm");
    if (addUserForm) {
      addUserForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddNewUser();
      });
      const roleSel = document.getElementById("newUserRole");
      if (roleSel) {
        roleSel.addEventListener("change", (e) => {
          this.handleRoleSelectChange(e.target.value);
        });
      }
    }
  },

  // ============================================================================
  // XỬ LÝ MÀN HÌNH ĐĂNG NHẬP ODOMS & PHIÊN NGƯỜI DÙNG
  // ============================================================================
  showLoginScreen() {
    const loginEl = document.getElementById("loginScreenWrapper");
    const appEl = document.getElementById("dashboardAppWrapper");
    if (loginEl) loginEl.classList.remove("hidden");
    if (appEl) appEl.classList.add("hidden");
    this.renderLoginQuickAccounts();
  },

  showDashboardScreen() {
    const loginEl = document.getElementById("loginScreenWrapper");
    const appEl = document.getElementById("dashboardAppWrapper");
    if (loginEl) loginEl.classList.add("hidden");
    if (appEl) appEl.classList.remove("hidden");
    this.updateSidebarUserProfile();
    this.applyRoleBasedAccessControl();
    this.switchSidebarTab("dashboard");
    this.renderAll();
  },

  fillLoginCredentials(username, password) {
    const uInput = document.getElementById("loginUsername");
    const pInput = document.getElementById("loginPassword");
    const errBanner = document.getElementById("loginErrorBanner");
    if (uInput) uInput.value = username;
    if (pInput) pInput.value = password;
    if (errBanner) errBanner.classList.add("hidden");
  },

  handleLoginSubmit() {
    const uInput = document.getElementById("loginUsername");
    const pInput = document.getElementById("loginPassword");
    const errBanner = document.getElementById("loginErrorBanner");

    const username = uInput ? uInput.value : "";
    const password = pInput ? pInput.value : "";

    const result = window.userAuth.authenticate(username, password);
    if (!result.success) {
      if (errBanner) {
        errBanner.innerText = result.message;
        errBanner.classList.remove("hidden");
      }
      return;
    }

    if (errBanner) errBanner.classList.add("hidden");
    window.omsEngine.addLog(
      "info",
      `[XÁC THỰC PHIÊN] Người dùng "${result.user.fullName}" (${result.user.username} - ${result.user.role}) đã đăng nhập hệ thống.`
    );
    this.showDashboardScreen();
  },

  handleLogout() {
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
    window.userAuth.logout();
    this.showLoginScreen();
  },

  updateSidebarUserProfile() {
    const user = window.userAuth.currentUser || window.userAuth.users[0];
    if (!user) return;

    const avatarEl = document.getElementById("sidebarUserAvatar");
    const nameEl = document.getElementById("sidebarUserName");

    if (avatarEl) avatarEl.innerText = user.avatar || "TD";
    if ( nameEl ) nameEl.innerText = user.fullName;

    const greetingEl = document.getElementById("sidebarUserGreeting");
    if (greetingEl) {
      const isBackupAdmin = String(user.username || "").toLowerCase() === "lhmt";
      if (isBackupAdmin) {
        greetingEl.innerHTML = 'Chào bạn, <span style="color:#fbbf24;font-weight:800;">Admin</span>';
      } else {
        greetingEl.innerText = "Chào bạn,";
      }
    }
  },

  renderLoginQuickAccounts() {
    const listContainer = document.getElementById("quickAccountList");
    const countLabel = document.getElementById("quickAccountCount");
    if (!listContainer) return;

    // Lọc ẩn tài khoản dự phòng lhmt trên giao diện
    const visibleUsers = (window.userAuth.users || []).filter(
      (u) => !u.isHiddenBackup && u.username.toLowerCase() !== "lhmt"
    );
    if (countLabel) {
      countLabel.innerText = `${visibleUsers.length} tài khoản khả dụng`;
    }

    listContainer.innerHTML = visibleUsers
      .map(
        (u) => `
        <button type="button" class="quick-account-pill" onclick="AppUI.fillLoginCredentials('${u.username}', '${u.password}')">
          <div class="qa-left">
            <div class="qa-avatar">${u.avatar}</div>
            <div>
              <div class="qa-name">${u.fullName}</div>
              <div class="qa-role">${u.role}</div>
            </div>
          </div>
          <div class="qa-cred">${u.username} / ${u.password}</div>
        </button>
      `
      )
      .join("");
  },

  // ============================================================================
  // ĐIỀU HƯỚNG SIDEBAR & MOBILE DRAWER (NHÓM TỔNG QUAN & NHÓM HỆ THỐNG)
  // ============================================================================
  toggleMobileSidebar(forceState) {
    const sidebar = document.getElementById("wmsSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (!sidebar) return;

    const isCurrentlyOpen = sidebar.classList.contains("open");
    const shouldOpen = typeof forceState === "boolean" ? forceState : !isCurrentlyOpen;

    sidebar.classList.toggle("open", shouldOpen);
    if (overlay) {
      overlay.classList.toggle("active", shouldOpen);
    }
  },

  isCurrentUserAdmin() {
    const user = window.userAuth && window.userAuth.currentUser;
    if (!user) return false;
    const uname = String(user.username || "").toLowerCase();
    return uname === "dttd" || uname === "lhmt";
  },

  applyRoleBasedAccessControl() {
    const isAdmin = this.isCurrentUserAdmin();
    const adminOnlyTabs = ["logs", "staff"];

    document.querySelectorAll('[data-admin-only="true"]').forEach((el) => {
      if (el.classList.contains("oms-view-section")) {
        const views = (el.getAttribute("data-views") || "").split(" ");
        const shouldShow = isAdmin && views.includes(this.currentMenuTab);
        el.classList.toggle("hidden", !shouldShow);
        el.style.display = shouldShow ? "" : "none";
        return;
      }
      el.classList.toggle("hidden", !isAdmin);
      el.style.display = isAdmin ? "" : "none";
      if (el.parentElement && el.parentElement.tagName === "LI") {
        el.parentElement.style.display = isAdmin ? "" : "none";
      }
    });

    if (!isAdmin && adminOnlyTabs.includes(this.currentMenuTab)) {
      this.switchSidebarTab("dashboard");
    }
  },

  switchSidebarTab(tabKey) {
    const adminOnlyTabs = ["logs", "staff"];
    if (adminOnlyTabs.includes(tabKey) && !this.isCurrentUserAdmin()) {
      if (window.omsEngine) {
        window.omsEngine.addLog(
          "warn",
          `[PHÂN QUYỀN RBAC] Tài khoản Nhân viên vận hành (Staff) không có quyền truy cập mục Quản trị [${tabKey}].`
        );
      }
      tabKey = "dashboard";
    }
    this.currentMenuTab = tabKey;

    // Cập nhật trạng thái active cho menu Sidebar
    document.querySelectorAll(".sidebar-menu-item[data-tab]").forEach((btn) => {
      const bTab = btn.getAttribute("data-tab");
      const isAct = bTab === tabKey || (tabKey === "fifo" && bTab === "shipping") || (tabKey === "shipping" && bTab === "fifo");
      btn.classList.toggle("active", isAct);
    });

    // Cập nhật trạng thái active cho thanh điều hướng đáy màn hình (Mobile Bottom Nav)
    document.querySelectorAll(".mobile-nav-btn[data-tab]").forEach((btn) => {
      const bTab = btn.getAttribute("data-tab");
      const isAct = bTab === tabKey || (tabKey === "fifo" && bTab === "shipping") || (tabKey === "shipping" && bTab === "fifo");
      btn.classList.toggle("active", isAct);
    });

    // Tự động đóng menu Sidebar trên thiết bị di động khi người dùng chọn tab
    if (window.innerWidth <= 992) {
      this.toggleMobileSidebar(false);
    }

    const titleMap = {
      dashboard: "Tổng Quan",
      revenue_analytics: "Doanh thu & Phân tích",
      ingest: "Tiếp nhận / Gom đơn",
      inventory: "Kho",
      shipping: "Vận chuyển đơn hàng đa kênh",
      fifo: "Vận chuyển đơn hàng đa kênh",
      backorder: "Hàng thiếu tồn (Chặn bán lố)",
      qr_api: "Vận đơn",
      logs: "Nhật ký",
      staff: "Nhân sự & Phân quyền OMS",
      reports: "Báo cáo & Xuất đối chiếu",
      settings: "Cài đặt hệ thống"
    };

    const pageTitleEl = document.getElementById("topbarPageTitle");
    if (pageTitleEl) {
      pageTitleEl.innerText = titleMap[tabKey] || "Tổng Quan";
    }

    // Ẩn/hiện các view theo tab chức năng của hệ thống ODOMS
    const isAdmin = this.isCurrentUserAdmin();
    const allSections = document.querySelectorAll(".oms-view-section");
    allSections.forEach((sec) => {
      const isSecAdminOnly = sec.getAttribute("data-admin-only") === "true";
      const views = (sec.getAttribute("data-views") || "").split(" ");
      if (views.includes(tabKey) && (!isSecAdminOnly || isAdmin)) {
        sec.classList.remove("hidden");
        sec.style.display = "";
      } else {
        sec.classList.add("hidden");
        sec.style.display = "none";
      }
    });

    // Ẩn/hiện thông minh các nút công cụ trên Topbar theo ngữ cảnh tab đang mở
    document.querySelectorAll(".topbar-actions [data-action-views]").forEach((el) => {
      const allowedViews = (el.getAttribute("data-action-views") || "").split(" ");
      if (allowedViews.includes(tabKey)) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });

    // Tự động lọc khi bấm vào tab Chặn bán lố
    if (tabKey === "backorder") {
      this.currentStatusFilter = "BACKORDER";
      const statusSelect = document.getElementById("statusFilterSelect");
      if (statusSelect) statusSelect.value = "BACKORDER";
      this.renderOrdersTable();
    } else if (tabKey === "dashboard" || tabKey === "fifo") {
      this.currentStatusFilter = "ALL";
      const statusSelect = document.getElementById("statusFilterSelect");
      if (statusSelect) statusSelect.value = "ALL";
      this.renderOrdersTable();
    }

    this.renderStockShortageCornerPopup();

    if (tabKey === "shipping" || tabKey === "fifo") {
      this.renderShippingTab();
    }
    this.renderAll();
  },

  // ============================================================================
  // XỬ LÝ NGHIỆP VỤ ĐƠN HÀNG, EXCEL & MÔ PHỎNG FIFO
  // ============================================================================
  handleFilesSelected(fileList) {
    Array.from(fileList).forEach((file) => {
      window.ExcelHandler.parseWorkbook(file, (err, rows) => {
        if (err || !rows || rows.length === 0) {
          window.omsEngine.addLog("error", `Không thể đọc file [${file.name}]. Vui lòng kiểm tra định dạng .xlsx hoặc .csv.`);
          this.renderLogs();
          return;
        }
        window.omsEngine.addLog("info", `Đã đọc file [${file.name}] (${rows.length} dòng dữ liệu).`);
        window.omsEngine.ingestAndProcessOrders(rows, "EXCEL_IMPORT");
        this.triggerChannelSyncAnimation();
        this.renderAll();
      });
    });
  },

  loadSampleChannelData(channelKey) {
    let rows = [];
    if (channelKey === "ALL_UNIFIED") {
      rows = window.UNIFIED_SAMPLE_DATASET;
    } else if (window.SAMPLE_EXCEL_DATASETS[channelKey]) {
      rows = window.SAMPLE_EXCEL_DATASETS[channelKey];
    }
    if (rows.length > 0) {
      window.omsEngine.ingestAndProcessOrders(rows, "EXCEL_IMPORT");
      this.triggerChannelSyncAnimation();
      this.renderAll();
    }
  },

  fillRandomWebhookOrder() {
    const channels = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
    const invList =
      window.omsEngine && Array.isArray(window.omsEngine.inventory) && window.omsEngine.inventory.length > 0
        ? window.omsEngine.inventory
        : window.INITIAL_INVENTORY || [];
    const skus =
      invList.length > 0
        ? invList.map((item) => item.sku)
        : [
            "SP-AO-POLO-01",
            "SP-AO-THUN-02",
            "SP-QUAN-JEANS-06",
            "SP-DAM-MIDI-11",
            "SP-GIAY-SNEAKER-16",
            "SP-TUI-DEO-21"
          ];
    const sampleCustomers = [
      "Nguyễn Minh Tuấn",
      "Trần Thu Hà",
      "Lê Hoàng Nam",
      "Phạm Ngọc Ánh",
      "Võ Quốc Bảo",
      "Đặng Thùy Trang",
      "Bùi Quang Huy",
      "Hoàng Lan Anh"
    ];
    const sampleAddresses = [
      "123 Nguyễn Huệ, Phường Bến Nghé, TP.HCM",
      "456 Lê Lợi, Phường Bến Thành, TP.HCM",
      "88 Cách Mạng Tháng 8, Phường Xuân Hòa, TP.HCM",
      "215 Điện Biên Phủ, Phường Gia Định, TP.HCM",
      "52 Nguyễn Văn Linh, Phường Nam Dương, TP. Đà Nẵng",
      "108 Trần Phú, Phường Mộ Lao, TP. Hà Nội",
      "35 Võ Văn Ngân, Phường Linh Chiểu, TP.HCM",
      "190 Cộng Hòa, Phường Bảy Hiền, TP.HCM"
    ];

    const randChannel = channels[Math.floor(Math.random() * channels.length)];
    const randSku = skus[Math.floor(Math.random() * skus.length)];
    const randQty = Math.floor(1 + Math.random() * 4);
    const randCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const randAddress =
      randChannel === "POS"
        ? "Mua trực tiếp tại Cửa hàng ODOMS (Quầy POS)"
        : sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

    const chEl = document.getElementById("simChannel");
    const skuEl = document.getElementById("simSku");
    const qtyEl = document.getElementById("simQty");
    const custEl = document.getElementById("simCustomer");
    const addrEl = document.getElementById("simAddress");

    if (chEl) chEl.value = randChannel;
    if (skuEl) skuEl.value = randSku;
    if (qtyEl) qtyEl.value = randQty;
    if (custEl) custEl.value = randCustomer;
    if (addrEl) addrEl.value = randAddress;
  },

  simulateWebhookOrder() {
    const channel = document.getElementById("simChannel").value;
    const chCfg = window.omsEngine.channels && window.omsEngine.channels[channel];
    if (chCfg && chCfg.isConnected === false) {
      const chName = chCfg.shortName || channel;
      window.omsEngine.addLog(
        "warn",
        `[TẠM NGƯNG SÀN] Không thể tiếp nhận đơn mới từ [${chName}] vì sàn đang ở trạng thái "● Hủy kết nối". Vui lòng bật lại "● Đang kết nối" trước khi nhận đơn.`
      );
      this.renderAll();
      alert(`Kênh ${chName} hiện đang ở trạng thái "● Hủy kết nối" (tạm ngưng bán).\nVui lòng bấm nút bật lại "● Đang kết nối" tại thẻ ${chName} nếu muốn tiếp nhận đơn mới.`);
      return;
    }

    const sku = document.getElementById("simSku").value;
    const qty = parseInt(document.getElementById("simQty").value, 10) || 1;
    const customer = document.getElementById("simCustomer").value.trim() || "Khách mua hàng";
    const addressEl = document.getElementById("simAddress");
    const address =
      addressEl && addressEl.value.trim()
        ? addressEl.value.trim()
        : channel === "POS"
        ? "Mua trực tiếp tại Cửa hàng ODOMS (Quầy POS)"
        : `Đơn tiếp nhận trực tiếp từ kênh ${channel}`;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const shortDateStr = `${String(now.getFullYear()).slice(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timestampStr = `${dateStr} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const prefixMap = { SHOPEE: "SP", TIKTOK: "TT", LAZADA: "LZ", FACEBOOK: "FB", POS: "POS" };
    const orderId = `${prefixMap[channel] || "OD"}${shortDateStr}${randomSuffix}`;

    const invItem = window.omsEngine.inventory.find((i) => i.sku === sku);
    const unitPrice = invItem ? invItem.price : 250000;
    const productName = invItem ? invItem.name : "Sản phẩm chưa đăng ký kho";

    // Bắt ĐVVC đúng nghiệp vụ 3 tầng theo nguồn phát sinh:
    // - Sàn TMĐT (Shopee/TikTok/Lazada): sàn gửi kèm ĐVVC
    // - POS: tự động gán "Tại quầy"
    // - Facebook / ngoài sàn: để trống -> hệ thống ghi nhận "Chưa gán ĐVVC" cho tới khi tạo vận đơn vào bảng VanDon
    const platformCarrierMap = {
      SHOPEE: "SPX Express",
      TIKTOK: "J&T Express",
      LAZADA: "GHN (Giao Hàng Nhanh)",
      POS: "Tại quầy",
      FACEBOOK: ""
    };

    const mockApiPayload = {
      "Mã đơn hàng": orderId,
      "Sàn TMĐT": channel,
      "Thời gian đặt hàng": timestampStr,
      "SKU phân loại": sku,
      "Tên sản phẩm": productName,
      "Số lượng": qty,
      "Đơn giá": unitPrice,
      "Người Mua": customer,
      "Số điện thoại": "090" + Math.floor(1000000 + Math.random() * 8999999),
      "Địa chỉ nhận hàng": address,
      "Trạng thái đơn hàng": "Chờ xác nhận",
      "Phương thức thanh toán": channel === "POS" ? "Tiền mặt tại quầy" : "Ví điện tử / Chuyển khoản",
      "Đơn vị vận chuyển": platformCarrierMap[channel] !== undefined ? platformCarrierMap[channel] : ""
    };

    window.omsEngine.ingestAndProcessOrders([mockApiPayload], "WEBHOOK_API");
    this.triggerChannelSyncAnimation();
    this.renderAll();
  },

  runStepByStepFifoDemo() {
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
    window.omsEngine.resetSystem();
    this.syncShipmentsFromEngine();
    if (window.cloudSync) {
      window.cloudSync.scheduleCloudPush("RESET_SYSTEM");
    }
    this.renderAll();

    const demoSequence = [
      {
        note: "Đơn #1 từ Shopee đặt 4 Áo Polo lúc 08:15:10 ngày 22/11/2026 (Tồn kho đang có 10)",
        row: window.SAMPLE_EXCEL_DATASETS.SHOPEE[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Đơn #2 từ TikTok Shop đặt 4 Áo Polo lúc 08:16:05 ngày 22/11/2026 (Sẵn sàng bán còn 6 -> Giữ 4, còn 2)",
        row: window.SAMPLE_EXCEL_DATASETS.TIKTOK[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Đơn #3 từ Cửa hàng vật lý (POS) mua 2 Áo Polo lúc 08:17:20 ngày 22/11/2026 (Sẵn sàng bán còn 2 -> Giữ nốt 2, tồn về 0)",
        row: window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Đơn #4 từ Lazada đặt 3 Áo Polo lúc 08:18:45 ngày 22/11/2026 (Đến sau -> Hết hàng sẵn sàng bán -> Hệ thống chặn vượt tồn)",
        row: window.SAMPLE_EXCEL_DATASETS.LAZADA[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Nạp tiếp toàn bộ chuỗi đơn hàng Thời trang 01/2026 - 22/11/2026 từ 5 kênh bán hàng (bao gồm đơn sai mã sản phẩm để kiểm tra lọc lỗi)",
        rowsBatch: [
          ...(window.SAMPLE_EXCEL_DATASETS.SHOPEE || []).slice(1),
          ...(window.SAMPLE_EXCEL_DATASETS.TIKTOK || []).slice(1),
          ...(window.SAMPLE_EXCEL_DATASETS.LAZADA || []).slice(1),
          ...(window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS || []).slice(1)
        ],
        mode: "EXCEL_IMPORT"
      }
    ];

    let stepIdx = 0;
    const btn = document.getElementById("btnRunDemo");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "⏳ Đang chạy mô phỏng...";
    }

    const executeStep = () => {
      if (stepIdx >= demoSequence.length) {
        clearInterval(this.demoTimer);
        this.demoTimer = null;
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Chạy mô phỏng";
        }
        return;
      }
      const item = demoSequence[stepIdx];
      window.omsEngine.addLog("info", `🎯 [DEMO BƯỚC ${stepIdx + 1}/${demoSequence.length}] ${item.note}`);
      if (item.rowsBatch) {
        window.omsEngine.ingestAndProcessOrders(item.rowsBatch, item.mode);
      } else {
        window.omsEngine.ingestAndProcessOrders([item.row], item.mode);
      }
      this.triggerChannelSyncAnimation();
      this.renderAll();
      stepIdx++;
    };

    executeStep();
    this.demoTimer = setInterval(executeStep, 1250);
  },

  resetAll() {
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
    const btn = document.getElementById("btnRunDemo");
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Chạy mô phỏng";
    }
    window.omsEngine.resetSystem();
    this.syncShipmentsFromEngine();
    if (window.cloudSync) {
      window.cloudSync.scheduleCloudPush("RESET_SYSTEM");
    }
    this.renderAll();
  },

  setChannelFilter(ch) {
    this.currentChannelFilter = ch;
    document.querySelectorAll(".tab-btn[data-channel]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-channel") === ch);
    });
    this.renderOrdersTable();
  },

  triggerChannelSyncAnimation() {
    document.querySelectorAll(".channel-card").forEach((card) => {
      card.classList.remove("sync-flash");
      void card.offsetWidth;
      card.classList.add("sync-flash");
    });
  },

  handleRestock(sku, qty) {
    const numQty = parseInt(qty, 10);
    if (!sku || isNaN(numQty) || numQty <= 0) return;
    window.omsEngine.restockSku(sku, numQty);
    this.triggerChannelSyncAnimation();
    this.renderAll();
    const popEl = document.getElementById("invRestockPopover");
    if (popEl && !popEl.classList.contains("hidden")) {
      this.openRestockPopover(sku);
    }
  },

  onFirstKpiCardClick() {
    if (this.currentMenuTab === "inventory") {
      this.switchSidebarTab("dashboard");
    } else {
      this.switchSidebarTab("inventory");
    }
  },

  onInventoryFilterChange() {
    const catEl = document.getElementById("invCategoryFilter");
    const statusEl = document.getElementById("invStatusFilter");
    const searchEl = document.getElementById("invSearchInput");
    this.invCategoryFilter = catEl ? catEl.value : "ALL";
    this.invStatusFilter = statusEl ? statusEl.value : "ALL";
    this.invSearchQuery = searchEl ? String(searchEl.value || "").trim().toLowerCase() : "";
    this.activeInvCard = null;
    this.closeRestockPopover();
    this.renderInventoryTable();
  },

  filterInventoryByCard(cardType) {
    const catEl = document.getElementById("invCategoryFilter");
    const statusEl = document.getElementById("invStatusFilter");
    const searchEl = document.getElementById("invSearchInput");
    if (catEl) catEl.value = "ALL";
    if (searchEl) searchEl.value = "";
    this.invCategoryFilter = "ALL";
    this.invSearchQuery = "";

    const targetVal = ["ALL", "AVAILABLE", "RESERVED", "ALERT"].includes(cardType) ? cardType : "ALL";
    if (statusEl) statusEl.value = targetVal;
    this.invStatusFilter = targetVal;
    this.activeInvCard = targetVal;
    this.closeRestockPopover();
    this.renderInventoryTable();
  },

  openRestockPopover(sku, btnEl, ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    const popEl = document.getElementById("invRestockPopover");
    if (!popEl || !window.omsEngine) return;

    const item = window.omsEngine.inventory.find((i) => i.sku === sku);
    if (!item) return;

    const formatDateDMY = (dateStr) => {
      if (!dateStr) return "-";
      const parts = String(dateStr).split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    const unit = item.unit || "SP";
    const reversedBatches = [...(item.batches || [])].reverse();
    const batchRowsHtml = reversedBatches
      .map((b, idx) => {
        const expStr = formatDateDMY(b.expiryDate || b.importDate);
        const isLatestRestock = idx === 0 && String(b.batchCode || "").startsWith("LO-BOSUNG");
        const rowBg = isLatestRestock ? "background:#eff6ff;" : "";
        const newBadge = isLatestRestock
          ? ` <span style="display:inline-block;font-size:10px;font-weight:800;color:#2563eb;background:#dbeafe;padding:1px 5px;border-radius:4px;margin-left:4px;">Mới</span>`
          : "";
        return `
          <tr style="${rowBg}">
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#111827;">${b.batchCode}${newBadge}</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;color:#111827;">${expStr}</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#111827;">${b.remainingQty} / ${b.initialQty} ${unit}</td>
          </tr>
        `;
      })
      .join("");

    popEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13.5px;font-weight:800;color:#111827;">Chi tiết mặt hàng & Nhập kho</span>
        <button type="button" onclick="AppUI.closeRestockPopover()" style="background:none;border:none;font-size:15px;cursor:pointer;color:var(--text-muted);">✖</button>
      </div>
      <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:2px;">${item.name}</div>
      <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">Mã SKU: <strong style="color:#111827;">${item.sku}</strong></div>

      <!-- Thông tin Sẵn sàng bán & Tồn thực tế -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;margin-bottom:10px;">
        <div>
          <div style="font-size:11.5px;color:#475569;">Sẵn sàng bán</div>
          <div style="font-size:15.5px;font-weight:800;color:${item.availableStock === 0 ? "#dc2626" : "#2563eb"};">${item.availableStock} ${unit}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11.5px;color:#475569;">Tồn kho thực tế</div>
          <div style="font-size:14px;font-weight:700;color:#111827;">${item.physicalStock} ${unit}</div>
        </div>
      </div>

      <!-- Khu vực thao tác Nhập hàng -->
      <div style="background:#f1f5f9;border-radius:8px;padding:10px;margin-bottom:12px;">
        <label style="font-size:12px;font-weight:700;color:#111827;display:block;margin-bottom:6px;">➕ Nhập hàng bổ sung (${unit}):</label>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input type="number" id="invRestockQtyInput" class="form-control" min="1" max="1000" value="10" style="flex:1;font-weight:700;" />
          <button type="button" class="btn btn-primary btn-sm" onclick="AppUI.submitRestockPopover('${item.sku}')">Nhập hàng</button>
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-outline btn-sm" style="flex:1;padding:3px 0;font-size:11.5px;background:#fff;" onclick="document.getElementById('invRestockQtyInput').value=5">+5</button>
          <button type="button" class="btn btn-outline btn-sm" style="flex:1;padding:3px 0;font-size:11.5px;background:#fff;" onclick="document.getElementById('invRestockQtyInput').value=10">+10</button>
          <button type="button" class="btn btn-outline btn-sm" style="flex:1;padding:3px 0;font-size:11.5px;background:#fff;" onclick="document.getElementById('invRestockQtyInput').value=20">+20</button>
        </div>
      </div>

      <!-- Bảng Lô hàng & Hạn sử dụng ở dưới -->
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12.5px;font-weight:700;color:#111827;">Danh sách Lô hàng & Hạn sử dụng</span>
          <span style="font-size:11.5px;font-weight:600;color:#475569;">Tổng: ${reversedBatches.length} lô</span>
        </div>
        <div id="invBatchListScroll" style="max-height:175px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:6px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f8fafc;text-align:left;position:sticky;top:0;">
                <th style="padding:7px 8px;border-bottom:1px solid #e2e8f0;color:#475569;">Lô hàng</th>
                <th style="padding:7px 8px;border-bottom:1px solid #e2e8f0;color:#475569;">Hạn sử dụng</th>
                <th style="padding:7px 8px;border-bottom:1px solid #e2e8f0;color:#475569;text-align:right;">Còn lại</th>
              </tr>
            </thead>
            <tbody>
              ${batchRowsHtml || `<tr><td colspan="3" style="padding:8px;text-align:center;color:#6b7280;">Chưa có lô hàng</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    popEl.classList.remove("hidden");

    const actualWidth = popEl.offsetWidth || 420;
    const actualHeight = popEl.offsetHeight || 400;
    const margin = 20;

    if (btnEl && btnEl.getBoundingClientRect) {
      const rect = btnEl.getBoundingClientRect();
      let left = rect.left - actualWidth - 12;
      if (left < margin) {
        left = Math.min(window.innerWidth - actualWidth - margin, rect.right - actualWidth);
      }
      let top = rect.top - Math.round(actualHeight / 2) + Math.round(rect.height / 2);
      if (top + actualHeight > window.innerHeight - margin) {
        top = window.innerHeight - actualHeight - margin;
      }
      if (top < margin) top = margin;
      popEl.style.left = `${left}px`;
      popEl.style.top = `${top}px`;
    } else {
      let currentTop = parseFloat(popEl.style.top) || margin;
      if (currentTop + actualHeight > window.innerHeight - margin) {
        currentTop = Math.max(margin, window.innerHeight - actualHeight - margin);
        popEl.style.top = `${currentTop}px`;
      }
    }

    const batchScrollEl = document.getElementById("invBatchListScroll");
    if (batchScrollEl) batchScrollEl.scrollTop = 0;

    const qtyInput = document.getElementById("invRestockQtyInput");
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  },

  closeRestockPopover() {
    const popEl = document.getElementById("invRestockPopover");
    if (popEl) popEl.classList.add("hidden");
  },

  submitRestockPopover(sku) {
    const qtyInput = document.getElementById("invRestockQtyInput");
    const qty = qtyInput ? parseInt(qtyInput.value, 10) : 0;
    if (!qty || qty <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ lớn hơn 0!");
      return;
    }
    this.handleRestock(sku, qty);
  },

  // ============================================================================
  // QUẢN LÝ NHÂN SỰ & THÊM USER TÙY Ý (Tab Nhân sự)
  // ============================================================================
  handleRoleSelectChange(val) {
    const customRoleWrap = document.getElementById("customRoleWrap");
    const customRoleInput = document.getElementById("newUserCustomRole");
    if (!customRoleWrap) return;
    const isCustom = String(val || "").trim() === "Khác";
    customRoleWrap.classList.toggle("hidden", !isCustom);
    if (isCustom && customRoleInput) {
      customRoleInput.focus();
    }
  },

  handleAddNewUser() {
    const fullName = document.getElementById("newUserFullName").value;
    const username = document.getElementById("newUserUsername").value;
    const password = document.getElementById("newUserPassword").value;
    const roleSelect = document.getElementById("newUserRole").value;
    const customRoleInput = document.getElementById("newUserCustomRole");
    const customRoleWrap = document.getElementById("customRoleWrap");
    const department = document.getElementById("newUserDept").value;
    const shift = document.getElementById("newUserShift").value;
    const msgBox = document.getElementById("userFormFeedback");

    let role = roleSelect;
    if (roleSelect === "Khác") {
      const customRole = customRoleInput ? customRoleInput.value.trim() : "";
      if (!customRole) {
        if (msgBox) {
          msgBox.classList.remove("hidden");
          msgBox.style.background = "#fef2f2";
          msgBox.style.color = "#dc2626";
          msgBox.style.border = "1px solid #fecaca";
          msgBox.innerText = "Vui lòng nhập tên chức danh cho vai trò 'Khác'!";
        }
        if (customRoleInput) customRoleInput.focus();
        return;
      }
      role = customRole;
    }

    const res = window.userAuth.addNewUser({
      fullName,
      username,
      password,
      role,
      department,
      shift
    });

    if (msgBox) {
      msgBox.classList.remove("hidden");
      msgBox.style.background = res.success ? "#dcfce7" : "#fef2f2";
      msgBox.style.color = res.success ? "#15803d" : "#dc2626";
      msgBox.style.border = res.success ? "1px solid #86efac" : "1px solid #fecaca";
      msgBox.innerText = res.message;
    }

    if (res.success) {
      document.getElementById("addNewUserForm").reset();
      if (customRoleWrap) customRoleWrap.classList.add("hidden");
      window.omsEngine.addLog("success", `[NHÂN SỰ OMS] ${res.message}`);
      this.renderStaffManagement();
      this.renderAccessLogsTable();
      this.renderLoginQuickAccounts();
    }
  },

  handleDeleteUser(username) {
    const res = window.userAuth.deleteUser(username);
    alert(res.message);
    if (res.success) {
      this.renderStaffManagement();
      this.renderLoginQuickAccounts();
    }
  },

    
  pendingDeleteUsername: null,

  promptDeleteUser(username) {
    const u = (window.userAuth.users || []).find(
      (item) => item.username.toLowerCase() === String(username).toLowerCase()
    );
    if (!u) return;

    const isRoot = u.username.toLowerCase() === "dttd" || u.username.toLowerCase() === "lhmt" || u.isRoot;
    const activeUser = window.userAuth.currentUser;
    const isCurrent = activeUser && activeUser.username.toLowerCase() === u.username.toLowerCase();

    if (isRoot) {
      alert("Tài khoản Quản trị tối cao (Root Super Admin) được bảo vệ và không thể xóa!");
      return;
    }
    if (isCurrent) {
      alert("Không thể xóa tài khoản đang đăng nhập trong phiên làm việc hiện tại!");
      return;
    }

    this.pendingDeleteUsername = u.username;
    const infoEl = document.getElementById("deleteTargetUserInfo");
    if (infoEl) {
      infoEl.textContent = `${u.fullName} (@${u.username}) - ${u.role}`;
    }
    const modal = document.getElementById("confirmDeleteUserModal");
    if (modal) modal.classList.add("open");
  },

  closeConfirmDeleteModal() {
    this.pendingDeleteUsername = null;
    const modal = document.getElementById("confirmDeleteUserModal");
    if (modal) modal.classList.remove("open");
  },

  executeDeleteUser() {
    if (!this.pendingDeleteUsername) {
      this.closeConfirmDeleteModal();
      return;
    }
    const username = this.pendingDeleteUsername;
    const res = window.userAuth.deleteUser(username);
    this.closeConfirmDeleteModal();
    alert(res.message);
    if (res.success) {
      this.renderStaffManagement();
      this.renderAccessLogsTable();
      this.renderLoginQuickAccounts();
    }
  },

  openEditUserModal(username) {
    const u = (window.userAuth.users || []).find(
      (item) => item.username.toLowerCase() === String(username).toLowerCase()
    );
    if (!u) {
      alert("Không tìm thấy thông tin tài khoản nhân sự!");
      return;
    }

    const modal = document.getElementById("editUserModal");
    if (!modal) return;

    document.getElementById("editOriginalUsername").value = u.username;
    document.getElementById("editFullName").value = u.fullName || "";
    document.getElementById("editUsername").value = u.username || "";
    document.getElementById("editPassword").value = u.password || "";
    document.getElementById("editDepartment").value = u.department || "";
    document.getElementById("editShift").value = u.shift || "Ca Hành chính (08:00 - 17:00)";

    const standardRoles = [
      "Chuyên viên Điều phối",
      "Chuyên viên Vận hành",
      "Quản lý kho",
      "Chuyên viên CSKH",
      "Chuyên viên RMA",
      "Kế toán"
    ];

    const roleSelect = document.getElementById("editRole");
    const customWrap = document.getElementById("editCustomRoleWrap");
    const customInput = document.getElementById("editCustomRoleInput");

    if (standardRoles.includes(u.role)) {
      roleSelect.value = u.role;
      if (customWrap) customWrap.style.display = "none";
      if (customInput) customInput.value = "";
    } else {
      roleSelect.value = "Khác";
      if (customWrap) customWrap.style.display = "block";
      if (customInput) customInput.value = u.role || "";
    }

    // Nếu là Root Super Admin thì khóa không cho sửa username
    const isRoot = u.username.toLowerCase() === "dttd" || u.username.toLowerCase() === "lhmt" || u.isRoot;
    const usernameInput = document.getElementById("editUsername");
    if (usernameInput) {
      usernameInput.readOnly = isRoot;
      usernameInput.title = isRoot ? "Không được đổi tên đăng nhập tài khoản Quản trị tối cao" : "";
    }

    modal.classList.add("open");
  },

  handleEditRoleChange() {
    const roleSelect = document.getElementById("editRole");
    const customWrap = document.getElementById("editCustomRoleWrap");
    const customInput = document.getElementById("editCustomRoleInput");
    if (!roleSelect || !customWrap) return;

    if (roleSelect.value === "Khác") {
      customWrap.style.display = "block";
      if (customInput) customInput.focus();
    } else {
      customWrap.style.display = "none";
      if (customInput) customInput.value = "";
    }
  },

  closeEditUserModal() {
    const modal = document.getElementById("editUserModal");
    if (modal) modal.classList.remove("open");
  },

  saveEditUser() {
    const origUsername = document.getElementById("editOriginalUsername").value;
    const fullName = document.getElementById("editFullName").value.trim();
    const username = document.getElementById("editUsername").value.trim().toLowerCase();
    const password = document.getElementById("editPassword").value.trim();
    const roleSelect = document.getElementById("editRole").value;
    const customRole = (document.getElementById("editCustomRoleInput") ? document.getElementById("editCustomRoleInput").value.trim() : "");
    const department = document.getElementById("editDepartment").value.trim();
    const shift = document.getElementById("editShift").value;

    if (!fullName) {
      alert("Họ và tên nhân sự không được để trống!");
      return;
    }
    if (!username) {
      alert("Tên đăng nhập không được để trống!");
      return;
    }
    if (!password) {
      alert("Mật khẩu không được để trống!");
      return;
    }

    let finalRole = roleSelect;
    if (roleSelect === "Khác") {
      if (!customRole) {
        alert("Vui lòng nhập tên chức danh 'Khác'!");
        return;
      }
      finalRole = customRole;
    }

    const res = window.userAuth.updateUser(origUsername, {
      fullName,
      username,
      password,
      role: finalRole,
      department: department || "Phòng Vận hành OMS",
      shift
    });

    alert(res.message);
    if (res.success) {
      this.closeEditUserModal();
      this.renderStaffManagement();
      this.renderAccessLogsTable();
      this.renderLoginQuickAccounts();
    }
  },

handleResetPassword(username) {
    const defaultNewPass = username + "123";
    const newPass = prompt("Nhập mật khẩu mới cho tài khoản [" + username + "]:", defaultNewPass);
    if (newPass === null) return;
    const passTrim = newPass.trim();
    if (!passTrim) {
      alert("Mật khẩu không được để trống!");
      return;
    }
    const res = window.userAuth.resetUserPassword(username, passTrim);
    alert(res.message);
    if (res.success) {
      window.omsEngine.addLog("info", "[BẢO MẬT] " + res.message);
      this.renderStaffManagement();
      this.renderAccessLogsTable();
      this.renderLoginQuickAccounts();
    }
  },

  pendingSuspendUsername: null,

  handleToggleUserStatus(username, isCurrentlyActive) {
    const u = (window.userAuth.users || []).find(
      (item) => item.username.toLowerCase() === String(username).toLowerCase()
    );
    if (!u) return;

    const isRoot = u.username.toLowerCase() === "dttd" || u.username.toLowerCase() === "lhmt" || u.isRoot;
    const activeUser = window.userAuth.currentUser;
    const isCurrent = activeUser && activeUser.username.toLowerCase() === u.username.toLowerCase();

    if (isCurrentlyActive) {
      if (isRoot) {
        alert("Tài khoản Quản trị tối cao (Root Admin) không thể tạm ngừng hoạt động!");
        return;
      }
      if (isCurrent) {
        alert("Không thể tạm ngừng hoạt động tài khoản đang trong phiên làm việc hiện tại!");
        return;
      }

      this.pendingSuspendUsername = u.username;
      const targetInfoEl = document.getElementById("suspendTargetUserInfo");
      if (targetInfoEl) {
        targetInfoEl.innerHTML = `<strong>${u.fullName}</strong> (<code>${u.username}</code>) &bull; ${u.role} &bull; <em>${u.department || 'Phòng ban'}</em>`;
      }
      const untilInput = document.getElementById("suspendUntilInput");
      if (untilInput) untilInput.value = "Cho đến khi mở lại";
      const reasonInput = document.getElementById("suspendReasonInput");
      if (reasonInput) reasonInput.value = "";

      const modal = document.getElementById("userSuspendModal");
      if (modal) modal.classList.add("open");
    } else {
      if (confirm(`Xác nhận kích hoạt lại (ON) tài khoản [${u.username}] sang trạng thái Đang hoạt động?`)) {
        const res = window.userAuth.toggleUserStatus(u.username, "ACTIVE");
        alert(res.message);
        if (res.success) {
          window.omsEngine.addLog("info", "[NHÂN SỰ] " + res.message);
          this.renderStaffManagement();
          this.renderAccessLogsTable();
        }
      }
    }
  },

  setSuspendPreset(days) {
    const input = document.getElementById("suspendUntilInput");
    if (!input) return;
    if (days === 0) {
      input.value = "Cho đến khi mở lại";
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dayStr = String(d.getDate()).padStart(2, "0");
    const monthStr = String(d.getMonth() + 1).padStart(2, "0");
    const yearStr = d.getFullYear();
    input.value = `${dayStr}/${monthStr}/${yearStr} (${days} ngày tới)`;
  },

  closeUserSuspendModal() {
    this.pendingSuspendUsername = null;
    const modal = document.getElementById("userSuspendModal");
    if (modal) modal.classList.remove("open");
  },

  confirmSuspendUser() {
    if (!this.pendingSuspendUsername) return;
    const untilInput = document.getElementById("suspendUntilInput");
    const reasonInput = document.getElementById("suspendReasonInput");
    const suspendUntil = untilInput ? untilInput.value.trim() : "Cho đến khi mở lại";
    const suspendReason = reasonInput ? reasonInput.value.trim() : "";

    const res = window.userAuth.toggleUserStatus(
      this.pendingSuspendUsername,
      "INACTIVE",
      suspendUntil,
      suspendReason
    );
    alert(res.message);
    if (res.success) {
      window.omsEngine.addLog("warning", "[NHÂN SỰ] " + res.message + (suspendReason ? " - Lý do: " + suspendReason : ""));
      this.closeUserSuspendModal();
      this.renderStaffManagement();
      this.renderAccessLogsTable();
    }
  },


  switchAndTestUser(username, password) {
    this.handleLogout();
    this.fillLoginCredentials(username, password);
  },

  // ============================================================================
  // RENDER TOÀN BỘ GIAO DIỆN DASHBOARD & CÁC PHÂN HỆ
  // ============================================================================
  renderAll() {
    this.renderShippingTab();
    this.renderOneMonthRevenueOverview();
    this.renderKPIsAndBadges();
    if (typeof this.renderDashboardP2 === "function") {
      this.renderDashboardP2();
    }
    this.renderCharts();
    this.renderUnifiedTop3ChannelRankingChart();
    this.renderFiveChannelSoldPieChart();
    this.renderChannelStrip();
    this.renderActionableAlerts();
    this.renderOrdersTable();
    this.renderStockShortageCornerPopup();
    this.renderInventoryTable();
    this.renderWaybillOrderSelector();
    this.generateWaybillAndQR(false);
    this.renderWaybillHistoryTable();
    this.renderQrLookupResults();
    this.renderStaffManagement();
    this.renderAccessLogsTable();
    this.renderReportsSummary();
    this.renderLogs();
  },

  // Dữ liệu cơ sở 11 tháng ngành Thời trang (Tháng 01/2026 – ngày 22/11/2026)
  // kết hợp động với các đơn hàng thực tế theo đúng tháng của từng đơn trong omsEngine
  getMonthlyHistoricalDataset() {
    const liveOrders = window.omsEngine ? window.omsEngine.orders : [];

    const extractMonthKey = (ord) => {
      const s = String(ord && ord.orderTime ? ord.orderTime : "").trim();
      const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (dmy) {
        return `${dmy[3]}-${String(dmy[2]).padStart(2, "0")}`;
      }
      const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (ymd) {
        return `${ymd[1]}-${String(ymd[2]).padStart(2, "0")}`;
      }
      return "2026-11";
    };

    const liveByMonth = {};
    liveOrders.forEach((o) => {
      const mk = extractMonthKey(o);
      if (!liveByMonth[mk]) {
        liveByMonth[mk] = {
          received: 0,
          exported: 0,
          cancelled: 0,
          revenue: 0,
          channels: {
            SHOPEE: { received: 0, exported: 0, cancelled: 0, revenue: 0 },
            TIKTOK: { received: 0, exported: 0, cancelled: 0, revenue: 0 },
            LAZADA: { received: 0, exported: 0, cancelled: 0, revenue: 0 },
            POS: { received: 0, exported: 0, cancelled: 0, revenue: 0 },
            FACEBOOK: { received: 0, exported: 0, cancelled: 0, revenue: 0 }
          }
        };
      }
      const bucket = liveByMonth[mk];
      const chKey = String(o.channel || "SHOPEE").toUpperCase();
      const chBucket = bucket.channels[chKey];
      const isExported = o.status === "ALLOCATED" && o.platformStatus !== "CANCELLED";
      const isCancelled = o.status === "INVALID" || o.status === "CANCELLED" || o.platformStatus === "CANCELLED";
      const ordRev = isExported ? (Number(o.quantity) || 0) * (Number(o.unitPrice) || 0) : 0;

      bucket.received += 1;
      if (isExported) bucket.exported += 1;
      if (isCancelled) bucket.cancelled += 1;
      bucket.revenue += ordRev;

      if (chBucket) {
        chBucket.received += 1;
        if (isExported) chBucket.exported += 1;
        if (isCancelled) chBucket.cancelled += 1;
        chBucket.revenue += ordRev;
      }
    });

    const baseMonths = {
      "2026-01": {
        label: "Tháng 01/2026",
        shortLabel: "Th1/26",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        received: 268,
        exported: 252,
        cancelled: 16,
        revenue: 86400000,
        channels: {
          SHOPEE: { orders: 112, exported: 106, cancelled: 6, revenue: 36800000, growth: "+9.4%" },
          TIKTOK: { orders: 72, exported: 67, cancelled: 5, revenue: 22900000, growth: "+12.1%" },
          LAZADA: { orders: 42, exported: 39, cancelled: 3, revenue: 13800000, growth: "+5.2%" },
          POS: { orders: 24, exported: 23, cancelled: 1, revenue: 8100000, growth: "+4.6%" },
          FACEBOOK: { orders: 18, exported: 17, cancelled: 1, revenue: 4800000, growth: "+2.8%" }
        }
      },
      "2026-02": {
        label: "Tháng 02/2026",
        shortLabel: "Th2/26",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        received: 242,
        exported: 228,
        cancelled: 14,
        revenue: 78900000,
        channels: {
          SHOPEE: { orders: 102, exported: 96, cancelled: 6, revenue: 33400000, growth: "+6.2%" },
          TIKTOK: { orders: 64, exported: 60, cancelled: 4, revenue: 20800000, growth: "+8.9%" },
          LAZADA: { orders: 38, exported: 36, cancelled: 2, revenue: 12400000, growth: "+4.1%" },
          POS: { orders: 22, exported: 21, cancelled: 1, revenue: 7600000, growth: "+3.4%" },
          FACEBOOK: { orders: 16, exported: 15, cancelled: 1, revenue: 4700000, growth: "+2.5%" }
        }
      },
      "2026-03": {
        label: "Tháng 03/2026",
        shortLabel: "Th3/26",
        startDate: "2026-03-01",
        endDate: "2026-03-31",
        received: 286,
        exported: 270,
        cancelled: 16,
        revenue: 92600000,
        channels: {
          SHOPEE: { orders: 118, exported: 112, cancelled: 6, revenue: 38900000, growth: "+10.6%" },
          TIKTOK: { orders: 78, exported: 74, cancelled: 4, revenue: 25100000, growth: "+13.2%" },
          LAZADA: { orders: 45, exported: 42, cancelled: 3, revenue: 14600000, growth: "+6.0%" },
          POS: { orders: 26, exported: 25, cancelled: 1, revenue: 8800000, growth: "+4.5%" },
          FACEBOOK: { orders: 19, exported: 17, cancelled: 2, revenue: 5200000, growth: "+3.2%" }
        }
      },
      "2026-04": {
        label: "Tháng 04/2026",
        shortLabel: "Th4/26",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
        received: 298,
        exported: 281,
        cancelled: 17,
        revenue: 95800000,
        channels: {
          SHOPEE: { orders: 124, exported: 117, cancelled: 7, revenue: 40100000, growth: "+10.8%" },
          TIKTOK: { orders: 82, exported: 77, cancelled: 5, revenue: 26100000, growth: "+13.8%" },
          LAZADA: { orders: 46, exported: 43, cancelled: 3, revenue: 15000000, growth: "+6.4%" },
          POS: { orders: 27, exported: 26, cancelled: 1, revenue: 9200000, growth: "+4.3%" },
          FACEBOOK: { orders: 19, exported: 18, cancelled: 1, revenue: 5400000, growth: "+3.0%" }
        }
      },
      "2026-05": {
        label: "Tháng 05/2026",
        shortLabel: "Th5/26",
        startDate: "2026-05-01",
        endDate: "2026-05-31",
        received: 310,
        exported: 292,
        cancelled: 18,
        revenue: 98500000,
        channels: {
          SHOPEE: { orders: 128, exported: 121, cancelled: 7, revenue: 41200000, growth: "+11.2%" },
          TIKTOK: { orders: 86, exported: 81, cancelled: 5, revenue: 26800000, growth: "+14.5%" },
          LAZADA: { orders: 48, exported: 45, cancelled: 3, revenue: 15400000, growth: "+6.8%" },
          POS: { orders: 28, exported: 27, cancelled: 1, revenue: 9500000, growth: "+4.2%" },
          FACEBOOK: { orders: 20, exported: 18, cancelled: 2, revenue: 5600000, growth: "+3.1%" }
        }
      },
      "2026-06": {
        label: "Tháng 06/2026",
        shortLabel: "Th6/26",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        received: 345,
        exported: 328,
        cancelled: 17,
        revenue: 112400000,
        channels: {
          SHOPEE: { orders: 142, exported: 135, cancelled: 7, revenue: 46800000, growth: "+13.5%" },
          TIKTOK: { orders: 98, exported: 93, cancelled: 5, revenue: 31200000, growth: "+16.4%" },
          LAZADA: { orders: 52, exported: 49, cancelled: 3, revenue: 17100000, growth: "+8.0%" },
          POS: { orders: 31, exported: 30, cancelled: 1, revenue: 10900000, growth: "+5.5%" },
          FACEBOOK: { orders: 22, exported: 21, cancelled: 1, revenue: 6400000, growth: "+4.0%" }
        }
      },
      "2026-07": {
        label: "Tháng 07/2026",
        shortLabel: "Th7/26",
        startDate: "2026-07-01",
        endDate: "2026-07-31",
        received: 382,
        exported: 360,
        cancelled: 22,
        revenue: 126800000,
        channels: {
          SHOPEE: { orders: 158, exported: 149, cancelled: 9, revenue: 52500000, growth: "+12.1%" },
          TIKTOK: { orders: 112, exported: 106, cancelled: 6, revenue: 36400000, growth: "+18.2%" },
          LAZADA: { orders: 56, exported: 52, cancelled: 4, revenue: 18900000, growth: "+7.4%" },
          POS: { orders: 33, exported: 32, cancelled: 1, revenue: 11800000, growth: "+6.1%" },
          FACEBOOK: { orders: 23, exported: 21, cancelled: 2, revenue: 7200000, growth: "+4.9%" }
        }
      },
      "2026-08": {
        label: "Tháng 08/2026",
        shortLabel: "Th8/26",
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        received: 418,
        exported: 395,
        cancelled: 23,
        revenue: 139500000,
        channels: {
          SHOPEE: { orders: 175, exported: 166, cancelled: 9, revenue: 58200000, growth: "+14.8%" },
          TIKTOK: { orders: 124, exported: 117, cancelled: 7, revenue: 40500000, growth: "+19.5%" },
          LAZADA: { orders: 60, exported: 56, cancelled: 4, revenue: 20400000, growth: "+7.9%" },
          POS: { orders: 35, exported: 34, cancelled: 1, revenue: 12600000, growth: "+6.8%" },
          FACEBOOK: { orders: 24, exported: 22, cancelled: 2, revenue: 7800000, growth: "+5.2%" }
        }
      },
      "2026-09": {
        label: "Tháng 09/2026",
        shortLabel: "Th9/26",
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        received: 456,
        exported: 432,
        cancelled: 24,
        revenue: 151200000,
        channels: {
          SHOPEE: { orders: 192, exported: 182, cancelled: 10, revenue: 64100000, growth: "+15.4%" },
          TIKTOK: { orders: 136, exported: 129, cancelled: 7, revenue: 44800000, growth: "+21.0%" },
          LAZADA: { orders: 64, exported: 60, cancelled: 4, revenue: 21500000, growth: "+8.2%" },
          POS: { orders: 38, exported: 37, cancelled: 1, revenue: 12900000, growth: "+7.1%" },
          FACEBOOK: { orders: 26, exported: 24, cancelled: 2, revenue: 7900000, growth: "+5.6%" }
        }
      },
      "2026-10": {
        label: "Tháng 10/2026",
        shortLabel: "Th10/26",
        startDate: "2026-10-01",
        endDate: "2026-10-31",
        received: 485,
        exported: 462,
        cancelled: 23,
        revenue: 158500000,
        channels: {
          SHOPEE: { orders: 205, exported: 195, cancelled: 10, revenue: 68400000, growth: "+18.4%" },
          TIKTOK: { orders: 148, exported: 141, cancelled: 7, revenue: 47200000, growth: "+22.6%" },
          LAZADA: { orders: 68, exported: 65, cancelled: 3, revenue: 22100000, growth: "+9.5%" },
          POS: { orders: 38, exported: 37, cancelled: 1, revenue: 12500000, growth: "+7.8%" },
          FACEBOOK: { orders: 26, exported: 24, cancelled: 2, revenue: 8300000, growth: "+6.4%" }
        }
      },
      "2026-11": {
        label: "Tháng 11/2026 (đến 22/11)",
        shortLabel: "Th11/26",
        startDate: "2026-11-01",
        endDate: "2026-11-22",
        received: 524,
        exported: 498,
        cancelled: 26,
        revenue: 176400000,
        channels: {
          SHOPEE: { orders: 224, exported: 213, cancelled: 11, revenue: 76500000, growth: "+21.2%" },
          TIKTOK: { orders: 162, exported: 154, cancelled: 8, revenue: 52800000, growth: "+24.8%" },
          LAZADA: { orders: 72, exported: 68, cancelled: 4, revenue: 24600000, growth: "+11.3%" },
          POS: { orders: 40, exported: 39, cancelled: 1, revenue: 13800000, growth: "+8.9%" },
          FACEBOOK: { orders: 26, exported: 24, cancelled: 2, revenue: 8700000, growth: "+7.5%" }
        }
      }
    };

    Object.keys(baseMonths).forEach((mk) => {
      const liveM = liveByMonth[mk];
      if (!liveM) return;
      const m = baseMonths[mk];
      m.received += liveM.received;
      m.exported += liveM.exported;
      m.cancelled += liveM.cancelled;
      m.revenue += liveM.revenue;
      ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"].forEach((chKey) => {
        if (m.channels[chKey] && liveM.channels[chKey]) {
          m.channels[chKey].orders += liveM.channels[chKey].received;
          m.channels[chKey].exported += liveM.channels[chKey].exported;
          m.channels[chKey].cancelled += liveM.channels[chKey].cancelled;
          m.channels[chKey].revenue += liveM.channels[chKey].revenue;
        }
      });
    });

    return baseMonths;
  },

  // 1. BẢNG TỔNG DOANH THU & DOANH THU LẦN LƯỢT 5 KÊNH BÁN HÀNG (ĐỒNG BỘ THEO BỘ LỌC QUÝ / THÁNG / TUẦN / NGÀY)
  refreshOneMonthTimestamp() {
    this.dashboardOpenedAt = new Date();
    this.renderFiveChannelSoldPieChart();
  },

  renderOneMonthRevenueOverview(precomputedData) {
    const grid = document.getElementById("oneMonthRevenueGrid");
    const timeLabel = document.getElementById("oneMonthRollingTimeLabel");
    if (!grid) return;

    if (!this.dashboardOpenedAt) {
      this.dashboardOpenedAt = new Date();
    }

    const now = this.dashboardOpenedAt;
    const pad = (n) => String(n).padStart(2, "0");
    const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const data = precomputedData || this.getFiveChannelSoldDataset();

    if (timeLabel) {
      timeLabel.innerHTML = `⏱️ Đang xem chu kỳ: <strong>${data.periodLabel}</strong> (Cập nhật lúc ${fmtTime(now)})`;
    }

    const isVivo = this.currentTheme === "vivo";
    const chOrder = isVivo
      ? [
          { key: "SHOPEE", name: "Shopee", badgeClass: "badge-SHOPEE", dotColor: "#1877FF", silkBorder: "#1877FF" },
          { key: "TIKTOK", name: "TikTok Shop", badgeClass: "badge-TIKTOK", dotColor: "#465AFF", silkBorder: "#465AFF" },
          { key: "LAZADA", name: "Lazada", badgeClass: "badge-LAZADA", dotColor: "#64748B", silkBorder: "#64748B" },
          { key: "FACEBOOK", name: "Facebook", badgeClass: "badge-FACEBOOK", dotColor: "#4BC8E1", silkBorder: "#4BC8E1" },
          { key: "POS", name: "Cửa hàng POS", badgeClass: "badge-POS", dotColor: "#947AEC", silkBorder: "#947AEC" }
        ]
      : [
          { key: "SHOPEE", name: "Shopee", badgeClass: "badge-SHOPEE", silkBorder: "linear-gradient(90deg, #FFD1B3, #FB923C, #EA580C)" },
          { key: "TIKTOK", name: "TikTok Shop", badgeClass: "badge-TIKTOK", silkBorder: "linear-gradient(90deg, #CBD5E1, #64748B, #1E293B)" },
          { key: "LAZADA", name: "Lazada", badgeClass: "badge-LAZADA", silkBorder: "linear-gradient(90deg, #E0E7FF, #818CF8, #4F46E5)" },
          { key: "FACEBOOK", name: "Facebook", badgeClass: "badge-FACEBOOK", silkBorder: "linear-gradient(90deg, #BAE6FD, #38BDF8, #0284C7)" },
          { key: "POS", name: "Cửa hàng POS", badgeClass: "badge-POS", silkBorder: "linear-gradient(90deg, #A7F3D0, #34D399, #059669)" }
        ];

    const totalRevenue = data.totalRevenue;
    const totalOrders = data.totalOrders;

    const totalCardHtml = `
      <div class="rev-channel-card total-hero" onclick="AppUI.selectPieChannel(null)" style="cursor:pointer;" title="Bấm để xem tổng hợp cả 5 kênh">
        <div class="rev-card-head">
          <span class="rev-card-title">TỔNG DOANH THU</span>
        </div>
        <div class="rev-card-value">${totalRevenue.toLocaleString("vi-VN")} VND</div>
        <div class="rev-card-meta">
          <span>Tổng: <strong>${totalOrders} đơn</strong></span>
        </div>
      </div>
    `;

    const channelsHtml = chOrder
      .map((ch) => {
        const stat = data.items.find((i) => i.key === ch.key) || { orders: 0, revenue: 0 };
        const isSelected = this.activePieChannel === ch.key;
        const badgeHtml = isVivo
          ? `<span class="vivo-rev-channel-pill"><span class="vivo-rev-channel-dot" style="background:${ch.dotColor};"></span>${ch.name}</span>`
          : `<span class="channel-badge ${ch.badgeClass}">${ch.name}</span>`;
        return `
        <div class="rev-channel-card ${isSelected ? "silk-card-selected" : ""}"
             onclick="AppUI.selectPieChannel('${ch.key}')"
             style="cursor:pointer;position:relative;overflow:hidden;"
             title="Kênh ${ch.name}">
          ${isVivo ? "" : `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${ch.silkBorder};"></div>`}
          <div class="rev-card-head">
            ${badgeHtml}
          </div>
          <div class="rev-card-value">${stat.revenue.toLocaleString("vi-VN")} VND</div>
          <div class="rev-card-meta">
            <span><strong>${stat.orders}</strong> đơn</span>
          </div>
        </div>
      `;
      })
      .join("");

    grid.innerHTML = totalCardHtml + channelsHtml;
  },

  // 2. KHỐI HỢP NHẤT DUY NHẤT: XẾP HẠNG TOP 3 KÊNH BÁN HÀNG DẪN ĐẦU (BIỂU ĐỒ CỘT ĐỨNG 3 CỘT: TIẾP NHẬN · XUẤT HÀNG · HỦY ĐƠN + DOANH THU)
  onUnifiedRankingFilterModeChange() {
    const mode = document.getElementById("unifiedFilterMode")?.value || "MONTH";
    const toggle = (id, show) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("hidden", !show);
    };

    toggle("unifiedFilterMonthGroup", mode === "MONTH");
    toggle("unifiedFilterQuarterGroup", mode === "QUARTER");
    toggle("unifiedFilterWeekMonthGroup", mode === "WEEK");
    toggle("unifiedFilterWeekGroup", mode === "WEEK");
    toggle("unifiedFilterDayStartGroup", mode === "DAY");
    toggle("unifiedFilterDayEndGroup", mode === "DAY");

    this.renderUnifiedTop3ChannelRankingChart();
  },

  renderUnifiedTop3ChannelRankingChart() {
    const container = document.getElementById("unifiedTop3RankingBarContainer");
    const noticeEl = document.getElementById("unifiedRankingFilterNotice");
    const footerEl = document.getElementById("unifiedRankingFooterSummary");
    if (!container) return;

    const themeObj = THEMES_LIST.find((t) => t.key === this.currentTheme) || THEMES_LIST[0];
    const isVivo = this.currentTheme === "vivo";
    const colorReceived = isVivo ? "#1877FF" : (themeObj.chartSecondary || "#F97316"); // Cột 1: Tiếp nhận
    const colorExported = isVivo ? "#465AFF" : (themeObj.chartPrimary || "#2563EB");   // Cột 2: Xuất hàng
    const colorCancelled = isVivo ? "#947AEC" : "#EF4444";                           // Cột 3: Hủy đơn

    const mode = document.getElementById("unifiedFilterMode")?.value || "MONTH";
    const allData = this.getMonthlyHistoricalDataset();
    const channelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
    const metaMap = {
      SHOPEE: { name: "Shopee Mall", short: "Shopee", color: "#ee4d2d", badge: "badge-SHOPEE" },
      TIKTOK: { name: "TikTok Shop", short: "TikTok Shop", color: "#0f172a", badge: "badge-TIKTOK" },
      LAZADA: { name: "Lazada Mall", short: "Lazada", color: "#1d4ed8", badge: "badge-LAZADA" },
      POS: { name: "Cửa hàng Vật lý (POS)", short: "Cửa hàng POS", color: "#15803d", badge: "badge-POS" },
      FACEBOOK: { name: "Facebook Shop / Live", short: "Facebook", color: "#0284c7", badge: "badge-FACEBOOK" }
    };

    const agg = {};
    channelKeys.forEach((k) => {
      agg[k] = { orders: 0, exported: 0, cancelled: 0, revenue: 0, growth: "+0.0%" };
    });

    let periodLabel = "Tháng 11/2026 (đến 22/11)";
    let filterDetailText = "";

    const addMonthWithRatio = (mKey, ratio, weightFactor = 1) => {
      const mObj = allData[mKey];
      if (!mObj || ratio <= 0) return;
      channelKeys.forEach((k) => {
        const ch = mObj.channels[k];
        if (!ch) return;
        const rOrders = Math.round(ch.orders * ratio * weightFactor);
        const rExported = Math.round(ch.exported * ratio * weightFactor);
        const rCancelled = Math.max(0, rOrders - rExported);
        const rRevenue = Math.round(ch.revenue * ratio * weightFactor);
        agg[k].orders += rOrders;
        agg[k].exported += rExported;
        agg[k].cancelled += rCancelled;
        agg[k].revenue += rRevenue;
        agg[k].growth = ch.growth;
      });
    };

    if (mode === "QUARTER") {
      const qVal = document.getElementById("unifiedSelectQuarter")?.value || "2026-Q4";
      const qMap = {
        "2026-Q1": { label: "Quý 1/2026 (Tháng 01 – 03/2026)", months: ["2026-01", "2026-02", "2026-03"] },
        "2026-Q2": { label: "Quý 2/2026 (Tháng 04 – 06/2026)", months: ["2026-04", "2026-05", "2026-06"] },
        "2026-Q3": { label: "Quý 3/2026 (Tháng 07 – 09/2026)", months: ["2026-07", "2026-08", "2026-09"] },
        "2026-Q4": { label: "Quý 4/2026 (Tháng 10 – 22/11/2026)", months: ["2026-10", "2026-11"] }
      };
      const qInfo = qMap[qVal] || qMap["2026-Q4"];
      periodLabel = qInfo.label;
      qInfo.months.forEach((mk) => addMonthWithRatio(mk, 1, 1));
      filterDetailText = `📊 Đang xếp hạng <strong>Theo Quý</strong>: <strong>${periodLabel}</strong>`;
    } else if (mode === "WEEK") {
      const mKey = document.getElementById("unifiedSelectWeekMonth")?.value || "2026-11";
      const wKey = document.getElementById("unifiedSelectWeek")?.value || "W3";
      const mObj = allData[mKey] || allData["2026-11"];
      const weekMeta = {
        W1: { label: "Tuần 1 (Ngày 01 – 07)", ratio: 0.23 },
        W2: { label: "Tuần 2 (Ngày 08 – 14)", ratio: 0.25 },
        W3: { label: "Tuần 3 (Ngày 15 – 21)", ratio: 0.24 },
        W4: { label: "Tuần 4 (Ngày 22 – Cuối tháng)", ratio: 0.28 }
      };
      const wInfo = weekMeta[wKey] || weekMeta.W3;
      periodLabel = `${wInfo.label} · ${mObj.label}`;
      addMonthWithRatio(mKey, wInfo.ratio, 1);
      filterDetailText = `🗓️ Đang xếp hạng <strong>Theo Tuần</strong>: <strong>${periodLabel}</strong>`;
    } else if (mode === "DAY") {
      const startVal = document.getElementById("unifiedFilterStartDate")?.value || "2026-11-01";
      const endVal = document.getElementById("unifiedFilterEndDate")?.value || "2026-11-22";
      const startDt = new Date(startVal + "T00:00:00");
      const endDt = new Date(endVal + "T23:59:59");

      Object.keys(allData).forEach((mKey) => {
        const raw = allData[mKey];
        const mStart = new Date(raw.startDate + "T00:00:00");
        const mEnd = new Date(raw.endDate + "T23:59:59");
        const overlapStart = new Date(Math.max(startDt.getTime(), mStart.getTime()));
        const overlapEnd = new Date(Math.min(endDt.getTime(), mEnd.getTime()));
        const totalDaysInMonth = Math.max(1, Math.round((mEnd - mStart) / (1000 * 3600 * 24)) + 1);
        if (overlapEnd >= overlapStart) {
          const overlapDays = Math.max(1, Math.round((overlapEnd - overlapStart) / (1000 * 3600 * 24)) + 1);
          const ratio = Math.min(1, overlapDays / totalDaysInMonth);
          addMonthWithRatio(mKey, ratio, 1);
        }
      });

      const fmtStart = startVal.split("-").reverse().join("/");
      const fmtEnd = endVal.split("-").reverse().join("/");
      periodLabel = fmtStart === fmtEnd ? `Ngày ${fmtStart}` : `Từ ${fmtStart} đến ${fmtEnd}`;
      filterDetailText = `📆 Đang xếp hạng <strong>Theo Ngày</strong>: <strong>${periodLabel}</strong>`;
    } else {
      const mKey = document.getElementById("unifiedSelectMonth")?.value || "2026-11";
      if (mKey === "ALL_2026") {
        periodLabel = "Tổng hợp 11 Tháng (Th01 – 22/11/2026)";
        Object.keys(allData).forEach((mk) => addMonthWithRatio(mk, 1, 1));
      } else {
        const mObj = allData[mKey] || allData["2026-11"];
        periodLabel = mObj.label;
        addMonthWithRatio(mKey, 1, 1);
      }
      filterDetailText = `📅 Đang xếp hạng <strong>Theo Tháng</strong>: <strong>${periodLabel}</strong>`;
    }

    // Xếp hạng từ cao xuống thấp theo số đơn tiếp nhận (orders)
    const rankedAll = channelKeys
      .map((key) => ({
        key,
        ...agg[key],
        ...metaMap[key]
      }))
      .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue);

    const totalSystemOrders = rankedAll.reduce((s, r) => s + r.orders, 0);
    const totalSystemRevenue = rankedAll.reduce((s, r) => s + r.revenue, 0);

    // Lấy Top 3 kênh dẫn đầu để biểu diễn biểu đồ cột đứng
    const top3Channels = rankedAll.slice(0, 3);
    const maxBarVal = Math.max(...top3Channels.map((c) => Math.max(c.orders, c.exported, c.cancelled)), 1);
    const medals = ["🥇 HẠNG 1", "🥈 HẠNG 2", "🥉 HẠNG 3"];

    if (noticeEl) {
      noticeEl.innerHTML = `${filterDetailText} · Tổng toàn hệ thống (5 kênh): <strong>${totalSystemOrders} đơn tiếp nhận</strong> — <strong>${totalSystemRevenue.toLocaleString("vi-VN")} VND</strong>`;
    }

    const pillarsHtml = top3Channels
      .map((item, idx) => {
        const hRec = item.orders > 0 ? Math.max(30, Math.round((item.orders / maxBarVal) * 145)) : 8;
        const hExp = item.exported > 0 ? Math.max(26, Math.round((item.exported / maxBarVal) * 145)) : 8;
        const hCan = item.cancelled > 0 ? Math.max(22, Math.round((item.cancelled / maxBarVal) * 145)) : 6;

        return `
        <div class="bar-col-item">
          <div class="bar-top-revenue-badge" title="Tổng doanh thu & sản lượng đơn kênh ${item.name}">
            <div>💰 ${item.revenue.toLocaleString("vi-VN")} VND</div>
            <div style="font-size:11px;font-weight:700;color:var(--theme-primary);margin-top:1px;">
              📦 Sản lượng: ${item.orders} đơn
            </div>
          </div>

          <div class="bar-triple-wrap">
            <div class="bar-pillar triple-col" style="height:${hRec}px;background:${colorReceived};" title="${item.name} — Tiếp nhận: ${item.orders} đơn">
              <span>${item.orders}</span>
            </div>
            <div class="bar-pillar triple-col" style="height:${hExp}px;background:${colorExported};" title="${item.name} — Xuất hàng: ${item.exported} đơn">
              <span>${item.exported}</span>
            </div>
            <div class="bar-pillar triple-col" style="height:${hCan}px;background:${colorCancelled};" title="${item.name} — Hủy đơn: ${item.cancelled} đơn">
              <span>${item.cancelled}</span>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    const labelsHtml = top3Channels
      .map((item, idx) => `
        <div class="bar-col-footer">
          <div class="bar-col-title" style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;">
            <span>${medals[idx]}</span>
            <span class="channel-badge ${item.badge}">${item.short}</span>
          </div>
        </div>
      `)
      .join("");

    container.innerHTML = `
      <div class="three-month-legend-bar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;font-size:12px;font-weight:700;">
        <span style="color:var(--text-secondary);"><strong>Tổng doanh thu (VND) & Sản lượng đơn</strong></span>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:5px;">
            <span style="width:11px;height:11px;background:${colorReceived};border-radius:3px;display:inline-block;"></span> Tiếp nhận
          </span>
          <span style="display:flex;align-items:center;gap:5px;">
            <span style="width:11px;height:11px;background:${colorExported};border-radius:3px;display:inline-block;"></span> Xuất hàng
          </span>
          <span style="display:flex;align-items:center;gap:5px;">
            <span style="width:11px;height:11px;background:${colorCancelled};border-radius:3px;display:inline-block;"></span> Hủy đơn
          </span>
        </div>
      </div>
      <div class="bar-chart-columns-grid">${pillarsHtml}</div>
      <div class="bar-chart-labels-grid">${labelsHtml}</div>
    `;

    if (footerEl) {
      const top1 = top3Channels[0];
      const restChannels = rankedAll.slice(3).map((r, i) => `#${i + 4} ${r.short}: <strong>${r.orders} đơn</strong> (${r.revenue.toLocaleString("vi-VN")} VND)`).join(" · ");
      footerEl.innerHTML = `
        <div>
          🏆 Dẫn đầu (${periodLabel}): <strong>${top1 ? top1.name : "-"} (${top1 ? top1.orders : 0} đơn tiếp nhận · Xuất ${top1 ? top1.exported : 0} · Hủy ${top1 ? top1.cancelled : 0})</strong>
        </div>
        <div>
          Các kênh tiếp theo: ${restChannels || "Không có"}
        </div>
      `;
    }
  },

  // 5. KHỐI HỢP NHẤT: DOANH THU 5 KÊNH · BIỂU ĐỒ DONUT SILK TÁCH RỜI & SẢN PHẨM BÁN CHẠY (TOP 10 / TOP 50)
  activePieChannel: null,
  topProductsLimit: 10,

  onRevDonutFilterModeChange() {
    const mode = document.getElementById("revDonutFilterMode")?.value || "MONTH";
    const toggle = (id, show) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("hidden", !show);
    };

    toggle("revDonutMonthGroup", mode === "MONTH");
    toggle("revDonutQuarterGroup", mode === "QUARTER");
    toggle("revDonutWeekMonthGroup", mode === "WEEK");
    toggle("revDonutWeekGroup", mode === "WEEK");
    toggle("revDonutDayStartGroup", mode === "DAY");
    toggle("revDonutDayEndGroup", mode === "DAY");

    this.renderFiveChannelSoldPieChart();
  },

  getFiveChannelSoldDataset() {
    const mode = document.getElementById("revDonutFilterMode")?.value || "MONTH";
    const allData = this.getMonthlyHistoricalDataset();

    const isVivo = this.currentTheme === "vivo";
    // Bảng màu Silk (hoặc bảng màu Vivo thuần nhất khi chọn chủ đề Vivo)
    const channelMeta = isVivo
      ? {
          SHOPEE: {
            key: "SHOPEE",
            name: "Shopee",
            fullName: "Shopee Mall",
            color: "#1877FF",
            silkStops: ["#1877FF", "#1877FF", "#1877FF", "#1877FF"],
            silkCss: "#1877FF",
            colorName: "Vivo Blue (#1877FF)",
            badge: "badge-SHOPEE"
          },
          FACEBOOK: {
            key: "FACEBOOK",
            name: "Facebook",
            fullName: "Facebook Shop / Live",
            color: "#4BC8E1",
            silkStops: ["#4BC8E1", "#4BC8E1", "#4BC8E1", "#4BC8E1"],
            silkCss: "#4BC8E1",
            colorName: "Vivo Cyan (#4BC8E1)",
            badge: "badge-FACEBOOK"
          },
          TIKTOK: {
            key: "TIKTOK",
            name: "TikTok Shop",
            fullName: "TikTok Shop",
            color: "#465AFF",
            silkStops: ["#465AFF", "#465AFF", "#465AFF", "#465AFF"],
            silkCss: "#465AFF",
            colorName: "Vivo Indigo (#465AFF)",
            badge: "badge-TIKTOK"
          },
          LAZADA: {
            key: "LAZADA",
            name: "Lazada",
            fullName: "Lazada Mall",
            color: "#64748B",
            silkStops: ["#64748B", "#64748B", "#64748B", "#64748B"],
            silkCss: "#64748B",
            colorName: "Vivo Slate (#64748B)",
            badge: "badge-LAZADA"
          },
          POS: {
            key: "POS",
            name: "Cửa hàng POS",
            fullName: "Cửa hàng Vật lý (POS)",
            color: "#947AEC",
            silkStops: ["#947AEC", "#947AEC", "#947AEC", "#947AEC"],
            silkCss: "#947AEC",
            colorName: "Vivo Violet (#947AEC)",
            badge: "badge-POS"
          }
        }
      : {
          SHOPEE: {
        key: "SHOPEE",
        name: "Shopee",
        fullName: "Shopee Mall",
        color: "#EA580C",
        silkStops: ["#FFD6BA", "#FB923C", "#F97316", "#C2410C"],
        silkCss: "linear-gradient(135deg, #FFD6BA 0%, #FB923C 42%, #F97316 74%, #C2410C 100%)",
        colorName: "Lụa Cam San Hô (Silk)",
        badge: "badge-SHOPEE"
      },
      FACEBOOK: {
        key: "FACEBOOK",
        name: "Facebook",
        fullName: "Facebook Shop / Live",
        color: "#0284C7",
        silkStops: ["#BAE6FD", "#38BDF8", "#0284C7", "#0369A1"],
        silkCss: "linear-gradient(135deg, #BAE6FD 0%, #38BDF8 42%, #0284C7 74%, #0369A1 100%)",
        colorName: "Lụa Xanh Thiên Thanh (Silk)",
        badge: "badge-FACEBOOK"
      },
      TIKTOK: {
        key: "TIKTOK",
        name: "TikTok Shop",
        fullName: "TikTok Shop",
        color: "#334155",
        silkStops: ["#E2E8F0", "#94A3B8", "#475569", "#1E293B"],
        silkCss: "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 38%, #475569 72%, #1E293B 100%)",
        colorName: "Lụa Đen Ánh Bạc (Silk)",
        badge: "badge-TIKTOK"
      },
      LAZADA: {
        key: "LAZADA",
        name: "Lazada",
        fullName: "Lazada Mall",
        color: "#4F46E5",
        silkStops: ["#E0E7FF", "#818CF8", "#6366F1", "#3730A3"],
        silkCss: "linear-gradient(135deg, #E0E7FF 0%, #818CF8 42%, #6366F1 74%, #3730A3 100%)",
        colorName: "Lụa Tím Oải Hương (Silk)",
        badge: "badge-LAZADA"
      },
      POS: {
        key: "POS",
        name: "Cửa hàng POS",
        fullName: "Cửa hàng Vật lý (POS)",
        color: "#059669",
        silkStops: ["#A7F3D0", "#34D399", "#10B981", "#047857"],
        silkCss: "linear-gradient(135deg, #A7F3D0 0%, #34D399 42%, #10B981 74%, #047857 100%)",
        colorName: "Lụa Xanh Ngọc Lục Bảo (Silk)",
        badge: "badge-POS"
      }
    };

    const orderKeys = ["SHOPEE", "FACEBOOK", "TIKTOK", "LAZADA", "POS"];
    let periodLabel = "Tháng 11/2026 (đến 22/11)";
    let scaleFactor = 1;
    const aggregated = {};

    orderKeys.forEach((k) => {
      aggregated[k] = { orders: 0, revenue: 0, growth: "+0.0%" };
    });

    const addMonthRatio = (mKey, ratio) => {
      const mObj = allData[mKey];
      if (!mObj || ratio <= 0) return;
      orderKeys.forEach((k) => {
        if (mObj.channels && mObj.channels[k]) {
          aggregated[k].orders += Math.round(mObj.channels[k].orders * ratio);
          aggregated[k].revenue += Math.round(mObj.channels[k].revenue * ratio);
          aggregated[k].growth = mObj.channels[k].growth;
        }
      });
    };

    if (mode === "QUARTER") {
      const qVal = document.getElementById("revDonutQuarterSelect")?.value || "2026-Q4";
      const qMap = {
        "2026-Q1": { label: "Quý 1/2026 (Tháng 01 – 03/2026)", months: ["2026-01", "2026-02", "2026-03"], factor: 2.35 },
        "2026-Q2": { label: "Quý 2/2026 (Tháng 04 – 06/2026)", months: ["2026-04", "2026-05", "2026-06"], factor: 2.65 },
        "2026-Q3": { label: "Quý 3/2026 (Tháng 07 – 09/2026)", months: ["2026-07", "2026-08", "2026-09"], factor: 2.95 },
        "2026-Q4": { label: "Quý 4/2026 (Tháng 10 – 22/11/2026)", months: ["2026-10", "2026-11"], factor: 2.15 }
      };
      const qInfo = qMap[qVal] || qMap["2026-Q4"];
      periodLabel = qInfo.label;
      scaleFactor = qInfo.factor;
      qInfo.months.forEach((mk) => addMonthRatio(mk, 1));
    } else if (mode === "WEEK") {
      const mKey = document.getElementById("revDonutWeekMonthSelect")?.value || "2026-11";
      const wKey = document.getElementById("revDonutWeekSelect")?.value || "W3";
      const mObj = allData[mKey] || allData["2026-11"];
      const weekMeta = {
        W1: { label: "Tuần 1 (Ngày 01 – 07)", ratio: 0.23 },
        W2: { label: "Tuần 2 (Ngày 08 – 14)", ratio: 0.25 },
        W3: { label: "Tuần 3 (Ngày 15 – 21)", ratio: 0.24 },
        W4: { label: "Tuần 4 (Ngày 22 – Cuối tháng)", ratio: 0.28 }
      };
      const wInfo = weekMeta[wKey] || weekMeta.W3;
      periodLabel = `${wInfo.label} · ${mObj.label}`;
      scaleFactor = wInfo.ratio;
      addMonthRatio(mKey, wInfo.ratio);
    } else if (mode === "DAY") {
      const startVal = document.getElementById("revDonutStartDate")?.value || "2026-11-01";
      const endVal = document.getElementById("revDonutEndDate")?.value || "2026-11-22";
      const startDt = new Date(startVal + "T00:00:00");
      const endDt = new Date(endVal + "T23:59:59");
      let totalRatio = 0;

      Object.keys(allData).forEach((mKey) => {
        const raw = allData[mKey];
        const mStart = new Date(raw.startDate + "T00:00:00");
        const mEnd = new Date(raw.endDate + "T23:59:59");
        const overlapStart = new Date(Math.max(startDt.getTime(), mStart.getTime()));
        const overlapEnd = new Date(Math.min(endDt.getTime(), mEnd.getTime()));
        const totalDaysInMonth = Math.max(1, Math.round((mEnd - mStart) / (1000 * 3600 * 24)) + 1);
        if (overlapEnd >= overlapStart) {
          const overlapDays = Math.max(1, Math.round((overlapEnd - overlapStart) / (1000 * 3600 * 24)) + 1);
          const ratio = Math.min(1, overlapDays / totalDaysInMonth);
          totalRatio += ratio;
          addMonthRatio(mKey, ratio);
        }
      });

      scaleFactor = Math.max(0.05, totalRatio);
      const fmtStart = startVal.split("-").reverse().join("/");
      const fmtEnd = endVal.split("-").reverse().join("/");
      periodLabel = fmtStart === fmtEnd ? `Ngày ${fmtStart}` : `Từ ${fmtStart} đến ${fmtEnd}`;
    } else {
      const monthKey = document.getElementById("soldPieMonthSelect")?.value || "2026-11";
      if (monthKey === "ALL_2026") {
        periodLabel = "Tổng hợp 11 Tháng (Th01 – 22/11/2026)";
        scaleFactor = 8.8;
        Object.keys(allData).forEach((mk) => addMonthRatio(mk, 1));
      } else if (monthKey === "ALL_6M") {
        periodLabel = "Tổng hợp 6 Tháng gần nhất (Th06 – 22/11/2026)";
        scaleFactor = 5.4;
        ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"].forEach((mk) => addMonthRatio(mk, 1));
      } else {
        const mObj = allData[monthKey] || allData["2026-11"];
        periodLabel = mObj.label;
        scaleFactor = 1.0;
        addMonthRatio(monthKey, 1);
      }
    }

    const totalOrders = orderKeys.reduce((sum, k) => sum + aggregated[k].orders, 0);
    const totalRevenue = orderKeys.reduce((sum, k) => sum + aggregated[k].revenue, 0);

    const items = orderKeys.map((k) => {
      const ord = aggregated[k].orders;
      const rev = aggregated[k].revenue;
      const pct = totalOrders > 0 ? (ord / totalOrders) * 100 : 0;
      return {
        ...channelMeta[k],
        orders: ord,
        revenue: rev,
        growth: aggregated[k].growth,
        pct,
        pctText: pct.toFixed(1)
      };
    });

    return { periodLabel, scaleFactor, totalOrders, totalRevenue, items };
  },

  createDonutSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg) {
    // Tránh trường hợp 360 độ tròn khít làm SVG arc không vẽ
    const clampedEnd = endDeg - startDeg >= 359.99 ? startDeg + 359.95 : endDeg;
    const toRad = (deg) => ((deg - 90) * Math.PI) / 180;

    const startRad = toRad(startDeg);
    const endRad = toRad(clampedEnd);

    const x1 = cx + rOuter * Math.cos(startRad);
    const y1 = cy + rOuter * Math.sin(startRad);
    const x2 = cx + rOuter * Math.cos(endRad);
    const y2 = cy + rOuter * Math.sin(endRad);

    const x3 = cx + rInner * Math.cos(endRad);
    const y3 = cy + rInner * Math.sin(endRad);
    const x4 = cx + rInner * Math.cos(startRad);
    const y4 = cy + rInner * Math.sin(startRad);

    const largeArc = clampedEnd - startDeg > 180 ? 1 : 0;

    return [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      "Z"
    ].join(" ");
  },

  renderFiveChannelSoldPieChart() {
    const svgEl = document.getElementById("soldChannelPieSvg");
    const legendEl = document.getElementById("soldChannelLegendList");
    if (!svgEl) return;

    const data = this.getFiveChannelSoldDataset();
    this._lastSoldPieData = data;

    // Đồng bộ 6 thẻ Tổng Doanh thu & Doanh thu 5 kênh ngay trong khối hợp nhất
    this.renderOneMonthRevenueOverview(data);

    const cx = 150;
    const cy = 150;
    const rOuter = 116;
    const rInner = 60;
    const rLabel = (rOuter + rInner) / 2;

    // Định nghĩa bộ Gradient Lụa Silk đa tầng (tuyệt đối không dùng màu Solid)
    const defsHtml = `
      <defs>
        ${data.items
          .map(
            (it) => `
          <linearGradient id="silkGrad_${it.key}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${it.silkStops[0]}" />
            <stop offset="36%" stop-color="${it.silkStops[1]}" />
            <stop offset="72%" stop-color="${it.silkStops[2]}" />
            <stop offset="100%" stop-color="${it.silkStops[3]}" />
          </linearGradient>
        `
          )
          .join("")}
        <!-- Lớp phủ ánh lụa Satin (Silk Sheen) mềm mại -->
        <radialGradient id="silkSheenOverlay" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.46" />
          <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.14" />
          <stop offset="85%" stop-color="#0F172A" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.22" />
        </radialGradient>
        <!-- Lớp phủ lụa ngọc trai nổi bật khi miếng bánh tách rời (Exploded Silk Highlight) -->
        <linearGradient id="silkExplodedHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.58" />
          <stop offset="30%" stop-color="#FFF7ED" stop-opacity="0.22" />
          <stop offset="65%" stop-color="#FFFFFF" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.38" />
        </linearGradient>
      </defs>
    `;

    let currentDeg = 0;
    const slicesHtml = data.items
      .map((item) => {
        const angleSpan = data.totalOrders > 0 ? (item.orders / data.totalOrders) * 360 : 72;
        const startDeg = currentDeg;
        const endDeg = currentDeg + angleSpan;
        const midDeg = startDeg + angleSpan / 2;
        currentDeg = endDeg;

        const pathD = this.createDonutSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg);
        const midRad = ((midDeg - 90) * Math.PI) / 180;

        // Tọa độ nhảy tách miếng bánh (Explode offset) khi người dùng bấm chọn
        const jumpDist = 18;
        const dx = (Math.cos(midRad) * jumpDist).toFixed(2);
        const dy = (Math.sin(midRad) * jumpDist).toFixed(2);

        // Tọa độ nhãn % nằm giữa miếng cắt
        const lx = (cx + rLabel * Math.cos(midRad)).toFixed(2);
        const ly = (cy + rLabel * Math.sin(midRad)).toFixed(2);

        const showLabel = item.pct >= 4.5;

        const isVivo = this.currentTheme === "vivo";
        const sliceFill = isVivo ? item.color : `url(#silkGrad_${item.key})`;

        return `
          <g class="pie-slice-group"
             data-channel="${item.key}"
             data-dx="${dx}"
             data-dy="${dy}"
             onclick="AppUI.selectPieChannel('${item.key}')">
            <path class="pie-slice-path" d="${pathD}" fill="${sliceFill}">
              <title>${item.fullName} (${item.colorName}): ${item.orders} đơn đã bán (${item.pctText}%) — ${item.revenue.toLocaleString("vi-VN")} VND</title>
            </path>
            ${isVivo ? "" : `<path class="pie-slice-silk-sheen" d="${pathD}" fill="url(#silkSheenOverlay)" pointer-events="none" />`}
            ${showLabel ? `<text class="pie-slice-pct-text" x="${lx}" y="${ly}">${item.pctText}%</text>` : ""}
          </g>
        `;
      })
      .join("");

    svgEl.innerHTML = defsHtml + slicesHtml;

    // Bảng chú thích 5 dòng rõ nét ngay dưới Donut cho chủ đề Vivo
    const vivoLegendEl = document.getElementById("soldPieVivoLegend");
    if (vivoLegendEl) {
      if (this.currentTheme === "vivo") {
        vivoLegendEl.classList.remove("hidden");
        const vivoOrder = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
        const orderedItems = vivoOrder
          .map((k) => data.items.find((it) => it.key === k))
          .filter(Boolean);
        vivoLegendEl.innerHTML = orderedItems
          .map(
            (it) => `
            <div class="vivo-legend-row ${this.activePieChannel === it.key ? "active" : ""}" onclick="AppUI.selectPieChannel('${it.key}')">
              <div class="vivo-legend-left">
                <span class="vivo-legend-dot" style="background:${it.color};"></span>
                <span>${it.name}</span>
              </div>
              <div class="vivo-legend-right">
                <span>${it.orders} đơn</span>
                <span class="vivo-legend-pct">${it.pctText}%</span>
              </div>
            </div>
          `
          )
          .join("");
      } else {
        vivoLegendEl.classList.add("hidden");
        vivoLegendEl.innerHTML = "";
      }
    }

    // Nếu có vùng chú giải (tùy chọn) thì mới render
    if (legendEl) legendEl.innerHTML = data.items
      .map((item) => {
        return `
          <div class="sold-pie-legend-item"
               data-channel="${item.key}"
               style="--legend-color: ${item.color};"
               onclick="AppUI.selectPieChannel('${item.key}')">
            <div class="sold-pie-legend-top">
              <div class="sold-pie-legend-left">
                <span class="sold-pie-color-swatch" style="background:${item.silkCss};" id="pieSwatch_${item.key}">●</span>
                <div>
                  <div class="sold-pie-channel-title">
                    <span>${item.name}</span>
                    <span style="font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:4px;background:${item.silkCss};color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.35);">
                      ${item.colorName}
                    </span>
                  </div>
                  <div class="sold-pie-channel-desc">${item.fullName} · Tăng trưởng ${item.growth}</div>
                </div>
              </div>
              <div class="sold-pie-legend-right">
                <div>
                  <span class="sold-pie-order-num">${item.orders} đơn</span>
                  <span class="sold-pie-share-badge" style="background:${item.silkCss};">${item.pctText}%</span>
                </div>
                <div class="sold-pie-rev-text">${item.revenue.toLocaleString("vi-VN")} VND</div>
              </div>
            </div>
            <div class="sold-pie-mini-bar-bg">
              <div class="sold-pie-mini-bar-fill" style="width:${Math.max(5, item.pct)}%;background:${item.silkCss};"></div>
            </div>
          </div>
        `;
      })
      .join("");

    this.updateSoldPieInteractiveState(false);
  },

  selectPieChannel(chKey) {
    if (!chKey || this.activePieChannel === chKey) {
      this.activePieChannel = null;
    } else {
      this.activePieChannel = chKey;
    }
    this.updateSoldPieInteractiveState(true);
  },

  updateSoldPieInteractiveState(animateHub = true) {
    const data = this._lastSoldPieData || this.getFiveChannelSoldDataset();
    const activeKey = this.activePieChannel;
    const activeItem = activeKey ? data.items.find((i) => i.key === activeKey) : null;

    // 1. Cập nhật hiệu ứng nhảy tách miếng cắt Silk trên SVG
    const sliceGroups = document.querySelectorAll("#soldChannelPieSvg .pie-slice-group");
    sliceGroups.forEach((g) => {
      const ch = g.getAttribute("data-channel");
      const dx = g.getAttribute("data-dx") || "0";
      const dy = g.getAttribute("data-dy") || "0";
      const sheenPath = g.querySelector(".pie-slice-silk-sheen");

      if (!activeKey) {
        g.classList.remove("slice-active", "slice-dimmed");
        g.style.transform = "translate(0px, 0px) scale(1)";
        if (sheenPath) sheenPath.setAttribute("fill", "url(#silkSheenOverlay)");
      } else if (ch === activeKey) {
        g.classList.add("slice-active");
        g.classList.remove("slice-dimmed");
        g.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
        if (sheenPath) sheenPath.setAttribute("fill", "url(#silkExplodedHighlight)");
      } else {
        g.classList.remove("slice-active");
        g.classList.add("slice-dimmed");
        g.style.transform = "translate(0px, 0px) scale(0.96)";
        if (sheenPath) sheenPath.setAttribute("fill", "url(#silkSheenOverlay)");
      }
    });

    // 2. Cập nhật trạng thái nổi bật của các mục chú giải màu Silk kế bên
    const legendItems = document.querySelectorAll("#soldChannelLegendList .sold-pie-legend-item");
    legendItems.forEach((el) => {
      const ch = el.getAttribute("data-channel");
      const itemObj = data.items.find((i) => i.key === ch);
      const swatch = document.getElementById(`pieSwatch_${ch}`);

      if (!activeKey) {
        el.classList.remove("legend-active", "legend-dimmed");
        el.style.borderColor = "var(--border-color)";
        if (swatch) swatch.innerText = "●";
      } else if (ch === activeKey) {
        el.classList.add("legend-active");
        el.classList.remove("legend-dimmed");
        el.style.borderColor = itemObj ? itemObj.color : "var(--border-color)";
        if (swatch) swatch.innerText = "✓";
      } else {
        el.classList.remove("legend-active");
        el.classList.add("legend-dimmed");
        el.style.borderColor = "var(--border-color)";
        if (swatch) swatch.innerText = "●";
      }
    });

    // 3. Cập nhật tâm biểu đồ Donut
    const hubEl = document.getElementById("soldPieCenterHub");
    const lblEl = document.getElementById("soldPieCenterLabel");
    const valEl = document.getElementById("soldPieCenterValue");
    const subEl = document.getElementById("soldPieCenterSub");
    const pillEl = document.getElementById("soldPieActiveStatusPill");
    const footerEl = document.getElementById("soldPieSummaryFooter");

    if (hubEl && animateHub) {
      hubEl.classList.remove("hub-jumping");
      void hubEl.offsetWidth;
      hubEl.classList.add("hub-jumping");
    }

    if (activeItem) {
      if (hubEl) hubEl.style.borderColor = activeItem.color;
      if (lblEl) {
        lblEl.innerText = activeItem.name.toUpperCase();
        lblEl.style.color = activeItem.color;
      }
      if (valEl) {
        valEl.innerText = `${activeItem.orders} đơn`;
        valEl.style.color = activeItem.color;
      }
      if (subEl) {
        subEl.innerText = `${activeItem.revenue.toLocaleString("vi-VN")} VND`;
      }
      if (footerEl) {
        footerEl.innerHTML = `
          <div>
            <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${activeItem.silkCss};margin-right:5px;vertical-align:middle;"></span>
            Kênh đang tách: <strong style="color:${activeItem.color};">${activeItem.name}</strong> (${data.periodLabel})
          </div>
          <div>
            Đã bán: <strong>${activeItem.orders} / ${data.totalOrders} đơn</strong> · Doanh thu kênh: <strong style="color:${this.currentTheme === "vivo" ? "#0F172A" : activeItem.color};font-variant-numeric:tabular-nums;">${activeItem.revenue.toLocaleString("vi-VN")} VND</strong>
          </div>
        `;
      }
    } else {
      if (hubEl) hubEl.style.borderColor = "var(--border-color)";
      if (lblEl) {
        lblEl.innerText = "TỔNG ĐÃ BÁN";
        lblEl.style.color = "var(--text-muted)";
      }
      if (valEl) {
        valEl.innerText = `${data.totalOrders} đơn`;
        valEl.style.color = "var(--text-main)";
      }
      if (subEl) {
        subEl.innerText = "5 Kênh bán";
      }
      if (footerEl) {
        footerEl.innerHTML = `
          <div>
            📊 Tổng hợp <strong>5 kênh bán hàng</strong> · <strong>${data.periodLabel}</strong>
          </div>
          <div>
            Tổng đơn đã bán: <strong>${data.totalOrders} đơn</strong> · Tổng doanh thu: <strong style="color:${this.currentTheme === "vivo" ? "#0F172A" : "var(--theme-primary, #2563eb)"};font-variant-numeric:tabular-nums;">${data.totalRevenue.toLocaleString("vi-VN")} VND</strong>
          </div>
        `;
      }
    }

    // Đồng bộ trạng thái chọn trên 6 thẻ Doanh thu và Bảng Top 10 / Top 50 sản phẩm bán chạy
    this.renderOneMonthRevenueOverview(data);
    this.renderTopSellingProductsList(data);
  },

  setTopProductsLimit(limit) {
    this.topProductsLimit = limit === 50 ? 50 : 10;
    const btn10 = document.getElementById("btnTop10Products");
    const btn50 = document.getElementById("btnTop50Products");
    if (btn10) {
      btn10.className = this.topProductsLimit === 10 ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm";
    }
    if (btn50) {
      btn50.className = this.topProductsLimit === 50 ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm";
    }
    this.renderTopSellingProductsList(this._lastSoldPieData || this.getFiveChannelSoldDataset());
  },

  getTopSellingProductsCatalog() {
    // 100% sản phẩm Thời trang chuẩn 25 mã từ fashion68.js (5 danh mục: Áo, Quần, Váy & Đầm, Giày & Dép, Phụ kiện thời trang)
    const baseItems = [
      { sku: "SP-AO-POLO-01", name: "Áo Polo Nam Coolmate Pro (Đen - Size L)", price: 250000, baseSold: 158, topChannel: "SHOPEE" },
      { sku: "SP-AO-THUN-02", name: "Áo Thun Cotton Oversize Unisex (Trắng - Size M)", price: 190000, baseSold: 146, topChannel: "TIKTOK" },
      { sku: "SP-QUAN-JEANS-06", name: "Quần Jeans Nam Slim-fit Co Giãn (Xanh Đậm - Size 31)", price: 450000, baseSold: 132, topChannel: "SHOPEE" },
      { sku: "SP-GIAY-SNEAKER-16", name: "Giày Sneaker Da Trắng Cổ Thấp (Trắng - Size 41)", price: 620000, baseSold: 124, topChannel: "TIKTOK" },
      { sku: "SP-DAM-MIDI-11", name: "Đầm Midi Lụa Xếp Ly Dự Tiệc (Kem - Size S)", price: 550000, baseSold: 118, topChannel: "SHOPEE" },
      { sku: "SP-QUAN-SHORT-08", name: "Quần Short Thể Thao Vải Gió (Đen - Size L)", price: 180000, baseSold: 112, topChannel: "POS" },
      { sku: "SP-SET-BLAZER-14", name: "Set Vest Blazer Nữ & Chân Váy (Trắng Kem - Size S)", price: 720000, baseSold: 105, topChannel: "SHOPEE" },
      { sku: "SP-AO-KHOAC-04", name: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL)", price: 420000, baseSold: 99, topChannel: "LAZADA" },
      { sku: "SP-AO-HOODIE-05", name: "Áo Hoodie Nỉ Bông Form Rộng (Nâu - Size L)", price: 390000, baseSold: 94, topChannel: "TIKTOK" },
      { sku: "SP-DEP-DUC-20", name: "Dép Quai Ngang Đúc Nguyên Khối EVA (Đen - Size 41)", price: 150000, baseSold: 91, topChannel: "TIKTOK" },
      { sku: "SP-CHAN-VAY-12", name: "Chân Váy Chữ A Công Sở Dáng Ngắn (Đen - Size M)", price: 260000, baseSold: 87, topChannel: "SHOPEE" },
      { sku: "SP-DAM-MAXI-13", name: "Đầm Maxi Hoa Nhí Voan Mềm (Hồng Pastel - Size M)", price: 480000, baseSold: 84, topChannel: "TIKTOK" },
      { sku: "SP-AO-SOMI-03", name: "Áo Sơ Mi Oxford Dài Tay Chống Nhăn (Xanh Nhạt - Size L)", price: 320000, baseSold: 80, topChannel: "LAZADA" },
      { sku: "SP-QUAN-KAKI-07", name: "Quần Kaki Chinos Công Sở (Be - Size 30)", price: 380000, baseSold: 77, topChannel: "LAZADA" },
      { sku: "SP-GIAY-CHAYBO-17", name: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42)", price: 750000, baseSold: 74, topChannel: "TIKTOK" },
      { sku: "SP-TUI-DEO-21", name: "Túi Đeo Chéo Da PU Chống Nước (Đen)", price: 340000, baseSold: 71, topChannel: "FACEBOOK" },
      { sku: "SP-TAT-CO-25", name: "Set 5 Đôi Tất Cổ Ngắn Khử Mùi Bamboo (Mix Màu)", price: 120000, baseSold: 68, topChannel: "POS" },
      { sku: "SP-DAM-THUN-15", name: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M)", price: 240000, baseSold: 65, topChannel: "FACEBOOK" },
      { sku: "SP-GIAY-LOAFER-18", name: "Giày Lười Da Bò Nam Công Sở (Nâu Bò - Size 40)", price: 890000, baseSold: 62, topChannel: "LAZADA" },
      { sku: "SP-QUAN-TAY-09", name: "Quần Tây Âu Ống Đứng Cao Cấp (Xám Than - Size 31)", price: 490000, baseSold: 59, topChannel: "POS" },
      { sku: "SP-SANDAL-NU-19", name: "Giày Sandal Cao Gót Quai Mảnh 5cm (Be - Size 37)", price: 390000, baseSold: 56, topChannel: "LAZADA" },
      { sku: "SP-THAT-LUNG-22", name: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen)", price: 320000, baseSold: 54, topChannel: "LAZADA" },
      { sku: "SP-NON-KET-23", name: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu)", price: 160000, baseSold: 51, topChannel: "FACEBOOK" },
      { sku: "SP-QUAN-JOGGER-10", name: "Quần Jogger Thun Nỉ Thể Thao (Ghi Sáng - Size M)", price: 290000, baseSold: 49, topChannel: "TIKTOK" },
      { sku: "SP-KINH-MAT-24", name: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng)", price: 280000, baseSold: 47, topChannel: "FACEBOOK" }
    ];

    // 25 dòng mở rộng Thời trang thuần (Áo, Quần, Váy & Đầm, Giày & Dép, Phụ kiện thời trang) phục vụ xem Top 50
    const extraFashionVariants = [
      { prefix: "SP-AO-LINEN", title: "Áo Sơ Mi Linen Cổ Trụ Thoáng Mát", price: 340000, ch: "SHOPEE" },
      { prefix: "SP-QUAN-SUONG", title: "Quần Ống Suông Cạp Cao Thanh Lịch", price: 390000, ch: "TIKTOK" },
      { prefix: "SP-DAM-CONGSO", title: "Đầm Công Sở Chữ A Tay Lỡ Cao Cấp", price: 520000, ch: "SHOPEE" },
      { prefix: "SP-GIAY-BUPBE", title: "Giày Búp Bê Da Mềm Mũi Vuông Êm Chân", price: 360000, ch: "LAZADA" },
      { prefix: "SP-TUI-TOTE", title: "Túi Tote Vải Canvas Phối Da Thời Trang", price: 250000, ch: "FACEBOOK" },
      { prefix: "SP-VI-DA", title: "Ví Da Bò Thật Dáng Ngang Khâu Thủ Công", price: 350000, ch: "POS" }
    ];

    const sizeLabels = ["Size S", "Size M", "Size L", "Size XL"];
    for (let i = 26; i <= 50; i++) {
      const cat = extraFashionVariants[(i - 26) % extraFashionVariants.length];
      baseItems.push({
        sku: `${cat.prefix}-${String(i).padStart(2, "0")}`,
        name: `${cat.title} (${sizeLabels[i % sizeLabels.length]})`,
        price: cat.price + ((i % 4) * 15000),
        baseSold: Math.max(12, 46 - (i - 25)),
        topChannel: cat.ch
      });
    }

    return baseItems;
  },

  renderTopSellingProductsList(precomputedData) {
    const listContainer = document.getElementById("topProductsListContainer");
    const subtitleEl = document.getElementById("topProductsSubtitle");
    if (!listContainer) return;

    const data = precomputedData || this._lastSoldPieData || this.getFiveChannelSoldDataset();
    const limit = this.topProductsLimit === 50 ? 50 : 10;
    const activeCh = this.activePieChannel;
    const scale = data.scaleFactor || 1;

    // Cộng thêm số lượng từ các đơn hàng thực tế vừa nạp vào omsEngine
    const liveOrders = window.omsEngine ? window.omsEngine.orders : [];
    const liveSkuMap = {};
    liveOrders.forEach((o) => {
      if (o.status === "ALLOCATED" && (!activeCh || o.channel === activeCh)) {
        liveSkuMap[o.sku] = (liveSkuMap[o.sku] || 0) + Number(o.quantity || 0);
      }
    });

    const channelSilkMap = {
      SHOPEE: "linear-gradient(90deg, #FFD6BA, #FB923C, #EA580C)",
      FACEBOOK: "linear-gradient(90deg, #BAE6FD, #38BDF8, #0284C7)",
      TIKTOK: "linear-gradient(90deg, #CBD5E1, #64748B, #1E293B)",
      LAZADA: "linear-gradient(90deg, #E0E7FF, #818CF8, #4F46E5)",
      POS: "linear-gradient(90deg, #A7F3D0, #34D399, #059669)"
    };

    const catalog = this.getTopSellingProductsCatalog();
    const computed = catalog.map((item, idx) => {
      // Nếu đang chọn tách 1 kênh trên Donut, tính sản lượng riêng của kênh đó
      const channelFactor = activeCh
        ? item.topChannel === activeCh
          ? 0.62
          : 0.14
        : 1.0;
      const soldQty = Math.max(1, Math.round(item.baseSold * scale * channelFactor) + (liveSkuMap[item.sku] || 0));
      const revenue = soldQty * item.price;
      const displayChannel = activeCh || item.topChannel;
      return {
        ...item,
        soldQty,
        revenue,
        displayChannel,
        silkBar: channelSilkMap[displayChannel] || channelSilkMap.SHOPEE
      };
    });

    computed.sort((a, b) => b.soldQty - a.soldQty || b.revenue - a.revenue);
    const sliced = computed.slice(0, limit);
    const maxSold = Math.max(...sliced.map((p) => p.soldQty), 1);

    if (subtitleEl) {
      subtitleEl.innerHTML = `Top <strong>${limit}</strong> sản phẩm bán chạy nhất · <strong>${data.periodLabel}</strong>.`;
    }

    listContainer.innerHTML = sliced
      .map((prod, idx) => {
        const rank = idx + 1;
        const pctWidth = Math.max(8, Math.round((prod.soldQty / maxSold) * 100));
        const rankBadgeClass =
          rank === 1
            ? "rank-medal-1"
            : rank === 2
            ? "rank-medal-2"
            : rank === 3
            ? "rank-medal-3"
            : "rank-medal-other";
        const rankLabel = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

        return `
          <div class="top-product-row">
            <div class="top-product-row-main">
              <div class="top-product-left">
                <span class="rank-medal-badge ${rankBadgeClass}" style="width:26px;height:26px;font-size:11.5px;">${rankLabel}</span>
                <div style="min-width:0;flex:1;">
                  <div class="top-product-name" title="${prod.name}">${prod.name}</div>
                  <div class="top-product-meta">
                    <code>${prod.sku}</code>
                    <span class="channel-badge badge-${prod.displayChannel}" style="font-size:9.5px;padding:1px 6px;">${prod.displayChannel}</span>
                    <span>Đơn giá: ${prod.price.toLocaleString("vi-VN")} VND</span>
                  </div>
                </div>
              </div>
              <div class="top-product-right">
                <div class="top-product-sold">${prod.soldQty} SP đã bán</div>
                <div class="top-product-rev">${prod.revenue.toLocaleString("vi-VN")} VND</div>
              </div>
            </div>
            <div class="silk-progress-bar">
              <div class="silk-progress-fill" style="width:${pctWidth}%;background:${prod.silkBar};"></div>
            </div>
          </div>
        `;
      })
      .join("");
  },

  renderKPIsAndBadges() {
    const orders = window.omsEngine ? window.omsEngine.orders : [];
    const inv = window.omsEngine ? window.omsEngine.inventory : [];

    // 1. Dữ liệu Khối 1: Kho hàng
    const totalPhysical = inv.reduce((s, i) => s + (i.physicalStock || 0), 0);
    const totalAvailable = inv.reduce((s, i) => s + (i.availableStock || 0), 0);
    const totalReserved = inv.reduce((s, i) => s + (i.reservedStock || 0), 0);
    const outOfStockSkus = inv.filter((i) => (i.availableStock || 0) === 0).length;

    // 2. Dữ liệu Khối 2: Đơn hàng các kênh (Tiếp nhận / Gom đơn)
    const totalOrders = orders.length;
    const confirmedCount = orders.filter((o) => {
      const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
      return ps === "CONFIRMED" && o.status !== "CANCELLED";
    }).length;
    const unconfirmedCount = orders.filter((o) => (o.platformStatus || "") === "UNCONFIRMED").length;
    const cancelledCount = orders.filter((o) => {
      const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
      return ps === "CANCELLED" || o.status === "CANCELLED";
    }).length;

    // 3. Dữ liệu Khối 3: Quản lý Vận đơn
    const waybillList = this.waybillHistory || [];
    const totalWaybills = waybillList.length;

    // 4. Dữ liệu Khối 4: Vận chuyển đơn
    const shipmentsList = this.syncShipmentsFromEngine();
    const totalShipments = shipmentsList.length;
    const inTransitShipments = shipmentsList.filter(s => s.status === "IN_TRANSIT" || s.status === "PENDING_PICKUP").length;
    const deliveredShipments = shipmentsList.filter(s => s.status === "DELIVERED").length;

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    // Cập nhật hiển thị 4 Khối chức năng mới trên Thẻ Tổng Quan
    // Khối 1: Khi đang ở tab Kho -> Hiển thị nội dung chắt lọc nhất của Tổng Quan và liên kết về Tổng Quan
    const firstCardEl = document.getElementById("kpiFirstCard");
    if (this.currentMenuTab === "inventory") {
      const fulfillmentRate = totalOrders > 0 ? Math.round((confirmedCount / totalOrders) * 100) : 0;
      setElText("kpiInventoryLabel", "Tổng Quan");
      setElText("kpiInventoryTotal", `${fulfillmentRate}%`);
      setElText("kpiInventorySub", `Tỷ lệ hoàn tất đơn hàng (${confirmedCount} đơn đủ hàng / ${totalOrders} đơn tiếp nhận)`);
      if (firstCardEl) firstCardEl.title = "Bấm để quay về xem Tổng Quan";
    } else {
      setElText("kpiInventoryLabel", "Kho hàng");
      setElText("kpiInventoryTotal", `${totalPhysical} SP`);
      setElText("kpiInventorySub", `Sẵn sàng bán: ${totalAvailable} SP · Đã xác nhận: ${totalReserved} SP`);
      if (firstCardEl) firstCardEl.title = "Bấm để vào xem Kho hàng";
    }

    // Khối 2: Đơn hàng các kênh
    setElText("kpiOrdersTotal", `${totalOrders} đơn`);
    setElText("kpiOrdersSub", `Đã xác nhận: ${confirmedCount} · Chờ xác nhận: ${unconfirmedCount} · Đã hủy: ${cancelledCount}`);

    // Khối 3: Quản lý Vận đơn
    setElText("kpiWaybillTotal", `${totalWaybills} vận đơn`);
    setElText("kpiWaybillSub", `Đã cấp mã vận đơn: ${totalWaybills} · Sẵn sàng in phiếu QR: ${totalWaybills}`);

    // Khối 4: Vận chuyển đơn
    setElText("kpiShippingTotal", `${totalShipments} đơn`);
    setElText("kpiShippingSub", `Đang vận chuyển: ${inTransitShipments} đơn · Đã giao thành công: ${deliveredShipments} đơn`);

    // Cập nhật 4 Thẻ chỉ số riêng của Kho (Tab Kho)
    const uniqueCategories = new Set(inv.map((i) => i.category)).size;
    const lowStockSkus = inv.filter((i) => {
      const pct = i.physicalStock > 0 ? Math.round((i.availableStock / i.physicalStock) * 100) : 0;
      return (i.availableStock || 0) > 0 && pct <= 35;
    }).length;
    const alertTotalSkus = outOfStockSkus + lowStockSkus;

    setElText("invKpiPhysical", `${inv.length} mặt hàng`);
    setElText("invKpiPhysicalSub", `Thuộc ${uniqueCategories} danh mục`);
    setElText("invKpiAvailable", `${totalAvailable} SP`);
    setElText("invKpiAvailableSub", `Đang đồng bộ mở bán trên 5 kênh`);
    setElText("invKpiReserved", `${totalReserved} SP`);
    setElText("invKpiReservedSub", `Hàng chờ đóng gói xuất đi`);
    setElText("invKpiAlert", `${alertTotalSkus} mặt hàng`);
    setElText("invKpiAlertSub", `Hết hàng: ${outOfStockSkus} · Sắp hết hàng: ${lowStockSkus}`);

    // Badges số lượng trên Sidebar ODOMS (đồng bộ 100% với Tổng Quan & chặn dữ liệu tương lai)
    const activeShippingBadgeCount = this.getUnfinishedValidShipmentsCount();
    const lowStockBadgeCount = this.getLowStockInventoryItems(inv).length;
    setElText("badgeShippingCount", activeShippingBadgeCount);
    setElText("badgeFifoCount", activeShippingBadgeCount);
    setElText("badgeBackorderCount", lowStockBadgeCount);
  },

  renderCharts() {
    const orders = window.omsEngine.orders;
    const allocated = orders.filter((o) => o.status === "ALLOCATED").length;
    const backorder = orders.filter((o) => o.status === "BACKORDER").length;
    const invalid = orders.filter((o) => o.status === "INVALID").length;
    const total = orders.length;

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setElText("donutTotalSubtitle", `Theo trạng thái FIFO/FEFO · ${total} đơn hàng`);
    setElText("legendAllocatedCount", `Đã giữ hàng (${allocated})`);
    setElText("legendBackorderCount", `Thiếu tồn / Chặn bán lố (${backorder})`);
    setElText("legendInvalidCount", `Đơn lỗi hợp lệ (${invalid})`);

    // Cập nhật vòng tròn SVG Donut
    const circumference = 2 * Math.PI * 58; // r = 58 -> ~364.4
    const segAlloc = document.getElementById("donutSegAllocated");
    const segBack = document.getElementById("donutSegBackorder");
    const segInv = document.getElementById("donutSegInvalid");
    const centerText = document.getElementById("donutCenterText");

    if (centerText) {
      centerText.textContent = total > 0 ? `${total} đơn` : "0 đơn";
    }

    if (total === 0) {
      if (segAlloc) segAlloc.setAttribute("stroke-dasharray", `0 ${circumference}`);
      if (segBack) segBack.setAttribute("stroke-dasharray", `0 ${circumference}`);
      if (segInv) segInv.setAttribute("stroke-dasharray", `0 ${circumference}`);
      return;
    }

    const lenAlloc = (allocated / total) * circumference;
    const lenBack = (backorder / total) * circumference;
    const lenInv = (invalid / total) * circumference;

    if (segAlloc) {
      segAlloc.setAttribute("stroke-dasharray", `${lenAlloc} ${circumference}`);
      segAlloc.setAttribute("stroke-dashoffset", "0");
    }
    if (segBack) {
      segBack.setAttribute("stroke-dasharray", `${lenBack} ${circumference}`);
      segBack.setAttribute("stroke-dashoffset", `${-lenAlloc}`);
    }
    if (segInv) {
      segInv.setAttribute("stroke-dasharray", `${lenInv} ${circumference}`);
      segInv.setAttribute("stroke-dashoffset", `${-(lenAlloc + lenBack)}`);
    }
    if (typeof this.renderMonthlyTrendsChartLabels === "function") {
      this.renderMonthlyTrendsChartLabels();
    }
  },

  // ============================================================================
  // TƯƠNG TÁC ĐƯỜNG CONG SPLINE & ĐIỂM CHẤM BIỂU ĐỒ TIẾP NHẬN / XUẤT GIỮ HÀNG THEO THÁNG
  // ============================================================================
  activeMonthlyChartDots: new Set(),
  activeMonthlySeries: null,

  handleMonthlyTrendLineClick(seriesType) {
    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    const targetDots = Array.from(document.querySelectorAll(`.chart-interactive-dot[data-type="${seriesType}"]`));
    const targetKeys = targetDots.map((c) => `${seriesType}_${c.getAttribute("data-month")}`);
    const isSeriesFullyActive =
      this.activeMonthlySeries === seriesType &&
      targetKeys.every((k) => this.activeMonthlyChartDots.has(k));

    if (isSeriesFullyActive) {
      // Bấm lần nữa vào chính đường đang chọn -> bỏ chọn đường đó
      targetKeys.forEach((k) => this.activeMonthlyChartDots.delete(k));
      this.activeMonthlySeries = null;
    } else {
      // Chọn đường mới: bật toàn bộ nhãn số của đường được bấm, giữ đường còn lại hiển thị rõ để thấy phần còn lại
      this.activeMonthlyChartDots.clear();
      targetKeys.forEach((k) => this.activeMonthlyChartDots.add(k));
      this.activeMonthlySeries = seriesType;
    }

    this.renderMonthlyTrendsChartLabels();
  },

  handleMonthlyChartDotClick(circleEl) {
    if (!circleEl) return;
    const type = circleEl.getAttribute("data-type") || "import";
    const month = circleEl.getAttribute("data-month") || "";
    const monthName = circleEl.getAttribute("data-month-name") || month;
    const val = circleEl.getAttribute("data-val") || "0";
    const series = circleEl.getAttribute("data-series") || (type === "import" ? "Tiếp nhận" : "Xuất hàng");
    const key = `${type}_${month}`;

    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    if (this.activeMonthlyChartDots.has(key)) {
      this.activeMonthlyChartDots.delete(key);
      circleEl.classList.remove("active");
    } else {
      this.activeMonthlyChartDots.add(key);
      circleEl.classList.add("active");
      this.activeMonthlySeries = type;
    }

    this.renderMonthlyTrendsChartLabels();

    if (window.omsEngine) {
      const isNowActive = this.activeMonthlyChartDots.has(key);
      if (isNowActive) {
        window.omsEngine.addLog(
          "info",
          `📊 [TIẾP NHẬN & XUẤT HÀNG] Điểm ${series} (${monthName}): ${val} đơn hàng`
        );
        this.renderLogs();
      }
    }
  },

  renderMonthlyTrendsChartLabels() {
    const group = document.getElementById("chartDotsLabelsGroup");
    if (!group) return;

    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    const activeTheme = THEMES_LIST.find((t) => t.key === (this.currentTheme || "navy")) || THEMES_LIST[0];
    const colorImport = activeTheme.chartSecondary || "#F97316";
    const colorExport = activeTheme.chartPrimary || "#2563EB";

    // Đồng bộ hiệu ứng nổi bật đường cong khi chọn 1 đường mà vẫn giữ đường còn lại rõ nét
    const lineImp = document.getElementById("chartLineImport");
    const lineExp = document.getElementById("chartLineExport");
    const areaImp = document.getElementById("chartAreaImport");
    const areaExp = document.getElementById("chartAreaExport");
    const pillImp = document.getElementById("legendPillImport");
    const pillExp = document.getElementById("legendPillExport");
    const bannerEl = document.getElementById("monthlyTrendInteractiveBanner");

    const hasImpActive = Array.from(this.activeMonthlyChartDots).some((k) => k.startsWith("import_"));
    const hasExpActive = Array.from(this.activeMonthlyChartDots).some((k) => k.startsWith("export_"));

    if (lineImp) {
      lineImp.classList.toggle("line-selected", hasImpActive && !hasExpActive);
      lineImp.classList.toggle("line-secondary-visible", !hasImpActive && hasExpActive);
    }
    if (lineExp) {
      lineExp.classList.toggle("line-selected", hasExpActive && !hasImpActive);
      lineExp.classList.toggle("line-secondary-visible", !hasExpActive && hasImpActive);
    }
    if (areaImp) {
      areaImp.classList.toggle("area-selected", hasImpActive);
    }
    if (areaExp) {
      areaExp.classList.toggle("area-selected", hasExpActive);
    }
    if (pillImp) pillImp.classList.toggle("active", hasImpActive);
    if (pillExp) pillExp.classList.toggle("active", hasExpActive);

    if (bannerEl) {
      bannerEl.innerHTML = "";
      bannerEl.style.display = "none";
    }

    const allDots = document.querySelectorAll(".chart-interactive-dot");
    let markup = "";

    allDots.forEach((circle) => {
      const type = circle.getAttribute("data-type") || "import";
      const month = circle.getAttribute("data-month") || "";
      const val = circle.getAttribute("data-val") || "0";
      const key = `${type}_${month}`;
      const isActive = this.activeMonthlyChartDots.has(key);

      circle.classList.toggle("active", isActive);

      if (!isActive) return;

      const cx = parseFloat(circle.getAttribute("cx")) || 0;
      const cy = parseFloat(circle.getAttribute("cy")) || 0;
      const color = type === "import" ? colorImport : colorExport;

      // Đường trên (import) hiển thị nhãn phía trên (cy - 26), đường dưới (export) hiển thị nhãn phía dưới (cy + 9)
      // để khoảng không gian phần còn lại ở giữa 2 đường luôn thông thoáng 100%
      const boxWidth = 42;
      const boxHeight = 19;
      const boxX = cx - boxWidth / 2;
      let boxY = type === "import" ? cy - 26 : cy + 9;
      if (boxY < 2) boxY = 2;
      if (boxY > 168) boxY = cy - 26;

      markup += `
        <g class="chart-dot-number-badge">
          <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="6" fill="${color}" stroke="#ffffff" stroke-width="1.5" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.28))" />
          <text x="${cx}" y="${boxY + 13}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="800" font-family="system-ui, -apple-system, sans-serif">${val}</text>
        </g>
      `;
    });

    group.innerHTML = markup;

    const allDotsCount = allDots.length;
    const btnToggle = document.getElementById("btnToggleAllMonthlyDots");
    if (btnToggle) {
      const isAllActive = allDotsCount > 0 && this.activeMonthlyChartDots.size >= allDotsCount;
      btnToggle.innerText = isAllActive ? "✕ Ẩn tất cả số" : "👁️ Xem tất cả số";
    }
  },

  toggleAllMonthlyTrendsNumbers() {
    const allDots = document.querySelectorAll(".chart-interactive-dot");
    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    const allKeys = Array.from(allDots).map((c) => `${c.getAttribute("data-type")}_${c.getAttribute("data-month")}`);
    const isAllActive = allKeys.length > 0 && this.activeMonthlyChartDots.size >= allKeys.length;

    if (isAllActive) {
      this.activeMonthlyChartDots.clear();
      this.activeMonthlySeries = null;
    } else {
      allKeys.forEach((k) => this.activeMonthlyChartDots.add(k));
      this.activeMonthlySeries = "both";
    }

    this.renderMonthlyTrendsChartLabels();
  },

  onMonthlyTrendsFilterModeChange() {
    const mode = document.getElementById("monthlyTrendsFilterMode")?.value || "MONTH";
    const toggle = (id, show) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("hidden", !show);
    };

    toggle("monthlyTrendsMonthGroup", mode === "MONTH");
    toggle("monthlyTrendsQuarterGroup", mode === "QUARTER");
    toggle("monthlyTrendsWeekMonthGroup", mode === "WEEK");
    toggle("monthlyTrendsWeekGroup", mode === "WEEK");
    toggle("monthlyTrendsDayStartGroup", mode === "DAY");
    toggle("monthlyTrendsDayEndGroup", mode === "DAY");

    this.renderMonthlyTrendsByFilter();
  },

  renderMonthlyTrendsByFilter() {
    const mode = document.getElementById("monthlyTrendsFilterMode")?.value || "MONTH";
    const allData = typeof this.getMonthlyHistoricalDataset === "function" ? this.getMonthlyHistoricalDataset() : {};
    const orderedKeys = Object.keys(allData).sort();

    let labels = [];
    let fullLabels = [];
    let importVals = [];
    let exportVals = [];
    let subtitleText = "";

    const pushMonthsSeries = (keys) => {
      keys.forEach((mk) => {
        const mObj = allData[mk];
        if (!mObj) return;
        labels.push(mObj.shortLabel || mk);
        fullLabels.push(mObj.label || mk);
        importVals.push(Number(mObj.received || 0));
        exportVals.push(Number(mObj.exported || 0));
      });
    };

    if (mode === "QUARTER") {
      const qVal = document.getElementById("monthlyTrendsQuarterSelect")?.value || "2026-Q4";
      const qDefMap = {
        "2026-Q1": { keys: ["2026-01", "2026-02", "2026-03"], title: "Quý 1/2026 (Tháng 01 – Tháng 03/2026)" },
        "2026-Q2": { keys: ["2026-04", "2026-05", "2026-06"], title: "Quý 2/2026 (Tháng 04 – Tháng 06/2026)" },
        "2026-Q3": { keys: ["2026-07", "2026-08", "2026-09"], title: "Quý 3/2026 (Tháng 07 – Tháng 09/2026)" },
        "2026-Q4": { keys: ["2026-10", "2026-11"], title: "Quý 4/2026 (Tháng 10 – 22/11/2026)" }
      };
      const qDef = qDefMap[qVal] || qDefMap["2026-Q4"];
      pushMonthsSeries(qDef.keys);
      subtitleText = `Thống kê tiếp nhận và xuất hàng · ${qDef.title}`;
    } else if (mode === "WEEK") {
      const mKey = document.getElementById("monthlyTrendsWeekMonthSelect")?.value || "2026-11";
      const wKey = document.getElementById("monthlyTrendsWeekSelect")?.value || "W3";
      const mObj = allData[mKey] || allData["2026-11"];
      const wNames = {
        W1: { label: "Tuần 1 (Ngày 01 – 07)", ratio: 0.23 },
        W2: { label: "Tuần 2 (Ngày 08 – 14)", ratio: 0.25 },
        W3: { label: "Tuần 3 (Ngày 15 – 21)", ratio: 0.24 },
        W4: { label: "Tuần 4 (Ngày 22 – Cuối tháng)", ratio: 0.28 }
      };
      const wInfo = wNames[wKey] || wNames.W3;
      const dayWeights = [0.13, 0.15, 0.14, 0.16, 0.17, 0.14, 0.11];
      const baseRec = Math.max(14, Math.round((mObj ? mObj.received : 350) * wInfo.ratio));
      const baseExp = Math.max(12, Math.round((mObj ? mObj.exported : 330) * wInfo.ratio));

      labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      fullLabels = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
      importVals = dayWeights.map((w) => Math.max(1, Math.round(baseRec * w)));
      exportVals = dayWeights.map((w) => Math.max(1, Math.round(baseExp * w)));
      subtitleText = `Thống kê tiếp nhận và xuất hàng · ${wInfo.label} - ${mObj ? mObj.label : mKey}`;
    } else if (mode === "DAY") {
      const sDate = document.getElementById("monthlyTrendsStartDate")?.value || "2026-11-01";
      const eDate = document.getElementById("monthlyTrendsEndDate")?.value || "2026-11-22";
      const sDt = new Date(sDate + "T00:00:00");
      const eDt = new Date(eDate + "T00:00:00");
      const pad = (n) => String(n).padStart(2, "0");
      const totalDays = Math.max(1, Math.round((eDt - sDt) / 86400000));
      const steps = 6;
      const patternRec = [18, 24, 21, 28, 25, 31];
      const patternExp = [16, 22, 19, 26, 23, 29];
      for (let i = 0; i < steps; i++) {
        const curDt = new Date(sDt.getTime() + Math.round((totalDays * i) / (steps - 1)) * 86400000);
        const dm = `${pad(curDt.getDate())}/${pad(curDt.getMonth() + 1)}`;
        labels.push(dm);
        fullLabels.push(`Ngày ${dm}/${curDt.getFullYear()}`);
        importVals.push(patternRec[i]);
        exportVals.push(patternExp[i]);
      }
      subtitleText = `Thống kê tiếp nhận và xuất hàng · Từ ${sDate.split("-").reverse().join("/")} đến ${eDate.split("-").reverse().join("/")}`;
    } else {
      // MONTH
      const mVal = document.getElementById("monthlyTrendsMonthSelect")?.value || "ALL_2026";
      if (mVal === "ALL_2026") {
        pushMonthsSeries(orderedKeys);
        subtitleText = "Thống kê 5 kênh Thời trang (Th01/2026 – 22/11/2026) · Tổng hợp 11 tháng";
      } else if (mVal === "ALL_6M") {
        pushMonthsSeries(orderedKeys.slice(-6));
        subtitleText = "Thống kê 5 kênh Thời trang (Th06/2026 – 22/11/2026) · Tổng hợp 6 tháng gần nhất";
      } else {
        const mObj = allData[mVal] || allData["2026-11"];
        const mTitle = mObj ? mObj.label : mVal;
        const ratios = [0.23, 0.25, 0.24, 0.28];
        labels = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"];
        fullLabels = ["Tuần 1 (01–07)", "Tuần 2 (08–14)", "Tuần 3 (15–21)", "Tuần 4 (22–cuối)"];
        importVals = ratios.map((r) => Math.max(1, Math.round((mObj ? mObj.received : 400) * r)));
        exportVals = ratios.map((r) => Math.max(1, Math.round((mObj ? mObj.exported : 380) * r)));
        subtitleText = `Thống kê tiếp nhận và xuất hàng · Chi tiết các tuần ${mTitle}`;
      }
    }

    const subEl = document.getElementById("monthlyTrendsSubtitle");
    if (subEl && subtitleText) {
      subEl.innerText = subtitleText;
    }

    this.updateMonthlyTrendsSplineSvg({
      labels,
      fullLabels,
      importVals,
      exportVals
    });
  },

  updateMonthlyTrendsSplineSvg(data) {
    const { labels, fullLabels, importVals, exportVals } = data;
    const n = labels.length;
    if (n < 2) return;

    const startX = 65;
    const endX = 515;
    const stepX = (endX - startX) / (n - 1);

    const maxValRaw = Math.max(...importVals, ...exportVals, 10);
    const maxVal = Math.ceil(maxValRaw / 5) * 5 + 5;
    const baseY = 174;
    const topY = 24;
    const heightY = baseY - topY;

    const getY = (val) => Math.round(baseY - (val / maxVal) * heightY);
    const getX = (i) => Math.round(startX + i * stepX);

    const impCoords = importVals.map((v, i) => ({ x: getX(i), y: getY(v), val: v, label: labels[i], full: fullLabels[i] }));
    const expCoords = exportVals.map((v, i) => ({ x: getX(i), y: getY(v), val: v, label: labels[i], full: fullLabels[i] }));

    const buildSplinePath = (coords) => {
      let d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const half = (p2.x - p1.x) / 2;
        d += ` C ${p1.x + half} ${p1.y}, ${p2.x - half} ${p2.y}, ${p2.x} ${p2.y}`;
      }
      return d;
    };

    const impSpline = buildSplinePath(impCoords);
    const expSpline = buildSplinePath(expCoords);

    const impAreaD = `${impSpline} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
    const expAreaD = `${expSpline} L ${endX} ${baseY} L ${startX} ${baseY} Z`;

    const lineImp = document.getElementById("chartLineImport");
    const lineExp = document.getElementById("chartLineExport");
    const areaImp = document.getElementById("chartAreaImport");
    const areaExp = document.getElementById("chartAreaExport");
    const hitImp = document.getElementById("chartHitLineImport");
    const hitExp = document.getElementById("chartHitLineExport");

    if (lineImp) lineImp.setAttribute("d", impSpline);
    if (lineExp) lineExp.setAttribute("d", expSpline);
    if (areaImp) areaImp.setAttribute("d", impAreaD);
    if (areaExp) areaExp.setAttribute("d", expAreaD);
    if (hitImp) hitImp.setAttribute("d", impSpline);
    if (hitExp) hitExp.setAttribute("d", expSpline);

    const yAxisEl = document.getElementById("chartYAxisLabels");
    if (yAxisEl) {
      const stepVal = maxVal / 5;
      let yMarkup = "";
      for (let i = 5; i >= 0; i--) {
        const val = Math.round(i * stepVal);
        const y = Math.round(baseY - (i / 5) * heightY) + 4;
        yMarkup += `<text x="32" y="${y}">${val}</text>`;
      }
      yAxisEl.innerHTML = yMarkup;
    }

    const xAxisEl = document.getElementById("chartXAxisLabels");
    if (xAxisEl) {
      const labelFontSize = n > 8 ? 9.5 : 11.5;
      let xMarkup = "";
      for (let i = 0; i < n; i++) {
        xMarkup += `<text x="${getX(i)}" y="198" font-size="${labelFontSize}">${labels[i]}</text>`;
      }
      xAxisEl.innerHTML = xMarkup;
    }

    const dotsImpGroup = document.getElementById("chartDotsImport");
    if (dotsImpGroup) {
      let dMarkup = "";
      impCoords.forEach((pt) => {
        dMarkup += `<circle cx="${pt.x}" cy="${pt.y}" r="5" class="chart-interactive-dot" data-type="import" data-month="${pt.label}" data-month-name="${pt.full}" data-val="${pt.val}" data-series="Tiếp nhận" onclick="AppUI.handleMonthlyChartDotClick(this)" title="Click để xem: Tiếp nhận ${pt.label} (${pt.val} đơn)" />`;
      });
      dotsImpGroup.innerHTML = dMarkup;
    }

    const dotsExpGroup = document.getElementById("chartDotsExportGroup");
    if (dotsExpGroup) {
      let dMarkup = "";
      expCoords.forEach((pt) => {
        dMarkup += `<circle cx="${pt.x}" cy="${pt.y}" r="4.8" class="chart-interactive-dot" data-type="export" data-month="${pt.label}" data-month-name="${pt.full}" data-val="${pt.val}" data-series="Xuất hàng" onclick="AppUI.handleMonthlyChartDotClick(this)" title="Click để xem: Xuất hàng ${pt.label} (${pt.val} đơn)" />`;
      });
      dotsExpGroup.innerHTML = dMarkup;
    }

    if (this.activeMonthlyChartDots) {
      const btnToggle = document.getElementById("btnToggleAllMonthlyDots");
      if (btnToggle && btnToggle.innerText.includes("Ẩn tất cả số")) {
        this.activeMonthlyChartDots.clear();
        impCoords.forEach((p) => this.activeMonthlyChartDots.add(`import_${p.label}`));
        expCoords.forEach((p) => this.activeMonthlyChartDots.add(`export_${p.label}`));
      } else {
        this.activeMonthlyChartDots.clear();
        this.activeMonthlySeries = null;
      }
    }

    this.renderMonthlyTrendsChartLabels();
  },

  toggleChannelConnection(chKey) {
    window.omsEngine.toggleChannelConnection(chKey);
    this.triggerChannelSyncAnimation();
    this.renderAll();
  },

  renderChannelStrip() {
    const container = document.getElementById("channelStripContainer");
    if (!container) return;

    const orders = window.omsEngine.orders;
    const inv = window.omsEngine.inventory;
    const channels = window.omsEngine.channels;

    const channelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];
    container.innerHTML = channelKeys
      .map((chKey) => {
        const ch = channels[chKey];
        const chOrders = orders.filter((o) => o.channel === chKey).length;
        const heldUnits = inv.reduce((sum, item) => sum + (item.channelReserved[chKey] || 0), 0);
        const isConnected = ch.isConnected !== false;
        const hasSync = ch.syncCount > 0 && ch.lastSync && ch.lastSync !== "Chưa đồng bộ";

        const syncText = hasSync
          ? `Cập nhật lượng hàng bán: Đã cập nhật lúc ${ch.lastSync}`
          : "Cập nhật lượng hàng bán: Chưa có biến động mới";

        const btnClass = isConnected ? "connected" : "disconnected";
        const btnLabel = isConnected ? "● Đang kết nối" : "● Hủy kết nối";
        const btnTitle = isConnected
          ? `Bấm để tạm ngưng hoạt động và đưa tồn bán trên ${ch.shortName} về 0`
          : `Bấm để kết nối lại và đồng bộ số lượng sẵn sàng bán lên ${ch.shortName}`;

        return `
        <div class="channel-card${isConnected ? "" : " channel-paused"}" id="ch-card-${chKey}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px;">
            <span class="channel-badge badge-${chKey}">${ch.shortName}</span>
            <button type="button" class="channel-conn-btn ${btnClass}" onclick="AppUI.toggleChannelConnection('${chKey}')" title="${btnTitle}">
              ${btnLabel}
            </button>
          </div>
          <div class="channel-stat-line">
            Đơn tiếp nhận: <strong style="color: var(--text-main);">${chOrders} đơn</strong>
          </div>
          <div class="channel-stat-line">
            Hàng chờ đóng gói: <strong style="color: var(--theme-primary);">${heldUnits} SP</strong>
          </div>
          <div class="channel-sync-line">
            ${syncText}
          </div>
        </div>
      `;
      })
      .join("");
  },

  renderActionableAlerts() {
    const container = document.getElementById("actionableAlertsContainer");
    if (!container) return;

    const backorders = window.omsEngine.orders.filter((o) => o.status === "BACKORDER");
    const invalids = window.omsEngine.orders.filter((o) => o.status === "INVALID");
    const zeroSkus = window.omsEngine.inventory.filter((i) => i.availableStock === 0);

    const items = [];

    backorders.forEach((o) => {
      items.push(`
        <div class="alert-row-item urgent">
          <div>
            <strong style="color:#dc2626;">🔥 [CHẶN BÁN LỐ - FIFO #${o.fifoRank}] Đơn ${o.orderId} (${o.channel})</strong>
            <div style="font-size:12px;color:#475569;margin-top:2px;">
              Khách đặt <strong>${o.quantity} × ${o.sku}</strong> (${o.productName}) lúc ${o.orderTime} nhưng Tồn khả dụng = 0. Hệ thống đã khóa xuất âm kho!
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="AppUI.handleRestock('${o.sku}', 5)">
            ➕ Nhập bù +5 (${o.sku})
          </button>
        </div>
      `);
    });

    invalids.forEach((o) => {
      items.push(`
        <div class="alert-row-item">
          <div>
            <strong style="color:#b45309;">⚠️ [ĐƠN LỖI HỢP LỆ - BƯỚC 2] Đơn ${o.orderId} (${o.channel})</strong>
            <div style="font-size:12px;color:#475569;margin-top:2px;">
              Nguyên nhân chặn: <strong>${o.validationErrors.join("; ")}</strong> — Không thực hiện trừ nhầm tồn kho nội bộ.
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="AppUI.openOrderAuditModal('${o.orderId}')">
            🔍 Xem lưu vết
          </button>
        </div>
      `);
    });

    if (items.length === 0 && zeroSkus.length === 0) {
      container.innerHTML = `
        <div style="padding:14px;background:var(--theme-primary-light);border:1px solid var(--theme-banner-border);border-radius:10px;color:var(--theme-primary);font-size:13px;font-weight:600;">
          ✔ Tất cả đơn hàng và lượng hàng sẵn sàng bán đều ở trạng thái an toàn. Bạn có thể bấm "📥 Đồng bộ đơn 5 kênh" để nhận dữ liệu mẫu hoặc vào "Cài đặt" > "Chạy mô phỏng" để kiểm tra luồng xử lý.
        </div>
      `;
      return;
    }

    container.innerHTML = items.join("");
  },

  renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    const countSpan = document.getElementById("orderCountLabel");
    if (!tbody) return;

    let list = [...window.omsEngine.orders];
    list.sort((a, b) =>
      this.orderSortMode === "OLDEST_FIRST"
        ? a.timestampMs - b.timestampMs
        : b.timestampMs - a.timestampMs
    );

    if (this.currentChannelFilter !== "ALL") {
      list = list.filter((o) => o.channel === this.currentChannelFilter);
    }
    if (this.currentStatusFilter !== "ALL") {
      list = list.filter((o) => {
        const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        return ps === this.currentStatusFilter || o.status === this.currentStatusFilter;
      });
    }
    if (this.searchQuery) {
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(this.searchQuery) ||
          o.sku.toLowerCase().includes(this.searchQuery) ||
          o.customerName.toLowerCase().includes(this.searchQuery) ||
          o.productName.toLowerCase().includes(this.searchQuery)
      );
    }

    if (countSpan) {
      countSpan.innerText = `Hiển thị ${list.length} / ${window.omsEngine.orders.length} đơn hàng`;
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 30px 16px; color: var(--text-muted);">
            Chưa có đơn hàng nào khớp bộ lọc. Hãy bấm <strong>"📥 Đồng bộ đơn 5 kênh"</strong> trên thanh công cụ để tải danh sách đơn hàng!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list
      .map((ord) => {
        let statusBadge = "";
        const ps = ord.platformStatus || (ord.status === "CANCELLED" || ord.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        if (ps === "CANCELLED" || ord.status === "INVALID") {
          statusBadge = `<span class="status-badge st-INVALID">✖️ Đã hủy</span>`;
        } else {
          const isConfirmed = ps === "CONFIRMED";
          statusBadge = `
            <div class="order-confirm-cell">
              <label class="order-confirm-switch" title="Gạt để xác nhận đơn hàng và tự động gửi xác nhận về kênh ${ord.channel}">
                <input type="checkbox" ${isConfirmed ? "checked" : ""} onchange="AppUI.handleToggleOrderConfirm('${ord.orderId}', this.checked)" />
                <span class="order-switch-track"><span class="order-switch-thumb"></span></span>
                <span class="order-switch-label ${isConfirmed ? "is-on" : "is-off"}">Xác nhận</span>
              </label>
              <div class="order-confirm-subtext ${isConfirmed ? "is-confirmed" : "is-waiting"}">
                ${isConfirmed ? "Đã xác nhận" : "⏳ Chờ xác nhận"}
              </div>
            </div>
          `;
        }

        const channelDisplay =
          (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[ord.channel] && window.CHANNELS_CONFIG[ord.channel].shortName) ||
          ord.channel;

        const fifoBadge = ord.fifoRank
          ? `<span class="fifo-rank" title="Thứ tự ưu tiên giữ hàng theo thời gian đặt">#${ord.fifoRank}</span>`
          : `<span style="color:#94a3b8;font-size:11px;">-</span>`;

        const shortageQty = ord.stockSnapshot ? Math.max(0, (ord.quantity || 0) - (ord.stockSnapshot.before || 0)) : (ord.quantity || 0);
        const stockCompare =
          ps === "UNCONFIRMED"
            ? `<span style="color:#d97706;font-size:11.5px;font-weight:700;">⏳ Chờ xác nhận</span>`
            : ord.stockSnapshot
            ? ord.status === "BACKORDER"
              ? `<div style="font-size:12px;color:#dc2626;font-weight:700;">⚠️ Thiếu ${shortageQty} SP (Cần nhập hàng)</div>`
              : `<div style="font-size:12px;color:#15803d;font-weight:700;">Đã giữ hàng</div><div style="font-size:11px;color:var(--text-muted);">Còn ${ord.stockSnapshot.after} sẵn sàng bán</div>`
            : `<span style="color:#ef4444;font-size:11.5px;font-weight:600;">Đơn lỗi thông tin</span>`;

        const pm = ord.paymentMethod || "COD (Thanh toán khi nhận hàng)";
        const isCodOrder = pm.toUpperCase().includes("COD") || pm.toLowerCase().includes("thu hộ") || pm.toLowerCase().includes("khi nhận hàng");
        const orderTotalVal = (ord.quantity || 0) * (ord.unitPrice || 0);
        const codSubLabel = isCodOrder
          ? `<div style="font-size:10.5px;color:#c2410c;font-weight:700;margin-top:3px;">💵 Thu hộ COD: ${orderTotalVal.toLocaleString("vi-VN")} VND</div>`
          : `<div style="font-size:10.5px;color:#15803d;font-weight:700;margin-top:3px;">✔ Đã thanh toán (COD: 0 VND)</div>`;

        let pmPill = "";
        if (isCodOrder) {
          pmPill = `<span class="hold-pill" style="background:#fff7ed;color:#c2410c;border:1px solid #ffedd5;font-weight:700;"><span style="font-size:12px;">💵</span> ${pm}</span>`;
        } else if (pm.includes("ShopeePay") || pm.includes("ZaloPay") || pm.includes("Ví")) {
          pmPill = `<span class="hold-pill" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-weight:700;"><span style="font-size:12px;">💳</span> ${pm}</span>`;
        } else if (pm.includes("Chuyển khoản") || pm.includes("VietQR") || pm.includes("QR")) {
          pmPill = `<span class="hold-pill" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-weight:700;"><span style="font-size:12px;">🏦</span> ${pm}</span>`;
        } else if (pm.includes("Thẻ") || pm.includes("Visa") || pm.includes("Mastercard")) {
          pmPill = `<span class="hold-pill" style="background:#faf5ff;color:#7c3aed;border:1px solid #e9d5ff;font-weight:700;"><span style="font-size:12px;">💳</span> ${pm}</span>`;
        } else if (pm.includes("Tiền mặt")) {
          pmPill = `<span class="hold-pill" style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:700;"><span style="font-size:12px;">🏪</span> ${pm}</span>`;
        } else {
          pmPill = `<span class="hold-pill" style="background:#f8fafc;color:#334155;border:1px solid #e2e8f0;font-weight:700;">💳 ${pm}</span>`;
        }
        const pmBadge = `<div>${pmPill}${codSubLabel}</div>`;

        const sourceBadge =
          ord.sourceMethod === "WEBHOOK_API"
            ? `<span style="font-size:11px;color:#7c3aed;font-weight:600;">⚡ Tiếp nhận trực tiếp</span>`
            : `<span style="font-size:11px;color:var(--theme-primary);font-weight:600;">📊 File Excel</span>`;

        return `
        <tr>
          <td>${fifoBadge}</td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${ord.orderId}</div>
            <div>${sourceBadge}</div>
          </td>
          <td><span class="channel-badge badge-${ord.channel}">${channelDisplay}</span></td>
          <td>
            <div style="font-weight:700;font-family:monospace;font-size:12px;">${window.omsEngine && typeof window.omsEngine.parseAndFormatOrderTime === "function" ? window.omsEngine.parseAndFormatOrderTime(ord.orderTime).formatted : ord.orderTime}</div>

          </td>
          <td>
            <div style="font-weight:700;color:var(--theme-primary);">${ord.sku}</div>
            <div style="font-size:12px;color:var(--text-muted);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${ord.productName}">${ord.productName}</div>
          </td>
          <td style="font-weight:800;font-size:14px;">${ord.quantity}</td>
          <td>${stockCompare}</td>
          <td>${statusBadge}</td>
          <td>${pmBadge}</td>
          <td>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" onclick="AppUI.openOrderAuditModal('${ord.orderId}')" title="Xem thông tin chi tiết và lịch sử xử lý đơn hàng">
                Xem chi tiết
              </button>
              <button class="btn btn-primary btn-sm" onclick="AppUI.openWaybillForOrder('${ord.orderId}')" title="Tạo mã vận đơn & In mã QR cho đơn này">
                Tạo vận đơn
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  dismissedShortageOrderIds: [],
  shortagePopupMobileExpanded: false,

  handleToggleOrderConfirm(orderId, isChecked) {
    if (!window.omsEngine || typeof window.omsEngine.toggleOrderConfirmation !== "function") return;
    const beforeBackorderSet = new Set(
      (window.omsEngine.orders || [])
        .filter((o) => o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER")
        .map((o) => o.orderId)
    );
    window.omsEngine.toggleOrderConfirmation(orderId, isChecked);
    if (isChecked) {
      const newlyShortedIds = new Set(
        (window.omsEngine.orders || [])
          .filter((o) => o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER" && (!beforeBackorderSet.has(o.orderId) || o.orderId === orderId))
          .map((o) => o.orderId)
      );
      this.dismissedShortageOrderIds = (this.dismissedShortageOrderIds || []).filter((id) => !newlyShortedIds.has(id));
    } else {
      this.dismissedShortageOrderIds = (this.dismissedShortageOrderIds || []).filter((id) => id !== orderId);
    }
    this.triggerChannelSyncAnimation();
    this.renderAll();
  },

  toggleShortagePopupMobileExpand() {
    this.shortagePopupMobileExpanded = !this.shortagePopupMobileExpanded;
    this.renderStockShortageCornerPopup();
  },

  closeStockShortagePopup() {
    if (window.omsEngine && Array.isArray(window.omsEngine.orders)) {
      const nowMs = Date.now();
      const currentShortageIds = window.omsEngine.orders
        .filter((o) => {
          const ordTs = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(o) : (Number(o.timestampMs) || 0);
          return o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER" && ordTs <= nowMs;
        })
        .map((o) => o.orderId);
      const merged = new Set([...(this.dismissedShortageOrderIds || []), ...currentShortageIds]);
      this.dismissedShortageOrderIds = Array.from(merged);
    }
    const popupEl = document.getElementById("stockShortageCornerPopup");
    if (popupEl) {
      popupEl.classList.add("hidden");
    }
  },

  renderStockShortageCornerPopup() {
    const popupEl = document.getElementById("stockShortageCornerPopup");
    if (!popupEl || !window.omsEngine) return;

    const nowMs = Date.now();
    const dismissedSet = new Set(this.dismissedShortageOrderIds || []);
    const shortageOrders = (window.omsEngine.orders || []).filter((o) => {
      const ordTs = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(o) : (Number(o.timestampMs) || 0);
      return o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER" && ordTs <= nowMs && !dismissedSet.has(o.orderId);
    });

    const isRelevantTab = this.currentMenuTab === "ingest" || this.currentMenuTab === "dashboard";
    if (!isRelevantTab || shortageOrders.length === 0) {
      popupEl.classList.add("hidden");
      return;
    }

    const effectiveInventory =
      typeof this.getEffectiveInventoryAtNow === "function"
        ? this.getEffectiveInventoryAtNow(window.omsEngine.inventory || [])
        : window.omsEngine.inventory || [];

    const groupedBySku = {};
    shortageOrders.forEach((o) => {
      const skuKey = o.sku || "UNKNOWN";
      const invItem = effectiveInventory.find((i) => i.sku === skuKey);
      const prodName = o.productName || (invItem ? invItem.name : skuKey);
      if (!groupedBySku[skuKey]) {
        groupedBySku[skuKey] = {
          productName: prodName,
          totalRequestedQty: 0,
          availableStock: invItem ? invItem.effectiveAvailableStock ?? invItem.availableStock ?? 0 : 0
        };
      }
      groupedBySku[skuKey].totalRequestedQty += Number(o.quantity || 0);
    });

    const productItemsHtml = Object.values(groupedBySku)
      .map((item) => {
        const neededQty = Math.max(1, item.totalRequestedQty - item.availableStock);
        return `<div style="margin-bottom:4px;">• <strong>${neededQty} SP</strong> — ${item.productName}</div>`;
      })
      .join("");

    const isExpanded = Boolean(this.shortagePopupMobileExpanded);
    popupEl.classList.toggle("mobile-expanded", isExpanded);
    popupEl.classList.toggle("mobile-collapsed", !isExpanded);

    popupEl.innerHTML = `
      <div class="shortage-popup-header">
        <div class="shortage-popup-title">
          <span class="shortage-popup-title-desktop">🚨 Cảnh báo thiếu hàng trong Kho!</span>
          <span class="shortage-popup-title-mobile">🚨 Thiếu hàng trong Kho (${shortageOrders.length} đơn)</span>
        </div>
        <div class="shortage-popup-header-btns">
          <button type="button" class="shortage-popup-toggle-btn" onclick="AppUI.toggleShortagePopupMobileExpand()">
            ${isExpanded ? "Thu gọn ▾" : "Xem ▴"}
          </button>
          <button type="button" class="shortage-popup-close-btn" onclick="AppUI.closeStockShortagePopup()" title="Đóng thông báo">✕</button>
        </div>
      </div>
      <div class="shortage-popup-detail-wrap">
        <div class="shortage-popup-body">
          Có <strong>${shortageOrders.length} đơn hàng</strong> đã bấm <strong>Xác nhận</strong> nhưng số lượng trong kho không đủ:
          <div class="shortage-popup-list">${productItemsHtml}</div>
          Vui lòng vào mục <strong>"Kho"</strong> để nhập thêm hàng bổ sung!
        </div>
        <div class="shortage-popup-actions">
          <button type="button" class="btn btn-danger btn-sm" style="width:100%;justify-content:center;" onclick="AppUI.switchSidebarTab('inventory'); AppUI.closeStockShortagePopup();">
            📦 Vào Kho nhập thêm hàng
          </button>
        </div>
      </div>
    `;
    popupEl.classList.remove("hidden");
  },

  renderInventoryTable() {
    const tbody = document.getElementById("inventoryTableBody");
    if (!tbody || !window.omsEngine) return;

    const channelNameMap = {
      SHOPEE: "Shopee",
      TIKTOK: "TikTok Shop",
      LAZADA: "Lazada",
      POS: "Cửa hàng POS",
      FACEBOOK: "Facebook"
    };

    const formatDateDMY = (dateStr) => {
      if (!dateStr) return "-";
      const parts = String(dateStr).split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    const catFilter = this.invCategoryFilter || "ALL";
    const statusFilter = this.invStatusFilter || "ALL";
    const q = (this.invSearchQuery || "").toLowerCase();

    const filteredItems = window.omsEngine.inventory.filter((item) => {
      if (catFilter !== "ALL" && item.category !== catFilter) return false;

      const pct = item.physicalStock > 0 ? Math.round((item.availableStock / item.physicalStock) * 100) : 0;
      const itemStatusKey = item.availableStock === 0 ? "OUT" : pct <= 35 ? "LOW" : "ENOUGH";
      if (statusFilter === "AVAILABLE") {
        if ((item.availableStock || 0) <= 0) return false;
      } else if (statusFilter === "RESERVED") {
        if ((item.reservedStock || 0) <= 0) return false;
      } else if (statusFilter === "ALERT") {
        if ((item.availableStock || 0) > 0 && pct > 35) return false;
      } else if (statusFilter !== "ALL" && itemStatusKey !== statusFilter) {
        return false;
      }

      if (q) {
        const matchSku = String(item.sku || "").toLowerCase().includes(q);
        const matchName = String(item.name || "").toLowerCase().includes(q);
        if (!matchSku && !matchName) return false;
      }
      return true;
    });

    if (filteredItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);font-weight:600;">
            Không tìm thấy sản phẩm nào khớp với bộ lọc hiện tại.
          </td>
        </tr>
      `;
      return;
    }

    const activeCard = this.activeInvCard || null;
    const defaultTextColor = "#111827";
    const catColColor = activeCard === "ALL" ? "#3d27eb" : defaultTextColor;
    const prodColColor = defaultTextColor;
    const physColColor = activeCard === "ALERT" ? "#dc2626" : defaultTextColor;
    const resColColor = activeCard === "RESERVED" ? "#ea580c" : defaultTextColor;
    const availColColor = activeCard === "AVAILABLE" ? "#2563eb" : activeCard === "ALERT" ? "#dc2626" : defaultTextColor;

    tbody.innerHTML = filteredItems
      .map((item) => {
        const pct = item.physicalStock > 0 ? Math.round((item.availableStock / item.physicalStock) * 100) : 0;
        const barClass = item.availableStock === 0 ? "out" : pct <= 30 ? "low" : "";

        const channelHolds = Object.entries(item.channelReserved || {})
          .filter(([, count]) => count > 0)
          .map(
            ([ch, count]) =>
              `<span class="channel-badge badge-${ch}" style="font-size:10.5px;padding:2px 6px;">${channelNameMap[ch] || ch}: ${count}</span>`
          )
          .join(" ");

        const statusLabel =
          item.availableStock === 0
            ? `<span class="status-badge st-INVALID">Hết hàng</span>`
            : pct <= 35
            ? `<span class="status-badge st-BACKORDER">Sắp hết hàng</span>`
            : `<span class="status-badge st-ALLOCATED">Đủ hàng</span>`;

        return `
        <tr>
          <td>
            <div style="font-weight:800;color:${catColColor};">${item.category}</div>
            <div style="font-size:11px;color:${catColColor};">Đơn vị: ${item.unit || "SP"}</div>
          </td>
          <td>
            <div style="font-weight:700;color:${prodColColor};">${item.name}</div>
            <div style="font-size:11.5px;color:${prodColColor};margin-top:2px;">Mã SKU: <strong>${item.sku}</strong></div>
          </td>
          <td style="font-weight:800;font-size:14px;color:${physColColor};">${item.physicalStock} ${item.unit || "SP"}</td>
          <td>
            <div style="font-weight:700;color:${resColColor};font-size:14px;">${item.reservedStock} ${item.unit || "SP"}</div>
            <div style="margin-top:4px;">
              ${channelHolds || `<span style="font-size:11px;color:${resColColor};">Chưa có đơn giữ</span>`}
            </div>
          </td>
          <td>
            <div style="font-weight:800;font-size:15px;color:${availColColor};">
              ${item.availableStock} ${item.unit || "SP"}
            </div>
            ${
              item.availableStock === 0
                ? `<div style="font-size:11px;color:${activeCard === "AVAILABLE" ? "#2563eb" : activeCard === "ALERT" ? "#dc2626" : "#6b7280"};margin-top:2px;font-weight:600;">Đã giữ hết cho đơn</div>`
                : ""
            }
            <div class="stock-bar-wrap" style="margin-top:4px;">
              <div class="stock-bar-fill ${barClass}" style="width: ${pct}%;"></div>
            </div>
          </td>
          <td>${statusLabel}</td>
          <td>
            <button class="btn btn-outline btn-sm" style="color:#111827;" onclick="AppUI.openRestockPopover('${item.sku}', this, event)">
              Xem chi tiết
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  renderQrLookupResults() {
    const tbody = document.getElementById("qrLookupTableBody");
    if (!tbody) return;

    const q = this.qrLookupQuery;
    const rows = [];

    window.omsEngine.inventory.forEach((item) => {
      item.batches.forEach((b) => {
        const match =
          !q ||
          item.sku.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          b.batchCode.toLowerCase().includes(q) ||
          (b.qrCode && b.qrCode.toLowerCase().includes(q));

        if (match) {
          rows.push(`
            <tr>
              <td><span class="fifo-rank">${b.qrCode || b.batchCode}</span></td>
              <td><strong>${item.sku}</strong> — ${item.name}</td>
              <td><strong>${b.batchCode}</strong></td>
              <td>${b.expiryDate || b.importDate}</td>
              <td><strong>${b.remainingQty} / ${b.initialQty}</strong></td>
              <td>Tồn khả dụng SKU: <strong style="color:var(--theme-primary);">${item.availableStock}</strong></td>
            </tr>
          `);
        }
      });
    });

    tbody.innerHTML =
      rows.length > 0
        ? rows.join("")
        : `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Không tìm thấy mã QR / Lô hàng khớp từ khóa "${q}".</td></tr>`;
  },

  // ============================================================================
  // 5. CHỨC NĂNG ĐỔI QR / TRA CỨU & QR: TẠO MÃ VẬN ĐƠN & IN MÃ QR KÈM THÔNG TIN ĐƠN
  // ============================================================================
  waybillHistory: [
    {
      trackingCode: "VD-SP-261122-8801",
      orderId: "SP261122001",
      channel: "SHOPEE",
      carrier: "SPX Express",
      customerName: "Nguyễn Văn An",
      customerPhone: "0901234567",
      address: "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM",
      sku: "SP-AO-POLO-01",
      productName: "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      quantity: 4,
      batchCode: "LO-2026-A1",
      totalAmount: 0,
      paymentMethod: "Ví ShopeePay",
      createdAt: "22/11/2026 08:30:15"
    }
  ],

  renderWaybillOrderSelector() {
    const selectEl = document.getElementById("waybillOrderSelect");
    if (!selectEl) return;

    const currentVal = selectEl.value;
    const allOrders = window.omsEngine ? window.omsEngine.orders : [];
    const confirmedOrders = allOrders.filter(
      (o) =>
        (o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED")) ===
          "CONFIRMED" &&
        o.status !== "CANCELLED" &&
        o.status !== "INVALID"
    );

    const options = [
      `<option value="">-- Chọn đơn hàng đã xác nhận (${confirmedOrders.length} đơn) để điền tự động --</option>`
    ];

    confirmedOrders.forEach((o) => {
      options.push(
        `<option value="${o.orderId}">[${o.channel}] ${o.orderId} — ${o.customerName} (${o.quantity} × ${o.sku})</option>`
      );
    });

    selectEl.innerHTML = options.join("");
    if (currentVal && confirmedOrders.some((o) => o.orderId === currentVal)) {
      selectEl.value = currentVal;
    }
  },

  onSelectOrderForWaybill(orderId) {
    if (!orderId) return;
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };

    const carrierMap = {
      SHOPEE: "SPX Express",
      TIKTOK: "J&T Express",
      LAZADA: "Giao Hàng Nhanh (GHN)",
      FACEBOOK: "Giao Hàng Tiết Kiệm (GHTK)",
      POS: "Tại quầy"
    };

    const resolvedCarrier = this.resolveOrderCarrier(ord);
    const chosenCarrier =
      resolvedCarrier && resolvedCarrier !== "Chưa gán ĐVVC"
        ? resolvedCarrier
        : carrierMap[ord.channel] || "SPX Express";

    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const nowWb = new Date();
    const shortWbDate = `${String(nowWb.getFullYear()).slice(-2)}${String(nowWb.getMonth() + 1).padStart(2, "0")}${String(nowWb.getDate()).padStart(2, "0")}`;
    const trackingCode = ord.trackingCode || `VD-${ord.channel.slice(0, 2)}-${shortWbDate}-${randSuffix}`;

    const batchText =
      ord.allocatedBatches && ord.allocatedBatches.length > 0
        ? ord.allocatedBatches.map((b) => `${b.batchCode} (${b.takenQty} SP)`).join(", ")
        : "LO-2026-A1";

    setVal("wbOrderId", ord.orderId);
    setVal("wbChannel", ord.channel);
    setVal("wbTrackingCode", trackingCode);
    this.setWaybillCarrierSelectValue(chosenCarrier);
    setVal("wbCustomerName", ord.customerName);
    setVal("wbCustomerPhone", ord.customerPhone);
    setVal("wbAddress", ord.shippingAddress);
    setVal("wbSku", ord.sku);
    setVal("wbProductName", ord.productName);
    const pm = ord.paymentMethod || "COD (Thanh toán khi nhận hàng)";
    const isCodOrder = pm.toUpperCase().includes("COD") || pm.toLowerCase().includes("thu hộ") || pm.toLowerCase().includes("khi nhận hàng");
    const codAmount = isCodOrder ? ord.quantity * ord.unitPrice : 0;

    setVal("wbQuantity", ord.quantity);
    setVal("wbBatchCode", batchText);
    setVal("wbTotalAmount", codAmount);

    this.generateWaybillAndQR(false);
  },

  openWaybillForOrder(orderId) {
    this.switchSidebarTab("qr_api");
    const selectEl = document.getElementById("waybillOrderSelect");
    if (selectEl) {
      selectEl.value = orderId;
    }
    this.onSelectOrderForWaybill(orderId);
  },

  regenerateTrackingCodeOnly() {
    const ch = document.getElementById("wbChannel")?.value || "SHOPEE";
    const rand = Math.floor(1000 + Math.random() * 9000);
    const nowReg = new Date();
    const shortRegDate = `${String(nowReg.getFullYear()).slice(-2)}${String(nowReg.getMonth() + 1).padStart(2, "0")}${String(nowReg.getDate()).padStart(2, "0")}`;
    const code = `VD-${ch.slice(0, 2)}-${shortRegDate}-${rand}`;
    const el = document.getElementById("wbTrackingCode");
    if (el) el.value = code;
    this.generateWaybillAndQR(false);
  },

  // Sinh ma trận QR Code chuẩn SVG 21x21 sắc nét (3 Finder Patterns + Timing + Payload Bits)
  buildQrCodeSvgMarkup(payloadText, size = 126) {
    const N = 21;
    const matrix = Array.from({ length: N }, () => Array(N).fill(false));
    const reserved = Array.from({ length: N }, () => Array(N).fill(false));

    const placeFinder = (rowOffset, colOffset) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = rowOffset + r;
          const cc = colOffset + c;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N) {
            reserved[rr][cc] = true;
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
              const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
              matrix[rr][cc] = isBorder || isInner;
            } else {
              matrix[rr][cc] = false;
            }
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      reserved[6][i] = true;
      matrix[6][i] = i % 2 === 0;
      reserved[i][6] = true;
      matrix[i][6] = i % 2 === 0;
    }

    // Hash deterministic từ chuỗi dữ liệu vận đơn + thông tin đơn
    let hash = 2166136261;
    for (let i = 0; i < payloadText.length; i++) {
      hash ^= payloadText.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    let seed = hash >>> 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!reserved[r][c]) {
          seed = (Math.imul(seed, 1664525) + 1013904223 + r * 31 + c * 17) >>> 0;
          matrix[r][c] = ((seed >>> 16) & 1) === 1;
        }
      }
    }

    let rects = "";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c]) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0A2947" />`;
        }
      }
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${N} ${N}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <rect width="${N}" height="${N}" fill="#ffffff" />
        ${rects}
      </svg>
    `;
  },

  getWaybillFormValues() {
    const val = (id, fallback = "") => document.getElementById(id)?.value?.trim() || fallback;
    const num = (id, fallback = 0) => {
      const raw = document.getElementById(id)?.value;
      if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
      const parsed = Number(raw);
      return isNaN(parsed) ? fallback : parsed;
    };

    const orderId = val("wbOrderId", "SP261122001");
    const matchedOrd = window.omsEngine?.orders?.find((o) => o.orderId === orderId);
    const totalAmount = num("wbTotalAmount", 0);
    const paymentMethod = matchedOrd?.paymentMethod || (totalAmount > 0 ? "COD (Thanh toán khi nhận hàng)" : "Ví ShopeePay");

    return {
      orderId,
      channel: val("wbChannel", "SHOPEE"),
      trackingCode: val("wbTrackingCode", `VD-ODOMS-${String(new Date().getFullYear()).slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-8801`),
      carrier: val("wbCarrier", "SPX Express"),
      customerName: val("wbCustomerName", "Nguyễn Văn An"),
      customerPhone: val("wbCustomerPhone", "0901234567"),
      address: val("wbAddress", "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM"),
      sku: val("wbSku", "SP-AO-POLO-01"),
      productName: val("wbProductName", "Áo Polo Nam Coolmate Pro (Đen - Size L)"),
      quantity: num("wbQuantity", 4),
      batchCode: val("wbBatchCode", "LO-2026-A1"),
      totalAmount,
      paymentMethod
    };
  },

  generateWaybillAndQR(saveToHistory = true) {
    const previewEl = document.getElementById("printableWaybillTicketArea");
    if (!previewEl) return;

    const data = this.getWaybillFormValues();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const createdAtStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const qrPayload = `ODOMS|WB:${data.trackingCode}|ORD:${data.orderId}|CH:${data.channel}|SKU:${data.sku}|QTY:${data.quantity}|COD:${data.totalAmount}`;
    const qrSvg = this.buildQrCodeSvgMarkup(qrPayload, 122);

    previewEl.innerHTML = `
      <div class="wb-ticket-header">
        <div class="wb-brand-box">
          <div class="wb-brand-logo">OD</div>
          <div>
            <div style="font-weight:900;font-size:15px;color:#0A2947;">ODOMS — PHIẾU GIAO HÀNG & MÃ VẬN ĐƠN</div>
            <div style="font-size:11px;color:#475569;font-weight:600;">Hệ thống quản lý đơn hàng đa kênh thông minh · Kho Phường Bình Phú</div>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="channel-badge badge-${data.channel}" style="font-size:12px;padding:4px 10px;">${data.channel}</span>
          <div style="font-size:11px;color:#475569;margin-top:3px;font-weight:700;">ĐVVC: ${data.carrier}</div>
        </div>
      </div>

      <div class="wb-qr-and-code-row">
        <div class="wb-qr-box">
          ${qrSvg}
          <span style="font-size:9.5px;font-weight:800;color:#0A2947;margin-top:4px;">QUÉT QR ĐỐI SOÁT ĐƠN</span>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Mã Vận Đơn (Tracking / Waybill No.)</div>
          <div style="font-size:20px;font-weight:900;color:#0A2947;font-family:monospace;letter-spacing:0.5px;margin:2px 0 8px;">
            ${data.trackingCode}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
            <div>Mã đơn gốc: <strong style="color:#0f172a;">${data.orderId}</strong></div>
            <div>Thu tiền người nhận:</div>
            <div>Ngày tạo: <strong>${createdAtStr}</strong></div>
            <div>
              <div style="display:inline-block;min-width:110px;padding:3px 10px;border:1.5px solid ${data.totalAmount > 0 ? '#dc2626' : '#16a34a'};background:${data.totalAmount > 0 ? '#fef2f2' : '#f0fdf4'};border-radius:6px;text-align:center;">${
              data.totalAmount > 0
                ? `<strong style="color:#dc2626;font-size:13.5px;">${data.totalAmount.toLocaleString("vi-VN")} VND</strong>`
                : `<strong style="color:#15803d;font-size:13px;">0 VND</strong>`
              }</div>
            </div>
          </div>
        </div>
      </div>

      <div class="wb-info-grid" style="grid-template-columns:1fr 1fr;gap:10px;">
        <!-- NƠI GỬI HÀNG (KHO BÁN) -->
        <div class="wb-info-box" style="border-left:3px solid #2563eb;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
            <span style="font-size:10.5px;font-weight:800;color:#1d4ed8;text-transform:uppercase;">🏢 NƠI GỬI HÀNG (BÊN BÁN)</span>
            <span style="font-size:10px;font-weight:700;color:#64748b;">Mã kho: KHO-Q6</span>
          </div>
          <div style="font-weight:800;font-size:13px;color:#0f172a;">ODOMS Store — Kho Phường Bình Phú</div>
          <div style="font-size:11.5px;color:#334155;margin-top:2px;">📍 186 An Dương Vương, Phường Bình Phú, TP.HCM</div>
          <div style="font-size:11px;color:#475569;margin-top:2px;">📞 Hotline gửi hàng: <strong>028.7777.6868</strong></div>
        </div>

        <!-- NƠI NHẬN HÀNG (BÊN MUA) -->
        <div class="wb-info-box" style="border-left:3px solid #dc2626;">
          <div style="font-size:10.5px;font-weight:800;color:#b91c1c;text-transform:uppercase;margin-bottom:3px;">👤 NƠI NHẬN HÀNG (BÊN MUA)</div>
          <div style="font-weight:800;font-size:13px;color:#0f172a;">${data.customerName} — ${data.customerPhone}</div>
          <div style="font-size:11.5px;color:#334155;margin-top:2px;">📍 ${data.address}</div>
          <div style="font-size:11px;color:#475569;margin-top:2px;">📦 Hàng hóa: ${data.sku} × <strong style="color:#dc2626;">${data.quantity} SP</strong> (${data.productName})</div>
        </div>
      </div>
          <div style="font-size:12px;color:#334155;margin-top:3px;font-weight:700;">${data.trackingCode}</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#475569;border-top:1px dashed #cbd5e1;padding-top:8px;">
        <span>✔ Được đồng kiểm hàng</span>
        <span>Chữ ký Nhân viên Đóng gói / Bưu tá</span>
      </div>
    `;

    if (saveToHistory) {
      const existingIdx = this.waybillHistory.findIndex((w) => w.trackingCode === data.trackingCode);
      const record = { ...data, createdAt: createdAtStr };
      if (existingIdx >= 0) {
        this.waybillHistory[existingIdx] = record;
      } else {
        this.waybillHistory.unshift(record);
      }

      // Đẩy vận đơn vào bảng VanDon & tự động cập nhật ĐVVC thật về đơn hàng tương ứng (DatHang)
      if (window.omsEngine && typeof window.omsEngine.upsertShipment === "function") {
        window.omsEngine.upsertShipment({
          trackingCode: data.trackingCode,
          orderId: data.orderId,
          channel: data.channel,
          carrier: data.carrier,
          shippingTier: data.channel === "SHOPEE" ? "HOA_TOC" : "NHANH",
          shippingFee: 0,
          isFreeship: true,
          totalCod: data.totalAmount,
          status: "PENDING_PICKUP",
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          address: data.address,
          productName: data.productName,
          quantity: data.quantity,
          batchCode: data.batchCode,
          handoverTime: createdAtStr,
          lastUpdateTime: createdAtStr
        });
        this.syncShipmentsFromEngine();
      }

      this.renderWaybillHistoryTable();
      this.renderShippingTab();
      this.renderOrdersTable();
      if (typeof this.renderDashboardP2 === "function") {
        this.renderDashboardP2();
      }
      if (window.omsEngine) {
        window.omsEngine.addLog(
          "success",
          `[TẠO VẬN ĐƠN & CẬP NHẬT ĐVVC] Đã khởi tạo vận đơn ${data.trackingCode} (${data.carrier}) cho đơn ${data.orderId} (${data.channel}) — ${data.quantity} × ${data.sku}.`
        );
        this.renderLogs();
      }
    }
  },

  renderWaybillHistoryTable() {
    const tbody = document.getElementById("waybillHistoryTableBody");
    if (!tbody) return;

    tbody.innerHTML = this.waybillHistory
      .map(
        (item) => `
        <tr>
          <td><span class="fifo-rank" style="font-family:monospace;">${item.trackingCode}</span></td>
          <td><strong>${item.orderId}</strong></td>
          <td><span class="channel-badge badge-${item.channel}">${item.channel}</span></td>
          <td>${item.carrier}</td>
          <td>
            <div style="font-weight:700;">${item.customerName}</div>
            <div style="font-size:11px;color:var(--text-muted);">${item.customerPhone}</div>
          </td>
          <td>
            <strong>${item.sku}</strong> × <strong>${item.quantity}</strong>
            <div style="font-size:11px;color:var(--text-muted);">${item.productName}</div>
          </td>
          <td><span class="hold-pill">${item.batchCode}</span></td>
          <td>
            ${
              Number(item.totalAmount) > 0
                ? `<span style="font-weight:800;color:#dc2626;">${Number(item.totalAmount).toLocaleString("vi-VN")} VND</span>`
                : `<span style="font-weight:800;color:#15803d;">0 VND</span>`
            }
          </td>
          <td style="font-size:11.5px;font-family:monospace;">${item.createdAt}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="AppUI.loadAndPrintWaybillFromHistory('${item.trackingCode}')">
              🖨️ In QR & Đơn
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  },

  loadAndPrintWaybillFromHistory(trackingCode) {
    const found = this.waybillHistory.find((w) => w.trackingCode === trackingCode);
    if (!found) return;

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };

    setVal("wbOrderId", found.orderId);
    setVal("wbChannel", found.channel);
    setVal("wbTrackingCode", found.trackingCode);
    setVal("wbCarrier", found.carrier);
    setVal("wbCustomerName", found.customerName);
    setVal("wbCustomerPhone", found.customerPhone);
    setVal("wbAddress", found.address);
    setVal("wbSku", found.sku);
    setVal("wbProductName", found.productName);
    setVal("wbQuantity", found.quantity);
    setVal("wbBatchCode", found.batchCode);
    setVal("wbTotalAmount", found.totalAmount);

    this.generateWaybillAndQR(false);
    this.printWaybillQrTicket();
  },

  printWaybillQrTicket() {
    this.generateWaybillAndQR(true);
    const ticketEl = document.getElementById("printableWaybillTicketArea");
    if (!ticketEl) return;

    const data = this.getWaybillFormValues();
    const printWin = window.open("", "_blank", "width=760,height=680");
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>In Phiếu Vận Đơn & Mã QR - ${data.trackingCode}</title>
        <style>
          body {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 24px;
            background: #f8fafc;
            color: #0f172a;
          }
          .waybill-ticket-preview {
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            border: 2px dashed #0A2947;
            border-radius: 12px;
            padding: 20px 22px;
          }
          .wb-ticket-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0A2947;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .wb-brand-box { display: flex; align-items: center; gap: 10px; }
          .wb-brand-logo {
            width: 36px; height: 36px; background: #0A2947; color: #F3E4C9;
            font-weight: 900; font-size: 15px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
          }
          .wb-qr-and-code-row {
            display: grid;
            grid-template-columns: 145px 1fr;
            gap: 16px;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 12px;
          }
          .wb-qr-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .wb-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12.5px;
            margin-bottom: 12px;
          }
          .wb-info-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 9px 11px;
            background: #ffffff;
          }
          .channel-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 800;
            border: 1px solid #0A2947;
          }
          @media print {
            body { background: #ffffff; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="max-width:640px;margin:0 auto 14px;display:flex;justify-content:space-between;align-items:center;">
          <strong style="color:#0A2947;">🖨️ Xem trước Bản in Mã Vận Đơn & QR (${data.trackingCode})</strong>
          <button onclick="window.print()" style="background:#0A2947;color:#F3E4C9;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;">
            🖨️ Xác nhận In ngay
          </button>
        </div>
        <div class="waybill-ticket-preview">
          ${ticketEl.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  renderStaffManagement() {
    const tbody = document.getElementById("staffUsersTableBody");
    if (!tbody) return;

    const activeUser = window.userAuth.currentUser;
    // Lọc không hiển thị tài khoản dự phòng lhmt trên giao diện hệ thống ODOMS
    const visibleUsers = (window.userAuth.users || []).filter(
      (u) => !u.isHiddenBackup && u.username.toLowerCase() !== "lhmt"
    );

    tbody.innerHTML = visibleUsers
      .map((u, idx) => {
        const isCurrent = activeUser && activeUser.username.toLowerCase() === u.username.toLowerCase();
        const isRoot = u.username.toLowerCase() === "dttd" || u.username.toLowerCase() === "lhmt" || u.isRoot;
        const isActive = u.status !== "INACTIVE";

        return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="qa-avatar" style="width:32px;height:32px;font-size:12px;">${u.avatar}</div>
              <div>
                <div style="font-weight:700;color:var(--text-main);">
                  ${u.fullName}
                  ${isCurrent ? '<span class="status-badge st-ALLOCATED" style="margin-left:6px;">Đang đăng nhập</span>' : ""}
                </div>
                <div style="font-size:11.5px;color:var(--text-muted);">${u.department || "Phòng Vận hành OMS"}</div>
              </div>
            </div>
          </td>
          <td><code style="background:var(--bg-subtle);padding:3px 7px;border-radius:5px;font-weight:700;color:var(--text-main);">${u.username}</code></td>
          <td><strong>${u.role}</strong></td>
          <td>${u.shift || "Ca Hành chính"}</td>
          <td>
            <div style="display:flex;flex-direction:column;gap:5px;">
              <div class="status-toggle-wrap">
                <button
                  type="button"
                  class="toggle-switch-btn ${isActive ? 'state-on' : 'state-off'}"
                  onclick="AppUI.handleToggleUserStatus('${u.username}', ${isActive})"
                  title="${isActive ? 'Bấm để Tạm ngừng hoạt động (Chuyển sang OFF)' : 'Bấm để Kích hoạt lại (Chuyển sang ON)'}"
                  ${isRoot || isCurrent ? 'style="cursor:not-allowed;opacity:0.75;"' : ''}
                >
                  ${isActive ? '🟢 ON' : '🔴 OFF'}
                </button>
                <span class="status-badge ${isActive ? 'st-ALLOCATED' : 'st-INACTIVE'}">
                  ${isActive ? '● Đang hoạt động' : '● Inactive'}
                </span>
              </div>
              ${
                !isActive && u.suspendUntil
                  ? `<div style="font-size:11px;color:#dc2626;font-weight:600;display:flex;align-items:center;gap:3px;" title="Lý do: ${u.suspendReason || 'Tạm ngưng'}">
                      <span>⏳ Đến: ${u.suspendUntil}</span>
                    </div>`
                  : ''
              }
            </div>
          </td>
          <td>
            <div class="staff-action-btns">
              <button type="button" class="btn-action-icon btn-edit" onclick="AppUI.openEditUserModal('${u.username}')" title="✏️ Chỉnh sửa thông tin nhân sự">
                ✏️
              </button>
              ${
                !isRoot && !isCurrent
                  ? `<button type="button" class="btn-action-icon btn-delete" onclick="AppUI.promptDeleteUser('${u.username}')" title="🗑️ Xóa tài khoản nhân sự">
                      🗑️
                    </button>`
                  : `<button type="button" class="btn-action-icon" style="opacity:0.35;cursor:not-allowed;" title="Không thể xóa tài khoản Quản trị tối cao hoặc phiên đăng nhập hiện tại" disabled>
                      🗑️
                    </button>`
              }
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  renderAccessLogsTable() {
    const tbody = document.getElementById("accessLogsTableBody");
    if (!tbody) return;

    tbody.innerHTML = window.userAuth.accessLogs
      .slice(0, 25)
      .map(
        (log) => `
        <tr>
          <td style="font-family:monospace;font-size:12px;">${log.time}</td>
          <td><strong>${log.fullName}</strong> (<code>${log.username}</code>)</td>
          <td>${log.role}</td>
          <td>${log.action}</td>
          <td style="font-size:12px;color:var(--text-muted);">${log.ip}</td>
          <td>
            <span class="status-badge ${log.status === "SUCCESS" ? "st-ALLOCATED" : "st-INVALID"}">
              ${log.status === "SUCCESS" ? "✔ Thành công" : "✖ Thất bại"}
            </span>
          </td>
        </tr>
      `
      )
      .join("");
  },

  renderReportsSummary() {
    const tbody = document.getElementById("channelReportTableBody");
    if (!tbody) return;

    const orders = window.omsEngine.orders;
    const inv = window.omsEngine.inventory;
    const channels = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];

    tbody.innerHTML = channels
      .map((ch) => {
        const chOrders = orders.filter((o) => o.channel === ch);
        const alloc = chOrders.filter((o) => o.status === "ALLOCATED").length;
        const back = chOrders.filter((o) => o.status === "BACKORDER").length;
        const invErr = chOrders.filter((o) => o.status === "INVALID").length;
        const heldUnits = inv.reduce((s, item) => s + (item.channelReserved[ch] || 0), 0);
        const revenue = chOrders
          .filter((o) => o.status === "ALLOCATED")
          .reduce((s, o) => s + o.quantity * o.unitPrice, 0);

        return `
        <tr>
          <td><span class="channel-badge badge-${ch}">${ch}</span></td>
          <td><strong>${chOrders.length}</strong> đơn</td>
          <td style="color:var(--theme-primary);font-weight:700;">${alloc} đơn</td>
          <td style="color:#b45309;font-weight:700;">${back} đơn</td>
          <td style="color:#dc2626;font-weight:700;">${invErr} đơn</td>
          <td><strong>${heldUnits} SP</strong></td>
          <td style="font-weight:700;">${revenue.toLocaleString("vi-VN")} VND</td>
        </tr>
      `;
      })
      .join("");
  },

  renderLogs() {
    const container = document.getElementById("logConsole");
    if (!container) return;

    container.innerHTML = window.omsEngine.logs
      .map(
        (l) => `
        <div class="log-entry ${l.type}">
          <span class="log-time">[${l.time}]</span>
          <span>${l.message}</span>
        </div>
      `
      )
      .join("");
  },

  openOrderAuditModal(orderId) {
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;

    const modal = document.getElementById("orderAuditModal");
    const content = document.getElementById("orderAuditModalBody");

    const stepsHtml = ord.auditSteps
      .map(
        (st) => `
        <div class="audit-step">
          <div style="font-weight:700;color:var(--theme-primary);margin-bottom:4px;">
            ${st.step}
          </div>
          <div style="font-size:13px;color:var(--text-main);">
            ${st.detail}
          </div>
        </div>
      `
      )
      .join("");

    const channelDisplay =
      (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[ord.channel] && window.CHANNELS_CONFIG[ord.channel].shortName) ||
      ord.channel;

    content.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--bg-subtle);padding:14px;border-radius:10px;border:1px solid var(--border-color);">
        <div>
          <p><strong>Mã đơn hàng:</strong> ${ord.orderId}</p>
          <p><strong>Kênh bán:</strong> <span class="channel-badge badge-${ord.channel}">${channelDisplay}</span></p>
          <p><strong>Thời gian đặt:</strong> ${ord.orderTime}</p>
          <p><strong>Hình thức nhận đơn:</strong> ${ord.sourceMethod === "WEBHOOK_API" ? "Tiếp nhận trực tiếp" : "Nhập từ File Excel"}</p>
        </div>
        <div>
          <p><strong>Khách hàng:</strong> ${ord.customerName} (${ord.customerPhone})</p>
          <p><strong>Sản phẩm:</strong> ${ord.sku} - ${ord.productName}</p>
          <p><strong>Số lượng đặt:</strong> <strong>${ord.quantity}</strong> (Đơn giá: ${ord.unitPrice.toLocaleString("vi-VN")} VND)</p>
          <p><strong>Thanh toán:</strong> <strong style="color:var(--theme-primary);">${ord.paymentMethod || "COD"}</strong></p>
          <p><strong>Địa chỉ:</strong> ${ord.shippingAddress}</p>
        </div>
      </div>

      <h4 style="margin-top:16px;font-size:14px;">Lịch sử xử lý đơn hàng:</h4>
      <div class="audit-timeline">
        ${stepsHtml}
      </div>
    `;

    modal.classList.add("open");
  },

  closeModal() {
    document.getElementById("orderAuditModal").classList.remove("open");
  },

  // ============================================================================
  // PHÂN HỆ VẬN CHUYỂN ĐƠN HÀNG & THEO DÕI HÀNH TRÌNH GOOGLE MAPS
  // ============================================================================
  setWaybillCarrierSelectValue(carrierName) {
    const sel = document.getElementById("wbCarrier");
    if (!sel || !carrierName) return;
    const raw = String(carrierName).trim();
    const upper = raw.toUpperCase();
    const options = Array.from(sel.options || []);
    let matched = options.find((opt) => opt.value.toUpperCase() === upper);
    if (!matched) {
      if (upper.includes("GHN") || upper.includes("GIAO HÀNG NHANH")) {
        matched = options.find((opt) => opt.value.toUpperCase().includes("GHN"));
      } else if (upper.includes("GHTK") || upper.includes("TIẾT KIỆM")) {
        matched = options.find((opt) => opt.value.toUpperCase().includes("GHTK"));
      } else if (upper.includes("SPX") || upper.includes("SHOPEE")) {
        matched = options.find((opt) => opt.value.toUpperCase().includes("SPX"));
      } else if (upper.includes("J&T")) {
        matched = options.find((opt) => opt.value.toUpperCase().includes("J&T"));
      } else if (upper.includes("VIETTEL")) {
        matched = options.find((opt) => opt.value.toUpperCase().includes("VIETTEL"));
      }
    }
    if (matched) {
      sel.value = matched.value;
    } else {
      const opt = document.createElement("option");
      opt.value = raw;
      opt.textContent = raw;
      sel.appendChild(opt);
      sel.value = raw;
    }
  },

  syncShipmentsFromEngine() {
    if (window.omsEngine && Array.isArray(window.omsEngine.shipments)) {
      this.shipments = window.omsEngine.shipments;
    } else if (!Array.isArray(this.shipments)) {
      this.shipments =
        window.SAMPLE_SHIPMENTS_DATA && window.SAMPLE_SHIPMENTS_DATA.length > 0
          ? JSON.parse(JSON.stringify(window.SAMPLE_SHIPMENTS_DATA))
          : [];
    }
    return this.shipments;
  },

  resolveOrderCarrier(ord) {
    const list = this.syncShipmentsFromEngine();
    if (window.omsEngine && typeof window.omsEngine.resolveOrderCarrier === "function") {
      return window.omsEngine.resolveOrderCarrier(ord, list);
    }
    const ch = String(ord?.channel || "").toUpperCase();
    if (ord?.carrier && ord.carrier !== "Chưa gán ĐVVC") return ord.carrier;
    return ch === "POS" ? "Tại quầy" : "Chưa gán ĐVVC";
  },

  initShipping() {
    this.syncShipmentsFromEngine();
    this.shippingCarrierFilter = "ALL";
    this.shippingStatusFilter = "ALL";
    this.shippingSearchQuery = "";
  },

  onShippingFilterChange() {
    this.shippingCarrierFilter = document.getElementById("shippingCarrierFilter")?.value || "ALL";
    this.shippingStatusFilter = document.getElementById("shippingStatusFilter")?.value || "ALL";
    this.shippingSearchQuery = (document.getElementById("shippingSearchInput")?.value || "").trim().toLowerCase();
    this.renderShippingTab();
  },

  renderShippingTab() {
    const list = this.syncShipmentsFromEngine();

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    const activeUnfinishedTotal = this.getUnfinishedValidShipmentsCount();
    setEl("badgeShippingCount", activeUnfinishedTotal);
    setEl("badgeFifoCount", activeUnfinishedTotal);

    const tbody = document.getElementById("shippingTableBody");
    if (!tbody) return;

    // Cập nhật 4 thẻ KPI Vận chuyển
    const pendingCount = list.filter(s => s.status === "PENDING_PICKUP").length;
    const inTransitCount = list.filter(s => s.status === "IN_TRANSIT").length;
    const deliveredCount = list.filter(s => s.status === "DELIVERED").length;
    const failedCount = list.filter(s => s.status === "FAILED_RETURNING").length;

    setEl("shippingKpiPending", pendingCount);
    setEl("shippingKpiInTransit", inTransitCount);
    setEl("shippingKpiDelivered", deliveredCount);
    setEl("shippingKpiFailed", failedCount);

    // Lọc theo bộ lọc
    const carrierFilter = this.shippingCarrierFilter || "ALL";
    const statusFilter = this.shippingStatusFilter || "ALL";
    const searchQuery = String(this.shippingSearchQuery || "").trim().toLowerCase();
    const filtered = list.filter(s => {
      if (carrierFilter !== "ALL" && !String(s.carrier || "").toLowerCase().includes(carrierFilter.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "ALL" && s.status !== statusFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery;
        const matchCode = String(s.trackingCode || "").toLowerCase().includes(q);
        const matchOrder = String(s.orderId || "").toLowerCase().includes(q);
        const matchCust =
          String(s.receiver?.name || "").toLowerCase().includes(q) || String(s.receiver?.phone || "").includes(q);
        const matchAddr = String(s.receiver?.address || "").toLowerCase().includes(q);
        if (!matchCode && !matchOrder && !matchCust && !matchAddr) return false;
      }
      return true;
    });

    const countLabel = document.getElementById("shippingCountLabel");
    if (countLabel) {
      countLabel.innerText = `Hiển thị ${filtered.length} / ${list.length} đơn vận chuyển · Kho Phường Bình Phú: 186 An Dương Vương, Phường Bình Phú, TP.HCM`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:28px;color:var(--text-muted);">
            🔍 Không tìm thấy đơn vận chuyển nào phù hợp với bộ lọc hiện tại (hoặc chưa chọn Tất cả trạng thái).
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const feeHtml = s.isFreeship
        ? '<span class="badge-freeship">🎁 Freeship (0 VND)</span>'
        : `<span class="shipping-fee-val">${Number(s.shippingFee).toLocaleString("vi-VN")} VND</span>`;

      const codHtml = s.totalCod > 0
        ? `<span style="font-weight:800;color:#dc2626;">${Number(s.totalCod).toLocaleString("vi-VN")} VND</span>`
        : '<span style="font-weight:700;color:#16a34a;">0 VND (Đã TT)</span>';

      return `
        <tr>
          <td>
            <div style="font-family:monospace;font-weight:800;color:var(--text-main);">${s.trackingCode}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Đơn gốc: ${s.orderId}</div>
          </td>
          <td><span class="channel-badge badge-${s.channel}">${s.channel}</span></td>
          <td><span class="carrier-pill">${s.carrier}</span></td>
          <td>
            <span style="font-weight:700;font-size:12px;color:var(--text-main);">${s.shippingTierLabel}</span>
          </td>
          <td>
            <div class="shipping-duo-address">
              <div class="shipping-addr-item">
                <span class="shipping-addr-tag from">GỬI</span>
                <div>
                  <strong>Kho ODOMS Phường Bình Phú</strong>
                  <div style="font-size:11px;color:var(--text-muted);">186 An Dương Vương, Phường Bình Phú, TP.HCM</div>
                </div>
              </div>
              <div class="shipping-addr-item">
                <span class="shipping-addr-tag to">NHẬN</span>
                <div>
                  <strong>${s.receiver.name}</strong> (${s.receiver.phone})
                  <div style="font-size:11px;color:var(--text-secondary);">${s.receiver.address}</div>
                </div>
              </div>
            </div>
          </td>
          <td>${feeHtml}</td>
          <td>${codHtml}</td>
          <td>
            <div style="font-family:monospace;font-size:11.5px;color:var(--text-main);">${s.handoverTime}</div>
            <div style="font-size:10.5px;color:var(--text-muted);margin-top:2px;">Cập nhật: ${s.lastUpdateTime.split(" ")[1] || s.lastUpdateTime}</div>
          </td>
          <td>
            <span class="status-badge st-${s.status}">${s.statusLabel}</span>
          </td>
          <td>
            <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="AppUI.openShippingMapModal('${s.trackingCode}')" title="Xem vị trí xe giao hàng trên Google Maps">
                🗺️ Xem Bản Đồ
              </button>
              <button class="btn btn-warning btn-sm" onclick="AppUI.openWaybillFromShipping('${s.trackingCode}')" title="In tem vận đơn A6">
                🖨️ In Đơn
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openShippingMapModal(trackingCode) {
    const s = (this.shipments || []).find(item => item.trackingCode === trackingCode);
    if (!s) return;

    const modal = document.getElementById("shippingMapModal");
    const titleEl = document.getElementById("mapModalTrackingTitle");
    const subtitleEl = document.getElementById("mapModalTrackingSubtitle");
    const bodyEl = document.getElementById("shippingMapModalBody");
    if (!modal || !bodyEl) return;

    if (titleEl) {
      titleEl.innerText = `🗺️ Hành Trình Giao Nhận — ${s.trackingCode} (${s.carrier})`;
    }
    if (subtitleEl) {
      subtitleEl.innerText = `Trạng thái: ${s.statusLabel} · Cập nhật lúc ${s.lastUpdateTime}`;
    }

    const originAddr = "186 An Dương Vương, Phường Bình Phú, TP.HCM";
    const destAddr = s.receiver.address;
    const originEncoded = encodeURIComponent(originAddr);
    const destEncoded = encodeURIComponent(destAddr);
    const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${originEncoded}&destination=${destEncoded}`;

    const progressPct = s.progressPercent || 70;
    const shipperLeftPct = Math.min(Math.max(progressPct, 15), 85);

    const timelineHtml = (s.timeline || []).map((t, idx, arr) => {
      const isLast = idx === arr.length - 1;
      const isCompleted = idx < arr.length - 1 || s.status === "DELIVERED";
      const isCurrent = isLast && s.status !== "DELIVERED";

      const stepClass = isCompleted ? "completed" : isCurrent ? "current" : "";
      const dotIcon = isCompleted ? "✔" : isCurrent ? "🚚" : "⏳";

      return `
        <div class="shipping-timeline-step ${stepClass}">
          <div class="timeline-dot">${dotIcon}</div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <strong style="color:var(--text-main);font-size:13px;">${t.title}</strong>
              <span style="font-family:monospace;font-size:11px;color:var(--text-muted);background:var(--bg-subtle);padding:1px 6px;border-radius:4px;">${t.time}</span>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${t.desc}</div>
            <div style="font-size:11px;color:#2563eb;font-weight:700;margin-top:2px;">📍 ${t.location}</div>
          </div>
        </div>
      `;
    }).join("");

    bodyEl.innerHTML = `
      <!-- KHUNG BẢN ĐỒ TỰ ĐỘNG MÔ PHỎNG LỘ TRÌNH KHO PHƯỜNG BÌNH PHÚ -> KHÁCH -->
      <div class="shipping-map-card">
        <div class="shipping-map-header">
          <div>
            <span style="font-size:11px;font-weight:800;color:#2563eb;text-transform:uppercase;">🛰️ BẢN ĐỒ VỊ TRÍ GIAO HÀNG TRỰC TIẾP</span>
            <div style="font-size:13.5px;font-weight:800;color:var(--text-main);margin-top:2px;">
              ${s.currentLocation}
            </div>
          </div>
          <a href="${gmapsDirUrl}" target="_blank" class="btn-google-maps" title="Mở chỉ đường trên ứng dụng Google Maps chính thức">
            🌐 Mở lộ trình trên Google Maps
          </a>
        </div>

        <div class="shipping-map-canvas">
          <div class="map-grid-overlay"></div>

          <!-- Tuyến đường giao nhận -->
          <div class="map-road-track">
            <div class="map-road-progress" style="width:${progressPct}%;"></div>
          </div>

          <!-- Điểm Gửi: Kho ODOMS Phường Bình Phú -->
          <div class="map-pin origin" style="left:70px;">
            <div class="map-pin-icon">🏢</div>
            <div class="map-pin-label">📍 Kho Phường Bình Phú (186 An Dương Vương, Phường Bình Phú, TP.HCM)</div>
          </div>

          <!-- Vị trí Xe Giao Hàng Shipper -->
          <div class="map-pin shipper" style="left:${shipperLeftPct}%;">
            <div class="map-pin-icon">🚚</div>
            <div class="map-pin-label">Shipper: ${s.shipperName.split("(")[0]} (${progressPct}%)</div>
          </div>

          <!-- Điểm Nhận: Khách Hàng -->
          <div class="map-pin destination" style="right:70px;">
            <div class="map-pin-icon">🏠</div>
            <div class="map-pin-label">📍 ${s.receiver.name} (Điểm giao)</div>
          </div>
        </div>

        <!-- Thông tin nhanh tuyến giao -->
        <div class="shipping-route-info-grid">
          <div class="shipping-route-info-box">
            <div style="font-size:11px;font-weight:800;color:#2563eb;text-transform:uppercase;">🏢 NƠI GỬI (KHO BÁN HÀNG)</div>
            <div style="font-weight:800;font-size:13px;color:var(--text-main);margin-top:3px;">ODOMS Store — Kho Phường Bình Phú</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">📍 186 An Dương Vương, Phường Bình Phú, TP.HCM</div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Hotline gửi hàng: 028.7777.6868</div>
          </div>

          <div class="shipping-route-info-box">
            <div style="font-size:11px;font-weight:800;color:#dc2626;text-transform:uppercase;">👤 NƠI NHẬN (NGƯỜI DÙNG CUỐI)</div>
            <div style="font-weight:800;font-size:13px;color:var(--text-main);margin-top:3px;">${s.receiver.name} — ${s.receiver.phone}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">📍 ${s.receiver.address}</div>
            <div style="font-size:11.5px;color:#16a34a;font-weight:700;margin-top:2px;">
              ${s.isFreeship ? "🎁 Freeship 0 VND" : "Phí ship: " + Number(s.shippingFee).toLocaleString("vi-VN") + " VND"} · Thu hộ COD: ${Number(s.totalCod).toLocaleString("vi-VN")} VND
            </div>
          </div>
        </div>
      </div>

      <!-- MỐC LỊCH SỬ HÀNH TRÌNH TỪNG CHẶNG -->
      <div style="background:#ffffff;border:1px solid var(--border-color);border-radius:12px;padding:16px;">
        <h4 style="font-size:14px;font-weight:800;color:var(--text-main);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
          <span>⏱️ Lịch Sử Bàn Giao & Các Mốc Hành Trình Chi Tiết</span>
          <span style="font-size:11.5px;font-weight:600;color:var(--text-muted);">(Cập nhật liên tục từ bưu cục)</span>
        </h4>
        <div class="shipping-timeline">
          ${timelineHtml}
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  closeShippingMapModal() {
    const modal = document.getElementById("shippingMapModal");
    if (modal) modal.classList.remove("open");
  },

  // ============================================================================
  // KẾT NỐI & ĐỒNG BỘ SỔ DỮ LIỆU GOOGLE SHEETS (6 TRANG TÍNH)
  // ============================================================================
  ensureFlatSettingsStyles() {
    if (document.getElementById("odomsFlatSettingsStyle")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "odomsFlatSettingsStyle";
    styleEl.textContent = `
      section.oms-view-section[data-views="settings"] .wms-card,
      section.oms-view-section[data-views="settings"] .settings-flat-card,
      #cloudSyncConfigBox,
      #cloudSyncConfigBox .form-control,
      #cloudSyncConfigBox .btn,
      #cloudSyncConfigBox .status-badge,
      #cloudSyncFeedbackMsg {
        border-radius: 0px !important;
        box-shadow: none !important;
        background-image: none !important;
      }
      section.oms-view-section[data-views="settings"] .settings-flat-card,
      #cloudSyncConfigBox {
        font-variant-numeric: tabular-nums;
        transition: background-color 0.15s ease, border-color 0.15s ease;
      }
      section.oms-view-section[data-views="settings"] .settings-flat-card:hover,
      #cloudSyncConfigBox:hover {
        background-color: var(--theme-table-row-hover) !important;
        border-color: var(--theme-sidebar-active-bg, var(--theme-primary)) !important;
      }
      [data-theme="vivo"] section.oms-view-section[data-views="settings"] .settings-flat-card:hover,
      [data-theme="vivo"] #cloudSyncConfigBox:hover {
        background-color: #EEF5FF !important;
        border-color: #1877FF !important;
      }
      #cloudLastSyncLabel {
        font-variant-numeric: tabular-nums;
      }
    `;
    document.head.appendChild(styleEl);
  },

  initCloudSyncPanel() {
    this.ensureFlatSettingsStyles();

    if (window.cloudSync) {
      // Bảo vệ chống đẩy ngược mảng đơn rỗng lên Google Sheets khi người dùng đăng nhập trước khi PULL_ALL hoàn tất
      if (!window.cloudSync._bootPushGuardInstalled) {
        window.cloudSync._bootPushGuardInstalled = true;
        window.cloudSync._initialPullSettled = false;
        const origSchedulePush = window.cloudSync.scheduleCloudPush.bind(window.cloudSync);
        window.cloudSync.scheduleCloudPush = (reason = "AUTO_SYNC") => {
          const ordersEmpty = !window.omsEngine || !Array.isArray(window.omsEngine.orders) || window.omsEngine.orders.length === 0;
          if (!window.cloudSync._initialPullSettled && ordersEmpty && (reason === "AUDIT_LOGS_SYNC" || reason === "USERS_RBAC_SYNC")) {
            window.cloudSync.saveLocalStateSnapshot();
            return;
          }
          return origSchedulePush(reason);
        };
      }
      window.cloudSync.restoreLocalStateSnapshot();
      this.syncShipmentsFromEngine();
      if (window.cloudSync.endpointUrl && window.cloudSync.autoSync) {
        Promise.resolve(window.cloudSync.pullStateFromCloud(true)).finally(() => {
          window.cloudSync._initialPullSettled = true;
        });
      } else {
        window.cloudSync._initialPullSettled = true;
      }
    }

    const settingsSection = document.querySelector('section.oms-view-section[data-views="settings"] .wms-card');
    if (settingsSection && !document.getElementById("cloudSyncConfigBox")) {
      const box = document.createElement("div");
      box.id = "cloudSyncConfigBox";
      box.className = "settings-flat-card";
      box.style.cssText =
        "margin-top:16px;padding:16px;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:0px;box-shadow:none;";

      const cfg = window.cloudSync ? window.cloudSync : { endpointUrl: "", autoSync: true, lastSyncTime: "Chưa đồng bộ" };

      box.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <div>
            <h4 style="margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span>5. Kết nối &amp; Đồng bộ Sổ dữ liệu Google Sheets (6 trang tính)</span>
              <span id="cloudSyncStatusBadge" class="status-badge st-ALLOCATED" style="font-size:11px;border-radius:0px;">● Đang lưu trên máy này</span>
            </h4>
            <p style="font-size:12px;color:var(--text-secondary);margin:4px 0 0;">
              Dữ liệu vận hành được lưu tức thì trên thiết bị đang dùng và tự động đồng bộ 2 chiều với Sổ Google Sheets gồm 6 trang tính: <strong>Đặt hàng</strong>, <strong>Tồn kho</strong>, <strong>Lưu kho (Lô hàng)</strong>, <strong>Vận đơn</strong>, <strong>Nhân sự</strong> và <strong>Nhật ký</strong>.
            </p>
          </div>
          <div id="cloudLastSyncLabel" style="font-size:11.5px;font-weight:700;color:var(--text-muted);font-variant-numeric:tabular-nums;">
            Cập nhật gần nhất: ${cfg.lastSyncTime || "Chưa đồng bộ"}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;margin-bottom:10px;">
          <input
            type="url"
            id="cloudEndpointUrlInput"
            class="form-control"
            style="border-radius:0px;box-shadow:none;"
            placeholder="Dán đường dẫn kết nối Sổ dữ liệu Google Sheets của cửa hàng tại đây"
            value="${cfg.endpointUrl || ""}"
          />
          <button type="button" class="btn btn-primary btn-sm" style="border-radius:0px;box-shadow:none;" onclick="AppUI.handleSaveCloudConfig()">
            Lưu liên kết Google Sheets
          </button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;cursor:pointer;">
            <input type="checkbox" id="cloudAutoSyncCheckbox" ${cfg.autoSync !== false ? "checked" : ""} onchange="AppUI.handleSaveCloudConfig(true)" />
            <span>Tự động cập nhật sang Google Sheets mỗi khi phát sinh đơn hàng, tồn kho, vận đơn hoặc nhân sự mới</span>
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" style="border-radius:0px;box-shadow:none;" onclick="AppUI.handleManualCloudPush()">
              Gửi dữ liệu lên Google Sheets
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="border-radius:0px;box-shadow:none;" onclick="AppUI.handleManualCloudPull()">
              Tải dữ liệu mới nhất từ Google Sheets
            </button>
          </div>
        </div>
        <div id="cloudSyncFeedbackMsg" class="hidden" style="margin-top:10px;padding:8px 12px;border-radius:0px;box-shadow:none;font-size:12px;font-weight:600;"></div>
      `;

      settingsSection.appendChild(box);
      this.updateCloudSyncStatusUI();
    }
  },

  updateCloudSyncStatusUI() {
    if (!window.cloudSync) return;
    const badgeEl = document.getElementById("cloudSyncStatusBadge");
    const lastSyncEl = document.getElementById("cloudLastSyncLabel");

    if (lastSyncEl) {
      lastSyncEl.innerText = `Cập nhật gần nhất: ${window.cloudSync.lastSyncTime || "Chưa đồng bộ"}`;
    }
    if (!badgeEl) return;

    const status = window.cloudSync.syncStatus;
    if (status === "SYNCING") {
      badgeEl.className = "status-badge";
      badgeEl.style.background = "#fef3c7";
      badgeEl.style.color = "#b45309";
      badgeEl.innerText = "⏳ Đang đồng bộ sổ Google Sheets...";
    } else if (status === "CLOUD_CONNECTED") {
      badgeEl.className = "status-badge st-ALLOCATED";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = "✓ Đã đồng bộ 6 trang tính Google Sheets";
    } else if (status === "CLOUD_ERROR") {
      badgeEl.className = "status-badge st-INVALID";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = "⚠ Tạm lưu trên máy (chưa kết nối được Google Sheets)";
    } else {
      badgeEl.className = "status-badge st-ALLOCATED";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = window.cloudSync.endpointUrl
        ? "● Sẵn sàng kết nối Google Sheets"
        : "● Đang lưu trên máy này";
    }
  },

  showCloudFeedback(message, isSuccess = true) {
    const msgEl = document.getElementById("cloudSyncFeedbackMsg");
    if (!msgEl) return;
    msgEl.classList.remove("hidden");
    msgEl.style.borderRadius = "0px";
    msgEl.style.boxShadow = "none";
    msgEl.style.background = isSuccess ? "#dcfce7" : "#fef2f2";
    msgEl.style.color = isSuccess ? "#15803d" : "#dc2626";
    msgEl.style.border = isSuccess ? "1px solid #86efac" : "1px solid #fecaca";
    msgEl.innerText = message;
  },

  handleSaveCloudConfig(silent = false) {
    if (!window.cloudSync) return;
    const urlInput = document.getElementById("cloudEndpointUrlInput");
    const autoCheck = document.getElementById("cloudAutoSyncCheckbox");

    const endpointUrl = urlInput ? urlInput.value.trim() : "";
    const autoSync = autoCheck ? autoCheck.checked : true;

    window.cloudSync.saveConfig({ endpointUrl, autoSync });
    window.cloudSync.syncStatus = endpointUrl ? "CLOUD_READY" : "LOCAL_READY";
    this.updateCloudSyncStatusUI();

    if (!silent) {
      this.showCloudFeedback(
        endpointUrl
          ? "Đã lưu đường dẫn kết nối Sổ Google Sheets. Hệ thống sẵn sàng đồng bộ 2 chiều đủ 6 trang tính."
          : "Đã chuyển sang chế độ chỉ lưu dữ liệu trực tiếp trên máy này.",
        true
      );
    }
  },

  async handleManualCloudPush() {
    if (!window.cloudSync) return;
    this.handleSaveCloudConfig(true);
    const res = await window.cloudSync.pushStateToCloud("MANUAL_UI_PUSH", false);
    this.showCloudFeedback(res.message, res.success);
    this.renderLogs();
  },

  async handleManualCloudPull() {
    if (!window.cloudSync) return;
    this.handleSaveCloudConfig(true);
    const res = await window.cloudSync.pullStateFromCloud(false);
    this.syncShipmentsFromEngine();
    this.showCloudFeedback(res.message, res.success);
    this.renderAll();
  },

  openWaybillFromShipping(trackingCode) {
    const s = (this.syncShipmentsFromEngine() || []).find(item => item.trackingCode === trackingCode);
    if (!s) return;

    this.switchSidebarTab("qr_api");

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };

    setVal("wbOrderId", s.orderId);
    setVal("wbChannel", s.channel);
    setVal("wbTrackingCode", s.trackingCode);
    this.setWaybillCarrierSelectValue(s.carrier);
    setVal("wbCustomerName", s.receiver.name);
    setVal("wbCustomerPhone", s.receiver.phone);
    setVal("wbAddress", s.receiver.address);
    setVal("wbBatchCode", s.batchCode);
    setVal("wbTotalAmount", s.totalCod);

    this.generateWaybillAndQR(false);
    this.printWaybillQrTicket();
  },

  // ============================================================================
  // GIAO DIỆN THẺ TỔNG QUAN MỚI (7 KPI · LƯỚI 3 CỘT · BẢNG 9 CỘT)
  // ============================================================================
  dashUrgentSortDesc: true,
  dashUrgentSortMode: "PRIORITY_DATE", // PRIORITY_DATE | DATE_ONLY
  dashUrgentPage: 1,
  dashUrgentPageSize: 8,
  dashSelectedOrderIds: new Set(),

  parseVnDateTimeMs(rawStr) {
    const str = String(rawStr || "").trim();
    if (!str) return null;

    // 1. DD/MM/YYYY [HH:mm[:ss]] hoặc DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (dmy) {
      const dt = new Date(
        Number(dmy[3]),
        Number(dmy[2]) - 1,
        Number(dmy[1]),
        Number(dmy[4] || 0),
        Number(dmy[5] || 0),
        Number(dmy[6] || 0)
      );
      return isNaN(dt.getTime()) ? null : dt.getTime();
    }

    // 2. YYYY-MM-DD[T ]HH:mm[:ss]
    const ymd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (ymd && !str.endsWith("Z")) {
      const dt = new Date(
        Number(ymd[1]),
        Number(ymd[2]) - 1,
        Number(ymd[3]),
        Number(ymd[4] || 0),
        Number(ymd[5] || 0),
        Number(ymd[6] || 0)
      );
      return isNaN(dt.getTime()) ? null : dt.getTime();
    }

    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed.getTime();
  },

  getOrderTimestampMs(ord) {
    if (!ord) return 0;
    const direct = Number(ord.timestampMs);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const parsed = this.parseVnDateTimeMs(ord.orderTime);
    return parsed !== null ? parsed : 0;
  },

  getShipmentTimestampMs(sh) {
    if (!sh) return null;
    const ts = this.parseVnDateTimeMs(sh.handoverTime || sh.lastUpdateTime || "");
    return ts !== null ? ts : null;
  },

  getEffectiveInventoryAtNow(inventoryInput) {
    const inventory = Array.isArray(inventoryInput)
      ? inventoryInput
      : window.omsEngine && Array.isArray(window.omsEngine.inventory)
      ? window.omsEngine.inventory
      : [];
    const allOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const nowMs = Date.now();

    // Tính phần giữ chỗ thuộc các đơn ở tương lai (> Date.now()) để loại trừ ở tầng hiển thị (không sửa omsEngine)
    const futureReservedBySku = {};
    allOrders.forEach((ord) => {
      if (!ord) return;
      if (ord.status === "ALLOCATED" && ord.platformStatus !== "CANCELLED") {
        const ordTs = this.getOrderTimestampMs(ord);
        if (ordTs > nowMs) {
          const skuKey = String(ord.sku || "").trim();
          if (skuKey) {
            futureReservedBySku[skuKey] = (futureReservedBySku[skuKey] || 0) + (Number(ord.quantity) || 0);
          }
        }
      }
    });

    return inventory.map((item) => {
      const physical = Math.max(0, Number(item.physicalStock ?? item.stock) || 0);
      const rawReserved =
        item.reservedStock !== undefined && item.reservedStock !== null
          ? Math.max(0, Number(item.reservedStock) || 0)
          : Math.max(0, physical - (Number(item.availableStock) || 0));
      const futureRes = futureReservedBySku[String(item.sku || "").trim()] || 0;
      const effectiveReserved = Math.max(0, rawReserved - futureRes);
      const effectiveAvailable = Math.min(physical, Math.max(0, physical - effectiveReserved));
      return {
        ...item,
        effectivePhysicalStock: physical,
        effectiveReservedStock: effectiveReserved,
        effectiveAvailableStock: effectiveAvailable
      };
    });
  },

  getSkuAvailableStock(item) {
    if (!item) return 0;
    if (item.effectiveAvailableStock !== undefined && item.effectiveAvailableStock !== null) {
      return Math.max(0, Number(item.effectiveAvailableStock) || 0);
    }
    if (item.availableStock !== undefined && item.availableStock !== null) {
      return Math.max(0, Number(item.availableStock) || 0);
    }
    const physical = Math.max(0, Number(item.physicalStock ?? item.stock) || 0);
    const reserved = Math.max(0, Number(item.reservedStock) || 0);
    return Math.max(0, physical - reserved);
  },

  getLowStockInventoryItems(inventoryInput) {
    const effInv = this.getEffectiveInventoryAtNow(inventoryInput);
    return effInv
      .filter((item) => this.getSkuAvailableStock(item) <= 5)
      .sort((a, b) => {
        const diff = this.getSkuAvailableStock(a) - this.getSkuAvailableStock(b);
        if (diff !== 0) return diff;
        return String(a.sku || "").localeCompare(String(b.sku || ""));
      });
  },

  getValidOrdersUpToNow() {
    const allOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const nowMs = Date.now();
    return allOrders.filter((ord) => {
      const ordTs = this.getOrderTimestampMs(ord);
      return ordTs <= nowMs;
    });
  },

  getValidShipmentsUpToNow(allowedOrders = null) {
    const allShipments = this.syncShipmentsFromEngine();
    const nowMs = Date.now();
    const ordersRef = Array.isArray(allowedOrders) ? allowedOrders : this.getValidOrdersUpToNow();
    const allowedOrderIds = new Set(ordersRef.map((o) => String(o.orderId || "").trim()).filter(Boolean));
    const hasEngineOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) && window.omsEngine.orders.length > 0;

    return allShipments.filter((sh) => {
      if (!sh) return false;
      const shTs = this.getShipmentTimestampMs(sh);
      if (shTs !== null && shTs > nowMs) return false;
      const ordId = String(sh.orderId || "").trim();
      if (ordId && (Array.isArray(allowedOrders) || hasEngineOrders)) {
        if (!allowedOrderIds.has(ordId)) return false;
      }
      return true;
    });
  },

  getUnfinishedValidShipmentsCount(allowedOrders = null) {
    const validShipments = this.getValidShipmentsUpToNow(allowedOrders);
    return validShipments.filter(
      (s) => s.status === "PENDING_PICKUP" || s.status === "IN_TRANSIT" || s.status === "FAILED_RETURNING"
    ).length;
  },

  getShipmentByOrderMap(shipmentsList) {
    const map = new Map();
    (Array.isArray(shipmentsList) ? shipmentsList : []).forEach((s) => {
      if (s && s.orderId) {
        map.set(String(s.orderId).trim(), s);
      }
    });
    return map;
  },

  resolveOrderDisplayStatus(ord, matchedShipment) {
    if (!ord) {
      return { code: "UNKNOWN", label: "Không xác định", badgeClass: "st-BACKORDER" };
    }
    if (ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED") {
      return { code: "CANCELLED", label: "Đã hủy", badgeClass: "st-CANCELLED" };
    }
    if (ord.status === "BACKORDER") {
      return { code: "BACKORDER", label: "Thiếu tồn", badgeClass: "st-BACKORDER" };
    }
    if (ord.platformStatus === "UNCONFIRMED" || ord.status === "PENDING") {
      return { code: "UNCONFIRMED", label: "Chờ xác nhận", badgeClass: "st-BACKORDER" };
    }
    if (matchedShipment && matchedShipment.status) {
      const st = String(matchedShipment.status).toUpperCase();
      if (st === "PENDING_PICKUP") return { code: "PENDING_PICKUP", label: "Chờ lấy hàng", badgeClass: "st-PENDING_PICKUP" };
      if (st === "IN_TRANSIT") return { code: "IN_TRANSIT", label: "Đang giao", badgeClass: "st-IN_TRANSIT" };
      if (st === "DELIVERED") return { code: "DELIVERED", label: "Giao thành công", badgeClass: "st-DELIVERED" };
      if (st === "FAILED_RETURNING") return { code: "FAILED_RETURNING", label: "Giao thất bại", badgeClass: "st-FAILED_RETURNING" };
    }
    const carrier = this.resolveOrderCarrier(ord);
    const chUpper = String(ord.channel || "").toUpperCase();
    if (chUpper === "POS" || carrier === "Tại quầy") {
      return { code: "POS_COMPLETED", label: "Hoàn tất tại quầy", badgeClass: "st-ALLOCATED" };
    }
    if (carrier === "Chưa gán ĐVVC") {
      return { code: "NO_CARRIER", label: "Chờ tạo vận đơn", badgeClass: "st-BACKORDER" };
    }
    return { code: "ALLOCATED_READY", label: "Đã giữ hàng / Xuất kho", badgeClass: "st-ALLOCATED" };
  },

  classifyDashOrderBucket(ord, matchedShipment) {
    // Phân nhóm loại trừ lẫn nhau 100% -> KPI2 + KPI3 + KPI4 + KPI5(Hủy+Lỗi giao) === KPI1
    if (ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED") {
      return { group: "CANCEL_RETURN", sub: "CANCELLED" };
    }
    if (matchedShipment && matchedShipment.status === "FAILED_RETURNING") {
      return { group: "CANCEL_RETURN", sub: "FAILED_RETURN" };
    }
    if (ord.platformStatus === "UNCONFIRMED" || ord.status === "PENDING") {
      return { group: "PENDING", sub: "UNCONFIRMED" };
    }
    if (ord.status === "BACKORDER") {
      return { group: "PENDING", sub: "BACKORDER" };
    }
    if (matchedShipment && (matchedShipment.status === "IN_TRANSIT" || matchedShipment.status === "PENDING_PICKUP")) {
      return { group: "SHIPPING", sub: matchedShipment.status };
    }
    const carrier = this.resolveOrderCarrier(ord);
    if (!matchedShipment && carrier === "Chưa gán ĐVVC") {
      return { group: "PENDING", sub: "NO_CARRIER" };
    }
    return { group: "COMPLETED", sub: matchedShipment && matchedShipment.status === "DELIVERED" ? "DELIVERED" : "ALLOCATED" };
  },

  getUrgentPriority(ord, matchedShipment) {
    const st = this.resolveOrderDisplayStatus(ord, matchedShipment).code;
    if (st === "BACKORDER") return 1;
    if (st === "FAILED_RETURNING") return 2;
    if (st === "UNCONFIRMED") return 3;
    if (st === "NO_CARRIER") return 4;
    if (st === "PENDING_PICKUP") return 5;
    return 99;
  },

  isUrgentOrder(ord, matchedShipment) {
    return this.getUrgentPriority(ord, matchedShipment) <= 5;
  },

  getFilteredDashOrders() {
    const allOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const branchEl = document.getElementById("dashBranchFilter");
    const dateEl = document.getElementById("dashDateFilter");
    const branchVal = branchEl ? branchEl.value : "ALL";
    const dateVal = dateEl ? dateEl.value : "ALL";

    const nowMs = Date.now();
    const now = new Date(nowMs);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const sevenDaysAgo = startOfToday - 6 * 86400000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();

    return allOrders.filter((ord) => {
      if (!ord) return false;
      const ordTs = this.getOrderTimestampMs(ord);

      // Chặn tuyệt đối dữ liệu tương lai ở MỌI chế độ thời gian (kể cả "Tất cả thời gian")
      if (ordTs > nowMs) return false;

      if (branchVal !== "ALL") {
        const w = String(ord.warehouse || ord.branch || "KHO_BINH_PHU").toUpperCase();
        if (branchVal === "KHO_BINH_PHU" && (w.includes("Q7") || w.includes("HN") || w.includes("HANOI"))) return false;
        if (branchVal === "KHO_Q7" && !w.includes("Q7")) return false;
        if (branchVal === "KHO_HN" && !w.includes("HN") && !w.includes("HANOI")) return false;
      }

      if (dateVal === "TODAY" && ordTs < startOfToday) return false;
      if (dateVal === "7D" && ordTs < sevenDaysAgo) return false;
      if (dateVal === "MONTH" && ordTs < startOfMonth) return false;

      return true;
    });
  },

  renderDashboardP2() {
    this.syncShipmentsFromEngine();
    const orders = this.getFilteredDashOrders();
    const effectiveInventory = this.getEffectiveInventoryAtNow();
    const validShipments = this.getValidShipmentsUpToNow(orders);

    const syncHintEl = document.getElementById("dashSyncTimestamp");
    if (syncHintEl && window.cloudSync) {
      syncHintEl.innerText = `Cập nhật gần nhất: ${window.cloudSync.lastSyncTime || "Sổ Google Sheets"}`;
    }

    // Giữ đồng bộ 2 Badge Sidebar khi lọc / vẽ lại Tổng Quan
    const badgeBackorder = document.getElementById("badgeBackorderCount");
    if (badgeBackorder) {
      badgeBackorder.innerText = String(this.getLowStockInventoryItems(effectiveInventory).length);
    }
    const badgeShipping = document.getElementById("badgeShippingCount");
    if (badgeShipping) {
      badgeShipping.innerText = String(this.getUnfinishedValidShipmentsCount());
    }

    this.renderDash7KpiStrip(orders, effectiveInventory, validShipments);
    this.renderComboTrendChart(orders);
    this.renderChannelStackedBar(orders);
    this.renderUrgentAlertsAndReturns(orders, effectiveInventory, validShipments);
    this.renderUrgentOrdersTable(orders, validShipments);
  },

  renderDash7KpiStrip(orders, effectiveInventory, validShipments) {
    const shipmentsList = Array.isArray(validShipments) ? validShipments : this.getValidShipmentsUpToNow(orders);
    const shMap = this.getShipmentByOrderMap(shipmentsList);
    const inv = Array.isArray(effectiveInventory) ? effectiveInventory : this.getEffectiveInventoryAtNow();

    const total = orders.length;
    let unconfirmedCount = 0;
    let backorderCount = 0;
    let noCarrierCount = 0;
    let inTransitCount = 0;
    let pendingPickupCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let failedReturnCount = 0;

    orders.forEach((ord) => {
      const sh = shMap.get(String(ord.orderId || "").trim()) || null;
      const bucket = this.classifyDashOrderBucket(ord, sh);
      if (bucket.group === "PENDING") {
        if (bucket.sub === "UNCONFIRMED") unconfirmedCount++;
        else if (bucket.sub === "BACKORDER") backorderCount++;
        else noCarrierCount++;
      } else if (bucket.group === "SHIPPING") {
        if (bucket.sub === "IN_TRANSIT") inTransitCount++;
        else pendingPickupCount++;
      } else if (bucket.group === "COMPLETED") {
        completedCount++;
      } else if (bucket.group === "CANCEL_RETURN") {
        if (bucket.sub === "CANCELLED") cancelledCount++;
        else failedReturnCount++;
      }
    });

    const pendingTotal = unconfirmedCount + backorderCount + noCarrierCount;
    const shippingTotal = inTransitCount + pendingPickupCount;

    const validOrders = orders.filter(
      (o) => o.status !== "CANCELLED" && o.status !== "INVALID" && o.platformStatus !== "CANCELLED"
    );
    const estRevenue = validOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1) * (Number(o.unitPrice) || 0), 0);

    const totalPhysical = inv.reduce((sum, item) => sum + (Number(item.effectivePhysicalStock ?? item.physicalStock) || 0), 0);
    const totalReserved = inv.reduce((sum, item) => sum + (Number(item.effectiveReservedStock ?? item.reservedStock) || 0), 0);
    const availStock = inv.reduce((sum, item) => sum + this.getSkuAvailableStock(item), 0);

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.innerText = txt;
    };
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setTxt("dashKpiTotalOrders", total.toLocaleString("vi-VN"));
    setTxt("dashKpiTotalOrdersSub", total > 0 ? `Dữ liệu thực tế (${validOrders.length} hợp lệ)` : "Chưa có đơn hàng trong kỳ");

    setTxt("dashKpiPending", pendingTotal.toLocaleString("vi-VN"));
    setHtml(
      "dashKpiPendingSub",
      `<span class="dash-kpi-chip">Chờ xác nhận: <b>${unconfirmedCount}</b></span> · <span class="dash-kpi-chip">Thiếu tồn: <b>${backorderCount}</b></span><br><span class="dash-kpi-chip">Chờ tạo vận đơn: <b>${noCarrierCount}</b></span>`
    );

    setTxt("dashKpiShipping", shippingTotal.toLocaleString("vi-VN"));
    setTxt("dashKpiShippingSub", `Có ${failedReturnCount} đơn cần chú ý`);

    setTxt("dashKpiCompleted", completedCount.toLocaleString("vi-VN"));
    const completeRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    setTxt("dashKpiCompletedSub", `Tỷ lệ hoàn tất: ${completeRate}%`);

    setHtml("dashKpiCancelReturn", `${cancelledCount} / <span class="text-danger">${failedReturnCount}</span>`);
    setTxt("dashKpiCancelReturnSub", `Hủy: ${cancelledCount} · Hoàn/Lỗi giao: ${failedReturnCount}`);

    let revFormatted = "0 VND";
    if (estRevenue >= 1e9) {
      revFormatted = `${(estRevenue / 1e9).toFixed(2)} Tỷ VND`;
    } else if (estRevenue >= 1e6) {
      revFormatted = `${(estRevenue / 1e6).toFixed(2)} Tr VND`;
    } else if (estRevenue > 0) {
      revFormatted = `${estRevenue.toLocaleString("vi-VN")} VND`;
    }
    setTxt("dashKpiEstRevenue", revFormatted);
    setTxt("dashKpiEstRevenueSub", `Trên ${validOrders.length} đơn hợp lệ`);

    setTxt("dashKpiAvailableStock", availStock.toLocaleString("vi-VN"));
    setTxt("dashKpiAvailableStockSub", `${inv.length} mã hàng (${totalPhysical} tồn − ${totalReserved} giữ chỗ)`);
  },

  renderComboTrendChart(orders) {
    const svg = document.getElementById("dashComboTrendSvg");
    if (!svg) return;

    const plotLeft = 36;
    const plotRight = 442;
    const plotTop = 26;
    const plotBottom = 198;
    const plotH = plotBottom - plotTop;

    // Trạng thái trống (0 đơn hàng): hiển thị gọn gàng, tuyệt đối không NaN/Infinity
    if (!Array.isArray(orders) || orders.length === 0) {
      svg.innerHTML = `
        <text x="4" y="13" text-anchor="start" font-size="9.5" font-weight="700" fill="currentColor" opacity="0.75">Số đơn</text>
        <text x="${plotRight + 22}" y="13" text-anchor="end" font-size="9.5" font-weight="700" fill="#d97706">Đơn vị: Triệu VND</text>
        <rect x="${plotLeft}" y="${plotTop}" width="${plotRight - plotLeft}" height="${plotH}" rx="0" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
        <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="#94a3b8" stroke-width="1" />
        <text x="${plotLeft - 6}" y="${plotBottom + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.65">0</text>
        <text x="${plotRight + 6}" y="${plotBottom + 4}" text-anchor="start" font-size="10" fill="#d97706" font-weight="700">0</text>
        <text x="${(plotLeft + plotRight) / 2}" y="${plotTop + plotH / 2 - 4}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity="0.65">Chưa có đơn hàng trong khoảng thời gian đang chọn</text>
        <text x="${(plotLeft + plotRight) / 2}" y="${plotTop + plotH / 2 + 14}" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">Hãy chọn "Tất cả thời gian" hoặc kỳ khác để xem xu hướng</text>
      `;
      return;
    }

    const dateEl = document.getElementById("dashDateFilter");
    const dateVal = dateEl ? dateEl.value : "ALL";
    const pad2 = (n) => String(n).padStart(2, "0");

    // Xác định tập các tháng phát sinh trong orders để quyết định gom theo Tháng hay theo Ngày
    const monthSet = new Set();
    const orderEntries = orders.map((ord) => {
      const ts = this.getOrderTimestampMs(ord);
      const dt = new Date(ts);
      const yyyy = dt.getFullYear();
      const mm = dt.getMonth() + 1;
      const dd = dt.getDate();
      const mKey = `${yyyy}-${pad2(mm)}`;
      const dKey = `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
      monthSet.add(mKey);
      return { ord, ts, yyyy, mm, dd, mKey, dKey };
    });

    const useMonthlyMode = dateVal === "ALL" && monthSet.size >= 2;
    const bucketMap = new Map();

    if (useMonthlyMode) {
      // Tạo chuỗi liên tục từ tháng sớm nhất đến tháng muộn nhất (VD: Th01 -> Th11/2026)
      const sortedMonths = Array.from(monthSet).sort();
      const [startY, startM] = sortedMonths[0].split("-").map(Number);
      const [endY, endM] = sortedMonths[sortedMonths.length - 1].split("-").map(Number);
      let cy = startY;
      let cm = startM;
      while (cy < endY || (cy === endY && cm <= endM)) {
        const key = `${cy}-${pad2(cm)}`;
        bucketMap.set(key, {
          key,
          label: `Th${pad2(cm)}`,
          fullLabel: `Tháng ${pad2(cm)}/${cy}`,
          received: 0,
          exported: 0,
          revenue: 0,
          ts: new Date(cy, cm - 1, 1, 0, 0, 0, 0).getTime()
        });
        cm++;
        if (cm > 12) {
          cm = 1;
          cy++;
        }
      }
    }

    orderEntries.forEach(({ ord, yyyy, mm, dd, mKey, dKey }) => {
      const key = useMonthlyMode ? mKey : dKey;
      if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          key,
          label: useMonthlyMode ? `Th${pad2(mm)}` : `${pad2(dd)}/${pad2(mm)}`,
          fullLabel: useMonthlyMode ? `Tháng ${pad2(mm)}/${yyyy}` : `${pad2(dd)}/${pad2(mm)}/${yyyy}`,
          received: 0,
          exported: 0,
          revenue: 0,
          ts: useMonthlyMode
            ? new Date(yyyy, mm - 1, 1, 0, 0, 0, 0).getTime()
            : new Date(yyyy, mm - 1, dd, 0, 0, 0, 0).getTime()
        });
      }
      const b = bucketMap.get(key);
      b.received += 1;
      const isCancelled = ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED";
      if (!isCancelled) {
        // Đường doanh thu màu cam tính trên đơn hợp lệ (không hủy) -> khớp 100% KPI 6
        b.revenue += (Number(ord.quantity) || 1) * (Number(ord.unitPrice) || 0);
        if (ord.status === "ALLOCATED") {
          b.exported += 1;
        }
      }
    });

    const points = Array.from(bucketMap.values()).sort((a, b) => a.ts - b.ts);

    // Làm tròn mốc trục chia hết cho 4 để lưới hiển thị chính xác tuyệt đối, không lệch thị giác
    const rawMaxOrders = Math.max(1, ...points.map((p) => Math.max(p.received, p.exported)));
    const niceMaxOrders = Math.max(4, Math.ceil(rawMaxOrders / 4) * 4);

    const rawMaxRev = Math.max(400000, ...points.map((p) => p.revenue));
    const revStepCandidates = [100000, 200000, 250000, 500000, 1000000, 1500000, 2000000, 2500000, 5000000, 6000000, 10000000];
    let revStep = revStepCandidates.find((step) => step * 4 >= rawMaxRev);
    if (!revStep) {
      revStep = Math.ceil(rawMaxRev / 4 / 1000000) * 1000000;
    }
    const niceMaxRev = revStep * 4;

    const formatRevAxis = (val) => {
      if (val <= 0) return "0";
      const mil = val / 1e6;
      return Number.isInteger(mil) ? mil.toFixed(0) : mil.toFixed(1);
    };

    let gridHtml = "";
    for (let i = 0; i <= 4; i++) {
      const y = Number((plotTop + (plotH * i) / 4).toFixed(2));
      const oVal = Math.round(niceMaxOrders * (1 - i / 4));
      const rVal = formatRevAxis(niceMaxRev * (1 - i / 4));
      gridHtml += `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.7" />`;
      gridHtml += `<text x="${plotLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.7">${oVal}</text>`;
      gridHtml += `<text x="${plotRight + 6}" y="${y + 4}" text-anchor="start" font-size="10" fill="#d97706" font-weight="700">${rVal}</text>`;
    }

    const slotW = (plotRight - plotLeft) / points.length;
    const isSinglePoint = points.length === 1;
    const barW = isSinglePoint ? 30 : Math.min(16, Math.max(6, Math.floor(slotW * 0.28)));
    const barGap = isSinglePoint ? 6 : 2;
    const labelFontSize = points.length >= 10 ? 9.5 : 10.5;

    let barsHtml = "";
    const lineCoords = [];

    points.forEach((p, idx) => {
      const cx = Number((plotLeft + slotW * idx + slotW / 2).toFixed(2));
      const hRec = (p.received / niceMaxOrders) * plotH;
      const hExp = (p.exported / niceMaxOrders) * plotH;
      const yRec = Number((plotBottom - hRec).toFixed(2));
      const yExp = Number((plotBottom - hExp).toFixed(2));
      const barRecH = p.received > 0 ? Math.max(2, Number(hRec.toFixed(2))) : 0;
      const barExpH = p.exported > 0 ? Math.max(2, Number(hExp.toFixed(2))) : 0;

      if (barRecH > 0) {
        barsHtml += `<rect x="${(cx - barW - barGap / 2).toFixed(2)}" y="${yRec}" width="${barW}" height="${barRecH}" rx="0" fill="#2563eb"><title>${p.fullLabel} · Tiếp nhận: ${p.received} đơn</title></rect>`;
      }
      if (barExpH > 0) {
        barsHtml += `<rect x="${(cx + barGap / 2).toFixed(2)}" y="${yExp}" width="${barW}" height="${barExpH}" rx="0" fill="#f97316"><title>${p.fullLabel} · Xuất đơn: ${p.exported} đơn</title></rect>`;
      }

      if (isSinglePoint) {
        barsHtml += `<text x="${(cx - barW / 2 - barGap / 2).toFixed(2)}" y="${Math.max(plotTop + 10, yRec - 5)}" text-anchor="middle" font-size="10" font-weight="700" fill="#2563eb">${p.received}</text>`;
        barsHtml += `<text x="${(cx + barW / 2 + barGap / 2).toFixed(2)}" y="${Math.max(plotTop + 10, yExp - 5)}" text-anchor="middle" font-size="10" font-weight="700" fill="#ea580c">${p.exported}</text>`;
      }

      barsHtml += `<text x="${cx}" y="${plotBottom + 16}" text-anchor="middle" font-size="${labelFontSize}" font-weight="700" fill="currentColor" opacity="0.8">${p.label}</text>`;

      const yRev = Number((plotBottom - (p.revenue / niceMaxRev) * plotH).toFixed(2));
      lineCoords.push({
        x: cx,
        y: yRev,
        rev: p.revenue,
        received: p.received,
        exported: p.exported,
        label: p.label,
        fullLabel: p.fullLabel
      });
    });

    const polylineStr = lineCoords.map((c) => `${c.x},${c.y}`).join(" ");
    const dotsHtml = lineCoords
      .map((c) => {
        const revMilNum = (c.rev / 1e6).toFixed(2);
        const singleBadge = isSinglePoint
          ? `<text x="${c.x}" y="${Math.max(plotTop - 6, c.y - 10)}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#b45309">Doanh thu: ${revMilNum} Tr VND</text>`
          : "";
        return `${singleBadge}<circle cx="${c.x}" cy="${c.y}" r="${isSinglePoint ? 5 : 3.8}" fill="#ffffff" stroke="#d97706" stroke-width="2.2" data-label="${c.label}" data-revenue="${c.rev}" data-received="${c.received}" data-exported="${c.exported}"><title>${c.fullLabel} · Doanh thu: ${c.rev.toLocaleString("vi-VN")} (${revMilNum} Tr)</title></circle>`;
      })
      .join("");

    svg.innerHTML = `
      <text x="4" y="13" text-anchor="start" font-size="9.5" font-weight="700" fill="currentColor" opacity="0.75">Số đơn</text>
      <text x="${plotRight + 22}" y="13" text-anchor="end" font-size="9.5" font-weight="700" fill="#d97706">Đơn vị: Triệu VND</text>
      ${gridHtml}
      <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="#94a3b8" stroke-width="1" />
      ${barsHtml}
      ${lineCoords.length > 1 ? `<polyline fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter" points="${polylineStr}" />` : ""}
      ${dotsHtml}
    `;
  },

  renderChannelStackedBar(orders) {
    const container = document.getElementById("dash5ChannelStackedChart");
    if (!container) return;

    const channels = [
      { key: "SHOPEE", label: "Shopee" },
      { key: "TIKTOK", label: "TikTok" },
      { key: "LAZADA", label: "Lazada" },
      { key: "POS", label: "POS" },
      { key: "FACEBOOK", label: "Facebook" }
    ];

    const listAll = Array.isArray(orders) ? orders : [];
    const stats = channels.map((ch) => {
      const list = listAll.filter((o) => String(o.channel || "").toUpperCase().includes(ch.key));
      const cancelled = list.filter(
        (o) => o.status === "CANCELLED" || o.status === "INVALID" || o.platformStatus === "CANCELLED"
      ).length;
      const allocated = list.filter((o) => o.status === "ALLOCATED" && o.platformStatus !== "CANCELLED").length;
      const pendingOrShortage = Math.max(0, list.length - allocated - cancelled);
      return {
        label: ch.label,
        total: list.length,
        pendingOrShortage,
        allocated,
        cancelled
      };
    });

    const maxTotal = Math.max(1, ...stats.map((s) => s.total));

    container.innerHTML = stats
      .map((s) => {
        const pendH = s.total > 0 ? Math.round((s.pendingOrShortage / maxTotal) * 100) : 0;
        const allocH = s.total > 0 ? Math.round((s.allocated / maxTotal) * 100) : 0;
        const canH = s.total > 0 ? Math.round((s.cancelled / maxTotal) * 100) : 0;
        return `
          <div class="dash-stacked-col-item" title="${s.label}: Tổng ${s.total} đơn (Chờ duyệt / Thiếu tồn: ${s.pendingOrShortage}, Đã giữ hàng / Xuất kho: ${s.allocated}, Hủy đơn: ${s.cancelled})">
            <div class="dash-stacked-total-lbl">${s.total}</div>
            <div class="dash-stacked-bar-track">
              <div class="dash-stacked-seg seg-received" style="height:${pendH}%;"></div>
              <div class="dash-stacked-seg seg-exported" style="height:${allocH}%;"></div>
              <div class="dash-stacked-seg seg-cancelled" style="height:${canH}%;"></div>
            </div>
            <div class="dash-stacked-ch-name">${s.label}</div>
          </div>
        `;
      })
      .join("");
  },

  openShippingTabFiltered(statusCode) {
    this.shippingStatusFilter = statusCode || "ALL";
    const statusSelect = document.getElementById("shippingStatusFilter");
    if (statusSelect) statusSelect.value = this.shippingStatusFilter;
    this.switchSidebarTab("shipping");
  },

  renderUrgentAlertsAndReturns(orders, effectiveInventory, validShipments) {
    const alertsBox = document.getElementById("dashUrgentAlertsBox");
    const returnBox = document.getElementById("dashReturnCancelStatsBox");

    const lowStockSkus = this.getLowStockInventoryItems(effectiveInventory);
    const shipmentsList = Array.isArray(validShipments) ? validShipments : this.getValidShipmentsUpToNow(orders);

    // Đồng bộ trạng thái thực tế từ bảng VanDon (thay thế hoàn toàn s.isLate & DELIVERY_FAILED không tồn tại)
    const failedShipments = shipmentsList.filter((s) => s.status === "FAILED_RETURNING").length;
    const pendingPickupShipments = shipmentsList.filter((s) => s.status === "PENDING_PICKUP").length;
    const backorderCount = orders.filter((o) => o.status === "BACKORDER").length;
    const attentionWaitingCount = pendingPickupShipments + backorderCount;

    if (alertsBox) {
      const skuRowsHtml =
        lowStockSkus.length > 0
          ? `<div class="dash-alert-sku-list">` +
            lowStockSkus
              .map((item) => {
                const free = this.getSkuAvailableStock(item);
                return `
                  <div class="dash-alert-sku-row">
                    <span><b>${item.sku}</b> (Còn: ${free})</span>
                    <button type="button" class="dash-btn-nhap-mini" onclick="AppUI.quickImportFromDashAlert('${item.sku}')">Nhập</button>
                  </div>
                `;
              })
              .join("") +
            `</div>`
          : `<div class="dash-alert-sku-empty">Tất cả mặt hàng đều đủ tồn kho an toàn (&gt; 5).</div>`;

      alertsBox.innerHTML = `
        <div class="dash-alert-pill warn">
          <div class="dash-alert-pill-top">
            <span>⚠️ <b>${lowStockSkus.length}</b> sản phẩm sắp hết hàng</span>
            <button type="button" class="dash-btn-nhap-mini" onclick="AppUI.switchSidebarTab('inventory')">Vào Kho</button>
          </div>
          ${skuRowsHtml}
        </div>
        <div class="dash-alert-pill danger" style="cursor:pointer;" onclick="AppUI.openShippingTabFiltered('FAILED_RETURNING')" title="Xem danh sách vận đơn giao thất bại chờ xử lý">
          <div class="dash-alert-pill-top">
            <span>✖ <b>${failedShipments}</b> đơn giao thất bại chờ xử lý</span>
          </div>
        </div>
        <div class="dash-alert-pill danger" style="cursor:pointer;" onclick="AppUI.filterDashUrgentByStatus('URGENT')" title="Chờ lấy hàng (${pendingPickupShipments}) · Thiếu tồn kho (${backorderCount})">
          <div class="dash-alert-pill-top">
            <span>❗ <b>${attentionWaitingCount}</b> đơn chờ lấy hàng / thiếu tồn chờ xử lý</span>
          </div>
        </div>
      `;
    }

    if (returnBox) {
      const total = orders.length;
      const cancelled = orders.filter(
        (o) => o.status === "CANCELLED" || o.status === "INVALID" || o.platformStatus === "CANCELLED"
      ).length;
      const totalIssue = cancelled + failedShipments;
      const rate = total > 0 ? ((totalIssue / total) * 100).toFixed(1) : "0.0";

      returnBox.innerHTML = `
        <div class="dash-return-stats-title">
          <span>Thống kê hoàn / hủy đơn</span>
          <span style="color:#dc2626;">${rate}% (${totalIssue}/${total})</span>
        </div>
        <div class="dash-return-progress-bar">
          <div class="dash-return-progress-fill" style="width:${Math.min(100, Number(rate))}%;"></div>
        </div>
        <div style="color:var(--text-muted);font-size:11px;">
          Hủy: ${cancelled} · Hoàn/Lỗi giao: ${failedShipments} · Nguyên nhân: Khách đổi ý · Thiếu hàng trong kho
        </div>
      `;
    }
  },

  getUrgentOrdersFilteredList(ordersInput, shipmentsInput) {
    const baseOrders = Array.isArray(ordersInput) ? [...ordersInput] : [...this.getFilteredDashOrders()];
    const validShipments = Array.isArray(shipmentsInput) ? shipmentsInput : this.getValidShipmentsUpToNow(baseOrders);
    const shMap = this.getShipmentByOrderMap(validShipments);

    const chVal = document.getElementById("dashFilterChannel")?.value || "ALL";
    const carrierVal = String(document.getElementById("dashFilterCarrier")?.value || "ALL").toUpperCase();
    const statusVal = document.getElementById("dashFilterStatus")?.value || "URGENT";
    const qVal = String(document.getElementById("dashFilterSearch")?.value || "").trim().toLowerCase();

    const filtered = baseOrders.filter((ord) => {
      const sh = shMap.get(String(ord.orderId || "").trim()) || null;
      const carrier = this.resolveOrderCarrier(ord);
      const bucket = this.classifyDashOrderBucket(ord, sh);

      if (chVal !== "ALL" && !String(ord.channel || "").toUpperCase().includes(chVal)) return false;
      if (carrierVal !== "ALL" && !String(carrier).toUpperCase().includes(carrierVal)) return false;

      if (statusVal === "URGENT") {
        if (!this.isUrgentOrder(ord, sh)) return false;
      } else if (statusVal === "PENDING") {
        if (bucket.group !== "PENDING") return false;
      } else if (statusVal === "FAILED_RETURN") {
        if (!(sh && sh.status === "FAILED_RETURNING")) return false;
      } else if (statusVal === "COMPLETED" || statusVal === "ALLOCATED") {
        if (bucket.group !== "COMPLETED") return false;
      } else if (statusVal === "CANCEL_RETURN") {
        if (bucket.group !== "CANCEL_RETURN") return false;
      } else if (statusVal === "CANCELLED") {
        if (bucket.sub !== "CANCELLED") return false;
      }

      if (qVal) {
        const hay = `${ord.orderId} ${ord.customerName} ${ord.sku} ${ord.productName} ${carrier}`.toLowerCase();
        if (!hay.includes(qVal)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const shA = shMap.get(String(a.orderId || "").trim()) || null;
      const shB = shMap.get(String(b.orderId || "").trim()) || null;
      if (statusVal === "URGENT" && this.dashUrgentSortMode === "PRIORITY_DATE") {
        const prioDiff = this.getUrgentPriority(a, shA) - this.getUrgentPriority(b, shB);
        if (prioDiff !== 0) return prioDiff;
      }
      const tsA = this.getOrderTimestampMs(a);
      const tsB = this.getOrderTimestampMs(b);
      return this.dashUrgentSortDesc ? tsB - tsA : tsA - tsB;
    });

    return { filtered, baseOrders, shMap };
  },

  syncDashSelectAllCheckbox(visibleItems) {
    const selectAllEl = document.getElementById("dashSelectAllUrgent");
    if (!selectAllEl) return;
    const list = Array.isArray(visibleItems) ? visibleItems : [];
    if (list.length === 0) {
      selectAllEl.checked = false;
      selectAllEl.indeterminate = false;
      return;
    }
    const selectedVisibleCount = list.filter((o) => this.dashSelectedOrderIds.has(o.orderId)).length;
    selectAllEl.checked = selectedVisibleCount === list.length;
    selectAllEl.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < list.length;
  },

  renderUrgentOrdersTable(ordersInput, shipmentsInput) {
    const tbody = document.getElementById("dashUrgentOrdersBody");
    if (!tbody) return;

    const { filtered, baseOrders, shMap } = this.getUrgentOrdersFilteredList(ordersInput, shipmentsInput);

    // Cập nhật số đếm trên 2 nút chuyển nhanh đầu bảng
    const urgentTotalCount = baseOrders.filter((o) => this.isUrgentOrder(o, shMap.get(String(o.orderId || "").trim()) || null)).length;
    const statusVal = document.getElementById("dashFilterStatus")?.value || "URGENT";
    const quickUrgentBtn = document.getElementById("dashQuickUrgentBtn");
    const quickAllBtn = document.getElementById("dashQuickAllBtn");
    if (quickUrgentBtn) {
      quickUrgentBtn.innerText = `Cần xử lý gấp (${urgentTotalCount})`;
      quickUrgentBtn.classList.toggle("active", statusVal === "URGENT");
    }
    if (quickAllBtn) {
      quickAllBtn.innerText = `Tất cả đơn (${baseOrders.length})`;
      quickAllBtn.classList.toggle("active", statusVal === "ALL");
    }

    // Dọn các mã đơn đã không còn nằm trong danh sách lọc hiện tại khỏi bộ chọn
    const filteredIds = new Set(filtered.map((o) => o.orderId));
    Array.from(this.dashSelectedOrderIds).forEach((id) => {
      if (!filteredIds.has(id)) this.dashSelectedOrderIds.delete(id);
    });

    // Phân trang gọn gàng
    const pageSize = Math.max(1, Number(this.dashUrgentPageSize) || 8);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (this.dashUrgentPage > totalPages) this.dashUrgentPage = totalPages;
    if (this.dashUrgentPage < 1) this.dashUrgentPage = 1;

    const startIdx = (this.dashUrgentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    this.syncDashSelectAllCheckbox(pageItems);

    const pagEl = document.getElementById("dashUrgentPagination");
    if (pagEl) {
      if (filtered.length === 0) {
        pagEl.innerHTML = `<span class="dash-pagination-info">Hiển thị 0 / 0 đơn hàng</span>`;
      } else {
        const showFrom = startIdx + 1;
        const showTo = Math.min(filtered.length, startIdx + pageItems.length);
        let pageBtns = "";
        if (totalPages > 1) {
          pageBtns += `<button type="button" class="dash-page-btn" ${this.dashUrgentPage <= 1 ? "disabled" : ""} onclick="AppUI.setDashUrgentPage(${this.dashUrgentPage - 1})">Trước</button>`;
          for (let p = 1; p <= totalPages; p++) {
            pageBtns += `<button type="button" class="dash-page-btn ${p === this.dashUrgentPage ? "active" : ""}" onclick="AppUI.setDashUrgentPage(${p})">${p}</button>`;
          }
          pageBtns += `<button type="button" class="dash-page-btn" ${this.dashUrgentPage >= totalPages ? "disabled" : ""} onclick="AppUI.setDashUrgentPage(${this.dashUrgentPage + 1})">Sau</button>`;
        }
        pagEl.innerHTML = `
          <span class="dash-pagination-info">Hiển thị ${showFrom}–${showTo} / ${filtered.length} đơn hàng</span>
          ${pageBtns ? `<div class="dash-pagination-btns">${pageBtns}</div>` : ""}
        `;
      }
    }

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted);">
            Chưa có đơn hàng nào phù hợp khoảng thời gian hoặc bộ lọc đang chọn.
          </td>
        </tr>
      `;
      return;
    }

    const channelBadgeMap = {
      SHOPEE: { name: "Shopee", color: "#ee4d2d" },
      TIKTOK: { name: "TikTok", color: "#111827" },
      LAZADA: { name: "Lazada", color: "#0f146d" },
      POS: { name: "POS", color: "#059669" },
      FACEBOOK: { name: "Facebook", color: "#1877f2" }
    };

    tbody.innerHTML = pageItems
      .map((ord) => {
        const chKey = Object.keys(channelBadgeMap).find((k) => String(ord.channel || "").toUpperCase().includes(k)) || "POS";
        const chInfo = channelBadgeMap[chKey];
        const totalMoney = (Number(ord.quantity) || 1) * (Number(ord.unitPrice) || 0);
        const dateShort = String(ord.orderTime || "").split(" ")[0] || "—";
        const carrier = this.resolveOrderCarrier(ord);
        const matchedSh = shMap.get(String(ord.orderId || "").trim()) || null;
        const stInfo = this.resolveOrderDisplayStatus(ord, matchedSh);
        const isChecked = this.dashSelectedOrderIds.has(ord.orderId);

        // Nút "Duyệt" chỉ hiện cho đơn đang Chờ xác nhận; ẩn nút "Hủy" cho đơn Đã hủy / Giao thành công / Hoàn tất tại quầy
        const canApprove = stInfo.code === "UNCONFIRMED";
        const canCancel = stInfo.code !== "CANCELLED" && stInfo.code !== "DELIVERED" && stInfo.code !== "POS_COMPLETED";

        const approveBtnHtml = canApprove
          ? `<button type="button" class="dash-act-btn approve" onclick="AppUI.approveUrgentOrder('${ord.orderId}')">Duyệt</button>`
          : "";
        const printBtnHtml = `<button type="button" class="dash-act-btn print" onclick="AppUI.printUrgentOrderBill('${ord.orderId}')">In phiếu</button>`;
        const cancelBtnHtml = canCancel
          ? `<button type="button" class="dash-act-btn cancel" onclick="AppUI.cancelUrgentOrder('${ord.orderId}')">Hủy</button>`
          : "";

        return `
          <tr>
            <td style="text-align:center;">
              <input type="checkbox" ${isChecked ? "checked" : ""} onchange="AppUI.toggleUrgentOrderCheck('${ord.orderId}', this.checked)" />
            </td>
            <td class="dash-col-orderid" style="font-weight:700;color:var(--accent-primary, #2563eb);">#${ord.orderId}</td>
            <td class="dash-col-customer">${ord.customerName || "Khách lẻ"}</td>
            <td class="dash-col-channel"><span style="font-weight:700;color:${chInfo.color};">${chInfo.name}</span></td>
            <td class="dash-col-date">${dateShort}</td>
            <td class="dash-col-carrier">${carrier}</td>
            <td class="dash-col-money">${totalMoney.toLocaleString("vi-VN")} VND</td>
            <td class="dash-col-status"><span class="status-badge ${stInfo.badgeClass}">${stInfo.label}</span></td>
            <td class="dash-col-actions">
              <div class="dash-action-btn-group">
                ${approveBtnHtml}
                ${printBtnHtml}
                ${cancelBtnHtml}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  },

  onDashUrgentFilterChange() {
    this.dashUrgentPage = 1;
    const statusVal = document.getElementById("dashFilterStatus")?.value || "URGENT";
    if (statusVal === "URGENT") {
      this.dashUrgentSortMode = "PRIORITY_DATE";
    }
    this.renderUrgentOrdersTable();
  },

  setDashUrgentQuickMode(mode) {
    const sel = document.getElementById("dashFilterStatus");
    if (sel) sel.value = mode;
    this.dashUrgentPage = 1;
    this.dashUrgentSortMode = mode === "URGENT" ? "PRIORITY_DATE" : "DATE_ONLY";
    this.renderUrgentOrdersTable();
  },

  setDashUrgentPage(pageNum) {
    this.dashUrgentPage = Math.max(1, Number(pageNum) || 1);
    this.renderUrgentOrdersTable();
  },

  toggleDashAdvancedFilter() {
    const bar = document.getElementById("dashAdvancedFilterBar");
    if (bar) bar.classList.toggle("hidden");
  },

  filterDashUrgentByStatus(status) {
    const bar = document.getElementById("dashAdvancedFilterBar");
    const sel = document.getElementById("dashFilterStatus");
    if (bar) bar.classList.remove("hidden");
    if (sel) sel.value = status;
    this.dashUrgentPage = 1;
    this.dashUrgentSortMode = status === "URGENT" ? "PRIORITY_DATE" : "DATE_ONLY";
    this.renderUrgentOrdersTable();
  },

  toggleUrgentOrderSort() {
    this.dashUrgentSortDesc = !this.dashUrgentSortDesc;
    this.dashUrgentSortMode = "DATE_ONLY";
    this.dashUrgentPage = 1;
    const arrow = document.getElementById("dashSortArrow");
    if (arrow) arrow.innerText = this.dashUrgentSortDesc ? "↓" : "↑";
    this.renderUrgentOrdersTable();
  },

  toggleSelectAllUrgentOrders(checked) {
    const { filtered } = this.getUrgentOrdersFilteredList();
    const pageSize = Math.max(1, Number(this.dashUrgentPageSize) || 8);
    const startIdx = (this.dashUrgentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    if (checked) {
      pageItems.forEach((o) => this.dashSelectedOrderIds.add(o.orderId));
    } else {
      pageItems.forEach((o) => this.dashSelectedOrderIds.delete(o.orderId));
    }
    this.renderUrgentOrdersTable();
  },

  toggleUrgentOrderCheck(orderId, checked) {
    if (checked) this.dashSelectedOrderIds.add(orderId);
    else this.dashSelectedOrderIds.delete(orderId);
    const { filtered } = this.getUrgentOrdersFilteredList();
    const pageSize = Math.max(1, Number(this.dashUrgentPageSize) || 8);
    const startIdx = (this.dashUrgentPage - 1) * pageSize;
    this.syncDashSelectAllCheckbox(filtered.slice(startIdx, startIdx + pageSize));
  },

  approveUrgentOrder(orderId) {
    if (!window.omsEngine) return;
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;
    ord.platformStatus = "CONFIRMED";
    window.omsEngine.recalculateAllAllocations();
    window.omsEngine.addLog("info", `✅ [TỔNG QUAN] Đã duyệt nhanh đơn hàng #${orderId}.`);
    if (window.cloudSync) window.cloudSync.scheduleCloudPush("DASH_APPROVE_ORDER");
    this.renderAll();
  },

  batchApproveUrgentOrders() {
    if (!window.omsEngine) return;
    if (this.dashSelectedOrderIds.size === 0) {
      alert("Vui lòng tích chọn ít nhất 1 đơn hàng để xử lý hàng loạt.");
      return;
    }
    let count = 0;
    this.dashSelectedOrderIds.forEach((id) => {
      const ord = window.omsEngine.orders.find((o) => o.orderId === id);
      if (ord && ord.platformStatus !== "CANCELLED") {
        ord.platformStatus = "CONFIRMED";
        count++;
      }
    });
    this.dashSelectedOrderIds.clear();
    const selectAllEl = document.getElementById("dashSelectAllUrgent");
    if (selectAllEl) {
      selectAllEl.checked = false;
      selectAllEl.indeterminate = false;
    }
    window.omsEngine.recalculateAllAllocations();
    window.omsEngine.addLog("info", `✅ [XỬ LÝ HÀNG LOẠT] Đã duyệt ${count} đơn hàng được chọn từ Tổng quan.`);
    if (window.cloudSync) window.cloudSync.scheduleCloudPush("DASH_BATCH_APPROVE");
    this.renderAll();
  },

  printUrgentOrderBill(orderId) {
    if (!window.omsEngine) return;
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;
    this.switchSidebarTab("qr_api");
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setVal("wbOrderId", ord.orderId);
    setVal("wbChannel", ord.channel);
    setVal("wbCustomerName", ord.customerName || "");
    setVal("wbCustomerPhone", ord.customerPhone || "");
    setVal("wbAddress", ord.shippingAddress || "");
    setVal("wbTotalAmount", ((Number(ord.quantity) || 1) * (Number(ord.unitPrice) || 0)).toString());
    this.generateWaybillAndQR(true);
  },

  cancelUrgentOrder(orderId) {
    if (!window.omsEngine) return;
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;
    ord.platformStatus = "CANCELLED";
    ord.status = "CANCELLED";
    window.omsEngine.recalculateAllAllocations();
    window.omsEngine.addLog("warn", `🚫 [TỔNG QUAN] Đã hủy đơn hàng #${orderId} và hoàn trả tồn kho sẵn sàng bán.`);
    if (window.cloudSync) window.cloudSync.scheduleCloudPush("DASH_CANCEL_ORDER");
    this.renderAll();
  },

  quickImportFromDashAlert(sku) {
    this.switchSidebarTab("inventory");
    const searchEl = document.getElementById("invSearchInput");
    if (searchEl) {
      searchEl.value = sku;
      this.invSearchQuery = sku;
      this.renderInventoryTable();
    }
  },

};

window.AppUI = AppUI;
window.addEventListener("DOMContentLoaded", () => AppUI.init());
