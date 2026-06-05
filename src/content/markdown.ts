import type { MarkdownSection } from "./schema";

const headingPattern = /^##\s+(.+)$/gm;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const matches = [...markdown.matchAll(headingPattern)];

  if (matches.length === 0) {
    const body = markdown.trim();
    return body ? [{ id: "section", title: "Материал", body }] : [];
  }

  return matches
    .map((match, index) => {
      const title = match[1].trim();
      const bodyStart = (match.index ?? 0) + match[0].length;
      const bodyEnd =
        index + 1 < matches.length
          ? matches[index + 1].index ?? markdown.length
          : markdown.length;
      return {
        id: slugify(title) || `section-${index + 1}`,
        title,
        body: markdown.slice(bodyStart, bodyEnd).trim()
      };
    })
    .filter((section) => section.title.length > 0);
}

export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
