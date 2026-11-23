// ============================================================================
// DỮ LIỆU KHỞI TẠO HỆ THỐNG ODOMS (QUẢN LÝ ĐƠN HÀNG ĐA KÊNH & PHÂN BỔ LÔ HÀNG)
// Lưu trữ tại: S:\HTTT\01_ODOMS_WEB_APP\js\mock_data.js
// ============================================================================

// 1. Danh sách Tài khoản Người dùng Mặc định (Bảo toàn nguyên vẹn 4 tài khoản gốc)
window.DEFAULT_OMS_USERS = [
  {
    id: "USR-001",
    username: "dttd",
    password: "dttd123",
    fullName: "Đỗ Thị Thuỳ Dung",
    avatar: "TD",
    role: "Chuyên viên Vận hành",
    department: "Phòng Vận hành Đa kênh",
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
    department: "Phòng Vận hành Đa kênh",
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
    department: "Phòng Điều phối Đơn hàng",
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
    department: "Bộ phận Kho Vận",
    shift: "Ca Chiều (13:00 - 21:00)",
    status: "ACTIVE",
    isRoot: false,
    isHiddenBackup: false,
    createdAt: "2026-10-12 13:00:00"
  }
];

// 2. Dữ liệu Tồn kho & Lô hàng trên Hệ thống ODOMS — Ngành Thời Trang (25 mã sản phẩm, 5 danh mục, 40 lô hàng)
window.INITIAL_INVENTORY = [
  // ================= DANH MỤC 1: ÁO (5 SẢN PHẨM) =================
  {
    sku: "SP-AO-POLO-01",
    name: "Áo Polo Nam Coolmate Pro (Đen - Size L)",
    category: "Áo",
    unit: "Cái",
    price: 250000,
    maxCapacity: 25,
    physicalStock: 10, // Giữ đúng 10 cái để minh họa kịch bản tranh chấp tồn kho giữa 4 kênh bán
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
    sku: "SP-AO-THUN-02",
    name: "Áo Thun Cotton Oversize Unisex (Trắng - Size M)",
    category: "Áo",
    unit: "Cái",
    price: 190000,
    maxCapacity: 40,
    physicalStock: 25,
    reservedStock: 0,
    availableStock: 25,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-B1",
        qrCode: "OD-THUN-1002",
        importDate: "2026-10-02",
        expiryDate: "2027-10-02",
        initialQty: 15,
        remainingQty: 15
      },
      {
        batchCode: "LO-2026-B2",
        qrCode: "OD-THUN-1012",
        importDate: "2026-10-12",
        expiryDate: "2027-10-12",
        initialQty: 10,
        remainingQty: 10
      }
    ]
  },
  {
    sku: "SP-AO-SOMI-03",
    name: "Áo Sơ Mi Oxford Dài Tay Chống Nhăn (Xanh Nhạt - Size L)",
    category: "Áo",
    unit: "Cái",
    price: 320000,
    maxCapacity: 30,
    physicalStock: 12,
    reservedStock: 0,
    availableStock: 12,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-C1",
        qrCode: "OD-SOMI-1003",
        importDate: "2026-10-03",
        expiryDate: "2027-10-03",
        initialQty: 12,
        remainingQty: 12
      }
    ]
  },
  {
    sku: "SP-AO-KHOAC-04",
    name: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL)",
    category: "Áo",
    unit: "Cái",
    price: 420000,
    maxCapacity: 20,
    physicalStock: 8,
    reservedStock: 0,
    availableStock: 8,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-D1",
        qrCode: "OD-KHOAC-1004",
        importDate: "2026-10-04",
        expiryDate: "2028-04-04",
        initialQty: 5,
        remainingQty: 5
      },
      {
        batchCode: "LO-2026-D2",
        qrCode: "OD-KHOAC-1014",
        importDate: "2026-10-14",
        expiryDate: "2028-04-14",
        initialQty: 3,
        remainingQty: 3
      }
    ]
  },
  {
    sku: "SP-AO-HOODIE-05",
    name: "Áo Hoodie Nỉ Bông Form Rộng (Nâu - Size L)",
    category: "Áo",
    unit: "Cái",
    price: 390000,
    maxCapacity: 30,
    physicalStock: 14,
    reservedStock: 0,
    availableStock: 14,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-E1",
        qrCode: "OD-HOOD-1005",
        importDate: "2026-10-05",
        expiryDate: "2028-04-05",
        initialQty: 14,
        remainingQty: 14
      }
    ]
  },

  // ================= DANH MỤC 2: QUẦN (5 SẢN PHẨM) =================
  {
    sku: "SP-QUAN-JEANS-06",
    name: "Quần Jeans Nam Slim-fit Co Giãn (Xanh Đậm - Size 31)",
    category: "Quần",
    unit: "Chiếc",
    price: 450000,
    maxCapacity: 35,
    physicalStock: 18,
    reservedStock: 0,
    availableStock: 18,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-F1",
        qrCode: "OD-JEAN-1006",
        importDate: "2026-10-02",
        expiryDate: "2028-10-02",
        initialQty: 10,
        remainingQty: 10
      },
      {
        batchCode: "LO-2026-F2",
        qrCode: "OD-JEAN-1015",
        importDate: "2026-10-15",
        expiryDate: "2028-10-15",
        initialQty: 8,
        remainingQty: 8
      }
    ]
  },
  {
    sku: "SP-QUAN-KAKI-07",
    name: "Quần Kaki Chinos Công Sở (Be - Size 30)",
    category: "Quần",
    unit: "Chiếc",
    price: 380000,
    maxCapacity: 30,
    physicalStock: 15,
    reservedStock: 0,
    availableStock: 15,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-G1",
        qrCode: "OD-KAKI-1007",
        importDate: "2026-10-04",
        expiryDate: "2028-04-04",
        initialQty: 15,
        remainingQty: 15
      }
    ]
  },
  {
    sku: "SP-QUAN-SHORT-08",
    name: "Quần Short Thể Thao Vải Gió (Đen - Size L)",
    category: "Quần",
    unit: "Chiếc",
    price: 180000,
    maxCapacity: 50,
    physicalStock: 30,
    reservedStock: 0,
    availableStock: 30,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-H1",
        qrCode: "OD-SHRT-1008",
        importDate: "2026-10-06",
        expiryDate: "2027-10-06",
        initialQty: 20,
        remainingQty: 20
      },
      {
        batchCode: "LO-2026-H2",
        qrCode: "OD-SHRT-1016",
        importDate: "2026-10-16",
        expiryDate: "2027-10-16",
        initialQty: 10,
        remainingQty: 10
      }
    ]
  },
  {
    sku: "SP-QUAN-TAY-09",
    name: "Quần Tây Âu Ống Đứng Cao Cấp (Xám Than - Size 31)",
    category: "Quần",
    unit: "Chiếc",
    price: 490000,
    maxCapacity: 25,
    physicalStock: 9,
    reservedStock: 0,
    availableStock: 9,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-I1",
        qrCode: "OD-QTAY-1009",
        importDate: "2026-10-07",
        expiryDate: "2028-04-07",
        initialQty: 9,
        remainingQty: 9
      }
    ]
  },
  {
    sku: "SP-QUAN-JOGGER-10",
    name: "Quần Jogger Thun Nỉ Thể Thao (Ghi Sáng - Size M)",
    category: "Quần",
    unit: "Chiếc",
    price: 290000,
    maxCapacity: 25,
    physicalStock: 12,
    reservedStock: 0,
    availableStock: 12,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-J1",
        qrCode: "OD-JOGG-1010",
        importDate: "2026-10-08",
        expiryDate: "2027-10-08",
        initialQty: 7,
        remainingQty: 7
      },
      {
        batchCode: "LO-2026-J2",
        qrCode: "OD-JOGG-1017",
        importDate: "2026-10-17",
        expiryDate: "2027-10-17",
        initialQty: 5,
        remainingQty: 5
      }
    ]
  },

  // ================= DANH MỤC 3: VÁY & ĐẦM (5 SẢN PHẨM) =================
  {
    sku: "SP-DAM-MIDI-11",
    name: "Đầm Midi Lụa Xếp Ly Dự Tiệc (Kem - Size S)",
    category: "Váy & Đầm",
    unit: "Chiếc",
    price: 550000,
    maxCapacity: 25,
    physicalStock: 10,
    reservedStock: 0,
    availableStock: 10,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-K1",
        qrCode: "OD-MIDI-1011",
        importDate: "2026-10-03",
        expiryDate: "2027-10-03",
        initialQty: 6,
        remainingQty: 6
      },
      {
        batchCode: "LO-2026-K2",
        qrCode: "OD-MIDI-1013",
        importDate: "2026-10-13",
        expiryDate: "2027-10-13",
        initialQty: 4,
        remainingQty: 4
      }
    ]
  },
  {
    sku: "SP-CHAN-VAY-12",
    name: "Chân Váy Chữ A Công Sở Dáng Ngắn (Đen - Size M)",
    category: "Váy & Đầm",
    unit: "Chiếc",
    price: 260000,
    maxCapacity: 30,
    physicalStock: 16,
    reservedStock: 0,
    availableStock: 16,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-L1",
        qrCode: "OD-CVAY-1012",
        importDate: "2026-10-05",
        expiryDate: "2027-10-05",
        initialQty: 16,
        remainingQty: 16
      }
    ]
  },
  {
    sku: "SP-DAM-MAXI-13",
    name: "Đầm Maxi Hoa Nhí Voan Mềm (Hồng Pastel - Size M)",
    category: "Váy & Đầm",
    unit: "Chiếc",
    price: 480000,
    maxCapacity: 30,
    physicalStock: 14,
    reservedStock: 0,
    availableStock: 14,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-M1",
        qrCode: "OD-MAXI-1013",
        importDate: "2026-10-06",
        expiryDate: "2027-10-06",
        initialQty: 8,
        remainingQty: 8
      },
      {
        batchCode: "LO-2026-M2",
        qrCode: "OD-MAXI-1018",
        importDate: "2026-10-18",
        expiryDate: "2027-10-18",
        initialQty: 6,
        remainingQty: 6
      }
    ]
  },
  {
    sku: "SP-SET-BLAZER-14",
    name: "Set Vest Blazer Nữ & Chân Váy (Trắng Kem - Size S)",
    category: "Váy & Đầm",
    unit: "Bộ",
    price: 720000,
    maxCapacity: 20,
    physicalStock: 7,
    reservedStock: 0,
    availableStock: 7,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-N1",
        qrCode: "OD-BLAZ-1014",
        importDate: "2026-10-09",
        expiryDate: "2028-04-09",
        initialQty: 7,
        remainingQty: 7
      }
    ]
  },
  {
    sku: "SP-DAM-THUN-15",
    name: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M)",
    category: "Váy & Đầm",
    unit: "Chiếc",
    price: 240000,
    maxCapacity: 35,
    physicalStock: 20,
    reservedStock: 0,
    availableStock: 20,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-O1",
        qrCode: "OD-DTHN-1015",
        importDate: "2026-10-04",
        expiryDate: "2027-10-04",
        initialQty: 12,
        remainingQty: 12
      },
      {
        batchCode: "LO-2026-O2",
        qrCode: "OD-DTHN-1014",
        importDate: "2026-10-14",
        expiryDate: "2027-10-14",
        initialQty: 8,
        remainingQty: 8
      }
    ]
  },

  // ================= DANH MỤC 4: GIÀY & DÉP (5 SẢN PHẨM) =================
  {
    sku: "SP-GIAY-SNEAKER-16",
    name: "Giày Sneaker Da Trắng Cổ Thấp (Trắng - Size 41)",
    category: "Giày & Dép",
    unit: "Đôi",
    price: 620000,
    maxCapacity: 30,
    physicalStock: 15,
    reservedStock: 0,
    availableStock: 15,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-P1",
        qrCode: "OD-SNEK-1016",
        importDate: "2026-10-02",
        expiryDate: "2028-10-02",
        initialQty: 10,
        remainingQty: 10
      },
      {
        batchCode: "LO-2026-P2",
        qrCode: "OD-SNEK-1012",
        importDate: "2026-10-12",
        expiryDate: "2028-10-12",
        initialQty: 5,
        remainingQty: 5
      }
    ]
  },
  {
    sku: "SP-GIAY-CHAYBO-17",
    name: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42)",
    category: "Giày & Dép",
    unit: "Đôi",
    price: 750000,
    maxCapacity: 25,
    physicalStock: 11,
    reservedStock: 0,
    availableStock: 11,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-Q1",
        qrCode: "OD-RUNG-1017",
        importDate: "2026-10-06",
        expiryDate: "2028-10-06",
        initialQty: 11,
        remainingQty: 11
      }
    ]
  },
  {
    sku: "SP-GIAY-LOAFER-18",
    name: "Giày Lười Da Bò Nam Công Sở (Nâu Bò - Size 40)",
    category: "Giày & Dép",
    unit: "Đôi",
    price: 890000,
    maxCapacity: 20,
    physicalStock: 9,
    reservedStock: 0,
    availableStock: 9,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-R1",
        qrCode: "OD-LOAF-1018",
        importDate: "2026-10-05",
        expiryDate: "2029-10-05",
        initialQty: 6,
        remainingQty: 6
      },
      {
        batchCode: "LO-2026-R2",
        qrCode: "OD-LOAF-1015",
        importDate: "2026-10-15",
        expiryDate: "2029-10-15",
        initialQty: 3,
        remainingQty: 3
      }
    ]
  },
  {
    sku: "SP-SANDAL-NU-19",
    name: "Giày Sandal Cao Gót Quai Mảnh 5cm (Be - Size 37)",
    category: "Giày & Dép",
    unit: "Đôi",
    price: 390000,
    maxCapacity: 30,
    physicalStock: 14,
    reservedStock: 0,
    availableStock: 14,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-S1",
        qrCode: "OD-SAND-1019",
        importDate: "2026-10-08",
        expiryDate: "2028-04-08",
        initialQty: 14,
        remainingQty: 14
      }
    ]
  },
  {
    sku: "SP-DEP-DUC-20",
    name: "Dép Quai Ngang Đúc Nguyên Khối EVA (Đen - Size 41)",
    category: "Giày & Dép",
    unit: "Đôi",
    price: 150000,
    maxCapacity: 50,
    physicalStock: 30,
    reservedStock: 0,
    availableStock: 30,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-T1",
        qrCode: "OD-DEPE-1020",
        importDate: "2026-10-01",
        expiryDate: "2028-10-01",
        initialQty: 18,
        remainingQty: 18
      },
      {
        batchCode: "LO-2026-T2",
        qrCode: "OD-DEPE-1011",
        importDate: "2026-10-11",
        expiryDate: "2028-10-11",
        initialQty: 12,
        remainingQty: 12
      }
    ]
  },

  // ================= DANH MỤC 5: PHỤ KIỆN THỜI TRANG (5 SẢN PHẨM) =================
  {
    sku: "SP-TUI-DEO-21",
    name: "Túi Đeo Chéo Da PU Chống Nước (Đen)",
    category: "Phụ kiện thời trang",
    unit: "Chiếc",
    price: 340000,
    maxCapacity: 30,
    physicalStock: 15,
    reservedStock: 0,
    availableStock: 15,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-U1",
        qrCode: "OD-TUID-1021",
        importDate: "2026-10-03",
        expiryDate: "2028-10-03",
        initialQty: 9,
        remainingQty: 9
      },
      {
        batchCode: "LO-2026-U2",
        qrCode: "OD-TUID-1013",
        importDate: "2026-10-13",
        expiryDate: "2028-10-13",
        initialQty: 6,
        remainingQty: 6
      }
    ]
  },
  {
    sku: "SP-THAT-LUNG-22",
    name: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen)",
    category: "Phụ kiện thời trang",
    unit: "Chiếc",
    price: 320000,
    maxCapacity: 35,
    physicalStock: 18,
    reservedStock: 0,
    availableStock: 18,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-V1",
        qrCode: "OD-BELT-1022",
        importDate: "2026-10-07",
        expiryDate: "2029-10-07",
        initialQty: 18,
        remainingQty: 18
      }
    ]
  },
  {
    sku: "SP-NON-KET-23",
    name: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu)",
    category: "Phụ kiện thời trang",
    unit: "Chiếc",
    price: 160000,
    maxCapacity: 40,
    physicalStock: 25,
    reservedStock: 0,
    availableStock: 25,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-W1",
        qrCode: "OD-NONK-1023",
        importDate: "2026-10-04",
        expiryDate: "2028-04-04",
        initialQty: 15,
        remainingQty: 15
      },
      {
        batchCode: "LO-2026-W2",
        qrCode: "OD-NONK-1016",
        importDate: "2026-10-16",
        expiryDate: "2028-04-16",
        initialQty: 10,
        remainingQty: 10
      }
    ]
  },
  {
    sku: "SP-KINH-MAT-24",
    name: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng)",
    category: "Phụ kiện thời trang",
    unit: "Chiếc",
    price: 280000,
    maxCapacity: 25,
    physicalStock: 12,
    reservedStock: 0,
    availableStock: 12,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-X1",
        qrCode: "OD-KINH-1024",
        importDate: "2026-10-09",
        expiryDate: "2028-10-09",
        initialQty: 12,
        remainingQty: 12
      }
    ]
  },
  {
    sku: "SP-TAT-CO-25",
    name: "Set 5 Đôi Tất Cổ Ngắn Khử Mùi Bamboo (Mix Màu)",
    category: "Phụ kiện thời trang",
    unit: "Hộp",
    price: 120000,
    maxCapacity: 60,
    physicalStock: 40,
    reservedStock: 0,
    availableStock: 40,
    channelReserved: { SHOPEE: 0, TIKTOK: 0, LAZADA: 0, FACEBOOK: 0, POS: 0 },
    batches: [
      {
        batchCode: "LO-2026-Y1",
        qrCode: "OD-TATC-1025",
        importDate: "2026-10-02",
        expiryDate: "2027-10-02",
        initialQty: 25,
        remainingQty: 25
      },
      {
        batchCode: "LO-2026-Y2",
        qrCode: "OD-TATC-1014",
        importDate: "2026-10-14",
        expiryDate: "2027-10-14",
        initialQty: 15,
        remainingQty: 15
      }
    ]
  }
];

