# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_KHACHHANG (ERD)

## 6. Bảng tbl_KhachHang (Danh mục đối tác, khách hàng doanh nghiệp & Công trình thụ hưởng)

Đóng vai trò là bảng thực thể Danh mục chủ thể thụ hưởng (Master Data Entity), quản lý toàn bộ danh bạ các cơ quan, doanh nghiệp, chuỗi chi nhánh và dự án công trình (ngân hàng BIDV, trung tâm thương mại Aeon Mall...) lắp đặt và sử dụng hệ thống thiết bị an ninh; thiết lập các mối quan hệ quan trọng (1-N) với các bảng giao dịch bàn giao e-POD, quản lý tài sản đã xuất bán và lịch sử tiếp nhận bảo trì hiện trường.

### Danh sách các trường dữ liệu (Attributes):

- **ID_KhachHang (PK / Key Column):** Mã định danh khách hàng/đối tác duy nhất (Kiểu dữ liệu: `Text` - Ví dụ: `KH-BIDV-001`, `KH-AEON-001`, `TRUONGTIEN-001`...). Đóng vai trò là Khóa chính (Primary Key), dùng làm khóa ngoại (Foreign Key) tham chiếu trong các bảng `tbl_ThietBi_ChiTiet`, `tbl_GiaoDich` và `tbl_NhatKyBaoTri`.
- **Ten_KhachHang (Label Column):** Tên đầy đủ của doanh nghiệp, chi nhánh hoặc tên công trình dự án (Kiểu dữ liệu: `Name/Text` - Ví dụ: *"Ngân hàng BIDV - Chi nhánh Chợ Lớn"*, *"Aeon Mall Bình Tân"*...). Sử dụng làm nhãn hiển thị chính đại diện cho đối tác trên các giao diện tìm kiếm và tiêu đề biên bản bàn giao.
- **Dia_Chi:** Địa chỉ địa lý thực tế của trụ sở hoặc địa điểm công trình lắp đặt hệ thống an ninh (Kiểu dữ liệu: `Address`). Trên giao diện AppSheet di động, trường này tự động kích hoạt tính năng định vị và mở trực tiếp ứng dụng Google Maps dẫn đường cho kỹ thuật viên và nhân viên giao nhận khi di chuyển đến hiện trường.
- **Email_Lien_He:** Địa chỉ email chính thức của người đại diện hoặc ban quản lý công trình phía khách hàng (Kiểu dữ liệu: `Email`). Đóng vai trò là địa chỉ nhận thư tự động từ hệ thống khi Automation Bot kích hoạt gửi Biên bản giao nhận điện tử e-POD định dạng PDF qua email ngay sau khi ký nhận hoàn tất.

### Các quan hệ thực thể mở rộng trên AppSheet (Virtual Relations - 1:N):
- **Danh sách thiết bị khách hàng sở hữu (`Related tbl_ThietBi_ChiTiets`):** Tự động liên kết và hiển thị toàn bộ danh mục camera, switch, đầu ghi NVR đang lắp đặt tại công trình của khách hàng kèm trạng thái bảo hành 2 lớp còn hạn hay đã hết hạn.
- **Lịch sử giao dịch bàn giao (`Related tbl_GiaoDichs`):** Lưu trữ toàn bộ các đợt xuất kho giao hàng, chữ ký số e-POD và tọa độ GPS thực địa từng chuyến giao cho khách hàng.
- **Lịch sử bảo trì sự cố (`Related tbl_NhatKyBaoTris`):** Tập trung toàn bộ nhật ký các ca cứu hộ kỹ thuật, chẩn đoán lỗi phần cứng và chi phí sửa chữa phát sinh tại công trình khách hàng theo thời gian.

### Phân quyền vai trò tác nghiệp trên AppSheet (RBAC):
- **SuperAdmin & Admin (Ban Giám đốc):** Toàn quyền thêm, sửa, quản lý hồ sơ đối tác khách hàng và tra cứu tổng thể lịch sử giao dịch.
- **Thủ kho:** Có quyền thêm mới nhanh thông tin khách hàng (`ADDS_AND_UPDATES`) khi phát sinh các đơn hàng xuất giao gấp tại kho.
- **Kỹ thuật viên & Giao nhận (Shipper):** Quyền `READ_ONLY` để tra cứu thông tin địa chỉ công trình, số điện thoại liên hệ và nhấn nút điều hướng Google Maps khi tác nghiệp hiện trường.
