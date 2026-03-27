import { useState } from "react";
import {
  runAndSaveCalculator,
  type RunAndSaveCalculatorResult,
} from "../../../lib/calculator/runAndSaveCalculator";

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không chạy/lưu được calculator.";
}

export function useRunAndSaveCalculator() {
  const [runningCalculator, setRunningCalculator] = useState(false);
  const [runCalculatorError, setRunCalculatorError] = useState("");

  async function execute(
    calculatorCode: string,
    assessmentId: string
  ): Promise<RunAndSaveCalculatorResult> {
    try {
      setRunningCalculator(true);
      setRunCalculatorError("");

      return await runAndSaveCalculator(calculatorCode, assessmentId);
    } catch (error) {
      const message = getErrorMessage(error);
      setRunCalculatorError(message);
      throw new Error(message);
    } finally {
      setRunningCalculator(false);
    }
  }

  function resetRunCalculatorError() {
    setRunCalculatorError("");
  }

  return {
    runningCalculator,
    runCalculatorError,
    execute,
    resetRunCalculatorError,
  };
}