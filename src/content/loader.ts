import "server-only";

import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";

import { casesMeta } from "./registry";
import { parseMarkdownSections, stripMarkdown } from "./markdown";
import type { CaseSummary, ChecklistItem, StudyCase } from "./schema";
import { casesMetaSchema } from "./validation";

const contentRoot = path.join(process.cwd(), "src", "content", "cases");
const validatedCasesMeta = casesMetaSchema.parse(casesMeta);

function readMarkdown(slug: string, fileName: string) {
  return fs.readFileSync(path.join(contentRoot, slug, fileName), "utf8").trim();
}

function hydrateCase(slug: string): StudyCase | undefined {
  const meta = validatedCasesMeta.find((item) => item.slug === slug);
  if (!meta) {
    return undefined;
  }

  const checklist = parseMarkdownSections(readMarkdown(slug, "checklist.md")).map(
    (item, index): ChecklistItem => ({
      ...item,
      order: index + 1
    })
  );

  return {
    ...meta,
    originalMarkdown: readMarkdown(slug, "original.md"),
    checklist,
    interaction: parseMarkdownSections(readMarkdown(slug, "interaction.md"))
  };
}

export function getAllCases(): StudyCase[] {
  return validatedCasesMeta
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const hydrated = hydrateCase(item.slug);
      if (!hydrated) {
        throw new Error(`Missing case content for ${item.slug}`);
      }
      return hydrated;
    });
}

export function getCaseBySlug(slug: string): StudyCase {
  const studyCase = hydrateCase(slug);
  if (!studyCase) {
    notFound();
  }
  return studyCase;
}

export function getCaseSummaries(): CaseSummary[] {
  return getAllCases().map((studyCase) => ({
    id: studyCase.id,
    slug: studyCase.slug,
    order: studyCase.order,
    title: studyCase.title,
    focus: studyCase.focus,
    group: studyCase.group,
    tags: studyCase.tags,
    reviewStatus: studyCase.reviewStatus,
    hasImaging: studyCase.group === "imaging",
    checklistCount: studyCase.checklist.length
  }));
}

export function getSearchBlob(studyCase: StudyCase) {
  return stripMarkdown(
    [
      studyCase.title,
      studyCase.focus,
      studyCase.tags.join(" "),
      studyCase.originalMarkdown,
      ...(studyCase.blueprint
        ? [
            ...studyCase.blueprint.requiredTasks.flatMap((item) => [item.prompt, item.note ?? ""]),
            ...(studyCase.blueprint.practicalSkills?.flatMap((skill) => [
              skill.title,
              skill.kind,
              ...(skill.equipment ?? []),
              ...(skill.patientSetup ?? []),
              ...(skill.examinerPhrases ?? []),
              ...skill.steps.flatMap((step) => [
                step.title,
                step.instruction,
                step.expectedFinding ?? ""
              ]),
              ...skill.interpretation,
              ...(skill.safety ?? [])
            ]) ?? []),
            ...studyCase.blueprint.answerBlocks.flatMap((block) => [
              block.title,
              block.body ?? "",
              ...block.points.map((point) => point.text)
            ])
          ]
        : []),
      ...studyCase.checklist.flatMap((item) => [item.title, item.body]),
      ...studyCase.interaction.flatMap((item) => [item.title, item.body])
    ].join("\n")
  ).toLowerCase();
}

export function getAdjacentCases(slug: string) {
  const cases = getCaseSummaries();
  const index = cases.findIndex((item) => item.slug === slug);

  return {
    previous: index > 0 ? cases[index - 1] : undefined,
    next: index >= 0 && index < cases.length - 1 ? cases[index + 1] : undefined
  };
}
