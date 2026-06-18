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
  Images,
  Menu,
  MessageSquareText,
  X,
  ZoomIn
} from "lucide-react";

import type {
  CaseImage,
  CaseSummary,
  ChecklistItem,
  InteractionItem,
  PracticalSkill,
  StationAnswerBlockType,
  StationBlueprint,
  TaskCoverageStatus,
  StudyCase
} from "@/content/schema";
import { cn } from "@/lib/cn";
import {
  formatAnswerBlockType,
  formatEvidenceType,
  formatGroup,
  formatPracticalSkillKind,
  formatPracticalStepRole,
  formatStationType,
  formatTaskCoverage
} from "@/lib/case-format";
import { MarkdownView } from "./MarkdownView";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

interface CaseReaderProps {
  studyCase: StudyCase;
  cases: CaseSummary[];
  previous?: CaseSummary;
  next?: CaseSummary;
}

type LightboxImage = CaseImage & {
  kind: "original" | "scan";
};

const panelClass =
  "rounded-lg border border-clinical-line/85 bg-white/90 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl";
const iconButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-white text-[#5a626e] transition hover:border-clinical-line-strong hover:text-clinical-accent-strong";
const yellowButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3.5 text-sm font-extrabold text-[#201900]";
const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_9px_rgba(250,204,21,0.42))_drop-shadow(0_2px_5px_rgba(124,58,237,0.16))]";
const answerBlockOrder: Record<StationAnswerBlockType, number> = {
  task_summary: 10,
  actor_communication: 20,
  history_questions: 30,
  clinical_exam: 40,
  imaging_review: 50,
  diagnosis: 60,
  management: 70,
  must_say: 80,
  pitfalls: 90
};

function readFavorites() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const value = JSON.parse(window.localStorage.getItem("favoriteCases") ?? "[]");
    return new Set(
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
    );
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
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group mt-2.5 rounded-lg border border-clinical-line bg-white"
      id={id}
      open={defaultOpen}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2.5 font-extrabold">
          {icon}
          {title}
        </span>
        <ChevronDown className="transition group-open:rotate-180" size={18} />
      </summary>
      <div className="border-t border-clinical-line p-4 max-md:p-3">{children}</div>
    </details>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  const [open, setOpen] = useState(item.order <= 3);
  const buttonId = `checklist-trigger-${item.id}`;
  const panelId = `checklist-panel-${item.id}`;

  return (
    <article
      className={cn(
        "check-step rounded-lg border bg-gradient-to-b from-white to-[#fffdf8] transition",
        open ? "border-clinical-accent-strong/45" : "border-clinical-line"
      )}
      data-state={open ? "open" : "closed"}
    >
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="grid min-h-[54px] w-full grid-cols-[38px_minmax(0,1fr)_22px] items-center gap-2.5 p-3 text-left max-md:grid-cols-[34px_minmax(0,1fr)_20px] max-md:px-2.5"
        id={buttonId}
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clinical-accent-soft text-xs font-black text-[#8a6300]">
          {String(item.order).padStart(2, "0")}
        </span>
        <span className="min-w-0 text-[15px] font-extrabold leading-tight">{item.title}</span>
        <ChevronDown className={cn("transition", open && "rotate-180")} size={18} />
      </button>
      {open ? (
        <div
          aria-labelledby={buttonId}
          className="mb-3 ml-[60px] mr-3 rounded-r-lg border-l-[3px] border-clinical-accent bg-[#fffaf0] p-3.5 max-md:ml-[46px] max-md:p-3"
          id={panelId}
          role="region"
        >
          <span className="mb-1.5 block text-xs font-black uppercase text-clinical-accent-strong">
            Що проговорити
          </span>
          <MarkdownView markdown={item.body} />
        </div>
      ) : null}
    </article>
  );
}

