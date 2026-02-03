// src/pages/CaseSummary.tsx
import { Link, useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";
import { useMemo, useState } from "react";

type ToolResult = {
  toolId: string;
  createdAt: number;
  data: any;
};

function fmtTime(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${hh}:${mm} • ${dd}/${mo}/${yy}`;
}

function safeStringify(obj: any) {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    obj,
    (_k, v) => {
      if (typeof v === "bigint") return v.toString();
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return "[Circular]";
        seen.add(v);
      }
      return v;
    },
    2
  );
}

function prettyToolName(toolId: string) {
  const map: Record<string, string> = {
    egfr: "eGFR – CKD-EPI",
    isi: "ISI – Mất ngủ",
    score2: "SCORE2",
    "score2-op": "SCORE2-OP",
    "score2-asian": "SCORE2-ASIAN",
    "score2-diabetes": "SCORE2-DIABETES",
    "family-apgar": "Family APGAR",
    screem: "SCREEM",
    bmi: "BMI (Châu Á)",
    qsofa: "qSOFA",
    curb65: "CURB-65",
    "cha2ds2-vasc": "CHA₂DS₂-VASc",
    "has-bled": "HAS-BLED",
    "child-pugh": "Child–Pugh",
  };
  return map[toolId] ?? toolId;
}

function formulaLabelEgfr(formula?: string) {
  if (formula === "ckd-epi-2021") return "CKD-EPI 2021";
  if (formula === "ckd-epi-2009") return "CKD-EPI 2009";
  if (formula === "mdrd-175") return "MDRD 175";
  if (formula === "cockcroft-gault") return "Cockcroft–Gault (CrCl)";
  if (formula === "schwartz-2009") return "Schwartz 2009";
  return "—";
}

function toNumber(v: any): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// ✅ Dựng report khi thiếu (đặc biệt cho dữ liệu cũ egfr)
function ensureReport(toolId: string, data: any) {
  if (data?.report?.lines?.length) return data;

  // chỉ dựng cho eGFR trước
  if (toolId !== "egfr") return data;

  const inputs = data?.inputs ?? {};
  const outputs = data?.outputs ?? {};

  const formula = inputs.formula as string | undefined;
  const fLabel = formulaLabelEgfr(formula);

  const value = toNumber(outputs.value) ?? toNumber(outputs?.valueDisplay) ?? null;
  const unit = (outputs.unit as string | undefined) ?? "mL/phút/1.73m²";
  const stage = (outputs.stage as string | null | undefined) ?? null;

  // creatinin
  let scrUmol: number | null = null;
  let scrMg: number | null = null;

  const scrUnit = inputs.scrUnit as string | undefined;
  const scrValue = toNumber(inputs.scrValue);

  if (scrUnit === "umol" && scrValue !== null) {
    scrUmol = scrValue;
    scrMg = scrValue / 88.4;
  } else if (scrUnit === "mgdl" && scrValue !== null) {
    scrMg = scrValue;
    scrUmol = scrValue * 88.4;
  } else {
    // fallback từ scrMgDl nếu có
    const scrMgDl = toNumber(inputs.scrMgDl);
    if (scrMgDl !== null) {
      scrMg = scrMgDl;
      scrUmol = scrMgDl * 88.4;
    }
  }

  const lines = [
    {
      label: "eGFR",
      value: value !== null ? `${round1(value)} ${unit}` : `— ${unit}`,
    },
    ...(stage ? [{ label: "G-stage", value: stage }] : []),
    ...(scrUmol !== null && scrMg !== null
      ? [
          {
            label: "Creatinin",
            value: `${Math.round(scrUmol)} µmol/L (${round1(scrMg)} mg/dL)`,
          },
        ]
      : []),
    { label: "Công thức", value: fLabel },
  ];

  const summary =
    value !== null
      ? `eGFR ${round1(value)} ${unit}${stage ? ` • ${stage}` : ""}`
      : "eGFR —";

  return {
    ...data,
    summary: data?.summary ?? summary,
    report: {
      title: `eGFR – CKD-EPI (${fLabel})`,
      lines,
      note:
        "Gợi ý: CKD cần kết hợp lâm sàng và thời gian ≥3 tháng (± albumin niệu). Cockcroft–Gault dùng chỉnh liều thuốc.",
    },
  };
}

export default function CaseSummary() {
  const navigate = useNavigate();
  const { activeCase } = useCases();
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (!activeCase) {
    return (
      <div className="page">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Tổng hợp ca</h2>
          <div style={{ color: "var(--muted)" }}>
            Chưa có ca nào. Hãy bấm “＋ Tạo ca mới” ở góc trên.
          </div>

          <div style={{ marginTop: 14 }}>
            <Link
              to="/tools"
              style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800 }}
            >
              ← Đi tới danh sách công cụ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resultsRecord = (activeCase.results ?? {}) as Record<string, ToolResult[]>;
  const entries = useMemo(
    () =>
      Object.entries(resultsRecord)
        .filter(([, list]) => Array.isArray(list) && list.length > 0)
        // sort tool blocks by most recent result time desc
        .sort((a, b) => {
          const at = a[1]?.[0]?.createdAt ?? 0;
          const bt = b[1]?.[0]?.createdAt ?? 0;
          return bt - at;
        }),
    [resultsRecord]
  );

  const total = entries.reduce((acc, [, list]) => acc + list.length, 0);

  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>Tổng hợp ca</h2>
            <div style={{ color: "var(--muted)" }}>
              {activeCase.patient.name} • {activeCase.patient.yob} • {activeCase.patient.sex} •{" "}
              {total} lần lưu
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
            type="button"
          >
            ← Trở về trang trước
          </button>
        </div>

        {total === 0 ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(0,0,0,0.02)",
              color: "var(--muted)",
            }}
          >
            Chưa có dữ liệu. Vào công cụ (vd: eGFR) và bấm <b>“Lưu vào ca”</b>.
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {entries.map(([toolId, list]) => (
              <div
                key={toolId}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "white",
                }}
              >
                {/* Tool header */}
                <div
                  style={{
                    padding: "10px 12px",
                    fontWeight: 900,
                    background:
                      "linear-gradient(180deg, rgba(37,99,235,0.06), rgba(0,0,0,0.02))",
                    borderBottom: "1px solid var(--line)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 16 }}>{prettyToolName(toolId)}</div>
                  </div>

                  <div style={{ color: "var(--muted)", fontWeight: 800 }}>{list.length} lần</div>
                </div>

                <div style={{ padding: 12, display: "grid", gap: 10 }}>
                  {list.map((rawItem, idx) => {
                    const createdAt =
                      typeof rawItem.createdAt === "number" ? rawItem.createdAt : Date.now();

                    const item = {
                      ...rawItem,
                      data: ensureReport(toolId, rawItem.data || {}),
                    };

                    const d = item.data || {};
                    const report = d.report;
                    const key = `${toolId}-${idx}`;
                    const isOpen = openKey === key;

                    return (
                      <div
                        key={key}
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: 14,
                          padding: 12,
                          background: "white",
                        }}
                      >
                        {/* Result header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 14 }}>
                              {report?.title ?? `Kết quả #${list.length - idx}`}
                            </div>
                            {d.summary && (
                              <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 800 }}>
                                {d.summary}
                              </div>
                            )}
                          </div>

                          <div style={{ color: "var(--muted)", fontWeight: 800 }}>
                            {fmtTime(createdAt)}
                          </div>
                        </div>

                        {/* ✅ Clinical report block */}
                        {report?.lines?.length ? (
                          <div style={{ marginTop: 12 }}>
                            <div
                              style={{
                                border: "1px solid var(--line)",
                                borderRadius: 14,
                                overflow: "hidden",
                                background: "white",
                              }}
                            >
                              {report.lines.map((ln: any, i: number) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    padding: "10px 12px",
                                    background: i % 2 === 0 ? "rgba(0,0,0,0.015)" : "white",
                                  }}
                                >
                                  <div style={{ color: "var(--muted)", fontWeight: 900 }}>
                                    {ln.label}
                                  </div>
                                  <div style={{ fontWeight: 900 }}>{ln.value}</div>
                                </div>
                              ))}
                            </div>

                            {report.note && (
                              <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                                {report.note}
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Actions */}
                        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            onClick={() => setOpenKey(isOpen ? null : key)}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 12,
                              border: "1px solid var(--line)",
                              background: "white",
                              cursor: "pointer",
                              fontWeight: 900,
                            }}
                            type="button"
                          >
                            {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
                          </button>
                        </div>

                        {/* Details (collapsed by default) */}
                        {isOpen && (
                          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                            {d.inputs && (
                              <div>
                                <div style={{ fontWeight: 900, marginBottom: 6 }}>Inputs</div>
                                <pre
                                  style={{
                                    margin: 0,
                                    padding: 10,
                                    borderRadius: 12,
                                    border: "1px solid var(--line)",
                                    background: "rgba(0,0,0,0.02)",
                                    overflowX: "auto",
                                    fontSize: 12,
                                  }}
                                >
                                  {safeStringify(d.inputs)}
                                </pre>
                              </div>
                            )}

                            {d.outputs && (
                              <div>
                                <div style={{ fontWeight: 900, marginBottom: 6 }}>Outputs</div>
                                <pre
                                  style={{
                                    margin: 0,
                                    padding: 10,
                                    borderRadius: 12,
                                    border: "1px solid var(--line)",
                                    background: "rgba(0,0,0,0.02)",
                                    overflowX: "auto",
                                    fontSize: 12,
                                  }}
                                >
                                  {safeStringify(d.outputs)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <Link to="/tools" style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800 }}>
            ← Quay lại danh sách công cụ
          </Link>
        </div>
      </div>
    </div>
  );
}
