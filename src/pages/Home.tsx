import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { specialties } from "../data/tools";

type ToolCard = {
  id: string;
  name: string;
  description: string;
  route: string;
  specialtyName?: string;
  icon?: string;
  isQuick?: boolean;
};

type UseCaseCard = {
  title: string;
  desc: string;
  route: string;
  icon: string;
  theme: string;
  badge?: string;
};

type HighlightCardType = {
  title: string;
  desc: string;
  route: string;
  icon: string;
  badge: string;
  badgeTone?: "new" | "soon" | "hot";
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= breakpoint);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

function pickTool(tools: ToolCard[], id: string, fallbackRoute?: string): ToolCard | null {
  const t = tools.find((x) => x.id === id);
  if (t) return t;

  if (fallbackRoute) {
    const byRoute = tools.find((x) => x.route === fallbackRoute);
    return byRoute ?? null;
  }

  return null;
}

function getToolTheme(toolId: string) {
  if (
    ["egfr", "cockcroft-gault", "aki-kdigo", "fena", "feurea", "dose-adjust"].includes(
      toolId
    )
  ) {
    return {
      bg: "linear-gradient(135deg, #eef5ff 0%, #dfeeff 100%)",
      accent: "#1d4ed8",
    };
  }

  if (
    [
      "score2",
      "score2-op",
      "score2-asian",
      "score2-diabetes",
      "cv-risk-esc",
      "who-pen-hearts",
      "cha2ds2-vasc",
      "has-bled",
      "qtc",
    ].includes(toolId)
  ) {
    return {
      bg: "linear-gradient(135deg, #fff1f2 0%, #ffe2e8 100%)",
      accent: "#e11d48",
    };
  }

  if (["bmi", "bsa", "hba1c-eag", "corrected-calcium"].includes(toolId)) {
    return {
      bg: "linear-gradient(135deg, #ecfeff 0%, #d9f8f4 100%)",
      accent: "#0f766e",
    };
  }

  if (["centor", "curb65", "wells-pe", "wells-dvt", "perc"].includes(toolId)) {
    return {
      bg: "linear-gradient(135deg, #f5f3ff 0%, #ece9ff 100%)",
      accent: "#6d28d9",
    };
  }

  if (["phq9", "gad7", "audit-c", "family-apgar", "screem", "pedigree"].includes(toolId)) {
    return {
      bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
      accent: "#ea580c",
    };
  }

  if (["qsofa", "sirs", "news2"].includes(toolId)) {
    return {
      bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      accent: "#059669",
    };
  }

  return {
    bg: "linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)",
    accent: "#334155",
  };
}

function getSpecialtyTheme(specialtyId: string) {
  switch (specialtyId) {
    case "family":
      return { icon: "👨‍👩‍👧", bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" };
    case "cardiology":
      return { icon: "❤️", bg: "linear-gradient(135deg, #fff1f2 0%, #ffe2e8 100%)" };
    case "nephrology":
      return { icon: "🫘", bg: "linear-gradient(135deg, #eef5ff 0%, #dfeeff 100%)" };
    case "respiratory":
      return { icon: "🫁", bg: "linear-gradient(135deg, #f5f3ff 0%, #ece9ff 100%)" };
    case "endocrine":
      return { icon: "🧬", bg: "linear-gradient(135deg, #ecfeff 0%, #d9f8f4 100%)" };
    case "infectious":
      return { icon: "🦠", bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" };
    default:
      return { icon: "🩺", bg: "linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)" };
  }
}

function badgeStyle(tone: "new" | "soon" | "hot" = "new") {
  if (tone === "hot") {
    return {
      background: "rgba(239,68,68,0.10)",
      color: "#dc2626",
      border: "1px solid rgba(239,68,68,0.18)",
    };
  }

  if (tone === "soon") {
    return {
      background: "rgba(100,116,139,0.10)",
      color: "#475569",
      border: "1px solid rgba(100,116,139,0.18)",
    };
  }

  return {
    background: "rgba(249,115,22,0.10)",
    color: "#ea580c",
    border: "1px solid rgba(249,115,22,0.18)",
  };
}

function SearchBar(props: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isMobile?: boolean;
}) {
  const { value, onChange, onSearch, onClear, isMobile } = props;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) auto auto",
        gap: 10,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "white",
          border: "1px solid rgba(29,78,216,0.20)",
          boxShadow: "0 10px 24px rgba(29,78,216,0.08)",
          borderRadius: 16,
          padding: "0 14px",
          minHeight: 52,
        }}
      >
        <span style={{ fontSize: 20, color: "var(--primary)" }}>🔎</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm công cụ, ví dụ: eGFR, SCORE2, BMI, PHQ-9..."
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: 16,
            background: "transparent",
            color: "#0f172a",
          }}
        />
      </div>

      <button
        onClick={onSearch}
        type="button"
        style={{
          minHeight: 52,
          borderRadius: 16,
          border: "none",
          padding: isMobile ? "0 16px" : "0 18px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "white",
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 10px 24px rgba(29,78,216,0.20)",
          whiteSpace: "nowrap",
          width: isMobile ? "100%" : "auto",
        }}
      >
        Tìm kiếm
      </button>

      <button
        onClick={onClear}
        type="button"
        style={{
          minHeight: 52,
          borderRadius: 16,
          border: "1px solid var(--line)",
          padding: isMobile ? "0 16px" : "0 16px",
          background: "white",
          color: "#0f172a",
          fontWeight: 900,
          cursor: "pointer",
          whiteSpace: "nowrap",
          width: isMobile ? "100%" : "auto",
        }}
      >
        Xóa
      </button>
    </div>
  );
}

