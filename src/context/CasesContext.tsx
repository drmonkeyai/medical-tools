import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type SexLabel = "Nam" | "Nữ";
export type SexValue = "male" | "female";

export type Patient = {
  name: string;
  yob: number;
  sex: SexLabel;
  weightKg?: number;
  heightCm?: number;
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
  createdAt: string;
  patient: Patient;
  results: ToolResult[];
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

  createCase: (patient: Patient) => Promise<CaseItem | null>;

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
  return sex === "Nữ" ? "female" : "male";
}

function mapDbSexToLabel(sex?: string | null): SexLabel {
  return sex === "female" ? "Nữ" : "Nam";
}

function buildActiveCaseStorageKey(userId?: string | null) {
  return userId ? `medical_tools_active_case_${userId}` : "medical_tools_active_case_guest";
}

function mapDbResult(row: any): ToolResult {
  return {
    id: row.id,
    tool: row.tool_type,
    when: row.created_at,
    inputs: row.input_json ?? {},
    outputs: row.output_json ?? {},
    summary: row.summary ?? undefined,
  };
}

function mapDbCase(row: any, results: any[] = []): CaseItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    patient: {
      name: row.patient_name ?? "",
      yob: row.patient_yob ?? new Date().getFullYear(),
      sex: mapDbSexToLabel(row.patient_sex),
      weightKg: row.patient_weight_kg ?? undefined,
      heightCm: row.patient_height_cm ?? undefined,
    },
    results: Array.isArray(results) ? results.map(mapDbResult) : [],
  };
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  const storageKey = useMemo(() => buildActiveCaseStorageKey(user?.id), [user?.id]);

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(() =>
    safeParse<string | null>(localStorage.getItem("medical_tools_active_case_guest"), null)
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
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (caseError) throw caseError;

      const { data: resultRows, error: resultError } = await supabase
        .from("tool_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (resultError) throw resultError;

      const resultMap = new Map<string, any[]>();

      for (const row of resultRows ?? []) {
        const arr = resultMap.get(row.case_id) ?? [];
        arr.push(row);
        resultMap.set(row.case_id, arr);
      }

      const mappedCases = (caseRows ?? []).map((row: any) =>
        mapDbCase(row, resultMap.get(row.id) ?? [])
      );

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
      .eq("user_id", user?.id ?? "");

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

  async function createCase(patient: Patient): Promise<CaseItem | null> {
    if (!user?.id) {
      throw new Error("Chưa đăng nhập");
    }

    const normalizedPatient: Patient = {
      name: patient.name.trim(),
      yob: clampInt(patient.yob, 1900, new Date().getFullYear()),
      sex: patient.sex,
      weightKg: patient.weightKg,
      heightCm: patient.heightCm,
    };

    const { data: insertedCases, error } = await supabase
      .from("cases")
      .insert([
        {
          user_id: user.id,
          title: normalizedPatient.name ? `Ca - ${normalizedPatient.name}` : "Ca mới",
          patient_name: normalizedPatient.name,
          patient_yob: normalizedPatient.yob,
          patient_sex: mapSexLabelToDbValue(normalizedPatient.sex),
          patient_weight_kg: normalizedPatient.weightKg ?? null,
          patient_height_cm: normalizedPatient.heightCm ?? null,
        },
      ])
      .select();

    if (error) {
      console.error("CREATE CASE ERROR:", error);
      throw new Error(error.message);
    }

    const createdRow = insertedCases?.[0];
    if (!createdRow) return null;

    const newCase = mapDbCase(createdRow, []);

    if (pendingSave) {
      const { data: insertedResults, error: resultError } = await supabase
        .from("tool_results")
        .insert([
          {
            case_id: createdRow.id,
            user_id: user.id,
            tool_type: pendingSave.tool,
            input_json: pendingSave.inputs,
            output_json: pendingSave.outputs,
            summary: pendingSave.summary ?? null,
          },
        ])
        .select();

      if (resultError) {
        console.error("CREATE PENDING TOOL RESULT ERROR:", resultError);
        throw new Error(resultError.message);
      }

      const resultRow = insertedResults?.[0];
      if (resultRow) {
        newCase.results = [mapDbResult(resultRow)];
      }
    }

    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setIsNewCaseModalOpen(false);
    setPendingSave(null);

    return newCase;
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

    const { data: insertedResults, error } = await supabase
      .from("tool_results")
      .insert([
        {
          case_id: activeCaseId,
          user_id: user.id,
          tool_type: payload.tool,
          input_json: payload.inputs,
          output_json: payload.outputs,
          summary: payload.summary ?? null,
        },
      ])
      .select();

    if (error) {
      console.error("SAVE TOOL RESULT ERROR:", error);
      throw new Error(error.message);
    }

    const created = insertedResults?.[0];

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCaseId) return c;

        const item: ToolResult = created
          ? mapDbResult(created)
          : {
              tool: payload.tool,
              when: new Date().toISOString(),
              inputs: payload.inputs,
              outputs: payload.outputs,
              summary: payload.summary,
            };

        return {
          ...c,
          results: [item, ...c.results],
        };
      })
    );
  }

  async function updateCasePatient(id: string, patient: Patient) {
    const normalizedPatient: Patient = {
      name: patient.name.trim(),
      yob: clampInt(patient.yob, 1900, new Date().getFullYear()),
      sex: patient.sex,
      weightKg: patient.weightKg,
      heightCm: patient.heightCm,
    };

    const { error } = await supabase
      .from("cases")
      .update({
        title: normalizedPatient.name ? `Ca - ${normalizedPatient.name}` : "Ca mới",
        patient_name: normalizedPatient.name,
        patient_yob: normalizedPatient.yob,
        patient_sex: mapSexLabelToDbValue(normalizedPatient.sex),
        patient_weight_kg: normalizedPatient.weightKg ?? null,
        patient_height_cm: normalizedPatient.heightCm ?? null,
      })
      .eq("id", id)
      .eq("user_id", user?.id ?? "");

    if (error) {
      console.error("UPDATE CASE PATIENT ERROR:", error);
      throw new Error(error.message);
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