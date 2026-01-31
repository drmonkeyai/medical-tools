import { useNavigate } from "react-router-dom";

const ICD10_URL = "https://icd.kcb.vn/icd-10/icd10";

export default function ICD10() {
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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>ICD-10</h2>

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
            title="Trở về trang trước"
          >
            ← Trở về trang trước
          </button>
        </div>

        <div style={{ color: "var(--muted)", marginBottom: 12, marginTop: 10 }}>
          Nguồn: icd.kcb.vn • Chỉ mang tính tham khảo.
        </div>

        {/* Card ảnh bấm được */}
        <a
          href={ICD10_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textDecoration: "none",
            borderRadius: 16,
            border: "1px solid var(--line)",
            overflow: "hidden",
            background: "white",
            transition: "transform 0.12s ease",
          }}
          title="Mở tra cứu ICD-10"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform =
              "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform =
              "translateY(0px)";
          }}
        >
          <img
            src="/images/icd10-preview.png"
            alt="Tra cứu ICD-10"
            style={{ width: "100%", height: "auto", display: "block" }}
          />

          <div
            style={{
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, color: "var(--text)" }}>
              Bấm vào hình để mở tra cứu ICD-10
            </div>

            <div
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "white",
                color: "var(--primary)",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Mở ↗
            </div>
          </div>
        </a>

        {/* Nút mở (dự phòng) */}
        <div style={{ marginTop: 14 }}>
          <a
            href={ICD10_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              textDecoration: "none",
              color: "var(--primary)",
              fontWeight: 900,
            }}
          >
            Mở ICD-10 ở tab mới ↗
          </a>
        </div>
      </div>
    </div>
  );
}
