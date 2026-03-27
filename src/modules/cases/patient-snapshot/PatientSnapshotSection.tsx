type PatientLike = {
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  occupation?: string | null;
};

type CaseLike = {
  primary_diagnosis?: string | null;
  red_flag?: boolean | null;
};

type AssessmentLike = {
  chief_complaint?: string | null;
  is_red_flag_present?: boolean | null;
};

type VitalsLike = {
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  heart_rate?: number | null;
  temperature_c?: number | null;
  respiratory_rate?: number | null;
  spo2_percent?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
};

type Props = {
  patient: PatientLike | null;
  caseItem: CaseLike | null;
  assessment: AssessmentLike | null;
  vitals: VitalsLike | null;
  referralLabel?: string;
};

function calcAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) return "—";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age} tuổi` : "—";
}

function formatBirthLine(dateOfBirth?: string | null) {
  if (!dateOfBirth) return "—";
  const d = new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("vi-VN")} (${calcAge(dateOfBirth)})`;
}

function displayVital(value?: number | null, unit?: string) {
  if (value == null || Number.isNaN(value)) return "—";
  return unit ? `${value} ${unit}` : String(value);
}

function SnapshotCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value?: string | null;
  tone?: "default" | "warning";
}) {
  return (
    <div
      style={{
        border: tone === "warning" ? "1px solid #fbbf24" : "1px solid #e2e8f0",
        background: tone === "warning" ? "#fffbea" : "#ffffff",
        borderRadius: 14,
        padding: 16,
        minHeight: 100,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#0f172a",
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
        }}
      >
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

function VitalCard({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        borderRadius: 14,
        padding: 16,
        minHeight: 92,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

export default function PatientSnapshotSection({
  patient,
  caseItem,
  assessment,
  vitals,
  referralLabel = "Chưa xác định",
}: Props) {
  const bloodPressure =
    vitals?.systolic_bp != null || vitals?.diastolic_bp != null
      ? `${vitals?.systolic_bp ?? "—"}/${vitals?.diastolic_bp ?? "—"}`
      : "—";

  const hasRedFlag = assessment?.is_red_flag_present ?? caseItem?.red_flag ?? false;

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          color: "#64748b",
          fontSize: 14,
          marginBottom: 18,
        }}
      >
        <span>Ngày sinh: {formatBirthLine(patient?.date_of_birth)}</span>
        <span>Giới tính: {patient?.gender || "—"}</span>
        <span>Nghề nghiệp: {patient?.occupation || "—"}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <SnapshotCard
          title="Chẩn đoán chính của lần đánh giá"
          value={caseItem?.primary_diagnosis || "—"}
        />
        <SnapshotCard
          title="Lý do đánh giá"
          value={assessment?.chief_complaint || "—"}
        />
        <SnapshotCard
          title="Red flag"
          value={hasRedFlag ? "Có" : "Không"}
        />
        <SnapshotCard
          title="Chuyển tuyến"
          value={referralLabel}
          tone="warning"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <VitalCard title="HA" value={bloodPressure} />
        <VitalCard title="Mạch" value={displayVital(vitals?.heart_rate, "bpm")} />
        <VitalCard title="Nhiệt độ" value={displayVital(vitals?.temperature_c, "°C")} />
        <VitalCard title="Nhịp thở" value={displayVital(vitals?.respiratory_rate, "/phút")} />
        <VitalCard title="SpO2" value={displayVital(vitals?.spo2_percent, "%")} />
        <VitalCard title="Chiều cao" value={displayVital(vitals?.height_cm, "cm")} />
        <VitalCard title="Cân nặng" value={displayVital(vitals?.weight_kg, "kg")} />
        <VitalCard title="BMI" value={displayVital(vitals?.bmi)} />
      </div>
    </section>
  );
}