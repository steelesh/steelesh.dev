<script lang="ts">
  import { page } from "$app/state";
  import { tick } from "svelte";
  import { spring } from "svelte/motion";

  const contentRoutes = ["/projects", "/case-studies", "/posts", "/tags"];
  const isContentPage = $derived(contentRoutes.some(r => page.url.pathname.startsWith(r)));

  let enabled = $state(false);
  let visible = $state(false);
  let isHovering = $state(false);
  let isDown = $state(false);

  let x = $state(0);
  let y = $state(0);

  const ringPos = spring(
    { x: 0, y: 0 },
    { stiffness: 0.15, damping: 0.7 },
  );

  $effect(() => {
    if (isContentPage) {
      enabled = false;
      document.documentElement.classList.remove("custom-cursor");
      return;
    }

    const prefersCoarse = window.matchMedia("(pointer: coarse)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersCoarse)
      return;

    if (prefersReduced)
      ringPos.stiffness = 1;

    function isInteractive(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement))
        return false;
      const target = el.closest("a, button, [role='button'], [data-cursor='hover'], input, textarea, select, label[for]");
      return target !== null;
    }

    async function activate(ex: number, ey: number) {
      x = ex;
      y = ey;
      ringPos.set({ x: ex, y: ey }, { hard: true });
      enabled = true;
      visible = true;
      await tick();
      document.documentElement.classList.add("custom-cursor");
    }

    function onMouseMove(e: MouseEvent) {
      if (!enabled) {
        activate(e.clientX, e.clientY);
        return;
      }
      x = e.clientX;
      y = e.clientY;
      ringPos.set({ x: e.clientX, y: e.clientY });
      if (!visible)
        visible = true;
    }

    function onMouseOver(e: MouseEvent) {
      isHovering = isInteractive(e.target);
    }

    function onMouseDown() {
      isDown = true;
    }

    function onMouseUp() {
      isDown = false;
    }

    function onMouseLeave() {
      visible = false;
    }

    function onMouseEnter() {
      visible = true;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    return () => {
      enabled = false;
      document.documentElement.classList.remove("custom-cursor");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
    };
  });
</script>

{#if enabled}
  <div
    class="cursor-dot"
    class:cursor-dot--hover={isHovering}
    class:cursor-dot--down={isDown}
    class:cursor-dot--hidden={!visible}
    style="transform: translate(-50%, -50%) translate({x}px, {y}px){isHovering ? " scale(0.5)" : ""}{isDown ? " scale(0.8)" : ""}"
    aria-hidden="true"
  ></div>
  <div
    class="cursor-ring"
    class:cursor-ring--hover={isHovering}
    class:cursor-ring--down={isDown}
    class:cursor-ring--hidden={!visible}
    style="transform: translate(-50%, -50%) translate({$ringPos.x}px, {$ringPos.y}px){isHovering ? " scale(1.5)" : ""}{isDown ? " scale(0.8)" : ""}"
    aria-hidden="true"
  ></div>
{/if}

<style>
  :global(html.custom-cursor),
  :global(html.custom-cursor *) {
    cursor: none !important;
  }

  .cursor-dot {
    position: fixed;
    top: 0;
    left: 0;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: difference;
    will-change: transform;
  }

  .cursor-ring {
    position: fixed;
    top: 0;
    left: 0;
    width: 36px;
    height: 36px;
    border: 1.5px solid #fff;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    mix-blend-mode: difference;
    will-change: transform;
  }

  .cursor-dot--hidden,
  .cursor-ring--hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor-ring {
      display: none;
    }
  }
</style>
