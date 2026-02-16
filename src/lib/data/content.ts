import type { ContentItem } from "$lib/types";

import { dev } from "$app/environment";
import gitmsgCover from "$lib/assets/covers/gitmsg.png?enhanced";
import ucollabDarkCover from "$lib/assets/covers/ucollab-dark.webp?enhanced";
import ucollabLightCover from "$lib/assets/covers/ucollab-light.webp?enhanced";

const seedContent: ContentItem[] = dev && import.meta.env.VITE_SEED === "true"
  ? (await import("$lib/data/content-seed")).generateSeedContent()
  : [];

const baseContent: ContentItem[] = [
  {
    slug: "ucollab",
    name: "UCollab",
    title: "UCollab: A Collaborative Coding Platform",
    subtitle: "A collaborative coding platform built for university students.",
    category: "project",
    description: "Collaborative coding platform for university students.",
    tags: ["Next.js", "MySQL", "Redis", "Azure"],
    publishedAt: "2025-04-15",
    coverImage: { light: ucollabDarkCover, dark: ucollabLightCover },
    coverImageAlt: "UCollab landing page",
    coverHeight: "half",
  },
  {
    slug: "gitmsg",
    name: "GitMsg",
    title: "Building a Local AI Commit Message Generator",
    subtitle: "A Go CLI that turns staged diffs into conventional commit messages using a local LLM.",
    category: "project",
    description: "Go CLI that generates conventional commit messages from staged diffs using a local LLM.",
    tags: ["Go", "Ollama"],
    publishedAt: "2025-08-01",
    coverImage: gitmsgCover,
    coverImageAlt: "GitMsg logo on dark background",
    coverHeight: "half",
  },
];

export const content: ContentItem[] = [...baseContent, ...seedContent];

export const tagIndex: ReadonlyMap<string, readonly ContentItem[]> = (() => {
  const map = new Map<string, ContentItem[]>();
  for (const item of content) {
    for (const tag of item.tags) {
      const existing = map.get(tag) ?? [];
      existing.push(item);
      map.set(tag, existing);
    }
  }
  return map;
})();

export function getContentBySlug(
  category: ContentItem["category"],
  slug: string,
): ContentItem | undefined {
  return content.find(
    item => item.category === category && item.slug === slug,
  );
}

export function categoryPath(category: ContentItem["category"]): string {
  const map: Record<ContentItem["category"], string> = {
    "project": "projects",
    "case-study": "case-studies",
    "post": "posts",
  };
  return map[category];
}

export function getSeriesItems(series: string): ContentItem[] {
  return content
    .filter(item => item.series === series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export function getSeriesPrevNext(slug: string): { prev?: ContentItem; next?: ContentItem } | null {
  const item = content.find(i => i.slug === slug);
  if (!item?.series)
    return null;
  const items = getSeriesItems(item.series);
  const idx = items.findIndex(i => i.slug === slug);
  if (idx === -1)
    return null;
  return {
    prev: items[idx - 1],
    next: items[idx + 1],
  };
}

export function getRelatedContent(currentSlug: string, count = 2): ContentItem[] {
  const current = content.find(item => item.slug === currentSlug);
  if (!current)
    return content.slice(0, count);

  const candidates = content.filter(item => item.slug !== currentSlug);
  const currentTags = new Set(current.tags);

  const scored = candidates.map((item) => {
    let score = 0;
    if (item.category === current.category)
      score += 3;
    for (const tag of item.tags) {
      if (currentTags.has(tag))
        score += 2;
    }
    return { item, score };
  });

  scored.sort((a, b) =>
    b.score - a.score
    || new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime(),
  );

  return scored.slice(0, count).map(s => s.item);
}
