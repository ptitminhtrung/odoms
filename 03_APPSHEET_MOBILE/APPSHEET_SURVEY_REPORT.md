# BÁO CÁO KHẢO SÁT CẤU HÌNH HỆ THỐNG APPSHEET
**Tên ứng dụng:** `QLVT-V1` (`NewApp-485091138`)  
**App ID:** `fc56fb22-6878-426f-966a-18c569c14323`  
**Đường dẫn Editor:** [https://www.appsheet.com/template/AppDef?appName=NewApp-485091138&appId=fc56fb22-6878-426f-966a-18c569c14323](https://www.appsheet.com/template/AppDef?appName=NewApp-485091138&appId=fc56fb22-6878-426f-966a-18c569c14323)  
**Tài khoản sở hữu:** `ptit.minhtrung@gmail.com` (Owner ID: `485091138`)  
**Nguồn dữ liệu kết nối:** Google Sheets `rdbms-schema-truong-tien-v9` (`1IU0bFj13XiEvzvUxXQTWEFl_hHyPT1_4TkXkHkYLHX0`)  

---

## 1. DỮ LIỆU & BẢNG (DATA & TABLES)

Ứng dụng hiện đã liên kết đầy đủ **10 Bảng dữ liệu** từ Google Sheets:

| STT | Tên Bảng (Table Name) | Nguồn Dữ Liệu | Số Cột Nhận Diện | Khóa Chính (Key) | Các Khóa Ngoại & Quan Hệ (Refs) |
|:---:|:---|:---|:---:|:---|:---|
| 1 | **`tbl_Overview`** | `tbl_Overview` | 1+ | `Hàng 1` | Bảng điều hướng mục lục hệ thống |
| 2 | **`tbl_VatTu`** | `tbl_VatTu` | 8 | `ID_VatTu (PK)` | Bảng Cha (Parent) chứa danh mục thiết bị & License |
| 3 | **`tbl_Template_QuyCach`** | `tbl_Template_QuyCach` | 3 | `ID_VatTu (PK/FK)` | Quy cách đóng gói phần cứng |
| 4 | **`tbl_Template_License`** | `tbl_Template_License` | 4 | `ID_VatTu (PK/FK)` | Định chuẩn License Vivotek |
| 5 | **`tbl_QuanLyThung`** | `tbl_QuanLyThung` | 5 | `ID_Thung (PK)` | `ID_VatTu (FK)` ➔ `tbl_VatTu` |
| 6 | **`tbl_ThietBi_ChiTiet`** | `tbl_ThietBi_ChiTiet` | 10 | `QR_Code_Don_Vi (PK)` | `ID_VatTu (FK)` ➔ `tbl_VatTu`<br>`ID_KhachHang (FK)` ➔ `tbl_KhachHang`<br>`Ma_Thung_Nhap` ➔ `tbl_QuanLyThung` |
| 7 | **`tbl_NhanVien`** | `tbl_NhanVien` | 4 | `Email_NhanVien (PK)` | Danh mục nhân sự & phân quyền User |
| 8 | **`tbl_KhachHang`** | `tbl_KhachHang` | 4 | `ID_KhachHang (PK)` | Danh mục đối tác / khách hàng / vị trí |
| 9 | **`tbl_GiaoDich`** | `tbl_GiaoDich` | 14 | `ID_GiaoDich (PK)` | `ID_VatTu (FK)` ➔ `tbl_VatTu`<br>`QR_Code_Don_Vi (FK)` ➔ `tbl_ThietBi_ChiTiet`<br>`Email_NhanVien (FK)` ➔ `tbl_NhanVien`<br>`ID_KhachHang (FK)` ➔ `tbl_KhachHang`<br>`Vi_Tri_GPS` (LatLong) |
| 10 | **`tbl_NhatKyBaoTri`** | `tbl_NhatKyBaoTri` | 9 | `ID_BaoTri (PK)` | `ID_VatTu (FK)` ➔ `tbl_VatTu`<br>`QR_Code_Don_Vi (FK)` ➔ `tbl_ThietBi_ChiTiet`<br>`Email_NhanVien (FK)` ➔ `tbl_NhanVien`<br>`ID_KhachHang (FK)` ➔ `tbl_KhachHang` |

---

## 2. GIAO DIỆN NGƯỜI DÙNG (VIEWS / UX)

### A. Primary Navigation (Thanh điều hướng chính đáy màn hình)
1. **`Trang chủ`**
   * **Bảng dữ liệu nguồn:** `tbl_Overview`
   * **Loại hiển thị (View Type):** `Deck View`
   * **Cấu hình:** Sắp xếp theo *Tên bảng cơ sở*, gom nhóm theo *Mối quan hệ liên kết bảng*, hành động click: *Chuyển trang mục lục*.
2. **`tbl_VatTu`**
   * **Bảng dữ liệu nguồn:** `tbl_VatTu`
   * **Loại hiển thị:** `Deck View` (Danh mục vật tư, tồn kho, đơn giá)
3. **`Danh sách thiết bị`**
   * **Bảng dữ liệu nguồn:** `tbl_ThietBi_ChiTiet`
   * **Loại hiển thị:** `Deck View` (Theo dõi từng đơn vị Serial/QR, MAC, trạng thái bảo hành)
4. **`Quản lý Thùng`**
   * **Bảng dữ liệu nguồn:** `tbl_QuanLyThung`
   * **Loại hiển thị:** `Table / Chart View`
5. **`Khách hàng`**
   * **Bảng dữ liệu nguồn:** `tbl_KhachHang`
   * **Loại hiển thị:** `Table / Chart View`

### B. Reference Views (Giao diện tham chiếu)
* **`Giao dịch hiện trường`:** View tham chiếu lịch sử xuất/nhập/giao hàng
* **`Map`:** Bản đồ định vị GPS các giao dịch bàn giao và bảo trì

### C. System Generated Views
* Toàn bộ hệ thống tự động sinh 3 View con chuẩn cho mỗi bảng (`_Detail`, `_Form`, `_Inline`) phục vụ xem chi tiết, thêm mới và hiển thị danh sách lồng (Nested Tables).

---

## 3. HÀNH ĐỘNG (ACTIONS)

### A. Actions Hệ thống (System Actions)
* **CRUD cơ bản:** `Add` (thêm mới), `Edit` (chỉnh sửa), `Delete` (xóa) trên toàn bộ 10 bảng.
* **View Ref Actions:** Các nút bấm tự động điều hướng sang bảng cha/con tương ứng (`View Ref (ID_VatTu)`, `View Ref (QR_Code_Don_Vi)`, `View Ref (ID_KhachHang)`, `View Ref (Email_NhanVien)`).
* **View Map Action:** Tự động mở Google Maps từ cột `Vi_Tri_GPS` trên bảng `tbl_GiaoDich`.

### B. Actions Tùy chỉnh (Custom Actions)
* **`Chuyển trang mục lục`:** Action điều hướng nhanh trên View `Trang chủ`.

---

## 4. TIẾN TRÌNH TỰ ĐỘNG HÓA (AUTOMATION / BOTS)

* **Trạng thái hiện tại:** *Chưa thiết lập Bot nào (Trống)*.
* **Sẵn sàng triển khai:**
  - Bot gửi email / thông báo tự động khi xuất nhập kho hoặc có sự cố bảo trì.
  - Bot cảnh báo khi số lượng tồn kho `So_Luong_Ton` < `Nguong_An_Toan`.
  - Bot cập nhật trạng thái thiết bị chi tiết khi phát sinh giao dịch xuất bán.
