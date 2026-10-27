# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_GIAODICH (ERD)

## 4. Bảng tbl_GiaoDich (Lịch sử biến động xuất nhập kho & Biên bản giao nhận điện tử e-POD hiện trường)

Đóng vai trò là bảng thực thể lưu trữ toàn bộ các biến động giao dịch luân chuyển vật tư hàng hóa (Nhập kho, Xuất kho cung ứng, Cho mượn demo, Bàn giao lẻ, Thu hồi); đồng thời đóng vai trò là hạt nhân thu thập dữ liệu xác thực giao nhận điện tử hiện trường (Electronic Proof of Delivery - e-POD) kết hợp chữ ký số cảm ứng và định vị vị trí GPS chống gian lận.

### Danh sách các trường dữ liệu (Attributes):

- **ID_GiaoDich (PK / Key Column):** Mã phiếu giao dịch duy nhất được sinh tự động theo quy chuẩn thời gian (Kiểu dữ liệu: `Text` - Ví dụ: `GD-20260810-001`, `GD-20260814-002`...). Đóng vai trò là Khóa chính (Primary Key).
- **Ngay_Gio:** Dấu mốc thời gian thực phát sinh giao dịch (Kiểu dữ liệu: `DateTime`, giá trị mặc định: `NOW()`).
- **Loai_Giao_Dich:** Phân loại nghiệp vụ biến động kho (Kiểu dữ liệu: `Enum` - Danh sách: `Nhập kho`, `Xuất kho cung ứng`, `Xuất cho mượn demo`, `Bàn giao lẻ`, `Thu hồi`).
- **ID_VatTu (FK / Ref):** Mã chủng loại vật tư tham chiếu tới bảng `tbl_VatTu` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_VatTu`).
- **QR_Code_Don_Vi (FK / Ref):** Mã cá thể thiết bị cụ thể được xuất giao tham chiếu tới bảng `tbl_ThietBi_ChiTiet` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_ThietBi_ChiTiet` hoặc `Scan`). Hỗ trợ camera quét trực tiếp tại hiện trường để đối soát đúng thiết bị trước khi bàn giao.
- **Ma_MAC:** Địa chỉ MAC của thiết bị tương ứng trong giao dịch (Kiểu dữ liệu: `Text`).
- **So_Luong_Cai:** Số lượng thiết bị/vật tư thực tế thực hiện trong giao dịch (Kiểu dữ liệu: `Number` cho số nguyên cái/bộ hoặc `Decimal` cho mét cáp).
- **Email_NhanVien (FK / Ref):** Email công vụ của nhân sự trực tiếp thực hiện giao dịch (Thủ kho, Kỹ thuật viên hoặc Shipper) tham chiếu tới bảng `tbl_NhanVien` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_NhanVien`, tự động gán giá trị: `USEREMAIL()`).
- **ID_KhachHang (FK / Ref):** Mã đối tác/khách hàng tiếp nhận thiết bị tại công trình tham chiếu tới bảng `tbl_KhachHang` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_KhachHang`).
- **Ngay_KH_Nhan:** Ngày khách hàng chính thức nghiệm thu và tiếp nhận thiết bị tại công trình (Kiểu dữ liệu: `Date`).
- **Ngay_Het_Han_BH_KH (Formula):** Ngày hết hạn bảo hành của thiết bị tính theo mốc giao dịch xuất bán (Kiểu dữ liệu: `Date` hoặc `Text`, tính toán tự động bằng công thức thời gian thực).
- **Vi_Tri_GPS:** Tọa độ địa lý thực tế tại thời điểm hoàn tất bàn giao ghi nhận qua cảm biến GPS của thiết bị di động (Kiểu dữ liệu: `LatLong`, tự động thu thập qua hàm hệ thống: `HERE()`). Phục vụ công tác xác minh vị trí giao hàng và tính toán khoảng cách/ETA về trụ sở công ty.
- **Chu_Ky_POD:** Hình ảnh chữ ký cảm ứng xác nhận giao nhận hàng hóa của đại diện khách hàng/người nhận (Kiểu dữ liệu: `Signature`). Dữ liệu chữ ký được lưu trữ bảo mật trên Google Drive và gắn trực tiếp vào Biên bản bàn giao PDF.

### Chuỗi tự động hóa tích hợp trên AppSheet (Event-driven Automation):
- **Tự động sinh biên bản PDF (DocGen Engine):** Ngay khi một bản ghi giao dịch được lưu với đầy đủ chữ ký và GPS, Automation Bot tự động điền dữ liệu vào mẫu biểu chuẩn A4, chuyển đổi thành tệp PDF lưu trên Google Drive và gửi email xác nhận tức thời qua giao thức SMTP.
- **Đo lường cự ly & thời gian ETA:** Tích hợp Google Maps Distance Matrix API để tự động tính toán quãng đường (km) và thời gian di chuyển ước tính (ETA) từ tọa độ `Vi_Tri_GPS` giao nhận quay về trụ sở Công ty Trường Tiến.
- **Vận hành ngoại tuyến (Offline-First Architecture):** Hỗ trợ nhân viên giao nhận tác nghiệp, quét QR, chụp ảnh và lấy chữ ký bình thường tại các khu vực mất kết nối mạng Internet; hệ thống tự động đẩy dữ liệu đệm (SQLite Cache) lên đám mây ngay khi có sóng trở lại.
