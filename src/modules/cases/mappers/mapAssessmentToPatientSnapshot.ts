import type {
  PatientSnapshotViewModel,
  SnapshotAlert,
} from "../types/patientSnapshot";

type NullableNumber = number | null | undefined;

export type PatientRow = {
  id: string;
  patient_code?: string | null;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  occupation?: string | null;
};

export type CaseRow = {
  id: string;
  patient_id: string;
  case_code?: string | null;
  red_flag?: boolean | null;
};

export type AssessmentRow = {
  id: string;
  case_id: string;
  assessment_no?: number | null;
  assessment_date?: string | null;
  chief_complaint?: string | null;
  is_red_flag_present?: boolean | null;
};

export type VitalsRow = {
  assessment_id: string;
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  heart_rate?: number | null;
  temperature_c?: number | null;
  respiratory_rate?: number | null;
  spo2_percent?: number | null;
  waist_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
};

export type MapPatientSnapshotInput = {
  patient: PatientRow | null | undefined;
  caseItem: CaseRow | null | undefined;
  assessment: AssessmentRow | null | undefined;
  vitals: VitalsRow | null | undefined;
  redFlagCount?: number;
};

function asNumber(value: NullableNumber): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("vi-VN");
}

function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("vi-VN");
}

function formatGender(value?: string | null): string {
  if (!value) return "—";

  const normalized = value.trim().toLowerCase();

  if (normalized === "male" || normalized === "nam") return "Nam";
  if (normalized === "female" || normalized === "nữ" || normalized === "nu") {
    return "Nữ";
  }
  if (normalized === "other") return "Khác";
  if (normalized === "unknown") return "Không rõ";

  return value;
}

function calculateAge(
  dateOfBirth?: string | null,
  referenceDate?: string | null
): number | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const ref = referenceDate ? new Date(referenceDate) : new Date();
  if (Number.isNaN(ref.getTime())) return null;

  let age = ref.getFullYear() - dob.getFullYear();
  const monthDiff = ref.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function calculateBMI(
  weightKg?: number | null,
  heightCm?: number | null
): number | null {
  const weight = asNumber(weightKg);
  const height = asNumber(heightCm);

  if (!weight || !height || height <= 0) return null;

  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  if (!Number.isFinite(bmi)) return null;
  return Math.round(bmi * 10) / 10;
}

function buildAlerts(params: {
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  temperatureC: number | null;
  respiratoryRate: number | null;
  spo2: number | null;
  hasRedFlag: boolean;
}): SnapshotAlert[] {
  const alerts: SnapshotAlert[] = [];

  const {
    systolicBp,
    diastolicBp,
    heartRate,
    temperatureC,
    respiratoryRate,
    spo2,
    hasRedFlag,
  } = params;

  if (
    (systolicBp !== null && systolicBp >= 140) ||
    (diastolicBp !== null && diastolicBp >= 90)
  ) {
    alerts.push({
      code: "high_bp",
      label: "Tăng huyết áp",
      severity: "warning",
    });
  }

  if (heartRate !== null && heartRate > 100) {
    alerts.push({
      code: "tachycardia",
      label: "Mạch nhanh",
      severity: "warning",
    });
  }

  if (heartRate !== null && heartRate < 50) {
    alerts.push({
      code: "bradycardia",
      label: "Mạch chậm",
      severity: "warning",
    });
  }

  if (temperatureC !== null && temperatureC >= 38) {
    alerts.push({
      code: "fever",
      label: "Sốt",
      severity: "warning",
    });
  }

  if (respiratoryRate !== null && respiratoryRate > 22) {
    alerts.push({
      code: "tachypnea",
      label: "Thở nhanh",
      severity: "warning",
    });
  }

  if (spo2 !== null && spo2 < 94) {
    alerts.push({
      code: "low_spo2",
      label: "SpO₂ thấp",
      severity: "danger",
    });
  }

  if (hasRedFlag) {
    alerts.push({
      code: "red_flag",
      label: "Có red flag",
      severity: "danger",
    });
  }

  return alerts;
}

export function mapAssessmentToPatientSnapshot(
  input: MapPatientSnapshotInput
): PatientSnapshotViewModel {
  const { patient, caseItem, assessment, vitals } = input;

  if (!assessment?.id) {
    throw new Error("Assessment is required");
  }

  const systolicBp = asNumber(vitals?.systolic_bp);
  const diastolicBp = asNumber(vitals?.diastolic_bp);
  const heartRate = asNumber(vitals?.heart_rate);
  const temperatureC = asNumber(vitals?.temperature_c);
  const respiratoryRate = asNumber(vitals?.respiratory_rate);
  const spo2 = asNumber(vitals?.spo2_percent);
  const weightKg = asNumber(vitals?.weight_kg);
  const heightCm = asNumber(vitals?.height_cm);
  const waistCm = asNumber(vitals?.waist_cm);

  const bmi =
    asNumber(vitals?.bmi) ?? calculateBMI(weightKg ?? null, heightCm ?? null);

  const redFlagCount =
    input.redFlagCount ??
    (assessment.is_red_flag_present ? 1 : caseItem?.red_flag ? 1 : 0);

  const hasRedFlag = redFlagCount > 0;

  const alerts = buildAlerts({
    systolicBp,
    diastolicBp,
    heartRate,
    temperatureC,
    respiratoryRate,
    spo2,
    hasRedFlag,
  });

  const abnormalVitalCount = alerts.filter((a) => a.code !== "red_flag").length;

  const age = calculateAge(patient?.date_of_birth, assessment.assessment_date);

  return {
    patient: {
      fullName: patient?.full_name?.trim() || "Không rõ tên",
      patientCode: patient?.patient_code ?? null,
      caseCode: caseItem?.case_code ?? null,
      ageText: age !== null ? `${age} tuổi` : "—",
      genderLabel: formatGender(patient?.gender),
      occupation: patient?.occupation?.trim() || null,
    },
    assessment: {
      assessmentId: assessment.id,
      assessmentDate: formatDate(assessment.assessment_date),
      assessmentDateTimeText: formatDateTime(assessment.assessment_date),
      chiefConcern: assessment.chief_complaint ?? null,
      hasRedFlag,
      redFlagCount,
    },
    vitals: {
      systolicBp,
      diastolicBp,
      heartRate,
      temperatureC,
      respiratoryRate,
      spo2,
      weightKg,
      heightCm,
      bmi,
      waistCm,
    },
    alerts,
    abnormalVitalCount,
  };
}