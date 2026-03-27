import { useState } from "react";
import { useUpsertObservations } from "../../../features/cases/hooks/useUpsertObservations";
import type { ObservationsSectionData } from "./types";

type Props = {
  data: ObservationsSectionData;
  assessmentId?: string;
  patientId?: string;
  caseId?: string;
  onChanged?: () => Promise<void> | void;
};

type ValueType = "text" | "numeric" | "boolean" | "date";

export default function ObservationsSection({
  data,
  assessmentId,
  patientId,
  caseId,
  onChanged,
}: Props) {
  const { createObservation, deleteObservation } = useUpsertObservations();

  const [observationCode, setObservationCode] = useState("");
  const [observationLabel, setObservationLabel] = useState("");
  const [valueType, setValueType] = useState<ValueType>("numeric");
  const [valueText, setValueText] = useState("");
  const [valueNumeric, setValueNumeric] = useState("");
  const [valueBoolean, setValueBoolean] = useState(true);
  const [valueDate, setValueDate] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assessmentId || !patientId || !caseId) {
      setError("Thiếu assessmentId / patientId / caseId.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createObservation({
        assessmentId,
        patientId,
        caseId,
        observationCode,
        observationLabel,
        valueType,
        valueText,
        valueNumeric:
          valueType === "numeric" && valueNumeric.trim()
            ? Number(valueNumeric)
            : undefined,
        valueBoolean,
        valueDate,
        unit,
        note,
      });

      setObservationCode("");
      setObservationLabel("");
      setValueType("numeric");
      setValueText("");
      setValueNumeric("");
      setValueBoolean(true);
      setValueDate("");
      setUnit("");
      setNote("");

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được observation.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(observationId: string) {
    try {
      setDeletingId(observationId);
      setError("");

      await deleteObservation(observationId);
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không xóa được observation.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Observations / Labs</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          background: "#fff",
          marginBottom: 16,
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Observation code
          </label>
          <input
            value={observationCode}
            onChange={(e) => setObservationCode(e.target.value)}
            placeholder="Ví dụ: ast, alt, platelet, phq9_item_1"
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Observation label
          </label>
          <input
            value={observationLabel}
            onChange={(e) => setObservationLabel(e.target.value)}
            placeholder="Ví dụ: AST, ALT, Platelet"
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Value type
          </label>
          <select
            value={valueType}
            onChange={(e) => setValueType(e.target.value as ValueType)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <option value="numeric">numeric</option>
            <option value="text">text</option>
            <option value="boolean">boolean</option>
            <option value="date">date</option>
          </select>
        </div>

        {valueType === "numeric" ? (
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Numeric value
            </label>
            <input
              value={valueNumeric}
              onChange={(e) => setValueNumeric(e.target.value)}
              placeholder="Ví dụ: 45"
              type="number"
              step="any"
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            />
          </div>
        ) : null}

        {valueType === "text" ? (
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Text value
            </label>
            <input
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder="Nhập giá trị text"
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            />
          </div>
        ) : null}

        {valueType === "boolean" ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={valueBoolean}
              onChange={(e) => setValueBoolean(e.target.checked)}
            />
            Boolean value
          </label>
        ) : null}

        {valueType === "date" ? (
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Date value
            </label>
            <input
              type="date"
              value={valueDate}
              onChange={(e) => setValueDate(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            />
          </div>
        ) : null}

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Unit (optional)
          </label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ví dụ: U/L, g/L, x10^9/L"
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Ghi chú (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ghi chú thêm nếu cần..."
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              resize: "vertical",
            }}
          />
        </div>

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
            {saving ? "Đang lưu..." : "Lưu observation"}
          </button>
        </div>
      </form>

      {!data.items.length ? (
        <div className="text-sm text-gray-500">Chưa có dữ liệu observations.</div>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>{item.label}</div>

              <div style={{ fontSize: 14, marginTop: 4 }}>
                {item.displayValue}
                {item.unit ? ` ${item.unit}` : ""}
              </div>

              <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                {item.code}
                {item.normalFlag ? ` • ${item.normalFlag}` : ""}
                {item.observedAt ? ` • ${item.observedAt}` : ""}
              </div>

              {item.note ? (
                <div style={{ fontSize: 14, marginTop: 6 }}>{item.note}</div>
              ) : null}

              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #fecaca",
                    background: "#fff",
                    color: "#b91c1c",
                    cursor: deletingId === item.id ? "not-allowed" : "pointer",
                  }}
                >
                  {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}