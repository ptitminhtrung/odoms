// ============================================================================
// BỘ ĐIỀU KHIỂN GIAO DIỆN NGƯỜI DÙNG HỆ THỐNG ODOMS (AppUI Controller)
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\app.js
// ============================================================================

const THEMES_LIST = [
  {
    key: "vivo",
    name: "Sáng",
    fullTitle: "Chế độ hiển thị Sáng",
    chartPrimary: "#1877FF",
    chartPrimaryArea: "#EEF5FF",
    chartSecondary: "#465AFF"
  },
  {
    key: "dark",
    name: "Tối",
    fullTitle: "Chế độ hiển thị Tối",
    chartPrimary: "#3B82F6",
    chartPrimaryArea: "rgba(59, 130, 246, 0.16)",
    chartSecondary: "#38BDF8"
  }
];

const AppUI = {
  currentMenuTab: "dashboard",
  currentChannelFilter: "ALL",
  currentStatusFilter: "ALL",
  orderSortMode: "NEWEST_FIRST",
  ordersQuickMode: "ALL",
  ordersUrgentManualSort: false,
  ordersFilterDrawerOpen: false,
  customIngestDrawerOpen: false,
  ingestSelectedOrderIds: new Set(),
  qrScannerState: {
    isOpen: false,
    stream: null,
    rafId: null,
    detector: null,
    isPaused: false,
    facingMode: "environment",
    videoDevices: [],
    activeDeviceIndex: 0,
    lastDecodedValue: "",
    lastDecodedAt: 0,
    detectInFlight: false
  },
  searchQuery: "",
  currentOrdersPage: 1,
  ordersPageSize: 10,
  invCategoryFilter: "ALL",
  invStatusFilter: "ALL",
  invSearchQuery: "",
  activeInvCard: null,
  currentInvPage: 1,
  invPageSize: 10,
  invNewProductDrawerOpen: false,
  invNewProdActiveSuggestCat: "",
  qrLookupQuery: "",
  qrLookupDrawerOpen: false,
  currentQrLookupPage: 1,
  qrLookupPageSize: 10,
  waybillHistorySearchQuery: "",
  waybillHistoryStatusFilter: "ALL",
  currentWaybillHistoryPage: 1,
  waybillHistoryPageSize: 10,
  waybillOrderPickerOpen: false,
  waybillOrderPickerTab: "UNISSUED",
  waybillOrderPickerSearchQuery: "",
  activePreviewWaybillRecord: null,
  currentTheme: "vivo",
  themeStorageKey: "ODOMS_ACTIVE_THEME_V3",
  actionDiffBarState: { mode: "NONE", badge: "", message: "" },
  sandboxUnsyncedBannerState: { visible: false, expanded: false, changeCount: 0, summary: "" },
  cloudUrlDrawerOpen: false,

  init() {
    this.initTheme();
    this.initShipping();
    const wbInput = document.getElementById("wbTrackingCode");
    if (wbInput && !wbInput.value && this.waybillHistory && this.waybillHistory[0]) {
      wbInput.value = this.waybillHistory[0].trackingCode;
    }
    this.initCloudSyncPanel();
    this.updateSandboxModeUI();
    this.renderSandboxUnsyncedBanner();
    this.updateUndoActionBarUI();
    this.bindEvents();
    this.renderLoginQuickAccounts();
    // Khởi đầu tại Màn hình Đăng nhập (tự động áp dụng màu Sáng/Tối đã lưu gần nhất)
    this.showLoginScreen();
    this.switchSidebarTab("dashboard");
  },

  normalizeThemeKey(rawKey) {
    return String(rawKey || "").trim().toLowerCase() === "dark" ? "dark" : "vivo";
  },

  initTheme() {
    let savedTheme = "vivo";
    let shouldRewriteLegacy = false;
    try {
      const stored = localStorage.getItem(this.themeStorageKey);
      if (stored) {
        savedTheme = this.normalizeThemeKey(stored);
        if (stored !== savedTheme) {
          shouldRewriteLegacy = true;
        }
      }
    } catch (e) {
      console.warn("Không thể đọc cấu hình giao diện:", e);
    }
    this.renderThemeSwitchers();
    this.applyTheme(savedTheme, false, shouldRewriteLegacy);
  },

  renderThemeSwitchers() {
    const bar = document.getElementById("settingsThemePickerBar");
    if (!bar) return;

    const sunSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<line x1="12" y1="2" x2="12" y2="5"/>' +
      '<line x1="12" y1="19" x2="12" y2="22"/>' +
      '<line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/>' +
      '<line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>' +
      '<line x1="2" y1="12" x2="5" y2="12"/>' +
      '<line x1="19" y1="12" x2="22" y2="12"/>' +
      '<line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/>' +
      '<line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/>' +
      "</svg>";
    const moonSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
      "</svg>";

    const buttonsHtml = THEMES_LIST.map((t) => {
      const isAct = this.currentTheme === t.key;
      const iconSvg = t.key === "dark" ? moonSvg : sunSvg;
      return `
        <button
          type="button"
          class="settings-seg-btn theme-icon-toggle-btn ${isAct ? "active" : ""}"
          data-theme-key="${t.key}"
          title="${t.name}"
          aria-label="${t.name}"
          aria-pressed="${isAct ? "true" : "false"}"
          onclick="AppUI.applyTheme('${t.key}', true)"
        >
          ${iconSvg}
        </button>
      `;
    }).join("");

    bar.innerHTML = buttonsHtml;
  },

  applyTheme(themeKey, recordLog = true, persistChoice = recordLog) {
    const normalizedKey = this.normalizeThemeKey(themeKey);
    const themeObj = THEMES_LIST.find((t) => t.key === normalizedKey) || THEMES_LIST[0];
    this.currentTheme = themeObj.key;

    // 1. Gán data-theme lên thẻ <html> để áp dụng đồng bộ cho cả Màn hình Đăng nhập & toàn bộ giao diện nghiệp vụ
    document.documentElement.setAttribute("data-theme", themeObj.key);

    // 2. Lưu lựa chọn cuối cùng vào bộ nhớ trình duyệt khi người dùng chuyển màu hoặc chuẩn hóa khóa cũ
    if (persistChoice) {
      try {
        localStorage.setItem(this.themeStorageKey, themeObj.key);
      } catch (e) {
        console.warn("Không thể lưu cấu hình giao diện:", e);
      }
    }

    // 3. Cập nhật trạng thái đang chọn trên 2 thẻ Sáng / Tối trong trang Cài đặt
    this.renderThemeSwitchers();

    // 4. Đồng bộ màu đường & ánh vầng quang cho đồ thị 2 trục tung Tab 1 (Sáng: rõ sắc nét · Tối: rực sâu)
    const splinePalette = this.getMonthlySplineThemeColors();
    const splineImportColor = splinePalette.importLine;
    const splineExportColor = splinePalette.exportLine;
    const splineImportGlow = splinePalette.importGlow;
    const splineExportGlow = splinePalette.exportGlow;
    const setGradCoords = (id, y1Val, y2Val) => {
      const gradEl = document.getElementById(id);
      if (!gradEl) return;
      gradEl.setAttribute("gradientUnits", "userSpaceOnUse");
      gradEl.setAttribute("x1", "0");
      gradEl.setAttribute("y1", String(y1Val));
      gradEl.setAttribute("x2", "0");
      gradEl.setAttribute("y2", String(y2Val));
    };
    const setStopAttrs = (id, color, pair) => {
      const el = document.getElementById(id);
      if (!el || !pair) return;
      el.setAttribute("offset", pair[0]);
      el.setAttribute("stop-color", color);
      el.setAttribute("stop-opacity", pair[1]);
    };

    setGradCoords("gradAreaImport", 36, 226);
    setGradCoords("gradAreaExport", 36, 226);

    setStopAttrs("gradStopImportTop", splineImportGlow, splinePalette.importStops.top);
    setStopAttrs("gradStopImportMid", splineImportGlow, splinePalette.importStops.mid);
    setStopAttrs("gradStopImportLow", splineImportGlow, splinePalette.importStops.low);
    setStopAttrs("gradStopImportBottom", splineImportGlow, splinePalette.importStops.bottom);

    setStopAttrs("gradStopExportTop", splineExportGlow, splinePalette.exportStops.top);
    setStopAttrs("gradStopExportMid", splineExportGlow, splinePalette.exportStops.mid);
    setStopAttrs("gradStopExportFade", splineExportGlow, splinePalette.exportStops.fade);
    setStopAttrs("gradStopExportBottom", splineExportGlow, splinePalette.exportStops.bottom);

    const chartLineImport = document.getElementById("chartLineImport");
    if (chartLineImport) {
      chartLineImport.setAttribute("stroke", splineImportColor);
      chartLineImport.setAttribute("stroke-width", "2.2");
    }

    const chartDotsImport = document.getElementById("chartDotsImport");
    if (chartDotsImport) chartDotsImport.setAttribute("fill", splineImportColor);

    const chartLineExport = document.getElementById("chartLineExport");
    if (chartLineExport) {
      chartLineExport.setAttribute("stroke", splineExportColor);
      chartLineExport.setAttribute("stroke-width", "2.2");
      if (typeof chartLineExport.removeAttribute === "function") {
        chartLineExport.removeAttribute("stroke-dasharray");
      }
    }

    const chartDotsExportGroup = document.getElementById("chartDotsExportGroup");
    if (chartDotsExportGroup) chartDotsExportGroup.setAttribute("fill", splineExportColor);

    const chartDotExport = document.getElementById("chartDotExport");
    if (chartDotExport) chartDotExport.setAttribute("fill", splineExportColor);

    const legendBoxImport = document.getElementById("legendBoxImport");
    if (legendBoxImport) legendBoxImport.style.background = splineImportColor;

    const legendBoxExport = document.getElementById("legendBoxExport");
    if (legendBoxExport) legendBoxExport.style.background = splineExportColor;

    // Cập nhật lại các biểu đồ theo chế độ Sáng / Tối mới
    if (typeof this.renderDashboardP2 === "function") {
      this.renderDashboardP2();
    }
    if (typeof this.renderRevenueAnalyticsView === "function") {
      this.renderRevenueAnalyticsView();
    } else {
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
    }
    if (typeof this.renderReportsSummary === "function") {
      this.renderReportsSummary();
    }

    // 5. Ghi nhật ký nghiệp vụ nếu người dùng bấm đổi trực tiếp
    if (recordLog && window.omsEngine) {
      window.omsEngine.addLog(
        "info",
        `[CÀI ĐẶT GIAO DIỆN] Đã chuyển giao diện hiển thị sang chế độ [${themeObj.name}] và tự động ghi nhớ.`
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

    // 2. Upload file Excel (.xlsx, .xls, .csv) qua nút Tải lên hoặc kéo-thả trực tiếp vào khung Tiếp nhận
    const fileInput = document.getElementById("excelFileInput");
    const uploadBox = document.getElementById("uploadDropZone");

    if (uploadBox && fileInput) {
      uploadBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadBox.classList.add("dragover");
      });
      uploadBox.addEventListener("dragleave", (e) => {
        if (e.relatedTarget && uploadBox.contains(e.relatedTarget)) return;
        uploadBox.classList.remove("dragover");
      });
      uploadBox.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadBox.classList.remove("dragover");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
        this.ordersUrgentManualSort = true;
        this.currentOrdersPage = 1;
        this.ingestSelectedOrderIds.clear();
        this.renderOrdersTable();
      });
    }

    // 4. Tìm kiếm & lọc trạng thái đơn hàng
    const searchInput = document.getElementById("orderSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.currentOrdersPage = 1;
        this.ingestSelectedOrderIds.clear();
        this.renderOrdersTable();
      });
    }

    const statusSelect = document.getElementById("statusFilterSelect");
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        this.currentStatusFilter = e.target.value;
        this.currentOrdersPage = 1;
        this.ingestSelectedOrderIds.clear();
        this.renderOrdersTable();
      });
    }

    // 5. Tra cứu QR / Mã đơn / Sản phẩm / Lô hàng & Tìm kiếm danh sách vận đơn
    const qrInput = document.getElementById("qrSearchInput");
    if (qrInput) {
      qrInput.addEventListener("input", (e) => {
        this.qrLookupQuery = e.target.value.trim().toLowerCase();
        this.currentQrLookupPage = 1;
        if (this.qrLookupQuery && !this.qrLookupDrawerOpen) {
          this.toggleQrLookupDrawer(true);
        }
        this.renderQrLookupResults();
      });
    }

    const wbHistoryInput = document.getElementById("waybillHistorySearchInput");
    if (wbHistoryInput) {
      wbHistoryInput.addEventListener("input", (e) => {
        this.waybillHistorySearchQuery = e.target.value.trim().toLowerCase();
        this.currentWaybillHistoryPage = 1;
        this.renderWaybillHistoryTable();
      });
    }

    const wbPickerSearchInput = document.getElementById("waybillOrderPickerSearch");
    if (wbPickerSearchInput) {
      wbPickerSearchInput.addEventListener("input", (e) => {
        this.waybillOrderPickerSearchQuery = e.target.value.trim().toLowerCase();
        this.renderWaybillOrderSelector();
      });
    }

    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("click", (e) => {
        if (!this.waybillOrderPickerOpen) return;
        const pickerEl = document.getElementById("waybillOrderPicker");
        if (pickerEl && e && e.target && typeof pickerEl.contains === "function" && pickerEl.contains(e.target)) {
          return;
        }
        this.closeWaybillOrderPicker();
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

    // 7. Phím Esc đóng hộp thoại Chi tiết lô hàng, Chi tiết đơn hàng, Xem trước phiếu A6 hoặc hộp chọn đơn
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("keydown", (e) => {
        if (!e || e.key !== "Escape") return;
        const shipMapModal = document.getElementById("shippingMapModal");
        if (shipMapModal && shipMapModal.classList.contains("open")) {
          this.closeShippingMapModal();
          return;
        }
        const wbPreviewModal = document.getElementById("waybillPreviewModal");
        if (wbPreviewModal && wbPreviewModal.classList.contains("open")) {
          this.closeWaybillPreviewModal();
          return;
        }
        if (this.waybillOrderPickerOpen) {
          this.closeWaybillOrderPicker();
          return;
        }
        const qrModal = document.getElementById("qrCameraScannerModal");
        if (qrModal && qrModal.classList.contains("open")) {
          this.closeQrCameraModal();
          return;
        }
        const popEl = document.getElementById("invRestockPopover");
        if (popEl && !popEl.classList.contains("hidden")) {
          this.closeRestockPopover();
          return;
        }
        const auditModal = document.getElementById("orderAuditModal");
        if (auditModal && auditModal.classList.contains("open")) {
          this.closeModal();
          return;
        }
        if (
          this.currentMenuTab === "logs" &&
          this.unifiedLogsState &&
          this.unifiedLogsState.activeDetailUid
        ) {
          this.closeUnifiedLogDetail();
        }
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

  stripLogEmojis(text) {
    return String(text || "")
      .replace(/[\uFE0E\uFE0F\u200D]/g, "")
      .replace(/\p{Extended_Pictographic}\s*/gu, "")
      .replace(/[✔✖●]\s*/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  },

  formatLogDisplayTimestamp(rawTime, fallbackMs = null) {
    const raw = String(rawTime || "").trim();
    const pad = (n) => String(n).padStart(2, "0");
    const fmtDateObj = (d) =>
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

    if (!raw) {
      return fallbackMs ? fmtDateObj(new Date(fallbackMs)) : "--";
    }

    // 1. Dạng HH:MM:SS(.mmm)? DD.MM.YYYY hoặc DD/MM/YYYY hoặc DD-MM-YYYY
    const hmsDmy = raw.match(/(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?\s+(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if (hmsDmy) {
      return `${pad(hmsDmy[1])}:${hmsDmy[2]}:${hmsDmy[3]} ${pad(hmsDmy[4])}.${pad(hmsDmy[5])}.${hmsDmy[6]}`;
    }

    // 2. Dạng DD/MM/YYYY HH:MM:SS(.mmm)? hoặc DD-MM-YYYY / DD.MM.YYYY
    const dmyHms = raw.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?/);
    if (dmyHms) {
      return `${pad(dmyHms[4])}:${dmyHms[5]}:${dmyHms[6]} ${pad(dmyHms[1])}.${pad(dmyHms[2])}.${dmyHms[3]}`;
    }

    // 3. Dạng ISO / YYYY-MM-DD[T ]HH:MM:SS(.mmm)?(Z|offset)?
    const isoMatch = raw.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})[T\s]+(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i);
    if (isoMatch) {
      if (isoMatch[7]) {
        const parsedIso = new Date(raw);
        if (!isNaN(parsedIso.getTime())) {
          return fmtDateObj(parsedIso);
        }
      }
      return `${pad(isoMatch[4])}:${isoMatch[5]}:${isoMatch[6]} ${pad(isoMatch[3])}.${pad(isoMatch[2])}.${isoMatch[1]}`;
    }

    // 4. Dạng HH:MM:SS(.mmm)? cũ (chưa kèm ngày) -> cắt mili-giây và ghép ngày từ fallbackMs hoặc ngày hiện tại
    const hmsOnly = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
    if (hmsOnly) {
      const refDate = fallbackMs ? new Date(fallbackMs) : new Date();
      return `${pad(hmsOnly[1])}:${hmsOnly[2]}:${hmsOnly[3]} ${pad(refDate.getDate())}.${pad(refDate.getMonth() + 1)}.${refDate.getFullYear()}`;
    }

    const parsedFallback = new Date(raw);
    if (!isNaN(parsedFallback.getTime())) {
      return fmtDateObj(parsedFallback);
    }

    return raw.replace(/(\d{2}:\d{2}:\d{2})\.\d+/g, "$1");
  },

  normalizeStaffRoleDisplay(role) {
    const r = this.stripLogEmojis(role);
    if (!r) return "Nhân viên vận hành";
    return r
      .replace(/Chuyên viên\s+RMA/gi, "Chuyên viên Đổi trả")
      .replace(/Quản lý Điều phối\s+OMS/gi, "Chuyên viên Vận hành")
      .replace(/\bRoot Super Admin\b|\bSuper Admin\b|\bRoot Admin\b|\bAdmin\b/gi, "Quản trị hệ thống")
      .replace(/\bStaff\b/gi, "Nhân viên vận hành")
      .replace(/\bOMS\b/g, "ODOMS");
  },

  normalizeStaffDeptDisplay(dept) {
    const d = this.stripLogEmojis(dept);
    if (!d) return "Phòng Vận hành Đa kênh";
    return d
      .replace(/Phòng Vận hành\s+OMS/gi, "Phòng Vận hành Đa kênh")
      .replace(/\bOMS\b/g, "ODOMS");
  },

  normalizeLegacyLogText(text) {
    return this.stripLogEmojis(text)
      .replace(/Chuyên viên\s+RMA/gi, "Chuyên viên Đổi trả")
      .replace(/Quản lý Điều phối\s+OMS/gi, "Chuyên viên Vận hành")
      .replace(/Phòng Vận hành\s+OMS/gi, "Phòng Vận hành Đa kênh")
      .replace(/Dashboard\s+OMS/gi, "Màn hình điều hành ODOMS")
      .replace(/hệ thống\s+OMS/gi, "hệ thống ODOMS")
      .replace(/\bWorkstation\b/gi, "Máy trạm vận hành")
      .replace(/ODOMS\s+Terminal/gi, "Máy trạm ODOMS")
      .replace(/ODOMS\s*·\s*Local/gi, "Máy trạm ODOMS")
      .replace(/Tạm ngừng hoạt động tài khoản/g, "Tạm khóa tài khoản")
      .replace(/tạm ngừng hoạt động tài khoản/g, "tạm khóa tài khoản")
      .replace(/Tạm ngưng hoạt động bởi Quản trị viên/gi, "Tạm khóa bởi Quản trị hệ thống")
      .replace(/\s*\(Inactive\)/gi, "")
      .replace(/\s*\(Active\)/gi, "")
      .replace(/\s*\(OFF\)/gi, "")
      .replace(/\s*\(ON\)/gi, "")
      .replace(/\bInactive\b/gi, "Tạm khóa")
      .replace(/\bActive\b/gi, "Đang hoạt động")
      .replace(/\bRoot Super Admin\b|\bSuper Admin\b|\bRoot Admin\b/gi, "Quản trị hệ thống")
      .replace(/\bOMS\b/g, "ODOMS");
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
              <div class="qa-role">${this.normalizeStaffRoleDisplay(u.role)}</div>
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

  // Phân quyền riêng cho chức năng xem Khung chi tiết Nhật ký hệ thống (chỉ 2 tài khoản quản trị hệ thống dttd và lhmt)
  isSystemLogAdmin() {
    const user = window.userAuth && window.userAuth.currentUser;
    if (!user) return false;
    const uname = String(user.username || "").trim().toLowerCase();
    if (uname !== "dttd" && uname !== "lhmt") return false;
    const allUsers = window.userAuth && Array.isArray(window.userAuth.users) ? window.userAuth.users : [];
    const matched = allUsers.find((u) => String(u.username || "").trim().toLowerCase() === uname);
    const isRootFlag = Boolean(user.isRoot || (matched && matched.isRoot));
    const roleDisplay = this.normalizeStaffRoleDisplay((matched && matched.role) || user.role || "");
    return isRootFlag || /Chuyên viên Vận hành|Quản trị hệ thống/i.test(roleDisplay);
  },

  applyRoleBasedAccessControl() {
    const isAdmin = this.isCurrentUserAdmin();
    const adminOnlyTabs = ["logs", "staff"];

    if (!this.isSystemLogAdmin() && this.unifiedLogsState) {
      this.unifiedLogsState.activeDetailUid = null;
    }

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
        const restrictedName = tabKey === "staff" ? "Nhân sự" : tabKey === "logs" ? "Nhật ký" : "Quản trị";
        window.omsEngine.addLog(
          "warn",
          `[PHÂN QUYỀN NHÂN SỰ] Tài khoản Nhân viên vận hành không có quyền truy cập mục Quản trị [${restrictedName}].`
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
    if (window.innerWidth <= 1024) {
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
      staff: "Nhân sự & Phân quyền ODOMS",
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
    const topbarContextEls = Array.from(document.querySelectorAll(".topbar-actions [data-action-views]"));
    const exportBtnEl = document.getElementById("btnTopbarExportReport");
    if (exportBtnEl && !topbarContextEls.includes(exportBtnEl)) {
      topbarContextEls.push(exportBtnEl);
    }
    const defaultExportViews = [
      "dashboard",
      "inventory",
      "ingest",
      "qr_api",
      "shipping",
      "fifo",
      "backorder",
      "revenue_analytics"
    ];
    topbarContextEls.forEach((el) => {
      const rawViews = el.getAttribute("data-action-views") || (el.id === "btnTopbarExportReport" ? defaultExportViews.join(" ") : "");
      const allowedViews = rawViews.split(/[\s,]+/).filter(Boolean);
      if (allowedViews.includes(tabKey)) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });
    this.updateSandboxModeUI();
    this.renderSandboxUnsyncedBanner();
    this.updateUndoActionBarUI();

    // Tự động lọc khi bấm vào tab Chặn bán lố
    if (tabKey === "backorder") {
      this.ordersQuickMode = "ALL";
      this.ordersUrgentManualSort = false;
      this.currentStatusFilter = "BACKORDER";
      this.currentOrdersPage = 1;
      if (this.ingestSelectedOrderIds) this.ingestSelectedOrderIds.clear();
      const statusSelect = document.getElementById("statusFilterSelect");
      if (statusSelect) statusSelect.value = "BACKORDER";
      this.renderOrdersTable();
    } else if (tabKey === "dashboard" || tabKey === "fifo") {
      this.ordersQuickMode = "ALL";
      this.ordersUrgentManualSort = false;
      this.currentStatusFilter = "ALL";
      this.currentOrdersPage = 1;
      if (this.ingestSelectedOrderIds) this.ingestSelectedOrderIds.clear();
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
  showExcelUploadFeedback(message, tone = "is-success") {
    const fbEl = document.getElementById("excelUploadFeedback");
    if (!fbEl) return;
    fbEl.classList.remove("hidden", "is-success", "is-error", "is-warning");
    fbEl.classList.add(tone);
    fbEl.innerText = String(message || "");
  },

  handleFilesSelected(fileList) {
    Array.from(fileList).forEach((file) => {
      window.ExcelHandler.parseWorkbook(file, (err, rows) => {
        if (err || !rows || rows.length === 0) {
          const errMsg = `Không thể đọc tệp [${file.name}]. Vui lòng kiểm tra định dạng .xlsx hoặc .csv.`;
          window.omsEngine.addLog("error", errMsg);
          this.showExcelUploadFeedback(errMsg, "is-error");
          this.renderLogs();
          return;
        }
        window.omsEngine.addLog("info", `Đã đọc tệp [${file.name}] (${rows.length} dòng dữ liệu).`);
        const res = window.omsEngine.ingestAndProcessOrders(rows, "EXCEL_IMPORT") || {
          addedCount: 0,
          duplicateCount: 0,
          pausedSkippedCount: 0
        };
        const dupNote = res.duplicateCount > 0 ? ` · Bỏ qua ${res.duplicateCount} đơn trùng mã` : "";
        const pauseNote = res.pausedSkippedCount > 0 ? ` · Tạm ngưng ${res.pausedSkippedCount} đơn` : "";
        this.showExcelUploadFeedback(
          `Đã đọc tệp "${file.name}" (${rows.length} dòng): tiếp nhận ${res.addedCount} đơn hàng mới${dupNote}${pauseNote}.`,
          res.addedCount > 0 ? "is-success" : "is-warning"
        );
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
      const res = window.omsEngine.ingestAndProcessOrders(rows, "EXCEL_IMPORT") || {
        addedCount: 0,
        duplicateCount: 0,
        pausedSkippedCount: 0
      };
      const pausedCount = Number(res.pausedSkippedCount || 0);
      let msg = "";
      let tone = "is-success";
      if (res.addedCount > 0) {
        const pauseNote =
          pausedCount > 0
            ? ` · Tạm ngưng ${pausedCount} đơn thuộc kênh đang ngắt kết nối`
            : "";
        msg = `Đã đồng bộ dữ liệu 5 kênh bán hàng: tiếp nhận ${res.addedCount} đơn hàng mới${pauseNote}.`;
      } else if (pausedCount > 0) {
        msg = `Dữ liệu các kênh đang kết nối đã đầy đủ · Tạm ngưng tiếp nhận ${pausedCount} đơn thuộc kênh đang ngắt kết nối.`;
        tone = "is-warning";
      } else {
        msg = `Dữ liệu 5 kênh đã được đồng bộ đầy đủ (${rows.length} đơn hàng).`;
      }
      this.showExcelUploadFeedback(msg, tone);
      this.triggerChannelSyncAnimation();
      this.renderAll();
    }
  },

  toggleCustomIngestDrawer(forceOpen) {
    this.customIngestDrawerOpen = typeof forceOpen === "boolean" ? forceOpen : !this.customIngestDrawerOpen;
    const drawer = document.getElementById("customIngestDrawer");
    const btn = document.getElementById("btnToggleCustomIngestDrawer");
    if (drawer) {
      drawer.classList.toggle("hidden", !this.customIngestDrawerOpen);
    }
    if (btn) {
      btn.setAttribute("aria-expanded", this.customIngestDrawerOpen ? "true" : "false");
      btn.classList.toggle("is-open", this.customIngestDrawerOpen);
    }
  },

  updateIngestConnectedChannelsHint() {
    const hintEl = document.getElementById("ingestConnectedChannelsHint");
    const dotEl = document.getElementById("ingestGatewayDot");
    if (!window.omsEngine || !window.omsEngine.channels) return;
    const keys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];
    const totalChannels = keys.length;
    const connectedCount = keys.filter(
      (k) => window.omsEngine.channels[k] && window.omsEngine.channels[k].isConnected !== false
    ).length;

    if (hintEl) {
      hintEl.innerText =
        connectedCount === 0
          ? "Tạm ngưng kết nối · 0 kênh"
          : `Đang kết nối · ${connectedCount} kênh`;
    }
    if (dotEl) {
      dotEl.classList.remove("is-all-connected", "is-partial-connected", "is-disconnected");
      if (connectedCount === totalChannels) {
        dotEl.classList.add("is-all-connected");
      } else if (connectedCount > 0) {
        dotEl.classList.add("is-partial-connected");
      } else {
        dotEl.classList.add("is-disconnected");
      }
    }
  },

  instantSimulateOrderFromChannels() {
    const keys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];
    const connectedKeys =
      window.omsEngine && window.omsEngine.channels
        ? keys.filter((k) => window.omsEngine.channels[k] && window.omsEngine.channels[k].isConnected !== false)
        : keys;

    if (connectedKeys.length === 0) {
      this.showExcelUploadFeedback(
        "Tất cả các kênh bán đang tạm ngưng kết nối. Vui lòng bật kết nối kênh trong mục Cài đặt trước khi giả lập nhận đơn.",
        "is-warning"
      );
      return;
    }

    this.fillRandomWebhookOrder();
    this.simulateWebhookOrder();
  },

  fillRandomWebhookOrder() {
    const allChannels = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
    const connectedChannels =
      window.omsEngine && window.omsEngine.channels
        ? allChannels.filter((k) => window.omsEngine.channels[k] && window.omsEngine.channels[k].isConnected !== false)
        : allChannels;
    const channels = connectedChannels.length > 0 ? connectedChannels : allChannels;
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
        `[TẠM NGƯNG SÀN] Không thể tiếp nhận đơn mới từ [${chName}] vì sàn đang ở trạng thái "Hủy kết nối". Vui lòng bật lại "Đang kết nối" trước khi nhận đơn.`
      );
      this.renderAll();
      alert(`Kênh ${chName} hiện đang ở trạng thái "Hủy kết nối" (tạm ngưng bán).\nVui lòng nhấn nút bật lại "Đang kết nối" tại thẻ ${chName} nếu muốn tiếp nhận đơn mới.`);
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
    const chName = (chCfg && chCfg.shortName) || channel;
    this.showExcelUploadFeedback(
      `Đã tiếp nhận đơn giả lập ${orderId} từ ${chName} (${qty} × ${sku} — ${customer}).`,
      "is-success"
    );
    this.triggerChannelSyncAnimation();
    this.renderAll();
    return { orderId, channel, channelName: chName, sku, quantity: qty };
  },

  setChannelFilter(ch) {
    this.currentChannelFilter = ch || "ALL";
    this.currentOrdersPage = 1;
    if (this.ingestSelectedOrderIds) this.ingestSelectedOrderIds.clear();
    const chSelect = document.getElementById("orderChannelFilterSelect");
    if (chSelect && chSelect.value !== this.currentChannelFilter) {
      chSelect.value = this.currentChannelFilter;
    }
    document.querySelectorAll(".tab-btn[data-channel]").forEach((btn) => {
      const isAct = btn.getAttribute("data-channel") === this.currentChannelFilter;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-pressed", isAct ? "true" : "false");
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
    if (!sku || isNaN(numQty) || numQty <= 0 || !window.omsEngine) return;

    const beforeInv = window.omsEngine.inventory.find((i) => i.sku === sku);
    if (!beforeInv) return;
    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforePhys = Number(beforeInv.physicalStock || 0);
    const beforeAvail = Number(beforeInv.availableStock || 0);
    const beforeBatches = Array.isArray(beforeInv.batches) ? beforeInv.batches.length : 0;

    window.omsEngine.restockSku(sku, numQty);

    const afterInv = window.omsEngine.inventory.find((i) => i.sku === sku);
    const afterPhys = afterInv ? Number(afterInv.physicalStock || 0) : beforePhys + numQty;
    const afterAvail = afterInv ? Number(afterInv.availableStock || 0) : beforeAvail;
    const afterBatches = afterInv && Array.isArray(afterInv.batches) ? afterInv.batches.length : beforeBatches + 1;

    const rec = window.omsEngine.recordReversibleAction({
      actionType: "RESTOCK",
      actionLabel: "Nhập kho bổ sung",
      targetCode: sku,
      beforeSummary: `Tồn thực tế ${beforePhys} · Tồn khả dụng ${beforeAvail} (${beforeBatches} lô)`,
      afterSummary: `Tồn thực tế ${afterPhys} · Tồn khả dụng ${afterAvail} (${afterBatches} lô, +${numQty})`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

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

  syncInventoryFilterControlsUI() {
    const activeStatus = this.invStatusFilter || "ALL";
    const segBar = document.getElementById("invStatusSegmented");
    if (segBar && typeof segBar.querySelectorAll === "function") {
      segBar.querySelectorAll("[data-inv-status]").forEach((btn) => {
        const bVal = btn.getAttribute("data-inv-status");
        const isAct = bVal === activeStatus;
        btn.classList.toggle("active", isAct);
        btn.setAttribute("aria-pressed", isAct ? "true" : "false");
      });
    }
    const activeCardKey = this.activeInvCard || (activeStatus === "ALL" ? "ALL" : null);
    if (typeof document !== "undefined" && typeof document.querySelectorAll === "function") {
      document.querySelectorAll(".inv-kpi-strip [data-inv-card]").forEach((card) => {
        const cKey = card.getAttribute("data-inv-card");
        card.classList.toggle("is-active-kpi", Boolean(activeCardKey && cKey === activeCardKey));
      });
    }
  },

  setInventoryStatusFilter(statusVal) {
    const valid = ["ALL", "ENOUGH", "LOW", "OUT", "AVAILABLE", "RESERVED", "ALERT"];
    const normalized = String(statusVal || "ALL").trim().toUpperCase();
    const targetVal = valid.includes(normalized) ? normalized : "ALL";
    const statusEl = document.getElementById("invStatusFilter");
    if (statusEl) statusEl.value = targetVal;
    this.invStatusFilter = targetVal;
    this.activeInvCard = targetVal === "ALL" ? "ALL" : null;
    this.currentInvPage = 1;
    this.syncInventoryFilterControlsUI();
    this.closeRestockPopover();
    this.renderInventoryTable();
  },

  onInventoryFilterChange() {
    const catEl = document.getElementById("invCategoryFilter");
    const statusEl = document.getElementById("invStatusFilter");
    const searchEl = document.getElementById("invSearchInput");
    this.invCategoryFilter = catEl ? catEl.value : "ALL";
    this.invStatusFilter = statusEl ? statusEl.value : "ALL";
    this.invSearchQuery = searchEl ? String(searchEl.value || "").trim().toLowerCase() : "";
    this.activeInvCard = this.invStatusFilter === "ALL" ? "ALL" : null;
    this.currentInvPage = 1;
    this.syncInventoryFilterControlsUI();
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
    this.currentInvPage = 1;
    this.syncInventoryFilterControlsUI();
    this.closeRestockPopover();
    this.renderInventoryTable();
  },

  changeInventoryPage(delta) {
    const next = (Number(this.currentInvPage) || 1) + Number(delta || 0);
    this.currentInvPage = Math.max(1, next);
    this.closeRestockPopover();
    this.renderInventoryTable();
  },

  // ============================================================================
  // NGĂN XỔ THÊM SẢN PHẨM MỚI (TỰ ĐỀ XUẤT / TỰ CHỈNH / TỰ NHẬP TAY, v29)
  // ============================================================================
  getInventoryUniqueCategories() {
    const list =
      window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : window.INITIAL_INVENTORY || [];
    const seen = new Set();
    const cats = [];
    list.forEach((item) => {
      const c = String((item && item.category) || "").trim();
      if (c && !seen.has(c)) {
        seen.add(c);
        cats.push(c);
      }
    });
    return cats;
  },

  syncInventoryCategoryControls() {
    const cats = this.getInventoryUniqueCategories();

    // 1. Cập nhật hộp chọn danh mục trên thanh lọc Kho (#invCategoryFilter)
    const catSelect = document.getElementById("invCategoryFilter");
    if (catSelect) {
      const currentVal = this.invCategoryFilter || catSelect.value || "ALL";
      const validVal = currentVal === "ALL" || cats.includes(currentVal) ? currentVal : "ALL";
      this.invCategoryFilter = validVal;
      catSelect.innerHTML = [
        `<option value="ALL">Tất cả (${cats.length} danh mục)</option>`,
        ...cats.map((c) => `<option value="${this.escapeLogHtml(c)}">${this.escapeLogHtml(c)}</option>`)
      ].join("");
      catSelect.value = validVal;
    }

    // 2. Cập nhật datalist gợi ý cho ô Danh mục trong ngăn thêm sản phẩm mới
    const dataList = document.getElementById("invExistingCategoriesList");
    if (dataList) {
      dataList.innerHTML = cats.map((c) => `<option value="${this.escapeLogHtml(c)}"></option>`).join("");
    }

    // 3. Cập nhật dải chip đề xuất nhanh danh mục (#invNewProdCatSuggestions)
    const chipsWrap = document.getElementById("invNewProdCatSuggestions");
    if (chipsWrap) {
      const activeCat = this.invNewProdActiveSuggestCat || "";
      chipsWrap.innerHTML = cats
        .map((c) => {
          const isAct = activeCat === c;
          const safeCat = this.escapeLogHtml(c);
          return `<button type="button" class="inv-np-cat-chip${isAct ? " active" : ""}" data-np-cat="${safeCat}" aria-pressed="${isAct ? "true" : "false"}" onclick="AppUI.applyNewProductCategorySuggestion('${safeCat.replace(/'/g, "\\'")}', true)">${safeCat}</button>`;
        })
        .join("");
    }
  },

  syncSimSkuOptions() {
    const simSkuEl = document.getElementById("simSku");
    if (!simSkuEl) return;
    const list =
      window.omsEngine && Array.isArray(window.omsEngine.inventory) && window.omsEngine.inventory.length > 0
        ? window.omsEngine.inventory
        : window.INITIAL_INVENTORY || [];
    if (list.length === 0) return;

    const prevVal = simSkuEl.value;
    const groups = new Map();
    list.forEach((item) => {
      const cat = String(item.category || "Khác").trim();
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    });

    const htmlParts = [];
    groups.forEach((items, cat) => {
      const opts = items
        .map(
          (it) =>
            `<option value="${this.escapeLogHtml(it.sku)}">${this.escapeLogHtml(it.sku)} — ${this.escapeLogHtml(it.name)}</option>`
        )
        .join("");
      htmlParts.push(`<optgroup label="${this.escapeLogHtml(cat)} (${items.length} mã)">${opts}</optgroup>`);
    });

    simSkuEl.innerHTML = htmlParts.join("");
    if (prevVal && list.some((it) => it.sku === prevVal)) {
      simSkuEl.value = prevVal;
    } else if (list[0]) {
      simSkuEl.value = list[0].sku;
    }
  },

  getSkuPrefixForCategory(categoryName) {
    const norm = String(categoryName || "").trim().toLowerCase();
    if (norm === "áo" || norm.startsWith("áo ")) return "SP-AO";
    if (norm === "quần" || norm.startsWith("quần ")) return "SP-QUAN";
    if (norm.includes("váy") || norm.includes("đầm")) return "SP-DAM";
    if (norm.includes("giày") || norm.includes("dép")) return "SP-GIAY";
    if (norm.includes("phụ kiện")) return "SP-PK";
    return "SP-MOI";
  },

  getNextSuggestedSkuAndBatch(categoryName) {
    const list =
      window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : window.INITIAL_INVENTORY || [];
    const existingSkus = new Set(list.map((i) => String(i.sku || "").trim().toUpperCase()));
    const existingBatches = new Set();
    list.forEach((i) => {
      (i.batches || []).forEach((b) => {
        if (b && b.batchCode) existingBatches.add(String(b.batchCode).trim().toUpperCase());
      });
    });

    const prefix = this.getSkuPrefixForCategory(categoryName);
    const year = new Date().getFullYear();
    let seq = list.length + 1;
    let suggestedSku = `${prefix}-${String(seq).padStart(2, "0")}`;
    while (existingSkus.has(suggestedSku)) {
      seq += 1;
      suggestedSku = `${prefix}-${String(seq).padStart(2, "0")}`;
    }

    let bSeq = seq;
    let suggestedBatch = `LO-${year}-M${String(bSeq).padStart(2, "0")}`;
    while (existingBatches.has(suggestedBatch)) {
      bSeq += 1;
      suggestedBatch = `LO-${year}-M${String(bSeq).padStart(2, "0")}`;
    }

    return { suggestedSku, suggestedBatch };
  },

  getSuggestedMetaForCategory(categoryName) {
    const list =
      window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : window.INITIAL_INVENTORY || [];
    const normTarget = String(categoryName || "").trim().toLowerCase();
    const matched = list.filter((i) => String(i.category || "").trim().toLowerCase() === normTarget);

    let unit = "Cái";
    let price = 250000;
    if (matched.length > 0) {
      const unitCounts = {};
      let sumPrice = 0;
      matched.forEach((it) => {
        const u = String(it.unit || "Cái").trim();
        unitCounts[u] = (unitCounts[u] || 0) + 1;
        sumPrice += Number(it.price || 0);
      });
      unit = Object.entries(unitCounts).sort((a, b) => b[1] - a[1])[0][0];
      price = Math.max(1000, Math.round(sumPrice / matched.length / 1000) * 1000);
    } else if (normTarget.includes("giày") || normTarget.includes("dép")) {
      unit = "Đôi";
      price = 450000;
    } else if (normTarget.includes("phụ kiện")) {
      unit = "Chiếc";
      price = 180000;
    } else if (normTarget.includes("bộ") || normTarget.includes("set")) {
      unit = "Bộ";
      price = 380000;
    }

    const namePlaceholderMap = {
      "áo": "VD: Áo Polo Thể Thao Thoáng Khí (Xanh Navy - Size L)",
      "quần": "VD: Quần Kaki Ống Suông Công Sở (Xám - Size 31)",
      "váy & đầm": "VD: Đầm Suông Cổ Vuông Thanh Lịch (Be - Size M)",
      "giày & dép": "VD: Giày Thể Thao Đế Êm Nhẹ (Trắng - Size 41)",
      "phụ kiện thời trang": "VD: Ví Da Gấp Gọn Cao Cấp (Đen)"
    };
    const namePlaceholder = namePlaceholderMap[normTarget] || "Nhập tên sản phẩm chi tiết...";

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);
    const pad = (n) => String(n).padStart(2, "0");
    const expiryIso = `${expDate.getFullYear()}-${pad(expDate.getMonth() + 1)}-${pad(expDate.getDate())}`;

    return { unit, price, qty: 20, expiryIso, namePlaceholder };
  },

  markNewProductFieldManual(inputEl, toUpper = false) {
    if (!inputEl) return;
    if (inputEl.dataset) inputEl.dataset.manual = "1";
    if (toUpper && typeof inputEl.value === "string") {
      inputEl.value = inputEl.value.toUpperCase();
    }
  },

  showNewProductFeedback(message, tone = "is-success") {
    const fb = document.getElementById("invNewProdFeedback");
    if (!fb) return;
    if (!message) {
      fb.classList.add("hidden");
      fb.classList.remove("is-success", "is-error");
      fb.innerText = "";
      return;
    }
    fb.classList.remove("hidden", "is-success", "is-error");
    fb.classList.add(tone);
    fb.innerText = String(message);
  },

  toggleNewProductDrawer(forceOpen) {
    this.invNewProductDrawerOpen = typeof forceOpen === "boolean" ? forceOpen : !this.invNewProductDrawerOpen;
    const drawer = document.getElementById("invNewProductDrawer");
    const btn = document.getElementById("btnToggleNewProductDrawer");
    if (drawer) drawer.classList.toggle("hidden", !this.invNewProductDrawerOpen);
    if (btn) {
      btn.setAttribute("aria-expanded", this.invNewProductDrawerOpen ? "true" : "false");
      btn.classList.toggle("is-open", this.invNewProductDrawerOpen);
    }
    if (this.invNewProductDrawerOpen) {
      this.syncInventoryCategoryControls();
      this.showNewProductFeedback("");
    }
  },

  applyNewProductCategorySuggestion(categoryName, updateCategoryInput = true) {
    const cleanCat = String(categoryName || "").trim();
    if (!cleanCat) return;

    this.invNewProdActiveSuggestCat = cleanCat;
    this.syncInventoryCategoryControls();
    this.showNewProductFeedback("");

    const catEl = document.getElementById("invNewProdCategory");
    const skuEl = document.getElementById("invNewProdSku");
    const nameEl = document.getElementById("invNewProdName");
    const unitEl = document.getElementById("invNewProdUnit");
    const priceEl = document.getElementById("invNewProdPrice");
    const qtyEl = document.getElementById("invNewProdQty");
    const batchEl = document.getElementById("invNewProdBatch");
    const expEl = document.getElementById("invNewProdExpiry");

    const { suggestedSku, suggestedBatch } = this.getNextSuggestedSkuAndBatch(cleanCat);
    const meta = this.getSuggestedMetaForCategory(cleanCat);

    const setAuto = (el, val) => {
      if (!el) return;
      if (el.dataset && el.dataset.manual === "1") return;
      el.value = String(val);
    };

    if (updateCategoryInput && catEl) {
      catEl.value = cleanCat;
      if (catEl.dataset) delete catEl.dataset.manual;
    }
    setAuto(skuEl, suggestedSku);
    setAuto(unitEl, meta.unit);
    setAuto(priceEl, meta.price);
    setAuto(qtyEl, meta.qty);
    setAuto(batchEl, suggestedBatch);
    setAuto(expEl, meta.expiryIso);
    if (nameEl) {
      nameEl.placeholder = meta.namePlaceholder;
    }
  },

  onNewProductCategoryInput(inputEl) {
    if (!inputEl) return;
    const raw = String(inputEl.value || "").trim();
    const cats = this.getInventoryUniqueCategories();
    const matched = cats.find((c) => c.toLowerCase() === raw.toLowerCase());
    if (matched) {
      this.applyNewProductCategorySuggestion(matched, false);
      return;
    }
    this.invNewProdActiveSuggestCat = "";
    this.syncInventoryCategoryControls();
    if (raw) {
      const { suggestedSku, suggestedBatch } = this.getNextSuggestedSkuAndBatch(raw);
      const meta = this.getSuggestedMetaForCategory(raw);
      const setAuto = (id, val) => {
        const el = document.getElementById(id);
        if (!el || (el.dataset && el.dataset.manual === "1")) return;
        el.value = String(val);
      };
      setAuto("invNewProdSku", suggestedSku);
      setAuto("invNewProdUnit", meta.unit);
      setAuto("invNewProdPrice", meta.price);
      setAuto("invNewProdQty", meta.qty);
      setAuto("invNewProdBatch", suggestedBatch);
      setAuto("invNewProdExpiry", meta.expiryIso);
    }
  },

  fillRandomNewProductForm() {
    const existingCats = this.getInventoryUniqueCategories();
    const fallbackCats = ["Áo", "Quần", "Váy & Đầm", "Giày & Dép", "Phụ kiện thời trang"];
    const catPool = existingCats.length > 0 ? existingCats : fallbackCats;
    const prevCat = this.invNewProdActiveSuggestCat || "";
    const variedPool = catPool.length > 1 ? catPool.filter((c) => c !== prevCat) : catPool;
    const chosenCat = variedPool[Math.floor(Math.random() * variedPool.length)];
    const normCat = chosenCat.toLowerCase();

    const sampleNamesByCat = {
      "áo": [
        "Áo Polo Thể Thao Thoáng Khí (Xanh Navy - Size L)",
        "Áo Sơ Mi Linen Cổ Trụ Thoải Mái (Trắng Kem - Size M)",
        "Áo Thun Cổ Tim Cotton Mềm Mịn (Xám Tiêu - Size L)",
        "Áo Khoác Cardigan Len Mỏng Thu Đông (Be Nhạt - Size M)",
        "Áo Sweater Nỉ Da Cá Trơn Basic (Xanh Rêu - Size XL)"
      ],
      "quần": [
        "Quần Kaki Ống Suông Công Sở (Xám Ghi - Size 31)",
        "Quần Jeans Ống Đứng Wash Nhẹ (Xanh Nhạt - Size 30)",
        "Quần Short Kaki Lưng Thun Mùa Hè (Be - Size L)",
        "Quần Tây Nữ Lưng Cao Tôn Dáng (Đen - Size M)",
        "Quần Jogger Kaki Túi Hộp Năng Động (Xanh Rêu - Size 32)"
      ],
      "váy & đầm": [
        "Đầm Suông Cổ Vuông Thanh Lịch (Be Kem - Size M)",
        "Chân Váy Midi Xếp Ly Lưng Cao (Nâu Cafe - Size S)",
        "Đầm Sơ Mi Dáng Dài Kèm Đai Eo (Trắng Sữa - Size M)",
        "Đầm Hoa Nhí Cổ V Tay Bồng Nhẹ (Xanh Pastel - Size S)",
        "Chân Váy Jeans Chữ A Xẻ Tà Trước (Xanh Đậm - Size M)"
      ],
      "giày & dép": [
        "Giày Thể Thao Đế Êm Siêu Nhẹ (Trắng Xám - Size 41)",
        "Giày Búp Bê Da Mềm Mũi Vuông (Kem - Size 37)",
        "Dép Sandal Quai Dán Thể Thao (Đen - Size 42)",
        "Giày Slip-on Vải Canvas Dễ Phối (Xanh Navy - Size 40)",
        "Giày Cao Gót Đế Vuông 4cm Công Sở (Đen Bóng - Size 38)"
      ],
      "phụ kiện thời trang": [
        "Ví Da Gấp Gọn Nhiều Ngăn Tiện Lợi (Nâu Bò)",
        "Mũ Bucket Vải Dù Chống Nắng 2 Mặt (Đen)",
        "Khăn Lụa Vuông Họa Tiết Cổ Điển (Kem Vàng)",
        "Túi Tote Vải Canvas Dày Dặn Có Khóa (Trắng Ngà)",
        "Vòng Cổ Dây Mảnh Mặt Tròn Thanh Lịch (Bạc Sáng)"
      ]
    };

    const priceRangeByCat = {
      "áo": [18, 45],
      "quần": [28, 65],
      "váy & đầm": [32, 78],
      "giày & dép": [22, 89],
      "phụ kiện thời trang": [9, 35]
    };

    const existingInv =
      window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : window.INITIAL_INVENTORY || [];
    const existingNames = new Set(existingInv.map((i) => String(i.name || "").trim().toLowerCase()));

    const poolNames = sampleNamesByCat[normCat] || [
      `${chosenCat} Phiên Bản Mới Tiêu Chuẩn (Đen - Size L)`,
      `${chosenCat} Cao Cấp Mùa Thu Đông (Trắng Kem - Size M)`,
      `${chosenCat} Thiết Kế Tối Giản (Xanh Navy - Size M)`
    ];
    const freshNames = poolNames.filter((n) => !existingNames.has(n.toLowerCase()));
    let chosenName =
      freshNames.length > 0
        ? freshNames[Math.floor(Math.random() * freshNames.length)]
        : `${poolNames[Math.floor(Math.random() * poolNames.length)]} — Mẫu ${existingInv.length + 1}`;

    const { suggestedSku, suggestedBatch } = this.getNextSuggestedSkuAndBatch(chosenCat);
    const meta = this.getSuggestedMetaForCategory(chosenCat);
    const [minTenK, maxTenK] = priceRangeByCat[normCat] || [18, 55];
    const randomPrice = (minTenK + Math.floor(Math.random() * (maxTenK - minTenK + 1))) * 10000;
    const randomQty = 10 + Math.floor(Math.random() * 41);

    const expDate = new Date();
    const addMonths = 12 + Math.floor(Math.random() * 7);
    expDate.setMonth(expDate.getMonth() + addMonths);
    const pad = (n) => String(n).padStart(2, "0");
    const randomExpiry = `${expDate.getFullYear()}-${pad(expDate.getMonth() + 1)}-${pad(expDate.getDate())}`;

    this.invNewProdActiveSuggestCat = chosenCat;
    this.syncInventoryCategoryControls();
    this.showNewProductFeedback("");

    const fieldValues = {
      invNewProdCategory: chosenCat,
      invNewProdSku: suggestedSku,
      invNewProdName: chosenName,
      invNewProdUnit: meta.unit,
      invNewProdPrice: String(randomPrice),
      invNewProdQty: String(randomQty),
      invNewProdBatch: suggestedBatch,
      invNewProdExpiry: randomExpiry
    };

    Object.entries(fieldValues).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = val;
      if (el.dataset) delete el.dataset.manual;
    });
  },

  clearNewProductFormManual() {
    this.invNewProdActiveSuggestCat = "";
    this.syncInventoryCategoryControls();
    this.showNewProductFeedback("");

    const fieldIds = [
      "invNewProdCategory",
      "invNewProdSku",
      "invNewProdName",
      "invNewProdUnit",
      "invNewProdPrice",
      "invNewProdQty",
      "invNewProdBatch",
      "invNewProdExpiry"
    ];
    fieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = "";
      if (el.dataset) delete el.dataset.manual;
    });
    const nameEl = document.getElementById("invNewProdName");
    if (nameEl) nameEl.placeholder = "Nhập tên sản phẩm chi tiết...";
    const catEl = document.getElementById("invNewProdCategory");
    if (catEl && typeof catEl.focus === "function") catEl.focus();
  },

  submitNewInventoryProduct() {
    if (!window.omsEngine || typeof window.omsEngine.addNewInventoryProduct !== "function") return;

    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    };

    const category = getVal("invNewProdCategory");
    const sku = getVal("invNewProdSku").toUpperCase();
    const name = getVal("invNewProdName");
    const unit = getVal("invNewProdUnit");
    const price = Number(getVal("invNewProdPrice"));
    const initialQty = parseInt(getVal("invNewProdQty"), 10);
    const batchCode = getVal("invNewProdBatch").toUpperCase();
    const expiryDate = getVal("invNewProdExpiry");

    if (!category || !sku || !name || !unit || !batchCode) {
      this.showNewProductFeedback("Vui lòng điền đầy đủ Danh mục, Mã sản phẩm, Tên sản phẩm, Đơn vị tính và Mã lô đầu tiên.", "is-error");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      this.showNewProductFeedback("Đơn giá sản phẩm phải là số dương lớn hơn 0 VND.", "is-error");
      return;
    }
    if (!Number.isFinite(initialQty) || initialQty < 1) {
      this.showNewProductFeedback("Số lượng nhập đầu phải lớn hơn hoặc bằng 1.", "is-error");
      return;
    }

    const beforeInv = window.omsEngine.inventory || [];
    const beforeSkuCount = beforeInv.length;
    const beforeCatCount = new Set(beforeInv.map((i) => i.category)).size;
    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();

    const res = window.omsEngine.addNewInventoryProduct({
      sku,
      name,
      category,
      unit,
      price,
      initialQty,
      batchCode,
      expiryDate
    });

    if (!res || !res.success) {
      this.showNewProductFeedback((res && res.error) || "Không thể thêm sản phẩm mới. Vui lòng kiểm tra lại thông tin.", "is-error");
      return;
    }

    const afterInv = window.omsEngine.inventory || [];
    const afterSkuCount = afterInv.length;
    const afterCatCount = new Set(afterInv.map((i) => i.category)).size;

    const rec = window.omsEngine.recordReversibleAction({
      actionType: "ADD_PRODUCT",
      actionLabel: "Thêm sản phẩm mới",
      targetCode: res.item.sku,
      beforeSummary: `${beforeSkuCount} mặt hàng · ${beforeCatCount} danh mục`,
      afterSummary: `${afterSkuCount} mặt hàng · ${afterCatCount} danh mục (+${res.item.sku})`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

    // Đặt bộ lọc an toàn và chuyển tới trang có sản phẩm vừa thêm để thấy ngay
    this.invCategoryFilter = "ALL";
    this.invStatusFilter = "ALL";
    this.invSearchQuery = "";
    this.activeInvCard = "ALL";
    const pageSize = Math.max(1, Number(this.invPageSize) || 10);
    this.currentInvPage = Math.max(1, Math.ceil(afterSkuCount / pageSize));

    const searchEl = document.getElementById("invSearchInput");
    if (searchEl) searchEl.value = "";
    const statusEl = document.getElementById("invStatusFilter");
    if (statusEl) statusEl.value = "ALL";

    this.triggerChannelSyncAnimation();
    this.renderAll();

    this.clearNewProductFormManual();
    this.showNewProductFeedback(
      `Đã thêm sản phẩm ${res.item.sku} — ${res.item.name} (${res.item.physicalStock} ${res.item.unit} · ${res.item.price.toLocaleString("vi-VN")} VND) vào kho.`,
      "is-success"
    );
  },

  formatBatchExpiryDate(dateStr) {
    if (!dateStr) return "-";
    const clean = String(dateStr)
      .trim()
      .replace(/[T\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i, "")
      .trim();
    const ymd = clean.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
    if (ymd) {
      return `${String(ymd[3]).padStart(2, "0")}.${String(ymd[2]).padStart(2, "0")}.${ymd[1]}`;
    }
    const dmy = clean.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (dmy) {
      return `${String(dmy[1]).padStart(2, "0")}.${String(dmy[2]).padStart(2, "0")}.${dmy[3]}`;
    }
    return clean;
  },

  setRestockPresetQty(qty, btnEl) {
    const input = document.getElementById("invRestockQtyInput");
    if (input) {
      input.value = String(qty);
      if (typeof input.focus === "function") input.focus();
    }
    const seg = document.getElementById("invRestockPresetSeg");
    if (seg && typeof seg.querySelectorAll === "function") {
      seg.querySelectorAll(".settings-seg-btn").forEach((b) => {
        const isAct = b === btnEl || b.getAttribute("data-preset-qty") === String(qty);
        b.classList.toggle("active", isAct);
        b.setAttribute("aria-pressed", isAct ? "true" : "false");
      });
    }
  },

  openRestockPopover(sku, btnEl, ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    const popEl = document.getElementById("invRestockPopover");
    if (!popEl || !window.omsEngine) return;

    const effectiveInv =
      typeof this.getEffectiveInventoryAtNow === "function"
        ? this.getEffectiveInventoryAtNow(window.omsEngine.inventory || [])
        : window.omsEngine.inventory || [];
    const item = effectiveInv.find((i) => i.sku === sku) || window.omsEngine.inventory.find((i) => i.sku === sku);
    if (!item) return;

    const unit = item.unit || "SP";
    const phys = item.effectivePhysicalStock ?? item.physicalStock ?? 0;
    const avail = item.effectiveAvailableStock ?? item.availableStock ?? 0;
    const resv = item.effectiveReservedStock ?? item.reservedStock ?? 0;
    const chMap = item.effectiveChannelReserved || item.channelReserved || {};
    const channelNameMap = {
      SHOPEE: "Shopee",
      TIKTOK: "TikTok Shop",
      LAZADA: "Lazada",
      POS: "Cửa hàng POS",
      FACEBOOK: "Facebook"
    };
    const channelHoldItems = Object.entries(chMap)
      .filter(([, count]) => Number(count || 0) > 0)
      .map(
        ([ch, count]) =>
          `<span class="inv-hold-channel-badge">${channelNameMap[ch] || ch}: ${count}</span>`
      );
    const channelBreakdownHtml =
      resv > 0 && channelHoldItems.length > 0
        ? `
          <div class="inv-restock-channels-box">
            <div class="inv-restock-channels-title">Phân bổ giữ hàng theo kênh</div>
            <div class="inv-holds-wrap">${channelHoldItems.join("")}</div>
          </div>
        `
        : "";

    const unitPriceFormatted = Number(item.price || 0).toLocaleString("vi-VN") + " VND";
    const reversedBatches = [...(item.batches || [])].reverse();
    const batchRowsHtml = reversedBatches
      .map((b, idx) => {
        const expStr = this.formatBatchExpiryDate(b.expiryDate || b.importDate);
        const isLatestRestock = idx === 0 && String(b.batchCode || "").startsWith("LO-BOSUNG");
        const rowCls = isLatestRestock ? "restock-batch-new-row" : "";
        const newBadge = isLatestRestock
          ? ` <span class="restock-batch-new-badge">Mới</span>`
          : "";
        return `
          <tr class="${rowCls}">
            <td class="col-batch-code"><strong>${b.batchCode}</strong>${newBadge}</td>
            <td class="col-batch-exp">${expStr}</td>
            <td class="col-batch-qty">${b.remainingQty} / ${b.initialQty} ${unit}</td>
          </tr>
        `;
      })
      .join("");

    popEl.innerHTML = `
      <div class="modal-dialog odoms-flat-modal odoms-flat-modal-md inv-restock-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="invRestockModalTitle" onclick="event.stopPropagation()">
        <div class="odoms-modal-header">
          <div class="odoms-modal-title-group">
            <h3 id="invRestockModalTitle" class="odoms-modal-title">Chi tiết mặt hàng &amp; nhập kho</h3>
            <p class="odoms-modal-subtitle">${item.name}</p>
          </div>
          <button type="button" class="odoms-modal-close-btn" onclick="AppUI.closeRestockPopover()" title="Đóng hộp thoại" aria-label="Đóng hộp thoại">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="odoms-modal-body">
          <div class="inv-restock-meta-row">
            <span>Mã sản phẩm: <code class="odoms-username-code">${item.sku}</code></span>
            <span class="inv-restock-price">Đơn giá: <strong>${unitPriceFormatted}</strong></span>
          </div>

          <div class="inv-restock-summary-grid">
            <div class="inv-restock-summary-cell">
              <span class="inv-restock-summary-label">Sẵn sàng bán</span>
              <span class="inv-restock-summary-val ${avail === 0 ? "is-zero" : "is-avail"}">${avail} ${unit}</span>
            </div>
            <div class="inv-restock-summary-cell">
              <span class="inv-restock-summary-label">Hàng chờ đóng gói</span>
              <span class="inv-restock-summary-val">${resv} ${unit}</span>
            </div>
            <div class="inv-restock-summary-cell">
              <span class="inv-restock-summary-label">Tồn kho thực tế</span>
              <span class="inv-restock-summary-val">${phys} ${unit}</span>
            </div>
          </div>

          ${channelBreakdownHtml}

          <div class="inv-restock-action-box">
            <label class="odoms-field-label" for="invRestockQtyInput">Nhập hàng bổ sung (${unit})</label>
            <div class="inv-restock-controls-row">
              <input type="number" id="invRestockQtyInput" class="form-control odoms-ctrl-34 inv-restock-qty-input" min="1" max="1000" value="10" />
              <div id="invRestockPresetSeg" class="settings-segmented-control inv-restock-preset-seg" role="group" aria-label="Chọn nhanh số lượng nhập">
                <button type="button" class="settings-seg-btn settings-seg-text-btn" data-preset-qty="5" aria-pressed="false" onclick="AppUI.setRestockPresetQty(5, this)">+5</button>
                <button type="button" class="settings-seg-btn settings-seg-text-btn active" data-preset-qty="10" aria-pressed="true" onclick="AppUI.setRestockPresetQty(10, this)">+10</button>
                <button type="button" class="settings-seg-btn settings-seg-text-btn" data-preset-qty="20" aria-pressed="false" onclick="AppUI.setRestockPresetQty(20, this)">+20</button>
              </div>
              <button type="button" class="btn btn-primary odoms-btn-34 inv-restock-submit-btn" onclick="AppUI.submitRestockPopover('${item.sku}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nhập hàng
              </button>
            </div>
          </div>

          <div class="inv-batch-section">
            <div class="inv-batch-head">
              <span class="inv-batch-title">Danh sách lô hàng &amp; hạn sử dụng</span>
              <span class="inv-batch-total">Tổng: ${reversedBatches.length} lô</span>
            </div>
            <div id="invBatchListScroll" class="odoms-table-scroll inv-batch-scroll">
              <table class="wms-table odoms-flat-table inv-batch-table">
                <thead>
                  <tr>
                    <th class="col-batch-code">Lô hàng</th>
                    <th class="col-batch-exp">Hạn sử dụng</th>
                    <th class="col-batch-qty">Còn lại</th>
                  </tr>
                </thead>
                <tbody>
                  ${batchRowsHtml || `<tr class="odoms-empty-row"><td colspan="3"><div class="odoms-empty-state">Chưa có lô hàng</div></td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="odoms-modal-footer">
          <button type="button" class="btn btn-outline odoms-btn-34" onclick="AppUI.closeRestockPopover()">Đóng</button>
        </div>
      </div>
    `;

    popEl.style.left = "";
    popEl.style.top = "";
    popEl.classList.remove("hidden");
    popEl.classList.add("open");

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
    if (popEl) {
      popEl.classList.add("hidden");
      popEl.classList.remove("open");
    }
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
          msgBox.classList.remove("hidden", "is-success", "is-error", "is-warning");
          msgBox.style.background = "";
          msgBox.style.color = "";
          msgBox.style.border = "";
          msgBox.classList.add("is-error");
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
      msgBox.classList.remove("hidden", "is-success", "is-error", "is-warning");
      msgBox.style.background = "";
      msgBox.style.color = "";
      msgBox.style.border = "";
      msgBox.classList.add(res.success ? "is-success" : "is-error");
      msgBox.innerText = res.message;
    }

    if (res.success) {
      document.getElementById("addNewUserForm").reset();
      if (customRoleWrap) customRoleWrap.classList.add("hidden");
      window.omsEngine.addLog("success", `[NHÂN SỰ ODOMS] ${res.message}`);
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
      alert("Tài khoản Quản trị hệ thống được bảo vệ và không thể xóa!");
      return;
    }
    if (isCurrent) {
      alert("Không thể xóa tài khoản đang đăng nhập trong phiên làm việc hiện tại!");
      return;
    }

    this.pendingDeleteUsername = u.username;
    const infoEl = document.getElementById("deleteTargetUserInfo");
    if (infoEl) {
      infoEl.textContent = `${u.fullName} (@${u.username}) - ${this.normalizeStaffRoleDisplay(u.role)}`;
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

    const normalizedDept = this.normalizeStaffDeptDisplay(u.department);
    const normalizedRole = this.normalizeStaffRoleDisplay(u.role);

    document.getElementById("editOriginalUsername").value = u.username;
    document.getElementById("editFullName").value = u.fullName || "";
    document.getElementById("editUsername").value = u.username || "";
    document.getElementById("editPassword").value = u.password || "";
    document.getElementById("editDepartment").value = normalizedDept;
    document.getElementById("editShift").value = u.shift || "Ca Hành chính (08:00 - 17:00)";

    const standardRoles = [
      "Chuyên viên Điều phối",
      "Chuyên viên Vận hành",
      "Quản lý kho",
      "Chuyên viên CSKH",
      "Chuyên viên Đổi trả",
      "Kế toán"
    ];

    const roleSelect = document.getElementById("editRole");
    const customWrap = document.getElementById("editCustomRoleWrap");
    const customInput = document.getElementById("editCustomRoleInput");

    if (standardRoles.includes(normalizedRole)) {
      roleSelect.value = normalizedRole;
      if (customWrap) customWrap.style.display = "none";
      if (customInput) customInput.value = "";
    } else {
      roleSelect.value = "Khác";
      if (customWrap) customWrap.style.display = "block";
      if (customInput) customInput.value = normalizedRole || "";
    }

    // Nếu là Root Super Admin thì khóa không cho sửa username
    const isRoot = u.username.toLowerCase() === "dttd" || u.username.toLowerCase() === "lhmt" || u.isRoot;
    const usernameInput = document.getElementById("editUsername");
    if (usernameInput) {
      usernameInput.readOnly = isRoot;
      usernameInput.title = isRoot ? "Không được đổi tên đăng nhập tài khoản Quản trị hệ thống" : "";
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
      role: this.normalizeStaffRoleDisplay(finalRole),
      department: this.normalizeStaffDeptDisplay(department || "Phòng Vận hành Đa kênh"),
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
        alert("Tài khoản Quản trị hệ thống không thể tạm khóa!");
        return;
      }
      if (isCurrent) {
        alert("Không thể tạm khóa tài khoản đang trong phiên làm việc hiện tại!");
        return;
      }

      this.pendingSuspendUsername = u.username;
      const targetInfoEl = document.getElementById("suspendTargetUserInfo");
      if (targetInfoEl) {
        targetInfoEl.innerHTML = `<strong>${u.fullName}</strong> <code class="odoms-username-code">${u.username}</code> &middot; ${this.normalizeStaffRoleDisplay(u.role)} &middot; <span class="odoms-muted-inline">${this.normalizeStaffDeptDisplay(u.department || 'Phòng ban')}</span>`;
      }
      const untilInput = document.getElementById("suspendUntilInput");
      if (untilInput) untilInput.value = "Cho đến khi mở lại";
      const reasonInput = document.getElementById("suspendReasonInput");
      if (reasonInput) reasonInput.value = "";

      const modal = document.getElementById("userSuspendModal");
      if (modal) modal.classList.add("open");
    } else {
      if (confirm(`Xác nhận mở khóa và kích hoạt lại tài khoản [${u.username}] sang trạng thái Đang hoạt động?`)) {
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
    this.renderKPIsAndBadges();
    if (typeof this.renderDashboardP2 === "function") {
      this.renderDashboardP2();
    }
    this.renderCharts();
    if (typeof this.renderRevenueAnalyticsView === "function") {
      this.renderRevenueAnalyticsView();
    } else {
      this.renderOneMonthRevenueOverview();
      this.renderUnifiedTop3ChannelRankingChart();
      this.renderFiveChannelSoldPieChart();
    }
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

  // ============================================================================
  // PHÂN HỆ DOANH THU & PHÂN TÍCH — 100% DỮ LIỆU THỰC <= Date.now() (v38)
  // ============================================================================
  formatRevPercentVi(pct) {
    const num = Number.isFinite(pct) ? pct : 0;
    return num.toFixed(1).replace(".", ",");
  },

  formatRevTimestampDisplay(dtObj) {
    const d = dtObj instanceof Date && !isNaN(dtObj.getTime()) ? dtObj : new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `Cập nhật: ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  },

  getRevenueChannelMetaMap() {
    const isDark = this.currentTheme === "dark";
    if (isDark) {
      return {
        SHOPEE: { key: "SHOPEE", name: "Shopee", fullName: "Shopee Mall", color: "#2563EB", badge: "badge-SHOPEE" },
        TIKTOK: { key: "TIKTOK", name: "TikTok Shop", fullName: "TikTok Shop", color: "#6366F1", badge: "badge-TIKTOK" },
        LAZADA: { key: "LAZADA", name: "Lazada", fullName: "Lazada Mall", color: "#0284C7", badge: "badge-LAZADA" },
        FACEBOOK: { key: "FACEBOOK", name: "Facebook", fullName: "Facebook Shop", color: "#475569", badge: "badge-FACEBOOK" },
        POS: { key: "POS", name: "Cửa hàng POS", fullName: "Cửa hàng tại quầy", color: "#7C3AED", badge: "badge-POS" }
      };
    }
    return {
      SHOPEE: { key: "SHOPEE", name: "Shopee", fullName: "Shopee Mall", color: "#1877FF", badge: "badge-SHOPEE" },
      TIKTOK: { key: "TIKTOK", name: "TikTok Shop", fullName: "TikTok Shop", color: "#465AFF", badge: "badge-TIKTOK" },
      LAZADA: { key: "LAZADA", name: "Lazada", fullName: "Lazada Mall", color: "#0284C7", badge: "badge-LAZADA" },
      FACEBOOK: { key: "FACEBOOK", name: "Facebook", fullName: "Facebook Shop", color: "#64748B", badge: "badge-FACEBOOK" },
      POS: { key: "POS", name: "Cửa hàng POS", fullName: "Cửa hàng tại quầy", color: "#7C3AED", badge: "badge-POS" }
    };
  },

  classifyRevOrder(ord) {
    const isCancelled = Boolean(
      ord && (ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED")
    );
    const isExported = Boolean(ord && ord.status === "ALLOCATED" && ord.platformStatus !== "CANCELLED");
    const isBackorder = Boolean(ord && ord.status === "BACKORDER");
    const isPending = !isCancelled && !isExported && !isBackorder;
    const revenue = isExported ? (Number(ord.quantity) || 0) * (Number(ord.unitPrice) || 0) : 0;
    return { isExported, isCancelled, isBackorder, isPending, revenue };
  },

  // Tập dữ liệu theo tháng 100% từ đơn hàng thực tế hợp lệ (<= Date.now()), xóa sạch baseMonths ảo
  getMonthlyHistoricalDataset() {
    const liveOrders =
      typeof this.getValidOrdersUpToNow === "function"
        ? this.getValidOrdersUpToNow()
        : window.omsEngine
        ? window.omsEngine.orders
        : [];

    const nowDt = new Date(Date.now());
    const pad = (n) => String(n).padStart(2, "0");
    const nowY = nowDt.getFullYear();
    const nowM = nowDt.getMonth() + 1;
    const nowD = nowDt.getDate();
    const currentMonthKey = `${nowY}-${pad(nowM)}`;

    let minY = nowY;
    let minM = nowM;
    liveOrders.forEach((o) => {
      const ts = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(o) : Number(o.timestampMs) || 0;
      if (ts > 0) {
        const d = new Date(ts);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        if (y < minY || (y === minY && m < minM)) {
          minY = y;
          minM = m;
        }
      }
    });

    const channelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
    const monthsMap = {};
    let cy = minY;
    let cm = minM;
    while (cy < nowY || (cy === nowY && cm <= nowM)) {
      const mk = `${cy}-${pad(cm)}`;
      const isCurMonth = mk === currentMonthKey;
      const lastDay = isCurMonth ? nowD : new Date(cy, cm, 0).getDate();
      const chObj = {};
      channelKeys.forEach((k) => {
        chObj[k] = { orders: 0, received: 0, exported: 0, backorder: 0, cancelled: 0, pending: 0, revenue: 0 };
      });
      monthsMap[mk] = {
        key: mk,
        year: cy,
        month: cm,
        label: isCurMonth ? `Tháng ${pad(cm)}/${cy} (đến ${pad(nowD)}/${pad(nowM)})` : `Tháng ${pad(cm)}/${cy}`,
        shortLabel: `${pad(cm)}/${cy}`,
        startDate: `${cy}-${pad(cm)}-01`,
        endDate: `${cy}-${pad(cm)}-${pad(lastDay)}`,
        received: 0,
        exported: 0,
        backorder: 0,
        cancelled: 0,
        pending: 0,
        revenue: 0,
        channels: chObj
      };
      cm += 1;
      if (cm > 12) {
        cm = 1;
        cy += 1;
      }
    }

    liveOrders.forEach((o) => {
      const ts = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(o) : Number(o.timestampMs) || 0;
      const d = ts > 0 ? new Date(ts) : nowDt;
      const mk = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const bucket = monthsMap[mk];
      if (!bucket) return;

      const chKey = String(o.channel || "SHOPEE").trim().toUpperCase();
      const cls = this.classifyRevOrder(o);

      bucket.received += 1;
      if (cls.isExported) bucket.exported += 1;
      if (cls.isBackorder) bucket.backorder += 1;
      if (cls.isCancelled) bucket.cancelled += 1;
      if (cls.isPending) bucket.pending += 1;
      bucket.revenue += cls.revenue;

      const chBucket = bucket.channels[chKey];
      if (chBucket) {
        chBucket.received += 1;
        if (cls.isExported) {
          chBucket.exported += 1;
          chBucket.orders += 1;
        }
        if (cls.isBackorder) chBucket.backorder += 1;
        if (cls.isCancelled) chBucket.cancelled += 1;
        if (cls.isPending) chBucket.pending += 1;
        chBucket.revenue += cls.revenue;
      }
    });

    return monthsMap;
  },

  syncRevenueFilterOptions() {
    const allMonths = this.getMonthlyHistoricalDataset();
    const orderedKeys = Object.keys(allMonths).sort();
    const descKeys = [...orderedKeys].reverse();
    const nowDt = new Date(Date.now());
    const pad = (n) => String(n).padStart(2, "0");
    const todayStr = `${nowDt.getFullYear()}-${pad(nowDt.getMonth() + 1)}-${pad(nowDt.getDate())}`;
    const todayVn = `${pad(nowDt.getDate())}/${pad(nowDt.getMonth() + 1)}/${nowDt.getFullYear()}`;
    const earliestKey = orderedKeys[0] || `${nowDt.getFullYear()}-${pad(nowDt.getMonth() + 1)}`;
    const minDateStr = `${earliestKey}-01`;

    // 1. Nhãn động tùy chọn "Tất cả thời gian (đến DD/MM/YYYY)"
    const modeEl = document.getElementById("revDonutFilterMode");
    if (modeEl && modeEl.options) {
      const allOpt = Array.from(modeEl.options).find((o) => o.value === "ALL");
      if (allOpt) {
        allOpt.text = `Tất cả thời gian (đến ${todayVn})`;
      }
    }

    // 2. Danh sách Tháng động cho Theo Tháng & Theo Tuần
    const populateMonthSelect = (selId) => {
      const sel = document.getElementById(selId);
      if (!sel) return;
      const prevVal = sel.value;
      const optsHtml = descKeys
        .map((mk) => `<option value="${mk}">${allMonths[mk].label}</option>`)
        .join("");
      if (optsHtml) {
        sel.innerHTML = optsHtml;
        if (prevVal && allMonths[prevVal]) {
          sel.value = prevVal;
        } else if (descKeys.length > 0) {
          sel.value = descKeys[0];
        }
      }
    };
    populateMonthSelect("soldPieMonthSelect");
    populateMonthSelect("revDonutWeekMonthSelect");

    // 3. Danh sách Quý động từ dữ liệu thực tế <= hiện tại
    const qSel = document.getElementById("revDonutQuarterSelect");
    if (qSel) {
      const prevQ = qSel.value;
      const quarterKeysSet = new Set();
      orderedKeys.forEach((mk) => {
        const [yStr, mStr] = mk.split("-");
        const qNum = Math.ceil(Number(mStr) / 3);
        quarterKeysSet.add(`${yStr}-Q${qNum}`);
      });
      const qKeysDesc = Array.from(quarterKeysSet).sort().reverse();
      const curQKey = `${nowDt.getFullYear()}-Q${Math.ceil((nowDt.getMonth() + 1) / 3)}`;
      qSel.innerHTML = qKeysDesc
        .map((qk) => {
          const [yStr, qPart] = qk.split("-Q");
          const qNum = Number(qPart);
          const startM = (qNum - 1) * 3 + 1;
          const endM = qNum * 3;
          const rangeText =
            qk === curQKey
              ? `Tháng ${pad(startM)} – ${todayVn}`
              : `Tháng ${pad(startM)} – Tháng ${pad(endM)}/${yStr}`;
          return `<option value="${qk}">Quý ${qNum}/${yStr} (${rangeText})</option>`;
        })
        .join("");
      if (prevQ && qKeysDesc.includes(prevQ)) {
        qSel.value = prevQ;
      } else if (qKeysDesc.length > 0) {
        qSel.value = qKeysDesc[0];
      }
    }

    // 4. Giới hạn ngày động theo mốc thời gian thực <= hôm nay (không khóa cứng 22/11/2026)
    const startInput = document.getElementById("revDonutStartDate");
    const endInput = document.getElementById("revDonutEndDate");
    if (startInput) {
      startInput.min = minDateStr;
      startInput.max = todayStr;
      if (!startInput.value || startInput.value > todayStr) {
        startInput.value = `${nowDt.getFullYear()}-${pad(nowDt.getMonth() + 1)}-01`;
      }
    }
    if (endInput) {
      endInput.min = minDateStr;
      endInput.max = todayStr;
      if (!this._revDateRangeTouched || !endInput.value || endInput.value > todayStr) {
        endInput.value = todayStr;
      }
    }

    // 5. Đồng bộ ẩn/hiện các ô con theo chế độ đang chọn
    const activeMode = modeEl ? modeEl.value : "ALL";
    const toggle = (id, show) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("hidden", !show);
    };
    toggle("revDonutMonthGroup", activeMode === "MONTH");
    toggle("revDonutQuarterGroup", activeMode === "QUARTER");
    toggle("revDonutWeekMonthGroup", activeMode === "WEEK");
    toggle("revDonutWeekGroup", activeMode === "WEEK");
    toggle("revDonutDayStartGroup", activeMode === "DAY");
    toggle("revDonutDayEndGroup", activeMode === "DAY");
  },

  getRevenueActiveFilterContext() {
    this.syncRevenueFilterOptions();

    const liveOrders =
      typeof this.getValidOrdersUpToNow === "function"
        ? this.getValidOrdersUpToNow()
        : window.omsEngine
        ? window.omsEngine.orders
        : [];
    const allMonths = this.getMonthlyHistoricalDataset();
    const orderedMonthKeys = Object.keys(allMonths).sort();
    const latestMonthKey = orderedMonthKeys[orderedMonthKeys.length - 1] || "2026-11";

    const nowMs = Date.now();
    const nowDt = new Date(nowMs);
    const pad = (n) => String(n).padStart(2, "0");
    const todayVn = `${pad(nowDt.getDate())}/${pad(nowDt.getMonth() + 1)}/${nowDt.getFullYear()}`;
    const todayIso = `${nowDt.getFullYear()}-${pad(nowDt.getMonth() + 1)}-${pad(nowDt.getDate())}`;

    const mode = document.getElementById("revDonutFilterMode")?.value || "ALL";
    let startMs = 0;
    let endMs = nowMs;
    let periodLabel = `Tất cả thời gian (đến ${todayVn})`;
    let monthKey = latestMonthKey;
    let quarterKey = `${nowDt.getFullYear()}-Q${Math.ceil((nowDt.getMonth() + 1) / 3)}`;
    let weekMonthKey = latestMonthKey;
    let weekKey = "W4";
    let startDateStr = `${nowDt.getFullYear()}-${pad(nowDt.getMonth() + 1)}-01`;
    let endDateStr = todayIso;

    if (mode === "MONTH") {
      monthKey = document.getElementById("soldPieMonthSelect")?.value || latestMonthKey;
      const mObj = allMonths[monthKey] || allMonths[latestMonthKey];
      if (mObj) {
        const lastDayOfMonth = new Date(mObj.year, mObj.month, 0).getDate();
        startMs = new Date(mObj.year, mObj.month - 1, 1, 0, 0, 0, 0).getTime();
        endMs = Math.min(nowMs, new Date(mObj.year, mObj.month - 1, lastDayOfMonth, 23, 59, 59, 999).getTime());
        periodLabel = mObj.label;
      }
    } else if (mode === "QUARTER") {
      quarterKey = document.getElementById("revDonutQuarterSelect")?.value || quarterKey;
      const [yStr, qPart] = quarterKey.split("-Q");
      const qY = Number(yStr) || nowDt.getFullYear();
      const qNum = Number(qPart) || 4;
      const startM = (qNum - 1) * 3 + 1;
      const endM = qNum * 3;
      const endLastDay = new Date(qY, endM, 0).getDate();
      startMs = new Date(qY, startM - 1, 1, 0, 0, 0, 0).getTime();
      endMs = Math.min(nowMs, new Date(qY, endM - 1, endLastDay, 23, 59, 59, 999).getTime());
      const curQKey = `${nowDt.getFullYear()}-Q${Math.ceil((nowDt.getMonth() + 1) / 3)}`;
      periodLabel =
        quarterKey === curQKey
          ? `Quý ${qNum}/${qY} (Tháng ${pad(startM)} – ${todayVn})`
          : `Quý ${qNum}/${qY} (Tháng ${pad(startM)} – Tháng ${pad(endM)}/${qY})`;
    } else if (mode === "WEEK") {
      weekMonthKey = document.getElementById("revDonutWeekMonthSelect")?.value || latestMonthKey;
      weekKey = document.getElementById("revDonutWeekSelect")?.value || "W4";
      const [yStr, mStr] = weekMonthKey.split("-");
      const wy = Number(yStr) || nowDt.getFullYear();
      const wm = Number(mStr) || nowDt.getMonth() + 1;
      const lastDay = new Date(wy, wm, 0).getDate();
      const weekRanges = {
        W1: { d1: 1, d2: 7, label: "Tuần 1 (01 – 07)" },
        W2: { d1: 8, d2: 14, label: "Tuần 2 (08 – 14)" },
        W3: { d1: 15, d2: 21, label: "Tuần 3 (15 – 21)" },
        W4: { d1: 22, d2: lastDay, label: `Tuần 4 (22 – ${pad(lastDay)})` }
      };
      const wRange = weekRanges[weekKey] || weekRanges.W4;
      startMs = new Date(wy, wm - 1, wRange.d1, 0, 0, 0, 0).getTime();
      endMs = Math.min(nowMs, new Date(wy, wm - 1, wRange.d2, 23, 59, 59, 999).getTime());
      periodLabel = `${wRange.label} · Tháng ${pad(wm)}/${wy}`;
    } else if (mode === "DAY") {
      startDateStr = document.getElementById("revDonutStartDate")?.value || startDateStr;
      endDateStr = document.getElementById("revDonutEndDate")?.value || todayIso;
      if (startDateStr > endDateStr) {
        const tmp = startDateStr;
        startDateStr = endDateStr;
        endDateStr = tmp;
      }
      const [sy, sm, sd] = startDateStr.split("-").map(Number);
      const [ey, em, ed] = endDateStr.split("-").map(Number);
      startMs = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
      endMs = Math.min(nowMs, new Date(ey, em - 1, ed, 23, 59, 59, 999).getTime());
      const fmtStart = `${pad(sd)}/${pad(sm)}/${sy}`;
      const fmtEnd = `${pad(ed)}/${pad(em)}/${ey}`;
      periodLabel = fmtStart === fmtEnd ? `Ngày ${fmtStart}` : `Từ ${fmtStart} đến ${fmtEnd}`;
    }

    const filteredOrders =
      mode === "ALL"
        ? liveOrders
        : liveOrders.filter((ord) => {
            const ts = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(ord) : Number(ord.timestampMs) || 0;
            return ts >= startMs && ts <= endMs;
          });

    const channelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];
    const byChannel = {};
    channelKeys.forEach((k) => {
      byChannel[k] = { received: 0, exported: 0, backorder: 0, cancelled: 0, pending: 0, revenue: 0 };
    });

    let totalReceived = 0;
    let totalExported = 0;
    let totalBackorder = 0;
    let totalCancelled = 0;
    let totalPending = 0;
    let totalRevenue = 0;

    filteredOrders.forEach((o) => {
      const chKey = String(o.channel || "SHOPEE").trim().toUpperCase();
      const cls = this.classifyRevOrder(o);
      totalReceived += 1;
      if (cls.isExported) totalExported += 1;
      if (cls.isBackorder) totalBackorder += 1;
      if (cls.isCancelled) totalCancelled += 1;
      if (cls.isPending) totalPending += 1;
      totalRevenue += cls.revenue;

      if (!byChannel[chKey]) {
        byChannel[chKey] = { received: 0, exported: 0, backorder: 0, cancelled: 0, pending: 0, revenue: 0 };
      }
      byChannel[chKey].received += 1;
      if (cls.isExported) byChannel[chKey].exported += 1;
      if (cls.isBackorder) byChannel[chKey].backorder += 1;
      if (cls.isCancelled) byChannel[chKey].cancelled += 1;
      if (cls.isPending) byChannel[chKey].pending += 1;
      byChannel[chKey].revenue += cls.revenue;
    });

    return {
      mode,
      periodLabel,
      startMs,
      endMs,
      orders: filteredOrders,
      allMonths,
      totalReceived,
      totalExported,
      totalBackorder,
      totalCancelled,
      totalPending,
      totalRevenue,
      byChannel,
      monthKey,
      quarterKey,
      weekMonthKey,
      weekKey,
      startDateStr,
      endDateStr
    };
  },

  onRevenueFilterChange() {
    const mode = document.getElementById("revDonutFilterMode")?.value || "ALL";
    if (mode === "DAY") {
      this._revDateRangeTouched = true;
    }
    this.renderRevenueAnalyticsView();
  },

  renderRevenueAnalyticsView() {
    if (!this.dashboardOpenedAt) {
      this.dashboardOpenedAt = new Date();
    }
    const syncEl = document.getElementById("revSyncTimestamp");
    if (syncEl) {
      const formatted = this.formatRevTimestampDisplay(this.dashboardOpenedAt);
      syncEl.innerText = formatted;
      syncEl.title = formatted;
    }

    const ctx = this.getRevenueActiveFilterContext();
    this._lastRevContext = ctx;
    this.renderFiveChannelSoldPieChart(ctx);
    this.renderUnifiedTop3ChannelRankingChart(ctx);
    this.renderMonthlyTrendsByFilter(ctx);
    if (typeof this.syncRevenueBottomTabUI === "function") {
      this.syncRevenueBottomTabUI();
    }
  },

  // 1. LÀM MỚI MỐC GIỜ & 6 THẺ DOANH THU 5 KÊNH (ĐỒNG BỘ 100% DỮ LIỆU THỰC)
  refreshOneMonthTimestamp() {
    this.dashboardOpenedAt = new Date();
    this.renderRevenueAnalyticsView();
  },

  renderOneMonthRevenueOverview(precomputedData) {
    const grid = document.getElementById("oneMonthRevenueGrid");
    const timeLabel = document.getElementById("oneMonthRollingTimeLabel");
    if (!grid) return;

    const data = precomputedData || this.getFiveChannelSoldDataset();

    if (timeLabel) {
      timeLabel.innerHTML = "";
      timeLabel.classList.add("hidden");
    }

    const metaMap = this.getRevenueChannelMetaMap();
    const chOrder = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"].map((k) => metaMap[k]);

    const totalRevenue = data.totalRevenue;
    const totalExported = data.totalOrders;
    const totalReceived = data.totalReceived ?? totalExported;
    const isAllSelected = !this.activePieChannel;

    const totalCardHtml = `
      <div class="rev-channel-card total-hero ${isAllSelected ? "silk-card-selected" : ""}" onclick="AppUI.selectPieChannel(null)" role="button" tabindex="0" title="Nhấn để xem tổng hợp cả 5 kênh">
        <div class="rev-card-head">
          <span class="rev-card-title">TỔNG DOANH THU</span>
        </div>
        <div class="rev-card-value">${totalRevenue.toLocaleString("vi-VN")} VND</div>
        <div class="rev-card-meta">
          <span><strong>${totalExported}</strong> đơn xuất</span>
          <span>${totalReceived} tiếp nhận</span>
        </div>
      </div>
    `;

    const channelsHtml = chOrder
      .map((ch) => {
        const stat = data.items.find((i) => i.key === ch.key) || { orders: 0, received: 0, revenue: 0, pctText: "0,0" };
        const isSelected = this.activePieChannel === ch.key;
        return `
        <div class="rev-channel-card ${isSelected ? "silk-card-selected" : ""}"
             onclick="AppUI.selectPieChannel('${ch.key}')"
             role="button"
             tabindex="0"
             title="Nhấn để lọc chi tiết kênh ${ch.name}">
          <div class="rev-card-head">
            <span class="rev-card-title">
              <span class="rev-ch-vbar" style="background:${ch.color};" aria-hidden="true"></span>
              <span class="rev-ch-name-text">${ch.name}</span>
            </span>
          </div>
          <div class="rev-card-value">${stat.revenue.toLocaleString("vi-VN")} VND</div>
          <div class="rev-card-meta">
            <span><strong>${stat.orders}</strong> đơn xuất</span>
            <span>${stat.pctText}%</span>
          </div>
        </div>
      `;
      })
      .join("");

    grid.innerHTML = totalCardHtml + channelsHtml;

    const resetBtn = document.getElementById("btnResetSoldPie");
    if (resetBtn) {
      resetBtn.classList.toggle("is-active-filter", Boolean(this.activePieChannel));
    }
  },

  // 2. TAB 2 THẺ GỘP: XẾP HẠNG 3 KÊNH BÁN HÀNG DẪN ĐẦU VỀ DOANH THU (100% SỐ LIỆU THỰC)
  onUnifiedRankingFilterModeChange() {
    this.renderRevenueAnalyticsView();
  },

  syncTop3RankingSelectedState() {
    const activeKey = this.activePieChannel;
    const cols = document.querySelectorAll("#unifiedTop3RankingBarContainer .bar-col-item");
    cols.forEach((col) => {
      col.classList.toggle("is-selected-channel", Boolean(activeKey && col.getAttribute("data-channel") === activeKey));
    });
    const foots = document.querySelectorAll("#unifiedTop3RankingBarContainer .bar-col-footer");
    foots.forEach((foot) => {
      foot.classList.toggle("is-selected-channel", Boolean(activeKey && foot.getAttribute("data-channel") === activeKey));
    });
  },

  renderUnifiedTop3ChannelRankingChart(precomputedCtx) {
    const container = document.getElementById("unifiedTop3RankingBarContainer");
    const noticeEl = document.getElementById("unifiedRankingFilterNotice");
    const footerEl = document.getElementById("unifiedRankingFooterSummary");
    if (!container) return;

    const ctx = precomputedCtx || this._lastRevContext || this.getRevenueActiveFilterContext();
    const isDark = this.currentTheme === "dark";
    const colorReceived = isDark ? "#3B82F6" : "#1877FF";
    const colorExported = isDark ? "#34D399" : "#10B981";
    const colorUnexported = isDark ? "#F87171" : "#DC2626";

    const metaMap = this.getRevenueChannelMetaMap();
    const channelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];

    // Xếp hạng từ cao xuống thấp theo Doanh thu thực tế (trùng doanh thu xét đơn xuất rồi đơn tiếp nhận)
    const rankedAll = channelKeys
      .map((key) => {
        const st = ctx.byChannel[key] || { received: 0, exported: 0, cancelled: 0, backorder: 0, revenue: 0 };
        const meta = metaMap[key];
        const unexported = Math.max(0, st.received - st.exported);
        const revSharePct = ctx.totalRevenue > 0 ? (st.revenue / ctx.totalRevenue) * 100 : 0;
        return {
          key,
          orders: st.received,
          received: st.received,
          exported: st.exported,
          unexported,
          cancelled: st.cancelled,
          backorder: st.backorder,
          revenue: st.revenue,
          revSharePct,
          revShareText: this.formatRevPercentVi(revSharePct),
          name: meta.fullName,
          short: meta.name,
          color: meta.color,
          badge: meta.badge
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.exported - a.exported || b.received - a.received);

    if (noticeEl) {
      noticeEl.innerHTML = `<strong>${ctx.totalReceived}</strong> tiếp nhận · <strong>${ctx.totalExported}</strong> xuất · <strong>${ctx.totalRevenue.toLocaleString("vi-VN")} VND</strong>`;
    }

    if (ctx.totalReceived === 0) {
      container.innerHTML = `
        <div class="rev-empty-panel-state">
          Chưa có đơn hàng phát sinh trong kỳ <strong>${ctx.periodLabel}</strong>. Chọn "Tất cả thời gian" hoặc kỳ khác để xem xếp hạng kênh.
        </div>
      `;
      if (footerEl) {
        footerEl.innerHTML = `<div>Chưa có dữ liệu xếp hạng kênh trong kỳ <strong>${ctx.periodLabel}</strong>.</div>`;
      }
      return;
    }

    const top3Channels = rankedAll.slice(0, 3);
    const maxBarVal = Math.max(...top3Channels.map((c) => Math.max(c.received, c.exported, c.unexported)), 1);
    const rankLabels = ["HẠNG 1", "HẠNG 2", "HẠNG 3"];
    const activeCh = this.activePieChannel;

    const pillarsHtml = top3Channels
      .map((item) => {
        const calcH = (val) => (val > 0 ? Math.max(14, Math.round((val / maxBarVal) * 124)) : 2);
        const hRec = calcH(item.received);
        const hExp = calcH(item.exported);
        const hUnexp = calcH(item.unexported);
        const isSelected = activeCh === item.key;

        return `
        <div class="bar-col-item rev-top3-col-btn ${isSelected ? "is-selected-channel" : ""}"
             data-channel="${item.key}"
             role="button"
             tabindex="0"
             onclick="AppUI.selectPieChannel('${item.key}')"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();AppUI.selectPieChannel('${item.key}');}"
             title="Nhấn để lọc chi tiết kênh ${item.short}">
          <div class="bar-top-revenue-badge">
            <div class="rev-top3-money">${item.revenue.toLocaleString("vi-VN")} VND <span class="rev-top3-share">· ${item.revShareText}%</span></div>
            <div class="rev-top3-sub">${item.received} tiếp nhận · ${item.exported} xuất</div>
          </div>

          <div class="bar-triple-wrap">
            <div class="rev-bar-col-slot" title="${item.short} — Tiếp nhận: ${item.received} đơn">
              <span class="rev-bar-val">${item.received}</span>
              <div class="bar-pillar triple-col ${item.received === 0 ? "is-zero" : ""}" style="height:${hRec}px;background:${colorReceived};"></div>
            </div>
            <div class="rev-bar-col-slot" title="${item.short} — Xuất hàng: ${item.exported} đơn">
              <span class="rev-bar-val">${item.exported}</span>
              <div class="bar-pillar triple-col ${item.exported === 0 ? "is-zero" : ""}" style="height:${hExp}px;background:${colorExported};"></div>
            </div>
            <div class="rev-bar-col-slot" title="${item.short} — Chưa xuất / Hủy: ${item.unexported} đơn">
              <span class="rev-bar-val ${item.unexported === 0 ? "is-muted" : ""}">${item.unexported}</span>
              <div class="bar-pillar triple-col ${item.unexported === 0 ? "is-zero" : ""}" style="height:${hUnexp}px;background:${colorUnexported};"></div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    const labelsHtml = top3Channels
      .map((item, idx) => {
        const isSelected = activeCh === item.key;
        return `
        <div class="bar-col-footer rev-top3-footer-btn ${isSelected ? "is-selected-channel" : ""}"
             data-channel="${item.key}"
             onclick="AppUI.selectPieChannel('${item.key}')"
             title="Nhấn để lọc chi tiết kênh ${item.short}">
          <div class="bar-col-title rev-top3-footer-title">
            <span class="rev-rank-tag">${rankLabels[idx]}</span>
            <span class="rev-ch-vbar" style="background:${item.color};" aria-hidden="true"></span>
            <span>${item.short}</span>
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = `
      <div class="bar-chart-columns-grid">${pillarsHtml}</div>
      <div class="bar-chart-labels-grid">${labelsHtml}</div>
    `;

    if (footerEl) {
      const lead = top3Channels[0];
      const restChannels = rankedAll
        .slice(3)
        .map((r, i) => `#${i + 4} ${r.short}: <strong>${r.revenue.toLocaleString("vi-VN")} VND</strong>`)
        .join(" · ");
      footerEl.innerHTML = `
        <div class="rev-footer-lead">
          Dẫn đầu: <strong>${lead ? lead.short : "-"}</strong> · <strong>${lead ? lead.revenue.toLocaleString("vi-VN") : 0} VND</strong> (${lead ? lead.revShareText : "0,0"}%)
        </div>
        <div class="rev-footer-rest">
          ${restChannels || "Không có kênh bổ sung"}
        </div>
      `;
    }
  },

  // 3. KHỐI 1 (PHẦN B): BIỂU ĐỒ DONUT 5 KÊNH & XẾP HẠNG SẢN PHẨM BÁN CHẠY
  activePieChannel: null,
  topProductsLimit: 10,

  onRevDonutFilterModeChange() {
    this.syncRevenueFilterOptions();
    this.renderRevenueAnalyticsView();
  },

  getFiveChannelSoldDataset(precomputedCtx) {
    const ctx = precomputedCtx || this._lastRevContext || this.getRevenueActiveFilterContext();
    const channelMeta = this.getRevenueChannelMetaMap();
    const orderKeys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];

    const totalOrders = ctx.totalExported;
    const totalReceived = ctx.totalReceived;
    const totalRevenue = ctx.totalRevenue;

    const items = orderKeys.map((k) => {
      const st = ctx.byChannel[k] || { received: 0, exported: 0, cancelled: 0, backorder: 0, revenue: 0 };
      const pct = totalOrders > 0 ? (st.exported / totalOrders) * 100 : 0;
      const revPct = totalRevenue > 0 ? (st.revenue / totalRevenue) * 100 : 0;
      return {
        ...channelMeta[k],
        orders: st.exported,
        received: st.received,
        cancelled: st.cancelled,
        backorder: st.backorder,
        revenue: st.revenue,
        pct,
        pctText: this.formatRevPercentVi(pct),
        revPct,
        revPctText: this.formatRevPercentVi(revPct)
      };
    });

    return {
      periodLabel: ctx.periodLabel,
      totalOrders,
      totalReceived,
      totalRevenue,
      orders: ctx.orders,
      items
    };
  },

  createDonutSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg) {
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

  renderFiveChannelSoldPieChart(precomputedCtx) {
    const svgEl = document.getElementById("soldChannelPieSvg");
    if (!svgEl) return;

    const data = this.getFiveChannelSoldDataset(precomputedCtx);
    this._lastSoldPieData = data;

    // Đồng bộ 6 thẻ Tổng Doanh thu & Doanh thu 5 kênh ngay trong Khối 1
    this.renderOneMonthRevenueOverview(data);

    // Tỷ lệ bán kính cân đối tuyệt đối với #soldPieCenterHub (41% = r 61.5 < rInner 64), hết cấn chữ %
    const cx = 150;
    const cy = 150;
    const rOuter = 122;
    const rInner = 64;
    const rLabel = (rOuter + rInner) / 2;

    if (data.totalOrders <= 0) {
      svgEl.innerHTML = `
        <circle cx="${cx}" cy="${cy}" r="${rLabel}" fill="none" class="rev-donut-empty-ring" stroke-width="${rOuter - rInner}" />
      `;
    } else {
      let currentDeg = 0;
      const slicesHtml = data.items
        .map((item) => {
          if (item.orders <= 0) return "";
          const angleSpan = (item.orders / data.totalOrders) * 360;
          const startDeg = currentDeg;
          const endDeg = currentDeg + angleSpan;
          const midDeg = startDeg + angleSpan / 2;
          currentDeg = endDeg;

          const pathD = this.createDonutSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg);
          const midRad = ((midDeg - 90) * Math.PI) / 180;

          // Tọa độ tách lát cắt khi người dùng chọn kênh (an toàn trong khung viewBox 300x300)
          const jumpDist = 14;
          const dx = (Math.cos(midRad) * jumpDist).toFixed(2);
          const dy = (Math.sin(midRad) * jumpDist).toFixed(2);

          // Nhãn % đặt chính giữa vành cắt và chỉ hiển thị cho lát >= 8%
          const lx = (cx + rLabel * Math.cos(midRad)).toFixed(2);
          const ly = (cy + rLabel * Math.sin(midRad)).toFixed(2);
          const showLabel = item.pct >= 8;

          return `
            <g class="pie-slice-group"
               data-channel="${item.key}"
               data-dx="${dx}"
               data-dy="${dy}"
               onclick="AppUI.selectPieChannel('${item.key}')">
              <path class="pie-slice-path" d="${pathD}" fill="${item.color}">
                <title>${item.name}: ${item.orders} đơn xuất (${item.pctText}%) — ${item.revenue.toLocaleString("vi-VN")} VND</title>
              </path>
              ${showLabel ? `<text class="pie-slice-pct-text" x="${lx}" y="${ly}">${item.pctText}%</text>` : ""}
            </g>
          `;
        })
        .join("");

      svgEl.innerHTML = slicesHtml;
    }

    // Bảng chú giải 5 kênh phẳng 0px dưới Donut
    const vivoLegendEl = document.getElementById("soldPieVivoLegend");
    if (vivoLegendEl) {
      vivoLegendEl.classList.remove("hidden");
      const legendOrder = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
      const orderedItems = legendOrder
        .map((k) => data.items.find((it) => it.key === k))
        .filter(Boolean);
      vivoLegendEl.innerHTML = orderedItems
        .map(
          (it) => `
          <div class="vivo-legend-row ${this.activePieChannel === it.key ? "active" : ""}" onclick="AppUI.selectPieChannel('${it.key}')" title="Nhấn để lọc chi tiết kênh ${it.name}">
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
    }

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

    // 1. Hiệu ứng tách lát cắt trên biểu đồ Donut
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
        g.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
      } else {
        g.classList.remove("slice-active");
        g.classList.add("slice-dimmed");
        g.style.transform = "translate(0px, 0px) scale(0.97)";
      }
    });

    // 2. Đồng bộ trạng thái nổi bật trên bảng chú giải 5 dòng
    const vivoRows = document.querySelectorAll("#soldPieVivoLegend .vivo-legend-row");
    vivoRows.forEach((row) => {
      const rowClick = row.getAttribute("onclick") || "";
      row.classList.toggle("active", Boolean(activeKey && rowClick.includes(`'${activeKey}'`)));
    });

    // 3. Cập nhật tâm tròn biểu đồ Donut (#soldPieCenterHub) & hộp tổng kết (#soldPieSummaryFooter)
    const hubEl = document.getElementById("soldPieCenterHub");
    const lblEl = document.getElementById("soldPieCenterLabel");
    const valEl = document.getElementById("soldPieCenterValue");
    const subEl = document.getElementById("soldPieCenterSub");
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
        subEl.innerText = `${activeItem.pctText}% tổng đơn`;
      }
      if (footerEl) {
        footerEl.classList.remove("hidden");
        footerEl.style.display = "";
        footerEl.innerHTML = `
          <div class="rev-summary-line">
            <span class="rev-ch-vbar" style="background:${activeItem.color};" aria-hidden="true"></span>
            <span>Đang lọc <strong>${activeItem.name}</strong> (${activeItem.pctText}%) · <strong>${activeItem.orders}</strong> đơn xuất · <strong>${activeItem.revenue.toLocaleString("vi-VN")} VND</strong></span>
          </div>
        `;
      }
    } else {
      if (hubEl) hubEl.style.borderColor = "";
      if (lblEl) {
        lblEl.innerText = "TỔNG ĐÃ BÁN";
        lblEl.style.color = "";
      }
      if (valEl) {
        valEl.innerText = `${data.totalOrders} đơn`;
        valEl.style.color = "";
      }
      if (subEl) {
        subEl.innerText = data.totalOrders > 0 ? "5 kênh bán" : "Chưa có dữ liệu";
      }
      if (footerEl) {
        footerEl.innerHTML = "";
        footerEl.classList.add("hidden");
        footerEl.style.display = "none";
      }
    }

    // Đồng bộ 6 thẻ doanh thu, bảng xếp hạng sản phẩm bán chạy & khung trụ Xếp hạng 3 kênh
    this.renderOneMonthRevenueOverview(data);
    this.renderTopSellingProductsList(data);
    if (typeof this.syncTop3RankingSelectedState === "function") {
      this.syncTop3RankingSelectedState();
    }
  },

  setTopProductsLimit(limit) {
    this.topProductsLimit = limit === 50 ? 50 : 10;
    const btn10 = document.getElementById("btnTop10Products");
    const btn50 = document.getElementById("btnTop50Products");
    if (btn10) {
      btn10.classList.toggle("active", this.topProductsLimit === 10);
    }
    if (btn50) {
      btn50.classList.toggle("active", this.topProductsLimit === 50);
    }
    this.renderTopSellingProductsList(this._lastSoldPieData || this.getFiveChannelSoldDataset());
  },

  // Danh mục 25 sản phẩm Thời trang thực tế từ kho — xóa sạch baseSold & 25 mã biến thể ảo
  getTopSellingProductsCatalog() {
    const inv =
      typeof this.getEffectiveInventoryAtNow === "function"
        ? this.getEffectiveInventoryAtNow()
        : window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : Array.isArray(window.INITIAL_INVENTORY)
        ? window.INITIAL_INVENTORY
        : [];

    return inv.map((item) => ({
      sku: String(item.sku || "").trim(),
      name: String(item.name || item.productName || item.sku || "").trim(),
      category: String(item.category || "Thời trang").trim(),
      price: Number(item.unitPrice ?? item.price ?? 0) || 0
    }));
  },

  renderTopSellingProductsList(precomputedData) {
    const listContainer = document.getElementById("topProductsListContainer");
    const subtitleEl = document.getElementById("topProductsSubtitle");
    if (!listContainer) return;

    const data = precomputedData || this._lastSoldPieData || this.getFiveChannelSoldDataset();
    const showAll = this.topProductsLimit === 50;
    const activeCh = this.activePieChannel;
    const metaMap = this.getRevenueChannelMetaMap();
    const activeChName = activeCh && metaMap[activeCh] ? metaMap[activeCh].name : "";

    const periodOrders = Array.isArray(data.orders)
      ? data.orders
      : (this._lastRevContext ? this._lastRevContext.orders : []);

    // Cộng dồn 100% số lượng & doanh thu thực tế từ đơn đã giữ hàng (ALLOCATED) trong kỳ đang lọc
    const soldBySku = {};
    periodOrders.forEach((o) => {
      if (!o || o.status !== "ALLOCATED" || o.platformStatus === "CANCELLED") return;
      const ordCh = String(o.channel || "").trim().toUpperCase();
      if (activeCh && ordCh !== activeCh) return;
      const skuKey = String(o.sku || "").trim();
      if (!skuKey) return;
      const qty = Number(o.quantity) || 0;
      const unitP = Number(o.unitPrice) || 0;
      if (!soldBySku[skuKey]) {
        soldBySku[skuKey] = {
          soldQty: 0,
          revenue: 0,
          orderCount: 0,
          unitPrice: unitP,
          name: String(o.productName || skuKey),
          byCh: {}
        };
      }
      soldBySku[skuKey].soldQty += qty;
      soldBySku[skuKey].revenue += qty * unitP;
      soldBySku[skuKey].orderCount += 1;
      soldBySku[skuKey].byCh[ordCh] = (soldBySku[skuKey].byCh[ordCh] || 0) + qty;
    });

    const catalog = this.getTopSellingProductsCatalog();
    const knownSkus = new Set(catalog.map((c) => c.sku));
    Object.keys(soldBySku).forEach((skuKey) => {
      if (!knownSkus.has(skuKey)) {
        catalog.push({
          sku: skuKey,
          name: soldBySku[skuKey].name,
          category: "Thời trang",
          price: soldBySku[skuKey].unitPrice
        });
      }
    });

    const computed = catalog.map((item) => {
      const stat = soldBySku[item.sku] || { soldQty: 0, revenue: 0, orderCount: 0, byCh: {} };
      let primaryChKey = activeCh || "";
      if (!primaryChKey) {
        let bestQty = 0;
        Object.keys(stat.byCh).forEach((ck) => {
          if (stat.byCh[ck] > bestQty) {
            bestQty = stat.byCh[ck];
            primaryChKey = ck;
          }
        });
      }
      const primaryChName = primaryChKey && metaMap[primaryChKey] ? metaMap[primaryChKey].name : "Chưa phát sinh";
      const unitPrice = item.price || stat.unitPrice || 0;
      return {
        sku: item.sku,
        name: item.name,
        price: unitPrice,
        soldQty: stat.soldQty,
        revenue: stat.revenue,
        orderCount: stat.orderCount,
        primaryChName
      };
    });

    computed.sort((a, b) => b.soldQty - a.soldQty || b.revenue - a.revenue || a.sku.localeCompare(b.sku));

    const soldOnly = computed.filter((p) => p.soldQty > 0);
    const displayRows = showAll ? computed : soldOnly.slice(0, 10);
    const maxSold = Math.max(...displayRows.map((p) => p.soldQty), 1);

    if (subtitleEl) {
      if (activeChName) {
        subtitleEl.innerHTML = `Đang lọc: <strong>${activeChName}</strong> · <strong>${soldOnly.length}</strong> sản phẩm`;
        subtitleEl.classList.remove("hidden");
      } else {
        subtitleEl.innerHTML = "";
        subtitleEl.classList.add("hidden");
      }
    }

    if (displayRows.length === 0) {
      listContainer.innerHTML = `
        <div class="rev-empty-panel-state">
          Chưa có sản phẩm nào phát sinh doanh thu${activeChName ? ` trên kênh ${activeChName}` : ""} trong kỳ <strong>${data.periodLabel}</strong>.
        </div>
      `;
      return;
    }

    const rowsHtml = displayRows
      .map((prod, idx) => {
        const rank = idx + 1;
        const pctWidth = prod.soldQty > 0 ? Math.max(6, Math.round((prod.soldQty / maxSold) * 100)) : 0;
        const isTop3 = prod.soldQty > 0 && rank <= 3;
        const isZero = prod.soldQty === 0;
        const safeName = typeof this.escapeLogHtml === "function" ? this.escapeLogHtml(prod.name) : prod.name;
        const safeSku = typeof this.escapeLogHtml === "function" ? this.escapeLogHtml(prod.sku) : prod.sku;

        return `
          <tr class="${isZero ? "rev-prod-row-zero" : ""}">
            <td class="col-rev-rank">
              <span class="rev-rank-num ${isTop3 ? "is-lead" : ""}">#${rank}</span>
            </td>
            <td class="col-rev-prod">
              <div class="rev-prod-name" title="${safeName}">${safeName}</div>
              <div class="rev-prod-meta">
                <span class="rev-prod-code">${safeSku}</span>
                <span class="rev-prod-sep">·</span>
                <span>${prod.primaryChName}</span>
                <span class="rev-prod-sep">·</span>
                <span>${prod.price.toLocaleString("vi-VN")} VND</span>
              </div>
              <div class="rev-prod-bar-track" aria-hidden="true">
                <div class="rev-prod-bar-fill" style="width:${pctWidth}%;"></div>
              </div>
            </td>
            <td class="col-rev-qty">
              <span class="rev-prod-qty-val">${prod.soldQty} SP</span>
            </td>
            <td class="col-rev-money">
              <span class="rev-prod-money-val">${prod.revenue.toLocaleString("vi-VN")} VND</span>
            </td>
          </tr>
        `;
      })
      .join("");

    listContainer.innerHTML = `
      <table class="odoms-flat-table rev-products-table">
        <thead>
          <tr>
            <th class="col-rev-rank">Hạng</th>
            <th class="col-rev-prod">Sản phẩm</th>
            <th class="col-rev-qty">SL bán</th>
            <th class="col-rev-money">Doanh thu</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  },

  renderKPIsAndBadges() {
    const orders = typeof this.getValidOrdersUpToNow === "function" ? this.getValidOrdersUpToNow() : (window.omsEngine ? window.omsEngine.orders : []);
    const inv = typeof this.getEffectiveInventoryAtNow === "function" ? this.getEffectiveInventoryAtNow() : (window.omsEngine ? window.omsEngine.inventory : []);

    // 1. Dữ liệu Khối 1: Kho hàng (cách ly đơn tương lai > Date.now())
    const totalPhysical = inv.reduce((s, i) => s + (i.effectivePhysicalStock ?? i.physicalStock ?? 0), 0);
    const totalAvailable = inv.reduce((s, i) => s + (i.effectiveAvailableStock ?? i.availableStock ?? 0), 0);
    const totalReserved = inv.reduce((s, i) => s + (i.effectiveReservedStock ?? i.reservedStock ?? 0), 0);
    const outOfStockSkus = inv.filter((i) => (i.effectiveAvailableStock ?? i.availableStock ?? 0) === 0).length;

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

    // 3. Dữ liệu Khối 3: Quản lý Vận đơn (đồng bộ theo thời gian thực <= Date.now())
    const waybillList =
      typeof this.getMergedWaybillRecords === "function"
        ? this.getMergedWaybillRecords()
        : this.waybillHistory || [];
    const totalWaybills = waybillList.length;

    // 4. Dữ liệu Khối 4: Vận chuyển đơn (chỉ tính vận đơn <= Date.now())
    const shipmentsList = typeof this.getValidShipmentsUpToNow === "function" ? this.getValidShipmentsUpToNow(orders) : this.syncShipmentsFromEngine();
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
      const phys = i.effectivePhysicalStock ?? i.physicalStock ?? 0;
      const avail = i.effectiveAvailableStock ?? i.availableStock ?? 0;
      const pct = phys > 0 ? Math.round((avail / phys) * 100) : 0;
      return avail > 0 && pct <= 35;
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
    const activeShippingBadgeCount = this.getUnfinishedValidShipmentsCount(orders);
    const lowStockBadgeCount = this.getLowStockInventoryItems(inv).length;
    setElText("badgeShippingCount", activeShippingBadgeCount);
    setElText("badgeFifoCount", activeShippingBadgeCount);
    setElText("badgeBackorderCount", lowStockBadgeCount);
  },

  renderCharts() {
    const orders = typeof this.getValidOrdersUpToNow === "function" ? this.getValidOrdersUpToNow() : window.omsEngine.orders;
    const allocated = orders.filter((o) => o.status === "ALLOCATED").length;
    const backorder = orders.filter((o) => o.status === "BACKORDER").length;
    const invalid = orders.filter((o) => o.status === "INVALID").length;
    const total = orders.length;

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setElText("donutTotalSubtitle", `Theo trạng thái giữ hàng · ${total} đơn hàng`);
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
  // THẺ GỘP KHỐI 2 & 3 — CHUYỂN TAB (TIẾP NHẬN & XUẤT HÀNG ↔ XẾP HẠNG 3 KÊNH) + ĐỒ THỊ 2 TRỤC TUNG SVG
  // ============================================================================
  revenueBottomTab: "spline",
  activeMonthlyChartDots: new Set(),
  activeMonthlySeries: null,
  showAllMonthlyTrendsNumbers: true,
  _splineResizeBound: false,
  _splineResizeTimer: null,
  _lastSplineData: null,
  _lastSplinePoints: [],
  _lastSplineMetrics: null,
  _lastMeasuredSplineW: 0,

  syncRevenueBottomTabUI() {
    const isTop3 = this.revenueBottomTab === "top3";
    const titleEl = document.getElementById("revCombinedCardTitle");
    const splineSubEl = document.getElementById("monthlyTrendsSubtitle");
    const top3SubEl = document.getElementById("unifiedRankingFilterNotice");
    const splineLegEl = document.getElementById("revSplineLegendGroup");
    const top3LegEl = document.getElementById("revTop3LegendGroup");
    const eyeBtn = document.getElementById("btnToggleAllMonthlyDots");
    const btnSpline = document.getElementById("btnRevTabSpline");
    const btnTop3 = document.getElementById("btnRevTabTop3");
    const panelSpline = document.getElementById("revBottomPanelSpline");
    const panelTop3 = document.getElementById("revBottomPanelTop3");

    if (titleEl) {
      titleEl.innerText = isTop3 ? "Xếp hạng 3 kênh" : "Tiếp nhận & Xuất hàng";
    }
    if (splineSubEl) splineSubEl.classList.toggle("hidden", isTop3);
    if (top3SubEl) top3SubEl.classList.toggle("hidden", !isTop3);
    if (splineLegEl) splineLegEl.classList.toggle("hidden", isTop3);
    if (top3LegEl) top3LegEl.classList.toggle("hidden", !isTop3);
    if (eyeBtn) eyeBtn.classList.toggle("hidden", isTop3);
    if (panelSpline) panelSpline.classList.toggle("hidden", isTop3);
    if (panelTop3) panelTop3.classList.toggle("hidden", !isTop3);

    if (btnSpline) {
      btnSpline.classList.toggle("active", !isTop3);
      btnSpline.setAttribute("aria-pressed", !isTop3 ? "true" : "false");
    }
    if (btnTop3) {
      btnTop3.classList.toggle("active", isTop3);
      btnTop3.setAttribute("aria-pressed", isTop3 ? "true" : "false");
    }
  },

  switchRevenueBottomTab(tabKey) {
    const target = tabKey === "top3" ? "top3" : "spline";
    this.revenueBottomTab = target;
    this.syncRevenueBottomTabUI();

    if (target === "top3") {
      this.hideMonthlySplineHover();
      this.renderUnifiedTop3ChannelRankingChart(this._lastRevContext);
    } else {
      // Sau khi bỏ ẩn panel đồ thị 2 trục tung, đo lại clientWidth thực tế để bung khít 100% chiều ngang thẻ
      if (this._lastSplineData) {
        this.updateMonthlyTrendsSplineSvg(this._lastSplineData);
      } else {
        this.renderMonthlyTrendsByFilter(this._lastRevContext);
      }
    }
  },

  formatSplineRatePct(pct) {
    const num = Number.isFinite(pct) ? pct : 0;
    if (Math.abs(num - Math.round(num)) < 0.05) {
      return `${Math.round(num)}%`;
    }
    return `${num.toFixed(1).replace(".", ",")}%`;
  },

  ensureMonthlySplineResizeBinding() {
    if (this._splineResizeBound || typeof window === "undefined" || typeof window.addEventListener !== "function") {
      return;
    }
    this._splineResizeBound = true;
    window.addEventListener("resize", () => {
      if (this.currentMenuTab !== "revenue_analytics" || this.revenueBottomTab !== "spline" || !this._lastSplineData) return;
      if (this._splineResizeTimer) clearTimeout(this._splineResizeTimer);
      this._splineResizeTimer = setTimeout(() => {
        if (this.currentMenuTab === "revenue_analytics" && this.revenueBottomTab === "spline" && this._lastSplineData) {
          this.updateMonthlyTrendsSplineSvg(this._lastSplineData);
        }
      }, 120);
    });
  },

  handleMonthlyTrendLineClick(seriesType) {
    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    const targetDots = Array.from(document.querySelectorAll(`.chart-interactive-dot[data-type="${seriesType}"]`));
    let targetKeys = targetDots.map((c) => `${seriesType}_${c.getAttribute("data-month")}`);
    if (targetKeys.length === 0 && Array.isArray(this._lastSplinePoints)) {
      targetKeys = this._lastSplinePoints.map((pt) => `${seriesType}_${pt.label}`);
    }
    const isSeriesIsolated =
      this.activeMonthlySeries === seriesType &&
      targetKeys.length > 0 &&
      targetKeys.every((k) => this.activeMonthlyChartDots.has(k));

    if (isSeriesIsolated) {
      this.activeMonthlySeries = null;
      this.activeMonthlyChartDots.clear();
      if (this.showAllMonthlyTrendsNumbers && Array.isArray(this._lastSplinePoints)) {
        this._lastSplinePoints.forEach((pt) => {
          this.activeMonthlyChartDots.add(`import_${pt.label}`);
          this.activeMonthlyChartDots.add(`export_${pt.label}`);
        });
      }
    } else {
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
    const valText = circleEl.getAttribute("data-val") || "0";
    const series = circleEl.getAttribute("data-series") || (type === "import" ? "Đơn tiếp nhận" : "Tỷ lệ xuất hàng");
    const key = `${type}_${month}`;

    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    if (this.activeMonthlyChartDots.has(key)) {
      this.activeMonthlyChartDots.delete(key);
      circleEl.classList.remove("active");
      this.showAllMonthlyTrendsNumbers = false;
    } else {
      this.activeMonthlyChartDots.add(key);
      circleEl.classList.add("active");
      this.activeMonthlySeries = type;
    }

    this.renderMonthlyTrendsChartLabels();

    if (window.omsEngine) {
      const isNowActive = this.activeMonthlyChartDots.has(key);
      if (isNowActive) {
        const unitSuffix = type === "import" ? " đơn hàng" : "";
        window.omsEngine.addLog(
          "info",
          `[TIẾP NHẬN & XUẤT HÀNG] ${series} (${monthName}): ${valText}${unitSuffix}`
        );
        this.renderLogs();
      }
    }
  },

  handleMonthlySplinePointerMove(evt) {
    const svgEl = document.getElementById("monthlyTrendsSplineSvg");
    const stageEl = document.getElementById("revSplineStage");
    const bandEl = document.getElementById("revSplineHoverBand");
    const guideEl = document.getElementById("revSplineHoverGuide");
    const popEl = document.getElementById("revSplineHoverPopover");
    const pts = this._lastSplinePoints;
    const metrics = this._lastSplineMetrics;
    if (!svgEl || !stageEl || !Array.isArray(pts) || pts.length === 0 || !metrics) return;

    const rect = svgEl.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const relX = evt.clientX - rect.left;
    const svgX = (relX / rect.width) * metrics.svgW;

    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(pts[i].x - svgX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    const pt = pts[bestIdx];
    if (!pt) return;

    if (bandEl) {
      const bandW = pts.length > 1 ? Math.max(36, Math.min(52, Math.round((metrics.stepX || 44) * 0.52))) : 48;
      const bandX = Math.max(metrics.padL, Math.min(metrics.padR - bandW, Math.round(pt.x - bandW / 2)));
      bandEl.setAttribute("x", String(bandX));
      bandEl.setAttribute("y", String(metrics.padT));
      bandEl.setAttribute("width", String(bandW));
      bandEl.setAttribute("height", String(metrics.plotH));
      bandEl.classList.remove("hidden");
    }

    if (guideEl) {
      guideEl.setAttribute("x1", String(pt.x));
      guideEl.setAttribute("x2", String(pt.x));
      guideEl.setAttribute("y1", String(metrics.padT));
      guideEl.setAttribute("y2", String(metrics.padB));
      guideEl.classList.remove("hidden");
    }

    const allDots = document.querySelectorAll("#monthlyTrendsSplineSvg .chart-interactive-dot");
    allDots.forEach((dot) => {
      dot.classList.toggle("is-hovered", dot.getAttribute("data-month") === pt.label);
    });

    const xTexts = document.querySelectorAll("#chartXAxisLabels text");
    xTexts.forEach((txt) => {
      txt.classList.toggle("is-active-x", txt.getAttribute("data-month") === pt.label);
    });

    if (popEl) {
      const palette = this.getMonthlySplineThemeColors();
      const unexported = Math.max(0, pt.impVal - pt.expVal);
      const isBelowFull = pt.ratePct < 99.95;
      const headRateStr = `${pt.ratePct.toFixed(1).replace(".", ",")}%`;
      popEl.innerHTML = `
        <div class="rev-pop-head">
          <span class="rev-pop-title-text">${pt.full}</span>
          <span class="rev-pop-head-rate ${isBelowFull ? "is-warn" : "is-full"}">${headRateStr}</span>
        </div>
        <div class="rev-pop-row">
          <span class="rev-pop-label"><span class="rev-pop-sq" style="background:${palette.importLine};"></span>Tiếp nhận</span>
          <strong class="rev-pop-val">${pt.impVal} đơn</strong>
        </div>
        <div class="rev-pop-row">
          <span class="rev-pop-label"><span class="rev-pop-sq" style="background:${palette.exportLine};"></span>Xuất hàng</span>
          <strong class="rev-pop-val">${pt.expVal} đơn</strong>
        </div>
        <div class="rev-pop-row">
          <span class="rev-pop-label"><span class="rev-pop-sq rev-pop-sq-danger"></span>Chưa xuất / Hủy</span>
          <strong class="rev-pop-val ${unexported > 0 ? "is-danger-val" : "is-muted-val"}">${unexported} đơn</strong>
        </div>
        <div class="rev-pop-row rev-pop-rate-row">
          <span class="rev-pop-label"><span class="rev-pop-line-swatch" style="background:${palette.exportLine};"></span>Tỷ lệ xuất</span>
          <strong class="rev-pop-val rev-pop-rate-val">${pt.rateText}</strong>
        </div>
      `;
      popEl.classList.remove("hidden");

      const stageW = stageEl.clientWidth || rect.width;
      const pxX = (pt.x / metrics.svgW) * rect.width;
      const popW = popEl.offsetWidth || 218;
      const flipLeft = pt.x / metrics.svgW > 0.62;
      let leftPx = flipLeft ? pxX - popW - 14 : pxX + 14;
      leftPx = Math.max(6, Math.min(stageW - popW - 6, Math.round(leftPx)));
      popEl.style.left = `${leftPx}px`;
      popEl.style.top = "12px";
    }
  },

  hideMonthlySplineHover() {
    const bandEl = document.getElementById("revSplineHoverBand");
    const guideEl = document.getElementById("revSplineHoverGuide");
    const popEl = document.getElementById("revSplineHoverPopover");
    if (bandEl) bandEl.classList.add("hidden");
    if (guideEl) guideEl.classList.add("hidden");
    if (popEl) popEl.classList.add("hidden");
    const allDots = document.querySelectorAll("#monthlyTrendsSplineSvg .chart-interactive-dot.is-hovered");
    allDots.forEach((dot) => dot.classList.remove("is-hovered"));
    const xTexts = document.querySelectorAll("#chartXAxisLabels text.is-active-x");
    xTexts.forEach((txt) => txt.classList.remove("is-active-x"));
  },

  getMonthlySplineThemeColors() {
    const isDark = this.currentTheme === "dark";
    return {
      isDark,
      importLine: isDark ? "#3B82F6" : "#1877FF",
      exportLine: isDark ? "#34D399" : "#10B981",
      importGlow: isDark ? "#3B82F6" : "#1877FF",
      exportGlow: "#10B981",
      importStops: isDark
        ? { top: ["0%", "0.32"], mid: ["65%", "0.06"], low: ["100%", "0"], bottom: ["100%", "0"] }
        : { top: ["0%", "0.34"], mid: ["65%", "0.18"], low: ["92%", "0.14"], bottom: ["100%", "0.03"] },
      exportStops: isDark
        ? { top: ["0%", "0.20"], mid: ["22%", "0.05"], fade: ["45%", "0"], bottom: ["100%", "0"] }
        : { top: ["0%", "0.28"], mid: ["18%", "0.11"], fade: ["42%", "0"], bottom: ["100%", "0"] },
      importText: isDark ? "#60A5FA" : "#1877FF",
      exportText: isDark ? "#34D399" : "#10B981",
      calloutBg: isDark ? "#064E3B" : "#ECFDF5",
      calloutBorder: isDark ? "#34D399" : "#10B981",
      calloutText: isDark ? "#A7F3D0" : "#047857",
      dotStroke: isDark ? "#151F32" : "#FFFFFF"
    };
  },

  renderMonthlyTrendsChartLabels() {
    const group = document.getElementById("chartDotsLabelsGroup");
    if (!group) return;

    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    const palette = this.getMonthlySplineThemeColors();
    const metrics = this._lastSplineMetrics || { svgW: 1080, padL: 14, padR: 1066, padT: 36, padB: 226 };

    const lineImp = document.getElementById("chartLineImport");
    const lineExp = document.getElementById("chartLineExport");
    const areaImp = document.getElementById("chartAreaImport");
    const areaExp = document.getElementById("chartAreaExport");
    const dotsImpGroup = document.getElementById("chartDotsImport");
    const dotsExpGroup = document.getElementById("chartDotsExportGroup");
    const pillImp = document.getElementById("legendPillImport");
    const pillExp = document.getElementById("legendPillExport");
    const legendBoxImp = document.getElementById("legendBoxImport");
    const legendBoxExp = document.getElementById("legendBoxExport");
    const bannerEl = document.getElementById("monthlyTrendInteractiveBanner");

    if (legendBoxImp) legendBoxImp.style.background = palette.importLine;
    if (legendBoxExp) legendBoxExp.style.background = palette.exportLine;

    const hasImpActive = Array.from(this.activeMonthlyChartDots).some((k) => k.startsWith("import_"));
    const hasExpActive = Array.from(this.activeMonthlyChartDots).some((k) => k.startsWith("export_"));
    const impOnly = this.activeMonthlySeries === "import" || (hasImpActive && !hasExpActive);
    const expOnly = this.activeMonthlySeries === "export" || (hasExpActive && !hasImpActive);

    if (lineImp) {
      lineImp.classList.toggle("line-selected", impOnly);
      lineImp.classList.toggle("line-dimmed", expOnly);
    }
    if (lineExp) {
      lineExp.classList.toggle("line-selected", expOnly);
      lineExp.classList.toggle("line-dimmed", impOnly);
    }
    if (dotsImpGroup) dotsImpGroup.classList.toggle("dots-dimmed", expOnly);
    if (dotsExpGroup) dotsExpGroup.classList.toggle("dots-dimmed", impOnly);
    if (areaImp) {
      areaImp.classList.toggle("area-selected", impOnly);
      areaImp.classList.toggle("area-dimmed", expOnly);
    }
    if (areaExp) {
      areaExp.classList.toggle("area-selected", expOnly);
      areaExp.classList.toggle("area-dimmed", impOnly);
    }
    if (pillImp) pillImp.classList.toggle("active", impOnly);
    if (pillExp) pillExp.classList.toggle("active", expOnly);

    if (bannerEl) {
      bannerEl.innerHTML = "";
      bannerEl.style.display = "none";
    }

    const allDots = Array.from(document.querySelectorAll(".chart-interactive-dot"));
    const pointMap = new Map();
    const pointOrder = [];

    allDots.forEach((circle) => {
      const type = circle.getAttribute("data-type") || "import";
      const month = circle.getAttribute("data-month") || "";
      const val = circle.getAttribute("data-val") || "0";
      const rateNum = parseFloat(circle.getAttribute("data-rate"));
      const cx = parseFloat(circle.getAttribute("cx")) || 0;
      const cy = parseFloat(circle.getAttribute("cy")) || 0;
      const key = `${type}_${month}`;
      const isActive = this.activeMonthlyChartDots.has(key);

      circle.classList.toggle("active", isActive && (impOnly || expOnly));

      if (!pointMap.has(month)) {
        pointMap.set(month, { month, cx, imp: null, exp: null });
        pointOrder.push(month);
      }
      const entry = pointMap.get(month);
      if (type === "import") {
        entry.imp = { cx, cy, val, isActive };
      } else {
        entry.exp = { cx, cy, val, ratePct: Number.isFinite(rateNum) ? rateNum : 100, isActive };
      }
    });

    if (allDots.length === 0 && Array.isArray(this._lastSplinePoints) && this._lastSplinePoints.length > 0) {
      this._lastSplinePoints.forEach((pt) => {
        pointMap.set(pt.label, {
          month: pt.label,
          cx: pt.x,
          imp: {
            cx: pt.x,
            cy: pt.yImport,
            val: String(pt.impVal),
            isActive: this.activeMonthlyChartDots.has(`import_${pt.label}`)
          },
          exp: {
            cx: pt.x,
            cy: pt.yRate,
            val: pt.rateText,
            ratePct: pt.ratePct,
            isActive: this.activeMonthlyChartDots.has(`export_${pt.label}`)
          }
        });
        pointOrder.push(pt.label);
      });
    }

    const boxH = 18;
    const yBottomLimit = metrics.padB - 6;
    let markup = "";

    const renderLightTextLabel = (cx, cy, valText, colorFill, placeBelow, seriesAttr, monthKey) => {
      const centerX = Math.round(cx);
      let ty = placeBelow ? Math.round(cy + 18) : Math.round(cy - 10);
      if (ty < 14) ty = 14;
      if (ty > yBottomLimit) ty = Math.round(cy - 10);
      return `
        <g class="chart-dot-number-badge chart-dot-text-label" data-series="${seriesAttr}" data-month="${monthKey}">
          <text x="${centerX}" y="${ty}" text-anchor="middle" fill="${colorFill}" font-size="11" font-weight="700" font-family="system-ui, -apple-system, sans-serif">${valText}</text>
        </g>
      `;
    };

    const renderRateCalloutBadge = (cx, cy, valText, placeBelow, monthKey) => {
      const centerX = Math.round(cx);
      const badgeW = Math.max(40, Math.round(String(valText).length * 6.8 + 12));
      const boxX = Math.round(centerX - badgeW / 2);
      let boxY = placeBelow ? Math.round(cy + 9) : Math.round(cy - 24);
      if (boxY < 4) boxY = 4;
      if (boxY + boxH > metrics.padB - 2) boxY = Math.max(4, Math.round(cy - 24));
      return `
        <g class="chart-dot-number-badge chart-dot-callout-badge" data-series="export" data-month="${monthKey}">
          <rect x="${boxX}" y="${boxY}" width="${badgeW}" height="${boxH}" rx="0" fill="${palette.calloutBg}" stroke="${palette.calloutBorder}" stroke-width="1" />
          <text x="${centerX}" y="${boxY + 12.5}" text-anchor="middle" fill="${palette.calloutText}" font-size="10.5" font-weight="700" font-family="system-ui, -apple-system, sans-serif">${valText}</text>
        </g>
      `;
    };

    pointOrder.forEach((monthKey) => {
      const entry = pointMap.get(monthKey);
      if (!entry) return;
      const imp = entry.imp;
      const exp = entry.exp;
      const impOn = Boolean(imp && imp.isActive);
      const expOn = Boolean(exp && exp.isActive);
      if (!impOn && !expOn) return;

      const isRateBelowFull = Boolean(exp && exp.ratePct < 99.95);

      if (impOn && expOn) {
        const yDiff = Math.abs(imp.cy - exp.cy);
        const impBlockedAbove = exp.cy < imp.cy && yDiff < 26;
        markup += renderLightTextLabel(imp.cx, imp.cy, imp.val, palette.importText, impBlockedAbove, "import", monthKey);
        if (isRateBelowFull) {
          const expBlockedBelow = imp.cy > exp.cy && yDiff < 28;
          markup += renderRateCalloutBadge(exp.cx, exp.cy, exp.val, !expBlockedBelow, monthKey);
        } else {
          const expBlockedAbove = imp.cy < exp.cy && yDiff < 26;
          markup += renderLightTextLabel(exp.cx, exp.cy, exp.val, palette.exportText, expBlockedAbove, "export", monthKey);
        }
      } else if (impOn) {
        markup += renderLightTextLabel(imp.cx, imp.cy, imp.val, palette.importText, false, "import", monthKey);
      } else if (expOn) {
        if (isRateBelowFull) {
          markup += renderRateCalloutBadge(exp.cx, exp.cy, exp.val, true, monthKey);
        } else {
          markup += renderLightTextLabel(exp.cx, exp.cy, exp.val, palette.exportText, false, "export", monthKey);
        }
      }
    });

    group.innerHTML = markup;

    const allDotsCount = allDots.length > 0 ? allDots.length : pointOrder.length * 2;
    const btnToggle = document.getElementById("btnToggleAllMonthlyDots");
    if (btnToggle) {
      const isAllActive = allDotsCount > 0 && this.activeMonthlyChartDots.size >= allDotsCount;
      const eyeSvg =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
        '<circle cx="12" cy="12" r="3"/>' +
        "</svg>";
      const eyeOffSvg =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>' +
        '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>' +
        '<line x1="1" y1="1" x2="23" y2="23"/>' +
        "</svg>";
      const tipLabel = isAllActive ? "Ẩn số liệu trên đồ thị" : "Hiện số liệu trên đồ thị";
      btnToggle.innerHTML = isAllActive ? eyeSvg : eyeOffSvg;
      btnToggle.classList.toggle("active", isAllActive);
      btnToggle.setAttribute("data-showing-all", isAllActive ? "true" : "false");
      btnToggle.setAttribute("aria-pressed", isAllActive ? "true" : "false");
      btnToggle.setAttribute("title", tipLabel);
      btnToggle.setAttribute("aria-label", tipLabel);
    }
  },

  toggleAllMonthlyTrendsNumbers() {
    const allDots = Array.from(document.querySelectorAll(".chart-interactive-dot"));
    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }

    let allKeys = allDots.map((c) => `${c.getAttribute("data-type")}_${c.getAttribute("data-month")}`);
    if (allKeys.length === 0 && Array.isArray(this._lastSplinePoints)) {
      allKeys = [];
      this._lastSplinePoints.forEach((pt) => {
        allKeys.push(`import_${pt.label}`);
        allKeys.push(`export_${pt.label}`);
      });
    }
    const isAllActive = allKeys.length > 0 && this.activeMonthlyChartDots.size >= allKeys.length;

    if (isAllActive) {
      this.showAllMonthlyTrendsNumbers = false;
      this.activeMonthlyChartDots.clear();
      this.activeMonthlySeries = null;
    } else {
      this.showAllMonthlyTrendsNumbers = true;
      allKeys.forEach((k) => this.activeMonthlyChartDots.add(k));
      this.activeMonthlySeries = null;
    }

    this.renderMonthlyTrendsChartLabels();
  },

  onMonthlyTrendsFilterModeChange() {
    this.renderRevenueAnalyticsView();
  },

  // Khối 3: Biểu đồ đường cong Spline 100% từ đơn hàng thực tế <= Date.now() (xóa sạch patternRec & tỷ lệ giả)
  renderMonthlyTrendsByFilter(precomputedCtx) {
    const ctx = precomputedCtx || this._lastRevContext || this.getRevenueActiveFilterContext();
    const allMonths = ctx.allMonths || this.getMonthlyHistoricalDataset();
    const orderedKeys = Object.keys(allMonths).sort();
    const pad = (n) => String(n).padStart(2, "0");

    let labels = [];
    let fullLabels = [];
    let importVals = [];
    let exportVals = [];

    const countOrdersInRange = (ordersList, fromMs, toMs) => {
      let rec = 0;
      let exp = 0;
      ordersList.forEach((o) => {
        const ts = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(o) : Number(o.timestampMs) || 0;
        if (ts >= fromMs && ts <= toMs) {
          rec += 1;
          if (o.status === "ALLOCATED" && o.platformStatus !== "CANCELLED") {
            exp += 1;
          }
        }
      });
      return { rec, exp };
    };

    if (ctx.mode === "ALL") {
      orderedKeys.forEach((mk) => {
        const mObj = allMonths[mk];
        if (!mObj) return;
        labels.push(mObj.shortLabel);
        fullLabels.push(mObj.label);
        importVals.push(Number(mObj.received || 0));
        exportVals.push(Number(mObj.exported || 0));
      });
    } else if (ctx.mode === "QUARTER") {
      const [yStr, qPart] = String(ctx.quarterKey || "2026-Q4").split("-Q");
      const qY = Number(yStr) || new Date().getFullYear();
      const qNum = Number(qPart) || 4;
      const startM = (qNum - 1) * 3 + 1;
      for (let m = startM; m < startM + 3; m++) {
        const mk = `${qY}-${pad(m)}`;
        const mObj = allMonths[mk];
        if (!mObj) continue;
        labels.push(mObj.shortLabel);
        fullLabels.push(mObj.label);
        importVals.push(Number(mObj.received || 0));
        exportVals.push(Number(mObj.exported || 0));
      }
    } else if (ctx.mode === "MONTH") {
      const [yStr, mStr] = String(ctx.monthKey || "2026-11").split("-");
      const my = Number(yStr) || new Date().getFullYear();
      const mm = Number(mStr) || new Date().getMonth() + 1;
      const lastDay = new Date(my, mm, 0).getDate();
      const buckets = [
        { short: "Tuần 1", full: `Tuần 1 (01–07/${pad(mm)})`, d1: 1, d2: 7 },
        { short: "Tuần 2", full: `Tuần 2 (08–14/${pad(mm)})`, d1: 8, d2: 14 },
        { short: "Tuần 3", full: `Tuần 3 (15–21/${pad(mm)})`, d1: 15, d2: 21 },
        { short: "Tuần 4", full: `Tuần 4 (22–${pad(lastDay)}/${pad(mm)})`, d1: 22, d2: lastDay }
      ];
      buckets.forEach((b) => {
        const fromMs = new Date(my, mm - 1, b.d1, 0, 0, 0, 0).getTime();
        const toMs = Math.min(Date.now(), new Date(my, mm - 1, b.d2, 23, 59, 59, 999).getTime());
        const c = fromMs <= toMs ? countOrdersInRange(ctx.orders, fromMs, toMs) : { rec: 0, exp: 0 };
        labels.push(b.short);
        fullLabels.push(b.full);
        importVals.push(c.rec);
        exportVals.push(c.exp);
      });
    } else if (ctx.mode === "WEEK") {
      const startDt = new Date(ctx.startMs);
      const endDt = new Date(ctx.endMs);
      let cur = new Date(startDt.getFullYear(), startDt.getMonth(), startDt.getDate(), 0, 0, 0, 0);
      const limitEnd = new Date(endDt.getFullYear(), endDt.getMonth(), endDt.getDate(), 23, 59, 59, 999);
      let guard = 0;
      while (cur.getTime() <= limitEnd.getTime() && guard < 12) {
        const dayStart = cur.getTime();
        const dayEnd = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 23, 59, 59, 999).getTime();
        const dm = `${pad(cur.getDate())}/${pad(cur.getMonth() + 1)}`;
        const c = countOrdersInRange(ctx.orders, dayStart, dayEnd);
        labels.push(dm);
        fullLabels.push(`Ngày ${dm}/${cur.getFullYear()}`);
        importVals.push(c.rec);
        exportVals.push(c.exp);
        cur.setDate(cur.getDate() + 1);
        guard += 1;
      }
    } else if (ctx.mode === "DAY") {
      const sDt = new Date(ctx.startMs);
      const eDt = new Date(ctx.endMs);
      const startDay = new Date(sDt.getFullYear(), sDt.getMonth(), sDt.getDate(), 0, 0, 0, 0);
      const endDay = new Date(eDt.getFullYear(), eDt.getMonth(), eDt.getDate(), 23, 59, 59, 999);
      const totalDays = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / 86400000));

      if (totalDays <= 1) {
        const y = startDay.getFullYear();
        const m = startDay.getMonth();
        const d = startDay.getDate();
        const slots = [
          { lbl: "00h–06h", h1: 0, h2: 5 },
          { lbl: "06h–12h", h1: 6, h2: 11 },
          { lbl: "12h–18h", h1: 12, h2: 17 },
          { lbl: "18h–24h", h1: 18, h2: 23 }
        ];
        slots.forEach((sl) => {
          const fromMs = new Date(y, m, d, sl.h1, 0, 0, 0).getTime();
          const toMs = new Date(y, m, d, sl.h2, 59, 59, 999).getTime();
          const c = countOrdersInRange(ctx.orders, fromMs, toMs);
          labels.push(sl.lbl);
          fullLabels.push(`${pad(d)}/${pad(m + 1)}/${y} (${sl.lbl})`);
          importVals.push(c.rec);
          exportVals.push(c.exp);
        });
      } else if (totalDays <= 14) {
        let cur = new Date(startDay.getTime());
        while (cur.getTime() <= endDay.getTime()) {
          const fromMs = cur.getTime();
          const toMs = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 23, 59, 59, 999).getTime();
          const dm = `${pad(cur.getDate())}/${pad(cur.getMonth() + 1)}`;
          const c = countOrdersInRange(ctx.orders, fromMs, toMs);
          labels.push(dm);
          fullLabels.push(`Ngày ${dm}/${cur.getFullYear()}`);
          importVals.push(c.rec);
          exportVals.push(c.exp);
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        const bucketsCount = 6;
        const spanMs = Math.max(1, endDay.getTime() - startDay.getTime());
        for (let i = 0; i < bucketsCount; i++) {
          const fromMs = Math.round(startDay.getTime() + (spanMs * i) / bucketsCount);
          const toMs =
            i === bucketsCount - 1
              ? endDay.getTime()
              : Math.round(startDay.getTime() + (spanMs * (i + 1)) / bucketsCount) - 1;
          const bStartDt = new Date(fromMs);
          const bEndDt = new Date(toMs);
          const lbl = `${pad(bEndDt.getDate())}/${pad(bEndDt.getMonth() + 1)}`;
          const full = `${pad(bStartDt.getDate())}/${pad(bStartDt.getMonth() + 1)} – ${lbl}/${bEndDt.getFullYear()}`;
          const c = countOrdersInRange(ctx.orders, fromMs, toMs);
          labels.push(lbl);
          fullLabels.push(full);
          importVals.push(c.rec);
          exportVals.push(c.exp);
        }
      }
    }

    const subEl = document.getElementById("monthlyTrendsSubtitle");
    if (subEl) {
      const overallRate =
        ctx.totalReceived > 0 ? Math.min(100, Math.round((ctx.totalExported / ctx.totalReceived) * 1000) / 10) : 0;
      const overallRateText = this.formatSplineRatePct(overallRate);
      subEl.innerHTML = `<strong>${ctx.totalReceived}</strong> tiếp nhận · <strong>${ctx.totalExported}</strong> xuất · <strong>${overallRateText}</strong>`;
    }

    this.updateMonthlyTrendsSplineSvg({
      labels,
      fullLabels,
      importVals,
      exportVals,
      totalReceived: ctx.totalReceived
    });
  },

  updateMonthlyTrendsSplineSvg(data) {
    this.ensureMonthlySplineResizeBinding();
    this._lastSplineData = data;
    this.hideMonthlySplineHover();

    const { labels, fullLabels, importVals, exportVals, totalReceived } = data;
    const n = labels.length;
    const palette = this.getMonthlySplineThemeColors();

    const svgEl = document.getElementById("monthlyTrendsSplineSvg");
    const stageEl = document.getElementById("revSplineStage");
    const gridEl = document.getElementById("chartGridLines");
    const lineImp = document.getElementById("chartLineImport");
    const lineExp = document.getElementById("chartLineExport");
    const areaImp = document.getElementById("chartAreaImport");
    const areaExp = document.getElementById("chartAreaExport");
    const hitImp = document.getElementById("chartHitLineImport");
    const hitExp = document.getElementById("chartHitLineExport");
    const dotsImpGroup = document.getElementById("chartDotsImport");
    const dotsExpGroup = document.getElementById("chartDotsExportGroup");
    const xAxisEl = document.getElementById("chartXAxisLabels");
    const yAxisLeftEl = document.getElementById("chartYAxisLabels");
    const yAxisRightEl = document.getElementById("chartYAxisRightLabels");
    const emptyOverlay = document.getElementById("chartEmptyOverlay");

    // Tính bề rộng vẽ thực tế để đồ thị bung khít 100% chiều ngang thẻ (1200px–1920px)
    const liveW = stageEl && stageEl.clientWidth > 0 ? stageEl.clientWidth : 0;
    if (liveW > 0) {
      this._lastMeasuredSplineW = liveW;
    }
    const measuredW = liveW || this._lastMeasuredSplineW || 1080;
    const svgW = Math.max(720, Math.round(measuredW));
    const svgH = 264;
    const padL = 14;
    const padR = svgW - 14;
    const padT = 36;
    const padB = 226;
    const plotH = padB - padT;

    if (svgEl) {
      svgEl.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
    }

    // Đồng bộ tọa độ gradientUnits="userSpaceOnUse" theo khung padT -> padB và stop màu Sáng / Tối
    const gradImp = document.getElementById("gradAreaImport");
    const gradExp = document.getElementById("gradAreaExport");
    [gradImp, gradExp].forEach((gradEl) => {
      if (!gradEl) return;
      gradEl.setAttribute("gradientUnits", "userSpaceOnUse");
      gradEl.setAttribute("x1", "0");
      gradEl.setAttribute("y1", String(padT));
      gradEl.setAttribute("x2", "0");
      gradEl.setAttribute("y2", String(padB));
    });
    const syncStop = (id, color, pair) => {
      const el = document.getElementById(id);
      if (!el || !pair) return;
      el.setAttribute("offset", pair[0]);
      el.setAttribute("stop-color", color);
      el.setAttribute("stop-opacity", pair[1]);
    };
    syncStop("gradStopImportTop", palette.importGlow, palette.importStops.top);
    syncStop("gradStopImportMid", palette.importGlow, palette.importStops.mid);
    syncStop("gradStopImportLow", palette.importGlow, palette.importStops.low);
    syncStop("gradStopImportBottom", palette.importGlow, palette.importStops.bottom);
    syncStop("gradStopExportTop", palette.exportGlow, palette.exportStops.top);
    syncStop("gradStopExportMid", palette.exportGlow, palette.exportStops.mid);
    syncStop("gradStopExportFade", palette.exportGlow, palette.exportStops.fade);
    syncStop("gradStopExportBottom", palette.exportGlow, palette.exportStops.bottom);

    if (lineImp) {
      lineImp.setAttribute("stroke", palette.importLine);
      lineImp.setAttribute("stroke-width", "2.2");
    }
    if (lineExp) {
      lineExp.setAttribute("stroke", palette.exportLine);
      lineExp.setAttribute("stroke-width", "2.2");
      if (typeof lineExp.removeAttribute === "function") {
        lineExp.removeAttribute("stroke-dasharray");
      }
    }
    if (dotsImpGroup) dotsImpGroup.setAttribute("fill", palette.importLine);
    if (dotsExpGroup) dotsExpGroup.setAttribute("fill", palette.exportLine);

    const renderGridAndAxes = (yMaxLeft) => {
      const leftStep = yMaxLeft / 4;
      if (gridEl) {
        let gMarkup = "";
        for (let i = 0; i <= 4; i++) {
          const gy = Math.round(padB - (i / 4) * plotH);
          const cls = i === 0 ? ' class="rev-spline-axis-base"' : "";
          gMarkup += `<line x1="${padL}" y1="${gy}" x2="${padR}" y2="${gy}"${cls} />`;
        }
        gridEl.innerHTML = gMarkup;
      }
      if (yAxisLeftEl) {
        let ylMarkup = "";
        for (let i = 0; i <= 4; i++) {
          const gy = Math.round(padB - (i / 4) * plotH);
          const val = Math.round(i * leftStep);
          const lbl = i === 4 ? `${val} đơn` : String(val);
          const topCls = i === 4 ? ' class="rev-y-top-unit"' : "";
          ylMarkup += `<text x="${padL + 2}" y="${gy - 4}" text-anchor="start"${topCls}>${lbl}</text>`;
        }
        yAxisLeftEl.innerHTML = ylMarkup;
      }
      if (yAxisRightEl) {
        let yrMarkup = "";
        for (let i = 0; i <= 4; i++) {
          const gy = Math.round(padB - (i / 4) * plotH);
          const pctVal = i * 25;
          yrMarkup += `<text x="${padR - 2}" y="${gy - 4}" text-anchor="end">${pctVal}%</text>`;
        }
        yAxisRightEl.innerHTML = yrMarkup;
      }
    };

    if (n === 0 || (totalReceived !== undefined && totalReceived === 0)) {
      this._lastSplineMetrics = { svgW, svgH, padL, padR, padT, padB, plotH, stepX: 0, yMaxLeft: 4 };
      this._lastSplinePoints = [];
      renderGridAndAxes(4);
      [lineImp, lineExp, areaImp, areaExp, hitImp, hitExp].forEach((el) => {
        if (el) el.setAttribute("d", "");
      });
      if (dotsImpGroup) dotsImpGroup.innerHTML = "";
      if (dotsExpGroup) dotsExpGroup.innerHTML = "";
      if (xAxisEl) xAxisEl.innerHTML = "";
      if (emptyOverlay) {
        const midX = Math.round(svgW / 2);
        emptyOverlay.innerHTML = `
          <text x="${midX}" y="122" text-anchor="middle" font-size="13" font-weight="700" class="rev-spline-empty-title">Chưa có dữ liệu đơn hàng trong kỳ đang chọn</text>
          <text x="${midX}" y="142" text-anchor="middle" font-size="11.5" class="rev-spline-empty-sub">Chọn "Tất cả thời gian" hoặc kỳ khác trên thanh lọc đầu trang</text>
        `;
      }
      if (this.activeMonthlyChartDots) {
        this.activeMonthlyChartDots.clear();
        this.activeMonthlySeries = null;
      }
      this.renderMonthlyTrendsChartLabels();
      return;
    }

    if (emptyOverlay) emptyOverlay.innerHTML = "";

    // Trục tung TRÁI sát trần chia hết cho 4 (VD: đỉnh 19 đơn -> 0, 5, 10, 15, 20 đơn -> tách rõ điểm cắt 11/2026)
    const rawMaxLeft = Math.max(4, ...importVals);
    const leftStep = Math.max(1, Math.ceil((rawMaxLeft * 1.05) / 4));
    const yMaxLeft = leftStep * 4;

    renderGridAndAxes(yMaxLeft);

    const xStart = padL + 64;
    const xEnd = padR - 64;
    const stepX = n > 1 ? (xEnd - xStart) / (n - 1) : 0;

    this._lastSplineMetrics = { svgW, svgH, padL, padR, padT, padB, plotH, xStart, xEnd, stepX, yMaxLeft };

    const getX = (i) => (n === 1 ? Math.round((xStart + xEnd) / 2) : Math.round(xStart + i * stepX));
    const getYLeft = (val) => Math.round(padB - (val / yMaxLeft) * plotH);
    const getYRight = (ratePct) => Math.round(padB - (Math.max(0, Math.min(100, ratePct)) / 100) * plotH);

    const points = labels.map((lbl, i) => {
      const impVal = Number(importVals[i] || 0);
      const expVal = Number(exportVals[i] || 0);
      const ratePct = impVal > 0 ? Math.min(100, Math.round((expVal / impVal) * 1000) / 10) : 0;
      const rateText = this.formatSplineRatePct(ratePct);
      const x = getX(i);
      const yImport = getYLeft(impVal);
      const yRate = getYRight(ratePct);
      return {
        label: lbl,
        full: fullLabels[i] || lbl,
        x,
        impVal,
        expVal,
        ratePct,
        rateText,
        yImport,
        yRate
      };
    });

    this._lastSplinePoints = points;

    const buildSplinePath = (coords) => {
      if (coords.length === 1) {
        return `M ${coords[0].x - 36} ${coords[0].y} L ${coords[0].x + 36} ${coords[0].y}`;
      }
      let d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const half = (p2.x - p1.x) / 2;
        d += ` C ${p1.x + half} ${p1.y}, ${p2.x - half} ${p2.y}, ${p2.x} ${p2.y}`;
      }
      return d;
    };

    const impCoords = points.map((p) => ({ x: p.x, y: p.yImport }));
    const rateCoords = points.map((p) => ({ x: p.x, y: p.yRate }));

    const impSpline = buildSplinePath(impCoords);
    const rateSpline = buildSplinePath(rateCoords);

    const areaLeftX = n === 1 ? points[0].x - 36 : xStart;
    const areaRightX = n === 1 ? points[0].x + 36 : xEnd;
    const impAreaD = `${impSpline} L ${areaRightX} ${padB} L ${areaLeftX} ${padB} Z`;
    const rateAreaD = `${rateSpline} L ${areaRightX} ${padB} L ${areaLeftX} ${padB} Z`;

    if (lineImp) lineImp.setAttribute("d", impSpline);
    if (lineExp) lineExp.setAttribute("d", rateSpline);
    if (areaImp) areaImp.setAttribute("d", impAreaD);
    if (areaExp) areaExp.setAttribute("d", rateAreaD);
    if (hitImp) hitImp.setAttribute("d", impSpline);
    if (hitExp) hitExp.setAttribute("d", rateSpline);

    if (xAxisEl) {
      const labelFontSize = n > 14 ? 10 : 11.5;
      let xMarkup = "";
      for (let i = 0; i < n; i++) {
        xMarkup += `<text x="${points[i].x}" y="${padB + 20}" font-size="${labelFontSize}" data-month="${points[i].label}">${points[i].label}</text>`;
      }
      xAxisEl.innerHTML = xMarkup;
    }

    if (dotsImpGroup) {
      let dMarkup = "";
      points.forEach((pt) => {
        const tip = `${pt.label} — Đơn tiếp nhận: ${pt.impVal} đơn · Xuất hàng: ${pt.expVal} đơn (${pt.rateText})`;
        dMarkup += `<circle cx="${pt.x}" cy="${pt.yImport}" r="4" class="chart-interactive-dot" data-type="import" data-month="${pt.label}" data-month-name="${pt.full}" data-val="${pt.impVal}" data-series="Đơn tiếp nhận" onclick="AppUI.handleMonthlyChartDotClick(this)"><title>${tip}</title></circle>`;
      });
      dotsImpGroup.innerHTML = dMarkup;
    }

    if (dotsExpGroup) {
      let dMarkup = "";
      points.forEach((pt) => {
        const tip = `${pt.label} — Tỷ lệ xuất hàng: ${pt.rateText} (${pt.expVal}/${pt.impVal} đơn)`;
        dMarkup += `<circle cx="${pt.x}" cy="${pt.yRate}" r="4" class="chart-interactive-dot" data-type="export" data-month="${pt.label}" data-month-name="${pt.full}" data-val="${pt.rateText}" data-rate="${pt.ratePct}" data-series="Tỷ lệ xuất hàng" onclick="AppUI.handleMonthlyChartDotClick(this)"><title>${tip}</title></circle>`;
      });
      dotsExpGroup.innerHTML = dMarkup;
    }

    if (!this.activeMonthlyChartDots) {
      this.activeMonthlyChartDots = new Set();
    }
    if (this.activeMonthlySeries === "import") {
      this.activeMonthlyChartDots.clear();
      points.forEach((p) => this.activeMonthlyChartDots.add(`import_${p.label}`));
    } else if (this.activeMonthlySeries === "export") {
      this.activeMonthlyChartDots.clear();
      points.forEach((p) => this.activeMonthlyChartDots.add(`export_${p.label}`));
    } else if (this.showAllMonthlyTrendsNumbers) {
      this.activeMonthlyChartDots.clear();
      points.forEach((p) => {
        this.activeMonthlyChartDots.add(`import_${p.label}`);
        this.activeMonthlyChartDots.add(`export_${p.label}`);
      });
    } else {
      this.activeMonthlyChartDots.clear();
      this.activeMonthlySeries = null;
    }

    this.renderMonthlyTrendsChartLabels();
  },

  toggleChannelConnection(chKey) {
    window.omsEngine.toggleChannelConnection(chKey);
    this.triggerChannelSyncAnimation();
    this.renderAll();
  },

  setChannelConnection(chKey, targetState) {
    const ch = window.omsEngine && window.omsEngine.channels && window.omsEngine.channels[chKey];
    if (!ch) return;
    const isCurrentlyConnected = ch.isConnected !== false;
    if (isCurrentlyConnected === Boolean(targetState)) return;
    this.toggleChannelConnection(chKey);
  },

  renderChannelStrip() {
    this.updateIngestConnectedChannelsHint();
    const container = document.getElementById("channelStripContainer");
    const miniStrip = document.getElementById("ingestChannelMiniStrip");
    if (!container && !miniStrip) return;
    if (!window.omsEngine || !window.omsEngine.channels) return;

    const orders = typeof this.getValidOrdersUpToNow === "function" ? this.getValidOrdersUpToNow() : window.omsEngine.orders;
    const inv = typeof this.getEffectiveInventoryAtNow === "function" ? this.getEffectiveInventoryAtNow() : window.omsEngine.inventory;
    const channels = window.omsEngine.channels;

    const channelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];

    if (miniStrip) {
      miniStrip.innerHTML = channelKeys
        .map((chKey) => {
          const ch = channels[chKey];
          if (!ch) return "";
          const chOrders = orders.filter((o) => o.channel === chKey).length;
          const isConnected = ch.isConnected !== false;
          const displayName = chKey === "POS" ? "Cửa hàng POS" : ch.shortName || chKey;
          const toggleTitle = isConnected
            ? `Đang kết nối ${displayName} (${chOrders} đơn) — nhấn để tạm ngưng kết nối`
            : `Đang tạm ngưng ${displayName} — nhấn để bật lại kết nối`;
          return `
          <button
            type="button"
            class="ingest-channel-mini-item channel-card${isConnected ? "" : " is-paused"}"
            id="ingest-mini-ch-${chKey}"
            aria-pressed="${isConnected ? "true" : "false"}"
            title="${toggleTitle}"
            onclick="AppUI.setChannelConnection('${chKey}', ${!isConnected})"
          >
            <span class="ingest-mini-head">
              <span class="ingest-mini-name">${displayName}</span>
              <span class="ingest-mini-dot ${isConnected ? "is-connected" : "is-paused"}" aria-hidden="true"></span>
            </span>
            <span class="ingest-mini-meta">${isConnected ? `${chOrders} đơn` : "Tạm ngưng"}</span>
          </button>
        `;
        })
        .join("");
    }

    if (!container) return;

    container.innerHTML = channelKeys
      .map((chKey) => {
        const ch = channels[chKey];
        const chOrders = orders.filter((o) => o.channel === chKey).length;
        const heldUnits = inv.reduce((sum, item) => sum + ((item.effectiveChannelReserved || item.channelReserved || {})[chKey] || 0), 0);
        const isConnected = ch.isConnected !== false;
        const hasSync = ch.syncCount > 0 && ch.lastSync && ch.lastSync !== "Chưa đồng bộ";
        const rawSyncStr = String(ch.lastSync || "").trim();
        const syncMatch = rawSyncStr.match(/^(\d{2}\.\d{2}\.\d{4})-(\d{2}:\d{2}:\d{2})$/);
        const formattedSyncTime = syncMatch ? `${syncMatch[2]} ${syncMatch[1]}` : rawSyncStr;

        const syncText = hasSync
          ? `Cập nhật: ${formattedSyncTime}`
          : "Chưa có biến động mới";

        return `
        <div class="settings-row channel-card settings-channel-row${isConnected ? "" : " channel-paused"}" id="ch-card-${chKey}">
          <div class="settings-row-label-group">
            <div class="settings-channel-title-line">
              <span class="settings-channel-swatch swatch-${chKey}" aria-hidden="true"></span>
              <span class="settings-row-label">${ch.shortName}</span>
            </div>
            <span class="settings-row-hint settings-channel-meta">
              Đơn tiếp nhận: <strong>${chOrders} đơn</strong> · Hàng chờ đóng gói: <strong>${heldUnits} SP</strong> · ${syncText}
            </span>
          </div>
          <div
            class="settings-segmented-control settings-channel-seg"
            role="group"
            aria-label="Trạng thái kết nối ${ch.shortName}"
          >
            <button
              type="button"
              class="settings-seg-btn settings-seg-text-btn is-channel-paused-btn${!isConnected ? " active" : ""}"
              aria-pressed="${!isConnected ? "true" : "false"}"
              title="Tạm ngưng nhận đơn và đưa tồn bán trên ${ch.shortName} về 0"
              onclick="AppUI.setChannelConnection('${chKey}', false)"
            >
              Tạm ngưng
            </button>
            <button
              type="button"
              class="settings-seg-btn settings-seg-text-btn is-channel-connected-btn${isConnected ? " active" : ""}"
              aria-pressed="${isConnected ? "true" : "false"}"
              title="Kết nối và đồng bộ số lượng sẵn sàng bán lên ${ch.shortName}"
              onclick="AppUI.setChannelConnection('${chKey}', true)"
            >
              Đang kết nối
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  },

  renderActionableAlerts() {
    const container = document.getElementById("actionableAlertsContainer");
    if (!container) return;

    const validOrders = typeof this.getValidOrdersUpToNow === "function" ? this.getValidOrdersUpToNow() : window.omsEngine.orders;
    const effectiveInv = typeof this.getEffectiveInventoryAtNow === "function" ? this.getEffectiveInventoryAtNow() : window.omsEngine.inventory;
    const backorders = validOrders.filter((o) => o.status === "BACKORDER");
    const invalids = validOrders.filter((o) => o.status === "INVALID");
    const zeroSkus = effectiveInv.filter((i) => (i.effectiveAvailableStock ?? i.availableStock) === 0);

    const items = [];

    backorders.forEach((o) => {
      items.push(`
        <div class="alert-row-item urgent">
          <div class="alert-row-content">
            <div class="alert-row-title is-danger">
              <span class="odoms-flat-badge is-error">Chặn bán lố · Ưu tiên #${o.fifoRank}</span>
              <strong>Đơn ${o.orderId} (${o.channel})</strong>
            </div>
            <div class="alert-row-desc">
              Khách đặt <strong>${o.quantity} × ${o.sku}</strong> (${o.productName}) lúc ${this.formatLogDisplayTimestamp(o.orderTime, o.timestampMs)} nhưng tồn khả dụng = 0. Hệ thống đã khóa xuất âm kho.
            </div>
          </div>
          <button type="button" class="btn btn-primary odoms-btn-34" onclick="AppUI.handleRestock('${o.sku}', 5)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nhập bù +5 (${o.sku})
          </button>
        </div>
      `);
    });

    invalids.forEach((o) => {
      items.push(`
        <div class="alert-row-item">
          <div class="alert-row-content">
            <div class="alert-row-title is-warning">
              <span class="odoms-flat-badge is-warning">Đơn lỗi hợp lệ · Bước 2</span>
              <strong>Đơn ${o.orderId} (${o.channel})</strong>
            </div>
            <div class="alert-row-desc">
              Nguyên nhân chặn: <strong>${o.validationErrors.join("; ")}</strong> — Không thực hiện trừ nhầm tồn kho nội bộ.
            </div>
          </div>
          <button type="button" class="btn btn-outline odoms-btn-34" onclick="AppUI.openOrderAuditModal('${o.orderId}')">
            Xem lưu vết
          </button>
        </div>
      `);
    });

    if (items.length === 0 && zeroSkus.length === 0) {
      container.innerHTML = `
        <div class="odoms-empty-state">
          Tất cả đơn hàng và lượng hàng sẵn sàng bán đều ở trạng thái an toàn. Bạn có thể nhấn <strong>"Đồng bộ đơn 5 kênh"</strong> trên thanh công cụ để nhận dữ liệu mẫu.
        </div>
      `;
      return;
    }

    container.innerHTML = items.join("");
  },

  getFilteredIngestOrders() {
    const validOrders =
      typeof this.getValidOrdersUpToNow === "function"
        ? this.getValidOrdersUpToNow()
        : window.omsEngine && Array.isArray(window.omsEngine.orders)
          ? window.omsEngine.orders
          : [];

    const isUrgentOrder = (o) => {
      const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
      if (ps === "CANCELLED" || o.status === "CANCELLED" || o.status === "INVALID") return false;
      return ps === "UNCONFIRMED" || o.status === "BACKORDER";
    };

    const urgentCount = validOrders.filter(isUrgentOrder).length;
    let list = [...validOrders];

    if (this.ordersQuickMode === "URGENT") {
      list = list.filter(isUrgentOrder);
    }

    if (this.currentChannelFilter && this.currentChannelFilter !== "ALL") {
      list = list.filter((o) => o.channel === this.currentChannelFilter);
    }
    if (this.currentStatusFilter && this.currentStatusFilter !== "ALL") {
      list = list.filter((o) => {
        const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        return ps === this.currentStatusFilter || o.status === this.currentStatusFilter;
      });
    }
    if (this.searchQuery) {
      const q = this.searchQuery;
      list = list.filter(
        (o) =>
          String(o.orderId || "").toLowerCase().includes(q) ||
          String(o.sku || "").toLowerCase().includes(q) ||
          String(o.customerName || "").toLowerCase().includes(q) ||
          String(o.productName || "").toLowerCase().includes(q)
      );
    }

    if (this.ordersQuickMode === "URGENT" && !this.ordersUrgentManualSort) {
      list.sort((a, b) => {
        const rankA = a.status === "BACKORDER" ? 0 : 1;
        const rankB = b.status === "BACKORDER" ? 0 : 1;
        if (rankA !== rankB) return rankA - rankB;
        return (Number(b.timestampMs) || 0) - (Number(a.timestampMs) || 0);
      });
    } else {
      list.sort((a, b) =>
        this.orderSortMode === "OLDEST_FIRST"
          ? (Number(a.timestampMs) || 0) - (Number(b.timestampMs) || 0)
          : (Number(b.timestampMs) || 0) - (Number(a.timestampMs) || 0)
      );
    }

    return { validOrders, list, urgentCount };
  },

  setOrdersQuickMode(mode) {
    this.ordersQuickMode = mode === "URGENT" ? "URGENT" : "ALL";
    this.ordersUrgentManualSort = false;
    this.currentOrdersPage = 1;
    if (this.ingestSelectedOrderIds) this.ingestSelectedOrderIds.clear();
    this.renderOrdersTable();
  },

  toggleOrdersFilterDrawer(forceOpen) {
    this.ordersFilterDrawerOpen = typeof forceOpen === "boolean" ? forceOpen : !this.ordersFilterDrawerOpen;
    const drawer = document.getElementById("ordersAdvancedFilterDrawer");
    const btn = document.getElementById("btnToggleOrdersFilterDrawer");
    if (drawer) {
      drawer.classList.toggle("hidden", !this.ordersFilterDrawerOpen);
    }
    if (btn) {
      btn.setAttribute("aria-expanded", this.ordersFilterDrawerOpen ? "true" : "false");
      btn.classList.toggle("is-open", this.ordersFilterDrawerOpen);
    }
  },

  syncOrdersFilterDrawerBadge() {
    let activeCount = 0;
    if (this.currentChannelFilter && this.currentChannelFilter !== "ALL") activeCount += 1;
    if (this.currentStatusFilter && this.currentStatusFilter !== "ALL") activeCount += 1;
    if (this.orderSortMode && this.orderSortMode !== "NEWEST_FIRST") activeCount += 1;

    const badge = document.getElementById("ordersActiveFilterCount");
    const btn = document.getElementById("btnToggleOrdersFilterDrawer");
    const drawer = document.getElementById("ordersAdvancedFilterDrawer");

    if (badge) {
      badge.innerText = String(activeCount);
      badge.classList.toggle("hidden", activeCount === 0);
    }
    if (btn) {
      btn.classList.toggle("has-active-filters", activeCount > 0);
      btn.classList.toggle("is-open", Boolean(this.ordersFilterDrawerOpen));
      btn.setAttribute("aria-expanded", this.ordersFilterDrawerOpen ? "true" : "false");
    }
    if (drawer) {
      drawer.classList.toggle("hidden", !this.ordersFilterDrawerOpen);
    }

    const chSel = document.getElementById("orderChannelFilterSelect");
    if (chSel && chSel.value !== this.currentChannelFilter) {
      chSel.value = this.currentChannelFilter || "ALL";
    }
    const stSel = document.getElementById("statusFilterSelect");
    if (stSel && stSel.value !== this.currentStatusFilter) {
      stSel.value = this.currentStatusFilter || "ALL";
    }
    const ruleSel = document.getElementById("allocationRuleSelect");
    if (ruleSel && ruleSel.value !== this.orderSortMode) {
      ruleSel.value = this.orderSortMode || "NEWEST_FIRST";
    }
  },

  syncOrdersTimeSortIcon() {
    const icon = document.getElementById("ordersTimeSortIcon");
    if (icon) {
      icon.classList.toggle("is-asc", this.orderSortMode === "OLDEST_FIRST");
    }
  },

  toggleOrdersTimeSort() {
    this.orderSortMode = this.orderSortMode === "OLDEST_FIRST" ? "NEWEST_FIRST" : "OLDEST_FIRST";
    this.ordersUrgentManualSort = true;
    this.currentOrdersPage = 1;
    const ruleSelect = document.getElementById("allocationRuleSelect");
    if (ruleSelect) ruleSelect.value = this.orderSortMode;
    this.renderOrdersTable();
  },

  resetOrdersFilters() {
    this.ordersQuickMode = "ALL";
    this.ordersUrgentManualSort = false;
    this.currentChannelFilter = "ALL";
    this.currentStatusFilter = "ALL";
    this.orderSortMode = "NEWEST_FIRST";
    this.searchQuery = "";
    this.currentOrdersPage = 1;
    if (this.ingestSelectedOrderIds) this.ingestSelectedOrderIds.clear();

    const searchInput = document.getElementById("orderSearchInput");
    if (searchInput) searchInput.value = "";
    const chSel = document.getElementById("orderChannelFilterSelect");
    if (chSel) chSel.value = "ALL";
    const stSel = document.getElementById("statusFilterSelect");
    if (stSel) stSel.value = "ALL";
    const ruleSel = document.getElementById("allocationRuleSelect");
    if (ruleSel) ruleSel.value = "NEWEST_FIRST";

    this.renderOrdersTable();
  },

  syncIngestBatchControls(pageItems) {
    if (!this.ingestSelectedOrderIds) this.ingestSelectedOrderIds = new Set();
    const pageUnconfirmedIds = (pageItems || [])
      .filter((o) => {
        const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        return ps === "UNCONFIRMED" && o.status !== "CANCELLED" && o.status !== "INVALID";
      })
      .map((o) => o.orderId);

    const selectAllEl = document.getElementById("ingestSelectAllOrders");
    if (selectAllEl) {
      if (pageUnconfirmedIds.length === 0) {
        selectAllEl.checked = false;
        selectAllEl.indeterminate = false;
        selectAllEl.disabled = true;
      } else {
        const selectedOnPage = pageUnconfirmedIds.filter((id) => this.ingestSelectedOrderIds.has(id)).length;
        selectAllEl.disabled = false;
        selectAllEl.checked = selectedOnPage === pageUnconfirmedIds.length;
        selectAllEl.indeterminate = selectedOnPage > 0 && selectedOnPage < pageUnconfirmedIds.length;
      }
    }

    const selectedTotal = this.ingestSelectedOrderIds.size;
    const batchBtn = document.getElementById("btnIngestBatchApprove");
    const batchLabel = document.getElementById("ingestBatchApproveLabel");
    if (batchBtn) {
      batchBtn.disabled = selectedTotal === 0;
      batchBtn.title =
        selectedTotal > 0
          ? `Xác nhận giữ hàng cho ${selectedTotal} đơn chờ xác nhận đang chọn`
          : "Tích chọn các đơn chờ xác nhận để duyệt hàng loạt";
    }
    if (batchLabel) {
      batchLabel.innerText = selectedTotal > 0 ? `Duyệt hàng loạt (${selectedTotal})` : "Duyệt hàng loạt";
    }
  },

  toggleSelectAllIngestOrders(checked) {
    if (!this.ingestSelectedOrderIds) this.ingestSelectedOrderIds = new Set();
    const { list } = this.getFilteredIngestOrders();
    const pageSize = Math.max(1, Number(this.ordersPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const page = Math.min(Math.max(1, Number(this.currentOrdersPage) || 1), totalPages);
    const startIdx = (page - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    pageItems.forEach((o) => {
      const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
      if (ps === "UNCONFIRMED" && o.status !== "CANCELLED" && o.status !== "INVALID") {
        if (checked) {
          this.ingestSelectedOrderIds.add(o.orderId);
        } else {
          this.ingestSelectedOrderIds.delete(o.orderId);
        }
      }
    });
    this.renderOrdersTable();
  },

  toggleIngestOrderCheck(orderId, checked) {
    if (!this.ingestSelectedOrderIds) this.ingestSelectedOrderIds = new Set();
    if (checked) {
      const ord = window.omsEngine && Array.isArray(window.omsEngine.orders)
        ? window.omsEngine.orders.find((o) => o.orderId === orderId)
        : null;
      if (ord && ord.platformStatus === "UNCONFIRMED" && ord.status !== "CANCELLED" && ord.status !== "INVALID") {
        this.ingestSelectedOrderIds.add(orderId);
      }
    } else {
      this.ingestSelectedOrderIds.delete(orderId);
    }

    const { list } = this.getFilteredIngestOrders();
    const pageSize = Math.max(1, Number(this.ordersPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const page = Math.min(Math.max(1, Number(this.currentOrdersPage) || 1), totalPages);
    const startIdx = (page - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);
    this.syncIngestBatchControls(pageItems);
  },

  batchApproveIngestOrders() {
    if (!window.omsEngine || !this.ingestSelectedOrderIds || this.ingestSelectedOrderIds.size === 0) return;

    const eligibleOrders = [];
    this.ingestSelectedOrderIds.forEach((id) => {
      const ord = (window.omsEngine.orders || []).find((o) => o.orderId === id);
      if (ord && ord.platformStatus === "UNCONFIRMED" && ord.status !== "CANCELLED" && ord.status !== "INVALID") {
        eligibleOrders.push(ord);
      }
    });

    if (eligibleOrders.length === 0) {
      this.ingestSelectedOrderIds.clear();
      this.renderOrdersTable();
      return;
    }

    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforeTotalAvail = (window.omsEngine.inventory || []).reduce((s, it) => s + Number(it.availableStock || 0), 0);
    const beforeBackorderSet = new Set(
      (window.omsEngine.orders || [])
        .filter((o) => o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER")
        .map((o) => o.orderId)
    );

    const approvedIds = [];
    eligibleOrders.forEach((ord) => {
      ord.platformStatus = "CONFIRMED";
      approvedIds.push(ord.orderId);
    });

    this.ingestSelectedOrderIds.clear();
    window.omsEngine.recalculateAllAllocations();

    const count = approvedIds.length;
    const afterTotalAvail = (window.omsEngine.inventory || []).reduce((s, it) => s + Number(it.availableStock || 0), 0);
    const rec = window.omsEngine.recordReversibleAction({
      actionType: "BATCH_APPROVE_ORDERS",
      actionLabel: "Duyệt đơn hàng loạt",
      targetCode: `${count} đơn`,
      beforeSummary: `${count} đơn chờ xác nhận · Tổng tồn khả dụng: ${beforeTotalAvail}`,
      afterSummary: `Đã xác nhận ${count} đơn · Tổng tồn khả dụng: ${afterTotalAvail}`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

    const newlyShortedIds = new Set(
      (window.omsEngine.orders || [])
        .filter((o) => o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER" && (!beforeBackorderSet.has(o.orderId) || approvedIds.includes(o.orderId)))
        .map((o) => o.orderId)
    );
    this.dismissedShortageOrderIds = (this.dismissedShortageOrderIds || []).filter((id) => !newlyShortedIds.has(id));

    const previewCodes = approvedIds.slice(0, 5).join(", ") + (count > 5 ? "..." : "");
    window.omsEngine.addLog(
      "sync",
      `[DUYỆT HÀNG LOẠT] Đã xác nhận ${count} đơn hàng đang chờ duyệt (${previewCodes}) và cập nhật giữ hàng tự động.`
    );
    if (window.cloudSync) window.cloudSync.scheduleCloudPush("INGEST_BATCH_APPROVE");
    this.triggerChannelSyncAnimation();
    this.renderAll();
  },

  changeOrdersPage(delta) {
    const next = (Number(this.currentOrdersPage) || 1) + Number(delta || 0);
    this.currentOrdersPage = Math.max(1, next);
    this.renderOrdersTable();
  },

  renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    const countSpan = document.getElementById("orderCountLabel");
    if (!tbody) return;

    const { validOrders, list, urgentCount } = this.getFilteredIngestOrders();

    // Cập nhật cụm chuyển nhanh [ Tất cả đơn (M) | Cần xử lý (N) ]
    const btnQuickAll = document.getElementById("btnOrdersQuickAll");
    const btnQuickUrgent = document.getElementById("btnOrdersQuickUrgent");
    if (btnQuickAll) {
      const isAll = this.ordersQuickMode !== "URGENT";
      btnQuickAll.innerText = `Tất cả đơn (${validOrders.length})`;
      btnQuickAll.classList.toggle("active", isAll);
      btnQuickAll.setAttribute("aria-pressed", isAll ? "true" : "false");
    }
    if (btnQuickUrgent) {
      const isUrg = this.ordersQuickMode === "URGENT";
      btnQuickUrgent.innerText = `Cần xử lý (${urgentCount})`;
      btnQuickUrgent.classList.toggle("active", isUrg);
      btnQuickUrgent.setAttribute("aria-pressed", isUrg ? "true" : "false");
    }

    // Dọn các mã chọn đã đổi trạng thái hoặc không còn trong danh sách lọc
    if (!this.ingestSelectedOrderIds) this.ingestSelectedOrderIds = new Set();
    const eligibleInFiltered = new Set(
      list
        .filter((o) => {
          const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
          return ps === "UNCONFIRMED" && o.status !== "CANCELLED" && o.status !== "INVALID";
        })
        .map((o) => o.orderId)
    );
    Array.from(this.ingestSelectedOrderIds).forEach((id) => {
      if (!eligibleInFiltered.has(id)) this.ingestSelectedOrderIds.delete(id);
    });

    this.syncOrdersFilterDrawerBadge();
    this.syncOrdersTimeSortIcon();

    const totalFiltered = list.length;
    const pageSize = Math.max(1, Number(this.ordersPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    if (!this.currentOrdersPage || this.currentOrdersPage < 1) {
      this.currentOrdersPage = 1;
    } else if (this.currentOrdersPage > totalPages) {
      this.currentOrdersPage = totalPages;
    }

    const startIdx = (this.currentOrdersPage - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    if (countSpan) {
      countSpan.innerText = `Hiển thị ${totalFiltered} / ${validOrders.length} đơn hàng`;
    }

    const pagInfoEl = document.getElementById("ordersPaginationInfo");
    const pagCurEl = document.getElementById("ordersPaginationCurrent");
    const btnPrevEl = document.getElementById("btnOrdersPrevPage");
    const btnNextEl = document.getElementById("btnOrdersNextPage");

    if (pagInfoEl) {
      if (totalFiltered === 0) {
        pagInfoEl.innerText = "Hiển thị 0 / tổng 0 đơn hàng";
      } else {
        const showFrom = startIdx + 1;
        const showTo = Math.min(totalFiltered, startIdx + pageItems.length);
        pagInfoEl.innerText = `Hiển thị ${showFrom}–${showTo} / tổng ${totalFiltered} đơn hàng`;
      }
    }
    if (pagCurEl) {
      pagCurEl.innerText = `Trang ${this.currentOrdersPage} / ${totalPages}`;
    }
    if (btnPrevEl) {
      btnPrevEl.disabled = totalFiltered === 0 || this.currentOrdersPage <= 1;
    }
    if (btnNextEl) {
      btnNextEl.disabled = totalFiltered === 0 || this.currentOrdersPage >= totalPages;
    }

    this.syncIngestBatchControls(pageItems);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="8">
            <div class="odoms-empty-state">
              Chưa có đơn hàng nào khớp bộ lọc. Hãy nhấn <strong>"Đặt lại"</strong> trong bộ lọc hoặc bấm nút nhận đơn giả lập ở khung trên.
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const svgApproveIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
    const svgUnconfirmIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>`;
    const svgDetailIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    const svgWaybillIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><path d="M15 15h3v3"/><path d="M21 15v6h-6"/></svg>`;

    tbody.innerHTML = pageItems
      .map((ord) => {
        const ps = ord.platformStatus || (ord.status === "CANCELLED" || ord.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        const isCancelledOrInvalid = ps === "CANCELLED" || ord.status === "CANCELLED" || ord.status === "INVALID";
        const isUnconfirmed = !isCancelledOrInvalid && ps === "UNCONFIRMED";
        const isChecked = isUnconfirmed && this.ingestSelectedOrderIds.has(ord.orderId);
        const shortageQty = ord.stockSnapshot
          ? Math.max(1, (ord.quantity || 0) - (ord.stockSnapshot.before || 0))
          : Math.max(1, Number(ord.quantity || 0));

        let statusBadgeHtml = "";
        if (isCancelledOrInvalid) {
          statusBadgeHtml = `<span class="odoms-flat-badge is-error">Đã hủy</span>`;
        } else if (isUnconfirmed) {
          statusBadgeHtml = `<span class="odoms-flat-badge is-warning">Chờ xác nhận</span>`;
        } else if (ord.status === "BACKORDER") {
          statusBadgeHtml = `<span class="odoms-flat-badge is-error">Thiếu ${shortageQty} SP</span>`;
        } else {
          statusBadgeHtml = `<span class="odoms-flat-badge is-success">Đã giữ hàng</span>`;
        }

        const confirmBtnHtml = isCancelledOrInvalid
          ? `<button
              type="button"
              class="settings-seg-btn settings-action-icon-btn"
              disabled
              title="Đơn hàng đã hủy — không thể xác nhận"
              aria-label="Đơn hàng đã hủy"
            >
              ${svgApproveIcon}
            </button>`
          : isUnconfirmed
            ? `<button
                type="button"
                class="settings-seg-btn settings-action-icon-btn is-approve-btn"
                onclick="AppUI.handleToggleOrderConfirm('${ord.orderId}', true)"
                title="Xác nhận đơn hàng và giữ hàng"
                aria-label="Xác nhận đơn hàng ${ord.orderId}"
              >
                ${svgApproveIcon}
              </button>`
            : `<button
                type="button"
                class="settings-seg-btn settings-action-icon-btn is-unconfirm-btn"
                onclick="AppUI.handleToggleOrderConfirm('${ord.orderId}', false)"
                title="Chuyển về chờ xác nhận"
                aria-label="Chuyển đơn hàng ${ord.orderId} về chờ xác nhận"
              >
                ${svgUnconfirmIcon}
              </button>`;

        const waybillBtnHtml = isCancelledOrInvalid
          ? `<button
              type="button"
              class="settings-seg-btn settings-action-icon-btn"
              disabled
              title="Đơn hàng đã hủy — không tạo vận đơn"
              aria-label="Không thể tạo vận đơn cho đơn đã hủy"
            >
              ${svgWaybillIcon}
            </button>`
          : `<button
              type="button"
              class="settings-seg-btn settings-action-icon-btn"
              onclick="AppUI.openWaybillForOrder('${ord.orderId}')"
              title="Tạo mã vận đơn và in mã QR cho đơn này"
              aria-label="Tạo mã vận đơn và in mã QR cho đơn hàng ${ord.orderId}"
            >
              ${svgWaybillIcon}
            </button>`;

        const channelDisplay =
          (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[ord.channel] && window.CHANNELS_CONFIG[ord.channel].shortName) ||
          ord.channel;

        const fifoRankInline = ord.fifoRank
          ? `<span class="ord-prio-inline" title="Thứ tự ưu tiên giữ hàng theo thời gian đặt">#${ord.fifoRank}</span>`
          : "";

        const pm = ord.paymentMethod || "COD (Thanh toán khi nhận hàng)";
        const isCodOrder =
          pm.toUpperCase().includes("COD") ||
          pm.toLowerCase().includes("thu hộ") ||
          pm.toLowerCase().includes("khi nhận hàng");
        const codAmount = isCodOrder ? (Number(ord.quantity) || 0) * (Number(ord.unitPrice) || 0) : 0;
        const paymentHtml =
          codAmount > 0
            ? `<div class="ord-pay-stack">
                <span class="ord-pay-main">Thu hộ COD</span>
                <span class="ord-pay-sub">${codAmount.toLocaleString("vi-VN")} VND</span>
              </div>`
            : `<div class="ord-pay-stack">
                <span class="ord-pay-main">Đã thanh toán</span>
                <span class="ord-pay-sub">Không thu hộ</span>
              </div>`;

        const formattedOrderTime = this.formatLogDisplayTimestamp(ord.orderTime, ord.timestampMs);

        return `
        <tr>
          <td class="col-ord-check">
            <input
              type="checkbox"
              class="ingest-order-checkbox"
              ${isChecked ? "checked" : ""}
              ${isUnconfirmed ? "" : "disabled"}
              onchange="AppUI.toggleIngestOrderCheck('${ord.orderId}', this.checked)"
              title="${isUnconfirmed ? `Chọn đơn chờ xác nhận ${ord.orderId}` : "Chỉ chọn được đơn đang chờ xác nhận"}"
              aria-label="${isUnconfirmed ? `Chọn đơn chờ xác nhận ${ord.orderId}` : `Không thể chọn đơn ${ord.orderId}`}"
            />
          </td>
          <td class="col-ord-order">
            <div class="ord-order-line1">
              <span class="ord-id-code">${ord.orderId}</span>
              ${fifoRankInline}
            </div>
            <div class="ord-channel-sub">${channelDisplay}</div>
          </td>
          <td class="col-ord-time">
            <span class="ord-time-val">${formattedOrderTime}</span>
          </td>
          <td class="col-ord-product">
            <div class="ord-sku-code">${ord.sku}</div>
            <div class="ord-prod-name" title="${this.escapeLogHtml(ord.productName)}">${ord.productName}</div>
          </td>
          <td class="col-ord-qty"><span class="ord-qty-val">${ord.quantity}</span></td>
          <td class="col-ord-payment">${paymentHtml}</td>
          <td class="col-ord-status">
            ${statusBadgeHtml}
          </td>
          <td class="col-ord-actions">
            <div class="settings-segmented-control ord-action-seg" role="group" aria-label="Thao tác đơn hàng ${ord.orderId}">
              ${confirmBtnHtml}
              <button
                type="button"
                class="settings-seg-btn settings-action-icon-btn"
                onclick="AppUI.openOrderAuditModal('${ord.orderId}')"
                title="Xem chi tiết và nhật ký xử lý đơn hàng"
                aria-label="Xem chi tiết và nhật ký xử lý đơn hàng ${ord.orderId}"
              >
                ${svgDetailIcon}
              </button>
              ${waybillBtnHtml}
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
    const ordBefore = (window.omsEngine.orders || []).find((o) => o.orderId === orderId);
    if (!ordBefore || ordBefore.platformStatus === "CANCELLED" || ordBefore.status === "INVALID") return;

    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforeStatusText = window.omsEngine.getOrderStatusTextVi(ordBefore);
    const invBefore = (window.omsEngine.inventory || []).find((i) => i.sku === ordBefore.sku);
    const beforeAvail = invBefore ? Number(invBefore.availableStock || 0) : 0;

    const beforeBackorderSet = new Set(
      (window.omsEngine.orders || [])
        .filter((o) => o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER")
        .map((o) => o.orderId)
    );
    window.omsEngine.toggleOrderConfirmation(orderId, isChecked);

    const ordAfter = (window.omsEngine.orders || []).find((o) => o.orderId === orderId);
    const afterStatusText = window.omsEngine.getOrderStatusTextVi(ordAfter);
    const invAfter = (window.omsEngine.inventory || []).find((i) => i.sku === ordBefore.sku);
    const afterAvail = invAfter ? Number(invAfter.availableStock || 0) : beforeAvail;

    const rec = window.omsEngine.recordReversibleAction({
      actionType: isChecked ? "APPROVE_ORDER" : "UNCONFIRM_ORDER",
      actionLabel: isChecked ? "Duyệt đơn hàng" : "Chuyển chờ xác nhận",
      targetCode: orderId,
      beforeSummary: `Trạng thái: ${beforeStatusText} · Tồn khả dụng ${ordBefore.sku}: ${beforeAvail}`,
      afterSummary: `Trạng thái: ${afterStatusText} · Tồn khả dụng ${ordBefore.sku}: ${afterAvail}`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

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

  goToInventoryForShortage() {
    let targetFilter = "ALL";
    if (window.omsEngine && Array.isArray(window.omsEngine.orders)) {
      const nowMs = Date.now();
      const activeShortageOrders = window.omsEngine.orders.filter((o) => {
        const ordTs = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(o) : (Number(o.timestampMs) || 0);
        return o.platformStatus !== "UNCONFIRMED" && o.status === "BACKORDER" && ordTs <= nowMs;
      });
      if (activeShortageOrders.length > 0) {
        const effectiveInventory =
          typeof this.getEffectiveInventoryAtNow === "function"
            ? this.getEffectiveInventoryAtNow(window.omsEngine.inventory || [])
            : window.omsEngine.inventory || [];
        const shortageSkus = Array.from(new Set(activeShortageOrders.map((o) => o.sku).filter(Boolean)));
        const allOutOfStock =
          shortageSkus.length > 0 &&
          shortageSkus.every((sku) => {
            const invItem = effectiveInventory.find((i) => i.sku === sku);
            const avail = invItem ? (invItem.effectiveAvailableStock ?? invItem.availableStock ?? 0) : 0;
            return avail <= 0;
          });
        targetFilter = allOutOfStock ? "OUT" : "ALL";
      }
    }
    this.closeStockShortagePopup();
    this.switchSidebarTab("inventory");
    this.setInventoryStatusFilter(targetFilter);
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
    this.shortagePopupMobileExpanded = false;
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
          sku: skuKey,
          productName: prodName,
          totalRequestedQty: 0,
          availableStock: invItem ? invItem.effectiveAvailableStock ?? invItem.availableStock ?? 0 : 0
        };
      }
      groupedBySku[skuKey].totalRequestedQty += Number(o.quantity || 0);
    });

    const groupedList = Object.values(groupedBySku);
    const skuCodesSummary = groupedList.map((item) => item.sku).join(", ");
    const productItemsHtml = groupedList
      .map((item) => {
        const neededQty = Math.max(1, item.totalRequestedQty - item.availableStock);
        return `
          <div class="shortage-banner-sku-item">
            <div class="shortage-banner-sku-left">
              <code class="odoms-username-code">${item.sku}</code>
              <span class="shortage-banner-sku-name">${item.productName}</span>
            </div>
            <span class="shortage-banner-sku-need">Cần nhập bù: ${neededQty} SP (Tồn khả dụng: ${item.availableStock})</span>
          </div>
        `;
      })
      .join("");

    const isExpanded = Boolean(this.shortagePopupMobileExpanded);

    const svgWarn = `<svg class="shortage-banner-warn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const svgBox = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="0"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`;
    const svgChevron = `<svg class="shortage-banner-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
    const svgClose = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    popupEl.innerHTML = `
      <div class="shortage-banner-head" onclick="AppUI.toggleShortagePopupMobileExpand()">
        <div class="shortage-banner-title-wrap">
          ${svgWarn}
          <span class="shortage-banner-title">Cảnh báo thiếu hàng trong Kho</span>
          <span class="shortage-banner-summary">· ${shortageOrders.length} đơn xác nhận thiếu tồn (${skuCodesSummary})</span>
        </div>
        <div class="shortage-banner-controls">
          <button
            type="button"
            class="btn btn-danger odoms-btn-30 shortage-goto-inv-btn"
            onclick="event.stopPropagation(); AppUI.goToInventoryForShortage();"
          >
            ${svgBox}
            Vào Kho nhập hàng
          </button>
          <button
            type="button"
            id="btnToggleShortageBanner"
            class="shortage-banner-icon-btn${isExpanded ? " is-expanded" : ""}"
            onclick="event.stopPropagation(); AppUI.toggleShortagePopupMobileExpand();"
            title="Mở rộng / Thu gọn chi tiết"
            aria-label="Mở rộng / Thu gọn chi tiết"
            aria-expanded="${isExpanded ? "true" : "false"}"
          >
            ${svgChevron}
          </button>
          <button
            type="button"
            class="shortage-banner-icon-btn"
            onclick="event.stopPropagation(); AppUI.closeStockShortagePopup();"
            title="Đóng cảnh báo"
            aria-label="Đóng cảnh báo"
          >
            ${svgClose}
          </button>
        </div>
      </div>
      <div id="shortageBannerDetails" class="shortage-banner-body${isExpanded ? "" : " hidden"}">
        <div class="shortage-banner-body-desc">
          Có <strong>${shortageOrders.length} đơn hàng</strong> đã xác nhận nhưng tồn khả dụng trong kho không đủ. Vui lòng nhập bổ sung các mặt hàng sau:
        </div>
        <div class="shortage-banner-sku-list">${productItemsHtml}</div>
      </div>
    `;
    popupEl.classList.remove("hidden");
  },

  renderInventoryTable() {
    this.syncInventoryCategoryControls();
    this.syncSimSkuOptions();
    const tbody = document.getElementById("inventoryTableBody");
    if (!tbody || !window.omsEngine) return;

    this.syncInventoryFilterControlsUI();

    const channelNameMap = {
      SHOPEE: "Shopee",
      TIKTOK: "TikTok Shop",
      LAZADA: "Lazada",
      POS: "Cửa hàng POS",
      FACEBOOK: "Facebook"
    };

    const catFilter = this.invCategoryFilter || "ALL";
    const statusFilter = this.invStatusFilter || "ALL";
    const q = (this.invSearchQuery || "").toLowerCase();

    const effectiveInventory =
      typeof this.getEffectiveInventoryAtNow === "function"
        ? this.getEffectiveInventoryAtNow(window.omsEngine.inventory || [])
        : window.omsEngine.inventory || [];

    const filteredItems = effectiveInventory.filter((item) => {
      if (catFilter !== "ALL" && item.category !== catFilter) return false;

      const phys = item.effectivePhysicalStock ?? item.physicalStock ?? 0;
      const avail = item.effectiveAvailableStock ?? item.availableStock ?? 0;
      const resv = item.effectiveReservedStock ?? item.reservedStock ?? 0;
      const pct = phys > 0 ? Math.round((avail / phys) * 100) : 0;
      const itemStatusKey = avail === 0 ? "OUT" : pct <= 35 ? "LOW" : "ENOUGH";
      if (statusFilter === "AVAILABLE") {
        if (avail <= 0) return false;
      } else if (statusFilter === "RESERVED") {
        if (resv <= 0) return false;
      } else if (statusFilter === "ALERT") {
        if (avail > 0 && pct > 35) return false;
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

    const totalFiltered = filteredItems.length;
    const pageSize = Math.max(1, Number(this.invPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    if (!this.currentInvPage || this.currentInvPage < 1) {
      this.currentInvPage = 1;
    } else if (this.currentInvPage > totalPages) {
      this.currentInvPage = totalPages;
    }

    const startIdx = (this.currentInvPage - 1) * pageSize;
    const pageItems = filteredItems.slice(startIdx, startIdx + pageSize);

    const pagInfoEl = document.getElementById("invPaginationInfo");
    const pagCurEl = document.getElementById("invPaginationCurrent");
    const btnPrevEl = document.getElementById("btnInvPrevPage");
    const btnNextEl = document.getElementById("btnInvNextPage");

    if (pagInfoEl) {
      if (totalFiltered === 0) {
        pagInfoEl.innerText = "Hiển thị 0 / tổng 0 mặt hàng";
      } else {
        const showFrom = startIdx + 1;
        const showTo = Math.min(totalFiltered, startIdx + pageItems.length);
        pagInfoEl.innerText = `Hiển thị ${showFrom}–${showTo} / tổng ${totalFiltered} mặt hàng`;
      }
    }
    if (pagCurEl) {
      pagCurEl.innerText = `Trang ${this.currentInvPage} / ${totalPages}`;
    }
    if (btnPrevEl) {
      btnPrevEl.disabled = totalFiltered === 0 || this.currentInvPage <= 1;
    }
    if (btnNextEl) {
      btnNextEl.disabled = totalFiltered === 0 || this.currentInvPage >= totalPages;
    }

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="7">
            <div class="odoms-empty-state">
              Không tìm thấy sản phẩm nào khớp với bộ lọc hiện tại.
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const svgBatchDetail = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="0"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`;

    tbody.innerHTML = pageItems
      .map((item) => {
        const phys = item.effectivePhysicalStock ?? item.physicalStock ?? 0;
        const avail = item.effectiveAvailableStock ?? item.availableStock ?? 0;
        const resv = item.effectiveReservedStock ?? item.reservedStock ?? 0;
        const unit = item.unit || "SP";
        const chMap = item.effectiveChannelReserved || item.channelReserved || {};
        const pct = phys > 0 ? Math.round((avail / phys) * 100) : 0;
        const barClass = avail === 0 ? "out" : pct <= 35 ? "low" : "";
        const batchCount = Array.isArray(item.batches) ? item.batches.length : 0;
        const priceFormatted = Number(item.price || 0).toLocaleString("vi-VN") + " VND";

        const activeChannelHolds = Object.entries(chMap).filter(([, count]) => Number(count || 0) > 0);
        const holdTooltip = activeChannelHolds
          .map(([ch, count]) => `${channelNameMap[ch] || ch}: ${count}`)
          .join(" · ");
        const resvSubHtml =
          resv > 0 && activeChannelHolds.length > 0
            ? `<div class="inv-resv-sub" title="${this.escapeLogHtml(holdTooltip)}">${activeChannelHolds.length} kênh đang giữ</div>`
            : `<div class="inv-resv-sub">Chưa có đơn giữ</div>`;

        const statusLabel =
          avail === 0
            ? `<span class="odoms-flat-badge is-error">Hết hàng</span>`
            : pct <= 35
            ? `<span class="odoms-flat-badge is-warning">Sắp hết hàng</span>`
            : `<span class="odoms-flat-badge is-success">Đủ hàng</span>`;

        const availToneCls = avail === 0 ? "is-zero" : pct <= 35 ? "is-low" : "is-enough";

        return `
        <tr>
          <td class="col-inv-cat">
            <div class="inv-cat-name">${item.category}</div>
            <div class="inv-unit-sub">Đơn vị: ${unit}</div>
          </td>
          <td class="col-inv-prod">
            <div class="inv-prod-name">${item.name}</div>
            <div class="inv-prod-meta">
              <code class="odoms-username-code">${item.sku}</code>
              <span class="inv-price-tag">Đơn giá: ${priceFormatted}</span>
            </div>
          </td>
          <td class="col-inv-phys">
            <div class="inv-num-main">${phys} ${unit}</div>
            <div class="inv-batch-count-sub">${batchCount} lô hàng</div>
          </td>
          <td class="col-inv-resv">
            <div class="inv-num-resv">${resv} ${unit}</div>
            ${resvSubHtml}
          </td>
          <td class="col-inv-avail">
            <div class="inv-num-avail ${availToneCls}">
              ${avail} ${unit}
            </div>
            ${
              avail === 0
                ? `<div class="inv-zero-note">Đã giữ hết cho đơn</div>`
                : ""
            }
            <div class="stock-bar-wrap">
              <div class="stock-bar-fill ${barClass}" style="width: ${pct}%;"></div>
            </div>
          </td>
          <td class="col-inv-status">${statusLabel}</td>
          <td class="col-inv-actions">
            <div class="settings-segmented-control inv-action-seg" role="group" aria-label="Thao tác tồn kho ${item.sku}">
              <button
                type="button"
                class="settings-seg-btn settings-action-icon-btn"
                onclick="AppUI.openRestockPopover('${item.sku}', this, event)"
                title="Xem chi tiết lô hàng &amp; nhập kho (${item.sku})"
                aria-label="Xem chi tiết lô hàng và nhập kho ${item.sku}"
              >
                ${svgBatchDetail}
              </button>
              <button
                type="button"
                class="settings-seg-btn settings-seg-text-btn inv-quick-plus5-btn"
                onclick="AppUI.handleRestock('${item.sku}', 5)"
                title="Nhập nhanh +5 ${unit} cho mã ${item.sku}"
                aria-label="Nhập nhanh 5 sản phẩm cho mã ${item.sku}"
              >
                +5
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  formatDateDot(rawDate) {
    const str = String(rawDate || "").trim();
    if (!str) return "-";
    const ymd = str.match(/^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})/);
    if (ymd) {
      return `${String(ymd[3]).padStart(2, "0")}.${String(ymd[2]).padStart(2, "0")}.${ymd[1]}`;
    }
    const dmy = str.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})/);
    if (dmy) {
      return `${String(dmy[1]).padStart(2, "0")}.${String(dmy[2]).padStart(2, "0")}.${dmy[3]}`;
    }
    return str;
  },

  toggleQrLookupDrawer(forceOpen) {
    this.qrLookupDrawerOpen = typeof forceOpen === "boolean" ? forceOpen : !this.qrLookupDrawerOpen;
    const boxEl = document.getElementById("qrLookupDrawerBox");
    const btnEl = document.getElementById("btnToggleQrLookupDrawer");
    const labelEl = document.getElementById("qrLookupToggleLabel");
    if (boxEl) {
      boxEl.classList.toggle("hidden", !this.qrLookupDrawerOpen);
    }
    if (btnEl) {
      btnEl.setAttribute("aria-expanded", this.qrLookupDrawerOpen ? "true" : "false");
      btnEl.classList.toggle("is-open", this.qrLookupDrawerOpen);
    }
    if (labelEl) {
      labelEl.innerText = this.qrLookupDrawerOpen ? "Thu gọn" : "Mở rộng";
    }
  },

  changeQrLookupPage(delta) {
    const next = (Number(this.currentQrLookupPage) || 1) + Number(delta || 0);
    this.currentQrLookupPage = Math.max(1, next);
    this.renderQrLookupResults();
  },

  getQrLookupRowsAtNow() {
    const effInv =
      typeof this.getEffectiveInventoryAtNow === "function"
        ? this.getEffectiveInventoryAtNow()
        : window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : [];
    const allOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const nowMs = Date.now();

    // Hoàn trả phần giữ lô của các đơn tương lai (> Date.now()) ở tầng hiển thị
    const futureBatchTaken = {};
    allOrders.forEach((ord) => {
      if (!ord) return;
      if (ord.status === "ALLOCATED" && ord.platformStatus !== "CANCELLED") {
        const ordTs = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(ord) : 0;
        if (ordTs > nowMs && Array.isArray(ord.allocatedBatches)) {
          ord.allocatedBatches.forEach((ab) => {
            if (!ab || !ab.batchCode) return;
            const key = `${String(ord.sku || "").trim()}::${String(ab.batchCode).trim()}`;
            futureBatchTaken[key] = (futureBatchTaken[key] || 0) + (Number(ab.takenQty) || 0);
          });
        }
      }
    });

    const rows = [];
    effInv.forEach((item) => {
      const avail = this.getSkuAvailableStock(item);
      const batches = Array.isArray(item.batches) ? item.batches : [];
      batches.forEach((b) => {
        const key = `${String(item.sku || "").trim()}::${String(b.batchCode || "").trim()}`;
        const addBack = futureBatchTaken[key] || 0;
        const initQty = Math.max(0, Number(b.initialQty) || 0);
        const effRem = Math.min(initQty, Math.max(0, (Number(b.remainingQty) || 0) + addBack));
        rows.push({
          qrCode: b.qrCode || b.batchCode || "",
          sku: item.sku || "",
          name: item.name || "",
          batchCode: b.batchCode || "",
          expiryDate: this.formatDateDot(b.expiryDate || b.importDate || ""),
          remainingQty: effRem,
          initialQty: initQty,
          availableStock: avail
        });
      });
    });

    return rows;
  },

  renderQrLookupResults() {
    const tbody = document.getElementById("qrLookupTableBody");
    if (!tbody) return;

    const boxEl = document.getElementById("qrLookupDrawerBox");
    const btnEl = document.getElementById("btnToggleQrLookupDrawer");
    const labelEl = document.getElementById("qrLookupToggleLabel");
    if (boxEl) boxEl.classList.toggle("hidden", !this.qrLookupDrawerOpen);
    if (btnEl) {
      btnEl.setAttribute("aria-expanded", this.qrLookupDrawerOpen ? "true" : "false");
      btnEl.classList.toggle("is-open", this.qrLookupDrawerOpen);
    }
    if (labelEl) labelEl.innerText = this.qrLookupDrawerOpen ? "Thu gọn" : "Mở rộng";

    const q = String(this.qrLookupQuery || "").trim().toLowerCase();
    const allRows = this.getQrLookupRowsAtNow();
    const matched = q
      ? allRows.filter(
          (r) =>
            r.sku.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.batchCode.toLowerCase().includes(q) ||
            r.qrCode.toLowerCase().includes(q)
        )
      : allRows;

    const totalBadge = document.getElementById("qrLookupTotalBadge");
    if (totalBadge) {
      totalBadge.innerText = q ? `(${matched.length}/${allRows.length} lô)` : `(${allRows.length} lô)`;
    }

    const total = matched.length;
    const pageSize = Math.max(1, Number(this.qrLookupPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, Number(this.currentQrLookupPage) || 1), totalPages);
    this.currentQrLookupPage = page;

    const startIdx = (page - 1) * pageSize;
    const pageRows = matched.slice(startIdx, startIdx + pageSize);

    const infoEl = document.getElementById("qrLookupPaginationInfo");
    const curEl = document.getElementById("qrLookupPaginationCurrent");
    const prevBtn = document.getElementById("btnQrLookupPrevPage");
    const nextBtn = document.getElementById("btnQrLookupNextPage");

    if (infoEl) {
      infoEl.innerText =
        total > 0
          ? `Hiển thị ${startIdx + 1}–${startIdx + pageRows.length} / tổng ${total} lô hàng`
          : "Hiển thị 0 / tổng 0 lô hàng";
    }
    if (curEl) curEl.innerText = `Trang ${page} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    if (pageRows.length === 0) {
      const safeQ = this.escapeLogHtml(q);
      tbody.innerHTML = `<tr class="odoms-empty-row"><td colspan="6" class="odoms-empty-cell">${
        q
          ? `Không tìm thấy mã QR hoặc lô hàng khớp từ khóa "${safeQ}".`
          : "Chưa có dữ liệu lô hàng trong kho."
      }</td></tr>`;
      return;
    }

    tbody.innerHTML = pageRows
      .map((r) => {
        const safeQr = this.escapeLogHtml(r.qrCode);
        const safeName = this.escapeLogHtml(r.name);
        const safeSku = this.escapeLogHtml(r.sku);
        const safeBatch = this.escapeLogHtml(r.batchCode);
        const safeExp = this.escapeLogHtml(r.expiryDate);
        const availBadge =
          r.availableStock > 0
            ? `<span class="odoms-flat-badge is-success">Sẵn sàng: ${r.availableStock}</span>`
            : `<span class="odoms-flat-badge is-error">Hết tồn khả dụng</span>`;

        return `
          <tr>
            <td class="col-qrl-code"><div class="wb-cell-code-main" title="${safeQr}">${safeQr}</div></td>
            <td class="col-qrl-prod">
              <div class="wb-cell-primary" title="${safeName}">${safeName}</div>
              <div class="wb-cell-sub" title="${safeSku}">${safeSku}</div>
            </td>
            <td class="col-qrl-batch"><div class="wb-cell-primary" title="${safeBatch}">${safeBatch}</div></td>
            <td class="col-qrl-exp"><div class="wb-cell-primary">${safeExp}</div></td>
            <td class="col-qrl-qty"><div class="wb-cell-primary">${r.remainingQty} / ${r.initialQty}</div></td>
            <td class="col-qrl-avail">${availBadge}</td>
          </tr>
        `;
      })
      .join("");
  },

  // ============================================================================
  // 5. CHỨC NĂNG VẬN ĐƠN: TẠO MÃ VẬN ĐƠN & IN MÃ QR KÈM THÔNG TIN ĐƠN (v31)
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

  getShippingTierPlainLabel(tierCode) {
    const t = String(tierCode || "TIEU_CHUAN").trim().toUpperCase();
    if (t === "HOA_TOC") return "Hỏa tốc 2H";
    if (t === "NHANH") return "Giao nhanh 24H";
    return "Tiêu chuẩn";
  },

  getWaybillStatusBadgeMeta(statusCode) {
    const st = String(statusCode || "ISSUED").trim().toUpperCase();
    if (st === "PENDING_PICKUP") return { label: "Chờ lấy hàng", cls: "is-warning" };
    if (st === "IN_TRANSIT") return { label: "Đang giao hàng", cls: "is-info" };
    if (st === "DELIVERED") return { label: "Giao thành công", cls: "is-success" };
    if (st === "FAILED_RETURNING") return { label: "Giao thất bại", cls: "is-error" };
    return { label: "Đã cấp mã", cls: "is-info" };
  },

  getMergedWaybillRecords() {
    const validOrders =
      typeof this.getValidOrdersUpToNow === "function"
        ? this.getValidOrdersUpToNow()
        : window.omsEngine && Array.isArray(window.omsEngine.orders)
        ? window.omsEngine.orders
        : [];
    const validShipments =
      typeof this.getValidShipmentsUpToNow === "function"
        ? this.getValidShipmentsUpToNow(validOrders)
        : this.syncShipmentsFromEngine();
    const allEngineOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const orderById = new Map();
    allEngineOrders.forEach((o) => {
      if (o && o.orderId) orderById.set(String(o.orderId).trim(), o);
    });
    const channelsCfg = window.CHANNELS_CONFIG || {};
    const nowMs = Date.now();

    const byTracking = new Map();

    // 1. Nạp toàn bộ vận đơn hợp lệ <= Date.now() từ bảng vận chuyển lõi
    (Array.isArray(validShipments) ? validShipments : []).forEach((s, idx) => {
      if (!s || !s.trackingCode) return;
      const trk = String(s.trackingCode).trim();
      const ordId = String(s.orderId || "").trim();
      const matchedOrd = ordId ? orderById.get(ordId) : null;
      const channel = String(s.channel || (matchedOrd && matchedOrd.channel) || "SHOPEE").trim().toUpperCase();
      const chName = (channelsCfg[channel] && channelsCfg[channel].shortName) || channel;
      const rawItems = String(s.itemsSummary || "").trim();
      let parsedQty = 1;
      const qtyMatch = rawItems.match(/[×xX]\s*(\d+)\s*$/);
      if (qtyMatch) parsedQty = Math.max(1, Number(qtyMatch[1]) || 1);
      const skuVal = (matchedOrd && matchedOrd.sku) || String(s.sku || "").trim() || "SP-THOI-TRANG";
      const prodNameVal =
        (matchedOrd && matchedOrd.productName) ||
        String(s.productName || "").trim() ||
        rawItems.replace(/\s*[×xX]\s*\d+\s*$/, "").trim() ||
        skuVal;
      const qtyVal = (matchedOrd && Number(matchedOrd.quantity)) || Number(s.quantity) || parsedQty;
      const batchVal =
        String(s.batchCode || "").trim() ||
        (matchedOrd && Array.isArray(matchedOrd.allocatedBatches) && matchedOrd.allocatedBatches.length > 0
          ? matchedOrd.allocatedBatches.map((b) => b.batchCode).join(", ")
          : "LO-2026-A1");
      const createdAt = String(s.handoverTime || s.lastUpdateTime || "").trim();
      const createdTs = typeof this.parseVnDateTimeMs === "function" ? this.parseVnDateTimeMs(createdAt) || 0 : 0;
      const totalAmt = Number(s.totalCod !== undefined ? s.totalCod : s.totalAmount || 0) || 0;
      const recv = s.receiver || {};

      byTracking.set(trk, {
        trackingCode: trk,
        orderId: ordId || "-",
        channel,
        channelName: chName,
        carrier:
          String(s.carrier || "").trim() ||
          (matchedOrd ? this.resolveOrderCarrier(matchedOrd) : channel === "POS" ? "Tại quầy" : "Chưa gán ĐVVC"),
        shippingTier: String(s.shippingTier || (channel === "SHOPEE" ? "HOA_TOC" : channel === "POS" ? "TIEU_CHUAN" : "NHANH")).toUpperCase(),
        shippingTierText: this.getShippingTierPlainLabel(
          s.shippingTier || (channel === "SHOPEE" ? "HOA_TOC" : channel === "POS" ? "TIEU_CHUAN" : "NHANH")
        ),
        customerName: String(recv.name || s.customerName || (matchedOrd && matchedOrd.customerName) || "Khách mua hàng").trim(),
        customerPhone: String(recv.phone || s.customerPhone || (matchedOrd && matchedOrd.customerPhone) || "").trim(),
        address: String(recv.address || s.address || (matchedOrd && matchedOrd.shippingAddress) || "").trim(),
        sku: skuVal,
        productName: prodNameVal,
        quantity: qtyVal,
        batchCode: batchVal,
        totalAmount: totalAmt,
        status: String(s.status || "PENDING_PICKUP").trim().toUpperCase(),
        createdAt,
        createdTs,
        _orderSeq: idx + 1000
      });
    });

    // 2. Hợp nhất các bản ghi mới khởi tạo trong waybillHistory (khử trùng theo trackingCode)
    const histList = Array.isArray(this.waybillHistory) ? this.waybillHistory : [];
    histList.forEach((w, idx) => {
      if (!w || !w.trackingCode) return;
      const trk = String(w.trackingCode).trim();
      const createdAt = String(w.createdAt || "").trim();
      const createdTs = typeof this.parseVnDateTimeMs === "function" ? this.parseVnDateTimeMs(createdAt) : null;
      if (createdTs !== null && createdTs > nowMs) return;

      const ordId = String(w.orderId || "").trim();
      const matchedOrd = ordId ? orderById.get(ordId) : null;
      const existing = byTracking.get(trk);
      const channel = String(w.channel || (existing && existing.channel) || (matchedOrd && matchedOrd.channel) || "SHOPEE")
        .trim()
        .toUpperCase();
      const chName = (channelsCfg[channel] && channelsCfg[channel].shortName) || channel;
      const tierCode = (existing && existing.shippingTier) || (channel === "SHOPEE" ? "HOA_TOC" : channel === "POS" ? "TIEU_CHUAN" : "NHANH");

      byTracking.set(trk, {
        trackingCode: trk,
        orderId: ordId || (existing && existing.orderId) || "-",
        channel,
        channelName: chName,
        carrier: String(w.carrier || (existing && existing.carrier) || "SPX Express").trim(),
        shippingTier: tierCode,
        shippingTierText: this.getShippingTierPlainLabel(tierCode),
        customerName: String(w.customerName || (existing && existing.customerName) || "Khách mua hàng").trim(),
        customerPhone: String(w.customerPhone || (existing && existing.customerPhone) || "").trim(),
        address: String(w.address || (existing && existing.address) || "").trim(),
        sku: String(w.sku || (existing && existing.sku) || (matchedOrd && matchedOrd.sku) || "SP-AO-POLO-01").trim(),
        productName: String(w.productName || (existing && existing.productName) || (matchedOrd && matchedOrd.productName) || "").trim(),
        quantity: Number(w.quantity || (existing && existing.quantity) || (matchedOrd && matchedOrd.quantity) || 1),
        batchCode: String(w.batchCode || (existing && existing.batchCode) || "LO-2026-A1").trim(),
        totalAmount: Number(w.totalAmount !== undefined ? w.totalAmount : existing ? existing.totalAmount : 0) || 0,
        status: existing && existing.status ? existing.status : "ISSUED",
        createdAt: createdAt || (existing && existing.createdAt) || "",
        createdTs: createdTs !== null ? createdTs : existing ? existing.createdTs : 0,
        _orderSeq: idx
      });
    });

    const merged = Array.from(byTracking.values());
    merged.sort((a, b) => {
      if (b.createdTs !== a.createdTs) return b.createdTs - a.createdTs;
      return a._orderSeq - b._orderSeq;
    });
    return merged;
  },

  getFilteredWaybillRecords() {
    const allList = this.getMergedWaybillRecords();
    const statusFilter = String(this.waybillHistoryStatusFilter || "ALL").toUpperCase();
    const q = String(this.waybillHistorySearchQuery || "").trim().toLowerCase();

    const list = allList.filter((item) => {
      if (statusFilter === "PENDING_PICKUP") {
        if (item.status !== "PENDING_PICKUP" && item.status !== "ISSUED") return false;
      } else if (statusFilter !== "ALL") {
        if (item.status !== statusFilter) return false;
      }
      if (!q) return true;
      return (
        item.trackingCode.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.channel.toLowerCase().includes(q) ||
        item.channelName.toLowerCase().includes(q) ||
        item.carrier.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerPhone.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.batchCode.toLowerCase().includes(q)
      );
    });

    return { allList, list };
  },

  setWaybillHistoryStatusFilter(statusKey) {
    this.waybillHistoryStatusFilter = String(statusKey || "ALL").toUpperCase();
    this.currentWaybillHistoryPage = 1;
    this.renderWaybillHistoryTable();
  },

  changeWaybillHistoryPage(delta) {
    const next = (Number(this.currentWaybillHistoryPage) || 1) + Number(delta || 0);
    this.currentWaybillHistoryPage = Math.max(1, next);
    this.renderWaybillHistoryTable();
  },

  // Chuẩn hóa nhãn tên khách hàng hiển thị trong hộp chọn đơn (chỉ tầng hiển thị, không sửa dữ liệu gốc)
  cleanWaybillPickerCustomerName(rawName) {
    const cleaned = String(rawName || "")
      .replace(/\s*\([^)]*(?:mua tại quầy|tại quầy|livestream|chốt đơn|inbox|fanpage|fb|facebook|pos)[^)]*\)/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || "Khách mua hàng";
  },

  getWaybillPickerOrderBuckets() {
    const validOrders =
      typeof this.getValidOrdersUpToNow === "function"
        ? this.getValidOrdersUpToNow()
        : window.omsEngine && Array.isArray(window.omsEngine.orders)
        ? window.omsEngine.orders
        : [];
    const validShipments =
      typeof this.getValidShipmentsUpToNow === "function"
        ? this.getValidShipmentsUpToNow(validOrders)
        : this.syncShipmentsFromEngine();
    const nowMs = Date.now();

    const issuedByOrderId = new Map();
    (Array.isArray(validShipments) ? validShipments : []).forEach((s) => {
      if (s && s.orderId && s.trackingCode) {
        issuedByOrderId.set(String(s.orderId).trim(), String(s.trackingCode).trim());
      }
    });
    (Array.isArray(this.waybillHistory) ? this.waybillHistory : []).forEach((w) => {
      if (!w || !w.orderId || !w.trackingCode) return;
      const wTs = typeof this.parseVnDateTimeMs === "function" ? this.parseVnDateTimeMs(w.createdAt) : null;
      if (wTs !== null && wTs > nowMs) return;
      const oid = String(w.orderId).trim();
      if (!issuedByOrderId.has(oid)) {
        issuedByOrderId.set(oid, String(w.trackingCode).trim());
      }
    });

    const channelsCfg = window.CHANNELS_CONFIG || {};
    const unissued = [];
    const issued = [];

    const sortedOrders = [...validOrders].sort((a, b) => {
      const ta = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(a) : 0;
      const tb = typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(b) : 0;
      return tb - ta;
    });

    sortedOrders.forEach((o) => {
      if (!o || !o.orderId) return;
      const ps = o.platformStatus || (o.status === "CANCELLED" || o.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
      if (ps !== "CONFIRMED" || o.status === "CANCELLED" || o.status === "INVALID") return;
      // Loại bỏ hoàn toàn đơn đang thiếu tồn kho / chưa giữ đủ hàng (vd: LZ261122201)
      if (o.status === "BACKORDER" || o.status !== "ALLOCATED") return;
      // Loại bỏ đơn bán tại quầy POS không cần cấp vận đơn giao hàng
      const chUpper = String(o.channel || "").trim().toUpperCase();
      const carrier = typeof this.resolveOrderCarrier === "function" ? this.resolveOrderCarrier(o) : o.carrier || "";
      if (chUpper === "POS" || carrier === "Tại quầy") return;

      const ordId = String(o.orderId).trim();
      const rawTrack = String(o.trackingCode || "").trim();
      const validRawTrack = rawTrack && rawTrack !== "Chưa cấp mã vận đơn" ? rawTrack : "";
      const trackingCode = issuedByOrderId.get(ordId) || validRawTrack || "";
      const entry = {
        orderId: ordId,
        channel: chUpper,
        channelName: (channelsCfg[chUpper] && channelsCfg[chUpper].shortName) || chUpper,
        customerName: o.customerName || "Khách mua hàng",
        displayCustomerName: this.cleanWaybillPickerCustomerName(o.customerName),
        customerPhone: String(o.customerPhone || "").trim(),
        sku: String(o.sku || "").trim(),
        productName: String(o.productName || "").trim(),
        quantity: Number(o.quantity) || 1,
        trackingCode,
        isIssued: Boolean(trackingCode)
      };

      if (entry.isIssued) {
        issued.push(entry);
      } else {
        unissued.push(entry);
      }
    });

    return { unissued, issued, all: [...unissued, ...issued] };
  },

  syncWaybillOrderPickerTrigger(orderId) {
    const mainEl = document.getElementById("wbOrderPickerTriggerMain");
    const chEl = document.getElementById("wbOrderPickerTriggerChannel");
    const hiddenEl = document.getElementById("waybillOrderSelect");
    const targetId = String(orderId !== undefined ? orderId : hiddenEl ? hiddenEl.value : "").trim();
    if (hiddenEl && orderId !== undefined) {
      hiddenEl.value = targetId;
    }
    if (!mainEl) return;

    if (!targetId) {
      mainEl.innerText = "Chọn đơn hàng cần cấp vận đơn...";
      mainEl.classList.add("is-placeholder");
      if (chEl) chEl.innerText = "";
      return;
    }

    const ord = window.omsEngine && Array.isArray(window.omsEngine.orders)
      ? window.omsEngine.orders.find((o) => String(o.orderId || "").trim() === targetId)
      : null;
    if (!ord) {
      mainEl.innerText = targetId;
      mainEl.classList.remove("is-placeholder");
      if (chEl) chEl.innerText = "";
      return;
    }

    const channelsCfg = window.CHANNELS_CONFIG || {};
    const chUpper = String(ord.channel || "").trim().toUpperCase();
    const chName = (channelsCfg[chUpper] && channelsCfg[chUpper].shortName) || chUpper;
    const cleanName = this.cleanWaybillPickerCustomerName(ord.customerName);

    mainEl.innerText = `${ord.orderId} · ${cleanName}`;
    mainEl.classList.remove("is-placeholder");
    if (chEl) chEl.innerText = chName;
  },

  toggleWaybillOrderPicker(forceOpen) {
    const next = typeof forceOpen === "boolean" ? forceOpen : !this.waybillOrderPickerOpen;
    this.waybillOrderPickerOpen = next;
    const dropEl = document.getElementById("waybillOrderPickerDropdown");
    const trigEl = document.getElementById("btnWaybillOrderPickerTrigger");
    if (dropEl) dropEl.classList.toggle("hidden", !next);
    if (trigEl) {
      trigEl.classList.toggle("is-open", next);
      trigEl.setAttribute("aria-expanded", next ? "true" : "false");
    }
    if (next) {
      this.renderWaybillOrderSelector();
      const searchEl = document.getElementById("waybillOrderPickerSearch");
      if (searchEl && typeof searchEl.focus === "function") {
        searchEl.focus();
      }
    }
  },

  closeWaybillOrderPicker() {
    this.toggleWaybillOrderPicker(false);
  },

  setWaybillOrderPickerTab(tabKey) {
    this.waybillOrderPickerTab = String(tabKey || "UNISSUED").toUpperCase() === "ISSUED" ? "ISSUED" : "UNISSUED";
    this.renderWaybillOrderSelector();
  },

  selectWaybillPickerOrder(orderId) {
    if (!orderId) return;
    const hiddenEl = document.getElementById("waybillOrderSelect");
    if (hiddenEl) hiddenEl.value = orderId;
    this.syncWaybillOrderPickerTrigger(orderId);
    this.closeWaybillOrderPicker();
    this.onSelectOrderForWaybill(orderId);
  },

  renderWaybillOrderSelector() {
    const listEl = document.getElementById("waybillOrderPickerList");
    const hiddenEl = document.getElementById("waybillOrderSelect");
    const btnUnissued = document.getElementById("btnWbPickerTabUnissued");
    const btnIssued = document.getElementById("btnWbPickerTabIssued");

    const { unissued, issued } = this.getWaybillPickerOrderBuckets();
    const activeTab = this.waybillOrderPickerTab === "ISSUED" ? "ISSUED" : "UNISSUED";

    if (btnUnissued) {
      btnUnissued.innerText = `Chưa cấp VĐ (${unissued.length})`;
      btnUnissued.classList.toggle("active", activeTab === "UNISSUED");
      btnUnissued.setAttribute("aria-selected", activeTab === "UNISSUED" ? "true" : "false");
    }
    if (btnIssued) {
      btnIssued.innerText = `Đã có VĐ (${issued.length})`;
      btnIssued.classList.toggle("active", activeTab === "ISSUED");
      btnIssued.setAttribute("aria-selected", activeTab === "ISSUED" ? "true" : "false");
    }

    const selectedOrderId = String(hiddenEl ? hiddenEl.value : "").trim();
    this.syncWaybillOrderPickerTrigger(selectedOrderId);

    if (!listEl) return;

    const sourceList = activeTab === "ISSUED" ? issued : unissued;
    const q = String(this.waybillOrderPickerSearchQuery || "").trim().toLowerCase();
    const filtered = q
      ? sourceList.filter(
          (item) =>
            item.orderId.toLowerCase().includes(q) ||
            item.displayCustomerName.toLowerCase().includes(q) ||
            item.customerName.toLowerCase().includes(q) ||
            item.customerPhone.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q) ||
            item.productName.toLowerCase().includes(q) ||
            item.channelName.toLowerCase().includes(q) ||
            item.trackingCode.toLowerCase().includes(q)
        )
      : sourceList;

    if (filtered.length === 0) {
      if (activeTab === "UNISSUED" && !q && unissued.length === 0) {
        listEl.innerHTML = `
          <div class="wb-picker-empty">
            <div>Tất cả đơn giao hàng đã được cấp mã vận đơn</div>
            ${
              issued.length > 0
                ? `<button type="button" class="btn btn-outline odoms-btn-34" onclick="AppUI.setWaybillOrderPickerTab('ISSUED')">Chuyển sang Đã có VĐ (${issued.length})</button>`
                : ""
            }
          </div>
        `;
      } else {
        const safeQ = this.escapeLogHtml(q);
        listEl.innerHTML = `
          <div class="wb-picker-empty">
            <div>${q ? `Không tìm thấy đơn hàng khớp từ khóa "${safeQ}".` : "Chưa có đơn hàng phù hợp trong nhóm này."}</div>
          </div>
        `;
      }
      return;
    }

    listEl.innerHTML = filtered
      .map((item) => {
        const isSel = selectedOrderId && selectedOrderId === item.orderId;
        const safeOrd = this.escapeLogHtml(item.orderId);
        const safeCust = this.escapeLogHtml(item.displayCustomerName);
        const safeCh = this.escapeLogHtml(item.channelName);
        const safeSku = this.escapeLogHtml(item.sku);
        const safeState = item.isIssued ? this.escapeLogHtml(item.trackingCode) : "Chờ cấp mã";
        const jsOrd = item.orderId.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

        return `
          <button
            type="button"
            class="wb-picker-item${isSel ? " is-selected" : ""}"
            role="option"
            aria-selected="${isSel ? "true" : "false"}"
            onclick="AppUI.selectWaybillPickerOrder('${jsOrd}')"
          >
            <span class="wb-picker-row-1">
              <span class="wb-picker-item-left"><span class="wb-picker-item-code">${safeOrd}</span> · ${safeCust}</span>
              <span class="wb-picker-item-channel">${safeCh}</span>
            </span>
            <span class="wb-picker-row-2">
              <span class="wb-picker-item-sub">${item.quantity} × ${safeSku}</span>
              <span class="wb-picker-item-state">${safeState}</span>
            </span>
          </button>
        `;
      })
      .join("");
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
        ? ord.allocatedBatches.map((b) => b.batchCode).join(", ")
        : "LO-2026-A1";

    setVal("waybillOrderSelect", ord.orderId);
    this.syncWaybillOrderPickerTrigger(ord.orderId);
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

  // Bộ tạo ma trận mã QR chuẩn ISO/IEC 18004 thuần JS (Byte mode, Reed-Solomon GF(256), chọn mask tối ưu)
  encodeQrMatrixIso18004(rawText) {
    // 1. Mã hóa chuỗi sang mảng byte UTF-8
    const str = String(rawText || "");
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let cp = str.charCodeAt(i);
      if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < str.length) {
        const lo = str.charCodeAt(i + 1);
        if (lo >= 0xdc00 && lo <= 0xdfff) {
          cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
          i++;
        }
      }
      if (cp < 0x80) {
        bytes.push(cp);
      } else if (cp < 0x800) {
        bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
      } else if (cp < 0x10000) {
        bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else {
        bytes.push(
          0xf0 | (cp >> 18),
          0x80 | ((cp >> 12) & 0x3f),
          0x80 | ((cp >> 6) & 0x3f),
          0x80 | (cp & 0x3f)
        );
      }
    }

    // 2. Bảng tham số ISO/IEC 18004 (mức sửa lỗi L, Version 1..10)
    const SPECS = [
      { v: 1, dataCw: 19, ecPerBlock: 7, blocks: [[1, 19]], align: [] },
      { v: 2, dataCw: 34, ecPerBlock: 10, blocks: [[1, 34]], align: [6, 18] },
      { v: 3, dataCw: 55, ecPerBlock: 15, blocks: [[1, 55]], align: [6, 22] },
      { v: 4, dataCw: 80, ecPerBlock: 20, blocks: [[1, 80]], align: [6, 26] },
      { v: 5, dataCw: 108, ecPerBlock: 26, blocks: [[1, 108]], align: [6, 30] },
      { v: 6, dataCw: 136, ecPerBlock: 18, blocks: [[2, 68]], align: [6, 34] },
      { v: 7, dataCw: 156, ecPerBlock: 20, blocks: [[2, 78]], align: [6, 22, 38] },
      { v: 8, dataCw: 194, ecPerBlock: 24, blocks: [[2, 97]], align: [6, 24, 42] },
      { v: 9, dataCw: 232, ecPerBlock: 30, blocks: [[2, 116]], align: [6, 26, 46] },
      { v: 10, dataCw: 274, ecPerBlock: 18, blocks: [[2, 68], [2, 69]], align: [6, 28, 50] }
    ];

    let spec = SPECS[SPECS.length - 1];
    for (let i = 0; i < SPECS.length; i++) {
      const s = SPECS[i];
      const ccBits = s.v <= 9 ? 8 : 16;
      if (4 + ccBits + bytes.length * 8 <= s.dataCw * 8) {
        spec = s;
        break;
      }
    }

    const countBits = spec.v <= 9 ? 8 : 16;
    const maxBytes = Math.floor((spec.dataCw * 8 - 4 - countBits) / 8);
    const dataBytes = bytes.length > maxBytes ? bytes.slice(0, maxBytes) : bytes;

    // 3. Tạo luồng bit chế độ Byte (0100) + độ dài + đệm chuẩn 0xEC / 0x11
    const bitStream = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) {
        bitStream.push((val >> i) & 1);
      }
    };
    pushBits(4, 4); // Byte mode indicator
    pushBits(dataBytes.length, countBits);
    for (let i = 0; i < dataBytes.length; i++) pushBits(dataBytes[i], 8);

    const totalDataBits = spec.dataCw * 8;
    const termLen = Math.min(4, totalDataBits - bitStream.length);
    pushBits(0, termLen);
    while (bitStream.length % 8 !== 0) bitStream.push(0);

    const dataCodewords = [];
    for (let i = 0; i < bitStream.length; i += 8) {
      let cw = 0;
      for (let b = 0; b < 8; b++) cw = (cw << 1) | bitStream[i + b];
      dataCodewords.push(cw);
    }
    const padSeq = [0xec, 0x11];
    let padIdx = 0;
    while (dataCodewords.length < spec.dataCw) {
      dataCodewords.push(padSeq[padIdx & 1]);
      padIdx++;
    }

    // 4. Bảng trường hữu hạn GF(256) (đa thức nguyên thủy 0x11D) và mã sửa lỗi Reed-Solomon
    const gfExp = new Uint8Array(512);
    const gfLog = new Uint8Array(256);
    let gVal = 1;
    for (let i = 0; i < 255; i++) {
      gfExp[i] = gVal;
      gfLog[gVal] = i;
      gVal <<= 1;
      if (gVal & 0x100) gVal ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) gfExp[i] = gfExp[i - 255];
    const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : gfExp[gfLog[a] + gfLog[b]]);

    const ecLen = spec.ecPerBlock;
    let genPoly = [1];
    for (let i = 0; i < ecLen; i++) {
      const nextPoly = new Array(genPoly.length + 1).fill(0);
      const root = gfExp[i];
      for (let j = 0; j < genPoly.length; j++) {
        nextPoly[j] ^= genPoly[j];
        nextPoly[j + 1] ^= gfMul(genPoly[j], root);
      }
      genPoly = nextPoly;
    }

    const computeRsEc = (block) => {
      const rem = new Array(ecLen).fill(0);
      for (let i = 0; i < block.length; i++) {
        const factor = block[i] ^ rem[0];
        rem.shift();
        rem.push(0);
        if (factor !== 0) {
          for (let j = 0; j < ecLen; j++) {
            rem[j] ^= gfMul(genPoly[j + 1], factor);
          }
        }
      }
      return rem;
    };

    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (let g = 0; g < spec.blocks.length; g++) {
      const [blkCount, blkLen] = spec.blocks[g];
      for (let b = 0; b < blkCount; b++) {
        const slice = dataCodewords.slice(offset, offset + blkLen);
        offset += blkLen;
        dataBlocks.push(slice);
        ecBlocks.push(computeRsEc(slice));
      }
    }

    // 5. Xen kẽ dữ liệu & mã sửa lỗi giữa các khối
    const interleaved = [];
    const maxDataBlkLen = Math.max(...dataBlocks.map((b) => b.length));
    for (let col = 0; col < maxDataBlkLen; col++) {
      for (let b = 0; b < dataBlocks.length; b++) {
        if (col < dataBlocks[b].length) interleaved.push(dataBlocks[b][col]);
      }
    }
    for (let col = 0; col < ecLen; col++) {
      for (let b = 0; b < ecBlocks.length; b++) {
        interleaved.push(ecBlocks[b][col]);
      }
    }

    const finalBits = [];
    for (let i = 0; i < interleaved.length; i++) {
      const cw = interleaved[i];
      for (let b = 7; b >= 0; b--) finalBits.push((cw >> b) & 1);
    }

    // 6. Khởi tạo ma trận N x N và đặt các mẫu chức năng bắt buộc (Finder, Timing, Alignment, Format, Version)
    const N = 17 + 4 * spec.v;
    const baseMat = Array.from({ length: N }, () => new Uint8Array(N));
    const isFunc = Array.from({ length: N }, () => new Uint8Array(N));

    const setFunc = (r, c, dark) => {
      if (r >= 0 && r < N && c >= 0 && c < N) {
        isFunc[r][c] = 1;
        baseMat[r][c] = dark ? 1 : 0;
      }
    };

    const placeFinder = (row0, col0) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = row0 + dr;
          const c = col0 + dc;
          if (r < 0 || r >= N || c < 0 || c >= N) continue;
          const inBox = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const isDark =
            inBox &&
            (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          setFunc(r, c, isDark);
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);

    // Timing patterns (hàng 6 & cột 6)
    for (let i = 8; i < N - 8; i++) {
      setFunc(6, i, i % 2 === 0);
      setFunc(i, 6, i % 2 === 0);
    }

    // Alignment patterns (5x5)
    for (let i = 0; i < spec.align.length; i++) {
      for (let j = 0; j < spec.align.length; j++) {
        const ar = spec.align[i];
        const ac = spec.align[j];
        if (isFunc[ar][ac]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dMax = Math.max(Math.abs(dr), Math.abs(dc));
            setFunc(ar + dr, ac + dc, dMax === 0 || dMax === 2);
          }
        }
      }
    }

    // Giữ chỗ Format Info và đặt mô-đun tối cố định (N-8, 8)
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        setFunc(8, i, false);
        setFunc(i, 8, false);
      }
    }
    for (let i = N - 8; i < N; i++) {
      setFunc(8, i, false);
      setFunc(i, 8, false);
    }
    setFunc(N - 8, 8, true);

    // Đặt 18 bit Version Info cho Version >= 7 (BCH 18,6 đa thức 0x1F25)
    if (spec.v >= 7) {
      let vRem = spec.v << 12;
      for (let bit = 17; bit >= 12; bit--) {
        if ((vRem >> bit) & 1) vRem ^= 0x1f25 << (bit - 12);
      }
      const verBits = (spec.v << 12) | vRem;
      for (let i = 0; i < 18; i++) {
        const dark = ((verBits >> i) & 1) === 1;
        const a = N - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunc(b, a, dark);
        setFunc(a, b, dark);
      }
    }

    // 7. Xếp luồng bit dữ liệu theo đường zíc-zắc 2 cột (tránh cột timing 6)
    let bitIdx = 0;
    let upward = true;
    for (let rightCol = N - 1; rightCol >= 1; rightCol -= 2) {
      if (rightCol === 6) rightCol = 5;
      for (let step = 0; step < N; step++) {
        const r = upward ? N - 1 - step : step;
        for (let dx = 0; dx < 2; dx++) {
          const c = rightCol - dx;
          if (!isFunc[r][c]) {
            baseMat[r][c] = bitIdx < finalBits.length ? finalBits[bitIdx] : 0;
            bitIdx++;
          }
        }
      }
      upward = !upward;
    }

    // 8. Áp dụng 8 mặt nạ chuẩn ISO, ghi Format Info (BCH 15,5 XOR 0x5412) và chọn mặt nạ điểm phạt thấp nhất
    const maskPredicates = [
      (r, c) => (r + c) % 2 === 0,
      (r) => r % 2 === 0,
      (_, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
      (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
      (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
    ];

    const writeFormatInfo = (mat, maskId) => {
      const fmtData = (1 << 3) | maskId; // Mức sửa lỗi L = 01
      let d = fmtData << 10;
      for (let bit = 14; bit >= 10; bit--) {
        if ((d >> bit) & 1) d ^= 0x537 << (bit - 10);
      }
      const fmtBits = ((fmtData << 10) | d) ^ 0x5412;
      const getBit = (idx) => (fmtBits >> idx) & 1;

      // Bản sao 1 quanh góc trên-trái (bit 14 -> bit 0)
      const c1 = [
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
        [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
      ];
      for (let k = 0; k < 15; k++) {
        mat[c1[k][0]][c1[k][1]] = getBit(14 - k);
      }

      // Bản sao 2 dọc góc dưới-trái & ngang góc trên-phải
      for (let k = 0; k < 7; k++) {
        mat[N - 1 - k][8] = getBit(14 - k);
      }
      mat[N - 8][8] = 1;
      for (let k = 0; k < 8; k++) {
        mat[8][N - 8 + k] = getBit(7 - k);
      }
    };

    const evaluatePenalty = (mat) => {
      let score = 0;
      // Quy tắc 1: chuỗi >= 5 ô cùng màu theo hàng & cột
      for (let r = 0; r < N; r++) {
        let runColor = mat[r][0];
        let runLen = 1;
        for (let c = 1; c < N; c++) {
          if (mat[r][c] === runColor) {
            runLen++;
          } else {
            if (runLen >= 5) score += 3 + (runLen - 5);
            runColor = mat[r][c];
            runLen = 1;
          }
        }
        if (runLen >= 5) score += 3 + (runLen - 5);
      }
      for (let c = 0; c < N; c++) {
        let runColor = mat[0][c];
        let runLen = 1;
        for (let r = 1; r < N; r++) {
          if (mat[r][c] === runColor) {
            runLen++;
          } else {
            if (runLen >= 5) score += 3 + (runLen - 5);
            runColor = mat[r][c];
            runLen = 1;
          }
        }
        if (runLen >= 5) score += 3 + (runLen - 5);
      }

      // Quy tắc 2: khối 2x2 cùng màu
      for (let r = 0; r < N - 1; r++) {
        for (let c = 0; c < N - 1; c++) {
          const v = mat[r][c];
          if (v === mat[r][c + 1] && v === mat[r + 1][c] && v === mat[r + 1][c + 1]) {
            score += 3;
          }
        }
      }

      // Quy tắc 3: mẫu giả định vị 10111010000 hoặc 00001011101
      const isFinderLike = (arr, idx) => {
        const a =
          arr[idx] === 1 && arr[idx + 1] === 0 && arr[idx + 2] === 1 && arr[idx + 3] === 1 &&
          arr[idx + 4] === 1 && arr[idx + 5] === 0 && arr[idx + 6] === 1 && arr[idx + 7] === 0 &&
          arr[idx + 8] === 0 && arr[idx + 9] === 0 && arr[idx + 10] === 0;
        const b =
          arr[idx] === 0 && arr[idx + 1] === 0 && arr[idx + 2] === 0 && arr[idx + 3] === 0 &&
          arr[idx + 4] === 1 && arr[idx + 5] === 0 && arr[idx + 6] === 1 && arr[idx + 7] === 1 &&
          arr[idx + 8] === 1 && arr[idx + 9] === 0 && arr[idx + 10] === 1;
        return a || b;
      };
      const colBuf = new Uint8Array(N);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c <= N - 11; c++) {
          if (isFinderLike(mat[r], c)) score += 40;
        }
      }
      for (let c = 0; c < N; c++) {
        for (let r = 0; r < N; r++) colBuf[r] = mat[r][c];
        for (let r = 0; r <= N - 11; r++) {
          if (isFinderLike(colBuf, r)) score += 40;
        }
      }

      // Quy tắc 4: cân bằng tỷ lệ điểm tối
      let darkCount = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) darkCount += mat[r][c];
      }
      const darkPct = (darkCount * 100) / (N * N);
      score += Math.floor(Math.abs(darkPct - 50) / 5) * 10;
      return score;
    };

    let bestMat = null;
    let bestMask = 0;
    let bestScore = Infinity;

    for (let m = 0; m < 8; m++) {
      const cand = baseMat.map((row) => Uint8Array.from(row));
      const fn = maskPredicates[m];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (!isFunc[r][c] && fn(r, c)) {
            cand[r][c] ^= 1;
          }
        }
      }
      writeFormatInfo(cand, m);
      const sc = evaluatePenalty(cand);
      if (sc < bestScore) {
        bestScore = sc;
        bestMask = m;
        bestMat = cand;
      }
    }

    return {
      version: spec.v,
      size: N,
      mask: bestMask,
      matrix: bestMat
    };
  },

  // Sinh hình ảnh vector mã QR chuẩn ISO/IEC 18004 kèm vùng yên tĩnh 4 mô-đun trắng
  buildQrCodeSvgMarkup(payloadText, size = 124) {
    const encoded = this.encodeQrMatrixIso18004(payloadText);
    const N = encoded.size;
    const mat = encoded.matrix;
    const quiet = 4;
    const viewSize = N + quiet * 2;

    let rects = "";
    for (let r = 0; r < N; r++) {
      let c = 0;
      while (c < N) {
        if (mat[r][c]) {
          const startC = c;
          while (c < N && mat[r][c]) c++;
          rects += `<rect x="${startC + quiet}" y="${r + quiet}" width="${c - startC}" height="1" fill="#0A2947" />`;
        } else {
          c++;
        }
      }
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${viewSize} ${viewSize}" data-qr-version="${encoded.version}" data-qr-modules="${N}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="${viewSize}" height="${viewSize}" fill="#FFFFFF" />${rects}</svg>`;
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

  buildWaybillTicketInnerHtml(data, createdAtStr) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const tsText =
      createdAtStr ||
      data.createdAt ||
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const qrPayload = `ODOMS|WB:${data.trackingCode}|ORD:${data.orderId}|CH:${data.channel}|SKU:${data.sku}|QTY:${data.quantity}|COD:${data.totalAmount}|LO:${data.batchCode}`;
    const qrSvg = this.buildQrCodeSvgMarkup(qrPayload, 124);

    const channelsCfg = window.CHANNELS_CONFIG || {};
    const channelDisplay = (channelsCfg[data.channel] && channelsCfg[data.channel].shortName) || data.channel;
    const safeTracking = this.escapeLogHtml(data.trackingCode);
    const safeOrderId = this.escapeLogHtml(data.orderId);
    const safeChannel = this.escapeLogHtml(channelDisplay);
    const safeCarrier = this.escapeLogHtml(data.carrier);
    const safeCustomer = this.escapeLogHtml(data.customerName);
    const safePhone = this.escapeLogHtml(data.customerPhone);
    const safeAddress = this.escapeLogHtml(data.address);
    const safeSku = this.escapeLogHtml(data.sku);
    const safeProduct = this.escapeLogHtml(data.productName);
    const safeBatch = this.escapeLogHtml(data.batchCode);
    const safeCreatedAt = this.escapeLogHtml(tsText);

    const html = `
      <div class="wb-ticket-header">
        <div class="wb-brand-box">
          <div class="wb-brand-logo">OD</div>
          <div>
            <div class="wb-title-main wb-ticket-title-main">ODOMS — PHIẾU GIAO HÀNG &amp; MÃ VẬN ĐƠN</div>
            <div class="wb-sub-text wb-ticket-sub-line">Hệ thống quản lý đơn hàng đa kênh thông minh · Kho Phường Bình Phú</div>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="wb-ticket-channel-tag">${safeChannel}</span>
          <div class="wb-sub-text wb-ticket-carrier-line">ĐVVC: ${safeCarrier}</div>
        </div>
      </div>

      <div class="wb-qr-and-code-row">
        <div class="wb-qr-box">
          <div class="wb-qr-svg-wrap">${qrSvg}</div>
          <span class="wb-qr-caption">QUÉT MÃ QR ĐỐI SOÁT</span>
        </div>
        <div style="min-width:0;">
          <div class="wb-sub-text wb-code-label">Mã vận đơn</div>
          <div class="wb-code-display">${safeTracking}</div>
          <div class="wb-meta-grid">
            <div class="wb-meta-cell">Đơn gốc: <strong class="wb-strong-val">${safeOrderId}</strong></div>
            <div class="wb-meta-cell">Lô xuất: <strong class="wb-strong-val">${safeBatch}</strong></div>
            <div class="wb-meta-cell">Ngày tạo: <strong class="wb-strong-val">${safeCreatedAt}</strong></div>
            <div class="wb-meta-cell">
              <div class="wb-cod-pill ${Number(data.totalAmount) > 0 ? "is-cod" : "is-paid"}">${
                Number(data.totalAmount) > 0
                  ? `${Number(data.totalAmount).toLocaleString("vi-VN")} VND`
                  : "0 VND"
              }</div>
            </div>
          </div>
        </div>
      </div>

      <div class="wb-info-grid">
        <div class="wb-info-box wb-info-from">
          <div class="wb-info-box-head">
            <span class="wb-box-title wb-box-title-from">Nơi gửi hàng (Bên bán)</span>
            <span class="wb-sub-text" style="font-size:10px;font-weight:700;">Mã kho: KHO-Q6</span>
          </div>
          <div class="wb-strong-val wb-info-name">ODOMS Store — Kho Phường Bình Phú</div>
          <div class="wb-sub-text wb-info-line">Địa chỉ: 186 An Dương Vương, Phường Bình Phú, TP.HCM</div>
          <div class="wb-sub-text wb-info-line">Điện thoại: <strong class="wb-strong-val">028.7777.6868</strong></div>
        </div>

        <div class="wb-info-box wb-info-to">
          <div class="wb-info-box-head">
            <span class="wb-box-title wb-box-title-to">Nơi nhận hàng (Bên mua)</span>
          </div>
          <div class="wb-strong-val wb-info-name">${safeCustomer} — ${safePhone}</div>
          <div class="wb-sub-text wb-info-line">Địa chỉ: ${safeAddress}</div>
          <div class="wb-sub-text wb-info-line">Hàng hóa: ${safeSku} × <strong class="wb-qty-highlight">${data.quantity} SP</strong> (${safeProduct})</div>
        </div>
      </div>

      <div class="wb-footer-row">
        <span>Cho phép đồng kiểm hàng hóa</span>
        <span>Chữ ký nhân viên đóng gói / bưu tá</span>
      </div>
    `;

    return { qrPayload, html, createdAtStr: tsText };
  },

  generateWaybillAndQR(saveToHistory = true) {
    const previewEl = document.getElementById("printableWaybillTicketArea");
    if (!previewEl) return;

    const data = this.getWaybillFormValues();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const createdAtStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const built = this.buildWaybillTicketInnerHtml(data, createdAtStr);
    previewEl.setAttribute("data-qr-content", built.qrPayload);
    previewEl.innerHTML = built.html;

    if (saveToHistory) {
      let beforeSnapshot = null;
      let existedShipmentBefore = null;
      let beforeOrderCarrier = "";
      if (window.omsEngine && typeof window.omsEngine.captureOperationalSnapshot === "function") {
        beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
        existedShipmentBefore = (window.omsEngine.shipments || []).find(
          (s) =>
            String(s.trackingCode || "").trim() === String(data.trackingCode || "").trim() ||
            (data.orderId && String(s.orderId || "").trim() === String(data.orderId || "").trim())
        );
        const ordRef = (window.omsEngine.orders || []).find(
          (o) => String(o.orderId || "").trim() === String(data.orderId || "").trim()
        );
        beforeOrderCarrier = ordRef ? window.omsEngine.resolveOrderCarrier(ordRef) : "Chưa gán ĐVVC";
      }

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

        if (beforeSnapshot) {
          const beforeDesc = existedShipmentBefore
            ? `${existedShipmentBefore.carrier} · ${window.omsEngine.getShipmentStatusTextVi(existedShipmentBefore.status)}`
            : `Chưa có vận đơn (ĐVVC: ${beforeOrderCarrier})`;
          const afterDesc = `${data.carrier} · Chờ lấy hàng (Đơn ${data.orderId})`;
          const undoRec = window.omsEngine.recordReversibleAction({
            actionType: existedShipmentBefore ? "UPDATE_WAYBILL" : "CREATE_WAYBILL",
            actionLabel: existedShipmentBefore ? "Cập nhật vận đơn" : "Tạo vận đơn mới",
            targetCode: data.trackingCode,
            beforeSummary: beforeDesc,
            afterSummary: afterDesc,
            beforeSnapshot
          });
          this.onActionDiffRecorded(undoRec);
        }
      }

      this.currentWaybillHistoryPage = 1;
      this.renderWaybillOrderSelector();
      this.renderWaybillHistoryTable();
      this.renderShippingTab();
      this.renderOrdersTable();
      this.renderKPIsAndBadges();
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

    const activeFilter = String(this.waybillHistoryStatusFilter || "ALL").toUpperCase();
    const filterBtnMap = {
      ALL: "btnWaybillStatusAll",
      PENDING_PICKUP: "btnWaybillStatusPending",
      IN_TRANSIT: "btnWaybillStatusTransit",
      DELIVERED: "btnWaybillStatusDelivered"
    };
    Object.keys(filterBtnMap).forEach((k) => {
      const btn = document.getElementById(filterBtnMap[k]);
      if (!btn) return;
      const isAct = activeFilter === k;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-pressed", isAct ? "true" : "false");
    });

    const { list } = this.getFilteredWaybillRecords();
    const total = list.length;
    const pageSize = Math.max(1, Number(this.waybillHistoryPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, Number(this.currentWaybillHistoryPage) || 1), totalPages);
    this.currentWaybillHistoryPage = page;

    const startIdx = (page - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    const infoEl = document.getElementById("waybillHistoryPaginationInfo");
    const curEl = document.getElementById("waybillHistoryPaginationCurrent");
    const prevBtn = document.getElementById("btnWaybillPrevPage");
    const nextBtn = document.getElementById("btnWaybillNextPage");

    if (infoEl) {
      infoEl.innerText =
        total > 0
          ? `Hiển thị ${startIdx + 1}–${startIdx + pageItems.length} / tổng ${total} vận đơn`
          : "Hiển thị 0 / tổng 0 vận đơn";
    }
    if (curEl) curEl.innerText = `Trang ${page} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr class="odoms-empty-row"><td colspan="7" class="odoms-empty-cell">Không có vận đơn nào khớp bộ lọc hiện tại.</td></tr>`;
      return;
    }

    const eyeSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
      '<circle cx="12" cy="12" r="3"/>' +
      "</svg>";
    const printSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 6 2 18 2 18 9"/>' +
      '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>' +
      '<rect x="6" y="14" width="12" height="8"/>' +
      "</svg>";

    tbody.innerHTML = pageItems
      .map((item) => {
        const safeTrk = this.escapeLogHtml(item.trackingCode);
        const safeOrd = this.escapeLogHtml(item.orderId);
        const safeCh = this.escapeLogHtml(item.channelName || item.channel);
        const safeCarrier = this.escapeLogHtml(item.carrier);
        const safeTier = this.escapeLogHtml(item.shippingTierText);
        const safeCust = this.escapeLogHtml(item.customerName);
        const safePhone = this.escapeLogHtml(item.customerPhone || "-");
        const safeSku = this.escapeLogHtml(item.sku);
        const safeProdTitle = this.escapeLogHtml(`${item.sku} × ${item.quantity} — ${item.productName}`);
        const safeBatch = this.escapeLogHtml(item.batchCode);
        const codVal = Number(item.totalAmount) || 0;
        const codStr = `${codVal.toLocaleString("vi-VN")} VND`;
        const codSub = codVal > 0 ? "Thu hộ" : "Đã thanh toán";
        const badgeMeta = this.getWaybillStatusBadgeMeta(item.status);
        const jsTrk = String(item.trackingCode || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

        return `
          <tr>
            <td class="col-wb-code">
              <div class="wb-cell-code-main" title="${safeTrk}">${safeTrk}</div>
              <div class="wb-cell-sub" title="${safeOrd} · ${safeCh}">${safeOrd} · ${safeCh}</div>
            </td>
            <td class="col-wb-carrier">
              <div class="wb-cell-primary" title="${safeCarrier}">${safeCarrier}</div>
              <div class="wb-cell-sub">${safeTier}</div>
            </td>
            <td class="col-wb-customer">
              <div class="wb-cell-primary" title="${safeCust}">${safeCust}</div>
              <div class="wb-cell-sub">${safePhone}</div>
            </td>
            <td class="col-wb-product">
              <div class="wb-cell-primary" title="${safeProdTitle}">${safeSku} × ${item.quantity}</div>
              <div class="wb-cell-sub" title="Lô: ${safeBatch}">Lô: ${safeBatch}</div>
            </td>
            <td class="col-wb-cod">
              <div class="wb-cell-primary">${codStr}</div>
              <div class="wb-cell-sub">${codSub}</div>
            </td>
            <td class="col-wb-status">
              <span class="odoms-flat-badge ${badgeMeta.cls}">${badgeMeta.label}</span>
            </td>
            <td class="col-wb-actions">
              <div class="settings-segmented-control wb-action-seg" role="group" aria-label="Thao tác vận đơn ${safeTrk}">
                <button
                  type="button"
                  class="settings-seg-btn settings-action-icon-btn"
                  onclick="AppUI.previewWaybillFromHistory('${jsTrk}')"
                  title="Xem trước phiếu in A6"
                  aria-label="Xem trước phiếu in A6"
                >
                  ${eyeSvg}
                </button>
                <button
                  type="button"
                  class="settings-seg-btn settings-action-icon-btn"
                  onclick="AppUI.loadAndPrintWaybillFromHistory('${jsTrk}')"
                  title="In phiếu vận đơn A6"
                  aria-label="In phiếu vận đơn A6"
                >
                  ${printSvg}
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  },

  loadWaybillRecordToForm(trackingCode) {
    const trk = String(trackingCode || "").trim();
    if (!trk) return null;
    const merged = this.getMergedWaybillRecords();
    const found = merged.find((w) => w.trackingCode === trk) || this.waybillHistory.find((w) => w.trackingCode === trk);
    if (!found) return null;

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };

    setVal("wbOrderId", found.orderId);
    setVal("wbChannel", found.channel);
    setVal("wbTrackingCode", found.trackingCode);
    this.setWaybillCarrierSelectValue(found.carrier);
    setVal("wbCustomerName", found.customerName);
    setVal("wbCustomerPhone", found.customerPhone);
    setVal("wbAddress", found.address);
    setVal("wbSku", found.sku);
    setVal("wbProductName", found.productName);
    setVal("wbQuantity", found.quantity);
    setVal("wbBatchCode", found.batchCode);
    setVal("wbTotalAmount", found.totalAmount);

    const sel = document.getElementById("waybillOrderSelect");
    if (sel && found.orderId) {
      sel.value = found.orderId;
    }
    this.syncWaybillOrderPickerTrigger(found.orderId || "");

    return found;
  },

  findWaybillRecordByTracking(trackingCode) {
    const trk = String(trackingCode || "").trim();
    if (!trk) return null;
    const merged = this.getMergedWaybillRecords();
    return merged.find((w) => w.trackingCode === trk) || this.waybillHistory.find((w) => w.trackingCode === trk) || null;
  },

  // Nút Con mắt trên bảng Danh sách vận đơn: mở hộp thoại xem trước phiếu A6 tại chỗ (KHÔNG ghi đè Khối 1, KHÔNG cuộn trang)
  previewWaybillFromHistory(trackingCode) {
    const found = this.findWaybillRecordByTracking(trackingCode);
    if (!found) return;

    this.activePreviewWaybillRecord = { ...found };
    const modalEl = document.getElementById("waybillPreviewModal");
    const areaEl = document.getElementById("waybillPreviewModalTicketArea");
    const subEl = document.getElementById("waybillPreviewModalSubtitle");
    if (!modalEl || !areaEl) return;

    const built = this.buildWaybillTicketInnerHtml(found, found.createdAt || "");
    areaEl.setAttribute("data-qr-content", built.qrPayload);
    areaEl.innerHTML = built.html;
    if (subEl) {
      subEl.innerText = `Mã vận đơn: ${found.trackingCode} · Đơn gốc: ${found.orderId}`;
    }
    modalEl.classList.add("open");
  },

  closeWaybillPreviewModal() {
    const modalEl = document.getElementById("waybillPreviewModal");
    if (modalEl) modalEl.classList.remove("open");
  },

  loadPreviewedWaybillToForm() {
    const rec = this.activePreviewWaybillRecord;
    if (!rec || !rec.trackingCode) return;
    this.closeWaybillPreviewModal();
    this.loadWaybillRecordToForm(rec.trackingCode);
    this.generateWaybillAndQR(false);
    const previewEl = document.getElementById("printableWaybillTicketArea");
    if (previewEl && typeof previewEl.scrollIntoView === "function") {
      previewEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  },

  printPreviewedWaybillNow() {
    const rec = this.activePreviewWaybillRecord;
    if (!rec) return;
    this.printWaybillQrTicket(rec);
  },

  // Nút Máy in trên bảng Danh sách vận đơn: in trực tiếp 1 chạm không ghi đè biểu mẫu Khối 1
  loadAndPrintWaybillFromHistory(trackingCode) {
    const found = this.findWaybillRecordByTracking(trackingCode);
    if (!found) return;
    this.printWaybillQrTicket(found);
  },

  // In trực tiếp phiếu vận đơn A6 1 chạm qua iframe ẩn (không mở cửa sổ phụ about:blank, hỗ trợ truyền dữ liệu riêng overrideData)
  printWaybillQrTicket(overrideData) {
    const isCustomRecord = Boolean(overrideData && typeof overrideData === "object" && overrideData.trackingCode);
    let data = null;
    let ticketInnerHtml = "";

    if (isCustomRecord) {
      data = overrideData;
      const built = this.buildWaybillTicketInnerHtml(data, data.createdAt || "");
      ticketInnerHtml = built.html;
    } else {
      data = this.getWaybillFormValues();
      let shouldSave = Boolean(overrideData);
      if (overrideData === undefined) {
        const merged = this.getMergedWaybillRecords();
        const existsAlready = merged.some((w) => w.trackingCode === data.trackingCode);
        shouldSave = !existsAlready;
      }
      this.generateWaybillAndQR(shouldSave);
      const ticketEl = document.getElementById("printableWaybillTicketArea");
      if (ticketEl && ticketEl.innerHTML) {
        ticketInnerHtml = ticketEl.innerHTML;
      } else {
        ticketInnerHtml = this.buildWaybillTicketInnerHtml(data, data.createdAt || "").html;
      }
    }

    const safeTitleTrk = this.escapeLogHtml(data.trackingCode);
    const printDocHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Phiếu vận đơn A6 - ${safeTitleTrk}</title>
  <style>
    @page { size: 105mm 148mm; margin: 4mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-variant-numeric: tabular-nums;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .waybill-ticket-preview {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
      border: 1.5px dashed #000000;
      border-radius: 0px;
      padding: 10px 12px;
      break-inside: avoid;
    }
    .wb-ticket-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .wb-brand-box { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .wb-brand-logo {
      width: 28px; height: 28px; background: #000000; color: #ffffff;
      font-weight: 900; font-size: 12px; border-radius: 0px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .wb-ticket-title-main { font-weight: 800; font-size: 11.5px; line-height: 1.25; }
    .wb-ticket-sub-line { font-size: 9.5px; margin-top: 2px; }
    .wb-ticket-carrier-line { font-size: 9.5px; font-weight: 700; margin-top: 3px; }
    .wb-ticket-channel-tag {
      display: inline-block; padding: 2px 6px; border-radius: 0px;
      font-size: 10px; font-weight: 800; border: 1px solid #000000;
      background: #ffffff; color: #000000;
    }
    .wb-qr-and-code-row {
      display: grid;
      grid-template-columns: 116px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      background: #ffffff;
      border: 1px solid #000000;
      border-radius: 0px;
      padding: 8px;
      margin-bottom: 8px;
    }
    .wb-qr-box {
      background: #ffffff;
      border: 1px solid #000000;
      border-radius: 0px;
      padding: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .wb-qr-svg-wrap { width: 104px; height: 104px; background: #ffffff; }
    .wb-qr-svg-wrap svg { display: block; width: 104px; height: 104px; }
    .wb-qr-caption { font-size: 8.5px; font-weight: 800; margin-top: 3px; color: #000000; text-align: center; }
    .wb-code-label { font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .wb-code-display { font-size: 13.5px; font-weight: 800; font-family: monospace; margin: 2px 0 6px; word-break: break-all; }
    .wb-meta-grid { display: grid; grid-template-columns: 1fr; gap: 3px; font-size: 10px; }
    .wb-info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      font-size: 10.5px;
      margin-bottom: 8px;
    }
    .wb-info-box {
      border: 1px solid #000000;
      border-left: 3px solid #000000;
      border-radius: 0px;
      padding: 7px 9px;
      background: #ffffff;
    }
    .wb-info-box-head { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .wb-box-title { font-size: 9.5px; font-weight: 800; text-transform: uppercase; }
    .wb-info-name { font-size: 11px; font-weight: 700; }
    .wb-info-line { font-size: 10px; margin-top: 2px; line-height: 1.35; }
    .wb-footer-row {
      display: flex; justify-content: space-between; gap: 8px; font-size: 9.5px;
      font-weight: 600; border-top: 1px dashed #000000; padding-top: 6px;
    }
    .wb-title-main, .wb-code-display, .wb-strong-val, .wb-box-title, .wb-qty-highlight, .wb-sub-text, .wb-footer-row {
      color: #000000 !important;
    }
    .wb-cod-pill {
      display: inline-block; min-width: 90px; padding: 2px 6px;
      border: 1.5px solid #000000; background: #ffffff; color: #000000;
      text-align: center; font-weight: 800; font-size: 11px; border-radius: 0px;
    }
  </style>
</head>
<body>
  <div class="waybill-ticket-preview">${ticketInnerHtml}</div>
</body>
</html>`;

    // Tái sử dụng duy nhất 1 iframe in ẩn #odomsPrintIframe (không rò rỉ DOM, không mở about:blank)
    let iframe = document.getElementById("odomsPrintIframe");
    if (!iframe && typeof document.createElement === "function" && document.body) {
      iframe = document.createElement("iframe");
      iframe.id = "odomsPrintIframe";
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      iframe.style.pointerEvents = "none";
      if (typeof document.body.appendChild === "function") {
        document.body.appendChild(iframe);
      }
    }

    const iframeWin = iframe && iframe.contentWindow ? iframe.contentWindow : null;
    const iframeDoc = iframe && (iframe.contentDocument || (iframeWin && iframeWin.document)) ? iframe.contentDocument || iframeWin.document : null;
    if (iframeDoc && iframeWin && typeof iframeDoc.open === "function" && typeof iframeDoc.write === "function") {
      iframeDoc.open();
      iframeDoc.write(printDocHtml);
      iframeDoc.close();
      try {
        if (typeof iframeWin.focus === "function") iframeWin.focus();
        if (typeof iframeWin.print === "function") iframeWin.print();
      } catch (e) {
        if (typeof window.print === "function") window.print();
      }
      return;
    }

    if (typeof window.print === "function") {
      window.print();
    }
  },

  renderStaffManagement() {
    const tbody = document.getElementById("staffUsersTableBody");
    if (!tbody) return;

    const activeUser = window.userAuth.currentUser;
    // Lọc không hiển thị tài khoản dự phòng lhmt trên giao diện hệ thống ODOMS
    const visibleUsers = (window.userAuth.users || []).filter(
      (u) => !u.isHiddenBackup && u.username.toLowerCase() !== "lhmt"
    );

    if (visibleUsers.length === 0) {
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="7">
            <div class="odoms-empty-state">Chưa có tài khoản nhân sự nào trong danh sách.</div>
          </td>
        </tr>
      `;
      return;
    }

    const svgLock = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    const svgUnlock = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
    const svgEdit = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;
    const svgTrash = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

    tbody.innerHTML = visibleUsers
      .map((u, idx) => {
        const isCurrent = activeUser && activeUser.username.toLowerCase() === u.username.toLowerCase();
        const isRoot = u.username.toLowerCase() === "dttd" || u.username.toLowerCase() === "lhmt" || u.isRoot;
        const isActive = u.status !== "INACTIVE";
        const isProtected = isRoot || isCurrent;
        const toggleTitle = isProtected
          ? "Không thể tạm khóa tài khoản Quản trị hệ thống hoặc phiên đang đăng nhập"
          : isActive
            ? "Tạm khóa tài khoản"
            : "Mở khóa tài khoản";
        const deleteTitle = isProtected
          ? "Không thể xóa tài khoản Quản trị hệ thống hoặc phiên đang đăng nhập"
          : "Xóa tài khoản nhân sự";
        const suspendReasonClean = this.normalizeLegacyLogText(u.suspendReason || "Tạm khóa");

        return `
        <tr>
          <td class="col-stt"><span class="staff-stt-num">#${idx + 1}</span></td>
          <td class="col-staff-name">
            <div class="staff-identity-cell">
              <div class="qa-avatar staff-avatar" aria-hidden="true">${u.avatar}</div>
              <div class="staff-identity-text">
                <div class="staff-full-name-row">
                  <span class="staff-full-name">${u.fullName}</span>
                  ${isCurrent ? '<span class="odoms-flat-badge is-info staff-current-badge">Đang đăng nhập</span>' : ""}
                </div>
                <div class="staff-dept-name">${this.normalizeStaffDeptDisplay(u.department)}</div>
              </div>
            </div>
          </td>
          <td class="col-staff-login"><code class="odoms-username-code">${u.username}</code></td>
          <td class="col-staff-role"><span class="staff-role-text">${this.normalizeStaffRoleDisplay(u.role)}</span></td>
          <td class="col-staff-shift"><span class="staff-shift-text">${u.shift || "Ca Hành chính"}</span></td>
          <td class="col-staff-status">
            <div class="staff-status-cell">
              <span class="odoms-flat-badge ${isActive ? "is-success" : "is-error"}">
                ${isActive ? "Đang hoạt động" : "Tạm khóa"}
              </span>
              ${
                !isActive && u.suspendUntil
                  ? `<span class="staff-suspend-note" title="Lý do: ${suspendReasonClean}">Đến: ${u.suspendUntil}</span>`
                  : ""
              }
            </div>
          </td>
          <td class="col-staff-actions">
            <div class="settings-segmented-control staff-action-seg" role="group" aria-label="Thao tác tài khoản ${u.username}">
              <button
                type="button"
                class="settings-seg-btn settings-action-icon-btn staff-toggle-btn ${isActive ? "is-active-account" : "is-locked-account"}"
                onclick="AppUI.handleToggleUserStatus('${u.username}', ${isActive})"
                title="${toggleTitle}"
                aria-label="${toggleTitle}"
                ${isProtected ? "disabled" : ""}
              >
                ${isActive ? svgLock : svgUnlock}
              </button>
              <button
                type="button"
                class="settings-seg-btn settings-action-icon-btn staff-edit-btn"
                onclick="AppUI.openEditUserModal('${u.username}')"
                title="Chỉnh sửa thông tin nhân sự"
                aria-label="Chỉnh sửa thông tin nhân sự"
              >
                ${svgEdit}
              </button>
              <button
                type="button"
                class="settings-seg-btn settings-action-icon-btn staff-delete-btn"
                onclick="AppUI.promptDeleteUser('${u.username}')"
                title="${deleteTitle}"
                aria-label="${deleteTitle}"
                ${isProtected ? "disabled" : ""}
              >
                ${svgTrash}
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  unifiedLogsState: {
    query: "",
    groupFilter: "ALL",
    page: 1,
    pageSize: 10,
    legendOpen: false,
    activeDetailUid: null,
    cachedEntries: [],
    cachedViewItems: [],
    copyResetTimer: null
  },

  UNIFIED_LOG_CODE_GROUPS: [
    {
      range: "10xxx",
      title: "Đơn hàng & Giữ hàng",
      items: [
        { code: "10101", shortLabel: "Tiếp nhận đơn hàng", label: "Tiếp nhận / tạo đơn hàng mới", level: "normal" },
        { code: "10201", shortLabel: "Giữ hàng xuất kho", label: "Giữ hàng xuất kho cho đơn hàng", level: "normal" },
        { code: "10301", shortLabel: "Cảnh báo thiếu tồn kho", label: "Cảnh báo thiếu tồn kho / chờ nhập bổ sung", level: "warning" },
        { code: "10401", shortLabel: "Hoàn tác duyệt đơn", label: "Hoàn tác thao tác xử lý đơn hàng", level: "warning" }
      ]
    },
    {
      range: "20xxx",
      title: "Kho & Đồng bộ tồn",
      items: [
        { code: "20101", shortLabel: "Đồng bộ tồn đa kênh", label: "Đồng bộ lượng hàng sẵn sàng bán đa kênh", level: "normal" },
        { code: "20201", shortLabel: "Điều chỉnh tồn kho", label: "Nhập kho / điều chỉnh tồn kho", level: "normal" },
        { code: "20301", shortLabel: "Phân bổ lô xuất kho", label: "Phân bổ lô hàng xuất kho", level: "normal" }
      ]
    },
    {
      range: "30xxx",
      title: "Vận đơn & Giao nhận",
      items: [
        { code: "30101", shortLabel: "Tạo vận đơn mới", label: "Tạo vận đơn / gán đơn vị vận chuyển", level: "normal" },
        { code: "30201", shortLabel: "Cập nhật giao hàng", label: "Cập nhật tiến trình giao hàng", level: "normal" },
        { code: "30301", shortLabel: "Giao thất bại / hoàn hàng", label: "Giao thất bại / hoàn hàng", level: "error" }
      ]
    },
    {
      range: "40xxx",
      title: "Tài khoản & Truy cập hệ thống",
      items: [
        { code: "40101", shortLabel: "Đăng nhập hệ thống", label: "Đăng nhập hệ thống thành công", level: "normal" },
        { code: "40102", shortLabel: "Cảnh báo truy cập", label: "Đăng nhập thất bại / cảnh báo truy cập", level: "error" },
        { code: "40201", shortLabel: "Cập nhật tài khoản nhân sự", label: "Thêm, chỉnh sửa, tạm khóa hoặc xóa tài khoản nhân sự", level: "normal" }
      ]
    },
    {
      range: "50xxx",
      title: "Cài đặt & Sổ dữ liệu",
      items: [
        { code: "50101", shortLabel: "Đổi chế độ hiển thị", label: "Thay đổi chế độ hiển thị Sáng / Tối", level: "normal" },
        { code: "50201", shortLabel: "Chế độ thử nghiệm", label: "Bật / tắt chế độ thử nghiệm hoặc cảnh báo dữ liệu chưa đồng bộ", level: "warning" },
        { code: "50301", shortLabel: "Đồng bộ sổ dữ liệu", label: "Đồng bộ dữ liệu Google Sheets / kiểm tra kết nối 5 kênh", level: "normal" },
        { code: "50401", shortLabel: "Nạp dữ liệu chuẩn", label: "Nạp bộ dữ liệu chuẩn / khởi tạo hệ thống", level: "normal" },
        { code: "50901", shortLabel: "Sự kiện hệ thống khác", label: "Sự kiện hệ thống khác", level: "normal" }
      ]
    }
  ],

  escapeLogHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  getLogCodeMeta(code) {
    const key = String(code || "50901");
    for (const grp of this.UNIFIED_LOG_CODE_GROUPS) {
      for (const item of grp.items) {
        if (item.code === key) {
          return {
            code: item.code,
            shortLabel: item.shortLabel || item.label,
            label: item.label,
            level: item.level,
            groupRange: grp.range,
            groupTitle: grp.title
          };
        }
      }
    }
    return {
      code: "50901",
      shortLabel: "Sự kiện hệ thống khác",
      label: "Sự kiện hệ thống khác",
      level: "normal",
      groupRange: "50xxx",
      groupTitle: "Cài đặt & Sổ dữ liệu"
    };
  },

  parseLogTimestampMs(rawTime, fallbackMs = null) {
    if (typeof fallbackMs === "number" && Number.isFinite(fallbackMs) && fallbackMs > 0) {
      return fallbackMs;
    }
    const raw = String(rawTime || "").trim();
    if (!raw) return 0;

    // 1. Dạng HH:MM:SS(.mmm)? DD.MM.YYYY hoặc DD/MM/YYYY hoặc DD-MM-YYYY
    const hmsDmy = raw.match(/(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?\s+(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if (hmsDmy) {
      const dt = new Date(
        Number(hmsDmy[7]),
        Number(hmsDmy[6]) - 1,
        Number(hmsDmy[5]),
        Number(hmsDmy[1]),
        Number(hmsDmy[2]),
        Number(hmsDmy[3]),
        Number((hmsDmy[4] || "0").padEnd(3, "0"))
      );
      if (!isNaN(dt.getTime())) return dt.getTime();
    }

    // 2. Dạng DD/MM/YYYY HH:MM:SS(.mmm)? hoặc DD-MM-YYYY / DD.MM.YYYY
    const dmyHms = raw.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?/);
    if (dmyHms) {
      const dt = new Date(
        Number(dmyHms[3]),
        Number(dmyHms[2]) - 1,
        Number(dmyHms[1]),
        Number(dmyHms[4]),
        Number(dmyHms[5]),
        Number(dmyHms[6]),
        Number((dmyHms[7] || "0").padEnd(3, "0"))
      );
      if (!isNaN(dt.getTime())) return dt.getTime();
    }

    // 3. Dạng ISO / YYYY-MM-DD[T ]HH:MM:SS(.mmm)?(Z|offset)?
    const isoMatch = raw.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})[T\s]+(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:?\d{2})?$/i);
    if (isoMatch) {
      if (isoMatch[8]) {
        const parsedIso = Date.parse(raw);
        if (Number.isFinite(parsedIso)) return parsedIso;
      }
      const dt = new Date(
        Number(isoMatch[1]),
        Number(isoMatch[2]) - 1,
        Number(isoMatch[3]),
        Number(isoMatch[4]),
        Number(isoMatch[5]),
        Number(isoMatch[6]),
        Number((isoMatch[7] || "0").padEnd(3, "0"))
      );
      if (!isNaN(dt.getTime())) return dt.getTime();
    }

    // 4. Dạng HH:MM:SS(.mmm)? chưa kèm ngày
    const hmsOnly = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
    if (hmsOnly) {
      const now = new Date();
      const dt = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        Number(hmsOnly[1]),
        Number(hmsOnly[2]),
        Number(hmsOnly[3]),
        Number((hmsOnly[4] || "0").padEnd(3, "0"))
      );
      if (!isNaN(dt.getTime())) return dt.getTime();
    }

    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  },

  classifyUnifiedLogEvent(cleanText, rawStatus, rawType, source) {
    const txt = String(cleanText || "");
    const stUpper = String(rawStatus || "").toUpperCase();
    const tpLower = String(rawType || "").toLowerCase();

    let code = "50901";
    if (/HOÀN TÁC|Hoàn tác/i.test(txt)) {
      code = "10401";
    } else if (/CHẾ ĐỘ THỬ NGHIỆM|thử nghiệm|chưa được đồng bộ lên Google Sheets/i.test(txt)) {
      code = "50201";
    } else if (
      /Đăng nhập thất bại|PHÂN QUYỀN NHÂN SỰ|không có quyền truy cập/i.test(txt) ||
      (source === "ACCESS" && (stUpper === "FAILED" || stUpper === "ERROR"))
    ) {
      code = "40102";
    } else if (/Đăng nhập thành công|XÁC THỰC PHIÊN|đã đăng nhập hệ thống|Đăng xuất khỏi/i.test(txt)) {
      code = "40101";
    } else if (
      /\[NHÂN SỰ|\[BẢO MẬT\]|tài khoản nhân sự|Tạo mới tài khoản|Chỉnh sửa thông tin tài khoản|Tạm khóa tài khoản|Tạm ngừng hoạt động tài khoản|Mở khóa.*tài khoản|Kích hoạt lại tài khoản|Đặt lại mật khẩu|xóa tài khoản/i.test(
        txt
      )
    ) {
      code = "40201";
    } else if (/CÀI ĐẶT GIAO DIỆN|chế độ hiển thị|giao diện hiển thị/i.test(txt)) {
      code = "50101";
    } else if (/giao thất bại|chuyển hoàn|hoàn hàng|lỗi giao/i.test(txt)) {
      code = "30301";
    } else if (/TẠO VẬN ĐƠN|CẬP NHẬT ĐVVC|khởi tạo vận đơn/i.test(txt)) {
      code = "30101";
    } else if (/\[VẬN ĐƠN\]|tiến trình giao|đang vận chuyển|giao thành công|chờ lấy hàng/i.test(txt)) {
      code = "30201";
    } else if (/CHẶN BÁN LỐ|thiếu tồn|thiếu hàng|bán vượt tồn|TẠM NGƯNG TIẾP NHẬN/i.test(txt)) {
      code = "10301";
    } else if (/ĐÃ GIỮ HÀNG|giữ hàng cho đơn|Giữ\s+\d+\s*x\s*SP-/i.test(txt)) {
      code = "10201";
    } else if (/ĐỒNG BỘ LƯỢNG HÀNG BÁN|KẾT NỐI LẠI SÀN|TẠM NGƯNG SÀN|số lượng sẵn sàng bán lên/i.test(txt)) {
      code = "20101";
    } else if (/NHẬP KHO|nhập bù|nhập hàng|điều chỉnh tồn/i.test(txt)) {
      code = "20201";
    } else if (/phân bổ lô|lô xuất|LO-2026/i.test(txt)) {
      code = "20301";
    } else if (/GOOGLE SHEETS|LƯU TRÊN MÁY|TẠM LƯU TRÊN MÁY|Kiểm tra kết nối 5 kênh|đủ 6 trang tính/i.test(txt)) {
      code = "50301";
    } else if (/Khởi tạo hệ thống|Cấu hình tồn kho|bộ dữ liệu chuẩn/i.test(txt)) {
      code = "50401";
    } else if (
      /tiếp nhận.*đơn|đọc tệp|đơn hàng mới|duyệt nhanh đơn|duyệt\s+\d+\s+đơn|XÁC NHẬN ĐƠN|CHỜ XÁC NHẬN|ĐƠN LỖI THÔNG TIN|trùng mã đơn|hủy đơn|TIẾP NHẬN & XUẤT HÀNG|ĐỐI CHIẾU TRƯỚC/i.test(
        txt
      )
    ) {
      code = "10101";
    }

    const meta = this.getLogCodeMeta(code);
    let statusCls = "is-success";
    let statusText = "Thành công";
    let codeTone = "is-normal";

    if (
      stUpper === "FAILED" ||
      stUpper === "ERROR" ||
      tpLower === "error" ||
      code === "40102" ||
      code === "30301"
    ) {
      if (code === "40102" && /PHÂN QUYỀN NHÂN SỰ/i.test(txt)) {
        statusCls = "is-warning";
        statusText = "Cảnh báo";
        codeTone = "is-warning";
      } else if (code === "30301" && tpLower === "warn") {
        statusCls = "is-warning";
        statusText = "Cảnh báo";
        codeTone = "is-warning";
      } else {
        statusCls = "is-error";
        statusText = "Thất bại";
        codeTone = "is-error";
      }
    } else if (
      stUpper === "WARN" ||
      stUpper === "WARNING" ||
      tpLower === "warn" ||
      tpLower === "warning" ||
      meta.level === "warning"
    ) {
      statusCls = "is-warning";
      statusText = "Cảnh báo";
      codeTone = "is-warning";
    }

    return {
      code: meta.code,
      groupRange: meta.groupRange,
      groupTitle: meta.groupTitle,
      eventLabel: meta.shortLabel,
      codeMeaning: meta.label,
      level: meta.level,
      codeTone,
      statusCls,
      statusText
    };
  },

  buildLogOneLineSummary(cleanText, code) {
    let txt = String(cleanText || "").replace(/\s+/g, " ").trim();
    if (!txt) return "Sự kiện hệ thống";

    // Rút gọn chuỗi đồng bộ nhiều mã sản phẩm [ SP-xxx: SL | SP-yyy: SL | ... ] thành 1 dòng súc tích
    const stockListMatch = txt.match(/\[\s*([^\]]*SP-[^\]]*\|[^\]]*)\s*\]/);
    if (stockListMatch) {
      const pairsCount = stockListMatch[1]
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean).length;
      const beforeList = txt
        .slice(0, stockListMatch.index)
        .replace(/^\[[^\]]+\]\s*/, "")
        .replace(/lúc\s+[\d.:-]+\s*:?\s*$/i, "")
        .replace(/:\s*$/, "")
        .trim();
      const pausedMatch = txt.match(/\(Đang tạm ngưng:[^)]+\)/i);
      const pausedSuffix = pausedMatch ? ` ${pausedMatch[0]}` : "";
      if (beforeList) {
        return `${beforeList} (${pairsCount} sản phẩm)${pausedSuffix}`;
      }
      return `Đồng bộ số lượng sẵn sàng bán cho ${pairsCount} sản phẩm${pausedSuffix}`;
    }

    // Gỡ tiền tố ngoặc vuông dài đầu dòng để nội dung tóm tắt rõ ràng trên 1 dòng
    if (code !== "10201" && code !== "10301") {
      txt = txt.replace(/^\[(?:CÀI ĐẶT GIAO DIỆN|NHÂN SỰ ODOMS|NHÂN SỰ|BẢO MẬT|TỔNG QUAN|XỬ LÝ HÀNG LOẠT|TẠO VẬN ĐƠN & CẬP NHẬT ĐVVC|VẬN ĐƠN|ĐỒNG BỘ GOOGLE SHEETS|TẢI TỪ GOOGLE SHEETS|LƯU TRÊN MÁY|TẠM LƯU TRÊN MÁY|XÁC THỰC PHIÊN|PHÂN QUYỀN NHÂN SỰ|TẠM NGƯNG SÀN|KẾT NỐI LẠI SÀN|NHẬP KHO BỔ SUNG|ĐƠN LỖI THÔNG TIN|TIẾP NHẬN & XUẤT HÀNG|CHỜ XÁC NHẬN)\]\s*/i, "");
    }
    return txt;
  },

  extractLogBeforeAfterDiff(cleanText) {
    const txt = String(cleanText || "").trim();
    if (!txt) return null;

    // 1. Mẫu Hoàn tác: Từ [...] → Về [...]
    const undoMatch = txt.match(/Từ\s*\[([^\]]+)\]\s*(?:→|➔|->)\s*Về\s*\[([^\]]+)\]/i);
    if (undoMatch) {
      return {
        label: "Đối chiếu hoàn tác",
        before: undoMatch[1].trim(),
        after: undoMatch[2].trim()
      };
    }

    // 2. Mẫu Đối chiếu Trước → Sau
    const diffMatch = txt.match(/\[ĐỐI CHIẾU TRƯỚC\s*(?:→|➔)\s*SAU[^\]]*\]\s*(?:([^:→➔]+):\s*)?(.+?)\s*(?:→|➔)\s*(.+)$/);
    if (diffMatch) {
      return {
        label: diffMatch[1] ? `Đối chiếu thay đổi (${diffMatch[1].trim()})` : "Đối chiếu thay đổi",
        before: diffMatch[2].trim(),
        after: diffMatch[3].trim()
      };
    }

    // 3. Mẫu tồn sẵn sàng bán: Sẵn sàng bán: 10 ➔ 6
    const stockArrow = txt.match(/Sẵn sàng bán:\s*(\d+)\s*(?:→|➔|->)\s*(\d+)/i);
    if (stockArrow) {
      return {
        label: "Biến động tồn sẵn sàng bán",
        before: `${stockArrow[1]} sản phẩm`,
        after: `${stockArrow[2]} sản phẩm`
      };
    }

    // 4. Mẫu chuyển trạng thái vận đơn: trạng thái ...: A → B
    const shipArrow = txt.match(/chuyển trạng thái\s+([^:]+):\s*([^→➔]+?)\s*(?:→|➔)\s*([^.]+)\.?/i);
    if (shipArrow) {
      return {
        label: `Chuyển trạng thái (${shipArrow[1].trim()})`,
        before: shipArrow[2].trim(),
        after: shipArrow[3].trim()
      };
    }

    // 5. Mẫu mũi tên đơn giản (VD: 27 → 25)
    const simpleArrow = txt.match(/(\b\d+(?:[.,]\d+)?(?:\s*(?:SP|sản phẩm|cái|đơn|VND))?)\s*(?:→|➔)\s*(\d+(?:[.,]\d+)?(?:\s*(?:SP|sản phẩm|cái|đơn|VND))?)/i);
    if (simpleArrow) {
      return {
        label: "Đối chiếu số liệu thay đổi",
        before: simpleArrow[1].trim(),
        after: simpleArrow[2].trim()
      };
    }

    return null;
  },

  extractLogStockPairs(cleanText) {
    const txt = String(cleanText || "");
    const bracketMatch = txt.match(/\[\s*([^\]]*SP-[^\]]*\|[^\]]*)\s*\]/);
    if (!bracketMatch) return [];
    return bracketMatch[1]
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const sepIdx = part.indexOf(":");
        if (sepIdx === -1) return { itemCode: part, qty: "-" };
        return {
          itemCode: part.slice(0, sepIdx).trim(),
          qty: part.slice(sepIdx + 1).trim()
        };
      });
  },

  buildUnifiedLogEntries() {
    const rawEntries = [];
    const accessLogs = window.userAuth && Array.isArray(window.userAuth.accessLogs) ? window.userAuth.accessLogs : [];
    const opLogs = window.omsEngine && Array.isArray(window.omsEngine.logs) ? window.omsEngine.logs : [];

    // 1. Đọc từ userAuth.accessLogs (CHỈ ĐỌC, tuyệt đối không làm đột biến bản gốc)
    accessLogs.forEach((log, idx) => {
      if (!log) return;
      const cleanAction = this.normalizeLegacyLogText(log.action || "");
      const cls = this.classifyUnifiedLogEvent(cleanAction, log.status, "", "ACCESS");
      const displayTime = this.formatLogDisplayTimestamp(log.time);
      const sortMs = this.parseLogTimestampMs(log.time);
      const dateMatch = displayTime.match(/(\d{2}\.\d{2}\.\d{4})/);
      const actorUsername = String(log.username || "").trim();
      const actorName = String(log.fullName || "").trim() || (actorUsername ? actorUsername : "Hệ thống tự động");
      const actorRole = this.normalizeStaffRoleDisplay(log.role || "Hệ thống tự động");
      const networkInfo = this.normalizeLegacyLogText(log.ip || "Hệ thống ODOMS");

      rawEntries.push({
        uid: `acc_${String(log.id || idx).replace(/[^a-zA-Z0-9_-]/g, "")}_${idx}`,
        source: "ACCESS",
        sourceLabel: "Lịch sử truy cập & kiểm soát hệ thống",
        code: cls.code,
        groupRange: cls.groupRange,
        groupTitle: cls.groupTitle,
        eventLabel: cls.eventLabel,
        codeMeaning: cls.codeMeaning,
        codeTone: cls.codeTone,
        summary: this.buildLogOneLineSummary(cleanAction, cls.code),
        fullText: cleanAction,
        actorName,
        actorUsername,
        actorRole,
        displayTime,
        dateKey: dateMatch ? dateMatch[1] : "",
        sortMs,
        recencyOrder: idx,
        networkInfo,
        statusCls: cls.statusCls,
        statusText: cls.statusText
      });
    });

    // 2. Đọc từ omsEngine.logs (CHỈ ĐỌC trong RAM)
    opLogs.forEach((l, idx) => {
      if (!l) return;
      const cleanMsg = this.normalizeLegacyLogText(l.message || "");
      const cls = this.classifyUnifiedLogEvent(cleanMsg, "", l.type, "OPERATION");
      const displayTime = this.formatLogDisplayTimestamp(l.time, l.timestampMs);
      const sortMs = this.parseLogTimestampMs(l.time, l.timestampMs);
      const dateMatch = displayTime.match(/(\d{2}\.\d{2}\.\d{4})/);
      const isBgTask = Boolean(l.isBackground);
      const actorUsername = isBgTask ? "" : String(l.actorUsername || "").trim();
      const actorName = isBgTask ? "Hệ thống tự động" : String(l.actorName || "").trim() || "Hệ thống tự động";
      const actorRole = isBgTask
        ? "Hệ thống tự động"
        : l.actorRole
          ? this.normalizeStaffRoleDisplay(l.actorRole)
          : "Hệ thống tự động";

      // Khử trùng lặp tầng hiển thị cho các sự kiện ghi song song vào cả accessLogs và omsEngine.logs trong cùng phiên giây
      const isDuplicateTwin = rawEntries.some((acc) => {
        if (acc.source !== "ACCESS" || acc.code !== cls.code) return false;
        const deltaMs = Math.abs(acc.sortMs - sortMs);
        if (deltaMs > 3000) return false;
        if (cls.code === "40101") {
          return !actorUsername || acc.actorUsername.toLowerCase() === actorUsername.toLowerCase();
        }
        if (cls.code === "10401") {
          return true;
        }
        return false;
      });
      if (isDuplicateTwin) return;

      rawEntries.push({
        uid: `ops_${String(l.id || idx).replace(/[^a-zA-Z0-9_-]/g, "")}_${idx}`,
        source: "OPERATION",
        sourceLabel: "Tiến trình xử lý nghiệp vụ ODOMS",
        code: cls.code,
        groupRange: cls.groupRange,
        groupTitle: cls.groupTitle,
        eventLabel: cls.eventLabel,
        codeMeaning: cls.codeMeaning,
        codeTone: cls.codeTone,
        summary: this.buildLogOneLineSummary(cleanMsg, cls.code),
        fullText: cleanMsg,
        actorName,
        actorUsername,
        actorRole,
        displayTime,
        dateKey: dateMatch ? dateMatch[1] : "",
        sortMs,
        recencyOrder: accessLogs.length + idx,
        networkInfo: "Tiến trình vận hành ODOMS",
        statusCls: cls.statusCls,
        statusText: cls.statusText
      });
    });

    // Sắp xếp giảm dần theo thời gian thực (mới nhất lên đầu), giữ ổn định thứ tự khi trùng mili-giây
    rawEntries.sort((a, b) => {
      if (b.sortMs !== a.sortMs) return b.sortMs - a.sortMs;
      return a.recencyOrder - b.recencyOrder;
    });

    this.unifiedLogsState.cachedEntries = rawEntries;
    return rawEntries;
  },

  parseAllocationOrderRow(entry) {
    const txt = String((entry && entry.fullText) || "");
    const m = txt.match(/Đơn\s+([A-Za-z0-9_-]+)\s*\(([^)]+)\).*?Giữ\s+(\d+)\s*x\s*([A-Za-z0-9_-]+)/i);
    if (m) {
      return {
        orderId: m[1].trim(),
        channel: m[2].trim(),
        qty: m[3].trim(),
        productCode: m[4].trim()
      };
    }
    const orderMatch = txt.match(/Đơn\s+([A-Za-z0-9_-]+)/i);
    const skuMatch = txt.match(/\b(SP-[A-Za-z0-9-]+)\b/);
    const qtyMatch = txt.match(/Giữ\s+(\d+)/i);
    return {
      orderId: orderMatch ? orderMatch[1] : "-",
      channel: "-",
      qty: qtyMatch ? qtyMatch[1] : "-",
      productCode: skuMatch ? skuMatch[1] : "-"
    };
  },

  // Gom đợt tự động các bản ghi 10201 (Thành công) liên tiếp trong <= 2 giây (>= 3 dòng -> 1 dòng tổng hợp)
  // Tuyệt đối không gom các dòng Cảnh báo / Thất bại và không làm đột biến mảng gốc
  groupUnifiedLogBursts(entries) {
    const result = [];
    let i = 0;
    while (i < entries.length) {
      const curr = entries[i];
      if (curr && curr.code === "10201" && curr.statusCls === "is-success") {
        const run = [curr];
        let j = i + 1;
        while (j < entries.length) {
          const next = entries[j];
          const prev = run[run.length - 1];
          if (
            next &&
            next.code === "10201" &&
            next.statusCls === "is-success" &&
            Math.abs(prev.sortMs - next.sortMs) <= 2000
          ) {
            run.push(next);
            j++;
          } else {
            break;
          }
        }

        if (run.length >= 3) {
          const head = run[0];
          const burstUid = `burst_10201_${head.sortMs}_${run.length}_${head.recencyOrder}`;
          const burstLines = run.map((c, idx) => `${idx + 1}. [${c.displayTime}] ${c.fullText}`).join("\n");
          result.push({
            uid: burstUid,
            isBurstGroup: true,
            burstCount: run.length,
            burstChildren: run,
            source: "OPERATION",
            sourceLabel: `Đợt tự động giữ hàng xuất kho (${run.length} đơn)`,
            code: "10201",
            groupRange: head.groupRange,
            groupTitle: head.groupTitle,
            eventLabel: `Giữ hàng xuất kho (${run.length} đơn)`,
            codeMeaning: head.codeMeaning,
            codeTone: "is-normal",
            summary: `Giữ hàng xuất kho tự động cho ${run.length} đơn hàng trong cùng đợt`,
            fullText: burstLines,
            actorName: "Hệ thống tự động",
            actorUsername: "",
            actorRole: "Hệ thống tự động",
            displayTime: head.displayTime,
            dateKey: head.dateKey,
            sortMs: head.sortMs,
            recencyOrder: head.recencyOrder,
            networkInfo: "Tiến trình phân bổ tự động ODOMS",
            statusCls: "is-success",
            statusText: "Thành công"
          });
          i = j;
          continue;
        }
      }
      result.push(curr);
      i++;
    }
    return result;
  },

  matchesLogsGroupFilter(item, groupKey) {
    const key = String(groupKey || "ALL").toUpperCase();
    if (key === "ALL") return true;
    const codeStr = String((item && item.code) || "");
    if (key === "ACCESS") {
      return codeStr.startsWith("40") || codeStr.startsWith("50");
    }
    if (key === "OPS") {
      return codeStr.startsWith("10") || codeStr.startsWith("20") || codeStr.startsWith("30");
    }
    if (key === "ALERT") {
      return item && (item.statusCls === "is-warning" || item.statusCls === "is-error");
    }
    return true;
  },

  matchesLogQueryFields(item, qLower, includeFullText = true) {
    if (!qLower) return true;
    return (
      String(item.code || "").toLowerCase().includes(qLower) ||
      String(item.eventLabel || "").toLowerCase().includes(qLower) ||
      String(item.codeMeaning || "").toLowerCase().includes(qLower) ||
      String(item.groupTitle || "").toLowerCase().includes(qLower) ||
      String(item.actorName || "").toLowerCase().includes(qLower) ||
      String(item.actorUsername || "").toLowerCase().includes(qLower) ||
      String(item.displayTime || "").toLowerCase().includes(qLower) ||
      String(item.statusText || "").toLowerCase().includes(qLower) ||
      (includeFullText &&
        (String(item.summary || "").toLowerCase().includes(qLower) ||
          String(item.fullText || "").toLowerCase().includes(qLower)))
    );
  },

  filterUnifiedLogEntries(allRawEntries, query, groupFilter = "ALL") {
    const qLower = String(query || "").trim().toLowerCase();
    const grouped = this.groupUnifiedLogBursts(allRawEntries);

    if (!qLower) {
      return grouped.filter((item) => this.matchesLogsGroupFilter(item, groupFilter));
    }

    // Tìm kiếm xuyên đợt gom: nếu khớp trực tiếp nhãn/mã đợt thì giữ dòng gom, nếu là mã đơn/sản phẩm/kênh cụ thể thì mở trực tiếp các dòng con khớp
    const matched = [];
    for (const item of grouped) {
      if (!item.isBurstGroup) {
        if (this.matchesLogsGroupFilter(item, groupFilter) && this.matchesLogQueryFields(item, qLower, true)) {
          matched.push(item);
        }
        continue;
      }

      if (this.matchesLogQueryFields(item, qLower, false)) {
        if (this.matchesLogsGroupFilter(item, groupFilter)) {
          matched.push(item);
        }
      } else if (Array.isArray(item.burstChildren)) {
        for (const child of item.burstChildren) {
          if (this.matchesLogsGroupFilter(child, groupFilter) && this.matchesLogQueryFields(child, qLower, true)) {
            matched.push(child);
          }
        }
      }
    }
    return matched;
  },

  syncLogsGroupFilterUI() {
    const bar = document.getElementById("logsGroupFilterBar");
    if (!bar || typeof bar.querySelectorAll !== "function") return;
    const activeGroup = this.unifiedLogsState.groupFilter || "ALL";
    bar.querySelectorAll("[data-log-group]").forEach((btn) => {
      const isAct = btn.getAttribute("data-log-group") === activeGroup;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-pressed", isAct ? "true" : "false");
    });
  },

  setLogsGroupFilter(groupKey) {
    const valid = ["ALL", "ACCESS", "OPS", "ALERT"];
    const next = valid.includes(String(groupKey || "").toUpperCase()) ? String(groupKey).toUpperCase() : "ALL";
    this.unifiedLogsState.groupFilter = next;
    this.unifiedLogsState.page = 1;
    this.unifiedLogsState.activeDetailUid = null;
    this.renderUnifiedLogs();
  },

  changeLogsPage(delta) {
    const nextPage = (this.unifiedLogsState.page || 1) + Number(delta || 0);
    this.unifiedLogsState.page = Math.max(1, nextPage);
    this.renderUnifiedLogs();
  },

  renderLogsCodeLegend() {
    const grid = document.getElementById("logsCodeLegendGrid");
    if (!grid) return;

    const currentQuery = String(this.unifiedLogsState.query || "").trim();
    const levelLabelMap = {
      normal: { text: "Bình thường", cls: "is-success" },
      warning: { text: "Cảnh báo", cls: "is-warning" },
      error: { text: "Lỗi", cls: "is-error" }
    };

    grid.innerHTML = this.UNIFIED_LOG_CODE_GROUPS.map((grp) => {
      const itemsHtml = grp.items
        .map((it) => {
          const lv = levelLabelMap[it.level] || levelLabelMap.normal;
          const isSelected = currentQuery === it.code;
          const toneCls = it.level === "error" ? "is-error" : it.level === "warning" ? "is-warning" : "is-normal";
          return `
            <button
              type="button"
              class="logs-legend-item ${isSelected ? "is-selected" : ""}"
              onclick="AppUI.selectLogsLegendCode('${it.code}')"
              title="Lọc nhanh nhật ký theo mã ${it.code}"
            >
              <span class="ulog-code-badge ${toneCls}">${it.code}</span>
              <span class="logs-legend-desc">${this.escapeLogHtml(it.label)}</span>
              <span class="odoms-flat-badge ${lv.cls} logs-legend-level">${lv.text}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div class="logs-legend-group">
          <div class="logs-legend-group-head">
            <span class="logs-legend-range">${grp.range}</span>
            <span class="logs-legend-group-title">${this.escapeLogHtml(grp.title)}</span>
          </div>
          <div class="logs-legend-items">${itemsHtml}</div>
        </div>
      `;
    }).join("");
  },

  toggleLogsCodeLegend(forceState) {
    const nextOpen = typeof forceState === "boolean" ? forceState : !this.unifiedLogsState.legendOpen;
    this.unifiedLogsState.legendOpen = nextOpen;

    const drawer = document.getElementById("logsCodeLegendDrawer");
    const btn = document.getElementById("btnToggleLogsCodeLegend");
    if (drawer) drawer.classList.toggle("hidden", !nextOpen);
    if (btn) {
      btn.classList.toggle("is-open", nextOpen);
      btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    }
    if (nextOpen) {
      this.renderLogsCodeLegend();
    }
  },

  handleLogsSearchInput(val) {
    this.unifiedLogsState.query = String(val || "");
    this.unifiedLogsState.page = 1;
    // Đang ở Khung chi tiết mà gõ tìm kiếm -> tự quay về chế độ Danh sách và lọc ngay
    this.unifiedLogsState.activeDetailUid = null;
    this.renderUnifiedLogs();
  },

  clearLogsSearch() {
    this.unifiedLogsState.query = "";
    this.unifiedLogsState.page = 1;
    this.unifiedLogsState.activeDetailUid = null;
    const input = document.getElementById("unifiedLogsSearchInput");
    if (input) {
      input.value = "";
      if (typeof input.focus === "function") input.focus();
    }
    this.renderUnifiedLogs();
  },

  selectLogsLegendCode(code) {
    const cleanCode = String(code || "").trim();
    this.unifiedLogsState.groupFilter = "ALL";
    this.unifiedLogsState.query = cleanCode;
    this.unifiedLogsState.page = 1;
    // Bấm chọn 1 mã trong ngăn chú thích -> tự quay về chế độ Danh sách và lọc ngay
    this.unifiedLogsState.activeDetailUid = null;
    const input = document.getElementById("unifiedLogsSearchInput");
    if (input) input.value = cleanCode;
    this.renderUnifiedLogs();
  },

  openUnifiedLogDetail(uid) {
    if (!this.isSystemLogAdmin()) return;
    if (!uid) return;
    this.unifiedLogsState.activeDetailUid = String(uid);
    this.renderUnifiedLogs();
  },

  handleUnifiedLogRowKeydown(event, uid) {
    if (!event) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.openUnifiedLogDetail(uid);
    }
  },

  closeUnifiedLogDetail() {
    this.unifiedLogsState.activeDetailUid = null;
    // Giữ nguyên trang hiện tại, bộ lọc nhóm và từ khóa đang tìm
    this.renderUnifiedLogs();
  },

  findRelatedSessionOperations(loginEntry, allEntries) {
    if (!loginEntry || loginEntry.code !== "40101") return [];
    const targetUser = String(loginEntry.actorUsername || "").trim().toLowerCase();
    const targetName = String(loginEntry.actorName || "").trim().toLowerCase();
    const targetDate = loginEntry.dateKey || "";

    return allEntries
      .filter((item) => {
        if (item.uid === loginEntry.uid) return false;
        if (item.code === "40101") return false;
        const itemUser = String(item.actorUsername || "").trim().toLowerCase();
        const itemName = String(item.actorName || "").trim().toLowerCase();
        const sameActor =
          (targetUser && itemUser && itemUser === targetUser) ||
          (targetName && targetName !== "hệ thống tự động" && itemName === targetName);
        if (sameActor) return true;
        return Boolean(targetDate && item.dateKey === targetDate && item.source === "OPERATION");
      })
      .slice(0, 12);
  },

  findUnifiedLogByUid(uid) {
    const target = String(uid || "");
    if (!target) return null;
    const inView = (this.unifiedLogsState.cachedViewItems || []).find((e) => e.uid === target);
    if (inView) return inView;
    return (this.unifiedLogsState.cachedEntries || []).find((e) => e.uid === target) || null;
  },

  copyUnifiedLogDetail(uid) {
    const entry = this.findUnifiedLogByUid(uid);
    if (!entry) return;

    const cleanCopyName = String(entry.actorName || "").trim();
    const cleanCopyRole = String(entry.actorRole || "").trim();
    const copyRoleSuffix =
      cleanCopyRole && cleanCopyRole.toLowerCase() !== cleanCopyName.toLowerCase() ? ` — ${cleanCopyRole}` : "";
    const lines = [
      `Mã sự kiện: ${entry.code} — ${entry.codeMeaning}`,
      `Nhóm nghiệp vụ: ${entry.groupRange} · ${entry.groupTitle}`,
      `Thời điểm ghi nhận: ${entry.displayTime}`,
      `Người thực hiện: ${cleanCopyName}${entry.actorUsername ? ` (${entry.actorUsername})` : ""}${copyRoleSuffix}`,
      `Nguồn / Thiết bị & Địa chỉ mạng: ${entry.networkInfo}`,
      `Trạng thái: ${entry.statusText}`,
      `Nội dung ghi nhận đầy đủ: ${entry.fullText}`
    ];
    const textToCopy = lines.join("\n");

    const showCopiedFeedback = () => {
      const btn = document.getElementById("btnCopyUnifiedLogDetail");
      const labelEl = document.getElementById("copyUnifiedLogLabel");
      if (labelEl) labelEl.innerText = "Đã sao chép";
      if (btn) btn.classList.add("is-copied");
      if (this.unifiedLogsState.copyResetTimer) {
        clearTimeout(this.unifiedLogsState.copyResetTimer);
      }
      this.unifiedLogsState.copyResetTimer = setTimeout(() => {
        const lEl = document.getElementById("copyUnifiedLogLabel");
        const bEl = document.getElementById("btnCopyUnifiedLogDetail");
        if (lEl) lEl.innerText = "Sao chép chi tiết";
        if (bEl) bEl.classList.remove("is-copied");
      }, 2000);
    };

    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(textToCopy).then(showCopiedFeedback).catch(() => {
        this.fallbackCopyText(textToCopy, showCopiedFeedback);
      });
    } else {
      this.fallbackCopyText(textToCopy, showCopiedFeedback);
    }
  },

  fallbackCopyText(text, onDone) {
    try {
      if (typeof document === "undefined" || !document.body) {
        if (typeof onDone === "function") onDone();
        return;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      if (typeof document.execCommand === "function") {
        document.execCommand("copy");
      }
      document.body.removeChild(ta);
      if (typeof onDone === "function") onDone();
    } catch (e) {
      if (typeof onDone === "function") onDone();
    }
  },

  renderUnifiedLogDetail(entry, allEntries) {
    const detailContainer = document.getElementById("logsDetailContent");
    if (!detailContainer || !entry) return;

    const svgBack = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;
    const svgCopy = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>`;
    const svgChevron = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

    const diffObj = !entry.isBurstGroup ? this.extractLogBeforeAfterDiff(entry.fullText) : null;
    const stockPairs = !entry.isBurstGroup ? this.extractLogStockPairs(entry.fullText) : [];
    const relatedOps = !entry.isBurstGroup ? this.findRelatedSessionOperations(entry, allEntries) : [];

    let structuredBlocksHtml = "";

    // 0. Nếu là dòng tổng hợp đợt 10201: hiển thị danh sách cuộn gọn các đơn hàng đã giữ hàng trong đợt
    if (entry.isBurstGroup && Array.isArray(entry.burstChildren) && entry.burstChildren.length > 0) {
      const burstRowsHtml = entry.burstChildren
        .map((child, idx) => {
          const parsed = this.parseAllocationOrderRow(child);
          return `
            <tr>
              <td class="col-burst-stt">${idx + 1}</td>
              <td class="col-burst-order"><strong>${this.escapeLogHtml(parsed.orderId)}</strong></td>
              <td class="col-burst-channel">${this.escapeLogHtml(parsed.channel)}</td>
              <td class="col-burst-product">${this.escapeLogHtml(parsed.productCode)}</td>
              <td class="col-burst-qty">${this.escapeLogHtml(parsed.qty)}</td>
            </tr>
          `;
        })
        .join("");

      structuredBlocksHtml += `
        <div class="ulog-sub-block">
          <div class="ulog-sub-title">Danh sách đơn hàng đã giữ hàng trong đợt (${entry.burstChildren.length} đơn)</div>
          <div class="ulog-burst-scroll">
            <table class="wms-table odoms-flat-table ulog-burst-table">
              <thead>
                <tr>
                  <th class="col-burst-stt">STT</th>
                  <th class="col-burst-order">Mã đơn hàng</th>
                  <th class="col-burst-channel">Kênh bán</th>
                  <th class="col-burst-product">Mã sản phẩm</th>
                  <th class="col-burst-qty">Số lượng</th>
                </tr>
              </thead>
              <tbody>${burstRowsHtml}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 1. Đối chiếu Trước thay đổi | Sau thay đổi
    if (diffObj) {
      structuredBlocksHtml += `
        <div class="ulog-sub-block">
          <div class="ulog-sub-title">${this.escapeLogHtml(diffObj.label)}</div>
          <div class="ulog-diff-grid">
            <div class="ulog-diff-cell">
              <div class="ulog-diff-label">Trước thay đổi</div>
              <div class="ulog-diff-value">${this.escapeLogHtml(diffObj.before)}</div>
            </div>
            <div class="ulog-diff-cell is-after">
              <div class="ulog-diff-label">Sau thay đổi</div>
              <div class="ulog-diff-value">${this.escapeLogHtml(diffObj.after)}</div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Bảng lưới danh sách mã sản phẩm đồng bộ tồn kho
    if (stockPairs.length > 0) {
      const pairsHtml = stockPairs
        .map(
          (p) => `
          <div class="ulog-stock-item">
            <span class="ulog-stock-code">${this.escapeLogHtml(p.itemCode)}</span>
            <span class="ulog-stock-qty">${this.escapeLogHtml(p.qty)}</span>
          </div>
        `
        )
        .join("");

      structuredBlocksHtml += `
        <div class="ulog-sub-block">
          <div class="ulog-sub-title">Chi tiết tồn kho sẵn sàng bán đã đồng bộ (${stockPairs.length} mặt hàng)</div>
          <div class="ulog-stock-grid-head">
            <span>Mã sản phẩm</span>
            <span>Số lượng sẵn sàng bán</span>
          </div>
          <div class="ulog-stock-grid">${pairsHtml}</div>
        </div>
      `;
    }

    // 3. Nếu là phiên đăng nhập (40101): liệt kê các thao tác nghiệp vụ liên quan
    if (entry.code === "40101") {
      if (relatedOps.length > 0) {
        const relRowsHtml = relatedOps
          .map(
            (rel) => `
            <button
              type="button"
              class="ulog-related-row"
              onclick="AppUI.openUnifiedLogDetail('${this.escapeLogHtml(rel.uid)}')"
              title="Xem chi tiết sự kiện ${rel.code}"
            >
              <span class="ulog-code-badge ${rel.codeTone}">${rel.code}</span>
              <span class="ulog-related-summary">${this.escapeLogHtml(rel.summary)}</span>
              <span class="ulog-related-time">${this.escapeLogHtml(rel.displayTime)}</span>
              <span class="ulog-related-arrow">${svgChevron}</span>
            </button>
          `
          )
          .join("");
        structuredBlocksHtml += `
          <div class="ulog-sub-block">
            <div class="ulog-sub-title">Thao tác nghiệp vụ liên quan trong phiên / cùng ngày (${relatedOps.length})</div>
            <div class="ulog-related-list">${relRowsHtml}</div>
          </div>
        `;
      } else {
        structuredBlocksHtml += `
          <div class="ulog-sub-block">
            <div class="ulog-sub-title">Thao tác nghiệp vụ liên quan trong phiên</div>
            <div class="ulog-related-empty">Chưa ghi nhận thêm thao tác nghiệp vụ nào gắn với phiên đăng nhập này.</div>
          </div>
        `;
      }
    }

    const cleanActorName = String(entry.actorName || "").trim();
    const cleanActorRole = String(entry.actorRole || "").trim();
    const showSeparateRole =
      Boolean(cleanActorRole) && cleanActorRole.toLowerCase() !== cleanActorName.toLowerCase();
    const roleSuffixHtml = showSeparateRole
      ? ` <span class="ulog-meta-sep">·</span> <span>${this.escapeLogHtml(cleanActorRole)}</span>`
      : "";
    const actorBlockHtml = entry.actorUsername
      ? `<strong>${this.escapeLogHtml(cleanActorName)}</strong> <code class="odoms-username-code">${this.escapeLogHtml(entry.actorUsername)}</code>${roleSuffixHtml}`
      : `<strong>${this.escapeLogHtml(cleanActorName)}</strong>${roleSuffixHtml}`;

    detailContainer.innerHTML = `
      <div class="logs-detail-topbar">
        <div class="logs-detail-topbar-left">
          <button
            type="button"
            class="btn btn-outline odoms-btn-34 logs-back-btn no-print"
            onclick="AppUI.closeUnifiedLogDetail()"
            title="Quay lại bảng danh sách nhật ký"
            aria-label="Quay lại danh sách"
          >
            ${svgBack}
            Quay lại danh sách
          </button>
          <div class="logs-detail-heading">
            <span class="ulog-code-badge ${entry.codeTone}">${entry.code}</span>
            <span class="logs-detail-group-title">${this.escapeLogHtml(entry.groupTitle)}</span>
            <span class="odoms-flat-badge ${entry.statusCls}">${this.escapeLogHtml(entry.statusText)}</span>
          </div>
        </div>
        <button
          type="button"
          id="btnCopyUnifiedLogDetail"
          class="btn btn-outline odoms-btn-34 logs-copy-btn no-print"
          onclick="AppUI.copyUnifiedLogDetail('${this.escapeLogHtml(entry.uid)}')"
          title="Sao chép đầy đủ thông tin sự kiện"
          aria-label="Sao chép chi tiết sự kiện"
        >
          ${svgCopy}
          <span id="copyUnifiedLogLabel">Sao chép chi tiết</span>
        </button>
      </div>

      <div class="logs-detail-body">
        <div class="ulog-section">
          <div class="ulog-section-title">Thông tin tổng quan</div>
          <div class="ulog-overview-grid">
            <div class="ulog-overview-item">
              <span class="ulog-overview-label">Mã sự kiện</span>
              <span class="ulog-overview-value">
                <span class="ulog-code-badge ${entry.codeTone}">${entry.code}</span>
                <span>${this.escapeLogHtml(entry.codeMeaning)}</span>
              </span>
            </div>
            <div class="ulog-overview-item">
              <span class="ulog-overview-label">Thời điểm ghi nhận</span>
              <span class="ulog-overview-value ulog-tabular">${this.escapeLogHtml(entry.displayTime)}</span>
            </div>
            <div class="ulog-overview-item">
              <span class="ulog-overview-label">Người thực hiện &amp; Vai trò</span>
              <span class="ulog-overview-value">${actorBlockHtml}</span>
            </div>
            <div class="ulog-overview-item">
              <span class="ulog-overview-label">Nguồn / Thiết bị &amp; Địa chỉ mạng</span>
              <span class="ulog-overview-value ulog-tabular">${this.escapeLogHtml(entry.networkInfo)}</span>
            </div>
            <div class="ulog-overview-item ulog-overview-span-2">
              <span class="ulog-overview-label">Trạng thái xử lý</span>
              <span class="ulog-overview-value">
                <span class="odoms-flat-badge ${entry.statusCls}">${this.escapeLogHtml(entry.statusText)}</span>
                <span class="ulog-source-note">${this.escapeLogHtml(entry.sourceLabel)}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="ulog-section">
          <div class="ulog-section-title">Thao tác nghiệp vụ đã xử lý</div>
          ${structuredBlocksHtml}
          <div class="ulog-sub-block">
            <div class="ulog-sub-title">Nội dung ghi nhận đầy đủ</div>
            <div class="ulog-raw-box">${this.escapeLogHtml(entry.fullText)}</div>
          </div>
        </div>
      </div>
    `;
  },

  updateLogsPaginationUI(totalCount, page, pageSize) {
    const infoEl = document.getElementById("logsPaginationInfo");
    const pageEl = document.getElementById("logsPaginationCurrent");
    const prevBtn = document.getElementById("btnLogsPrevPage");
    const nextBtn = document.getElementById("btnLogsNextPage");

    const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);
    const safePage = totalCount === 0 ? 1 : Math.min(Math.max(1, page), totalPages);

    if (infoEl) {
      if (totalCount === 0) {
        infoEl.innerText = "Hiển thị 0 / tổng 0 sự kiện";
      } else {
        const startIdx = (safePage - 1) * pageSize + 1;
        const endIdx = Math.min(safePage * pageSize, totalCount);
        infoEl.innerText = `Hiển thị ${startIdx}–${endIdx} / tổng ${totalCount} sự kiện`;
      }
    }
    if (pageEl) {
      pageEl.innerText = `Trang ${safePage} / ${totalPages}`;
    }
    if (prevBtn) {
      prevBtn.disabled = totalCount === 0 || safePage <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = totalCount === 0 || safePage >= totalPages;
    }
    return { safePage, totalPages };
  },

  renderUnifiedLogs() {
    const tbody = document.getElementById("accessLogsTableBody");
    const listBox = document.getElementById("logsListViewBox");
    const detailBox = document.getElementById("logsDetailViewBox");
    const clearBtn = document.getElementById("btnClearLogsSearch");
    const searchInput = document.getElementById("unifiedLogsSearchInput");

    const allEntries = this.buildUnifiedLogEntries();
    const query = String(this.unifiedLogsState.query || "");
    const groupFilter = this.unifiedLogsState.groupFilter || "ALL";
    const pageSize = this.unifiedLogsState.pageSize || 10;

    if (searchInput && searchInput.value !== query) {
      searchInput.value = query;
    }
    if (clearBtn) {
      clearBtn.classList.toggle("hidden", query.trim().length === 0);
    }
    this.syncLogsGroupFilterUI();
    if (this.unifiedLogsState.legendOpen) {
      this.renderLogsCodeLegend();
    }

    const filtered = this.filterUnifiedLogEntries(allEntries, query, groupFilter);
    this.unifiedLogsState.cachedViewItems = filtered;

    const canInspectDetail = this.isSystemLogAdmin();
    const activeUid = canInspectDetail ? this.unifiedLogsState.activeDetailUid : null;
    const activeEntry = activeUid ? this.findUnifiedLogByUid(activeUid) : null;

    if (activeEntry && listBox && detailBox) {
      listBox.classList.add("hidden");
      detailBox.classList.remove("hidden");
      this.renderUnifiedLogDetail(activeEntry, allEntries);
      return;
    }

    // Chế độ Danh sách (mặc định, phân trang cố định 10 dòng / trang)
    if (activeUid && !activeEntry) {
      this.unifiedLogsState.activeDetailUid = null;
    }
    if (listBox) listBox.classList.remove("hidden");
    if (detailBox) detailBox.classList.add("hidden");
    if (!tbody) return;

    const { safePage } = this.updateLogsPaginationUI(filtered.length, this.unifiedLogsState.page || 1, pageSize);
    this.unifiedLogsState.page = safePage;

    if (allEntries.length === 0) {
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="5">
            <div class="odoms-empty-state">Chưa có bản ghi nhật ký hệ thống nào được ghi nhận.</div>
          </td>
        </tr>
      `;
      return;
    }

    if (filtered.length === 0) {
      const emptyMsg = query.trim()
        ? `Không tìm thấy sự kiện nào khớp với "${this.escapeLogHtml(query.trim())}".`
        : "Không có sự kiện nào trong nhóm lọc đã chọn.";
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="5">
            <div class="odoms-empty-state">${emptyMsg}</div>
          </td>
        </tr>
      `;
      return;
    }

    const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
    const svgChevron = `<svg class="ulog-row-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

    tbody.innerHTML = pageItems
      .map((item) => {
        const uidAttr = this.escapeLogHtml(item.uid);
        const eventText = item.eventLabel || item.codeMeaning || "Sự kiện hệ thống";
        const interactiveAttrs = canInspectDetail
          ? `class="ulog-row is-clickable" tabindex="0" role="button" onclick="AppUI.openUnifiedLogDetail('${uidAttr}')" onkeydown="AppUI.handleUnifiedLogRowKeydown(event, '${uidAttr}')" title="Nhấn để xem chi tiết sự kiện ${item.code}"`
          : `class="ulog-row"`;

        return `
        <tr ${interactiveAttrs}>
          <td class="col-ulog-code">
            <span class="ulog-code-badge ${item.codeTone}" title="${this.escapeLogHtml(item.codeMeaning)}">${item.code}</span>
          </td>
          <td class="col-ulog-event">
            <span class="ulog-event-text">${this.escapeLogHtml(eventText)}</span>
          </td>
          <td class="col-ulog-actor">
            <span class="ulog-actor-text" title="${this.escapeLogHtml(item.actorName)}">${this.escapeLogHtml(item.actorName)}</span>
          </td>
          <td class="col-ulog-time">${this.escapeLogHtml(item.displayTime)}</td>
          <td class="col-ulog-status">
            <div class="ulog-status-cell">
              <span class="odoms-flat-badge ${item.statusCls}">${this.escapeLogHtml(item.statusText)}</span>
              ${canInspectDetail ? svgChevron : ""}
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  renderAccessLogsTable() {
    this.renderUnifiedLogs();
  },

  // ============================================================================
  // PHÂN HỆ BÁO CÁO & ĐỐI CHIẾU TỔNG HỢP — 100% SỐ LIỆU THỰC <= Date.now() (v39)
  // ============================================================================
  reportsInvPage: 1,
  reportsInvPageSize: 10,
  _repPeriodOptSig: "",
  _repInvCatOptSig: "",

  classifyReportOrder(ord) {
    const isCancelled = Boolean(
      ord && (ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED")
    );
    const isAllocated = Boolean(ord && !isCancelled && ord.status === "ALLOCATED");
    const isWaiting = Boolean(ord && !isCancelled && !isAllocated);
    const qty = Number(ord && ord.quantity) || 0;
    const unitPrice = Number(ord && ord.unitPrice) || 0;
    const revenue = isAllocated ? qty * unitPrice : 0;
    return { isAllocated, isWaiting, isCancelled, qty, revenue };
  },

  syncReportsFilterOptions() {
    const allMonths =
      typeof this.getMonthlyHistoricalDataset === "function" ? this.getMonthlyHistoricalDataset() : {};
    const orderedKeys = Object.keys(allMonths).sort();
    const descKeys = [...orderedKeys].reverse();
    const nowDt = new Date(Date.now());
    const pad = (n) => String(n).padStart(2, "0");
    const todayVn = `${pad(nowDt.getDate())}/${pad(nowDt.getMonth() + 1)}/${nowDt.getFullYear()}`;
    const curQKey = `${nowDt.getFullYear()}-Q${Math.ceil((nowDt.getMonth() + 1) / 3)}`;

    // 1. Nạp danh sách Kỳ đối chiếu động (#repPeriodFilter) theo dữ liệu thực tế <= hiện tại
    const periodSel = document.getElementById("repPeriodFilter");
    if (periodSel) {
      const quarterSet = new Set();
      orderedKeys.forEach((mk) => {
        const [yStr, mStr] = mk.split("-");
        const qNum = Math.ceil(Number(mStr) / 3);
        quarterSet.add(`${yStr}-Q${qNum}`);
      });
      const qKeysDesc = Array.from(quarterSet).sort().reverse();
      const validValues = new Set(["ALL"]);
      descKeys.forEach((mk) => validValues.add(`MONTH:${mk}`));
      qKeysDesc.forEach((qk) => validValues.add(`QUARTER:${qk}`));

      const nextSig = `${todayVn}|${descKeys.join(",")}|${qKeysDesc.join(",")}`;
      const prevVal = periodSel.value || "ALL";

      if (this._repPeriodOptSig !== nextSig) {
        const monthOptsHtml = descKeys
          .map((mk) => `<option value="MONTH:${mk}">${allMonths[mk].label}</option>`)
          .join("");
        const quarterOptsHtml = qKeysDesc
          .map((qk) => {
            const [yStr, qPart] = qk.split("-Q");
            const qNum = Number(qPart) || 1;
            const startM = (qNum - 1) * 3 + 1;
            const endM = qNum * 3;
            const rangeText =
              qk === curQKey
                ? `Tháng ${pad(startM)} – ${todayVn}`
                : `Tháng ${pad(startM)} – Tháng ${pad(endM)}/${yStr}`;
            return `<option value="QUARTER:${qk}">Quý ${qNum}/${yStr} (${rangeText})</option>`;
          })
          .join("");

        let html = `<option value="ALL">Tất cả thời gian (đến ${todayVn})</option>`;
        if (monthOptsHtml) {
          html += `<optgroup label="Theo Tháng">${monthOptsHtml}</optgroup>`;
        }
        if (quarterOptsHtml) {
          html += `<optgroup label="Theo Quý">${quarterOptsHtml}</optgroup>`;
        }
        periodSel.innerHTML = html;
        this._repPeriodOptSig = nextSig;
      }
      periodSel.value = validValues.has(prevVal) ? prevVal : "ALL";
    }

    // 2. Nạp danh sách Danh mục động cho Bảng 2 (#repInvCategoryFilter)
    const catSel = document.getElementById("repInvCategoryFilter");
    if (catSel) {
      const effInv =
        typeof this.getEffectiveInventoryAtNow === "function"
          ? this.getEffectiveInventoryAtNow()
          : window.omsEngine && Array.isArray(window.omsEngine.inventory)
          ? window.omsEngine.inventory
          : [];
      const cats = [];
      const seen = new Set();
      effInv.forEach((item) => {
        const c = String((item && item.category) || "").trim();
        if (c && !seen.has(c)) {
          seen.add(c);
          cats.push(c);
        }
      });
      const catSig = cats.join("|");
      const prevCat = catSel.value || "ALL";
      if (this._repInvCatOptSig !== catSig) {
        const safeEsc = (s) => (typeof this.escapeLogHtml === "function" ? this.escapeLogHtml(s) : String(s || ""));
        catSel.innerHTML =
          `<option value="ALL">Tất cả danh mục</option>` +
          cats.map((c) => `<option value="${safeEsc(c)}">${safeEsc(c)}</option>`).join("");
        this._repInvCatOptSig = catSig;
      }
      catSel.value = prevCat === "ALL" || seen.has(prevCat) ? prevCat : "ALL";
    }
  },

  getReportsActiveFilterContext() {
    this.syncReportsFilterOptions();

    const liveOrders =
      typeof this.getValidOrdersUpToNow === "function"
        ? this.getValidOrdersUpToNow()
        : window.omsEngine && Array.isArray(window.omsEngine.orders)
        ? window.omsEngine.orders
        : [];
    const effInv =
      typeof this.getEffectiveInventoryAtNow === "function"
        ? this.getEffectiveInventoryAtNow()
        : window.omsEngine && Array.isArray(window.omsEngine.inventory)
        ? window.omsEngine.inventory
        : [];
    const allMonths =
      typeof this.getMonthlyHistoricalDataset === "function" ? this.getMonthlyHistoricalDataset() : {};

    const nowMs = Date.now();
    const nowDt = new Date(nowMs);
    const pad = (n) => String(n).padStart(2, "0");
    const todayVn = `${pad(nowDt.getDate())}/${pad(nowDt.getMonth() + 1)}/${nowDt.getFullYear()}`;
    const curQKey = `${nowDt.getFullYear()}-Q${Math.ceil((nowDt.getMonth() + 1) / 3)}`;

    const periodVal = String(document.getElementById("repPeriodFilter")?.value || "ALL").trim() || "ALL";
    const channelVal = String(document.getElementById("repChannelFilter")?.value || "ALL").trim().toUpperCase() || "ALL";

    let startMs = 0;
    let endMs = nowMs;
    let periodLabel = `Tất cả thời gian (đến ${todayVn})`;

    if (periodVal.startsWith("MONTH:")) {
      const mk = periodVal.slice(6);
      const mObj = allMonths[mk];
      if (mObj) {
        const lastDay = new Date(mObj.year, mObj.month, 0).getDate();
        startMs = new Date(mObj.year, mObj.month - 1, 1, 0, 0, 0, 0).getTime();
        endMs = Math.min(nowMs, new Date(mObj.year, mObj.month - 1, lastDay, 23, 59, 59, 999).getTime());
        periodLabel = mObj.label;
      }
    } else if (periodVal.startsWith("QUARTER:")) {
      const qk = periodVal.slice(8);
      const [yStr, qPart] = qk.split("-Q");
      const qY = Number(yStr) || nowDt.getFullYear();
      const qNum = Number(qPart) || 1;
      const startM = (qNum - 1) * 3 + 1;
      const endM = qNum * 3;
      const endLastDay = new Date(qY, endM, 0).getDate();
      startMs = new Date(qY, startM - 1, 1, 0, 0, 0, 0).getTime();
      endMs = Math.min(nowMs, new Date(qY, endM - 1, endLastDay, 23, 59, 59, 999).getTime());
      periodLabel =
        qk === curQKey
          ? `Quý ${qNum}/${qY} (Tháng ${pad(startM)} – ${todayVn})`
          : `Quý ${qNum}/${qY} (Tháng ${pad(startM)} – Tháng ${pad(endM)}/${qY})`;
    }

    const ordersByPeriod =
      periodVal === "ALL"
        ? liveOrders
        : liveOrders.filter((ord) => {
            const ts =
              typeof this.getOrderTimestampMs === "function" ? this.getOrderTimestampMs(ord) : Number(ord.timestampMs) || 0;
            return ts >= startMs && ts <= endMs;
          });

    const filteredOrders =
      channelVal === "ALL"
        ? ordersByPeriod
        : ordersByPeriod.filter((ord) => String(ord.channel || "").trim().toUpperCase() === channelVal);

    let validShipments =
      typeof this.getValidShipmentsUpToNow === "function" ? this.getValidShipmentsUpToNow(filteredOrders) : [];
    if (channelVal !== "ALL") {
      validShipments = validShipments.filter((s) => String((s && s.channel) || "").trim().toUpperCase() === channelVal);
    }

    const metaMap =
      typeof this.getRevenueChannelMetaMap === "function"
        ? this.getRevenueChannelMetaMap()
        : {
            SHOPEE: { key: "SHOPEE", name: "Shopee", color: "#1877FF" },
            TIKTOK: { key: "TIKTOK", name: "TikTok Shop", color: "#465AFF" },
            LAZADA: { key: "LAZADA", name: "Lazada", color: "#0284C7" },
            FACEBOOK: { key: "FACEBOOK", name: "Facebook", color: "#64748B" },
            POS: { key: "POS", name: "Cửa hàng POS", color: "#7C3AED" }
          };

    const allChannelKeys = ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"];
    const displayChannelKeys =
      channelVal !== "ALL" && allChannelKeys.includes(channelVal) ? [channelVal] : allChannelKeys;

    const channelRows = displayChannelKeys.map((chKey) => {
      const chOrders = filteredOrders.filter((o) => String(o.channel || "").trim().toUpperCase() === chKey);
      let allocated = 0;
      let waiting = 0;
      let cancelled = 0;
      let allocatedUnits = 0;
      let revenue = 0;

      chOrders.forEach((o) => {
        const cls = this.classifyReportOrder(o);
        if (cls.isAllocated) {
          allocated += 1;
          allocatedUnits += cls.qty;
          revenue += cls.revenue;
        } else if (cls.isCancelled) {
          cancelled += 1;
        } else {
          waiting += 1;
        }
      });

      const received = chOrders.length;
      const holdRate = received > 0 ? (allocated / received) * 100 : 0;
      const chShips = validShipments.filter((s) => String((s && s.channel) || "").trim().toUpperCase() === chKey);
      const deliveredShipments = chShips.filter((s) => s && s.status === "DELIVERED").length;
      const codTotal = chShips.reduce((sum, s) => sum + (Number(s && s.totalCod) || 0), 0);
      const meta = metaMap[chKey] || { key: chKey, name: chKey, color: "#1877FF" };

      return {
        key: chKey,
        name: meta.name,
        color: meta.color,
        received,
        allocated,
        waiting,
        cancelled,
        allocatedUnits,
        revenue,
        holdRate,
        shipments: chShips.length,
        deliveredShipments,
        codTotal
      };
    });

    const totals = channelRows.reduce(
      (acc, r) => {
        acc.received += r.received;
        acc.allocated += r.allocated;
        acc.waiting += r.waiting;
        acc.cancelled += r.cancelled;
        acc.allocatedUnits += r.allocatedUnits;
        acc.revenue += r.revenue;
        return acc;
      },
      {
        received: 0,
        allocated: 0,
        waiting: 0,
        cancelled: 0,
        allocatedUnits: 0,
        revenue: 0,
        holdRate: 0,
        shipments: validShipments.length,
        deliveredShipments: validShipments.filter((s) => s && s.status === "DELIVERED").length,
        codTotal: validShipments.reduce((sum, s) => sum + (Number(s && s.totalCod) || 0), 0)
      }
    );
    totals.holdRate = totals.received > 0 ? (totals.allocated / totals.received) * 100 : 0;

    const invTotals = effInv.reduce(
      (acc, item) => {
        const phys = Math.max(0, Number(item.effectivePhysicalStock ?? item.physicalStock) || 0);
        const resv = Math.max(0, Number(item.effectiveReservedStock ?? item.reservedStock) || 0);
        const avail =
          typeof this.getSkuAvailableStock === "function"
            ? this.getSkuAvailableStock(item)
            : Math.max(0, phys - resv);
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0) || 0;
        acc.skuCount += 1;
        acc.physicalStock += phys;
        acc.reservedStock += resv;
        acc.availableStock += avail;
        acc.stockValue += phys * unitPrice;
        if (avail === 0) acc.outOfStockCount += 1;
        return acc;
      },
      { skuCount: 0, physicalStock: 0, reservedStock: 0, availableStock: 0, stockValue: 0, outOfStockCount: 0 }
    );

    const channelLabel = channelVal === "ALL" ? "Tất cả 5 kênh" : (metaMap[channelVal] && metaMap[channelVal].name) || channelVal;

    return {
      periodVal,
      periodLabel,
      channelVal,
      channelLabel,
      startMs,
      endMs,
      orders: filteredOrders,
      shipments: validShipments,
      inventory: effInv,
      channelRows,
      totals,
      invTotals
    };
  },

  onReportsFilterChange() {
    this.renderReportsSummary();
  },

  onReportsInvFilterChange() {
    this.reportsInvPage = 1;
    this.renderReportsInventoryTable();
  },

  changeReportsInvPage(delta) {
    const nextPage = (Number(this.reportsInvPage) || 1) + Number(delta || 0);
    this.reportsInvPage = Math.max(1, nextPage);
    this.renderReportsInventoryTable();
  },

  ensureSingleReportsDomStructure() {
    if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") return;
    const reportSections = Array.from(
      document.querySelectorAll('section.oms-view-section[data-views="reports"]') || []
    );
    if (reportSections.length > 1) {
      reportSections.slice(1).forEach((dupSec) => {
        if (dupSec && dupSec.parentNode) dupSec.parentNode.removeChild(dupSec);
      });
    }
    const primarySec = reportSections[0];
    if (primarySec && typeof primarySec.querySelectorAll === "function") {
      const chartCards = Array.from(primarySec.querySelectorAll(".rep-chart-card") || []);
      if (chartCards.length > 1) {
        chartCards.slice(1).forEach((dupChart) => {
          if (dupChart && dupChart.parentNode) dupChart.parentNode.removeChild(dupChart);
        });
      }
      const cards = Array.from(primarySec.querySelectorAll(".rep-panel-card") || []);
      if (cards.length > 2) {
        cards.slice(2).forEach((dupCard) => {
          if (dupCard && dupCard.parentNode) dupCard.parentNode.removeChild(dupCard);
        });
      }
      const tables = Array.from(primarySec.querySelectorAll("table.odoms-flat-table") || []);
      if (tables.length > 2) {
        tables.slice(2).forEach((dupTbl) => {
          if (dupTbl && dupTbl.parentNode) dupTbl.parentNode.removeChild(dupTbl);
        });
      }
    }
  },

  renderReportsSummary() {
    this.ensureSingleReportsDomStructure();
    const tbody = document.getElementById("channelReportTableBody");
    const tfoot = document.getElementById("channelReportTableFoot");
    if (!tbody && !document.getElementById("repKpiTotalOrders")) return;

    const ctx = this.getReportsActiveFilterContext();
    this._lastReportsContext = ctx;

    // 1. Mốc giờ đồng bộ chuẩn trang Cài đặt (Cập nhật: HH:MM:SS DD.MM.YYYY)
    const tsEl = document.getElementById("repSyncTimestamp");
    if (tsEl) {
      const rawSyncTime = window.cloudSync && window.cloudSync.lastSyncTime ? String(window.cloudSync.lastSyncTime).trim() : "";
      let formattedTs =
        rawSyncTime && typeof this.formatSettingsSyncTimestamp === "function"
          ? this.formatSettingsSyncTimestamp(rawSyncTime)
          : "";
      if (!formattedTs || /chưa đồng bộ/i.test(formattedTs)) {
        formattedTs =
          typeof this.formatRevTimestampDisplay === "function"
            ? this.formatRevTimestampDisplay(this.dashboardOpenedAt || new Date())
            : "Cập nhật: Chưa đồng bộ";
      }
      tsEl.innerText = formattedTs;
      tsEl.title = formattedTs;
    }

    // 2. Dải 4 thẻ chỉ số tổng hợp
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };
    const fmtPct = (v) =>
      typeof this.formatRevPercentVi === "function" ? this.formatRevPercentVi(v) : Number(v || 0).toFixed(1).replace(".", ",");

    setTxt("repKpiTotalOrders", `${ctx.totals.received.toLocaleString("vi-VN")} đơn`);
    setTxt(
      "repKpiTotalOrdersSub",
      `${ctx.totals.allocated.toLocaleString("vi-VN")} đã giữ · Tỷ lệ ${fmtPct(ctx.totals.holdRate)}%`
    );

    setTxt("repKpiAllocatedRevenue", `${ctx.totals.revenue.toLocaleString("vi-VN")} VND`);
    setTxt(
      "repKpiAllocatedRevenueSub",
      `Trên ${ctx.totals.allocated.toLocaleString("vi-VN")} đơn · ${ctx.totals.allocatedUnits.toLocaleString("vi-VN")} SP`
    );

    setTxt("repKpiShipments", `${ctx.totals.shipments.toLocaleString("vi-VN")} vận đơn`);
    setTxt(
      "repKpiShipmentsSub",
      `${ctx.totals.deliveredShipments.toLocaleString("vi-VN")} đã giao · Thu hộ: ${ctx.totals.codTotal.toLocaleString("vi-VN")} VND`
    );

    setTxt("repKpiAvailableStock", `${ctx.invTotals.availableStock.toLocaleString("vi-VN")} SP`);
    setTxt(
      "repKpiAvailableStockSub",
      `${ctx.invTotals.skuCount.toLocaleString("vi-VN")} mặt hàng · ${ctx.invTotals.outOfStockCount.toLocaleString("vi-VN")} hết hàng`
    );

    // 3. Bảng 1 — Đối chiếu hiệu suất theo 5 kênh (chỉ 1 cột màu nhấn duy nhất: Tỷ lệ giữ hàng)
    const buildRateBadge = (receivedCount, rateNum) => {
      if (receivedCount <= 0) {
        return `<span class="odoms-flat-badge is-neutral">—</span>`;
      }
      const tone = rateNum >= 90 ? "is-success" : rateNum >= 80 ? "is-info" : "is-warning";
      return `<span class="odoms-flat-badge ${tone}">${fmtPct(rateNum)}%</span>`;
    };

    if (tbody) {
      tbody.textContent = "";
      tbody.innerHTML = ctx.channelRows
        .map(
          (row) => `
          <tr>
            <td class="col-rep-ch">
              <span class="rep-ch-cell">
                <span class="rep-ch-vbar" style="background:${row.color};" aria-hidden="true"></span>
                <span class="rep-ch-name">${row.name}</span>
              </span>
            </td>
            <td class="col-rep-rec"><strong class="rep-num-strong">${row.received.toLocaleString("vi-VN")} đơn</strong></td>
            <td class="col-rep-alloc">${row.allocated.toLocaleString("vi-VN")} đơn</td>
            <td class="col-rep-wait">${row.waiting.toLocaleString("vi-VN")} đơn</td>
            <td class="col-rep-cancel">${row.cancelled.toLocaleString("vi-VN")} đơn</td>
            <td class="col-rep-rev"><span class="rep-money-val">${row.revenue.toLocaleString("vi-VN")} VND</span></td>
            <td class="col-rep-rate">${buildRateBadge(row.received, row.holdRate)}</td>
          </tr>
        `
        )
        .join("");
    }

    if (tfoot) {
      tfoot.textContent = "";
      tfoot.innerHTML = `
        <tr>
          <td class="col-rep-ch">TỔNG CỘNG</td>
          <td class="col-rep-rec">${ctx.totals.received.toLocaleString("vi-VN")} đơn</td>
          <td class="col-rep-alloc">${ctx.totals.allocated.toLocaleString("vi-VN")} đơn</td>
          <td class="col-rep-wait">${ctx.totals.waiting.toLocaleString("vi-VN")} đơn</td>
          <td class="col-rep-cancel">${ctx.totals.cancelled.toLocaleString("vi-VN")} đơn</td>
          <td class="col-rep-rev">${ctx.totals.revenue.toLocaleString("vi-VN")} VND</td>
          <td class="col-rep-rate">${buildRateBadge(ctx.totals.received, ctx.totals.holdRate)}</td>
        </tr>
      `;
    }

    // 3.5. Biểu đồ đối chiếu gọn nhẹ phẳng 0px (thuần SVG)
    this.renderReportsCompareCharts(ctx);

    // 4. Bảng 2 — Tồn kho & Giá trị (phân trang 10 dòng / trang)
    this.renderReportsInventoryTable(ctx.inventory);
  },

  renderReportsCompareCharts(precomputedCtx) {
    const chSvg = document.getElementById("repChannelCompareSvg");
    const catSvg = document.getElementById("repCategoryCompareSvg");
    if (!chSvg && !catSvg) return;

    const ctx = precomputedCtx || this._lastReportsContext || this.getReportsActiveFilterContext();
    const safeEsc = (s) => (typeof this.escapeLogHtml === "function" ? this.escapeLogHtml(s) : String(s || ""));
    const fmtPct = (v) =>
      typeof this.formatRevPercentVi === "function" ? this.formatRevPercentVi(v) : Number(v || 0).toFixed(1).replace(".", ",");

    const renderHorizontalBars = (svgEl, rows, emptyMsg) => {
      if (!svgEl) return;
      if (!rows || rows.length === 0) {
        svgEl.innerHTML = `<text x="230" y="92" text-anchor="middle" class="rep-svg-empty">${safeEsc(emptyMsg)}</text>`;
        return;
      }

      const maxVal = Math.max(...rows.map((r) => Math.max(r.primaryVal, r.secondaryVal)), 1);
      const labelX = 114;
      const barX = 122;
      const barMaxW = 216;
      const valX = 454;
      const rowH = 32;
      const topPad = 10;
      const totalH = Math.max(88, topPad * 2 + rows.length * rowH);
      svgEl.setAttribute("viewBox", `0 0 460 ${totalH}`);

      svgEl.innerHTML = rows
        .map((r, idx) => {
          const y0 = topPad + idx * rowH;
          const w1 = r.primaryVal > 0 ? Math.max(4, Math.round((r.primaryVal / maxVal) * barMaxW)) : 0;
          const w2 = r.secondaryVal > 0 ? Math.max(4, Math.round((r.secondaryVal / maxVal) * barMaxW)) : 0;
          const safeLbl = safeEsc(r.label);
          const safeStat = safeEsc(r.statText);
          const safeTip = safeEsc(r.tooltip);

          return `
            <g class="rep-svg-row">
              <title>${safeTip}</title>
              <text x="${labelX}" y="${y0 + 18}" text-anchor="end" class="rep-svg-label">${safeLbl}</text>
              <rect x="${barX}" y="${y0 + 5}" width="${barMaxW}" height="7" class="rep-svg-track" />
              <rect x="${barX}" y="${y0 + 15}" width="${barMaxW}" height="7" class="rep-svg-track" />
              ${w1 > 0 ? `<rect x="${barX}" y="${y0 + 5}" width="${w1}" height="7" class="rep-svg-bar-primary" />` : ""}
              ${w2 > 0 ? `<rect x="${barX}" y="${y0 + 15}" width="${w2}" height="7" class="rep-svg-bar-emerald" />` : ""}
              <text x="${valX}" y="${y0 + 18}" text-anchor="end" class="rep-svg-val">${safeStat}</text>
            </g>
          `;
        })
        .join("");
    };

    // 1. Trái: Đơn tiếp nhận & Đã giữ theo 5 kênh
    if (chSvg) {
      const chRows = (ctx.channelRows || []).map((r) => ({
        label: r.name,
        primaryVal: r.received,
        secondaryVal: r.allocated,
        statText: r.received > 0 ? `${r.allocated}/${r.received} · ${fmtPct(r.holdRate)}%` : "0/0 · —",
        tooltip: `${r.name}: Tiếp nhận ${r.received} đơn · Đã giữ ${r.allocated} đơn (${fmtPct(r.holdRate)}%)`
      }));
      renderHorizontalBars(chSvg, chRows, "Chưa có dữ liệu đối chiếu kênh");
    }

    // 2. Phải: Tồn kho & Bán được theo danh mục
    if (catSvg) {
      const catMap = new Map();
      (ctx.inventory || []).forEach((item) => {
        if (!item) return;
        const catName = String(item.category || "Thời trang").trim();
        const phys = Math.max(0, Number(item.effectivePhysicalStock ?? item.physicalStock) || 0);
        const resv = Math.max(0, Number(item.effectiveReservedStock ?? item.reservedStock) || 0);
        const avail =
          typeof this.getSkuAvailableStock === "function"
            ? this.getSkuAvailableStock(item)
            : Math.max(0, phys - resv);
        if (!catMap.has(catName)) {
          catMap.set(catName, { label: catName, phys: 0, avail: 0 });
        }
        const entry = catMap.get(catName);
        entry.phys += phys;
        entry.avail += avail;
      });
      const catRows = Array.from(catMap.values()).map((c) => {
        const shortCat = c.label.replace(/^Phụ kiện thời trang$/i, "Phụ kiện");
        const pct = c.phys > 0 ? (c.avail / c.phys) * 100 : 0;
        return {
          label: shortCat,
          primaryVal: c.phys,
          secondaryVal: c.avail,
          statText: `${c.avail}/${c.phys} · ${fmtPct(pct)}%`,
          tooltip: `${c.label}: Tồn kho ${c.phys} SP · Bán được ${c.avail} SP (${fmtPct(pct)}%)`
        };
      });
      renderHorizontalBars(catSvg, catRows, "Chưa có dữ liệu tồn kho danh mục");
    }
  },

  renderReportsInventoryTable(inventoryInput) {
    const tbody = document.getElementById("reportsInventoryTableBody");
    if (!tbody) return;

    const effInv = Array.isArray(inventoryInput)
      ? inventoryInput
      : typeof this.getEffectiveInventoryAtNow === "function"
      ? this.getEffectiveInventoryAtNow()
      : window.omsEngine && Array.isArray(window.omsEngine.inventory)
      ? window.omsEngine.inventory
      : [];

    const catVal = String(document.getElementById("repInvCategoryFilter")?.value || "ALL").trim() || "ALL";
    const qVal = String(document.getElementById("repInvSearchInput")?.value || "").trim().toLowerCase();

    const filteredInv = effInv.filter((item) => {
      if (!item) return false;
      const itemCat = String(item.category || "").trim();
      if (catVal !== "ALL" && itemCat !== catVal) return false;
      if (qVal) {
        const hay = `${item.sku || ""} ${item.name || ""} ${itemCat}`.toLowerCase();
        if (!hay.includes(qVal)) return false;
      }
      return true;
    });

    // Tổng tóm tắt cho tập mặt hàng đang hiển thị ở Bảng 2
    let sumPhys = 0;
    let sumAvail = 0;
    let sumValue = 0;
    filteredInv.forEach((item) => {
      const phys = Math.max(0, Number(item.effectivePhysicalStock ?? item.physicalStock) || 0);
      const resv = Math.max(0, Number(item.effectiveReservedStock ?? item.reservedStock) || 0);
      const avail =
        typeof this.getSkuAvailableStock === "function"
          ? this.getSkuAvailableStock(item)
          : Math.max(0, phys - resv);
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0) || 0;
      sumPhys += phys;
      sumAvail += avail;
      sumValue += phys * unitPrice;
    });

    const summaryBarEl = document.getElementById("repInvSummaryBar");
    if (summaryBarEl) {
      summaryBarEl.innerHTML =
        `<strong>${filteredInv.length.toLocaleString("vi-VN")}</strong> mặt hàng · ` +
        `Tồn: <strong>${sumPhys.toLocaleString("vi-VN")} SP</strong> · ` +
        `Bán được: <strong>${sumAvail.toLocaleString("vi-VN")} SP</strong> · ` +
        `Giá trị: <strong>${sumValue.toLocaleString("vi-VN")} VND</strong>`;
    }

    // Phân trang chuẩn 10 dòng / trang
    const pageSize = Math.max(1, Number(this.reportsInvPageSize) || 10);
    const totalCount = filteredInv.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (!Number.isFinite(this.reportsInvPage) || this.reportsInvPage < 1) {
      this.reportsInvPage = 1;
    }
    if (this.reportsInvPage > totalPages) {
      this.reportsInvPage = totalPages;
    }

    const startIdx = (this.reportsInvPage - 1) * pageSize;
    const pageItems = filteredInv.slice(startIdx, startIdx + pageSize);

    const pagInfoEl = document.getElementById("repInvPaginationInfo");
    const pagCurEl = document.getElementById("repInvPaginationCurrent");
    const prevBtn = document.getElementById("btnRepInvPrevPage");
    const nextBtn = document.getElementById("btnRepInvNextPage");
    const showFrom = totalCount === 0 ? 0 : startIdx + 1;
    const showTo = totalCount === 0 ? 0 : Math.min(totalCount, startIdx + pageItems.length);

    if (pagInfoEl) {
      pagInfoEl.innerText =
        totalCount === 0
          ? "Hiển thị 0 / tổng 0 mặt hàng"
          : `Hiển thị ${showFrom}–${showTo} / tổng ${totalCount} mặt hàng`;
    }
    if (pagCurEl) {
      pagCurEl.innerText = `Trang ${this.reportsInvPage} / ${totalPages}`;
    }
    if (prevBtn) {
      prevBtn.disabled = totalCount === 0 || this.reportsInvPage <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = totalCount === 0 || this.reportsInvPage >= totalPages;
    }

    if (pageItems.length === 0) {
      tbody.textContent = "";
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="7" class="odoms-empty-cell">Không tìm thấy mặt hàng nào phù hợp bộ lọc hiện tại.</td>
        </tr>
      `;
      return;
    }

    const safeEsc = (s) => (typeof this.escapeLogHtml === "function" ? this.escapeLogHtml(s) : String(s || ""));

    tbody.textContent = "";
    tbody.innerHTML = pageItems
      .map((item) => {
        const phys = Math.max(0, Number(item.effectivePhysicalStock ?? item.physicalStock) || 0);
        const resv = Math.max(0, Number(item.effectiveReservedStock ?? item.reservedStock) || 0);
        const avail =
          typeof this.getSkuAvailableStock === "function"
            ? this.getSkuAvailableStock(item)
            : Math.max(0, phys - resv);
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0) || 0;
        const stockVal = phys * unitPrice;
        const batchCount = Array.isArray(item.batches) ? item.batches.length : 0;

        const safeName = safeEsc(item.name || item.sku || "");
        const safeSku = safeEsc(item.sku || "");
        const safeCat = safeEsc(item.category || "Thời trang");

        let statusBadge = `<span class="odoms-flat-badge is-success">Ổn định</span>`;
        if (avail === 0) {
          statusBadge = `<span class="odoms-flat-badge is-error">Hết hàng</span>`;
        } else if (avail <= 10) {
          statusBadge = `<span class="odoms-flat-badge is-warning">Sắp hết</span>`;
        }

        return `
          <tr>
            <td class="col-repinv-prod">
              <div class="rep-inv-prod-name" title="${safeName}">${safeName}</div>
              <div class="rep-inv-prod-meta">
                <span class="rep-inv-sku">${safeSku}</span>
                <span class="rep-inv-sep">·</span>
                <span>${safeCat}</span>
              </div>
            </td>
            <td class="col-repinv-batches">${batchCount} lô</td>
            <td class="col-repinv-phys">${phys.toLocaleString("vi-VN")} SP</td>
            <td class="col-repinv-resv">${resv.toLocaleString("vi-VN")} SP</td>
            <td class="col-repinv-avail"><strong class="rep-num-strong">${avail.toLocaleString("vi-VN")} SP</strong></td>
            <td class="col-repinv-val"><span class="rep-money-val">${stockVal.toLocaleString("vi-VN")} VND</span></td>
            <td class="col-repinv-status">${statusBadge}</td>
          </tr>
        `;
      })
      .join("");
  },

  renderLogs() {
    this.renderUnifiedLogs();
  },

  openOrderAuditModal(orderId) {
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;

    const modal = document.getElementById("orderAuditModal");
    const content = document.getElementById("orderAuditModalBody");
    if (!modal || !content) return;

    const stepsHtml = (ord.auditSteps || [])
      .map((st) => {
        const stCode = String(st.status || "OK").toUpperCase();
        const stepToneCls =
          stCode === "ERROR" || stCode === "CANCELLED"
            ? "is-error"
            : stCode === "WARN"
            ? "is-warning"
            : "is-ok";
        return `
        <div class="audit-step odoms-audit-step ${stepToneCls}">
          <div class="odoms-audit-step-title">
            ${this.escapeLogHtml(this.normalizeLegacyLogText(st.step))}
          </div>
          <div class="odoms-audit-step-detail">
            ${this.escapeLogHtml(this.normalizeLegacyLogText(st.detail))}
          </div>
        </div>
      `;
      })
      .join("");

    const channelDisplay =
      (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[ord.channel] && window.CHANNELS_CONFIG[ord.channel].shortName) ||
      ord.channel;
    const formattedOrderTime = this.formatLogDisplayTimestamp(ord.orderTime, ord.timestampMs);
    const totalAmount = (Number(ord.quantity) || 0) * (Number(ord.unitPrice) || 0);
    const resolvedCarrier = this.resolveOrderCarrier(ord);
    const matchedSh = (window.omsEngine.shipments || []).find(
      (s) => s && String(s.orderId || "").trim() === String(ord.orderId || "").trim()
    );
    const trackingCode = String(ord.trackingCode || (matchedSh && matchedSh.trackingCode) || "").trim() || "Chưa cấp mã vận đơn";
    const sourceDisplay = ord.sourceMethod === "WEBHOOK_API" ? "Tiếp nhận trực tiếp" : "Nhập từ Tệp Excel";
    const priorityDisplay = ord.fifoRank ? `Ưu tiên #${ord.fifoRank}` : "Không xếp hạng";

    const pmRaw = ord.paymentMethod || "COD (Thanh toán khi nhận hàng)";
    const isCodOrder =
      pmRaw.toUpperCase().includes("COD") ||
      pmRaw.toLowerCase().includes("thu hộ") ||
      pmRaw.toLowerCase().includes("khi nhận hàng");
    const codNote = isCodOrder
      ? `Thu hộ COD: ${totalAmount.toLocaleString("vi-VN")} VND`
      : "Đã thanh toán (COD: 0 VND)";

    const allocatedBatchesText =
      Array.isArray(ord.allocatedBatches) && ord.allocatedBatches.length > 0
        ? ord.allocatedBatches.map((b) => `${b.batchCode} (${b.takenQty} SP)`).join(", ")
        : "Chưa phân bổ lô";
    const stockCompareText = ord.stockSnapshot
      ? `Khả dụng: ${ord.stockSnapshot.before} → ${ord.stockSnapshot.after} SP`
      : ord.platformStatus === "CANCELLED" || ord.status === "CANCELLED"
      ? "Không giữ hàng (Đơn đã hủy)"
      : "Chưa đối chiếu tồn kho";

    content.innerHTML = `
      <div class="ulog-overview-grid order-audit-info-grid">
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Mã đơn hàng &amp; Kênh bán</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${this.escapeLogHtml(ord.orderId)}</strong>
            <span class="ulog-meta-sep">·</span>
            <span>${this.escapeLogHtml(channelDisplay)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Thời gian đặt hàng</span>
          <span class="ulog-overview-value ulog-tabular">${this.escapeLogHtml(formattedOrderTime)}</span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Thứ tự ưu tiên &amp; Hình thức nhận đơn</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${this.escapeLogHtml(priorityDisplay)}</strong>
            <span class="ulog-meta-sep">·</span>
            <span>${this.escapeLogHtml(sourceDisplay)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Đơn vị vận chuyển &amp; Mã vận đơn</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${this.escapeLogHtml(resolvedCarrier)}</strong>
            <span class="ulog-meta-sep">·</span>
            <span>${this.escapeLogHtml(trackingCode)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Khách hàng nhận</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${this.escapeLogHtml(ord.customerName)}</strong>
            <span class="ulog-meta-sep">·</span>
            <span>${this.escapeLogHtml(ord.customerPhone)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Sản phẩm đặt mua</span>
          <span class="ulog-overview-value">
            <code class="odoms-username-code">${this.escapeLogHtml(ord.sku)}</code>
            <span>${this.escapeLogHtml(ord.productName)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Số lượng &amp; Thành tiền</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${ord.quantity} SP</strong> × ${Number(ord.unitPrice || 0).toLocaleString("vi-VN")} VND = <strong>${totalAmount.toLocaleString("vi-VN")} VND</strong>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Phương thức thanh toán</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${this.escapeLogHtml(pmRaw)}</strong>
            <span class="ulog-meta-sep">·</span>
            <span>${this.escapeLogHtml(codNote)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Đối chiếu tồn kho &amp; Lô phân bổ</span>
          <span class="ulog-overview-value ulog-tabular">
            <strong>${this.escapeLogHtml(stockCompareText)}</strong>
            <span class="ulog-meta-sep">·</span>
            <span>${this.escapeLogHtml(allocatedBatchesText)}</span>
          </span>
        </div>
        <div class="ulog-overview-item">
          <span class="ulog-overview-label">Địa chỉ giao hàng</span>
          <span class="ulog-overview-value">${this.escapeLogHtml(ord.shippingAddress)}</span>
        </div>
      </div>

      <div class="odoms-audit-section">
        <div class="ulog-section-title">Lịch sử xử lý đơn hàng (4 bước đối chiếu)</div>
        <div class="audit-timeline odoms-audit-timeline">
          ${stepsHtml}
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  closeModal() {
    const modal = document.getElementById("orderAuditModal");
    if (modal) modal.classList.remove("open");
  },

  // ============================================================================
  // HỘP THOẠI QUÉT MÃ QR TRỰC TIẾP BẰNG MÁY ẢNH / ẢNH TẢI LÊN / ĐẦU ĐỌC NHANH
  // ============================================================================
  openQrCameraModal() {
    const modal = document.getElementById("qrCameraScannerModal");
    if (!modal) return;

    this.qrScannerState.isOpen = true;
    this.qrScannerState.isPaused = false;
    this.qrScannerState.lastDecodedValue = "";
    this.qrScannerState.lastDecodedAt = 0;

    const inputEl = document.getElementById("qrManualInput");
    if (inputEl) inputEl.value = "";
    const resultEl = document.getElementById("qrScanResultBox");
    if (resultEl) {
      resultEl.innerHTML = `<div class="qr-scan-empty-hint">Đưa mã QR vào khung ngắm máy ảnh, chọn ảnh từ thiết bị hoặc dùng đầu đọc mã vạch để đối soát tức thời.</div>`;
    }

    this.updateQrPauseButtonIcon();
    modal.classList.add("open");
    this.startQrCameraStream();
  },

  stopQrCameraStream() {
    const st = this.qrScannerState;
    if (st.rafId && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(st.rafId);
    }
    st.rafId = null;
    st.detectInFlight = false;

    if (st.stream && typeof st.stream.getTracks === "function") {
      st.stream.getTracks().forEach((track) => {
        try {
          if (track && typeof track.stop === "function") track.stop();
        } catch (e) {}
      });
    }
    st.stream = null;

    const videoEl = document.getElementById("qrCameraVideo");
    if (videoEl) {
      try {
        if (typeof videoEl.pause === "function") videoEl.pause();
      } catch (e) {}
      videoEl.srcObject = null;
    }

    const reticleEl = document.getElementById("qrCameraReticle");
    if (reticleEl) reticleEl.classList.add("hidden");
  },

  closeQrCameraModal() {
    this.qrScannerState.isOpen = false;
    this.qrScannerState.isPaused = false;
    this.stopQrCameraStream();
    const modal = document.getElementById("qrCameraScannerModal");
    if (modal) modal.classList.remove("open");
  },

  updateQrCameraStatus(statusText, tone = "idle", overlayMsg = "") {
    const textEl = document.getElementById("qrCameraStatusText");
    const dotEl = document.getElementById("qrCameraStatusDot");
    const overlayEl = document.getElementById("qrCameraOverlayMsg");

    if (textEl) textEl.innerText = statusText;
    if (dotEl) {
      dotEl.classList.remove("is-live", "is-warn", "is-error");
      if (tone === "live") dotEl.classList.add("is-live");
      else if (tone === "warn") dotEl.classList.add("is-warn");
      else if (tone === "error") dotEl.classList.add("is-error");
    }
    if (overlayEl) {
      if (overlayMsg) {
        overlayEl.innerText = overlayMsg;
        overlayEl.classList.remove("hidden");
      } else {
        overlayEl.classList.add("hidden");
      }
    }
  },

  updateQrPauseButtonIcon() {
    const pauseBtn = document.getElementById("btnQrTogglePause");
    if (!pauseBtn) return;
    const isPaused = Boolean(this.qrScannerState.isPaused);
    pauseBtn.title = isPaused ? "Tiếp tục quét bằng máy ảnh" : "Tạm dừng quét bằng máy ảnh";
    pauseBtn.setAttribute("aria-label", pauseBtn.title);
    pauseBtn.innerHTML = isPaused
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  },

  async startQrCameraStream(preferredDeviceId) {
    this.stopQrCameraStream();
    const pauseBtn = document.getElementById("btnQrTogglePause");
    const switchBtn = document.getElementById("btnQrSwitchCamera");
    const reticleEl = document.getElementById("qrCameraReticle");

    if (pauseBtn) pauseBtn.disabled = true;

    const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : null;
    if (!mediaDevices || typeof mediaDevices.getUserMedia !== "function") {
      this.updateQrCameraStatus(
        "Chưa mở được máy ảnh — dùng ô tra cứu hoặc chọn ảnh",
        "warn",
        "Thiết bị hoặc trình duyệt này chưa hỗ trợ mở máy ảnh trực tiếp. Bạn có thể chọn ảnh chứa mã QR hoặc nhập/quét bằng đầu đọc mã vạch bên dưới."
      );
      const manualEl = document.getElementById("qrManualInput");
      if (manualEl && typeof manualEl.focus === "function") manualEl.focus();
      return;
    }

    this.updateQrCameraStatus("Đang khởi động máy ảnh...", "idle", "Đang kết nối máy ảnh thiết bị...");

    const videoConstraint = preferredDeviceId
      ? { deviceId: { exact: preferredDeviceId } }
      : { facingMode: { ideal: this.qrScannerState.facingMode || "environment" } };

    let stream = null;
    try {
      stream = await mediaDevices.getUserMedia({ video: videoConstraint, audio: false });
    } catch (firstErr) {
      if (firstErr && (firstErr.name === "OverconstrainedError" || firstErr.name === "ConstraintNotSatisfiedError")) {
        try {
          stream = await mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (fallbackErr) {
          stream = null;
          firstErr = fallbackErr;
        }
      }
      if (!stream) {
        const errName = firstErr && firstErr.name ? firstErr.name : "";
        let friendlyMsg =
          "Không thể khởi động máy ảnh lúc này. Bạn có thể chọn ảnh chứa mã QR hoặc nhập mã tra cứu bên dưới.";
        if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
          friendlyMsg =
            "Bạn chưa cấp quyền sử dụng máy ảnh cho trình duyệt. Vui lòng bật quyền máy ảnh hoặc chọn ảnh chứa mã QR / nhập mã bên dưới.";
        } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
          friendlyMsg =
            "Không tìm thấy máy ảnh trên thiết bị này. Bạn có thể chọn ảnh chứa mã QR hoặc nhập/quét bằng đầu đọc mã vạch bên dưới.";
        } else if (errName === "NotReadableError" || errName === "TrackStartError") {
          friendlyMsg =
            "Máy ảnh đang được ứng dụng khác sử dụng. Vui lòng đóng ứng dụng đó rồi thử lại, hoặc chọn ảnh / nhập mã bên dưới.";
        }
        this.updateQrCameraStatus("Không mở được máy ảnh — dùng nhập nhanh hoặc chọn ảnh", "error", friendlyMsg);
        const manualEl = document.getElementById("qrManualInput");
        if (manualEl && typeof manualEl.focus === "function") manualEl.focus();
        return;
      }
    }

    // Bảo vệ trường hợp người dùng đã đóng hộp thoại trong lúc chờ cấp quyền máy ảnh
    if (!this.qrScannerState.isOpen) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch (e) {}
      });
      return;
    }

    this.qrScannerState.stream = stream;
    this.qrScannerState.isPaused = false;

    const videoEl = document.getElementById("qrCameraVideo");
    if (videoEl) {
      videoEl.srcObject = stream;
      try {
        await videoEl.play();
      } catch (e) {}
    }

    if (pauseBtn) pauseBtn.disabled = false;
    this.updateQrPauseButtonIcon();

    if (typeof mediaDevices.enumerateDevices === "function") {
      try {
        const devices = await mediaDevices.enumerateDevices();
        const videos = devices.filter((d) => d.kind === "videoinput");
        this.qrScannerState.videoDevices = videos;
        if (switchBtn) {
          switchBtn.classList.toggle("hidden", videos.length <= 1);
        }
      } catch (e) {}
    }

    let detector = null;
    if (typeof window !== "undefined" && typeof window.BarcodeDetector === "function") {
      try {
        detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch (e) {
        detector = null;
      }
    }
    this.qrScannerState.detector = detector;

    if (detector) {
      if (reticleEl) reticleEl.classList.remove("hidden");
      this.updateQrCameraStatus("Đang quét mã QR bằng máy ảnh...", "live", "");
      this.scanQrCameraFrame();
    } else {
      if (reticleEl) reticleEl.classList.add("hidden");
      this.updateQrCameraStatus(
        "Máy ảnh đang bật — trình duyệt chưa hỗ trợ tự đọc mã QR",
        "warn",
        "Trình duyệt hiện tại chưa hỗ trợ tự nhận diện mã QR trực tiếp từ luồng máy ảnh. Bạn có thể chọn ảnh chứa mã QR hoặc nhập/quét nhanh bằng đầu đọc mã vạch bên dưới."
      );
      const manualEl = document.getElementById("qrManualInput");
      if (manualEl && typeof manualEl.focus === "function") manualEl.focus();
    }
  },

  scanQrCameraFrame() {
    const st = this.qrScannerState;
    if (!st.isOpen || st.isPaused || !st.stream || !st.detector) return;

    const videoEl = document.getElementById("qrCameraVideo");
    if (videoEl && videoEl.readyState >= 2 && !st.detectInFlight) {
      st.detectInFlight = true;
      st.detector
        .detect(videoEl)
        .then((barcodes) => {
          st.detectInFlight = false;
          if (!st.isOpen || st.isPaused) return;
          if (Array.isArray(barcodes) && barcodes.length > 0) {
            const rawVal = String(barcodes[0].rawValue || "").trim();
            const nowMs = Date.now();
            if (rawVal && (rawVal !== st.lastDecodedValue || nowMs - st.lastDecodedAt > 1800)) {
              st.lastDecodedValue = rawVal;
              st.lastDecodedAt = nowMs;
              const manualEl = document.getElementById("qrManualInput");
              if (manualEl) manualEl.value = rawVal;
              this.processDecodedQrText(rawVal, "máy ảnh");
            }
          }
        })
        .catch(() => {
          st.detectInFlight = false;
        });
    }

    if (typeof requestAnimationFrame === "function") {
      st.rafId = requestAnimationFrame(() => this.scanQrCameraFrame());
    }
  },

  toggleQrCameraPause() {
    const st = this.qrScannerState;
    if (!st.isOpen || !st.stream) return;

    const videoEl = document.getElementById("qrCameraVideo");
    const reticleEl = document.getElementById("qrCameraReticle");

    st.isPaused = !st.isPaused;
    this.updateQrPauseButtonIcon();

    if (st.isPaused) {
      if (st.rafId && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(st.rafId);
      }
      st.rafId = null;
      if (videoEl && typeof videoEl.pause === "function") videoEl.pause();
      if (reticleEl) reticleEl.classList.add("hidden");
      this.updateQrCameraStatus("Đã tạm dừng quét máy ảnh", "warn", "Đã tạm dừng máy ảnh. Nhấn nút tiếp tục để quét lại.");
    } else {
      if (videoEl && typeof videoEl.play === "function") {
        Promise.resolve(videoEl.play()).catch(() => {});
      }
      if (st.detector) {
        if (reticleEl) reticleEl.classList.remove("hidden");
        this.updateQrCameraStatus("Đang quét mã QR bằng máy ảnh...", "live", "");
        this.scanQrCameraFrame();
      } else {
        this.updateQrCameraStatus("Máy ảnh đang bật — trình duyệt chưa hỗ trợ tự đọc mã QR", "warn", "");
      }
    }
  },

  switchQrCameraFacing() {
    const st = this.qrScannerState;
    if (!st.isOpen) return;
    if (Array.isArray(st.videoDevices) && st.videoDevices.length > 1) {
      st.activeDeviceIndex = (st.activeDeviceIndex + 1) % st.videoDevices.length;
      const nextDev = st.videoDevices[st.activeDeviceIndex];
      this.startQrCameraStream(nextDev && nextDev.deviceId ? nextDev.deviceId : undefined);
    } else {
      st.facingMode = st.facingMode === "environment" ? "user" : "environment";
      this.startQrCameraStream();
    }
  },

  async handleQrImageFileSelected(inputEl) {
    const file = inputEl && inputEl.files && inputEl.files[0] ? inputEl.files[0] : null;
    if (inputEl) inputEl.value = "";
    if (!file) return;

    const resultEl = document.getElementById("qrScanResultBox");
    if (typeof window === "undefined" || typeof window.BarcodeDetector !== "function" || typeof createImageBitmap !== "function") {
      if (resultEl) {
        resultEl.innerHTML = `<div class="qr-scan-not-found">Trình duyệt hiện tại chưa hỗ trợ đọc mã QR tự động từ tệp ảnh. Bạn vui lòng nhập hoặc quét mã vào ô tra cứu phía trên.</div>`;
      }
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const barcodes = await detector.detect(bitmap);
      if (bitmap && typeof bitmap.close === "function") bitmap.close();

      if (Array.isArray(barcodes) && barcodes.length > 0 && barcodes[0].rawValue) {
        const rawVal = String(barcodes[0].rawValue).trim();
        const manualEl = document.getElementById("qrManualInput");
        if (manualEl) manualEl.value = rawVal;
        this.processDecodedQrText(rawVal, "ảnh tải lên");
      } else if (resultEl) {
        resultEl.innerHTML = `<div class="qr-scan-not-found">Không nhận diện được mã QR rõ nét trong ảnh vừa chọn. Vui lòng thử ảnh sắc nét hơn hoặc nhập mã trực tiếp.</div>`;
      }
    } catch (err) {
      if (resultEl) {
        resultEl.innerHTML = `<div class="qr-scan-not-found">Không thể đọc tệp ảnh vừa chọn. Vui lòng kiểm tra định dạng ảnh hoặc nhập mã trực tiếp.</div>`;
      }
    }
  },

  lookupQrManualInput() {
    const inputEl = document.getElementById("qrManualInput");
    const rawText = inputEl ? String(inputEl.value || "").trim() : "";
    if (!rawText) {
      const resultEl = document.getElementById("qrScanResultBox");
      if (resultEl) {
        resultEl.innerHTML = `<div class="qr-scan-not-found">Vui lòng nhập hoặc quét mã đơn hàng, mã vận đơn, mã lô hoặc mã sản phẩm để tra cứu.</div>`;
      }
      return;
    }
    this.processDecodedQrText(rawText, "nhập nhanh");
  },

  parseQrPayloadTokens(rawText) {
    const raw = String(rawText || "").trim();
    const tokens = { raw, trackingCode: "", orderId: "", sku: "", batchCode: "" };
    if (raw.includes("|")) {
      raw.split("|").forEach((part) => {
        const idx = part.indexOf(":");
        if (idx <= 0) return;
        const key = part.slice(0, idx).trim().toUpperCase();
        const val = part.slice(idx + 1).trim();
        if (key === "WB") tokens.trackingCode = val;
        else if (key === "ORD") tokens.orderId = val;
        else if (key === "SKU") tokens.sku = val;
        else if (key === "LO" || key === "LOT") tokens.batchCode = val;
      });
    }
    return tokens;
  },

  processDecodedQrText(rawText, sourceLabel = "quét mã") {
    const resultEl = document.getElementById("qrScanResultBox");
    if (!resultEl || !window.omsEngine) return;

    const tokens = this.parseQrPayloadTokens(rawText);
    const qLower = tokens.raw.toLowerCase();
    const orders = Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const shipments = Array.isArray(window.omsEngine.shipments) ? window.omsEngine.shipments : [];
    const waybills = Array.isArray(this.waybillHistory) ? this.waybillHistory : [];
    const inventory = Array.isArray(window.omsEngine.inventory) ? window.omsEngine.inventory : [];

    // 1. Tra cứu theo Vận đơn (ODOMS|WB:...|ORD:... hoặc mã vận đơn trực tiếp)
    let matchedShipment = null;
    if (tokens.trackingCode) {
      const wbLower = tokens.trackingCode.toLowerCase();
      matchedShipment =
        shipments.find((s) => String(s.trackingCode || "").toLowerCase() === wbLower) ||
        waybills.find((w) => String(w.trackingCode || "").toLowerCase() === wbLower) ||
        null;
    }
    if (!matchedShipment) {
      matchedShipment =
        shipments.find((s) => String(s.trackingCode || "").toLowerCase() === qLower) ||
        waybills.find((w) => String(w.trackingCode || "").toLowerCase() === qLower) ||
        shipments.find((s) => String(s.trackingCode || "").toLowerCase().includes(qLower)) ||
        null;
    }

    // 2. Tra cứu Đơn hàng liên kết hoặc theo mã đơn
    let matchedOrder = null;
    if (tokens.orderId) {
      const ordLower = tokens.orderId.toLowerCase();
      matchedOrder = orders.find((o) => String(o.orderId || "").toLowerCase() === ordLower) || null;
    }
    if (!matchedOrder && matchedShipment && matchedShipment.orderId) {
      const ordLower = String(matchedShipment.orderId).toLowerCase();
      matchedOrder = orders.find((o) => String(o.orderId || "").toLowerCase() === ordLower) || null;
    }
    if (!matchedOrder) {
      matchedOrder =
        orders.find((o) => String(o.orderId || "").toLowerCase() === qLower) ||
        orders.find((o) => String(o.trackingCode || "").toLowerCase() === qLower) ||
        orders.find((o) => String(o.orderId || "").toLowerCase().includes(qLower)) ||
        null;
    }

    if (matchedOrder || matchedShipment) {
      const ord = matchedOrder;
      const shp =
        matchedShipment ||
        (ord
          ? shipments.find((s) => String(s.orderId || "").toLowerCase() === String(ord.orderId || "").toLowerCase()) ||
            waybills.find((w) => String(w.orderId || "").toLowerCase() === String(ord.orderId || "").toLowerCase())
          : null);

      const orderIdVal = (ord && ord.orderId) || (shp && shp.orderId) || tokens.orderId || "Chưa gắn mã đơn";
      const trackingVal = (shp && shp.trackingCode) || (ord && ord.trackingCode) || tokens.trackingCode || "Chưa tạo vận đơn";
      const channelKey = (ord && ord.channel) || (shp && shp.channel) || "";
      const channelName =
        (window.CHANNELS_CONFIG && window.CHANNELS_CONFIG[channelKey] && window.CHANNELS_CONFIG[channelKey].shortName) ||
        channelKey ||
        "Đa kênh";
      const skuVal = (ord && ord.sku) || (shp && shp.sku) || tokens.sku || "";
      const prodNameVal = (ord && ord.productName) || (shp && shp.productName) || skuVal;
      const qtyVal = (ord && ord.quantity) || (shp && shp.quantity) || 1;
      const custNameVal = (ord && ord.customerName) || (shp && shp.customerName) || "Khách mua hàng";
      const carrierVal = ord ? this.resolveOrderCarrier(ord) : (shp && shp.carrier) || "Chưa gán ĐVVC";
      const totalVnd = ord
        ? (Number(ord.quantity) || 0) * (Number(ord.unitPrice) || 0)
        : Number((shp && (shp.codAmount || shp.totalAmount)) || 0);

      let badgeHtml = `<span class="odoms-flat-badge is-success">Đã khớp đối soát</span>`;
      if (ord) {
        const ps = ord.platformStatus || (ord.status === "CANCELLED" || ord.status === "INVALID" ? "CANCELLED" : "CONFIRMED");
        if (ps === "CANCELLED" || ord.status === "CANCELLED" || ord.status === "INVALID") {
          badgeHtml = `<span class="odoms-flat-badge is-error">Đã hủy</span>`;
        } else if (ps === "UNCONFIRMED") {
          badgeHtml = `<span class="odoms-flat-badge is-warning">Chờ xác nhận</span>`;
        } else if (ord.status === "BACKORDER") {
          badgeHtml = `<span class="odoms-flat-badge is-error">Thiếu tồn kho</span>`;
        } else {
          badgeHtml = `<span class="odoms-flat-badge is-success">Đã giữ hàng</span>`;
        }
      }

      const actions = [];
      if (ord) {
        actions.push(
          `<button type="button" class="btn btn-primary odoms-btn-34" onclick="AppUI.openOrderFromQrScanner('${this.escapeLogHtml(ord.orderId)}')">Xem chi tiết đơn</button>`
        );
        if (ord.platformStatus !== "CANCELLED" && ord.status !== "CANCELLED" && ord.status !== "INVALID") {
          actions.push(
            `<button type="button" class="btn btn-outline odoms-btn-34" onclick="AppUI.openWaybillFromQrScanner('${this.escapeLogHtml(ord.orderId)}')">Mở vận đơn</button>`
          );
        }
      }
      if (skuVal) {
        actions.push(
          `<button type="button" class="btn btn-outline odoms-btn-34" onclick="AppUI.openSkuInInventoryFromQr('${this.escapeLogHtml(skuVal)}')">Mở trong Kho</button>`
        );
      }

      resultEl.innerHTML = `
        <div class="qr-scan-result-head">
          <span class="qr-scan-result-title">${shp ? "Vận đơn & Đơn hàng" : "Đơn hàng"} · ${this.escapeLogHtml(orderIdVal)} (${this.escapeLogHtml(sourceLabel)})</span>
          ${badgeHtml}
        </div>
        <div class="qr-scan-result-grid">
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Mã vận đơn</span>
            <span class="qr-scan-kv-val">${this.escapeLogHtml(trackingVal)}</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Kênh bán · ĐVVC</span>
            <span class="qr-scan-kv-val">${this.escapeLogHtml(channelName)} · ${this.escapeLogHtml(carrierVal)}</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Sản phẩm</span>
            <span class="qr-scan-kv-val" title="${this.escapeLogHtml(prodNameVal)}">${this.escapeLogHtml(skuVal)} — ${this.escapeLogHtml(prodNameVal)}</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Số lượng · Giá trị</span>
            <span class="qr-scan-kv-val">${qtyVal} SP · ${totalVnd.toLocaleString("vi-VN")} VND</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Khách hàng</span>
            <span class="qr-scan-kv-val">${this.escapeLogHtml(custNameVal)}</span>
          </div>
        </div>
        <div class="qr-scan-result-actions">${actions.join("")}</div>
      `;
      return;
    }

    // 3. Tra cứu theo Mã QR Lô hàng hoặc Mã sản phẩm trong Kho
    let matchedItem = null;
    let matchedBatch = null;
    const lotLower = (tokens.batchCode || "").toLowerCase();
    const skuLower = (tokens.sku || "").toLowerCase();

    for (const item of inventory) {
      const batches = Array.isArray(item.batches) ? item.batches : [];
      for (const b of batches) {
        const bCode = String(b.batchCode || "").toLowerCase();
        const bQr = String(b.qrCode || "").toLowerCase();
        if ((lotLower && bCode === lotLower) || bCode === qLower || bQr === qLower || (qLower.length >= 4 && (bCode.includes(qLower) || bQr.includes(qLower)))) {
          matchedItem = item;
          matchedBatch = b;
          break;
        }
      }
      if (matchedItem) break;
    }

    if (!matchedItem) {
      matchedItem =
        inventory.find((i) => skuLower && String(i.sku || "").toLowerCase() === skuLower) ||
        inventory.find((i) => String(i.sku || "").toLowerCase() === qLower) ||
        inventory.find((i) => String(i.sku || "").toLowerCase().includes(qLower) || String(i.name || "").toLowerCase().includes(qLower)) ||
        null;
    }

    if (matchedItem) {
      const avail = Number(matchedItem.availableStock || 0);
      const badgeHtml =
        avail <= 0
          ? `<span class="odoms-flat-badge is-error">Hết hàng</span>`
          : avail <= 5
          ? `<span class="odoms-flat-badge is-warning">Sắp hết hàng</span>`
          : `<span class="odoms-flat-badge is-success">Sẵn sàng bán</span>`;

      const batchInfoHtml = matchedBatch
        ? `
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Mã lô hàng · Mã QR lô</span>
            <span class="qr-scan-kv-val">${this.escapeLogHtml(matchedBatch.batchCode)} · ${this.escapeLogHtml(matchedBatch.qrCode || matchedBatch.batchCode)}</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Tồn lô · Hạn dùng</span>
            <span class="qr-scan-kv-val">${matchedBatch.remainingQty}/${matchedBatch.initialQty} SP · ${this.escapeLogHtml(matchedBatch.expiryDate || matchedBatch.importDate || "")}</span>
          </div>`
        : "";

      resultEl.innerHTML = `
        <div class="qr-scan-result-head">
          <span class="qr-scan-result-title">${matchedBatch ? "Lô hàng kho" : "Sản phẩm trong kho"} · ${this.escapeLogHtml(matchedItem.sku)} (${this.escapeLogHtml(sourceLabel)})</span>
          ${badgeHtml}
        </div>
        <div class="qr-scan-result-grid">
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Tên sản phẩm</span>
            <span class="qr-scan-kv-val" title="${this.escapeLogHtml(matchedItem.name)}">${this.escapeLogHtml(matchedItem.name)}</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Đơn giá · Danh mục</span>
            <span class="qr-scan-kv-val">${Number(matchedItem.price || 0).toLocaleString("vi-VN")} VND · ${this.escapeLogHtml(matchedItem.category || "")}</span>
          </div>
          <div class="qr-scan-kv">
            <span class="qr-scan-kv-label">Tồn vật lý / Đang giữ / Sẵn sàng bán</span>
            <span class="qr-scan-kv-val">${matchedItem.physicalStock} / ${matchedItem.reservedStock} / ${avail} SP</span>
          </div>
          ${batchInfoHtml}
        </div>
        <div class="qr-scan-result-actions">
          <button type="button" class="btn btn-primary odoms-btn-34" onclick="AppUI.openSkuInInventoryFromQr('${this.escapeLogHtml(matchedItem.sku)}')">Mở trong Kho</button>
        </div>
      `;
      return;
    }

    resultEl.innerHTML = `
      <div class="qr-scan-not-found">
        Không tìm thấy đơn hàng, vận đơn hay lô hàng khớp với "${this.escapeLogHtml(tokens.raw)}" trong dữ liệu hiện tại.
      </div>
    `;
  },

  openOrderFromQrScanner(orderId) {
    this.closeQrCameraModal();
    this.openOrderAuditModal(orderId);
  },

  openWaybillFromQrScanner(orderId) {
    this.closeQrCameraModal();
    this.openWaybillForOrder(orderId);
  },

  openSkuInInventoryFromQr(sku) {
    this.closeQrCameraModal();
    this.switchSidebarTab("inventory");
    this.invCategoryFilter = "ALL";
    this.invStatusFilter = "ALL";
    this.invSearchQuery = String(sku || "").trim().toLowerCase();
    this.currentInvPage = 1;

    const catEl = document.getElementById("invCategoryFilter");
    if (catEl) catEl.value = "ALL";
    const statusEl = document.getElementById("invStatusFilter");
    if (statusEl) statusEl.value = "ALL";
    const searchEl = document.getElementById("invSearchInput");
    if (searchEl) searchEl.value = String(sku || "").trim();

    this.setInventoryStatusFilter("ALL");
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
    this.activeShippingCard = null;
    this.currentShippingPage = 1;
    this.shippingPageSize = 10;
  },

  filterShippingByCard(cardKey) {
    const map = {
      PENDING: "PENDING_PICKUP",
      IN_TRANSIT: "IN_TRANSIT",
      DELIVERED: "DELIVERED",
      FAILED: "FAILED_RETURNING"
    };
    const targetStatus = map[String(cardKey || "").toUpperCase()] || "ALL";
    const nextStatus = this.shippingStatusFilter === targetStatus ? "ALL" : targetStatus;
    this.setShippingStatusFilter(nextStatus);
  },

  setShippingStatusFilter(statusCode) {
    this.shippingStatusFilter = String(statusCode || "ALL").trim().toUpperCase();
    this.currentShippingPage = 1;
    const statusSel = document.getElementById("shippingStatusFilter");
    if (statusSel) statusSel.value = this.shippingStatusFilter;
    this.renderShippingTab();
  },

  changeShippingPage(delta) {
    const next = (Number(this.currentShippingPage) || 1) + Number(delta || 0);
    this.currentShippingPage = Math.max(1, next);
    this.renderShippingTab();
  },

  onShippingFilterChange() {
    const carrierEl = document.getElementById("shippingCarrierFilter");
    const statusEl = document.getElementById("shippingStatusFilter");
    const searchEl = document.getElementById("shippingSearchInput");
    if (carrierEl) this.shippingCarrierFilter = carrierEl.value || "ALL";
    if (statusEl && statusEl.value) this.shippingStatusFilter = statusEl.value;
    if (searchEl) this.shippingSearchQuery = (searchEl.value || "").trim().toLowerCase();
    this.currentShippingPage = 1;
    this.renderShippingTab();
  },

  getShortCarrierLabel(rawCarrier) {
    const raw = String(rawCarrier || "").trim();
    if (!raw) return "Chưa gán ĐVVC";
    const upper = raw.toUpperCase();
    if (upper.includes("GHN") || upper.includes("GIAO HÀNG NHANH")) return "GHN";
    if (upper.includes("GHTK") || upper.includes("TIẾT KIỆM")) return "GHTK";
    if (upper.includes("SPX") || upper.includes("SHOPEE")) return "SPX Express";
    if (upper.includes("J&T")) return "J&T Express";
    if (upper.includes("VIETTEL")) return "Viettel Post";
    if (upper.includes("TẠI QUẦY")) return "Tại quầy";
    return raw.replace(/\s*\([^)]*\)\s*/g, " ").trim() || raw;
  },

  formatCourierDisplayName(rawName) {
    const base = String(rawName || "").split("(")[0].trim();
    if (!base) return "Bưu tá giao nhận";
    if (/^bưu\s+tá(?:\s|$|:)/i.test(base)) return base;
    return `Bưu tá ${base}`;
  },

  formatShippingDateTimeParts(handoverStr, lastUpdateStr) {
    const rawH = String(handoverStr || "").trim();
    const rawU = String(lastUpdateStr || "").trim();
    let mainText = rawH || "-";
    let fullMainText = rawH || "-";

    const dmy = rawH.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (dmy) {
      const dd = String(dmy[1]).padStart(2, "0");
      const mm = String(dmy[2]).padStart(2, "0");
      const yyyy = dmy[3];
      const hh = String(dmy[4] || "00").padStart(2, "0");
      const mi = String(dmy[5] || "00").padStart(2, "0");
      const ss = String(dmy[6] || "00").padStart(2, "0");
      mainText = `${dd}.${mm}.${yyyy} · ${hh}:${mi}`;
      fullMainText = `${hh}:${mi}:${ss} ${dd}.${mm}.${yyyy}`;
    } else {
      const ymd = rawH.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
      if (ymd) {
        const dd = String(ymd[3]).padStart(2, "0");
        const mm = String(ymd[2]).padStart(2, "0");
        const yyyy = ymd[1];
        const hh = String(ymd[4] || "00").padStart(2, "0");
        const mi = String(ymd[5] || "00").padStart(2, "0");
        const ss = String(ymd[6] || "00").padStart(2, "0");
        mainText = `${dd}.${mm}.${yyyy} · ${hh}:${mi}`;
        fullMainText = `${hh}:${mi}:${ss} ${dd}.${mm}.${yyyy}`;
      }
    }

    let updateShort = rawU;
    let updateFull = rawU;
    const uTimeMatch = rawU.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (uTimeMatch) {
      const hh = String(uTimeMatch[1]).padStart(2, "0");
      const mi = String(uTimeMatch[2]).padStart(2, "0");
      const ss = String(uTimeMatch[3] || "00").padStart(2, "0");
      updateShort = `${hh}:${mi}`;
      updateFull = `${hh}:${mi}:${ss}`;
    }

    return {
      main: mainText,
      fullMain: fullMainText,
      sub: updateShort ? `Cập nhật: ${updateShort}` : "Chưa có cập nhật",
      fullSub: updateFull ? `Cập nhật: ${updateFull}` : "Chưa có cập nhật"
    };
  },

  getFilteredShippingList() {
    const baseList =
      typeof this.getValidShipmentsUpToNow === "function"
        ? this.getValidShipmentsUpToNow()
        : this.syncShipmentsFromEngine();

    const sortedAll = [...(Array.isArray(baseList) ? baseList : [])].sort((a, b) => {
      const ta = typeof this.getShipmentTimestampMs === "function" ? this.getShipmentTimestampMs(a) || 0 : 0;
      const tb = typeof this.getShipmentTimestampMs === "function" ? this.getShipmentTimestampMs(b) || 0 : 0;
      return tb - ta;
    });

    const carrierFilter = String(this.shippingCarrierFilter || "ALL");
    const statusFilter = String(this.shippingStatusFilter || "ALL").toUpperCase();
    const q = String(this.shippingSearchQuery || "").trim().toLowerCase();

    const filtered = sortedAll.filter((s) => {
      if (carrierFilter !== "ALL" && !String(s.carrier || "").toLowerCase().includes(carrierFilter.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "ALL" && String(s.status || "").toUpperCase() !== statusFilter) {
        return false;
      }
      if (q) {
        const matchCode = String(s.trackingCode || "").toLowerCase().includes(q);
        const matchOrder = String(s.orderId || "").toLowerCase().includes(q);
        const matchCust =
          String(s.receiver?.name || "").toLowerCase().includes(q) ||
          String(s.receiver?.phone || "").toLowerCase().includes(q);
        const matchAddr = String(s.receiver?.address || "").toLowerCase().includes(q);
        const matchCarrier = String(s.carrier || "").toLowerCase().includes(q);
        if (!matchCode && !matchOrder && !matchCust && !matchAddr && !matchCarrier) return false;
      }
      return true;
    });

    return { allList: sortedAll, list: filtered };
  },

  renderShippingTab() {
    const { allList, list: filtered } = this.getFilteredShippingList();

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    const activeUnfinishedTotal = this.getUnfinishedValidShipmentsCount();
    setEl("badgeShippingCount", activeUnfinishedTotal);
    setEl("badgeFifoCount", activeUnfinishedTotal);

    // Cập nhật 4 thẻ KPI Vận chuyển phẳng 0px
    const pendingCount = allList.filter((s) => s.status === "PENDING_PICKUP").length;
    const inTransitCount = allList.filter((s) => s.status === "IN_TRANSIT").length;
    const deliveredCount = allList.filter((s) => s.status === "DELIVERED").length;
    const failedCount = allList.filter((s) => s.status === "FAILED_RETURNING").length;

    setEl("shippingKpiPending", `${pendingCount} đơn`);
    setEl("shippingKpiInTransit", `${inTransitCount} đơn`);
    setEl("shippingKpiDelivered", `${deliveredCount} đơn`);
    setEl("shippingKpiFailed", `${failedCount} đơn`);

    // Đồng bộ trạng thái nổi bật 2 chiều giữa 4 thẻ KPI, cụm phân đoạn & select ẩn
    const activeStatus = String(this.shippingStatusFilter || "ALL").toUpperCase();
    const statusToCardMap = {
      PENDING_PICKUP: "PENDING",
      IN_TRANSIT: "IN_TRANSIT",
      DELIVERED: "DELIVERED",
      FAILED_RETURNING: "FAILED"
    };
    const activeCardKey = statusToCardMap[activeStatus] || null;
    this.activeShippingCard = activeCardKey;

    if (typeof document.querySelectorAll === "function") {
      document.querySelectorAll("[data-ship-card]").forEach((cardEl) => {
        const key = cardEl.getAttribute("data-ship-card");
        cardEl.classList.toggle("is-active-kpi", Boolean(activeCardKey && key === activeCardKey));
      });
    }

    const segBtnMap = {
      ALL: "btnShipStatusAll",
      PENDING_PICKUP: "btnShipStatusPending",
      IN_TRANSIT: "btnShipStatusTransit",
      DELIVERED: "btnShipStatusDelivered",
      FAILED_RETURNING: "btnShipStatusFailed"
    };
    Object.keys(segBtnMap).forEach((k) => {
      const btn = document.getElementById(segBtnMap[k]);
      if (!btn) return;
      const isAct = activeStatus === k;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-pressed", isAct ? "true" : "false");
    });

    const hiddenStatusSel = document.getElementById("shippingStatusFilter");
    if (hiddenStatusSel) hiddenStatusSel.value = activeStatus;

    const countLabel = document.getElementById("shippingCountLabel");
    if (countLabel) {
      countLabel.innerText =
        filtered.length === allList.length
          ? `Tổng ${allList.length} đơn vận chuyển`
          : `Khớp ${filtered.length} / ${allList.length} đơn vận chuyển`;
    }

    const tbody = document.getElementById("shippingTableBody");
    if (!tbody) return;

    // Phân trang chuẩn 10 đơn / trang
    const total = filtered.length;
    const pageSize = Math.max(1, Number(this.shippingPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, Number(this.currentShippingPage) || 1), totalPages);
    this.currentShippingPage = page;

    const startIdx = (page - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    const infoEl = document.getElementById("shippingPaginationInfo");
    const curEl = document.getElementById("shippingPaginationCurrent");
    const prevBtn = document.getElementById("btnShippingPrevPage");
    const nextBtn = document.getElementById("btnShippingNextPage");

    if (infoEl) {
      infoEl.innerText =
        total > 0
          ? `Hiển thị ${startIdx + 1}–${startIdx + pageItems.length} / tổng ${total} đơn vận chuyển`
          : "Hiển thị 0 / tổng 0 đơn vận chuyển";
    }
    if (curEl) curEl.innerText = `Trang ${page} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="7" class="odoms-empty-cell">
            Không có đơn vận chuyển nào khớp bộ lọc hiện tại.
          </td>
        </tr>
      `;
      return;
    }

    const channelsCfg = window.CHANNELS_CONFIG || {};
    const mapSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>' +
      '<line x1="8" y1="2" x2="8" y2="18"/>' +
      '<line x1="16" y1="6" x2="16" y2="22"/>' +
      "</svg>";
    const printSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 6 2 18 2 18 9"/>' +
      '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>' +
      '<rect x="6" y="14" width="12" height="8"/>' +
      "</svg>";

    tbody.innerHTML = pageItems
      .map((s) => {
        const safeTrk = this.escapeLogHtml(s.trackingCode || "");
        const safeOrd = this.escapeLogHtml(s.orderId || "-");
        const chKey = String(s.channel || "").trim().toUpperCase();
        const chName = this.escapeLogHtml((channelsCfg[chKey] && channelsCfg[chKey].shortName) || chKey || "Đa kênh");
        const safeCarrierFull = this.escapeLogHtml(s.carrier || "Chưa gán ĐVVC");
        const safeCarrierShort = this.escapeLogHtml(this.getShortCarrierLabel(s.carrier));
        const tierPlain = this.escapeLogHtml(this.getShippingTierPlainLabel(s.shippingTier));
        const recvName = this.escapeLogHtml(s.receiver?.name || "Khách mua hàng");
        const recvPhone = this.escapeLogHtml(s.receiver?.phone || "-");
        const recvAddr = this.escapeLogHtml(s.receiver?.address || "-");
        const codVal = Number(s.totalCod || 0);
        const codPrimary = codVal > 0 ? `${codVal.toLocaleString("vi-VN")} VND` : "0 VND · Đã TT";
        const feeVal = Number(s.shippingFee || 0);
        const feeSub = s.isFreeship || feeVal === 0 ? "Phí giao: Miễn phí" : `Phí giao: ${feeVal.toLocaleString("vi-VN")} VND`;
        const dtParts = this.formatShippingDateTimeParts(s.handoverTime, s.lastUpdateTime);
        const jsTrk = String(s.trackingCode || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

        return `
          <tr>
            <td class="col-ship-code">
              <div class="wb-cell-code-main" title="${safeTrk}">${safeTrk}</div>
              <div class="wb-cell-sub" title="${safeOrd} · ${chName}">${safeOrd} · ${chName}</div>
            </td>
            <td class="col-ship-carrier">
              <div class="wb-cell-primary" title="${safeCarrierFull}">${safeCarrierShort}</div>
              <div class="wb-cell-sub">${tierPlain}</div>
            </td>
            <td class="col-ship-receiver">
              <div class="wb-cell-primary" title="${recvName} · ${recvPhone}">${recvName} · ${recvPhone}</div>
              <div class="wb-cell-sub" title="${recvAddr}">${recvAddr}</div>
            </td>
            <td class="col-ship-cod">
              <div class="wb-cell-primary">${codPrimary}</div>
              <div class="wb-cell-sub">${feeSub}</div>
            </td>
            <td class="col-ship-time">
              <div class="wb-cell-primary" title="${this.escapeLogHtml(dtParts.fullMain)}">${this.escapeLogHtml(dtParts.main)}</div>
              <div class="wb-cell-sub" title="${this.escapeLogHtml(dtParts.fullSub)}">${this.escapeLogHtml(dtParts.sub)}</div>
            </td>
            <td class="col-ship-status">
              <select
                class="shipping-status-select-flat st-${s.status}"
                onchange="AppUI.handleChangeShipmentStatus('${jsTrk}', this.value)"
                title="Đổi trạng thái vận đơn ${safeTrk}"
                aria-label="Trạng thái vận đơn ${safeTrk}"
              >
                <option value="PENDING_PICKUP" ${s.status === "PENDING_PICKUP" ? "selected" : ""}>Chờ lấy hàng</option>
                <option value="IN_TRANSIT" ${s.status === "IN_TRANSIT" ? "selected" : ""}>Đang giao hàng</option>
                <option value="DELIVERED" ${s.status === "DELIVERED" ? "selected" : ""}>Giao thành công</option>
                <option value="FAILED_RETURNING" ${s.status === "FAILED_RETURNING" ? "selected" : ""}>Giao thất bại</option>
              </select>
            </td>
            <td class="col-ship-actions">
              <div class="settings-segmented-control ship-action-seg" role="group" aria-label="Thao tác vận đơn ${safeTrk}">
                <button
                  type="button"
                  class="settings-seg-btn settings-action-icon-btn"
                  onclick="AppUI.openShippingMapModal('${jsTrk}')"
                  title="Xem hành trình giao nhận"
                  aria-label="Xem hành trình giao nhận"
                >
                  ${mapSvg}
                </button>
                <button
                  type="button"
                  class="settings-seg-btn settings-action-icon-btn"
                  onclick="AppUI.openWaybillFromShipping('${jsTrk}')"
                  title="In phiếu vận đơn A6"
                  aria-label="In phiếu vận đơn A6"
                >
                  ${printSvg}
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  },

  // Trích tên bưu cục lưu tạm từ mốc lịch sử gần nhất cho vận đơn giao thất bại (0 từ IT cấm)
  extractPostOfficeLabel(shipment) {
    if (!shipment) return "Bưu cục phát · Lưu tạm";
    const timeline = Array.isArray(shipment.timeline) ? shipment.timeline : [];
    for (let i = timeline.length - 1; i >= 0; i--) {
      const loc = String((timeline[i] && timeline[i].location) || "").trim();
      if (/bưu\s+cục/i.test(loc)) {
        const cleanLoc = loc.split(",")[0].trim();
        return `${cleanLoc} · Lưu tạm`;
      }
    }
    const cur = String(shipment.currentLocation || "").trim();
    const curMatch = cur.match(/Bưu\s+cục[^—\-,.;]*/i);
    if (curMatch && curMatch[0]) {
      return `${curMatch[0].trim()} · Lưu tạm`;
    }
    const shortCarrier = this.getShortCarrierLabel(shipment.carrier);
    return `Bưu cục ${shortCarrier} · Lưu tạm`;
  },

  openShippingMapModal(trackingCode) {
    const s = (this.syncShipmentsFromEngine() || []).find((item) => item.trackingCode === trackingCode);
    if (!s) return;

    const modal = document.getElementById("shippingMapModal");
    const titleEl = document.getElementById("mapModalTrackingTitle");
    const subtitleEl = document.getElementById("mapModalTrackingSubtitle");
    const bodyEl = document.getElementById("shippingMapModalBody");
    if (!modal || !bodyEl) return;

    const statusCode = String(s.status || "PENDING_PICKUP").trim().toUpperCase();
    const statusPlain = this.getWaybillStatusBadgeMeta(statusCode).label;
    if (titleEl) {
      titleEl.innerText = `Hành trình giao nhận — ${s.trackingCode} (${s.carrier})`;
    }
    if (subtitleEl) {
      subtitleEl.innerText = `Trạng thái: ${statusPlain} · Cập nhật lúc ${s.lastUpdateTime || s.handoverTime || ""}`;
    }

    const originAddr = "186 An Dương Vương, Phường Bình Phú, TP.HCM";
    const destAddr = s.receiver?.address || "";
    const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddr)}&destination=${encodeURIComponent(destAddr)}`;

    const defaultProgress =
      statusCode === "DELIVERED" ? 100 : statusCode === "PENDING_PICKUP" ? 20 : statusCode === "FAILED_RETURNING" ? 60 : 75;
    const progressPct = Number.isFinite(Number(s.progressPercent)) ? Number(s.progressPercent) : defaultProgress;

    const safeCourierLabel = this.escapeLogHtml(this.formatCourierDisplayName(s.shipperName));
    const safeRecvName = this.escapeLogHtml(s.receiver?.name || "Người nhận");
    const safeRecvPhone = this.escapeLogHtml(s.receiver?.phone || "-");
    const safeRecvAddr = this.escapeLogHtml(destAddr || "-");
    const safeCurLoc = this.escapeLogHtml(s.currentLocation || "Đang cập nhật vị trí tuyến giao");
    const jsTrk = String(s.trackingCode || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

    const navIcon =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="3 11 22 2 13 21 11 13 3 11"/>' +
      "</svg>";
    const extMapIcon =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
      '<polyline points="15 3 21 3 21 9"/>' +
      '<line x1="10" y1="14" x2="21" y2="3"/>' +
      "</svg>";
    const storeIcon =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
      '<polyline points="9 22 9 12 15 12 15 22"/>' +
      "</svg>";
    const truckIcon =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="1" y="3" width="15" height="13"/>' +
      '<polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>' +
      '<circle cx="5.5" cy="18.5" r="2.5"/>' +
      '<circle cx="18.5" cy="18.5" r="2.5"/>' +
      "</svg>";
    const postOfficeIcon =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="4" y="2" width="16" height="20"/>' +
      '<path d="M9 22v-4h6v4"/>' +
      '<line x1="8" y1="6" x2="8" y2="6.01"/>' +
      '<line x1="12" y1="6" x2="12" y2="6.01"/>' +
      '<line x1="16" y1="6" x2="16" y2="6.01"/>' +
      '<line x1="8" y1="10" x2="8" y2="10.01"/>' +
      '<line x1="12" y1="10" x2="12" y2="10.01"/>' +
      '<line x1="16" y1="10" x2="16" y2="10.01"/>' +
      '<line x1="8" y1="14" x2="8" y2="14.01"/>' +
      '<line x1="12" y1="14" x2="12" y2="14.01"/>' +
      '<line x1="16" y1="14" x2="16" y2="14.01"/>' +
      "</svg>";
    const deliveredCheckIcon =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="20 6 9 17 4 12"/>' +
      "</svg>";
    const pinIcon =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
      '<circle cx="12" cy="10" r="3"/>' +
      "</svg>";
    const pinMiniIcon =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
      '<circle cx="12" cy="10" r="3"/>' +
      "</svg>";
    const userIcon =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="12" cy="7" r="4"/>' +
      "</svg>";
    const clockIcon =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/>' +
      '<polyline points="12 6 12 12 16 14"/>' +
      "</svg>";
    const checkDotIcon =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="20 6 9 17 4 12"/>' +
      "</svg>";
    const truckDotIcon =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="1" y="3" width="15" height="13"/>' +
      '<polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>' +
      '<circle cx="5.5" cy="18.5" r="2.5"/>' +
      '<circle cx="18.5" cy="18.5" r="2.5"/>' +
      "</svg>";

    // Dựng đúng hình thái sơ đồ lộ trình theo 4 trạng thái vận chuyển (v35)
    let routeCanvasInnerHtml = "";
    if (statusCode === "PENDING_PICKUP") {
      // Trạng thái 1 (Chờ lấy): Bưu tá bên trái -> nét đứt cam -> Kho Bình Phú ở giữa (38%) -> nét đứt xám -> Điểm giao bên phải
      routeCanvasInnerHtml = `
        <div class="ship-route-seg-pending-active"></div>
        <div class="ship-route-seg-pending-rest"></div>

        <div class="map-pin pending-courier">
          <div class="map-pin-label map-pin-label-top-left">${safeCourierLabel} · Đang tới lấy</div>
          <div class="map-pin-icon">${truckIcon}</div>
        </div>

        <div class="map-pin origin is-pending-mid">
          <div class="map-pin-icon">${storeIcon}</div>
          <div class="map-pin-label map-pin-label-center-bottom">Kho Bình Phú (Điểm lấy)</div>
        </div>

        <div class="map-pin destination">
          <div class="map-pin-icon">${pinIcon}</div>
          <div class="map-pin-label map-pin-label-dest">${safeRecvName} (Điểm giao)</div>
        </div>
      `;
    } else if (statusCode === "DELIVERED") {
      // Trạng thái 3 (Giao thành công): Chỉ đúng 2 mốc đầu-cuối, thanh liền xanh lá 100%, gỡ bỏ hoàn toàn xe tải trung gian
      routeCanvasInnerHtml = `
        <div class="ship-route-track">
          <div class="ship-route-progress is-delivered" style="width:100%;"></div>
        </div>

        <div class="map-pin origin">
          <div class="map-pin-icon">${storeIcon}</div>
          <div class="map-pin-label map-pin-label-origin">Kho Bình Phú</div>
        </div>

        <div class="map-pin destination is-delivered">
          <div class="map-pin-label map-pin-label-top-right">Đã giao thành công · ${safeCourierLabel}</div>
          <div class="map-pin-icon">${deliveredCheckIcon}</div>
          <div class="map-pin-label map-pin-label-dest">${safeRecvName} (Đã nhận)</div>
        </div>
      `;
    } else if (statusCode === "FAILED_RETURNING") {
      // Trạng thái 4 (Giao thất bại): Kho Bình Phú -> đường liền đỏ -> Bưu cục lưu tạm (56%, icon tòa nhà) -> nét đứt đỏ nhạt -> Điểm giao
      const safeOfficeLabel = this.escapeLogHtml(this.extractPostOfficeLabel(s));
      routeCanvasInnerHtml = `
        <div class="ship-route-seg-failed-done"></div>
        <div class="ship-route-seg-failed-rest"></div>

        <div class="map-pin origin">
          <div class="map-pin-icon">${storeIcon}</div>
          <div class="map-pin-label map-pin-label-origin">Kho Bình Phú</div>
        </div>

        <div class="map-pin post-office" style="left:56%;">
          <div class="map-pin-label map-pin-label-top is-failed-office">${safeOfficeLabel}</div>
          <div class="map-pin-icon">${postOfficeIcon}</div>
        </div>

        <div class="map-pin destination is-failed">
          <div class="map-pin-icon">${pinIcon}</div>
          <div class="map-pin-label map-pin-label-dest">${safeRecvName} (Điểm giao)</div>
        </div>
      `;
    } else {
      // Trạng thái 2 (Đang giao hàng — IN_TRANSIT): Kho Bình Phú -> liền xanh dương -> Xe tải bưu tá (24%–76%) -> nét đứt trung tính -> Điểm giao
      const courierTrackPct = Math.min(Math.max(progressPct, 24), 76);
      const courierLeftExpr = `calc(40px + (100% - 80px) * ${(courierTrackPct / 100).toFixed(4)})`;
      routeCanvasInnerHtml = `
        <div class="ship-route-track">
          <div class="ship-route-progress" style="width:${courierTrackPct}%;"></div>
        </div>

        <div class="map-pin origin">
          <div class="map-pin-icon">${storeIcon}</div>
          <div class="map-pin-label map-pin-label-origin">Kho Bình Phú</div>
        </div>

        <div class="map-pin shipper" style="left:${courierLeftExpr};">
          <div class="map-pin-label map-pin-label-top">${safeCourierLabel} (${progressPct}%)</div>
          <div class="map-pin-icon">${truckIcon}</div>
        </div>

        <div class="map-pin destination">
          <div class="map-pin-icon">${pinIcon}</div>
          <div class="map-pin-label map-pin-label-dest">${safeRecvName} (Điểm giao)</div>
        </div>
      `;
    }

    const timelineHtml = (s.timeline || [])
      .map((t, idx, arr) => {
        const isLast = idx === arr.length - 1;
        const isCompleted = idx < arr.length - 1 || statusCode === "DELIVERED";
        const isCurrent = isLast && statusCode !== "DELIVERED";
        const stepClass = isCompleted ? "completed" : isCurrent ? "current" : "";
        const dotIcon = isCompleted ? checkDotIcon : isCurrent ? truckDotIcon : clockIcon;

        return `
          <div class="shipping-timeline-step ${stepClass}">
            <div class="timeline-dot">${dotIcon}</div>
            <div style="min-width:0;flex:1;">
              <div class="ship-timeline-step-head">
                <strong class="ship-timeline-step-title">${this.escapeLogHtml(t.title || "")}</strong>
                <span class="ship-timeline-step-time">${this.escapeLogHtml(t.time || "")}</span>
              </div>
              <div class="ship-timeline-step-desc">${this.escapeLogHtml(t.desc || "")}</div>
              <div class="ship-timeline-step-loc">${pinMiniIcon}<span>${this.escapeLogHtml(t.location || "")}</span></div>
            </div>
          </div>
        `;
      })
      .join("");

    const feeVal = Number(s.shippingFee || 0);
    const feePlainText =
      s.isFreeship || feeVal === 0
        ? "Phí vận chuyển: Miễn phí (0 VND)"
        : `Phí vận chuyển: ${feeVal.toLocaleString("vi-VN")} VND`;

    bodyEl.innerHTML = `
      <div class="ship-map-card">
        <div class="shipping-map-header">
          <div class="ship-map-head-left">
            <div class="ship-map-kicker">${navIcon}<span>Lộ trình vận chuyển trực tiếp</span></div>
            <div class="ship-map-location-title">${safeCurLoc}</div>
          </div>
          <a
            href="${gmapsDirUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline odoms-btn-34 ship-gmaps-link-btn"
            title="Mở chỉ đường trên Google Maps"
          >
            ${extMapIcon}
            <span>Mở trên Google Maps</span>
          </a>
        </div>

        <div class="shipping-map-canvas" data-route-status="${statusCode}">
          <div class="map-grid-overlay"></div>
          ${routeCanvasInnerHtml}
        </div>

        <div class="ship-route-info-grid">
          <div class="ship-route-info-box">
            <div class="ship-route-box-title">${storeIcon}<span>Nơi gửi (Kho bán hàng)</span></div>
            <div class="ship-route-box-name">ODOMS Store — Kho Phường Bình Phú</div>
            <div class="ship-route-box-line">186 An Dương Vương, Phường Bình Phú, TP.HCM</div>
            <div class="ship-route-box-line">Điện thoại: 028.7777.6868</div>
          </div>

          <div class="ship-route-info-box">
            <div class="ship-route-box-title is-dest">${userIcon}<span>Nơi nhận (Người mua)</span></div>
            <div class="ship-route-box-name">${safeRecvName} — ${safeRecvPhone}</div>
            <div class="ship-route-box-line">${safeRecvAddr}</div>
            <div class="ship-route-box-meta">${feePlainText} · Thu hộ: ${Number(s.totalCod || 0).toLocaleString("vi-VN")} VND</div>
          </div>
        </div>
      </div>

      <div class="ship-timeline-panel">
        <div class="ship-timeline-head">
          <h4 class="ship-timeline-title">${clockIcon}<span>Lịch sử bàn giao &amp; các mốc hành trình</span></h4>
          <select
            class="shipping-status-select-flat is-modal-select st-${statusCode}"
            onchange="AppUI.handleChangeShipmentStatus('${jsTrk}', this.value, true)"
            title="Cập nhật nhanh trạng thái vận đơn"
            aria-label="Cập nhật nhanh trạng thái vận đơn"
          >
            <option value="PENDING_PICKUP" ${statusCode === "PENDING_PICKUP" ? "selected" : ""}>Chờ lấy hàng</option>
            <option value="IN_TRANSIT" ${statusCode === "IN_TRANSIT" ? "selected" : ""}>Đang giao hàng</option>
            <option value="DELIVERED" ${statusCode === "DELIVERED" ? "selected" : ""}>Giao thành công</option>
            <option value="FAILED_RETURNING" ${statusCode === "FAILED_RETURNING" ? "selected" : ""}>Giao thất bại</option>
          </select>
        </div>
        <div class="shipping-timeline">
          ${timelineHtml}
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  handleChangeShipmentStatus(trackingCode, nextStatus, reopenModal = false) {
    if (!window.omsEngine || typeof window.omsEngine.updateShipmentStatus !== "function") return;
    const beforeShip = (window.omsEngine.shipments || []).find(
      (s) => String(s.trackingCode || "").trim() === String(trackingCode || "").trim()
    );
    if (!beforeShip || beforeShip.status === nextStatus) return;

    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforeLabel = window.omsEngine.getShipmentStatusTextVi(beforeShip.status);

    const updated = window.omsEngine.updateShipmentStatus(trackingCode, nextStatus);
    if (!updated) return;

    this.syncShipmentsFromEngine();
    const afterLabel = window.omsEngine.getShipmentStatusTextVi(updated.status);
    const rec = window.omsEngine.recordReversibleAction({
      actionType: "UPDATE_SHIPMENT_STATUS",
      actionLabel: "Chuyển trạng thái vận đơn",
      targetCode: trackingCode,
      beforeSummary: `Trạng thái: ${beforeLabel}`,
      afterSummary: `Trạng thái: ${afterLabel}`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

    this.renderAll();
    if (reopenModal) {
      this.openShippingMapModal(trackingCode);
    }
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
      section.oms-view-section[data-views="settings"] .settings-group-box,
      section.oms-view-section[data-views="settings"] .settings-segmented-control,
      section.oms-view-section[data-views="settings"] .settings-drawer-toggle-btn,
      #cloudSyncConfigBox,
      #cloudSyncConfigBox .form-control,
      #cloudSyncConfigBox .btn,
      #cloudSyncConfigBox .status-badge,
      #cloudSyncFeedbackMsg {
        border-radius: 0px !important;
        box-shadow: none !important;
        background-image: none !important;
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
      // Bảo vệ 2 tầng chống đẩy ngược dữ liệu cũ hoặc mảng đơn rỗng lên Google Sheets khi chưa PULL_ALL thành công
      if (!window.cloudSync._bootPushGuardInstalled) {
        window.cloudSync._bootPushGuardInstalled = true;
        window.cloudSync._initialPullSettled = false;
        const origSchedulePush = window.cloudSync.scheduleCloudPush.bind(window.cloudSync);
        window.cloudSync.scheduleCloudPush = (reason = "AUTO_SYNC") => {
          if (window.cloudSync.isSandboxMode) {
            return;
          }
          const ordersEmpty = !window.omsEngine || !Array.isArray(window.omsEngine.orders) || window.omsEngine.orders.length === 0;
          if (!window.cloudSync._initialPullSettled || (ordersEmpty && (reason === "AUDIT_LOGS_SYNC" || reason === "USERS_RBAC_SYNC"))) {
            window.cloudSync.saveLocalStateSnapshot();
            return;
          }
          return origSchedulePush(reason);
        };
      }
      // Thanh lọc bộ nhớ cũ và chỉ khôi phục snapshot nếu đã đạt chuẩn FASHION_2026_V4 (25 mã Thời trang)
      if (typeof window.cloudSync.purgeLegacyStorageCache === "function") {
        window.cloudSync.purgeLegacyStorageCache();
      }
      window.cloudSync.restoreLocalStateSnapshot();
      this.syncShipmentsFromEngine();
      if (window.cloudSync.endpointUrl && window.cloudSync.autoSync) {
        let pullSucceeded = false;
        Promise.resolve(window.cloudSync.pullStateFromCloud(true))
          .then((res) => {
            pullSucceeded = Boolean(res && res.success);
          })
          .finally(() => {
            // Chỉ mở khóa _initialPullSettled = true khi đã PULL_ALL thành công từ Google Sheets
            window.cloudSync._initialPullSettled = pullSucceeded;
          });
      } else if (!window.cloudSync.endpointUrl) {
        window.cloudSync._initialPullSettled = true;
        if (typeof window.cloudSync.updateCloudBaselineFingerprint === "function") {
          window.cloudSync.updateCloudBaselineFingerprint();
        }
      }
    }

    // Gắn giá trị vào Mục 3 tĩnh (#cloudSyncConfigBox) trong trang Cài đặt hệ thống
    const urlInput = document.getElementById("cloudEndpointUrlInput");
    if (urlInput && window.cloudSync) {
      urlInput.value = window.cloudSync.endpointUrl || "";
    }
    this.updateCloudSyncStatusUI();
    this.updateSandboxModeUI();
  },

  updateSandboxModeUI() {
    const isSandbox = Boolean(window.cloudSync && window.cloudSync.isSandboxMode);
    const offBtn = document.getElementById("btnSandboxModeOff");
    const onBtn = document.getElementById("btnSandboxModeOn");
    const pillEl = document.getElementById("topbarSandboxPill");
    const livePillEl = document.getElementById("topbarLivePill");
    const pushBtn = document.getElementById("btnManualCloudPush");

    if (offBtn) {
      offBtn.classList.toggle("active", !isSandbox);
      offBtn.setAttribute("aria-pressed", !isSandbox ? "true" : "false");
    }
    if (onBtn) {
      onBtn.classList.toggle("active", isSandbox);
      onBtn.setAttribute("aria-pressed", isSandbox ? "true" : "false");
    }
    if (pillEl) {
      pillEl.classList.toggle("hidden", !isSandbox);
    }
    if (livePillEl) {
      const showLive = !isSandbox && this.currentMenuTab === "dashboard";
      livePillEl.classList.toggle("hidden", !showLive);
    }
    if (pushBtn) {
      pushBtn.disabled = isSandbox;
      pushBtn.title = isSandbox
        ? "Đang bật Chế độ thử nghiệm — tạm khóa đồng bộ dữ liệu lên Google Sheets"
        : "Đồng bộ dữ liệu lên Google Sheets";
    }
  },

  toggleCloudUrlDrawer(forceOpen) {
    const drawerEl = document.getElementById("cloudUrlDrawer");
    const toggleBtn = document.getElementById("btnToggleCloudUrlDrawer");
    const chevronEl = document.getElementById("cloudUrlDrawerChevron");
    if (!drawerEl) return false;
    const nextOpen = typeof forceOpen === "boolean" ? forceOpen : drawerEl.classList.contains("hidden");
    this.cloudUrlDrawerOpen = nextOpen;
    drawerEl.classList.toggle("hidden", !nextOpen);
    if (toggleBtn) {
      toggleBtn.classList.toggle("is-open", nextOpen);
      toggleBtn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    }
    if (chevronEl) {
      chevronEl.innerText = nextOpen ? "▴" : "▾";
    }
    if (nextOpen) {
      const urlInput = document.getElementById("cloudEndpointUrlInput");
      if (urlInput && typeof urlInput.focus === "function") {
        urlInput.focus();
      }
    }
    return nextOpen;
  },

  hideCloudFeedback() {
    const msgEl = document.getElementById("cloudSyncFeedbackMsg");
    if (!msgEl) return;
    msgEl.classList.add("hidden");
    msgEl.classList.remove("is-success", "is-error", "is-warning");
    msgEl.innerHTML = "";
  },

  renderSandboxUnsyncedBanner() {
    const bannerEl = document.getElementById("sandboxUnsyncedBanner");
    const countEl = document.getElementById("sandboxUnsyncedCount");
    const detailsEl = document.getElementById("sandboxUnsyncedDetails");
    const chevronEl = document.getElementById("sandboxUnsyncedChevron");
    const toggleBtn = document.getElementById("btnToggleSandboxUnsynced");
    if (!bannerEl) return;

    const st = this.sandboxUnsyncedBannerState || { visible: false, expanded: false, changeCount: 0, summary: "" };
    bannerEl.classList.toggle("hidden", !st.visible);
    if (countEl) {
      countEl.innerText = st.changeCount > 0 ? `· ${st.changeCount} thay đổi chưa đồng bộ` : "";
    }
    if (detailsEl) {
      detailsEl.classList.toggle("hidden", !st.expanded);
    }
    if (chevronEl) {
      chevronEl.innerText = st.expanded ? "▴" : "▾";
    }
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", st.expanded ? "true" : "false");
    }
  },

  toggleSandboxUnsyncedBanner(forceExpanded) {
    if (!this.sandboxUnsyncedBannerState || !this.sandboxUnsyncedBannerState.visible) return;
    const nextExpanded =
      typeof forceExpanded === "boolean" ? forceExpanded : !this.sandboxUnsyncedBannerState.expanded;
    this.sandboxUnsyncedBannerState.expanded = nextExpanded;
    this.renderSandboxUnsyncedBanner();
  },

  dismissSandboxUnsyncedBanner() {
    this.sandboxUnsyncedBannerState = { visible: false, expanded: false, changeCount: 0, summary: "" };
    this.renderSandboxUnsyncedBanner();
  },

  async handlePushSandboxUnsyncedChanges() {
    if (!window.cloudSync || window.cloudSync.isSandboxMode) return { success: false };
    const pushBtn = document.getElementById("btnPushSandboxUnsynced");
    if (pushBtn) pushBtn.disabled = true;
    try {
      const res = await window.cloudSync.pushStateToCloud("SANDBOX_UNSYNCED_PUSH", false);
      if (res && res.success) {
        this.dismissSandboxUnsyncedBanner();
      }
      this.showCloudFeedback(res.message, res.success);
      this.updateCloudSyncStatusUI();
      this.renderLogs();
      return res;
    } finally {
      if (pushBtn) pushBtn.disabled = false;
    }
  },

  handleToggleSandboxMode(enabled) {
    if (!window.cloudSync || typeof window.cloudSync.setSandboxMode !== "function") return null;
    const nextState = Boolean(enabled);
    if (Boolean(window.cloudSync.isSandboxMode) === nextState) {
      this.updateSandboxModeUI();
      this.updateCloudSyncStatusUI();
      return {
        isSandboxMode: nextState,
        pendingCount: 0,
        hasNetDiffFromSheet: false,
        shouldWarn: false,
        summaryText: ""
      };
    }
    const result = window.cloudSync.setSandboxMode(nextState);
    this.hideCloudFeedback();
    this.updateSandboxModeUI();
    this.updateCloudSyncStatusUI();

    if (nextState) {
      this.dismissSandboxUnsyncedBanner();
      return result;
    }

    // Khi TẮT Chế độ thử nghiệm:
    // KHÔNG tự động gọi pullStateFromCloud() xóa dữ liệu vừa thao tác và KHÔNG tự động đẩy lên Google Sheets.
    // Chỉ hiển thị thanh cảnh báo mỏng không viền khi có >= 1 thao tác làm đổi dữ liệu thực khác bản gốc Google Sheets.
    if (result && result.shouldWarn) {
      this.sandboxUnsyncedBannerState = {
        visible: true,
        expanded: false,
        changeCount: result.pendingCount || 1,
        summary: result.summaryText || ""
      };
      this.renderSandboxUnsyncedBanner();
      this.renderLogs();
    } else {
      this.dismissSandboxUnsyncedBanner();
    }
    return result;
  },

  onActionDiffRecorded(record) {
    if (!record) return;
    this.actionDiffBarState = {
      mode: "REVERSIBLE",
      badge: `Đối chiếu · ${record.actionLabel}`,
      message: `${record.targetCode ? record.targetCode + ": " : ""}${record.beforeSummary} → ${record.afterSummary}`
    };
    this.updateUndoActionBarUI();
  },

  updateUndoActionBarUI() {
    const barEl = document.getElementById("actionDiffUndoBar");
    const badgeEl = document.getElementById("actionDiffBadge");
    const textEl = document.getElementById("actionDiffText");
    const undoBtn = document.getElementById("btnUndoLastAction");
    const closeBtn = document.getElementById("btnCloseActionDiffBar");
    if (!barEl) return;

    const hasUndo = Boolean(window.omsEngine && window.omsEngine.lastActionUndoRecord);
    const state = this.actionDiffBarState || { mode: "NONE", badge: "", message: "" };

    let effectiveMode = state.mode;
    if (effectiveMode === "REVERSIBLE" && !hasUndo) {
      effectiveMode = "NONE";
    }
    if (effectiveMode === "NONE" && hasUndo) {
      const rec = window.omsEngine.lastActionUndoRecord;
      this.actionDiffBarState = {
        mode: "REVERSIBLE",
        badge: `Đối chiếu · ${rec.actionLabel}`,
        message: `${rec.targetCode ? rec.targetCode + ": " : ""}${rec.beforeSummary} → ${rec.afterSummary}`
      };
      effectiveMode = "REVERSIBLE";
    }

    const shouldShow = effectiveMode !== "NONE";
    barEl.classList.toggle("hidden", !shouldShow);
    barEl.classList.toggle("is-undone", effectiveMode === "UNDONE");
    barEl.classList.toggle("is-reversible", effectiveMode === "REVERSIBLE");

    if (badgeEl) {
      badgeEl.innerText = this.actionDiffBarState.badge || "Đối chiếu vừa làm";
    }
    if (textEl) {
      textEl.innerText = this.actionDiffBarState.message || "";
    }
    if (undoBtn) {
      undoBtn.disabled = !hasUndo;
      undoBtn.classList.toggle("hidden", effectiveMode === "UNDONE" && !hasUndo);
      undoBtn.classList.toggle("btn-primary", hasUndo);
      undoBtn.classList.toggle("btn-outline", !hasUndo);
    }
    if (closeBtn) {
      closeBtn.classList.toggle("hidden", effectiveMode === "REVERSIBLE");
    }
  },

  handleUndoLastAction() {
    if (!window.omsEngine || typeof window.omsEngine.undoLastAction !== "function") return;
    const res = window.omsEngine.undoLastAction();
    if (!res || !res.success) {
      this.updateUndoActionBarUI();
      return;
    }

    this.syncShipmentsFromEngine();
    const syncNote = res.isSandbox
      ? " (chỉ ghi nhận cục bộ trong Chế độ thử nghiệm)"
      : " (đã ghi Nhật ký hệ thống & đồng bộ Google Sheets)";

    this.actionDiffBarState = {
      mode: "UNDONE",
      badge: "Đã hoàn tác 1 bước",
      message: `${res.message}${syncNote}`
    };

    this.renderAll();
    this.updateUndoActionBarUI();
  },

  dismissActionDiffBar() {
    this.actionDiffBarState = { mode: "NONE", badge: "", message: "" };
    this.updateUndoActionBarUI();
  },

  formatSettingsSyncTimestamp(rawTime) {
    const raw = String(rawTime || "").trim();
    if (!raw || /chưa đồng bộ/i.test(raw)) {
      return "Cập nhật: Chưa đồng bộ";
    }
    // Khớp dạng DD/MM/YYYY HH:MM:SS (có thể kèm hậu tố ghi chú) -> đổi sang HH:MM:SS DD.MM.YYYY
    const dmyHms = raw.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\s+(\d{1,2}:\d{2}:\d{2})/);
    if (dmyHms) {
      const dd = dmyHms[1].padStart(2, "0");
      const mm = dmyHms[2].padStart(2, "0");
      const yyyy = dmyHms[3];
      const hms = dmyHms[4];
      return `Cập nhật: ${hms} ${dd}.${mm}.${yyyy}`;
    }
    // Khớp sẵn dạng HH:MM:SS DD.MM.YYYY hoặc DD/MM/YYYY
    const hmsDmy = raw.match(/(\d{1,2}:\d{2}:\d{2})\s+(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if (hmsDmy) {
      const hms = hmsDmy[1];
      const dd = hmsDmy[2].padStart(2, "0");
      const mm = hmsDmy[3].padStart(2, "0");
      const yyyy = hmsDmy[4];
      return `Cập nhật: ${hms} ${dd}.${mm}.${yyyy}`;
    }
    return `Cập nhật: ${raw.replace(/\s*\([^)]*\)\s*/g, "").trim() || "Chưa đồng bộ"}`;
  },

  updateCloudSyncStatusUI() {
    if (!window.cloudSync) return;
    const badgeEl = document.getElementById("cloudSyncStatusBadge");
    const lastSyncEl = document.getElementById("cloudLastSyncLabel");

    if (lastSyncEl) {
      lastSyncEl.innerText = this.formatSettingsSyncTimestamp(window.cloudSync.lastSyncTime);
    }
    if (!badgeEl) return;

    if (window.cloudSync.isSandboxMode) {
      badgeEl.className = "status-badge st-SANDBOX";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = "• Tạm chặn gửi";
      return;
    }

    const status = window.cloudSync.syncStatus;
    if (status === "SYNCING") {
      badgeEl.className = "status-badge st-SYNCING";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = "⏳ Đang đồng bộ...";
    } else if (status === "CLOUD_CONNECTED") {
      badgeEl.className = "status-badge st-ALLOCATED";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = "✓ Đã đồng bộ";
    } else if (status === "CLOUD_ERROR") {
      badgeEl.className = "status-badge st-INVALID";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = "⚠ Chưa kết nối";
    } else {
      badgeEl.className = "status-badge st-ALLOCATED";
      badgeEl.style.background = "";
      badgeEl.style.color = "";
      badgeEl.innerText = window.cloudSync.endpointUrl
        ? "● Sẵn sàng kết nối"
        : "● Lưu trên máy này";
    }
  },

  showCloudFeedback(message, isSuccess = true, includeQuickPull = false, isWarning = false) {
    const msgEl = document.getElementById("cloudSyncFeedbackMsg");
    if (!msgEl) return;
    msgEl.classList.remove("hidden", "is-success", "is-error", "is-warning");
    msgEl.classList.add(isWarning ? "is-warning" : isSuccess ? "is-success" : "is-error");
    msgEl.style.background = "";
    msgEl.style.color = "";
    msgEl.style.border = "";
    if (includeQuickPull) {
      msgEl.innerHTML = `
        <div class="settings-feedback-row">
          <span>${message}</span>
          <button type="button" class="btn btn-primary btn-sm" onclick="AppUI.handleManualCloudPull()">
            Đồng bộ dữ liệu từ Google Sheets
          </button>
        </div>
      `;
    } else {
      msgEl.innerText = message;
    }
  },

  handleSaveCloudConfig(silent = false) {
    if (!window.cloudSync) return;
    const urlInput = document.getElementById("cloudEndpointUrlInput");
    const endpointUrl = urlInput ? urlInput.value.trim() : "";

    window.cloudSync.saveConfig({ endpointUrl, autoSync: true });
    window.cloudSync.syncStatus = endpointUrl ? "CLOUD_READY" : "LOCAL_READY";
    this.updateCloudSyncStatusUI();

    if (!silent) {
      this.toggleCloudUrlDrawer(false);
      this.showCloudFeedback(
        endpointUrl
          ? "Đã lưu liên kết kết nối Sổ dữ liệu Google Sheets."
          : "Đã chuyển sang chế độ chỉ lưu dữ liệu trực tiếp trên máy này.",
        true
      );
    }
  },

  async handleManualCloudPush() {
    if (!window.cloudSync) return;
    if (window.cloudSync.isSandboxMode) {
      this.showCloudFeedback(
        "Đang bật Chế độ thử nghiệm — nút Đồng bộ dữ liệu lên Google Sheets đã được khóa để bảo vệ dữ liệu thực tế.",
        false,
        false,
        true
      );
      return;
    }
    this.handleSaveCloudConfig(true);
    if (!window.cloudSync._initialPullSettled) {
      const pullRes = await window.cloudSync.pullStateFromCloud(true);
      this.syncShipmentsFromEngine();
      this.showCloudFeedback(pullRes.message, pullRes.success);
      this.renderAll();
      return;
    }
    const res = await window.cloudSync.pushStateToCloud("MANUAL_UI_PUSH", false);
    if (res && res.success) {
      this.dismissSandboxUnsyncedBanner();
    }
    this.showCloudFeedback(res.message, res.success);
    this.renderLogs();
  },

  async handleManualCloudPull() {
    if (!window.cloudSync) return;
    this.handleSaveCloudConfig(true);
    const res = await window.cloudSync.pullStateFromCloud(false);
    if (res && res.success) {
      window.cloudSync._initialPullSettled = true;
      if (window.omsEngine) {
        window.omsEngine.lastActionUndoRecord = null;
      }
      this.dismissSandboxUnsyncedBanner();
    }
    this.syncShipmentsFromEngine();
    this.showCloudFeedback(res.message, res.success);
    this.updateUndoActionBarUI();
    this.renderAll();
  },

  // In phiếu vận đơn A6 trực tiếp 1 chạm từ tab Vận chuyển đơn (đủ thông tin sản phẩm từ đơn gốc, không chuyển tab, không ghi đè biểu mẫu qr_api)
  openWaybillFromShipping(trackingCode) {
    const s = (this.syncShipmentsFromEngine() || []).find((item) => item.trackingCode === trackingCode);
    if (!s) return;

    const allOrders = window.omsEngine && Array.isArray(window.omsEngine.orders) ? window.omsEngine.orders : [];
    const matchedOrd = s.orderId
      ? allOrders.find((o) => String(o.orderId || "").trim() === String(s.orderId).trim())
      : null;

    const rawItems = String(s.itemsSummary || "").trim();
    let parsedQty = 1;
    const qtyMatch = rawItems.match(/[×xX]\s*(\d+)\s*$/);
    if (qtyMatch) parsedQty = Math.max(1, Number(qtyMatch[1]) || 1);

    const skuVal = (matchedOrd && matchedOrd.sku) || String(s.sku || "").trim() || "SP-THOI-TRANG";
    const prodNameVal =
      (matchedOrd && matchedOrd.productName) ||
      String(s.productName || "").trim() ||
      rawItems.replace(/\s*[×xX]\s*\d+\s*$/, "").trim() ||
      skuVal;
    const qtyVal = (matchedOrd && Number(matchedOrd.quantity)) || Number(s.quantity) || parsedQty;
    const batchVal =
      String(s.batchCode || "").trim() ||
      (matchedOrd && Array.isArray(matchedOrd.allocatedBatches) && matchedOrd.allocatedBatches.length > 0
        ? matchedOrd.allocatedBatches.map((b) => b.batchCode).join(", ")
        : "LO-2026-A1");

    const waybillData = {
      trackingCode: s.trackingCode,
      orderId: s.orderId || (matchedOrd && matchedOrd.orderId) || "-",
      channel: String(s.channel || (matchedOrd && matchedOrd.channel) || "SHOPEE").toUpperCase(),
      carrier: s.carrier || (matchedOrd ? this.resolveOrderCarrier(matchedOrd) : "SPX Express"),
      customerName: (s.receiver && s.receiver.name) || (matchedOrd && matchedOrd.customerName) || "Khách mua hàng",
      customerPhone: (s.receiver && s.receiver.phone) || (matchedOrd && matchedOrd.customerPhone) || "",
      address: (s.receiver && s.receiver.address) || (matchedOrd && matchedOrd.shippingAddress) || "",
      sku: skuVal,
      productName: prodNameVal,
      quantity: qtyVal,
      batchCode: batchVal,
      totalAmount: Number(s.totalCod !== undefined ? s.totalCod : 0) || 0,
      createdAt: s.handoverTime || s.lastUpdateTime || ""
    };

    this.printWaybillQrTicket(waybillData);
  },

  // ============================================================================
  // GIAO DIỆN THẺ TỔNG QUAN PHẲNG 0PX (7 KPI · LƯỚI 3 CỘT · BẢNG 9 CỘT, v36)
  // ============================================================================
  dashUrgentSortDesc: true,
  dashUrgentSortMode: "PRIORITY_DATE", // PRIORITY_DATE | DATE_ONLY
  dashUrgentPage: 1,
  dashUrgentPageSize: 10,
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
    const futureChannelReservedBySku = {};
    allOrders.forEach((ord) => {
      if (!ord) return;
      if (ord.status === "ALLOCATED" && ord.platformStatus !== "CANCELLED") {
        const ordTs = this.getOrderTimestampMs(ord);
        if (ordTs > nowMs) {
          const skuKey = String(ord.sku || "").trim();
          const chKey = String(ord.channel || "").trim().toUpperCase();
          const qty = Number(ord.quantity) || 0;
          if (skuKey) {
            futureReservedBySku[skuKey] = (futureReservedBySku[skuKey] || 0) + qty;
            if (!futureChannelReservedBySku[skuKey]) {
              futureChannelReservedBySku[skuKey] = {};
            }
            if (chKey) {
              futureChannelReservedBySku[skuKey][chKey] = (futureChannelReservedBySku[skuKey][chKey] || 0) + qty;
            }
          }
        }
      }
    });

    return inventory.map((item) => {
      const skuKey = String(item.sku || "").trim();
      const physical = Math.max(0, Number(item.physicalStock ?? item.stock) || 0);
      const rawReserved =
        item.reservedStock !== undefined && item.reservedStock !== null
          ? Math.max(0, Number(item.reservedStock) || 0)
          : Math.max(0, physical - (Number(item.availableStock) || 0));
      const futureRes = futureReservedBySku[skuKey] || 0;
      const effectiveReserved = Math.max(0, rawReserved - futureRes);
      const effectiveAvailable = Math.min(physical, Math.max(0, physical - effectiveReserved));

      const rawChMap = item.channelReserved || {};
      const futChMap = futureChannelReservedBySku[skuKey] || {};
      const effectiveChannelReserved = {};
      ["SHOPEE", "TIKTOK", "LAZADA", "FACEBOOK", "POS"].forEach((ch) => {
        effectiveChannelReserved[ch] = Math.max(0, (Number(rawChMap[ch]) || 0) - (Number(futChMap[ch]) || 0));
      });

      return {
        ...item,
        effectivePhysicalStock: physical,
        effectiveReservedStock: effectiveReserved,
        effectiveAvailableStock: effectiveAvailable,
        effectiveChannelReserved
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
      return { code: "UNKNOWN", label: "Không xác định", badgeClass: "st-BACKORDER", flatTone: "is-warning" };
    }
    if (ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED") {
      return { code: "CANCELLED", label: "Đã hủy", badgeClass: "st-CANCELLED", flatTone: "is-error" };
    }
    if (ord.status === "BACKORDER") {
      return { code: "BACKORDER", label: "Thiếu tồn", badgeClass: "st-BACKORDER", flatTone: "is-warning" };
    }
    if (ord.platformStatus === "UNCONFIRMED" || ord.status === "PENDING") {
      return { code: "UNCONFIRMED", label: "Chờ xác nhận", badgeClass: "st-BACKORDER", flatTone: "is-warning" };
    }
    if (matchedShipment && matchedShipment.status) {
      const st = String(matchedShipment.status).toUpperCase();
      if (st === "PENDING_PICKUP") return { code: "PENDING_PICKUP", label: "Chờ lấy hàng", badgeClass: "st-PENDING_PICKUP", flatTone: "is-warning" };
      if (st === "IN_TRANSIT") return { code: "IN_TRANSIT", label: "Đang giao", badgeClass: "st-IN_TRANSIT", flatTone: "is-info" };
      if (st === "DELIVERED") return { code: "DELIVERED", label: "Giao thành công", badgeClass: "st-DELIVERED", flatTone: "is-success" };
      if (st === "FAILED_RETURNING") return { code: "FAILED_RETURNING", label: "Giao thất bại", badgeClass: "st-FAILED_RETURNING", flatTone: "is-error" };
    }
    const carrier = this.resolveOrderCarrier(ord);
    const chUpper = String(ord.channel || "").toUpperCase();
    if (chUpper === "POS" || carrier === "Tại quầy") {
      return { code: "POS_COMPLETED", label: "Hoàn tất tại quầy", badgeClass: "st-ALLOCATED", flatTone: "is-success" };
    }
    if (carrier === "Chưa gán ĐVVC") {
      return { code: "NO_CARRIER", label: "Chờ vận đơn", badgeClass: "st-BACKORDER", flatTone: "is-warning" };
    }
    return { code: "ALLOCATED_READY", label: "Đã giữ hàng", badgeClass: "st-ALLOCATED", flatTone: "is-success" };
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

  syncDashDateFilterLabels() {
    const dateEl = document.getElementById("dashDateFilter");
    if (!dateEl || !dateEl.options) return;
    const now = new Date(Date.now());
    const pad2 = (n) => String(n).padStart(2, "0");
    const todayStr = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;
    const monthStr = `${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;
    Array.from(dateEl.options).forEach((opt) => {
      if (opt.value === "ALL") opt.text = `Tất cả thời gian (đến ${todayStr})`;
      else if (opt.value === "TODAY") opt.text = `Hôm nay (${todayStr})`;
      else if (opt.value === "7D") opt.text = "7 ngày qua";
      else if (opt.value === "MONTH") opt.text = `Tháng ${monthStr}`;
    });
  },

  formatDashOrderDateParts(rawTime) {
    const raw = String(rawTime || "").trim();
    if (!raw) return { compact: "—", full: "—" };
    const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (dmy) {
      const dd = String(dmy[1]).padStart(2, "0");
      const mm = String(dmy[2]).padStart(2, "0");
      const yyyy = dmy[3];
      if (dmy[4] !== undefined && dmy[5] !== undefined) {
        const hh = String(dmy[4]).padStart(2, "0");
        const mi = String(dmy[5]).padStart(2, "0");
        const ss = dmy[6] !== undefined ? String(dmy[6]).padStart(2, "0") : "00";
        return {
          compact: `${dd}.${mm}.${yyyy} · ${hh}:${mi}`,
          full: `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`
        };
      }
      return { compact: `${dd}.${mm}.${yyyy}`, full: `${dd}/${mm}/${yyyy}` };
    }
    const ymd = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (ymd) {
      const yyyy = ymd[1];
      const mm = String(ymd[2]).padStart(2, "0");
      const dd = String(ymd[3]).padStart(2, "0");
      if (ymd[4] !== undefined && ymd[5] !== undefined) {
        const hh = String(ymd[4]).padStart(2, "0");
        const mi = String(ymd[5]).padStart(2, "0");
        const ss = ymd[6] !== undefined ? String(ymd[6]).padStart(2, "0") : "00";
        return {
          compact: `${dd}.${mm}.${yyyy} · ${hh}:${mi}`,
          full: `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`
        };
      }
      return { compact: `${dd}.${mm}.${yyyy}`, full: `${dd}/${mm}/${yyyy}` };
    }
    return { compact: raw, full: raw };
  },

  renderDashboardP2() {
    this.syncDashDateFilterLabels();
    this.syncShipmentsFromEngine();
    const orders = this.getFilteredDashOrders();
    const effectiveInventory = this.getEffectiveInventoryAtNow();
    const validShipments = this.getValidShipmentsUpToNow(orders);

    const syncHintEl = document.getElementById("dashSyncTimestamp");
    if (syncHintEl && window.cloudSync) {
      const rawSyncTime = String(window.cloudSync.lastSyncTime || "").trim();
      const formattedCompact =
        typeof this.formatSettingsSyncTimestamp === "function"
          ? this.formatSettingsSyncTimestamp(rawSyncTime)
          : "Cập nhật: Chưa đồng bộ";
      const shortTimeVal = formattedCompact.replace(/^Cập nhật:\s*/i, "").trim() || "Chưa đồng bộ";
      const isSandbox = Boolean(window.cloudSync.isSandboxMode);
      let sourceNote = "Sổ dữ liệu Google Sheets";
      if (isSandbox) {
        sourceNote = "Chế độ thử nghiệm";
      } else if (/tải từ/i.test(rawSyncTime)) {
        sourceNote = "Đã tải từ Google Sheets";
      } else if (/gửi|google sheets/i.test(rawSyncTime)) {
        sourceNote = "Đã gửi Google Sheets";
      } else if (/máy/i.test(rawSyncTime)) {
        sourceNote = "Lưu trên máy";
      } else if (!/chưa đồng bộ/i.test(shortTimeVal)) {
        sourceNote = "Đã đồng bộ Google Sheets";
      }
      syncHintEl.innerText = formattedCompact;
      syncHintEl.title = `Cập nhật gần nhất: ${shortTimeVal} — ${sourceNote}`;
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
    setTxt("dashKpiTotalOrdersSub", total > 0 ? `${validOrders.length} đơn hợp lệ` : "Chưa có đơn trong kỳ");
    const deltaDotEl = document.getElementById("dashKpiTotalOrdersDelta");
    if (deltaDotEl) {
      const isSandbox = Boolean(window.cloudSync && window.cloudSync.isSandboxMode);
      deltaDotEl.textContent = "";
      deltaDotEl.classList.toggle("is-sandbox", isSandbox);
      const dotTitle = isSandbox ? "Đang ở chế độ thử nghiệm" : "Dữ liệu trực tuyến";
      deltaDotEl.title = dotTitle;
      deltaDotEl.setAttribute("aria-label", dotTitle);
    }

    setTxt("dashKpiPending", pendingTotal.toLocaleString("vi-VN"));
    setHtml(
      "dashKpiPendingSub",
      `<span class="dash-kpi-line">Duyệt: <b>${unconfirmedCount}</b> · Thiếu tồn: <b>${backorderCount}</b></span><span class="dash-kpi-line">Chờ vận đơn: <b>${noCarrierCount}</b></span>`
    );

    setTxt("dashKpiShipping", shippingTotal.toLocaleString("vi-VN"));
    const shippingSubEl = document.getElementById("dashKpiShippingSub");
    if (shippingSubEl) {
      shippingSubEl.innerText = failedReturnCount > 0 ? `Có ${failedReturnCount} đơn cần chú ý` : "Tiến độ giao ổn định";
      shippingSubEl.classList.toggle("is-danger", failedReturnCount > 0);
    }

    setTxt("dashKpiCompleted", completedCount.toLocaleString("vi-VN"));
    const completeRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    setTxt("dashKpiCompletedSub", `Tỷ lệ hoàn tất: ${completeRate}%`);

    const failedNumClass = failedReturnCount > 0 ? "text-danger" : "dash-kpi-zero";
    setHtml("dashKpiCancelReturn", `${cancelledCount} / <span class="${failedNumClass}">${failedReturnCount}</span>`);
    setTxt("dashKpiCancelReturnSub", `Hủy: ${cancelledCount} · Lỗi giao: ${failedReturnCount}`);

    let revFormatted = "0 VND";
    if (estRevenue >= 1e9) {
      revFormatted = `${(estRevenue / 1e9).toFixed(2).replace(".", ",")} Tỷ VND`;
    } else if (estRevenue >= 1e6) {
      revFormatted = `${(estRevenue / 1e6).toFixed(2).replace(".", ",")} Tr VND`;
    } else if (estRevenue > 0) {
      revFormatted = `${estRevenue.toLocaleString("vi-VN")} VND`;
    }
    setTxt("dashKpiEstRevenue", revFormatted);
    setTxt("dashKpiEstRevenueSub", `Trên ${validOrders.length} đơn hợp lệ`);

    setTxt("dashKpiAvailableStock", availStock.toLocaleString("vi-VN"));
    setHtml(
      "dashKpiAvailableStockSub",
      `<span class="dash-kpi-line">${inv.length} mặt hàng</span><span class="dash-kpi-line">${totalPhysical} tồn − ${totalReserved} giữ</span>`
    );
  },

  renderComboTrendChart(orders) {
    const svg = document.getElementById("dashComboTrendSvg");
    if (!svg) return;

    const dateEl = document.getElementById("dashDateFilter");
    const dateVal = dateEl ? dateEl.value : "ALL";
    const rangeNoteEl = document.getElementById("comboChartRangeNote");
    if (rangeNoteEl) {
      rangeNoteEl.innerText = dateVal === "ALL" ? "(6 tháng gần nhất)" : "";
      rangeNoteEl.classList.toggle("hidden", dateVal !== "ALL");
    }

    const plotLeft = 36;
    const plotRight = 442;
    const plotTop = 26;
    const plotBottom = 198;
    const plotH = plotBottom - plotTop;

    // Trạng thái trống (0 đơn hàng): hiển thị gọn gàng theo class CSS Sáng/Tối, tuyệt đối không NaN/Infinity
    if (!Array.isArray(orders) || orders.length === 0) {
      svg.innerHTML = `
        <text x="4" y="14" text-anchor="start" font-size="10.5" font-weight="700" class="dash-svg-axis-label">Số đơn</text>
        <text x="${plotRight + 22}" y="14" text-anchor="end" font-size="10.5" font-weight="700" class="dash-svg-rev-label">Đơn vị: Triệu VND</text>
        <rect x="${plotLeft}" y="${plotTop}" width="${plotRight - plotLeft}" height="${plotH}" rx="0" fill="none" class="dash-svg-empty-frame" stroke-width="1" stroke-dasharray="4 4" />
        <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" class="dash-svg-axis" stroke-width="1" />
        <text x="${plotLeft - 6}" y="${plotBottom + 4}" text-anchor="end" font-size="10" class="dash-svg-axis-label">0</text>
        <text x="${plotRight + 6}" y="${plotBottom + 4}" text-anchor="start" font-size="10" font-weight="700" class="dash-svg-rev-label">0</text>
        <text x="${(plotLeft + plotRight) / 2}" y="${plotTop + plotH / 2 - 4}" text-anchor="middle" font-size="12" font-weight="700" class="dash-svg-empty-title">Chưa có đơn hàng trong khoảng thời gian đang chọn</text>
        <text x="${(plotLeft + plotRight) / 2}" y="${plotTop + plotH / 2 + 14}" text-anchor="middle" font-size="10.5" class="dash-svg-empty-sub">Hãy chọn "Tất cả thời gian" hoặc kỳ khác để xem xu hướng</text>
      `;
      return;
    }

    const pad2 = (n) => String(n).padStart(2, "0");

    // Chuẩn hóa khóa nội bộ YYYY-MM và YYYY-MM-DD cho từng đơn hàng (<= Date.now())
    const orderEntries = orders.map((ord) => {
      const ts = this.getOrderTimestampMs(ord);
      const dt = new Date(ts);
      const yyyy = dt.getFullYear();
      const mm = dt.getMonth() + 1;
      const dd = dt.getDate();
      const mKey = `${yyyy}-${pad2(mm)}`;
      const dKey = `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
      return { ord, ts, yyyy, mm, dd, mKey, dKey };
    });

    const useMonthlyMode = dateVal === "ALL";
    const bucketMap = new Map();

    if (useMonthlyMode) {
      // Khung trượt cố định đúng 6 tháng gần nhất tính lùi từ tháng hiện tại khi mở hệ thống (Date.now())
      const nowDt = new Date(Date.now());
      const anchorY = nowDt.getFullYear();
      const anchorM = nowDt.getMonth() + 1;

      for (let offset = 5; offset >= 0; offset--) {
        const mDate = new Date(anchorY, anchorM - 1 - offset, 1, 0, 0, 0, 0);
        const cy = mDate.getFullYear();
        const cm = mDate.getMonth() + 1;
        const key = `${cy}-${pad2(cm)}`;
        bucketMap.set(key, {
          key,
          label: `${pad2(cm)}/${cy}`,
          fullLabel: `Tháng ${pad2(cm)}/${cy}`,
          received: 0,
          exported: 0,
          revenue: 0,
          ts: mDate.getTime()
        });
      }
    }

    orderEntries.forEach(({ ord, yyyy, mm, dd, mKey, dKey }) => {
      const key = useMonthlyMode ? mKey : dKey;
      if (useMonthlyMode) {
        if (!bucketMap.has(key)) return;
      } else if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          key,
          label: `${pad2(dd)}/${pad2(mm)}`,
          fullLabel: `${pad2(dd)}/${pad2(mm)}/${yyyy}`,
          received: 0,
          exported: 0,
          revenue: 0,
          ts: new Date(yyyy, mm - 1, dd, 0, 0, 0, 0).getTime()
        });
      }
      const b = bucketMap.get(key);
      b.received += 1;
      const isCancelled = ord.status === "CANCELLED" || ord.status === "INVALID" || ord.platformStatus === "CANCELLED";
      if (!isCancelled) {
        b.revenue += (Number(ord.quantity) || 1) * (Number(ord.unitPrice) || 0);
        if (ord.status === "ALLOCATED") {
          b.exported += 1;
        }
      }
    });

    const points = Array.from(bucketMap.values()).sort((a, b) => a.ts - b.ts);

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
      return Number.isInteger(mil) ? mil.toFixed(0) : mil.toFixed(1).replace(".", ",");
    };

    let gridHtml = "";
    for (let i = 0; i <= 4; i++) {
      const y = Number((plotTop + (plotH * i) / 4).toFixed(2));
      const oVal = Math.round(niceMaxOrders * (1 - i / 4));
      const rVal = formatRevAxis(niceMaxRev * (1 - i / 4));
      gridHtml += `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" class="dash-svg-grid" stroke-width="0.9" stroke-dasharray="3 3" />`;
      gridHtml += `<text x="${plotLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" class="dash-svg-axis-label">${oVal}</text>`;
      gridHtml += `<text x="${plotRight + 6}" y="${y + 4}" text-anchor="start" font-size="10" font-weight="700" class="dash-svg-rev-label">${rVal}</text>`;
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
        barsHtml += `<rect x="${(cx - barW - barGap / 2).toFixed(2)}" y="${yRec}" width="${barW}" height="${barRecH}" rx="0" class="dash-svg-rec-bar"><title>${p.fullLabel} · Tiếp nhận: ${p.received} đơn</title></rect>`;
      }
      if (barExpH > 0) {
        barsHtml += `<rect x="${(cx + barGap / 2).toFixed(2)}" y="${yExp}" width="${barW}" height="${barExpH}" rx="0" class="dash-svg-exp-bar"><title>${p.fullLabel} · Xuất đơn: ${p.exported} đơn</title></rect>`;
      }

      if (isSinglePoint) {
        barsHtml += `<text x="${(cx - barW / 2 - barGap / 2).toFixed(2)}" y="${Math.max(plotTop + 10, yRec - 5)}" text-anchor="middle" font-size="10" font-weight="700" class="dash-svg-rec-val">${p.received}</text>`;
        barsHtml += `<text x="${(cx + barW / 2 + barGap / 2).toFixed(2)}" y="${Math.max(plotTop + 10, yExp - 5)}" text-anchor="middle" font-size="10" font-weight="700" class="dash-svg-exp-val">${p.exported}</text>`;
      }

      barsHtml += `<text x="${cx}" y="${plotBottom + 16}" text-anchor="middle" font-size="${labelFontSize}" font-weight="700" class="dash-svg-x-label">${p.label}</text>`;

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
        const revMilNum = (c.rev / 1e6).toFixed(2).replace(".", ",");
        const singleBadge = isSinglePoint
          ? `<text x="${c.x}" y="${Math.max(plotTop - 6, c.y - 10)}" text-anchor="middle" font-size="10.5" font-weight="800" class="dash-svg-rev-badge">Doanh thu: ${revMilNum} Tr VND</text>`
          : "";
        return `${singleBadge}<circle cx="${c.x}" cy="${c.y}" r="${isSinglePoint ? 5.2 : 4.2}" class="dash-svg-rev-dot" stroke-width="2" data-label="${c.label}" data-revenue="${c.rev}" data-received="${c.received}" data-exported="${c.exported}"><title>${c.fullLabel} · Doanh thu: ${c.rev.toLocaleString("vi-VN")} VND (${revMilNum} Tr VND)</title></circle>`;
      })
      .join("");

    svg.innerHTML = `
      <text x="4" y="14" text-anchor="start" font-size="10.5" font-weight="700" class="dash-svg-axis-label">Số đơn</text>
      <text x="${plotRight + 22}" y="14" text-anchor="end" font-size="10.5" font-weight="700" class="dash-svg-rev-label">Đơn vị: Triệu VND</text>
      ${gridHtml}
      <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" class="dash-svg-axis" stroke-width="1" />
      ${barsHtml}
      ${lineCoords.length > 1 ? `<polyline fill="none" class="dash-svg-rev-line" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter" points="${polylineStr}" />` : ""}
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
      { key: "POS", label: "Tại quầy" },
      { key: "FACEBOOK", label: "Facebook" }
    ];

    const listAll = Array.isArray(orders) ? orders : [];
    const activeCh = document.getElementById("dashFilterChannel")?.value || "ALL";
    const stats = channels.map((ch) => {
      const list = listAll.filter((o) => String(o.channel || "").toUpperCase().includes(ch.key));
      const cancelled = list.filter(
        (o) => o.status === "CANCELLED" || o.status === "INVALID" || o.platformStatus === "CANCELLED"
      ).length;
      const allocated = list.filter((o) => o.status === "ALLOCATED" && o.platformStatus !== "CANCELLED").length;
      const pendingOrShortage = Math.max(0, list.length - allocated - cancelled);
      return {
        key: ch.key,
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
        const isActiveCh = activeCh === s.key;
        return `
          <button type="button" class="dash-stacked-col-item${isActiveCh ? " is-active" : ""}" onclick="AppUI.filterDashUrgentByChannel('${s.key}')" title="${s.label}: Tổng ${s.total} đơn (Chờ duyệt / Thiếu tồn: ${s.pendingOrShortage}, Đã giữ hàng / Xuất kho: ${s.allocated}, Hủy đơn: ${s.cancelled}) — Bấm để lọc bảng theo kênh">
            <span class="dash-stacked-total-lbl">${s.total}</span>
            <span class="dash-stacked-bar-track">
              <span class="dash-stacked-seg seg-received" style="height:${pendH}%;"></span>
              <span class="dash-stacked-seg seg-exported" style="height:${allocH}%;"></span>
              <span class="dash-stacked-seg seg-cancelled" style="height:${canH}%;"></span>
            </span>
            <span class="dash-stacked-ch-name">${s.label}</span>
          </button>
        `;
      })
      .join("");
  },

  filterDashUrgentByChannel(channelKey) {
    const chSel = document.getElementById("dashFilterChannel");
    const stSel = document.getElementById("dashFilterStatus");
    const bar = document.getElementById("dashAdvancedFilterBar");
    const toggleBtn = document.getElementById("btnDashAdvFilterToggle");
    if (chSel) {
      chSel.value = chSel.value === channelKey ? "ALL" : channelKey;
    }
    if (stSel && chSel && chSel.value !== "ALL") {
      stSel.value = "ALL";
    }
    if (bar && chSel && chSel.value !== "ALL") {
      bar.classList.remove("hidden");
      if (toggleBtn) toggleBtn.classList.add("is-open");
    }
    this.dashUrgentPage = 1;
    this.dashUrgentSortMode = "DATE_ONLY";
    this.renderDashboardP2();
  },

  openShippingTabFiltered(statusCode) {
    this.shippingStatusFilter = statusCode || "ALL";
    this.currentShippingPage = 1;
    const statusSelect = document.getElementById("shippingStatusFilter");
    if (statusSelect) statusSelect.value = this.shippingStatusFilter;
    this.switchSidebarTab("shipping");
  },

  renderUrgentAlertsAndReturns(orders, effectiveInventory, validShipments) {
    const alertsBox = document.getElementById("dashUrgentAlertsBox");
    const returnBox = document.getElementById("dashReturnCancelStatsBox");

    const lowStockSkus = this.getLowStockInventoryItems(effectiveInventory);
    const shipmentsList = Array.isArray(validShipments) ? validShipments : this.getValidShipmentsUpToNow(orders);

    const failedShipments = shipmentsList.filter((s) => s.status === "FAILED_RETURNING").length;
    const pendingPickupShipments = shipmentsList.filter((s) => s.status === "PENDING_PICKUP").length;
    const backorderCount = orders.filter((o) => o.status === "BACKORDER").length;
    const attentionWaitingCount = pendingPickupShipments + backorderCount;

    const svgWarnTri = `<svg class="dash-alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const svgXCircle = `<svg class="dash-alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    const svgAlertCircle = `<svg class="dash-alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    const svgChevronRight = `<svg class="dash-alert-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

    if (alertsBox) {
      const skuRowsHtml =
        lowStockSkus.length > 0
          ? `<div class="dash-alert-sku-list">` +
            lowStockSkus
              .map((item) => {
                const free = this.getSkuAvailableStock(item);
                const safeSku = this.escapeLogHtml(item.sku);
                return `
                  <div class="dash-alert-sku-row">
                    <span class="dash-alert-sku-info"><b>${safeSku}</b> (Còn: ${free})</span>
                    <button type="button" class="dash-btn-nhap-mini dash-alert-action-btn" onclick="AppUI.quickImportFromDashAlert('${safeSku}')">Nhập</button>
                  </div>
                `;
              })
              .join("") +
            `</div>`
          : `<div class="dash-alert-sku-empty">Tất cả mặt hàng đều đủ tồn kho an toàn (&gt; 5).</div>`;

      alertsBox.innerHTML = `
        <div class="dash-alert-pill warn">
          <div class="dash-alert-pill-top">
            <span class="dash-alert-label-wrap">${svgWarnTri}<span><b>${lowStockSkus.length}</b> sản phẩm sắp hết hàng</span></span>
            <button type="button" class="dash-btn-nhap-mini dash-alert-action-btn" onclick="AppUI.switchSidebarTab('inventory')">Vào Kho</button>
          </div>
          ${skuRowsHtml}
        </div>
        <div class="dash-alert-pill danger is-clickable" onclick="AppUI.openShippingTabFiltered('FAILED_RETURNING')" title="Xem danh sách vận đơn giao thất bại chờ xử lý">
          <div class="dash-alert-pill-top">
            <span class="dash-alert-label-wrap">${svgXCircle}<span><b>${failedShipments}</b> đơn giao thất bại chờ xử lý</span></span>
            ${svgChevronRight}
          </div>
        </div>
        <div class="dash-alert-pill danger is-clickable" onclick="AppUI.filterDashUrgentByStatus('URGENT')" title="Chờ lấy hàng (${pendingPickupShipments}) · Thiếu tồn kho (${backorderCount})">
          <div class="dash-alert-pill-top">
            <span class="dash-alert-label-wrap">${svgAlertCircle}<span><b>${attentionWaitingCount}</b> đơn chờ lấy / thiếu tồn cần xử lý</span></span>
            ${svgChevronRight}
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
          <span class="dash-return-rate-val">${rate}% (${totalIssue}/${total})</span>
        </div>
        <div class="dash-return-progress-bar">
          <div class="dash-return-progress-fill" style="width:${Math.min(100, Number(rate))}%;"></div>
        </div>
        <div class="dash-return-stats-note">
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

    // Cập nhật tiêu đề động & số đếm trên 2 nút chuyển nhanh đầu bảng
    const urgentTotalCount = baseOrders.filter((o) => this.isUrgentOrder(o, shMap.get(String(o.orderId || "").trim()) || null)).length;
    const statusVal = document.getElementById("dashFilterStatus")?.value || "URGENT";
    const tableTitleEl = document.getElementById("dashUrgentTableTitle");
    if (tableTitleEl) {
      tableTitleEl.innerText = statusVal === "URGENT" ? "Đơn hàng cần xử lý gấp" : "Tất cả đơn hàng";
    }
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

    // Phân trang chuẩn 10 dòng / trang đồng bộ Cụm 1–3
    const pageSize = Math.max(1, Number(this.dashUrgentPageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (this.dashUrgentPage > totalPages) this.dashUrgentPage = totalPages;
    if (this.dashUrgentPage < 1) this.dashUrgentPage = 1;

    const startIdx = (this.dashUrgentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    this.syncDashSelectAllCheckbox(pageItems);

    const pagEl = document.getElementById("dashUrgentPagination");
    if (pagEl) {
      const showFrom = filtered.length === 0 ? 0 : startIdx + 1;
      const showTo = filtered.length === 0 ? 0 : Math.min(filtered.length, startIdx + pageItems.length);
      const svgPrev = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
      const svgNext = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;
      const infoText =
        filtered.length === 0
          ? "Hiển thị 0 / 0 đơn hàng"
          : `Hiển thị ${showFrom}–${showTo} / ${filtered.length} đơn hàng`;

      pagEl.innerHTML = `
        <span class="logs-pagination-info">${infoText}</span>
        <div class="settings-segmented-control logs-pagination-ctrl" role="navigation" aria-label="Phân trang đơn hàng Tổng quan">
          <button type="button" class="settings-seg-btn settings-action-icon-btn" ${this.dashUrgentPage <= 1 || filtered.length === 0 ? "disabled" : ""} onclick="AppUI.setDashUrgentPage(${this.dashUrgentPage - 1})" title="Trang trước" aria-label="Trang trước">${svgPrev}</button>
          <span class="logs-pagination-page">Trang ${this.dashUrgentPage} / ${totalPages}</span>
          <button type="button" class="settings-seg-btn settings-action-icon-btn" ${this.dashUrgentPage >= totalPages || filtered.length === 0 ? "disabled" : ""} onclick="AppUI.setDashUrgentPage(${this.dashUrgentPage + 1})" title="Trang sau" aria-label="Trang sau">${svgNext}</button>
        </div>
      `;
    }

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr class="odoms-empty-row">
          <td colspan="9" class="odoms-empty-cell">
            Chưa có đơn hàng nào phù hợp khoảng thời gian hoặc bộ lọc đang chọn.
          </td>
        </tr>
      `;
      return;
    }

    const channelLabelMap = {
      SHOPEE: "Shopee",
      TIKTOK: "TikTok Shop",
      LAZADA: "Lazada",
      POS: "Tại quầy",
      FACEBOOK: "Facebook"
    };

    const svgCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
    const svgPrint = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;
    const svgCancel = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    tbody.innerHTML = pageItems
      .map((ord) => {
        const chKey = Object.keys(channelLabelMap).find((k) => String(ord.channel || "").toUpperCase().includes(k)) || "POS";
        const chName = channelLabelMap[chKey];
        const totalMoney = (Number(ord.quantity) || 1) * (Number(ord.unitPrice) || 0);
        const dateParts = this.formatDashOrderDateParts(ord.orderTime);
        const carrierFull = this.resolveOrderCarrier(ord);
        const carrierShort = this.getShortCarrierLabel(carrierFull);
        const matchedSh = shMap.get(String(ord.orderId || "").trim()) || null;
        const stInfo = this.resolveOrderDisplayStatus(ord, matchedSh);
        const isChecked = this.dashSelectedOrderIds.has(ord.orderId);

        const safeOrderId = this.escapeLogHtml(ord.orderId);
        const safeCustomer = this.escapeLogHtml(ord.customerName || "Khách lẻ");
        const safeCarrierFull = this.escapeLogHtml(carrierFull);
        const safeCarrierShort = this.escapeLogHtml(carrierShort);

        // Nút "Duyệt" chỉ hiện cho đơn Chờ xác nhận; nút "Hủy" luôn giữ thẳng trục dọc (khóa mờ disabled khi không thể hủy)
        const canApprove = stInfo.code === "UNCONFIRMED";
        const canCancel = stInfo.code !== "CANCELLED" && stInfo.code !== "DELIVERED" && stInfo.code !== "POS_COMPLETED";

        const approveBtnHtml = canApprove
          ? `<button type="button" class="settings-seg-btn settings-action-icon-btn dash-act-approve-icon" onclick="AppUI.approveUrgentOrder('${safeOrderId}')" title="Duyệt đơn hàng" aria-label="Duyệt đơn hàng ${safeOrderId}">${svgCheck}</button>`
          : "";
        const printBtnHtml = `<button type="button" class="settings-seg-btn settings-action-icon-btn" onclick="AppUI.printUrgentOrderBill('${safeOrderId}')" title="In phiếu vận đơn A6" aria-label="In phiếu vận đơn A6 cho đơn ${safeOrderId}">${svgPrint}</button>`;
        const cancelBtnHtml = canCancel
          ? `<button type="button" class="settings-seg-btn settings-action-icon-btn dash-act-cancel-icon" onclick="AppUI.cancelUrgentOrder('${safeOrderId}')" title="Hủy đơn hàng" aria-label="Hủy đơn hàng ${safeOrderId}">${svgCancel}</button>`
          : `<button type="button" class="settings-seg-btn settings-action-icon-btn dash-act-cancel-icon" disabled title="Không thể hủy đơn ở trạng thái này" aria-label="Không thể hủy đơn">${svgCancel}</button>`;

        return `
          <tr>
            <td class="col-dash-check">
              <input type="checkbox" ${isChecked ? "checked" : ""} onchange="AppUI.toggleUrgentOrderCheck('${safeOrderId}', this.checked)" aria-label="Chọn đơn hàng ${safeOrderId}" />
            </td>
            <td class="col-dash-orderid"><span class="dash-order-code" title="${safeOrderId}">${safeOrderId}</span></td>
            <td class="col-dash-customer"><span class="dash-cell-customer" title="${safeCustomer}">${safeCustomer}</span></td>
            <td class="col-dash-channel"><span class="dash-cell-channel">${chName}</span></td>
            <td class="col-dash-date"><span class="dash-cell-date" title="${this.escapeLogHtml(dateParts.full)}">${this.escapeLogHtml(dateParts.compact)}</span></td>
            <td class="col-dash-carrier"><span class="dash-cell-carrier" title="${safeCarrierFull}">${safeCarrierShort}</span></td>
            <td class="col-dash-money"><span class="dash-cell-money">${totalMoney.toLocaleString("vi-VN")} VND</span></td>
            <td class="col-dash-status"><span class="odoms-flat-badge ${stInfo.flatTone || "is-info"}">${stInfo.label}</span></td>
            <td class="col-dash-actions">
              <div class="settings-segmented-control dash-action-seg">
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
    const btn = document.getElementById("btnDashAdvFilterToggle");
    if (bar) {
      const isNowHidden = bar.classList.toggle("hidden");
      if (btn) btn.classList.toggle("is-open", !isNowHidden);
    }
  },

  filterDashUrgentByStatus(status) {
    const bar = document.getElementById("dashAdvancedFilterBar");
    const btn = document.getElementById("btnDashAdvFilterToggle");
    const sel = document.getElementById("dashFilterStatus");
    if (bar) bar.classList.remove("hidden");
    if (btn) btn.classList.add("is-open");
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
    const pageSize = Math.max(1, Number(this.dashUrgentPageSize) || 10);
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
    const pageSize = Math.max(1, Number(this.dashUrgentPageSize) || 10);
    const startIdx = (this.dashUrgentPage - 1) * pageSize;
    this.syncDashSelectAllCheckbox(filtered.slice(startIdx, startIdx + pageSize));
  },

  approveUrgentOrder(orderId) {
    if (!window.omsEngine) return;
    const ord = window.omsEngine.orders.find((o) => o.orderId === orderId);
    if (!ord) return;

    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforeStatusText = window.omsEngine.getOrderStatusTextVi(ord);
    const invBefore = window.omsEngine.inventory.find((i) => i.sku === ord.sku);
    const beforeAvail = invBefore ? Number(invBefore.availableStock || 0) : 0;

    ord.platformStatus = "CONFIRMED";
    window.omsEngine.recalculateAllAllocations();

    const ordAfter = window.omsEngine.orders.find((o) => o.orderId === orderId);
    const afterStatusText = window.omsEngine.getOrderStatusTextVi(ordAfter);
    const invAfter = window.omsEngine.inventory.find((i) => i.sku === ord.sku);
    const afterAvail = invAfter ? Number(invAfter.availableStock || 0) : beforeAvail;

    const rec = window.omsEngine.recordReversibleAction({
      actionType: "APPROVE_ORDER",
      actionLabel: "Duyệt đơn hàng",
      targetCode: orderId,
      beforeSummary: `Trạng thái: ${beforeStatusText} · Tồn khả dụng ${ord.sku}: ${beforeAvail}`,
      afterSummary: `Trạng thái: ${afterStatusText} · Tồn khả dụng ${ord.sku}: ${afterAvail}`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

    window.omsEngine.addLog("info", `[TỔNG QUAN] Đã duyệt nhanh đơn hàng #${orderId}.`);
    if (window.cloudSync) window.cloudSync.scheduleCloudPush("DASH_APPROVE_ORDER");
    this.renderAll();
  },

  batchApproveUrgentOrders() {
    if (!window.omsEngine) return;
    if (this.dashSelectedOrderIds.size === 0) {
      alert("Vui lòng tích chọn ít nhất 1 đơn hàng để xử lý hàng loạt.");
      return;
    }

    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforeTotalAvail = (window.omsEngine.inventory || []).reduce((s, it) => s + Number(it.availableStock || 0), 0);

    let count = 0;
    const selectedIds = [];
    this.dashSelectedOrderIds.forEach((id) => {
      const ord = window.omsEngine.orders.find((o) => o.orderId === id);
      if (ord && ord.platformStatus !== "CANCELLED") {
        ord.platformStatus = "CONFIRMED";
        selectedIds.push(id);
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

    if (count > 0) {
      const afterTotalAvail = (window.omsEngine.inventory || []).reduce((s, it) => s + Number(it.availableStock || 0), 0);
      const rec = window.omsEngine.recordReversibleAction({
        actionType: "BATCH_APPROVE_ORDERS",
        actionLabel: "Duyệt đơn hàng loạt",
        targetCode: `${count} đơn`,
        beforeSummary: `${count} đơn chờ xử lý · Tổng tồn khả dụng: ${beforeTotalAvail}`,
        afterSummary: `Đã duyệt ${count} đơn · Tổng tồn khả dụng: ${afterTotalAvail}`,
        beforeSnapshot
      });
      this.onActionDiffRecorded(rec);
    }

    window.omsEngine.addLog("info", `[XỬ LÝ HÀNG LOẠT] Đã duyệt ${count} đơn hàng được chọn từ Tổng quan.`);
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

    const beforeSnapshot = window.omsEngine.captureOperationalSnapshot();
    const beforeStatusText = window.omsEngine.getOrderStatusTextVi(ord);
    const invBefore = window.omsEngine.inventory.find((i) => i.sku === ord.sku);
    const beforeAvail = invBefore ? Number(invBefore.availableStock || 0) : 0;

    ord.platformStatus = "CANCELLED";
    ord.status = "CANCELLED";
    window.omsEngine.recalculateAllAllocations();

    const invAfter = window.omsEngine.inventory.find((i) => i.sku === ord.sku);
    const afterAvail = invAfter ? Number(invAfter.availableStock || 0) : beforeAvail;

    const rec = window.omsEngine.recordReversibleAction({
      actionType: "CANCEL_ORDER",
      actionLabel: "Hủy đơn hàng",
      targetCode: orderId,
      beforeSummary: `Trạng thái: ${beforeStatusText} · Tồn khả dụng ${ord.sku}: ${beforeAvail}`,
      afterSummary: `Trạng thái: Đã hủy · Tồn khả dụng ${ord.sku}: ${afterAvail}`,
      beforeSnapshot
    });
    this.onActionDiffRecorded(rec);

    window.omsEngine.addLog("warn", `[TỔNG QUAN] Đã hủy đơn hàng #${orderId} và hoàn trả tồn kho sẵn sàng bán.`);
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
