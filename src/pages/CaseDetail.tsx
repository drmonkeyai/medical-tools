import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCases,
  type Patient,
  type CaseItem,
  type ToolResult,
} from "../context/CasesContext";
import { specialties } from "../data/tools";
import type { Tool } from "../data/tools";

type Domain = "bio" | "psycho" | "social";

type ToolItem = Tool & {
  specialtyId: string;
  specialtyName: string;
  domain: Domain;
};

type EvaluationVitals = {
  systolicBp?: number;
  diastolicBp?: number;
  pulse?: number;
  temperatureC?: number;
  respiratoryRate?: number;
  spo2?: number;
  waistCm?: number;
  weightKg?: number;
  heightCm?: number;
  bmi: number | null;
};

type DetailTab =
  | "overview"
  | "ice"
  | "risk"
  | "bps"
  | "treatment"
  | "immunization";

function calcAge(yob: number) {
  const year = new Date().getFullYear();
  return Math.max(0, year - yob);
}

function formatDateTime(iso?: string) {
  if (!iso) return "Chưa có";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(iso?: string) {
  if (!iso) return "Chưa có";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

function bmiFrom(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  if (h <= 0) return null;
  return weightKg / (h * h);
}

function bmiClassAsian(bmi: number) {
  if (bmi < 18.5) return "Gầy";
  if (bmi < 23) return "Bình thường";
  if (bmi < 25) return "Thừa cân";
  return "Béo phì";
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

function domainTitle(domain: Domain) {
  if (domain === "bio") return "BIO";
  if (domain === "psycho") return "PSYCHO";
  return "SOCIAL";
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function findNumericValue(source: unknown, candidates: string[]): number | undefined {
  const obj = asObject(source);
  if (!obj) return undefined;

  for (const key of candidates) {
    const raw = obj[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      const normalized = raw.replace(",", ".");
      const n = Number(normalized);
      if (Number.isFinite(n)) return n;
    }
  }

  for (const value of Object.values(obj)) {
    const nested = asObject(value);
    if (!nested) continue;

    for (const key of candidates) {
      const raw = nested[key];
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      if (typeof raw === "string" && raw.trim()) {
        const normalized = raw.replace(",", ".");
        const n = Number(normalized);
        if (Number.isFinite(n)) return n;
      }
    }
  }

  return undefined;
}

function renderSimpleValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value ?? "");
  }
}

function getResultSummary(result?: ToolResult) {
  if (!result) return "Chưa có kết quả";

  if (typeof result.summary === "string" && result.summary.trim()) {
    return result.summary.trim();
  }

  if (
    result.outputs &&
    typeof result.outputs === "object" &&
    "summary" in (result.outputs as Record<string, unknown>)
  ) {
    const value = (result.outputs as Record<string, unknown>).summary;
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const outputs = asObject(result.outputs);
  if (outputs) {
    const total = outputs.total;
    const level = outputs.level;
    if (typeof total !== "undefined" && typeof level !== "undefined") {
      return `${String(total)} điểm • ${String(level)}`;
    }
  }

  return "Đã lưu kết quả đánh giá.";
}

function getEvaluationVitals(result?: ToolResult): EvaluationVitals {
  if (!result) {
    return { bmi: null };
  }

  const systolicBp =
    findNumericValue(result.inputs, ["systolicBp", "sbp", "hatt", "sys", "tamThu"]) ??
    findNumericValue(result.outputs, ["systolicBp", "sbp", "hatt", "sys", "tamThu"]);

  const diastolicBp =
    findNumericValue(result.inputs, ["diastolicBp", "dbp", "hattr", "dia", "tamTruong"]) ??
    findNumericValue(result.outputs, ["diastolicBp", "dbp", "hattr", "dia", "tamTruong"]);

  const pulse =
    findNumericValue(result.inputs, ["pulse", "heartRate", "mach", "nhipTim"]) ??
    findNumericValue(result.outputs, ["pulse", "heartRate", "mach", "nhipTim"]);

  const temperatureC =
    findNumericValue(result.inputs, ["temperature", "temperatureC", "nhietDo", "temp"]) ??
    findNumericValue(result.outputs, ["temperature", "temperatureC", "nhietDo", "temp"]);

  const respiratoryRate =
    findNumericValue(result.inputs, ["respiratoryRate", "nhipTho", "rr"]) ??
    findNumericValue(result.outputs, ["respiratoryRate", "nhipTho", "rr"]);

  const spo2 =
    findNumericValue(result.inputs, ["spo2", "SpO2", "oxySat"]) ??
    findNumericValue(result.outputs, ["spo2", "SpO2", "oxySat"]);

  const waistCm =
    findNumericValue(result.inputs, ["waistCm", "waist", "vongEo"]) ??
    findNumericValue(result.outputs, ["waistCm", "waist", "vongEo"]);

  const weightKg =
    findNumericValue(result.inputs, ["weightKg", "weight", "canNang", "weight_kg", "cannang"]) ??
    findNumericValue(result.outputs, ["weightKg", "weight", "canNang", "weight_kg", "cannang"]);

  const heightCm =
    findNumericValue(result.inputs, ["heightCm", "height", "chieuCao", "height_cm", "chieucao"]) ??
    findNumericValue(result.outputs, ["heightCm", "height", "chieuCao", "height_cm", "chieucao"]);

  return {
    systolicBp,
    diastolicBp,
    pulse,
    temperatureC,
    respiratoryRate,
    spo2,
    waistCm,
    weightKg,
    heightCm,
    bmi: bmiFrom(weightKg, heightCm),
  };
}

function structuredRowsForResult(result?: ToolResult) {
  if (!result) return [];

  const inputs = asObject(result.inputs);
  const outputs = asObject(result.outputs);
  const rows: Array<{ label: string; value: unknown }> = [];

  if (outputs) {
    if ("total" in outputs) rows.push({ label: "Tổng điểm", value: outputs.total });
    if ("max" in outputs) rows.push({ label: "Điểm tối đa", value: outputs.max });
    if ("level" in outputs) rows.push({ label: "Mức độ", value: outputs.level });
    if ("interpretation" in outputs) rows.push({ label: "Diễn giải", value: outputs.interpretation });
    if ("suicideFlag" in outputs) rows.push({ label: "Cờ nguy cơ tự sát", value: outputs.suicideFlag });
  }

  if (inputs) {
    if ("difficulty" in inputs) rows.push({ label: "Ảnh hưởng chức năng", value: inputs.difficulty });
  }

  return rows;
}

function buildStructuredHtml(result?: ToolResult) {
  const rows = structuredRowsForResult(result);
  if (!rows.length) {
    return `<div>Chưa có mẫu hiển thị riêng cho công cụ này.</div>`;
  }

  return rows
    .map(
      (row) => `
      <div style="margin-bottom:8px;">
        <strong>${row.label}:</strong> ${renderSimpleValue(row.value)}
      </div>
    `
    )
    .join("");
}

function buildPrintHtml(args: {
  patientName: string;
  patientAge: string;
  patientSex: string;
  occupation: string;
  evaluationDate: string;
  toolName: string;
  specialtyName: string;
  domainName: string;
  summary: string;
  bpText: string;
  pulseText: string;
  tempText: string;
  respText: string;
  spo2Text: string;
  waistText: string;
  weightText: string;
  heightText: string;
  bmiText: string;
  detailsHtml: string;
  inputsText: string;
  outputsText: string;
}) {
  return `
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Phieu danh gia ca benh</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      margin: 24px;
      line-height: 1.5;
      font-size: 14px;
    }
    h1, h2 {
      margin: 0 0 10px 0;
    }
    .section {
      padding: 10px 0 14px 0;
      border-bottom: 1px solid #111827;
    }
    .section:first-of-type {
      border-top: 1px solid #111827;
    }
    .grid {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 8px 12px;
    }
    .label {
      font-weight: 700;
    }
    pre {
      padding: 8px 0 0 0;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 12px;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>Ca bệnh nhân</h1>

  <div class="section">
    <h2>Thông tin bệnh nhân</h2>
    <div class="grid">
      <div class="label">Bệnh nhân</div><div>${args.patientName}</div>
      <div class="label">Tuổi</div><div>${args.patientAge}</div>
      <div class="label">Giới tính</div><div>${args.patientSex}</div>
      <div class="label">Nghề nghiệp</div><div>${args.occupation}</div>
      <div class="label">Ngày đánh giá</div><div>${args.evaluationDate}</div>
    </div>
  </div>

  <div class="section">
    <h2>Sinh hiệu / chỉ số</h2>
    <div class="grid">
      <div class="label">Huyết áp</div><div>${args.bpText}</div>
      <div class="label">Mạch</div><div>${args.pulseText}</div>
      <div class="label">Nhiệt độ</div><div>${args.tempText}</div>
      <div class="label">Nhịp thở</div><div>${args.respText}</div>
      <div class="label">SpO2</div><div>${args.spo2Text}</div>
      <div class="label">Vòng eo</div><div>${args.waistText}</div>
      <div class="label">Cân nặng</div><div>${args.weightText}</div>
      <div class="label">Chiều cao</div><div>${args.heightText}</div>
      <div class="label">BMI</div><div>${args.bmiText}</div>
    </div>
  </div>

  <div class="section">
    <h2>Đánh giá</h2>
    <div class="grid">
      <div class="label">Công cụ</div><div>${args.toolName}</div>
      <div class="label">Chuyên đề</div><div>${args.specialtyName}</div>
      <div class="label">Nhóm</div><div>${args.domainName}</div>
      <div class="label">Tóm tắt</div><div>${args.summary}</div>
    </div>
  </div>

  <div class="section">
    <h2>Chi tiết đánh giá</h2>
    ${args.detailsHtml}
  </div>

  <div class="section">
    <h2>Dữ liệu đầu vào</h2>
    <pre>${args.inputsText}</pre>
  </div>

  <div class="section">
    <h2>Dữ liệu đầu ra</h2>
    <pre>${args.outputsText}</pre>
  </div>
</body>
</html>
  `;
}

function getEvaluationKey(result: ToolResult, index: number) {
  return result.id ?? `${result.tool}-${result.when}-${index}`;
}

function GridCell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        borderRight: "1px solid #111827",
        borderBottom: "1px solid #111827",
        padding: 8,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SidebarEvalButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        background: active ? "#f3f4f6" : "transparent",
        textAlign: "left",
        padding: "6px 4px",
        cursor: "pointer",
        fontWeight: active ? 800 : 600,
        color: "#111827",
      }}
    >
      {label}
    </button>
  );
}

function TabHeaderButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        background: active ? "#f3f4f6" : "transparent",
        textAlign: "left",
        padding: 0,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: active ? 800 : 500,
        color: "#111827",
      }}
    >
      {label}
    </button>
  );
}

function LabelText({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontWeight: 700 }}>{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div style={{ color: "#475569", lineHeight: 1.7 }}>
      {text}
    </div>
  );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <pre
        style={{
          margin: 0,
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "auto",
          lineHeight: 1.6,
        }}
      >
        {prettyJson(data)}
      </pre>
    </div>
  );
}

function OverviewTab({
  selectedEvaluation,
  selectedTool,
}: {
  selectedEvaluation: ToolResult | null;
  selectedTool: ToolItem | null;
}) {
  if (!selectedEvaluation) {
    return <EmptyText text="Chưa có lần đánh giá nào được chọn." />;
  }

  return (
    <div>
      <LabelText label="Công cụ" value={selectedTool?.name ?? selectedEvaluation.tool} />
      <LabelText
        label="Chuyên đề"
        value={selectedTool?.specialtyName ?? "Chưa phân loại"}
      />
      <LabelText
        label="Nhóm"
        value={selectedTool ? domainTitle(selectedTool.domain) : "—"}
      />
      <LabelText
        label="Tóm tắt"
        value={getResultSummary(selectedEvaluation)}
      />
    </div>
  );
}

