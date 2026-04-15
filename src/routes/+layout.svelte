<script lang="ts">
  import "$styles/reset.css";
  import "$styles/global.css";
  import "$styles/fonts.css";
  import "$styles/print.css";
  import Footer from "$components/footer.svelte";

  const { children } = $props();
</script>

<a href="#main-content" class="skip-link">Skip to content</a>
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
    background: var(--bg);
  }
</style>
