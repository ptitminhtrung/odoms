# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_VATTU (ERD)

## 2. Bảng tbl_VatTu (Danh mục mẫu mã sản phẩm, License & Quản trị giá vốn tồn kho)

Đóng vai trò là bảng thực thể Danh mục cha (Master Data Catalog) quản lý toàn bộ các chủng loại vật tư, thiết bị an ninh giám sát, thiết bị mạng và gói License phần mềm VIVOTEK; đồng thời tích hợp các chỉ số quản trị định mức an toàn và tính toán giá vốn tồn kho thời gian thực (FIFO Engine).

### Danh sách các trường dữ liệu (Attributes):

- **ID_VatTu (PK / Key Column):** Mã chủng loại vật tư/thiết bị hoặc mã gói bản quyền duy nhất (Kiểu dữ liệu: `Text`). Đóng vai trò là Khóa chính (Primary Key), dùng làm khóa ngoại (Foreign Key) tham chiếu trong các bảng `tbl_ThietBi_ChiTiet`, `tbl_QuanLyThung`, `tbl_Template_QuyCach`, `tbl_Template_License` và `tbl_GiaoDich` (Ví dụ: `FD9380-HTV-V2`, `IB9387-EHTV-v3`, `igs-2016g1-350`, `ND9542P`, `718000500`...).
- **Ten_VatTu (Label Column):** Tên thương mại và thông số kỹ thuật đầy đủ của thiết bị hoặc License (Kiểu dữ liệu: `Text`). Sử dụng làm nhãn hiển thị chính (Label) trên giao diện ứng dụng và biểu mẫu biên bản bàn giao.
- **Loai_VatTu:** Phân nhóm chủng loại vật tư (Kiểu dữ liệu: `Enum` - Danh sách: `Camera`, `Switch`, `NVR`, `Vật tư phụ`, `License`...).
- **Don_Vi_Tinh:** Đơn vị đo lường xuất nhập (Kiểu dữ liệu: `Enum` - Danh sách: `Cái`, `Bộ`, `Cuộn`, `Mét`, `Gói`, `License`...).
- **So_Luong_Ton (Formula / Real-time Stock):** Số lượng tồn kho thực tế khả dụng (Kiểu dữ liệu: `Number` hoặc `Decimal` cho mét cáp). Giá trị được tính toán và đồng bộ tự động theo thời gian thực dựa trên tổng số lượng cá thể có trạng thái "Trong kho" / "Tồn kho sẵn sàng" trong bảng `tbl_ThietBi_ChiTiet`.
- **Nguong_An_Toan (Safety Stock Level):** Định mức tồn kho tối thiểu an toàn (Kiểu dữ liệu: `Number`, ràng buộc: `[_THIS] >= 0`). Khi `So_Luong_Ton <= Nguong_An_Toan`, hệ thống tự động gắn cờ cảnh báo đỏ/vàng trên Executive Dashboard để nhắc nhở nhập hàng.
- **Don_Gia:** Đơn giá xuất bán/bàn giao niêm yết (Kiểu dữ liệu: `Price` / Tiền tệ VNĐ).
- **Thoi_Han_BH:** Thời hạn bảo hành tiêu chuẩn theo quy định (Kiểu dữ liệu: `Text` hoặc `Number` - đơn vị tính: Số tháng như 12, 24, 60 tháng hoặc `Vĩnh viễn` đối với các dòng Enterprise License).
- **Don_Gia_Nhap:** Đơn giá nhập khẩu gốc từ nhà sản xuất/nhà phân phối (Kiểu dữ liệu: `Price` / Tiền tệ VNĐ).
- **Don_Gia_Binh_Quan_FIFO:** Đơn giá bình quân xuất kho tính toán theo thuật toán Nhập trước - Xuất trước (Kiểu dữ liệu: `Price`). Được xử lý tự động ngầm thông qua kịch bản `Enterprise FIFO Engine` viết bằng Google Apps Script (GAS).
- **Gia_Tri_Ton_Kho:** Tổng giá trị tài sản hàng hóa đang tồn kho thực tế (`So_Luong_Ton` $\times$ `Don_Gia_Binh_Quan_FIFO`) (Kiểu dữ liệu: `Price`). Phục vụ công tác thống kê tài chính, lập dự toán ngân sách và tính toán khấu hao tài sản hàng năm cho Ban Giám đốc.

### Cơ chế phân quyền bảo mật cấp cột (Column-Level Security):
- Các trường thông tin tài chính nhạy cảm (`Don_Gia`, `Don_Gia_Nhap`, `Don_Gia_Binh_Quan_FIFO`, `Gia_Tri_Ton_Kho`) được bảo mật bằng cơ chế phân quyền dữ liệu động (Dynamic Slices): Ẩn hoàn toàn đối với vai trò `Kỹ thuật viên` và `Giao nhận (Shipper)`; chỉ hiển thị cho `SuperAdmin` và `Admin (Ban Giám đốc)`.
