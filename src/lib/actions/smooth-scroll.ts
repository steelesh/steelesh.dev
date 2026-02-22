import type Lenis from "lenis";

import { setLenis } from "$lib/lenis";

export function smoothScroll(_node: HTMLElement) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion)
    return;

  history.scrollRestoration = "manual";
  let lenis: Lenis | null = null;
  let destroyed = false;
  let idleHandle: number | ReturnType<typeof setTimeout> | undefined;

  function init() {
    import("lenis").then(({ default: Lenis }) => {
      if (destroyed)
        return;
      lenis = new Lenis({
        autoRaf: true,
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
      });
      setLenis(lenis);
    });
  }

  if ("requestIdleCallback" in window) {
    idleHandle = requestIdleCallback(init, { timeout: 2000 });
  }
  else {
    idleHandle = setTimeout(init, 100);
  }

  return () => {
    destroyed = true;
    if (idleHandle !== undefined) {
      if ("cancelIdleCallback" in window) {
        cancelIdleCallback(idleHandle as number);
      }
      else {
        clearTimeout(idleHandle as ReturnType<typeof setTimeout>);
      }
    }
    if (lenis) {
      lenis.destroy();
      setLenis(null);
    }
  };
}
