# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_NHANVIEN (ERD)

## 1. Bảng tbl_NhanVien (Quản lý danh bạ nhân sự và Ma trận phân quyền RBAC)

Đóng vai trò là thực thể định danh người dùng cốt lõi của hệ thống, quản trị danh mục nhân sự và ánh xạ trực tiếp với cơ chế xác thực Google Single Sign-On (SSO) để kích hoạt ma trận phân quyền động (Dynamic Security Slices & Smart Routing).

### Danh sách các trường dữ liệu (Attributes):

- **Email_NhanVien (PK / Key Column):** Địa chỉ email Google công vụ duy nhất của nhân sự (Kiểu dữ liệu: `Email`). Đóng vai trò là Khóa chính (Primary Key) của bảng, dùng để đối soát trực tiếp 1-1 với hàm hệ thống `USEREMAIL()` trên AppSheet Engine, xác thực danh tính người dùng tức thời khi mở ứng dụng.
- **Ho_Ten (Label Column):** Họ và tên đầy đủ của nhân sự (Kiểu dữ liệu: `Name/Text`). Sử dụng làm nhãn hiển thị đại diện trên các danh mục và biên bản giao nhận.
- **So_Dien_Thoai:** Số điện thoại liên lạc cá nhân/công vụ (Kiểu dữ liệu: `Phone`). Hỗ trợ kích hoạt nhanh các tác vụ gọi thoại trực tiếp (Quick Call Action) trên giao diện ứng dụng di động khi điều phối hiện trường.
- **Vai_Tro:** Phân quyền vai trò chuyên trách của nhân sự trong hệ thống (Kiểu dữ liệu: `Enum`). Thiết lập cố định 5 nhóm vai trò theo chuẩn RBAC:
  - **SuperAdmin (Quản trị hệ thống IT):** Toàn quyền cấu hình CSDL, Automation Bots, Backup và duy nhất có quyền Xóa vật lý (Hard Delete).
  - **Admin (Ban Giám đốc):** Xem Executive Dashboard 360°, phê duyệt chi phí bảo trì, ký duyệt cấp phát thiết bị và quản lý phân quyền (bị chặn xóa vật lý và chặn tự hạ quyền của chính mình qua biểu thức: `[Email_NhanVien] <> USEREMAIL()`).
  - **Kỹ thuật viên (Field Technician):** Tiếp nhận sự cố, quản lý bảo hành 2 lớp (Dual Warranty), gửi cảnh báo Telegram Bot (bị ẩn toàn bộ bảng giá và chỉ số tài chính).
  - **Thủ kho (Warehouse Manager):** Nhập kho thùng quy cách, quét QR cá thể, quản lý vị trí kệ kho và theo dõi tồn kho an toàn.
  - **Giao nhận (Shipper):** Tác nghiệp hiện trường trên lát cắt cá nhân hóa (`[Email_NhanVien] = USEREMAIL()`), quét QR đối soát, bắt tọa độ GPS và thu thập chữ ký số điện tử e-POD.
