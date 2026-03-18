// src/pages/Home.tsx
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

type HighlightCard = {
  title: string;
  desc: string;
  route: string;
  icon: string;
  badge: string;
  badgeTone?: "new" | "soon" | "hot";
};

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  lunarDayShort: string;
};

const MONTH_NAMES = [
  "THÁNG 1",
  "THÁNG 2",
  "THÁNG 3",
  "THÁNG 4",
  "THÁNG 5",
  "THÁNG 6",
  "THÁNG 7",
  "THÁNG 8",
  "THÁNG 9",
  "THÁNG 10",
  "THÁNG 11",
  "THÁNG 12",
];

const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

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

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function getVietnameseWeekday(date: Date) {
  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return weekdays[date.getDay()];
}

function formatSolarDate(date: Date) {
  return `${getVietnameseWeekday(date)}, ngày ${pad2(date.getDate())}/${pad2(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

function formatSolarDateShort(date: Date) {
  return `${getVietnameseWeekday(date)}, ${pad2(date.getDate())}/${pad2(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

function formatLunarDateApprox(date: Date) {
  try {
    const fmt = new Intl.DateTimeFormat("vi-VN-u-ca-chinese", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return fmt.format(date);
  } catch {
    return "Chưa hỗ trợ âm lịch trên trình duyệt này";
  }
}

function getLunarDayShort(date: Date) {
  try {
    const parts = new Intl.DateTimeFormat("vi-VN-u-ca-chinese", {
      day: "numeric",
    }).formatToParts(date);

    const dayPart = parts.find((p) => p.type === "day")?.value ?? "";
    return dayPart ? `Âm ${dayPart}` : "Âm";
  } catch {
    return "Âm";
  }
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarGrid(baseDate: Date): CalendarCell[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = firstOfMonth.getDay();
  const startDate = new Date(year, month, 1 - firstDay);
  const today = new Date();

  return Array.from({ length: 42 }, (_, idx) => {
    const cellDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + idx
    );

    return {
      date: cellDate,
      inCurrentMonth: cellDate.getMonth() === month,
      isToday: isSameDate(cellDate, today),
      isWeekend: cellDate.getDay() === 0 || cellDate.getDay() === 6,
      lunarDayShort: getLunarDayShort(cellDate),
    };
  });
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
  if (["egfr", "cockcroft-gault", "aki-kdigo", "fena", "feurea", "dose-adjust"].includes(toolId)) {
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
        gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto",
        gap: 10,
        width: "100%",
        maxWidth: isMobile ? "100%" : 680,
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
        <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.45 }}>{tool.description}</div>
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
      }}
    >
      <div
        style={{
          height: 78,
          background: item.theme,
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
            background: "rgba(255,255,255,0.65)",
            fontSize: 22,
          }}
        >
          {item.icon}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 1000, fontSize: 16 }}>{item.title}</div>
        <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.5, minHeight: 46 }}>
          {item.desc}
        </div>

        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
  item: HighlightCard;
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

