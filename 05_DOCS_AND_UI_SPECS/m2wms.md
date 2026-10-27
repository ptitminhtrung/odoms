# Tài liệu phân tích giao diện: m2wms.md (Giao diện m2wmsgd)

Bản phân tích chi tiết về mặt thiết kế giao diện (UI), trải nghiệm người dùng (UX), cấu trúc chức năng và bảng mã màu của màn hình đăng nhập hệ thống **Greenseven Mart WMS** (Mã định danh giao diện: `m2wmsgd`, tham khảo tại `https://splendid-palmier-d9e393.netlify.app/`).

---

## 1. Bố cục tổng thể (Split-Screen Layout Architecture)

Khác với bố cục một cột truyền thống, giao diện **`m2wmsgd`** sử dụng kiến trúc **Split-Screen (Bố cục chia đôi màn hình 2 cột)** chuẩn phong cách SaaS & Enterprise WMS hiện đại:

* **Cột trái – Hero & Tính năng cốt lõi (Left Hero Pane):** Chiếm 50% diện tích bên trái, sử dụng nền chuyển sắc (Linear Gradient) xanh lá cây đậm sang xanh rêu (`#052e16` $\rightarrow$ `#022c22`). Khu vực này đóng vai trò là "điểm neo cảm xúc", làm nổi bật thương hiệu Greenseven Mart, định vị cơ sở kho và giới thiệu trực quan 3 năng lực công nghệ lõi của hệ thống WMS thông qua các thẻ mờ kính (Glassmorphism).
* **Cột phải – Khu vực Biểu mẫu Xác thực (Right Authentication Container):** Chiếm 50% diện tích bên phải, đặt trên khối nền trắng tinh gọn (`#FFFFFF`) với các góc bo mềm mại và hiệu ứng đổ bóng mờ nhẹ. Cấu trúc này giúp người dùng tập trung hoàn toàn vào thao tác nhập liệu và đăng nhập an toàn mà không bị xao nhãng.
* **Phân cấp thị giác (Visual Hierarchy):**
  1. *Cột trái:* Logo thương hiệu $\rightarrow$ Tên hệ thống WMS $\rightarrow$ Tag chi nhánh kho $\rightarrow$ 3 Thẻ tính năng vận hành kho.
  2. *Cột phải:* Mini-brand Header $\rightarrow$ Tiêu đề chức năng "Đăng nhập hệ thống" $\rightarrow$ Khối nhập liệu (Username & Password) $\rightarrow$ Nút hành động chính (Primary CTA).

---

## 2. Phân tích chi tiết các thành phần UI (UI Components)

### A. Khối Cột Trái: Hero, Định danh & 3 Thẻ Tính năng Cốt lõi (Left Hero Pane)
* **Logo & Tiêu đề Thương hiệu:**
  * **Biểu tượng (Large Logo Icon):** Khối vuông bo góc lớn (rounded squircle) màu xanh lá tươi sáng, bên trong chứa icon chiếc lá màu trắng đặt nghiêng – biểu trưng cho chuỗi nông sản & thực phẩm sạch "Greenseven".
  * **Tên hệ thống:** Chữ **"Greenseven"** (màu trắng) kết hợp **"Mart WMS"** (màu xanh lá nổi bật), định hình rõ đây là phân hệ Quản lý kho hàng thông minh.
  * **Mô tả & Định danh chi nhánh:** Dòng chữ phụ *"Hệ thống quản lý kệ hàng thông minh"* và thông tin địa điểm hoạt động: **"Kho Bình Tân · TP.HCM"**.
