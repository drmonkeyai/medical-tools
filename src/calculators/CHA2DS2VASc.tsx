// src/calculators/CHA2DS2VASc.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

type Sex = "male" | "female";

export default function CHA2DS2VASc() {
  const navigate = useNavigate();

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(65);

  const [chf, setChf] = useState(false);
  const [htn, setHtn] = useState(false);
  const [dm, setDm] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [vascular, setVascular] = useState(false);

  const score = useMemo(() => {
    let s = 0;
    // C
    if (chf) s += 1;
    // H
    if (htn) s += 1;
    // A2 / A
    if (age >= 75) s += 2;
    else if (age >= 65) s += 1;
    // D
    if (dm) s += 1;
    // S2
    if (stroke) s += 2;
    // V
    if (vascular) s += 1;
    // Sc
    if (sex === "female") s += 1;
    return s;
  }, [sex, age, chf, htn, dm, stroke, vascular]);

  const suggestion = useMemo(() => {
    // Gợi ý thực hành tổng quát (không thay thế hướng dẫn/BS)
    // (đơn giản hóa theo ngưỡng thường dùng)
    if (sex === "male") {
      if (score === 0) return "Nguy cơ thấp (nam 0): thường không cần kháng đông.";
      if (score === 1) return "Nam 1: cân nhắc kháng đông tuỳ nguy cơ/lợi ích.";
      return "Nam ≥2: thường khuyến cáo kháng đông nếu không chống chỉ định.";
    }
    // female
    if (score === 1) return "Nữ 1 (chỉ do giới): thường không cần kháng đông.";
    if (score === 2) return "Nữ 2: cân nhắc kháng đông tuỳ nguy cơ/lợi ích.";
    return "Nữ ≥3: thường khuyến cáo kháng đông nếu không chống chỉ định.";
  }, [sex, score]);

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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>CHA₂DS₂-VASc</h2>

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
          Tim mạch • Nguy cơ đột quỵ ở rung nhĩ (gợi ý kháng đông)
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "white",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Giới</span>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Tuổi</span>
              <input
                type="number"
                value={age}
                min={0}
                onChange={(e) => setAge(Number(e.target.value || 0))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  width: 140,
                }}
              />
            </label>
          </div>

          <div style={{ height: 12 }} />

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={chf} onChange={(e) => setChf(e.target.checked)} />
            Suy tim / rối loạn chức năng thất trái
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={htn} onChange={(e) => setHtn(e.target.checked)} />
            Tăng huyết áp
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={dm} onChange={(e) => setDm(e.target.checked)} />
            Đái tháo đường
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={stroke} onChange={(e) => setStroke(e.target.checked)} />
            Tiền sử đột quỵ/TIA/thuyên tắc hệ thống
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={vascular} onChange={(e) => setVascular(e.target.checked)} />
            Bệnh mạch máu (NMCT, PAD, mảng xơ vữa ĐMC…)
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
            <div style={{ fontWeight: 900 }}>Điểm CHA₂DS₂-VASc: {score}</div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>{suggestion}</div>
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
