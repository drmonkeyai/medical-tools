import { useMemo, useState } from "react";
import { useManageTreatments } from "../../../features/cases/hooks/useManageTreatments";

type TreatmentItem = {
  id: string;
  treatmentType: string;
  treatmentName: string;
  description?: string | null;
  doseOrFrequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  status?: string | null;
};

type Props = {
  assessmentId?: string;
  data: { items?: unknown[] } | null;
  onChanged?: () => Promise<void> | void;
};

function normalizeItems(data: { items?: unknown[] } | null): TreatmentItem[] {
  const rawItems = Array.isArray(data?.items) ? data.items : [];

  return rawItems.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;

    return {
      id: String(item.id ?? ""),
      treatmentType: String(item.type ?? item.treatmentType ?? item.treatment_type ?? ""),
      treatmentName: String(item.name ?? item.treatmentName ?? item.treatment_name ?? ""),
      description: (item.description ?? "") as string,
      doseOrFrequency: (item.doseOrFrequency ?? item.dose_or_frequency ?? "") as string,
      duration: (item.duration ?? "") as string,
      instructions: (item.instructions ?? "") as string,
      status: (item.status ?? "active") as string,
    };
  });
}

export default function TreatmentEditSection({
  assessmentId,
  data,
  onChanged,
}: Props) {
  const { createTreatment, updateTreatment, deleteTreatment } = useManageTreatments();

  const items = useMemo(() => normalizeItems(data), [data]);

  const [newType, setNewType] = useState("medication");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDoseOrFrequency, setNewDoseOrFrequency] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [savingNew, setSavingNew] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!assessmentId) {
      setError("Thiếu assessmentId.");
      return;
    }

    try {
      setSavingNew(true);
      setError("");

      await createTreatment({
        assessmentId,
        treatmentType: newType,
        treatmentName: newName,
        description: newDescription,
        doseOrFrequency: newDoseOrFrequency,
        duration: newDuration,
        instructions: newInstructions,
        status: newStatus,
      });

      setNewType("medication");
      setNewName("");
      setNewDescription("");
      setNewDoseOrFrequency("");
      setNewDuration("");
      setNewInstructions("");
      setNewStatus("active");

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không tạo được điều trị.";
      setError(message);
    } finally {
      setSavingNew(false);
    }
  }

  async function handleUpdate(item: TreatmentItem) {
    try {
      setWorkingId(item.id);
      setError("");

      await updateTreatment({
        treatmentId: item.id,
        treatmentType: item.treatmentType,
        treatmentName: item.treatmentName,
        description: item.description ?? "",
        doseOrFrequency: item.doseOrFrequency ?? "",
        duration: item.duration ?? "",
        instructions: item.instructions ?? "",
        status: item.status ?? "active",
      });

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không cập nhật được điều trị.";
      setError(message);
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      setWorkingId(id);
      setError("");

      await deleteTreatment(id);
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không xóa được điều trị.";
      setError(message);
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Treatment</h2>

      <form
        onSubmit={handleCreate}
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
        <input
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          placeholder="Loại điều trị"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên điều trị"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={3}
          placeholder="Mô tả"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            resize: "vertical",
          }}
        />

        <input
          value={newDoseOrFrequency}
          onChange={(e) => setNewDoseOrFrequency(e.target.value)}
          placeholder="Liều / tần suất"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <input
          value={newDuration}
          onChange={(e) => setNewDuration(e.target.value)}
          placeholder="Thời gian"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <textarea
          value={newInstructions}
          onChange={(e) => setNewInstructions(e.target.value)}
          rows={3}
          placeholder="Hướng dẫn"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            resize: "vertical",
          }}
        />

        <input
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          placeholder="Status"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        {error ? (
          <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={savingNew}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: savingNew ? "#e2e8f0" : "#fff",
              cursor: savingNew ? "not-allowed" : "pointer",
            }}
          >
            {savingNew ? "Đang thêm..." : "Thêm treatment"}
          </button>
        </div>
      </form>

      {!items.length ? (
        <div className="text-sm text-gray-500">
          Chưa có dữ liệu điều trị cho lần đánh giá này.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <TreatmentEditorCard
              key={item.id || index}
              item={item}
              working={workingId === item.id}
              onSave={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TreatmentEditorCard({
  item,
  working,
  onSave,
  onDelete,
}: {
  item: TreatmentItem;
  working: boolean;
  onSave: (item: TreatmentItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TreatmentItem>(item);

  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <div style={{ display: "grid", gap: 12 }}>
        <input
          value={draft.treatmentType}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, treatmentType: e.target.value }))
          }
          placeholder="Loại điều trị"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <input
          value={draft.treatmentName}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, treatmentName: e.target.value }))
          }
          placeholder="Tên điều trị"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <textarea
          value={draft.description ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          placeholder="Mô tả"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            resize: "vertical",
          }}
        />

        <input
          value={draft.doseOrFrequency ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, doseOrFrequency: e.target.value }))
          }
          placeholder="Liều / tần suất"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <input
          value={draft.duration ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, duration: e.target.value }))
          }
          placeholder="Thời gian"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <textarea
          value={draft.instructions ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, instructions: e.target.value }))
          }
          rows={3}
          placeholder="Hướng dẫn"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            resize: "vertical",
          }}
        />

        <input
          value={draft.status ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, status: e.target.value }))
          }
          placeholder="Status"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={working}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: working ? "not-allowed" : "pointer",
            }}
          >
            {working ? "Đang lưu..." : "Lưu"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={working}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #fecaca",
              background: "#fff",
              color: "#b91c1c",
              cursor: working ? "not-allowed" : "pointer",
            }}
          >
            {working ? "Đang xử lý..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}