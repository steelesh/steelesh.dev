<script lang="ts">
  import { ArrowUpRight, Eye, Heart } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import PageBar from "$components/page-bar.svelte";
  import { getStatsBatch } from "$lib/api";
  import * as config from "$lib/config";
  import { seedStats } from "$lib/data/content-seed";
  import { formatCount, formatDate } from "$lib/utils";
  import { fade } from "svelte/transition";

  const PAGE_SIZE = 10;
  const { data } = $props();

  type Theme = "light" | "dark";
  let theme = $state<Theme>(
    browser
      ? (localStorage.getItem("theme") as Theme | null) ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : "light",
  );

  let activeTag = $state<string | null>(null);
  let visibleCount = $state(PAGE_SIZE);

  const filteredPosts = $derived(
    activeTag ? data.posts.filter(p => p.tags.includes(activeTag!)) : data.posts,
  );
  const visibleItems = $derived(filteredPosts.slice(0, visibleCount));
  const hasMore = $derived(filteredPosts.length > visibleCount);
  const remaining = $derived(filteredPosts.length - visibleCount);

  function toggleTag(tag: string) {
    activeTag = activeTag === tag ? null : tag;
    visibleCount = PAGE_SIZE;
  }

  function setTheme(t: string) {
    theme = t as Theme;
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
  }

  const articleCount = $derived(filteredPosts.length);
  const articleWord = $derived(articleCount === 1 ? "post" : "posts");

  const jsonLd = $derived(`<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Posts — ${config.title}`,
    "description": `Blog posts by Steele S. — ${data.posts.length} articles on web development.`,
    "url": `${config.url}posts`,
    "numberOfItems": data.posts.length,
  })}<\/script>`);

  let batchStats = $state<Record<string, { views: number; likes: number }>>({});
  const likedState = $state<Record<string, boolean>>({});
  let statsLoaded = $state(false);
  const fetchedSlugs = new Set<string>();

  $effect(() => {
    if (!browser)
      return;
    for (const item of visibleItems) {
      likedState[item.slug] = localStorage.getItem(`liked:${item.slug}`) === "1";
    }
    const newItems = visibleItems.filter(i => !fetchedSlugs.has(i.slug));
    if (newItems.length === 0)
      return;
    for (const i of newItems) fetchedSlugs.add(i.slug);

    const fakeStats: Record<string, { views: number; likes: number }> = {};
    for (const item of newItems) {
      if (item.devOnly)
        fakeStats[item.slug] = seedStats(item.slug);
    }
    const realSlugs = newItems.filter(i => !i.devOnly).map(i => i.slug);
    if (realSlugs.length > 0) {
      statsLoaded = false;
      getStatsBatch(realSlugs).then((result) => {
        batchStats = { ...batchStats, ...result, ...fakeStats };
        statsLoaded = true;
      }).catch(() => {
        batchStats = { ...batchStats, ...fakeStats };
        statsLoaded = true;
      });
    }
    else {
      batchStats = { ...batchStats, ...fakeStats };
      statsLoaded = true;
    }
  });
</script>

<svelte:head>
  <title>Posts — {config.title}</title>
  <meta name="description" content={`Blog posts by Steele S. — ${data.posts.length} articles on web development, tooling, and workflows.`} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={`Posts — ${config.title}`} />
  <meta property="og:description" content={`Blog posts by Steele S. — ${data.posts.length} articles on web development, tooling, and workflows.`} />
  <meta property="og:url" content={`${config.url}posts`} />
  <meta property="og:image" content={config.ogImageUrl({ title: "Posts", category: "blog", subtitle: `${data.posts.length} articles` })} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`Posts — ${config.title}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={config.ogImageUrl({ title: "Posts", category: "blog", subtitle: `${data.posts.length} articles` })} />
  <link rel="canonical" href={`${config.url}posts`} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD structured data requires @html -->
  {@html jsonLd}
</svelte:head>

