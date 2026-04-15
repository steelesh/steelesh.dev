<script lang="ts">
  import type { ContentItem } from "$lib/types";
  import type { Component } from "svelte";

  import { copyCode } from "$lib/actions/copy-code";
  import * as config from "$lib/config";
  import { categoryPath, getSeriesPrevNext } from "$lib/data/content";
  import { formatDate } from "$lib/utils";

  interface Props {
    name?: string;
    title: string;
    subtitle: string;
    tags: string[];
    slug: string;
    category?: ContentItem["category"];
    publishedAt?: string;
    updatedAt?: string;
    standalone?: boolean;
    minimal?: boolean;
    backHref?: string;
    backLabel?: string;
    content: Component;
  }

  const { name, title, subtitle, tags, slug, category = "post", publishedAt, updatedAt, standalone = false, minimal = false, backHref, backLabel, content: Content }: Props = $props();
  const pageTitle = $derived(name ?? title);

  const seriesNav = $derived(getSeriesPrevNext(slug));

  const jsonLd = $derived(`<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": standalone ? "WebPage" : "Article",
    "headline": pageTitle,
    "description": subtitle,
    "url": `${config.url}${category ? `${categoryPath(category)}/${slug}` : slug}`,
    "image": config.ogImage,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    "author": {
      "@type": "Person",
      "name": "Steele S.",
      "url": config.url,
    },
    "keywords": tags,
  })}<\/script>`);

  function highlightFootnoteTarget(e: MouseEvent) {
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a.footnote-ref, a.footnote-backref");
    if (!anchor)
      return;

    const hash = anchor.getAttribute("href");
    if (!hash?.startsWith("#"))
      return;

    let target: HTMLElement | null = document.getElementById(hash.slice(1));
    if (!target)
      return;

    if (target.tagName === "SUP")
      target = target.closest("p, li, blockquote") ?? target;

    target.classList.remove("footnote-highlight");
    void target.offsetWidth;
    target.classList.add("footnote-highlight");
    target.addEventListener("animationend", () => target.classList.remove("footnote-highlight"), { once: true });
  }
</script>

<svelte:head>
  <title>{pageTitle} — {config.title}</title>
  <meta name="description" content={subtitle} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={subtitle} />
  <meta property="og:url" content={`${config.url}${category ? `${categoryPath(category)}/${slug}` : slug}`} />
  <meta property="og:image" content={config.ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`${pageTitle} — ${config.title}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${pageTitle} — ${config.title}`} />
  <meta name="twitter:description" content={subtitle} />
  <meta name="twitter:image" content={config.ogImage} />
  <link rel="canonical" href={`${config.url}${category ? `${categoryPath(category)}/${slug}` : slug}`} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD structured data requires @html -->
  {@html jsonLd}
</svelte:head>

