"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Search
} from "lucide-react";

import type { ExamTicketSummary, MissingExamQuestion } from "@/content/tickets/schema";
import { normalizeSearchText } from "@/lib/search";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_9px_rgba(250,204,21,0.42))_drop-shadow(0_2px_5px_rgba(124,58,237,0.16))]";

export function TicketsExplorer({
  tickets,
  missingQuestions
}: {
  tickets: ExamTicketSummary[];
  missingQuestions: MissingExamQuestion[];
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeSearchText(deferredQuery);

  const filteredTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) => normalizedQuery.length === 0 || ticket.search.includes(normalizedQuery)
      ),
    [normalizedQuery, tickets]
  );
  const filteredMissingQuestions = useMemo(
    () =>
      missingQuestions.filter(
        (question) =>
          normalizedQuery.length === 0 ||
          normalizeSearchText(`${question.number} ${question.text}`).includes(normalizedQuery)
      ),
    [missingQuestions, normalizedQuery]
  );

  return (
    <main className="grid min-h-dvh gap-[18px] p-5 md:grid-cols-[240px_minmax(0,1fr)] max-md:block max-md:p-0 max-md:pb-20">
      <aside className="sticky top-5 flex h-[calc(100dvh-40px)] flex-col rounded-lg border border-clinical-line/85 bg-white/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:hidden">
        <Link className="flex min-h-[38px] items-center gap-2.5 font-extrabold" href="/tickets">
          <span className="inline-flex h-12 w-12 items-center justify-center">
            <Image
              alt=""
              aria-hidden="true"
              className={BRAND_ICON_CLASS}
              height={46}
              src={BRAND_ICON_SRC}
              width={46}
            />
          </span>
          <span>Білети</span>
        </Link>
        <SiteSectionLinks active="tickets" className="mt-6 border-b border-clinical-line pb-4" />

        <div className="mt-auto rounded-lg border border-clinical-line bg-[#fffaf0] p-3">
          <p className="text-xs font-black uppercase text-clinical-accent-strong">Матеріали</p>
          <p className="mt-1 text-2xl font-black">{tickets.length}</p>
          <p className="text-sm text-clinical-muted">екзаменаційні білети</p>
        </div>
      </aside>

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-white/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[18px_14px_88px] max-md:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-extrabold text-clinical-accent-strong">
              {tickets.length} білетів
            </p>
            <h1 className="mt-1 text-[clamp(30px,4vw,46px)] font-black leading-[1.04]">
              Білети держіспиту
            </h1>
          </div>
        </header>

        <div className="mt-5" data-tickets-search-shell="query">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-clinical-line bg-white px-3 text-clinical-muted">
            <Search size={18} />
            <input
              className="w-full min-w-0 bg-transparent text-clinical-text outline-none placeholder:text-[#8f96a3]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук за номером білета або питанням..."
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3" data-ticket-list="catalog">
          {filteredTickets.map((ticket) => (
            <article
              className="grid gap-3 rounded-lg border border-clinical-line bg-white p-4 shadow-[0_18px_55px_rgba(84,67,20,0.05)] md:grid-cols-[minmax(0,1fr)_auto]"
              data-ticket-card={ticket.number}
              key={ticket.id}
            >
              <div className="min-w-0">
                <h2 className="text-xl font-black leading-tight">{ticket.title}</h2>
                <ul className="mt-3 space-y-1.5 text-[13px] leading-5 text-clinical-muted">
                  {ticket.questions.map((question) => (
                    <li className="flex gap-2" key={`${ticket.id}-${question.number}`}>
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-accent/70" />
                      <span>{question.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
                href={`/tickets/${ticket.number}`}
              >
                Відкрити
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <section
          className="mt-5 rounded-lg border border-amber-200 bg-[#fffaf0] p-4"
          data-missing-exam-questions="list"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-clinical-accent-strong">
              <AlertTriangle size={19} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black leading-tight">Питання поза білетами</h2>
              <p className="mt-1 text-sm leading-relaxed text-clinical-muted">
                Ці формулювання є в загальному списку, але не знайдені як самостійні питання у
                наданих 23 білетах.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {filteredMissingQuestions.map((question) => (
              <article
                className="scroll-mt-5 rounded-lg border border-clinical-line bg-white p-4 shadow-[0_14px_42px_rgba(84,67,20,0.045)]"
                data-missing-exam-question={question.number}
                id={`missing-question-${question.number}`}
                key={question.number}
              >
                <h3 className="text-[18px] font-black leading-snug text-clinical-text md:text-xl">
                  <a className="outline-none transition hover:text-clinical-accent-strong focus:text-clinical-accent-strong" href={`#missing-question-${question.number}`}>
                    {question.text}
                  </a>
                </h3>
              </article>
            ))}
          </div>
        </section>
      </section>

      <SiteMobileTabbar active="tickets" />
    </main>
  );
}
