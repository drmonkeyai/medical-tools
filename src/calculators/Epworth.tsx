// src/calculators/Epworth.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

const QUESTIONS = [
  "Ngồi và đọc",
  "Xem TV",
  "Ngồi không hoạt động ở nơi công cộng",
  "Làm hành khách trên xe chạy 1 giờ liên tục",
  "Nằm nghỉ buổi chiều khi có điều kiện",
  "Ngồi nói chuyện với ai đó",
  "Ngồi yên sau bữa trưa không uống rượu",
  "Ngồi trong xe khi dừng vài phút vì kẹt xe",
] as const;

const OPTIONS = [
  { value: 0, label: "0 — Không bao giờ ngủ gật" },
  { value: 1, label: "1 — Khả năng nhẹ" },
  { value: 2, label: "2 — Khả năng vừa" },
  { value: 3, label: "3 — Khả năng cao" },
] as const;

function resultFromScore(score: number) {
  if (score <= 10) return { level: "Bình thường", text: "Buồn ngủ ban ngày không tăng rõ" };
  if (score <= 14) return { level: "Tăng nhẹ", text: "Có tăng buồn ngủ ban ngày" };
  if (score <= 17) return { level: "Tăng vừa", text: "Nên đánh giá nguyên nhân và mức ảnh hưởng" };
  return { level: "Tăng nhiều", text: "Cần đánh giá sâu hơn / cân nhắc chuyển chuyên khoa" };
}

export default function Epworth() {
  const navigate = useNavigate();
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

  const [scores, setScores] = useState<number[]>(Array(8).fill(0));

  const total = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const result = useMemo(() => resultFromScore(total), [total]);

  function setAt(idx: number, value: number) {
    setScores((prev) => prev.map((x, i) => (i === idx ? value : x)));
  }

  function reset() {
    setScores(Array(8).fill(0));
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `Epworth: ${total}/24 • ${result.level}`;

    saveToActiveCase({
      tool: "epworth",
      summary,
      inputs: {
        items: scores,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        total,
        max: 24,
        level: result.level,
        interpretation: result.text,
        when: new Date().toISOString(),
      },
    });

    alert("Đã lưu vào ca ✅");
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(-1)} className="btn" type="button">
              ← Trở về
            </button>

            <div>
              <h1 className="pageTitle" style={{ fontSize: 20, margin: 0 }}>
                Epworth Sleepiness Scale
              </h1>
              <div style={{ marginTop: 4, color: "var(--muted)" }}>
                Đánh giá buồn ngủ ban ngày
              </div>
              <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                Ca đang chọn: <b>{activeCaseLabel}</b>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={reset} className="btn" type="button">
              Reset
            </button>
            <button onClick={onSaveToCase} className="btnPrimary" type="button">
              Lưu vào ca
            </button>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: "span 7" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Khả năng ngủ gật trong các tình huống sau</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {QUESTIONS.map((q, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gap: 8,
                  padding: 12,
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "white",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {idx + 1}. {q}
                </div>

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
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 5" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Kết quả</h2>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>
                Tổng điểm Epworth
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                {total}
              </div>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              Thang điểm 0–24
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                border: "1px solid var(--line)",
                background: "rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ fontWeight: 900 }}>Diễn giải</div>
              <div style={{ marginTop: 6 }}>
                <b>{result.level}</b> — {result.text}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Điểm cao gợi ý buồn ngủ ban ngày tăng, cần đặt vào bối cảnh lâm sàng.
          </div>
        </div>
      </div>
    </div>
  );
}