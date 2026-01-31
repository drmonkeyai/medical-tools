import { Link, useNavigate, useParams } from "react-router-dom";
import { specialties } from "../data/tools";

import ISI from "../calculators/ISI";
import EGFR from "../calculators/EGFR";

import SCORE2 from "../calculators/SCORE2";
import SCORE2OP from "../calculators/SCORE2OP";
import SCORE2ASIAN from "../calculators/SCORE2ASIAN";
import SCORE2DIABETES from "../calculators/SCORE2DIABETES";

export default function ToolPlaceholder() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Render tool thật
  if (slug === "isi") return <ISI />;
  if (slug === "egfr") return <EGFR />;

  // Tim mạch (calculator thật)
  if (slug === "score2") return <SCORE2 />;
  if (slug === "score2-op") return <SCORE2OP />;
  if (slug === "score2-asian") return <SCORE2ASIAN />;
  if (slug === "score2-diabetes") return <SCORE2DIABETES />;

  // Fallback: nếu slug chưa có calculator
  const tools = specialties.flatMap((s) =>
    s.tools.map((t) => ({ ...t, specialtyName: s.name }))
  );

  const tool = tools.find((t) => t.route === `/tools/${slug}`);

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
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>
            {tool ? tool.name : "Tool đang được phát triển"}
          </h2>

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
          {tool ? tool.specialtyName : "Không xác định chuyên khoa"} •{" "}
          {tool ? tool.description : `slug: ${slug ?? ""}`}
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          Trang này sẽ chứa form nhập liệu + tính điểm + diễn giải kết quả.
        </div>

        <div style={{ marginTop: 14 }}>
          <Link
            to="/tools"
            style={{
              textDecoration: "none",
              color: "var(--primary)",
              fontWeight: 800,
            }}
          >
            ← Quay lại danh sách công cụ
          </Link>
        </div>
      </div>
    </div>
  );
}
