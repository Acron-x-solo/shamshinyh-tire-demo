import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://localhost:4175";
const prefix = "/shamshinyh-tire-demo/";
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(origin + prefix, { waitUntil: "networkidle" });
  await expect(page.locator(".wheel-scene")).toHaveClass(/scene-ready/);
  await page.getByRole("button", { name: "Разобрать колесо" }).click();
  await expect(
    page.getByRole("button", { name: "Собрать колесо" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Записаться в мастерскую", exact: true })
    .click();
  await expect(page.locator("#contacts h2")).toBeInViewport();
  assert.equal(page.url(), origin + prefix + "#contacts");
  for (const img of await page.locator("img:visible").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty("complete", true);
    assert.ok(
      await img.evaluate(
        (image) =>
          image.naturalWidth > 0 &&
          new URL(image.src).pathname.startsWith("/shamshinyh-tire-demo/"),
      ),
    );
  }
  await expect(page.locator(".published-price-cell")).toHaveCount(48);
  await expect(page.locator(".price-source-bar")).toContainText("17.04.2026");
  const priceOpener = page.getByRole("button", { name: "Посмотреть оригинал" });
  await priceOpener.click();
  const price = page.getByRole("dialog", {
    name: "Оригинальный прайс из 2ГИС",
  });
  await expect(price).toBeVisible();
  await expect(price.locator("img")).toHaveJSProperty("complete", true);
  assert.ok(await price.locator("img").evaluate((img) => img.naturalWidth > 0));
  await page.keyboard.press("Escape");
  await expect(priceOpener).toBeFocused();
  await page.locator(".gallery-photo-button").first().click();
  const gallery = page.getByRole("dialog", { name: "Фотографии мастерской" });
  await expect(gallery).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(gallery.locator(".lightbox-counter")).toHaveText("02 / 12");
  await page.keyboard.press("Escape");
  await page.evaluate(() => document.fonts.ready);
  assert.ok(
    await page.evaluate(
      () =>
        document.fonts.check('600 24px "Unbounded"', "Шамшиных") &&
        document.fonts.check('400 14px "Golos Text"', "Шамшиных"),
    ),
  );
  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name),
  );
  assert.ok(
    resources
      .filter((url) => new URL(url).origin === new URL(origin).origin)
      .every((url) => new URL(url).pathname.startsWith(prefix)),
  );
  const prices = page.locator("#prices");
  await prices.getByRole("button", { name: "Джип", exact: true }).click();
  await prices.getByRole("button", { name: "R24", exact: true }).click();
  await expect(prices.locator(".selected-price strong")).toHaveText("7 500 ₽");
  await prices.getByRole("button", { name: "Не знаю размер" }).click();
  await expect(prices.locator(".selected-price")).toContainText(
    "Уточним стоимость",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /https:\/\/acron-x-solo\.github\.io\/shamshinyh-tire-demo\//,
  );
  if (origin.startsWith("https://")) {
    const cover = await page.request.get(
      await page.locator('meta[property="og:image"]').getAttribute("content"),
    );
    assert.ok(cover.ok());
  }
  await page.setViewportSize({ width: 360, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(origin + prefix, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Приостановить 3D-анимацию" }),
  ).toHaveCount(0);
  const book = page.getByRole("link", {
    name: "Записаться в мастерскую",
    exact: true,
  });
  await book.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#contacts h2")).toBeInViewport();
  assert.equal(page.url(), origin + prefix + "#contacts");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.equal(context.pages().length, 1);
  assert.deepEqual(failures, []);
  const fallbackPage = await context.newPage();
  await fallbackPage.route("**/assets/WheelScene-*.js", (route) =>
    route.abort("failed"),
  );
  await fallbackPage.goto(origin + prefix);
  await expect(fallbackPage.locator(".wheel-fallback")).toBeVisible();
  await expect(fallbackPage.locator(".published-price-cell")).toHaveCount(48);
  await fallbackPage
    .getByRole("link", { name: "Записаться в мастерскую", exact: true })
    .click();
  await expect(fallbackPage.locator("#contacts h2")).toBeInViewport();
  await fallbackPage.close();
  console.log(
    `Verified ${origin}${prefix}: 3D/exploded view, 48 price values, 12 photos/dialogs, selection, contacts, images/fonts/base paths and mobile keyboard/reduced motion; no runtime or asset errors.`,
  );
} finally {
  await browser.close();
}
