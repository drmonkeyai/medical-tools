export type {
  RenalUnit,
  HepaticClass,
  DoseRule,
  Drug,
} from "./doseAdjust-types";

import { antibioticDrugs } from "./doseAdjust-antibiotics";
import { cardiometabolicDrugs } from "./doseAdjust-cardiometabolic";
import { endocrineRenalDrugs } from "./doseAdjust-endocrine-renal";
import { neuroPainDrugs } from "./doseAdjust-neuro-pain";
import { miscDrugs } from "./doseAdjust-misc";
import { primaryCareCommonDrugs } from "./doseAdjust-primary-care";

export const drugs = [
  ...antibioticDrugs,
  ...cardiometabolicDrugs,
  ...endocrineRenalDrugs,
  ...neuroPainDrugs,
  ...miscDrugs,
  ...primaryCareCommonDrugs,
];