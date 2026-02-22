export function scrollAnimate(node: HTMLElement) {
  if (typeof IntersectionObserver === "undefined")
    return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -5% 0px" },
  );

  function observe() {
    const vh = window.innerHeight;
    for (const el of node.querySelectorAll<HTMLElement>("[data-animate]:not(.in-view)")) {
      const { top, bottom } = el.getBoundingClientRect();
      if (top < vh && bottom > 0)
        el.classList.add("in-view");
      else
        observer.observe(el);
    }
  }

  const mutation = new MutationObserver(observe);
  mutation.observe(node, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-animate"],
  });
  observe();

  return () => {
    observer.disconnect();
    mutation.disconnect();
  };
}

export function animateChildren(node: HTMLElement) {
  for (const child of node.children) {
    const el = child as HTMLElement;
    el.setAttribute("data-animate", "");
    el.style.setProperty("--y", "12px");
  }
}