function QuickToolCard(props: { tool: ToolCard; onOpen: () => void }) {
  const { tool, onOpen } = props;
  const theme = getToolTheme(tool.id);

  return (
    <button
      onClick={onOpen}
      type="button"
      style={{
        textAlign: "left",
        padding: 0,
        borderRadius: 22,
        border: "1px solid rgba(15,23,42,0.06)",
        background: theme.bg,
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ padding: 18 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.6)",
            fontSize: 28,
            marginBottom: 14,
          }}
        >
          {tool.icon ?? "🩺"}
        </div>

        <div style={{ fontWeight: 1000, fontSize: 16, color: "#0f172a" }}>{tool.name}</div>
        <div
          style={{
            marginTop: 8,
            color: "#475569",
            lineHeight: 1.5,
            minHeight: 48,
          }}
        >
          {tool.description}
        </div>

        <div style={{ marginTop: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(15,23,42,0.06)",
              fontWeight: 900,
              color: theme.accent,
            }}
          >
            Mở nhanh →
          </span>
        </div>
      </div>
    </button>
  );
}

function SearchResultCard(props: { tool: ToolCard; onOpen: () => void }) {
  const { tool, onOpen } = props;

  return (
    <button
      onClick={onOpen}
      type="button"
      style={{
        textAlign: "left",
        padding: 14,
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.06)",
        background: "white",
        cursor: "pointer",
        boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "rgba(29,78,216,0.06)",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {tool.icon ?? "🩺"}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 1000, fontSize: 16 }}>{tool.name}</div>
        <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.45 }}>
          {tool.description}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#1d4ed8", fontWeight: 900 }}>
          {tool.specialtyName ?? "Công cụ lâm sàng"}
        </div>
      </div>
    </button>
  );
}

function UseCaseActionCard(props: { item: UseCaseCard; onOpen: () => void }) {
  const { item, onOpen } = props;

  return (
    <button
      onClick={onOpen}
      type="button"
      style={{
        textAlign: "left",
        padding: 0,
        borderRadius: 22,
        border: "1px solid rgba(15,23,42,0.06)",
        background: "white",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          height: 92,
          background: item.theme,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.72)",
            fontSize: 24,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          {item.icon}
        </div>
      </div>

      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 1000,
            fontSize: 16,
            lineHeight: 1.4,
            color: "#0f172a",
            minHeight: 44,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {item.title}
        </div>

        <div
          style={{
            color: "var(--muted)",
            lineHeight: 1.6,
            minHeight: 78,
          }}
        >
          {item.desc}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.95)",
              border: "1px solid var(--line)",
              fontWeight: 900,
            }}
          >
            Mở ngay ↗
          </span>

          {item.badge && (
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(100,116,139,0.08)",
                color: "#475569",
                border: "1px solid rgba(100,116,139,0.12)",
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SpecialtyCard(props: {
  id: string;
  name: string;
  count: number;
  onOpen: () => void;
}) {
  const { id, name, count, onOpen } = props;
  const theme = getSpecialtyTheme(id);

  return (
    <button
      onClick={onOpen}
      type="button"
      style={{
        textAlign: "left",
        padding: 0,
        borderRadius: 22,
        border: "1px solid rgba(15,23,42,0.06)",
        background: "white",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
      }}
      title="Mở trang Tools và duyệt theo chuyên khoa"
    >
      <div
        style={{
          height: 78,
          background: theme.bg,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.70)",
            fontSize: 22,
          }}
        >
          {theme.icon}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 1000, fontSize: 16 }}>{name}</div>
        <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 15 }}>{count} công cụ</div>

        <div style={{ marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "rgba(255,255,255,0.95)",
              fontWeight: 900,
            }}
          >
            Mở →
          </span>
        </div>
      </div>
    </button>
  );
}

