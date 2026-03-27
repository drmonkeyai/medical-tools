export type AssessmentRedFlagRow = {
  id: string;
  assessment_id: string;
  flag_name: string;
  flag_code?: string | null;
  is_present?: boolean | null;
  severity?: string | null;
  note?: string | null;
};

export type RedFlagItemViewModel = {
  id: string;
  name: string;
  code?: string | null;
  isPresent: boolean;
  severity?: string | null;
  note?: string | null;
};

export type RedFlagsSectionData = {
  items: RedFlagItemViewModel[];
};