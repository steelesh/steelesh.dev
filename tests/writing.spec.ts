import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/w/example-post", "/w/example-note"]) {
  test(`${path} renders draft writing and code accessibly`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("pre code").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21aa",
        "wcag22aa",
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("copy code announces success", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => sessionStorage.setItem("copied-code", text),
      },
    });
  });
  await page.goto("/w/example-post");
  const code = await page.locator("pre code").first().textContent();
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByRole("status").first()).toHaveText("Code copied to clipboard.");
  expect(await page.evaluate(() => sessionStorage.getItem("copied-code"))).toBe(code);
});

test("copy failure explains how to recover", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => { throw new Error("Clipboard blocked"); },
      },
    });
  });
  await page.goto("/w/example-post");
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByRole("status").first()).toContainText("Select the code and copy it manually.");
});
