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
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "baseline",
        minWidth: 180,
      }}
    >
      <span style={{ fontSize: 14, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
        {value?.trim() ? value : "—"}
      </span>
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
    <div
      style={{
        minWidth: 110,
        paddingRight: 16,
        borderRight: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: highlight ? "#dc2626" : "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AlertBadge({ alert }: { alert: SnapshotAlert }) {
  const style =
    alert.severity === "danger"
      ? {
          border: "1px solid #fecaca",
          background: "#fef2f2",
          color: "#b91c1c",
        }
      : {
          border: "1px solid #fde68a",
          background: "#fffbeb",
          color: "#b45309",
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 600,
        ...style,
      }}
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
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {patient.fullName}
            </h2>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 18px",
                fontSize: 14,
                color: "#475569",
              }}
            >
              <span>Mã BN: {patient.patientCode || "—"}</span>
              <span>Mã ca: {patient.caseCode || "—"}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
              Ngày đánh giá:{" "}
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                {assessment.assessmentDate || "—"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {assessment.hasRedFlag ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 999,
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Red flag ({assessment.redFlagCount})
                </span>
              ) : null}

              {onPrint ? (
                <button
                  type="button"
                  onClick={onPrint}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  In / PDF
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: 14,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 24px",
          }}
        >
          <InlineField label="Tuổi" value={patient.ageText} />
          <InlineField label="Giới" value={patient.genderLabel} />
          <InlineField label="Nghề nghiệp" value={patient.occupation} />
          <InlineField label="Lý do khám" value={assessment.chiefConcern} />
        </div>

        <div
          style={{
            paddingTop: 14,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
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

        <div
          style={{
            paddingTop: 14,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 14, color: "#475569", marginBottom: 10 }}>
            Cảnh báo nhanh
          </div>

          {alerts.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {alerts.map((alert) => (
                <AlertBadge key={alert.code} alert={alert} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              Chưa ghi nhận cảnh báo.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}