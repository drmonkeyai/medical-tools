import { useMemo, useState } from "react";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/CalculatorTemplate";

type Sex = "male" | "female";

function InputRow(props: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
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
        step={props.step}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

export default function GripStrength() {
  const [sex, setSex] = useState<Sex>("male");
  const [grip, setGrip] = useState<number | "">("");

  const cutoff = sex === "male" ? 28 : 18;

  const interpretation = useMemo(() => {
    if (grip === "") return "Nhập đủ dữ liệu để đánh giá.";
    if (Number(grip) < cutoff) return `Sức nắm thấp theo ngưỡng tham chiếu (${cutoff} kg).`;
    return `Sức nắm chưa giảm theo ngưỡng tham chiếu (${cutoff} kg).`;
  }, [grip, cutoff]);

  const handleReset = () => {
    setSex("male");
    setGrip("");
  };

  return (
    <CalculatorTemplate
      title="Sức nắm tay"
      subtitle="Đánh giá sức cơ bằng lực nắm tay"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      left={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorSection title="Thông số đo">
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 700 }}>Giới tính</label>
              <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <InputRow
              label="Sức nắm tay tối đa (kg)"
              value={grip}
              min={0}
              step={0.1}
              onChange={(v) => setGrip(v === "" ? "" : Number(v))}
            />
          </CalculatorSection>
        </div>
      }
      right={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorBox>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Kết quả</div>
            <div style={{ fontSize: 28, fontWeight: 1000 }}>
              {grip === "" ? "--" : `${grip} kg`}
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