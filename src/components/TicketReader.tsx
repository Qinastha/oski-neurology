"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Search,
  X
} from "lucide-react";

import type {
  ExamTicket,
  ExamTicketContentBlock,
  ExamTicketMedia,
  ExamTicketRichBlock,
  ExamTicketRichTableBlock
} from "@/content/tickets/schema";
import { cn } from "@/lib/cn";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_9px_rgba(250,204,21,0.42))_drop-shadow(0_2px_5px_rgba(124,58,237,0.16))]";

function ContentBlock({ block }: { block: ExamTicketContentBlock }) {
  if (block.type === "heading") {
    return <h3 className="mt-6 text-[18px] font-black leading-tight text-clinical-text">{block.text}</h3>;
  }

  if (block.type === "list_item") {
    return (
      <li className="pl-1 text-[15px] leading-7 text-clinical-muted marker:text-clinical-accent-strong">
        {block.text.replace(/^([•●-]|\d+[\).])\s*/, "")}
      </li>
    );
  }

  return <p className="mt-3 text-[16px] leading-8 text-clinical-muted max-md:text-[15px] max-md:leading-7">{block.text}</p>;
}

function ContentBlocks({ blocks }: { blocks: ExamTicketContentBlock[] }) {
  const rendered: ReactNode[] = [];
  let listItems: ExamTicketContentBlock[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }
    const isOrdered = listItems.every((block) => /^\d+[\).]\s*/.test(block.text));
    const ListTag = isOrdered ? "ol" : "ul";
    rendered.push(
      <ListTag
        className={cn(
          "mt-3 space-y-2 pl-5 marker:text-clinical-accent-strong",
          isOrdered ? "list-decimal" : "list-disc"
        )}
        key={`list-${listItems[0].id}`}
      >
        {listItems.map((block) => (
          <ContentBlock block={block} key={block.id} />
        ))}
      </ListTag>
    );
    listItems = [];
  };

  for (const block of blocks) {
    if (block.type === "list_item") {
      listItems.push(block);
      continue;
    }
    flushList();
    rendered.push(<ContentBlock block={block} key={block.id} />);
  }
  flushList();

  return <>{rendered}</>;
}

function MediaFigure({
  media,
  onOpen,
  className
}: {
  media: ExamTicketMedia;
  onOpen: (media: ExamTicketMedia) => void;
  className?: string;
}) {
  return (
    <figure
      className={cn("overflow-hidden rounded-lg border border-clinical-line bg-clinical-surface", className)}
      data-ticket-media-figure={media.id}
    >
      <button
        className="group block w-full text-left"
        data-ticket-media-open={media.id}
        type="button"
        onClick={() => onOpen(media)}
      >
        <div
          className="relative w-full overflow-hidden bg-clinical-surface-soft"
          style={{ aspectRatio: `${media.width} / ${media.height}` }}
        >
          <Image
            alt={media.alt}
            className="object-contain p-2 transition group-hover:scale-[1.01]"
            fill
            loading="eager"
            sizes="(max-width: 768px) 92vw, 360px"
            src={media.src}
          />
        </div>
      </button>
    </figure>
  );
}

function getColumnWidth(columnCount: number, columnIndex: number) {
  if (columnCount <= 1) {
    return "100%";
  }

  const firstColumnWidth = columnCount === 2 ? 34 : columnCount === 3 ? 28 : 22;
  if (columnIndex === 0) {
    return `${firstColumnWidth}%`;
  }

  return `${(100 - firstColumnWidth) / (columnCount - 1)}%`;
}

