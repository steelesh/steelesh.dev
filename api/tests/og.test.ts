import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import "../src/index";

describe("gET /og", () => {
  it("returns 400 when title is missing", async () => {
    const res = await SELF.fetch("http://localhost/og");
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty title parameter", async () => {
    const res = await SELF.fetch("http://localhost/og?title=");
    expect(res.status).toBe(400);
  });
});
