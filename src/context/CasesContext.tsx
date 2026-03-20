import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type SexLabel = "Nam" | "Nữ" | "Khác";
export type SexValue = "male" | "female" | "other";

export type Patient = {
  name: string;
  yob: number;
  sex: SexLabel;
  weightKg?: number;
  heightCm?: number;
};

export type CreateCasePayload = {
  patient: {
    fullName: string;
    sex: SexLabel;
    dateOfBirth?: string;
  };
  initialAssessment: {
    assessmentType: "initial" | "follow_up" | "review" | "urgent" | "discharge";
    assessedAt: string;
  };
  initialVitals?: {
    weightKg?: number;
    heightCm?: number;
  };
};

export type ToolResult = {
  id?: string;
  tool: string;
  when: string;
  inputs: unknown;
  outputs: unknown;
  summary?: string;
};

export type CaseItem = {
  id: string;
  caseCode: string;
  createdAt: string;
  patientId: string;
  latestAssessmentId?: string | null;
  patient: Patient;
  results: ToolResult[];
};

type PendingSave = {
  tool: string;
  inputs: unknown;
  outputs: unknown;
  summary?: string;
};

type DbPatientRow = {
  id: string;
  patient_code: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
};

type DbCaseRow = {
  id: string;
  patient_id: string;
  case_code: string;
  title: string;
  primary_problem: string | null;
  primary_diagnosis: string | null;
  case_status: string;
  priority_level: string;
  red_flag: boolean;
  opened_at: string;
  created_at: string;
  created_by: string | null;
  patients?: DbPatientRow | DbPatientRow[] | null;
};

type DbAssessmentRow = {
  id: string;
  case_id: string;
  patient_id: string;
  assessment_no: number;
  assessment_date: string;
  assessment_type: string;
  created_at: string;
};

type DbVitalsRow = {
  assessment_id: string;
  height_cm: number | null;
  weight_kg: number | null;
};

type DbCalculatorDefinitionRow = {
  id: string;
  code: string;
  name: string;
};

type DbCalculatorRunRow = {
  id: string;
  calculator_id: string;
  assessment_id: string | null;
  patient_id: string;
  case_id: string | null;
  run_at: string;
  result_value: number | null;
  result_text: string | null;
  risk_level: string | null;
  interpretation: string | null;
};

export type CasesContextValue = {
  cases: CaseItem[];
  activeCaseId: string | null;
  activeCase: CaseItem | null;
  loading: boolean;

  setActiveCaseId: (id: string | null) => void;
  closeCase: (id: string) => Promise<void>;

  isNewCaseModalOpen: boolean;
  openNewCaseModal: () => void;
  closeNewCaseModal: () => void;

  createCase: (payload: CreateCasePayload) => Promise<CaseItem | null>;

  saveToActiveCase: (payload: {
    tool: string;
    inputs: unknown;
    outputs: unknown;
    summary?: string;
  }) => Promise<void>;

  updateCasePatient: (id: string, patient: Patient) => Promise<void>;

  getCaseLabel: (c: CaseItem, opts?: { compact?: boolean }) => string;
  getActiveCaseLabel: (opts?: { compact?: boolean; fallback?: string }) => string;

  refreshCases: () => Promise<void>;
};

const CasesContext = createContext<CasesContextValue | null>(null);

function safeParse<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function mapSexLabelToDbValue(sex: SexLabel): SexValue {
  if (sex === "Nữ") return "female";
  if (sex === "Khác") return "other";
  return "male";
}

function mapDbSexToLabel(sex?: string | null): SexLabel {
  if (sex === "female") return "Nữ";
  if (sex === "other") return "Khác";
  return "Nam";
}

function buildActiveCaseStorageKey(userId?: string | null) {
  return userId ? `medical_tools_active_case_${userId}` : "medical_tools_active_case_guest";
}

function getYobFromDateOfBirth(dateOfBirth?: string | null) {
  if (!dateOfBirth) return new Date().getFullYear();
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return new Date().getFullYear();
  return date.getFullYear();
}

