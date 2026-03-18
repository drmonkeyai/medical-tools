// src/pages/Immunization.tsx
import { useEffect, useMemo, useState } from "react";
import { vaccines } from "../data/immunization";
import type {
  ContraTag,
  TargetGroup,
  VaccineAccess,
  VaccineEntry,
  VaccineKind,
  VaccineProtocolSection,
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
    v.kind,
    v.access,
    ...(v.keywords ?? []),
    ...(v.targetGroups ?? []),
    ...(v.indications ?? []),
    ...(v.indicationNotes ?? []),
    ...(v.cautionNotes ?? []),
    ...(v.scheduleSummary ?? []),
    ...(v.protocols?.flatMap((p: VaccineProtocolSection) => [p.title, ...(p.items ?? [])]) ??
      []),
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

function getProtocolLabel(kind: VaccineProtocolSection["kind"]) {
  switch (kind) {
    case "routine":
      return "Cơ bản";
    case "catchup":
      return "Bắt kịp";
    case "booster":
      return "Nhắc lại";
    case "special":
      return "Đặc biệt";
    default:
      return "Khác";
  }
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

function ProtocolBlock({ protocol }: { protocol: VaccineProtocolSection }) {
  return (
    <div className="im-protocol">
      <div className="im-protocol-head">
        <div className="im-protocol-kind">{getProtocolLabel(protocol.kind)}</div>
        <div className="im-protocol-title">{protocol.title}</div>
      </div>

      {protocol.summary ? <div className="im-protocol-summary">{protocol.summary}</div> : null}

      {protocol.items?.length ? (
        <ul className="im-list">
          {protocol.items.map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="im-muted">Chưa có chi tiết.</div>
      )}

      {protocol.note ? <div className="im-protocol-note">Lưu ý: {protocol.note}</div> : null}
    </div>
  );
}

function VaccineDetailModal({
  vaccine,
  onClose,
}: {
  vaccine: VaccineEntry | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!vaccine) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
    };
  }, [vaccine, onClose]);

  if (!vaccine) return null;

  return (
    <div className="im-modal-backdrop" onClick={onClose}>
      <div
        className="im-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết vaccine ${vaccine.name}`}
      >
        <div className="im-modal-head">
          <div>
            <div className="im-modal-title">
              {vaccine.name}
              {vaccine.shortName ? <span className="im-item-sub"> • {vaccine.shortName}</span> : null}
            </div>

            <div className="im-item-meta">
              <Badge>{vaccine.access}</Badge>
              <Badge>{vaccine.kind}</Badge>
              <Badge>{vaccine.category}</Badge>
            </div>
          </div>

          <button type="button" className="im-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="im-modal-body">
          <div className="im-chiprow">
            <div className="im-chipbox">
              <SectionTitle>Đối tượng</SectionTitle>
              <div className="im-chips">
                {vaccine.targetGroups.map((group: TargetGroup) => (
                  <Badge key={group}>{group}</Badge>
                ))}
              </div>
            </div>

            <div className="im-chipbox">
              <SectionTitle>Loại vắc xin</SectionTitle>
              <div className="im-chips">
                <Badge>{vaccine.vaccineType}</Badge>
              </div>
            </div>
          </div>

          {vaccine.scheduleSummary?.length ? (
            <div className="im-summary">
              <SectionTitle>Lịch cơ bản</SectionTitle>
              <div className="im-summary-list">
                {vaccine.scheduleSummary.map((summary: string, idx: number) => (
                  <Badge key={idx}>{summary}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="im-grid" style={{ marginTop: 12 }}>
            <div className="im-panel">
              <SectionTitle>Diễn giải chỉ định</SectionTitle>
              {vaccine.indicationNotes?.length ? (
                <ul className="im-list">
                  {vaccine.indicationNotes.map((note: string, idx: number) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              ) : (
                <div className="im-muted">Chưa có.</div>
              )}
            </div>

            <div className="im-panel">
              <SectionTitle>Chống chỉ định / hoãn</SectionTitle>
              {vaccine.contraindications?.length ? (
                <ul className="im-list">
                  {vaccine.contraindications.map((contra: ContraTag) => (
                    <li key={contra}>{contra}</li>
                  ))}
                </ul>
              ) : (
                <div className="im-muted">Chưa có.</div>
              )}
            </div>

            <div className="im-panel">
              <SectionTitle>Lưu ý / thận trọng</SectionTitle>
              {vaccine.cautionNotes?.length ? (
                <ul className="im-list">
                  {vaccine.cautionNotes.map((note: string, idx: number) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              ) : (
                <div className="im-muted">Chưa có.</div>
              )}
            </div>

            <div className="im-panel">
              <SectionTitle>Lịch tiêm dạng mốc</SectionTitle>
              {vaccine.schedule?.length ? (
                <div className="im-schedule">
                  {vaccine.schedule.map(
                    (
                      scheduleItem: { label: string; when: string; note?: string },
                      idx: number
                    ) => (
                      <div key={idx} className="im-schedule-item">
                        <div className="im-schedule-left">
                          <b>{scheduleItem.label}</b>
                          <div className="im-muted">{scheduleItem.when}</div>
                        </div>
                        {scheduleItem.note ? (
                          <div className="im-schedule-note">{scheduleItem.note}</div>
                        ) : null}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="im-muted">Chưa có.</div>
              )}
            </div>
          </div>

          <div className="im-protocols-wrap">
            <SectionTitle>Phác đồ và lịch tiêm</SectionTitle>
            {vaccine.protocols?.length ? (
              <div className="im-protocol-grid">
                {vaccine.protocols.map((protocol: VaccineProtocolSection, idx: number) => (
                  <ProtocolBlock key={`${vaccine.id}-${idx}`} protocol={protocol} />
                ))}
              </div>
            ) : (
              <div className="im-muted">Chưa có phác đồ chi tiết.</div>
            )}
          </div>

          <div className="im-ref">
            <SectionTitle>Nguồn tham khảo</SectionTitle>
            {vaccine.references?.length ? (
              <ul className="im-list">
                {vaccine.references.map(
                  (
                    ref: { title: string; year?: number; note?: string },
                    idx: number
                  ) => (
                    <li key={idx}>
                      {ref.title}
                      {ref.year ? ` (${ref.year})` : ""}
                      {ref.note ? ` — ${ref.note}` : ""}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="im-muted">Chưa có.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Page
   ========================= */

type AnyTarget = TargetGroup | "all";
type AnyContra = ContraTag | "any";
type AnyAccess = "all" | VaccineAccess;
type AnyKind = "all" | VaccineKind;

export default function Immunization() {
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<AnyTarget>("all");
  const [hasContra, setHasContra] = useState<AnyContra>("any");
  const [access, setAccess] = useState<AnyAccess>("all");
  const [kind, setKind] = useState<AnyKind>("all");
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineEntry | null>(null);

  const targetOptions = useMemo(() => {
    const allTargets = vaccines.flatMap((v: VaccineEntry) => v.targetGroups);
    return ["all", ...uniq(allTargets)] as ReadonlyArray<AnyTarget>;
  }, []);

  const contraOptions = useMemo(() => {
    const allContras = vaccines.flatMap((v: VaccineEntry) => v.contraindications);
    return ["any", ...uniq(allContras)] as ReadonlyArray<AnyContra>;
  }, []);

  const accessOptions: ReadonlyArray<AnyAccess> = [
    "all",
    "Tiêm chủng mở rộng",
    "Dịch vụ",
  ];

  const kindOptions: ReadonlyArray<AnyKind> = [
    "all",
    "Sống giảm độc lực",
    "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    "Khác",
  ];

  const filtered = useMemo(() => {
    let list = vaccines.slice();

    list = list.filter((v: VaccineEntry) => matchQuery(v, q));

    if (target !== "all") {
      list = list.filter((v: VaccineEntry) => v.targetGroups.includes(target));
    }

    if (hasContra !== "any") {
      list = list.filter((v: VaccineEntry) => v.contraindications.includes(hasContra));
    }

    if (access !== "all") {
      list = list.filter((v: VaccineEntry) => v.access === access);
    }

    if (kind !== "all") {
      list = list.filter((v: VaccineEntry) => v.kind === kind);
    }

    return list;
  }, [q, target, hasContra, access, kind]);

  const totalExpanded = useMemo(
    () => vaccines.filter((v: VaccineEntry) => v.access === "Tiêm chủng mở rộng").length,
    []
  );

  const totalService = useMemo(
    () => vaccines.filter((v: VaccineEntry) => v.access === "Dịch vụ").length,
    []
  );

  const reset = () => {
    setQ("");
    setTarget("all");
    setHasContra("any");
    setAccess("all");
    setKind("all");
    setSelectedVaccine(null);
  };

  return (
    <div className="im-page">
      <div className="im-head">
        <div className="im-head-left">
          <h1 className="im-title">Hướng dẫn tiêm chủng (tính năng đang phát triển)</h1>
          <p className="im-sub">
            Tra cứu nhanh theo <b>vắc xin</b> / <b>đối tượng</b> / <b>chống chỉ định</b> /{" "}
            <b>loại vắc xin</b> / <b>tiêm chủng mở rộng - dịch vụ</b>.
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

      <div className="im-card im-filters">
        <div className="im-filter-grid">
          <div className="im-field im-field--search">
            <label className="im-label">Tìm kiếm</label>
            <input
              className="im-input"
              placeholder="VD: cúm, MMR, viêm gan B, phế cầu, rota..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="im-field">
            <label className="im-label">Đối tượng</label>
            <select
              className="im-select"
              value={target}
              onChange={(e) => setTarget(e.target.value as AnyTarget)}
            >
              {targetOptions.map((item: AnyTarget) => (
                <option key={item} value={item}>
                  {item === "all" ? "Tất cả" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="im-field">
            <label className="im-label">Chống chỉ định / hoãn</label>
            <select
              className="im-select"
              value={hasContra}
              onChange={(e) => setHasContra(e.target.value as AnyContra)}
            >
              {contraOptions.map((item: AnyContra) => (
                <option key={item} value={item}>
                  {item === "any" ? "Bất kỳ" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="im-field">
            <label className="im-label">Loại vắc xin</label>
            <select
              className="im-select"
              value={kind}
              onChange={(e) => setKind(e.target.value as AnyKind)}
            >
              {kindOptions.map((item: AnyKind) => (
                <option key={item} value={item}>
                  {item === "all" ? "Tất cả" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="im-field">
            <label className="im-label">Hình thức</label>
            <select
              className="im-select"
              value={access}
              onChange={(e) => setAccess(e.target.value as AnyAccess)}
            >
              {accessOptions.map((item: AnyAccess) => (
                <option key={item} value={item}>
                  {item === "all" ? "Tất cả" : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="im-filter-foot">
          <div className="im-foot-left">
            <Badge>TCMR: {totalExpanded}</Badge>
            <Badge>Dịch vụ: {totalService}</Badge>
            <Badge>Tổng: {vaccines.length}</Badge>
          </div>

          <span className="im-count">
            Kết quả: <b>{filtered.length}</b> / {vaccines.length}
          </span>
        </div>
      </div>

      <div className="im-results">
        {filtered.length === 0 ? (
          <div className="im-card im-empty">
            Không có kết quả phù hợp. Thử đổi bộ lọc hoặc từ khóa.
          </div>
        ) : (
          filtered.map((v: VaccineEntry) => (
            <div key={v.id} className="im-card im-item">
              <div className="im-item-head">
                <div className="im-item-left">
                  <div className="im-item-title">
                    {v.name}
                    {v.shortName ? <span className="im-item-sub"> • {v.shortName}</span> : null}
                  </div>

                  <div className="im-item-meta">
                    <Badge>{v.access}</Badge>
                    <Badge>{v.kind}</Badge>
                    <Badge>{v.category}</Badge>
                  </div>
                </div>

                <div className="im-item-right">
                  <SmallBtn primary onClick={() => setSelectedVaccine(v)}>
                    Xem chi tiết
                  </SmallBtn>
                </div>
              </div>

              <div className="im-chiprow">
                <div className="im-chipbox">
                  <SectionTitle>Đối tượng</SectionTitle>
                  <div className="im-chips">
                    {v.targetGroups.slice(0, 7).map((group: TargetGroup) => (
                      <Badge key={group}>{group}</Badge>
                    ))}
                    {v.targetGroups.length > 7 ? (
                      <span className="im-more">+{v.targetGroups.length - 7}…</span>
                    ) : null}
                  </div>
                </div>

                <div className="im-chipbox">
                  <SectionTitle>Chống chỉ định nổi bật</SectionTitle>
                  <div className="im-chips">
                    {v.contraindications.slice(0, 4).map((contra: ContraTag) => (
                      <Badge key={contra}>{contra}</Badge>
                    ))}
                    {v.contraindications.length > 4 ? (
                      <span className="im-more">+{v.contraindications.length - 4}…</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {v.scheduleSummary?.length ? (
                <div className="im-summary">
                  <SectionTitle>Lịch cơ bản</SectionTitle>
                  <div className="im-summary-list">
                    {v.scheduleSummary.map((summary: string, idx: number) => (
                      <Badge key={idx}>{summary}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <VaccineDetailModal vaccine={selectedVaccine} onClose={() => setSelectedVaccine(null)} />

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

        .im-title{
          margin:0;
          font-size:28px;
          letter-spacing:-0.2px;
        }

        .im-sub{
          margin:6px 0 0;
          color: var(--muted);
          line-height:1.45;
        }

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

        .im-filters{
          margin-bottom: 12px;
          padding: 16px;
        }

        .im-filter-grid{
          display:grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap:12px;
          align-items:end;
        }

        .im-field{
          display:flex;
          flex-direction:column;
          gap:6px;
          min-width:0;
        }

        .im-field--search{
          grid-column: span 1;
        }

        .im-label{
          font-size:12px;
          color: var(--muted);
          font-weight:800;
        }

        .im-input,
        .im-select{
          width:100%;
          border:1px solid var(--line);
          border-radius:12px;
          padding:10px 12px;
          font-size:14px;
          outline:none;
          background:#fff;
        }

        .im-input:focus,
        .im-select:focus{
          border-color: rgba(29,78,216,0.5);
          box-shadow: 0 0 0 3px rgba(29,78,216,0.12);
        }

        .im-filter-foot{
          margin-top:12px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
        }

        .im-foot-left{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
        }

        .im-count{
          color: var(--muted);
          font-size:13px;
        }

        .im-results{
          display:flex;
          flex-direction:column;
          gap:12px;
        }

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

        .im-chipbox{
          min-width:0;
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

        .im-more{
          color: var(--muted);
          font-size:12px;
          font-weight:800;
        }

        .im-summary{
          margin-top: 12px;
          border-top: 1px dashed var(--line);
          padding-top: 12px;
        }

        .im-summary-list{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }

        .im-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:14px;
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

        .im-muted{
          color: var(--muted);
          font-weight:700;
        }

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
          max-width: 40%;
          text-align:right;
        }

        .im-protocols-wrap{
          margin-top: 14px;
        }

        .im-protocol-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:12px;
        }

        .im-protocol{
          border:1px solid var(--line);
          border-radius:14px;
          padding:12px;
          background:#fff;
        }

        .im-protocol-head{
          display:flex;
          gap:8px;
          align-items:center;
          margin-bottom:8px;
          flex-wrap:wrap;
        }

        .im-protocol-kind{
          border:1px solid rgba(29,78,216,0.18);
          background:rgba(29,78,216,0.06);
          color:var(--primary);
          padding:4px 8px;
          border-radius:999px;
          font-size:11px;
          font-weight:900;
        }

        .im-protocol-title{
          font-size:14px;
          font-weight:900;
          color:var(--text);
        }

        .im-protocol-summary{
          color: var(--muted);
          font-size:13px;
          line-height:1.45;
          margin-bottom:8px;
          font-weight:700;
        }

        .im-protocol-note{
          margin-top:8px;
          font-size:12px;
          color: var(--muted);
          font-weight:800;
        }

        .im-ref{ margin-top: 12px; }

        .im-modal-backdrop{
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.48);
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 18px;
          z-index: 1000;
        }

        .im-modal{
          width:min(1080px, 100%);
          max-height:min(88vh, 100%);
          overflow:auto;
          background: var(--card);
          border:1px solid var(--line);
          border-radius:20px;
          box-shadow: 0 24px 80px rgba(2, 6, 23, 0.28);
        }

        .im-modal-head{
          position: sticky;
          top: 0;
          z-index: 2;
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:flex-start;
          padding:16px 16px 12px;
          border-bottom:1px solid var(--line);
          background: var(--card);
          border-top-left-radius:20px;
          border-top-right-radius:20px;
        }

        .im-modal-title{
          font-size:20px;
          font-weight:900;
          color: var(--text);
        }

        .im-modal-close{
          width:40px;
          height:40px;
          border-radius:12px;
          border:1px solid var(--line);
          background:#fff;
          cursor:pointer;
          font-size:24px;
          line-height:1;
        }

        .im-modal-body{
          padding:16px;
        }

        @media (max-width: 1100px){
          .im-filter-grid{
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 900px){
          .im-chiprow,
          .im-grid,
          .im-protocol-grid{
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px){
          .im-filter-grid{
            grid-template-columns: 1fr;
          }

          .im-item-head{
            flex-direction:column;
            align-items:stretch;
          }

          .im-modal{
            width:100%;
            max-height:92vh;
          }
        }
      `}</style>
    </div>
  );
}