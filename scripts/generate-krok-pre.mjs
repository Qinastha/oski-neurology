import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  createGeneratedEntries,
  deterministicShuffle,
  materializeGeneratedQuestion,
  sectionTargets,
  validateConceptContentCodes
} from "./krok-generation-core.mjs";

const root = process.cwd();
const contentMapPath = path.join(root, "src/content/krok/content-map.ts");
const officialPath = path.join(root, "src/content/krok/generated.ts");
const explanationsPath = path.join(root, "src/content/krok/explanations.ts");
const overridesPath = path.join(root, "src/content/krok/answer-overrides.ts");
const trainingPath = path.join(root, "src/content/krok/training.ts");
const outputPath = path.join(root, "src/content/krok/pre-krok.ts");

const preKrokBooklet = {
  id: "pre-001",
  kind: "pre-krok",
  title: "Пре-КРОК буклет 1",
  sourceFile: "official-2024-2026 + Структура_змісту_Кр_3_Неврологія.pdf"
};

const officialSourceEntries = [
  { sourceQuestionId: "2024-009", contentCode: "1.10.0.0" },
  { sourceQuestionId: "2024-024", contentCode: "1.9.0.0" },
  { sourceQuestionId: "2024-025", contentCode: "1.6.0.0" },
  { sourceQuestionId: "2024-030", contentCode: "1.11.0.0" },
  { sourceQuestionId: "2024-101", contentCode: "1.3.0.0" },
  { sourceQuestionId: "2026-035", contentCode: "1.16.0.0" },
  { sourceQuestionId: "2026-036", contentCode: "1.24.0.0" },

  { sourceQuestionId: "2024-022", contentCode: "2.15.2.1" },
  { sourceQuestionId: "2024-027", contentCode: "2.15.2.1" },
  { sourceQuestionId: "2024-077", contentCode: "2.11.1.1" },
  { sourceQuestionId: "2024-056", contentCode: "2.22.1.3" },
  { sourceQuestionId: "2024-133", contentCode: "2.22.1.0" },
  { sourceQuestionId: "2024-143", contentCode: "2.13.3.1" },
  { sourceQuestionId: "2025-027", contentCode: "2.6.0.0" },
  { sourceQuestionId: "2024-040", contentCode: "2.15.2.1" },
  { sourceQuestionId: "2026-076", contentCode: "2.15.3.0" },
  { sourceQuestionId: "2026-094", contentCode: "2.18.0.0" },
  { sourceQuestionId: "2026-118", contentCode: "2.13.4.0" },
  { sourceQuestionId: "2026-119", contentCode: "2.18.0.0" },
  { sourceQuestionId: "2026-123", contentCode: "2.22.0.0" },
  { sourceQuestionId: "2026-124", contentCode: "2.22.0.0" },

  { sourceQuestionId: "2024-023", contentCode: "3.6.6.0" },
  { sourceQuestionId: "2024-033", contentCode: "3.6.7.0" },
  { sourceQuestionId: "2024-051", contentCode: "3.6.6.0" },
  { sourceQuestionId: "2024-053", contentCode: "3.2.0.0" },
  { sourceQuestionId: "2025-022", contentCode: "3.4.0.0" },
  { sourceQuestionId: "2026-067", contentCode: "3.6.6.0" },
  { sourceQuestionId: "2026-143", contentCode: "3.5.1.0" },

  { sourceQuestionId: "2024-021", contentCode: "4.3.0.0" },
  { sourceQuestionId: "2024-032", contentCode: "4.2.0.0" },
  { sourceQuestionId: "2024-063", contentCode: "4.4.0.0" },
  { sourceQuestionId: "2026-150", contentCode: "4.5.0.0" },

  { sourceQuestionId: "2024-017", contentCode: "5.3.0.0" },
  { sourceQuestionId: "2024-036", contentCode: "5.4.1.0" },
  { sourceQuestionId: "2024-059", contentCode: "5.4.1.0" },
  { sourceQuestionId: "2024-072", contentCode: "5.4.1.0" },
  { sourceQuestionId: "2024-094", contentCode: "5.7.0.0" },
  { sourceQuestionId: "2026-061", contentCode: "5.6.0.0" },
  { sourceQuestionId: "2026-135", contentCode: "5.4.3.0" },

  { sourceQuestionId: "2025-004", contentCode: "6.8.1.0" },
  { sourceQuestionId: "2024-098", contentCode: "6.10.0.0" },
  { sourceQuestionId: "2024-104", contentCode: "6.3.0.0" },
  { sourceQuestionId: "2024-129", contentCode: "6.2.0.0" },
  { sourceQuestionId: "2026-097", contentCode: "6.10.0.0" },
  { sourceQuestionId: "2026-120", contentCode: "6.2.0.0" },
  { sourceQuestionId: "2026-126", contentCode: "6.4.0.0" },

  { sourceQuestionId: "2024-010", contentCode: "7.5.1.3" },
  { sourceQuestionId: "2024-011", contentCode: "7.5.1.3" },
  { sourceQuestionId: "2024-043", contentCode: "7.5.2.1" },
  { sourceQuestionId: "2024-110", contentCode: "7.5.2.2" },
  { sourceQuestionId: "2024-139", contentCode: "7.5.1.2" },
  { sourceQuestionId: "2026-048", contentCode: "7.6.0.0" },
  { sourceQuestionId: "2026-092", contentCode: "7.3.0.0" },

  { sourceQuestionId: "2025-142", contentCode: "8.3.1.0" },
  { sourceQuestionId: "2024-132", contentCode: "9.1.1.0" },
  { sourceQuestionId: "2026-042", contentCode: "10.1.1.0" },
  { sourceQuestionId: "2024-004", contentCode: "11.2.0.0" },

  { sourceQuestionId: "2024-096", contentCode: "12.3.1.2" },
  { sourceQuestionId: "2026-054", contentCode: "12.5.1.0" },
  { sourceQuestionId: "2024-135", contentCode: "12.7.1.0" },
  { sourceQuestionId: "2026-125", contentCode: "12.7.3.0" },

  { sourceQuestionId: "2025-124", contentCode: "13.1.0.0" },

  { sourceQuestionId: "2024-005", contentCode: "14.2.1.0" },
  { sourceQuestionId: "2024-007", contentCode: "14.2.3.0" },
  { sourceQuestionId: "2024-038", contentCode: "14.2.2.0" },

  { sourceQuestionId: "2024-015", contentCode: "15.12.0.0" },
  { sourceQuestionId: "2024-039", contentCode: "15.2.0.0" },
  { sourceQuestionId: "2026-117", contentCode: "15.9.0.0" }
];

