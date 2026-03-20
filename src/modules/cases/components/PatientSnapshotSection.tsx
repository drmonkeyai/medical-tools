import type {
  PatientSnapshotViewModel,
  SnapshotAlert,
} from "../types/patientSnapshot";

type Props = {
  data: PatientSnapshotViewModel;
  onPrint?: () => void;
};

function formatValue(
  value: number | null | undefined,
  suffix?: string,
  digits?: number
) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const text = typeof digits === "number" ? value.toFixed(digits) : String(value);
  return suffix ? `${text} ${suffix}` : text;
}

function InlineField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-900">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

function VitalItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex min-w-[120px] flex-col gap-1 border-r border-slate-200 pr-4 last:border-r-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={
          highlight
            ? "text-sm font-semibold text-red-600"
            : "text-sm font-medium text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

function AlertBadge({ alert }: { alert: SnapshotAlert }) {
  const className =
    alert.severity === "danger"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {alert.label}
    </span>
  );
}

export default function PatientSnapshotSection({ data, onPrint }: Props) {
  const { patient, assessment, vitals, alerts } = data;

  const bpText =
    vitals.systolicBp !== null || vitals.diastolicBp !== null
      ? `${vitals.systolicBp ?? "—"}/${vitals.diastolicBp ?? "—"} mmHg`
      : "—";

  const highBp =
    (vitals.systolicBp !== null && vitals.systolicBp >= 140) ||
    (vitals.diastolicBp !== null && vitals.diastolicBp >= 90);

  const abnormalPulse =
    vitals.heartRate !== null &&
    (vitals.heartRate > 100 || vitals.heartRate < 50);

  const fever = vitals.temperatureC !== null && vitals.temperatureC >= 38;
  const tachypnea =
    vitals.respiratoryRate !== null && vitals.respiratoryRate > 22;
  const lowSpo2 = vitals.spo2 !== null && vitals.spo2 < 94;

  return (
    <section className="border-b border-slate-300 pb-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {patient.fullName}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>Mã BN: {patient.patientCode || "—"}</span>
              <span>Mã ca: {patient.caseCode || "—"}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="text-sm text-slate-600">
              Ngày đánh giá:{" "}
              <span className="font-medium text-slate-900">
                {assessment.assessmentDate || "—"}
              </span>
            </div>

            <div className="flex flex-wrap justify-end gap-2 print:hidden">
              {assessment.hasRedFlag && (
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  Red flag ({assessment.redFlagCount})
                </span>
              )}

              {onPrint && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  In / PDF
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <InlineField label="Tuổi" value={patient.ageText} />
            <InlineField label="Giới" value={patient.genderLabel} />
            <InlineField label="Nghề nghiệp" value={patient.occupation} />
            <InlineField label="Lý do khám" value={assessment.chiefConcern} />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex flex-wrap gap-3">
            <VitalItem label="Huyết áp" value={bpText} highlight={highBp} />
            <VitalItem
              label="Mạch"
              value={formatValue(vitals.heartRate, "bpm")}
              highlight={abnormalPulse}
            />
            <VitalItem
              label="Nhiệt độ"
              value={formatValue(vitals.temperatureC, "°C", 1)}
              highlight={fever}
            />
            <VitalItem
              label="Nhịp thở"
              value={formatValue(vitals.respiratoryRate, "/phút")}
              highlight={tachypnea}
            />
            <VitalItem
              label="SpO₂"
              value={formatValue(vitals.spo2, "%")}
              highlight={lowSpo2}
            />
            <VitalItem
              label="Vòng eo"
              value={formatValue(vitals.waistCm, "cm", 1)}
            />
            <VitalItem
              label="Chiều cao"
              value={formatValue(vitals.heightCm, "cm", 1)}
            />
            <VitalItem
              label="Cân nặng"
              value={formatValue(vitals.weightKg, "kg", 1)}
            />
            <VitalItem label="BMI" value={formatValue(vitals.bmi, "", 1)} />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-slate-600">Cảnh báo nhanh</div>

            {alerts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {alerts.map((alert) => (
                  <AlertBadge key={alert.code} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Chưa ghi nhận cảnh báo.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}