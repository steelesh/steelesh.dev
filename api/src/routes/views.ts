import { Hono } from "hono";

import type { AppEnv } from "../types.js";

import { hashIp } from "../utils/ip-hash.js";
import { validateSlug } from "../utils/validate-slug.js";

const VIEW_DEDUP_TTL = 86400;

const views = new Hono<AppEnv>();

views.post("/views/:slug", async (c) => {
  const slug = c.req.param("slug");
  validateSlug(slug);

  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown";
  const ipHash = await hashIp(ip, c.env.IP_HASH_SALT);
  const dedupKey = `view:${slug}:${ipHash}`;

  const existing = await c.env.RATE_LIMIT.get(dedupKey);
  if (existing) {
    return c.body(null, 204);
  }

  await Promise.all([
    c.env.RATE_LIMIT.put(dedupKey, "1", { expirationTtl: VIEW_DEDUP_TTL }),
    c.env.DB.prepare(
      "INSERT INTO view_counts (slug, count) VALUES (?, 1) ON CONFLICT (slug) DO UPDATE SET count = count + 1",
    )
      .bind(slug)
      .run(),
  ]);

  return c.body(null, 204);
});

views.get("/views/:slug", async (c) => {
  const slug = c.req.param("slug");
  validateSlug(slug);

  const row = await c.env.DB.prepare("SELECT count FROM view_counts WHERE slug = ?")
    .bind(slug)
    .first<{ count: number }>();

  c.header("Cache-Control", "public, max-age=0, s-maxage=300");
  return c.json({ count: row?.count ?? 0 });
});

export { views };
