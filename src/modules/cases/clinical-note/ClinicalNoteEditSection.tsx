import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  forwardRef,
} from "react";
import { useUpsertAssessmentNote } from "../../../features/cases/hooks/useUpsertAssessmentNote";

type ClinicalNoteEditMode = "history" | "ice" | "biopsychosocial";

export type ClinicalNoteEditSectionRef = {
  save: () => Promise<boolean>;
};

type Props = {
  assessmentId?: string;
  data: Record<string, unknown> | null;
  mode: ClinicalNoteEditMode;
  onChanged?: () => Promise<void> | void;
};

type HistoryTemplate = {
  label: string;
  values: Partial<{
    historyOfPresentIllness: string;
    pastMedicalHistory: string;
    pastSurgicalHistory: string;
    medicationHistory: string;
    allergyHistory: string;
    familyHistory: string;
    socialHistory: string;
  }>;
};

type ICETemplate = {
  label: string;
  values: Partial<{
    ideas: string;
    concerns: string;
    expectations: string;
  }>;
};

type BioPsychoSocialTemplate = {
  label: string;
  values: Partial<{
    biologicalFactors: string;
    psychologicalFactors: string;
    socialFactors: string;
    generalAppearance: string;
    cardiovascularExam: string;
    respiratoryExam: string;
    abdominalExam: string;
    otherExam: string;
  }>;
};

const HISTORY_TEMPLATES: HistoryTemplate[] = [
  {
    label: "Tiền sử trống cơ bản",
    values: {
      pastMedicalHistory: "Chưa ghi nhận bệnh lý mạn tính đáng chú ý.",
      pastSurgicalHistory: "Chưa ghi nhận tiền sử phẫu thuật đáng chú ý.",
      medicationHistory: "Hiện chưa dùng thuốc nền thường xuyên.",
      allergyHistory: "Chưa ghi nhận dị ứng thuốc/thức ăn.",
      familyHistory: "Chưa ghi nhận tiền sử gia đình đáng chú ý.",
      socialHistory: "Sinh hoạt thường ngày ổn định.",
    },
  },
  {
    label: "Tăng huyết áp / đái tháo đường",
    values: {
      pastMedicalHistory: "Tiền sử tăng huyết áp và đái tháo đường type 2.",
      medicationHistory:
        "Đang dùng thuốc điều trị tăng huyết áp và đái tháo đường theo toa trước đó.",
      allergyHistory: "Chưa ghi nhận dị ứng thuốc.",
      familyHistory: "Gia đình có người mắc bệnh tim mạch/chuyển hóa.",
      socialHistory:
        "Cần đánh giá thêm chế độ ăn, vận động, giấc ngủ và tuân thủ điều trị.",
    },
  },
  {
    label: "Bệnh hô hấp mạn",
    values: {
      pastMedicalHistory: "Tiền sử bệnh hô hấp mạn, theo dõi định kỳ.",
      medicationHistory: "Đang dùng thuốc điều trị hô hấp theo toa.",
      allergyHistory:
        "Cần khai thác thêm tiền sử dị ứng và yếu tố khởi phát.",
      socialHistory:
        "Cần khai thác hút thuốc, phơi nhiễm khói bụi, môi trường sống/làm việc.",
    },
  },
];

const ICE_TEMPLATES: ICETemplate[] = [
  {
    label: "ICE trung tính",
    values: {
      ideas: "Người bệnh chưa có nhận định rõ về nguyên nhân bệnh.",
      concerns: "Lo lắng về diễn tiến triệu chứng và ảnh hưởng sinh hoạt.",
      expectations: "Mong được giải thích rõ tình trạng và hướng xử trí.",
    },
  },
  {
    label: "ICE lo bệnh nặng",
    values: {
      ideas: "Người bệnh lo ngại triệu chứng liên quan bệnh lý nghiêm trọng.",
      concerns: "Lo biến chứng hoặc bệnh nặng tiềm ẩn.",
      expectations: "Mong được đánh giá kỹ và loại trừ bệnh lý nguy hiểm.",
    },
  },
  {
    label: "ICE thiên về thuốc",
    values: {
      ideas: "Người bệnh nghĩ cần dùng thuốc để cải thiện nhanh triệu chứng.",
      concerns: "Lo triệu chứng kéo dài hoặc tái phát.",
      expectations: "Mong được kê thuốc và hướng dẫn dùng thuốc cụ thể.",
    },
  },
];

