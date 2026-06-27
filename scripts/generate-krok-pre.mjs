import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  createGeneratedEntries,
  deterministicShuffle,
  materializeGeneratedQuestion,
  validateConceptContentCodes
} from "./krok-generation-core.mjs";

const root = process.cwd();
const contentMapPath = path.join(root, "src/content/krok/content-map.ts");
const officialPath = path.join(root, "src/content/krok/generated.ts");
const explanationsPath = path.join(root, "src/content/krok/explanations.ts");
const overridesPath = path.join(root, "src/content/krok/answer-overrides.ts");
const trainingPath = path.join(root, "src/content/krok/training.ts");
const outputPath = path.join(root, "src/content/krok/pre-krok.ts");

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

const officialSectionTargets = [
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
];

const preKrokBookletSpecs = [
  {
    booklet: {
      id: "pre-001",
      kind: "pre-krok",
      title: "Пре-КРОК буклет 1",
      sourceFile: "official-2024-2026 + Структура_змісту_Кр_3_Неврологія.pdf"
    },
    generatedStartBookletIndex: 11,
    generatedVariantOffsetStart: 9000,
    shuffleSeed: 71317,
    officialSourceEntries: [
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
    ]
  },
  {
    booklet: {
      id: "pre-002",
      kind: "pre-krok",
      title: "Пре-КРОК буклет 2",
      sourceFile: "official-2024-2026 + Структура_змісту_Кр_3_Неврологія.pdf"
    },
    generatedStartBookletIndex: 61,
    generatedVariantOffsetStart: 23000,
    shuffleSeed: 91337,
    officialSourceEntries: [
      { sourceQuestionId: "2024-020", contentCode: "1.10.0.0" },
      { sourceQuestionId: "2024-029", contentCode: "1.10.0.0" },
      { sourceQuestionId: "2024-035", contentCode: "1.10.0.0" },
      { sourceQuestionId: "2024-045", contentCode: "1.9.0.0" },
      { sourceQuestionId: "2024-058", contentCode: "1.10.0.0" },
      { sourceQuestionId: "2026-111", contentCode: "1.24.0.0" },
      { sourceQuestionId: "2026-131", contentCode: "1.12.0.0" },

      { sourceQuestionId: "2024-034", contentCode: "2.15.3.0" },
      { sourceQuestionId: "2024-047", contentCode: "2.22.4.0" },
      { sourceQuestionId: "2024-048", contentCode: "2.22.1.1" },
      { sourceQuestionId: "2024-062", contentCode: "2.11.1.1" },
      { sourceQuestionId: "2024-067", contentCode: "2.10.3.0" },
      { sourceQuestionId: "2024-070", contentCode: "2.18.0.0" },
      { sourceQuestionId: "2024-071", contentCode: "2.15.2.1" },
      { sourceQuestionId: "2024-080", contentCode: "2.15.2.1" },
      { sourceQuestionId: "2024-117", contentCode: "2.11.1.1" },
      { sourceQuestionId: "2026-102", contentCode: "2.15.2.1" },
      { sourceQuestionId: "2026-128", contentCode: "2.13.3.1" },
      { sourceQuestionId: "2026-144", contentCode: "2.13.3.1" },
      { sourceQuestionId: "2026-072", contentCode: "2.1.1.0" },
      { sourceQuestionId: "2026-140", contentCode: "2.1.3.1" },

      { sourceQuestionId: "2024-037", contentCode: "3.6.6.0" },
      { sourceQuestionId: "2024-049", contentCode: "3.6.7.0" },
      { sourceQuestionId: "2026-077", contentCode: "3.6.1.0" },
      { sourceQuestionId: "2024-060", contentCode: "3.1.4.0" },
      { sourceQuestionId: "2026-133", contentCode: "3.5.2.0" },
      { sourceQuestionId: "2026-146", contentCode: "3.2.0.0" },
      { sourceQuestionId: "2026-109", contentCode: "3.6.7.0" },

      { sourceQuestionId: "2024-003", contentCode: "4.4.0.0" },
      { sourceQuestionId: "2024-126", contentCode: "4.0.0.0" },
      { sourceQuestionId: "2024-142", contentCode: "4.1.0.0" },
      { sourceQuestionId: "2026-121", contentCode: "4.2.0.0" },

      { sourceQuestionId: "2024-014", contentCode: "5.7.0.0" },
      { sourceQuestionId: "2024-016", contentCode: "5.5.0.0" },
      { sourceQuestionId: "2024-018", contentCode: "5.3.1.0" },
      { sourceQuestionId: "2024-026", contentCode: "5.6.0.0" },
      { sourceQuestionId: "2024-079", contentCode: "5.4.1.0" },
      { sourceQuestionId: "2024-119", contentCode: "5.7.0.0" },
      { sourceQuestionId: "2024-147", contentCode: "5.4.1.0" },

      { sourceQuestionId: "2024-006", contentCode: "6.15.0.0" },
      { sourceQuestionId: "2024-031", contentCode: "6.15.0.0" },
      { sourceQuestionId: "2024-057", contentCode: "6.3.0.0" },
      { sourceQuestionId: "2024-064", contentCode: "6.11.0.0" },
      { sourceQuestionId: "2024-068", contentCode: "6.7.0.0" },
      { sourceQuestionId: "2024-082", contentCode: "6.8.1.0" },
      { sourceQuestionId: "2026-103", contentCode: "6.8.3.0" },

      { sourceQuestionId: "2024-008", contentCode: "7.5.2.1" },
      { sourceQuestionId: "2024-066", contentCode: "7.5.1.3" },
      { sourceQuestionId: "2024-076", contentCode: "7.5.1.3" },
      { sourceQuestionId: "2024-085", contentCode: "7.5.1.3" },
      { sourceQuestionId: "2026-057", contentCode: "7.5.1.2" },
      { sourceQuestionId: "2026-071", contentCode: "7.5.1.3" },
      { sourceQuestionId: "2026-110", contentCode: "7.4.0.0" },

      { sourceQuestionId: "2026-148", contentCode: "8.2.0.0" },
      { sourceQuestionId: "2026-116", contentCode: "9.1.0.0" },
      { sourceQuestionId: "2026-139", contentCode: "10.1.0.0" },
      { sourceQuestionId: "2024-002", contentCode: "11.1.0.0" },

      { sourceQuestionId: "2024-069", contentCode: "12.5.1.0" },
      { sourceQuestionId: "2026-100", contentCode: "12.7.1.0" },
      { sourceQuestionId: "2026-101", contentCode: "12.3.1.2" },
      { sourceQuestionId: "2026-142", contentCode: "12.7.1.0" },

      { sourceQuestionId: "2026-062", contentCode: "13.1.1.0" },

      { sourceQuestionId: "2024-061", contentCode: "14.2.4.3" },
      { sourceQuestionId: "2024-093", contentCode: "14.2.4.2" },
      { sourceQuestionId: "2026-107", contentCode: "14.2.4.2" },

      { sourceQuestionId: "2024-042", contentCode: "15.4.0.0" },
      { sourceQuestionId: "2024-050", contentCode: "15.7.0.0" },
      { sourceQuestionId: "2026-060", contentCode: "15.9.0.0" }
    ]
  }
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
  return getGeneratedPreFamilyKeyForItem({ correct });
}

