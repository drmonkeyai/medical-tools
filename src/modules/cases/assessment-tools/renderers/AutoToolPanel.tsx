import { useMemo, useState } from "react";
import { useRunAndSaveCalculator } from "../../../../features/calculators/hooks/useRunAndSaveCalculator";
import type { AssessmentToolCatalogItem } from "../types";

type Props = {
  tool: AssessmentToolCatalogItem;
  assessmentId?: string;
  onRunSaved?: () => void;
};

function StatusBox({
  tone,
  text,
}: {
  tone: "info" | "success" | "error";
  text: string;
}) {
  const palette =
    tone === "success"
      ? {
          border: "#86efac",
          background: "#f0fdf4",
          color: "#166534",
        }
      : tone === "error"
      ? {
          border: "#fca5a5",
          background: "#fef2f2",
          color: "#b91c1c",
        }
      : {
          border: "#bfdbfe",
          background: "#eff6ff",
          color: "#1d4ed8",
        };

  return (
    <div
      style={{
        border: `1px solid ${palette.border}`,
        background: palette.background,
        color: palette.color,
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

export default function AutoToolPanel({
  tool,
  assessmentId,
  onRunSaved,
}: Props) {
  const {
    runningCalculator,
    runCalculatorError,
    execute,
    resetRunCalculatorError,
  } = useRunAndSaveCalculator();

  const [successMessage, setSuccessMessage] = useState("");

  const canRun = useMemo(() => {
    return Boolean(assessmentId?.trim() && tool.calculatorCode?.trim());
  }, [assessmentId, tool.calculatorCode]);

  async function handleRun() {
    if (!assessmentId?.trim()) {
      setSuccessMessage("");
      return;
    }

    if (!tool.calculatorCode?.trim()) {
      setSuccessMessage("");
      return;
    }

    setSuccessMessage("");
    resetRunCalculatorError();

    try {
      const result = await execute(tool.calculatorCode, assessmentId);
      const savedCount =
        typeof result?.savedRun?.inputCount === "number"
          ? result.savedRun.inputCount
          : 0;

      setSuccessMessage(
        `Đã đánh giá và lưu ${tool.title}. Snapshot input đã lưu: ${savedCount} mục.`
      );
      onRunSaved?.();
    } catch {
      // hook đã giữ message lỗi
    }
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

      <div style={{ display: "grid", gap: 12 }}>
        <StatusBox tone="info" text={tool.shortDescription} />
        <StatusBox
          tone="info"
          text={`Mục tiêu lâm sàng: ${tool.clinicalPurpose}`}
        />
        <StatusBox
          tone="info"
          text={`Nguồn dữ liệu: ${tool.inputRequirement}`}
        />

        {!assessmentId?.trim() ? (
          <StatusBox
            tone="error"
            text="Chưa xác định assessment hiện tại nên chưa thể chạy tool tự động."
          />
        ) : null}

        {!tool.calculatorCode?.trim() ? (
          <StatusBox
            tone="error"
            text="Tool này chưa nối calculatorCode thật nên chưa thể chạy ở chế độ tự động."
          />
        ) : null}

        {runCalculatorError ? (
          <StatusBox tone="error" text={runCalculatorError} />
        ) : null}

        {successMessage ? (
          <StatusBox tone="success" text={successMessage} />
        ) : null}

        <div>
          <button
            type="button"
            onClick={handleRun}
            disabled={!canRun || runningCalculator}
            style={{
              border: "1px solid #2563eb",
              background: !canRun || runningCalculator ? "#93c5fd" : "#2563eb",
              color: "#ffffff",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: !canRun || runningCalculator ? "not-allowed" : "pointer",
            }}
          >
            {runningCalculator ? "Đang đánh giá..." : "Đánh giá và lưu"}
          </button>
        </div>
      </div>
    </section>
  );
}