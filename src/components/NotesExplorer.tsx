"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Search,
  Sparkles
} from "lucide-react";

import type { ResolvedNoteSection } from "@/content/notes/schema";
import { cn } from "@/lib/cn";
import { normalizeSearchText } from "@/lib/search";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

export interface ExplorerNoteSection extends ResolvedNoteSection {
  search: string;
}

const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_9px_rgba(250,204,21,0.42))_drop-shadow(0_2px_5px_rgba(124,58,237,0.16))]";
const BOOKMARKS_KEY = "noteBookmarksV1";
const READ_KEY = "noteReadV1";
const LAST_NOTE_KEY = "lastNoteV1";

function readStringSet(key: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return new Set(
      Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []
    );
  } catch {
    return new Set<string>();
  }
}

function writeStringSet(key: string, value: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify([...value]));
}

function formatStatus(section: ExplorerNoteSection) {
  return section.block ? "Доступний" : "Заплановано";
}

export function NotesExplorer({ sections }: { sections: ExplorerNoteSection[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [lastNote, setLastNote] = useState<string | null>(null);

  useEffect(() => {
    setBookmarks(readStringSet(BOOKMARKS_KEY));
    setReadSections(readStringSet(READ_KEY));
    setLastNote(window.localStorage.getItem(LAST_NOTE_KEY));
  }, []);

  const normalizedQuery = normalizeSearchText(deferredQuery);
  const filteredSections = useMemo(
    () =>
      sections.filter(
        (section) => normalizedQuery.length === 0 || section.search.includes(normalizedQuery)
      ),
    [normalizedQuery, sections]
  );
  const availableCount = sections.filter((section) => section.block).length;
  const readAvailableCount = sections.filter(
    (section) => section.block && readSections.has(section.slug)
  ).length;
  const lastAvailable = lastNote ? sections.find((section) => section.slug === lastNote && section.block) : undefined;

  function toggleBookmark(slug: string) {
    setBookmarks((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      writeStringSet(BOOKMARKS_KEY, next);
      return next;
    });
  }

  function toggleRead(slug: string) {
    setReadSections((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      writeStringSet(READ_KEY, next);
      return next;
    });
  }

  return (
    <main className="grid min-h-dvh gap-[18px] p-5 md:grid-cols-[240px_minmax(0,1fr)] max-md:block max-md:p-0 max-md:pb-20">
      <aside className="sticky top-5 flex h-[calc(100dvh-40px)] flex-col rounded-lg border border-clinical-line/85 bg-clinical-surface/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:hidden">
        <Link className="flex min-h-[38px] items-center gap-2.5 font-extrabold" href="/notes">
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
          <span>Конспект</span>
        </Link>
        <SiteSectionLinks active="notes" className="mt-6 border-b border-clinical-line pb-4" />

        <div className="mt-auto rounded-lg border border-clinical-line bg-clinical-surface-soft p-3">
          <p className="text-xs font-black uppercase text-clinical-accent-strong">Прогрес</p>
          <p className="mt-1 text-2xl font-black">
            {readAvailableCount}/{availableCount}
          </p>
          <p className="text-sm text-clinical-muted">доступних блоків прочитано</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-clinical-line">
            <div
              className="h-full rounded-full bg-clinical-accent"
              style={{ width: `${availableCount ? (readAvailableCount / availableCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </aside>

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-clinical-surface/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[18px_14px_88px] max-md:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-extrabold text-clinical-accent-strong">
              {sections.length} блоків структури · {availableCount} доступний
            </p>
            <h1 className="mt-1 text-[clamp(30px,4vw,46px)] font-black leading-[1.04]">
              Конспект КРОК 3 Неврологія
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {lastAvailable ? (
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3.5 text-sm font-extrabold text-[#201900]"
                href={`/notes/${lastAvailable.slug}`}
              >
                <BookOpen size={16} />
                Продовжити
              </Link>
            ) : null}
          </div>
        </header>

        <div className="mt-5" data-notes-search-shell="query">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-clinical-muted">
            <Search size={18} />
            <input
              className="w-full min-w-0 bg-transparent text-clinical-text outline-none placeholder:text-clinical-placeholder"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук за темою або підтемою..."
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3" data-notes-section-list="catalog">
          {filteredSections.map((section) => {
            const isBookmarked = bookmarks.has(section.slug);
            const isRead = readSections.has(section.slug);
            const isAvailable = Boolean(section.block);

            return (
              <article
                className={cn(
                  "grid gap-3 rounded-lg border bg-clinical-surface p-4 shadow-[0_18px_55px_rgba(84,67,20,0.05)] md:grid-cols-[minmax(0,1fr)_auto]",
                  isAvailable ? "border-clinical-line" : "border-clinical-line/65 opacity-75"
                )}
                data-note-section-card={section.slug}
                data-note-section-status={isAvailable ? "available" : "planned"}
                key={section.code}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex min-h-8 items-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft px-2.5 text-sm font-black text-clinical-accent-strong">
                      {section.code.split(".")[0]}.0
                    </span>
                    <span className="rounded-full border border-clinical-line bg-clinical-surface-soft px-2.5 py-1 text-xs font-black text-clinical-accent-strong">
                      {section.weight > 0 ? `${section.weight}%` : "Екстра"}
                    </span>
                    <span className="rounded-full border border-clinical-line bg-clinical-surface px-2.5 py-1 text-xs font-extrabold text-clinical-muted">
                      {formatStatus(section)}
                    </span>
                    {isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-clinical-success-line bg-clinical-success-surface px-2.5 py-1 text-xs font-extrabold text-clinical-success-text">
                        <CheckCircle2 size={13} />
                        Прочитано
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-black leading-tight">{section.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {section.subtopics.map((item) => (
                      <span
                        className="rounded-lg border border-clinical-line bg-clinical-control px-2 py-1 text-[12px] font-semibold leading-5 text-clinical-muted"
                        key={item.code}
                      >
                        {item.code} · {item.title}
                      </span>
                    ))}
                  </div>
                  {section.block?.coverageHighlights.length ? (
                    <div className="mt-3 rounded-lg border border-clinical-line bg-clinical-surface-soft px-3 py-2">
                      <p className="text-[11px] font-black uppercase leading-5 text-clinical-accent-strong">
                        Розбирається
                      </p>
                      <p className="mt-1 text-sm leading-6 text-clinical-muted">
                        {section.block.coverageHighlights.join(" · ")}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch md:justify-center">
                  <button
                    aria-pressed={isBookmarked}
                    className={cn(
                      "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-extrabold transition",
                      isBookmarked
                        ? "border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong"
                        : "border-clinical-line bg-clinical-surface text-clinical-muted hover:border-clinical-line-strong"
                    )}
                    type="button"
                    onClick={() => toggleBookmark(section.slug)}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {isBookmarked ? "В обраному" : "Обрати"}
                  </button>
                  {isAvailable ? (
                    <>
                      <Link
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
                        href={`/notes/${section.slug}`}
                        onClick={() => window.localStorage.setItem(LAST_NOTE_KEY, section.slug)}
                      >
                        <BookOpen size={16} />
                        Відкрити
                      </Link>
                      <button
                        aria-pressed={isRead}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text transition hover:border-clinical-line-strong hover:bg-clinical-surface-soft"
                        type="button"
                        onClick={() => toggleRead(section.slug)}
                      >
                        <CheckCircle2 size={16} />
                        {isRead ? "Скасувати" : "Прочитано"}
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-control px-3 text-sm font-extrabold text-clinical-muted">
                      <Sparkles size={16} />
                      Буде додано
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <SiteMobileTabbar active="notes" />
    </main>
  );
}