function getGeneratedPreFamilyKeyForItem(item) {
  const correct = item.correct;
  if (correct === "Діабетична полінейропатія" || correct === "Дистальна симетрична полінейропатія") {
    return "diabetic-polyneuropathy";
  }
  return correct;
}

function getGeneratedPreInternalIssue(generatedEntries) {
  const seenFamilies = new Map();
  for (const entry of generatedEntries) {
    const familyKey = getGeneratedPreFamilyKey(entry);
    const sectionFamilyKey = `${entry.section}:${familyKey}`;
    const previous = seenFamilies.get(sectionFamilyKey);
    if (previous) {
      return `repeats generated clinical family "${familyKey}": ${previous.stem} / ${entry.stem}`;
    }
    seenFamilies.set(sectionFamilyKey, entry);
  }

  for (let leftIndex = 0; leftIndex < generatedEntries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < generatedEntries.length; rightIndex += 1) {
      const left = generatedEntries[leftIndex];
      const right = generatedEntries[rightIndex];
      const similarity = getSharedTokenRatio(left.stem, right.stem);
      if (left.section === right.section && left.item.correct === right.item.correct && similarity >= 0.45) {
        return `repeats generated answer "${left.item.correct}": ${left.stem} / ${right.stem}`;
      }
      if (
        left.section === right.section &&
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
  const basis = `${entry.item.cue} ${entry.item.correct} ${entry.item.rationale}`.toLowerCase();
  const ageSeed = entry.variant + sequenceIndex * 5 + attempt;
  if (
    basis.includes("цукров") ||
    basis.includes("діабетич") ||
    basis.includes("полінейропат")
  ) {
    return 45 + (ageSeed % 31);
  }
  if (
    basis.includes("когнітив") ||
    basis.includes("moca") ||
    basis.includes("деменц") ||
    basis.includes("альцгеймер")
  ) {
    return 60 + (ageSeed % 18);
  }
  if (basis.includes("сирингомієл")) {
    return 22 + (ageSeed % 24);
  }
  if (
    basis.includes("високий тиск") ||
    basis.includes("гіпертензі") ||
    basis.includes("ішемічн") ||
    basis.includes("крововилив") ||
    basis.includes("антиагрегант") ||
    basis.includes("тромболізис")
  ) {
    return 55 + (ageSeed % 25);
  }
  return getFirstAgeFromText(entry.stem) ?? 18 + (ageSeed % 63);
}

function finalizePreKrokStem(stem) {
  return stem.replace(/\.\./g, ".");
}

function hashPreKrokTemplateKey(value) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function pickPreKrokTemplate(templates, entry, sequenceIndex, attempt) {
  const key = `${entry.section}|${entry.item.contentCode}|${entry.item.cue}|${entry.item.correct}`;
  const hash = hashPreKrokTemplateKey(key);
  const index = (hash + entry.variant * 3 + sequenceIndex * 5 + attempt * 7) % templates.length;
  return templates[index]();
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
    return finalizePreKrokStem(pickPreKrokTemplate(templates, entry, sequenceIndex, attempt));
  }
  if (conceptText.includes("хлопчик") || conceptText.includes("дюшена")) {
    const templates = [
      () => `Хлопчик віком ${age} років скерований до невролога через порушення ходи. Під час огляду виявлено: ${cue}. ${item.ask}`,
      () => `У хлопчика віком ${age} років батьки помітили поступове погіршення ходи. Найпомітніша знахідка: ${cue}. ${item.ask}`,
      () => `Дитину віком ${age} років обстежують через рухові труднощі. Неврологічний огляд показав: ${cue}. ${item.ask}`
    ];
    return finalizePreKrokStem(pickPreKrokTemplate(templates, entry, sequenceIndex, attempt));
  }
  const templates = [
    () =>
      `Пацієнт віком ${age} років звернувся до невролога після появи нових скарг. На прийомі зафіксовано: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років під час огляду описано поєднання ознак: ${cue}. ${item.ask}`,
    () =>
      `Пацієнта віком ${age} років обстежують через новий неврологічний дефіцит. Основна знахідка: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років основною клінічною знахідкою є: ${cue}. ${item.ask}`,
    () =>
      `Після первинного огляду пацієнта віком ${age} років лікар має зіставити такі дані: ${cue}. ${item.ask}`,
    () =>
      `Пацієнт віком ${age} років повідомляє про симптоми, які під час огляду відповідають такому опису: ${cue}. ${item.ask}`,
    () =>
      `Під час огляду пацієнта віком ${age} років визначено провідну ознаку: ${cue}. ${item.ask}`,
    () =>
      `У стаціонарі пацієнта віком ${age} років обстежують після уточнення анамнезу. Під час огляду виявлено: ${cue}. ${item.ask}`,
    () =>
      `Під час консультації пацієнта віком ${age} років лікар описує клінічну картину: ${cue}. ${item.ask}`,
    () =>
      `Після огляду пацієнта віком ${age} років зафіксовано: ${cue}. ${item.ask}`,
    () =>
      `Пацієнт віком ${age} років звернувся на консультацію. У неврологічному статусі описано: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років під час консультації виділяють провідний неврологічний прояв: ${cue}. ${item.ask}`,
    () =>
      `На консультації у пацієнта віком ${age} років виявлено: ${cue}. ${item.ask}`,
    () =>
      `Під час обстеження пацієнта віком ${age} років звертає увагу така ознака: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років після уточнення скарг описано: ${cue}. ${item.ask}`,
    () =>
      `Після неврологічного огляду пацієнта віком ${age} років встановлено: ${cue}. ${item.ask}`,
    () =>
      `Пацієнта віком ${age} років оглядають через неврологічні скарги. Виявлено: ${cue}. ${item.ask}`,
    () =>
      `У пацієнта віком ${age} років клінічна картина включає: ${cue}. ${item.ask}`,
    () =>
      `Під час обстеження пацієнта віком ${age} років головною знахідкою є: ${cue}. ${item.ask}`,
    () =>
      `У неврологічному статусі пацієнта віком ${age} років зазначено: ${cue}. ${item.ask}`
  ];
  return finalizePreKrokStem(pickPreKrokTemplate(templates, entry, sequenceIndex, attempt));
}

function rebaseOptionId(questionId, index) {
  return `${questionId}-${String.fromCharCode(97 + index)}`;
}

function rebaseOfficialQuestion({
  booklet,
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
    bookletId: booklet.id,
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

function assertSectionCounts(entries, expected, label) {
  const counts = new Map();
  for (const entry of entries) {
    const major = entry.contentCode.split(".")[0];
    counts.set(major, (counts.get(major) ?? 0) + 1);
  }
  for (const [section, expectedCount] of expected) {
    const actual = counts.get(section) ?? 0;
    if (actual !== expectedCount) {
      throw new Error(`${label} section ${section} expected ${expectedCount}, got ${actual}`);
    }
  }
}

const contentTopics = parseExportedArray(contentMapPath, "krokContentTopics", "KrokContentTopic");
const contentCodeSet = new Set(contentTopics.map((topic) => topic.code));
validateConceptContentCodes(contentCodeSet);

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
const officialReferenceTexts = officialBooklets.flatMap((booklet) =>
  booklet.questions.map((question) => question.text)
);
const trainingReferenceTexts = trainingBooklets.flatMap((booklet) =>
  booklet.questions.map((question) => question.text)
);
const baseReferenceTexts = [...officialReferenceTexts, ...trainingReferenceTexts];
const normalizedBaseReferenceTexts = new Set(baseReferenceTexts.map(normalizeQuestionText));

function getGeneratedPreIssue(generated, priorPreReferenceTexts) {
  const normalized = normalizeQuestionText(generated.stem);
  if (normalizedBaseReferenceTexts.has(normalized)) {
    return `duplicates existing text: ${generated.stem}`;
  }
  if (priorPreReferenceTexts.some((text) => normalizeQuestionText(text) === normalized)) {
    return `duplicates previous Pre-KROK text: ${generated.stem}`;
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

function createUniqueGeneratedEntries(spec, priorPreReferenceTexts) {
  const issues = [];
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const generatedEntries = createGeneratedEntries({
      targets: generatedTargets,
      bookletIndex: spec.generatedStartBookletIndex + attempt,
      variantOffset: spec.generatedVariantOffsetStart + attempt * 997,
      avoidFamilyRepeats: true,
      familyKeyForItem: getGeneratedPreFamilyKeyForItem
    }).map((entry, index) => ({
      ...entry,
      stem: makePreKrokGeneratedStem(entry, index, attempt)
    }));
    const internalIssue = getGeneratedPreInternalIssue(generatedEntries);
    if (internalIssue) {
      issues.push(`attempt ${attempt + 1}: ${internalIssue}`);
      continue;
    }
    const issue = generatedEntries
      .map((generated) => getGeneratedPreIssue(generated, priorPreReferenceTexts))
      .find(Boolean);
    if (!issue) {
      return generatedEntries;
    }
    issues.push(`attempt ${attempt + 1}: ${issue}`);
  }
  throw new Error(
    `Unable to create unique Pre-KROK generated questions for ${spec.booklet.id}:\n${issues.join("\n")}`
  );
}

function getSelectedOfficialQuestions(spec, selectedOfficialIds) {
  assertSectionCounts(spec.officialSourceEntries, officialSectionTargets, `${spec.booklet.id} official`);
  return spec.officialSourceEntries.map((entry) => {
    if (!contentCodeSet.has(entry.contentCode)) {
      throw new Error(`Unknown Pre-KROK official content code: ${entry.contentCode}`);
    }
    if (selectedOfficialIds.has(entry.sourceQuestionId)) {
      throw new Error(`Duplicate Pre-KROK official source question: ${entry.sourceQuestionId}`);
    }
    selectedOfficialIds.add(entry.sourceQuestionId);
    const question = officialQuestionById.get(entry.sourceQuestionId);
    if (!question) {
      throw new Error(`Missing Pre-KROK official source question: ${entry.sourceQuestionId}`);
    }
    if (question.options.length !== 5) {
      throw new Error(`Pre-KROK official source question must have 5 options: ${entry.sourceQuestionId}`);
    }
    return { entry, question };
  });
}

function buildPreKrokBooklet(spec, selectedOfficialIds, priorPreReferenceTexts) {
  const selectedOfficialQuestions = getSelectedOfficialQuestions(spec, selectedOfficialIds);
  const generatedRawEntries = createUniqueGeneratedEntries(spec, priorPreReferenceTexts);
  const mixedEntries = deterministicShuffle(
    [
      ...selectedOfficialQuestions.map((item) => ({ origin: "official", ...item })),
      ...generatedRawEntries.map((entry) => ({ origin: "generated", entry }))
    ],
    spec.shuffleSeed
  );

  const questions = mixedEntries.map((item, index) => {
    const sourceNumber = index + 1;
    const questionId = `${spec.booklet.id}-${String(sourceNumber).padStart(3, "0")}`;
    if (item.origin === "official") {
      return rebaseOfficialQuestion({
        booklet: spec.booklet,
        entry: item.entry,
        sourceQuestion: item.question,
        sourceNumber,
        questionId,
        explanationByQuestionId,
        overrideByQuestionId
      });
    }

    return {
      ...materializeGeneratedQuestion(item.entry, spec.booklet.id, sourceNumber, questionId),
      origin: "generated"
    };
  });

  return {
    ...spec.booklet,
    questions
  };
}

assertSectionCounts(
  generatedTargets
    .map(([section, count]) => ({
      contentCode: `${section}.0.0.0`,
      count
    }))
    .flatMap(({ contentCode, count }) => Array.from({ length: count }, () => ({ contentCode }))),
  generatedTargets,
  "generated Pre-KROK"
);

const selectedOfficialIds = new Set();
const priorPreReferenceTexts = [];
const preKrokBooklets = preKrokBookletSpecs.map((spec) => {
  const booklet = buildPreKrokBooklet(spec, selectedOfficialIds, priorPreReferenceTexts);
  priorPreReferenceTexts.push(...booklet.questions.map((question) => question.text));
  return booklet;
});

const output = `import type { KrokPreKrokBooklet } from "./schema";

// Static mixed Pre-KROK booklets generated from selected official questions and new AI questions.
// Official-origin questions are rebased so each booklet behaves like one coherent trainer session.
export const krokPreKrokBooklets = ${JSON.stringify(preKrokBooklets, null, 2)} satisfies KrokPreKrokBooklet[];
`;

fs.writeFileSync(outputPath, output);
console.log(
  `Generated ${preKrokBooklets.length} Pre-KROK booklets (${preKrokBooklets.reduce(
    (sum, booklet) => sum + booklet.questions.length,
    0
  )} questions) -> ${outputPath}`
);
