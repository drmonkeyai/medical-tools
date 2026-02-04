// src/data/immunization.ts

export type VaccineCategory =
  | "Trẻ em"
  | "Vị thành niên"
  | "Người lớn"
  | "Thai kỳ"
  | "Người cao tuổi"
  | "Nguy cơ/Ngành nghề"
  | "Du lịch"
  | "Bệnh nền"
  | "Khác";

export type TargetGroup =
  | "Sơ sinh"
  | "Trẻ em"
  | "Vị thành niên"
  | "Người lớn"
  | "Phụ nữ mang thai"
  | "Người cao tuổi"
  | "Nhân viên y tế"
  | "Suy giảm miễn dịch"
  | "Bệnh gan"
  | "Bệnh thận"
  | "ĐTĐ"
  | "Bệnh phổi mạn"
  | "Du lịch";

export type ContraTag =
  | "Phản vệ với liều trước/thành phần"
  | "Dị ứng nặng (gelatin/men/latex...)"
  | "Suy giảm miễn dịch nặng"
  | "Đang mang thai (vắc xin sống)"
  | "Đang sốt cao/nhiễm trùng cấp"
  | "Đang dùng corticoid liều cao/ức chế miễn dịch"
  | "Tiền sử GBS"
  | "Rối loạn đông máu"
  | "Bệnh cấp tính chưa ổn định";

export type IndicationTag =
  | "Tiêm chủng thường quy"
  | "Chưa rõ/không đủ mũi"
  | "Tiếp xúc nguy cơ"
  | "Bệnh nền"
  | "Ngành nghề"
  | "Du lịch"
  | "Trước phẫu thuật/ghép"
  | "Sau phơi nhiễm";

export type VaccineType =
  | "Bất hoạt"
  | "Sống giảm độc lực"
  | "Giải độc tố"
  | "Tái tổ hợp"
  | "mRNA"
  | "Liên hợp"
  | "Khác";

export type ScheduleItem = {
  label: string;
  when: string;
  note?: string;
};

export type ReferenceItem = { title: string; year?: string; note?: string };

export type VaccineEntry = {
  id: string;
  name: string;
  shortName?: string;
  category: VaccineCategory;
  vaccineType: VaccineType;

  targetGroups: TargetGroup[];
  indications: IndicationTag[];
  indicationNotes?: string[];

  contraindications: ContraTag[];
  cautionNotes?: string[];

  schedule?: ScheduleItem[];
  references?: ReferenceItem[];

  keywords?: string[];
};

export type EpiItem = {
  id: string;
  disease: string;
  vaccine: string;
  target: string;
  schedule: string[];
  note?: string;
  source?: string;
};

/**
 * ✅ TIÊM CHỦNG MỞ RỘNG (VN) — tóm tắt theo bảng bạn gửi (HCDC 09/01/2024).
 * Lưu ý: chỉ là “tóm tắt hiển thị”, khi triển khai thực tế bạn có thể bổ sung chi tiết theo quy định.
 */
