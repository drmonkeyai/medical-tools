// src/calculators/Centor.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

type AgeGroup = "3-14" | "15-44" | "45+";

function agePoints(g: AgeGroup) {
  if (g === "3-14") return 1;
  if (g === "45+") return -1;
  return 0;
}

export default function Centor() {
  const navigate = useNavigate();

  const [age, setAge] = useState<AgeGroup>("15-44");
  const [fever, setFever] = useState(false); // >38
  const [noCough, setNoCough] = useState(false);
  const [tonsillarExudate, setTonsillarExudate] = useState(false);
  const [tenderNodes, setTenderNodes] = useState(false); // anterior cervical

  const score = useMemo(() => {
    let s = 0;
    if (fever) s += 1;
    if (noCough) s += 1;
    if (tonsillarExudate) s += 1;
    if (tenderNodes) s += 1;
    s += agePoints(age);
    return s;
  }, [age, fever, noCough, tonsillarExudate, tenderNodes]);

  const interpretation = useMemo(() => {
    // Diễn giải thực hành (tổng quát) để dùng nhanh tại giường
    if (score <= 0) return { level: "Thấp", text: "Ít gợi ý liên cầu. Thường không cần test/kháng sinh." };
    if (score === 1) return { level: "Thấp", text: "Nguy cơ thấp. Cân nhắc chăm sóc triệu chứng; test khi cần." };
    if (score === 2) return { level: "Trung bình", text: "Cân nhắc test nhanh (RADT) hoặc cấy họng tuỳ bối cảnh." };
    if (score === 3) return { level: "Trung bình–cao", text: "Nên làm RADT/cấy họng; điều trị theo kết quả." };
    return { level: "Cao", text: "Nguy cơ cao. Cân nhắc test và/hoặc điều trị theo phác đồ địa phương." };
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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Centor / McIsaac</h2>

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
          Hô hấp • Phân tầng viêm họng do liên cầu
        </div>

        {/* Form */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Tuổi</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["3-14", "15-44", "45+"] as AgeGroup[]).map((g) => (
              <label key={g} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="radio"
                  name="age"
                  value={g}
                  checked={age === g}
                  onChange={() => setAge(g)}
                />
                {g === "3-14" ? "3–14" : g === "15-44" ? "15–44" : "≥45"}
              </label>
            ))}
          </div>

          <div style={{ height: 12 }} />

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={fever}
              onChange={(e) => setFever(e.target.checked)}
            />
            Sốt &gt; 38°C
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={noCough}
              onChange={(e) => setNoCough(e.target.checked)}
            />
            Không ho
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={tonsillarExudate}
              onChange={(e) => setTonsillarExudate(e.target.checked)}
            />
            Amidan sưng/tiết mủ
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={tenderNodes}
              onChange={(e) => setTenderNodes(e.target.checked)}
            />
            Hạch cổ trước đau
          </label>
        </div>

        {/* Result */}
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
              Điểm: {score} • Mức: {interpretation.level}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>
              {interpretation.text}
            </div>
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