function IceTab() {
  return (
    <div>
      <LabelText label="Ideas" value="Chưa cập nhật" />
      <LabelText label="Concerns" value="Chưa cập nhật" />
      <LabelText label="Expectations" value="Chưa cập nhật" />
    </div>
  );
}

function RiskTab() {
  return (
    <div>
      <LabelText
        label="Tim mạch – chuyển hoá"
        value="Chưa cập nhật tăng huyết áp, đái tháo đường, rối loạn lipid, béo phì, tiền sử tim mạch."
      />
      <LabelText
        label="Hành vi – lối sống"
        value="Chưa cập nhật hút thuốc, rượu bia, vận động thể lực, giấc ngủ, dinh dưỡng."
      />
      <LabelText
        label="Gia đình – môi trường"
        value="Chưa cập nhật tiền sử gia đình, nghề nghiệp, phơi nhiễm môi trường và yếu tố xã hội liên quan."
      />
    </div>
  );
}

function BpsTab({
  selectedEvaluation,
}: {
  selectedEvaluation: ToolResult | null;
}) {
  if (!selectedEvaluation) {
    return <EmptyText text="Chưa có dữ liệu đánh giá." />;
  }

  const rows = structuredRowsForResult(selectedEvaluation);

  return (
    <div>
      {rows.length ? (
        rows.map((row) => (
          <LabelText
            key={row.label}
            label={row.label}
            value={renderSimpleValue(row.value)}
          />
        ))
      ) : (
        <EmptyText text="Chưa có mẫu hiển thị riêng cho công cụ này." />
      )}

      <JsonBlock title="Input JSON" data={selectedEvaluation.inputs} />
      <JsonBlock title="Output JSON" data={selectedEvaluation.outputs} />
    </div>
  );
}

