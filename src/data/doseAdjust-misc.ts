import type { Drug } from "./doseAdjust-types";

export const miscDrugs: Drug[] = [
  {
    id: "famotidine",
    name: "Famotidine",
    aliases: ["Pepcid"],
    group: "Tiêu hoá",
    typicalDose: "20–40 mg/ngày tuỳ chỉ định",
    notes: "Suy thận có thể làm tăng nguy cơ lú lẫn ở người cao tuổi nếu tích luỹ.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giảm liều hoặc dùng 1 lần/ngày.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường cần giảm khoảng 50% liều hoặc kéo dài khoảng cách.",
      },
    ],
  },
  {
    id: "omeprazole",
    name: "Omeprazole",
    aliases: ["Losec"],
    group: "Tiêu hoá",
    typicalDose: "20–40 mg/ngày",
    notes: "Thường không cần chỉnh liều theo thận; lưu ý chỉ định và thời gian dùng.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không cần chỉnh liều theo thận." },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: thường có thể dùng, theo dõi nếu điều trị kéo dài." },
      { childPugh: "Child-Pugh B", recommendation: "Child-Pugh B: cân nhắc khởi đầu liều thấp hơn nếu cần." },
      { childPugh: "Child-Pugh C", recommendation: "Child-Pugh C: cân nhắc khởi đầu liều thấp hơn và theo dõi đáp ứng." },
    ],
  },
  {
    id: "fluconazole",
    name: "Fluconazole",
    aliases: ["Diflucan"],
    group: "Kháng nấm",
    typicalDose: "50–400 mg/ngày tuỳ chỉ định",
    notes: "Một số phác đồ dùng liều nạp trước; lưu ý QT và tương tác CYP.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: nhiều trường hợp cân nhắc giảm liều duy trì.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường giảm khoảng 50% liều duy trì; liều nạp nếu có thường giữ nguyên.",
      },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường và theo dõi men gan nếu cần." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng; theo dõi độc tính gan." },
      { childPugh: "Child-Pugh B", recommendation: "Child-Pugh B: cân nhắc nguy cơ/lợi ích; theo dõi men gan sát." },
      { childPugh: "Child-Pugh C", recommendation: "Child-Pugh C: rất thận trọng; tránh nếu có lựa chọn phù hợp hơn." },
    ],
  },
  {
    id: "acyclovir",
    name: "Acyclovir",
    aliases: ["Zovirax"],
    group: "Kháng virus",
    typicalDose: "Tuỳ chỉ định; đường uống thường 200–800 mg/lần",
    notes: "Thuốc dễ tích luỹ khi suy thận; chú ý độc tính thần kinh và kết tinh niệu nếu bù dịch kém.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc kéo dài khoảng cách dùng.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần kéo dài khoảng cách rõ rệt.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: chỉnh liều đáng kể; theo dõi sát độc tính thần kinh và thận.",
      },
    ],
  },
  {
    id: "valacyclovir",
    name: "Valacyclovir",
    aliases: ["Valtrex"],
    group: "Kháng virus",
    typicalDose: "Tuỳ chỉ định; thường 500 mg đến 1 g/lần",
    notes: "Là tiền chất của acyclovir; suy thận làm tăng nguy cơ độc tính thần kinh.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cần chỉnh liều theo chỉ định điều trị.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường giảm liều rõ hoặc kéo dài khoảng cách.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: chỉnh liều đáng kể; theo dõi sát.",
      },
    ],
  },
  {
    id: "oseltamivir",
    name: "Oseltamivir",
    aliases: ["Tamiflu"],
    group: "Kháng virus",
    typicalDose: "75 mg mỗi 12 giờ trong điều trị, 75 mg/ngày trong dự phòng",
    notes: "Liều thay đổi theo điều trị hay dự phòng.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường theo chỉ định." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giảm liều hoặc chỉnh khoảng cách tuỳ điều trị hay dự phòng.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần giảm liều đáng kể hoặc dùng cách ngày theo chỉ định.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: đối chiếu hướng dẫn chuyên biệt hoặc chuyên khoa.",
      },
    ],
  },
];