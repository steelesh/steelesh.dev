<script lang="ts">
  import { ArrowUp } from "@lucide/svelte";
  import { getLenis } from "$lib/lenis";
  import { fly } from "svelte/transition";

  let visible = $state(false);
  let progress = $state(0);

  const SIZE = 40;
  const STROKE = 2;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  $effect(() => {
    function onScroll() {
      visible = window.scrollY > window.innerHeight * 0.5;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  });

  function scrollToTop() {
    const lenis = getLenis();
    if (lenis)
      lenis.scrollTo(0);
    else
      window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

{#if visible}
  <button
    class="back-to-top"
    onclick={scrollToTop}
    aria-label="Back to top"
    transition:fly={{ y: 8, duration: 400 }}
  >
    <svg
      class="back-to-top__ring"
      width={SIZE}
      height={SIZE}
      viewBox="0 0 {SIZE} {SIZE}"
      aria-hidden="true"
    >
      <circle
        class="back-to-top__track"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke-width={STROKE}
      />
      <circle
        class="back-to-top__progress"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke-width={STROKE}
        stroke-dasharray={CIRCUMFERENCE}
        stroke-dashoffset={CIRCUMFERENCE * (1 - progress)}
        stroke-linecap="round"
      />
    </svg>
    <span class="back-to-top__icon">
      <ArrowUp size={16} strokeWidth={2} />
    </span>
  </button>
{/if}

<style>
  .back-to-top {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 60;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }

  :global(html.chat-open) .back-to-top {
    opacity: 0;
    pointer-events: none;
  }

  .back-to-top__ring {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
  }

  .back-to-top__track {
    stroke: var(--border-color);
  }

  .back-to-top__progress {
    stroke: var(--accent);
    transition: stroke-dashoffset 100ms linear;
  }

  .back-to-top__icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-muted);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .back-to-top:hover .back-to-top__icon {
    color: var(--accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .back-to-top__progress,
    .back-to-top__icon {
      transition: none;
    }
  }

  @media (max-width: 480px) {
    .back-to-top {
      bottom: 1rem;
      left: 1rem;
    }
  }
</style>
