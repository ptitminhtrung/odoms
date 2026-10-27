# HƯỚNG DẪN ĐỔI MÀU GIAO DIỆN TRONG PHẦN CÀI ĐẶT & TÙY CHỈNH MÀU SẮC HỆ THỐNG ODOMS
**Hội thoại:** `ReOMStqP1`  
**File giao diện chính:** [`S:\HTTT\ht\index.html`](file:///S:/HTTT/ht/index.html)  
**File CSS chủ đề:** [`S:\HTTT\ht\css\style.css`](file:///S:/HTTT/ht/css/style.css)  
**File điều khiển Theme:** [`S:\HTTT\ht\js\app.js`](file:///S:/HTTT/ht/js/app.js)  

---

## 0. CƠ CHẾ MÀU MẶC ĐỊNH MÀN HÌNH ĐĂNG NHẬP & ĐỔI MÀU TRONG PHẦN CÀI ĐẶT

1. **Màn hình 1 (Giao diện Đăng nhập hệ thống ODOMS):**
   - Được bố trí **căn giữa màn hình** với logo chữ **`OD`** trong khung vuông, tên thương hiệu **`ODOMS`** và dòng mô tả **`Hệ thống quản lý đơn hàng đa kênh thông minh`**.
   - Sử dụng **1 bộ màu mặc định cố định**: **`#0A2947`**, **`#F3E4C9`**, **`#D3D4C0`**, **`#8B5E3C`**.
   - Tích hợp sẵn danh sách **CHỌN NHANH TÀI KHOẢN TRUY CẬP** (`2 tài khoản khả dụng`: **Đỗ Thị Thuỳ Dung** `dttd / dttd123` và **Lê Hoàng Minh Trung** `lhmt / lhmt123`).

2. **Màn hình 2 (Giao diện Thực hiện các Chức năng / Dashboard):**
   - Sau khi đăng nhập thành công, người dùng truy cập menu **`HỆ THỐNG` ➔ `Cài đặt`** ở Sidebar bên trái để điều chỉnh màu sắc cho giao diện chức năng (`#settingsThemePickerBar`).
   - Không hiển thị thanh tùy chỉnh màu trên thanh Topbar phía trên để giữ không gian làm việc gọn gàng.

### Danh sách 7 Chủ đề trong phần `Cài đặt` (Mục `Chủ đề` — chỉ hiển thị Tên định danh):
| STT | Tên định danh hiển thị trên giao diện | Mã chủ đề (`data-theme`) | Bảng màu / Cặp màu phối hài hòa |
| :--- | :--- | :--- | :--- |
| **1** | **`Navy`** | `navy` | `#0A2947` (Xanh Navy đậm), `#F3E4C9` (Kem bơ), `#D3D4C0` (Xám lục nhạt), `#8B5E3C` (Nâu gỗ) |
| **2** | **`Green`** | `green` | `#14532d`, `#16a34a`, `#f0fdf4`, `#f1f5f9` (Tông Xanh lá) |
| **3** | **`Indigo`** | `indigo` | `#330099`, `#4f46e5`, `#eef2ff`, `#f3f4fc` (Định danh của mã màu `#330099`) |
| **4** | **`Retro`** | `retro` | `#000000` (Đen), `#233D4D` (Xanh than), `#FE7F2D` (Cam Retro), `#EAECF0` (Xám sáng) |
| **5** | **`Neon`** | `neon` | `#30AFFF` (Xanh lam sáng), `#92EEFF` (Xanh Cyan), `#D8FFC5` (Xanh cốm), `#C4F7CA` (Xanh Mint) |
| **6** | **`Sea`** | `sea` | `#3368A0` (Xanh đại dương), `#66A3BF` (Xanh lam), `#C8DFDB` (Xanh ngọc nhạt), `#F2EFE7` (Kem đá) |
| **7** | **`Tối`** | `dark` | `#090d16`, `#1e293b`, `#10b981`, `#38bdf8` (Chế độ Tối Dark Mode) |

---

## 1. NGUYÊN TẮC TỰ CHỈNH SỬA MÃ MÀU TRONG CODE (NẾU MUỐN TỰ ĐỔI THÊM)

Toàn bộ màu sắc của cả **Màn hình Đăng nhập (`m2wmsgd`)** và **Màn hình Thực hiện Chức năng / Dashboard (`m3wmsgd`)** đều nằm tập trung trong một file duy nhất là:
👉 **[`S:\HTTT\ht\css\style.css`](file:///S:/HTTT/ht/css/style.css)**

**Các bước thực hiện:**
1. Mở file `S:\HTTT\ht\css\style.css` bằng **VS Code**, **Notepad++** hoặc **Notepad**.
2. Tìm đến đúng dòng hoặc tên `.class` theo bảng chỉ dẫn bên dưới và thay mã màu Hex (ví dụ `#16a34a`) bằng mã màu bạn muốn.
3. Nhấn **`Ctrl + S`** để lưu file `style.css`.
4. Quay lại trình duyệt đang mở `index.html` và nhấn **`F5`** (hoặc `Ctrl + R`) để thấy màu mới ngay lập tức!

---

## 2. ĐỔI NHANH TOÀN BỘ TÔNG MÀU CHUNG TẠI KHỐI `:root` (Dòng 6 – 28)

Ở ngay đầu file `css/style.css` (từ dòng 6 đến dòng 28), hệ thống đã gom các biến màu toàn cục trong khối `:root`:

```css
:root {
  --wms-sidebar-bg: #0d1f12;       /* 1. Màu nền thanh Menu dọc bên trái (Sidebar) */
  --wms-sidebar-card: #162e1c;     /* 2. Màu nền khung Avatar/Tên người dùng trên Sidebar */
  --wms-sidebar-active: #214d2b;   /* 3. Màu nền của mục Menu đang được bấm chọn */
  --wms-primary: #16a34a;          /* 4. Màu thương hiệu chính */
  --wms-primary-dark: #15803d;     /* 5. Màu thương hiệu đậm */
  --wms-primary-light: #dcfce7;    /* 6. Màu nền nhạt của các nhãn xanh */
  --wms-accent-lime: #65c434;      /* 7. Màu xanh chuối sáng tạo điểm nhấn */
  --bg-workspace: #f3f6f4;         /* 8. MÀU NỀN TỔNG THỂ của vùng làm việc bên phải */
  --bg-card: #ffffff;              /* 9. Màu nền của các khung thẻ trắng (KPI, Bảng, Biểu đồ) */
  --text-main: #0f172a;            /* 10. Màu chữ chính (đen đậm) */
  --text-secondary: #334155;       /* 11. Màu chữ phụ */
  --text-muted: #64748b;           /* 12. Màu chữ chú thích mờ (xám) */
  --danger: #ef4444;               /* 13. Màu đỏ cảnh báo khẩn cấp / chặn bán lố */
  --warning: #f59e0b;              /* 14. Màu cam cảnh báo */
}
```

---

## 3. HƯỚNG DẪN ĐỔI MÀU MÀN HÌNH 1: GIAO DIỆN ĐĂNG NHẬP (`m2wmsgd`)

| Thành phần muốn đổi màu | Tên Class trong `css/style.css` | Vị trí dòng | Thuộc tính cần sửa & Ví dụ |
| :--- | :--- | :---: | :--- |
| **1. Màu nền Cột Trái (Nền tối Hero)** | `.login-screen-wrapper` | Dòng `53–60` | Sửa `background: radial-gradient(...)`.<br>*Ví dụ đổi sang xanh dương đậm:*<br>`background: radial-gradient(circle at 25% 30%, #1e3a8a 0%, #0f172a 55%, #020617 100%);` |
| **2. Màu ô vuông Logo lớn (Cột trái)** | `.hero-logo-squircle` | Dòng `80–90` | Sửa `background: linear-gradient(135deg, #65c434 0%, #3ca61e 100%);` |
| **3. Màu chữ "Greenseven" & "Mart OMS"** | `.hero-title` & `.hero-title span` | Dòng `92–103` | `.hero-title { color: #ffffff; }` (chữ Greenseven)<br>`.hero-title span { color: #65c434; }` (chữ Mart OMS) |
| **4. Màu nền 3 thẻ tính năng mờ kính** | `.hero-feature-card` | Dòng `127–138` | Sửa `background: rgba(255, 255, 255, 0.055);` và viền `border: 1px solid rgba(255, 255, 255, 0.11);` |
| **5. Màu icon trong 3 thẻ tính năng** | `.hero-feature-icon` | Dòng `145–154` | Sửa `color: #65c434;` |
| **6. Màu nền Cột Phải (Khung chứa Form)** | `.login-form-pane` | Dòng `169–179` | Sửa `background: radial-gradient(circle at 0% 0%, #e4f5dc 0%, #ffffff 42%, #ffffff 100%);`<br>*(Đổi `#e4f5dc` thành `#ffffff` nếu muốn nền trắng hoàn toàn)* |
| **7. Màu Logo nhỏ & Tên thương hiệu trên Form** | `.login-mini-logo` & `.login-mini-brand-text h3` | Dòng `194–212` | `.login-mini-logo { background: #65c434; }`<br>`.login-mini-brand-text h3 { color: #216e14; }` |
| **8. Màu nền & viền ô nhập Username/Pass** | `.login-input` & `.login-input:focus` | Dòng `250–266` | Nền ô nhập: `background: #f8faf9;`<br>Viền khi click vào: `border-color: #2e8b1a;` |
| **9. Màu Nút bấm "Đăng nhập"** | `.login-submit-btn` & `.login-submit-btn:hover` | Dòng `296–317` | Màu nút bình thường: `background: #2f8a17;`<br>Màu khi di chuột vào: `background: #257011;` |

---

## 4. HƯỚNG DẪN ĐỔI MÀU MÀN HÌNH 2: GIAO DIỆN CHỨC NĂNG / DASHBOARD (`m3wmsgd`)

### A. Khu vực Thanh Menu dọc bên trái (Sidebar)
| Thành phần muốn đổi màu | Tên Class trong `css/style.css` | Vị trí dòng | Thuộc tính cần sửa |
| :--- | :--- | :---: | :--- |
| **Màu nền toàn bộ thanh Sidebar trái** | `:root` $\rightarrow$ `--wms-sidebar-bg` (hoặc `.wms-sidebar`) | Dòng `7` (hoặc `417`) | Đổi `#0d1f12` sang màu khác (VD: `#0f172a` cho màu xanh đen Slate). |
| **Màu khung User (Đỗ Thị Thuỳ Dung)** | `:root` $\rightarrow$ `--wms-sidebar-card` (hoặc `.sidebar-user-card`) | Dòng `8` (hoặc `458`) | Đổi `#162e1c` sang màu nền thẻ user mong muốn. |
| **Màu vòng tròn Avatar (`TD`, `MT`)** | `.user-avatar-circle` | Dòng `476–488` | Nền vòng tròn: `background: #e2f2e6;`<br>Màu chữ viết tắt: `color: #0d1f12;` |
| **Màu mục Menu đang chọn (Active)** | `.sidebar-menu-item.active` | Dòng `563–567` | Màu nền mục đang chọn: `background: var(--wms-sidebar-active);`<br>Màu chữ mục đang chọn: `color: #76e043;` |

### B. Khu vực Thanh Tiêu đề trên cùng (Topbar) & Banner Trạng thái
| Thành phần muốn đổi màu | Tên Class trong `css/style.css` | Vị trí dòng | Thuộc tính cần sửa |
| :--- | :--- | :---: | :--- |
| **Màu nền thanh Topbar trên cùng** | `.wms-topbar` | Dòng `638–649` | `background: #ffffff;` |
| **Màu nhãn vị trí "Kho Bình Tân"** | `.topbar-location-pill` | Dòng `663–671` | Nền: `background: #e8f7e4;` · Chữ: `color: #216e14;` · Viền: `border: 1px solid #b7e4ab;` |
| **Màu Banner trạng thái FIFO/FEFO** | `.fefo-status-banner` | Dòng `708–720` | Nền: `background: #eef9ec;` · Viền: `border: 1px solid #b6e3ab;` · Chữ: `color: #1f5f14;` |

### C. Khu vực Vùng làm việc chính, Thẻ KPI, Nút bấm & Bảng dữ liệu
| Thành phần muốn đổi màu | Tên Class trong `css/style.css` | Vị trí dòng | Thuộc tính cần sửa |
| :--- | :--- | :---: | :--- |
| **Màu nền tổng thể vùng làm việc bên phải** | `:root` $\rightarrow$ `--bg-workspace` | Dòng `14` | Mặc định `#f3f6f4` (xám xanh nhạt). Đổi thành `#f1f5f9` hoặc `#eef2ff` tùy thích. |
| **Màu nền 4 Thẻ KPI & Các khung Card lớn** | `.wms-kpi-card` & `.wms-card` | Dòng `743` & `828` | `background: #ffffff;` |
| **Màu hộp Icon trên 4 Thẻ KPI** | `.kpi-icon-box.green`, `.red`, `.orange` | Dòng `779–792` | Sửa `background` và `color` của từng hộp icon. |
| **Màu các Nút hành động chính (Màu xanh)** | `.btn-primary` & `.btn-primary:hover` | Dòng `1074–1078` | Nền nút: `background: #2f8a17;` · Khi rê chuột: `background: #246d11;` |
| **Màu Nút "Chạy Mô Phỏng FIFO" (Màu cam)**| `.btn-warning` | Dòng `1080–1084` | Nền nút: `background: #f59e0b;` |
| **Màu Nút Tab bộ lọc đang chọn** | `.tab-btn.active` | Dòng `966–970` | `background: #2f8a17; color: #ffffff;` |
| **Màu tiêu đề cột của Bảng dữ liệu** | `.wms-table th` | Dòng `983–993` | Nền tiêu đề bảng: `background: #f8faf9;` · Chữ: `color: #475569;` |
| **Màu nhãn của 5 Sàn TMĐT** | `.badge-SHOPEE`, `.badge-TIKTOK`, `.badge-LAZADA`, `.badge-FACEBOOK`, `.badge-POS` | Dòng `1015–1019` | Chỉnh `background`, `color` và `border` riêng cho từng sàn. |
| **Màu khung Nhật ký Console Log dưới đáy** | `.log-console` | Dòng `1144–1156` | Nền khung đen: `background: #0d1f12;` · Chữ: `color: #e2e8f0;` |

---

## 5. GỢI Ý 2 BỘ MÀU MẪU ĐẸP MẮT (CHỈ CẦN COPY - PASTE)

Nếu bạn muốn đổi sang tông màu khác cho toàn bộ hệ thống một cách nhanh nhất, bạn có thể thử thay thế các giá trị sau:

### Bộ mẫu 1: Tông Xanh Dương Công Nghệ (Enterprise Royal Blue)
* `:root` (Dòng 6–15):
  * `--wms-sidebar-bg: #0f172a;`
  * `--wms-sidebar-card: #1e293b;`
  * `--wms-sidebar-active: #1d4ed8;`
  * `--bg-workspace: #f1f5f9;`
* Màn hình đăng nhập `.login-screen-wrapper` (Dòng 57):
  * `background: radial-gradient(circle at 25% 30%, #1e3a8a 0%, #0f172a 55%, #020617 100%);`
* Nút bấm `.login-submit-btn` (Dòng 299) & `.btn-primary` (Dòng 1075):
  * `background: #2563eb;`

### Bộ mẫu 2: Tông Tím Indigo Hiện Đại (Modern SaaS Indigo)
* `:root` (Dòng 6–15):
  * `--wms-sidebar-bg: #1e1b4b;`
  * `--wms-sidebar-card: #312e81;`
  * `--wms-sidebar-active: #4338ca;`
  * `--bg-workspace: #f5f3ff;`
* Màn hình đăng nhập `.login-screen-wrapper` (Dòng 57):
  * `background: radial-gradient(circle at 25% 30%, #3730a3 0%, #1e1b4b 55%, #0f0e26 100%);`
* Nút bấm `.login-submit-btn` (Dòng 299) & `.btn-primary` (Dòng 1075):
  * `background: #4f46e5;`
