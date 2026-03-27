import {
  saveCalculatorRunWithInputs,
  type SaveCalculatorRunPayload,
} from "../../../lib/calculator/saveCalculatorRun";

export type { SaveCalculatorRunPayload };

export function useSaveCalculatorRun() {
  async function saveCalculatorRun(payload: SaveCalculatorRunPayload) {
    return saveCalculatorRunWithInputs(payload);
  }

  return {
    saveCalculatorRun,
  };
}