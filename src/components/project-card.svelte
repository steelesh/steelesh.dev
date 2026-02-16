<script lang="ts">
  import type { ContentItem } from "$lib/types";

  import { ArrowUpRight, Eye, Heart } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import fallbackSrc from "$lib/assets/covers/fallback.svg";
  import { categoryPath } from "$lib/data/content";
  import { categoryLabel, formatCount } from "$lib/utils";
  import { fade } from "svelte/transition";

  interface Props {
    project: ContentItem;
    index?: number;
    searchExcerpt?: string;
    activeTag?: string;
    views?: number;
    likes?: number;
    statsLoaded?: boolean;
  }

  const { project, index = 0, searchExcerpt, activeTag, views = 0, likes = 0, statsLoaded = false }: Props = $props();

  let liked = $state(false);

  const href = $derived(`/${categoryPath(project.category)}/${project.slug}`);

  const coverSrc = $derived.by(() => {
    const img = project.coverImage;
    if (!img)
      return fallbackSrc;
    if (typeof img === "object" && "light" in img) {
      const t = browser ? (document.documentElement.dataset.theme as "light" | "dark") ?? "light" : "light";
      return img[t];
    }
    return img;
  });

  $effect(() => {
    if (!browser)
      return;
    liked = localStorage.getItem(`liked:${project.slug}`) === "1";
  });
</script>

<a class="card" {href} data-animate style="--stagger: {index}; --delay: 80ms; --y: 15px">
  <div class="card__cover">
    <enhanced:img
      class="card__cover-img"
      src={coverSrc}
      alt={project.coverImageAlt || project.name}
      loading="lazy"
      decoding="async"
    />
  </div>
  <span class="card__category">{categoryLabel(project.category)}</span>
  <h3 class="card__name">
    {project.name}
    <ArrowUpRight size={14} strokeWidth={2} />
  </h3>
  {#if searchExcerpt}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- Pagefind excerpts contain <mark> highlights -->
    <p class="card__description card__description--search">{@html searchExcerpt}</p>
  {:else}
    <p class="card__description">{project.description}</p>
  {/if}
  {#if activeTag && project.tags.length}
    <div class="card__tags">
      {#each project.tags as tag}
        <span class="card__tag" class:card__tag--active={tag === activeTag}>#{tag}</span>
      {/each}
    </div>
  {/if}
  {#if statsLoaded && (views > 0 || likes > 0)}
    <div class="card__stats" transition:fade={{ duration: 150 }}>
      {#if views > 0}
        <span class="card__stat">
          <Eye size={12} strokeWidth={2} />
          {formatCount(views)}
        </span>
      {/if}
      {#if likes > 0}
        <span class="card__stat" class:card__stat--liked={liked}>
          <Heart size={12} strokeWidth={2} class={liked ? "card__heart--filled" : ""} />
          {formatCount(likes)}
        </span>
      {/if}
    </div>
  {/if}
</a>

<style>
  .card {
    display: block;
    text-decoration: none;
    color: var(--dark-fg);
  }

  .card:focus-visible {
    outline: 1px solid var(--accent);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .card__cover {
    display: block;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .card__cover-img {
    display: block;
    width: 100%;
    height: auto;
    transition: transform 300ms var(--ease-out);
  }

  .card:hover .card__cover-img {
    transform: scale(1.05);
  }

  .card__category {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.5rem;
  }

  .card__name {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--fs-h2);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    margin-bottom: 0.35rem;
    color: var(--dark-fg);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .card:hover .card__name {
    color: rgba(255, 255, 255, 0.7);
  }

  .card__name :global(svg) {
    flex-shrink: 0;
    opacity: 0;
    transform: translate(-3px, 3px);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .card:hover .card__name :global(svg) {
    opacity: 1;
    transform: translate(0, 0);
  }

  .card__description {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: rgba(255, 255, 255, 0.6);
    line-height: var(--leading-body);
  }

  .card__description--search {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card__description--search :global(mark) {
    background: rgba(196, 149, 106, 0.25);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 2px;
    padding: 0 2px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .card__stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: rgba(255, 255, 255, 0.5);
  }

  .card__stat {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .card__stat :global(svg) {
    opacity: 0.6;
  }

  .card__stat--liked {
    color: var(--error);
  }

  .card__stat--liked :global(svg) {
    opacity: 1;
  }

  .card__stat :global(.card__heart--filled) {
    fill: currentColor;
  }

  .card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.5rem;
  }

  .card__tag {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.5);
  }

  .card__tag--active {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  @media (prefers-reduced-motion: reduce) {
    .card__cover-img,
    .card__name :global(svg) {
      transition: none;
    }
  }
</style>
