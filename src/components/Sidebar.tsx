// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type NavLinkClassNameFn = (props: { isActive: boolean }) => string;

const linkClass: NavLinkClassNameFn = ({ isActive }) =>
  isActive ? "sb__link sb__link--active" : "sb__link";

type Item = {
  label: string;
  to: string;
  icon: string; // dùng emoji để khỏi phụ thuộc lib icon
};

const items: Item[] = [
  { label: "Trang chủ", to: "/", icon: "🏠" },
  { label: "Công cụ tính toán", to: "/tools", icon: "✅" },
  { label: "Tiếp cận theo chứng", to: "/symptoms", icon: "🧭" },
  { label: "Điều chỉnh liều thuốc", to: "/dose-adjust", icon: "💊" },
  { label: "Tương tác thuốc", to: "/drug-interactions", icon: "🔁" },
  { label: "Hướng dẫn tiêm chủng", to: "/immunization", icon: "💉" },
  { label: "Tra cứu ICD-10", to: "/icd10", icon: "📘" },
  { label: "Liên hệ", to: "/contact", icon: "👤" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sb ${isOpen ? "sb--open" : ""}`}>
      <div className="sb__brand">
        <div className="sb__logo" aria-hidden="true">
          🩺
        </div>
        <div>
          <div className="sb__title">Hỗ trợ bác sĩ</div>
          <div className="sb__sub">Medical tools</div>
        </div>
      </div>

      {/* Khi bấm vào menu (trên mobile) -> đóng sidebar */}
      <nav
        className="sb__nav"
        onClick={() => {
          onClose?.();
        }}
      >
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === "/"} className={linkClass}>
            <span className="sb__i" aria-hidden="true">
              {it.icon}
            </span>
            <span className="sb__text">{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sb__footer">
        <span className="sb__chip">Phase 1 • Beta</span>
      </div>
    </aside>
  );
}
