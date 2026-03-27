type Props = {
  data: Record<string, unknown> | null;
};

function getText(data: Record<string, unknown> | null, ...keys: string[]) {
  if (!data) return "";
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function InfoBlock({
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
      <div style={{ whiteSpace: "pre-wrap", color: value ? "#0f172a" : "#64748b" }}>
        {value || "Chưa có dữ liệu."}
      </div>
    </div>
  );
}

export default function HistoryTab({ data }: Props) {
  const historyOfPresentIllness = getText(
    data,
    "historyOfPresentIllness",
    "history_of_present_illness"
  );
  const pastMedicalHistory = getText(data, "pastMedicalHistory", "past_medical_history");
  const pastSurgicalHistory = getText(data, "pastSurgicalHistory", "past_surgical_history");
  const medicationHistory = getText(data, "medicationHistory", "medication_history");
  const allergyHistory = getText(data, "allergyHistory", "allergy_history");
  const familyHistory = getText(data, "familyHistory", "family_history");
  const socialHistory = getText(data, "socialHistory", "social_history");

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <InfoBlock
          title="History of Present Illness"
          value={historyOfPresentIllness}
        />
      </div>

      <InfoBlock title="Past Medical History" value={pastMedicalHistory} />
      <InfoBlock title="Past Surgical History" value={pastSurgicalHistory} />
      <InfoBlock title="Medication History" value={medicationHistory} />
      <InfoBlock title="Allergy History" value={allergyHistory} />
      <InfoBlock title="Family History" value={familyHistory} />
      <InfoBlock title="Social History" value={socialHistory} />
    </div>
  );
}