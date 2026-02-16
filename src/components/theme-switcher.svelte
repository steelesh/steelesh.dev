<script lang="ts">
  interface Props {
    theme: string;
    onchange: (theme: string) => void;
  }

  const { theme, onchange }: Props = $props();

  const themes = ["light", "dark"];
</script>

<div class="theme-switcher__track" role="radiogroup" aria-label="Color theme">
  <div class="theme-switcher__indicator" style="transform: translateX({themes.indexOf(theme) * 100}%)" aria-hidden="true"></div>
  {#each themes as t}
    <button
      class="theme-switcher__btn"
      class:theme-switcher__btn--active={theme === t}
      role="radio"
      aria-checked={theme === t}
      onclick={() => onchange(t)}
    >
      {t}
    </button>
  {/each}
</div>

<style>
  .theme-switcher__track {
    position: relative;
    display: inline-flex;
    background: color-mix(in srgb, var(--fg) 5%, var(--bg-subtle));
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 0.1875rem;
    box-shadow:
      inset 0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent),
      0 1px 0 color-mix(in srgb, var(--bg) 50%, transparent);
  }

  .theme-switcher__indicator {
    position: absolute;
    top: 0.1875rem;
    left: 0.1875rem;
    width: calc(50% - 0.1875rem);
    height: calc(100% - 0.375rem);
    border-radius: 0.375rem;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 90%, var(--fg)) 0%,
      var(--bg) 100%
    );
    border: 1px solid var(--border-color);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .theme-switcher__btn {
    position: relative;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
    background: none;
    border: none;
    padding: 0.25rem 0.75rem;
    transition: color var(--duration-fast) var(--ease-out);
    text-transform: capitalize;
  }

  .theme-switcher__btn:hover {
    color: var(--fg-muted);
  }

  .theme-switcher__btn--active {
    color: var(--fg);
  }

  .theme-switcher__btn:focus-visible {
    outline: 1px solid var(--fg-muted);
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-switcher__indicator,
    .theme-switcher__btn {
      transition: none;
    }
  }
</style>
