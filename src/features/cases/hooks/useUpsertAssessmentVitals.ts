import { supabase } from "../../../lib/supabase";

export type UpsertAssessmentVitalsPayload = {
  assessmentId: string;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  temperatureC?: number | null;
  respiratoryRate?: number | null;
  spo2Percent?: number | null;
  waistCm?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bmi?: number | null;
};

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function computeBmi(heightCm: number | null, weightKg: number | null) {
  if (!heightCm || !weightKg) return null;
  if (heightCm <= 0 || weightKg <= 0) return null;

  const heightM = heightCm / 100;
  if (!Number.isFinite(heightM) || heightM <= 0) return null;

  return round2(weightKg / (heightM * heightM));
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Không lưu được sinh hiệu.";
}

export function useUpsertAssessmentVitals() {
  async function upsertAssessmentVitals(payload: UpsertAssessmentVitalsPayload) {
    const assessmentId = payload.assessmentId?.trim();

    if (!assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    const systolicBp = toNullableNumber(payload.systolicBp);
    const diastolicBp = toNullableNumber(payload.diastolicBp);
    const heartRate = toNullableNumber(payload.heartRate);
    const temperatureC = toNullableNumber(payload.temperatureC);
    const respiratoryRate = toNullableNumber(payload.respiratoryRate);
    const spo2Percent = toNullableNumber(payload.spo2Percent);
    const waistCm = toNullableNumber(payload.waistCm);
    const heightCm = toNullableNumber(payload.heightCm);
    const weightKg = toNullableNumber(payload.weightKg);

    const bmi =
      payload.bmi !== undefined
        ? toNullableNumber(payload.bmi)
        : computeBmi(heightCm, weightKg);

    try {
      const { data, error } = await supabase
        .from("assessment_vitals")
        .upsert(
          [
            {
              assessment_id: assessmentId,
              systolic_bp: systolicBp,
              diastolic_bp: diastolicBp,
              heart_rate: heartRate,
              temperature_c: temperatureC,
              respiratory_rate: respiratoryRate,
              spo2_percent: spo2Percent,
              waist_cm: waistCm,
              height_cm: heightCm,
              weight_kg: weightKg,
              bmi,
            },
          ],
          { onConflict: "assessment_id" }
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  return {
    upsertAssessmentVitals,
  };
}