import { supabase } from "../supabase";

export type CalculatorDefinitionRow = {
  id: string;
  code: string;
  name: string;
  output_type?: string | null;
};

export type CalculatorInputDefinitionRow = {
  id: string;
  calculator_id: string;
  input_key: string;
  input_label: string;
  observation_code: string | null;
  data_type: string;
  unit: string | null;
  is_required: boolean | null;
  sort_order: number | null;
  default_value: string | null;
  config_json?: Record<string, unknown> | null;
};

export type CaseAssessmentRow = {
  id: string;
  case_id: string;
  patient_id: string;
  assessment_no?: number | null;
  assessment_date?: string | null;
  assessment_type?: string | null;
};

export type PatientRow = {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  occupation: string | null;
};

export type AssessmentVitalsRow = {
  assessment_id: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature_c: number | null;
  respiratory_rate: number | null;
  spo2_percent: number | null;
  waist_cm: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
};

export type AssessmentObservationRow = {
  id: string;
  assessment_id: string;
  observation_code: string;
  observation_label: string | null;
  value_type: string | null;
  value_text: string | null;
  value_numeric: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_json: unknown | null;
  unit: string | null;
  observed_at: string | null;
};

export type ResolvedCalculatorInput = {
  input_key: string;
  input_label: string;
  input_type: string;
  observation_code: string | null;
  value: unknown;
  unit: string | null;
  source:
    | "patient"
    | "computed_patient"
    | "assessment_vitals"
    | "assessment_observations"
    | "default"
    | "empty";
  source_observation_id: string | null;
  is_required: boolean;
};

export type ResolveCalculatorInputsResult = {
  assessment: CaseAssessmentRow;
  patient: PatientRow | null;
  vitals: AssessmentVitalsRow | null;
  calculator: CalculatorDefinitionRow;
  inputDefinitions: CalculatorInputDefinitionRow[];
  resolvedInputs: ResolvedCalculatorInput[];
  inputMap: Record<string, unknown>;
};

const VITAL_INPUT_KEY_TO_COLUMN: Record<string, keyof AssessmentVitalsRow> = {
  systolic_bp: "systolic_bp",
  sbp: "systolic_bp",
  diastolic_bp: "diastolic_bp",
  dbp: "diastolic_bp",
  heart_rate: "heart_rate",
  pulse: "heart_rate",
  temperature_c: "temperature_c",
  temperature: "temperature_c",
  respiratory_rate: "respiratory_rate",
  rr: "respiratory_rate",
  spo2_percent: "spo2_percent",
  spo2: "spo2_percent",
  waist_cm: "waist_cm",
  height_cm: "height_cm",
  height: "height_cm",
  weight_kg: "weight_kg",
  weight: "weight_kg",
  bmi: "bmi",
};

const VITAL_OBSERVATION_CODE_TO_COLUMN: Record<string, keyof AssessmentVitalsRow> = {
  systolic_bp: "systolic_bp",
  diastolic_bp: "diastolic_bp",
  heart_rate: "heart_rate",
  temperature_c: "temperature_c",
  respiratory_rate: "respiratory_rate",
  spo2_percent: "spo2_percent",
  waist_cm: "waist_cm",
  height_cm: "height_cm",
  weight_kg: "weight_kg",
  bmi: "bmi",
};

const PATIENT_INPUT_KEY_TO_FIELD: Record<string, keyof PatientRow> = {
  gender: "gender",
  sex: "gender",
  date_of_birth: "date_of_birth",
  dob: "date_of_birth",
  occupation: "occupation",
  patient_name: "full_name",
  full_name: "full_name",
};

function normalizeKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không resolve được calculator inputs.";
}

function parseDefaultValue(raw: string | null | undefined, dataType: string) {
  const value = raw?.trim();
  if (!value) return null;

  const type = normalizeKey(dataType);

  if (type === "number" || type === "numeric" || type === "integer") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  if (type === "boolean" || type === "bool") {
    if (value === "true" || value === "1") return true;
    if (value === "false" || value === "0") return false;
    return null;
  }

  if (type === "json") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

function coerceValueToInputType(value: unknown, dataType: string): unknown {
  if (value === null || value === undefined || value === "") return null;

  const type = normalizeKey(dataType);

  if (type === "number" || type === "numeric" || type === "integer") {
    const n =
      typeof value === "number"
        ? value
        : typeof value === "string"
        ? Number(value)
        : NaN;

    return Number.isFinite(n) ? n : null;
  }

  if (type === "boolean" || type === "bool") {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = normalizeKey(value);
      if (["true", "1", "yes", "y", "co", "có"].includes(normalized)) return true;
      if (["false", "0", "no", "n", "khong", "không"].includes(normalized)) return false;
    }
    return null;
  }

  if (type === "json") return value;

  return String(value);
}

