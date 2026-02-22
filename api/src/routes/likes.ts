import { Hono } from "hono";

import type { AppEnv } from "../types.js";

import { likesRateLimit } from "../middleware/rate-limit.js";
import { hashIp } from "../utils/ip-hash.js";
import { validateSlug } from "../utils/validate-slug.js";

const likes = new Hono<AppEnv>();

likes.get("/likes/:slug", async (c) => {
  const slug = c.req.param("slug");
  validateSlug(slug);

  const row = await c.env.DB.prepare("SELECT count FROM like_counts WHERE slug = ?")
    .bind(slug)
    .first<{ count: number }>();

  c.header("Cache-Control", "public, max-age=0, s-maxage=60");
  return c.json({ count: row?.count ?? 0 });
});

likes.post("/likes/:slug", likesRateLimit, async (c) => {
  const slug = c.req.param("slug");
  validateSlug(slug);

  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const ipHash = await hashIp(ip, c.env.IP_HASH_SALT);

  const { meta } = await c.env.DB.prepare("INSERT OR IGNORE INTO likes (slug, ip_hash) VALUES (?, ?)")
    .bind(slug, ipHash)
    .run();
  const isNew = meta.changes > 0;

  if (isNew) {
    await c.env.DB.prepare(
      "INSERT INTO like_counts (slug, count) VALUES (?, 1) ON CONFLICT (slug) DO UPDATE SET count = count + 1",
    )
      .bind(slug)
      .run();
  }

  const row = await c.env.DB.prepare("SELECT count FROM like_counts WHERE slug = ?")
    .bind(slug)
    .first<{ count: number }>();

  return c.json({ count: row?.count ?? 0, liked: isNew });
});

export { likes };
