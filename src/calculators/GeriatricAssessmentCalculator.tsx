import { useMemo, useState } from "react";
import CalculatorTemplate, {
  CalculatorBox,
  CalculatorSection,
} from "../components/calculator/CalculatorTemplate";

type Sex = "male" | "female";

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function toDisplay(value: number | ""): string | number {
  return value === "" ? "" : value;
}

export default function GeriatricAssessmentCalculator() {
  // Katz ADL
  const [kBathing, setKBathing] = useState(false);
  const [kDressing, setKDressing] = useState(false);
  const [kToileting, setKToileting] = useState(false);
  const [kTransfer, setKTransfer] = useState(false);
  const [kContinence, setKContinence] = useState(false);
  const [kFeeding, setKFeeding] = useState(false);

  // Lawton IADL
  const [lPhone, setLPhone] = useState(false);
  const [lShopping, setLShopping] = useState(false);
  const [lFoodPrep, setLFoodPrep] = useState(false);
  const [lHousekeeping, setLHousekeeping] = useState(false);
  const [lLaundry, setLLaundry] = useState(false);
  const [lTransport, setLTransport] = useState(false);
  const [lMedication, setLMedication] = useState(false);
  const [lFinance, setLFinance] = useState(false);

  // Gait speed
  const [walkDistance, setWalkDistance] = useState<number | "">(6);
  const [walkTime, setWalkTime] = useState<number | "">("");

  // Grip strength
  const [sex, setSex] = useState<Sex>("male");
  const [gripStrength, setGripStrength] = useState<number | "">("");

  // MMSE
  const [mmseOrientation, setMmseOrientation] = useState<number | "">("");
  const [mmseRegistration, setMmseRegistration] = useState<number | "">("");
  const [mmseAttention, setMmseAttention] = useState<number | "">("");
  const [mmseRecall, setMmseRecall] = useState<number | "">("");
  const [mmseLanguage, setMmseLanguage] = useState<number | "">("");

  // MoCA
  const [mocaVisuoExec, setMocaVisuoExec] = useState<number | "">("");
  const [mocaNaming, setMocaNaming] = useState<number | "">("");
  const [mocaAttention, setMocaAttention] = useState<number | "">("");
  const [mocaLanguage, setMocaLanguage] = useState<number | "">("");
  const [mocaAbstraction, setMocaAbstraction] = useState<number | "">("");
  const [mocaDelayedRecall, setMocaDelayedRecall] = useState<number | "">("");
  const [mocaOrientation, setMocaOrientation] = useState<number | "">("");
  const [mocaEducationBonus, setMocaEducationBonus] = useState(false);

  const katzScore = useMemo<number>(() => {
    return [
      kBathing,
      kDressing,
      kToileting,
      kTransfer,
      kContinence,
      kFeeding,
    ].filter(Boolean).length;
  }, [kBathing, kDressing, kToileting, kTransfer, kContinence, kFeeding]);

  const katzInterpretation = useMemo(() => {
    if (katzScore === 6) return "Độc lập hoàn toàn trong ADL cơ bản.";
    if (katzScore >= 4) return "Giảm chức năng nhẹ.";
    if (katzScore >= 2) return "Giảm chức năng mức độ vừa.";
    return "Phụ thuộc nhiều trong ADL cơ bản.";
  }, [katzScore]);

  const lawtonScore = useMemo<number>(() => {
    return [
      lPhone,
      lShopping,
      lFoodPrep,
      lHousekeeping,
      lLaundry,
      lTransport,
      lMedication,
      lFinance,
    ].filter(Boolean).length;
  }, [
    lPhone,
    lShopping,
    lFoodPrep,
    lHousekeeping,
    lLaundry,
    lTransport,
    lMedication,
    lFinance,
  ]);

  const lawtonInterpretation = useMemo(() => {
    if (lawtonScore === 8) return "Độc lập tốt trong IADL.";
    if (lawtonScore >= 5) return "Giảm một phần khả năng sống độc lập.";
    if (lawtonScore >= 3) return "Phụ thuộc mức độ vừa trong IADL.";
    return "Phụ thuộc nhiều trong IADL.";
  }, [lawtonScore]);

  const gaitSpeed = useMemo<number | null>(() => {
    if (walkDistance === "" || walkTime === "" || Number(walkTime) <= 0) {
      return null;
    }
    return Number((Number(walkDistance) / Number(walkTime)).toFixed(2));
  }, [walkDistance, walkTime]);

  const gaitInterpretation = useMemo(() => {
    if (gaitSpeed == null) return "Chưa đủ dữ liệu.";
    if (gaitSpeed < 0.8) return "Đi bộ chậm rõ, nguy cơ suy giảm vận động cao.";
    if (gaitSpeed < 1.0) return "Đi bộ chậm.";
    return "Tốc độ đi bộ tạm chấp nhận.";
  }, [gaitSpeed]);

  const gripCutoff = sex === "male" ? 28 : 18;

  const gripInterpretation = useMemo(() => {
    if (gripStrength === "") return "Chưa đủ dữ liệu.";
    if (Number(gripStrength) < gripCutoff) {
      return `Sức nắm thấp theo ngưỡng tham chiếu (${gripCutoff} kg).`;
    }
    return `Sức nắm chưa giảm theo ngưỡng tham chiếu (${gripCutoff} kg).`;
  }, [gripStrength, gripCutoff]);

  const mmseScore = useMemo<number | null>(() => {
    const parts: Array<number | ""> = [
      mmseOrientation,
      mmseRegistration,
      mmseAttention,
      mmseRecall,
      mmseLanguage,
    ];

    if (parts.every((x) => x === "")) return null;

    return parts.reduce<number>((sum, x) => {
      return sum + (x === "" ? 0 : Number(x));
    }, 0);
  }, [
    mmseOrientation,
    mmseRegistration,
    mmseAttention,
    mmseRecall,
    mmseLanguage,
  ]);

  const mmseInterpretation = useMemo(() => {
    if (mmseScore == null) return "Chưa đủ dữ liệu.";
    if (mmseScore >= 24) return "Sàng lọc: chưa gợi ý suy giảm nhận thức rõ.";
    if (mmseScore >= 18) return "Sàng lọc: có thể suy giảm nhận thức nhẹ-vừa.";
    return "Sàng lọc: có thể suy giảm nhận thức đáng kể.";
  }, [mmseScore]);

  const mocaRaw = useMemo<number | null>(() => {
    const parts: Array<number | ""> = [
      mocaVisuoExec,
      mocaNaming,
      mocaAttention,
      mocaLanguage,
      mocaAbstraction,
      mocaDelayedRecall,
      mocaOrientation,
    ];

    if (parts.every((x) => x === "")) return null;

    return parts.reduce<number>((sum, x) => {
      return sum + (x === "" ? 0 : Number(x));
    }, 0);
  }, [
    mocaVisuoExec,
    mocaNaming,
    mocaAttention,
    mocaLanguage,
    mocaAbstraction,
    mocaDelayedRecall,
    mocaOrientation,
  ]);

  const mocaScore = useMemo<number | null>(() => {
    if (mocaRaw == null) return null;
    return Math.min(30, mocaRaw + (mocaEducationBonus ? 1 : 0));
  }, [mocaRaw, mocaEducationBonus]);

  const mocaInterpretation = useMemo(() => {
    if (mocaScore == null) return "Chưa đủ dữ liệu.";
    if (mocaScore >= 26) return "Sàng lọc: trong ngưỡng thường dùng là bình thường.";
    return "Sàng lọc: dưới ngưỡng thường dùng, nên đánh giá lâm sàng thêm.";
  }, [mocaScore]);

  const handleReset = () => {
    setKBathing(false);
    setKDressing(false);
    setKToileting(false);
    setKTransfer(false);
    setKContinence(false);
    setKFeeding(false);

    setLPhone(false);
    setLShopping(false);
    setLFoodPrep(false);
    setLHousekeeping(false);
    setLLaundry(false);
    setLTransport(false);
    setLMedication(false);
    setLFinance(false);

    setWalkDistance(6);
    setWalkTime("");

    setSex("male");
    setGripStrength("");

    setMmseOrientation("");
    setMmseRegistration("");
    setMmseAttention("");
    setMmseRecall("");
    setMmseLanguage("");

    setMocaVisuoExec("");
    setMocaNaming("");
    setMocaAttention("");
    setMocaLanguage("");
    setMocaAbstraction("");
    setMocaDelayedRecall("");
    setMocaOrientation("");
    setMocaEducationBonus(false);
  };

  const left = (
    <div style={{ display: "grid", gap: 14 }}>
      <CalculatorSection title="1) Chức năng cơ bản - Katz ADL">
        <CheckRow label="Tắm rửa độc lập" checked={kBathing} onChange={setKBathing} />
        <CheckRow
          label="Mặc quần áo độc lập"
          checked={kDressing}
          onChange={setKDressing}
        />
        <CheckRow
          label="Đi vệ sinh độc lập"
          checked={kToileting}
          onChange={setKToileting}
        />
        <CheckRow
          label="Di chuyển / chuyển tư thế độc lập"
          checked={kTransfer}
          onChange={setKTransfer}
        />
        <CheckRow
          label="Kiểm soát tiểu tiện / đại tiện"
          checked={kContinence}
          onChange={setKContinence}
        />
        <CheckRow label="Ăn uống độc lập" checked={kFeeding} onChange={setKFeeding} />
      </CalculatorSection>

      <CalculatorSection title="2) Chức năng dụng cụ - Lawton IADL">
        <CheckRow
          label="Sử dụng điện thoại độc lập"
          checked={lPhone}
          onChange={setLPhone}
        />
        <CheckRow label="Mua sắm độc lập" checked={lShopping} onChange={setLShopping} />
        <CheckRow
          label="Chuẩn bị bữa ăn độc lập"
          checked={lFoodPrep}
          onChange={setLFoodPrep}
        />
        <CheckRow
          label="Dọn dẹp nhà cửa độc lập"
          checked={lHousekeeping}
          onChange={setLHousekeeping}
        />
        <CheckRow label="Giặt giũ độc lập" checked={lLaundry} onChange={setLLaundry} />
        <CheckRow
          label="Đi lại / phương tiện độc lập"
          checked={lTransport}
          onChange={setLTransport}
        />
        <CheckRow
          label="Dùng thuốc đúng độc lập"
          checked={lMedication}
          onChange={setLMedication}
        />
        <CheckRow
          label="Quản lý tài chính độc lập"
          checked={lFinance}
          onChange={setLFinance}
        />
      </CalculatorSection>

      <CalculatorSection title="3) Vận động - Tốc độ đi bộ">
        <InputRow
          label="Quãng đường (m)"
          value={toDisplay(walkDistance)}
          type="number"
          min={1}
          step={0.1}
          onChange={(v) => setWalkDistance(v === "" ? "" : Number(v))}
        />
        <InputRow
          label="Thời gian (giây)"
          value={toDisplay(walkTime)}
          type="number"
          min={0.1}
          step={0.1}
          onChange={(v) => setWalkTime(v === "" ? "" : Number(v))}
        />
      </CalculatorSection>

      <CalculatorSection title="4) Vận động - Sức nắm tay">
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>Giới tính</label>
          <select
            className="input"
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        <InputRow
          label="Sức nắm tay tối đa (kg)"
          value={toDisplay(gripStrength)}
          type="number"
          min={0}
          step={0.1}
          onChange={(v) => setGripStrength(v === "" ? "" : Number(v))}
        />
      </CalculatorSection>

      <CalculatorSection title="5) Nhận thức - MMSE (nhập điểm theo miền)">
        <InputRow
          label="Định hướng (0-10)"
          value={toDisplay(mmseOrientation)}
          type="number"
          min={0}
          max={10}
          onChange={(v) =>
            setMmseOrientation(v === "" ? "" : clampNumber(Number(v), 0, 10))
          }
        />
        <InputRow
          label="Ghi nhớ ngay (0-3)"
          value={toDisplay(mmseRegistration)}
          type="number"
          min={0}
          max={3}
          onChange={(v) =>
            setMmseRegistration(v === "" ? "" : clampNumber(Number(v), 0, 3))
          }
        />
        <InputRow
          label="Chú ý / tính toán (0-5)"
          value={toDisplay(mmseAttention)}
          type="number"
          min={0}
          max={5}
          onChange={(v) =>
            setMmseAttention(v === "" ? "" : clampNumber(Number(v), 0, 5))
          }
        />
        <InputRow
          label="Nhớ lại (0-3)"
          value={toDisplay(mmseRecall)}
          type="number"
          min={0}
          max={3}
          onChange={(v) =>
            setMmseRecall(v === "" ? "" : clampNumber(Number(v), 0, 3))
          }
        />
        <InputRow
          label="Ngôn ngữ + lệnh + viết + vẽ (0-9)"
          value={toDisplay(mmseLanguage)}
          type="number"
          min={0}
          max={9}
          onChange={(v) =>
            setMmseLanguage(v === "" ? "" : clampNumber(Number(v), 0, 9))
          }
        />
      </CalculatorSection>

      <CalculatorSection title="6) Nhận thức - MoCA (nhập điểm theo miền)">
        <InputRow
          label="Thị giác - không gian / điều hành (0-5)"
          value={toDisplay(mocaVisuoExec)}
          type="number"
          min={0}
          max={5}
          onChange={(v) =>
            setMocaVisuoExec(v === "" ? "" : clampNumber(Number(v), 0, 5))
          }
        />
        <InputRow
          label="Gọi tên (0-3)"
          value={toDisplay(mocaNaming)}
          type="number"
          min={0}
          max={3}
          onChange={(v) =>
            setMocaNaming(v === "" ? "" : clampNumber(Number(v), 0, 3))
          }
        />
        <InputRow
          label="Chú ý (0-6)"
          value={toDisplay(mocaAttention)}
          type="number"
          min={0}
          max={6}
          onChange={(v) =>
            setMocaAttention(v === "" ? "" : clampNumber(Number(v), 0, 6))
          }
        />
        <InputRow
          label="Ngôn ngữ (0-3)"
          value={toDisplay(mocaLanguage)}
          type="number"
          min={0}
          max={3}
          onChange={(v) =>
            setMocaLanguage(v === "" ? "" : clampNumber(Number(v), 0, 3))
          }
        />
        <InputRow
          label="Trừu tượng (0-2)"
          value={toDisplay(mocaAbstraction)}
          type="number"
          min={0}
          max={2}
          onChange={(v) =>
            setMocaAbstraction(v === "" ? "" : clampNumber(Number(v), 0, 2))
          }
        />
        <InputRow
          label="Nhớ lại muộn (0-5)"
          value={toDisplay(mocaDelayedRecall)}
          type="number"
          min={0}
          max={5}
          onChange={(v) =>
            setMocaDelayedRecall(v === "" ? "" : clampNumber(Number(v), 0, 5))
          }
        />
        <InputRow
          label="Định hướng (0-6)"
          value={toDisplay(mocaOrientation)}
          type="number"
          min={0}
          max={6}
          onChange={(v) =>
            setMocaOrientation(v === "" ? "" : clampNumber(Number(v), 0, 6))
          }
        />

        <CheckRow
          label="Cộng 1 điểm nếu học vấn ≤ 12 năm"
          checked={mocaEducationBonus}
          onChange={setMocaEducationBonus}
        />
      </CalculatorSection>
    </div>
  );

  const right = (
    <div style={{ display: "grid", gap: 14 }}>
      <CalculatorBox>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
          Tóm tắt kết quả
        </div>

        <ResultItem label="Katz ADL" value={`${katzScore}/6`} note={katzInterpretation} />
        <ResultItem
          label="Lawton IADL"
          value={`${lawtonScore}/8`}
          note={lawtonInterpretation}
        />
        <ResultItem
          label="Tốc độ đi bộ"
          value={gaitSpeed == null ? "--" : `${gaitSpeed} m/s`}
          note={gaitInterpretation}
        />
        <ResultItem
          label="Sức nắm tay"
          value={gripStrength === "" ? "--" : `${gripStrength} kg`}
          note={gripInterpretation}
        />
        <ResultItem
          label="MMSE"
          value={mmseScore == null ? "--" : `${mmseScore}/30`}
          note={mmseInterpretation}
        />
        <ResultItem
          label="MoCA"
          value={mocaScore == null ? "--" : `${mocaScore}/30`}
          note={mocaInterpretation}
        />
      </CalculatorBox>

      <CalculatorBox>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Diễn giải nhanh</div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Katz càng cao càng độc lập tốt trong hoạt động cơ bản.</li>
          <li>Lawton càng cao càng độc lập tốt trong sinh hoạt cộng đồng.</li>
          <li>Tốc độ đi bộ chậm và sức nắm thấp gợi ý suy giảm vận động.</li>
          <li>MMSE và MoCA là công cụ sàng lọc, không thay thế chẩn đoán.</li>
        </ul>
      </CalculatorBox>

      <CalculatorBox>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Lưu ý</div>
        <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          MMSE và MoCA trong trang này đang ở dạng nhập điểm theo miền để phục vụ
          tính toán và diễn giải nhanh. Khi cần, bạn có thể làm tiếp bản popup
          hướng dẫn chấm điểm chi tiết hoặc lưu kết quả vào hồ sơ bệnh án.
        </div>
      </CalculatorBox>
    </div>
  );

  return (
    <CalculatorTemplate
      title="Đánh giá lão khoa"
      subtitle="Katz, Lawton, tốc độ đi bộ, sức nắm tay, MMSE, MoCA"
      leftTitle="Nhập dữ liệu"
      rightTitle="Kết quả"
      onReset={handleReset}
      topNote={
        <>Dùng để sàng lọc nhanh chức năng, vận động và nhận thức ở người cao tuổi.</>
      }
      bottomNote={
        <>
          Điểm số chỉ có giá trị hỗ trợ lâm sàng, cần kết hợp bệnh sử, khám và bối
          cảnh thực tế của người bệnh.
        </>
      }
      left={left}
      right={right}
    />
  );
}

function InputRow(props: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const { label, value, onChange, type = "text", min, max, step } = props;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 700 }}>{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CheckRow(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { label, checked, onChange } = props;

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        border: "1px solid var(--line)",
        borderRadius: 12,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function ResultItem(props: {
  label: string;
  value: string;
  note: string;
}) {
  const { label, value, note } = props;

  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
        }}
      >
        <div style={{ fontWeight: 800 }}>{label}</div>
        <div style={{ fontWeight: 900 }}>{value}</div>
      </div>
      <div style={{ marginTop: 4, color: "var(--muted)", lineHeight: 1.6 }}>
        {note}
      </div>
    </div>
  );
}