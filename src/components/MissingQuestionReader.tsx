"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  FileText
} from "lucide-react";

import type { MissingExamQuestionAnswer } from "@/content/tickets/schema";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_9px_rgba(250,204,21,0.42))_drop-shadow(0_2px_5px_rgba(124,58,237,0.16))]";

export function MissingQuestionReader({
  answer,
  answers
}: {
  answer: MissingExamQuestionAnswer;
  answers: MissingExamQuestionAnswer[];
}) {
  const currentIndex = answers.findIndex((item) => item.number === answer.number);
  const previous = currentIndex > 0 ? answers[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < answers.length - 1 ? answers[currentIndex + 1] : undefined;

  return (
    <main className="grid min-h-dvh justify-center gap-[18px] p-5 md:grid-cols-[240px_minmax(0,900px)] max-md:block max-md:p-0 max-md:pb-20">
      <aside className="sticky top-5 flex h-[calc(100dvh-40px)] flex-col rounded-lg border border-clinical-line/85 bg-clinical-surface/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:hidden">
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
        <nav className="mt-4 grid gap-1.5 overflow-auto pr-0.5" aria-label="Відповіді поза білетами">
          {answers.map((item) => (
            <Link
              aria-current={item.number === answer.number ? "page" : undefined}
              className={[
                "min-h-[42px] rounded-lg p-2 text-[13px] leading-tight text-clinical-muted transition hover:bg-clinical-accent-soft hover:text-clinical-text",
                item.number === answer.number ? "bg-clinical-accent-soft text-clinical-text" : ""
              ].join(" ")}
              href={`/tickets/questions/${item.number}`}
              key={item.number}
            >
              <span className="font-black">Питання {item.number}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-clinical-surface/[0.92] px-[clamp(18px,4vw,48px)] py-6 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[0_14px_88px] max-md:shadow-none">
        <header className="sticky top-0 z-10 -mx-3 mb-3 hidden min-h-[68px] grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-clinical-line bg-clinical-bg/95 px-3 py-2 backdrop-blur-xl max-md:grid">
          <Link
            aria-label="До списку білетів"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-clinical-surface"
            href="/tickets"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 text-center">
            <span className="text-xs font-extrabold text-clinical-accent-strong">
              Питання поза білетами
            </span>
            <h1 className="mt-1 truncate text-base font-extrabold">{answer.title}</h1>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-clinical-surface text-clinical-accent-strong">
            <FileText size={18} />
          </span>
        </header>

        <article className="[overflow-wrap:anywhere]" data-missing-answer={answer.number}>
          <div className="pb-5 max-md:pt-4">
            <p className="text-[13px] font-extrabold text-clinical-accent-strong">
              Білети / питання поза білетами
            </p>
            <h1 className="mt-1 text-[clamp(30px,5vw,52px)] font-black leading-[1.02] tracking-normal text-clinical-text">
              {answer.title}
            </h1>
            <p className="mt-4 max-w-[72ch] text-[17px] leading-8 text-clinical-muted max-md:text-base max-md:leading-7">
              {answer.lead}
            </p>
          </div>

          <div className="grid gap-7">
            {answer.sections.map((section) => (
              <section
                className="scroll-mt-24 border-t border-clinical-line pt-7 first:border-t-0 first:pt-2"
                data-missing-answer-section={section.id}
                id={section.id}
                key={section.id}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong">
                    <BookOpenCheck size={18} />
                  </span>
                  <h2 className="text-[clamp(22px,3vw,30px)] font-black leading-tight text-clinical-text">
                    {section.title}
                  </h2>
                </div>

                {section.paragraphs?.length ? (
                  <div className="mt-4 grid gap-4 text-[16px] leading-8 text-clinical-muted max-md:text-[15px] max-md:leading-7">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}

                {section.items?.length ? (
                  <ul className="mt-4 grid gap-3 text-[15px] leading-7 text-clinical-muted">
                    {section.items.map((item) => (
                      <li className="flex gap-3" key={item}>
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-accent-strong" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

        </article>

        <footer className="mt-8 flex items-center justify-between gap-4 border-t border-clinical-line pt-5">
          {previous ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text"
              href={`/tickets/questions/${previous.number}`}
            >
              <ArrowLeft size={17} />
              Назад
            </Link>
          ) : (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text"
              href="/tickets"
            >
              <ArrowLeft size={17} />
              До списку
            </Link>
          )}
          <span className="text-sm text-clinical-muted">
            {currentIndex + 1} з {answers.length}
          </span>
          {next ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
              href={`/tickets/questions/${next.number}`}
            >
              Далі
              <ArrowRight size={17} />
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </section>

      <SiteMobileTabbar active="tickets" />
    </main>
  );
}
