import type { RoughAnnotationConfig } from "rough-notation/lib/model";

import { annotate } from "rough-notation";

type HighlightOptions = {
  type?: RoughAnnotationConfig["type"];
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
};

export function roughHighlight(
  node: HTMLElement,
  options: HighlightOptions = {},
) {
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const {
    type = "underline",
    color = isDark
      ? "rgba(168, 162, 158, 0.35)"
      : "rgba(155, 149, 144, 0.4)",
    strokeWidth = 1.5,
    animationDuration = reduced ? 0 : 800,
    iterations = 1,
    padding = -8,
    multiline = true,
  } = options;

  const annotation = annotate(node, {
    type,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          annotation.show();
          observer.disconnect();
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
      annotation.remove();
    },
  };
}
