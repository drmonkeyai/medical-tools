// src/pages/Tools.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { specialties, type Specialty, type Tool } from "../data/tools";

const STORAGE_KEY = "hotrobacsi:favTools:v1";
const MAX_FAVORITES = 8;

function safeReadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function safeWriteFavorites(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function uniqKeepOrder(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

function clampFavorites(ids: string[]) {
  return uniqKeepOrder(ids).slice(0, MAX_FAVORITES);
}

function ToolCard(props: {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
}) {
  const { tool, isFavorite, onToggleFavorite } = props;

  return (
    <Link
      to={tool.route}
      style={{
        display: "block",
        borderRadius: 16,
        border: "1px solid var(--line)",
        background: "white",
        padding: 14,
        textDecoration: "none",
        color: "inherit",
        position: "relative",
      }}
    >
      {/* ⭐ */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(tool.id);
        }}
        title={isFavorite ? "Bỏ khỏi thường dùng" : "Thêm vào thường dùng"}
        aria-label={isFavorite ? "Bỏ khỏi thường dùng" : "Thêm vào thường dùng"}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 34,
          height: 34,
          borderRadius: 12,
          border: "1px solid var(--line)",
          background: isFavorite ? "rgba(29,78,216,0.10)" : "white",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: 16,
          fontWeight: 900,
          color: isFavorite ? "var(--primary)" : "var(--muted)",
        }}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <div style={{ fontWeight: 1000, marginBottom: 6, paddingRight: 44 }}>{tool.name}</div>
      <div style={{ color: "var(--muted)", fontWeight: 700, lineHeight: 1.45, paddingRight: 44 }}>
        {tool.description}
      </div>
    </Link>
  );
}