* **3 Thẻ Tính năng Nổi bật (Translucent Glassmorphism Cards):**
  Các thẻ được thiết kế dạng bo góc viền mảnh, nền kính mờ bán trong suốt trên tông xanh đậm, giúp giao diện có chiều sâu công nghệ:
  1. **Thẻ 1 – Sơ đồ kệ 5 tầng trực quan:**
     * *Icon:* Khung kệ / Khối tầng (Shelf Layers Icon) màu xanh lá.
     * *Tiêu đề:* **Sơ đồ kệ 5 tầng trực quan**
     * *Nội dung giải thích:* `Theo dõi từng ô kệ A–G × T1–T5 theo thời gian thực`
  2. **Thẻ 2 – Kiểm soát FEFO tự động:**
     * *Icon:* Lịch hạn sử dụng kết hợp đồng hồ (Calendar & Clock Icon) màu cam/xanh.
     * *Tiêu đề:* **Kiểm soát FEFO tự động**
     * *Nội dung giải thích:* `Cảnh báo hạn dùng, ưu tiên xuất kho đúng thứ tự`
  3. **Thẻ 3 – Tra cứu QR tức thì:**
     * *Icon:* Mã QR scanner (QR Code Icon) màu xanh lá.
     * *Tiêu đề:* **Tra cứu QR tức thì**
     * *Nội dung giải thích:* `Đối chiếu vị trí kệ và tồn kho vật lý`

---

### B. Khối Cột Phải: Biểu mẫu Đăng nhập (Authentication Form Container)

#### 1. Khối Mini-Header (Định danh nhanh)
* **Biểu tượng:** Icon chiếc lá xanh bo góc kích thước nhỏ.
* **Tên thương hiệu:** Dòng chữ **"GREENSEVEN MART"** viết hoa toàn bộ, in đậm, màu xanh lá đậm.
* **Tên phân hệ (Sub-branding):** Dòng chữ **"Hệ thống quản lý kệ hàng · WMS v2"** sử dụng cỡ chữ nhỏ, màu xám trung tính, đặt ngay dưới tên thương hiệu để xác nhận phiên bản phần mềm.

#### 2. Khối Tiêu đề Chức năng (Title & Subtitle)
* **Tiêu đề chính:** **"Đăng nhập hệ thống"** font sans-serif cỡ lớn, in đậm (Bold), màu tối (`#0f172a`), đóng vai trò là điểm neo thị giác chính của form.
* **Tiêu đề phụ:** **"Nhập thông tin để truy cập dashboard WMS"** màu xám nhạt (`#64748b`), hướng dẫn rõ mục đích biểu mẫu.

#### 3. Khối Nhập liệu (Form Fields)
* **Trường "Tên đăng nhập":**
  * **Nhãn (Label):** `Tên đăng nhập` đặt phía trên ô nhập liệu, in đậm vừa phải (Semi-bold), màu chữ tối dễ đọc.
  * **Ô nhập (Text Input):** Viền mảnh màu xám nhạt, góc bo tròn nhẹ, nền xám cực nhạt (off-white) tạo độ tương phản với nền trắng.
  * **Văn bản gợi ý (Placeholder):** Hiển thị chữ *"Nhập tên đăng nhập..."* màu xám.
* **Trường "Mật khẩu":**
  * **Nhãn (Label):** `Mật khẩu`, đồng bộ kiểu dáng với nhãn tên đăng nhập.
  * **Ô nhập (Password Input):** Kích thước và viền đồng bộ với ô tên đăng nhập. Dữ liệu bên trong được mã hóa hiển thị dưới dạng chuỗi chấm tròn bảo mật (`••••••••`).
  * **Nút chuyển đổi hiển thị (Visibility Toggle):** Tích hợp biểu tượng **con mắt (Eye icon)** ở góc phải bên trong ô input, cho phép nhân viên bật/tắt chế độ xem mật khẩu nhằm tránh gõ sai ký tự.

#### 4. Nút Hành động chính (Primary CTA Button)
* **Thiết kế:** Nút **"Đăng nhập"** có chiều rộng trải dài 100% (full-width), các góc bo tròn đồng bộ.
* **Màu sắc & Tương phản:** Nền xanh lá đậm nổi bật (`#16a34a`), chữ và icon màu trắng in đậm tạo độ tương phản cao, thu hút thao tác nhấn chuột.
* **Biểu tượng đi kèm (Leading Icon):** Tích hợp icon mũi tên đi vào cánh cửa (`[->`) đặt ngay trước chữ "Đăng nhập", nhấn mạnh hành động mở phiên truy cập hệ thống.

