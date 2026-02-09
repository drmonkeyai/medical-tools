// src/calculators/CVRiskESC.tsx
import { useEffect, useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";

type RiskLevel = "Thấp" | "Trung bình" | "Cao" | "Rất cao" | "Chưa phân loại";
type Prevention = "Phòng ngừa thứ phát" | "Phòng ngừa nguyên phát";

type ScoreTab = "score2" | "score2-op" | "score2-diabetes";
type CountryCluster = "Nguy cơ thấp" | "Nguy cơ trung bình" | "Nguy cơ cao" | "Nguy cơ rất cao";

function upgradeOne(level: RiskLevel): RiskLevel {
  if (level === "Chưa phân loại") return level;
  if (level === "Rất cao") return level;
  if (level === "Cao") return "Rất cao";
  if (level === "Trung bình") return "Cao";
  return "Trung bình";
}

function clamp01to100(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

/**
 * ✅ FIX lỗi “mặc định rất cao”: không cho "" -> 0
 * ✅ hỗ trợ dấu phẩy: 7,5 -> 7.5
 */
function numOrUndef(v: string): number | undefined {
  const s = (v ?? "").trim();
  if (!s) return undefined;
  const normalized = s.replace(",", ".");
  const x = Number(normalized);
  return Number.isFinite(x) ? x : undefined;
}

const CHOL_MGDL_PER_MMOLL = 38.67;
const mgToMmol = (mg: number) => mg / CHOL_MGDL_PER_MMOLL;
const mmolToMg = (mmol: number) => mmol * CHOL_MGDL_PER_MMOLL;

type Tone = {
  tagVN: string;
  tagEN: string;
  bg: string;
  border: string;
  chipBg: string;
  chipText: string;
};

function escTone(level: RiskLevel): Tone {
  // Màu theo tinh thần ESC: xanh (low) - cam (moderate) - đỏ (high) - đỏ đậm (very high)
  switch (level) {
    case "Thấp":
      return {
        tagVN: "Thấp",
        tagEN: "Low risk",
        bg: "rgba(132,204,22,.12)",
        border: "rgba(77,124,15,.45)",
        chipBg: "#84cc16",
        chipText: "#0b1220",
      };
    case "Trung bình":
      return {
        tagVN: "Trung bình",
        tagEN: "Moderate risk",
        bg: "rgba(245,158,11,.14)",
        border: "rgba(180,83,9,.45)",
        chipBg: "#f59e0b",
        chipText: "#0b1220",
      };
    case "Cao":
      return {
        tagVN: "Cao",
        tagEN: "High risk",
        bg: "rgba(239,68,68,.10)",
        border: "rgba(185,28,28,.40)",
        chipBg: "#ef4444",
        chipText: "#ffffff",
      };
    case "Rất cao":
      return {
        tagVN: "Rất cao",
        tagEN: "Very high risk",
        bg: "rgba(153,27,27,.10)",
        border: "rgba(127,29,29,.45)",
        chipBg: "#991b1b",
        chipText: "#ffffff",
      };
    default:
      return {
        tagVN: "Chưa phân loại",
        tagEN: "Not classified",
        bg: "rgba(100,116,139,.10)",
        border: "rgba(100,116,139,.35)",
        chipBg: "#64748b",
        chipText: "#ffffff",
      };
  }
}

type LDLGoal = {
  classLabel: string;
  mmol: string;
  mgdl: string;
  extra?: string;
  note?: string;
};

function ldlGoalFor(level: RiskLevel): LDLGoal | null {
  if (level === "Chưa phân loại") return null;

  if (level === "Thấp") return { classLabel: "Class IIb", mmol: "<3.0", mgdl: "<116" };
  if (level === "Trung bình") return { classLabel: "Class IIa", mmol: "<2.6", mgdl: "<100" };
  if (level === "Cao")
    return { classLabel: "Class I", mmol: "<1.8", mgdl: "<70", extra: "và giảm ≥50% từ ban đầu" };

  return {
    classLabel: "Class I",
    mmol: "<1.4",
    mgdl: "<55",
    extra: "và giảm ≥50% từ ban đầu",
    note:
      "Nếu biến cố tái phát dù điều trị tối ưu (tình huống “extreme risk”): có thể cân nhắc mục tiêu <1.0 mmol/L (<40 mg/dL).",
  };
}

type Strategy = {
  label: string;
  color: "green" | "yellow" | "red" | "gray";
};

function ldlBand(ldlMmol: number) {
  if (ldlMmol < 1.4) return 0;
  if (ldlMmol < 1.8) return 1;
  if (ldlMmol < 2.6) return 2;
  if (ldlMmol < 3.0) return 3;
  if (ldlMmol < 4.9) return 4;
  return 5;
}

function interventionStrategy(risk: RiskLevel, prevention: Prevention, ldlMmol?: number): Strategy | null {
  if (risk === "Chưa phân loại") return null;
  if (ldlMmol === undefined) return null;

  const b = ldlBand(ldlMmol);

  const green: Strategy = { label: "Tư vấn lối sống", color: "green" };
  const yellow: Strategy = { label: "Điều chỉnh lối sống, cân nhắc thêm thuốc nếu chưa kiểm soát", color: "yellow" };
  const red: Strategy = { label: "Điều chỉnh lối sống + can thiệp thuốc đồng thời", color: "red" };

  if (risk === "Rất cao" && prevention === "Phòng ngừa thứ phát") return red;

  if (risk === "Thấp") {
    if (b <= 3) return green;
    if (b === 4) return yellow;
    return { label: "LDL-C rất cao (≥4.9) → thường đã thuộc nhóm nguy cơ ≥ Cao", color: "gray" };
  }

  if (risk === "Trung bình") {
    if (b <= 2) return green;
    if (b === 3 || b === 4) return yellow;
    return { label: "LDL-C rất cao (≥4.9) → thường đã thuộc nhóm nguy cơ ≥ Cao", color: "gray" };
  }

  if (risk === "Cao") {
    if (b <= 1) return green;
    if (b === 2) return yellow;
    return red;
  }

  // Very high primary prevention
  if (risk === "Rất cao") {
    if (b <= 1) return yellow;
    return red;
  }

  return null;
}

function badgeStyle(color: Strategy["color"]): React.CSSProperties {
  if (color === "green")
    return { background: "rgba(16,185,129,.18)", borderColor: "rgba(16,185,129,.45)", color: "#064e3b" };
  if (color === "yellow")
    return { background: "rgba(245,158,11,.18)", borderColor: "rgba(245,158,11,.45)", color: "#7c2d12" };
  if (color === "red")
    return { background: "rgba(239,68,68,.14)", borderColor: "rgba(185,28,28,.40)", color: "#7f1d1d" };
  return { background: "rgba(100,116,139,.12)", borderColor: "rgba(100,116,139,.35)", color: "#334155" };
}

export default function CVRiskESC() {
  const ctx = useCases() as any;
  const activeCase = ctx?.activeCase;
  const activeCaseId = ctx?.activeCaseId;
  const saveToActiveCase = ctx?.saveToActiveCase ?? ctx?.saveToolResult;

  const nowYear = new Date().getFullYear();
  const caseYob: number | undefined = activeCase?.patient?.yob;
  const caseSexRaw: any = activeCase?.patient?.sex;

  // ============== 0) DỮ LIỆU TỐI THIỂU (khi cần SCORE) ==============
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<string>(""); // "Nam" | "Nữ"
  const [sbp, setSbp] = useState<string>(""); // SBP (mmHg)
  const [dbp, setDbp] = useState<string>(""); // DBP (mmHg)
  const [smoking, setSmoking] = useState(false);

  const [lipidUnit, setLipidUnit] = useState<"mg/dL" | "mmol/L">("mmol/L");
  const [tc, setTc] = useState<string>(""); // Total cholesterol
  const [hdl, setHdl] = useState<string>(""); // HDL-C
  const [ldl, setLdl] = useState<string>(""); // LDL-C (ưu tiên “chưa điều trị”)
  const [onLipidLowering, setOnLipidLowering] = useState(false); // chặn dùng SCORE

  // Cluster quốc gia (chỉ lưu để ghi chép/nhắc; không tự tính)
  const [countryCluster, setCountryCluster] = useState<CountryCluster>("Nguy cơ trung bình");

  useEffect(() => {
    if (!age && caseYob) setAge(String(Math.max(0, nowYear - caseYob)));
    if (!sex && caseSexRaw) {
      const s = String(caseSexRaw).toLowerCase();
      if (s === "nam" || s === "male") setSex("Nam");
      if (s === "nữ" || s === "nu" || s === "female") setSex("Nữ");
    }
  }, [age, sex, caseYob, caseSexRaw, nowYear]);

  const ageNum = useMemo(() => numOrUndef(age), [age]);
  const sbpNum = useMemo(() => numOrUndef(sbp), [sbp]);
  const dbpNum = useMemo(() => numOrUndef(dbp), [dbp]);

  const tcNum = useMemo(() => numOrUndef(tc), [tc]);
  const hdlNum = useMemo(() => numOrUndef(hdl), [hdl]);
  const ldlNum = useMemo(() => numOrUndef(ldl), [ldl]);

  const tcMmol = useMemo(() => {
    if (tcNum === undefined) return undefined;
    return lipidUnit === "mmol/L" ? tcNum : mgToMmol(tcNum);
  }, [tcNum, lipidUnit]);

  const hdlMmol = useMemo(() => {
    if (hdlNum === undefined) return undefined;
    return lipidUnit === "mmol/L" ? hdlNum : mgToMmol(hdlNum);
  }, [hdlNum, lipidUnit]);

  const ldlMmol = useMemo(() => {
    if (ldlNum === undefined) return undefined;
    return lipidUnit === "mmol/L" ? ldlNum : mgToMmol(ldlNum);
  }, [ldlNum, lipidUnit]);

  const nonHdlMmol = useMemo(() => {
    if (tcMmol === undefined || hdlMmol === undefined) return undefined;
    return tcMmol - hdlMmol;
  }, [tcMmol, hdlMmol]);

  const nonHdlDisplay = useMemo(() => {
    if (nonHdlMmol === undefined) return null;
    const mmol = Math.round(nonHdlMmol * 10) / 10;
    const mg = Math.round(mmolToMg(nonHdlMmol));
    return { mmol, mg };
  }, [nonHdlMmol]);

  const scoreSuggested = useMemo(() => {
    if (ageNum === undefined) return "SCORE2 / SCORE2-OP";
    return ageNum >= 70 ? "SCORE2-OP" : "SCORE2";
  }, [ageNum]);

  // ============== B1) ASCVD (phòng ngừa thứ phát) ==============
  const [ascvdClinical, setAscvdClinical] = useState(false);
  const [imagingSignificantPlaque, setImagingSignificantPlaque] = useState(false);
  const [cacVeryHigh, setCacVeryHigh] = useState(false);

  // ============== B2) BỆNH NỀN ĐẨY THẲNG ==============
  // 2A) Diabetes
  const [diabetes, setDiabetes] = useState(false);
  const [dmType, setDmType] = useState<"" | "T1DM" | "T2DM">("");
  const [dmDuration, setDmDuration] = useState<string>(""); // years
  const [dmOrganDamage, setDmOrganDamage] = useState(false);
  const dmDurationNum = useMemo(() => numOrUndef(dmDuration), [dmDuration]);

  const [dmRF_HTN, setDmRF_HTN] = useState(false);
  const [dmRF_Smoke, setDmRF_Smoke] = useState(false);
  const [dmRF_Dyslip, setDmRF_Dyslip] = useState(false);
  const [dmRF_Obesity, setDmRF_Obesity] = useState(false);

  const dmRFCount = useMemo(
    () => [dmRF_HTN, dmRF_Smoke, dmRF_Dyslip, dmRF_Obesity].filter(Boolean).length,
    [dmRF_HTN, dmRF_Smoke, dmRF_Dyslip, dmRF_Obesity]
  );

  // 2B) CKD
  const [egfr, setEgfr] = useState<string>("");
  const egfrNum = useMemo(() => numOrUndef(egfr), [egfr]);

  // 2C) FH
  const [familialHC, setFamilialHC] = useState(false);
  const [fhWithMajorRF, setFhWithMajorRF] = useState(false);

  // ============== B3) SCORE (% nhập) ==============
  const [scoreRiskPct, setScoreRiskPct] = useState<string>("");
  const scorePctNum = useMemo(() => {
    const v = numOrUndef(scoreRiskPct);
    return v === undefined ? undefined : clamp01to100(v);
  }, [scoreRiskPct]);

  // ============== B4) MODIFIERS ==============
  const [modFamilyHxEarly, setModFamilyHxEarly] = useState(false);
  const [modHighRiskEthnicity, setModHighRiskEthnicity] = useState(false);
  const [modStress, setModStress] = useState(false);
  const [modDeprivation, setModDeprivation] = useState(false);
  const [modObesity, setModObesity] = useState(false);
  const [modInactivity, setModInactivity] = useState(false);
  const [modChronicInflamm, setModChronicInflamm] = useState(false);
  const [modSevereMentalIllness, setModSevereMentalIllness] = useState(false);
  const [modHIV, setModHIV] = useState(false);
  const [modOSA, setModOSA] = useState(false);
  const [modFemaleRepro, setModFemaleRepro] = useState(false);
  const [modHsCRP, setModHsCRP] = useState(false);
  const [modLpa, setModLpa] = useState(false);

  const [modSubclinicalPlaque, setModSubclinicalPlaque] = useState(false);
  const [modCACRaised, setModCACRaised] = useState(false);

  const modifierCount = useMemo(() => {
    return [
      modFamilyHxEarly,
      modHighRiskEthnicity,
      modStress,
      modDeprivation,
      modObesity,
      modInactivity,
      modChronicInflamm,
      modSevereMentalIllness,
      modHIV,
      modOSA,
      modFemaleRepro,
      modHsCRP,
      modLpa,
      modSubclinicalPlaque,
      modCACRaised,
    ].filter(Boolean).length;
  }, [
    modFamilyHxEarly,
    modHighRiskEthnicity,
    modStress,
    modDeprivation,
    modObesity,
    modInactivity,
    modChronicInflamm,
    modSevereMentalIllness,
    modHIV,
    modOSA,
    modFemaleRepro,
    modHsCRP,
    modLpa,
    modSubclinicalPlaque,
    modCACRaised,
  ]);

  // =================== SCORE POPUP ===================
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreTab, setScoreTab] = useState<ScoreTab>("score2");
  const [scoreModalPct, setScoreModalPct] = useState<string>("");

  function openScoreModal(tab?: ScoreTab) {
    const auto: ScoreTab = (ageNum ?? 0) >= 70 ? "score2-op" : "score2";
    const next = tab ?? auto;
    setScoreTab(next);
    setScoreModalPct(scoreRiskPct ?? "");
    setScoreModalOpen(true);
  }
  function closeScoreModal() {
    setScoreModalOpen(false);
  }

  useEffect(() => {
    if (!scoreModalOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeScoreModal();
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [scoreModalOpen]);

  // ====== LOGIC QUYẾT ĐỊNH ======
  const computed = useMemo(() => {
    const reasons: string[] = [];
    const shortReasons: string[] = [];
    const adjNotes: string[] = [];

    const hasASCVD = ascvdClinical || imagingSignificantPlaque || cacVeryHigh;
    const prevention: Prevention = hasASCVD ? "Phòng ngừa thứ phát" : "Phòng ngừa nguyên phát";

    let base: RiskLevel = "Chưa phân loại";

    // B1
    if (hasASCVD) {
      base = "Rất cao";
      reasons.push("Có ASCVD (lâm sàng hoặc hình ảnh rõ ràng) → xếp nguy cơ RẤT CAO");
      if (ascvdClinical) shortReasons.push("ASCVD lâm sàng");
      if (imagingSignificantPlaque) shortReasons.push("Mảng xơ vữa có ý nghĩa trên hình ảnh");
      if (cacVeryHigh) shortReasons.push("CAC rất cao");
    }

    // B2A - DM
    if (base !== "Rất cao" && diabetes) {
      const dmVeryHigh = dmOrganDamage || dmRFCount >= 3 || (dmType === "T1DM" && (dmDurationNum ?? 0) > 20);

      if (dmVeryHigh) {
        base = "Rất cao";
        reasons.push("ĐTĐ nguy cơ rất cao (tổn thương cơ quan đích hoặc ≥3 yếu tố nguy cơ chính hoặc T1DM kéo dài >20 năm)");
        if (dmOrganDamage) shortReasons.push("ĐTĐ + tổn thương cơ quan đích");
        else if (dmRFCount >= 3) shortReasons.push("ĐTĐ + ≥3 yếu tố nguy cơ chính");
        else shortReasons.push("T1DM >20 năm");
      } else {
        const dmHigh = (dmDurationNum ?? 0) >= 10 || dmRFCount >= 1;
        if (dmHigh) {
          base = "Cao";
          reasons.push("ĐTĐ nguy cơ cao (≥10 năm hoặc có thêm yếu tố nguy cơ khác)");
          if ((dmDurationNum ?? 0) >= 10) shortReasons.push("ĐTĐ ≥10 năm");
          if (dmRFCount >= 1) shortReasons.push("ĐTĐ + yếu tố nguy cơ kèm theo");
        } else {
          base = "Trung bình";
          reasons.push("ĐTĐ chưa đủ tiêu chí nguy cơ cao/rất cao → tạm xếp nguy cơ trung bình; cân nhắc SCORE2-Diabetes cho T2DM");
          shortReasons.push("ĐTĐ (không đạt tiêu chí cao/rất cao)");
        }
      }
    }

    // B2B - CKD
    if (base !== "Rất cao") {
      if (egfrNum !== undefined && egfrNum < 30) {
        base = "Rất cao";
        reasons.push("CKD nặng: eGFR <30 → nguy cơ RẤT CAO");
        shortReasons.push("eGFR <30");
      } else if (base !== "Cao" && egfrNum !== undefined && egfrNum >= 30 && egfrNum <= 59) {
        base = "Cao";
        reasons.push("CKD trung bình: eGFR 30–59 → nguy cơ CAO");
        shortReasons.push("eGFR 30–59");
      }
    }

    // B2C - FH
    if (base !== "Rất cao" && familialHC) {
      if (fhWithMajorRF) {
        base = "Rất cao";
        reasons.push("FH + yếu tố nguy cơ chính khác → nguy cơ RẤT CAO");
        shortReasons.push("FH + yếu tố nguy cơ chính");
      } else if (base !== "Cao") {
        base = "Cao";
        reasons.push("FH (không kèm yếu tố nguy cơ chính khác) → nguy cơ CAO");
        shortReasons.push("FH");
      }
    }

    // B2D - single very high RF
    if (base !== "Rất cao") {
      const tcVeryHigh = tcMmol !== undefined && tcMmol > 8.0;
      const ldlVeryHigh = ldlMmol !== undefined && ldlMmol > 4.9;
      const bpVeryHigh = (sbpNum !== undefined && sbpNum >= 180) || (dbpNum !== undefined && dbpNum >= 110);

      if (tcVeryHigh || ldlVeryHigh || bpVeryHigh) {
        base = "Cao";
        const parts: string[] = [];
        if (tcVeryHigh) parts.push("TC >8.0 mmol/L (≈>310 mg/dL)");
        if (ldlVeryHigh) parts.push("LDL-C >4.9 mmol/L (≈>190 mg/dL)");
        if (sbpNum !== undefined && sbpNum >= 180) parts.push("SBP ≥180");
        if (dbpNum !== undefined && dbpNum >= 110) parts.push("DBP ≥110");
        reasons.push(`Yếu tố nguy cơ đơn lẻ rất nặng → nguy cơ CAO: ${parts.join(" • ")}`);
        shortReasons.push("Yếu tố nguy cơ đơn lẻ rất nặng");
      }
    }

    // B3 - SCORE (chỉ khi đủ điều kiện)
    const hasCKD = egfrNum !== undefined && egfrNum < 60;
    const eligibleForScore = !hasASCVD && !diabetes && !hasCKD && !familialHC && !onLipidLowering;

    if (eligibleForScore && base !== "Cao" && base !== "Rất cao" && scorePctNum !== undefined) {
      if (scorePctNum < 2) base = "Thấp";
      else if (scorePctNum < 10) base = "Trung bình";
      else if (scorePctNum < 20) base = "Cao";
      else base = "Rất cao";

      reasons.push(`${scoreSuggested}: ${scorePctNum}% nguy cơ 10 năm (nhập tay)`);
      shortReasons.push(`${scoreSuggested} = ${scorePctNum}%`);
    }

    // B4 - modifiers (nâng bậc)
    let adjusted = base;

    if (adjusted !== "Chưa phân loại" && adjusted !== "Rất cao") {
      if (modSubclinicalPlaque) {
        adjusted = upgradeOne(adjusted);
        adjNotes.push("Có xơ vữa dưới lâm sàng trên hình ảnh → cân nhắc nâng 1 bậc");
      }
      if (modCACRaised && adjusted !== "Rất cao") {
        adjusted = upgradeOne(adjusted);
        adjNotes.push("CAC tăng → cân nhắc nâng 1 bậc");
      }

      const coreMods =
        [
          modFamilyHxEarly,
          modHighRiskEthnicity,
          modStress,
          modDeprivation,
          modObesity,
          modInactivity,
          modChronicInflamm,
          modSevereMentalIllness,
          modHIV,
          modOSA,
          modFemaleRepro,
          modHsCRP,
          modLpa,
        ].filter(Boolean).length;

      if (coreMods >= 2 && adjusted !== "Rất cao") {
        adjusted = upgradeOne(adjusted);
        adjNotes.push("Có ≥2 yếu tố điều chỉnh nguy cơ → xử trí như nhóm cao hơn");
      }
    }

    const hasAdjustment = base !== "Chưa phân loại" && adjusted !== base;

    return {
      prevention,
      eligibleForScore,
      base,
      finalLevel: adjusted,
      reasons,
      shortReasons,
      adjNotes,
      hasAdjustment,
    };
  }, [
    ascvdClinical,
    imagingSignificantPlaque,
    cacVeryHigh,
    diabetes,
    dmType,
    dmDurationNum,
    dmOrganDamage,
    dmRFCount,
    egfrNum,
    familialHC,
    fhWithMajorRF,
    tcMmol,
    ldlMmol,
    sbpNum,
    dbpNum,
    onLipidLowering,
    scoreSuggested,
    scorePctNum,
    modFamilyHxEarly,
    modHighRiskEthnicity,
    modStress,
    modDeprivation,
    modObesity,
    modInactivity,
    modChronicInflamm,
    modSevereMentalIllness,
    modHIV,
    modOSA,
    modFemaleRepro,
    modHsCRP,
    modLpa,
    modSubclinicalPlaque,
    modCACRaised,
  ]);

  const finalTone = escTone(computed.finalLevel);
  const ldlGoal = ldlGoalFor(computed.finalLevel);
  const strategy = interventionStrategy(computed.finalLevel, computed.prevention, ldlMmol);

  const canSave = computed.finalLevel !== "Chưa phân loại";

  const scoreMissing = useMemo(() => {
    const miss: string[] = [];
    if (ageNum === undefined) miss.push("Tuổi");
    if (!sex) miss.push("Giới");
    if (sbpNum === undefined) miss.push("SBP");
    if (tcNum === undefined) miss.push("TC");
    if (hdlNum === undefined) miss.push("HDL-C");
    return miss;
  }, [ageNum, sex, sbpNum, tcNum, hdlNum]);

  const shortExplain = useMemo(() => {
    const lines: string[] = [];
    if (computed.shortReasons.length) lines.push(...computed.shortReasons.slice(0, 3));
    if (computed.adjNotes.length) lines.push(computed.adjNotes[0]);
    return lines;
  }, [computed.shortReasons, computed.adjNotes]);

  function resetAll() {
    setAge("");
    setSex("");
    setSbp("");
    setDbp("");
    setSmoking(false);

    setLipidUnit("mmol/L");
    setTc("");
    setHdl("");
    setLdl("");
    setOnLipidLowering(false);

    setCountryCluster("Nguy cơ trung bình");

    setAscvdClinical(false);
    setImagingSignificantPlaque(false);
    setCacVeryHigh(false);

    setDiabetes(false);
    setDmType("");
    setDmDuration("");
    setDmOrganDamage(false);
    setDmRF_HTN(false);
    setDmRF_Smoke(false);
    setDmRF_Dyslip(false);
    setDmRF_Obesity(false);

    setEgfr("");
    setFamilialHC(false);
    setFhWithMajorRF(false);

    setScoreRiskPct("");

    setModFamilyHxEarly(false);
    setModHighRiskEthnicity(false);
    setModStress(false);
    setModDeprivation(false);
    setModObesity(false);
    setModInactivity(false);
    setModChronicInflamm(false);
    setModSevereMentalIllness(false);
    setModHIV(false);
    setModOSA(false);
    setModFemaleRepro(false);
    setModHsCRP(false);
    setModLpa(false);
    setModSubclinicalPlaque(false);
    setModCACRaised(false);
  }

  function handleSave() {
    if (!saveToActiveCase) {
      alert("Không tìm thấy hàm lưu vào ca (saveToActiveCase). Hãy kiểm tra CasesContext.");
      return;
    }
    if (!activeCaseId) {
      alert("Hãy tạo/chọn một ca đang hoạt động trước khi lưu.");
      return;
    }
    if (!canSave) {
      alert("Chưa đủ dữ liệu để phân tầng.");
      return;
    }

    const when = new Date().toISOString();

    const inputs = {
      demographics: { age: ageNum, sex },
      minimalForScore: {
        countryCluster,
        sbp: sbpNum,
        smokingCurrent: smoking,
        lipidUnit,
        tc: tcNum,
        hdl: hdlNum,
        nonHdl: nonHdlMmol,
        ldl: ldlNum,
        onLipidLowering,
      },
      step1_ascvd: { ascvdClinical, imagingSignificantPlaque, cacVeryHigh },
      step2_comorbidity: {
        diabetes,
        dmType,
        dmDurationYears: dmDurationNum,
        dmOrganDamage,
        dmMajorRFCount: dmRFCount,
        ckd: { egfr: egfrNum },
        familialHC,
        fhWithMajorRF,
        bp: { sbp: sbpNum, dbp: dbpNum },
      },
      step3_score: { eligibleForScore: computed.eligibleForScore, scoreSuggested, scoreRiskPct: scorePctNum },
      step4_modifiers: {
        modFamilyHxEarly,
        modHighRiskEthnicity,
        modStress,
        modDeprivation,
        modObesity,
        modInactivity,
        modChronicInflamm,
        modSevereMentalIllness,
        modHIV,
        modOSA,
        modFemaleRepro,
        modHsCRP,
        modLpa,
        modSubclinicalPlaque,
        modCACRaised,
      },
    };

    const outputs = {
      when,
      prevention: computed.prevention,
      baseRisk: computed.base,
      finalRisk: computed.finalLevel,
      reasons: computed.reasons,
      shortReasons: computed.shortReasons,
      adjustmentNotes: computed.adjNotes,
      eligibleForScore: computed.eligibleForScore,
      scoreSuggested,
      ldlGoal,
      interventionStrategy: strategy,
    };

    const goalShort = ldlGoal ? ` • LDL-C ${ldlGoal.mmol} mmol/L (${ldlGoal.mgdl} mg/dL)` : "";
    const summary = computed.hasAdjustment
      ? `Nguy cơ tim mạch: ${computed.finalLevel} (${computed.prevention}, điều chỉnh từ ${computed.base})${goalShort}`
      : `Nguy cơ tim mạch: ${computed.finalLevel} (${computed.prevention})${goalShort}`;

    saveToActiveCase({
      tool: "cv-risk-esc",
      when,
      summary,
      inputs,
      outputs,
    });

    alert("Đã lưu kết quả vào ca đang hoạt động.");
  }

  // =================== UI STYLES ===================
  const cardStyle: React.CSSProperties = {
    background: "var(--card, #fff)",
    border: "1px solid var(--line, #e5e7eb)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "var(--shadow-card, 0 8px 24px rgba(0,0,0,.06))",
    marginBottom: 14,
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  };

  const labelStyle: React.CSSProperties = { fontSize: 13, color: "var(--muted, #64748b)" };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid var(--line, #e5e7eb)",
    outline: "none",
    fontSize: 14,
    background: "#fff",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid transparent",
    background: "var(--primary, #1d4ed8)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  };

  const btnGhost: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid var(--line, #e5e7eb)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  };

  const scoreEligibleBoxBg = computed.eligibleForScore ? "rgba(16,185,129,.10)" : "rgba(239,68,68,.08)";

  return (
    <div style={{ padding: 16, maxWidth: 1040, margin: "0 auto" }}>
      {/* =================== KẾT QUẢ =================== */}
      <div
        style={{
          ...cardStyle,
          border: `2px solid ${finalTone.border}`,
          background: finalTone.bg,
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1, fontWeight: 900, color: "var(--muted,#64748b)" }}>
              PHÂN TẦNG NGUY CƠ TIM MẠCH (ESC/EAS)
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: finalTone.chipBg,
                  color: finalTone.chipText,
                  fontWeight: 950,
                  fontSize: 16,
                }}
              >
                {finalTone.tagVN}
              </span>
              <span style={{ color: "var(--muted,#64748b)", fontWeight: 800 }}>{finalTone.tagEN}</span>
              <span style={{ color: "var(--muted,#64748b)", fontWeight: 800 }}>• {computed.prevention}</span>

              {computed.hasAdjustment ? (
                <span style={{ color: "var(--muted,#64748b)", fontSize: 12 }}>
                  (điều chỉnh từ: <b>{computed.base}</b>)
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={btnPrimary} onClick={handleSave} disabled={!canSave || !activeCaseId}>
              Lưu vào ca
            </button>
            <button style={btnGhost} onClick={resetAll}>
              Reset
            </button>
          </div>
        </div>

        {/* Lý giải ngắn + LDL goal + Strategy */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid var(--line,#e5e7eb)",
              background: "rgba(255,255,255,.70)",
            }}
          >
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Lý giải ngắn gọn</div>
            {shortExplain.length ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {shortExplain.map((t, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: "var(--muted,#64748b)" }}>
                Chưa đủ dữ liệu. Hãy xác định ASCVD/bệnh nền; nếu phù hợp thì dùng SCORE và nhập %.
              </div>
            )}
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid var(--line,#e5e7eb)",
              background: "rgba(255,255,255,.70)",
            }}
          >
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Mục tiêu điều trị (LDL-C)</div>

            {ldlGoal ? (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid var(--line,#e5e7eb)",
                      fontWeight: 900,
                      fontSize: 12,
                      background: "white",
                    }}
                  >
                    {ldlGoal.classLabel}
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 950 }}>{ldlGoal.mmol} mmol/L</div>
                  <div style={{ color: "var(--muted,#64748b)", fontWeight: 800 }}>({ldlGoal.mgdl} mg/dL)</div>
                </div>

                {ldlGoal.extra ? <div style={{ marginTop: 8, fontWeight: 900 }}>{ldlGoal.extra}</div> : null}
                {ldlGoal.note ? (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted,#64748b)" }}>{ldlGoal.note}</div>
                ) : null}
              </>
            ) : (
              <div style={{ color: "var(--muted,#64748b)" }}>Chưa có mục tiêu LDL-C vì chưa phân tầng được nguy cơ.</div>
            )}

            {strategy ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Chiến lược can thiệp (theo LDL chưa điều trị)</div>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid",
                    ...badgeStyle(strategy.color),
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  {strategy.label}
                </span>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
                  (Nhập LDL-C “chưa điều trị” để gợi ý theo bảng can thiệp.)
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted,#64748b)" }}>
                (Chưa có gợi ý can thiệp vì chưa có LDL-C “chưa điều trị”.)
              </div>
            )}
          </div>
        </div>

        {!activeCaseId ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted,#64748b)" }}>
            (Chưa có ca active → tạo/chọn ca trước khi lưu)
          </div>
        ) : null}
      </div>

      {/* =================== 0) DỮ LIỆU TỐI THIỂU (SCORE) =================== */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>0) Chuẩn bị dữ liệu tối thiểu (khi cần SCORE2 / SCORE2-OP)</h3>

        <div style={grid2}>
          <div>
            <div style={labelStyle}>Tuổi (năm)</div>
            <input style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)} placeholder="vd: 55" inputMode="numeric" />
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              Gợi ý thang điểm: <b>{scoreSuggested}</b>
            </div>
          </div>

          <div>
            <div style={labelStyle}>Giới</div>
            <select style={inputStyle} value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">(chọn)</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div>
            <div style={labelStyle}>Huyết áp tâm thu (SBP, mmHg)</div>
            <input style={inputStyle} value={sbp} onChange={(e) => setSbp(e.target.value)} placeholder="vd: 128" inputMode="decimal" />
          </div>

          <div>
            <div style={labelStyle}>Hút thuốc hiện tại</div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
              <input type="checkbox" checked={smoking} onChange={(e) => setSmoking(e.target.checked)} />
              <span>Có hút thuốc</span>
            </label>
          </div>

          <div>
            <div style={labelStyle}>Huyết áp tâm trương (DBP, mmHg)</div>
            <input style={inputStyle} value={dbp} onChange={(e) => setDbp(e.target.value)} placeholder="vd: 78" inputMode="decimal" />
          </div>

          <div>
            <div style={labelStyle}>Cụm quốc gia (HeartScore)</div>
            <select style={inputStyle} value={countryCluster} onChange={(e) => setCountryCluster(e.target.value as CountryCluster)}>
              <option value="Nguy cơ thấp">Nguy cơ thấp</option>
              <option value="Nguy cơ trung bình">Nguy cơ trung bình</option>
              <option value="Nguy cơ cao">Nguy cơ cao</option>
              <option value="Nguy cơ rất cao">Nguy cơ rất cao</option>
            </select>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              (Dùng khi bạn tính trên HeartScore theo quốc gia/cụm nguy cơ.)
            </div>
          </div>

          <div>
            <div style={labelStyle}>Đơn vị lipid</div>
            <select style={inputStyle} value={lipidUnit} onChange={(e) => setLipidUnit(e.target.value as any)}>
              <option value="mmol/L">mmol/L</option>
              <option value="mg/dL">mg/dL</option>
            </select>
          </div>

          <div>
            <div style={labelStyle}>Đang dùng thuốc hạ lipid máu?</div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
              <input type="checkbox" checked={onLipidLowering} onChange={(e) => setOnLipidLowering(e.target.checked)} />
              <span>Statin / ezetimibe / PCSK9…</span>
            </label>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              Nếu đang dùng thuốc hạ lipid → <b>không dùng SCORE2/SCORE2-OP</b> để “tính lại”.
            </div>
          </div>

          <div>
            <div style={labelStyle}>Cholesterol toàn phần (TC)</div>
            <input
              style={inputStyle}
              value={tc}
              onChange={(e) => setTc(e.target.value)}
              placeholder={`vd: ${lipidUnit === "mmol/L" ? "5.2" : "200"}`}
              inputMode="decimal"
            />
          </div>

          <div>
            <div style={labelStyle}>HDL-C</div>
            <input
              style={inputStyle}
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              placeholder={`vd: ${lipidUnit === "mmol/L" ? "1.2" : "46"}`}
              inputMode="decimal"
            />
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              Non-HDL = TC − HDL {nonHdlDisplay ? <b>→ {nonHdlDisplay.mmol} mmol/L (~{nonHdlDisplay.mg} mg/dL)</b> : null}
            </div>
          </div>

          <div>
            <div style={labelStyle}>LDL-C (nếu có — ưu tiên “chưa điều trị”)</div>
            <input
              style={inputStyle}
              value={ldl}
              onChange={(e) => setLdl(e.target.value)}
              placeholder={`vd: ${lipidUnit === "mmol/L" ? "3.1" : "120"}`}
              inputMode="decimal"
            />
          </div>
        </div>
      </div>

      {/* =================== B1 ASCVD =================== */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Bước 1) ASCVD? (phòng ngừa thứ phát)</h3>
        <div style={{ color: "var(--muted,#64748b)", fontSize: 13, marginBottom: 10 }}>
          Nếu có ASCVD lâm sàng hoặc hình ảnh rõ ràng → gần như luôn xếp <b>nguy cơ RẤT CAO</b>.
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={ascvdClinical} onChange={(e) => setAscvdClinical(e.target.checked)} />
            <span>ASCVD lâm sàng (NMCT/ACS, bệnh mạch vành mạn, PCI/CABG; đột quỵ/TIA; PAD…)</span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={imagingSignificantPlaque}
              onChange={(e) => setImagingSignificantPlaque(e.target.checked)}
            />
            <span>Mảng xơ vữa “có ý nghĩa” trên hình ảnh (vd: hẹp &gt;50%/kết luận rõ)</span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={cacVeryHigh} onChange={(e) => setCacVeryHigh(e.target.checked)} />
            <span>Điểm vôi hóa ĐMV rất cao (vd: CAC ≥300 hoặc “rất cao” theo kết luận)</span>
          </label>
        </div>
      </div>

      {/* =================== B2 BỆNH NỀN ĐẨY THẲNG =================== */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Bước 2) Nếu chưa ASCVD: xét bệnh nền “đẩy thẳng” vào nhóm nguy cơ</h3>

        <div style={grid2}>
          {/* Diabetes */}
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>2A) Đái tháo đường</h4>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={diabetes} onChange={(e) => setDiabetes(e.target.checked)} />
              <span>Có đái tháo đường</span>
            </label>

            <div style={{ opacity: diabetes ? 1 : 0.5, pointerEvents: diabetes ? "auto" : "none" }}>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={labelStyle}>Típ</div>
                  <select style={inputStyle} value={dmType} onChange={(e) => setDmType(e.target.value as any)}>
                    <option value="">(chọn)</option>
                    <option value="T1DM">T1DM</option>
                    <option value="T2DM">T2DM</option>
                  </select>
                </div>

                <div>
                  <div style={labelStyle}>Thời gian mắc (năm)</div>
                  <input style={inputStyle} value={dmDuration} onChange={(e) => setDmDuration(e.target.value)} placeholder="vd: 8" inputMode="decimal" />
                </div>

                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={dmOrganDamage} onChange={(e) => setDmOrganDamage(e.target.checked)} />
                  <span>Tổn thương cơ quan đích (microalbumin niệu / võng mạc / thần kinh…)</span>
                </label>

                <div style={{ fontWeight: 900, marginTop: 6 }}>Yếu tố nguy cơ chính kèm theo</div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="checkbox" checked={dmRF_HTN} onChange={(e) => setDmRF_HTN(e.target.checked)} />
                    <span>Tăng huyết áp</span>
                  </label>
                  <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="checkbox" checked={dmRF_Smoke} onChange={(e) => setDmRF_Smoke(e.target.checked)} />
                    <span>Hút thuốc</span>
                  </label>
                  <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="checkbox" checked={dmRF_Dyslip} onChange={(e) => setDmRF_Dyslip(e.target.checked)} />
                    <span>Rối loạn lipid máu</span>
                  </label>
                  <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="checkbox" checked={dmRF_Obesity} onChange={(e) => setDmRF_Obesity(e.target.checked)} />
                    <span>Béo phì</span>
                  </label>
                </div>

                <div style={{ fontSize: 12, color: "var(--muted,#64748b)" }}>
                  Số yếu tố nguy cơ chính: <b>{dmRFCount}</b>
                </div>
              </div>
            </div>
          </div>

          {/* CKD + FH */}
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>2B/2C/2D) Thận – FH – Yếu tố đơn lẻ rất nặng</h4>

            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>eGFR (mL/phút/1.73m²)</div>
              <input style={inputStyle} value={egfr} onChange={(e) => setEgfr(e.target.value)} placeholder="vd: 65" inputMode="decimal" />
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
                &lt;30: Rất cao • 30–59: Cao • ≥60: không xếp theo CKD
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={familialHC} onChange={(e) => setFamilialHC(e.target.checked)} />
                <span>Tăng cholesterol máu gia đình (FH)</span>
              </label>

              <div style={{ opacity: familialHC ? 1 : 0.5, pointerEvents: familialHC ? "auto" : "none", marginTop: 8 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={fhWithMajorRF} onChange={(e) => setFhWithMajorRF(e.target.checked)} />
                  <span>FH + 1 yếu tố nguy cơ chính khác → nâng lên Rất cao</span>
                </label>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 12, border: "1px solid var(--line,#e5e7eb)", background: "rgba(0,0,0,.02)" }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Nhắc tiêu chí “yếu tố đơn lẻ rất nặng”</div>
              <div style={{ fontSize: 12, color: "var(--muted,#64748b)" }}>
                TC &gt;8.0 mmol/L (~&gt;310 mg/dL) hoặc LDL-C &gt;4.9 mmol/L (~&gt;190 mg/dL) hoặc HA ≥180/110.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================== B3 SCORE =================== */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Bước 3) Nếu không thuộc nhóm “xếp thẳng”: dùng SCORE2 / SCORE2-OP</h3>

        <div style={{ color: "var(--muted,#64748b)", fontSize: 13, marginBottom: 10 }}>
          Chỉ dùng SCORE khi: <b>không ASCVD</b>, <b>không ĐTĐ</b>, <b>không CKD</b>, <b>không FH</b>, và <b>không đang dùng thuốc hạ lipid</b>.
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line,#e5e7eb)",
            background: scoreEligibleBoxBg,
          }}
        >
          <b>Điều kiện dùng SCORE:</b> {computed.eligibleForScore ? "ĐỦ điều kiện" : "KHÔNG đủ điều kiện"}
          {computed.eligibleForScore && scoreMissing.length ? (
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              Thiếu dữ liệu tối thiểu: <b>{scoreMissing.join(", ")}</b>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>% nguy cơ 10 năm (SCORE2/SCORE2-OP)</div>
            <input
              style={inputStyle}
              value={scoreRiskPct}
              onChange={(e) => setScoreRiskPct(e.target.value)}
              placeholder="vd: 7.5"
              inputMode="decimal"
            />
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              &lt;2 Thấp • 2–&lt;10 Trung bình • 10–&lt;20 Cao • ≥20 Rất cao
            </div>
          </div>

          <div>
            <div style={labelStyle}>Mở SCORE (POP-UP trong trang này)</div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" style={btnGhost} onClick={() => openScoreModal((ageNum ?? 0) >= 70 ? "score2-op" : "score2")}>
                Mở SCORE2 / SCORE2-OP
              </button>

              <button
                type="button"
                style={{
                  ...btnGhost,
                  opacity: diabetes && dmType === "T2DM" ? 1 : 0.55,
                  cursor: diabetes && dmType === "T2DM" ? "pointer" : "not-allowed",
                }}
                onClick={() => openScoreModal("score2-diabetes")}
                disabled={!diabetes || dmType !== "T2DM"}
                title={!diabetes || dmType !== "T2DM" ? "Chỉ bật khi bệnh nhân T2DM" : ""}
              >
                Mở SCORE2-Diabetes (nếu T2DM)
              </button>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted,#64748b)" }}>
              POP-UP sẽ tự điền sẵn Tuổi / Giới / SBP / Hút thuốc / TC / HDL / Non-HDL từ trang phân tầng.
            </div>
          </div>
        </div>
      </div>

      {/* =================== B4 MODIFIERS =================== */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Bước 4) Tinh chỉnh (tái phân loại) bằng yếu tố điều chỉnh nguy cơ</h3>

        <div style={grid2}>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modFamilyHxEarly} onChange={(e) => setModFamilyHxEarly(e.target.checked)} />
              <span>Tiền sử gia đình bệnh tim mạch sớm</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modHighRiskEthnicity} onChange={(e) => setModHighRiskEthnicity(e.target.checked)} />
              <span>Sắc tộc nguy cơ cao (vd: Nam Á)</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modStress} onChange={(e) => setModStress(e.target.checked)} />
              <span>Căng thẳng kéo dài / stress</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modDeprivation} onChange={(e) => setModDeprivation(e.target.checked)} />
              <span>Thiếu thốn xã hội / điều kiện sống khó khăn</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modObesity} onChange={(e) => setModObesity(e.target.checked)} />
              <span>Béo phì</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modInactivity} onChange={(e) => setModInactivity(e.target.checked)} />
              <span>Ít vận động</span>
            </label>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modChronicInflamm} onChange={(e) => setModChronicInflamm(e.target.checked)} />
              <span>Bệnh viêm/tự miễn mạn</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={modSevereMentalIllness}
                onChange={(e) => setModSevereMentalIllness(e.target.checked)}
              />
              <span>Bệnh tâm thần nặng điều trị dài hạn</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modHIV} onChange={(e) => setModHIV(e.target.checked)} />
              <span>Nhiễm HIV</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modOSA} onChange={(e) => setModOSA(e.target.checked)} />
              <span>Ngưng thở khi ngủ do tắc nghẽn</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modFemaleRepro} onChange={(e) => setModFemaleRepro(e.target.checked)} />
              <span>Mãn kinh sớm / tiền sản giật / THA thai kỳ</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modHsCRP} onChange={(e) => setModHsCRP(e.target.checked)} />
              <span>hs-CRP tăng dai dẳng (&gt;2 mg/L)</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modLpa} onChange={(e) => setModLpa(e.target.checked)} />
              <span>Lipoprotein(a) tăng (&gt;50 mg/dL hoặc &gt;105 nmol/L)</span>
            </label>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--line,#e5e7eb)", margin: "14px 0" }} />

        <div style={grid2}>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modSubclinicalPlaque} onChange={(e) => setModSubclinicalPlaque(e.target.checked)} />
              <span>Có xơ vữa dưới lâm sàng trên hình ảnh (không rõ mức độ)</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={modCACRaised} onChange={(e) => setModCACRaised(e.target.checked)} />
              <span>CAC tăng (diễn giải thận trọng nếu đang dùng statin)</span>
            </label>
          </div>

          <div style={{ alignSelf: "center", color: "var(--muted,#64748b)", fontSize: 13 }}>
            Yếu tố điều chỉnh đã chọn: <b>{modifierCount}</b>
          </div>
        </div>
      </div>

      {/* =================== GIẢI THÍCH CHI TIẾT =================== */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Lý do / tiêu chí (chi tiết)</h3>

        {computed.reasons.length ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {computed.reasons.map((r, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {r}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: "var(--muted,#64748b)" }}>
            Chưa đủ dữ liệu để phân tầng. Hãy bắt đầu từ ASCVD và bệnh nền, sau đó mới dùng SCORE khi đủ điều kiện.
          </div>
        )}

        {computed.adjNotes.length ? (
          <>
            <div style={{ fontWeight: 900, margin: "12px 0 8px 0" }}>Tinh chỉnh / tái phân loại</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {computed.adjNotes.map((r, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {r}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div style={{ marginTop: 10, color: "var(--muted,#64748b)", fontSize: 12 }}>
          Công cụ hỗ trợ theo tiêu chí ESC/EAS, không thay thế quyết định lâm sàng.
        </div>
      </div>

      {/* =================== SCORE MODAL (PREFILL) =================== */}
      {scoreModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onMouseDown={closeScoreModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              maxHeight: "92vh",
              background: "var(--card,#fff)",
              borderRadius: 18,
              border: "1px solid var(--line,#e5e7eb)",
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--line,#e5e7eb)",
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 950, fontSize: 15 }}>
                  {scoreTab === "score2" ? "SCORE2" : scoreTab === "score2-op" ? "SCORE2-OP" : "SCORE2-Diabetes"}
                  <span style={{ marginLeft: 8, fontSize: 12, color: "var(--muted,#64748b)" }}>
                    (điền sẵn từ Phân tầng nguy cơ)
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted,#64748b)" }}>
                  Dữ liệu bên dưới đã lấy từ form chính. Bạn có thể sửa trực tiếp tại đây (sẽ cập nhật ngược lại).
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={scoreModalPct}
                  onChange={(e) => setScoreModalPct(e.target.value)}
                  placeholder="% nguy cơ 10 năm"
                  inputMode="decimal"
                  style={{
                    width: 170,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--line,#e5e7eb)",
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
                <button
                  type="button"
                  style={btnPrimary}
                  onClick={() => {
                    setScoreRiskPct(scoreModalPct);
                    closeScoreModal();
                  }}
                >
                  Áp dụng %
                </button>
                <button type="button" style={btnGhost} onClick={closeScoreModal} title="ESC để đóng">
                  Đóng
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--line,#e5e7eb)",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setScoreTab("score2")}
                style={{
                  ...btnGhost,
                  borderColor: scoreTab === "score2" ? "var(--primary,#1d4ed8)" : "var(--line,#e5e7eb)",
                  background: scoreTab === "score2" ? "rgba(29,78,216,.08)" : "#fff",
                }}
              >
                SCORE2 (&lt;70)
              </button>

              <button
                type="button"
                onClick={() => setScoreTab("score2-op")}
                style={{
                  ...btnGhost,
                  borderColor: scoreTab === "score2-op" ? "var(--primary,#1d4ed8)" : "var(--line,#e5e7eb)",
                  background: scoreTab === "score2-op" ? "rgba(29,78,216,.08)" : "#fff",
                }}
              >
                SCORE2-OP (≥70)
              </button>

              <button
                type="button"
                onClick={() => setScoreTab("score2-diabetes")}
                disabled={!diabetes || dmType !== "T2DM"}
                style={{
                  ...btnGhost,
                  opacity: !diabetes || dmType !== "T2DM" ? 0.5 : 1,
                  cursor: !diabetes || dmType !== "T2DM" ? "not-allowed" : "pointer",
                  borderColor: scoreTab === "score2-diabetes" ? "var(--primary,#1d4ed8)" : "var(--line,#e5e7eb)",
                  background: scoreTab === "score2-diabetes" ? "rgba(29,78,216,.08)" : "#fff",
                }}
                title={!diabetes || dmType !== "T2DM" ? "Chỉ bật khi bệnh nhân T2DM" : ""}
              >
                SCORE2-Diabetes
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 14, overflow: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={labelStyle}>Tuổi</div>
                  <input style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" />
                </div>

                <div>
                  <div style={labelStyle}>Giới</div>
                  <select style={inputStyle} value={sex} onChange={(e) => setSex(e.target.value)}>
                    <option value="">(chọn)</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <div style={labelStyle}>SBP (mmHg)</div>
                  <input style={inputStyle} value={sbp} onChange={(e) => setSbp(e.target.value)} inputMode="decimal" />
                </div>

                <div>
                  <div style={labelStyle}>Hút thuốc hiện tại</div>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
                    <input type="checkbox" checked={smoking} onChange={(e) => setSmoking(e.target.checked)} />
                    <span>Có hút thuốc</span>
                  </label>
                </div>

                <div>
                  <div style={labelStyle}>TC</div>
                  <input style={inputStyle} value={tc} onChange={(e) => setTc(e.target.value)} inputMode="decimal" />
                </div>

                <div>
                  <div style={labelStyle}>HDL-C</div>
                  <input style={inputStyle} value={hdl} onChange={(e) => setHdl(e.target.value)} inputMode="decimal" />
                </div>

                <div>
                  <div style={labelStyle}>Non-HDL (tự tính)</div>
                  <div
                    style={{
                      ...inputStyle,
                      background: "rgba(0,0,0,.03)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      fontWeight: 900,
                    }}
                  >
                    <span>{nonHdlDisplay ? `${nonHdlDisplay.mmol} mmol/L` : "—"}</span>
                    <span style={{ color: "var(--muted,#64748b)", fontWeight: 800 }}>
                      {nonHdlDisplay ? `~${nonHdlDisplay.mg} mg/dL` : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Cụm quốc gia (HeartScore)</div>
                  <select style={inputStyle} value={countryCluster} onChange={(e) => setCountryCluster(e.target.value as CountryCluster)}>
                    <option value="Nguy cơ thấp">Nguy cơ thấp</option>
                    <option value="Nguy cơ trung bình">Nguy cơ trung bình</option>
                    <option value="Nguy cơ cao">Nguy cơ cao</option>
                    <option value="Nguy cơ rất cao">Nguy cơ rất cao</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid var(--line,#e5e7eb)", background: "rgba(0,0,0,.02)" }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Cách dùng nhanh trong POP-UP</div>
                <ol style={{ margin: 0, paddingLeft: 18, color: "var(--text,#0f172a)" }}>
                  <li>Kiểm tra dữ liệu đã điền sẵn (Tuổi/Giới/SBP/Hút thuốc/Non-HDL).</li>
                  <li>Tính SCORE2/SCORE2-OP theo công cụ bạn dùng (HeartScore hoặc bảng/ứng dụng).</li>
                  <li>Nhập <b>% nguy cơ 10 năm</b> ở góc phải và bấm <b>Áp dụng %</b>.</li>
                </ol>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="https://www.escardio.org/Education/Practice-Tools/CVD-prevention-toolbox/HeartScore"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", ...btnGhost, display: "inline-flex", alignItems: "center" }}
                  >
                    Mở HeartScore ↗
                  </a>

                  <div style={{ fontSize: 12, color: "var(--muted,#64748b)", alignSelf: "center" }}>
                    (Bạn chọn SCORE2 hay SCORE2-OP theo tuổi: {ageNum !== undefined ? (ageNum >= 70 ? "SCORE2-OP" : "SCORE2") : "—"})
                  </div>
                </div>
              </div>

              {scoreTab === "score2-diabetes" ? (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted,#64748b)" }}>
                  Gợi ý: SCORE2-Diabetes dành cho T2DM (không ASCVD). Tại đây bạn cũng nhập % nguy cơ rồi “Áp dụng %”.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
