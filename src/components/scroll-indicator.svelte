<script lang="ts">
  import { onMount } from "svelte";

  const sections = ["hero", "experience", "projects", "contact"];
  const labels = ["Introduction", "Experience", "Projects", "Contact"];
  let activeIndex = $state(0);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id || "hero";
            const idx = sections.indexOf(id);
            if (idx !== -1)
              activeIndex = idx;
          }
        }
      },
      { threshold: 0.3 },
    );

    for (const id of sections) {
      const el
        = id === "hero"
          ? document.querySelector("section[aria-label='Introduction']")
          : document.getElementById(id);
      if (el) {
        if (id === "hero")
          el.id = "hero";
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  });
</script>

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

<style>
  .indicator {
    position: fixed;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    z-index: 50;
  }

  .indicator__dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--fg-subtle);
    opacity: 0.3;
    border: none;
    padding: 0;
    cursor: pointer;
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .indicator__dot:hover {
    opacity: 0.7;
  }

  .indicator__dot--active {
    opacity: 1;
    transform: scale(1.5);
  }

  @media (max-width: 768px) {
    .indicator {
      display: none;
    }
  }
</style>
