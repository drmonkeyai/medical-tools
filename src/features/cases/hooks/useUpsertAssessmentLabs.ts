import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { UpsertAssessmentLabResultInput } from "../../../modules/cases/labs/types";

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không lưu được cận lâm sàng.";
}

export function useUpsertAssessmentLabs() {
  const [savingLabs, setSavingLabs] = useState(false);
  const [saveLabsError, setSaveLabsError] = useState("");

  async function upsertAssessmentLabs(rows: UpsertAssessmentLabResultInput[]) {
    if (!rows.length) return [];

    try {
      setSavingLabs(true);
      setSaveLabsError("");

      const payload = rows.map((row) => ({
        ...row,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("assessment_lab_results")
        .upsert(payload)
        .select("*");

      if (error) throw error;
      return data ?? [];
    } catch (err) {
      const message = getErrorMessage(err);
      setSaveLabsError(message);
      throw new Error(message);
    } finally {
      setSavingLabs(false);
    }
  }

  return {
    savingLabs,
    saveLabsError,
    upsertAssessmentLabs,
  };
}