function InteractionCard({ item, index }: { item: InteractionItem; index: number }) {
  return (
    <article className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 rounded-lg border border-clinical-line bg-[#fffaf0] p-3">
      <span className="font-black text-clinical-accent-strong">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <strong className="mb-1 block">{item.title}</strong>
        <MarkdownView markdown={item.body} />
      </div>
    </article>
  );
}

function coverageClass(status: TaskCoverageStatus) {
  const classes: Record<TaskCoverageStatus, string> = {
    covered: "border-emerald-200 bg-emerald-50 text-emerald-800",
    partial: "border-amber-200 bg-amber-50 text-amber-800",
    missing: "border-rose-200 bg-rose-50 text-rose-800",
    not_applicable: "border-slate-200 bg-slate-50 text-slate-700"
  };

  return classes[status];
}

function PracticalSkillCard({ skill }: { skill: PracticalSkill }) {
  return (
    <article className="rounded-lg border border-clinical-line-strong bg-[#fffaf0] p-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <p className="m-0 text-xs font-black uppercase text-clinical-accent-strong">
            Практична частина · {formatPracticalSkillKind(skill.kind)}
          </p>
          <h3 className="mt-1 text-base font-black leading-tight">{skill.title}</h3>
        </div>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {skill.equipment?.length ? (
          <div className="rounded-lg border border-clinical-line bg-white p-2.5">
            <h4 className="text-xs font-black uppercase text-clinical-accent-strong">
              Підготувати
            </h4>
            <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-clinical-muted">
              {skill.equipment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {skill.patientSetup?.length ? (
          <div className="rounded-lg border border-clinical-line bg-white p-2.5">
            <h4 className="text-xs font-black uppercase text-clinical-accent-strong">
              Положення пацієнта
            </h4>
            <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-clinical-muted">
              {skill.patientSetup.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {skill.examinerPhrases?.length ? (
          <div className="rounded-lg border border-clinical-line bg-white p-2.5">
            <h4 className="text-xs font-black uppercase text-clinical-accent-strong">
              Сказати пацієнту
            </h4>
            <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-clinical-muted">
              {skill.examinerPhrases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2">
        {skill.steps.map((step, index) => (
          <section
            className="grid gap-2 rounded-lg border border-clinical-line bg-white p-2.5 sm:grid-cols-[34px_minmax(0,1fr)]"
            key={step.id}
          >
            <span className="font-black text-clinical-accent-strong">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-black uppercase text-clinical-muted">
                {formatPracticalStepRole(step.role)}
              </p>
              <h4 className="mt-0.5 text-sm font-black leading-snug">{step.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-clinical-muted">
                {step.instruction}
              </p>
              {step.expectedFinding ? (
                <p className="mt-1.5 rounded-lg bg-[#fffaf0] px-2 py-1.5 text-sm leading-relaxed text-[#5d4710]">
                  {step.expectedFinding}
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-clinical-line bg-white p-2.5">
          <h4 className="text-xs font-black uppercase text-clinical-accent-strong">
            Інтерпретація
          </h4>
          <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-clinical-muted">
            {skill.interpretation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {skill.safety?.length ? (
          <div className="rounded-lg border border-amber-200 bg-white p-2.5">
            <h4 className="text-xs font-black uppercase text-amber-700">Безпека</h4>
            <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-clinical-muted">
              {skill.safety.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function StationBlueprintPanel({ blueprint }: { blueprint: StationBlueprint }) {
  const orderedAnswerBlocks = blueprint.answerBlocks
    .map((block, index) => ({ block, index }))
    .sort(
      (left, right) =>
        answerBlockOrder[left.block.type] - answerBlockOrder[right.block.type] ||
        left.index - right.index
    )
    .map(({ block }) => block);

  return (
    <div className="grid gap-3">
      <div className="rounded-lg border border-clinical-line bg-[#fffaf0] p-3">
        <div>
          <p className="m-0 text-xs font-black uppercase text-clinical-accent-strong">
            {formatStationType(blueprint.stationType)}
          </p>
          <h3 className="mt-1 text-lg font-black leading-tight">Карта підготовки</h3>
        </div>
      </div>

      <section className="rounded-lg border border-clinical-line bg-white p-3">
        <h3 className="text-sm font-black">Що вимагає завдання</h3>
        <div className="mt-2 grid gap-2" data-blueprint-required-tasks="list">
          {blueprint.requiredTasks.map((task, index) => (
            <article
              className="grid gap-2 rounded-lg border border-clinical-line bg-[#fffdf8] p-2.5 sm:grid-cols-[34px_minmax(0,1fr)_auto] sm:items-start"
              key={task.id}
            >
              <span className="font-black text-clinical-accent-strong">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="m-0 text-sm font-extrabold leading-snug">{task.prompt}</p>
                {task.note ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-clinical-muted">{task.note}</p>
                ) : null}
              </div>
              <span
                className={cn(
                  "inline-flex min-h-7 w-fit items-center rounded-full border px-2 text-xs font-extrabold",
                  coverageClass(task.coverage)
                )}
              >
                {formatTaskCoverage(task.coverage)}
              </span>
            </article>
          ))}
        </div>
      </section>

      {blueprint.practicalSkills?.length ? (
        <section className="grid gap-2.5" data-blueprint-practical-skills="list">
          <h3 className="text-sm font-black">Практична частина</h3>
          {blueprint.practicalSkills.map((skill) => (
            <PracticalSkillCard key={skill.id} skill={skill} />
          ))}
        </section>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {orderedAnswerBlocks.map((block) => (
          <article
            className={cn(
              "rounded-lg border border-clinical-line bg-white p-3",
              (block.type === "must_say" || block.type === "pitfalls") && "bg-[#fffaf0]"
            )}
            key={`${block.type}-${block.title}`}
          >
            <p className="m-0 text-xs font-black uppercase text-clinical-accent-strong">
              {formatAnswerBlockType(block.type)}
            </p>
            <h3 className="mt-1 text-base font-black leading-tight">{block.title}</h3>
            {block.body ? (
              <p className="mt-2 text-sm leading-relaxed text-clinical-muted">{block.body}</p>
            ) : null}
            <ul className="mt-2.5 grid gap-2">
              {block.points.map((point) => (
                <li className="grid grid-cols-[8px_minmax(0,1fr)] gap-2 text-sm leading-relaxed" key={point.text}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-clinical-accent" />
                  <span>
                    {point.text}
                    {point.evidence ? (
                      <span className="ml-2 inline-flex rounded-full border border-clinical-line bg-[#fffdf8] px-1.5 py-0.5 text-[11px] font-extrabold text-clinical-muted">
                        {formatEvidenceType(point.evidence)}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-clinical-line bg-white p-3">
        <h3 className="text-sm font-black">Джерела для ревізії</h3>
        <div className="mt-2 grid gap-1.5" data-blueprint-sources="list">
          {blueprint.sources.map((source) => (
            <a
              className="text-sm leading-relaxed text-clinical-muted underline underline-offset-4 hover:text-clinical-accent-strong"
              href={source.href}
              key={source.href}
              target="_blank"
            >
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function MediaFigure({
  image,
  kind,
  onOpen
}: {
  image: CaseImage;
  kind: LightboxImage["kind"];
  onOpen: (image: LightboxImage) => void;
}) {
  const isScan = kind === "scan";

  return (
    <figure
      className="overflow-hidden rounded-lg border border-clinical-line bg-white [content-visibility:auto] [contain-intrinsic-size:260px] max-md:min-w-[min(78vw,320px)] max-md:[scroll-snap-align:start]"
      data-media-figure={kind}
    >
      <button
        aria-label={`Відкрити зображення: ${image.caption ?? image.alt}`}
        className={cn(
          "group relative block w-full overflow-hidden bg-[#f7f7f7] text-left",
          isScan ? "aspect-[1.2/1] bg-[#111]" : "aspect-[3/4]"
        )}
        data-image-open={kind}
        type="button"
        onClick={() => onOpen({ ...image, kind })}
      >
        <Image
          alt={image.alt}
          className={cn(
            "h-full w-full transition duration-300",
            isScan
              ? "-translate-y-[8%] scale-[1.85] object-cover object-center group-hover:scale-[1.92]"
              : "object-contain object-top group-hover:scale-[1.03]"
          )}
          height={isScan ? 540 : 1200}
          loading="lazy"
          quality={isScan ? 72 : 70}
          sizes={isScan ? "(max-width: 820px) 78vw, 240px" : "(max-width: 820px) 78vw, 260px"}
          src={image.src}
          width={isScan ? 960 : 900}
        />
        <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/85 text-[#3b414a] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
          <ZoomIn size={17} />
        </span>
      </button>
      {image.caption ? (
        <figcaption className="p-2.5 text-xs leading-snug text-clinical-muted">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function OriginalPagesDisclosure({
  pages,
  onOpen
}: {
  pages: CaseImage[];
  onOpen: (image: LightboxImage) => void;
}) {
  const [shouldRenderPages, setShouldRenderPages] = useState(false);

  return (
    <details
      className="group mt-3.5"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          setShouldRenderPages(true);
        }
      }}
    >
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-clinical-line-strong bg-clinical-accent-soft px-3 text-[13px] font-extrabold text-[#594107] [&::-webkit-details-marker]:hidden">
        Показати сторінки завдання ({pages.length})
        <ChevronDown className="transition group-open:rotate-180" size={17} />
      </summary>
      {shouldRenderPages ? (
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 max-md:flex max-md:overflow-x-auto max-md:pb-1 max-md:[scroll-snap-type:x_mandatory]">
          {pages.map((page) => (
            <MediaFigure image={page} kind="original" key={page.src} onOpen={onOpen} />
          ))}
        </div>
      ) : null}
    </details>
  );
}

function ImageLightbox({
  image,
  onClose
}: {
  image: LightboxImage;
  onClose: () => void;
}) {
  const isScan = image.kind === "scan";

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#111]/88 p-3 text-white backdrop-blur-md"
      data-image-lightbox="open"
      role="dialog"
    >
      <button
        aria-label="Закрити перегляд через фон"
        className="absolute inset-0 h-full w-full cursor-default"
        type="button"
        onClick={onClose}
      />
      <section className="relative z-10 mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex min-h-12 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-extrabold text-white/90">
            {image.caption ?? image.alt}
          </p>
          <button
            aria-label="Закрити перегляд зображення"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            data-image-lightbox-close="button"
            type="button"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden rounded-lg border border-white/15 bg-black",
            isScan ? "my-auto aspect-[1.2/1] max-h-[calc(100dvh-112px)] w-full flex-none" : ""
          )}
        >
          <Image
            alt={image.alt}
            className={cn(
              isScan ? "-translate-y-[8%] scale-[1.85] object-cover object-center" : "object-contain"
            )}
            fill
            quality={90}
            sizes="100vw"
            src={image.src}
          />
        </div>
      </section>
    </div>
  );
}

export function CaseReader({ studyCase, cases, previous, next }: CaseReaderProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    setFavorites(readFavorites());
    window.localStorage.setItem("lastCase", studyCase.slug);
    setMobileMenuOpen(false);
    setLightboxImage(null);
  }, [studyCase.slug]);

  useEffect(() => {
    if (!mobileMenuOpen && !lightboxImage) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          setMobileMenuOpen(false);
        }
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightboxImage, mobileMenuOpen]);

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
    ["original", "Оригінальне завдання"],
    ...(studyCase.group === "imaging" ? ([["imaging", "Знімки"]] as const) : []),
    ...(studyCase.blueprint ? ([["blueprint", "Підготовка до станції"]] as const) : []),
    ["checklist", "Детальний чеклист"],
    ["interaction", "Взаємодія"]
  ] as const;

  return (
    <main className="grid min-h-dvh justify-center gap-[18px] p-5 md:grid-cols-[240px_minmax(0,760px)] xl:grid-cols-[240px_minmax(0,760px)_240px] max-md:block max-md:p-0 max-md:pb-20">
      <aside className={cn(panelClass, "sticky top-5 flex h-[calc(100dvh-40px)] flex-col p-[18px_14px] max-md:hidden")}>
        <Link className="flex min-h-[38px] items-center gap-2.5 font-extrabold" href="/cases">
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
          <span>ОСКІ Неврологія</span>
        </Link>
        <SiteSectionLinks active="cases" className="mt-6 border-b border-clinical-line pb-4" />
        <nav className="mt-4 grid gap-1.5 overflow-auto pr-0.5" aria-label="Станції">
          {cases.map((item) => (
            <Link
              className={cn(
                "grid min-h-[46px] grid-cols-[26px_minmax(0,1fr)] gap-2 rounded-lg p-2 text-[13px] leading-tight text-[#3d434b] transition hover:bg-clinical-accent-soft hover:text-[#171a1f]",
                item.slug === studyCase.slug && "bg-clinical-accent-soft text-[#171a1f]"
              )}
              href={`/cases/${item.slug}`}
              key={item.slug}
            >
              <span className="font-black text-clinical-accent-strong">
                {String(item.order).padStart(2, "0")}
              </span>
              <span className="line-clamp-2 min-w-0">{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className={cn(panelClass, "min-w-0 p-[18px] max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[0_14px_88px] max-md:shadow-none")}>
        <header className="sticky top-0 z-10 -mx-3 mb-3 hidden min-h-[68px] grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-clinical-line bg-clinical-bg/95 px-3 py-2 backdrop-blur-xl max-md:grid">
          <Link className={iconButtonClass} href="/cases" aria-label="До списку станцій">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 text-center">
            <span className="text-xs font-extrabold text-clinical-accent-strong">
              {formatGroup(studyCase.group)}
            </span>
            <h1 className="mt-1 truncate text-base font-extrabold">{studyCase.title}</h1>
          </div>
          <button
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-case-menu"
            className={iconButtonClass}
            data-mobile-menu-trigger="top"
            aria-label="Відкрити меню станції"
            type="button"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={18} />
          </button>
        </header>

        <div className="flex items-start justify-between gap-4 pb-4 max-md:block">
          <div>
            <p className="m-0 text-[13px] font-extrabold text-clinical-accent-strong">
              ОСКІ станція / {String(studyCase.order).padStart(2, "0")}
            </p>
            <h2 className="mt-1 text-[clamp(26px,4vw,42px)] font-black leading-[1.05]">
              {studyCase.title}
            </h2>
            <p className="mt-2.5 max-w-[68ch] leading-relaxed text-clinical-muted">
              {studyCase.focus}
            </p>
          </div>
          <button
            className={cn(yellowButtonClass, "max-md:mt-3.5 max-md:w-full")}
            type="button"
            onClick={toggleFavorite}
          >
            {favorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {favorite ? "В обраному" : "До обраного"}
          </button>
        </div>

        <SectionBlock id="original" title="Оригінальне завдання" icon={<FileText size={19} />}>
          <div className="mb-3 text-[13px] text-clinical-muted">
            <a
              className="font-extrabold text-clinical-accent-strong underline underline-offset-4"
              href={studyCase.sourcePdf.href}
              target="_blank"
            >
              {studyCase.sourcePdf.label}
            </a>
          </div>
          <MarkdownView markdown={studyCase.originalMarkdown} />
          <OriginalPagesDisclosure pages={studyCase.originalPages} onOpen={setLightboxImage} />
        </SectionBlock>

        {studyCase.group === "imaging" ? (
          <SectionBlock id="imaging" title="Знімки" icon={<Images size={19} />}>
            <div className="image-grid grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 max-md:flex max-md:overflow-x-auto max-md:pb-1 max-md:[scroll-snap-type:x_mandatory]">
              {studyCase.imaging.map((image) => (
                <MediaFigure image={image} kind="scan" key={image.src} onOpen={setLightboxImage} />
              ))}
            </div>
          </SectionBlock>
        ) : null}

        {studyCase.blueprint ? (
          <SectionBlock id="blueprint" title="Підготовка до станції" icon={<Brain size={19} />}>
            <div data-station-blueprint={studyCase.slug}>
              <StationBlueprintPanel blueprint={studyCase.blueprint} />
            </div>
          </SectionBlock>
        ) : null}

        <SectionBlock id="checklist" title="Детальний чеклист" icon={<ClipboardList size={19} />}>
          <div className="grid gap-2.5">
            {studyCase.checklist.map((item) => (
              <ChecklistCard item={item} key={item.id} />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          id="interaction"
          title="Взаємодія"
          icon={<MessageSquareText size={19} />}
          defaultOpen={studyCase.interaction.length > 0}
        >
          {studyCase.interaction.length > 0 ? (
            <div className="grid gap-2.5">
              {studyCase.interaction.map((item, index) => (
                <InteractionCard item={item} index={index} key={item.id} />
              ))}
            </div>
          ) : (
            <p className="m-0 text-clinical-muted">
              У цій станції повноцінного діалогу з актором немає.
            </p>
          )}
        </SectionBlock>

        <footer className="mt-3.5 flex items-center justify-between gap-4">
          {previous ? (
            <Link className={yellowButtonClass} href={`/cases/${previous.slug}`}>
              <ArrowLeft size={17} />
              Назад
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-clinical-muted">
            {studyCase.order} з {cases.length}
          </span>
          {next ? (
            <Link className={yellowButtonClass} href={`/cases/${next.slug}`}>
              Далі
              <ArrowRight size={17} />
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </section>

      <aside className={cn(panelClass, "sticky top-5 hidden h-[calc(100dvh-40px)] overflow-auto p-4 xl:block")}>
        <nav className="mb-4 grid gap-2.5 border-b border-clinical-line pb-4" aria-label="Зміст станції">
          <strong className="text-sm">Зміст станції</strong>
          {anchors.map(([id, label]) => (
            <a className="text-[13px] leading-normal text-clinical-muted hover:text-clinical-accent-strong" href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>

        {studyCase.group === "imaging" ? (
          <section className="mb-4 grid gap-2.5 border-b border-clinical-line pb-4">
            <strong className="text-sm">Ключовий висновок</strong>
            <p className="m-0 text-[13px] leading-normal text-clinical-muted">{studyCase.keyAnswer}</p>
          </section>
        ) : null}

        <section className="mb-4 grid gap-2.5 border-b border-clinical-line pb-4">
          <strong className="text-sm">Теги</strong>
          <div className="flex flex-wrap gap-1.5">
            {studyCase.tags.map((tag) => (
              <span
                className="rounded-full border border-clinical-line bg-[#fffaf0] px-2 py-1 text-xs text-[#595f68]"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {studyCase.group === "imaging" ? (
          <section className="grid gap-2.5">
            <strong className="text-sm">Джерела</strong>
            {studyCase.sources.map((source) => (
              <a
                className="text-[13px] leading-normal text-clinical-muted hover:text-clinical-accent-strong"
                href={source.href}
                key={source.href}
                target="_blank"
              >
                {source.label}
              </a>
            ))}
          </section>
        ) : null}
      </aside>

      {mobileMenuOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-40 hidden bg-black/20 backdrop-blur-sm max-md:block"
          data-mobile-case-menu="open"
          id="mobile-case-menu"
          role="dialog"
        >
          <button
            aria-label="Закрити меню через фон"
            className="absolute inset-0 h-full w-full cursor-default"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
          />
          <section className="absolute inset-x-2 bottom-2 max-h-[82dvh] overflow-auto rounded-lg border border-clinical-line bg-white p-4 shadow-[0_22px_70px_rgba(49,39,10,0.24)]">
            <header className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 text-xs font-extrabold uppercase text-clinical-accent-strong">
                  {formatGroup(studyCase.group)} / {String(studyCase.order).padStart(2, "0")}
                </p>
                <h2 className="mt-1 text-lg font-black leading-tight">Меню станції</h2>
              </div>
              <button
                className={iconButtonClass}
                data-mobile-menu-close="button"
                aria-label="Закрити меню станції"
                type="button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <nav className="grid gap-2" aria-label="Мобільний зміст станції">
              {anchors.map(([id, label]) => (
                <a
                  className="flex min-h-11 items-center justify-between rounded-lg border border-clinical-line bg-[#fffdf8] px-3 text-sm font-extrabold text-[#272b31]"
                  href={`#${id}`}
                  key={id}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                  <ArrowRight size={16} />
                </a>
              ))}
            </nav>

            {studyCase.group === "imaging" ? (
              <section className="mt-3 rounded-lg border border-clinical-line bg-[#fffaf0] p-3">
                <strong className="text-sm">Ключовий висновок</strong>
                <p className="mt-2 text-sm leading-relaxed text-clinical-muted">{studyCase.keyAnswer}</p>
              </section>
            ) : null}

            <section className="mt-3 rounded-lg border border-clinical-line bg-white p-3">
              <strong className="text-sm">Теги</strong>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {studyCase.tags.map((tag) => (
                  <span
                    className="rounded-full border border-clinical-line bg-[#fffaf0] px-2 py-1 text-xs text-[#595f68]"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {previous ? (
                <Link className={yellowButtonClass} href={`/cases/${previous.slug}`}>
                  <ArrowLeft size={17} />
                  Назад
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link className={yellowButtonClass} href={`/cases/${next.slug}`}>
                  Далі
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <span />
              )}
            </div>
          </section>
        </div>
      ) : null}

      <SiteMobileTabbar active="cases" />

      {lightboxImage ? (
        <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      ) : null}
    </main>
  );
}
