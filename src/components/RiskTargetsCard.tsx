// src/components/RiskTargetsCard.tsx

import { useMemo, useState } from "react";
import type { RiskLevel } from "../calculators/riskBadge";
import { riskBadgeClass, riskLabelVi } from "../calculators/riskBadge";

type Props = {
  riskLevel: RiskLevel;
  riskPercent?: number;
  modelName?: string;
  note?: string;
  showSecondary?: boolean;

  /** Nếu bệnh nhân thuộc secondary prevention (ASCVD), Table 4 dùng hàng "Very high: secondary prevention" */
  isSecondaryPrevention?: boolean;
};

function formatPercent(x?: number) {
  if (x === undefined || x === null || !Number.isFinite(x)) return null;
  return `${x.toFixed(1)}%`;
}

function mmolToMgdl(mmol: number) {
  return Math.round(mmol * 38.67);
}

function parseMmolInput(raw: string): number | undefined {
  const s = raw.replace(",", ".").trim();
  if (!s) return undefined;
  const v = Number(s);
  if (!Number.isFinite(v)) return undefined;
  return v;
}

type Targets = {
  ldlMmol: number;
  ldlClass: string; // Class IIb / IIa / I / Ia...
  need50?: boolean; // ≥50% reduction from baseline
  nonHdlMmol?: number;
  apoB?: number; // mg/dL
};

function getTargets(level: RiskLevel): Targets {
  // LDL goals theo ESC/EAS (không đổi vs 2019; Figure 1 của bản 2025 minh hoạ)
  switch (level) {
    case "low":
      return { ldlMmol: 3.0, ldlClass: "Class IIb" };
    case "moderate":
      return { ldlMmol: 2.6, ldlClass: "Class IIa", nonHdlMmol: 3.4, apoB: 100 };
    case "high":
      return { ldlMmol: 1.8, ldlClass: "Class I", need50: true, nonHdlMmol: 2.6, apoB: 80 };
    case "very-high":
      return { ldlMmol: 1.4, ldlClass: "Class Ia", need50: true, nonHdlMmol: 2.2, apoB: 65 };
    case "extreme":
      // “Extreme risk” trong Figure 1 (tình huống rất đặc biệt, thường secondary prevention)
      return { ldlMmol: 1.0, ldlClass: "Class IIb", need50: true, nonHdlMmol: 1.8, apoB: 55 };
  }
}

type Intervention = {
  tone: "green" | "yellow" | "red" | "gray";
  title: string;
  detail: string;
};

function ldlBand(ldl: number) {
  if (ldl < 1.4) return "lt1.4";
  if (ldl < 1.8) return "1.4-1.8";
  if (ldl < 2.6) return "1.8-2.6";
  if (ldl < 3.0) return "2.6-3.0";
  if (ldl < 4.9) return "3.0-4.9";
  return "gte4.9";
}

/**
 * Table 4 – ESC/EAS 2025 Focused Update:
 * - phụ thuộc Total CV risk + untreated LDL-C
 * - hàng “Very high: secondary prevention” = đỏ toàn bộ
 */
function interventionFromTable4(
  risk: RiskLevel,
  untreatedLDL: number,
  isSecondaryPrevention: boolean
): Intervention {
  const band = ldlBand(untreatedLDL);

  const lifestyle: Intervention = {
    tone: "green",
    title: "Lifestyle advice",
    detail: "Tư vấn lối sống",
  };

  const considerDrug: Intervention = {
    tone: "yellow",
    title: "Lifestyle modification + cân nhắc thuốc",
    detail: "Cân nhắc thêm thuốc nếu không kiểm soát được bằng lối sống",
  };

  const drug: Intervention = {
    tone: "red",
    title: "Lifestyle modification + điều trị thuốc",
    detail: "Khuyến nghị can thiệp thuốc đồng thời với lối sống",
  };

  // Very high: secondary prevention -> đỏ toàn bộ
  if (isSecondaryPrevention && (risk === "very-high" || risk === "extreme")) {
    return drug;
  }

  // Extreme risk -> coi như secondary (đỏ)
  if (risk === "extreme") return drug;

  if (risk === "low") {
    if (band === "gte4.9") {
      return {
        tone: "gray",
        title: "N/A (LDL-C ≥4.9 mmol/L)",
        detail: "LDL-C ≥4.9 mmol/L thường được xem tối thiểu là nguy cơ cao → cần phân tầng lại",
      };
    }
    if (band === "3.0-4.9") return considerDrug;
    return lifestyle; // <3.0
  }

  if (risk === "moderate") {
    if (band === "gte4.9") {
      return {
        tone: "gray",
        title: "N/A (LDL-C ≥4.9 mmol/L)",
        detail: "LDL-C ≥4.9 mmol/L thường được xem tối thiểu là nguy cơ cao → cần phân tầng lại",
      };
    }
    if (band === "2.6-3.0" || band === "3.0-4.9") return considerDrug;
    return lifestyle; // <2.6
  }

  if (risk === "high") {
    if (band === "lt1.4" || band === "1.4-1.8") return lifestyle;
    if (band === "1.8-2.6") return considerDrug;
    return drug; // >=2.6
  }

  // very-high primary prevention
  if (risk === "very-high") {
    if (band === "lt1.4" || band === "1.4-1.8") return considerDrug;
    return drug; // >=1.8
  }

  return lifestyle;
}

