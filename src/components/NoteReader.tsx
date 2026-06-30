"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Map,
  Search,
  Sparkles
} from "lucide-react";

import type { NoteBlock, NoteContentBlock, NotePoint, ResolvedNoteSection } from "@/content/notes/schema";
import { cn } from "@/lib/cn";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

interface NoteReaderProps {
  sections: ResolvedNoteSection[];
  section: ResolvedNoteSection;
  block: NoteBlock;
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

function getColumnWidth(columnCount: number, columnIndex: number) {
  if (columnCount <= 1) {
    return "100%";
  }

  const firstColumnWidth = columnCount === 2 ? 34 : columnCount === 3 ? 28 : 24;
  if (columnIndex === 0) {
    return `${firstColumnWidth}%`;
  }

  return `${(100 - firstColumnWidth) / (columnCount - 1)}%`;
}

function TableBlock({ block }: { block: NoteContentBlock }) {
  const columns = block.columns ?? [];
  const rows = block.rows ?? [];

  return (
    <section
      className="scroll-mt-24 border-t border-clinical-line py-7 first:border-t-0 first:pt-2"
      data-note-content-block={block.id}
    >
      {block.title ? (
        <h2 className="text-[clamp(22px,3vw,30px)] font-black leading-tight text-clinical-text">
          {block.title}
        </h2>
      ) : null}
      {block.lead ? (
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-clinical-muted">{block.lead}</p>
      ) : null}

      <div className="mt-4 hidden rounded-lg border border-clinical-line bg-clinical-surface/80 md:block">
        <table
          className="w-full table-fixed border-collapse text-left text-[13px] leading-6"
          data-note-table={block.id}
        >
          <colgroup>
            {columns.map((column, columnIndex) => (
              <col key={column} style={{ width: getColumnWidth(columns.length, columnIndex) }} />
            ))}
          </colgroup>
          <thead className="bg-clinical-accent-soft text-clinical-accent-strong">
            <tr>
              {columns.map((column) => (
                <th className="border-b border-clinical-line px-3 py-2 font-black [overflow-wrap:anywhere]" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="odd:bg-clinical-surface even:bg-clinical-surface-soft" key={`${block.id}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    className="border-b border-clinical-line px-3 py-2 align-top text-clinical-muted [overflow-wrap:anywhere]"
                    key={`${block.id}-${rowIndex}-${cellIndex}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden" data-note-table-card-list={block.id}>
        {rows.map((row, rowIndex) => {
          const rowTitle = row[0] || `Рядок ${rowIndex + 1}`;
          const details = columns.slice(1).map((column, columnIndex) => ({
            label: column,
            value: row[columnIndex + 1] ?? ""
          }));

          return (
            <article
              className="rounded-lg border border-clinical-line bg-clinical-surface/80 p-3"
              data-note-table-card-row={block.id}
              key={`${block.id}-card-${rowIndex}`}
            >
              <p className="text-[11px] font-black uppercase leading-5 text-clinical-accent-strong">
                {columns[0] ?? "Пункт"}
              </p>
              <h3 className="mt-0.5 text-[15px] font-black leading-6 text-clinical-text [overflow-wrap:anywhere]">
                {rowTitle}
              </h3>
              {details.length > 0 ? (
                <dl className="mt-3 grid gap-2">
                  {details.map((item) => (
                    <div className="rounded-lg bg-clinical-surface-soft px-3 py-2" key={`${block.id}-card-${rowIndex}-${item.label}`}>
                      <dt className="text-[11px] font-black uppercase leading-5 text-clinical-accent-strong">
                        {item.label}
                      </dt>
                      <dd className="m-0 mt-0.5 text-[14px] leading-6 text-clinical-muted [overflow-wrap:anywhere]">
                        {item.value || "-"}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ContentBlock({ block }: { block: NoteContentBlock }) {
  if (block.type === "table") {
    return <TableBlock block={block} />;
  }

  const isCallout = block.type === "clinical_note";

  return (
    <section
      className={cn(
        "scroll-mt-24 border-t border-clinical-line py-7 first:border-t-0 first:pt-2",
        isCallout && "border-l-4 border-t-0 border-clinical-accent bg-clinical-surface-soft px-4 py-4"
      )}
      data-note-content-block={block.id}
    >
      {block.title ? (
        <h2
          className={cn(
            "text-[clamp(22px,3vw,30px)] font-black leading-tight text-clinical-text",
            isCallout && "text-xl"
          )}
        >
          {block.title}
        </h2>
      ) : null}
      {block.lead ? (
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-clinical-muted">{block.lead}</p>
      ) : null}
      {block.paragraphs?.length ? (
        <div className="mt-4 grid gap-4 text-[16px] leading-8 text-clinical-muted max-md:text-[15px] max-md:leading-7">
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {block.items?.length ? (
        <ul className="mt-4 grid gap-3 text-[15px] leading-7 text-clinical-muted">
          {block.items.map((item) => (
            <li className="flex gap-3" key={item}>
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-accent-strong" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function PointFlowSection({
  id,
  title,
  icon,
  points
}: {
  id: string;
  title: string;
  icon: ReactNode;
  points: NotePoint[] | undefined;
}) {
  if (!points?.length) {
    return null;
  }

  return (
    <section className="scroll-mt-24 border-t border-clinical-line py-7" id={id}>
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong">
          {icon}
        </span>
        <h2 className="text-[clamp(22px,3vw,30px)] font-black leading-tight">{title}</h2>
      </div>
      <div className="grid gap-4">
        {points.map((point) => (
          <div
            className="border-l-2 border-clinical-line-strong pl-4"
            data-note-point-item={id}
            key={point.title}
          >
            <h3 className="text-[17px] font-black leading-tight text-clinical-text">{point.title}</h3>
            <p className="mt-1.5 text-[15px] leading-7 text-clinical-muted">{point.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NoteReader({ sections, section, block }: NoteReaderProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [read, setRead] = useState(false);
  const availableSections = useMemo(() => sections.filter((item) => item.block), [sections]);
  const currentIndex = availableSections.findIndex((item) => item.slug === section.slug);
  const previous = currentIndex > 0 ? availableSections[currentIndex - 1] : undefined;
  const next =
    currentIndex >= 0 && currentIndex < availableSections.length - 1
      ? availableSections[currentIndex + 1]
      : undefined;

  useEffect(() => {
    window.localStorage.setItem(LAST_NOTE_KEY, section.slug);
    setBookmarked(readStringSet(BOOKMARKS_KEY).has(section.slug));
    setRead(readStringSet(READ_KEY).has(section.slug));
  }, [section.slug]);

  function toggleBookmark() {
    const nextBookmarks = readStringSet(BOOKMARKS_KEY);
    if (nextBookmarks.has(section.slug)) {
      nextBookmarks.delete(section.slug);
      setBookmarked(false);
    } else {
      nextBookmarks.add(section.slug);
      setBookmarked(true);
    }
    writeStringSet(BOOKMARKS_KEY, nextBookmarks);
  }

  function toggleRead() {
    const nextRead = readStringSet(READ_KEY);
    if (nextRead.has(section.slug)) {
      nextRead.delete(section.slug);
      setRead(false);
    } else {
      nextRead.add(section.slug);
      setRead(true);
    }
    writeStringSet(READ_KEY, nextRead);
  }

  return (
    <main className="grid min-h-dvh justify-center gap-[18px] p-5 md:grid-cols-[240px_minmax(0,900px)] max-md:block max-md:p-0 max-md:pb-20">
      <aside
        className="sticky top-5 flex h-[calc(100dvh-40px)] flex-col rounded-lg border border-clinical-line/85 bg-clinical-surface/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:hidden"
        data-note-left-nav="blocks"
      >
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
        <nav className="mt-4 grid gap-1.5 overflow-auto pr-0.5" aria-label="Блоки конспекту">
          {sections.map((item) =>
            item.block ? (
              <Link
                className={cn(
                  "grid min-h-[46px] grid-cols-[36px_minmax(0,1fr)] gap-2 rounded-lg p-2 text-[13px] leading-tight text-clinical-muted transition hover:bg-clinical-accent-soft hover:text-clinical-text",
                  item.slug === section.slug && "bg-clinical-accent-soft text-clinical-text"
                )}
                href={`/notes/${item.slug}`}
                key={item.code}
              >
                <span className="font-black text-clinical-accent-strong">
                  {item.code.split(".")[0]}.0
                </span>
                <span className="line-clamp-2 min-w-0">{item.title}</span>
              </Link>
            ) : (
              <span
                className="grid min-h-[46px] grid-cols-[36px_minmax(0,1fr)] gap-2 rounded-lg p-2 text-[13px] leading-tight text-clinical-muted opacity-65"
                key={item.code}
              >
                <span className="font-black">{item.code.split(".")[0]}.0</span>
                <span className="line-clamp-2 min-w-0">{item.title}</span>
              </span>
            )
          )}
        </nav>
      </aside>

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-clinical-surface/[0.92] px-[clamp(18px,4vw,48px)] py-6 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[0_14px_88px] max-md:shadow-none">
        <header className="sticky top-0 z-10 -mx-3 mb-3 hidden min-h-[68px] grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-clinical-line bg-clinical-bg/95 px-3 py-2 backdrop-blur-xl max-md:grid">
          <Link
            aria-label="До списку блоків конспекту"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-clinical-surface"
            href="/notes"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 text-center">
            <span className="text-xs font-extrabold text-clinical-accent-strong">
              {section.code.split(".")[0]}.0 · {section.weight}%
            </span>
            <h1 className="mt-1 truncate text-base font-extrabold">{section.title}</h1>
          </div>
          <button
            aria-pressed={read}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-clinical-surface"
            type="button"
            onClick={toggleRead}
          >
            <CheckCircle2 size={18} />
          </button>
        </header>

        <article className="[overflow-wrap:anywhere]" data-note-reader={section.slug}>
          <div className="flex items-start justify-between gap-4 pb-5 max-md:block max-md:pt-4">
            <div>
              <p className="text-[13px] font-extrabold text-clinical-accent-strong">
                Конспект / {section.code.split(".")[0]}.0 · вага {section.weight}%
              </p>
              <h1 className="mt-1 max-w-[14ch] text-[clamp(34px,5vw,58px)] font-black leading-[0.98] tracking-normal text-clinical-text md:max-w-[15ch]">
                {section.title}
              </h1>
              <p className="mt-4 max-w-[68ch] text-[17px] leading-8 text-clinical-muted max-md:text-base max-md:leading-7">
                {block.summary}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 max-md:mt-3">
              <button
                aria-pressed={bookmarked}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text"
                type="button"
                onClick={toggleBookmark}
              >
                {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {bookmarked ? "В обраному" : "До обраного"}
              </button>
              <button
                aria-pressed={read}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
                type="button"
                onClick={toggleRead}
              >
                <CheckCircle2 size={17} />
                {read ? "Прочитано" : "Позначити"}
              </button>
            </div>
          </div>

          <div className="mt-2">
            {block.content.map((contentBlock) => (
              <ContentBlock block={contentBlock} key={contentBlock.id} />
            ))}
            <PointFlowSection
              icon={<Map size={18} />}
              id="topical"
              points={block.topical}
              title="Топіка"
            />
            <PointFlowSection
              icon={<Search size={18} />}
              id="krok-patterns"
              points={block.krokPatterns}
              title="Типові підказки КРОК"
            />
            <PointFlowSection
              icon={<AlertTriangle size={18} />}
              id="pitfalls"
              points={block.pitfalls}
              title="Пастки"
            />
          </div>
        </article>

        <footer className="mt-4 flex items-center justify-between gap-4 border-t border-clinical-line pt-5">
          {previous ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text"
              href={`/notes/${previous.slug}`}
            >
              <ArrowLeft size={17} />
              Назад
            </Link>
          ) : (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text"
              href="/notes"
            >
              <ArrowLeft size={17} />
              До списку
            </Link>
          )}
          <span className="text-sm text-clinical-muted">
            {section.code.split(".")[0]} з {sections.length}
          </span>
          {next ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
              href={`/notes/${next.slug}`}
            >
              Далі
              <Sparkles size={17} />
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </section>

      <SiteMobileTabbar active="notes" />
    </main>
  );
}
