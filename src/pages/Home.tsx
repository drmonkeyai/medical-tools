import { Link } from "react-router-dom";
import { specialties } from "../data/tools";

export default function Home() {
  // Gom tất cả tool từ các chuyên khoa
  const tools = specialties.flatMap((s) =>
    s.tools.map((t) => ({
      ...t,
      specialtyName: s.name,
    }))
  );

  // Bạn có thể đổi logic "gần đây" sau này (localStorage),
  // tạm thời lấy 4 tool đầu để hiển thị
  const recentTools = tools.slice(0, 4);

  return (
    <div>
      <h1 className="pageTitle">Truy cập nhanh</h1>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="tileGrid">
          <Link className="tile" to="/tools">
            <div className="tile__icon">🧪</div>
            <div className="tile__label">eGFR / CKD</div>
            <div className="tile__sub">Tính mức lọc cầu thận</div>
          </Link>

          <Link className="tile" to="/tools/centor">
            <div className="tile__icon">😷</div>
            <div className="tile__label">Centor</div>
            <div className="tile__sub">Viêm họng do liên cầu</div>
          </Link>

          <Link className="tile" to="/tools/isi">
            <div className="tile__icon">🌙</div>
            <div className="tile__label">Mất ngủ (ISI)</div>
            <div className="tile__sub">Đánh giá mức độ</div>
          </Link>

          <Link className="tile" to="/tools/family-apgar">
            <div className="tile__icon">🏠</div>
            <div className="tile__label">Family APGAR</div>
            <div className="tile__sub">Chức năng gia đình</div>
          </Link>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: "span 7" }}>
          <h2 style={{ marginTop: 0 }}>Công cụ gần đây</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {recentTools.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {t.specialtyName}
                  </div>
                </div>
                <Link
                  to={t.route}
                  style={{ textDecoration: "none", color: "var(--primary)" }}
                >
                  Mở →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 5" }}>
          <h2 style={{ marginTop: 0 }}>Cập nhật mới</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)" }}>
            <li>Thêm eGFR (CKD-EPI 2021)</li>
            <li>Thêm Centor / ISI / APGAR / SCREEM</li>
            <li>Sắp có: Tương tác thuốc, ICD-10</li>
          </ul>

          <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
            Lưu ý: Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
          </div>
        </div>
      </div>
    </div>
  );
}
