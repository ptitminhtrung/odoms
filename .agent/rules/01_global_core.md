---
trigger: always_on
---

# ODOMS — Quy tắc Lõi Toàn cục (Tầng 1 — Always On)

Bộ quy tắc này luôn được kích hoạt tự động trong mọi cuộc hội thoại và mọi thao tác liên quan đến dự án **Hệ thống Quản lý Đơn hàng Đa kênh Thông minh (ODOMS)** tại thư mục gốc `S:\HTTT\`.

---

## 1. Ba Quy tắc Kiểm soát Phạm vi & Kỷ luật Thao tác (`S:\HTTT\`)

1. **Giới hạn thư mục làm việc duy nhất**: Chỉ truy cập, đọc và thao tác tệp bên trong thư mục `S:\HTTT\`. Tuyệt đối không tạo, sửa, xóa hoặc tham chiếu mã nguồn ngoài phạm vi này.
2. **Trình bày phương án trước khi sửa**: Trước khi chỉnh sửa bất kỳ tệp mã nguồn ứng dụng hay cấu trúc dữ liệu nào, bắt buộc trình bày rõ phương án kỹ thuật, kiến trúc, cấu trúc trang tính (nếu có) và danh sách chính xác các tệp dự kiến tác động — **chỉ thực hiện sau khi người dùng xác nhận đồng ý**.
3. **Báo cáo đối chiếu chi tiết sau khi sửa**: Sau mỗi đợt chỉnh sửa, báo cáo đầy đủ từng tệp đã thay đổi, thuộc thư mục nào trong `S:\HTTT\`, tóm tắt nội dung thay đổi và khoảng số dòng cụ thể, kèm kết quả chạy script gác cổng `node S:\HTTT\tools\verify_odoms.js`.

---

## 2. Bảo toàn Tuyệt đối Dữ liệu Lõi & Nghiệp vụ Bất biến

### 2.1. Bốn Tài khoản Phân quyền Gốc (`NhanSu` / `DEFAULT_OMS_USERS`)
Tuyệt đối không xóa, đổi vai trò hoặc làm sai lệch quy tắc hiển thị của 4 tài khoản gốc:

| Mã NS | Tên đăng nhập | Họ và tên | Vai trò | Quy tắc bảo toàn bắt buộc |
| :--- | :--- | :--- | :--- | :--- |
| `USR-001` | `dttd` | Đỗ Thị Thuỳ Dung | Chuyên viên Vận hành | `isRoot: true`, `isHiddenBackup: false` — Quản trị chính. |
| `USR-002` | `lhmt` | Lê Hoàng Minh Trung | Chuyên viên Vận hành (Dự phòng) | `isRoot: true`, `isHiddenBackup: true` — **Ẩn khỏi danh sách đăng nhập nhanh** và giữ lời chào đặc thù **`"Chào bạn, Admin"`** trên Sidebar. |
| `USR-003` | `ntqg` | Nguyễn Thị Quỳnh Giao | Chuyên viên Điều phối | `isRoot: false`, `isHiddenBackup: false` — Nhân viên nghiệp vụ. |
| `USR-004` | `nttn` | Nguyễn Thị Thúy Ngân | Quản lý kho | `isRoot: false`, `isHiddenBackup: false` — Nhân viên nghiệp vụ. |

### 2.2. Kịch bản Kiểm thử Tranh chấp Tồn kho `SP-AO-POLO-01`
- Sản phẩm mẫu chuẩn: **`SP-AO-POLO-01`** (*Áo Polo Nam Coolmate Pro (Đen - Size L)*), đơn giá `250000`, tồn vật lý đúng **10 cái**, phân tách đúng **2 lô**:
  - `LO-2026-A1` (`OD-POLO-1001`, nhập `2026-10-01`, HSD `2027-10-01`): **6 cái**.
  - `LO-2026-A2` (`OD-POLO-1010`, nhập `2026-10-10`, HSD `2027-10-10`): **4 cái**.
- Bốn đơn tranh chấp tồn kho xuyên 4 kênh ngày `22/11/2026` (tổng nhu cầu `4 + 4 + 2 + 3 = 13 > 10`):
  1. `SP261122001` (Shopee, `08:15:10`, SL `4`) → Giữ hàng thành công (tồn khả dụng còn `6`).
  2. `TT261122101` (TikTok Shop, `08:16:05`, SL `4`) → Giữ hàng thành công (tồn khả dụng còn `2`).
  3. `POS261122301` (POS, `08:17:20`, SL `2`) → Giữ hàng thành công (tồn khả dụng còn `0`).
  4. `LZ261122201` (Lazada, `08:18:45`, SL `3`) → **Chặn bán lố / Thiếu tồn kho** (không cho vượt tồn).

### 2.3. Bộ Dữ liệu Chuyên ngành Thời trang 2026 (Đồng nhất 4 tầng)
- Toàn bộ hệ thống dùng **100% danh mục Thời trang 2026**: **25 mã sản phẩm** chia đều 5 danh mục (*Áo, Quần, Váy & Đầm, Giày & Dép, Phụ kiện thời trang*), **40 lô hàng**, **30 đơn hàng mẫu** đa kênh (*8 Shopee, 7 TikTok Shop, 6 Lazada, 9 Facebook/POS*) trải từ **01/2026 đến 22/11/2026**, và **10 vận đơn mẫu**.
- Tuyệt đối không đưa lại hoặc để sót dữ liệu ngành hàng cũ (*Tai nghe, Bàn phím, Bình giữ nhiệt...*).

### 2.4. Quy tắc Đơn vị Vận chuyển (ĐVVC) 3 Tầng
Mọi điểm tính toán/đồng bộ ĐVVC trên Frontend (`resolveOrderCarrier`) và Backend (`resolveOrderCarrierBackend`) phải tuân thủ đúng thứ tự ưu tiên 3 tầng:
1. **Tầng 1**: Đối chiếu vận đơn thực tế trong bảng `VanDon` (khớp `MaDonGoc` hoặc `MaVanDon`).
2. **Tầng 2**: Đọc trực tiếp từ trường ĐVVC gốc của Sàn TMĐT / tệp Excel / bảng `DatHang`.
3. **Tầng 3**: Theo nguồn phát sinh đơn — đơn `POS` tự động gán **`"Tại quầy"`**; đơn `Facebook` / ngoài sàn chưa tạo vận đơn gán **`"Chưa gán ĐVVC"`** và tự động cập nhật ngay khi có vận đơn trong `VanDon`.

### 2.5. Chuẩn Số điện thoại 10 Chữ số (Dạng Văn bản Thuần)
- Toàn bộ số điện thoại khách hàng, người nhận và bưu tá lưu dưới dạng chuỗi văn bản 10 chữ số bắt đầu bằng `0` (ví dụ `0901234567`, hoặc số bàn 11 số `02877776868`).
- Luôn chuẩn hóa qua `normalizePhoneVN()` (tự động bù số `0` nếu bị mất thành 9 chữ số bắt đầu bằng `3, 5, 7, 8, 9` hoặc chuyển đầu `84` → `0`) và tuyệt đối không lưu kiểu số nguyên làm rụng chữ số `0` đầu.

---

## 3. Cấm 100% Từ Kỹ thuật IT trên Giao diện & Chuẩn hóa Ngôn ngữ Vận hành Thuần Việt

- Toàn bộ văn bản hiển thị cho người dùng quản lý/nhân viên (tiêu đề trang, nhãn nút bấm, cột bảng, nhãn trạng thái, thẻ KPI, tooltip, hộp thoại thông báo, hướng dẫn cài đặt và nội dung nhật ký hiển thị) bắt buộc dùng **ngôn ngữ nghiệp vụ vận hành bán hàng đa kênh thuần Việt**, dễ hiểu với người không chuyên CNTT.
- **Tuyệt đối cấm hiển thị trên giao diện người dùng (UI)** các từ kỹ thuật IT & tiếng Anh hệ thống sau:
  - *Kỹ thuật tích hợp & mạng*: `Webhook`, `API`, `API Endpoint`, `Endpoint`, `JSON`, `Payload`, `HTTP` (`HTTP 200/400/500`), `Request timeout`, `Timeout`, `URL`, `WAN IP`, `Client IP`, `IP` (dùng *"Địa chỉ mạng truy cập"*).
  - *Lưu trữ & đồng bộ*: `LocalStorage`, `SessionStorage`, `CloudSyncAdapter`, `Cloud`, `Cache`, `Fallback`, `Schema`, `Database`, `CSDL`, `Sync`, `Push`, `Pull`, `Null`, `Undefined`, `NaN`, `Race condition`.
  - *Thuật toán & trạng thái hệ thống*: `ATP` (dùng *"Tồn khả dụng"*), `FIFO` (dùng *"Ưu tiên giữ hàng trước–sau"*), `FEFO` (dùng *"Ưu tiên xuất lô gần hạn"*), `Batch` / `Batch FEFO` (dùng *"Lô hàng"* / *"Lô xuất ưu tiên"*), `Backorder` (dùng *"Thiếu tồn kho"*), `Overselling` (dùng *"Bán vượt tồn"*), `RBAC` (dùng *"Phân quyền nhân sự"*), `Live Analytics` (dùng *"Thống kê trực tuyến"*).
  - *Hệ thống, bảo mật & mã nguồn*: `Backend`, `Frontend`, `Apps Script`, `Script`, `Deploy`, `Server`, `Token`, `SHA-256`, `Hash`, `OTP`, `Device ID`, `Mock`, `Mock data`, `Demo` (dùng *"Mô phỏng"*), `SVG`, `HTML`, `CSS`, `JavaScript`.
  - *Tài khoản & thao tác tiếng Anh*: `User`, `Username` (dùng *"Tên đăng nhập"*), `Staff`, `Root Admin`, `Root Super Admin`, `Super Admin` (dùng *"Quản trị hệ thống"*), `Inactive`, `OFF`, `ON` (dùng *"Tạm ngưng"* / *"Đang hoạt động"*), `Waybill` (dùng *"Phiếu vận đơn"*), `Tracking` (dùng *"Mã vận đơn / Theo dõi"*), `e-POD` (dùng *"Ký nhận điện tử"*), `Click` (dùng *"Nhấn"*), `File` (dùng *"Tệp"*), `QR Code` / `Waybill Code` (dùng *"Mã QR"* / *"Mã vận đơn"*).
- **Ngoại lệ duy nhất được phép**: Chuỗi lời chào `"Chào bạn, Admin"` hiển thị trên Sidebar dành riêng cho tài khoản dự phòng ẩn `lhmt` theo mục 2.1.
- **Lưu ý phạm vi**: Quy tắc cấm chỉ áp dụng cho **văn bản hiển thị UI**; **không đổi tên biến, tên hàm, thuộc tính `id`/`class` hay mã trạng thái nội bộ** trong JavaScript/CSS để tránh gãy liên kết logic.

---

## 4. Đơn vị Tiền tệ Duy nhất: `VND`

- Mọi giá trị tiền tệ hiển thị trên tất cả màn hình Web App (7 thẻ KPI, biểu đồ doanh thu, bảng 9 cột, đơn hàng, vận đơn, phiếu in, báo cáo, hộp thoại chi tiết) bắt buộc sử dụng **duy nhất đơn vị `VND`** (ví dụ: `0 VND`, `250.000 VND`, `1,45 Tr VND`, `Đơn vị: Triệu VND`).
- **Tuyệt đối cấm** dùng ký hiệu cũ `đ`, `₫`, `VNĐ`, `vnđ` ở bất kỳ vị trí hiển thị nào (kể cả giá trị khởi tạo ban đầu trên HTML như `0 đ` phải sửa thành `0 VND`).

---

## 5. Cấm Ghi đè Google Sheets khi Kiểm thử

- Trong mọi bước kiểm tra, giả lập Node.js, chạy `/verify-odoms` hoặc kiểm chứng dữ liệu: **tuyệt đối chỉ gọi cổng ĐỌC (`GET ?action=PULL_ALL` hoặc `GET ?action=PING`)**.
- **Tuyệt đối cấm** tự động gửi bất kỳ yêu cầu ghi nào (`POST SYNC_ALL`, `PUSH_STATE`, `SYNC_SHIPMENTS`, `SYNC_USERS`, `SETUP_DB`, `SEED_FASHION_2026`) làm thay đổi hoặc ghi đè dữ liệu thật trên Sổ Google Sheets khi chưa có yêu cầu trực tiếp và xác nhận rõ ràng từ người dùng.
