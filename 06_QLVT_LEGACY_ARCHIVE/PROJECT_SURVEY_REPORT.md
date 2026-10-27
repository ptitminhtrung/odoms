# BÁO CÁO KHẢO SÁT HỆ THỐNG DỮ LIỆU GOOGLE SHEETS
**Dự án:** Quản lý Vật tư & Thiết bị - Công ty Trường Tiến (rdbms-schema-truong-tien-v9)  
**Spreadsheet ID:** `1IU0bFj13XiEvzvUxXQTWEFl_hHyPT1_4TkXkHkYLHX0`  
**Tổng số Tab:** 10 Tabs  

---

## 1. TỔNG QUAN DANH SÁCH CÁC TAB

| STT | Tên Tab (Sheet Name) | Sheet ID | Dòng Tiêu Đề | Số Cột | Số Dòng Dữ Liệu | Số Công Thức | Mục Đích Sử Dụng |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | **`tbl_Overview`** | `1484729739` | Hàng 1 | 1 | 23 | 9 | Trang giới thiệu kiến trúc & menu điều hướng nhanh |
| 2 | **`tbl_VatTu`** | `447971877` | Hàng 4 | 8 | 9 | 9 | Danh mục vật tư, thiết bị & License phần mềm |
| 3 | **`tbl_Template_QuyCach`** | `894107647` | Hàng 4 | 3 | 4 | 0 | Quy cách đóng gói phần cứng (Cái / Thùng) |
| 4 | **`tbl_Template_License`** | `2085878717` | Hàng 4 | 4 | 5 | 0 | Định nghĩa chủng loại & thời hạn License VIVOTEK |
| 5 | **`tbl_QuanLyThung`** | `449855586` | Hàng 4 | 5 | 4 | 8 | Quản lý nhập hàng theo kiện/thùng quy cách |
| 6 | **`tbl_ThietBi_ChiTiet`** | `26441130` | Hàng 4 | 10 | 25 | 50 | Quản lý từng đơn vị thiết bị (QR, MAC, Bảo hành, Vị trí) |
| 7 | **`tbl_NhanVien`** | `1985225419` | Hàng 4 | 4 | 4 | 0 | Danh sách nhân viên, kỹ thuật viên & thủ kho |
| 8 | **`tbl_KhachHang`** | `857777629` | Hàng 4 | 4 | 2 | 0 | Danh mục đối tác / khách hàng / địa điểm công trình |
| 9 | **`tbl_GiaoDich`** | `2101321956` | Hàng 4 | 13 | 8 | 8 | Lịch sử Nhập / Xuất kho / Bàn giao (GPS + Chữ ký POD) |
| 10 | **`tbl_NhatKyBaoTri`** | `1917032601` | Hàng 4 | 9 | 2 | 0 | Nhật ký ghi nhận sự cố, bảo trì và xử lý lỗi tại chỗ |

---

## 2. CHI TIẾT CẤU TRÚC CỘT VÀ CÔNG THỨC TỪNG TAB

### 🔹 Tab 1: `tbl_Overview` (ID: `1484729739`)
* **Chức năng:** Bản vẽ cấu trúc RDBMS Serverless v4.1 và bảng điều hướng nhanh.
* **Công thức (9 ô):** Sử dụng hàm `=HYPERLINK("#gid=...", "Go to...")` để nhảy đến từng Tab.

---

### 🔹 Tab 2: `tbl_VatTu` (ID: `447971877`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_VatTu (PK)**: Mã định danh vật tư (VD: `FD9380-HTV-V2`, `718000500`)
  2. `[B]` **Ten_VatTu**: Tên đầy đủ của thiết bị / License
  3. `[C]` **Loai_VatTu**: Phân loại (`Camera`, `Switch`, `License`)
  4. `[D]` **Don_Vi_Tinh**: Đơn vị tính (`Cái`, `Gói`, `License`)
  5. `[E]` **So_Luong_Ton (Formula)**: Số lượng tồn kho tính tự động
  6. `[F]` **Nguong_An_Toan**: Ngưỡng cảnh báo tồn kho tối thiểu
  7. `[G]` **Don_Gia**: Đơn giá vật tư
  8. `[H]` **Thoi_Han_BH**: Thời hạn bảo hành tính theo tháng hoặc `Vĩnh viễn`
