# TÀI LIỆU PHÂN TÍCH KỸ THUẬT & NGHIỆP VỤ QUẢN LÝ KHO ĐA KÊNH (SAPO OMNICHANNEL)
**Tên file:** `gn.md`
**Phạm vi:** Kiến trúc Bảo mật 3 Tầng (Frontend - Backend - Database) & Quản trị Vận hành Kho Đa kênh

---

## PHẦN I: GÓC NHÌN KỸ SƯ KỸ THUẬT (TECHNICAL ARCHITECTURE & SECURITY)

### 1. Phân định ranh giới Frontend - Backend - Database
* **Frontend (Client-side - `.html`, `.css`, `.js`):** Chạy trực tiếp trên trình duyệt của người dùng. Mọi đoạn code `.css` (ẩn/hiện giao diện) và `.js` (xử lý sự kiện, nhân ma trận thuộc tính, kiểm tra dữ liệu nhập sơ bộ) đều có thể bị đọc khi mở Công cụ cho nhà phát triển (`F12`).
* **Nguyên tắc bảo mật cốt lõi:** Tuyệt đối không ẩn giấu dữ liệu nhạy cảm (Giá vốn, Lợi nhuận, Mật khẩu, Token sàn TMĐT) bằng `.css` (`display: none`) hay lọc bằng `.js` ở Frontend. Việc cắt lọc dữ liệu bắt buộc phải thực hiện tại **Backend** trước khi trả gói tin JSON về trình duyệt.

### 2. Cơ chế ẩn giấu và bảo vệ dữ liệu nhạy cảm qua 3 tầng

| Tầng hệ thống | Kỹ thuật áp dụng | Ứng dụng thực tế trên hệ thống quản lý kho |
| :--- | :--- | :--- |
| **1. Database** | **Hashing (Băm 1 chiều + Salt)** | Mã hóa mật khẩu người dùng bằng `bcrypt`/`Argon2`, không thể dịch ngược. |
| **1. Database** | **Encryption (Mã hóa 2 chiều AES-256)** | Bảo vệ Access Token kết nối Shopee, TikTok Shop, Lazada và thông tin tài khoản. |
| **2. Backend** | **DTO Filtering / Serialization** | Khi nhân viên không có quyền xem Giá vốn gọi API `/admin/inventories.json`, Backend cắt bỏ hoàn toàn trường `cost_price` và `mac` khỏi gói tin JSON. |
| **2. Backend** | **Chống lỗ hổng IDOR** | Kiểm tra chéo tham số trên URL (như `?location_id=965392`) với `Tenant_ID` và quyền chi nhánh của tài khoản trong `HttpOnly Cookie`. Nếu tự ý đổi ID trên URL sang kho khác, Backend trả lỗi `403 Forbidden`. |
| **2. Backend** | **Data Masking (Che một phần)** | Che số điện thoại khách hàng (`090****678`) ngay trên Server để chống rò rỉ dữ liệu. |
| **3. Frontend** | **Conditional Rendering (RBAC UI)** | File `.js` đọc mảng `permissions` để ẩn các menu nhạy cảm (Sổ quỹ, Báo cáo lãi lỗ, ô Giá vốn) và dùng `.css` tự động dàn đều các cột còn lại trên bảng. |

### 3. Luồng xác thực đăng nhập (Authentication & Authorization Flow)
1. **Frontend -> Network:** Người dùng nhập Tài khoản/Mật khẩu -> File `.js` gửi `POST` request qua giao thức mã hóa **HTTPS (TLS)**.
2. **Backend -> Database:** Backend truy vấn bản ghi người dùng và lấy chuỗi mật khẩu đã băm (`Password Hash`).
3. **Xác thực tại Backend:** Băm mật khẩu người dùng vừa nhập và so sánh với `Password Hash`.
4. **Cấp phát phiên (`HttpOnly Cookie`):** Nếu khớp, Backend khởi tạo `Session ID` hoặc `JWT Token` và gắn vào trình duyệt qua header `Set-Cookie` với cờ **`HttpOnly`** (chặn mọi file `.js` đọc trộm token chống tấn công XSS) và **`Secure`**.
5. **Duy trì trạng thái:** Ở mọi thao tác chuyển trang tiếp theo, trình duyệt tự động đính kèm Cookie để Backend kiểm tra quyền hạn trước khi truy xuất Database.