export const epiVN: EpiItem[] = [
  {
    id: "epi-hepb",
    disease: "Viêm gan vi-rút B",
    vaccine: "Vắc-xin viêm gan B đơn giá / phối hợp có thành phần HepB",
    target: "Trẻ sơ sinh / Trẻ < 1 tuổi",
    schedule: [
      "Liều sơ sinh: tiêm trong vòng 24 giờ sau sinh",
      "Lần 1: khi trẻ đủ 2 tháng tuổi",
      "Lần 2: ít nhất 1 tháng sau lần 1",
      "Lần 3: ít nhất 1 tháng sau lần 2",
    ],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-bcg",
    disease: "Lao",
    vaccine: "Vắc-xin BCG",
    target: "Trẻ < 1 tuổi",
    schedule: ["Tiêm 1 lần cho trẻ trong vòng 1 tháng sau sinh"],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-dtp",
    disease: "Bạch hầu / Ho gà",
    vaccine: "Vắc-xin phối hợp có thành phần bạch hầu/ho gà",
    target: "Trẻ < 1 tuổi; nhắc lại < 2 tuổi",
    schedule: [
      "Lần 1: khi trẻ đủ 2 tháng tuổi",
      "Lần 2: ít nhất 1 tháng sau lần 1",
      "Lần 3: ít nhất 1 tháng sau lần 2",
      "Nhắc lại: khi trẻ đủ 18 tháng tuổi",
    ],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-polio-opv",
    disease: "Bại liệt",
    vaccine: "Vắc-xin bại liệt uống đa giá (OPV)",
    target: "Trẻ < 1 tuổi",
    schedule: [
      "Lần 1: khi trẻ đủ 2 tháng tuổi",
      "Lần 2: ít nhất 1 tháng sau lần 1",
      "Lần 3: ít nhất 1 tháng sau lần 2",
    ],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-polio-ipv",
    disease: "Bại liệt",
    vaccine: "Vắc-xin bại liệt tiêm đa giá (IPV)",
    target: "Trẻ < 1 tuổi",
    schedule: ["Mũi 1: khi trẻ đủ 5 tháng tuổi", "Mũi 2: khi trẻ đủ 9 tháng tuổi"],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-measles",
    disease: "Sởi",
    vaccine: "Vắc-xin sởi đơn giá / phối hợp có chứa thành phần sởi",
    target: "Trẻ < 1 tuổi / < 2 tuổi",
    schedule: ["Sởi đơn giá: khi trẻ đủ 9 tháng tuổi", "Mũi phối hợp: khi trẻ đủ 18 tháng tuổi"],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-hib",
    disease: "Hib (Haemophilus influenzae type b)",
    vaccine: "Hib đơn giá hoặc phối hợp có thành phần Hib",
    target: "Trẻ < 1 tuổi",
    schedule: [
      "Lần 1: khi trẻ đủ 2 tháng tuổi",
      "Lần 2: ít nhất 1 tháng sau lần 1",
      "Lần 3: ít nhất 1 tháng sau lần 2",
    ],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-je",
    disease: "Viêm não Nhật Bản B",
    vaccine: "Vắc-xin viêm não Nhật Bản B",
    target: "Trẻ 1–5 tuổi",
    schedule: [
      "Lần 1: khi trẻ đủ 1 tuổi",
      "Lần 2: 1–2 tuần sau lần 1",
      "Lần 3: 1 năm sau lần 2",
    ],
    source: "HCDC 09/01/2024",
  },
  {
    id: "epi-rubella",
    disease: "Rubella",
    vaccine: "Vắc-xin phối hợp có chứa thành phần rubella",
    target: "Trẻ < 2 tuổi",
    schedule: ["Tiêm khi trẻ đủ 18 tháng tuổi"],
    source: "HCDC 09/01/2024",
  },
];

/**
 * ✅ “TIÊM CHỦNG DỊCH VỤ / KHUYẾN CÁO” — để bác sĩ lọc theo đối tượng / chỉ định / chống chỉ định.
 * Bạn mở rộng dần: chỉ cần thêm object vào mảng vaccines.
 */
