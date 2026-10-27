# TÀI LIỆU MÔ TẢ & NHẬN XÉT GIAO DIỆN MÀN HÌNH TÌNH HÌNH KINH DOANH (`m3dbui.md`)
**Mã định danh tài liệu:** `m3dbui.md`  
**Đối tượng phân tích:** Giao diện Màn hình **"Tình hình kinh doanh"** (Bàn làm việc CRM tích hợp Trợ lý AI AVA)  
**Lưu trữ tại:** `S:\HTTT\ht\m3dbui.md`  

---

## 1. TỔNG QUAN PHONG CÁCH THIẾT KẾ & BỐ CỤC (UI/UX OVERVIEW)

Qua quan sát hình ảnh giao diện màn hình **"Tình hình kinh doanh"**, đây là một **Dashboard Quản trị Kinh doanh & Đơn hàng hiện đại** (theo chuẩn thiết kế Enterprise SaaS / MISA AMIS CRM), kết hợp giữa **trực quan hóa dữ liệu đa chiều (BI Charts)** và **Trợ lý trí tuệ nhân tạo (AI Assistant - AVA)**.

### Đặc trưng thẩm mỹ & Bảng màu (Color Palette):
- **Tông màu chủ đạo:**
  - **Thanh Header đỉnh (Top Navbar):** Xanh dương đậm (`#1D4ED8` / `#1E40AF`) tạo cảm giác chuyên nghiệp, tin cậy.
  - **Thanh Menu trái (Sidebar) & Vùng làm việc (Workspace):** Nền trắng (`#FFFFFF`) kết hợp nền khung xám nhạt (`#F3F4F6` / `#F8FAFC`), giúp các con số KPI và biểu đồ nổi bật rõ ràng.
- **Màu sắc ngữ nghĩa (Semantic Colors):**
  - **Xanh lá cây (`#16A34A`):** Biểu thị xu hướng tăng trưởng tích cực (`↗ 27%`, `↗ 26,95%`) kèm biểu đồ Sparkline hướng lên.
  - **Đỏ (`#EF4444`):** Cảnh báo chỉ số sụt giảm (`↘ 50%`) kèm biểu đồ Sparkline hướng xuống.
  - **Cam (`#F59E0B`) & Xanh dương (`#2563EB`):** Sử dụng cho biểu đồ kết hợp (Combo Chart) và biểu đồ tròn (Donut Chart).
  - **Gradient Tím - Hồng (`#6366F1` ➔ `#EC4899`):** Nhận diện riêng cho các tính năng phân tích thông minh bằng **Trợ lý AI AVA**.

---

## 2. CHI TIẾT CÁC THÀNH PHẦN TRÊN MÀN HÌNH CHÍNH

Giao diện được chia thành **4 khu vực chức năng rõ rệt** theo cấu trúc chuẩn của hệ thống quản trị doanh nghiệp:

### 2.1. Khu vực 1: Thanh Điều Hướng Trên Cùng (Global Top Header)
- **Góc bên trái:**
  - Biểu tượng **App Switcher** (lưới 9 chấm vuông) để chuyển đổi nhanh giữa các phân hệ.
  - Logo hình lục giác trắng kèm tên phân hệ **`CRM`** in đậm.
- **Khu vực giữa – phải:**
  - Ô tìm kiếm nhanh **`🔍 Tìm kiếm`** có nền xanh dương bán trong suốt.
- **Cụm biểu tượng công cụ góc phải (8 biểu tượng):**
  1. Biểu tượng **Robot AI (AVA)** nằm trong vòng tròn sáng.
  2. Biểu tượng **Loa thông báo** (bản tin hệ thống).
  3. Biểu tượng **Bánh răng** (Cài đặt hệ thống).
  4. Biểu tượng **Tin nhắn / Hội thoại** có huy hiệu thông báo màu đỏ hiển thị số **`20`**.
  5. Biểu tượng **Chuông thông báo**.
  6. Biểu tượng **Dấu hỏi `?`** (Trợ giúp & tài liệu hướng dẫn).
  7. Biểu tượng **Vòng tròn trạng thái / Tiện ích**.
  8. **Avatar người dùng** (ảnh đại diện hình tròn ngoài cùng bên phải).

---

