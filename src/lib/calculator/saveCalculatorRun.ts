import { supabase } from "../supabase";

export type SaveCalculatorRunPayload = {
  calculatorCode: string;
  patientId: string;
  caseId?: string | null;
  assessmentId?: string | null;
  inputs: unknown;
  outputs: unknown;
  summary?: string;
  userId?: string | null;
};

type CalculatorRunInputInsertRow = {
  calculator_run_id: string;
  input_key: string;
  input_label: string;
  input_type: string;
  input_value_text: string | null;
  input_value_numeric: number | null;
  input_value_boolean: boolean | null;
  input_value_date: string | null;
  input_value_json: unknown | null;
  unit: string | null;
  source_observation_id: string | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toTitleCase(input: string) {
  return input
    .replace(/\[(\d+)\]/g, " $1 ")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeKey(path: string) {
  return toTitleCase(path || "Input");
}

function isLikelyDateString(value: string) {
  if (!value.trim()) return false;
  const directDate = /^\d{4}-\d{2}-\d{2}$/;
  const isoDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

  return directDate.test(value) || isoDateTime.test(value);
}

function extractResultValue(outputs: unknown): number | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    const candidates = [
      obj.resultValue,
      obj.result_value,
      obj.score,
      obj.total,
      obj.value,
      obj.numericValue,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function extractResultText(outputs: unknown, summary?: string): string | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    const candidates = [
      obj.resultText,
      obj.result_text,
      obj.interpretation,
      obj.label,
      obj.level,
      obj.stage,
      obj.category,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return summary?.trim() || null;
}

function extractRiskLevel(outputs: unknown): string | null {
  if (outputs && typeof outputs === "object") {
    const obj = outputs as Record<string, unknown>;

    const candidates = [obj.riskLevel, obj.risk_level, obj.risk, obj.level];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return null;
}

function createInputRow(
  calculatorRunId: string,
  key: string,
  value: unknown
): CalculatorRunInputInsertRow | null {
  const normalizedKey = key.trim();
  if (!normalizedKey) return null;

  const base: CalculatorRunInputInsertRow = {
    calculator_run_id: calculatorRunId,
    input_key: normalizedKey,
    input_label: humanizeKey(normalizedKey),
    input_type: "text",
    input_value_text: null,
    input_value_numeric: null,
    input_value_boolean: null,
    input_value_date: null,
    input_value_json: null,
    unit: null,
    source_observation_id: null,
  };

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return {
      ...base,
      input_type: "numeric",
      input_value_numeric: Number.isFinite(value) ? value : null,
      input_value_text: Number.isFinite(value) ? String(value) : null,
    };
  }

  if (typeof value === "boolean") {
    return {
      ...base,
      input_type: "boolean",
      input_value_boolean: value,
      input_value_text: value ? "true" : "false",
    };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (isLikelyDateString(trimmed)) {
      return {
        ...base,
        input_type: "date",
        input_value_date: trimmed,
        input_value_text: trimmed,
      };
    }

    return {
      ...base,
      input_type: "text",
      input_value_text: trimmed,
    };
  }

  return {
    ...base,
    input_type: "json",
    input_value_json: value,
    input_value_text: JSON.stringify(value),
  };
}

function flattenInputs(
  calculatorRunId: string,
  value: unknown,
  path = ""
): CalculatorRunInputInsertRow[] {
  if (value === null || value === undefined) return [];

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const row = createInputRow(calculatorRunId, path || "value", value);
    return row ? [row] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenInputs(
        calculatorRunId,
        item,
        path ? `${path}[${index}]` : `[${index}]`
      )
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) return [];

    return entries.flatMap(([childKey, childValue]) =>
      flattenInputs(
        calculatorRunId,
        childValue,
        path ? `${path}.${childKey}` : childKey
      )
    );
  }

  const row = createInputRow(calculatorRunId, path || "value", value);
  return row ? [row] : [];
}

export async function saveCalculatorRunWithInputs(
  payload: SaveCalculatorRunPayload
) {
  const calculatorCode = payload.calculatorCode.trim();

  if (!calculatorCode) {
    throw new Error("Thiếu calculatorCode.");
  }

  if (!payload.patientId) {
    throw new Error("Thiếu patientId.");
  }

  const { data: calculatorDef, error: calculatorDefError } = await supabase
    .from("calculator_definitions")
    .select("id, code, name")
    .eq("code", calculatorCode)
    .single();

  if (calculatorDefError || !calculatorDef) {
    throw new Error(
      calculatorDefError?.message || "Không tìm thấy calculator definition."
    );
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
        interpretation: payload.summary?.trim() || null,
        result_json: payload.outputs,
        created_by: payload.userId ?? null,
      },
    ])
    .select("*")
    .single();

  if (runError || !runRow) {
    throw new Error(runError?.message || "Không lưu được calculator run.");
  }

  const inputRows = flattenInputs(runRow.id, payload.inputs);

  if (inputRows.length > 0) {
    const { error: inputInsertError } = await supabase
      .from("calculator_run_inputs")
      .insert(inputRows);

    if (inputInsertError) {
      await supabase.from("calculator_runs").delete().eq("id", runRow.id);
      throw new Error(inputInsertError.message);
    }
  }

  return {
    run: runRow,
    inputCount: inputRows.length,
  };
}