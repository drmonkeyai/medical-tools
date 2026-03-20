import { useEffect, useMemo, useState } from "react";
import { useCases } from "../../context/CasesContext";

type PatientSex = "Nam" | "Nữ" | "Khác";

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function parseOptionalNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.replace(",", ".");
  const value = Number(normalized);

  if (!Number.isFinite(value)) return undefined;
  return value;
}

function getDefaultYob(nowYear: number) {
  return nowYear - 30;
}

export default function NewCaseModal() {
  const { isNewCaseModalOpen, closeNewCaseModal, createCase } = useCases();

  const nowYear = useMemo(() => new Date().getFullYear(), []);

  const [name, setName] = useState("");
  const [yob, setYob] = useState<number>(getDefaultYob(nowYear));
  const [sex, setSex] = useState<PatientSex>("Nam");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNewCaseModalOpen) {
      resetForm();
      return;
    }
    setError("");
  }, [isNewCaseModalOpen]);

  function resetForm() {
    setName("");
    setYob(getDefaultYob(nowYear));
    setSex("Nam");
    setWeightKg("");
    setHeightCm("");
    setSubmitting(false);
    setError("");
  }

  function handleClose() {
    if (submitting) return;
    closeNewCaseModal();
  }

  const trimmedName = name.trim();
  const parsedWeight = parseOptionalNumber(weightKg);
  const parsedHeight = parseOptionalNumber(heightCm);

  const yobValid = Number.isFinite(yob) && yob >= 1900 && yob <= nowYear;
  const nameValid = trimmedName.length > 0;

  const weightValid =
    weightKg.trim() === "" ||
    (parsedWeight !== undefined && parsedWeight > 0 && parsedWeight <= 500);

  const heightValid =
    heightCm.trim() === "" ||
    (parsedHeight !== undefined && parsedHeight > 0 && parsedHeight <= 300);

  const canCreate =
    nameValid &&
    yobValid &&
    weightValid &&
    heightValid &&
    !submitting;

  async function handleCreate() {
    if (!nameValid) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!yobValid) {
      setError(`Năm sinh phải nằm trong khoảng 1900 đến ${nowYear}.`);
      return;
    }

    if (!weightValid) {
      setError("Cân nặng không hợp lệ.");
      return;
    }

    if (!heightValid) {
      setError("Chiều cao không hợp lệ.");
      return;
    }

    const normalizedYob = clampInt(yob, 1900, nowYear);

    const payload = {
      patient: {
        fullName: trimmedName,
        sex,
        dateOfBirth: `${normalizedYob}-01-01`,
      },
      initialAssessment: {
        assessmentType: "initial" as const,
        assessedAt: new Date().toISOString(),
      },
      initialVitals:
        parsedWeight !== undefined || parsedHeight !== undefined
          ? {
              weightKg: parsedWeight,
              heightCm: parsedHeight,
            }
          : undefined,
    };

    try {
      setSubmitting(true);
      setError("");

      await createCase(payload);

      resetForm();
      closeNewCaseModal();
    } catch (err: any) {
      console.error("CREATE CASE MODAL ERROR:", err);
      setError(err?.message || "Không tạo được ca mới.");
      setSubmitting(false);
    }
  }

  if (!isNewCaseModalOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 14,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="card"
        style={{
          width: "min(720px, 96vw)",
          borderRadius: 18,
          padding: 16,
          background: "white",
          boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Tạo ca mới</div>
            <div style={{ marginTop: 4, color: "var(--muted)" }}>
              Nhập thông tin cơ bản để lưu các lần đánh giá theo ca.
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 900,
              opacity: submitting ? 0.6 : 1,
            }}
            title="Đóng"
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Họ tên</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                outline: "none",
                fontWeight: 800,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Năm sinh</div>
              <input
                type="number"
                value={yob}
                min={1900}
                max={nowYear}
                onChange={(e) => setYob(Number(e.target.value))}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Giới</div>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as PatientSex)}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                  background: "white",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxSizing: "border-box",
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>
                Cân nặng (kg){" "}
                <span style={{ color: "var(--muted)", fontWeight: 800 }}>
                  (không bắt buộc)
                </span>
              </div>
              <input
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="VD: 60"
                inputMode="decimal"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>
                Chiều cao (cm){" "}
                <span style={{ color: "var(--muted)", fontWeight: 800 }}>
                  (không bắt buộc)
                </span>
              </div>
              <input
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="VD: 170"
                inputMode="decimal"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {error ? (
            <div
              style={{
                color: "#dc2626",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 6,
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 900,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "2px solid var(--primary)",
                background: canCreate ? "var(--primary)" : "rgba(37,99,235,0.25)",
                color: "white",
                cursor: canCreate ? "pointer" : "not-allowed",
                fontWeight: 900,
              }}
            >
              {submitting ? "Đang tạo..." : "Tạo ca"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}