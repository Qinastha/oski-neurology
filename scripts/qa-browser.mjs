import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = "/private/tmp/osce-neurology-site-qa";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];
const generatedKrokSource = readFileSync(
  path.join(process.cwd(), "src/content/krok/generated.ts"),
  "utf8"
);
const answerOverridesSource = readFileSync(
  path.join(process.cwd(), "src/content/krok/answer-overrides.ts"),
  "utf8"
);
const trainingKrokSource = readFileSync(
  path.join(process.cwd(), "src/content/krok/training.ts"),
  "utf8"
);
const generatedKrokPrefix = "export const krokBooklets = ";
const generatedKrokJson = generatedKrokSource
  .slice(generatedKrokSource.indexOf(generatedKrokPrefix) + generatedKrokPrefix.length)
  .replace(/\s+satisfies KrokBooklet\[];\s*$/, "");
const trainingKrokPrefix = "export const krokTrainingBooklets = ";
const trainingKrokJson = trainingKrokSource
  .slice(trainingKrokSource.indexOf(trainingKrokPrefix) + trainingKrokPrefix.length)
  .replace(/\s+satisfies KrokTrainingBooklet\[];\s*$/, "");
function parseAnswerOverrides(source) {
  const plainPrefix = "export const krokAnswerOverrides = ";
  const typedPrefix = "export const krokAnswerOverrides: KrokAnswerOverride[] = ";
  const plainStart = source.indexOf(plainPrefix);
  const typedStart = source.indexOf(typedPrefix);
  const prefix = plainStart >= 0 ? plainPrefix : typedPrefix;
  const start = plainStart >= 0 ? plainStart : typedStart;
  if (start < 0) {
    return [];
  }
  return JSON.parse(
    source
      .slice(start + prefix.length, source.lastIndexOf(";"))
      .replace(/\s+satisfies KrokAnswerOverride\[]\s*$/, "")
  );
}
const krokCorrectOptionByQuestionId = new Map();

for (const booklet of JSON.parse(generatedKrokJson)) {
  for (const question of booklet.questions) {
    krokCorrectOptionByQuestionId.set(question.id, question.correctOptionId);
  }
}
for (const booklet of JSON.parse(trainingKrokJson)) {
  for (const question of booklet.questions) {
    krokCorrectOptionByQuestionId.set(question.id, question.correctOptionId);
  }
}
for (const override of parseAnswerOverrides(answerOverridesSource)) {
  krokCorrectOptionByQuestionId.set(override.questionId, override.correctOptionId);
}

function getCorrectOptionId(questionId) {
  const optionId = krokCorrectOptionByQuestionId.get(questionId);
  if (!optionId) {
    throw new Error(`No KROK correct option found for ${questionId}`);
  }
  return optionId;
}

