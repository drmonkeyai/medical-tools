import { useEffect, useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

type Sex = "male" | "female";
type Method = "bazett" | "fridericia";

function mapSexLabelToValue(sexLabel?: string): Sex {
  if (!sexLabel) return "male";
  return sexLabel.toLowerCase().includes("nam") ? "male" : "female";
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

function interpretQtc(qtc: number, sex: Sex) {
  const upperNormal = sex === "male" ? 450 : 470;
  const borderline = sex === "male" ? 430 : 450;

  if (qtc >= 500) {
    return {
      level: "Kéo dài nhiều",
      text: "Nguy cơ loạn nhịp tăng, cần đánh giá nguyên nhân và thuốc đang dùng",
    };
  }
  if (qtc > upperNormal) {
    return { level: "Kéo dài", text: "QTc trên ngưỡng bình thường" };
  }
  if (qtc >= borderline) {
    return { level: "Cận trên", text: "Ở vùng biên, cần đặt trong bối cảnh lâm sàng" };
  }
  return { level: "Bình thường", text: "QTc trong giới hạn thường dùng" };
}

export default function QTcCalculator() {
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
  const [method, setMethod] = useState<Method>("fridericia");
  const [qtMs, setQtMs] = useState<number>(400);
  const [hr, setHr] = useState<number>(80);

  useEffect(() => {
    if (!activeCase) return;
    setSex(mapSexLabelToValue(activeCase.patient.sex));
  }, [activeCase?.id]);

  const rr = useMemo(() => {
    const safeHr = Math.max(hr, 1);
    return 60 / safeHr;
  }, [hr]);

  const qtcBazett = useMemo(() => qtMs / Math.sqrt(rr), [qtMs, rr]);
  const qtcFridericia = useMemo(() => qtMs / Math.cbrt(rr), [qtMs, rr]);

  const selectedQtc = method === "bazett" ? qtcBazett : qtcFridericia;
  const result = interpretQtc(selectedQtc, sex);

  function reset() {
    setMethod("fridericia");
    setQtMs(400);
    setHr(80);
    setSex(activeCase ? mapSexLabelToValue(activeCase.patient.sex) : "male");
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `QTc ${method === "bazett" ? "Bazett" : "Fridericia"}: ${round1(selectedQtc)} ms • ${result.level}`;

    saveToActiveCase({
      tool: "qtc",
      summary,
      inputs: {
        sex,
        method,
        qtMs: round1(qtMs),
        hr: round1(hr),
        rrSec: round1(rr),
        caseLabel: activeCaseLabel,
      },
      outputs: {
        qtcBazett: round1(qtcBazett),
        qtcFridericia: round1(qtcFridericia),
        selectedQtc: round1(selectedQtc),
        selectedMethod: method,
        level: result.level,
        interpretation: result.text,
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="QTc (Bazett / Fridericia)"
      subtitle="Tính QTc từ QT đo được và nhịp tim"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={
        !activeCase
          ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới."
          : undefined
      }
      onReset={reset}
      onSave={onSaveToCase}
      topNote="Bazett dễ quá ước tính khi nhịp nhanh/chậm; Fridericia thường ổn hơn trong nhiều tình huống."
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      bottomNote="Luôn rà lại điện giải, thuốc kéo dài QT và chất lượng phép đo ECG."
      left={
        <div style={{ display: "grid", gap: 12 }}>
          <CalculatorSection title="Giới">
            <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </CalculatorSection>

          <CalculatorSection title="Công thức dùng để diễn giải chính">
            <select
              className="select"
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
            >
              <option value="fridericia">Fridericia</option>
              <option value="bazett">Bazett</option>
            </select>
          </CalculatorSection>

          <CalculatorSection title="QT đo được (ms)">
            <input
              type="number"
              className="input"
              value={qtMs}
              min={200}
              max={700}
              onChange={(e) => setQtMs(Number(e.target.value))}
              style={{ minWidth: 160 }}
            />
          </CalculatorSection>

          <CalculatorSection title="Nhịp tim (bpm)">
            <input
              type="number"
              className="input"
              value={hr}
              min={20}
              max={250}
              onChange={(e) => setHr(Number(e.target.value))}
              style={{ minWidth: 160 }}
            />
          </CalculatorSection>

          <CalculatorSection>
            <div style={{ fontSize: 13 }}>
              RR ước tính: <b>{round1(rr)}</b> giây
            </div>
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <div style={{ display: "grid", gap: 10 }}>
            <CalculatorSection
              title="QTc Bazett"
              style={{
                background: method === "bazett" ? "rgba(29,78,216,0.08)" : "white",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900 }}>{round1(qtcBazett)} ms</div>
            </CalculatorSection>

            <CalculatorSection
              title="QTc Fridericia"
              style={{
                background: method === "fridericia" ? "rgba(29,78,216,0.08)" : "white",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900 }}>{round1(qtcFridericia)} ms</div>
            </CalculatorSection>
          </div>

          <CalculatorSection
            title={`Diễn giải theo ${method === "bazett" ? "Bazett" : "Fridericia"}`}
            style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}
          >
            <div>
              <b>{result.level}</b> — {result.text}
            </div>
          </CalculatorSection>
        </CalculatorBox>
      }
    />
  );
}