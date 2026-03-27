import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type DeleteAssessmentParams = {
  assessmentId: string;
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không xóa được lần đánh giá.";
}

export function useDeleteAssessment() {
  const [deletingAssessment, setDeletingAssessment] = useState(false);
  const [deleteAssessmentError, setDeleteAssessmentError] = useState("");

  async function deleteByAssessmentId(table: string, assessmentId: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("assessment_id", assessmentId);

    if (error) throw error;
  }

  async function deleteAssessment({ assessmentId }: DeleteAssessmentParams) {
    if (!assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    try {
      setDeletingAssessment(true);
      setDeleteAssessmentError("");

      const { data: runRows, error: runError } = await supabase
        .from("calculator_runs")
        .select("id")
        .eq("assessment_id", assessmentId);

      if (runError) throw runError;

      const runIds = (runRows ?? []).map((row) => row.id).filter(Boolean);

      if (runIds.length > 0) {
        const { error: inputDeleteError } = await supabase
          .from("calculator_run_inputs")
          .delete()
          .in("calculator_run_id", runIds);

        if (inputDeleteError) throw inputDeleteError;
      }

      await deleteByAssessmentId("calculator_runs", assessmentId);
      await deleteByAssessmentId("assessment_observations", assessmentId);
      await deleteByAssessmentId("assessment_red_flags", assessmentId);
      await deleteByAssessmentId("assessment_plan_items", assessmentId);
      await deleteByAssessmentId("assessment_treatments", assessmentId);
      await deleteByAssessmentId("assessment_diagnoses", assessmentId);
      await deleteByAssessmentId("assessment_notes", assessmentId);
      await deleteByAssessmentId("assessment_vitals", assessmentId);

      const { error: assessmentDeleteError } = await supabase
        .from("case_assessments")
        .delete()
        .eq("id", assessmentId);

      if (assessmentDeleteError) throw assessmentDeleteError;

      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      setDeleteAssessmentError(message);
      throw new Error(message);
    } finally {
      setDeletingAssessment(false);
    }
  }

  return {
    deleteAssessment,
    deletingAssessment,
    deleteAssessmentError,
  };
}