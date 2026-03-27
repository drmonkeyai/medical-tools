import { supabase } from "../../../lib/supabase";

type CreateAssessmentPayload = {
  caseId: string;
  patientId: string;
  nextAssessmentNo: number;
  sourceAssessmentId?: string;
  assessmentType?: "initial" | "follow_up" | "review" | "urgent" | "discharge";
  careSetting?: string;
  status?: string;
};

type AssessmentNoteRow = Record<string, unknown> & {
  id?: string;
  assessment_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
};

type AssessmentDiagnosisRow = Record<string, unknown> & {
  id?: string;
  assessment_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  is_active?: boolean | null;
};

type AssessmentTreatmentRow = Record<string, unknown> & {
  id?: string;
  assessment_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  status?: string | null;
};

const NOTE_CARRY_FORWARD_FIELDS = [
  "past_medical_history",
  "past_surgical_history",
  "medication_history",
  "allergy_history",
  "family_history",
  "social_history",
  "obstetric_history",
  "substance_use_history",
  "sleep_history",
  "diet_history",
  "exercise_history",
  "biological_factors",
  "psychological_factors",
  "social_factors",
  "functional_limitations",
  "participation_restrictions",
  "environmental_factors",
  "personal_factors",
  "protective_factors",
  "barriers_to_recovery",
] as const;

function pickExistingKeys<T extends Record<string, unknown>>(
  source: T,
  keys: readonly string[]
) {
  const result: Record<string, unknown> = {};

  for (const key of keys) {
    if (key in source) {
      result[key] = source[key];
    }
  }

  return result;
}

function stripSystemFields<T extends Record<string, unknown>>(row: T) {
  const {
    id,
    assessment_id,
    created_at,
    updated_at,
    created_by,
    ...rest
  } = row;

  void id;
  void assessment_id;
  void created_at;
  void updated_at;
  void created_by;

  return rest;
}

function hasAnyMeaningfulValue(obj: Record<string, unknown>) {
  return Object.values(obj).some(
    (value) => value !== null && value !== undefined && value !== ""
  );
}

function shouldCarryForwardTreatment(row: AssessmentTreatmentRow) {
  const rawStatus =
    typeof row.status === "string" ? row.status.trim().toLowerCase() : "";

  if (!rawStatus) return true;

  if (
    ["stopped", "completed", "done", "cancelled", "canceled", "discontinued"].includes(
      rawStatus
    )
  ) {
    return false;
  }

  return true;
}

async function cloneCarryForwardNote(
  sourceAssessmentId: string,
  targetAssessmentId: string
) {
  const { data, error } = await supabase
    .from("assessment_notes")
    .select("*")
    .eq("assessment_id", sourceAssessmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return;

  const sourceRow = data as AssessmentNoteRow;
  const carried = pickExistingKeys(sourceRow, NOTE_CARRY_FORWARD_FIELDS);

  if (!hasAnyMeaningfulValue(carried)) return;

  const insertRow = {
    assessment_id: targetAssessmentId,
    ...carried,
  };

  const { error: insertError } = await supabase
    .from("assessment_notes")
    .insert([insertRow]);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function cloneActiveDiagnoses(
  sourceAssessmentId: string,
  targetAssessmentId: string
) {
  const { data, error } = await supabase
    .from("assessment_diagnoses")
    .select("*")
    .eq("assessment_id", sourceAssessmentId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AssessmentDiagnosisRow[];
  if (!rows.length) return;

  const insertRows = rows.map((row) => ({
    assessment_id: targetAssessmentId,
    ...stripSystemFields(row),
  }));

  const { error: insertError } = await supabase
    .from("assessment_diagnoses")
    .insert(insertRows);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function cloneActiveTreatments(
  sourceAssessmentId: string,
  targetAssessmentId: string
) {
  const { data, error } = await supabase
    .from("assessment_treatments")
    .select("*")
    .eq("assessment_id", sourceAssessmentId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const sourceRows = (data ?? []) as AssessmentTreatmentRow[];
  const rows = sourceRows.filter(shouldCarryForwardTreatment);

  if (!rows.length) return;

  const insertRows = rows.map((row) => ({
    assessment_id: targetAssessmentId,
    ...stripSystemFields(row),
  }));

  const { error: insertError } = await supabase
    .from("assessment_treatments")
    .insert(insertRows);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

function buildAssessmentDate() {
  return new Date().toISOString().slice(0, 10);
}

function resolveAssessmentType(payload: CreateAssessmentPayload) {
  if (payload.assessmentType) return payload.assessmentType;
  return payload.nextAssessmentNo === 1 ? "initial" : "follow_up";
}

export function useCreateAssessment() {
  async function createAssessment(payload: CreateAssessmentPayload) {
    if (!payload.caseId) {
      throw new Error("Thiếu caseId.");
    }

    if (!payload.patientId) {
      throw new Error("Thiếu patientId.");
    }

    if (!payload.nextAssessmentNo || payload.nextAssessmentNo < 1) {
      throw new Error("assessment_no không hợp lệ.");
    }

    const insertRow = {
      case_id: payload.caseId,
      patient_id: payload.patientId,
      assessment_no: payload.nextAssessmentNo,
      assessment_date: buildAssessmentDate(),
      assessment_type: resolveAssessmentType(payload),
      care_setting: payload.careSetting ?? "outpatient",
      status: payload.status ?? "draft",
    };

    console.log("[useCreateAssessment] insertRow =", insertRow);

    const { data, error } = await supabase
      .from("case_assessments")
      .insert([insertRow])
      .select(
        "id, case_id, patient_id, assessment_no, assessment_date, assessment_type, status"
      )
      .single();

    if (error) {
      console.error("[useCreateAssessment] insert error =", error);
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error("Không tạo được assessment mới.");
    }

    if (payload.sourceAssessmentId) {
      await cloneCarryForwardNote(payload.sourceAssessmentId, data.id);
      await cloneActiveDiagnoses(payload.sourceAssessmentId, data.id);
      await cloneActiveTreatments(payload.sourceAssessmentId, data.id);
    }

    return data;
  }

  return {
    createAssessment,
  };
}