<div class="posts-page">
  <PageBar backHref="/#work" backLabel="Home" {theme} onthemechange={setTheme} />
  <div class="posts-page__inner">
    <header class="posts-page__header">
      <h1 class="posts-page__title">Posts</h1>
      <p class="posts-page__count">
        {articleCount} {articleWord}
      </p>
      <p class="posts-page__subtitle">Writing about web development, tooling, and workflows.</p>
    </header>

    {#if data.tags.length > 1}
      <div class="posts-page__filters" role="group" aria-label="Filter by tag">
        <button
          class="posts-page__filter-pill"
          class:posts-page__filter-pill--active={activeTag === null}
          onclick={() => {
            activeTag = null;
            visibleCount = PAGE_SIZE;
          }}
        >All</button>
        {#each data.tags as { tag, count }}
          <button
            class="posts-page__filter-pill"
            class:posts-page__filter-pill--active={activeTag === tag}
            onclick={() => toggleTag(tag)}
          >#{tag} <span class="posts-page__filter-count">{count}</span></button>
        {/each}
      </div>
    {/if}

    <ul class="posts-page__list" role="list">
      {#each visibleItems as item}
        <li>
          <a class="posts-page__item" href={item.href}>
            <div class="posts-page__item-top">
              <time class="posts-page__date" datetime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            </div>
            <span class="posts-page__name">
              {item.name}
              <ArrowUpRight size={14} strokeWidth={2} />
            </span>
            <span class="posts-page__subtitle-text">{item.subtitle}</span>
            {#if item.tags.length}
              <div class="posts-page__item-tags">
                {#each item.tags as tag}
                  <span class="posts-page__item-tag" class:posts-page__item-tag--active={tag === activeTag}>#{tag}</span>
                {/each}
              </div>
            {/if}
            {#if statsLoaded && (batchStats[item.slug]?.views > 0 || batchStats[item.slug]?.likes > 0)}
              <div class="posts-page__item-stats" transition:fade={{ duration: 150 }}>
                {#if batchStats[item.slug]?.views > 0}
                  <span class="posts-page__item-stat">
                    <Eye size={12} strokeWidth={2} />
                    {formatCount(batchStats[item.slug].views)}
                  </span>
                {/if}
                {#if batchStats[item.slug]?.likes > 0}
                  <span class="posts-page__item-stat" class:posts-page__item-stat--liked={likedState[item.slug]}>
                    <Heart size={12} strokeWidth={2} class={likedState[item.slug] ? "posts-page__heart--filled" : ""} />
                    {formatCount(batchStats[item.slug].likes)}
                  </span>
                {/if}
              </div>
            {/if}
          </a>
        </li>
      {:else}
        <li class="posts-page__empty">No posts found.</li>
      {/each}
    </ul>

    {#if hasMore}
      <button
        class="posts-page__show-more"
        onclick={() => { visibleCount += PAGE_SIZE; }}
      >
        Show more ({remaining} remaining)
      </button>
    {/if}
  </div>
</div>

<style>
  .posts-page {
    padding: 0 var(--space-md) calc(var(--space-section) + 2rem);
    background: var(--bg);
    min-height: 100svh;
    position: relative;
    z-index: 1;
    border-radius: 0 0 1.5rem 1.5rem;
    overflow: hidden;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.15),
      0 20px 60px rgba(0, 0, 0, 0.1);
  }

  .posts-page::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
    opacity: 0.5;
    pointer-events: none;
  }

  :global(html[data-theme="light"]) .posts-page {
    --bg: #faf8f5;
    --bg-subtle: #f0ede8;
    --bg-muted: #e8e4de;
    --fg: #333334;
    --fg-muted: #6b6560;
    --fg-subtle: #9b9590;
    --border-color: rgba(51, 51, 52, 0.12);
  }

  :global(html[data-theme="dark"]) .posts-page {
    --bg: #1a1917;
    --bg-subtle: #242320;
    --bg-muted: #2e2d2a;
    --fg: #f0ede8;
    --fg-muted: #a8a29e;
    --fg-subtle: #78716c;
    --border-color: rgba(240, 237, 232, 0.1);
  }

  :global(html[data-theme="light"]:has(.posts-page)) {
    --footer-bg: #3d3833;
  }

  :global(html[data-theme="dark"]:has(.posts-page)) {
    --footer-bg: #0e0d0c;
  }

  :global(html[data-theme="dark"]) .posts-page::before {
    opacity: 0.15;
  }

  .posts-page__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
    padding-top: var(--space-lg);
    position: relative;
    z-index: 1;
  }

  .posts-page__header {
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .posts-page__title {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: 0.5rem;
  }

  .posts-page__count {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
    margin-bottom: 0.5rem;
  }

  .posts-page__subtitle {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    line-height: var(--leading-body);
  }

  .posts-page__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: var(--space-xl);
  }

  .posts-page__filter-pill {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
    background: color-mix(in srgb, var(--fg) 4%, transparent);
    border: 1px solid var(--border-color);
    padding: 0.375rem 0.75rem;
    border-radius: 100px;
    cursor: pointer;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .posts-page__filter-pill:hover {
    color: var(--fg-muted);
    background: color-mix(in srgb, var(--fg) 6%, transparent);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  .posts-page__filter-pill--active {
    color: var(--fg);
    background: color-mix(in srgb, var(--fg) 8%, transparent);
    border-color: color-mix(in srgb, var(--fg) 25%, var(--border-color));
  }

  .posts-page__filter-pill:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 4px;
    border-radius: 100px;
  }

  .posts-page__filter-count {
    opacity: 0.5;
    margin-left: 0.125rem;
  }

  .posts-page__list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .posts-page__item {
    display: block;
    text-decoration: none;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg-subtle) 40%, var(--bg)) 0%,
      var(--bg) 100%
    );
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
  }

  .posts-page__item:hover {
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg-subtle) 60%, var(--bg)) 0%,
      var(--bg-subtle) 100%
    );
  }

  .posts-page__item-top {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .posts-page__date {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .posts-page__name {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-serif);
    font-size: var(--fs-h2);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    color: var(--fg);
    margin-bottom: 0.25rem;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .posts-page__item:hover .posts-page__name {
    color: var(--fg-muted);
  }

  .posts-page__name :global(svg) {
    flex-shrink: 0;
    opacity: 0;
    color: var(--fg-subtle);
    transform: translate(-3px, 3px);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .posts-page__item:hover .posts-page__name :global(svg) {
    opacity: 1;
    transform: translate(0, 0);
    color: var(--fg-muted);
  }

  .posts-page__subtitle-text {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    line-height: var(--leading-body);
  }

  .posts-page__item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.625rem;
  }

  .posts-page__item-tag {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .posts-page__item-tag--active {
    color: var(--fg-muted);
    font-weight: 500;
  }

  .posts-page__item-stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.625rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-muted);
  }

  .posts-page__item-stat {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .posts-page__item-stat :global(svg) {
    opacity: 0.6;
  }

  .posts-page__item-stat--liked {
    color: var(--error);
  }

  .posts-page__item-stat--liked :global(svg) {
    opacity: 1;
  }

  .posts-page__item-stat :global(.posts-page__heart--filled) {
    fill: currentColor;
  }

  .posts-page__empty {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    text-align: center;
    padding: var(--space-xl) var(--space-md);
  }

  .posts-page__show-more {
    display: block;
    margin: var(--space-lg) auto 0;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-muted);
    background: color-mix(in srgb, var(--fg) 4%, transparent);
    border: 1px solid var(--border-color);
    padding: 0.625rem 1.5rem;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .posts-page__show-more:hover {
    color: var(--fg);
    background: color-mix(in srgb, var(--fg) 6%, transparent);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  .posts-page__show-more:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 4px;
    border-radius: 6px;
  }

  .posts-page__item:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .posts-page__item,
    .posts-page__name,
    .posts-page__name :global(svg),
    .posts-page__filter-pill {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .posts-page::before {
      opacity: 0.2;
    }
  }
</style>
