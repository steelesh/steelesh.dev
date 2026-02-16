import { description, title, url } from "$lib/config";
import { categoryPath, content } from "$lib/data/content";
import { Feed } from "feed";

export function buildFeed(): Feed {
  const items = content
    .filter(item => !item.devOnly)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const feed = new Feed({
    title,
    description,
    id: url,
    link: url,
    language: "en",
    copyright: `© ${new Date().getFullYear()} Steele S.`,
    feedLinks: {
      rss: `${url}feed.xml`,
      json: `${url}feed.json`,
    },
    author: {
      name: "Steele S.",
      link: url,
    },
    updated: items.length > 0
      ? new Date(items[0].updatedAt ?? items[0].publishedAt)
      : new Date(),
  });

  for (const item of items) {
    const itemUrl = `${url}${categoryPath(item.category)}/${item.slug}`;
    feed.addItem({
      title: item.title,
      id: itemUrl,
      link: itemUrl,
      description: item.description,
      date: new Date(item.publishedAt),
      ...(item.updatedAt ? { updated: new Date(item.updatedAt) } : {}),
      category: item.tags.map(tag => ({ name: tag })),
    });
  }

  return feed;
}
