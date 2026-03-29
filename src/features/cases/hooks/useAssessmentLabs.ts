import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  AssessmentLabReport,
  AssessmentLabResult,
} from "../../../modules/cases/labs/types";

type AssessmentLabsState = {
  results: AssessmentLabResult[];
  reports: AssessmentLabReport[];
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tải được cận lâm sàng.";
}

export function useAssessmentLabs(assessmentId?: string | null) {
  const [data, setData] = useState<AssessmentLabsState>({
    results: [],
    reports: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!assessmentId?.trim()) {
        setData({ results: [], reports: [] });
        setIsLoading(false);
        setError("");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [resultsRes, reportsRes] = await Promise.all([
          supabase
            .from("assessment_lab_results")
            .select("*")
            .eq("assessment_id", assessmentId)
            .order("section", { ascending: true })
            .order("group_name", { ascending: true })
            .order("lab_name", { ascending: true }),
          supabase
            .from("assessment_lab_reports")
            .select("*")
            .eq("assessment_id", assessmentId)
            .order("performed_at", { ascending: false })
            .order("created_at", { ascending: false }),
        ]);

        if (resultsRes.error) throw resultsRes.error;
        if (reportsRes.error) throw reportsRes.error;

        if (cancelled) return;

        setData({
          results: (resultsRes.data ?? []) as AssessmentLabResult[],
          reports: (reportsRes.data ?? []) as AssessmentLabReport[],
        });
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setData({ results: [], reports: [] });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  return {
    data,
    isLoading,
    error,
  };
}