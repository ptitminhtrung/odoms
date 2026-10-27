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
    role: "Quản lý Điều phối OMS",
    department: "Ban Điều phối Đơn hàng Đa kênh",
    shift: "Ca Hành chính (08:00 - 17:00)",
    status: "ACTIVE",
    createdAt: "2026-10-01 08:00:00"
  },
  {
    id: "USR-002",
    username: "lhmt",
    password: "lhmt123",
    fullName: "Lê Hoàng Minh Trung",
    avatar: "MT",
    role: "Chuyên viên Vận hành OMS",
    department: "Phòng Vận hành & Đối chiếu Lô FEFO",
    shift: "Ca Sáng (07:30 - 16:30)",
    status: "ACTIVE",
    createdAt: "2026-10-05 09:15:00"
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
      "Địa chỉ nhận hàng": "123 Nguyễn Huệ, Quận 1, TP.HCM"
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
      "Địa chỉ nhận hàng": "45 Lê Lợi, Quận Hải Châu, Đà Nẵng"
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
      "Địa chỉ nhận hàng": "88 Cầu Giấy, Hà Nội"
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
      "Shipping Address": "56 Võ Văn Ngân, TP. Thủ Đức, TP.HCM"
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
      "Shipping Address": "12 Trần Phú, Nha Trang, Khánh Hòa"
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
      "Shipping Address": "90 Lạch Tray, Ngô Quyền, Hải Phòng"
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
      "shippingAddress": "78 Nguyễn Văn Linh, Quận 7, TP.HCM"
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
      "shippingAddress": "22 Đại lộ Hòa Bình, Ninh Kiều, Cần Thơ"
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
      "Ten_Khach": "Khách lẻ tại Quầy POS Quận 1",
      "SDT": "0909888777",
      "Dia_Chi": "Mua trực tiếp tại Cửa hàng 123 Nguyễn Huệ"
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
      "Dia_Chi": "34 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội"
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
      "Dia_Chi": "15 Hai Bà Trưng, Quận 3, TP.HCM"
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
