import type { ContentItem } from "$lib/types";
import type { Component } from "svelte";

import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { content, getContentBySlug } from "$lib/data/content";

const WORDS_PER_MINUTE = 238;

function computeReadingTime(raw: string): number {
  const stripped = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#*_~`>\-|[\]()!]/g, " ");
  const words = stripped.split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

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
      rawModules?: Record<string, () => Promise<string>>,
    ) {
      const item = getContentBySlug(category, params.slug);

      if (!item)
        error(404, "Content not found");

      if (dev && item.devOnly) {
        const mod = await import("$components/seed-placeholder.svelte");
        return {
          meta: {
            slug: item.slug,
            name: item.name,
            title: item.title,
            subtitle: item.subtitle,
            tags: item.tags,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            readingTime: 1,
            coverImage: item.coverImage,
            coverImageAlt: item.coverImageAlt,
            headerColor: item.headerColor,
            headerTheme: item.headerTheme,
            coverHeight: item.coverHeight,
            devOnly: true,
          },
          content: mod.default,
        };
      }

      const modulePath = `/src/content/${contentDir}/${params.slug}.svx`;
      const moduleLoader = contentModules[modulePath];

      if (!moduleLoader)
        error(404, "Content file not found");

      const mod = await moduleLoader();

      let readingTime: number | undefined;
      if (rawModules?.[modulePath]) {
        const raw = await rawModules[modulePath]();
        readingTime = computeReadingTime(raw);
      }

      return {
        meta: {
          slug: item.slug,
          name: item.name,
          title: item.title,
          subtitle: item.subtitle,
          tags: item.tags,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          readingTime,
          coverImage: item.coverImage,
          coverImageAlt: item.coverImageAlt,
          headerColor: item.headerColor,
          headerTheme: item.headerTheme,
          coverHeight: item.coverHeight,
        },
        content: mod.default,
      };
    },
  };
}
