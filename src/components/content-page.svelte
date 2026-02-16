<script lang="ts">
  import type { ContentItem } from "$lib/types";
  import type { Component } from "svelte";

  import { ArrowUpRight } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import { afterNavigate, goto } from "$app/navigation";
  import { page } from "$app/state";
  import GiscusComments from "$components/giscus-comments.svelte";
  import LikeButton from "$components/like-button.svelte";
  import ShareButton from "$components/share-button.svelte";
  import TableOfContents from "$components/table-of-contents.svelte";
  import ThemeSwitcher from "$components/theme-switcher.svelte";
  import ViewCounter from "$components/view-counter.svelte";
  import { copyCode } from "$lib/actions/copy-code";
  import { animateChildren } from "$lib/actions/scroll-animate";
  import * as config from "$lib/config";
  import { categoryPath, getRelatedContent, getSeriesPrevNext } from "$lib/data/content";
  import { categoryLabel, formatDate } from "$lib/utils";
  import { fade, fly } from "svelte/transition";

  const CATEGORY_BACK: Record<string, { href: string; label: string }> = {
    "project": { href: "/projects", label: "All Projects" },
    "case-study": { href: "/case-studies", label: "All Case Studies" },
    "post": { href: "/posts", label: "All Posts" },
  };

  let backUrl = $state<string | null>(null);
  afterNavigate(({ from, to, type }) => {
    if (type === "link" && from && to && from.url.pathname !== to.url.pathname && from.url.pathname !== "/") {
      backUrl = from.url.pathname + from.url.search + from.url.hash;
    }
  });

  interface Props {
    name?: string;
    title: string;
    subtitle: string;
    tags: string[];
    slug: string;
    category?: ContentItem["category"];
    publishedAt?: string;
    updatedAt?: string;
    readingTime?: number;
    coverImage?: ContentItem["coverImage"];
    coverImageAlt?: string;
    headerColor?: ContentItem["headerColor"];
    headerTheme?: ContentItem["headerTheme"];
    coverHeight?: ContentItem["coverHeight"];
    devOnly?: boolean;
    standalone?: boolean;
    backHref?: string;
    backLabel?: string;
    content: Component;
  }

  const { name, title, subtitle, tags, slug, category, publishedAt, updatedAt, readingTime, coverImage, coverImageAlt, headerColor, headerTheme, coverHeight = "quarter", devOnly = false, standalone = false, backHref, backLabel, content: Content }: Props = $props();
  const pageTitle = $derived(name ?? title);

  const coverHeights = {
    half: { desktop: 280, mobile: 180 },
    quarter: { desktop: 120, mobile: 90 },
  } as const;

  const isCoverExpandable = $derived(coverHeight !== "full");

  const coverStyle = $derived(
    coverHeight === "full"
      ? "--start: 25ms; --y: 15px"
      : `--start: 25ms; --y: 15px; --cover-h: ${coverHeights[coverHeight].desktop}px; --cover-h-mobile: ${coverHeights[coverHeight].mobile}px`,
  );

  const relatedItems = $derived(getRelatedContent(slug));
  const seriesNav = $derived(getSeriesPrevNext(slug));

  const jsonLd = $derived(`<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": standalone ? "WebPage" : "Article",
    "headline": pageTitle,
    "description": subtitle,
    "url": `${config.url}${category ? `${categoryPath(category)}/${slug}` : slug}`,
    "image": config.ogImageUrl({ title: pageTitle, subtitle, category }),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    "author": {
      "@type": "Person",
      "name": "Steele S.",
      "url": config.url,
    },
    "keywords": tags,
  })}<\/script>`);

  type FooterTab = "related" | "comments";
  let activeFooterTab = $state<FooterTab>("related");
  let commentCount = $state<number | null>(null);

  function handleTabKeydown(e: KeyboardEvent) {
    const tabs: FooterTab[] = ["related", "comments"];
    const idx = tabs.indexOf(activeFooterTab);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      activeFooterTab = tabs[next];
      (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(`[data-tab="${tabs[next]}"]`)?.focus();
    }
  }

  const reduceMotion = browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const panelIn = reduceMotion ? { y: 0, duration: 0 } : { y: 8, duration: 200, delay: 120 };
  const panelOut = reduceMotion ? { duration: 0 } : { duration: 100 };

  $effect(() => {
    if (!browser || devOnly || standalone)
      return;

    function onGiscusMessage(event: MessageEvent) {
      if (event.origin !== "https://giscus.app")
        return;
      const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (data?.giscus?.discussion) {
        const d = data.giscus.discussion;
        commentCount = (d.totalCommentCount ?? 0) + (d.totalReplyCount ?? 0);
      }
    }

    window.addEventListener("message", onGiscusMessage);
    return () => window.removeEventListener("message", onGiscusMessage);
  });

  type Theme = "light" | "dark";
  let theme = $state<Theme>(
    browser
      ? (localStorage.getItem("theme") as Theme | null) ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : "light",
  );

  function setTheme(t: string) {
    theme = t as Theme;
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
  }

  function resolveThemed<T>(value: T | { light: T; dark: T } | undefined): T | undefined {
    if (value == null)
      return undefined;
    if (typeof value === "object" && value !== null && "light" in value)
      return (value as { light: T; dark: T })[theme];
    return value as T;
  }

  const resolvedHeaderColor = $derived(resolveThemed(headerColor));
  const resolvedHeaderTheme = $derived(resolveThemed(headerTheme));
  const resolvedCoverImage = $derived(resolveThemed(coverImage));

  let readProgress = $state(0);
  let articleEl = $state<HTMLElement>();
  let contentEl = $state<HTMLElement>();

  $effect(() => {
    if (!articleEl || standalone)
      return;

    let ticking = false;

    function update() {
      const rect = articleEl!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        readProgress = 1;
      }
      else {
        readProgress = Math.min(1, Math.max(0, -rect.top / total));
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  });

  let coverExpanded = $state(false);

  function toggleCover() {
    coverExpanded = !coverExpanded;
  }

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
  <meta property="og:image" content={config.ogImageUrl({ title: pageTitle, subtitle, category, tags: tags.join(","), date: publishedAt })} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`${pageTitle} — ${config.title}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${pageTitle} — ${config.title}`} />
  <meta name="twitter:description" content={subtitle} />
  <meta name="twitter:image" content={config.ogImageUrl({ title: pageTitle, subtitle, category, tags: tags.join(","), date: publishedAt })} />
  <link rel="canonical" href={`${config.url}${category ? `${categoryPath(category)}/${slug}` : slug}`} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD structured data requires @html -->
  {@html jsonLd}
