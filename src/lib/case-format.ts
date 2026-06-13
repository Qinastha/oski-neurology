import type {
  CaseGroup,
  PracticalSkillKind,
  PracticalSkillStepRole,
  ReviewStatus,
  StationAnswerBlockType,
  StationEvidenceType,
  StationReviewVerdict,
  StationType,
  TaskCoverageStatus
} from "@/content/schema";

export function formatGroup(group: CaseGroup) {
  return group === "imaging" ? "КТ/МРТ" : "Без КТ/МРТ";
}

export function formatStatus(status: ReviewStatus) {
  const labels: Record<ReviewStatus, string> = {
    draft: "чернетка",
    reviewing: "на перевірці",
    checked: "перевірено"
  };

  return labels[status];
}

export function formatStationType(type: StationType) {
  const labels: Record<StationType, string> = {
    actor_dialogue: "діалог з актором",
    verbal_analysis: "усний розбір",
    procedure: "практична проба",
    imaging_review: "розбір знімків",
    mixed: "змішана станція"
  };

  return labels[type];
}

export function formatTaskCoverage(status: TaskCoverageStatus) {
  const labels: Record<TaskCoverageStatus, string> = {
    covered: "покрито",
    partial: "частково",
    missing: "потребує доповнення",
    not_applicable: "не застосовується"
  };

  return labels[status];
}

export function formatBlueprintVerdict(verdict: StationReviewVerdict) {
  const labels: Record<StationReviewVerdict, string> = {
    needs_revision: "потребує ревізії",
    medically_checked: "медично перевірено",
    checked_with_caveats: "перевірено з застереженнями"
  };

  return labels[verdict];
}

export function formatAnswerBlockType(type: StationAnswerBlockType) {
  const labels: Record<StationAnswerBlockType, string> = {
    task_summary: "Що питають",
    actor_communication: "Що сказати актору",
    history_questions: "Анамнез",
    clinical_exam: "Клінічний огляд",
    imaging_review: "Що видно на КТ/МРТ",
    diagnosis: "Діагноз",
    management: "Тактика",
    must_say: "Не забути",
    pitfalls: "Пастки"
  };

  return labels[type];
}

export function formatEvidenceType(type: StationEvidenceType) {
  const labels: Record<StationEvidenceType, string> = {
    visible_on_image: "видно на зображенні",
    from_case: "випливає з умови",
    caution: "обережне формулювання"
  };

  return labels[type];
}

export function formatPracticalSkillKind(kind: PracticalSkillKind) {
  const labels: Record<PracticalSkillKind, string> = {
    cognitive_screening: "когнітивний скринінг",
    motor_exam: "оцінка моторики",
    sensory_exam: "оцінка чутливості",
    coordination_exam: "координаторні проби",
    hearing_test: "слухові проби",
    autonomic_test: "вегетативна проба",
    vestibular_test: "вестибулярна проба",
    therapeutic_maneuver: "лікувальний маневр",
    gait_postural_test: "хода та постуральність",
    provocative_test: "провокаційна проба"
  };

  return labels[kind];
}

export function formatPracticalStepRole(role: PracticalSkillStepRole) {
  const labels: Record<PracticalSkillStepRole, string> = {
    prepare: "Підготовка",
    explain: "Пояснити",
    perform: "Виконати",
    observe: "Оцінити",
    interpret: "Інтерпретувати",
    safety: "Безпека"
  };

  return labels[role];
}
