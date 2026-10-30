// ============================================================================
// DỮ LIỆU KHỞI TẠO HỆ THỐNG ODOMS (QUẢN LÝ ĐƠN HÀNG ĐA KÊNH & PHÂN BỔ LÔ HÀNG FEFO)
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\mock_data.js
// ============================================================================

// 1. Danh sách Tài khoản Người dùng Mặc định (Hỗ trợ thêm mới tùy ý qua LocalStorage)
window.DEFAULT_OMS_USERS = [
  {
    id: "USR-001",
    username: "dttd",
    password: "dttd123",
    fullName: "Đỗ Thị Thuỳ Dung",
    avatar: "TD",
    role: "Chuyên viên Vận hành",
    department: "Ban Điều phối Đơn hàng Đa kênh",
    shift: "Ca Hành chính (08:00 - 17:00)",
    status: "ACTIVE",
    isRoot: true,
    isHiddenBackup: false,
    createdAt: "2026-10-01 08:00:00"
  },
  {
    id: "USR-002",
    username: "lhmt",
    password: "lhmt123",
    fullName: "Lê Hoàng Minh Trung",
    avatar: "MT",
    role: "Chuyên viên Vận hành (Dự phòng)",
    department: "Ban Điều phối Đơn hàng Đa kênh",
    shift: "Toàn thời gian (Cứu hộ hệ thống)",
    status: "ACTIVE",
    isRoot: true,
    isHiddenBackup: true,
    createdAt: "2026-10-05 09:15:00"
  },
  {
    id: "USR-003",
    username: "ntqg",
    password: "ntqg123",
    fullName: "Nguyễn Thị Quỳnh Giao",
    avatar: "QG",
    role: "Chuyên viên Điều phối",
    department: "Phòng Tiếp nhận & Phân bổ Đa kênh",
    shift: "Ca Sáng (07:30 - 16:30)",
    status: "ACTIVE",
    isRoot: false,
    isHiddenBackup: false,
    createdAt: "2026-10-10 08:30:00"
  },
  {
    id: "USR-004",
    username: "nttn",
    password: "nttn123",
    fullName: "Nguyễn Thị Thúy Ngân",
    avatar: "TN",
    role: "Quản lý kho",
    department: "Bộ phận Kho & Đối chiếu Lô kệ",
    shift: "Ca Chiều (13:00 - 21:00)",
    status: "ACTIVE",
    isRoot: false,
    isHiddenBackup: false,
    createdAt: "2026-10-12 13:00:00"
  }
];

