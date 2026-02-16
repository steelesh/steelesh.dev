import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import type { AppEnv } from "../types.js";

import { MAX_SLUG_LENGTH, SLUG_PATTERN } from "../utils/validate-slug.js";

const MAX_BATCH_SIZE = 50;

const stats = new Hono<AppEnv>();

stats.post("/stats/batch", async (c) => {
  const body = await c.req.json<{ slugs?: string[] }>();

  if (!Array.isArray(body.slugs) || body.slugs.length === 0) {
    throw new HTTPException(400, { message: "slugs must be a non-empty array." });
  }

  if (body.slugs.length > MAX_BATCH_SIZE) {
    throw new HTTPException(400, { message: `Maximum ${MAX_BATCH_SIZE} slugs per request.` });
  }

  for (const slug of body.slugs) {
    if (typeof slug !== "string" || !slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
      throw new HTTPException(400, { message: "Invalid slug" });
    }
  }

  const placeholders = body.slugs.map(() => "?").join(", ");

  const [viewRows, likeRows] = await Promise.all([
    c.env.DB.prepare(`SELECT slug, count FROM view_counts WHERE slug IN (${placeholders})`)
      .bind(...body.slugs)
      .all<{ slug: string; count: number }>(),
    c.env.DB.prepare(`SELECT slug, count FROM like_counts WHERE slug IN (${placeholders})`)
      .bind(...body.slugs)
      .all<{ slug: string; count: number }>(),
  ]);

  const result: Record<string, { views: number; likes: number }> = {};

  for (const slug of body.slugs) {
    result[slug] = { views: 0, likes: 0 };
  }

  for (const row of viewRows.results) {
    if (result[row.slug]) {
      result[row.slug].views = row.count;
    }
  }

  for (const row of likeRows.results) {
    if (result[row.slug]) {
      result[row.slug].likes = row.count;
    }
  }

  c.header("Cache-Control", "public, max-age=0, s-maxage=300");
  return c.json({ stats: result });
});

export { stats };
