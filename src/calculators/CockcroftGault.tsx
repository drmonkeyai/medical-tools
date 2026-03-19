import { useEffect, useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

type Sex = "male" | "female";
type ScrUnit = "mgdl" | "umol";

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

function mapSexLabelToValue(sexLabel?: string): Sex {
  if (!sexLabel) return "male";
  return sexLabel.toLowerCase().includes("nam") ? "male" : "female";
}

function calcAgeFromYob(yob?: number) {
  if (!yob) return 40;
  return Math.max(1, new Date().getFullYear() - yob);
}

export default function CockcroftGault() {
  const casesApi = useCases();
  const activeCase = casesApi.activeCase;
  const openNewCaseModal = casesApi.openNewCaseModal;
  const saveToActiveCase = casesApi.saveToActiveCase;

  const activeCaseLabel =
    typeof (casesApi as any).getActiveCaseLabel === "function"
      ? (casesApi as any).getActiveCaseLabel({ compact: true, fallback: "Chưa chọn ca" })
      : activeCase
        ? `${activeCase.patient.name} • ${activeCase.patient.yob}`
        : "Chưa chọn ca";

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(40);
  const [weightKg, setWeightKg] = useState<number>(60);
  const [scrUnit, setScrUnit] = useState<ScrUnit>("umol");
  const [scrValue, setScrValue] = useState<number>(80);

  useEffect(() => {
    if (!activeCase) return;
    setSex(mapSexLabelToValue(activeCase.patient.sex));
    setAge(calcAgeFromYob(activeCase.patient.yob));
    if (typeof activeCase.patient.weightKg === "number") setWeightKg(activeCase.patient.weightKg);
  }, [activeCase?.id]);

  const scrMgDl = useMemo(() => (scrUnit === "mgdl" ? scrValue : scrValue / 88.4), [scrUnit, scrValue]);

  const crcl = useMemo(() => {
    const sexFactor = sex === "female" ? 0.85 : 1;
    return (((140 - age) * weightKg) / (72 * Math.max(scrMgDl, 0.01))) * sexFactor;
  }, [age, weightKg, scrMgDl, sex]);

  function reset() {
    setSex(activeCase ? mapSexLabelToValue(activeCase.patient.sex) : "male");
    setAge(activeCase ? calcAgeFromYob(activeCase.patient.yob) : 40);
    setWeightKg(activeCase?.patient.weightKg ?? 60);
    setScrUnit("umol");
    setScrValue(80);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `CrCl Cockcroft–Gault: ${round1(crcl)} mL/phút`;

    saveToActiveCase({
      tool: "cockcroft-gault",
      summary,
      inputs: {
        sex,
        age,
        weightKg: round1(weightKg),
        scrUnit,
        scrValue: round1(scrValue),
        scrMgDl: round1(scrMgDl),
        caseLabel: activeCaseLabel,
      },
      outputs: {
        crcl: round1(crcl),
        unit: "mL/phút",
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="ClCr – Cockcroft–Gault"
      subtitle="Ước tính độ thanh thải creatinin"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      topNote="Cockcroft–Gault thường được dùng để chỉnh liều thuốc."
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Giới">
            <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </CalculatorSection>

          <CalculatorSection title="Tuổi">
            <input className="input" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </CalculatorSection>

          <CalculatorSection title="Cân nặng (kg)">
            <input className="input" type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
          </CalculatorSection>

          <CalculatorSection title="Đơn vị creatinin">
            <select className="select" value={scrUnit} onChange={(e) => setScrUnit(e.target.value as ScrUnit)}>
              <option value="umol">µmol/L</option>
              <option value="mgdl">mg/dL</option>
            </select>
          </CalculatorSection>

          <CalculatorSection title={`Creatinin (${scrUnit === "umol" ? "µmol/L" : "mg/dL"})`}>
            <input className="input" type="number" value={scrValue} onChange={(e) => setScrValue(Number(e.target.value))} />
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>CrCl</div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>{round1(crcl)}</div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>mL/phút</div>

          <CalculatorSection title="Gợi ý" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>Thường dùng để hỗ trợ chỉnh liều thuốc hơn là phân tầng CKD theo KDIGO.</div>
          </CalculatorSection>
        </CalculatorBox>
      }
    />
  );
}