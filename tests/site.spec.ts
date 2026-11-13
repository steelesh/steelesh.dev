import { expect, test } from "@playwright/test";

const origin = "https://steelesh.dev";

test("standalone page metadata points to its own route", async ({ page }) => {
  await page.goto("/accessibility");
  await expect(page.locator("link[rel=\"canonical\"]")).toHaveAttribute("href", `${origin}/accessibility`);
  await expect(page.locator("meta[property=\"og:url\"]")).toHaveAttribute("content", `${origin}/accessibility`);
  await expect(page.locator("meta[property=\"og:type\"]")).toHaveAttribute("content", "website");
});

test("production routes and feeds exclude draft posts", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator("a[href^=\"/w/\"]")).toHaveCount(0);
  for (const path of ["/w/example-post", "/w/example-note"])
    expect((await request.get(path)).status()).toBe(404);
  const json = await request.get("/feed.json");
  expect(json.ok()).toBe(true);
  expect(json.headers()["content-type"]).toContain("application/json");
  const feed = await json.json();
  expect(feed.version).toContain("https://jsonfeed.org/version/");
  expect(JSON.stringify(feed.items)).not.toContain("example-post");
  expect(JSON.stringify(feed.items)).not.toContain("example-note");
  const rss = await request.get("/feed.xml");
  expect(rss.ok()).toBe(true);
  expect(rss.headers()["content-type"]).toContain("text/xml");
  const xml = await rss.text();
  expect(xml).toContain("<rss");
  expect(xml).not.toContain("example-post");
  expect(xml).not.toContain("example-note");
});

test("theme persists through navigation and reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("link", { name: "Accessibility", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("theme remains usable when storage is blocked", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("Storage blocked", "SecurityError"); },
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

test("email and accessibility links work without javascript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("link", { name: "Send email to steele@steelesh.dev" })).toHaveAttribute("href", "mailto:steele@steelesh.dev");
  await page.getByRole("link", { name: "Accessibility", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Accessibility Statement");
  await context.close();
});
