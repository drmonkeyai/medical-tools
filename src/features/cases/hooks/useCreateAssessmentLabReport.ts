import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { CreateAssessmentLabReportInput } from "../../../modules/cases/labs/types";

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tạo được phiếu cận lâm sàng.";
}

export function useCreateAssessmentLabReport() {
  const [creatingLabReport, setCreatingLabReport] = useState(false);
  const [createLabReportError, setCreateLabReportError] = useState("");

  async function createAssessmentLabReport(payload: CreateAssessmentLabReportInput) {
    try {
      setCreatingLabReport(true);
      setCreateLabReportError("");

      const { data, error } = await supabase
        .from("assessment_lab_reports")
        .insert([payload])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const message = getErrorMessage(err);
      setCreateLabReportError(message);
      throw new Error(message);
    } finally {
      setCreatingLabReport(false);
    }
  }

  return {
    creatingLabReport,
    createLabReportError,
    createAssessmentLabReport,
  };
}