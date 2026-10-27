# HƯỚNG DẪN ĐỔI MÀU GIAO DIỆN TRONG PHẦN CÀI ĐẶT & TÙY CHỈNH MÀU SẮC HỆ THỐNG ODOMS
**Dự án:** Hệ thống Quản lý Đơn hàng Đa kênh Thông minh (`ODOMS`)  
**File giao diện chính:** [`S:\HTTT\01_ODOMS_WEB_APP\index.html`](file:///S:/HTTT/01_ODOMS_WEB_APP/index.html)  
**File CSS chủ đề:** [`S:\HTTT\01_ODOMS_WEB_APP\css\style.css`](file:///S:/HTTT/01_ODOMS_WEB_APP/css/style.css)  
**File điều khiển Theme:** [`S:\HTTT\01_ODOMS_WEB_APP\js\app.js`](file:///S:/HTTT/01_ODOMS_WEB_APP/js/app.js)  

---

## 0. CƠ CHẾ MÀU MẶC ĐỊNH MÀN HÌNH ĐĂNG NHẬP & ĐỔI MÀU TRONG PHẦN CÀI ĐẶT

1. **Màn hình 1 (Giao diện Đăng nhập hệ thống ODOMS):**
   - Được bố trí **căn giữa màn hình** với logo chữ **`OD`** trong khung vuông, tên thương hiệu **`ODOMS`** và dòng mô tả **`Hệ thống quản lý đơn hàng đa kênh thông minh`**.
   - Sử dụng **1 bộ màu mặc định cố định**: **`#0A2947`**, **`#F3E4C9`**, **`#D3D4C0`**, **`#8B5E3C`**.
   - Tích hợp sẵn danh sách **CHỌN NHANH TÀI KHOẢN TRUY CẬP** (`2 tài khoản khả dụng`: **Đỗ Thị Thuỳ Dung** `dttd / dttd123` và **Lê Hoàng Minh Trung** `lhmt / lhmt123`).

2. **Màn hình 2 (Giao diện Thực hiện các Chức năng / Dashboard ODOMS):**
   - Sau khi đăng nhập thành công, người dùng truy cập menu **`HỆ THỐNG` ➔ `Cài đặt`** ở Sidebar bên trái để điều chỉnh màu sắc cho giao diện chức năng (`#settingsThemePickerBar`).
   - Không hiển thị thanh tùy chỉnh màu trên thanh Topbar phía trên để giữ không gian làm việc gọn gàng.

### Danh sách 7 Chủ đề trong phần `Cài đặt` (Mục `Chủ đề` — chỉ hiển thị Tên định danh):
| STT | Tên định danh hiển thị trên giao diện | Mã chủ đề (`data-theme`) | Bảng màu / Cặp màu phối hài hòa | Cặp màu đối kháng trên Biểu đồ (Đơn tiếp nhận vs Xuất giữ hàng) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`Navy`** | `navy` | `#0A2947` (Xanh Navy đậm), `#F3E4C9` (Kem bơ), `#D3D4C0` (Xám lục nhạt), `#8B5E3C` (Nâu gỗ) | `#2563EB` (Xanh Royal) $\leftrightarrow$ `#F97316` (Cam Đỏ Rực) |
| **2** | **`Green`** | `green` | `#14532d`, `#16a34a`, `#f0fdf4`, `#f1f5f9` (Tông Xanh lá) | `#16A34A` (Xanh Lá Ngọc) $\leftrightarrow$ `#E11D48` (Đỏ Hồng Coral) |
| **3** | **`Indigo`** | `indigo` | `#330099`, `#4f46e5`, `#eef2ff`, `#f3f4fc` (Định danh của mã màu `#330099`) | `#4F46E5` (Tím Indigo) $\leftrightarrow$ `#F59E0B` (Vàng Hổ Phách) |
| **4** | **`Retro`** | `retro` | `#000000` (Đen), `#233D4D` (Xanh than), `#FE7F2D` (Cam Retro), `#EAECF0` (Xám sáng) | `#0284C7` (Xanh Đậm) $\leftrightarrow$ `#FE7F2D` (Cam Cháy) |
| **5** | **`Neon`** | `neon` | `#30AFFF` (Xanh lam sáng), `#92EEFF` (Xanh Cyan), `#D8FFC5` (Xanh cốm), `#C4F7CA` (Xanh Mint) | `#0284C7` (Xanh Cyan Đậm) $\leftrightarrow$ `#D946EF` (Tím Hồng Magenta) |
| **6** | **`Sea`** | `sea` | `#3368A0` (Xanh đại dương), `#66A3BF` (Xanh lam), `#C8DFDB` (Xanh ngọc nhạt), `#F2EFE7` (Kem đá) | `#0369A1` (Xanh Đại Dương) $\leftrightarrow$ `#F43F5E` (Đỏ Cam San Hô) |
| **7** | **`Tối`** | `dark` | `#090d16`, `#1e293b`, `#10b981`, `#38bdf8` (Chế độ Tối Dark Mode) | `#10B981` (Xanh Ngọc Lục Bảo) $\leftrightarrow$ `#FB923C` (Cam Vàng Rực) |

---

## 1. NGUYÊN TẮC TỰ CHỈNH SỬA MÃ MÀU TRONG CODE (NẾU MUỐN TỰ ĐỔI THÊM)

Toàn bộ màu sắc của cả **Màn hình Đăng nhập ODOMS** và **Màn hình Thực hiện Chức năng / Dashboard ODOMS** đều nằm tập trung trong một file duy nhất là:
👉 **[`S:\HTTT\01_ODOMS_WEB_APP\css\style.css`](file:///S:/HTTT/01_ODOMS_WEB_APP/css/style.css)**

**Các bước thực hiện:**
1. Mở file `S:\HTTT\01_ODOMS_WEB_APP\css\style.css` bằng **VS Code**, **Notepad++** hoặc **Notepad**.
2. Tìm đến khối chủ đề `[data-theme="..."]` hoặc tên `.class` theo bảng chỉ dẫn bên dưới và thay mã màu Hex bằng mã màu bạn muốn.
3. Nhấn **`Ctrl + S`** để lưu file `style.css`.
4. Quay lại trình duyệt đang mở `index.html` và nhấn **`F5`** (hoặc `Ctrl + R`) để thấy màu mới ngay lập tức!

---

## 2. CẤU TRÚC BIẾN MÀU CHỦ ĐỀ TẠI KHỐI `:root, [data-theme="..."]` (Đầu file `css/style.css`)

Ở ngay đầu file `css/style.css`, hệ thống định nghĩa bộ biến CSS chuẩn cho từng chủ đề của **ODOMS**:

```css
:root,
[data-theme="navy"] {
  --theme-name: "Navy";
  --theme-logo-gradient: linear-gradient(135deg, #8B5E3C 0%, #6b4529 100%);
  --theme-input-bg: #faf6ee;
  --theme-input-border: #c5c6b0;

  --theme-sidebar-bg: #0A2947;          /* Màu nền thanh điều hướng dọc bên trái (Sidebar) */
  --theme-sidebar-card: #12385c;        /* Màu nền khung thông tin người dùng trên Sidebar */
  --theme-sidebar-active-bg: #8B5E3C;   /* Màu nền mục Menu đang chọn */
  --theme-sidebar-active-text: #F3E4C9; /* Màu chữ mục Menu đang chọn */
  --theme-avatar-bg: #F3E4C9;           /* Màu nền vòng tròn Avatar */
  --theme-avatar-text: #0A2947;         /* Màu chữ viết tắt trong Avatar */

  --theme-workspace-bg: #D3D4C0;        /* Màu nền tổng thể vùng làm việc bên phải */
  --theme-topbar-bg: #F3E4C9;           /* Màu nền thanh Topbar trên cùng */
  --theme-card-bg: #fbf7ef;             /* Màu nền các khung thẻ KPI, Biểu đồ, Bảng dữ liệu */
  --theme-card-border: #b8b9a3;         /* Màu viền thẻ */
  --theme-primary: #8B5E3C;             /* Màu nhấn chính (Nút bấm chính, tab active) */
  --theme-primary-hover: #70492d;       /* Màu nút bấm khi di chuột */
  --theme-banner-bg: #F3E4C9;           /* Màu nền Banner trạng thái FIFO/FEFO */
  --theme-banner-border: #8B5E3C;       /* Màu viền Banner trạng thái */
  --theme-banner-text: #0A2947;         /* Màu chữ Banner trạng thái */
}
```

---

## 3. HƯỚNG DẪN ĐỔI MÀU MÀN HÌNH 1: GIAO DIỆN ĐĂNG NHẬP ODOMS (CĂN GIỮA)

| Thành phần muốn đổi màu | Tên Class trong `css/style.css` | Thuộc tính cần sửa |
| :--- | :--- | :--- |
| **1. Màu nền toàn màn hình Đăng nhập** | `.login-centered-backdrop` | Sửa `background: radial-gradient(circle at 50% 25%, #123a63 0%, #0A2947 60%, #06192c 100%);` |
| **2. Màu khung thẻ Đăng nhập chính giữa** | `.login-centered-card` | Sửa `background: #F3E4C9;` và viền `border: 2px solid #8B5E3C;` |
| **3. Màu ô vuông Logo `OD` & Tên `ODOMS`** | `.od-square-lg` & `.login-brand-name` | `.od-square-lg { background: linear-gradient(135deg, #0A2947 0%, #153e66 100%); color: #F3E4C9; }`<br>`.login-brand-name { color: #0A2947; }` |
| **4. Màu ô nhập Username / Password** | `.login-centered-card .login-input` | Nền ô nhập: `background: #ffffff;`<br>Viền: `border: 1.5px solid #D3D4C0;` |
| **5. Màu Nút bấm "Đăng nhập vào ODOMS"** | `.login-centered-card .login-submit-btn` | Màu nút: `background: #8B5E3C; color: #F3E4C9;`<br>Khi rê chuột: `background: #0A2947;` |
| **6. Màu danh sách Chọn nhanh tài khoản** | `.login-centered-card .quick-account-item` | Nền thẻ tài khoản: `background: rgba(255, 255, 255, 0.72);`<br>Viền khi chọn: `border-color: #8B5E3C;` |

---

## 4. HƯỚNG DẪN ĐỔI MÀU MÀN HÌNH 2: TRUNG TÂM ĐIỀU PHỐI & DASHBOARD ODOMS

| Khu vực giao diện | Tên Class / Biến trong `css/style.css` | Mô tả tác dụng |
| :--- | :--- | :--- |
| **Thanh Sidebar bên trái** | `--theme-sidebar-bg`, `.wms-sidebar` | Đổi màu nền thanh điều hướng dọc bên trái. |
| **Thẻ Hồ sơ người dùng (`TD`, `MT`)** | `--theme-sidebar-card`, `.sidebar-user-card` | Đổi màu nền khung thông tin người dùng đang đăng nhập. |
| **Thanh Tiêu đề trên cùng (Topbar)** | `--theme-topbar-bg`, `.wms-topbar` | Đổi màu nền thanh công cụ phía trên cùng. |
| **Nhãn định danh "5 Kênh TMĐT · Real-time ATP"** | `.topbar-location-pill` | Đổi màu nhãn trạng thái kết nối đa kênh trên Topbar. |
| **Banner trạng thái FIFO / Batch FEFO** | `.fefo-status-banner` | Đổi màu thanh thông báo trạng thái kiểm soát đơn hàng và tồn kho khả dụng. |
| **Bảng Tổng Doanh Thu & 5 Kênh bán hàng** | `.revenue-overview-grid`, `.rev-total-highlight`, `.rev-channel-card` | Đổi màu thẻ Tổng doanh thu 1 tháng và 5 thẻ doanh thu từng sàn TMĐT. |
| **4 Thẻ Chỉ số KPI & Khung Card** | `.wms-kpi-card`, `.wms-card` | Đổi màu nền và viền các khung thẻ thống kê, biểu đồ và bảng dữ liệu. |
| **Nhãn nhận diện 5 Kênh Bán Hàng** | `.badge-SHOPEE`, `.badge-TIKTOK`, `.badge-LAZADA`, `.badge-FACEBOOK`, `.badge-POS` | Chỉnh màu sắc riêng biệt cho từng sàn TMĐT và cửa hàng POS. |
| **Phiếu Giao Hàng & Mã Vận Đơn QR** | `.waybill-ticket-preview`, `.wb-ticket-header`, `.wb-qr-box` | Chỉnh kiểu dáng khung xem trước và bản in nhiệt A6 của phiếu vận đơn QR. |
