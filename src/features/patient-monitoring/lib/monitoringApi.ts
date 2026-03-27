import { supabase } from "../../../lib/supabase";

const MONITORING_STORAGE_BUCKET = "patient-monitoring";

export type PatientMonitoringLink = {
  id: string;
  patient_id: string;
  case_id: string | null;
  token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
};

export type PatientMonitoringContext = {
  linkId: string;
  patientId: string;
  caseId: string | null;
  patientName: string | null;
  caseCode: string | null;
  expiresAt: string | null;
};

export type SubmitPatientMonitoringInput = {
  token: string;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  bloodGlucose?: number | null;
  note?: string | null;
  files?: File[];
};

export type PatientMonitoringValue = {
  id: string;
  submissionId: string;
  fieldCode: string;
  valueNumeric: number | null;
  valueText: string | null;
  unit: string | null;
};

export type PatientMonitoringFile = {
  id: string;
  submissionId: string;
  storagePath: string;
  fileType: string;
  createdAt: string | null;
  signedUrl: string | null;
};

export type PatientMonitoringDoctorSubmission = {
  id: string;
  patientId: string;
  caseId: string | null;
  assessmentId: string | null;
  submittedAt: string;
  sourceType: string | null;
  status: string | null;
  note: string | null;
  values: PatientMonitoringValue[];
  files: PatientMonitoringFile[];
};

type SubmissionRpcValue = {
  field_code: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
};

function getErrorMessage(
  error: unknown,
  fallback = "Không xử lý được dữ liệu theo dõi bệnh nhân."
) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function normalizeText(value?: string | null) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

function isNotExpired(value?: string | null) {
  if (!value) return true;

  const expiresAt = new Date(value);
  if (Number.isNaN(expiresAt.getTime())) return false;

  return expiresAt.getTime() > Date.now();
}

function buildMonitoringToken() {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(24);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  return `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2)}${Math.random().toString(36).slice(2)}`;
}

function sanitizeBaseFileName(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "image";
}

function mapLinkRow(row: Record<string, unknown>): PatientMonitoringLink {
  return {
    id: String(row.id),
    patient_id: String(row.patient_id),
    case_id: row.case_id ? String(row.case_id) : null,
    token: String(row.token),
    is_active: Boolean(row.is_active),
    expires_at: row.expires_at ? String(row.expires_at) : null,
    created_at: String(row.created_at),
    created_by: row.created_by ? String(row.created_by) : null,
  };
}

function buildSourceType(input: SubmitPatientMonitoringInput) {
  const hasBloodPressure =
    (input.systolicBp !== null && input.systolicBp !== undefined) ||
    (input.diastolicBp !== null && input.diastolicBp !== undefined);

  const hasGlucose =
    input.bloodGlucose !== null && input.bloodGlucose !== undefined;

  const hasFiles = (input.files ?? []).length > 0;
  const hasNote = Boolean(normalizeText(input.note));

  if (hasBloodPressure && !hasGlucose && !hasFiles && !hasNote) {
    return "bp_home";
  }

  if (!hasBloodPressure && hasGlucose && !hasFiles && !hasNote) {
    return "glucose_home";
  }

  if (!hasBloodPressure && !hasGlucose && hasFiles && !hasNote) {
    return "meal_photo";
  }

  if (!hasBloodPressure && !hasGlucose && !hasFiles && hasNote) {
    return "symptom_note";
  }

  return "mixed";
}

function buildSubmissionValues(
  input: SubmitPatientMonitoringInput
): SubmissionRpcValue[] {
  const values: SubmissionRpcValue[] = [];

  if (input.systolicBp !== null && input.systolicBp !== undefined) {
    values.push({
      field_code: "systolic_bp",
      value_numeric: input.systolicBp,
      value_text: null,
      unit: "mmHg",
    });
  }

  if (input.diastolicBp !== null && input.diastolicBp !== undefined) {
    values.push({
      field_code: "diastolic_bp",
      value_numeric: input.diastolicBp,
      value_text: null,
      unit: "mmHg",
    });
  }

  if (input.heartRate !== null && input.heartRate !== undefined) {
    values.push({
      field_code: "heart_rate",
      value_numeric: input.heartRate,
      value_text: null,
      unit: "bpm",
    });
  }

  if (input.bloodGlucose !== null && input.bloodGlucose !== undefined) {
    values.push({
      field_code: "blood_glucose",
      value_numeric: input.bloodGlucose,
      value_text: null,
      unit: "mmol/L",
    });
  }

  const note = normalizeText(input.note);
  if (note) {
    values.push({
      field_code: "meal_note",
      value_numeric: null,
      value_text: note,
      unit: null,
    });
  }

  return values;
}

