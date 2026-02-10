<script lang="ts">
  import ExperienceEntry from "$components/experience-entry.svelte";
  import { roughHighlight } from "$lib/actions/rough-highlight";
  import { scrollReveal } from "$lib/actions/scroll-reveal";
  import { experiences } from "$lib/data/experience";
  import { onMount } from "svelte";

  let entriesEl: HTMLDivElement;

  onMount(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let ticking = false;
    let snapTimer: ReturnType<typeof setTimeout>;
    let isSnapping = false;
    let cycleComplete = false;
    let lastSeen = false;

    function update() {
      const entries
        = entriesEl.querySelectorAll<HTMLElement>("[data-entry]");
      const entryList = Array.from(entries);

      if (cycleComplete || reduced) {
        for (const entry of entryList) {
          entry.style.setProperty("--focus", "1");
          entry.style.setProperty("--passed", "1");
        }
        ticking = false;
        return;
      }

      const rect = entriesEl.getBoundingClientRect();
      if (lastSeen && rect.bottom < 0) {
        cycleComplete = true;
        for (const entry of entryList) {
          entry.style.setProperty("--focus", "1");
          entry.style.setProperty("--passed", "1");
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

      if (closestIdx === entryList.length - 1) {
        lastSeen = true;
      }

      for (let i = 0; i < entryList.length; i++) {
        const focus = i === closestIdx ? 1 : 0;
        const passed = i <= closestIdx ? 1 : 0;
        entryList[i].style.setProperty("--focus", String(focus));
        entryList[i].style.setProperty("--passed", String(passed));
      }

      ticking = false;
    }

    function snapToClosest() {
      if (cycleComplete)
        return;

      const entries
        = entriesEl.querySelectorAll<HTMLElement>("[data-entry]");
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
        const rect = closest.getBoundingClientRect();
        const entryCenter = rect.top + rect.height / 2;
        const offset = entryCenter - viewCenter;
        isSnapping = true;
        window.scrollBy({ top: offset, behavior: "smooth" });
        setTimeout(() => {
          isSnapping = false;
        }, 600);
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }

      if (!cycleComplete && !isSnapping && !reduced) {
        clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const rect = entriesEl.getBoundingClientRect();
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

      cycleComplete = false;
      lastSeen = false;

      const entries = entriesEl.querySelectorAll<HTMLElement>("[data-entry]");
      const entryList = Array.from(entries);
      const clickedIdx = entryList.indexOf(clickedEntry);

      for (let i = 0; i < entryList.length; i++) {
        const focus = i === clickedIdx ? 1 : 0;
        const passed = i <= clickedIdx ? 1 : 0;
        entryList[i].style.setProperty("--focus", String(focus));
        entryList[i].style.setProperty("--passed", String(passed));
      }

      const rect = clickedEntry.getBoundingClientRect();
      const entryCenter = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const offset = entryCenter - viewCenter;

      if (Math.abs(offset) > 20) {
        isSnapping = true;
        window.scrollBy({ top: offset, behavior: "smooth" });
        setTimeout(() => {
          isSnapping = false;
        }, 600);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    entriesEl.addEventListener("entryactivate", onEntryActivate);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      entriesEl.removeEventListener("entryactivate", onEntryActivate);
      clearTimeout(snapTimer);
    };
  });
</script>

<section class="timeline" id="experience" aria-labelledby="experience-heading">
  <div class="timeline__inner">
    <span class="section-index" use:scrollReveal={{ y: 15 }}>[2]</span>
    <h2 class="timeline__heading" id="experience-heading" use:scrollReveal={{ y: 20 }}>
      <span use:roughHighlight>Experience</span>
    </h2>
    <div class="timeline__entries" bind:this={entriesEl}>
      {#each experiences as experience}
        <ExperienceEntry {experience} />
      {/each}
    </div>
  </div>
</section>

<style>
  .timeline {
    padding: var(--space-section) var(--space-md);
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  .timeline::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
    opacity: 0.7;
    pointer-events: none;
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

  @media (prefers-color-scheme: dark) {
    .timeline {
      --bg: #faf8f5;
      --bg-subtle: #f0ede8;
      --bg-muted: #e8e4de;
      --fg: #333334;
      --fg-muted: #6b6560;
      --fg-subtle: #9b9590;
      --border-color: rgba(51, 51, 52, 0.12);
    }
  }
</style>
