import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", label: "Homepage" },
  { path: "/w/ucollab", label: "Writing" },
  { path: "/accessibility", label: "Accessibility" },
];

for (const { path, label } of routes) {
  test(`${label} (${path}) has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();

    const violations = results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
      targets: v.nodes.map(n => n.target),
    }));

    expect(violations, `Found ${violations.length} violations`).toEqual([]);
  });
}
