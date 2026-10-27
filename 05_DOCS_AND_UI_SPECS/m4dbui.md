# TÀI LIỆU MÔ TẢ & NHẬN XÉT GIAO DIỆN MÀN HÌNH TÌNH HÌNH KINH DOANH (`m4dbui.md`)
**Mã định danh tài liệu:** `m4dbui.md`  
**Đối tượng phân tích:** Giao diện Màn hình **"Tình hình kinh doanh"** (Phân hệ **Bán hàng** — Bố cục Menu Ngang, Thẻ KPI Đa sắc, Biểu đồ Phễu & Bảng Xếp hạng Nhân viên xuất sắc)  
**Lưu trữ tại:** `S:\HTTT\ht\m4dbui.md`  

---

## 1. TỔNG QUAN PHONG CÁCH THIẾT KẾ & BỐ CỤC (UI/UX OVERVIEW)

- **Hệ thống:** MISA AMIS CRM (Phân hệ **Bán hàng**)
- **Màn hình:** Bán hàng > Tổng quan > Tình hình kinh doanh
- **Bộ lọc áp dụng:** Khu vực Diamond | Kỳ: Tháng này
- **Đối tượng sử dụng:** Sales Manager / Quản lý kinh doanh

Qua quan sát hình ảnh giao diện màn hình **"Tình hình kinh doanh"**, đây là màn hình **Dashboard Quản trị Bán hàng & Cơ hội Kinh doanh** (thuộc hệ thống MISA AMIS Bán hàng / CRM) được thiết kế theo lối **Full-Width Workspace (Không gian làm việc toàn chiều ngang)** hiện đại, trực quan và giàu màu sắc.

### Đặc trưng thẩm mỹ & Bảng màu (Color Palette):
- **Kiểu điều hướng:** Sử dụng **Thanh điều hướng ngang 2 tầng ở phía trên (Two-tier Top Horizontal Bar)** thay vì Sidebar dọc bên trái, giúp giải phóng 100% chiều ngang màn hình cho các thẻ chỉ số và biểu đồ.
- **Nền tổng thể:**
  - **Thanh Header & Menu ngang:** Nền trắng (`#FFFFFF`) sạch sẽ, phân tách bằng đường viền mảnh.
  - **Nền vùng làm việc (Workspace):** Xám xanh nhạt (`#EEF0F4` / `#F1F5F9`) giúp các khối thẻ trắng (`#FFFFFF`) tách lớp rõ ràng.
- **Điểm nhấn màu sắc (4 Thẻ KPI nền màu đặc & Biểu đồ Phễu 5 sắc độ):**
  - **Thẻ KPI 1 (Xanh dương Indigo):** `#4F6EF7`
  - **Thẻ KPI 2 (Xanh ngọc lục bảo Emerald):** `#1FC18E`
  - **Thẻ KPI 3 (Cam đất Coral Orange):** `#EE8444`
  - **Thẻ KPI 4 (Tím Violet):** `#7451EB`
  - **Biểu đồ Phễu (Sales Funnel):** Chuyển sắc 5 tầng từ Đỏ san hô (`#EF5350`) ➔ Cam (`#EE8444`) ➔ Vàng cát (`#E6B84F`) ➔ Xanh ngọc (`#1FC18E`) ➔ Xanh lam Cyan (`#17C3E6`).

---

## 2. CHI TIẾT CÁC KHU VỰC TRÊN MÀN HÌNH (`m4dbui.md`)

Giao diện được tổ chức thành **6 khu vực từ trên xuống dưới** rất mạch lạc:

### 2.1. Khu vực 1: Thanh Điều Hướng Đỉnh (Top Global Header - Nền trắng)
- **Góc bên trái:**
  - Biểu tượng **App Switcher** (lưới 9 chấm vuông màu xám đậm).
  - Logo vuông bo góc nền xanh dương (`#0088FF`) có biểu tượng hai bàn tay bắt nhau màu trắng.
  - Tên phân hệ: **`Bán hàng`** (in đậm, màu đen).
- **Chính giữa:**
  - Ô tìm kiếm rộng có nền xám nhạt: **`🔍 Tìm kiếm tiềm năng, liên hệ, khách hàng`**.
