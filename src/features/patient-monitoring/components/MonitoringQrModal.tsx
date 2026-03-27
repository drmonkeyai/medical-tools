import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  open: boolean;
  loading?: boolean;
  error?: string;
  patientName?: string | null;
  monitoringUrl?: string;
  onClose: () => void;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function MonitoringQrModal({
  open,
  loading = false,
  error = "",
  patientName,
  monitoringUrl = "",
  onClose,
}: Props) {
  const qrBoxRef = useRef<HTMLDivElement | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setCopyMessage("");
    }
  }, [open]);

  const title = useMemo(() => {
    return patientName
      ? `QR theo dõi tại nhà - ${patientName}`
      : "QR theo dõi tại nhà";
  }, [patientName]);

  async function handleCopyLink() {
    if (!monitoringUrl) return;

    try {
      await navigator.clipboard.writeText(monitoringUrl);
      setCopyMessage("Đã copy link.");
    } catch {
      setCopyMessage("Không copy được link. Bạn hãy copy thủ công.");
    }
  }

  function handlePrint() {
    const svgMarkup = qrBoxRef.current?.innerHTML ?? "";

    if (!svgMarkup || !monitoringUrl) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=760,height=980");

    if (!printWindow) {
      window.alert("Không mở được cửa sổ in. Hãy kiểm tra popup blocker.");
      return;
    }

    const safeTitle = escapeHtml(title);
    const safePatientName = escapeHtml(patientName || "Bệnh nhân");
    const safeUrl = escapeHtml(monitoringUrl);

    printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 32px;
      color: #0f172a;
      background: #ffffff;
    }
    .sheet {
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 18px;
      padding: 28px;
    }
    .title {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .sub {
      font-size: 16px;
      color: #475569;
      margin-bottom: 18px;
    }
    .qr-box {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      border: 1px dashed #94a3b8;
      border-radius: 18px;
      margin: 24px 0;
    }
    .url {
      font-size: 12px;
      color: #475569;
      word-break: break-all;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      background: #f8fafc;
    }
    .note {
      margin-top: 18px;
      font-size: 14px;
      line-height: 1.6;
    }
    @media print {
      body {
        padding: 0;
      }
      .sheet {
        border: none;
        border-radius: 0;
        max-width: none;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="title">QR theo dõi tại nhà</div>
    <div class="sub">Bệnh nhân: <strong>${safePatientName}</strong></div>

    <div class="qr-box">
      ${svgMarkup}
    </div>

    <div class="url">${safeUrl}</div>

    <div class="note">
      Quét mã để nhập kết quả huyết áp, đường huyết, ghi chú ngắn và tải ảnh bữa ăn / ảnh máy đo tại nhà.
    </div>
  </div>
</body>
</html>`);

    printWindow.document.close();
    printWindow.focus();

    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(720px, 100%)",
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid #cbd5e1",
          boxShadow: "0 20px 48px rgba(15, 23, 42, 0.2)",
          overflow: "hidden",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              QR theo dõi tại nhà
            </div>
            <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
              {patientName || "Bệnh nhân"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              borderRadius: 12,
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Đóng
          </button>
        </div>

        <div style={{ padding: 20, display: "grid", gap: 16 }}>
          {loading ? (
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid #dbeafe",
                background: "#eff6ff",
                color: "#1d4ed8",
              }}
            >
              Đang tạo hoặc lấy QR code cho bệnh nhân...
            </div>
          ) : null}

          {!loading && error ? (
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          ) : null}

          {!loading && !error && monitoringUrl ? (
            <>
              <div
                ref={qrBoxRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 320,
                  borderRadius: 18,
                  border: "1px dashed #94a3b8",
                  background: "#f8fafc",
                  padding: 24,
                }}
              >
                <QRCodeSVG
                  value={monitoringUrl}
                  size={260}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  includeMargin
                />
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: 13,
                  color: "#475569",
                  lineHeight: 1.5,
                  wordBreak: "break-all",
                }}
              >
                {monitoringUrl}
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                Bệnh nhân quét mã này để nhập huyết áp, đường huyết, ghi chú ngắn
                và tải ảnh bữa ăn / ảnh máy đo tại nhà.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyLink();
                  }}
                  style={{
                    border: "1px solid #2563eb",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    borderRadius: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Copy link
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    border: "1px solid #16a34a",
                    background: "#f0fdf4",
                    color: "#166534",
                    borderRadius: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  In QR
                </button>
              </div>

              {copyMessage ? (
                <div style={{ fontSize: 13, color: "#1d4ed8" }}>
                  {copyMessage}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
