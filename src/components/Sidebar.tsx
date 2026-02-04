// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type NavLinkClassNameFn = (props: { isActive: boolean }) => string;

const linkClass: NavLinkClassNameFn = ({ isActive }) =>
  isActive ? "sb__link sb__link--active" : "sb__link";

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sb ${isOpen ? "sb--open" : ""}`}>
      <div className="sb__brand">
        <div className="sb__logo">🩺</div>
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
        <NavLink to="/" className={linkClass}>
          Trang chủ
        </NavLink>

        <NavLink to="/tools" className={linkClass}>
          Công cụ tính toán
        </NavLink>

        <NavLink to="/dose-adjust" className={linkClass}>
          Điều chỉnh liều thuốc
        </NavLink>

        <NavLink to="/drug-interactions" className={linkClass}>
          Tương tác thuốc
        </NavLink>

        {/* ✅ MỚI: Hướng dẫn tiêm chủng */}
        <NavLink to="/immunization" className={linkClass}>
          Hướng dẫn tiêm chủng
        </NavLink>

        <NavLink to="/icd10" className={linkClass}>
          Tra cứu ICD-10
        </NavLink>

        <NavLink to="/contact" className={linkClass}>
          Liên hệ
        </NavLink>
      </nav>

      <div className="sb__footer">
        <span className="sb__chip">Phase 1 • Beta</span>
      </div>
    </aside>
  );
}
