import type { Component } from "svelte";

import { createContentLoader } from "$lib/content-loader";

const loader = createContentLoader("post", "posts");
const contentModules = import.meta.glob<{ default: Component }>(
  "/src/content/posts/*.svx",
);
const rawModules = import.meta.glob<string>(
  "/src/content/posts/*.svx",
  { query: "?raw", import: "default" },
);

export const entries = loader.entries;

export async function load({ params }: { params: { slug: string } }) {
  return loader.load(params, contentModules, rawModules);
}
