import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DoctorProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setUsername(user?.username ?? "");
    setPhone(user?.phone ?? "");
    setTitle(user?.title ?? "");
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setError("Tên đăng nhập là bắt buộc.");
      return;
    }

    try {
      setSubmitting(true);

      await updateProfile({
        username: normalizedUsername,
        fullName,
        phone,
        title,
      });

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Không cập nhật được hồ sơ bác sĩ.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          padding: 28,
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          Hồ sơ bác sĩ
        </h1>

        <p
          style={{
            marginTop: 10,
            marginBottom: 24,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Cập nhật thông tin tài khoản bác sĩ. Email là tài khoản đăng nhập, tên đăng nhập là
          trường bắt buộc.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <Field
            label="Họ và tên"
            value={fullName}
            onChange={setFullName}
            placeholder="Nhập họ và tên"
          />

          <Field
            label="Tên đăng nhập *"
            value={username}
            onChange={setUsername}
            placeholder="Nhập tên đăng nhập"
            required
          />

          <Field
            label="Email *"
            value={user?.email ?? ""}
            onChange={() => {}}
            placeholder=""
            readOnly
          />

          <Field
            label="Số điện thoại"
            value={phone}
            onChange={setPhone}
            placeholder="Nhập số điện thoại"
          />

          <Field
            label="Chức danh"
            value={title}
            onChange={setTitle}
            placeholder="Ví dụ: Bác sĩ gia đình, BSCKI, ThS.BS..."
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

          <button
            type="submit"
            disabled={submitting}
            style={{
              height: 46,
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.85 : 1,
            }}
          >
            {submitting ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  const { label, value, onChange, placeholder, required, readOnly } = props;

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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          padding: "0 14px",
          fontSize: 16,
          outline: "none",
          boxSizing: "border-box",
          background: readOnly ? "#f8fafc" : "#fff",
          color: "#0f172a",
        }}
      />
    </div>
  );
}