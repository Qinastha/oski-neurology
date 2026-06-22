import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const projectRoot = root.endsWith("site") ? path.dirname(root) : root;
const siteRoot = root.endsWith("site") ? root : path.join(root, "site");
const sourceRoot = path.join(projectRoot, "Exam vars");
const generatedPath = path.join(siteRoot, "src/content/tickets/generated.ts");
const coveragePath = path.join(siteRoot, "src/content/tickets/coverage.ts");
const publicTicketRoot = path.join(siteRoot, "public/exam/tickets");

const confirmedMissingQuestionNumbers = new Set([34, 35, 53, 57, 59, 83]);

const ticketMediaQuestionOverrides = new Map([
  [4, new Map([["image2.jpg", 4], ["image3.jpg", 4]])],
  [15, new Map([["image2.png", 1], ["image1.jpg", 1]])]
]);

const ticketQuestionStartOverrides = new Map([
  [
    1,
    [
      {
        pattern: /^Будова нюхового аналізатора/i,
        title:
          "Будова нюхового аналізатора, методика дослідження. Симптоми ураження нюхового аналізатора на різних рівнях. Пухлини лобної долі. Методи сучасної діагностики."
      },
      {
        pattern: /^2\)\s*Автоімунний енцефаліт/i,
        title: "Автоімунний енцефаліт. Етіологія, патогенез, клініка, діагностика, лікування."
      },
      {
        pattern: /^3\)\s*Вища нервова діяльність/i,
        title: "Вища нервова діяльність. Методи дослідження."
      },
      {
        pattern: /^4\)\s*Механізми формування внутрішньочерепної гіпертензії/i,
        title:
          "Механізми формування внутрішньочерепної гіпертензії. Правило Монро-Келі, тріада Кушинга та інші дислокаційні синдроми. Ідіопатична доброякісна внутрішньочерепна гіпертензія: клініка, діагностика, лікування."
      }
    ]
  ],
  [
    2,
    [
      {
        pattern: /^1\)\s*Глибока чутливість/i,
        title: "Глибока та складні види чутливості. Види, методика дослідження та симптоми порушення."
      },
      {
        pattern: /^2\)\s*Будова зорового аналізатора/i,
        title: "Будова зорового аналізатора, методика дослідження. Симптоми ураження на різних рівнях."
      },
      {
        pattern: /^3\)\s*Біль у нижній частині спини/i,
        title:
          "Біль у нижній частині спини. Етіологія, класифікація, клініка, діагностика, лікування та профілактика. Показання до хірургічного лікування."
      },
      {
        pattern: /^4\)\s*Компресійно-ішемічні мононевропатії нижніх кінцівок/i,
        title:
          "Компресійно-ішемічні мононевропатії нижніх кінцівок. Клініка. Сучасні методи діагностики. Показання до хірургічного лікування."
      }
    ]
  ],
  [
    8,
    [
      {
        pattern: /^Питання 1:\s*Больова та температурна чутливість/i,
        title: "Больова і температурна чутливість. Провідні шляхи. Методи дослідження."
      },
      {
        pattern: /^Питання 2:\s*Симптоми ураження гіпоталамічної зони/i,
        title: "Симптоми ураження гіпоталамічної зони. Діенцефальні кризи. Методи лікування."
      },
      {
        pattern: /^Розділ 3:\s*Гострий Інфекційний Мієліт/i,
        title: "Гострий мієліт. Етіологія, клінічний перебіг, лікування."
      },
      {
        pattern: /^Питання 4:\s*Черепно-мозкова травма/i,
        title:
          "Черепно-мозкова травма. Сучасна класифікація черепно-мозкової травми. Клініка, діагностика, консервативне лікування. Шкала коми Глазго."
      }
    ]
  ],
  [
    13,
    [
      {
        pattern: /^Питання 1:\s*Ретикулярна формація/i,
        title: "Ретикулярна формація стовбура головного мозку та її функціональне значення."
      },
      {
        pattern: /^Питання 2:\s*Симптоми ураження потиличної долі/i,
        title: "Симптоми ураження потиличної долі головного мозку."
      },
      {
        pattern: /^Міастенія гравіс\./i,
        title: "Міастенія гравіс. Етіологія, патогенез, клінічний перебіг, лікування."
      },
      {
        pattern: /^Питання 4:\s*Електрофізіологічна діагностика/i,
        title: "Електрофізіологічна діагностика: діагностичні можливості та показання для призначення ЕМГ, ЕНМГ, ЕЕГ."
      }
    ]
  ],
  [
    15,
    [
      {
        pattern: /^1\s+Компресійно-ішемічні мононевропатії верхньої кінцівки/i,
        title: "Компресійно-ішемічні мононевропатії верхньої кінцівки."
      },
      {
        pattern: /^2\.\s*Ангулярний синдром/i,
        title: "Ангулярний синдром, клінічні прояви, топічна діагностика."
      },
      {
        pattern: /^3\s+Судинна деменція/i,
        title: "Судинна деменція."
      },
      {
        pattern: /^4\s+Гепатоцеребральна дегенерація/i,
        title: "Гепатоцеребральна дегенерація (хвороба Вільсона-Коновалова). Етіологія, патогенез, клінічний перебіг, лікування."
      }
    ]
  ],
  [
    14,
    [
      {
        pattern: /^Типи порушень чутливості, топічна діагностика\.$/i,
        title: "Типи порушень чутливості, топічна діагностика."
      },
      {
        pattern: /^Симптоми ураження мозочка\.$/i,
        title: "Симптоми ураження мозочка."
      },
      {
        pattern: /^3\.Хвороба Паркінсона/i,
        title: "Хвороба Паркінсона. Етіологія, патогенез, клінічний перебіг, диференційна діагностика, лікування."
      },
      {
        pattern: /^4\.\s*Абцеси головного та спинного мозку/i,
        title: "Абсцеси головного та спинного мозку."
      }
    ]
  ],
  [
    19,
    [
      {
        pattern: /ПЕТ: діагностичні можливості/i,
        title: "ПЕТ: діагностичні можливості та показання для діагностики неврологічних захворювань.",
        occurrence: 2
      },
      {
        pattern: /Симптоми ураження лівої лобної долі/i,
        title: "Симптоми ураження лівої лобної долі."
      },
      {
        pattern: /Ішемічний інсульт/i,
        title:
          "Ішемічний інсульт. Етіологія, патогенез, класифікація TOAST, клініка, лікування, показання та протипоказання до тромболітичної терапії."
      },
      {
        pattern: /Хвороба Гентінгтона/i,
        title: "Хвороба Гентінгтона. Етіологія, патогенез, клініка, HL-синдроми, лікування."
      }
    ]
  ],
  [
    20,
    [
      {
        pattern: /Ангіографія судин головного та спинного мозку/i,
        title: "Ангіографія судин головного та спинного мозку. Різновиди. Показання до застосування."
      },
      {
        pattern: /Симптоми ураження скроневої долі/i,
        title: "Симптоми ураження скроневої долі головного мозку."
      },
      {
        pattern: /Бічний аміотрофічний склероз/i,
        title: "Бічний аміотрофічний склероз. Етіологія, діагностичні критерії, клінічний перебіг, шкала ALS-FRS, лікування."
      },
      {
        pattern: /^4\.\s*Злоякісний нейролептичний синдром/i,
        title: "Злоякісний нейролептичний синдром. Діагностика та алгоритм невідкладної допомоги."
      }
    ]
  ],
  [
    23,
    [
      {
        pattern: /^Невралгія трійчастого нерва$/i,
        title: "Неврит і невралгія трійчастого нерва. Диференційна діагностика. Консервативне та хірургічне лікування.",
        includeLineAsBlock: true
      },
      {
        pattern: /^2\s*\.\s*Вторинний головний біль/i,
        title: "Вторинний головний біль, згідно класифікації ICHD-3b."
      },
      {
        pattern: /Фокальна дистонія/i,
        title: "Фокальні дистонії. Класифікація, клініка, методи консервативного та хірургічного лікування.",
        includeLineAsBlock: true
      },
      {
        pattern: /Міастенічний криз/i,
        title: "Міастенічний та холінергічний кризи, диференційна діагностика та алгоритм надання невідкладної допомоги.",
        includeLineAsBlock: true
      }
    ]
  ]
]);

