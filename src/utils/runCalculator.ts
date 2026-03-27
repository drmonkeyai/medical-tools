import {
  resolveCalculatorInputs,
  type CalculatorDefinitionRow,
  type CaseAssessmentRow,
  type ResolvedCalculatorInput,
} from "../lib/calculator/resolveCalculatorInputs";

export type ComputationResult = {
  resultLabel: string;
  resultValue: number | null;
  resultText: string;
  riskLevel: string | null;
  interpretation: string | null;
  resultJson?: unknown;
};

export type RunCalculatorResult = {
  assessment: CaseAssessmentRow;
  calculator: CalculatorDefinitionRow;
  resolvedInputs: ResolvedCalculatorInput[];
  inputMap: Record<string, unknown>;
  result: ComputationResult;
};

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

function sumRequired(
  inputs: Record<string, unknown>,
  keys: string[],
  calculatorName: string
) {
  return keys.reduce((sum, key) => {
    return sum + numberRequired(inputs, key, calculatorName);
  }, 0);
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
    const score = sumRequired(
      inputs,
      [
        "phq9_q1",
        "phq9_q2",
        "phq9_q3",
        "phq9_q4",
        "phq9_q5",
        "phq9_q6",
        "phq9_q7",
        "phq9_q8",
        "phq9_q9",
      ],
      "PHQ-9"
    );

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
    const score = sumRequired(
      inputs,
      [
        "gad7_q1",
        "gad7_q2",
        "gad7_q3",
        "gad7_q4",
        "gad7_q5",
        "gad7_q6",
        "gad7_q7",
      ],
      "GAD-7"
    );

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
    const score = sumRequired(
      inputs,
      [
        "family_apgar_adaptation",
        "family_apgar_partnership",
        "family_apgar_growth",
        "family_apgar_affection",
        "family_apgar_resolve",
      ],
      "Family APGAR"
    );

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
    const score = sumRequired(
      inputs,
      [
        "screem_social",
        "screem_cultural",
        "screem_religious",
        "screem_economic",
        "screem_educational",
        "screem_medical",
      ],
      "SCREEM"
    );

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
): Promise<RunCalculatorResult> {
  const {
    assessment,
    calculator,
    resolvedInputs,
    inputMap,
  } = await resolveCalculatorInputs(assessmentId, calculatorCode);

  const missingRequired = resolvedInputs.filter(
    (item) =>
      item.is_required &&
      (item.value === null || item.value === undefined || item.value === "")
  );

  if (missingRequired.length > 0) {
    const labels = missingRequired.map((item) => item.input_label).join(", ");
    throw new Error(`Thiếu dữ liệu đầu vào bắt buộc: ${labels}`);
  }

  const result = computeCalculator(calculator.code, inputMap);

  return {
    assessment,
    calculator,
    resolvedInputs,
    inputMap,
    result,
  };
}