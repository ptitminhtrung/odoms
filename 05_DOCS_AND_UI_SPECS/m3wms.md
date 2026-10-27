# Tài liệu phân tích giao diện & cấu trúc trang chính (`index`): m3wms.md (Giao diện m3wmsgd)

Bản phân tích chi tiết về kiến trúc giao diện (UI/UX), cấu trúc DOM/Code của trang chính (`index`) và toàn bộ hệ thống chức năng sau khi đăng nhập của **Greenseven Mart WMS** (Mã định danh giao diện: `m3wmsgd`, tham khảo tại `https://splendid-palmier-d9e393.netlify.app/`).

---

## 1. Kiến trúc Bố cục & Cấu trúc Code (`index` Layout Architecture)

Giao diện trang chính được thiết kế theo mô hình **Admin Dashboard Layout (Sidebar + Main Workspace)** điển hình của các ứng dụng Single Page Application (SPA):

* **Khung điều hướng trái (`<aside>` / Sidebar Navigation):** Cố định chiều rộng (Fixed-width), nền xanh đen đậm (`#0D1F12`), chữ trắng/xám nhạt tạo độ tương phản cao và tách biệt hoàn toàn với vùng làm việc chính.
* **Khung nội dung chính (`<main>` / Main Content Area):** Chiếm phần lớn diện tích bên phải, nền xám nhạt/trắng, hỗ trợ cuộn dọc (`overflow-y: auto`) độc lập với Sidebar. Bao gồm:
  * **Thanh tiêu đề trên cùng (`<header>` / Topbar):** Cố định ở đỉnh vùng làm việc, chứa tiêu đề phân hệ hiện tại, định danh vị trí kho và nút công cụ thao tác nhanh (Quick Action).
  * **Vùng hiển thị dữ liệu (`<section>` / Dashboard Grid & Data Table):** Sử dụng CSS Grid và Flexbox để chia các khối thẻ KPI, biểu đồ, danh sách cảnh báo và bảng dữ liệu tồn kho.
* **Điểm lưu ý về Responsive (Khả năng đáp ứng kích thước màn hình):** Khi khung nhìn trình duyệt (viewport) bị thu hẹp chiều ngang, thanh Sidebar vẫn giữ nguyên kích thước cố định khiến vùng Main Content bị ép hẹp lại. Hệ quả là nhóm 4 thẻ KPI (`Grid 4 cột`) bị bóp nghẹt chiều ngang làm chữ bên trong bị ngắt dòng liên tục, và thanh Topbar xuất hiện thanh cuộn ngang.

---

## 2. Phân tích Hệ thống Điều hướng & Danh mục Chức năng (Sidebar Menu)

### A. Khối Thương hiệu & Hồ sơ phiên làm việc (Header & User Profile Card)
* **Logo & Tên hệ thống:** Biểu tượng chiếc lá trên nền xanh lá tươi kèm tên **"Greenseven Mart WMS"**.
* **Thẻ định danh người dùng (User Session Card):** Khung bo góc nền xanh rêu tối hiển thị:
  * **Avatar viết tắt:** Hình tròn nền trắng chữ **"CC"**.
  * **Họ tên & Vai trò (RBAC Role):** **"Nguyễn Chí Cường"** — Chức vụ: **"Quản lý kho"**.
  * **Trạng thái hoạt động (Online Indicator):** Chấm tròn màu xanh lá sáng ở góc phải thẻ, báo hiệu phiên kết nối đang hoạt động (Active).

