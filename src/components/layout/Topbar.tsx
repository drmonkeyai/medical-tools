import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type TopbarProps = {
  onToggleSidebar?: () => void;
};

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const doctorName =
    user?.displayName?.trim() ||
    user?.username?.trim() ||
    "";

  const displayName = doctorName ? `BS ${doctorName}` : "BS";

  const simpleBtnStyle: CSSProperties = {
    height: 38,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid rgba(37, 99, 235, 0.22)",
    background: "#fff",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    boxShadow: "none",
    outline: "none",
  };

  const isMyCasesPage = location.pathname === "/my-cases";

  return (
    <div
      className="tb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        background: "#fff",
      }}
    >
      <button
        className="tb__menu"
        onClick={onToggleSidebar}
        title="Mở menu"
        type="button"
        style={{ flex: "0 0 auto" }}
      >
        ☰
      </button>

      <div style={{ flex: 1 }} />

      <div
        className="tb__right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flex: "0 0 auto",
          marginLeft: "auto",
          border: "none",
          background: "transparent",
          boxShadow: "none",
          outline: "none",
          padding: 0,
          borderRadius: 0,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {isAuthenticated ? (
          <>
            <Link
              to="/my-cases"
              style={{
                ...simpleBtnStyle,
                background: isMyCasesPage ? "#2563eb" : "#fff",
                color: isMyCasesPage ? "#fff" : "#2563eb",
                border: "1px solid #2563eb",
              }}
            >
              Quản lý bệnh nhân
            </Link>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#0f172a",
                fontWeight: 700,
                whiteSpace: "nowrap",
                border: "none",
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
              title={displayName}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(37, 99, 235, 0.08)",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                👤
              </span>

              <span
                style={{
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </span>
            </div>

            <button type="button" onClick={handleLogout} style={simpleBtnStyle}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
                        <Link to="/login" style={simpleBtnStyle}>
              Đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  );
}