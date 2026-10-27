# TÀI LIỆU PHÂN TÍCH GIAO DIỆN MẪU: m3wmsgd (DASHBOARD TỔNG QUAN)
**Mã giao diện:** `m3wmsgd`  
**Chức năng:** Dashboard Trung tâm Giám sát & Điều phối Vận hành Kho (WMS Overview Dashboard)  
**Hội thoại:** `ReOMStqP1`  
**Nguồn tham khảo:** Ảnh giao diện mẫu hệ thống *Greenseven Mart WMS* (`splendid-palmier-d9e393.netlify.app`)  
**Thư mục lưu trữ:** `S:\HTTT\ht\m3wmsgd.md`  
**Ngày ghi nhận:** 24/10/2026  

---

## 1. TỔNG QUAN KIẾN TRÚC BỐ CỤC (ADMIN DASHBOARD LAYOUT)

Giao diện **`m3wmsgd`** đại diện cho màn hình làm việc chính sau khi đăng nhập thành công từ màn hình `m2wmsgd`, tuân thủ mô hình chuẩn **Sidebar Navigation + Main Dashboard Content**:

```
+---------------------------+---------------------------------------------------------------------------------------+
|  SIDEBAR (TỐI #0D1F12)   |  TOPBAR: Dashboard [Kho Bình Tân]                            [Quét QR Button]        |
|  - Brand: Greenseven WMS  +---------------------------------------------------------------------------------------+
|  - User: CC - Quản lý kho |  BANNER: FEFO đang hoạt động - Hàng cận hạn ưu tiên xuất trước  | 252 ô kệ theo dõi   |
|                           +-------------------+-------------------+-------------------+-------------------+
|  [TỔNG QUAN]              | Ô kệ đang dùng    | Cần xuất ngay     | Cảnh báo sắp hết  | Ô kệ hết hàng     |
|  * Dashboard (Active)     | 252               | 1 (Dưới 3 ngày)   | 5 (Trong 7 ngày)  | 2 (Cần nhập bù)   |
|  - Nhập / Xuất kho        +-------------------+-------------------+-------------------+-------------------+
|  - Sơ đồ kệ hàng          | BIỂU ĐỒ 1:                            | BIỂU ĐỒ 2:                            |
|  - Kiểm soát FEFO (5)     | Nhập / Xuất kho theo tháng            | Phân bổ tình trạng kệ (Donut FEFO)    |
|  - Hàng sắp hết (2)       | (Đường xu hướng Th5/26 -> Th10/26)    | (252 ô: Bình thường, Cận hạn, Hết)    |
|  - QR / Tra cứu           +---------------------------------------+---------------------------------------+
|  [HỆ THỐNG] ...           | DANH MỤC: Tồn kho theo danh mục hữu cơ (Tháng 6/2026 - đơn vị: kg/thùng)              |
+---------------------------+---------------------------------------------------------------------------------------+
```

---

## 2. PHÂN TÍCH CHI TIẾT CÁC KHỐI CHỨC NĂNG CỦA m3wmsgd

### 2.1. Thanh điều hướng bên trái (Sidebar Navigation)
* **Khối Nhận diện & Hồ sơ tài khoản:**
  * **Brand Header:** Icon lá xanh + Tên **"Greenseven Mart WMS"**.
  * **User Profile Card:**
    * Avatar viết tắt: `CC` (vòng tròn nền trắng chữ đen).
    * Họ tên & Chức vụ: **Nguyễn Chí Cường** – *Quản lý kho*.
    * Chỉ báo trạng thái: Chấm tròn xanh lá phát sáng (Active/Online status).
* **Phân nhóm chức năng 1: TỔNG QUAN (Vận hành kho hàng ngày)**
  1. **Dashboard:** Mục đang được kích hoạt (*Active state*), phủ nền xanh lá tươi bo góc, icon dashboard sáng nổi bật.
  2. **Nhập / Xuất kho:** Icon xe nâng/kiện hàng (`Inbound / Outbound management`).
  3. **Sơ đồ kệ hàng:** Icon kệ 3 tầng (`Rack layout visualization`).
  4. **Kiểm soát FEFO:** Icon lịch đồng hồ, tích hợp **Badge màu cam hiển thị số `5`** (cảnh báo có 5 lô sắp hết hạn).
  5. **Hàng sắp hết:** Icon tam giác cảnh báo, tích hợp **Badge màu đỏ hiển thị số `2`** (báo có 2 ô kệ hết hàng cần nhập bù).
  6. **QR / Tra cứu:** Icon quét mã QR (`Mobile & Scanner lookup`).
* **Phân nhóm chức năng 2: HỆ THỐNG (Quản trị & Báo cáo)**
  * Lịch sử đăng nhập (Audit log).
  * Nhân sự (User & Role management).
  * Báo cáo (Analytics & Export).
  * Cài đặt (System settings).
* **Chân trang Sidebar:**
  * Nút **Đăng xuất (Logout)** với icon cửa mở thoát ra ngoài.

---

### 2.2. Thanh tiêu đề trên cùng (Topbar Header)
* **Tiêu đề phân hệ:** Chữ **"Dashboard"** lớn, font Sans-serif in đậm.
* **Vị trí chi nhánh / Kho:** Nhãn bo góc (Pill Tag) nền xanh nhạt: `Kho Bình Tân`.
* **Nút tác vụ nhanh (Quick Action Button):** Nút **`[::] Quét QR`** đặt ở góc phải trên cùng, viền xanh bo góc mềm, hỗ trợ thủ kho bấm mở camera quét mã QR tức thì trên thiết bị cầm tay.

---

