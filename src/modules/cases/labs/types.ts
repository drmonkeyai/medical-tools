export type LabSection =
  | "biochemistry"
  | "hematology"
  | "immunology"
  | "urinalysis"
  | "other";

export type LabValueType = "numeric" | "text" | "boolean";

export type LabAbnormalFlag =
  | "low"
  | "high"
  | "abnormal"
  | "normal"
  | "unknown"
  | null;

export type LabSourceType =
  | "manual"
  | "copied_from_previous"
  | "imported_pdf"
  | "monitoring_import"
  | "external";

export interface LabCatalogItem {
  code: string;
  canonicalCode?: string;
  name: string;
  section: LabSection;
  groupName?: string;
  valueType: LabValueType;
  canonicalUnit?: string;
  displayUnitOptions?: string[];
  referenceRangeText?: string;
  isCommon: boolean;
  isAdvanced?: boolean;
  isDerived?: boolean;
  searchKeywords?: string[];
  sortOrder?: number;
}

export interface AssessmentLabResult {
  id: string;
  assessment_id: string;

  lab_code: string;
  canonical_code: string | null;
  lab_name: string;
  section: LabSection;
  group_name: string | null;

  value_type: LabValueType;
  value_numeric: number | null;
  value_text: string | null;
  value_boolean: boolean | null;
  raw_result_text: string | null;

  unit: string | null;
  reference_range_text: string | null;
  ref_low: number | null;
  ref_high: number | null;
  ref_operator: string | null;

  abnormal_flag: LabAbnormalFlag;
  abnormal_mark: string | null;
  procedure_code: string | null;

  specimen_type: string | null;
  measured_at: string | null;
  note: string | null;

  source_type: LabSourceType;
  source_report_id: string | null;
  source_assessment_id: string | null;

  created_at: string;
  updated_at: string;
}

export interface AssessmentLabReport {
  id: string;
  assessment_id: string;

  facility_name: string | null;
  report_title: string;
  sample_id: string | null;
  receipt_number: string | null;
  specimen_type: string | null;
  department: string | null;
  referring_physician: string | null;
  diagnosis_text: string | null;
  specimen_quality: string | null;

  ordered_at: string | null;
  collected_at: string | null;
  received_at: string | null;
  performed_at: string | null;

  report_kind: string;
  source_file_path: string | null;
  source_file_name: string | null;
  mime_type: string | null;

  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertAssessmentLabResultInput {
  id?: string;
  assessment_id: string;
  lab_code: string;
  canonical_code?: string | null;
  lab_name: string;
  section: LabSection;
  group_name?: string | null;

  value_type: LabValueType;
  value_numeric?: number | null;
  value_text?: string | null;
  value_boolean?: boolean | null;
  raw_result_text?: string | null;

  unit?: string | null;
  reference_range_text?: string | null;
  ref_low?: number | null;
  ref_high?: number | null;
  ref_operator?: string | null;

  abnormal_flag?: LabAbnormalFlag;
  abnormal_mark?: string | null;
  procedure_code?: string | null;

  specimen_type?: string | null;
  measured_at?: string | null;
  note?: string | null;

  source_type?: LabSourceType;
  source_report_id?: string | null;
  source_assessment_id?: string | null;
}

export interface CreateAssessmentLabReportInput {
  assessment_id: string;
  facility_name?: string | null;
  report_title: string;
  sample_id?: string | null;
  receipt_number?: string | null;
  specimen_type?: string | null;
  department?: string | null;
  referring_physician?: string | null;
  diagnosis_text?: string | null;
  specimen_quality?: string | null;
  ordered_at?: string | null;
  collected_at?: string | null;
  received_at?: string | null;
  performed_at?: string | null;
  report_kind?: string;
  source_file_path?: string | null;
  source_file_name?: string | null;
  mime_type?: string | null;
  note?: string | null;
}
