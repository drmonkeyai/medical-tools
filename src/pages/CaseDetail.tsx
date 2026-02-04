// src/pages/CaseDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCases, type Patient, type CaseItem, type ToolResult } from "../context/CasesContext";
import { specialties } from "../data/tools";
import type { Tool } from "../data/tools";

type Domain = "bio" | "psycho" | "social";

type ToolItem = Tool & {
  specialtyId: string;
  specialtyName: string;
  domain: Domain;
};

function calcAge(yob: number) {
  const y = new Date().getFullYear();
  return Math.max(0, y - yob);
}

function bmiFrom(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  if (h <= 0) return null;
  return weightKg / (h * h);
}

// BMI theo ngưỡng Châu Á (bạn đang dùng)
function bmiClassAsian(bmi: number) {
  if (bmi < 18.5) return "Gầy (<18.5)";
  if (bmi < 23) return "Bình thường (18.5–22.9)";
  if (bmi < 25) return "Thừa cân (23–24.9)";
  return "Béo phì (≥25)";
}

function toolDomain(toolId: string): Domain {
  const social = new Set(["family-apgar", "screem", "pedigree"]);
  const psycho = new Set([
    "phq9",
    "gad7",
    "audit-c",
    "isi",
    "stop-bang",
    "epworth",
    "gcs",
    "abcd2",
    "nihss",
  ]);
  if (social.has(toolId)) return "social";
  if (psycho.has(toolId)) return "psycho";
  return "bio";
}

function domainTitle(d: Domain) {
  if (d === "bio") return "BIO";
  if (d === "psycho") return "PSYCHO";
  return "SOCIAL";
}

function domainDesc(d: Domain) {
  if (d === "bio") return "Tim mạch • Hô hấp • Thận tiết niệu • Nội tiết • Tiêu hoá • Truyền nhiễm,…";
  if (d === "psycho") return "Tâm thần kinh • Hành vi • Giấc ngủ • Thần kinh,…";
  return "Gia đình – xã hội • Nguồn lực • Bối cảnh sống,…";
}

