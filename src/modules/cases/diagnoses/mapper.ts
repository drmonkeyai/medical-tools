import type {
  AssessmentDiagnosisRow,
  DiagnosesSectionData,
  DiagnosisItem,
} from "./types";

function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim();
}

function mapDiagnosisTypeLabel(
  diagnosisType: AssessmentDiagnosisRow["diagnosis_type"],
): string {
  switch (diagnosisType) {
    case "primary":
      return "Chẩn đoán chính";
    case "secondary":
      return "Chẩn đoán phụ";
    case "differential":
      return "Chẩn đoán phân biệt";
    case "working":
      return "Chẩn đoán nghĩ đến";
    default:
      return diagnosisType;
  }
}

function mapDiagnosisRow(row: AssessmentDiagnosisRow): DiagnosisItem {
  return {
    id: row.id,
    diagnosisName: normalizeText(row.diagnosis_name),
    diagnosisType: row.diagnosis_type,
    diagnosisTypeLabel: mapDiagnosisTypeLabel(row.diagnosis_type),
    icd10Code: normalizeText(row.icd10_code),
    note: normalizeText(row.note),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function mapAssessmentToDiagnoses(
  rows: AssessmentDiagnosisRow[] | null | undefined,
): DiagnosesSectionData {
  const safeRows = rows ?? [];

  const items = safeRows
    .map(mapDiagnosisRow)
    .filter((item) => item.diagnosisName.length > 0);

  return {
    items,
    total: items.length,
    activeCount: items.filter((item) => item.isActive).length,
    hasAnyContent: items.length > 0,
  };
}