import { supabase } from "../../../lib/supabase";

export type CreateDiagnosisPayload = {
  assessmentId: string;
  diagnosisType: string;
  diagnosisName: string;
  icd10Code?: string;
  note?: string;
  isActive?: boolean;
};

export type UpdateDiagnosisPayload = {
  diagnosisId: string;
  diagnosisType: string;
  diagnosisName: string;
  icd10Code?: string;
  note?: string;
  isActive?: boolean;
};

function cleanText(value?: string) {
  return value?.trim() ? value.trim() : null;
}

export function useManageDiagnoses() {
  async function createDiagnosis(payload: CreateDiagnosisPayload) {
    if (!payload.assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    if (!payload.diagnosisType.trim()) {
      throw new Error("Thiếu loại chẩn đoán.");
    }

    if (!payload.diagnosisName.trim()) {
      throw new Error("Thiếu tên chẩn đoán.");
    }

    const { data, error } = await supabase
      .from("assessment_diagnoses")
      .insert([
        {
          assessment_id: payload.assessmentId,
          diagnosis_type: payload.diagnosisType.trim(),
          diagnosis_name: payload.diagnosisName.trim(),
          icd10_code: cleanText(payload.icd10Code),
          note: cleanText(payload.note),
          is_active: payload.isActive ?? true,
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function updateDiagnosis(payload: UpdateDiagnosisPayload) {
    if (!payload.diagnosisId) {
      throw new Error("Thiếu diagnosisId.");
    }

    if (!payload.diagnosisType.trim()) {
      throw new Error("Thiếu loại chẩn đoán.");
    }

    if (!payload.diagnosisName.trim()) {
      throw new Error("Thiếu tên chẩn đoán.");
    }

    const { data, error } = await supabase
      .from("assessment_diagnoses")
      .update({
        diagnosis_type: payload.diagnosisType.trim(),
        diagnosis_name: payload.diagnosisName.trim(),
        icd10_code: cleanText(payload.icd10Code),
        note: cleanText(payload.note),
        is_active: payload.isActive ?? true,
      })
      .eq("id", payload.diagnosisId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function deleteDiagnosis(diagnosisId: string) {
    const { error } = await supabase
      .from("assessment_diagnoses")
      .delete()
      .eq("id", diagnosisId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
  };
}