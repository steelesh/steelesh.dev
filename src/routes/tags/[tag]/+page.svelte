<script lang="ts">
  import { ArrowUpRight, Eye, Heart } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import PageBar from "$components/page-bar.svelte";
  import { getStatsBatch } from "$lib/api";
  import * as config from "$lib/config";
  import { seedStats } from "$lib/data/content-seed";
  import { categoryLabel, formatCount, formatDate } from "$lib/utils";
  import { fade } from "svelte/transition";

  const PAGE_SIZE = 10;
  const { data } = $props();

  type Theme = "light" | "dark";
  let theme = $state<Theme>(
    browser
      ? (localStorage.getItem("theme") as Theme | null) ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : "light",
  );

  let visibleCount = $state(PAGE_SIZE);
  const visibleItems = $derived(data.items.slice(0, visibleCount));
  const hasMore = $derived(data.items.length > visibleCount);
  const remaining = $derived(data.items.length - visibleCount);

  function setTheme(t: string) {
    theme = t as Theme;
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
  }

  const jsonLd = $derived(`<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${data.tag} — ${config.title}`,
    "description": `Projects, case studies, and posts about ${data.tag}.`,
    "url": `${config.url}tags/${encodeURIComponent(data.tag)}`,
    "numberOfItems": data.items.length,
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
  <title>{data.tag} — {config.title}</title>
  <meta name="description" content={`Projects, case studies, and posts about ${data.tag} — ${data.items.length} ${data.items.length === 1 ? "article" : "articles"} by Steele S.`} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={`${data.tag} — ${config.title}`} />
  <meta property="og:description" content={`Projects, case studies, and posts about ${data.tag} — ${data.items.length} ${data.items.length === 1 ? "article" : "articles"} by Steele S.`} />
  <meta property="og:url" content={`${config.url}tags/${encodeURIComponent(data.tag)}`} />
  <meta property="og:image" content={config.ogImageUrl({ title: data.tag, category: "tag", subtitle: `${data.items.length} ${data.items.length === 1 ? "article" : "articles"}` })} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`${data.tag} — ${config.title}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={config.ogImageUrl({ title: data.tag, category: "tag", subtitle: `${data.items.length} ${data.items.length === 1 ? "article" : "articles"}` })} />
  <link rel="canonical" href={`${config.url}tags/${encodeURIComponent(data.tag)}`} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD structured data requires @html -->
  {@html jsonLd}
</svelte:head>

<div class="tag-page">
  <PageBar backHref="/#work" backLabel="All Work" {theme} onthemechange={setTheme} />
  <div class="tag-page__inner">
    <header class="tag-page__header">
      <h1 class="tag-page__title"><code class="tag-page__badge">#</code>{data.tag}</h1>
      <p class="tag-page__count">
        {data.items.length} {data.items.length === 1 ? "article" : "articles"} tagged
        {#if data.docUrl}
          <span class="tag-page__count-sep" aria-hidden="true">&middot;</span>
          <a class="tag-page__doc" href={data.docUrl} target="_blank" rel="noopener noreferrer">
            Official docs &rarr;
          </a>
        {/if}
      </p>
    </header>

    <ul class="tag-page__list" role="list">
      {#each visibleItems as item}
        <li>
          <a class="tag-page__item" href={item.href}>
            <div class="tag-page__item-top">
              <span class="tag-page__category">{categoryLabel(item.category)}</span>
              <time class="tag-page__date" datetime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            </div>
            <span class="tag-page__name">
              {item.name}
              <ArrowUpRight size={14} strokeWidth={2} />
            </span>
            <span class="tag-page__subtitle">{item.subtitle}</span>
            {#if item.tags.length}
              <div class="tag-page__item-tags">
                {#each item.tags as tag}
                  <span class="tag-page__item-tag" class:tag-page__item-tag--active={tag === data.tag}>#{tag}</span>
                {/each}
              </div>
            {/if}
            {#if statsLoaded && (batchStats[item.slug]?.views > 0 || batchStats[item.slug]?.likes > 0)}
              <div class="tag-page__item-stats" transition:fade={{ duration: 150 }}>
                {#if batchStats[item.slug]?.views > 0}
                  <span class="tag-page__item-stat">
                    <Eye size={12} strokeWidth={2} />
                    {formatCount(batchStats[item.slug].views)}
                  </span>
                {/if}
                {#if batchStats[item.slug]?.likes > 0}
                  <span class="tag-page__item-stat" class:tag-page__item-stat--liked={likedState[item.slug]}>
                    <Heart size={12} strokeWidth={2} class={likedState[item.slug] ? "tag-page__heart--filled" : ""} />
                    {formatCount(batchStats[item.slug].likes)}
                  </span>
                {/if}
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>

    {#if hasMore}
      <button
        class="tag-page__show-more"
        onclick={() => { visibleCount += PAGE_SIZE; }}
      >
        Show more ({remaining} remaining)
      </button>
    {/if}

    {#if data.relatedTags.length}
      <nav class="tag-page__related" data-pagefind-ignore>
        <span class="tag-page__related-heading">Related tags</span>
        <div class="tag-page__related-list">
          {#each data.relatedTags as related}
            <a class="tag-page__related-tag" href="/tags/{encodeURIComponent(related)}">{related}</a>
          {/each}
        </div>
      </nav>
    {/if}
  </div>
</div>

<style>
  .tag-page {
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

  .tag-page::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
    opacity: 0.5;
    pointer-events: none;
  }

  :global(html[data-theme="light"]) .tag-page {
    --bg: #faf8f5;
    --bg-subtle: #f0ede8;
    --bg-muted: #e8e4de;
    --fg: #333334;
    --fg-muted: #6b6560;
    --fg-subtle: #9b9590;
    --border-color: rgba(51, 51, 52, 0.12);
  }

  :global(html[data-theme="dark"]) .tag-page {
    --bg: #1a1917;
    --bg-subtle: #242320;
    --bg-muted: #2e2d2a;
    --fg: #f0ede8;
    --fg-muted: #a8a29e;
    --fg-subtle: #78716c;
    --border-color: rgba(240, 237, 232, 0.1);
  }

  :global(html[data-theme="light"]:has(.tag-page)) {
    --footer-bg: #3d3833;
  }

  :global(html[data-theme="dark"]:has(.tag-page)) {
    --footer-bg: #0e0d0c;
  }

  :global(html[data-theme="dark"]) .tag-page::before {
    opacity: 0.15;
  }

  .tag-page__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
    padding-top: var(--space-lg);
    position: relative;
    z-index: 1;
  }

  .tag-page__header {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .tag-page__title {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: 1rem;
  }

  .tag-page__badge {
    font-family: var(--font-mono);
    font-size: 0.55em;
    font-weight: 400;
    color: var(--fg-subtle);
    background: linear-gradient(135deg, var(--bg-muted), color-mix(in srgb, var(--bg-muted) 70%, var(--bg)));
    border: 1px solid var(--border-color);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--fg) 4%, transparent),
      0 1px 2px color-mix(in srgb, var(--fg) 3%, transparent);
    padding: 0.15rem 0.45rem;
    border-radius: 0.3rem;
    margin-right: 0.35rem;
    vertical-align: 0.15em;
  }

  .tag-page__count {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag-page__count-sep {
    opacity: 0.5;
  }

  .tag-page__doc {
    color: var(--fg-muted);
    text-decoration: none;
    padding: 0.5rem 0;
    margin: -0.5rem 0;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .tag-page__doc:hover {
    color: var(--fg);
  }

  .tag-page__list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tag-page__item {
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

  .tag-page__item:hover {
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg-subtle) 60%, var(--bg)) 0%,
      var(--bg-subtle) 100%
    );
  }

  .tag-page__item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .tag-page__category {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-subtle);
  }

  .tag-page__date {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .tag-page__name {
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

  .tag-page__item:hover .tag-page__name {
    color: var(--fg-muted);
  }

  .tag-page__name :global(svg) {
    flex-shrink: 0;
    opacity: 0;
    color: var(--fg-subtle);
    transform: translate(-3px, 3px);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .tag-page__item:hover .tag-page__name :global(svg) {
    opacity: 1;
    transform: translate(0, 0);
    color: var(--fg-muted);
  }

  .tag-page__subtitle {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    line-height: var(--leading-body);
  }

  .tag-page__item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.625rem;
  }

  .tag-page__item-tag {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .tag-page__item-tag--active {
    color: var(--fg-muted);
    font-weight: 500;
  }

  .tag-page__item-stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.625rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-muted);
  }

  .tag-page__item-stat {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .tag-page__item-stat :global(svg) {
    opacity: 0.6;
  }

  .tag-page__item-stat--liked {
    color: var(--error);
  }

  .tag-page__item-stat--liked :global(svg) {
    opacity: 1;
  }

  .tag-page__item-stat :global(.tag-page__heart--filled) {
    fill: currentColor;
  }

  .tag-page__show-more {
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

  .tag-page__show-more:hover {
    color: var(--fg);
    background: color-mix(in srgb, var(--fg) 6%, transparent);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  .tag-page__show-more:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 4px;
    border-radius: 6px;
  }

  .tag-page__related {
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border-color);
  }

  .tag-page__related-heading {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-subtle);
    margin-bottom: 0.75rem;
  }

  .tag-page__related-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag-page__related-tag {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .tag-page__related-tag::before {
    content: "#";
    opacity: 0.4;
  }

  .tag-page__related-tag:hover {
    color: var(--fg-muted);
  }

  .tag-page__item:focus-visible,
  .tag-page__doc:focus-visible,
  .tag-page__related-tag:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .tag-page__item,
    .tag-page__name,
    .tag-page__name :global(svg),
    .tag-page__doc,
    .tag-page__related-tag {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .tag-page::before {
      opacity: 0.2;
    }
  }
</style>
