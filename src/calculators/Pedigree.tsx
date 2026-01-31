import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Sex = "M" | "F";
type Role = "proband" | "father" | "mother" | "sibling" | "child";

type ConditionFlag = {
  affected?: boolean;
  carrier?: boolean;
};

type Person = {
  id: string;
  role: Role;
  label: string; // "Bệnh nhân", "Cha", "Mẹ", "Anh/Chị/Em 1", "Con 1"
  name?: string;
  sex: Sex;
  age?: number;
  alive: boolean;
  ageAtDeath?: number;
  conditionsText?: string;
  flags?: ConditionFlag;
};

type PedigreeData = {
  proband: Person;
  father: Person;
  mother: Person;
  siblings: Person[];
  children: Person[];
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function displayName(p: Person) {
  const nm = p.name?.trim();
  return nm ? nm : p.label;
}

function personMeta(p: Person) {
  if (p.alive) {
    const age = typeof p.age === "number" ? `${p.age}t` : "";
    return age ? age : "còn sống";
  }
  const d = typeof p.ageAtDeath === "number" ? `mất ${p.ageAtDeath}t` : "đã mất";
  return d;
}

function shortCond(p: Person) {
  const t = p.conditionsText?.trim();
  return t ? t : "";
}

function TogglePill({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${on ? "rgba(29,78,216,0.55)" : "var(--line)"}`,
        background: on ? "rgba(29,78,216,0.10)" : "white",
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {label}
    </button>
  );
}

/** ===== SVG ===== */
function NodeShape({
  x,
  y,
  sex,
  affected,
  carrier,
  deceased,
  label,
}: {
  x: number;
  y: number;
  sex: Sex;
  affected?: boolean;
  carrier?: boolean;
  deceased?: boolean;
  label: string;
}) {
  const size = 30;
  const stroke = "#111827";
  const fill = affected ? "#111827" : "#ffffff";

  const common = { stroke, strokeWidth: 2, fill } as const;

  return (
    <g>
      {sex === "M" ? (
        <rect x={x - size / 2} y={y - size / 2} width={size} height={size} rx={4} {...common} />
      ) : (
        <circle cx={x} cy={y} r={size / 2} {...common} />
      )}

      {carrier && !affected && <circle cx={x} cy={y} r={5} fill="#111827" />}

      {deceased && <line x1={x - 18} y1={y - 18} x2={x + 18} y2={y + 18} stroke="#111827" strokeWidth={2} />}

      <text x={x} y={y + 28} textAnchor="middle" fontSize={11} fill="#0f172a" style={{ fontWeight: 800 }}>
        {label}
      </text>
    </g>
  );
}

function Line({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth={2} />;
}

function PedigreePreview({ data }: { data: PedigreeData }) {
  const W = 980;
  const y1 = 80;
  const y2 = 220;
  const y3 = 360;

  const fatherX = W / 2 - 120;
  const motherX = W / 2 + 120;

  const row2 = [data.proband, ...data.siblings];
  const row3 = data.children;

  const row2Spacing = 110;
  const row3Spacing = 110;

  const row2Width = Math.max(1, row2.length - 1) * row2Spacing;
  const row2StartX = W / 2 - row2Width / 2;

  const row3Width = Math.max(1, row3.length - 1) * row3Spacing;
  const row3StartX = W / 2 - row3Width / 2;

  const row2Positions = row2.map((p, i) => ({ p, x: row2StartX + i * row2Spacing, y: y2 }));
  const row3Positions = row3.map((p, i) => ({ p, x: row3StartX + i * row3Spacing, y: y3 }));

  const childAnchorX = row2Positions[0]?.x ?? W / 2;

  const sibXMin = Math.min(...row2Positions.map((r) => r.x));
  const sibXMax = Math.max(...row2Positions.map((r) => r.x));

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 14,
        background: "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Cây phả hệ</div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
          ☐ Nam • ○ Nữ • tô đen: affected • chấm: carrier • gạch: đã mất
        </div>
      </div>

      <div style={{ marginTop: 10, overflowX: "auto", borderRadius: 14, border: "1px solid var(--line)" }}>
        <svg width={W} height={420} style={{ display: "block", background: "white" }}>
          {/* parents line */}
          <Line x1={fatherX + 15} y1={y1} x2={motherX - 15} y2={y1} />
          <Line x1={W / 2} y1={y1} x2={W / 2} y2={y1 + 30} />
          <Line x1={sibXMin} y1={y1 + 30} x2={sibXMax} y2={y1 + 30} />

          {row2Positions.map((r) => (
            <Line key={r.p.id} x1={r.x} y1={y1 + 30} x2={r.x} y2={y2 - 15} />
          ))}

          {row3Positions.length > 0 && (
            <>
              <Line x1={childAnchorX} y1={y2 + 15} x2={childAnchorX} y2={y2 + 55} />
              <Line
                x1={Math.min(...row3Positions.map((r) => r.x))}
                y1={y2 + 55}
                x2={Math.max(...row3Positions.map((r) => r.x))}
                y2={y2 + 55}
              />
              {row3Positions.map((r) => (
                <Line key={r.p.id} x1={r.x} y1={y2 + 55} x2={r.x} y2={y3 - 15} />
              ))}
            </>
          )}

          {/* nodes */}
          <NodeShape
            x={fatherX}
            y={y1}
            sex={data.father.sex}
            affected={data.father.flags?.affected}
            carrier={data.father.flags?.carrier}
            deceased={!data.father.alive}
            label="Cha"
          />
          <NodeShape
            x={motherX}
            y={y1}
            sex={data.mother.sex}
            affected={data.mother.flags?.affected}
            carrier={data.mother.flags?.carrier}
            deceased={!data.mother.alive}
            label="Mẹ"
          />

          {row2Positions.map((r) => (
            <NodeShape
              key={r.p.id}
              x={r.x}
              y={r.y}
              sex={r.p.sex}
              affected={r.p.flags?.affected}
              carrier={r.p.flags?.carrier}
              deceased={!r.p.alive}
              label={r.p.label === "Bệnh nhân" ? "Proband" : r.p.label}
            />
          ))}

          {row3Positions.map((r) => (
            <NodeShape
              key={r.p.id}
              x={r.x}
              y={r.y}
              sex={r.p.sex}
              affected={r.p.flags?.affected}
              carrier={r.p.flags?.carrier}
              deceased={!r.p.alive}
              label={r.p.label}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/** ===== Drawer Editor ===== */
function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.35)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 60,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "min(520px, 92vw)",
          height: "100%",
          background: "white",
          borderLeft: "1px solid var(--line)",
          padding: 14,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid var(--line)",
              background: "white",
              borderRadius: 12,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Đóng ✕
          </button>
        </div>

        <div style={{ height: 1, background: "var(--line)", margin: "12px 0" }} />

        {children}
      </div>
    </div>
  );
}

function PersonForm({
  p,
  onChange,
}: {
  p: Person;
  onChange: (next: Person) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="field">
        <label className="label">Tên (tuỳ chọn)</label>
        <input className="input" value={p.name ?? ""} onChange={(e) => onChange({ ...p, name: e.target.value })} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="label">Giới</label>
          <select className="select" value={p.sex} onChange={(e) => onChange({ ...p, sex: e.target.value as Sex })}>
            <option value="M">Nam</option>
            <option value="F">Nữ</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Tình trạng</label>
          <select
            className="select"
            value={p.alive ? "alive" : "dead"}
            onChange={(e) => onChange({ ...p, alive: e.target.value === "alive" })}
          >
            <option value="alive">Còn sống</option>
            <option value="dead">Đã mất</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="label">{p.alive ? "Tuổi" : "Tuổi mất"}</label>
          <input
            className="input"
            type="number"
            value={p.alive ? (p.age ?? "") : (p.ageAtDeath ?? "")}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (p.alive) onChange({ ...p, age: clamp(v, 0, 120) });
              else onChange({ ...p, ageAtDeath: clamp(v, 0, 120) });
            }}
          />
        </div>

        <div className="field">
          <label className="label">Bệnh/ghi chú</label>
          <input
            className="input"
            value={p.conditionsText ?? ""}
            onChange={(e) => onChange({ ...p, conditionsText: e.target.value })}
            placeholder="VD: THA, ĐTĐ, đột quỵ..."
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Đánh dấu di truyền</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <TogglePill
            on={!!p.flags?.affected}
            label="Affected (tô đen)"
            onClick={() => onChange({ ...p, flags: { ...p.flags, affected: !p.flags?.affected } })}
          />
          <TogglePill
            on={!!p.flags?.carrier}
            label="Carrier (chấm)"
            onClick={() => onChange({ ...p, flags: { ...p.flags, carrier: !p.flags?.carrier } })}
          />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          Carrier chỉ hiển thị khi không tô đen (affected).
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 12,
          background: "rgba(0,0,0,0.02)",
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.6,
          fontWeight: 700,
        }}
      >
        Tóm tắt: <span style={{ color: "var(--text)" }}>{displayName(p)}</span> • {personMeta(p)}
        {shortCond(p) ? ` • ${shortCond(p)}` : ""}
      </div>
    </div>
  );
}

/** ===== List UI ===== */
function SectionCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 12, background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        {right}
      </div>
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>{children}</div>
    </div>
  );
}

function PersonRow({
  p,
  onClick,
  onDelete,
}: {
  p: Person;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "center",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "10px 12px",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {displayName(p)}
          <span style={{ color: "var(--muted)", fontWeight: 800 }}> • {p.sex === "M" ? "Nam" : "Nữ"}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
          {personMeta(p)}
          {shortCond(p) ? ` • ${shortCond(p)}` : ""}
          {p.flags?.affected ? " • affected" : ""}
          {!p.flags?.affected && p.flags?.carrier ? " • carrier" : ""}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
        <button
          type="button"
          onClick={onClick}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "white",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Sửa
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
            title="Xoá"
          >
            Xoá
          </button>
        )}
      </div>
    </div>
  );
}

export default function Pedigree() {
  const navigate = useNavigate();

  const storageKey = "medical-tools:pedigree:v2";

  const defaultData: PedigreeData = useMemo(
    () => ({
      proband: { id: uid("proband"), role: "proband", label: "Bệnh nhân", sex: "M", alive: true, age: 45, conditionsText: "" },
      father: { id: uid("father"), role: "father", label: "Cha", sex: "M", alive: true, age: 70, conditionsText: "" },
      mother: { id: uid("mother"), role: "mother", label: "Mẹ", sex: "F", alive: true, age: 68, conditionsText: "" },
      siblings: [],
      children: [],
    }),
    []
  );

  const [data, setData] = useState<PedigreeData>(defaultData);

  // Drawer state
  const [editing, setEditing] = useState<{ role: Role; id: string } | null>(null);

  // Load saved
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PedigreeData;
        if (parsed?.proband?.id && parsed?.father?.id && parsed?.mother?.id) setData(parsed);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto save
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  function addSibling(sex: Sex) {
    setData((prev) => {
      const n = prev.siblings.length + 1;
      return {
        ...prev,
        siblings: [
          ...prev.siblings,
          { id: uid("sib"), role: "sibling", label: `Anh/Chị/Em ${n}`, sex, alive: true, age: 40, conditionsText: "" },
        ],
      };
    });
  }

  function addChild(sex: Sex) {
    setData((prev) => {
      const n = prev.children.length + 1;
      return {
        ...prev,
        children: [
          ...prev.children,
          { id: uid("child"), role: "child", label: `Con ${n}`, sex, alive: true, age: 10, conditionsText: "" },
        ],
      };
    });
  }

  function removeFrom(list: "siblings" | "children", id: string) {
    setData((prev) => ({ ...prev, [list]: prev[list].filter((x) => x.id !== id) }));
    if (editing?.id === id) setEditing(null);
  }

  const editPerson: Person | null = useMemo(() => {
    if (!editing) return null;

    if (editing.role === "proband") return data.proband;
    if (editing.role === "father") return data.father;
    if (editing.role === "mother") return data.mother;
    if (editing.role === "sibling") return data.siblings.find((x) => x.id === editing.id) ?? null;
    if (editing.role === "child") return data.children.find((x) => x.id === editing.id) ?? null;

    return null;
  }, [editing, data]);

  function updateEditing(next: Person) {
    if (!editing) return;

    setData((prev) => {
      if (editing.role === "proband") return { ...prev, proband: next };
      if (editing.role === "father") return { ...prev, father: next };
      if (editing.role === "mother") return { ...prev, mother: next };
      if (editing.role === "sibling")
        return { ...prev, siblings: prev.siblings.map((x) => (x.id === next.id ? next : x)) };
      if (editing.role === "child")
        return { ...prev, children: prev.children.map((x) => (x.id === next.id ? next : x)) };
      return prev;
    });
  }

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">Cây phả hệ (Family Pedigree)</h1>
            <div className="calcSub">
              Giao diện tối giản: danh sách bên trái → bấm “Sửa” để chỉnh. Preview bên phải để xem nhanh.
            </div>
          </div>

          <button className="btn" onClick={() => navigate(-1)} title="Trở về trang trước">
            ← Trở về trang trước
          </button>
        </div>

        <div className="divider" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 420px) 1fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* Left: compact list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionCard title="Bệnh nhân (Proband)">
              <PersonRow p={data.proband} onClick={() => setEditing({ role: "proband", id: data.proband.id })} />
            </SectionCard>

            <SectionCard title="Cha / Mẹ">
              <PersonRow p={data.father} onClick={() => setEditing({ role: "father", id: data.father.id })} />
              <PersonRow p={data.mother} onClick={() => setEditing({ role: "mother", id: data.mother.id })} />
            </SectionCard>

            <SectionCard
              title={`Anh/Chị/Em (${data.siblings.length})`}
              right={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn" type="button" onClick={() => addSibling("M")}>
                    + Nam
                  </button>
                  <button className="btn" type="button" onClick={() => addSibling("F")}>
                    + Nữ
                  </button>
                </div>
              }
            >
              {data.siblings.length === 0 ? (
                <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
                  Chưa có anh/chị/em.
                </div>
              ) : (
                data.siblings.map((s) => (
                  <PersonRow
                    key={s.id}
                    p={s}
                    onClick={() => setEditing({ role: "sibling", id: s.id })}
                    onDelete={() => removeFrom("siblings", s.id)}
                  />
                ))
              )}
            </SectionCard>

            <SectionCard
              title={`Con (${data.children.length})`}
              right={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn" type="button" onClick={() => addChild("M")}>
                    + Nam
                  </button>
                  <button className="btn" type="button" onClick={() => addChild("F")}>
                    + Nữ
                  </button>
                </div>
              }
            >
              {data.children.length === 0 ? (
                <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>Chưa có con.</div>
              ) : (
                data.children.map((c) => (
                  <PersonRow
                    key={c.id}
                    p={c}
                    onClick={() => setEditing({ role: "child", id: c.id })}
                    onDelete={() => removeFrom("children", c.id)}
                  />
                ))
              )}
            </SectionCard>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setData(defaultData);
                  setEditing(null);
                  try {
                    localStorage.removeItem(storageKey);
                  } catch {}
                }}
              >
                Reset
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  try {
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    alert("Đã lưu ca (localStorage) ✅");
                  } catch {
                    alert("Không lưu được ❌");
                  }
                }}
              >
                Lưu ca
              </button>
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, lineHeight: 1.6 }}>
              Mẹo: bấm “Sửa” → chỉnh nhanh tuổi/bệnh/affected/carrier. Preview bên phải sẽ cập nhật ngay.
            </div>
          </div>

          {/* Right: preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PedigreePreview data={data} />

            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: 12,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ fontWeight: 900 }}>Lưu ý</div>
              <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, lineHeight: 1.6 }}>
                Đây là công cụ hỗ trợ ghi nhận gia sử sức khoẻ, không thay thế tư vấn di truyền/chẩn đoán chuyên sâu.
              </div>
            </div>
          </div>
        </div>

        {/* Drawer */}
        <Drawer
          open={!!editing && !!editPerson}
          title={editPerson ? `Chỉnh sửa: ${editPerson.label}` : "Chỉnh sửa"}
          onClose={() => setEditing(null)}
        >
          {editPerson && <PersonForm p={editPerson} onChange={updateEditing} />}
        </Drawer>
      </div>
    </div>
  );
}
