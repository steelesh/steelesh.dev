import type { Component } from "svelte";

import { createContentLoader } from "$lib/content-loader";

const loader = createContentLoader("post", "writing");
const contentModules = import.meta.glob<{ default: Component }>(
  "/src/content/writing/*.svx",
);

export const entries = loader.entries;

export async function load({ params }: { params: { slug: string } }) {
  return loader.load(params, contentModules);
}
