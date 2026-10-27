# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG QUẢN LÝ ĐƠN HÀNG ĐA KÊNH ĐỘC LẬP (OMNICHANNEL OMS)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục tiêu
Xây dựng một hệ thống Quản lý Đơn hàng (OMS - Order Management System) độc lập với nhiệm vụ:
- Tổng hợp đơn hàng từ 5 kênh bán hàng: **Shopee, Lazada, TikTok Shop, Facebook và Cửa hàng vật lý (POS)** về một giao diện tập trung.
- Quản lý tồn kho khả dụng thời gian thực (**Real-time ATP**), tự động trừ kho ngay khi có đơn mới, khóa bán đa kênh để loại bỏ hoàn toàn rủi ro bán quá số lượng (**Anti-Overselling**).
- Triển khai chuyên sâu **Phân hệ 1: Tiếp nhận & Kiểm tra Phân bổ Đơn hàng**, bao gồm: Tiếp nhận đa kênh $\rightarrow$ Kiểm tra tính hợp lệ $\rightarrow$ Đối chiếu tồn kho khả dụng $\rightarrow$ Tự động giữ hàng và phân bổ lô hàng theo nguyên tắc ưu tiên và hạn dùng gần nhất (**FEFO**).

### 1.2. Định vị Hệ thống
- **Độc lập 100% về mặt dữ liệu & logic nghiệp vụ:** Hệ thống OMS đóng vai trò là trạm điều phối trung tâm giữa các kênh bán (Sales Channels) và hệ thống vận hành nội bộ (WMS).
- **Kế thừa phong cách thiết kế UI/UX:** Giao diện sử dụng bảng màu tối (Dark Slate `#0f172a`), điểm nhấn màu xanh lá Emerald (`#10b981`), thanh điều hướng bên trái, các thẻ KPI trực quan và bảng dữ liệu hiển thị có độ tương phản cao tương tự như giao diện WMS mẫu.

---

## 2. KIẾN TRÚC HỆ THỐNG & DÒNG CHẢY DỮ LIỆU (DATA FLOW)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   5 KÊNH BÁN HÀNG ĐẦU VÀO                              │
│  [Shopee]    [Lazada]    [TikTok Shop]    [Facebook]    [Cửa hàng POS] │
└───────┬──────────┬──────────────┬──────────────┬──────────────┬────────┘
        │          │              │              │              │
        ▼          ▼              ▼              ▼              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG OMS ĐỘC LẬP                                 │
│                                                                        │
│  1. Ingestion Layer (Tiếp nhận & Chuẩn hóa Canonical Schema)          │
│     • Nhận diện kênh bán, bóc tách dữ liệu JSON/File                  │
│     • SKU Mapping: Chuyển mã sàn về SKU nội bộ                        │
│                                                                        │
│  2. Validation Engine (Kiểm tra tính hợp lệ đơn hàng)                 │
│     • Kiểm tra trạng thái thanh toán/xác nhận, địa chỉ giao hàng      │
│     • Kiểm tra SKU và số lượng đặt hợp lệ                             │
│                                                                        │
│  3. Real-time ATP Engine (Tính toán tồn kho khả dụng)                  │
│     • ATP = Tồn vật lý - Tồn đang giữ (Reserved)                       │
│                                                                        │
│  4. Priority Allocation & FEFO Engine (Phân bổ theo ưu tiên)          │
│     • Ưu tiên: POS > Hỏa tốc > Đơn thường (theo FIFO thời gian)       │
│     • Tự động giữ hàng (Reserved) và chỉ định Lô có HSD gần nhất       │
│                                                                        │
│  5. Gatekeeper & Anti-Overselling Service (Tự chặn & Đồng bộ)          │
│     • Tự động kích hoạt cờ CHẶN ĐƠN khi ATP không đủ                  │
│     • Phát tín hiệu cập nhật tồn khả dụng ngược lại các sàn           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU ĐỘC LẬP (DATABASE SCHEMA)

### 3.1. Bảng `Channels` (Kênh bán hàng)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `channel_id` | VARCHAR(20) | Khóa chính (`SHOPEE`, `TIKTOK`, `LAZADA`, `FACEBOOK`, `POS`) |
| `channel_name` | VARCHAR(50) | Tên kênh hiển thị |
| `badge_color` | VARCHAR(10) | Mã màu nhận diện trên UI (`#ee4d2d`, `#00f2fe`, `#0f146d`, `#1877f2`, `#8b5cf6`) |
| `priority_rank` | INT | Độ ưu tiên cấp phát (1: POS, 2: Hỏa tốc, 3: Tiêu chuẩn) |

