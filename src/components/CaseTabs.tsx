// src/components/CaseTabs.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "../context/CasesContext";

function shortName(full: string) {
  const s = (full || "").trim();
  if (!s) return "Không tên";
  const parts = s.split(/\s+/).filter(Boolean);
  // ưu tiên lấy 2 từ cuối để dễ nhận
  if (parts.length >= 2) return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  return parts[0];
}

export default function CaseTabs() {
  const navigate = useNavigate();
  const { cases, activeCaseId, setActiveCaseId, closeCase } = useCases();

  const [openMore, setOpenMore] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  // ✅ active lên đầu, còn lại giữ thứ tự hiện tại
  const sorted = useMemo(() => {
    if (!cases.length) return [];
    const active = cases.find((c) => c.id === activeCaseId) ?? null;
    const others = cases.filter((c) => c.id !== activeCaseId);
    return active ? [active, ...others] : others;
  }, [cases, activeCaseId]);

  if (!sorted.length) return null;

  // ✅ hiển thị gọn: 1 active + tối đa 3 tab khác (tổng 4). Còn lại vào "+N"
  const INLINE_OTHERS = 3;
  const active = sorted[0];
  const others = sorted.slice(1);

  const inlineOthers = others.slice(0, INLINE_OTHERS);
  const remaining = others.slice(INLINE_OTHERS);

  const goCase = (id: string) => {
    setActiveCaseId(id);
    navigate(`/cases/${id}`);
    setOpenMore(false);
  };

  const chipBase: React.CSSProperties = {
    minWidth: 0,
    height: 36,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid var(--line)",
    background: "white",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 900,
    fontSize: 13, // ✅ nhỏ lại
    whiteSpace: "nowrap",
  };

  const labelStyle: React.CSSProperties = {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        // ✅ quan trọng: không cho đè sang khu vực nút bên phải
        overflow: "hidden",
      }}
    >
      {/* ✅ ACTIVE: hiển thị đầy đủ */}
      {active && (
        <button
          type="button"
          onClick={() => goCase(active.id)}
          style={{
            ...chipBase,
            border: "2px solid var(--primary)",
            background:
              "linear-gradient(180deg, rgba(37,99,235,0.10), rgba(37,99,235,0.06))",
            boxShadow: "0 6px 18px rgba(37,99,235,0.10)",
          }}
          title="Ca đang chọn"
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "var(--primary)",
              flex: "0 0 auto",
            }}
          />
          <span style={labelStyle}>
            {active.patient.name} • {active.patient.yob} • {active.patient.sex}
          </span>

          <span
            onClick={(e) => {
              e.stopPropagation();
              closeCase(active.id);
            }}
            title="Đóng ca"
            style={{
              flex: "0 0 auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.4)",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ×
          </span>
        </button>
      )}

      {/* ✅ INACTIVE: hiển thị rút gọn */}
      <div
        style={{
          display: "flex",
          gap: 8,
          minWidth: 0,
          overflow: "hidden",
          flex: 1,
        }}
      >
        {inlineOthers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => goCase(c.id)}
            style={{
              ...chipBase,
              opacity: 0.96,
              // ✅ nhỏ hơn nữa
              padding: "6px 9px",
              fontSize: 12.5,
            }}
            title={`${c.patient.name} • ${c.patient.yob}`}
          >
            <span style={labelStyle}>
              {shortName(c.patient.name)} • {c.patient.yob}
            </span>

            <span
              onClick={(e) => {
                e.stopPropagation();
                closeCase(c.id);
              }}
              title="Đóng ca"
              style={{
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ×
            </span>
          </button>
        ))}
      </div>

      {/* ✅ MORE: nếu còn nhiều ca thì gom vào +N */}
      {remaining.length > 0 && (
        <div ref={moreRef} style={{ position: "relative", flex: "0 0 auto" }}>
          <button
            type="button"
            onClick={() => setOpenMore((v) => !v)}
            style={{
              ...chipBase,
              padding: "6px 10px",
              fontSize: 12.5,
              border: "1px solid rgba(148,163,184,0.45)",
              background: "rgba(148,163,184,0.10)",
            }}
            title="Xem thêm ca"
          >
            +{remaining.length}
          </button>

          {openMore && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 320,
                maxHeight: 320,
                overflow: "auto",
                background: "white",
                border: "1px solid rgba(148,163,184,0.35)",
                borderRadius: 14,
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
                padding: 8,
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 12,
                  color: "rgba(100,116,139,0.9)",
                  padding: "6px 8px",
                }}
              >
                Các ca khác
              </div>

              {remaining.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goCase(c.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.25)",
                    background: "white",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 6,
                    fontWeight: 900,
                  }}
                  title="Mở ca"
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.patient.name} • {c.patient.yob} • {c.patient.sex}
                    </div>
                    <div style={{ marginTop: 3, fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                      Tab gọn: {shortName(c.patient.name)} • {c.patient.yob}
                    </div>
                  </div>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeCase(c.id);
                    }}
                    title="Đóng ca"
                    style={{
                      flex: "0 0 auto",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "white",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </span>
                </button>
              ))}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setOpenMore(false)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 12.5,
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
