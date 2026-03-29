import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { supabase } from "../../../lib/supabase";
import { LAB_CATALOG } from "./catalog";
import type {
  AssessmentLabReport,
  AssessmentLabResult,
  LabCatalogItem,
} from "./types";
import { useAssessmentLabs } from "../../../features/cases/hooks/useAssessmentLabs";

type Props = {
  assessmentId: string;
};

type SectionKey =
  | "biochemistry"
  | "hematology"
  | "immunology"
  | "urinalysis"
  | "other";

type SectionMeta = {
  key: SectionKey;
  vi: string;
  en: string;
};

type ReportInfoState = {
  facilityName: string;
  reportTitle: string;
  sampleId: string;
  specimenType: string;
  unitName: string;
  referringPhysician: string;
  diagnosisText: string;
  specimenQuality: string;
  orderedAt: string;
  collectedAt: string;
  performedAt: string;
  receivedAt: string;
  collectingStaff: string;
  receivingStaff: string;
};

const SECTION_META: SectionMeta[] = [
  { key: "biochemistry", vi: "XN SINH HÓA", en: "BIOCHEMISTRY" },
  { key: "hematology", vi: "XN HUYẾT HỌC", en: "HAEMATOLOGY" },
  { key: "immunology", vi: "XN MIỄN DỊCH", en: "IMMUNOLOGY" },
  { key: "urinalysis", vi: "XN SH NƯỚC TIỂU", en: "URINALYSIS" },
  { key: "other", vi: "XÉT NGHIỆM KHÁC", en: "OTHER" },
];

const NEW_REPORT_KEY = "__new__";
const ORPHAN_REPORT_KEY = "__orphan__";

const DEFAULT_REPORT_INFO: ReportInfoState = {
  facilityName: "BỆNH VIỆN ĐẠI HỌC Y DƯỢC TPHCM",
  reportTitle: "KẾT QUẢ XÉT NGHIỆM",
  sampleId: "",
  specimenType: "Máu",
  unitName: "Y HỌC GIA ĐÌNH",
  referringPhysician: "",
  diagnosisText: "",
  specimenQuality: "Đạt",
  orderedAt: "",
  collectedAt: "",
  performedAt: "",
  receivedAt: "",
  collectingStaff: "",
  receivingStaff: "",
};

