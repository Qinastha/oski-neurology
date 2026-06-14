import "server-only";

import { krokAnswerOverrides } from "./answer-overrides";
import { krokAnswerExplanations } from "./explanations";
import { krokBooklets } from "./generated";
import type {
  KrokAnswerExplanation,
  KrokBooklet,
  KrokBookletId,
  KrokQuestion,
  KrokResolvedBooklet,
  KrokResolvedQuestion
} from "./schema";

const typedKrokBooklets = krokBooklets as KrokBooklet[];
const typedKrokAnswerExplanations = krokAnswerExplanations as KrokAnswerExplanation[];
const explanationByQuestionId = new Map(
  typedKrokAnswerExplanations.map((item) => [item.questionId, item])
);
const overrideByQuestionId = new Map(krokAnswerOverrides.map((item) => [item.questionId, item]));

function resolveQuestion(question: KrokQuestion): KrokResolvedQuestion {
  const override = overrideByQuestionId.get(question.id);
  const explanation = explanationByQuestionId.get(question.id);

  return {
    ...question,
    correctOptionId: override?.correctOptionId ?? question.correctOptionId,
    explanation:
      explanation?.explanation ??
      "Обґрунтування для цього питання ще не додано до локальної бази.",
    reviewNote: explanation?.reviewNote
  };
}

const resolvedKrokBooklets: KrokResolvedBooklet[] = typedKrokBooklets.map((booklet) => ({
  ...booklet,
  questions: booklet.questions.map(resolveQuestion)
}));

export function getKrokBooklets(): KrokResolvedBooklet[] {
  return resolvedKrokBooklets;
}

export function getKrokBooklet(id: KrokBookletId): KrokResolvedBooklet | undefined {
  return resolvedKrokBooklets.find((booklet) => booklet.id === id);
}

export function getAllKrokQuestions(): KrokResolvedQuestion[] {
  return resolvedKrokBooklets.flatMap((booklet) => booklet.questions);
}

export function getKrokStats() {
  const questions = getAllKrokQuestions();

  return {
    bookletCount: typedKrokBooklets.length,
    questionCount: questions.length,
    optionCount: questions.reduce((sum, question) => sum + question.options.length, 0)
  };
}