### 3.2. Bảng `SKU_Mappings` (Chuẩn hóa mã sản phẩm đa sàn)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `mapping_id` | INT | Khóa chính tự tăng |
| `channel_id` | VARCHAR(20) | Khóa ngoại trỏ về `Channels` |
| `platform_sku_id` | VARCHAR(100) | Mã sản phẩm/phân loại gốc trên sàn |
| `internal_sku` | VARCHAR(50) | Mã SKU chuẩn quản lý nội bộ |

### 3.3. Bảng `Inventory_ATP` (Kiểm soát tồn kho thời gian thực)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `sku_code` | VARCHAR(50) | Khóa chính (Mã SKU nội bộ) |
| `product_name` | VARCHAR(255) | Tên sản phẩm hiển thị |
| `physical_stock` | INT | Tổng tồn kho vật lý thực tế |
| `reserved_stock` | INT | Số lượng đang giữ cho các đơn đã duyệt chờ xuất |
| `atp_stock` | INT | Tồn kho khả dụng cho phép bán: $\text{ATP} = \text{physical\_stock} - \text{reserved\_stock}$ |

### 3.4. Bảng `Batches` (Quản lý Lô hàng theo FEFO)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `batch_id` | VARCHAR(50) | Khóa chính (Mã lô sản xuất, ví dụ `LOT-2605`) |
| `sku_code` | VARCHAR(50) | Khóa ngoại liên kết SKU |
| `expiry_date` | DATE | Hạn sử dụng (xếp tăng dần phục vụ thuật toán FEFO) |
| `batch_quantity` | INT | Số lượng còn tồn trong lô |

### 3.5. Bảng `Orders` & `Order_Items` (Đơn hàng tập trung)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `order_id` | VARCHAR(50) | Khóa chính trên OMS |
| `original_sn` | VARCHAR(100) | Mã đơn gốc trên sàn |
| `channel_id` | VARCHAR(20) | Nguồn kênh bán |
| `created_at` | DATETIME | Dấu thời gian khách bấm mua (phục vụ xếp hàng FIFO) |
| `shipping_tier` | VARCHAR(20) | Cấp vận chuyển (`HOA_TOC`, `TIEU_CHUAN`) |
| `delivery_city` | VARCHAR(100) | Tỉnh/Thành phố nhận hàng |
| `order_status` | VARCHAR(30) | `CHO_KIEM_TRA`, `DA_GIU_HANG`, `BI_CHAN_THIEU_TON`, `HOAN_TAT` |
| `allocated_batch`| VARCHAR(50) | Mã lô FEFO được gán cho đơn |

---

## 4. QUY TRÌNH 4 BƯỚC PHÂN HỆ 1: TIẾP NHẬN & KIỂM TRA PHÂN BỔ

### Bước 1: Tiếp nhận & Chuẩn hóa Đơn hàng (Ingestion & Normalization)
1. Gom dữ liệu đơn hàng từ cả 5 nguồn về một cấu trúc dữ liệu chuẩn duy nhất (**Canonical Order Schema**).
2. Tra cứu bảng `SKU_Mappings` để quy đổi toàn bộ tên sản phẩm, mã phân loại trên các sàn về mã `internal_sku` nội bộ.
3. Gắn nhãn nhận diện kênh bán trực quan với màu sắc tương ứng trên bảng hiển thị.

### Bước 2: Kiểm tra Tính hợp lệ (Validation Engine)
Đơn hàng được đánh giá là `HỢP LỆ` khi thỏa mãn 3 điều kiện:
1. **Trạng thái giao dịch:** Đơn đã thanh toán trực tuyến hoặc đơn COD đã qua bước duyệt chống bùng hàng của sàn.
2. **Quy định vận chuyển đặc thù:** Đối với mặt hàng thực phẩm tươi sống/đông lạnh cần bảo quản lạnh, địa chỉ nhận hàng phải thuộc nội thành TP.HCM. Nếu giao liên tỉnh, hệ thống tự động gắn cờ cảnh báo ngoại lệ.
3. **Tính hợp lệ sản phẩm:** Mã SKU tồn tại trong danh mục và số lượng đặt mua $Q_{\text{đặt}} > 0$.

