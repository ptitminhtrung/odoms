# m4db.md - Báo cáo Phân tích & Mô tả Chi tiết Giao diện Tổng quan Bán hàng (MISA AMIS CRM)
**Mã định danh tài liệu:** `m4db.md` (Đã đồng bộ & bổ sung đầy đủ từ `m4dbui.md`)  
**Lưu trữ tại:** `S:\HTTT\ht\m4db.md`  

---

## 1. Thông tin chung & Phong cách Thiết kế (UI/UX Overview)
- **Hệ thống**: MISA AMIS CRM (Phân hệ **Bán hàng**)
- **Màn hình**: Bán hàng > Tổng quan > Tình hình kinh doanh
- **Bộ lọc áp dụng**: Khu vực Diamond | Kỳ: Tháng này
- **Đối tượng sử dụng**: Sales Manager / Quản lý kinh doanh
- **Đặc trưng bố cục & Bảng màu (Color Palette)**:
  - **Kiểu điều hướng**: Sử dụng **Thanh điều hướng ngang 2 tầng ở phía trên (Two-tier Top Horizontal Bar)** thay vì Sidebar dọc bên trái, giúp giải phóng 100% chiều ngang màn hình cho các thẻ chỉ số và biểu đồ (**Full-Width Workspace**).
  - **Nền tổng thể**:
    - **Thanh Header & Menu ngang**: Nền trắng (`#FFFFFF`) sạch sẽ, phân tách bằng đường viền mảnh.
    - **Nền vùng làm việc (Workspace)**: Xám xanh nhạt (`#EEF0F4` / `#F1F5F9`) giúp các khối thẻ trắng (`#FFFFFF`) tách lớp rõ ràng.
  - **Điểm nhấn màu sắc (4 Thẻ KPI nền màu đặc & Biểu đồ Phễu 5 sắc độ)**:
    - **Thẻ KPI 1 (Xanh dương Indigo)**: `#4F6EF7`
    - **Thẻ KPI 2 (Xanh ngọc lục bảo Emerald)**: `#1FC18E`
    - **Thẻ KPI 3 (Cam đất Coral Orange)**: `#EE8444`
    - **Thẻ KPI 4 (Tím Violet)**: `#7451EB`
    - **Biểu đồ Phễu (Sales Funnel)**: Chuyển sắc 5 tầng từ Đỏ san hô (`#EF5350`) ➔ Cam (`#EE8444`) ➔ Vàng cát (`#E6B84F`) ➔ Xanh ngọc (`#1FC18E`) ➔ Xanh lam Cyan (`#17C3E6`).

---

## 2. Cấu trúc Thanh Điều hướng & Bộ lọc Phía trên

### 2.1. Khu vực 1: Thanh Điều hướng Đỉnh (Top Global Header - Nền trắng)
- **Góc bên trái**:
  - Biểu tượng **App Switcher** (lưới 9 chấm vuông màu xám đậm).
  - Logo vuông bo góc nền xanh dương (`#0088FF`) có biểu tượng hai bàn tay bắt nhau màu trắng.
  - Tên phân hệ: **`Bán hàng`** (in đậm, màu đen).
- **Chính giữa**:
  - Ô tìm kiếm rộng có nền xám nhạt: **`🔍 Tìm kiếm tiềm năng, liên hệ, khách hàng`**.
- **Cụm biểu tượng tiện ích góc phải (7 thành phần)**:
  1. Biểu tượng tròn màu xanh dương (Kênh kết nối xã hội / Facebook).
  2. Biểu tượng khối hộp 3D (Danh mục Hàng hóa / Tiện ích).
  3. Biểu tượng cuốn lịch (Lịch làm việc / Nhắc việc).
  4. Biểu tượng **Chuông thông báo** có huy hiệu tròn màu đỏ hiển thị số **`12`**.
  5. Biểu tượng **Bánh răng** (Thiết lập hệ thống).
  6. Biểu tượng **Dấu hỏi `?`** (Trợ giúp / Hướng dẫn).
  7. **Avatar người dùng** (ảnh chân dung tròn ở ngoài cùng bên phải).

