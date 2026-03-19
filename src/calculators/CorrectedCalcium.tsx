import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

type Unit = "mgdl" | "mmoll";

function round2(x: number) {
  return Math.round(x * 100) / 100;
}

export default function CorrectedCalcium() {
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

  const [unit, setUnit] = useState<Unit>("mgdl");
  const [calcium, setCalcium] = useState<number>(8.5);
  const [albumin, setAlbumin] = useState<number>(3.5);

  const corrected = useMemo(() => {
    if (unit === "mgdl") return calcium + 0.8 * (4 - albumin);
    return calcium + 0.02 * (40 - albumin * 10);
  }, [unit, calcium, albumin]);

  function reset() {
    setUnit("mgdl");
    setCalcium(8.5);
    setAlbumin(3.5);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary =
      unit === "mgdl"
        ? `Calci hiệu chỉnh: ${round2(corrected)} mg/dL`
        : `Calci hiệu chỉnh: ${round2(corrected)} mmol/L`;

    saveToActiveCase({
      tool: "corrected-calcium",
      summary,
      inputs: {
        unit,
        calcium: round2(calcium),
        albumin: round2(albumin),
        caseLabel: activeCaseLabel,
      },
      outputs: {
        correctedCalcium: round2(corrected),
        correctedUnit: unit === "mgdl" ? "mg/dL" : "mmol/L",
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="Calci hiệu chỉnh theo albumin"
      subtitle="Ước tính calci toàn phần đã hiệu chỉnh"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Đơn vị">
            <select className="select" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
              <option value="mgdl">mg/dL</option>
              <option value="mmoll">mmol/L</option>
            </select>
          </CalculatorSection>

          <CalculatorSection title={`Calci toàn phần (${unit === "mgdl" ? "mg/dL" : "mmol/L"})`}>
            <input
              className="input"
              type="number"
              step="0.1"
              value={calcium}
              onChange={(e) => setCalcium(Number(e.target.value))}
            />
          </CalculatorSection>

          <CalculatorSection title="Albumin (g/dL)">
            <input
              className="input"
              type="number"
              step="0.1"
              value={albumin}
              onChange={(e) => setAlbumin(Number(e.target.value))}
            />
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>
              Calci hiệu chỉnh
            </div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>{round2(corrected)}</div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
            {unit === "mgdl" ? "mg/dL" : "mmol/L"}
          </div>

          <CalculatorSection title="Lưu ý" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>
              Công thức hiệu chỉnh chỉ là ước tính. Khi cần chính xác hơn, ưu tiên calci ion hoá.
            </div>
          </CalculatorSection>
        </CalculatorBox>
      }
    />
  );
}