<script lang="ts">
  import { Check, Copy } from "@lucide/svelte";

  interface Props {
    code: string;
    language?: string;
    highlightedHtml?: string;
  }

  const { code, language, highlightedHtml }: Props = $props();

  let copied = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    return () => clearTimeout(timeoutId);
  });

  async function copyText() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, 1500);
    }
    catch {}
  }
</script>

<div class="code-block">
  {#if language}
    <span class="code-block__lang">{language}</span>
  {/if}
  <button class="code-block__copy" class:copied aria-label="Copy code" onclick={copyText}>
    {#if copied}
      <Check size={14} strokeWidth={2} />
    {:else}
      <Copy size={14} strokeWidth={2} />
    {/if}
  </button>
  {#if highlightedHtml}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time Shiki output, not user input -->
    {@html highlightedHtml}
  {:else}
    <pre class="code-block__pre"><code>{code}</code></pre>
  {/if}
</div>

<style>
  .code-block {
    position: relative;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  .code-block__lang {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--cb-lang, rgba(255, 255, 255, 0.5));
    pointer-events: none;
    z-index: 1;
    transition: opacity var(--duration-fast, 200ms) var(--ease-out, ease);
  }

  .code-block:hover .code-block__lang {
    opacity: 0;
  }

  .code-block__copy {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    background: none;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    color: var(--cb-lang, rgba(255, 255, 255, 0.5));
    opacity: 0;
    transition:
      opacity var(--duration-fast, 200ms) var(--ease-out, ease),
      color var(--duration-fast, 200ms) var(--ease-out, ease),
      border-color var(--duration-fast, 200ms) var(--ease-out, ease);
    z-index: 2;
  }

  .code-block:hover .code-block__copy,
  .code-block__copy:focus-visible {
    opacity: 1;
  }

  .code-block__copy:hover {
    color: var(--fg-muted);
    border-color: var(--border-color);
  }

  .code-block__copy.copied {
    color: var(--current, #10b981);
    opacity: 1;
  }

  .code-block__pre {
    margin: 0;
    padding: 1.25rem 1rem;
    background: var(--code-bg);
    color: var(--code-fg);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    -webkit-overflow-scrolling: touch;
  }

  .code-block__pre code {
    white-space: pre;
  }

  .code-block :global(pre.shiki) {
    margin: 0;
    padding: 1.25rem 1rem;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    -webkit-overflow-scrolling: touch;
  }

  .code-block :global(pre.shiki code) {
    white-space: pre;
  }

  @media (prefers-reduced-motion: reduce) {
    .code-block__lang,
    .code-block__copy {
      transition: none;
    }
  }

  @media (hover: none) {
    .code-block__copy {
      opacity: 0.6;
      padding: 0.75rem;
    }

    .code-block__lang {
      display: none;
    }
  }
</style>