### 2.2. Khu vực 2: Thanh Menu Nghiệp vụ Ngang (Horizontal Navigation Bar - 12 Mục)
Nằm ngay dưới thanh Header đỉnh là dải menu ngang gồm **12 mục chức năng nghiệp vụ bán hàng**, mỗi mục đều có icon mảnh đi kèm:
1. 🏠 **`Tổng quan`** *(Đang chọn Active: chữ và icon màu xanh dương `#2563EB`, có vạch gạch chân xanh dương đậm)*
2. 💡 **`Tiềm năng`**
3. 🧲 **`Chào hàng`**
4. 📇 **`Liên hệ`**
5. 🏢 **`Khách hàng`**
6. 💼 **`Cơ hội`**
7. 🛒 **`Đơn hàng`**
8. 📄 **`Báo giá`**
9. 🧾 **`Hóa đơn`**
10. 🕒 **`Báo cáo`**
11. 📢 **`Chiến dịch`**
12. ☰ **`Khác`**

### 2.3. Khu vực 3: Thanh Tiêu đề Dashboard & Bộ lọc Tổ chức (Sub-Header Bar)
- **Bên trái**: Tiêu đề trang lớn **`Tình hình kinh doanh ⌄`** (có mũi tên mở rộng để chuyển đổi giữa các bảng Dashboard).
- **Bên phải**:
  - Ô chọn đơn vị/chi nhánh nền trắng: **`Khu vực Diamond`** kèm biểu tượng sơ đồ cây tổ chức (Hierarchy icon).
  - Nút thao tác mở rộng **`⋯`** (nền trắng, viền xám nhạt).

---

## 3. Các chỉ số hiệu suất chính (KPIs Tổng quan - Tháng này)
Nằm trong một khung thẻ trắng lớn có tiêu đề **`Tổng quan`** `· Tháng này` kèm nút làm mới **`↻`** ở bên trái, và cụm nút cài đặt **`⚙️`** + phóng to **`⛶`** ở góc phải. Bên trong gồm **4 thẻ KPI mang 4 màu nền đặc trưng**:

| STT | Màu nền thẻ | Tên chỉ số KPI | Giá trị chính | Huy hiệu biến động | Chỉ số đối chiếu kỳ trước |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Xanh dương (`#4F6EF7`)** | **SL cơ hội đang thực hiện** | **`325`** | `▲ 26,95%` *(Tăng `26.95%` - chữ xanh lá trên nền badge trắng)* | `Tháng trước: 300` |
| **2** | **Xanh ngọc (`#1FC18E`)** | **Doanh số đã thực hiện** | **`359 triệu`** | `▲ 0%` *(Tỷ lệ biến động `0%` - chữ xanh lá trên nền badge trắng)* | `Tháng trước: 359 triệu` |
| **3** | **Cam (`#EE8444`)** | **Doanh số kỳ vọng** | **`825 triệu`** | `▲ 20%` *(Tăng `20%` - chữ xanh lá trên nền badge trắng)* | `Tháng trước: 683 triệu` |
| **4** | **Tím (`#7451EB`)** | **Tỷ lệ chiến thắng cơ hội** | **`70%`** | `▼ 0,33%` *(Biến động `0.33%` - hiển thị badge trắng trên thẻ tím)* | `Tháng trước: 69,44%` |

---

## 4. Hàng Phân tích Chuyên sâu (Chia 2 Cột: Biểu đồ Phễu & Nhân viên Xuất sắc)

### 4.1. Khung bên trái (~65% chiều ngang): Phân tích giá trị cơ hội theo giai đoạn (Sales Pipeline / Phễu bán hàng)
- **Tiêu đề chính**: **`Phân tích giá trị cơ hội theo giai đoạn`**
- **Phân khúc / Phụ đề**: `Kinh doanh doanh nghiệp · Tháng này`
- **Cấu trúc Biểu đồ Phễu 5 giai đoạn bán hàng** (từ miệng phễu rộng nhất ở trên xuống đáy phễu ở dưới, có đường kẻ ngang nối sang chú thích giá trị và tỷ lệ chuyển đổi bên phải):
  1. **Giai đoạn 1 (Màu Đỏ san hô `#EF5350`) — Tiếp cận và tìm hiểu**: **`528 triệu`** *(Giai đoạn đầu vào phễu)*
  2. **Giai đoạn 2 (Màu Cam `#EE8444`) — Demo và đánh giá**: **`450 triệu`** *(Tỷ lệ chuyển đổi: `85%`)*
  3. **Giai đoạn 3 (Màu Vàng cát `#E6B84F`) — Báo giá và thương lượng**: **`334 triệu`** *(Tỷ lệ chuyển đổi: `74%`)*
  4. **Giai đoạn 4 (Màu Xanh ngọc `#1FC18E`) — Chốt hợp đồng và bàn giao**: **`289 triệu`** *(Tỷ lệ chuyển đổi: `86%`)*
  5. **Giai đoạn 5 (Màu Xanh Cyan `#17C3E6`) — Cơ hội chiến thắng**: **`253 triệu`** *(Tỷ lệ chuyển đổi: `87%` - Đáy phễu)*

