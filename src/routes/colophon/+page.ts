import type { Component } from "svelte";

const contentModules = import.meta.glob<{ default: Component }>(
  "/src/content/colophon.svx",
);

export async function load() {
  const modulePath = "/src/content/colophon.svx";
  const mod = await contentModules[modulePath]();
  return { content: mod.default };
}
