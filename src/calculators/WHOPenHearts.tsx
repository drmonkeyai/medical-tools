// src/calculators/WHOPenHearts.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

import {
  riskToBand,
  whoSeaRiskBmi,
  whoSeaRiskLab,
  type WhoRiskBand,
} from "./who/whoCvdSea";

type Sex = "male" | "female";

function toNum(v: string): number {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

type RiskGate = "emergency" | "veryHigh" | "chart";

type WhoCvdResult = {
  gate: RiskGate;
  veryHighReasons?: string[];
  risk10yPct?: number;
  riskBand?: WhoRiskBand;
  hasLab: boolean;
  recommendations: {
    lifestyle: string[];
    bpMeds: { decision: "yes" | "consider" | "no"; reason: string };
    statin: { decision: "yes" | "consider" | "no"; reason: string };
    aspirin: { decision: "secondary-only"; reason: string };
    followUp: string;
    referWhen: string[];
    notes: string[];
  };
};

export default function WHOPenHearts() {
  const nav = useNavigate();
  const cases = useCases() as any;

  // ---------- INPUTS ----------
  const [age, setAge] = useState("55");
  const [sex, setSex] = useState<Sex>("male");
  const [smoker, setSmoker] = useState(false);
  const [diabetes, setDiabetes] = useState(false);

  const [sbp, setSbp] = useState("140");
  const [dbp, setDbp] = useState("90");
  const [bpConfirmed, setBpConfirmed] = useState(true);

  const [hasLab, setHasLab] = useState(true);
  const [tc, setTc] = useState("5.2"); // mmol/L
  const [heightCm, setHeightCm] = useState("165");
  const [weightKg, setWeightKg] = useState("70");
  const [bmiManual, setBmiManual] = useState("");

  // Gates / high-risk
  const [emergency, setEmergency] = useState(false);
  const [knownASCVD, setKnownASCVD] = useState(false);
  const [dmComplicationOrCKD, setDmComplicationOrCKD] = useState(false);
  const [ckdModerateSevere, setCkdModerateSevere] = useState(false);
  const [veryHighLipids, setVeryHighLipids] = useState(false);
  const [targetOrganDamage, setTargetOrganDamage] = useState(false);

  const [startingOrAdjustingMeds, setStartingOrAdjustingMeds] =
    useState(false);

  const bmi = useMemo(() => {
    const bmiM = toNum(bmiManual);
    if (Number.isFinite(bmiM)) return bmiM;
    const h = toNum(heightCm) / 100;
    const w = toNum(weightKg);
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0) return NaN;
    return w / (h * h);
  }, [bmiManual, heightCm, weightKg]);

  const result: WhoCvdResult = useMemo(() => {
    const A = toNum(age);
    const SBP = toNum(sbp);
    const DBP = toNum(dbp);
    const TC = toNum(tc);

    const reasons: string[] = [];
    const severeHTN =
      (Number.isFinite(SBP) && SBP >= 180) ||
      (Number.isFinite(DBP) && DBP >= 110) ||
      targetOrganDamage;

    if (knownASCVD)
      reasons.push("ASCVD xác định → phòng ngừa thứ phát");
    if (severeHTN)
      reasons.push("THA rất nặng (hoặc tổn thương cơ quan đích)");
    if (dmComplicationOrCKD)
      reasons.push("ĐTĐ kèm biến chứng / kèm CKD rõ");
    if (veryHighLipids) reasons.push("Rối loạn lipid rất nặng");
    if (ckdModerateSevere)
      reasons.push("CKD trung bình–nặng (ví dụ eGFR <60 / albumin niệu cao)");

    const lifestyle = [
      "Bỏ thuốc lá (có thể phối hợp hỗ trợ cai thuốc nếu có)",
      "Ăn lành mạnh: giảm muối, giảm chất béo bão hòa/trans, tăng rau quả",
      "Vận động đều đặn; giảm cân nếu thừa cân/béo phì",
      "Hạn rượu; ngủ đủ; quản lý stress",
    ];

    const referWhen = [
      "Nghi ACS/đột quỵ/TIA hoặc triệu chứng cấp cứu",
      "THA kháng trị hoặc không kiểm soát sau tối ưu tại tuyến cơ sở",
      "Rối loạn lipid rất nặng, nghi bệnh lý di truyền",
      "CKD/ĐTĐ có biến chứng cần đánh giá chuyên sâu",
    ];

    // Gate 1: emergency
    if (emergency) {
      return {
        gate: "emergency",
        hasLab,
        recommendations: {
          lifestyle,
          bpMeds: {
            decision: "no",
            reason: "Ưu tiên xử trí cấp cứu / chuyển tuyến ngay.",
          },
          statin: {
            decision: "no",
            reason: "Ưu tiên xử trí cấp cứu / chuyển tuyến ngay.",
          },
          aspirin: {
            decision: "secondary-only",
            reason: "Không dùng thường quy trong dự phòng tiên phát.",
          },
          followUp: "Chuyển cấp cứu / tuyến trên ngay.",
          referWhen,
          notes: [
            "Có dấu hiệu cấp cứu → không áp dụng chart; xử trí theo phác đồ cấp cứu.",
          ],
        },
      };
    }

    // Gate 2: very high risk (no chart needed)
    if (reasons.length > 0) {
      return {
        gate: "veryHigh",
        veryHighReasons: reasons,
        hasLab,
        recommendations: {
          lifestyle,
          bpMeds: {
            decision: "yes",
            reason:
              "Nhóm rất cao/thứ phát: đa số cần thuốc kiểm soát HA theo mục tiêu cá thể hóa.",
          },
          statin: {
            decision: "yes",
            reason:
              "Nhóm rất cao/thứ phát: ưu tiên statin cường độ phù hợp/đủ mạnh (nếu không chống chỉ định).",
          },
          aspirin: {
            decision: "secondary-only",
            reason:
              "Aspirin thường chỉ cân nhắc trong phòng ngừa thứ phát theo chỉ định.",
          },
          followUp:
            "Hẹn tái khám 2–4 tuần; cân nhắc chuyển tuyến nếu kiểm soát khó.",
          referWhen,
          notes: [
            "Không cần tính chart khi đã thuộc nhóm rất cao theo tiêu chí lâm sàng/bệnh nền.",
          ],
        },
      };
    }

    // Step 3: calculate WHO risk (SEA)
    const riskPct = hasLab
      ? whoSeaRiskLab({
          sex,
          smoker,
          diabetes,
          ageYears: A,
          sbp: SBP,
          tcMmolL: TC,
        })
      : whoSeaRiskBmi({
          sex,
          smoker,
          ageYears: A,
          sbp: SBP,
          bmi,
        });

    const band = riskToBand(riskPct);

    // Rules (PEN/HEARTS - practical)
    const risk20 = riskPct >= 20;
    const risk10 = riskPct >= 10 && riskPct < 20;
    const risk5 = riskPct >= 5 && riskPct < 10;

    // BP meds decision (needs “confirmed/persistent” flag)
    let bpDecision: "yes" | "consider" | "no" = "no";
    let bpReason =
      "Chưa đủ điều kiện/không cần thuốc hạ HA theo ngưỡng gợi ý.";
    const bp13080 = (SBP >= 130 || DBP >= 80) && bpConfirmed;
    const bp14090 = (SBP >= 140 || DBP >= 90) && bpConfirmed;

    if (risk20 && bp13080) {
      bpDecision = "yes";
      bpReason =
        "Nguy cơ ≥20% và HA kéo dài ≥130/80 → cân nhắc/khởi trị thuốc hạ HA.";
    } else if (risk10 && bp14090) {
      bpDecision = "yes";
      bpReason =
        "Nguy cơ 10–<20% và HA kéo dài ≥140/90 → cân nhắc/khởi trị thuốc hạ HA.";
    } else if (risk5 && bp14090) {
      bpDecision = "consider";
      bpReason =
        "Nguy cơ 5–<10% và HA kéo dài ≥140/90 → cân nhắc theo chính sách/nguồn lực.";
    }

    // Statin decision
    let statinDecision: "yes" | "consider" | "no" = "no";
    let statinReason =
      "Chưa đủ điều kiện/không ưu tiên statin theo quy tắc đơn giản hóa.";
    if (risk20) {
      statinDecision = "yes";
      statinReason =
        "Nguy cơ ≥20% → ưu tiên khởi trị statin nếu không chống chỉ định.";
    } else if (diabetes && A >= 40) {
      statinDecision = "yes";
      statinReason =
        "ĐTĐ (đặc biệt ≥40 tuổi) → ưu tiên statin theo thực hành tuyến cơ sở.";
    } else if (risk10) {
      statinDecision = "consider";
      statinReason =
        "Nguy cơ 10–<20% → cân nhắc statin theo nguồn lực và “risk enhancers”.";
    }

    // Follow up
    let followUp = "Tái khám 6–12 tháng.";
    if (risk20 || startingOrAdjustingMeds) {
      followUp =
        "Nguy cơ ≥20% hoặc đang chỉnh thuốc: tái khám 2–4 tuần (HA) / 6–12 tuần (lipid).";
    } else if (risk10) {
      followUp = "Nguy cơ 10–<20%: tái khám 1–3 tháng.";
    } else if (risk5) {
      followUp = "Nguy cơ 5–<10%: tái khám 3–6 tháng (tùy bối cảnh).";
    }

    const notes: string[] = [];
    if (!bpConfirmed) {
      notes.push(
        "HA chưa được xác nhận/kéo dài: nên đo lặp lại và/hoặc tái khám để xác nhận chẩn đoán THA."
      );
    }
    if (!hasLab) {
      notes.push(
        "Đang dùng chart không xét nghiệm (BMI-based). Nếu có điều kiện, có thể chuyển sang chart có xét nghiệm (TC)."
      );
    }

    return {
      gate: "chart",
      hasLab,
      risk10yPct: riskPct,
      riskBand: band,
      recommendations: {
        lifestyle,
        bpMeds: { decision: bpDecision, reason: bpReason },
        statin: { decision: statinDecision, reason: statinReason },
        aspirin: {
          decision: "secondary-only",
          reason: "Không dùng aspirin thường quy trong dự phòng tiên phát.",
        },
        followUp,
        referWhen,
        notes,
      },
    };
  }, [
    age,
    sex,
    smoker,
    diabetes,
    sbp,
    dbp,
    bpConfirmed,
    hasLab,
    tc,
    bmi,
    emergency,
    knownASCVD,
    dmComplicationOrCKD,
    ckdModerateSevere,
    veryHighLipids,
    targetOrganDamage,
    startingOrAdjustingMeds,
  ]);

  const summary = useMemo(() => {
    if (result.gate === "emergency")
      return "WHO PEN/HEARTS: CẤP CỨU → chuyển tuyến ngay";
    if (result.gate === "veryHigh")
      return "WHO PEN/HEARTS: NHÓM RẤT CAO (không cần chart)";
    const pct = result.risk10yPct ?? NaN;
    const band = result.riskBand ?? "10–<20%";
    const stat = result.recommendations.statin.decision.toUpperCase();
    return `WHO CVD 10y: ${pct}% (${band}) • Statin: ${stat}`;
  }, [result]);

  const onSave = () => {
    const saveFn =
      cases?.saveToActiveCase ??
      cases?.saveToolResult ??
      cases?.saveResultToActiveCase;

    const openNewCase =
      cases?.openNewCaseModal ??
      cases?.openCreateCaseModal ??
      cases?.openNewCase;

    if (typeof saveFn !== "function") {
      alert(
        "Không tìm thấy hàm lưu vào ca trong CasesContext. Bạn cần map đúng tên hàm save trong context."
      );
      return;
    }

    const activeCaseId = cases?.activeCaseId ?? cases?.activeCase?.id;

    if (!activeCaseId && typeof openNewCase === "function") {
      openNewCase();
      return;
    }

    const inputs = {
      age: toNum(age),
      sex,
      smoker,
      diabetes,
      sbp: toNum(sbp),
      dbp: toNum(dbp),
      bpConfirmed,
      hasLab,
      tcMmolL: toNum(tc),
      heightCm: toNum(heightCm),
      weightKg: toNum(weightKg),
      bmi: Number.isFinite(bmi) ? round1(bmi) : null,
      emergency,
      knownASCVD,
      dmComplicationOrCKD,
      ckdModerateSevere,
      veryHighLipids,
      targetOrganDamage,
      startingOrAdjustingMeds,
    };

    const payload = {
      tool: "who-pen-hearts",
      summary,
      inputs,
      outputs: {
        when: new Date().toISOString(),
        ...result,
      },
    };

    saveFn(payload);
    alert("Đã lưu vào ca hiện tại.");
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--line)",
    borderRadius: 16,
    boxShadow: "var(--shadow-card)",
    padding: 16,
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "var(--muted)",
    marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid var(--line)",
    background: "#fff",
    outline: "none",
  };

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
            WHO PEN/HEARTS – Phân tầng nguy cơ tim mạch
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            WHO CVD risk chart (Southeast Asia) + gợi ý can thiệp tối thiểu.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => nav("/tools")}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            ← Danh sách công cụ
          </button>
          <button
            onClick={onSave}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--primary)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Lưu vào ca
          </button>
        </div>
      </div>

      {/* GATES */}
      <div style={{ ...cardStyle, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          1) Gate: Loại trừ cấp cứu & nhóm “rất cao”
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={emergency}
              onChange={(e) => setEmergency(e.target.checked)}
            />
            <span>
              <b>Có dấu hiệu cấp cứu</b> (đau ngực nghi ACS, đột quỵ, khó thở
              cấp, ngất, thiếu máu chi…)
            </span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={knownASCVD}
              onChange={(e) => setKnownASCVD(e.target.checked)}
            />
            <span>
              <b>ASCVD xác định</b> (NMCT/đột quỵ/ĐMV/PAD/PCI/CABG…)
            </span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={dmComplicationOrCKD}
              onChange={(e) => setDmComplicationOrCKD(e.target.checked)}
            />
            <span>
              <b>ĐTĐ kèm biến chứng / CKD rõ</b>
            </span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={ckdModerateSevere}
              onChange={(e) => setCkdModerateSevere(e.target.checked)}
            />
            <span>
              <b>CKD trung bình–nặng</b> (ví dụ eGFR &lt;60 / albumin niệu cao)
            </span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={veryHighLipids}
              onChange={(e) => setVeryHighLipids(e.target.checked)}
            />
            <span>
              <b>Lipid rất nặng</b> (ví dụ TC ≥8 mmol/L hoặc LDL rất cao)
            </span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={targetOrganDamage}
              onChange={(e) => setTargetOrganDamage(e.target.checked)}
            />
            <span>
              <b>Tổn thương cơ quan đích do THA</b>
            </span>
          </label>
        </div>
      </div>

      {/* INPUTS */}
      <div style={{ ...cardStyle, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          2) Biến số để tính WHO risk chart
        </div>

        <div style={grid2}>
          <div>
            <div style={labelStyle}>Tuổi (năm)</div>
            <input
              style={inputStyle}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div>
            <div style={labelStyle}>Giới</div>
            <select
              style={inputStyle}
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={smoker}
              onChange={(e) => setSmoker(e.target.checked)}
            />
            Hút thuốc hiện tại
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={diabetes}
              onChange={(e) => setDiabetes(e.target.checked)}
            />
            Đái tháo đường (chọn chart “People with Diabetes”)
          </label>
        </div>

        <div style={{ ...grid2, marginTop: 10 }}>
          <div>
            <div style={labelStyle}>HA tâm thu SBP (mmHg)</div>
            <input
              style={inputStyle}
              value={sbp}
              onChange={(e) => setSbp(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div>
            <div style={labelStyle}>HA tâm trương DBP (mmHg)</div>
            <input
              style={inputStyle}
              value={dbp}
              onChange={(e) => setDbp(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={bpConfirmed}
              onChange={(e) => setBpConfirmed(e.target.checked)}
            />
            HA đã xác nhận/kéo dài (đo lặp lại/tái khám)
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={startingOrAdjustingMeds}
              onChange={(e) =>
                setStartingOrAdjustingMeds(e.target.checked)
              }
            />
            Đang khởi trị/chỉnh thuốc
          </label>
        </div>

        <div
          style={{
            marginTop: 12,
            borderTop: "1px dashed var(--line)",
            paddingTop: 12,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="radio"
                checked={hasLab}
                onChange={() => setHasLab(true)}
              />
              Có xét nghiệm TC (lab-based)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="radio"
                checked={!hasLab}
                onChange={() => setHasLab(false)}
              />
              Không xét nghiệm (BMI-based)
            </label>
          </div>

          {hasLab ? (
            <div style={{ marginTop: 10, maxWidth: 360 }}>
              <div style={labelStyle}>Cholesterol toàn phần – TC (mmol/L)</div>
              <input
                style={inputStyle}
                value={tc}
                onChange={(e) => setTc(e.target.value)}
                inputMode="decimal"
              />
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <div style={labelStyle}>Chiều cao (cm)</div>
                  <input
                    style={inputStyle}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <div style={labelStyle}>Cân nặng (kg)</div>
                  <input
                    style={inputStyle}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <div style={labelStyle}>BMI (nhập tay – tuỳ chọn)</div>
                  <input
                    style={inputStyle}
                    value={bmiManual}
                    onChange={(e) => setBmiManual(e.target.value)}
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                BMI tính được:{" "}
                <b>{Number.isFinite(bmi) ? round1(bmi) : "—"}</b> kg/m²
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Kết quả</div>

        <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
          {summary}
        </div>

        {result.gate === "chart" && (
          <div style={{ marginTop: 10 }}>
            WHO CVD risk 10 năm: <b>{result.risk10yPct}%</b> •{" "}
            <b>{result.riskBand}</b>
          </div>
        )}

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Lối sống</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {result.recommendations.lifestyle.map((x) => (
                <li key={x} style={{ margin: "4px 0" }}>{x}</li>
              ))}
            </ul>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Thuốc – gợi ý</div>
            <div style={{ marginBottom: 8 }}>
              <b>Hạ huyết áp:</b> <b>{result.recommendations.bpMeds.decision}</b>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                {result.recommendations.bpMeds.reason}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Statin:</b> <b>{result.recommendations.statin.decision}</b>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                {result.recommendations.statin.reason}
              </div>
            </div>
            <div>
              <b>Aspirin:</b> {result.recommendations.aspirin.reason}
            </div>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Tái khám</div>
            <div>{result.recommendations.followUp}</div>
            {result.recommendations.notes.length > 0 && (
              <>
                <div style={{ fontWeight: 800, marginTop: 10, marginBottom: 6 }}>Ghi chú</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {result.recommendations.notes.map((x) => (
                    <li key={x} style={{ margin: "4px 0" }}>{x}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Chuyển tuyến khi</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {result.recommendations.referWhen.map((x) => (
                <li key={x} style={{ margin: "4px 0" }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng. WHO SEA chart áp dụng 40–74 tuổi; ngoài khoảng này sẽ “kẹp” về nhóm gần nhất.
        </div>
      </div>
    </div>
  );
}
