export type TreatmentType =
  | "medication"
  | "exercise"
  | "procedure"
  | "education"
  | "lifestyle"
  | "referral";

export type TreatmentStatus =
  | "planned"
  | "ongoing"
  | "completed"
  | "stopped";

export type AssessmentTreatmentRow = {
  id: string;
  assessment_id: string;
  treatment_type: TreatmentType;
  treatment_name: string;
  description: string | null;
  dose_or_frequency: string | null;
  duration: string | null;
  instructions: string | null;
  status: TreatmentStatus;
  created_at: string;
  updated_at: string;
};

export type TreatmentItemView = {
  id: string;
  type: TreatmentType;
  name: string;
  description?: string;
  doseOrFrequency?: string;
  duration?: string;
  instructions?: string;
  status: TreatmentStatus;
};

export type TreatmentSectionData = {
  medications: TreatmentItemView[];
  exercises: TreatmentItemView[];
  procedures: TreatmentItemView[];
  educations: TreatmentItemView[];
  lifestyles: TreatmentItemView[];
  referrals: TreatmentItemView[];
  hasData: boolean;
};