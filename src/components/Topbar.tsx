import { useEffect, useMemo, useState } from "react";

type TopbarProps = {
  onToggleSidebar?: () => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateTimeVN(d: Date) {
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
  const hh = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${wd}, ${dd}/${mm}/${yyyy} • ${hh}:${min}`;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const [now, setNow] = useState(() => new Date());
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const text = useMemo(() => formatDateTimeVN(now), [now]);

  return (
    <div className="tb">
      {/* Nút mở menu (mobile) - hiện/ẩn bằng CSS .tb__menu */}
      <button
        className="tb__menu"
        onClick={onToggleSidebar}
        title="Mở menu"
        type="button"
      >
        ☰
      </button>

      {/* Ô thời gian: nổi bật vừa phải */}
      <div
        className="tb__search"
        style={{
          maxWidth: 760,
          width: "fit-content",
          paddingLeft: 14,
          paddingRight: 14,
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
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="Thời gian hiện tại"
      >
        <span
          style={{
            opacity: 0.95,
            fontSize: 16,
            color: "rgba(37,99,235,0.95)",
          }}
        >
          🕒
        </span>

        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "rgba(15, 23, 42, 0.92)",
          }}
          title={text}
        >
          {text}
        </div>
      </div>

      <div className="tb__right">
        <button className="tb__btn">＋ Tạo ca mới</button>
        <div className="tb__avatar">👤</div>
      </div>
    </div>
  );
}
