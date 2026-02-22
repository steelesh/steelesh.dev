import type { Component } from "svelte";

import { createContentLoader } from "$lib/content-loader";

const loader = createContentLoader("project", "projects");
const contentModules = import.meta.glob<{ default: Component }>(
  "/src/content/projects/*.svx",
);
const rawModules = import.meta.glob<string>(
  "/src/content/projects/*.svx",
  { query: "?raw", import: "default" },
);

export const entries = loader.entries;

export async function load({ params }: { params: { slug: string } }) {
  return loader.load(params, contentModules, rawModules);
}
