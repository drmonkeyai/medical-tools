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

function SectionCard({
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
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ whiteSpace: "pre-wrap", color: value ? "#0f172a" : "#64748b" }}>
        {value || "Chưa có dữ liệu."}
      </div>
    </div>
  );
}

export default function BioPsychoSocialTab({ data }: Props) {
  const biologicalFactors = getText(data, "biologicalFactors", "biological_factors");
  const psychologicalFactors = getText(
    data,
    "psychologicalFactors",
    "psychological_factors"
  );
  const socialFactors = getText(data, "socialFactors", "social_factors");

  const generalAppearance = getText(data, "generalAppearance", "general_appearance");
  const cardiovascularExam = getText(data, "cardiovascularExam", "cardiovascular_exam");
  const respiratoryExam = getText(data, "respiratoryExam", "respiratory_exam");
  const abdominalExam = getText(data, "abdominalExam", "abdominal_exam");
  const otherExam = getText(data, "otherExam", "other_exam");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        }}
      >
        <SectionCard title="Biological Factors" value={biologicalFactors} />
        <SectionCard title="Psychological Factors" value={psychologicalFactors} />
        <SectionCard title="Social Factors" value={socialFactors} />
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <SectionCard title="General Appearance" value={generalAppearance} />
        <SectionCard title="Cardiovascular Exam" value={cardiovascularExam} />
        <SectionCard title="Respiratory Exam" value={respiratoryExam} />
        <SectionCard title="Abdominal Exam" value={abdominalExam} />
        <SectionCard title="Other Exam" value={otherExam} />
      </div>
    </div>
  );
}