const questionTitleHints = [
  "анатом",
  "аналізатор",
  "афаз",
  "біль",
  "будова",
  "вегетатив",
  "головний біль",
  "діагност",
  "етіолог",
  "класифіка",
  "кліні",
  "кровопостач",
  "лікування",
  "метод",
  "міопат",
  "невропат",
  "порушення",
  "пухлин",
  "синдром",
  "симптом",
  "тактика",
  "ураження",
  "хвороб",
  "черепно"
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    maxBuffer: 1024 * 1024 * 80,
    ...options
  });
}

function readDocxText(filePath) {
  return run("textutil", ["-convert", "txt", "-stdout", filePath], { encoding: "utf8" });
}

function readPdfText(filePath) {
  return run("pdftotext", ["-layout", filePath, "-"], { encoding: "utf8" });
}

function cleanText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/\u2028/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanLine(value) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/^[\s\t]*[•●]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return cleanLine(value)
    .toLowerCase()
    .replace(/ґ/g, "г")
    .replace(/[ʼ’`]/g, "'")
    .replace(/[^a-zа-яіїє0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedTokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 3);
}

function tokenOverlapScore(left, right) {
  const leftTokens = new Set(normalizedTokens(left));
  const rightTokens = new Set(normalizedTokens(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }
  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      matches += 1;
    }
  }
  return matches / Math.min(leftTokens.size, rightTokens.size);
}

function tokenStem(value) {
  const normalized = normalize(value);
  if (normalized.length <= 6) {
    return normalized;
  }
  return normalized.slice(0, 6);
}

function stemOverlapScore(left, right) {
  const leftTokens = new Set(normalizedTokens(left).map(tokenStem));
  const rightTokens = new Set(normalizedTokens(right).map(tokenStem));
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }
  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      matches += 1;
    }
  }
  return matches / Math.min(leftTokens.size, rightTokens.size);
}

function romanToNumber(value) {
  const roman = value.toUpperCase();
  const map = new Map([
    ["I", 1],
    ["II", 2],
    ["III", 3],
    ["IV", 4],
    ["V", 5],
    ["VI", 6]
  ]);
  return map.get(roman) ?? null;
}

function markerNumberToNumber(value) {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  return romanToNumber(value);
}

function parseExamQuestions() {
  const sourcePath = path.join(sourceRoot, "Вопросы_гос_экзамен_исправлено.docx");
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing exam question list: ${sourcePath}`);
  }

  const lines = cleanText(readDocxText(sourcePath))
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  return lines
    .filter((line) => line.length > 20)
    .map((text, index) => ({ number: index + 1, text }));
}

