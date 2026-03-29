import { supabase } from "../../../lib/supabase";

export type PatientSexLabel = "Nam" | "Nữ" | "Khác";
export type PatientSexValue = "male" | "female" | "other";

export type UpdatePatientProfilePayload = {
  patientId: string;
  fullName: string;
  sex: PatientSexLabel | PatientSexValue;
  yob?: number;
  dateOfBirth?: string | null;
  occupation?: string | null;

  /**
   * Optional:
   * Nếu muốn đồng bộ title của case theo tên bệnh nhân
   * thì truyền caseId.
   */
  caseId?: string;
};

function normalizeSex(
  input: PatientSexLabel | PatientSexValue
): PatientSexValue {
  if (input === "female" || input === "Nữ") return "female";
  if (input === "other" || input === "Khác") return "other";
  return "male";
}

function buildDateOfBirth(payload: {
  yob?: number;
  dateOfBirth?: string | null;
}) {
  if (payload.dateOfBirth && payload.dateOfBirth.trim()) {
    return payload.dateOfBirth.trim();
  }

  if (typeof payload.yob === "number" && Number.isFinite(payload.yob)) {
    const safeYear = Math.max(1900, Math.min(new Date().getFullYear(), Math.floor(payload.yob)));
    return `${safeYear}-01-01`;
  }

  return null;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không cập nhật được hồ sơ người bệnh.";
}

export function useUpdatePatientProfile() {
  async function updatePatientProfile(payload: UpdatePatientProfilePayload) {
    const patientId = payload.patientId?.trim();
    const fullName = payload.fullName?.trim();

    if (!patientId) {
      throw new Error("Thiếu patientId.");
    }

    if (!fullName) {
      throw new Error("Họ tên người bệnh không được để trống.");
    }

    const nextDateOfBirth = buildDateOfBirth({
      yob: payload.yob,
      dateOfBirth: payload.dateOfBirth,
    });

    try {
      const { data: patientRow, error: patientError } = await supabase
        .from("patients")
        .update({
          full_name: fullName,
          date_of_birth: nextDateOfBirth,
          gender: normalizeSex(payload.sex),
          occupation: payload.occupation?.trim() || null,
        })
        .eq("id", patientId)
        .select("*")
        .single();

      if (patientError) {
        throw patientError;
      }

      if (payload.caseId?.trim()) {
        const { error: caseError } = await supabase
          .from("cases")
          .update({
            title: fullName,
          })
          .eq("id", payload.caseId.trim());

        if (caseError) {
          throw caseError;
        }
      }

      return patientRow;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  return {
    updatePatientProfile,
  };
}