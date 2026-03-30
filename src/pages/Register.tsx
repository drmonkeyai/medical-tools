import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase().replace(/\s+/g, "");

    if (!normalizedUsername) {
      setError("Tên đăng nhập là trường bắt buộc.");
      return;
    }

    if (!normalizedEmail) {
      setError("Email là trường bắt buộc.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email không hợp lệ.");
      return;
    }

    if (!password.trim()) {
      setError("Mật khẩu là trường bắt buộc.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu chưa khớp.");
      return;
    }

    try {
      setSubmitting(true);

      await signup({
        email: normalizedEmail,
        username: normalizedUsername,
        fullName,
        phone,
        title,
        password,
      });

      setSuccess("Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (err: any) {
      const raw = String(err?.message || "");

      if (raw.toLowerCase().includes("rate limit")) {
        setError(
          "Bạn đã gửi quá nhiều yêu cầu email xác nhận. Hãy đợi một lúc hoặc tắt Confirm Email khi test."
        );
      } else if (raw.toLowerCase().includes("invalid")) {
        setError("Email không hợp lệ hoặc có ký tự thừa. Hãy nhập lại email.");
      } else if (raw.toLowerCase().includes("saving new user")) {
        setError(
          "Không lưu được hồ sơ người dùng mới trong database. Hãy kiểm tra trigger và bảng profiles."
        );
      } else {
        setError(raw || "Không tạo được tài khoản.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(15,23,42,0.10)",
          padding: 28,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          Tạo tài khoản bác sĩ
        </h1>

        <p
          style={{
            marginTop: 10,
            marginBottom: 20,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Email và tên đăng nhập là 2 trường bắt buộc để tạo tài khoản.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <Field
            label="Tên đăng nhập *"
            value={username}
            onChange={setUsername}
          />

          <Field
            label="Email *"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <Field
            label="Họ và tên"
            value={fullName}
            onChange={setFullName}
          />

          <Field
            label="Số điện thoại"
            value={phone}
            onChange={setPhone}
          />

          <Field
            label="Chức danh"
            value={title}
            onChange={setTitle}
          />

          <Field
            label="Mật khẩu *"
            type="password"
            value={password}
            onChange={setPassword}
          />

          <Field
            label="Xác nhận mật khẩu *"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {error ? (
            <div
              style={{
                color: "#dc2626",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                color: "#059669",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            style={submitButtonStyle}
          >
            {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const { label, value, onChange, type = "text" } = props;

  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 56,
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  padding: "0 16px",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

const submitButtonStyle: React.CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
};