</svelte:head>

<article class="study noise-overlay" bind:this={articleEl}>
  <div class="study__bar" class:study__bar--custom={resolvedHeaderColor} class:study__bar--light={resolvedHeaderTheme === "light"} style:--bar-bg={resolvedHeaderColor} data-pagefind-ignore>
    {#if !standalone}<div class="study__progress" style="transform: scaleX({readProgress})" aria-hidden="true"></div>{/if}
    <div class="study__bar-inner">
      <a
        class="study__bar-back"
        href={category ? CATEGORY_BACK[category]?.href ?? (backHref ?? "/") : (backHref ?? "/")}
        onclick={(e) => {
          if (backUrl) {
            e.preventDefault();
            goto(backUrl, { replaceState: true });
          }
        }}
      >
        <span aria-hidden="true">&larr;</span>
        {category ? CATEGORY_BACK[category]?.label ?? (backLabel ?? "Home") : (backLabel ?? "Home")}
      </a>
      <ThemeSwitcher {theme} onchange={setTheme} />
    </div>
  </div>
  <div class="study__inner">

    {#if resolvedCoverImage}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <figure
        class="study__cover"
        class:study__cover--full={coverHeight === "full"}
        class:study__cover--expanded={coverExpanded}
        data-animate
        style={coverStyle}
        role={isCoverExpandable ? "button" : undefined}
        tabindex={isCoverExpandable ? 0 : undefined}
        data-cursor={isCoverExpandable ? "hover" : undefined}
        onclick={isCoverExpandable ? toggleCover : undefined}
        onkeydown={isCoverExpandable
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleCover();
            }
          }
          : undefined}
      >
        <enhanced:img class="study__cover-img" src={resolvedCoverImage} alt={coverImageAlt || title} loading="eager" />
      </figure>
    {/if}

    <header class="study__header" data-animate>
      <h1 class="study__title" data-pagefind-meta="title">{title}</h1>
      <p class="study__subtitle">{subtitle}</p>
      {#if publishedAt || readingTime}
        <div class="study__meta" data-pagefind-ignore>
          {#if publishedAt}
            <time datetime={publishedAt}>{formatDate(publishedAt)}</time>
          {/if}
          {#if publishedAt && readingTime}
            <span class="study__meta-sep" aria-hidden="true">&middot;</span>
          {/if}
          {#if readingTime}
            <span>{readingTime} min read</span>
          {/if}
          {#if updatedAt}
            <span class="study__meta-sep" aria-hidden="true">&middot;</span>
            <span>Updated <time datetime={updatedAt}>{formatDate(updatedAt)}</time></span>
          {/if}
          {#if !devOnly && !standalone}
            <ViewCounter {slug} />
          {/if}
        </div>
      {/if}
      {#if tags.length}
        <div class="study__tags" data-pagefind-ignore>
          {#each tags as tag}
            <a class="study__tag" href="/tags/{encodeURIComponent(tag)}">{tag}</a>
          {/each}
        </div>
      {/if}
    </header>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="study__content" bind:this={contentEl} data-pagefind-body {@attach animateChildren} {@attach copyCode} onclick={highlightFootnoteTarget}>
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
      <nav class="study__series" aria-label="Series navigation" data-pagefind-ignore>
        {#if seriesNav.prev}
          <a class="study__series-link study__series-link--prev" href={`/${categoryPath(seriesNav.prev.category)}/${seriesNav.prev.slug}`}>
            <span class="study__series-dir">&larr; Previous</span>
            <span class="study__series-title">{seriesNav.prev.name}</span>
          </a>
        {/if}
        {#if seriesNav.next}
          <a class="study__series-link study__series-link--next" href={`/${categoryPath(seriesNav.next.category)}/${seriesNav.next.slug}`}>
            <span class="study__series-dir">Next &rarr;</span>
            <span class="study__series-title">{seriesNav.next.name}</span>
          </a>
        {/if}
      </nav>
    {/if}

    {#if !standalone}<footer class="study__footer" data-animate style="--y: 10px" data-pagefind-ignore>
      <div class="study__footer-bar">
        <div class="study__footer-engage">
          <LikeButton {slug} />
          <span class="study__engage-sep" aria-hidden="true">&middot;</span>
          <ShareButton {title} url={page.url.href} />
        </div>

        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div class="study__tabs" role="tablist" aria-label="Footer sections" onkeydown={handleTabKeydown}>
          <button
            class="study__tab"
            class:study__tab--active={activeFooterTab === "related"}
            role="tab"
            id="tab-related"
            data-tab="related"
            aria-selected={activeFooterTab === "related"}
            aria-controls="panel-related"
            tabindex={activeFooterTab === "related" ? 0 : -1}
            onclick={() => activeFooterTab = "related"}
          >Related</button>
          {#if !devOnly}
            <button
              class="study__tab"
              class:study__tab--active={activeFooterTab === "comments"}
              role="tab"
              id="tab-comments"
              data-tab="comments"
              aria-selected={activeFooterTab === "comments"}
              aria-controls="panel-comments"
              tabindex={activeFooterTab === "comments" ? 0 : -1}
              onclick={() => activeFooterTab = "comments"}
            >Comments{#if commentCount != null && commentCount > 0} ({commentCount}){/if}</button>
          {/if}
        </div>
      </div>

      <div class="study__panels">
        {#if activeFooterTab === "related"}
          <div id="panel-related" role="tabpanel" aria-labelledby="tab-related" class="study__panel" in:fly={panelIn} out:fade={panelOut}>
            <div class="study__related">
              {#each relatedItems as item}
                <a class="study__next" href={`/${categoryPath(item.category)}/${item.slug}`}>
                  <span class="study__next-category">
                    {categoryLabel(item.category)}
                  </span>
                  <span class="study__next-title">
                    {item.name}
                    <ArrowUpRight size={14} strokeWidth={2} />
                  </span>
                  <span class="study__next-description">{item.subtitle}</span>
                </a>
              {/each}
            </div>
          </div>
        {/if}

        {#if activeFooterTab === "comments" && !devOnly}
          <div id="panel-comments" role="tabpanel" aria-labelledby="tab-comments" class="study__panel" in:fly={panelIn} out:fade={panelOut}>
            <GiscusComments {theme} />
          </div>
        {/if}
      </div>
    </footer>{/if}
  </div>
</article>
{#if !standalone}
  {#key slug}
    <TableOfContents {contentEl} {articleEl} />
  {/key}
{/if}

<style>
  .study {
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

  :global(html[data-theme="light"]) .study {
    --bg: #faf8f5;
    --bg-subtle: #f0ede8;
    --bg-muted: #e8e4de;
    --fg: #333334;
    --fg-muted: #6b6560;
    --fg-subtle: #76706b;
    --border-color: rgba(51, 51, 52, 0.12);
  }

  :global(html[data-theme="dark"]) .study {
    --bg: #1a1917;
    --bg-subtle: #242320;
    --bg-muted: #2e2d2a;
    --fg: #f0ede8;
    --fg-muted: #a8a29e;
    --fg-subtle: #8a8480;
    --border-color: rgba(240, 237, 232, 0.1);
  }

  :global(html[data-theme="light"]:has(.study)) {
    --footer-bg: #3d3833;
  }

  :global(html[data-theme="dark"]:has(.study)) {
    --footer-bg: #0e0d0c;
  }

  .study__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
    padding-top: var(--space-lg);
    position: relative;
    z-index: 1;
  }

  .study__bar {
    margin: 0 calc(-1 * var(--space-md));
    padding: 1.25rem var(--space-md) 3rem;
    background: var(--bar-bg, var(--bg-muted));
    position: relative;
  }

  .study__progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--fg-muted);
    transform-origin: left;
    will-change: transform;
  }

  .study__bar--light {
    --fg: #f0ede8;
    --fg-muted: rgba(255, 255, 255, 0.85);
    --fg-subtle: rgba(255, 255, 255, 0.6);
    --border-color: rgba(255, 255, 255, 0.15);
  }

  .study__bar--custom.study__bar--light :global(.theme-switcher__track) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .study__bar--custom.study__bar--light :global(.theme-switcher__indicator) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .study__bar-inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .study__bar-back {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    text-decoration: none;
    padding: 0.75rem 0;
    margin: -0.75rem 0;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .study__bar-back:hover {
    color: var(--fg);
  }

  .study__header {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .study__title {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: 0.75rem;
  }

  .study__subtitle {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg-muted);
    line-height: var(--leading-body);
    margin-bottom: 1rem;
  }

  .study__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .study__meta :global(.ask-ai) {
    margin-left: auto;
  }

  .study__meta-sep {
    opacity: 0.5;
  }

  .study__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.75rem;
  }

  .study__tag {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .study__tag::before {
    content: "#";
    opacity: 0.4;
  }

  a.study__tag:hover {
    color: var(--fg-muted);
  }

  .study__cover {
    interpolate-size: allow-keywords;
    margin-top: -4rem;
    margin-bottom: var(--space-lg);
    overflow: hidden;
    height: var(--cover-h, 120px);
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--fg) 8%, transparent);
    transition: height var(--duration-base) var(--ease-out);
  }

  .study__cover--full,
  .study__cover--expanded {
    height: auto;
  }

  .study__cover-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .study__cover--expanded .study__cover-img,
  .study__cover--full .study__cover-img {
    height: auto;
    max-height: 400px;
  }

  .study__content {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg);
    line-height: 1.7;
  }

  .study__content :global(h2) {
    font-size: var(--fs-h2);
    font-family: var(--font-serif);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    margin-top: 3rem;
    margin-bottom: 0.75rem;
    position: relative;
  }

  .study__content :global(h2:first-child) {
    margin-top: 0;
  }

  .study__content :global(h3) {
    font-size: var(--fs-body);
    font-family: var(--font-sans);
    font-weight: 600;
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    position: relative;
  }

  .study__content :global(p) {
    margin-bottom: 1.25rem;
  }

  .study__content :global(p:last-child) {
    margin-bottom: 0;
  }

  .study__content :global(ul),
  .study__content :global(ol) {
    margin-bottom: 1.25rem;
    padding-left: 1.25rem;
  }

  .study__content :global(li) {
    margin-bottom: 0.375rem;
    line-height: 1.7;
  }

  .study__content :global(li::marker) {
    color: var(--fg-subtle);
  }

  .study__content :global(strong) {
    font-weight: 600;
    color: var(--fg);
  }

  .study__content :global(em) {
    font-style: italic;
  }

  .study__content :global(code:not(pre code)) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    color: var(--fg);
    background: linear-gradient(135deg, var(--bg-muted), color-mix(in srgb, var(--bg-muted) 70%, var(--bg)));
    border: 1px solid var(--border-color);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--fg) 4%, transparent),
      0 1px 2px color-mix(in srgb, var(--fg) 3%, transparent);
    padding: 0.15rem 0.4rem;
    border-radius: 0.375rem;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .study__content :global(a) {
    color: var(--fg);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 0.2em;
    text-decoration-color: color-mix(in srgb, var(--fg) 25%, transparent);
    text-decoration-skip-ink: auto;
    transition:
      color var(--duration-fast) var(--ease-out),
      text-decoration-color var(--duration-fast) var(--ease-out);
  }

  .study__content :global(a:hover) {
    text-decoration-color: var(--fg);
  }

  .study__content :global(a[target="_blank"]) {
    text-decoration-color: color-mix(in srgb, var(--accent) 50%, transparent);
  }

  .study__content :global(a[target="_blank"]:hover) {
    text-decoration-color: var(--accent);
  }

  .study__content :global(a[target="_blank"])::after {
    content: "";
    display: inline-block;
    width: 0.55em;
    height: 0.55em;
    margin-left: 0.15em;
    vertical-align: super;
    background: var(--fg-subtle);
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 3h6v6'/%3E%3Cpath d='M10 14 21 3'/%3E%3Cpath d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/%3E%3C/svg%3E");
    mask-size: contain;
    mask-repeat: no-repeat;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .study__content :global(a[target="_blank"]:hover)::after {
    background: var(--accent);
  }

  .study__content :global(.footnotes a[target="_blank"])::after,
  .study__content :global(.heading-anchor)::after,
  .study__content :global(a[target="_blank"]:has(+ sup))::after {
    display: none;
  }

  .study__content :global(.code-block) {
    position: relative;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--fg) 6%, transparent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 2px 8px color-mix(in srgb, var(--fg) 8%, transparent),
      0 1px 2px color-mix(in srgb, var(--fg) 5%, transparent);
  }

  :global(html[data-theme="dark"]) .study__content :global(.code-block) {
    border-color: var(--border-color);
    box-shadow: none;
  }

  @media (prefers-color-scheme: dark) {
    .study__content :global(.code-block) {
      border-color: var(--border-color);
      box-shadow: none;
    }
  }

  .study__content :global(.code-block__lang) {
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

  .study__content :global(.code-block pre.shiki) {
    margin: 0;
    padding: 1.25rem 1rem;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    -webkit-overflow-scrolling: touch;
  }

  .study__content :global(.code-block pre.shiki code) {
    white-space: pre;
    background: none;
    padding: 0;
    border: none;
    border-radius: 0;
    font-size: inherit;
  }

  .study__content :global(.heading-anchor) {
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

  .study__content :global(h2:hover .heading-anchor),
  .study__content :global(h3:hover .heading-anchor) {
    opacity: 1;
  }

  .study__content :global(table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1.5rem 0;
    font-size: var(--fs-small);
    border: 1px solid var(--border-color);
    border-radius: 0.625rem;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg-subtle) 50%, var(--bg)) 0%,
      var(--bg) 100%
    );
    box-shadow:
      0 1px 3px color-mix(in srgb, var(--fg) 4%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--bg) 60%, #fff);
  }

  .study__content :global(th),
  .study__content :global(td) {
    padding: 0.625rem 0.875rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .study__content :global(th) {
    font-weight: 600;
    background: linear-gradient(
      180deg,
      var(--bg-muted) 0%,
      var(--bg-subtle) 100%
    );
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-muted);
    border-bottom: 1px solid color-mix(in srgb, var(--fg) 8%, var(--border-color));
  }

  .study__content :global(th:first-child) {
    border-top-left-radius: 0.625rem;
  }

  .study__content :global(th:last-child) {
    border-top-right-radius: 0.625rem;
  }

  .study__content :global(th:not(:last-child)),
  .study__content :global(td:not(:last-child)) {
    border-right: 1px solid var(--border-color);
  }

  .study__content :global(tr:nth-child(even) td) {
    background: color-mix(in srgb, var(--bg-subtle) 60%, var(--bg));
  }

  .study__content :global(tr:last-child td) {
    border-bottom: none;
  }

  .study__content :global(tr:last-child td:first-child) {
    border-bottom-left-radius: 0.625rem;
  }

  .study__content :global(tr:last-child td:last-child) {
    border-bottom-right-radius: 0.625rem;
  }

  .study__content :global(del) {
    opacity: 0.5;
    text-decoration: line-through;
    text-decoration-color: var(--fg-subtle);
  }

  .study__content :global(hr) {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 2.5rem 0;
  }

  .study__content :global(sup a) {
    text-decoration: none;
    color: var(--fg-muted);
    font-size: 0.75em;
    padding: 0.25rem;
    margin: -0.25rem;
  }

  .study__content :global(.footnotes) {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    font-size: var(--fs-small);
    color: var(--fg-muted);
  }

  .study__content :global(.footnotes hr) {
    display: none;
  }

  .study__content :global(.footnotes ol) {
    padding-left: 1.5rem;
  }

  .study__content :global(.footnote-backref) {
    text-decoration: none;
    margin-left: 0.25rem;
    padding: 0.25rem;
  }

  .study__content :global(.footnote-highlight) {
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

  .study__content :global(li:has(> input[type="checkbox"])) {
    list-style: none;
    margin-left: -1.25rem;
  }

  .study__content :global(input[type="checkbox"]) {
    appearance: none;
    -webkit-appearance: none;
    width: 1rem;
    height: 1rem;
    border: 1.5px solid var(--border-color);
    border-radius: 0.25rem;
    background: linear-gradient(
      180deg,
      var(--bg) 0%,
      color-mix(in srgb, var(--bg) 95%, var(--fg)) 100%
    );
    box-shadow:
      inset 0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent),
      0 1px 0 color-mix(in srgb, var(--bg) 50%, #fff);
    vertical-align: -0.125rem;
    margin-right: 0.5rem;
    cursor: default;
    position: relative;
  }

  .study__content :global(input[type="checkbox"]:checked) {
    background: linear-gradient(180deg, var(--success) 0%, var(--success-dark) 100%);
    border-color: var(--success-dark);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, #fff 15%, transparent),
      0 1px 2px color-mix(in srgb, var(--success) 20%, transparent);
  }

  .study__content :global(input[type="checkbox"]:checked)::after {
    content: "";
    position: absolute;
    top: 0.0625rem;
    left: 0.1875rem;
    width: 0.375rem;
    height: 0.5rem;
    border: solid #fff;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }

  .study__content :global(blockquote) {
    border-left: 2px solid var(--accent);
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    color: var(--fg-muted);
    font-style: italic;
    background: color-mix(in srgb, var(--bg-subtle) 60%, var(--bg));
    border-radius: 0 0.375rem 0.375rem 0;
  }

  .study__series {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: var(--space-lg);
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }

  .study__series-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-decoration: none;
    max-width: 50%;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .study__series-link--next {
    margin-left: auto;
    text-align: right;
  }

  .study__series-dir {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .study__series-title {
    font-family: var(--font-serif);
    font-size: var(--fs-body);
    color: var(--fg);
    line-height: var(--leading-snug);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .study__series-link:hover .study__series-title {
    color: var(--fg-muted);
  }

  .study__footer {
    margin-top: var(--space-xl);
  }

  .study__footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.25rem;
  }

  .study__footer-engage {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .study__engage-sep {
    color: var(--fg-subtle);
    opacity: 0.4;
    user-select: none;
  }

  .study__tabs {
    display: flex;
    gap: 0;
  }

  .study__tab {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-subtle);
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    position: relative;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .study__tab::after {
    content: "";
    position: absolute;
    bottom: calc(-0.75rem - 1px);
    left: 0;
    right: 0;
    height: 2px;
    background: transparent;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .study__tab:hover {
    color: var(--fg-muted);
  }

  .study__tab--active {
    color: var(--fg);
  }

  .study__tab--active::after {
    background: var(--fg);
  }

  .study__tab:focus-visible {
    outline: 2px solid var(--fg-subtle);
    outline-offset: -2px;
    border-radius: 0.25rem;
  }

  .study__panels {
    display: grid;
  }

  .study__panel {
    grid-area: 1 / 1;
    min-height: 0;
  }

  .study__related {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .study__next {
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

  .study__next:hover {
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg-subtle) 60%, var(--bg)) 0%,
      var(--bg-subtle) 100%
    );
  }

  .study__next-category {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-subtle);
    margin-bottom: 0.5rem;
  }

  .study__next-title {
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

  .study__next:hover .study__next-title {
    color: var(--fg-muted);
  }

  .study__next-title :global(svg) {
    flex-shrink: 0;
    opacity: 0;
    color: var(--fg-subtle);
    transform: translate(-3px, 3px);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .study__next:hover .study__next-title :global(svg) {
    opacity: 1;
    transform: translate(0, 0);
    color: var(--fg-muted);
  }

  .study__next-description {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    line-height: var(--leading-body);
  }

  :global(html[data-theme="dark"]) .study .study__cover {
    box-shadow: none;
  }

  @media (prefers-color-scheme: dark) {
    .study__cover {
      box-shadow: none;
    }
  }

  :global(html[data-theme="dark"]) .study {
    --noise-opacity: 0.15;
  }

  @media (prefers-reduced-motion: reduce) {
    .study__next,
    .study__next-title,
    .study__next-title :global(svg),
    .study__tag,
    .study__next:hover,
    .study__tab,
    .study__tab::after,
    .study__series-link,
    .study__series-title {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .study {
      --noise-opacity: 0.2;
    }

    .study__bar {
      padding-bottom: 2rem;
    }

    .study__cover {
      margin-top: -3.5rem;
      height: var(--cover-h-mobile, 90px);
    }

    .study__cover--full,
    .study__cover--expanded {
      height: auto;
    }

    .study__related {
      grid-template-columns: 1fr;
    }

    .study__footer-bar {
      flex-wrap: wrap;
      gap: 0;
    }

    .study__footer-engage {
      width: 100%;
      padding-bottom: 0.625rem;
    }

    .study__tabs {
      width: 100%;
    }

    .study__tab {
      flex: 1;
      text-align: center;
    }

    .study__series {
      flex-direction: column;
      gap: 0.75rem;
    }

    .study__series-link {
      max-width: 100%;
    }

    .study__series-link--next {
      text-align: right;
    }
  }

</style>
