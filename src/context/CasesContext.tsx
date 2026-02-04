// src/context/CasesContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SexLabel = "Nam" | "Nữ";
export type SexValue = "male" | "female";

export type Patient = {
  name: string;
  yob: number;
  sex: SexLabel;
  // optional
  weightKg?: number;
  heightCm?: number;
};

export type ToolResult = {
  tool: string; // e.g. "egfr"
  when: string; // ISO string
  inputs: any;
  outputs: any;
  summary?: string; // optional human summary
};

export type CaseItem = {
  id: string;
  createdAt: string;
  patient: Patient;
  results: ToolResult[]; // lưu tất cả lần đánh giá
};

type PendingSave = {
  tool: string;
  inputs: any;
  outputs: any;
  summary?: string;
};

export type CasesContextValue = {
  cases: CaseItem[];
  activeCaseId: string | null;
  activeCase: CaseItem | null;

  setActiveCaseId: (id: string | null) => void;
  closeCase: (id: string) => void;

  // modal create case
  isNewCaseModalOpen: boolean;
  openNewCaseModal: () => void;
  closeNewCaseModal: () => void;

  createCase: (patient: Patient) => CaseItem;

  // save tool result
  saveToActiveCase: (payload: { tool: string; inputs: any; outputs: any; summary?: string }) => void;

  // ✅ NEW: update patient info
  updateCasePatient: (id: string, patient: Patient) => void;

  // ✅ label helpers
  getCaseLabel: (c: CaseItem, opts?: { compact?: boolean }) => string;
  getActiveCaseLabel: (opts?: { compact?: boolean; fallback?: string }) => string;
};

const CasesContext = createContext<CasesContextValue | null>(null);

const LS_CASES = "medical_tools_cases_v1";
const LS_ACTIVE = "medical_tools_active_case_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

function safeParse<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseItem[]>(() =>
    safeParse<CaseItem[]>(localStorage.getItem(LS_CASES), [])
  );
  const [activeCaseId, setActiveCaseId] = useState<string | null>(() =>
    safeParse<string | null>(localStorage.getItem(LS_ACTIVE), null)
  );

  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  // persist
  useEffect(() => {
    localStorage.setItem(LS_CASES, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(LS_ACTIVE, JSON.stringify(activeCaseId));
  }, [activeCaseId]);

  // keep activeCaseId valid
  useEffect(() => {
    if (!activeCaseId) return;
    const exists = cases.some((c) => c.id === activeCaseId);
    if (!exists) setActiveCaseId(cases[0]?.id ?? null);
  }, [cases, activeCaseId]);

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) ?? null;
  }, [cases, activeCaseId]);

  const openNewCaseModal = () => setIsNewCaseModalOpen(true);

  const closeNewCaseModal = () => {
    setIsNewCaseModalOpen(false);
    // không xoá pendingSave để tránh user bấm X nhầm
  };

  const closeCase = (id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id));

    setActiveCaseId((prevActive) => {
      if (prevActive !== id) return prevActive;
      // nếu đóng ca đang active → chọn ca khác
      const remaining = cases.filter((c) => c.id !== id);
      return remaining[0]?.id ?? null;
    });
  };

  const createCase = (patient: Patient) => {
    const newCase: CaseItem = {
      id: uid(),
      createdAt: new Date().toISOString(),
      patient,
      results: [],
    };

    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setIsNewCaseModalOpen(false);

    // nếu có pending save (bấm Lưu vào ca khi chưa có ca)
    if (pendingSave) {
      const ps = pendingSave;
      setPendingSave(null);
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== newCase.id) return c;
          return {
            ...c,
            results: [
              {
                tool: ps.tool,
                when: new Date().toISOString(),
                inputs: ps.inputs,
                outputs: ps.outputs,
                summary: ps.summary,
              },
              ...c.results,
            ],
          };
        })
      );
    }

    return newCase;
  };

  const saveToActiveCase = (payload: { tool: string; inputs: any; outputs: any; summary?: string }) => {
    // chưa có ca → mở modal tạo ca và pending
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

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCaseId) return c;
        const item: ToolResult = {
          tool: payload.tool,
          when: new Date().toISOString(),
          inputs: payload.inputs,
          outputs: payload.outputs,
          summary: payload.summary,
        };
        return { ...c, results: [item, ...c.results] };
      })
    );
  };

  // ✅ Update patient info
  const updateCasePatient = (id: string, patient: Patient) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, patient: { ...patient } };
      })
    );
  };

  // ✅ Label helpers
  const getCaseLabel = (c: CaseItem, opts?: { compact?: boolean }) => {
    const compact = !!opts?.compact;
    if (compact) return `${c.patient.name} • ${c.patient.yob}`;
    return `${c.patient.name} • ${c.patient.yob} • ${c.patient.sex}`;
  };

  const getActiveCaseLabel = (opts?: { compact?: boolean; fallback?: string }) => {
    const fallback = opts?.fallback ?? "Chưa chọn ca";
    if (!activeCase) return fallback;
    return getCaseLabel(activeCase, { compact: opts?.compact });
  };

  const value: CasesContextValue = {
    cases,
    activeCaseId,
    activeCase,

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
  };

  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error("useCases must be used within CasesProvider");
  return ctx;
}
