import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import "../src/index";

describe("gET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await SELF.fetch("http://localhost/health");
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string; timestamp: string }>();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });
});
