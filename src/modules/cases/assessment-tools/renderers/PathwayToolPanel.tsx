import type { AssessmentToolCatalogItem } from "../types";

type Props = {
  tool: AssessmentToolCatalogItem;
};

export default function PathwayToolPanel({ tool }: Props) {
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
              marginBottom: 10,
            }}
          >
            Các nhánh pathway dự kiến
          </div>

          {tool.pathwayOptions && tool.pathwayOptions.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {tool.pathwayOptions.map((option) => (
                <div
                  key={option.key}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 4,
                    }}
                  >
                    {option.title}
                  </div>
                  <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#64748b" }}>Chưa có nhánh pathway chi tiết.</div>
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
          Tool kiểu pathway sẽ không bị ép thành một calculator code đơn lẻ ở bước này.
          Sau khi khóa rule lâm sàng, từng nhánh sẽ được nối runner riêng.
        </div>
      </div>
    </section>
  );
}