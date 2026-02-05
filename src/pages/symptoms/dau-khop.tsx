// src/pages/symptoms/dau-khop-goi-khong-chan-thuong.tsx
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

type Flag = { id: string; label: string; hint?: string };

const redFlags: Flag[] = [
  { id: "rf_fever_chills", label: "Sốt, ớn lạnh, dấu nhiễm trùng", hint: "Gợi ý viêm khớp nhiễm khuẩn" },
  {
    id: "rf_hot_red_severe",
    label: "Khớp sưng – nóng – đỏ – đau dữ dội, bệnh nhân không dám cử động",
    hint: "Ưu tiên loại trừ nhiễm trùng khớp",
  },
  { id: "rf_rapid_worse", label: "Đau tăng nhanh, không đáp ứng giảm đau", hint: "Cân nhắc nguyên nhân nặng" },
  { id: "rf_weightloss_cancer", label: "Sụt cân, tiền sử ung thư", hint: "Gợi ý gãy xương bệnh lý / u xương / di căn" },
  { id: "rf_new_deformity", label: "Biến dạng trục khớp mới xuất hiện", hint: "Cân nhắc tổn thương cấu trúc nghiêm trọng" },
  {
    id: "rf_neuro_vascular",
    label: "Tê, yếu chi, da lạnh, mạch ngoại biên yếu",
    hint: "Gợi ý bệnh mạch máu chi dưới / biến chứng thần kinh–mạch",
  },
  { id: "rf_night_pain", label: "Đau về đêm, đánh thức bệnh nhân", hint: "Cân nhắc ung thư / viêm / nguyên nhân nặng" },
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
          <span style={{ lineHeight: 1.35 }}>
            <span style={{ fontWeight: 700 }}>{it.label}</span>
            {it.hint ? <div className="help" style={{ marginTop: 4 }}>{it.hint}</div> : null}
          </span>
        </label>
      ))}
    </div>
  );
}

type Duration = "unknown" | "acute" | "subacute" | "chronic";
type Inflammation = "unknown" | "inflammatory" | "noninflammatory";