// 2. Dữ liệu Tồn kho Khả dụng (ATP) & Lô hàng (Batch FEFO) trên Hệ thống ODOMS
window.INITIAL_INVENTORY = [
  {
    sku: "SP-AO-POLO-01",
    name: "Áo Polo Nam Coolmate Pro (Đen - Size L)",
    category: "Thời trang",
    unit: "Cái",
    price: 250000,
    maxCapacity: 25,
    physicalStock: 10, // Đặt đúng 10 cái để minh họa kịch bản tranh chấp tồn kho FIFO giữa 4 sàn
    reservedStock: 0,
    availableStock: 10,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-A1",
        qrCode: "OD-POLO-1001",
        importDate: "2026-10-01",
        expiryDate: "2027-10-01",
        initialQty: 6,
        remainingQty: 6
      },
      {
        batchCode: "LO-2026-A2",
        qrCode: "OD-POLO-1010",
        importDate: "2026-10-10",
        expiryDate: "2027-10-10",
        initialQty: 4,
        remainingQty: 4
      }
    ]
  },
  {
    sku: "SP-TAI-NGHE-02",
    name: "Tai nghe Bluetooth Không dây TWS ANC Pro",
    category: "Phụ kiện số",
    unit: "Hộp",
    price: 490000,
    maxCapacity: 30,
    physicalStock: 15,
    reservedStock: 0,
    availableStock: 15,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-B1",
        qrCode: "OD-TWS-1003",
        importDate: "2026-10-03",
        expiryDate: "2028-04-03",
        initialQty: 10,
        remainingQty: 10
      },
      {
        batchCode: "LO-2026-B2",
        qrCode: "OD-TWS-1012",
        importDate: "2026-10-12",
        expiryDate: "2028-04-12",
        initialQty: 5,
        remainingQty: 5
      }
    ]
  },
  {
    sku: "SP-BALO-LAP-03",
    name: "Balo Laptop Chống Nước 15.6 inch Urban",
    category: "Túi & Balo",
    unit: "Chiếc",
    price: 380000,
    maxCapacity: 20,
    physicalStock: 8,
    reservedStock: 0,
    availableStock: 8,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-C1",
        qrCode: "OD-BALO-1005",
        importDate: "2026-10-05",
        expiryDate: "2028-10-05",
        initialQty: 5,
        remainingQty: 5
      },
      {
        batchCode: "LO-2026-C2",
        qrCode: "OD-BALO-1015",
        importDate: "2026-10-15",
        expiryDate: "2028-10-15",
        initialQty: 3,
        remainingQty: 3
      }
    ]
  },
  {
    sku: "SP-BINH-NHIET-04",
    name: "Bình Giữ Nhiệt Inox 304 Lock&Lock 900ml",
    category: "Gia dụng",
    unit: "Bình",
    price: 310000,
    maxCapacity: 40,
    physicalStock: 20,
    reservedStock: 0,
    availableStock: 20,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-D1",
        qrCode: "OD-BINH-1002",
        importDate: "2026-10-02",
        expiryDate: "2029-10-02",
        initialQty: 20,
        remainingQty: 20
      }
    ]
  },
  {
    sku: "SP-BAN-PHIM-05",
    name: "Bàn Phím Cơ Không Dây RGB K68 Hotswap",
    category: "Phụ kiện số",
    unit: "Bộ",
    price: 650000,
    maxCapacity: 20,
    physicalStock: 6,
    reservedStock: 0,
    availableStock: 6,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-E1",
        qrCode: "OD-KEYB-1008",
        importDate: "2026-10-08",
        expiryDate: "2028-10-08",
        initialQty: 6,
        remainingQty: 6
      }
    ]
  }
];

