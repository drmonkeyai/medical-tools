import { useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

const QUESTIONS = [
  "Ít hứng thú hoặc ít thấy thích thú khi làm việc gì",
  "Cảm thấy buồn, chán nản hoặc tuyệt vọng",
  "Khó ngủ, ngủ không ngon giấc hoặc ngủ quá nhiều",
  "Cảm thấy mệt mỏi hoặc ít năng lượng",
  "Ăn kém ngon miệng hoặc ăn quá nhiều",
  "Cảm thấy bản thân tệ hại, thất bại hoặc làm gia đình thất vọng",
  "Khó tập trung vào việc gì đó, như đọc báo hoặc xem TV",
  "Di chuyển hoặc nói chậm đến mức người khác có thể nhận ra; hoặc ngược lại bồn chồn, đứng ngồi không yên",
  "Có ý nghĩ rằng thà chết đi hoặc tự làm hại bản thân",
] as const;

const OPTIONS = [
  { value: 0, label: "0 — Không hề" },
  { value: 1, label: "1 — Vài ngày" },
  { value: 2, label: "2 — Hơn một nửa số ngày" },
  { value: 3, label: "3 — Gần như mỗi ngày" },
] as const;

function resultFromScore(score: number) {
  if (score <= 4) return { level: "Tối thiểu", text: "Ít hoặc không có triệu chứng đáng kể" };
  if (score <= 9) return { level: "Nhẹ", text: "Theo dõi và đánh giá lại theo lâm sàng" };
  if (score <= 14) return { level: "Trung bình", text: "Cân nhắc can thiệp tích cực hơn" };
  if (score <= 19) return { level: "Trung bình-nặng", text: "Nên đánh giá kỹ và lập kế hoạch điều trị" };
  return { level: "Nặng", text: "Cần đánh giá chuyên sâu / cân nhắc chuyển chuyên khoa" };
}

export default function PHQ9() {
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

  const [scores, setScores] = useState<number[]>(Array(9).fill(0));
  const [difficulty, setDifficulty] = useState<string>("Không ảnh hưởng rõ");

  const total = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const result = useMemo(() => resultFromScore(total), [total]);
  const suicideFlag = scores[8] > 0;

  function setAt(idx: number, value: number) {
    setScores((prev) => prev.map((x, i) => (i === idx ? value : x)));
  }

  function reset() {
    setScores(Array(9).fill(0));
    setDifficulty("Không ảnh hưởng rõ");
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `PHQ-9: ${total}/27 • ${result.level}${suicideFlag ? " • Có ý nghĩ tự hại cần lưu ý" : ""}`;

    saveToActiveCase({
      tool: "phq9",
      summary,
      inputs: {
        items: scores,
        difficulty,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        total,
        max: 27,
        level: result.level,
        interpretation: result.text,
        suicideFlag,
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <CalculatorTemplate
      title="PHQ-9"
      subtitle="Sàng lọc và phân tầng mức độ triệu chứng trầm cảm"
      activeCaseLabel={activeCaseLabel}
      noCaseHint={
        !activeCase
          ? "Chưa có ca đang chọn. Bạn có thể bấm Lưu vào ca để tạo ca mới."
          : undefined
      }
      onReset={reset}
      onSave={onSaveToCase}
      leftTitle="9 câu hỏi trong 2 tuần qua"
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
              Tổng điểm PHQ-9
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              {total}
            </div>
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
            Thang điểm 0–27
          </div>

          <CalculatorSection
            title="Mức độ"
            style={{ marginTop: 12, background: "rgba(0,0,0,0.02)" }}
          >
            <div>
              <b>{result.level}</b> — {result.text}
            </div>
          </CalculatorSection>

          {suicideFlag && (
            <CalculatorSection
              title="Lưu ý an toàn"
              style={{ marginTop: 12, background: "rgba(220,38,38,0.08)" }}
            >
              <div>
                Câu 9 có điểm &gt; 0. Cần hỏi thêm trực tiếp về ý nghĩ, kế hoạch, phương tiện
                và mức độ an toàn hiện tại.
              </div>
            </CalculatorSection>
          )}
        </CalculatorBox>
      }
    />
  );
}