function CalendarPanel(props: { now: Date; isMobile?: boolean }) {
  const { now, isMobile } = props;

  const [viewDate, setViewDate] = useState<Date>(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(now));

  const cells = useMemo(() => buildCalendarGrid(viewDate), [viewDate]);

  const selectedSolarText = formatSolarDateShort(selectedDate);
  const selectedLunarText = formatLunarDateApprox(selectedDate);

  function moveMonth(delta: number) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function moveYear(delta: number) {
    setViewDate((prev) => new Date(prev.getFullYear() + delta, prev.getMonth(), 1));
  }

  function goToday() {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  return (
    <div
      style={{
        minHeight: 260,
        position: "relative",
        borderRadius: 28,
        background: "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.50) 100%)",
        border: "1px solid rgba(255,255,255,0.70)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
        overflow: "hidden",
        padding: isMobile ? 12 : 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.10), transparent 24%), radial-gradient(circle at 75% 30%, rgba(168,85,247,0.08), transparent 22%), radial-gradient(circle at 70% 75%, rgba(16,185,129,0.08), transparent 22%)",
        }}
      />

      <div style={{ position: "relative" }}>
        <div
          style={{
            padding: isMobile ? 10 : 14,
            borderRadius: 22,
            background: "rgba(255,255,255,0.84)",
            border: "1px solid rgba(15,23,42,0.06)",
            boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "flex-start",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 1000,
                  color: "#0f172a",
                  lineHeight: 1.45,
                }}
              >
                {selectedSolarText}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "#475569",
                  lineHeight: 1.45,
                  fontSize: isMobile ? 13 : 14,
                }}
              >
                Âm lịch: <b>{selectedLunarText}</b>
              </div>
            </div>

            <button
              type="button"
              onClick={goToday}
              style={{
                border: "1px solid var(--line)",
                background: "white",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 900,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                width: isMobile ? "100%" : "auto",
              }}
            >
              Hôm nay
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              onClick={() => moveYear(-1)}
              style={{
                border: "1px solid var(--line)",
                background: "white",
                borderRadius: 12,
                padding: "8px 12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              « Năm
            </button>

            <button
              type="button"
              onClick={() => moveMonth(-1)}
              style={{
                border: "1px solid var(--line)",
                background: "white",
                borderRadius: 12,
                padding: "8px 12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ‹ Tháng
            </button>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              style={{
                border: "1px solid var(--line)",
                background: "white",
                borderRadius: 12,
                padding: "8px 12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Tháng ›
            </button>

            <button
              type="button"
              onClick={() => moveYear(1)}
              style={{
                border: "1px solid var(--line)",
                background: "white",
                borderRadius: 12,
                padding: "8px 12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Năm »
            </button>
          </div>

          <div
            style={{
              marginBottom: 10,
              fontSize: 13,
              fontWeight: 900,
              color: "#475569",
            }}
          >
            {MONTH_NAMES[viewDate.getMonth()]} / {viewDate.getFullYear()}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderTop: "1px solid rgba(15,23,42,0.08)",
              borderLeft: "1px solid rgba(15,23,42,0.08)",
              background: "white",
            }}
          >
            {WEEKDAY_SHORT.map((label, idx) => (
              <div
                key={label}
                style={{
                  minHeight: 30,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 1000,
                  color: idx === 0 ? "#dc2626" : idx === 6 ? "#2563eb" : "#475569",
                  borderRight: "1px solid rgba(15,23,42,0.08)",
                  borderBottom: "1px solid rgba(15,23,42,0.08)",
                  background: "#f8fafc",
                }}
              >
                {label}
              </div>
            ))}

            {cells.map((cell, idx) => {
              const isSelected = isSameDate(cell.date, selectedDate);

              const baseTextColor = !cell.inCurrentMonth
                ? "#94a3b8"
                : cell.date.getDay() === 0
                  ? "#dc2626"
                  : cell.date.getDay() === 6
                    ? "#2563eb"
                    : "#111827";

              const dayColor = isSelected ? "#ffffff" : baseTextColor;
              const lunarColor = isSelected
                ? "rgba(255,255,255,0.92)"
                : !cell.inCurrentMonth
                  ? "#cbd5e1"
                  : "#64748b";

              return (
                <button
                  key={`${cell.date.toISOString()}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDate(new Date(cell.date))}
                  style={{
                    minHeight: isMobile ? 52 : 66,
                    padding: 6,
                    border: "none",
                    borderRight: "1px solid rgba(15,23,42,0.08)",
                    borderBottom: "1px solid rgba(15,23,42,0.08)",
                    background: isSelected
                      ? "#1d4ed8"
                      : cell.isToday
                        ? "rgba(29,78,216,0.08)"
                        : "white",
                    position: "relative",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  title={`${formatSolarDate(cell.date)} • ${formatLunarDateApprox(cell.date)}`}
                >
                  <div
                    style={{
                      fontWeight: 1000,
                      fontSize: isMobile ? 14 : 16,
                      lineHeight: 1.1,
                      color: dayColor,
                    }}
                  >
                    {cell.date.getDate()}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: isMobile ? 9 : 10,
                      fontWeight: 800,
                      color: lunarColor,
                      lineHeight: 1.2,
                    }}
                  >
                    {cell.lunarDayShort}
                  </div>

                  {cell.isToday && !isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        right: 6,
                        top: 6,
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: "#1d4ed8",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

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
    const picked = quickIds.map((id) => pickTool(allTools as ToolCard[], id)).filter(Boolean) as ToolCard[];

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
        title: "Đánh giá nguy cơ tim mạch",
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

  const highlights: HighlightCard[] = useMemo(
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
            padding: isMobile ? "18px 14px" : "28px 26px",
            background:
              "radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
            border: "1px solid rgba(29,78,216,0.10)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "minmax(320px, 1.02fr) minmax(460px, 0.98fr)",
              gap: 24,
              alignItems: isMobile ? "stretch" : "start",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.14)",
                  color: "#1d4ed8",
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                🩺 Hỗ trợ bác sĩ
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 28 : 44,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "#0f172a",
                }}
              >
                Công cụ lâm sàng
                <br />
                nhanh – chính xác – miễn phí
              </h1>

              <div
                style={{
                  marginTop: 14,
                  color: "#475569",
                  fontSize: isMobile ? 16 : 18,
                  lineHeight: 1.6,
                  maxWidth: 720,
                }}
              >
                Thiết kế cho bác sĩ gia đình và lâm sàng ngoại trú:
                tra cứu nhanh, tính toán rõ ràng, thao tác gọn trên trình duyệt.
              </div>

              <div style={{ marginTop: 20 }}>
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
                  marginTop: 18,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
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

            <CalendarPanel now={now} isMobile={isMobile} />
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
                Không tìm thấy công cụ phù hợp. Thử lại với từ khóa như: <b>egfr</b>, <b>score2</b>, <b>bmi</b>, <b>qsofa</b>, <b>phq</b>.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(auto-fit, minmax(260px, 1fr))",
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
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(220px, 1fr))",
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
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(220px, 1fr))",
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
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(240px, 1fr))",
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