function HighlightCard(props: {
  item: HighlightCardType;
  onOpen: () => void;
}) {
  const { item, onOpen } = props;
  const badge = badgeStyle(item.badgeTone);

  return (
    <button
      onClick={onOpen}
      type="button"
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(15,23,42,0.06)",
        background: "white",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(29,78,216,0.06)",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {item.icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 1000, fontSize: 16 }}>{item.title}</div>
          <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            ...badge,
            padding: "7px 12px",
            borderRadius: 999,
            fontWeight: 900,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {item.badge}
        </span>

        <span
          style={{
            padding: "8px 14px",
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
  );
}

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const allTools = useMemo(() => {
    return specialties.flatMap((s) =>
      s.tools.map((t) => ({
        ...t,
        specialtyName: s.name,
      }))
    );
  }, []);

  const quickIds = ["egfr", "score2", "bmi", "isi", "centor", "curb65", "qsofa", "child-pugh"];

  const quickTools: ToolCard[] = useMemo(() => {
    const picked = quickIds
      .map((id) => pickTool(allTools as ToolCard[], id))
      .filter(Boolean) as ToolCard[];

    if (picked.length >= 8) return picked.slice(0, 8);

    const extra = (allTools as ToolCard[])
      .filter((t) => t.isQuick)
      .filter((t) => !picked.some((p) => p.id === t.id))
      .slice(0, 8 - picked.length);

    return picked.concat(extra).slice(0, 8);
  }, [allTools]);

  const featuredSpecialtyIds = useMemo(
    () => ["family", "cardiology", "nephrology", "respiratory", "endocrine", "infectious"],
    []
  );

  const featuredSpecialties = useMemo(() => {
    const map = new Map(specialties.map((s) => [s.id, s]));
    return featuredSpecialtyIds.map((id) => map.get(id)).filter(Boolean) as typeof specialties;
  }, [featuredSpecialtyIds]);

  const useCases: UseCaseCard[] = useMemo(
    () => [
      {
        title: "Tính liều thuốc",
        desc: "Tra nhanh công cụ chỉnh liều theo chức năng thận và gan.",
        route: "/dose-adjust",
        icon: "💊",
        theme: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      },
      {
        title: "Phân tầng nguy cơ tim mạch",
        desc: "SCORE2, SCORE2-OP, CHA₂DS₂-VASc và các công cụ tim mạch thường dùng.",
        route: "/tools?specialty=cardiology",
        icon: "❤️",
        theme: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
      },
      {
        title: "Sàng lọc trầm cảm / lo âu",
        desc: "PHQ-9, GAD-7 và các công cụ cho bác sĩ gia đình.",
        route: "/tools?specialty=family&q=phq",
        icon: "🧠",
        theme: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      },
      {
        title: "Phân tầng nhiễm trùng",
        desc: "qSOFA và các công cụ sàng lọc nguy cơ nặng.",
        route: "/tools?specialty=infectious",
        icon: "🦠",
        theme: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        badge: "Sắp mở rộng",
      },
    ],
    []
  );

  const highlights: HighlightCardType[] = useMemo(
    () => [
      {
        title: "Điều chỉnh liều thuốc",
        desc: "Gợi ý chỉnh liều theo eGFR hoặc Child-Pugh, phù hợp phòng khám và ngoại trú.",
        route: "/dose-adjust",
        icon: "💊",
        badge: "Hot",
        badgeTone: "hot",
      },
      {
        title: "SCORE2",
        desc: "Ước tính nguy cơ tim mạch 10 năm cho người 40–69 tuổi theo tiếp cận hiện đại.",
        route: "/tools/score2",
        icon: "❤️",
        badge: "Mới",
        badgeTone: "new",
      },
      {
        title: "AKI – KDIGO",
        desc: "Phân độ tổn thương thận cấp theo creatinin và niệu lượng.",
        route: "/tools/aki-kdigo",
        icon: "🫘",
        badge: "Mới",
        badgeTone: "new",
      },
    ],
    []
  );

  const submittedQuery = submittedSearch.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!submittedQuery) return [];

    return allTools
      .filter((t) => {
        const hay = `${t.name} ${t.description} ${t.specialtyName ?? ""}`.toLowerCase();
        return hay.includes(submittedQuery);
      })
      .slice(0, 8);
  }, [allTools, submittedQuery]);

  function handleSearch() {
    setSubmittedSearch(search.trim());
  }

  function handleClearSearch() {
    setSearch("");
    setSubmittedSearch("");
  }

  const hasSearch = submittedSearch.trim().length > 0;

  return (
    <div className="page">
      <div className="card">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            padding: isMobile ? "20px 16px" : "32px 28px",
            background:
              "radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
            border: "1px solid rgba(29,78,216,0.10)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 22,
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 30 : 52,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "#0f172a",
                maxWidth: 1100,
              }}
            >
              Công cụ hỗ trợ
              <br />
              ra quyết định lâm sàng
            </h1>

            <div
              style={{
                color: "#475569",
                fontSize: isMobile ? 16 : 18,
                lineHeight: 1.8,
                maxWidth: 1150,
              }}
            >
              Bộ công cụ hỗ trợ ra quyết định lâm sàng giúp chuẩn hóa đánh giá, tổng hợp dữ
              liệu và hỗ trợ lựa chọn hướng xử trí phù hợp ngay tại điểm chăm sóc. Từ tính
              toán nguy cơ, theo dõi xét nghiệm đến quản lý diễn tiến ca bệnh, mọi thông tin
              được tổ chức trực quan trên một nền tảng thống nhất.
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 16,
                background: "rgba(15,23,42,0.04)",
                border: "1px solid rgba(15,23,42,0.08)",
                color: "#0f172a",
                fontWeight: 800,
                width: "fit-content",
                maxWidth: "100%",
              }}
            >
              🔐 Đăng nhập để sử dụng tính năng quản lý ca bệnh.
            </div>

            <div style={{ width: "100%", maxWidth: 1200 }}>
              <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                isMobile={isMobile}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                width: "100%",
                maxWidth: 1200,
              }}
            >
              {quickTools.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(t.route)}
                  type="button"
                  style={{
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "rgba(255,255,255,0.88)",
                    borderRadius: 999,
                    padding: isMobile ? "8px 12px" : "10px 14px",
                    cursor: "pointer",
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  {t.icon ?? "⚡"} {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasSearch && (
          <div
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 22,
              border: "1px solid rgba(29,78,216,0.10)",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 1000, fontSize: isMobile ? 20 : 24, color: "#0f172a" }}>
                  Kết quả tìm kiếm
                </div>
                <div style={{ marginTop: 6, color: "var(--muted)" }}>
                  Từ khóa: <b>{submittedSearch}</b> • {searchResults.length} kết quả
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  border: "1px solid var(--line)",
                  background: "white",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Đóng kết quả
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid var(--line)",
                  background: "white",
                  color: "var(--muted)",
                  fontWeight: 800,
                }}
              >
                Không tìm thấy công cụ phù hợp. Thử lại với từ khóa như: <b>egfr</b>, <b>score2</b>,{" "}
                <b>bmi</b>, <b>qsofa</b>, <b>phq</b>.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {searchResults.map((tool) => (
                  <SearchResultCard
                    key={tool.id}
                    tool={tool}
                    onOpen={() => navigate(tool.route)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 1000, fontSize: isMobile ? 24 : 28, color: "#0f172a" }}>
                Truy cập nhanh
              </div>
              <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.5 }}>
                Các công cụ hay dùng nhất cho thực hành hàng ngày.
              </div>
            </div>

            <Link
              to="/tools"
              style={{
                textDecoration: "none",
                color: "var(--primary)",
                fontWeight: 900,
              }}
            >
              Xem tất cả →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {quickTools.slice(0, 4).map((t) => (
              <QuickToolCard key={t.id} tool={t} onOpen={() => navigate(t.route)} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontWeight: 1000, fontSize: isMobile ? 24 : 28, color: "#0f172a", marginBottom: 12 }}>
            Bạn đang cần gì?
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {useCases.map((item) => (
              <UseCaseActionCard key={item.title} item={item} onOpen={() => navigate(item.route)} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontWeight: 1000, fontSize: isMobile ? 24 : 28, color: "#0f172a", marginBottom: 12 }}>
            Khám phá theo chuyên khoa
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {featuredSpecialties.map((s) => (
              <SpecialtyCard
                key={s.id}
                id={s.id}
                name={s.name}
                count={s.tools?.length ?? 0}
                onOpen={() => navigate(`/tools?specialty=${s.id}`)}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontWeight: 1000, fontSize: isMobile ? 24 : 28, color: "#0f172a", marginBottom: 12 }}>
            Công cụ nổi bật hôm nay
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {highlights.map((h) => (
              <HighlightCard key={h.title} item={h} onOpen={() => navigate(h.route)} />
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid var(--line)",
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          Lưu ý: Công cụ mang tính tham khảo, không thay thế quyết định lâm sàng.
          <span style={{ marginLeft: 8 }}>
            •{" "}
            <Link
              to="/contact"
              style={{
                color: "var(--primary)",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Liên hệ / góp ý
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}