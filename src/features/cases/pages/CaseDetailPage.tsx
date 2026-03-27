import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CaseHeader from "../components/CaseHeader";
import AssessmentSidebar from "../components/AssessmentSidebar";
import CaseDetailTabs from "../components/CaseDetailTabs";
import ActiveTabSection from "../components/ActiveTabSection";

import { useCaseDetail } from "../hooks/useCaseDetail";
import { useCreateAssessment } from "../hooks/useCreateAssessment";
import { useDeleteAssessment } from "../hooks/useDeleteAssessment";

import type { CaseDetailTabKey } from "../types/caseDetail";
import type { ClinicalNoteEditSectionRef } from "../../../modules/cases/clinical-note/ClinicalNoteEditSection";
import PatientSnapshotSection from "../../../modules/cases/patient-snapshot/PatientSnapshotSection";
import MonitoringQrModal from "../../patient-monitoring/components/MonitoringQrModal";
import PatientMonitoringDoctorSection from "../../patient-monitoring/components/PatientMonitoringDoctorSection";
import {
  getOrCreatePatientMonitoringLink,
  type PatientMonitoringLink,
} from "../../patient-monitoring/lib/monitoringApi";

const EDITABLE_TABS: CaseDetailTabKey[] = [
  "history",
  "ice",
  "biopsychosocial",
];

function toArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default function CaseDetailPage() {
  const { caseId, assessmentId } = useParams<{
    caseId: string;
    assessmentId: string;
  }>();

  const navigate = useNavigate();

  const {
    loading,
    sectionLoading,
    error,
    caseItem,
    patient,
    assessments,
    selectedAssessment,
    vitals,
    clinicalNote,
    diagnoses,
    treatment,
    plan,
    redFlags,
    observations,
    calculatorRuns,
    refreshClinicalNote,
  } = useCaseDetail(caseId, assessmentId);

  const { createAssessment } = useCreateAssessment();
  const {
    deletingAssessment,
    deleteAssessmentError,
    deleteAssessment,
  } = useDeleteAssessment();

  const clinicalNoteEditRef = useRef<ClinicalNoteEditSectionRef | null>(null);

  const [activeTab, setActiveTab] = useState<CaseDetailTabKey>("overview");
  const [isEditingCurrentAssessment, setIsEditingCurrentAssessment] =
    useState(false);

  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [createAssessmentError, setCreateAssessmentError] = useState("");

  const [savingAssessment, setSavingAssessment] = useState(false);
  const [saveAssessmentError, setSaveAssessmentError] = useState("");

  const [monitoringModalOpen, setMonitoringModalOpen] = useState(false);
  const [openingMonitoringQr, setOpeningMonitoringQr] = useState(false);
  const [monitoringLinkError, setMonitoringLinkError] = useState("");
  const [monitoringLink, setMonitoringLink] =
    useState<PatientMonitoringLink | null>(null);

  const counts = useMemo(() => {
    const treatmentItems = toArray(
      (treatment as Record<string, unknown> | null)?.items
    );
    const planItems = toArray(
      (plan as Record<string, unknown> | null)?.items
    );
    const redFlagItems = toArray(
      (redFlags as Record<string, unknown> | null)?.items
    );
    const observationItems = toArray(
      (observations as Record<string, unknown> | null)?.items
    );
    const calculatorRunItems = toArray(
      (calculatorRuns as Record<string, unknown> | null)?.runs
    );

    return {
      risk: redFlagItems.length,
      labs: observationItems.length,
      calculator: calculatorRunItems.length,
      management: planItems.length,
      treatment: treatmentItems.length,
    } as Partial<Record<CaseDetailTabKey, number>>;
  }, [treatment, plan, redFlags, observations, calculatorRuns]);

  const monitoringUrl = useMemo(() => {
    if (!monitoringLink?.token || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/p/${monitoringLink.token}/monitoring`;
  }, [monitoringLink?.token]);

  async function handleCreateAssessment() {
    if (!caseId || !caseItem?.patient_id) {
      setCreateAssessmentError("Thiếu caseId hoặc patientId.");
      return;
    }

    try {
      setCreatingAssessment(true);
      setCreateAssessmentError("");

      const nextAssessmentNo =
        Math.max(
          0,
          ...assessments.map((item) =>
            typeof item.assessment_no === "number" ? item.assessment_no : 0
          )
        ) + 1;

      const created = await createAssessment({
        caseId,
        patientId: caseItem.patient_id,
        nextAssessmentNo,
        sourceAssessmentId: selectedAssessment?.id ?? undefined,
        assessmentType: "follow_up",
        careSetting: "outpatient",
        status: "draft",
      });

      if (!created?.id) {
        throw new Error("Không tạo được lần đánh giá mới.");
      }

      navigate(`/app/cases/${caseId}/assessments/${created.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không tạo được lần đánh giá mới.";
      setCreateAssessmentError(message);
    } finally {
      setCreatingAssessment(false);
    }
  }

  async function handleOpenMonitoringQr() {
    if (!patient?.id || !caseItem?.id) {
      setMonitoringLinkError("Thiếu patientId hoặc caseId để tạo QR theo dõi.");
      setMonitoringModalOpen(true);
      return;
    }

    try {
      setOpeningMonitoringQr(true);
      setMonitoringLinkError("");
      setMonitoringModalOpen(true);

      const link = await getOrCreatePatientMonitoringLink({
        patientId: patient.id,
        caseId: caseItem.id,
      });

      setMonitoringLink(link);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không tạo được QR/link theo dõi tại nhà.";
      setMonitoringLinkError(message);
    } finally {
      setOpeningMonitoringQr(false);
    }
  }

  function handleEditAssessment() {
    if (!selectedAssessment?.id) return;

    if (!EDITABLE_TABS.includes(activeTab)) {
      alert(
        "Trong PHASE hiện tại, chỉnh sửa trực tiếp mới hỗ trợ cho 3 tab: Tiền sử / ICE / BioPsychoSocial."
      );
      return;
    }

    setSaveAssessmentError("");
    setIsEditingCurrentAssessment(true);
  }

  async function handleSaveAssessment() {
    if (!selectedAssessment?.id) return;
    if (!isEditingCurrentAssessment) return;

    if (!EDITABLE_TABS.includes(activeTab)) {
      setSaveAssessmentError(
        "PHASE hiện tại chỉ lưu trực tiếp cho Tiền sử / ICE / BioPsychoSocial."
      );
      return;
    }

    const ref = clinicalNoteEditRef.current;
    if (!ref?.save) {
      setSaveAssessmentError("Không tìm thấy form đang chỉnh sửa để lưu.");
      return;
    }

    try {
      setSavingAssessment(true);
      setSaveAssessmentError("");

      const ok = await ref.save();

      if (!ok) {
        throw new Error("Lưu lần đánh giá chưa thành công.");
      }

      setIsEditingCurrentAssessment(false);
      await Promise.resolve(refreshClinicalNote());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được lần đánh giá.";
      setSaveAssessmentError(message);
    } finally {
      setSavingAssessment(false);
    }
  }

  async function handleDeleteAssessment() {
    if (!selectedAssessment?.id || !caseId) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa lần đánh giá hiện tại không?"
    );
    if (!confirmed) return;

    try {
      await deleteAssessment({ assessmentId: selectedAssessment.id });

      const remaining = assessments.filter(
        (item) => item.id !== selectedAssessment.id
      );

      if (remaining.length > 0) {
        navigate(`/app/cases/${caseId}/assessments/${remaining[0].id}`, {
          replace: true,
        });
        return;
      }

      navigate(`/app/cases/${caseId}`, { replace: true });
    } catch {
      // lỗi đã được hook set vào deleteAssessmentError
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu ca bệnh...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, color: "#dc2626" }}>{error}</div>;
  }

  if (!caseItem || !patient) {
    return (
      <div style={{ padding: 24, color: "#dc2626" }}>
        Không tìm thấy dữ liệu ca bệnh.
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <CaseHeader
          patientName={patient.full_name}
          caseCode={caseItem.case_code}
          assessmentDate={selectedAssessment?.assessment_date}
          assessmentNo={selectedAssessment?.assessment_no}
          creatingAssessment={creatingAssessment}
          savingAssessment={savingAssessment}
          deletingAssessment={deletingAssessment}
          openingMonitoringQr={openingMonitoringQr}
          isEditingCurrentAssessment={isEditingCurrentAssessment}
          onGoHome={() => navigate("/")}
          onGoCaseList={() => navigate("/app/cases")}
          onOpenMonitoringQr={() => {
            void handleOpenMonitoringQr();
          }}
          onCreateAssessment={() => {
            void handleCreateAssessment();
          }}
          onEditAssessment={handleEditAssessment}
          onSaveAssessment={() => {
            void handleSaveAssessment();
          }}
          onDeleteAssessment={() => {
            void handleDeleteAssessment();
          }}
          createAssessmentError={createAssessmentError}
          saveAssessmentError={saveAssessmentError}
          deleteAssessmentError={deleteAssessmentError}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px minmax(0, 1fr)",
            gap: 0,
            alignItems: "start",
            minHeight: "calc(100vh - 160px)",
          }}
        >
          <AssessmentSidebar
            caseId={caseId || caseItem.id}
            selectedAssessmentId={selectedAssessment?.id}
            assessments={assessments}
          />

          <main
            style={{
              minWidth: 0,
              padding: 16,
              display: "grid",
              gap: 16,
            }}
          >
            <PatientSnapshotSection
              patient={patient}
              caseItem={caseItem}
              assessment={selectedAssessment}
              vitals={vitals}
            />

            <CaseDetailTabs
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setIsEditingCurrentAssessment(false);
                setSaveAssessmentError("");
              }}
              counts={counts}
            />

            {activeTab === "monitoring" ? (
              <PatientMonitoringDoctorSection patientId={patient.id} />
            ) : sectionLoading ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 18,
                  padding: 20,
                  color: "#64748b",
                }}
              >
                Đang tải section...
              </div>
            ) : (
              <ActiveTabSection
                activeTab={activeTab}
                isEditing={isEditingCurrentAssessment}
                assessmentId={selectedAssessment?.id}
                clinicalNote={
                  (clinicalNote as Record<string, unknown> | null) ?? null
                }
                diagnoses={
                  (diagnoses as Record<string, unknown> | null) ?? null
                }
                treatment={
                  (treatment as Record<string, unknown> | null) ?? null
                }
                plan={(plan as Record<string, unknown> | null) ?? null}
                redFlags={
                  (redFlags as Record<string, unknown> | null) ?? null
                }
                observations={
                  (observations as Record<string, unknown> | null) ?? null
                }
                calculatorRuns={
                  (calculatorRuns as Record<string, unknown> | null) ?? null
                }
                clinicalNoteEditRef={clinicalNoteEditRef}
                onClinicalNoteChanged={refreshClinicalNote}
              />
            )}
          </main>
        </div>
      </div>

      <MonitoringQrModal
        open={monitoringModalOpen}
        loading={openingMonitoringQr}
        error={monitoringLinkError}
        patientName={patient.full_name}
        monitoringUrl={monitoringUrl}
        onClose={() => {
          setMonitoringModalOpen(false);
        }}
      />
    </div>
  );
}