### 4. Thiết kế Cơ sở dữ liệu (Database Schema) phân hệ Sản phẩm & Kho
Hệ thống tách dữ liệu thành 4 bảng cốt lõi liên kết chặt chẽ:
* **Bảng `products` (Sản phẩm gốc):** Lưu thông tin chung (`id`, `name`, `description`). Không lưu số lượng tồn kho.
* **Bảng `variants` (Phiên bản / SKU):** Quan hệ 1-N với `products`. Lưu từng phân loại Màu sắc/Kích cỡ (`id`, `product_id`, `sku`, `barcode`, `retail_price`, `compare_at_price`, và cờ `track_inventory`). Ngay cả sản phẩm không có thuộc tính cũng được ngầm tạo 1 `Default Variant`.
* **Bảng `inventories` (Tồn kho chi nhánh):** Liên kết `variant_id` với `location_id` (ví dụ: `965392`). Lưu 4 chỉ số tồn kho (`on_hand`, `committed`, `available`, `incoming`) và **Giá vốn bình quân (`mac` / `cost_price`)**.
* **Bảng `inventory_lots` (Tồn kho theo Lô - HSD):** Chỉ kích hoạt khi bật cờ Quản lý Lô và khai báo cấu trúc Lô hợp lệ (`lot_code`, `manufacture_date`, `expiry_date`, `quantity`). Nếu bật cờ Lô nhưng bỏ qua không tạo Lô ban đầu, Backend sẽ tự động hoàn tác (Rollback) về sản phẩm thường để bảo vệ tính toàn vẹn dữ liệu.

### 5. Xử lý Giao dịch toàn vẹn (Database Transaction) khi Nhập hàng & Thanh toán
* **Luồng tạo sản phẩm hàng loạt:** Tách giữa REST API đồng bộ (nút *Thêm sản phẩm*) và Hàng đợi bất đồng bộ Background Worker Queue (nút *Nhập file Excel*) để tránh lỗi `504 Gateway Timeout`.
* **Luồng Nhập kho (`REI00001`):**
  1. **Tạo đơn nhập:** Ghi vào bảng `purchase_orders` ở trạng thái *Đang giao dịch*. Chưa tăng `on_hand`, chưa ghi nhận công nợ chính thức.
  2. **Bấm `[Nhập kho]`:** Mở Database Transaction -> Tăng `on_hand` và `available` tại bảng `inventories` -> Tính lại Giá vốn bình quân (MAC) -> Ghi nhận nợ phải trả vào `accounts_payable` -> Ghi nhật ký kiểm toán vào `inventory_histories` -> Bắn Webhook đồng bộ tồn mới ra các sàn TMĐT.
  3. **Bấm `[Xác nhận thanh toán]`:** Tự động sinh Phiếu chi tại bảng `payment_vouchers` (Sổ quỹ), trừ tiền mặt/ngân hàng và cấn trừ công nợ nhà cung cấp về `0₫`, đồng thời khóa cứng chứng từ nhập.

---

## PHẦN II: GÓC NHÌN QUẢN LÝ HỆ THỐNG BÁN HÀNG ĐA KÊNH (OMNICHANNEL WAREHOUSE MANAGEMENT)

### 1. Tư duy sắp xếp 7 thẻ chức năng trong mục "Quản lý kho"
Thứ tự menu trên Sapo được thiết kế theo **Tần suất ra quyết định hàng ngày** của người quản lý chứ không theo thứ tự cài đặt ban đầu:
1. **`Tồn kho` (`/admin/inventories`):** Bức tranh thực trạng nguồn hàng, kiểm tra đầu tiên mỗi ngày để chống đứt hàng hoặc bán lố.
2. **`Đặt hàng nhập` (`/admin/purchase_orders`):** Lên kế hoạch mua hàng (PO) và kiểm soát ngân sách trước khi hàng về.
3. **`Nhập hàng` (`/admin/receive_inventories`):** Điểm chốt chặn kiểm đếm thực tế, tăng tài sản kho, tính lại giá vốn và ghi nhận công nợ.
4. **`Trả hàng nhập` (`/admin/purchase_returns`):** Xử lý hàng lỗi trả lại Nhà cung cấp minh bạch, tự động trừ tồn kho và khấu trừ công nợ (chống gian lận thủ kho tự ý sửa giảm tồn).
5. **`Chuyển kho` (`/admin/stock_transfers`):** Điều phối hàng giữa các chi nhánh thông qua trạng thái *"Đang vận chuyển"* mà không làm lệch doanh thu hay giá vốn.
6. **`Nhà cung cấp` (`/admin/suppliers`):** Quản lý danh mục đối tác, lịch sử nhập hàng và tổng dư nợ phải trả.
7. **`Vị trí lưu kho` (`/admin/storage_locations`):** Thiết lập sơ đồ vật lý của kho (cấu hình hạ tầng 1 lần, sử dụng lâu dài).

