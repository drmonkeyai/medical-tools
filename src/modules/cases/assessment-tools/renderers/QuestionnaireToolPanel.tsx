import type { AssessmentToolCatalogItem } from "../types";

type Props = {
  tool: AssessmentToolCatalogItem;
};

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
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
          fontSize: 13,
          fontWeight: 800,
          color: "#475569",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

export default function QuestionnaireToolPanel({ tool }: Props) {
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
        <InfoCard title="Công cụ đánh giá" text={tool.shortDescription} />
        <InfoCard title="Mục tiêu lâm sàng" text={tool.clinicalPurpose} />
        <InfoCard title="Yêu cầu đầu vào" text={tool.inputRequirement} />

        {tool.questionnaireDomains && tool.questionnaireDomains.length > 0 ? (
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
              Miền / mục cần đánh giá trong form câu hỏi
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {tool.questionnaireDomains.map((domain) => (
                <span
                  key={domain}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: 13,
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div
          style={{
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1d4ed8",
            borderRadius: 14,
            padding: 14,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          V1 của bước này tập trung đổi đúng UX: bác sĩ chọn đúng vấn đề cần đánh giá.
          Form scoring chi tiết cho nhóm questionnaire sẽ nối ở bước tiếp theo để không
          ép các tool này vào runner tự động cũ.
        </div>
      </div>
    </section>
  );
}