function getSectionItems(section: SectionKey) {
  return LAB_CATALOG
    .filter((item) => item.section === section)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

function sortReports(rows: AssessmentLabReport[]) {
  return [...rows].sort((a, b) => {
    const aPerformed = a.performed_at ? new Date(a.performed_at).getTime() : 0;
    const bPerformed = b.performed_at ? new Date(b.performed_at).getTime() : 0;
    if (aPerformed !== bPerformed) return bPerformed - aPerformed;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
}

function sortResults(rows: AssessmentLabResult[]) {
  return [...rows].sort((a, b) => {
    const sectionCompare = String(a.section).localeCompare(String(b.section));
    if (sectionCompare !== 0) return sectionCompare;

    const groupCompare = String(a.group_name ?? "").localeCompare(
      String(b.group_name ?? "")
    );
    if (groupCompare !== 0) return groupCompare;

    return String(a.lab_name).localeCompare(String(b.lab_name));
  });
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toDateTimeLocalInput(value?: string | null) {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value.slice(0, 16);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toIsoOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;

  return d.toISOString();
}

function formatDisplayDateTime(value?: string | null) {
  if (!value) return "Chưa có ngày";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "Chưa có ngày";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("vi-VN");
}

function getReportAnchorDate(report: AssessmentLabReport) {
  return (
    report.performed_at ||
    report.collected_at ||
    report.received_at ||
    report.ordered_at ||
    report.created_at
  );
}

function hydrateReportInfo(report?: AssessmentLabReport | null): ReportInfoState {
  if (!report) {
    return { ...DEFAULT_REPORT_INFO };
  }

  return {
    facilityName: report.facility_name ?? DEFAULT_REPORT_INFO.facilityName,
    reportTitle: report.report_title ?? DEFAULT_REPORT_INFO.reportTitle,
    sampleId: report.sample_id ?? "",
    specimenType: report.specimen_type ?? "",
    unitName: DEFAULT_REPORT_INFO.unitName,
    referringPhysician: report.referring_physician ?? "",
    diagnosisText: report.diagnosis_text ?? "",
    specimenQuality: report.specimen_quality ?? "",
    orderedAt: toDateTimeLocalInput(report.ordered_at),
    collectedAt: toDateTimeLocalInput(report.collected_at),
    performedAt: toDateTimeLocalInput(report.performed_at),
    receivedAt: toDateTimeLocalInput(report.received_at),
    collectingStaff: "",
    receivingStaff: "",
  };
}

function getResultDisplay(row?: AssessmentLabResult | null) {
  if (!row) return "";

  if (row.value_type === "numeric") {
    if (row.value_numeric == null) return "";
    return String(row.value_numeric);
  }

  if (row.value_type === "boolean") {
    if (row.value_boolean == null) return "";
    return row.value_boolean ? "DƯƠNG TÍNH" : "ÂM TÍNH";
  }

  return row.value_text ?? row.raw_result_text ?? "";
}

function parseNullableNumeric(raw: string | undefined) {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function getValueTypeInputText(
  item: LabCatalogItem,
  value: string
): {
  value_numeric: number | null;
  value_text: string | null;
  value_boolean: boolean | null;
  raw_result_text: string | null;
} {
  if (item.valueType === "numeric") {
    return {
      value_numeric: parseNullableNumeric(value),
      value_text: null,
      value_boolean: null,
      raw_result_text: null,
    };
  }

  if (item.valueType === "boolean") {
    const normalized = value.trim().toLowerCase();
    const boolValue =
      normalized === "true" ||
      normalized === "1" ||
      normalized === "dương tính" ||
      normalized === "duong tinh"
        ? true
        : normalized === "false" ||
          normalized === "0" ||
          normalized === "âm tính" ||
          normalized === "am tinh"
        ? false
        : null;

    return {
      value_numeric: null,
      value_text: null,
      value_boolean: boolValue,
      raw_result_text: value.trim() || null,
    };
  }

  return {
    value_numeric: null,
    value_text: value.trim() || null,
    value_boolean: null,
    raw_result_text: value.trim() || null,
  };
}

function makeDraftKey(bucketKey: string, labCode: string) {
  return `${bucketKey}::${labCode}`;
}

function SidebarCard({
  active,
  title,
  subtitle,
  meta,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        border: active ? "1px solid #0f172a" : "1px solid #d1d5db",
        background: active ? "#eff6ff" : "#ffffff",
        borderRadius: 12,
        padding: 12,
        cursor: "pointer",
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: "#475569" }}>{subtitle}</div>
      {meta ? (
        <div style={{ fontSize: 12, color: "#64748b" }}>{meta}</div>
      ) : null}
    </button>
  );
}

export default function LabsSection({ assessmentId }: Props) {
  const { data, isLoading, error } = useAssessmentLabs(assessmentId);

  const [localReports, setLocalReports] = useState<AssessmentLabReport[]>([]);
  const [localResults, setLocalResults] = useState<AssessmentLabResult[]>([]);

  const [selectedReportKey, setSelectedReportKey] =
    useState<string>(NEW_REPORT_KEY);

  const [reportInfo, setReportInfo] = useState<ReportInfoState>({
    ...DEFAULT_REPORT_INFO,
  });

  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [draftDates, setDraftDates] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setLocalReports(sortReports(data?.reports ?? []));
  }, [data?.reports]);

  useEffect(() => {
    setLocalResults(sortResults(data?.results ?? []));
  }, [data?.results]);

  const orphanResultsCount = useMemo(
    () => localResults.filter((row) => !row.source_report_id).length,
    [localResults]
  );

  useEffect(() => {
    if (
      selectedReportKey !== NEW_REPORT_KEY &&
      selectedReportKey !== ORPHAN_REPORT_KEY &&
      localReports.some((report) => report.id === selectedReportKey)
    ) {
      return;
    }

    if (localReports.length > 0) {
      setSelectedReportKey(localReports[0].id);
      return;
    }

    if (orphanResultsCount > 0) {
      setSelectedReportKey(ORPHAN_REPORT_KEY);
      return;
    }

    setSelectedReportKey(NEW_REPORT_KEY);
  }, [localReports, orphanResultsCount, selectedReportKey]);

  const selectedReport =
    selectedReportKey !== NEW_REPORT_KEY && selectedReportKey !== ORPHAN_REPORT_KEY
      ? localReports.find((report) => report.id === selectedReportKey) ?? null
      : null;

  useEffect(() => {
    if (selectedReportKey === NEW_REPORT_KEY) {
      setReportInfo({ ...DEFAULT_REPORT_INFO });
      return;
    }

    if (selectedReportKey === ORPHAN_REPORT_KEY) {
      setReportInfo({ ...DEFAULT_REPORT_INFO });
      return;
    }

    setReportInfo(hydrateReportInfo(selectedReport));
  }, [selectedReportKey, selectedReport]);

  const visibleExistingResults = useMemo(() => {
    if (selectedReportKey === NEW_REPORT_KEY) return [];

    if (selectedReportKey === ORPHAN_REPORT_KEY) {
      return localResults.filter((row) => !row.source_report_id);
    }

    return localResults.filter(
      (row) => row.source_report_id === selectedReportKey
    );
  }, [localResults, selectedReportKey]);

  const visibleResultMap = useMemo(() => {
    const map = new Map<string, AssessmentLabResult>();
    for (const row of visibleExistingResults) {
      if (!map.has(row.lab_code)) {
        map.set(row.lab_code, row);
      }
    }
    return map;
  }, [visibleExistingResults]);

  const defaultMeasuredAt = useMemo(() => {
    const latest = visibleExistingResults
      .map((row) => row.measured_at)
      .find((value) => typeof value === "string" && value.trim());

    if (!latest) return "";
    return latest.slice(0, 10);
  }, [visibleExistingResults]);

  const currentDraftValue = (code: string) =>
    draftValues[makeDraftKey(selectedReportKey, code)] ?? "";

  const currentDraftDate = (code: string) =>
    draftDates[makeDraftKey(selectedReportKey, code)] ?? "";

  const summaryCount = visibleExistingResults.filter(
    (row) =>
      row.value_numeric != null ||
      (row.value_text != null && row.value_text !== "") ||
      row.value_boolean != null
  ).length;

  async function saveReport() {
    const payload = {
      assessment_id: assessmentId,
      facility_name: reportInfo.facilityName.trim() || null,
      report_title: reportInfo.reportTitle.trim() || "KẾT QUẢ XÉT NGHIỆM",
      sample_id: reportInfo.sampleId.trim() || null,
      specimen_type: reportInfo.specimenType.trim() || null,
      referring_physician: reportInfo.referringPhysician.trim() || null,
      diagnosis_text: reportInfo.diagnosisText.trim() || null,
      specimen_quality: reportInfo.specimenQuality.trim() || null,
      ordered_at: toIsoOrNull(reportInfo.orderedAt),
      collected_at: toIsoOrNull(reportInfo.collectedAt),
      performed_at: toIsoOrNull(reportInfo.performedAt),
      received_at: toIsoOrNull(reportInfo.receivedAt),
      report_kind: selectedReport?.report_kind ?? "lab_pdf",
      updated_at: new Date().toISOString(),
    };

    if (selectedReport) {
      const { data, error: updateError } = await supabase
        .from("assessment_lab_reports")
        .update(payload)
        .eq("id", selectedReport.id)
        .select("*")
        .single();

      if (updateError) throw updateError;
      return data as AssessmentLabReport;
    }

    const { data, error: insertError } = await supabase
      .from("assessment_lab_reports")
      .insert([payload])
      .select("*")
      .single();

    if (insertError) throw insertError;
    return data as AssessmentLabReport;
  }

  async function saveVisibleLabResults(reportId: string) {
    const dirtyCatalogItems = LAB_CATALOG.filter((item) => {
      const valueKey = makeDraftKey(selectedReportKey, item.code);
      return (
        Object.prototype.hasOwnProperty.call(draftValues, valueKey) ||
        Object.prototype.hasOwnProperty.call(draftDates, valueKey)
      );
    });

    if (dirtyCatalogItems.length === 0) return [];

    const savedRows: AssessmentLabResult[] = [];

    for (const item of dirtyCatalogItems) {
      const existing = visibleResultMap.get(item.code);
      const draftValue = currentDraftValue(item.code);
      const draftMeasuredAt = currentDraftDate(item.code);

      const measuredAt =
        draftMeasuredAt ||
        (existing?.measured_at ? toDateInputValue(existing.measured_at) : "");

      const coerced = getValueTypeInputText(item, draftValue);

      const basePayload = {
        assessment_id: assessmentId,
        lab_code: item.code,
        canonical_code: item.canonicalCode ?? null,
        lab_name: item.name,
        section: item.section,
        group_name: item.groupName ?? null,
        value_type: item.valueType,
        value_numeric: coerced.value_numeric,
        value_text: coerced.value_text,
        value_boolean: coerced.value_boolean,
        raw_result_text: coerced.raw_result_text,
        unit: item.canonicalUnit ?? null,
        reference_range_text:
          existing?.reference_range_text ?? item.referenceRangeText ?? null,
        procedure_code: existing?.procedure_code ?? null,
        specimen_type: reportInfo.specimenType.trim() || null,
        measured_at: measuredAt ? new Date(`${measuredAt}T00:00:00`).toISOString() : null,
        source_type: existing?.source_type ?? "manual",
        source_report_id: reportId,
        updated_at: new Date().toISOString(),
      };

      if (existing?.id) {
        const { data, error: updateError } = await supabase
          .from("assessment_lab_results")
          .update(basePayload)
          .eq("id", existing.id)
          .select("*")
          .single();

        if (updateError) throw updateError;
        savedRows.push(data as AssessmentLabResult);
      } else {
        const { data, error: insertError } = await supabase
          .from("assessment_lab_results")
          .insert([basePayload])
          .select("*")
          .single();

        if (insertError) throw insertError;
        savedRows.push(data as AssessmentLabResult);
      }
    }

    return savedRows;
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSaveError("");

      const savedReport = await saveReport();
      const savedLabRows = await saveVisibleLabResults(savedReport.id);

      setLocalReports((prev) =>
        sortReports([
          savedReport,
          ...prev.filter((report) => report.id !== savedReport.id),
        ])
      );

      if (savedLabRows.length > 0) {
        const savedCompositeKeys = new Set(
          savedLabRows.map((row) => `${row.source_report_id ?? ""}::${row.lab_code}`)
        );

        setLocalResults((prev) =>
          sortResults([
            ...prev.filter(
              (row) =>
                !savedCompositeKeys.has(
                  `${row.source_report_id ?? ""}::${row.lab_code}`
                )
            ),
            ...savedLabRows,
          ])
        );
      }

      const nextDraftValues = { ...draftValues };
      const nextDraftDates = { ...draftDates };

      for (const item of LAB_CATALOG) {
        delete nextDraftValues[makeDraftKey(selectedReportKey, item.code)];
        delete nextDraftDates[makeDraftKey(selectedReportKey, item.code)];
      }

      setDraftValues(nextDraftValues);
      setDraftDates(nextDraftDates);
      setSelectedReportKey(savedReport.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được cận lâm sàng.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div>Đang tải cận lâm sàng...</div>;
  }

  if (error) {
    return <div style={{ color: "#b91c1c" }}>{error}</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px minmax(0, 1fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <aside
        style={{
          background: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: 12,
          padding: 14,
          display: "grid",
          gap: 12,
          position: "sticky",
          top: 16,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Phiếu xét nghiệm
        </div>

        <button
          type="button"
          onClick={() => setSelectedReportKey(NEW_REPORT_KEY)}
          style={{
            border: "1px solid #0f172a",
            background: selectedReportKey === NEW_REPORT_KEY ? "#0f172a" : "#ffffff",
            color: selectedReportKey === NEW_REPORT_KEY ? "#ffffff" : "#0f172a",
            borderRadius: 10,
            padding: "10px 12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Phiếu xét nghiệm mới
        </button>

        <div style={{ display: "grid", gap: 10 }}>
          {localReports.map((report) => {
            const anchorDate = getReportAnchorDate(report);

            return (
              <SidebarCard
                key={report.id}
                active={selectedReportKey === report.id}
                title={formatDisplayDate(anchorDate)}
                subtitle={report.report_title || "KẾT QUẢ XÉT NGHIỆM"}
                meta={[
                  report.sample_id ? `Sample ID: ${report.sample_id}` : "",
                  report.specimen_type || "",
                ]
                  .filter(Boolean)
                  .join(" • ")}
                onClick={() => setSelectedReportKey(report.id)}
              />
            );
          })}

          {orphanResultsCount > 0 ? (
            <SidebarCard
              active={selectedReportKey === ORPHAN_REPORT_KEY}
              title="Chưa gắn phiếu"
              subtitle={`${orphanResultsCount} kết quả chưa có source_report_id`}
              meta="Nhóm tạm cho dữ liệu cũ"
              onClick={() => setSelectedReportKey(ORPHAN_REPORT_KEY)}
            />
          ) : null}
        </div>
      </aside>

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: 10,
          padding: 20,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#111827",
                letterSpacing: 0.3,
              }}
            >
              {reportInfo.reportTitle}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#374151",
                marginTop: 4,
              }}
            >
              Laboratory Report
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
              {reportInfo.facilityName}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={{
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                borderRadius: 8,
                padding: "10px 14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Lấy từ lần trước
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              style={{
                border: "1px solid #0f172a",
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: 8,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Đang lưu..." : "Lưu cận lâm sàng"}
            </button>
          </div>
        </div>

        {saveError ? (
          <div
            style={{
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b91c1c",
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
            }}
          >
            {saveError}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            border: "1px solid #d1d5db",
            padding: 12,
          }}
        >
          <MetaField
            label="Mã số / Sample ID"
            value={reportInfo.sampleId}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, sampleId: value }))
            }
          />
          <MetaField
            label="Bệnh phẩm / Specimens"
            value={reportInfo.specimenType}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, specimenType: value }))
            }
          />
          <MetaField
            label="Nơi gửi / Unit"
            value={reportInfo.unitName}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, unitName: value }))
            }
          />
          <MetaField
            label="BS chỉ định / Referring physician"
            value={reportInfo.referringPhysician}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, referringPhysician: value }))
            }
          />
          <MetaField
            label="Chẩn đoán / Diagnosis"
            value={reportInfo.diagnosisText}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, diagnosisText: value }))
            }
            colSpan={2}
          />
          <MetaField
            label="Chất lượng mẫu / Quality"
            value={reportInfo.specimenQuality}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, specimenQuality: value }))
            }
          />
          <div />
          <MetaField
            label="Xác nhận / Ordered"
            type="datetime-local"
            value={reportInfo.orderedAt}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, orderedAt: value }))
            }
          />
          <MetaField
            label="Lấy mẫu / Collected"
            type="datetime-local"
            value={reportInfo.collectedAt}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, collectedAt: value }))
            }
          />
          <MetaField
            label="Ngày xét nghiệm / Performed"
            type="datetime-local"
            value={reportInfo.performedAt}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, performedAt: value }))
            }
          />
          <MetaField
            label="Nhận mẫu / Received"
            type="datetime-local"
            value={reportInfo.receivedAt}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, receivedAt: value }))
            }
          />
          <MetaField
            label="Nhân viên lấy mẫu"
            value={reportInfo.collectingStaff}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, collectingStaff: value }))
            }
          />
          <MetaField
            label="NV nhận mẫu"
            value={reportInfo.receivingStaff}
            onChange={(value) =>
              setReportInfo((prev) => ({ ...prev, receivingStaff: value }))
            }
          />
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>Đã có {summaryCount} kết quả trong phiếu đang chọn.</div>
          <div>
            {selectedReportKey === NEW_REPORT_KEY
              ? "Đang tạo phiếu mới"
              : selectedReportKey === ORPHAN_REPORT_KEY
              ? "Đang xem nhóm chưa gắn phiếu"
              : `Phiếu ngày ${formatDisplayDate(getReportAnchorDate(selectedReport!))}`}
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid #111827",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1100,
              tableLayout: "fixed",
              fontSize: 14,
              color: "#111827",
            }}
          >
            <thead>
              <tr>
                <HeaderCell width="34%">Xét nghiệm<br />(Test)</HeaderCell>
                <HeaderCell width="18%">Kết quả<br />(Results)</HeaderCell>
                <HeaderCell width="10%">Đơn vị<br />(Units)</HeaderCell>
                <HeaderCell width="22%">
                  Khoảng tham chiếu<br />(Ref. ranges)
                </HeaderCell>
                <HeaderCell width="16%">
                  Số qui trình<br />(Procedure)
                </HeaderCell>
              </tr>
            </thead>

            <tbody>
              {SECTION_META.map((section) => {
                const items = getSectionItems(section.key);
                if (!items.length) return null;

                return (
                  <SectionBlock
                    key={section.key}
                    section={section}
                    items={items}
                    selectedReportKey={selectedReportKey}
                    resultMap={visibleResultMap}
                    currentDraftValue={currentDraftValue}
                    currentDraftDate={currentDraftDate}
                    defaultMeasuredAt={defaultMeasuredAt}
                    onChangeValue={(code, value) =>
                      setDraftValues((prev) => ({
                        ...prev,
                        [makeDraftKey(selectedReportKey, code)]: value,
                      }))
                    }
                    onChangeDate={(code, value) =>
                      setDraftDates((prev) => ({
                        ...prev,
                        [makeDraftKey(selectedReportKey, code)]: value,
                      }))
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "grid",
            gap: 6,
            fontSize: 13,
            color: "#374151",
            borderTop: "1px dashed #d1d5db",
            paddingTop: 10,
          }}
        >
          <div>
            Ghi chú: Ký hiệu * nghĩa là kết quả nằm ngoài giá trị tham chiếu.
            Dấu chấm ở các kết quả có ý nghĩa là dấu thập phân.
          </div>
          <div>Số phiếu đã lưu trong assessment: {localReports.length}</div>
          <div>
            Ngày xét nghiệm đang chọn:{" "}
            {selectedReportKey === NEW_REPORT_KEY
              ? "Phiếu mới"
              : selectedReportKey === ORPHAN_REPORT_KEY
              ? "Chưa gắn phiếu"
              : formatDisplayDateTime(getReportAnchorDate(selectedReport!))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionBlock({
  section,
  items,
  selectedReportKey,
  resultMap,
  currentDraftValue,
  currentDraftDate,
  defaultMeasuredAt,
  onChangeValue,
  onChangeDate,
}: {
  section: SectionMeta;
  items: LabCatalogItem[];
  selectedReportKey: string;
  resultMap: Map<string, AssessmentLabResult>;
  currentDraftValue: (code: string) => string;
  currentDraftDate: (code: string) => string;
  defaultMeasuredAt: string;
  onChangeValue: (code: string, value: string) => void;
  onChangeDate: (code: string, value: string) => void;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={5}
          style={{
            borderTop: "1px solid #111827",
            borderBottom: "1px solid #111827",
            background: "#f9fafb",
            padding: "10px 12px",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          <div>{section.vi}</div>
          <div style={{ fontWeight: 600, color: "#4b5563", fontSize: 13 }}>
            {section.en}
          </div>
        </td>
      </tr>

      {items.map((item) => {
        const existing = resultMap.get(item.code);
        const value =
          currentDraftValue(item.code) !== ""
            ? currentDraftValue(item.code)
            : getResultDisplay(existing);

        const dateValue =
          currentDraftDate(item.code) ||
          (existing?.measured_at ? toDateInputValue(existing.measured_at) : "") ||
          defaultMeasuredAt;

        return (
          <tr key={`${selectedReportKey}-${item.code}`}>
            <BodyCell>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                {item.groupName || "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => onChangeDate(item.code, e.target.value)}
                  style={dateInputStyle}
                />
              </div>
            </BodyCell>

            <BodyCell>
              <input
                value={value}
                onChange={(e) => onChangeValue(item.code, e.target.value)}
                placeholder="Nhập kết quả"
                style={valueInputStyle}
              />
            </BodyCell>

            <BodyCell>
              <div>{item.canonicalUnit ?? "—"}</div>
            </BodyCell>

            <BodyCell>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {existing?.reference_range_text ||
                  item.referenceRangeText ||
                  "—"}
              </div>
            </BodyCell>

            <BodyCell>
              <div>{existing?.procedure_code || "—"}</div>
            </BodyCell>
          </tr>
        );
      })}
    </>
  );
}

function MetaField({
  label,
  value,
  onChange,
  type = "text",
  colSpan,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  colSpan?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 6,
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 0,
          height: 36,
          padding: "0 10px",
          fontSize: 14,
          color: "#111827",
          background: "#ffffff",
        }}
      />
    </div>
  );
}

function HeaderCell({
  children,
  width,
}: {
  children: ReactNode;
  width: string;
}) {
  return (
    <th
      style={{
        width,
        border: "1px solid #111827",
        padding: "10px 8px",
        textAlign: "center",
        fontWeight: 800,
        background: "#ffffff",
        lineHeight: 1.35,
      }}
    >
      {children}
    </th>
  );
}

function BodyCell({ children }: { children: ReactNode }) {
  return (
    <td
      style={{
        border: "1px solid #111827",
        padding: "8px 10px",
        verticalAlign: "top",
        background: "#ffffff",
      }}
    >
      {children}
    </td>
  );
}

const valueInputStyle: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 14,
  color: "#111827",
  padding: 0,
};

const dateInputStyle: CSSProperties = {
  width: "100%",
  height: 28,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  padding: "0 8px",
  fontSize: 12,
  color: "#374151",
};