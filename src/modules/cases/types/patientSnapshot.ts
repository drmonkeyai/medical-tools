export type SnapshotAlertSeverity = "info" | "warning" | "danger";

export type SnapshotAlert = {
  code: string;
  label: string;
  severity: SnapshotAlertSeverity;
};

export type PatientSnapshotViewModel = {
  patient: {
    fullName: string;
    patientCode: string | null;
    caseCode: string | null;
    ageText: string;
    genderLabel: string;
    occupation: string | null;
  };
  assessment: {
    assessmentId: string;
    assessmentDate: string | null;
    assessmentDateTimeText: string | null;
    chiefConcern: string | null;
    hasRedFlag: boolean;
    redFlagCount: number;
  };
  vitals: {
    systolicBp: number | null;
    diastolicBp: number | null;
    heartRate: number | null;
    temperatureC: number | null;
    respiratoryRate: number | null;
    spo2: number | null;
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    waistCm: number | null;
  };
  alerts: SnapshotAlert[];
  abnormalVitalCount: number;
};