function RichTableBlock({ block }: { block: ExamTicketRichTableBlock }) {
  return (
    <div className="mt-4" data-ticket-table={block.id}>
      <div
        className="hidden rounded-lg border border-clinical-line bg-clinical-surface/80 md:block"
        data-ticket-table-scroll={block.id}
      >
        <table className="w-full table-fixed border-collapse text-left text-[13px] leading-6">
          <colgroup>
            {block.columns.map((column, columnIndex) => (
              <col key={column} style={{ width: getColumnWidth(block.columns.length, columnIndex) }} />
            ))}
          </colgroup>
          <thead className="bg-clinical-accent-soft text-clinical-accent-strong">
            <tr>
              {block.columns.map((column) => (
                <th className="border-b border-clinical-line px-3 py-2 font-black [overflow-wrap:anywhere]" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
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

      <div className="grid gap-3 md:hidden" data-ticket-table-card-list={block.id}>
        {block.rows.map((row, rowIndex) => {
          const rowTitle = row[0] || `Рядок ${rowIndex + 1}`;
          const details = block.columns.slice(1).map((column, columnIndex) => ({
            label: column,
            value: row[columnIndex + 1] ?? ""
          }));

          return (
            <article
              className="rounded-lg border border-clinical-line bg-clinical-surface/80 p-3"
              data-ticket-table-card-row={block.id}
              key={`${block.id}-card-${rowIndex}`}
            >
              <p className="text-[11px] font-black uppercase leading-5 text-clinical-accent-strong">
                {block.columns[0] ?? "Пункт"}
              </p>
              <h4 className="mt-0.5 text-[15px] font-black leading-6 text-clinical-text [overflow-wrap:anywhere]">
                {rowTitle}
              </h4>

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
    </div>
  );
}

function RichBlock({
  block,
  mediaById,
  onOpen
}: {
  block: ExamTicketRichBlock;
  mediaById: Map<string, ExamTicketMedia>;
  onOpen: (media: ExamTicketMedia) => void;
}) {
  if (block.type === "heading") {
    return <h3 className="mt-7 text-[19px] font-black leading-tight text-clinical-text">{block.text}</h3>;
  }

  if (block.type === "paragraph") {
    return <p className="mt-3 text-[16px] leading-8 text-clinical-muted max-md:text-[15px] max-md:leading-7">{block.text}</p>;
  }

  if (block.type === "list") {
    const ListTag = block.style === "ordered" ? "ol" : "ul";
    return (
      <ListTag
        className={cn(
          "mt-3 space-y-2 pl-5 text-[15px] leading-7 text-clinical-muted marker:text-clinical-accent-strong",
          block.style === "ordered" ? "list-decimal" : "list-disc"
        )}
      >
        {block.items.map((item, index) => (
          <li className="pl-1" key={`${block.id}-${index}`}>
            {item}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "definition_list") {
    return (
      <dl className="mt-3 divide-y divide-clinical-line overflow-hidden rounded-lg border border-clinical-line bg-clinical-surface/70">
        {block.items.map((item, index) => (
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-4" key={`${block.id}-${index}`}>
            <dt className="text-[14px] font-black leading-6 text-clinical-accent-strong">{item.term}</dt>
            <dd className="m-0 text-[15px] leading-7 text-clinical-muted">
              {Array.isArray(item.description) ? (
                <ul className="list-disc space-y-1 pl-5 marker:text-clinical-accent-strong">
                  {item.description.map((description, descriptionIndex) => (
                    <li key={`${block.id}-${index}-${descriptionIndex}`}>{description}</li>
                  ))}
                </ul>
              ) : (
                item.description
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (block.type === "table") {
    return <RichTableBlock block={block} />;
  }

  if (block.type === "media") {
    const media = block.mediaIds
      .map((mediaId) => mediaById.get(mediaId))
      .filter((item): item is ExamTicketMedia => Boolean(item));

    return (
      <div className="mt-5">
        {block.caption ? (
          <p className="mb-3 text-[14px] font-bold leading-6 text-clinical-muted">{block.caption}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2" data-ticket-rich-media={block.id}>
          {media.map((item) => (
            <MediaFigure media={item} key={item.id} onOpen={onOpen} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function RichBlocks({
  blocks,
  mediaById,
  onOpen
}: {
  blocks: ExamTicketRichBlock[];
  mediaById: Map<string, ExamTicketMedia>;
  onOpen: (media: ExamTicketMedia) => void;
}) {
  return (
    <>
      {blocks.map((block) => (
        <RichBlock block={block} key={block.id} mediaById={mediaById} onOpen={onOpen} />
      ))}
    </>
  );
}

function TicketLightbox({
  media,
  onClose
}: {
  media: ExamTicketMedia;
  onClose: () => void;
}) {
  return (
    <div
      aria-label="Перегляд зображення білета"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#18130a]/82 p-4 backdrop-blur-sm"
      data-ticket-lightbox="open"
      role="dialog"
    >
      <button
        aria-label="Закрити зображення"
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-white/95 text-[#1f2328]"
        data-ticket-lightbox-close="button"
        type="button"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="relative h-[min(82dvh,900px)] w-[min(94vw,1180px)] overflow-hidden rounded-lg bg-clinical-surface">
        <Image
          alt={media.alt}
          className="object-contain"
          fill
          priority
          sizes="94vw"
          src={media.src}
        />
      </div>
    </div>
  );
}

export function TicketReader({
  ticket,
  tickets
}: {
  ticket: ExamTicket;
  tickets: ExamTicket[];
}) {
  const [lightboxMedia, setLightboxMedia] = useState<ExamTicketMedia | null>(null);
  const currentIndex = tickets.findIndex((item) => item.number === ticket.number);
  const previous = currentIndex > 0 ? tickets[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < tickets.length - 1 ? tickets[currentIndex + 1] : undefined;
  const mediaCount = useMemo(
    () => ticket.gallery.length + ticket.questions.reduce((sum, question) => sum + question.media.length, 0),
    [ticket]
  );
  const mediaById = useMemo(() => {
    const items = [...ticket.gallery, ...ticket.questions.flatMap((question) => question.media)];
    return new Map(items.map((media) => [media.id, media]));
  }, [ticket]);
  const placedMediaIds = useMemo(() => {
    const ids = new Set<string>();
    for (const question of ticket.questions) {
      for (const block of question.richBlocks ?? []) {
        if (block.type === "media") {
          for (const mediaId of block.mediaIds) {
            ids.add(mediaId);
          }
        }
      }
    }
    return ids;
  }, [ticket]);

  useEffect(() => {
    if (!lightboxMedia) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxMedia(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxMedia]);

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
        <nav className="mt-4 grid gap-1.5 overflow-auto pr-0.5" aria-label="Список білетів">
          {tickets.map((item) => (
            <Link
              aria-current={item.number === ticket.number ? "page" : undefined}
              className={cn(
                "min-h-[42px] rounded-lg p-2 text-[13px] leading-tight text-clinical-muted transition hover:bg-clinical-accent-soft hover:text-clinical-text",
                item.number === ticket.number && "bg-clinical-accent-soft text-clinical-text"
              )}
              href={`/tickets/${item.number}`}
              key={item.id}
            >
              <span className="font-black">Білет № {item.number}</span>
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
              Білет № {ticket.number}
            </span>
            <h1 className="mt-1 truncate text-base font-extrabold">{ticket.title}</h1>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-clinical-surface text-clinical-accent-strong">
            <FileText size={18} />
          </span>
        </header>

        <article className="[overflow-wrap:anywhere]" data-ticket-reader={ticket.number}>
          <div className="flex items-start justify-between gap-4 pb-5 max-md:block max-md:pt-4">
            <div>
              <p className="text-[13px] font-extrabold text-clinical-accent-strong">
                Білети / № {ticket.number}
              </p>
              <h1 className="mt-1 text-[clamp(34px,5vw,58px)] font-black leading-[0.98] tracking-normal text-clinical-text">
                {ticket.title}
              </h1>
              <p className="mt-4 max-w-[68ch] text-[17px] leading-8 text-clinical-muted max-md:text-base max-md:leading-7">
                {ticket.questions.length} питання
                {mediaCount > 0 ? ` · ${mediaCount} зображень` : ""}.
              </p>
            </div>
          </div>

          <div className="grid gap-7">
            {ticket.questions.map((question) => (
              <section
                className="scroll-mt-24 border-t border-clinical-line pt-7 first:border-t-0 first:pt-2"
                data-ticket-question={question.number}
                id={`question-${question.number}`}
                key={question.id}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft px-2 text-sm font-black text-clinical-accent-strong">
                    {question.number}
                  </span>
                  <h2 className="text-[clamp(22px,3vw,30px)] font-black leading-tight text-clinical-text">
                    {question.title}
                  </h2>
                </div>

                <div className="mt-4">
                  {question.richBlocks && question.richBlocks.length > 0 ? (
                    <RichBlocks blocks={question.richBlocks} mediaById={mediaById} onOpen={setLightboxMedia} />
                  ) : (
                    <ContentBlocks blocks={question.blocks} />
                  )}
                </div>

                {question.media.filter((media) => !placedMediaIds.has(media.id)).length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2" data-ticket-question-media={question.number}>
                    {question.media.filter((media) => !placedMediaIds.has(media.id)).map((media) => (
                      <MediaFigure media={media} key={media.id} onOpen={setLightboxMedia} />
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          {ticket.gallery.length > 0 ? (
            <section className="mt-8 border-t border-clinical-line pt-7" data-ticket-gallery="unassigned">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong">
                  <ImageIcon size={18} />
                </span>
                <h2 className="text-[clamp(22px,3vw,30px)] font-black leading-tight">Зображення білета</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {ticket.gallery.map((media) => (
                  <MediaFigure media={media} key={media.id} onOpen={setLightboxMedia} />
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <footer className="mt-8 flex items-center justify-between gap-4 border-t border-clinical-line pt-5">
          {previous ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-clinical-surface px-3 text-sm font-extrabold text-clinical-text"
              href={`/tickets/${previous.number}`}
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
            {ticket.number} з {tickets.length}
          </span>
          {next ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
              href={`/tickets/${next.number}`}
            >
              Далі
              <Search size={17} />
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </section>

      <SiteMobileTabbar active="tickets" />
      {lightboxMedia ? <TicketLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} /> : null}
    </main>
  );
}
