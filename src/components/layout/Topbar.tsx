import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCases } from "../../context/CasesContext";
import { useAuth } from "../../context/AuthContext";
import CaseTabs from "../case/CaseTabs";

type TopbarProps = {
  onToggleSidebar?: () => void;
};

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { cases, openNewCaseModal } = useCases();
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

  function handleCreateCaseClick() {
    if (!isAuthenticated) {
      alert("Bác sĩ cần đăng nhập để sử dụng tính năng tạo ca.");
      return;
    }
    openNewCaseModal();
  }

  const displayName =
    user?.displayName?.trim() ||
    user?.username?.trim() ||
    user?.email?.trim() ||
    "Administrator";

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

      <button
        className="tb__btn"
        type="button"
        onClick={handleCreateCaseClick}
        style={{
          ...simpleBtnStyle,
          background: "#2563eb",
          color: "#fff",
          border: "1px solid #2563eb",
          flex: "0 0 auto",
        }}
      >
        + Tạo ca mới
      </button>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {cases.length ? (
          <div style={{ minWidth: 0, width: "100%" }}>
            <CaseTabs />
          </div>
        ) : (
          <div
            style={{
              color: "var(--muted)",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Chưa chọn ca • bấm <b>+ Tạo ca mới</b>
          </div>
        )}
      </div>

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
              Ca của tôi
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
              title={user?.email || ""}
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
                  maxWidth: 180,
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
          <Link to="/login" style={simpleBtnStyle}>
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}