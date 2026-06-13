export type KrokBookletId = "2024" | "2025" | "2026";

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

export interface KrokBooklet {
  id: KrokBookletId;
  title: string;
  year: number;
  sourceFile: string;
  questions: KrokQuestion[];
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