### 4.2. Khung bên phải (~35% chiều ngang): Bảng vinh danh Nhân viên xuất sắc (Tháng này)
- **Tiêu đề chính**: **`Nhân viên xuất sắc`**
- **Đơn vị / Phụ đề**: `Công ty cổ phần MISA · Tháng này`
- **Danh sách Top 5 nhân sự có doanh số cao nhất** (mỗi dòng gồm Ảnh đại diện tròn + Huy chương thứ hạng Vàng/Bạc/Đồng đính ở góc avatar cho Top 3 + Họ và tên + Văn phòng trực thuộc + Doanh số đạt được căn phải):

| Hạng | Huy chương & Avatar | Họ và tên | Văn phòng trực thuộc | Doanh số đạt được (VNĐ) |
| :---: | :--- | :--- | :--- | :---: |
| **1** | 🥇 Ảnh đại diện + Huy chương Vàng số `1` | **Nguyễn Thị Thanh Hà** | Văn phòng MISA Tp. Hồ Chí Minh | **450.000.000** |
| **2** | 🥈 Ảnh đại diện + Huy chương Bạc số `2` | **Kiều Nhật Linh** | Văn phòng MISA Hà Nội | **350.000.000** |
| **3** | 🥉 Ảnh đại diện + Huy chương Đồng số `3` | **Trần Minh Trang** | Văn phòng MISA Đà Nẵng | **320.000.000** |
| **4** | Ảnh đại diện tròn | **Phạm Thị Yến** | Văn phòng MISA Hà Nội | **300.000.000** |
| **5** | Ảnh đại diện tròn | **Hoàng Ngọc Minh Ánh** | Văn phòng MISA Hà Nội | **280.000.000** |

---

## 5. Các khối chức năng liên quan khác (Khu vực Chân trang)
- **Tình hình thực hiện hoạt động**:
  - **Cấu trúc hiển thị**: Khung thẻ trắng rộng toàn màn hình nằm ở chân trang, bên trái có tiêu đề **`Tình hình thực hiện hoạt động`** kèm nút làm mới **`↻`**, bên phải có nút bánh răng cài đặt **`⚙️`** và nút phóng to toàn màn hình **`⛶`**.
  - **Ý nghĩa nghiệp vụ**: Khối biểu đồ/báo cáo nằm ở chân trang phục vụ theo dõi chi tiết các tác vụ và tiến độ thực thi của đội ngũ kinh doanh.

---

## 6. Nhận xét & Đánh giá Tổng kết Thiết kế Giao diện
1. **Tối ưu không gian ngang bằng Menu Ngang 2 tầng**:
   - Đưa toàn bộ 12 danh mục nghiệp vụ (*Tổng quan, Tiềm năng, Chào hàng, Liên hệ, Khách hàng, Cơ hội, Đơn hàng, Báo giá, Hóa đơn, Báo cáo, Chiến dịch, Khác*) lên thanh ngang phía trên, giúp 4 thẻ KPI và biểu đồ phễu có không gian hiển thị rộng rãi, thoáng mắt.
2. **Nhấn mạnh thị giác bằng 4 Thẻ KPI nền màu đặc (Solid Color Blocks)**:
   - Mỗi chỉ số cốt lõi được phủ một màu nền riêng biệt (Xanh dương – Xanh ngọc – Cam – Tím) kèm huy hiệu `%` biến động và số liệu `Tháng trước` ngay bên dưới, giúp Sales Manager / Quản lý kinh doanh phân biệt tức thì 4 nhóm chỉ tiêu mà không bị lẫn lộn.
3. **Trực quan hóa Phễu Chuyển Đổi (Sales Funnel) kết hợp Vinh danh Nhân sự (Gamification)**:
   - Cặp biểu đồ **Phễu 5 giai đoạn** (bên trái) và **Top 5 Nhân viên xuất sắc có huy chương 1-2-3** (bên phải) vừa giúp người quản lý kiểm soát tỷ lệ chuyển đổi qua từng khâu (từ `528 triệu` xuống `253 triệu`), vừa tạo động lực thi đua cho đội ngũ kinh doanh.