### Bước 3: Đối chiếu Tồn kho Khả dụng Thời gian thực (Real-time ATP Check)
Hệ thống tính toán lượng tồn kho khả dụng tại thời điểm xét duyệt:
$$\text{ATP}_{\text{hiện tại}} = \text{physical\_stock} - \text{reserved\_stock}$$

- **Trường hợp $\text{ATP}_{\text{hiện tại}} \ge Q_{\text{đặt}}$:** Đủ tồn kho $\rightarrow$ Chuyển tiếp sang Bước 4.
- **Trường hợp $\text{ATP}_{\text{hiện tại}} < Q_{\text{đặt}}$ (hoặc $\text{ATP} = 0$):**
  - **Kích hoạt cơ chế Cổng chặn (Gatekeeper):** Trạng thái đơn đổi thành `BỊ CHẶN - THIẾU TỒN KHO`.
  - **Khóa logic:** Không trừ tiếp vào tồn kho vật lý để đảm bảo số tồn không bị âm.
  - **Cách ly vận hành:** Không cấp phát mã lô, không đưa đơn vào danh sách nhặt hàng (Pick-list).
  - **Kích hoạt cảnh báo:** Bôi đỏ dòng đơn trên UI, hiển thị badge cảnh báo thiếu hàng, đưa đơn vào hàng đợi xử lý ngoại lệ (Backorder Queue).
  - **Đồng bộ khóa bán:** Đẩy lệnh cập nhật tồn $\text{ATP} = 0$ lên các sàn còn lại để chặn khách mua tiếp.

### Bước 4: Tự động Giữ hàng & Phân bổ theo Ưu tiên
- **Cơ chế Giữ hàng tức thì (Instant Reservation):**
  $$\text{reserved\_stock}_{\text{mới}} = \text{reserved\_stock}_{\text{cũ}} + Q_{\text{đặt}}$$
  $$\text{atp\_stock}_{\text{mới}} = \text{atp\_stock}_{\text{cũ}} - Q_{\text{đặt}}$$
- **Phân bổ theo Cấp độ Ưu tiên (Priority Hierarchy):**
  1. **Ưu tiên 1 (Kênh vật lý):** Đơn tại quầy POS luôn được cấp phát ngay lập tức.
  2. **Ưu tiên 2 (Cấp vận chuyển):** Đơn sàn TMĐT giao Hỏa tốc được xếp trước đơn tiêu chuẩn.
  3. **Ưu tiên 3 (Thời gian đặt - FIFO):** Các đơn cùng cấp được duyệt lần lượt theo mốc thời gian khách bấm mua (`created_at`).
- **Phân bổ Lô hàng theo FEFO (First-Expired, First-Out):**
  - Truy vấn bảng `Batches` của SKU đó, chọn lô hàng có `expiry_date` gần nhất còn tồn.
  - Gán trực tiếp `batch_id` vào đơn hàng để nhân viên căn cứ vào đó đóng gói đúng sản phẩm cận hạn nhất.

---

## 5. THIẾT KẾ MÀN HÌNH GIAO DIỆN OMS (DARK SLATE THEME)

### 5.1. Bố cục Tổng thể
- **Thanh bên trái (Sidebar):** Logo thương hiệu, menu điều hướng: *Dashboard Đa Kênh*, *Tiếp Nhận Đơn Hàng*, *Tồn Kho Khả Dụng (ATP)*, *Xử Lý Ngoại Lệ (Backorder)*.
- **Khu vực trên cùng (KPI Header Cards):**
  - Card 1: Tổng đơn tiếp nhận hôm nay.
  - Card 2: Đơn đã giữ kho thành công (Xanh lá).
  - Card 3: Đơn bị chặn do thiếu tồn kho (Đỏ cảnh báo).
  - Card 4: Tồn kho ATP tổng hợp 5 kênh.
- **Thanh lọc dữ liệu (Filter Bar):** Nút lọc nhanh theo từng kênh: `Tất cả`, `Shopee`, `TikTok Shop`, `Lazada`, `Facebook`, `Cửa hàng POS`.

