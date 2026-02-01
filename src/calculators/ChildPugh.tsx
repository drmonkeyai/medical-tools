// src/calculators/ChildPugh.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

type Level3 = "1" | "2" | "3";

function pointsFromBilirubin(v: number) {
  // mg/dL
  if (v < 2) return 1;
  if (v <= 3) return 2;
  return 3;
}
function pointsFromAlbumin(v: number) {
  // g/dL
  if (v > 3.5) return 1;
  if (v >= 2.8) return 2;
  return 3;
}
function pointsFromINR(v: number) {
  if (v < 1.7) return 1;
  if (v <= 2.3) return 2;
  return 3;
}

export default function ChildPugh() {
  const navigate = useNavigate();

  const [encephalopathy, setEncephalopathy] = useState<Level3>("1"); // 1 none, 2 grade1-2, 3 grade3-4
  const [ascites, setAscites] = useState<Level3>("1"); // 1 none, 2 mild/mod, 3 tense/refractory

  const [bilirubin, setBilirubin] = useState<number>(1.2); // mg/dL
  const [albumin, setAlbumin] = useState<number>(3.6); // g/dL
  const [inr, setInr] = useState<number>(1.1);

  const score = useMemo(() => {
    const e = Number(encephalopathy);
    const a = Number(ascites);
    const b = pointsFromBilirubin(bilirubin);
    const alb = pointsFromAlbumin(albumin);
    const i = pointsFromINR(inr);
    return e + a + b + alb + i;
  }, [encephalopathy, ascites, bilirubin, albumin, inr]);

  const clazz = useMemo(() => {
    if (score <= 6) return { c: "A", text: "Child-Pugh A (5–6): chức năng gan còn tốt hơn." };
    if (score <= 9) return { c: "B", text: "Child-Pugh B (7–9): suy gan mức trung bình." };
    return { c: "C", text: "Child-Pugh C (10–15): suy gan nặng." };
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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Child–Pugh</h2>

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
          Tiêu hoá • Đánh giá mức độ xơ gan / chức năng gan
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "white",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>Bilirubin (mg/dL)</div>
              <input
                type="number"
                min={0}
                step="0.1"
                value={bilirubin}
                onChange={(e) => setBilirubin(Number(e.target.value || 0))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              />
              <div style={{ color: "var(--muted)" }}>
                &lt;2 = 1 điểm • 2–3 = 2 điểm • &gt;3 = 3 điểm
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>Albumin (g/dL)</div>
              <input
                type="number"
                min={0}
                step="0.1"
                value={albumin}
                onChange={(e) => setAlbumin(Number(e.target.value || 0))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              />
              <div style={{ color: "var(--muted)" }}>
                &gt;3.5 = 1 điểm • 2.8–3.5 = 2 điểm • &lt;2.8 = 3 điểm
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>INR</div>
              <input
                type="number"
                min={0}
                step="0.1"
                value={inr}
                onChange={(e) => setInr(Number(e.target.value || 0))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              />
              <div style={{ color: "var(--muted)" }}>
                &lt;1.7 = 1 điểm • 1.7–2.3 = 2 điểm • &gt;2.3 = 3 điểm
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>Cổ trướng (Ascites)</div>
              <select
                value={ascites}
                onChange={(e) => setAscites(e.target.value as Level3)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              >
                <option value="1">Không</option>
                <option value="2">Nhẹ / kiểm soát được</option>
                <option value="3">Nhiều / kháng trị</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>Bệnh não gan (Encephalopathy)</div>
              <select
                value={encephalopathy}
                onChange={(e) => setEncephalopathy(e.target.value as Level3)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              >
                <option value="1">Không</option>
                <option value="2">Độ 1–2</option>
                <option value="3">Độ 3–4</option>
              </select>
            </div>
          </div>
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
              Điểm Child–Pugh: {score} • Phân loại: {clazz.c}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>{clazz.text}</div>
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
