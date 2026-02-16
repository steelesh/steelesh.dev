<script lang="ts">
  import type { ContentItem } from "$lib/types";

  import { Hash, Search } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import ProjectCard from "$components/project-card.svelte";
  import { roughHighlight } from "$lib/actions/rough-highlight";
  import { getStatsBatch } from "$lib/api";
  import { categoryPath, content, tagIndex } from "$lib/data/content";
  import { seedStats } from "$lib/data/content-seed";
  import { getPagefind, isPagefindUnavailable } from "$lib/pagefind";
  import { MediaQuery } from "svelte/reactivity";

  const PAGE_SIZE = 6;
  const isDesktop = new MediaQuery("min-width: 769px");

  let searchQuery = $state("");
  let activeSearch = $state("");
  let searchResults = $state<Map<string, string>>(new Map());
  let searchInputEl = $state<HTMLInputElement>();

  const isTagMode = $derived(searchQuery.startsWith("#"));
  let dropdownIndex = $state(0);

  const filteredTags = $derived.by(() => {
    if (!isTagMode)
      return [];
    const q = searchQuery.slice(1).toLowerCase();
    return [...tagIndex.entries()]
      .filter(([tag]) => tag.toLowerCase().includes(q))
      .sort((a, b) => b[1].length - a[1].length);
  });

  const activeTagFilter = $derived.by(() => {
    if (!isTagMode)
      return null;
    const q = searchQuery.slice(1).toLowerCase();
    if (!q)
      return null;
    const match = [...tagIndex.keys()].find(tag => tag.toLowerCase() === q);
    return match ?? null;
  });

  const tagFilteredSlugs = $derived.by(() => {
    if (!activeTagFilter)
      return null;
    const items = tagIndex.get(activeTagFilter) ?? [];
    return new Set(items.map(item => item.slug));
  });

  async function performSearch(q: string) {
    if (isPagefindUnavailable())
      return;

    const pagefind = await getPagefind();
    if (!pagefind)
      return;

    const response = await pagefind.debouncedSearch(q);
    if (!response)
      return;

    const data = await Promise.all(
      response.results.slice(0, 12).map(r => r.data()),
    );
    searchResults = new Map(
      data.map(r => [
        r.url.replace(/\.html$/, "").replace(/\/$/, ""),
        r.excerpt,
      ]),
    );
    activeSearch = q;
  }

  function clearSearch() {
    searchQuery = "";
    activeSearch = "";
    searchResults = new Map();
    dropdownIndex = 0;
  }

  function selectTag(tag: string) {
    searchQuery = `#${tag}`;
    dropdownIndex = 0;
  }

  function onSearchKeydown(e: KeyboardEvent) {
    const visibleTagCount = Math.min(filteredTags.length, 8);
    if (isTagMode && !activeTagFilter && visibleTagCount > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        dropdownIndex = Math.min(dropdownIndex + 1, visibleTagCount - 1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        dropdownIndex = Math.max(dropdownIndex - 1, 0);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTags[dropdownIndex])
          selectTag(filteredTags[dropdownIndex][0]);
        return;
      }
    }
    if (e.key === "Escape") {
      e.preventDefault();
      clearSearch();
      searchInputEl?.blur();
    }
  }

  function contentItemUrl(item: ContentItem): string {
    return `/${categoryPath(item.category)}/${item.slug}`;
  }

  type FilterCategory = "all" | ContentItem["category"];

  const categoryMeta: { value: FilterCategory; label: string }[] = [
    { value: "all", label: "All" },
    { value: "project", label: "Projects" },
    { value: "case-study", label: "Case Studies" },
    { value: "post", label: "Posts" },
  ];

  const tabs = categoryMeta;

  let activeFilter: FilterCategory = $state("all");
  const effectiveFilter = $derived(
    (activeSearch || activeTagFilter) ? "all" as FilterCategory : activeFilter,
  );

  const filteredProjects: ContentItem[] = $derived.by(() => {
    let items = effectiveFilter === "all"
      ? content
      : content.filter(p => p.category === effectiveFilter);
    if (tagFilteredSlugs) {
      items = items.filter(p => tagFilteredSlugs.has(p.slug));
    }
    else if (activeSearch) {
      items = items.filter(p => searchResults.has(contentItemUrl(p)));
    }
    return items;
  });

  let visibleCount = $state(PAGE_SIZE);
  const isFiltering = $derived(!!activeSearch || !!activeTagFilter);
  const visibleProjects = $derived(isFiltering ? filteredProjects : filteredProjects.slice(0, visibleCount));
  const hasMore = $derived(!isFiltering && filteredProjects.length > visibleCount);
  const remaining = $derived(filteredProjects.length - visibleCount);

  const filterKey = $derived(`${effectiveFilter}|${activeSearch}|${activeTagFilter}`);
  $effect(() => {
    void filterKey;
    visibleCount = PAGE_SIZE;
  });

  let batchStats = $state<Record<string, { views: number; likes: number }>>({});
  let statsLoaded = $state(false);
  const fetchedSlugs = new Set<string>();

  $effect(() => {
    if (!browser)
      return;
    const newItems = visibleProjects.filter(p => !fetchedSlugs.has(p.slug));
    if (newItems.length === 0)
      return;
    for (const p of newItems) fetchedSlugs.add(p.slug);

    const fakeStats: Record<string, { views: number; likes: number }> = {};
    for (const p of newItems) {
      if (p.devOnly)
        fakeStats[p.slug] = seedStats(p.slug);
    }
    const realSlugs = newItems.filter(p => !p.devOnly).map(p => p.slug);
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

  $effect(() => {
    const q = searchQuery;
    dropdownIndex = 0;
    if (!q.trim() || isTagMode) {
      activeSearch = "";
      searchResults = new Map();
      return;
    }
    const timeout = setTimeout(() => performSearch(q), 200);
    return () => clearTimeout(timeout);
  });

  function onTabKeydown(event: KeyboardEvent) {
    const currentIndex = tabs.findIndex(t => t.value === activeFilter);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight")
      nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home")
      nextIndex = 0;
    else if (event.key === "End")
      nextIndex = tabs.length - 1;
    else
      return;

    event.preventDefault();
    activeFilter = tabs[nextIndex].value;

    const tablist = (event.currentTarget as HTMLElement).closest("[role='tablist']");
    if (tablist) {
      const buttons = tablist.querySelectorAll<HTMLButtonElement>("[role='tab']");
      buttons[nextIndex]?.focus();
    }
  }

</script>

<section class="projects noise-overlay" id="work" aria-labelledby="projects-heading" style="--noise-opacity: 0.12">
  <div class="projects__inner">
    <span class="section-index projects__index" data-animate style="--y: 15px">[4]</span>
    <h2 class="projects__heading" id="projects-heading" data-animate>
      <span {@attach roughHighlight()}>Selected Work</span>
    </h2>

    <div
      class="projects__tabs"
      data-animate
      style="--start: 40ms; --y: 15px"
    >
      <div class="projects__tab-group" role="tablist" aria-label="Filter by category">
        {#each tabs as tab}
          <button
            class="projects__tab"
            class:projects__tab--active={activeFilter === tab.value}
            role="tab"
            aria-selected={activeFilter === tab.value}
            tabindex={activeFilter === tab.value ? 0 : -1}
            id="tab-{tab.value}"
            aria-controls="tabpanel-projects"
            onkeydown={onTabKeydown}
            onclick={() => (activeFilter = tab.value)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
      {#if isDesktop.current}
        <div class="projects__search-wrap">
          <div class="projects__search">
            {#if isTagMode}
              <Hash size={14} strokeWidth={2} />
            {:else}
              <Search size={14} strokeWidth={2} />
            {/if}
            <input
              class="projects__search-input"
              type="text"
              placeholder={isTagMode ? "Filter by tag..." : "Search..."}
              bind:value={searchQuery}
              bind:this={searchInputEl}
              onkeydown={onSearchKeydown}
              aria-label="Search content"
            />
            <kbd class="projects__search-shortcut">{isTagMode ? "#" : "⌘K"}</kbd>
          </div>
          {#if isTagMode && !activeTagFilter && filteredTags.length > 0}
            <div class="projects__dropdown" role="listbox" aria-label="Tag suggestions">
              {#each filteredTags.slice(0, 8) as [tag, items], i}
                <button
                  class="projects__dropdown-item"
                  class:projects__dropdown-item--active={i === dropdownIndex}
                  role="option"
                  aria-selected={i === dropdownIndex}
                  onclick={() => selectTag(tag)}
                  onmouseenter={() => { dropdownIndex = i; }}
                >
                  <span class="projects__dropdown-tag">#{tag}</span>
                  <span class="projects__dropdown-count">{items.length}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <button
          class="projects__search"
          onclick={() => window.dispatchEvent(new CustomEvent("opensearch"))}
          aria-label="Search content"
        >
          <Search size={14} strokeWidth={2} />
          <span class="projects__search-text">Search...</span>
        </button>
      {/if}
    </div>

    {#if activeTagFilter}
      <a class="projects__tag-page-link" href="/tags/{encodeURIComponent(activeTagFilter)}">
        View #{activeTagFilter} tag page &rarr;
      </a>
    {/if}

    {#key effectiveFilter}
      <div
        class="projects__list"
        role="tabpanel"
        id="tabpanel-projects"
        aria-labelledby="tab-{effectiveFilter}"
      >
        {#each visibleProjects as project, i}
          <ProjectCard
            {project}
            index={i}
            searchExcerpt={activeSearch ? searchResults.get(contentItemUrl(project)) : undefined}
            activeTag={activeTagFilter ?? undefined}
            views={batchStats[project.slug]?.views ?? 0}
            likes={batchStats[project.slug]?.likes ?? 0}
            {statsLoaded}
          />
        {:else}
          {#if activeTagFilter}
            <p class="projects__empty">No content tagged #{activeTagFilter}</p>
          {:else if isTagMode && searchQuery.length > 1}
            <p class="projects__empty">No tag matching &ldquo;{searchQuery.slice(1)}&rdquo;</p>
          {:else if activeSearch}
            <p class="projects__empty">No results for &ldquo;{activeSearch}&rdquo;</p>
          {:else}
            <p class="projects__empty">No {tabs.find(t => t.value === effectiveFilter)?.label.toLowerCase() ?? "content"} yet.</p>
          {/if}
        {/each}
      </div>
      {#if hasMore}
        <button
          class="projects__show-more"
          onclick={() => { visibleCount += PAGE_SIZE; }}
        >
          Show more ({remaining} remaining)
        </button>
      {/if}
    {/key}
  </div>
</section>

<style>
  .projects {
    --s-fg: #ffffff;
    --s-fg-high: rgba(255, 255, 255, 0.95);
    --s-fg-text: rgba(255, 255, 255, 0.85);
    --s-fg-muted: rgba(255, 255, 255, 0.7);
    --s-fg-subtle: rgba(255, 255, 255, 0.5);
    --s-fg-faint: rgba(255, 255, 255, 0.5);
    --s-fg-dim: rgba(255, 255, 255, 0.5);
    --s-fg-ghost: rgba(255, 255, 255, 0.45);
    --s-fg-trace: rgba(255, 255, 255, 0.45);
    --s-bg-hover: rgba(255, 255, 255, 0.06);
    --s-bg-subtle: rgba(255, 255, 255, 0.04);
    --s-border: rgba(255, 255, 255, 0.08);
    --s-border-hover: rgba(255, 255, 255, 0.15);
    --s-border-dim: rgba(255, 255, 255, 0.1);
    --s-bg-active: rgba(255, 255, 255, 0.08);
    --selection-bg: rgba(255, 255, 255, 0.1);
    padding: var(--space-section) var(--space-md);
    min-height: 80svh;
    background: var(--dark-bg);
    color: var(--dark-fg);
    position: relative;
    overflow: hidden;
  }

  .projects__inner {
    position: relative;
    max-width: var(--max-width);
    margin: 0 auto;
  }

  .projects__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }

  .projects__heading {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-lg);
    color: var(--s-fg);
  }

  .projects__index {
    color: var(--s-fg-faint);
  }

  .projects__tabs {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    position: relative;
    z-index: 1;
  }

  .projects__tab-group {
    display: flex;
    gap: var(--space-sm);
  }

  .projects__tab {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--s-fg-faint);
    background: none;
    border: none;
    padding: 0.75rem 0.25rem;
    position: relative;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .projects__tab:hover {
    color: var(--s-fg-muted);
  }

  .projects__tab--active {
    color: var(--s-fg-high);
  }

  .projects__tab--active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--accent);
    opacity: 0.8;
  }

  .projects__tab:focus-visible {
    outline: 1px solid var(--accent);
    outline-offset: 4px;
    border-radius: 2px;
  }

  .projects__search-wrap {
    position: relative;
    margin-left: auto;
  }

  .projects__search {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: 12rem;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    color: var(--s-fg-ghost);
    background: var(--s-bg-subtle);
    border: 1px solid var(--s-border);
    padding: 0.4rem 0.625rem;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .projects__search:hover {
    color: var(--s-fg-subtle);
    background: var(--s-bg-hover);
    border-color: var(--s-border-hover);
  }

  .projects__search:focus-visible,
  .projects__search:focus-within {
    color: var(--s-fg-subtle);
    background: var(--s-bg-hover);
    border-color: var(--s-border-hover);
    outline: 2px solid var(--s-fg-subtle);
    outline-offset: 2px;
    border-radius: 6px;
  }

  .projects__search-input {
    flex: 1;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    color: rgba(255, 255, 255, 0.9);
    background: none;
    border: none;
    outline: none;
    min-width: 0;
  }

  .projects__search-input::placeholder {
    color: var(--s-fg-ghost);
  }

  .projects__search-text {
    flex: 1;
    text-align: left;
  }

  .projects__search-shortcut {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--s-fg-trace);
    border: 1px solid var(--s-border-dim);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
    line-height: 1;
  }

  .projects__tag-page-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--s-fg-faint);
    text-decoration: none;
    margin-bottom: var(--space-sm);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .projects__tag-page-link:hover {
    color: var(--s-fg-muted);
  }

  .projects__empty {
    grid-column: 1 / -1;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--s-fg-dim);
    text-align: center;
    padding: var(--space-xl) var(--space-md);
  }

  .projects__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.375rem;
    width: 14rem;
    max-height: 16rem;
    overflow-y: auto;
    background: var(--dark-bg);
    border: 1px solid var(--s-border-dim);
    border-radius: 0.5rem;
    padding: 0.25rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  .projects__dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: none;
    background: none;
    border-radius: 0.375rem;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .projects__dropdown-item--active {
    background: var(--s-bg-active);
  }

  .projects__dropdown-tag {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--s-fg-text);
  }

  .projects__dropdown-count {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--s-fg-dim);
    background: var(--s-bg-hover);
    padding: 0.0625rem 0.375rem;
    border-radius: 999px;
    min-width: 1.25rem;
    text-align: center;
  }

  .projects__show-more {
    display: block;
    margin: var(--space-lg) auto 0;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--s-fg-faint);
    background: var(--s-bg-subtle);
    border: 1px solid var(--s-border);
    padding: 0.625rem 1.5rem;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .projects__show-more:hover {
    color: var(--s-fg-muted);
    background: var(--s-bg-hover);
    border-color: var(--s-border-hover);
  }

  .projects__show-more:focus-visible {
    outline: 1px solid var(--accent);
    outline-offset: 4px;
    border-radius: 6px;
  }

  @media (prefers-reduced-motion: reduce) {
    .projects__tab,
    .projects__search,
    .projects__tag-page-link,
    .projects__dropdown-item,
    .projects__show-more {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .projects {
      --noise-opacity: 0.05;
    }

    .projects__tabs {
      justify-content: space-between;
    }

    .projects__list {
      grid-template-columns: 1fr;
    }
  }
</style>
