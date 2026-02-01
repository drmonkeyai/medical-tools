// src/pages/DoseAdjust.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { drugs, type Drug, type HepaticClass } from "../data/doseAdjust";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function pickRenalRule(drug: Drug, egfr: number) {
  const rules = drug.renalRules ?? [];
  for (const r of rules) {
    const minOk = r.egfrMin == null || egfr >= r.egfrMin;
    const maxOk = r.egfrMax == null || egfr < r.egfrMax;
    if (minOk && maxOk) return r.recommendation;
  }
  return rules.length ? "Không tìm thấy ngưỡng phù hợp trong dữ liệu." : null;
}

function pickHepaticRule(drug: Drug, child: HepaticClass) {
  const rules = drug.hepaticRules ?? [];
  const exact = rules.find((r) => r.childPugh === child);
  if (exact) return exact.recommendation;
  if (rules.length) return "Không có khuyến cáo gan cho mức này trong dữ liệu.";
  return null;
}

export default function DoseAdjust() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [egfr, setEgfr] = useState<number>(60);
  const [child, setChild] = useState<HepaticClass>("None");
  const [selectedId, setSelectedId] = useState<string>(drugs[0]?.id ?? "");

  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return drugs;
    return drugs.filter((d) => {
      const hay = normalize([d.name, ...(d.aliases ?? []), d.group ?? ""].join(" "));
      return hay.includes(nq);
    });
  }, [q]);

  const selected = useMemo(
    () => drugs.find((d) => d.id === selectedId) ?? filtered[0] ?? null,
    [selectedId, filtered]
  );

  const renalText = useMemo(() => (selected ? pickRenalRule(selected, egfr) : null), [selected, egfr]);
  const hepaticText = useMemo(() => (selected ? pickHepaticRule(selected, child) : null), [selected, child]);

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Điều chỉnh liều thuốc</h2>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>
              Gợi ý điều chỉnh theo eGFR (thận) và Child-Pugh (gan) cho các thuốc thường dùng.
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
          >
            ← Trở về trang trước
          </button>
        </div>

        {/* Bộ lọc */}
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <Field label="Tìm thuốc">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ví dụ: metformin, amox, paracetamol..."
              style={inputStyle}
            />
          </Field>

          <Field label="eGFR (mL/min/1.73m²)">
            <input type="number" value={egfr} onChange={(e) => setEgfr(Number(e.target.value))} style={inputStyle} />
          </Field>

          <Field label="Chức năng gan (Child-Pugh)">
            <select value={child} onChange={(e) => setChild(e.target.value as HepaticClass)} style={inputStyle}>
              <option value="None">Không/không rõ</option>
              <option value="Child-Pugh A">Child-Pugh A</option>
              <option value="Child-Pugh B">Child-Pugh B</option>
              <option value="Child-Pugh C">Child-Pugh C</option>
            </select>
          </Field>
        </div>

        {/* Danh sách + kết quả */}
        <div style={{ marginTop: 14, display: "grid", gap: 14, gridTemplateColumns: "minmax(260px, 360px) 1fr" }}>
          {/* List */}
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "white",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 12, borderBottom: "1px solid var(--line)", fontWeight: 900 }}>
              Danh sách thuốc ({filtered.length})
            </div>

            <div style={{ maxHeight: 420, overflow: "auto" }}>
              {filtered.map((d) => {
                const active = d.id === selected?.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 12,
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: active ? "rgba(29,78,216,0.08)" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{d.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      {d.group ?? "—"} {d.aliases?.length ? `• ${d.aliases[0]}` : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail */}
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "white",
              padding: 14,
            }}
          >
            {!selected ? (
              <div style={{ color: "var(--muted)" }}>Không có thuốc phù hợp.</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 1000 }}>{selected.name}</div>
                    <div style={{ marginTop: 6, color: "var(--muted)" }}>{selected.group ?? "—"}</div>
                  </div>
                </div>

                {selected.typicalDose ? (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid var(--line)", background: "rgba(0,0,0,0.02)" }}>
                    <div style={{ fontWeight: 900 }}>Liều thường dùng (tham khảo)</div>
                    <div style={{ marginTop: 6, color: "var(--muted)" }}>{selected.typicalDose}</div>
                  </div>
                ) : null}

                <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                  <ResultBox title="Gợi ý theo thận (eGFR)" text={renalText ?? "Thuốc này chưa có dữ liệu chỉnh liều theo thận."} />
                  <ResultBox title="Gợi ý theo gan (Child-Pugh)" text={hepaticText ?? "Thuốc này chưa có dữ liệu chỉnh liều theo gan."} />
                </div>

                {selected.notes ? (
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
                    {selected.notes}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
          Lưu ý: Gợi ý hỗ trợ tham khảo; luôn đối chiếu khuyến cáo chính thức tại cơ sở, tình trạng lâm sàng, tương tác và liều theo chỉ định.
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{props.label}</div>
      {props.children}
    </div>
  );
}

function ResultBox(props: { title: string; text: string }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12, background: "rgba(0,0,0,0.02)" }}>
      <div style={{ fontWeight: 900 }}>{props.title}</div>
      <div style={{ marginTop: 6, color: "var(--muted)" }}>{props.text}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  outline: "none",
  background: "white",
};
