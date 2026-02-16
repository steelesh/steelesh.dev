<script lang="ts">
  import { Heart } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import { getLikeCount, postLike } from "$lib/api";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let count = $state(0);
  let liked = $state(false);
  let animating = $state(false);

  const storageKey = $derived(`liked:${slug}`);

  $effect(() => {
    if (!browser)
      return;

    liked = localStorage.getItem(storageKey) === "1";

    getLikeCount(slug).then((data) => {
      count = data.count;
    }).catch(() => {});
  });

  async function handleLike() {
    if (liked)
      return;

    liked = true;
    count++;
    animating = true;
    localStorage.setItem(storageKey, "1");

    try {
      const data = await postLike(slug);
      count = data.count;
    }
    catch {
      count--;
      liked = false;
      localStorage.removeItem(storageKey);
    }
  }
</script>

<button
  class="like"
  class:like--liked={liked}
  class:like--pulse={animating}
  onclick={handleLike}
  onanimationend={() => { animating = false; }}
  aria-label={liked ? `Liked — ${count} likes` : `Like this post — ${count} likes`}
  aria-pressed={liked}
>
  <Heart size={12} strokeWidth={2} class={liked ? "like__heart--filled" : ""} />
  <span>{liked ? "Liked" : "Like"}</span>
  {#if count > 0}
    <span class="like__count" aria-live="polite">{count}</span>
  {/if}
</button>

<style>
  .like {
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

  .like:not(.like--liked):hover {
    color: var(--fg-muted);
    border-color: color-mix(in srgb, var(--fg) 15%, var(--border-color));
    transform: scale(1.03);
  }

  .like--liked {
    color: var(--error);
    border-color: color-mix(in srgb, var(--error) 20%, var(--border-color));
    cursor: default;
  }

  .like :global(.like__heart--filled) {
    fill: currentColor;
  }

  .like--pulse {
    animation: like-pulse 400ms var(--ease-out);
  }

  @keyframes like-pulse {
    0% { transform: scale(1); }
    40% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  .like__count {
    font-variant-numeric: tabular-nums;
    color: var(--fg);
  }

  @media (prefers-reduced-motion: reduce) {
    .like {
      transition: none;
    }

    .like--pulse {
      animation: none;
    }
  }
</style>
