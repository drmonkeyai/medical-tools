import { useEffect, useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

function round2(x: number) {
  return Math.round(x * 100) / 100;
}

export default function BSA() {
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

  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(60);

  useEffect(() => {
    if (!activeCase) return;
    if (typeof activeCase.patient.heightCm === "number") setHeightCm(activeCase.patient.heightCm);
    if (typeof activeCase.patient.weightKg === "number") setWeightKg(activeCase.patient.weightKg);
  }, [activeCase?.id]);

  const bsa = useMemo(() => {
    const h = Math.max(heightCm, 1);
    const w = Math.max(weightKg, 1);
    return Math.sqrt((h * w) / 3600);
  }, [heightCm, weightKg]);

  function reset() {
    setHeightCm(activeCase?.patient.heightCm ?? 165);
    setWeightKg(activeCase?.patient.weightKg ?? 60);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `BSA: ${round2(bsa)} m²`;

    saveToActiveCase({
      tool: "bsa",
      summary,
      inputs: {
        heightCm,
        weightKg,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        bsa: round2(bsa),
        formula: "Mosteller",
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="BSA (Mosteller)"
      subtitle="Tính diện tích da cơ thể"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Chiều cao (cm)">
            <input
              className="input"
              type="number"
              value={heightCm}
              min={30}
              max={250}
              onChange={(e) => setHeightCm(Number(e.target.value))}
            />
          </CalculatorSection>

          <CalculatorSection title="Cân nặng (kg)">
            <input
              className="input"
              type="number"
              value={weightKg}
              min={1}
              max={400}
              onChange={(e) => setWeightKg(Number(e.target.value))}
            />
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>BSA</div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>{round2(bsa)}</div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>m² • Công thức Mosteller</div>

          <CalculatorSection title="Công thức" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>BSA = √[(chiều cao cm × cân nặng kg) / 3600]</div>
          </CalculatorSection>
        </CalculatorBox>
      }
      bottomNote="Diện tích da cơ thể chỉ là thông số hỗ trợ, cần đặt vào bối cảnh lâm sàng."
    />
  );
}