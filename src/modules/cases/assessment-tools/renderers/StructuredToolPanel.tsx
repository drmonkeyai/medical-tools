import type { AssessmentToolCatalogItem } from "../types";

type Props = {
  tool: AssessmentToolCatalogItem;
};

export default function StructuredToolPanel({ tool }: Props) {
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
          fontSize: 20,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 12,
        }}
      >
        {tool.title}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Mục tiêu lâm sàng
          </div>
          <div style={{ color: "#334155", lineHeight: 1.6 }}>
            {tool.clinicalPurpose}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Hướng dữ liệu cần ghi nhận
          </div>
          {tool.structuredHints && tool.structuredHints.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.8 }}>
              {tool.structuredHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "#64748b" }}>Tool này sẽ có editor structured riêng.</div>
          )}
        </div>

        <div
          style={{
            border: "1px solid #fcd34d",
            background: "#fffbeb",
            color: "#92400e",
            borderRadius: 14,
            padding: 14,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          V1 mới chỉ đưa structured tool vào đúng vị trí trong clinical workspace.
          Editor chi tiết sẽ tách thành module riêng ở bước tiếp theo.
        </div>
      </div>
    </section>
  );
}