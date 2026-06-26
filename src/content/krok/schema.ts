export type KrokOfficialBookletId = "2024" | "2025" | "2026";

export type KrokTrainingBookletId = "ai-001" | "ai-002" | "ai-003" | "ai-004";

export type KrokPreKrokBookletId = "pre-001";

export type KrokBookletId = KrokOfficialBookletId | KrokTrainingBookletId | KrokPreKrokBookletId;

export type KrokSessionBookletId = KrokBookletId | "random";

export type KrokQuestionOrderMode = "ordered" | "shuffled";

export type KrokContentSectionCode = `${number}.0.0.0`;

export interface KrokContentTopic {
  code: string;
  title: string;
  weight?: number;
}

export interface KrokOption {
  id: string;
  sourceLetter: string;
  text: string;
}

export interface KrokQuestion {
  id: string;
  bookletId: KrokBookletId;
  sourceNumber: number;
  text: string;
  options: KrokOption[];
  correctOptionId: string;
}

export interface KrokTrainingQuestion extends KrokQuestion {
  bookletId: KrokTrainingBookletId;
  contentSection: KrokContentSectionCode;
  contentCode: string;
  explanation: string;
}

export type KrokPreKrokOrigin = "official" | "generated";

export interface KrokPreKrokQuestionBase extends KrokQuestion {
  bookletId: KrokPreKrokBookletId;
  contentSection: KrokContentSectionCode;
  contentCode: string;
  explanation: string;
}

export interface KrokPreKrokOfficialQuestion extends KrokPreKrokQuestionBase {
  origin: "official";
  sourceQuestionId: `${KrokOfficialBookletId}-${string}`;
}

export interface KrokPreKrokGeneratedQuestion extends KrokPreKrokQuestionBase {
  origin: "generated";
}

export type KrokPreKrokQuestion = KrokPreKrokOfficialQuestion | KrokPreKrokGeneratedQuestion;

export interface KrokAnswerExplanation {
  questionId: string;
  explanation: string;
  reviewNote?: string;
}

export interface KrokAnswerOverride {
  questionId: string;
  correctOptionId: string;
  reason: string;
  confirmedAt: string;
}

export interface KrokResolvedQuestion extends KrokQuestion {
  explanation: string;
  reviewNote?: string;
  contentSection?: KrokContentSectionCode;
  contentCode?: string;
  origin?: KrokPreKrokOrigin;
  sourceQuestionId?: string;
}

export interface KrokBooklet {
  id: KrokBookletId;
  title: string;
  year?: number;
  sourceFile: string;
  kind?: "official" | "training" | "pre-krok";
  questions: KrokQuestion[];
}

export interface KrokResolvedBooklet extends Omit<KrokBooklet, "questions"> {
  questions: KrokResolvedQuestion[];
}

export interface KrokTrainingBooklet extends Omit<KrokBooklet, "id" | "kind" | "questions"> {
  id: KrokTrainingBookletId;
  kind: "training";
  questions: KrokTrainingQuestion[];
}

export interface KrokPreKrokBooklet extends Omit<KrokBooklet, "id" | "kind" | "questions"> {
  id: KrokPreKrokBookletId;
  kind: "pre-krok";
  questions: KrokPreKrokQuestion[];
}

export interface KrokSession {
  version: 1;
  sessionId: string;
  bookletId: KrokSessionBookletId;
  questionOrderMode: KrokQuestionOrderMode;
  seed: number;
  questionIds: string[];
  answers: string;
  flags: string;
  startedAt: number;
  finishedAt?: number;
}
