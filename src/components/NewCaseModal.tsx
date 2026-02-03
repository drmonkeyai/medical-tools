// src/components/NewCaseModal.tsx
import { useMemo, useState } from "react";
import { useCases, type Patient } from "../context/CasesContext";

function clampInt(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.floor(v)));
}

export default function NewCaseModal() {
  const { isNewCaseModalOpen, closeNewCaseModal, createCase } = useCases();

  const nowYear = useMemo(() => new Date().getFullYear(), []);
  const [name, setName] = useState("");
  const [yob, setYob] = useState<number>(nowYear - 30);
  const [sex, setSex] = useState<Patient["sex"]>("Nam");

  // optional
  const [weightKg, setWeightKg] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");

  if (!isNewCaseModalOpen) return null;

  const canCreate = name.trim().length >= 1 && yob >= 1900 && yob <= nowYear;

  const onCreate = () => {
    if (!canCreate) return;

    const w = weightKg.trim() ? Number(weightKg) : undefined;
    const h = heightCm.trim() ? Number(heightCm) : undefined;

    const patient: Patient = {
      name: name.trim(),
      yob: clampInt(yob, 1900, nowYear),
      sex,
      weightKg: Number.isFinite(w as number) ? (w as number) : undefined,
      heightCm: Number.isFinite(h as number) ? (h as number) : undefined,
    };

    createCase(patient);

    // reset form
    setName("");
    setYob(nowYear - 30);
    setSex("Nam");
    setWeightKg("");
    setHeightCm("");
  };

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
        // click outside to close
        if (e.target === e.currentTarget) closeNewCaseModal();
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
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Tạo ca mới</div>
            <div style={{ marginTop: 4, color: "var(--muted)" }}>
              Nhập thông tin cơ bản để lưu các lần đánh giá theo ca.
            </div>
          </div>

          <button
            type="button"
            onClick={closeNewCaseModal}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
            title="Đóng"
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {/* name */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Họ tên</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                outline: "none",
                fontWeight: 800,
              }}
            />
          </div>

          {/* yob + sex */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Năm sinh</div>
              <input
                type="number"
                value={yob}
                min={1900}
                max={nowYear}
                onChange={(e) => setYob(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                }}
              />
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Giới</div>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Patient["sex"])}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          {/* optional anthropometrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>
                Cân nặng (kg) <span style={{ color: "var(--muted)", fontWeight: 800 }}>(không bắt buộc)</span>
              </div>
              <input
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="VD: 60"
                inputMode="decimal"
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                }}
              />
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>
                Chiều cao (cm) <span style={{ color: "var(--muted)", fontWeight: 800 }}>(không bắt buộc)</span>
              </div>
              <input
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="VD: 170"
                inputMode="decimal"
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontWeight: 800,
                }}
              />
            </div>
          </div>

          {/* actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={closeNewCaseModal}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "white",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={onCreate}
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
              Tạo ca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