- **Cụm biểu tượng tiện ích góc phải (7 thành phần):**
  1. Biểu tượng tròn màu xanh dương (Kênh kết nối xã hội / Facebook).
  2. Biểu tượng khối hộp 3D (Danh mục Hàng hóa / Tiện ích).
  3. Biểu tượng cuốn lịch (Lịch làm việc / Nhắc việc).
  4. Biểu tượng **Chuông thông báo** có huy hiệu tròn màu đỏ hiển thị số **`12`**.
  5. Biểu tượng **Bánh răng** (Thiết lập hệ thống).
  6. Biểu tượng **Dấu hỏi `?`** (Trợ giúp / Hướng dẫn).
  7. **Avatar người dùng** (ảnh chân dung tròn ở ngoài cùng bên phải).

---

### 2.2. Khu vực 2: Thanh Menu Nghiệp Vụ Ngang (Horizontal Navigation Bar - 12 Mục)
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

---

### 2.3. Khu vực 3: Thanh Tiêu Đề Dashboard & Bộ Lọc Tổ Chức (Sub-Header Bar)
- **Bên trái:** Tiêu đề trang lớn **`Tình hình kinh doanh ⌄`** (có mũi tên mở rộng để chuyển đổi giữa các bảng Dashboard).
- **Bên phải:**
  - Ô chọn đơn vị/chi nhánh nền trắng: **`Khu vực Diamond`** kèm biểu tượng sơ đồ cây tổ chức (Hierarchy icon).
  - Nút thao tác mở rộng **`⋯`** (nền trắng, viền xám nhạt).

---

### 2.4. Khu vực 4: Khối "Tổng quan" — 4 Thẻ KPI Nền Màu Đặc (Solid Colored KPI Cards)
Nằm trong một khung thẻ trắng lớn có tiêu đề **`Tổng quan`** `· Tháng này` kèm nút làm mới **`↻`** ở bên trái, và cụm nút cài đặt **`⚙️`** + phóng to **`⛶`** ở góc phải. Bên trong gồm **4 thẻ KPI mang 4 màu nền đặc trưng**:

| STT | Màu nền thẻ | Tên chỉ số KPI | Giá trị chính | Huy hiệu biến động | Chỉ số đối chiếu kỳ trước |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Xanh dương (`#4F6EF7`)** | **SL cơ hội đang thực hiện** | **`325`** | `▲ 26,95%` *(Chữ xanh lá trên nền badge trắng)* | `Tháng trước: 300` |
| **2** | **Xanh ngọc (`#1FC18E`)** | **Doanh số đã thực hiện** | **`359 triệu`** | `▲ 0%` *(Chữ xanh lá trên nền badge trắng)* | `Tháng trước: 359 triệu` |
| **3** | **Cam (`#EE8444`)** | **Doanh số kỳ vọng** | **`825 triệu`** | `▲ 20%` *(Chữ xanh lá trên nền badge trắng)* | `Tháng trước: 683 triệu` |
| **4** | **Tím (`#7451EB`)** | **Tỷ lệ chiến thắng cơ hội** | **`70%`** | `▼ 0,33%` *(Chữ đỏ trên nền badge trắng)* | `Tháng trước: 69,44%` |

---

### 2.5. Khu vực 5: Hàng Phân Tích Chuyên Sâu (Chia 2 Cột: Biểu Đồ Phễu & Nhân Viên Xuất Sắc)

#### A. Khung bên trái (~65% chiều ngang): `Phân tích giá trị cơ hội theo giai đoạn` (Biểu đồ Phễu - Funnel Chart)
- **Tiêu đề chính:** **`Phân tích giá trị cơ hội theo giai đoạn`**
- **Phụ đề:** `Kinh doanh danh nghiệp · Tháng này`
- **Cấu trúc Biểu đồ Phễu 5 giai đoạn bán hàng** (từ miệng phễu rộng nhất ở trên xuống đáy phễu ở dưới, có đường kẻ ngang nối sang chú thích giá trị và tỷ lệ chuyển đổi bên phải):
  1. **Giai đoạn 1 (Màu Đỏ san hô `#EF5350`):** `Tiếp cận và tìm hiểu:` **`528 triệu`**
  2. **Giai đoạn 2 (Màu Cam `#EE8444`):** `Demo và đánh giá:` **`450 triệu (85%)`**
  3. **Giai đoạn 3 (Màu Vàng cát `#E6B84F`):** `Báo giá và thương lượng:` **`334 triệu (74%)`**
  4. **Giai đoạn 4 (Màu Xanh ngọc `#1FC18E`):** `Chốt hợp đồng và bàn giao:` **`289 triệu (86%)`**
  5. **Giai đoạn 5 (Màu Xanh Cyan `#17C3E6` - Đáy phễu):** `Cơ hội chiến thắng:` **`253 triệu (87%)`**

