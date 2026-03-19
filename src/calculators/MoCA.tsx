import { useMemo, useState } from "react";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function InputRow(props: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 700 }}>{props.label}</label>
      <input
        className="input"
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

function CheckRow(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        border: "1px solid var(--line)",
        borderRadius: 12,
        background: "white",
      }}
    >
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span>{props.label}</span>
    </label>
  );
}

export default function MoCA() {
  const [visuoExec, setVisuoExec] = useState<number | "">("");
  const [naming, setNaming] = useState<number | "">("");
  const [attention, setAttention] = useState<number | "">("");
  const [language, setLanguage] = useState<number | "">("");
  const [abstraction, setAbstraction] = useState<number | "">("");
  const [delayedRecall, setDelayedRecall] = useState<number | "">("");
  const [orientation, setOrientation] = useState<number | "">("");
  const [educationBonus, setEducationBonus] = useState(false);

  const rawScore = useMemo<number | null>(() => {
    const values: Array<number | ""> = [
      visuoExec,
      naming,
      attention,
      language,
      abstraction,
      delayedRecall,
      orientation,
    ];

    if (values.every((x) => x === "")) return null;

    return values.reduce<number>((sum, x) => {
      return sum + (x === "" ? 0 : Number(x));
    }, 0);
  }, [
    visuoExec,
    naming,
    attention,
    language,
    abstraction,
    delayedRecall,
    orientation,
  ]);

  const score = useMemo<number | null>(() => {
    if (rawScore == null) return null;
    return Math.min(30, rawScore + (educationBonus ? 1 : 0));
  }, [rawScore, educationBonus]);

  const interpretation = useMemo(() => {
    if (score == null) return "Nhập ít nhất một miền điểm để tính.";
    if (score >= 26) return "Sàng lọc: trong ngưỡng thường dùng là bình thường.";
    return "Sàng lọc: dưới ngưỡng thường dùng, nên đánh giá lâm sàng thêm.";
  }, [score]);

  const handleReset = () => {
    setVisuoExec("");
    setNaming("");
    setAttention("");
    setLanguage("");
    setAbstraction("");
    setDelayedRecall("");
    setOrientation("");
    setEducationBonus(false);
  };

  return (
    <CalculatorTemplate
      title="MoCA"
      subtitle="Đánh giá nhận thức bằng nhập điểm theo miền"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      topNote="Có thể cộng 1 điểm nếu học vấn ≤ 12 năm."
      left={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorSection title="Các miền điểm">
            <InputRow
              label="Thị giác - không gian / điều hành (0–5)"
              value={visuoExec}
              min={0}
              max={5}
              onChange={(v) =>
                setVisuoExec(v === "" ? "" : clampNumber(Number(v), 0, 5))
              }
            />
            <InputRow
              label="Gọi tên (0–3)"
              value={naming}
              min={0}
              max={3}
              onChange={(v) =>
                setNaming(v === "" ? "" : clampNumber(Number(v), 0, 3))
              }
            />
            <InputRow
              label="Chú ý (0–6)"
              value={attention}
              min={0}
              max={6}
              onChange={(v) =>
                setAttention(v === "" ? "" : clampNumber(Number(v), 0, 6))
              }
            />
            <InputRow
              label="Ngôn ngữ (0–3)"
              value={language}
              min={0}
              max={3}
              onChange={(v) =>
                setLanguage(v === "" ? "" : clampNumber(Number(v), 0, 3))
              }
            />
            <InputRow
              label="Trừu tượng (0–2)"
              value={abstraction}
              min={0}
              max={2}
              onChange={(v) =>
                setAbstraction(v === "" ? "" : clampNumber(Number(v), 0, 2))
              }
            />
            <InputRow
              label="Nhớ lại muộn (0–5)"
              value={delayedRecall}
              min={0}
              max={5}
              onChange={(v) =>
                setDelayedRecall(v === "" ? "" : clampNumber(Number(v), 0, 5))
              }
            />
            <InputRow
              label="Định hướng (0–6)"
              value={orientation}
              min={0}
              max={6}
              onChange={(v) =>
                setOrientation(v === "" ? "" : clampNumber(Number(v), 0, 6))
              }
            />

            <CheckRow
              label="Cộng 1 điểm nếu học vấn ≤ 12 năm"
              checked={educationBonus}
              onChange={setEducationBonus}
            />
          </CalculatorSection>
        </div>
      }
      right={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorBox>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
              Kết quả
            </div>
            <div style={{ fontSize: 28, fontWeight: 1000 }}>
              {score == null ? "--" : `${score}/30`}
            </div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.7 }}>
              {interpretation}
            </div>
          </CalculatorBox>
        </div>
      }
    />
  );
}