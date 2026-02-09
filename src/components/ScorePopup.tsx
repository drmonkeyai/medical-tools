// src/components/ScorePopup.tsx
import { useEffect, useMemo, useState } from "react";
import type { RiskRegion, Sex } from "../calculators/score2Core";
import {
  calcSCORE2,
  calcSCORE2OP,
  calcSCORE2DIABETES,
  calcSCORE2ASIAN,
  clamp,
} from "../calculators/score2Core";

export type ScoreModel = "score2" | "score2-op" | "score2-diabetes" | "score2-asian";
type RiskLevel = "low" | "moderate" | "high" | "very-high";
type HbUnit = "mmol/mol" | "%";

export type ScorePopupResult = {
  model: ScoreModel;
  riskPercent: number;
  riskLevel: RiskLevel;
  summary: string;
  inputs: {
    region: RiskRegion;
    sex: Sex;
    age: number;
    smoker: 0 | 1;
    sbp: number;
    tc: number;
    hdl: number;
    nonHdl: number;
    diabetesAge?: number;
    hbUnit?: HbUnit;
    hba1c?: number;
    egfr?: number;
  };
};

export type ScorePopupPrefill = Partial<{
  region: RiskRegion;
  sex: Sex;
  age: number;
  smoker: 0 | 1;
  sbp: number;
  tc: number;
  hdl: number;
  // diabetes
  diabetesAge: number;
  hbUnit: HbUnit;
  hba1c: number;
  egfr: number;
}>;

type Props = {
  open: boolean;
  defaultModel: ScoreModel;
  title?: string;
  prefill?: ScorePopupPrefill;
  onClose: () => void;
  onApply: (result: ScorePopupResult) => void;
};

// NGSP% -> IFCC mmol/mol
function hba1cPctToMmolMol(pct: number) {
  return (pct - 2.15) * 10.929;
}

function labelModel(m: ScoreModel) {
  if (m === "score2") return "SCORE2 (<70)";
  if (m === "score2-op") return "SCORE2-OP (≥70)";
  if (m === "score2-diabetes") return "SCORE2-Diabetes";
  return "SCORE2-Asia";
}

function levelLabel(lv: RiskLevel) {
  if (lv === "low") return "Nguy cơ thấp";
  if (lv === "moderate") return "Nguy cơ trung bình";
  if (lv === "high") return "Nguy cơ cao";
  return "Nguy cơ rất cao";
}

function levelColors(lv: RiskLevel) {
  if (lv === "low") return { bg: "#00B04F", fg: "#ffffff", bd: "rgba(0,0,0,0.10)" };
  if (lv === "moderate") return { bg: "#FFF000", fg: "#111827", bd: "rgba(0,0,0,0.12)" };
  if (lv === "high") return { bg: "#F09010", fg: "#111827", bd: "rgba(0,0,0,0.12)" };
  return { bg: "#B00000", fg: "#ffffff", bd: "rgba(0,0,0,0.12)" };
}

function levelFromPercent(model: ScoreModel, p: number): RiskLevel {
  if (model === "score2" || model === "score2-op") {
    if (p < 2) return "low";
    if (p < 10) return "moderate";
    if (p < 20) return "high";
    return "very-high";
  }
  if (p < 5) return "low";
  if (p < 10) return "moderate";
  if (p < 20) return "high";
  return "very-high";
}

function cutRuleText(model: ScoreModel) {
  if (model === "score2" || model === "score2-op") return "<2% thấp • 2–<10% vừa • 10–<20% cao • ≥20% rất cao";
  return "<5% thấp • 5–<10% vừa • 10–<20% cao • ≥20% rất cao";
}

function toMgDlChol(mmol: number) {
  return mmol * 38.67;
}

// ✅ FIX: dùng 1 type chung để tránh union-type lỗi property
type SafeInputs = {
  sAge: number;
  sSbp: number;
  sTc: number;
  sHdl: number;
  sDmAge?: number;
  sEgfr?: number;
  hbMmolMol?: number;
};

