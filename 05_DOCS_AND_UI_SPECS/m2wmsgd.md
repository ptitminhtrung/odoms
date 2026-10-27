# TÀI LIỆU PHÂN TÍCH GIAO DIỆN MẪU: m2wmsgd
**Mã giao diện:** `m2wmsgd`  
**Hội thoại:** `ReOMStqP1`  
**Nguồn tham khảo:** Ảnh giao diện mẫu hệ thống *Greenseven Mart WMS* (`splendid-palmier-d9e393.netlify.app`)  
**Thư mục lưu trữ:** `S:\HTTT\ht\m2wmsgd.md`  
**Ngày ghi nhận:** 24/10/2026  

---

## 1. TỔNG QUAN KIẾN TRÚC GIAO DIỆN (SPLIT-SCREEN HERO LAYOUT)

Giao diện **`m2wmsgd`** áp dụng phong cách thiết kế **Split-Screen (Bố cục chia đôi màn hình 2 cột)** hiện đại, thường thấy trong các hệ thống SaaS Enterprise, WMS và OMS chuyên nghiệp:

```
+---------------------------------------------------+---------------------------------------------------+
|               CỘT TRÁI (HERO & BRANDING)          |           CỘT PHẢI (AUTHENTICATION FORM)          |
|  - Nền Gradient xanh lá đậm (Dark Forest Green)   |  - Nền trắng tinh gọn, góc bo mềm mại             |
|  - Logo thương hiệu Greenseven (Icon chiếc lá)    |  - Mini-branding: Logo + Tên hệ thống WMS v2      |
|  - Tên hệ thống: Greenseven Mart WMS              |  - Tiêu đề: Đăng nhập hệ thống                    |
|  - Tag định danh: "Kho Bình Tân · TP.HCM"         |  - Form nhập liệu: Tên đăng nhập & Mật khẩu       |
|  - 3 Thẻ tính năng nổi bật (Feature Cards Glass)  |  - Nút CTA Đăng nhập full-width (Màu xanh chủ đạo)|
+---------------------------------------------------+---------------------------------------------------+
```

---

## 2. PHÂN TÍCH CHI TIẾT CÁC KHỐI GIAO DIỆN

### 2.1. Cột Trái: Khu vực Nhận diện & Điểm nhấn Tính năng (Hero & Features)
* **Phong cách nền (Background):** Sử dụng dải chuyển màu mượt mà (Linear Gradient) từ xanh rêu/đen đậm sang xanh lục bảo (`#064e3b` $\rightarrow$ `#042f2e`), mang lại cảm giác công nghệ cao, chuyên nghiệp và vững chắc cho hệ thống quản lý kho.
* **Khối Logo & Tiêu đề:**
  * **Logo:** Khối vuông bo góc lớn (Squircle / Rounded Square) màu xanh tươi sáng với biểu tượng chiếc lá màu trắng nghiêng bên trong.
  * **Tên thương hiệu & Phân hệ:** Dòng chữ lớn **"Greenseven"** (màu trắng) và **"Mart WMS"** (màu xanh lá nổi bật).
  * **Mô tả ngắn & Vị trí:** *"Hệ thống quản lý kệ hàng thông minh"* và thông tin định danh vị trí kho *"Kho Bình Tân · TP.HCM"*.
* **3 Thẻ Tính Năng Cốt Lõi (Translucent Feature Cards / Glassmorphism):**
  1. **Thẻ 1 – Sơ đồ kệ 5 tầng trực quan:**
     * Icon: Khung kệ / Khối tầng (Shelf Layers).
     * Tiêu đề: `Sơ đồ kệ 5 tầng trực quan`.
     * Nội dung: `Theo dõi từng ô kệ A–G × T1–T5 theo thời gian thực`.
  2. **Thẻ 2 – Kiểm soát FEFO tự động:**
     * Icon: Lịch hạn dùng & Đồng hồ (Calendar / Expiry).
     * Tiêu đề: `Kiểm soát FEFO tự động`.
     * Nội dung: `Cảnh báo hạn dùng, ưu tiên xuất kho đúng thứ tự`.
  3. **Thẻ 3 – Tra cứu QR tức thì:**
     * Icon: Mã quét QR (QR Scanner).
     * Tiêu đề: `Tra cứu QR tức thì`.
     * Nội dung: `Đối chiếu vị trí kệ và tồn kho vật lý`.

---

