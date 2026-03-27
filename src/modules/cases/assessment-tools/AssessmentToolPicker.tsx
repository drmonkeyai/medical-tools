import { useMemo, useState } from "react";
import { groupAssessmentToolsByCategory } from "./catalog";
import type { AssessmentToolCatalogItem } from "./types";

type Props = {
  tools: AssessmentToolCatalogItem[];
  selectedToolKey?: string | null;
  onSelect: (toolKey: string) => void;
};

function matchesSearch(tool: AssessmentToolCatalogItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystacks = [
    tool.title,
    tool.shortDescription,
    tool.categoryLabel,
    tool.clinicalPurpose,
    tool.inputRequirement,
    ...(tool.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return haystacks.includes(q);
}

function modeLabel(mode: AssessmentToolCatalogItem["mode"]) {
  if (mode === "auto") return "Tự động";
  if (mode === "questionnaire") return "Bộ câu hỏi";
  if (mode === "structured") return "Structured";
  if (mode === "mixed") return "Kết hợp";
  return "Pathway";
}

function statusLabel(status: AssessmentToolCatalogItem["status"]) {
  if (status === "ready") return "Sẵn sàng";
  if (status === "planned") return "Đang chuẩn bị";
  return "Cần khóa rule";
}

function priorityTone(priority: AssessmentToolCatalogItem["priority"]) {
  if (priority === "core") return "#dbeafe";
  if (priority === "high") return "#fef3c7";
  return "#f1f5f9";
}

export default function AssessmentToolPicker({
  tools,
  selectedToolKey,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const filtered = tools.filter((tool) => matchesSearch(tool, query));
    return groupAssessmentToolsByCategory(filtered);
  }, [tools, query]);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 8,
          }}
        >
          Chọn vấn đề cần đánh giá
        </div>
        <div style={{ color: "#475569", fontSize: 14, marginBottom: 12 }}>
          Bác sĩ chọn mục tiêu đánh giá lâm sàng, sau đó hệ thống mới mở công cụ phù hợp.
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm nhanh theo tên công cụ, mục tiêu đánh giá hoặc từ khóa..."
          style={{
            width: "100%",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {filteredGroups.length === 0 ? (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            Không tìm thấy công cụ phù hợp.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.categoryKey}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 12,
                }}
              >
                {group.categoryLabel}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {group.items.map((tool) => {
                  const selected = selectedToolKey === tool.toolKey;

                  return (
                    <button
                      key={tool.toolKey}
                      type="button"
                      onClick={() => onSelect(tool.toolKey)}
                      style={{
                        textAlign: "left",
                        borderRadius: 18,
                        border: selected
                          ? "1.5px solid #2563eb"
                          : "1px solid #cbd5e1",
                        background: selected ? "#eff6ff" : "#ffffff",
                        padding: 16,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        minHeight: 168,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#0f172a",
                            lineHeight: 1.3,
                          }}
                        >
                          {tool.title}
                        </div>

                        <div
                          style={{
                            minWidth: 88,
                            textAlign: "center",
                            padding: "8px 10px",
                            borderRadius: 999,
                            border: "1px solid #cbd5e1",
                            background: priorityTone(tool.priority),
                            color: "#334155",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {modeLabel(tool.mode)}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#334155",
                          lineHeight: 1.45,
                        }}
                      >
                        {tool.shortDescription}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {tool.clinicalPurpose}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 999,
                            padding: "6px 10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#334155",
                          }}
                        >
                          {statusLabel(tool.status)}
                        </span>

                        {tool.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 12,
                              borderRadius: 999,
                              padding: "6px 10px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              color: "#64748b",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}