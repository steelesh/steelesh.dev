import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import "../src/index";

describe("pOST /chat", () => {
  it("returns 400 for empty body", async () => {
    const res = await SELF.fetch("http://localhost/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing message", async () => {
    const res = await SELF.fetch("http://localhost/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty message", async () => {
    const res = await SELF.fetch("http://localhost/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "", history: [] }),
    });
    expect(res.status).toBe(400);
  });
});

describe("pOST /chat/stream", () => {
  it("returns 400 for empty body", async () => {
    const res = await SELF.fetch("http://localhost/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});