function isLikelyKnownQuestionTitle(candidate, examQuestions) {
  const normalizedCandidate = normalize(candidate);
  if (normalizedCandidate.length < 12) {
    return false;
  }
  const candidateTokens = normalizedTokens(normalizedCandidate);

  for (const question of examQuestions) {
    const normalizedQuestion = normalize(question.text);
    if (
      normalizedQuestion.includes(normalizedCandidate) ||
      (normalizedQuestion.length >= 28 &&
        normalizedCandidate.includes(normalizedQuestion.slice(0, Math.min(70, normalizedQuestion.length))))
    ) {
      return true;
    }
    if (candidateTokens.length >= 4 && tokenOverlapScore(normalizedCandidate, normalizedQuestion) >= 0.78) {
      return true;
    }
  }

  return false;
}

function hasQuestionTitleHint(candidate) {
  const normalizedCandidate = normalize(candidate);
  return questionTitleHints.some((hint) => normalizedCandidate.includes(hint));
}

function isDocumentHeaderLine(line) {
  const cleaned = cleanLine(line);
  return /^(?:МОЗ\s+УКРАЇНИ|Одеськ|Кафедра|Завідувач|д\.\s*мед|професор|Б[ІИ]ЛЕТ\s*(?:№|Nº|No)?\s*\d+)/i.test(
    cleaned
  );
}

function stripTicketTitle(lines) {
  return lines.filter((line, index) => {
    if (index > 12) {
      return true;
    }
    return !isDocumentHeaderLine(line);
  });
}