### 2.2. Khu vực 2: Thanh Menu Nghiệp Vụ Dọc Bên Trái (Left Sidebar Navigation)
Thanh Sidebar bên trái sắp xếp gọn gàng **15 mục chức năng nghiệp vụ** từ tổng quan đến chi tiết bán hàng & đơn hàng, mỗi mục đều có icon minh họa trực quan đi kèm:
1. 🏠 **Bàn làm việc** *(Trạng thái Active: nền xanh nhạt, chữ và icon màu xanh dương đậm)*
2. 🏢 **Khách hàng**
3. 📇 **Liên hệ**
4. 📄 **Báo giá**
5. 🛒 **Đơn hàng**
6. ↩️ **Trả lại hàng bán**
7. 🧾 **Hóa đơn**
8. 📦 **Hàng hóa**
9. 🏷️ **Chính sách giá**
10. 📈 **Hoạt động**
11. 🎯 **Mục tiêu**
12. 🕒 **Báo cáo**
13. 🗺️ **Đi tuyến**
14. 🧲 **Chào hàng**
15. 💡 **Tiềm năng**

---

### 2.3. Khu vực 3: Thanh Điều Hướng Phụ & Thanh Công Cụ Lọc (Sub-Header & Filter Bar)
- **Dải Tab điều hướng cấp 2 (Sub-navigation Tabs):**
  - `✨ Trợ lý AI`
  - **`Tổng quan`** *(Đang được chọn Active với đường gạch chân màu xanh dương)*
  - `Tính năng mới` kèm nhãn badge màu cam **`Mới`**
  - Phía bên phải có nút hướng dẫn **`▶️ Bắt đầu sử dụng`**.
- **Thanh Tiêu đề & Bộ lọc dữ liệu (`Tình hình kinh doanh`):**
  - Bên trái: Icon nhịp sóng + Tiêu đề **`Tình hình kinh doanh ⌄`** (cho phép mở rộng chọn dashboard khác) + Nút tải lại dữ liệu **`↻`**.
  - Chính giữa: **3 ô Dropdown bộ lọc** (lọc theo đơn vị kinh doanh, nhân sự phụ trách, kỳ thời gian báo cáo).
  - Bên phải:
    - Nút nổi bật có viền tím: **`🤖 Phân tích với AVA`**.
    - Nút tùy chỉnh giao diện (icon cây bút **`✏️`**) và nút thêm tùy chọn (**`⋯`**).

---

### 2.4. Khu vực 4: Nội Dung Dashboard Chính (KPIs & Biểu Đồ Phân Tích)

#### A. Khối "Tổng quan" — 4 Thẻ Chỉ Số KPI (KPI Summary Cards kèm Sparkline)
Bốn thẻ KPI được đặt trong cùng một khung trắng lớn có tiêu đề **`Tổng quan`**, mỗi thẻ gồm **Tên chỉ số**, **Con số lớn**, **Tỷ lệ tăng/giảm so với tháng trước** và **Biểu đồ đường thu nhỏ (Sparkline)** ở góc phải dưới:

| STT | Tên thẻ KPI | Giá trị hiển thị | Biến động so với tháng trước | Hình thái biểu đồ Sparkline |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Số lượng đơn hàng ⓘ** | **`345`** | `↗ 27% với tháng trước` *(Màu xanh lá)* | Đường biểu diễn màu xanh lá hướng lên |
| **2** | **Giá trị đơn hàng** | **`825 triệu`** | `↘ 50% với tháng trước` *(Màu đỏ)* | Đường biểu diễn màu đỏ dốc xuống |
| **3** | **Thực thu** | **`480 triệu`** | `↗ 27% với tháng trước` *(Màu xanh lá)* | Đường biểu diễn màu xanh lá hướng lên |
| **4** | **Còn phải thu đầu kỳ** | **`-149,974.09 tỷ`** | `↗ 27% với tháng trước` *(Màu xanh lá)* | Đường biểu diễn màu xanh lá hướng lên |

#### B. Hàng Biểu đồ Mục tiêu Doanh số (Chia 2 cột cân đối)
1. **Biểu đồ bên trái — `Mục tiêu doanh số theo thời gian` (Combo Chart: Cột + Đường):**
   - **Chỉ số tổng hợp đầu thẻ:** `Tổng` **`300`**`/600 tỷ đồng (50%)` kèm mức tăng trưởng **`↗ 26,95%`** (màu xanh lá).
   - **Trục tung (Y-Axis):** Chia mốc `0, 20, 40, 60, 80`.
   - **Biểu diễn trực quan:** Kết hợp giữa **các cột đứng màu xanh dương** (doanh số thực hiện theo từng kỳ/tháng) và **đường cong mượt màu cam** nối các điểm giá trị cụ thể (`59, 17, 32, 20, 41, 11, 57, 15, 57, 52, 92, 42`) kéo dài đến mốc tháng `12`.
