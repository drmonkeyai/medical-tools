type GenericRecord = Record<string, unknown>;

type ItemSectionData = {
  items?: GenericRecord[];
} | null | undefined;

type Props = {
  assessment?: {
    chief_complaint?: string | null;
    assessment_date?: string | null;
    is_red_flag_present?: boolean | null;
  } | null;
  snapshotData?: unknown;
  vitals?: GenericRecord | null;
  redFlags?: ItemSectionData;
  clinicalNote?: GenericRecord | null;
  diagnoses?: ItemSectionData;
  plan?: ItemSectionData;
  observations?: ItemSectionData;
  assessmentId?: string;
  onChanged?: () => Promise<void> | void;
};

function asText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "boolean") return value ? "Có" : "Không";
  return "";
}

function getText(data: GenericRecord | null | undefined, keys: string[]) {
  if (!data) return "";
  for (const key of keys) {
    const value = data[key];
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function getNumber(data: GenericRecord | null | undefined, keys: string[]) {
  if (!data) return null;
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && !Number.isNaN(value)) return value;
  }
  return null;
}

function getItems(section: ItemSectionData) {
  if (!section) return [];
  if (Array.isArray(section.items)) {
    return section.items.filter(Boolean) as GenericRecord[];
  }
  return [];
}

function compactText(value: string, maxLength = 240) {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

function formatVitalsSummary(vitals?: GenericRecord | null) {
  if (!vitals) return "Chưa ghi nhận sinh hiệu tóm tắt.";

  const systolic = getNumber(vitals, ["systolic_bp"]);
  const diastolic = getNumber(vitals, ["diastolic_bp"]);
  const heartRate = getNumber(vitals, ["heart_rate"]);
  const temperature = getNumber(vitals, ["temperature_c"]);
  const respiratoryRate = getNumber(vitals, ["respiratory_rate"]);
  const spo2 = getNumber(vitals, ["spo2_percent"]);
  const height = getNumber(vitals, ["height_cm"]);
  const weight = getNumber(vitals, ["weight_kg"]);
  const bmi = getNumber(vitals, ["bmi"]);

  const bloodPressure =
    systolic !== null && diastolic !== null ? `${systolic}/${diastolic} mmHg` : "";

  const parts = [
    bloodPressure ? `HA ${bloodPressure}` : "",
    heartRate !== null ? `Mạch ${heartRate} bpm` : "",
    temperature !== null ? `Nhiệt độ ${temperature} °C` : "",
    respiratoryRate !== null ? `Nhịp thở ${respiratoryRate} /phút` : "",
    spo2 !== null ? `SpO2 ${spo2} %` : "",
    height !== null ? `Chiều cao ${height} cm` : "",
    weight !== null ? `Cân nặng ${weight} kg` : "",
    bmi !== null ? `BMI ${bmi}` : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : "Chưa ghi nhận sinh hiệu tóm tắt.";
}

function formatRedFlagSummary(
  assessment?: Props["assessment"],
  redFlags?: ItemSectionData
) {
  const items = getItems(redFlags);

  const presentFlags = items.filter((item) => {
    const isPresent = item.isPresent ?? item.is_present ?? item.present;
    return isPresent === true;
  });

  if (presentFlags.length > 0) {
    const names = presentFlags
      .map((item) =>
        getText(item, ["flagName", "flag_name", "label", "name", "title", "code"])
      )
      .filter(Boolean);

    if (names.length > 0) {
      return `Có red flag: ${names.slice(0, 4).join(", ")}${
        names.length > 4 ? "..." : ""
      }`;
    }

    return "Có red flag trong lần đánh giá hiện tại.";
  }

  if (assessment?.is_red_flag_present) {
    return "Có red flag trong lần đánh giá hiện tại.";
  }

  return "Không ghi nhận red flag nổi bật.";
}

function formatObservationItem(item: GenericRecord) {
  const label = getText(item, [
    "observationLabel",
    "observation_label",
    "label",
    "title",
    "name",
    "observation_code",
    "code",
  ]);

  const numeric = getText(item, ["valueNumeric", "value_numeric"]);
  const text = getText(item, ["valueText", "value_text", "value"]);
  const boolValue = item.valueBoolean ?? item.value_boolean;
  const boolText =
    typeof boolValue === "boolean" ? (boolValue ? "Có" : "Không") : "";
  const dateText = getText(item, ["valueDate", "value_date"]);
  const unit = getText(item, ["unit"]);
  const flag = getText(item, ["normalFlag", "normal_flag"]);

  const value = numeric || text || boolText || dateText || "—";

  const right = joinParts([value, unit, flag]);
  if (!label && !right) return "";
  if (!label) return right;
  if (!right) return label;
  return `${label}: ${right}`;
}

function formatDiagnosisItem(item: GenericRecord) {
  const name = getText(item, [
    "diagnosisName",
    "diagnosis_name",
    "label",
    "title",
    "name",
  ]);
  const icd10 = getText(item, ["icd10Code", "icd10_code"]);
  const type = getText(item, ["diagnosisType", "diagnosis_type"]);
  const note = getText(item, ["note", "description"]);

  const main = name || "Chẩn đoán chưa đặt tên";
  const extra = joinParts([icd10, type, note ? compactText(note, 80) : ""]);
  return extra ? `${main} (${extra})` : main;
}

function formatPlanItem(item: GenericRecord) {
  const title = getText(item, [
    "description",
    "title",
    "name",
    "label",
    "content",
  ]);
  const type = getText(item, ["planType", "plan_type"]);
  const dueDate = getText(item, ["dueDate", "due_date"]);
  const completed =
    item.isCompleted ?? item.is_completed ?? item.completed ?? false;

  const main = title || "Mục kế hoạch";
  const extra = joinParts([
    type,
    dueDate,
    completed === true ? "Đã hoàn tất" : "",
  ]);

  return extra ? `${main} (${extra})` : main;
}

function formatBulletList(
  items: GenericRecord[],
  formatter: (item: GenericRecord) => string,
  emptyText: string,
  maxItems = 5
) {
  const lines = items
    .map(formatter)
    .filter(Boolean)
    .slice(0, maxItems);

  if (lines.length === 0) return emptyText;

  return lines.map((line) => `• ${line}`).join("\n");
}

function SummaryBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#ffffff",
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#475569",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "#0f172a",
          whiteSpace: "pre-wrap",
        }}
      >
        {content || "Chưa có dữ liệu."}
      </div>
    </section>
  );
}

