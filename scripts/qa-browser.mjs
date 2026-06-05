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

  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.close();

  results.push({ name, url, viewport, metrics, problems, screenshotPath });
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
  return issues;
});

console.log(JSON.stringify(results, null, 2));

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
