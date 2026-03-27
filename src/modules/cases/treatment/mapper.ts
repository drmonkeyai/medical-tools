import type {
  AssessmentTreatmentRow,
  TreatmentItemView,
  TreatmentSectionData,
} from "./types";

function cleanText(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function sortRows(a: AssessmentTreatmentRow, b: AssessmentTreatmentRow) {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function mapRowToView(row: AssessmentTreatmentRow): TreatmentItemView {
  return {
    id: row.id,
    type: row.treatment_type,
    name: row.treatment_name,
    description: cleanText(row.description),
    doseOrFrequency: cleanText(row.dose_or_frequency),
    duration: cleanText(row.duration),
    instructions: cleanText(row.instructions),
    status: row.status,
  };
}

export function mapAssessmentToTreatment(
  rows: AssessmentTreatmentRow[] | null | undefined
): TreatmentSectionData {
  const safeRows = [...(rows ?? [])].sort(sortRows);
  const items = safeRows.map(mapRowToView);

  return {
    medications: items.filter((item) => item.type === "medication"),
    exercises: items.filter((item) => item.type === "exercise"),
    procedures: items.filter((item) => item.type === "procedure"),
    educations: items.filter((item) => item.type === "education"),
    lifestyles: items.filter((item) => item.type === "lifestyle"),
    referrals: items.filter((item) => item.type === "referral"),
    hasData: items.length > 0,
  };
}