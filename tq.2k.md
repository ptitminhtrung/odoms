# Đề xuất Cập nhật 2 Khối Chức năng tại Thẻ "Tổng quan" (`tq.2k.md`)

Tài liệu này ghi nhận đề xuất bố trí lại vị trí và nội dung của 2 khối giao diện từ ảnh thiết kế gốc vào hệ thống **ODOMS** hiện tại.

---

## 1. Khối 1: "Tình trạng đơn trên Kênh Bán Hàng" (5 kênh)

* **Phương án vị trí (Thay thế):**
  * Đưa vào **thay thế vị trí của bảng "Xếp Hạng Sản Phẩm Bán Chạy" hiện tại** (tức là nằm ở **cột bên phải**, cạnh biểu đồ tròn Donut 5 kênh trong khối **Doanh Thu Bán Hàng** — khớp với hàng trên trong ảnh mẫu).
* **Nội dung & Biểu đồ hiển thị:**
  * Chuyển từ việc chỉ hiển thị Top 3 kênh sang hiển thị **đầy đủ cả 5 kênh bán hàng** trên trục ngang: `Shopee`, `TikTok Shop`, `Lazada`, `Cửa hàng POS`, `Facebook`.
  * Sử dụng **Biểu đồ cột chồng (Stacked Bar Chart)** gồm 3 thành phần trạng thái đơn trên mỗi cột:
    * 🟦 **Tiếp nhận** (Màu xanh đậm)
    * 🟦 **Xuất hàng** (Màu xanh nhạt)
    * 🟥 **Huỷ đơn** (Màu đỏ hồng)

---

## 2. Khối 2: "Tình trạng Kho hàng & Đơn hoàn" và "Xếp Hạng Sản Phẩm Bán Chạy"

* **Phương án vị trí (Thay thế):**
  * **Thay thế khối "Xếp hạng Top 3 Kênh Bán Hàng Dẫn Đầu Về Doanh Thu"** hiện tại bằng một hàng gồm **2 bảng đặt cạnh nhau (lưới 2 cột)** giống bố cục trong ảnh mẫu:
    1. **Cột bên trái:** Bảng **"Xếp Hạng Sản Phẩm Bán Chạy"** (hiển thị danh sách sản phẩm bán chạy, số lượng đã bán, doanh thu, tồn kho còn lại).
    2. **Cột bên phải:** Khối **"Tình trạng Kho hàng & Đơn hoàn"**:
       * **Phần trên (Cảnh báo kho hàng):** Danh sách các sản phẩm sắp hết hàng / cần nhập thêm kèm số lượng và nút thao tác nhanh **`Nhập`**.
       * **Phần dưới (`Thống kê hoàn/huỷ đơn`):** Thống kê nhanh tình trạng đơn hoàn trả / huỷ đơn.

---

## 3. Tóm tắt Bố cục Thẻ "Tổng quan" sau khi cập nhật

| Thứ tự hàng | Cột Trái | Cột Phải |
| :--- | :--- | :--- |
| **Hàng 1 (4 Thẻ KPI)** | `Kho hàng` · `Đơn hàng các kênh` | `Quản lý Vận đơn` · `Vận chuyển đơn` |
| **Hàng 2 (Doanh thu & Kênh)** | Biểu đồ Donut 5 Kênh (**Doanh Thu Bán Hàng**) | Biểu đồ cột chồng 5 kênh (**Tình trạng đơn trên Kênh Bán Hàng**) |
| **Hàng 3 (Sản phẩm & Kho)** | Bảng **Xếp Hạng Sản Phẩm Bán Chạy** | Khối **Tình trạng Kho hàng & Đơn hoàn** |
| **Hàng 4 (Xu hướng)** | Biểu đồ đường Spline **Tiếp nhận và Xuất hàng** (Toàn chiều ngang) | *(Gộp chung toàn chiều ngang)* |
