// src/calculators/CVRiskESC.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

import ScorePopup, { type ScoreModel, type ScorePopupResult } from "../components/ScorePopup";
import type { RiskRegion, Sex } from "./score2Core";

type EscRisk = "low" | "moderate" | "high" | "very-high";

function escLabel(v: EscRisk) {
  if (v === "low") return "Nguy cơ thấp";
  if (v === "moderate") return "Nguy cơ trung bình";
  if (v === "high") return "Nguy cơ cao";
  return "Nguy cơ rất cao";
}

function escColors(v: EscRisk) {
  // theo phong cách ESC (vàng/cam/đỏ/đỏ đậm)
  if (v === "low") return { bg: "#FFF000", fg: "#111827" };
  if (v === "moderate") return { bg: "#F09010", fg: "#111827" };
  if (v === "high") return { bg: "#E00000", fg: "#ffffff" };
  return { bg: "#B00000", fg: "#ffffff" };
}

function nextUp(v: EscRisk): EscRisk {
  if (v === "low") return "moderate";
  if (v === "moderate") return "high";
  if (v === "high") return "very-high";
  return "very-high";
}

function boolCountUnsafe(obj: unknown) {
  return Object.values(obj as Record<string, boolean>).filter(Boolean).length;
}

function targetsForRisk(v: EscRisk) {
  if (v === "very-high") {
    return [
      "LDL-C mục tiêu: < 1.4 mmol/L (55 mg/dL) + giảm ≥50% so với ban đầu.",
      "Ưu tiên can thiệp tích cực đa yếu tố (HA, đường huyết, hút thuốc…).",
      "Lối sống: bỏ thuốc lá, vận động đều, giảm muối, kiểm soát cân nặng.",
    ];
  }
  if (v === "high") {
    return [
      "LDL-C mục tiêu: < 1.8 mmol/L (70 mg/dL) + giảm ≥50% so với ban đầu.",
      "Kiểm soát HA tích cực theo dung nạp.",
      "Lối sống: bỏ thuốc lá, ăn lành mạnh, vận động đều.",
    ];
  }
  if (v === "moderate") {
    return [
      "LDL-C mục tiêu: < 2.6 mmol/L (100 mg/dL).",
      "Lối sống tối ưu, theo dõi định kỳ.",
      "Cân nhắc thuốc nếu LDL cao/khó kiểm soát hoặc nhiều yếu tố nguy cơ.",
    ];
  }
  return [
    "LDL-C mục tiêu: < 3.0 mmol/L (116 mg/dL).",
    "Ưu tiên lối sống, tầm soát và theo dõi định kỳ.",
  ];
}

