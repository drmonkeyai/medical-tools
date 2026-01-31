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
    ],
  },

  {
    id: "cardiology",
    name: "Tim mạch",
    tools: [
      {
        id: "score2",
        name: "SCORE2",
        description: "Ước tính nguy cơ tim mạch 10 năm (40–69 tuổi) — mặc định nguy cơ cao",
        route: "/tools/score2",
        isQuick: true,
      },
      {
        id: "score2-op",
        name: "SCORE2-OP",
        description: "Ước tính nguy cơ tim mạch cho người ≥70 tuổi — mặc định nguy cơ cao",
        route: "/tools/score2-op",
      },
      {
        id: "score2-asian",
        name: "SCORE2-ASIAN",
        description: "Phiên bản hiệu chỉnh cho quần thể châu Á — mặc định nguy cơ cao",
        route: "/tools/score2-asian",
      },
      {
        id: "score2-diabetes",
        name: "SCORE2-DIABETES",
        description: "Ước tính nguy cơ tim mạch cho bệnh nhân đái tháo đường",
        route: "/tools/score2-diabetes",
      },
    ],
  },

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
    ],
  },

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
    ],
  },

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
      id: "pedigree",
      name: "Cây phả hệ (Family Pedigree)",
      description: "Nhập gia sử sức khoẻ (3 thế hệ) và tự vẽ cây phả hệ để tham khảo",
      route: "/tools/pedigree",
      isQuick: false,
      }

    ],
  },

  // Các chuyên khoa chưa có tool (để sẵn)
  { id: "endocrine", name: "Nội tiết", tools: [] },
  { id: "gastro", name: "Tiêu hoá", tools: [] },
  { id: "infectious", name: "Truyền nhiễm", tools: [] },
  { id: "neuro", name: "Thần kinh", tools: [] },
];
