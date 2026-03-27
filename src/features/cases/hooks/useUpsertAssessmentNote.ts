import { supabase } from "../../../lib/supabase";

export type UpsertAssessmentNotePayload = {
  assessmentId: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  medicationHistory?: string;
  allergyHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  ideas?: string;
  concerns?: string;
  expectations?: string;
  biologicalFactors?: string;
  psychologicalFactors?: string;
  socialFactors?: string;
  generalAppearance?: string;
  cardiovascularExam?: string;
  respiratoryExam?: string;
  abdominalExam?: string;
  otherExam?: string;
};

function cleanText(value?: string) {
  return value?.trim() ? value.trim() : null;
}

export function useUpsertAssessmentNote() {
  async function upsertAssessmentNote(payload: UpsertAssessmentNotePayload) {
    if (!payload.assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    const row = {
      assessment_id: payload.assessmentId,
      history_of_present_illness: cleanText(payload.historyOfPresentIllness),
      past_medical_history: cleanText(payload.pastMedicalHistory),
      past_surgical_history: cleanText(payload.pastSurgicalHistory),
      medication_history: cleanText(payload.medicationHistory),
      allergy_history: cleanText(payload.allergyHistory),
      family_history: cleanText(payload.familyHistory),
      social_history: cleanText(payload.socialHistory),
      ideas: cleanText(payload.ideas),
      concerns: cleanText(payload.concerns),
      expectations: cleanText(payload.expectations),
      biological_factors: cleanText(payload.biologicalFactors),
      psychological_factors: cleanText(payload.psychologicalFactors),
      social_factors: cleanText(payload.socialFactors),
      general_appearance: cleanText(payload.generalAppearance),
      cardiovascular_exam: cleanText(payload.cardiovascularExam),
      respiratory_exam: cleanText(payload.respiratoryExam),
      abdominal_exam: cleanText(payload.abdominalExam),
      other_exam: cleanText(payload.otherExam),
    };

    const { data, error } = await supabase
      .from("assessment_notes")
      .upsert([row], { onConflict: "assessment_id" })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  return {
    upsertAssessmentNote,
  };
}