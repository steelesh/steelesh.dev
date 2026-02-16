import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ImageResponse } from "workers-og";

import type { AppEnv } from "../types.js";

import { loadFonts } from "../services/fonts.js";

const og = new Hono<AppEnv>();

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  catch {
    return "";
  }
}

function categoryLabel(category: string): string {
  switch (category) {
    case "case-study": return "Case Study";
    case "post": return "Post";
    case "project": return "Project";
    case "tag": return "Tag";
    default: return "";
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(params: {
  title: string;
  subtitle?: string;
  category?: string;
  tags?: string;
  date?: string;
}): string {
  const { title, subtitle, category, tags, date } = params;
  const formattedDate = date ? formatDate(date) : "";
  const label = category ? categoryLabel(category) : "";
  const tagList = tags?.split(",").map(t => t.trim()).filter(Boolean).slice(0, 4) ?? [];

  const metaParts: string[] = [];
  if (label)
    metaParts.push(escapeHtml(label));
  if (formattedDate)
    metaParts.push(escapeHtml(formattedDate));

  return `
    <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #1a1917; font-family: 'Anuphan', sans-serif;">
      <div style="display: flex; flex-direction: column; flex: 1; padding: 56px 72px 0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="display: flex; width: 20px; height: 2px; background-color: #57534e;"></div>
          <span style="font-family: 'Anuphan', sans-serif; font-size: 15px; color: #57534e; letter-spacing: 0.04em;">steelesh.dev</span>
        </div>
        <div style="display: flex; flex-direction: column; flex: 1; justify-content: center; gap: 20px;">
          <span style="font-family: 'Instrument Serif', serif; font-size: 72px; color: #f0ede8; line-height: 1.05; letter-spacing: -0.02em;">${escapeHtml(title)}</span>
          ${subtitle ? `<span style="font-size: 24px; color: #a8a29e; line-height: 1.4;">${escapeHtml(subtitle)}</span>` : ""}
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 72px 48px;">
        ${metaParts.length > 0 ? `<span style="font-size: 14px; color: #57534e; letter-spacing: 0.06em; text-transform: uppercase;">${metaParts.join("  ·  ")}</span>` : `<span></span>`}
        ${tagList.length > 0 ? `<div style="display: flex; gap: 12px;">${tagList.map(tag => `<span style="font-size: 13px; color: #44403c;">${escapeHtml(tag)}</span>`).join("")}</div>` : `<span></span>`}
      </div>
    </div>
  `;
}

og.get("/og", async (c) => {
  const title = c.req.query("title");
  if (!title) {
    throw new HTTPException(400, { message: "Missing required parameter: title" });
  }

  const subtitle = c.req.query("subtitle");
  const category = c.req.query("category");
  const tags = c.req.query("tags");
  const date = c.req.query("date");

  const cacheKey = new Request(c.req.url);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);

  if (cached) {
    return new Response(cached.body, cached);
  }

  const fonts = await loadFonts();
  const html = buildHtml({ title, subtitle, category, tags, date });

  const imageResponse = new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts,
  });

  const buffer = await imageResponse.arrayBuffer();

  const res = new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });

  c.executionCtx.waitUntil(cache.put(cacheKey, res.clone()));

  return res;
});

export { og };