* **Công thức hiện có:**
  * Cột `E5:E13`:
    ```excel
    =COUNTIFS(tbl_ThietBi_ChiTiet!$B$5:$B$30; A5; tbl_ThietBi_ChiTiet!$G$5:$G$30; "Trong kho")
    ```
    *(Tự động đếm số lượng bản ghi trong `tbl_ThietBi_ChiTiet` có mã vật tư tương ứng và trạng thái đang là "Trong kho")*

---

### 🔹 Tab 3: `tbl_Template_QuyCach` (ID: `894107647`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_VatTu (PK/FK)**: Mã vật tư
  2. `[B]` **Ten_VatTu**: Tên thiết bị
  3. `[C]` **Quy_Cach_Dong_Goi (Cái/Thùng)**: Số cái / đơn vị trong 1 thùng đóng gói tiêu chuẩn

---

### 🔹 Tab 4: `tbl_Template_License` (ID: `2085878717`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_VatTu (PK/FK)**: Mã vật tư license
  2. `[B]` **Ten_License**: Tên gói phần mềm
  3. `[C]` **Ma_Goc_Vivotek**: Mã nhận dạng chuẩn từ hãng Vivotek
  4. `[D]` **Hạn Bảo Hành Hãng**: Quy định bảo hành của hãng (VD: `Vĩnh viễn`)

---

### 🔹 Tab 5: `tbl_QuanLyThung` (ID: `449855586`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_Thung (PK)**: Mã kiện/thùng (VD: `THUNG-001`)
  2. `[B]` **ID_VatTu (FK)**: Khóa ngoại liên kết `tbl_VatTu`
  3. `[C]` **So_Luong_Thung**: Số lượng thùng nhập
  4. `[D]` **Quy_Cach_Dong_Goi (Formula)**: Quy cách lấy tự động
  5. `[E]` **Tong_So_Luong_Cai (Formula)**: Tổng số cái thực tế
* **Công thức hiện có:**
  * Cột `D5:D8`: `=IFERROR(VLOOKUP(B5;tbl_Template_QuyCach!$A$5:$C$15;3;FALSE);"")`
  * Cột `E5:E8`: `=C5*D5`

---

### 🔹 Tab 6: `tbl_ThietBi_ChiTiet` (ID: `26441130`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **QR_Code_Don_Vi (PK)**: Mã Serial / QR Code duy nhất của từng thiết bị
  2. `[B]` **ID_VatTu (FK)**: Liên kết `tbl_VatTu`
  3. `[C]` **Ma_MAC**: Địa chỉ MAC phần cứng
  4. `[D]` **Ma_Thung_Nhap**: Mã thùng nhập liên kết `tbl_QuanLyThung`
  5. `[E]` **Ngay_Truong_Tien_Nhap**: Ngày nhập kho Trường Tiến
  6. `[F]` **Ngay_Het_Han_BH_Hang (Formula)**: Ngày hết hạn BH nhà sản xuất
  7. `[G]` **Trang_Thai**: Tình trạng (`Trong kho`, `Đã xuất bán`, `Đang bảo trì`)
  8. `[H]` **ID_KhachHang (FK)**: Mã khách hàng đang sử dụng thiết bị
  9. `[I]` **Ngay_Ban_Cho_KH**: Ngày bàn giao xuất bán
  10. `[J]` **Ngay_Het_Han_BH_KH (Formula)**: Ngày hết hạn BH với khách hàng
* **Công thức hiện có (50 ô):**
  * Cột `F5:F29`: `=IF(E5="";"";IF(VLOOKUP(B5;tbl_VatTu!$A$5:$H$15;8;FALSE)="Vĩnh viễn";"Vĩnh viễn";EDATE(E5;VLOOKUP(B5;tbl_VatTu!$A$5:$H$15;8;FALSE))))`
  * Cột `J5:J29`: `=IF(I5="";"";IF(VLOOKUP(B5;tbl_VatTu!$A$5:$H$15;8;FALSE)="Vĩnh viễn";"Vĩnh viễn";EDATE(I5;VLOOKUP(B5;tbl_VatTu!$A$5:$H$15;8;FALSE))))`

