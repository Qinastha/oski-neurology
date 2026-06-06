import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = "/private/tmp/osce-neurology-site-qa";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

async function inspect(name, url, viewport, selector) {
  const page = await browser.newPage({ viewport });
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`[console:${message.type()}] ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`[pageerror] ${error.message}`));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(selector, { timeout: 15000 });

  const metrics = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    tableCount: document.querySelectorAll("table").length,
    caseCards: document.querySelectorAll(".case-card").length,
    checklistCards: document.querySelectorAll(".check-step").length,
    imageCards: document.querySelectorAll(".image-grid figure").length,
    mobileTabs: document.querySelectorAll(".mobile-tabbar a, .mobile-tabbar button").length
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

    const searchInput = page.getByPlaceholder("Поиск станций, синдромов, ключевых слов...");
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
    interactions.originalFiguresBefore = await page.locator('[data-media-figure="original"]').count();
    await page.getByText("Показать страницы задачи").click();
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
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-radiculopathy") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="radiculopathy-topic"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-trigeminal-neuralgia") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="trigeminal-neuralgia-sensory"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-neurosyphilis") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="neurosyphilis-vibration"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-msa-orthostatic") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="msa-orthostatic"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-bppv-dix-hallpike") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="bppv-dix-hallpike"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-bppv-epley") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="bppv-epley"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-hearing-rinne-weber") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="hearing-rinne-weber"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-parkinson-gait-thevenard") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="parkinson-gait-thevenard"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-cauda-equina") {
    interactions.blueprintSections = await page.locator('[data-station-blueprint="cauda-equina"]').count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-trigeminal-sensory") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="trigeminal-sensory"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-weber-syndrome") {
    interactions.blueprintSections = await page.locator('[data-station-blueprint="weber-syndrome"]').count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-parietal-tumor-stereognosis") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="parietal-tumor-stereognosis"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-ulnar-neuropathy-cubital") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="ulnar-neuropathy-cubital"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
  }

  if (name === "desktop-cerebellar-ataxia") {
    interactions.blueprintSections = await page
      .locator('[data-station-blueprint="cerebellar-ataxia"]')
      .count();
    interactions.blueprintRequiredTasks = await page
      .locator('[data-blueprint-required-tasks="list"] article')
      .count();
    interactions.blueprintSources = await page.locator('[data-blueprint-sources="list"] a').count();
    interactions.checkedStatusText = await page.getByText("проверено").count();
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

  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await page.close();

  results.push({ name, url, viewport, metrics, interactions, problems, screenshotPath });
}

await inspect("desktop-cases", "http://127.0.0.1:3000/cases", { width: 1440, height: 900 }, ".case-list");
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
  "mobile-stroke",
  "http://127.0.0.1:3000/cases/stroke-ct-mca",
  { width: 390, height: 844 },
  ".mobile-tabbar"
);

await browser.close();

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
