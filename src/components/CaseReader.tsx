"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Brain,
  ChevronDown,
  ClipboardList,
  FileText,
  Home,
  Images,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Star
} from "lucide-react";

import type { CaseSummary, ChecklistItem, InteractionItem, StudyCase } from "@/content/schema";
import { formatGroup, formatStatus } from "@/lib/case-format";
import { MarkdownView } from "./MarkdownView";

interface CaseReaderProps {
  studyCase: StudyCase;
  cases: CaseSummary[];
  previous?: CaseSummary;
  next?: CaseSummary;
}

function readFavorites() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const value = JSON.parse(window.localStorage.getItem("favoriteCases") ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function SectionBlock({
  id,
  title,
  icon,
  children,
  defaultOpen = true
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="reader-section" id={id} open={defaultOpen}>
      <summary>
        <span>
          {icon}
          {title}
        </span>
        <ChevronDown size={18} />
      </summary>
      <div className="reader-section__body">{children}</div>
    </details>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  const [open, setOpen] = useState(item.order <= 3);

  return (
    <article className={`check-step ${open ? "is-open" : ""}`}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        <span className="check-step__number">{String(item.order).padStart(2, "0")}</span>
        <span className="check-step__title">{item.title}</span>
        <ChevronDown size={18} />
      </button>
      {open ? (
        <div className="check-step__answer">
          <span>Что проговорить</span>
          <MarkdownView markdown={item.body} />
        </div>
      ) : null}
    </article>
  );
}

function InteractionCard({ item, index }: { item: InteractionItem; index: number }) {
  return (
    <article className="interaction-card">
      <span>{String(index + 1).padStart(2, "0")}</span>
      <div>
        <strong>{item.title}</strong>
        <MarkdownView markdown={item.body} />
      </div>
    </article>
  );
}

export function CaseReader({ studyCase, cases, previous, next }: CaseReaderProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(readFavorites());
    window.localStorage.setItem("lastCase", studyCase.slug);
  }, [studyCase.slug]);

  const favorite = favorites.has(studyCase.slug);

  function toggleFavorite() {
    setFavorites((current) => {
      const nextFavorites = new Set(current);
      if (nextFavorites.has(studyCase.slug)) {
        nextFavorites.delete(studyCase.slug);
      } else {
        nextFavorites.add(studyCase.slug);
      }
      window.localStorage.setItem("favoriteCases", JSON.stringify([...nextFavorites]));
      return nextFavorites;
    });
  }

  const anchors = [
    ["original", "Оригинальная задача"],
    ...(studyCase.group === "imaging" ? ([["imaging", "Снимки"]] as const) : []),
    ["checklist", "Разбор по чеклисту"],
    ["interaction", "Взаимодействие"]
  ] as const;

  return (
    <main className="reader-shell">
      <aside className="side-rail reader-rail">
        <Link className="brand" href="/cases">
          <span className="brand__mark">
            <Brain size={24} />
          </span>
          <span>ОСКИ Неврология</span>
        </Link>
        <nav className="mini-case-nav" aria-label="Станции">
          {cases.map((item) => (
            <Link
              className={item.slug === studyCase.slug ? "is-active" : ""}
              href={`/cases/${item.slug}`}
              key={item.slug}
            >
              <span>{String(item.order).padStart(2, "0")}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className="reader-main">
        <header className="reader-topbar">
          <Link className="icon-button" href="/cases" aria-label="К списку станций">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span>{formatGroup(studyCase.group)}</span>
            <h1>{studyCase.title}</h1>
          </div>
          <button className="icon-button" aria-label="Меню" type="button">
            <MoreHorizontal size={18} />
          </button>
        </header>

        <div className="reader-title-row">
          <div>
            <p className="breadcrumbs">
              МРТ/КТ и чеклисты <span>/</span> {String(studyCase.order).padStart(2, "0")}
            </p>
            <h2>{studyCase.title}</h2>
            <p>{studyCase.focus}</p>
          </div>
          <button className="favorite-button" type="button" onClick={toggleFavorite}>
            {favorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {favorite ? "В избранном" : "В избранное"}
          </button>
        </div>

        <SectionBlock id="original" title="Оригинальная задача" icon={<FileText size={19} />}>
          <div className="source-row">
            <a href={studyCase.sourcePdf.href} target="_blank">
              {studyCase.sourcePdf.label}
            </a>
            <span>{formatStatus(studyCase.reviewStatus)}</span>
          </div>
          <MarkdownView markdown={studyCase.originalMarkdown} />
          <details className="page-gallery-disclosure">
            <summary>
              Показать страницы задачи ({studyCase.originalPages.length})
              <ChevronDown size={17} />
            </summary>
            <div className="original-pages">
              {studyCase.originalPages.map((page) => (
                <figure key={page.src}>
                  <Image
                    src={page.src}
                    alt={page.alt}
                    width={900}
                    height={1200}
                    sizes="(max-width: 820px) 78vw, 260px"
                  />
                  <figcaption>{page.caption}</figcaption>
                </figure>
              ))}
            </div>
          </details>
        </SectionBlock>

        {studyCase.group === "imaging" ? (
          <SectionBlock id="imaging" title="Снимки" icon={<Images size={19} />}>
            <div className="image-grid">
              {studyCase.imaging.map((image) => (
                <figure key={image.src}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={720}
                    height={540}
                    sizes="(max-width: 820px) 78vw, 240px"
                  />
                  <figcaption>{image.caption}</figcaption>
                </figure>
              ))}
            </div>
          </SectionBlock>
        ) : null}

        <SectionBlock id="checklist" title="Разбор по чеклисту" icon={<ClipboardList size={19} />}>
          <div className="checklist-flow">
            {studyCase.checklist.map((item) => (
              <ChecklistCard item={item} key={item.id} />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          id="interaction"
          title="Взаимодействие"
          icon={<MessageSquareText size={19} />}
          defaultOpen={studyCase.interaction.length > 0}
        >
          {studyCase.interaction.length > 0 ? (
            <div className="interaction-list">
              {studyCase.interaction.map((item, index) => (
                <InteractionCard item={item} index={index} key={item.id} />
              ))}
            </div>
          ) : (
            <p className="muted-copy">В этой станции полноценного актерского диалога нет.</p>
          )}
        </SectionBlock>

        <footer className="reader-pager">
          {previous ? (
            <Link href={`/cases/${previous.slug}`}>
              <ArrowLeft size={17} />
              Назад
            </Link>
          ) : (
            <span />
          )}
          <span>{studyCase.order} из {cases.length}</span>
          {next ? (
            <Link href={`/cases/${next.slug}`}>
              Далее
              <ArrowRight size={17} />
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </section>

      <aside className="reader-aside">
        <nav aria-label="Содержание станции">
          <strong>Содержание станции</strong>
          {anchors.map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>

        {studyCase.group === "imaging" ? (
          <section>
            <strong>Ключевой вывод</strong>
            <p>{studyCase.keyAnswer}</p>
          </section>
        ) : null}

        <section>
          <strong>Теги</strong>
          <div className="tag-cloud">
            {studyCase.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>

        {studyCase.group === "imaging" ? (
          <section>
            <strong>Источники</strong>
            {studyCase.sources.map((source) => (
              <a href={source.href} key={source.href} target="_blank">
                {source.label}
              </a>
            ))}
          </section>
        ) : null}
      </aside>

      <nav className="mobile-tabbar" aria-label="Мобильная навигация">
        <Link href="/cases">
          <Home size={19} />
          Все
        </Link>
        <button type="button" onClick={toggleFavorite}>
          <Star size={19} />
          Избранное
        </button>
        <a href="#checklist">
          <ClipboardList size={19} />
          Чеклист
        </a>
        <button type="button">
          <Menu size={19} />
          Меню
        </button>
      </nav>
    </main>
  );
}
