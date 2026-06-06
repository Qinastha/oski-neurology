import type {
  CaseGroup,
  ReviewStatus,
  StationAnswerBlockType,
  StationEvidenceType,
  StationReviewVerdict,
  StationType,
  TaskCoverageStatus
} from "@/content/schema";

export function formatGroup(group: CaseGroup) {
  return group === "imaging" ? "МРТ/КТ" : "Без МРТ/КТ";
}

export function formatStatus(status: ReviewStatus) {
  const labels: Record<ReviewStatus, string> = {
    draft: "черновик",
    reviewing: "на проверке",
    checked: "проверено"
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
    exam_steps: "Як виконати",
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
