import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SymptomLayout from "./SymptomLayout";

type TimeWindow = "6m" | "12m";
type Severity = "mild" | "moderate" | "severe" | "unknown";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ marginTop: 14, borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </section>
  );
}

function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "danger" | "warn" | "ok";
  children: React.ReactNode;
}) {
  const map = {
    neutral: { bg: "#f1f5f9", bd: "#e2e8f0", fg: "#0f172a" },
    danger: { bg: "#fff1f2", bd: "#fecdd3", fg: "#9f1239" },
    warn: { bg: "#fffbeb", bd: "#fde68a", fg: "#92400e" },
    ok: { bg: "#ecfdf5", bd: "#a7f3d0", fg: "#065f46" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: map.bg,
        border: `1px solid ${map.bd}`,
        color: map.fg,
        fontWeight: 800,
        fontSize: 12.5,
      }}
    >
      {children}
    </span>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid var(--line)",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3 }}
      />
      <div>
        <div style={{ fontWeight: 800 }}>{label}</div>
        {hint ? (
          <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 2 }}>
            {hint}
          </div>
        ) : null}
      </div>
    </label>
  );
}

function SmallSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 800 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          height: 38,
          borderRadius: 12,
          border: "1px solid var(--line)",
          padding: "0 10px",
          background: "#fff",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export default function SutCanKhongChuY() {
  // STEP 1: confirm unintentional weight loss
  const [baselineKg, setBaselineKg] = useState<number>(60);
  const [currentKg, setCurrentKg] = useState<number>(56);
  const [window, setWindow] = useState<TimeWindow>("12m");
  const [intentional, setIntentional] = useState(false);

  const pctLoss = useMemo(() => {
    const b = Math.max(0.1, baselineKg);
    const c = clamp(currentKg, 0, 500);
    const pct = ((b - c) / b) * 100;
    return round1(pct);
  }, [baselineKg, currentKg]);

  const meets5pct = pctLoss >= 5;

  const severity: Severity = useMemo(() => {
    if (!Number.isFinite(pctLoss) || pctLoss <= 0) return "unknown";
    if (pctLoss < 5) return "mild";
    if (pctLoss < 10) return "moderate";
    return "severe";
  }, [pctLoss]);

  // STEP 2: red flags / urgent features
  const [rfSevereFatigueSyncope, setRfSevereFatigueSyncope] = useState(false);
  const [rfHypotensionArrhythmia, setRfHypotensionArrhythmia] = useState(false);
  const [rfElectrolyte, setRfElectrolyte] = useState(false);
  const [rfThyrotoxicOrAdrenalCrisis, setRfThyrotoxicOrAdrenalCrisis] = useState(false);
  const [rfSevereInfection, setRfSevereInfection] = useState(false);
  const [rfRapidWasting, setRfRapidWasting] = useState(false);

  // Key “must think” serious groups
  const [suspectCancer, setSuspectCancer] = useState(false);
  const [suspectTBHIVHep, setSuspectTBHIVHep] = useState(false);
  const [suspectEndocrine, setSuspectEndocrine] = useState(false);

  // Step 4 common causes / context
  const [depression, setDepression] = useState(false);
  const [anxiety, setAnxiety] = useState(false);

  const [giSymptoms, setGiSymptoms] = useState(false);
  const [chronicDisease, setChronicDisease] = useState(false);

  // meds / toxins
  const [medMetformin, setMedMetformin] = useState(false);
  const [medDigoxin, setMedDigoxin] = useState(false);
  const [medPsych, setMedPsych] = useState(false);
  const [medSteroid, setMedSteroid] = useState(false);
  const [medHerbalUnknown, setMedHerbalUnknown] = useState(false);

  // Step 5: targeted history checklist (8 core questions)
  const [qDietChange, setQDietChange] = useState(false);
  const [qDiarrheaVomitingDysphagia, setQDiarrheaVomitingDysphagia] = useState(false);
  const [qCoughFeverNightSweats, setQCoughFeverNightSweats] = useState(false);
  const [qPolyuriaPolydipsia, setQPolyuriaPolydipsia] = useState(false);
  const [qLowMoodAnhedonia, setQLowMoodAnhedonia] = useState(false);
  const [qNewMeds, setQNewMeds] = useState(false);
  const [qSocial, setQSocial] = useState(false);

  // Step 6: physical exam checklist
  const [examBMI, setExamBMI] = useState(false);
  const [examWasting, setExamWasting] = useState(false);
  const [examNodes, setExamNodes] = useState(false);
  const [examHSM, setExamHSM] = useState(false);
  const [examThyroid, setExamThyroid] = useState(false);
  const [examSkinMucosa, setExamSkinMucosa] = useState(false);
  const [examDepressionSigns, setExamDepressionSigns] = useState(false);

  // Step 7: initial lab bundle / strategy
  const [labCBC, setLabCBC] = useState(false);
  const [labCRPESR, setLabCRPESR] = useState(false);
  const [labGlucoseA1c, setLabGlucoseA1c] = useState(false);
  const [labLiverKidneyLytes, setLabLiverKidneyLytes] = useState(false);
  const [labUA, setLabUA] = useState(false);
  const [labTSH, setLabTSH] = useState(false);

  const [testCXR, setTestCXR] = useState(false);
  const [testAbdUS, setTestAbdUS] = useState(false);
  const [testEndoscopy, setTestEndoscopy] = useState(false);
  const [testAgeSexScreen, setTestAgeSexScreen] = useState(false);

  const anyRedFlags = useMemo(() => {
    // “Weight loss itself is a warning”, but these are urgent features requiring urgent action
    return (
      rfSevereFatigueSyncope ||
      rfHypotensionArrhythmia ||
      rfElectrolyte ||
      rfThyrotoxicOrAdrenalCrisis ||
      rfSevereInfection ||
      rfRapidWasting
    );
  }, [
    rfSevereFatigueSyncope,
    rfHypotensionArrhythmia,
    rfElectrolyte,
    rfThyrotoxicOrAdrenalCrisis,
    rfSevereInfection,
    rfRapidWasting,
  ]);

  const medsFlag = useMemo(() => {
    return medMetformin || medDigoxin || medPsych || medSteroid || medHerbalUnknown;
  }, [medMetformin, medDigoxin, medPsych, medSteroid, medHerbalUnknown]);

  const likelyCore4 = useMemo(() => {
    const endocrine = suspectEndocrine || qPolyuriaPolydipsia || examThyroid || labTSH;
    const depressionCore = depression || qLowMoodAnhedonia || examDepressionSigns;
    const cancerCore = suspectCancer || examNodes || examHSM || testAgeSexScreen;
    return {
      dmThyroid: endocrine,
      depression: depressionCore,
      cancer: cancerCore,
    };
  }, [
    suspectEndocrine,
    qPolyuriaPolydipsia,
    examThyroid,
    labTSH,
    depression,
    qLowMoodAnhedonia,
    examDepressionSigns,
    suspectCancer,
    examNodes,
    examHSM,
    testAgeSexScreen,
  ]);

  const disposition = useMemo(() => {
    // 0) if intentional diet/exercise: not “unintentional”
    if (intentional) {
      return {
        tone: "neutral" as const,
        title: "Nghi sụt cân có chủ ý → xác nhận mục tiêu và theo dõi",
        bullets: [
          "Nếu bệnh nhân đang ăn kiêng/tập luyện: ghi nhận mục tiêu, đánh giá nguy cơ dinh dưỡng.",
          "Vẫn cân nhắc tầm soát nếu có triệu chứng kèm theo bất thường.",
        ],
      };
    }

    // 1) urgent red flags
    if (anyRedFlags) {
      return {
        tone: "danger" as const,
        title: "Có dấu hiệu nguy kịch → nhập viện / chuyển cấp cứu",
        bullets: [
          "Sụt cân kèm suy kiệt/chóng mặt/ngất, tụt HA/loạn nhịp, rối loạn điện giải, bão giáp/suy thượng thận, nhiễm trùng nặng…",
          "Không theo dõi ngoại trú. Ưu tiên ổn định + chuyển tuyến phù hợp.",
        ],
      };
    }

    // 2) not meeting 5% threshold
    if (!meets5pct) {
      return {
        tone: "ok" as const,
        title: "Chưa đạt ngưỡng ≥5% (6–12 tháng) → theo dõi có kế hoạch",
        bullets: [
          "Đo lại cân nặng đúng chuẩn; hẹn cân lại sau 2–4 tuần hoặc 1–3 tháng tuỳ bối cảnh.",
          "Khai thác ăn uống, tâm lý–xã hội, thuốc; chỉ định xét nghiệm khi có gợi ý.",
        ],
      };
    }

    // 3) meets threshold: outpatient strategy vs refer
    if (severity === "severe" || rfRapidWasting) {
      return {
        tone: "warn" as const,
        title: "Sụt cân mức độ nặng/nhanh → ưu tiên tìm nguyên nhân nguy hiểm & chuyển tuyến sớm",
        bullets: [
          "Chủ động nghĩ và loại trừ: ung thư – nhiễm trùng mạn (lao/HIV/viêm gan) – nội tiết (ĐTĐ/cường giáp…).",
          "Làm gói xét nghiệm nền + cận lâm sàng định hướng; cân nhắc chuyển chuyên khoa nếu nghi ngờ.",
        ],
      };
    }

    return {
      tone: "neutral" as const,
      title: "Sụt cân không chủ ý (≥5%) nhưng không có red flags → đánh giá chiến lược tại phòng khám",
      bullets: [
        "Ưu tiên 4 nhóm luôn phải nghĩ tới: ĐTĐ/cường giáp, trầm cảm, ung thư, nhiễm trùng mạn.",
        "Rà soát thuốc là bắt buộc; khai thác yếu tố xã hội (cô đơn/khó khăn kinh tế).",
        "Làm gói xét nghiệm nền, hẹn theo dõi sát theo thời gian.",
      ],
    };
  }, [intentional, anyRedFlags, meets5pct, severity, rfRapidWasting]);

  const pageTitle = "Sụt cân không chủ ý";
  const subtitle =
    "Xác nhận ≥5%/6–12 tháng → loại trừ nguy kịch → nghĩ ung thư/nhiễm trùng/nội tiết/trầm cảm → xét nghiệm nền có chiến lược → theo dõi sát.";

  return (
    <SymptomLayout title={pageTitle} subtitle={subtitle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <Link
          to="/symptoms"
          style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800 }}
        >
          ← Danh sách triệu chứng
        </Link>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill tone={anyRedFlags ? "danger" : meets5pct ? "warn" : "ok"}>
            {anyRedFlags ? "Có Red flags" : meets5pct ? "≥5% (báo động)" : "<5% (theo dõi)"}
          </Pill>
          <Pill tone={intentional ? "neutral" : "ok"}>
            {intentional ? "Có chủ ý" : "Không chủ ý"}
          </Pill>
          {medsFlag ? <Pill tone="warn">Rà soát thuốc</Pill> : null}
        </div>
      </div>

      <Section title="1️⃣ BƯỚC 1 — Xác nhận “sụt cân không chủ ý”">
        <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Định nghĩa thực hành: <b>giảm ≥5%</b> cân nặng trong <b>6–12 tháng</b> và{" "}
          <b>không do chủ ý</b> (ăn kiêng/tập luyện). Trong YHGĐ: xem như “sụt cân không chủ ý”
          cho đến khi chứng minh ngược lại.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Cân nặng trước đây (kg)</div>
            <input
              className="input"
              type="number"
              value={baselineKg}
              onChange={(e) => setBaselineKg(Number(e.target.value))}
              min={0}
              step={0.1}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Cân nặng hiện tại (kg)</div>
            <input
              className="input"
              type="number"
              value={currentKg}
              onChange={(e) => setCurrentKg(Number(e.target.value))}
              min={0}
              step={0.1}
            />
          </label>

          <SmallSelect<TimeWindow>
            label="Khoảng thời gian"
            value={window}
            onChange={setWindow}
            options={[
              { value: "6m", label: "6 tháng" },
              { value: "12m", label: "12 tháng" },
            ]}
          />

          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 10,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 800 }}>Ước tính sụt cân</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              {pctLoss > 0 ? `${pctLoss}%` : "0%"}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>
              Ngưỡng báo động: <b>≥5%</b> trong {window === "6m" ? "6" : "12"} tháng
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <CheckRow
            label="Bệnh nhân có chủ ý giảm cân (ăn kiêng/tập luyện)"
            checked={intentional}
            onChange={setIntentional}
            hint="Nếu có chủ ý, vẫn đánh giá nếu triệu chứng kèm theo bất thường."
          />
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill tone={meets5pct && !intentional ? "warn" : "ok"}>
            {meets5pct && !intentional ? "Đạt ngưỡng ≥5%" : "Chưa đạt ngưỡng"}
          </Pill>
          <Pill tone={severity === "severe" ? "warn" : "neutral"}>
            Mức độ:{" "}
            {severity === "mild"
              ? "nhẹ"
              : severity === "moderate"
              ? "trung bình"
              : severity === "severe"
              ? "nặng"
              : "chưa rõ"}
          </Pill>
        </div>
      </Section>

      <Section title="2️⃣ BƯỚC 2 — Red flags (dấu hiệu cần hành động khẩn)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill tone="danger">Bản thân sụt cân là 1 dấu báo động</Pill>
          <Pill tone="neutral">Nhưng các dấu dưới đây → nhập viện/chuyển cấp cứu</Pill>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow
            label="Thiếu năng lượng nặng: mệt kiệt/chóng mặt/ngất"
            checked={rfSevereFatigueSyncope}
            onChange={setRfSevereFatigueSyncope}
          />
          <CheckRow
            label="Tụt huyết áp / rối loạn nhịp tim"
            checked={rfHypotensionArrhythmia}
            onChange={setRfHypotensionArrhythmia}
          />
          <CheckRow
            label="Nghi rối loạn điện giải"
            checked={rfElectrolyte}
            onChange={setRfElectrolyte}
          />
          <CheckRow
            label="Bão giáp hoặc suy thượng thận"
            checked={rfThyrotoxicOrAdrenalCrisis}
            onChange={setRfThyrotoxicOrAdrenalCrisis}
          />
          <CheckRow
            label="Nhiễm trùng nặng (lao tiến triển/AIDS muộn/viêm cơ tim cấp…) "
            checked={rfSevereInfection}
            onChange={setRfSevereInfection}
          />
          <CheckRow
            label="Sụt cân nhanh + suy kiệt rõ"
            checked={rfRapidWasting}
            onChange={setRfRapidWasting}
          />
        </div>
      </Section>

      <Section title="3️⃣ BƯỚC 3 — Nhóm nguyên nhân đe doạ tính mạng không được bỏ sót">
        <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Không cần chẩn đoán ngay, nhưng phải chứng minh đã nghĩ tới và loại trừ hợp lý:
          <b> ung thư</b>, <b>nhiễm trùng mạn</b> (lao/HIV/viêm gan…), <b>nội tiết</b> (ĐTĐ/cường giáp/hiếm: suy thượng thận).
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          <CheckRow
            label="Có yếu tố gợi ý ác tính (sụt cân + triệu chứng cơ quan/hạch/đau kéo dài…)"
            checked={suspectCancer}
            onChange={setSuspectCancer}
          />
          <CheckRow
            label="Có yếu tố gợi ý lao/HIV/viêm gan mạn/ký sinh trùng"
            checked={suspectTBHIVHep}
            onChange={setSuspectTBHIVHep}
          />
          <CheckRow
            label="Có yếu tố gợi ý nội tiết (ĐTĐ/cường giáp/suy thượng thận)"
            checked={suspectEndocrine}
            onChange={setSuspectEndocrine}
          />
        </div>
      </Section>

      <Section title="4️⃣ BƯỚC 4 — Nguyên nhân thường gặp trong chăm sóc ban đầu">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow
            label="Trầm cảm (hay bị bỏ sót) / buồn chán – mất hứng thú"
            checked={depression}
            onChange={setDepression}
          />
          <CheckRow label="Lo âu" checked={anxiety} onChange={setAnxiety} />
          <CheckRow
            label="Triệu chứng tiêu hoá (ăn kém, đau bụng, tiêu chảy, nôn, nuốt nghẹn...)"
            checked={giSymptoms}
            onChange={setGiSymptoms}
          />
          <CheckRow
            label="Bệnh mạn tiến triển (suy tim/COPD/CKD...)"
            checked={chronicDisease}
            onChange={setChronicDisease}
          />
        </div>

        <div style={{ marginTop: 12, fontWeight: 900 }}>Thuốc – hoá chất (bắt buộc rà soát)</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 8,
          }}
        >
          <CheckRow label="Metformin" checked={medMetformin} onChange={setMedMetformin} />
          <CheckRow label="Digoxin" checked={medDigoxin} onChange={setMedDigoxin} />
          <CheckRow label="Thuốc tâm thần" checked={medPsych} onChange={setMedPsych} />
          <CheckRow label="Corticoid" checked={medSteroid} onChange={setMedSteroid} />
          <CheckRow
            label="Thuốc dân gian/không rõ thành phần"
            checked={medHerbalUnknown}
            onChange={setMedHerbalUnknown}
          />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Rà soát thuốc là bước bắt buộc</b> trong tiếp cận sụt cân.
        </div>
      </Section>

      <Section title="5️⃣ BƯỚC 5 — Khai thác bệnh sử có mục tiêu (8 câu hỏi cốt lõi)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="Ăn uống có thay đổi?" checked={qDietChange} onChange={setQDietChange} />
          <CheckRow
            label="Có tiêu chảy/nôn/nuốt nghẹn?"
            checked={qDiarrheaVomitingDysphagia}
            onChange={setQDiarrheaVomitingDysphagia}
          />
          <CheckRow
            label="Ho/sốt về chiều/ra mồ hôi đêm?"
            checked={qCoughFeverNightSweats}
            onChange={setQCoughFeverNightSweats}
          />
          <CheckRow
            label="Tiểu nhiều/khát nhiều?"
            checked={qPolyuriaPolydipsia}
            onChange={setQPolyuriaPolydipsia}
          />
          <CheckRow
            label="Buồn chán/mất hứng thú?"
            checked={qLowMoodAnhedonia}
            onChange={setQLowMoodAnhedonia}
          />
          <CheckRow
            label="Có thuốc mới/đổi thuốc gần đây?"
            checked={qNewMeds}
            onChange={setQNewMeds}
          />
          <CheckRow
            label="Yếu tố xã hội (cô đơn/khó khăn kinh tế)?"
            checked={qSocial}
            onChange={setQSocial}
          />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          Mấu chốt: “sụt bao nhiêu kg – trong bao lâu” + triệu chứng cơ quan + thuốc + yếu tố xã hội.
        </div>
      </Section>

      <Section title="6️⃣ Khám lâm sàng có trọng điểm">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="Cân nặng / BMI" checked={examBMI} onChange={setExamBMI} />
          <CheckRow label="Dấu suy kiệt / teo cơ" checked={examWasting} onChange={setExamWasting} />
          <CheckRow label="Hạch ngoại biên" checked={examNodes} onChange={setExamNodes} />
          <CheckRow label="Gan/lách to" checked={examHSM} onChange={setExamHSM} />
          <CheckRow label="Tuyến giáp" checked={examThyroid} onChange={setExamThyroid} />
          <CheckRow label="Da – niêm mạc" checked={examSkinMucosa} onChange={setExamSkinMucosa} />
          <CheckRow
            label="Dấu trầm cảm"
            checked={examDepressionSigns}
            onChange={setExamDepressionSigns}
          />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          Khám kỹ giúp định hướng phần lớn nguyên nhân (đặc biệt: suy kiệt, hạch, gan lách, tuyến giáp, trầm cảm).
        </div>
      </Section>

      <Section title="7️⃣ Cận lâm sàng — chỉ định có chiến lược">
        <div style={{ fontWeight: 900, marginBottom: 8 }}>7.1 Gói xét nghiệm ban đầu (đa số bệnh nhân)</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="CTM" checked={labCBC} onChange={setLabCBC} />
          <CheckRow label="CRP / ESR" checked={labCRPESR} onChange={setLabCRPESR} />
          <CheckRow label="Glucose ± HbA1c" checked={labGlucoseA1c} onChange={setLabGlucoseA1c} />
          <CheckRow
            label="Gan – thận – điện giải"
            checked={labLiverKidneyLytes}
            onChange={setLabLiverKidneyLytes}
          />
          <CheckRow label="Tổng phân tích nước tiểu" checked={labUA} onChange={setLabUA} />
          <CheckRow label="TSH" checked={labTSH} onChange={setLabTSH} />
        </div>

        <div style={{ marginTop: 12, fontWeight: 900 }}>7.2 Theo định hướng</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 8,
          }}
        >
          <CheckRow label="X-quang phổi" checked={testCXR} onChange={setTestCXR} />
          <CheckRow label="Siêu âm bụng" checked={testAbdUS} onChange={setTestAbdUS} />
          <CheckRow label="Nội soi tiêu hoá" checked={testEndoscopy} onChange={setTestEndoscopy} />
          <CheckRow
            label="Tầm soát ung thư theo tuổi–giới"
            checked={testAgeSexScreen}
            onChange={setTestAgeSexScreen}
          />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          Nguyên tắc: <b>không làm tràn lan</b>; làm gói nền cho đa số, sau đó mở rộng theo định hướng.
        </div>
      </Section>

      <Section title="8️⃣ Quyết định xử trí tại phòng khám">
        <div
          style={{
            borderRadius: 16,
            border: "1px solid var(--line)",
            padding: 14,
            background:
              disposition.tone === "danger"
                ? "#fff1f2"
                : disposition.tone === "warn"
                ? "#fffbeb"
                : disposition.tone === "ok"
                ? "#ecfdf5"
                : "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Pill tone={disposition.tone}>
              {disposition.tone === "danger"
                ? "CHUYỂN VIỆN"
                : disposition.tone === "warn"
                ? "ƯU TIÊN"
                : disposition.tone === "ok"
                ? "THEO DÕI"
                : "CHIẾN LƯỢC"}
            </Pill>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{disposition.title}</div>
          </div>

          <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            {disposition.bullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>

          {!anyRedFlags && meets5pct && !intentional ? (
            <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
              <b>Theo dõi sát:</b> cân lại theo mốc thời gian, đánh giá đáp ứng ăn uống–tâm lý–xã hội,
              xem lại thuốc, và xem xét mở rộng xét nghiệm nếu không cải thiện.
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill tone={likelyCore4.dmThyroid ? "warn" : "neutral"}>Nghĩ ĐTĐ/Cường giáp</Pill>
          <Pill tone={likelyCore4.depression ? "warn" : "neutral"}>Nghĩ Trầm cảm</Pill>
          <Pill tone={likelyCore4.cancer ? "warn" : "neutral"}>Nghĩ Ung thư</Pill>
          <Pill tone={suspectTBHIVHep ? "warn" : "neutral"}>Nghĩ Nhiễm trùng mạn</Pill>
        </div>
      </Section>

      <Section title="🔁 Tóm tắt thuật toán 1 trang">
        <div
          style={{
            border: "1px dashed var(--line)",
            borderRadius: 14,
            padding: 12,
            background: "#fff",
            lineHeight: 1.7,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            SỤT CÂN → ≥5%/{window === "6m" ? "6" : "12"} tháng?
          </div>
          <div>
            → <b>Không</b> → theo dõi, cân lại theo thời gian. <br />
            → <b>Có</b> → <b>Red flags?</b> <br />
            → <b>Có</b> → nhập viện / chuyển tuyến. <br />
            → <b>Không</b> → nghĩ <b>ung thư – nhiễm trùng mạn – nội tiết – trầm cảm</b> → làm xét nghiệm nền →
            theo dõi sát.
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Kết luận thực hành:</b> Sụt cân không chủ ý là <b>chứng báo động</b>. Trong YHGĐ: không bỏ sót bệnh
          nặng, không làm xét nghiệm tràn lan, theo dõi liên tục theo thời gian.{" "}
          <b>ĐTĐ/cường giáp, trầm cảm, ung thư, nhiễm trùng mạn</b> là 4 nhóm luôn phải nghĩ tới.
        </div>
      </Section>
    </SymptomLayout>
  );
}
