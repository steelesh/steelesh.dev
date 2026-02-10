import type { Action } from "svelte/action";

import Lenis from "lenis";

export const smoothScroll: Action<HTMLElement> = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return {};
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
  });

  let rafId: number;

  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    },
  };
};
