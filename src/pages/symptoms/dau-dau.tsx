// src/pages/symptoms/dau-dau.tsx
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
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14 }}>{n}</div>
      <div style={{ fontWeight: 900, fontSize: 14 }}>{title}</div>
    </div>
  );
}

type Flag = { id: string; label: string; group: string };

const snoopFlags: Flag[] = [
  // S - Systemic
  {
    id: "sys_fever_weight",
    label: "Toàn thân: sốt hoặc sụt cân không rõ nguyên nhân",
    group: "🔴 Toàn thân",
  },
  {
    id: "sys_cancer_immuno",
    label: "Toàn thân: ung thư hoặc suy giảm miễn dịch",
    group: "🔴 Toàn thân",
  },

  // N - Neurologic
  {
    id: "neuro_altered",
    label: "Thần kinh: rối loạn ý thức",
    group: "🔴 Thần kinh",
  },
  {
    id: "neuro_focal",
    label: "Thần kinh: dấu thần kinh khu trú",
    group: "🔴 Thần kinh",
  },
  {
    id: "neuro_seizure",
    label: "Thần kinh: co giật",
    group: "🔴 Thần kinh",
  },
  {
    id: "neuro_papilledema",
    label: "Thần kinh: phù gai thị",
    group: "🔴 Thần kinh",
  },

  // O - Onset
  {
    id: "onset_thunderclap",
    label: "Khởi phát: đau đầu đột ngột dữ dội nhất từ trước đến nay (thunderclap)",
    group: "🔴 Khởi phát bất thường",
  },
  {
    id: "onset_trauma",
    label: "Khởi phát: đau đầu sau chấn thương",
    group: "🔴 Khởi phát bất thường",
  },

  // O - Older age / Progression
  {
    id: "age_new_after_50",
    label: "Tuổi/diễn tiến: đau đầu mới xuất hiện sau 50 tuổi",
    group: "🔴 Tuổi và diễn tiến",
  },
  {
    id: "progress_worsening",
    label: "Tuổi/diễn tiến: đau đầu tăng dần, thay đổi tính chất",
    group: "🔴 Tuổi và diễn tiến",
  },

  // P - Positional / precipitated by valsalva
  {
    id: "positional_cough",
    label: "Tư thế/gắng sức: đau tăng khi ho, rặn, cúi (Valsalva)",
    group: "🔴 Liên quan tư thế / gắng sức",
  },
  {
    id: "positional_change",
    label: "Tư thế/gắng sức: đau thay đổi theo tư thế (đứng – nằm)",
    group: "🔴 Liên quan tư thế / gắng sức",
  },
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
  const groups = useMemo(() => {
    const m = new Map<string, Flag[]>();
    for (const it of items) {
      m.set(it.group, [...(m.get(it.group) ?? []), it]);
    }
    return Array.from(m.entries());
  }, [items]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {groups.map(([g, arr]) => (
        <div key={g}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>{g}</div>
          <div style={{ display: "grid", gap: 10 }}>
            {arr.map((it) => (
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
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>
                  {it.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DauDau() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));

  const clearAll = () => setChecks({});

  const activeFlags = useMemo(
    () => snoopFlags.filter((f) => checks[f.id]),
    [checks]
  );

  const hasRedFlag = activeFlags.length > 0;

  return (
    <SymptomLayout title="Đau đầu">
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
            TIẾP CẬN CHỨNG ĐAU ĐẦU — TẠI PHÒNG KHÁM Y HỌC GIA ĐÌNH
          </div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: không bỏ sót đau đầu nguy hiểm, không lạm dụng cận lâm sàng,
            trấn an và quản lý lâu dài đau đầu lành tính.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">
            ← Danh sách chứng
          </Link>
          <Link className="btn" to="/tools">
            Mở công cụ
          </Link>
        </div>
      </div>

      <div className="divider" />

      {/* 0) 4 câu hỏi */}
      <SectionTitle n="0)" title="Mục tiêu thực hành — 4 câu hỏi theo thứ tự" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Có đau đầu nguy hiểm cần chuyển viện ngay không?</b></li>
          <li><b>Có khả năng là đau đầu nguyên phát thường gặp không?</b></li>
          <li><b>Có yếu tố nguy cơ/bệnh đồng mắc làm thay đổi xử trí không?</b></li>
          <li><b>Có bệnh nguy hiểm dễ bị bỏ sót cần chủ động loại trừ không?</b></li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1) Bước 1 */}
      <SectionTitle n="1️⃣" title="Bước 1 — Xác nhận chứng đau đầu & phân loại ban đầu" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận “đau đầu”</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau ở vùng đầu, mặt, cổ trên</li>
            <li>Hỏi rõ: lần đầu hay tái diễn? đau mới xuất hiện hay đã có từ trước?</li>
          </ul>
          <div className="help" style={{ marginTop: 6 }}>
            👉 Đau đầu mới khởi phát luôn phải cẩn trọng hơn đau đầu tái diễn quen thuộc.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.2 Phân loại nhanh theo thời gian</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><b>Đau đầu cấp</b>: vài giờ – vài ngày</li>
            <li><b>Đau đầu tái diễn</b>: nhiều cơn tương tự trước đây</li>
            <li><b>Tiến triển/nặng dần</b>: tăng dần theo thời gian → nghĩ thứ phát</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 2) Red flags UI */}
      <SectionTitle n="2️⃣" title="Bước 2 — Loại trừ đau đầu nguy hiểm (Red flags: SNOOP⁴)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → Không xử trí như đau đầu lành tính • Ưu tiên chuyển viện/chuyên khoa" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → Có thể xem xét đau đầu nguyên phát nếu khám TK bình thường" />
          )}

          <div style={{ flex: 1 }} />

          <button type="button" className="btn" onClick={clearAll}>
            Xoá chọn
          </button>
        </div>

        {hasRedFlag && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              Đang tick ({activeFlags.length}):
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {activeFlags.map((f) => (
                <li key={f.id}>{f.label}</li>
              ))}
            </ul>

            <div className="divider" />

            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              Gợi ý hành động
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Đánh giá sinh hiệu, khám thần kinh đầy đủ, soi đáy mắt nếu có điều kiện.</li>
              <li>Không trì hoãn chuyển tuyến nếu nghi: XHDN, viêm màng não/viêm não, tăng ALNS…</li>
              <li>Chuyển viện/chuyển chuyên khoa thần kinh theo mức độ.</li>
            </ul>
          </div>
        )}

        <div className="divider" />

        <CheckboxList items={snoopFlags} checked={checks} onToggle={toggle} />

        <div className="help" style={{ marginTop: 10 }}>
          👉 Chỉ cần <b>1 tiêu chí</b> → không xử trí như đau đầu lành tính.
        </div>
      </div>

      <div className="divider" />

      {/* 3) nguyên phát */}
      <SectionTitle n="3️⃣" title="Bước 3 — Bệnh thường gặp (đau đầu nguyên phát)" />
      <div className="help" style={{ marginTop: 0 }}>
        Chỉ xem xét bước này khi đã loại trừ red flags.
      </div>

      <div className="tileGrid" style={{ marginTop: 10 }}>
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.1 Hỏi bệnh có mục tiêu (SOCRATES — rút gọn)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Vị trí: một bên / hai bên / quanh mắt</li>
            <li>Tính chất: âm ỉ – bó chặt – nhói theo nhịp mạch</li>
            <li>Cường độ: nhẹ/vừa/nặng, có cản trở sinh hoạt không</li>
            <li>Thời gian: kéo dài bao lâu, tần suất</li>
            <li>Triệu chứng kèm: buồn nôn/nôn; sợ ánh sáng/sợ tiếng; chảy nước mắt/nghẹt mũi cùng bên</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.2 Định hướng nhanh các đau đầu thường gặp</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>✅ Đau đầu dạng căng thẳng</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Đau hai bên</li>
                <li>Âm ỉ, bó chặt như “vòng siết”</li>
                <li>Nhẹ – trung bình</li>
                <li>Không buồn nôn, không nặng lên khi vận động</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>✅ Migraine</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Đau một bên</li>
                <li>Nhói theo nhịp mạch</li>
                <li>Trung bình – nặng</li>
                <li>Kèm buồn nôn/nôn, sợ ánh sáng, sợ tiếng</li>
                <li>Có thể có aura</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>✅ Đau đầu cụm (cluster)</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Rất dữ dội, quanh mắt/thái dương</li>
                <li>Kéo dài 15–180 phút</li>
                <li>Chảy nước mắt, nghẹt mũi, đỏ mắt cùng bên</li>
                <li>Bồn chồn, không nằm yên</li>
              </ul>
            </div>

            <div className="help" style={{ marginTop: 0 }}>
              👉 Đây là 3 nhóm chiếm đa số tại phòng khám YHGĐ.
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 4) nguy cơ cao */}
      <SectionTitle n="4️⃣" title="Bước 4 — Bệnh đồng mắc & nhóm nguy cơ cao" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Nhóm cần thận trọng hơn</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Người ≥ 50 tuổi</li>
            <li>Phụ nữ mang thai</li>
            <li>Tăng huyết áp, đái tháo đường</li>
            <li>Ung thư, suy giảm miễn dịch</li>
            <li>Đang dùng: thuốc chống đông, corticoid, thuốc tránh thai</li>
          </ul>
          <div className="help" style={{ marginTop: 6 }}>
            👉 Ngưỡng chỉ định cận lâm sàng thấp hơn • ngưỡng chuyển viện thấp hơn.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">Gợi ý thực hành</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau đầu mới ở nhóm nguy cơ cao: ưu tiên loại trừ thứ phát.</li>
            <li>Đo HA, khám TK và soi đáy mắt (nếu có) kỹ hơn.</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 5) bỏ sót */}
      <SectionTitle n="5️⃣" title="Bước 5 — Bệnh dễ bỏ sót (cần chủ động nghĩ tới)" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.1 Đau đầu thứ phát nguy hiểm</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Xuất huyết dưới nhện</li>
            <li>U não / tổn thương choán chỗ</li>
            <li>Viêm màng não – viêm não</li>
            <li>Viêm động mạch thái dương</li>
            <li>Huyết khối xoang tĩnh mạch não</li>
            <li>Tăng / giảm áp lực nội sọ</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.2 Đau đầu do nguyên nhân khác</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau đầu do lạm dụng thuốc</li>
            <li>Đau đầu do viêm xoang</li>
            <li>Đau đầu do tăng huyết áp cấp</li>
            <li>Đau đầu do rối loạn tâm thần (lo âu, trầm cảm)</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 6) CLS */}
      <SectionTitle n="6️⃣" title="Chỉ định xét nghiệm — chẩn đoán hình ảnh" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">❌ Không cần khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau đầu nguyên phát điển hình</li>
            <li>Không có red flags</li>
            <li>Khám thần kinh bình thường</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">✅ Chỉ định khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Có red flags</li>
            <li>Đau đầu mới sau 50 tuổi</li>
            <li>Đau đầu tiến triển</li>
            <li>Nghi đau đầu thứ phát</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý cận lâm sàng</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>CT/MRI não</li>
          <li>CTM, CRP</li>
          <li>ESR (nghi viêm động mạch thái dương)</li>
          <li>Dịch não tủy nếu nghi nhiễm trùng TKTW</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 7) xử trí */}
      <SectionTitle n="7️⃣" title="Quyết định xử trí tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">7.1 Điều trị ngoại trú</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau đầu nguyên phát</li>
            <li>Không red flags</li>
            <li>Đáp ứng thuốc ban đầu</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">7.2 Chuyển viện / chuyển chuyên khoa</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Có red flags</li>
            <li>Không chắc chẩn đoán</li>
            <li>Không đáp ứng điều trị</li>
            <li>Đau đầu tiến triển nặng</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 8) tóm tắt */}
      <SectionTitle n="8️⃣" title="Tóm tắt thuật toán 1 trang" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>Bệnh nhân than đau đầu</li>
          <li>
            <b>Có red flags?</b> → Có: <b>chuyển viện</b>
          </li>
          <li>
            Không → <b>đau đầu nguyên phát điển hình?</b> → Có: điều trị & theo dõi
          </li>
          <li>
            Không → nghĩ bệnh bỏ sót/thứ phát → xét nghiệm / chuyển chuyên khoa
          </li>
        </ol>
      </div>

      <div className="divider" />

      {/* Kết luận */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✅ Kết luận thực hành</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đau đầu là chứng rất thường gặp.</li>
          <li>Nhiệm vụ BS gia đình: <b>không bỏ sót</b> đau đầu nguy hiểm.</li>
          <li>Tránh <b>lạm dụng</b> cận lâm sàng khi đau đầu nguyên phát điển hình.</li>
          <li>Trấn an và quản lý lâu dài đau đầu lành tính.</li>
        </ul>
      </div>
    </SymptomLayout>
  );
}
