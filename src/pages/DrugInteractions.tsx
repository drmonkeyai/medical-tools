import { useNavigate } from "react-router-dom";

const SOURCES = [
  {
    key: "diadr",
    name: "DI & ADR Quốc gia (NHIC)",
    url: "https://tuongtacthuoc.nhic.vn/Home/CSDLTuongTacThuoc",
    img: "/images/diadr.png",
  },
  {
    key: "drugscom",
    name: "Drugs.com – Drug Interactions",
    url: "https://www.drugs.com/drug_interactions.html",
    img: "/images/drugscom.png",
  },
];

export default function DrugInteractions() {
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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Tương tác thuốc</h2>

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

        <div style={{ color: "var(--muted)", marginBottom: 14, marginTop: 10 }}>
          Chọn nguồn tra cứu. Bấm vào logo để mở trang tương tác thuốc ở tab mới.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {SOURCES.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Mở ${s.name}`}
              style={{
                textDecoration: "none",
                borderRadius: 16,
                border: "1px solid var(--line)",
                background: "white",
                overflow: "hidden",
                transition: "transform 0.12s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0px)";
              }}
            >
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 130,
                }}
              >
                <img
                  src={s.img}
                  alt={s.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 90,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--line)",
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 900, color: "var(--text)" }}>
                  {s.name}
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
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "rgba(0,0,0,0.02)",
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Lưu ý: Các trang tra cứu là nguồn bên ngoài. Kết quả chỉ mang tính tham khảo,
          không thay thế quyết định lâm sàng.
        </div>
      </div>
    </div>
  );
}
