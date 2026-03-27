import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPatientMonitoringContextByToken,
  submitPatientMonitoringSubmission,
  type PatientMonitoringContext,
} from "../../features/patient-monitoring/lib/monitoringApi";

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function PatientMonitoringPortalPage() {
  const { token = "" } = useParams<{ token: string }>();

  const [loadingContext, setLoadingContext] = useState(true);
  const [contextError, setContextError] = useState("");
  const [context, setContext] = useState<PatientMonitoringContext | null>(null);

  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [note, setNote] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [filePickerKey, setFilePickerKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadContext() {
      try {
        setLoadingContext(true);
        setContextError("");
        setContext(null);

        const loaded = await getPatientMonitoringContextByToken(token);

        if (!alive) return;

        if (!loaded) {
          setContextError("Liên kết theo dõi không hợp lệ hoặc đã hết hạn.");
          return;
        }

        setContext(loaded);
      } catch (error) {
        if (!alive) return;

        const message =
          error instanceof Error
            ? error.message
            : "Không tải được thông tin liên kết theo dõi.";
        setContextError(message);
      } finally {
        if (alive) {
          setLoadingContext(false);
        }
      }
    }

    void loadContext();

    return () => {
      alive = false;
    };
  }, [token]);

  const hasAnyInput = useMemo(() => {
    return Boolean(
      systolicBp.trim() ||
        diastolicBp.trim() ||
        heartRate.trim() ||
        bloodGlucose.trim() ||
        note.trim() ||
        files.length
    );
  }, [systolicBp, diastolicBp, heartRate, bloodGlucose, note, files.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAnyInput) {
      setSubmitError("Vui lòng nhập ít nhất một dữ liệu hoặc chọn ít nhất một ảnh.");
      setSubmitSuccess("");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      await submitPatientMonitoringSubmission({
        token,
        systolicBp: parseOptionalNumber(systolicBp),
        diastolicBp: parseOptionalNumber(diastolicBp),
        heartRate: parseOptionalNumber(heartRate),
        bloodGlucose: parseOptionalNumber(bloodGlucose),
        note,
        files,
      });

      setSystolicBp("");
      setDiastolicBp("");
      setHeartRate("");
      setBloodGlucose("");
      setNote("");
      setFiles([]);
      setFilePickerKey((prev) => prev + 1);

      setSubmitSuccess(
        "Đã gửi dữ liệu thành công. Cảm ơn bạn đã cập nhật theo dõi tại nhà."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không gửi được dữ liệu theo dõi.";
      setSubmitError(message);
      setSubmitSuccess("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(239,246,255,1) 0%, rgba(248,250,252,1) 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(880px, 100%)",
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #dbeafe",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 12px 36px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Theo dõi tại nhà
          </div>

          <div
            style={{
              fontSize: 15,
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            Vui lòng nhập kết quả huyết áp, đường huyết và tải ảnh bữa ăn /
            ảnh máy đo nếu có. Bác sĩ sẽ xem lại dữ liệu bạn gửi sau.
          </div>

          {loadingContext ? (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 14,
                border: "1px solid #dbeafe",
                background: "#eff6ff",
                color: "#1d4ed8",
              }}
            >
              Đang tải thông tin liên kết...
            </div>
          ) : null}

          {!loadingContext && contextError ? (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 14,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {contextError}
            </div>
          ) : null}

          {!loadingContext && !contextError && context ? (
            <div
              style={{
                marginTop: 18,
                display: "grid",
                gap: 8,
                padding: 16,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {context.patientName || "Bệnh nhân"}
              </div>

              {context.caseCode ? (
                <div style={{ fontSize: 14, color: "#475569" }}>
                  Mã ca: {context.caseCode}
                </div>
              ) : null}

              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Bạn có thể gửi từng lần đo riêng. Không bắt buộc phải điền đầy đủ
                tất cả ô trong một lần.
              </div>
            </div>
          ) : null}
        </section>

        {!loadingContext && !contextError && context ? (
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 12px 36px rgba(15, 23, 42, 0.08)",
              display: "grid",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>
                  Huyết áp tâm thu
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={systolicBp}
                  onChange={(event) => setSystolicBp(event.target.value)}
                  placeholder="Ví dụ 130"
                  style={inputStyle}
                />
                <span style={hintStyle}>Đơn vị: mmHg</span>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>
                  Huyết áp tâm trương
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={diastolicBp}
                  onChange={(event) => setDiastolicBp(event.target.value)}
                  placeholder="Ví dụ 80"
                  style={inputStyle}
                />
                <span style={hintStyle}>Đơn vị: mmHg</span>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Mạch</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={heartRate}
                  onChange={(event) => setHeartRate(event.target.value)}
                  placeholder="Ví dụ 76"
                  style={inputStyle}
                />
                <span style={hintStyle}>Đơn vị: bpm</span>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>
                  Đường huyết
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={bloodGlucose}
                  onChange={(event) => setBloodGlucose(event.target.value)}
                  placeholder="Ví dụ 7.2"
                  style={inputStyle}
                />
                <span style={hintStyle}>Đơn vị mặc định: mmol/L</span>
              </label>
            </div>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Ghi chú ngắn / mô tả bữa ăn
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ví dụ: Sau ăn 2 giờ, ăn cơm + cá + rau..."
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 120,
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Ảnh bữa ăn / ảnh máy đo
              </span>

              <input
                key={filePickerKey}
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  setFiles(Array.from(event.target.files ?? []));
                }}
                style={inputStyle}
              />

              <span style={hintStyle}>
                Có thể chọn nhiều ảnh trong cùng một lần gửi.
              </span>

              {files.length ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginTop: 4,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      style={{ fontSize: 14, color: "#334155" }}
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : null}
            </label>

            {submitError ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#b91c1c",
                }}
              >
                {submitError}
              </div>
            ) : null}

            {submitSuccess ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #bbf7d0",
                  background: "#f0fdf4",
                  color: "#166534",
                }}
              >
                {submitSuccess}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={submitting}
                style={{
                  border: "1px solid #2563eb",
                  background: submitting ? "#bfdbfe" : "#2563eb",
                  color: "#ffffff",
                  borderRadius: 14,
                  padding: "14px 18px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {submitting ? "Đang gửi..." : "Gửi dữ liệu"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setSystolicBp("");
                  setDiastolicBp("");
                  setHeartRate("");
                  setBloodGlucose("");
                  setNote("");
                  setFiles([]);
                  setFilePickerKey((prev) => prev + 1);
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  borderRadius: 14,
                  padding: "14px 18px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Xóa nội dung vừa nhập
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
};
