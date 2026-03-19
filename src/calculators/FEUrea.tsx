import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

function round2(x: number) {
  return Math.round(x * 100) / 100;
}

function interpret(value: number) {
  if (value < 35) return "FEUrea < 35%: gợi ý nguyên nhân trước thận trong bối cảnh phù hợp.";
  if (value <= 50) return "FEUrea 35–50%: vùng xám, cần phối hợp lâm sàng.";
  return "FEUrea > 50%: gợi ý tổn thương nhu mô thận trong bối cảnh phù hợp.";
}

export default function FEUrea() {
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

  const [urineUrea, setUrineUrea] = useState<number>(200);
  const [serumUrea, setSerumUrea] = useState<number>(20);
  const [urineCr, setUrineCr] = useState<number>(100);
  const [serumCr, setSerumCr] = useState<number>(2);

  const feurea = useMemo(() => {
    return (urineUrea * serumCr * 100) / (Math.max(serumUrea, 0.01) * Math.max(urineCr, 0.01));
  }, [urineUrea, serumUrea, urineCr, serumCr]);

  function reset() {
    setUrineUrea(200);
    setSerumUrea(20);
    setUrineCr(100);
    setSerumCr(2);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `FEUrea: ${round2(feurea)}%`;

    saveToActiveCase({
      tool: "feurea",
      summary,
      inputs: {
        urineUrea,
        serumUrea,
        urineCr,
        serumCr,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        feurea: round2(feurea),
        interpretation: interpret(feurea),
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="FEUrea"
      subtitle="Fractional Excretion of Urea"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Urea niệu">
            <input className="input" type="number" value={urineUrea} onChange={(e) => setUrineUrea(Number(e.target.value))} />
          </CalculatorSection>
          <CalculatorSection title="Urea máu">
            <input className="input" type="number" value={serumUrea} onChange={(e) => setSerumUrea(Number(e.target.value))} />
          </CalculatorSection>
          <CalculatorSection title="Creatinin niệu">
            <input className="input" type="number" value={urineCr} onChange={(e) => setUrineCr(Number(e.target.value))} />
          </CalculatorSection>
          <CalculatorSection title="Creatinin máu">
            <input className="input" type="number" value={serumCr} onChange={(e) => setSerumCr(Number(e.target.value))} />
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>FEUrea</div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>{round2(feurea)}</div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>%</div>

          <CalculatorSection title="Diễn giải" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>{interpret(feurea)}</div>
          </CalculatorSection>
        </CalculatorBox>
      }
      bottomNote="FEUrea thường hữu ích hơn FENa khi bệnh nhân đang dùng lợi tiểu."
    />
  );
}