import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export default function CaseAssessmentRedirectPage() {
  const { caseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [targetAssessmentId, setTargetAssessmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstAssessment() {
      if (!caseId) {
        setError("Thiếu caseId.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("case_assessments")
          .select("id, assessment_date")
          .eq("case_id", caseId)
          .order("assessment_date", { ascending: false })
          .limit(1);

        if (error) throw error;

        const firstAssessment = data?.[0] ?? null;

        if (!cancelled) {
          setTargetAssessmentId(firstAssessment?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không tải được assessment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFirstAssessment();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  if (!caseId) {
    return <div className="p-6 text-sm text-red-600">Thiếu caseId.</div>;
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Đang chuyển assessment...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  if (!targetAssessmentId) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Ca này chưa có lần đánh giá nào.
      </div>
    );
  }

  return (
    <Navigate
      to={`/app/cases/${caseId}/assessments/${targetAssessmentId}`}
      replace
    />
  );
}