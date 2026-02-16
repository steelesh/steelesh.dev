<script lang="ts">
  import type { PagefindSearchFragment } from "vite-plugin-pagefind/types";

  import { Hash, Search, X } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { categoryPath, tagIndex } from "$lib/data/content";
  import { getPagefind, isPagefindUnavailable } from "$lib/pagefind";
  import { categoryLabel } from "$lib/utils";

  interface Props {
    open: boolean;
    onclose: () => void;
  }

  const { open, onclose }: Props = $props();

  let query = $state("");
  let results = $state<PagefindSearchFragment[]>([]);
  let activeIndex = $state(0);
  let loading = $state(false);
  let inputEl = $state<HTMLInputElement>();
  let tagFilter = $state<string | null>(null);

  const isTagMode = $derived(query.startsWith("#") && !tagFilter);

  const filteredTags = $derived.by(() => {
    if (!isTagMode)
      return [];
    const q = query.slice(1).toLowerCase();
    return [...tagIndex.entries()]
      .filter(([tag]) => tag.toLowerCase().includes(q))
      .sort((a, b) => b[1].length - a[1].length);
  });

  const tagResults = $derived.by(() => {
    if (!tagFilter)
      return [];
    let items = tagIndex.get(tagFilter) ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        item => item.name.toLowerCase().includes(q)
          || item.title.toLowerCase().includes(q)
          || item.subtitle.toLowerCase().includes(q)
          || item.description.toLowerCase().includes(q),
      );
    }
    return items;
  });

  const showFooter = $derived(isTagMode || tagFilter || results.length);

  async function search(q: string) {
    if (!q.trim()) {
      results = [];
      return;
    }
    if (isPagefindUnavailable())
      return;

    loading = true;

    try {
      const pagefind = await getPagefind();
      if (!pagefind)
        return;

      const response = await pagefind.debouncedSearch(q);
      if (!response)
        return;

      const data = await Promise.all(
        response.results.slice(0, 8).map(r => r.data()),
      );
      results = data;
      activeIndex = 0;
    }
    catch {
      results = [];
    }
    finally {
      loading = false;
    }
  }

  function navigate(url: string) {
    const cleanUrl = url.replace(/\.html$/, "").replace(/\/$/, "");
    onclose();
    query = "";
    results = [];
    tagFilter = null;
    goto(cleanUrl);
  }

  function selectTag(tag: string) {
    tagFilter = tag;
    query = "";
    activeIndex = 0;
    requestAnimationFrame(() => inputEl?.focus());
  }

  function clearTagFilter() {
    tagFilter = null;
    query = "";
    activeIndex = 0;
    results = [];
    requestAnimationFrame(() => inputEl?.focus());
  }

  function scrollActiveIntoView() {
    requestAnimationFrame(() => {
      const el = document.querySelector(".modal__result--active");
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (tagFilter) {
        clearTagFilter();
      }
      else if (isTagMode) {
        query = "";
      }
      else {
        onclose();
      }
    }
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = isTagMode
        ? Math.min(filteredTags.length, 8) - 1
        : tagFilter
        ? tagResults.length - 1
        : results.length - 1;
      activeIndex = Math.min(activeIndex + 1, max);
      scrollActiveIntoView();
    }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      scrollActiveIntoView();
    }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (isTagMode && filteredTags[activeIndex]) {
        selectTag(filteredTags[activeIndex][0]);
      }
      else if (tagFilter && tagResults[activeIndex]) {
        const item = tagResults[activeIndex];
        navigate(`/${categoryPath(item.category)}/${item.slug}`);
      }
      else if (results[activeIndex]) {
        navigate(results[activeIndex].url);
      }
    }
    else if (e.key === "Backspace" && !query && tagFilter) {
      e.preventDefault();
      clearTagFilter();
    }
  }

  $effect(() => {
    if (isTagMode || tagFilter)
      return;
    search(query);
  });

  $effect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputEl?.focus());
      query = "";
      results = [];
      tagFilter = null;
      activeIndex = 0;
    }

    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={onclose} onkeydown={handleKeydown}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal" onclick={e => e.stopPropagation()} role="dialog" aria-label="Search content" tabindex="-1">
      <div class="modal__input-wrap">
        {#if isTagMode}
          <Hash size={16} strokeWidth={2} />
        {:else}
          <Search size={16} strokeWidth={2} />
        {/if}
        {#if tagFilter}
          <button class="modal__tag-chip" onclick={clearTagFilter} aria-label="Clear tag filter">
            <span>#{tagFilter}</span>
            <X size={10} strokeWidth={2} />
          </button>
        {/if}
        <input
          class="modal__input"
          type="text"
          placeholder={isTagMode ? "Type to filter tags..." : tagFilter ? "Filter within tag..." : "Search..."}
          bind:value={query}
          bind:this={inputEl}
          aria-label="Search query"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        <kbd class="modal__kbd">esc</kbd>
      </div>

      {#if isTagMode}
        <div class="modal__results" id="search-results" role="listbox">
          {#if filteredTags.length}
            {#each filteredTags.slice(0, 8) as [tag, items], i}
              <button
                class="modal__result modal__tag-option"
                class:modal__result--active={i === activeIndex}
                role="option"
                aria-selected={i === activeIndex}
                onclick={() => selectTag(tag)}
                onmouseenter={() => { activeIndex = i; }}
              >
                <span class="modal__tag-name">#{tag}</span>
                <span class="modal__tag-count">{items.length}</span>
              </button>
            {/each}
          {:else}
            <p class="modal__empty">No tags matching &ldquo;{query.slice(1)}&rdquo;</p>
          {/if}
        </div>
      {:else if tagFilter}
        <a
          class="modal__tag-page-link"
          href="/tags/{encodeURIComponent(tagFilter)}"
          onclick={(e) => {
            e.preventDefault();
            if (tagFilter)
              navigate(`/tags/${encodeURIComponent(tagFilter)}`);
          }}
        >
          View all #{tagFilter} &rarr;
        </a>
        <div class="modal__results" id="search-results" role="listbox">
          {#if tagResults.length}
            {#each tagResults as item, i}
              <button
                class="modal__result"
                class:modal__result--active={i === activeIndex}
                role="option"
                aria-selected={i === activeIndex}
                onclick={() => navigate(`/${categoryPath(item.category)}/${item.slug}`)}
                onmouseenter={() => { activeIndex = i; }}
              >
                <span class="modal__result-category">{categoryLabel(item.category)}</span>
                <span class="modal__result-title">{item.name}</span>
                <span class="modal__result-excerpt">{item.subtitle}</span>
                <span class="modal__result-tags">
                  {#each item.tags as tag}
                    <span class="modal__result-tag" class:modal__result-tag--active={tag === tagFilter}>#{tag}</span>
                  {/each}
                </span>
              </button>
            {/each}
          {:else if query.trim()}
            <p class="modal__empty">No results for &ldquo;{query}&rdquo; in #{tagFilter}</p>
          {:else}
            <p class="modal__empty">No content tagged #{tagFilter}</p>
          {/if}
        </div>
      {:else if isPagefindUnavailable() || query.trim() || results.length}
        <div class="modal__results" id="search-results" role="listbox">
          {#if isPagefindUnavailable()}
            <p class="modal__empty">Search unavailable in dev mode. Run <code>bun run build</code> first.</p>
          {:else if loading && !results.length}
            <p class="modal__empty">Searching...</p>
          {:else if query.trim() && !results.length && !loading}
            <p class="modal__empty">No results for &ldquo;{query}&rdquo;</p>
          {:else}
            {#each results as result, i}
              <button
                class="modal__result"
                class:modal__result--active={i === activeIndex}
                role="option"
                aria-selected={i === activeIndex}
                onclick={() => navigate(result.url)}
                onmouseenter={() => { activeIndex = i; }}
              >
                <span class="modal__result-title">{result.meta?.title ?? "Untitled"}</span>
                <!-- eslint-disable-next-line svelte/no-at-html-tags -- Pagefind excerpts contain <mark> highlights -->
                <span class="modal__result-excerpt">{@html result.excerpt}</span>
              </button>
            {/each}
          {/if}
        </div>
      {/if}

      {#if showFooter}
        <div class="modal__footer">
          {#if !isTagMode && !tagFilter}
            <span class="modal__hint"><kbd class="modal__kbd modal__kbd--sm">#</kbd> tags</span>
          {/if}
          {#if tagFilter}
            <span class="modal__hint"><kbd class="modal__kbd modal__kbd--sm">&lArr;</kbd> clear tag</span>
          {/if}
          <span class="modal__hint"><kbd class="modal__kbd modal__kbd--sm">&uarr;</kbd><kbd class="modal__kbd modal__kbd--sm">&darr;</kbd> navigate</span>
          <span class="modal__hint"><kbd class="modal__kbd modal__kbd--sm">&crarr;</kbd> {isTagMode ? "select" : "open"}</span>
          <span class="modal__hint"><kbd class="modal__kbd modal__kbd--sm">esc</kbd> {tagFilter ? "clear" : isTagMode ? "back" : "close"}</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: min(20vh, 10rem);
    animation: fade-in 150ms ease-out;
  }

  .modal {
    width: min(560px, calc(100vw - 2rem));
    max-height: min(480px, calc(100svh - 12rem));
    background: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    overflow: clip;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.03),
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 24px 48px rgba(0, 0, 0, 0.08);
    animation: modal-in 200ms var(--ease-out);
  }

  .modal__input-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--fg-subtle);
  }

  .modal__input {
    flex: 1;
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg);
    background: none;
    border: none;
    outline: none;
    min-width: 0;
  }

  .modal__input:focus-visible {
    outline: 2px solid var(--fg-subtle);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .modal__input::placeholder {
    color: var(--fg-subtle);
  }

  .modal__kbd {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-subtle);
    background: var(--bg-subtle);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.125rem 0.375rem;
    line-height: 1;
  }

  .modal__kbd--sm {
    font-size: 0.625rem;
    padding: 0.1rem 0.25rem;
  }

  .modal__tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    background: var(--bg-subtle);
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    flex-shrink: 0;
    transition: border-color var(--duration-fast) var(--ease-out);
  }

  .modal__tag-chip:hover {
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  .modal__results {
    overflow-y: auto;
    padding: var(--space-xs);
    flex: 1;
  }

  .modal__empty {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    text-align: center;
    padding: var(--space-lg) var(--space-md);
  }

  .modal__empty code {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: var(--bg-subtle);
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
  }

  .modal__result {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.625rem 0.75rem;
    border: none;
    background: none;
    border-radius: 0.5rem;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .modal__result--active {
    background: var(--bg-subtle);
  }

  .modal__tag-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal__tag-name {
    font-family: var(--font-mono);
    font-size: var(--fs-small);
    letter-spacing: 0.02em;
    color: var(--fg);
  }

  .modal__tag-count {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-subtle);
    background: color-mix(in srgb, var(--fg) 6%, transparent);
    padding: 0.0625rem 0.375rem;
    border-radius: 999px;
    min-width: 1.25rem;
    text-align: center;
  }

  .modal__result-category {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-subtle);
    margin-bottom: 0.125rem;
  }

  .modal__result-title {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    font-weight: 600;
    color: var(--fg);
    margin-bottom: 0.25rem;
  }

  .modal__result-excerpt {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    color: var(--fg-muted);
    line-height: var(--leading-body);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .modal__result-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.375rem;
  }

  .modal__result-tag {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
  }

  .modal__result-tag--active {
    color: var(--fg-muted);
    font-weight: 500;
  }

  .modal__tag-page-link {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    text-decoration: none;
    border-bottom: 1px solid var(--border-color);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .modal__tag-page-link:hover {
    color: var(--fg);
  }

  .modal__result-excerpt :global(mark) {
    background: rgba(196, 149, 106, 0.2);
    color: var(--fg);
    border-radius: 2px;
    padding: 0 2px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .modal__footer {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--border-color);
  }

  .modal__hint {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--fg-subtle);
    letter-spacing: 0.01em;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-in {
    from {
      opacity: 0;
      transform: scale(0.97) translateY(-6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .backdrop,
    .modal {
      animation: none;
    }
  }

  @media (max-width: 768px) {
    .backdrop {
      padding-top: var(--space-lg);
      align-items: flex-start;
    }

    .modal {
      max-height: calc(100svh - 4rem);
    }

    .modal__footer {
      display: none;
    }
  }
</style>
