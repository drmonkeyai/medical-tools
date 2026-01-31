export default function Contact() {
  return (
    <div className="page">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Liên hệ & Giới thiệu</h2>

        {/* Giới thiệu dự án */}
        <section style={{ marginTop: 12 }}>
          <h3>Giới thiệu</h3>
          <p style={{ lineHeight: 1.6, color: "var(--text)" }}>
            <strong>Medical Tools</strong> là web app hỗ trợ bác sĩ và nhân viên y tế
            trong thực hành lâm sàng hằng ngày, với mục tiêu:
          </p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
            <li>Tra cứu nhanh các thang điểm, chỉ số và công cụ y khoa.</li>
            <li>Giảm thời gian thao tác trong quá trình khám bệnh.</li>
            <li>Giao diện thống nhất, dễ sử dụng, dễ mở rộng.</li>
          </ul>

          <p style={{ lineHeight: 1.6, color: "var(--muted)" }}>
            Ứng dụng đang trong giai đoạn <strong>Phase 1 (Beta)</strong> và sẽ
            tiếp tục được hoàn thiện trong thời gian tới.
          </p>
        </section>

        {/* Thông tin tác giả */}
        <section style={{ marginTop: 20 }}>
          <h3>Tác giả</h3>

          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              BS Nguyễn Minh Nhân
            </div>

            <div style={{ marginTop: 6, lineHeight: 1.6 }}>
              Bác sĩ gia đình - Bác sĩ Y học dự phòng
            </div>

            <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.6 }}>
              Quan tâm đến ứng dụng công nghệ thông tin trong y học,
              tối ưu hoá quy trình khám chữa bệnh và hỗ trợ quyết định lâm sàng.
            </div>
          </div>
        </section>

        {/* Lưu ý y khoa */}
        <section style={{ marginTop: 20 }}>
          <h3>Lưu ý</h3>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(255, 193, 7, 0.08)",
              lineHeight: 1.6,
            }}
          >
            Các công cụ và nội dung trong website chỉ mang tính chất{" "}
            <strong>hỗ trợ tham khảo</strong>, không thay thế cho đánh giá
            và quyết định lâm sàng của bác sĩ điều trị.
          </div>
        </section>

        {/* Gợi ý liên hệ tương lai */}
        <section style={{ marginTop: 20 }}>
          <h3>Góp ý & phản hồi</h3>
          <p style={{ lineHeight: 1.6, color: "var(--muted)" }}>
            Trang liên hệ chi tiết (email / form góp ý) sẽ được bổ sung
            trong các phiên bản tiếp theo.
          </p>
        </section>
      </div>
    </div>
  );
}
