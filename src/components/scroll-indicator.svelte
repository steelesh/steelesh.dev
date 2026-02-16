<script lang="ts">
  import { page } from "$app/state";
  import { getLenis } from "$lib/lenis";

  const sections = ["hero", "experience", "work", "contact"];
  const labels = ["Introduction", "Experience", "Projects", "Contact"];
  let activeIndex = $state(0);
  const isHome = $derived(page.url.pathname === "/");

  function scrollTo(id: string) {
    const lenis = getLenis();
    if (lenis)
      lenis.scrollTo(`#${id}`);
    else
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  $effect(() => {
    if (!isHome)
      return;

    const elements: (HTMLElement | null)[] = sections.map((id) => {
      if (id === "hero") {
        const el = document.querySelector<HTMLElement>("section[aria-label='Introduction']");
        if (el && !el.id)
          el.id = "hero";
        return el;
      }
      return document.getElementById(id);
    });

    function updateActive() {
      const threshold = window.innerHeight * 0.4;
      let current = 0;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!el)
          continue;
        if (el.getBoundingClientRect().top <= threshold) {
          current = i;
        }
      }
      activeIndex = current;
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();

    return () => {
      window.removeEventListener("scroll", updateActive);
    };
  });
</script>

{#if isHome}
  <nav class="indicator" aria-label="Page sections">
    {#each sections as section, i}
      <button
        class="indicator__dot"
        class:indicator__dot--active={i === activeIndex}
        onclick={() => scrollTo(section)}
        aria-label={labels[i]}
      ></button>
    {/each}
  </nav>
{/if}

<style>
  .indicator {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 50;
  }

  .indicator__dot {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .indicator__dot::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 8px;
    width: 12px;
    height: 1.5px;
    border-radius: 1px;
    background: var(--fg-subtle);
    opacity: 0.3;
    transform: translateY(-50%);
    transition:
      width var(--duration-fast) var(--ease-out),
      opacity var(--duration-fast) var(--ease-out);
  }

  .indicator__dot:hover::after {
    opacity: 0.7;
  }

  .indicator__dot--active::after {
    width: 24px;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .indicator__dot::after {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .indicator {
      display: none;
    }
  }
</style>