### B. Nhóm chức năng 1: TỔNG QUAN (Nghiệp vụ vận hành kho cốt lõi)
Nhóm điều hướng phục vụ trực tiếp cho công việc giám sát và điều phối hàng hóa hàng ngày:
1. **Dashboard (Trang chủ tổng quan):** Trung tâm tổng hợp mọi chỉ số KPI, biểu đồ, cảnh báo FEFO và bảng tồn kho toàn diện. Mục đang kích hoạt (*Active state*), phủ nền xanh lá tươi bo góc.
2. **Nhập / Xuất kho (Inbound / Outbound):** Phân hệ thực hiện tạo phiếu nhập hàng mới, xuất hàng đi siêu thị/cửa hàng và cập nhật biến động số lượng tồn.
3. **Sơ đồ kệ hàng (Rack / Bin Layout Map):** Trực quan hóa vị trí không gian của **280 ô kệ** (chia theo 7 dãy kệ A, B, C, D, E, F, G × 8 kệ × 5 tầng T1 đến T5), trong đó có **252 ô đang sử dụng** (90% công suất) và **28 ô trống** (10% năng lực), phân chia theo Khu Mát, Khu Lạnh/Đông và Khu Thường.
4. **Kiểm soát FEFO (First Expired, First Out):** Phân hệ chuyên biệt quản lý hạn sử dụng. Tích hợp **Badge thông báo màu cam hiển thị số `5`** ở góc phải, báo hiệu có 5 lô hàng đang nằm trong ngưỡng cảnh báo cận hạn cần ưu tiên điều phối xuất trước.
5. **Hàng sắp hết (Low Stock / Out of Stock):** Theo dõi các mã hàng chạm ngưỡng tồn kho tối thiểu hoặc đã cạn kiệt. Tích hợp **Badge thông báo màu đỏ hiển thị số `2`**, khớp chính xác với 2 ô kệ đang trống hoàn toàn (`0%`) cần nhập bù ngay.
6. **QR / Tra cứu (QR Code & Lookup):** Công cụ giải mã mã định danh QR của từng lô/kệ hàng (ví dụ: `GS-XANH-0528`) và tìm kiếm nhanh thông tin chi tiết của sản phẩm trong kho.

### C. Nhóm chức năng 2: HỆ THỐNG (Quản trị & Cấu hình)
Nhóm điều hướng dành cho cấp quản lý và quản trị viên hệ thống:
1. **Lịch sử đăng nhập (Access Logs / Audit Trail):** Ghi vết thời gian, tài khoản và thiết bị truy cập vào hệ thống WMS để phục vụ kiểm toán bảo mật.
2. **Nhân sự (Staff Management):** Quản lý danh sách nhân viên kho, phân công ca trực và phân quyền thao tác theo vai trò.
3. **Báo cáo (Reports & Analytics):** Kết xuất dữ liệu thống kê nhập/xuất/tồn, tỷ lệ hao hụt, hiệu suất luân chuyển hàng FEFO theo kỳ.
4. **Cài đặt (System Settings):** Thiết lập tham số hệ thống (ngưỡng ngày cảnh báo FEFO, sức chứa định mức mỗi ô kệ, danh mục sản phẩm hữu cơ).

### D. Chức năng kết thúc phiên
* **Nút `[Đăng xuất]`:** Đặt cố định ở đáy Sidebar với icon mũi tên thoát ra ngoài, giúp người dùng đóng phiên làm việc an toàn.

---

## 3. Phân tích Thanh Tiêu đề trên cùng (Topbar Header)

Thanh Header của vùng làm việc chính được thiết kế gọn gàng nhưng chứa các thành phần định vị và tác vụ tức thời cực kỳ quan trọng:
* **Tiêu đề ngữ cảnh (Page Title):** Chữ hiển thị tên phân hệ hiện tại (**"Dashboard"**) in đậm cỡ lớn bên trái.
* **Thẻ định danh vị trí kho (Warehouse Location Badge):** Nằm kề bên tiêu đề là badge hình viên thuốc (pill-shaped) viền xanh lá nhạt, nền xanh bạc hà chứa nội dung **"Kho Bình Tân"**, giúp nhận biết rõ ngữ cảnh chi nhánh đang quản trị.
* **Nút hành động nhanh `[Quét QR]` (Quick Action Button):** Nằm ở ngoài cùng góc phải trên, thiết kế dạng nút bo góc có viền xanh, nền xanh nhạt kèm biểu tượng mã QR và nhãn **"Quét QR"** (`[::] Quét QR`). Bấm mở ngay camera hoặc máy quét mã vạch cầm tay ở bất kỳ thời điểm nào.