const generatedTargets = [
  ["1", 8],
  ["2", 16],
  ["3", 8],
  ["4", 5],
  ["5", 8],
  ["6", 8],
  ["7", 8],
  ["8", 2],
  ["9", 2],
  ["10", 2],
  ["11", 2],
  ["12", 5],
  ["13", 2],
  ["14", 3],
  ["15", 3]
];

function parseExportedArray(filePath, exportName, typeName) {
  const source = fs.readFileSync(filePath, "utf8");
  const prefix = `export const ${exportName} = `;
  const typedPrefix = `export const ${exportName}: ${typeName}[] = `;
  const suffix = ` satisfies ${typeName}[];`;
  const start = source.indexOf(prefix);
  const typedStart = source.indexOf(typedPrefix);
  const effectivePrefix = start >= 0 ? prefix : typedPrefix;
  const effectiveStart = start >= 0 ? start : typedStart;
  const suffixStart = source.lastIndexOf(suffix);
  const effectiveEnd = suffixStart >= 0 ? suffixStart : source.lastIndexOf(";");
  if (effectiveStart < 0 || effectiveEnd < 0 || effectiveEnd <= effectiveStart) {
    throw new Error(`Unable to locate ${exportName} in ${filePath}`);
  }
  return JSON.parse(source.slice(effectiveStart + effectivePrefix.length, effectiveEnd));
}

