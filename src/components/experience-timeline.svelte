<script lang="ts">
  import ExperienceEntry from "$components/experience-entry.svelte";
  import { roughHighlight } from "$lib/actions/rough-highlight";
  import { experiences } from "$lib/data/experience";
  import { getLenis } from "$lib/lenis";
  import { MediaQuery } from "svelte/reactivity";

  const isDesktop = new MediaQuery("min-width: 769px");

  type ExperienceFilter = "work" | "education";
  let filter: ExperienceFilter = $state("work");
  const filteredExperiences = $derived(experiences.filter(e => e.type === filter));

  let entriesEl = $state<HTMLDivElement>();

  $effect(() => {
    if (!entriesEl)
      return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let ticking = false;
    let snapTimer: ReturnType<typeof setTimeout>;
    let isSnapping = false;

    function applyFocus(entryList: HTMLElement[], focusIdx: number) {
      for (let i = 0; i < entryList.length; i++) {
        const focus = i === focusIdx ? 1 : 0;
        const passed = i <= focusIdx ? 1 : 0;
        entryList[i].style.setProperty("--focus", String(focus));
        entryList[i].style.setProperty("--passed", String(passed));
        entryList[i].style.setProperty("--active", String(focus));
        entryList[i].style.setProperty("--active-events", focus ? "auto" : "none");
      }
    }

    function update() {
      const entries
        = entriesEl!.querySelectorAll<HTMLElement>("[data-entry]");
      const entryList = Array.from(entries);

      if (reduced) {
        for (const entry of entryList) {
          entry.style.setProperty("--focus", "1");
          entry.style.setProperty("--passed", "1");
          entry.style.setProperty("--active", "1");
          entry.style.setProperty("--active-events", "auto");
        }
        ticking = false;
        return;
      }

      const viewCenter = window.innerHeight / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < entryList.length; i++) {
        const entryRect = entryList[i].getBoundingClientRect();
        const entryCenter = entryRect.top + entryRect.height / 2;
        const dist = Math.abs(entryCenter - viewCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      applyFocus(entryList, closestIdx);
      ticking = false;
    }

    function snapToClosest() {
      const entries
        = entriesEl!.querySelectorAll<HTMLElement>("[data-entry]");
      const viewCenter = window.innerHeight / 2;

      let closest: HTMLElement | null = null;
      let closestDist = Infinity;

      for (const entry of entries) {
        const rect = entry.getBoundingClientRect();
        const entryCenter = rect.top + rect.height / 2;
        const dist = Math.abs(entryCenter - viewCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = entry;
        }
      }

      if (closest && closestDist > 20) {
        isSnapping = true;
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(closest, {
            offset: -window.innerHeight / 2 + closest.offsetHeight / 2,
            onComplete: () => {
              isSnapping = false;
            },
          });
        }
        else {
          const rect = closest.getBoundingClientRect();
          const entryCenter = rect.top + rect.height / 2;
          const offset = entryCenter - viewCenter;
          window.scrollBy({ top: offset, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
          }, 600);
        }
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }

      if (isDesktop.current && !isSnapping && !reduced) {
        clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const rect = entriesEl!.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          if (inView)
            snapToClosest();
        }, 150);
      }
    }

    function onEntryActivate(e: Event) {
      const clickedEntry = (e.target as HTMLElement).closest("[data-entry]") as HTMLElement;
      if (!clickedEntry)
        return;

      const entries = entriesEl!.querySelectorAll<HTMLElement>("[data-entry]");
      const entryList = Array.from(entries);
      const clickedIdx = entryList.indexOf(clickedEntry);

      applyFocus(entryList, clickedIdx);

      const rect = clickedEntry.getBoundingClientRect();
      const entryCenter = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const offset = entryCenter - viewCenter;

      if (isDesktop.current && Math.abs(offset) > 20) {
        isSnapping = true;
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(clickedEntry, {
            offset: -window.innerHeight / 2 + clickedEntry.offsetHeight / 2,
            onComplete: () => {
              isSnapping = false;
            },
          });
        }
        else {
          window.scrollBy({ top: offset, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
          }, 600);
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    entriesEl.addEventListener("entryactivate", onEntryActivate);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      entriesEl?.removeEventListener("entryactivate", onEntryActivate);
      clearTimeout(snapTimer);
    };
  });
</script>

<section class="timeline noise-overlay" id="experience" aria-labelledby="experience-heading" style="--noise-opacity: 0.15">
  <div class="timeline__inner">
    <span class="section-index" data-animate style="--y: 15px">[2]</span>
    <h2 class="timeline__heading" id="experience-heading" data-animate>
      <!-- svelte-ignore a11y_interactive_supports_focus -->
      <span class="timeline__filters" role="tablist" aria-label="Experience type" onkeydown={(e: KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          filter = filter === "work" ? "education" : "work";
          (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(`[aria-selected="true"]`)?.focus();
        }
      }}>
        <button
          class="timeline__filter"
          class:timeline__filter--active={filter === "work"}
          role="tab"
          aria-selected={filter === "work"}
          tabindex={filter === "work" ? 0 : -1}
          onclick={() => (filter = "work")}
        >
          {#if filter === "work"}
            <span {@attach roughHighlight()}>Experience</span>
          {:else}
            Experience
          {/if}
        </button>
        <span class="timeline__sep" role="presentation" aria-hidden="true">/</span>
        <button
          class="timeline__filter"
          class:timeline__filter--active={filter === "education"}
          role="tab"
          aria-selected={filter === "education"}
          tabindex={filter === "education" ? 0 : -1}
          onclick={() => (filter = "education")}
        >
          {#if filter === "education"}
            <span {@attach roughHighlight()}>Education</span>
          {:else}
            Education
          {/if}
        </button>
      </span>
    </h2>
    {#key filter}
      <div class="timeline__entries" role="tabpanel" aria-label="{filter === "work" ? "Experience" : "Education"} entries" bind:this={entriesEl}>
        {#each filteredExperiences as experience}
          <ExperienceEntry {experience} />
        {/each}
      </div>
    {/key}
  </div>
</section>

<style>
  .timeline {
    --bg: #1a1917;
    --bg-subtle: #242320;
    --bg-muted: #2e2d2a;
    --fg: #f0ede8;
    --fg-muted: #a8a29e;
    --fg-subtle: #8a8480;
    --border-color: rgba(240, 237, 232, 0.1);
    padding: var(--space-section) var(--space-md);
    background: var(--dark-bg);
    color: var(--fg);
    position: relative;
  }

  .timeline__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
  }

  .timeline__heading {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-xl);
  }

  .timeline__filters {
    display: inline;
  }

  .timeline__filter {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: rgba(240, 237, 232, 0.4);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .timeline__filter:hover {
    color: rgba(240, 237, 232, 0.6);
  }

  .timeline__filter--active {
    color: var(--dark-fg);
    cursor: default;
  }

  .timeline__filter:focus-visible {
    outline: 1px solid rgba(240, 237, 232, 0.4);
    outline-offset: 4px;
    border-radius: 2px;
  }

  .timeline__sep {
    color: rgba(240, 237, 232, 0.4);
    margin: 0 0.15em;
    user-select: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline__filter {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .timeline {
      --noise-opacity: 0.08;
    }
  }

</style>
