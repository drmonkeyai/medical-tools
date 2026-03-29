import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { AssessmentLabResult } from "../../../modules/cases/labs/types";

type Params = {
  patientId?: string | null;
  labCode?: string | null;
  excludeAssessmentId?: string | null;
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tải được lịch sử xét nghiệm.";
}

export function usePatientLabHistory(params: Params) {
  const { patientId, labCode, excludeAssessmentId } = params;

  const [items, setItems] = useState<AssessmentLabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!patientId?.trim() || !labCode?.trim()) {
        setItems([]);
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data, error: queryError } = await supabase
          .from("assessment_lab_results")
          .select(`
            *,
            case_assessments!inner(
              id,
              case_id,
              patient_id
            )
          `)
          .eq("lab_code", labCode)
          .eq("case_assessments.patient_id", patientId)
          .neq("assessment_id", excludeAssessmentId ?? "")
          .order("measured_at", { ascending: false })
          .limit(10);

        if (queryError) throw queryError;
        if (cancelled) return;

        setItems((data ?? []) as AssessmentLabResult[]);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [patientId, labCode, excludeAssessmentId]);

  return {
    items,
    loading,
    error,
  };
}