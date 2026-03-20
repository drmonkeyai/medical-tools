import type {
  AssessmentNoteRow,
  ClinicalNoteField,
  ClinicalNoteGroup,
  ClinicalNoteSectionData,
} from "./types";

function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\r\n/g, "\n").trim();
}

function createField(
  key: string,
  label: string,
  value: string | null | undefined,
): ClinicalNoteField {
  const content = normalizeText(value);

  return {
    key,
    label,
    content,
    isEmpty: content.length === 0,
  };
}

function createGroup(
  key: ClinicalNoteGroup["key"],
  title: string,
  fields: ClinicalNoteField[],
): ClinicalNoteGroup {
  return {
    key,
    title,
    fields,
    hasAnyContent: fields.some((field) => !field.isEmpty),
  };
}

export function mapAssessmentToClinicalNote(
  note: AssessmentNoteRow | null | undefined,
): ClinicalNoteSectionData {
  const historyGroup = createGroup("history", "History", [
    createField(
      "history_of_present_illness",
      "History of Present Illness",
      note?.history_of_present_illness,
    ),
    createField(
      "past_medical_history",
      "Past Medical History",
      note?.past_medical_history,
    ),
    createField(
      "past_surgical_history",
      "Past Surgical History",
      note?.past_surgical_history,
    ),
    createField(
      "medication_history",
      "Medication History",
      note?.medication_history,
    ),
    createField(
      "allergy_history",
      "Allergy History",
      note?.allergy_history,
    ),
    createField(
      "family_history",
      "Family History",
      note?.family_history,
    ),
    createField(
      "social_history",
      "Social History",
      note?.social_history,
    ),
    createField(
      "obstetric_history",
      "Obstetric History",
      note?.obstetric_history,
    ),
    createField(
      "substance_use_history",
      "Substance Use History",
      note?.substance_use_history,
    ),
    createField(
      "sleep_history",
      "Sleep History",
      note?.sleep_history,
    ),
    createField(
      "diet_history",
      "Diet History",
      note?.diet_history,
    ),
    createField(
      "exercise_history",
      "Exercise History",
      note?.exercise_history,
    ),
  ]);

  const iceGroup = createGroup("ice", "ICE", [
    createField("ideas", "Ideas", note?.ideas),
    createField("concerns", "Concerns", note?.concerns),
    createField("expectations", "Expectations", note?.expectations),
  ]);

  const bioPsychoSocialGroup = createGroup(
    "bio_psycho_social",
    "Bio-Psycho-Social",
    [
      createField(
        "biological_factors",
        "Biological Factors",
        note?.biological_factors,
      ),
      createField(
        "psychological_factors",
        "Psychological Factors",
        note?.psychological_factors,
      ),
      createField(
        "social_factors",
        "Social Factors",
        note?.social_factors,
      ),
      createField(
        "functional_limitations",
        "Functional Limitations",
        note?.functional_limitations,
      ),
      createField(
        "participation_restrictions",
        "Participation Restrictions",
        note?.participation_restrictions,
      ),
      createField(
        "environmental_factors",
        "Environmental Factors",
        note?.environmental_factors,
      ),
      createField(
        "personal_factors",
        "Personal Factors",
        note?.personal_factors,
      ),
      createField(
        "protective_factors",
        "Protective Factors",
        note?.protective_factors,
      ),
      createField(
        "barriers_to_recovery",
        "Barriers to Recovery",
        note?.barriers_to_recovery,
      ),
    ],
  );

  const physicalExamGroup = createGroup("physical_exam", "Physical Exam", [
    createField(
      "general_appearance",
      "General Appearance",
      note?.general_appearance,
    ),
    createField(
      "mental_status",
      "Mental Status",
      note?.mental_status,
    ),
    createField(
      "head_neck_exam",
      "Head / Neck Exam",
      note?.head_neck_exam,
    ),
    createField(
      "cardiovascular_exam",
      "Cardiovascular Exam",
      note?.cardiovascular_exam,
    ),
    createField(
      "respiratory_exam",
      "Respiratory Exam",
      note?.respiratory_exam,
    ),
    createField(
      "abdominal_exam",
      "Abdominal Exam",
      note?.abdominal_exam,
    ),
    createField(
      "musculoskeletal_exam",
      "Musculoskeletal Exam",
      note?.musculoskeletal_exam,
    ),
    createField(
      "neurological_exam",
      "Neurological Exam",
      note?.neurological_exam,
    ),
    createField(
      "skin_exam",
      "Skin Exam",
      note?.skin_exam,
    ),
    createField(
      "other_exam",
      "Other Exam",
      note?.other_exam,
    ),
  ]);

  const groups: ClinicalNoteGroup[] = [
    historyGroup,
    iceGroup,
    bioPsychoSocialGroup,
    physicalExamGroup,
  ];

  return {
    groups,
    hasAnyContent: groups.some((group) => group.hasAnyContent),
  };
}