---

## 4. Phân tích Vùng Nội dung Nghiệp vụ Dashboard & Cấu trúc Dữ liệu

### A. Thanh trạng thái FEFO (System Status Banner)
* Khung thông báo viền mảnh nền xanh nhạt chạy ngang:
  * Bên trái: Chấm xanh hoạt động + Thông điệp cốt lõi: *"FEFO đang hoạt động — Hàng cận hạn được ưu tiên xuất trước"*.
  * Bên phải: Icon kệ + Con số thống kê tổng quát: *"252 ô kệ đang theo dõi"*.

### B. Khối 4 Thẻ Chỉ số KPI (Summary Metric Cards)
Bố trí theo CSS Grid 4 cột ngang bằng nhau:
* **Ô kệ đang sử dụng:** Giá trị **`252`** — *Đã gán sản phẩm · khớp Sơ đồ kệ hàng* (trên tổng 280 ô kệ của 7 dãy A–G).
* **Cần xuất ngay (FEFO):** Giá trị **`1`** (chữ và icon cảnh báo ngọn lửa màu đỏ rực) — *Dưới 3 ngày hết hạn*.
* **Cảnh báo sắp hết hạn:** Giá trị **`5`** (icon lịch hẹn cảnh báo màu cam) — *Trong vòng 7 ngày*.
* **Ô kệ hết hàng:** Giá trị **`2`** (icon ô kệ gạch chéo màu xám) — *Cần nhập bù*.

---

### C. Khối Biểu đồ Thống kê (Analytics Charts & Design Metrics)

#### 1. Biểu đồ Đường & Vùng: "Nhập / Xuất kho theo tháng"
* **Trục tung (Y-axis):** Thang đo số lượng giao dịch/kiện hàng với dải giá trị từ **$0 \rightarrow 24$** (bước nhảy 4 đơn vị: $0, 4, 8, 12, 16, 20, 24$).
* **Trục hoành (X-axis):** Trục thời gian gồm 6 mốc tháng liên tiếp: **`Th5/26`**, **`Th6/26`**, **`Th7/26`**, **`Th8/26`**, **`Th9/26`**, **`Th10/26`**.
* **Đường dữ liệu & Xu hướng (Lines Trend):**
  * **Đường Nhập kho (Màu xanh dương `#2563eb`):** Đi ngang ở mức thấp từ Th5 đến Th9, bứt phá tăng vọt lên mức **~23** vào tháng 10/2026.
  * **Đường Xuất kho (Màu xanh lá `#16a34a`):** Đi kèm vùng phủ mờ bên dưới, duy trì sát đáy từ Th5 đến Th9 và tăng vọt lên đỉnh **~24** vào tháng 10/2026.
* **Ý nghĩa nghiệp vụ:** Phản ánh hoạt động kho đạt điểm bùng nổ vận hành mạnh mẽ nhất vào tháng 10/2026.

#### 2. Biểu đồ Tròn Donut: "Phân bổ tình trạng kệ - Theo trạng thái FEFO · 252 ô"
Trực quan hóa cơ cấu tình trạng hạn sử dụng của toàn bộ 252 ô kệ vật lý thông qua biểu đồ Donut với 4 mã màu chuẩn:
* 🟢 **Bình thường (Normal):** Màu xanh lá cây (`#16a34a`), chiếm tuyệt đại đa số (~97%, **244 ô kệ**) — hàng hóa có hạn sử dụng an toàn xa.
* 🟡 **Sắp hết hạn (Near Expiry):** Màu vàng cam (`#f59e0b`), chiếm **5 ô kệ** — hàng hóa nằm trong ngưỡng 7 ngày cần ưu tiên đẩy bán.
* 🔴 **Khẩn cấp (Urgent / Critical):** Màu đỏ (`#ef4444`), chiếm **1 ô kệ** — hàng dưới 3 ngày hết hạn, cần xuất kho ngay lập tức.
* ⚪ **Hết hàng (Out of Stock):** Màu xám (`#94a3b8`), chiếm **2 ô kệ** — ô kệ rỗng hoàn toàn, cần nhập bổ sung.