function getObservationValue(row: AssessmentObservationRow | null): unknown {
  if (!row) return null;

  const type = normalizeKey(row.value_type);

  if (type === "numeric" || type === "number" || type === "integer") {
    return row.value_numeric;
  }

  if (type === "boolean" || type === "bool") {
    return row.value_boolean;
  }

  if (type === "date") {
    return row.value_date;
  }

  if (type === "json") {
    return row.value_json;
  }

  if (row.value_numeric !== null && row.value_numeric !== undefined) return row.value_numeric;
  if (row.value_boolean !== null && row.value_boolean !== undefined) return row.value_boolean;
  if (row.value_date) return row.value_date;
  if (row.value_json !== null && row.value_json !== undefined) return row.value_json;

  return row.value_text;
}

function calculateAgeFromDob(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function getPatientValue(
  patient: PatientRow | null,
  inputKey: string
): { value: unknown; source: "patient" | "computed_patient" } | null {
  if (!patient) return null;

  const normalized = normalizeKey(inputKey);

  if (normalized === "age" || normalized === "age_years") {
    return {
      value: calculateAgeFromDob(patient.date_of_birth),
      source: "computed_patient",
    };
  }

  const field = PATIENT_INPUT_KEY_TO_FIELD[normalized];
  if (!field) return null;

  return {
    value: patient[field] ?? null,
    source: "patient",
  };
}

function getVitalColumnFromDefinition(
  def: CalculatorInputDefinitionRow
): keyof AssessmentVitalsRow | null {
  const byInputKey = VITAL_INPUT_KEY_TO_COLUMN[normalizeKey(def.input_key)];
  if (byInputKey) return byInputKey;

  const observationCode = normalizeKey(def.observation_code);
  if (observationCode) {
    const byObservationCode = VITAL_OBSERVATION_CODE_TO_COLUMN[observationCode];
    if (byObservationCode) return byObservationCode;
  }

  return null;
}

function getVitalValue(
  vitals: AssessmentVitalsRow | null,
  column: keyof AssessmentVitalsRow | null
): unknown {
  if (!vitals || !column) return null;
  if (column === "assessment_id") return null;
  return vitals[column] ?? null;
}

function buildObservationMap(rows: AssessmentObservationRow[]) {
  const map = new Map<string, AssessmentObservationRow>();
  for (const row of rows) {
    const code = normalizeKey(row.observation_code);
    if (!code) continue;
    if (!map.has(code)) {
      map.set(code, row);
    }
  }
  return map;
}

export async function resolveCalculatorInputs(
  assessmentId: string,
  calculatorCode: string
): Promise<ResolveCalculatorInputsResult> {
  if (!assessmentId?.trim()) {
    throw new Error("Thiếu assessmentId.");
  }

  if (!calculatorCode?.trim()) {
    throw new Error("Thiếu calculatorCode.");
  }

  try {
    const { data: assessment, error: assessmentError } = await supabase
      .from("case_assessments")
      .select("id, case_id, patient_id, assessment_no, assessment_date, assessment_type")
      .eq("id", assessmentId)
      .single();

    if (assessmentError) throw assessmentError;
    if (!assessment) throw new Error("Không tìm thấy assessment.");

    const assessmentRow = assessment as CaseAssessmentRow;

    const { data: calculatorDef, error: calculatorError } = await supabase
      .from("calculator_definitions")
      .select("id, code, name, output_type")
      .eq("code", calculatorCode)
      .single();

    if (calculatorError) throw calculatorError;
    if (!calculatorDef) throw new Error("Không tìm thấy calculator.");

    const calculator = calculatorDef as CalculatorDefinitionRow;

    const { data: inputDefs, error: inputDefError } = await supabase
      .from("calculator_input_definitions")
      .select(
        "id, calculator_id, input_key, input_label, observation_code, data_type, unit, is_required, sort_order, default_value, config_json"
      )
      .eq("calculator_id", calculator.id)
      .order("sort_order", { ascending: true });

    if (inputDefError) throw inputDefError;

    const inputDefinitionRows =
      (inputDefs ?? []) as CalculatorInputDefinitionRow[];

    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("id, full_name, date_of_birth, gender, occupation")
      .eq("id", assessmentRow.patient_id)
      .maybeSingle();

    if (patientError) throw patientError;
    const patientRow = (patientData as PatientRow | null) ?? null;

    const { data: vitalsData, error: vitalsError } = await supabase
      .from("assessment_vitals")
      .select(
        "assessment_id, systolic_bp, diastolic_bp, heart_rate, temperature_c, respiratory_rate, spo2_percent, waist_cm, height_cm, weight_kg, bmi"
      )
      .eq("assessment_id", assessmentId)
      .maybeSingle();

    if (vitalsError) throw vitalsError;
    const vitalsRow = (vitalsData as AssessmentVitalsRow | null) ?? null;

    const observationCodes = Array.from(
      new Set(
        inputDefinitionRows
          .map((row) => normalizeKey(row.observation_code))
          .filter(Boolean)
      )
    );

    let observationRows: AssessmentObservationRow[] = [];
    if (observationCodes.length > 0) {
      const { data: observations, error: observationError } = await supabase
        .from("assessment_observations")
        .select(
          "id, assessment_id, observation_code, observation_label, value_type, value_text, value_numeric, value_boolean, value_date, value_json, unit, observed_at"
        )
        .eq("assessment_id", assessmentId)
        .in("observation_code", observationCodes)
        .order("observed_at", { ascending: false });

      if (observationError) throw observationError;
      observationRows = (observations ?? []) as AssessmentObservationRow[];
    }

    const latestObservationByCode = buildObservationMap(observationRows);

    const resolvedInputs: ResolvedCalculatorInput[] = inputDefinitionRows.map((def) => {
      const patientResolved = getPatientValue(patientRow, def.input_key);
      if (
        patientResolved &&
        patientResolved.value !== null &&
        patientResolved.value !== undefined &&
        patientResolved.value !== ""
      ) {
        return {
          input_key: def.input_key,
          input_label: def.input_label,
          input_type: def.data_type,
          observation_code: def.observation_code,
          value: coerceValueToInputType(patientResolved.value, def.data_type),
          unit: def.unit,
          source: patientResolved.source,
          source_observation_id: null,
          is_required: Boolean(def.is_required),
        };
      }

      const vitalColumn = getVitalColumnFromDefinition(def);
      const vitalValue = getVitalValue(vitalsRow, vitalColumn);
      if (vitalValue !== null && vitalValue !== undefined && vitalValue !== "") {
        return {
          input_key: def.input_key,
          input_label: def.input_label,
          input_type: def.data_type,
          observation_code: def.observation_code,
          value: coerceValueToInputType(vitalValue, def.data_type),
          unit: def.unit,
          source: "assessment_vitals",
          source_observation_id: null,
          is_required: Boolean(def.is_required),
        };
      }

      const observationCode = normalizeKey(def.observation_code);
      if (observationCode) {
        const observationRow = latestObservationByCode.get(observationCode) ?? null;
        const observationValue = getObservationValue(observationRow);

        if (
          observationValue !== null &&
          observationValue !== undefined &&
          observationValue !== ""
        ) {
          return {
            input_key: def.input_key,
            input_label: def.input_label,
            input_type: def.data_type,
            observation_code: def.observation_code,
            value: coerceValueToInputType(observationValue, def.data_type),
            unit: def.unit || observationRow?.unit || null,
            source: "assessment_observations",
            source_observation_id: observationRow?.id ?? null,
            is_required: Boolean(def.is_required),
          };
        }
      }

      const defaultValue = parseDefaultValue(def.default_value, def.data_type);
      if (defaultValue !== null && defaultValue !== undefined && defaultValue !== "") {
        return {
          input_key: def.input_key,
          input_label: def.input_label,
          input_type: def.data_type,
          observation_code: def.observation_code,
          value: defaultValue,
          unit: def.unit,
          source: "default",
          source_observation_id: null,
          is_required: Boolean(def.is_required),
        };
      }

      return {
        input_key: def.input_key,
        input_label: def.input_label,
        input_type: def.data_type,
        observation_code: def.observation_code,
        value: null,
        unit: def.unit,
        source: "empty",
        source_observation_id: null,
        is_required: Boolean(def.is_required),
      };
    });

    const inputMap = resolvedInputs.reduce<Record<string, unknown>>((acc, item) => {
      acc[item.input_key] = item.value;
      return acc;
    }, {});

    return {
      assessment: assessmentRow,
      patient: patientRow,
      vitals: vitalsRow,
      calculator,
      inputDefinitions: inputDefinitionRows,
      resolvedInputs,
      inputMap,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}