function TreatmentTab() {
  return (
    <div>
      <LabelText label="Chẩn đoán" value="Chưa cập nhật" />
      <LabelText label="Thuốc đang dùng" value="Chưa cập nhật" />
      <LabelText label="Kế hoạch can thiệp" value="Chưa cập nhật" />
      <LabelText label="Lời dặn / theo dõi" value="Chưa cập nhật" />
    </div>
  );
}

function ImmunizationTab() {
  return (
    <div>
      <LabelText label="Tình trạng tiêm chủng" value="Chưa cập nhật" />
      <LabelText
        label="Khuyến nghị"
        value="Có thể bổ sung cúm, phế cầu, viêm gan B, uốn ván, HPV, COVID-19... theo nhóm tuổi và nguy cơ."
      />
    </div>
  );
}

export default function CaseDetail() {
  const nav = useNavigate();
  const { caseId } = useParams();

  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    updateCasePatient,
  } = useCases();

  const caseFromUrl = useMemo(() => {
    if (!caseId) return null;
    return cases.find((c) => c.id === caseId) ?? null;
  }, [cases, caseId]);

  const caze: CaseItem | null = caseFromUrl ?? activeCase ?? null;

  useEffect(() => {
    if (!caseId) return;
    if (activeCaseId !== caseId) {
      const exists = cases.some((c) => c.id === caseId);
      if (exists) setActiveCaseId(caseId);
    }
  }, [caseId, activeCaseId, cases, setActiveCaseId]);

  const urlIdInvalid = useMemo(() => {
    if (!caseId) return false;
    return !cases.some((c) => c.id === caseId);
  }, [caseId, cases]);

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

  const toolMap = useMemo(() => {
    const map = new Map<string, ToolItem>();
    for (const t of allTools) {
      map.set(t.id, t);
    }
    return map;
  }, [allTools]);

  const sortedResults = useMemo(() => {
    if (!caze?.results?.length) return [];
    return [...caze.results].sort((a, b) =>
      String(b.when).localeCompare(String(a.when))
    );
  }, [caze]);

  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  useEffect(() => {
    if (!sortedResults.length) {
      setSelectedEvalId(null);
      return;
    }

    setSelectedEvalId((prev) => {
      if (prev && sortedResults.some((r, index) => getEvaluationKey(r, index) === prev)) {
        return prev;
      }
      return getEvaluationKey(sortedResults[0], 0);
    });
  }, [sortedResults]);

  const selectedEvaluation = useMemo(() => {
    if (!sortedResults.length) return null;
    if (!selectedEvalId) return sortedResults[0];

    return (
      sortedResults.find((r, index) => getEvaluationKey(r, index) === selectedEvalId) ??
      sortedResults[0]
    );
  }, [sortedResults, selectedEvalId]);

  const selectedTool = useMemo(() => {
    if (!selectedEvaluation) return null;
    return toolMap.get(selectedEvaluation.tool) ?? null;
  }, [selectedEvaluation, toolMap]);

  const selectedVitals = useMemo(() => {
    return getEvaluationVitals(selectedEvaluation ?? undefined);
  }, [selectedEvaluation]);

  const selectedBmiText = useMemo(() => {
    if (!selectedVitals.bmi) return "—";
    const rounded = Math.round(selectedVitals.bmi * 10) / 10;
    return `${rounded} • ${bmiClassAsian(rounded)}`;
  }, [selectedVitals]);

  const bloodPressureText = useMemo(() => {
    if (!selectedVitals.systolicBp && !selectedVitals.diastolicBp) return "—";
    if (selectedVitals.systolicBp && selectedVitals.diastolicBp) {
      return `${selectedVitals.systolicBp}/${selectedVitals.diastolicBp} mmHg`;
    }
    return `${selectedVitals.systolicBp ?? "—"}/${selectedVitals.diastolicBp ?? "—"} mmHg`;
  }, [selectedVitals]);

  const ageText = useMemo(() => {
    if (!caze) return "—";
    return `${calcAge(caze.patient.yob)} tuổi`;
  }, [caze]);

  const occupationText = "Chưa cập nhật";
  const redFlagText = "Chưa cập nhật";

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Patient | null>(null);

  useEffect(() => {
    if (!caze) return;
    setDraft({ ...caze.patient });
  }, [caze?.id]);

  function handlePrintSelectedEvaluation() {
    if (!caze || !selectedEvaluation) {
      window.alert("Chưa có lần đánh giá để in.");
      return;
    }

    const html = buildPrintHtml({
      patientName: caze.patient.name || "Chưa có tên",
      patientAge: ageText,
      patientSex: caze.patient.sex || "—",
      occupation: occupationText,
      evaluationDate: formatDateTime(selectedEvaluation.when),
      toolName: selectedTool?.name ?? selectedEvaluation.tool,
      specialtyName: selectedTool?.specialtyName ?? "Chưa phân loại",
      domainName: selectedTool ? domainTitle(selectedTool.domain) : "—",
      summary: getResultSummary(selectedEvaluation),
      bpText: bloodPressureText,
      pulseText: selectedVitals.pulse ? `${selectedVitals.pulse} lần/phút` : "—",
      tempText: selectedVitals.temperatureC ? `${selectedVitals.temperatureC} °C` : "—",
      respText: selectedVitals.respiratoryRate ? `${selectedVitals.respiratoryRate} lần/phút` : "—",
      spo2Text: selectedVitals.spo2 ? `${selectedVitals.spo2} %` : "—",
      waistText: selectedVitals.waistCm ? `${selectedVitals.waistCm} cm` : "—",
      weightText: selectedVitals.weightKg ? `${selectedVitals.weightKg} kg` : "—",
      heightText: selectedVitals.heightCm ? `${selectedVitals.heightCm} cm` : "—",
      bmiText: selectedBmiText,
      detailsHtml: buildStructuredHtml(selectedEvaluation),
      inputsText: prettyJson(selectedEvaluation.inputs),
      outputsText: prettyJson(selectedEvaluation.outputs),
    });

    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) {
      window.alert("Trình duyệt đang chặn cửa sổ in.");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
    }, 300);
  }

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            selectedEvaluation={selectedEvaluation}
            selectedTool={selectedTool}
          />
        );
      case "ice":
        return <IceTab />;
      case "risk":
        return <RiskTab />;
      case "bps":
        return <BpsTab selectedEvaluation={selectedEvaluation} />;
      case "treatment":
        return <TreatmentTab />;
      case "immunization":
        return <ImmunizationTab />;
      default:
        return null;
    }
  };

  return (
    <div className="page" style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          border: "1px solid #111827",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 180px",
            borderBottom: "1px solid #111827",
          }}
        >
          <GridCell style={{ borderBottom: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              Thông tin hành chính – Ngày giờ đánh giá
            </div>
            <div style={{ paddingLeft: 14, lineHeight: 1.7 }}>
              <div>
                - {caze.patient.name || "Chưa có tên"} - {ageText} - {caze.patient.sex || "—"}
              </div>
              <div>- {occupationText}</div>
              <div>- {selectedEvaluation ? formatDateTime(selectedEvaluation.when) : "Chưa có"}</div>
            </div>
          </GridCell>

          <div
            style={{
              borderBottom: "1px solid #111827",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <button className="btn" type="button" onClick={handlePrintSelectedEvaluation}>
              In
            </button>
            <button className="btn" type="button" onClick={() => setEditOpen(true)}>
              Chỉnh sửa
            </button>
            <button className="btn" type="button" onClick={() => nav(-1)}>
              Lùi
            </button>
          </div>
        </div>

        <div
          style={{
            borderBottom: "1px solid #111827",
            padding: 8,
            lineHeight: 1.7,
          }}
        >
          <span style={{ fontWeight: 700 }}>Sinh hiệu:</span>{" "}
          Huyết áp {bloodPressureText}; Mạch{" "}
          {selectedVitals.pulse ? `${selectedVitals.pulse} lần/phút` : "—"}; Nhiệt độ{" "}
          {selectedVitals.temperatureC ? `${selectedVitals.temperatureC} °C` : "—"}; Nhịp thở{" "}
          {selectedVitals.respiratoryRate ? `${selectedVitals.respiratoryRate} lần/phút` : "—"}; SpO2{" "}
          {selectedVitals.spo2 ? `${selectedVitals.spo2} %` : "—"}; Cân nặng{" "}
          {selectedVitals.weightKg ? `${selectedVitals.weightKg} kg` : "—"}; Chiều cao{" "}
          {selectedVitals.heightCm ? `${selectedVitals.heightCm} cm` : "—"}; BMI {selectedBmiText}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px repeat(6, minmax(0, 1fr))",
            minHeight: 520,
          }}
        >
          <GridCell style={{ borderBottom: "none" }}>
            <div style={{ fontWeight: 700 }}>Lần đánh giá</div>
            <div style={{ marginTop: 8 }}>
              {!sortedResults.length ? (
                <EmptyText text="Chưa có." />
              ) : (
                sortedResults.map((result, index) => {
                  const key = getEvaluationKey(result, index);
                  const active = key === selectedEvalId;
                  return (
                    <SidebarEvalButton
                      key={key}
                      active={active}
                      label={formatDateOnly(result.when)}
                      onClick={() => setSelectedEvalId(key)}
                    />
                  );
                })
              )}
            </div>
          </GridCell>

          <GridCell style={{ borderBottom: "none" }}>
            <TabHeaderButton
              active={activeTab === "overview"}
              label="Tổng quan"
              onClick={() => setActiveTab("overview")}
            />
            <div style={{ marginTop: 10 }}>{activeTab === "overview" ? renderTabContent() : null}</div>
          </GridCell>

          <GridCell style={{ borderBottom: "none" }}>
            <TabHeaderButton
              active={activeTab === "ice"}
              label="ICE"
              onClick={() => setActiveTab("ice")}
            />
            <div style={{ marginTop: 10 }}>{activeTab === "ice" ? renderTabContent() : null}</div>
          </GridCell>

          <GridCell style={{ borderBottom: "none" }}>
            <TabHeaderButton
              active={activeTab === "risk"}
              label="Yếu tố nguy cơ"
              onClick={() => setActiveTab("risk")}
            />
            <div style={{ marginTop: 10 }}>{activeTab === "risk" ? renderTabContent() : null}</div>
          </GridCell>

          <GridCell style={{ borderBottom: "none" }}>
            <TabHeaderButton
              active={activeTab === "bps"}
              label="BIO PSYCHO SOCIAL"
              onClick={() => setActiveTab("bps")}
            />
            <div style={{ marginTop: 10 }}>{activeTab === "bps" ? renderTabContent() : null}</div>
          </GridCell>

          <GridCell style={{ borderBottom: "none" }}>
            <TabHeaderButton
              active={activeTab === "treatment"}
              label="Kế hoạch can thiệp"
              onClick={() => setActiveTab("treatment")}
            />
            <div style={{ marginTop: 10 }}>
              {activeTab === "treatment" ? renderTabContent() : null}
            </div>
          </GridCell>

          <GridCell style={{ borderRight: "none", borderBottom: "none" }}>
            <TabHeaderButton
              active={activeTab === "immunization"}
              label="Tiêm ngừa"
              onClick={() => setActiveTab("immunization")}
            />
            <div style={{ marginTop: 10 }}>
              {activeTab === "immunization" ? renderTabContent() : null}
            </div>
          </GridCell>
        </div>

        <div
          style={{
            borderTop: "1px solid #111827",
            padding: "8px 10px",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700 }}>Red flag:</span>
          <span>{redFlagText}</span>
        </div>
      </div>

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
              border: "1px solid #111827",
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>Chỉnh sửa thông tin ca</div>
              <button className="btn" type="button" onClick={() => setEditOpen(false)}>
                ×
              </button>
            </div>

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
                  onChange={(e) =>
                    setDraft({ ...draft, yob: Number(e.target.value) })
                  }
                />
              </div>

              <div className="field">
                <label className="label">Giới</label>
                <select
                  className="select"
                  value={draft.sex}
                  onChange={(e) =>
                    setDraft({ ...draft, sex: e.target.value as Patient["sex"] })
                  }
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="field">
                <label className="label">Cân nặng mặc định (nếu có)</label>
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
                <label className="label">Chiều cao mặc định (nếu có)</label>
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 14,
              }}
            >
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