export default function RiskTargetsCard({
  riskLevel,
  riskPercent,
  modelName,
  note,
  showSecondary = true,
  isSecondaryPrevention = false,
}: Props) {
  const targets = useMemo(() => getTargets(riskLevel), [riskLevel]);
  const p = formatPercent(riskPercent);

  // input LDL chưa điều trị (optional)
  const [untreatedRaw, setUntreatedRaw] = useState("");
  const untreatedLDL = useMemo(() => parseMmolInput(untreatedRaw), [untreatedRaw]);

  const intervention = useMemo(() => {
    if (untreatedLDL === undefined) return null;
    return interventionFromTable4(riskLevel, untreatedLDL, isSecondaryPrevention);
  }, [untreatedLDL, riskLevel, isSecondaryPrevention]);

  const riskFrame =
    riskLevel === "high"
      ? { border: "1px solid rgba(245, 158, 11, 0.35)", background: "rgba(245, 158, 11, 0.06)" }
      : riskLevel === "very-high" || riskLevel === "extreme"
      ? { border: "1px solid rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.06)" }
      : { border: "1px solid var(--line)", background: "white" };

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
        ...riskFrame,
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
            <div style={{ fontWeight: 900 }}>
              Mục tiêu LDL-C <span style={{ fontWeight: 800, color: "var(--muted)" }}>({targets.ldlClass})</span>
            </div>
            <div style={{ fontWeight: 900, color: "var(--primary)" }}>
              &lt; {targets.ldlMmol.toFixed(1)} mmol/L
            </div>
          </div>

          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700 }}>
            Tương đương: &lt; {mmolToMgdl(targets.ldlMmol)} mg/dL
          </div>

          {targets.need50 && (
            <div style={{ marginTop: 8, fontWeight: 800 }}>
              Yêu cầu thêm: <span style={{ color: "var(--text)" }}>giảm ≥50% so với LDL-C ban đầu</span>
            </div>
          )}
        </div>

        {/* Secondary goals (ESC/EAS đặt cho moderate/high/very-high; không có mục tiêu riêng cho low) */}
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
                    (≈ {mmolToMgdl(targets.nonHdlMmol)} mg/dL)
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
                <div style={{ fontWeight: 900 }}>&lt; {targets.apoB} mg/dL</div>
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              Mục tiêu phụ hữu ích khi TG cao / ĐTĐ / béo phì (khi LDL-C có thể “đánh giá thấp” nguy cơ atherogenic).
            </div>
          </div>
        )}
      </div>

      {/* Table 4 – Intervention strategy (optional input) */}
      <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid var(--line)", background: "white" }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý can thiệp theo LDL-C chưa điều trị (Table 4)</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontWeight: 800, color: "var(--muted)" }}>LDL-C chưa điều trị (mmol/L):</label>
          <input
            value={untreatedRaw}
            onChange={(e) => setUntreatedRaw(e.target.value)}
            placeholder="Ví dụ 3.2"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              minWidth: 140,
            }}
            inputMode="decimal"
          />
          {untreatedLDL !== undefined && (
            <span style={{ color: "var(--muted)", fontWeight: 800 }}>
              ≈ {mmolToMgdl(untreatedLDL)} mg/dL
            </span>
          )}
        </div>

        {intervention && (
          <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span className={`pill pill--${intervention.tone}`}>{intervention.title}</span>
            <div style={{ color: "var(--muted)", fontWeight: 700 }}>{intervention.detail}</div>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
          Lưu ý: Đây là gợi ý theo bảng hướng dẫn, vẫn cần cá thể hoá theo bối cảnh lâm sàng.
        </div>
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
          <div style={{ fontWeight: 900, marginBottom: 6, color: "var(--primary)" }}>Ghi chú</div>
          <div style={{ color: "var(--muted)" }}>{note}</div>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
        Lưu ý: Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
      </div>
    </div>
  );
}
