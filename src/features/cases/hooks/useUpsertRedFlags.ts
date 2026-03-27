import { supabase } from "../../../lib/supabase";

export type CreateRedFlagPayload = {
  assessmentId: string;
  flagName: string;
  flagCode?: string;
  severity?: string;
  note?: string;
  isPresent?: boolean;
};

export function useUpsertRedFlags() {
  async function createRedFlag(payload: CreateRedFlagPayload) {
    const flagName = payload.flagName.trim();

    if (!payload.assessmentId) {
      throw new Error("Thiếu assessmentId.");
    }

    if (!flagName) {
      throw new Error("Tên red flag không được để trống.");
    }

    const { data, error } = await supabase
      .from("assessment_red_flags")
      .insert([
        {
          assessment_id: payload.assessmentId,
          flag_name: flagName,
          flag_code: payload.flagCode?.trim() ? payload.flagCode.trim() : null,
          severity: payload.severity?.trim() ? payload.severity.trim() : null,
          note: payload.note?.trim() ? payload.note.trim() : null,
          is_present: payload.isPresent ?? true,
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function deleteRedFlag(redFlagId: string) {
    const { error } = await supabase
      .from("assessment_red_flags")
      .delete()
      .eq("id", redFlagId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    createRedFlag,
    deleteRedFlag,
  };
}