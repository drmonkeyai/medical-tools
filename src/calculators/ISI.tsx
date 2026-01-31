import { useMemo, useState } from "react";

type ResultSeverity = "low" | "moderate" | "high";

type CalcResult = {
  score: number;
  levelText: string;
  severity: ResultSeverity;
  interpretation: string;
  caveat?: string;
};

function clampNumber(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function Badge({ severity, text }: { severity: ResultSeverity; text: string }) {
  const bg =
    severity === "low"
      ? "rgba(16,185,129,0.12)"
      : severity === "moderate"
      ? "rgba(245,158,11,0.14)"
      : "rgba(239,68,68,0.14)";

  const bd =
    severity === "low"
      ? "rgba(16,185,129,0.35)"
      : severity === "moderate"
      ? "rgba(245,158,11,0.35)"
      : "rgba(239,68,68,0.35)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${bd}`,
        background: bg,
        fontWeight: 800,
        fontSize: 12,
      }}
    >
      {text}
    </span>
  );
}

/**
 * TEMPLATE: bạn thay phần này theo calculator thật
 * Ví dụ ISI: 7 câu, mỗi câu 0–4
 */
type FormState = {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
};

const initialState: FormState = {
  q1: 0,
  q2: 0,
  q3: 0,
  q4: 0,
  q5: 0,
  q6: 0,
  q7: 0,
};

function computeResult(values: FormState): CalcResult {
  const score =
    values.q1 +
    values.q2 +
    values.q3 +
    values.q4 +
    values.q5 +
    values.q6 +
    values.q7;

  // Ví dụ phân tầng ISI (demo). Bạn có thể thay theo guideline bạn chọn.
  if (score <= 7) {
    return {
      score,
      severity: "low",
      levelText: "Không mất ngủ / nhẹ",
      interpretation: "Điểm thấp. Theo dõi, ưu tiên vệ sinh giấc ngủ.",
    };
  }
  if (score <= 14) {
    return {
      score,
      severity: "moderate",
      levelText: "Mất ngủ mức độ nhẹ",
      interpretation:
        "Cân nhắc đánh giá thêm các yếu tố liên quan; can thiệp hành vi.",
    };
  }
  if (score <= 21) {
    return {
      score,
      severity: "moderate",
      levelText: "Mất ngủ mức độ vừa",
      interpretation:
        "Cân nhắc đánh giá toàn diện, ưu tiên CBT-I nếu phù hợp.",
    };
  }
  return {
    score,
    severity: "high",
    levelText: "Mất ngủ mức độ nặng",
    interpretation:
      "Cân nhắc thăm khám chuyên khoa/đánh giá nguyên nhân, can thiệp tích cực.",
    caveat: "Cần loại trừ nguyên nhân thực thể/thuốc/loạn thần, v.v.",
  };
}

function NumberSelect({
  value,
  onChange,
  min = 0,
  max = 4,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(clampNumber(Number(e.target.value), min, max))}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid var(--line)",
        background: "white",
        cursor: "pointer",
        minWidth: 120,
        fontWeight: 700,
      }}
    >
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}

export default function CalculatorTemplate_ISI() {
  const [values, setValues] = useState<FormState>(initialState);

  const result = useMemo(() => computeResult(values), [values]);

  const setField = (k: keyof FormState, v: number) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  const reset = () => setValues(initialState);

  return (
    <div className="page">
      {/* Header */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>ISI – Mất ngủ</h1>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>
              Insomnia Severity Index (7 câu) – công cụ hỗ trợ sàng lọc/đánh giá mức độ.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          Nguồn/ghi chú: (điền guideline/bài báo bạn dùng) • Công cụ chỉ mang tính tham khảo.
        </div>
      </div>

      <div className="grid">
        {/* Left: Form */}
        <div className="card" style={{ gridColumn: "span 7" }}>
          <h2 style={{ marginTop: 0 }}>Nhập dữ liệu</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              { key: "q1", label: "1) Khó đi vào giấc ngủ" },
              { key: "q2", label: "2) Khó duy trì giấc ngủ" },
              { key: "q3", label: "3) Thức dậy sớm" },
              { key: "q4", label: "4) Mức độ hài lòng về giấc ngủ" },
              { key: "q5", label: "5) Ảnh hưởng đến hoạt động ban ngày" },
              { key: "q6", label: "6) Nhận thấy người khác lo lắng về giấc ngủ" },
              { key: "q7", label: "7) Mức độ căng thẳng do mất ngủ" },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "white",
                }}
              >
                <div style={{ fontWeight: 800 }}>{item.label}</div>
                <NumberSelect
                  value={values[item.key as keyof FormState]}
                  onChange={(v) => setField(item.key as keyof FormState, v)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Thang điểm mẫu: 0–4 mỗi mục (tuỳ tool bạn có thể đổi thành input số, checkbox, radio).
          </div>
        </div>

        {/* Right: Result */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <h2 style={{ marginTop: 0 }}>Kết quả</h2>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tổng điểm</div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                {result.score}
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <Badge severity={result.severity} text={result.levelText} />
            </div>

            <div style={{ marginTop: 12, color: "var(--text)", lineHeight: 1.45 }}>
              {result.interpretation}
            </div>

            {result.caveat && (
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
                <b>Lưu ý:</b> {result.caveat}
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            ⚠️ Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
          </div>
        </div>
      </div>
    </div>
  );
}
