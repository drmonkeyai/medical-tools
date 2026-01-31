import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RiskTargetsCard from "../components/RiskTargetsCard";
import type { RiskLevel } from "./riskBadge";
import { calcSCORE2DIABETES, type RiskRegion, type Sex, clamp } from "./score2Core";

type HbUnit = "mmol/mol" | "%";

function riskLevelFromPercent_5_10_20(p: number): RiskLevel {
  // SCORE2-Diabetes: <5 low; 5–<10 moderate; 10–<20 high; ≥20 very-high
  if (p < 5) return "low";
  if (p < 10) return "moderate";
  if (p < 20) return "high";
  return "very-high";
}

// NGSP% -> IFCC mmol/mol
function hba1cPctToMmolMol(pct: number) {
  return (pct - 2.15) * 10.929;
}

export default function SCORE2DIABETES() {
  const navigate = useNavigate();

  const [region, setRegion] = useState<RiskRegion>("High");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(60);
  const [smoker, setSmoker] = useState<0 | 1>(0);
  const [sbp, setSbp] = useState<number>(140);
  const [totalChol, setTotalChol] = useState<number>(5.5);
  const [hdl, setHdl] = useState<number>(1.3);

  const [diabetesAge, setDiabetesAge] = useState<number>(52);

  const [hbUnit, setHbUnit] = useState<HbUnit>("mmol/mol");
  const [hba1c, setHba1c] = useState<number>(58); // IFCC default
  const [egfr, setEgfr] = useState<number>(85);

  const safe = useMemo(() => {
    const a = clamp(Math.round(age), 40, 89);
    const s = clamp(Math.round(sbp), 90, 220);
    const tc = clamp(totalChol, 2.0, 10.0);
    const h = clamp(hdl, 0.5, 3.0);

    // tuổi chẩn đoán ĐTĐ phải <= tuổi hiện tại
    const dmAge = clamp(Math.round(diabetesAge), 10, a);

    // eGFR
    const eg = clamp(egfr, 10, 150);

    // HbA1c theo IFCC (mmol/mol)
    let hbMmolMol = hbUnit === "mmol/mol" ? hba1c : hba1cPctToMmolMol(hba1c);
    hbMmolMol = clamp(hbMmolMol, 20, 140);

    return { a, s, tc, h, dmAge, hbMmolMol, eg };
  }, [age, sbp, totalChol, hdl, diabetesAge, hbUnit, hba1c, egfr]);

  const result = useMemo(() => {
    try {
      return calcSCORE2DIABETES({
        region,
        age: safe.a,
        sex,
        smoker,
        sbp: safe.s,
        totalChol: safe.tc,
        hdl: safe.h,
        diabetes: 1,
        diabetesAge: safe.dmAge,
        hba1c: safe.hbMmolMol,
        egfr: safe.eg,
      });
    } catch {
      return { riskPercent: NaN, riskGroup: "N/A" as const };
    }
  }, [region, sex, smoker, safe]);

  const riskPercent = result?.riskPercent;

  const level: RiskLevel | undefined =
    typeof riskPercent === "number" && Number.isFinite(riskPercent)
      ? riskLevelFromPercent_5_10_20(riskPercent)
      : undefined;

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">SCORE2-DIABETES</h1>
            <div className="calcSub">
              Ước tính nguy cơ tim mạch 10 năm ở người đái tháo đường type 2 • phân tầng theo mốc 5/10/20%
            </div>
          </div>

          <button className="btn" onClick={() => navigate(-1)} title="Trở về trang trước">
            ← Trở về trang trước
          </button>
        </div>

        <div className="formGrid">
          <div className="field field--wide">
            <label className="label">Risk region</label>
            <select className="select" value={region} onChange={(e) => setRegion(e.target.value as RiskRegion)}>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very high">Very high</option>
            </select>
          </div>

          <div className="field field--wide">
            <label className="label">Giới</label>
            <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="field field--wide">
            <label className="label">Tuổi</label>
            <input className="input" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min={40} max={89} />
            <div className="help">Tự clamp về 40–89.</div>
          </div>

          <div className="field field--wide">
            <label className="label">Hút thuốc</label>
            <select className="select" value={smoker} onChange={(e) => setSmoker(Number(e.target.value) as 0 | 1)}>
              <option value={0}>Không</option>
              <option value={1}>Có</option>
            </select>
          </div>

          <div className="field field--wide">
            <label className="label">HA tâm thu (mmHg)</label>
            <input className="input" type="number" value={sbp} onChange={(e) => setSbp(Number(e.target.value))} min={90} max={220} />
          </div>

          <div className="field field--wide">
            <label className="label">Cholesterol toàn phần (mmol/L)</label>
            <input className="input" type="number" step="0.1" value={totalChol} onChange={(e) => setTotalChol(Number(e.target.value))} min={2} max={10} />
          </div>

          <div className="field field--wide">
            <label className="label">HDL (mmol/L)</label>
            <input className="input" type="number" step="0.1" value={hdl} onChange={(e) => setHdl(Number(e.target.value))} min={0.5} max={3} />
          </div>

          <div className="field field--wide">
            <label className="label">Tuổi chẩn đoán ĐTĐ</label>
            <input
              className="input"
              type="number"
              value={diabetesAge}
              onChange={(e) => setDiabetesAge(Number(e.target.value))}
              min={10}
              max={age}
            />
          </div>

          <div className="field field--wide">
            <label className="label">HbA1c</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input className="input" style={{ flex: 1 }} type="number" step="0.1" value={hba1c} onChange={(e) => setHba1c(Number(e.target.value))} />
              <select className="select" style={{ width: 140 }} value={hbUnit} onChange={(e) => setHbUnit(e.target.value as HbUnit)}>
                <option value="mmol/mol">mmol/mol</option>
                <option value="%">%</option>
              </select>
            </div>
            <div className="help">Nếu nhập %, hệ thống tự đổi sang IFCC (mmol/mol) cho thuật toán.</div>
          </div>

          <div className="field field--wide">
            <label className="label">eGFR (mL/min/1.73m²)</label>
            <input className="input" type="number" value={egfr} onChange={(e) => setEgfr(Number(e.target.value))} min={10} max={150} />
          </div>
        </div>

        <div className="divider" />

        {level ? (
          <RiskTargetsCard
            modelName="SCORE2-DIABETES"
            riskLevel={level}
            riskPercent={riskPercent}
            showSecondary={true}
            note="Phân tầng theo mốc <5% thấp; 5–<10% vừa; 10–<20% cao; ≥20% rất cao. Nếu có ASCVD/CKD nặng/tổn thương cơ quan đích… có thể xếp rất cao независимо score."
          />
        ) : (
          <div style={{ color: "var(--muted)", fontWeight: 700 }}>
            Không thể tính (kiểm tra dữ liệu nhập).
          </div>
        )}
      </div>
    </div>
  );
}
