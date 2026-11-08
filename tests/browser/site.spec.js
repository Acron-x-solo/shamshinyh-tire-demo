import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("appointment links lead to both verified phones in the same page", async ({
  page,
  context,
}) => {
  await page.goto("/");
  for (const name of [
    "Записаться в мастерскую",
    "Записаться",
    "Обсудить и записаться",
  ]) {
    const link = page.getByRole("link", { name, exact: true }).first();
    await expect(link).toHaveAttribute("href", "#contacts");
    await link.click();
    await expect(page).toHaveURL(/#contacts$/);
    await expect(page.locator("#contacts h2")).toBeInViewport();
  }
  await expect(page.locator("#contacts .contact-phone")).toHaveAttribute(
    "href",
    "tel:+79059564469",
  );
  await expect(page.locator("#contacts .contact-phone")).toBeVisible();
  await expect(
    page.locator('#contacts a[href="tel:+79138918022"]'),
  ).toBeVisible();
  expect(context.pages()).toHaveLength(1);
});

test("service selection changes the real photo and description", async ({
  page,
}) => {
  await page.goto("/");
  const services = page.locator("#services");
  for (const [name, heading, photo] of [
    ["Ремонт шин", "Ремонт шин", "technician-at-work.webp"],
    ["Диски", "Работа с дисками", "chrome-wheel.webp"],
    ["Хранение", "Хранение шин", "tires-equipment.webp"],
    ["Смена шин", "Шиномонтаж", "wheel-balancing.webp"],
  ]) {
    const button = services.getByRole("button", { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(services.locator(".service-copy h3")).toHaveText(heading);
    const panelHeight = await services
      .locator(".service-panel-body")
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(panelHeight).toBeLessThanOrEqual(650);
    await expect(services.locator(".service-photo img")).toHaveAttribute(
      "src",
      new RegExp(photo),
    );
  }
});

test("all 48 visible price values and source limitations remain available", async ({
  page,
}) => {
  await page.goto("/");
  const prices = page.locator("#prices");
  await expect(prices.locator(".published-price-cell")).toHaveCount(48);
  await expect(prices.locator(".vehicle-price-card")).toHaveCount(3);
  await expect(prices.locator(".disc-price-card")).toHaveCount(3);
  await expect(prices.locator(".extra-price")).toHaveCount(4);
  await expect(prices.locator(".price-source-bar")).toContainText("17.04.2026");
  await expect(prices.locator(".price-source-bar")).toContainText(
    "Дата действия цен на фото не указана",
  );
  await expect(prices.locator(".full-prices-heading")).toContainText(
    "Количество колёс в строке комплекса не указано",
  );
  await expect(prices.locator(".price-condition")).toContainText(
    "150 руб. за колесо",
  );
  await expect(prices.locator(".uncertain-price")).toHaveCount(1);
  await expect(prices.locator(".uncertain-price").locator("..")).toContainText(
    "170 ₽",
  );
  const selected = prices.locator(".selected-price");
  await expect(selected.locator("strong")).toHaveText("3 000 ₽");
  await prices.getByRole("button", { name: "Джип", exact: true }).click();
  await prices.getByRole("button", { name: "R24", exact: true }).click();
  await expect(selected.locator("strong")).toHaveText("7 500 ₽");
  await prices
    .getByRole("button", { name: "Балансировка", exact: true })
    .click();
  await expect(selected.locator("strong")).toHaveText("3 200 ₽");
  await expect(selected).toContainText("За 4 колеса");
  await prices.getByRole("button", { name: "Седан", exact: true }).click();
  await expect(selected).toContainText("Уточним стоимость");
  await prices.getByRole("button", { name: "Не знаю размер" }).click();
  await expect(prices.locator(".price-selection")).toContainText(
    "Размер уточним",
  );
});

test("inquiry can be copied and remains usable when clipboard permission is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__copiedInquiry = text;
        },
      },
    });
  });
  await page.goto("/");
  const prices = page.locator("#prices");
  await prices.getByRole("button", { name: "Скопировать запрос" }).click();
  await expect(
    prices.getByRole("button", { name: "Запрос скопирован" }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__copiedInquiry)).toContain(
    "автомобиль: седан; R16",
  );
  expect(await page.evaluate(() => window.__copiedInquiry)).toContain(
    "подтвердить актуальную стоимость",
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await prices.getByRole("button", { name: "Не знаю размер" }).click();
  await prices.getByRole("button", { name: "Скопировать запрос" }).click();
  const fallback = prices.getByRole("textbox", {
    name: "Выдели и скопируй текст запроса",
  });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveValue(/размер уточню/);
  await fallback.focus();
  expect(
    await fallback.evaluate((el) => el.selectionEnd - el.selectionStart),
  ).toBeGreaterThan(200);
});

