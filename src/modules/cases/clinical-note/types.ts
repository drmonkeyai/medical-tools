export type AssessmentNoteRow = {
  id: string;
  assessment_id: string;

  history_of_present_illness: string | null;
  past_medical_history: string | null;
  past_surgical_history: string | null;
  medication_history: string | null;
  allergy_history: string | null;
  family_history: string | null;
  social_history: string | null;
  obstetric_history: string | null;
  substance_use_history: string | null;
  sleep_history: string | null;
  diet_history: string | null;
  exercise_history: string | null;

  ideas: string | null;
  concerns: string | null;
  expectations: string | null;

  biological_factors: string | null;
  psychological_factors: string | null;
  social_factors: string | null;
  functional_limitations: string | null;
  participation_restrictions: string | null;
  environmental_factors: string | null;
  personal_factors: string | null;
  protective_factors: string | null;
  barriers_to_recovery: string | null;

  general_appearance: string | null;
  mental_status: string | null;
  head_neck_exam: string | null;
  cardiovascular_exam: string | null;
  respiratory_exam: string | null;
  abdominal_exam: string | null;
  musculoskeletal_exam: string | null;
  neurological_exam: string | null;
  skin_exam: string | null;
  other_exam: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type ClinicalNoteField = {
  key: string;
  label: string;
  content: string;
  isEmpty: boolean;
};

export type ClinicalNoteGroupKey =
  | "history"
  | "ice"
  | "bio_psycho_social"
  | "physical_exam";

export type ClinicalNoteGroup = {
  key: ClinicalNoteGroupKey;
  title: string;
  fields: ClinicalNoteField[];
  hasAnyContent: boolean;
};

export type ClinicalNoteSectionData = {
  groups: ClinicalNoteGroup[];
  hasAnyContent: boolean;
};