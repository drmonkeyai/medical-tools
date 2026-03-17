import type { Drug } from "./doseAdjust-types";

export const antibioticDrugs: Drug[] = [
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    aliases: ["Amox", "Amoxicillin 500"],
    group: "Kháng sinh",
    typicalDose: "500 mg mỗi 8 giờ hoặc 875 mg mỗi 12 giờ",
    notes: "Đối chiếu lại theo vị trí nhiễm, mức độ nặng và chế phẩm.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: thường không cần chỉnh nhiều hoặc cân nhắc kéo dài khoảng cách.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: giảm liều hoặc kéo dài khoảng cách (ví dụ mỗi 12 giờ).",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: tránh liều cao; cân nhắc dùng thưa hơn.",
      },
    ],
  },
  {
    id: "amoxicillin-clavulanate",
    name: "Amoxicillin/Clavulanate",
    aliases: ["Augmentin", "Co-amoxiclav"],
    group: "Kháng sinh",
    typicalDose: "500/125 mg mỗi 8 giờ hoặc 875/125 mg mỗi 12 giờ",
    notes: "Không nên dùng chế phẩm hàm lượng cao ở suy thận nặng nếu chưa đối chiếu nhãn thuốc.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giữ liều nhưng tránh khoảng cách quá dày nếu nhiễm nhẹ.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần kéo dài khoảng cách; tránh chế phẩm hàm lượng cao.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: cần giảm tần suất rõ; ưu tiên đối chiếu theo chế phẩm.",
      },
    ],
  },
  {
    id: "cephalexin",
    name: "Cephalexin",
    aliases: ["Keflex"],
    group: "Kháng sinh",
    typicalDose: "250–500 mg mỗi 6–8 giờ",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giảm tổng liều/ngày hoặc kéo dài khoảng cách.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần kéo dài khoảng cách dùng.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: giảm liều rõ hoặc kéo dài khoảng cách hơn nữa.",
      },
    ],
  },
  {
    id: "cefuroxime",
    name: "Cefuroxime",
    aliases: ["Zinnat", "Ceftin"],
    group: "Kháng sinh",
    typicalDose: "250–500 mg mỗi 12 giờ",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: thường chưa cần chỉnh nhiều, nhưng theo dõi nếu dùng liều cao.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần giảm tần suất dùng.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: kéo dài khoảng cách dùng.",
      },
    ],
  },
  {
    id: "cefixime",
    name: "Cefixime",
    aliases: ["Suprax"],
    group: "Kháng sinh",
    typicalDose: "200 mg mỗi 12 giờ hoặc 400 mg mỗi 24 giờ",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 20,
        egfrMax: 60,
        recommendation: "eGFR 20–59: cân nhắc giảm liều duy trì nếu dùng kéo dài.",
      },
      {
        egfrMax: 20,
        recommendation: "eGFR <20: thường cần giảm khoảng 50% liều hoặc kéo dài khoảng cách.",
      },
    ],
  },
  {
    id: "ciprofloxacin",
    name: "Ciprofloxacin",
    aliases: ["Cipro"],
    group: "Kháng sinh",
    typicalDose: "250–750 mg mỗi 12 giờ",
    notes: "Lưu ý kéo dài QT, viêm gân/đứt gân, độc tính thần kinh.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc giảm liều hoặc kéo dài khoảng cách.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: thường cần giảm tổng liều/ngày hoặc kéo dài khoảng cách.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: cần chỉnh liều rõ; theo dõi độc tính thần kinh.",
      },
    ],
  },
  {
    id: "levofloxacin",
    name: "Levofloxacin",
    aliases: ["Levaquin"],
    group: "Kháng sinh",
    typicalDose: "250–750 mg mỗi 24 giờ",
    notes: "Nhiều phác đồ dùng liều nạp rồi mới chỉnh liều duy trì.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: thường cần chỉnh liều duy trì hoặc kéo dài khoảng cách.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: chỉnh liều rõ; nhiều chỉ định dùng cách ngày.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: cần chỉnh liều đáng kể; đối chiếu phác đồ cụ thể.",
      },
    ],
  },
  {
    id: "moxifloxacin",
    name: "Moxifloxacin",
    aliases: ["Avelox"],
    group: "Kháng sinh",
    typicalDose: "400 mg mỗi 24 giờ",
    notes: "Thường không cần chỉnh liều theo thận, nhưng vẫn lưu ý QT và độc tính nhóm quinolone.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không cần chỉnh liều theo thận." },
    ],
  },
  {
    id: "trimethoprim-sulfamethoxazole",
    name: "Trimethoprim/Sulfamethoxazole",
    aliases: ["TMP-SMX", "Cotrimoxazole", "Bactrim", "Septrin"],
    group: "Kháng sinh",
    typicalDose: "160/800 mg mỗi 12 giờ",
    notes: "Theo dõi kali máu, creatinin, phát ban; nguy cơ tăng kali rõ hơn ở CKD.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: có thể dùng, nhưng cần theo dõi kali và chức năng thận.",
      },
      {
        egfrMin: 15,
        egfrMax: 30,
        recommendation: "eGFR 15–29: thường cần giảm 50% liều hoặc kéo dài khoảng cách.",
      },
      {
        egfrMax: 15,
        recommendation: "eGFR <15: thường tránh hoặc chỉ dùng khi có chỉ định rõ và theo dõi sát.",
      },
    ],
  },
  {
    id: "nitrofurantoin",
    name: "Nitrofurantoin",
    aliases: ["Macrobid", "Macrodantin"],
    group: "Kháng sinh tiết niệu",
    typicalDose: "100 mg mỗi 12 giờ",
    notes: "Ngưỡng thận còn phụ thuộc nhãn thuốc và nguồn tham chiếu.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: có thể dùng theo chỉ định nếu phù hợp lâm sàng." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc thận trọng; thường chỉ phù hợp ở chỉ định ngắn ngày.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường tránh sử dụng.",
      },
    ],
  },
  {
    id: "metronidazole",
    name: "Metronidazole",
    aliases: ["Flagyl"],
    group: "Kháng sinh / kháng ký sinh trùng",
    typicalDose: "250–500 mg mỗi 8–12 giờ",
    notes: "Suy gan ảnh hưởng nhiều hơn suy thận.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: thường không cần chỉnh liều ở dùng ngắn ngày.",
      },
      {
        egfrMin: 10,
        egfrMax: 30,
        recommendation: "eGFR 10–29: đa số trường hợp vẫn dùng gần liều thường; cân nhắc theo dõi nếu dùng kéo dài.",
      },
      {
        egfrMax: 10,
        recommendation: "eGFR <10: có thể cần giảm tần suất ở liệu trình kéo dài hoặc liều cao.",
      },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường." },
      {
        childPugh: "Child-Pugh A",
        recommendation: "Child-Pugh A: thường chưa cần chỉnh nhiều, nhưng theo dõi nếu điều trị kéo dài.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: cân nhắc giảm liều hoặc kéo dài khoảng cách.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: thường cần giảm đáng kể liều hoặc kéo dài khoảng cách.",
      },
    ],
  },
  {
    id: "clarithromycin",
    name: "Clarithromycin",
    aliases: ["Klacid"],
    group: "Kháng sinh",
    typicalDose: "250–500 mg mỗi 12 giờ",
    notes: "Lưu ý tương tác CYP3A4, QT, và thận trọng ở bệnh gan hoặc thận phối hợp.",
    renalRules: [
      { egfrMin: 60, recommendation: "eGFR ≥60: dùng liều thường." },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: theo dõi và cân nhắc chỉnh liều nếu điều trị liều cao.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: thường cần giảm khoảng 50% liều.",
      },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng." },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: cần cân nhắc kỹ, nhất là khi kèm suy thận.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: tránh nếu có lựa chọn phù hợp hơn.",
      },
    ],
  },
  {
    id: "azithromycin",
    name: "Azithromycin",
    aliases: ["Zithromax"],
    group: "Kháng sinh",
    typicalDose: "500 mg ngày 1, sau đó 250 mg/ngày hoặc tuỳ chỉ định",
    notes: "Thường ít phải chỉnh liều theo thận hơn clarithromycin.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không cần chỉnh liều theo thận." },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường nếu phù hợp." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng." },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: cân nhắc kỹ nếu dùng kéo dài hoặc phối hợp thuốc độc gan.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: thận trọng cao; tránh nếu có lựa chọn phù hợp hơn.",
      },
    ],
  },
  {
    id: "doxycycline",
    name: "Doxycycline",
    aliases: ["Vibramycin"],
    group: "Kháng sinh",
    typicalDose: "100 mg mỗi 12 giờ",
    notes: "Thường không cần chỉnh liều theo thận.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không cần chỉnh liều theo thận." },
    ],
  },
  {
    id: "clindamycin",
    name: "Clindamycin",
    aliases: ["Dalacin"],
    group: "Kháng sinh",
    typicalDose: "150–450 mg mỗi 6–8 giờ",
    notes: "Lưu ý tiêu chảy liên quan C. difficile; đa số không cần chỉnh liều theo thận.",
    renalRules: [
      { egfrMin: 0, recommendation: "Đa số trường hợp: không cần chỉnh liều theo thận." },
    ],
    hepaticRules: [
      { childPugh: "None", recommendation: "Không bệnh gan rõ: dùng liều thường." },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng." },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: cân nhắc theo dõi nếu điều trị kéo dài.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: cân nhắc kéo dài khoảng cách hoặc theo dõi sát độc tính gan.",
      },
    ],
  },
];