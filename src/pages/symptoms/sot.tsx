// src/pages/symptoms/sot.tsx
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

const adultFlags: Flag[] = [
  { id: "adult_debilitated", label: "Suy kiệt: không thể đứng/ngồi/đi lại nếu không hỗ trợ" },
  { id: "adult_temp_extreme", label: "Nhiệt độ rất cao (>41,5°C) hoặc hạ thân nhiệt (<36°C)" },
  { id: "adult_resp", label: "Hô hấp: khó thở, RR >22, tím, SpO₂ <92% khí trời" },
  { id: "adult_circ", label: "Tuần hoàn: HATThu <100, tay chân lạnh ẩm, CRT >3 giây" },
  { id: "adult_gi", label: "Tiêu hóa: nôn nhiều/kéo dài; bụng ngoại khoa (đau dữ dội, co cứng)" },
  { id: "adult_neuro", label: "Thần kinh: lơ mơ/tri giác thay đổi (GCS <15), co giật, dấu màng não" },
  { id: "adult_anemia", label: "Thiếu máu rõ: xanh xao nhiều/niêm nhạt" },
  { id: "adult_bleeding", label: "Vàng da hoặc ban xuất huyết/petechiae/purpura hoặc chảy máu" },
];

const childFlags: Flag[] = [
  { id: "child_lt2mo", label: "< 2 tháng tuổi" },
  { id: "child_no_feed", label: "Không uống/bú được, nôn tất cả" },
  { id: "child_seizure", label: "Co giật" },
  { id: "child_toxic", label: "Lừ đừ/li bì/khó đánh thức hoặc nhiễm độc" },
  { id: "child_resp", label: "Thở mệt/gắng sức" },
  { id: "child_inconsolable", label: "Khóc không dỗ được" },
  { id: "child_purpura", label: "Ban xuất huyết (petechiae/purpura)" },
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

export default function Sot() {
  const [patientType, setPatientType] = useState<"adult" | "child">("adult");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  const clearAll = () => setChecks({});

  const activeFlags = useMemo(() => {
    const list = patientType === "adult" ? adultFlags : childFlags;
    return list.filter((f) => checks[f.id]);
  }, [patientType, checks]);

  const hasRedFlag = activeFlags.length > 0;

  return (
    <SymptomLayout title="Sốt">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>TIẾP CẬN CHỨNG SỐT TẠI PHÒNG KHÁM YHGĐ</div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: bác sĩ tuyến đầu định hướng nguyên nhân và quyết định xử trí an toàn.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">← Danh sách chứng</Link>
          <Link className="btn" to="/tools">Mở công cụ</Link>
        </div>
      </div>

      <div className="divider" />

      {/* ✅ TRIAGE UI */}
      <SectionTitle n="" title="Triage nhanh — Red flags (tick 1 tiêu chí là ưu tiên chuyển tuyến)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Chọn đối tượng:</div>

          <button type="button" className={patientType === "adult" ? "btnPrimary" : "btn"} onClick={() => setPatientType("adult")}>
            Người lớn
          </button>
          <button type="button" className={patientType === "child" ? "btnPrimary" : "btn"} onClick={() => setPatientType("child")}>
            Trẻ em
          </button>

          <div style={{ flex: 1 }} />

          <button type="button" className="btn" onClick={clearAll}>Xoá chọn</button>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → Ưu tiên chuyển viện/nhập viện" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → Có thể ngoại trú nếu theo dõi được" />
          )}
          <span className="help" style={{ marginTop: 0 }}>
            (Hỗ trợ quyết định — vẫn cần đánh giá lâm sàng & bối cảnh.)
          </span>
        </div>

        {hasRedFlag ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Đang tick ({activeFlags.length}):</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {activeFlags.map((f) => (
                <li key={f.id}>{f.label}</li>
              ))}
            </ul>

            <div className="divider" />

            <div style={{ fontWeight: 900, marginBottom: 8 }}>Nếu có red flags: làm gì tại phòng khám?</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>ABC cơ bản, đo sinh hiệu, SpO₂, đường huyết nếu nghi nặng.</li>
              <li>Hạ sốt an toàn, bù dịch nếu phù hợp trong lúc chờ chuyển.</li>
              <li>Chuyển viện an toàn (kèm giấy tóm tắt: thời gian sốt, dấu báo động, thuốc đã dùng).</li>
            </ul>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Nếu ngoại trú/theo dõi</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Tìm ổ nhiễm thường gặp theo cụm triệu chứng (mục 3).</li>
              <li>Nếu chưa rõ nguồn hoặc nguy cơ cao: cân nhắc xét nghiệm theo tầng (mục 6).</li>
              <li>Hẹn tái khám 24–48 giờ nếu còn sốt/không rõ nguồn; dặn dò dấu nặng (mục 7.3).</li>
            </ul>
          </div>
        )}

        <div className="divider" />

        {patientType === "adult" ? (
          <>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Red flags — Người lớn</div>
            <CheckboxList items={adultFlags} checked={checks} onToggle={toggle} />
          </>
        ) : (
          <>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Red flags — Trẻ em</div>
            <CheckboxList items={childFlags} checked={checks} onToggle={toggle} />
          </>
        )}
      </div>

      <div className="divider" />

      {/* 0) Định nghĩa tác vụ */}
      <SectionTitle n="0)" title="Định nghĩa tác vụ của phòng khám" />
      <div className="card" style={{ marginTop: 0 }}>
        <div className="help" style={{ marginTop: 0 }}>
          Khi bệnh nhân đến vì sốt, bác sĩ cần trả lời 4 câu hỏi theo thứ tự:
        </div>
        <ol style={{ margin: 10, paddingLeft: 18 }}>
          <li><b>Có nguy hiểm/cần chuyển viện ngay không?</b></li>
          <li><b>Có ổ nhiễm trùng rõ không?</b> (hoặc nguyên nhân không nhiễm trùng rõ)</li>
          <li><b>Thuộc nhóm nguy cơ/đồng mắc làm diễn tiến nặng không?</b></li>
          <li><b>Bệnh dễ bỏ sót nhưng nguy hiểm</b> cần chủ động loại trừ?</li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1) BƯỚC 1 */}
      <SectionTitle n="1)" title="Bước 1 — Xác nhận “có sốt thật” & phân loại thời gian" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận sốt</div>
          <div className="tile__sub">
            Ưu tiên đo đúng kỹ thuật (hậu môn chuẩn hơn; nách/miệng/tai/hồng ngoại tùy điều kiện).
          </div>
          <div className="help" style={{ marginTop: 6 }}>
            Ghi: nhiệt độ cao nhất, số lần sốt/ngày, đáp ứng hạ sốt, giờ đo.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.2 Phân loại theo thời gian</div>
          <div className="tile__sub"><b>Sốt cấp</b>: thường ≤ 7 ngày</div>
          <div className="tile__sub"><b>Sốt kéo dài/FUO</b>: ≥8 ngày đến 2–3 tuần (tùy thực hành)</div>
          <div className="help" style={{ marginTop: 6 }}>
            Nếu sốt kéo dài: vẫn làm theo khung dưới nhưng ngưỡng “tìm bệnh bỏ sót” và xét nghiệm sẽ rộng hơn.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 2) BƯỚC 2 - nội dung đầy đủ */}
      <SectionTitle n="2)" title="Bước 2 — Loại trừ “bệnh cấp cứu / red flags” (triage ngay)" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <RiskBadge level="very-high" text="Chỉ cần 1 tiêu chí → ưu tiên chuyển tuyến/nhập viện" />
      </div>

      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">2.1 Red flags ở người lớn</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Suy kiệt: không thể đứng/ngồi/đi lại nếu không hỗ trợ</li>
            <li>Nhiệt độ: tăng thân nhiệt rất cao (&gt;41,5°C) hoặc hạ thân nhiệt (&lt;36°C)</li>
            <li>Hô hấp: khó thở, RR &gt;22, tím, SpO₂ &lt;92% khí trời</li>
            <li>Tuần hoàn: HATThu &lt;100, tay chân lạnh ẩm, CRT &gt;3 giây</li>
            <li>Tiêu hóa: nôn nhiều/kéo dài; bụng ngoại khoa (đau dữ dội, co cứng)</li>
            <li>Thần kinh: lơ mơ/tri giác thay đổi (GCS &lt;15), co giật, dấu màng não</li>
            <li>Thiếu máu rõ: xanh xao nhiều/niêm nhạt</li>
            <li>Vàng da, hoặc ban xuất huyết/petechiae/purpura, hoặc chảy máu</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">2.2 Red flags ở trẻ em</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>&lt;2 tháng tuổi</li>
            <li>Không uống/bú được, nôn tất cả</li>
            <li>Co giật</li>
            <li>Lừ đừ/li bì/khó đánh thức hoặc nhiễm độc</li>
            <li>Thở mệt/gắng sức</li>
            <li>Khóc không dỗ được</li>
            <li>Ban xuất huyết (petechiae/purpura)</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>2.3 Nếu có red flags: làm gì tại phòng khám?</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>ABC cơ bản, đo sinh hiệu, SpO₂, đường huyết nếu nghi nặng.</li>
          <li>Hạ sốt an toàn, bù dịch nếu phù hợp trong lúc chờ chuyển.</li>
          <li>Chuyển viện an toàn (kèm giấy tóm tắt: thời gian sốt, dấu báo động, thuốc đã dùng).</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 3) BƯỚC 3 */}
      <SectionTitle n="3)" title="Bước 3 — “Bệnh thường gặp” (định hướng nhanh theo cụm triệu chứng)" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.1 Hỏi bệnh có mục tiêu (5 cụm)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đặc điểm sốt: ngày bệnh, khởi phát, liên tục/dao động, rét run</li>
            <li>Triệu chứng theo cơ quan (gợi ổ nhiễm): hô hấp trên/dưới, tiết niệu, tiêu hóa, thần kinh…</li>
            <li>Dịch tễ: vùng sống/đến, mùa dịch, tiếp xúc người sốt, muỗi/côn trùng, động vật, ăn uống nguy cơ</li>
            <li>Thuốc đã dùng: kháng sinh, hạ sốt, thuốc mới bắt đầu (nghi sốt do thuốc)</li>
            <li>Tiêm ngừa gần đây (phản ứng sau tiêm)</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.2 Khám tập trung + lược qua toàn thân</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Tổng trạng, dấu mất nước, ban/xuất huyết/vết cắn</li>
            <li>Tai–mũi–họng, phổi, tim</li>
            <li>Bụng (đau khu trú, gan lách), thận-hông lưng</li>
            <li>Da–mô mềm (viêm mô tế bào/áp xe), khớp</li>
            <li>Thần kinh (tri giác, màng não nếu nghi)</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>3.3 “Bệnh thường gặp” tại phòng khám (gợi ý)</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Nhiễm trùng hô hấp trên do virus</li>
          <li>Viêm phổi (virus/vi khuẩn/không điển hình)</li>
          <li>Nhiễm trùng tiết niệu / viêm đài bể thận</li>
          <li>Áp xe (ví dụ áp xe gan)</li>
        </ul>
        <div className="help">
          Nếu khám thấy ổ nhiễm rõ và bệnh nhân ổn → xử trí ngoại trú + hẹn tái khám/dặn dò dấu nặng.
        </div>
      </div>

      <div className="divider" />

      {/* 4) BƯỚC 4 */}
      <SectionTitle n="4)" title="Bước 4 — Đồng mắc / nhóm nguy cơ cao" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Nhóm nguy cơ cao</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Trẻ sơ sinh/nhũ nhi nhỏ, phụ nữ có thai, người cao tuổi/suy nhược</li>
            <li>Suy giảm miễn dịch: ĐTĐ, suy thận mạn, suy gan, ung thư, tự miễn, ghép tạng, HIV…</li>
            <li>Dụng cụ/thiết bị: van tim nhân tạo, khớp nhân tạo, stent; ống thông tiểu/dẫn lưu…</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.2 Hành động thực hành</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Nguy cơ cao + chưa rõ nguồn sốt: cân nhắc xét nghiệm nền (mục 6) ngay từ đầu.</li>
            <li>Nghi nhiễm trùng nặng/không chắc theo dõi được: chuyển tuyến sớm.</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 5) BƯỚC 5 */}
      <SectionTitle n="5)" title="Bước 5 — Bệnh dễ bỏ sót (chủ động hỏi–khám)" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.1 Nhiễm trùng dễ bỏ sót</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Nhiễm khuẩn huyết, viêm nội tâm mạc nhiễm trùng</li>
            <li>Lao</li>
            <li>Sốt rét (đặc biệt có đi/về vùng lưu hành)</li>
            <li>HIV/AIDS (nếu yếu tố nguy cơ/biểu hiện gợi ý)</li>
            <li>Viêm xương khớp nhiễm trùng</li>
            <li>Giang mai (tùy bối cảnh)</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.2 Không nhiễm trùng dễ bỏ sót</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Sốt do thuốc, giả sốt</li>
            <li>Bệnh mô liên kết/tự miễn (lupus, VKDT…)</li>
            <li>Viêm mạch (PAN, viêm ĐM tế bào khổng lồ/viêm đa cơ…)</li>
            <li>Sarcoidosis</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>5.3 “Câu hỏi chặn” (5 câu)</div>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>Có đi/ở vùng sốt rét, rừng núi, ngủ rẫy?</li>
          <li>Có sụt cân, ho kéo dài, ra mồ hôi đêm (gợi lao/ác tính)?</li>
          <li>Có đau ngực, khó thở, thổi tim mới, tiền sử van tim/tiêm chích (gợi nội tâm mạc)?</li>
          <li>Có thuốc mới trong 1–3 tuần gần đây?</li>
          <li>Có đau khớp/ban/loét miệng/nhạy nắng (gợi tự miễn)?</li>
        </ol>
      </div>

      <div className="divider" />

      {/* 6) Xét nghiệm */}
      <SectionTitle n="6)" title="Chỉ định xét nghiệm tại tuyến cơ sở" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">6.1 Khi nào KHÔNG cần xét nghiệm ngay?</div>
          <div className="tile__sub">
            Người bệnh ổn, không red flags, có nguồn nhiễm rõ kiểu nhẹ (URI virus), theo dõi được, tái khám được.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">6.2 Khi nào NÊN làm xét nghiệm sớm?</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Không rõ nguồn sốt sau hỏi–khám</li>
            <li>Nguy cơ cao/đồng mắc</li>
            <li>Dấu gợi ý bệnh nặng nhưng chưa đủ red flags</li>
            <li>Sốt kéo dài</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>6.3 “Gói xét nghiệm theo tầng”</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <RiskBadge level="low" text="Tầng 1 (cơ bản)" />
          <RiskBadge level="moderate" text="Tầng 2 (theo dịch tễ/triệu chứng)" />
          <RiskBadge level="high" text="Tầng 3 (khi nghi nặng/khó)" />
        </div>

        <div className="tileGrid">
          <div className="tile" style={{ cursor: "default" }}>
            <div className="tile__label">Tầng 1</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>CTM, CRP</li>
              <li>Tổng phân tích nước tiểu (± cấy nếu nghi)</li>
            </ul>
          </div>

          <div className="tile" style={{ cursor: "default" }}>
            <div className="tile__label">Tầng 2</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Dengue NS1/IgM-IgG</li>
              <li>Lam sốt rét/ký sinh trùng</li>
              <li>X-quang phổi</li>
              <li>Siêu âm bụng</li>
            </ul>
          </div>

          <div className="tile" style={{ cursor: "default" }}>
            <div className="tile__label">Tầng 3</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Cấy máu, procalcitonin, lactate</li>
              <li>Xét nghiệm tự miễn (ANA/anti-dsDNA/RF…)</li>
              <li>PCR lao…</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 7) Xử trí */}
      <SectionTitle n="7)" title="Xử trí tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">7.1 Điều trị triệu chứng (an toàn)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Lau mát, nới rộng quần áo, uống đủ nước, tránh đắp kín.</li>
            <li>
              <b>Paracetamol</b>:
              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                <li>Trẻ em: 10–15 mg/kg/lần, lặp 4–6 giờ khi cần</li>
                <li>Người lớn: 500 mg–1 g/lần, 3–4 lần/ngày khi cần</li>
              </ul>
            </li>
            <li>Thận trọng NSAIDs/aspirin khi chưa rõ nguyên nhân; tránh aspirin ở trẻ.</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">7.2 Quyết định nơi điều trị</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><b>Ngoại trú</b>: ổn định, không red flags, theo dõi được</li>
            <li>
              <b>Nhập viện/chuyển tuyến</b>:
              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                <li>Có red flags</li>
                <li>Đồng mắc nặng/suy giảm miễn dịch</li>
                <li>Nhóm nguy cơ cao</li>
                <li>Không đáp ứng điều trị thông thường</li>
                <li>Nghi bệnh nguy hiểm cần can thiệp sâu (CNS infection, sepsis, viêm nội tâm mạc, viêm phổi nặng, sốt rét nặng, SXH nặng…)</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>7.3 Dặn dò tái khám (bắt buộc ghi rõ)</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Tái khám theo hẹn (thường 24–48 giờ nếu chưa rõ nguồn hoặc còn sốt).</li>
          <li>
            Tái khám ngay nếu xuất hiện: khó thở, lừ đừ, đau bụng tăng, nôn nhiều, phát ban xuất huyết/chảy máu,
            vàng da, tiểu ít, tay chân lạnh, tụt HA, co giật…
          </li>
        </ul>
      </div>

      <div className="divider" />

      {/* 8) Tóm tắt */}
      <SectionTitle n="8)" title="Bản tóm tắt 1 trang — thuật toán áp dụng nhanh" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đo sinh hiệu + xác nhận sốt</li>
          <li><b>Red flags?</b> → Có: chuyển viện/nhập viện</li>
          <li>Không red flags → tìm bệnh thường gặp theo cụm triệu chứng</li>
          <li>Có ổ rõ → điều trị theo nguyên nhân + hẹn tái khám</li>
          <li>Có đồng mắc/nguy cơ cao? → ngưỡng xét nghiệm/chuyển tuyến thấp</li>
          <li>Không rõ nguyên nhân hoặc sốt kéo dài → nghĩ bệnh bỏ sót + xét nghiệm theo tầng / chuyển tuyến phù hợp</li>
        </ol>
      </div>
    </SymptomLayout>
  );
}
