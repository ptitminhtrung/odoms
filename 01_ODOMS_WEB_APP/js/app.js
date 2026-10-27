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

    const users = window.userAuth.users;
    if (countLabel) {
      countLabel.innerText = `${users.length} tài khoản khả dụng`;
    }

    listContainer.innerHTML = users
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
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabKey);
    });

    // Cập nhật trạng thái active cho thanh điều hướng đáy màn hình (Mobile Bottom Nav)
    document.querySelectorAll(".mobile-nav-btn[data-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabKey);
    });

    // Tự động đóng menu Sidebar trên thiết bị di động khi người dùng chọn tab
    if (window.innerWidth <= 992) {
      this.toggleMobileSidebar(false);
    }

    const titleMap = {
      dashboard: "Dashboard",
      ingest: "Tiếp nhận & Gom đơn 5 Kênh",
      inventory: "Đối chiếu Tồn kho ATP",
      fifo: "Kiểm soát FIFO / FEFO",
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
      "Địa chỉ nhận hàng": `Đơn đồng bộ qua Webhook ${channel}`
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
  handleAddNewUser() {
    const fullName = document.getElementById("newUserFullName").value;
    const username = document.getElementById("newUserUsername").value;
    const password = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value;
    const department = document.getElementById("newUserDept").value;
    const shift = document.getElementById("newUserShift").value;
    const msgBox = document.getElementById("userFormFeedback");

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

  switchAndTestUser(username, password) {
    this.handleLogout();
    this.fillLoginCredentials(username, password);
  },

  // ============================================================================
  // RENDER TOÀN BỘ GIAO DIỆN DASHBOARD & CÁC PHÂN HỆ
  // ============================================================================
  renderAll() {
    this.renderOneMonthRevenueOverview();
    this.renderKPIsAndBadges();
    this.renderCharts();
    this.renderTop3ChannelsBarChart();
    this.renderThreeMonthBarChart();
    this.renderMonthlyChannelRanking();
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
    setElText("badgeFifoCount", allocatedOrders);
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
      list = list.filter((o) => o.status === this.currentStatusFilter);
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
        if (ord.status === "ALLOCATED") {
          statusBadge = `<span class="status-badge st-ALLOCATED">✔ Đã giữ hàng & Trừ kho</span>`;
        } else if (ord.status === "BACKORDER") {
          statusBadge = `<span class="status-badge st-BACKORDER">⚠ Thiếu tồn (Chặn bán lố)</span>`;
        } else if (ord.status === "INVALID") {
          statusBadge = `<span class="status-badge st-INVALID">✖ Đơn lỗi hợp lệ</span>`;
        } else {
          statusBadge = `<span class="status-badge st-PENDING">⏳ Đang xử lý</span>`;
        }

        const fifoBadge = ord.fifoRank
          ? `<span class="fifo-rank" title="Thứ tự ưu tiên theo thời gian đặt của mã ${ord.sku}">FIFO #${ord.fifoRank}</span>`
          : `<span style="color:#94a3b8;font-size:11px;">-</span>`;

        const stockCompare = ord.stockSnapshot
          ? `<span style="font-weight:600;">${ord.stockSnapshot.before}</span> ➔ <strong style="color:${
              ord.status === "ALLOCATED" ? "var(--theme-primary)" : "#d97706"
            }">${ord.stockSnapshot.after}</strong>`
          : `<span style="color:#ef4444;font-size:11.5px;">Chặn ở Bước 2</span>`;

        const batchInfo =
          ord.allocatedBatches.length > 0
            ? ord.allocatedBatches
                .map((b) => `<span class="hold-pill">Lô ${b.batchCode}: ${b.takenQty} SP</span>`)
                .join(" ")
            : ord.validationErrors.length > 0
            ? `<span style="color:#dc2626;font-size:12px;">${ord.validationErrors.join(", ")}</span>`
            : `<span style="color:#b45309;font-size:12px;">Hết tồn khả dụng (Cần nhập bù)</span>`;

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
          <td>${batchInfo}</td>
          <td>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" onclick="AppUI.openOrderAuditModal('${ord.orderId}')" title="Xem lưu vết 4 bước xử lý">
                🔍 4 bước
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
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      sku: "SP-AO-POLO-01",
      productName: "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      quantity: 4,
      batchCode: "LO-2026-A1",
      totalAmount: 1000000,
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
    setVal("wbQuantity", ord.quantity);
    setVal("wbBatchCode", batchText);
    setVal("wbTotalAmount", ord.quantity * ord.unitPrice);

    this.generateWaybillAndQR(true);
  },

  openWaybillForOrder(orderId) {
    this.switchMenuTab("qr_api");
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
    const num = (id, fallback = 1) => Number(document.getElementById(id)?.value) || fallback;

    return {
      orderId: val("wbOrderId", "SP261022001"),
      channel: val("wbChannel", "SHOPEE"),
      trackingCode: val("wbTrackingCode", "VD-ODOMS-261025-8801"),
      carrier: val("wbCarrier", "SPX Express"),
      customerName: val("wbCustomerName", "Nguyễn Văn An"),
      customerPhone: val("wbCustomerPhone", "0901234567"),
      address: val("wbAddress", "123 Nguyễn Huệ, Quận 1, TP.HCM"),
      sku: val("wbSku", "SP-AO-POLO-01"),
      productName: val("wbProductName", "Áo Polo Nam Coolmate Pro (Đen - Size L)"),
      quantity: num("wbQuantity", 4),
      batchCode: val("wbBatchCode", "LO-2026-A1"),
      totalAmount: num("wbTotalAmount", 1000000)
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
            <div style="font-size:11px;color:#475569;font-weight:600;">Hệ thống quản lý đơn hàng đa kênh thông minh · Trung tâm Điều phối Đa kênh</div>
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
            <div>Ngày tạo: <strong>${createdAtStr}</strong></div>
            <div>Mã lô xuất FEFO: <strong style="color:#15803d;">${data.batchCode}</strong></div>
            <div>Thu hộ COD: <strong style="color:#dc2626;font-size:13.5px;">${data.totalAmount.toLocaleString("vi-VN")} ₫</strong></div>
          </div>
        </div>
      </div>

      <div class="wb-info-grid">
        <div class="wb-info-box">
          <div style="font-size:11px;font-weight:800;color:#0A2947;text-transform:uppercase;margin-bottom:4px;">👤 Người Nhận Hàng</div>
          <div style="font-weight:800;font-size:13.5px;color:#0f172a;">${data.customerName} — ${data.customerPhone}</div>
          <div style="font-size:12px;color:#334155;margin-top:3px;">📍 ${data.address}</div>
        </div>
        <div class="wb-info-box">
          <div style="font-size:11px;font-weight:800;color:#0A2947;text-transform:uppercase;margin-bottom:4px;">📦 Chi Tiết Kiện Hàng (Chuẩn FIFO/FEFO)</div>
          <div style="font-weight:800;font-size:13px;color:#0f172a;">${data.sku} × <span style="color:#dc2626;font-size:14px;">${data.quantity} SP</span></div>
          <div style="font-size:12px;color:#334155;margin-top:3px;">${data.productName}</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#475569;border-top:1px dashed #cbd5e1;padding-top:8px;">
        <span>✔ Đã kiểm tra tồn khả dụng (ATP) & khóa lô hàng tự động</span>
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
          <td style="font-weight:800;color:#dc2626;">${Number(item.totalAmount).toLocaleString("vi-VN")} ₫</td>
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
    tbody.innerHTML = window.userAuth.users
      .map((u, idx) => {
        const isCurrent = activeUser && activeUser.username.toLowerCase() === u.username.toLowerCase();
        const isRoot = u.username.toLowerCase() === "dttd";

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
          <td><code style="background:var(--bg-subtle);padding:3px 7px;border-radius:5px;color:var(--text-secondary);">${u.password}</code></td>
          <td><strong>${u.role}</strong></td>
          <td>${u.shift || "Ca Hành chính"}</td>
          <td><span class="status-badge st-ALLOCATED">● Đang hoạt động</span></td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="AppUI.switchAndTestUser('${u.username}', '${u.password}')" title="Đăng xuất và điền sẵn tài khoản này để đăng nhập">
                🔑 Chuyển TK
              </button>
              ${
                !isRoot && !isCurrent
                  ? `<button class="btn btn-danger-outline btn-sm" onclick="AppUI.handleDeleteUser('${u.username}')">Xóa</button>`
                  : ""
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
  }
};

window.AppUI = AppUI;
window.addEventListener("DOMContentLoaded", () => AppUI.init());
