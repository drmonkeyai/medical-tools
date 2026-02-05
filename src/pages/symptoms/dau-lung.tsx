// src/pages/symptoms/dau-that-lung.tsx
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
  { id: "rf_trauma", label: "Chấn thương mạnh / té ngã (đặc biệt người già, loãng xương)", hint: "Gợi ý gãy đốt sống" },
  { id: "rf_fever_infection_ivu", label: "Sốt / dấu nhiễm trùng / tiền sử tiêm chích", hint: "Gợi ý nhiễm trùng cột sống" },
  { id: "rf_weightloss_cancer", label: "Sụt cân / tiền sử ung thư", hint: "Gợi ý ung thư di căn cột sống" },
  { id: "rf_night_rest_pain", label: "Đau về đêm, đau không giảm khi nghỉ", hint: "Gợi ý viêm/các nguyên nhân nghiêm trọng" },
  { id: "rf_progressive_weakness", label: "Yếu chân tiến triển", hint: "Gợi ý chèn ép thần kinh" },
  { id: "rf_sphincter", label: "Rối loạn cơ vòng: bí tiểu / tiểu không tự chủ", hint: "Gợi ý hội chứng chùm đuôi ngựa" },
  { id: "rf_saddle_anesthesia", label: "Tê vùng yên ngựa", hint: "Gợi ý hội chứng chùm đuôi ngựa" },
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

