# TÀI LIỆU MÔ TẢ & NHẬN XÉT GIAO DIỆN MÀN HÌNH TÌNH HÌNH KINH DOANH & QUẢN LÝ ĐỘI NGŨ SALES (`m5dbui.md`)
**Mã định danh tài liệu:** `m5dbui.md`  
**Đối tượng phân tích:** Giao diện **"Tình hình thực hiện chỉ tiêu doanh số & Quản lý đội ngũ sales"** (Hệ thống **MISA AMIS CRM**)  
**Lưu trữ tại:** `S:\HTTT\ht\m5dbui.md`  

---

## 1. TỔNG QUAN PHONG CÁCH THIẾT KẾ & BỐ CỤC (UI/UX OVERVIEW)

- **Hệ thống:** MISA AMIS CRM
- **Màn hình:** Quản lý đội ngũ sales > Tình hình thực hiện chỉ tiêu doanh số
- **Đối tượng sử dụng:** Sales Director / Sales Manager / Quản lý kinh doanh

Qua quan sát hình ảnh giao diện, đây là màn hình **Dashboard Chuyên sâu về Tình hình Thực hiện Chỉ tiêu Doanh số & Quản lý Đội ngũ Kinh doanh (Sales Team Management)** của hệ thống **MISA AMIS CRM**. Giao diện tập trung vào việc đánh giá năng lực thực thi của đội ngũ bán hàng từ cấp độ toàn công ty đến từng cá nhân và hoạt động đi tuyến ngoài thực địa.

### Đặc trưng Bố cục & Bảng màu (Layout & Color Palette):
- **Cấu trúc lưới (Grid Layout 1 + 3):**
  - **Hàng trên (1 Thẻ lớn Full-Width):** Biểu đồ đường đôi (`Dual Line Chart`) đối chiếu trực tiếp giữa **Mục tiêu** và **Thực hiện** xuyên suốt 12 tháng trong năm.
  - **Hàng dưới (3 Thẻ chia đều 3 cột - 3-Column Cards):** Kết hợp 3 góc nhìn quản trị nhân sự: **Bảng vinh danh doanh số (`Nhân viên xuất sắc`)** – **Tỷ lệ chuyển đổi thắng/thua (`Năng lực nhân viên`)** – **Bản đồ giám sát đi tuyến & chăm sóc khách hàng tại thực địa (`Field Sales Map`)**.
  - **Dải Banner thương hiệu ở chân ảnh:** Bên trái là Logo **`MISA AMIS CRM`**, bên phải là dải băng xanh dương mang thông điệp **`Quản lý đội ngũ sales`**.
- **Bảng màu ngữ nghĩa (Semantic Colors):**
  - **Xanh dương (`#2E86DE` / `#2563EB`):** Biểu thị chỉ tiêu **`Mục tiêu`** và nút hành động chính (**`🧭 Chỉ đường`**).
  - **Xanh ngọc lục bảo (`#26C69F` / `#10B981`):** Biểu thị kết quả **`Thực hiện`**, số lượng **`Cơ hội thắng`** và ghim định vị xanh trên bản đồ.
  - **Đỏ hồng (`#F4436C` / `#EF4444`):** Biểu thị số lượng **`Cơ hội thua`** và ghim vị trí trọng điểm màu đỏ trên bản đồ.
  - **Nền vùng làm việc (`#E5E7EB` / `#F3F4F6`) & Thẻ trắng (`#FFFFFF`):** Các thẻ được bo tròn góc và đổ bóng sâu (`Drop Shadow`) tạo hiệu ứng nổi 3D rõ nét.

---

## 2. CHI TIẾT CÁC KHỐI CHỨC NĂNG TRÊN MÀN HÌNH (`m5dbui.md`)

### 2.1. Khối 1 (Hàng trên - Toàn chiều ngang): `Tình hình thực hiện chỉ tiêu doanh số` (Biểu đồ Đường Đôi)
- **Tiêu đề chính:** **`Tình hình thực hiện chỉ tiêu doanh số`**
- **Phụ đề (Kỳ báo cáo):** `Năm nay`
- **Hệ trục tọa độ:**
  - **Trục tung (Y-Axis bên trái):** Nhãn dọc `Doanh số (tỷ)`, chia thành 6 mốc chuẩn: `0`, `200`, `400`, `600`, `800`, `1000` (kèm các đường kẻ lưới ngang mảnh).
  - **Trục hoành (X-Axis bên dưới):** Chia 12 mốc tương ứng 12 tháng trong năm (`1` đến `12`).
