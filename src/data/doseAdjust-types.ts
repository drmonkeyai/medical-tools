export type RenalUnit = "mL/min/1.73m²";

export type HepaticClass =
  | "None"
  | "Child-Pugh A"
  | "Child-Pugh B"
  | "Child-Pugh C";

export type DoseRule = {
  egfrMin?: number; // inclusive
  egfrMax?: number; // exclusive
  childPugh?: HepaticClass;
  recommendation: string;
};

export type Drug = {
  id: string;
  name: string;
  aliases?: string[];
  group?: string;
  typicalDose?: string;
  notes?: string;
  renalRules?: DoseRule[];
  hepaticRules?: DoseRule[];
};