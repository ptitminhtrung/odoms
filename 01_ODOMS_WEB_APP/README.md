# Hệ thống Quản lý Đơn hàng Đa kênh Thông minh (ODOMS)
## Phiên bản Chuẩn hóa Giao diện & Hỗ trợ Tự động Co giãn Đa thiết bị (PC / Laptop / Tablet / Smartphone) — Lưu tại `S:\HTTT\01_ODOMS_WEB_APP\`

---

### 1. Cách mở và chạy ngay Prototype (Không cần cài đặt Server)
Bạn chỉ cần mở trực tiếp file **[`S:\HTTT\01_ODOMS_WEB_APP\index.html`](file:///S:/HTTT/01_ODOMS_WEB_APP/index.html)** bằng bất kỳ trình duyệt nào (Chrome / Edge / Cốc Cốc / Safari trên điện thoại).

* **Trên máy tính (PC / Laptop):** Giữ nguyên 100% bố cục màn hình rộng chuyên nghiệp với Sidebar cố định, dải 6 thẻ doanh thu ngang (Tổng doanh thu + 5 kênh bán hàng), 4 thẻ KPI, bộ biểu đồ phân tích doanh thu - sản lượng và bảng điều phối đơn hàng.
* **Trên thiết bị cầm tay (Smartphone / Tablet):** Tự động kích hoạt cơ chế Responsive Layout:
  * Thanh điều hướng Sidebar biến thành **Ngăn kéo trượt (Off-canvas Drawer)** mở ra bằng nút Hamburger (☰) ở Topbar và tự động đóng khi chọn tab.
  * Tích hợp thêm **Thanh điều hướng đáy màn hình (Mobile Bottom Navigation Bar)** giúp chuyển nhanh giữa các phân hệ chính (*Tổng quan, Gom đơn, FIFO, Vận đơn QR, Menu*) bằng ngón tay cái.
  * Các khối thẻ KPI, bảng doanh thu và kênh bán tự động xếp chồng (1 - 2 cột) to rõ, dễ đọc.
  * Toàn bộ bảng dữ liệu và thanh công cụ hỗ trợ vuốt chạm cảm ứng mượt mà (Touch-friendly Horizontal Scroll).

---

### 2. Luồng Trải nghiệm 2 Màn hình Liên hoàn & Quản lý Tài khoản

#### A. Màn hình 1: Cổng Đăng nhập Xác thực Hệ thống ODOMS
Khi mở ứng dụng, hệ thống luôn khởi đầu tại **Màn hình Đăng nhập Căn giữa (Centered Login Card)**:
* **Thiết kế Nhận diện Thương hiệu ODOMS:** Sử dụng bộ màu mặc định đặc trưng (`#0A2947`, `#F3E4C9`, `#D3D4C0`, `#8B5E3C`), biểu tượng chữ **`OD`** trong khung vuông bo góc, tên hệ thống **`ODOMS`** và định danh *"Hệ thống quản lý đơn hàng đa kênh thông minh"*.
* **Form Xác thực & Chọn nhanh Tài khoản:** Tích hợp ô nhập Tên đăng nhập, Mật khẩu (có nút icon con mắt ẩn/hiện) và danh sách **Chọn nhanh tài khoản truy cập**:
  1. **Tài khoản Quản lý Điều phối mặc định:**
     * Họ và tên: **Đỗ Thị Thuỳ Dung** *(Avatar: `TD`)*
     * Tên đăng nhập: `dttd` | Mật khẩu: `dttd123`
  2. **Tài khoản Chuyên viên Vận hành:**
     * Họ và tên: **Lê Hoàng Minh Trung** *(Avatar: `MT`)*
     * Tên đăng nhập: `lhmt` | Mật khẩu: `lhmt123`

#### B. Chức năng Thêm Tùy ý User Mới để Truy cập Hệ thống ODOMS
* Sau khi đăng nhập, ở thanh Sidebar bên trái (nhóm **HỆ THỐNG**), bạn bấm vào mục **"Nhân sự (Thêm User)"**.
* Tại khung **"➕ Thêm Tài Khoản Nhân Sự Mới"**, bạn có thể nhập tùy ý: *Họ và tên*, *Tên đăng nhập*, *Mật khẩu*, *Vai trò*, *Bộ phận*, *Ca làm việc* rồi bấm **"Lưu & Kích Hoạt Tài Khoản Mới"**.
* Hệ thống tự động tạo Avatar viết tắt, lưu trữ tài khoản mới và cho phép bạn bấm **"🔑 Chuyển TK"** hoặc **"Đăng xuất"** ở đáy Sidebar để đăng nhập ngay bằng tài khoản vừa tạo!

---

### 3. Màn hình 2: Tổ chức Chức năng Trung tâm Điều phối ODOMS

Thanh điều hướng Sidebar bên trái được sắp xếp khoa học thành 2 nhóm nghiệp vụ chuyên biệt của hệ thống **ODOMS**:

1. **Nhóm TỔNG QUAN (Nghiệp vụ Quản lý Đơn hàng Đa kênh & Phân bổ Lô hàng Batch FEFO):**
   * **Dashboard:** Trung tâm chỉ huy với Banner trạng thái FIFO/FEFO, Bảng Tổng Doanh Thu & Doanh Thu 5 Kênh (1 tháng), 4 thẻ KPI, Biểu đồ Tiếp nhận đơn / Xuất giữ hàng theo tháng (2 màu đối kháng), Biểu đồ Cột + Doanh thu Top 3 kênh bán hàng, Biểu đồ Cột 3 tháng tùy chọn kèm bộ lọc ngày và Bảng Xếp hạng các kênh bán hàng nhiều đơn nhất theo tháng.
   * **Tiếp nhận / Gom đơn:** Khu vực kéo thả hoặc nạp nhanh bảng dữ liệu Excel/CSV từ 5 sàn TMĐT và tải bộ file Excel mẫu `.xlsx` (5 Sheet).
   * **Kho:** Quản lý tồn kho thực tế, đối chiếu tồn khả dụng ATP, tích hợp cảnh báo đơn thiếu tồn/chặn bán lố và nút nhập bù kho tức thì (kèm **Badge màu đỏ** hiển thị số đơn cần nhập bù).
   * **Kiểm soát FIFO / FEFO:** Theo dõi thứ tự xếp hạng ưu tiên giữ hàng theo từng giây đặt hàng (kèm **Badge màu cam** hiển thị số đơn đã giữ hàng).
   * **QR / Tra cứu & API:** Công cụ tạo mã vận đơn (`VD-ODOMS-...`), in mã QR đơn hàng kèm phiếu giao hàng chuẩn A6, tra cứu mã QR định danh lô (`OD-POLO-1001`, `OD-TWS-1003`...) và bắn đơn giả lập qua Webhook/API 2 chiều.

2. **Nhóm HỆ THỐNG (Quản trị & Cấu hình):**
   * **Lịch sử đăng nhập:** Bảng Audit Trail ghi vết toàn bộ lịch sử đăng nhập/đăng xuất và Console Log thời gian thực.
   * **Nhân sự (Thêm User):** Quản lý danh sách nhân sự và thêm mới tài khoản truy cập ODOMS tùy ý.
   * **Báo cáo:** Bảng tổng hợp hiệu suất phân bổ theo 5 kênh và nút xuất file báo cáo đối chiếu `.xlsx`.
   * **Cài đặt:** Đổi chủ đề màu sắc giao diện chức năng (7 chủ đề: *Navy, Green, Indigo, Retro, Neon, Sea, Tối*), cấu hình quy tắc ưu tiên và khôi phục dữ liệu mặc định.

---

### 4. Kịch bản Thuyết trình & Demo 4 Bước FIFO (Trên mã `SP-AO-POLO-01`, Tồn ban đầu = 10 cái)
Bấm nút **`📥 Nạp Bảng Gom 5 Kênh (11 Đơn)`** hoặc **`▶️ Chạy Mô Phỏng FIFO (4 Bước)`** trên thanh Topbar:
1. **FIFO #1 (`08:15:10` - Shopee - `SP261022001`):** Đặt 4 cái $\rightarrow$ Giữ 4 cái (Lô `LO-2026-A1`). Tồn khả dụng còn **6**.
2. **FIFO #2 (`08:16:05` - TikTok Shop - `TT261022101`):** Đặt 4 cái $\rightarrow$ Giữ 4 cái (2 cái Lô `LO-2026-A1` + 2 cái Lô `LO-2026-A2`). Tồn khả dụng còn **2**.
3. **FIFO #3 (`08:17:20` - Cửa hàng POS - `POS261022301`):** Đặt 2 cái $\rightarrow$ Giữ 2 cái cuối (Lô `LO-2026-A2`). Tồn khả dụng về **0**!
4. **FIFO #4 (`08:18:45` - Lazada - `LZ261022201`):** Đặt 3 cái (đến trễ hơn) $\rightarrow$ Tồn khả dụng $= 0 < 3$ $\rightarrow$ Hệ thống tự động chuyển sang **`⚠ Thiếu tồn (Chặn bán lố)`**, bảo vệ hệ thống không bị xuất âm!
5. **Nhập bù giải cứu đơn chờ:** Bấm nút **`➕ Nhập bù +5`** tại cảnh báo hoặc dòng `SP-AO-POLO-01`, hệ thống lập tức cấp 3 cái cho đơn Lazada và cập nhật tồn khả dụng còn **2** đồng bộ lên 5 kênh.
