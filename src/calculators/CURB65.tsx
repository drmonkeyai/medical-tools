// src/calculators/CURB65.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

export default function CURB65() {
  const navigate = useNavigate();

  const [confusion, setConfusion] = useState(false);
  const [ureaHigh, setUreaHigh] = useState(false); // urea >7 mmol/L (hoặc BUN >19 mg/dL)
  const [rrHigh, setRrHigh] = useState(false); // RR >=30
  const [bpLow, setBpLow] = useState(false); // SBP <90 hoặc DBP <=60
  const [age65, setAge65] = useState(false);

  const score = useMemo(() => {
    let s = 0;
    if (confusion) s += 1;
    if (ureaHigh) s += 1;
    if (rrHigh) s += 1;
    if (bpLow) s += 1;
    if (age65) s += 1;
    return s;
  }, [confusion, ureaHigh, rrHigh, bpLow, age65]);

  const advice = useMemo(() => {
    if (score <= 1) return { level: "Nhẹ", text: "0–1: thường điều trị ngoại trú (tuỳ lâm sàng/yếu tố nguy cơ)." };
    if (score === 2) return { level: "Trung bình", text: "2: cân nhắc nhập viện/điều trị theo dõi." };
    return { level: "Nặng", text: "≥3: viêm phổi nặng → cân nhắc ICU/điều trị tích cực." };
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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>CURB-65</h2>

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
          Hô hấp • Viêm phổi cộng đồng (gợi ý nơi điều trị)
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
            <input type="checkbox" checked={confusion} onChange={(e) => setConfusion(e.target.checked)} />
            C: Lú lẫn (confusion)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={ureaHigh} onChange={(e) => setUreaHigh(e.target.checked)} />
            U: Urea &gt; 7 mmol/L (hoặc BUN &gt; 19 mg/dL)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={rrHigh} onChange={(e) => setRrHigh(e.target.checked)} />
            R: Nhịp thở ≥ 30 /phút
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={bpLow} onChange={(e) => setBpLow(e.target.checked)} />
            B: HA thấp (SBP &lt; 90 hoặc DBP ≤ 60)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={age65} onChange={(e) => setAge65(e.target.checked)} />
            65: Tuổi ≥ 65
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
              Điểm CURB-65: {score} • Mức: {advice.level}
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
