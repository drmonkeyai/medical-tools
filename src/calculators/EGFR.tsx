// src/calculators/EGFR.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

type Sex = "female" | "male";

type Formula =
  | "ckd-epi-2021"
  | "ckd-epi-2009"
  | "mdrd-175"
  | "cockcroft-gault"
  | "schwartz-2009";

function clampNumber(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

function safePositive(x: number, fallback = 0.01) {
  if (!Number.isFinite(x)) return fallback;
  return Math.max(x, fallback);
}

/** CKD-EPI 2021 (Creatinine), race-free */
function egfrCkdEpi2021Creatinine(scrMgDl: number, age: number, sex: Sex) {
  const kappa = sex === "female" ? 0.7 : 0.9;
  const alpha = sex === "female" ? -0.241 : -0.302;
  const femaleFactor = sex === "female" ? 1.012 : 1;

  const ratio = scrMgDl / kappa;
  const minPart = Math.min(ratio, 1);
  const maxPart = Math.max(ratio, 1);

  return (
    142 *
    Math.pow(minPart, alpha) *
    Math.pow(maxPart, -1.2) *
    Math.pow(0.9938, age) *
    femaleFactor
  );
}

/** CKD-EPI 2009 (Creatinine) - bỏ hệ số chủng tộc */
function egfrCkdEpi2009Creatinine(scrMgDl: number, age: number, sex: Sex) {
  const kappa = sex === "female" ? 0.7 : 0.9;
  const alpha = sex === "female" ? -0.329 : -0.411;
  const femaleFactor = sex === "female" ? 1.018 : 1;

  const ratio = scrMgDl / kappa;
  const minPart = Math.min(ratio, 1);
  const maxPart = Math.max(ratio, 1);

  return (
    141 *
    Math.pow(minPart, alpha) *
    Math.pow(maxPart, -1.209) *
    Math.pow(0.993, age) *
    femaleFactor
  );
}

/** MDRD 175 */
function egfrMdrd175(scrMgDl: number, age: number, sex: Sex) {
  const femaleFactor = sex === "female" ? 0.742 : 1;
  return 175 * Math.pow(scrMgDl, -1.154) * Math.pow(age, -0.203) * femaleFactor;
}

/** Cockcroft-Gault (CrCl, mL/min) */
function crclCockcroftGault(scrMgDl: number, age: number, sex: Sex, weightKg: number) {
  const femaleFactor = sex === "female" ? 0.85 : 1;
  return (((140 - age) * weightKg) / (72 * scrMgDl)) * femaleFactor;
}

/** Schwartz 2009 bedside (trẻ em) */
function egfrSchwartz2009(heightCm: number, scrMgDl: number) {
  return 0.413 * (heightCm / scrMgDl);
}

function stageFromEgfr(egfr: number) {
  if (egfr >= 90) return { stage: "G1", text: "Bình thường / cao (≥90)" };
  if (egfr >= 60) return { stage: "G2", text: "Giảm nhẹ (60–89)" };
  if (egfr >= 45) return { stage: "G3a", text: "Giảm nhẹ–vừa (45–59)" };
  if (egfr >= 30) return { stage: "G3b", text: "Giảm vừa–nặng (30–44)" };
  if (egfr >= 15) return { stage: "G4", text: "Giảm nặng (15–29)" };
  return { stage: "G5", text: "Suy thận (<15)" };
}

function formulaTextForReport(formula: Formula) {
  switch (formula) {
    case "ckd-epi-2021":
      return "CKD-EPI 2021";
    case "ckd-epi-2009":
      return "CKD-EPI 2009";
    case "mdrd-175":
      return "MDRD 175";
    case "cockcroft-gault":
      return "Cockcroft–Gault (CrCl)";
    case "schwartz-2009":
      return "Schwartz 2009";
  }
}

function mapSexLabelToValue(sexLabel?: string): Sex {
  // Patient.sex trong context là "Nam" | "Nữ"
  if (!sexLabel) return "female";
  return sexLabel.toLowerCase().includes("nam") ? "male" : "female";
}

function calcAgeFromYob(yob?: number) {
  if (!yob || !Number.isFinite(yob)) return null;
  const y = new Date().getFullYear();
  const a = y - yob;
  if (!Number.isFinite(a)) return null;
  return clampNumber(a, 1, 120);
}

export default function EGFR() {
  const navigate = useNavigate();
  const casesApi = useCases();

  const activeCase = casesApi.activeCase;
  const openNewCaseModal = casesApi.openNewCaseModal;
  const saveToActiveCase = casesApi.saveToActiveCase;

  // ✅ SAFE: có thì gọi, không có thì fallback (tránh crash trắng trang)
  const activeCaseLabel =
    typeof (casesApi as any).getActiveCaseLabel === "function"
      ? (casesApi as any).getActiveCaseLabel({ compact: true, fallback: "Chưa chọn ca" })
      : activeCase
        ? `${activeCase.patient.name} • ${activeCase.patient.yob}`
        : "Chưa chọn ca";

  // ---- UI state ----
  const [formula, setFormula] = useState<Formula>("ckd-epi-2021");

  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState<number>(40);

  // Creatinine input
  const [scrUnit, setScrUnit] = useState<"mgdl" | "umol">("umol");
  const [scrValue, setScrValue] = useState<number>(80);

  // Extra inputs
  const [weightKg, setWeightKg] = useState<number>(60);
  const [heightCm, setHeightCm] = useState<number>(120);

  // ✅ Đồng bộ từ activeCase (chỉ set khi có dữ liệu hợp lý)
  useEffect(() => {
    if (!activeCase) return;

    const p = activeCase.patient;

    // Sex
    const mappedSex = mapSexLabelToValue(p.sex);
    setSex((prev) => (prev ? mappedSex : mappedSex));

    // Age từ yob
    const a = calcAgeFromYob(p.yob);
    if (a) setAge(a);

    // Weight/Height
    if (typeof p.weightKg === "number" && Number.isFinite(p.weightKg)) {
      setWeightKg(clampNumber(p.weightKg, 20, 250));
    }
    if (typeof p.heightCm === "number" && Number.isFinite(p.heightCm)) {
      setHeightCm(clampNumber(p.heightCm, 30, 220));
    }
  }, [activeCase?.id]); // chỉ chạy khi đổi ca

  const scrMgDl = useMemo(() => {
    const v = safePositive(scrValue, 0.01);
    if (scrUnit === "mgdl") return v;
    return v / 88.4; // umol -> mg/dL
  }, [scrUnit, scrValue]);

  const computed = useMemo(() => {
    const a = clampNumber(age, 1, 120);
    const scr = safePositive(scrMgDl, 0.01);

    if (formula === "ckd-epi-2021") {
      const egfr = egfrCkdEpi2021Creatinine(scr, a, sex);
      return {
        value: egfr,
        unit: "mL/phút/1.73m²",
        label: "eGFR (CKD-EPI 2021)",
        indexed: true as const,
      };
    }

    if (formula === "ckd-epi-2009") {
      const egfr = egfrCkdEpi2009Creatinine(scr, a, sex);
      return {
        value: egfr,
        unit: "mL/phút/1.73m²",
        label: "eGFR (CKD-EPI 2009)",
        indexed: true as const,
      };
    }

    if (formula === "mdrd-175") {
      const egfr = egfrMdrd175(scr, a, sex);
      return {
        value: egfr,
        unit: "mL/phút/1.73m²",
        label: "eGFR (MDRD 175)",
        indexed: true as const,
      };
    }

    if (formula === "cockcroft-gault") {
      const w = clampNumber(weightKg, 20, 250);
      const crcl = crclCockcroftGault(scr, a, sex, w);
      return {
        value: crcl,
        unit: "mL/phút",
        label: "CrCl (Cockcroft–Gault)",
        indexed: false as const,
      };
    }

    // schwartz-2009
    const h = clampNumber(heightCm, 30, 220);
    const egfr = egfrSchwartz2009(h, scr);
    return {
      value: egfr,
      unit: "mL/phút/1.73m²",
      label: "eGFR (Schwartz 2009 – trẻ em)",
      indexed: true as const,
    };
  }, [formula, age, sex, scrMgDl, weightKg, heightCm]);

  const valueDisplay = useMemo(
    () => round1(safePositive(computed.value, 0)),
    [computed.value]
  );

  const stage = useMemo(() => {
    if (!computed.indexed) return null;
    return stageFromEgfr(computed.value);
  }, [computed]);

  const reset = () => {
    setFormula("ckd-epi-2021");
    // giữ đồng bộ từ ca nếu đang có ca: reset creatinine thôi sẽ hợp lý hơn
    setScrUnit("umol");
    setScrValue(80);

    // reset phụ thuộc công thức
    setWeightKg(activeCase?.patient.weightKg ?? 60);
    setHeightCm(activeCase?.patient.heightCm ?? 120);

    // sex/age lấy theo ca nếu có, không thì default
    setSex(activeCase ? mapSexLabelToValue(activeCase.patient.sex) : "female");
    setAge(activeCase ? (calcAgeFromYob(activeCase.patient.yob) ?? 40) : 40);
  };

  const onSaveToCase = () => {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const when = new Date().toISOString();

    const scrUmol = scrUnit === "umol" ? scrValue : scrValue * 88.4;
    const scrMg = scrUnit === "mgdl" ? scrValue : scrValue / 88.4;

    const reportFormulaText = formulaTextForReport(formula);
    const isCockcroft = formula === "cockcroft-gault";
    const isSchwartz = formula === "schwartz-2009";

    const outValue = round1(computed.value);
    const unitText = computed.unit;

    const summary = computed.indexed
      ? `eGFR: ${outValue} ${unitText}${stage?.stage ? ` • ${stage.stage}` : ""}`
      : `CrCl: ${outValue} ${unitText}`;

    saveToActiveCase({
      tool: "egfr",
      summary,
      inputs: {
        formula,
        sex,
        age,
        scrUnit,
        scrValue: round1(scrValue),
        scrUmol: round1(scrUmol),
        scrMgDl: round1(scrMg),
        weightKg: isCockcroft ? round1(weightKg) : undefined,
        heightCm: isSchwartz ? round1(heightCm) : undefined,
        // thêm label ca để trace (optional)
        caseLabel: activeCaseLabel,
      },
      outputs: {
        value: outValue,
        unit: unitText,
        indexed: computed.indexed,
        stage: stage?.stage,
        stageText: stage?.text,
        creatinineText: `${round1(scrUmol)} µmol/L (${round1(scrMg)} mg/dL)`,
        formulaText: reportFormulaText,
        when,
      },
    });

    alert("Đã lưu vào ca ✅");
  };

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate(-1)}
              className="btn"
              type="button"
            >
              ← Trở về
            </button>

            <div>
              <h1 className="pageTitle" style={{ fontSize: 20, margin: 0 }}>
                Mức lọc cầu thận / Độ thanh thải
              </h1>
              <div style={{ marginTop: 4, color: "var(--muted)" }}>
                Chọn công thức và nhập thông số
              </div>
              <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                Ca đang chọn: <b>{activeCaseLabel}</b>
              </div>
              {!activeCase && (
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                  Chưa có ca đang chọn. Bạn có thể bấm <b>Lưu vào ca</b> để tạo ca mới.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={reset} className="btn" type="button">
              Reset
            </button>

            <button onClick={onSaveToCase} className="btnPrimary" type="button">
              Lưu vào ca
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          Lưu ý: Cockcroft–Gault (CrCl) thường dùng để chỉnh liều thuốc; các eGFR chuẩn hoá theo 1.73m² dùng phân tầng G. Công cụ tham khảo.
        </div>
      </div>

      <div className="grid">
        {/* Inputs */}
        <div className="card" style={{ gridColumn: "span 7" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Nhập dữ liệu</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {/* Formula */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>Công thức</div>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as Formula)}
                className="select"
                style={{ minWidth: 280 }}
              >
                <option value="ckd-epi-2021">CKD-EPI 2021 (Creatinin) – race-free</option>
                <option value="ckd-epi-2009">CKD-EPI 2009 (Creatinin)</option>
                <option value="mdrd-175">MDRD 175 (IDMS)</option>
                <option value="cockcroft-gault">Cockcroft–Gault (CrCl – chỉnh liều)</option>
                <option value="schwartz-2009">Schwartz 2009 (trẻ em)</option>
              </select>
            </div>

            {/* Sex */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>Giới</div>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="select"
                style={{ minWidth: 160 }}
              >
                <option value="female">Nữ</option>
                <option value="male">Nam</option>
              </select>
            </div>

            {/* Age */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>Tuổi</div>
              <input
                type="number"
                value={age}
                min={1}
                max={120}
                onChange={(e) => setAge(Number(e.target.value))}
                className="input"
                style={{ minWidth: 160 }}
              />
            </div>

            {/* Extra: weight for Cockcroft-Gault */}
            {formula === "cockcroft-gault" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "white",
                }}
              >
                <div style={{ fontWeight: 900 }}>Cân nặng (kg)</div>
                <input
                  type="number"
                  value={weightKg}
                  min={20}
                  max={250}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="input"
                  style={{ minWidth: 160 }}
                />
              </div>
            )}

            {/* Extra: height for Schwartz */}
            {formula === "schwartz-2009" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "white",
                }}
              >
                <div style={{ fontWeight: 900 }}>Chiều cao (cm)</div>
                <input
                  type="number"
                  value={heightCm}
                  min={30}
                  max={220}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="input"
                  style={{ minWidth: 160 }}
                />
              </div>
            )}

            {/* Creatinine */}
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 900 }}>Creatinin huyết thanh</div>

                <select
                  value={scrUnit}
                  onChange={(e) => setScrUnit(e.target.value as "mgdl" | "umol")}
                  className="select"
                  style={{ minWidth: 160 }}
                >
                  <option value="umol">µmol/L</option>
                  <option value="mgdl">mg/dL</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  Nhập theo đơn vị bạn chọn
                </div>

                <input
                  type="number"
                  value={scrValue}
                  min={0}
                  step="0.1"
                  onChange={(e) => setScrValue(Number(e.target.value))}
                  className="input"
                  style={{ minWidth: 160 }}
                />
              </div>

              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Quy đổi nội bộ: 1 mg/dL ≈ 88.4 µmol/L • Giá trị dùng tính:{" "}
                <b>{round1(scrMgDl)}</b> mg/dL
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Kết quả</h2>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>
                {computed.label}
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                {valueDisplay}
              </div>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              {computed.unit}
              {!computed.indexed && <span> • (không chuẩn hoá 1.73m²)</span>}
            </div>

            {computed.indexed && stage && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  background: "rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ fontWeight: 900 }}>Phân tầng (G stage)</div>
                <div style={{ marginTop: 6 }}>
                  <b>{stage.stage}</b> — {stage.text}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                  Chẩn đoán CKD cần kết hợp thời gian (≥3 tháng) và/hoặc albumin niệu (A1–A3), lâm sàng.
                </div>
              </div>
            )}

            {!computed.indexed && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  background: "rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ fontWeight: 900 }}>Gợi ý sử dụng</div>
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  Cockcroft–Gault thường dùng để <b>chỉnh liều thuốc</b>. Không dùng để phân tầng G theo KDIGO.
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            ⚠️ Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
          </div>
        </div>
      </div>
    </div>
  );
}
