// src/pages/symptoms/kho-tho.tsx
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
  { id: "rf_rr_high", label: "Thở nhanh > 30 lần/phút" },
  { id: "rf_rr_low", label: "Thở chậm < 9 lần/phút" },
  { id: "rf_spo2_low", label: "SpO₂ < 91% khí trời" },
  { id: "rf_cyanosis", label: "Tím môi, đầu chi" },
  { id: "rf_cannot_speak", label: "Không nói được tròn câu" },
  { id: "rf_accessory", label: "Co kéo cơ hô hấp phụ rõ" },
  { id: "rf_hypotension", label: "Huyết áp < 90/60 mmHg hoặc kẹp" },
  { id: "rf_shock", label: "Mạch nhanh yếu, CRT > 2 giây" },
  { id: "rf_altered", label: "Lơ mơ / rối loạn tri giác" },
  { id: "rf_sepsis", label: "Sốt cao + vẻ nhiễm trùng nặng" },
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

export default function KhoTho() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }));
  const clearAll = () => setChecks({});

  const activeFlags = useMemo(() => redFlags.filter((f) => checks[f.id]), [checks]);
  const hasRedFlag = activeFlags.length > 0;

  return (
    <SymptomLayout title="Khó thở">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>TIẾP CẬN CHỨNG KHÓ THỞ — TẠI PHÒNG KHÁM Y HỌC GIA ĐÌNH</div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: nhận diện nhanh nguy hiểm, loại trừ bệnh cấp cứu, tiếp cận nguyên nhân thường gặp có chọn lọc.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">← Danh sách chứng</Link>
          <Link className="btn" to="/tools">Mở công cụ</Link>
        </div>
      </div>

      <div className="divider" />

      {/* 0) Ưu tiên */}
      <SectionTitle n="0)" title="Mục tiêu thực hành — trả lời theo thứ tự ưu tiên" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Có khó thở nguy hiểm/cấp cứu cần xử trí ngay không?</b></li>
          <li><b>Nguyên nhân cấp tính nào cần loại trừ trước?</b></li>
          <li><b>Khó thở này nhiều khả năng do bệnh thường gặp nào?</b></li>
          <li><b>Có bệnh đồng mắc hoặc nguyên nhân dễ bỏ sót cần chủ động tìm không?</b></li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1) Xác nhận + đánh giá */}
      <SectionTitle n="1️⃣" title="Bước 1 — Xác nhận khó thở & đánh giá mức độ" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận “khó thở”</div>
          <div className="tile__sub">
            Khó thở là cảm giác chủ quan: “không đủ không khí” • “thở nặng ngực” • “hụt hơi” • “thở không kịp”.
          </div>
          <div className="help" style={{ marginTop: 6 }}>
            👉 Luôn kết hợp đánh giá khách quan vì bệnh nhân có thể đánh giá sai mức độ nặng.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.2 Đánh giá nhanh (30–60 giây)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Nói được câu dài hay từng từ?</li>
            <li>Tư thế: nằm được hay phải ngồi chồm (tripod)?</li>
            <li>Tần số thở</li>
            <li>SpO₂</li>
            <li>Mạch, huyết áp</li>
            <li>Tri giác</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 2) RED FLAGS UI */}
      <SectionTitle n="2️⃣" title="Bước 2 — Loại trừ khó thở cấp nguy hiểm (Red flags)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → Xử trí cấp cứu tại chỗ + chuyển viện" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → Tiếp tục loại trừ bệnh cấp cứu & tìm nguyên nhân thường gặp" />
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

            <div className="divider" />

            <div style={{ fontWeight: 900, marginBottom: 8 }}>👉 Có red flags: xử trí cấp cứu ban đầu</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Tư thế ngồi, đảm bảo đường thở, thở oxy.</li>
              <li>Đánh giá nhanh nguyên nhân nghi ngờ: hen/COPD, phù phổi, sốc, tắc nghẽn đường thở…</li>
              <li>Giãn phế quản, corticoid, lợi tiểu… theo nguyên nhân nghi ngờ.</li>
              <li>Gọi cấp cứu/chuyển viện an toàn.</li>
            </ul>
          </div>
        )}

        <div className="divider" />

        <div className="help" style={{ marginTop: 0, marginBottom: 10 }}>
          👉 Chỉ cần <b>1 dấu hiệu</b> → xử trí cấp cứu / chuyển viện.
        </div>

        <CheckboxList items={redFlags} checked={checks} onToggle={toggle} />
      </div>

      <div className="divider" />

      {/* 3) VRIMMN */}
      <SectionTitle n="3️⃣" title="Bước 3 — Bệnh cấp cứu không được bỏ sót (VRIMMN)" />
      <div className="help" style={{ marginTop: 0 }}>
        Nếu khó thở cấp hoặc nặng, ưu tiên nghĩ và loại trừ các nhóm dưới.
      </div>

      <div className="tileGrid" style={{ marginTop: 10 }}>
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">🫀 Tim mạch (V – Vascular)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Suy tim cấp / phù phổi cấp</li>
            <li>Nhồi máu cơ tim</li>
            <li>Rối loạn nhịp nhanh/chậm nặng</li>
            <li>Thuyên tắc phổi</li>
            <li>Chèn ép tim cấp</li>
            <li>Bóc tách động mạch chủ</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">🫁 Hô hấp (R – Respiratory)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Tắc nghẽn đường thở trên (dị vật, phù thanh quản)</li>
            <li>Tràn khí màng phổi</li>
            <li>Tràn dịch màng phổi lượng lớn</li>
            <li>ARDS</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">🦠 Nhiễm trùng – viêm – chấn thương (I)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Viêm phổi nặng</li>
            <li>COVID-19 / cúm nặng</li>
            <li>Lao tiến triển</li>
            <li>Viêm nắp thanh quản (trẻ em)</li>
            <li>Chấn thương ngực</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">🧬 Ung thư (M – Malignancy)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Ung thư phổi</li>
            <li>Di căn màng phổi</li>
            <li>Lymphoma trung thất</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">⚗️ Chuyển hóa (M – Metabolic)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Toan chuyển hóa (DKA, suy thận)</li>
            <li>Thiếu máu nặng</li>
            <li>Cường giáp</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">🧠 Thần kinh – cơ (N – Nerve)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Bệnh thần kinh cơ</li>
            <li>Yếu cơ hô hấp</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 4) Thường gặp */}
      <SectionTitle n="4️⃣" title="Bước 4 — Bệnh thường gặp tại phòng khám YHGĐ" />
      <div className="help" style={{ marginTop: 0 }}>
        Chỉ xét nhóm này khi đã loại trừ tình trạng cấp cứu.
      </div>

      <div className="tileGrid" style={{ marginTop: 10 }}>
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Nhóm hô hấp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Hen phế quản</li>
            <li>COPD</li>
            <li>Viêm phổi nhẹ – trung bình</li>
            <li>Viêm tiểu phế quản (trẻ em)</li>
            <li>Viêm mũi xoang mạn, chảy mũi sau</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.2 Nhóm tim mạch</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Suy tim trái mạn</li>
            <li>Tăng huyết áp lâu năm gây khó thở gắng sức</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.3 Toàn thân – cơ địa</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Béo phì</li>
            <li>Giảm thể lực</li>
            <li>Người cao tuổi ít vận động</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.4 Tiêu hóa – tâm lý</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>GERD</li>
            <li>Lo âu, cơn hoảng sợ</li>
            <li>Tăng thông khí</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 5) Đồng mắc & thuốc */}
      <SectionTitle n="5️⃣" title="Bệnh đồng mắc & yếu tố che lấp" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.1 Bệnh đồng mắc thường gặp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Thiếu máu mạn</li>
            <li>Đái tháo đường (toan ceton)</li>
            <li>Rối loạn tuyến giáp</li>
            <li>Suy thận mạn</li>
            <li>Trầm cảm</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.2 Thuốc gây khó thở (hay bỏ sót)</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>Gây co thắt phế quản</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Chẹn beta</li>
                <li>NSAIDs</li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>Gây xơ phổi kẽ</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Amiodarone</li>
                <li>Methotrexate</li>
                <li>Nitrofurantoin</li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>Gây tăng thông khí / toan chuyển hóa</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Salicylate</li>
                <li>Theophylline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 6) Bỏ sót */}
      <SectionTitle n="6️⃣" title="Bệnh dễ bỏ sót (cần chủ động nghĩ)" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Bệnh phổi kẽ</li>
          <li>Xơ phổi vô căn</li>
          <li>Sarcoidosis</li>
          <li>Thuyên tắc phổi nhỏ nhiều ổ</li>
          <li>Toan chuyển hóa mạn</li>
          <li>Suy thận giai đoạn muộn</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 7) Xét nghiệm */}
      <SectionTitle n="7️⃣" title="Xét nghiệm — chỉ định có chọn lọc" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">❌ Không cần thường quy khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Khó thở nhẹ</li>
            <li>Nguyên nhân rõ (hen, COPD ổn định)</li>
            <li>Không red flags</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">✅ Cân nhắc khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Không rõ nguyên nhân</li>
            <li>Khó thở tiến triển</li>
            <li>Có bệnh nền</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>SpO₂, khí máu</li>
          <li>CTM (thiếu máu)</li>
          <li>CRP</li>
          <li>ECG</li>
          <li>X-quang ngực</li>
          <li>Siêu âm tim</li>
          <li>BNP, Troponin (khi nghi tim)</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 8) Xử trí */}
      <SectionTitle n="8️⃣" title="Xử trí tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.1 Xử trí cấp cứu ban đầu (nếu cần)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Tư thế ngồi</li>
            <li>Thở oxy</li>
            <li>Đảm bảo đường thở</li>
            <li>Giãn phế quản, corticoid, lợi tiểu… theo nguyên nhân nghi ngờ</li>
            <li>Gọi cấp cứu – chuyển viện</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.2 Điều trị ngoại trú</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Khó thở nhẹ – trung bình</li>
            <li>Không red flags</li>
            <li>Có kế hoạch theo dõi rõ</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 9) Tóm tắt */}
      <SectionTitle n="9️⃣" title="Tóm tắt thuật toán 1 trang" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Khó thở → <b>Red flags?</b></li>
          <li>→ Có: <b>cấp cứu / chuyển viện</b></li>
          <li>→ Không: loại trừ bệnh cấp cứu <b>VRIMMN</b></li>
          <li>→ Không: nghĩ bệnh thường gặp</li>
          <li>→ Không rõ: tìm bệnh đồng mắc / bệnh bỏ sót</li>
        </ul>
      </div>

      <div className="divider" />

      {/* Kết luận */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✅ Kết luận thực hành</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Khó thở là <b>chứng</b> có nguy cơ tử vong cao.</li>
          <li>Nhận diện nhanh dấu hiệu nguy hiểm.</li>
          <li>Không bỏ sót bệnh cấp cứu.</li>
          <li>Không lạm dụng xét nghiệm khi bệnh rõ.</li>
          <li>Hỏi bệnh + khám kỹ quyết định phần lớn chẩn đoán.</li>
        </ul>
      </div>
    </SymptomLayout>
  );
}
