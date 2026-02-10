<script lang="ts">
  import "$styles/reset.css";
  import "$styles/global.css";
  import "$styles/fonts.css";
  import Footer from "$components/footer.svelte";
  import ScrollIndicator from "$components/scroll-indicator.svelte";
  import { smoothScroll } from "$lib/actions/smooth-scroll";

  const { children } = $props();
</script>

<a href="#experience" class="skip-link">Skip to content</a>
<ScrollIndicator />
<div use:smoothScroll>
  <main>
    {@render children()}
  </main>
  <Footer />
</div>

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

  .skip-link:focus {
    top: var(--space-sm);
  }

  main {
    flex: 1;
    background: var(--footer-bg);
  }
</style>
