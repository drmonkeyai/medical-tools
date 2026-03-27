import type {
  AssessmentObservationRow,
  ObservationsSectionData,
} from "./types";

function getDisplayValue(row: AssessmentObservationRow) {
  if (row.value_text != null) return row.value_text;
  if (row.value_numeric != null) return String(row.value_numeric);
  if (row.value_boolean != null) return row.value_boolean ? "Có" : "Không";
  if (row.value_date != null) return row.value_date;
  if (row.value_json != null) return JSON.stringify(row.value_json);
  return "";
}

export function mapAssessmentToObservations(
  rows: AssessmentObservationRow[] | null | undefined
): ObservationsSectionData {
  const safeRows = rows ?? [];

  return {
    items: safeRows.map((row) => ({
      id: row.id,
      code: row.observation_code,
      label: row.observation_label,
      valueType: row.value_type,
      displayValue: getDisplayValue(row),
      unit: row.unit ?? null,
      normalFlag: row.normal_flag ?? null,
      note: row.note ?? null,
      observedAt: row.observed_at ?? null,
    })),
  };
}