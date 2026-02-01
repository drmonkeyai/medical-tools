// src/data/doseAdjust.ts
export type RenalUnit = "mL/min/1.73m²";

export type HepaticClass = "None" | "Child-Pugh A" | "Child-Pugh B" | "Child-Pugh C";

export type DoseRule = {
  // điều kiện
  egfrMin?: number; // inclusive
  egfrMax?: number; // exclusive
  childPugh?: HepaticClass; // áp dụng riêng cho gan
  // gợi ý
  recommendation: string; // text hiển thị
};

export type Drug = {
  id: string;
  name: string;
  aliases?: string[];       // để search theo tên khác
  group?: string;          // ví dụ: Kháng sinh, Giảm đau...
  typicalDose?: string;    // liều thường
  notes?: string;          // lưu ý chung
  renalRules?: DoseRule[]; // theo eGFR
  hepaticRules?: DoseRule[]; // theo Child-Pugh
};

export const drugs: Drug[] = [
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    aliases: ["Amox", "Amoxicillin 500"],
    group: "Kháng sinh",
    typicalDose: "500 mg mỗi 8 giờ hoặc 875 mg mỗi 12 giờ (tuỳ chỉ định)",
    notes: "Khuyến cáo chỉ mang tính tham khảo; cần đối chiếu tờ hướng dẫn/BNF/UpToDate tại cơ sở.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      { egfrMin: 30, egfrMax: 60, recommendation: "eGFR 30–59: thường không cần chỉnh hoặc cân nhắc kéo dài khoảng cách tuỳ nhiễm." },
      { egfrMin: 10, egfrMax: 30, recommendation: "eGFR 10–29: giảm liều hoặc kéo dài khoảng cách (ví dụ mỗi 12 giờ)." },
      { egfrMax: 10, recommendation: "eGFR <10: tránh liều cao; cân nhắc mỗi 24 giờ/ theo hướng dẫn cơ sở." },
    ],
  },
  {
    id: "metformin",
    name: "Metformin",
    aliases: ["Glucophage"],
    group: "Nội tiết",
    typicalDose: "500–1000 mg x 1–2 lần/ngày (tối đa tuỳ khuyến cáo)",
    notes: "Cần chú ý nguy cơ toan lactic; ngưng tạm khi mất nước, sốc, chụp cản quang iod…",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường, theo dõi định kỳ." },
      { egfrMin: 45, egfrMax: 60, recommendation: "eGFR 45–59: có thể dùng; theo dõi eGFR 3–6 tháng." },
      { egfrMin: 30, egfrMax: 45, recommendation: "eGFR 30–44: cân nhắc giảm liều; theo dõi sát." },
      { egfrMax: 30, recommendation: "eGFR <30: không khuyến cáo sử dụng." },
    ],
  },
  {
    id: "paracetamol",
    name: "Paracetamol (Acetaminophen)",
    aliases: ["Acetaminophen", "Panadol"],
    group: "Giảm đau – hạ sốt",
    typicalDose: "500–1000 mg mỗi 6–8 giờ; tối đa tuỳ bệnh cảnh",
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường theo hướng dẫn." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng liều thấp hơn, tránh tối đa liều/ngày cao; theo dõi." },
      { childPugh: "Child-Pugh B", recommendation: "Child-Pugh B: hạn chế liều, ưu tiên liều thấp nhất có hiệu quả." },
      { childPugh: "Child-Pugh C", recommendation: "Child-Pugh C: tránh nếu có thể; nếu cần dùng rất thận trọng/liều thấp." },
    ],
  },
];
