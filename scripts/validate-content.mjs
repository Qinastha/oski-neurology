import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const casesRoot = path.join(root, "src/content/cases");
const krokGeneratedPath = path.join(root, "src/content/krok/generated.ts");
const krokContentMapPath = path.join(root, "src/content/krok/content-map.ts");
const krokExplanationsPath = path.join(root, "src/content/krok/explanations.ts");
const krokOverridesPath = path.join(root, "src/content/krok/answer-overrides.ts");
const krokTrainingPath = path.join(root, "src/content/krok/training.ts");
const notesSectionsPath = path.join(root, "src/content/notes/sections.ts");
const notesBlocksPath = path.join(root, "src/content/notes/blocks.ts");
const ticketsGeneratedPath = path.join(root, "src/content/tickets/generated.ts");
const ticketsCoveragePath = path.join(root, "src/content/tickets/coverage.ts");
const ticketsCuratedPath = path.join(root, "src/content/tickets/curated.ts");
const legacyTicketsCuratedSplitPaths = [
  "curated-01-20.ts",
  "curated-21-22.ts",
  "curated-23.ts"
].map((fileName) => path.join(root, "src/content/tickets", fileName));
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
const krokContentTopics = parseExportedArray(
  krokContentMapPath,
  "krokContentTopics",
  "KrokContentTopic"
);
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
const noteSections = parseExportedArray(notesSectionsPath, "noteSections", "NoteSection");
const noteBlocks = parseExportedArray(notesBlocksPath, "noteBlocks", "NoteBlock");
const examTickets = parseExportedArray(ticketsGeneratedPath, "examTickets", "ExamTicket");
const examQuestions = parseExportedArray(ticketsCoveragePath, "examQuestions", "ExamQuestion");
const missingExamQuestions = parseExportedArray(
  ticketsCoveragePath,
  "missingExamQuestions",
  "MissingExamQuestion"
);
const allExamTicketQuestionOverrides = parseExportedArray(
  ticketsCuratedPath,
  "examTicketQuestionOverrides",
  "ExamTicketQuestionOverride"
);
const expectedBookletIds = new Set(["2024", "2025", "2026"]);
const expectedTrainingBookletIds = new Set(["ai-001", "ai-002", "ai-003", "ai-004"]);
const expectedNoteSectionWeights = new Map([
  ["1.0.0.0", 10],
  ["2.0.0.0", 20],
  ["3.0.0.0", 10],
  ["4.0.0.0", 6],
  ["5.0.0.0", 10],
  ["6.0.0.0", 10],
  ["7.0.0.0", 10],
  ["8.0.0.0", 2],
  ["9.0.0.0", 2],
  ["10.0.0.0", 2],
  ["11.0.0.0", 2],
  ["12.0.0.0", 6],
  ["13.0.0.0", 2],
  ["14.0.0.0", 4],
  ["15.0.0.0", 4]
]);
const forbiddenTrainingStemPatterns = [
  /ключова ознака/i,
  /клінічному завданні/i,
  /найкраще відповідає цій ситуації/i,
  /що зберігаються на момент огляду/i,
  /Під час обстеження спостерігається/i,
  /Під час ранкового обходу/i,
  /хворого на діабет/i,
  /Сімейний лікар скерував пацієнта/i,
  /пацієнт пов’язує/i,
  /У хворого виявлено/i,
  /В ургентному порядку оглядають [^.]+ із фокальним дефіцитом/i,
  /Після збору анамнезу та стандартного огляду виявлено:\s*(?:потріб|потреба|питання|підозрюють)/i,
  /Який рівень ураження треба запідозрити\?/i,
  /Вихідна ознака/i,
  /описаний неврологічний патерн/i,
  /Початок симптомів пов’язаний з останніми кількома днями/i,
  /для уточнення рівня ураження/i,
  /пацієнт,\s*/i,
  /:\s*пацієнт\./i,
  /діагноз або наступний крок/i,
  /діагноз або судинний синдром/i,
  /судинний басейн, механізм або тактика/i
];
const forbiddenTrainingExplanationPatterns = [
  /^Ключова деталь:/i,
  /є найкращою відповіддю/i,
  /Описаний патерн добре відмежовує/i,
  /Саме така комбінація симптомів/i,
  /Поєднання ознак спрямовує/i,
  /Клінічна логіка тут/i,
  /від дистракторів/i,
  /Тому правильна відповідь/i,
  /\b(?:GBS|HSV|DMT|IVIG)\b/i,
  /бо [^.!?]+», бо/i,
  /пацієнт,\s*/i,
  /:\s*пацієнт\./i,
  /діагноз або наступний крок/i
];
const trainingClinicalStemPattern =
  /^(Пацієнт|Пацієнта|У пацієнта|У пацієнтки|У неврологічному|Чоловік|Жінка|Хлопець|Дівчина|До приймального|До неврологічного|Під час огляду|Під час неврологічного|Після|На амбулаторному|На повторній|В ургентному|Внаслідок|Унаслідок)/i;
const minTrainingAverageStemWords = 34;
const minTrainingMedianStemWords = 30;
const maxShortTrainingStems = 45;
const minTrainingClinicalStemRatio = 0.55;
const maxRepeatedTrainingOpening = 14;
const minDirectTrainingStems = 5;
const minMediumTrainingStems = 80;
const minLongTrainingStems = 6;
const minQuestionFormulaCount = 9;
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
const expectedTicketNumbers = new Set(Array.from({ length: 23 }, (_, index) => index + 1));
const expectedMissingExamQuestionNumbers = [34, 35, 53, 57, 59, 83];
const expectedKrokContentMajorCounts = new Map([
  ["1", 31],
  ["2", 97],
  ["3", 47],
  ["4", 13],
  ["5", 22],
  ["6", 21],
  ["7", 15],
  ["8", 11],
  ["9", 12],
  ["10", 8],
  ["11", 3],
  ["12", 17],
  ["13", 5],
  ["14", 13],
  ["15", 15]
]);
for (const filePath of legacyTicketsCuratedSplitPaths) {
  if (fs.existsSync(filePath)) {
    failures.push(
      `Legacy split exam ticket curated file must be merged into src/content/tickets/curated.ts: ${path.basename(filePath)}`
    );
  }
}
if (krokBooklets.length !== 3) {
  failures.push(`Expected 3 KROK booklets, got ${krokBooklets.length}`);
}
if (krokTrainingBooklets.length !== 4) {
  failures.push(`Expected 4 KROK training booklets, got ${krokTrainingBooklets.length}`);
}
if (krokContentTopics.length !== 330) {
  failures.push(`Expected 330 KROK content topics, got ${krokContentTopics.length}`);
}