// Bổ sung 24 lô nhập dự trữ cao điểm (15/11/2026 – 22/11/2026, +20 SP/lô) cho 24 mã từ SP-AO-THUN-02 đến SP-TAT-CO-25
// TUYỆT ĐỐI bảo toàn nguyên vẹn SP-AO-POLO-01 (index 0: đúng 10 cái, 2 lô LO-2026-A1 & LO-2026-A2)
(function enrichInitialInventoryBatches2026() {
  const list = window.INITIAL_INVENTORY || [];
  for (let idx = 1; idx < list.length; idx++) {
    const item = list[idx];
    const numStr = String(idx + 1).padStart(2, "0");
    const importDay = 15 + ((idx - 1) % 8); // 15/11/2026 -> 22/11/2026
    const dayStr = String(importDay).padStart(2, "0");
    const extraQty = 20;
    item.physicalStock += extraQty;
    item.availableStock += extraQty;
    item.maxCapacity = Math.max(Number(item.maxCapacity || 30), item.physicalStock + 10);
    item.batches.push({
      batchCode: "LO-2026-B" + numStr,
      qrCode: "OD-RESV-11" + numStr,
      importDate: "2026-11-" + dayStr,
      expiryDate: "2028-11-" + dayStr,
      initialQty: extraQty,
      remainingQty: extraQty
    });
  }
})();

