import { useMemo, useState } from "react";
import { useManageDiagnoses } from "../../../features/cases/hooks/useManageDiagnoses";

type DiagnosisItem = {
  id: string;
  diagnosisType: string;
  diagnosisName: string;
  icd10Code?: string | null;
  isActive?: boolean;
  note?: string | null;
};

type Props = {
  assessmentId?: string;
  data: { items?: unknown[] } | null;
  onChanged?: () => Promise<void> | void;
};

function normalizeItems(data: { items?: unknown[] } | null): DiagnosisItem[] {
  const rawItems = Array.isArray(data?.items) ? data.items : [];

  return rawItems.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;

    return {
      id: String(item.id ?? ""),
      diagnosisType: String(item.type ?? item.diagnosisType ?? item.diagnosis_type ?? ""),
      diagnosisName: String(item.name ?? item.diagnosisName ?? item.diagnosis_name ?? ""),
      icd10Code: (item.icd10Code ?? item.icd10_code ?? "") as string,
      isActive:
        typeof item.isActive === "boolean"
          ? item.isActive
          : typeof item.is_active === "boolean"
          ? (item.is_active as boolean)
          : true,
      note: (item.note ?? "") as string,
    };
  });
}

export default function DiagnosesEditSection({
  assessmentId,
  data,
  onChanged,
}: Props) {
  const { createDiagnosis, updateDiagnosis, deleteDiagnosis } = useManageDiagnoses();

  const items = useMemo(() => normalizeItems(data), [data]);

  const [newType, setNewType] = useState("problem");
  const [newName, setNewName] = useState("");
  const [newIcd10, setNewIcd10] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
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

      await createDiagnosis({
        assessmentId,
        diagnosisType: newType,
        diagnosisName: newName,
        icd10Code: newIcd10,
        note: newNote,
        isActive: newIsActive,
      });

      setNewType("problem");
      setNewName("");
      setNewIcd10("");
      setNewNote("");
      setNewIsActive(true);

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không tạo được chẩn đoán.";
      setError(message);
    } finally {
      setSavingNew(false);
    }
  }

  async function handleUpdate(item: DiagnosisItem) {
    try {
      setWorkingId(item.id);
      setError("");

      await updateDiagnosis({
        diagnosisId: item.id,
        diagnosisType: item.diagnosisType,
        diagnosisName: item.diagnosisName,
        icd10Code: item.icd10Code ?? "",
        note: item.note ?? "",
        isActive: item.isActive ?? true,
      });

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không cập nhật được chẩn đoán.";
      setError(message);
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      setWorkingId(id);
      setError("");

      await deleteDiagnosis(id);
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không xóa được chẩn đoán.";
      setError(message);
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Diagnoses</h2>

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
        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Loại chẩn đoán
          </label>
          <input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
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
            Tên chẩn đoán
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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
            ICD-10
          </label>
          <input
            value={newIcd10}
            onChange={(e) => setNewIcd10(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
            }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={newIsActive}
            onChange={(e) => setNewIsActive(e.target.checked)}
          />
          Active
        </label>

        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
            Ghi chú
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
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
            disabled={savingNew}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: savingNew ? "#e2e8f0" : "#fff",
              cursor: savingNew ? "not-allowed" : "pointer",
            }}
          >
            {savingNew ? "Đang thêm..." : "Thêm chẩn đoán"}
          </button>
        </div>
      </form>

      {!items.length ? (
        <div className="text-sm text-gray-500">
          Chưa có chẩn đoán cho lần đánh giá này.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <DiagnosisEditorCard
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

function DiagnosisEditorCard({
  item,
  working,
  onSave,
  onDelete,
}: {
  item: DiagnosisItem;
  working: boolean;
  onSave: (item: DiagnosisItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<DiagnosisItem>(item);

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
          value={draft.diagnosisType}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, diagnosisType: e.target.value }))
          }
          placeholder="Loại chẩn đoán"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <input
          value={draft.diagnosisName}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, diagnosisName: e.target.value }))
          }
          placeholder="Tên chẩn đoán"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <input
          value={draft.icd10Code ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, icd10Code: e.target.value }))
          }
          placeholder="ICD-10"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={draft.isActive ?? true}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          Active
        </label>

        <textarea
          value={draft.note ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, note: e.target.value }))
          }
          rows={3}
          placeholder="Ghi chú"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            resize: "vertical",
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