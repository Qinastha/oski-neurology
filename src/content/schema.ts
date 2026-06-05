export type CaseGroup = "non-imaging" | "imaging";

export type ReviewStatus = "draft" | "reviewing" | "checked";

export interface SourceFile {
  label: string;
  href: string;
}

export interface CaseImage {
  src: string;
  alt: string;
  caption?: string;
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