function majorSectionFromCode(contentCode) {
  return `${contentCode.split(".")[0]}.0.0.0`;
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

function getSharedTokenRatio(left, right) {
  const leftTokens = new Set(
    normalizeQuestionText(left)
      .split(" ")
      .filter((token) => token.length >= 4)
  );
  const rightTokens = new Set(
    normalizeQuestionText(right)
      .split(" ")
      .filter((token) => token.length >= 4)
  );
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

function getGeneratedPreFamilyKey(entry) {
  const correct = entry.item.correct;
  if (correct === "Діабетична полінейропатія" || correct === "Дистальна симетрична полінейропатія") {
    return "diabetic-polyneuropathy";
  }
  return correct;
}

function getGeneratedPreInternalIssue(generatedEntries) {
  const seenFamilies = new Map();
  for (const entry of generatedEntries) {
    const familyKey = getGeneratedPreFamilyKey(entry);
    const previous = seenFamilies.get(familyKey);
    if (previous) {
      return `repeats generated clinical family "${familyKey}": ${previous.stem} / ${entry.stem}`;
    }
    seenFamilies.set(familyKey, entry);
  }

  for (let leftIndex = 0; leftIndex < generatedEntries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < generatedEntries.length; rightIndex += 1) {
      const left = generatedEntries[leftIndex];
      const right = generatedEntries[rightIndex];
      const similarity = getSharedTokenRatio(left.stem, right.stem);
      if (left.item.correct === right.item.correct && similarity >= 0.45) {
        return `repeats generated answer "${left.item.correct}": ${left.stem} / ${right.stem}`;
      }
      if (
        getGeneratedPreFamilyKey(left) === getGeneratedPreFamilyKey(right) &&
        similarity >= 0.38
      ) {
        return `repeats generated clinical family "${getGeneratedPreFamilyKey(left)}": ${left.stem} / ${right.stem}`;
      }
    }
  }

  return null;
}

function getFirstAgeFromText(value) {
  const match = String(value).match(/віком\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function generatedPreAge(entry, sequenceIndex, attempt) {
  return getFirstAgeFromText(entry.stem) ?? 18 + ((entry.variant + sequenceIndex * 5 + attempt) % 63);
}

function makePreKrokGeneratedStem(entry, sequenceIndex, attempt) {
  const age = generatedPreAge(entry, sequenceIndex, attempt);
  const item = entry.item;
  const cue = item.cue;
  const conceptText = `${item.cue} ${item.correct} ${item.rationale}`.toLowerCase();
  if (conceptText.includes("післяполог") || conceptText.includes("полог")) {
    const templates = [
      () => `Породілля віком ${age} років звернулася через нові неврологічні симптоми. Після обстеження встановлено: ${cue}. ${item.ask}`,
      () => `У жінки віком ${age} років після пологів з’явилися головний біль і неврологічні скарги. Дані обстеження: ${cue}. ${item.ask}`,
      () => `Жінку віком ${age} років у післяпологовому періоді обстежують через гострі скарги. Виявлено: ${cue}. ${item.ask}`
    ];
    return templates[(entry.variant + sequenceIndex + attempt) % templates.length]();
  }
  if (conceptText.includes("хлопчик") || conceptText.includes("дюшена")) {
    const templates = [
      () => `Хлопчик віком ${age} років скерований до невролога через порушення ходи. Під час огляду виявлено: ${cue}. ${item.ask}`,
      () => `У хлопчика віком ${age} років батьки помітили поступове погіршення ходи. Найпомітніша знахідка: ${cue}. ${item.ask}`,
      () => `Дитину віком ${age} років обстежують через рухові труднощі. Неврологічний огляд показав: ${cue}. ${item.ask}`
    ];
    return templates[(entry.variant + sequenceIndex + attempt) % templates.length]();
  }
  const templates = [
    () =>
      `Пацієнт віком ${age} років звернувся зі скаргами, що потребують неврологічної оцінки. При огляді встановлено: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років аналізують провідні неврологічні ознаки: ${cue}. ${item.ask}`,
    () =>
      `Пацієнта віком ${age} років обстежують через новий неврологічний дефіцит. Основна знахідка: ${cue}. ${item.ask}`,
    () =>
      `У наведеній клінічній ситуації описано: ${cue}. ${item.ask}`,
    () =>
      `Після первинного огляду пацієнта віком ${age} років лікар має зіставити такі дані: ${cue}. ${item.ask}`,
    () =>
      `Пацієнт віком ${age} років повідомляє про симптоми, які під час огляду відповідають такому опису: ${cue}. ${item.ask}`,
    () =>
      `Під час огляду пацієнта віком ${age} років визначено провідну ознаку: ${cue}. ${item.ask}`,
    () =>
      `У стаціонарі оцінюють пацієнта віком ${age} років. Неврологічний статус дає змогу виділити головну ознаку: ${cue}. ${item.ask}`,
    () =>
      `Лікар зіставляє анамнез і неврологічний статус пацієнта віком ${age} років. Вирішальним є такий опис: ${cue}. ${item.ask}`,
    () =>
      `Наведено коротку клінічну умову: ${cue}. ${item.ask}`,
    () =>
      `Пацієнт віком ${age} років перебуває на консультації. Додаткові скарги не змінюють головної неврологічної знахідки: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років під час консультації виділяють провідний неврологічний прояв: ${cue}. ${item.ask}`
  ];
  return templates[(entry.variant + sequenceIndex + attempt) % templates.length]();
}

function rebaseOptionId(questionId, index) {
  return `${questionId}-${String.fromCharCode(97 + index)}`;
}

function rebaseOfficialQuestion({
  entry,
  sourceQuestion,
  sourceNumber,
  questionId,
  explanationByQuestionId,
  overrideByQuestionId
}) {
  const optionIdBySourceId = new Map();
  const options = sourceQuestion.options.map((option, index) => {
    const id = rebaseOptionId(questionId, index);
    optionIdBySourceId.set(option.id, id);
    return {
      id,
      sourceLetter: String.fromCharCode(97 + index),
      text: option.text
    };
  });
  const correctedSourceOptionId =
    overrideByQuestionId.get(sourceQuestion.id)?.correctOptionId ?? sourceQuestion.correctOptionId;
  const correctOptionId = optionIdBySourceId.get(correctedSourceOptionId);
  if (!correctOptionId) {
    throw new Error(`Unable to rebase correct option for ${sourceQuestion.id}`);
  }

  return {
    id: questionId,
    bookletId: preKrokBooklet.id,
    sourceNumber,
    origin: "official",
    sourceQuestionId: sourceQuestion.id,
    contentSection: majorSectionFromCode(entry.contentCode),
    contentCode: entry.contentCode,
    text: sourceQuestion.text,
    options,
    correctOptionId,
    explanation:
      explanationByQuestionId.get(sourceQuestion.id)?.explanation ??
      "Обґрунтування для цього питання ще не додано до локальної бази."
  };
}

function assertSectionCounts(entries, expected) {
  const counts = new Map();
  for (const entry of entries) {
    const major = entry.contentCode.split(".")[0];
    counts.set(major, (counts.get(major) ?? 0) + 1);
  }
  for (const [section, expectedCount] of expected) {
    const actual = counts.get(section) ?? 0;
    if (actual !== expectedCount) {
      throw new Error(`Pre-KROK section ${section} expected ${expectedCount}, got ${actual}`);
    }
  }
}

const contentTopics = parseExportedArray(contentMapPath, "krokContentTopics", "KrokContentTopic");
const contentCodeSet = new Set(contentTopics.map((topic) => topic.code));
validateConceptContentCodes(contentCodeSet);

for (const entry of officialSourceEntries) {
  if (!contentCodeSet.has(entry.contentCode)) {
    throw new Error(`Unknown Pre-KROK official content code: ${entry.contentCode}`);
  }
}

assertSectionCounts(officialSourceEntries, [
  ["1", 7],
  ["2", 14],
  ["3", 7],
  ["4", 4],
  ["5", 7],
  ["6", 7],
  ["7", 7],
  ["8", 1],
  ["9", 1],
  ["10", 1],
  ["11", 1],
  ["12", 4],
  ["13", 1],
  ["14", 3],
  ["15", 3]
]);
assertSectionCounts(
  generatedTargets.map(([section, count]) => ({
    contentCode: `${section}.0.0.0`,
    count
  })).flatMap(({ contentCode, count }) => Array.from({ length: count }, () => ({ contentCode }))),
  generatedTargets
);

const officialBooklets = parseExportedArray(officialPath, "krokBooklets", "KrokBooklet");
const explanations = parseExportedArray(
  explanationsPath,
  "krokAnswerExplanations",
  "KrokAnswerExplanation"
);
const overrides = parseExportedArray(overridesPath, "krokAnswerOverrides", "KrokAnswerOverride");
const trainingBooklets = parseExportedArray(trainingPath, "krokTrainingBooklets", "KrokTrainingBooklet");

const officialQuestionById = new Map(
  officialBooklets.flatMap((booklet) => booklet.questions.map((question) => [question.id, question]))
);
const explanationByQuestionId = new Map(explanations.map((item) => [item.questionId, item]));
const overrideByQuestionId = new Map(overrides.map((item) => [item.questionId, item]));
const selectedOfficialIds = new Set();
const selectedOfficialQuestions = officialSourceEntries.map((entry) => {
  if (selectedOfficialIds.has(entry.sourceQuestionId)) {
    throw new Error(`Duplicate Pre-KROK official source question: ${entry.sourceQuestionId}`);
  }
  selectedOfficialIds.add(entry.sourceQuestionId);
  const question = officialQuestionById.get(entry.sourceQuestionId);
  if (!question) {
    throw new Error(`Missing Pre-KROK official source question: ${entry.sourceQuestionId}`);
  }
  return { entry, question };
});

const officialReferenceTexts = officialBooklets.flatMap((booklet) =>
  booklet.questions.map((question) => question.text)
);
const trainingReferenceTexts = trainingBooklets.flatMap((booklet) =>
  booklet.questions.map((question) => question.text)
);
const referenceTexts = [...officialReferenceTexts, ...trainingReferenceTexts];
const normalizedReferenceTexts = new Set(referenceTexts.map(normalizeQuestionText));
function getGeneratedPreIssue(generated) {
  const normalized = normalizeQuestionText(generated.stem);
  if (normalizedReferenceTexts.has(normalized)) {
    return `duplicates existing text: ${generated.stem}`;
  }
  const tooSimilarOfficial = officialReferenceTexts.find(
    (text) => getSharedTokenRatio(generated.stem, text) >= 0.82 && Math.min(countWords(generated.stem), countWords(text)) >= 18
  );
  if (tooSimilarOfficial) {
    return `is too similar to official text: ${generated.stem}`;
  }
  const tooSimilarTraining = trainingReferenceTexts.find(
    (text) => getSharedTokenRatio(generated.stem, text) >= 0.96 && Math.min(countWords(generated.stem), countWords(text)) >= 18
  );
  if (tooSimilarTraining) {
    return `is too similar to training text: ${generated.stem}`;
  }
  return null;
}

function createUniqueGeneratedEntries() {
  const issues = [];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const generatedEntries = createGeneratedEntries({
      targets: generatedTargets,
      bookletIndex: 11 + attempt,
      variantOffset: 9000 + attempt * 997
    }).map((entry, index) => ({
      ...entry,
      stem: makePreKrokGeneratedStem(entry, index, attempt)
    }));
    const internalIssue = getGeneratedPreInternalIssue(generatedEntries);
    if (internalIssue) {
      issues.push(`attempt ${attempt + 1}: ${internalIssue}`);
      continue;
    }
    const issue = generatedEntries.map(getGeneratedPreIssue).find(Boolean);
    if (!issue) {
      return generatedEntries;
    }
    issues.push(`attempt ${attempt + 1}: ${issue}`);
  }
  throw new Error(`Unable to create unique Pre-KROK generated questions:\n${issues.join("\n")}`);
}

const generatedRawEntries = createUniqueGeneratedEntries();

const mixedEntries = deterministicShuffle(
  [
    ...selectedOfficialQuestions.map((item) => ({ origin: "official", ...item })),
    ...generatedRawEntries.map((entry) => ({ origin: "generated", entry }))
  ],
  71317
);

const questions = mixedEntries.map((item, index) => {
  const sourceNumber = index + 1;
  const questionId = `${preKrokBooklet.id}-${String(sourceNumber).padStart(3, "0")}`;
  if (item.origin === "official") {
    return rebaseOfficialQuestion({
      entry: item.entry,
      sourceQuestion: item.question,
      sourceNumber,
      questionId,
      explanationByQuestionId,
      overrideByQuestionId
    });
  }

  return {
    ...materializeGeneratedQuestion(item.entry, preKrokBooklet.id, sourceNumber, questionId),
    origin: "generated"
  };
});

const preKrokBooklets = [
  {
    ...preKrokBooklet,
    questions
  }
];

const output = `import type { KrokPreKrokBooklet } from "./schema";

// Static mixed Pre-KROK booklet generated from selected official questions and new AI questions.
// Official-origin questions are rebased so they behave like one coherent booklet in the trainer.
export const krokPreKrokBooklets = ${JSON.stringify(preKrokBooklets, null, 2)} satisfies KrokPreKrokBooklet[];
`;

fs.writeFileSync(outputPath, output);
console.log(`Generated ${questions.length} Pre-KROK questions -> ${outputPath}`);
