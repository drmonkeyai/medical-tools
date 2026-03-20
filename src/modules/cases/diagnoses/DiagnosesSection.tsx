import type { DiagnosesSectionData, DiagnosisItem } from "./types";

type DiagnosesSectionProps = {
  data: DiagnosesSectionData;
  className?: string;
};

type DiagnosisRowProps = {
  item: DiagnosisItem;
  index: number;
};

function getTypeBadgeStyle(type: DiagnosisItem["diagnosisType"]) {
  switch (type) {
    case "primary":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    case "secondary":
      return {
        background: "#f1f5f9",
        color: "#475569",
      };
    case "differential":
      return {
        background: "#fef3c7",
        color: "#b45309",
      };
    case "working":
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    default:
      return {
        background: "#f1f5f9",
        color: "#475569",
      };
  }
}

function DiagnosisRow({ item, index }: DiagnosisRowProps) {
  const badgeStyle = getTypeBadgeStyle(item.diagnosisType);

  return (
    <div
      style={{
        padding: "14px 0",
        borderTop: index === 0 ? "none" : "1px solid #e2e8f0",
        opacity: item.isActive ? 1 : 0.65,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          {item.diagnosisName}
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            ...badgeStyle,
          }}
        >
          {item.diagnosisTypeLabel}
        </span>

        {item.icd10Code ? (
          <span
            style={{
              fontSize: 12,
              color: "#475569",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            ICD-10: {item.icd10Code}
          </span>
        ) : null}

        {!item.isActive ? (
          <span
            style={{
              fontSize: 12,
              color: "#991b1b",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            Inactive
          </span>
        ) : null}
      </div>

      {item.note ? (
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.6,
            color: "#334155",
          }}
        >
          {item.note}
        </div>
      ) : null}
    </div>
  );
}

export default function DiagnosesSection({
  data,
  className,
}: DiagnosesSectionProps) {
  return (
    <section
      className={className}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#ffffff",
        padding: 16,
      }}
    >
      <div
        style={{
          paddingBottom: 12,
          marginBottom: 4,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Diagnoses
        </h2>

        <p
          style={{
            margin: "6px 0 0 0",
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Danh sách chẩn đoán của lần khám hiện tại
        </p>
      </div>

      {!data.hasAnyContent ? (
        <div
          style={{
            marginTop: 12,
            padding: "16px 14px",
            border: "1px dashed #cbd5e1",
            borderRadius: 8,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Chưa có chẩn đoán cho lần đánh giá này.
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          {data.items.map((item, index) => (
            <DiagnosisRow key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}