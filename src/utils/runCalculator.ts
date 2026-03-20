import { supabase } from "../lib/supabase";

type CalculatorDefinitionRow = {
  id: string;
  code: string;
  name: string;
  output_type: string | null;
};

type CalculatorInputDefinitionRow = {
  id: string;
  calculator_id: string;
  input_key: string;
  input_label: string;
  observation_code: string | null;
  data_type: "number" | "boolean" | "text" | "date" | "select" | "json";
  unit: string | null;
  is_required: boolean;
  sort_order: number;
  default_value: string | null;
  config_json: unknown | null;
};

type AssessmentObservationRow = {
  id: string;
  assessment_id: string;
  patient_id: string;
  case_id: string;
  observation_code: string;
  observation_label: string;
  category: string | null;
  value_type: "text" | "numeric" | "boolean" | "date" | "json";
  value_text: string | null;
  value_numeric: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_json: unknown | null;
  unit: string | null;
  normal_flag: string | null;
  note: string | null;
  observed_at: string;
};

type CaseAssessmentRow = {
  id: string;
  case_id: string;
  patient_id: string;
  assessment_no: number;
  assessment_date: string;
  assessment_type: string;
};

type CalculatorRunInsert = {
  calculator_id: string;
  patient_id: string;
  case_id: string;
  assessment_id: string;
  run_at: string;
  result_label: string | null;
  result_value: number | null;
  result_text: string | null;
  risk_level: string | null;
  interpretation: string | null;
  result_json: unknown | null;
};

type CalculatorRunInputInsert = {
  calculator_run_id: string;
  input_key: string;
  input_label: string;
  input_type: "number" | "boolean" | "text" | "date" | "select" | "json";
  input_value_text: string | null;
  input_value_numeric: number | null;
  input_value_boolean: boolean | null;
  input_value_date: string | null;
  input_value_json: unknown | null;
  unit: string | null;
  source_observation_id: string | null;
};

type ResolvedInput = {
  input_key: string;
  input_label: string;
  input_type: "number" | "boolean" | "text" | "date" | "select" | "json";
  observation_code: string | null;
  value: unknown;
  unit: string | null;
  source_observation_id: string | null;
};

type ComputationResult = {
  resultLabel?: string | null;
  resultValue?: number | null;
  resultText?: string | null;
  riskLevel?: string | null;
  interpretation?: string | null;
  resultJson?: unknown | null;
};

function coerceDefaultValue(
  raw: string | null,
  dataType: CalculatorInputDefinitionRow["data_type"]
): unknown {
  if (raw === null || raw === undefined || raw === "") return null;

  switch (dataType) {
    case "number": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    case "boolean": {
      const normalized = raw.trim().toLowerCase();
      if (["true", "1", "yes", "y"].includes(normalized)) return true;
      if (["false", "0", "no", "n"].includes(normalized)) return false;
      return null;
    }
    case "json": {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    case "date":
    case "text":
    case "select":
    default:
      return raw;
  }
}

function getObservationValue(obs: AssessmentObservationRow): unknown {
  if (obs.value_numeric !== null) return Number(obs.value_numeric);
  if (obs.value_text !== null) return obs.value_text;
  if (obs.value_boolean !== null) return obs.value_boolean;
  if (obs.value_date !== null) return obs.value_date;
  if (obs.value_json !== null) return obs.value_json;
  return null;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.trim() || null;
  return String(value);
}

function toNullableBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }

  return null;
}

function numberRequired(
  inputs: Record<string, unknown>,
  key: string,
  calculatorName: string
): number {
  const value = toNullableNumber(inputs[key]);
  if (value === null) {
    throw new Error(`Thiếu dữ liệu bắt buộc "${key}" cho ${calculatorName}`);
  }
  return value;
}

function scoreRiskBand(
  score: number,
  bands: Array<{ max: number; label: string }>
): string {
  for (const band of bands) {
    if (score <= band.max) return band.label;
  }
  return bands[bands.length - 1]?.label || "";
}

