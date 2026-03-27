import type { AssessmentPlanItemRow, PlanSectionData } from "./types";

export function mapAssessmentToPlan(
  rows: AssessmentPlanItemRow[] | null | undefined
): PlanSectionData {
  const safeRows = rows ?? [];

  return {
    items: safeRows.map((row) => ({
      id: row.id,
      type: row.plan_type,
      description: row.description,
      dueDate: row.due_date ?? null,
      isCompleted: Boolean(row.is_completed),
      completedAt: row.completed_at ?? null,
    })),
  };
}