export default function DauThatLung() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [duration, setDuration] = useState<Duration>("unknown");
  const [radicular, setRadicular] = useState<"unknown" | "yes" | "no">("unknown");

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }));
  const clearAll = () => setChecks({});

  const activeFlags = useMemo(() => redFlags.filter((f) => checks[f.id]), [checks]);
  const hasRedFlag = activeFlags.length > 0;

  const triageBadge = useMemo(() => {
    if (hasRedFlag) return <RiskBadge level="very-high" text="Có RED FLAGS → ưu tiên chuyển viện / chụp MRI khẩn" />;

    if (radicular === "yes")
      return <RiskBadge level="moderate" text="Có triệu chứng rễ → đánh giá thần kinh, điều trị bảo tồn giai đoạn đầu ± chuyển chuyên khoa khi nặng/tiến triển" />;

    if (radicular === "no")
      return <RiskBadge level="low" text="Không red flags + không đau rễ điển hình → nhiều khả năng đau thắt lưng không đặc hiệu (90–95%)" />;

    return <RiskBadge level="low" text="Chưa đủ dữ kiện → chọn thời gian đau + đánh dấu đau rễ để ra hướng xử trí" />;
  }, [hasRedFlag, radicular]);

  const durationBadge = useMemo(() => {
    if (duration === "acute") return <RiskBadge level="low" text="Đau cấp (< 6 tuần): đa số lành tính, ưu tiên điều trị bảo tồn và duy trì vận động" />;
    if (duration === "subacute") return <RiskBadge level="moderate" text="Đau bán cấp (6–12 tuần): đánh giá yếu tố duy trì đau, tăng can thiệp vận động/phục hồi" />;
    if (duration === "chronic") return <RiskBadge level="moderate" text="Đau mạn (> 12 tuần): chú ý yếu tố tâm lý–xã hội (yellow flags), nguy cơ mạn hóa" />;
    return <RiskBadge level="low" text="Chưa chọn thời gian đau" />;
  }, [duration]);

  return (
    <SymptomLayout title="Đau thắt lưng">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            TIẾP CẬN CHỨNG ĐAU THẮT LƯNG — TẠI PHÒNG KHÁM Y HỌC GIA ĐÌNH
          </div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: không bỏ sót đau lưng nguy hiểm, nhận diện đau rễ thần kinh, xử trí đau không đặc hiệu và sàng lọc nguy cơ mạn hóa.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">← Danh sách chứng</Link>
          <Link className="btn" to="/tools">Công cụ</Link>
        </div>
      </div>

      <div className="divider" />

      {/* 0 */}
      <SectionTitle n="0)" title="Mục tiêu thực hành — 4 câu hỏi đúng thứ tự" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Có đau thắt lưng nguy hiểm cần chuyển viện ngay không?</b></li>
          <li><b>Có triệu chứng rễ thần kinh hay không?</b></li>
          <li><b>Nếu không, đây có phải đau thắt lưng không đặc hiệu (thường gặp nhất)?</b></li>
          <li><b>Có yếu tố đồng mắc hay nguy cơ tiến triển mạn cần can thiệp sớm không?</b></li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1 */}
      <SectionTitle n="1️⃣" title="Bước 1 — Xác nhận chứng đau thắt lưng & phân loại theo thời gian" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận “đau thắt lưng”</div>
          <div className="tile__sub">Đau vùng từ bờ dưới xương sườn 12 đến nếp lằn mông.</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Khu trú</li>
            <li>Lan mơ hồ</li>
            <li>Hoặc lan xuống chân</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.2 Phân loại theo thời gian (rất quan trọng)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><b>Đau cấp:</b> &lt; 6 tuần</li>
            <li><b>Đau bán cấp:</b> 6–12 tuần</li>
            <li><b>Đau mạn:</b> &gt; 12 tuần</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Phân loại này quyết định tiên lượng, điều trị và chỉ định cận lâm sàng.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Quick controls */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Thời gian đau:</div>
          <button type="button" className={duration === "acute" ? "btnPrimary" : "btn"} onClick={() => setDuration("acute")}>
            Cấp (&lt; 6 tuần)
          </button>
          <button type="button" className={duration === "subacute" ? "btnPrimary" : "btn"} onClick={() => setDuration("subacute")}>
            Bán cấp (6–12 tuần)
          </button>
          <button type="button" className={duration === "chronic" ? "btnPrimary" : "btn"} onClick={() => setDuration("chronic")}>
            Mạn (&gt; 12 tuần)
          </button>
          <button type="button" className={duration === "unknown" ? "btnPrimary" : "btn"} onClick={() => setDuration("unknown")}>
            Chưa rõ
          </button>
        </div>

        <div className="divider" />
        {durationBadge}

        <div className="divider" />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Triệu chứng rễ thần kinh?</div>
          <button type="button" className={radicular === "yes" ? "btnPrimary" : "btn"} onClick={() => setRadicular("yes")}>
            Có
          </button>
          <button type="button" className={radicular === "no" ? "btnPrimary" : "btn"} onClick={() => setRadicular("no")}>
            Không
          </button>
          <button type="button" className={radicular === "unknown" ? "btnPrimary" : "btn"} onClick={() => setRadicular("unknown")}>
            Chưa rõ
          </button>
        </div>

        <div className="divider" />
        {triageBadge}
      </div>

      <div className="divider" />

      {/* 2 */}
      <SectionTitle n="2️⃣" title="Bước 2 — Loại trừ đau thắt lưng nguy hiểm (Red flags)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → chuyển viện / chụp MRI khẩn" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → tiếp tục đánh giá đau rễ & đau không đặc hiệu" />
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
            <div className="help" style={{ marginTop: 10 }}>
              👉 Gợi ý: gãy đốt sống / nhiễm trùng cột sống / ung thư di căn / viêm cột sống trục / hội chứng chùm đuôi ngựa.
            </div>
          </div>
        )}

        <div className="divider" />
        <div className="help" style={{ marginTop: 0, marginBottom: 10 }}>
          👉 Chỉ cần <b>1 dấu hiệu</b> → không xử trí như đau lưng lành tính.
        </div>
        <CheckboxList items={redFlags} checked={checks} onToggle={toggle} />
      </div>

      <div className="divider" />

      {/* 3 */}
      <SectionTitle n="3️⃣" title="Bước 3 — Đánh giá đau rễ thần kinh (5–10%)" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.1 Khi nào nghĩ đau rễ?</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau lan xuống chân theo dermatome</li>
            <li>Đau kiểu điện giật, bỏng rát</li>
            <li>Tăng khi ho, hắt hơi, rặn</li>
            <li>Có thể kèm: tê bì, yếu cơ, giảm phản xạ</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.2 Khám định hướng</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>SLR (Lasègue) ± Cross SLR</li>
            <li>Cảm giác theo dermatome</li>
            <li>Cơ lực</li>
            <li>Phản xạ gối (L4), gót (S1)</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Nguyên nhân thường gặp: thoát vị đĩa đệm, hẹp ống sống thắt lưng, viêm rễ sau zona.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">Ghi nhớ</div>
          <div className="tile__sub">
            Đau rễ <b>không kèm red flags</b> vẫn có thể điều trị tại YHGĐ giai đoạn đầu (bảo tồn), theo dõi tiến triển.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 4 */}
      <SectionTitle n="4️⃣" title="Bước 4 — Đau thắt lưng không đặc hiệu (90–95%)" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Đặc điểm gợi ý</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau khu trú vùng thắt lưng</li>
            <li>Tăng khi vận động (cúi, xoay, ngồi lâu)</li>
            <li>Giảm khi nghỉ</li>
            <li>Không lan theo rễ</li>
            <li>Không yếu cơ, không rối loạn cơ vòng</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.2 Nguyên nhân thường gặp</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Căng cơ – giãn dây chằng</li>
            <li>Đau do tư thế, ergonomic kém</li>
            <li>Thoái hóa cột sống</li>
            <li>Đau khớp cùng chậu</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Đây là chẩn đoán lâm sàng điển hình + không có red flags (không phải “chẩn đoán loại trừ”).
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 5 */}
      <SectionTitle n="5️⃣" title="Bước 5 — Bệnh đồng mắc & yếu tố tiên lượng xấu (Yellow flags)" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.1 Bệnh đồng mắc</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Loãng xương</li>
            <li>Thoái hóa khớp</li>
            <li>Béo phì</li>
            <li>Trầm cảm, lo âu</li>
            <li>Ít vận động, nghề ngồi nhiều</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">5.2 Yellow flags (tâm lý – xã hội)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Sợ vận động</li>
            <li>Lo lắng quá mức về “thoát vị”, “lệch cột sống”</li>
            <li>Stress công việc</li>
            <li>Nghỉ việc kéo dài</li>
          </ul>
          <div className="help" style={{ marginTop: 8 }}>
            👉 Nên sàng lọc sớm (ví dụ STarT Back Tool) để ngăn đau cấp → mạn.
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 6 */}
      <SectionTitle n="6️⃣" title="Bệnh dễ bỏ sót (cần luôn nghĩ tới)" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Hội chứng chùm đuôi ngựa</li>
          <li>Ung thư di căn cột sống</li>
          <li>Nhiễm trùng cột sống</li>
          <li>Viêm cột sống trục (đau đêm, cải thiện khi vận động)</li>
          <li>Đau quy chiếu từ: thận, ĐMC bụng, khớp háng</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 7 */}
      <SectionTitle n="7️⃣" title="Cận lâm sàng — khi nào cần?" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">❌ KHÔNG chỉ định X-quang / MRI khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Đau &lt; 6 tuần</li>
            <li>Không red flags</li>
            <li>Không triệu chứng thần kinh tiến triển</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">✅ Chỉ định khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Có red flags</li>
            <li>Đau rễ nặng / tiến triển</li>
            <li>Không cải thiện sau 4–6 tuần điều trị chuẩn</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 8 */}
      <SectionTitle n="8️⃣" title="Xử trí tại phòng khám YHGĐ" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.1 Nguyên tắc cốt lõi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Trấn an – giáo dục: đa số lành tính</li>
            <li><b>Duy trì vận động (quan trọng nhất)</b></li>
            <li>Tránh nằm nghỉ kéo dài</li>
            <li>Không lạm dụng hình ảnh học</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.2 Điều trị</div>
          <div className="tile__sub" style={{ marginBottom: 6 }}>
            <b>Không dùng thuốc (first-line):</b>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Vận động sớm</li>
            <li>Chườm ấm</li>
            <li>Điều chỉnh tư thế – ergonomics</li>
          </ul>
          <div className="tile__sub" style={{ marginTop: 10, marginBottom: 6 }}>
            <b>Thuốc khi cần:</b>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>NSAIDs ngắn hạn</li>
            <li>Paracetamol nếu không dùng được NSAIDs</li>
            <li>Giãn cơ ngắn hạn khi co cứng cơ</li>
          </ul>
          <div className="tile__sub" style={{ marginTop: 10, marginBottom: 6 }}>
            <b>Đau rễ:</b>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>NSAIDs ± thuốc thần kinh (gabapentin/pregabalin)</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 9 */}
      <SectionTitle n="9️⃣" title="Chỉ định chuyển tuyến / chuyên khoa" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Có red flags</li>
          <li>Yếu thần kinh tiến triển</li>
          <li>Đau không cải thiện sau 4–6 tuần</li>
          <li>Nghi bệnh lý cột sống nghiêm trọng</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 10 */}
      <SectionTitle n="🔟" title="Tóm tắt thuật toán 1 trang" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đau thắt lưng → <b>Red flags?</b></li>
          <li>→ Có → <b>Chuyển viện</b></li>
          <li>→ Không → <b>Đau rễ?</b></li>
          <li>→ Có → <b>Điều trị bảo tồn</b> ± chuyển chuyên khoa khi nặng/tiến triển</li>
          <li>→ Không → <b>Đau không đặc hiệu</b> → trấn an – vận động – theo dõi</li>
        </ul>
      </div>

      <div className="divider" />

      {/* Conclusion */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✅ Kết luận thực hành</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đau thắt lưng là chứng rất thường gặp.</li>
          <li>Không bỏ sót bệnh nguy hiểm.</li>
          <li>Không lạm dụng MRI / thuốc.</li>
          <li>Giúp bệnh nhân trở lại vận động sớm.</li>
          <li>Làm tốt tuyến cơ sở = giảm quá tải, giảm chi phí, tăng chất lượng sống.</li>
        </ul>
      </div>
    </SymptomLayout>
  );
}
