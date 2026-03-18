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

export default function LawtonIADL() {
  const [phone, setPhone] = useState(false);
  const [shopping, setShopping] = useState(false);
  const [foodPrep, setFoodPrep] = useState(false);
  const [housekeeping, setHousekeeping] = useState(false);
  const [laundry, setLaundry] = useState(false);
  const [transport, setTransport] = useState(false);
  const [medication, setMedication] = useState(false);
  const [finance, setFinance] = useState(false);

  const score = useMemo(() => {
    return [
      phone,
      shopping,
      foodPrep,
      housekeeping,
      laundry,
      transport,
      medication,
      finance,
    ].filter(Boolean).length;
  }, [phone, shopping, foodPrep, housekeeping, laundry, transport, medication, finance]);

  const interpretation = useMemo(() => {
    if (score === 8) return "Độc lập tốt trong hoạt động sống dụng cụ.";
    if (score >= 5) return "Giảm một phần khả năng sống độc lập.";
    if (score >= 3) return "Phụ thuộc mức độ vừa trong IADL.";
    return "Phụ thuộc nhiều trong IADL.";
  }, [score]);

  const handleReset = () => {
    setPhone(false);
    setShopping(false);
    setFoodPrep(false);
    setHousekeeping(false);
    setLaundry(false);
    setTransport(false);
    setMedication(false);
    setFinance(false);
  };

  return (
    <CalculatorTemplate
      title="Lawton IADL"
      subtitle="Đánh giá chức năng sống dụng cụ"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      left={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorSection title="Chọn các hoạt động bệnh nhân làm độc lập">
            <CheckRow label="Sử dụng điện thoại" checked={phone} onChange={setPhone} />
            <CheckRow label="Mua sắm" checked={shopping} onChange={setShopping} />
            <CheckRow label="Chuẩn bị bữa ăn" checked={foodPrep} onChange={setFoodPrep} />
            <CheckRow label="Dọn dẹp nhà cửa" checked={housekeeping} onChange={setHousekeeping} />
            <CheckRow label="Giặt giũ" checked={laundry} onChange={setLaundry} />
            <CheckRow label="Đi lại / phương tiện" checked={transport} onChange={setTransport} />
            <CheckRow label="Dùng thuốc đúng" checked={medication} onChange={setMedication} />
            <CheckRow label="Quản lý tài chính" checked={finance} onChange={setFinance} />
          </CalculatorSection>
        </div>
      }
      right={
        <div style={{ display: "grid", gap: 14 }}>
          <CalculatorBox>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Kết quả</div>
            <div style={{ fontSize: 28, fontWeight: 1000 }}>{score}/8</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.7 }}>
              {interpretation}
            </div>
          </CalculatorBox>

          <CalculatorBox>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Diễn giải nhanh</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Điểm càng cao càng độc lập tốt trong các hoạt động sinh hoạt phức tạp ngoài cộng đồng.
            </div>
          </CalculatorBox>
        </div>
      }
    />
  );
}