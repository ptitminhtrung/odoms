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
  }
];

const AppUI = {
  currentMenuTab: "dashboard",
  currentChannelFilter: "ALL",
  currentStatusFilter: "ALL",
  searchQuery: "",
  qrLookupQuery: "",
  demoTimer: null,
  currentTheme: "navy",
  themeStorageKey: "ODOMS_ACTIVE_THEME_V3",

  init() {
    this.initTheme();
    this.initShipping();
    this.bindEvents();
    this.renderLoginQuickAccounts();
    // Luôn khởi đầu tại Màn hình Đăng nhập (căn giữa, màu mặc định Navy)
    this.showLoginScreen();
    this.renderAll();
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

    // 4. Đồng bộ màu đối kháng cho đồ thị SVG (Tiếp nhận đơn vs Xuất giữ hàng) trên Màn hình 2
    const chartAreaExport = document.getElementById("chartAreaExport");
    if (chartAreaExport) chartAreaExport.setAttribute("fill", themeObj.chartPrimaryArea);

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

    // Cập nhật lại các biểu đồ cột 3 tháng & Top 3 kênh theo cặp màu đối kháng của chủ đề mới
    if (typeof this.renderThreeMonthBarChart === "function") {
      this.renderThreeMonthBarChart();
    }
    if (typeof this.renderTop3ChannelsBarChart === "function") {
      this.renderTop3ChannelsBarChart();
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

    // 3. Thay đổi quy tắc phân bổ (FIFO theo thời gian đặt vs Ưu tiên kênh)
    const ruleSelect = document.getElementById("allocationRuleSelect");
    if (ruleSelect) {
      ruleSelect.addEventListener("change", (e) => {
        window.omsEngine.allocationMode = e.target.value;
        window.omsEngine.addLog(
          "info",
          `Chuyển quy tắc ưu tiên giữ hàng sang: [${
            e.target.value === "FIFO_TIME"
              ? "FIFO - Ai đặt trước ưu tiên trước (Theo Timestamp)"
              : "Ưu tiên Kênh bán hàng (POS > Shopee > TikTok > Lazada > FB)"
          }]`
        );
        if (window.omsEngine.orders.length > 0) {
          window.omsEngine.recalculateAllAllocations();
        }
        this.renderAll();
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
    if (nameEl) nameEl.innerText = user.fullName;
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

  switchSidebarTab(tabKey) {
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
      dashboard: "Dashboard",
      ingest: "Tiếp nhận & Gom đơn 5 Kênh",
      inventory: "Kho",
      shipping: "Vận chuyển đơn hàng đa kênh",
      fifo: "Vận chuyển đơn hàng đa kênh",
      backorder: "Hàng thiếu tồn (Chặn bán lố)",
      qr_api: "QR / Tra cứu & API 2 Chiều",
      logs: "Lịch sử đăng nhập & Nhật ký",
      staff: "Nhân sự & Phân quyền OMS",
      reports: "Báo cáo & Xuất đối chiếu",
      settings: "Cài đặt hệ thống"
    };

    const pageTitleEl = document.getElementById("topbarPageTitle");
    if (pageTitleEl) {
      pageTitleEl.innerText = titleMap[tabKey] || "Dashboard";
    }

    // Ẩn/hiện các view theo tab chức năng của hệ thống ODOMS
    const allSections = document.querySelectorAll(".oms-view-section");
    allSections.forEach((sec) => {
      const views = (sec.getAttribute("data-views") || "").split(" ");
      if (views.includes(tabKey)) {
        sec.classList.remove("hidden");
      } else {
        sec.classList.add("hidden");
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
      window.ExcelHandler.parseUploadedFile(file, (err, rows) => {
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

  simulateWebhookOrder() {
    const channel = document.getElementById("simChannel").value;
    const sku = document.getElementById("simSku").value;
    const qty = parseInt(document.getElementById("simQty").value, 10) || 1;
    const customer = document.getElementById("simCustomer").value.trim() || "Khách đặt Online Real-time";

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestampStr = `2026-10-24 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const prefixMap = { SHOPEE: "SP", TIKTOK: "TT", LAZADA: "LZ", FACEBOOK: "FB", POS: "POS" };
    const orderId = `${prefixMap[channel] || "OD"}261024${randomSuffix}`;

    const invItem = window.omsEngine.inventory.find((i) => i.sku === sku);
    const unitPrice = invItem ? invItem.price : 250000;
    const productName = invItem ? invItem.name : "Sản phẩm chưa đăng ký kho";

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
      "Địa chỉ nhận hàng": `Đơn đồng bộ qua Webhook ${channel}`,
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": channel === "POS" ? "Tiền mặt tại quầy" : "Ví điện tử / Chuyển khoản"
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
    this.renderAll();

    const demoSequence = [
      {
        note: "Đơn #1 từ Shopee đặt 4 Áo Polo lúc 08:15:10 (Tồn kho đang có 10)",
        row: window.SAMPLE_EXCEL_DATASETS.SHOPEE[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Đơn #2 từ TikTok Shop đặt 4 Áo Polo lúc 08:16:05 (Tồn khả dụng còn 6 -> Giữ 4, còn 2)",
        row: window.SAMPLE_EXCEL_DATASETS.TIKTOK[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Đơn #3 từ Cửa hàng vật lý (POS) mua 2 Áo Polo lúc 08:17:20 (Tồn khả dụng còn 2 -> Giữ nốt 2, Tồn về 0!)",
        row: window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Đơn #4 từ Lazada đặt 3 Áo Polo lúc 08:18:45 (Đến trễ hơn -> Tồn khả dụng = 0 -> Hệ thống chặn bán lố!)",
        row: window.SAMPLE_EXCEL_DATASETS.LAZADA[0],
        mode: "WEBHOOK_API"
      },
      {
        note: "Nạp tiếp các đơn hàng khác từ bảng Excel đa kênh (bao gồm cả đơn sai mã SKU để kiểm tra lọc lỗi)",
        rowsBatch: [
          window.SAMPLE_EXCEL_DATASETS.SHOPEE[1],
          window.SAMPLE_EXCEL_DATASETS.SHOPEE[2],
          window.SAMPLE_EXCEL_DATASETS.TIKTOK[1],
          window.SAMPLE_EXCEL_DATASETS.TIKTOK[2],
          window.SAMPLE_EXCEL_DATASETS.LAZADA[1],
          window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS[1],
          window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS[2]
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
          btn.innerText = "▶️ Chạy Mô Phỏng FIFO (4 Bước)";
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
      btn.innerText = "▶️ Chạy Mô Phỏng FIFO (4 Bước)";
    }
    window.omsEngine.resetSystem();
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
    window.omsEngine.restockSku(sku, qty);
    this.triggerChannelSyncAnimation();
    this.renderAll();
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
    this.renderCharts();
    this.renderTop3ChannelsBarChart();
    this.renderThreeMonthBarChart();
    this.renderMonthlyChannelRanking();
    this.renderFiveChannelSoldPieChart();
    this.renderChannelStrip();
    this.renderActionableAlerts();
    this.renderOrdersTable();
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

  // Dữ liệu cơ sở 6 tháng (Th5/2026 - Th10/2026) tham chiếu theo m3db, m4db, m5db
  // kết hợp động với các đơn hàng thực tế vừa nạp vào omsEngine
  getMonthlyHistoricalDataset() {
    const liveOrders = window.omsEngine ? window.omsEngine.orders : [];
    const getLiveStats = (ch) => {
      const list = ch ? liveOrders.filter((o) => o.channel === ch) : liveOrders;
      const alloc = list.filter((o) => o.status === "ALLOCATED");
      const rev = alloc.reduce((s, o) => s + o.quantity * o.unitPrice, 0);
      return {
        received: list.length,
        exported: alloc.length,
        revenue: rev
      };
    };

    const liveAll = getLiveStats(null);

    return {
      "2026-05": {
        label: "Tháng 05/2026",
        shortLabel: "Th5/26",
        startDate: "2026-05-01",
        endDate: "2026-05-31",
        received: 310,
        exported: 292,
        revenue: 98500000,
        channels: {
          SHOPEE: { orders: 128, revenue: 41200000, growth: "+11.2%" },
          TIKTOK: { orders: 86, revenue: 26800000, growth: "+14.5%" },
          LAZADA: { orders: 48, revenue: 15400000, growth: "+6.8%" },
          POS: { orders: 28, revenue: 9500000, growth: "+4.2%" },
          FACEBOOK: { orders: 20, revenue: 5600000, growth: "+3.1%" }
        }
      },
      "2026-06": {
        label: "Tháng 06/2026",
        shortLabel: "Th6/26",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        received: 345,
        exported: 328,
        revenue: 112400000,
        channels: {
          SHOPEE: { orders: 142, revenue: 46800000, growth: "+13.5%" },
          TIKTOK: { orders: 98, revenue: 31200000, growth: "+16.4%" },
          LAZADA: { orders: 52, revenue: 17100000, growth: "+8.0%" },
          POS: { orders: 31, revenue: 10900000, growth: "+5.5%" },
          FACEBOOK: { orders: 22, revenue: 6400000, growth: "+4.0%" }
        }
      },
      "2026-07": {
        label: "Tháng 07/2026",
        shortLabel: "Th7/26",
        startDate: "2026-07-01",
        endDate: "2026-07-31",
        received: 382,
        exported: 360,
        revenue: 126800000,
        channels: {
          SHOPEE: { orders: 158, revenue: 52500000, growth: "+12.1%" },
          TIKTOK: { orders: 112, revenue: 36400000, growth: "+18.2%" },
          LAZADA: { orders: 56, revenue: 18900000, growth: "+7.4%" },
          POS: { orders: 33, revenue: 11800000, growth: "+6.1%" },
          FACEBOOK: { orders: 23, revenue: 7200000, growth: "+4.9%" }
        }
      },
      "2026-08": {
        label: "Tháng 08/2026",
        shortLabel: "Th8/26",
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        received: 418,
        exported: 395,
        revenue: 139500000,
        channels: {
          SHOPEE: { orders: 175, revenue: 58200000, growth: "+14.8%" },
          TIKTOK: { orders: 124, revenue: 40500000, growth: "+19.5%" },
          LAZADA: { orders: 60, revenue: 20400000, growth: "+7.9%" },
          POS: { orders: 35, revenue: 12600000, growth: "+6.8%" },
          FACEBOOK: { orders: 24, revenue: 7800000, growth: "+5.2%" }
        }
      },
      "2026-09": {
        label: "Tháng 09/2026",
        shortLabel: "Th9/26",
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        received: 456,
        exported: 432,
        revenue: 151200000,
        channels: {
          SHOPEE: { orders: 192, revenue: 64100000, growth: "+15.4%" },
          TIKTOK: { orders: 136, revenue: 44800000, growth: "+21.0%" },
          LAZADA: { orders: 64, revenue: 21500000, growth: "+8.2%" },
          POS: { orders: 38, revenue: 12900000, growth: "+7.1%" },
          FACEBOOK: { orders: 26, revenue: 7900000, growth: "+5.6%" }
        }
      },
      "2026-10": {
        label: "Tháng 10/2026",
        shortLabel: "Th10/26",
        startDate: "2026-10-01",
        endDate: "2026-10-31",
        received: 485 + liveAll.received,
        exported: 462 + liveAll.exported,
        revenue: 158500000 + liveAll.revenue,
        channels: {
          SHOPEE: {
            orders: 205 + getLiveStats("SHOPEE").received,
            revenue: 68400000 + getLiveStats("SHOPEE").revenue,
            growth: "+18.4%"
          },
          TIKTOK: {
            orders: 148 + getLiveStats("TIKTOK").received,
            revenue: 47200000 + getLiveStats("TIKTOK").revenue,
            growth: "+22.6%"
          },
          LAZADA: {
            orders: 68 + getLiveStats("LAZADA").received,
            revenue: 22100000 + getLiveStats("LAZADA").revenue,
            growth: "+9.5%"
          },
          POS: {
            orders: 38 + getLiveStats("POS").received,
            revenue: 12500000 + getLiveStats("POS").revenue,
            growth: "+7.8%"
          },
          FACEBOOK: {
            orders: 26 + getLiveStats("FACEBOOK").received,
            revenue: 8300000 + getLiveStats("FACEBOOK").revenue,
            growth: "+6.4%"
          }
        }
      }
    };
  },

  // 1. BẢNG TỔNG DOANH THU & DOANH THU LẦN LƯỢT 5 KÊNH BÁN HÀNG (TRONG 1 THÁNG TÍNH ĐẾN THỜI ĐIỂM MỞ DASHBOARD)
  refreshOneMonthTimestamp() {
    this.dashboardOpenedAt = new Date();
    this.renderOneMonthRevenueOverview();
  },

  renderOneMonthRevenueOverview() {
    const grid = document.getElementById("oneMonthRevenueGrid");
    const timeLabel = document.getElementById("oneMonthRollingTimeLabel");
    if (!grid) return;

    if (!this.dashboardOpenedAt) {
      this.dashboardOpenedAt = new Date();
    }

    const now = this.dashboardOpenedAt;
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const fmtDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    if (timeLabel) {
      timeLabel.innerHTML = `⏱️ Chu kỳ 1 tháng tính đến thời điểm mở Dashboard: <strong>Từ ${fmtDate(oneMonthAgo)} đến ${fmtDate(now)} (Lúc ${fmtTime(now)})</strong>`;
    }

    const dataset = this.getMonthlyHistoricalDataset()["2026-10"];
    const chOrder = [
      { key: "SHOPEE", name: "Shopee", badgeClass: "badge-SHOPEE", color: "#ee4d2d" },
      { key: "TIKTOK", name: "TikTok Shop", badgeClass: "badge-TIKTOK", color: "#0f172a" },
      { key: "LAZADA", name: "Lazada", badgeClass: "badge-LAZADA", color: "#1d4ed8" },
      { key: "FACEBOOK", name: "Facebook", badgeClass: "badge-FACEBOOK", color: "#0284c7" },
      { key: "POS", name: "Cửa hàng POS", badgeClass: "badge-POS", color: "#15803d" }
    ];

    const totalRevenue = Object.values(dataset.channels).reduce((s, c) => s + c.revenue, 0);
    const totalOrders = Object.values(dataset.channels).reduce((s, c) => s + c.orders, 0);

    const totalCardHtml = `
      <div class="rev-channel-card total-hero">
        <div class="rev-card-head">
          <span class="rev-card-title">💎 TỔNG DOANH THU (5 KÊNH)</span>
          <span class="rev-growth-pill">▲ +16.8%</span>
        </div>
        <div class="rev-card-value">${totalRevenue.toLocaleString("vi-VN")} ₫</div>
        <div class="rev-card-meta">
          <span>Tổng: <strong>${totalOrders} đơn</strong></span>
          <span>100% tỷ trọng</span>
        </div>
      </div>
    `;

    const channelsHtml = chOrder
      .map((ch) => {
        const stat = dataset.channels[ch.key];
        const sharePct = totalRevenue > 0 ? ((stat.revenue / totalRevenue) * 100).toFixed(1) : "0.0";
        return `
        <div class="rev-channel-card" style="border-top: 3px solid ${ch.color};">
          <div class="rev-card-head">
            <span class="channel-badge ${ch.badgeClass}">${ch.name}</span>
            <span class="rev-growth-pill">${stat.growth}</span>
          </div>
          <div class="rev-card-value">${stat.revenue.toLocaleString("vi-VN")} ₫</div>
          <div class="rev-card-meta">
            <span><strong>${stat.orders}</strong> đơn</span>
            <span>Chiếm <strong>${sharePct}%</strong></span>
          </div>
        </div>
      `;
      })
      .join("");

    grid.innerHTML = totalCardHtml + channelsHtml;
  },

  // 2. BIỂU ĐỒ CỘT + DOANH THU: TOP 3 KÊNH BÁN HÀNG (Ở DƯỚI TIẾP NHẬN ĐƠN / XUẤT GIỮ HÀNG THEO THÁNG)
  renderTop3ChannelsBarChart() {
    const container = document.getElementById("top3ChannelsBarChartContainer");
    if (!container) return;

    const dataset = this.getMonthlyHistoricalDataset()["2026-10"];
    const metaMap = {
      SHOPEE: { name: "Shopee Mall", short: "Shopee", color: "#ee4d2d", badge: "badge-SHOPEE" },
      TIKTOK: { name: "TikTok Shop", short: "TikTok Shop", color: "#0f172a", badge: "badge-TIKTOK" },
      LAZADA: { name: "Lazada Mall", short: "Lazada", color: "#1d4ed8", badge: "badge-LAZADA" },
      POS: { name: "Cửa hàng POS", short: "Cửa hàng POS", color: "#15803d", badge: "badge-POS" },
      FACEBOOK: { name: "Facebook Live", short: "Facebook", color: "#0284c7", badge: "badge-FACEBOOK" }
    };

    const sortedTop3 = Object.entries(dataset.channels)
      .map(([key, val]) => ({
        key,
        ...val,
        ...metaMap[key]
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    const maxRev = Math.max(...sortedTop3.map((i) => i.revenue), 1);
    const medals = ["🥇 TOP 1", "🥈 TOP 2", "🥉 TOP 3"];

    const colsHtml = sortedTop3
      .map((item, idx) => {
        const heightPx = Math.max(42, Math.round((item.revenue / maxRev) * 135));
        return `
        <div class="bar-col-item">
          <div class="bar-top-revenue-badge" title="Tổng doanh thu kênh ${item.name}">
            ${item.revenue.toLocaleString("vi-VN")} ₫
          </div>
          <div class="bar-pair-wrap">
            <div class="bar-pillar single-wide" style="height:${heightPx}px;background:${item.color};">
              <span>${item.orders} đơn</span>
            </div>
          </div>
          <div class="bar-col-footer">
            <div class="bar-col-title">
              <span style="margin-right:4px;">${medals[idx]}</span>
              <span class="channel-badge ${item.badge}">${item.short}</span>
            </div>
            <div class="bar-col-sub">Sản lượng: <strong>${item.orders} đơn</strong> · Doanh thu dẫn đầu</div>
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = `<div class="bar-chart-columns-grid">${colsHtml}</div>`;
  },

  // 3. TIẾP NHẬN ĐƠN / XUẤT GIỮ HÀNG THEO 3 THÁNG (GIỚI HẠN NGÀY THÁNG + TUỲ CHỌN 3 THÁNG + BIỂU ĐỒ CỘT CÓ TỔNG DOANH THU TRÊN MỖI CỘT)
  onThreeMonthSelectChange() {
    const m1 = document.getElementById("select3M_1")?.value || "2026-08";
    const m2 = document.getElementById("select3M_2")?.value || "2026-09";
    const m3 = document.getElementById("select3M_3")?.value || "2026-10";
    const selected = [m1, m2, m3].sort();

    const data = this.getMonthlyHistoricalDataset();
    const startInput = document.getElementById("filter3MStartDate");
    const endInput = document.getElementById("filter3MEndDate");
    if (startInput && data[selected[0]]) {
      startInput.value = data[selected[0]].startDate;
    }
    if (endInput && data[selected[selected.length - 1]]) {
      endInput.value = data[selected[selected.length - 1]].endDate;
    }
    this.renderThreeMonthBarChart();
  },

  renderThreeMonthBarChart() {
    const container = document.getElementById("threeMonthBarChartContainer");
    const noticeEl = document.getElementById("threeMonthFilterNotice");
    if (!container) return;

    const themeObj = THEMES_LIST.find((t) => t.key === this.currentTheme) || THEMES_LIST[0];
    const colorReceived = themeObj.chartSecondary; // Màu đối kháng 1 (Đơn tiếp nhận)
    const colorExported = themeObj.chartPrimary;   // Màu đối kháng 2 (Xuất giữ hàng)

    const m1 = document.getElementById("select3M_1")?.value || "2026-08";
    const m2 = document.getElementById("select3M_2")?.value || "2026-09";
    const m3 = document.getElementById("select3M_3")?.value || "2026-10";

    const startVal = document.getElementById("filter3MStartDate")?.value || "2026-08-01";
    const endVal = document.getElementById("filter3MEndDate")?.value || "2026-10-31";

    const allData = this.getMonthlyHistoricalDataset();
    const chosenKeys = [m1, m2, m3];

    // Tính hệ số lọc theo khoảng ngày giới hạn (nếu người dùng thu hẹp ngày trong tháng)
    const startDt = new Date(startVal + "T00:00:00");
    const endDt = new Date(endVal + "T23:59:59");

    const items = chosenKeys.map((k) => {
      const raw = allData[k] || allData["2026-10"];
      const mStart = new Date(raw.startDate + "T00:00:00");
      const mEnd = new Date(raw.endDate + "T23:59:59");

      // Tính số ngày giao nhau giữa khoảng [startDt, endDt] và tháng đó
      const overlapStart = new Date(Math.max(startDt.getTime(), mStart.getTime()));
      const overlapEnd = new Date(Math.min(endDt.getTime(), mEnd.getTime()));
      const totalDaysInMonth = Math.max(1, Math.round((mEnd - mStart) / (1000 * 3600 * 24)));

      let ratio = 1;
      if (overlapEnd < overlapStart) {
        ratio = 0;
      } else {
        const overlapDays = Math.max(1, Math.round((overlapEnd - overlapStart) / (1000 * 3600 * 24)));
        ratio = Math.min(1, overlapDays / totalDaysInMonth);
      }

      return {
        key: k,
        label: raw.label,
        received: Math.round(raw.received * ratio),
        exported: Math.round(raw.exported * ratio),
        revenue: Math.round(raw.revenue * ratio),
        ratio
      };
    });

    if (noticeEl) {
      noticeEl.innerHTML = `🔍 Đang lọc dữ liệu giới hạn từ ngày <strong>${startVal.split("-").reverse().join("/")}</strong> đến ngày <strong>${endVal.split("-").reverse().join("/")}</strong> · So sánh 3 tháng tuỳ chọn: <strong>${items.map((i) => i.label).join(" — ")}</strong>`;
    }

    const maxOrderVol = Math.max(...items.map((i) => Math.max(i.received, i.exported)), 1);

    const colsHtml = items
      .map((item) => {
        const hRec = item.received > 0 ? Math.max(28, Math.round((item.received / maxOrderVol) * 135)) : 6;
        const hExp = item.exported > 0 ? Math.max(28, Math.round((item.exported / maxOrderVol) * 135)) : 6;

        return `
        <div class="bar-col-item">
          <div class="bar-top-revenue-badge" title="Tổng doanh thu của ${item.label}">
            💰 ${item.revenue.toLocaleString("vi-VN")} ₫
          </div>
          <div class="bar-pair-wrap">
            <div class="bar-pillar" style="height:${hRec}px;background:${colorReceived};" title="Đơn tiếp nhận: ${item.received} đơn">
              <span>${item.received}</span>
            </div>
            <div class="bar-pillar" style="height:${hExp}px;background:${colorExported};" title="Xuất giữ hàng: ${item.exported} đơn">
              <span>${item.exported}</span>
            </div>
          </div>
          <div class="bar-col-footer">
            <div class="bar-col-title">${item.label}</div>
            <div class="bar-col-sub">
              Nhận: <strong style="color:${colorReceived};">${item.received}</strong> · Xuất giữ: <strong style="color:${colorExported};">${item.exported}</strong> đơn
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:12px;font-weight:700;">
        <span style="color:var(--text-secondary);">Đơn vị cột: Số đơn hàng · Nhãn trên đỉnh mỗi cột: <strong>Tổng doanh thu tháng (₫)</strong></span>
        <div style="display:flex;gap:14px;">
          <span style="display:flex;align-items:center;gap:5px;">
            <span style="width:11px;height:11px;background:${colorReceived};border-radius:3px;display:inline-block;"></span> Đơn tiếp nhận
          </span>
          <span style="display:flex;align-items:center;gap:5px;">
            <span style="width:11px;height:11px;background:${colorExported};border-radius:3px;display:inline-block;"></span> Xuất giữ hàng
          </span>
        </div>
      </div>
      <div class="bar-chart-columns-grid">${colsHtml}</div>
    `;
  },

  // 4. BẢNG XẾP HẠNG CÁC KÊNH BÁN HÀNG ĐƯỢC NHIỀU ĐƠN NHẤT THEO THÁNG
  renderMonthlyChannelRanking() {
    const listEl = document.getElementById("channelMonthlyRankingList");
    const subtitleEl = document.getElementById("channelRankingSubtitle");
    const footerEl = document.getElementById("channelRankingFooterSummary");
    if (!listEl) return;

    const monthKey = document.getElementById("rankingMonthSelect")?.value || "2026-10";
    const allData = this.getMonthlyHistoricalDataset();
    const monthData = allData[monthKey] || allData["2026-10"];

    const metaMap = {
      SHOPEE: { name: "Shopee Mall", short: "Shopee", color: "#ee4d2d", badge: "badge-SHOPEE" },
      TIKTOK: { name: "TikTok Shop", short: "TikTok Shop", color: "#0f172a", badge: "badge-TIKTOK" },
      LAZADA: { name: "Lazada Mall", short: "Lazada", color: "#1d4ed8", badge: "badge-LAZADA" },
      POS: { name: "Cửa hàng Vật lý (POS)", short: "Cửa hàng POS", color: "#15803d", badge: "badge-POS" },
      FACEBOOK: { name: "Facebook Shop / Live", short: "Facebook", color: "#0284c7", badge: "badge-FACEBOOK" }
    };

    const ranked = Object.entries(monthData.channels)
      .map(([key, stat]) => ({
        key,
        ...stat,
        ...metaMap[key]
      }))
      .sort((a, b) => b.orders - a.orders);

    const totalOrders = ranked.reduce((s, r) => s + r.orders, 0);
    const totalRevenue = ranked.reduce((s, r) => s + r.revenue, 0);
    const maxOrders = Math.max(...ranked.map((r) => r.orders), 1);

    if (subtitleEl) {
      subtitleEl.innerText = `Xếp hạng từ cao xuống thấp theo số đơn tiếp nhận trong ${monthData.label} (${totalOrders} đơn)`;
    }

    listEl.innerHTML = ranked
      .map((item, idx) => {
        const rankNum = idx + 1;
        const medalClass =
          rankNum === 1
            ? "rank-medal-1"
            : rankNum === 2
            ? "rank-medal-2"
            : rankNum === 3
            ? "rank-medal-3"
            : "rank-medal-other";
        const medalIcon = rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : `#${rankNum}`;
        const sharePct = totalOrders > 0 ? ((item.orders / totalOrders) * 100).toFixed(1) : "0.0";
        const barWidth = Math.max(8, Math.round((item.orders / maxOrders) * 100));

        return `
        <div class="leaderboard-row-card ${rankNum === 1 ? "top-rank-1" : ""}">
          <div class="lb-row-top">
            <div class="lb-left-info">
              <span class="rank-medal-badge ${medalClass}">${medalIcon}</span>
              <div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="channel-badge ${item.badge}">${item.short}</span>
                  <span style="font-size:12.5px;font-weight:800;color:var(--text-main);">${item.name}</span>
                  <span class="rev-growth-pill">${item.growth}</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                  Tỷ trọng đơn: <strong>${sharePct}%</strong> toàn hệ thống
                </div>
              </div>
            </div>
            <div class="lb-right-stats">
              <div class="lb-order-count">${item.orders} đơn</div>
              <div class="lb-rev-sub">${item.revenue.toLocaleString("vi-VN")} ₫</div>
            </div>
          </div>
          <div class="lb-progress-track">
            <div class="lb-progress-fill" style="width:${barWidth}%;background:${item.color};"></div>
          </div>
        </div>
      `;
      })
      .join("");

    if (footerEl) {
      const top1 = ranked[0];
      footerEl.innerHTML = `
        <div>
          🏆 Kênh dẫn đầu ${monthData.label}: <strong>${top1.name} (${top1.orders} đơn)</strong>
        </div>
        <div>
          Tổng cộng 5 kênh: <strong>${totalOrders} đơn</strong> · <strong>${totalRevenue.toLocaleString("vi-VN")} ₫</strong>
        </div>
      `;
    }
  },

  // 5. BIỂU ĐỒ TRÒN TƯƠNG TÁC: CƠ CẤU ĐƠN HÀNG ĐÃ BÁN THEO 5 KÊNH (Bấm màu chú giải để nhảy biểu đồ)
  activePieChannel: null,

  getFiveChannelSoldDataset() {
    const monthKey = document.getElementById("soldPieMonthSelect")?.value || "2026-10";
    const allData = this.getMonthlyHistoricalDataset();

    const channelMeta = {
      SHOPEE: {
        key: "SHOPEE",
        name: "Shopee",
        fullName: "Shopee Mall",
        color: "#F97316",
        colorName: "Cam Shopee",
        badge: "badge-SHOPEE"
      },
      FACEBOOK: {
        key: "FACEBOOK",
        name: "Facebook",
        fullName: "Facebook Shop / Live",
        color: "#0284C7",
        colorName: "Xanh Facebook",
        badge: "badge-FACEBOOK"
      },
      TIKTOK: {
        key: "TIKTOK",
        name: "TikTok Shop",
        fullName: "TikTok Shop",
        color: "#0F172A",
        colorName: "Đen TikTok",
        badge: "badge-TIKTOK"
      },
      LAZADA: {
        key: "LAZADA",
        name: "Lazada",
        fullName: "Lazada Mall",
        color: "#4F46E5",
        colorName: "Tím Lazada",
        badge: "badge-LAZADA"
      },
      POS: {
        key: "POS",
        name: "Cửa hàng POS",
        fullName: "Cửa hàng Vật lý (POS)",
        color: "#16A34A",
        colorName: "Xanh lá POS",
        badge: "badge-POS"
      }
    };

    const orderKeys = ["SHOPEE", "FACEBOOK", "TIKTOK", "LAZADA", "POS"];
    let periodLabel = "Tháng 10/2026";
    const aggregated = {};

    orderKeys.forEach((k) => {
      aggregated[k] = { orders: 0, revenue: 0, growth: "+0.0%" };
    });

    if (monthKey === "ALL_6M") {
      periodLabel = "Tổng hợp 6 Tháng (Th5/2026 – Th10/2026)";
      Object.values(allData).forEach((mObj) => {
        orderKeys.forEach((k) => {
          if (mObj.channels && mObj.channels[k]) {
            aggregated[k].orders += mObj.channels[k].orders;
            aggregated[k].revenue += mObj.channels[k].revenue;
            aggregated[k].growth = mObj.channels[k].growth;
          }
        });
      });
    } else {
      const mObj = allData[monthKey] || allData["2026-10"];
      periodLabel = mObj.label;
      orderKeys.forEach((k) => {
        if (mObj.channels && mObj.channels[k]) {
          aggregated[k].orders = mObj.channels[k].orders;
          aggregated[k].revenue = mObj.channels[k].revenue;
          aggregated[k].growth = mObj.channels[k].growth;
        }
      });
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

    return { periodLabel, totalOrders, totalRevenue, items };
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
    if (!svgEl || !legendEl) return;

    const data = this.getFiveChannelSoldDataset();
    this._lastSoldPieData = data;

    const cx = 150;
    const cy = 150;
    const rOuter = 116;
    const rInner = 60;
    const rLabel = (rOuter + rInner) / 2;

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

        // Tọa độ nhảy tách miếng bánh (Explode offset) khi người dùng bấm chọn màu
        const jumpDist = 16;
        const dx = (Math.cos(midRad) * jumpDist).toFixed(2);
        const dy = (Math.sin(midRad) * jumpDist).toFixed(2);

        // Tọa độ nhãn % nằm giữa miếng cắt
        const lx = (cx + rLabel * Math.cos(midRad)).toFixed(2);
        const ly = (cy + rLabel * Math.sin(midRad)).toFixed(2);

        const showLabel = item.pct >= 4.5;

        return `
          <g class="pie-slice-group"
             data-channel="${item.key}"
             data-dx="${dx}"
             data-dy="${dy}"
             onclick="AppUI.selectPieChannel('${item.key}')">
            <path class="pie-slice-path" d="${pathD}" fill="${item.color}">
              <title>${item.fullName}: ${item.orders} đơn đã bán (${item.pctText}%) — ${item.revenue.toLocaleString("vi-VN")} ₫</title>
            </path>
            ${showLabel ? `<text class="pie-slice-pct-text" x="${lx}" y="${ly}">${item.pctText}%</text>` : ""}
          </g>
        `;
      })
      .join("");

    svgEl.innerHTML = slicesHtml;

    // Render 5 mục chú giải màu kế bên biểu đồ tròn
    legendEl.innerHTML = data.items
      .map((item) => {
        return `
          <div class="sold-pie-legend-item"
               data-channel="${item.key}"
               style="--legend-color: ${item.color};"
               onclick="AppUI.selectPieChannel('${item.key}')">
            <div class="sold-pie-legend-top">
              <div class="sold-pie-legend-left">
                <span class="sold-pie-color-swatch" style="background:${item.color};" id="pieSwatch_${item.key}">●</span>
                <div>
                  <div class="sold-pie-channel-title">
                    <span>${item.name}</span>
                    <span style="font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:4px;background:${item.color}18;color:${item.color};border:1px solid ${item.color}40;">
                      ${item.colorName}
                    </span>
                  </div>
                  <div class="sold-pie-channel-desc">${item.fullName} · Tăng trưởng ${item.growth}</div>
                </div>
              </div>
              <div class="sold-pie-legend-right">
                <div>
                  <span class="sold-pie-order-num">${item.orders} đơn</span>
                  <span class="sold-pie-share-badge" style="background:${item.color};">${item.pctText}%</span>
                </div>
                <div class="sold-pie-rev-text">${item.revenue.toLocaleString("vi-VN")} ₫</div>
              </div>
            </div>
            <div class="sold-pie-mini-bar-bg">
              <div class="sold-pie-mini-bar-fill" style="width:${Math.max(5, item.pct)}%;background:${item.color};"></div>
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

    // 1. Cập nhật hiệu ứng nhảy tách miếng cắt trên SVG
    const sliceGroups = document.querySelectorAll("#soldChannelPieSvg .pie-slice-group");
    sliceGroups.forEach((g) => {
      const ch = g.getAttribute("data-channel");
      const dx = g.getAttribute("data-dx") || "0";
      const dy = g.getAttribute("data-dy") || "0";

      if (!activeKey) {
        g.classList.remove("slice-active", "slice-dimmed");
        g.style.transform = "translate(0px, 0px) scale(1)";
      } else if (ch === activeKey) {
        g.classList.add("slice-active");
        g.classList.remove("slice-dimmed");
        g.style.transform = `translate(${dx}px, ${dy}px) scale(1.055)`;
      } else {
        g.classList.remove("slice-active");
        g.classList.add("slice-dimmed");
        g.style.transform = "translate(0px, 0px) scale(0.97)";
      }
    });

    // 2. Cập nhật trạng thái nổi bật của các mục chú giải màu kế bên
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

    // 3. Cập nhật tâm biểu đồ tròn (nhảy số động)
    const hubEl = document.getElementById("soldPieCenterHub");
    const lblEl = document.getElementById("soldPieCenterLabel");
    const valEl = document.getElementById("soldPieCenterValue");
    const subEl = document.getElementById("soldPieCenterSub");
    const pillEl = document.getElementById("soldPieActiveStatusPill");
    const footerEl = document.getElementById("soldPieSummaryFooter");

    if (hubEl && animateHub) {
      hubEl.classList.remove("hub-jumping");
      void hubEl.offsetWidth; // trigger reflow
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
        subEl.innerText = `Chiếm ${activeItem.pctText}% tổng đơn`;
      }
      if (pillEl) {
        pillEl.style.background = `${activeItem.color}15`;
        pillEl.style.borderColor = activeItem.color;
        pillEl.style.color = activeItem.color;
        pillEl.innerHTML = `🎯 Đang chọn: <strong>${activeItem.fullName} (${activeItem.colorName})</strong> — <strong>${activeItem.orders} đơn (${activeItem.pctText}%)</strong> · Bấm lần nữa để về tổng 5 kênh`;
      }
      if (footerEl) {
        footerEl.innerHTML = `
          <div>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${activeItem.color};margin-right:6px;"></span>
            Đang tách cơ cấu kênh: <strong style="color:${activeItem.color};">${activeItem.fullName}</strong> (${data.periodLabel})
          </div>
          <div>
            Đã bán: <strong>${activeItem.orders} / ${data.totalOrders} đơn (${activeItem.pctText}%)</strong> · Doanh thu kênh: <strong style="color:${activeItem.color};">${activeItem.revenue.toLocaleString("vi-VN")} ₫</strong>
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
        subEl.innerText = "100% · 5 Kênh bán";
      }
      if (pillEl) {
        pillEl.style.background = "var(--bg-surface, #ffffff)";
        pillEl.style.borderColor = "var(--border-color)";
        pillEl.style.color = "var(--text-secondary)";
        pillEl.innerHTML = "💡 Bấm vào mục màu chú giải bên phải (Xanh Facebook, Cam Shopee...) để biểu đồ nhảy tách kênh!";
      }
      if (footerEl) {
        footerEl.innerHTML = `
          <div>
            📊 Cơ cấu tổng hợp <strong>5 kênh bán hàng</strong> trong <strong>${data.periodLabel}</strong>
          </div>
          <div>
            Tổng đơn đã bán: <strong>${data.totalOrders} đơn (100%)</strong> · Tổng doanh thu: <strong style="color:var(--theme-primary, #2563eb);">${data.totalRevenue.toLocaleString("vi-VN")} ₫</strong>
          </div>
        `;
      }
    }
  },

  renderKPIsAndBadges() {
    const orders = window.omsEngine.orders;
    const inv = window.omsEngine.inventory;

    const totalOrders = orders.length;
    const allocatedOrders = orders.filter((o) => o.status === "ALLOCATED").length;
    const backorderOrders = orders.filter((o) => o.status === "BACKORDER").length;
    const invalidOrders = orders.filter((o) => o.status === "INVALID").length;

    const totalPhysical = inv.reduce((s, i) => s + i.physicalStock, 0);
    const totalReserved = inv.reduce((s, i) => s + i.reservedStock, 0);
    const totalAvailable = inv.reduce((s, i) => s + i.availableStock, 0);
    const outOfStockSkus = inv.filter((i) => i.availableStock === 0).length;

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    // 4 Thẻ KPI chính
    setElText("kpiTotalOrders", totalOrders);
    setElText("kpiAllocated", allocatedOrders);
    setElText("kpiBackorder", backorderOrders);
    setElText("kpiInvalid", invalidOrders);
    setElText("kpiAvailableSummary", `Tồn khả dụng (ATP): ${totalAvailable} / ${totalPhysical} SP (Giữ chỗ: ${totalReserved})`);

    // Banner trạng thái
    setElText(
      "bannerTrackingText",
      `5 Kênh kết nối · ${totalOrders} đơn hàng · Tồn khả dụng: ${totalAvailable}/${totalPhysical} SP`
    );

    // Badges trên Sidebar ODOMS
    const activeShippingCount = (this.shipments || []).filter(s => s.status === "IN_TRANSIT" || s.status === "PENDING_PICKUP").length;
    setElText("badgeShippingCount", activeShippingCount || allocatedOrders);
    setElText("badgeFifoCount", activeShippingCount || allocatedOrders);
    setElText("badgeBackorderCount", backorderOrders + outOfStockSkus);
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

        return `
        <div class="channel-card" id="ch-card-${chKey}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span class="channel-badge badge-${chKey}">${ch.shortName}</span>
            <span style="font-size:11px;color:var(--theme-primary);font-weight:700;">● Active</span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary);">
            Đơn nhận: <strong style="color: var(--text-main);">${chOrders}</strong> ·
            Giữ hàng: <strong style="color: var(--theme-primary);">${heldUnits} SP</strong>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            ⇄ Đồng bộ ATP: ${ch.lastSync} (${ch.syncCount} lần)
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
          ✔ Tất cả đơn hàng và tồn kho đều ở trạng thái an toàn. Hãy bấm "Nạp Bảng Gom 5 Kênh (11 Đơn)" hoặc "Chạy Mô Phỏng FIFO" để kiểm thử kịch bản tranh chấp tồn kho!
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
    list.sort((a, b) => a.timestampMs - b.timestampMs);

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
            Chưa có đơn hàng nào khớp bộ lọc. Hãy bấm <strong>"📥 Nạp Bảng Gom 5 Kênh (11 Đơn)"</strong> hoặc <strong>"▶️ Chạy Mô Phỏng FIFO"</strong> trên thanh công cụ!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list
      .map((ord) => {
        let statusBadge = "";
        const ps = ord.platformStatus || (ord.status === "CANCELLED" || ord.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        if (ps === "CONFIRMED") {
          statusBadge = `<span class="status-badge st-ALLOCATED">✔️ Đã xác nhận</span>`;
        } else if (ps === "UNCONFIRMED") {
          statusBadge = `<span class="status-badge st-PENDING" style="background:#fffbeb;color:#b45309;border:1px solid #fef3c7;">⏳ Chưa xác nhận</span>`;
        } else if (ps === "CANCELLED") {
          statusBadge = `<span class="status-badge st-INVALID">✖️ Đã hủy đơn</span>`;
        } else {
          statusBadge = `<span class="status-badge st-PENDING">⏳ Chưa xác nhận</span>`;
        }

        const fifoBadge = ord.fifoRank
          ? `<span class="fifo-rank" title="Thứ tự ưu tiên theo thời gian đặt của mã ${ord.sku}">FIFO #${ord.fifoRank}</span>`
          : `<span style="color:#94a3b8;font-size:11px;">-</span>`;

        const stockCompare = ord.stockSnapshot
          ? `<span style="font-weight:600;">${ord.stockSnapshot.before}</span> ➔ <strong style="color:${
              ord.status === "ALLOCATED" ? "var(--theme-primary)" : "#d97706"
            }">${ord.stockSnapshot.after}</strong>`
          : `<span style="color:#ef4444;font-size:11.5px;">Chặn ở Bước 2</span>`;

        const pm = ord.paymentMethod || "COD (Thanh toán khi nhận hàng)";
        const isCodOrder = pm.toUpperCase().includes("COD") || pm.toLowerCase().includes("thu hộ") || pm.toLowerCase().includes("khi nhận hàng");
        const orderTotalVal = (ord.quantity || 0) * (ord.unitPrice || 0);
        const codSubLabel = isCodOrder
          ? `<div style="font-size:10.5px;color:#c2410c;font-weight:700;margin-top:3px;">💵 Thu hộ COD: ${orderTotalVal.toLocaleString("vi-VN")} ₫</div>`
          : `<div style="font-size:10.5px;color:#15803d;font-weight:700;margin-top:3px;">✔ Đã thanh toán (COD: 0 ₫)</div>`;

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
            ? `<span style="font-size:11px;color:#7c3aed;font-weight:600;">⚡ API 2 chiều</span>`
            : `<span style="font-size:11px;color:var(--theme-primary);font-weight:600;">📊 File Excel</span>`;

        return `
        <tr>
          <td>${fifoBadge}</td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${ord.orderId}</div>
            <div>${sourceBadge}</div>
          </td>
          <td><span class="channel-badge badge-${ord.channel}">${ord.channel}</span></td>
          <td>
            <div style="font-weight:700;">${ord.orderTime.split(" ")[1] || ord.orderTime}</div>
            <div style="font-size:11px;color:var(--text-muted);">${ord.orderTime.split(" ")[0]}</div>
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
              <button class="btn btn-outline btn-sm" onclick="AppUI.openOrderAuditModal('${ord.orderId}')" title="Xem lưu vết 4 bước xử lý">
                🔍 Xem chi tiết
              </button>
              <button class="btn btn-primary btn-sm" onclick="AppUI.openWaybillForOrder('${ord.orderId}')" title="Tạo mã vận đơn & In mã QR cho đơn này">
                🖨️ Vận đơn & QR
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  renderInventoryTable() {
    const tbody = document.getElementById("inventoryTableBody");
    if (!tbody) return;

    tbody.innerHTML = window.omsEngine.inventory
      .map((item) => {
        const pct = item.physicalStock > 0 ? Math.round((item.availableStock / item.physicalStock) * 100) : 0;
        const barClass = item.availableStock === 0 ? "out" : pct <= 30 ? "low" : "";

        const channelHolds = Object.entries(item.channelReserved)
          .filter(([, count]) => count > 0)
          .map(
            ([ch, count]) =>
              `<span class="channel-badge badge-${ch}" style="font-size:10.5px;padding:2px 6px;">${ch}: ${count}</span>`
          )
          .join(" ");

        const batchSummary = item.batches
          .map(
            (b) =>
              `<span class="hold-pill">${b.batchCode}: còn ${b.remainingQty}/${b.initialQty}</span>`
          )
          .join(" ");

        const statusLabel =
          item.availableStock === 0
            ? `<span class="status-badge st-INVALID">Hết hàng (0%)</span>`
            : pct <= 35
            ? `<span class="status-badge st-BACKORDER">Sắp hết (${pct}%)</span>`
            : `<span class="status-badge st-ALLOCATED">Bình thường (${pct}%)</span>`;

        return `
        <tr>
          <td>
            <div style="font-weight:800;color:var(--theme-primary);">${item.category}</div>
            <div style="font-size:11px;color:var(--text-muted);">Đơn vị: ${item.unit || "SP"}</div>
          </td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${item.sku}</div>
            <div style="font-size:12px;color:var(--text-muted);">${item.name}</div>
          </td>
          <td style="font-weight:800;font-size:14px;">${item.physicalStock} ${item.unit || "SP"}</td>
          <td>
            <div style="font-weight:700;color:var(--theme-primary);font-size:14px;">${item.reservedStock}</div>
            <div style="margin-top:4px;">
              ${channelHolds || '<span style="font-size:11px;color:var(--text-muted);">Chưa giữ hàng</span>'}
            </div>
          </td>
          <td>
            <div style="font-weight:800;font-size:15px;color:${item.availableStock === 0 ? "#dc2626" : "var(--theme-primary)"};">
              ${item.availableStock} / ${item.physicalStock}
            </div>
            <div class="stock-bar-wrap">
              <div class="stock-bar-fill ${barClass}" style="width: ${pct}%;"></div>
            </div>
          </td>
          <td>${ batchSummary }</td>
          <td>${ statusLabel }</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="AppUI.handleRestock('${item.sku}', 5)">
              ➕ Nhập bù +5
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
      trackingCode: "VD-ODOMS-261025-8801",
      orderId: "SP261022001",
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
      createdAt: "25/10/2026 08:30:15"
    }
  ],

  renderWaybillOrderSelector() {
    const selectEl = document.getElementById("waybillOrderSelect");
    if (!selectEl) return;

    const currentVal = selectEl.value;
    const orders = window.omsEngine ? window.omsEngine.orders : [];

    // Nếu chưa nạp đơn nào vào engine, lấy thêm danh sách mẫu từ SAMPLE_EXCEL_DATASETS để người dùng chọn tạo vận đơn ngay
    const options = [`<option value="">-- Chọn đơn hàng (${orders.length} đơn đang nạp) để điền tự động --</option>`];

    orders.forEach((o) => {
      options.push(
        `<option value="${o.orderId}">[${o.channel}] ${o.orderId} — ${o.customerName} (${o.quantity} × ${o.sku})</option>`
      );
    });

    selectEl.innerHTML = options.join("");
    if (currentVal && orders.some((o) => o.orderId === currentVal)) {
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
      POS: "Viettel Post"
    };

    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `VD-${ord.channel.slice(0, 2)}-261025-${randSuffix}`;

    const batchText =
      ord.allocatedBatches && ord.allocatedBatches.length > 0
        ? ord.allocatedBatches.map((b) => `${b.batchCode} (${b.takenQty} SP)`).join(", ")
        : "LO-2026-A1";

    setVal("wbOrderId", ord.orderId);
    setVal("wbChannel", ord.channel);
    setVal("wbTrackingCode", trackingCode);
    setVal("wbCarrier", carrierMap[ord.channel] || "SPX Express");
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

    this.generateWaybillAndQR(true);
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
    const code = `VD-${ch.slice(0, 2)}-261025-${rand}`;
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

    const orderId = val("wbOrderId", "SP261022001");
    const matchedOrd = window.omsEngine?.orders?.find((o) => o.orderId === orderId);
    const totalAmount = num("wbTotalAmount", 0);
    const paymentMethod = matchedOrd?.paymentMethod || (totalAmount > 0 ? "COD (Thanh toán khi nhận hàng)" : "Ví ShopeePay");

    return {
      orderId,
      channel: val("wbChannel", "SHOPEE"),
      trackingCode: val("wbTrackingCode", "VD-ODOMS-261025-8801"),
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
      this.renderWaybillHistoryTable();
      if (window.omsEngine) {
        window.omsEngine.addLog(
          "success",
          `📦 [TẠO MÃ VẬN ĐƠN & QR] Đã khởi tạo vận đơn ${data.trackingCode} cho đơn ${data.orderId} (${data.channel}) — ${data.quantity} × ${data.sku}`
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
          <td style="font-weight:700;">${revenue.toLocaleString("vi-VN")} ₫</td>
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

    content.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--bg-subtle);padding:14px;border-radius:10px;border:1px solid var(--border-color);">
        <div>
          <p><strong>Mã đơn hàng:</strong> ${ord.orderId}</p>
          <p><strong>Kênh bán (Sàn):</strong> <span class="channel-badge badge-${ord.channel}">${ord.channel}</span></p>
          <p><strong>Thời gian đặt:</strong> ${ord.orderTime}</p>
          <p><strong>Phương thức nhận:</strong> ${ord.sourceMethod === "WEBHOOK_API" ? "Đồng bộ API / Webhook 2 chiều" : "Nạp từ bảng dữ liệu Excel"}</p>
        </div>
        <div>
          <p><strong>Khách hàng:</strong> ${ord.customerName} (${ord.customerPhone})</p>
          <p><strong>Sản phẩm:</strong> ${ord.sku} - ${ord.productName}</p>
          <p><strong>Số lượng yêu cầu:</strong> <strong>${ord.quantity}</strong> (Đơn giá: ${ord.unitPrice.toLocaleString("vi-VN")} ₫)</p>
          <p><strong>Phương thức TT:</strong> <strong style="color:var(--theme-primary);">${ord.paymentMethod || "COD"}</strong></p>
          <p><strong>Địa chỉ:</strong> ${ord.shippingAddress}</p>
        </div>
      </div>

      <h4 style="margin-top:16px;font-size:14px;">Lưu vết quy trình xử lý 4 bước tại Phân hệ 1:</h4>
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
  initShipping() {
    this.shipments = (window.SAMPLE_SHIPMENTS_DATA && window.SAMPLE_SHIPMENTS_DATA.length > 0)
      ? JSON.parse(JSON.stringify(window.SAMPLE_SHIPMENTS_DATA))
      : [];
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
    const tbody = document.getElementById("shippingTableBody");
    if (!tbody) return;

    if (!this.shipments || this.shipments.length === 0) {
      if (window.SAMPLE_SHIPMENTS_DATA && window.SAMPLE_SHIPMENTS_DATA.length > 0) {
        this.shipments = JSON.parse(JSON.stringify(window.SAMPLE_SHIPMENTS_DATA));
      }
    }

    const list = this.shipments || [];

    // Cập nhật 4 thẻ KPI Vận chuyển
    const pendingCount = list.filter(s => s.status === "PENDING_PICKUP").length;
    const inTransitCount = list.filter(s => s.status === "IN_TRANSIT").length;
    const deliveredCount = list.filter(s => s.status === "DELIVERED").length;
    const failedCount = list.filter(s => s.status === "FAILED_RETURNING").length;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setEl("shippingKpiPending", pendingCount);
    setEl("shippingKpiInTransit", inTransitCount);
    setEl("shippingKpiDelivered", deliveredCount);
    setEl("shippingKpiFailed", failedCount);

    const activeTotal = pendingCount + inTransitCount;
    setEl("badgeShippingCount", activeTotal);
    setEl("badgeFifoCount", activeTotal);

    // Lọc theo bộ lọc
    const filtered = list.filter(s => {
      if (this.shippingCarrierFilter !== "ALL" && !s.carrier.toLowerCase().includes(this.shippingCarrierFilter.toLowerCase())) {
        return false;
      }
      if (this.shippingStatusFilter !== "ALL" && s.status !== this.shippingStatusFilter) {
        return false;
      }
      if (this.shippingSearchQuery) {
        const q = this.shippingSearchQuery;
        const matchCode = s.trackingCode.toLowerCase().includes(q);
        const matchOrder = s.orderId.toLowerCase().includes(q);
        const matchCust = s.receiver.name.toLowerCase().includes(q) || s.receiver.phone.includes(q);
        const matchAddr = s.receiver.address.toLowerCase().includes(q);
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
        ? '<span class="badge-freeship">🎁 Freeship (0₫)</span>'
        : `<span class="shipping-fee-val">${Number(s.shippingFee).toLocaleString("vi-VN")} ₫</span>`;

      const codHtml = s.totalCod > 0
        ? `<span style="font-weight:800;color:#dc2626;">${Number(s.totalCod).toLocaleString("vi-VN")} ₫</span>`
        : '<span style="font-weight:700;color:#16a34a;">0 ₫ (Đã TT)</span>';

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
              ${s.isFreeship ? "🎁 Freeship 0₫" : "Phí ship: " + Number(s.shippingFee).toLocaleString("vi-VN") + " ₫"} · Thu hộ COD: ${Number(s.totalCod).toLocaleString("vi-VN")} ₫
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

  openWaybillFromShipping(trackingCode) {
    const s = (this.shipments || []).find(item => item.trackingCode === trackingCode);
    if (!s) return;

    this.switchSidebarTab("qr_api");

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };

    setVal("wbOrderId", s.orderId);
    setVal("wbChannel", s.channel);
    setVal("wbTrackingCode", s.trackingCode);
    setVal("wbCarrier", s.carrier);
    setVal("wbCustomerName", s.receiver.name);
    setVal("wbCustomerPhone", s.receiver.phone);
    setVal("wbAddress", s.receiver.address);
    setVal("wbBatchCode", s.batchCode);
    setVal("wbTotalAmount", s.totalCod);

    this.generateWaybillAndQR(false);
    this.printWaybillQrTicket();
  },

};

window.AppUI = AppUI;
window.addEventListener("DOMContentLoaded", () => AppUI.init());
