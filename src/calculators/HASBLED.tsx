// src/calculators/HASBLED.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

export default function HASBLED() {
  const navigate = useNavigate();

  const [h, setH] = useState(false); // HTN
  const [renal, setRenal] = useState(false);
  const [liver, setLiver] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [bleeding, setBleeding] = useState(false);
  const [labileINR, setLabileINR] = useState(false);
  const [elderly, setElderly] = useState(false); // >65
  const [drugs, setDrugs] = useState(false); // antiplatelet/NSAID
  const [alcohol, setAlcohol] = useState(false);

  const score = useMemo(() => {
    let s = 0;
    if (h) s += 1;
    if (renal) s += 1;
    if (liver) s += 1;
    if (stroke) s += 1;
    if (bleeding) s += 1;
    if (labileINR) s += 1;
    if (elderly) s += 1;
    if (drugs) s += 1;
    if (alcohol) s += 1;
    return s;
  }, [h, renal, liver, stroke, bleeding, labileINR, elderly, drugs, alcohol]);

  const risk = useMemo(() => {
    if (score >= 3) return { level: "Cao", text: "HAS-BLED ≥3: nguy cơ chảy máu cao → theo dõi sát và tối ưu yếu tố nguy cơ." };
    if (score === 2) return { level: "Trung bình", text: "Nguy cơ trung bình → theo dõi và kiểm soát yếu tố nguy cơ." };
    return { level: "Thấp", text: "Nguy cơ thấp → vẫn cần cân nhắc lâm sàng và theo dõi." };
  }, [score]);

  return (
    <div className="page">
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>HAS-BLED</h2>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
            title="Trở về trang trước"
          >
            ← Trở về trang trước
          </button>
        </div>

        <div style={{ color: "var(--muted)", marginBottom: 12, marginTop: 10 }}>
          Tim mạch • Nguy cơ chảy máu ở bệnh nhân rung nhĩ dùng kháng đông
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "white",
          }}
        >
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={h} onChange={(e) => setH(e.target.checked)} />
            H: Tăng HA không kiểm soát
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={renal} onChange={(e) => setRenal(e.target.checked)} />
            A: Bất thường thận
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={liver} onChange={(e) => setLiver(e.target.checked)} />
            A: Bất thường gan
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={stroke} onChange={(e) => setStroke(e.target.checked)} />
            S: Tiền sử đột quỵ
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={bleeding}
              onChange={(e) => setBleeding(e.target.checked)}
            />
            B: Tiền sử chảy máu / xu hướng chảy máu
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={labileINR}
              onChange={(e) => setLabileINR(e.target.checked)}
            />
            L: INR dao động/khó kiểm soát (nếu dùng warfarin)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={elderly} onChange={(e) => setElderly(e.target.checked)} />
            E: Tuổi &gt; 65
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={drugs} onChange={(e) => setDrugs(e.target.checked)} />
            D: Dùng thuốc tăng nguy cơ chảy máu (kháng tiểu cầu/NSAID…)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={alcohol} onChange={(e) => setAlcohol(e.target.checked)} />
            D: Rượu (nguy cơ)
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              Điểm HAS-BLED: {score} • Nguy cơ: {risk.level}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>{risk.text}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <Link
            to="/tools"
            style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800 }}
          >
            ← Quay lại danh sách công cụ
          </Link>
        </div>
      </div>
    </div>
  );
}