const BPS_TEMPLATES: BioPsychoSocialTemplate[] = [
  {
    label: "Khám tim phổi bụng bình thường",
    values: {
      biologicalFactors:
        "Chưa ghi nhận yếu tố sinh học nổi bật ngoài vấn đề hiện tại.",
      psychologicalFactors: "Tinh thần tiếp xúc tốt, hợp tác khám.",
      socialFactors: "Sinh hoạt cơ bản ổn định.",
      generalAppearance: "Tỉnh, tiếp xúc tốt.",
      cardiovascularExam: "Tim đều, chưa ghi nhận tiếng thổi.",
      respiratoryExam: "Phổi thông khí tốt, chưa ghi nhận ran.",
      abdominalExam:
        "Bụng mềm, không chướng, không phản ứng thành bụng.",
      otherExam: "Chưa ghi nhận bất thường khác đáng chú ý.",
    },
  },
  {
    label: "Khám hô hấp bình thường",
    values: {
      generalAppearance: "Tỉnh, tiếp xúc tốt, không khó thở khi nghỉ.",
      respiratoryExam:
        "Phổi thông khí tốt, chưa ghi nhận ran, không co kéo cơ hô hấp phụ.",
      otherExam: "SpO2 và dấu hiệu sinh tồn cần đối chiếu thêm nếu có.",
    },
  },
  {
    label: "Khám bụng cơ bản bình thường",
    values: {
      generalAppearance: "Tỉnh, tiếp xúc tốt.",
      abdominalExam:
        "Bụng mềm, ấn không đau khu trú, không đề kháng, nhu động ruột còn.",
      otherExam:
        "Chưa ghi nhận dấu hiệu cảnh báo bụng cấp trên thăm khám hiện tại.",
    },
  },
];

function getText(data: Record<string, unknown> | null, ...keys: string[]) {
  if (!data) return "";
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string") return value;
  }
  return "";
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#fff",
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: "0 0 14px 0",
          fontSize: 18,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "grid", gap: 16 }}>{children}</div>
    </section>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 6,
          color: "#334155",
        }}
      >
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          resize: "vertical",
          background: "#fff",
          color: "#0f172a",
        }}
      />
    </div>
  );
}