function stripQuestionMarker(value) {
  return cleanLine(value)
    .replace(/^Питання\s*[0-9IVXLC]+[\.:)]?\s*/i, "")
    .replace(/^[IVX]{1,4}[\.:)]\s*/i, "")
    .replace(/^[1-4][\).]\s*/, "")
    .replace(/^[1-4]\s+/, "")
    .replace(/^[•●]\s*/, "")
    .trim();
}

function normalizeQuestionTitle(value) {
  return cleanLine(value)
    .replace(/^[:\s]+/, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/Компресійно-ішемічні мононевропатіїверхніх/g, "Компресійно-ішемічні мононевропатії верхніх")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlausibleQuestionTitle(candidate, examQuestions) {
  const title = stripQuestionMarker(candidate);
  if (title.length < 12) {
    return false;
  }
  if (/^(?:за\s+(?:методом|об'єктом|об’єктом|шляхом)|центральна нервова система|інфекційні причини|травматичні чинники|судинні причини|пухлини)\b/i.test(title)) {
    return false;
  }
  return (
    isLikelyKnownQuestionTitle(title, examQuestions) ||
    hasQuestionTitleHint(title) ||
    /(?:криз|дистон|деменц|енцефал|головн|паркінсон|міастен|абсцес|свідом|чутлив|рефлекс|ангіограф|нейропат|мієліт|менінгіт|інсульт|гентінгтон|гантінгтон|пет|томограф)/i.test(
      title
    )
  );
}

function lineMatchesTitle(line, title) {
  const candidate = stripQuestionMarker(line);
  const normalizedCandidate = normalize(candidate);
  const normalizedTitle = normalize(title);
  if (!normalizedCandidate || !normalizedTitle) {
    return false;
  }
  if (normalizedCandidate.includes(normalizedTitle) || normalizedTitle.includes(normalizedCandidate)) {
    return true;
  }
  return stemOverlapScore(candidate, title) >= 0.25;
}

function parseQuestionMarker(line, examQuestions, outlineTitles = [], options = {}) {
  const cleaned = cleanLine(line);
  if (!cleaned) {
    return null;
  }
  if (isDocumentHeaderLine(cleaned)) {
    return null;
  }
  if (/^(симптоми ураження|клінічні форми|клінічні прояви|хірургічне лікування|диференційна діагностика|алгоритм невідкладної допомоги):?$/i.test(cleaned)) {
    return null;
  }

  const explicit = cleaned.match(/^Питання\s*([0-9IVXLC]+)[\.:)]?\s*(.+)?$/i);
  const explicitSpaced = cleaned.match(/^Питання\s*([0-9IVXLC]+)\s*[\.:)]\s*(.+)?$/i);
  const explicitMatch = explicitSpaced ?? explicit;
  if (explicitMatch) {
    const number = markerNumberToNumber(explicitMatch[1]);
    return {
      number,
      title: explicitMatch[2]?.trim() || `Питання ${explicitMatch[1]}`,
      includeLineAsBlock: false,
      score: 100
    };
  }

  const roman = cleaned.match(/^([IVX]{1,4})[\.:)]\s*(.+)$/i);
  if (roman) {
    const number = romanToNumber(roman[1]);
    if (number !== null && number >= 1 && number <= 4) {
      return {
        number,
        title: roman[2].trim(),
        includeLineAsBlock: false,
        score: 95
      };
    }
  }

  const parenthesized = cleaned.match(/^([1-9])\)\s*(.+)$/);
  if (parenthesized) {
    const number = Number(parenthesized[1]);
    if (number < 1 || number > 4) {
      return null;
    }
    const title = parenthesized[2].trim();
    if (!isPlausibleQuestionTitle(title, examQuestions) && !options.allowLoose) {
      return null;
    }
    return {
      number,
      title: title.length > 150 ? `Питання ${parenthesized[1]}` : title,
      includeLineAsBlock: title.length > 150,
      score: 90
    };
  }

  const numbered = cleaned.match(/^([1-9])\.\s*(.+)$/);
  if (numbered) {
    const number = Number(numbered[1]);
    if (number < 1 || number > 4) {
      return null;
    }
    const title = numbered[2].trim();
    const known = isLikelyKnownQuestionTitle(title, examQuestions);
    if (known || (options.allowLoose && isPlausibleQuestionTitle(title, examQuestions))) {
      return { number, title, includeLineAsBlock: false, score: known ? 82 : 52 };
    }
  }

  const bareNumbered = cleaned.match(/^([1-4])\s+(.+)$/);
  if (bareNumbered) {
    const number = Number(bareNumbered[1]);
    const title = bareNumbered[2].trim();
    const known = isLikelyKnownQuestionTitle(title, examQuestions);
    if (known || (options.allowLoose && isPlausibleQuestionTitle(title, examQuestions))) {
      return { number, title, includeLineAsBlock: false, score: known ? 78 : 48 };
    }
  }

  const normalizedLine = normalize(cleaned);
  const outlineTitle = outlineTitles.find((title) => {
    return lineMatchesTitle(normalizedLine, title);
  });
  if (outlineTitle) {
    return { number: null, title: outlineTitle, includeLineAsBlock: false, score: 70 };
  }

  if (/^[•●]\s*/.test(line) && isPlausibleQuestionTitle(cleaned, examQuestions)) {
    return { number: null, title: stripQuestionMarker(cleaned), includeLineAsBlock: false, score: 72 };
  }

  return null;
}

