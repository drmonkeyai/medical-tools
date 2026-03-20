type Props = {
  caseCode?: string | null;
  title?: string | null;
  primaryProblem?: string | null;
  primaryDiagnosis?: string | null;
  assessmentDate?: string | null;
  chiefComplaint?: string | null;
  hasRedFlag?: boolean | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export default function CaseHeader({
  caseCode,
  title,
  primaryProblem,
  primaryDiagnosis,
  assessmentDate,
  chiefComplaint,
  hasRedFlag,
}: Props) {
  return (
    <section
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 280, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              color: "#64748b",
              marginBottom: 6,
            }}
          >
            Mã ca: {caseCode || "—"}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: 1.3,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {title || chiefComplaint || "Clinical workspace"}
          </h1>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 20px",
              fontSize: 14,
              color: "#475569",
            }}
          >
            <span>Ngày đánh giá: {formatDate(assessmentDate)}</span>
            <span>Vấn đề chính: {primaryProblem || "—"}</span>
            <span>Chẩn đoán chính: {primaryDiagnosis || "—"}</span>
          </div>
        </div>

        {hasRedFlag ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Red flag
          </div>
        ) : null}
      </div>
    </section>
  );
}