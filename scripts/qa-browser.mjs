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
