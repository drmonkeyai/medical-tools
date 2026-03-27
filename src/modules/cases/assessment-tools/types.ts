export type AssessmentToolCategoryKey =
  | "family_social"
  | "cardiovascular"
  | "metabolic_renal"
  | "liver"
  | "respiratory_sleep"
  | "mental_behavior"
  | "geriatric_function";

export type AssessmentToolMode =
  | "auto"
  | "questionnaire"
  | "structured"
  | "mixed"
  | "pathway";

export type AssessmentToolStatus =
  | "ready"
  | "planned"
  | "needs_rule_lock";

export type AssessmentToolPriority =
  | "core"
  | "high"
  | "secondary";

export type AssessmentToolPathwayOption = {
  key: string;
  title: string;
  description: string;
  calculatorCode?: string | null;
};

export type AssessmentToolCatalogItem = {
  toolKey: string;
  title: string;
  shortDescription: string;
  categoryKey: AssessmentToolCategoryKey;
  categoryLabel: string;
  mode: AssessmentToolMode;
  clinicalPurpose: string;
  inputRequirement: string;
  status: AssessmentToolStatus;
  priority: AssessmentToolPriority;
  enabledInAssessment: boolean;
  calculatorCode?: string | null;
  calculatorCodes?: string[];
  tags?: string[];
  questionnaireDomains?: string[];
  structuredHints?: string[];
  pathwayOptions?: AssessmentToolPathwayOption[];
};