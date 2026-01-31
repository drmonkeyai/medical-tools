import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  subtitle: string;
};

export default function SCORE2Placeholder({ title, subtitle }: Props) {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>{subtitle}</div>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ← Trở về trang trước
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "rgba(0,0,0,0.02)",
            color: "var(--muted)",
          }}
        >
          Tool đang được phát triển. Trang này sẽ có: nhập tuổi/giới/hút thuốc/HA/Cholesterol… và trả về nguy cơ SCORE2.
        </div>
      </div>
    </div>
  );
}