---

## 3. Bảng mã màu & Thông số thiết kế (Design Tokens)

| Thành phần giao diện | Mã màu / Giá trị CSS | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Primary Brand Green** | `#16a34a` / `#15803d` | Nút CTA Đăng nhập, chữ "Mart WMS", màu icon chính |
| **Dark Forest Gradient** | `#052e16` $\rightarrow$ `#022c22` | Nền cột trái (Hero Pane) |
| **Glassmorphism Surface** | `rgba(255, 255, 255, 0.07)` | Nền trong suốt của 3 thẻ tính năng cột trái |
| **Glassmorphism Border** | `rgba(255, 255, 255, 0.12)` | Viền mảnh phản quang của các thẻ tính năng |
| **Form Background** | `#ffffff` | Nền trắng của khung đăng nhập bên phải |
| **Text Heading** | `#0f172a` / `#1e293b` | Tiêu đề "Đăng nhập hệ thống", label trường nhập |
| **Text Muted** | `#64748b` | Dòng dẫn phụ, placeholder nhập liệu |

---

## 4. Đánh giá Trải nghiệm Người dùng (UX) & Khả năng vận hành

* **Ưu điểm nổi bật:**
  * **Cân bằng giữa thẩm mỹ và công năng:** Bố cục 2 cột vừa tạo ấn tượng thương hiệu chuyên nghiệp, vừa giữ cho luồng thao tác đăng nhập nhanh gọn, không rườm rà.
  * **Trực quan hóa năng lực hệ thống:** 3 thẻ tính năng mờ kính giúp nhân sự kho mới nhanh chóng nhận diện 3 quy chuẩn quan trọng nhất: *Kệ 5 tầng*, *Xuất hàng FEFO* và *Quét mã QR*.
  * **Tiện ích bảo mật thực tế:** Tích hợp nút con mắt ẩn/hiện mật khẩu, hỗ trợ thủ kho thao tác dễ dàng trên các màn hình cảm ứng hoặc tablet chuyên dụng tại kho.
* **Các điểm khuyết thiếu cần bổ sung khi triển khai thực tế:**
  * **Thiếu luồng khôi phục tài khoản:** Chưa có liên kết *"Quên mật khẩu?"* hoặc hướng dẫn liên hệ Admin/IT khi nhân viên bị khóa tài khoản.
  * **Thiếu tùy chọn ghi nhớ phiên:** Chưa có checkbox *"Ghi nhớ đăng nhập"* (Remember me) để duy trì phiên làm việc cho các ca trực dài.
  * **Chưa có trạng thái phản hồi động (Dynamic Feedback States):** Cần bổ sung banner thông báo lỗi khi nhập sai mật khẩu (Inline Error Banner) và hiệu ứng xoay tải (Loading spinner) trên nút Đăng nhập khi hệ thống đang xác thực API.

---

## 5. Mối liên hệ & Khả năng ứng dụng cho Dự án OMS (`ReOMStqP1`)

Giao diện `m2wmsgd` có thể kế thừa và chuyển đổi trực tiếp làm **Cổng đăng nhập (Portal Gateway)** cho toàn bộ hệ sinh thái OMS & WMS:
* Hệ màu Xanh lá & Slate hoàn toàn đồng nhất với Dashboard OMS hiện tại ([index.html](file:///S:/HTTT/index.html)).
* 3 thẻ tính năng bên cột trái có thể chuyển đổi thành 3 năng lực cốt lõi của OMS:
  1. *Thẻ 1:* **Tổng hợp Đơn hàng Đa kênh** (Shopee, Lazada, TikTok Shop, FB, POS).
  2. *Thẻ 2:* **Kiểm soát Tồn kho Khả dụng (ATP)** & Khóa chống bán lố (Anti-Overselling).
  3. *Thẻ 3:* **Phân bổ Giữ hàng FIFO / FEFO** (Tự động trừ kho theo thứ tự ưu tiên).