### 5.2. Bảng Danh sách Tiếp nhận & Phân bổ Đơn hàng
| Mã đơn OMS | Kênh | Thời gian | SKU & Tên sản phẩm | SL | Trạng thái tồn | Lô FEFO gán | Trạng thái đơn | Thao tác |
| :--- | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| `ORD-POS-01` | **POS** | 09:10:00 | `ORG-001` - Sữa hạt hữu cơ | 2 | `Đủ tồn kho` | `LOT-2605` (15/11/2026) | `ĐÃ GIỮ HÀNG` | [Chi tiết] |
| `ORD-SP-101` | **Shopee** | 09:12:15 | `ORG-001` - Sữa hạt hữu cơ | 5 | `Đủ tồn kho` | `LOT-2605` (15/11/2026) | `ĐÃ GIỮ HÀNG` | [Chi tiết] |
| `ORD-TT-205` | **TikTok** | 09:15:30 | `ORG-001` - Sữa hạt hữu cơ | 4 | `THIẾU HÀNG` | *Chưa cấp phát* | `BỊ CHẶN (OOS)`| [Xử lý] |
| `ORD-LZD-88` | **Lazada** | 09:16:00 | `ORG-002` - Táo Envy hữu cơ | 1 | `Đủ tồn kho` | `LOT-2609` (05/11/2026) | `ĐÃ GIỮ HÀNG` | [Chi tiết] |

---

## 6. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (4 TUẦN)

### Tuần 1: Khởi tạo Kiến trúc & Thiết kế Giao diện
- Thiết lập cấu trúc cơ sở dữ liệu (Database Schema) gồm 5 bảng độc lập.
- Xây dựng bảng từ điển chuẩn hóa SKU Mapping cho các sàn TMĐT.
- Dựng khung giao diện web Dashboard OMS theo phong cách Dark Slate & Emerald bằng HTML/Tailwind CSS.

### Tuần 2: Lập trình Logic Nghiệp vụ Core
- Xây dựng cổng nạp đơn: Hỗ trợ tiếp nhận qua Webhook/REST API giả lập và nạp từ file Excel/CSV báo cáo đơn sàn.
- Lập trình Engine kiểm tra tính hợp lệ và thuật toán trừ tồn lũy kế thời gian thực (Running ATP).
- Lập trình thuật toán phân bổ Lô theo hạn sử dụng tăng dần (FEFO).

### Tuần 3: Tích hợp Giao diện & Cơ chế Tự Chặn
- Kết nối dữ liệu vào bảng điều khiển OMS, hoàn thiện các bộ lọc kênh bán và Modal chi tiết hành trình đơn.
- Lập trình cơ chế Cổng chặn (Gatekeeper): Tự động đổi trạng thái đơn sang màu đỏ `BỊ CHẶN (OOS)` khi thiếu tồn.
- Xây dựng tab *Xử lý ngoại lệ*: Hỗ trợ chức năng Hủy đơn, Đổi sản phẩm thay thế hoặc Điều chuyển kho.

### Tuần 4: Kiểm thử Kịch bản Đa kênh & Đóng gói Báo cáo
- Thực hiện kiểm thử kịch bản tranh chấp tồn kho (Stress Test) với các đơn hàng phát sinh đồng thời.
- Hoàn thiện tài liệu thuyết minh kiến trúc phần mềm và quy trình nghiệp vụ hệ thống thông tin.
- Chuẩn bị kịch bản demo trực quan cho buổi bảo vệ đồ án.

---

## 7. KỊCH BẢN KIỂM THỬ DEMO (TEST CASES)

| Mã test | Kênh | Dữ liệu đầu vào | Kỳ vọng hệ thống xử lý | Ý nghĩa chứng minh |
| :---: | :---: | :--- | :--- | :--- |
| **TC-01** | TikTok | Đặt 5 hộp `ORG-001` (Tồn ban đầu = 10) | Duyệt đơn $\rightarrow$ Chuyển xanh `ĐÃ GIỮ HÀNG` $\rightarrow$ Gán Lô `LOT-2605` $\rightarrow$ ATP giảm còn 5. | Quy trình chuẩn: Giữ hàng thời gian thực & Gán lô FEFO. |
| **TC-02** | Shopee | Đặt 7 hộp `ORG-001` (ATP hiện tại = 5) | Lập tức kích hoạt **CHẶN ĐƠN** $\rightarrow$ Dòng bôi đỏ `BỊ CHẶN (OOS)` $\rightarrow$ Không cấp lô $\rightarrow$ ATP giữ nguyên = 5. | Chứng minh tính năng **Anti-Overselling**: Ngăn chặn bán quá số lượng. |
| **TC-03** | POS | Đặt 2 hộp `ORG-001` (ATP hiện tại = 5) | Ưu tiên cấp phát ngay $\rightarrow$ Duyệt `ĐÃ GIỮ HÀNG` $\rightarrow$ ATP giảm còn 3. | Chứng minh quy tắc ưu tiên cho khách mua trực tiếp tại quầy. |