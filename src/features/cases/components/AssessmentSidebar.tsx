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

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export default function AssessmentSidebar({
  caseId,
  selectedAssessmentId,
  assessments,
}: Props) {
  return (
    <aside
      style={{
        width: 240,
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #e2e8f0",
          fontSize: 14,
          fontWeight: 600,
          color: "#334155",
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
                  padding: "14px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  textDecoration: "none",
                  background: active ? "#f1f5f9" : "#ffffff",
                  color: "#0f172a",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 700 : 500,
                    marginBottom: 4,
                  }}
                >
                  {formatDate(item.assessment_date)}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Lần {item.assessment_no ?? "—"}
                </div>

                {item.is_red_flag_present ? (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#dc2626",
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