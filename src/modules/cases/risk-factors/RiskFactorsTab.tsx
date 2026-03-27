import RedFlagsSection from "../red-flags/RedFlagsSection";

type Props = {
  vitals: {
    bmi?: number | null;
    waist_cm?: number | null;
    weight_kg?: number | null;
    height_cm?: number | null;
  } | null;
  redFlags: unknown;
  noteData: Record<string, unknown> | null;
  assessmentId?: string;
  onChanged?: () => Promise<void> | void;
};

function getText(data: Record<string, unknown> | null, ...keys: string[]) {
  if (!data) return "";
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function RiskCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ color: value ? "#0f172a" : "#64748b", whiteSpace: "pre-wrap" }}>
        {value || "Chưa có dữ liệu."}
      </div>
    </div>
  );
}

export default function RiskFactorsTab({
  vitals,
  redFlags,
  noteData,
  assessmentId,
  onChanged,
}: Props) {
  const socialHistory = getText(noteData, "socialHistory", "social_history");
  const biologicalFactors = getText(noteData, "biologicalFactors", "biological_factors");

  const anthropometrySummary = [
    vitals?.height_cm ? `Chiều cao: ${vitals.height_cm} cm` : "",
    vitals?.weight_kg ? `Cân nặng: ${vitals.weight_kg} kg` : "",
    vitals?.waist_cm ? `Vòng eo: ${vitals.waist_cm} cm` : "",
    vitals?.bmi ? `BMI: ${vitals.bmi}` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <RiskCard title="Anthropometry / Risk Summary" value={anthropometrySummary} />
        <RiskCard title="Social Risk / Lifestyle" value={socialHistory} />
        <RiskCard title="Biological Risk Context" value={biologicalFactors} />
      </div>

      <RedFlagsSection
        data={redFlags as Parameters<typeof RedFlagsSection>[0]["data"]}
        assessmentId={assessmentId}
        onChanged={onChanged}
      />
    </div>
  );
}