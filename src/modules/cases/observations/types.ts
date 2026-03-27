export type AssessmentObservationRow = {
  id: string;
  assessment_id: string;
  observation_code: string;
  observation_label: string;
  value_type: string;
  value_text?: string | null;
  value_numeric?: number | null;
  value_boolean?: boolean | null;
  value_date?: string | null;
  value_json?: unknown;
  unit?: string | null;
  normal_flag?: string | null;
  note?: string | null;
  observed_at?: string | null;
};

export type ObservationItemViewModel = {
  id: string;
  code: string;
  label: string;
  valueType: string;
  displayValue: string;
  unit?: string | null;
  normalFlag?: string | null;
  note?: string | null;
  observedAt?: string | null;
};

export type ObservationsSectionData = {
  items: ObservationItemViewModel[];
};