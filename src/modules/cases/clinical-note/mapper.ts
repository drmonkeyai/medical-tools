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
  value: string | null | undefined
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
  fields: ClinicalNoteField[]
): ClinicalNoteGroup {
  return {
    key,
    title,
    fields,
    hasAnyContent: fields.some((field) => !field.isEmpty),
  };
}

export function mapAssessmentToClinicalNote(
  note: AssessmentNoteRow | null | undefined
): ClinicalNoteSectionData & Record<string, unknown> {
  const historyOfPresentIllness = normalizeText(note?.history_of_present_illness);
  const pastMedicalHistory = normalizeText(note?.past_medical_history);
  const pastSurgicalHistory = normalizeText(note?.past_surgical_history);
  const medicationHistory = normalizeText(note?.medication_history);
  const allergyHistory = normalizeText(note?.allergy_history);
  const familyHistory = normalizeText(note?.family_history);
  const socialHistory = normalizeText(note?.social_history);
  const obstetricHistory = normalizeText(note?.obstetric_history);
  const substanceUseHistory = normalizeText(note?.substance_use_history);
  const sleepHistory = normalizeText(note?.sleep_history);
  const dietHistory = normalizeText(note?.diet_history);
  const exerciseHistory = normalizeText(note?.exercise_history);

  const ideas = normalizeText(note?.ideas);
  const concerns = normalizeText(note?.concerns);
  const expectations = normalizeText(note?.expectations);

  const biologicalFactors = normalizeText(note?.biological_factors);
  const psychologicalFactors = normalizeText(note?.psychological_factors);
  const socialFactors = normalizeText(note?.social_factors);
  const functionalLimitations = normalizeText(note?.functional_limitations);
  const participationRestrictions = normalizeText(note?.participation_restrictions);
  const environmentalFactors = normalizeText(note?.environmental_factors);
  const personalFactors = normalizeText(note?.personal_factors);
  const protectiveFactors = normalizeText(note?.protective_factors);
  const barriersToRecovery = normalizeText(note?.barriers_to_recovery);

  const generalAppearance = normalizeText(note?.general_appearance);
  const mentalStatus = normalizeText(note?.mental_status);
  const headNeckExam = normalizeText(note?.head_neck_exam);
  const cardiovascularExam = normalizeText(note?.cardiovascular_exam);
  const respiratoryExam = normalizeText(note?.respiratory_exam);
  const abdominalExam = normalizeText(note?.abdominal_exam);
  const musculoskeletalExam = normalizeText(note?.musculoskeletal_exam);
  const neurologicalExam = normalizeText(note?.neurological_exam);
  const skinExam = normalizeText(note?.skin_exam);
  const otherExam = normalizeText(note?.other_exam);

  const historyGroup = createGroup("history", "History", [
    createField(
      "history_of_present_illness",
      "History of Present Illness",
      historyOfPresentIllness
    ),
    createField("past_medical_history", "Past Medical History", pastMedicalHistory),
    createField("past_surgical_history", "Past Surgical History", pastSurgicalHistory),
    createField("medication_history", "Medication History", medicationHistory),
    createField("allergy_history", "Allergy History", allergyHistory),
    createField("family_history", "Family History", familyHistory),
    createField("social_history", "Social History", socialHistory),
    createField("obstetric_history", "Obstetric History", obstetricHistory),
    createField("substance_use_history", "Substance Use History", substanceUseHistory),
    createField("sleep_history", "Sleep History", sleepHistory),
    createField("diet_history", "Diet History", dietHistory),
    createField("exercise_history", "Exercise History", exerciseHistory),
  ]);

  const iceGroup = createGroup("ice", "ICE", [
    createField("ideas", "Ideas", ideas),
    createField("concerns", "Concerns", concerns),
    createField("expectations", "Expectations", expectations),
  ]);

  const bioPsychoSocialGroup = createGroup(
    "bio_psycho_social",
    "Bio-Psycho-Social",
    [
      createField("biological_factors", "Biological Factors", biologicalFactors),
      createField("psychological_factors", "Psychological Factors", psychologicalFactors),
      createField("social_factors", "Social Factors", socialFactors),
      createField("functional_limitations", "Functional Limitations", functionalLimitations),
      createField(
        "participation_restrictions",
        "Participation Restrictions",
        participationRestrictions
      ),
      createField("environmental_factors", "Environmental Factors", environmentalFactors),
      createField("personal_factors", "Personal Factors", personalFactors),
      createField("protective_factors", "Protective Factors", protectiveFactors),
      createField("barriers_to_recovery", "Barriers to Recovery", barriersToRecovery),
    ]
  );

  const physicalExamGroup = createGroup("physical_exam", "Physical Exam", [
    createField("general_appearance", "General Appearance", generalAppearance),
    createField("mental_status", "Mental Status", mentalStatus),
    createField("head_neck_exam", "Head / Neck Exam", headNeckExam),
    createField("cardiovascular_exam", "Cardiovascular Exam", cardiovascularExam),
    createField("respiratory_exam", "Respiratory Exam", respiratoryExam),
    createField("abdominal_exam", "Abdominal Exam", abdominalExam),
    createField("musculoskeletal_exam", "Musculoskeletal Exam", musculoskeletalExam),
    createField("neurological_exam", "Neurological Exam", neurologicalExam),
    createField("skin_exam", "Skin Exam", skinExam),
    createField("other_exam", "Other Exam", otherExam),
  ]);

  const groups: ClinicalNoteGroup[] = [
    historyGroup,
    iceGroup,
    bioPsychoSocialGroup,
    physicalExamGroup,
  ];

  const result: ClinicalNoteSectionData & Record<string, unknown> = {
    groups,
    hasAnyContent: groups.some((group) => group.hasAnyContent),

    historyOfPresentIllness,
    pastMedicalHistory,
    pastSurgicalHistory,
    medicationHistory,
    allergyHistory,
    familyHistory,
    socialHistory,
    obstetricHistory,
    substanceUseHistory,
    sleepHistory,
    dietHistory,
    exerciseHistory,

    ideas,
    concerns,
    expectations,

    biologicalFactors,
    psychologicalFactors,
    socialFactors,
    functionalLimitations,
    participationRestrictions,
    environmentalFactors,
    personalFactors,
    protectiveFactors,
    barriersToRecovery,

    generalAppearance,
    mentalStatus,
    headNeckExam,
    cardiovascularExam,
    respiratoryExam,
    abdominalExam,
    musculoskeletalExam,
    neurologicalExam,
    skinExam,
    otherExam,

    history_of_present_illness: historyOfPresentIllness,
    past_medical_history: pastMedicalHistory,
    past_surgical_history: pastSurgicalHistory,
    medication_history: medicationHistory,
    allergy_history: allergyHistory,
    family_history: familyHistory,
    social_history: socialHistory,
    obstetric_history: obstetricHistory,
    substance_use_history: substanceUseHistory,
    sleep_history: sleepHistory,
    diet_history: dietHistory,
    exercise_history: exerciseHistory,

    biological_factors: biologicalFactors,
    psychological_factors: psychologicalFactors,
    social_factors: socialFactors,
    functional_limitations: functionalLimitations,
    participation_restrictions: participationRestrictions,
    environmental_factors: environmentalFactors,
    personal_factors: personalFactors,
    protective_factors: protectiveFactors,
    barriers_to_recovery: barriersToRecovery,

    general_appearance: generalAppearance,
    mental_status: mentalStatus,
    head_neck_exam: headNeckExam,
    cardiovascular_exam: cardiovascularExam,
    respiratory_exam: respiratoryExam,
    abdominal_exam: abdominalExam,
    musculoskeletal_exam: musculoskeletalExam,
    neurological_exam: neurologicalExam,
    skin_exam: skinExam,
    other_exam: otherExam,
  };

  return result;
}