#### 3. Bảng Thống kê Danh mục: "Tồn kho theo danh mục hữu cơ"
* **Ngữ cảnh:** *Tháng 6/2026 — đơn vị: kg/thùng*.
* **Chú giải:** Nhãn màu xanh lá *"Số lượng tồn"*.
* **Các nhóm hàng theo dõi:** Rau củ hữu cơ, Trái cây tươi, Sữa & Sản phẩm sữa, Thịt & Hải sản, Đông lạnh, Đồ uống, Thực phẩm khô, Gia vị.

---

### D. Khối "Cảnh báo cần xử lý" (Actionable Alerts List — 6 mục)
Danh sách liệt kê đích danh 6 lô hàng cần ưu tiên xử lý xuất kho theo chuẩn FEFO (sắp xếp tăng dần theo số ngày còn lại trước khi hết hạn tính từ mốc thời gian hệ thống):
1. **Thịt heo hữu cơ sạch — Kệ D1-T1:** Hết hạn `26/10/2026` · Còn **2 ngày** · 12 đơn vị · Trạng thái: **`Xuất ngay!`** (Khớp với thẻ KPI "Cần xuất ngay: 1").
2. **Rau muống hữu cơ — Kệ A3-T2:** Hết hạn `27/10/2026` · Còn **3 ngày** · 8 đơn vị · Trạng thái: `FEFO: Ưu tiên xuất`.
3. **Rau húng quế tươi — Kệ A3-T3:** Hết hạn `28/10/2026` · Còn **4 ngày** · 12 đơn vị · Trạng thái: `FEFO: Ưu tiên xuất`.
4. **Rau cải xanh — Kệ A1-T1:** Hết hạn `29/10/2026` · Còn **5 ngày** · 30 đơn vị · Trạng thái: `FEFO: Ưu tiên xuất`.
5. **Thịt bò Wagyu hữu cơ — Kệ D1-T2:** Hết hạn `30/10/2026` · Còn **6 ngày** · 8 đơn vị · Trạng thái: `FEFO: Ưu tiên xuất`.
6. **Xà lách cuộn hữu cơ — Kệ A1-T2:** Hết hạn `31/10/2026` · Còn **7 ngày** · 45 đơn vị · Trạng thái: `FEFO: Ưu tiên xuất`.

---

### E. Bảng Dữ liệu "Tồn kho hiện tại" (Inventory Data Table — 252 dòng hàng)
* **Bộ lọc nhanh (Filter Tabs):** Cho phép lọc bảng tức thời (Client-side filtering) theo trạng thái (`[Tất cả]`, `[Bình thường]`, `[Sắp hết hạn]`, `[Khẩn cấp]`, `[Hết hàng]`) hoặc theo tầng kệ (`[Tất cả tầng]`, `[T1 — Sàn]`, `[T2 — Thấp]`, `[T3 — Giữa]`, `[T4 — Cao]`, `[T5 — Đỉnh]`).
* **Cấu trúc 9 cột dữ liệu (`<table>` Schema):**
  1. `KỆ / TẦNG`: Mã vị trí vật lý gồm Dãy kệ + Tầng (VD: `A1 T1`, `D1 T1`, `F1 T1`).
  2. `SẢN PHẨM`: Tên thương mại của mặt hàng hữu cơ.
  3. `MÃ QR`: Định danh duy nhất của lô kệ (`GS-XANH-0528`, `GS-THIT-0625`, `GS-FILL-C1T3-BT`,...).
  4. `DANH MỤC`: Phân loại nhóm ngành hàng.
  5. `TỒN KHO`: Hiển thị theo định dạng `Số lượng hiện tại / Sức chứa tối đa` (VD: `30 / 80`, `0 / 40`).
  6. `MỨC ĐẦY`: Tỷ lệ phần trăm lấp đầy ô kệ (`Tồn kho / Sức chứa * 100%`, VD: `38%`, `0%`).
  7. `HẠN SD`: Ngày hết hạn định dạng `DD/MM/YYYY` kèm số ngày còn lại trong ngoặc đơn `(Xn)` (VD: `29/10/2026 (5n)`). Hàng đã hết hiển thị `- (-)`.
  8. `TRẠNG THÁI`: Nhãn phân loại trực quan kèm icon (`Bình thường`, `Sắp hết hạn`, `Khẩn cấp`, `Hết hàng`).
  9. `THAO TÁC`: Chứa 2 nút icon hành động (xem mã QR/chi tiết và chỉnh sửa/xuất-nhập nhanh tại kệ).

