// src/calculators/BMI.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type BmiClass =
  | { key: "under"; label: "Thiếu cân"; detail: "BMI < 18.5" }
  | { key: "normal"; label: "Bình thường"; detail: "BMI 18.5–22.9" }
  | { key: "over"; label: "Thừa cân (nguy cơ)"; detail: "BMI 23.0–24.9" }
  | { key: "obese1"; label: "Béo phì độ I"; detail: "BMI 25.0–29.9" }
  | { key: "obese2"; label: "Béo phì độ II"; detail: "BMI ≥ 30.0" };

function classifyBmiAsian(bmi: number): BmiClass {
  if (bmi < 18.5) return { key: "under", label: "Thiếu cân", detail: "BMI < 18.5" };
  if (bmi < 23) return { key: "normal", label: "Bình thường", detail: "BMI 18.5–22.9" };
  if (bmi < 25) return { key: "over", label: "Thừa cân (nguy cơ)", detail: "BMI 23.0–24.9" };
  if (bmi < 30) return { key: "obese1", label: "Béo phì độ I", detail: "BMI 25.0–29.9" };
  return { key: "obese2", label: "Béo phì độ II", detail: "BMI ≥ 30.0" };
}

function badgeStyle(kind: BmiClass["key"]): React.CSSProperties {
  // Đồng bộ theme: dùng border var(--line), bo góc, nền nhẹ
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid var(--line)",
    fontWeight: 900,
    background: "rgba(0,0,0,0.03)",
  };

  // Không set màu rực, chỉ nhấn nhẹ theo mức độ
  if (kind === "normal") return { ...base, background: "rgba(29,78,216,0.08)" }; // primary nhẹ
  if (kind === "under") return { ...base, background: "rgba(100,116,139,0.12)" }; // muted nhẹ
  if (kind === "over") return { ...base, background: "rgba(245,158,11,0.14)" }; // amber nhẹ
  if (kind === "obese1") return { ...base, background: "rgba(239,68,68,0.12)" }; // red nhẹ
  return { ...base, background: "rgba(185,28,28,0.12)" }; // dark red nhẹ
}

export default function BMI() {
  const navigate = useNavigate();

  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(60);

  const result = useMemo(() => {
    const h = Number(heightCm);
    const w = Number(weightKg);

    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
      return { bmi: NaN, cls: null as BmiClass | null };
    }

    const hm = h / 100;
    const bmi = w / (hm * hm);
    const cls = classifyBmiAsian(bmi);
    return { bmi, cls };
  }, [heightCm, weightKg]);

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>BMI (Châu Á)</h2>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>
              Tính BMI và phân loại theo ngưỡng người Châu Á (18.5 / 23 / 25 / 30)
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
            title="Trở về trang trước"
          >
            ← Trở về trang trước
          </button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <Field label="Chiều cao (cm)">
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              style={inputStyle}
              min={50}
              max={250}
            />
          </Field>

          <Field label="Cân nặng (kg)">
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              style={inputStyle}
              min={1}
              max={400}
            />
          </Field>
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 14, border: "1px solid var(--line)", background: "rgba(0,0,0,0.02)" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>
            BMI: {Number.isFinite(result.bmi) ? result.bmi.toFixed(1) : "—"}
          </div>

          <div style={{ marginTop: 10 }}>
            {result.cls ? (
              <span style={badgeStyle(result.cls.key)}>
                {result.cls.label}
                <span style={{ fontWeight: 700, color: "var(--muted)" }}>• {result.cls.detail}</span>
              </span>
            ) : (
              <span style={{ color: "var(--muted)" }}>Nhập chiều cao/cân nặng hợp lệ để xem phân loại.</span>
            )}
          </div>

          <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>
            Ngưỡng phân loại Châu Á: &lt;18.5 thiếu cân • 18.5–22.9 bình thường • 23.0–24.9 thừa cân (nguy cơ) • 25.0–29.9 béo phì I • ≥30 béo phì II
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
          Lưu ý: Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  outline: "none",
  background: "white",
};
