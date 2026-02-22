<script lang="ts">
  import { Check, Share2 } from "@lucide/svelte";
  import { browser } from "$app/environment";

  interface Props {
    title: string;
    url: string;
  }

  const { title, url }: Props = $props();

  let copied = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    return () => clearTimeout(timeoutId);
  });

  async function handleClick() {
    if (!browser)
      return;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      }
      catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, 1500);
    }
    catch {}
  }
</script>

<button class="share" class:share--copied={copied} onclick={handleClick} aria-label="Share this page">
  {#if copied}
    <Check size={12} strokeWidth={2.5} />
    <span>Copied!</span>
  {:else}
    <Share2 size={12} strokeWidth={2} />
    <span>Share</span>
  {/if}
</button>

<style>
  .share {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 90%, var(--fg)) 0%,
      var(--bg-subtle) 100%
    );
    border: 1px solid var(--border-color);
    border-radius: 100px;
    padding: 0.25rem 0.625rem;
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--bg) 50%, #fff),
      0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent);
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .share:hover {
    color: var(--fg-muted);
    border-color: color-mix(in srgb, var(--fg) 15%, var(--border-color));
    transform: scale(1.03);
  }

  .share--copied {
    color: var(--success);
    border-color: color-mix(in srgb, var(--success) 20%, var(--border-color));
  }

  @media (prefers-reduced-motion: reduce) {
    .share {
      transition: none;
    }
  }
</style>
