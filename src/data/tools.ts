// src/data/tools.ts

export interface Tool {
  id: string;
  name: string;
  description: string;
  route: string;
  isQuick?: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  tools: Tool[];
}

export const specialties: Specialty[] = [
  // =========================
  // GIA ĐÌNH – XÃ HỘI (đưa lên đầu)
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
      },
      {
        id: "screem",
        name: "SCREEM",
        description: "Đánh giá nguồn lực gia đình",
        route: "/tools/screem",
      },
      {
        id: "phq9",
        name: "PHQ-9",
        description:
          "Sàng lọc/trợ giúp phân tầng mức độ trầm cảm (placeholder – sẽ bổ sung sau)",
        route: "/tools/phq9",
        isQuick: true,
      },
      {
        id: "gad7",
        name: "GAD-7",
        description:
          "Sàng lọc/trợ giúp phân tầng lo âu (placeholder – sẽ bổ sung sau)",
        route: "/tools/gad7",
      },
      {
        id: "audit-c",
        name: "AUDIT-C",
        description:
          "Sàng lọc sử dụng rượu nguy cơ (placeholder – sẽ bổ sung sau)",
        route: "/tools/audit-c",
      },
      {
        id: "pedigree",
        name: "Cây phả hệ (Family Pedigree)",
        description:
          "Nhập gia sử sức khoẻ (3 thế hệ) và tự vẽ cây phả hệ để tham khảo",
        route: "/tools/pedigree",
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
        description: "Tính mức lọc cầu thận theo CKD-EPI 2021 (creatinin)",
        route: "/tools/egfr",
        isQuick: true,
      },
      {
        id: "cockcroft-gault",
        name: "ClCr – Cockcroft–Gault",
        description: "Ước tính độ thanh thải creatinin (phục vụ chỉnh liều)",
        route: "/tools/cockcroft-gault",
      },
      {
        id: "aki-kdigo",
        name: "Phân độ AKI – KDIGO",
        description: "Phân độ tổn thương thận cấp theo KDIGO (SCR/niệu lượng)",
        route: "/tools/aki-kdigo",
      },
      {
        id: "fena",
        name: "FENa",
        description:
          "Fractional Excretion of Sodium (phân biệt nguyên nhân AKI)",
        route: "/tools/fena",
      },
      {
        id: "feurea",
        name: "FEUrea",
        description:
          "Fractional Excretion of Urea (hữu ích khi dùng lợi tiểu)",
        route: "/tools/feurea",
      },
      {
        id: "dose-adjust",
        name: "Điều chỉnh liều thuốc",
        description: "Gợi ý chỉnh liều theo eGFR (thận) và Child-Pugh (gan)",
        route: "/dose-adjust",
        isQuick: true,
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
        description:
          "Ước tính nguy cơ tim mạch 10 năm (40–69 tuổi) — mặc định nguy cơ cao",
        route: "/tools/score2",
        isQuick: true,
      },
      {
        id: "score2-op",
        name: "SCORE2-OP",
        description:
          "Ước tính nguy cơ tim mạch cho người ≥70 tuổi — mặc định nguy cơ cao",
        route: "/tools/score2-op",
      },
      {
        id: "score2-asian",
        name: "SCORE2-ASIAN",
        description:
          "Phiên bản hiệu chỉnh cho quần thể châu Á — mặc định nguy cơ cao",
        route: "/tools/score2-asian",
      },
      {
        id: "score2-diabetes",
        name: "SCORE2-DIABETES",
        description: "Ước tính nguy cơ tim mạch cho bệnh nhân đái tháo đường",
        route: "/tools/score2-diabetes",
      },
      {
        id: "cha2ds2-vasc",
        name: "CHA₂DS₂-VASc",
        description:
          "Đánh giá nguy cơ đột quỵ ở rung nhĩ (gợi ý chỉ định kháng đông)",
        route: "/tools/cha2ds2-vasc",
        isQuick: true,
      },
      {
        id: "has-bled",
        name: "HAS-BLED",
        description:
          "Đánh giá nguy cơ chảy máu ở bệnh nhân rung nhĩ dùng kháng đông",
        route: "/tools/has-bled",
      },
      {
        id: "ascvd-10y",
        name: "ASCVD 10-year (Pooled Cohort)",
        description: "Nguy cơ ASCVD 10 năm (placeholder – sẽ bổ sung sau)",
        route: "/tools/ascvd-10y",
      },
      {
        id: "qtc",
        name: "QTc (Bazett/Fridericia)",
        description: "Tính QTc từ QT và nhịp tim (placeholder – sẽ bổ sung sau)",
        route: "/tools/qtc",
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
      },
      {
        id: "curb65",
        name: "CURB-65",
        description:
          "Đánh giá mức độ nặng viêm phổi cộng đồng (gợi ý nơi điều trị)",
        route: "/tools/curb65",
        isQuick: true,
      },
      {
        id: "wells-pe",
        name: "Wells – Thuyên tắc phổi",
        description: "Đánh giá khả năng PE (placeholder – sẽ bổ sung sau)",
        route: "/tools/wells-pe",
      },
      {
        id: "wells-dvt",
        name: "Wells – Huyết khối TM sâu",
        description: "Đánh giá khả năng DVT (placeholder – sẽ bổ sung sau)",
        route: "/tools/wells-dvt",
      },
      {
        id: "perc",
        name: "PERC Rule",
        description: "Loại trừ PE nguy cơ thấp (placeholder – sẽ bổ sung sau)",
        route: "/tools/perc",
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
        description: "Insomnia Severity Index (7 câu)",
        route: "/tools/isi",
        isQuick: true,
      },
      {
        id: "stop-bang",
        name: "STOP-Bang",
        description: "Sàng lọc nguy cơ OSA (placeholder – sẽ bổ sung sau)",
        route: "/tools/stop-bang",
      },
      {
        id: "epworth",
        name: "Epworth Sleepiness Scale",
        description: "Thang buồn ngủ ban ngày (placeholder – sẽ bổ sung sau)",
        route: "/tools/epworth",
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
        description: "Tính BMI và phân loại theo ngưỡng người Châu Á",
        route: "/tools/bmi",
        isQuick: true,
      },
      {
        id: "bsa",
        name: "BSA (Mosteller)",
        description: "Diện tích da cơ thể (placeholder – sẽ bổ sung sau)",
        route: "/tools/bsa",
      },
      {
        id: "hba1c-eag",
        name: "HbA1c → eAG",
        description:
          "Quy đổi HbA1c sang đường huyết trung bình ước tính (placeholder – sẽ bổ sung sau)",
        route: "/tools/hba1c-eag",
      },
      {
        id: "corrected-calcium",
        name: "Calci hiệu chỉnh theo albumin",
        description: "Tính calci hiệu chỉnh (placeholder – sẽ bổ sung sau)",
        route: "/tools/corrected-calcium",
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
        description: "Đánh giá mức độ xơ gan / chức năng gan",
        route: "/tools/child-pugh",
        isQuick: true,
      },
      {
        id: "meld-na",
        name: "MELD-Na",
        description: "Đánh giá tiên lượng bệnh gan mạn (placeholder – sẽ bổ sung sau)",
        route: "/tools/meld-na",
      },
      {
        id: "fib-4",
        name: "FIB-4",
        description: "Sàng lọc xơ hoá gan (placeholder – sẽ bổ sung sau)",
        route: "/tools/fib-4",
      },
      {
        id: "apri",
        name: "APRI",
        description: "Sàng lọc xơ hoá gan (placeholder – sẽ bổ sung sau)",
        route: "/tools/apri",
      },
      {
        id: "gbs",
        name: "Glasgow–Blatchford Score",
        description: "Phân tầng xuất huyết tiêu hoá trên (placeholder – sẽ bổ sung sau)",
        route: "/tools/gbs",
      },
      {
        id: "bisap",
        name: "BISAP",
        description: "Đánh giá mức độ nặng viêm tuỵ cấp (placeholder – sẽ bổ sung sau)",
        route: "/tools/bisap",
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
        description: "Sàng lọc nguy cơ sepsis (Sepsis-3) — nhanh tại giường",
        route: "/tools/qsofa",
        isQuick: true,
      },
      {
        id: "sirs",
        name: "SIRS",
        description: "Tiêu chuẩn phản ứng viêm hệ thống (placeholder – sẽ bổ sung sau)",
        route: "/tools/sirs",
      },
      {
        id: "news2",
        name: "NEWS2",
        description: "Early warning score (placeholder – sẽ bổ sung sau)",
        route: "/tools/news2",
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
        description: "Đánh giá tri giác (placeholder – sẽ bổ sung sau)",
        route: "/tools/gcs",
      },
      {
        id: "abcd2",
        name: "ABCD²",
        description: "Nguy cơ đột quỵ sau TIA (placeholder – sẽ bổ sung sau)",
        route: "/tools/abcd2",
      },
      {
        id: "nihss",
        name: "NIHSS",
        description: "Đánh giá mức độ đột quỵ cấp (placeholder – sẽ bổ sung sau)",
        route: "/tools/nihss",
      },
    ],
  },
];