async function inspect(name, url, viewport, selector) {
  const page = await browser.newPage({ viewport });
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`[console:${message.type()}] ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`[pageerror] ${error.message}`));

  if (name.includes("krok")) {
    await page.context().clearCookies();
  }

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(selector, { timeout: 15000 });

  const metrics = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    tableCount: document.querySelectorAll("table").length,
    caseCards: document.querySelectorAll(".case-card").length,
    checklistCards: document.querySelectorAll(".check-step").length,
    imageCards: document.querySelectorAll(".image-grid figure").length,
    mobileTabs: document.querySelectorAll(".mobile-tabbar a, .mobile-tabbar button").length,
    krokStartCards: document.querySelectorAll("[data-krok-start-card]").length,
    krokQuestionCards: document.querySelectorAll("[data-krok-question-card]").length,
    krokResultPanels: document.querySelectorAll('[data-krok-result="summary"]').length,
    krokMobileNavigatorItems: document.querySelectorAll("[data-krok-mobile-question-link]").length,
    practicalSkillCards: document.querySelectorAll("[data-blueprint-practical-skills='list'] article")
      .length
  }));

  const interactions = {};

  if (name === "desktop-cases") {
    interactions.initialActive = await page.locator('aside [data-filter="all"][aria-pressed="true"]').count();
    interactions.searchAdjacentButtons = await page.locator('[data-search-shell="query"] button').count();

    await page.locator('aside [data-filter="non-imaging"]').click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 15, {
      timeout: 5000
    });
    interactions.nonImagingCards = await page.locator(".case-card").count();
    interactions.nonImagingActive = await page
      .locator('aside [data-filter="non-imaging"][aria-pressed="true"]')
      .count();

    await page.locator('aside [data-filter="imaging"]').click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 5, {
      timeout: 5000
    });
    interactions.imagingCards = await page.locator(".case-card").count();
    interactions.imagingActive = await page
      .locator('aside [data-filter="imaging"][aria-pressed="true"]')
      .count();

    await page.locator('aside [data-filter="all"]').click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 20, {
      timeout: 5000
    });

    const searchInput = page.getByPlaceholder("Пошук станцій, синдромів, ключових слів...");
    await searchInput.fill("Mini-Cog");
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 1, {
      timeout: 5000
    });
    interactions.searchCards = await page.locator(".case-card").count();
    interactions.searchText = await page.locator(".case-list").innerText();
    await searchInput.fill("");
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 20, {
      timeout: 5000
    });
  }

  if (name === "desktop-stroke") {
    interactions.blueprintSections = await page.locator('[data-station-blueprint="stroke-ct-mca"]').count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
    interactions.originalFiguresBefore = await page.locator('[data-media-figure="original"]').count();
    await page.getByText("Показати сторінки завдання").click();
    await page.waitForSelector('[data-media-figure="original"]', { timeout: 5000 });
    interactions.originalFiguresAfter = await page.locator('[data-media-figure="original"]').count();

    await page.locator('[data-image-open="scan"]').first().click();
    await page.waitForSelector('[data-image-lightbox="open"]', { timeout: 5000 });
    interactions.scanLightboxOpen = await page.locator('[data-image-lightbox="open"]').count();
    await page.locator('[data-image-lightbox-close="button"]').click();
    await page.waitForSelector('[data-image-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });

    interactions.expandedBefore = await page.locator('.check-step button[aria-expanded="true"]').count();
    await page.locator('.check-step button[aria-expanded="false"]').first().click();
    await page.waitForFunction(() => {
      return document.querySelectorAll('.check-step button[aria-expanded="true"]').length === 4;
    });
    interactions.expandedAfter = await page.locator('.check-step button[aria-expanded="true"]').count();
  }

  if (name === "desktop-dementia") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="dementia-mini-cog"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-radiculopathy") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="radiculopathy-topic"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-trigeminal-neuralgia") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="trigeminal-neuralgia-sensory"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-neurosyphilis") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="neurosyphilis-vibration"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-msa-orthostatic") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="msa-orthostatic"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-bppv-dix-hallpike") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="bppv-dix-hallpike"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
    interactions.visibleDeckReferences = await page.getByText("ОСКИ.pptx").count();
    interactions.legacyDixHallpikeSteps = await page.getByText("Як виконати Dix-Hallpike").count();
  }

  if (name === "desktop-bppv-epley") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="bppv-epley"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-hearing-rinne-weber") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="hearing-rinne-weber"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-parkinson-gait-thevenard") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="parkinson-gait-thevenard"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-cauda-equina") {
    interactions.blueprintSections = await page.locator('[data-station-blueprint="cauda-equina"]').count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-trigeminal-sensory") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="trigeminal-sensory"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-weber-syndrome") {
    interactions.blueprintSections = await page.locator('[data-station-blueprint="weber-syndrome"]').count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-parietal-tumor-stereognosis") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="parietal-tumor-stereognosis"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-ulnar-neuropathy-cubital") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="ulnar-neuropathy-cubital"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-cerebellar-ataxia") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="cerebellar-ataxia"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
  }

  if (name === "desktop-glioma-dislocation") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="glioma-dislocation"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
    await page.locator('[data-image-open="scan"]').first().click();
    await page.waitForSelector('[data-image-lightbox="open"]', { timeout: 5000 });
    interactions.scanLightboxOpen = await page.locator('[data-image-lightbox="open"]').count();
    await page.locator('[data-image-lightbox-close="button"]').click();
    await page.waitForSelector('[data-image-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });
  }

  if (name === "desktop-multiple-sclerosis-mri") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="multiple-sclerosis-mri"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
    await page.locator('[data-image-open="scan"]').first().click();
    await page.waitForSelector('[data-image-lightbox="open"]', { timeout: 5000 });
    interactions.scanLightboxOpen = await page.locator('[data-image-lightbox="open"]').count();
    await page.locator('[data-image-lightbox-close="button"]').click();
    await page.waitForSelector('[data-image-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });
  }

  if (name === "desktop-als-mri") {
    interactions.blueprintSections = await page.locator('[data-station-blueprint="als-mri"]').count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
    await page.locator('[data-image-open="scan"]').first().click();
    await page.waitForSelector('[data-image-lightbox="open"]', { timeout: 5000 });
    interactions.scanLightboxOpen = await page.locator('[data-image-lightbox="open"]').count();
    await page.locator('[data-image-lightbox-close="button"]').click();
    await page.waitForSelector('[data-image-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });
  }

  if (name === "desktop-cervical-myelopathy-mri") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="cervical-myelopathy-mri"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("перевірено").count();
    await page.locator('[data-image-open="scan"]').first().click();
    await page.waitForSelector('[data-image-lightbox="open"]', { timeout: 5000 });
    interactions.scanLightboxOpen = await page.locator('[data-image-lightbox="open"]').count();
    await page.locator('[data-image-lightbox-close="button"]').click();
    await page.waitForSelector('[data-image-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });
  }

  if (name === "mobile-stroke") {
    await page.locator('[data-image-open="scan"]').first().click();
    await page.waitForSelector('[data-image-lightbox="open"]', { timeout: 5000 });
    interactions.mobileLightboxOpen = await page.locator('[data-image-lightbox="open"]').count();
    await page.locator('[data-image-lightbox-close="button"]').click();
    await page.waitForSelector('[data-image-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });

    interactions.topMenuTriggers = await page.locator('[data-mobile-menu-trigger="top"]').count();
    interactions.bottomMenuTriggers = await page.locator('[data-mobile-menu-trigger="bottom"]').count();

    await page.locator('[data-mobile-menu-trigger="top"]').click();
    await page.waitForSelector('[data-mobile-case-menu="open"]', { timeout: 5000 });
    interactions.openedFromTop = await page.locator('[data-mobile-case-menu="open"]').count();
    await page.locator('[data-mobile-menu-close="button"]').click();
    await page.waitForSelector('[data-mobile-case-menu="open"]', {
      state: "detached",
      timeout: 5000
    });

    await page.locator('[data-mobile-menu-trigger="bottom"]').click();
    await page.waitForSelector('[data-mobile-case-menu="open"]', { timeout: 5000 });
    interactions.openedFromBottom = await page.locator('[data-mobile-case-menu="open"]').count();
    interactions.menuLinks = await page.locator('[data-mobile-case-menu="open"] nav a').count();
  }

  if (name === "desktop-krok") {
    interactions.startCards = await page.locator("[data-krok-start-card]").count();

    await page.locator('[data-krok-start-card="2026"] [data-krok-start-mode="ordered"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("[data-krok-question-card]").length === 150, {
      timeout: 15000
    });
    interactions.orderedCards = await page.locator("[data-krok-question-card]").count();
    interactions.orderedFirstBooklet = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-booklet-id");
    interactions.orderedFirstSourceNumber = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-source-number");
    interactions.orderedFirstThreeIds = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) => cards.slice(0, 3).map((card) => card.getAttribute("data-krok-question-card")));
    interactions.orderedHasShuffledOptions = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) =>
        cards
          .slice(0, 10)
          .some((card) => !card.querySelector("[data-krok-option]")?.getAttribute("data-krok-option")?.endsWith("-a"))
      );

    await page.locator("[data-krok-question-card]").first().locator("[data-krok-option]").first().click();
    interactions.legacyAnswerFeedback = await page
      .locator("[data-krok-question-card]")
      .first()
      .getByText("Правильна відповідь:")
      .count();
    interactions.answerExplanation = await page
      .locator("[data-krok-question-card]")
      .first()
      .locator("[data-krok-answer-explanation]")
      .count();
    await page.locator("[data-krok-explanation-toggle]").first().click();
    interactions.answerExplanationHidden = await page
      .locator("[data-krok-question-card]")
      .first()
      .locator("[data-krok-answer-explanation]")
      .count();
    await page.locator("[data-krok-explanation-toggle]").first().click();
    interactions.answerExplanationRestored = await page
      .locator("[data-krok-question-card]")
      .first()
      .locator("[data-krok-answer-explanation]")
      .count();

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('[data-krok-resume="active"]', { timeout: 15000 });
    interactions.resumeCard = await page.locator('[data-krok-resume="active"]').count();
    await page.locator('[data-krok-resume-action="continue"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    interactions.orderedFirstThreeAfterReload = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) => cards.slice(0, 3).map((card) => card.getAttribute("data-krok-question-card")));

    await page.context().clearCookies();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-krok-page="start"]', { timeout: 15000 });
    await page.locator('[data-krok-start-card="2025"] [data-krok-start-mode="shuffled"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("[data-krok-question-card]").length === 150, {
      timeout: 15000
    });
    interactions.shuffledFirstFiveSources = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) =>
        cards.slice(0, 5).map((card) => card.getAttribute("data-krok-source-number"))
      );
    interactions.shuffledFirstFiveIds = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) => cards.slice(0, 5).map((card) => card.getAttribute("data-krok-question-card")));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('[data-krok-resume="active"]', { timeout: 15000 });
    await page.locator('[data-krok-resume-action="continue"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    interactions.shuffledFirstFiveAfterReload = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) => cards.slice(0, 5).map((card) => card.getAttribute("data-krok-question-card")));

    await page.context().clearCookies();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-krok-page="start"]', { timeout: 15000 });
    await page.locator('[data-krok-start-card="random"] [data-krok-start-mode="shuffled"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("[data-krok-question-card]").length === 150, {
      timeout: 15000
    });
    const randomIds = await page
      .locator("[data-krok-question-card]")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-krok-question-card")));
    interactions.randomCards = randomIds.length;
    interactions.randomUniqueCards = new Set(randomIds).size;
    interactions.randomYears = new Set(randomIds.map((id) => id?.slice(0, 4))).size;
    interactions.randomTrainingCards = randomIds.filter((id) => id?.startsWith("ai-")).length;
    interactions.randomFirstId = randomIds[0];

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('[data-krok-resume="active"]', { timeout: 15000 });
    await page.locator('[data-krok-resume-action="continue"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    interactions.randomFirstIdAfterReload = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-question-card");

    const firstRandomQuestionId = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-question-card");
    if (!firstRandomQuestionId) {
      throw new Error("No first random KROK question found");
    }
    const firstRandomCorrectOptionId = getCorrectOptionId(firstRandomQuestionId);
    await page
      .locator(
        `[data-krok-question-card="${firstRandomQuestionId}"] [data-krok-option="${firstRandomCorrectOptionId}"]`
      )
      .click();
    await page.getByRole("button", { name: "Завершити тест" }).click();
    await page.waitForSelector('[data-krok-result="summary"]', { timeout: 15000 });
    interactions.finishResultPanels = await page.locator('[data-krok-result="summary"]').count();
    interactions.finishText = await page.locator('[data-krok-result="summary"]').innerText();
    await page.locator('[data-krok-result="summary"] button').click();
    await page.waitForSelector('[data-krok-page="start"]', { timeout: 15000 });
    interactions.restartStartCards = await page.locator("[data-krok-start-card]").count();

    await page.locator('[data-krok-start-card="ai-002"] [data-krok-start-mode="ordered"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("[data-krok-question-card]").length === 150, {
      timeout: 15000
    });
    interactions.trainingCards = await page.locator("[data-krok-question-card]").count();
    interactions.trainingFirstBooklet = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-booklet-id");
    const firstTrainingQuestionId = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-question-card");
    if (!firstTrainingQuestionId) {
      throw new Error("No first training KROK question found");
    }
    const firstTrainingCorrectOptionId = getCorrectOptionId(firstTrainingQuestionId);
    await page
      .locator(
        `[data-krok-question-card="${firstTrainingQuestionId}"] [data-krok-option="${firstTrainingCorrectOptionId}"]`
      )
      .click();
    interactions.trainingExplanation = await page
      .locator("[data-krok-question-card]")
      .first()
      .locator("[data-krok-answer-explanation]")
      .count();
  }

  if (name === "mobile-krok") {
    interactions.startCards = await page.locator("[data-krok-start-card]").count();
    await page.locator('[data-krok-start-card="2024"] [data-krok-start-mode="ordered"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("[data-krok-question-card]").length === 150, {
      timeout: 15000
    });
    interactions.questionCards = await page.locator("[data-krok-question-card]").count();
    interactions.bottomBar = await page.locator('[data-krok-mobile-bar="summary"]').count();
    interactions.mobilePanelClosedInitially = await page.locator('[data-krok-mobile-panel="open"]').count();
    interactions.bottomStatusBefore = await page.locator('[data-krok-mobile-bar="summary"]').innerText();
    const firstMobileQuestionId = await page
      .locator("[data-krok-question-card]")
      .first()
      .getAttribute("data-krok-question-card");
    if (!firstMobileQuestionId) {
      throw new Error("No first mobile KROK question found");
    }
    const firstMobileCorrectOptionId = getCorrectOptionId(firstMobileQuestionId);
    await page
      .locator(
        `[data-krok-question-card="${firstMobileQuestionId}"] [data-krok-option="${firstMobileCorrectOptionId}"]`
      )
      .click();
    interactions.bottomStatusAfterAnswer = await page.locator('[data-krok-mobile-bar="summary"]').innerText();
    await page.locator('[data-krok-mobile-panel-trigger="button"]').click();
    await page.waitForSelector('[data-krok-mobile-panel="open"]', { timeout: 5000 });
    interactions.mobilePanelOpen = await page.locator('[data-krok-mobile-panel="open"]').count();
    interactions.mobilePanelFilters = await page.locator("[data-krok-mobile-filter]").count();
    interactions.mobileNavigatorItems = await page.locator("[data-krok-mobile-question-link]").count();
    interactions.bottomFinishButtons = await page.getByRole("button", { name: "Завершити" }).count();
  }

  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await page.close();

  results.push({ name, url, viewport, metrics, interactions, problems, screenshotPath });
}

await inspect("desktop-cases", "http://127.0.0.1:3000/cases", { width: 1440, height: 900 }, ".case-list");
await inspect(
  "desktop-krok",
  "http://127.0.0.1:3000/krok",
  { width: 1440, height: 900 },
  '[data-krok-page="start"]'
);
await inspect(
  "desktop-dementia",
  "http://127.0.0.1:3000/cases/dementia-mini-cog",
  { width: 1440, height: 900 },
  '[data-station-blueprint="dementia-mini-cog"]'
);
await inspect(
  "desktop-radiculopathy",
  "http://127.0.0.1:3000/cases/radiculopathy-topic",
  { width: 1440, height: 900 },
  '[data-station-blueprint="radiculopathy-topic"]'
);
await inspect(
  "desktop-trigeminal-neuralgia",
  "http://127.0.0.1:3000/cases/trigeminal-neuralgia-sensory",
  { width: 1440, height: 900 },
  '[data-station-blueprint="trigeminal-neuralgia-sensory"]'
);
await inspect(
  "desktop-neurosyphilis",
  "http://127.0.0.1:3000/cases/neurosyphilis-vibration",
  { width: 1440, height: 900 },
  '[data-station-blueprint="neurosyphilis-vibration"]'
);
await inspect(
  "desktop-msa-orthostatic",
  "http://127.0.0.1:3000/cases/msa-orthostatic",
  { width: 1440, height: 900 },
  '[data-station-blueprint="msa-orthostatic"]'
);
await inspect(
  "desktop-bppv-dix-hallpike",
  "http://127.0.0.1:3000/cases/bppv-dix-hallpike",
  { width: 1440, height: 900 },
  '[data-station-blueprint="bppv-dix-hallpike"]'
);
await inspect(
  "desktop-bppv-epley",
  "http://127.0.0.1:3000/cases/bppv-epley",
  { width: 1440, height: 900 },
  '[data-station-blueprint="bppv-epley"]'
);
await inspect(
  "desktop-hearing-rinne-weber",
  "http://127.0.0.1:3000/cases/hearing-rinne-weber",
  { width: 1440, height: 900 },
  '[data-station-blueprint="hearing-rinne-weber"]'
);
await inspect(
  "desktop-parkinson-gait-thevenard",
  "http://127.0.0.1:3000/cases/parkinson-gait-thevenard",
  { width: 1440, height: 900 },
  '[data-station-blueprint="parkinson-gait-thevenard"]'
);
await inspect(
  "desktop-cauda-equina",
  "http://127.0.0.1:3000/cases/cauda-equina",
  { width: 1440, height: 900 },
  '[data-station-blueprint="cauda-equina"]'
);
await inspect(
  "desktop-trigeminal-sensory",
  "http://127.0.0.1:3000/cases/trigeminal-sensory",
  { width: 1440, height: 900 },
  '[data-station-blueprint="trigeminal-sensory"]'
);
await inspect(
  "desktop-weber-syndrome",
  "http://127.0.0.1:3000/cases/weber-syndrome",
  { width: 1440, height: 900 },
  '[data-station-blueprint="weber-syndrome"]'
);
await inspect(
  "desktop-parietal-tumor-stereognosis",
  "http://127.0.0.1:3000/cases/parietal-tumor-stereognosis",
  { width: 1440, height: 900 },
  '[data-station-blueprint="parietal-tumor-stereognosis"]'
);
await inspect(
  "desktop-ulnar-neuropathy-cubital",
  "http://127.0.0.1:3000/cases/ulnar-neuropathy-cubital",
  { width: 1440, height: 900 },
  '[data-station-blueprint="ulnar-neuropathy-cubital"]'
);
await inspect(
  "desktop-cerebellar-ataxia",
  "http://127.0.0.1:3000/cases/cerebellar-ataxia",
  { width: 1440, height: 900 },
  '[data-station-blueprint="cerebellar-ataxia"]'
);
await inspect(
  "desktop-stroke",
  "http://127.0.0.1:3000/cases/stroke-ct-mca",
  { width: 1440, height: 900 },
  ".check-step"
);
await inspect(
  "desktop-glioma-dislocation",
  "http://127.0.0.1:3000/cases/glioma-dislocation",
  { width: 1440, height: 900 },
  '[data-station-blueprint="glioma-dislocation"]'
);
await inspect(
  "desktop-multiple-sclerosis-mri",
  "http://127.0.0.1:3000/cases/multiple-sclerosis-mri",
  { width: 1440, height: 900 },
  '[data-station-blueprint="multiple-sclerosis-mri"]'
);
await inspect(
  "desktop-als-mri",
  "http://127.0.0.1:3000/cases/als-mri",
  { width: 1440, height: 900 },
  '[data-station-blueprint="als-mri"]'
);
await inspect(
  "desktop-cervical-myelopathy-mri",
  "http://127.0.0.1:3000/cases/cervical-myelopathy-mri",
  { width: 1440, height: 900 },
  '[data-station-blueprint="cervical-myelopathy-mri"]'
);
await inspect(
  "mobile-stroke",
  "http://127.0.0.1:3000/cases/stroke-ct-mca",
  { width: 390, height: 844 },
  ".mobile-tabbar"
);
await inspect(
  "mobile-krok",
  "http://127.0.0.1:3000/krok",
  { width: 390, height: 844 },
  '[data-krok-page="start"]'
);

await browser.close();

const practicalCaseNames = new Set([
  "desktop-bppv-dix-hallpike",
  "desktop-bppv-epley",
  "desktop-cerebellar-ataxia",
  "desktop-dementia",
  "desktop-hearing-rinne-weber",
  "desktop-msa-orthostatic",
  "desktop-neurosyphilis",
  "desktop-parietal-tumor-stereognosis",
  "desktop-parkinson-gait-thevenard",
  "desktop-radiculopathy",
  "desktop-trigeminal-neuralgia",
  "desktop-trigeminal-sensory",
  "desktop-ulnar-neuropathy-cubital"
]);

const failures = results.flatMap((result) => {
  const issues = [];
  if (result.problems.length > 0) {
    issues.push(`${result.name}: ${result.problems.join("; ")}`);
  }
  if (result.metrics.overflowX > 1) {
    issues.push(`${result.name}: horizontal overflow ${result.metrics.overflowX}px`);
  }
  if (result.metrics.tableCount !== 0) {
    issues.push(`${result.name}: expected no tables, got ${result.metrics.tableCount}`);
  }
  if (practicalCaseNames.has(result.name) && result.metrics.practicalSkillCards !== 1) {
    issues.push(`${result.name}: expected one practical skill card`);
  }
  if (result.name.includes("stroke") && result.metrics.checklistCards < 5) {
    issues.push(`${result.name}: checklist cards not rendered`);
  }
  if (result.name.includes("stroke") && result.metrics.imageCards < 3) {
    issues.push(`${result.name}: imaging gallery not rendered`);
  }
  if (result.name === "desktop-cases" && result.interactions.searchCards !== 1) {
    issues.push(`${result.name}: search did not narrow to one Mini-Cog card`);
  }
  if (result.name === "desktop-cases" && result.metrics.mobileTabs !== 4) {
    issues.push(`${result.name}: expected four mobile filter tabs`);
  }
  if (result.name === "desktop-cases" && result.interactions.initialActive !== 1) {
    issues.push(`${result.name}: all filter was not active initially`);
  }
  if (result.name === "desktop-cases" && result.interactions.searchAdjacentButtons !== 0) {
    issues.push(`${result.name}: search shell still has an adjacent button`);
  }
  if (result.name === "desktop-cases" && result.interactions.nonImagingCards !== 15) {
    issues.push(`${result.name}: non-imaging filter did not show 15 cards`);
  }
  if (result.name === "desktop-cases" && result.interactions.nonImagingActive !== 1) {
    issues.push(`${result.name}: non-imaging filter did not become active`);
  }
  if (result.name === "desktop-cases" && result.interactions.imagingCards !== 5) {
    issues.push(`${result.name}: imaging filter did not show 5 cards`);
  }
  if (result.name === "desktop-cases" && result.interactions.imagingActive !== 1) {
    issues.push(`${result.name}: imaging filter did not become active`);
  }
  if (result.name === "desktop-stroke" && result.interactions.expandedAfter !== 4) {
    issues.push(`${result.name}: checklist accordion interaction failed`);
  }
  if (result.name === "desktop-krok" && result.interactions.startCards !== 6) {
    issues.push(`${result.name}: expected six start cards`);
  }
  if (result.name === "desktop-krok" && result.interactions.orderedCards !== 150) {
    issues.push(`${result.name}: ordered 2026 booklet did not render 150 questions`);
  }
  if (result.name === "desktop-krok" && result.interactions.orderedFirstBooklet !== "2026") {
    issues.push(`${result.name}: ordered 2026 first question uses wrong booklet`);
  }
  if (result.name === "desktop-krok" && result.interactions.orderedFirstSourceNumber !== "1") {
    issues.push(`${result.name}: ordered 2026 first question is not source №1`);
  }
  if (result.name === "desktop-krok" && !result.interactions.orderedHasShuffledOptions) {
    issues.push(`${result.name}: option order does not appear shuffled`);
  }
  if (result.name === "desktop-krok" && result.interactions.legacyAnswerFeedback !== 0) {
    issues.push(`${result.name}: legacy correct-answer feedback still renders`);
  }
  if (result.name === "desktop-krok" && result.interactions.answerExplanation !== 1) {
    issues.push(`${result.name}: answer explanation did not render`);
  }
  if (result.name === "desktop-krok" && result.interactions.answerExplanationHidden !== 0) {
    issues.push(`${result.name}: explanation toggle did not hide answer explanation`);
  }
  if (result.name === "desktop-krok" && result.interactions.answerExplanationRestored !== 1) {
    issues.push(`${result.name}: explanation toggle did not restore answer explanation`);
  }
  if (result.name === "desktop-krok" && result.interactions.resumeCard !== 1) {
    issues.push(`${result.name}: resume card did not render after reload`);
  }
  if (
    result.name === "desktop-krok" &&
    JSON.stringify(result.interactions.orderedFirstThreeIds) !==
      JSON.stringify(result.interactions.orderedFirstThreeAfterReload)
  ) {
    issues.push(`${result.name}: ordered session order changed after reload`);
  }
  if (
    result.name === "desktop-krok" &&
    JSON.stringify(result.interactions.shuffledFirstFiveSources) === JSON.stringify(["1", "2", "3", "4", "5"])
  ) {
    issues.push(`${result.name}: shuffled 2025 question order stayed sequential`);
  }
  if (
    result.name === "desktop-krok" &&
    JSON.stringify(result.interactions.shuffledFirstFiveIds) !==
      JSON.stringify(result.interactions.shuffledFirstFiveAfterReload)
  ) {
    issues.push(`${result.name}: shuffled session order changed after reload`);
  }
  if (result.name === "desktop-krok" && result.interactions.randomCards !== 150) {
    issues.push(`${result.name}: random booklet did not render 150 questions`);
  }
  if (result.name === "desktop-krok" && result.interactions.randomUniqueCards !== 150) {
    issues.push(`${result.name}: random booklet contains duplicate questions`);
  }
  if (result.name === "desktop-krok" && result.interactions.randomYears < 2) {
    issues.push(`${result.name}: random booklet did not draw from multiple years`);
  }
  if (result.name === "desktop-krok" && result.interactions.randomTrainingCards !== 0) {
    issues.push(`${result.name}: random booklet included training AI questions`);
  }
  if (
    result.name === "desktop-krok" &&
    result.interactions.randomFirstId !== result.interactions.randomFirstIdAfterReload
  ) {
    issues.push(`${result.name}: random session order changed after reload`);
  }
  if (result.name === "desktop-krok" && result.interactions.finishResultPanels !== 1) {
    issues.push(`${result.name}: finish result panel did not render`);
  }
  if (result.name === "desktop-krok" && result.interactions.restartStartCards !== 6) {
    issues.push(`${result.name}: restart did not return to booklet start`);
  }
  if (result.name === "desktop-krok" && result.interactions.trainingCards !== 150) {
    issues.push(`${result.name}: training AI booklet 2 did not render 150 questions`);
  }
  if (result.name === "desktop-krok" && result.interactions.trainingFirstBooklet !== "ai-002") {
    issues.push(`${result.name}: training AI booklet 2 first question uses wrong booklet`);
  }
  if (result.name === "desktop-krok" && result.interactions.trainingExplanation !== 1) {
    issues.push(`${result.name}: training AI booklet 2 explanation did not render`);
  }
  if (result.name === "mobile-krok" && result.interactions.startCards !== 6) {
    issues.push(`${result.name}: expected six start cards on mobile`);
  }
  if (result.name === "mobile-krok" && result.interactions.questionCards !== 150) {
    issues.push(`${result.name}: mobile booklet did not render 150 questions`);
  }
  if (result.name === "mobile-krok" && result.interactions.bottomBar !== 1) {
    issues.push(`${result.name}: compact mobile bottom bar is missing`);
  }
  if (result.name === "mobile-krok" && result.interactions.mobilePanelClosedInitially !== 0) {
    issues.push(`${result.name}: mobile navigation panel should be closed initially`);
  }
  if (
    result.name === "mobile-krok" &&
    !String(result.interactions.bottomStatusAfterAnswer ?? "").includes("Відповіли 1/150")
  ) {
    issues.push(`${result.name}: mobile status did not show answered count after answer`);
  }
  if (
    result.name === "mobile-krok" &&
    !String(result.interactions.bottomStatusAfterAnswer ?? "").includes("0.7%")
  ) {
    issues.push(`${result.name}: mobile status did not show one-decimal percent after one correct answer`);
  }
  if (result.name === "mobile-krok" && result.interactions.mobilePanelOpen !== 1) {
    issues.push(`${result.name}: mobile navigation panel did not open`);
  }
  if (result.name === "mobile-krok" && result.interactions.mobilePanelFilters !== 5) {
    issues.push(`${result.name}: mobile navigation panel should render five filters`);
  }
  if (result.name === "mobile-krok" && result.interactions.mobileNavigatorItems !== 150) {
    issues.push(`${result.name}: mobile question navigator did not render 150 links`);
  }
  if (result.name === "mobile-krok" && result.interactions.bottomFinishButtons !== 1) {
    issues.push(`${result.name}: mobile finish button is missing`);
  }
  if (result.name === "desktop-stroke" && result.metrics.checklistCards !== 12) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (result.name === "desktop-stroke" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (result.name === "desktop-stroke" && result.interactions.blueprintRequiredTasks !== 4) {
    issues.push(`${result.name}: expected four blueprint required tasks`);
  }
  if (result.name === "desktop-stroke" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-stroke" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-glioma-dislocation" && result.metrics.checklistCards !== 12) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (result.name === "desktop-glioma-dislocation" && result.metrics.imageCards !== 4) {
    issues.push(`${result.name}: expected four scan image cards`);
  }
  if (result.name === "desktop-glioma-dislocation" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-glioma-dislocation" &&
    result.interactions.blueprintRequiredTasks !== 4
  ) {
    issues.push(`${result.name}: expected four blueprint required tasks`);
  }
  if (result.name === "desktop-glioma-dislocation" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (
    result.name === "desktop-glioma-dislocation" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-glioma-dislocation" && result.interactions.scanLightboxOpen !== 1) {
    issues.push(`${result.name}: scan lightbox did not open`);
  }
  if (result.name === "desktop-multiple-sclerosis-mri" && result.metrics.checklistCards !== 12) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (result.name === "desktop-multiple-sclerosis-mri" && result.metrics.imageCards !== 2) {
    issues.push(`${result.name}: expected two scan image cards`);
  }
  if (
    result.name === "desktop-multiple-sclerosis-mri" &&
    result.interactions.blueprintSections !== 1
  ) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-multiple-sclerosis-mri" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (
    result.name === "desktop-multiple-sclerosis-mri" &&
    result.interactions.blueprintSources !== 4
  ) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (
    result.name === "desktop-multiple-sclerosis-mri" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (
    result.name === "desktop-multiple-sclerosis-mri" &&
    result.interactions.scanLightboxOpen !== 1
  ) {
    issues.push(`${result.name}: scan lightbox did not open`);
  }
  if (result.name === "desktop-als-mri" && result.metrics.checklistCards !== 12) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (result.name === "desktop-als-mri" && result.metrics.imageCards !== 3) {
    issues.push(`${result.name}: expected three scan image cards`);
  }
  if (result.name === "desktop-als-mri" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (result.name === "desktop-als-mri" && result.interactions.blueprintRequiredTasks !== 3) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-als-mri" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-als-mri" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-als-mri" && result.interactions.scanLightboxOpen !== 1) {
    issues.push(`${result.name}: scan lightbox did not open`);
  }
  if (result.name === "desktop-cervical-myelopathy-mri" && result.metrics.checklistCards !== 12) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (result.name === "desktop-cervical-myelopathy-mri" && result.metrics.imageCards !== 6) {
    issues.push(`${result.name}: expected six scan image cards`);
  }
  if (
    result.name === "desktop-cervical-myelopathy-mri" &&
    result.interactions.blueprintSections !== 1
  ) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-cervical-myelopathy-mri" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (
    result.name === "desktop-cervical-myelopathy-mri" &&
    result.interactions.blueprintSources !== 4
  ) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (
    result.name === "desktop-cervical-myelopathy-mri" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (
    result.name === "desktop-cervical-myelopathy-mri" &&
    result.interactions.scanLightboxOpen !== 1
  ) {
    issues.push(`${result.name}: scan lightbox did not open`);
  }
  if (result.name === "desktop-dementia" && result.metrics.checklistCards !== 18) {
    issues.push(`${result.name}: expected 18 checklist cards`);
  }
  if (result.name === "desktop-dementia" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (result.name === "desktop-dementia" && result.interactions.blueprintRequiredTasks !== 3) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-dementia" && result.interactions.blueprintSources !== 3) {
    issues.push(`${result.name}: expected three blueprint sources`);
  }
  if (result.name === "desktop-dementia" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-dementia" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-radiculopathy" && result.metrics.checklistCards !== 19) {
    issues.push(`${result.name}: expected 19 checklist cards`);
  }
  if (result.name === "desktop-radiculopathy" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (result.name === "desktop-radiculopathy" && result.interactions.blueprintRequiredTasks !== 3) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-radiculopathy" && result.interactions.blueprintSources !== 3) {
    issues.push(`${result.name}: expected three blueprint sources`);
  }
  if (result.name === "desktop-radiculopathy" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-radiculopathy" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-trigeminal-neuralgia" && result.metrics.checklistCards !== 20) {
    issues.push(`${result.name}: expected 20 checklist cards`);
  }
  if (result.name === "desktop-trigeminal-neuralgia" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-trigeminal-neuralgia" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-trigeminal-neuralgia" && result.interactions.blueprintSources !== 3) {
    issues.push(`${result.name}: expected three blueprint sources`);
  }
  if (result.name === "desktop-trigeminal-neuralgia" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-trigeminal-neuralgia" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-neurosyphilis" && result.metrics.checklistCards !== 15) {
    issues.push(`${result.name}: expected 15 checklist cards`);
  }
  if (result.name === "desktop-neurosyphilis" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-neurosyphilis" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-neurosyphilis" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-neurosyphilis" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-neurosyphilis" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-msa-orthostatic" && result.metrics.checklistCards !== 11) {
    issues.push(`${result.name}: expected 11 checklist cards`);
  }
  if (result.name === "desktop-msa-orthostatic" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-msa-orthostatic" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-msa-orthostatic" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-msa-orthostatic" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-msa-orthostatic" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-bppv-dix-hallpike" && result.metrics.checklistCards !== 13) {
    issues.push(`${result.name}: expected 13 checklist cards`);
  }
  if (result.name === "desktop-bppv-dix-hallpike" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-bppv-dix-hallpike" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-bppv-dix-hallpike" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-bppv-dix-hallpike" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (
    result.name === "desktop-bppv-dix-hallpike" &&
    result.interactions.visibleDeckReferences !== 0
  ) {
    issues.push(`${result.name}: deck source should not be visible in practical skill UI`);
  }
  if (
    result.name === "desktop-bppv-dix-hallpike" &&
    result.interactions.legacyDixHallpikeSteps !== 0
  ) {
    issues.push(`${result.name}: legacy Dix-Hallpike answerBlock is still visible`);
  }
  if (result.name === "desktop-bppv-dix-hallpike" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-bppv-epley" && result.metrics.checklistCards !== 15) {
    issues.push(`${result.name}: expected 15 checklist cards`);
  }
  if (result.name === "desktop-bppv-epley" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-bppv-epley" &&
    result.interactions.blueprintRequiredTasks !== 2
  ) {
    issues.push(`${result.name}: expected two blueprint required tasks`);
  }
  if (result.name === "desktop-bppv-epley" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-bppv-epley" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-bppv-epley" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-hearing-rinne-weber" && result.metrics.checklistCards !== 12) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (result.name === "desktop-hearing-rinne-weber" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-hearing-rinne-weber" &&
    result.interactions.blueprintRequiredTasks !== 4
  ) {
    issues.push(`${result.name}: expected four blueprint required tasks`);
  }
  if (result.name === "desktop-hearing-rinne-weber" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-hearing-rinne-weber" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-hearing-rinne-weber" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-parkinson-gait-thevenard" && result.metrics.checklistCards !== 10) {
    issues.push(`${result.name}: expected 10 checklist cards`);
  }
  if (
    result.name === "desktop-parkinson-gait-thevenard" &&
    result.interactions.blueprintSections !== 1
  ) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-parkinson-gait-thevenard" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (
    result.name === "desktop-parkinson-gait-thevenard" &&
    result.interactions.blueprintSources !== 4
  ) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (
    result.name === "desktop-parkinson-gait-thevenard" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-parkinson-gait-thevenard" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-cauda-equina" && result.metrics.checklistCards !== 10) {
    issues.push(`${result.name}: expected 10 checklist cards`);
  }
  if (result.name === "desktop-cauda-equina" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-cauda-equina" &&
    result.interactions.blueprintRequiredTasks !== 5
  ) {
    issues.push(`${result.name}: expected five blueprint required tasks`);
  }
  if (result.name === "desktop-cauda-equina" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-cauda-equina" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-cauda-equina" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-trigeminal-sensory" && result.metrics.checklistCards !== 11) {
    issues.push(`${result.name}: expected 11 checklist cards`);
  }
  if (result.name === "desktop-trigeminal-sensory" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-trigeminal-sensory" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-trigeminal-sensory" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-trigeminal-sensory" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-trigeminal-sensory" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-weber-syndrome" && result.metrics.checklistCards !== 10) {
    issues.push(`${result.name}: expected 10 checklist cards`);
  }
  if (result.name === "desktop-weber-syndrome" && result.interactions.blueprintSections !== 1) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-weber-syndrome" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (result.name === "desktop-weber-syndrome" && result.interactions.blueprintSources !== 4) {
    issues.push(`${result.name}: expected four blueprint sources`);
  }
  if (result.name === "desktop-weber-syndrome" && result.interactions.checkedStatusText < 1) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-weber-syndrome" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (
    result.name === "desktop-parietal-tumor-stereognosis" &&
    result.metrics.checklistCards !== 12
  ) {
    issues.push(`${result.name}: expected 12 checklist cards`);
  }
  if (
    result.name === "desktop-parietal-tumor-stereognosis" &&
    result.interactions.blueprintSections !== 1
  ) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-parietal-tumor-stereognosis" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (
    result.name === "desktop-parietal-tumor-stereognosis" &&
    result.interactions.blueprintSources !== 5
  ) {
    issues.push(`${result.name}: expected five blueprint sources`);
  }
  if (
    result.name === "desktop-parietal-tumor-stereognosis" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (
    result.name === "desktop-parietal-tumor-stereognosis" &&
    result.metrics.imageCards !== 0
  ) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-ulnar-neuropathy-cubital" && result.metrics.checklistCards !== 14) {
    issues.push(`${result.name}: expected 14 checklist cards`);
  }
  if (
    result.name === "desktop-ulnar-neuropathy-cubital" &&
    result.interactions.blueprintSections !== 1
  ) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-ulnar-neuropathy-cubital" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (
    result.name === "desktop-ulnar-neuropathy-cubital" &&
    result.interactions.blueprintSources !== 5
  ) {
    issues.push(`${result.name}: expected five blueprint sources`);
  }
  if (
    result.name === "desktop-ulnar-neuropathy-cubital" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-ulnar-neuropathy-cubital" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-cerebellar-ataxia" && result.metrics.checklistCards !== 14) {
    issues.push(`${result.name}: expected 14 checklist cards`);
  }
  if (
    result.name === "desktop-cerebellar-ataxia" &&
    result.interactions.blueprintSections !== 1
  ) {
    issues.push(`${result.name}: station blueprint did not render`);
  }
  if (
    result.name === "desktop-cerebellar-ataxia" &&
    result.interactions.blueprintRequiredTasks !== 3
  ) {
    issues.push(`${result.name}: expected three blueprint required tasks`);
  }
  if (
    result.name === "desktop-cerebellar-ataxia" &&
    result.interactions.blueprintSources !== 5
  ) {
    issues.push(`${result.name}: expected five blueprint sources`);
  }
  if (
    result.name === "desktop-cerebellar-ataxia" &&
    result.interactions.checkedStatusText < 1
  ) {
    issues.push(`${result.name}: checked review status not visible`);
  }
  if (result.name === "desktop-cerebellar-ataxia" && result.metrics.imageCards !== 0) {
    issues.push(`${result.name}: non-imaging case should not render scan gallery`);
  }
  if (result.name === "desktop-stroke" && result.interactions.originalFiguresBefore !== 0) {
    issues.push(`${result.name}: original page images should be lazy-rendered before disclosure opens`);
  }
  if (result.name === "desktop-stroke" && result.interactions.originalFiguresAfter < 2) {
    issues.push(`${result.name}: original page images did not render after disclosure opens`);
  }
  if (result.name === "desktop-stroke" && result.interactions.scanLightboxOpen !== 1) {
    issues.push(`${result.name}: scan lightbox did not open`);
  }
  if (result.name === "mobile-stroke" && result.interactions.mobileLightboxOpen !== 1) {
    issues.push(`${result.name}: mobile scan lightbox did not open`);
  }
  if (result.name === "mobile-stroke" && result.interactions.topMenuTriggers !== 1) {
    issues.push(`${result.name}: expected one top mobile menu trigger`);
  }
  if (result.name === "mobile-stroke" && result.interactions.bottomMenuTriggers !== 1) {
    issues.push(`${result.name}: expected one bottom mobile menu trigger`);
  }
  if (result.name === "mobile-stroke" && result.interactions.openedFromTop !== 1) {
    issues.push(`${result.name}: top mobile menu trigger did not open the menu`);
  }
  if (result.name === "mobile-stroke" && result.interactions.openedFromBottom !== 1) {
    issues.push(`${result.name}: bottom mobile menu trigger did not open the menu`);
  }
  if (result.name === "mobile-stroke" && result.interactions.menuLinks < 4) {
    issues.push(`${result.name}: mobile menu is missing section links`);
  }
  return issues;
});

console.log(JSON.stringify(results, null, 2));

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
