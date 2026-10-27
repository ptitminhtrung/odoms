# m5db.md - Báo cáo Phân tích & Mô tả Chi tiết Giao diện Quản lý Đội ngũ Sales & Chỉ tiêu Doanh số (MISA AMIS CRM)
**Mã định danh tài liệu:** `m5db.md` (Đã đồng bộ & bổ sung đầy đủ từ `m5dbui.md`)  
**Lưu trữ tại:** `S:\HTTT\ht\m5db.md`  

---

## 1. Thông tin chung & Phong cách Thiết kế (UI/UX Overview)
- **Hệ thống**: MISA AMIS CRM
- **Màn hình**: Quản lý đội ngũ sales > Tình hình thực hiện chỉ tiêu doanh số
- **Đối tượng sử dụng**: Sales Director / Sales Manager / Quản lý kinh doanh
- **Đặc trưng Bố cục & Bảng màu (Layout & Color Palette)**:
  - **Cấu trúc lưới (Grid Layout 1 + 3)**:
    - **Hàng trên (1 Thẻ lớn Full-Width)**: Biểu đồ đường đôi (`Dual Line Chart`) đối chiếu trực tiếp giữa **Mục tiêu** và **Thực hiện** xuyên suốt 12 tháng trong năm.
    - **Hàng dưới (3 Thẻ chia đều 3 cột - 3-Column Cards)**: Kết hợp 3 góc nhìn quản trị nhân sự: **Bảng vinh danh doanh số (`Nhân viên xuất sắc`)** – **Tỷ lệ chuyển đổi thắng/thua (`Năng lực nhân viên`)** – **Bản đồ giám sát đi tuyến & chăm sóc khách hàng tại thực địa (`Field Sales Map`)**.
    - **Dải Banner thương hiệu ở chân ảnh**: Bên trái là Logo **`MISA AMIS CRM`**, bên phải là dải băng xanh dương mang thông điệp **`Quản lý đội ngũ sales`**.
  - **Bảng màu ngữ nghĩa (Semantic Colors)**:
    - **Xanh dương (`#2E86DE` / `#2563EB`)**: Biểu thị chỉ tiêu **`Mục tiêu`** và nút hành động chính (**`🧭 Chỉ đường`**).
    - **Xanh ngọc lục bảo (`#26C69F` / `#10B981`)**: Biểu thị kết quả **`Thực hiện`**, số lượng **`Cơ hội thắng`** và ghim định vị xanh trên bản đồ.
    - **Đỏ hồng (`#F4436C` / `#EF4444`)**: Biểu thị số lượng **`Cơ hội thua`** và ghim vị trí trọng điểm màu đỏ trên bản đồ.
    - **Nền vùng làm việc (`#E5E7EB` / `#F3F4F6`) & Thẻ trắng (`#FFFFFF`)**: Các thẻ được bo tròn góc và đổ bóng sâu (`Drop Shadow`) tạo hiệu ứng nổi 3D rõ nét.

---

## 2. Tình hình thực hiện chỉ tiêu doanh số (Kỳ: Năm nay - Khối Hàng trên Full-Width)
- **Tiêu đề chính**: **`Tình hình thực hiện chỉ tiêu doanh số`**
- **Phụ đề (Kỳ báo cáo)**: `Năm nay`
- **Dạng biểu đồ**: Biểu đồ đường đôi (Dual Line Chart) so sánh biến thiên 12 tháng giữa chỉ tiêu và thực tế.
- **Hệ trục tọa độ**:
  - **Trục tung (Y-Axis bên trái)**: Nhãn dọc `Doanh số (tỷ)`, chia thành 6 mốc chuẩn: `0`, `200`, `400`, `600`, `800`, `1000` (kèm các đường kẻ lưới ngang mảnh).
  - **Trục hoành (X-Axis bên dưới)**: Chia 12 mốc tương ứng 12 tháng trong năm (`1` đến `12`).