### 2.3. Banner thông báo hệ thống (System Status Banner)
* **Vị trí:** Nằm ngay dưới Topbar, chạy dọc toàn bộ chiều ngang vùng làm việc.
* **Nội dung bên trái:** Chấm xanh hoạt động + Thông điệp cốt lõi: *"FEFO đang hoạt động – Hàng cận hạn được ưu tiên xuất trước"*.
* **Thông tin bên phải:** Icon kệ + Con số thống kê: *"252 ô kệ đang theo dõi"*.

---

### 2.4. Hàng 4 Thẻ chỉ số KPI (Overview Metric Cards)
Được bố trí theo dạng CSS Grid 4 cột ngang bằng nhau, giúp người quản lý nắm bắt tình trạng kho chỉ trong 3 giây:

| Thẻ KPI | Con số | Icon & Màu sắc | Diễn giải nghiệp vụ | Khớp nối dữ liệu |
| :--- | :---: | :---: | :--- | :--- |
| **Ô kệ đang sử dụng** | **252** | Icon ô kệ (Xanh lá) | Đã gán sản phẩm · khớp Sơ đồ kệ hàng | Chiếm 90% công suất kho (252 / 280 ô kệ) |
| **Cần xuất ngay (FEFO)** | **1** | Icon ngọn lửa (Đỏ rực) | $\le 3$ ngày hết hạn | Cảnh báo khẩn cấp, cần ưu tiên giữ hàng xuất đơn ngay |
| **Cảnh báo sắp hết hạn** | **5** | Icon lịch hẹn (Cam) | Trong vòng 7 ngày | Cận date, đồng bộ với Badge `5` trên Sidebar |
| **Ô kệ hết hàng** | **2** | Icon ô trống gạch chéo (Xám) | Cần nhập bù | Tồn kho vật lý về 0, đồng bộ Badge `2` trên Sidebar |

---

### 2.5. Khu vực Đồ thị Phân tích (Analytics Charts)
Gồm 2 đồ thị trực quan đặt cạnh nhau trên tỷ lệ lưới 1:1:

1. **Biểu đồ Đường & Vùng (Area / Line Chart) – "Nhập / Xuất kho theo tháng":**
   * **Trục tung (Y-axis):** Số lượng kiện / lượt giao dịch ($0 \rightarrow 24$).
   * **Trục hoành (X-axis):** Dòng thời gian từ tháng $5/2026 \rightarrow 10/2026$ (`Th5/26`, `Th6/26`, `Th7/26`, `Th8/26`, `Th9/26`, `Th10/26`).
   * **Đường dữ liệu:**
     * Đường màu xanh dương: Dữ liệu **Nhập kho** (tăng vọt lên mốc ~23 vào Th10/26).
     * Đường màu xanh lá: Dữ liệu **Xuất kho** (tăng mạnh lên mốc ~24 vào Th10/26).
   * **Ý nghĩa:** Phản ánh xu hướng biến động hàng hóa đạt đỉnh vào tháng 10/2026.

2. **Biểu đồ Tròn Donut (Donut Chart) – "Phân bổ tình trạng kệ - Theo trạng thái FEFO · 252 ô":**
   * **Cấu trúc vòng:** Tỷ lệ phần lớn áp đảo màu xanh lá (Bình thường), một lát cắt nhỏ màu cam (Sắp hết hạn), lát cắt đỏ (Khẩn cấp/Cần xuất ngay) và xám (Hết hàng).
   * **Bảng chú giải (Legend):**
     * 🟢 **Bình thường** (Hạn dùng an toàn, chiếm đa số).
     * 🟠 **Sắp hết hạn** (5 ô).
     * 🔴 **Khẩn cấp** (1 ô).
     * ⚪ **Hết hàng** (2 ô).

---

### 2.6. Khối Thống kê Danh mục bên dưới (Category Inventory)
* **Tiêu đề:** *"Tồn kho theo danh mục hữu cơ - Tháng 6/2026 — đơn vị: kg/thùng"*.
* **Chú giải:** Nhãn màu xanh lá *"Số lượng tồn"*.

---

## 3. ĐÁNH GIÁ MỐI LIÊN KẾT GIỮA m3wmsgd VÀ HỆ THỐNG OMS (ReOMStqP1)

1. **Sự kết hợp hoàn hảo giữa OMS (Điều phối đơn) và WMS (Quản lý kệ vật lý):**
   * Trong chuỗi cung ứng độc lập, **OMS tiếp nhận đơn hàng đa kênh** (Shopee, TikTok, Lazada, POS, FB) và chạy thuật toán phân bổ FIFO & FEFO.
   * Khi OMS ra quyết định giữ hàng cho một đơn, dữ liệu sẽ ánh xạ trực tiếp xuống **Dashboard `m3wmsgd` của WMS**:
     * Đơn hàng yêu cầu xuất lô cận date $\rightarrow$ Dashboard WMS lập tức cập nhật thẻ **"Cần xuất ngay (FEFO)"** và hiển thị ô kệ chính xác (ví dụ ô `D1-T1`).
     * Đơn hàng xuất hết hàng của một mã $\rightarrow$ Dashboard WMS cập nhật thẻ **"Ô kệ hết hàng (2)"** để thủ kho lên kế hoạch nhập bù.
2. **Kế thừa thiết kế giao diện:**
   * Hệ thống thẻ 4 KPI Cards và cấu trúc Sidebar phân cấp của `m3wmsgd` có thể áp dụng tương thích 1:1 cho màn hình OMS Dispatcher hoặc tích hợp thành một phân hệ WMS chuyên sâu kết nối trực tiếp với OMS.
