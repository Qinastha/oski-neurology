import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const casesRoot = path.join(root, "src/content/cases");
const publicRoot = path.join(root, "public");

const caseDirs = fs
  .readdirSync(casesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const caseFiles = caseDirs.map((slug) => ({
  slug,
  source: fs.readFileSync(path.join(casesRoot, slug, "case.ts"), "utf8")
}));

const slugs = caseFiles.map(({ source }) => source.match(/"?slug"?:\s*"([^"]+)"/)?.[1] ?? "");
const groups = caseFiles.map(
  ({ source }) => source.match(/"?group"?:\s*"(non-imaging|imaging)"/)?.[1] ?? ""
);
const publicRefs = caseFiles
  .flatMap(({ source }) =>
    [...source.matchAll(/"?(?:src|href)"?:\s*"([^"]+)"/g)].map((match) => match[1])
  )
  .filter((href) => href.startsWith("/"));

const failures = [];

if (slugs.length !== 20) {
  failures.push(`Expected 20 cases, got ${slugs.length}`);
}

if (new Set(slugs).size !== slugs.length) {
  failures.push("Case slugs are not unique");
}

const imagingCount = groups.filter((group) => group === "imaging").length;
const nonImagingCount = groups.filter((group) => group === "non-imaging").length;
if (imagingCount !== 5) {
  failures.push(`Expected 5 imaging cases, got ${imagingCount}`);
}
if (nonImagingCount !== 15) {
  failures.push(`Expected 15 non-imaging cases, got ${nonImagingCount}`);
}

for (const slug of slugs) {
  for (const file of ["case.ts", "original.md", "checklist.md", "interaction.md"]) {
    const filePath = path.join(casesRoot, slug, file);
    if (!fs.existsSync(filePath)) {
      failures.push(`Missing ${filePath}`);
    }
  }

  const checklistPath = path.join(casesRoot, slug, "checklist.md");
  if (fs.existsSync(checklistPath)) {
    const checklist = fs.readFileSync(checklistPath, "utf8");
    if (!/^##\s+/m.test(checklist)) {
      failures.push(`Checklist has no markdown sections: ${slug}`);
    }
  }
}

for (const href of publicRefs) {
  const filePath = path.join(publicRoot, href.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing public asset ${href}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Content OK: ${slugs.length} cases (${nonImagingCount} без МРТ/КТ, ${imagingCount} МРТ/КТ), ${publicRefs.length} public assets`
);
