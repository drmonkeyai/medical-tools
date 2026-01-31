// src/calculators/SCORE2OP.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calcSCORE2OP, type RiskRegion, type Sex, clamp } from "./score2Core";

import RiskTargetsCard from "../components/RiskTargetsCard";
import { riskLevelFromGroup } from "./riskBadge";

export default function SCORE2OP() {
  const navigate = useNavigate();

  const [region, setRegion] = useState<RiskRegion>("High"); // mặc định nguy cơ cao
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(75);
  const [smoker, setSmoker] = useState<0 | 1>(0);
  const [sbp, setSbp] = useState<number>(150);
  const [tc, setTc] = useState<number>(5.5);
  const [hdl, setHdl] = useState<number>(1.4);

  const result = useMemo(() => {
    const a = clamp(age, 70, 100);
    const s = clamp(sbp, 80, 250);
    const t = clamp(tc, 2, 15);
    const h = clamp(hdl, 0.2, 5);

    return calcSCORE2OP({
      region,
      age: a,
      sex,
      smoker,
      sbp: s,
      totalChol: t,
      hdl: h,
      diabetes: 0,
    });
  }, [region, sex, age, smoker, sbp, tc, hdl]);

  const level = riskLevelFromGroup(result.riskGroup);

  return (
    <div className="page">
      <div className="card">
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
            <h2 style={{ margin: 0 }}>SCORE2-OP</h2>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>
              Ước tính nguy cơ tim mạch 5–10 năm cho người ≥70 tuổi • mặc định: nguy cơ cao
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

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <Field label="Risk region">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RiskRegion)}
              style={inputStyle}
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very high">Very high</option>
            </select>
          </Field>

          <Field label="Giới">
            <select value={sex} onChange={(e) => setSex(e.target.value as Sex)} style={inputStyle}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </Field>

          <Field label="Tuổi (≥70)">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>

          <Field label="Hút thuốc">
            <select
              value={smoker}
              onChange={(e) => setSmoker(Number(e.target.value) as 0 | 1)}
              style={inputStyle}
            >
              <option value={0}>Không</option>
              <option value={1}>Có</option>
            </select>
          </Field>

          <Field label="HA tâm thu (mmHg)">
            <input
              type="number"
              value={sbp}
              onChange={(e) => setSbp(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>

          <Field label="Cholesterol toàn phần (mmol/L)">
            <input
              type="number"
              step="0.1"
              value={tc}
              onChange={(e) => setTc(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>

          <Field label="HDL (mmol/L)">
            <input
              type="number"
              step="0.1"
              value={hdl}
              onChange={(e) => setHdl(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Kết quả + mục tiêu lipid */}
        {level && (
          <RiskTargetsCard
            modelName="SCORE2-OP"
            riskLevel={level}
            riskPercent={result.riskPercent}
            showSecondary={true}
            note="Mục tiêu LDL-C phụ thuộc nhóm nguy cơ. Với nguy cơ cao/rất cao, ưu tiên đạt ngưỡng LDL-C và giảm ≥50% so với ban đầu."
          />
        )}

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