- **Các chuỗi dữ liệu & Diễn biến qua 12 tháng**:
  1. 🔵 **Mục tiêu (Đường màu xanh dương `#2E86DE`)**:
     - Tháng 1 bắt đầu ở mức `500` tỷ ➔ Tháng 2 (`~520` tỷ) ➔ Tháng 3 (`~670` tỷ) ➔ Tháng 4 (`~630` tỷ) ➔ Tháng 5 (`~740` tỷ) ➔ Tháng 6 (`~800` tỷ) ➔ **Tháng 7 (`700` tỷ)** ➔ Tháng 8 (`~780` tỷ) ➔ Tháng 9 (`~750` tỷ) ➔ Tháng 10 (`~830` tỷ) ➔ Tháng 11 (`~800` tỷ) ➔ Tháng 12 (`~765` tỷ).
  2. 🟢 **Thực hiện (Đường màu xanh ngọc `#26C69F`)**:
     - Giai đoạn đầu năm thấp hơn mục tiêu: Tháng 1 (`~300` tỷ) ➔ Tháng 2 (`400` tỷ).
     - Tháng 3 vươn lên vượt mục tiêu (`~770` tỷ), tháng 5–6 điều chỉnh nhẹ (`~670` – `730` tỷ).
     - Từ **Tháng 7 đến Tháng 12 bứt phá mạnh mẽ**: Tháng 7 đạt **`900` tỷ** ➔ Tháng 8–10 duy trì quanh mốc `900`–`920` tỷ ➔ Tháng 11 (`~940` tỷ) ➔ Tháng 12 chạm đỉnh xấp xỉ **`985` tỷ**.
- **Chi tiết tiêu biểu tại Tháng 7 (Hộp thoại Tooltip nổi - Callout Box)**:
  - Khung nổi màu trắng có mũi tên trỏ trực tiếp vào điểm dữ liệu tháng 7 trên đường `Thực hiện`, hiển thị rõ:
    - Thời điểm: `Tháng 7`
    - Mục tiêu: **`700 tỷ`**
    - Thực hiện / Thực tế: **`900 tỷ`** (Tỷ lệ hoàn thành: **`128,57%`** / `128.57%`)
- **Nhận định chung**: Từ tháng 7 đến tháng 12, doanh số thực tế liên tục duy trì đà tăng trưởng cao và vượt trên mức chỉ tiêu đề ra.
- **Chú giải (Legend) ở chính giữa đáy thẻ**: `🔹 Mục tiêu` (Xanh dương) | `🔹 Thực hiện` (Xanh ngọc).

---

## 3. Bảng vinh danh Nhân viên xuất sắc (Tháng này - Khối Hàng dưới Cột 1)
- **Tiêu đề chính**: **`Nhân viên xuất sắc`**
- **Đơn vị / Phụ đề**: `Công ty Cổ phần MISA - Tháng này`
- **Cấu trúc danh sách**: Hiển thị **Top 4 nhân viên có doanh số cao nhất** kèm Ảnh đại diện tròn, Huy chương thứ hạng Vàng/Bạc/Đồng (`1`, `2`, `3`) đính ở góc avatar cho 3 vị trí dẫn đầu, Tên phòng kinh doanh trực thuộc (`Phòng KD 01`, `Phòng KD 02`) và Doanh số đạt được:

| Hạng | Huy chương & Avatar | Họ và tên | Phòng ban trực thuộc | Doanh số đạt được (VNĐ) |
| :---: | :--- | :--- | :--- | :---: |
| **1** | 🥇 Ảnh đại diện + Huy chương Vàng số `1` | **Nguyễn Thị Thanh Hà** | Phòng KD 01 | **450.000.000** |
| **2** | 🥈 Ảnh đại diện + Huy chương Bạc số `2` | **Kiều Nhật Linh** | Phòng KD 01 | **350.000.000** |
| **3** | 🥉 Ảnh đại diện + Huy chương Đồng số `3` | **Trần Minh Trang** | Phòng KD 02 | **320.000.000** |
| **4** | Ảnh đại diện tròn | **Phạm Thị Yến** | Phòng KD 02 | **300.000.000** |

---

## 4. Biểu đồ Năng lực nhân viên (Tháng này - Khối Hàng dưới Cột 2)
- **Tiêu đề chính**: **`Năng lực nhân viên`**
- **Phụ đề**: `Tháng này`
- **Dạng biểu đồ**: Biểu đồ thanh ngang phân đoạn / chồng 2 màu (Stacked Horizontal Bar Chart).
- **Hệ trục tọa độ & Phân loại**:
  - **Trục tung (Y-Axis - Nhân sự theo dõi)**: `Tào Văn Thiện`, `Nguyễn Thị Thanh`, `Trần Văn Quảng`, `Kiều Nhật Nam`.
  - **Trục hoành (X-Axis)**: Thang đo tổng số lượng cơ hội từ `0`, `200`, `400`, `600`, `800`, `1000`.
  - **Phân loại 2 đoạn màu trên mỗi thanh ngang**:
    - Đoạn bên trái: `🟢 Cơ hội thắng` (Màu xanh ngọc `#26C69F`)
    - Đoạn bên phải: `🔴 Cơ hội thua` (Màu đỏ hồng `#F4436C`)
