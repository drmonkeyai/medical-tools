import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  loadPatientMonitoringForDoctor,
  type PatientMonitoringDoctorSubmission,
} from "../lib/monitoringApi";

type Props = {
  patientId?: string | null;
};

type TrendPoint = {
  dateLabel: string;
  timeLabel: string;
  fullLabel: string;
  value: number;
};

type BloodPressureTrendPoint = {
  dateLabel: string;
  timeLabel: string;
  fullLabel: string;
  systolic: number | null;
  diastolic: number | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function splitDateTimeLabel(value?: string | null) {
  if (!value) {
    return {
      dateLabel: "—",
      timeLabel: "",
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      dateLabel: value,
      timeLabel: "",
    };
  }

  return {
    dateLabel: date.toLocaleDateString("vi-VN"),
    timeLabel: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function sourceTypeLabel(value?: string | null) {
  switch ((value ?? "").trim()) {
    case "bp_home":
      return "HA tại nhà";
    case "glucose_home":
      return "Đường huyết tại nhà";
    case "meal_photo":
      return "Ảnh bữa ăn";
    case "symptom_note":
      return "Ghi chú triệu chứng";
    case "mixed":
      return "Mixed";
    default:
      return value?.trim() || "Không rõ";
  }
}

function statusLabel(value?: string | null) {
  switch ((value ?? "").trim()) {
    case "submitted":
      return "Đã gửi";
    case "reviewed":
      return "Đã xem";
    case "imported":
      return "Đã import";
    default:
      return value?.trim() || "—";
  }
}

function statusTone(value?: string | null) {
  switch ((value ?? "").trim()) {
    case "reviewed":
      return {
        border: "1px solid #bbf7d0",
        background: "#f0fdf4",
        color: "#166534",
      };
    case "imported":
      return {
        border: "1px solid #dbeafe",
        background: "#eff6ff",
        color: "#1d4ed8",
      };
    default:
      return {
        border: "1px solid #fde68a",
        background: "#fffbeb",
        color: "#92400e",
      };
  }
}

function getNumericValue(
  submission: PatientMonitoringDoctorSubmission,
  fieldCode: string
) {
  const row = submission.values.find((item) => item.fieldCode === fieldCode);
  return row?.valueNumeric ?? null;
}

function getTextValue(
  submission: PatientMonitoringDoctorSubmission,
  fieldCode: string
) {
  const row = submission.values.find((item) => item.fieldCode === fieldCode);
  return row?.valueText ?? null;
}

function firstSubmissionWithAnyValue(
  submissions: PatientMonitoringDoctorSubmission[],
  fieldCodes: string[]
) {
  return submissions.find((submission) =>
    fieldCodes.some((code) => {
      const numericValue = getNumericValue(submission, code);
      const textValue = getTextValue(submission, code);
      return (
        (numericValue !== null && numericValue !== undefined) ||
        (typeof textValue === "string" && textValue.trim().length > 0)
      );
    })
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#ffffff",
        padding: 16,
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function buildSingleSeriesTrend(
  submissions: PatientMonitoringDoctorSubmission[],
  fieldCode: string
): TrendPoint[] {
  return [...submissions]
    .reverse()
    .map((submission) => {
      const labels = splitDateTimeLabel(submission.submittedAt);

      return {
        dateLabel: labels.dateLabel,
        timeLabel: labels.timeLabel,
        fullLabel: formatDateTime(submission.submittedAt),
        value: getNumericValue(submission, fieldCode),
      };
    })
    .filter(
      (item): item is TrendPoint =>
        typeof item.value === "number" && Number.isFinite(item.value)
    )
    .slice(-10);
}

function buildBloodPressureTrend(
  submissions: PatientMonitoringDoctorSubmission[]
): BloodPressureTrendPoint[] {
  return [...submissions]
    .reverse()
    .map((submission) => {
      const labels = splitDateTimeLabel(submission.submittedAt);

      return {
        dateLabel: labels.dateLabel,
        timeLabel: labels.timeLabel,
        fullLabel: formatDateTime(submission.submittedAt),
        systolic: getNumericValue(submission, "systolic_bp"),
        diastolic: getNumericValue(submission, "diastolic_bp"),
      };
    })
    .filter(
      (item) =>
        (typeof item.systolic === "number" && Number.isFinite(item.systolic)) ||
        (typeof item.diastolic === "number" && Number.isFinite(item.diastolic))
    )
    .slice(-10);
}

function getYRange(values: number[]) {
  if (!values.length) {
    return { min: 0, max: 1 };
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  if (rawMin === rawMax) {
    return {
      min: rawMin - 1,
      max: rawMax + 1,
    };
  }

  const padding = Math.max((rawMax - rawMin) * 0.15, 1);

  return {
    min: rawMin - padding,
    max: rawMax + padding,
  };
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getYForValue(
  value: number,
  height: number,
  min: number,
  max: number
) {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  return height - ratio * height;
}

function getPointX(index: number, total: number, width: number) {
  if (total <= 1) return width / 2;
  return (index / (total - 1)) * width;
}

function buildPolylinePoints(
  values: Array<number | null>,
  width: number,
  height: number,
  min: number,
  max: number
) {
  const lastIndex = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      if (value === null || value === undefined || !Number.isFinite(value)) {
        return null;
      }

      const x = (index / lastIndex) * width;
      const ratio = max === min ? 0.5 : (value - min) / (max - min);
      const y = height - ratio * height;

      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");
}

function buildDots(
  values: Array<number | null>,
  width: number,
  height: number,
  min: number,
  max: number
) {
  const lastIndex = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      if (value === null || value === undefined || !Number.isFinite(value)) {
        return null;
      }

      const x = (index / lastIndex) * width;
      const ratio = max === min ? 0.5 : (value - min) / (max - min);
      const y = height - ratio * height;

      return { x, y, value };
    })
    .filter(Boolean) as Array<{ x: number; y: number; value: number }>;
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#ffffff",
        padding: 16,
        display: "grid",
        gap: 10,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {subtitle}
        </div>
      </div>

      {children}
    </div>
  );
}

function EmptyChartState() {
  return (
    <div
      style={{
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        color: "#64748b",
        textAlign: "center",
        padding: 16,
        lineHeight: 1.6,
      }}
    >
      Chưa đủ dữ liệu để hiển thị biểu đồ diễn tiến.
    </div>
  );
}

function SingleSeriesTrendChart({
  title,
  subtitle,
  points,
  unit,
  stroke,
  fill,
}: {
  title: string;
  subtitle: string;
  points: TrendPoint[];
  unit: string;
  stroke: string;
  fill: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!points.length) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChartState />
      </ChartCard>
    );
  }

  const width = 760;
  const height = 200;
  const chartBottomPadding = 42;
  const range = getYRange(points.map((item) => item.value));
  const values = points.map((item) => item.value);
  const polylinePoints = buildPolylinePoints(
    values,
    width,
    height,
    range.min,
    range.max
  );
  const dots = buildDots(values, width, height, range.min, range.max);

  const hoveredPoint =
    hoveredIndex !== null ? points[hoveredIndex] ?? null : null;
  const hoveredX =
    hoveredIndex !== null ? getPointX(hoveredIndex, points.length, width) : null;
  const hoveredY =
    hoveredPoint && hoveredX !== null
      ? getYForValue(hoveredPoint.value, height, range.min, range.max)
      : null;

  const tooltipWidth = 150;
  const tooltipHeight = 50;
  const tooltipX =
    hoveredX !== null
      ? clampNumber(hoveredX - tooltipWidth / 2, 8, width - tooltipWidth - 8)
      : 0;
  const tooltipY =
    hoveredY !== null
      ? clampNumber(hoveredY - tooltipHeight - 10, 8, height - tooltipHeight - 8)
      : 0;

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          background: "#f8fafc",
          padding: 12,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height + chartBottomPadding}`}
          style={{ width: "100%", height: 280, display: "block" }}
        >
          {[0.25, 0.5, 0.75].map((line) => {
            const y = height * line;
            return (
              <line
                key={line}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polylinePoints}
          />

          {dots.map((dot, index) => (
            <g key={`${dot.x}-${dot.y}-${index}`}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r="6"
                fill={fill}
                stroke={stroke}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {hoveredPoint && hoveredX !== null ? (
            <g pointerEvents="none">
              <line
                x1={hoveredX}
                y1={0}
                x2={hoveredX}
                y2={height}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="10"
                fill="#0f172a"
                opacity="0.94"
              />

              <text
                x={tooltipX + 12}
                y={tooltipY + 18}
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
              >
                {hoveredPoint.dateLabel} {hoveredPoint.timeLabel}
              </text>

              <text
                x={tooltipX + 12}
                y={tooltipY + 37}
                fill={fill}
                fontSize="12"
                fontWeight="700"
              >
                {`${hoveredPoint.value} ${unit}`}
              </text>
            </g>
          ) : null}

          {points.map((point, index) => {
            const x = getPointX(index, points.length, width);

            return (
              <g key={`${point.fullLabel}-${index}`}>
                <text
                  x={x}
                  y={height + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {point.dateLabel}
                </text>
                <text
                  x={x}
                  y={height + 32}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {point.timeLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        {points.map((point, index) => (
          <div
            key={`${point.fullLabel}-${index}`}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 10,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
              {point.dateLabel}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
              {point.timeLabel}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {point.value} {unit}
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function BloodPressureTrendChart({
  points,
}: {
  points: BloodPressureTrendPoint[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!points.length) {
    return (
      <ChartCard
        title="Diễn tiến huyết áp"
        subtitle="Theo các lần bệnh nhân gửi số đo tại nhà"
      >
        <EmptyChartState />
      </ChartCard>
    );
  }

  const width = 760;
  const height = 200;
  const chartBottomPadding = 42;

  const allValues = points.flatMap((item) =>
    [item.systolic, item.diastolic].filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value)
    )
  );

  const range = getYRange([...allValues, 70, 120, 140]);

  const systolicValues = points.map((item) => item.systolic);
  const diastolicValues = points.map((item) => item.diastolic);

  const systolicPolyline = buildPolylinePoints(
    systolicValues,
    width,
    height,
    range.min,
    range.max
  );
  const diastolicPolyline = buildPolylinePoints(
    diastolicValues,
    width,
    height,
    range.min,
    range.max
  );

  const systolicDots = buildDots(
    systolicValues,
    width,
    height,
    range.min,
    range.max
  );
  const diastolicDots = buildDots(
    diastolicValues,
    width,
    height,
    range.min,
    range.max
  );

  const greenLow = Math.max(70, range.min);
  const greenHigh = Math.min(120, range.max);

  const yellowLow = Math.max(120, range.min);
  const yellowHigh = Math.min(140, range.max);

  const orangeLow = Math.max(140, range.min);
  const orangeHigh = range.max;

  const greenTopY =
    greenHigh > greenLow
      ? getYForValue(greenHigh, height, range.min, range.max)
      : null;
  const greenBottomY =
    greenHigh > greenLow
      ? getYForValue(greenLow, height, range.min, range.max)
      : null;

  const yellowTopY =
    yellowHigh > yellowLow
      ? getYForValue(yellowHigh, height, range.min, range.max)
      : null;
  const yellowBottomY =
    yellowHigh > yellowLow
      ? getYForValue(yellowLow, height, range.min, range.max)
      : null;

  const orangeTopY =
    orangeHigh > orangeLow
      ? getYForValue(orangeHigh, height, range.min, range.max)
      : null;
  const orangeBottomY =
    orangeHigh > orangeLow
      ? getYForValue(orangeLow, height, range.min, range.max)
      : null;

  const hoveredPoint =
    hoveredIndex !== null ? points[hoveredIndex] ?? null : null;

  const hoveredX =
    hoveredIndex !== null ? getPointX(hoveredIndex, points.length, width) : null;

  const hoveredSystolicY =
    hoveredPoint && typeof hoveredPoint.systolic === "number"
      ? getYForValue(hoveredPoint.systolic, height, range.min, range.max)
      : null;

  const hoveredDiastolicY =
    hoveredPoint && typeof hoveredPoint.diastolic === "number"
      ? getYForValue(hoveredPoint.diastolic, height, range.min, range.max)
      : null;

  const tooltipWidth = 170;
  const tooltipHeight = 66;
  const tooltipX =
    hoveredX !== null
      ? clampNumber(hoveredX - tooltipWidth / 2, 8, width - tooltipWidth - 8)
      : 0;

  const tooltipAnchorY = Math.min(
    hoveredSystolicY ?? height,
    hoveredDiastolicY ?? height
  );

  const tooltipY = clampNumber(
    tooltipAnchorY - tooltipHeight - 10,
    8,
    height - tooltipHeight - 8
  );

  const thresholdLines = [
    { value: 70, label: "70", color: "#16a34a" },
    { value: 120, label: "120", color: "#eab308" },
    { value: 140, label: "140", color: "#f97316" },
  ];

  return (
    <ChartCard
      title="Diễn tiến huyết áp"
      subtitle="Theo các lần bệnh nhân gửi số đo tại nhà"
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 13,
          color: "#475569",
          fontWeight: 600,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#2563eb",
              display: "inline-block",
            }}
          />
          Tâm thu
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#f97316",
              display: "inline-block",
            }}
          />
          Tâm trương
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 4,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.28)",
              display: "inline-block",
            }}
          />
          70 - 120 mmHg
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 4,
              background: "rgba(250,204,21,0.14)",
              border: "1px solid rgba(250,204,21,0.35)",
              display: "inline-block",
            }}
          />
          120 - 140 mmHg
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 4,
              background: "rgba(249,115,22,0.14)",
              border: "1px solid rgba(249,115,22,0.35)",
              display: "inline-block",
            }}
          />
          {">"} 140 mmHg
        </span>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          background: "#f8fafc",
          padding: 12,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height + chartBottomPadding}`}
          style={{ width: "100%", height: 280, display: "block" }}
        >
          {greenTopY !== null && greenBottomY !== null ? (
            <rect
              x={0}
              y={greenTopY}
              width={width}
              height={greenBottomY - greenTopY}
              fill="rgba(34,197,94,0.10)"
            />
          ) : null}

          {yellowTopY !== null && yellowBottomY !== null ? (
            <rect
              x={0}
              y={yellowTopY}
              width={width}
              height={yellowBottomY - yellowTopY}
              fill="rgba(250,204,21,0.12)"
            />
          ) : null}

          {orangeTopY !== null && orangeBottomY !== null ? (
            <rect
              x={0}
              y={orangeTopY}
              width={width}
              height={orangeBottomY - orangeTopY}
              fill="rgba(249,115,22,0.12)"
            />
          ) : null}

          {[0.25, 0.5, 0.75].map((line) => {
            const y = height * line;
            return (
              <line
                key={line}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {thresholdLines.map((threshold) => {
            const y = getYForValue(
              threshold.value,
              height,
              range.min,
              range.max
            );

            return (
              <g key={threshold.value}>
                <line
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke={threshold.color}
                  strokeWidth="1"
                  strokeDasharray="6 6"
                  opacity="0.45"
                />
                <text
                  x={width - 4}
                  y={y - 4}
                  textAnchor="end"
                  fontSize="10"
                  fill={threshold.color}
                  fontWeight="700"
                >
                  {threshold.label}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={systolicPolyline}
          />

          <polyline
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={diastolicPolyline}
          />

          {systolicDots.map((dot, index) => (
            <g key={`s-${dot.x}-${dot.y}-${index}`}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r="6"
                fill="#93c5fd"
                stroke="#2563eb"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {diastolicDots.map((dot, index) => (
            <g key={`d-${dot.x}-${dot.y}-${index}`}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r="6"
                fill="#fdba74"
                stroke="#f97316"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {hoveredPoint && hoveredX !== null ? (
            <g pointerEvents="none">
              <line
                x1={hoveredX}
                y1={0}
                x2={hoveredX}
                y2={height}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="10"
                fill="#0f172a"
                opacity="0.94"
              />

              <text
                x={tooltipX + 12}
                y={tooltipY + 18}
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
              >
                {hoveredPoint.dateLabel} {hoveredPoint.timeLabel}
              </text>

              <text
                x={tooltipX + 12}
                y={tooltipY + 38}
                fill="#93c5fd"
                fontSize="12"
                fontWeight="700"
              >
                {`Tâm thu: ${hoveredPoint.systolic ?? "—"} mmHg`}
              </text>

              <text
                x={tooltipX + 12}
                y={tooltipY + 55}
                fill="#fdba74"
                fontSize="12"
                fontWeight="700"
              >
                {`Tâm trương: ${hoveredPoint.diastolic ?? "—"} mmHg`}
              </text>
            </g>
          ) : null}

          {points.map((point, index) => {
            const x = getPointX(index, points.length, width);

            return (
              <g key={`${point.fullLabel}-${index}`}>
                <text
                  x={x}
                  y={height + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {point.dateLabel}
                </text>
                <text
                  x={x}
                  y={height + 32}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {point.timeLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}
      >
        {points.map((point, index) => (
          <div
            key={`${point.fullLabel}-${index}`}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 10,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
              {point.dateLabel}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
              {point.timeLabel}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {point.systolic ?? "—"}/{point.diastolic ?? "—"} mmHg
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export default function PatientMonitoringDoctorSection({ patientId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<
    PatientMonitoringDoctorSubmission[]
  >([]);

  async function loadData() {
    if (!patientId?.trim()) {
      setSubmissions([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const rows = await loadPatientMonitoringForDoctor({
        patientId,
        limit: 20,
      });

      setSubmissions(rows);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không tải được dữ liệu theo dõi tại nhà.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [patientId]);

  const latestSubmission = submissions[0] ?? null;

  const latestBpSubmission = useMemo(() => {
    return firstSubmissionWithAnyValue(submissions, [
      "systolic_bp",
      "diastolic_bp",
    ]);
  }, [submissions]);

  const latestGlucoseSubmission = useMemo(() => {
    return firstSubmissionWithAnyValue(submissions, ["blood_glucose"]);
  }, [submissions]);

  const latestBpText = useMemo(() => {
    if (!latestBpSubmission) return "—";

    const sbp = getNumericValue(latestBpSubmission, "systolic_bp");
    const dbp = getNumericValue(latestBpSubmission, "diastolic_bp");

    if (sbp == null && dbp == null) return "—";
    if (sbp != null && dbp != null) return `${sbp}/${dbp} mmHg`;
    if (sbp != null) return `${sbp} mmHg`;
    return `${dbp} mmHg`;
  }, [latestBpSubmission]);

  const latestGlucoseText = useMemo(() => {
    if (!latestGlucoseSubmission) return "—";
    const glucose = getNumericValue(latestGlucoseSubmission, "blood_glucose");
    if (glucose == null) return "—";
    return `${glucose} mmol/L`;
  }, [latestGlucoseSubmission]);

  const bloodPressureTrend = useMemo(() => {
    return buildBloodPressureTrend(submissions);
  }, [submissions]);

  const pulseTrend = useMemo(() => {
    return buildSingleSeriesTrend(submissions, "heart_rate");
  }, [submissions]);

  const glucoseTrend = useMemo(() => {
    return buildSingleSeriesTrend(submissions, "blood_glucose");
  }, [submissions]);

  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        background: "#ffffff",
        padding: 18,
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            Theo dõi tại nhà
          </div>
          <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
            Bác sĩ có thể xem các chỉ số bệnh nhân đã gửi qua QR code:
            huyết áp, mạch, đường huyết, ghi chú và ảnh tại nhà.
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void loadData();
          }}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #2563eb",
            background: loading ? "#bfdbfe" : "#eff6ff",
            color: "#1d4ed8",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      {!patientId ? (
        <div style={{ color: "#64748b", fontSize: 14 }}>
          Chưa xác định được patientId.
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      ) : null}

      {!error && !loading && submissions.length === 0 ? (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#64748b",
          }}
        >
          Chưa có dữ liệu theo dõi tại nhà nào được gửi từ bệnh nhân.
        </div>
      ) : null}

      {submissions.length > 0 ? (
        <>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <MetricCard
              label="Lần gửi gần nhất"
              value={formatDateTime(latestSubmission?.submittedAt)}
              sub={
                latestSubmission
                  ? `${sourceTypeLabel(latestSubmission.sourceType)} • ${statusLabel(
                      latestSubmission.status
                    )}`
                  : undefined
              }
            />

            <MetricCard
              label="Huyết áp gần nhất"
              value={latestBpText}
              sub={
                latestBpSubmission
                  ? `Gửi lúc ${formatDateTime(latestBpSubmission.submittedAt)}`
                  : "Chưa có dữ liệu huyết áp"
              }
            />

            <MetricCard
              label="Đường huyết gần nhất"
              value={latestGlucoseText}
              sub={
                latestGlucoseSubmission
                  ? `Gửi lúc ${formatDateTime(
                      latestGlucoseSubmission.submittedAt
                    )}`
                  : "Chưa có dữ liệu đường huyết"
              }
            />
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              background: "#f8fafc",
              padding: 16,
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                Biểu đồ diễn tiến
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Hiển thị tối đa 10 lần ghi nhận gần nhất của bệnh nhân.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "1fr",
              }}
            >
              <BloodPressureTrendChart points={bloodPressureTrend} />

              <SingleSeriesTrendChart
                title="Diễn tiến mạch"
                subtitle="Theo các lần bệnh nhân gửi số đo tại nhà"
                points={pulseTrend}
                unit="bpm"
                stroke="#16a34a"
                fill="#86efac"
              />

              <SingleSeriesTrendChart
                title="Diễn tiến đường huyết"
                subtitle="Theo các lần bệnh nhân gửi số đo tại nhà"
                points={glucoseTrend}
                unit="mmol/L"
                stroke="#7c3aed"
                fill="#c4b5fd"
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {submissions.map((submission) => {
              const systolicBp = getNumericValue(submission, "systolic_bp");
              const diastolicBp = getNumericValue(submission, "diastolic_bp");
              const heartRate = getNumericValue(submission, "heart_rate");
              const bloodGlucose = getNumericValue(
                submission,
                "blood_glucose"
              );
              const note =
                submission.note || getTextValue(submission, "meal_note");

              return (
                <article
                  key={submission.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 18,
                    background: "#ffffff",
                    padding: 16,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "grid", gap: 6 }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {formatDateTime(submission.submittedAt)}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {sourceTypeLabel(submission.sourceType)}
                      </div>
                    </div>

                    <div
                      style={{
                        ...statusTone(submission.status),
                        padding: "8px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusLabel(submission.status)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    }}
                  >
                    <MetricCard
                      label="Huyết áp"
                      value={
                        systolicBp != null || diastolicBp != null
                          ? `${systolicBp ?? "—"}/${diastolicBp ?? "—"} mmHg`
                          : "—"
                      }
                    />

                    <MetricCard
                      label="Mạch"
                      value={heartRate != null ? `${heartRate} bpm` : "—"}
                    />

                    <MetricCard
                      label="Đường huyết"
                      value={
                        bloodGlucose != null
                          ? `${bloodGlucose} mmol/L`
                          : "—"
                      }
                    />
                  </div>

                  {note ? (
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: 6,
                        }}
                      >
                        Ghi chú / mô tả bữa ăn
                      </div>
                      <div
                        style={{
                          color: "#334155",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {note}
                      </div>
                    </div>
                  ) : null}

                  {submission.files.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        Ảnh đã gửi
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: 12,
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                        }}
                      >
                        {submission.files.map((file) => (
                          <div
                            key={file.id}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: 14,
                              overflow: "hidden",
                              background: "#f8fafc",
                            }}
                          >
                            {file.signedUrl ? (
                              <a
                                href={file.signedUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                  display: "block",
                                }}
                              >
                                <img
                                  src={file.signedUrl}
                                  alt="Patient monitoring file"
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    height: 180,
                                    objectFit: "cover",
                                    background: "#e2e8f0",
                                  }}
                                />
                                <div
                                  style={{
                                    padding: 10,
                                    fontSize: 12,
                                    color: "#475569",
                                  }}
                                >
                                  Bấm để mở ảnh
                                </div>
                              </a>
                            ) : (
                              <div
                                style={{
                                  padding: 12,
                                  fontSize: 13,
                                  color: "#64748b",
                                  lineHeight: 1.6,
                                }}
                              >
                                Không tạo được link xem ảnh cho file này.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}