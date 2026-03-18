import { useMemo, useState } from "react";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/CalculatorTemplate";

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

export default function KatzADL() {
  const [bathing, setBathing] = useState(false);
  const [dressing, setDressing] = useState(false);
  const [toileting, setToileting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [continence, setContinence] = useState(false);
  const [feeding, setFeeding] = useState(false);

  const score = useMemo(() => {
    return [
      bathing,
      dressing,
      toileting,
      transferring,
      continence,
      feeding,
    ].filter(Boolean).length;
  }, [bathing, dressing, toileting, transferring, continence, feeding]);

  const interpretation = useMemo(() => {
    if (score === 6) return "Độc lập hoàn toàn trong hoạt động sống cơ bản.";
    if (score >= 4) return "Giảm chức năng nhẹ.";
    if (score >= 2) return "Giảm chức năng mức độ vừa.";
    return "Phụ thuộc nhiều trong hoạt động sống cơ bản.";
  }, [score]);

  const handleReset = () => {
    setBathing(false);
    setDressing(false);
    setToileting(false);
    setTransferring(false);
    setContinence(false);
    setFeeding(false);
  };

  return (
    <CalculatorTemplate
      title="Katz ADL"
      subtitle="Đánh giá chức năng cơ bản ở người cao tuổi"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      left={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorSection title="Chọn các hoạt động bệnh nhân làm độc lập">
            <CheckRow label="Tắm rửa độc lập" checked={bathing} onChange={setBathing} />
            <CheckRow label="Mặc quần áo độc lập" checked={dressing} onChange={setDressing} />
            <CheckRow label="Đi vệ sinh độc lập" checked={toileting} onChange={setToileting} />
            <CheckRow
              label="Di chuyển / chuyển tư thế độc lập"
              checked={transferring}
              onChange={setTransferring}
            />
            <CheckRow
              label="Kiểm soát tiểu tiện / đại tiện"
              checked={continence}
              onChange={setContinence}
            />
            <CheckRow label="Ăn uống độc lập" checked={feeding} onChange={setFeeding} />
          </CalculatorSection>
        </div>
      }
      right={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorBox>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Kết quả</div>
            <div style={{ fontSize: 28, fontWeight: 1000 }}>{score}/6</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.7 }}>
              {interpretation}
            </div>
          </CalculatorBox>

          <CalculatorBox>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Diễn giải nhanh</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Điểm càng cao càng độc lập tốt trong sinh hoạt cơ bản hằng ngày.
            </div>
          </CalculatorBox>
        </div>
      }
    />
  );
}