test("both photo dialogs trap focus, respond to the keyboard and restore the opener", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Посмотреть оригинал" });
  await opener.click();
  const price = page.getByRole("dialog", {
    name: "Оригинальный прайс из 2ГИС",
  });
  await expect(price).toBeVisible();
  await expect(price.locator("img")).toHaveJSProperty("complete", true);
  expect(
    await price.locator("img").evaluate((img) => img.naturalWidth),
  ).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  const photos = page.locator("#gallery .gallery-photo-button");
  await expect(photos).toHaveCount(12);
  await photos.first().click();
  const gallery = page.getByRole("dialog", { name: "Фотографии мастерской" });
  await expect(gallery).toBeVisible();
  await expect(gallery.locator(".lightbox-counter")).toHaveText("01 / 12");
  await page.keyboard.press("ArrowRight");
  await expect(gallery.locator(".lightbox-counter")).toHaveText("02 / 12");
  await page.keyboard.press("ArrowLeft");
  await expect(gallery.locator(".lightbox-counter")).toHaveText("01 / 12");
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(
      await gallery.evaluate((dialog) =>
        dialog.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(photos.first()).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("wheel rotation, exploded view, pause and context restoration work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".wheel-scene")).toHaveClass(/scene-ready/);
  await page.getByRole("button", { name: "Разобрать колесо" }).click();
  await expect(
    page.getByRole("button", { name: "Собрать колесо" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Повернуть колесо вправо" }).click();
  await page.getByRole("button", { name: "Приостановить 3D-анимацию" }).click();
  await expect(
    page.getByRole("button", { name: "Включить 3D-анимацию" }),
  ).toHaveAttribute("aria-pressed", "true");
  const canvas = page.locator(".wheel-scene canvas");
  await page.waitForTimeout(1800);
  const frame = await canvas.screenshot();
  await page.waitForTimeout(350);
  expect((await canvas.screenshot()).equals(frame)).toBe(true);
  await page.evaluate(() => {
    window.__wheelLoss = document
      .querySelector(".wheel-scene canvas")
      .getContext("webgl2")
      .getExtension("WEBGL_lose_context");
    window.__wheelLoss.loseContext();
  });
  await expect(page.locator(".wheel-fallback")).toBeVisible();
  await expect(page.locator(".wheel-controls")).toHaveCount(0);
  await page.evaluate(() => window.__wheelLoss.restoreContext());
  await expect(page.locator(".wheel-scene")).toHaveClass(/scene-ready/);
  await expect(
    page.getByRole("button", { name: "Включить 3D-анимацию" }),
  ).toBeVisible();
});

test("small screens, reduced motion and WebGL fallback retain useful content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return kind.includes("webgl") ? null : original.call(this, kind, ...args);
    };
  });
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".wheel-fallback")).toBeVisible();
    await expect(page.locator(".wheel-controls")).toHaveCount(0);
    const diameterTargets = await page
      .locator(".pick-diameter button")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().width),
      );
    expect(diameterTargets.every((width) => width >= 44)).toBe(true);
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page
      .locator("#mobile-menu")
      .getByRole("link", { name: "Услуги" })
      .click();
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    for (const id of ["services", "prices", "gallery", "contacts"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
    }
    await page.getByRole("button", { name: "Посмотреть оригинал" }).click();
    const dialog = page.getByRole("dialog", {
      name: "Оригинальный прайс из 2ГИС",
    });
    await expect(
      dialog.getByRole("button", { name: "Закрыть прайс" }),
    ).toBeInViewport();
    await page.keyboard.press("Escape");
  }
});

test("landscape dialogs keep controls visible", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".gallery-photo-button").first().click();
  const gallery = page.getByRole("dialog", { name: "Фотографии мастерской" });
  for (const name of [
    "Закрыть фотографии",
    "Следующее фото",
    "Предыдущее фото",
  ]) {
    await expect(gallery.getByRole("button", { name })).toBeInViewport();
  }
  await page.keyboard.press("Escape");
});

test("page and dialogs pass automatic accessibility checks with no runtime or asset errors", async ({
  page,
}) => {
  test.setTimeout(60000);
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://localhost:5175") &&
      response.status() >= 400
    )
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  for (const id of ["services", "prices", "gallery", "contacts"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
  }
  for (const img of await page.locator("img:visible").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty("complete", true);
    expect(await img.evaluate((image) => image.naturalWidth)).toBeGreaterThan(
      0,
    );
  }
  const axe = () =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
  expect((await axe()).violations).toEqual([]);
  await page.getByRole("button", { name: "Посмотреть оригинал" }).click();
  expect((await axe()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.locator(".gallery-photo-button").first().click();
  expect((await axe()).violations).toEqual([]);
  expect(failures).toEqual([]);
});
