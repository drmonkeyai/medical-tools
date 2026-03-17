// src/calculators/AuditC.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

type Sex = "male" | "female";

function mapSexLabelToValue(sexLabel?: string): Sex {
  if (!sexLabel) return "male";
  return sexLabel.toLowerCase().includes("nam") ? "male" : "female";
}

function resultFromScore(score: number, sex: Sex) {
  const positiveCutoff = sex === "male" ? 4 : 3;
  const positive = score >= positiveCutoff;

  if (score <= 2) return { level: "Thấp", positive, text: "Ít gợi ý sử dụng rượu nguy cơ" };
  if (score <= 4) return { level: "Tăng nguy cơ", positive, text: "Nên hỏi kỹ hơn về lượng và hậu quả sử dụng rượu" };
  if (score <= 7) return { level: "Cao", positive, text: "Cân nhắc can thiệp ngắn và đánh giá đầy đủ hơn" };
  return { level: "Rất cao", positive, text: "Nguy cơ đáng kể; nên khai thác thêm và can thiệp phù hợp" };
}

export default function AuditC() {
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

  const [sex, setSex] = useState<Sex>("male");
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);

  useEffect(() => {
    if (!activeCase) return;
    setSex(mapSexLabelToValue(activeCase.patient.sex));
  }, [activeCase?.id]);

  const total = useMemo(() => q1 + q2 + q3, [q1, q2, q3]);
  const result = useMemo(() => resultFromScore(total, sex), [total, sex]);

  function reset() {
    setQ1(0);
    setQ2(0);
    setQ3(0);
    setSex(activeCase ? mapSexLabelToValue(activeCase.patient.sex) : "male");
  }

  function onSaveToCase() {
    if (!activeCase) {
      openNewCaseModal();
      return;
    }

    const summary = `AUDIT-C: ${total}/12 • ${result.level}${result.positive ? " • dương tính" : ""}`;

    saveToActiveCase({
      tool: "audit-c",
      summary,
      inputs: {
        sex,
        q1,
        q2,
        q3,
        caseLabel: activeCaseLabel,
      },
      outputs: {
        total,
        max: 12,
        level: result.level,
        positive: result.positive,
        cutoffUsed: sex === "male" ? 4 : 3,
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
                AUDIT-C
              </h1>
              <div style={{ marginTop: 4, color: "var(--muted)" }}>
                Sàng lọc sử dụng rượu nguy cơ
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
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Nhập dữ liệu</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>Giới tính</div>
              <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>1. Tần suất uống đồ uống có cồn</div>
              <select className="select" value={q1} onChange={(e) => setQ1(Number(e.target.value))}>
                <option value={0}>0 — Không bao giờ</option>
                <option value={1}>1 — Hàng tháng hoặc ít hơn</option>
                <option value={2}>2 — 2–4 lần/tháng</option>
                <option value={3}>3 — 2–3 lần/tuần</option>
                <option value={4}>4 — ≥4 lần/tuần</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>2. Số đơn vị uống điển hình trong một ngày có uống</div>
              <select className="select" value={q2} onChange={(e) => setQ2(Number(e.target.value))}>
                <option value={0}>0 — 1–2 ly</option>
                <option value={1}>1 — 3–4 ly</option>
                <option value={2}>2 — 5–6 ly</option>
                <option value={3}>3 — 7–9 ly</option>
                <option value={4}>4 — ≥10 ly</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>3. Tần suất uống ≥6 ly trong một lần</div>
              <select className="select" value={q3} onChange={(e) => setQ3(Number(e.target.value))}>
                <option value={0}>0 — Không bao giờ</option>
                <option value={1}>1 — Ít hơn hàng tháng</option>
                <option value={2}>2 — Hàng tháng</option>
                <option value={3}>3 — Hàng tuần</option>
                <option value={4}>4 — Hầu như hàng ngày</option>
              </select>
            </div>
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
                Tổng điểm AUDIT-C
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                {total}
              </div>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              Thang điểm 0–12 • Ngưỡng dương tính: {sex === "male" ? "Nam ≥4" : "Nữ ≥3"}
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

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                border: "1px solid var(--line)",
                background: result.positive ? "rgba(220,38,38,0.08)" : "rgba(34,197,94,0.08)",
              }}
            >
              <div style={{ fontWeight: 900 }}>Kết luận sàng lọc</div>
              <div style={{ marginTop: 6 }}>
                {result.positive ? "AUDIT-C dương tính" : "AUDIT-C âm tính"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Dương tính không đồng nghĩa chẩn đoán rối loạn sử dụng rượu; cần khai thác thêm.
          </div>
        </div>
      </div>
    </div>
  );
}