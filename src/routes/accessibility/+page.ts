import type { Component } from "svelte";

const contentModules = import.meta.glob<{ default: Component }>(
  "/src/content/accessibility.svx",
);

export async function load() {
  const modulePath = "/src/content/accessibility.svx";
  const mod = await contentModules[modulePath]();
  return { content: mod.default };
}
