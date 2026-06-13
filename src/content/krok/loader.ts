import "server-only";

import { krokBooklets } from "./generated";
import type { KrokBooklet, KrokBookletId, KrokQuestion } from "./schema";

const typedKrokBooklets = krokBooklets as KrokBooklet[];

export function getKrokBooklets(): KrokBooklet[] {
  return typedKrokBooklets;
}

export function getKrokBooklet(id: KrokBookletId): KrokBooklet | undefined {
  return typedKrokBooklets.find((booklet) => booklet.id === id);
}

export function getAllKrokQuestions(): KrokQuestion[] {
  return typedKrokBooklets.flatMap((booklet) => booklet.questions);
}

export function getKrokStats() {
  const questions = getAllKrokQuestions();

  return {
    bookletCount: typedKrokBooklets.length,
    questionCount: questions.length,
    optionCount: questions.reduce((sum, question) => sum + question.options.length, 0)
  };
}
