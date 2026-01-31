import { useParams, Link } from "react-router-dom";
import { specialties } from "../data/tools";

export default function ToolPlaceholder() {
  const { slug } = useParams();

  const tools = specialties.flatMap((s) =>
    s.tools.map((t) => ({ ...t, specialtyName: s.name }))
  );

  const tool = tools.find((t) => t.route === `/tools/${slug}`);

  return (
    <div className="page">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>
          {tool ? tool.name : "Tool đang được phát triển"}
        </h2>

        <div style={{ color: "var(--muted)", marginBottom: 12 }}>
          {tool ? tool.specialtyName : "Không xác định"} •{" "}
          {tool ? tool.description : `slug: ${slug}`}
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
            style={{ textDecoration: "none", color: "var(--primary)" }}
          >
            ← Quay lại danh sách công cụ
          </Link>
        </div>
      </div>
    </div>
  );
}
