import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

const QUESTIONS = [
  "Cảm thấy hồi hộp, lo lắng hoặc căng thẳng",
  "Không thể ngừng hoặc kiểm soát lo lắng",
  "Lo lắng quá nhiều về nhiều việc khác nhau",
  "Khó thư giãn",
  "Bồn chồn đến mức khó ngồi yên",
  "Dễ cáu gắt hoặc dễ khó chịu",
  "Cảm thấy sợ như thể điều gì tồi tệ sắp xảy ra",
] as const;

const OPTIONS = [
  { value: 0, label: "0 — Không hề" },
  { value: 1, label: "1 — Vài ngày" },
  { value: 2, label: "2 — Hơn một nửa số ngày" },
  { value: 3, label: "3 — Gần như mỗi ngày" },
] as const;

function resultFromScore(score: number) {
  if (score <= 4) return { level: "Tối thiểu", text: "Ít triệu chứng lo âu đáng kể" };
  if (score <= 9) return { level: "Nhẹ", text: "Theo dõi và đánh giá lại nếu cần" };
  if (score <= 14) return { level: "Trung bình", text: "Cân nhắc tư vấn / can thiệp" };
  return { level: "Nặng", text: "Cần đánh giá kỹ và lập kế hoạch điều trị" };
}

export default function GAD7() {
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

  const [scores, setScores] = useState<number[]>(Array(7).fill(0));
  const [difficulty, setDifficulty] = useState<string>("Không ảnh hưởng rõ");

  const total = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const result = useMemo(() => resultFromScore(total), [total]);

  function setAt(idx: number, value: number) {
    setScores((prev) => prev.map((x, i) => (i === idx ? value : x)));
  }

  function reset() {
    setScores(Array(7).fill(0));
    setDifficulty("Không ảnh hưởng rõ");
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `GAD-7: ${total}/21 • ${result.level}`;

    saveToActiveCase({
      tool: "gad7",
      summary,
      inputs: {
        items: scores,
        difficulty,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        total,
        max: 21,
        level: result.level,
        interpretation: result.text,
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="GAD-7"
      subtitle="Sàng lọc và phân tầng mức độ lo âu"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={
        !activeCase
          ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới."
          : undefined
      }
      onReset={reset}
      onSave={onSaveToCase}
      leftTitle="7 câu hỏi trong 2 tuần qua"
      rightTitle="Kết quả"
      bottomNote="Công cụ hỗ trợ sàng lọc; không thay thế chẩn đoán lâm sàng."
      left={
        <div style={{ display: "grid", gap: 12 }}>
          {QUESTIONS.map((q, idx) => (
            <CalculatorSection key={idx} title={`${idx + 1}. ${q}`}>
              <select
                className="select"
                value={scores[idx]}
                onChange={(e) => setAt(idx, Number(e.target.value))}
              >
                {OPTIONS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </CalculatorSection>
          ))}

          <CalculatorSection title="Mức ảnh hưởng lên công việc / việc nhà / quan hệ xã hội">
            <select
              className="select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Không ảnh hưởng rõ</option>
              <option>Khó ở mức ít</option>
              <option>Khó ở mức vừa</option>
              <option>Rất khó</option>
            </select>
          </CalculatorSection>
        </div>
      }
      right={
        <CalculatorBox>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>
              Tổng điểm GAD-7
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              {total}
            </div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
            Thang điểm 0–21
          </div>

          <CalculatorSection
            title="Mức độ"
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