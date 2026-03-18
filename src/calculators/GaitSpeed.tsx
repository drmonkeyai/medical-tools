import { useMemo, useState } from "react";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/CalculatorTemplate";

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

export default function GaitSpeed() {
  const [distance, setDistance] = useState<number | "">(6);
  const [time, setTime] = useState<number | "">("");

  const speed = useMemo(() => {
    if (distance === "" || time === "" || Number(time) <= 0) return null;
    return Number((Number(distance) / Number(time)).toFixed(2));
  }, [distance, time]);

  const interpretation = useMemo(() => {
    if (speed == null) return "Nhập đủ dữ liệu để tính.";
    if (speed < 0.8) return "Đi bộ chậm rõ, gợi ý giảm hiệu năng vận động.";
    if (speed < 1.0) return "Đi bộ chậm.";
    return "Tốc độ đi bộ trong ngưỡng chấp nhận được.";
  }, [speed]);

  const handleReset = () => {
    setDistance(6);
    setTime("");
  };

  return (
    <CalculatorTemplate
      title="Tốc độ đi bộ"
      subtitle="Đánh giá vận động bằng quãng đường và thời gian đi bộ"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      left={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorSection title="Thông số đo">
            <InputRow
              label="Quãng đường (m)"
              value={distance}
              min={1}
              step={0.1}
              onChange={(v) => setDistance(v === "" ? "" : Number(v))}
            />
            <InputRow
              label="Thời gian (giây)"
              value={time}
              min={0.1}
              step={0.1}
              onChange={(v) => setTime(v === "" ? "" : Number(v))}
            />
          </CalculatorSection>
        </div>
      }
      right={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorBox>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Kết quả</div>
            <div style={{ fontSize: 28, fontWeight: 1000 }}>
              {speed == null ? "--" : `${speed} m/s`}
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