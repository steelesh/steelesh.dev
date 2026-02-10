import type { Action } from "svelte/action";

type ScrollRevealParams = {
  delay?: number;
  duration?: number;
  y?: number;
};

export const scrollReveal: Action<HTMLElement, ScrollRevealParams | undefined> = (node, params = {}) => {
  const { delay = 0, duration = 600, y = 20 } = params ?? {};

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return {};
  }

  const transIn = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
  const transOut = `opacity ${Math.round(duration * 0.5)}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${Math.round(duration * 0.5)}ms cubic-bezier(0.16, 1, 0.3, 1)`;

  node.style.opacity = "0";
  node.style.transform = `translateY(${y}px)`;
  node.style.willChange = "opacity, transform";

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.style.transition = transIn;
          node.style.opacity = "1";
          node.style.transform = "translateY(0)";
          node.addEventListener("transitionend", () => {
            node.style.willChange = "auto";
          }, { once: true });
        }
        else {
          node.style.willChange = "opacity, transform";
          node.style.transition = transOut;
          node.style.opacity = "0";
          node.style.transform = `translateY(${y}px)`;
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      observer.observe(node);
    });
  });

  return {
    destroy() {
      observer.disconnect();
    },
  };
};