#### B. Khung bên phải (~35% chiều ngang): `Nhân viên xuất sắc` (Bảng vinh danh Top 5 Sales)
- **Tiêu đề chính:** **`Nhân viên xuất sắc`**
- **Phụ đề:** `Công ty cổ phần MISA · Tháng này`
- **Danh sách 5 nhân sự có doanh số cao nhất** (mỗi dòng gồm Ảnh đại diện tròn + Huy chương thứ hạng cho Top 3 + Họ tên + Đơn vị công tác + Số tiền doanh số căn phải):

| Thứ hạng | Họ và tên nhân viên | Đơn vị / Văn phòng | Doanh số đạt được (VNĐ) |
| :--- | :--- | :--- | :--- |
| 🥇 **Hạng 1** *(Huy chương Vàng `1`)* | **Nguyễn Thị Thanh Hà** | `Văn phòng MISA Tp Hồ Chí Minh` | **`450.000.000`** |
| 🥈 **Hạng 2** *(Huy chương Bạc `2`)* | **Kiều Nhật Linh** | `Văn phòng MISA Hà Nội` | **`350.000.000`** |
| 🥉 **Hạng 3** *(Huy chương Đồng `3`)* | **Trần Minh trang** | `Văn phòng MISA Đà Nẵng` | **`320.000.000`** |
| **Hạng 4** | **Phạm Thị Yến** | `Văn phòng MISA Hà Nội` | **`300.000.000`** |
| **Hạng 5** | **Hoàng Ngọc Minh Ánh** | `Văn phòng MISA Hà Nội` | **`280.000.000`** |

---

### 2.6. Khu vực 6: Khung Theo Dõi Hoạt Động Ở Dưới Cùng
- Ở mép dưới màn hình là phần đầu của khung thẻ trắng rộng toàn màn hình:
  - **Bên trái:** Tiêu đề **`Tình hình thực hiện hoạt động`** kèm nút làm mới **`↻`**.
  - **Bên phải:** Nút bánh răng cài đặt **`⚙️`** và nút phóng to **`⛶`**.
  - **Ý nghĩa nghiệp vụ:** Khối biểu đồ/báo cáo nằm ở chân trang phục vụ theo dõi chi tiết các tác vụ và tiến độ thực thi của đội ngũ kinh doanh.

---

## 3. NHẬN XÉT & ĐÁNH GIÁ TỔNG KẾT (`m4dbui.md`)

1. **Tối ưu không gian ngang bằng Menu Ngang 2 tầng:**
   - Khác với bố cục Sidebar dọc của `m3dbui.md`, giao diện `m4dbui.md` đưa toàn bộ 12 danh mục nghiệp vụ (*Tổng quan, Tiềm năng, Chào hàng, Liên hệ, Khách hàng, Cơ hội, Đơn hàng, Báo giá, Hóa đơn, Báo cáo, Chiến dịch, Khác*) lên thanh ngang phía trên, giúp 4 thẻ KPI và biểu đồ phễu có không gian hiển thị rộng rãi, thoáng mắt.
2. **Nhấn mạnh thị giác bằng 4 Thẻ KPI nền màu đặc (Solid Color Blocks):**
   - Mỗi chỉ số cốt lõi được phủ một màu nền riêng biệt (Xanh dương – Xanh ngọc – Cam – Tím) kèm huy hiệu `%` tăng/giảm và số liệu `Tháng trước` ngay bên dưới, giúp phân biệt tức thì 4 nhóm chỉ tiêu mà không bị lẫn lộn.
3. **Trực quan hóa Phễu Chuyển Đổi (Sales Funnel) kết hợp Vinh danh Nhân sự (Gamification):**
   - Cặp biểu đồ **Phễu 5 giai đoạn** (bên trái) và **Top 5 Nhân viên xuất sắc có huy chương 1-2-3** (bên phải) vừa giúp người quản lý kiểm soát tỷ lệ rớt đơn qua từng khâu (từ `528 triệu` xuống `253 triệu`), vừa tạo động lực thi đua cho đội ngũ vận hành/bán hàng.
