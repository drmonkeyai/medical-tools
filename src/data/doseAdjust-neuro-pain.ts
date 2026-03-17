import type { Drug } from "./doseAdjust-types";

export const neuroPainDrugs: Drug[] = [
  {
    id: "paracetamol",
    name: "Paracetamol (Acetaminophen)",
    aliases: ["Acetaminophen", "Panadol"],
    group: "Giảm đau – hạ sốt",
    typicalDose: "500–1000 mg mỗi 6–8 giờ; tối đa tuỳ bệnh cảnh",
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường theo hướng dẫn." },
      {
        childPugh: "Child-Pugh A",
        recommendation: "Child-Pugh A: dùng liều thấp hơn, tránh tổng liều ngày cao; theo dõi.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: hạn chế liều, ưu tiên liều thấp nhất có hiệu quả.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: tránh nếu có thể; nếu cần dùng thì rất thận trọng và liều thấp.",
      },
    ],
  },
  {
    id: "tramadol",
    name: "Tramadol",
    aliases: ["Ultram"],
    group: "Giảm đau",
    typicalDose: "50–100 mg mỗi 6–8 giờ, tối đa tuỳ bệnh cảnh",
    notes: "Lưu ý nguy cơ buồn ngủ, co giật, hội chứng serotonin; suy thận hoặc gan dễ tích luỹ.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường nếu phù hợp." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giảm liều hoặc kéo dài khoảng cách.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường cần kéo dài khoảng cách dùng; tránh dạng giải phóng kéo dài.",
      },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: cân nhắc giảm liều." },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: thường cần giảm liều hoặc kéo dài khoảng cách.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: tránh hoặc dùng rất thận trọng.",
      },
    ],
  },
  {
    id: "gabapentin",
    name: "Gabapentin",
    aliases: ["Neurontin"],
    group: "Thần kinh / giảm đau",
    typicalDose: "Khởi đầu thấp, tăng dần theo đáp ứng",
    notes: "Thuốc thải qua thận; dễ gây buồn ngủ, chóng mặt, lú lẫn khi tích luỹ.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường, tăng liều từ từ." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cần giảm tổng liều/ngày.",
      },
      {
        egfrMin: 15,
        egfrMax: 30,
        recommendation: "eGFR 15–29: giảm liều rõ, thường chia ít lần hơn.",
      },
      {
        egfrMax: 15,
        recommendation: "eGFR <15: dùng liều rất thấp, tăng cực kỳ thận trọng.",
      },
    ],
  },
  {
    id: "pregabalin",
    name: "Pregabalin",
    aliases: ["Lyrica"],
    group: "Thần kinh / giảm đau",
    typicalDose: "Khởi đầu thấp, chỉnh tăng theo đáp ứng",
    notes: "Tương tự gabapentin, dễ tích luỹ ở CKD.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cần giảm liều duy trì.",
      },
      {
        egfrMin: 15,
        egfrMax: 30,
        recommendation: "eGFR 15–29: giảm liều rõ.",
      },
      {
        egfrMax: 15,
        recommendation: "eGFR <15: dùng liều rất thấp, theo dõi chặt.",
      },
    ],
  },
  {
    id: "duloxetine",
    name: "Duloxetine",
    aliases: ["Cymbalta"],
    group: "Thần kinh / tâm thần",
    typicalDose: "30–60 mg/ngày",
    notes: "Lưu ý buồn nôn, tăng huyết áp, độc gan hiếm gặp.",
    renalRules: [
      { egfrMin: 30, recommendation: "eGFR ≥30: có thể dùng, khởi đầu thấp nếu cần." },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường tránh hoặc dùng rất thận trọng vì tích luỹ và tác dụng phụ tăng.",
      },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng, theo dõi men gan." },
      { childPugh: "Child-Pugh B", recommendation: "Child-Pugh B: thường tránh nếu có lựa chọn khác." },
      { childPugh: "Child-Pugh C", recommendation: "Child-Pugh C: không khuyến cáo dùng." },
    ],
  },
  {
    id: "amitriptyline",
    name: "Amitriptyline",
    aliases: ["TCA"],
    group: "Thần kinh / tâm thần",
    typicalDose: "10–75 mg buổi tối tuỳ chỉ định",
    notes: "Lưu ý kháng cholinergic, kéo dài QT, té ngã ở người lớn tuổi.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không có quy tắc chỉnh liều cứng theo thận, nhưng nên khởi đầu thấp." },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường nếu phù hợp." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: khởi đầu thấp hơn, tăng liều chậm." },
      { childPugh: "Child-Pugh B", recommendation: "Child-Pugh B: cân nhắc giảm liều và tăng chậm." },
      { childPugh: "Child-Pugh C", recommendation: "Child-Pugh C: tránh hoặc dùng rất thận trọng." },
    ],
  },
  {
    id: "levetiracetam",
    name: "Levetiracetam",
    aliases: ["Keppra"],
    group: "Thần kinh",
    typicalDose: "500–1500 mg mỗi 12 giờ",
    notes: "Thuốc thải qua thận nhiều; dễ tích luỹ ở CKD.",
    renalRules: [
      { egfrMin: 80, recommendation: "eGFR ≥80: dùng liều thường." },
      {
        egfrMin: 50,
        egfrMax: 80,
        recommendation: "eGFR 50–79: cân nhắc giảm nhẹ liều duy trì.",
      },
      {
        egfrMin: 30,
        egfrMax: 50,
        recommendation: "eGFR 30–49: thường cần giảm liều rõ hơn.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: cần giảm liều đáng kể; đối chiếu theo chỉ định và dạng bào chế.",
      },
    ],
  },
  {
    id: "baclofen",
    name: "Baclofen",
    aliases: [],
    group: "Thần kinh / giãn cơ",
    typicalDose: "5–20 mg x 2–3 lần/ngày",
    notes: "Baclofen tích luỹ mạnh ở CKD và có thể gây lơ mơ/hôn mê.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường nếu phù hợp." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: nên khởi đầu thấp hơn và tăng rất thận trọng.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường tránh hoặc chỉ dùng liều rất thấp khi thật cần.",
      },
    ],
  },
];