# Hệ thống Quản lý Đơn hàng Đa kênh Thông minh (ODOMS)
## Phiên bản Chuẩn hóa Giao diện & Hỗ trợ Tự động Co giãn Đa thiết bị (PC / Laptop / Tablet / Smartphone) — Lưu tại `S:\HTTT\01_ODOMS_WEB_APP\`

---

### 1. Cách mở và chạy ngay Prototype (Không cần cài đặt Server)
Bạn chỉ cần mở trực tiếp file **[`S:\HTTT\01_ODOMS_WEB_APP\index.html`](file:///S:/HTTT/01_ODOMS_WEB_APP/index.html)** bằng bất kỳ trình duyệt nào (Chrome / Edge / Cốc Cốc / Safari trên điện thoại).

* **Trên máy tính (PC / Laptop):** Giữ nguyên 100% bố cục màn hình rộng chuyên nghiệp với Sidebar cố định, 6 thẻ doanh thu ngang, 4 thẻ KPI, 2 biểu đồ phân tích và bảng điều phối đơn hàng.
* **Trên thiết bị cầm tay (Smartphone / Tablet):** Tự động kích hoạt cơ chế Responsive Layout:
  * Thanh điều hướng Sidebar biến thành **Ngăn kéo trượt (Off-canvas Drawer)** mở ra bằng nút Hamburger (☰) ở Topbar và tự động đóng khi chọn tab.
  * Tích hợp thêm **Thanh điều hướng đáy màn hình (Mobile Bottom Navigation Bar)** giúp chuyển nhanh giữa các phân hệ chính (*Tổng quan, Gom đơn, FIFO, Vận đơn QR, Menu*) bằng ngón tay cái.
  * Các khối thẻ KPI, bảng doanh thu và kênh bán tự động xếp chồng (1 - 2 cột) to rõ, dễ đọc.
  * Toàn bộ bảng dữ liệu và thanh công cụ hỗ trợ vuốt chạm cảm ứng mượt mà (Touch-friendly Horizontal Scroll).

---

### 2. Luồng Trải nghiệm 2 Màn hình Liên hoàn & Quản lý Tài khoản

#### A. Màn hình 1: Cổng Đăng nhập Xác thực (Chuẩn thiết kế `m2wmsgd` / `m2wms.md`)
Khi mở ứng dụng, hệ thống luôn khởi đầu tại **Màn hình Đăng nhập Split-Screen**:
* **Cột trái (Hero & Branding):** Nền Gradient xanh rừng đậm, Logo chiếc lá Greenseven Mart OMS, định danh *"Kho Bình Tân · TP.HCM"* và **3 thẻ tính năng mờ kính (Glassmorphism)**:
  1. *Đồng bộ đơn 5 kênh trực quan* (Shopee, TikTok, Lazada, FB & POS).
  2. *Kiểm soát FIFO & FEFO tự động* (Ai đặt trước giữ hàng trước, ưu tiên xuất lô cận hạn).
  3. *Tra cứu QR & Đối chiếu ATP tức thì* (Trừ tồn khả dụng, chặn bán lố 100%).
* **Cột phải (Authentication Form):** Tích hợp ô nhập Tên đăng nhập, Mật khẩu (có nút icon con mắt ẩn/hiện) và danh sách **Chọn nhanh tài khoản**:
  1. **Tài khoản Quản lý mặc định:**
     * Họ và tên: **Đỗ Thị Thuỳ Dung** *(Avatar: `TD`)*
     * Tên đăng nhập: `dttd` | Mật khẩu: `dttd123`
  2. **Tài khoản Chuyên viên có sẵn (User mới thứ 1):**
     * Họ và tên: **Lê Hoàng Minh Trung** *(Avatar: `MT`)*
     * Tên đăng nhập: `lhmt` | Mật khẩu: `lhmt123`

#### B. Chức năng Thêm Tùy ý User Mới để Truy cập Hệ thống OMS
* Sau khi đăng nhập, ở thanh Sidebar bên trái (nhóm **HỆ THỐNG**), bạn bấm vào mục **"Nhân sự (Thêm User)"**.
* Tại khung **"➕ Thêm Tài Khoản Nhân Sự Mới"**, bạn có thể nhập tùy ý: *Họ và tên*, *Tên đăng nhập*, *Mật khẩu*, *Vai trò*, *Bộ phận*, *Ca làm việc* rồi bấm **"Lưu & Kích Hoạt Tài Khoản Mới"**.
* Hệ thống tự động tạo Avatar viết tắt, lưu trữ tài khoản mới và cho phép bạn bấm **"🔑 Chuyển TK"** hoặc **"Đăng xuất"** ở đáy Sidebar để đăng nhập ngay bằng tài khoản vừa tạo!

---

### 3. Màn hình 2: Tổ chức Chức năng Dashboard OMS (Chuẩn thiết kế `m3wmsgd` / `m3wms.md`)

Thanh điều hướng Sidebar bên trái (`#0D1F12`) được sắp xếp gọn gàng thành 2 nhóm tương đương hoàn toàn với hệ thống WMS mẫu:

1. **Nhóm TỔNG QUAN (Nghiệp vụ vận hành OMS cốt lõi):**
   * **Dashboard:** Trung tâm chỉ huy với Banner trạng thái FIFO/FEFO, 4 thẻ KPI, 2 Biểu đồ thống kê (`Th5/26 – Th10/26` & Biểu đồ Donut), Thanh đồng bộ 5 kênh, Cảnh báo cần xử lý và Bảng điều phối đơn hàng.
   * **Tiếp nhận / Gom đơn:** Khu vực kéo thả hoặc nạp nhanh bảng dữ liệu Excel/CSV từ 5 sàn TMĐT và tải bộ file Excel mẫu `.xlsx` (5 Sheet).
   * **Sơ đồ kệ & Tồn ATP:** Bảng đối chiếu trực quan $\text{Tồn Khả Dụng (ATP)} = \text{Tồn Vật Lý} - \text{Đang Giữ Chỗ}$ kèm vị trí lô kệ.
   * **Kiểm soát FIFO / FEFO:** Theo dõi thứ tự xếp hạng ưu tiên giữ hàng theo từng giây đặt hàng (kèm **Badge màu cam** hiển thị số đơn đã giữ hàng).
   * **Chặn bán lố / Thiếu tồn:** Danh sách các đơn bị ngắt tự động khi hết tồn khả dụng để chống bán âm kho (kèm **Badge màu đỏ** cảnh báo khẩn cấp).
   * **QR / Tra cứu & API:** Công cụ tra cứu nhanh mã QR lô kệ (`GS-POLO-1001`, `GS-TWS-1003`...) và bắn đơn giả lập qua Webhook/API 2 chiều.

2. **Nhóm HỆ THỐNG (Quản trị & Cấu hình):**
   * **Lịch sử đăng nhập:** Bảng Audit Trail ghi vết toàn bộ lịch sử đăng nhập/đăng xuất và Console Log thời gian thực.
   * **Nhân sự (Thêm User):** Quản lý danh sách nhân sự và thêm mới tài khoản truy cập OMS tùy ý.
   * **Báo cáo:** Bảng tổng hợp hiệu suất phân bổ theo 5 kênh và nút xuất file báo cáo đối chiếu `.xlsx`.
   * **Cài đặt:** Cấu hình quy tắc ưu tiên và khôi phục dữ liệu mặc định.

---

### 4. Kịch bản Thuyết trình & Demo 4 Bước FIFO (Trên mã `SP-AO-POLO-01`, Tồn ban đầu = 10 cái)
Bấm nút **`📥 Nạp Bảng Gom 5 Kênh (11 Đơn)`** hoặc **`▶️ Chạy Mô Phỏng FIFO (4 Bước)`** trên thanh Topbar:
1. **FIFO #1 (`08:15:10` - Shopee - `SP261022001`):** Đặt 4 cái $\rightarrow$ Giữ 4 cái (Lô `LO-2026-A1` - Kệ `A1 T1`). Tồn khả dụng còn **6**.
2. **FIFO #2 (`08:16:05` - TikTok Shop - `TT261022101`):** Đặt 4 cái $\rightarrow$ Giữ 4 cái (2 cái Lô `LO-2026-A1` + 2 cái Lô `LO-2026-A2`). Tồn khả dụng còn **2**.
3. **FIFO #3 (`08:17:20` - Cửa hàng POS - `POS261022301`):** Đặt 2 cái $\rightarrow$ Giữ 2 cái cuối (Lô `LO-2026-A2` - Kệ `A1 T2`). Tồn khả dụng về **0**!
4. **FIFO #4 (`08:18:45` - Lazada - `LZ261022201`):** Đặt 3 cái (đến trễ hơn) $\rightarrow$ Tồn khả dụng $= 0 < 3$ $\rightarrow$ Hệ thống tự động chuyển sang **`⚠ Thiếu tồn (Chặn bán lố)`**, bảo vệ kho không bị xuất âm!
5. **Nhập bù giải cứu đơn chờ:** Bấm nút **`➕ Nhập bù +5`** tại cảnh báo hoặc dòng `SP-AO-POLO-01`, hệ thống lập tức cấp 3 cái cho đơn Lazada và cập nhật tồn khả dụng còn **2** đồng bộ lên 5 kênh.