export default function OverviewTab({
  assessment,
  vitals,
  redFlags,
  clinicalNote,
  diagnoses,
  plan,
  observations,
}: Props) {
  const reasonForAssessment =
    getText(assessment as GenericRecord, ["chief_complaint"]) ||
    "Chưa ghi nhận lý do đánh giá.";

  const historyOfPresentIllness =
    getText(clinicalNote, ["historyOfPresentIllness", "history_of_present_illness"]) ||
    "Chưa có tóm tắt bệnh sử hiện tại.";

  const pastHistory = [
    getText(clinicalNote, ["pastMedicalHistory", "past_medical_history"]),
    getText(clinicalNote, ["pastSurgicalHistory", "past_surgical_history"]),
    getText(clinicalNote, ["medicationHistory", "medication_history"]),
    getText(clinicalNote, ["allergyHistory", "allergy_history"]),
    getText(clinicalNote, ["familyHistory", "family_history"]),
    getText(clinicalNote, ["socialHistory", "social_history"]),
  ]
    .filter(Boolean)
    .map((line) => `• ${compactText(line, 120)}`)
    .join("\n");

  const iceSummary = [
    getText(clinicalNote, ["ideas"]),
    getText(clinicalNote, ["concerns"]),
    getText(clinicalNote, ["expectations"]),
  ]
    .filter(Boolean)
    .map((line, index) => {
      const labels = ["Ideas", "Concerns", "Expectations"];
      return `• ${labels[index]}: ${compactText(line, 120)}`;
    })
    .join("\n");

  const bpsSummary = [
    getText(clinicalNote, ["biologicalFactors", "biological_factors"]),
    getText(clinicalNote, ["psychologicalFactors", "psychological_factors"]),
    getText(clinicalNote, ["socialFactors", "social_factors"]),
  ]
    .filter(Boolean)
    .map((line, index) => {
      const labels = ["Biological", "Psychological", "Social"];
      return `• ${labels[index]}: ${compactText(line, 120)}`;
    })
    .join("\n");

  const physicalExamSummary = [
    getText(clinicalNote, ["generalAppearance", "general_appearance"]),
    getText(clinicalNote, ["cardiovascularExam", "cardiovascular_exam"]),
    getText(clinicalNote, ["respiratoryExam", "respiratory_exam"]),
    getText(clinicalNote, ["abdominalExam", "abdominal_exam"]),
    getText(clinicalNote, ["otherExam", "other_exam"]),
  ]
    .filter(Boolean)
    .map((line) => `• ${compactText(line, 120)}`)
    .join("\n");

  const labSummary = formatBulletList(
    getItems(observations),
    formatObservationItem,
    "Chưa có dữ liệu cận lâm sàng tóm tắt.",
    6
  );

  const diagnosisSummary = formatBulletList(
    getItems(diagnoses),
    formatDiagnosisItem,
    "Chưa ghi nhận chẩn đoán.",
    6
  );

  const managementPlanSummary = formatBulletList(
    getItems(plan),
    formatPlanItem,
    "Chưa ghi nhận kế hoạch quản lý.",
    6
  );

  const vitalsAndRiskSummary = [formatVitalsSummary(vitals), formatRedFlagSummary(assessment, redFlags)]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <SummaryBlock
          title="Lý do đánh giá"
          content={reasonForAssessment}
        />
      </div>

      <SummaryBlock
        title="Bệnh sử"
        content={historyOfPresentIllness}
      />

      <SummaryBlock
        title="Tiền sử"
        content={pastHistory || "Chưa có tóm tắt tiền sử."}
      />

      <SummaryBlock
        title="ICE"
        content={iceSummary || "Chưa có tóm tắt ICE."}
      />

      <SummaryBlock
        title="BioPsychoSocial"
        content={bpsSummary || "Chưa có tóm tắt BioPsychoSocial."}
      />

      <SummaryBlock
        title="Khám tóm tắt"
        content={
          [vitalsAndRiskSummary, physicalExamSummary]
            .filter(Boolean)
            .join("\n") || "Chưa có tóm tắt khám."
        }
      />

      <SummaryBlock
        title="Cận lâm sàng tóm tắt"
        content={labSummary}
      />

      <SummaryBlock
        title="Chẩn đoán"
        content={diagnosisSummary}
      />

      <div style={{ gridColumn: "1 / -1" }}>
        <SummaryBlock
          title="Kế hoạch quản lý"
          content={managementPlanSummary}
        />
      </div>
    </div>
  );
}