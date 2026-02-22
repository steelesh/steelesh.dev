<script lang="ts">
  import "$styles/reset.css";
  import "$styles/global.css";
  import "$styles/fonts.css";
  import "$styles/print.css";
  import { afterNavigate } from "$app/navigation";
  import BackToTop from "$components/back-to-top.svelte";
  import ChatWidget from "$components/chat/chat-widget.svelte";
  import CustomCursor from "$components/custom-cursor.svelte";
  import Footer from "$components/footer.svelte";
  import ScrollIndicator from "$components/scroll-indicator.svelte";
  import SearchModal from "$components/search-modal.svelte";
  import { scrollAnimate } from "$lib/actions/scroll-animate";
  import { smoothScroll } from "$lib/actions/smooth-scroll";
  import { getLenis } from "$lib/lenis";

  const { children } = $props();

  let searchOpen = $state(false);

  afterNavigate(({ to }) => {
    const hash = to?.url.hash;
    const lenis = getLenis();
    if (!lenis) {
      if (hash) {
        document.querySelector<HTMLElement>(hash)?.scrollIntoView();
      }
      else {
        window.scrollTo(0, 0);
      }
    }
    else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis.resize();
          if (hash) {
            const el = document.querySelector<HTMLElement>(hash);
            if (el) {
              lenis.scrollTo(el, { immediate: true, force: true });
            }
            else {
              lenis.scrollTo(0, { immediate: true, force: true });
            }
          }
          else {
            lenis.scrollTo(0, { immediate: true, force: true });
          }
        });
      });
    }

    if (!hash) {
      const main = document.getElementById("main-content");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }
  });

  $effect(() => {
    function handler() {
      searchOpen = true;
    }
    window.addEventListener("opensearch", handler);
    return () => window.removeEventListener("opensearch", handler);
  });
</script>

<svelte:window onkeydown={(e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchOpen = true;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "j") {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("openchat"));
  }
}} />

<a href="#main-content" class="skip-link">Skip to content</a>
<ScrollIndicator />
<BackToTop />
<div {@attach smoothScroll} {@attach scrollAnimate}>
  <main id="main-content">
    <!-- eslint-disable-next-line no-console -- error boundary logging -->
    <svelte:boundary onerror={e => console.error("[page]", e)}>
      {@render children()}
      {#snippet failed(_error, reset)}
        <div class="error-fallback">
          <p>Something went wrong loading this page.</p>
          <button onclick={reset}>Retry</button>
        </div>
      {/snippet}
    </svelte:boundary>
  </main>
  <Footer />
</div>
<ChatWidget />
<SearchModal open={searchOpen} onclose={() => { searchOpen = false; }} />
<CustomCursor />

<style>
  .skip-link {
    position: absolute;
    top: -100%;
    left: var(--space-md);
    padding: var(--space-xs) var(--space-sm);
    background: var(--fg);
    color: var(--bg);
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    text-decoration: none;
    z-index: 100;
    border-radius: 2px;
  }

  .skip-link:focus-visible {
    top: var(--space-sm);
  }

  main {
    flex: 1;
    background: var(--footer-bg);
  }
</style>