function findHeaderOutline(lines, examQuestions) {
  const outline = [];
  const skipIndexes = new Set();

  for (let index = 0; index < Math.min(lines.length, 14); index += 1) {
    const cleaned = cleanLine(lines[index]);
    if (isDocumentHeaderLine(cleaned)) {
      skipIndexes.add(index);
      continue;
    }
    const numbered = cleaned.match(/^([1-4])[\.)]?\s+(.+)$/);
    const bullet = cleaned.match(/^[•●]\s*(.+)$/);
    const match = numbered ?? (bullet ? [cleaned, String(outline.length + 1), bullet[1]] : null);
    if (!match) {
      if (outline.length > 0) {
        break;
      }
      continue;
    }
    const number = Number(match[1]);
    const title = match[2].trim();
    if (number !== outline.length + 1 || !isPlausibleQuestionTitle(title, examQuestions)) {
      break;
    }
    outline.push(title);
    skipIndexes.add(index);
  }

  if (outline.length !== 4) {
    return { titles: [], skipIndexes: new Set() };
  }

  return { titles: outline, skipIndexes };
}

function firstContentIndexAfterOutline(lines, skipIndexes) {
  const lastOutlineIndex = skipIndexes.size > 0 ? Math.max(...skipIndexes) : -1;
  for (let index = lastOutlineIndex + 1; index < lines.length; index += 1) {
    if (!isDocumentHeaderLine(lines[index])) {
      return index;
    }
  }
  return Math.max(0, lastOutlineIndex + 1);
}

function findStartsFromHeaderOutline(lines, outlineTitles, skipIndexes) {
  const starts = [];
  let searchFrom = firstContentIndexAfterOutline(lines, skipIndexes);

  for (let orderIndex = 0; orderIndex < outlineTitles.length; orderIndex += 1) {
    const title = outlineTitles[orderIndex];
    let foundIndex = -1;
    for (let index = searchFrom; index < lines.length; index += 1) {
      if (skipIndexes.has(index) || isDocumentHeaderLine(lines[index])) {
        continue;
      }
      if (lineMatchesTitle(lines[index], title)) {
        foundIndex = index;
        break;
      }
    }
    if (foundIndex < 0) {
      foundIndex = orderIndex === 0 ? searchFrom : starts[orderIndex - 1].index + 1;
    }
    starts.push({
      index: foundIndex,
      number: orderIndex + 1,
      title,
      includeLineAsBlock: !lineMatchesTitle(lines[foundIndex] ?? "", title)
    });
    searchFrom = foundIndex + 1;
  }

  return starts;
}

