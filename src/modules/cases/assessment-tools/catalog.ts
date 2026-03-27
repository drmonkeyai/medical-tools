import type {
  AssessmentToolCatalogItem,
  AssessmentToolCategoryKey,
} from "./types";

export const ASSESSMENT_TOOL_CATEGORY_ORDER: AssessmentToolCategoryKey[] = [
  "family_social",
  "cardiovascular",
  "metabolic_renal",
  "liver",
  "respiratory_sleep",
  "mental_behavior",
  "geriatric_function",
];

export const ASSESSMENT_TOOL_CATALOG: AssessmentToolCatalogItem[] = [
  {
    toolKey: "family_apgar",
    title: "Family APGAR",
    shortDescription: "Đánh giá chức năng gia đình",
    categoryKey: "family_social",
    categoryLabel: "Gia đình - xã hội",
    mode: "questionnaire",
    clinicalPurpose:
      "Đánh giá nhanh chức năng và mức hỗ trợ của gia đình trong bối cảnh y học gia đình / ngoại trú.",
    inputRequirement:
      "Bộ câu hỏi 5 mục, cần form câu hỏi riêng trong assessment.",
    status: "ready",
    priority: "core",
    enabledInAssessment: true,
    calculatorCode: "family_apgar",
    questionnaireDomains: [
      "Adaptation",
      "Partnership",
      "Growth",
      "Affection",
      "Resolve",
    ],
    tags: ["gia đình", "function", "questionnaire"],
  },
  {
    toolKey: "screem",
    title: "SCREEM",
    shortDescription: "Đánh giá nguồn lực gia đình",
    categoryKey: "family_social",
    categoryLabel: "Gia đình - xã hội",
    mode: "questionnaire",
    clinicalPurpose:
      "Đánh giá nguồn lực gia đình và bối cảnh xã hội phục vụ chăm sóc dài hạn.",
    inputRequirement:
      "Bộ câu hỏi theo các miền nguồn lực, cần form câu hỏi riêng.",
    status: "ready",
    priority: "core",
    enabledInAssessment: true,
    calculatorCode: "screem",
    questionnaireDomains: [
      "Social",
      "Cultural",
      "Religious",
      "Economic",
      "Educational",
      "Medical",
    ],
    tags: ["gia đình", "xã hội", "nguồn lực"],
  },
  {
    toolKey: "family_pedigree",
    title: "Cây phả hệ",
    shortDescription: "Ghi nhận quan hệ gia đình và tiền sử 3 thế hệ",
    categoryKey: "family_social",
    categoryLabel: "Gia đình - xã hội",
    mode: "structured",
    clinicalPurpose:
      "Ghi nhận sơ đồ gia đình, quan hệ và tiền sử gia đình để hỗ trợ đánh giá nguy cơ và bối cảnh chăm sóc.",
    inputRequirement:
      "Structured editor riêng, không nên ép vào runner calculator chung.",
    status: "planned",
    priority: "core",
    enabledInAssessment: true,
    structuredHints: [
      "Quan hệ 3 thế hệ",
      "Tiền sử bệnh gia đình quan trọng",
      "Người chăm sóc chính",
      "Quan hệ sống cùng / hỗ trợ xã hội",
    ],
    tags: ["pedigree", "family history", "structured"],
  },

  {
    toolKey: "ascvd_risk_estimator_plus",
    title: "ASCVD Risk Estimator Plus",
    shortDescription: "Ước tính nguy cơ tim mạch để hỗ trợ dự phòng tiên phát",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ bàn luận về statin, huyết áp và dự phòng tiên phát.",
    inputRequirement:
      "Cần khóa rule và bộ biến trước khi nối runner thật.",
    status: "needs_rule_lock",
    priority: "high",
    enabledInAssessment: true,
    tags: ["tim mạch", "ascvd", "risk"],
  },
  {
    toolKey: "prevent_cvd_risk",
    title: "PREVENT",
    shortDescription: "Ước tính nguy cơ tim mạch theo pathway hiện đại",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ đánh giá nguy cơ tim mạch toàn thể trong chăm sóc dự phòng.",
    inputRequirement:
      "Cần khóa rule và bộ biến trước khi nối runner thật.",
    status: "needs_rule_lock",
    priority: "high",
    enabledInAssessment: true,
    tags: ["tim mạch", "prevent", "risk"],
  },
  {
    toolKey: "score2",
    title: "SCORE2",
    shortDescription: "Ước tính nguy cơ tim mạch theo hệ ESC",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "mixed",
    clinicalPurpose:
      "Ước tính nguy cơ tim mạch theo cách tiếp cận ESC/châu Âu.",
    inputRequirement:
      "Cần khóa đối tượng áp dụng và bộ biến trước khi nối runner thật.",
    status: "needs_rule_lock",
    priority: "high",
    enabledInAssessment: true,
    tags: ["score2", "esc", "cardiovascular"],
  },
  {
    toolKey: "score2_op",
    title: "SCORE2-OP",
    shortDescription: "Ước tính nguy cơ tim mạch ở người lớn tuổi theo ESC",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "mixed",
    clinicalPurpose:
      "Ước tính nguy cơ tim mạch ở nhóm tuổi phù hợp theo pathway ESC.",
    inputRequirement:
      "Cần khóa đối tượng áp dụng và bộ biến trước khi nối runner thật.",
    status: "needs_rule_lock",
    priority: "high",
    enabledInAssessment: true,
    tags: ["score2-op", "esc", "older adults"],
  },
  {
    toolKey: "esc_eas_risk_stratification",
    title: "Phân tầng nguy cơ tim mạch (ESC/EAS)",
    shortDescription: "Phân tầng nguy cơ tim mạch theo pathway ESC/EAS",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "pathway",
    clinicalPurpose:
      "Cho phép bác sĩ bắt đầu từ mục tiêu lâm sàng ESC/EAS rồi đi vào nhánh phù hợp thay vì gắn cứng vào 1 công thức.",
    inputRequirement:
      "Pathway lâm sàng; về sau sẽ nối tới SCORE2 / SCORE2-OP và các nhánh liên quan.",
    status: "needs_rule_lock",
    priority: "core",
    enabledInAssessment: true,
    pathwayOptions: [
      {
        key: "score2",
        title: "SCORE2",
        description: "Dùng khi đi theo pathway SCORE2 chuẩn.",
        calculatorCode: "score2",
      },
      {
        key: "score2_op",
        title: "SCORE2-OP",
        description: "Dùng khi đi theo pathway SCORE2-OP cho nhóm phù hợp.",
        calculatorCode: "score2_op",
      },
    ],
    tags: ["esc", "eas", "tim mạch", "pathway"],
  },
  {
    toolKey: "cha2ds2_vasc",
    title: "CHA₂DS₂-VASc",
    shortDescription: "Ước tính nguy cơ đột quỵ ở bệnh nhân rung nhĩ",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ cân nhắc nguy cơ đột quỵ khi đánh giá rung nhĩ.",
    inputRequirement:
      "Cần bệnh nền và demographic; giai đoạn đầu phù hợp mixed renderer.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["af", "stroke", "anticoagulation"],
  },
  {
    toolKey: "has_bled",
    title: "HAS-BLED",
    shortDescription: "Ước tính nguy cơ chảy máu khi cân nhắc chống đông",
    categoryKey: "cardiovascular",
    categoryLabel: "Tim mạch",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ bàn luận nguy cơ chảy máu trong bối cảnh chống đông.",
    inputRequirement:
      "Cần tiền sử, bệnh nền và một số biến lâm sàng/cận lâm sàng.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["bleeding", "anticoagulation"],
  },

  {
    toolKey: "bmi",
    title: "BMI",
    shortDescription: "Đánh giá tình trạng dinh dưỡng / thừa cân / béo phì",
    categoryKey: "metabolic_renal",
    categoryLabel: "Chuyển hóa - đái tháo đường - thận",
    mode: "auto",
    clinicalPurpose:
      "Tính BMI từ chiều cao và cân nặng của assessment hiện tại.",
    inputRequirement:
      "Tự lấy từ assessment_vitals: height_cm, weight_kg.",
    status: "ready",
    priority: "core",
    enabledInAssessment: true,
    calculatorCode: "bmi",
    tags: ["bmi", "nutrition", "obesity", "auto"],
  },
  {
    toolKey: "ada_type2_diabetes_risk_test",
    title: "ADA Type 2 Diabetes Risk Test",
    shortDescription: "Sàng lọc nguy cơ đái tháo đường típ 2",
    categoryKey: "metabolic_renal",
    categoryLabel: "Chuyển hóa - đái tháo đường - thận",
    mode: "questionnaire",
    clinicalPurpose:
      "Sàng lọc nguy cơ đái tháo đường típ 2 trong chăm sóc ban đầu.",
    inputRequirement: "Cần form câu hỏi riêng.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["dm2", "risk", "screening"],
  },
  {
    toolKey: "egfr_ckd_epi",
    title: "eGFR CKD-EPI",
    shortDescription: "Ước tính mức lọc cầu thận",
    categoryKey: "metabolic_renal",
    categoryLabel: "Chuyển hóa - đái tháo đường - thận",
    mode: "mixed",
    clinicalPurpose:
      "Đánh giá chức năng thận từ creatinine và thông tin người bệnh.",
    inputRequirement:
      "Cần creatinine + tuổi/giới; giai đoạn đầu phù hợp mixed renderer.",
    status: "planned",
    priority: "core",
    enabledInAssessment: true,
    tags: ["egfr", "ckd-epi", "renal"],
  },
  {
    toolKey: "ckd_staging_egfr_uacr",
    title: "Phân tầng CKD theo eGFR + UACR",
    shortDescription: "Phân tầng nguy cơ bệnh thận mạn",
    categoryKey: "metabolic_renal",
    categoryLabel: "Chuyển hóa - đái tháo đường - thận",
    mode: "mixed",
    clinicalPurpose:
      "Phân tầng CKD từ eGFR kết hợp albumin niệu/UACR.",
    inputRequirement:
      "Cần eGFR + UACR; phù hợp mixed renderer.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["ckd", "egfr", "uacr"],
  },
  {
    toolKey: "kfre",
    title: "KFRE",
    shortDescription: "Ước tính nguy cơ tiến triển tới suy thận",
    categoryKey: "metabolic_renal",
    categoryLabel: "Chuyển hóa - đái tháo đường - thận",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ tiên lượng tiến triển bệnh thận mạn.",
    inputRequirement:
      "Cần khóa rule và bộ biến trước khi nối runner thật.",
    status: "needs_rule_lock",
    priority: "secondary",
    enabledInAssessment: true,
    tags: ["kfre", "renal", "prognosis"],
  },
  {
    toolKey: "cockcroft_gault",
    title: "Cockcroft-Gault",
    shortDescription: "Ước tính chức năng thận để hỗ trợ chỉnh liều thuốc",
    categoryKey: "metabolic_renal",
    categoryLabel: "Chuyển hóa - đái tháo đường - thận",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ ước tính creatinine clearance phục vụ chỉnh liều thuốc.",
    inputRequirement:
      "Cần tuổi/giới/cân nặng/creatinine; mixed renderer.",
    status: "planned",
    priority: "core",
    enabledInAssessment: true,
    tags: ["crcl", "dose adjustment", "renal"],
  },

  {
    toolKey: "fib4",
    title: "FIB-4",
    shortDescription: "Sàng lọc nguy cơ xơ hóa gan",
    categoryKey: "liver",
    categoryLabel: "Gan",
    mode: "auto",
    clinicalPurpose:
      "Ước tính nguy cơ xơ hóa gan ở bối cảnh gan nhiễm mỡ / bệnh gan mạn.",
    inputRequirement:
      "Tự lấy từ tuổi + AST + ALT + platelet của assessment hiện tại.",
    status: "ready",
    priority: "core",
    enabledInAssessment: true,
    calculatorCode: "fib4",
    tags: ["fib4", "liver", "fibrosis", "auto"],
  },
  {
    toolKey: "meld_na",
    title: "MELD-Na",
    shortDescription: "Ước tính mức độ nặng ở bệnh gan mạn / xơ gan",
    categoryKey: "liver",
    categoryLabel: "Gan",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ tiên lượng ở bệnh gan mạn nặng / xơ gan.",
    inputRequirement:
      "Cần bilirubin, INR, creatinine, sodium; giai đoạn đầu phù hợp mixed renderer.",
    status: "planned",
    priority: "secondary",
    enabledInAssessment: true,
    tags: ["meld", "cirrhosis", "liver"],
  },

  {
    toolKey: "act",
    title: "ACT",
    shortDescription: "Đánh giá mức độ kiểm soát hen",
    categoryKey: "respiratory_sleep",
    categoryLabel: "Hô hấp - giấc ngủ",
    mode: "questionnaire",
    clinicalPurpose:
      "Theo dõi mức độ kiểm soát hen trong ngoại trú.",
    inputRequirement: "Cần form câu hỏi riêng.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["asthma", "act", "questionnaire"],
  },
  {
    toolKey: "cat",
    title: "CAT",
    shortDescription: "Đánh giá ảnh hưởng của COPD lên cuộc sống",
    categoryKey: "respiratory_sleep",
    categoryLabel: "Hô hấp - giấc ngủ",
    mode: "questionnaire",
    clinicalPurpose:
      "Đánh giá gánh nặng triệu chứng ở người bệnh COPD.",
    inputRequirement: "Cần form câu hỏi riêng.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["copd", "cat", "questionnaire"],
  },
  {
    toolKey: "mmrc",
    title: "mMRC Dyspnea Scale",
    shortDescription: "Đánh giá mức độ khó thở nền",
    categoryKey: "respiratory_sleep",
    categoryLabel: "Hô hấp - giấc ngủ",
    mode: "questionnaire",
    clinicalPurpose:
      "Đánh giá mức độ khó thở nền để theo dõi chức năng hô hấp.",
    inputRequirement: "Chọn mức theo thang điểm.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["dyspnea", "mmrc"],
  },
  {
    toolKey: "stop_bang",
    title: "STOP-Bang",
    shortDescription: "Sàng lọc ngưng thở khi ngủ",
    categoryKey: "respiratory_sleep",
    categoryLabel: "Hô hấp - giấc ngủ",
    mode: "questionnaire",
    clinicalPurpose:
      "Sàng lọc nguy cơ ngưng thở khi ngủ.",
    inputRequirement:
      "Cần form câu hỏi riêng; về sau có thể kết hợp dữ liệu nhân trắc học.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    calculatorCode: "stop_bang",
    tags: ["sleep apnea", "stop-bang"],
  },

  {
    toolKey: "phq9",
    title: "PHQ-9",
    shortDescription: "Sàng lọc và theo dõi trầm cảm",
    categoryKey: "mental_behavior",
    categoryLabel: "Tâm thần - hành vi",
    mode: "questionnaire",
    clinicalPurpose:
      "Sàng lọc và theo dõi mức độ trầm cảm.",
    inputRequirement: "Cần form câu hỏi 9 mục.",
    status: "ready",
    priority: "core",
    enabledInAssessment: true,
    calculatorCode: "phq9",
    tags: ["phq9", "depression", "questionnaire"],
  },
  {
    toolKey: "gad7",
    title: "GAD-7",
    shortDescription: "Sàng lọc và theo dõi lo âu",
    categoryKey: "mental_behavior",
    categoryLabel: "Tâm thần - hành vi",
    mode: "questionnaire",
    clinicalPurpose:
      "Sàng lọc và theo dõi mức độ lo âu.",
    inputRequirement: "Cần form câu hỏi 7 mục.",
    status: "ready",
    priority: "core",
    enabledInAssessment: true,
    calculatorCode: "gad7",
    tags: ["gad7", "anxiety", "questionnaire"],
  },
  {
    toolKey: "audit_c",
    title: "AUDIT-C",
    shortDescription: "Sàng lọc sử dụng rượu không lành mạnh",
    categoryKey: "mental_behavior",
    categoryLabel: "Tâm thần - hành vi",
    mode: "questionnaire",
    clinicalPurpose:
      "Sàng lọc nguy cơ sử dụng rượu không lành mạnh.",
    inputRequirement: "Cần form câu hỏi riêng.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["alcohol", "audit-c", "questionnaire"],
  },

  {
    toolKey: "frax",
    title: "FRAX",
    shortDescription: "Ước tính nguy cơ gãy xương 10 năm",
    categoryKey: "geriatric_function",
    categoryLabel: "Lão khoa - chức năng",
    mode: "mixed",
    clinicalPurpose:
      "Hỗ trợ đánh giá nguy cơ gãy xương trong chăm sóc lão khoa / dự phòng.",
    inputRequirement:
      "Cần khóa rule và bộ biến trước khi nối runner thật.",
    status: "needs_rule_lock",
    priority: "secondary",
    enabledInAssessment: true,
    tags: ["frax", "fracture", "geriatric"],
  },
  {
    toolKey: "tug",
    title: "TUG (Timed Up and Go)",
    shortDescription: "Đánh giá nguy cơ té ngã / khả năng vận động",
    categoryKey: "geriatric_function",
    categoryLabel: "Lão khoa - chức năng",
    mode: "structured",
    clinicalPurpose:
      "Đánh giá khả năng vận động và nguy cơ té ngã.",
    inputRequirement:
      "Structured/manual entry cho thời gian thực hiện test.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    structuredHints: [
      "Thời gian hoàn thành test",
      "Dụng cụ hỗ trợ đi lại",
      "Mức độ ổn định khi quay đầu / đứng dậy",
    ],
    tags: ["tug", "falls", "mobility"],
  },
  {
    toolKey: "mini_cog",
    title: "Mini-Cog",
    shortDescription: "Sàng lọc suy giảm nhận thức",
    categoryKey: "geriatric_function",
    categoryLabel: "Lão khoa - chức năng",
    mode: "structured",
    clinicalPurpose:
      "Sàng lọc nhanh suy giảm nhận thức.",
    inputRequirement:
      "Structured tool, cần UI riêng cho recall / drawing hoặc nhập kết quả tóm tắt.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    structuredHints: [
      "Kết quả nhớ lại từ",
      "Nhận xét đồng hồ / vẽ",
      "Nhận xét tóm tắt của bác sĩ",
    ],
    tags: ["mini-cog", "cognition", "geriatric"],
  },
  {
    toolKey: "must",
    title: "MUST",
    shortDescription: "Đánh giá nguy cơ suy dinh dưỡng",
    categoryKey: "geriatric_function",
    categoryLabel: "Lão khoa - chức năng",
    mode: "mixed",
    clinicalPurpose:
      "Sàng lọc nguy cơ suy dinh dưỡng trong ngoại trú / lão khoa.",
    inputRequirement:
      "Cần nhân trắc học + thay đổi cân nặng + tình trạng bệnh cấp.",
    status: "planned",
    priority: "high",
    enabledInAssessment: true,
    tags: ["must", "malnutrition", "geriatric"],
  },
];

export function getAssessmentToolCatalog() {
  return ASSESSMENT_TOOL_CATALOG.slice();
}

export function findAssessmentTool(toolKey: string) {
  return ASSESSMENT_TOOL_CATALOG.find((item) => item.toolKey === toolKey) ?? null;
}

export function groupAssessmentToolsByCategory(
  tools: AssessmentToolCatalogItem[] = ASSESSMENT_TOOL_CATALOG
) {
  return ASSESSMENT_TOOL_CATEGORY_ORDER.map((categoryKey) => {
    const items = tools.filter((item) => item.categoryKey === categoryKey);
    return {
      categoryKey,
      categoryLabel: items[0]?.categoryLabel ?? categoryKey,
      items,
    };
  }).filter((group) => group.items.length > 0);
}