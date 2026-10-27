# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_NHATKYBAOTRI (ERD)

## 5. Bảng tbl_NhatKyBaoTri (Nhật ký tiếp nhận sự cố, cứu hộ kỹ thuật & Quản trị bảo hành/chi phí sửa chữa)

Đóng vai trò là bảng thực thể theo dõi toàn bộ vòng đời cứu hộ kỹ thuật, khám lỗi thiết bị tại công trình thực tế, quản lý phân loại bảo hành 2 lớp (Dual Warranty: Bảo hành Hãng vs Bảo hành Khách hàng) và quản trị chi phí sửa chữa phát sinh; đồng thời đóng vai trò là nguồn phát sự kiện (Trigger Source) kích hoạt Webhook đẩy cảnh báo sự cố khẩn cấp theo thời gian thực qua Telegram Bot API.

### Danh sách các trường dữ liệu (Attributes):

- **ID_BaoTri (PK / Key Column):** Mã phiếu tiếp nhận sự cố/bảo trì duy nhất (Kiểu dữ liệu: `Text` - Ví dụ: `BT-20260814-001`, `BT-20260816-002`...). Đóng vai trò là Khóa chính (Primary Key).
- **Ngay_Bao_Tri:** Ngày tiếp nhận báo hỏng hoặc thời điểm kỹ thuật viên có mặt tại hiện trường (Kiểu dữ liệu: `Date`, mặc định: `TODAY()`).
- **So_Luong_Nhan:** Số lượng thiết bị lỗi tiếp nhận xử lý trong ca (Kiểu dữ liệu: `Number`, mặc định: `1`).
- **ID_VatTu (FK / Ref):** Mã chủng loại thiết bị phát sinh lỗi tham chiếu tới bảng `tbl_VatTu` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_VatTu`).
- **QR_Code_Don_Vi (FK / Ref):** Mã định danh cá thể thiết bị lỗi tham chiếu tới bảng `tbl_ThietBi_ChiTiet` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_ThietBi_ChiTiet` hoặc `Scan`). Hỗ trợ camera quét tem trực tiếp trên máy lỗi để tự động nạp lịch sử xuất bán và thời hạn bảo hành.
- **Ma_MAC:** Địa chỉ vật lý MAC Address của thiết bị phát sinh lỗi (Kiểu dữ liệu: `Text`).
- **ID_KhachHang (FK / Ref):** Mã khách hàng/công trình đang gặp sự cố kỹ thuật tham chiếu tới bảng `tbl_KhachHang` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_KhachHang`).
- **Ngay_Het_Han_BH_Hang:** Thời hạn bảo hành gốc của Nhà sản xuất/Hãng VIVOTEK (Kiểu dữ liệu: `Date` hoặc `Text`, trích xuất tự động từ `tbl_ThietBi_ChiTiet`).
- **Ngay_Het_Han_BH_KH:** Thời hạn bảo hành của công ty đối với khách hàng (Kiểu dữ liệu: `Date` hoặc `Text`, trích xuất tự động từ `tbl_ThietBi_ChiTiet`).
- **Ngay_Ban_Cho_KH:** Mốc thời gian thiết bị được bán/bàn giao ban đầu cho khách hàng (Kiểu dữ liệu: `Date`).
- **Out_Warranty (Cờ hết hạn bảo hành):** Đánh dấu trạng thái hết hạn bảo hành (Kiểu dữ liệu: `Enum` - Giá trị: `Y` / `N`). Căn cứ tự động để xác định thiết bị được sửa chữa miễn phí hay chuyển sang dịch vụ tính phí.
- **Email_NhanVien (FK / Ref):** Email kỹ thuật viên phụ trách tiếp nhận và xử lý sự cố tham chiếu tới bảng `tbl_NhanVien` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_NhanVien`, tự động gán: `USEREMAIL()`).
- **Tinh_Trang_Loi:** Mô tả chi tiết triệu chứng hư hỏng, hiện tượng lỗi thực tế tại công trình (Kiểu dữ liệu: `LongText` / `Text` - Ví dụ: *"Camera hỏng hồng ngoại ban đêm"*, *"Mất kết nối cổng PoE số 5"*...).
- **Huong_Xu_Ly:** Phương án xử lý kỹ thuật được đề xuất (Kiểu dữ liệu: `Enum` - Danh sách: `Sửa tại chỗ`, `Đổi thiết bị mới`, `Chờ linh kiện thay thế`, `Gửi bảo hành Hãng VIVOTEK`, `Hoàn trả khách hàng`).
- **Don_Vi_Bao_Hanh:** Đơn vị chịu trách nhiệm sửa chữa (Kiểu dữ liệu: `Enum` - Danh sách: `Trường Tiến` (Nội bộ), `Hãng VIVOTEK`, `Bên thứ ba`).
- **Chi_Phi:** Tổng chi phí thay thế linh kiện, vật tư hoặc phí sửa chữa ngoài phát sinh (Kiểu dữ liệu: `Price` / Tiền tệ VNĐ). Trường nhạy cảm được trình duyệt Ban Giám đốc phê duyệt trước khi thanh toán.
- **Muc_Do_Uu_Tien:** Mức độ khẩn cấp của sự cố an ninh (Kiểu dữ liệu: `Enum` - Danh sách: `Khẩn cấp`, `Bình thường`, `Thấp`).

### Cơ chế tự động hóa & Tích hợp trên AppSheet (Automation & Webhook):
- **Cảnh báo Telegram Bot API tức thời (< 3 giây):** Ngay khi kỹ thuật viên bấm lưu phiếu báo hỏng với `Muc_Do_Uu_Tien = "Khẩn cấp"`, hệ thống kích hoạt Webhook dạng POST đẩy gói tin JSON vào nhóm chat Kỹ thuật Telegram kèm mã máy, tên khách hàng, ảnh hiện trường lỗi và mô tả sự cố để điều phối hỗ trợ tức thì.
- **Thẻ giám sát KPI điều hành (Executive Card View):** Slice dữ liệu `Slice_BaoTri_DangXuLy` tự động lọc các ca sự cố có trạng thái đang xử lý (`ISBLANK([Ngay_Hoan_Tat])`) để hiển thị trực tiếp lên thẻ KPI trên Executive Dashboard 360° của Ban Giám đốc.
