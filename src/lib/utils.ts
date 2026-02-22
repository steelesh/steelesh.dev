import type { ContentItem } from "$lib/types";

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCount(n: number): string {
  if (n >= 1000)
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function categoryLabel(category: ContentItem["category"]): string {
  return category === "case-study"
    ? "Case Study"
    : category === "post"
      ? "Post"
      : "Project";
}