export async function getOrCreatePatientMonitoringLink(params: {
  patientId: string;
  caseId?: string | null;
}): Promise<PatientMonitoringLink> {
  const patientId = params.patientId.trim();
  const caseId = params.caseId?.trim() || null;

  if (!patientId) {
    throw new Error("Thiếu patientId.");
  }

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("patient_monitoring_links")
      .select(
        "id, patient_id, case_id, token, is_active, expires_at, created_at, created_by"
      )
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (existingError) {
      throw existingError;
    }

    const reusable = (existingRows ?? []).find((row) =>
      isNotExpired((row as Record<string, unknown>).expires_at as string | null)
    );

    if (reusable) {
      return mapLinkRow(reusable as Record<string, unknown>);
    }

    const token = buildMonitoringToken();

    const { data: authData } = await supabase.auth.getUser();

    const { data: insertedRow, error: insertError } = await supabase
      .from("patient_monitoring_links")
      .insert([
        {
          patient_id: patientId,
          case_id: caseId,
          token,
          is_active: true,
          created_by: authData.user?.id ?? null,
        },
      ])
      .select(
        "id, patient_id, case_id, token, is_active, expires_at, created_at, created_by"
      )
      .single();

    if (insertError || !insertedRow) {
      throw insertError || new Error("Không tạo được monitoring link.");
    }

    return mapLinkRow(insertedRow as Record<string, unknown>);
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không tạo được QR/link theo dõi cho bệnh nhân.")
    );
  }
}

export async function getPatientMonitoringContextByToken(
  token: string
): Promise<PatientMonitoringContext | null> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("Thiếu token.");
  }

  try {
    const { data, error } = await supabase.rpc(
      "get_patient_monitoring_context",
      {
        p_token: normalizedToken,
      }
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return null;
    }

    return {
      linkId: String(row.link_id),
      patientId: String(row.patient_id),
      caseId: row.case_id ? String(row.case_id) : null,
      patientName:
        typeof row.patient_name === "string" ? row.patient_name : null,
      caseCode: typeof row.case_code === "string" ? row.case_code : null,
      expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Không lấy được thông tin liên kết theo dõi của bệnh nhân."
      )
    );
  }
}