- **Hai đường biểu diễn xu hướng (Dual Line Chart có nút chấm tròn tại mỗi tháng):**
  1. 🔵 **Đường `Mục tiêu` (Màu xanh dương `#2E86DE`):**
     - Tháng 1 bắt đầu ở mức `500` tỷ ➔ Tháng 2 (`~520` tỷ) ➔ Tháng 3 (`~670` tỷ) ➔ Tháng 4 (`~630` tỷ) ➔ Tháng 5 (`~740` tỷ) ➔ Tháng 6 (`~800` tỷ) ➔ **Tháng 7 (`700` tỷ)** ➔ Tháng 8 (`~780` tỷ) ➔ Tháng 9 (`~750` tỷ) ➔ Tháng 10 (`~830` tỷ) ➔ Tháng 11 (`~800` tỷ) ➔ Tháng 12 (`~765` tỷ).
  2. 🟢 **Đường `Thực hiện` (Màu xanh ngọc `#26C69F`):**
     - Giai đoạn đầu năm thấp hơn mục tiêu: Tháng 1 (`~300` tỷ) ➔ Tháng 2 (`400` tỷ).
     - Tháng 3 vươn lên vượt mục tiêu (`~770` tỷ), tháng 5–6 điều chỉnh nhẹ (`~670` – `730` tỷ).
     - Từ **Tháng 7 trở đi bứt phá mạnh mẽ và luôn nằm trên đường Mục tiêu**: Tháng 7 đạt **`900` tỷ** ➔ Tháng 8–10 duy trì quanh mốc `900`–`920` tỷ ➔ Tháng 11 (`~940` tỷ) ➔ Tháng 12 chạm đỉnh xấp xỉ **`985` tỷ**.
- **Hộp thoại Tooltip nổi (Callout Box tại điểm Tháng 7):**
  - Khung nổi màu trắng có mũi tên trỏ trực tiếp vào điểm dữ liệu tháng 7 trên đường `Thực hiện`, hiển thị rõ 3 dòng:
    - `Tháng 7`
    - `Mục tiêu:` **`700 tỷ`**
    - `Thực hiện:` **`900 tỷ (128,57%)`**
- **Chú giải (Legend) ở chính giữa đáy thẻ:**
  - `🔹 Mục tiêu` (Xanh dương)  |  `🔹 Thực hiện` (Xanh ngọc).

---

### 2.2. Khối 2 (Hàng dưới - Cột 1 bên trái): `Nhân viên xuất sắc` (Bảng vinh danh Top 4 Sales)
- **Tiêu đề chính:** **`Nhân viên xuất sắc`**
- **Phụ đề:** `Công ty cổ phần MISA - Tháng này`
- **Cấu trúc danh sách:** Hiển thị **Top 4 nhân viên có doanh số cao nhất** kèm Ảnh đại diện tròn, Huy chương thứ hạng Vàng/Bạc/Đồng (`1`, `2`, `3`) cho 3 vị trí dẫn đầu, Tên phòng kinh doanh trực thuộc (`Phòng KD 01`, `Phòng KD 02`) và Doanh số đạt được:

| Thứ hạng | Huy chương & Avatar | Họ và tên nhân viên | Phòng ban trực thuộc | Doanh số đạt được (VNĐ) |
| :---: | :--- | :--- | :--- | :---: |
| **1** | 🥇 Ảnh đại diện + Huy chương Vàng số `1` | **Nguyễn Thị Thanh Hà** | `Phòng KD 01` | **`450.000.000`** |
| **2** | 🥈 Ảnh đại diện + Huy chương Bạc số `2` | **Kiều Nhật Linh** | `Phòng KD 01` | **`350.000.000`** |
| **3** | 🥉 Ảnh đại diện + Huy chương Đồng số `3` | **Trần Minh trang** | `Phòng KD 02` | **`320.000.000`** |
| **4** | Ảnh đại diện tròn | **Phạm Thị Yến** | `Phòng KD 02` | **`300.000.000`** |

---

### 2.3. Khối 3 (Hàng dưới - Cột 2 ở giữa): `Năng lực nhân viên` (Biểu đồ Thanh Ngang Chồng - Stacked Bar Chart)
- **Tiêu đề chính:** **`Năng lực nhân viên`**
- **Phụ đề:** `Tháng này`
- **Hệ trục tọa độ & Dữ liệu hiển thị:**
  - **Trục tung (Y-Axis):** Liệt kê 4 nhân viên kinh doanh từ trên xuống dưới:
    1. `Tào Văn Thiện`
    2. `Nguyễn Thị Thanh`
    3. `Trần Văn Quảng`
    4. `Kiều Nhật Nam`
  - **Trục hoành (X-Axis):** Thang đo tổng số lượng cơ hội từ `0`, `200`, `400`, `600`, `800`, `1000`.
  - **Dạng biểu diễn:** Mỗi nhân viên được biểu diễn bằng một thanh ngang ghép từ 2 phần màu nối tiếp nhau:
    - Phần bên trái (**Màu xanh ngọc `#26C69F`**): Số lượng **`Cơ hội thắng`**.
    - Phần bên phải (**Màu đỏ hồng `#F4436C`**): Số lượng **`Cơ hội thua`**.
