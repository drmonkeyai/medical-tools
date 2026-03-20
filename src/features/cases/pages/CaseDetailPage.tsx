import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCaseDetail } from "../hooks/useCaseDetail";
import AssessmentSidebar from "../components/AssessmentSidebar";
import CaseHeader from "../components/CaseHeader";
import PatientSnapshotSection from "../../../modules/cases/components/PatientSnapshotSection";
import { mapAssessmentToPatientSnapshot } from "../../../modules/cases/mappers/mapAssessmentToPatientSnapshot";
import ClinicalNoteSection from "../../../modules/cases/clinical-note/ClinicalNoteSection";
import DiagnosesSection from "../../../modules/cases/diagnoses/DiagnosesSection";

export default function CaseDetailPage() {
  const { caseId, assessmentId } = useParams();

  const {
    loading,
    error,
    caseItem,
    patient,
    assessments,
    selectedAssessment,
    vitals,
    clinicalNote,
    diagnoses,
  } = useCaseDetail(caseId, assessmentId);

  const snapshotData = useMemo(() => {
    if (!patient || !caseItem || !selectedAssessment) return null;

    return mapAssessmentToPatientSnapshot({
      patient,
      caseItem,
      assessment: selectedAssessment,
      vitals,
      redFlagCount: selectedAssessment.is_red_flag_present ? 1 : 0,
    });
  }, [patient, caseItem, selectedAssessment, vitals]);

  if (!caseId) {
    return <div style={{ padding: 24, color: "#dc2626" }}>Thiếu caseId.</div>;
  }

  if (loading) {
    return <div style={{ padding: 24, color: "#64748b" }}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, color: "#dc2626" }}>{error}</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px minmax(0, 1fr)",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <AssessmentSidebar
        caseId={caseId}
        selectedAssessmentId={selectedAssessment?.id}
        assessments={assessments}
      />

      <main style={{ minWidth: 0 }}>
        <CaseHeader
          caseCode={caseItem?.case_code}
          title={caseItem?.title}
          primaryProblem={caseItem?.primary_problem}
          primaryDiagnosis={caseItem?.primary_diagnosis}
          assessmentDate={selectedAssessment?.assessment_date}
          chiefComplaint={selectedAssessment?.chief_complaint}
          hasRedFlag={selectedAssessment?.is_red_flag_present}
        />

        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {snapshotData ? (
            <PatientSnapshotSection
              data={snapshotData}
              onPrint={() => window.print()}
            />
          ) : (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              Không có dữ liệu snapshot.
            </div>
          )}

          <ClinicalNoteSection data={clinicalNote} />
          <DiagnosesSection data={diagnoses} />
        </div>
      </main>
    </div>
  );
}