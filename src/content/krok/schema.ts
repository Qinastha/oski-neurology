export type KrokOfficialBookletId = "2024" | "2025" | "2026";

export type KrokTrainingBookletId = "ai-001" | "ai-002" | "ai-003";

export type KrokBookletId = KrokOfficialBookletId | KrokTrainingBookletId;

export type KrokSessionBookletId = KrokBookletId | "random";

export type KrokQuestionOrderMode = "ordered" | "shuffled";

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
  contentSection: `${number}.0.0.0`;
  explanation: string;
}

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
  contentSection?: `${number}.0.0.0`;
}

export interface KrokBooklet {
  id: KrokBookletId;
  title: string;
  year?: number;
  sourceFile: string;
  kind?: "official" | "training";
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
