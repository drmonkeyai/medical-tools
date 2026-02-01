// src/calculators/QSOFA.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

export default function QSOFA() {
  const navigate = useNavigate();

  const [rr22, setRr22] = useState(false);
  const [sbp100, setSbp100] = useState(false);
  const [altered, setAltered] = useState(false); // altered mentation (GCS<15)

  const score = useMemo(() => {
    let s = 0;
    if (rr22) s += 1;
    if (sbp100) s += 1;
    if (altered) s += 1;
    return s;
  }, [rr22, sbp100, altered]);

  const advice = useMemo(() => {
    if (score >= 2) return { level: "Nguy cơ cao", text: "qSOFA ≥2: nguy cơ diễn tiến nặng cao → đánh giá sepsis/điều trị sớm." };
    if (score === 1) return { level: "Nguy cơ trung bình", text: "qSOFA = 1: theo dõi sát, đánh giá thêm theo lâm sàng." };
    return { level: "Nguy cơ thấp", text: "qSOFA = 0: vẫn cần cân nhắc lâm sàng nếu nghi ngờ nhiễm trùng nặng." };
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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>qSOFA</h2>

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
          Truyền nhiễm • Sàng lọc nguy cơ sepsis (Sepsis-3) — nhanh tại giường
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
            <input type="checkbox" checked={rr22} onChange={(e) => setRr22(e.target.checked)} />
            Nhịp thở ≥ 22 /phút
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={sbp100} onChange={(e) => setSbp100(e.target.checked)} />
            HATT ≤ 100 mmHg
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={altered} onChange={(e) => setAltered(e.target.checked)} />
            Rối loạn tri giác (GCS &lt; 15)
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
              Điểm qSOFA: {score} • {advice.level}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>{advice.text}</div>
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
