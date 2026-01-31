import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { specialties, type Specialty, type Tool } from "../data/tools";

type SpecialtyFilter = "all" | string;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function ToolsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<SpecialtyFilter>("all");
  const [query, setQuery] = useState("");

  const allTools = useMemo(() => {
    return specialties.flatMap((s) =>
      s.tools.map((t) => ({
        ...t,
        specialtyId: s.id,
        specialtyName: s.name,
      }))
    );
  }, []);

  const quickTools = useMemo(() => {
    const withFlag = allTools.filter((t: any) => t.isQuick === true);
    if (withFlag.length > 0) return withFlag.slice(0, 8);
    return allTools.slice(0, 6);
  }, [allTools]);

  const filteredSpecialties: Specialty[] = useMemo(() => {
    const q = normalize(query);

    const base =
      filter === "all"
        ? specialties
        : specialties.filter((s) => s.id === filter);

    if (!q) return base;

    return base
      .map((s) => {
        const tools = s.tools.filter((t) => {
          const haystack = normalize(`${t.name} ${t.description} ${s.name}`);
          return haystack.includes(q);
        });
        return { ...s, tools };
      })
      .filter((s) => s.tools.length > 0);
  }, [filter, query]);

  const hasResults = filteredSpecialties.some((s) => s.tools.length > 0);

  const onOpenTool = (tool: Tool) => navigate(tool.route);

  return (
    <div className="page">
      {/* Khối 1: Công cụ thường dùng */}
      <div className="card" style={{ marginBottom: 14 }}>
        <h2 style={{ marginTop: 0 }}>Công cụ thường dùng</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {quickTools.map((t: any) => (
            <button
              key={t.id}
              onClick={() => onOpenTool(t)}
              style={{
                borderRadius: 999,
                padding: "10px 14px",
                border: "1px solid var(--line)",
                background: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
              title={t.description}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Khối 2: Dropdown TRÁI + Search PHẢI */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* TRÁI */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900, color: "var(--muted)" }}>
              Chọn chuyên khoa
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "11px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "white",
                cursor: "pointer",
                minWidth: 220,
                fontWeight: 800,
              }}
              title="Chọn chuyên khoa"
            >
              <option value="all">Tất cả</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                style={{
                  padding: "11px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  background: "rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
                title="Bỏ lọc"
              >
                Bỏ lọc
              </button>
            )}
          </div>

          {/* PHẢI */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm công cụ theo tên / mô tả..."
            style={{
              flex: "1 1 520px",
              minWidth: 320,
              marginLeft: "auto",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Khối 3 */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Danh sách công cụ</h2>

        {!hasResults ? (
          <div style={{ marginTop: 10, color: "var(--muted)" }}>
            Không tìm thấy công cụ phù hợp. Hãy thử từ khoá khác hoặc chọn “Tất cả”.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredSpecialties.map((s) => (
              <div key={s.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    alignItems: "baseline",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{s.name}</h3>
                  <span style={{ color: "var(--muted)" }}>{s.tools.length} công cụ</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 12,
                  }}
                >
                  {s.tools.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        borderRadius: 14,
                        border: "1px solid var(--line)",
                        padding: 14,
                        background: "white",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{t.name}</div>
                      <div style={{ marginTop: 6, color: "var(--muted)" }}>
                        {t.description}
                      </div>

                      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => onOpenTool(t)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid var(--line)",
                            background: "rgba(0,0,0,0.04)",
                            cursor: "pointer",
                            fontWeight: 900,
                          }}
                        >
                          Mở →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
          Lưu ý: Công cụ hỗ trợ tham khảo, không thay thế quyết định lâm sàng.
        </div>
      </div>
    </div>
  );
}
