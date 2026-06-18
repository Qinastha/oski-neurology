import "server-only";

import { notFound } from "next/navigation";

import { stripMarkdown } from "@/content/markdown";
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
  return stripMarkdown(
    [
      section.code,
      section.title,
      section.weight.toString(),
      ...section.subtopics.flatMap((subtopic) => [subtopic.code, subtopic.title]),
      section.block?.summary ?? "",
      ...(section.block?.content.flatMap((item) => [
        item.id,
        item.type,
        item.title ?? "",
        item.lead ?? "",
        ...(item.paragraphs ?? []),
        ...(item.items ?? [])
      ]) ?? []),
      ...(section.block?.topical?.flatMap((item) => [item.title, item.text, ...(item.tags ?? [])]) ?? []),
      ...(section.block?.krokPatterns.flatMap((item) => [item.title, item.text, ...(item.tags ?? [])]) ?? []),
      ...(section.block?.pitfalls.flatMap((item) => [item.title, item.text, ...(item.tags ?? [])]) ?? []),
      ...(section.block?.krokSearchTerms ?? [])
    ].join("\n")
  ).toLowerCase();
}