function FavoritesModal(props: {
  open: boolean;
  allTools: Tool[];
  favoriteIds: string[];
  onClose: () => void;
  onChange: (nextIds: string[]) => void;
}) {
  const { open, allTools, favoriteIds, onClose, onChange } = props;
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const toolMap = useMemo(() => {
    const m = new Map<string, Tool>();
    for (const t of allTools) m.set(t.id, t);
    return m;
  }, [allTools]);

  const selectedTools = useMemo(() => {
    return favoriteIds
      .map((id) => toolMap.get(id))
      .filter((x): x is Tool => Boolean(x));
  }, [favoriteIds, toolMap]);

  const filteredTools = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return allTools;
    return allTools.filter((t) => {
      const hay = `${t.name} ${t.description}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [q, allTools]);

  function toggle(id: string) {
    const has = favoriteIds.includes(id);
    if (has) {
      onChange(favoriteIds.filter((x) => x !== id));
      return;
    }
    if (favoriteIds.length >= MAX_FAVORITES) return;
    onChange([...favoriteIds, id]);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = favoriteIds.indexOf(id);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= favoriteIds.length) return;
    const next = [...favoriteIds];
    const tmp = next[idx];
    next[idx] = next[j];
    next[j] = tmp;
    onChange(next);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 100%)",
          maxHeight: "85vh",
          overflow: "hidden",
          borderRadius: 18,
          border: "1px solid var(--line)",
          background: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 1000, fontSize: 16 }}>Chọn Công cụ thường dùng</div>
            <div style={{ color: "var(--muted)", fontWeight: 800, marginTop: 2 }}>
              Tối đa {MAX_FAVORITES} công cụ • Đã chọn {favoriteIds.length}/{MAX_FAVORITES}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              border: "1px solid var(--line)",
              background: "white",
              fontWeight: 900,
            }}
          >
            Đóng
          </button>
        </div>

        {/* body */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 0, flex: 1, minHeight: 0 }}>
          {/* left: all tools */}
          <div style={{ borderRight: "1px solid var(--line)", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--line)" }}>
              <input
                className="input"
                placeholder="Tìm nhanh theo tên/mô tả…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div style={{ marginTop: 8, color: "var(--muted)", fontWeight: 800 }}>
                Tick để thêm/bỏ. Khi đủ {MAX_FAVORITES}, bạn cần bỏ bớt để thêm mới.
              </div>
            </div>

            <div style={{ padding: 14, overflow: "auto" }}>
              <div style={{ display: "grid", gap: 10 }}>
                {filteredTools.map((t) => {
                  const checked = favoriteIds.includes(t.id);
                  const disabled = !checked && favoriteIds.length >= MAX_FAVORITES;
                  return (
                    <label
                      key={t.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: 12,
                        opacity: disabled ? 0.55 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                        background: checked ? "rgba(29,78,216,0.06)" : "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(t.id)}
                        style={{ marginTop: 3 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 1000 }}>{t.name}</div>
                        <div style={{ color: "var(--muted)", fontWeight: 700, marginTop: 2 }}>{t.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* right: selected */}
          <div style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--line)", fontWeight: 1000 }}>
              Danh sách đã chọn (hiển thị theo thứ tự)
            </div>

            <div style={{ padding: 14, overflow: "auto" }}>
              {selectedTools.length === 0 ? (
                <div style={{ color: "var(--muted)", fontWeight: 800 }}>
                  Chưa chọn công cụ nào. Bạn có thể tick ở cột trái hoặc bấm ⭐ ngay trên thẻ công cụ.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedTools.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: 12,
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 1000, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.name}
                        </div>
                        <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: 12 }}>
                          {t.route}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => move(t.id, -1)}
                          title="Lên"
                          style={{ background: "white", border: "1px solid var(--line)", fontWeight: 900 }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => move(t.id, 1)}
                          title="Xuống"
                          style={{ background: "white", border: "1px solid var(--line)", fontWeight: 900 }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => onChange(favoriteIds.filter((x) => x !== t.id))}
                          title="Bỏ"
                          style={{ background: "white", border: "1px solid var(--line)", fontWeight: 900 }}
                        >
                          Bỏ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, color: "var(--muted)", fontWeight: 800 }}>
                Tip: bạn có thể sắp xếp bằng ↑ ↓ để “Công cụ thường dùng” hiển thị đúng thứ tự bạn muốn.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tools() {
  // ====== data ======
  const allTools = useMemo(() => specialties.flatMap((s) => s.tools), []);
  const toolMap = useMemo(() => {
    const m = new Map<string, Tool>();
    for (const t of allTools) m.set(t.id, t);
    return m;
  }, [allTools]);

  // ====== favorites (localStorage) ======
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = safeReadFavorites();
    const valid = stored.filter((id) => allTools.some((t) => t.id === id));
    if (valid.length > 0) return clampFavorites(valid);

    // fallback: dùng isQuick nếu có, hoặc lấy 8 tool đầu tiên
    const quick = allTools.filter((t) => t.isQuick).map((t) => t.id);
    if (quick.length > 0) return clampFavorites(quick);

    return clampFavorites(allTools.map((t) => t.id));
  });

  useEffect(() => {
    // lọc id không tồn tại (nếu sau này bạn đổi tool.id)
    const cleaned = favoriteIds.filter((id) => toolMap.has(id));
    if (cleaned.length !== favoriteIds.length) setFavoriteIds(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolMap]);

  useEffect(() => {
    safeWriteFavorites(favoriteIds);
  }, [favoriteIds]);

  const favoriteTools = useMemo(() => {
    return favoriteIds.map((id) => toolMap.get(id)).filter((x): x is Tool => Boolean(x));
  }, [favoriteIds, toolMap]);

  const [warn, setWarn] = useState<string>("");
  useEffect(() => {
    if (!warn) return;
    const t = setTimeout(() => setWarn(""), 2200);
    return () => clearTimeout(t);
  }, [warn]);

  function toggleFavorite(toolId: string) {
    setFavoriteIds((prev) => {
      const has = prev.includes(toolId);
      if (has) return prev.filter((x) => x !== toolId);

      if (prev.length >= MAX_FAVORITES) {
        setWarn(`Bạn chỉ có thể chọn tối đa ${MAX_FAVORITES} công cụ thường dùng.`);
        return prev;
      }
      return [...prev, toolId];
    });
  }

  // ====== filters ======
  const [specialtyId, setSpecialtyId] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const filteredSpecialties = useMemo(() => {
    const q = query.trim().toLowerCase();
    const picked = specialtyId === "all" ? specialties : specialties.filter((s) => s.id === specialtyId);

    if (!q) return picked;

    const match = (t: Tool) => {
      const hay = `${t.name} ${t.description}`.toLowerCase();
      return hay.includes(q);
    };

    return picked
      .map((s) => ({ ...s, tools: s.tools.filter(match) }))
      .filter((s) => s.tools.length > 0);
  }, [specialtyId, query]);

  const [manageOpen, setManageOpen] = useState(false);

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">Công cụ tính toán hỗ trợ lâm sàng</h1>
            <div className="calcSub"></div>
          </div>
        </div>

        {/* banner warning */}
        {warn && (
          <div
            style={{
              marginTop: 10,
              borderRadius: 14,
              padding: 10,
              border: "1px solid var(--line)",
              background: "rgba(240,144,16,0.10)",
              color: "#111827",
              fontWeight: 900,
            }}
          >
            {warn}
          </div>
        )}

        {/* Favorites */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 1000 }}>Công cụ thường dùng</div>
            <div style={{ color: "var(--muted)", fontWeight: 800, marginTop: 4 }}>
              Bấm ⭐ trên thẻ công cụ để thêm/bỏ • Tối đa {MAX_FAVORITES} công cụ • {favoriteIds.length}/{MAX_FAVORITES}
            </div>
          </div>

          <button className="btn" onClick={() => setManageOpen(true)} style={{ fontWeight: 1000 }}>
            Chọn / Sắp xếp
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {favoriteTools.length === 0 ? (
            <div style={{ color: "var(--muted)", fontWeight: 800 }}>
              Chưa có công cụ thường dùng. Bạn hãy bấm ⭐ ở bất kỳ công cụ nào để thêm vào danh sách.
            </div>
          ) : (
            favoriteTools.map((t) => (
              <ToolCard key={t.id} tool={t} isFavorite={true} onToggleFavorite={toggleFavorite} />
            ))
          )}
        </div>

        <div className="divider" />

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div className="field field--wide">
            <label className="label">Chuyên khoa</label>
            <select className="select" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
              <option value="all">Tất cả chuyên khoa</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="help">Mẹo: chọn “Tất cả” để duyệt toàn bộ công cụ.</div>
          </div>

          <div className="field field--wide">
            <label className="label">Tìm nhanh</label>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh bằng từ khoá… (vd: score2, qsofa, BMI, centor)"
            />
            <div className="help">Tìm nhanh bằng từ khoá trong tên và mô tả công cụ.</div>
          </div>
        </div>

        <div style={{ height: 10 }} />

        {/* List by specialty */}
        <div style={{ display: "grid", gap: 14 }}>
          {filteredSpecialties.map((s: Specialty) => (
            <div key={s.id} style={{ borderRadius: 16, border: "1px solid var(--line)", background: "white", padding: 12 }}>
              <div style={{ fontWeight: 1000, marginBottom: 10 }}>{s.name}</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}
              >
                {s.tools.map((t) => (
                  <ToolCard key={t.id} tool={t} isFavorite={favoriteIds.includes(t.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </div>
          ))}

          {filteredSpecialties.length === 0 && (
            <div style={{ color: "var(--muted)", fontWeight: 800 }}>
              Không tìm thấy công cụ phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </div>

      <FavoritesModal
        open={manageOpen}
        allTools={allTools}
        favoriteIds={favoriteIds}
        onClose={() => setManageOpen(false)}
        onChange={(next) => setFavoriteIds(clampFavorites(next))}
      />
    </div>
  );
}
