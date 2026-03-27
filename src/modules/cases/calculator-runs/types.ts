export type CalculatorRunRow = {
  id: string;
  calculator_id: string;
  assessment_id: string | null;
  patient_id: string;
  case_id: string | null;
  run_at: string;
  result_label?: string | null;
  result_value?: number | null;
  result_text?: string | null;
  risk_level?: string | null;
  interpretation?: string | null;
  result_json?: unknown | null;
};

export type CalculatorDefinitionRow = {
  id: string;
  code: string;
  name: string;
};

export type CalculatorRunInputRow = {
  id: string;
  calculator_run_id: string;
  input_key: string;
  input_label: string;
  input_type: string;
  input_value_text?: string | null;
  input_value_numeric?: number | null;
  input_value_boolean?: boolean | null;
  input_value_date?: string | null;
  input_value_json?: unknown | null;
  unit?: string | null;
  source_observation_id?: string | null;
  created_at?: string | null;
};

export type CalculatorRunInputViewModel = {
  id: string;
  key: string;
  label: string;
  type: string;
  displayValue: string;
  unit?: string | null;
};

export type CalculatorRunViewModel = {
  id: string;
  calculatorName: string;
  calculatorCode: string;
  runAt: string;
  resultLabel?: string | null;
  resultValue?: number | null;
  resultText?: string | null;
  riskLevel?: string | null;
  interpretation?: string | null;
  inputs: CalculatorRunInputViewModel[];
};

export type CalculatorRunsSectionData = {
  runs: CalculatorRunViewModel[];
};