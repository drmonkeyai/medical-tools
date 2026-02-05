// src/pages/symptoms/phu-chan.tsx
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

type Flag = { id: string; label: string; group: string };

const redFlags: Flag[] = [
  {
    id: "rf_resp_circ",
    group: "🔴 Phù + suy hô hấp / tuần hoàn",
    label: "Khó thở, thở nhanh; phù phổi cấp; huyết áp tụt, mạch nhanh → nghi suy tim cấp/sốc",
  },
  {
    id: "rf_fast_pain_red",
    group: "🔴 Phù tiến triển nhanh, đau, nóng, đỏ",
    label:
      "Một chi sưng đau căng, tăng nhanh 24–72 giờ → nghi DVT/viêm mô tế bào/chèn ép khoang",
  },
  {
    id: "rf_angio",
    group: "🔴 Phù mặt – lưỡi – thanh quản",
    label: "→ Phù mạch / phản vệ",
  },
  {
    id: "rf_oligo_anuria",
    group: "🔴 Phù + thiểu niệu / vô niệu",
    label: "→ Suy thận cấp",
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
  const grouped = useMemo(() => {
    const m = new Map<string, Flag[]>();
    for (const it of items) m.set(it.group, [...(m.get(it.group) ?? []), it]);
    return Array.from(m.entries());
  }, [items]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {grouped.map(([g, arr]) => (
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
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>{it.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PhuChan() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [pattern, setPattern] = useState<"unknown" | "localized" | "generalized">("unknown");

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }));
  const clearAll = () => setChecks({});

  const activeFlags = useMemo(() => redFlags.filter((f) => checks[f.id]), [checks]);
  const hasRedFlag = activeFlags.length > 0;

  const patternHint = useMemo(() => {
    if (pattern === "localized") {
      return {
        badge: <RiskBadge level="moderate" text="Hướng tiếp cận: PHÙ KHU TRÚ → ưu tiên loại trừ DVT/viêm mô tế bào/chèn ép khoang" />,
        text: "Thường do nguyên nhân tại chỗ; có thể không đối xứng.",
      };
    }
    if (pattern === "generalized") {
      return {
        badge: <RiskBadge level="moderate" text="Hướng tiếp cận: PHÙ TOÀN THÂN → nghĩ tim/gan/thận/thuốc/giảm albumin" />,
        text: "Hai chân ± tay, mặt; có thể kèm báng bụng/tràn dịch màng phổi.",
      };
    }
    return {
      badge: <RiskBadge level="low" text="Chưa chọn kiểu phù — hãy chọn KHU TRÚ hoặc TOÀN THÂN để định hướng" />,
      text: "Bước 2 là bước quyết định hướng tư duy chẩn đoán.",
    };
  }, [pattern]);

  return (
    <SymptomLayout title="Phù">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>TIẾP CẬN CHỨNG PHÙ — TẠI PHÒNG KHÁM Y HỌC GIA ĐÌNH</div>
          <div className="help" style={{ marginTop: 0 }}>
            Mục tiêu: không bỏ sót phù nguy hiểm • phân biệt khu trú/toàn thân • tránh lạm dụng lợi tiểu.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/symptoms">← Danh sách chứng</Link>
          <Link className="btn" to="/tools">Mở công cụ</Link>
        </div>
      </div>

      <div className="divider" />

      {/* 0) 4 câu hỏi */}
      <SectionTitle n="0)" title="Mục tiêu thực hành — 4 câu hỏi tuần tự" />
      <div className="card" style={{ marginTop: 0 }}>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Có phù nguy hiểm/cấp cứu cần chuyển viện ngay không?</b></li>
          <li><b>Đây là phù khu trú hay phù toàn thân?</b></li>
          <li><b>Nguyên nhân thường gặp nhất trong bối cảnh bệnh nhân này là gì?</b></li>
          <li><b>Có bệnh nền hoặc nguyên nhân dễ bỏ sót cần chủ động tìm không?</b></li>
        </ol>
      </div>

      <div className="divider" />

      {/* 1) Red flags UI */}
      <SectionTitle n="1️⃣" title="Bước 1 — Xác nhận phù & loại trừ phù cấp nguy hiểm (Red flags)" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {hasRedFlag ? (
            <RiskBadge level="very-high" text="Có RED FLAGS → Không xử trí ngoại trú • Ưu tiên xử trí ban đầu + chuyển viện" />
          ) : (
            <RiskBadge level="low" text="Chưa ghi nhận red flags → Tiếp tục phân loại khu trú/toàn thân" />
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

            <div style={{ fontWeight: 900, marginBottom: 8 }}>👉 Có red flag → xử trí ban đầu + chuyển viện</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Đánh giá ABC, sinh hiệu, SpO₂, đường huyết nếu nghi nặng.</li>
              <li>Oxy, nằm đầu cao nếu khó thở; chuẩn bị chuyển tuyến an toàn.</li>
              <li>Tóm tắt: thời gian phù, diễn tiến, dấu báo động, thuốc đang dùng, bệnh nền.</li>
            </ul>
          </div>
        )}

        <div className="divider" />

        <CheckboxList items={redFlags} checked={checks} onToggle={toggle} />

        <div className="help" style={{ marginTop: 10 }}>
          👉 Chỉ cần <b>1 tiêu chí</b> → không xử trí ngoại trú.
        </div>
      </div>

      <div className="divider" />

      {/* 1.1 Xác nhận phù */}
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">1.1 Xác nhận “phù”</div>
          <div className="tile__sub"><b>Bệnh nhân than</b>: sưng chân/nặng chân • mang giày dép chật • phù mặt/mí mắt • tăng cân nhanh</div>
          <div className="tile__sub"><b>Khám</b>: ấn lõm hay không • mức độ (+ → ++++) • phân bố</div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">Ghi nhanh tại phòng khám</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Vị trí: 1 bên/2 bên • chân/tay/mặt</li>
            <li>Thời gian: mới/tiến triển nhanh/mạn</li>
            <li>Đau/nóng/đỏ? khó thở? thiểu niệu?</li>
            <li>Thuốc mới dùng (đặc biệt CCB như amlodipine)</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 2) Khu trú vs toàn thân: UI chọn */}
      <SectionTitle n="2️⃣" title="Bước 2 — Phân loại cốt lõi: phù khu trú hay phù toàn thân?" />
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Chọn kiểu phù:</div>

          <button
            type="button"
            className={pattern === "localized" ? "btnPrimary" : "btn"}
            onClick={() => setPattern("localized")}
          >
            Phù khu trú
          </button>

          <button
            type="button"
            className={pattern === "generalized" ? "btnPrimary" : "btn"}
            onClick={() => setPattern("generalized")}
          >
            Phù toàn thân
          </button>

          <button
            type="button"
            className={pattern === "unknown" ? "btnPrimary" : "btn"}
            onClick={() => setPattern("unknown")}
          >
            Chưa rõ
          </button>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {patternHint.badge}
          <span className="help" style={{ marginTop: 0 }}>{patternHint.text}</span>
        </div>

        <div className="divider" />

        <div className="tileGrid">
          <div className="tile" style={{ cursor: "default" }}>
            <div className="tile__label">2.1 Phù khu trú</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Một chi / một vùng</li>
              <li>Có thể không đối xứng</li>
              <li>Thường do nguyên nhân tại chỗ</li>
            </ul>
          </div>

          <div className="tile" style={{ cursor: "default" }}>
            <div className="tile__label">2.2 Phù toàn thân</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Hai chân ± tay, mặt</li>
              <li>Có thể kèm: báng bụng, tràn dịch màng phổi</li>
              <li>Thường do bệnh hệ thống</li>
            </ul>
          </div>
        </div>

        <div className="help" style={{ marginTop: 10 }}>
          👉 Đây là bước quyết định hướng tư duy chẩn đoán.
        </div>
      </div>

      <div className="divider" />

      {/* 3) Phù khu trú */}
      <SectionTitle n="3️⃣" title="Bước 3 — Phù khu trú: nguyên nhân thường gặp & bỏ sót" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.1 Khu trú CẤP (tăng nhanh &lt; 72 giờ) — ưu tiên loại trừ</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Huyết khối tĩnh mạch sâu (DVT)</li>
            <li>Viêm mô tế bào</li>
            <li>Phản ứng dị ứng / phù mạch</li>
            <li>Chèn ép khoang</li>
            <li>Mới dùng thuốc (đặc biệt chẹn kênh canxi)</li>
          </ul>
          <div className="help" style={{ marginTop: 6 }}>
            Đặc điểm gợi ý: đau/nóng/đỏ • một bên • căng da • to nhanh.
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">3.2 Khu trú MẠN — thường gặp</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>✅ Suy tĩnh mạch mạn chi dưới</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Phù tăng về chiều, giảm khi kê cao chân</li>
                <li>Giãn tĩnh mạch, sạm da, chuột rút đêm</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>✅ Tắc/mất dẫn lưu bạch huyết</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Phù dai dẳng, dần chuyển phù cứng</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>✅ Chèn ép mạn</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>U, quần áo bó chặt…</li>
              </ul>
            </div>

            <div className="help" style={{ marginTop: 0 }}>
              👉 Không dùng lợi tiểu cho phù suy tĩnh mạch đơn thuần.
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 4) Phù toàn thân */}
      <SectionTitle n="4️⃣" title="Bước 4 — Phù toàn thân: tiếp cận theo nguyên nhân thường gặp" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.1 Phù do TIM (rất thường gặp)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Khó thở gắng sức, khó thở khi nằm</li>
            <li>Tiểu đêm, tăng cân nhanh</li>
            <li>Phù mềm, ấn lõm, đối xứng, nặng về chiều, giảm buổi sáng</li>
          </ul>
          <div className="help" style={{ marginTop: 6 }}>👉 Suy tim mạn / suy tim mất bù.</div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.2 Phù do GAN</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Tiền sử viêm gan/rượu</li>
            <li>Báng bụng; vàng da, sao mạch, lòng bàn tay son</li>
            <li>Phù mềm; báng bụng nổi bật hơn phù chân</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.3 Phù do THẬN</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>a) Hội chứng thận hư</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Phù rất nhiều, rõ ở mi mắt/mặt</li>
                <li>Nặng buổi sáng; nước tiểu nhiều bọt; tăng cân nhanh</li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>b) Suy thận</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Phù mạn; có tăng huyết áp; tiểu ít</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.4 Giảm albumin / suy dinh dưỡng</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Người già, ăn uống kém</li>
            <li>Bệnh tiêu hóa mạn</li>
            <li>Teo cơ, thiếu máu</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">4.5 Phù do THUỐC (hay bị bỏ sót)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Chẹn kênh canxi (Amlodipine)</li>
            <li>NSAIDs</li>
            <li>Corticoid</li>
            <li>Estrogen</li>
            <li>Một số thuốc tâm thần</li>
          </ul>
          <div className="help" style={{ marginTop: 6 }}>👉 Hỏi kỹ thuốc mới trong vài ngày–vài tuần gần đây.</div>
        </div>
      </div>

      <div className="divider" />

      {/* 5) Nguy cơ cao */}
      <SectionTitle n="5️⃣" title="Bệnh đồng mắc & nhóm nguy cơ cao" />
      <div className="card" style={{ marginTop: 0 }}>
        <div className="help" style={{ marginTop: 0 }}>
          Cần ngưỡng chuyển tuyến thấp hơn ở:
        </div>
        <ul style={{ margin: 10, paddingLeft: 18 }}>
          <li>Người cao tuổi</li>
          <li>Suy tim, suy thận, xơ gan</li>
          <li>Thai kỳ</li>
          <li>Ung thư</li>
          <li>Suy giảm miễn dịch</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 6) Bệnh bỏ sót */}
      <SectionTitle n="6️⃣" title="Bệnh dễ bỏ sót (cần chủ động nghĩ)" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Huyết khối tĩnh mạch sâu</li>
          <li>Tắc tĩnh mạch chủ trên / dưới</li>
          <li>Hội chứng thận hư</li>
          <li>Phù do thuốc</li>
          <li>Phù vô căn (nữ 30–50 tuổi)</li>
          <li>Phù bạch huyết giai đoạn sớm</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 7) Xét nghiệm */}
      <SectionTitle n="7️⃣" title="Xét nghiệm — khi nào cần?" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">❌ Không cần ngay khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Phù nhẹ</li>
            <li>Nguyên nhân rõ (suy tĩnh mạch, do thuốc)</li>
            <li>Không triệu chứng toàn thân</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">✅ Nên làm khi</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Phù toàn thân</li>
            <li>Không rõ nguyên nhân</li>
            <li>Có bệnh nền</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Gợi ý xét nghiệm</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>CTM</li>
          <li>Creatinine, điện giải</li>
          <li>Albumin máu</li>
          <li>Tổng phân tích nước tiểu</li>
          <li>Siêu âm bụng / tim (khi cần)</li>
        </ul>
      </div>

      <div className="divider" />

      {/* 8) Xử trí */}
      <SectionTitle n="8️⃣" title="Quyết định xử trí tại phòng khám" />
      <div className="tileGrid">
        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.1 Điều trị ngoại trú</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Phù nhẹ, nguyên nhân rõ</li>
            <li>Không red flags</li>
            <li>Theo dõi được</li>
          </ul>
        </div>

        <div className="tile" style={{ cursor: "default" }}>
          <div className="tile__label">8.2 Chuyển viện / chuyển chuyên khoa</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Phù cấp nguy hiểm</li>
            <li>Phù toàn thân chưa rõ nguyên nhân</li>
            <li>Suy tim, suy thận, xơ gan mất bù</li>
            <li>Nghi huyết khối, phù mạch</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      {/* 9) Tóm tắt */}
      <SectionTitle n="9️⃣" title="Tóm tắt thuật toán 1 trang" />
      <div className="card" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Phù → <b>Red flags?</b></li>
          <li>→ Có: <b>Chuyển viện</b></li>
          <li>→ Không: <b>Phù khu trú hay toàn thân?</b></li>
          <li>→ Khu trú: loại trừ DVT/viêm → nghĩ suy tĩnh mạch/bạch huyết</li>
          <li>→ Toàn thân: tim / gan / thận / thuốc / giảm albumin</li>
          <li>→ Không rõ: tìm bệnh bỏ sót</li>
        </ul>
      </div>

      <div className="divider" />

      {/* Kết luận */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✅ Kết luận thực hành</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Phù là một <b>chứng</b>, không phải chẩn đoán.</li>
          <li>Không bỏ sót phù nguy hiểm.</li>
          <li>Không lạm dụng lợi tiểu.</li>
          <li>Phân biệt rõ <b>khu trú – toàn thân</b>.</li>
          <li>Hỏi bệnh và khám kỹ quyết định ~80% chẩn đoán.</li>
        </ul>
      </div>
    </SymptomLayout>
  );
}
