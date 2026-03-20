import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PatientSnapshotSection from "../modules/cases/components/PatientSnapshotSection";
import { mapAssessmentToPatientSnapshot } from "../modules/cases/mappers/mapAssessmentToPatientSnapshot";

type Patient = {
  id: string;
  patient_code: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  occupation?: string | null;
};

type CaseItem = {
  id: string;
  patient_id: string;
  case_code?: string | null;
  title?: string | null;
  primary_problem?: string | null;
  primary_diagnosis?: string | null;
  red_flag?: boolean | null;
};

type Assessment = {
  id: string;
  case_id: string;
  patient_id: string;
  assessment_no: number;
  assessment_date?: string | null;
  chief_complaint?: string | null;
  is_red_flag_present?: boolean | null;
  status?: string | null;
};

type Vitals = {
  assessment_id: string;
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  heart_rate?: number | null;
  temperature_c?: number | null;
  respiratory_rate?: number | null;
  spo2_percent?: number | null;
  waist_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
};

function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className="flex border-b border-slate-200 py-2 text-sm leading-6">
      <div className="w-40 shrink-0 text-slate-600">{label}</div>
      <div className="min-w-0 flex-1 break-words pl-3 text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [vitalsMap, setVitalsMap] = useState<Record<string, Vitals>>({});
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      if (!caseId) {
        setErrorText("Thiếu caseId.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorText(null);

        const { data: caseData, error: caseError } = await supabase
          .from("cases")
          .select(
            "id, patient_id, case_code, title, primary_problem, primary_diagnosis, red_flag"
          )
          .eq("id", caseId)
          .single();

        if (caseError) throw caseError;
        if (!caseData) throw new Error("Không tìm thấy ca bệnh.");
        setCaseItem(caseData);

        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("id, patient_code, full_name, date_of_birth, gender, occupation")
          .eq("id", caseData.patient_id)
          .single();

        if (patientError) throw patientError;
        if (!patientData) throw new Error("Không tìm thấy bệnh nhân.");
        setPatient(patientData);

        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from("case_assessments")
          .select(
            "id, case_id, patient_id, assessment_no, assessment_date, chief_complaint, is_red_flag_present, status"
          )
          .eq("case_id", caseId)
          .order("assessment_date", { ascending: false });

        if (assessmentsError) throw assessmentsError;

        const loadedAssessments = assessmentsData || [];
        setAssessments(loadedAssessments);

        const firstAssessmentId = loadedAssessments[0]?.id || null;
        setSelectedAssessmentId(firstAssessmentId);

        const assessmentIds = loadedAssessments.map((item) => item.id);

        if (assessmentIds.length > 0) {
          const { data: vitalsData, error: vitalsError } = await supabase
            .from("assessment_vitals")
            .select(
              "assessment_id, systolic_bp, diastolic_bp, heart_rate, temperature_c, respiratory_rate, spo2_percent, waist_cm, height_cm, weight_kg, bmi"
            )
            .in("assessment_id", assessmentIds);

          if (vitalsError) throw vitalsError;

          const nextVitalsMap: Record<string, Vitals> = {};
          (vitalsData || []).forEach((row) => {
            nextVitalsMap[row.assessment_id] = row;
          });

          setVitalsMap(nextVitalsMap);
        } else {
          setVitalsMap({});
        }
      } catch (error: any) {
        console.error("Load case detail error:", error);
        setErrorText(error?.message || "Không tải được dữ liệu ca bệnh.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [caseId]);

  const selectedAssessment = useMemo(() => {
    return assessments.find((item) => item.id === selectedAssessmentId) || null;
  }, [assessments, selectedAssessmentId]);

  const selectedVitals = useMemo(() => {
    if (!selectedAssessmentId) return null;
    return vitalsMap[selectedAssessmentId] || null;
  }, [selectedAssessmentId, vitalsMap]);

  const snapshotData = useMemo(() => {
    if (!patient || !caseItem || !selectedAssessment) return null;

    return mapAssessmentToPatientSnapshot({
      patient,
      caseItem,
      assessment: selectedAssessment,
      vitals: selectedVitals,
      redFlagCount: selectedAssessment.is_red_flag_present ? 1 : 0,
    });
  }, [patient, caseItem, selectedAssessment, selectedVitals]);

  if (loading) {
    return <div className="p-4 text-sm text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (errorText) {
    return <div className="p-4 text-sm text-red-600">{errorText}</div>;
  }

  if (!caseItem || !patient) {
    return (
      <div className="p-4 text-sm text-red-600">
        Không tìm thấy dữ liệu ca bệnh.
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-slate-300 px-3 py-2 text-sm"
          >
            Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="print:hidden">
            <div className="border border-slate-200">
              <div className="border-b border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">
                Lần đánh giá
              </div>

              {assessments.length === 0 ? (
                <div className="px-3 py-4 text-sm text-slate-500">
                  Chưa có lần đánh giá
                </div>
              ) : (
                <div className="flex flex-col">
                  {assessments.map((item) => {
                    const active = item.id === selectedAssessmentId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedAssessmentId(item.id)}
                        className={cn(
                          "border-b border-slate-200 px-3 py-3 text-left last:border-b-0",
                          active ? "bg-slate-100" : "hover:bg-slate-50"
                        )}
                      >
                        <div
                          className={cn(
                            "text-sm",
                            active
                              ? "font-semibold text-slate-900"
                              : "text-slate-800"
                          )}
                        >
                          {formatDate(item.assessment_date)}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Lần {item.assessment_no}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            {snapshotData && (
              <PatientSnapshotSection
                data={snapshotData}
                onPrint={() => window.print()}
              />
            )}

            <section className="border-t border-slate-200 pt-4">
              <h2 className="mb-3 text-lg font-semibold">Thông tin assessment</h2>

              <div>
                <Field label="Tiêu đề ca" value={caseItem.title || "—"} />
                <Field label="Vấn đề chính" value={caseItem.primary_problem || "—"} />
                <Field
                  label="Chẩn đoán chính"
                  value={caseItem.primary_diagnosis || "—"}
                />
                <Field
                  label="Assessment đang chọn"
                  value={
                    selectedAssessment
                      ? `Lần ${selectedAssessment.assessment_no} - ${formatDate(
                          selectedAssessment.assessment_date
                        )}`
                      : "—"
                  }
                />
                <Field label="Mã ca" value={caseItem.case_code || "—"} />
                <Field label="Trạng thái" value={selectedAssessment?.status || "—"} />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}