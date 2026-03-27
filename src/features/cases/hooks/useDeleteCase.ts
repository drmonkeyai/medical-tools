import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type DeleteCaseParams = {
  caseId: string;
  patientId?: string;
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không xóa được ca.";
}

export function useDeleteCase() {
  const [deletingCase, setDeletingCase] = useState(false);
  const [deleteCaseError, setDeleteCaseError] = useState("");

  async function deleteCase({ caseId, patientId }: DeleteCaseParams) {
    if (!caseId?.trim()) {
      throw new Error("Thiếu caseId.");
    }

    try {
      setDeletingCase(true);
      setDeleteCaseError("");

      const { data: assessmentRows, error: assessmentsError } = await supabase
        .from("case_assessments")
        .select("id")
        .eq("case_id", caseId);

      if (assessmentsError) throw assessmentsError;

      const assessmentIds = (assessmentRows ?? [])
        .map((row) => row.id as string)
        .filter(Boolean);

      if (assessmentIds.length > 0) {
        const { data: runRows, error: runError } = await supabase
          .from("calculator_runs")
          .select("id")
          .in("assessment_id", assessmentIds);

        if (runError) throw runError;

        const runIds = (runRows ?? [])
          .map((row) => row.id as string)
          .filter(Boolean);

        if (runIds.length > 0) {
          const { error: inputDeleteError } = await supabase
            .from("calculator_run_inputs")
            .delete()
            .in("calculator_run_id", runIds);

          if (inputDeleteError) throw inputDeleteError;

          const { error: runsDeleteError } = await supabase
            .from("calculator_runs")
            .delete()
            .in("id", runIds);

          if (runsDeleteError) throw runsDeleteError;
        }

        const deleteByAssessmentIds = async (table: string) => {
          const { error } = await supabase
            .from(table)
            .delete()
            .in("assessment_id", assessmentIds);

          if (error) throw error;
        };

        await deleteByAssessmentIds("assessment_observations");
        await deleteByAssessmentIds("assessment_red_flags");
        await deleteByAssessmentIds("assessment_plan_items");
        await deleteByAssessmentIds("assessment_treatments");
        await deleteByAssessmentIds("assessment_diagnoses");
        await deleteByAssessmentIds("assessment_notes");
        await deleteByAssessmentIds("assessment_vitals");

        const { error: assessmentsDeleteError } = await supabase
          .from("case_assessments")
          .delete()
          .in("id", assessmentIds);

        if (assessmentsDeleteError) throw assessmentsDeleteError;
      }

      const { error: caseDeleteError } = await supabase
        .from("cases")
        .delete()
        .eq("id", caseId);

      if (caseDeleteError) throw caseDeleteError;

      if (patientId?.trim()) {
        const { data: remainingCases, error: remainingCasesError } = await supabase
          .from("cases")
          .select("id")
          .eq("patient_id", patientId)
          .limit(1);

        if (!remainingCasesError && (!remainingCases || remainingCases.length === 0)) {
          await supabase.from("patients").delete().eq("id", patientId);
        }
      }

      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      setDeleteCaseError(message);
      throw new Error(message);
    } finally {
      setDeletingCase(false);
    }
  }

  return {
    deletingCase,
    deleteCaseError,
    deleteCase,
  };
}