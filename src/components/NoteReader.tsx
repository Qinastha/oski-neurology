"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Brain,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  Map,
  Search,
  Sparkles,
  Stethoscope
} from "lucide-react";

import type { NoteBlock, NotePoint, ResolvedNoteSection } from "@/content/notes/schema";
import { cn } from "@/lib/cn";

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

function PointCard({ point }: { point: NotePoint }) {
  return (
    <article className="rounded-lg border border-clinical-line bg-white p-3">
      <h3 className="text-base font-black leading-tight">{point.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-clinical-muted">{point.text}</p>
      {point.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {point.tags.map((tag) => (
            <span
              className="rounded-full border border-clinical-line bg-[#fffaf0] px-2 py-1 text-xs font-extrabold text-clinical-accent-strong"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function PointSection({
  id,
  title,
  icon,
  points
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  points: NotePoint[];
}) {
  return (
    <section className="scroll-mt-4 rounded-lg border border-clinical-line bg-[#fffdf8] p-4" id={id}>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong">
          {icon}
        </span>
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        {points.map((point) => (
          <PointCard key={point.title} point={point} />
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
    const next = readStringSet(BOOKMARKS_KEY);
    if (next.has(section.slug)) {
      next.delete(section.slug);
      setBookmarked(false);
    } else {
      next.add(section.slug);
      setBookmarked(true);
    }
    writeStringSet(BOOKMARKS_KEY, next);
  }

  function toggleRead() {
    const next = readStringSet(READ_KEY);
    if (next.has(section.slug)) {
      next.delete(section.slug);
      setRead(false);
    } else {
      next.add(section.slug);
      setRead(true);
    }
    writeStringSet(READ_KEY, next);
  }

  const anchors = [
    ["high-yield", "Що треба знати"],
    ["localization", "Топіка"],
    ["clues", "Діагностичні підказки"],
    ["differentials", "Диференціювати з"],
    ["krok-patterns", "Типові підказки КРОК"],
    ["pitfalls", "Пастки"]
  ] as const;

  return (
    <main className="grid min-h-dvh justify-center gap-[18px] p-5 md:grid-cols-[240px_minmax(0,780px)] xl:grid-cols-[240px_minmax(0,780px)_250px] max-md:block max-md:p-0 max-md:pb-20">
      <aside className="sticky top-5 flex h-[calc(100dvh-40px)] flex-col rounded-lg border border-clinical-line/85 bg-white/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:hidden">
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
        <nav className="mt-7 grid gap-1.5 overflow-auto pr-0.5" aria-label="Блоки конспекту">
          {sections.map((item) =>
            item.block ? (
              <Link
                className={cn(
                  "grid min-h-[46px] grid-cols-[36px_minmax(0,1fr)] gap-2 rounded-lg p-2 text-[13px] leading-tight text-[#3d434b] transition hover:bg-clinical-accent-soft hover:text-[#171a1f]",
                  item.slug === section.slug && "bg-clinical-accent-soft text-[#171a1f]"
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

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-white/90 p-[18px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[0_14px_88px] max-md:shadow-none">
        <header className="sticky top-0 z-10 -mx-3 mb-3 hidden min-h-[68px] grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-clinical-line bg-clinical-bg/95 px-3 py-2 backdrop-blur-xl max-md:grid">
          <Link
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-white"
            href="/notes"
            aria-label="До списку блоків конспекту"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-white"
            type="button"
            onClick={toggleRead}
          >
            <CheckCircle2 size={18} />
          </button>
        </header>

        <div className="flex items-start justify-between gap-4 pb-4 max-md:block max-md:pt-4">
          <div>
            <p className="text-[13px] font-extrabold text-clinical-accent-strong">
              Конспект / {section.code.split(".")[0]}.0 · вага {section.weight}%
            </p>
            <h1 className="mt-1 text-[clamp(26px,4vw,42px)] font-black leading-[1.05]">
              {section.title}
            </h1>
            <p className="mt-2.5 max-w-[70ch] leading-relaxed text-clinical-muted">
              {block.summary}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 max-md:mt-3">
            <button
              aria-pressed={bookmarked}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
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

        <div className="grid gap-3" data-note-reader={section.slug}>
          <PointSection
            id="high-yield"
            icon={<Lightbulb size={18} />}
            points={block.highYield}
            title="Що треба знати"
          />
          <PointSection
            id="localization"
            icon={<Map size={18} />}
            points={block.localization}
            title="Топіка"
          />
          <PointSection
            id="clues"
            icon={<Stethoscope size={18} />}
            points={block.diagnosticClues}
            title="Діагностичні підказки"
          />
          <PointSection
            id="differentials"
            icon={<Brain size={18} />}
            points={block.differentials}
            title="Диференціювати з"
          />
          <PointSection
            id="krok-patterns"
            icon={<Search size={18} />}
            points={block.krokPatterns}
            title="Типові підказки КРОК"
          />
          <PointSection
            id="pitfalls"
            icon={<AlertTriangle size={18} />}
            points={block.pitfalls}
            title="Пастки"
          />
        </div>

        <footer className="mt-4 flex items-center justify-between gap-4">
          {previous ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
              href={`/notes/${previous.slug}`}
            >
              <ArrowLeft size={17} />
              Назад
            </Link>
          ) : (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
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

      <aside className="sticky top-5 hidden h-[calc(100dvh-40px)] overflow-auto rounded-lg border border-clinical-line/85 bg-white/90 p-4 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl xl:block">
        <nav className="mb-4 grid gap-2.5 border-b border-clinical-line pb-4" aria-label="Зміст блоку">
          <strong className="text-sm">Зміст блоку</strong>
          {anchors.map(([id, label]) => (
            <a
              className="text-[13px] leading-normal text-clinical-muted hover:text-clinical-accent-strong"
              href={`#${id}`}
              key={id}
            >
              {label}
            </a>
          ))}
        </nav>

        <section className="mb-4 grid gap-2.5 border-b border-clinical-line pb-4">
          <strong className="text-sm">КРОК-маркери</strong>
          <div className="flex flex-wrap gap-1.5">
            {block.krokSearchTerms.map((term) => (
              <span
                className="rounded-full border border-clinical-line bg-[#fffaf0] px-2 py-1 text-xs text-[#595f68]"
                key={term}
              >
                {term}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-2.5">
          <strong className="text-sm">Підтеми PDF</strong>
          {section.subtopics.slice(0, 12).map((subtopic) => (
            <p className="m-0 text-[13px] leading-normal text-clinical-muted" key={subtopic.code}>
              <span className="font-black text-clinical-accent-strong">{subtopic.code}</span>{" "}
              {subtopic.title}
            </p>
          ))}
        </section>
      </aside>

      <nav className="mobile-tabbar fixed inset-x-0 bottom-0 z-20 hidden min-h-16 grid-cols-3 border-t border-clinical-line bg-clinical-bg/95 px-1.5 pb-2 pt-1.5 backdrop-blur-xl max-md:grid">
        <Link className="flex flex-col items-center justify-center gap-1 text-[11px] text-[#5d6470]" href="/cases">
          <ClipboardList size={19} />
          ОСКІ
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 text-[11px] text-[#5d6470]" href="/krok">
          <GraduationCap size={19} />
          КРОК
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 text-[11px] font-extrabold text-clinical-accent-strong" href="/notes">
          <BookOpen size={19} />
          Конспект
        </Link>
      </nav>
    </main>
  );
}
