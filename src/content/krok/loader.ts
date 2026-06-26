import "server-only";

import { krokAnswerOverrides } from "./answer-overrides";
import { krokAnswerExplanations } from "./explanations";
import { krokBooklets } from "./generated";
import { krokPreKrokBooklets } from "./pre-krok";
import { krokTrainingBooklets } from "./training";
import type {
  KrokAnswerExplanation,
  KrokBooklet,
  KrokBookletId,
  KrokPreKrokBooklet,
  KrokQuestion,
  KrokResolvedBooklet,
  KrokResolvedQuestion,
  KrokTrainingBooklet
} from "./schema";

const typedKrokBooklets = krokBooklets as KrokBooklet[];
const typedKrokPreKrokBooklets = krokPreKrokBooklets as KrokPreKrokBooklet[];
const typedKrokTrainingBooklets = krokTrainingBooklets as KrokTrainingBooklet[];
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
  kind: "official",
  questions: booklet.questions.map(resolveQuestion)
}));

const resolvedKrokTrainingBooklets: KrokResolvedBooklet[] = typedKrokTrainingBooklets.map(
  (booklet) => ({
    ...booklet,
    questions: booklet.questions.map((question) => ({
      ...question,
      explanation: question.explanation
    }))
  })
);

const resolvedKrokPreKrokBooklets: KrokResolvedBooklet[] = typedKrokPreKrokBooklets.map(
  (booklet) => ({
    ...booklet,
    questions: booklet.questions.map((question) => ({
      ...question,
      explanation: question.explanation
    }))
  })
);

const allResolvedKrokBooklets = [
  ...resolvedKrokBooklets,
  ...resolvedKrokPreKrokBooklets,
  ...resolvedKrokTrainingBooklets
];

export function getKrokBooklet(id: KrokBookletId): KrokResolvedBooklet | undefined {
  return allResolvedKrokBooklets.find((booklet) => booklet.id === id);
}

export function getAllKrokQuestions(): KrokResolvedQuestion[] {
  return allResolvedKrokBooklets.flatMap((booklet) => booklet.questions);
}

export function getOfficialKrokQuestions(): KrokResolvedQuestion[] {
  return resolvedKrokBooklets.flatMap((booklet) => booklet.questions);
}

export function getKrokCatalog() {
  return {
    officialBooklets: resolvedKrokBooklets,
    preKrokBooklets: resolvedKrokPreKrokBooklets,
    trainingBooklets: resolvedKrokTrainingBooklets,
    allBooklets: allResolvedKrokBooklets,
    officialQuestions: getOfficialKrokQuestions()
  };
}

export function getKrokStats() {
  const questions = getAllKrokQuestions();

  return {
    bookletCount: allResolvedKrokBooklets.length,
    officialBookletCount: typedKrokBooklets.length,
    preKrokBookletCount: typedKrokPreKrokBooklets.length,
    trainingBookletCount: typedKrokTrainingBooklets.length,
    questionCount: questions.length,
    officialQuestionCount: getOfficialKrokQuestions().length,
    optionCount: questions.reduce((sum, question) => sum + question.options.length, 0)
  };
}
