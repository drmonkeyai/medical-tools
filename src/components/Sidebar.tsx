import { NavLink } from "react-router-dom";

type NavLinkClassNameFn = (props: { isActive: boolean }) => string;

const linkClass: NavLinkClassNameFn = ({ isActive }) =>
  isActive ? "sb__link sb__link--active" : "sb__link";

export default function Sidebar() {
  return (
    <aside className="sb">
      <div className="sb__brand">
        <div className="sb__logo">🩺</div>
        <div>
          <div className="sb__title">Hổ trợ bác sĩ</div>
          <div className="sb__sub">Medical tools</div>
        </div>
      </div>

      <nav className="sb__nav">
        <NavLink to="/" className={linkClass}>
          Trang chủ
        </NavLink>
        <NavLink to="/tools" className={linkClass}>
          Công cụ tính toán
        </NavLink>
        <NavLink to="/drug-interactions" className={linkClass}>
          Tương tác thuốc
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
