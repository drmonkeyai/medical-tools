// src/components/CalculatorTemplate.tsx
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type CalculatorTemplateProps = {
  title: string;
  subtitle?: string;
  activeCaseLabel?: string;
  noCaseHint?: string;

  onBack?: () => void;
  onReset?: () => void;
  onSave?: () => void;

  backLabel?: string;
  resetLabel?: string;
  saveLabel?: string;

  topNote?: ReactNode;
  bottomNote?: ReactNode;

  leftTitle?: string;
  rightTitle?: string;

  left: ReactNode;
  right: ReactNode;

  leftSpan?: number;
  rightSpan?: number;

  headerActions?: ReactNode;
};

export default function CalculatorTemplate(props: CalculatorTemplateProps) {
  const navigate = useNavigate();

  const {
    title,
    subtitle,
    activeCaseLabel,
    noCaseHint,

    onBack,
    onReset,
    onSave,

    backLabel = "← Trở về",
    resetLabel = "Reset",
    saveLabel = "Lưu vào ca",

    topNote,
    bottomNote,

    leftTitle = "Nhập dữ liệu",
    rightTitle = "Kết quả",

    left,
    right,

    leftSpan = 7,
    rightSpan = 5,

    headerActions,
  } = props;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handleBack} className="btn" type="button">
              {backLabel}
            </button>

            <div>
              <h1 className="pageTitle" style={{ fontSize: 20, margin: 0 }}>
                {title}
              </h1>

              {subtitle && (
                <div style={{ marginTop: 4, color: "var(--muted)" }}>
                  {subtitle}
                </div>
              )}

              {activeCaseLabel && (
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                  Ca đang chọn: <b>{activeCaseLabel}</b>
                </div>
              )}

              {noCaseHint && (
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                  {noCaseHint}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {headerActions}

            {onReset && (
              <button onClick={onReset} className="btn" type="button">
                {resetLabel}
              </button>
            )}

            {onSave && (
              <button onClick={onSave} className="btnPrimary" type="button">
                {saveLabel}
              </button>
            )}
          </div>
        </div>

        {topNote && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            {topNote}
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: `span ${leftSpan}` }}>
          {leftTitle ? <h2 style={{ marginTop: 0, fontSize: 16 }}>{leftTitle}</h2> : null}
          {left}
        </div>

        <div className="card" style={{ gridColumn: `span ${rightSpan}` }}>
          {rightTitle ? <h2 style={{ marginTop: 0, fontSize: 16 }}>{rightTitle}</h2> : null}
          {right}
        </div>
      </div>

      {bottomNote && (
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          {bottomNote}
        </div>
      )}
    </div>
  );
}

type CalculatorBoxProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function CalculatorBox({ children, style }: CalculatorBoxProps) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid var(--line)",
        background: "white",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type CalculatorSectionProps = {
  title?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
};

export function CalculatorSection({
  title,
  children,
  style,
}: CalculatorSectionProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 12,
        border: "1px solid var(--line)",
        borderRadius: 14,
        background: "white",
        ...style,
      }}
    >
      {title ? <div style={{ fontWeight: 900 }}>{title}</div> : null}
      {children}
    </div>
  );
}