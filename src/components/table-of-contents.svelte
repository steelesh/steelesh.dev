<script lang="ts">
  import { getLenis } from "$lib/lenis";

  interface Props {
    contentEl: HTMLElement | undefined;
    articleEl?: HTMLElement | undefined;
  }

  interface TocEntry {
    id: string;
    text: string;
    level: 2 | 3;
  }

  const { contentEl, articleEl }: Props = $props();

  let hidden = $state(false);

  $effect(() => {
    if (!articleEl)
      return;

    function onScroll() {
      const rect = articleEl!.getBoundingClientRect();
      const tocBottom = 10 * 16 + (window.innerHeight - 20 * 16);
      hidden = rect.bottom < tocBottom;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  });

  let headings = $state<TocEntry[]>([]);
  let activeId = $state("");
  let indicatorY = $state(0);
  let indicatorH = $state(0);
  let listEl = $state<HTMLUListElement>();

  const hasHeadings = $derived(headings.length > 0);

  $effect(() => {
    if (!contentEl)
      return;

    const els = contentEl.querySelectorAll<HTMLElement>("h2[id], h3[id]");
    headings = Array.from(els).map(el => ({
      id: el.id,
      text: Array.from(el.childNodes)
        .filter(n => !(n instanceof HTMLElement && n.classList.contains("heading-anchor")))
        .map(n => n.textContent)
        .join("")
        .trim(),
      level: Number.parseInt(el.tagName[1]) as 2 | 3,
    }));
  });

  $effect(() => {
    if (!contentEl || headings.length === 0)
      return;

    const els = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px" },
    );

    for (const el of els)
      observer.observe(el);
    return () => observer.disconnect();
  });

  $effect(() => {
    if (!activeId || !listEl)
      return;

    const link = listEl.querySelector<HTMLElement>(`.toc__link[href="#${CSS.escape(activeId)}"]`);
    if (!link)
      return;

    link.scrollIntoView({ block: "nearest" });

    const li = link.closest<HTMLElement>(".toc__item");
    if (li) {
      indicatorY = li.offsetTop;
      indicatorH = li.offsetHeight;
    }
  });

  function scrollToHeading(id: string) {
    activeId = id;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -80 });
    }
    else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

{#if hasHeadings}
  <nav class="toc" class:toc--hidden={hidden} aria-label="Table of contents">
    <span class="toc__label">On this page</span>
    <div class="toc__list-wrapper">
      <div
        class="toc__indicator"
        style="--y: {indicatorY}px; --h: {indicatorH}px"
        aria-hidden="true"
      ></div>
      <ul class="toc__list" bind:this={listEl}>
        {#each headings as heading (heading.id)}
          <li class="toc__item" class:toc__item--h3={heading.level === 3}>
            <a
              class="toc__link"
              class:toc__link--active={activeId === heading.id}
              href="#{heading.id}"
              title={heading.text}
              onclick={(e) => {
                e.preventDefault();
                scrollToHeading(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}

<style>
  .toc {
    position: fixed;
    left: calc(50% + var(--max-width-text) / 2 + 3rem);
    top: 10rem;
    max-width: 200px;
    max-height: calc(100vh - 20rem);
    overflow-y: auto;
    scrollbar-width: none;
    z-index: 40;
    opacity: 1;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .toc--hidden {
    opacity: 0;
    pointer-events: none;
  }

  .toc::-webkit-scrollbar {
    display: none;
  }

  .toc__label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--fg-subtle);
    margin-bottom: 0.75rem;
  }

  .toc__list-wrapper {
    position: relative;
    border-left: 1px solid var(--border-color);
  }

  .toc__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .toc__indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: var(--h);
    background: var(--fg);
    transform: translateY(var(--y));
    transition: transform var(--duration-fast) var(--ease-out), height var(--duration-fast) var(--ease-out);
    border-radius: 1px;
    z-index: 1;
  }

  .toc__item {
    padding-left: 0.75rem;
  }

  .toc__item--h3 {
    padding-left: 1.5rem;
  }

  .toc__link {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    line-height: 1.5;
    color: var(--fg-subtle);
    text-decoration: none;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border-radius: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
  }

  .toc__link:hover {
    color: var(--fg-muted);
    background: color-mix(in srgb, var(--fg) 4%, transparent);
  }

  .toc__link--active {
    color: var(--fg);
    font-weight: 500;
  }

  .toc__item--h3 .toc__link {
    font-size: 0.6875rem;
    opacity: 0.85;
  }

  .toc__link:focus-visible {
    outline: 2px solid var(--fg-subtle);
    outline-offset: 2px;
    border-radius: 0.25rem;
  }

  :global(html[data-theme="light"]) .toc {
    --fg: #333334;
    --fg-muted: #6b6560;
    --fg-subtle: #76706b;
    --border-color: rgba(51, 51, 52, 0.12);
  }

  :global(html[data-theme="dark"]) .toc {
    --fg: #f0ede8;
    --fg-muted: #a8a29e;
    --fg-subtle: #8a8480;
    --border-color: rgba(240, 237, 232, 0.1);
  }

  @media (max-width: 1079px) {
    .toc {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .toc,
    .toc__link {
      transition: none;
    }

    .toc__indicator {
      transition: none;
    }
  }
</style>
