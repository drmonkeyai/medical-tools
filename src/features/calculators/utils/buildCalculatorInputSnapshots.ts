import type { CalculatorInputSnapshot } from "../hooks/useSaveCalculatorRunWithInputs";

type PrimitiveValue = string | number | boolean | null | undefined;

export type BuildSnapshotField = {
  key: string;
  label: string;
  value: PrimitiveValue | Record<string, unknown>;
  unit?: string;
};

export function buildCalculatorInputSnapshots(
  fields: BuildSnapshotField[]
): CalculatorInputSnapshot[] {
  return fields
    .filter((field) => field.value !== undefined && field.value !== null && field.value !== "")
    .map((field) => {
      const value = field.value;

      if (typeof value === "number") {
        return {
          inputKey: field.key,
          inputLabel: field.label,
          inputType: "numeric",
          inputValueNumeric: value,
          unit: field.unit,
        } satisfies CalculatorInputSnapshot;
      }

      if (typeof value === "boolean") {
        return {
          inputKey: field.key,
          inputLabel: field.label,
          inputType: "boolean",
          inputValueBoolean: value,
          unit: field.unit,
        } satisfies CalculatorInputSnapshot;
      }

      if (typeof value === "string") {
        return {
          inputKey: field.key,
          inputLabel: field.label,
          inputType: "text",
          inputValueText: value,
          unit: field.unit,
        } satisfies CalculatorInputSnapshot;
      }

      return {
        inputKey: field.key,
        inputLabel: field.label,
        inputType: "json",
        inputValueJson: value,
        unit: field.unit,
      } satisfies CalculatorInputSnapshot;
    });
}