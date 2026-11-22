---
description: Quy trình kiểm tra tự động ODOMS — chạy script gác cổng verify_odoms.js, test chỉ đọc PULL_ALL và dừng báo cáo đối chiếu.
---

# Quy trình Kiểm tra Tự động ODOMS (`/verify-odoms`)

Quy trình này thực thi kiểm tra chất lượng mã nguồn và đối chiếu dữ liệu Google Sheets ở chế độ **CHỈ ĐỌC (READ-ONLY)** trong phạm vi thư mục `S:\HTTT\`.

> **NGUYÊN TẮC CỨNG**:
> - Tuyệt đối **KHÔNG** chỉnh sửa bất kỳ tệp mã nguồn ứng dụng nào trong quá trình chạy quy trình này.
> - Tuyệt đối **KHÔNG** gửi yêu cầu ghi (`POST SYNC_ALL`, `PUSH_STATE`, `SYNC_SHIPMENTS`, `SYNC_USERS`, `SETUP_DB`, `SEED_FASHION_2026`) đẩy dữ liệu lên Sổ Google Sheets.

---

## Bước 1: Chạy Script Gác cổng Cục bộ (`verify_odoms.js`)

Thực thi lệnh kiểm tra tĩnh 0 thư viện ngoài trên toàn bộ mã nguồn ODOMS:

```powershell
node S:\HTTT\tools\verify_odoms.js
```

Kiểm tra đầy đủ 5 hạng mục bắt buộc:
1. **Cú pháp JavaScript & Apps Script**: Chạy `node --check` trên toàn bộ `.js` trong `01_ODOMS_WEB_APP/js/` và `tools/verify_odoms.js`; kiểm tra cú pháp biên dịch trên `.gs` trong `02_REALTIME_BACKEND_SYNC/`.
2. **Trùng lặp ID HTML**: Đảm bảo `01_ODOMS_WEB_APP/index.html` có **0 ID trùng lặp**.
3. **Quét sạch từ IT cấm trên giao diện**: Quét văn bản hiển thị người dùng trên `01_ODOMS_WEB_APP/index.html` và `01_ODOMS_WEB_APP/js/app.js` (bảo toàn ngoại lệ duy nhất `"Chào bạn, Admin"` của tài khoản dự phòng `lhmt`), liệt kê chính xác tệp, số dòng, từ vi phạm và gợi ý thuần Việt.
4. **Quét đơn vị tiền tệ cũ (`đ` / `₫` / `VNĐ`)**: Phát hiện mọi vị trí còn dùng ký hiệu tiền tệ cũ trên `index.html` và `js/app.js`, đảm bảo chuẩn hóa 100% sang duy nhất **`VND`**.
5. **Kiểm tra chốt chặn chống ghi đè Google Sheets & bất biến lõi**:
   - Chốt chặn chống race condition đẩy mảng đơn rỗng (`_bootPushGuardInstalled`, `_initialPullSettled`, chặn `AUDIT_LOGS_SYNC` / `USERS_RBAC_SYNC` khi `orders.length === 0`).
   - Khóa thời gian thực `<= Date.now()` chỉ ở tầng hiển thị (`getValidOrdersUpToNow`, `getValidShipmentsUpToNow`, `getEffectiveInventoryAtNow`).
   - Chốt chặn `!window.cloudSync.isPulling` trong `oms_engine.js`.
   - Bảo toàn 4 tài khoản gốc (`dttd`, `lhmt` ẩn dự phòng, `ntqg`, `nttn`), kịch bản `SP-AO-POLO-01` (tồn 10 cái, 2 lô, 4 đơn tranh chấp), 25 sản phẩm Thời trang 2026.
   - Bảo toàn 6 bảng PascalCase, `LockService`, tiền tệ số nguyên thuần (`parseCurrencyVND`), SĐT `setNumberFormat("@")` và quy tắc ĐVVC 3 tầng trên `ODOMS_Backend_API.gs`.

---

## Bước 2: Kiểm thử Kết nối Chỉ đọc Google Sheets (`GET ?action=PULL_ALL`)

Thực thi lệnh kiểm tra chỉ đọc đối với Sổ Google Sheets thật (chỉ dùng phương thức `GET`, tuyệt đối không ghi đè):

```powershell
node S:\HTTT\tools\verify_odoms.js --pull-only
```

Xác minh các tiêu chí đối chiếu từ dữ liệu trả về của `PULL_ALL`:
- Phản hồi hợp lệ `status === "SUCCESS"`.
- Có đủ dữ liệu cấu trúc **6 trang tính** (`DatHang`, `TonKho`, `LuuKho`, `VanDon`, `NhanSu`, `NhatKy`).
- Kiểm đếm thực tế: số đơn hàng, 25 sản phẩm Thời trang, 40 lô hàng, vận đơn, đủ 4 tài khoản gốc và kịch bản `SP-AO-POLO-01`.
- Xác nhận tiền tệ trả về là số nguyên thuần (không chứa `đ`/`₫`/`VND` trong ô tính), SĐT giữ đủ chữ số `0` ở đầu và cột `DonViVanChuyen` tuân thủ quy tắc 3 tầng.

---

## Bước 3: Dừng & Lập Báo cáo Đối chiếu cho Người dùng

**DỪNG TẠI ĐÂY — KHÔNG TỰ Ý SỬA MÃ NGUỒN.**

Trình bày báo cáo đối chiếu rõ ràng theo cấu trúc sau để người dùng duyệt trước khi thực hiện bước tiếp theo:

1. **Bảng Tổng quan Kết quả Gác cổng**: Liệt kê trạng thái `PASS` / `FAIL` / `WARN` của từng hạng mục kiểm tra cục bộ và kiểm thử chỉ đọc `PULL_ALL`.
2. **Danh sách Chi tiết Điểm Cần Xử lý (nếu có)**: Ghi rõ tên tệp, số dòng, nội dung hiện tại đang vi phạm (từ IT cấm, đơn vị `đ`/`₫`, trùng ID, lỗi cú pháp hoặc thiếu chốt chặn) và đề xuất phương án sửa tương ứng.
3. **Bảng Đối chiếu Dữ liệu `PULL_ALL`**: Số lượng bản ghi 6 bảng và tình trạng toàn vẹn dữ liệu thực tế trên Google Sheets.
4. **Hỏi ý kiến xác nhận của người dùng**: Chỉ tiến hành sửa đổi sau khi người dùng xác nhận đồng ý phương án.
