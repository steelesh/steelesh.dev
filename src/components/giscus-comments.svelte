<script lang="ts">
  import Giscus from "@giscus/svelte";
  import { page } from "$app/state";

  interface Props {
    theme: "light" | "dark";
  }

  const { theme }: Props = $props();

  const themeBase = $derived(
    page.url.hostname === "localhost" || page.url.hostname === "127.0.0.1"
      ? "https://steelesh-dev.pages.dev"
      : page.url.origin,
  );
  const giscusTheme = $derived(`${themeBase}/giscus-${theme}.css`);
</script>

<svelte:boundary onerror={e => console.error("[giscus]", e)}>
  <Giscus
    id="giscus-comments"
    term=""
    repo="steelesh/steelesh.dev"
    repoId="R_kgDOOTlX5g"
    category="default"
    categoryId="DIC_kwDOOTlX5s4C2Sdw"
    mapping="pathname"
    strict="1"
    reactionsEnabled="0"
    emitMetadata="0"
    inputPosition="top"
    theme={giscusTheme}
    lang="en"
    loading="lazy"
  />
  {#snippet failed(_error, reset)}
    <p class="giscus-error">Comments failed to load. <button onclick={reset}>Retry</button></p>
  {/snippet}
</svelte:boundary>

<style>
  .giscus-error {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
  }

  .giscus-error button {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-subtle);
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 0.25rem 0.75rem;
    margin-left: 0.5rem;
  }
</style>
