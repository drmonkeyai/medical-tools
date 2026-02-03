// src/components/Topbar.tsx
import { useEffect, useMemo, useState } from "react";
import { useCases } from "../context/CasesContext";
import CaseTabs from "./CaseTabs";

type TopbarProps = {
  onToggleSidebar?: () => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// ✅ Ví dụ: "Thứ Ba ngày 03 tháng 02 năm 2026 12h30 chiều"
function formatDateTimeVNFull(d: Date) {
  const weekdays = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  const wd = weekdays[d.getDay()];
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();

  const hh = d.getHours();
  const min = pad2(d.getMinutes());
  const buoi = hh < 12 ? "sáng" : "chiều";

  return `${wd} ngày ${dd} tháng ${mm} năm ${yyyy} ${pad2(hh)}h${min} ${buoi}`;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { cases, openNewCaseModal } = useCases();

  const [now, setNow] = useState(() => new Date());
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const text = useMemo(() => formatDateTimeVNFull(now), [now]);

  return (
    <div
      className="tb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
      }}
    >
      <button
        className="tb__menu"
        onClick={onToggleSidebar}
        title="Mở menu"
        type="button"
      >
        ☰
      </button>

      {/* ✅ Time chip: co theo nội dung, không dàn trải */}
      <div
        className="tb__search"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          width: "fit-content",
          maxWidth: 520, // đủ cho format dài
          minWidth: 260,
          padding: "10px 12px",
          borderRadius: 14,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: hover
            ? "rgba(37, 99, 235, 0.35)"
            : "rgba(37, 99, 235, 0.22)",
          background: hover
            ? "linear-gradient(180deg, rgba(37,99,235,0.10), rgba(37,99,235,0.06))"
            : "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(37,99,235,0.04))",
          boxShadow: hover
            ? "0 6px 18px rgba(37,99,235,0.10)"
            : "0 2px 10px rgba(0,0,0,0.04)",
          transition: "all 160ms ease",
          flex: "0 0 auto",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="Thời gian hiện tại"
      >
        <span
          style={{
            opacity: 0.95,
            fontSize: 15,
            color: "rgba(37,99,235,0.95)",
            lineHeight: 1,
          }}
        >
          🕒
        </span>

        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "rgba(15, 23, 42, 0.92)",
            minWidth: 0,
          }}
          title={text}
        >
          {text}
        </div>
      </div>

      {/* Case tabs */}
      {cases.length ? (
        <CaseTabs />
      ) : (
        <div style={{ flex: 1, color: "var(--muted)", fontWeight: 800 }}>
          Chưa chọn ca • bấm <b>+ Tạo ca mới</b>
        </div>
      )}

      <div
        className="tb__right"
        style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}
      >
        <button className="tb__btn" type="button" onClick={openNewCaseModal}>
          ＋ Tạo ca mới
        </button>
        <div className="tb__avatar">👤</div>
      </div>
    </div>
  );
}