export default function CaseDetail() {
  const nav = useNavigate();
  const { id } = useParams();

  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    updateCasePatient,
  } = useCases();

  // Case theo URL :id (ưu tiên), fallback activeCase
  const caseFromUrl = useMemo(() => {
    if (!id) return null;
    return cases.find((c) => c.id === id) ?? null;
  }, [cases, id]);

  const caze: CaseItem | null = caseFromUrl ?? activeCase ?? null;

  // Đồng bộ activeCaseId theo URL nếu có
  useEffect(() => {
    if (!id) return;
    if (activeCaseId !== id) {
      const exists = cases.some((c) => c.id === id);
      if (exists) setActiveCaseId(id);
    }
  }, [id, activeCaseId, cases, setActiveCaseId]);

  // Nếu URL id không tồn tại → show “không tìm thấy ca”
  const urlIdInvalid = useMemo(() => {
    if (!id) return false;
    return !cases.some((c) => c.id === id);
  }, [id, cases]);

  // Flatten tools
  const allTools: ToolItem[] = useMemo(() => {
    const out: ToolItem[] = [];
    for (const s of specialties) {
      for (const t of s.tools) {
        out.push({
          ...t,
          specialtyId: s.id,
          specialtyName: s.name,
          domain: toolDomain(t.id),
        });
      }
    }
    return out;
  }, []);

  // Latest result per tool in this case
  const latestByTool = useMemo(() => {
    const m = new Map<string, ToolResult>();
    if (!caze) return m;
    for (const r of caze.results) {
      const prev = m.get(r.tool);
      if (!prev) {
        m.set(r.tool, r);
        continue;
      }
      // compare time
      if (String(r.when) > String(prev.when)) m.set(r.tool, r);
    }
    return m;
  }, [caze]);

  // Done / Todo
  const doneTools = useMemo(() => allTools.filter((t) => latestByTool.has(t.id)), [allTools, latestByTool]);
  const todoTools = useMemo(() => allTools.filter((t) => !latestByTool.has(t.id)), [allTools, latestByTool]);

  const doneByDomain = useMemo(() => {
    const obj: Record<Domain, ToolItem[]> = { bio: [], psycho: [], social: [] };
    for (const t of doneTools) obj[t.domain].push(t);
    for (const d of Object.keys(obj) as Domain[]) {
      obj[d].sort((a, b) => a.name.localeCompare(b.name));
    }
    return obj;
  }, [doneTools]);

  const countByDomain = useMemo(() => {
    const allByDomain: Record<Domain, number> = { bio: 0, psycho: 0, social: 0 };
    const doneCount: Record<Domain, number> = { bio: 0, psycho: 0, social: 0 };
    for (const t of allTools) allByDomain[t.domain] += 1;
    for (const t of doneTools) doneCount[t.domain] += 1;
    return { allByDomain, doneCount };
  }, [allTools, doneTools]);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Patient | null>(null);

  useEffect(() => {
    if (!caze) return;
    setDraft({ ...caze.patient });
  }, [caze?.id]);

  const patientLine = useMemo(() => {
    if (!caze) return "";
    const p = caze.patient;
    const age = calcAge(p.yob);
    return `${p.name} • ${p.yob} (${age} tuổi) • ${p.sex}`;
  }, [caze]);

  const bmi = useMemo(() => {
    if (!caze) return null;
    return bmiFrom(caze.patient.weightKg, caze.patient.heightCm);
  }, [caze]);

  const bmiText = useMemo(() => {
    if (!bmi) return "—";
    const v = Math.round(bmi * 10) / 10;
    return `${v} • ${bmiClassAsian(v)}`;
  }, [bmi]);

  // Print/PDF
  const onPrint = () => {
    // người dùng chọn Save as PDF trong hộp thoại in
    window.print();
  };

  if (!caze || urlIdInvalid) {
    return (
      <div className="page">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Không tìm thấy ca</h2>
          <div style={{ color: "var(--muted)", fontWeight: 700 }}>
            Ca có thể đã bị đóng hoặc ID không đúng.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button className="btn" type="button" onClick={() => nav(-1)}>
              ← Trở về
            </button>
            <button
              className="btnPrimary"
              type="button"
              onClick={() => {
                const first = cases[0];
                if (first) nav(`/cases/${first.id}`);
                else nav("/");
              }}
            >
              Về ca gần nhất
            </button>
            <button className="btn" type="button" onClick={() => nav("/")}>
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- UI ----
  return (
    <div className="page">
      {/* Header block: title + actions (bỏ "Thông tin cơ bản") */}
      <div className="card" style={{ background: "rgba(29,78,216,0.06)", borderColor: "rgba(29,78,216,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Ca bệnh nhân</h1>

            {/* ✅ Nút chỉnh sửa */}
            <button className="btn" type="button" onClick={() => setEditOpen(true)}>
              ✎ Chỉnh sửa
            </button>

            {/* ✅ Nút in / xuất PDF */}
            <button className="btn" type="button" onClick={onPrint} title="Mở hộp thoại in (Save as PDF)">
              🖨 In / Xuất PDF
            </button>
          </div>

          <button className="btn" type="button" onClick={() => nav(-1)}>
            ← Trở về
          </button>
        </div>

        {/* Patient summary (vẫn giữ, nhưng không còn tiêu đề “Thông tin cơ bản …”) */}
        <div
          style={{
            marginTop: 12,
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>{patientLine}</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <span className="badge" style={{ borderColor: "var(--line)", background: "rgba(0,0,0,0.02)" }}>
              <span style={{ fontWeight: 900 }}>Cân nặng:</span>&nbsp;{caze.patient.weightKg ?? "—"}{" "}
              {typeof caze.patient.weightKg === "number" ? "kg" : ""}
            </span>

            <span className="badge" style={{ borderColor: "var(--line)", background: "rgba(0,0,0,0.02)" }}>
              <span style={{ fontWeight: 900 }}>Chiều cao:</span>&nbsp;{caze.patient.heightCm ?? "—"}{" "}
              {typeof caze.patient.heightCm === "number" ? "cm" : ""}
            </span>

            <span className="badge" style={{ borderColor: "var(--line)", background: "rgba(0,0,0,0.02)" }}>
              <span style={{ fontWeight: 900 }}>BMI:</span>&nbsp;{bmiText}
            </span>
          </div>
        </div>
      </div>

      {/* Summary done */}
      <div className="card" style={{ marginTop: 14, background: "rgba(29,78,216,0.06)", borderColor: "rgba(29,78,216,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Tổng hợp đã đánh giá</div>
            <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
              Chỉ hiển thị kết quả tóm tắt. Bấm vào từng dòng để mở công cụ xem chi tiết.
            </div>
          </div>

          <div style={{ color: "var(--muted)", fontWeight: 900 }}>
            {doneTools.length}/{allTools.length} đã đánh giá
          </div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 16 }}>
          {(["bio", "psycho", "social"] as Domain[]).map((d) => {
            const rows = doneByDomain[d];
            const doneN = countByDomain.doneCount[d];
            const allN = countByDomain.allByDomain[d];

            return (
              <div key={d} style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontWeight: 900, color: "rgba(2,132,199,0.95)" }}>{domainTitle(d)}</div>
                    <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
                      {domainDesc(d)}
                    </div>
                  </div>

                  <div style={{ color: "rgba(2,132,199,0.95)", fontWeight: 900 }}>
                    {doneN}/{allN} đã đánh giá
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {!rows.length ? (
                    <div style={{ color: "var(--muted)", fontWeight: 800 }}>Chưa có đánh giá {domainTitle(d)}.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {rows.map((t) => {
                        const r = latestByTool.get(t.id);
                        const summary = r?.summary || r?.outputs?.summary || "";
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => nav(t.route)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: 12,
                              borderRadius: 14,
                              border: "1px solid var(--line)",
                              background: "white",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              alignItems: "center",
                            }}
                            title="Mở công cụ để xem chi tiết"
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 900 }}>{t.name}</div>
                              <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
                                {summary || "Đã đánh giá"}
                              </div>
                            </div>
                            <div style={{ fontWeight: 900, color: "var(--muted)" }}>→</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Todo tools by specialty */}
      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>Công cụ chưa đánh giá</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
          Đánh giá xong sẽ tự chuyển lên phần “Tổng hợp đã đánh giá” đúng nhóm BIO/PSYCHO/SOCIAL.
        </div>

        <div className="divider" />

        {todoTools.length === 0 ? (
          <div style={{ color: "var(--muted)", fontWeight: 800 }}>Đã đánh giá hết 🎉</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {specialties.map((s) => {
              const toolsInS = todoTools.filter((t) => t.specialtyId === s.id);
              if (!toolsInS.length) return null;

              return (
                <div key={s.id} style={{ border: "1px solid var(--line)", borderRadius: 16, background: "white" }}>
                  <div style={{ padding: 12, borderBottom: "1px solid var(--line)", fontWeight: 900 }}>
                    {s.name}
                  </div>

                  <div style={{ padding: 12, display: "grid", gap: 10 }}>
                    {toolsInS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => nav(t.route)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid var(--line)",
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                        }}
                        title="Mở công cụ"
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 900 }}>{t.name}</div>
                          <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
                            {t.description}
                          </div>
                        </div>
                        <div style={{ fontWeight: 900, color: "var(--muted)" }}>→</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editOpen && draft && (
        <div
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setEditOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 100,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              background: "white",
              borderRadius: 16,
              border: "1px solid var(--line)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Chỉnh sửa thông tin ca</div>
              <button className="btn" type="button" onClick={() => setEditOpen(false)}>
                ×
              </button>
            </div>

            <div className="divider" />

            <div className="formGrid" style={{ marginTop: 0 }}>
              <div className="field field--full">
                <label className="label">Họ và tên</label>
                <input
                  className="input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label">Năm sinh</label>
                <input
                  className="input"
                  type="number"
                  value={draft.yob}
                  onChange={(e) => setDraft({ ...draft, yob: Number(e.target.value) })}
                />
              </div>

              <div className="field">
                <label className="label">Giới</label>
                <select
                  className="select"
                  value={draft.sex}
                  onChange={(e) => setDraft({ ...draft, sex: e.target.value as Patient["sex"] })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="field">
                <label className="label">Cân nặng (kg)</label>
                <input
                  className="input"
                  type="number"
                  value={draft.weightKg ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    setDraft({ ...draft, weightKg: v });
                  }}
                />
              </div>

              <div className="field">
                <label className="label">Chiều cao (cm)</label>
                <input
                  className="input"
                  type="number"
                  value={draft.heightCm ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    setDraft({ ...draft, heightCm: v });
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button className="btn" type="button" onClick={() => setEditOpen(false)}>
                Huỷ
              </button>
              <button
                className="btnPrimary"
                type="button"
                onClick={() => {
                  updateCasePatient(caze.id, draft);
                  setEditOpen(false);
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