export const vaccines: VaccineEntry[] = [
  // 1) Cúm
  {
    id: "flu",
    name: "Cúm mùa (Influenza)",
    shortName: "Flu",
    category: "Người lớn",
    vaccineType: "Bất hoạt",
    targetGroups: [
      "Trẻ em",
      "Người lớn",
      "Người cao tuổi",
      "Phụ nữ mang thai",
      "Nhân viên y tế",
      "Bệnh phổi mạn",
      "ĐTĐ",
    ],
    indications: ["Tiêm chủng thường quy", "Bệnh nền", "Ngành nghề"],
    indicationNotes: ["Khuyến cáo tiêm hằng năm (tuỳ hướng dẫn)."],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Tiền sử GBS: cân nhắc nguy cơ–lợi ích."],
    schedule: [{ label: "Nhắc lại", when: "Hằng năm" }],
    keywords: ["influenza", "cúm", "flu"],
  },

  // 2) COVID-19
  {
    id: "covid19",
    name: "COVID-19",
    shortName: "COVID",
    category: "Người lớn",
    vaccineType: "mRNA",
    targetGroups: [
      "Người lớn",
      "Người cao tuổi",
      "Bệnh phổi mạn",
      "ĐTĐ",
      "Bệnh thận",
      "Suy giảm miễn dịch",
      "Nhân viên y tế",
    ],
    indications: ["Tiêm chủng thường quy", "Bệnh nền", "Ngành nghề", "Chưa rõ/không đủ mũi"],
    indicationNotes: ["Lịch/nhắc lại thay đổi theo khuyến cáo cập nhật."],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Theo dõi phản ứng sau tiêm; chọn loại vắc xin theo hướng dẫn."],
    schedule: [{ label: "Phác đồ/nhắc", when: "Theo khuyến cáo cập nhật" }],
    keywords: ["covid", "sars-cov-2", "mRNA"],
  },

  // 3) HPV
  {
    id: "hpv",
    name: "HPV (Human Papillomavirus)",
    shortName: "HPV",
    category: "Vị thành niên",
    vaccineType: "Tái tổ hợp",
    targetGroups: ["Vị thành niên", "Người lớn"],
    indications: ["Tiêm chủng thường quy", "Chưa rõ/không đủ mũi"],
    indicationNotes: ["Ưu tiên trước khi có hoạt động tình dục; vẫn có lợi ở một số nhóm tuổi."],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Mang thai: thường hoãn (tuỳ hướng dẫn)."],
    schedule: [{ label: "Phác đồ", when: "2–3 mũi tuỳ tuổi/loại" }],
    keywords: ["hpv", "cổ tử cung"],
  },

  // 4) Tdap/Td
  {
    id: "tdap",
    name: "Bạch hầu – Ho gà – Uốn ván (Tdap/Td)",
    shortName: "Tdap/Td",
    category: "Người lớn",
    vaccineType: "Giải độc tố",
    targetGroups: ["Vị thành niên", "Người lớn", "Phụ nữ mang thai", "Nhân viên y tế"],
    indications: ["Tiêm chủng thường quy", "Chưa rõ/không đủ mũi", "Tiếp xúc nguy cơ"],
    indicationNotes: ["Nhắc lại định kỳ; thai kỳ cân nhắc Tdap theo hướng dẫn."],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Tiền sử phản ứng thần kinh nặng sau tiêm: cân nhắc chuyên khoa."],
    schedule: [{ label: "Nhắc lại", when: "Theo khuyến cáo" }],
    keywords: ["uốn ván", "bạch hầu", "ho gà", "tdap", "td"],
  },

  // 5) Phế cầu
  {
    id: "pneumo",
    name: "Phế cầu (Pneumococcal – PCV/PPSV)",
    shortName: "PCV/PPSV",
    category: "Người cao tuổi",
    vaccineType: "Liên hợp",
    targetGroups: ["Trẻ em", "Người cao tuổi", "Bệnh phổi mạn", "ĐTĐ", "Bệnh thận", "Suy giảm miễn dịch"],
    indications: ["Tiêm chủng thường quy", "Bệnh nền"],
    indicationNotes: ["Trẻ em theo chương trình; người cao tuổi/bệnh nền theo khuyến cáo."],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Lịch phụ thuộc tiền sử tiêm và loại vắc xin."],
    schedule: [{ label: "Phác đồ", when: "Theo khuyến cáo (PCV/PPSV tuỳ nhóm)" }],
    keywords: ["phế cầu", "pcv", "ppsv"],
  },

  // 6) Zona
  {
    id: "zoster",
    name: "Zona (Herpes Zoster)",
    shortName: "HZ",
    category: "Người cao tuổi",
    vaccineType: "Tái tổ hợp",
    targetGroups: ["Người cao tuổi", "Suy giảm miễn dịch"],
    indications: ["Tiêm chủng thường quy", "Bệnh nền"],
    indicationNotes: ["Ưu tiên người lớn tuổi; suy giảm miễn dịch cân nhắc theo hướng dẫn."],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Tuổi chỉ định/phác đồ tuỳ hướng dẫn."],
    schedule: [{ label: "Phác đồ", when: "Thường 2 mũi (tuỳ loại)" }],
    keywords: ["zona", "shingles"],
  },

  // 7) Varicella
  {
    id: "varicella",
    name: "Thủy đậu (Varicella)",
    shortName: "VAR",
    category: "Trẻ em",
    vaccineType: "Sống giảm độc lực",
    targetGroups: ["Trẻ em", "Vị thành niên", "Người lớn"],
    indications: ["Tiêm chủng thường quy", "Chưa rõ/không đủ mũi"],
    indicationNotes: ["Bổ sung cho người chưa có miễn dịch."],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Suy giảm miễn dịch nặng",
      "Đang mang thai (vắc xin sống)",
      "Đang dùng corticoid liều cao/ức chế miễn dịch",
      "Đang sốt cao/nhiễm trùng cấp",
    ],
    cautionNotes: ["Tránh có thai sau tiêm theo khuyến cáo."],
    schedule: [{ label: "Phác đồ", when: "Thường 2 mũi (tuỳ tuổi)" }],
    keywords: ["thủy đậu", "varicella"],
  },

  // 8) HepA
  {
    id: "hepa",
    name: "Viêm gan A (HepA)",
    shortName: "HepA",
    category: "Du lịch",
    vaccineType: "Bất hoạt",
    targetGroups: ["Trẻ em", "Người lớn", "Bệnh gan", "Du lịch"],
    indications: ["Du lịch", "Bệnh nền", "Tiếp xúc nguy cơ"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: [],
    schedule: [{ label: "Phác đồ", when: "Thường 2 mũi (tuỳ loại)" }],
    keywords: ["hepa", "viêm gan a"],
  },

  // 9) Dại
  {
    id: "rabies",
    name: "Dại (Rabies) – trước/sau phơi nhiễm",
    shortName: "Rabies",
    category: "Nguy cơ/Ngành nghề",
    vaccineType: "Bất hoạt",
    targetGroups: ["Người lớn", "Trẻ em", "Nhân viên y tế", "Du lịch"],
    indications: ["Sau phơi nhiễm", "Ngành nghề", "Du lịch"],
    indicationNotes: ["PEP/PrEP tuỳ tình huống; sau phơi nhiễm thường không trì hoãn."],
    contraindications: ["Phản vệ với liều trước/thành phần"],
    cautionNotes: [],
    schedule: [{ label: "Phác đồ", when: "Theo hướng dẫn PEP/PrEP" }],
    keywords: ["dại", "rabies", "chó cắn"],
  },

  // 10) Não mô cầu
  {
    id: "meningococcal",
    name: "Não mô cầu (MenACWY/MenB)",
    shortName: "MenACWY/MenB",
    category: "Nguy cơ/Ngành nghề",
    vaccineType: "Liên hợp",
    targetGroups: ["Trẻ em", "Vị thành niên", "Người lớn", "Suy giảm miễn dịch", "Du lịch", "Nhân viên y tế"],
    indications: ["Du lịch", "Ngành nghề", "Bệnh nền", "Tiêm chủng thường quy"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Chọn ACWY hay B tuỳ dịch tễ và khuyến cáo."],
    schedule: [{ label: "Phác đồ", when: "Tuỳ loại/nhóm tuổi" }],
    keywords: ["não mô cầu", "meningococcus", "acwy", "menb"],
  },

  // 11) Thương hàn
  {
    id: "typhoid",
    name: "Thương hàn (Typhoid)",
    shortName: "Typhoid",
    category: "Du lịch",
    vaccineType: "Bất hoạt",
    targetGroups: ["Người lớn", "Trẻ em", "Du lịch"],
    indications: ["Du lịch", "Tiếp xúc nguy cơ"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Có nhiều dạng vắc xin; chọn theo tuổi/khuyến cáo."],
    schedule: [{ label: "Nhắc lại", when: "Tuỳ loại vắc xin" }],
    keywords: ["thương hàn", "typhoid"],
  },

  // 12) Tả
  {
    id: "cholera",
    name: "Tả (Cholera) – uống",
    shortName: "Cholera",
    category: "Du lịch",
    vaccineType: "Bất hoạt",
    targetGroups: ["Người lớn", "Trẻ em", "Du lịch"],
    indications: ["Du lịch", "Tiếp xúc nguy cơ"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    schedule: [{ label: "Phác đồ", when: "Tuỳ loại (thường 2 liều)" }],
    keywords: ["tả", "cholera"],
  },

  // 13) JE (dịch vụ)
  {
    id: "je-service",
    name: "Viêm não Nhật Bản (JE) – dịch vụ/tuỳ chương trình",
    shortName: "JE",
    category: "Trẻ em",
    vaccineType: "Bất hoạt",
    targetGroups: ["Trẻ em", "Du lịch", "Người lớn"],
    indications: ["Tiêm chủng thường quy", "Du lịch"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    schedule: [{ label: "Phác đồ", when: "Theo chương trình/khuyến cáo" }],
    keywords: ["je", "viêm não nhật bản"],
  },

  // 14) Sốt vàng
  {
    id: "yellow-fever",
    name: "Sốt vàng (Yellow fever)",
    shortName: "YF",
    category: "Du lịch",
    vaccineType: "Sống giảm độc lực",
    targetGroups: ["Người lớn", "Du lịch"],
    indications: ["Du lịch"],
    indicationNotes: ["Một số quốc gia yêu cầu chứng nhận tiêm chủng khi nhập cảnh."],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Đang mang thai (vắc xin sống)",
      "Đang dùng corticoid liều cao/ức chế miễn dịch",
      "Phản vệ với liều trước/thành phần",
      "Đang sốt cao/nhiễm trùng cấp",
    ],
    cautionNotes: ["Cân nhắc kỹ nguy cơ–lợi ích theo tuổi/bệnh nền."],
    schedule: [{ label: "Mũi", when: "Theo quy định/khuyến cáo" }],
    keywords: ["sốt vàng", "yellow fever"],
  },

  // 15) RSV
  {
    id: "rsv",
    name: "RSV – tuỳ đối tượng",
    shortName: "RSV",
    category: "Người cao tuổi",
    vaccineType: "Tái tổ hợp",
    targetGroups: ["Người cao tuổi", "Phụ nữ mang thai", "Bệnh phổi mạn"],
    indications: ["Bệnh nền", "Tiêm chủng thường quy"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    schedule: [{ label: "Phác đồ", when: "Theo khuyến cáo" }],
    keywords: ["rsv"],
  },

  // 16) Mpox
  {
    id: "mpox",
    name: "Mpox (Đậu mùa khỉ) – tuỳ nguy cơ",
    shortName: "Mpox",
    category: "Nguy cơ/Ngành nghề",
    vaccineType: "Tái tổ hợp",
    targetGroups: ["Người lớn", "Nhân viên y tế", "Suy giảm miễn dịch"],
    indications: ["Tiếp xúc nguy cơ", "Ngành nghề", "Sau phơi nhiễm"],
    contraindications: ["Phản vệ với liều trước/thành phần"],
    schedule: [{ label: "Phác đồ", when: "Theo khuyến cáo" }],
    keywords: ["mpox", "đậu mùa khỉ"],
  },

  // 17) Hib (dịch vụ)
  {
    id: "hib",
    name: "Hib (Haemophilus influenzae type b)",
    shortName: "Hib",
    category: "Trẻ em",
    vaccineType: "Liên hợp",
    targetGroups: ["Trẻ em"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    schedule: [{ label: "Phác đồ", when: "Theo chương trình" }],
    keywords: ["hib"],
  },

  // 18) Polio (dịch vụ)
  {
    id: "polio",
    name: "Bại liệt (Polio – IPV/OPV)",
    shortName: "IPV/OPV",
    category: "Trẻ em",
    vaccineType: "Bất hoạt",
    targetGroups: ["Trẻ em", "Du lịch", "Nhân viên y tế"],
    indications: ["Tiêm chủng thường quy", "Du lịch", "Chưa rõ/không đủ mũi"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Nếu dùng OPV: cân nhắc ở suy giảm miễn dịch (tuỳ chương trình)."],
    schedule: [{ label: "Phác đồ", when: "Theo chương trình/khuyến cáo" }],
    keywords: ["polio", "ipv", "opv"],
  },

  // 19) HepB (dịch vụ)
  {
    id: "hepB",
    name: "Viêm gan B (HepB)",
    shortName: "HepB",
    category: "Bệnh nền",
    vaccineType: "Tái tổ hợp",
    targetGroups: ["Sơ sinh", "Trẻ em", "Người lớn", "Nhân viên y tế", "Bệnh gan", "Bệnh thận", "Suy giảm miễn dịch"],
    indications: ["Tiêm chủng thường quy", "Ngành nghề", "Bệnh nền", "Tiếp xúc nguy cơ"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    cautionNotes: ["Suy giảm miễn dịch/chạy thận có thể cần lịch/liều khác."],
    schedule: [{ label: "Phác đồ cơ bản", when: "0 – 1 – 6 tháng" }],
    keywords: ["hbv", "hepb", "viêm gan b"],
  },

  // 20) BCG (dịch vụ)
  {
    id: "bcg",
    name: "Lao (BCG)",
    shortName: "BCG",
    category: "Trẻ em",
    vaccineType: "Sống giảm độc lực",
    targetGroups: ["Sơ sinh", "Trẻ em"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: ["Suy giảm miễn dịch nặng", "Đang sốt cao/nhiễm trùng cấp", "Phản vệ với liều trước/thành phần"],
    cautionNotes: ["Chống chỉ định ở suy giảm miễn dịch bẩm sinh/mắc phải nặng."],
    schedule: [{ label: "Mũi", when: "Theo chương trình" }],
    keywords: ["bcg", "lao"],
  },

  // 21) Rota
  {
    id: "rota",
    name: "Rotavirus (tiêu chảy do Rota)",
    shortName: "Rota",
    category: "Trẻ em",
    vaccineType: "Sống giảm độc lực",
    targetGroups: ["Sơ sinh", "Trẻ em"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: ["Suy giảm miễn dịch nặng", "Đang sốt cao/nhiễm trùng cấp", "Phản vệ với liều trước/thành phần"],
    cautionNotes: ["Có giới hạn tuổi bắt đầu/kết thúc theo khuyến cáo."],
    schedule: [{ label: "Phác đồ", when: "2–3 liều tuỳ loại" }],
    keywords: ["rota", "rotavirus"],
  },

  // 22) MMR
  {
    id: "mmr",
    name: "Sởi – Quai bị – Rubella (MMR)",
    shortName: "MMR",
    category: "Trẻ em",
    vaccineType: "Sống giảm độc lực",
    targetGroups: ["Trẻ em", "Vị thành niên", "Người lớn"],
    indications: ["Tiêm chủng thường quy", "Chưa rõ/không đủ mũi"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Suy giảm miễn dịch nặng",
      "Đang mang thai (vắc xin sống)",
      "Đang dùng corticoid liều cao/ức chế miễn dịch",
      "Đang sốt cao/nhiễm trùng cấp",
    ],
    cautionNotes: ["Tránh có thai sau tiêm theo khuyến cáo."],
    schedule: [{ label: "Phác đồ", when: "2 mũi (tuỳ chương trình)" }],
    keywords: ["mmr", "sởi", "quai bị", "rubella"],
  },

  // 23) DTP/DTaP
  {
    id: "dtp",
    name: "Bạch hầu – Ho gà – Uốn ván (DTP/DTaP)",
    shortName: "DTP/DTaP",
    category: "Trẻ em",
    vaccineType: "Giải độc tố",
    targetGroups: ["Trẻ em"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: ["Phản vệ với liều trước/thành phần", "Đang sốt cao/nhiễm trùng cấp"],
    schedule: [{ label: "Phác đồ", when: "Theo chương trình" }],
    keywords: ["dtp", "dtap"],
  },
];
