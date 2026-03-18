// src/data/tools.ts

export interface Tool {
  id: string; // cũng là slug nội bộ
  name: string;
  description: string;
  route: string; // đường dẫn điều hướng
  isQuick?: boolean; // gợi ý công cụ thường dùng
  icon?: string; // icon hiển thị trên card
}

export interface Specialty {
  id: string;
  name: string;
  tools: Tool[];
}

export const specialties: Specialty[] = [
  // =========================
  // GIA ĐÌNH – XÃ HỘI
  // =========================
  {
    id: "family",
    name: "Gia đình – xã hội",
    tools: [
      {
        id: "family-apgar",
        name: "Family APGAR",
        description: "Đánh giá chức năng gia đình",
        route: "/tools/family-apgar",
        isQuick: true,
        icon: "👨‍👩‍👧",
      },
      {
        id: "screem",
        name: "SCREEM",
        description: "Đánh giá nguồn lực gia đình",
        route: "/tools/screem",
        icon: "🏡",
      },
      {
        id: "phq9",
        name: "PHQ-9",
        description: "Sàng lọc và phân tầng mức độ trầm cảm",
        route: "/tools/phq9",
        isQuick: true,
        icon: "📝",
      },
      {
        id: "gad7",
        name: "GAD-7",
        description: "Sàng lọc và phân tầng lo âu",
        route: "/tools/gad7",
        icon: "📋",
      },
      {
        id: "audit-c",
        name: "AUDIT-C",
        description: "Sàng lọc sử dụng rượu nguy cơ",
        route: "/tools/audit-c",
        icon: "🍺",
      },
      {
        id: "pedigree",
        name: "Cây phả hệ (Family Pedigree)",
        description: "Nhập gia sử sức khoẻ 3 thế hệ và vẽ cây phả hệ",
        route: "/tools/pedigree",
        icon: "🌳",
      },
    ],
  },

  // =========================
  // LÃO KHOA
  // =========================
  {
    id: "geriatrics",
    name: "Lão khoa",
    tools: [
      {
        id: "katz-adl",
        name: "Katz ADL",
        description: "Đánh giá chức năng cơ bản",
        route: "/calculators/katz-adl",
        isQuick: true,
        icon: "🧍",
      },
      {
        id: "lawton-iadl",
        name: "Lawton IADL",
        description: "Đánh giá chức năng sống dụng cụ",
        route: "/calculators/lawton-iadl",
        icon: "🗂️",
      },
      {
        id: "gait-speed",
        name: "Tốc độ đi bộ",
        description: "Đánh giá vận động",
        route: "/calculators/gait-speed",
        icon: "🚶",
      },
      {
        id: "grip-strength",
        name: "Sức nắm tay",
        description: "Đánh giá sức cơ",
        route: "/calculators/grip-strength",
        icon: "✊",
      },
      {
        id: "mmse",
        name: "MMSE",
        description: "Đánh giá nhận thức",
        route: "/calculators/mmse",
        icon: "🧠",
      },
      {
        id: "moca",
        name: "MoCA",
        description: "Đánh giá nhận thức",
        route: "/calculators/moca",
        icon: "🧩",
      },
    ],
  },

  // =========================
  // THẬN – TIẾT NIỆU
  // =========================
  {
    id: "nephrology",
    name: "Thận – tiết niệu",
    tools: [
      {
        id: "egfr",
        name: "eGFR – CKD-EPI 2021",
        description: "Tính mức lọc cầu thận theo creatinin",
        route: "/tools/egfr",
        isQuick: true,
        icon: "🧮",
      },
      {
        id: "cockcroft-gault",
        name: "ClCr – Cockcroft–Gault",
        description: "Ước tính độ thanh thải creatinin",
        route: "/tools/cockcroft-gault",
        icon: "📏",
      },
      {
        id: "aki-kdigo",
        name: "Phân độ AKI – KDIGO",
        description: "Phân độ tổn thương thận cấp theo KDIGO",
        route: "/tools/aki-kdigo",
        icon: "🚨",
      },
      {
        id: "fena",
        name: "FENa",
        description: "Fractional excretion of sodium",
        route: "/tools/fena",
        icon: "🧂",
      },
      {
        id: "feurea",
        name: "FEUrea",
        description: "Fractional excretion of urea",
        route: "/tools/feurea",
        icon: "🧪",
      },
      {
        id: "dose-adjust",
        name: "Điều chỉnh liều thuốc",
        description: "Gợi ý chỉnh liều theo thận và gan",
        route: "/dose-adjust",
        isQuick: true,
        icon: "💊",
      },
    ],
  },

  // =========================
  // TIM MẠCH
  // =========================
  {
    id: "cardiology",
    name: "Tim mạch",
    tools: [
      {
        id: "score2",
        name: "SCORE2",
        description: "Ước tính nguy cơ tim mạch 10 năm",
        route: "/tools/score2",
        isQuick: true,
        icon: "📈",
      },
      {
        id: "score2-op",
        name: "SCORE2-OP",
        description: "Ước tính nguy cơ tim mạch ở người cao tuổi",
        route: "/tools/score2-op",
        icon: "📊",
      },
      {
        id: "score2-asian",
        name: "SCORE2-ASIAN",
        description: "Phiên bản hiệu chỉnh cho quần thể châu Á",
        route: "/tools/score2-asian",
        icon: "🌏",
      },
      {
        id: "score2-diabetes",
        name: "SCORE2-DIABETES",
        description: "Ước tính nguy cơ tim mạch ở bệnh nhân đái tháo đường",
        route: "/tools/score2-diabetes",
        icon: "🩸",
      },
      {
        id: "cv-risk-esc",
        name: "Phân tầng nguy cơ tim mạch (ESC/EAS)",
        description: "Phân tầng nguy cơ tim mạch theo khuyến cáo",
        route: "/tools/cv-risk-esc",
        isQuick: true,
        icon: "📋",
      },
      {
        id: "who-pen-hearts",
        name: "WHO PEN/HEARTS",
        description: "Ước tính nguy cơ tim mạch 10 năm tuyến cơ sở",
        route: "/tools/who-pen-hearts",
        isQuick: true,
        icon: "🌍",
      },
      {
        id: "cha2ds2-vasc",
        name: "CHA₂DS₂-VASc",
        description: "Nguy cơ đột quỵ ở rung nhĩ",
        route: "/tools/cha2ds2-vasc",
        isQuick: true,
        icon: "🫀",
      },
      {
        id: "has-bled",
        name: "HAS-BLED",
        description: "Nguy cơ chảy máu khi dùng kháng đông",
        route: "/tools/has-bled",
        icon: "🩸",
      },
      {
        id: "ascvd-10y",
        name: "ASCVD 10-year",
        description: "Nguy cơ ASCVD 10 năm",
        route: "/tools/ascvd-10y",
        icon: "📉",
      },
      {
        id: "qtc",
        name: "QTc (Bazett/Fridericia)",
        description: "Tính QTc từ QT và nhịp tim",
        route: "/tools/qtc",
        icon: "📐",
      },
    ],
  },

  // =========================
  // HÔ HẤP
  // =========================
  {
    id: "respiratory",
    name: "Hô hấp",
    tools: [
      {
        id: "centor",
        name: "Centor / McIsaac",
        description: "Phân tầng viêm họng do liên cầu",
        route: "/tools/centor",
        isQuick: true,
        icon: "📝",
      },
      {
        id: "curb65",
        name: "CURB-65",
        description: "Đánh giá mức độ nặng viêm phổi cộng đồng",
        route: "/tools/curb65",
        isQuick: true,
        icon: "🫁",
      },
      {
        id: "wells-pe",
        name: "Wells – Thuyên tắc phổi",
        description: "Đánh giá khả năng thuyên tắc phổi",
        route: "/tools/wells-pe",
        icon: "📊",
      },
      {
        id: "wells-dvt",
        name: "Wells – Huyết khối TM sâu",
        description: "Đánh giá khả năng huyết khối tĩnh mạch sâu",
        route: "/tools/wells-dvt",
        icon: "🦵",
      },
      {
        id: "perc",
        name: "PERC Rule",
        description: "Loại trừ thuyên tắc phổi nguy cơ thấp",
        route: "/tools/perc",
        icon: "✅",
      },
    ],
  },

  // =========================
  // GIẤC NGỦ
  // =========================
  {
    id: "sleep",
    name: "Giấc ngủ",
    tools: [
      {
        id: "isi",
        name: "ISI – Mất ngủ",
        description: "Insomnia Severity Index",
        route: "/tools/isi",
        isQuick: true,
        icon: "🌙",
      },
      {
        id: "stop-bang",
        name: "STOP-Bang",
        description: "Sàng lọc nguy cơ ngưng thở khi ngủ",
        route: "/tools/stop-bang",
        icon: "😴",
      },
      {
        id: "epworth",
        name: "Epworth Sleepiness Scale",
        description: "Đánh giá buồn ngủ ban ngày",
        route: "/tools/epworth",
        icon: "💤",
      },
    ],
  },

  // =========================
  // NỘI TIẾT
  // =========================
  {
    id: "endocrine",
    name: "Nội tiết",
    tools: [
      {
        id: "bmi",
        name: "BMI (Châu Á)",
        description: "Tính BMI và phân loại theo ngưỡng châu Á",
        route: "/tools/bmi",
        isQuick: true,
        icon: "⚖️",
      },
      {
        id: "bsa",
        name: "BSA (Mosteller)",
        description: "Tính diện tích da cơ thể",
        route: "/tools/bsa",
        icon: "📐",
      },
      {
        id: "hba1c-eag",
        name: "HbA1c → eAG",
        description: "Quy đổi HbA1c sang đường huyết trung bình",
        route: "/tools/hba1c-eag",
        icon: "🧮",
      },
      {
        id: "corrected-calcium",
        name: "Calci hiệu chỉnh",
        description: "Tính calci hiệu chỉnh theo albumin",
        route: "/tools/corrected-calcium",
        icon: "🦴",
      },
    ],
  },

  // =========================
  // TIÊU HOÁ
  // =========================
  {
    id: "gastro",
    name: "Tiêu hoá",
    tools: [
      {
        id: "child-pugh",
        name: "Child–Pugh",
        description: "Đánh giá mức độ xơ gan và chức năng gan",
        route: "/tools/child-pugh",
        isQuick: true,
        icon: "🧮",
      },
      {
        id: "meld-na",
        name: "MELD-Na",
        description: "Đánh giá tiên lượng bệnh gan mạn",
        route: "/tools/meld-na",
        icon: "🧪",
      },
      {
        id: "fib-4",
        name: "FIB-4",
        description: "Sàng lọc xơ hoá gan",
        route: "/tools/fib-4",
        icon: "📉",
      },
      {
        id: "apri",
        name: "APRI",
        description: "Sàng lọc xơ hoá gan",
        route: "/tools/apri",
        icon: "📋",
      },
      {
        id: "gbs",
        name: "Glasgow–Blatchford Score",
        description: "Phân tầng xuất huyết tiêu hoá trên",
        route: "/tools/gbs",
        icon: "🩸",
      },
      {
        id: "bisap",
        name: "BISAP",
        description: "Đánh giá mức độ nặng viêm tuỵ cấp",
        route: "/tools/bisap",
        icon: "🔥",
      },
    ],
  },

  // =========================
  // TRUYỀN NHIỄM
  // =========================
  {
    id: "infectious",
    name: "Truyền nhiễm",
    tools: [
      {
        id: "qsofa",
        name: "qSOFA",
        description: "Sàng lọc nguy cơ sepsis nhanh tại giường",
        route: "/tools/qsofa",
        isQuick: true,
        icon: "🦠",
      },
      {
        id: "sirs",
        name: "SIRS",
        description: "Tiêu chuẩn phản ứng viêm hệ thống",
        route: "/tools/sirs",
        icon: "🌡️",
      },
      {
        id: "news2",
        name: "NEWS2",
        description: "Early warning score",
        route: "/tools/news2",
        icon: "🚑",
      },
    ],
  },

  // =========================
  // THẦN KINH
  // =========================
  {
    id: "neuro",
    name: "Thần kinh",
    tools: [
      {
        id: "gcs",
        name: "Glasgow Coma Scale (GCS)",
        description: "Đánh giá tri giác",
        route: "/tools/gcs",
        icon: "🧠",
      },
      {
        id: "abcd2",
        name: "ABCD²",
        description: "Nguy cơ đột quỵ sau TIA",
        route: "/tools/abcd2",
        icon: "⚡",
      },
      {
        id: "nihss",
        name: "NIHSS",
        description: "Đánh giá mức độ đột quỵ cấp",
        route: "/tools/nihss",
        icon: "📋",
      },
    ],
  },
];

export const allTools: Tool[] = specialties.flatMap((s) => s.tools);