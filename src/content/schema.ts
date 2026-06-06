export type CaseGroup = "non-imaging" | "imaging";

export type ReviewStatus = "draft" | "reviewing" | "checked";

export type StationType =
  | "actor_dialogue"
  | "verbal_analysis"
  | "procedure"
  | "imaging_review"
  | "mixed";

export type TaskCoverageStatus = "covered" | "partial" | "missing" | "not_applicable";

export type StationAnswerBlockType =
  | "task_summary"
  | "actor_communication"
  | "history_questions"
  | "exam_steps"
  | "imaging_review"
  | "diagnosis"
  | "management"
  | "must_say"
  | "pitfalls";

export type StationReviewVerdict =
  | "needs_revision"
  | "medically_checked"
  | "checked_with_caveats";

export type StationEvidenceType = "visible_on_image" | "from_case" | "caution";

export interface SourceFile {
  label: string;
  href: string;
}

export interface CaseImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface RequiredTask {
  id: string;
  prompt: string;
  coverage: TaskCoverageStatus;
  note?: string;
}

export interface StationAnswerPoint {
  text: string;
  evidence?: StationEvidenceType;
}

export interface StationAnswerBlock {
  type: StationAnswerBlockType;
  title: string;
  body?: string;
  points: StationAnswerPoint[];
}

export interface StationBlueprint {
  slug: string;
  stationType: StationType;
  reviewVerdict: StationReviewVerdict;
  requiredTasks: RequiredTask[];
  answerBlocks: StationAnswerBlock[];
  sources: SourceFile[];
}

interface BaseCaseMeta {
  id: string;
  slug: string;
  order: number;
  title: string;
  focus: string;
  group: CaseGroup;
  sourcePdf: SourceFile;
  originalPages: CaseImage[];
  tags: string[];
  reviewStatus: ReviewStatus;
  blueprint?: StationBlueprint;
}

export interface NonImagingCaseMeta extends BaseCaseMeta {
  group: "non-imaging";
}

export interface ImagingCaseMeta extends BaseCaseMeta {
  group: "imaging";
  keyAnswer: string;
  imaging: CaseImage[];
  sources: SourceFile[];
}

export type CaseMeta = NonImagingCaseMeta | ImagingCaseMeta;

export interface MarkdownSection {
  id: string;
  title: string;
  body: string;
}

export interface ChecklistItem extends MarkdownSection {
  order: number;
}

export type InteractionItem = MarkdownSection;

export type StudyCase = CaseMeta & {
  originalMarkdown: string;
  checklist: ChecklistItem[];
  interaction: InteractionItem[];
};

export type CaseSummary = Pick<
  StudyCase,
  | "id"
  | "slug"
  | "order"
  | "title"
  | "focus"
  | "group"
  | "tags"
  | "reviewStatus"
> & {
  hasImaging: boolean;
  checklistCount: number;
};
