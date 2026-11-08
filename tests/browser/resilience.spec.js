import { test, expect } from "@playwright/test";

test("failed optional 3D module keeps prices, photos and contact booking available", async ({
  page,
}) => {
  await page.route("**/src/components/WheelScene.jsx*", (route) =>
    route.abort("failed"),
  );
  await page.goto("/");
  await expect(page.locator(".wheel-fallback")).toBeVisible();
  await expect(page.locator(".published-price-cell")).toHaveCount(48);
  await expect(page.locator(".gallery-photo-button")).toHaveCount(12);
  await page
    .getByRole("link", { name: "Записаться в мастерскую", exact: true })
    .click();
  await expect(page.locator("#contacts h2")).toBeInViewport();
});

test("a delayed clipboard response does not confirm an outdated inquiry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((resolve) => {
            window.__resolveCopy = resolve;
          }),
      },
    });
  });
  await page.goto("/");
  const prices = page.locator("#prices");
  await prices.getByRole("button", { name: "Скопировать запрос" }).click();
  await prices.getByRole("button", { name: "R18", exact: true }).click();
  await page.evaluate(() => window.__resolveCopy());
  await expect(
    prices.getByRole("button", { name: "Скопировать запрос" }),
  ).toBeVisible();
  await expect(
    prices.getByRole("button", { name: "Запрос скопирован" }),
  ).toHaveCount(0);
});

test("focus indicators stay visible within rounded hero and contact cards", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const navigationTargets = await page
    .locator(".desktop-nav a")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
      })),
    );
  expect(
    navigationTargets.every(
      (target) => target.width >= 44 && target.height >= 44,
    ),
  ).toBe(true);
  for (const selector of [".hero-info > a", ".contact-location > a"]) {
    const link = page.locator(selector).first();
    await link.focus();
    await expect(link).toBeFocused();
    const style = await link.evaluate((el) => ({
      width: getComputedStyle(el).outlineWidth,
      offset: getComputedStyle(el).outlineOffset,
      color: getComputedStyle(el).outlineColor,
    }));
    expect(style.width).toBe("3px");
    expect(style.offset).toBe("-5px");
    expect(style.color).toBe("rgb(36, 86, 238)");
  }
});
