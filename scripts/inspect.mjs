import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const url = process.argv[2] || "http://localhost:5175/";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await expect(page.locator(".wheel-scene")).toHaveClass(/scene-ready/);
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/screenshots/desktop-hero.png" });
  for (const [name, selector] of [
    ["services", "#services"],
    ["price-picker", ".price-picker"],
    ["price-tables", ".vehicle-price-grid"],
    ["disc-prices", ".disc-price-grid"],
    ["gallery", "#gallery"],
    ["contacts", "#contacts"],
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page
      .locator(selector)
      .screenshot({ path: `docs/screenshots/desktop-${name}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: "networkidle" });
  await expect(page.locator(".wheel-scene")).toHaveClass(/scene-ready/);
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/screenshots/mobile-hero.png" });
  for (const [name, selector] of [
    ["wheel", ".wheel-controls"],
    ["services", ".service-panel"],
    ["price-picker", ".price-picker"],
    ["price-tables", ".vehicle-price-card"],
    ["disc-prices", ".disc-price-card"],
    ["gallery", "#gallery .section-heading"],
    ["contacts", "#contacts"],
  ]) {
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `docs/screenshots/mobile-${name}.png` });
  }
  const targets = await page
    .locator(".wheel-controls button")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.getAttribute("aria-label") || node.textContent,
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
      })),
    );
  console.log(
    JSON.stringify(
      {
        url,
        failures,
        targets,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
