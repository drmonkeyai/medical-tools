// src/pages/symptoms/ho.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SymptomLayout from "./SymptomLayout";

type Risk = "low" | "moderate" | "high" | "very-high";
function RiskBadge({ level, text }: { level: Risk; text: string }) {
  const cls =
    level === "low"
      ? "badge badge--low"
      : level === "moderate"
      ? "badge badge--moderate"
      : level === "high"
      ? "badge badge--high"
      : "badge badge--very-high";
  return (
    <span className={cls}>
      <span className="badge__dot" />
      {text}
    </span>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
      <div style={{ fontWeight: 900, fontSize: 14 }}>{n}</div>
      <div style={{ fontWeight: 900, fontSize: 14 }}>{title}</div>
    </div>
  );
}

type Flag = { id: string; label: string };

const redFlags: Flag[] = [
  { id: "rf_hemoptysis", label: "Ho ra máu" },
  { id: "rf_dyspnea_spo2", label: "Khó thở tiến triển / SpO₂ giảm" },
  { id: "rf_chest_pain_severe", label: "Đau ngực dữ dội" },
  { id: "rf_high_fever", label: "Sốt cao kéo dài, rét run" },
  { id: "rf_weight_loss", label: "Sụt cân không chủ ý" },
  { id: "rf_hoarseness_3w", label: "Khàn tiếng kéo dài > 3 tuần" },
  { id: "rf_dysphagia", label: "Nuốt nghẹn, nghẹn khi ăn" },
  { id: "rf_chest_pain_cvd_risk", label: "Đau ngực + yếu tố nguy cơ tim mạch" },
  { id: "rf_history_tb_cancer_immuno", label: "Tiền sử ung thư, lao, suy giảm miễn dịch" },
];

function CheckboxList({
  items,
  checked,
  onToggle,
}: {
  items: Flag[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((it) => (
        <label
          key={it.id}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: 10,
            border: "1px solid var(--line)",
            borderRadius: "var(--r-ui)",
            background: "#fff",
          }}
        >
          <input
            type="checkbox"
            checked={!!checked[it.id]}
            onChange={() => onToggle(it.id)}
            style={{ marginTop: 3 }}
          />
          <span style={{ fontWeight: 600, lineHeight: 1.35 }}>{it.label}</span>
        </label>
      ))}
    </div>
  );
}

type Duration = "unknown" | "acute" | "subacute" | "chronic";

