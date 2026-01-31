import { useEffect, useMemo, useState } from "react";

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

export default function Topbar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const text = useMemo(() => formatDateTimeVN(now), [now]);

  return (
    <div className="tb">
      {/* đồng bộ style bằng tb__search */}
      <div className="tb__search" style={{ maxWidth: 760 }}>
        <span style={{ opacity: 0.7, fontSize: 16 }}>🕒</span>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
