// src/pages/Tools.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { specialties } from "../data/tools";

type Option = { id: string; name: string };

function norm(s: string) {
  return s.trim().toLowerCase();
}

// ✅ 8 công cụ thường dùng nhất (ưu tiên theo id trong tools.ts)
const QUICK_PRIORITY: string[] = [
  "egfr",
  "score2",
  "isi",
  "bmi",
  "centor",
  "curb65",
  "qsofa",
  "child-pugh",
];

export default function Tools() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [specialtyId, setSpecialtyId] = useState<string>("all");

  const specialtyOptions: Option[] = useMemo(() => {
    return [{ id: "all", name: "Tất cả chuyên khoa" }].concat(
      specialties.map((s) => ({ id: s.id, name: s.name }))
    );
  }, []);

  const allTools = useMemo(() => {
    return specialties.flatMap((s) =>
      s.tools.map((t) => ({
        ...t,
        specialtyId: s.id,
        specialtyName: s.name,
      }))
    );
  }, []);

  // ✅ Quick tools: lấy isQuick, ưu tiên theo QUICK_PRIORITY, chốt đúng 8
  const topQuickTools = useMemo(() => {
    const quick = allTools.filter((t) => t.isQuick);

    const index = new Map<string, number>();
    QUICK_PRIORITY.forEach((id, i) => index.set(id, i));

    const sorted = [...quick].sort((a, b) => {
      const ia = index.has(a.id) ? index.get(a.id)! : 999;
      const ib = index.has(b.id) ? index.get(b.id)! : 999;
      if (ia !== ib) return ia - ib;
      return a.name.localeCompare(b.name, "vi");
    });

    return sorted.slice(0, 8);
  }, [allTools]);

  const filteredQuickTools = useMemo(() => {
    const q = norm(query);
    if (!q) return topQuickTools;

    return topQuickTools.filter((t) => {
      const hay = norm(`${t.name} ${t.description}`);
      return hay.includes(q);
    });
  }, [topQuickTools, query]);

  const filteredSpecialties = useMemo(() => {
    const q = norm(query);

    return specialties
      .filter((s) => (specialtyId === "all" ? true : s.id === specialtyId))
      .map((s) => {
        const toolsFiltered = s.tools.filter((t) => {
          if (!q) return true;
          const hay = norm(`${t.name} ${t.description} ${s.name}`);
          return hay.includes(q);
        });
        return { ...s, tools: toolsFiltered };
      })
      .filter((s) => s.tools.length > 0);
  }, [query, specialtyId]);

  return (
    <div className="page">
      <div className="card">
        {/* Header + Back button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>
              Công cụ tính toán hỗ trợ lâm sàng
            </h2>
            <div style={{ color: "var(--muted)" }}>
              Chọn chuyên khoa trước, sau đó tìm công cụ cần dùng
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
              height: 44,
              whiteSpace: "nowrap",
            }}
            title="Trở về trang trước"
          >
            ← Trở về trang trước
          </button>
        </div>

        {/* Quick tools */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Công cụ thường dùng
          </div>

          {filteredQuickTools.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>
              Không có công cụ thường dùng phù hợp.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 10,
              }}
            >
              {filteredQuickTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(t.route)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid var(--line)",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{t.name}</div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter row: Specialty LEFT, Search RIGHT */}
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 12,
            alignItems: "start",
          }}
        >
          {/* Specialty */}
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Chuyên khoa</div>
            <select
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 14,
                border: "2px solid var(--primary)",
                background: "white",
                cursor: "pointer",
                fontWeight: 900,
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                height: 48,
              }}
              title="Chọn chuyên khoa"
            >
              {specialtyOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
              Mẹo: chọn “Tất cả” để duyệt toàn bộ công cụ.
            </div>
          </div>

          {/* Search - make it same height & prominence */}
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Tìm nhanh</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh bằng từ khoá... (vd: score2, qsofa, BMI, centor)"
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 14,
                border: "2px solid var(--primary)",
                outline: "none",
                height: 48,
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            />
            <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
              Tìm nhanh bằng từ khoá trong tên và mô tả công cụ.
            </div>
          </div>
        </div>

        {/* List by specialty */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Danh sách theo chuyên khoa
          </div>

          {filteredSpecialties.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>
              Không tìm thấy công cụ phù hợp.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {filteredSpecialties.map((s) => (
                <div
                  key={s.id}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      fontWeight: 900,
                      background: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    {s.name}
                  </div>

                  <div style={{ padding: 12, display: "grid", gap: 10 }}>
                    {s.tools.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate(t.route)}
                        style={{
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid var(--line)",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{t.name}</div>
                        <div style={{ color: "var(--muted)", marginTop: 6 }}>
                          {t.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
