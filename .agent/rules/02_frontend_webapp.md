---
trigger: glob
globs: 01_ODOMS_WEB_APP/**, **/01_ODOMS_WEB_APP/**
---

# ODOMS — Quy tắc Giao diện & Ứng dụng Web (Tầng 2 — `01_ODOMS_WEB_APP/**`)

Quy tắc này tự động áp dụng khi đọc hoặc chỉnh sửa bất kỳ tệp nào trong `S:\HTTT\01_ODOMS_WEB_APP\` (`index.html`, `css/style.css`, `js/app.js`, `js/oms_engine.js`, `js/mock_data.js`, `js/excel_handler.js`, `du_lieu_mau_excel/*.csv`).

---

## 1. Hệ thống Thiết kế Phẳng Tối giản Góc vuông `0px`

Áp dụng đồng nhất 100% trên toàn bộ màn hình (*Tổng quan, Kho, Tiếp nhận / Gom đơn, Vận đơn, Vận chuyển đơn, Doanh thu, Nhân sự, Báo cáo, Cài đặt, Nhật ký* và mọi hộp thoại Modal):

1. **Góc vuông tuyệt đối (`border-radius: 0px`)**: Không bo góc trên thẻ nghiệp vụ, thẻ KPI, nút bấm, ô nhập liệu, ô chọn, badge trạng thái, thanh lọc, bảng dữ liệu, sidebar, hộp thoại modal và khung biểu đồ.
2. **Không đổ bóng (`box-shadow: none`)**: Tuyệt đối không dùng bóng đổ dưới bất kỳ trạng thái nào (mặc định, `:hover`, `:focus`, `:active`).
3. **Không dùng dải màu chuyển sắc (`gradient`)**: Đặt `background-image: none` cho thẻ, nút, logo, biểu ngữ; chỉ dùng màu nền đơn sắc theo biến chủ đề (`--theme-*`).
4. **Hiệu ứng Hover đồng bộ Sidebar**:
   - Khi rê chuột vào thẻ KPI, thẻ nghiệp vụ, nút phụ, nút lọc hoặc nút phân trang: chỉ đổi **màu nền & màu viền nổi bật đồng bộ đúng với phong cách hover/active của Sidebar** (`--theme-table-row-hover`, `--theme-sidebar-active-bg` / `--theme-primary`; riêng giao diện `[data-theme="vivo"]` dùng nền `#EEF5FF`, viền và chữ `#1877FF`).
   - Tuyệt đối không dùng hiệu ứng nhảy nổi (`transform: translateY(...)` phải giữ `transform: none`) hay đổ bóng phát quang.
5. **Số liệu thẳng cột (`tabular-nums`)**: Toàn bộ số KPI, tiền tệ `VND`, số lượng tồn kho, phần trăm, ngày giờ, phân trang, mã định danh số và địa chỉ mạng truy cập bắt buộc khai báo `font-variant-numeric: tabular-nums`.

---

## 2. Tự động Thích ứng Màn hình Không cần Zoom (Kết hợp Đồng bộ 6 Lớp CSS)

Mọi màn hình ODOMS phải hiển thị sắc nét, cân đối từ laptop phổ thông `1366×768`, `1440×900`, `1536×864` đến màn hình lớn `1920×1080+` và tablet/mobile **mà người dùng không phải thu phóng (zoom) trình duyệt**, bằng cách kết hợp đồng bộ đủ 6 lớp kỹ thuật sau:

1. **Co giãn mượt bằng `clamp()`**:
   - Sử dụng `clamp(min, preferred, max)` cho cỡ chữ (`font-size`), khoảng đệm (`padding`), khoảng cách (`gap`), kích thước nút và chiều rộng tối đa cột bảng (ví dụ: `padding: clamp(11px, 1.05vw, 16px)`, `gap: clamp(6px, 0.7vw, 12px)`).
2. **Thích ứng theo khung chứa thực tế bằng `@container` (`container-type: inline-size` & đơn vị `cqi`)**:
   - Khai báo `container-type: inline-size` trên vùng chứa thẻ KPI (`.dash-7kpi-card`), vùng chứa biểu đồ và khung bảng dữ liệu.
   - Dùng `@container` và đơn vị **`cqi`** (ví dụ: `font-size: clamp(14px, min(1.32vw, 11.4cqi), 21px)`) để cỡ số, thẻ KPI, biểu đồ và bảng co giãn theo **đúng chiều rộng nội dung thực tế còn lại khi có Sidebar**, không bị vỡ chữ khi Sidebar chiếm bề ngang.
3. **Điểm gãy chiều rộng `@media (max-width: ...)` cho Bảng 9 cột & Sidebar**:
   - **Mốc `<= 1440px` và `<= 1366px`**: Thu gọn nhẹ bề rộng Sidebar, giảm khoảng đệm lề khung nội dung (`.wms-content-container`) và khoảng đệm ô bảng (`th`, `td`) để **bảng 9 cột hiển thị trọn vẹn 100% chiều ngang trên laptop 1366px–1440px mà KHÔNG xuất hiện thanh cuộn ngang**.
   - **Mốc `< 1024px` (`<= 1024px`)**: Chuyển Sidebar sang chế độ thu gọn/ngăn kéo trượt trên di động-tablet và **chỉ bật cuộn ngang an toàn (`overflow-x: auto` kèm `min-width`) cho bảng dữ liệu rộng ở dưới mốc `1024px`**.
4. **Nén dọc thông minh bằng `@media (max-height: 800px)`**:
   - Dành riêng cho màn hình laptop chiều cao thấp (`1366×768`): nén nhẹ khoảng đệm trên/dưới (padding/margin), giảm nhẹ `min-height` thẻ KPI, chiều cao khung biểu đồ và thanh công cụ để tổng thể không bị chật hay tràn dọc quá mức.
5. **Định dạng in chuẩn bằng `@media print` cho tính năng "In phiếu"**:
   - Ẩn toàn bộ phần tử điều hướng không thuộc phiếu in (Sidebar, Topbar, nút bấm, thanh lọc, lớp nền tối modal).
   - Giữ định dạng in sắc nét (nền trắng, chữ đen, viền rõ, khổ giấy gọn, `break-inside: avoid` tránh cắt đôi phiếu vận đơn / phiếu xuất kho).
6. **Chống ngắt dòng vụn bằng `white-space: nowrap`**:
   - Bắt buộc áp dụng `white-space: nowrap` cho:
     - Giá trị tiền tệ **`VND`** (ví dụ: `1.250.000 VND`, `0 VND`).
     - **Ngày đặt / mốc thời gian** (`20/11/2026 16:45`).
     - **Nút thao tác ngắn** (*Duyệt*, *In phiếu*, *Hủy*, *Nhập*...) và **badge trạng thái**.
     - **Cụm số đếm ngắn đi kèm nhãn** (như `Thiếu tồn: 0`, `Chờ duyệt: 0`, `Lỗi giao: 0` trong `.dash-kpi-chip` / badge) để không bao giờ bị gãy chữ và số sang hai dòng riêng biệt.

---

## 3. Khóa Thời gian thực `<= Date.now()` Chỉ ở Tầng Hiển thị

- Toàn bộ số liệu tổng hợp hiển thị trên giao diện (*Tổng quan*: 7 thẻ KPI, 2 biểu đồ, cảnh báo, bảng 9 cột, badge đếm trên Sidebar...) bắt buộc lọc dữ liệu theo mốc thời gian thực **`<= Date.now()`** thông qua các hàm tầng hiển thị (`getValidOrdersUpToNow()`, `getValidShipmentsUpToNow()`, `getEffectiveInventoryAtNow()`).
- Với tồn kho hiển thị, phần giữ chỗ (`reservedStock`) thuộc các đơn hàng có thời gian đặt ở tương lai (`> Date.now()`) chỉ được loại trừ ở bản sao tính toán hiển thị (`effectiveReservedStock`, `effectiveAvailableStock`).
- **Tuyệt đối không xóa, cắt bớt hay biến đổi dữ liệu gốc** trong `window.omsEngine.orders`, `window.omsEngine.shipments`, `window.omsEngine.inventory` để bảo toàn trọn vẹn bộ dữ liệu mẫu đến `22/11/2026` (bao gồm kịch bản `SP-AO-POLO-01`) khi đồng bộ và kiểm thử.

---

## 4. Chốt chặn Bảo vệ Chống Race Condition Đẩy Mảng Đơn Rỗng lên Google Sheets

- Giữ nguyên vẹn chốt chặn khởi động (`_bootPushGuardInstalled` & `_initialPullSettled`) trong `AppUI.initCloudSyncPanel()` (tại `js/app.js`) và cơ chế kiểm tra `!window.cloudSync.isPulling` trong `js/oms_engine.js`.
- **Nguyên tắc bắt buộc**:
  - Khi người dùng đăng nhập sớm hoặc có thao tác phát sinh `AUDIT_LOGS_SYNC` / `USERS_RBAC_SYNC` **trước khi `pullStateFromCloud()` (`PULL_ALL`) hoàn tất** trong lúc `window.omsEngine.orders` đang rỗng (`orders.length === 0`), hệ thống chỉ được gọi `saveLocalStateSnapshot()` lưu cục bộ và **tuyệt đối chặn không cho gọi `pushStateToCloud()` (`SYNC_ALL`)** nhằm ngăn việc ghi đè mảng đơn rỗng lên Sổ Google Sheets.
  - Cờ `_initialPullSettled = true` chỉ được bật trong nhánh `.finally()` sau khi tiến trình tải dữ liệu `PULL_ALL` ban đầu kết thúc (hoặc khi tắt đồng bộ tự động).
  - Trong `CloudSyncAdapter`, không bao giờ tự động gọi đẩy dữ liệu (`pushStateToCloud` / `SYNC_ALL`) ngay trong hàm khởi tạo hoặc trong quá trình đang `isPulling`.

---

## 5. Kỷ luật Mã nguồn Trình duyệt & Tương thích `file:///`

- Ứng dụng phải chạy trực tiếp ổn định qua giao thức tệp cục bộ `file:///S:/HTTT/01_ODOMS_WEB_APP/index.html` mà không cần máy chủ build hay thư viện npm.
- Không sử dụng các API bị trình duyệt khóa trên `file:///` (ví dụ `window.crypto.subtle` — khi mã hóa SHA-256 ở Hội thoại #5 bắt buộc viết thuần JavaScript).
- Đảm bảo **0 trùng lặp `id="..."`** trong `index.html`, giữ nguyên tên biến/hàm/ID DOM hiện có và luôn chạy `node S:\HTTT\tools\verify_odoms.js` sau mỗi lần sửa đổi.
