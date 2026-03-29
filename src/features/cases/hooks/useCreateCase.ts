import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type CreateCaseGender = "male" | "female" | "other";

export type CreateCasePayload = {
  fullName: string;
  dateOfBirth: string;
  gender: CreateCaseGender;
  occupation?: string;
};

type CreatedCaseResult = {
  caseId: string;
  patientId: string;
  caseCode: string;
  patientCode: string;
};

function generatePatientCode() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PT-${yyyy}${mm}${dd}-${random}`;
}

function generateCaseCode() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `CA-${yyyy}${mm}${dd}-${random}`;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không tạo được ca mới.";
}

export function useCreateCase() {
  const [creatingCase, setCreatingCase] = useState(false);
  const [createCaseError, setCreateCaseError] = useState("");

  async function createCase(payload: CreateCasePayload): Promise<CreatedCaseResult> {
    const fullName = payload.fullName.trim();
    const dateOfBirth = payload.dateOfBirth.trim();
    const occupation = payload.occupation?.trim() || null;

    if (!fullName) {
      throw new Error("Vui lòng nhập họ và tên.");
    }

    if (!dateOfBirth) {
      throw new Error("Vui lòng nhập ngày tháng năm sinh.");
    }

    if (!payload.gender) {
      throw new Error("Vui lòng chọn giới tính.");
    }

    try {
      setCreatingCase(true);
      setCreateCaseError("");

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Bạn chưa đăng nhập.");

      const patientCode = generatePatientCode();
      const caseCode = generateCaseCode();

      const { data: createdPatient, error: patientError } = await supabase
        .from("patients")
        .insert([
          {
            patient_code: patientCode,
            full_name: fullName,
            date_of_birth: dateOfBirth,
            gender: payload.gender,
            occupation,
          },
        ])
        .select("id, patient_code")
        .single();

      if (patientError) throw patientError;
      if (!createdPatient?.id) {
        throw new Error("Không tạo được người bệnh.");
      }

      const { data: createdCase, error: caseError } = await supabase
        .from("cases")
        .insert([
          {
            case_code: caseCode,
            patient_id: createdPatient.id,
            title: fullName,
            primary_problem: null,
            primary_diagnosis: null,
            red_flag: false,
            created_by: authData.user.id,
          },
        ])
        .select("id, case_code")
        .single();

      if (caseError) throw caseError;
      if (!createdCase?.id) {
        throw new Error("Không tạo được ca bệnh.");
      }

      return {
        caseId: createdCase.id,
        patientId: createdPatient.id,
        caseCode: createdCase.case_code ?? caseCode,
        patientCode: createdPatient.patient_code ?? patientCode,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      setCreateCaseError(message);
      throw new Error(message);
    } finally {
      setCreatingCase(false);
    }
  }

  function resetCreateCaseError() {
    setCreateCaseError("");
  }

  return {
    creatingCase,
    createCaseError,
    createCase,
    resetCreateCaseError,
  };
}