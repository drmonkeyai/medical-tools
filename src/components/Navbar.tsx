import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "white" : "#222",
  background: isActive ? "#111" : "transparent",
  border: "1px solid #ddd",
});

export default function Navbar() {
  return (
    <div style={{ borderBottom: "1px solid #eee", background: "white" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 800, marginRight: 8 }}>🩺 Medical Tools</div>

        <NavLink to="/" style={linkStyle}>
          Trang chủ
        </NavLink>
        <NavLink to="/tools" style={linkStyle}>
          Công cụ y khoa
        </NavLink>
        <NavLink to="/drug-interactions" style={linkStyle}>
          Tương tác thuốc
        </NavLink>
        <NavLink to="/icd10" style={linkStyle}>
          ICD-10
        </NavLink>
        <NavLink to="/contact" style={linkStyle}>
          Liên hệ
        </NavLink>
      </div>
    </div>
  );
}
