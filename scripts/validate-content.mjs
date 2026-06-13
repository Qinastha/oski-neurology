import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const casesRoot = path.join(root, "src/content/cases");
const krokGeneratedPath = path.join(root, "src/content/krok/generated.ts");
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

function parseGeneratedKrokBooklets() {
  if (!fs.existsSync(krokGeneratedPath)) {
    failures.push(`Missing KROK generated data: ${krokGeneratedPath}`);
    return [];
  }

  const source = fs.readFileSync(krokGeneratedPath, "utf8");
  const prefix = "export const krokBooklets = ";
  const start = source.indexOf(prefix);
  const end = source.lastIndexOf(" satisfies KrokBooklet[];");
  if (start < 0 || end < 0 || end <= start) {
    failures.push("Unable to locate KROK generated data literal");
    return [];
  }

  try {
    return JSON.parse(source.slice(start + prefix.length, end));
  } catch (error) {
    failures.push(`Unable to parse KROK generated data: ${error.message}`);
    return [];
  }
}

const krokBooklets = parseGeneratedKrokBooklets();
const expectedBookletIds = new Set(["2024", "2025", "2026"]);
if (krokBooklets.length !== 3) {
  failures.push(`Expected 3 KROK booklets, got ${krokBooklets.length}`);
}

const krokQuestionIds = new Set();
let krokQuestionCount = 0;
let krokCorrectAnswerCount = 0;
for (const booklet of krokBooklets) {
  if (!expectedBookletIds.has(booklet.id)) {
    failures.push(`Unexpected KROK booklet id: ${booklet.id}`);
  }
  if (!Array.isArray(booklet.questions) || booklet.questions.length !== 150) {
    failures.push(`Expected 150 KROK questions for ${booklet.id}, got ${booklet.questions?.length}`);
    continue;
  }

  for (const question of booklet.questions) {
    krokQuestionCount += 1;
    if (krokQuestionIds.has(question.id)) {
      failures.push(`Duplicate KROK question id: ${question.id}`);
    }
    krokQuestionIds.add(question.id);

    if (question.bookletId !== booklet.id) {
      failures.push(`KROK question ${question.id} has wrong bookletId ${question.bookletId}`);
    }
    if (!Number.isInteger(question.sourceNumber) || question.sourceNumber < 1) {
      failures.push(`KROK question ${question.id} has invalid sourceNumber`);
    }
    if (typeof question.text !== "string" || question.text.trim().length === 0) {
      failures.push(`KROK question ${question.id} has empty text`);
    }
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 5) {
      failures.push(`KROK question ${question.id} has invalid option count`);
      continue;
    }

    const optionIds = new Set(question.options.map((option) => option.id));
    if (optionIds.size !== question.options.length) {
      failures.push(`KROK question ${question.id} has duplicate option ids`);
    }
    if (!optionIds.has(question.correctOptionId)) {
      failures.push(`KROK question ${question.id} correctOptionId does not match options`);
    } else {
      krokCorrectAnswerCount += 1;
    }
  }
}

if (krokQuestionCount !== 450) {
  failures.push(`Expected 450 KROK questions, got ${krokQuestionCount}`);
}
if (krokCorrectAnswerCount !== 450) {
  failures.push(`Expected 450 KROK correct answers, got ${krokCorrectAnswerCount}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Content OK: ${slugs.length} cases (${nonImagingCount} без МРТ/КТ, ${imagingCount} МРТ/КТ), ${publicRefs.length} public assets, ${krokQuestionCount} KROK questions`
);