function selectSequentialStarts(candidates, lines) {
  const starts = [];
  let previousIndex = -1;

  for (let expected = 1; expected <= 4; expected += 1) {
    let matches = candidates
      .filter((candidate) => candidate.number === expected && candidate.index > previousIndex)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.index - right.index;
      });
    if (matches.length === 0) {
      matches = candidates
        .filter(
          (candidate) =>
            candidate.number === null &&
            candidate.index > previousIndex &&
            !starts.some((start) => start.index === candidate.index)
        )
        .sort((left, right) => left.index - right.index);
    }
    const selected = matches[0];
    if (!selected) {
      continue;
    }
    starts.push({ ...selected, number: expected });
    previousIndex = selected.index;
  }

  if (starts.length === 4) {
    return starts;
  }

  const loose = candidates
    .filter((candidate) => candidate.number === null)
    .sort((left, right) => left.index - right.index);
  for (const candidate of loose) {
    if (starts.some((start) => start.index === candidate.index)) {
      continue;
    }
    if (starts.length === 0 || candidate.index > starts.at(-1).index) {
      starts.push({ ...candidate, number: starts.length + 1 });
    }
    if (starts.length === 4) {
      return starts;
    }
  }

  if (starts.length === 0) {
    return [{ index: 0, number: 1, title: `Питання 1`, includeLineAsBlock: true, score: 0 }];
  }

  return starts;
}

function findOverrideStarts(lines, ticketNumber) {
  const overrides = ticketQuestionStartOverrides.get(ticketNumber);
  if (!overrides) {
    return null;
  }

  const starts = [];
  let searchFrom = 0;
  for (let index = 0; index < overrides.length; index += 1) {
    const override = overrides[index];
    let seen = 0;
    const foundIndex = lines.findIndex((line, lineIndex) => {
      if (lineIndex < searchFrom || !override.pattern.test(cleanLine(line))) {
        return false;
      }
      seen += 1;
      return seen === (override.occurrence ?? 1);
    });
    if (foundIndex < 0) {
      throw new Error(`Unable to find ticket ${ticketNumber} question override ${index + 1}: ${override.pattern}`);
    }
    starts.push({
      index: foundIndex,
      number: index + 1,
      title: override.title,
      includeLineAsBlock: override.includeLineAsBlock ?? false,
      score: 1000
    });
    searchFrom = foundIndex + 1;
  }

  return starts;
}

function classifyBlock(line) {
  const cleaned = cleanLine(line);
  if (/^([•●-]|\d+[\).])\s*/.test(line.trim()) || /^([•●-]|\d+[\).])\s*/.test(cleaned)) {
    return "list_item";
  }
  if (
    cleaned.length <= 96 &&
    (cleaned.endsWith(":") ||
      (/^[А-ЯІЇЄҐA-Z]/.test(cleaned) && !/[.!?…]$/.test(cleaned) && !cleaned.includes(" — ")))
  ) {
    return "heading";
  }
  return "paragraph";
}

function parseQuestionsFromText(text, ticketNumber, examQuestions) {
  const lines = stripTicketTitle(
    cleanText(text)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  );
  const { titles: outlineTitles, skipIndexes } = findHeaderOutline(lines, examQuestions);
  const starts =
    findOverrideStarts(lines, ticketNumber) ??
    (outlineTitles.length === 4
      ? findStartsFromHeaderOutline(lines, outlineTitles, skipIndexes)
      : selectSequentialStarts(
          lines
            .map((line, index) => {
              const marker = parseQuestionMarker(line, examQuestions, [], {
                allowLoose: true
              });
              return marker ? { index, ...marker } : null;
            })
            .filter(Boolean),
          lines
        ));

  return starts.map((start, orderIndex) => {
    const end = starts[orderIndex + 1]?.index ?? lines.length;
    const chunkLines = lines.slice(start.index, end).filter((_, offset) => {
      const absoluteIndex = start.index + offset;
      if (skipIndexes.has(absoluteIndex)) {
        return false;
      }
      return offset !== 0 || start.includeLineAsBlock;
    });

    const blocks = chunkLines
      .map((rawLine) => ({
        rawLine,
        text: cleanLine(rawLine)
      }))
      .filter(({ text }) => Boolean(text))
      .map(({ rawLine, text }, blockIndex) => ({
        id: `ticket-${String(ticketNumber).padStart(2, "0")}-q-${String(orderIndex + 1).padStart(2, "0")}-b-${String(blockIndex + 1).padStart(3, "0")}`,
        type: classifyBlock(rawLine),
        text
      }));

    return {
      id: `ticket-${String(ticketNumber).padStart(2, "0")}-q-${String(orderIndex + 1).padStart(2, "0")}`,
      ticketNumber,
      number: orderIndex + 1,
      title: normalizeQuestionTitle(start.title) || `Питання ${orderIndex + 1}`,
      blocks,
      media: []
    };
  });
}

