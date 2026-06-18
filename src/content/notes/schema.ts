export type NoteSectionStatus = "available" | "planned";

export type NoteSourceType = "pdf" | "book" | "manual" | "reference";

export interface NoteSubtopic {
  code: string;
  title: string;
}

export interface NoteSection {
  code: `${number}.0.0.0`;
  slug: string;
  title: string;
  weight: number;
  subtopics: NoteSubtopic[];
  status: NoteSectionStatus;
}

export interface NotePoint {
  title: string;
  text: string;
  tags?: string[];
}

export interface NoteSource {
  label: string;
  type: NoteSourceType;
  href?: string;
  details?: string;
}

export interface RelatedCaseLink {
  slug: string;
  label: string;
  reason: string;
}

export interface NoteBlock {
  sectionCode: `${number}.0.0.0`;
  updatedAt: string;
  summary: string;
  highYield: NotePoint[];
  localization: NotePoint[];
  diagnosticClues: NotePoint[];
  differentials: NotePoint[];
  krokPatterns: NotePoint[];
  pitfalls: NotePoint[];
  relatedCases: RelatedCaseLink[];
  krokSearchTerms: string[];
  sources: NoteSource[];
}

export interface ResolvedNoteSection extends NoteSection {
  block?: NoteBlock;
}
