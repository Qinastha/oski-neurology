export type ExamTicketSourceType = "docx" | "pdf";

export type ExamTicketContentBlockType = "paragraph" | "heading" | "list_item";
export type ExamTicketRichBlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "definition_list"
  | "table"
  | "media";

export type ExamTicketListStyle = "ordered" | "unordered";

export interface ExamTicketMedia {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  sourceFile: string;
  sourceName: string;
}

export interface ExamTicketContentBlock {
  id: string;
  type: ExamTicketContentBlockType;
  text: string;
}

export interface ExamTicketRichListBlock {
  id: string;
  type: "list";
  style: ExamTicketListStyle;
  items: string[];
}

export interface ExamTicketRichDefinitionListBlock {
  id: string;
  type: "definition_list";
  items: Array<{
    term: string;
    description: string | string[];
  }>;
}

export interface ExamTicketRichTableBlock {
  id: string;
  type: "table";
  columns: string[];
  rows: string[][];
}

export interface ExamTicketRichMediaBlock {
  id: string;
  type: "media";
  mediaIds: string[];
  caption?: string;
}

export type ExamTicketRichBlock =
  | {
      id: string;
      type: "paragraph" | "heading";
      text: string;
    }
  | ExamTicketRichListBlock
  | ExamTicketRichDefinitionListBlock
  | ExamTicketRichTableBlock
  | ExamTicketRichMediaBlock;

export interface ExamTicketQuestion {
  id: string;
  ticketNumber: number;
  number: number;
  title: string;
  blocks: ExamTicketContentBlock[];
  richBlocks?: ExamTicketRichBlock[];
  media: ExamTicketMedia[];
}

export interface ExamTicket {
  id: string;
  number: number;
  title: string;
  sourceFile: string;
  sourceType: ExamTicketSourceType;
  questions: ExamTicketQuestion[];
  gallery: ExamTicketMedia[];
}

export interface ExamQuestion {
  number: number;
  text: string;
}

export interface MissingExamQuestion extends ExamQuestion {
  reason: string;
}

export interface ExamTicketQuestionOverride {
  ticketNumber: number;
  questionNumber: number;
  title?: string;
  richBlocks: ExamTicketRichBlock[];
  reviewNote?: string;
}

export interface ExamTicketSummaryQuestion {
  number: number;
  title: string;
}

export interface ExamTicketSummary {
  id: string;
  number: number;
  title: string;
  sourceFile: string;
  sourceType: ExamTicketSourceType;
  questionCount: number;
  mediaCount: number;
  questions: ExamTicketSummaryQuestion[];
  search: string;
}