// 3. Thông tin cấu hình 5 kênh bán hàng (Front-end Sales Channels)
window.CHANNELS_CONFIG = {
  SHOPEE: {
    code: "SHOPEE",
    name: "Shopee Mall",
    shortName: "Shopee",
    color: "#ee4d2d",
    apiEndpoint: "https://partner.shopeemobile.com/api/v2/product/update_stock",
    isConnected: true,
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  TIKTOK: {
    code: "TIKTOK",
    name: "TikTok Shop",
    shortName: "TikTok Shop",
    color: "#0f172a",
    apiEndpoint: "https://open-api.tiktokglobalshop.com/product/202309/inventory/update",
    isConnected: true,
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  LAZADA: {
    code: "LAZADA",
    name: "Lazada Mall",
    shortName: "Lazada",
    color: "#1d4ed8",
    apiEndpoint: "https://api.lazada.vn/rest/product/price_quantity/update",
    isConnected: true,
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  FACEBOOK: {
    code: "FACEBOOK",
    name: "Facebook Shop / Live",
    shortName: "Facebook",
    color: "#0284c7",
    apiEndpoint: "https://graph.facebook.com/v19.0/commerce_inventory/sync",
    isConnected: true,
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  },
  POS: {
    code: "POS",
    name: "Cửa hàng vật lý (POS)",
    shortName: "Cửa hàng POS",
    color: "#15803d",
    apiEndpoint: "wss://pos-internal.oms.local/realtime-stock",
    isConnected: true,
    lastSync: "Chưa đồng bộ",
    syncCount: 0
  }
};

// 4. Dữ liệu bảng Excel đơn hàng Thời trang của từng kênh (30 đơn từ 01/2026 đến 22/11/2026, khớp 1:1 với 5 tệp .csv và Google Sheets)
window.SAMPLE_EXCEL_DATASETS = {
  // 4.1. Đơn hàng xuất từ Shopee (8 đơn — vị trí [0] là đơn tranh chấp #1 mã SP-AO-POLO-01)
  SHOPEE: [
    {
      "Mã đơn hàng": "SP261122001",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-11-22 08:15:10",
      "SKU phân loại": "SP-AO-POLO-01",
      "Tên sản phẩm": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "Số lượng": 4,
      "Đơn giá": 250000,
      "Người Mua": "Nguyễn Văn An",
      "Số điện thoại": "0901234567",
      "Địa chỉ nhận hàng": "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP260115002",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-01-15 09:20:00",
      "SKU phân loại": "SP-AO-THUN-02",
      "Tên sản phẩm": "Áo Thun Cotton Oversize Unisex (Trắng - Size M)",
      "Số lượng": 5,
      "Đơn giá": 190000,
      "Người Mua": "Trần Thị Bích",
      "Số điện thoại": "0912345678",
      "Địa chỉ nhận hàng": "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "COD (Thanh toán khi nhận hàng)",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP260318003",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-03-18 14:10:00",
      "SKU phân loại": "SP-QUAN-JEANS-06",
      "Tên sản phẩm": "Quần Jeans Nam Slim-fit Co Giãn (Xanh Đậm - Size 31)",
      "Số lượng": 4,
      "Đơn giá": 450000,
      "Người Mua": "Lê Hoàng Nam",
      "Số điện thoại": "0987654321",
      "Địa chỉ nhận hàng": "88 Cầu Giấy, Phường Cầu Giấy, TP.Hà Nội",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP260520004",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-05-20 10:35:00",
      "SKU phân loại": "SP-DAM-MIDI-11",
      "Tên sản phẩm": "Đầm Midi Lụa Xếp Ly Dự Tiệc (Kem - Size S)",
      "Số lượng": 3,
      "Đơn giá": 550000,
      "Người Mua": "Phạm Ngọc Hân",
      "Số điện thoại": "0905112233",
      "Địa chỉ nhận hàng": "210 Phan Xích Long, Phường Cầu Kiệu, TP.HCM",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP260812005",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-08-12 16:40:00",
      "SKU phân loại": "SP-GIAY-SNEAKER-16",
      "Tên sản phẩm": "Giày Sneaker Da Trắng Cổ Thấp (Trắng - Size 41)",
      "Số lượng": 4,
      "Đơn giá": 620000,
      "Người Mua": "Vũ Minh Đức",
      "Số điện thoại": "0913456789",
      "Địa chỉ nhận hàng": "19 Hùng Vương, Phường Thuận Hóa, TP.Huế",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "COD (Thanh toán khi nhận hàng)",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP261106006",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-11-06 11:15:00",
      "SKU phân loại": "SP-SET-BLAZER-14",
      "Tên sản phẩm": "Set Vest Blazer Nữ & Chân Váy (Trắng Kem - Size S)",
      "Số lượng": 5,
      "Đơn giá": 720000,
      "Người Mua": "Nguyễn Thùy Dương",
      "Số điện thoại": "0908223344",
      "Địa chỉ nhận hàng": "72 Hai Bà Trưng, Phường Hoàn Kiếm, TP.Hà Nội",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP261117007",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-11-17 15:05:00",
      "SKU phân loại": "SP-AO-KHOAC-04",
      "Tên sản phẩm": "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL)",
      "Số lượng": 5,
      "Đơn giá": 420000,
      "Người Mua": "Đặng Thị Thảo",
      "Số điện thoại": "0933445588",
      "Địa chỉ nhận hàng": "78 Quang Trung, Phường Gò Vấp, TP.HCM",
      "Trạng thái đơn hàng": "Đã xác nhận",
      "Phương thức thanh toán": "COD (Thanh toán khi nhận hàng)",
      "Đơn vị vận chuyển": "SPX Express"
    },
    {
      "Mã đơn hàng": "SP261122008",
      "Sàn TMĐT": "SHOPEE",
      "Thời gian đặt hàng": "2026-11-22 09:25:30",
      "SKU phân loại": "SP-TUI-DEO-21",
      "Tên sản phẩm": "Túi Đeo Chéo Da PU Chống Nước (Đen)",
      "Số lượng": 3,
      "Đơn giá": 340000,
      "Người Mua": "Trương Gia Huy",
      "Số điện thoại": "0978123456",
      "Địa chỉ nhận hàng": "154 Nguyễn Trãi, Phường Bến Thành, TP.HCM",
      "Trạng thái đơn hàng": "Chưa xác nhận",
      "Phương thức thanh toán": "Ví ShopeePay",
      "Đơn vị vận chuyển": "SPX Express"
    }
  ],

  // 4.2. Đơn hàng xuất từ TikTok Shop (7 đơn — vị trí [0] là đơn tranh chấp #2 mã SP-AO-POLO-01)
  TIKTOK: [
    {
      "Order ID": "TT261122101",
      "Channel": "TIKTOK",
      "Created Time": "2026-11-22 08:16:05",
      "Seller SKU": "SP-AO-POLO-01",
      "Product Name": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "Quantity": 4,
      "Unit Price": 250000,
      "Recipient": "Phạm Minh Tuấn",
      "Phone": "0933445566",
      "Shipping Address": "56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM",
      "Order Status": "Đã xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)",
      "Shipping Provider": "J&T Express"
    },
    {
      "Order ID": "TT260214102",
      "Channel": "TIKTOK",
      "Created Time": "2026-02-14 10:15:00",
      "Seller SKU": "SP-CHAN-VAY-12",
      "Product Name": "Chân Váy Chữ A Công Sở Dáng Ngắn (Đen - Size M)",
      "Quantity": 5,
      "Unit Price": 260000,
      "Recipient": "Hoàng Thùy Linh",
      "Phone": "0977889900",
      "Shipping Address": "12 Trần Phú, Phường Nha Trang, tỉnh Khánh Hòa",
      "Order Status": "Đã xác nhận",
      "Payment Method": "Ví ZaloPay",
      "Shipping Provider": "J&T Express"
    },
    {
      "Order ID": "TT260422103",
      "Channel": "TIKTOK",
      "Created Time": "2026-04-22 13:50:00",
      "Seller SKU": "SP-AO-HOODIE-05",
      "Product Name": "Áo Hoodie Nỉ Bông Form Rộng (Nâu - Size L)",
      "Quantity": 4,
      "Unit Price": 390000,
      "Recipient": "Đặng Quốc Khánh",
      "Phone": "0966112233",
      "Shipping Address": "90 Lạch Tray, Phường Lê Chân, TP.Hải Phòng",
      "Order Status": "Đã xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)",
      "Shipping Provider": "J&T Express"
    },
    {
      "Order ID": "TT260719104",
      "Channel": "TIKTOK",
      "Created Time": "2026-07-19 19:20:00",
      "Seller SKU": "SP-DAM-MAXI-13",
      "Product Name": "Đầm Maxi Hoa Nhí Voan Mềm (Hồng Pastel - Size M)",
      "Quantity": 5,
      "Unit Price": 480000,
      "Recipient": "Lý Thảo Nhi",
      "Phone": "0935667788",
      "Shipping Address": "31 Nguyễn Văn Cừ, Phường Ninh Kiều, TP.Cần Thơ",
      "Order Status": "Đã xác nhận",
      "Payment Method": "Ví ZaloPay",
      "Shipping Provider": "J&T Express"
    },
    {
      "Order ID": "TT261010105",
      "Channel": "TIKTOK",
      "Created Time": "2026-10-10 20:15:00",
      "Seller SKU": "SP-DEP-DUC-20",
      "Product Name": "Dép Quai Ngang Đúc Nguyên Khối EVA (Đen - Size 41)",
      "Quantity": 8,
      "Unit Price": 150000,
      "Recipient": "Phan Anh Khoa",
      "Phone": "0942778899",
      "Shipping Address": "64 Lê Duẩn, Phường Buôn Ma Thuột, tỉnh Đắk Lắk",
      "Order Status": "Đã xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)",
      "Shipping Provider": "J&T Express"
    },
    {
      "Order ID": "TT261114106",
      "Channel": "TIKTOK",
      "Created Time": "2026-11-14 14:30:00",
      "Seller SKU": "SP-GIAY-CHAYBO-17",
      "Product Name": "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42)",
      "Quantity": 4,
      "Unit Price": 750000,
      "Recipient": "Bùi Tiến Dũng",
      "Phone": "0983556677",
      "Shipping Address": "102 Trần Hưng Đạo, Phường An Đông, TP.HCM",
      "Order Status": "Đã xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)",
      "Shipping Provider": "J&T Express"
    },
    {
      "Order ID": "TT261120107",
      "Channel": "TIKTOK",
      "Created Time": "2026-11-20 16:45:00",
      "Seller SKU": "SP-QUAN-JOGGER-10",
      "Product Name": "Quần Jogger Thun Nỉ Thể Thao (Ghi Sáng - Size M)",
      "Quantity": 3,
      "Unit Price": 290000,
      "Recipient": "Mai Phương Anh",
      "Phone": "0916998877",
      "Shipping Address": "28 Phan Đình Phùng, Phường Ba Đình, TP.Hà Nội",
      "Order Status": "Chờ xác nhận",
      "Payment Method": "COD (Thanh toán khi nhận hàng)",
      "Shipping Provider": "J&T Express"
    }
  ],

  // 4.3. Đơn hàng xuất từ Lazada (6 đơn — vị trí [0] là đơn tranh chấp #4 bị chặn bán lố mã SP-AO-POLO-01)
  LAZADA: [
    {
      "orderNumber": "LZ261122201",
      "channel": "LAZADA",
      "createTime": "2026-11-22 08:18:45",
      "sellerSku": "SP-AO-POLO-01",
      "itemName": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "qty": 3,
      "unitPrice": 250000,
      "customerName": "Võ Thành Đạt",
      "customerPhone": "0944556677",
      "shippingAddress": "78 Nguyễn Văn Linh, Phường Tân Thuận, TP.HCM",
      "order_status": "Đã xác nhận",
      "paymentMethod": "Thẻ Visa / Mastercard",
      "shippingProvider": "GHN (Giao Hàng Nhanh)"
    },
    {
      "orderNumber": "LZ260308202",
      "channel": "LAZADA",
      "createTime": "2026-03-08 11:05:00",
      "sellerSku": "SP-AO-SOMI-03",
      "itemName": "Áo Sơ Mi Oxford Dài Tay Chống Nhăn (Xanh Nhạt - Size L)",
      "qty": 4,
      "unitPrice": 320000,
      "customerName": "Nguyễn Quốc Bảo",
      "customerPhone": "0907334455",
      "shippingAddress": "145 Điện Biên Phủ, Phường Gia Định, TP.HCM",
      "order_status": "Đã xác nhận",
      "paymentMethod": "Thẻ Visa / Mastercard",
      "shippingProvider": "GHN (Giao Hàng Nhanh)"
    },
    {
      "orderNumber": "LZ260615203",
      "channel": "LAZADA",
      "createTime": "2026-06-15 09:40:00",
      "sellerSku": "SP-QUAN-KAKI-07",
      "itemName": "Quần Kaki Chinos Công Sở (Be - Size 30)",
      "qty": 5,
      "unitPrice": 380000,
      "customerName": "Ngô Thanh Vân",
      "customerPhone": "0918273645",
      "shippingAddress": "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ",
      "order_status": "Đã xác nhận",
      "paymentMethod": "COD (Thanh toán khi nhận hàng)",
      "shippingProvider": "GHN (Giao Hàng Nhanh)"
    },
    {
      "orderNumber": "LZ260909204",
      "channel": "LAZADA",
      "createTime": "2026-09-09 15:25:00",
      "sellerSku": "SP-SANDAL-NU-19",
      "itemName": "Giày Sandal Cao Gót Quai Mảnh 5cm (Be - Size 37)",
      "qty": 5,
      "unitPrice": 390000,
      "customerName": "Đinh Hồng Nhung",
      "customerPhone": "0939112244",
      "shippingAddress": "51 Nguyễn Văn Thoại, Phường Ngũ Hành Sơn, TP.Đà Nẵng",
      "order_status": "Đã xác nhận",
      "paymentMethod": "Thẻ Visa / Mastercard",
      "shippingProvider": "GHN (Giao Hàng Nhanh)"
    },
    {
      "orderNumber": "LZ261110205",
      "channel": "LAZADA",
      "createTime": "2026-11-10 10:12:00",
      "sellerSku": "SP-GIAY-LOAFER-18",
      "itemName": "Giày Lười Da Bò Nam Công Sở (Nâu Bò - Size 40)",
      "qty": 5,
      "unitPrice": 890000,
      "customerName": "Tô Hoàng Long",
      "customerPhone": "0903667799",
      "shippingAddress": "18 Lý Tự Trọng, Phường Sài Gòn, TP.HCM",
      "order_status": "Đã xác nhận",
      "paymentMethod": "Thẻ Visa / Mastercard",
      "shippingProvider": "GHN (Giao Hàng Nhanh)"
    },
    {
      "orderNumber": "LZ261120206",
      "channel": "LAZADA",
      "createTime": "2026-11-20 13:20:00",
      "sellerSku": "SP-THAT-LUNG-22",
      "itemName": "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen)",
      "qty": 5,
      "unitPrice": 320000,
      "customerName": "Hồ Nhật Minh",
      "customerPhone": "0914889922",
      "shippingAddress": "67 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM",
      "order_status": "Đã xác nhận",
      "paymentMethod": "COD (Thanh toán khi nhận hàng)",
      "shippingProvider": "GHN (Giao Hàng Nhanh)"
    }
  ],

  // 4.4. Đơn hàng từ Facebook Fanpage & Cửa hàng vật lý POS (9 đơn — vị trí [0] là đơn tranh chấp #3 mã SP-AO-POLO-01)
  FACEBOOK_POS: [
    {
      "Ma_Don": "POS261122301",
      "Kenh_Ban": "POS",
      "Thoi_Gian_Dat": "2026-11-22 08:17:20",
      "Ma_SKU": "SP-AO-POLO-01",
      "Ten_SP": "Áo Polo Nam Coolmate Pro (Đen - Size L)",
      "So_Luong": 2,
      "Don_Gia": 250000,
      "Ten_Khach": "Khách lẻ tại Quầy POS Phường Bình Phú",
      "SDT": "0909888777",
      "Dia_Chi": "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Tiền mặt tại quầy",
      "Don_Vi_Van_Chuyen": "Tại quầy"
    },
    {
      "Ma_Don": "POS260405302",
      "Kenh_Ban": "POS",
      "Thoi_Gian_Dat": "2026-04-05 15:10:00",
      "Ma_SKU": "SP-QUAN-SHORT-08",
      "Ten_SP": "Quần Short Thể Thao Vải Gió (Đen - Size L)",
      "So_Luong": 6,
      "Don_Gia": 180000,
      "Ten_Khach": "Lương Văn Hải (Mua tại quầy)",
      "SDT": "0902445566",
      "Dia_Chi": "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Tiền mặt tại quầy",
      "Don_Vi_Van_Chuyen": "Tại quầy"
    },
    {
      "Ma_Don": "POS260828303",
      "Kenh_Ban": "POS",
      "Thoi_Gian_Dat": "2026-08-28 17:30:00",
      "Ma_SKU": "SP-QUAN-TAY-09",
      "Ten_SP": "Quần Tây Âu Ống Đứng Cao Cấp (Xám Than - Size 31)",
      "So_Luong": 5,
      "Don_Gia": 490000,
      "Ten_Khach": "Trịnh Công Sơn (Mua tại quầy)",
      "SDT": "0915223311",
      "Dia_Chi": "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Chuyển khoản VietQR",
      "Don_Vi_Van_Chuyen": "Tại quầy"
    },
    {
      "Ma_Don": "POS261117304",
      "Kenh_Ban": "POS",
      "Thoi_Gian_Dat": "2026-11-17 10:45:00",
      "Ma_SKU": "SP-TAT-CO-25",
      "Ten_SP": "Set 5 Đôi Tất Cổ Ngắn Khử Mùi Bamboo (Mix Màu)",
      "So_Luong": 8,
      "Don_Gia": 120000,
      "Ten_Khach": "Châu Ngọc Lan (Mua tại quầy)",
      "SDT": "0938776655",
      "Dia_Chi": "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Tiền mặt tại quầy",
      "Don_Vi_Van_Chuyen": "Tại quầy"
    },
    {
      "Ma_Don": "FB260225401",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-02-25 20:00:00",
      "Ma_SKU": "SP-DAM-THUN-15",
      "Ten_SP": "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M)",
      "So_Luong": 5,
      "Don_Gia": 240000,
      "Ten_Khach": "Nguyễn Thị Thanh Trúc (Chốt đơn Livestream FB)",
      "SDT": "0922334455",
      "Dia_Chi": "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Chuyển khoản VietQR",
      "Don_Vi_Van_Chuyen": ""
    },
    {
      "Ma_Don": "FB260626402",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-06-26 21:15:00",
      "Ma_SKU": "SP-NON-KET-23",
      "Ten_SP": "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu)",
      "So_Luong": 6,
      "Don_Gia": 160000,
      "Ten_Khach": "Phạm Quang Vinh (Chốt đơn Livestream FB)",
      "SDT": "0979443322",
      "Dia_Chi": "85 Cộng Hòa, Phường Bảy Hiền, TP.HCM",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "COD (Thu hộ khi giao)",
      "Don_Vi_Van_Chuyen": ""
    },
    {
      "Ma_Don": "FB261102403",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-11-02 19:40:00",
      "Ma_SKU": "SP-KINH-MAT-24",
      "Ten_SP": "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng)",
      "So_Luong": 4,
      "Don_Gia": 280000,
      "Ten_Khach": "Bùi Anh Tuấn (Chốt đơn Livestream FB)",
      "SDT": "0928112233",
      "Dia_Chi": "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "Chuyển khoản VietQR",
      "Don_Vi_Van_Chuyen": ""
    },
    {
      "Ma_Don": "FB261118404",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-11-18 20:30:00",
      "Ma_SKU": "SP-AO-THUN-02",
      "Ten_SP": "Áo Thun Cotton Oversize Unisex (Trắng - Size M)",
      "So_Luong": 4,
      "Don_Gia": 190000,
      "Ten_Khach": "Lê Ngọc Bích (Inbox Fanpage)",
      "SDT": "0965334411",
      "Dia_Chi": "112 Cách Mạng Tháng 8, Phường Xuân Hòa, TP.HCM",
      "Trang_Thai": "Đã xác nhận",
      "Hinh_Thuc_TT": "COD (Thu hộ khi giao)",
      "Don_Vi_Van_Chuyen": ""
    },
    {
      "Ma_Don": "FB261122405",
      "Kenh_Ban": "FACEBOOK",
      "Thoi_Gian_Dat": "2026-11-22 08:24:00",
      "Ma_SKU": "SP-MA-LOI-999",
      "Ten_SP": "Áo Khoác Gió — Sai mã sản phẩm",
      "So_Luong": 2,
      "Don_Gia": 350000,
      "Ten_Khach": "Đỗ Mỹ Linh",
      "SDT": "0938111222",
      "Dia_Chi": "15 Hai Bà Trưng, Phường Tân Định, TP.HCM",
      "Trang_Thai": "Đã hủy đơn",
      "Hinh_Thuc_TT": "COD (Thu hộ khi giao)",
      "Don_Vi_Van_Chuyen": ""
    }
  ]
};

// 5. Bảng Excel Gom Chung Toàn Bộ 5 Kênh (30 đơn Thời trang từ 01/2026 đến 22/11/2026)
window.UNIFIED_SAMPLE_DATASET = [
  ...window.SAMPLE_EXCEL_DATASETS.SHOPEE,
  ...window.SAMPLE_EXCEL_DATASETS.TIKTOK,
  ...window.SAMPLE_EXCEL_DATASETS.LAZADA,
  ...window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS
];

// 6. Cấu hình Kho hàng & Nơi gửi hàng ODOMS (Nơi bán khi in vận đơn & điểm xuất phát trên bản đồ)
window.ODOMS_WAREHOUSE_CONFIG = {
  warehouseId: "KHO-BP-01",
  warehouseName: "ODOMS Flagship Store — Kho Phường Bình Phú",
  shortName: "Kho ODOMS Phường Bình Phú",
  address: "186 An Dương Vương, Phường Bình Phú, TP.HCM",
  fullAddress: "186 An Dương Vương, Phường Bình Phú, TP.HCM",
  hotline: "02877776868",
  contactPerson: "Bộ phận Điều phối Vận chuyển ODOMS",
  geoCoordinates: { lat: 10.7483, lng: 106.6285 }
};

// 7. Dữ liệu 10 Vận đơn Thời trang Đa kênh & Hành trình Giao nhận (01/2026 – 22/11/2026, khớp 1:1 với Google Sheets VanDon)
window.SAMPLE_SHIPMENTS_DATA = [
  {
    trackingCode: "VD-SP-261122-8801",
    orderId: "SP261122001",
    channel: "SHOPEE",
    carrier: "SPX Express",
    shippingTier: "HOA_TOC",
    shippingTierLabel: "⚡ Hỏa Tốc (2H)",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 0,
    status: "IN_TRANSIT",
    statusLabel: "🚚 Đang giao hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Nguyễn Văn An",
      phone: "0901234567",
      address: "123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM"
    },
    itemsSummary: "Áo Polo Nam Coolmate Pro (Đen - Size L) × 4",
    batchCode: "LO-2026-A1",
    handoverTime: "22/11/2026 08:30:15",
    lastUpdateTime: "22/11/2026 14:20:00",
    currentLocation: "Đang trên đường phát — Cách người nhận 1.2 km (Gần Ngã tư Lê Lợi - Pasteur, Phường Sài Gòn, TP.HCM)",
    shipperName: "Trần Quốc Bảo (Bưu tá SPX Express)",
    shipperPhone: "0934567890",
    progressPercent: 80,
    timeline: [
      { time: "08:15:10", title: "Xuất kho ODOMS & Đóng gói", desc: "Đã xuất kho tại 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "09:00:25", title: "Bưu tá đã nhận hàng", desc: "Bưu tá SPX Express Trần Quốc Bảo đã tiếp nhận kiện hàng tại kho.", location: "186 An Dương Vương, Phường Bình Phú, TP.HCM" },
      { time: "11:15:40", title: "Đến điểm trung chuyển", desc: "Kiện hàng đã qua trung tâm phân loại Trung tâm TP.HCM.", location: "Điểm phân loại SPX Phường Sài Gòn" },
      { time: "13:45:00", title: "Đang trên đường giao", desc: "Bưu tá đang di chuyển phát hàng đến địa chỉ 123 Nguyễn Huệ, Phường Sài Gòn, TP.HCM.", location: "Tuyến đường Lê Lợi - Nguyễn Huệ, Phường Sài Gòn, TP.HCM" }
    ]
  },
  {
    trackingCode: "VD-TT-261122-4420",
    orderId: "TT261122101",
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
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Phạm Minh Tuấn",
      phone: "0933445566",
      address: "56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM"
    },
    itemsSummary: "Áo Polo Nam Coolmate Pro (Đen - Size L) × 4 (Chia 2 lô A1 + A2)",
    batchCode: "LO-2026-A1 + LO-2026-A2",
    handoverTime: "22/11/2026 09:10:00",
    lastUpdateTime: "22/11/2026 13:50:00",
    currentLocation: "Đang giao hàng — Cách người nhận 2.0 km (Khu vực Phường Thủ Đức)",
    shipperName: "Lê Minh Tuấn (J&T Express)",
    shipperPhone: "0908776554",
    progressPercent: 70,
    timeline: [
      { time: "08:45:00", title: "Xuất kho ODOMS & Bàn giao", desc: "Xuất từ Kho 186 An Dương Vương, Phường Bình Phú, TP.HCM.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "09:30:10", title: "J&T Express đã nhận", desc: "Kiện hàng đã nhập bưu cục J&T Phường Bình Phú.", location: "Bưu cục J&T Phường Bình Phú" },
      { time: "11:40:20", title: "Chuyển giao bưu cục phát", desc: "Kiện hàng đã tới bưu cục phát Phường Thủ Đức.", location: "Bưu cục J&T Phường Thủ Đức" },
      { time: "13:30:00", title: "Đang giao hàng", desc: "Bưu tá đang gọi khách hẹn nhận tại 56 Võ Văn Ngân, Phường Thủ Đức, TP.HCM.", location: "Đường Võ Văn Ngân, Phường Thủ Đức, TP.HCM" }
    ]
  },
  {
    trackingCode: "VD-LZ-261120-9102",
    orderId: "LZ261120206",
    channel: "LAZADA",
    carrier: "GHN (Giao Hàng Nhanh)",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 1600000,
    status: "PENDING_PICKUP",
    statusLabel: "⏳ Chờ lấy hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Hồ Nhật Minh",
      phone: "0914889922",
      address: "67 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM"
    },
    itemsSummary: "Thắt Lưng Nam Da Thật Khóa Tự Động (Đen) × 5",
    batchCode: "LO-2026-V1",
    handoverTime: "20/11/2026 14:15:00",
    lastUpdateTime: "20/11/2026 15:00:00",
    currentLocation: "Đã đóng gói — Chờ bưu tá GHN tới nhận tại Kho ODOMS Phường Bình Phú",
    shipperName: "Phạm Văn Hùng (GHN TP.HCM)",
    shipperPhone: "0977123456",
    progressPercent: 25,
    timeline: [
      { time: "20/11 13:55", title: "Duyệt đơn & Đóng gói", desc: "Đã đóng gói 5 Thắt Lưng Nam Da Thật từ lô LO-2026-V1.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "20/11 14:15", title: "Báo đơn vị vận chuyển lấy hàng", desc: "Đã gửi yêu cầu bưu tá GHN tới kho tiếp nhận kiện hàng.", location: "Kho ODOMS Phường Bình Phú" }
    ]
  },
  {
    trackingCode: "VD-FB-261102-3351",
    orderId: "FB261102403",
    channel: "FACEBOOK",
    carrier: "GHTK (Giao Hàng Tiết Kiệm)",
    shippingTier: "NHANH",
    shippingTierLabel: "🚀 Giao Nhanh (24H)",
    shippingFee: 35000,
    isFreeship: false,
    totalCod: 0,
    status: "PENDING_PICKUP",
    statusLabel: "⏳ Chờ lấy hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Bùi Anh Tuấn",
      phone: "0928112233",
      address: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội"
    },
    itemsSummary: "Kính Mát Thời Trang Chống Tia UV400 (Đen Bóng) × 4",
    batchCode: "LO-2026-X1",
    handoverTime: "02/11/2026 20:10:00",
    lastUpdateTime: "02/11/2026 20:25:00",
    currentLocation: "Đã đóng gói chống sốc — Chờ bưu tá GHTK tới lấy tại 186 An Dương Vương, Phường Bình Phú, TP.HCM",
    shipperName: "Nguyễn Hoàng Hải (Điều phối GHTK)",
    shipperPhone: "0909609200",
    progressPercent: 20,
    timeline: [
      { time: "02/11 20:05", title: "Duyệt đơn & Đóng gói", desc: "Đã in vận đơn VD-FB-261102-3351 và đóng hộp bảo vệ kính mát.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "02/11 20:25", title: "Báo đơn vị vận chuyển lấy hàng", desc: "Đã gửi yêu cầu bưu tá GHTK ghé kho lấy kiện hàng.", location: "Kho ODOMS Phường Bình Phú" }
    ]
  },
  {
    trackingCode: "VD-SP-261117-5519",
    orderId: "SP261117007",
    channel: "SHOPEE",
    carrier: "SPX Express",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 2100000,
    status: "FAILED_RETURNING",
    statusLabel: "❌ Giao thất bại / Chờ chuyển hoàn",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Đặng Thị Thảo",
      phone: "0933445588",
      address: "78 Quang Trung, Phường Gò Vấp, TP.HCM"
    },
    itemsSummary: "Áo Khoác Dù Chống UV 2 Lớp (Xám - Size XL) × 5",
    batchCode: "LO-2026-D1",
    handoverTime: "17/11/2026 16:00:00",
    lastUpdateTime: "19/11/2026 15:10:00",
    currentLocation: "Bưu tá gọi 3 cuộc không nghe máy — Lưu kho Phường Gò Vấp chờ giao lại lần 2",
    shipperName: "Vũ Đình Trọng (SPX Express)",
    shipperPhone: "0961889900",
    progressPercent: 60,
    timeline: [
      { time: "17/11 16:00", title: "Xuất kho ODOMS", desc: "Xuất 5 Áo Khoác Dù từ lô LO-2026-D1 tại Kho Phường Bình Phú.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "18/11 09:00", title: "Nhập kho bưu cục Phường Gò Vấp", desc: "Kiện hàng đã tới bưu cục phát.", location: "Bưu cục SPX Phường Gò Vấp" },
      { time: "19/11 14:30", title: "Giao không thành công lần 1", desc: "Thuê bao không liên lạc được lúc 14:15, 14:22, 14:30.", location: "Đường Quang Trung, Phường Gò Vấp, TP.HCM" },
      { time: "19/11 15:10", title: "Chờ giao lại lần 2", desc: "Kiện hàng lưu tạm tại bưu cục, dự kiến giao lại sáng hôm sau.", location: "Bưu cục SPX Phường Gò Vấp" }
    ]
  },
  {
    trackingCode: "VD-TT-261114-4418",
    orderId: "TT261114106",
    channel: "TIKTOK",
    carrier: "J&T Express",
    shippingTier: "NHANH",
    shippingTierLabel: "🚀 Giao Nhanh (24H)",
    shippingFee: 28000,
    isFreeship: false,
    totalCod: 3000000,
    status: "IN_TRANSIT",
    statusLabel: "🚚 Đang giao hàng",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Bùi Tiến Dũng",
      phone: "0983556677",
      address: "102 Trần Hưng Đạo, Phường An Đông, TP.HCM"
    },
    itemsSummary: "Giày Chạy Bộ Đế Đệm Siêu Nhẹ (Xám Xanh - Size 42) × 4",
    batchCode: "LO-2026-Q1",
    handoverTime: "14/11/2026 15:20:00",
    lastUpdateTime: "16/11/2026 10:40:00",
    currentLocation: "Đang giao hàng — Bưu tá đang trên tuyến đường Trần Hưng Đạo, Phường An Đông",
    shipperName: "Đỗ Thanh Tùng (J&T Express)",
    shipperPhone: "0919334455",
    progressPercent: 75,
    timeline: [
      { time: "14/11 15:20", title: "Xuất kho ODOMS & Đóng hộp", desc: "Xuất 4 đôi Giày Chạy Bộ từ lô LO-2026-Q1.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "15/11 08:30", title: "Đến bưu cục Phường An Đông", desc: "Kiện hàng đã hoàn tất phân loại nội thành.", location: "Bưu cục J&T Phường An Đông" },
      { time: "16/11 10:40", title: "Đang giao hàng", desc: "Bưu tá đang giao kiện hàng tới địa chỉ người nhận.", location: "Phường An Đông, TP.HCM" }
    ]
  },
  {
    trackingCode: "VD-SP-260115-1102",
    orderId: "SP260115002",
    channel: "SHOPEE",
    carrier: "SPX Express",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 950000,
    status: "DELIVERED",
    statusLabel: "✅ Giao thành công",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Trần Thị Bích",
      phone: "0912345678",
      address: "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng"
    },
    itemsSummary: "Áo Thun Cotton Oversize Unisex (Trắng - Size M) × 5",
    batchCode: "LO-2026-B1",
    handoverTime: "15/01/2026 11:00:00",
    lastUpdateTime: "17/01/2026 10:25:00",
    currentLocation: "Đã giao thành công — Khách ký nhận lúc 10:25 ngày 17/01/2026",
    shipperName: "Nguyễn Tấn Phát (SPX Đà Nẵng)",
    shipperPhone: "0905887766",
    progressPercent: 100,
    timeline: [
      { time: "15/01 11:00", title: "Xuất kho ODOMS Phường Bình Phú", desc: "Xuất 5 Áo Thun Cotton Oversize từ lô LO-2026-B1.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "16/01 18:10", title: "Đến kho trung chuyển Đà Nẵng", desc: "Kiện hàng đã tới trung tâm khai thác miền Trung.", location: "Kho SPX TP.Đà Nẵng" },
      { time: "17/01 10:25", title: "Giao thành công", desc: "Khách hàng Trần Thị Bích đã nhận đủ hàng và thanh toán thu hộ.", location: "45 Lê Lợi, Phường Hải Châu, TP.Đà Nẵng" }
    ]
  },
  {
    trackingCode: "VD-FB-260225-2201",
    orderId: "FB260225401",
    channel: "FACEBOOK",
    carrier: "GHTK (Giao Hàng Tiết Kiệm)",
    shippingTier: "NHANH",
    shippingTierLabel: "🚀 Giao Nhanh (24H)",
    shippingFee: 32000,
    isFreeship: false,
    totalCod: 0,
    status: "DELIVERED",
    statusLabel: "✅ Giao thành công",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Nguyễn Thị Thanh Trúc",
      phone: "0922334455",
      address: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội"
    },
    itemsSummary: "Đầm Thun Suông Dáng Ngắn Basic (Xanh Navy - Size M) × 5",
    batchCode: "LO-2026-O1",
    handoverTime: "26/02/2026 08:30:00",
    lastUpdateTime: "28/02/2026 15:40:00",
    currentLocation: "Đã giao thành công — Khách đã nhận đủ kiện hàng",
    shipperName: "Trần Văn Mạnh (GHTK Hà Nội)",
    shipperPhone: "0984221100",
    progressPercent: 100,
    timeline: [
      { time: "26/02 08:30", title: "Xuất kho ODOMS & Bàn giao GHTK", desc: "Xuất 5 Đầm Thun Suông từ lô LO-2026-O1.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "27/02 20:00", title: "Đến kho khai thác Hà Nội", desc: "Kiện hàng đã đến bưu cục phát Phường Cửa Nam.", location: "Kho GHTK Hà Nội" },
      { time: "28/02 15:40", title: "Giao thành công", desc: "Người nhận Nguyễn Thị Thanh Trúc đã ký nhận hoàn tất.", location: "34 Lý Thường Kiệt, Phường Cửa Nam, TP.Hà Nội" }
    ]
  },
  {
    trackingCode: "VD-LZ-260615-6603",
    orderId: "LZ260615203",
    channel: "LAZADA",
    carrier: "GHN (Giao Hàng Nhanh)",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 0,
    isFreeship: true,
    totalCod: 1900000,
    status: "DELIVERED",
    statusLabel: "✅ Giao thành công",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Ngô Thanh Vân",
      phone: "0918273645",
      address: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ"
    },
    itemsSummary: "Quần Kaki Chinos Công Sở (Be - Size 30) × 5",
    batchCode: "LO-2026-G1",
    handoverTime: "15/06/2026 14:00:00",
    lastUpdateTime: "17/06/2026 11:28:00",
    currentLocation: "Đã giao thành công — Khách ký nhận lúc 11:28 ngày 17/06/2026",
    shipperName: "Phạm Văn Hùng (GHN Cần Thơ)",
    shipperPhone: "0977123456",
    progressPercent: 100,
    timeline: [
      { time: "15/06 14:00", title: "Xuất kho ODOMS Phường Bình Phú", desc: "Xuất 5 Quần Kaki Chinos từ lô LO-2026-G1.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "16/06 06:30", title: "Rời trung tâm phân loại TP.HCM", desc: "Kiện hàng lên xe vận chuyển đi Tây Nam Bộ.", location: "Kho trung chuyển GHN Tân Bình" },
      { time: "17/06 07:15", title: "Đến bưu cục Phường An Cư", desc: "Đã tới bưu cục phát Cần Thơ.", location: "Bưu cục GHN Phường An Cư, TP.Cần Thơ" },
      { time: "17/06 11:28", title: "Giao thành công", desc: "Khách hàng Ngô Thanh Vân đã nhận hàng và thanh toán đủ tiền thu hộ.", location: "22 Đại lộ Hòa Bình, Phường An Cư, TP.Cần Thơ" }
    ]
  },
  {
    trackingCode: "VD-FB-260626-6602",
    orderId: "FB260626402",
    channel: "FACEBOOK",
    carrier: "GHTK (Giao Hàng Tiết Kiệm)",
    shippingTier: "TIEU_CHUAN",
    shippingTierLabel: "📦 Tiêu Chuẩn",
    shippingFee: 22000,
    isFreeship: false,
    totalCod: 960000,
    status: "DELIVERED",
    statusLabel: "✅ Giao thành công",
    sender: {
      name: "ODOMS Store — Kho Phường Bình Phú",
      phone: "02877776868",
      address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
    },
    receiver: {
      name: "Phạm Quang Vinh",
      phone: "0979443322",
      address: "85 Cộng Hòa, Phường Bảy Hiền, TP.HCM"
    },
    itemsSummary: "Nón Kết Lưỡi Trai Vải Kaki Thêu Chữ (Xanh Rêu) × 6",
    batchCode: "LO-2026-W1",
    handoverTime: "27/06/2026 09:00:00",
    lastUpdateTime: "28/06/2026 16:15:00",
    currentLocation: "Đã giao thành công — Hoàn tất thu hộ nội thành TP.HCM",
    shipperName: "Lý Quốc Cường (GHTK TP.HCM)",
    shipperPhone: "0937665544",
    progressPercent: 100,
    timeline: [
      { time: "27/06 09:00", title: "Xuất kho ODOMS & Bàn giao GHTK", desc: "Xuất 6 Nón Kết Lưỡi Trai từ lô LO-2026-W1.", location: "Kho ODOMS Phường Bình Phú" },
      { time: "28/06 16:15", title: "Giao thành công", desc: "Khách hàng Phạm Quang Vinh đã nhận đủ hàng và thanh toán thu hộ.", location: "85 Cộng Hòa, Phường Bảy Hiền, TP.HCM" }
    ]
  }
];

// 8. Bộ sinh tất định (Deterministic PRNG — Seed 20262027) mở rộng thêm 72 đơn hàng & 25 vận đơn (23/11/2026 – 30/06/2027)
//    Đồng bộ 1:1 với ODOMS_Backend_API.gs (tổng 102 đơn hàng, 35 vận đơn; bảo toàn tuyệt đối SP-AO-POLO-01)
(function appendExtendedFashion2026To2027MockData() {
  const catalog24 = (window.INITIAL_INVENTORY || []).slice(1).map(function (it, idx) {
    return {
      skuCode: it.sku,
      name: it.name,
      price: it.price,
      batch: "LO-2026-B" + String(idx + 2).padStart(2, "0")
    };
  });

  const channels = ["SHOPEE", "TIKTOK", "LAZADA", "POS", "FACEBOOK"];
  const prefixMap = { SHOPEE: "SP", TIKTOK: "TT", LAZADA: "LZ", POS: "POS", FACEBOOK: "FB" };
  const defaultCarrierMap = {
    SHOPEE: "SPX Express",
    TIKTOK: "J&T Express",
    LAZADA: "GHN (Giao Hàng Nhanh)",
    POS: "Tại quầy",
    FACEBOOK: ""
  };
  const customers = [
    "Nguyễn Hoàng Phúc", "Trần Ngọc Mai", "Lê Quang Khải", "Phạm Thanh Hà", "Võ Minh Khôi",
    "Đặng Bích Phương", "Bùi Quốc Tuấn", "Hoàng Yến Nhi", "Đỗ Gia Bảo", "Ngô Phương Thảo",
    "Dương Tuấn Kiệt", "Lý Khánh Linh", "Trương Minh Quân", "Phan Bảo Ngọc", "Huỳnh Tấn Tài",
    "Mai Thanh Trúc", "Đinh Quốc Việt", "Vương Thảo Vy", "Hồ Anh Dũng", "Châu Minh Thư",
    "Tạ Quang Huy", "Lương Mỹ Duyên", "Cao Tuấn Anh", "Đoàn Ngọc Ánh"
  ];
  const addresses = [
    "245 Nguyễn Thị Minh Khai, Phường Nguyễn Cư Trinh, TP.HCM",
    "118 Lê Văn Sỹ, Phường Nhiêu Lộc, TP.HCM",
    "56 Hoàng Diệu, Phường Hải Châu, TP.Đà Nẵng",
    "102 Phố Huế, Phường Hai Bà Trưng, TP.Hà Nội",
    "89 Nguyễn Văn Linh, Phường Hưng Lợi, TP.Cần Thơ",
    "34 Trần Phú, Phường Lộc Thọ, tỉnh Khánh Hòa",
    "19 Đại lộ Bình Dương, Phường Thủ Dầu Một, tỉnh Bình Dương",
    "77 Điện Biên Phủ, Phường Đa Kao, TP.HCM",
    "150 Cầu Giấy, Phường Quan Hoa, TP.Hà Nội",
    "62 Phan Chu Trinh, Phường Minh An, tỉnh Quảng Nam",
    "208 Võ Văn Ngân, Phường Linh Chiểu, TP.HCM",
    "41 Lê Hồng Phong, Phường Đông Khê, TP.Hải Phòng"
  ];

  const slots = [
    // 1. Giai đoạn 23/11/2026 – 30/11/2026 (6 đơn: đúng 2 đơn sáng 23/11 trước 12:00, 4 đơn từ 24/11 đến 30/11)
    { d: "23/11/2026", t: "08:35:00", yy: "26", mm: "11", dd: "23" },
    { d: "23/11/2026", t: "10:15:00", yy: "26", mm: "11", dd: "23" },
    { d: "24/11/2026", t: "14:20:00", yy: "26", mm: "11", dd: "24" },
    { d: "26/11/2026", t: "09:45:00", yy: "26", mm: "11", dd: "26" },
    { d: "28/11/2026", t: "16:10:00", yy: "26", mm: "11", dd: "28" },
    { d: "30/11/2026", t: "19:30:00", yy: "26", mm: "11", dd: "30" },
    // 2. Tháng 12/2026 (12 đơn)
    { d: "02/12/2026", t: "09:10:00", yy: "26", mm: "12", dd: "02" },
    { d: "05/12/2026", t: "11:25:00", yy: "26", mm: "12", dd: "05" },
    { d: "07/12/2026", t: "15:40:00", yy: "26", mm: "12", dd: "07" },
    { d: "10/12/2026", t: "10:05:00", yy: "26", mm: "12", dd: "10" },
    { d: "12/12/2026", t: "13:50:00", yy: "26", mm: "12", dd: "12" },
    { d: "15/12/2026", t: "17:15:00", yy: "26", mm: "12", dd: "15" },
    { d: "18/12/2026", t: "08:50:00", yy: "26", mm: "12", dd: "18" },
    { d: "20/12/2026", t: "14:30:00", yy: "26", mm: "12", dd: "20" },
    { d: "22/12/2026", t: "19:05:00", yy: "26", mm: "12", dd: "22" },
    { d: "25/12/2026", t: "10:45:00", yy: "26", mm: "12", dd: "25" },
    { d: "28/12/2026", t: "16:20:00", yy: "26", mm: "12", dd: "28" },
    { d: "30/12/2026", t: "20:10:00", yy: "26", mm: "12", dd: "30" },
    // 3. Tháng 01/2027 (9 đơn)
    { d: "03/01/2027", t: "09:15:00", yy: "27", mm: "01", dd: "03" },
    { d: "06/01/2027", t: "11:30:00", yy: "27", mm: "01", dd: "06" },
    { d: "10/01/2027", t: "14:45:00", yy: "27", mm: "01", dd: "10" },
    { d: "14/01/2027", t: "16:00:00", yy: "27", mm: "01", dd: "14" },
    { d: "17/01/2027", t: "10:20:00", yy: "27", mm: "01", dd: "17" },
    { d: "21/01/2027", t: "13:35:00", yy: "27", mm: "01", dd: "21" },
    { d: "24/01/2027", t: "15:50:00", yy: "27", mm: "01", dd: "24" },
    { d: "27/01/2027", t: "18:25:00", yy: "27", mm: "01", dd: "27" },
    { d: "30/01/2027", t: "20:00:00", yy: "27", mm: "01", dd: "30" },
    // 4. Tháng 02/2027 (9 đơn)
    { d: "02/02/2027", t: "08:40:00", yy: "27", mm: "02", dd: "02" },
    { d: "05/02/2027", t: "10:55:00", yy: "27", mm: "02", dd: "05" },
    { d: "09/02/2027", t: "14:10:00", yy: "27", mm: "02", dd: "09" },
    { d: "12/02/2027", t: "16:30:00", yy: "27", mm: "02", dd: "12" },
    { d: "15/02/2027", t: "09:25:00", yy: "27", mm: "02", dd: "15" },
    { d: "18/02/2027", t: "13:15:00", yy: "27", mm: "02", dd: "18" },
    { d: "22/02/2027", t: "15:45:00", yy: "27", mm: "02", dd: "22" },
    { d: "25/02/2027", t: "17:50:00", yy: "27", mm: "02", dd: "25" },
    { d: "28/02/2027", t: "19:20:00", yy: "27", mm: "02", dd: "28" },
    // 5. Tháng 03/2027 (9 đơn)
    { d: "03/03/2027", t: "09:05:00", yy: "27", mm: "03", dd: "03" },
    { d: "07/03/2027", t: "11:40:00", yy: "27", mm: "03", dd: "07" },
    { d: "10/03/2027", t: "14:25:00", yy: "27", mm: "03", dd: "10" },
    { d: "13/03/2027", t: "16:15:00", yy: "27", mm: "03", dd: "13" },
    { d: "15/03/2027", t: "10:30:00", yy: "27", mm: "03", dd: "15" },
    { d: "19/03/2027", t: "13:45:00", yy: "27", mm: "03", dd: "19" },
    { d: "23/03/2027", t: "15:20:00", yy: "27", mm: "03", dd: "23" },
    { d: "27/03/2027", t: "18:10:00", yy: "27", mm: "03", dd: "27" },
    { d: "30/03/2027", t: "20:05:00", yy: "27", mm: "03", dd: "30" },
    // 6. Tháng 04/2027 (9 đơn)
    { d: "02/04/2027", t: "08:50:00", yy: "27", mm: "04", dd: "02" },
    { d: "06/04/2027", t: "10:35:00", yy: "27", mm: "04", dd: "06" },
    { d: "10/04/2027", t: "14:00:00", yy: "27", mm: "04", dd: "10" },
    { d: "14/04/2027", t: "16:25:00", yy: "27", mm: "04", dd: "14" },
    { d: "18/04/2027", t: "09:30:00", yy: "27", mm: "04", dd: "18" },
    { d: "21/04/2027", t: "13:55:00", yy: "27", mm: "04", dd: "21" },
    { d: "25/04/2027", t: "15:40:00", yy: "27", mm: "04", dd: "25" },
    { d: "28/04/2027", t: "17:30:00", yy: "27", mm: "04", dd: "28" },
    { d: "30/04/2027", t: "19:15:00", yy: "27", mm: "04", dd: "30" },
    // 7. Tháng 05/2027 (9 đơn)
    { d: "03/05/2027", t: "09:20:00", yy: "27", mm: "05", dd: "03" },
    { d: "07/05/2027", t: "11:10:00", yy: "27", mm: "05", dd: "07" },
    { d: "11/05/2027", t: "14:35:00", yy: "27", mm: "05", dd: "11" },
    { d: "15/05/2027", t: "16:50:00", yy: "27", mm: "05", dd: "15" },
    { d: "19/05/2027", t: "10:05:00", yy: "27", mm: "05", dd: "19" },
    { d: "22/05/2027", t: "13:25:00", yy: "27", mm: "05", dd: "22" },
    { d: "26/05/2027", t: "15:30:00", yy: "27", mm: "05", dd: "26" },
    { d: "29/05/2027", t: "18:00:00", yy: "27", mm: "05", dd: "29" },
    { d: "31/05/2027", t: "20:20:00", yy: "27", mm: "05", dd: "31" },
    // 8. Tháng 06/2027 (9 đơn - kết thúc đúng 30/06/2027)
    { d: "02/06/2027", t: "08:45:00", yy: "27", mm: "06", dd: "02" },
    { d: "06/06/2027", t: "10:50:00", yy: "27", mm: "06", dd: "06" },
    { d: "10/06/2027", t: "14:15:00", yy: "27", mm: "06", dd: "10" },
    { d: "14/06/2027", t: "16:40:00", yy: "27", mm: "06", dd: "14" },
    { d: "18/06/2027", t: "09:35:00", yy: "27", mm: "06", dd: "18" },
    { d: "21/06/2027", t: "13:20:00", yy: "27", mm: "06", dd: "21" },
    { d: "25/06/2027", t: "15:55:00", yy: "27", mm: "06", dd: "25" },
    { d: "28/06/2027", t: "18:10:00", yy: "27", mm: "06", dd: "28" },
    { d: "30/06/2027", t: "19:45:00", yy: "27", mm: "06", dd: "30" }
  ];

  let seed = 20262027;
  const nextRand = function (mod) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed % mod;
  };

  const getTierLabel = function (t) {
    if (t === "HOA_TOC") return "⚡ Hỏa Tốc (2H)";
    if (t === "NHANH") return "🚀 Giao Nhanh (24H)";
    return "📦 Tiêu Chuẩn";
  };
  const getStLabel = function (st) {
    if (st === "IN_TRANSIT") return "🚚 Đang giao hàng";
    if (st === "DELIVERED") return "✅ Giao thành công";
    if (st === "FAILED_RETURNING") return "❌ Giao thất bại / Chờ chuyển hoàn";
    return "⏳ Chờ lấy hàng";
  };

  const phonePrefixes = ["090", "091", "093", "094", "096", "097", "098", "035", "038", "077"];
  let newShipCount = 0;

  for (let i = 0; i < slots.length; i++) {
    const sl = slots[i];
    const channel = channels[i % channels.length];
    const prefix = prefixMap[channel];
    const seqStr = String(501 + i);
    const orderId = prefix + sl.yy + sl.mm + sl.dd + seqStr;
    const item = catalog24[i % catalog24.length];
    const quantity = (i % 2) + 1;
    const custName = customers[(i + nextRand(5)) % customers.length];
    const phoneBody = String(1000000 + ((i * 137911 + nextRand(899999)) % 8999999)).slice(0, 7);
    const custPhone = phonePrefixes[i % phonePrefixes.length] + phoneBody;
    const addr =
      channel === "POS"
        ? "186 An Dương Vương, Phường Bình Phú, TP.HCM (Nhận trực tiếp tại kho)"
        : addresses[(i + nextRand(3)) % addresses.length];

    let platformStatus = "CONFIRMED";
    let rawStatusLabel = "Đã xác nhận";
    if (i === 17 || i === 44) {
      platformStatus = "CANCELLED";
      rawStatusLabel = "Đã hủy đơn";
    } else if (i === 5 || i === 35 || i === 68) {
      platformStatus = "UNCONFIRMED";
      rawStatusLabel = "Chờ xác nhận";
    }

    let paymentMethod = "COD (Thanh toán khi nhận hàng)";
    if (channel === "POS") {
      paymentMethod = i % 2 === 0 ? "Tiền mặt tại quầy" : "Chuyển khoản VietQR";
    } else if (channel === "SHOPEE") {
      paymentMethod = i % 2 === 0 ? "Ví ShopeePay" : "COD (Thanh toán khi nhận hàng)";
    } else if (channel === "TIKTOK") {
      paymentMethod = i % 2 === 0 ? "COD (Thanh toán khi nhận hàng)" : "Ví ZaloPay";
    } else if (channel === "LAZADA") {
      paymentMethod = i % 2 === 0 ? "Thẻ Visa / Mastercard" : "COD (Thanh toán khi nhận hàng)";
    } else if (channel === "FACEBOOK") {
      paymentMethod = i % 2 === 0 ? "Chuyển khoản VietQR" : "COD (Thu hộ khi giao)";
    }

    let carrier = defaultCarrierMap[channel];
    let trackingCode = "";

    const shouldCreateShipment =
      platformStatus === "CONFIRMED" &&
      channel !== "POS" &&
      (i === 0 || i === 1 || i % 2 === 0);

    if (shouldCreateShipment && newShipCount < 25) {
      const shPrefix = channel.slice(0, 2);
      trackingCode = "VD-" + shPrefix + "-" + sl.yy + sl.mm + sl.dd + "-" + String(7101 + newShipCount);
      const effectiveCarrier =
        channel === "FACEBOOK"
          ? i % 2 === 0
            ? "GHTK (Giao Hàng Tiết Kiệm)"
            : "Viettel Post"
          : carrier;
      carrier = effectiveCarrier;

      const shipStatuses = ["DELIVERED", "IN_TRANSIT", "PENDING_PICKUP", "DELIVERED", "IN_TRANSIT"];
      const shipStatus = i <= 1 ? "IN_TRANSIT" : shipStatuses[newShipCount % shipStatuses.length];
      const shipTiers = ["NHANH", "TIEU_CHUAN", "HOA_TOC"];
      const tier = shipTiers[newShipCount % shipTiers.length];
      const fee = newShipCount % 2 === 0 ? 0 : 25000;
      const isCod = paymentMethod.indexOf("COD") !== -1;
      const totalCod = isCod ? quantity * item.price : 0;
      const orderTimeFull = sl.d + " " + sl.t;
      const progressPct = shipStatus === "DELIVERED" ? 100 : shipStatus === "IN_TRANSIT" ? 75 : 25;

      window.SAMPLE_SHIPMENTS_DATA.push({
        trackingCode: trackingCode,
        orderId: orderId,
        channel: channel,
        carrier: effectiveCarrier,
        shippingTier: tier,
        shippingTierLabel: getTierLabel(tier),
        shippingFee: fee,
        isFreeship: fee === 0,
        totalCod: totalCod,
        status: shipStatus,
        statusLabel: getStLabel(shipStatus),
        sender: {
          name: "ODOMS Store — Kho Phường Bình Phú",
          phone: "02877776868",
          address: "186 An Dương Vương, Phường Bình Phú, TP.HCM"
        },
        receiver: {
          name: custName,
          phone: custPhone,
          address: addr
        },
        itemsSummary: item.name + " × " + quantity,
        batchCode: item.batch,
        handoverTime: orderTimeFull,
        lastUpdateTime: orderTimeFull,
        currentLocation:
          shipStatus === "DELIVERED"
            ? "Đã giao thành công — Người nhận đã ký nhận đủ kiện hàng"
            : shipStatus === "IN_TRANSIT"
            ? "Đang trên tuyến đường giao đến " + addr
            : "Đã đóng gói tại Kho Phường Bình Phú — Chờ bưu tá nhận hàng",
        shipperName: "Bưu tá điều phối (" + effectiveCarrier + ")",
        shipperPhone: "0908" + String(200000 + newShipCount * 1423).slice(0, 6),
        progressPercent: progressPct,
        timeline: [
          {
            time: sl.t,
            title: "Xuất kho ODOMS & Đóng gói",
            desc: "Đã đóng gói " + quantity + " " + item.name + " từ lô " + item.batch + ".",
            location: "Kho ODOMS Phường Bình Phú"
          }
        ]
      });
      newShipCount++;
    }

    const rowObj = {
      "Mã đơn hàng": orderId,
      "Sàn TMĐT": channel,
      "Thời gian đặt hàng": sl.d + " " + sl.t,
      "SKU phân loại": item.skuCode,
      "Tên sản phẩm": item.name,
      "Số lượng": quantity,
      "Đơn giá": item.price,
      "Người Mua": custName,
      "Số điện thoại": custPhone,
      "Địa chỉ nhận hàng": addr,
      "Trạng thái đơn hàng": rawStatusLabel,
      "Phương thức thanh toán": paymentMethod,
      "Đơn vị vận chuyển": carrier,
      "Mã vận đơn": trackingCode
    };

    if (channel === "SHOPEE") window.SAMPLE_EXCEL_DATASETS.SHOPEE.push(rowObj);
    else if (channel === "TIKTOK") window.SAMPLE_EXCEL_DATASETS.TIKTOK.push(rowObj);
    else if (channel === "LAZADA") window.SAMPLE_EXCEL_DATASETS.LAZADA.push(rowObj);
    else window.SAMPLE_EXCEL_DATASETS.FACEBOOK_POS.push(rowObj);

    window.UNIFIED_SAMPLE_DATASET.push(rowObj);
  }
})();
