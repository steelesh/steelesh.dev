import { error } from "@sveltejs/kit";
import { categoryPath, tagIndex } from "$lib/data/content";
import { techLinks } from "$lib/data/tech-links";

export function entries() {
  return [...tagIndex.keys()].map(tag => ({ tag: encodeURIComponent(tag) }));
}

export function load({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const items = tagIndex.get(tag);

  if (!items || items.length === 0)
    error(404, `No content tagged "${tag}"`);

  const coTags = new Map<string, number>();
  for (const item of items) {
    for (const t of item.tags) {
      if (t !== tag)
        coTags.set(t, (coTags.get(t) ?? 0) + 1);
    }
  }
  const relatedTags = [...coTags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t]) => t);

  return {
    tag,
    docUrl: techLinks[tag],
    relatedTags,
    items: items.map(item => ({
      slug: item.slug,
      name: item.name,
      subtitle: item.subtitle,
      category: item.category,
      publishedAt: item.publishedAt,
      tags: item.tags,
      devOnly: item.devOnly,
      href: `/${categoryPath(item.category)}/${item.slug}`,
    })),
  };
}
