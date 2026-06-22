import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = "/private/tmp/osce-neurology-site-qa";
await mkdir(outputDir, { recursive: true });

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
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
  const targetUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
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

  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForSelector(selector, { timeout: 15000 });

  const metrics = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    tableCount: document.querySelectorAll("table").length,
    caseCards: document.querySelectorAll(".case-card").length,
    checklistCards: document.querySelectorAll(".check-step").length,
    imageCards: document.querySelectorAll(".image-grid figure").length,
    mobileTabs: document.querySelectorAll(".mobile-tabbar a, .mobile-tabbar button").length,
    homeCards: document.querySelectorAll("[data-home-section-card]").length,
    krokStartCards: document.querySelectorAll("[data-krok-start-card]").length,
    krokQuestionCards: document.querySelectorAll("[data-krok-question-card]").length,
    krokResultPanels: document.querySelectorAll('[data-krok-result="summary"]').length,
    krokMobileNavigatorItems: document.querySelectorAll("[data-krok-mobile-question-link]").length,
    noteSectionCards: document.querySelectorAll("[data-note-section-card]").length,
    noteContentBlocks: document.querySelectorAll("[data-note-content-block]").length,
    noteSourceCards: document.querySelectorAll("#sources a, #sources p").length,
    noteRightRails: document.querySelectorAll("[data-note-right-rail]").length,
    practicalSkillCards: document.querySelectorAll("[data-blueprint-practical-skills='list'] article")
      .length,
    ticketCards: document.querySelectorAll("[data-ticket-card]").length,
    ticketQuestions: document.querySelectorAll("[data-ticket-question]").length,
    ticketMediaFigures: document.querySelectorAll("[data-ticket-media-figure]").length,
    missingExamQuestions: document.querySelectorAll("[data-missing-exam-question]").length
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
    interactions.siteMobileTabs = await page.locator('[data-site-mobile-tabbar="primary"] a').count();

    await page.locator('[data-mobile-menu-trigger="top"]').click();
    await page.waitForSelector('[data-mobile-case-menu="open"]', { timeout: 5000 });
    interactions.openedFromTop = await page.locator('[data-mobile-case-menu="open"]').count();
    interactions.menuLinks = await page.locator('[data-mobile-case-menu="open"] nav a').count();
    await page.locator('[data-mobile-menu-close="button"]').click();
    await page.waitForSelector('[data-mobile-case-menu="open"]', {
      state: "detached",
      timeout: 5000
    });
  }

  if (name === "desktop-krok") {
    interactions.desktopStartSidebar = await page
      .locator('[data-krok-desktop-sidebar="start"]')
      .count();
    interactions.desktopStartSidebarWidth =
      interactions.desktopStartSidebar === 1
        ? await page
            .locator('[data-krok-desktop-sidebar="start"]')
            .evaluate((element) => Math.round(element.getBoundingClientRect().width))
        : 0;
    interactions.startCards = await page.locator("[data-krok-start-card]").count();

    await page.locator('[data-krok-start-card="2026"] [data-krok-start-mode="ordered"]').click();
    await page.waitForSelector('[data-krok-page="session"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("[data-krok-question-card]").length === 150, {
      timeout: 15000
    });
    interactions.desktopSessionSidebar = await page
      .locator('[data-krok-desktop-sidebar="session"]')
      .count();
    interactions.desktopSessionSidebarWidth =
      interactions.desktopSessionSidebar === 1
        ? await page
            .locator('[data-krok-desktop-sidebar="session"]')
            .evaluate((element) => Math.round(element.getBoundingClientRect().width))
        : 0;
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
    await page.goto(targetUrl, { waitUntil: "networkidle" });
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
    await page.goto(targetUrl, { waitUntil: "networkidle" });
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

    await page.locator('[data-krok-start-card="ai-004"] [data-krok-start-mode="ordered"]').click();
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

  if (name === "desktop-notes") {
    interactions.sectionCards = await page.locator("[data-note-section-card]").count();
    interactions.availableCards = await page.locator('[data-note-section-status="available"]').count();
    interactions.plannedCards = await page.locator('[data-note-section-status="planned"]').count();
    const searchInput = page.getByPlaceholder("Пошук за темою або підтемою...");
    await searchInput.fill("Гепато-церебральна дегенерація");
    await page.waitForFunction(
      () =>
        document.querySelector('[data-notes-search-shell="query"] input')?.value ===
        "Гепато-церебральна дегенерація",
      undefined,
      { timeout: 5000 }
    );
    await page.waitForFunction(
      () => document.querySelectorAll("[data-note-section-card]").length === 1,
      undefined,
      { timeout: 5000 }
    );
    interactions.searchCards = await page.locator("[data-note-section-card]").count();
  }

  if (name === "desktop-tickets") {
    interactions.ticketCards = await page.locator("[data-ticket-card]").count();
    interactions.missingQuestions = await page.locator("[data-missing-exam-question]").count();
    interactions.missingQuestionNumbers = await page
      .locator("[data-missing-exam-question-number]")
      .count();
    interactions.missingQuestionTopicTags = await page.getByText("Поза білетами", { exact: true }).count();
    interactions.missingQuestionAnswerStatuses = await page
      .locator("[data-missing-exam-question-answer-status]")
      .count();
    interactions.missingQuestionAnswerLinks = await page
      .locator("[data-missing-exam-question-link]")
      .count();
    const searchInput = page.getByPlaceholder("Пошук за номером білета або питанням...");
    await searchInput.fill("Епілепсія. Класифікація 2017");
    await page.waitForFunction(() => document.querySelectorAll("[data-ticket-card]").length === 1, {
      timeout: 5000
    });
    interactions.searchCards = await page.locator("[data-ticket-card]").count();
    interactions.searchMissingEmpty = await page
      .locator("[data-missing-exam-questions-empty]")
      .count();
  }

  if (name.startsWith("desktop-missing-question-")) {
    const questionNumber = name.split("-").at(-1);
    interactions.reader = await page.locator(`[data-missing-answer="${questionNumber}"]`).count();
    interactions.sections = await page.locator("[data-missing-answer-section]").count();
    interactions.sources = await page.locator("[data-missing-answer-source]").count();
    interactions.sourceLinks = await page.locator('[data-missing-answer-source] a[href^="http"]').count();
    interactions.sourceHeadings = await page.getByRole("heading", { name: "Джерела", exact: true }).count();
    interactions.backLinks = await page.locator('a[href="/tickets"]').count();
  }

  if (name === "desktop-ticket-11") {
    interactions.reader = await page.locator('[data-ticket-reader="11"]').count();
    interactions.questions = await page.locator("[data-ticket-question]").count();
    interactions.pdfText = await page.getByText("Ураження гіпоталамо-гіпофізарної системи").count();
  }

  if (name === "desktop-ticket-21") {
    interactions.reader = await page.locator('[data-ticket-reader="21"]').count();
    interactions.questions = await page.locator("[data-ticket-question]").count();
    interactions.mediaFigures = await page.locator("[data-ticket-media-figure]").count();
    interactions.tableScrollableContainers = await page
      .locator("[data-ticket-table-scroll]")
      .evaluateAll((containers) =>
        containers.filter((container) => container.scrollWidth - container.clientWidth > 1).length
      );
    await page.locator("[data-ticket-media-open]").first().click();
    await page.waitForSelector('[data-ticket-lightbox="open"]', { timeout: 5000 });
    interactions.lightboxOpen = await page.locator('[data-ticket-lightbox="open"]').count();
    await page.locator('[data-ticket-lightbox-close="button"]').click();
    await page.waitForSelector('[data-ticket-lightbox="open"]', {
      state: "detached",
      timeout: 5000
    });
  }

  if (name === "mobile-tickets") {
    interactions.ticketCards = await page.locator("[data-ticket-card]").count();
    interactions.mobileTabs = await page.locator(".mobile-tabbar a").count();
    interactions.missingQuestions = await page.locator("[data-missing-exam-question]").count();
    interactions.missingQuestionNumbers = await page
      .locator("[data-missing-exam-question-number]")
      .count();
    interactions.missingQuestionTopicTags = await page.getByText("Поза білетами", { exact: true }).count();
    interactions.missingQuestionAnswerStatuses = await page
      .locator("[data-missing-exam-question-answer-status]")
      .count();
    interactions.missingQuestionAnswerLinks = await page
      .locator("[data-missing-exam-question-link]")
      .count();
  }

  if (name === "mobile-ticket-21") {
    interactions.reader = await page.locator('[data-ticket-reader="21"]').count();
    interactions.questions = await page.locator("[data-ticket-question]").count();
    interactions.tables = await page.locator("[data-ticket-table]").count();
    interactions.tableCards = await page.locator("[data-ticket-table-card-list]").count();
    interactions.tableCardRows = await page.locator("[data-ticket-table-card-row]").count();
    interactions.tableScrollableContainers = await page
      .locator("[data-ticket-table-scroll]")
      .evaluateAll((containers) =>
        containers.filter((container) => container.scrollWidth - container.clientWidth > 1).length
      );
    interactions.maxTableScrollExcess = await page
      .locator("[data-ticket-table-scroll]")
      .evaluateAll((containers) =>
        Math.max(0, ...containers.map((container) => container.scrollWidth - container.clientWidth))
      );
  }

  if (name.includes("note-reader")) {
    interactions.reader = await page.locator("[data-note-reader]").count();
    interactions.contentBlocks = await page.locator("[data-note-content-block]").count();
    interactions.topicalItems = await page.locator('[data-note-point-item="topical"]').count();
    interactions.krokPatternItems = await page.locator('[data-note-point-item="krok-patterns"]').count();
    interactions.pitfallItems = await page.locator('[data-note-point-item="pitfalls"]').count();
    interactions.rightRails = await page.locator("[data-note-right-rail]").count();
    interactions.legacyHighYieldSections = await page.locator("#high-yield").count();
    interactions.visibleKrokMarkerRailText = await page.getByText("КРОК-маркери").count();
    interactions.visiblePdfSubtopicRailText = await page.getByText("Підтеми PDF").count();
    interactions.relatedSections = await page.locator("#related").count();
    interactions.sourceSections = await page.locator("#sources").count();
  }

  if (name === "mobile-notes") {
    interactions.sectionCards = await page.locator("[data-note-section-card]").count();
    interactions.mobileTabs = await page.locator(".mobile-tabbar a").count();
  }

  if (name === "desktop-home" || name === "mobile-home") {
    interactions.homeRoot = await page.locator('[data-home-hub="root"]').count();
    interactions.homeCards = await page.locator("[data-home-section-card]").count();
    interactions.homeLinks = await page.locator('[data-home-section-card] a[href^="/"]').count();
    interactions.mobileTabs = await page.locator(".mobile-tabbar a").count();
  }

  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await page.close();

  results.push({ name, url: targetUrl, viewport, metrics, interactions, problems, screenshotPath });
}