function makeCode(prefix: string) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yyyy}${mm}${dd}-${rand}`;
}

function extractResultValue(outputs: unknown): number | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    if (typeof obj.resultValue === "number" && Number.isFinite(obj.resultValue)) {
      return obj.resultValue;
    }
    if (typeof obj.result_value === "number" && Number.isFinite(obj.result_value)) {
      return obj.result_value;
    }
    if (typeof obj.score === "number" && Number.isFinite(obj.score)) {
      return obj.score;
    }
    if (typeof obj.value === "number" && Number.isFinite(obj.value)) {
      return obj.value;
    }
  }
  return null;
}

function extractResultText(outputs: unknown, summary?: string): string | null {
  if (summary?.trim()) return summary.trim();

  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    if (typeof obj.resultText === "string" && obj.resultText.trim()) {
      return obj.resultText.trim();
    }
    if (typeof obj.result_text === "string" && obj.result_text.trim()) {
      return obj.result_text.trim();
    }
    if (typeof obj.interpretation === "string" && obj.interpretation.trim()) {
      return obj.interpretation.trim();
    }
    if (typeof obj.category === "string" && obj.category.trim()) {
      return obj.category.trim();
    }
  }

  return null;
}

function extractRiskLevel(outputs: unknown): string | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    if (typeof obj.riskLevel === "string" && obj.riskLevel.trim()) {
      return obj.riskLevel.trim();
    }
    if (typeof obj.risk_level === "string" && obj.risk_level.trim()) {
      return obj.risk_level.trim();
    }
    if (typeof obj.risk === "string" && obj.risk.trim()) {
      return obj.risk.trim();
    }
  }

  return null;
}

function mapCalculatorRunToToolResult(
  row: DbCalculatorRunRow,
  calculatorName?: string
): ToolResult {
  return {
    id: row.id,
    tool: calculatorName || "calculator",
    when: row.run_at,
    inputs: {},
    outputs: {
      result_value: row.result_value,
      result_text: row.result_text,
      risk_level: row.risk_level,
      interpretation: row.interpretation,
    },
    summary: row.interpretation || row.result_text || row.risk_level || undefined,
  };
}

function normalizePatientInput(patient: Patient): Patient {
  return {
    name: patient.name.trim(),
    yob: clampInt(patient.yob, 1900, new Date().getFullYear()),
    sex: patient.sex,
    weightKg: patient.weightKg,
    heightCm: patient.heightCm,
  };
}

function mapDbCaseToCaseItem(args: {
  caseRow: DbCaseRow;
  latestAssessmentId?: string | null;
  latestVitals?: DbVitalsRow | null;
  calculatorRuns?: ToolResult[];
}): CaseItem {
  const patientRowRaw = Array.isArray(args.caseRow.patients)
    ? args.caseRow.patients[0] ?? null
    : args.caseRow.patients ?? null;

  const patientRow = patientRowRaw as DbPatientRow | null;

  return {
    id: args.caseRow.id,
    caseCode: args.caseRow.case_code,
    createdAt: args.caseRow.created_at,
    patientId: args.caseRow.patient_id,
    latestAssessmentId: args.latestAssessmentId ?? null,
    patient: {
      name: patientRow?.full_name ?? "",
      yob: getYobFromDateOfBirth(patientRow?.date_of_birth),
      sex: mapDbSexToLabel(patientRow?.gender),
      weightKg: args.latestVitals?.weight_kg ?? undefined,
      heightCm: args.latestVitals?.height_cm ?? undefined,
    },
    results: args.calculatorRuns ?? [],
  };
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  const storageKey = useMemo(() => buildActiveCaseStorageKey(user?.id), [user?.id]);

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(() =>
    safeParse<string | null>(
      localStorage.getItem("medical_tools_active_case_guest"),
      null
    )
  );
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = safeParse<string | null>(localStorage.getItem(storageKey), null);
    setActiveCaseId(saved);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(activeCaseId));
  }, [storageKey, activeCaseId]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setCases([]);
      setActiveCaseId(null);
      setPendingSave(null);
      setIsNewCaseModalOpen(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!activeCaseId) return;

    const exists = cases.some((c) => c.id === activeCaseId);
    if (!exists) {
      setActiveCaseId(cases[0]?.id ?? null);
    }
  }, [cases, activeCaseId]);

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) ?? null;
  }, [cases, activeCaseId]);

  async function refreshCases() {
    if (!isAuthenticated || !user?.id) {
      setCases([]);
      setActiveCaseId(null);
      return;
    }

    setLoading(true);

    try {
      const { data: caseRows, error: caseError } = await supabase
        .from("cases")
        .select(`
          id,
          patient_id,
          case_code,
          title,
          primary_problem,
          primary_diagnosis,
          case_status,
          priority_level,
          red_flag,
          opened_at,
          created_at,
          created_by,
          patients (
            id,
            patient_code,
            full_name,
            date_of_birth,
            gender
          )
        `)
        .eq("created_by", user.id)
        .order("opened_at", { ascending: false });

      if (caseError) throw caseError;

      const caseIds = (caseRows ?? []).map((row: any) => row.id as string);

      let assessmentRows: DbAssessmentRow[] = [];
      if (caseIds.length > 0) {
        const { data, error } = await supabase
          .from("case_assessments")
          .select("id, case_id, patient_id, assessment_no, assessment_date, assessment_type, created_at")
          .in("case_id", caseIds)
          .order("assessment_date", { ascending: false });

        if (error) throw error;
        assessmentRows = (data ?? []) as DbAssessmentRow[];
      }

      const latestAssessmentByCase = new Map<string, DbAssessmentRow>();
      for (const row of assessmentRows) {
        if (!latestAssessmentByCase.has(row.case_id)) {
          latestAssessmentByCase.set(row.case_id, row);
        }
      }

      const latestAssessmentIds = Array.from(latestAssessmentByCase.values()).map((row) => row.id);

      let vitalsRows: DbVitalsRow[] = [];
      if (latestAssessmentIds.length > 0) {
        const { data, error } = await supabase
          .from("assessment_vitals")
          .select("assessment_id, height_cm, weight_kg")
          .in("assessment_id", latestAssessmentIds);

        if (error) throw error;
        vitalsRows = (data ?? []) as DbVitalsRow[];
      }

      const vitalsByAssessment = new Map<string, DbVitalsRow>();
      for (const row of vitalsRows) {
        vitalsByAssessment.set(row.assessment_id, row);
      }

      let calculatorRuns: DbCalculatorRunRow[] = [];
      if (caseIds.length > 0) {
        const { data, error } = await supabase
          .from("calculator_runs")
          .select("id, calculator_id, assessment_id, patient_id, case_id, run_at, result_value, result_text, risk_level, interpretation")
          .in("case_id", caseIds)
          .order("run_at", { ascending: false });

        if (error) throw error;
        calculatorRuns = (data ?? []) as DbCalculatorRunRow[];
      }

      const calculatorIds = Array.from(new Set(calculatorRuns.map((r) => r.calculator_id)));

      let calculatorDefs: DbCalculatorDefinitionRow[] = [];
      if (calculatorIds.length > 0) {
        const { data, error } = await supabase
          .from("calculator_definitions")
          .select("id, code, name")
          .in("id", calculatorIds);

        if (error) throw error;
        calculatorDefs = (data ?? []) as DbCalculatorDefinitionRow[];
      }

      const calculatorNameById = new Map<string, string>();
      for (const def of calculatorDefs) {
        calculatorNameById.set(def.id, def.name || def.code);
      }

      const resultsByCaseId = new Map<string, ToolResult[]>();
      for (const row of calculatorRuns) {
        if (!row.case_id) continue;
        const arr = resultsByCaseId.get(row.case_id) ?? [];
        arr.push(mapCalculatorRunToToolResult(row, calculatorNameById.get(row.calculator_id)));
        resultsByCaseId.set(row.case_id, arr);
      }

      const mappedCases = ((caseRows ?? []) as DbCaseRow[]).map((row) => {
        const latestAssessment = latestAssessmentByCase.get(row.id);
        const latestVitals = latestAssessment
          ? vitalsByAssessment.get(latestAssessment.id) ?? null
          : null;

        return mapDbCaseToCaseItem({
          caseRow: row,
          latestAssessmentId: latestAssessment?.id ?? null,
          latestVitals,
          calculatorRuns: resultsByCaseId.get(row.id) ?? [],
        });
      });

      setCases(mappedCases);

      setActiveCaseId((prev) => {
        if (prev && mappedCases.some((c) => c.id === prev)) return prev;
        return mappedCases[0]?.id ?? null;
      });
    } catch (error) {
      console.error("REFRESH CASES ERROR:", error);
      setCases([]);
      setActiveCaseId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCases();
  }, [isAuthenticated, user?.id]);

  function openNewCaseModal() {
    setIsNewCaseModalOpen(true);
  }

  function closeNewCaseModal() {
    setIsNewCaseModalOpen(false);
  }

  async function closeCase(id: string) {
    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("id", id)
      .eq("created_by", user?.id ?? "");

    if (error) {
      console.error("DELETE CASE ERROR:", error);
      throw new Error(error.message);
    }

    setCases((prev) => {
      const next = prev.filter((c) => c.id !== id);

      setActiveCaseId((prevActive) => {
        if (prevActive !== id) return prevActive;
        return next[0]?.id ?? null;
      });

      return next;
    });
  }

  async function createCase(payload: CreateCasePayload): Promise<CaseItem | null> {
    if (!user?.id) {
      throw new Error("Chưa đăng nhập");
    }

    const fullName = payload.patient.fullName.trim();
    if (!fullName) {
      throw new Error("Họ tên không được để trống");
    }

    const patientCode = makeCode("PT");
    const caseCode = makeCode("CA");
    const assessedAt = payload.initialAssessment.assessedAt || new Date().toISOString();
    const assessmentType = payload.initialAssessment.assessmentType || "initial";

    const { data: insertedPatient, error: patientError } = await supabase
      .from("patients")
      .insert([
        {
          patient_code: patientCode,
          full_name: fullName,
          date_of_birth: payload.patient.dateOfBirth ?? null,
          gender: mapSexLabelToDbValue(payload.patient.sex),
        },
      ])
      .select("id, patient_code, full_name, date_of_birth, gender")
      .single();

    if (patientError) {
      console.error("CREATE PATIENT ERROR:", patientError);
      throw new Error(patientError.message);
    }

    const { data: insertedCase, error: caseError } = await supabase
      .from("cases")
      .insert([
        {
          patient_id: insertedPatient.id,
          case_code: caseCode,
          title: `Ca - ${fullName}`,
          case_status: "active",
          priority_level: "normal",
          red_flag: false,
          created_by: user.id,
        },
      ])
      .select("id, patient_id, case_code, title, primary_problem, primary_diagnosis, case_status, priority_level, red_flag, opened_at, created_at, created_by")
      .single();

    if (caseError) {
      console.error("CREATE CASE ERROR:", caseError);
      throw new Error(caseError.message);
    }

    const { data: insertedAssessment, error: assessmentError } = await supabase
      .from("case_assessments")
      .insert([
        {
          case_id: insertedCase.id,
          patient_id: insertedPatient.id,
          assessment_no: 1,
          assessment_date: assessedAt,
          assessment_type: assessmentType,
          care_setting: "outpatient",
          status: "draft",
          created_by: user.id,
        },
      ])
      .select("id, case_id, patient_id, assessment_no, assessment_date, assessment_type, created_at")
      .single();

    if (assessmentError) {
      console.error("CREATE ASSESSMENT ERROR:", assessmentError);
      throw new Error(assessmentError.message);
    }

    let vitalsRow: DbVitalsRow | null = null;

    if (
      payload.initialVitals?.weightKg !== undefined ||
      payload.initialVitals?.heightCm !== undefined
    ) {
      const { data: insertedVitals, error: vitalsError } = await supabase
        .from("assessment_vitals")
        .insert([
          {
            assessment_id: insertedAssessment.id,
            weight_kg: payload.initialVitals?.weightKg ?? null,
            height_cm: payload.initialVitals?.heightCm ?? null,
          },
        ])
        .select("assessment_id, height_cm, weight_kg")
        .single();

      if (vitalsError) {
        console.error("CREATE VITALS ERROR:", vitalsError);
        throw new Error(vitalsError.message);
      }

      vitalsRow = insertedVitals as DbVitalsRow;
    }

    const createdCase = mapDbCaseToCaseItem({
      caseRow: {
        ...insertedCase,
        patients: insertedPatient,
      },
      latestAssessmentId: insertedAssessment.id,
      latestVitals: vitalsRow,
      calculatorRuns: [],
    });

    if (pendingSave) {
      const { data: calculatorDef, error: calculatorDefError } = await supabase
        .from("calculator_definitions")
        .select("id, code, name")
        .eq("code", pendingSave.tool)
        .single();

      if (calculatorDefError) {
        console.error("FIND CALCULATOR DEF ERROR:", calculatorDefError);
        throw new Error(calculatorDefError.message);
      }

      const { data: insertedRun, error: runError } = await supabase
        .from("calculator_runs")
        .insert([
          {
            calculator_id: calculatorDef.id,
            patient_id: insertedPatient.id,
            case_id: insertedCase.id,
            assessment_id: insertedAssessment.id,
            run_at: new Date().toISOString(),
            result_value: extractResultValue(pendingSave.outputs),
            result_text: extractResultText(pendingSave.outputs, pendingSave.summary),
            risk_level: extractRiskLevel(pendingSave.outputs),
            interpretation: pendingSave.summary ?? null,
            result_json: pendingSave.outputs,
            created_by: user.id,
          },
        ])
        .select("id, calculator_id, assessment_id, patient_id, case_id, run_at, result_value, result_text, risk_level, interpretation")
        .single();

      if (runError) {
        console.error("CREATE PENDING CALCULATOR RUN ERROR:", runError);
        throw new Error(runError.message);
      }

      if (insertedRun) {
        createdCase.results = [
          mapCalculatorRunToToolResult(
            insertedRun as DbCalculatorRunRow,
            calculatorDef.name || calculatorDef.code
          ),
        ];
      }
    }

    setCases((prev) => [createdCase, ...prev]);
    setActiveCaseId(createdCase.id);
    setIsNewCaseModalOpen(false);
    setPendingSave(null);

    return createdCase;
  }

  async function saveToActiveCase(payload: {
    tool: string;
    inputs: unknown;
    outputs: unknown;
    summary?: string;
  }) {
    if (!user?.id) {
      throw new Error("Chưa đăng nhập");
    }

    if (!activeCaseId) {
      setPendingSave({
        tool: payload.tool,
        inputs: payload.inputs,
        outputs: payload.outputs,
        summary: payload.summary,
      });
      setIsNewCaseModalOpen(true);
      return;
    }

    const active = cases.find((c) => c.id === activeCaseId) ?? null;
    if (!active) {
      throw new Error("Không tìm thấy ca đang chọn");
    }

    const targetAssessmentId = active.latestAssessmentId ?? null;
    if (!targetAssessmentId) {
      throw new Error("Ca bệnh chưa có lần đánh giá để lưu kết quả");
    }

    const { data: calculatorDef, error: calculatorDefError } = await supabase
      .from("calculator_definitions")
      .select("id, code, name")
      .eq("code", payload.tool)
      .single();

    if (calculatorDefError) {
      console.error("FIND CALCULATOR DEF ERROR:", calculatorDefError);
      throw new Error(calculatorDefError.message);
    }

    const { data: insertedRun, error } = await supabase
      .from("calculator_runs")
      .insert([
        {
          calculator_id: calculatorDef.id,
          patient_id: active.patientId,
          case_id: activeCaseId,
          assessment_id: targetAssessmentId,
          run_at: new Date().toISOString(),
          result_value: extractResultValue(payload.outputs),
          result_text: extractResultText(payload.outputs, payload.summary),
          risk_level: extractRiskLevel(payload.outputs),
          interpretation: payload.summary ?? null,
          result_json: payload.outputs,
          created_by: user.id,
        },
      ])
      .select("id, calculator_id, assessment_id, patient_id, case_id, run_at, result_value, result_text, risk_level, interpretation")
      .single();

    if (error) {
      console.error("SAVE CALCULATOR RUN ERROR:", error);
      throw new Error(error.message);
    }

    const createdItem: ToolResult = insertedRun
      ? mapCalculatorRunToToolResult(
          insertedRun as DbCalculatorRunRow,
          calculatorDef.name || calculatorDef.code
        )
      : {
          tool: calculatorDef.name || payload.tool,
          when: new Date().toISOString(),
          inputs: payload.inputs,
          outputs: payload.outputs,
          summary: payload.summary,
        };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCaseId) return c;
        return {
          ...c,
          results: [createdItem, ...c.results],
        };
      })
    );
  }

  async function updateCasePatient(id: string, patient: Patient) {
    const normalizedPatient = normalizePatientInput(patient);
    const existingCase = cases.find((c) => c.id === id);

    if (!existingCase) {
      throw new Error("Không tìm thấy ca bệnh");
    }

    const dateOfBirth = `${normalizedPatient.yob}-01-01`;

    const { error: patientError } = await supabase
      .from("patients")
      .update({
        full_name: normalizedPatient.name,
        date_of_birth: dateOfBirth,
        gender: mapSexLabelToDbValue(normalizedPatient.sex),
      })
      .eq("id", existingCase.patientId);

    if (patientError) {
      console.error("UPDATE PATIENT ERROR:", patientError);
      throw new Error(patientError.message);
    }

    const { error: caseError } = await supabase
      .from("cases")
      .update({
        title: `Ca - ${normalizedPatient.name}`,
      })
      .eq("id", id);

    if (caseError) {
      console.error("UPDATE CASE ERROR:", caseError);
      throw new Error(caseError.message);
    }

    if (existingCase.latestAssessmentId) {
      const { data: existingVitals, error: vitalsReadError } = await supabase
        .from("assessment_vitals")
        .select("assessment_id")
        .eq("assessment_id", existingCase.latestAssessmentId)
        .maybeSingle();

      if (vitalsReadError) {
        console.error("READ VITALS ERROR:", vitalsReadError);
        throw new Error(vitalsReadError.message);
      }

      if (existingVitals) {
        const { error: vitalsUpdateError } = await supabase
          .from("assessment_vitals")
          .update({
            weight_kg: normalizedPatient.weightKg ?? null,
            height_cm: normalizedPatient.heightCm ?? null,
          })
          .eq("assessment_id", existingCase.latestAssessmentId);

        if (vitalsUpdateError) {
          console.error("UPDATE VITALS ERROR:", vitalsUpdateError);
          throw new Error(vitalsUpdateError.message);
        }
      } else if (
        normalizedPatient.weightKg !== undefined ||
        normalizedPatient.heightCm !== undefined
      ) {
        const { error: vitalsInsertError } = await supabase
          .from("assessment_vitals")
          .insert([
            {
              assessment_id: existingCase.latestAssessmentId,
              weight_kg: normalizedPatient.weightKg ?? null,
              height_cm: normalizedPatient.heightCm ?? null,
            },
          ]);

        if (vitalsInsertError) {
          console.error("INSERT VITALS ERROR:", vitalsInsertError);
          throw new Error(vitalsInsertError.message);
        }
      }
    }

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          patient: { ...normalizedPatient },
        };
      })
    );
  }

  function getCaseLabel(c: CaseItem, opts?: { compact?: boolean }) {
    if (opts?.compact) {
      return `${c.patient.name} • ${c.patient.yob}`;
    }
    return `${c.patient.name} • ${c.patient.yob} • ${c.patient.sex}`;
  }

  function getActiveCaseLabel(opts?: { compact?: boolean; fallback?: string }) {
    const fallback = opts?.fallback ?? "Chưa chọn ca";
    if (!activeCase) return fallback;
    return getCaseLabel(activeCase, { compact: opts?.compact });
  }

  const value = useMemo<CasesContextValue>(
    () => ({
      cases,
      activeCaseId,
      activeCase,
      loading,

      setActiveCaseId,
      closeCase,

      isNewCaseModalOpen,
      openNewCaseModal,
      closeNewCaseModal,

      createCase,
      saveToActiveCase,
      updateCasePatient,

      getCaseLabel,
      getActiveCaseLabel,
      refreshCases,
    }),
    [cases, activeCaseId, activeCase, loading, isNewCaseModalOpen]
  );

  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) {
    throw new Error("useCases must be used within CasesProvider");
  }
  return ctx;
}