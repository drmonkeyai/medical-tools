import { Link } from "react-router-dom";

type AssessmentItem = {
  id: string;
  assessment_no?: number | null;
  assessment_date?: string | null;
  chief_complaint?: string | null;
  is_red_flag_present?: boolean | null;
};

type Props = {
  caseId: string;
  selectedAssessmentId?: string;
  assessments: AssessmentItem[];
};

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

function formatTimeOnly(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN");
}

export default function AssessmentSidebar({
  caseId,
  selectedAssessmentId,
  assessments,
}: Props) {
  return (
    <aside
      style={{
        width: 248,
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #e2e8f0",
          fontSize: 16,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        Lần đánh giá
      </div>

      {assessments.length === 0 ? (
        <div
          style={{
            padding: 16,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Chưa có lần đánh giá
        </div>
      ) : (
        <div>
          {assessments.map((item) => {
            const active = item.id === selectedAssessmentId;

            return (
              <Link
                key={item.id}
                to={`/app/cases/${caseId}/assessments/${item.id}`}
                style={{
                  display: "block",
                  padding: "16px 18px",
                  borderBottom: "1px solid #e2e8f0",
                  textDecoration: "none",
                  background: active ? "#eef2ff" : "#ffffff",
                  color: "#0f172a",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  {formatDateOnly(item.assessment_date)}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  {formatTimeOnly(item.assessment_date)} {item.assessment_date ? item.assessment_date.includes("T") ? "" : "" : ""}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: active ? "#1d4ed8" : "#475569",
                  }}
                >
                  Lần {item.assessment_no ?? "—"}
                </div>

                {item.is_red_flag_present ? (
                  <div
                    style={{
                      marginTop: 8,
                      display: "inline-block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#b91c1c",
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      borderRadius: 999,
                      padding: "4px 8px",
                    }}
                  >
                    Red flag
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}