### 2. Công thức kiểm soát Tồn kho Đa kênh (Chống bán lố - Overselling)
Người quản lý kiểm soát sức khỏe kho hàng thông qua 4 cột chỉ số:
* **Tồn kho thực tế (`On-hand`):** Số lượng vật lý đang nằm trên kệ (chỉ biến động khi thực sự bấm *Nhập kho* hoặc *Xuất kho*).
* **Đang giao dịch (`Committed`):** Hàng nằm trong các đơn khách đã đặt trên Shopee, TikTok, Lazada, Web nhưng nhân viên kho chưa đóng gói xuất đi. (Nếu chỉ số này tăng cao bất thường -> Khâu đóng gói đang bị ùn tắc).
* **Tồn có thể bán (`Available to Sell`):**
  `Có thể bán = Tồn kho thực tế - Đang giao dịch`
  *(Đây là con số duy nhất được đồng bộ ra các kênh bán để khóa đơn ngay khi chạm mốc 0).*
* **Đang về (`Incoming`):** Hàng nằm trong phiếu *Đặt hàng nhập* đang trên đường về kho.

### 3. Công thức tự động tính Giá vốn bình quân gia quyền (MAC)
Mỗi khi một phiếu **Nhập hàng** mới được bấm `[Nhập kho]`, hệ thống tự động cập nhật lại Giá vốn theo công thức:
`Giá vốn bình quân mới = [(Tồn hiện tại × Giá vốn cũ) + (Số lượng nhập mới × Giá nhập mới)] / (Tồn hiện tại + Số lượng nhập mới)`

### 4. Năm quy tắc vận hành thực chiến dành cho Người quản lý
1. **Quy hoạch Vị trí lưu kho theo tọa độ 3-4 cấp (`Khu vực - Kệ - Tầng - Ô`, ví dụ `A-01-T2-01`):**
   * Áp dụng quy tắc ABC: Đặt 20% mã hàng bán chạy nhất (chiếm 80% đơn hàng) ở Khu A ngang tầm tay, gần bàn đóng gói nhất.
   * Các phân loại dễ nhầm (cùng mẫu khác Size) phải tách ra 2 ô kệ khác nhau.
2. **Quản lý ở cấp độ Phiên bản (SKU) & Chuẩn hóa mã vạch:**
   * Đặt mã SKU có cấu trúc đọc hiểu được (ví dụ: `SM-TRANG-L`) và đồng nhất giữa Sapo với các sàn TMĐT.
3. **Kỷ luật sử dụng 3 công tắc Kho khi tạo sản phẩm:**
   * Luôn bật `Quản lý số lượng tồn kho` cho hàng vật lý; tắt đối với mã dịch vụ/phí ship.
   * Tuyệt đối **tắt** `Cho phép bán âm` đối với hàng số lượng giới hạn để tránh bị sàn TMĐT phạt vì hủy đơn.
   * Chỉ bật `Quản lý theo Lô - HSD` đối với thực phẩm, mỹ phẩm, dược phẩm (áp dụng nguyên tắc **FEFO - Hết hạn trước xuất trước**). Không bật cho hàng thời trang/phụ kiện để tránh làm chậm quy trình đóng gói.
4. **Tính năng `[x] Tách dòng` khi Nhập hàng:**
   * Khi Nhà cung cấp giao chung 1 mặt hàng nhưng trộn lẫn nhiều mức giá (ví dụ hàng mua kèm hàng tặng) hoặc nhiều lô khác nhau, thủ kho tích chọn `Tách dòng` để chẻ thành các dòng độc lập trên cùng 1 phiếu nhập.
5. **Điền đầy đủ Khối lượng (`g`) và giới hạn Kênh bán:**
   * Luôn khai báo đúng khối lượng sản phẩm để tính đúng phí vận chuyển tự động. Bỏ chọn kênh `Website` đối với các mã hàng quà tặng nội bộ hoặc vật tư đóng gói (thùng carton, băng keo).