export default function DauKhopGoiKhongChanThuong() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [duration, setDuration] = useState<Duration>("unknown");
  const [inflam, setInflam] = useState<Inflammation>("unknown");

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }));
  const clearAll = () => setChecks({});

  const activeFlags = useMemo(() => redFlags.filter((f) => checks[f.id]), [checks]);
  const hasRedFlag = activeFlags.length > 0;

  const durationBadge = useMemo(() => {
    if (duration === "acute")
      return (
        <RiskBadge
          level="moderate"
          text="Cấp tính (< 4–6 tuần): khởi phát đột ngột → nghĩ nhiều viêm khớp tinh thể hoặc nhiễm trùng khớp (cần loại trừ trước)."
        />
      );
    if (duration === "subacute")
      return <RiskBadge level="moderate" text="Bán cấp (4–12 tuần): đánh giá viêm/không viêm + yếu tố nguy cơ và đáp ứng điều trị." />;
    if (duration === "chronic")
      return <RiskBadge level="moderate" text="Mạn tính (> 12 tuần): thường gặp thoái hóa khớp gối; chú ý bệnh hệ thống/bệnh bỏ sót." />;
    return <RiskBadge level="low" text="Chưa chọn thời gian đau — chọn để định hướng nguyên nhân và chỉ định cận lâm sàng." />;
  }, [duration]);

  const triageBadge = useMemo(() => {
    if (hasRedFlag) return <RiskBadge level="very-high" text="Có RED FLAGS → chuyển viện / cân nhắc chọc hút dịch khớp khẩn." />;

    if (inflam === "inflammatory")
      return <RiskBadge level="moderate" text="Đau khớp gối có tính chất viêm → nghĩ gout/CPPD/viêm khớp dạng thấp; luôn loại trừ nhiễm trùng khớp trước." />;

    if (inflam === "noninflammatory")
      return <RiskBadge level="low" text="Đau khớp gối không viêm → nghĩ thoái hóa khớp gối/viêm gân–bao hoạt dịch/lệch trục." />;

    return <RiskBadge level="low" text="Chưa đủ dữ kiện — chọn 'viêm/không viêm' + thời gian đau để ra hướng xử trí." />;
  }, [hasRedFlag, inflam]);

  return (
    <SymptomLayout title="Đau khớp gối (không chấn thương)">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            TIẾP CẬN CHỨNG ĐAU KHỚP GỐI (KHÔNG DO CHẤN THƯƠNG) — Y HỌC GIA ĐÌNH
          </div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: nhận diện viêm khớp nhiễm khuẩn và các tình trạng nguy hiểm; phân biệt viêm/không viêm; xử trí phù hợp tại tuyến cơ sở.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">← Danh sách chứng</Link>
          <Link className="btn" to="/tools">Công cụ</Link>
        </div>
      </div>

      <div className="divider" />

      {/* 0 */}
      <SectionTitle n="0)" title="Mục tiêu thực hành — 4 câu hỏi ưu tiên" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Có viêm khớp gối nguy hiểm/cấp cứu cần chuyển viện ngay không?</b></li>
          <li><b>Đây là đau khớp gối cấp hay mạn, viêm hay không viêm?</b></li>
          <li><b>Nguyên nhân thường gặp nhất trong bối cảnh bệnh nhân này là gì?</b></li>
          <li><b>Có bệnh nền hoặc nguyên nhân dễ bỏ sót cần chủ động loại trừ không?</b></li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1 */}
      <SectionTitle n="1️⃣" title="Bước 1 — Xác nhận chứng đau khớp gối & phân loại ban đầu" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận đau khớp gối</div>
          <div className="tile__sub">Đau trong hoặc quanh khớp gối; có thể kèm:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Sưng</li>
            <li>Nóng</li>
            <li>Đỏ</li>
            <li>Hạn chế vận động</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>Loại trừ chấn thương (theo phạm vi bài này).</div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.2 Phân loại nhanh theo thời gian</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><b>Cấp tính:</b> &lt; 4–6 tuần</li>
            <li><b>Bán cấp:</b> 4–12 tuần</li>
            <li><b>Mạn tính:</b> &gt; 12 tuần</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Đau khớp gối cấp khởi phát đột ngột cần nghĩ nhiều đến viêm khớp tinh thể hoặc nhiễm trùng khớp.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Quick controls */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Thời gian:</div>
          <button type="button" className={duration === "acute" ? "btnPrimary" : "btn"} onClick={() => setDuration("acute")}>
            Cấp (&lt; 4–6w)
          </button>
          <button type="button" className={duration === "subacute" ? "btnPrimary" : "btn"} onClick={() => setDuration("subacute")}>
            Bán cấp (4–12w)
          </button>
          <button type="button" className={duration === "chronic" ? "btnPrimary" : "btn"} onClick={() => setDuration("chronic")}>
            Mạn (&gt; 12w)
          </button>
          <button type="button" className={duration === "unknown" ? "btnPrimary" : "btn"} onClick={() => setDuration("unknown")}>
            Chưa rõ
          </button>
        </div>

        <div className="divider" />
        {durationBadge}

        <div className="divider" />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Tính chất:</div>
          <button
            type="button"
            className={inflam === "inflammatory" ? "btnPrimary" : "btn"}
            onClick={() => setInflam("inflammatory")}
          >
            Viêm
          </button>
          <button
            type="button"
            className={inflam === "noninflammatory" ? "btnPrimary" : "btn"}
            onClick={() => setInflam("noninflammatory")}
          >
            Không viêm
          </button>
          <button
            type="button"
            className={inflam === "unknown" ? "btnPrimary" : "btn"}
            onClick={() => setInflam("unknown")}
          >
            Chưa rõ
          </button>
        </div>

        <div className="divider" />
        {triageBadge}
      </div>

      <div className="divider" />

      {/* 2 */}
      <SectionTitle n="2️⃣" title="Bước 2 — Loại trừ đau khớp gối nguy hiểm (Red flags)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → chuyển viện / chọc hút khớp khẩn" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → tiếp tục phân biệt viêm/không viêm và nguyên nhân thường gặp" />
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={clearAll}>Xoá chọn</button>
        </div>

        {hasRedFlag && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Đang tick ({activeFlags.length}):</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {activeFlags.map((f) => (
                <li key={f.id}>{f.label}</li>
              ))}
            </ul>
            <div className="help" style={{ marginTop: 10 }}>
              👉 Gợi ý: viêm khớp nhiễm khuẩn, gãy xương bệnh lý, u xương, bệnh mạch máu chi dưới.
            </div>
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
      <SectionTitle n="3️⃣" title="Bước 3 — Phân biệt đau khớp gối viêm hay không viêm" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.1 Có tính chất viêm</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Sưng, nóng, đỏ</li>
            <li>Đau nhiều, giảm ít khi nghỉ</li>
            <li>Có thể có cứng khớp buổi sáng</li>
            <li>Đau dữ dội, khởi phát nhanh</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Nghĩ nhiều đến: gout, giả gout (CPPD), viêm khớp dạng thấp, <b>viêm khớp nhiễm khuẩn (phải loại trừ trước)</b>.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.2 Không viêm</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau tăng khi vận động</li>
            <li>Giảm khi nghỉ</li>
            <li>Ít sưng, không đỏ, không nóng</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Nghĩ nhiều đến: thoái hóa khớp gối, viêm gân/viêm bao hoạt dịch, lệch trục khớp.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 4 */}
      <SectionTitle n="4️⃣" title="Bước 4 — Bệnh thường gặp nhất tại phòng khám YHGĐ" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Thoái hóa khớp gối (phổ biến nhất)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Tuổi ≥ 45</li>
            <li>Đau liên quan vận động</li>
            <li>Cứng khớp sáng &lt; 30 phút</li>
            <li>Lạo xạo khi cử động</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Không cần X-quang thường quy nếu lâm sàng điển hình.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.2 Gout khớp gối</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Khởi phát đột ngột, đau dữ dội, sưng nóng đỏ</li>
            <li>Có cơn tương tự trước đây</li>
            <li>Yếu tố khởi phát: rượu, lợi tiểu (thiazide), bữa ăn nhiều đạm</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Luôn loại trừ viêm khớp nhiễm khuẩn trước.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.3 Giả gout (CPPD)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Người &gt; 60 tuổi</li>
            <li>Viêm khớp gối cấp</li>
            <li>Có thoái hóa khớp kèm theo</li>
            <li>Không liên quan acid uric</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Xác định khi thấy tinh thể CPP trong dịch khớp.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.4 Viêm gân – viêm bao hoạt dịch</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau khu trú</li>
            <li>Ít triệu chứng toàn thân</li>
            <li>Liên quan vận động lặp lại</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 5 */}
      <SectionTitle n="5️⃣" title="Bước 5 — Bệnh đồng mắc & yếu tố nguy cơ" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.1 Bệnh đồng mắc thường gặp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Tăng huyết áp (dùng lợi tiểu)</li>
            <li>Đái tháo đường</li>
            <li>Béo phì</li>
            <li>Loãng xương</li>
            <li>Bệnh thận mạn</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.2 Thuốc cần chú ý</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Lợi tiểu thiazide → gout</li>
            <li>NSAIDs → che triệu chứng nhiễm trùng khớp</li>
            <li>Corticoid kéo dài</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 6 */}
      <SectionTitle n="6️⃣" title="Bệnh dễ bỏ sót (cần luôn nghĩ)" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Viêm khớp nhiễm khuẩn (kể cả không sốt)</li>
          <li>U xương</li>
          <li>Đau khớp do bệnh hệ thống (Lupus)</li>
          <li>Đau quy chiếu: cột sống thắt lưng, khớp háng</li>
          <li>Bệnh mạch máu ngoại biên</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 7 */}
      <SectionTitle n="7️⃣" title="Cận lâm sàng — chỉ định có chọn lọc" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">❌ Không làm thường quy khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Thoái hóa khớp gối điển hình</li>
            <li>Không có red flags</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">✅ Cần làm khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Viêm khớp gối cấp</li>
            <li>Không rõ nguyên nhân</li>
            <li>Nghi nhiễm trùng</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Chọc hút dịch khớp (quan trọng nhất)</b></li>
          <li>Soi tinh thể urat / CPP</li>
          <li>Nhuộm Gram – cấy</li>
          <li>CTM, CRP, ESR</li>
          <li>Acid uric máu (chỉ hỗ trợ)</li>
          <li>Siêu âm / X-quang gối khi cần</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 8 */}
      <SectionTitle n="8️⃣" title="Xử trí tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.1 Nguyên tắc</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Loại trừ nhiễm trùng khớp trước</li>
            <li>Điều trị theo nguyên nhân</li>
            <li>Không lạm dụng thuốc giảm đau mạnh</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.2 Điều trị ngoại trú (khi an toàn)</div>
          <div className="tile__sub" style={{ marginBottom: 6 }}><b>Thoái hóa khớp:</b></div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Giảm cân</li>
            <li>Tập vận động</li>
            <li>NSAIDs ngắn hạn</li>
          </ul>

          <div className="tile__sub" style={{ marginTop: 10, marginBottom: 6 }}><b>Gout/giả gout:</b></div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>NSAIDs / colchicine / corticoid (theo chỉ định)</li>
            <li>Tư vấn chế độ ăn – rượu</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.3 Chuyển viện / chuyên khoa</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Nghi viêm khớp nhiễm khuẩn</li>
            <li>Đau dữ dội không kiểm soát</li>
            <li>Không cải thiện sau điều trị ban đầu</li>
            <li>Có biến chứng thần kinh/mạch máu</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 9 */}
      <SectionTitle n="9️⃣" title="Tóm tắt thuật toán 1 trang" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đau khớp gối → <b>Red flags?</b></li>
          <li>→ Có → <b>Chuyển viện / chọc hút khớp</b></li>
          <li>→ Không → <b>Viêm hay không viêm?</b></li>
          <li>→ Viêm → nghĩ <b>gout / giả gout / nhiễm trùng</b></li>
          <li>→ Không viêm → nghĩ <b>thoái hóa khớp gối</b></li>
          <li>→ Không rõ → <b>tìm bệnh bỏ sót</b></li>
        </ul>
      </div>

      <div className="divider" />

      {/* Conclusion */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✅ Kết luận thực hành</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đau khớp gối là chứng rất thường gặp.</li>
          <li>Không bỏ sót viêm khớp nhiễm khuẩn.</li>
          <li>Không chẩn đoán gout khi chưa loại trừ nhiễm trùng.</li>
          <li>Quản lý tốt thoái hóa khớp tại tuyến cơ sở.</li>
          <li><b>Chọc hút dịch khớp là chìa khóa trong viêm khớp cấp.</b></li>
        </ul>
      </div>
    </SymptomLayout>
  );
}
