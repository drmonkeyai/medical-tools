import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Choice = 0 | 1 | 2;

const CHOICES: { value: Choice; label: string; sub: string }[] = [
  { value: 0, label: "0", sub: "Hầu như không bao giờ" },
  { value: 1, label: "1", sub: "Thỉnh thoảng" },
  { value: 2, label: "2", sub: "Hầu như luôn luôn" },
];

type ItemKey = "A1" | "P" | "G" | "A2" | "R";

type Item = {
  key: ItemKey;
  title: string;
  desc: string;
  hintLow: string;
};

const ITEMS: Item[] = [
  {
    key: "A1",
    title: "A – Adaptation",
    desc: "Gia đình có giúp đỡ bạn khi bạn gặp khó khăn/vấn đề không?",
    hintLow: "Điểm thấp: thiếu hỗ trợ khi gặp khó khăn → cân nhắc huy động người thân/nguồn lực xã hội.",
  },
  {
    key: "P",
    title: "P – Partnership",
    desc: "Gia đình có cùng bạn thảo luận và chia sẻ trách nhiệm/ra quyết định không?",
    hintLow: "Điểm thấp: thiếu hợp tác/chia sẻ quyết định → khuyến khích người chăm sóc tham gia buổi tư vấn.",
  },
  {
    key: "G",
    title: "G – Growth",
    desc: "Gia đình có ủng hộ bạn phát triển và thử những điều mới không?",
    hintLow: "Điểm thấp: thiếu khích lệ phát triển → đặt mục tiêu nhỏ, hỗ trợ động lực, tăng cường giao tiếp tích cực.",
  },
  {
    key: "A2",
    title: "A – Affection",
    desc: "Gia đình có thể hiện tình cảm/quan tâm và phản hồi cảm xúc của bạn không?",
    hintLow: "Điểm thấp: thiếu giao tiếp cảm xúc → cân nhắc tư vấn gia đình/kỹ năng giao tiếp, đánh giá stress.",
  },
  {
    key: "R",
    title: "R – Resolve",
    desc: "Gia đình có dành thời gian cho nhau và cùng giải quyết vấn đề không?",
    hintLow: "Điểm thấp: thiếu thời gian/giải quyết xung đột kém → ưu tiên kế hoạch theo dõi, giảm stress, can thiệp từng bước.",
  },
];

function levelFromTotal(total: number) {
  // Thang thường dùng: 7–10 tốt; 4–6 nhẹ-trung bình; 0–3 nặng
  if (total >= 7) {
    return {
      label: "Chức năng gia đình tốt",
      desc: "Gia đình là nguồn lực hỗ trợ. Có thể giao kế hoạch tự quản, theo dõi định kỳ.",
    };
  }
  if (total >= 4) {
    return {
      label: "Rối loạn chức năng mức nhẹ–trung bình",
      desc: "Có dấu hiệu hạn chế chức năng. Nên khai thác thêm nguyên nhân và can thiệp trọng điểm.",
    };
  }
  return {
    label: "Rối loạn chức năng nặng",
    desc: "Nguy cơ cao xung đột/thiếu hỗ trợ. Cần đánh giá thêm an toàn, hỗ trợ tâm lý–xã hội và theo dõi sát.",
    };
}

function weakestIssues(scores: Record<ItemKey, Choice>) {
  const arr = ITEMS.map((it) => ({ it, score: scores[it.key] }));
  arr.sort((a, b) => a.score - b.score);
  return arr.filter((x) => x.score <= 1).slice(0, 2);
}

export default function FamilyAPGAR() {
  const navigate = useNavigate();

  const [scores, setScores] = useState<Record<ItemKey, Choice>>({
    A1: 1,
    P: 1,
    G: 1,
    A2: 1,
    R: 1,
  });

  const total = useMemo(() => {
    return (Object.values(scores) as number[]).reduce((s, x) => s + x, 0);
  }, [scores]);

  const level = useMemo(() => levelFromTotal(total), [total]);

  const issues = useMemo(() => weakestIssues(scores), [scores]);

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">Family APGAR</h1>
            <div className="calcSub">
              Sàng lọc chức năng gia đình (0–10). Mỗi mục: 0 (hầu như không bao giờ), 1 (thỉnh thoảng), 2 (hầu như luôn luôn).
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
                {idx + 1}/5 • {it.title}
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
            <div style={{ fontWeight: 900, fontSize: 16 }}>Kết quả Family APGAR</div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "white",
                fontWeight: 900,
              }}
            >
              Tổng điểm: {total}/10
            </div>
          </div>

          <div style={{ marginTop: 10, fontWeight: 900, fontSize: 18 }}>{level.label}</div>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, lineHeight: 1.5 }}>
            {level.desc}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý ưu tiên (mục điểm thấp)</div>

            {issues.length === 0 ? (
              <div style={{ color: "var(--muted)", fontWeight: 700 }}>
                Không có mục điểm thấp (0–1). Có thể tập trung kế hoạch điều trị và theo dõi định kỳ.
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
            Lưu ý: Family APGAR là công cụ sàng lọc chức năng gia đình, không thay thế đánh giá tâm lý–xã hội chi tiết.
          </div>
        </div>
      </div>
    </div>
  );
}
