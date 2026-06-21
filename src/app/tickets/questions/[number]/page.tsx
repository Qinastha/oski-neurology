import type { Metadata } from "next";

import { MissingQuestionReader } from "@/components/MissingQuestionReader";
import {
  getMissingExamQuestionAnswerByNumber,
  getMissingExamQuestionAnswers
} from "@/content/tickets/loader";

interface MissingQuestionPageProps {
  params: Promise<{ number: string }>;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return getMissingExamQuestionAnswers().map((answer) => ({ number: String(answer.number) }));
}

export async function generateMetadata({ params }: MissingQuestionPageProps): Promise<Metadata> {
  const { number } = await params;
  const answer = getMissingExamQuestionAnswerByNumber(Number(number));

  return {
    title: answer.title,
    description: `${answer.title}: відповідь з перевірених клінічних джерел для підготовки до держіспиту.`
  };
}

export default async function MissingQuestionPage({ params }: MissingQuestionPageProps) {
  const { number } = await params;
  const answer = getMissingExamQuestionAnswerByNumber(Number(number));

  return <MissingQuestionReader answer={answer} answers={getMissingExamQuestionAnswers()} />;
}
