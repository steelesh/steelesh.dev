<script lang="ts">
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status} — steelesh.dev</title>
</svelte:head>

<div class="error-page">
  <div class="error-page__inner">
    <span class="error-page__code">{page.status}</span>
    <h1 class="error-page__title">
      {page.status === 404 ? "Page not found" : "Something went wrong"}
    </h1>
    <p class="error-page__message">
      {page.error?.message || "An unexpected error occurred."}
    </p>
    <a class="error-page__link" href="/">
      <span aria-hidden="true">&larr;</span>
      Back to home
    </a>
  </div>
</div>

<style>
  .error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
    padding: var(--space-md);
    background: var(--bg);
  }

  .error-page__inner {
    text-align: center;
    max-width: 420px;
  }

  .error-page__code {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fs-hero);
    font-weight: 400;
    color: var(--fg-muted);
    line-height: 1;
    margin-bottom: var(--space-sm);
  }

  .error-page__title {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-sm);
  }

  .error-page__message {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg-muted);
    line-height: var(--leading-body);
    margin-bottom: var(--space-lg);
  }

  .error-page__link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .error-page__link:hover {
    color: var(--fg);
  }

  @media (prefers-reduced-motion: reduce) {
    .error-page__link {
      transition: none;
    }
  }
</style>
