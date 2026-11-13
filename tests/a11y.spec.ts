import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const path of ["/", "/accessibility"]) {
      test(`${path} has no automated accessibility violations`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.ok()).toBe(true);
        await expect(page.locator("h1")).toHaveCount(1);
        const results = await new AxeBuilder({ page })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21aa",
            "wcag22aa",
          ])
          .analyze();
        expect(results.violations).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
  });
}
