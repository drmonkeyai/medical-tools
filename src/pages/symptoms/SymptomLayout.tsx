import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export default function SymptomLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string; // ✅ thêm subtitle
  children?: ReactNode;
}) {
  return (
    <div className="page">
      <div className="calcHeader">
        <div>
          <h1 className="calcTitle">{title}</h1>

          <div className="calcSub">
            {subtitle ??
              "Khung tiếp cận: hỏi bệnh → khám → red flags → gợi ý xét nghiệm → chẩn đoán phân biệt."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">
            ← Danh sách chứng
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {children ?? (
          <>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>1) Hỏi bệnh nhanh</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Khởi phát – diễn tiến – mức độ</li>
              <li>Triệu chứng kèm theo</li>
              <li>Yếu tố nguy cơ / bệnh nền / thuốc đang dùng</li>
            </ul>

            <div className="divider" />

            <div style={{ fontWeight: 900, marginBottom: 8 }}>2) Red flags</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>…</li>
              <li>…</li>
            </ul>

            <div className="divider" />

            <div style={{ fontWeight: 900, marginBottom: 8 }}>3) Chẩn đoán phân biệt</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Nhóm nguy hiểm cần loại trừ</li>
              <li>Nhóm thường gặp</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
