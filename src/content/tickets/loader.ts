import "server-only";

import { notFound } from "next/navigation";

import { stripMarkdown } from "@/content/markdown";
import { examQuestions, missingExamQuestions } from "./coverage";
import { examTicketQuestionOverrides } from "./curated";
import { examTickets } from "./generated";
import type {
  ExamTicket,
  ExamTicketQuestionOverride,
  ExamTicketRichBlock,
  ExamTicketSummary
} from "./schema";

const typedExamTickets = examTickets as ExamTicket[];
const overridesByQuestion = new Map(
  (examTicketQuestionOverrides as ExamTicketQuestionOverride[]).map((override) => [
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
    search: getExamTicketSearchBlob(ticket)
  }));
}

function getRichBlockSearchText(block: ExamTicketRichBlock): string[] {
  if (block.type === "paragraph" || block.type === "heading") {
    return [block.text];
  }
  if (block.type === "list") {
    return block.items;
  }
  if (block.type === "definition_list") {
    return block.items.flatMap((item) => [
      item.term,
      ...(Array.isArray(item.description) ? item.description : [item.description])
    ]);
  }
  if (block.type === "table") {
    return [...block.columns, ...block.rows.flat()];
  }
  if (block.type === "media") {
    return [block.caption ?? "", ...block.mediaIds];
  }
  return [];
}

export function getExamTicketSearchBlob(ticket: ExamTicket) {
  return stripMarkdown(
    [
      ticket.title,
      ticket.sourceFile,
      ticket.sourceType,
      ...ticket.questions.flatMap((question) => [
        question.title,
        ...question.blocks.map((block) => block.text),
        ...(question.richBlocks ?? []).flatMap(getRichBlockSearchText)
      ])
    ].join("\n")
  ).toLowerCase();
}

export function getExamQuestionCoverage() {
  return {
    questions: examQuestions,
    missing: missingExamQuestions
  };
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
