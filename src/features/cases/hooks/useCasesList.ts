import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export type GenderValue = "male" | "female" | "other" | "unknown";

type PatientRow = {
  id: string;
  patient_code?: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  occupation: string | null;
};

type CaseRow = {
  id: string;
  patient_id: string;
  case_code: string | null;
  title: string | null;
  primary_problem: string | null;
  primary_diagnosis: string | null;
  red_flag: boolean | null;
  created_at?: string | null;
  created_by?: string | null;
};

export type CaseListItem = {
  id: string;
  caseCode: string;
  caseName: string;
  patientId: string;
  patientName: string;
  gender: GenderValue;
  dateOfBirth: string | null;
  birthYear: number | null;
  occupation: string;
  createdAt: string | null;
};

function normalizeGender(value: string | null | undefined): GenderValue {
  if (value === "male") return "male";
  if (value === "female") return "female";
  if (value === "other") return "other";
  return "unknown";
}

function getBirthYear(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null;
  const d = new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tải được danh sách ca.";
}

export function useCasesList() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [error, setError] = useState("");

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      let query = supabase
        .from("cases")
        .select(
          "id, patient_id, case_code, title, primary_problem, primary_diagnosis, red_flag, created_at, created_by"
        )
        .order("created_at", { ascending: false });

      if (authData.user?.id) {
        query = query.or(`created_by.eq.${authData.user.id},created_by.is.null`);
      }

      const { data: caseRows, error: caseError } = await query;
      if (caseError) throw caseError;

      const typedCaseRows = ((caseRows ?? []) as CaseRow[]).filter(
        (row) => row.patient_id
      );

      const patientIds = Array.from(
        new Set(typedCaseRows.map((row) => row.patient_id))
      );

      let patientRows: PatientRow[] = [];

      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("id, patient_code, full_name, date_of_birth, gender, occupation")
          .in("id", patientIds);

        if (patientsError) throw patientsError;
        patientRows = (patientsData ?? []) as PatientRow[];
      }

      const patientMap = new Map(patientRows.map((row) => [row.id, row]));

      const merged: CaseListItem[] = typedCaseRows.map((row) => {
        const patient = patientMap.get(row.patient_id);

        return {
          id: row.id,
          caseCode: row.case_code ?? "—",
          caseName: row.title ?? patient?.full_name ?? "Ca bệnh",
          patientId: row.patient_id,
          patientName: patient?.full_name ?? "Chưa có tên",
          gender: normalizeGender(patient?.gender),
          dateOfBirth: patient?.date_of_birth ?? null,
          birthYear: getBirthYear(patient?.date_of_birth),
          occupation: patient?.occupation ?? "—",
          createdAt: row.created_at ?? null,
        };
      });

      setCases(merged);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  return {
    loading,
    cases,
    error,
    reloadCases: loadCases,
    setCases,
  };
}