function computeCalculator(
  calculatorCode: string,
  inputs: Record<string, unknown>
): ComputationResult {
  const code = calculatorCode.toLowerCase();

  if (code === "fib4") {
    const age = numberRequired(inputs, "age", "FIB-4");
    const ast = numberRequired(inputs, "ast", "FIB-4");
    const alt = numberRequired(inputs, "alt", "FIB-4");
    const platelet = numberRequired(inputs, "platelet", "FIB-4");

    if (alt <= 0 || platelet <= 0) {
      throw new Error("ALT và platelet phải lớn hơn 0 để tính FIB-4");
    }

    const score = (age * ast) / (platelet * Math.sqrt(alt));

    let riskLevel = "indeterminate";
    let interpretation = "Nguy cơ trung gian xơ hóa gan tiến triển.";
    if (score < 1.45) {
      riskLevel = "low";
      interpretation = "Nguy cơ thấp xơ hóa gan tiến triển.";
    } else if (score > 3.25) {
      riskLevel = "high";
      interpretation = "Nguy cơ cao xơ hóa gan tiến triển.";
    }

    return {
      resultLabel: "FIB-4",
      resultValue: Number(score.toFixed(4)),
      resultText: "FIB-4 score",
      riskLevel,
      interpretation,
      resultJson: { score, riskLevel, interpretation },
    };
  }

  if (code === "apri") {
    const ast = numberRequired(inputs, "ast", "APRI");
    const astUln = numberRequired(inputs, "ast_uln", "APRI");
    const platelet = numberRequired(inputs, "platelet", "APRI");

    if (astUln <= 0 || platelet <= 0) {
      throw new Error("AST ULN và platelet phải lớn hơn 0 để tính APRI");
    }

    const score = ((ast / astUln) * 100) / platelet;

    let riskLevel = "indeterminate";
    let interpretation = "Cần diễn giải theo bối cảnh lâm sàng.";
    if (score < 0.5) {
      riskLevel = "low";
      interpretation = "Nguy cơ thấp xơ hóa đáng kể.";
    } else if (score >= 1.5) {
      riskLevel = "high";
      interpretation = "Nguy cơ cao xơ hóa đáng kể.";
    }

    return {
      resultLabel: "APRI",
      resultValue: Number(score.toFixed(4)),
      resultText: "APRI score",
      riskLevel,
      interpretation,
      resultJson: { score, riskLevel, interpretation },
    };
  }

  if (code === "child_pugh" || code === "child-pugh") {
    const bilirubin = numberRequired(inputs, "bilirubin_total", "Child-Pugh");
    const albumin = numberRequired(inputs, "albumin_serum", "Child-Pugh");
    const inr = numberRequired(inputs, "inr", "Child-Pugh");
    const ascites = numberRequired(inputs, "ascites_grade", "Child-Pugh");
    const encephalopathy = numberRequired(
      inputs,
      "encephalopathy_grade",
      "Child-Pugh"
    );

    let bilirubinScore = 1;
    if (bilirubin > 3) bilirubinScore = 3;
    else if (bilirubin >= 2) bilirubinScore = 2;

    let albuminScore = 1;
    if (albumin < 2.8) albuminScore = 3;
    else if (albumin <= 3.5) albuminScore = 2;

    let inrScore = 1;
    if (inr > 2.2) inrScore = 3;
    else if (inr >= 1.7) inrScore = 2;

    const ascitesScore = Math.max(1, Math.min(3, Math.round(ascites)));
    const encephalopathyScore = Math.max(
      1,
      Math.min(3, Math.round(encephalopathy))
    );

    const total =
      bilirubinScore +
      albuminScore +
      inrScore +
      ascitesScore +
      encephalopathyScore;

    let riskLevel = "A";
    let interpretation = "Child-Pugh class A";
    if (total >= 10) {
      riskLevel = "C";
      interpretation = "Child-Pugh class C";
    } else if (total >= 7) {
      riskLevel = "B";
      interpretation = "Child-Pugh class B";
    }

    return {
      resultLabel: "Child-Pugh",
      resultValue: total,
      resultText: `Class ${riskLevel}`,
      riskLevel,
      interpretation,
      resultJson: {
        total,
        class: riskLevel,
        bilirubinScore,
        albuminScore,
        inrScore,
        ascitesScore,
        encephalopathyScore,
      },
    };
  }

  if (code === "bmi") {
    const heightCm = numberRequired(inputs, "height_cm", "BMI");
    const weightKg = numberRequired(inputs, "weight_kg", "BMI");

    if (heightCm <= 0 || weightKg <= 0) {
      throw new Error("Chiều cao và cân nặng phải lớn hơn 0 để tính BMI");
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let riskLevel = "normal";
    let interpretation = "BMI bình thường.";
    if (bmi < 18.5) {
      riskLevel = "underweight";
      interpretation = "Thiếu cân.";
    } else if (bmi >= 25 && bmi < 30) {
      riskLevel = "overweight";
      interpretation = "Thừa cân.";
    } else if (bmi >= 30) {
      riskLevel = "obesity";
      interpretation = "Béo phì.";
    }

    return {
      resultLabel: "BMI",
      resultValue: Number(bmi.toFixed(2)),
      resultText: "Body Mass Index",
      riskLevel,
      interpretation,
      resultJson: { bmi, riskLevel, interpretation },
    };
  }

  if (code === "phq9") {
    const score =
      numberRequired(inputs, "phq9_q1", "PHQ-9") +
      numberRequired(inputs, "phq9_q2", "PHQ-9") +
      numberRequired(inputs, "phq9_q3", "PHQ-9") +
      numberRequired(inputs, "phq9_q4", "PHQ-9") +
      numberRequired(inputs, "phq9_q5", "PHQ-9") +
      numberRequired(inputs, "phq9_q6", "PHQ-9") +
      numberRequired(inputs, "phq9_q7", "PHQ-9") +
      numberRequired(inputs, "phq9_q8", "PHQ-9") +
      numberRequired(inputs, "phq9_q9", "PHQ-9");

    const riskLevel = scoreRiskBand(score, [
      { max: 4, label: "minimal" },
      { max: 9, label: "mild" },
      { max: 14, label: "moderate" },
      { max: 19, label: "moderately severe" },
      { max: 27, label: "severe" },
    ]);

    return {
      resultLabel: "PHQ-9",
      resultValue: score,
      resultText: "PHQ-9 score",
      riskLevel,
      interpretation: `Mức độ trầm cảm: ${riskLevel}`,
      resultJson: { score, riskLevel },
    };
  }

  if (code === "gad7") {
    const score =
      numberRequired(inputs, "gad7_q1", "GAD-7") +
      numberRequired(inputs, "gad7_q2", "GAD-7") +
      numberRequired(inputs, "gad7_q3", "GAD-7") +
      numberRequired(inputs, "gad7_q4", "GAD-7") +
      numberRequired(inputs, "gad7_q5", "GAD-7") +
      numberRequired(inputs, "gad7_q6", "GAD-7") +
      numberRequired(inputs, "gad7_q7", "GAD-7");

    const riskLevel = scoreRiskBand(score, [
      { max: 4, label: "minimal" },
      { max: 9, label: "mild" },
      { max: 14, label: "moderate" },
      { max: 21, label: "severe" },
    ]);

    return {
      resultLabel: "GAD-7",
      resultValue: score,
      resultText: "GAD-7 score",
      riskLevel,
      interpretation: `Mức độ lo âu: ${riskLevel}`,
      resultJson: { score, riskLevel },
    };
  }

  if (code === "family_apgar" || code === "family_apgar_score") {
    const score =
      numberRequired(inputs, "family_apgar_adaptation", "Family APGAR") +
      numberRequired(inputs, "family_apgar_partnership", "Family APGAR") +
      numberRequired(inputs, "family_apgar_growth", "Family APGAR") +
      numberRequired(inputs, "family_apgar_affection", "Family APGAR") +
      numberRequired(inputs, "family_apgar_resolve", "Family APGAR");

    let riskLevel = "highly functional";
    let interpretation = "Gia đình chức năng tốt.";
    if (score <= 3) {
      riskLevel = "severe dysfunction";
      interpretation = "Rối loạn chức năng gia đình nặng.";
    } else if (score <= 6) {
      riskLevel = "moderate dysfunction";
      interpretation = "Rối loạn chức năng gia đình mức trung bình.";
    } else if (score <= 7) {
      riskLevel = "mild dysfunction";
      interpretation = "Rối loạn chức năng gia đình nhẹ.";
    }

    return {
      resultLabel: "Family APGAR",
      resultValue: score,
      resultText: "Family APGAR score",
      riskLevel,
      interpretation,
      resultJson: { score, riskLevel },
    };
  }

  if (code === "screem") {
    const score =
      numberRequired(inputs, "screem_social", "SCREEM") +
      numberRequired(inputs, "screem_cultural", "SCREEM") +
      numberRequired(inputs, "screem_religious", "SCREEM") +
      numberRequired(inputs, "screem_economic", "SCREEM") +
      numberRequired(inputs, "screem_educational", "SCREEM") +
      numberRequired(inputs, "screem_medical", "SCREEM");

    let riskLevel = "adequate";
    let interpretation = "Nguồn lực gia đình tương đối đầy đủ.";
    if (score <= 4) {
      riskLevel = "severely limited";
      interpretation = "Nguồn lực gia đình rất hạn chế.";
    } else if (score <= 8) {
      riskLevel = "limited";
      interpretation = "Nguồn lực gia đình hạn chế.";
    }

    return {
      resultLabel: "SCREEM",
      resultValue: score,
      resultText: "SCREEM score",
      riskLevel,
      interpretation,
      resultJson: { score, riskLevel },
    };
  }

  throw new Error(`Calculator ${calculatorCode} chưa được hỗ trợ`);
}

export async function runCalculator(
  calculatorCode: string,
  assessmentId: string
) {
  const { data: assessment, error: assessmentError } = await supabase
    .from("case_assessments")
    .select("id, case_id, patient_id, assessment_no, assessment_date, assessment_type")
    .eq("id", assessmentId)
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessment) throw new Error("Không tìm thấy assessment");

  const assessmentRow = assessment as CaseAssessmentRow;

  const { data: calculatorDef, error: calculatorError } = await supabase
    .from("calculator_definitions")
    .select("id, code, name, output_type")
    .eq("code", calculatorCode)
    .single();

  if (calculatorError) throw calculatorError;
  if (!calculatorDef) throw new Error("Không tìm thấy calculator");

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

  const observationCodes = Array.from(
    new Set(
      inputDefinitionRows
        .map((row) => row.observation_code)
        .filter((v): v is string => Boolean(v))
    )
  );

  let observationRows: AssessmentObservationRow[] = [];
  if (observationCodes.length > 0) {
    const { data: observations, error: observationError } = await supabase
      .from("assessment_observations")
      .select(
        "id, assessment_id, patient_id, case_id, observation_code, observation_label, category, value_type, value_text, value_numeric, value_boolean, value_date, value_json, unit, normal_flag, note, observed_at"
      )
      .eq("assessment_id", assessmentId)
      .in("observation_code", observationCodes)
      .order("observed_at", { ascending: false });

    if (observationError) throw observationError;
    observationRows = (observations ?? []) as AssessmentObservationRow[];
  }

  const latestObservationByCode = new Map<string, AssessmentObservationRow>();
  for (const row of observationRows) {
    if (!latestObservationByCode.has(row.observation_code)) {
      latestObservationByCode.set(row.observation_code, row);
    }
  }

  const resolvedInputs: ResolvedInput[] = inputDefinitionRows.map((def) => {
    const observation = def.observation_code
      ? latestObservationByCode.get(def.observation_code) ?? null
      : null;

    const value =
      observation !== null
        ? getObservationValue(observation)
        : coerceDefaultValue(def.default_value, def.data_type);

    return {
      input_key: def.input_key,
      input_label: def.input_label,
      input_type: def.data_type,
      observation_code: def.observation_code,
      value,
      unit: observation?.unit || def.unit || null,
      source_observation_id: observation?.id || null,
    };
  });

  const missingRequired = resolvedInputs.filter(
    (item) =>
      inputDefinitionRows.find((d) => d.input_key === item.input_key)?.is_required &&
      (item.value === null || item.value === undefined || item.value === "")
  );

  if (missingRequired.length > 0) {
    const labels = missingRequired.map((item) => item.input_label).join(", ");
    throw new Error(`Thiếu dữ liệu đầu vào bắt buộc: ${labels}`);
  }

  const inputMap: Record<string, unknown> = {};
  for (const item of resolvedInputs) {
    inputMap[item.input_key] = item.value;
  }

  const computed = computeCalculator(calculator.code, inputMap);

  const runInsert: CalculatorRunInsert = {
    calculator_id: calculator.id,
    patient_id: assessmentRow.patient_id,
    case_id: assessmentRow.case_id,
    assessment_id: assessmentRow.id,
    run_at: new Date().toISOString(),
    result_label: computed.resultLabel ?? null,
    result_value: computed.resultValue ?? null,
    result_text: computed.resultText ?? null,
    risk_level: computed.riskLevel ?? null,
    interpretation: computed.interpretation ?? null,
    result_json: computed.resultJson ?? null,
  };

  const { data: createdRun, error: createRunError } = await supabase
    .from("calculator_runs")
    .insert([runInsert])
    .select("*")
    .single();

  if (createRunError) throw createRunError;
  if (!createdRun) throw new Error("Không tạo được calculator run");

  const runInputRows: CalculatorRunInputInsert[] = resolvedInputs.map((item) => ({
    calculator_run_id: createdRun.id,
    input_key: item.input_key,
    input_label: item.input_label,
    input_type: item.input_type,
    input_value_text:
      item.input_type === "text" || item.input_type === "select"
        ? toNullableString(item.value)
        : null,
    input_value_numeric:
      item.input_type === "number" ? toNullableNumber(item.value) : null,
    input_value_boolean:
      item.input_type === "boolean" ? toNullableBoolean(item.value) : null,
    input_value_date:
      item.input_type === "date" ? toNullableString(item.value) : null,
    input_value_json:
      item.input_type === "json" ? (item.value ?? null) : null,
    unit: item.unit,
    source_observation_id: item.source_observation_id,
  }));

  if (runInputRows.length > 0) {
    const { error: runInputError } = await supabase
      .from("calculator_run_inputs")
      .insert(runInputRows);

    if (runInputError) throw runInputError;
  }

  return createdRun;
}