- **Chi tiết nhân sự tiêu biểu tại Hộp thoại Tooltip nổi (`Tào Văn Thiện`)**:
  - Nhân sự: **`Tào Văn Thiện`**
  - SL cơ hội thắng: **`400`** (`67.7%`)
  - SL cơ hội thua: **`200`** (`32.3%` / `33.3%`)
- **Chú giải (Legend) ở đáy thẻ**: `🟢 Cơ hội thắng` | `🔴 Cơ hội thua`.

---

## 5. Định vị & Quản lý đi tuyến (Field Sales Tracking - Khối Hàng dưới Cột 3)
- **Nửa trên của thẻ (Bản đồ trực quan - Map View)**:
  - Bản đồ số tích hợp ghim vị trí khách hàng và nhân sự thị trường theo thời gian thực tại khu vực trung tâm **Phố Hàng Bài – Quận Hoàn Kiếm – Hà Nội** (xung quanh các địa danh *Bảo tàng Phụ nữ Việt Nam, Tràng Tiền Plaza, Chùa Quán Sứ, Báo Tiền Phong, Bún chả Hương Liên*).
  - Hiển thị **2 ghim định vị (Location Pins)** có chữ viết tắt **`MA`** bên trong vòng tròn trắng:
    - 1 ghim màu **Xanh ngọc** ở phía Tây Nam (gần đường Quang Trung / Báo Tiền Phong).
    - 1 ghim màu **Đỏ** lớn hơn ở trung tâm (tại địa chỉ Phố Hàng Bài).
- **Nửa dưới của thẻ (Thẻ thông tin khách hàng / nhân sự đang chọn)**:
  - **Khách hàng / Liên hệ**: **`Hoàng Minh Anh`** (`Hoàng Minh Ánh`) — `Công ty cổ phần Oia` (`Công ty Cổ phần Gia...`)
  - **Địa chỉ**: `55 Phố Hàng Bài, P. Hàng Bài, Quận Hoàn Kiếm, Hà Nội` (`Số Phố Hàng Bài, P. Hàng Bài, Quận Hoàn Kiếm, Hà Nội`)
  - **Tiện ích thao tác nhanh (3 nút Action Buttons ở đáy thẻ)**:
    1. **`🧭 Chỉ đường`**: Nút chính màu xanh dương (`#2563EB`), chữ trắng, có icon điều hướng.
    2. **`👁️ Chi tiết`**: Nút phụ nền xám nhạt (`#F3F4F6`), chữ xám đậm, có icon con mắt xem chi tiết.
    3. **`📞` (Gọi điện thoại trực tiếp)**: Nút vuông nhỏ nền xám nhạt ở góc phải có icon ống nghe điện thoại.

---

## 6. Dải Banner Thương hiệu Chân ảnh & Nhận xét Tổng kết
- **Dải Banner Thương hiệu (Bottom Marketing Banner)**:
  - **Góc dưới bên trái**: Logo vòng tròn 4 màu đặc trưng cùng tên sản phẩm **`MISA AMIS CRM`**.
  - **Góc dưới bên phải**: Dải băng xanh dương chuyển sắc (`#0088FF` ➔ `#1E40AF`) với dòng chữ lớn màu trắng in nghiêng: **`Quản lý đội ngũ sales`**.
- **Nhận xét & Đánh giá Tổng kết Thiết kế Giao diện**:
  1. **Kết hợp toàn diện 3 chiều Quản trị Đội ngũ Bán hàng (Doanh số – Năng lực – Thực địa)**: Từ tổng doanh số 12 tháng của toàn công ty ➔ Xếp hạng doanh thu cá nhân (`Nhân viên xuất sắc`) ➔ Tỷ lệ chốt đơn thành công/thất bại (`Năng lực nhân viên`) ➔ Giám sát lộ trình đi tuyến trên bản đồ số.
  2. **Tương tác dữ liệu thông minh qua Tooltip trực quan**: Tự động tính sẵn tỷ lệ hoàn thành mục tiêu (`128,57%` ở Tháng 7) và tỷ lệ thắng/thua cơ hội (`67.7%` vs `32.3%`), giúp Sales Director / Sales Manager nắm bắt hiệu suất tức thì.
  3. **Hỗ trợ tác nghiệp di động & đi tuyến (Field Sales Actionable UI)**: Thẻ bản đồ tích hợp sẵn 3 nút tác vụ tức thì (**`Chỉ đường`**, **`Chi tiết`**, **`Gọi điện 📞`**) phục vụ trực tiếp cho công tác điều phối nhân sự thị trường.
