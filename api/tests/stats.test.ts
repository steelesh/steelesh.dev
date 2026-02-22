import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import "../src/index";

describe("pOST /stats/batch", () => {
  it("returns zeros for unknown slugs", async () => {
    const res = await SELF.fetch("http://localhost/stats/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: ["test-post", "another-post"] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ stats: Record<string, { views: number; likes: number }> }>();
    expect(body.stats["test-post"]).toEqual({ views: 0, likes: 0 });
    expect(body.stats["another-post"]).toEqual({ views: 0, likes: 0 });
  });

  it("returns counts after recording views and likes", async () => {
    await SELF.fetch("http://localhost/views/test-post", { method: "POST" });
    await SELF.fetch("http://localhost/views/test-post", { method: "POST" });
    await SELF.fetch("http://localhost/likes/test-post", { method: "POST" });

    const res = await SELF.fetch("http://localhost/stats/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: ["test-post"] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ stats: Record<string, { views: number; likes: number }> }>();
    expect(body.stats["test-post"].views).toBe(2);
    expect(body.stats["test-post"].likes).toBe(1);
  });

  it("returns 400 for empty slugs array", async () => {
    const res = await SELF.fetch("http://localhost/stats/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing slugs", async () => {
    const res = await SELF.fetch("http://localhost/stats/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid slug in batch", async () => {
    const res = await SELF.fetch("http://localhost/stats/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: ["valid-slug", "INVALID!!!"] }),
    });
    expect(res.status).toBe(400);
  });
});