function xmlDecode(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function readZipEntry(filePath, entryName, encoding = "utf8") {
  try {
    return run("unzip", ["-p", filePath, entryName], { encoding });
  } catch {
    return encoding === "buffer" ? Buffer.from("") : "";
  }
}

function listZipEntries(filePath) {
  return run("unzip", ["-Z1", filePath], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseRelationships(relsXml) {
  const rels = new Map();
  for (const match of relsXml.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    rels.set(match[1], match[2].replace(/^\.\.\//, ""));
  }
  return rels;
}

function extractTextFromParagraphXml(xml) {
  const pieces = [];
  for (const match of xml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)) {
    pieces.push(xmlDecode(match[1]));
  }
  return cleanLine(pieces.join(" "));
}

function extractMediaTargetsFromParagraphXml(xml, rels) {
  const targets = [];
  for (const match of xml.matchAll(/r:embed="([^"]+)"/g)) {
    const target = rels.get(match[1]);
    if (target?.startsWith("media/")) {
      targets.push(`word/${target}`);
    }
  }
  return targets;
}

function getImageDimensions(buffer, extension) {
  const ext = extension.toLowerCase();
  if (ext === ".png" && buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if ((ext === ".jpg" || ext === ".jpeg") && buffer.length > 4) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7)
        };
      }
      offset += 2 + length;
    }
  }
  return { width: 1200, height: 900 };
}