export default function ScorePopup({ open, defaultModel, title, prefill, onClose, onApply }: Props) {
  const [model, setModel] = useState<ScoreModel>(defaultModel);

  const [region, setRegion] = useState<RiskRegion>("High");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(55);
  const [smoker, setSmoker] = useState<0 | 1>(0);
  const [sbp, setSbp] = useState<number>(130);
  const [tc, setTc] = useState<number>(5.2);
  const [hdl, setHdl] = useState<number>(1.3);

  // diabetes-only
  const [diabetesAge, setDiabetesAge] = useState<number>(47);
  const [hbUnit, setHbUnit] = useState<HbUnit>("mmol/mol");
  const [hba1c, setHba1c] = useState<number>(58);
  const [egfr, setEgfr] = useState<number>(85);

  useEffect(() => {
    if (!open) return;

    setModel(defaultModel);

    setRegion(prefill?.region ?? "High");
    setSex(prefill?.sex ?? "male");
    setAge(typeof prefill?.age === "number" ? prefill.age : 55);
    setSmoker(typeof prefill?.smoker === "number" ? prefill.smoker : 0);
    setSbp(typeof prefill?.sbp === "number" ? prefill.sbp : 130);
    setTc(typeof prefill?.tc === "number" ? prefill.tc : 5.2);
    setHdl(typeof prefill?.hdl === "number" ? prefill.hdl : 1.3);

    const fallbackDmAge = Math.max(10, (prefill?.age ?? 55) - 8);
    setDiabetesAge(typeof prefill?.diabetesAge === "number" ? prefill.diabetesAge : fallbackDmAge);
    setHbUnit(prefill?.hbUnit ?? "mmol/mol");
    setHba1c(typeof prefill?.hba1c === "number" ? prefill.hba1c : 58);
    setEgfr(typeof prefill?.egfr === "number" ? prefill.egfr : 85);
  }, [open, defaultModel, prefill]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const nonHdl = useMemo(() => {
    const v = Number(tc) - Number(hdl);
    return Number.isFinite(v) ? Math.max(0, v) : NaN;
  }, [tc, hdl]);

  const safe = useMemo<SafeInputs>(() => {
    const sSbp = clamp(Math.round(sbp), 90, 220);
    const sTc = clamp(tc, 2.0, 10.0);
    const sHdl = clamp(hdl, 0.5, 3.0);

    // sAge theo model
    let sAge = Math.round(age);
    if (model === "score2") sAge = clamp(sAge, 40, 69);
    else if (model === "score2-op") sAge = clamp(sAge, 70, 99);
    else sAge = clamp(sAge, 40, 89); // diabetes/asian

    const base: SafeInputs = { sAge, sSbp, sTc, sHdl };

    if (model !== "score2-diabetes") return base;

    const sDmAge = clamp(Math.round(diabetesAge), 10, sAge);
    const sEgfr = clamp(egfr, 10, 150);

    let hbMmolMol = hbUnit === "mmol/mol" ? hba1c : hba1cPctToMmolMol(hba1c);
    hbMmolMol = clamp(hbMmolMol, 20, 140);

    return { ...base, sDmAge, sEgfr, hbMmolMol };
  }, [model, age, sbp, tc, hdl, diabetesAge, hbUnit, hba1c, egfr]);

  const calc = useMemo(() => {
    try {
      if (model === "score2") {
        return calcSCORE2({
          region,
          age: safe.sAge,
          sex,
          smoker,
          sbp: safe.sSbp,
          totalChol: safe.sTc,
          hdl: safe.sHdl,
          diabetes: 0,
        });
      }

      if (model === "score2-op") {
        return calcSCORE2OP({
          region,
          age: safe.sAge,
          sex,
          smoker,
          sbp: safe.sSbp,
          totalChol: safe.sTc,
          hdl: safe.sHdl,
          diabetes: 0,
        });
      }

      if (model === "score2-asian") {
        return calcSCORE2ASIAN({
          region,
          age: safe.sAge,
          sex,
          smoker,
          sbp: safe.sSbp,
          totalChol: safe.sTc,
          hdl: safe.sHdl,
          diabetes: 0,
        });
      }

      // score2-diabetes
      return calcSCORE2DIABETES({
        region,
        age: safe.sAge,
        sex,
        smoker,
        sbp: safe.sSbp,
        totalChol: safe.sTc,
        hdl: safe.sHdl,
        diabetes: 1,
        diabetesAge: safe.sDmAge!,     // ✅ chắc chắn có khi model=diabetes
        hba1c: safe.hbMmolMol!,        // ✅ chắc chắn có khi model=diabetes
        egfr: safe.sEgfr!,             // ✅ chắc chắn có khi model=diabetes
      });
    } catch {
      return null;
    }
  }, [model, region, sex, smoker, safe]);

  const riskPercent = typeof (calc as any)?.riskPercent === "number" ? (calc as any).riskPercent : NaN;
  const hasResult = Number.isFinite(riskPercent);

  const riskLevel: RiskLevel | null = hasResult ? levelFromPercent(model, riskPercent) : null;
  const badge = riskLevel ? levelColors(riskLevel) : null;

  const ageHint = useMemo(() => {
    if (!Number.isFinite(age)) return "";
    if (age >= 70 && model === "score2") return "Tuổi ≥70: nên dùng SCORE2-OP.";
    if (age < 70 && model === "score2-op") return "Tuổi <70: nên dùng SCORE2.";
    return "";
  }, [age, model]);

  const apply = () => {
    if (!hasResult || !riskLevel) return;

    const summary =
      `${labelModel(model)}: ${riskPercent.toFixed(1)}% / 10 năm → ${levelLabel(riskLevel)} ` +
      `(${cutRuleText(model)})`;

    onApply({
      model,
      riskPercent,
      riskLevel,
      summary,
      inputs: {
        region,
        sex,
        age: safe.sAge,
        smoker,
        sbp: safe.sSbp,
        tc: safe.sTc,
        hdl: safe.sHdl,
        nonHdl: Number.isFinite(nonHdl) ? nonHdl : NaN,
        ...(model === "score2-diabetes"
          ? {
              diabetesAge: safe.sDmAge,
              hbUnit,
              hba1c,
              egfr: safe.sEgfr,
            }
          : {}),
      },
    });
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 100%)",
          maxHeight: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 18,
          border: "1px solid var(--line)",
          background: "white",
          boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid var(--line)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            flex: "0 0 auto",
          }}
        >
          <div style={{ minWidth: 240 }}>
            <div style={{ fontSize: 16, fontWeight: 1000 }}>{title ?? "Tính SCORE trong POP-UP"}</div>
            <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 750 }}>
              Dữ liệu đã được điền sẵn từ form chính. Bạn có thể sửa trực tiếp tại đây.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {hasResult && riskLevel ? (
              <div
                style={{
                  borderRadius: 14,
                  padding: "10px 12px",
                  background: badge!.bg,
                  color: badge!.fg,
                  border: `1px solid ${badge!.bd}`,
                  fontWeight: 1000,
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                  whiteSpace: "nowrap",
                }}
                title={cutRuleText(model)}
              >
                <span style={{ fontSize: 12, opacity: 0.95 }}>KQ</span>
                <span style={{ fontSize: 18 }}>{riskPercent.toFixed(1)}%</span>
                <span style={{ fontSize: 13, opacity: 0.95 }}>{levelLabel(riskLevel)}</span>
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontWeight: 850 }}>Chưa có kết quả</div>
            )}

            <button
              className="btn"
              onClick={apply}
              disabled={!hasResult || !riskLevel}
              style={{
                border: "none",
                background: "var(--primary)",
                color: "white",
                fontWeight: 1000,
                opacity: !hasResult || !riskLevel ? 0.55 : 1,
                cursor: !hasResult || !riskLevel ? "not-allowed" : "pointer",
              }}
            >
              Áp dụng
            </button>

            <button className="btn" onClick={onClose} style={{ background: "white", fontWeight: 1000 }}>
              Đóng
            </button>
          </div>
        </div>

        {/* TABS */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid var(--line)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            flex: "0 0 auto",
          }}
        >
          {(
            [
              ["score2", "SCORE2 (<70)"],
              ["score2-op", "SCORE2-OP (≥70)"],
              ["score2-diabetes", "SCORE2-Diabetes"],
              ["score2-asian", "SCORE2-Asia"],
            ] as Array<[ScoreModel, string]>
          ).map(([m, text]) => {
            const active = model === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className="btn"
                style={{
                  background: active ? "rgba(29,78,216,0.10)" : "white",
                  border: active ? "1px solid rgba(29,78,216,0.45)" : "1px solid var(--line)",
                  fontWeight: 1000,
                }}
              >
                {text}
              </button>
            );
          })}
        </div>

        {/* BODY (SCROLL) */}
        <div
          style={{
            padding: 14,
            overflowY: "auto",
            flex: "1 1 auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {ageHint && (
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(245,158,11,0.35)",
                background: "rgba(245,158,11,0.10)",
                padding: 12,
                fontWeight: 850,
                color: "#92400e",
                marginBottom: 12,
              }}
            >
              {ageHint}
            </div>
          )}

          <div className="formGrid">
            <div className="field field--wide">
              <label className="label">Cụm quốc gia (HeartScore)</label>
              <select className="select" value={region} onChange={(e) => setRegion(e.target.value as RiskRegion)}>
                <option value="Low">Nguy cơ thấp</option>
                <option value="Moderate">Nguy cơ trung bình</option>
                <option value="High">Nguy cơ cao</option>
                <option value="Very high">Nguy cơ rất cao</option>
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
              <input
                className="input"
                type="number"
                value={Number.isFinite(age) ? age : ""}
                onChange={(e) => setAge(Number(e.target.value))}
              />
              <div className="help">
                {model === "score2" && "SCORE2: 40–69"}
                {model === "score2-op" && "SCORE2-OP: ≥70"}
                {(model === "score2-diabetes" || model === "score2-asian") && "Diabetes/Asia: 40–89"}
                {" • (tự clamp)"}
              </div>
            </div>

            <div className="field field--wide">
              <label className="label">Hút thuốc hiện tại</label>
              <select className="select" value={smoker} onChange={(e) => setSmoker(Number(e.target.value) as 0 | 1)}>
                <option value={0}>Không</option>
                <option value={1}>Có</option>
              </select>
            </div>

            <div className="field field--wide">
              <label className="label">SBP (mmHg)</label>
              <input className="input" type="number" value={sbp} onChange={(e) => setSbp(Number(e.target.value))} />
            </div>

            <div className="field field--wide">
              <label className="label">TC (mmol/L)</label>
              <input className="input" type="number" step="0.1" value={tc} onChange={(e) => setTc(Number(e.target.value))} />
            </div>

            <div className="field field--wide">
              <label className="label">HDL-C (mmol/L)</label>
              <input className="input" type="number" step="0.1" value={hdl} onChange={(e) => setHdl(Number(e.target.value))} />
            </div>

            <div className="field field--wide">
              <label className="label">Non-HDL (tự tính)</label>
              <div
                className="input"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  fontWeight: 1000,
                }}
              >
                <span>{Number.isFinite(nonHdl) ? `${nonHdl.toFixed(1)} mmol/L` : "—"}</span>
                <span style={{ color: "var(--muted)", fontWeight: 900 }}>
                  {Number.isFinite(nonHdl) ? `~${Math.round(toMgDlChol(nonHdl))} mg/dL` : ""}
                </span>
              </div>
              <div className="help">Non-HDL = TC − HDL</div>
            </div>

            {model === "score2-diabetes" && (
              <>
                <div className="field field--wide">
                  <label className="label">Tuổi chẩn đoán ĐTĐ</label>
                  <input className="input" type="number" value={diabetesAge} onChange={(e) => setDiabetesAge(Number(e.target.value))} />
                  <div className="help">Tự clamp để ≤ tuổi hiện tại.</div>
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
                  <div className="help">Nếu nhập %, hệ thống đổi sang IFCC (mmol/mol).</div>
                </div>

                <div className="field field--wide">
                  <label className="label">eGFR (mL/min/1.73m²)</label>
                  <input className="input" type="number" value={egfr} onChange={(e) => setEgfr(Number(e.target.value))} />
                </div>
              </>
            )}
          </div>

          <div className="divider" />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 1000 }}>Quy tắc phân tầng trong POP-UP</div>
              <div style={{ color: "var(--muted)", fontWeight: 850, marginTop: 4 }}>
                {labelModel(model)}: {cutRuleText(model)}
              </div>
            </div>

            <button
              className="btn"
              onClick={() => window.open("https://www.heartscore.org/en_GB/", "_blank", "noopener,noreferrer")}
              style={{ background: "white", fontWeight: 1000 }}
            >
              Mở HeartScore ↗
            </button>
          </div>

          {!hasResult && (
            <div style={{ marginTop: 10, color: "var(--muted)", fontWeight: 850 }}>
              Không thể tính (kiểm tra dữ liệu nhập).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
