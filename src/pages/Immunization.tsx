// src/pages/Immunization.tsx
import { useMemo, useState } from "react";
import { vaccines } from "../data/immunization";
import type {
  ContraTag,
  IndicationTag,
  TargetGroup,
  VaccineCategory,
  VaccineEntry,
} from "../data/immunization";

/* =========================
   Helpers
   ========================= */

function uniq<T extends string>(arr: T[]) {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, "vi"));
}

function toSearchText(v: VaccineEntry) {
  return [
    v.name,
    v.shortName ?? "",
    v.category,
    v.vaccineType,
    ...(v.keywords ?? []),
    ...(v.targetGroups ?? []),
    ...(v.indications ?? []),
    ...(v.indicationNotes ?? []),
    ...(v.cautionNotes ?? []),
  ]
    .join(" • ")
    .toLowerCase();
}

function matchQuery(v: VaccineEntry, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return toSearchText(v).includes(s);
}

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

/* =========================
   Small UI primitives
   ========================= */

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="im-badge">{children}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="im-section-title">{children}</div>;
}

function Chip({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={cx("im-chip", active && "im-chip--active")}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function SmallBtn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cx("im-btn", primary && "im-btn--primary")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* =========================
   Page
   ========================= */

type AnyCategory = VaccineCategory | "all";
type AnyTarget = TargetGroup | "all";
type AnyIndication = IndicationTag | "any";
type AnyContra = ContraTag | "any";

export default function Immunization() {
  // Filters
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<AnyCategory>("all");
  const [target, setTarget] = useState<AnyTarget>("all");
  const [needIndication, setNeedIndication] = useState<AnyIndication>("any");
  const [hasContra, setHasContra] = useState<AnyContra>("any");

  // Quick toggles (optional)
  const [onlyLive, setOnlyLive] = useState(false); // chỉ vắc xin sống
  const [onlyInactivated, setOnlyInactivated] = useState(false); // chỉ vắc xin bất hoạt

  // Open detail
  const [openId, setOpenId] = useState<string | null>(null);

  // Options from data
  const categoryOptions = useMemo(
    () =>
      ["all", ...uniq(vaccines.map((v) => v.category))] as ReadonlyArray<
        AnyCategory
      >,
    []
  );

  const targetOptions = useMemo(() => {
    const all = vaccines.flatMap((v) => v.targetGroups);
    return ["all", ...uniq(all)] as ReadonlyArray<AnyTarget>;
  }, []);

  const indicationOptions = useMemo(() => {
    const all = vaccines.flatMap((v) => v.indications);
    return ["any", ...uniq(all)] as ReadonlyArray<AnyIndication>;
  }, []);

  const contraOptions = useMemo(() => {
    const all = vaccines.flatMap((v) => v.contraindications);
    return ["any", ...uniq(all)] as ReadonlyArray<AnyContra>;
  }, []);

  const filtered = useMemo(() => {
    let list = vaccines.slice();

    // search
    list = list.filter((v) => matchQuery(v, q));

    // category
    if (category !== "all") list = list.filter((v) => v.category === category);

    // target
    if (target !== "all") list = list.filter((v) => v.targetGroups.includes(target));

    // indication
    if (needIndication !== "any")
      list = list.filter((v) => v.indications.includes(needIndication));

    // contraindication
    if (hasContra !== "any")
      list = list.filter((v) => v.contraindications.includes(hasContra));

    // vaccineType toggles
    if (onlyLive && !onlyInactivated) {
      list = list.filter((v) => v.vaccineType.toLowerCase().includes("sống"));
    }
    if (onlyInactivated && !onlyLive) {
      list = list.filter((v) => v.vaccineType.toLowerCase().includes("bất hoạt"));
    }

    return list;
  }, [q, category, target, needIndication, hasContra, onlyLive, onlyInactivated]);

  const reset = () => {
    setQ("");
    setCategory("all");
    setTarget("all");
    setNeedIndication("any");
    setHasContra("any");
    setOnlyLive(false);
    setOnlyInactivated(false);
    setOpenId(null);
  };

  const toggleOpen = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="im-page">
      {/* Header */}
      <div className="im-head">
        <div className="im-head-left">
          <h1 className="im-title">Hướng dẫn tiêm chủng</h1>
          <p className="im-sub">
            Tra cứu nhanh theo <b>vắc xin</b> / <b>đối tượng</b> / <b>chỉ định</b> /
            <b> chống chỉ định</b>.
            <span className="im-note">
              {" "}
              *Không thay thế hướng dẫn chính thức và quyết định lâm sàng.
            </span>
          </p>
        </div>

        <div className="im-head-right">
          <SmallBtn onClick={reset}>Đặt lại</SmallBtn>
        </div>
      </div>

      {/* Filters */}
      <div className="im-card im-filters">
        <div className="im-row">
          <div className="im-field im-field--grow">
            <label className="im-label">Tìm kiếm</label>
            <input
              className="im-input"
              placeholder="VD: cúm, MMR, viêm gan B, influenza..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="im-field">
            <label className="im-label">Phân loại</label>
            <select
              className="im-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as AnyCategory)}
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Tất cả" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="im-field">
            <label className="im-label">Đối tượng</label>
            <select
              className="im-select"
              value={target}
              onChange={(e) => setTarget(e.target.value as AnyTarget)}
            >
              {targetOptions.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "Tất cả" : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="im-row">
          <div className="im-field">
            <label className="im-label">Chỉ định (lọc theo)</label>
            <select
              className="im-select"
              value={needIndication}
              onChange={(e) => setNeedIndication(e.target.value as AnyIndication)}
            >
              {indicationOptions.map((i) => (
                <option key={i} value={i}>
                  {i === "any" ? "Bất kỳ" : i}
                </option>
              ))}
            </select>
          </div>

          <div className="im-field">
            <label className="im-label">Chống chỉ định / hoãn (lọc theo)</label>
            <select
              className="im-select"
              value={hasContra}
              onChange={(e) => setHasContra(e.target.value as AnyContra)}
            >
              {contraOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "any" ? "Bất kỳ" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="im-field im-field--right">
            <label className="im-label">Bộ lọc nhanh</label>
            <div className="im-quick">
              <Chip
                active={onlyLive}
                onClick={() => {
                  setOnlyLive((v) => !v);
                  if (!onlyLive) setOnlyInactivated(false);
                }}
                title="Chỉ hiện vắc xin sống giảm độc lực"
              >
                Vắc xin sống
              </Chip>
              <Chip
                active={onlyInactivated}
                onClick={() => {
                  setOnlyInactivated((v) => !v);
                  if (!onlyInactivated) setOnlyLive(false);
                }}
                title="Chỉ hiện vắc xin bất hoạt"
              >
                Bất hoạt
              </Chip>
              <span className="im-count">
                Kết quả: <b>{filtered.length}</b> / {vaccines.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="im-results">
        {filtered.length === 0 ? (
          <div className="im-card im-empty">
            Không có kết quả phù hợp. Thử đổi bộ lọc hoặc từ khóa.
          </div>
        ) : (
          filtered.map((v) => {
            const opened = openId === v.id;

            return (
              <div key={v.id} className="im-card im-item">
                <div className="im-item-head">
                  <div className="im-item-left">
                    <div className="im-item-title">
                      {v.name}
                      {v.shortName ? <span className="im-item-sub"> • {v.shortName}</span> : null}
                    </div>

                    <div className="im-item-meta">
                      <Badge>{v.category}</Badge>
                      <Badge>{v.vaccineType}</Badge>
                    </div>
                  </div>

                  <div className="im-item-right">
                    <SmallBtn primary onClick={() => toggleOpen(v.id)}>
                      {opened ? "Thu gọn" : "Xem chi tiết"}
                    </SmallBtn>
                  </div>
                </div>

                {/* chips row */}
                <div className="im-chiprow">
                  <div className="im-chipbox">
                    <SectionTitle>Đối tượng</SectionTitle>
                    <div className="im-chips">
                      {v.targetGroups.slice(0, 7).map((t) => (
                        <Chip
                          key={t}
                          active={target !== "all" && target === t}
                          onClick={() => setTarget(target === t ? "all" : t)}
                        >
                          {t}
                        </Chip>
                      ))}
                      {v.targetGroups.length > 7 ? (
                        <span className="im-more">+{v.targetGroups.length - 7}…</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="im-chipbox">
                    <SectionTitle>Chỉ định</SectionTitle>
                    <div className="im-chips">
                      {v.indications.map((i) => (
                        <Chip
                          key={i}
                          active={needIndication !== "any" && needIndication === i}
                          onClick={() => setNeedIndication(needIndication === i ? "any" : i)}
                        >
                          {i}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>

                {/* details */}
                {opened ? (
                  <div className="im-detail">
                    <div className="im-grid">
                      <div className="im-panel">
                        <SectionTitle>Diễn giải chỉ định</SectionTitle>
                        {v.indicationNotes?.length ? (
                          <ul className="im-list">
                            {v.indicationNotes.map((x, idx) => (
                              <li key={idx}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="im-muted">Chưa có.</div>
                        )}
                      </div>

                      <div className="im-panel">
                        <SectionTitle>Chống chỉ định / hoãn</SectionTitle>
                        {v.contraindications?.length ? (
                          <ul className="im-list">
                            {v.contraindications.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="im-muted">Chưa có.</div>
                        )}
                      </div>

                      <div className="im-panel">
                        <SectionTitle>Lưu ý / thận trọng</SectionTitle>
                        {v.cautionNotes?.length ? (
                          <ul className="im-list">
                            {v.cautionNotes.map((x, idx) => (
                              <li key={idx}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="im-muted">Chưa có.</div>
                        )}
                      </div>

                      <div className="im-panel">
                        <SectionTitle>Lịch tiêm (khung gợi ý)</SectionTitle>
                        {v.schedule?.length ? (
                          <div className="im-schedule">
                            {v.schedule.map((s, idx) => (
                              <div key={idx} className="im-schedule-item">
                                <div className="im-schedule-left">
                                  <b>{s.label}</b>
                                  <div className="im-muted">{s.when}</div>
                                </div>
                                {s.note ? <div className="im-schedule-note">{s.note}</div> : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="im-muted">Chưa có.</div>
                        )}
                      </div>
                    </div>

                    <div className="im-ref">
                      <SectionTitle>Nguồn tham khảo</SectionTitle>
                      {v.references?.length ? (
                        <ul className="im-list">
                          {v.references.map((r, idx) => (
                            <li key={idx}>
                              {r.title}
                              {r.year ? ` (${r.year})` : ""}
                              {r.note ? ` — ${r.note}` : ""}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="im-muted">
                          Chưa có. Bạn nên điền nguồn (Bộ Y tế/WHO/CDC… theo hướng bạn chọn).
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Styles scoped */}
      <style>{`
        .im-page{ display:block; }

        .im-card{
          background: var(--card);
          border:1px solid var(--line);
          border-radius:16px;
          padding:14px;
          box-shadow: 0 1px 2px rgba(15,23,42,0.04);
        }

        .im-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          margin: 6px 0 14px;
        }
        .im-title{ margin:0; font-size:28px; letter-spacing:-0.2px; }
        .im-sub{ margin:6px 0 0; color: var(--muted); line-height:1.45; }
        .im-note{ color: var(--muted); }

        .im-btn{
          border:1px solid var(--line);
          background:#fff;
          padding:10px 12px;
          border-radius:12px;
          cursor:pointer;
          font-weight:800;
          font-size:13px;
        }
        .im-btn:hover{ filter: brightness(0.98); }
        .im-btn--primary{
          border-color: rgba(29,78,216,0.35);
          color: var(--primary);
          background: rgba(29,78,216,0.04);
        }

        .im-filters{ margin-bottom: 12px; }
        .im-row{
          display:flex;
          gap:12px;
          align-items:end;
          flex-wrap:wrap;
        }
        .im-field{
          display:flex;
          flex-direction:column;
          gap:6px;
          min-width: 220px;
          flex: 1;
        }
        .im-field--grow{ flex: 2; min-width: 280px; }
        .im-field--right{ flex: 2; min-width: 260px; margin-left:auto; }

        .im-label{ font-size:12px; color: var(--muted); font-weight:800; }
        .im-input, .im-select{
          border:1px solid var(--line);
          border-radius:12px;
          padding:10px 12px;
          font-size:14px;
          outline:none;
          background:#fff;
        }
        .im-input:focus, .im-select:focus{
          border-color: rgba(29,78,216,0.5);
          box-shadow: 0 0 0 3px rgba(29,78,216,0.12);
        }

        .im-quick{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
        }
        .im-count{
          color: var(--muted);
          margin-left:6px;
          font-size:13px;
        }

        .im-results{ display:flex; flex-direction:column; gap:12px; }
        .im-empty{ color: var(--muted); }

        .im-item{ padding:14px; }
        .im-item-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
        }
        .im-item-title{
          font-size:16px;
          font-weight:900;
          color: var(--text);
        }
        .im-item-sub{
          font-weight:800;
          color: var(--muted);
          font-size:14px;
        }
        .im-item-meta{
          display:flex;
          gap:8px;
          margin-top:8px;
          flex-wrap:wrap;
        }

        .im-badge{
          display:inline-flex;
          align-items:center;
          gap:6px;
          border:1px solid var(--line);
          border-radius:999px;
          padding:6px 10px;
          font-size:12px;
          color: var(--muted);
          background: #fff;
          font-weight:800;
        }

        .im-chiprow{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:12px;
          margin-top: 12px;
        }
        @media (max-width: 900px){
          .im-chiprow{ grid-template-columns: 1fr; }
        }

        .im-section-title{
          font-weight:900;
          font-size:12px;
          color: var(--muted);
          margin-bottom:6px;
        }
        .im-chips{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
        }
        .im-chip{
          border:1px solid var(--line);
          background:#fff;
          padding:6px 10px;
          border-radius:999px;
          cursor:pointer;
          font-size:12px;
          color: var(--text);
          font-weight:900;
        }
        .im-chip:hover{ filter: brightness(0.985); }
        .im-chip--active{
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(29,78,216,0.04);
        }
        .im-more{ color: var(--muted); font-size:12px; font-weight:800; }

        .im-detail{
          margin-top: 12px;
          border-top:1px dashed var(--line);
          padding-top: 12px;
        }

        .im-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:14px;
        }
        @media (max-width: 900px){
          .im-grid{ grid-template-columns: 1fr; }
        }

        .im-panel{
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 12px;
          background: #fff;
        }

        .im-list{
          margin:0;
          padding-left: 18px;
          color: var(--text);
          line-height: 1.5;
        }
        .im-list li{ margin: 6px 0; }
        .im-muted{ color: var(--muted); font-weight:700; }

        .im-schedule{
          display:flex;
          flex-direction:column;
          gap:10px;
        }
        .im-schedule-item{
          border:1px solid var(--line);
          border-radius:14px;
          padding:10px 12px;
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:flex-start;
          background:#fff;
        }
        .im-schedule-left{
          display:flex;
          flex-direction:column;
          gap:2px;
        }
        .im-schedule-note{
          color: var(--muted);
          font-size:12px;
          margin-top:2px;
          font-weight:800;
        }

        .im-ref{ margin-top: 12px; }
      `}</style>
    </div>
  );
}
