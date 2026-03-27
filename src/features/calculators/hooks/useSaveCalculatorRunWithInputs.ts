import { supabase } from "../../../lib/supabase";

export type CalculatorInputSnapshot = {
  inputKey: string;
  inputLabel: string;
  inputType: "text" | "numeric" | "boolean" | "date" | "json";
  inputValueText?: string;
  inputValueNumeric?: number;
  inputValueBoolean?: boolean;
  inputValueDate?: string;
  inputValueJson?: unknown;
  unit?: string;
  sourceObservationId?: string;
};

export type SaveCalculatorRunWithInputsPayload = {
  calculatorCode: string;
  patientId: string;
  caseId?: string;
  assessmentId?: string;
  userId: string;
  outputs: unknown;
  summary?: string;
  inputs: CalculatorInputSnapshot[];
};

function extractResultValue(outputs: unknown): number | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    if (typeof obj.resultValue === "number" && Number.isFinite(obj.resultValue)) {
      return obj.resultValue;
    }
    if (typeof obj.result_value === "number" && Number.isFinite(obj.result_value)) {
      return obj.result_value;
    }
    if (typeof obj.score === "number" && Number.isFinite(obj.score)) {
      return obj.score;
    }
    if (typeof obj.value === "number" && Number.isFinite(obj.value)) {
      return obj.value;
    }
  }

  return null;
}

function extractResultText(outputs: unknown, summary?: string): string | null {
  if (summary?.trim()) return summary.trim();

  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    if (typeof obj.resultText === "string" && obj.resultText.trim()) {
      return obj.resultText.trim();
    }
    if (typeof obj.result_text === "string" && obj.result_text.trim()) {
      return obj.result_text.trim();
    }
    if (typeof obj.interpretation === "string" && obj.interpretation.trim()) {
      return obj.interpretation.trim();
    }
    if (typeof obj.category === "string" && obj.category.trim()) {
      return obj.category.trim();
    }
  }

  return null;
}

function extractRiskLevel(outputs: unknown): string | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    if (typeof obj.riskLevel === "string" && obj.riskLevel.trim()) {
      return obj.riskLevel.trim();
    }
    if (typeof obj.risk_level === "string" && obj.risk_level.trim()) {
      return obj.risk_level.trim();
    }
    if (typeof obj.risk === "string" && obj.risk.trim()) {
      return obj.risk.trim();
    }
  }

  return null;
}

export function useSaveCalculatorRunWithInputs() {
  async function saveCalculatorRunWithInputs(
    payload: SaveCalculatorRunWithInputsPayload
  ) {
    const { data: calculatorDef, error: calculatorDefError } = await supabase
      .from("calculator_definitions")
      .select("id, code, name")
      .eq("code", payload.calculatorCode)
      .single();

    if (calculatorDefError) {
      throw new Error(calculatorDefError.message);
    }

    const { data: runRow, error: runError } = await supabase
      .from("calculator_runs")
      .insert([
        {
          calculator_id: calculatorDef.id,
          patient_id: payload.patientId,
          case_id: payload.caseId ?? null,
          assessment_id: payload.assessmentId ?? null,
          run_at: new Date().toISOString(),
          result_value: extractResultValue(payload.outputs),
          result_text: extractResultText(payload.outputs, payload.summary),
          risk_level: extractRiskLevel(payload.outputs),
          interpretation: payload.summary ?? null,
          result_json: payload.outputs,
          created_by: payload.userId,
        },
      ])
      .select("*")
      .single();

    if (runError) {
      throw new Error(runError.message);
    }

    if (payload.inputs.length > 0) {
      const rows = payload.inputs.map((item) => ({
        calculator_run_id: runRow.id,
        input_key: item.inputKey,
        input_label: item.inputLabel,
        input_type: item.inputType,
        input_value_text:
          item.inputType === "text" ? item.inputValueText ?? null : null,
        input_value_numeric:
          item.inputType === "numeric" ? item.inputValueNumeric ?? null : null,
        input_value_boolean:
          item.inputType === "boolean" ? item.inputValueBoolean ?? null : null,
        input_value_date:
          item.inputType === "date" ? item.inputValueDate ?? null : null,
        input_value_json:
          item.inputType === "json" ? item.inputValueJson ?? null : null,
        unit: item.unit ?? null,
        source_observation_id: item.sourceObservationId ?? null,
      }));

      const { error: inputsError } = await supabase
        .from("calculator_run_inputs")
        .insert(rows);

      if (inputsError) {
        throw new Error(inputsError.message);
      }
    }

    return runRow;
  }

  return {
    saveCalculatorRunWithInputs,
  };
}