### 2.2. Cột Phải: Biểu Mẫu Xác Thực (Authentication Container)
* **Khối Card nền trắng:** Ô biểu mẫu được thiết kế bo góc lớn ở cạnh tiếp giáp, hiệu ứng đổ bóng mờ và ánh sáng nhẹ (soft green glow) tạo chiều sâu nổi khối.
* **Mini-Header (Định danh nhanh):**
  * Mini icon chiếc lá màu xanh.
  * Tên thương hiệu in hoa: **"GREENSEVEN MART"**.
  * Chú thích phiên bản: *"Hệ thống quản lý kệ hàng · WMS v2"*.
* **Tiêu đề & Hướng dẫn (Heading & Subtitle):**
  * Tiêu đề chính: **"Đăng nhập hệ thống"** (Font Sans-serif đậm, màu đen đậm `#0f172a`).
  * Dòng dẫn: *"Nhập thông tin để truy cập dashboard WMS"*.
* **Các trường nhập liệu (Form Fields):**
  * **Trường Tên đăng nhập:**
    * Label: `Tên đăng nhập` (in đậm vừa, màu xám đậm).
    * Input: Bo viền tinh tế, nền xám siêu nhạt, placeholder *"Nhập tên đăng nhập..."*.
  * **Trường Mật khẩu:**
    * Label: `Mật khẩu`.
    * Input: Mã hóa chấm tròn bảo mật (`••••••••`), tích hợp **Icon con mắt (Eye toggle icon)** ở góc phải trong ô input để người dùng bật/tắt xem mật khẩu.
* **Nút hành động chính (Primary CTA Button):**
  * Tên nút: **"Đăng nhập"** đi kèm icon cửa/mũi tên đăng nhập (`[->`).
  * Chiều rộng 100% (Full-width), màu nền xanh lá đậm nổi bật, chữ trắng, góc bo tròn đồng bộ.

---

## 3. BẢNG MÃ MÀU & ĐẶC TÍNH THIẾT KẾ (DESIGN TOKENS)

| Thành phần | Mã màu gợi ý / Hex | Ý nghĩa / Ứng dụng |
| :--- | :--- | :--- |
| **Primary Brand Green** | `#16a34a` / `#15803d` | Màu nút Đăng nhập, màu chữ nổi bật "Mart WMS", viền icon |
| **Dark Forest Background**| `#052e16` $\rightarrow$ `#022c22` | Nền gradient cột trái (Hero Pane) |
| **Feature Card Surface** | `rgba(255, 255, 255, 0.07)` | Nền bán trong suốt (Glassmorphism) cho 3 thẻ tính năng |
| **Border Card / Subtle** | `rgba(255, 255, 255, 0.12)` | Viền mảnh cho các thẻ tính năng |
| **Form Surface (Right)** | `#ffffff` | Nền trắng tinh khiết của form đăng nhập |
| **Text Dark / Heading** | `#0f172a` / `#1e293b` | Tiêu đề chính, label trường nhập |
| **Text Muted / Subtitle**| `#64748b` | Chú thích phụ, placeholder |

---

## 4. ĐÁNH GIÁ ỨNG DỤNG CHO DỰ ÁN ReOMStqP1 / WMS

1. **Tính trực quan và chuyên nghiệp:** Layout 2 cột giúp trang đăng nhập không bị đơn điệu, vừa thực hiện chức năng xác thực vừa "khoe" được các năng lực công nghệ lõi của hệ thống (Sơ đồ kệ 5 tầng, Thuật toán FEFO, Quét mã QR).
2. **Khả năng kế thừa cho OMS & WMS:**
   * Màu xanh lá kết hợp Dark Slate hoàn toàn đồng bộ với ngôn ngữ giao diện của hệ thống OMS hiện tại ([index.html](file:///S:/HTTT/index.html) và [`style.css`](file:///S:/HTTT/css/style.css)).
   * 3 thẻ tính năng bên trái có thể linh hoạt điều chỉnh thành các tính năng chủ chốt của OMS:
     * *Thẻ 1:* **Đồng bộ Đơn hàng 5 Kênh** (Shopee, TikTok, Lazada, FB, POS).
     * *Thẻ 2:* **Kiểm soát Tồn kho Khả dụng (ATP)** & Khóa chống bán lố (Anti-Overselling).
     * *Thẻ 3:* **Phân bổ Giữ hàng FIFO / FEFO** (Tự động trừ kho theo thứ tự ưu tiên).
