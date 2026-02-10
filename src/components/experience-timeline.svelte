<script lang="ts">
  import ExperienceEntry from "$components/experience-entry.svelte";
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
        }
        ticking = false;
        return;
      }

      const rect = entriesEl.getBoundingClientRect();
      if (lastSeen && rect.bottom < 0) {
        cycleComplete = true;
        for (const entry of entryList) {
          entry.style.setProperty("--focus", "1");
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
        entryList[i].style.setProperty("--focus", String(focus));
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

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimer);
    };
  });
</script>

<section class="timeline" id="experience" aria-labelledby="experience-heading">
  <div class="timeline__inner">
    <span class="section-index" use:scrollReveal={{ y: 15 }}>[2]</span>
    <h2 class="timeline__heading" id="experience-heading" use:scrollReveal={{ y: 20 }}>
      Experience
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
</style>
