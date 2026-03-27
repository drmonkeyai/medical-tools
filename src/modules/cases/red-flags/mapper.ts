import type { AssessmentRedFlagRow, RedFlagsSectionData } from "./types";

export function mapAssessmentToRedFlags(
  rows: AssessmentRedFlagRow[] | null | undefined
): RedFlagsSectionData {
  const safeRows = rows ?? [];

  return {
    items: safeRows.map((row) => ({
      id: row.id,
      name: row.flag_name,
      code: row.flag_code ?? null,
      isPresent: row.is_present ?? true,
      severity: row.severity ?? null,
      note: row.note ?? null,
    })),
  };
}