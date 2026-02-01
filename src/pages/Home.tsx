// src/pages/Home.tsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { specialties } from "../data/tools";

type ToolCard = {
  id: string;
  name: string;
  description: string;
  route: string;
  specialtyName?: string;
};

function pickTool(
  tools: ToolCard[],
  id: string,
  fallbackRoute?: string
): ToolCard | null {
  const t = tools.find((x) => x.id === id);
  if (t) return t;
  if (fallbackRoute) {
    const byRoute = tools.find((x) => x.route === fallbackRoute);
    return byRoute ?? null;
  }
  return null;
}

export default function Home() {
  const navigate = useNavigate();

  const allTools = useMemo(() => {
    return specialties.flatMap((s) =>
      s.tools.map((t) => ({
        ...t,
        specialtyName: s.name,
      }))
    );
  }, []);

  // ✅ 8 công cụ truy cập nhanh trên Home (ưu tiên lâm sàng)
  const quickIds = [
    "egfr",
    "score2",
    "bmi",
    "isi",
    "centor",
    "curb65",
    "qsofa",
    "child-pugh",
  ];

  const quickTools: ToolCard[] = useMemo(() => {
    const picked = quickIds
      .map((id) => pickTool(allTools as ToolCard[], id))
      .filter(Boolean) as ToolCard[];

    // Nếu thiếu tool (do chưa khai báo), fallback bằng isQuick đầu tiên
    if (picked.length >= 8) return picked.slice(0, 8);

    const extra = (allTools as ToolCard[])
      .filter((t) => (t as any).isQuick)
      .filter((t) => !picked.some((p) => p.id === t.id))
      .slice(0, 8 - picked.length);

    return picked.concat(extra).slice(0, 8);
  }, [allTools]);

  // ✅ Chuyên khoa “đề xuất” (rút gọn) để bấm nhanh
  const featuredSpecialtyIds = useMemo(
    () => ["family", "cardiology", "nephrology", "respiratory", "endocrine", "infectious"],
    []
  );

  const featuredSpecialties = useMemo(() => {
    const map = new Map(specialties.map((s) => [s.id, s]));
    return featuredSpecialtyIds.map((id) => map.get(id)).filter(Boolean);
  }, [featuredSpecialtyIds]);

  // ✅ "Mới / Nổi bật" (tối giản, dễ chỉnh)
  const highlights = useMemo(
    () => [
      {
        title: "Điều chỉnh liều thuốc",
        desc: "Gợi ý chỉnh liều theo eGFR (thận) và Child-Pugh (gan) — đang hoàn thiện",
        route: "/dose-adjust",
        badge: "Sắp có",
      },
      {
        title: "CHA₂DS₂-VASc",
        desc: "Đánh giá nguy cơ đột quỵ ở rung nhĩ (gợi ý kháng đông)",
        route: "/tools/cha2ds2-vasc",
        badge: "Mới",
      },
      {
        title: "Child–Pugh",
        desc: "Đánh giá mức độ xơ gan / chức năng gan",
        route: "/tools/child-pugh",
        badge: "Mới",
      },
    ],
    []
  );

  return (
    <div className="page">
      <div className="card">
        {/* Header / Hero */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ marginTop: 0, marginBottom: 6, fontSize: 26 }}>
              Công cụ tính toán hỗ trợ lâm sàng
            </h1>
            <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>
              Dùng nhanh trên trình duyệt • Miễn phí • Không thay thế quyết định lâm sàng
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/tools")}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "2px solid var(--primary)",
                background: "white",
                cursor: "pointer",
                fontWeight: 900,
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                height: 44,
              }}
              title="Mở danh sách công cụ"
            >
              Mở danh sách công cụ →
            </button>

            <button
              onClick={() => navigate("/drug-interactions")}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "white",
                cursor: "pointer",
                fontWeight: 900,
                height: 44,
              }}
              title="Tra tương tác thuốc"
            >
              Tương tác thuốc
            </button>
          </div>
        </div>

        {/* Quick access */}
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>Truy cập nhanh</div>

            <Link
              to="/tools"
              style={{
                textDecoration: "none",
                color: "var(--primary)",
                fontWeight: 800,
              }}
            >
              Xem tất cả →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {quickTools.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(t.route)}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 900 }}>{t.name}</div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {t.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured specialties */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
            Theo chuyên khoa
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 10,
            }}
          >
            {featuredSpecialties.map((s: any) => (
              <button
                key={s.id}
                onClick={() => navigate("/tools")}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  background: "white",
                  cursor: "pointer",
                }}
                title="Mở trang Tools và duyệt theo chuyên khoa"
              >
                <div style={{ fontWeight: 900 }}>{s.name}</div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {s.tools?.length ? `${s.tools.length} công cụ` : "Đang cập nhật"}
                </div>
                <div style={{ marginTop: 10 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid var(--line)",
                      background: "rgba(0,0,0,0.02)",
                      fontWeight: 800,
                    }}
                  >
                    Mở →
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div style={{ color: "var(--muted)", marginTop: 10, fontSize: 13 }}>
            * Gợi ý: hiện tại click sẽ mở trang Tools. Nếu bạn muốn lọc đúng chuyên khoa ngay,
            mình sẽ thêm query param <code>?specialty=...</code> cho bạn.
          </div>
        </div>

        {/* Highlights */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
            Nổi bật / Mới cập nhật
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {highlights.map((h) => (
              <button
                key={h.title}
                onClick={() => navigate(h.route)}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{h.title}</div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>
                    {h.desc}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid var(--line)",
                      background: "rgba(0,0,0,0.02)",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.badge}
                  </span>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid var(--line)",
                      background: "white",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Mở →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 18, color: "var(--muted)", fontSize: 13 }}>
          Lưu ý: Công cụ mang tính tham khảo, không thay thế quyết định lâm sàng.
          <span style={{ marginLeft: 8 }}>
            • <Link to="/contact" style={{ color: "var(--primary)", fontWeight: 800, textDecoration: "none" }}>Liên hệ</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
