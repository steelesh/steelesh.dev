import type { ContentItem } from "$lib/types";
import type { Component } from "svelte";

import { error } from "@sveltejs/kit";
import { content, getContentBySlug } from "$lib/data/content";

export function createContentLoader(
  category: ContentItem["category"],
  contentDir: string,
) {
  return {
    entries() {
      return content
        .filter(item => item.category === category)
        .map(item => ({ slug: item.slug }));
    },

    async load(
      params: { slug: string },
      contentModules: Record<
        string,
        () => Promise<{ default: Component }>
      >,
    ) {
      const item = getContentBySlug(category, params.slug);

      if (!item)
        error(404, "Content not found");

      const modulePath = `/src/content/${contentDir}/${params.slug}.svx`;
      const moduleLoader = contentModules[modulePath];

      if (!moduleLoader)
        error(404, "Content file not found");

      const mod = await moduleLoader();

      return {
        meta: {
          slug: item.slug,
          name: item.name,
          title: item.title,
          subtitle: item.subtitle,
          tags: item.tags,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          minimal: item.minimal,
        },
        content: mod.default,
      };
    },
  };
}