2. **Biểu đồ bên phải — `Mục tiêu doanh số theo đơn vị` (Horizontal Progress Bar Chart):**
   - **Chỉ số tổng hợp đầu thẻ:** `Tổng` **`345`**.
   - **Biểu diễn trực quan:** Các thanh ngang thể hiện mức độ hoàn thành chỉ tiêu của từng đơn vị/chi nhánh. Phần thanh màu xanh dương đậm thể hiện kết quả đạt được (kèm nhãn số `15`, `17`, `37`, `15`...), phần nền xám phía sau thể hiện hạn mức mục tiêu `100`.

---

## 3. CÁC THÀNH PHẦN NỔI BẬT Ở TIỀN CẢNH (FLOATING WIDGETS & AI INSIGHT)

Điểm nhấn đặc biệt của bức ảnh là **2 khung thẻ nổi (Floating Cards)** và **Nhân vật 3D Trợ lý AI** được đặt lớp (layer) nổi phía trước để nhấn mạnh khả năng phân tích sâu:

### 3.1. Khung nổi bên trái: Thẻ "Doanh số theo hàng hóa" (Biểu đồ Donut)
- **Tiêu đề thẻ:** **`Doanh số theo hàng hóa`**
- **Tổng giá trị:** **`261 triệu`** kèm chỉ số `0%` (màu vàng).
- **Danh sách tỷ trọng theo mặt hàng/sản phẩm (Legend bên trái):**
  - 🔵 `CUKCUK: 9.5%`
  - 🟠 `SME.NET 2017: 35.6%`
  - 🔵 `MShopkeeper: 15.3%`
  - 🟢 `AMIS.VN: 19.1%`
  - 🟣 `Bamboo.NET: 20.5%`
  - ⚪ `Khác`
- **Biểu đồ vòng tròn (Donut Chart bên phải):**
  - Hiển thị trực quan tỷ trọng các nhóm hàng hóa và có **Tooltip nổi** khi di chuột vào: **`Chi phí lương: 7 tỷ đồng (82,76%)`**.
- **Chân thẻ (Footer):**
  - Bên trái: Dòng trạng thái thời gian thực `Số liệu tính đến 08:40` + nút **`Tải lại`**.
  - Bên phải: Liên kết **`Chi tiết`** để mở báo cáo sâu.

### 3.2. Khung nổi bên phải: Nhân vật 3D AI & Hộp thoại Nhận xét Thông minh (AI Insight Card)
- **Nhân vật đại diện (3D AI Mascot):** Hình ảnh robot nữ công nghệ mang phong cách Panda (tai gấu trúc, kính đen thông minh, trang phục trắng-đen hiện đại) đang vẫy tay chỉ dẫn vào số liệu.
- **Thẻ nhận xét tự động (AI Summary Box):**
  - Đưa ra nhận định phân tích cụ thể bằng tiếng Việt tự nhiên:
    > *"Hà Nội chỉ **đạt được 12,7%** mục tiêu doanh số tháng này, **còn thiếu gần 87,3 triệu** để hoàn thành mục tiêu."*
  - Bên dưới là nút bấm hành động (Call-to-Action) có nền chuyển sắc cam-hồng nhạt: **`🤖 Phân tích với AVA   >`**.

---

## 4. NHẬN XÉT & ĐÁNH GIÁ TỔNG KẾT (`m3dbui.md`)

1. **Tính trực quan & Phân cấp thông tin (Visual Hierarchy):**
   - Giao diện tuân thủ rất tốt nguyên tắc **"Từ tổng quan đến chi tiết"**: Hàng trên cùng là 4 chỉ số sức khỏe kinh doanh cốt lõi (Số đơn, Doanh số, Thực thu, Công nợ) ➔ Hàng giữa là tiến độ mục tiêu theo thời gian và đơn vị ➔ Các thẻ chi tiết cơ cấu doanh số theo mặt hàng.
2. **Tích hợp biểu đồ xu hướng siêu nhỏ (Micro-Sparklines) ngay trong thẻ KPI:**
   - Thay vì chỉ hiển thị con số tĩnh (`345` đơn hay `825 triệu`), mỗi thẻ KPI đều có tỷ lệ `%` so sánh với kỳ trước kèm biểu đồ đường Sparkline nhỏ ở góc phải giúp người quản lý nhận diện ngay xu hướng tăng/giảm chỉ trong 1 giây nhìn lướt qua.
3. **Kết hợp AI phân tích chủ động (Proactive AI Analytics):**
   - Hệ thống không chỉ vẽ biểu đồ mà còn dùng AI (`AVA`) để tự động đọc số liệu và tóm tắt thành câu cảnh báo ngắn gọn (*"Hà Nội chỉ đạt được 12,7%..., còn thiếu gần 87,3 triệu..."*), giúp người điều hành biết ngay điểm nghẽn cần xử lý.
