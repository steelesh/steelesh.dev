import { env, SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import "../src/index";

beforeEach(async () => {
  await env.DB.exec(`
    DELETE FROM likes;
    DELETE FROM like_counts;
  `);
});

describe("gET /likes/:slug", () => {
  it("returns 0 for unknown slug", async () => {
    const res = await SELF.fetch("http://localhost/likes/test-post");
    expect(res.status).toBe(200);
    const body = await res.json<{ count: number }>();
    expect(body.count).toBe(0);
  });

  it("returns 400 for invalid slug", async () => {
    const res = await SELF.fetch("http://localhost/likes/INVALID!!!");
    expect(res.status).toBe(400);
  });
});

describe("pOST /likes/:slug", () => {
  it("creates a like and returns count", async () => {
    const res = await SELF.fetch("http://localhost/likes/test-post", {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ count: number; liked: boolean }>();
    expect(body.count).toBe(1);
    expect(body.liked).toBe(true);
  });

  it("is idempotent for same IP", async () => {
    await SELF.fetch("http://localhost/likes/test-post", { method: "POST" });
    const res = await SELF.fetch("http://localhost/likes/test-post", {
      method: "POST",
    });
    const body = await res.json<{ count: number; liked: boolean }>();
    expect(body.count).toBe(1);
    expect(body.liked).toBe(false);
  });
});