---

### 🔹 Tab 7: `tbl_NhanVien` (ID: `1985225419`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **Email_NhanVien (PK)**: Email nhân viên (dùng cho phân quyền User AppSheet)
  2. `[B]` **Ho_Ten**: Họ và tên
  3. `[C]` **So_Dien_Thoai**: Số điện thoại liên lạc
  4. `[D]` **Vai_Tro**: Vai trò (`Kỹ thuật viên`, `Thủ kho`, `Admin`)

---

### 🔹 Tab 8: `tbl_KhachHang` (ID: `857777629`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_KhachHang (PK)**: Mã khách hàng (VD: `KH-BIDV-001`, `KH-AEON-001`)
  2. `[B]` **Ten_KhachHang**: Tên đơn vị / doanh nghiệp
  3. `[C]` **Dia_Chi**: Địa chỉ trụ sở / công trình
  4. `[D]` **Email_Lien_He**: Email liên hệ chính

---

### 🔹 Tab 9: `tbl_GiaoDich` (ID: `2101321956`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_GiaoDich (PK)**: Mã giao dịch (VD: `GD-20260810-001`)
  2. `[B]` **Ngay_Gio**: Thời gian phát sinh giao dịch
  3. `[C]` **Loai_Giao_Dich**: `Nhập kho` / `Xuất kho cung ứng` / `Bàn giao`
  4. `[D]` **ID_VatTu (FK)**: Mã vật tư
  5. `[E]` **QR_Code_Don_Vi (FK)**: Mã thiết bị chi tiết
  6. `[F]` **Ma_MAC**: Địa chỉ MAC
  7. `[G]` **So_Luong_Cai**: Số lượng giao dịch
  8. `[H]` **Email_NhanVien (FK)**: Nhân viên thực hiện
  9. `[I]` **ID_KhachHang (FK)**: Khách hàng thụ hưởng
  10. `[J]` **Ngay_KH_Nhan**: Ngày khách hàng nghiệm thu
  11. `[K]` **Ngay_Het_Han_BH_KH (Formula)**: Hạn bảo hành theo giao dịch
  12. `[L]` **Vi_Tri_GPS**: Tọa độ GPS ghi nhận qua thiết bị di động
  13. `[M]` **Chu_Ky_POD**: Chữ ký điện tử Proof of Delivery (POD)
* **Công thức hiện có:**
  * Cột `K5:K12`: `=IF(J5="";"";IF(VLOOKUP(D5;tbl_VatTu!$A$5:$H$15;8;FALSE)="Vĩnh viễn";"Vĩnh viễn";EDATE(J5;VLOOKUP(D5;tbl_VatTu!$A$5:$H$15;8;FALSE))))`

---

### 🔹 Tab 10: `tbl_NhatKyBaoTri` (ID: `1917032601`)
* **Hàng tiêu đề:** Hàng 4
* **Danh sách cột:**
  1. `[A]` **ID_BaoTri (PK)**: Mã sự vụ bảo trì (VD: `BT-20260814-001`)
  2. `[B]` **Ngay_Bao_Tri**: Ngày thực hiện
  3. `[C]` **ID_VatTu (FK)**: Mã vật tư bảo trì
  4. `[D]` **QR_Code_Don_Vi (FK)**: Thiết bị gặp sự cố
  5. `[E]` **Ma_MAC**: Địa chỉ MAC
  6. `[F]` **ID_KhachHang (FK)**: Khách hàng yêu cầu
  7. `[G]` **Email_NhanVien (FK)**: Kỹ thuật viên phụ trách
  8. `[H]` **Tinh_Trang_Loi**: Mô tả tình trạng hư hỏng
  9. `[I]` **Huong_Xu_Ly**: Phương án giải quyết (`Sửa tại chỗ`, `Đổi thiết bị mới`, ...)
