import { supabase } from "../../../lib/supabase";

export type CreateObservationPayload = {
  assessmentId: string;
  patientId: string;
  caseId: string;
  observationCode: string;
  observationLabel: string;
  valueType: "text" | "numeric" | "boolean" | "date";
  valueText?: string;
  valueNumeric?: number;
  valueBoolean?: boolean;
  valueDate?: string;
  unit?: string;
  note?: string;
  observedAt?: string;
};

export function useUpsertObservations() {
  async function createObservation(payload: CreateObservationPayload) {
    if (!payload.assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    if (!payload.patientId) {
      throw new Error("Thiếu patientId.");
    }

    if (!payload.caseId) {
      throw new Error("Thiếu caseId.");
    }

    if (!payload.observationCode.trim()) {
      throw new Error("Thiếu observation code.");
    }

    if (!payload.observationLabel.trim()) {
      throw new Error("Thiếu observation label.");
    }

    const row = {
      assessment_id: payload.assessmentId,
      patient_id: payload.patientId,
      case_id: payload.caseId,
      observation_code: payload.observationCode.trim(),
      observation_label: payload.observationLabel.trim(),
      value_type: payload.valueType,
      value_text: payload.valueType === "text" ? payload.valueText?.trim() || null : null,
      value_numeric:
        payload.valueType === "numeric" && typeof payload.valueNumeric === "number"
          ? payload.valueNumeric
          : null,
      value_boolean:
        payload.valueType === "boolean" ? Boolean(payload.valueBoolean) : null,
      value_date:
        payload.valueType === "date" ? payload.valueDate?.trim() || null : null,
      unit: payload.unit?.trim() ? payload.unit.trim() : null,
      note: payload.note?.trim() ? payload.note.trim() : null,
      observed_at: payload.observedAt?.trim()
        ? payload.observedAt
        : new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("assessment_observations")
      .insert([row])
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function deleteObservation(observationId: string) {
    const { error } = await supabase
      .from("assessment_observations")
      .delete()
      .eq("id", observationId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    createObservation,
    deleteObservation,
  };
}