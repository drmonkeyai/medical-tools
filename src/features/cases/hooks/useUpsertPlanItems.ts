import { supabase } from "../../../lib/supabase";

export type CreatePlanItemPayload = {
  assessmentId: string;
  planType: string;
  description: string;
  dueDate?: string;
};

export function useUpsertPlanItems() {
  async function createPlanItem(payload: CreatePlanItemPayload) {
    const description = payload.description.trim();

    if (!payload.assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    if (!payload.planType.trim()) {
      throw new Error("Thiếu plan type.");
    }

    if (!description) {
      throw new Error("Mô tả kế hoạch không được để trống.");
    }

    const { data, error } = await supabase
      .from("assessment_plan_items")
      .insert([
        {
          assessment_id: payload.assessmentId,
          plan_type: payload.planType,
          description,
          due_date: payload.dueDate?.trim() ? payload.dueDate : null,
          is_completed: false,
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function deletePlanItem(planItemId: string) {
    const { error } = await supabase
      .from("assessment_plan_items")
      .delete()
      .eq("id", planItemId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    createPlanItem,
    deletePlanItem,
  };
}