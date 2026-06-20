import type { Metadata } from "next";

import { TicketReader } from "@/components/TicketReader";
import { getExamTicketByNumber, getExamTickets } from "@/content/tickets/loader";

interface TicketPageProps {
  params: Promise<{ number: string }>;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return getExamTickets().map((ticket) => ({ number: String(ticket.number) }));
}

export async function generateMetadata({ params }: TicketPageProps): Promise<Metadata> {
  const { number } = await params;
  const ticket = getExamTicketByNumber(Number(number));

  return {
    title: ticket.title,
    description: `${ticket.title}: ${ticket.questions.length} навчальні блоки для підготовки до держіспиту.`
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { number } = await params;
  const ticket = getExamTicketByNumber(Number(number));

  return <TicketReader ticket={ticket} tickets={getExamTickets()} />;
}
