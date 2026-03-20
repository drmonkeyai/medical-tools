import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { mapAssessmentToClinicalNote } from "../../../modules/cases/clinical-note/mapper";
import type {
  AssessmentNoteRow,
  ClinicalNoteSectionData,
} from "../../../modules/cases/clinical-note/types";
import { mapAssessmentToDiagnoses } from "../../../modules/cases/diagnoses/mapper";
import type {
  AssessmentDiagnosisRow,
  DiagnosesSectionData,
} from "../../../modules/cases/diagnoses/types";

type Patient = {
  id: string;
  patient_code: string | null;
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
  assessment_no: number | null;
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

type UseCaseDetailState = {
  loading: boolean;
  error: string | null;
  caseItem: CaseItem | null;
  patient: Patient | null;
  assessments: Assessment[];
  selectedAssessment: Assessment | null;
  vitals: Vitals | null;
  clinicalNote: ClinicalNoteSectionData;
  diagnoses: DiagnosesSectionData;
};

const emptyClinicalNote = mapAssessmentToClinicalNote(null);
const emptyDiagnoses = mapAssessmentToDiagnoses([]);

const initialState: UseCaseDetailState = {
  loading: true,
  error: null,
  caseItem: null,
  patient: null,
  assessments: [],
  selectedAssessment: null,
  vitals: null,
  clinicalNote: emptyClinicalNote,
  diagnoses: emptyDiagnoses,
};

function getErrorMessage(error: any) {
  console.error("useCaseDetail error:", error);

  if (error?.message) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tải được dữ liệu ca bệnh.";
}

export function useCaseDetail(caseId?: string, assessmentId?: string) {
  const [state, setState] = useState<UseCaseDetailState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!caseId) {
        setState({
          ...initialState,
          loading: false,
          error: "Thiếu caseId.",
        });
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        // 1) Load case
        const { data: caseData, error: caseError } = await supabase
          .from("cases")
          .select(
            "id, patient_id, case_code, title, primary_problem, primary_diagnosis, red_flag"
          )
          .eq("id", caseId)
          .maybeSingle();

        if (caseError) throw caseError;
        if (!caseData) {
          throw new Error(`Không tìm thấy ca bệnh với id: ${caseId}`);
        }

        // 2) Load patient
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("id, patient_code, full_name, date_of_birth, gender, occupation")
          .eq("id", caseData.patient_id)
          .maybeSingle();

        if (patientError) throw patientError;
        if (!patientData) {
          throw new Error(`Không tìm thấy bệnh nhân của ca: ${caseData.id}`);
        }

        // 3) Load assessments
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from("case_assessments")
          .select(
            "id, case_id, patient_id, assessment_no, assessment_date, chief_complaint, is_red_flag_present, status"
          )
          .eq("case_id", caseId)
          .order("assessment_date", { ascending: false });

        if (assessmentsError) throw assessmentsError;

        const nextAssessments: Assessment[] = (assessmentsData ?? []) as Assessment[];

        // 4) Select assessment by URL first, fallback latest
        const nextSelectedAssessment =
          nextAssessments.find((item) => item.id === assessmentId) ??
          nextAssessments[0] ??
          null;

        // 5) Load vitals
        let nextVitals: Vitals | null = null;

        if (nextSelectedAssessment?.id) {
          const { data: vitalsData, error: vitalsError } = await supabase
            .from("assessment_vitals")
            .select(
              "assessment_id, systolic_bp, diastolic_bp, heart_rate, temperature_c, respiratory_rate, spo2_percent, waist_cm, height_cm, weight_kg, bmi"
            )
            .eq("assessment_id", nextSelectedAssessment.id)
            .maybeSingle();

          if (vitalsError) throw vitalsError;
          nextVitals = (vitalsData as Vitals | null) ?? null;
        }

        // 6) Load clinical note
        let nextClinicalNote: ClinicalNoteSectionData = emptyClinicalNote;

        if (nextSelectedAssessment?.id) {
          const { data: noteData, error: noteError } = await supabase
            .from("assessment_notes")
            .select("*")
            .eq("assessment_id", nextSelectedAssessment.id)
            .maybeSingle();

          console.log("selectedAssessment.id =", nextSelectedAssessment.id);
          console.log("assessment_notes row =", noteData);

          if (noteError) throw noteError;

          nextClinicalNote = mapAssessmentToClinicalNote(
            (noteData as AssessmentNoteRow | null) ?? null
          );
        }

        // 7) Load diagnoses
        let nextDiagnoses: DiagnosesSectionData = emptyDiagnoses;

        if (nextSelectedAssessment?.id) {
          const { data: diagnosesData, error: diagnosesError } = await supabase
            .from("assessment_diagnoses")
            .select(
              "id, assessment_id, diagnosis_type, diagnosis_name, icd10_code, is_active, note, created_at"
            )
            .eq("assessment_id", nextSelectedAssessment.id)
            .order("created_at", { ascending: true });

          if (diagnosesError) throw diagnosesError;

          nextDiagnoses = mapAssessmentToDiagnoses(
            (diagnosesData ?? []) as AssessmentDiagnosisRow[]
          );
        }

        if (cancelled) return;

        setState({
          loading: false,
          error: null,
          caseItem: caseData as CaseItem,
          patient: patientData as Patient,
          assessments: nextAssessments,
          selectedAssessment: nextSelectedAssessment,
          vitals: nextVitals,
          clinicalNote: nextClinicalNote,
          diagnoses: nextDiagnoses,
        });
      } catch (error) {
        console.error("useCaseDetail load failed:", error);

        if (cancelled) return;

        setState({
          ...initialState,
          loading: false,
          error: getErrorMessage(error),
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [caseId, assessmentId]);

  return useMemo(
    () => ({
      loading: state.loading,
      error: state.error,
      caseItem: state.caseItem,
      patient: state.patient,
      assessments: state.assessments,
      selectedAssessment: state.selectedAssessment,
      vitals: state.vitals,
      clinicalNote: state.clinicalNote,
      diagnoses: state.diagnoses,
    }),
    [state]
  );
}