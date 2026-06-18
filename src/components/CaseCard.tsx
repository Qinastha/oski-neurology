"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";

import type { CaseSummary } from "@/content/schema";
import { formatGroup } from "@/lib/case-format";

interface CaseCardProps {
  studyCase: CaseSummary;
  favorite: boolean;
  onToggleFavorite: (slug: string) => void;
}

export function CaseCard({
  studyCase,
  favorite,
  onToggleFavorite
}: CaseCardProps) {
  return (
    <article className="case-card grid min-h-[72px] grid-cols-[minmax(0,1fr)_44px] items-center rounded-lg border border-clinical-line bg-white/85 transition hover:border-clinical-line-strong hover:bg-[#fffaf0]">
      <Link
        className="grid min-w-0 grid-cols-[36px_minmax(0,1fr)] items-center gap-3 p-3"
        href={`/cases/${studyCase.slug}`}
      >
        <span className="font-black text-clinical-accent-strong">
          {String(studyCase.order).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-[15px] leading-tight">{studyCase.title}</strong>
          <small className="mt-1 block text-xs text-clinical-muted">
            {formatGroup(studyCase.group)} · {studyCase.checklistCount} пунктів
          </small>
        </span>
      </Link>
      <button
        aria-label={
          favorite
            ? `Прибрати ${studyCase.title} з обраного`
            : `Додати ${studyCase.title} до обраного`
        }
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line bg-white text-[#5a626e] transition hover:border-clinical-line-strong hover:text-clinical-accent-strong"
        type="button"
        onClick={() => onToggleFavorite(studyCase.slug)}
      >
        {favorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>
    </article>
  );
}
