import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { drugs, type Drug, type HepaticClass } from "../data/doseAdjust";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function pickRenalRule(drug: Drug, egfr: number) {
  const rules = drug.renalRules ?? [];
  for (const r of rules) {
    const minOk = r.egfrMin == null || egfr >= r.egfrMin;
    const maxOk = r.egfrMax == null || egfr < r.egfrMax;
    if (minOk && maxOk) return r.recommendation;
  }
  return rules.length ? "Không tìm thấy ngưỡng phù hợp trong dữ liệu." : null;
}

function pickHepaticRule(drug: Drug, child: HepaticClass) {
  const rules = drug.hepaticRules ?? [];
  const exact = rules.find((r) => r.childPugh === child);
  if (exact) return exact.recommendation;
  if (rules.length) return "Không có khuyến cáo gan cho mức này trong dữ liệu.";
  return null;
}

function tinhCockcroftGault(params: {
  tuoi: number;
  canNang: number;
  creatininMgDl: number;
  gioi: "nam" | "nu";
}) {
  const { tuoi, canNang, creatininMgDl, gioi } = params;
  if (tuoi <= 0 || canNang <= 0 || creatininMgDl <= 0) return 0;

  let crcl = ((140 - tuoi) * canNang) / (72 * creatininMgDl);
  if (gioi === "nu") crcl *= 0.85;
  return crcl;
}

function tinhChildPughDiem(params: {
  bilirubin: number;
  albumin: number;
  inr: number;
  coTruong: number;
  naoGan: number;
}) {
  return (
    params.bilirubin +
    params.albumin +
    params.inr +
    params.coTruong +
    params.naoGan
  );
}

