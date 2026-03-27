import { useState } from "react";
import { useUpsertPlanItems } from "../../../features/cases/hooks/useUpsertPlanItems";
import type { PlanSectionData } from "./types";

type Props = {
  data: PlanSectionData;
  assessmentId?: string;
  onChanged?: () => Promise<void> | void;
};

const PLAN_TYPE_OPTIONS = [
  "follow_up",
  "lab",
  "imaging",
  "referral",
  "self_care",
  "warning_advice",
  "admin",
];

export default function PlanSection({ data, assessmentId, onChanged }: Props) {
  const { createPlanItem, deletePlanItem } = useUpsertPlanItems();

  const [planType, setPlanType] = useState("follow_up");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assessmentId) {
      setError("Thiếu assessmentId.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createPlanItem({
        assessmentId,
        planType,
        description,
        dueDate,
      });

      setDescription("");
      setDueDate("");

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được kế hoạch.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(planItemId: string) {
    try {
      setDeletingId(planItemId);
      setError("");

      await deletePlanItem(planItemId);
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không xóa được kế hoạch.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Kế hoạch</h2>

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
            Loại kế hoạch
          </label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            {PLAN_TYPE_OPTIONS.map((item: string) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ví dụ: tái khám sau 7 ngày, làm AST/ALT, siêu âm bụng..."
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Hẹn ngày (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
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
            {saving ? "Đang lưu..." : "Lưu kế hoạch"}
          </button>
        </div>
      </form>

      {!data.items.length ? (
        <div className="text-sm text-gray-500">Chưa có kế hoạch.</div>
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
              <div style={{ fontWeight: 600 }}>{item.description}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                {item.type}
                {item.dueDate ? ` • Hẹn: ${item.dueDate}` : ""}
                {item.isCompleted ? " • Đã hoàn tất" : ""}
              </div>

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