function extractDocxMedia(filePath, ticketNumber, questions, examQuestions) {
  const entries = listZipEntries(filePath).filter((entry) => entry.startsWith("word/media/"));
  if (entries.length === 0) {
    return { assigned: new Map(), gallery: [] };
  }

  const ticketPublicDir = path.join(publicTicketRoot, `ticket-${String(ticketNumber).padStart(2, "0")}`);
  fs.mkdirSync(ticketPublicDir, { recursive: true });

  const mediaByEntry = new Map();
  entries.forEach((entry, index) => {
    const extension = path.extname(entry).toLowerCase() || ".png";
    const buffer = readZipEntry(filePath, entry, "buffer");
    const dimensions = getImageDimensions(buffer, extension);
    if (dimensions.width <= 4 || dimensions.height <= 4) {
      return;
    }
    const fileName = `media-${String(index + 1).padStart(2, "0")}${extension}`;
    const outputPath = path.join(ticketPublicDir, fileName);
    fs.writeFileSync(outputPath, buffer);
    mediaByEntry.set(entry, {
      id: `ticket-${String(ticketNumber).padStart(2, "0")}-media-${String(index + 1).padStart(2, "0")}`,
      src: `/exam/tickets/ticket-${String(ticketNumber).padStart(2, "0")}/${fileName}`,
      alt: `Зображення з білета № ${ticketNumber}`,
      width: dimensions.width,
      height: dimensions.height,
      sourceFile: path.basename(filePath),
      sourceName: path.basename(entry)
    });
  });

  const relsXml = readZipEntry(filePath, "word/_rels/document.xml.rels");
  const documentXml = readZipEntry(filePath, "word/document.xml");
  const rels = parseRelationships(relsXml);
  const paragraphs = [...documentXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((match) => ({
    text: extractTextFromParagraphXml(match[0]),
    targets: extractMediaTargetsFromParagraphXml(match[0], rels)
  }));

  const assigned = new Map();
  const usedEntries = new Set();
  let currentQuestionIndex = -1;
  for (const paragraph of paragraphs) {
    const marker = parseQuestionMarker(paragraph.text, examQuestions, questions.map((question) => question.title));
    if (marker) {
      const foundIndex = questions.findIndex((question) => normalize(question.title) === normalize(marker.title));
      currentQuestionIndex = foundIndex >= 0 ? foundIndex : Math.min(currentQuestionIndex + 1, questions.length - 1);
    }
    if (paragraph.targets.length > 0 && currentQuestionIndex >= 0) {
      for (const target of paragraph.targets) {
        const media = mediaByEntry.get(target);
        if (!media) {
          continue;
        }
        const list = assigned.get(currentQuestionIndex) ?? [];
        list.push(media);
        assigned.set(currentQuestionIndex, list);
        usedEntries.add(target);
      }
    }
  }

  const gallery = [...mediaByEntry.entries()]
    .filter(([entry]) => !usedEntries.has(entry))
    .map(([, media]) => media);

  const mediaOverrides = ticketMediaQuestionOverrides.get(ticketNumber);
  if (mediaOverrides) {
    const allMedia = [
      ...gallery,
      ...[...assigned.values()].flat()
    ];
    for (const media of allMedia) {
      const questionNumber = mediaOverrides.get(media.sourceName);
      if (!questionNumber) {
        continue;
      }
      for (const [questionIndex, list] of assigned.entries()) {
        assigned.set(
          questionIndex,
          list.filter((item) => item.id !== media.id)
        );
      }
      const galleryIndex = gallery.findIndex((item) => item.id === media.id);
      if (galleryIndex >= 0) {
        gallery.splice(galleryIndex, 1);
      }
      const questionIndex = questionNumber - 1;
      const list = assigned.get(questionIndex) ?? [];
      if (!list.some((item) => item.id === media.id)) {
        list.push(media);
      }
      assigned.set(questionIndex, list);
    }
  }

  return { assigned, gallery };
}

function findTicketSources() {
  return fs
    .readdirSync(sourceRoot)
    .filter((fileName) => /б[іи]лет/i.test(fileName) && /\.(docx|pdf)$/i.test(fileName))
    .map((fileName) => {
      const match = fileName.match(/№\s*(\d+)/i);
      if (!match) {
        throw new Error(`Unable to find ticket number in ${fileName}`);
      }
      return {
        number: Number(match[1]),
        fileName,
        filePath: path.join(sourceRoot, fileName),
        sourceType: fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "docx"
      };
    })
    .sort((left, right) => left.number - right.number);
}

function parseTicket(source, examQuestions) {
  const text = source.sourceType === "pdf" ? readPdfText(source.filePath) : readDocxText(source.filePath);
  const questions = parseQuestionsFromText(text, source.number, examQuestions);
  let gallery = [];

  if (source.sourceType === "docx") {
    const media = extractDocxMedia(source.filePath, source.number, questions, examQuestions);
    for (const [questionIndex, items] of media.assigned.entries()) {
      questions[questionIndex].media = items;
    }
    gallery = media.gallery;
  }

  return {
    id: `ticket-${String(source.number).padStart(2, "0")}`,
    number: source.number,
    title: `Білет № ${source.number}`,
    sourceFile: source.fileName,
    sourceType: source.sourceType,
    questions,
    gallery
  };
}

function writeTsFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

const examQuestions = parseExamQuestions();
const ticketSources = findTicketSources();
if (ticketSources.length !== 23) {
  throw new Error(`Expected 23 ticket sources, got ${ticketSources.length}`);
}

fs.rmSync(publicTicketRoot, { recursive: true, force: true });
fs.mkdirSync(publicTicketRoot, { recursive: true });

const tickets = ticketSources.map((source) => parseTicket(source, examQuestions));
const missingQuestions = examQuestions
  .filter((question) => confirmedMissingQuestionNumbers.has(question.number))
  .map((question) => ({
    ...question,
    reason: "Не знайдено як самостійне питання у 23 наданих білетах."
  }));

writeTsFile(
  generatedPath,
  `import type { ExamTicket } from "./schema";

// Generated by scripts/import-exam-tickets.mjs. Do not edit by hand.
export const examTickets = ${JSON.stringify(tickets, null, 2)} satisfies ExamTicket[];
`
);

writeTsFile(
  coveragePath,
  `import type { ExamQuestion, MissingExamQuestion } from "./schema";

// Generated by scripts/import-exam-tickets.mjs. Do not edit by hand.
export const examQuestions = ${JSON.stringify(examQuestions, null, 2)} satisfies ExamQuestion[];

export const missingExamQuestions = ${JSON.stringify(missingQuestions, null, 2)} satisfies MissingExamQuestion[];
`
);

const mediaCount = tickets.reduce(
  (sum, ticket) =>
    sum +
    ticket.gallery.length +
    ticket.questions.reduce((questionSum, question) => questionSum + question.media.length, 0),
  0
);

console.log(
  `Imported ${tickets.length} tickets, ${examQuestions.length} exam questions, ${missingQuestions.length} missing questions, ${mediaCount} media assets.`
);
