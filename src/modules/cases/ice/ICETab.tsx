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

function IceCard({
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

export default function ICETab({ data }: Props) {
  const ideas = getText(data, "ideas");
  const concerns = getText(data, "concerns");
  const expectations = getText(data, "expectations");

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      }}
    >
      <IceCard title="Ideas" value={ideas} />
      <IceCard title="Concerns" value={concerns} />
      <IceCard title="Expectations" value={expectations} />
    </div>
  );
}