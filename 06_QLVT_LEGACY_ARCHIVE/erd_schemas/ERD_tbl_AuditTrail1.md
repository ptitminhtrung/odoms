# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_AUDITTRAIL (ERD)

## 7. Bảng tbl_AuditTrail (Nhật ký giám sát an toàn thông tin, lưu vết tác nghiệp & Kiểm toán hệ thống)

Đóng vai trò là bảng thực thể Giám sát An toàn & Nhật ký Kiểm toán hệ thống (Security & Audit Trail Entity), lưu vết toàn bộ các hành vi tác nghiệp của người dùng, biến động dữ liệu và các sự kiện bảo mật theo thời gian thực; đảm bảo nguyên tắc toàn vẹn dữ liệu, tính minh bạch, chống chối bỏ (Non-repudiation) và phục vụ công tác điều tra sự cố (Incident Forensics) theo tiêu chuẩn an toàn thông tin.

### Danh sách các trường dữ liệu (Attributes):

- **ID_Log (PK / Key Column):** Mã định danh bản ghi nhật ký kiểm toán duy nhất được sinh tự động theo chuẩn GUID hoặc Timestamp (Kiểu dữ liệu: `Text` - Ví dụ: `LOG-20260828-0001`, `LOG-20260828-0002`...). Đóng vai trò là Khóa chính (Primary Key).
- **Thoi_Gian:** Mốc thời gian chính xác phát sinh hành động tới từng giây (Kiểu dữ liệu: `DateTime / Timestamp`, giá trị mặc định: `NOW()`).
- **Email_NhanVien (FK / Ref):** Địa chỉ email công vụ của tài khoản thực hiện hành vi tham chiếu tới bảng `tbl_NhanVien` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_NhanVien`, tự động trích xuất bảo mật từ hàm hệ thống `USEREMAIL()`).
- **Hanh_Dong:** Phân loại hành động hoặc tác vụ can thiệp hệ thống (Kiểu dữ liệu: `Enum` - Danh sách: `LOGIN`, `LOGOUT`, `ADD`, `UPDATE`, `DELETE`, `PREPROCESS_OCR`, `EXPORT_REPORT`, `RESTORE_BACKUP`).
- **Bang_Tac_Dong:** Tên bảng dữ liệu hoặc phân hệ phát sinh thay đổi (Kiểu dữ liệu: `Enum / Text` - Ví dụ: `tbl_NhanVien`, `tbl_VatTu`, `tbl_ThietBi_ChiTiet`, `tbl_GiaoDich`, `tbl_NhatKyBaoTri`).
- **Khoa_Ban_Ghi_Muc_Tieu:** Khóa chính đại diện cho bản ghi bị tác động (Kiểu dữ liệu: `Text` - Ví dụ: `THUNG-001-FD9380-HTV-V2-01`, `GD-20260810-001`, `BT-20260814-001`...).
- **Chi_Tiet_ThayDoi:** Chuỗi dữ liệu ghi nhận chi tiết giá trị trước và sau khi chỉnh sửa (Kiểu dữ liệu: `LongText` / Định dạng `JSON`). Cho phép người quản trị phục hồi hoặc đối chiếu lịch sử thay đổi từng trường dữ liệu.
- **Dia_Chi_IP_ThietBi:** Thông tin định danh thiết bị hoặc địa chỉ mạng của người dùng khi gửi yêu cầu tác nghiệp (Kiểu dữ liệu: `Text`).

### Cơ chế triển khai và vận hành thực tế trên nền tảng Cloud:
- **Cơ chế ghi log ngầm của AppSheet Engine (Cloud Audit History):** Trên nền tảng Google AppSheet, toàn bộ các tác vụ thêm, sửa, xóa dữ liệu (`Data Changes`) và các lệnh gọi API/Webhook của tất cả các vai trò được động cơ đám mây tự động ghi nhận tại phân hệ *AppSheet Audit History (Manage > Monitor > Audit History)*, giúp bảo vệ tính khách quan (người dùng không thể tự can thiệp sửa log) và không làm phình dung lượng của bảng tính Google Sheets trong quá trình vận hành hàng ngày.
- **Tự động hóa trích xuất sự kiện nhạy cảm (Security Automation):** Đối với các tác vụ có tính chất trọng yếu (như SuperAdmin thực hiện xóa vật lý bản ghi, thay đổi phân quyền vai trò trong `tbl_NhanVien` hoặc Ban Giám đốc phê duyệt xuất chi phí sửa chữa lớn), hệ thống cấu hình Automation Bot để đồng thời ghi một bản sao lưu vết vào bảng `tbl_AuditTrail` và lưu trữ cô lập sang Google Drive / NAS Synology phục vụ công tác kiểm toán định kỳ.
