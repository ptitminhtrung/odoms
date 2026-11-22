---
trigger: glob
globs: 02_REALTIME_BACKEND_SYNC/**, **/02_REALTIME_BACKEND_SYNC/**
---

# ODOMS — Quy tắc Backend Google Apps Script & Google Sheets (Tầng 3 — `02_REALTIME_BACKEND_SYNC/**`)

Quy tắc này tự động áp dụng khi đọc hoặc chỉnh sửa bất kỳ tệp nào trong `S:\HTTT\02_REALTIME_BACKEND_SYNC\` (`ODOMS_Backend_API.gs`, `FIFO_Engine.gs`, ...).

---

## 1. Kiến trúc Chuẩn 6 Bảng (Trang tính) Tiếng Việt Không Dấu — PascalCase

Sổ dữ liệu Google Sheets của ODOMS bắt buộc duy trì đúng **6 trang tính PascalCase** khớp 1:1 với `ODOMS_CONFIG.SHEETS` và `ODOMS_CONFIG.HEADERS` trong `ODOMS_Backend_API.gs`:

| STT | Tên trang tính | Số cột chuẩn | Danh sách tiêu đề cột PascalCase |
| :---: | :--- | :---: | :--- |
| 1 | **`DatHang`** | 19 | `MaDonGoc`, `SanTMDT`, `ThoiGianDat`, `MaSanPhamSKU`, `TenSanPham`, `SoLuong`, `DonGia`, `KhachHang`, `SoDienThoai`, `DiaChiGiao`, `TrangThaiSan`, `PhuongThucThanhToan`, `NguonTiepNhan`, `TrangThaiDieuPhoi`, `ThuTuGiuHang`, `PhanBoLoHang`, `DonViVanChuyen`, `MaVanDon`, `ThoiGianCapNhat` |
| 2 | **`TonKho`** | 15 | `MaSanPhamSKU`, `TenSanPham`, `NhomHang`, `DonViTinh`, `DonGia`, `SucChuaToiDa`, `TonKho`, `KhachDat`, `CoTheBan`, `GiuChoShopee`, `GiuChoTikTok`, `GiuChoLazada`, `GiuChoFacebook`, `GiuChoPOS`, `ThoiGianCapNhat` |
| 3 | **`LuuKho`** | 8 | `MaLoHang`, `MaQR`, `MaSanPhamSKU`, `NgayNhapKho`, `HanSuDung`, `SoLuongBanDau`, `SoLuongConLai`, `ThoiGianCapNhat` |
| 4 | **`VanDon`** | 21 | `MaVanDon`, `MaDonGoc`, `SanTMDT`, `DonViVanChuyen`, `DichVuGiao`, `PhiVanChuyen`, `MienPhiVanChuyen`, `TienThuHoCOD`, `TrangThaiVanChuyen`, `NguoiNhan`, `SoDienThoaiNhan`, `DiaChiNhan`, `TomTatHangHoa`, `MaLoHang`, `BuuTaPhuTrach`, `SoDienThoaiBuuTa`, `ViTriHienTai`, `TienDoPhanTram`, `ThoiGianBanGiao`, `LichSuHanhTrinh`, `ThoiGianCapNhat` |
| 5 | **`NhanSu`** | 14 *(mở rộng bảo mật ở HT#5)* | `MaNhanSu`, `TenDangNhap`, `MatKhau`, `HoVaTen`, `KyHieuAvatar`, `VaiTro`, `PhongBan`, `CaLamViec`, `TrangThaiTaiKhoan`, `QuyenQuanTriGoc`, `TaiKhoanDuPhongAn`, `TamNgungDen`, `LyDoTamNgung`, `ThoiGianCapNhat` |
| 6 | **`NhatKy`** | 7 | `MaNhatKy`, `ThoiGianThucHien`, `TenDangNhap`, `HoVaTen`, `NoiDungThaoTac`, `DiaChiIP`, `KetQua` |

- Giữ nguyên `LEGACY_SHEET_MAP` (`Orders` → `DatHang`, `Inventory_ATP` → `TonKho`, `Batches` → `LuuKho`, `Shipments` → `VanDon`, `Users_RBAC` → `NhanSu`, `AuditLogs` → `NhatKy`) và hàm nâng cấp `migrateDatHangAddCarrierColumn()` để chèn cột `DonViVanChuyen` an toàn không làm lệch dữ liệu cũ.
- Khi bổ sung cột mới ở các giai đoạn sau (như cột bảo mật ở Hội thoại #5), phải nâng cấp an toàn, không xóa hay làm mất dữ liệu hiện hành của 6 bảng.

---

## 2. Lưu trữ Tiền tệ Dạng Số Nguyên Thuần (Pure Integer Currency)

- Toàn bộ các cột giá trị tiền tệ trên Google Sheets bao gồm:
  - `DatHang.DonGia`
  - `TonKho.DonGia`
  - `VanDon.PhiVanChuyen`
  - `VanDon.TienThuHoCOD`
  bắt buộc lưu ở dạng **số nguyên thuần (`Number` / `Math.round`)** thông qua `parseCurrencyVND()` (ví dụ: `250000`, `35000`, `0`).
- **Tuyệt đối không ghi kèm đơn vị tiền tệ (`đ`, `₫`, `VND`, `VNĐ`) hay dấu phân cách chuỗi** vào các ô số tiền trên Google Sheets để tránh lỗi hàm tính toán bảng tính và đảm bảo Web App hiển thị đồng nhất theo đơn vị `VND`.

---

## 3. Bảo toàn Số điện thoại 10 Chữ số bằng `setNumberFormat("@")`

- Các cột số điện thoại được quản lý tập trung tại `ODOMS_CONFIG.PHONE_TEXT_COLUMNS`:
  - **`DatHang`**: `SoDienThoai`
  - **`VanDon`**: `SoDienThoaiNhan`, `SoDienThoaiBuuTa`
- Mọi thao tác khởi tạo (`setupODOMSDatabase`, `ensureSheetsInitialized`) và ghi dữ liệu (`writeOrdersSheet`, `writeShipmentsSheet`) bắt buộc áp dụng:
  ```javascript
  sheet.getRange(2, idx + 1, dataRowCount, 1).setNumberFormat("@");
  ```
  thông qua `applyPhoneTextFormatToSheet()` / `applyPhoneTextFormatToAllSheets()` **trước khi ghi `setValues()`** (và duy trì trên toàn bộ vùng dữ liệu) để Google Sheets không bao giờ tự động ép kiểu số làm mất số `0` ở đầu.
- Luôn chuẩn hóa giá trị số điện thoại qua hàm chuẩn hóa Việt Nam (tự bù số `0` nếu còn 9 chữ số, chuyển đầu `84` → `0`, bỏ dấu nháy đơn thừa ở đầu chuỗi).

---

## 4. Khóa Tương tranh, ĐVVC 3 Tầng & Kỷ luật Triển khai

1. **Khóa tương tranh (`LockService`)**: Mọi nhánh ghi trong `doPost(e)` bắt buộc lấy khóa `LockService.getScriptLock().tryLock(ODOMS_CONFIG.LOCK_TIMEOUT_MS)` (`30000` ms) và giải phóng chắc chắn trong khối `finally { lock.releaseLock(); }`.
2. **ĐVVC 3 tầng đồng bộ**: Mọi lệnh ghi `DatHang` / `VanDon` phải đi qua `resolveOrderCarrierBackend(orderObj, shipmentsByOrderId, shipmentsByTracking)` tuân thủ đúng 3 tầng (*`VanDon` → `DatHang`/Excel → `"Tại quầy"` cho POS hoặc `"Chưa gán ĐVVC"` cho ngoài sàn*).
3. **An toàn cổng đọc `doGet(e)`**: Các action `PING` và `PULL_ALL` chỉ phục vụ đọc trạng thái, tuyệt đối không xóa hay ghi đè dữ liệu vận hành.
4. **Bảo vệ bảng `NhanSu`**: Bảo toàn 4 tài khoản gốc (`dttd`, `lhmt` ẩn dự phòng, `ntqg`, `nttn`); không để `seedFashion2026Data()` xóa hay ghi đè ngược thông tin bảo mật nhân sự.
5. **Độc lập triển khai & Ngôn ngữ nghiệp vụ**: `ODOMS_Backend_API.gs` giữ cấu trúc tệp đơn độc lập (copy–dán 1 lần vào Apps Script là Deploy được ngay); mọi thông điệp trả về (`message`) viết bằng tiếng Việt nghiệp vụ rõ ràng, không lộ thuật ngữ IT thô ra giao diện người dùng.
