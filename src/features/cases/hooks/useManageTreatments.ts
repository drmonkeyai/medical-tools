import { supabase } from "../../../lib/supabase";

export type CreateTreatmentPayload = {
  assessmentId: string;
  treatmentType: string;
  treatmentName: string;
  description?: string;
  doseOrFrequency?: string;
  duration?: string;
  instructions?: string;
  status?: string;
};

export type UpdateTreatmentPayload = {
  treatmentId: string;
  treatmentType: string;
  treatmentName: string;
  description?: string;
  doseOrFrequency?: string;
  duration?: string;
  instructions?: string;
  status?: string;
};

function cleanText(value?: string) {
  return value?.trim() ? value.trim() : null;
}

export function useManageTreatments() {
  async function createTreatment(payload: CreateTreatmentPayload) {
    if (!payload.assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    if (!payload.treatmentType.trim()) {
      throw new Error("Thiếu loại điều trị.");
    }

    if (!payload.treatmentName.trim()) {
      throw new Error("Thiếu tên điều trị.");
    }

    const { data, error } = await supabase
      .from("assessment_treatments")
      .insert([
        {
          assessment_id: payload.assessmentId,
          treatment_type: payload.treatmentType.trim(),
          treatment_name: payload.treatmentName.trim(),
          description: cleanText(payload.description),
          dose_or_frequency: cleanText(payload.doseOrFrequency),
          duration: cleanText(payload.duration),
          instructions: cleanText(payload.instructions),
          status: cleanText(payload.status) ?? "active",
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function updateTreatment(payload: UpdateTreatmentPayload) {
    if (!payload.treatmentId) {
      throw new Error("Thiếu treatmentId.");
    }

    if (!payload.treatmentType.trim()) {
      throw new Error("Thiếu loại điều trị.");
    }

    if (!payload.treatmentName.trim()) {
      throw new Error("Thiếu tên điều trị.");
    }

    const { data, error } = await supabase
      .from("assessment_treatments")
      .update({
        treatment_type: payload.treatmentType.trim(),
        treatment_name: payload.treatmentName.trim(),
        description: cleanText(payload.description),
        dose_or_frequency: cleanText(payload.doseOrFrequency),
        duration: cleanText(payload.duration),
        instructions: cleanText(payload.instructions),
        status: cleanText(payload.status) ?? "active",
      })
      .eq("id", payload.treatmentId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function deleteTreatment(treatmentId: string) {
    const { error } = await supabase
      .from("assessment_treatments")
      .delete()
      .eq("id", treatmentId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    createTreatment,
    updateTreatment,
    deleteTreatment,
  };
}