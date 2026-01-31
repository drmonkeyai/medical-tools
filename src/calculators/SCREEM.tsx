import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Choice = 0 | 1 | 2;

const CHOICES: { value: Choice; label: string; sub: string }[] = [
  { value: 0, label: "0", sub: "Thiếu / là rào cản" },
  { value: 1, label: "1", sub: "Trung bình / hạn chế" },
  { value: 2, label: "2", sub: "Tốt / là nguồn lực" },
];

type Key = "S" | "C" | "R" | "E1" | "E2" | "M";

type Item = {
  key: Key;
  title: string;
  desc: string;
  hintLow: string;
};

const ITEMS: Item[] = [
  {
    key: "S",
    title: "S – Social (Xã hội)",
    desc: "Gia đình có hỗ trợ từ người thân/cộng đồng (hàng xóm, tổ chức xã hội) khi cần không?",
    hintLow: "Điểm thấp: thiếu hỗ trợ → huy động người thân, nhóm cộng đồng, theo dõi sát tuân thủ.",
  },
  {
    key: "C",
    title: "C – Cultural (Văn hoá)",
    desc: "Niềm tin/phong tục có hỗ trợ hay gây cản trở việc chăm sóc sức khoẻ?",
    hintLow: "Điểm thấp: xung đột văn hoá/niềm tin → giao tiếp nhạy cảm, thống nhất mục tiêu khả thi.",
  },
  {
    key: "R",
    title: "R – Religious (Tôn giáo/Tâm linh)",
    desc: "Gia đình có điểm tựa tâm linh/tôn giáo giúp vượt khó hay có xung đột liên quan điều trị?",
    hintLow: "Điểm thấp: thiếu điểm tựa hoặc xung đột → cân nhắc hỗ trợ tinh thần, phối hợp phù hợp bối cảnh.",
  },
  {
    key: "E1",
    title: "E – Economic (Kinh tế)",
    desc: "Khả năng chi trả (thuốc, xét nghiệm, đi lại), bảo hiểm y tế, ổn định tài chính?",
    hintLow: "Điểm thấp: khó chi trả → ưu tiên phác đồ chi phí thấp, BHYT, chương trình hỗ trợ, hẹn tái khám phù hợp.",
  },
  {
    key: "E2",
    title: "E – Educational (Hiểu biết sức khoẻ)",
    desc: "Mức hiểu biết sức khoẻ/khả năng tiếp nhận hướng dẫn và tự theo dõi?",
    hintLow: "Điểm thấp: khó hiểu hướng dẫn → dùng teach-back, đơn giản hoá mục tiêu, tờ hướng dẫn ngắn.",
  },
  {
    key: "M",
    title: "M – Medical (Tiếp cận y tế)",
    desc: "Khả năng tiếp cận dịch vụ y tế (khoảng cách, lịch tái khám, thuốc men, kết nối tuyến)?",
    hintLow: "Điểm thấp: khó tiếp cận → tối ưu lịch hẹn, nhắc tái khám, telehealth, điều phối tuyến/điều trị.",
  },
];

function levelFromTotal(total: number) {
  if (total >= 10) {
    return {
      label: "Nguồn lực gia đình tốt",
      desc: "Gia đình có nhiều điểm tựa. Có thể triển khai kế hoạch điều trị chuẩn và giao nhiệm vụ tự theo dõi.",
    };
  }
  if (total >= 7) {
    return {
      label: "Nguồn lực trung bình",
      desc: "Có điểm mạnh nhưng có “lỗ hổng”. Ưu tiên can thiệp 1–2 miền yếu nhất để cải thiện tuân thủ.",
    };
  }
  return {
    label: "Nguồn lực thấp / rủi ro xã hội cao",
    desc: "Nguy cơ kém tuân thủ, bỏ tái khám. Cân nhắc hỗ trợ liên ngành (CTXH, BHYT, cộng đồng) và theo dõi sát.",
  };
}

function weakestIssues(scores: Record<Key, Choice>) {
  const arr = ITEMS.map((it) => ({ it, score: scores[it.key] }));
  arr.sort((a, b) => a.score - b.score);
  return arr.filter((x) => x.score <= 1).slice(0, 2);
}

export default function SCREEM() {
  const navigate = useNavigate();

  const [scores, setScores] = useState<Record<Key, Choice>>({
    S: 1,
    C: 1,
    R: 1,
    E1: 1,
    E2: 1,
    M: 1,
  });

  const total = useMemo(() => (Object.values(scores) as number[]).reduce((s, x) => s + x, 0), [scores]);
  const level = useMemo(() => levelFromTotal(total), [total]);
  const issues = useMemo(() => weakestIssues(scores), [scores]);

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">SCREEM</h1>
            <div className="calcSub">
              Đánh giá nguồn lực gia đình theo 6 miền (Social, Cultural, Religious, Economic, Educational, Medical). Mỗi miền 0–2 điểm. Tổng 0–12.
            </div>
          </div>

          <button className="btn" onClick={() => navigate(-1)} title="Trở về trang trước">
            ← Trở về trang trước
          </button>
        </div>

        <div className="divider" />

        {/* ✅ LIST DỌC */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {ITEMS.map((it, idx) => (
            <div key={it.key} style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                {idx + 1}/6 • {it.title}
              </div>

              <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, lineHeight: 1.5 }}>
                {it.desc}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {CHOICES.map((c) => {
                  const active = scores[it.key] === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setScores((prev) => ({ ...prev, [it.key]: c.value }))}
                      style={{
                        textAlign: "left",
                        borderRadius: 14,
                        padding: "12px 12px",
                        border: `1px solid ${active ? "rgba(29,78,216,0.55)" : "var(--line)"}`,
                        background: active ? "rgba(29,78,216,0.08)" : "white",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                      title={c.sub}
                    >
                      <div style={{ fontSize: 14 }}>
                        {c.label} • <span style={{ color: "var(--muted)", fontWeight: 800 }}>{c.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {scores[it.key] <= 1 && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>{it.hintLow}</div>
              )}
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Result */}
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 14,
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Kết quả SCREEM</div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "white",
                fontWeight: 900,
              }}
            >
              Tổng điểm: {total}/12
            </div>
          </div>

          <div style={{ marginTop: 10, fontWeight: 900, fontSize: 18 }}>{level.label}</div>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, lineHeight: 1.5 }}>
            {level.desc}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý ưu tiên (miền điểm thấp)</div>

            {issues.length === 0 ? (
              <div style={{ color: "var(--muted)", fontWeight: 700 }}>
                Không có miền điểm thấp (0–1). Có thể tập trung kế hoạch điều trị và tự theo dõi.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {issues.map(({ it, score }) => (
                  <div
                    key={it.key}
                    style={{
                      background: "white",
                      border: "1px solid var(--line)",
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>{it.title}</div>
                      <div style={{ fontWeight: 900, color: "var(--primary)" }}>Điểm: {score}/2</div>
                    </div>
                    <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700 }}>{it.hintLow}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Lưu ý: SCREEM giúp định hướng bối cảnh gia đình–xã hội, không thay thế đánh giá lâm sàng toàn diện.
          </div>
        </div>
      </div>
    </div>
  );
}
