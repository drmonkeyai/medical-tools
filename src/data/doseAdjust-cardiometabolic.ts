import type { Drug } from "./doseAdjust-types";

export const cardiometabolicDrugs: Drug[] = [
  // 1
  {
    id: "digoxin",
    name: "Digoxin",
    aliases: ["Lanoxin"],
    group: "Tim mạch",
    typicalDose:
      "Liều duy trì thấp, cá thể hoá theo tuổi/chức năng thận/nồng độ thuốc",
    notes:
      "Biên độ điều trị hẹp; cần theo dõi mạch, điện giải, chức năng thận và nồng độ thuốc khi phù hợp.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: vẫn nên dùng liều thấp nhất có hiệu quả.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: thường cần giảm liều duy trì và/hoặc dùng cách ngày.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: cần giảm liều đáng kể; theo dõi rất sát nguy cơ ngộ độc.",
      },
    ],
  },

  // 2
  {
    id: "enoxaparin",
    name: "Enoxaparin",
    aliases: ["Clexane", "Lovenox"],
    group: "Chống đông",
    typicalDose: "Tuỳ chỉ định dự phòng hay điều trị",
    notes:
      "Liều phụ thuộc chỉ định, cân nặng và nguy cơ chảy máu; suy thận làm tăng tích luỹ.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng theo liều thường của chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: cân nhắc theo dõi sát chảy máu; nhiều phác đồ chưa cần chỉnh mạnh.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường cần giảm liều hoặc đổi phác đồ theo chỉ định; đối chiếu hướng dẫn cơ sở.",
      },
    ],
  },

  // 3
  {
    id: "rivaroxaban",
    name: "Rivaroxaban",
    aliases: ["Xarelto"],
    group: "Chống đông",
    typicalDose: "Liều thay đổi theo chỉ định",
    notes:
      "Phụ thuộc nhiều vào chỉ định như rung nhĩ, DVT/PE, dự phòng sau mổ.",
    renalRules: [
      {
        egfrMin: 50,
        recommendation:
          "eGFR ≥50: nhiều chỉ định dùng liều thường, nhưng cần đối chiếu từng chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 50,
        recommendation:
          "eGFR 30–49: nhiều chỉ định cần giảm liều; phải xem đúng bệnh cảnh.",
      },
      {
        egfrMin: 15,
        egfrMax: 30,
        recommendation:
          "eGFR 15–29: rất thận trọng; nhiều chỉ định không ưu tiên.",
      },
      {
        egfrMax: 15,
        recommendation:
          "eGFR <15: thường không khuyến cáo dùng.",
      },
    ],
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: thận trọng, đối chiếu đúng chỉ định.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: thường tránh hoặc không ưu tiên.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: không khuyến cáo dùng.",
      },
    ],
  },

  // 4
  {
    id: "apixaban",
    name: "Apixaban",
    aliases: ["Eliquis"],
    group: "Chống đông",
    typicalDose: "Liều thay đổi theo chỉ định",
    notes:
      "Nhiều chỉ định không chỉnh liều chỉ dựa riêng vào thận; cần xem tuổi, cân nặng, creatinin và chỉ định cụ thể.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng theo liều của chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: nhiều trường hợp vẫn dùng được, nhưng phải xem đúng chỉ định và tiêu chuẩn giảm liều.",
      },
      {
        egfrMin: 15,
        egfrMax: 30,
        recommendation:
          "eGFR 15–29: rất thận trọng; ưu tiên đối chiếu nhãn thuốc hoặc hướng dẫn cụ thể.",
      },
      {
        egfrMax: 15,
        recommendation:
          "eGFR <15: không dùng theo app này nếu chưa có hướng dẫn chuyên biệt.",
      },
    ],
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      { childPugh: "Child-Pugh A", recommendation: "Child-Pugh A: dùng thận trọng." },
      {
        childPugh: "Child-Pugh B",
        recommendation: "Child-Pugh B: thận trọng, dữ liệu hạn chế.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation: "Child-Pugh C: không khuyến cáo dùng.",
      },
    ],
  },

  // 5
  {
    id: "dabigatran",
    name: "Dabigatran",
    aliases: ["Pradaxa"],
    group: "Chống đông",
    typicalDose: "Liều thay đổi theo chỉ định",
    notes: "Phụ thuộc nhiều vào chức năng thận và chỉ định.",
    renalRules: [
      {
        egfrMin: 50,
        recommendation:
          "eGFR ≥50: nhiều chỉ định dùng liều thường, nhưng cần đối chiếu đúng bệnh cảnh.",
      },
      {
        egfrMin: 30,
        egfrMax: 50,
        recommendation:
          "eGFR 30–49: cân nhắc giảm liều ở một số chỉ định hoặc yếu tố nguy cơ.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: nhiều chỉ định không ưu tiên hoặc không khuyến cáo dùng.",
      },
    ],
  },

  // 6
  {
    id: "edoxaban",
    name: "Edoxaban",
    aliases: ["Lixiana", "Savaysa"],
    group: "Chống đông",
    typicalDose: "Liều thay đổi theo chỉ định",
    renalRules: [
      {
        egfrMin: 50,
        recommendation:
          "eGFR ≥50: dùng theo liều của chỉ định nếu phù hợp.",
      },
      {
        egfrMin: 15,
        egfrMax: 50,
        recommendation:
          "eGFR 15–49: nhiều chỉ định cần giảm liều.",
      },
      {
        egfrMax: 15,
        recommendation:
          "eGFR <15: thường không khuyến cáo dùng.",
      },
    ],
  },

  // 7
  {
    id: "warfarin",
    name: "Warfarin",
    aliases: ["Coumadin"],
    group: "Chống đông",
    typicalDose: "Liều theo INR",
    notes:
      "Không có quy tắc chỉnh liều cứng theo eGFR; chỉnh liều theo INR, tương tác thuốc và nguy cơ chảy máu.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: chỉnh liều theo INR.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: thận trọng, nguy cơ dao động INR cao hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: rất thận trọng; cần theo dõi INR sát.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: nguy cơ chảy máu cao; cân nhắc rất kỹ và theo dõi chặt.",
      },
    ],
  },

  // 8
  {
    id: "aspirin",
    name: "Aspirin",
    aliases: ["ASA"],
    group: "Kháng kết tập tiểu cầu",
    typicalDose: "81–325 mg/ngày tuỳ chỉ định",
    notes:
      "Không có quy tắc chỉnh liều cứng theo eGFR, nhưng CKD làm tăng nguy cơ chảy máu và biến cố tiêu hoá.",
  },

  // 9
  {
    id: "clopidogrel",
    name: "Clopidogrel",
    aliases: ["Plavix"],
    group: "Kháng kết tập tiểu cầu",
    typicalDose: "75 mg/ngày",
    notes:
      "Thường không chỉnh liều theo thận; đánh giá nguy cơ chảy máu, chỉ định và phối hợp thuốc.",
  },

  // 10
  {
    id: "ticagrelor",
    name: "Ticagrelor",
    aliases: ["Brilinta"],
    group: "Kháng kết tập tiểu cầu",
    typicalDose: "90 mg x 2 lần/ngày hoặc 60 mg x 2 lần/ngày tuỳ giai đoạn",
    notes:
      "Thường không có quy tắc chỉnh liều cứng theo thận; lưu ý khó thở, chảy máu, tương tác.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: dùng thận trọng.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: rất thận trọng; cân nhắc nguy cơ chảy máu.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường tránh dùng.",
      },
    ],
  },

  // 11
  {
    id: "prasugrel",
    name: "Prasugrel",
    aliases: ["Effient"],
    group: "Kháng kết tập tiểu cầu",
    typicalDose: "10 mg/ngày sau liều nạp theo chỉ định",
    notes:
      "Không có quy tắc chỉnh liều cứng theo thận; lưu ý chống chỉ định/không ưu tiên ở một số nhóm nguy cơ chảy máu.",
  },

  // 12
  {
    id: "atenolol",
    name: "Atenolol",
    aliases: [],
    group: "Beta-blocker",
    typicalDose: "25–100 mg/ngày",
    notes:
      "Thuốc thải trừ qua thận nhiều hơn một số beta-blocker khác.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng liều thường theo đáp ứng.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: cân nhắc giảm liều hoặc tăng khoảng cách theo đáp ứng mạch/huyết áp.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường cần giảm liều rõ hoặc dùng thưa hơn.",
      },
    ],
  },

  // 13
  {
    id: "bisoprolol",
    name: "Bisoprolol",
    aliases: [],
    group: "Beta-blocker",
    typicalDose: "1.25–10 mg/ngày",
    notes:
      "Theo dõi mạch, huyết áp, triệu chứng hạ huyết áp hoặc nhịp chậm.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation: "eGFR ≥60: dùng liều thường.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: thường có thể dùng, nhưng tăng liều chậm.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: cân nhắc khởi đầu thấp hơn và tăng liều thận trọng.",
      },
    ],
  },

  // 14
  {
    id: "carvedilol",
    name: "Carvedilol",
    aliases: [],
    group: "Beta-blocker",
    typicalDose: "3.125–25 mg x 2 lần/ngày",
    notes:
      "Thường không cần chỉnh liều cứng theo thận; ưu tiên khởi đầu thấp và tăng chậm ở suy tim.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: khởi đầu thấp hơn, tăng liều thận trọng.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc giảm liều và theo dõi sát huyết áp/mạch.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường tránh hoặc chỉ dùng khi có chỉ định chuyên khoa.",
      },
    ],
  },

  // 15
  {
    id: "metoprolol-succinate",
    name: "Metoprolol succinate",
    aliases: ["Betaloc ZOK", "Toprol XL"],
    group: "Beta-blocker",
    typicalDose: "12.5–200 mg/ngày",
    notes:
      "Dạng phóng thích kéo dài, hay dùng trong suy tim và tăng huyết áp.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: cân nhắc khởi đầu thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: nên tăng liều chậm và theo dõi sát.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: tránh tăng liều nhanh; cân nhắc dùng thận trọng.",
      },
    ],
  },

  // 16
  {
    id: "metoprolol-tartrate",
    name: "Metoprolol tartrate",
    aliases: ["Lopressor"],
    group: "Beta-blocker",
    typicalDose: "25–100 mg x 2 lần/ngày",
    notes:
      "Dạng tác dụng ngắn hơn metoprolol succinate.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: cân nhắc khởi đầu thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: nên tăng liều chậm và theo dõi sát.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: tránh tăng liều nhanh; cân nhắc dùng thận trọng.",
      },
    ],
  },

  // 17
  {
    id: "nebivolol",
    name: "Nebivolol",
    aliases: [],
    group: "Beta-blocker",
    typicalDose: "2.5–10 mg/ngày",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng liều thường theo đáp ứng.",
      },
      {
        egfrMax: 60,
        recommendation:
          "eGFR <60: cân nhắc khởi đầu liều thấp hơn và tăng chậm.",
      },
    ],
  },

  // 18
  {
    id: "propranolol",
    name: "Propranolol",
    aliases: ["Inderal"],
    group: "Beta-blocker",
    typicalDose: "10–40 mg x 2–3 lần/ngày hoặc tuỳ chỉ định",
    notes:
      "Thường ít phụ thuộc chỉnh liều theo thận hơn atenolol, nhưng chịu ảnh hưởng bởi chuyển hoá gan.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: cân nhắc khởi đầu thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: tăng liều chậm, theo dõi sát mạch/huyết áp.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường cần dùng rất thận trọng hoặc liều thấp.",
      },
    ],
  },

  // 19
  {
    id: "sotalol",
    name: "Sotalol",
    aliases: [],
    group: "Chống loạn nhịp / beta-blocker",
    typicalDose: "Liều thay đổi theo chỉ định",
    notes:
      "Cần rất thận trọng vì kéo dài QT; phụ thuộc đáng kể vào chức năng thận.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng theo chỉ định, nhưng vẫn cần theo dõi QT và điện giải.",
      },
      {
        egfrMin: 40,
        egfrMax: 60,
        recommendation:
          "eGFR 40–59: thường cần kéo dài khoảng cách dùng.",
      },
      {
        egfrMax: 40,
        recommendation:
          "eGFR <40: thường tránh hoặc chỉ dùng theo chỉ định chuyên khoa/monitor sát.",
      },
    ],
  },

  // 20
  {
    id: "amiodarone",
    name: "Amiodarone",
    aliases: [],
    group: "Chống loạn nhịp",
    typicalDose: "Liều nạp và duy trì thay đổi theo chỉ định",
    notes:
      "Thường không cần chỉnh liều theo thận, nhưng có nhiều độc tính ngoài tim và tương tác thuốc.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định, theo dõi men gan định kỳ.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: dùng thận trọng; theo dõi men gan.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc giảm liều/đánh giá lợi ích-nguy cơ kỹ hơn.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: rất thận trọng; tránh nếu có lựa chọn phù hợp hơn.",
      },
    ],
  },

  // 21
  {
    id: "flecainide",
    name: "Flecainide",
    aliases: [],
    group: "Chống loạn nhịp",
    typicalDose: "50–150 mg x 2 lần/ngày",
    notes:
      "Cần theo dõi ECG; không dùng bừa ở bệnh tim cấu trúc.",
    renalRules: [
      {
        egfrMin: 35,
        recommendation:
          "eGFR ≥35: dùng theo chỉ định và theo dõi ECG.",
      },
      {
        egfrMax: 35,
        recommendation:
          "eGFR <35: thường cần giảm liều và theo dõi nồng độ/ECG sát hơn.",
      },
    ],
  },

  // 22
  {
    id: "propafenone",
    name: "Propafenone",
    aliases: [],
    group: "Chống loạn nhịp",
    typicalDose: "150–300 mg x 2–3 lần/ngày",
    notes:
      "Chịu ảnh hưởng bởi chuyển hoá gan; theo dõi ECG và tương tác.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: khởi đầu thấp hơn hoặc tăng liều chậm.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc giảm liều rõ, theo dõi ECG.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường tránh hoặc chỉ dùng theo chuyên khoa.",
      },
    ],
  },

  // 23
  {
    id: "verapamil",
    name: "Verapamil",
    aliases: [],
    group: "Chẹn kênh canxi",
    typicalDose: "80–120 mg x 3 lần/ngày hoặc dạng XR tuỳ chỉ định",
    notes:
      "Lưu ý nhịp chậm, block nhĩ-thất, táo bón và tương tác.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: cân nhắc khởi đầu thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: thường cần giảm liều hoặc tăng chậm.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: dùng rất thận trọng, ưu tiên liều thấp.",
      },
    ],
  },

  // 24
  {
    id: "diltiazem",
    name: "Diltiazem",
    aliases: [],
    group: "Chẹn kênh canxi",
    typicalDose: "120–360 mg/ngày tuỳ dạng bào chế",
    notes:
      "Lưu ý nhịp chậm, block nhĩ-thất và tương tác CYP3A4.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: cân nhắc khởi đầu thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: tăng liều chậm và theo dõi sát mạch/huyết áp.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường cần dùng rất thận trọng.",
      },
    ],
  },

  // 25
  {
    id: "amlodipine",
    name: "Amlodipine",
    aliases: [],
    group: "Chẹn kênh canxi",
    typicalDose: "2.5–10 mg/ngày",
    notes:
      "Thường không cần chỉnh liều theo thận.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo liều thường nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: cân nhắc khởi đầu liều thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: nên khởi đầu thấp và tăng chậm.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: dùng rất thận trọng, ưu tiên liều thấp.",
      },
    ],
  },

  // 26
  {
    id: "nifedipine-xl",
    name: "Nifedipine XL",
    aliases: ["Adalat LA"],
    group: "Chẹn kênh canxi",
    typicalDose: "30–90 mg/ngày",
    notes:
      "Ưu tiên dạng phóng thích kéo dài trong tăng huyết áp/đau thắt ngực mạn.",
  },

  // 27
  {
    id: "lisinopril",
    name: "Lisinopril",
    aliases: [],
    group: "ACEi",
    typicalDose: "5–40 mg/ngày",
    notes:
      "Theo dõi creatinin và kali sau khởi trị hoặc tăng liều.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: có thể dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: khởi đầu thấp hơn và tăng liều thận trọng; theo dõi creatinin/kali.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường khởi đầu thấp và theo dõi rất sát kali, creatinin và huyết áp.",
      },
    ],
  },

  // 28
  {
    id: "enalapril",
    name: "Enalapril",
    aliases: [],
    group: "ACEi",
    typicalDose: "2.5–20 mg x 1–2 lần/ngày",
    notes:
      "Theo dõi creatinin và kali sau khởi trị hoặc tăng liều.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: có thể dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: khởi đầu thấp hơn và tăng liều thận trọng.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường khởi đầu thấp và theo dõi rất sát kali, creatinin và huyết áp.",
      },
    ],
  },

  // 29
  {
    id: "ramipril",
    name: "Ramipril",
    aliases: [],
    group: "ACEi",
    typicalDose: "1.25–10 mg/ngày",
    notes:
      "Theo dõi creatinin và kali sau khởi trị hoặc tăng liều.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: có thể dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: khởi đầu thấp hơn và tăng liều thận trọng.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường khởi đầu thấp và theo dõi rất sát kali, creatinin và huyết áp.",
      },
    ],
  },

  // 30
  {
    id: "captopril",
    name: "Captopril",
    aliases: [],
    group: "ACEi",
    typicalDose: "12.5–50 mg x 2–3 lần/ngày",
    notes:
      "Theo dõi creatinin và kali; thuốc tác dụng ngắn hơn các ACEi khác.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: có thể dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: khởi đầu thấp hơn và tăng liều thận trọng.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường khởi đầu thấp và theo dõi sát.",
      },
    ],
  },

  // 31
  {
    id: "losartan",
    name: "Losartan",
    aliases: [],
    group: "ARB",
    typicalDose: "25–100 mg/ngày",
    notes:
      "Theo dõi kali và creatinin; có lợi điểm trên albumin niệu ở bệnh nhân phù hợp.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: có thể dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: khởi đầu thấp hơn và tăng liều thận trọng; theo dõi creatinin/kali.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường khởi đầu thấp và theo dõi rất sát kali, creatinin và huyết áp.",
      },
    ],
  },

  // 32
  {
    id: "valsartan",
    name: "Valsartan",
    aliases: [],
    group: "ARB",
    typicalDose: "40–320 mg/ngày",
    notes:
      "Theo dõi kali và creatinin; liều thay đổi theo suy tim hay tăng huyết áp.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng theo liều của chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: khởi đầu thấp hoặc tăng liều chậm hơn, theo dõi kali/creatinin.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: rất thận trọng; khởi đầu thấp và theo dõi sát.",
      },
    ],
  },

  // 33
  {
    id: "candesartan",
    name: "Candesartan",
    aliases: [],
    group: "ARB",
    typicalDose: "4–32 mg/ngày",
    notes:
      "Theo dõi kali và creatinin sau khởi trị hoặc tăng liều.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation: "eGFR ≥60: dùng theo liều thường nếu phù hợp.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation: "eGFR 30–59: cân nhắc khởi đầu thấp hơn và tăng chậm.",
      },
      {
        egfrMax: 30,
        recommendation: "eGFR <30: khởi đầu thấp và theo dõi rất sát kali, creatinin và huyết áp.",
      },
    ],
  },

  // 34
  {
    id: "telmisartan",
    name: "Telmisartan",
    aliases: [],
    group: "ARB",
    typicalDose: "20–80 mg/ngày",
    notes:
      "Theo dõi kali và creatinin; thường không có chỉnh liều cứng theo thận nhưng cần khởi đầu thận trọng ở CKD nặng.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng theo liều thường nếu phù hợp.",
      },
      {
        egfrMax: 60,
        recommendation:
          "CKD mức trung bình-nặng: cân nhắc khởi đầu thận trọng và theo dõi creatinin/kali.",
      },
    ],
  },

  // 35
  {
    id: "sacubitril-valsartan",
    name: "Sacubitril/Valsartan",
    aliases: ["Entresto", "ARNI"],
    group: "ARNI",
    typicalDose: "24/26 mg đến 97/103 mg x 2 lần/ngày",
    notes:
      "Thuốc cốt lõi trong suy tim HFrEF ở bệnh nhân phù hợp; theo dõi huyết áp, kali và creatinin.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng theo liều khởi đầu thích hợp với bệnh cảnh.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: cân nhắc khởi đầu liều thấp hơn và tăng chậm.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường khởi đầu liều thấp nhất và theo dõi rất sát huyết áp, kali, creatinin.",
      },
    ],
  },

  // 36
  {
    id: "spironolactone",
    name: "Spironolactone",
    aliases: ["Aldactone"],
    group: "Lợi tiểu giữ kali / MRA",
    typicalDose: "12.5–50 mg/ngày tuỳ chỉ định",
    notes:
      "Nguy cơ tăng kali máu tăng rõ ở CKD; cần theo dõi kali và creatinin.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: có thể dùng nếu phù hợp, theo dõi kali.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: dùng rất thận trọng, thường khởi đầu thấp và theo dõi kali sát.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường tránh hoặc chỉ dùng khi có chỉ định chuyên khoa và theo dõi sát.",
      },
    ],
  },

  // 37
  {
    id: "eplerenone",
    name: "Eplerenone",
    aliases: ["Inspra"],
    group: "Lợi tiểu giữ kali / MRA",
    typicalDose: "25–50 mg/ngày",
    notes:
      "Theo dõi kali và creatinin; nguy cơ tăng kali máu tăng ở CKD.",
    renalRules: [
      {
        egfrMin: 50,
        recommendation:
          "eGFR ≥50: có thể dùng theo chỉ định, theo dõi kali sát.",
      },
      {
        egfrMin: 30,
        egfrMax: 50,
        recommendation:
          "eGFR 30–49: rất thận trọng; nhiều trường hợp cần khởi đầu liều thấp hơn hoặc dùng cách ngày.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: thường tránh dùng.",
      },
    ],
  },

  // 38
  {
    id: "furosemide",
    name: "Furosemide",
    aliases: ["Lasix"],
    group: "Lợi tiểu quai",
    typicalDose: "20–80 mg/lần, liều rất thay đổi theo bệnh cảnh",
    notes:
      "Suy thận có thể cần liều cao hơn để đạt hiệu quả lợi tiểu; chỉnh theo đáp ứng lâm sàng và điện giải.",
    renalRules: [
      {
        egfrMin: 0,
        recommendation:
          "Không có quy tắc giảm liều cứng; liều thường được chỉnh theo đáp ứng lâm sàng, nước tiểu và điện giải.",
      },
    ],
  },

  // 39
  {
    id: "torsemide",
    name: "Torsemide",
    aliases: [],
    group: "Lợi tiểu quai",
    typicalDose: "5–100 mg/ngày tuỳ bệnh cảnh",
    notes:
      "Tương tự furosemide, chỉnh theo đáp ứng lợi tiểu và điện giải.",
    renalRules: [
      {
        egfrMin: 0,
        recommendation:
          "Không có quy tắc giảm liều cứng; chỉnh liều theo đáp ứng lâm sàng và điện giải.",
      },
    ],
  },

  // 40
  {
    id: "bumetanide",
    name: "Bumetanide",
    aliases: [],
    group: "Lợi tiểu quai",
    typicalDose: "0.5–2 mg/lần, tuỳ bệnh cảnh",
    notes:
      "Chỉnh theo đáp ứng lợi tiểu và điện giải, không theo eGFR đơn thuần.",
    renalRules: [
      {
        egfrMin: 0,
        recommendation:
          "Không có quy tắc giảm liều cứng; chỉnh liều theo đáp ứng lâm sàng và điện giải.",
      },
    ],
  },

  // 41
  {
    id: "hydrochlorothiazide",
    name: "Hydrochlorothiazide",
    aliases: ["HCTZ"],
    group: "Thiazide",
    typicalDose: "12.5–25 mg/ngày",
    notes:
      "Hiệu quả giảm khi CKD nặng hơn; theo dõi natri, kali, acid uric.",
    renalRules: [
      {
        egfrMin: 30,
        recommendation:
          "eGFR ≥30: có thể dùng theo chỉ định nếu phù hợp.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: hiệu quả lợi tiểu thường giảm; cân nhắc đổi chiến lược lợi tiểu.",
      },
    ],
  },

  // 42
  {
    id: "chlorthalidone",
    name: "Chlorthalidone",
    aliases: [],
    group: "Thiazide-like",
    typicalDose: "12.5–25 mg/ngày",
    notes:
      "Theo dõi natri, kali và huyết áp; có thể vẫn hữu ích ở một số bệnh nhân CKD chọn lọc.",
    renalRules: [
      {
        egfrMin: 30,
        recommendation:
          "eGFR ≥30: có thể dùng theo chỉ định nếu phù hợp.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: cân nhắc kỹ, theo dõi điện giải rất sát nếu dùng.",
      },
    ],
  },

  // 43
  {
    id: "indapamide",
    name: "Indapamide",
    aliases: [],
    group: "Thiazide-like",
    typicalDose: "1.25–2.5 mg/ngày",
    notes:
      "Theo dõi natri, kali, huyết áp; hiệu quả phụ thuộc bệnh cảnh và mức CKD.",
    renalRules: [
      {
        egfrMin: 30,
        recommendation:
          "eGFR ≥30: có thể dùng theo chỉ định nếu phù hợp.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: hiệu quả giảm và cần thận trọng hơn; theo dõi điện giải sát.",
      },
    ],
  },

  // 44
  {
    id: "hydralazine",
    name: "Hydralazine",
    aliases: [],
    group: "Giãn mạch",
    typicalDose: "10–100 mg x 2–4 lần/ngày",
    notes:
      "Hay dùng phối hợp nitrate trong một số bệnh cảnh suy tim; theo dõi huyết áp, nhịp tim, đau đầu.",
  },

  // 45
  {
    id: "isosorbide-mononitrate",
    name: "Isosorbide mononitrate",
    aliases: [],
    group: "Nitrate",
    typicalDose: "30–120 mg/ngày tuỳ dạng bào chế",
    notes:
      "Lưu ý khoảng nghỉ nitrate và tương tác với thuốc ức chế PDE5.",
  },

  // 46
  {
    id: "nitroglycerin",
    name: "Nitroglycerin",
    aliases: ["Glyceryl trinitrate", "NTG"],
    group: "Nitrate",
    typicalDose: "Ngậm dưới lưỡi hoặc truyền/patch tuỳ chỉ định",
    notes:
      "Lưu ý huyết áp, đau đầu, và chống chỉ định tương đối với thuốc ức chế PDE5.",
  },

  // 47
  {
    id: "ivabradine",
    name: "Ivabradine",
    aliases: ["Coralan"],
    group: "Suy tim",
    typicalDose: "2.5–7.5 mg x 2 lần/ngày",
    notes:
      "Chỉ phù hợp ở một số bệnh nhân suy tim chọn lọc; theo dõi nhịp tim và rung nhĩ.",
    renalRules: [
      {
        egfrMin: 15,
        recommendation:
          "eGFR ≥15: thường có thể dùng theo chỉ định nếu phù hợp.",
      },
      {
        egfrMax: 15,
        recommendation:
          "eGFR <15: dữ liệu hạn chế; dùng rất thận trọng.",
      },
    ],
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: dùng thận trọng.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc kỹ và theo dõi sát.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: không khuyến cáo dùng.",
      },
    ],
  },

  // 48
  {
    id: "rosuvastatin",
    name: "Rosuvastatin",
    aliases: ["Crestor"],
    group: "Statin",
    typicalDose: "5–40 mg/ngày",
    notes:
      "Suy thận nặng làm tăng nồng độ thuốc; lưu ý đau cơ/CK.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: cân nhắc bắt đầu liều thấp hơn nếu có nguy cơ tác dụng phụ.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: khởi đầu liều thấp; tránh đẩy nhanh lên liều cao nếu không cần thiết.",
      },
    ],
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định và theo dõi nếu có nguy cơ.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: dùng thận trọng, theo dõi men gan nếu cần.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc liều thấp hơn và theo dõi sát hơn.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường tránh hoặc chỉ dùng khi có chỉ định rõ và theo dõi sát.",
      },
    ],
  },

  // 49
  {
    id: "atorvastatin",
    name: "Atorvastatin",
    aliases: ["Lipitor"],
    group: "Statin",
    typicalDose: "10–80 mg/ngày",
    notes:
      "Thường không cần chỉnh liều theo thận; theo dõi đau cơ/men gan nếu phù hợp.",
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: dùng thận trọng, cân nhắc liều khởi đầu thấp hơn.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc kỹ, theo dõi men gan sát hơn.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường tránh hoặc chỉ dùng khi có chỉ định rõ.",
      },
    ],
  },

  // 50
  {
    id: "pravastatin",
    name: "Pravastatin",
    aliases: ["Pravachol"],
    group: "Statin",
    typicalDose: "10–40 mg/ngày",
    notes:
      "Một trong các statin có hồ sơ tương tác gan/CYP khác hơn một số statin khác; vẫn cần theo dõi CK nếu có triệu chứng.",
    renalRules: [
      {
        egfrMin: 60,
        recommendation:
          "eGFR ≥60: dùng liều thường theo chỉ định.",
      },
      {
        egfrMin: 30,
        egfrMax: 60,
        recommendation:
          "eGFR 30–59: cân nhắc khởi đầu liều thấp hơn nếu có nguy cơ tác dụng phụ.",
      },
      {
        egfrMax: 30,
        recommendation:
          "eGFR <30: khởi đầu liều thấp và tăng chậm.",
      },
    ],
    hepaticRules: [
      {
        childPugh: "None",
        recommendation:
          "Không bệnh gan rõ: dùng theo chỉ định nếu phù hợp.",
      },
      {
        childPugh: "Child-Pugh A",
        recommendation:
          "Child-Pugh A: dùng thận trọng.",
      },
      {
        childPugh: "Child-Pugh B",
        recommendation:
          "Child-Pugh B: cân nhắc liều thấp hơn và theo dõi men gan.",
      },
      {
        childPugh: "Child-Pugh C",
        recommendation:
          "Child-Pugh C: thường tránh hoặc chỉ dùng khi có chỉ định rõ.",
      },
    ],
  },
];