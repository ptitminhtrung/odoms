// 2. Dữ liệu Tồn kho Khả dụng (ATP) & Lô hàng (Batch FEFO) trên Hệ thống ODOMS - Ngành Thời Trang
window.INITIAL_INVENTORY = [
  // ================= DANH MỤC 1: ÁO (5 SẢN PHẨM) =================
  {
    sku: "SP-AO-POLO-01",
    name: "Áo Polo Nam Coolmate Pro (Đen - Size L)",
    category: "Áo",
    unit: "Cái",
    price: 250000,
    maxCapacity: 25,
    physicalStock: 10, // Giữ đúng 10 cái để minh họa kịch bản tranh chấp tồn kho FIFO giữa 4 sàn
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