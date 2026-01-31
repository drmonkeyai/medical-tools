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
          <div className="sb__title">Dashboard</div>
          <div className="sb__sub">Medical Tools</div>
        </div>
      </div>

      <nav className="sb__nav">
        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/tools" className={linkClass}>
          Calculators
        </NavLink>
        <NavLink to="/drug-interactions" className={linkClass}>
          Drug Interactions
        </NavLink>
        <NavLink to="/icd10" className={linkClass}>
          ICD-10
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
