import type { ContentItem } from "$lib/types";

import { dev } from "$app/environment";

const allContent: ContentItem[] = [
  {
    slug: "example-post",
    name: "{example-post}",
    title: "{example-post}",
    subtitle: "Draft post for testing.",
    category: "post",
    description: "Draft post for testing.",
    tags: [],
    publishedAt: "2026-04-14",
    draft: true,
  },
  {
    slug: "example-note",
    name: "{example-note}",
    title: "{example-note}",
    subtitle: "Draft note for testing.",
    category: "post",
    description: "Draft note for testing.",
    tags: [],
    publishedAt: "2026-04-14",
    draft: true,
    minimal: true,
  },
];

const showDrafts = dev && import.meta.env.VITE_SHOW_DRAFTS !== "false";
export const content: ContentItem[] = showDrafts ? allContent : allContent.filter(item => !item.draft);

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

export function categoryPath(_category: ContentItem["category"]): string {
  return "w";
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
