import "server-only";

import { notFound } from "next/navigation";

import { stripMarkdown } from "@/content/markdown";
import { normalizeSearchText } from "@/lib/search";
import { noteBlocks } from "./blocks";
import { noteSections } from "./sections";
import type { NoteBlock, NoteSection, ResolvedNoteSection } from "./schema";

const typedNoteSections = noteSections as NoteSection[];
const typedNoteBlocks = noteBlocks as NoteBlock[];
const noteBlockByCode = new Map(typedNoteBlocks.map((block) => [block.sectionCode, block]));

export function getNoteSections(): ResolvedNoteSection[] {
  return typedNoteSections.map((section) => ({
    ...section,
    block: noteBlockByCode.get(section.code)
  }));
}

export function getAvailableNoteSections() {
  return getNoteSections().filter((section) => Boolean(section.block));
}

export function getNoteSectionBySlug(slug: string): ResolvedNoteSection {
  const section = getNoteSections().find((item) => item.slug === slug);
  if (!section) {
    notFound();
  }
  return section;
}

export function getNoteBlockBySlug(slug: string): { section: ResolvedNoteSection; block: NoteBlock } {
  const section = getNoteSectionBySlug(slug);
  if (!section.block) {
    notFound();
  }
  return { section, block: section.block };
}

export function getNoteCatalogStats() {
  const sections = getNoteSections();
  return {
    sectionCount: sections.length,
    availableCount: sections.filter((section) => section.block).length,
    totalWeight: sections.reduce((sum, section) => sum + section.weight, 0)
  };
}

export function getNoteSearchBlob(section: ResolvedNoteSection) {
  return normalizeSearchText(
    stripMarkdown(
    [
      section.code,
      section.title,
      ...section.subtopics.flatMap((subtopic) => [subtopic.code, subtopic.title]),
      ...(section.block?.coverageHighlights ?? []),
      ...(section.block?.content.flatMap((item) => [
        item.title ?? "",
        item.lead ?? "",
        ...(item.paragraphs ?? []),
        ...(item.items ?? []),
        ...(item.columns ?? []),
        ...(item.rows ?? []).flat()
      ]) ?? []),
      ...(section.block?.topical?.flatMap((point) => [point.title, point.text, ...(point.tags ?? [])]) ?? []),
      ...(section.block?.krokPatterns.flatMap((point) => [point.title, point.text, ...(point.tags ?? [])]) ?? []),
      ...(section.block?.pitfalls.flatMap((point) => [point.title, point.text, ...(point.tags ?? [])]) ?? []),
      ...(section.block?.krokSearchTerms ?? [])
    ].join("\n")
    )
  );
}
