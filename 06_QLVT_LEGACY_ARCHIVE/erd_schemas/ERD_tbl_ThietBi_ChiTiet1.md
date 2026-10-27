# ĐẶC TẢ THỰC THỂ CƠ SỞ DỮ LIỆU: BẢNG TBL_THIETBI_CHITIET (ERD)

## 3. Bảng tbl_ThietBi_ChiTiet (Định danh cá thể thiết bị dán mã QR, địa chỉ MAC & Quản lý Bảo hành 2 lớp)

Đóng vai trò là bảng thực thể chi tiết cốt lõi (Core Transactional / Unit Entity) quản lý lý lịch trọn đời (Life-cycle) của từng cá thể thiết bị phần cứng đơn vị (camera, switch, đầu ghi NVR) và các gói License bẻ lẻ; thiết lập quan hệ ánh xạ 1-1 giữa mã QR độc bản với địa chỉ MAC phần cứng, đồng thời tự động hóa cơ chế đối soát bảo hành 2 lớp (Dual Warranty: Bảo hành Hãng vs Bảo hành Khách hàng).

### Danh sách các trường dữ liệu (Attributes):

- **QR_Code_Don_Vi (PK / Key Column):** Mã định danh cá thể thiết bị độc bản kiêm mã QR Code dán trên thân máy (Kiểu dữ liệu: `Text / Scan`). Đóng vai trò là Khóa chính (Primary Key), được tạo theo quy chuẩn đóng gói (ví dụ: `THUNG-001-FD9380-HTV-V2-01`, `0002D19E47A3`...). Cho phép camera di động quét 1 chạm để truy xuất lý lịch hoặc kiểm kê đối soát tức thời.
- **ID_VatTu (FK / Ref):** Mã chủng loại vật tư tham chiếu tới bảng `tbl_VatTu` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_VatTu`).
- **Ma_MAC:** Địa chỉ vật lý MAC Address duy nhất của card mạng/camera/thiết bị mạng (Kiểu dữ liệu: `Text`, định dạng chuẩn `XX-XX-XX-XX-XX-XX`). Phục vụ công tác bóc tách tự động qua AI Gemini Vision OCR và đối soát bảo hành phần cứng.
- **Ma_Thung_Nhap (FK / Ref):** Mã kiện/thùng nhập kho ban đầu tham chiếu tới bảng `tbl_QuanLyThung` (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_QuanLyThung` hoặc `Text`). Dùng để truy xuất nguồn gốc lô hàng nhập khẩu từ nhà sản xuất.
- **Ngay_Truong_Tien_Nhap:** Mốc thời gian công ty Trường Tiến nhập kho thiết bị chính thức từ hãng (Kiểu dữ liệu: `Date`).
- **Ngay_Het_Han_BH_Hang (Formula / Dual Warranty - Lớp 1):** Ngày hết hạn bảo hành gốc của Nhà sản xuất/Hãng VIVOTEK (Kiểu dữ liệu: `Date` hoặc `Text`). Được tính toán tự động bằng công thức thời gian thực dựa trên ngày nhập kho cộng thêm thời hạn bảo hành gốc (`tbl_VatTu[Thoi_Han_BH]`), hoặc trả về giá trị `Vĩnh viễn` đối với các gói phần mềm chuyên dụng.
- **Trang_Thai:** Trạng thái vận hành thực tế của cá thể thiết bị (Kiểu dữ liệu: `Enum` - Danh sách trạng thái: `Trong kho`, `Tồn kho sẵn sàng`, `Đã xuất bán`, `Đang dùng`, `Đang bảo trì`, `Chờ gửi hãng bảo hành`).
- **ID_KhachHang (FK / Ref):** Mã khách hàng/công trình đang trực tiếp sở hữu hoặc thụ hưởng thiết bị sau khi xuất bán (Kiểu dữ liệu: `Ref` $\rightarrow$ `tbl_KhachHang`).
- **Ngay_Ban_Cho_KH:** Mốc thời gian xuất kho bàn giao nghiệm thu chính thức cho khách hàng (Kiểu dữ liệu: `Date`).
- **Ngay_Het_Han_BH_KH (Formula / Dual Warranty - Lớp 2):** Ngày hết hạn bảo hành cam kết của công ty đối với khách hàng (Kiểu dữ liệu: `Date` hoặc `Text`). Tự động tính toán từ `Ngay_Ban_Cho_KH` cộng thời hạn bảo hành cam kết. Giúp hệ thống tự động phát hiện thiết bị lỗi đem về bảo trì còn hạn bảo hành của công ty hay đã chuyển sang diện tính phí sửa chữa ngoài (*Out of Warranty*).

### Nghiệp vụ tác nghiệp thực tế trên AppSheet:
- **Tích hợp Camera Scanner:** Bật camera quét mã vạch và QR Code trực tiếp tại hiện trường với độ trễ phản hồi cực nhanh (0.8s - 1.2s).
- **Phân loại bảo hành 2 lớp (Dual Warranty):** Kỹ thuật viên khi tiếp nhận máy lỗi chỉ cần quét mã QR hoặc nhập địa chỉ MAC, hệ thống tự động đối chiếu `Ngay_Het_Han_BH_Hang` và `Ngay_Het_Han_BH_KH` để tự động đề xuất phương án: Đổi mới, Gửi hãng VIVOTEK bảo hành miễn phí hay Sửa chữa dịch vụ có thu phí.
