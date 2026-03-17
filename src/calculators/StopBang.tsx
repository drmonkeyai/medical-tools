// src/calculators/StopBang.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

const ITEMS = [
  "Ngáy to",
  "Thường mệt mỏi / buồn ngủ ban ngày",
  "Có người chứng kiến ngưng thở khi ngủ",
  "Tăng huyết áp hoặc đang điều trị tăng huyết áp",
  "BMI > 35 kg/m²",
  "Tuổi > 50",
  "Vòng cổ > 40 cm",
  "Nam giới",
] as const;

function resultFromScore(score: number) {
  if (score <= 2) return { level: "Nguy cơ thấp", text: "Khả năng OSA thấp theo STOP-Bang" };
  if (score <= 4) return { level: "Nguy cơ trung bình", text: "Cân nhắc đánh giá thêm theo lâm sàng" };
  return { level: "Nguy cơ cao", text: "Nên đánh giá sâu hơn / cân nhắc chuyển khảo sát giấc ngủ" };
}

export default function StopBang() {
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

  const [items, setItems] = useState<boolean[]>(Array(8).fill(false));

  const total = useMemo(() => items.filter(Boolean).length, [items]);
  const result = useMemo(() => resultFromScore(total), [total]);

  function toggleAt(idx: number) {
    setItems((prev) => prev.map((x, i) => (i === idx ? !x : x)));
  }

  function reset() {
    setItems(Array(8).fill(false));
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `STOP-Bang: ${total}/8 • ${result.level}`;

    saveToActiveCase({
      tool: "stop-bang",
      summary,
      inputs: {
        items,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        total,
        max: 8,
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
                STOP-Bang
              </h1>
              <div style={{ marginTop: 4, color: "var(--muted)" }}>
                Sàng lọc nguy cơ ngưng thở tắc nghẽn khi ngủ
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
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Chọn các yếu tố có mặt</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {ITEMS.map((label, idx) => (
              <label
                key={idx}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: 12,
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: items[idx] ? "rgba(29,78,216,0.06)" : "white",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={items[idx]}
                  onChange={() => toggleAt(idx)}
                />
                <div style={{ fontWeight: 900 }}>
                  {idx + 1}. {label}
                </div>
              </label>
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
                Tổng điểm STOP-Bang
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                {total}
              </div>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              Thang điểm 0–8
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
              <div style={{ fontWeight: 900 }}>Phân tầng</div>
              <div style={{ marginTop: 6 }}>
                <b>{result.level}</b> — {result.text}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Đây là công cụ sàng lọc, không xác lập chẩn đoán OSA.
          </div>
        </div>
      </div>
    </div>
  );
}