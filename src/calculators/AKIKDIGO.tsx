import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

function stageFromAKI(scrBase: number, scrNow: number, urineMlKgH?: number, urineHours?: number) {
  const ratio = scrNow / Math.max(scrBase, 0.01);
  const delta = scrNow - scrBase;

  let stageByScr = 0;
  if (scrNow >= 4 || ratio >= 3) stageByScr = 3;
  else if (ratio >= 2) stageByScr = 2;
  else if (ratio >= 1.5 || delta >= 0.3) stageByScr = 1;

  let stageByUrine = 0;
  if (urineMlKgH != null && urineHours != null) {
    if (urineMlKgH < 0.3 && urineHours >= 24) stageByUrine = 3;
    else if (urineMlKgH === 0 && urineHours >= 12) stageByUrine = 3;
    else if (urineMlKgH < 0.5 && urineHours >= 12) stageByUrine = 2;
    else if (urineMlKgH < 0.5 && urineHours >= 6) stageByUrine = 1;
  }

  const stage = Math.max(stageByScr, stageByUrine);

  if (stage === 0) return { stage: "Không đủ tiêu chuẩn AKI", detail: "Chưa đạt ngưỡng KDIGO theo dữ liệu nhập." };
  if (stage === 1) return { stage: "AKI stage 1", detail: "Tổn thương thận cấp mức độ nhẹ." };
  if (stage === 2) return { stage: "AKI stage 2", detail: "Tổn thương thận cấp mức độ vừa." };
  return { stage: "AKI stage 3", detail: "Tổn thương thận cấp mức độ nặng." };
}

export default function AKIKDIGO() {
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

  const [baselineScr, setBaselineScr] = useState<number>(1);
  const [currentScr, setCurrentScr] = useState<number>(1.4);
  const [urineMlKgH, setUrineMlKgH] = useState<number>(0.6);
  const [urineHours, setUrineHours] = useState<number>(6);

  const result = useMemo(
    () => stageFromAKI(baselineScr, currentScr, urineMlKgH, urineHours),
    [baselineScr, currentScr, urineMlKgH, urineHours]
  );

  function reset() {
    setBaselineScr(1);
    setCurrentScr(1.4);
    setUrineMlKgH(0.6);
    setUrineHours(6);
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `AKI KDIGO: ${result.stage}`;

    saveToActiveCase({
      tool: "aki-kdigo",
      summary,
      inputs: {
        baselineScr: round1(baselineScr),
        currentScr: round1(currentScr),
        urineMlKgH: round1(urineMlKgH),
        urineHours: round1(urineHours),
        caseLabel: activeCaseLabel,
      },
      outputs: {
        stage: result.stage,
        detail: result.detail,
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="Phân độ AKI – KDIGO"
      subtitle="Phân tầng tổn thương thận cấp theo creatinin và niệu lượng"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={!activeCase ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới." : undefined}
      onReset={reset}
      onSave={onSaveToCase}
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Creatinin nền (mg/dL)">
            <input className="input" type="number" step="0.1" value={baselineScr} onChange={(e) => setBaselineScr(Number(e.target.value))} />
          </CalculatorSection>

          <CalculatorSection title="Creatinin hiện tại (mg/dL)">
            <input className="input" type="number" step="0.1" value={currentScr} onChange={(e) => setCurrentScr(Number(e.target.value))} />
          </CalculatorSection>

          <CalculatorSection title="Niệu lượng (mL/kg/giờ)">
            <input className="input" type="number" step="0.1" value={urineMlKgH} onChange={(e) => setUrineMlKgH(Number(e.target.value))} />
          </CalculatorSection>

          <CalculatorSection title="Thời gian đánh giá niệu lượng (giờ)">
            <input className="input" type="number" step="1" value={urineHours} onChange={(e) => setUrineHours(Number(e.target.value))} />
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <CalculatorSection title="Kết luận">
            <div style={{ fontSize: 28, fontWeight: 900 }}>{result.stage}</div>
          </CalculatorSection>

          <CalculatorSection title="Diễn giải" style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}>
            <div>{result.detail}</div>
          </CalculatorSection>
        </CalculatorBox>
      }
      bottomNote="Cần đặt trong bối cảnh thời gian, nguyên nhân và diễn tiến lâm sàng."
    />
  );
}