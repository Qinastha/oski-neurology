"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";

import type { CaseSummary } from "@/content/schema";
import { formatGroup, formatStatus } from "@/lib/case-format";

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
    <article className="case-card">
      <Link className="case-card__main" href={`/cases/${studyCase.slug}`}>
        <span className="case-card__order">{String(studyCase.order).padStart(2, "0")}</span>
        <span>
          <strong>{studyCase.title}</strong>
          <small>
            {formatGroup(studyCase.group)} · {studyCase.checklistCount} пунктов ·{" "}
            {formatStatus(studyCase.reviewStatus)}
          </small>
        </span>
      </Link>
      <button
        aria-label={
          favorite
            ? `Убрать ${studyCase.title} из избранного`
            : `Добавить ${studyCase.title} в избранное`
        }
        className="icon-button"
        type="button"
        onClick={() => onToggleFavorite(studyCase.slug)}
      >
        {favorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>
    </article>
  );
}
