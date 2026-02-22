import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import "../src/index";

describe("pOST /views/:slug", () => {
  it("returns 204", async () => {
    const res = await SELF.fetch("http://localhost/views/test-post", {
      method: "POST",
    });
    expect(res.status).toBe(204);
  });

  it("returns 400 for invalid slug", async () => {
    const res = await SELF.fetch("http://localhost/views/INVALID!!!", {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });
});

describe("gET /views/:slug", () => {
  it("returns count after recording views", async () => {
    await SELF.fetch("http://localhost/views/test-post", { method: "POST" });
    await SELF.fetch("http://localhost/views/test-post", { method: "POST" });
    const res = await SELF.fetch("http://localhost/views/test-post");
    expect(res.status).toBe(200);
    const body = await res.json<{ count: number }>();
    expect(body.count).toBe(2);
  });

  it("returns 0 for unknown slug", async () => {
    const res = await SELF.fetch("http://localhost/views/unknown-slug");
    expect(res.status).toBe(200);
    const body = await res.json<{ count: number }>();
    expect(body.count).toBe(0);
  });
});