export default function Ho() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [duration, setDuration] = useState<Duration>("unknown");

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }));
  const clearAll = () => setChecks({});

  const activeFlags = useMemo(() => redFlags.filter((f) => checks[f.id]), [checks]);
  const hasRedFlag = activeFlags.length > 0;

  const durationBadge = useMemo(() => {
    if (duration === "acute")
      return (
        <RiskBadge
          level="moderate"
          text="Ho cấp (< 3 tuần): ưu tiên virus/viêm phế quản/viêm phổi nhẹ + loại trừ cấp cứu khi khó thở/SpO₂ giảm"
        />
      );
    if (duration === "subacute")
      return (
        <RiskBadge
          level="moderate"
          text="Ho bán cấp (3–8 tuần): hay gặp ho sau nhiễm, viêm xoang–chảy mũi sau, hen khởi phát sau nhiễm"
        />
      );
    if (duration === "chronic")
      return (
        <RiskBadge
          level="moderate"
          text="Ho mạn (> 8 tuần): nhớ “Bộ 3 kinh điển” (chảy mũi sau – hen – GERD) + nghĩ thuốc/đồng mắc/bệnh bỏ sót"
        />
      );
    return <RiskBadge level="low" text="Chưa chọn thời gian ho — chọn để lọc hướng tiếp cận" />;
  }, [duration]);

  return (
    <SymptomLayout title="Ho">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            TIẾP CẬN CHỨNG HO — TẠI PHÒNG KHÁM Y HỌC GIA ĐÌNH
          </div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: định hướng nhanh nguyên nhân và quyết định xử trí an toàn theo thời gian + bối cảnh chăm sóc ban đầu.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">
            ← Danh sách chứng
          </Link>
          <Link className="btn" to="/tools">
            Công cụ
          </Link>
        </div>
      </div>

      <div className="divider" />

      {/* 0 */}
      <SectionTitle n="0)" title="Mục tiêu thực hành" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>
          Khi bệnh nhân đến khám vì ho, bác sĩ gia đình cần trả lời theo thứ tự:
        </div>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            <b>Ho này có nguy hiểm/cấp cứu không?</b>
          </li>
          <li>
            <b>Ho cấp hay ho kéo dài?</b>
          </li>
          <li>
            <b>Nguyên nhân thường gặp nhất trong bối cảnh chăm sóc ban đầu là gì?</b>
          </li>
          <li>
            <b>Có bệnh đồng mắc hoặc nguyên nhân dễ bỏ sót cần chủ động tìm không?</b>
          </li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1 */}
      <SectionTitle n="1️⃣" title="Bước 1 — Xác nhận chứng ho & phân loại theo thời gian" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận “ho”</div>
          <div className="tile__sub">Ho là phản xạ bảo vệ đường hô hấp. Bệnh nhân có thể mô tả:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Ho khan</li>
            <li>Ho có đàm</li>
            <li>Ho từng cơn</li>
            <li>Ho kéo dài, ho về đêm</li>
            <li>Ho kèm khò khè, khó thở, đau ngực</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.2 Phân loại theo thời gian (rất quan trọng)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <b>Ho cấp:</b> &lt; 3 tuần
            </li>
            <li>
              <b>Ho bán cấp:</b> 3 – 8 tuần
            </li>
            <li>
              <b>Ho mạn:</b> &gt; 8 tuần
            </li>
          </ul>
          <div className="help" style={{ marginTop: 6 }}>
            👉 Mỗi nhóm có phổ nguyên nhân khác nhau, giúp tránh xét nghiệm không cần thiết.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Quick duration selector */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Chọn thời gian ho:</div>

          <button
            type="button"
            className={duration === "acute" ? "btnPrimary" : "btn"}
            onClick={() => setDuration("acute")}
          >
            Ho cấp (&lt; 3 tuần)
          </button>
          <button
            type="button"
            className={duration === "subacute" ? "btnPrimary" : "btn"}
            onClick={() => setDuration("subacute")}
          >
            Ho bán cấp (3–8 tuần)
          </button>
          <button
            type="button"
            className={duration === "chronic" ? "btnPrimary" : "btn"}
            onClick={() => setDuration("chronic")}
          >
            Ho mạn (&gt; 8 tuần)
          </button>
          <button
            type="button"
            className={duration === "unknown" ? "btnPrimary" : "btn"}
            onClick={() => setDuration("unknown")}
          >
            Chưa rõ
          </button>
        </div>

        <div className="divider" />
        {durationBadge}
      </div>

      <div className="divider" />

      {/* 2 */}
      <SectionTitle n="2️⃣" title="Bước 2 — Loại trừ ho nguy hiểm (Red flags)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → chuyển viện / chuyển chuyên khoa" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → tiếp tục định hướng nguyên nhân thường gặp" />
          )}

          <div style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={clearAll}>
            Xoá chọn
          </button>
        </div>

        {hasRedFlag && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Đang tick ({activeFlags.length}):</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {activeFlags.map((f) => (
                <li key={f.id}>{f.label}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="divider" />
        <div className="help" style={{ marginTop: 0, marginBottom: 10 }}>
          👉 Chỉ cần <b>1 dấu hiệu</b> → không xử trí ngoại trú.
        </div>
        <CheckboxList items={redFlags} checked={checks} onToggle={toggle} />
      </div>

      <div className="divider" />

      {/* 3 */}
      <SectionTitle n="3️⃣" title="Bước 3 — Ho cấp: bệnh cấp cứu & nghiêm trọng cần loại trừ" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>3.1 Ho cấp cần loại trừ ngay</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Hít dị vật (đặc biệt trẻ em, người già)</li>
          <li>Phù thanh quản / phản vệ</li>
          <li>Hen cấp / COPD cấp</li>
          <li>Viêm phổi nặng</li>
          <li>Thuyên tắc phổi</li>
          <li>Suy tim cấp / phù phổi</li>
        </ul>
        <div className="help" style={{ marginTop: 10 }}>
          👉 <b>Ho cấp + khó thở + SpO₂ giảm</b> = xử trí như <b>cấp cứu hô hấp</b>.
        </div>
      </div>

      <div className="divider" />

      {/* 4 */}
      <SectionTitle n="4️⃣" title="Bước 4 — Bệnh thường gặp nhất tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Ho cấp thường gặp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Nhiễm trùng hô hấp trên do virus</li>
            <li>Viêm phế quản cấp</li>
            <li>Viêm phổi nhẹ</li>
            <li>Ho do kích thích (khói, bụi, lạnh)</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.2 Ho bán cấp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Ho sau nhiễm virus</li>
            <li>Viêm xoang – chảy mũi sau</li>
            <li>Hen khởi phát sau nhiễm trùng</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.3 Ho mạn (rất hay gặp tại YHGĐ)</div>
          <div className="tile__sub" style={{ marginBottom: 6 }}>
            👉 Nhớ <b>“Bộ 3 kinh điển”</b>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Chảy mũi sau / viêm mũi xoang mạn</li>
            <li>Hen phế quản / ho biến thể hen</li>
            <li>Trào ngược dạ dày – thực quản (GERD)</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            Ba nguyên nhân này chiếm đa số ho mạn ở người lớn không hút thuốc, X-quang phổi bình thường.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 5 */}
      <SectionTitle n="5️⃣" title="Bước 5 — Bệnh đồng mắc & nguyên nhân do thuốc" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.1 Bệnh đồng mắc thường gặp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>COPD</li>
            <li>Hen</li>
            <li>Suy tim</li>
            <li>Béo phì</li>
            <li>Lo âu, trầm cảm</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.2 Thuốc gây ho (rất hay bỏ sót)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>ACE inhibitors (Enalapril, Captopril…)</li>
            <li>Thuốc xịt mũi co mạch dùng kéo dài</li>
            <li>NSAIDs (làm nặng hen)</li>
            <li>Thuốc gây trào ngược</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Hỏi kỹ: ho xuất hiện sau khi bắt đầu thuốc bao lâu?
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 6 */}
      <SectionTitle n="6️⃣" title="Bước 6 — Bệnh dễ bỏ sót (cần chủ động nghĩ)" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Lao phổi</li>
          <li>Ung thư phổi</li>
          <li>Bệnh phổi kẽ</li>
          <li>Giãn phế quản</li>
          <li>Hít sặc mạn</li>
          <li>Ho do tâm lý (psychogenic cough)</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 7 */}
      <SectionTitle n="7️⃣" title="Khai thác bệnh sử có mục tiêu (thực hành)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>7.1 Hỏi nhanh 6 câu cốt lõi</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Ho bao lâu?</li>
          <li>Ho khan hay có đàm? Màu đàm?</li>
          <li>Ho có ra máu không?</li>
          <li>Ho nhiều về đêm hay sáng sớm?</li>
          <li>Có khò khè, khó thở, ợ nóng, chảy mũi sau không?</li>
          <li>Có hút thuốc, tiếp xúc bụi, thuốc mới không?</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 8 */}
      <SectionTitle n="8️⃣" title="Khám lâm sàng có trọng điểm" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Sinh hiệu, SpO₂</li>
          <li>Tai – mũi – họng</li>
          <li>Phổi: ran, khò khè</li>
          <li>Tim</li>
          <li>Dấu suy tim</li>
          <li>Hạch, sụt cân</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 9 */}
      <SectionTitle n="9️⃣" title="Cận lâm sàng — chỉ định có chọn lọc" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">❌ Không cần làm khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Ho cấp do virus</li>
            <li>Không red flags</li>
            <li>Tổng trạng tốt</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">✅ Nên làm khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Ho mạn</li>
            <li>Có red flags</li>
            <li>Không rõ nguyên nhân</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>X-quang ngực</li>
          <li>Công thức máu</li>
          <li>CRP</li>
          <li>AFB / GeneXpert khi nghi lao</li>
          <li>Hô hấp ký (hen/COPD)</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 10 */}
      <SectionTitle n="🔟" title="Điều trị tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">10.1 Nguyên tắc</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Điều trị nguyên nhân</li>
            <li>Không lạm dụng thuốc giảm ho</li>
            <li>Tránh kháng sinh khi không cần</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">10.2 Điều trị triệu chứng</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Giảm kích thích</li>
            <li>Thuốc long đàm khi có đàm</li>
            <li>Thuốc giãn phế quản khi có co thắt</li>
            <li>Điều trị thử theo hướng chẩn đoán (trial of therapy)</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 11 */}
      <SectionTitle n="11️⃣" title="Chỉ định chuyển viện / chuyên khoa" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Ho ra máu</li>
          <li>Ho + khó thở tiến triển</li>
          <li>Ho mạn không đáp ứng điều trị</li>
          <li>Nghi lao, ung thư, bệnh phổi kẽ</li>
          <li>Trẻ nhỏ, người già, suy giảm miễn dịch</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 12 */}
      <SectionTitle n="12️⃣" title="Tóm tắt thuật toán 1 trang" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            Ho → <b>Red flags?</b>
          </li>
          <li>
            → Có → <b>Chuyển viện</b>
          </li>
          <li>
            → Không → <b>Ho cấp / bán cấp / mạn?</b>
          </li>
          <li>
            → Ho mạn → nghĩ <b>chảy mũi sau – hen – GERD – thuốc</b>
          </li>
          <li>→ Không rõ → tìm bệnh bỏ sót</li>
        </ul>
      </div>

      <div className="divider" />

      {/* Conclusion */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✅ Kết luận thực hành</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Ho là một trong những chứng thường gặp nhất.</li>
          <li>Không bỏ sót ho nguy hiểm.</li>
          <li>Không lạm dụng kháng sinh.</li>
          <li>Tư duy theo thời gian + bối cảnh.</li>
          <li>Hỏi bệnh đúng quyết định hơn xét nghiệm.</li>
        </ul>
      </div>
    </SymptomLayout>
  );
}
