import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useCreateAssessment } from "../hooks/useCreateAssessment";

type LatestAssessmentRow = {
  id: string;
  assessment_no: number | null;
  assessment_date: string | null;
};

type CaseRow = {
  id: string;
  patient_id: string | null;
};

async function findLatestAssessment(caseId: string) {
  const { data, error } = await supabase
    .from("case_assessments")
    .select("id, assessment_no, assessment_date")
    .eq("case_id", caseId)
    .order("assessment_date", { ascending: false })
    .order("assessment_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as LatestAssessmentRow | null;
}

export default function CaseAssessmentRedirectPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { createAssessment } = useCreateAssessment();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!caseId) {
        if (!cancelled) {
          setError("Thiếu caseId.");
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError("");
        }

        const latestBefore = await findLatestAssessment(caseId);

        if (latestBefore?.id) {
          if (!cancelled) {
            navigate(`/app/cases/${caseId}/assessments/${latestBefore.id}`, {
              replace: true,
            });
          }
          return;
        }

        const { data: caseRowRaw, error: caseError } = await supabase
          .from("cases")
          .select("id, patient_id")
          .eq("id", caseId)
          .single();

        if (caseError) {
          throw caseError;
        }

        const caseRow = (caseRowRaw ?? null) as CaseRow | null;

        if (!caseRow?.id) {
          throw new Error("Không tìm thấy ca bệnh.");
        }

        if (!caseRow.patient_id) {
          throw new Error("Ca bệnh chưa có patient_id hợp lệ.");
        }

        let createdAssessmentId: string | null = null;
        let createError: unknown = null;

        try {
          const created = await createAssessment({
            caseId: caseRow.id,
            patientId: caseRow.patient_id,
            nextAssessmentNo: 1,
            sourceAssessmentId: undefined,
            assessmentType: "initial",
            careSetting: "outpatient",
            status: "draft",
          });

          createdAssessmentId = created?.id ?? null;
        } catch (err) {
          createError = err;
        }

        if (createdAssessmentId) {
          if (!cancelled) {
            navigate(
              `/app/cases/${caseId}/assessments/${createdAssessmentId}`,
              { replace: true }
            );
          }
          return;
        }

        const latestAfter = await findLatestAssessment(caseId);

        if (latestAfter?.id) {
          if (!cancelled) {
            navigate(`/app/cases/${caseId}/assessments/${latestAfter.id}`, {
              replace: true,
            });
          }
          return;
        }

        if (createError instanceof Error) {
          throw createError;
        }

        throw new Error("Không mở được chi tiết ca.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không mở được chi tiết ca.";

        if (!cancelled) {
          setError(message);
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [caseId, createAssessment, navigate]);

  if (loading) {
    return <div style={{ padding: 24 }}>Đang mở chi tiết ca...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, color: "#dc2626" }}>{error}</div>;
  }

  return <div style={{ padding: 24 }}>Đang chuyển hướng...</div>;
}