<article class="post">
  <a class="post__back" href={backHref ?? "/"}>
    <span aria-hidden="true">&larr;</span>
    {backLabel ?? "Back"}
  </a>

  {#if minimal}
    <h1 class="sr-only">{title}</h1>
  {:else}
    <header class="post__header">
      <h1 class="post__title">{title}</h1>
      <p class="post__subtitle">{subtitle}</p>
      {#if publishedAt}
        <div class="post__meta">
          <time datetime={publishedAt}>{formatDate(publishedAt)}</time>
          {#if updatedAt}
            <span class="post__meta-sep" aria-hidden="true">&middot;</span>
            <span>Updated <time datetime={updatedAt}>{formatDate(updatedAt)}</time></span>
          {/if}
        </div>
      {/if}
    </header>
  {/if}

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="post__content" {@attach copyCode} onclick={highlightFootnoteTarget}>
    <svelte:boundary onerror={e => console.error("[content]", e)}>
      <Content />
      {#snippet failed(_error, reset)}
        <div class="error-fallback">
          <p>Something went wrong rendering this content.</p>
          <button onclick={reset}>Retry</button>
        </div>
      {/snippet}
    </svelte:boundary>
  </div>

  {#if seriesNav}
    <nav class="post__series" aria-label="Series navigation">
      {#if seriesNav.prev}
        <a class="post__series-link" href={`/${categoryPath(seriesNav.prev.category)}/${seriesNav.prev.slug}`}>
          &larr; {seriesNav.prev.name}
        </a>
      {/if}
      {#if seriesNav.next}
        <a class="post__series-link post__series-link--next" href={`/${categoryPath(seriesNav.next.category)}/${seriesNav.next.slug}`}>
          {seriesNav.next.name} &rarr;
        </a>
      {/if}
    </nav>
  {/if}
</article>

<style>
  .post {
    max-width: 50rem;
    margin: 0 auto;
    padding: clamp(1.5rem, 6vh, 3rem) var(--space-md) var(--space-section);
    min-height: 100svh;
  }

  .post__back {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    text-decoration: none;
    margin-bottom: 2.5rem;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .post__back:hover {
    color: var(--fg);
  }

  .post__header {
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .post__title {
    font-size: 2rem;
    letter-spacing: var(--tracking-tight);
    line-height: 1.15;
    margin-bottom: 0.75rem;
  }

  .post__subtitle {
    font-family: var(--font-sans);
    font-size: 1rem;
    color: var(--fg-muted);
    margin-bottom: 1rem;
  }

  .post__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .post__meta-sep {
    opacity: 0.5;
  }

  .post__content {
    font-family: var(--font-sans);
    font-size: 1rem;
    color: var(--fg);
  }

  .post__content :global(h2) {
    font-size: 1.5rem;
    font-family: var(--font-heading);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
    position: relative;
  }

  .post__content :global(h2:first-child) {
    margin-top: 0;
  }

  .post__content :global(h3) {
    font-size: 1.25rem;
    font-family: var(--font-heading);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    position: relative;
  }

  .post__content :global(p) {
    margin-bottom: 1.25rem;
  }

  .post__content :global(p:last-child) {
    margin-bottom: 0;
  }

  .post__content :global(ul),
  .post__content :global(ol) {
    margin-bottom: 1.25rem;
    padding-left: 1.25rem;
  }

  .post__content :global(li) {
    margin-bottom: 0.375rem;
    line-height: 1.7;
  }

  .post__content :global(li::marker) {
    color: var(--fg-subtle);
  }

  .post__content :global(strong) {
    font-weight: 600;
    color: var(--fg);
  }

  .post__content :global(em) {
    font-style: italic;
  }

  .post__content :global(code:not(pre code)) {
    font-family: var(--font-mono);
    font-size: 0.9em;
    color: var(--fg);
    background: linear-gradient(180deg, var(--bg-subtle), var(--bg-muted));
    border: 1px solid var(--border-color);
    padding: 0.15rem 0.4rem;
    border-radius: 0.375rem;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .post__content :global(a) {
    color: var(--fg);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    text-decoration-color: color-mix(in srgb, var(--fg) 25%, transparent);
    text-decoration-skip-ink: auto;
    transition: text-decoration-color var(--duration-fast) var(--ease-out);
  }

  .post__content :global(a:hover) {
    text-decoration-color: var(--fg);
  }

  .post__content :global(.code-block) {
    position: relative;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  .post__content :global(.code-block__lang) {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--cb-lang);
    pointer-events: none;
    z-index: 1;
  }

  .post__content :global(.code-block pre.shiki) {
    margin: 0;
    padding: 1.25rem 1rem;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    -webkit-overflow-scrolling: touch;
  }

  .post__content :global(.code-block pre.shiki code) {
    white-space: pre;
    background: none;
    padding: 0;
    border: none;
    border-radius: 0;
    font-size: inherit;
  }

  .post__content :global(.heading-anchor) {
    position: absolute;
    right: 100%;
    padding-right: 0.5rem;
    color: var(--fg-subtle);
    text-decoration: none;
    font-family: var(--font-mono);
    font-weight: 400;
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .post__content :global(h2:hover .heading-anchor),
  .post__content :global(h3:hover .heading-anchor) {
    opacity: 1;
  }

  .post__content :global(table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1.5rem 0;
    font-size: var(--fs-small);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
  }

  .post__content :global(th),
  .post__content :global(td) {
    padding: 0.625rem 0.875rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .post__content :global(th) {
    font-weight: 600;
    background: var(--bg-muted);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-muted);
  }

  .post__content :global(th:first-child) {
    border-top-left-radius: 0.5rem;
  }

  .post__content :global(th:last-child) {
    border-top-right-radius: 0.5rem;
  }

  .post__content :global(th:not(:last-child)),
  .post__content :global(td:not(:last-child)) {
    border-right: 1px solid var(--border-color);
  }

  .post__content :global(tr:last-child td) {
    border-bottom: none;
  }

  .post__content :global(tr:last-child td:first-child) {
    border-bottom-left-radius: 0.5rem;
  }

  .post__content :global(tr:last-child td:last-child) {
    border-bottom-right-radius: 0.5rem;
  }

  .post__content :global(del) {
    opacity: 0.5;
    text-decoration: line-through;
    text-decoration-color: var(--fg-subtle);
  }

  .post__content :global(hr) {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 2.5rem 0;
  }

  .post__content :global(sup a) {
    text-decoration: none;
    color: var(--fg-muted);
    font-size: 0.75em;
    padding: 0.25rem;
    margin: -0.25rem;
  }

  .post__content :global(.footnotes) {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    font-size: var(--fs-small);
    color: var(--fg-muted);
  }

  .post__content :global(.footnotes hr) {
    display: none;
  }

  .post__content :global(.footnotes ol) {
    padding-left: 1.5rem;
  }

  .post__content :global(.footnote-backref) {
    text-decoration: none;
    margin-left: 0.25rem;
    padding: 0.25rem;
  }

  .post__content :global(.footnote-highlight) {
    animation: footnote-flash 1.5s ease-out;
  }

  @keyframes footnote-flash {
    0% {
      background: color-mix(in srgb, var(--accent) 25%, transparent);
    }
    100% {
      background: transparent;
    }
  }

  .post__content :global(li:has(> input[type="checkbox"])) {
    list-style: none;
    margin-left: -1.25rem;
  }

  .post__content :global(input[type="checkbox"]) {
    appearance: none;
    -webkit-appearance: none;
    width: 1rem;
    height: 1rem;
    border: 1.5px solid var(--border-color);
    border-radius: 0.25rem;
    background: var(--bg);
    vertical-align: -0.125rem;
    margin-right: 0.5rem;
    cursor: default;
    position: relative;
  }

  .post__content :global(input[type="checkbox"]:checked) {
    background: var(--success);
    border-color: var(--success-dark);
  }

  .post__content :global(input[type="checkbox"]:checked)::after {
    content: "";
    position: absolute;
    top: 0.0625rem;
    left: 0.1875rem;
    width: 0.375rem;
    height: 0.5rem;
    border: solid var(--bg);
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }

  .post__content :global(blockquote) {
    border-left: 2px solid var(--accent);
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    color: var(--fg-muted);
    font-style: italic;
    background: linear-gradient(180deg, var(--bg-subtle), var(--bg-muted));
    border-radius: 0 0.375rem 0.375rem 0;
  }

  .post__series {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2.5rem;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }

  .post__series-link {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .post__series-link:hover {
    color: var(--fg);
  }

  .post__series-link--next {
    margin-left: auto;
    text-align: right;
  }

  @media (prefers-reduced-motion: reduce) {
    .post__back,
    .post__series-link,
    .post__content :global(a),
    .post__content :global(.heading-anchor) {
      transition: none;
    }
  }
</style>
