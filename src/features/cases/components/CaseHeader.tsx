import type { CSSProperties } from "react";

type CaseHeaderProps = {
  patientName?: string | null;
  caseCode?: string | null;
  assessmentDate?: string | null;
  assessmentNo?: number | null;
  creatingAssessment?: boolean;
  savingAssessment?: boolean;
  deletingAssessment?: boolean;
  openingMonitoringQr?: boolean;
  isEditingCurrentAssessment?: boolean;
  onGoHome: () => void;
  onGoCaseList: () => void;
  onCreateAssessment: () => void;
  onEditAssessment: () => void;
  onSaveAssessment: () => void;
  onDeleteAssessment: () => void;
  onOpenMonitoringQr?: () => void;
  createAssessmentError?: string;
  saveAssessmentError?: string;
  deleteAssessmentError?: string;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

function ActionButton({
  label,
  onClick,
  tone = "default",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "primary" | "success" | "danger";
  disabled?: boolean;
}) {
  const palette: Record<string, CSSProperties> = {
    default: {
      border: "1px solid #cbd5e1",
      background: "#fff",
      color: "#0f172a",
    },
    primary: {
      border: "1px solid #2563eb",
      background: "#eff6ff",
      color: "#1d4ed8",
    },
    success: {
      border: "1px solid #16a34a",
      background: "#f0fdf4",
      color: "#166534",
    },
    danger: {
      border: "1px solid #fca5a5",
      background: "#fff1f2",
      color: "#b91c1c",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 18px",
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        ...palette[tone],
      }}
    >
      {label}
    </button>
  );
}

function ErrorText({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <div
      style={{
        marginTop: 10,
        fontSize: 13,
        color: "#b91c1c",
      }}
    >
      {text}
    </div>
  );
}

export default function CaseHeader({
  patientName,
  caseCode,
  assessmentDate,
  assessmentNo,
  creatingAssessment = false,
  savingAssessment = false,
  deletingAssessment = false,
  openingMonitoringQr = false,
  isEditingCurrentAssessment = false,
  onGoHome,
  onGoCaseList,
  onCreateAssessment,
  onEditAssessment,
  onSaveAssessment,
  onDeleteAssessment,
  onOpenMonitoringQr,
  createAssessmentError,
  saveAssessmentError,
  deleteAssessmentError,
}: CaseHeaderProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 20,
        margin: 20,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 280, flex: 1 }}>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              fontSize: 14,
              color: "#64748b",
              marginBottom: 10,
            }}
          >
            <span>Mã ca: {caseCode || "—"}</span>
            <span>Ngày giờ đánh giá: {formatDateTime(assessmentDate)}</span>
            <span>
              Lần đánh giá: {assessmentNo != null ? assessmentNo : "—"}
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.15,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {patientName || "Chưa có tên người bệnh"}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <ActionButton label="Về trang chủ" onClick={onGoHome} />
          <ActionButton label="Danh sách ca" onClick={onGoCaseList} />

          {onOpenMonitoringQr ? (
            <ActionButton
              label={
                openingMonitoringQr ? "Đang tạo QR..." : "QR theo dõi tại nhà"
              }
              onClick={onOpenMonitoringQr}
              tone="primary"
              disabled={
                openingMonitoringQr ||
                creatingAssessment ||
                savingAssessment ||
                deletingAssessment
              }
            />
          ) : null}

          <ActionButton
            label={creatingAssessment ? "Đang tạo..." : "+ Tạo lần đánh giá mới"}
            onClick={onCreateAssessment}
            tone="default"
            disabled={creatingAssessment || savingAssessment || deletingAssessment}
          />

          {!isEditingCurrentAssessment ? (
            <ActionButton
              label="Chỉnh sửa lần đánh giá"
              onClick={onEditAssessment}
              disabled={creatingAssessment || savingAssessment || deletingAssessment}
            />
          ) : (
            <ActionButton
              label={savingAssessment ? "Đang lưu..." : "Lưu lần đánh giá"}
              onClick={onSaveAssessment}
              tone="success"
              disabled={creatingAssessment || savingAssessment || deletingAssessment}
            />
          )}

          <ActionButton
            label={deletingAssessment ? "Đang xóa..." : "Xóa lần đánh giá"}
            onClick={onDeleteAssessment}
            tone="danger"
            disabled={creatingAssessment || savingAssessment || deletingAssessment}
          />
        </div>
      </div>

      <ErrorText text={createAssessmentError} />
      <ErrorText text={saveAssessmentError} />
      <ErrorText text={deleteAssessmentError} />
    </section>
  );
}
