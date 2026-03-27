import type {
  CalculatorDefinitionRow,
  CalculatorRunInputRow,
  CalculatorRunInputViewModel,
  CalculatorRunRow,
  CalculatorRunsSectionData,
} from "./types";

function toDisplayValue(row: CalculatorRunInputRow): string {
  if (row.input_value_numeric !== null && row.input_value_numeric !== undefined) {
    return String(row.input_value_numeric);
  }

  if (row.input_value_text !== null && row.input_value_text !== undefined) {
    return row.input_value_text;
  }

  if (row.input_value_boolean !== null && row.input_value_boolean !== undefined) {
    return row.input_value_boolean ? "Có" : "Không";
  }

  if (row.input_value_date !== null && row.input_value_date !== undefined) {
    return row.input_value_date;
  }

  if (row.input_value_json !== null && row.input_value_json !== undefined) {
    try {
      return JSON.stringify(row.input_value_json);
    } catch {
      return String(row.input_value_json);
    }
  }

  return "";
}

export function mapCalculatorRunsSection(args: {
  runs: CalculatorRunRow[];
  definitions: CalculatorDefinitionRow[];
  runInputs: CalculatorRunInputRow[];
}): CalculatorRunsSectionData {
  const definitionById = new Map<string, CalculatorDefinitionRow>();
  for (const def of args.definitions) {
    definitionById.set(def.id, def);
  }

  const inputsByRunId = new Map<string, CalculatorRunInputViewModel[]>();
  for (const input of args.runInputs) {
    const list = inputsByRunId.get(input.calculator_run_id) ?? [];
    list.push({
      id: input.id,
      key: input.input_key,
      label: input.input_label,
      type: input.input_type,
      displayValue: toDisplayValue(input),
      unit: input.unit ?? null,
    });
    inputsByRunId.set(input.calculator_run_id, list);
  }

  return {
    runs: args.runs.map((run) => {
      const def = definitionById.get(run.calculator_id);

      return {
        id: run.id,
        calculatorName: def?.name ?? def?.code ?? "Calculator",
        calculatorCode: def?.code ?? "",
        runAt: run.run_at,
        resultLabel: run.result_label ?? null,
        resultValue: run.result_value ?? null,
        resultText: run.result_text ?? null,
        riskLevel: run.risk_level ?? null,
        interpretation: run.interpretation ?? null,
        inputs: inputsByRunId.get(run.id) ?? [],
      };
    }),
  };
}