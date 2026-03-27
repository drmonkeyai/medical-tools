import { useState } from "react";
import { useUpsertRedFlags } from "../../../features/cases/hooks/useUpsertRedFlags";
import type { RedFlagsSectionData } from "./types";

type Props = {
  data: RedFlagsSectionData;
  assessmentId?: string;
  onChanged?: () => Promise<void> | void;
};

const SEVERITY_OPTIONS = ["low", "moderate", "high", "critical"];

export default function RedFlagsSection({
  data,
  assessmentId,
  onChanged,
}: Props) {
  const { createRedFlag, deleteRedFlag } = useUpsertRedFlags();

  const [flagName, setFlagName] = useState("");
  const [flagCode, setFlagCode] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [note, setNote] = useState("");
  const [isPresent, setIsPresent] = useState(true);
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

      await createRedFlag({
        assessmentId,
        flagName,
        flagCode,
        severity,
        note,
        isPresent,
      });

      setFlagName("");
      setFlagCode("");
      setSeverity("moderate");
      setNote("");
      setIsPresent(true);

      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được red flag.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(redFlagId: string) {
    try {
      setDeletingId(redFlagId);
      setError("");

      await deleteRedFlag(redFlagId);
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không xóa được red flag.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Red Flags</h2>

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
            Tên red flag
          </label>
          <input
            value={flagName}
            onChange={(e) => setFlagName(e.target.value)}
            placeholder="Ví dụ: Sụt cân nhanh, đau ngực khi gắng sức, vàng da..."
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
            Mã (optional)
          </label>
          <input
            value={flagCode}
            onChange={(e) => setFlagCode(e.target.value)}
            placeholder="Ví dụ: chest_pain_red_flag"
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
            Mức độ
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            {SEVERITY_OPTIONS.map((item: string) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

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
            checked={isPresent}
            onChange={(e) => setIsPresent(e.target.checked)}
          />
          Hiện diện
        </label>

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
            {saving ? "Đang lưu..." : "Lưu red flag"}
          </button>
        </div>
      </form>

      {!data.items.length ? (
        <div className="text-sm text-gray-500">
          Chưa ghi nhận red flag chi tiết.
        </div>
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
              <div style={{ fontWeight: 600 }}>{item.name}</div>

              <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                {item.code ? `${item.code} • ` : ""}
                {item.severity ? `${item.severity} • ` : ""}
                {item.isPresent ? "Hiện diện" : "Không hiện diện"}
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