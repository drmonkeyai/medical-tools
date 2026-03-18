import { useMemo, useState } from "react";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/CalculatorTemplate";

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

export default function MMSE() {
  const [orientation, setOrientation] = useState<number | "">("");
  const [registration, setRegistration] = useState<number | "">("");
  const [attention, setAttention] = useState<number | "">("");
  const [recall, setRecall] = useState<number | "">("");
  const [language, setLanguage] = useState<number | "">("");

  const score = useMemo<number | null>(() => {
    const values: Array<number | ""> = [
      orientation,
      registration,
      attention,
      recall,
      language,
    ];

    if (values.every((x) => x === "")) return null;

    return values.reduce<number>((sum, x) => {
      return sum + (x === "" ? 0 : Number(x));
    }, 0);
  }, [orientation, registration, attention, recall, language]);

  const interpretation = useMemo(() => {
    if (score == null) return "Nhập ít nhất một miền điểm để tính.";
    if (score >= 24) return "Sàng lọc: chưa gợi ý suy giảm nhận thức rõ.";
    if (score >= 18) return "Sàng lọc: có thể suy giảm nhận thức nhẹ-vừa.";
    return "Sàng lọc: có thể suy giảm nhận thức đáng kể.";
  }, [score]);

  const handleReset = () => {
    setOrientation("");
    setRegistration("");
    setAttention("");
    setRecall("");
    setLanguage("");
  };

  return (
    <CalculatorTemplate
      title="MMSE"
      subtitle="Đánh giá nhận thức bằng nhập điểm theo miền"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      topNote="Nhập điểm theo miền để tính nhanh."
      left={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorSection title="Các miền điểm">
            <InputRow
              label="Định hướng (0–10)"
              value={orientation}
              min={0}
              max={10}
              onChange={(v) =>
                setOrientation(v === "" ? "" : clampNumber(Number(v), 0, 10))
              }
            />
            <InputRow
              label="Ghi nhớ ngay (0–3)"
              value={registration}
              min={0}
              max={3}
              onChange={(v) =>
                setRegistration(v === "" ? "" : clampNumber(Number(v), 0, 3))
              }
            />
            <InputRow
              label="Chú ý / tính toán (0–5)"
              value={attention}
              min={0}
              max={5}
              onChange={(v) =>
                setAttention(v === "" ? "" : clampNumber(Number(v), 0, 5))
              }
            />
            <InputRow
              label="Nhớ lại (0–3)"
              value={recall}
              min={0}
              max={3}
              onChange={(v) =>
                setRecall(v === "" ? "" : clampNumber(Number(v), 0, 3))
              }
            />
            <InputRow
              label="Ngôn ngữ + lệnh + viết + vẽ (0–9)"
              value={language}
              min={0}
              max={9}
              onChange={(v) =>
                setLanguage(v === "" ? "" : clampNumber(Number(v), 0, 9))
              }
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