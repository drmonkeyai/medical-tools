import { useCallback, useEffect, useMemo, useState } from "react";
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

import { mapAssessmentToTreatment } from "../../../modules/cases/treatment/mapper";
import type {
  AssessmentTreatmentRow,
  TreatmentSectionData,
} from "../../../modules/cases/treatment/types";

import { mapAssessmentToPlan } from "../../../modules/cases/plan/mapper";
import type {
  AssessmentPlanItemRow,
  PlanSectionData,
} from "../../../modules/cases/plan/types";

import { mapAssessmentToRedFlags } from "../../../modules/cases/red-flags/mapper";
import type {
  AssessmentRedFlagRow,
  RedFlagsSectionData,
} from "../../../modules/cases/red-flags/types";

import { mapAssessmentToObservations } from "../../../modules/cases/observations/mapper";
import type {
  AssessmentObservationRow,
  ObservationsSectionData,
} from "../../../modules/cases/observations/types";

import { mapCalculatorRunsSection } from "../../../modules/cases/calculator-runs/mapper";
import type {
  CalculatorDefinitionRow,
  CalculatorRunInputRow,
  CalculatorRunRow,
  CalculatorRunsSectionData,
} from "../../../modules/cases/calculator-runs/types";

export type CaseDetailPatient = {
  id: string;
  patient_code: string | null;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  occupation?: string | null;
};

export type CaseDetailCaseItem = {
  id: string;
  patient_id: string;
  case_code?: string | null;
  title?: string | null;
  primary_problem?: string | null;
  primary_diagnosis?: string | null;
  red_flag?: boolean | null;
};

export type CaseDetailAssessment = {
  id: string;
  case_id: string;
  patient_id: string;
  assessment_no: number | null;
  assessment_date?: string | null;
  chief_complaint?: string | null;
  is_red_flag_present?: boolean | null;
  status?: string | null;
};

export type CaseDetailVitals = {
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
  sectionLoading: boolean;
  error: string | null;
  caseItem: CaseDetailCaseItem | null;
  patient: CaseDetailPatient | null;
  assessments: CaseDetailAssessment[];
  selectedAssessment: CaseDetailAssessment | null;
  vitals: CaseDetailVitals | null;
  clinicalNote: ClinicalNoteSectionData;
  diagnoses: DiagnosesSectionData;
  treatment: TreatmentSectionData;
  plan: PlanSectionData;
  redFlags: RedFlagsSectionData;
  observations: ObservationsSectionData;
  calculatorRuns: CalculatorRunsSectionData;
};

type SectionReloadState = {
  vitals: number;
  clinicalNote: number;
  diagnoses: number;
  treatment: number;
  plan: number;
  redFlags: number;
  observations: number;
  calculatorRuns: number;
};

const emptyClinicalNote = mapAssessmentToClinicalNote(null);
const emptyDiagnoses = mapAssessmentToDiagnoses([]);
const emptyTreatment = mapAssessmentToTreatment([]);
const emptyPlan = mapAssessmentToPlan([]);
const emptyRedFlags = mapAssessmentToRedFlags([]);
const emptyObservations = mapAssessmentToObservations([]);
const emptyCalculatorRuns = mapCalculatorRunsSection({
  runs: [],
  definitions: [],
  runInputs: [],
});

const initialState: UseCaseDetailState = {
  loading: true,
  sectionLoading: false,
  error: null,
  caseItem: null,
  patient: null,
  assessments: [],
  selectedAssessment: null,
  vitals: null,
  clinicalNote: emptyClinicalNote,
  diagnoses: emptyDiagnoses,
  treatment: emptyTreatment,
  plan: emptyPlan,
  redFlags: emptyRedFlags,
  observations: emptyObservations,
  calculatorRuns: emptyCalculatorRuns,
};

const initialSectionReloadState: SectionReloadState = {
  vitals: 0,
  clinicalNote: 0,
  diagnoses: 0,
  treatment: 0,
  plan: 0,
  redFlags: 0,
  observations: 0,
  calculatorRuns: 0,
};

function getErrorMessage(error: unknown) {
  console.error("useCaseDetail error:", error);

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tải được dữ liệu ca bệnh.";
}

function bumpSectionKey(
  setSectionReloadKeys: React.Dispatch<React.SetStateAction<SectionReloadState>>,
  key: keyof SectionReloadState
) {
  setSectionReloadKeys((prev) => ({
    ...prev,
    [key]: prev[key] + 1,
  }));
}

