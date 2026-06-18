import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const casesRoot = path.join(root, "src/content/cases");
const krokGeneratedPath = path.join(root, "src/content/krok/generated.ts");
const krokExplanationsPath = path.join(root, "src/content/krok/explanations.ts");
const krokOverridesPath = path.join(root, "src/content/krok/answer-overrides.ts");
const krokTrainingPath = path.join(root, "src/content/krok/training.ts");
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
const blueprintFiles = caseDirs
  .map((slug) => ({
    slug,
    filePath: path.join(casesRoot, slug, "blueprint.ts")
  }))
  .filter(({ filePath }) => fs.existsSync(filePath))
  .map(({ slug, filePath }) => ({
    slug,
    source: fs.readFileSync(filePath, "utf8")
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

for (const { slug, source } of blueprintFiles) {
  if (source.includes('type: "exam_steps"')) {
    failures.push(`Blueprint ${slug} still uses deprecated answer block type "exam_steps"`);
  }

  if (source.includes("practicalSkills: []")) {
    failures.push(`Blueprint ${slug} has an empty practicalSkills array`);
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

function parseExportedArray(filePath, exportName, typeName) {
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing KROK data file: ${filePath}`);
    return [];
  }

  const source = fs.readFileSync(filePath, "utf8");
  const prefix = `export const ${exportName} = `;
  const suffix = ` satisfies ${typeName}[];`;
  const start = source.indexOf(prefix);
  const typedPrefix = `export const ${exportName}: ${typeName}[] = `;
  const typedStart = source.indexOf(typedPrefix);
  const effectivePrefix = start >= 0 ? prefix : typedPrefix;
  const effectiveStart = start >= 0 ? start : typedStart;
  const end = source.lastIndexOf(suffix);
  const effectiveEnd = end >= 0 ? end : source.lastIndexOf(";");
  if (effectiveStart < 0 || effectiveEnd < 0 || effectiveEnd <= effectiveStart) {
    failures.push(`Unable to locate ${exportName} data literal`);
    return [];
  }

  try {
    return JSON.parse(source.slice(effectiveStart + effectivePrefix.length, effectiveEnd));
  } catch (error) {
    failures.push(`Unable to parse ${exportName}: ${error.message}`);
    return [];
  }
}

const krokBooklets = parseGeneratedKrokBooklets();
const krokAnswerExplanations = parseExportedArray(
  krokExplanationsPath,
  "krokAnswerExplanations",
  "KrokAnswerExplanation"
);
const krokAnswerOverrides = parseExportedArray(
  krokOverridesPath,
  "krokAnswerOverrides",
  "KrokAnswerOverride"
);
const krokTrainingBooklets = parseExportedArray(
  krokTrainingPath,
  "krokTrainingBooklets",
  "KrokTrainingBooklet"
);
const expectedBookletIds = new Set(["2024", "2025", "2026"]);
const expectedTrainingBookletIds = new Set(["ai-001", "ai-002"]);
const forbiddenTrainingStemPatterns = [
  /ключова ознака/i,
  /клінічному завданні/i,
  /найкраще відповідає цій ситуації/i
];
const expectedTrainingSectionCounts = new Map([
  ["1", 15],
  ["2", 30],
  ["3", 15],
  ["4", 9],
  ["5", 15],
  ["6", 15],
  ["7", 15],
  ["8", 3],
  ["9", 3],
  ["10", 3],
  ["11", 3],
  ["12", 9],
  ["13", 3],
  ["14", 6],
  ["15", 6]
]);
if (krokBooklets.length !== 3) {
  failures.push(`Expected 3 KROK booklets, got ${krokBooklets.length}`);
}
if (krokTrainingBooklets.length !== 2) {
  failures.push(`Expected 2 KROK training booklets, got ${krokTrainingBooklets.length}`);
}

const krokQuestionIds = new Set();
const normalizedKrokQuestionTexts = new Set();
const krokOptionIdsByQuestionId = new Map();
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
    normalizedKrokQuestionTexts.add(normalizeQuestionText(question.text));
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 5) {
      failures.push(`KROK question ${question.id} has invalid option count`);
      continue;
    }

    const optionIds = new Set(question.options.map((option) => option.id));
    krokOptionIdsByQuestionId.set(question.id, optionIds);
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

function normalizeQuestionText(value) {
  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-zа-яіїєґ0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const allQuestionIds = new Set(krokQuestionIds);
let trainingQuestionCount = 0;
let trainingCorrectAnswerCount = 0;
for (const booklet of krokTrainingBooklets) {
  if (!expectedTrainingBookletIds.has(booklet.id)) {
    failures.push(`Unexpected KROK training booklet id: ${booklet.id}`);
  }
  if (booklet.kind !== "training") {
    failures.push(`KROK training booklet ${booklet.id} must have kind "training"`);
  }
  if (!Array.isArray(booklet.questions) || booklet.questions.length !== 150) {
    failures.push(`Expected 150 KROK training questions for ${booklet.id}, got ${booklet.questions?.length}`);
    continue;
  }

  const sectionCounts = new Map();
  const normalizedTrainingTexts = new Set();
  for (const question of booklet.questions) {
    trainingQuestionCount += 1;
    if (allQuestionIds.has(question.id)) {
      failures.push(`Duplicate KROK question id across official/training data: ${question.id}`);
    }
    allQuestionIds.add(question.id);

    if (question.bookletId !== booklet.id) {
      failures.push(`KROK training question ${question.id} has wrong bookletId ${question.bookletId}`);
    }
    if (!Number.isInteger(question.sourceNumber) || question.sourceNumber < 1) {
      failures.push(`KROK training question ${question.id} has invalid sourceNumber`);
    }
    if (typeof question.text !== "string" || question.text.trim().length === 0) {
      failures.push(`KROK training question ${question.id} has empty text`);
    }
    if (forbiddenTrainingStemPatterns.some((pattern) => pattern.test(question.text))) {
      failures.push(`KROK training question ${question.id} uses a forbidden meta-style stem phrase`);
    }
    if (typeof question.explanation !== "string" || question.explanation.trim().length < 20) {
      failures.push(`KROK training question ${question.id} needs an explanation`);
    }
    if (typeof question.contentSection !== "string" || !/^(?:[1-9]|1[0-5])\.0\.0\.0$/.test(question.contentSection)) {
      failures.push(`KROK training question ${question.id} has invalid contentSection`);
    } else {
      const majorSection = question.contentSection.split(".")[0];
      sectionCounts.set(majorSection, (sectionCounts.get(majorSection) ?? 0) + 1);
    }

    const normalized = normalizeQuestionText(question.text);
    if (normalizedTrainingTexts.has(normalized)) {
      failures.push(`Duplicate KROK training question text: ${question.id}`);
    }
    normalizedTrainingTexts.add(normalized);
    if (normalizedKrokQuestionTexts.has(normalized)) {
      failures.push(`KROK training question duplicates official question text: ${question.id}`);
    }

    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 5) {
      failures.push(`KROK training question ${question.id} has invalid option count`);
      continue;
    }
    const optionIds = new Set(question.options.map((option) => option.id));
    if (optionIds.size !== question.options.length) {
      failures.push(`KROK training question ${question.id} has duplicate option ids`);
    }
    if (!optionIds.has(question.correctOptionId)) {
      failures.push(`KROK training question ${question.id} correctOptionId does not match options`);
    } else {
      trainingCorrectAnswerCount += 1;
    }
  }

  for (const [section, expectedCount] of expectedTrainingSectionCounts) {
    const actualCount = sectionCounts.get(section) ?? 0;
    if (actualCount !== expectedCount) {
      failures.push(`KROK training booklet ${booklet.id} section ${section}.0.0.0 expected ${expectedCount}, got ${actualCount}`);
    }
  }
}

if (trainingQuestionCount !== 300) {
  failures.push(`Expected 300 KROK training questions, got ${trainingQuestionCount}`);
}
if (trainingCorrectAnswerCount !== 300) {
  failures.push(`Expected 300 KROK training correct answers, got ${trainingCorrectAnswerCount}`);
}

const explanationQuestionIds = new Set();
for (const item of krokAnswerExplanations) {
  if (typeof item.questionId !== "string" || item.questionId.trim().length === 0) {
    failures.push("KROK explanation has empty questionId");
    continue;
  }
  if (explanationQuestionIds.has(item.questionId)) {
    failures.push(`Duplicate KROK explanation for ${item.questionId}`);
  }
  explanationQuestionIds.add(item.questionId);
  if (!krokQuestionIds.has(item.questionId)) {
    failures.push(`KROK explanation references missing question ${item.questionId}`);
  }
  if (typeof item.explanation !== "string" || item.explanation.trim().length < 20) {
    failures.push(`KROK explanation for ${item.questionId} is too short`);
  }
}
if (krokAnswerExplanations.length !== 450) {
  failures.push(`Expected 450 KROK explanations, got ${krokAnswerExplanations.length}`);
}
for (const questionId of krokQuestionIds) {
  if (!explanationQuestionIds.has(questionId)) {
    failures.push(`Missing KROK explanation for ${questionId}`);
  }
}

const overrideQuestionIds = new Set();
for (const item of krokAnswerOverrides) {
  if (typeof item.questionId !== "string" || item.questionId.trim().length === 0) {
    failures.push("KROK answer override has empty questionId");
    continue;
  }
  if (overrideQuestionIds.has(item.questionId)) {
    failures.push(`Duplicate KROK answer override for ${item.questionId}`);
  }
  overrideQuestionIds.add(item.questionId);
  const optionIds = krokOptionIdsByQuestionId.get(item.questionId);
  if (!optionIds) {
    failures.push(`KROK answer override references missing question ${item.questionId}`);
    continue;
  }
  if (!optionIds.has(item.correctOptionId)) {
    failures.push(`KROK answer override for ${item.questionId} references missing option ${item.correctOptionId}`);
  }
  if (typeof item.reason !== "string" || item.reason.trim().length < 10) {
    failures.push(`KROK answer override for ${item.questionId} needs a reason`);
  }
  if (typeof item.confirmedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.confirmedAt)) {
    failures.push(`KROK answer override for ${item.questionId} needs confirmedAt YYYY-MM-DD`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Content OK: ${slugs.length} cases (${nonImagingCount} без КТ/МРТ, ${imagingCount} КТ/МРТ), ${publicRefs.length} public assets, ${krokQuestionCount} official KROK questions, ${trainingQuestionCount} training KROK questions`
);
