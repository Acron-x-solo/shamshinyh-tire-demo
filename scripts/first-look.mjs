import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:5175/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "docs/screenshots/desktop-hero.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:5175/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "docs/screenshots/mobile-hero.png" });
console.log(
  JSON.stringify({
    errors,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  }),
);
await browser.close();
