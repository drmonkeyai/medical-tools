import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/CalculatorTemplate";

function round2(x: number) {
  return Math.round(x * 100) / 100;
}

function interpret(value: number) {
  if (value < 1) return "FENa < 1%: gợi ý giảm tưới máu thận / nguyên nhân trước thận trong bối cảnh phù hợp.";
  if (value <= 2) return "FENa 1–2%: vùng xám, cần phối hợp lâm sàng.";
  return "FENa > 2%: gợi ý tổn thương nhu mô thận / ATN trong bối cảnh phù hợp.";
}

export default function FENa() {
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

  const [urineNa, setUrineNa] = useState<number>(20);
  const [serumNa, setSerumNa] = useState<number>(140);
  const [urineCr, setUrineCr] = useState<number>(100);
  const [serumCr, setSerumCr] = useState<number>(2);

  const fena = useMemo(() => {
    return (urineNa * serumCr * 100) / (Math.max(serumNa, 0.01) * Math.max(urineCr, 0.01));
  }, [urineNa, serumNa, urineCr, serumCr]);

  function reset() {
    setUrineNa(20);
    setSerumNa(140);
    setUrineCr(100);
    setSerumCr(2);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `FENa: ${round2(fena)}%`;

    saveToActiveCase({
      tool: "fena",
      summary,
      inputs: {
        urineNa,
        serumNa,
        urineCr,
        serumCr,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        fena: round2(fena),
        interpretation: interpret(fena),
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="FENa"
      subtitle="Fractional Excretion of Sodium"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Na niệu">
            <input className="input" type="number" value={urineNa} onChange={(e) => setUrineNa(Number(e.target.value))} />
          </CalculatorSection>
          <CalculatorSection title="Na máu">
            <input className="input" type="number" value={serumNa} onChange={(e) => setSerumNa(Number(e.target.value))} />
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
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>FENa</div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>{round2(fena)}</div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>%</div>

          <CalculatorSection title="Diễn giải" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>{interpret(fena)}</div>
          </CalculatorSection>
        </CalculatorBox>
      }
      bottomNote="FENa có thể kém hữu ích khi dùng lợi tiểu hoặc trong một số bối cảnh đặc biệt."
    />
  );
}