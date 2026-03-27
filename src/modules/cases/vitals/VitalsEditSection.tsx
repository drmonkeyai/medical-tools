import { useEffect, useMemo, useState } from "react";
import { useUpsertAssessmentVitals } from "../../../features/cases/hooks/useUpsertAssessmentVitals";

type VitalsData = {
  assessment_id?: string;
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  heart_rate?: number | null;
  temperature_c?: number | null;
  respiratory_rate?: number | null;
  spo2_percent?: number | null;
  waist_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
} | null;

type Props = {
  assessmentId?: string;
  data: VitalsData;
  onChanged?: () => Promise<void> | void;
};

function numToInput(value?: number | null) {
  return value === null || value === undefined ? "" : String(value);
}

function inputToNullableNumber(value: string) {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function VitalsEditSection({
  assessmentId,
  data,
  onChanged,
}: Props) {
  const { upsertAssessmentVitals } = useUpsertAssessmentVitals();

  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperatureC, setTemperatureC] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [spo2Percent, setSpo2Percent] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bmi, setBmi] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSystolicBp(numToInput(data?.systolic_bp));
    setDiastolicBp(numToInput(data?.diastolic_bp));
    setHeartRate(numToInput(data?.heart_rate));
    setTemperatureC(numToInput(data?.temperature_c));
    setRespiratoryRate(numToInput(data?.respiratory_rate));
    setSpo2Percent(numToInput(data?.spo2_percent));
    setWaistCm(numToInput(data?.waist_cm));
    setHeightCm(numToInput(data?.height_cm));
    setWeightKg(numToInput(data?.weight_kg));
    setBmi(numToInput(data?.bmi));
  }, [data]);

  const computedBmi = useMemo(() => {
    const h = inputToNullableNumber(heightCm);
    const w = inputToNullableNumber(weightKg);

    if (!h || !w || h <= 0 || w <= 0) return null;

    const hm = h / 100;
    const value = w / (hm * hm);
    return Number(value.toFixed(2));
  }, [heightCm, weightKg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assessmentId) {
      setError("Thiếu assessmentId.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await upsertAssessmentVitals({
        assessmentId,
        systolicBp: inputToNullableNumber(systolicBp),
        diastolicBp: inputToNullableNumber(diastolicBp),
        heartRate: inputToNullableNumber(heartRate),
        temperatureC: inputToNullableNumber(temperatureC),
        respiratoryRate: inputToNullableNumber(respiratoryRate),
        spo2Percent: inputToNullableNumber(spo2Percent),
        waistCm: inputToNullableNumber(waistCm),
        heightCm: inputToNullableNumber(heightCm),
        weightKg: inputToNullableNumber(weightKg),
        bmi: computedBmi ?? inputToNullableNumber(bmi),
      });

      if (computedBmi !== null) {
        setBmi(String(computedBmi));
      }

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được sinh hiệu.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function renderInput(
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder?: string
  ) {
    return (
      <div>
        <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
          {label}
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="number"
          step="any"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            background: "#fff",
          }}
        />
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Vitals / Anthropometry</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 16,
          padding: 16,
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {renderInput("Huyết áp tâm thu", systolicBp, setSystolicBp, "mmHg")}
          {renderInput("Huyết áp tâm trương", diastolicBp, setDiastolicBp, "mmHg")}
          {renderInput("Mạch", heartRate, setHeartRate, "bpm")}
          {renderInput("Nhiệt độ", temperatureC, setTemperatureC, "°C")}
          {renderInput("Nhịp thở", respiratoryRate, setRespiratoryRate, "/min")}
          {renderInput("SpO2", spo2Percent, setSpo2Percent, "%")}
          {renderInput("Vòng eo", waistCm, setWaistCm, "cm")}
          {renderInput("Chiều cao", heightCm, setHeightCm, "cm")}
          {renderInput("Cân nặng", weightKg, setWeightKg, "kg")}
          {renderInput("BMI", bmi, setBmi, "kg/m²")}
        </div>

        {computedBmi !== null ? (
          <div style={{ fontSize: 14, color: "#475569" }}>
            BMI tính tự động từ chiều cao/cân nặng: <strong>{computedBmi}</strong>
          </div>
        ) : null}

        {error ? (
          <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: saving ? "#e2e8f0" : "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Đang lưu..." : "Lưu sinh hiệu"}
          </button>
        </div>
      </form>
    </section>
  );
}