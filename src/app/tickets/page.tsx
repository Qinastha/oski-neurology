import type { Metadata } from "next";

import { TicketsExplorer } from "@/components/TicketsExplorer";
import { getExamQuestionCoverage, getExamTicketSummaries } from "@/content/tickets/loader";

export const metadata: Metadata = {
  title: "Білети",
  description:
    "Екзаменаційні білети з неврології: читальний режим, зображення з DOCX та окремий список питань поза білетами."
};

export const dynamic = "force-static";

export default function TicketsPage() {
  const { missing } = getExamQuestionCoverage();

  return <TicketsExplorer missingQuestions={missing} tickets={getExamTicketSummaries()} />;
}