const krokContentCodes = new Set();
const krokContentMajorCounts = new Map();
for (const topic of krokContentTopics) {
  if (typeof topic.code !== "string" || !/^\d+(?:\.\d+){3}$/.test(topic.code)) {
    failures.push(`KROK content topic has invalid code: ${topic.code}`);
    continue;
  }
  if (krokContentCodes.has(topic.code)) {
    failures.push(`Duplicate KROK content topic code: ${topic.code}`);
  }
  krokContentCodes.add(topic.code);
  if (typeof topic.title !== "string" || topic.title.trim().length === 0) {
    failures.push(`KROK content topic ${topic.code} has empty title`);
  }
  const major = topic.code.split(".")[0];
  krokContentMajorCounts.set(major, (krokContentMajorCounts.get(major) ?? 0) + 1);
  if (topic.code.endsWith(".0.0.0")) {
    const expectedWeight = expectedNoteSectionWeights.get(topic.code);
    if (expectedWeight !== undefined && topic.weight !== expectedWeight) {
      failures.push(`KROK content topic ${topic.code} expected weight ${expectedWeight}, got ${topic.weight}`);
    }
  }
}
for (const [major, expectedCount] of expectedKrokContentMajorCounts) {
  const actualCount = krokContentMajorCounts.get(major) ?? 0;
  if (actualCount !== expectedCount) {
    failures.push(`KROK content major ${major} expected ${expectedCount} topics, got ${actualCount}`);
  }
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

function countWords(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function getFirstAgeFromText(value) {
  const match = String(value).match(/віком\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function hasUkrainianWord(value, wordPattern) {
  return new RegExp(`(?:^|[^а-яіїєґ])${wordPattern}(?=$|[^а-яіїєґ])`, "i").test(String(value));
}

function hasMaleLead(value) {
  return /^(?:Чоловік|У чоловіка|До приймального відділення звернувся чоловік|На амбулаторному прийомі чоловік|Під час неврологічного огляду чоловіка)/i.test(String(value));
}

function hasFemaleLead(value) {
  return /^(?:Жінка|У жінки|Пацієнтка|До неврологічного кабінету скерована жінка|На повторній консультації жінка|Після госпіталізації пацієнтки|У неврологічному стаціонарі жінку)/i.test(String(value));
}

function hasAdultDefaultLead(value) {
  return /^(?:Пацієнт віком|Після короткого анамнезу у пацієнта|В ургентному порядку оглядають пацієнта)/i.test(String(value));
}

function getClinicalContradiction(value) {
  const text = String(value);
  const rules = [
    {
      label: "denies trauma in a trauma vignette",
      context: /Анамнез не містить ознак гострої травми/i,
      cue: /(?:після падіння|після травми|після удару)/i
    },
    {
      label: "denies fever in an infectious CNS vignette",
      context: /температура тіла нормальна/i,
      cue: /(?:гарячка|менінгіт|енцефаліт)/i
    },
    {
      label: "uses persistent duration in a regressed TIA vignette",
      context: /Скарги тривають другу добу без повного регресу/i,
      cue: /(?:повністю регресував|40 хвилин|транзиторна)/i
    },
    {
      label: "denies intoxication in a toxic exposure vignette",
      context: /травми або інтоксикації [^.]+не зазначає/i,
      cue: /(?:свинець|талій|випромінювання|розчинники|миш’як|акумуляторн|радіаційн)/i
    }
  ];
  return rules.find((rule) => rule.context.test(text) && rule.cue.test(text))?.label ?? null;
}

function getOptionLogicIssue(question, correctOptionText) {
  const optionTexts = new Set(question.options.map((option) => option.text));
  const hasAny = (values) => values.some((value) => optionTexts.has(value));

  if (
    correctOptionText === "Нативна КТ головного мозку" &&
    hasAny([
      "Транзиторна ішемічна атака",
      "Ішемічний інсульт",
      "Внутрішньомозковий крововилив",
      "Субарахноїдальний крововилив",
      "Синдром передньої спинномозкової артерії",
      "Тромбоз венозного синуса",
      "Гіпертонічна енцефалопатія",
      "Хронічна ішемія головного мозку",
      "Каротидна дисекція"
    ])
  ) {
    return "mixes an acute stroke action answer with diagnostic distractors";
  }

  if (
    correctOptionText === "Ліва потилична кора" &&
    hasAny([
      "Невропатичний біль",
      "Доброякісне пароксизмальне позиційне головокружіння",
      "Хвороба Меньєра",
      "Гідроцефалія",
      "Делірій",
      "Центральний парез",
      "Периферичний парез",
      "Сенситивна атаксія",
      "Мозочкова атаксія",
      "Синдром Броун-Секара",
      "Бульбарний синдром",
      "Альтернуючий синдром"
    ])
  ) {
    return "mixes a cortical localization answer with syndrome distractors";
  }

  if (
    correctOptionText === "Латеральний спіноталамічний шлях" &&
    hasAny([
      "Невропатичний біль",
      "Доброякісне пароксизмальне позиційне головокружіння",
      "Хвороба Меньєра",
      "Гідроцефалія",
      "Делірій",
      "Центральний парез",
      "Периферичний парез",
      "Сенситивна атаксія",
      "Мозочкова атаксія",
      "Синдром Броун-Секара"
    ])
  ) {
    return "mixes a pathway answer with syndrome distractors";
  }

  if (
    correctOptionText === "Лицевий нерв" &&
    hasAny([
      "Дистальна симетрична полінейропатія",
      "Поперекова радикулопатія",
      "Плечова плексопатія",
      "Міжреберна невралгія",
      "Мералгія парестетична",
      "Вертеброгенний корінцевий синдром"
    ])
  ) {
    return "mixes a cranial nerve answer with peripheral syndrome distractors";
  }

  if (/Яка локалізація ураження найбільш імовірна/i.test(question.text) && correctOptionText === "Плечова плексопатія") {
    return "answers a localization question with a syndrome label";
  }

  if (/Яку локалізацію треба виключити/i.test(question.text) && correctOptionText === "Пухлина спинного мозку") {
    return "answers a localization question with a pathology label";
  }

  return null;
}

function getOpeningKey(value) {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");
}

function getQuestionFormula(value) {
  const match = String(value).match(/(?:Який|Яка|Яке|Які|Укажіть|Визначте|Оберіть|Що|Де|Куди)[^?.!]*[?.!]?$/i);
  return normalizeQuestionText(match?.[0] ?? value).slice(0, 80);
}

function getSharedTokenRatio(left, right) {
  const leftTokens = new Set(normalizeQuestionText(left).split(" ").filter((token) => token.length >= 4));
  const rightTokens = new Set(normalizeQuestionText(right).split(" ").filter((token) => token.length >= 4));
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }
  let shared = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  }
  return shared / Math.min(leftTokens.size, rightTokens.size);
}

const allQuestionIds = new Set(krokQuestionIds);
const officialQuestionsForSimilarity = krokBooklets.flatMap((booklet) => booklet.questions);
const normalizedAllTrainingQuestionTexts = new Set();
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
  const contentCodeCounts = new Map();
  const normalizedTrainingTexts = new Set();
  const trainingStemWordCounts = [];
  const openingCounts = new Map();
  const questionFormulas = new Set();
  let clinicalTrainingStemCount = 0;
  let directTrainingStemCount = 0;
  let mediumTrainingStemCount = 0;
  let longTrainingStemCount = 0;
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
    const stemWordCount = countWords(question.text);
    trainingStemWordCounts.push(stemWordCount);
    if (stemWordCount < 24) {
      directTrainingStemCount += 1;
    }
    if (stemWordCount >= 30 && stemWordCount <= 70) {
      mediumTrainingStemCount += 1;
    }
    if (stemWordCount >= 75) {
      longTrainingStemCount += 1;
    }
    const openingKey = getOpeningKey(question.text);
    openingCounts.set(openingKey, (openingCounts.get(openingKey) ?? 0) + 1);
    questionFormulas.add(getQuestionFormula(question.text));
    if (trainingClinicalStemPattern.test(question.text)) {
      clinicalTrainingStemCount += 1;
    }
    if (forbiddenTrainingStemPatterns.some((pattern) => pattern.test(question.text))) {
      failures.push(`KROK training question ${question.id} uses a forbidden meta-style stem phrase`);
    }
    const clinicalContradiction = getClinicalContradiction(question.text);
    if (clinicalContradiction) {
      failures.push(`KROK training question ${question.id} ${clinicalContradiction}`);
    }
    if (typeof question.explanation !== "string" || question.explanation.trim().length < 20) {
      failures.push(`KROK training question ${question.id} needs an explanation`);
    } else if (forbiddenTrainingExplanationPatterns.some((pattern) => pattern.test(question.explanation))) {
      failures.push(`KROK training question ${question.id} has a malformed explanation`);
    } else if ((question.explanation.match(/,\s*бо/gi) ?? []).length > 1) {
      failures.push(`KROK training question ${question.id} has a repeated explanatory connector`);
    }
    const firstAge = getFirstAgeFromText(question.text);
    if (firstAge !== null && firstAge >= 18 && hasUkrainianWord(question.text, "(?:дитина|дитини|хлопчик|дівчинка|немовля|підліток|підлітка)")) {
      failures.push(`KROK training question ${question.id} mixes adult age with pediatric context`);
    }
    if (
      firstAge !== null &&
      firstAge < 60 &&
      /похилого віку/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} mixes young age with older-adult context`);
    }
    if (firstAge !== null && firstAge >= 45 && hasUkrainianWord(question.text, "молод(?:ий|а|ої|ого)")) {
      failures.push(`KROK training question ${question.id} mixes older age with young-adult wording`);
    }
    if (
      firstAge !== null &&
      firstAge >= 65 &&
      /(?:Гантінгтон|хореїчні рухи)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically old age for Huntington-style vignette`);
    }
    if (
      firstAge !== null &&
      firstAge >= 60 &&
      /розсіяним склерозом.*рецидив/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically old age for MS relapse vignette`);
    }
    if (
      firstAge !== null &&
      firstAge < 50 &&
      /(?:хвороб[а-яіїєґ']*\s+Паркінсона|леводоп)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically young age for Parkinson/levodopa vignette`);
    }
    if (
      firstAge !== null &&
      firstAge < 55 &&
      /(?:деменц|Альцгеймер|погіршення пам)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically young age for dementia vignette`);
    }
    if (
      firstAge !== null &&
      firstAge < 45 &&
      /(?:боковий аміотрофічний склероз|фасцикуляції.*спастичність|спастичність.*фасцикуляції)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically young age for ALS vignette`);
    }
    if (
      firstAge !== null &&
      firstAge >= 60 &&
      /(?:неврит зорового нерва|біль при рухах оком.*сприйняття червоного)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically old age for optic neuritis vignette`);
    }
    if (
      firstAge !== null &&
      firstAge >= 60 &&
      /(?:мігрень|пульсуючий [^.!?]*головний біль[^.!?]*фотофоб)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically old age for migraine vignette`);
    }
    if (
      firstAge !== null &&
      (firstAge < 25 || firstAge >= 70) &&
      /(?:Хвороба Меньєра|шумом у вусі|флуктуацією слуху)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypical age for Meniere disease vignette`);
    }
    if (
      firstAge !== null &&
      firstAge >= 60 &&
      /(?:Синдром Рейно|пальці кистей біліють на холоді)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically old age for Raynaud vignette`);
    }
    if (
      firstAge !== null &&
      firstAge < 40 &&
      /(?:Невралгія трійчастого нерва|короткі простріли болю в половині обличчя)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically young age for trigeminal neuralgia vignette`);
    }
    if (
      firstAge !== null &&
      firstAge < 35 &&
      /(?:B12-дефіцитна мієлопатія|макроцитарна анемія.*втрата вібраційної чутливості)/i.test(question.text)
    ) {
      failures.push(`KROK training question ${question.id} uses an atypically young age for B12 myelopathy vignette`);
    }
    if (/^Пацієнт\b[^.]+\.?\s*Пацієнтка\b/i.test(question.text)) {
      failures.push(`KROK training question ${question.id} mixes patient gender in the stem`);
    }
    if ((hasMaleLead(question.text) || hasAdultDefaultLead(question.text)) && /(?:породіл|вагітн|післяпологов|після пологів)/i.test(question.text)) {
      failures.push(`KROK training question ${question.id} mixes male/default patient wording with obstetric context`);
    }
    if (hasMaleLead(question.text) && hasUkrainianWord(question.text, "жінка")) {
      failures.push(`KROK training question ${question.id} mixes male lead with female clinical context`);
    }
    if (hasFemaleLead(question.text) && hasUkrainianWord(question.text, "хлопчик")) {
      failures.push(`KROK training question ${question.id} mixes female lead with male pediatric context`);
    }
    if (typeof question.contentSection !== "string" || !/^(?:[1-9]|1[0-5])\.0\.0\.0$/.test(question.contentSection)) {
      failures.push(`KROK training question ${question.id} has invalid contentSection`);
    } else {
      const majorSection = question.contentSection.split(".")[0];
      sectionCounts.set(majorSection, (sectionCounts.get(majorSection) ?? 0) + 1);
    }
    if (typeof question.contentCode !== "string" || !krokContentCodes.has(question.contentCode)) {
      failures.push(`KROK training question ${question.id} has invalid contentCode`);
    } else {
      const majorCode = question.contentCode.split(".")[0];
      contentCodeCounts.set(majorCode, (contentCodeCounts.get(majorCode) ?? 0) + 1);
      if (typeof question.contentSection === "string" && question.contentSection.split(".")[0] !== majorCode) {
        failures.push(`KROK training question ${question.id} contentCode does not match contentSection`);
      }
    }

    const normalized = normalizeQuestionText(question.text);
    if (normalizedTrainingTexts.has(normalized)) {
      failures.push(`Duplicate KROK training question text: ${question.id}`);
    }
    normalizedTrainingTexts.add(normalized);
    if (normalizedAllTrainingQuestionTexts.has(normalized)) {
      failures.push(`Duplicate KROK training question text across training booklets: ${question.id}`);
    }
    normalizedAllTrainingQuestionTexts.add(normalized);
    if (normalizedKrokQuestionTexts.has(normalized)) {
      failures.push(`KROK training question duplicates official question text: ${question.id}`);
    }
    const tooSimilarOfficial = officialQuestionsForSimilarity.find(
      (officialQuestion) =>
        getSharedTokenRatio(question.text, officialQuestion.text) >= 0.82 &&
        Math.min(countWords(question.text), countWords(officialQuestion.text)) >= 18
    );
    if (tooSimilarOfficial) {
      failures.push(`KROK training question ${question.id} is too similar to official question ${tooSimilarOfficial.id}`);
    }

    if (!Array.isArray(question.options) || question.options.length !== 5) {
      failures.push(`KROK training question ${question.id} must have exactly 5 options`);
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
      const correctOptionText = question.options.find((option) => option.id === question.correctOptionId)?.text;
      const optionTexts = new Set(question.options.map((option) => option.text));
      if (correctOptionText === "Внутрішньовенний імуноглобулін" && optionTexts.has("Плазмаферез")) {
        failures.push(
          `KROK training question ${question.id} has two acceptable GBS immunotherapy options in one item`
        );
      }
      const optionLogicIssue = getOptionLogicIssue(question, correctOptionText);
      if (optionLogicIssue) {
        failures.push(`KROK training question ${question.id} ${optionLogicIssue}`);
      }
    }
  }

  const averageStemWords =
    trainingStemWordCounts.reduce((sum, count) => sum + count, 0) /
    Math.max(trainingStemWordCounts.length, 1);
  const medianStemWords = median(trainingStemWordCounts);
  const shortStemCount = trainingStemWordCounts.filter((count) => count < 24).length;
  const clinicalStemRatio =
    clinicalTrainingStemCount / Math.max(trainingStemWordCounts.length, 1);
  const repeatedOpening = [...openingCounts.entries()].find(([, count]) => count > maxRepeatedTrainingOpening);
  if (averageStemWords < minTrainingAverageStemWords) {
    failures.push(
      `KROK training booklet ${booklet.id} average stem words expected >= ${minTrainingAverageStemWords}, got ${averageStemWords.toFixed(1)}`
    );
  }
  if (medianStemWords < minTrainingMedianStemWords) {
    failures.push(
      `KROK training booklet ${booklet.id} median stem words expected >= ${minTrainingMedianStemWords}, got ${medianStemWords}`
    );
  }
  if (shortStemCount > maxShortTrainingStems) {
    failures.push(
      `KROK training booklet ${booklet.id} short stems expected <= ${maxShortTrainingStems}, got ${shortStemCount}`
    );
  }
  if (clinicalStemRatio < minTrainingClinicalStemRatio) {
    failures.push(
      `KROK training booklet ${booklet.id} clinical-style stems expected >= ${(minTrainingClinicalStemRatio * 100).toFixed(0)}%, got ${(clinicalStemRatio * 100).toFixed(1)}%`
    );
  }
  if (repeatedOpening) {
    failures.push(
      `KROK training booklet ${booklet.id} repeats opening "${repeatedOpening[0]}" ${repeatedOpening[1]} times`
    );
  }
  if (directTrainingStemCount < minDirectTrainingStems) {
    failures.push(
      `KROK training booklet ${booklet.id} direct short stems expected >= ${minDirectTrainingStems}, got ${directTrainingStemCount}`
    );
  }
  if (mediumTrainingStemCount < minMediumTrainingStems) {
    failures.push(
      `KROK training booklet ${booklet.id} medium stems expected >= ${minMediumTrainingStems}, got ${mediumTrainingStemCount}`
    );
  }
  if (longTrainingStemCount < minLongTrainingStems) {
    failures.push(
      `KROK training booklet ${booklet.id} long stems expected >= ${minLongTrainingStems}, got ${longTrainingStemCount}`
    );
  }
  if (questionFormulas.size < minQuestionFormulaCount) {
    failures.push(
      `KROK training booklet ${booklet.id} question formula diversity expected >= ${minQuestionFormulaCount}, got ${questionFormulas.size}`
    );
  }

  for (const [section, expectedCount] of expectedTrainingSectionCounts) {
    const actualCount = sectionCounts.get(section) ?? 0;
    if (actualCount !== expectedCount) {
      failures.push(`KROK training booklet ${booklet.id} section ${section}.0.0.0 expected ${expectedCount}, got ${actualCount}`);
    }
    const actualContentCodeCount = contentCodeCounts.get(section) ?? 0;
    if (actualContentCodeCount !== expectedCount) {
      failures.push(`KROK training booklet ${booklet.id} contentCode major ${section} expected ${expectedCount}, got ${actualContentCodeCount}`);
    }
  }
}

if (trainingQuestionCount !== 600) {
  failures.push(`Expected 600 KROK training questions, got ${trainingQuestionCount}`);
}
if (trainingCorrectAnswerCount !== 600) {
  failures.push(`Expected 600 KROK training correct answers, got ${trainingCorrectAnswerCount}`);
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

if (examTickets.length !== 23) {
  failures.push(`Expected 23 exam tickets, got ${examTickets.length}`);
}
const seenTicketNumbers = new Set();
let examTicketMediaCount = 0;
for (const ticket of examTickets) {
  if (!expectedTicketNumbers.has(ticket.number)) {
    failures.push(`Unexpected exam ticket number: ${ticket.number}`);
  }
  if (seenTicketNumbers.has(ticket.number)) {
    failures.push(`Duplicate exam ticket number: ${ticket.number}`);
  }
  seenTicketNumbers.add(ticket.number);

  if (typeof ticket.id !== "string" || !/^ticket-\d{2}$/.test(ticket.id)) {
    failures.push(`Exam ticket ${ticket.number} has invalid id ${ticket.id}`);
  }
  if (typeof ticket.title !== "string" || !ticket.title.includes(String(ticket.number))) {
    failures.push(`Exam ticket ${ticket.number} has invalid title`);
  }
  if (ticket.sourceType !== "docx" && ticket.sourceType !== "pdf") {
    failures.push(`Exam ticket ${ticket.number} has invalid sourceType ${ticket.sourceType}`);
  }
  if (ticket.number === 11 && ticket.sourceType !== "pdf") {
    failures.push("Exam ticket 11 must be imported from PDF");
  }
  if (ticket.number !== 11 && ticket.sourceType !== "docx") {
    failures.push(`Exam ticket ${ticket.number} must be imported from DOCX`);
  }
  if (typeof ticket.sourceFile !== "string" || ticket.sourceFile.trim().length === 0) {
    failures.push(`Exam ticket ${ticket.number} needs sourceFile`);
  }
  if (!Array.isArray(ticket.questions) || ticket.questions.length === 0) {
    failures.push(`Exam ticket ${ticket.number} needs questions`);
  } else if (ticket.questions.length !== 4) {
    failures.push(`Exam ticket ${ticket.number} must have exactly 4 questions, got ${ticket.questions.length}`);
  }

  const ticketMedia = [...(ticket.gallery ?? [])];
  for (const question of ticket.questions ?? []) {
    if (question.ticketNumber !== ticket.number) {
      failures.push(`Exam ticket ${ticket.number} has question with wrong ticketNumber`);
    }
    if (typeof question.title !== "string" || question.title.trim().length === 0) {
      failures.push(`Exam ticket ${ticket.number} question ${question.number} needs title`);
    }
    if (!Array.isArray(question.blocks) || question.blocks.length === 0) {
      failures.push(`Exam ticket ${ticket.number} question ${question.number} needs content blocks`);
    }
    for (const block of question.blocks ?? []) {
      if (!["paragraph", "heading", "list_item"].includes(block.type)) {
        failures.push(`Exam ticket ${ticket.number} question ${question.number} has invalid block type ${block.type}`);
      }
      if (typeof block.text !== "string" || block.text.trim().length === 0) {
        failures.push(`Exam ticket ${ticket.number} question ${question.number} has empty block`);
      }
    }
    ticketMedia.push(...(question.media ?? []));
  }

  for (const media of ticketMedia) {
    examTicketMediaCount += 1;
    if (typeof media.src !== "string" || !media.src.startsWith("/exam/tickets/")) {
      failures.push(`Exam ticket ${ticket.number} has invalid media src ${media.src}`);
      continue;
    }
    const mediaPath = path.join(publicRoot, media.src.replace(/^\//, ""));
    if (!fs.existsSync(mediaPath)) {
      failures.push(`Missing exam ticket media asset ${media.src}`);
    }
    if (typeof media.width !== "number" || media.width <= 0 || typeof media.height !== "number" || media.height <= 0) {
      failures.push(`Exam ticket ${ticket.number} media ${media.src} needs dimensions`);
    } else if (media.width <= 4 || media.height <= 4) {
      failures.push(`Exam ticket ${ticket.number} media ${media.src} looks like a placeholder image`);
    }
  }
}
for (const number of expectedTicketNumbers) {
  if (!seenTicketNumbers.has(number)) {
    failures.push(`Missing exam ticket number ${number}`);
  }
}
if (examQuestions.length !== 92) {
  failures.push(`Expected 92 exam questions, got ${examQuestions.length}`);
}
const seenExamQuestionNumbers = new Set();
for (const question of examQuestions) {
  if (typeof question.number !== "number" || question.number < 1 || question.number > 92) {
    failures.push(`Invalid exam question number ${question.number}`);
  }
  if (seenExamQuestionNumbers.has(question.number)) {
    failures.push(`Duplicate exam question number ${question.number}`);
  }
  seenExamQuestionNumbers.add(question.number);
  if (typeof question.text !== "string" || question.text.trim().length < 20) {
    failures.push(`Exam question ${question.number} needs text`);
  }
}
const actualMissingExamQuestionNumbers = missingExamQuestions.map((question) => question.number).sort((a, b) => a - b);
if (JSON.stringify(actualMissingExamQuestionNumbers) !== JSON.stringify(expectedMissingExamQuestionNumbers)) {
  failures.push(
    `Expected missing exam questions ${expectedMissingExamQuestionNumbers.join(", ")}, got ${actualMissingExamQuestionNumbers.join(", ")}`
  );
}
for (const question of missingExamQuestions) {
  if (!seenExamQuestionNumbers.has(question.number)) {
    failures.push(`Missing exam question ${question.number} is not in source question list`);
  }
  if (typeof question.reason !== "string" || question.reason.trim().length < 10) {
    failures.push(`Missing exam question ${question.number} needs reason`);
  }
}
if (examTicketMediaCount !== 23) {
  failures.push(`Expected 23 exam ticket media assets, got ${examTicketMediaCount}`);
}

const examTicketsByNumber = new Map(examTickets.map((ticket) => [ticket.number, ticket]));
const curatedMediaRefsByTicket = new Map();
function validateRichBlock(block, context, mediaIds, usedMediaIds) {
  if (!block || typeof block !== "object") {
    failures.push(`${context} has invalid rich block`);
    return;
  }
  if (typeof block.id !== "string" || block.id.trim().length === 0) {
    failures.push(`${context} has rich block without id`);
  }
  if (!["paragraph", "heading", "list", "definition_list", "table", "media"].includes(block.type)) {
    failures.push(`${context} has invalid rich block type ${block.type}`);
    return;
  }
  if (block.type === "paragraph" || block.type === "heading") {
    if (typeof block.text !== "string" || block.text.trim().length === 0) {
      failures.push(`${context} ${block.id} needs text`);
    }
    return;
  }
  if (block.type === "list") {
    if (block.style !== "ordered" && block.style !== "unordered") {
      failures.push(`${context} ${block.id} has invalid list style`);
    }
    if (!Array.isArray(block.items) || block.items.length === 0) {
      failures.push(`${context} ${block.id} needs list items`);
    }
    for (const item of block.items ?? []) {
      if (typeof item !== "string" || item.trim().length === 0) {
        failures.push(`${context} ${block.id} has empty list item`);
      }
    }
    return;
  }
  if (block.type === "definition_list") {
    if (!Array.isArray(block.items) || block.items.length === 0) {
      failures.push(`${context} ${block.id} needs definition list items`);
    }
    for (const item of block.items ?? []) {
      if (typeof item?.term !== "string" || item.term.trim().length === 0) {
        failures.push(`${context} ${block.id} has empty definition term`);
      }
      const descriptions = Array.isArray(item?.description) ? item.description : [item?.description];
      if (descriptions.length === 0 || descriptions.some((description) => typeof description !== "string" || description.trim().length === 0)) {
        failures.push(`${context} ${block.id} has empty definition description`);
      }
    }
    return;
  }
  if (block.type === "table") {
    if (!Array.isArray(block.columns) || block.columns.length === 0) {
      failures.push(`${context} ${block.id} needs table columns`);
    }
    if (!Array.isArray(block.rows) || block.rows.length === 0) {
      failures.push(`${context} ${block.id} needs table rows`);
    }
    for (const column of block.columns ?? []) {
      if (typeof column !== "string" || column.trim().length === 0) {
        failures.push(`${context} ${block.id} has empty table column`);
      }
    }
    for (const [rowIndex, row] of (block.rows ?? []).entries()) {
      if (!Array.isArray(row) || row.length !== block.columns.length) {
        failures.push(`${context} ${block.id} row ${rowIndex + 1} has wrong cell count`);
      }
      for (const cell of row ?? []) {
        if (typeof cell !== "string" || cell.trim().length === 0) {
          failures.push(`${context} ${block.id} has empty table cell`);
        }
      }
    }
    return;
  }
  if (!Array.isArray(block.mediaIds) || block.mediaIds.length === 0) {
    failures.push(`${context} ${block.id} needs mediaIds`);
    return;
  }
  for (const mediaId of block.mediaIds) {
    if (typeof mediaId !== "string" || !mediaIds.has(mediaId)) {
      failures.push(`${context} ${block.id} references missing media ${mediaId}`);
      continue;
    }
    if (usedMediaIds.has(mediaId)) {
      failures.push(`${context} references media ${mediaId} more than once`);
    }
    usedMediaIds.add(mediaId);
  }
}

for (const override of allExamTicketQuestionOverrides) {
  const ticket = examTicketsByNumber.get(override.ticketNumber);
  if (!ticket) {
    failures.push(`Curated ticket override references missing ticket ${override.ticketNumber}`);
    continue;
  }
  const question = ticket.questions.find((item) => item.number === override.questionNumber);
  if (!question) {
    failures.push(`Curated ticket ${override.ticketNumber} references missing question ${override.questionNumber}`);
    continue;
  }
  if (override.title !== undefined && (typeof override.title !== "string" || override.title.trim().length === 0)) {
    failures.push(`Curated ticket ${override.ticketNumber} question ${override.questionNumber} has invalid title`);
  }
  if (!Array.isArray(override.richBlocks) || override.richBlocks.length === 0) {
    failures.push(`Curated ticket ${override.ticketNumber} question ${override.questionNumber} needs richBlocks`);
    continue;
  }
  const ticketMediaIds = new Set([
    ...(ticket.gallery ?? []).map((media) => media.id),
    ...ticket.questions.flatMap((item) => (item.media ?? []).map((media) => media.id))
  ]);
  const usedMediaIds =
    curatedMediaRefsByTicket.get(ticket.number) ?? new Set();
  curatedMediaRefsByTicket.set(ticket.number, usedMediaIds);
  for (const block of override.richBlocks) {
    validateRichBlock(
      block,
      `Curated ticket ${override.ticketNumber} question ${override.questionNumber}`,
      ticketMediaIds,
      usedMediaIds
    );
  }
}

if (noteSections.length !== 15) {
  failures.push(`Expected 15 note sections, got ${noteSections.length}`);
}

const noteSectionCodes = new Set();
const noteSectionSlugs = new Set();
let noteSectionWeightTotal = 0;
for (const section of noteSections) {
  if (typeof section.code !== "string" || !/^(?:[1-9]|1[0-5])\.0\.0\.0$/.test(section.code)) {
    failures.push(`Note section has invalid code: ${section.code}`);
    continue;
  }
  if (noteSectionCodes.has(section.code)) {
    failures.push(`Duplicate note section code: ${section.code}`);
  }
  noteSectionCodes.add(section.code);

  if (typeof section.slug !== "string" || !/^[a-z0-9-]+$/.test(section.slug)) {
    failures.push(`Note section ${section.code} has invalid slug`);
  } else if (noteSectionSlugs.has(section.slug)) {
    failures.push(`Duplicate note section slug: ${section.slug}`);
  }
  noteSectionSlugs.add(section.slug);

  const expectedWeight = expectedNoteSectionWeights.get(section.code);
  if (expectedWeight === undefined) {
    failures.push(`Unexpected note section code: ${section.code}`);
  } else if (section.weight !== expectedWeight) {
    failures.push(`Note section ${section.code} expected weight ${expectedWeight}, got ${section.weight}`);
  }
  noteSectionWeightTotal += Number(section.weight ?? 0);

  if (section.status !== "available" && section.status !== "planned") {
    failures.push(`Note section ${section.code} has invalid status ${section.status}`);
  }
  if (!Array.isArray(section.subtopics) || section.subtopics.length === 0) {
    failures.push(`Note section ${section.code} needs subtopics`);
  }
  for (const subtopic of section.subtopics ?? []) {
    if (typeof subtopic.code !== "string" || typeof subtopic.title !== "string" || subtopic.title.trim().length === 0) {
      failures.push(`Note section ${section.code} has invalid subtopic`);
    }
  }
}
if (noteSectionWeightTotal !== 100) {
  failures.push(`Expected note section weights to sum to 100, got ${noteSectionWeightTotal}`);
}

const noteBlockCodes = new Set();
const deprecatedNoteBlockKeys = [
  "highYield",
  "localization",
  "diagnosticClues",
  "differentials",
  "relatedCases"
];
const validNoteContentBlockTypes = new Set(["prose", "list", "subsection", "clinical_note"]);
const forbiddenNoteContentPhrases = [
  "Короткий алгоритм",
  "Порядок думки",
  "Порядок думки на тесті"
];
const expectedNoteSubtopicCoverage = new Map([
  [
    "1.0.0.0",
    [
      { code: "1.1.0.0", groups: [["кора"], ["стовбур"], ["спинний мозок"]] },
      { code: "1.3.0.0", groups: [["вібрац", "пропріоцепц"], ["спіноталам"]] },
      { code: "1.4.0.0", groups: [["рефлекс"], ["колінний", "ахіловий"]] },
      { code: "1.6.0.0", groups: [["пірамід"], ["задні канатики"]] },
      { code: "1.8.0.0", groups: [["спинний мозок"], ["тазові"]] },
      { code: "1.9.0.0", groups: [["стовбур"], ["черепний нерв", "черепні нерви"]] },
      { code: "1.10.0.0", groups: [["черепні нерви"], ["iii - птоз", "xii", "ix-x"]] },
      { code: "1.11.0.0", groups: [["мозочок"], ["атаксі"]] },
      { code: "1.12.0.0", groups: [["базальні"], ["таламус"]] },
      { code: "1.13.0.0", groups: [["внутрішня капсула"], ["задня ніжка", "коліно"]] },
      { code: "1.16.0.0", groups: [["афаз"], ["неглект", "апракс", "агноз"]] },
      { code: "1.19.0.0", groups: [["aca"], ["mca"], ["pca"]] },
      { code: "1.21.0.0", groups: [["ліквор"], ["хоріоїдаль", "шлуночк"]] },
      { code: "1.24.0.0", groups: [["ацетилхолін"], ["дофамін"], ["гамк"], ["глутамат"]] }
    ]
  ],
  [
    "2.0.0.0",
    [
      { code: "2.1.0.0", groups: [["головний біль"], ["невралгі"]] },
      { code: "2.2.0.0", groups: [["головокруж", "запамороч"], ["вестибуляр"]] },
      { code: "2.6.0.0", groups: [["пам’ят", "пам'ят"], ["деменц"]] },
      { code: "2.10.0.0", groups: [["чутлив"], ["stocking-glove", "дерматом"]] },
      { code: "2.11.0.0", groups: [["рухов"], ["рефлекс"]] },
      { code: "2.12.0.0", groups: [["атакс"], ["мозочков", "сенситивн"]] },
      { code: "2.13.0.0", groups: [["спинний мозок"], ["мієлопат", "тазові"]] },
      { code: "2.15.0.0", groups: [["стовбур"], ["альтернуюч"]] },
      { code: "2.22.0.0", groups: [["кора"], ["афаз", "неглект"]] },
      { code: "2.26.0.0", groups: [["периферич"], ["полінейропат", "корінець"]] },
      { code: "2.27.0.0", groups: [["судин"], ["aca", "mca", "pca"]] }
    ]
  ],
  [
    "3.0.0.0",
    [
      { code: "3.1.0.0", groups: [["неврологічний статус"], ["черепні нерви", "рефлекси"]] },
      { code: "3.2.0.0", groups: [["mini-cog"], ["moca"], ["mmse"]] },
      { code: "3.5.0.0", groups: [["ліквор"], ["плеоцитоз", "олігоклональ"]] },
      { code: "3.6.1.0", groups: [["еег"], ["епілеп"]] },
      { code: "3.6.2.0", groups: [["емг"], ["енмг"]] },
      { code: "3.6.6.0", groups: [["кт"], ["кров", "гематом"]] },
      { code: "3.6.7.0", groups: [["мрт"], ["dwi", "flair"]] }
    ]
  ],
  [
    "4.0.0.0",
    [
      { code: "4.1.0.0", groups: [["вільсон"], ["церулоплазмін"], ["кайзера-флейшера"]] },
      { code: "4.4.0.0", groups: [["паркінсон"], ["брадикінез"], ["дофамін"], ["леводоп"]] },
      { code: "4.6.0.0", groups: [["альцгеймер"], ["амілоїд"], ["тау"], ["мемантин", "ацетилхолінестераз"]] },
      { code: "4.7.1.0", groups: [["міастен"], ["ацетилхолін"], ["декремент"], ["піридостигмін"]] },
      { code: "4.8.0.0", groups: [["дюшен"], ["беккер"], ["дистрофін"], ["говерс"]] },
      { code: "4.9.0.0", groups: [["бас"], ["верхнього", "верхній"], ["нижнього", "нижній"], ["рилузол"]] },
      { code: "4.10.0.0", groups: [["сирингомієлі"], ["дисоційована"], ["кіарі", "chiari"]] }
    ]
  ],
  [
    "5.0.0.0",
    [
      { code: "5.3.0.0", groups: [["невралгі"], ["трійчаст"], ["карбамазепін", "окскарбазепін"]] },
      { code: "5.4.0.0", groups: [["нейропат"], ["полінейропат"], ["stocking-glove"], ["енмг"]] },
      { code: "5.5.0.0", groups: [["радикулопат"], ["дерматом"], ["міотом"], ["lasègue", "straight leg"]] },
      { code: "5.7.0.0", groups: [["плексопат"], ["плечове сплетення"], ["erb", "klumpke"]] },
      { code: "5.8.0.0", groups: [["вертеброген"], ["грижа диска", "спінальний стеноз"], ["кінський хвіст", "сідлоподібна"]] }
    ]
  ],
  [
    "6.0.0.0",
    [
      { code: "6.2.0.0", groups: [["менінгіт"], ["нейтрофільний", "низька глюкоза"], ["ліквор"]] },
      { code: "6.3.0.0", groups: [["енцефаліт"], ["зміна свідомості", "судоми"], ["мрт", "ліквор"]] },
      { code: "6.8.1.0", groups: [["гійєна-барре", "gbs"], ["арефлекс"], ["альбуміноцитолог"], ["ivig", "плазмаферез"]] },
      { code: "6.10.0.0", groups: [["нейробореліоз"], ["borrelia", "erythema"], ["парез лицевого", "радикулоневрит"], ["доксициклін", "цефтріаксон"]] },
      { code: "6.12.0.0", groups: [["нейросифіліс"], ["vdrl", "rpr"], ["tabes", "argyll"], ["пеніцилін"]] },
      { code: "6.13.1.0", groups: [["герпетичний енцефаліт", "hsv"], ["скронева"], ["ацикловір"], ["pcr"]] },
      { code: "6.15.0.0", groups: [["розсіяний склероз"], ["дисемінація"], ["олігоклон"], ["перивентрикуляр"], ["ретробульбарний"]] }
    ]
  ],
  [
    "7.0.0.0",
    [
      { code: "7.4.0.0", groups: [["хронічна ішем"], ["лейкоареоз", "лакун"], ["судинн", "когнітив"], ["тиску", "ліпідів", "глюкози"]] },
      { code: "7.5.1.0", groups: [["тіа", "транзитор"], ["ішемічний інсульт"], ["кт без контрасту"], ["тромболізис"], ["тромбектомія"], ["mca", "aca", "pca"]] },
      { code: "7.5.2.0", groups: [["геморагіч", "крововилив"], ["субарахноїд"], ["thunderclap"], ["реверс антикоагуля"]] },
      { code: "7.6.0.0", groups: [["передня спинномозкова"], ["adamkiewicz"], ["біль у спині"], ["пропріоцепц"]] },
      { code: "7.7.0.0", groups: [["церебральний венозний тромбоз", "cvst"], ["папіледема"], ["ctv", "mrv"], ["антикоагуляц", "гепарин"]] }
    ]
  ],
  [
    "8.0.0.0",
    [
      { code: "8.1.0.0", groups: [["вегетатив"], ["ортостат"], ["20/10"], ["мідодрин", "флудрокортизон"]] },
      { code: "8.2.0.0", groups: [["мігрень"], ["4-72"], ["аур"], ["триптан"], ["medication-overuse", "анальгетик"]] },
      { code: "8.3.1.0", groups: [["рейно"], ["холод", "стрес"], ["системна склеродермія", "вторин"], ["ніфедипін", "амлодипін"]] },
      { code: "8.4.0.0", groups: [["тригемінально-автоном", "прозопалгі"], ["кластер"], ["кисень"], ["індометацин"], ["sunct", "suna"]] }
    ]
  ],
  [
    "9.0.0.0",
    [
      { code: "9.1.0.0", groups: [["черепно-мозкова травма", "чмт"], ["gcs", "глазго"], ["струс"], ["забій"], ["дифузне аксональне"]] },
      { code: "9.1.3.0", groups: [["внутрішньочерепний крововилив"], ["епідуральна"], ["субдуральна"], ["світлий проміжок"], ["лінзоподібна", "серпоподібна"]] },
      { code: "9.2.0.0", groups: [["травма хребта"], ["травма спинного мозку"], ["спінальний шок"], ["нейрогенний шок"], ["сакральне збереження"], ["кт", "мрт"]] }
    ]
  ],
  [
    "10.0.0.0",
    [
      { code: "10.1.0.0", groups: [["пухлини головного мозку"], ["гліома", "гліобластома"], ["менінгіома"], ["метастаз"], ["мрт з контраст"]] },
      { code: "10.1.1.0", groups: [["загальномозков"], ["вогнищев"], ["психопатолог"], ["застійні диски"], ["фокальні судоми"]] },
      { code: "10.2.0.0", groups: [["пухлини спинного мозку"], ["екстрамедуляр"], ["інтрамедуляр"], ["сенсорний рівень"], ["метастатична компресія"]] }
    ]
  ],
  [
    "11.0.0.0",
    [
      { code: "11.1.0.0", groups: [["епілепсія"], ["фокальний напад"], ["генералізований напад"], ["абсанс"], ["автоматизми"], ["еег"]] },
      { code: "11.2.0.0", groups: [["епілептичний статус"], ["5 хвилин"], ["abc"], ["бензодіазепін"], ["леветирацетам", "фенітоїн", "вальпроат"], ["неконвульсивний статус"]] }
    ]
  ],
  [
    "12.0.0.0",
    [
      { code: "12.3.1.0", groups: [["b12"], ["фунікуляр", "комбінована"], ["задні канатики"], ["метилмалонова"]] },
      { code: "12.4.0.0", groups: [["уреміч"], ["ниркова недостатність"], ["астериксис"], ["діаліз"]] },
      { code: "12.5.1.0", groups: [["печінкова енцефалопатія"], ["цироз"], ["лактулоза"], ["рифаксимін"]] },
      { code: "12.6.0.0", groups: [["паранеопласт"], ["lambert-eaton"], ["дрібноклітинний рак"], ["anti-hu"]] },
      { code: "12.7.1.0", groups: [["діабетична нейропатія"], ["діабетична полінейропатія"], ["stocking-glove"], ["окорухова нейропатія"]] },
      { code: "12.7.2.0", groups: [["гіпотиреоз"], ["гіпертиреоз"], ["тиреотоксич"], ["мікседематозна"]] }
    ]
  ],
  [
    "13.0.0.0",
    [
      { code: "13.1.1.0", groups: [["свинець"], ["wrist drop", "розгиначів кисті"], ["абдомінальна коліка"], ["хелатор"]] },
      { code: "13.1.2.0", groups: [["талій", "thallium"], ["алопеція"], ["болюча полінейропатія"], ["prussian blue", "берлінська блакить"]] },
      { code: "13.2.0.0", groups: [["іонізуюче випромінювання"], ["гострий променевий синдром"], ["лімфоцит"], ["радіаційний некроз", "радіаційна мієлопатія"]] }
    ]
  ],
  [
    "14.0.0.0",
    [
      { code: "14.2.1.0", groups: [["порушення свідомості"], ["gcs", "шкг"], ["зіниці", "стовбурові рефлекси"], ["глюкоза"]] },
      { code: "14.2.2.0", groups: [["набряк"], ["внутрішньочерепний тиск"], ["вклинення"], ["манітол", "гіпертонічний nacl"]] },
      { code: "14.2.3.0", groups: [["синкоп"], ["вазовагаль"], ["ортостат"], ["екг"]] },
      { code: "14.2.4.2", groups: [["міастенічний криз"], ["життєва ємність"], ["ivig", "плазмаферез"], ["дисфагія", "дихальна"]] },
      { code: "14.2.4.3", groups: [["холінергічний криз"], ["міоз"], ["бронхорея"], ["надлишок інгібітора ацетилхолінестерази"]] }
    ]
  ],
  [
    "15.0.0.0",
    [
      { code: "15.1.0.0", groups: [["фармакотерапія"], ["титрація"], ["побічні ефекти"], ["взаємодії", "різка відміна"]] },
      { code: "15.2.0.0", groups: [["ішемічний інсульт"], ["тромболізис", "тромбектомія"], ["аспірин", "антиагрегант"], ["антикоагуляція", "фібриляція"]] },
      { code: "15.3.0.0", groups: [["менінгіт"], ["антибіотик", "дексаметазон"], ["ацикловір"], ["нейросифіліс", "пеніцилін"]] },
      { code: "15.4.0.0", groups: [["розсіяний склероз"], ["глюкокортикоїд", "метилпреднізолон"], ["dmt", "disease-modifying"], ["плазмаферез"]] },
      { code: "15.5.0.0", groups: [["периферичний відділ"], ["нейропатичний біль"], ["габапентин", "прегабалін", "дулоксетин"], ["карбамазепін"], ["радикулопатія", "тунельний синдром"]] },
      { code: "15.6.0.0", groups: [["вегетативні розлади"], ["ортостатична гіпотензія"], ["мідодрин", "флудрокортизон"], ["нейрогенний сечовий міхур"]] },
      { code: "15.7.0.0", groups: [["епілепсія"], ["бензодіазепін"], ["леветирацетам", "фенітоїн", "вальпроат"], ["sudep", "прихильність"]] },
      { code: "15.8.0.0", groups: [["міастенія"], ["піридостигмін"], ["ivig", "плазмаферез"], ["guillain", "глюкокортикоїди не"]] },
      { code: "15.9.0.0", groups: [["нейродегенеративні"], ["хвороба паркінсона", "паркінсонізм"], ["леводопа"], ["інгібітор холінестерази", "мемантин"], ["als", "рилузол"]] },
      { code: "15.10.0.0", groups: [["травматичні ураження"], ["черепно-мозкова травма"], ["gcs"], ["кт"], ["нейрохірург"]] },
      { code: "15.11.0.0", groups: [["пухлини"], ["дексаметазон"], ["гліома"], ["темозоломід", "радіотерапія"], ["метастази", "стереотаксична"]] },
      { code: "15.12.0.0", groups: [["невідкладні стани"], ["abc", "дихальні шляхи"], ["глюкоза"], ["манітол", "гіпертонічний nacl"], ["декомпресія", "компресія спинного мозку"]] },
      { code: "15.13.0.0", groups: [["соматична патологія"], ["діабетична"], ["b12"], ["печінкова енцефалопатія"], ["лактулоза"], ["тіамін", "wernicke"]] },
      { code: "15.14.0.0", groups: [["профілактика"], ["вакцина"], ["контроль тиску"], ["куріння"], ["реабілітація", "прихильність"]] }
    ]
  ]
]);
function validateNotePoint(block, key, point) {
  if (
    typeof point.title !== "string" ||
    point.title.trim().length === 0 ||
    typeof point.text !== "string" ||
    point.text.trim().length < 20
  ) {
    failures.push(`Note block ${block.sectionCode} has invalid point in ${key}`);
  }
}

for (const block of noteBlocks) {
  if (!noteSectionCodes.has(block.sectionCode)) {
    failures.push(`Note block references missing section ${block.sectionCode}`);
  }
  if (noteBlockCodes.has(block.sectionCode)) {
    failures.push(`Duplicate note block for ${block.sectionCode}`);
  }
  noteBlockCodes.add(block.sectionCode);

  for (const key of deprecatedNoteBlockKeys) {
    if (Object.hasOwn(block, key)) {
      failures.push(`Note block ${block.sectionCode} still uses deprecated key ${key}`);
    }
  }

  const noteBlockTextForStyleCheck = JSON.stringify(block);
  for (const phrase of forbiddenNoteContentPhrases) {
    if (noteBlockTextForStyleCheck.includes(phrase)) {
      failures.push(`Note block ${block.sectionCode} contains forbidden instructional phrase: ${phrase}`);
    }
  }

  if (!Array.isArray(block.content) || block.content.length === 0) {
    failures.push(`Note block ${block.sectionCode} needs content`);
  }
  for (const contentBlock of block.content ?? []) {
    if (typeof contentBlock.id !== "string" || contentBlock.id.trim().length === 0) {
      failures.push(`Note block ${block.sectionCode} has content block without id`);
    }
    if (!validNoteContentBlockTypes.has(contentBlock.type)) {
      failures.push(`Note block ${block.sectionCode} has invalid content block type ${contentBlock.type}`);
    }
    if (contentBlock.title !== undefined && typeof contentBlock.title !== "string") {
      failures.push(`Note block ${block.sectionCode} content ${contentBlock.id} has invalid title`);
    }
    if (contentBlock.lead !== undefined && typeof contentBlock.lead !== "string") {
      failures.push(`Note block ${block.sectionCode} content ${contentBlock.id} has invalid lead`);
    }

    const paragraphs = contentBlock.paragraphs ?? [];
    const items = contentBlock.items ?? [];
    if (!Array.isArray(paragraphs) || !Array.isArray(items)) {
      failures.push(`Note block ${block.sectionCode} content ${contentBlock.id} has invalid text arrays`);
      continue;
    }

    const textCount =
      paragraphs.filter((item) => typeof item === "string" && item.trim().length >= 20).length +
      items.filter((item) => typeof item === "string" && item.trim().length >= 20).length;
    if (textCount === 0) {
      failures.push(`Note block ${block.sectionCode} content ${contentBlock.id} needs text`);
    }
    if (
      (contentBlock.type === "prose" || contentBlock.type === "subsection") &&
      paragraphs.length === 0
    ) {
      failures.push(`Note block ${block.sectionCode} content ${contentBlock.id} needs paragraphs`);
    }
    if (contentBlock.type === "list" && items.length === 0) {
      failures.push(`Note block ${block.sectionCode} content ${contentBlock.id} needs list items`);
    }
  }

  for (const point of block.topical ?? []) {
    validateNotePoint(block, "topical", point);
  }

  for (const key of ["krokPatterns", "pitfalls"]) {
    if (!Array.isArray(block[key]) || block[key].length === 0) {
      failures.push(`Note block ${block.sectionCode} needs ${key}`);
      continue;
    }
    for (const point of block[key]) {
      validateNotePoint(block, key, point);
    }
  }

  if (typeof block.summary !== "string" || block.summary.trim().length < 40) {
    failures.push(`Note block ${block.sectionCode} needs a summary`);
  }
  if (!Array.isArray(block.sources) || block.sources.length === 0) {
    failures.push(`Note block ${block.sectionCode} needs sources`);
  }
  for (const source of block.sources ?? []) {
    if (typeof source.label !== "string" || source.label.trim().length === 0) {
      failures.push(`Note block ${block.sectionCode} has source without label`);
    }
    if (source.href && typeof source.href !== "string") {
      failures.push(`Note block ${block.sectionCode} has invalid source href`);
    }
  }
  if (!Array.isArray(block.krokSearchTerms) || block.krokSearchTerms.length === 0) {
    failures.push(`Note block ${block.sectionCode} needs krokSearchTerms`);
  }

  const coverageRules = expectedNoteSubtopicCoverage.get(block.sectionCode);
  if (coverageRules) {
    const section = noteSections.find((item) => item.code === block.sectionCode);
    const subtopicCodes = new Set(section?.subtopics?.map((subtopic) => subtopic.code) ?? []);
    const searchableNoteText = [
      block.summary,
      ...(block.content ?? []).flatMap((contentBlock) => [
        contentBlock.title ?? "",
        contentBlock.lead ?? "",
        ...(contentBlock.paragraphs ?? []),
        ...(contentBlock.items ?? [])
      ]),
      ...(block.topical ?? []).flatMap((point) => [point.title, point.text, ...(point.tags ?? [])]),
      ...(block.krokPatterns ?? []).flatMap((point) => [point.title, point.text, ...(point.tags ?? [])]),
      ...(block.pitfalls ?? []).flatMap((point) => [point.title, point.text, ...(point.tags ?? [])]),
      ...(block.krokSearchTerms ?? [])
    ].join("\n").toLowerCase();

    for (const rule of coverageRules) {
      if (!subtopicCodes.has(rule.code)) {
        failures.push(`Note block ${block.sectionCode} has coverage rule for missing subtopic ${rule.code}`);
        continue;
      }
      for (const group of rule.groups) {
        if (!group.some((term) => searchableNoteText.includes(term.toLowerCase()))) {
          failures.push(`Note block ${block.sectionCode} does not cover subtopic ${rule.code}: ${group.join(" | ")}`);
        }
      }
    }
  }
}

for (const section of noteSections) {
  const hasBlock = noteBlockCodes.has(section.code);
  if (section.status === "available" && !hasBlock) {
    failures.push(`Note section ${section.code} is available but has no block`);
  }
  if (section.status === "planned" && hasBlock) {
    failures.push(`Note section ${section.code} is planned but already has a block`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Content OK: ${slugs.length} cases (${nonImagingCount} без КТ/МРТ, ${imagingCount} КТ/МРТ), ${publicRefs.length} public assets, ${krokQuestionCount} official KROK questions, ${trainingQuestionCount} training KROK questions, ${noteSections.length} note sections, ${noteBlocks.length} note blocks, ${examTickets.length} exam tickets, ${examQuestions.length} exam questions`
);
