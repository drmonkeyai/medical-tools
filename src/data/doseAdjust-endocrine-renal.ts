import type { Drug } from "./doseAdjust-types";

export const endocrineRenalDrugs: Drug[] = [
  {
    id: "metformin",
    name: "Metformin",
    aliases: ["Glucophage"],
    group: "Nội tiết",
    typicalDose: "500–1000 mg x 1–2 lần/ngày",
    notes: "Cần chú ý nguy cơ toan lactic; ngưng tạm khi mất nước, sốc, cản quang iod hoặc giảm oxy mô.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường, theo dõi định kỳ." },
      {
        egfrMin: 45,
        egfrMax: 60,
        recommendation: "eGFR 45–59: có thể dùng; theo dõi eGFR định kỳ.",
      },
      {
        egfrMin: 30,
        egfrMax: 45,
        recommendation: "eGFR 30–44: cân nhắc giảm liều; theo dõi sát.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: không khuyến cáo sử dụng.",
      },
    ],
  },
  {
    id: "sitagliptin",
    name: "Sitagliptin",
    aliases: ["Januvia"],
    group: "Nội tiết",
    typicalDose: "100 mg/ngày",
    renalRules: [
      { egfrMin: 45, recommendation: "eGFR ≥45: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 45,
        recommendation: "eGFR 30–44: thường giảm còn liều trung gian.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường giảm còn liều thấp hơn; đối chiếu nhãn thuốc.",
      },
    ],
  },
  {
    id: "linagliptin",
    name: "Linagliptin",
    aliases: ["Trajenta"],
    group: "Nội tiết",
    typicalDose: "5 mg/ngày",
    notes: "Ưu điểm là thường không cần chỉnh liều theo thận.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không cần chỉnh liều theo thận." },
    ],
  },
  {
    id: "empagliflozin",
    name: "Empagliflozin",
    aliases: ["Jardiance"],
    group: "Nội tiết",
    typicalDose: "10–25 mg/ngày",
    notes: "Khởi trị/duy trì phụ thuộc ngưỡng eGFR và mục tiêu điều trị đái tháo đường, tim mạch, thận.",
    renalRules: [
      {
        egfrMin: 45,
        recommendation: "eGFR ≥45: thường có thể dùng theo chỉ định; đối chiếu mục tiêu điều trị.",
      },
      {
        egfrMin: 20,
        egfrMax: 45,
        recommendation: "eGFR 20–44: có thể tiếp tục hoặc cân nhắc theo chỉ định thận/tim; hiệu quả hạ đường huyết giảm.",
      },
      {
        egfrMax: 20,
        recommendation: "eGFR <20: thường không khởi trị theo app này nếu chưa có hướng dẫn chuyên biệt.",
      },
    ],
  },
  {
    id: "dapagliflozin",
    name: "Dapagliflozin",
    aliases: ["Forxiga", "Farxiga"],
    group: "Nội tiết",
    typicalDose: "10 mg/ngày",
    notes: "Ngưỡng dùng phụ thuộc mục tiêu điều trị đái tháo đường, suy tim, CKD.",
    renalRules: [
      {
        egfrMin: 25,
        recommendation: "eGFR ≥25: có thể cân nhắc dùng theo chỉ định thích hợp.",
      },
      {
        egfrMax: 25,
        recommendation: "eGFR <25: thường không khởi trị theo app này nếu chưa có hướng dẫn chuyên biệt.",
      },
    ],
  },
  {
    id: "allopurinol",
    name: "Allopurinol",
    aliases: ["Zyloric"],
    group: "Gout",
    typicalDose: "Khởi đầu thấp, tăng dần theo acid uric và dung nạp",
    notes: "Nên khởi đầu thấp, đặc biệt ở CKD; theo dõi phát ban nặng nếu có nguy cơ.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation: "eGFR ≥60: khởi đầu thấp rồi chỉnh tăng dần theo đáp ứng.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: nên khởi đầu thấp hơn và tăng liều từ từ.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: khởi đầu rất thấp; tăng liều thận trọng.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: cần khởi đầu thấp và theo dõi sát độc tính.",
      },
    ],
  },
  {
    id: "colchicine",
    name: "Colchicine",
    aliases: ["Colcrys"],
    group: "Gout",
    typicalDose: "Tuỳ chỉ định; cơn gout cấp và dự phòng có liều khác nhau",
    notes: "Suy thận làm tăng độc tính; lưu ý tương tác mạnh với thuốc ức chế CYP3A4/P-gp.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation: "eGFR ≥60: dùng theo liều thường nếu không có tương tác.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giảm liều hoặc giảm tần suất, nhất là dùng lặp lại.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần giảm liều rõ và tránh lặp lại quá sớm.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: rất thận trọng hoặc tránh nếu có lựa chọn khác.",
      },
    ],
    hepaticRules: [
      {
        childPugh: "None",
        recommendation: "Không bệnh gan rõ: dùng theo liều thông thường nếu không có tương tác.",
      },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng." },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: cân nhắc giảm liều và tránh phối hợp thuốc tương tác mạnh.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: thường tránh hoặc dùng rất thận trọng.",
      },
    ],
  },
  {
    id: "febuxostat",
    name: "Febuxostat",
    aliases: ["Adenuric", "Uloric"],
    group: "Gout",
    typicalDose: "40–80 mg/ngày",
    notes: "Theo dõi men gan; cân nhắc nguy cơ tim mạch theo bệnh cảnh.",
    renalRules: [
      { egfrMin: 30, recommendation: "eGFR ≥30: thường có thể dùng theo liều thường hoặc tăng thận trọng." },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: dữ liệu hạn chế hơn; cân nhắc dùng thận trọng và theo dõi sát.",
      },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường nếu phù hợp." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: thường có thể dùng, theo dõi men gan." },
      { childPugh: "Child-Pugh B", recommendation: "Child-Pugh B: dùng thận trọng, theo dõi men gan." },
      { childPugh: "Child-Pugh C", recommendation: "Child-Pugh C: dữ liệu hạn chế; tránh nếu có lựa chọn khác." },
    ],
  },
  {
    id: "glimepiride",
    name: "Glimepiride",
    aliases: ["Amaryl"],
    group: "Nội tiết",
    typicalDose: "1–8 mg/ngày",
    notes: "Nguy cơ hạ đường huyết tăng ở CKD; nên khởi đầu thấp.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường, ưu tiên khởi đầu thấp." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: khởi đầu thấp hơn và tăng liều thận trọng.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: tránh nếu có thể hoặc dùng rất thận trọng vì nguy cơ hạ đường huyết.",
      },
    ],
  },
];