export default function CVRiskESC() {
  const navigate = useNavigate();
  const { activeCaseId, saveToActiveCase } = useCases();

  // ===== Inputs tối thiểu =====
  const [region, setRegion] = useState<RiskRegion>("High");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(55);

  const [sbp, setSbp] = useState<number>(130);
  const [smoker, setSmoker] = useState<boolean>(false);

  const [tc, setTc] = useState<number>(5.2);
  const [hdl, setHdl] = useState<number>(1.3);
  const [ldl, setLdl] = useState<number | "">("");

  const nonHdl = useMemo(() => {
    const v = Number(tc) - Number(hdl);
    return Number.isFinite(v) ? Math.max(0, v) : NaN;
  }, [tc, hdl]);

  const [onLipidTherapy, setOnLipidTherapy] = useState<boolean>(false);

  // ===== Step 1: ASCVD / hình ảnh chắc chắn =====
  const [hasAscgdClinical, setHasAscgdClinical] = useState<boolean>(false);
  const [hasAscgdImagingCertain, setHasAscgdImagingCertain] = useState<boolean>(false);

  // ===== Step 2A: Diabetes =====
  const [hasDiabetes, setHasDiabetes] = useState<boolean>(false);
  const [dmType, setDmType] = useState<1 | 2>(2);
  const [dmDuration, setDmDuration] = useState<number>(0);

  const [dmOrgan, setDmOrgan] = useState({
    microalbumin: false,
    retinopathy: false,
    neuropathy: false,
    lvh: false,
  });

  const [dmMajorRF, setDmMajorRF] = useState({
    htn: false,
    smoking: false,
    dyslipidemia: false,
    obesity: false,
    olderAge: false,
  });

  const [t1EarlyOnset, setT1EarlyOnset] = useState<boolean>(false);

  // ===== Step 2B: CKD =====
  const [hasCkd, setHasCkd] = useState<boolean>(false);
  const [egfr, setEgfr] = useState<number>(90);

  // ===== Step 2C: FH =====
  const [hasFH, setHasFH] = useState<boolean>(false);
  const [fhWithMajorRF, setFhWithMajorRF] = useState<boolean>(false);

  // ===== Step 4: Risk modifiers =====
  const [mod, setMod] = useState({
    familyHistoryEarly: false,
    obesity: false,
    sedentary: false,
    metabolicSyndrome: false,
    psychosocial: false,
    chronicInflammatory: false,
    hiv: false,
    osa: false,
    prematureMenopause: false,
    preeclampsia: false,
    hsCRP: false,
    lp_a: false,
    subclinicalPlaqueOrHighCAC: false,
  });

  // ===== SCORE popup state =====
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreDefaultModel, setScoreDefaultModel] = useState<ScoreModel>("score2");
  const [scoreApplied, setScoreApplied] = useState<ScorePopupResult | null>(null);

  const severeSingleRF = useMemo(() => {
    const tcHigh = Number(tc) > 8.0;
    const ldlHigh = ldl === "" ? false : Number(ldl) > 4.9;
    const bpVeryHigh = Number(sbp) >= 180;
    return tcHigh || ldlHigh || bpVeryHigh;
  }, [tc, ldl, sbp]);

  const dmOrganDamage = useMemo(() => boolCountUnsafe(dmOrgan) >= 1, [dmOrgan]);
  const dmMajorRFCount = useMemo(() => boolCountUnsafe(dmMajorRF), [dmMajorRF]);

  // ✅ quan trọng: chỉ “chặn SCORE vì CKD” khi eGFR <60 (CKD đẩy thẳng nhóm nguy cơ)
  const ckdPushesRisk = hasCkd && egfr < 60;

  const eligibleForScore = useMemo(() => {
    if (hasAscgdClinical || hasAscgdImagingCertain) return false;
    if (hasDiabetes) return false;
    if (ckdPushesRisk) return false;
    if (hasFH) return false;
    if (onLipidTherapy) return false;
    return true;
  }, [hasAscgdClinical, hasAscgdImagingCertain, hasDiabetes, ckdPushesRisk, hasFH, onLipidTherapy]);

  function suggestedDefaultModel(): ScoreModel {
    if (hasDiabetes && dmType === 2) return "score2-diabetes";
    if (age >= 70) return "score2-op";
    return "score2";
  }

  function openScore(model: ScoreModel) {
    setScoreDefaultModel(model);
    setScoreOpen(true);
  }

  const decision = useMemo(() => {
    let base: EscRisk | null = null;
    let reason = "";
    let usedScore: { model: string; percent: number } | null = null;

    // Step 1: ASCVD -> very-high
    if (hasAscgdClinical) {
      base = "very-high";
      reason = "Có ASCVD đã ghi nhận (phòng ngừa thứ phát) → xếp rất cao.";
    } else if (hasAscgdImagingCertain) {
      base = "very-high";
      reason = "Có bằng chứng xơ vữa chắc chắn trên hình ảnh / CAC rất cao → xếp rất cao.";
    }

    // Step 2A: Diabetes
    if (!base && hasDiabetes) {
      const veryHigh = dmOrganDamage || dmMajorRFCount >= 3 || (dmType === 1 && t1EarlyOnset && dmDuration > 20);
      if (veryHigh) {
        base = "very-high";
        reason = "ĐTĐ kèm tổn thương cơ quan đích / ≥3 yếu tố nguy cơ chính / T1 khởi phát sớm >20 năm → rất cao.";
      } else if (dmDuration >= 10 || dmMajorRFCount >= 1) {
        base = "high";
        reason = "ĐTĐ (chưa ASCVD) nhưng thời gian ≥10 năm hoặc có ≥1 yếu tố nguy cơ → cao.";
      } else {
        const young = (dmType === 1 && age < 35) || (dmType === 2 && age < 50);
        if (young && dmDuration < 10 && dmMajorRFCount === 0 && !dmOrganDamage) {
          base = "moderate";
          reason = "ĐTĐ ở người trẻ, thời gian <10 năm, không yếu tố nguy cơ khác → trung bình.";
        } else {
          base = "high";
          reason = "ĐTĐ: chưa đủ tiêu chí trung bình → xử trí như nhóm cao (cao).";
        }
      }
    }

    // Step 2B: CKD
    if (!base && hasCkd) {
      if (egfr < 30) {
        base = "very-high";
        reason = "Bệnh thận mạn nặng (eGFR <30) → rất cao.";
      } else if (egfr <= 59) {
        base = "high";
        reason = "Bệnh thận mạn (eGFR 30–59) → cao.";
      } else {
        // eGFR ≥60 không tự đẩy thẳng
        reason = "eGFR ≥60: không tự xếp cao theo CKD (xem các bước khác / SCORE nếu đủ điều kiện).";
      }
    }

    // Step 2C: FH
    if (!base && hasFH) {
      if (fhWithMajorRF) {
        base = "very-high";
        reason = "Tăng cholesterol máu gia đình kèm yếu tố nguy cơ lớn khác → rất cao.";
      } else {
        base = "high";
        reason = "Tăng cholesterol máu gia đình → cao.";
      }
    }

    // Step 2D: single severe RF
    if (!base && severeSingleRF) {
      base = "high";
      reason = "Có 1 yếu tố nguy cơ đơn lẻ rất nặng (TC/LDL rất cao hoặc HA rất cao) → cao.";
    }

    // Step 3: SCORE (nếu eligible)
    if (!base && eligibleForScore) {
      if (scoreApplied && Number.isFinite(scoreApplied.riskPercent)) {
        const p = scoreApplied.riskPercent;
        // map về 4 nhóm ESC
        const cutLow = scoreApplied.model === "score2" || scoreApplied.model === "score2-op" ? 2 : 5;
        if (p < cutLow) base = "low";
        else if (p < 10) base = "moderate";
        else if (p < 20) base = "high";
        else base = "very-high";

        usedScore = {
          model:
            scoreApplied.model === "score2"
              ? "SCORE2"
              : scoreApplied.model === "score2-op"
              ? "SCORE2-OP"
              : scoreApplied.model === "score2-asian"
              ? "SCORE2-ASIA-PACIFIC"
              : "SCORE2-DIABETES",
          percent: p,
        };

        reason = `Chưa có bệnh nền “đẩy thẳng” → dùng ${usedScore.model}: ${p.toFixed(1)}%/10 năm.`;
      } else {
        reason = "Chưa có bệnh nền “đẩy thẳng” → cần tính SCORE trong POP-UP để ra % nguy cơ.";
      }
    }

    // Không eligible SCORE
    if (!base && !eligibleForScore) {
      if (onLipidTherapy) {
        reason = "Đang dùng thuốc hạ lipid → không dùng SCORE để “tính lại” nguy cơ. Ưu tiên xếp nhóm theo bệnh nền/tiêu chí.";
      } else if (!reason) {
        reason = "Chưa đủ điều kiện để phân tầng (kiểm tra lại tiêu chí).";
      }
    }

    // Step 4: modifiers upgrade 1 bậc nếu “lưng chừng”
    let finalRisk = base;
    let upgraded = false;

    if (base && base !== "very-high") {
      const modCount = boolCountUnsafe(mod);
      const shouldUpgrade = mod.subclinicalPlaqueOrHighCAC || modCount >= 2;
      if (shouldUpgrade) {
        finalRisk = nextUp(base);
        upgraded = true;
      }
    }

    const noteUpgrade =
      base && finalRisk && upgraded
        ? "Đã cân nhắc nâng 1 bậc do có nhiều yếu tố điều chỉnh nguy cơ / xơ vữa dưới lâm sàng."
        : "";

    return { base, finalRisk, reason, usedScore, upgraded, noteUpgrade };
  }, [
    hasAscgdClinical,
    hasAscgdImagingCertain,
    hasDiabetes,
    dmOrganDamage,
    dmMajorRFCount,
    dmType,
    t1EarlyOnset,
    dmDuration,
    age,
    hasCkd,
    egfr,
    hasFH,
    fhWithMajorRF,
    severeSingleRF,
    eligibleForScore,
    scoreApplied,
    mod,
    onLipidTherapy,
  ]);

  const finalRisk = decision.finalRisk;
  const bannerStyle = finalRisk ? escColors(finalRisk) : null;

  const canSave = Boolean(activeCaseId) && typeof saveToActiveCase === "function" && Boolean(finalRisk);

  function save() {
    if (!finalRisk) return;

    const inputs = {
      region,
      sex,
      age,
      sbp,
      smoker,
      tc,
      hdl,
      ldl: ldl === "" ? undefined : Number(ldl),
      nonHdl,
      onLipidTherapy,

      hasAscgdClinical,
      hasAscgdImagingCertain,

      hasDiabetes,
      dmType,
      dmDuration,
      dmOrgan,
      dmMajorRF,
      t1EarlyOnset,

      hasCkd,
      egfr,

      hasFH,
      fhWithMajorRF,

      riskModifiers: mod,

      scoreApplied: scoreApplied ? { model: scoreApplied.model, riskPercent: scoreApplied.riskPercent, summary: scoreApplied.summary } : null,
    };

    const outputs = {
      baseRisk: decision.base,
      finalRisk,
      reason: decision.reason,
      usedScore: decision.usedScore,
      upgraded: decision.upgraded,
      noteUpgrade: decision.noteUpgrade,
      targets: targetsForRisk(finalRisk),
    };

    const summary = `Phân tầng nguy cơ tim mạch (ESC): ${escLabel(finalRisk)}${
      decision.usedScore ? ` • ${decision.usedScore.model} ${decision.usedScore.percent.toFixed(1)}%` : ""
    }`;

    saveToActiveCase({
      tool: "cv-risk-esc",
      inputs,
      outputs,
      summary,
    });
  }

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">Phân tầng nguy cơ tim mạch (ESC/EAS)</h1>
            <div className="calcSub">
              Ưu tiên xếp nhóm nguy cơ <b>không cần tính điểm</b>. Chỉ dùng SCORE khi chưa có bệnh nền “đẩy thẳng”.
            </div>
          </div>

          <button className="btn" onClick={() => navigate(-1)} title="Trở về trang trước">
            ← Trở về trang trước
          </button>
        </div>

        {/* ===== RESULT BANNER ===== */}
        {finalRisk ? (
          <div
            style={{
              borderRadius: 16,
              padding: 14,
              background: bannerStyle!.bg,
              color: bannerStyle!.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              boxShadow: "0 12px 26px rgba(0,0,0,0.12)",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 1000, letterSpacing: 0.2 }}>KẾT QUẢ PHÂN TẦNG</div>
              <div style={{ fontSize: 24, fontWeight: 1100, marginTop: 2 }}>{escLabel(finalRisk)}</div>

              {decision.usedScore && (
                <div style={{ marginTop: 6, fontWeight: 1000, opacity: 0.95 }}>
                  {decision.usedScore.model}: {decision.usedScore.percent.toFixed(1)}% / 10 năm
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn"
                onClick={() => openScore(suggestedDefaultModel())}
                style={{
                  border: "1px solid rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.18)",
                  color: bannerStyle!.fg,
                  fontWeight: 1000,
                }}
              >
                Tính SCORE (POP-UP)
              </button>

              <button
                className="btn"
                disabled={!canSave}
                onClick={save}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#111827",
                  fontWeight: 1000,
                  opacity: canSave ? 1 : 0.55,
                  cursor: canSave ? "pointer" : "not-allowed",
                }}
              >
                Lưu vào ca
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 16,
              padding: 14,
              border: "1px solid var(--line)",
              background: "rgba(0,0,0,0.02)",
              color: "var(--muted)",
              fontWeight: 900,
              marginBottom: 12,
            }}
          >
            Chưa có kết quả phân tầng. Hãy nhập thông tin và/hoặc bấm “Tính SCORE (POP-UP)” khi cần.
          </div>
        )}

        {/* ===== Lý giải + mục tiêu ===== */}
        {finalRisk && (
          <div
            style={{
              borderRadius: 16,
              padding: 12,
              border: "1px solid var(--line)",
              background: "white",
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 1100, marginBottom: 6 }}>Lý giải ngắn gọn</div>
            <div style={{ color: "var(--text)", fontWeight: 800, lineHeight: 1.55 }}>
              {decision.reason}
              {decision.noteUpgrade ? (
                <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 900 }}>• {decision.noteUpgrade}</div>
              ) : null}
            </div>

            <div className="divider" />

            <div style={{ fontWeight: 1100, marginBottom: 6 }}>Mục tiêu điều trị (tóm tắt)</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text)", fontWeight: 850, lineHeight: 1.55 }}>
              {targetsForRisk(finalRisk).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ===== INPUTS ===== */}
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
            <input className="input" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </div>

          <div className="field field--wide">
            <label className="label">HA tâm thu (mmHg)</label>
            <input className="input" type="number" value={sbp} onChange={(e) => setSbp(Number(e.target.value))} />
          </div>

          <div className="field field--wide">
            <label className="label">Hút thuốc hiện tại</label>
            <select className="select" value={smoker ? 1 : 0} onChange={(e) => setSmoker(e.target.value === "1")}>
              <option value={0}>Không</option>
              <option value={1}>Có</option>
            </select>
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
            <label className="label">LDL-C (mmol/L) (nếu có)</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={ldl}
              onChange={(e) => setLdl(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Có thể để trống"
            />
            <div className="help">
              Non-HDL = TC − HDL = <b>{Number.isFinite(nonHdl) ? nonHdl.toFixed(2) : "?"}</b> mmol/L
            </div>
          </div>

          <div className="field field--wide">
            <label className="label">Đang dùng thuốc hạ lipid máu?</label>
            <select className="select" value={onLipidTherapy ? 1 : 0} onChange={(e) => setOnLipidTherapy(e.target.value === "1")}>
              <option value={0}>Không</option>
              <option value={1}>Có (không dùng SCORE để “tính lại”)</option>
            </select>
          </div>
        </div>

        <div className="divider" />

        {/* Step 1 */}
        <div style={{ fontWeight: 1100, marginBottom: 8 }}>Bước 1 — Có ASCVD (lâm sàng/hình ảnh chắc chắn)?</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
            <input type="checkbox" checked={hasAscgdClinical} onChange={(e) => setHasAscgdClinical(e.target.checked)} />
            Có ASCVD (nhồi máu, đột quỵ/TIA, PAD, can thiệp mạch…)
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
            <input type="checkbox" checked={hasAscgdImagingCertain} onChange={(e) => setHasAscgdImagingCertain(e.target.checked)} />
            Hình ảnh chắc chắn xơ vữa có ý nghĩa / CAC rất cao
          </label>
        </div>

        <div className="divider" />

        {/* Step 2A */}
        <div style={{ fontWeight: 1100, marginBottom: 8 }}>Bước 2A — Đái tháo đường</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
            <input type="checkbox" checked={hasDiabetes} onChange={(e) => setHasDiabetes(e.target.checked)} />
            Có đái tháo đường
          </label>

          {hasDiabetes && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontWeight: 900, color: "var(--muted)" }}>Típ</span>
                <select className="select" style={{ width: 120 }} value={dmType} onChange={(e) => setDmType(Number(e.target.value) as 1 | 2)}>
                  <option value={1}>Típ 1</option>
                  <option value={2}>Típ 2</option>
                </select>

                <span style={{ fontWeight: 900, color: "var(--muted)" }}>Thời gian (năm)</span>
                <input className="input" style={{ width: 120 }} type="number" value={dmDuration} onChange={(e) => setDmDuration(Number(e.target.value))} />
              </div>

              <button className="btn" onClick={() => openScore("score2-diabetes")} title="Tính SCORE2-DIABETES trong POP-UP">
                Tính SCORE2-DIABETES (POP-UP)
              </button>
            </>
          )}
        </div>

        {hasDiabetes && (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 1000 }}>Tổn thương cơ quan đích</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {([
                ["microalbumin", "Albumin niệu tăng / microalbumin niệu"],
                ["retinopathy", "Bệnh võng mạc ĐTĐ"],
                ["neuropathy", "Bệnh thần kinh ngoại biên do ĐTĐ"],
                ["lvh", "Phì đại thất trái"],
              ] as const).map(([k, lab]) => (
                <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                  <input
                    type="checkbox"
                    checked={(dmOrgan as any)[k]}
                    onChange={(e) => setDmOrgan((p) => ({ ...p, [k]: e.target.checked }))}
                  />
                  {lab}
                </label>
              ))}
            </div>

            <div style={{ fontWeight: 1000 }}>Yếu tố nguy cơ chính đi kèm (đếm số)</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {([
                ["htn", "Tăng huyết áp"],
                ["smoking", "Hút thuốc"],
                ["dyslipidemia", "Rối loạn lipid"],
                ["obesity", "Béo phì"],
                ["olderAge", "Tuổi cao"],
              ] as const).map(([k, lab]) => (
                <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                  <input
                    type="checkbox"
                    checked={(dmMajorRF as any)[k]}
                    onChange={(e) => setDmMajorRF((p) => ({ ...p, [k]: e.target.checked }))}
                  />
                  {lab}
                </label>
              ))}
            </div>

            {dmType === 1 && (
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                <input type="checkbox" checked={t1EarlyOnset} onChange={(e) => setT1EarlyOnset(e.target.checked)} />
                Típ 1 khởi phát sớm (đánh dấu nếu phù hợp)
              </label>
            )}
          </div>
        )}

        <div className="divider" />

        {/* Step 2B */}
        <div style={{ fontWeight: 1100, marginBottom: 8 }}>Bước 2B — Bệnh thận mạn (eGFR)</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
            <input type="checkbox" checked={hasCkd} onChange={(e) => setHasCkd(e.target.checked)} />
            Có bệnh thận mạn
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontWeight: 900, color: "var(--muted)" }}>eGFR</span>
            <input className="input" style={{ width: 140 }} type="number" value={egfr} onChange={(e) => setEgfr(Number(e.target.value))} />
            <span style={{ fontWeight: 900, color: "var(--muted)" }}>mL/min/1.73m²</span>
          </div>

          {hasCkd && egfr >= 60 && (
            <div style={{ color: "var(--muted)", fontWeight: 900 }}>
              eGFR ≥60: không tự “đẩy thẳng” nhóm nguy cơ, vẫn có thể dùng SCORE nếu đủ điều kiện khác.
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Step 2C */}
        <div style={{ fontWeight: 1100, marginBottom: 8 }}>Bước 2C — Tăng cholesterol máu gia đình</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
            <input type="checkbox" checked={hasFH} onChange={(e) => setHasFH(e.target.checked)} />
            Nghi/từng được chẩn đoán tăng cholesterol máu gia đình
          </label>

          {hasFH && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
              <input type="checkbox" checked={fhWithMajorRF} onChange={(e) => setFhWithMajorRF(e.target.checked)} />
              Kèm yếu tố nguy cơ lớn khác
            </label>
          )}
        </div>

        <div className="divider" />

        {/* Step 4 */}
        <div style={{ fontWeight: 1100, marginBottom: 8 }}>Bước 4 — Yếu tố điều chỉnh nguy cơ (nếu “lưng chừng”)</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {([
            ["familyHistoryEarly", "Tiền sử gia đình bệnh tim mạch sớm"],
            ["obesity", "Béo phì"],
            ["sedentary", "Ít vận động"],
            ["metabolicSyndrome", "Hội chứng chuyển hoá"],
            ["psychosocial", "Stress kéo dài / kinh tế-xã hội thấp"],
            ["chronicInflammatory", "Bệnh viêm/tự miễn mạn"],
            ["hiv", "HIV"],
            ["osa", "Ngưng thở khi ngủ"],
            ["prematureMenopause", "Mãn kinh sớm"],
            ["preeclampsia", "Tiền sản giật / THA thai kỳ"],
            ["hsCRP", "hs-CRP tăng dai dẳng"],
            ["lp_a", "Lipoprotein(a) tăng"],
            ["subclinicalPlaqueOrHighCAC", "Xơ vữa dưới lâm sàng / CAC tăng"],
          ] as const).map(([k, lab]) => (
            <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
              <input type="checkbox" checked={(mod as any)[k]} onChange={(e) => setMod((p) => ({ ...p, [k]: e.target.checked }))} />
              {lab}
            </label>
          ))}
        </div>

        <div className="divider" />

        {/* SCORE area */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 1100 }}>
            Thang điểm SCORE (khi chưa có bệnh nền “đẩy thẳng”)
            <div style={{ color: "var(--muted)", fontWeight: 900, marginTop: 4 }}>
              {eligibleForScore
                ? "Bạn có thể tính SCORE trong POP-UP và áp dụng ngay cho phân tầng."
                : "Hiện không eligible dùng SCORE (ASCVD/ĐTĐ/CKD<60/FH/đang dùng thuốc hạ lipid…)."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => openScore(suggestedDefaultModel())}>
              Tính SCORE (POP-UP)
            </button>
            <button className="btn" onClick={() => openScore("score2-asian")}>
              SCORE2-ASIA (POP-UP)
            </button>
          </div>
        </div>

        {scoreApplied && (
          <div style={{ marginTop: 10, borderRadius: 14, border: "1px solid var(--line)", padding: 12, background: "rgba(0,0,0,0.02)" }}>
            <div style={{ fontWeight: 1100 }}>Đã áp dụng kết quả SCORE</div>
            <div style={{ color: "var(--muted)", fontWeight: 900, marginTop: 4 }}>{scoreApplied.summary}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => setScoreApplied(null)} style={{ background: "white" }}>
                Bỏ kết quả SCORE
              </button>
              <button className="btn" onClick={() => openScore(scoreApplied.model)}>
                Tính lại (POP-UP)
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, color: "var(--muted)", fontWeight: 900 }}>
          Lưu ý: Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
        </div>
      </div>

      {/* POPUP */}
      <ScorePopup
        open={scoreOpen}
        defaultModel={scoreDefaultModel}
        title="SCORE (tự tính trong POP-UP, đã điền sẵn)"
        prefill={{
          region,
          sex,
          age,
          smoker: smoker ? 1 : 0,
          sbp,
          tc,
          hdl,
        }}
        onClose={() => setScoreOpen(false)}
        onApply={(r: ScorePopupResult) => {
          setScoreApplied(r);
          setScoreOpen(false);

          // ✅ sync ngược về form chính (đúng yêu cầu của bạn)
          setRegion(r.inputs.region);
          setSex(r.inputs.sex);
          setAge(r.inputs.age);
          setSmoker(r.inputs.smoker === 1);
          setSbp(r.inputs.sbp);
          setTc(r.inputs.tc);
          setHdl(r.inputs.hdl);
        }}
      />
    </div>
  );
}