await inspect("desktop-home", `/`, { width: 1440, height: 900 }, '[data-home-hub="root"]');
await inspect("desktop-cases", `/cases`, { width: 1440, height: 900 }, ".case-list");
await inspect(
  "desktop-krok",
  `/krok`,
  { width: 1440, height: 900 },
  '[data-krok-page="start"]'
);
await inspect(
  "desktop-notes",
  `/notes`,
  { width: 1440, height: 900 },
  '[data-notes-section-list="catalog"]'
);
await inspect(
  "desktop-tickets",
  `/tickets`,
  { width: 1440, height: 900 },
  '[data-ticket-list="catalog"]'
);
await inspect(
  "desktop-missing-question-34",
  `/tickets/questions/34`,
  { width: 1440, height: 900 },
  '[data-missing-answer="34"]'
);
await inspect(
  "desktop-missing-question-35",
  `/tickets/questions/35`,
  { width: 1440, height: 900 },
  '[data-missing-answer="35"]'
);
await inspect(
  "desktop-missing-question-53",
  `/tickets/questions/53`,
  { width: 1440, height: 900 },
  '[data-missing-answer="53"]'
);
await inspect(
  "desktop-missing-question-57",
  `/tickets/questions/57`,
  { width: 1440, height: 900 },
  '[data-missing-answer="57"]'
);
await inspect(
  "desktop-missing-question-59",
  `/tickets/questions/59`,
  { width: 1440, height: 900 },
  '[data-missing-answer="59"]'
);
await inspect(
  "desktop-missing-question-83",
  `/tickets/questions/83`,
  { width: 1440, height: 900 },
  '[data-missing-answer="83"]'
);
await inspect(
  "desktop-ticket-11",
  `/tickets/11`,
  { width: 1440, height: 900 },
  '[data-ticket-reader="11"]'
);
await inspect(
  "desktop-ticket-21",
  `/tickets/21`,
  { width: 1440, height: 900 },
  '[data-ticket-reader="21"]'
);
await inspect(
  "desktop-note-reader",
  `/notes/anatomy-physiology`,
  { width: 1440, height: 900 },
  '[data-note-reader="anatomy-physiology"]'
);
await inspect(
  "desktop-note-reader-syndromology",
  `/notes/syndromology-topical-diagnosis`,
  { width: 1440, height: 900 },
  '[data-note-reader="syndromology-topical-diagnosis"]'
);
await inspect(
  "desktop-note-reader-examination",
  `/notes/neurological-examination`,
  { width: 1440, height: 900 },
  '[data-note-reader="neurological-examination"]'
);
await inspect(
  "desktop-note-reader-neuromuscular",
  `/notes/hereditary-neurodegenerative-neuromuscular`,
  { width: 1440, height: 900 },
  '[data-note-reader="hereditary-neurodegenerative-neuromuscular"]'
);
await inspect(
  "desktop-note-reader-peripheral",
  `/notes/peripheral-nervous-system`,
  { width: 1440, height: 900 },
  '[data-note-reader="peripheral-nervous-system"]'
);
await inspect(
  "desktop-note-reader-inflammatory",
  `/notes/inflammatory-infectious-autoimmune`,
  { width: 1440, height: 900 },
  '[data-note-reader="inflammatory-infectious-autoimmune"]'
);
await inspect(
  "desktop-note-reader-vascular",
  `/notes/vascular-neurology`,
  { width: 1440, height: 900 },
  '[data-note-reader="vascular-neurology"]'
);
await inspect(
  "desktop-note-reader-autonomic",
  `/notes/autonomic-pathology`,
  { width: 1440, height: 900 },
  '[data-note-reader="autonomic-pathology"]'
);
await inspect(
  "desktop-note-reader-neurotrauma",
  `/notes/neurotrauma`,
  { width: 1440, height: 900 },
  '[data-note-reader="neurotrauma"]'
);
await inspect(
  "desktop-note-reader-neuro-oncology",
  `/notes/neuro-oncology`,
  { width: 1440, height: 900 },
  '[data-note-reader="neuro-oncology"]'
);
await inspect(
  "desktop-note-reader-neurologic-emergencies",
  `/notes/neurologic-emergencies`,
  { width: 1440, height: 900 },
  '[data-note-reader="neurologic-emergencies"]'
);
await inspect(
  "desktop-note-reader-treatment-prevention",
  `/notes/treatment-prevention`,
  { width: 1440, height: 900 },
  '[data-note-reader="treatment-prevention"]'
);
await inspect(
  "desktop-dementia",
  `/cases/dementia-mini-cog`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="dementia-mini-cog"]'
);
await inspect(
  "desktop-radiculopathy",
  `/cases/radiculopathy-topic`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="radiculopathy-topic"]'
);
await inspect(
  "desktop-trigeminal-neuralgia",
  `/cases/trigeminal-neuralgia-sensory`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="trigeminal-neuralgia-sensory"]'
);
await inspect(
  "desktop-neurosyphilis",
  `/cases/neurosyphilis-vibration`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="neurosyphilis-vibration"]'
);
await inspect(
  "desktop-msa-orthostatic",
  `/cases/msa-orthostatic`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="msa-orthostatic"]'
);
await inspect(
  "desktop-bppv-dix-hallpike",
  `/cases/bppv-dix-hallpike`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="bppv-dix-hallpike"]'
);
await inspect(
  "desktop-bppv-epley",
  `/cases/bppv-epley`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="bppv-epley"]'
);
await inspect(
  "desktop-hearing-rinne-weber",
  `/cases/hearing-rinne-weber`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="hearing-rinne-weber"]'
);
await inspect(
  "desktop-parkinson-gait-thevenard",
  `/cases/parkinson-gait-thevenard`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="parkinson-gait-thevenard"]'
);
await inspect(
  "desktop-cauda-equina",
  `/cases/cauda-equina`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="cauda-equina"]'
);
await inspect(
  "desktop-trigeminal-sensory",
  `/cases/trigeminal-sensory`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="trigeminal-sensory"]'
);
await inspect(
  "desktop-weber-syndrome",
  `/cases/weber-syndrome`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="weber-syndrome"]'
);
await inspect(
  "desktop-parietal-tumor-stereognosis",
  `/cases/parietal-tumor-stereognosis`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="parietal-tumor-stereognosis"]'
);
await inspect(
  "desktop-ulnar-neuropathy-cubital",
  `/cases/ulnar-neuropathy-cubital`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="ulnar-neuropathy-cubital"]'
);
await inspect(
  "desktop-cerebellar-ataxia",
  `/cases/cerebellar-ataxia`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="cerebellar-ataxia"]'
);
await inspect(
  "desktop-stroke",
  `/cases/stroke-ct-mca`,
  { width: 1440, height: 900 },
  ".check-step"
);
await inspect(
  "desktop-glioma-dislocation",
  `/cases/glioma-dislocation`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="glioma-dislocation"]'
);
await inspect(
  "desktop-multiple-sclerosis-mri",
  `/cases/multiple-sclerosis-mri`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="multiple-sclerosis-mri"]'
);
await inspect(
  "desktop-als-mri",
  `/cases/als-mri`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="als-mri"]'
);
await inspect(
  "desktop-cervical-myelopathy-mri",
  `/cases/cervical-myelopathy-mri`,
  { width: 1440, height: 900 },
  '[data-station-blueprint="cervical-myelopathy-mri"]'
);
await inspect("mobile-home", `/`, { width: 390, height: 844 }, '[data-home-hub="root"]');
await inspect(
  "mobile-stroke",
  `/cases/stroke-ct-mca`,
  { width: 390, height: 844 },
  ".mobile-tabbar"
);
await inspect(
  "mobile-krok",
  `/krok`,
  { width: 390, height: 844 },
  '[data-krok-page="start"]'
);
await inspect(
  "mobile-notes",
  `/notes`,
  { width: 390, height: 844 },
  '[data-notes-section-list="catalog"]'
);
await inspect(
  "mobile-tickets",
  `/tickets`,
  { width: 390, height: 844 },
  '[data-ticket-list="catalog"]'
);
await inspect(
  "mobile-ticket-21",
  `/tickets/21`,
  { width: 390, height: 844 },
  '[data-ticket-reader="21"]'
);
await inspect(
  "mobile-note-reader",
  `/notes/anatomy-physiology`,
  { width: 390, height: 844 },
  '[data-note-reader="anatomy-physiology"]'
);
await inspect(
  "mobile-note-reader-syndromology",
  `/notes/syndromology-topical-diagnosis`,
  { width: 390, height: 844 },
  '[data-note-reader="syndromology-topical-diagnosis"]'
);
await inspect(
  "mobile-note-reader-examination",
  `/notes/neurological-examination`,
  { width: 390, height: 844 },
  '[data-note-reader="neurological-examination"]'
);
await inspect(
  "mobile-note-reader-neuromuscular",
  `/notes/hereditary-neurodegenerative-neuromuscular`,
  { width: 390, height: 844 },
  '[data-note-reader="hereditary-neurodegenerative-neuromuscular"]'
);
await inspect(
  "mobile-note-reader-peripheral",
  `/notes/peripheral-nervous-system`,
  { width: 390, height: 844 },
  '[data-note-reader="peripheral-nervous-system"]'
);
await inspect(
  "mobile-note-reader-inflammatory",
  `/notes/inflammatory-infectious-autoimmune`,
  { width: 390, height: 844 },
  '[data-note-reader="inflammatory-infectious-autoimmune"]'
);
await inspect(
  "mobile-note-reader-vascular",
  `/notes/vascular-neurology`,
  { width: 390, height: 844 },
  '[data-note-reader="vascular-neurology"]'
);
await inspect(
  "mobile-note-reader-autonomic",
  `/notes/autonomic-pathology`,
  { width: 390, height: 844 },
  '[data-note-reader="autonomic-pathology"]'
);
await inspect(
  "mobile-note-reader-neurotrauma",
  `/notes/neurotrauma`,
  { width: 390, height: 844 },
  '[data-note-reader="neurotrauma"]'
);
await inspect(
  "mobile-note-reader-neuro-oncology",
  `/notes/neuro-oncology`,
  { width: 390, height: 844 },
  '[data-note-reader="neuro-oncology"]'
);
await inspect(
  "mobile-note-reader-neurologic-emergencies",
  `/notes/neurologic-emergencies`,
  { width: 390, height: 844 },
  '[data-note-reader="neurologic-emergencies"]'
);
await inspect(
  "mobile-note-reader-treatment-prevention",
  `/notes/treatment-prevention`,
  { width: 390, height: 844 },
  '[data-note-reader="treatment-prevention"]'
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
    issues.push(`${result.name}: expected four global mobile tabs`);
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
  if (result.name === "desktop-krok" && result.interactions.startCards !== 8) {
    issues.push(`${result.name}: expected eight start cards`);
  }
  if (result.name === "desktop-krok" && result.interactions.desktopStartSidebar !== 1) {
    issues.push(`${result.name}: KROK start page should use the shared desktop sidebar pattern`);
  }
  if (result.name === "desktop-krok" && result.interactions.desktopStartSidebarWidth !== 240) {
    issues.push(`${result.name}: KROK start sidebar should match the 240px shared desktop nav column`);
  }
  if (result.name === "desktop-krok" && result.interactions.desktopSessionSidebar !== 1) {
    issues.push(`${result.name}: KROK session page should use the shared desktop sidebar pattern`);
  }
  if (result.name === "desktop-krok" && result.interactions.desktopSessionSidebarWidth !== 240) {
    issues.push(`${result.name}: KROK session sidebar should match the 240px shared desktop nav column`);
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
  if (result.name === "desktop-krok" && result.interactions.restartStartCards !== 8) {
    issues.push(`${result.name}: restart did not return to booklet start`);
  }
  if (result.name === "desktop-krok" && result.interactions.trainingCards !== 150) {
    issues.push(`${result.name}: training AI booklet 4 did not render 150 questions`);
  }
  if (result.name === "desktop-krok" && result.interactions.trainingFirstBooklet !== "ai-004") {
    issues.push(`${result.name}: training AI booklet 4 first question uses wrong booklet`);
  }
  if (result.name === "desktop-krok" && result.interactions.trainingExplanation !== 1) {
    issues.push(`${result.name}: training AI booklet 4 explanation did not render`);
  }
  if (result.name === "mobile-krok" && result.interactions.startCards !== 8) {
    issues.push(`${result.name}: expected eight start cards on mobile`);
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
  if (result.name === "desktop-notes" && result.interactions.sectionCards !== 15) {
    issues.push(`${result.name}: expected 15 note section cards`);
  }
  if (result.name === "desktop-notes" && result.interactions.availableCards !== 15) {
    issues.push(`${result.name}: expected fifteen available note sections`);
  }
  if (result.name === "desktop-notes" && result.interactions.plannedCards !== 0) {
    issues.push(`${result.name}: expected zero planned note sections`);
  }
  if (result.name === "desktop-notes" && result.interactions.searchCards !== 1) {
    issues.push(`${result.name}: notes search did not narrow to one card`);
  }
  if (result.name === "desktop-tickets" && result.interactions.ticketCards !== 23) {
    issues.push(`${result.name}: expected 23 ticket cards`);
  }
  if (result.name === "desktop-tickets" && result.interactions.missingQuestions !== 6) {
    issues.push(`${result.name}: expected six missing exam questions`);
  }
  if (result.name === "desktop-tickets" && result.interactions.missingQuestionNumbers !== 0) {
    issues.push(`${result.name}: missing exam question cards should not show standalone numbers`);
  }
  if (result.name === "desktop-tickets" && result.interactions.missingQuestionTopicTags !== 0) {
    issues.push(`${result.name}: missing exam question cards should not show topic tags`);
  }
  if (result.name === "desktop-tickets" && result.interactions.missingQuestionAnswerStatuses !== 0) {
    issues.push(`${result.name}: missing exam question cards should not show answer status markers`);
  }
  if (result.name === "desktop-tickets" && result.interactions.missingQuestionAnswerLinks !== 6) {
    issues.push(`${result.name}: expected six missing exam question answer links`);
  }
  if (result.name === "desktop-tickets" && result.interactions.searchCards !== 1) {
    issues.push(`${result.name}: tickets search did not narrow to one card`);
  }
  if (result.name === "desktop-tickets" && result.interactions.searchMissingEmpty !== 1) {
    issues.push(`${result.name}: missing question list should show an empty state when filtered out`);
  }
  if (result.name.startsWith("desktop-missing-question-") && result.interactions.reader !== 1) {
    issues.push(`${result.name}: missing question answer reader did not render`);
  }
  if (result.name.startsWith("desktop-missing-question-") && result.interactions.sections < 4) {
    issues.push(`${result.name}: expected at least four answer sections`);
  }
  if (result.name.startsWith("desktop-missing-question-") && result.interactions.sources !== 0) {
    issues.push(`${result.name}: source entries should not be visible in the answer UI`);
  }
  if (result.name.startsWith("desktop-missing-question-") && result.interactions.sourceLinks !== 0) {
    issues.push(`${result.name}: source links should not be visible in the answer UI`);
  }
  if (result.name.startsWith("desktop-missing-question-") && result.interactions.sourceHeadings !== 0) {
    issues.push(`${result.name}: source heading should not be visible in the answer UI`);
  }
  if (result.name.startsWith("desktop-missing-question-") && result.interactions.backLinks < 1) {
    issues.push(`${result.name}: expected a back link to tickets`);
  }
  if (result.name === "desktop-ticket-11" && result.interactions.reader !== 1) {
    issues.push(`${result.name}: ticket 11 reader did not render`);
  }
  if (result.name === "desktop-ticket-11" && result.interactions.questions < 3) {
    issues.push(`${result.name}: ticket 11 PDF content did not split into readable blocks`);
  }
  if (result.name === "desktop-ticket-11" && result.interactions.pdfText < 1) {
    issues.push(`${result.name}: ticket 11 PDF text was not visible`);
  }
  if (result.name === "desktop-ticket-21" && result.interactions.reader !== 1) {
    issues.push(`${result.name}: ticket 21 reader did not render`);
  }
  if (result.name === "desktop-ticket-21" && result.interactions.mediaFigures < 8) {
    issues.push(`${result.name}: ticket 21 media figures did not render`);
  }
  if (result.name === "desktop-ticket-21" && result.interactions.tableScrollableContainers !== 0) {
    issues.push(`${result.name}: ticket tables should not require horizontal scrolling`);
  }
  if (result.name === "desktop-ticket-21" && result.interactions.lightboxOpen !== 1) {
    issues.push(`${result.name}: ticket media lightbox did not open`);
  }
  if (result.name.includes("note-reader") && result.interactions.reader !== 1) {
    issues.push(`${result.name}: note reader did not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.contentBlocks < 5) {
    issues.push(`${result.name}: article content blocks did not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.krokPatternItems < 5) {
    issues.push(`${result.name}: KROK pattern flow items did not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.pitfallItems < 5) {
    issues.push(`${result.name}: pitfall flow items did not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.rightRails !== 0) {
    issues.push(`${result.name}: note right rail should not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.legacyHighYieldSections !== 0) {
    issues.push(`${result.name}: legacy high-yield card section should not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.visibleKrokMarkerRailText !== 0) {
    issues.push(`${result.name}: KROK marker rail text should not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.visiblePdfSubtopicRailText !== 0) {
    issues.push(`${result.name}: PDF subtopic rail text should not render`);
  }
  if (result.name.includes("note-reader") && result.interactions.relatedSections !== 0) {
    issues.push(`${result.name}: related case section should not render in notes UI`);
  }
  if (result.name.includes("note-reader") && result.interactions.sourceSections !== 0) {
    issues.push(`${result.name}: source section should not render in notes UI`);
  }
  if (result.name === "mobile-notes" && result.interactions.sectionCards !== 15) {
    issues.push(`${result.name}: expected 15 note section cards on mobile`);
  }
  if (result.name === "mobile-notes" && result.interactions.mobileTabs !== 4) {
    issues.push(`${result.name}: expected four global mobile nav links`);
  }
  if (result.name === "mobile-tickets" && result.interactions.ticketCards !== 23) {
    issues.push(`${result.name}: expected 23 ticket cards on mobile`);
  }
  if (result.name === "mobile-tickets" && result.interactions.missingQuestions !== 6) {
    issues.push(`${result.name}: expected six missing exam questions on mobile`);
  }
  if (result.name === "mobile-tickets" && result.interactions.missingQuestionNumbers !== 0) {
    issues.push(`${result.name}: missing exam question cards should not show standalone numbers on mobile`);
  }
  if (result.name === "mobile-tickets" && result.interactions.missingQuestionTopicTags !== 0) {
    issues.push(`${result.name}: missing exam question cards should not show topic tags on mobile`);
  }
  if (result.name === "mobile-tickets" && result.interactions.missingQuestionAnswerStatuses !== 0) {
    issues.push(`${result.name}: missing exam question cards should not show answer statuses on mobile`);
  }
  if (result.name === "mobile-tickets" && result.interactions.missingQuestionAnswerLinks !== 6) {
    issues.push(`${result.name}: expected six missing exam question answer links on mobile`);
  }
  if (result.name === "mobile-tickets" && result.interactions.mobileTabs !== 4) {
    issues.push(`${result.name}: expected four global mobile nav links`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.reader !== 1) {
    issues.push(`${result.name}: ticket 21 mobile reader did not render`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.questions !== 4) {
    issues.push(`${result.name}: ticket 21 mobile questions did not render`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.tables < 1) {
    issues.push(`${result.name}: expected ticket 21 mobile tables to render`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.tableCards < 1) {
    issues.push(`${result.name}: mobile ticket tables should render card summaries instead of horizontal scroll`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.tableCardRows < 1) {
    issues.push(`${result.name}: mobile ticket table card rows did not render`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.tableScrollableContainers !== 0) {
    issues.push(`${result.name}: mobile ticket tables should not require horizontal scrolling`);
  }
  if (result.name === "mobile-ticket-21" && result.interactions.maxTableScrollExcess > 1) {
    issues.push(`${result.name}: mobile ticket table scroll excess ${result.interactions.maxTableScrollExcess}px`);
  }
  if ((result.name === "desktop-home" || result.name === "mobile-home") && result.interactions.homeRoot !== 1) {
    issues.push(`${result.name}: home hub did not render`);
  }
  if ((result.name === "desktop-home" || result.name === "mobile-home") && result.interactions.homeCards !== 4) {
    issues.push(`${result.name}: expected four home section cards`);
  }
  if ((result.name === "desktop-home" || result.name === "mobile-home") && result.interactions.homeLinks < 4) {
    issues.push(`${result.name}: expected home cards to link to all sections`);
  }
  if (result.name === "mobile-home" && result.interactions.mobileTabs !== 4) {
    issues.push(`${result.name}: expected four global mobile nav links`);
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
  if (result.name === "desktop-stroke" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-als-mri" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-dementia" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-radiculopathy" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-trigeminal-neuralgia" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-neurosyphilis" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-msa-orthostatic" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-bppv-dix-hallpike" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-bppv-epley" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-hearing-rinne-weber" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-cauda-equina" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-trigeminal-sensory" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "desktop-weber-syndrome" && result.interactions.checkedStatusText !== 0) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
    result.interactions.checkedStatusText !== 0
  ) {
    issues.push(`${result.name}: checked review status should not be visible`);
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
  if (result.name === "mobile-stroke" && result.interactions.bottomMenuTriggers !== 0) {
    issues.push(`${result.name}: unexpected bottom mobile menu trigger`);
  }
  if (result.name === "mobile-stroke" && result.interactions.siteMobileTabs !== 4) {
    issues.push(`${result.name}: expected four global mobile tabs`);
  }
  if (result.name === "mobile-stroke" && result.interactions.openedFromTop !== 1) {
    issues.push(`${result.name}: top mobile menu trigger did not open the menu`);
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
