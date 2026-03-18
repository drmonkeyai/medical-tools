import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/CalculatorTemplate";

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

export default function Hba1cEag() {
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

  const [hba1c, setHba1c] = useState<number>(7);

  const eagMgDl = useMemo(() => 28.7 * hba1c - 46.7, [hba1c]);
  const eagMmol = useMemo(() => eagMgDl / 18, [eagMgDl]);

  function reset() {
    setHba1c(7);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `HbA1c ${round1(hba1c)}% → eAG ${round1(eagMgDl)} mg/dL (${round1(eagMmol)} mmol/L)`;

    saveToActiveCase({
      tool: "hba1c-eag",
      summary,
      inputs: {
        hba1c: round1(hba1c),
        caseLabel: activeCaseLabel,
      },
      outputs: {
        eagMgDl: round1(eagMgDl),
        eagMmolL: round1(eagMmol),
        formula: "eAG (mg/dL) = 28.7 × HbA1c − 46.7",
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="HbA1c → eAG"
      subtitle="Quy đổi HbA1c sang đường huyết trung bình ước tính"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="HbA1c (%)">
            <input
              className="input"
              type="number"
              step="0.1"
              min={3}
              max={20}
              value={hba1c}
              onChange={(e) => setHba1c(Number(e.target.value))}
            />
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <CalculatorSection title="eAG (mg/dL)">
            <div style={{ fontSize: 28, fontWeight: 900 }}>{round1(eagMgDl)}</div>
          </CalculatorSection>

          <CalculatorSection title="eAG (mmol/L)" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{round1(eagMmol)}</div>
          </CalculatorSection>

          <CalculatorSection title="Công thức" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>eAG (mg/dL) = 28.7 × HbA1c − 46.7</div>
          </CalculatorSection>
        </CalculatorBox>
      }
      bottomNote="eAG là giá trị ước tính, không thay thế theo dõi glucose thực tế."
    />
  );
}