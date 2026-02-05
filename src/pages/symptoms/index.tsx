// src/pages/symptoms/index.tsx
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

type Group =
  | "all"
  | "toan-than"
  | "tim-mach-ho-hap"
  | "than-kinh-tam-than"
  | "tieu-hoa-gan-mat"
  | "tiet-nieu"
  | "co-xuong-khop"
  | "da-lieu";

type SymptomItem = {
  group: Exclude<Group, "all">;
  groupLabel: string;
  label: string;
  slug: string;
  keywords?: string;
};

const groups: Array<{ id: Group; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "toan-than", label: "🌿 Toàn thân" },
  { id: "tim-mach-ho-hap", label: "🫀 Tim mạch – hô hấp" },
  { id: "than-kinh-tam-than", label: "🧠 Thần kinh – tâm thần" },
  { id: "tieu-hoa-gan-mat", label: "🍽️ Tiêu hóa – gan mật" },
  { id: "tiet-nieu", label: "🚻 Tiết niệu" },
  { id: "co-xuong-khop", label: "🦴 Cơ xương khớp" },
  { id: "da-lieu", label: "🩹 Da liễu" },
];

const symptoms: SymptomItem[] = [
  // 🌿 Nhóm chứng toàn thân
  { group: "toan-than", groupLabel: "🌿 Nhóm chứng toàn thân", label: "Sốt", slug: "sot", keywords: "fever" },
  { group: "toan-than", groupLabel: "🌿 Nhóm chứng toàn thân", label: "Mệt mỏi / uể oải", slug: "met-moi-ue-oai", keywords: "fatigue" },
  { group: "toan-than", groupLabel: "🌿 Nhóm chứng toàn thân", label: "Sụt cân hoặc tăng cân không rõ nguyên nhân", slug: "sut-can-tang-can-khong-ro-nguyen-nhan", keywords: "weight" },

  // 🫀 Nhóm tim mạch – hô hấp
  { group: "tim-mach-ho-hap", groupLabel: "🫀 Nhóm tim mạch – hô hấp", label: "Đau ngực", slug: "dau-nguc", keywords: "chest pain" },
  { group: "tim-mach-ho-hap", groupLabel: "🫀 Nhóm tim mạch – hô hấp", label: "Khó thở", slug: "kho-tho", keywords: "dyspnea" },
  { group: "tim-mach-ho-hap", groupLabel: "🫀 Nhóm tim mạch – hô hấp", label: "Hồi hộp / đánh trống ngực", slug: "hoi-hop-danh-trong-nguc", keywords: "palpitations" },
  { group: "tim-mach-ho-hap", groupLabel: "🫀 Nhóm tim mạch – hô hấp", label: "Ho", slug: "ho", keywords: "cough" },
  { group: "tim-mach-ho-hap", groupLabel: "🫀 Nhóm tim mạch – hô hấp", label: "Phù chân", slug: "phu-chan", keywords: "edema" },

  // 🧠 Nhóm thần kinh – tâm thần
  { group: "than-kinh-tam-than", groupLabel: "🧠 Nhóm thần kinh – tâm thần", label: "Đau đầu", slug: "dau-dau", keywords: "headache" },
  { group: "than-kinh-tam-than", groupLabel: "🧠 Nhóm thần kinh – tâm thần", label: "Chóng mặt / choáng váng", slug: "chong-mat-choang-vang", keywords: "dizzy vertigo" },
  { group: "than-kinh-tam-than", groupLabel: "🧠 Nhóm thần kinh – tâm thần", label: "Mất ngủ", slug: "mat-ngu", keywords: "insomnia" },
  { group: "than-kinh-tam-than", groupLabel: "🧠 Nhóm thần kinh – tâm thần", label: "Buồn chán / lo âu", slug: "buon-chan-lo-au", keywords: "depression anxiety" },

  // 🍽️ Nhóm tiêu hóa – gan mật
  { group: "tieu-hoa-gan-mat", groupLabel: "🍽️ Nhóm tiêu hóa – gan mật", label: "Đau bụng", slug: "dau-bung", keywords: "abdominal pain" },
  { group: "tieu-hoa-gan-mat", groupLabel: "🍽️ Nhóm tiêu hóa – gan mật", label: "Rối loạn tiêu hóa (tiêu chảy, táo bón, đầy bụng)", slug: "roi-loan-tieu-hoa", keywords: "diarrhea constipation dyspepsia" },
  { group: "tieu-hoa-gan-mat", groupLabel: "🍽️ Nhóm tiêu hóa – gan mật", label: "Buồn nôn / nôn", slug: "buon-non-non", keywords: "nausea vomiting" },
  { group: "tieu-hoa-gan-mat", groupLabel: "🍽️ Nhóm tiêu hóa – gan mật", label: "Vàng da", slug: "vang-da", keywords: "jaundice" },

  // 🚻 Nhóm tiết niệu
  { group: "tiet-nieu", groupLabel: "🚻 Nhóm tiết niệu", label: "Tiểu buốt / tiểu rắt", slug: "tieu-buot-tieu-rat", keywords: "dysuria" },
  { group: "tiet-nieu", groupLabel: "🚻 Nhóm tiết niệu", label: "Tiểu máu", slug: "tieu-mau", keywords: "hematuria" },

  // 🦴 Nhóm cơ xương khớp
  { group: "co-xuong-khop", groupLabel: "🦴 Nhóm cơ xương khớp", label: "Đau lưng", slug: "dau-lung", keywords: "low back pain" },
  { group: "co-xuong-khop", groupLabel: "🦴 Nhóm cơ xương khớp", label: "Đau khớp", slug: "dau-khop", keywords: "joint pain" },

  // 🩹 Da liễu
  { group: "da-lieu", groupLabel: "🩹 Da liễu", label: "Ngứa / tổn thương da", slug: "ngua-ton-thuong-da", keywords: "rash pruritus" },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SymptomsIndex() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<Group>("all");

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return symptoms.filter((it) => {
      if (group !== "all" && it.group !== group) return false;
      if (!nq) return true;
      const hay = normalize(`${it.label} ${it.keywords ?? ""} ${it.groupLabel}`);
      return hay.includes(nq);
    });
  }, [q, group]);

  const grouped = useMemo(() => {
    const map = new Map<string, SymptomItem[]>();
    for (const it of filtered) {
      map.set(it.groupLabel, [...(map.get(it.groupLabel) ?? []), it]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="page">
      <div className="calcHeader">
        <div>
          <h1 className="calcTitle">Tiếp cận theo chứng</h1>
          <div className="calcSub">Tìm nhanh theo triệu chứng • Lọc theo nhóm • Mỗi chứng có trang riêng</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/tools">Công cụ</Link>
          <Link className="btn" to="/">Trang chủ</Link>
        </div>
      </div>

      {/* Search + group filter */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="formGrid" style={{ marginTop: 0 }}>
          <div className="field field--wide">
            <label className="label">Tìm kiếm</label>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="VD: đau ngực, khó thở, vàng da..."
            />
            <div className="help">Gõ tiếng Việt có dấu/không dấu đều được.</div>
          </div>

          <div className="field field--wide">
            <label className="label">Theo nhóm</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {groups.map((g) => {
                const active = group === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={active ? "btnPrimary" : "btn"}
                    onClick={() => setGroup(g.id)}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
            <div className="help">Chọn “Tất cả” để xem toàn bộ.</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ marginTop: 14 }}>
        {grouped.length === 0 ? (
          <div className="help">Không tìm thấy chứng phù hợp.</div>
        ) : (
          grouped.map(([groupLabel, items]) => (
            <div key={groupLabel} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>{groupLabel}</div>
              <div className="tileGrid">
                {items.map((it) => (
                  <Link key={it.slug} className="tile" to={`/symptoms/${it.slug}`}>
                    <div className="tile__label">{it.label}</div>
                    <div className="tile__sub">Mở tiếp cận theo bước →</div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
