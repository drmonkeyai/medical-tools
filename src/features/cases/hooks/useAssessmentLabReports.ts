import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { AssessmentLabReport } from "../../../modules/cases/labs/types";

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tải được phiếu cận lâm sàng.";
}

export function useAssessmentLabReports(assessmentId?: string | null) {
  const [reports, setReports] = useState<AssessmentLabReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!assessmentId?.trim()) {
        setReports([]);
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data, error: queryError } = await supabase
          .from("assessment_lab_reports")
          .select("*")
          .eq("assessment_id", assessmentId)
          .order("performed_at", { ascending: false })
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;
        if (cancelled) return;

        setReports((data ?? []) as AssessmentLabReport[]);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  return {
    reports,
    loading,
    error,
  };
}