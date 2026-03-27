import type { AssessmentToolCatalogItem } from "./types";
import AutoToolPanel from "./renderers/AutoToolPanel";
import QuestionnaireToolPanel from "./renderers/QuestionnaireToolPanel";
import StructuredToolPanel from "./renderers/StructuredToolPanel";
import PathwayToolPanel from "./renderers/PathwayToolPanel";

type Props = {
  tool: AssessmentToolCatalogItem | null;
  assessmentId?: string;
  onToolSaved?: () => void;
};

function EmptySelection() {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px dashed #cbd5e1",
        borderRadius: 18,
        padding: 20,
        color: "#64748b",
        lineHeight: 1.7,
      }}
    >
      Chọn một công cụ ở danh sách bên trên để bắt đầu đánh giá lâm sàng cho assessment hiện tại.
    </section>
  );
}

export default function AssessmentToolRunner({
  tool,
  assessmentId,
  onToolSaved,
}: Props) {
  if (!tool) {
    return <EmptySelection />;
  }

  if (tool.mode === "auto") {
    return (
      <AutoToolPanel
        tool={tool}
        assessmentId={assessmentId}
        onRunSaved={onToolSaved}
      />
    );
  }

  if (tool.mode === "questionnaire") {
    return <QuestionnaireToolPanel tool={tool} />;
  }

  if (tool.mode === "structured") {
    return <StructuredToolPanel tool={tool} />;
  }

  if (tool.mode === "pathway") {
    return <PathwayToolPanel tool={tool} />;
  }

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

      <div
        style={{
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
          borderRadius: 14,
          padding: 14,
          color: "#334155",
          lineHeight: 1.6,
        }}
      >
        Tool này thuộc loại kết hợp dữ liệu tự động và nhập bổ sung. Bước tiếp theo sẽ nối mixed renderer riêng.
      </div>
    </section>
  );
}