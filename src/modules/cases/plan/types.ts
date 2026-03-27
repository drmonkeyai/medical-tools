export type AssessmentPlanItemRow = {
  id: string;
  assessment_id: string;
  plan_type: string;
  description: string;
  due_date?: string | null;
  is_completed?: boolean | null;
  completed_at?: string | null;
  created_at?: string | null;
};

export type PlanItemViewModel = {
  id: string;
  type: string;
  description: string;
  dueDate?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
};

export type PlanSectionData = {
  items: PlanItemViewModel[];
};