function xepLoaiChildPugh(diem: number): HepaticClass {
  if (diem <= 6) return "Child-Pugh A";
  if (diem <= 9) return "Child-Pugh B";
  return "Child-Pugh C";
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function DoseAdjust() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);

  const [q, setQ] = useState("");
  const [egfr, setEgfr] = useState<number>(60);
  const [child, setChild] = useState<HepaticClass>("None");
  const [selectedId, setSelectedId] = useState<string>(drugs[0]?.id ?? "");

  const [showCrclModal, setShowCrclModal] = useState(false);
  const [showChildPughModal, setShowChildPughModal] = useState(false);

  // Cockcroft-Gault
  const [tuoi, setTuoi] = useState<number>(60);
  const [canNang, setCanNang] = useState<number>(60);
  const [creatininMgDl, setCreatininMgDl] = useState<number>(1);
  const [gioi, setGioi] = useState<"nam" | "nu">("nam");

  const crcl = useMemo(
    () => tinhCockcroftGault({ tuoi, canNang, creatininMgDl, gioi }),
    [tuoi, canNang, creatininMgDl, gioi]
  );

  // Child-Pugh
  const [bilirubinScore, setBilirubinScore] = useState<number>(1);
  const [albuminScore, setAlbuminScore] = useState<number>(1);
  const [inrScore, setInrScore] = useState<number>(1);
  const [coTruongScore, setCoTruongScore] = useState<number>(1);
  const [naoGanScore, setNaoGanScore] = useState<number>(1);

  const childPughDiem = useMemo(
    () =>
      tinhChildPughDiem({
        bilirubin: bilirubinScore,
        albumin: albuminScore,
        inr: inrScore,
        coTruong: coTruongScore,
        naoGan: naoGanScore,
      }),
    [bilirubinScore, albuminScore, inrScore, coTruongScore, naoGanScore]
  );

  const childPughClass = useMemo(
    () => xepLoaiChildPugh(childPughDiem),
    [childPughDiem]
  );

  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return drugs;
    return drugs.filter((d) => {
      const hay = normalize([d.name, ...(d.aliases ?? []), d.group ?? ""].join(" "));
      return hay.includes(nq);
    });
  }, [q]);

  const selected = useMemo(
    () => drugs.find((d) => d.id === selectedId) ?? filtered[0] ?? null,
    [selectedId, filtered]
  );

  const renalText = useMemo(
    () => (selected ? pickRenalRule(selected, egfr) : null),
    [selected, egfr]
  );

  const hepaticText = useMemo(
    () => (selected ? pickHepaticRule(selected, child) : null),
    [selected, child]
  );

  return (
    <div className="page">
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 28 : undefined }}>
              Điều chỉnh liều thuốc (tính năng đang phát triển)
            </h2>
            <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.5 }}>
              Gợi ý điều chỉnh theo eGFR/CrCl (thận) và Child-Pugh (gan) cho các thuốc thường dùng.
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              ...actionBtnStyle,
              width: isMobile ? "100%" : "auto",
              justifyContent: "center",
            }}
          >
            ← Trở về trang trước
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>
            Công cụ trong nhóm thuốc
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <ToolCard
              title="Điều chỉnh liều theo thận/gan"
              desc="Tra cứu nhanh gợi ý điều chỉnh liều theo eGFR và Child-Pugh."
              active
            />

            <ToolCard
              title="Tính ngày hết thuốc"
              desc="Ước tính số ngày đủ thuốc, ngày dùng liều cuối và ngày hết thuốc dựa trên số lượng cấp và liều dùng."
              onClick={() => navigate("/medication/days-supply")}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 12,
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <Field label="Tìm thuốc">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ví dụ: metformin, amox, paracetamol..."
              style={inputStyle}
            />
          </Field>

          <Field
            label={
              <div
                style={{
                  display: "flex",
                  alignItems: isMobile ? "stretch" : "center",
                  justifyContent: "space-between",
                  gap: 8,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <span>eGFR (mL/min/1.73m²)</span>
                <button
                  type="button"
                  onClick={() => setShowCrclModal(true)}
                  style={{
                    ...miniBtnStyle,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Tính CrCl
                </button>
              </div>
            }
          >
            <input
              type="number"
              value={egfr}
              onChange={(e) => setEgfr(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>

          <Field
            label={
              <div
                style={{
                  display: "flex",
                  alignItems: isMobile ? "stretch" : "center",
                  justifyContent: "space-between",
                  gap: 8,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <span>Chức năng gan (Child-Pugh)</span>
                <button
                  type="button"
                  onClick={() => setShowChildPughModal(true)}
                  style={{
                    ...miniBtnStyle,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Tính Child-Pugh
                </button>
              </div>
            }
          >
            <select
              value={child}
              onChange={(e) => setChild(e.target.value as HepaticClass)}
              style={inputStyle}
            >
              <option value="None">Không/không rõ</option>
              <option value="Child-Pugh A">Child-Pugh A</option>
              <option value="Child-Pugh B">Child-Pugh B</option>
              <option value="Child-Pugh C">Child-Pugh C</option>
            </select>
          </Field>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 14,
            gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 360px) 1fr",
          }}
        >
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "white",
              overflow: "hidden",
              order: isMobile ? 2 : 1,
            }}
          >
            <div
              style={{
                padding: 12,
                borderBottom: "1px solid var(--line)",
                fontWeight: 900,
              }}
            >
              Danh sách thuốc ({filtered.length})
            </div>

            <div
              style={{
                maxHeight: isMobile ? 320 : 420,
                overflow: "auto",
              }}
            >
              {filtered.map((d) => {
                const active = d.id === selected?.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 12,
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: active
                        ? "linear-gradient(180deg, rgba(29,78,216,0.14), rgba(29,78,216,0.08))"
                        : "white",
                      cursor: "pointer",
                      position: "relative",
                      boxShadow: active ? "inset 4px 0 0 rgb(29,78,216)" : "none",
                    }}
                  >
                    <div style={{ fontWeight: active ? 1000 : 900, lineHeight: 1.4 }}>
                      {d.name}
                    </div>
                    <div
                      style={{
                        color: active ? "rgb(71,85,105)" : "var(--muted)",
                        fontSize: 12,
                        marginTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {d.group ?? "—"} {d.aliases?.length ? `• ${d.aliases[0]}` : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "white",
              padding: 14,
              order: isMobile ? 1 : 2,
            }}
          >
            {!selected ? (
              <div style={{ color: "var(--muted)" }}>Không có thuốc phù hợp.</div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: isMobile ? 24 : 18,
                        fontWeight: 1000,
                        lineHeight: 1.3,
                      }}
                    >
                      {selected.name}
                    </div>
                    <div style={{ marginTop: 6, color: "var(--muted)" }}>
                      {selected.group ?? "—"}
                    </div>
                  </div>
                </div>

                {selected.typicalDose ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid var(--line)",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Liều thường dùng (tham khảo)</div>
                    <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.5 }}>
                      {selected.typicalDose}
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(240px, 1fr))",
                  }}
                >
                  <ResultBox
                    title="Gợi ý theo thận (eGFR)"
                    text={renalText ?? "Thuốc này chưa có dữ liệu chỉnh liều theo thận."}
                  />
                  <ResultBox
                    title="Gợi ý theo gan (Child-Pugh)"
                    text={hepaticText ?? "Thuốc này chưa có dữ liệu chỉnh liều theo gan."}
                  />
                </div>

                {selected.notes ? (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "var(--muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {selected.notes}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Lưu ý: Gợi ý hỗ trợ tham khảo; luôn đối chiếu khuyến cáo chính thức tại cơ sở,
          tình trạng lâm sàng, tương tác và liều theo chỉ định.
        </div>
      </div>

      {showCrclModal ? (
        <Modal
          title="Tính mức độ thanh thải creatinin theo Cockcroft–Gault"
          onClose={() => setShowCrclModal(false)}
          isMobile={isMobile}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Tuổi">
              <input
                type="number"
                value={tuoi}
                onChange={(e) => setTuoi(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>

            <Field label="Cân nặng (kg)">
              <input
                type="number"
                value={canNang}
                onChange={(e) => setCanNang(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>

            <Field label="Creatinin huyết thanh (mg/dL)">
              <input
                type="number"
                step="0.1"
                value={creatininMgDl}
                onChange={(e) => setCreatininMgDl(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>

            <Field label="Giới">
              <select
                value={gioi}
                onChange={(e) => setGioi(e.target.value as "nam" | "nu")}
                style={inputStyle}
              >
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
              </select>
            </Field>

            <div style={resultPanelStyle}>
              <div style={{ fontWeight: 900 }}>Kết quả CrCl</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 1000 }}>
                {crcl > 0 ? `${crcl.toFixed(1)} mL/phút` : "—"}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                Công thức: CrCl = ((140 - tuổi) × cân nặng) / (72 × creatinin); nữ × 0,85
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                type="button"
                onClick={() => setShowCrclModal(false)}
                style={{ ...actionBtnStyle, width: isMobile ? "100%" : "auto" }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setEgfr(Number(crcl.toFixed(1)));
                  setShowCrclModal(false);
                }}
                style={{ ...primaryBtnStyle, width: isMobile ? "100%" : "auto" }}
              >
                Dùng kết quả này
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showChildPughModal ? (
        <Modal
          title="Tính điểm Child-Pugh"
          onClose={() => setShowChildPughModal(false)}
          isMobile={isMobile}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Bilirubin toàn phần">
              <select
                value={bilirubinScore}
                onChange={(e) => setBilirubinScore(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>&lt; 2 mg/dL = 1 điểm</option>
                <option value={2}>2–3 mg/dL = 2 điểm</option>
                <option value={3}>&gt; 3 mg/dL = 3 điểm</option>
              </select>
            </Field>

            <Field label="Albumin">
              <select
                value={albuminScore}
                onChange={(e) => setAlbuminScore(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>&gt; 3,5 g/dL = 1 điểm</option>
                <option value={2}>2,8–3,5 g/dL = 2 điểm</option>
                <option value={3}>&lt; 2,8 g/dL = 3 điểm</option>
              </select>
            </Field>

            <Field label="INR">
              <select
                value={inrScore}
                onChange={(e) => setInrScore(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>&lt; 1,7 = 1 điểm</option>
                <option value={2}>1,7–2,3 = 2 điểm</option>
                <option value={3}>&gt; 2,3 = 3 điểm</option>
              </select>
            </Field>

            <Field label="Cổ trướng">
              <select
                value={coTruongScore}
                onChange={(e) => setCoTruongScore(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>Không = 1 điểm</option>
                <option value={2}>Nhẹ/kiểm soát được = 2 điểm</option>
                <option value={3}>Nhiều/khó kiểm soát = 3 điểm</option>
              </select>
            </Field>

            <Field label="Não gan">
              <select
                value={naoGanScore}
                onChange={(e) => setNaoGanScore(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>Không = 1 điểm</option>
                <option value={2}>Độ I–II = 2 điểm</option>
                <option value={3}>Độ III–IV = 3 điểm</option>
              </select>
            </Field>

            <div style={resultPanelStyle}>
              <div style={{ fontWeight: 900 }}>Kết quả Child-Pugh</div>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 1000 }}>
                {childPughClass}
              </div>
              <div style={{ marginTop: 6, fontSize: 16 }}>
                Tổng điểm: <b>{childPughDiem}</b>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                type="button"
                onClick={() => setShowChildPughModal(false)}
                style={{ ...actionBtnStyle, width: isMobile ? "100%" : "auto" }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setChild(childPughClass);
                  setShowChildPughModal(false);
                }}
                style={{ ...primaryBtnStyle, width: isMobile ? "100%" : "auto" }}
              >
                Dùng kết quả này
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Field(props: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{props.label}</div>
      {props.children}
    </div>
  );
}

function ResultBox(props: { title: string; text: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 12,
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ fontWeight: 900, lineHeight: 1.4 }}>{props.title}</div>
      <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.5 }}>
        {props.text}
      </div>
    </div>
  );
}

function ToolCard(props: {
  title: string;
  desc: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.active}
      style={{
        textAlign: "left",
        padding: 14,
        borderRadius: 16,
        border: props.active
          ? "2px solid rgba(29,78,216,0.45)"
          : "1px solid var(--line)",
        background: props.active
          ? "linear-gradient(180deg, rgba(29,78,216,0.14), rgba(29,78,216,0.08))"
          : "white",
        cursor: props.active ? "default" : "pointer",
        boxShadow: props.active
          ? "0 6px 18px rgba(29,78,216,0.10)"
          : "none",
        position: "relative",
        opacity: 1,
      }}
    >
      {props.active ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 10,
            bottom: 10,
            width: 5,
            borderRadius: 999,
            background: "rgb(29,78,216)",
          }}
        />
      ) : null}

      <div
        style={{
          fontWeight: props.active ? 1000 : 900,
          color: props.active ? "rgb(17,24,39)" : "inherit",
          paddingLeft: props.active ? 10 : 0,
          lineHeight: 1.4,
        }}
      >
        {props.title}
      </div>

      {props.active ? (
        <div
          style={{
            display: "inline-block",
            marginTop: 6,
            marginBottom: 2,
            marginLeft: props.active ? 10 : 0,
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            background: "rgba(29,78,216,0.12)",
            color: "rgb(29,78,216)",
          }}
        >
          Đang chọn
        </div>
      ) : null}

      <div
        style={{
          marginTop: 6,
          color: props.active ? "rgb(71,85,105)" : "var(--muted)",
          fontSize: 14,
          lineHeight: 1.5,
          paddingLeft: props.active ? 10 : 0,
        }}
      >
        {props.desc}
      </div>
    </button>
  );
}

function Modal(props: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isMobile?: boolean;
}) {
  return (
    <div
      onClick={props.onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.35)",
        display: "flex",
        alignItems: props.isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: props.isMobile ? 0 : 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: props.isMobile ? "100%" : 560,
          background: "white",
          borderRadius: props.isMobile ? "20px 20px 0 0" : 20,
          border: "1px solid var(--line)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
          padding: 16,
          maxHeight: props.isMobile ? "90vh" : "85vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
            position: "sticky",
            top: 0,
            background: "white",
            paddingBottom: 8,
            zIndex: 1,
          }}
        >
          <div style={{ fontWeight: 1000, fontSize: props.isMobile ? 17 : 18, lineHeight: 1.4 }}>
            {props.title}
          </div>
          <button onClick={props.onClose} style={actionBtnStyle}>
            Đóng
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  outline: "none",
  background: "white",
  fontSize: 16,
};

const actionBtnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "white",
  cursor: "pointer",
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(29,78,216,0.3)",
  background: "rgba(29,78,216,0.1)",
  color: "rgb(29,78,216)",
  cursor: "pointer",
  fontWeight: 900,
};

const miniBtnStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(29,78,216,0.25)",
  background: "rgba(29,78,216,0.08)",
  color: "rgb(29,78,216)",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const resultPanelStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: 12,
  background: "rgba(0,0,0,0.02)",
};