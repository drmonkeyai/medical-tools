// src/pages/CaseDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCases } from "../context/CasesContext";
import { specialties } from "../data/tools";
import type { Tool } from "../data/tools";

type Domain = "bio" | "psycho" | "social";

function calcAge(yob: number) {
  const y = new Date().getFullYear();
  return Math.max(0, y - yob);
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

function bmiFrom(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  if (h <= 0) return null;
  return weightKg / (h * h);
}

function bmiClassAsia(bmi: number) {
  if (bmi < 18.5) return "Gầy (<18.5)";
  if (bmi < 23) return "Bình thường (18.5–22.9)";
  if (bmi < 25) return "Thừa cân (23–24.9)";
  return "Béo phì (≥25)";
}

/** Map toolId -> Domain (theo tools.ts hiện tại của bạn) */
function toolDomain(id: string): Domain {
  const social = new Set<string>(["family-apgar", "screem", "pedigree"]);

  const psycho = new Set<string>([
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

  if (social.has(id)) return "social";
  if (psycho.has(id)) return "psycho";
  return "bio";
}

function domainMeta(domain: Domain) {
  switch (domain) {
    case "bio":
      return {
        title: "BIO",
        subtitle:
          "Tim mạch • Hô hấp • Thận tiết niệu • Nội tiết • Tiêu hoá • Truyền nhiễm,…",
      };
    case "psycho":
      return {
        title: "PSYCHO",
        subtitle: "Tâm thần kinh • Hành vi • Giấc ngủ • Thần kinh,…",
      };
    case "social":
      return {
        title: "SOCIAL",
        subtitle: "Gia đình – xã hội • Nguồn lực • Bối cảnh sống,…",
      };
  }
}

function flattenAllTools() {
  const out: Array<
    Tool & {
      specialtyId: string;
      specialtyName: string;
      domain: Domain;
    }
  > = [];

  for (const sp of specialties) {
    for (const t of sp.tools) {
      out.push({
        ...t,
        specialtyId: sp.id,
        specialtyName: sp.name,
        domain: toolDomain(t.id),
      });
    }
  }
  return out;
}

function safeText(x: any) {
  if (x == null) return "";
  return String(x);
}

function buildSummaryFallback(result: any): string {
  const summary = safeText(result?.summary);
  if (summary) return summary;

  const o = result?.outputs;
  if (!o) return "";

  if (o?.formulaText && o?.value != null && o?.unit) {
    const st = o?.stage ? ` • ${o.stage}` : "";
    return `${o.formulaText}: ${o.value} ${o.unit}${st}`;
  }

  if (o?.value != null && o?.unit) return `${o.value} ${o.unit}`;
  return "";
}

/** Tự đoán prefix route ca: /cases/:id hay /case/:id */
function detectCasePrefix(pathname: string) {
  if (pathname.startsWith("/case/")) return "/case/";
  if (pathname.startsWith("/cases/")) return "/cases/";
  // default
  return "/cases/";
}

export default function CaseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // ✅ FIX: hỗ trợ cả id và caseId (và các biến thể)
  const paramId =
    (params as any).id ??
    (params as any).caseId ??
    (params as any).caseID ??
    null;

  const { cases, activeCaseId, setActiveCaseId } = useCases();

  const prefix = useMemo(
    () => detectCasePrefix(location.pathname),
    [location.pathname]
  );

  const allTools = useMemo(() => flattenAllTools(), []);

  // ✅ Nếu URL thiếu param → dùng activeCaseId (hoặc case đầu tiên) và điều hướng lại
  useEffect(() => {
    if (paramId) return;

    const fallbackId =
      (activeCaseId && cases.some((c) => c.id === activeCaseId) && activeCaseId) ||
      cases[0]?.id ||
      null;

    if (!fallbackId) return;

    setActiveCaseId(fallbackId);
    navigate(`${prefix}${fallbackId}`, { replace: true });
  }, [paramId, activeCaseId, cases, setActiveCaseId, navigate, prefix]);

  // ✅ Đồng bộ activeCaseId theo URL param (nếu id tồn tại)
  useEffect(() => {
    if (!paramId) return;
    const exists = cases.some((c) => c.id === paramId);
    if (exists && activeCaseId !== paramId) setActiveCaseId(paramId);
  }, [paramId, cases, activeCaseId, setActiveCaseId]);

  const caseItem = useMemo(() => {
    if (!paramId) return null;
    return cases.find((c) => c.id === paramId) ?? null;
  }, [cases, paramId]);

  // Latest result per tool
  const latestByTool = useMemo(() => {
    const m = new Map<string, any>();
    if (!caseItem) return m;

    for (const r of caseItem.results ?? []) {
      if (!r?.tool) continue;

      const prev = m.get(r.tool);
      if (!prev) {
        m.set(r.tool, r);
        continue;
      }

      const tPrev = Date.parse(prev.when ?? prev.outputs?.when ?? "");
      const tNow = Date.parse(r.when ?? r.outputs?.when ?? "");
      if (!Number.isFinite(tPrev) || tNow > tPrev) m.set(r.tool, r);
    }
    return m;
  }, [caseItem]);

  const computed = useMemo(() => {
    const done: typeof allTools = [];
    const todo: typeof allTools = [];

    for (const t of allTools) {
      (latestByTool.has(t.id) ? done : todo).push(t);
    }

    const order: Record<Domain, number> = { bio: 0, psycho: 1, social: 2 };

    const sorter = (
      a: (typeof allTools)[number],
      b: (typeof allTools)[number]
    ) => {
      const da = order[a.domain] ?? 9;
      const db = order[b.domain] ?? 9;
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    };

    done.sort(sorter);
    todo.sort(
      (a, b) =>
        a.specialtyName.localeCompare(b.specialtyName) ||
        a.name.localeCompare(b.name)
    );

    const byDomain = (arr: typeof allTools) => ({
      bio: arr.filter((t) => t.domain === "bio"),
      psycho: arr.filter((t) => t.domain === "psycho"),
      social: arr.filter((t) => t.domain === "social"),
    });

    return {
      done,
      todo,
      doneByDomain: byDomain(done),
      todoByDomain: byDomain(todo),
    };
  }, [allTools, latestByTool]);

  // Filter controls for TODO section
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [q, setQ] = useState<string>("");

  const todoGroupedBySpecialty = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    const filtered = computed.todo.filter((t) => {
      if (specialtyFilter !== "all" && t.specialtyId !== specialtyFilter)
        return false;
      if (!keyword) return true;
      const hay = `${t.name} ${t.description}`.toLowerCase();
      return hay.includes(keyword);
    });

    const map = new Map<
      string,
      { id: string; name: string; tools: typeof filtered }
    >();

    for (const t of filtered) {
      const key = t.specialtyId;
      const existing = map.get(key);
      if (existing) existing.tools.push(t);
      else map.set(key, { id: t.specialtyId, name: t.specialtyName, tools: [t] });
    }

    return specialties
      .filter((sp) => map.has(sp.id))
      .map((sp) => map.get(sp.id)!)
      .filter((g) => g.tools.length > 0);
  }, [computed.todo, specialtyFilter, q]);

  const totalTools = allTools.length;
  const doneCount = computed.done.length;

  if (!caseItem) {
    // ✅ Nếu case chưa load kịp hoặc id sai, cho nút về ca hợp lệ
    const fallbackId =
      (activeCaseId && cases.some((c) => c.id === activeCaseId) && activeCaseId) ||
      cases[0]?.id ||
      null;

    return (
      <div className="page">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Không tìm thấy ca</h2>
          <div style={{ color: "var(--muted)", fontWeight: 700 }}>
            Ca có thể đã bị đóng hoặc id không đúng.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button className="btn" type="button" onClick={() => navigate(-1)}>
              ← Trở về
            </button>

            {fallbackId && (
              <button
                className="btnPrimary"
                type="button"
                onClick={() => {
                  setActiveCaseId(fallbackId);
                  navigate(`${prefix}${fallbackId}`);
                }}
              >
                Về ca gần nhất
              </button>
            )}

            <button className="btn" type="button" onClick={() => navigate("/")}>
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const patient = caseItem.patient;
  const age = calcAge(patient.yob);
  const bmi = bmiFrom(patient.weightKg, patient.heightCm);

  const ToolSummaryRow = ({ tool }: { tool: (typeof allTools)[number] }) => {
    const r = latestByTool.get(tool.id);
    const summary = buildSummaryFallback(r);

    return (
      <button
        type="button"
        onClick={() => navigate(tool.route)}
        style={{
          width: "100%",
          textAlign: "left",
          border: "1px solid var(--line)",
          background: "white",
          borderRadius: 14,
          padding: 12,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
        title="Bấm để xem chi tiết trong công cụ"
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tool.name}
          </div>
          <div
            style={{
              marginTop: 4,
              color: "var(--muted)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {summary || "Đã đánh giá"}
          </div>
        </div>

        <div style={{ fontWeight: 900, color: "var(--muted)" }}>→</div>
      </button>
    );
  };

  const ToolTodoRow = ({ tool }: { tool: (typeof allTools)[number] }) => (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 12,
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900 }}>{tool.name}</div>
        <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
          {tool.description}
        </div>
      </div>

      <button className="btn" type="button" onClick={() => navigate(tool.route)}>
        Mở →
      </button>
    </div>
  );

  const DomainBlock = ({
    domain,
    tools,
  }: {
    domain: Domain;
    tools: (typeof allTools)[number][];
  }) => {
    const meta = domainMeta(domain);
    const totalInDomain = allTools.filter((t) => t.domain === domain).length;
    const doneInDomain = computed.done.filter((t) => t.domain === domain).length;

    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, color: "rgba(2,132,199,1)" }}>
              {meta.title}
            </div>
            <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
              {meta.subtitle}
            </div>
          </div>

          <div style={{ color: "rgba(2,132,199,1)", fontWeight: 900, fontSize: 13 }}>
            {doneInDomain}/{totalInDomain} đã đánh giá
          </div>
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {tools.length === 0 ? (
            <div style={{ color: "var(--muted)", fontWeight: 800, padding: "6px 0" }}>
              Chưa có đánh giá {meta.title}.
            </div>
          ) : (
            tools.map((t) => <ToolSummaryRow key={t.id} tool={t} />)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      {/* KHỐI 1: THÔNG TIN CA */}
      <div
        className="card"
        style={{
          marginBottom: 14,
          background: "rgba(2,132,199,0.06)",
          borderColor: "rgba(2,132,199,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Ca bệnh nhân</h1>
            <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 800 }}>
              Thông tin cơ bản • {doneCount}/{totalTools} đã đánh giá
            </div>
          </div>

          <button className="btn" type="button" onClick={() => navigate(-1)}>
            ← Trở về
          </button>
        </div>

        <div style={{ marginTop: 12, background: "white", border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            {patient.name} • {patient.yob} ({age} tuổi) • {patient.sex}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 900 }}>
              Cân nặng: {patient.weightKg ? `${patient.weightKg} kg` : "—"}
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 900 }}>
              Chiều cao: {patient.heightCm ? `${patient.heightCm} cm` : "—"}
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 900 }}>
              BMI:{" "}
              {bmi ? (
                <>
                  {round1(bmi)} •{" "}
                  <span style={{ color: "rgba(2,132,199,1)" }}>{bmiClassAsia(bmi)}</span>
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 2: TỔNG HỢP ĐÃ ĐÁNH GIÁ */}
      <div
        className="card"
        style={{
          marginBottom: 14,
          background: "rgba(2,132,199,0.06)",
          borderColor: "rgba(2,132,199,0.35)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>Tổng hợp đã đánh giá</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
          Chỉ hiển thị kết quả tóm tắt. Bấm vào từng dòng để mở công cụ xem chi tiết.
        </div>

        <DomainBlock domain="bio" tools={computed.doneByDomain.bio} />
        <DomainBlock domain="psycho" tools={computed.doneByDomain.psycho} />
        <DomainBlock domain="social" tools={computed.doneByDomain.social} />
      </div>

      {/* KHỐI 3: CÔNG CỤ CHƯA ĐÁNH GIÁ */}
      <div className="card">
        <div style={{ fontWeight: 900, fontSize: 18 }}>Công cụ chưa đánh giá</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
          Đánh giá xong sẽ tự chuyển lên phần “Tổng hợp đã đánh giá” đúng nhóm BIO/PSYCHO/SOCIAL.
        </div>

        <div className="divider" />

        <div className="formGrid" style={{ marginTop: 0 }}>
          <div className="field field--wide" style={{ gridColumn: "span 6" }}>
            <div className="label">Chuyên khoa</div>
            <select
              className="select"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">Tất cả chuyên khoa</option>
              {specialties.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            <div className="help">Mẹo: chọn “Tất cả” để duyệt toàn bộ bộ công cụ.</div>
          </div>

          <div className="field field--wide" style={{ gridColumn: "span 6" }}>
            <div className="label">Tìm nhanh</div>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm nhanh bằng từ khoá... (vd: score2, qsofa, BMI, centor)"
            />
            <div className="help">Tìm nhanh bằng từ khoá trong tên và mô tả công cụ.</div>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: "grid", gap: 14 }}>
          {todoGroupedBySpecialty.length === 0 ? (
            <div style={{ color: "var(--muted)", fontWeight: 900 }}>
              Không còn công cụ nào chưa đánh giá (hoặc không khớp bộ lọc).
            </div>
          ) : (
            todoGroupedBySpecialty.map((group) => (
              <div
                key={group.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 14,
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16 }}>{group.name}</div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {group.tools.map((t) => (
                    <ToolTodoRow key={t.id} tool={t} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