function TemplateBar({
  title,
  items,
  onApply,
}: {
  title: string;
  items: Array<{ label: string }>;
  onApply: (index: number) => void;
}) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px dashed #cbd5e1",
        borderRadius: 12,
        background: "#f8fafc",
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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            type="button"
            onClick={() => onApply(index)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              color: "#334155",
              fontWeight: 500,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const ClinicalNoteEditSection = forwardRef<ClinicalNoteEditSectionRef, Props>(
  function ClinicalNoteEditSection(
    { assessmentId, data, mode, onChanged }: Props,
    ref
  ) {
    const { upsertAssessmentNote } = useUpsertAssessmentNote();

    const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");
    const [pastMedicalHistory, setPastMedicalHistory] = useState("");
    const [pastSurgicalHistory, setPastSurgicalHistory] = useState("");
    const [medicationHistory, setMedicationHistory] = useState("");
    const [allergyHistory, setAllergyHistory] = useState("");
    const [familyHistory, setFamilyHistory] = useState("");
    const [socialHistory, setSocialHistory] = useState("");

    const [ideas, setIdeas] = useState("");
    const [concerns, setConcerns] = useState("");
    const [expectations, setExpectations] = useState("");

    const [biologicalFactors, setBiologicalFactors] = useState("");
    const [psychologicalFactors, setPsychologicalFactors] = useState("");
    const [socialFactors, setSocialFactors] = useState("");
    const [generalAppearance, setGeneralAppearance] = useState("");
    const [cardiovascularExam, setCardiovascularExam] = useState("");
    const [respiratoryExam, setRespiratoryExam] = useState("");
    const [abdominalExam, setAbdominalExam] = useState("");
    const [otherExam, setOtherExam] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
      setHistoryOfPresentIllness(
        getText(data, "historyOfPresentIllness", "history_of_present_illness")
      );
      setPastMedicalHistory(
        getText(data, "pastMedicalHistory", "past_medical_history")
      );
      setPastSurgicalHistory(
        getText(data, "pastSurgicalHistory", "past_surgical_history")
      );
      setMedicationHistory(
        getText(data, "medicationHistory", "medication_history")
      );
      setAllergyHistory(getText(data, "allergyHistory", "allergy_history"));
      setFamilyHistory(getText(data, "familyHistory", "family_history"));
      setSocialHistory(getText(data, "socialHistory", "social_history"));

      setIdeas(getText(data, "ideas"));
      setConcerns(getText(data, "concerns"));
      setExpectations(getText(data, "expectations"));

      setBiologicalFactors(
        getText(data, "biologicalFactors", "biological_factors")
      );
      setPsychologicalFactors(
        getText(data, "psychologicalFactors", "psychological_factors")
      );
      setSocialFactors(getText(data, "socialFactors", "social_factors"));
      setGeneralAppearance(
        getText(data, "generalAppearance", "general_appearance")
      );
      setCardiovascularExam(
        getText(data, "cardiovascularExam", "cardiovascular_exam")
      );
      setRespiratoryExam(
        getText(data, "respiratoryExam", "respiratory_exam")
      );
      setAbdominalExam(getText(data, "abdominalExam", "abdominal_exam"));
      setOtherExam(getText(data, "otherExam", "other_exam"));
    }, [data]);

    const title = useMemo(() => {
      if (mode === "history") return "Tiền sử";
      if (mode === "ice") return "ICE";
      return "BioPsychoSocial / Khám";
    }, [mode]);

    async function handleSave() {
      if (!assessmentId) {
        setError("Thiếu assessmentId.");
        return false;
      }

      const payload = {
        assessmentId,
        historyOfPresentIllness,
        pastMedicalHistory,
        pastSurgicalHistory,
        medicationHistory,
        allergyHistory,
        familyHistory,
        socialHistory,
        ideas,
        concerns,
        expectations,
        biologicalFactors,
        psychologicalFactors,
        socialFactors,
        generalAppearance,
        cardiovascularExam,
        respiratoryExam,
        abdominalExam,
        otherExam,
      };

      try {
        setSaving(true);
        setError("");

        console.log("[ClinicalNoteEditSection] mode =", mode);
        console.log("[ClinicalNoteEditSection] assessmentId =", assessmentId);
        console.log(
          "[ClinicalNoteEditSection] payload json =",
          JSON.stringify(payload, null, 2)
        );

        const savedRow = await upsertAssessmentNote(payload);

        console.log(
          "[ClinicalNoteEditSection] savedRow json =",
          JSON.stringify(savedRow, null, 2)
        );

        await onChanged?.();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không lưu được clinical note.";
        console.error("[ClinicalNoteEditSection] save error =", err);
        setError(message);
        return false;
      } finally {
        setSaving(false);
      }
    }

    useImperativeHandle(ref, () => ({
      save: handleSave,
    }));

    function applyHistoryTemplate(index: number) {
      const template = HISTORY_TEMPLATES[index];
      if (!template) return;

      if (template.values.historyOfPresentIllness !== undefined) {
        setHistoryOfPresentIllness(template.values.historyOfPresentIllness);
      }
      if (template.values.pastMedicalHistory !== undefined) {
        setPastMedicalHistory(template.values.pastMedicalHistory);
      }
      if (template.values.pastSurgicalHistory !== undefined) {
        setPastSurgicalHistory(template.values.pastSurgicalHistory);
      }
      if (template.values.medicationHistory !== undefined) {
        setMedicationHistory(template.values.medicationHistory);
      }
      if (template.values.allergyHistory !== undefined) {
        setAllergyHistory(template.values.allergyHistory);
      }
      if (template.values.familyHistory !== undefined) {
        setFamilyHistory(template.values.familyHistory);
      }
      if (template.values.socialHistory !== undefined) {
        setSocialHistory(template.values.socialHistory);
      }
    }

    function applyICETemplate(index: number) {
      const template = ICE_TEMPLATES[index];
      if (!template) return;

      if (template.values.ideas !== undefined) {
        setIdeas(template.values.ideas);
      }
      if (template.values.concerns !== undefined) {
        setConcerns(template.values.concerns);
      }
      if (template.values.expectations !== undefined) {
        setExpectations(template.values.expectations);
      }
    }

    function applyBPSTemplate(index: number) {
      const template = BPS_TEMPLATES[index];
      if (!template) return;

      if (template.values.biologicalFactors !== undefined) {
        setBiologicalFactors(template.values.biologicalFactors);
      }
      if (template.values.psychologicalFactors !== undefined) {
        setPsychologicalFactors(template.values.psychologicalFactors);
      }
      if (template.values.socialFactors !== undefined) {
        setSocialFactors(template.values.socialFactors);
      }
      if (template.values.generalAppearance !== undefined) {
        setGeneralAppearance(template.values.generalAppearance);
      }
      if (template.values.cardiovascularExam !== undefined) {
        setCardiovascularExam(template.values.cardiovascularExam);
      }
      if (template.values.respiratoryExam !== undefined) {
        setRespiratoryExam(template.values.respiratoryExam);
      }
      if (template.values.abdominalExam !== undefined) {
        setAbdominalExam(template.values.abdominalExam);
      }
      if (template.values.otherExam !== undefined) {
        setOtherExam(template.values.otherExam);
      }
    }

    function renderHistoryFields() {
      return (
        <>
          <TemplateBar
            title="Mẫu nhập nhanh"
            items={HISTORY_TEMPLATES}
            onApply={applyHistoryTemplate}
          />

          <TextareaField
            label="History of Present Illness"
            value={historyOfPresentIllness}
            onChange={setHistoryOfPresentIllness}
            rows={5}
          />
          <TextareaField
            label="Past Medical History"
            value={pastMedicalHistory}
            onChange={setPastMedicalHistory}
          />
          <TextareaField
            label="Past Surgical History"
            value={pastSurgicalHistory}
            onChange={setPastSurgicalHistory}
          />
          <TextareaField
            label="Medication History"
            value={medicationHistory}
            onChange={setMedicationHistory}
          />
          <TextareaField
            label="Allergy History"
            value={allergyHistory}
            onChange={setAllergyHistory}
          />
          <TextareaField
            label="Family History"
            value={familyHistory}
            onChange={setFamilyHistory}
          />
          <TextareaField
            label="Social History"
            value={socialHistory}
            onChange={setSocialHistory}
          />
        </>
      );
    }

    function renderICEFields() {
      return (
        <>
          <TemplateBar
            title="Mẫu nhập nhanh"
            items={ICE_TEMPLATES}
            onApply={applyICETemplate}
          />

          <TextareaField label="Ideas" value={ideas} onChange={setIdeas} />
          <TextareaField
            label="Concerns"
            value={concerns}
            onChange={setConcerns}
          />
          <TextareaField
            label="Expectations"
            value={expectations}
            onChange={setExpectations}
          />
        </>
      );
    }

    function renderBioPsychoSocialFields() {
      return (
        <>
          <TemplateBar
            title="Mẫu nhập nhanh"
            items={BPS_TEMPLATES}
            onApply={applyBPSTemplate}
          />

          <TextareaField
            label="Biological Factors"
            value={biologicalFactors}
            onChange={setBiologicalFactors}
          />
          <TextareaField
            label="Psychological Factors"
            value={psychologicalFactors}
            onChange={setPsychologicalFactors}
          />
          <TextareaField
            label="Social Factors"
            value={socialFactors}
            onChange={setSocialFactors}
          />
          <TextareaField
            label="General Appearance"
            value={generalAppearance}
            onChange={setGeneralAppearance}
          />
          <TextareaField
            label="Cardiovascular Exam"
            value={cardiovascularExam}
            onChange={setCardiovascularExam}
          />
          <TextareaField
            label="Respiratory Exam"
            value={respiratoryExam}
            onChange={setRespiratoryExam}
          />
          <TextareaField
            label="Abdominal Exam"
            value={abdominalExam}
            onChange={setAbdominalExam}
          />
          <TextareaField
            label="Other Exam"
            value={otherExam}
            onChange={setOtherExam}
          />
        </>
      );
    }

    return (
      <SectionCard title={title}>
        {mode === "history" ? renderHistoryFields() : null}
        {mode === "ice" ? renderICEFields() : null}
        {mode === "biopsychosocial" ? renderBioPsychoSocialFields() : null}

        {error ? (
          <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>
        ) : null}

        <div>
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: saving ? "#e2e8f0" : "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {saving ? "Đang lưu..." : "Lưu Clinical Note"}
          </button>
        </div>
      </SectionCard>
    );
  }
);

export default ClinicalNoteEditSection;