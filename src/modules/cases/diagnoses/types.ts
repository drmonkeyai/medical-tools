export type AssessmentDiagnosisRow = {
  id: string;
  assessment_id: string;
  diagnosis_type: "primary" | "secondary" | "differential" | "working";
  diagnosis_name: string;
  icd10_code: string | null;
  is_active: boolean;
  note: string | null;
  created_at: string;
};

export type DiagnosisItem = {
  id: string;
  diagnosisName: string;
  diagnosisType: "primary" | "secondary" | "differential" | "working";
  diagnosisTypeLabel: string;
  icd10Code: string;
  note: string;
  isActive: boolean;
  createdAt: string;
};

export type DiagnosesSectionData = {
  items: DiagnosisItem[];
  total: number;
  activeCount: number;
  hasAnyContent: boolean;
};