---

## 5. Mối liên kết nghiệp vụ với Hệ sinh thái OMS (`ReOMStqP1`)

Giao diện Dashboard `m3wmsgd` đóng vai trò là **Điểm tiếp nhận và hiện thực hóa mệnh lệnh vận hành từ Hệ thống OMS đa kênh**:

```
+-------------------------------------------------------------+
|    TẦNG BÁN HÀNG ĐA KÊNH: Shopee, TikTok, Lazada, FB, POS   |
+-------------------------------------------------------------+
                              |
                              v (Đẩy đơn hàng về)
+-------------------------------------------------------------+
|         HỆ THỐNG ĐIỀU PHỐI OMS TRUNG TÂM (ReOMStqP1)        |
|  1. Chuẩn hóa Canonical Schema                              |
|  2. Kiểm tra hợp lệ & Đối chiếu Tồn kho Khả dụng (ATP)      |
|  3. Thuật toán phân bổ FIFO (Đơn hàng) & FEFO (Lô hàng)     |
+-------------------------------------------------------------+
                              |
                              v (Đẩy lệnh giữ hàng & trừ kho vật lý)
+-------------------------------------------------------------+
|               DASHBOARD WMS KHO HÀNG (m3wmsgd)              |
|  - Thẻ "Cần xuất ngay (1)": Nhận lệnh xuất lô D1-T1         |
|  - Thẻ "Cảnh báo cận hạn (5)": Ưu tiên xuất theo FEFO       |
|  - Thẻ "Ô kệ hết hàng (2)": Báo động nhập bù hàng           |
|  - Bảng tồn kho 252 ô kệ: Cập nhật biến động tức thì        |
+-------------------------------------------------------------+
```

1. **Đồng bộ hóa quyết định phân bổ FEFO:** Khi bộ máy OMS ([`oms_engine.js`](file:///S:/HTTT/js/oms_engine.js)) tiếp nhận đơn hàng từ các sàn TMĐT và quyết định giữ hàng từ các lô cận hạn, dữ liệu sẽ ánh xạ lập tức xuống WMS:
   * Lô hàng cận date nhất (Thịt heo D1-T1 còn 2 ngày) được gán vào đơn giao nhanh $\rightarrow$ WMS cập nhật thẻ KPI **"Cần xuất ngay (1)"**.
   * Nhân viên kho nhìn vào Dashboard `m3wmsgd` là biết chính xác cần di chuyển tới dãy kệ nào (D1 tầng 1) để lấy đúng kiện hàng.
2. **Khóa chống bán lố (Anti-Overselling) & Kích hoạt chu trình nhập bù:**
   * Khi OMS phân bổ hết toàn bộ tồn kho khả dụng của một mặt hàng, trạng thái trên WMS chuyển sang **"Ô kệ hết hàng (2)"** (kèm badge đỏ trên Sidebar).
   * Giúp quản lý kho phát hiện ngay mặt hàng cạn kiệt để tạo phiếu nhập kho bổ sung, đảm bảo chuỗi cung ứng không bị gián đoạn.
