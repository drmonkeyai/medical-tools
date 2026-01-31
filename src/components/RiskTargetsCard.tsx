import React from "react";
import type { RiskLevel } from "../calculators/riskBadge";
import { riskBadgeClass, riskLabelVi } from "../calculators/riskBadge";

type Props = {
  riskLevel: RiskLevel;
  riskPercent?: number; // ví dụ 7.2 (%)
  modelName?: string;   // "SCORE2", "SCORE2-ASIAN"...
  note?: string;        // mô tả thêm nếu cần
  showSecondary?: boolean; // bật/tắt mục tiêu phụ
};

function formatPercent(x?: number) {
  if (x === undefined || x === null || !Number.isFinite(x)) return null;
  return `${x.toFixed(1)}%`;
}

function mmolToMgdlLDL(mmol: number) {
  // LDL-C mmol/L -> mg/dL (x38.67)
  return Math.round(mmol * 38.67);
}

function mmolToMgdlNonHDL(mmol: number) {
  return Math.round(mmol * 38.67);
}

type Targets = {
  ldlMmol: number;
  ldlRule: string; // text rule like "Giảm ≥50% nếu..."
  nonHdlMmol?: number;
  apoB?: number; // mg/dL
};

function getTargets(level: RiskLevel): Targets {
  // ESC/EAS: LDL primary goals + secondary goals for non-HDL/ApoB
  switch (level) {
    case "veryhigh":
      return {
        ldlMmol: 1.4,
        ldlRule: "Giảm ≥50% so với LDL-C ban đầu",
        nonHdlMmol: 2.2,
        apoB: 65,
      };
    case "high":
      return {
        ldlMmol: 1.8,
        ldlRule: "Giảm ≥50% so với LDL-C ban đầu",
        nonHdlMmol: 2.6,
        apoB: 80,
      };
    case "moderate":
      return {
        ldlMmol: 2.6,
        ldlRule: "Cân nhắc theo bối cảnh lâm sàng",
        nonHdlMmol: 3.4,
        apoB: 100,
      };
    case "low":
      return {
        ldlMmol: 3.0,
        ldlRule: "Cân nhắc theo bối cảnh lâm sàng",
        // low risk: guideline thường tập trung LDL; mục tiêu phụ có thể ẩn
      };
  }
}

export default function RiskTargetsCard({
  riskLevel,
  riskPercent,
  modelName,
  note,
  showSecondary = true,
}: Props) {
  const targets = getTargets(riskLevel);

  const ldlMg = mmolToMgdlLDL(targets.ldlMmol);
  const nonHdlMg =
    targets.nonHdlMmol !== undefined ? mmolToMgdlNonHDL(targets.nonHdlMmol) : undefined;

  const p = formatPercent(riskPercent);

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 16,
        border: "1px solid var(--line)",
        background: "white",
        boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            Kết quả phân tầng nguy cơ {modelName ? `(${modelName})` : ""}
          </div>
          {p && (
            <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700 }}>
              Nguy cơ ước tính: <span style={{ color: "var(--text)" }}>{p}</span>
            </div>
          )}
        </div>

        <span className={riskBadgeClass(riskLevel)} style={{ fontSize: 13 }}>
          <span className="badge__dot" />
          {riskLabelVi(riskLevel)}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--line)", margin: "12px 0" }} />

      {/* Targets grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {/* LDL */}
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: 12,
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>Mục tiêu LDL-C</div>
            <div style={{ fontWeight: 900, color: "var(--primary)" }}>
              &lt; {targets.ldlMmol.toFixed(1)} mmol/L
            </div>
          </div>

          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700 }}>
            Tương đương: &lt; {ldlMg} mg/dL
          </div>

          <div style={{ marginTop: 8, color: "var(--muted)" }}>
            {targets.ldlRule}
          </div>
        </div>

        {/* Secondary goals */}
        {showSecondary && (targets.nonHdlMmol !== undefined || targets.apoB !== undefined) && (
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 12,
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Mục tiêu phụ</div>

            {targets.nonHdlMmol !== undefined && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 12,
                  background: "white",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ fontWeight: 800 }}>non-HDL-C</div>
                <div style={{ fontWeight: 900 }}>
                  &lt; {targets.nonHdlMmol.toFixed(1)} mmol/L{" "}
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                    (≈ {nonHdlMg} mg/dL)
                  </span>
                </div>
              </div>
            )}

            {targets.apoB !== undefined && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 12,
                  background: "white",
                  border: "1px solid var(--line)",
                  marginTop: 10,
                }}
              >
                <div style={{ fontWeight: 800 }}>ApoB</div>
                <div style={{ fontWeight: 900 }}>
                  &lt; {targets.apoB} mg/dL
                </div>
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              Gợi ý: mục tiêu phụ hữu ích khi TG cao / đái tháo đường / béo phì.
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      {note && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            border: "1px solid var(--line)",
            background: "rgba(29,78,216,0.06)",
            color: "var(--text)",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6, color: "var(--primary)" }}>
            Ghi chú
          </div>
          <div style={{ color: "var(--muted)" }}>{note}</div>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
        Lưu ý: Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
      </div>
    </div>
  );
}
