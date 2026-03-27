import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

export type SexLabel = "Nam" | "Nữ" | "Khác";
export type SexValue = "male" | "female" | "other";

export type Patient = {
  name: string;
  yob: number;
  sex: SexLabel;

  /**
   * Legacy compatibility only.
   * Calculator cũ vẫn đang đọc weightKg / heightCm từ activeCase.patient.
   * Về lâu dài nên chuyển sang latestVitals ở case list
   * hoặc chỉ load ở case detail.
   */
  weightKg?: number;
  heightCm?: number;
};

export type CreateCasePayload = {
  patient: {
    fullName: string;
    sex: SexLabel;
    dateOfBirth?: string;
    occupation?: string;
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

type DbPatientRow = {
  id: string;
  patient_code: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  occupation?: string | null;
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

type PendingSave = {
  tool: string;
  inputs: unknown;
  outputs: unknown;
  summary?: string;
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

  /**
   * Legacy compatibility only.
   * Calculator cũ vẫn gọi hàm này.
   */
  saveToActiveCase: (payload: PendingSave) => Promise<void>;

  /**
   * Legacy compatibility only.
   * Về lâu dài nên tách thành updatePatientProfile + upsertAssessmentVitals.
   */
  updateCasePatient: (id: string, patient: Patient) => Promise<void>;

  getCaseLabel: (c: CaseItem, opts?: { compact?: boolean }) => string;
  getActiveCaseLabel: (opts?: { compact?: boolean; fallback?: string }) => string;

  refreshCases: () => Promise<void>;
};

const CasesContext = createContext<CasesContextValue | null>(null);

const ACTIVE_CASE_STORAGE_KEY = "medical-tools.active-case-id";

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
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
  const normalized = (sex ?? "").toLowerCase().trim();
  if (normalized === "female") return "Nữ";
  if (normalized === "other") return "Khác";
  return "Nam";
}

function getYobFromDate(dateOfBirth?: string | null) {
  if (!dateOfBirth) return new Date().getFullYear() - 30;
  const year = Number(String(dateOfBirth).slice(0, 4));
  if (!Number.isFinite(year)) return new Date().getFullYear() - 30;
  return clampInt(year, 1900, new Date().getFullYear());
}

function buildDateOfBirthFromYob(yob: number) {
  const safeYear = clampInt(yob, 1900, new Date().getFullYear());
  return `${safeYear}-01-01`;
}

function generatePatientCode() {
  return `PT-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

function generateCaseCode() {
  return `CA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(
    new Date().getDate()
  ).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function formatCaseLabel(c: CaseItem, opts?: { compact?: boolean }) {
  const compact = Boolean(opts?.compact);
  const base = `${c.patient.name} • ${c.patient.yob} • ${c.patient.sex}`;
  if (compact) return base;
  return `${c.caseCode} • ${base}`;
}

function tryGetRiskLevel(outputs: unknown): string | null {
  if (!outputs || typeof outputs !== "object") return null;

  const value =
    (outputs as Record<string, unknown>).riskLevel ??
    (outputs as Record<string, unknown>).risk_level ??
    (outputs as Record<string, unknown>).level;

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function tryGetInterpretation(outputs: unknown): string | null {
  if (!outputs || typeof outputs !== "object") return null;

  const value =
    (outputs as Record<string, unknown>).interpretation ??
    (outputs as Record<string, unknown>).detail ??
    (outputs as Record<string, unknown>).text;

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function tryGetNumericResult(outputs: unknown): number | null {
  if (!outputs || typeof outputs !== "object") return null;

  const candidateKeys = [
    "resultValue",
    "result_value",
    "score",
    "bmi",
    "bsa",
    "egfr",
    "crcl",
    "value",
    "total",
  ];

  for (const key of candidateKeys) {
    const value = (outputs as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type CalculatorRunInputInsertRow = {
  calculator_run_id: string;
  input_key: string;
  input_label: string;
  input_type: string;
  input_value_text: string | null;
  input_value_numeric: number | null;
  input_value_boolean: boolean | null;
  input_value_date: string | null;
  input_value_json: unknown | null;
  unit: string | null;
  source_observation_id: string | null;
};

function toTitleCase(input: string) {
  return input
    .replace(/\[(\d+)\]/g, " $1 ")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeKey(path: string) {
  return toTitleCase(path || "Input");
}

function isLikelyDateString(value: string) {
  if (!value.trim()) return false;

  const directDate = /^\d{4}-\d{2}-\d{2}$/;
  const isoDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

  return directDate.test(value) || isoDateTime.test(value);
}

function createInputRow(
  calculatorRunId: string,
  key: string,
  value: unknown
): CalculatorRunInputInsertRow | null {
  const normalizedKey = key.trim();
  if (!normalizedKey) return null;

  const base: CalculatorRunInputInsertRow = {
    calculator_run_id: calculatorRunId,
    input_key: normalizedKey,
    input_label: humanizeKey(normalizedKey),
    input_type: "text",
    input_value_text: null,
    input_value_numeric: null,
    input_value_boolean: null,
    input_value_date: null,
    input_value_json: null,
    unit: null,
    source_observation_id: null,
  };

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return {
      ...base,
      input_type: "numeric",
      input_value_numeric: Number.isFinite(value) ? value : null,
      input_value_text: Number.isFinite(value) ? String(value) : null,
    };
  }

  if (typeof value === "boolean") {
    return {
      ...base,
      input_type: "boolean",
      input_value_boolean: value,
      input_value_text: value ? "true" : "false",
    };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (isLikelyDateString(trimmed)) {
      return {
        ...base,
        input_type: "date",
        input_value_date: trimmed,
        input_value_text: trimmed,
      };
    }

    return {
      ...base,
      input_type: "text",
      input_value_text: trimmed,
    };
  }

  return {
    ...base,
    input_type: "json",
    input_value_json: value,
    input_value_text: JSON.stringify(value),
  };
}

function flattenInputs(
  calculatorRunId: string,
  value: unknown,
  path = ""
): CalculatorRunInputInsertRow[] {
  if (value === null || value === undefined) return [];

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const row = createInputRow(calculatorRunId, path || "value", value);
    return row ? [row] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenInputs(
        calculatorRunId,
        item,
        path ? `${path}[${index}]` : `[${index}]`
      )
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) return [];

    return entries.flatMap(([childKey, childValue]) =>
      flattenInputs(
        calculatorRunId,
        childValue,
        path ? `${path}.${childKey}` : childKey
      )
    );
  }

  const row = createInputRow(calculatorRunId, path || "value", value);
  return row ? [row] : [];
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [activeCaseId, setActiveCaseIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CASE_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  const setActiveCaseId = useCallback((id: string | null) => {
    setActiveCaseIdState(id);
    try {
      if (id) {
        localStorage.setItem(ACTIVE_CASE_STORAGE_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_CASE_STORAGE_KEY);
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const refreshCases = useCallback(async () => {
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;

      let query = supabase
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
            gender,
            occupation
          )
        `)
        .order("opened_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (currentUser?.id) {
        query = query.eq("created_by", currentUser.id);
      }

      const { data: caseRows, error: caseError } = await query;
      if (caseError) throw caseError;

      const safeCaseRows = (caseRows ?? []) as DbCaseRow[];
      const caseIds = safeCaseRows.map((row) => row.id);

      let assessmentRows: DbAssessmentRow[] = [];
      if (caseIds.length > 0) {
        const { data, error } = await supabase
          .from("case_assessments")
          .select(`
            id,
            case_id,
            patient_id,
            assessment_no,
            assessment_date,
            assessment_type,
            created_at
          `)
          .in("case_id", caseIds)
          .order("assessment_date", { ascending: false })
          .order("assessment_no", { ascending: false });

        if (error) throw error;
        assessmentRows = (data ?? []) as DbAssessmentRow[];
      }

      const latestAssessmentByCase = new Map<string, DbAssessmentRow>();
      for (const row of assessmentRows) {
        const existing = latestAssessmentByCase.get(row.case_id);
        if (!existing) {
          latestAssessmentByCase.set(row.case_id, row);
          continue;
        }

        const existingDate = new Date(existing.assessment_date).getTime();
        const nextDate = new Date(row.assessment_date).getTime();

        if (nextDate > existingDate) {
          latestAssessmentByCase.set(row.case_id, row);
          continue;
        }

        if (nextDate === existingDate && row.assessment_no > existing.assessment_no) {
          latestAssessmentByCase.set(row.case_id, row);
        }
      }

      const latestAssessmentIds = Array.from(latestAssessmentByCase.values()).map(
        (item) => item.id
      );

      let vitalsRows: DbVitalsRow[] = [];
      if (latestAssessmentIds.length > 0) {
        const { data, error } = await supabase
          .from("assessment_vitals")
          .select("assessment_id, height_cm, weight_kg")
          .in("assessment_id", latestAssessmentIds);

        if (error) throw error;
        vitalsRows = (data ?? []) as DbVitalsRow[];
      }

      const vitalsByAssessmentId = new Map<string, DbVitalsRow>();
      for (const row of vitalsRows) {
        vitalsByAssessmentId.set(row.assessment_id, row);
      }

      let calculatorDefinitions: DbCalculatorDefinitionRow[] = [];
      {
        const { data, error } = await supabase
          .from("calculator_definitions")
          .select("id, code, name");

        if (error) {
          console.warn("Không tải được calculator_definitions:", error.message);
        } else {
          calculatorDefinitions = (data ?? []) as DbCalculatorDefinitionRow[];
        }
      }

      let calculatorRuns: DbCalculatorRunRow[] = [];
      if (caseIds.length > 0) {
        const { data, error } = await supabase
          .from("calculator_runs")
          .select(`
            id,
            calculator_id,
            assessment_id,
            patient_id,
            case_id,
            run_at,
            result_value,
            result_text,
            risk_level,
            interpretation
          `)
          .in("case_id", caseIds)
          .order("run_at", { ascending: false });

        if (error) {
          console.warn("Không tải được calculator_runs:", error.message);
        } else {
          calculatorRuns = (data ?? []) as DbCalculatorRunRow[];
        }
      }

      const calculatorDefById = new Map<string, DbCalculatorDefinitionRow>();
      for (const def of calculatorDefinitions) {
        calculatorDefById.set(def.id, def);
      }

      const runsByCaseId = new Map<string, ToolResult[]>();
      for (const run of calculatorRuns) {
        if (!run.case_id) continue;

        const definition = calculatorDefById.get(run.calculator_id);
        const toolCode = definition?.code ?? "unknown-calculator";
        const summary =
          run.result_text ??
          `${definition?.name ?? toolCode}${
            run.result_value != null ? `: ${run.result_value}` : ""
          }`;

        const bucket = runsByCaseId.get(run.case_id) ?? [];
        bucket.push({
          id: run.id,
          tool: toolCode,
          when: run.run_at,
          inputs: null,
          outputs: {
            resultValue: run.result_value,
            resultText: run.result_text,
            riskLevel: run.risk_level,
            interpretation: run.interpretation,
          },
          summary,
        });
        runsByCaseId.set(run.case_id, bucket);
      }

      const mappedCases: CaseItem[] = safeCaseRows.map((row) => {
        const patientRow = toArray(row.patients)[0] ?? null;
        const latestAssessment = latestAssessmentByCase.get(row.id) ?? null;
        const latestVitals = latestAssessment
          ? vitalsByAssessmentId.get(latestAssessment.id) ?? null
          : null;

        return {
          id: row.id,
          caseCode: row.case_code,
          createdAt: row.created_at,
          patientId: row.patient_id,
          latestAssessmentId: latestAssessment?.id ?? null,
          patient: {
            name: patientRow?.full_name?.trim() || row.title || "Chưa rõ tên",
            yob: getYobFromDate(patientRow?.date_of_birth),
            sex: mapDbSexToLabel(patientRow?.gender),
            weightKg: latestVitals?.weight_kg ?? undefined,
            heightCm: latestVitals?.height_cm ?? undefined,
          },
          results: runsByCaseId.get(row.id) ?? [],
        };
      });

      setCases(mappedCases);

      if (!mappedCases.length) {
        setActiveCaseId(null);
        return;
      }

      const stillExists = mappedCases.some((item) => item.id === activeCaseId);
      if (!stillExists) {
        setActiveCaseId(mappedCases[0].id);
      }
    } catch (error) {
      console.error("CasesContext.refreshCases error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeCaseId, setActiveCaseId]);

  useEffect(() => {
    void refreshCases();
  }, [refreshCases]);

  const activeCase = useMemo(
    () => cases.find((item) => item.id === activeCaseId) ?? null,
    [cases, activeCaseId]
  );

  const openNewCaseModal = useCallback(() => {
    setIsNewCaseModalOpen(true);
  }, []);

  const closeNewCaseModal = useCallback(() => {
    setIsNewCaseModalOpen(false);
  }, []);

  const ensureAssessmentForCase = useCallback(async (caseItem: CaseItem) => {
    if (caseItem.latestAssessmentId) {
      return caseItem.latestAssessmentId;
    }

    const { data: assessmentRow, error: assessmentError } = await supabase
      .from("case_assessments")
      .insert({
        case_id: caseItem.id,
        patient_id: caseItem.patientId,
        assessment_no: 1,
        assessment_date: new Date().toISOString(),
        assessment_type: "review",
        status: "draft",
      })
      .select("id")
      .single();

    if (assessmentError) throw assessmentError;
    return assessmentRow.id as string;
  }, []);

  const createCase = useCallback(
    async (payload: CreateCasePayload): Promise<CaseItem | null> => {
      const fullName = payload.patient.fullName.trim();
      if (!fullName) {
        throw new Error("Tên người bệnh không được để trống.");
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        throw new Error("Bạn chưa đăng nhập.");
      }

      const patientCode = generatePatientCode();
      const caseCode = generateCaseCode();

      const { data: patientRow, error: patientError } = await supabase
        .from("patients")
        .insert({
          patient_code: patientCode,
          full_name: fullName,
          date_of_birth: payload.patient.dateOfBirth || null,
          gender: mapSexLabelToDbValue(payload.patient.sex),
          occupation: payload.patient.occupation || null,
        })
        .select("id, patient_code, full_name, date_of_birth, gender, occupation")
        .single();

      if (patientError) throw patientError;

      const caseTitle = `Ca bệnh - ${fullName}`;

      const { data: caseRow, error: caseError } = await supabase
        .from("cases")
        .insert({
          patient_id: patientRow.id,
          case_code: caseCode,
          title: caseTitle,
          primary_problem: null,
          primary_diagnosis: null,
          case_status: "open",
          priority_level: "routine",
          red_flag: false,
          opened_at: new Date().toISOString(),
          created_by: authData.user.id,
        })
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
          created_by
        `)
        .single();

      if (caseError) throw caseError;

      const { data: assessmentRow, error: assessmentError } = await supabase
        .from("case_assessments")
        .insert({
          case_id: caseRow.id,
          patient_id: patientRow.id,
          assessment_no: 1,
          assessment_date:
            payload.initialAssessment.assessedAt || new Date().toISOString(),
          assessment_type: payload.initialAssessment.assessmentType,
          status: "draft",
        })
        .select(
          "id, case_id, patient_id, assessment_no, assessment_date, assessment_type, created_at"
        )
        .single();

      if (assessmentError) throw assessmentError;

      const weightKg = payload.initialVitals?.weightKg;
      const heightCm = payload.initialVitals?.heightCm;

      if (typeof weightKg === "number" || typeof heightCm === "number") {
        const { error: vitalsError } = await supabase
          .from("assessment_vitals")
          .upsert(
            {
              assessment_id: assessmentRow.id,
              weight_kg: typeof weightKg === "number" ? weightKg : null,
              height_cm: typeof heightCm === "number" ? heightCm : null,
            },
            { onConflict: "assessment_id" }
          );

        if (vitalsError) throw vitalsError;
      }

      await refreshCases();
      setActiveCaseId(caseRow.id);
      setIsNewCaseModalOpen(false);

      return {
        id: caseRow.id,
        caseCode: caseRow.case_code,
        createdAt: caseRow.created_at,
        patientId: patientRow.id,
        latestAssessmentId: assessmentRow.id,
        patient: {
          name: patientRow.full_name ?? fullName,
          yob: getYobFromDate(patientRow.date_of_birth),
          sex: payload.patient.sex,
          weightKg,
          heightCm,
        },
        results: [],
      };
    },
    [refreshCases, setActiveCaseId]
  );

  const saveToActiveCase = useCallback(
    async (payload: PendingSave) => {
      if (!activeCase) {
        throw new Error("Chưa có ca đang chọn.");
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const assessmentId = await ensureAssessmentForCase(activeCase);

      const { data: definitionRow, error: definitionError } = await supabase
        .from("calculator_definitions")
        .select("id, code, name")
        .eq("code", payload.tool)
        .maybeSingle();

      if (definitionError) throw definitionError;
      if (!definitionRow?.id) {
        throw new Error(
          `Không tìm thấy calculator_definitions cho code "${payload.tool}".`
        );
      }

      const { data: runRow, error: insertRunError } = await supabase
        .from("calculator_runs")
        .insert({
          calculator_id: definitionRow.id,
          assessment_id: assessmentId,
          patient_id: activeCase.patientId,
          case_id: activeCase.id,
          run_at: new Date().toISOString(),
          result_value: tryGetNumericResult(payload.outputs),
          result_text:
            payload.summary ||
            (typeof (payload.outputs as Record<string, unknown> | null)?.resultText ===
            "string"
              ? String((payload.outputs as Record<string, unknown>).resultText)
              : null),
          risk_level: tryGetRiskLevel(payload.outputs),
          interpretation: tryGetInterpretation(payload.outputs),
          result_json: payload.outputs,
          created_by: authData.user?.id ?? null,
        })
        .select("id")
        .single();

      if (insertRunError || !runRow?.id) {
        throw new Error(
          insertRunError?.message || "Không lưu được calculator run."
        );
      }

      const inputRows = flattenInputs(runRow.id, payload.inputs);

      if (inputRows.length > 0) {
        const { error: inputInsertError } = await supabase
          .from("calculator_run_inputs")
          .insert(inputRows);

        if (inputInsertError) {
          await supabase.from("calculator_runs").delete().eq("id", runRow.id);
          throw new Error(inputInsertError.message);
        }
      }

      await refreshCases();
    },
    [activeCase, ensureAssessmentForCase, refreshCases]
  );

  const updateCasePatient = useCallback(
    async (id: string, patient: Patient) => {
      const caseItem = cases.find((item) => item.id === id);
      if (!caseItem) {
        throw new Error("Không tìm thấy ca cần cập nhật.");
      }

      const { error: patientError } = await supabase
        .from("patients")
        .update({
          full_name: patient.name,
          date_of_birth: buildDateOfBirthFromYob(patient.yob),
          gender: mapSexLabelToDbValue(patient.sex),
        })
        .eq("id", caseItem.patientId);

      if (patientError) throw patientError;

      if (
        typeof patient.weightKg === "number" ||
        typeof patient.heightCm === "number"
      ) {
        const assessmentId = await ensureAssessmentForCase(caseItem);

        const { error: vitalsError } = await supabase
          .from("assessment_vitals")
          .upsert(
            {
              assessment_id: assessmentId,
              weight_kg:
                typeof patient.weightKg === "number" ? patient.weightKg : null,
              height_cm:
                typeof patient.heightCm === "number" ? patient.heightCm : null,
            },
            { onConflict: "assessment_id" }
          );

        if (vitalsError) throw vitalsError;
      }

      await refreshCases();
    },
    [cases, ensureAssessmentForCase, refreshCases]
  );

  const closeCase = useCallback(
    async (id: string) => {
      const caseItem = cases.find((item) => item.id === id);
      if (!caseItem) return;

      // load assessments under case
      const { data: assessmentRows, error: assessmentsError } = await supabase
        .from("case_assessments")
        .select("id")
        .eq("case_id", id);

      if (assessmentsError) throw assessmentsError;

      const assessmentIds = (assessmentRows ?? []).map((row) => row.id as string);

      if (assessmentIds.length > 0) {
        const { data: runRows, error: runSelectError } = await supabase
          .from("calculator_runs")
          .select("id")
          .in("assessment_id", assessmentIds);

        if (runSelectError) throw runSelectError;

        const runIds = (runRows ?? []).map((row) => row.id as string);

        if (runIds.length > 0) {
          const { error: runInputsDeleteError } = await supabase
            .from("calculator_run_inputs")
            .delete()
            .in("calculator_run_id", runIds);

          if (runInputsDeleteError) throw runInputsDeleteError;

          const { error: runsDeleteError } = await supabase
            .from("calculator_runs")
            .delete()
            .in("id", runIds);

          if (runsDeleteError) throw runsDeleteError;
        }

        const deleteByAssessmentId = async (table: string) => {
          const { error } = await supabase
            .from(table)
            .delete()
            .in("assessment_id", assessmentIds);
          if (error) throw error;
        };

        await deleteByAssessmentId("assessment_observations");
        await deleteByAssessmentId("assessment_red_flags");
        await deleteByAssessmentId("assessment_plan_items");
        await deleteByAssessmentId("assessment_treatments");
        await deleteByAssessmentId("assessment_diagnoses");
        await deleteByAssessmentId("assessment_notes");
        await deleteByAssessmentId("assessment_vitals");

        const { error: assessmentsDeleteError } = await supabase
          .from("case_assessments")
          .delete()
          .in("id", assessmentIds);

        if (assessmentsDeleteError) throw assessmentsDeleteError;
      }

      // delete any calculator runs linked by case_id but not by assessment_id
      const { data: danglingRuns, error: danglingRunsError } = await supabase
        .from("calculator_runs")
        .select("id")
        .eq("case_id", id);

      if (danglingRunsError) throw danglingRunsError;

      const danglingRunIds = (danglingRuns ?? []).map((row) => row.id as string);
      if (danglingRunIds.length > 0) {
        const { error: deleteInputsError } = await supabase
          .from("calculator_run_inputs")
          .delete()
          .in("calculator_run_id", danglingRunIds);

        if (deleteInputsError) throw deleteInputsError;

        const { error: deleteRunsError } = await supabase
          .from("calculator_runs")
          .delete()
          .in("id", danglingRunIds);

        if (deleteRunsError) throw deleteRunsError;
      }

      const { error: caseDeleteError } = await supabase
        .from("cases")
        .delete()
        .eq("id", id);

      if (caseDeleteError) throw caseDeleteError;

      // best effort: delete patient if no remaining cases use it
      const { data: remainingCases, error: remainingCasesError } = await supabase
        .from("cases")
        .select("id")
        .eq("patient_id", caseItem.patientId)
        .limit(1);

      if (!remainingCasesError && (!remainingCases || remainingCases.length === 0)) {
        await supabase.from("patients").delete().eq("id", caseItem.patientId);
      }

      if (activeCaseId === id) {
        const next = cases.find((item) => item.id !== id) ?? null;
        setActiveCaseId(next?.id ?? null);
      }

      await refreshCases();
    },
    [activeCaseId, cases, refreshCases, setActiveCaseId]
  );

  const getCaseLabel = useCallback(
    (c: CaseItem, opts?: { compact?: boolean }) => formatCaseLabel(c, opts),
    []
  );

  const getActiveCaseLabel = useCallback(
    (opts?: { compact?: boolean; fallback?: string }) => {
      if (!activeCase) return opts?.fallback ?? "Chưa chọn ca";
      return formatCaseLabel(activeCase, { compact: opts?.compact });
    },
    [activeCase]
  );

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
    [
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
    ]
  );

  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) {
    throw new Error("useCases must be used inside CasesProvider");
  }
  return ctx;
}