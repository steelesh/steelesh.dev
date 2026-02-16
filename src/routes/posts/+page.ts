import { categoryPath, content } from "$lib/data/content";

export function load() {
  const posts = content
    .filter(item => item.category === "post")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags)
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  const tags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return {
    posts: posts.map(item => ({
      slug: item.slug,
      name: item.name,
      subtitle: item.subtitle,
      category: item.category,
      publishedAt: item.publishedAt,
      tags: item.tags,
      devOnly: item.devOnly,
      href: `/${categoryPath(item.category)}/${item.slug}`,
    })),
    tags,
  };
}
