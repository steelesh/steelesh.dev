<script lang="ts">
  import { Eye } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import { getViewCount, recordView } from "$lib/api";
  import { formatCount } from "$lib/utils";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let count = $state(0);
  let visible = $state(false);

  $effect(() => {
    if (!browser)
      return;

    const key = `viewed:${slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      recordView(slug).catch(() => {});
    }

    getViewCount(slug).then((data) => {
      count = data.count;
      if (data.count > 0)
        visible = true;
    }).catch(() => {});
  });
</script>

{#if visible}
  <span class="views" aria-label="{formatCount(count)} views">
    <Eye size={12} strokeWidth={2} aria-hidden="true" />
    <span class="views__count">{formatCount(count)}</span>
  </span>
{/if}

<style>
  .views {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--fg-subtle);
    animation: fade-in 300ms var(--ease-out) both;
  }

  .views__count {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .views {
      animation: none;
    }
  }
</style>
