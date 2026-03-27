import { runCalculator, type RunCalculatorResult } from "../../utils/runCalculator";
import { saveCalculatorRunWithInputs } from "./saveCalculatorRun";

export type RunAndSaveCalculatorResult = RunCalculatorResult & {
  savedRun: {
    run: Record<string, unknown>;
    inputCount: number;
  };
};

export async function runAndSaveCalculator(
  calculatorCode: string,
  assessmentId: string
): Promise<RunAndSaveCalculatorResult> {
  const computed = await runCalculator(calculatorCode, assessmentId);

  const savedRun = await saveCalculatorRunWithInputs({
    calculatorCode: computed.calculator.code,
    patientId: computed.assessment.patient_id,
    caseId: computed.assessment.case_id,
    assessmentId: computed.assessment.id,
    inputs: computed.inputMap,
    outputs: {
      resultLabel: computed.result.resultLabel,
      resultValue: computed.result.resultValue,
      resultText: computed.result.resultText,
      riskLevel: computed.result.riskLevel,
      interpretation: computed.result.interpretation,
      resultJson: computed.result.resultJson ?? null,
    },
    summary: computed.result.interpretation ?? computed.result.resultText,
  });

  return {
    ...computed,
    savedRun,
  };
}