import "server-only";

import { notFound } from "next/navigation";

import { stripMarkdown } from "@/content/markdown";
import { normalizeSearchText } from "@/lib/search";
import { examQuestions, missingExamQuestions } from "./coverage";
import { examTicketQuestionOverrides } from "./curated";
import { examTickets } from "./generated";
import { missingExamQuestionAnswers } from "./missing-answers";
import type {
  ExamTicket,
  ExamTicketQuestionOverride,
  ExamTicketSummary,
  MissingExamQuestionAnswer
} from "./schema";

const typedExamTickets = examTickets as ExamTicket[];
const typedMissingExamQuestionAnswers = missingExamQuestionAnswers as MissingExamQuestionAnswer[];
const allExamTicketQuestionOverrides =
  examTicketQuestionOverrides as ExamTicketQuestionOverride[];
const overridesByQuestion = new Map(
  allExamTicketQuestionOverrides.map((override) => [
    `${override.ticketNumber}:${override.questionNumber}`,
    override
  ])
);

function applyExamTicketOverrides(ticket: ExamTicket): ExamTicket {
  const questions = ticket.questions.map((question) => {
    const override = overridesByQuestion.get(`${ticket.number}:${question.number}`);
    if (!override) {
      return question;
    }

    return {
      ...question,
      title: override.title ?? question.title,
      richBlocks: override.richBlocks
    };
  });

  return {
    ...ticket,
    questions
  };
}

export function getExamTickets() {
  return typedExamTickets.map(applyExamTicketOverrides);
}

export function getExamTicketByNumber(number: number): ExamTicket {
  const ticket = getExamTickets().find((item) => item.number === number);
  if (!ticket) {
    notFound();
  }
  return ticket;
}

export function getExamTicketSummaries(): ExamTicketSummary[] {
  return getExamTickets().map((ticket) => ({
    id: ticket.id,
    number: ticket.number,
    title: ticket.title,
    sourceFile: ticket.sourceFile,
    sourceType: ticket.sourceType,
    questionCount: ticket.questions.length,
    mediaCount:
      ticket.gallery.length +
      ticket.questions.reduce((sum, question) => sum + question.media.length, 0),
    questions: ticket.questions.map((question) => ({
      number: question.number,
      title: question.title
    })),
    search: getExamTicketSearchBlob(ticket)
  }));
}

export function getExamTicketSearchBlob(ticket: ExamTicket) {
  return normalizeSearchText(
    stripMarkdown(
    [
      ticket.number.toString(),
      `Білет ${ticket.number}`,
      ticket.title,
      ...ticket.questions.map((question) => question.title)
    ].join("\n")
    )
  );
}

export function getExamQuestionCoverage() {
  return {
    questions: examQuestions,
    missing: missingExamQuestions
  };
}

export function getMissingExamQuestionAnswers() {
  return typedMissingExamQuestionAnswers;
}

export function getMissingExamQuestionAnswerNumbers() {
  return typedMissingExamQuestionAnswers.map((answer) => answer.number);
}

export function getMissingExamQuestionAnswerByNumber(number: number): MissingExamQuestionAnswer {
  const answer = typedMissingExamQuestionAnswers.find((item) => item.number === number);
  if (!answer) {
    notFound();
  }
  return answer;
}

export function getExamTicketStats() {
  const tickets = getExamTickets();
  return {
    ticketCount: tickets.length,
    questionCount: examQuestions.length,
    missingQuestionCount: missingExamQuestions.length,
    mediaCount: tickets.reduce(
      (sum, ticket) =>
        sum +
        ticket.gallery.length +
        ticket.questions.reduce((questionSum, question) => questionSum + question.media.length, 0),
      0
    )
  };
}