export async function submitPatientMonitoringSubmission(
  input: SubmitPatientMonitoringInput
) {
  const token = input.token.trim();
  const files = input.files ?? [];
  const values = buildSubmissionValues(input);

  if (!token) {
    throw new Error("Thiếu token.");
  }

  if (!values.length && !files.length) {
    throw new Error("Vui lòng nhập ít nhất một dữ liệu hoặc chọn ít nhất một ảnh.");
  }

  try {
    const { data: submissionData, error: submissionError } = await supabase.rpc(
      "submit_patient_monitoring",
      {
        p_token: token,
        p_note: normalizeText(input.note),
        p_source_type: buildSourceType(input),
        p_values: values,
      }
    );

    if (submissionError) {
      throw submissionError;
    }

    const submissionId = Array.isArray(submissionData)
      ? submissionData[0]
      : submissionData;

    if (!submissionId || typeof submissionId !== "string") {
      throw new Error("Không tạo được submission theo dõi.");
    }

    const uploadedFiles: Array<{ storage_path: string; file_type: string }> = [];

    for (const [index, file] of files.entries()) {
      const originalName = file.name || `image-${index + 1}`;
      const ext =
        originalName.lastIndexOf(".") >= 0
          ? originalName.slice(originalName.lastIndexOf(".") + 1)
          : "";
      const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const baseName = sanitizeBaseFileName(
        originalName.replace(/\.[^.]+$/, "")
      );

      const storagePath = `${submissionId}/${Date.now()}-${index}-${baseName}${
        safeExt ? `.${safeExt}` : ""
      }`;

      const { error: uploadError } = await supabase.storage
        .from(MONITORING_STORAGE_BUCKET)
        .upload(storagePath, file, {
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw uploadError;
      }

      uploadedFiles.push({
        storage_path: storagePath,
        file_type: "image",
      });
    }

    if (uploadedFiles.length > 0) {
      const { data: attachedCount, error: attachError } = await supabase.rpc(
        "attach_patient_monitoring_files",
        {
          p_token: token,
          p_submission_id: submissionId,
          p_files: uploadedFiles,
        }
      );

      if (attachError) {
        throw attachError;
      }

      return {
        submissionId,
        uploadedFileCount:
          typeof attachedCount === "number"
            ? attachedCount
            : uploadedFiles.length,
      };
    }

    return {
      submissionId,
      uploadedFileCount: 0,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không gửi được dữ liệu theo dõi của bệnh nhân.")
    );
  }
}

export async function loadPatientMonitoringForDoctor(params: {
  patientId: string;
  limit?: number;
}): Promise<PatientMonitoringDoctorSubmission[]> {
  const patientId = params.patientId.trim();
  const limit = Math.max(1, Math.min(50, params.limit ?? 20));

  if (!patientId) {
    throw new Error("Thiếu patientId.");
  }

  try {
    const { data: submissionRows, error: submissionError } = await supabase
      .from("patient_monitoring_submissions")
      .select(
        "id, patient_id, case_id, assessment_id, submitted_at, source_type, status, note"
      )
      .eq("patient_id", patientId)
      .order("submitted_at", { ascending: false })
      .limit(limit);

    if (submissionError) {
      throw submissionError;
    }

    const submissionIds = (submissionRows ?? [])
      .map((row) => String(row.id))
      .filter(Boolean);

    if (!submissionIds.length) {
      return [];
    }

    const { data: valueRows, error: valueError } = await supabase
      .from("patient_monitoring_values")
      .select("id, submission_id, field_code, value_numeric, value_text, unit")
      .in("submission_id", submissionIds);

    if (valueError) {
      throw valueError;
    }

    const { data: fileRows, error: fileError } = await supabase
      .from("patient_monitoring_files")
      .select("id, submission_id, storage_path, file_type, created_at")
      .in("submission_id", submissionIds)
      .order("created_at", { ascending: false });

    if (fileError) {
      throw fileError;
    }

    const fileItems = await Promise.all(
      (fileRows ?? []).map(async (row) => {
        const storagePath = String(row.storage_path);

        const { data: signedData, error: signedError } = await supabase.storage
          .from(MONITORING_STORAGE_BUCKET)
          .createSignedUrl(storagePath, 60 * 60);

        if (signedError) {
          console.error("CREATE SIGNED URL ERROR:", signedError);
        }

        return {
          id: String(row.id),
          submissionId: String(row.submission_id),
          storagePath,
          fileType: String(row.file_type ?? "image"),
          createdAt:
            typeof row.created_at === "string" ? row.created_at : null,
          signedUrl: signedData?.signedUrl ?? null,
        } as PatientMonitoringFile;
      })
    );

    return (submissionRows ?? []).map((row) => {
      const submissionId = String(row.id);

      return {
        id: submissionId,
        patientId: String(row.patient_id),
        caseId: row.case_id ? String(row.case_id) : null,
        assessmentId: row.assessment_id ? String(row.assessment_id) : null,
        submittedAt: String(row.submitted_at),
        sourceType: typeof row.source_type === "string" ? row.source_type : null,
        status: typeof row.status === "string" ? row.status : null,
        note: typeof row.note === "string" ? row.note : null,
        values: (valueRows ?? [])
          .filter((item) => String(item.submission_id) === submissionId)
          .map((item) => ({
            id: String(item.id),
            submissionId: String(item.submission_id),
            fieldCode: String(item.field_code),
            valueNumeric:
              typeof item.value_numeric === "number"
                ? item.value_numeric
                : item.value_numeric != null
                ? Number(item.value_numeric)
                : null,
            valueText:
              typeof item.value_text === "string" ? item.value_text : null,
            unit: typeof item.unit === "string" ? item.unit : null,
          })),
        files: fileItems.filter((item) => item.submissionId === submissionId),
      } as PatientMonitoringDoctorSubmission;
    });
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Không tải được dữ liệu theo dõi tại nhà cho bác sĩ."
      )
    );
  }
}