// 3. Thông tin cấu hình 5 kênh bán hàng (Front-end Sales Channels)
window.CHANNELS_CONFIG = {
  SHOPEE: {
    code: "SHOPEE",
    name: "Shopee Mall",
    shortName: "Shopee",
    color: "#ee4d2d",
    apiEndpoint: "https://partner.shopeemobile.com/api/v2/product/update_stock",
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  TIKTOK: {
    code: "TIKTOK",
    name: "TikTok Shop",
    shortName: "TikTok Shop",
    color: "#0f172a",
    apiEndpoint: "https://open-api.tiktokglobalshop.com/product/202309/inventory/update",
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  LAZADA: {
    code: "LAZADA",
    name: "Lazada Mall",
    shortName: "Lazada",
    color: "#1d4ed8",
    apiEndpoint: "https://api.lazada.vn/rest/product/price_quantity/update",
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  FACEBOOK: {
    code: "FACEBOOK",
    name: "Facebook Shop / Live",
    shortName: "Facebook",
    color: "#0284c7",
    apiEndpoint: "https://graph.facebook.com/v19.0/commerce_inventory/sync",
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  POS: {
    code: "POS",
    name: "Cửa hàng vật lý (POS)",
    shortName: "Cửa hàng POS",
    color: "#15803d",
    apiEndpoint: "wss://pos-internal.oms.local/realtime-stock",
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  }
};

// 4. Dữ liệu file Excel mẫu của từng sàn (Cấu trúc cột thực tế khi xuất từ Seller Center các sàn)
window.SAMPLE_EXCEL_DATASETS = {
  // 4.1. Mẫu xuất từ Shopee Seller Centre
  SHOPEE: [
    {
      "Mã đơn hàng": "SP261022001",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-10-22 08:15:10",
      "SKU phân loại": "SP-AO-POLO-01",
      "Tên sản phẩm": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "Số lượng": 4,
      "Đơn giá": 250000,
      "Người Mua": "Nguyễn Văn An",
      "Số điện thoại": "0901234567",
      "Địa chỉ nhận hàng": "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay"
    },
    {
      "Mã đơn hàng": "SP261022002",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-10-22 08:20:00",
      "SKU phân loại": "SP-TAI-NGHE-02",
      "Tên sản phẩm": "Tai nghe Bluetooth Không dây TWS ANC Pro",
      "Số lượng": 3,
      "Đơn giá": 490000,
      "Người Mua": "Trần Thị Bích",
      "Số điện thoại": "0912345678",
      "Địa chỉ nhận hàng": "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "COD (Thanh toán khi nhận hàng)"
    },
    {
      "Mã đơn hàng": "SP261022003",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-10-22 08:25:30",
      "SKU phân loại": "SP-BAN-PHIM-05",
      "Tên sản phẩm": "Bàn Phím Cơ Không Dây RGB K68 Hotswap",
      "Số lượng": 4,
      "Đơn giá": 650000,
      "Người Mua": "Lê Hoàng Nam",
      "Số điện thoại": "0987654321",
      "Địa chỉ nhận hàng": "88 Cầu Giấy, Phường Cầu Giấy, TP.Hà Nội",
      "Trạng thái đơn hàng": "Chưa xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay"
    }
  ],

  // 4.2. Mẫu xuất từ TikTok Shop Seller Center
  TIKTOK: [
    {
      "Order ID": "TT261022101",
      "Channel": "TIKTOK",
      "Created Time": "2026-10-22 08:16:05",
      "Seller SKU": "SP-AO-POLO-01",
      "Product Name": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "Quantity": 4,
      "Unit Price": 250000,
      "Recipient": "Phạm Minh Tuấn",
      "Phone": "0933445566",
      "Shipping Address": "56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM",
      "Order Status": "Đã xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)"
    },
    {
      "Order ID": "TT261022102",
      "Channel": "TIKTOK",
      "Created Time": "2026-10-22 08:21:15",
      "Seller SKU": "SP-BALO-LAP-03",
      "Product Name": "Balo Laptop Chống Nước 15.6 inch Urban",
      "Quantity": 5,
      "Unit Price": 380000,
      "Recipient": "Hoàng Thùy Linh",
      "Phone": "0977889900",
      "Shipping Address": "12 Trần Phú, phường Nha Trang, tỉnh Khánh Hòa",
      "Order Status": "Đã xác nhận",
      "Payment Method": "Ví ZaloPay"
    },
    {
      "Order ID": "TT261022103",
      "Channel": "TIKTOK",
      "Created Time": "2026-10-22 08:27:10",
      "Seller SKU": "SP-BAN-PHIM-05",
      "Product Name": "Bàn Phím Cơ Không Dây RGB K68 Hotswap",
      "Quantity": 3,
      "Unit Price": 650000,
      "Recipient": "Đặng Quốc Khánh",
      "Phone": "0966112233",
      "Shipping Address": "90 Lạch Tray, Phường Lê Chân, TP.Hải Phòng",
      "Order Status": "Chờ xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)"
    }
  ],

  // 4.3. Mẫu xuất từ Lazada Seller Center
  LAZADA: [
    {
      "orderNumber": "LZ261022201",
      "channel": "LAZADA",
      "createTime": "2026-10-22 08:18:45",
      "sellerSku": "SP-AO-POLO-01",
      "itemName": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "qty": 3,
      "unitPrice": 250000,
      "customerName": "Võ Thành Đạt",
      "customerPhone": "0944556677",
      "shippingAddress": "78 Nguyễn Văn Linh, Phường Tân Thuận, TP.HCM",
      "order_status": "Đã xác nhận",
      "paymentMethod": "Thẻ Visa / Mastercard"
    },
    {
      "orderNumber": "LZ261022202",
      "channel": "LAZADA",
      "createTime": "2026-10-22 08:19:10",
      "sellerSku": "SP-BINH-NHIET-04",
      "itemName": "Bình Giữ Nhiệt Inox 304 Lock&Lock 900ml",
      "qty": 6,
      "unitPrice": 310000,
      "customerName": "Ngô Thanh Vân",
      "customerPhone": "0918273645",
      "shippingAddress": "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ",
      "order_status": "Đã xác nhận",
      "paymentMethod": "COD (Thanh toán khi nhận hàng)"
    }
  ],

  // 4.4. Mẫu đơn từ Facebook Fanpage & Cửa hàng vật lý (POS)
  FACEBOOK_POS: [
    {
      "Ma_Don": "POS261022301",
      "Kenh_Ban": "POS",
      "Thoi_Gian_Dat": "2026-10-22 08:17:20",
      "Ma_SKU": "SP-AO-POLO-01",
      "Ten_SP": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "So_Luong": 2,
      "Don_Gia": 250000,
      "Ten_Khach": "Khách lẻ tại Quầy POS Phường Bình Phú",
      "SDT": "0909888777",
      "Dia_Chi": "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Tiền mặt tại quầy"
    },
    {
      "Ma_Don": "FB261022401",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-10-22 08:22:00",
      "Ma_SKU": "SP-TAI-NGHE-02",
      "Ten_SP": "Tai nghe Bluetooth Không dây TWS ANC Pro",
      "So_Luong": 4,
      "Don_Gia": 490000,
      "Ten_Khach": "Bùi Anh Tuấn (Chốt đơn Livestream FB)",
      "SDT": "0922334455",
      "Dia_Chi": "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Chuyển khoản VietQR"
    },
    {
      "Ma_Don": "FB261022402",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-10-22 08:24:00",
      "Ma_SKU": "SP-MA-LOI-999",
      "Ten_SP": "Áo Khoác Gió Nhập Sai Mã SKU (Đơn lỗi mẫu)",
      "So_Luong": 2,
      "Don_Gia": 350000,
      "Ten_Khach": "Đỗ Mỹ Linh",
      "SDT": "0938111222",
      "Dia_Chi": "15 Hai Bà Trưng, Phường Tân Định, TP.HCM",
      "Trang_Thai": "Đã hủy đơn",
      "Hinh_Thuc_TT": "COD (Thu hộ khi giao)"
    }
  ]
};

// 5. Bảng Excel Gom Chung Toàn Bộ 5 Kênh (Unified Multi-Channel Excel Dataset - 11 đơn)
window.UNIFIED_SAMPLE_DATASET = [
  ...window.SAMPLE_EXCEL_DATASETS.SHOPEE,
  ...window.SAMPLE_EXCEL_DATASETS.TIKTOK,
  ...window.SAMPLE_EXCEL_DATASETS.LAZADA,
  ...window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS
];

// 6. Cấu hình Kho hàng & Nơi gửi hàng ODOMS (Nơi bán khi in vận đơn & điểm xuất phát trên Google Maps)
window.ODOMS_WAREHOUSE_CONFIG = {
  warehouseId: "KHO-BP-01",
  warehouseName: "ODOMS Flagship Store — Kho Phường Bình Phú",
  shortName: "Kho ODOMS Phường Bình Phú",
  address: "186 An Dương Vương, Phường Bình Phú, TP.HCM",
  fullAddress: "186 An Dương Vương, Phường Bình Phú, TP.HCM",
  hotline: "028.7777.6868",
  contactPerson: "Bộ phận Điều phối Vận chuyển ODOMS",
  geoCoordinates: { lat: 10.7483, lng: 106.6285 }
};

// 7. Dữ liệu Vận chuyển Đơn hàng Đa kênh & Hành trình Giao nhận (Logistics & Live Tracking)
window.SAMPLE_SHIPMENTS_DATA = [
  {
    trackingCode: "VD-SP-261028-8801",
    orderId: "SP261022001",
    channel: "SHOPEE",
    carrier: "SPX Express",
    shippingTier: "HOA_TOC",
    shippingTierLabel: "⚡ Hỏa Tốc (2H)",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 1000000,
    status: "IN_TRANSIT",
    statusLabel: "🚚 Đang giao hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "028.7777.6868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Nguyễn Văn An",
      phone: "0901.234.567",
      address: "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM"
    },
    itemsSummary: "Áo Polo Nam Coolmate Pro (Đen - L) × 4",
    batchCode: "LO-2026-A1",
    handoverTime: "28/10/2026 08:30:15",
    lastUpdateTime: "28/10/2026 14:20:00",
    currentLocation: "Đang trên đường phát — Cách người nhận 1.2 km (Gần Ngã tư Lê Lợi - Pasteur, Phường Sài Gòn, TP.HCM)",
    shipperName: "Trần Quốc Bảo (Bưu tá SPX Express)",
    shipperPhone: "0934.567.890",
    progressPercent: 80,
    timeline: [
      { time: "08:15:10", title: "Xuất kho ODOMS & Đóng gói", desc: "Đã xuất kho tại 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "09:00:25", title: "Bưu tá đã nhận hàng", desc: "Bưu tá SPX Express Trần Quốc Bảo đã tiếp nhận kiện hàng tại kho.", location: "186 An Dương Vương, Phường Bình Phú, TP.HCM" },
      { time: "11:15:40", title: "Đến Hub trung chuyển", desc: "Kiện hàng đã qua trung tâm phân loại Trung tâm TP.HCM.", location: "Hub Phân Loại SPX Phường Sài Gòn" },
      { time: "13:45:00", title: "Đang trên đường giao", desc: "Bưu tá đang di chuyển phát hàng đến địa chỉ 123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM.", location: "Tuyến đường Lê Lợi - Nguyễn Huệ, Phường Sài Gòn, TP.HCM" }
    ]
  },
  {
    trackingCode: "VD-TT-261028-4420",
    orderId: "TT261022101",
    channel: "TIKTOK",
    carrier: "J&T Express",
    shippingTier: "NHANH",
    shippingTierLabel: "🚀 Giao Nhanh (24H)",
    shippingFee: 25000,
    isFreeship: false,
    totalCod: 1000000,
    status: "IN_TRANSIT",
    statusLabel: "🚚 Đang giao hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "028.7777.6868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Trần Thị Mai",
      phone: "0912.888.999",
      address: "45 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM"
    },
    itemsSummary: "Áo Polo Nam Coolmate Pro × 4 (Chia 2 lô A1 + A2)",
    batchCode: "LO-2026-A1 + LO-2026-A2",
    handoverTime: "28/10/2026 09:10:00",
    lastUpdateTime: "28/10/2026 13:50:00",
    currentLocation: "Đang giao hàng — Cách người nhận 2.0 km (Khu vực cầu Lê Văn Sỹ)",
    shipperName: "Lê Minh Tuấn (J&T Express)",
    shipperPhone: "0908.776.554",
    progressPercent: 70,
    timeline: [
      { time: "08:45:00", title: "Xuất kho ODOMS & Bàn giao", desc: "Xuất từ Kho 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "09:30:10", title: "J&T Express đã nhận", desc: "Kiện hàng đã nhập bưu cục J&T Phường Bình Phú.", location: "Bưu cục J&T Phường Bình Phú" },
      { time: "11:40:20", title: "Chuyển giao bưu cục phát", desc: "Kiện hàng đã tới bưu cục phát Phường Nhiêu Lộc.", location: "Bưu cục J&T Phường Nhiêu Lộc" },
      { time: "13:30:00", title: "Đang giao hàng", desc: "Bưu tá đang gọi khách hẹn nhận tại 45 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM.", location: "Đường Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM" }
    ]
  },
  {
    trackingCode: "VD-LZ-261028-9102",
    orderId: "LZ261022202",
    channel: "LAZADA",
    carrier: "GHN (Giao Hàng Nhanh)",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 1860000,
    status: "DELIVERED",
    statusLabel: "✅ Giao thành công",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "028.7777.6868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Ngô Thanh Vân",
      phone: "0918.273.645",
      address: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ"
    },
    itemsSummary: "Bình Giữ Nhiệt Inox Lock&Lock 900ml × 6",
    batchCode: "LO-2026-D1",
    handoverTime: "27/10/2026 14:00:00",
    lastUpdateTime: "28/10/2026 11:30:00",
    currentLocation: "Đã giao thành công — Khách ký nhận e-POD lúc 11:28",
    shipperName: "Phạm Văn Hùng (GHN Cần Thơ)",
    shipperPhone: "0977.123.456",
    progressPercent: 100,
    timeline: [
      { time: "27/10 14:00", title: "Xuất kho ODOMS Phường Bình Phú", desc: "Xuất từ 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "27/10 16:30", title: "Rời trung tâm phân loại TP.HCM", desc: "Kiện hàng lên xe tải liên tỉnh đi Tây Nam Bộ.", location: "Hub GHN Tân Bình" },
      { time: "28/10 07:15", title: "Đến bưu cục Phường An Cư", desc: "Đã tới bưu cục phát Cần Thơ.", location: "Bưu cục GHN Phường An Cư, TP.Cần Thơ" },
      { time: "28/10 11:28", title: "Giao thành công & Ký e-POD", desc: "Khách hàng Ngô Thanh Vân đã nhận hàng và thanh toán đủ COD.", location: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ" }
    ]
  },
  {
    trackingCode: "VD-FB-261028-3351",
    orderId: "FB261022401",
    channel: "FACEBOOK",
    carrier: "GHTK (Giao Hàng Tiết Kiệm)",
    shippingTier: "NHANH",
    shippingTierLabel: "🚀 Giao Nhanh",
    shippingFee: 35000,
    isFreeship: false,
    totalCod: 1960000,
    status: "PENDING_PICKUP",
    statusLabel: "⏳ Chờ lấy hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "028.7777.6868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Bùi Anh Tuấn",
      phone: "0922.334.455",
      address: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội"
    },
    itemsSummary: "Tai nghe Bluetooth Không dây TWS ANC Pro × 4",
    batchCode: "LO-2026-B1",
    handoverTime: "28/10/2026 14:00:00",
    lastUpdateTime: "28/10/2026 14:05:00",
    currentLocation: "Đã đóng gói — Chờ bưu tá GHTK tới lấy tại 186 An Dương Vương, Phường Bình Phú, TP.HCM",
    shipperName: "Đang điều phối bưu tá GHTK",
    shipperPhone: "1900.6092",
    progressPercent: 20,
    timeline: [
      { time: "13:50:00", title: "Duyệt đơn & Đóng gói", desc: "Đã in mã vận đơn VD-FB-261028-3351 và đóng thùng carton.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "14:05:00", title: "Bắn tín hiệu lấy hàng", desc: "Đã phát yêu cầu bưu tá GHTK ghé 186 An Dương Vương, Phường Bình Phú, TP.HCM lấy hàng.", location: "Kho ODOMS Phường Bình Phú" }
    ]
  },
  {
    trackingCode: "VD-SP-261028-5519",
    orderId: "SP261022002",
    channel: "SHOPEE",
    carrier: "SPX Express",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 980000,
    status: "FAILED_RETURNING",
    statusLabel: "❌ Giao thất bại / Chờ chuyển hoàn",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "028.7777.6868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Đặng Thị Thảo",
      phone: "0933.445.566",
      address: "78 Quang Trung, Phường Gò Vấp, TP.HCM"
    },
    itemsSummary: "Tai nghe Bluetooth TWS ANC Pro × 2",
    batchCode: "LO-2026-B1",
    handoverTime: "28/10/2026 09:30:00",
    lastUpdateTime: "28/10/2026 15:10:00",
    currentLocation: "Bưu tá gọi 3 cuộc không nghe máy — Lưu kho Phường Gò Vấp chờ giao lại lần 2",
    shipperName: "Vũ Đình Trọng (SPX Express)",
    shipperPhone: "0961.889.900",
    progressPercent: 60,
    timeline: [
      { time: "09:30:00", title: "Xuất kho ODOMS", desc: "Xuất từ 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "11:00:00", title: "Nhập kho bưu cục Phường Gò Vấp", desc: "Kiện hàng đã tới bưu cục phát.", location: "Bưu cục SPX Phường Gò Vấp" },
      { time: "14:30:00", title: "Giao không thành công lần 1", desc: "Thuê bao không liên lạc được lúc 14:15, 14:22, 14:30.", location: "Đường Quang Trung, Phường Gò Vấp, TP.HCM" },
      { time: "15:10:00", title: "Chờ giao lại lần 2", desc: "Kiện hàng lưu tạm tại kho, dự kiến giao lại sáng mai.", location: "Bưu cục SPX Phường Gò Vấp" }
    ]
  }
];
