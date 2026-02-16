<script lang="ts">
  import ThemeSwitcher from "$components/theme-switcher.svelte";

  interface Props {
    backHref: string;
    backLabel?: string;
    theme: string;
    onthemechange: (theme: string) => void;
  }

  const { backHref, backLabel = "Return", theme, onthemechange }: Props = $props();
</script>

<div class="page-bar" data-pagefind-ignore>
  <div class="page-bar__inner">
    <a
      class="page-bar__back"
      href={backHref}
    >
      <span aria-hidden="true">&larr;</span>
      {backLabel}
    </a>
    <ThemeSwitcher {theme} onchange={onthemechange} />
  </div>
</div>

<style>
  .page-bar {
    margin: 0 calc(-1 * var(--space-md));
    padding: 1.25rem var(--space-md) 3rem;
    background: var(--bg-muted);
    position: relative;
  }

  .page-bar__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-bar__back {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    text-decoration: none;
    padding: 0.75rem 0;
    margin: -0.75rem 0;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .page-bar__back:hover {
    color: var(--fg);
  }

  .page-bar__back:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .page-bar__back {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .page-bar {
      padding-bottom: 2rem;
    }
  }
</style>