export function useCaseDetail(caseId?: string, assessmentId?: string) {
  const [state, setState] = useState<UseCaseDetailState>(initialState);
  const [shellReloadKey, setShellReloadKey] = useState(0);
  const [sectionReloadKeys, setSectionReloadKeys] =
    useState<SectionReloadState>(initialSectionReloadState);

  const refresh = useCallback(() => {
    setSectionReloadKeys((prev) => ({
      vitals: prev.vitals + 1,
      clinicalNote: prev.clinicalNote + 1,
      diagnoses: prev.diagnoses + 1,
      treatment: prev.treatment + 1,
      plan: prev.plan + 1,
      redFlags: prev.redFlags + 1,
      observations: prev.observations + 1,
      calculatorRuns: prev.calculatorRuns + 1,
    }));
  }, []);

  const refreshShell = useCallback(() => {
    setShellReloadKey((prev) => prev + 1);
  }, []);

  const refreshVitals = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "vitals");
  }, []);

  const refreshClinicalNote = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "clinicalNote");
  }, []);

  const refreshDiagnoses = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "diagnoses");
  }, []);

  const refreshTreatment = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "treatment");
  }, []);

  const refreshPlan = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "plan");
  }, []);

  const refreshRedFlags = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "redFlags");
  }, []);

  const refreshObservations = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "observations");
  }, []);

  const refreshCalculatorRuns = useCallback(() => {
    bumpSectionKey(setSectionReloadKeys, "calculatorRuns");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadShell() {
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

        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("id, patient_code, full_name, date_of_birth, gender, occupation")
          .eq("id", caseData.patient_id)
          .maybeSingle();

        if (patientError) throw patientError;
        if (!patientData) {
          throw new Error(`Không tìm thấy bệnh nhân của ca: ${caseData.id}`);
        }

        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from("case_assessments")
          .select(
            "id, case_id, patient_id, assessment_no, assessment_date, chief_complaint, is_red_flag_present, status"
          )
          .eq("case_id", caseId)
          .order("assessment_date", { ascending: false });

        if (assessmentsError) throw assessmentsError;

        const nextAssessments = (assessmentsData ?? []) as CaseDetailAssessment[];
        const nextSelectedAssessment =
          nextAssessments.find((item) => item.id === assessmentId) ??
          nextAssessments[0] ??
          null;

        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          caseItem: caseData as CaseDetailCaseItem,
          patient: patientData as CaseDetailPatient,
          assessments: nextAssessments,
          selectedAssessment: nextSelectedAssessment,
        }));
      } catch (error) {
        console.error("useCaseDetail shell load failed:", error);

        if (cancelled) return;

        setState({
          ...initialState,
          loading: false,
          error: getErrorMessage(error),
        });
      }
    }

    void loadShell();

    return () => {
      cancelled = true;
    };
  }, [caseId, assessmentId, shellReloadKey]);

  useEffect(() => {
    setState((prev) => {
      const nextSelectedAssessment =
        prev.assessments.find((item) => item.id === assessmentId) ??
        prev.assessments[0] ??
        null;

      return {
        ...prev,
        selectedAssessment: nextSelectedAssessment,
        vitals: null,
        clinicalNote: emptyClinicalNote,
        diagnoses: emptyDiagnoses,
        treatment: emptyTreatment,
        plan: emptyPlan,
        redFlags: emptyRedFlags,
        observations: emptyObservations,
        calculatorRuns: emptyCalculatorRuns,
      };
    });
  }, [assessmentId]);

  const selectedAssessmentId = state.selectedAssessment?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadSections() {
      if (!selectedAssessmentId) {
        setState((prev) => ({
          ...prev,
          sectionLoading: false,
          vitals: null,
          clinicalNote: emptyClinicalNote,
          diagnoses: emptyDiagnoses,
          treatment: emptyTreatment,
          plan: emptyPlan,
          redFlags: emptyRedFlags,
          observations: emptyObservations,
          calculatorRuns: emptyCalculatorRuns,
        }));
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          sectionLoading: true,
          error: null,
        }));

        const [
          vitalsResult,
          noteResult,
          diagnosesResult,
          treatmentsResult,
          planResult,
          redFlagsResult,
          observationsResult,
          calculatorRunsResult,
        ] = await Promise.all([
          supabase
            .from("assessment_vitals")
            .select(
              "assessment_id, systolic_bp, diastolic_bp, heart_rate, temperature_c, respiratory_rate, spo2_percent, waist_cm, height_cm, weight_kg, bmi"
            )
            .eq("assessment_id", selectedAssessmentId)
            .maybeSingle(),
          supabase
            .from("assessment_notes")
            .select("*")
            .eq("assessment_id", selectedAssessmentId)
            .maybeSingle(),
          supabase
            .from("assessment_diagnoses")
            .select(
              "id, assessment_id, diagnosis_type, diagnosis_name, icd10_code, is_active, note, created_at"
            )
            .eq("assessment_id", selectedAssessmentId)
            .order("created_at", { ascending: true }),
          supabase
            .from("assessment_treatments")
            .select(
              "id, assessment_id, treatment_type, treatment_name, description, dose_or_frequency, duration, instructions, status, created_at, updated_at"
            )
            .eq("assessment_id", selectedAssessmentId)
            .order("created_at", { ascending: true }),
          supabase
            .from("assessment_plan_items")
            .select(
              "id, assessment_id, plan_type, description, due_date, is_completed, completed_at, created_at"
            )
            .eq("assessment_id", selectedAssessmentId)
            .order("created_at", { ascending: true }),
          supabase
            .from("assessment_red_flags")
            .select(
              "id, assessment_id, flag_name, flag_code, is_present, severity, note"
            )
            .eq("assessment_id", selectedAssessmentId),
          supabase
            .from("assessment_observations")
            .select(
              "id, assessment_id, observation_code, observation_label, value_type, value_text, value_numeric, value_boolean, value_date, value_json, unit, normal_flag, note, observed_at"
            )
            .eq("assessment_id", selectedAssessmentId)
            .order("observed_at", { ascending: false }),
          supabase
            .from("calculator_runs")
            .select(
              "id, calculator_id, assessment_id, patient_id, case_id, run_at, result_label, result_value, result_text, risk_level, interpretation, result_json"
            )
            .eq("assessment_id", selectedAssessmentId)
            .order("run_at", { ascending: false }),
        ]);

        if (vitalsResult.error) throw vitalsResult.error;
        if (noteResult.error) throw noteResult.error;
        if (diagnosesResult.error) throw diagnosesResult.error;
        if (treatmentsResult.error) throw treatmentsResult.error;
        if (planResult.error) throw planResult.error;
        if (redFlagsResult.error) throw redFlagsResult.error;
        if (observationsResult.error) throw observationsResult.error;
        if (calculatorRunsResult.error) throw calculatorRunsResult.error;

        const runRows = (calculatorRunsResult.data ?? []) as CalculatorRunRow[];
        const calculatorIds = Array.from(
          new Set(runRows.map((row) => row.calculator_id))
        );
        const runIds = runRows.map((row) => row.id);

        let definitionRows: CalculatorDefinitionRow[] = [];
        if (calculatorIds.length > 0) {
          const { data: defsData, error: defsError } = await supabase
            .from("calculator_definitions")
            .select("id, code, name")
            .in("id", calculatorIds);

          if (defsError) throw defsError;
          definitionRows = (defsData ?? []) as CalculatorDefinitionRow[];
        }

        let runInputRows: CalculatorRunInputRow[] = [];
        if (runIds.length > 0) {
          const { data: inputsData, error: inputsError } = await supabase
            .from("calculator_run_inputs")
            .select(
              "id, calculator_run_id, input_key, input_label, input_type, input_value_text, input_value_numeric, input_value_boolean, input_value_date, input_value_json, unit, source_observation_id, created_at"
            )
            .in("calculator_run_id", runIds)
            .order("created_at", { ascending: true });

          if (inputsError) throw inputsError;
          runInputRows = (inputsData ?? []) as CalculatorRunInputRow[];
        }

        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          sectionLoading: false,
          vitals: (vitalsResult.data as CaseDetailVitals | null) ?? null,
          clinicalNote: mapAssessmentToClinicalNote(
            (noteResult.data as AssessmentNoteRow | null) ?? null
          ),
          diagnoses: mapAssessmentToDiagnoses(
            (diagnosesResult.data ?? []) as AssessmentDiagnosisRow[]
          ),
          treatment: mapAssessmentToTreatment(
            (treatmentsResult.data ?? []) as AssessmentTreatmentRow[]
          ),
          plan: mapAssessmentToPlan(
            (planResult.data ?? []) as AssessmentPlanItemRow[]
          ),
          redFlags: mapAssessmentToRedFlags(
            (redFlagsResult.data ?? []) as AssessmentRedFlagRow[]
          ),
          observations: mapAssessmentToObservations(
            (observationsResult.data ?? []) as AssessmentObservationRow[]
          ),
          calculatorRuns: mapCalculatorRunsSection({
            runs: runRows,
            definitions: definitionRows,
            runInputs: runInputRows,
          }),
        }));
      } catch (error) {
        console.error("useCaseDetail section load failed:", error);

        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          sectionLoading: false,
          error: getErrorMessage(error),
        }));
      }
    }

    void loadSections();

    return () => {
      cancelled = true;
    };
  }, [
    selectedAssessmentId,
    sectionReloadKeys.vitals,
    sectionReloadKeys.clinicalNote,
    sectionReloadKeys.diagnoses,
    sectionReloadKeys.treatment,
    sectionReloadKeys.plan,
    sectionReloadKeys.redFlags,
    sectionReloadKeys.observations,
    sectionReloadKeys.calculatorRuns,
  ]);

  return useMemo(
    () => ({
      loading: state.loading,
      sectionLoading: state.sectionLoading,
      error: state.error,
      caseItem: state.caseItem,
      patient: state.patient,
      assessments: state.assessments,
      selectedAssessment: state.selectedAssessment,
      vitals: state.vitals,
      clinicalNote: state.clinicalNote,
      diagnoses: state.diagnoses,
      treatment: state.treatment,
      plan: state.plan,
      redFlags: state.redFlags,
      observations: state.observations,
      calculatorRuns: state.calculatorRuns,
      refresh,
      refreshShell,
      refreshVitals,
      refreshClinicalNote,
      refreshDiagnoses,
      refreshTreatment,
      refreshPlan,
      refreshRedFlags,
      refreshObservations,
      refreshCalculatorRuns,
    }),
    [
      state,
      refresh,
      refreshShell,
      refreshVitals,
      refreshClinicalNote,
      refreshDiagnoses,
      refreshTreatment,
      refreshPlan,
      refreshRedFlags,
      refreshObservations,
      refreshCalculatorRuns,
    ]
  );
}