- **Hộp thoại Tooltip nổi (Chi tiết của nhân viên `Tào Văn Thiện`):**
  - Hiển thị khung thông tin nổi ngay cạnh thanh đầu tiên:
    - **`Tào Văn Thiện`**
    - `SL cơ hội thắng:` **`400 (67.7%)`**
    - `SL cơ hội thua:` **`200 (32.3%)`**
- **Chú giải (Legend) ở đáy thẻ:**
  - `🟢 Cơ hội thắng`  |  `🔴 Cơ hội thua`.

---

### 2.4. Khối 4 (Hàng dưới - Cột 3 bên phải): Thẻ Bản Đồ Đi Tuyến & Chăm Sóc Khách Hàng Thực Địa (Map & Check-in Card)
- **Nửa trên của thẻ (Bản đồ số trực quan - Map View):**
  - Hiển thị bản đồ giao thông khu vực trung tâm **Quận Hoàn Kiếm, Hà Nội** (xung quanh trục *Phố Hàng Bài, Quang Trung, Tràng Tiền Plaza, Bảo tàng Phụ nữ Việt Nam, Chùa Quán Sứ, Báo Tiền Phong, Bún chả Hương Liên*).
  - Hiển thị **2 ghim định vị (Location Pins)** có chữ viết tắt **`MA`** bên trong vòng tròn trắng:
    - 1 ghim màu **Xanh ngọc** ở phía Tây Nam (gần đường Quang Trung / Báo Tiền Phong).
    - 1 ghim màu **Đỏ** lớn hơn ở trung tâm (tại địa chỉ Phố Hàng Bài).
- **Nửa dưới của thẻ (Thông tin Liên hệ / Điểm ghé thăm & Các nút thao tác nhanh):**
  - **Họ và tên:** **`Hoàng Minh Anh`** *(chữ in đậm)*
  - **Đơn vị / Công ty:** `Công ty cổ phần Oia`
  - **Địa chỉ chi tiết:** `55 Phố Hàng Bài, P. Hàng Bài, Quận Hoàn...`
  - **Hàng 3 nút hành động nhanh (Quick Action Buttons) ở đáy thẻ:**
    1. **`🧭 Chỉ đường`**: Nút chính màu xanh dương (`#2563EB`), chữ trắng, có icon điều hướng.
    2. **`👁️ Chi tiết`**: Nút phụ nền xám nhạt (`#F3F4F6`), chữ xám đậm, có icon con mắt xem chi tiết.
    3. **`📞` (Gọi điện)**: Nút vuông nhỏ nền xám nhạt ở góc phải có icon ống nghe điện thoại để liên hệ trực tiếp.

---

### 2.5. Khối 5: Dải Banner Thương Hiệu Chân Ảnh (Bottom Marketing Banner)
- **Góc dưới bên trái:** Logo vòng tròn 4 màu đặc trưng cùng tên sản phẩm **`MISA AMIS CRM`**.
- **Góc dưới bên phải:** Dải băng xanh dương chuyển sắc (`#0088FF` ➔ `#1E40AF`) với dòng chữ lớn màu trắng in nghiêng: **`Quản lý đội ngũ sales`**.

---

## 3. NHẬN XÉT & ĐÁNH GIÁ TỔNG KẾT (`m5dbui.md`)

1. **Kết hợp toàn diện 3 chiều Quản trị Đội ngũ Bán hàng (Doanh số – Năng lực – Thực địa):**
   - Giao diện không chỉ dừng ở việc xem tổng doanh số (Biểu đồ đường 12 tháng ở trên) mà đi sâu vào đánh giá từng cá nhân ở hàng dưới: **Ai mang về nhiều doanh thu nhất** (`Nhân viên xuất sắc`) ➔ **Tỷ lệ chốt đơn thành công hay thất bại của từng người ra sao** (`Năng lực nhân viên` - Thắng `67.7%` / Thua `32.3%`) ➔ **Nhân viên đang đi tuyến/gặp gỡ khách hàng ở đâu trên bản đồ** (`Hoàng Minh Anh - Công ty cổ phần Oia`).
2. **Tương tác dữ liệu thông minh qua Tooltip trực quan:**
   - Cả biểu đồ đường và biểu đồ thanh ngang chồng đều tích hợp **Tooltip nổi** tự động tính toán sẵn tỷ lệ phần trăm hoàn thành mục tiêu (`128,57%` ở Tháng 7) và tỷ lệ thắng/thua cơ hội (`67.7%` vs `32.3%`), giúp nhà quản lý nắm bắt hiệu suất ngay lập tức mà không cần tự nhẩm tính.
3. **Hỗ trợ tác nghiệp di động & đi tuyến (Field Sales Actionable UI):**
   - Thẻ bản đồ bên phải tích hợp sẵn 3 nút tác vụ tức thì (**`Chỉ đường`**, **`Chi tiết`**, **`Gọi điện 📞`**), rất sát với thực tế vận hành của đội ngũ Sales thị trường và quản lý giám sát tuyến bán hàng.
