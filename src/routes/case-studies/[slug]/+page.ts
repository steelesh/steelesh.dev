import type { Component } from "svelte";

import { createContentLoader } from "$lib/content-loader";

const loader = createContentLoader("case-study", "case-studies");
const contentModules = import.meta.glob<{ default: Component }>(
  "/src/content/case-studies/*.svx",
);
const rawModules = import.meta.glob<string>(
  "/src/content/case-studies/*.svx",
  { query: "?raw", import: "default" },
);

export const entries = loader.entries;

export async function load({ params }: { params: { slug: string } }) {
  return loader.load(params, contentModules, rawModules);
}
