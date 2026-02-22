export function scrollProgress(sticky: HTMLElement) {
  const track = sticky.parentElement;
  if (!track)
    return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    sticky.style.setProperty("--progress", "1");
    return;
  }

  let ticking = false;
  let active = false;

  function update() {
    const trackRect = track!.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollable = track!.offsetHeight - viewH;
    if (scrollable <= 0) {
      sticky.style.setProperty("--progress", "1");
      return;
    }
    const progress = Math.min(1, Math.max(0, -trackRect.top / scrollable));
    sticky.style.setProperty("--progress", progress.toFixed(4));
    ticking = false;
  }

  function onScroll() {
    if (!active)
      return;
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active)
      update();
  }, { rootMargin: "100px" });
  io.observe(track);

  window.addEventListener("scroll", onScroll, { passive: true });
  update();

  return () => {
    window.removeEventListener("scroll", onScroll);
    io.disconnect();
  };
}
