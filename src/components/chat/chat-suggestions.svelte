<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";
  import { slide } from "svelte/transition";

  interface Props {
    suggestions: string[];
    onsend: (text: string) => void;
    variant?: "initial" | "followup";
  }

  const { suggestions, onsend, variant = "initial" }: Props = $props();

  let expanded = $state(false);
</script>

{#if variant === "followup"}
  <div class="suggestions suggestions--followup">
    <button
      class="suggestions__toggle"
      onclick={() => expanded = !expanded}
      aria-expanded={expanded}
    >
      <span class="suggestions__chevron" class:suggestions__chevron--open={expanded}>
        <ChevronDown size={12} strokeWidth={2} />
      </span>
      <span>Suggested questions</span>
    </button>
    {#if expanded}
      <div class="suggestions__list" transition:slide={{ duration: 200 }}>
        {#each suggestions as suggestion, i}
          <button
            class="suggestions__chip"
            style="animation-delay: {(i + 1) * 50}ms"
            onclick={() => onsend(suggestion)}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="suggestions">
    {#each suggestions as suggestion, i}
      <button
        class="suggestions__chip"
        style="animation-delay: {(i + 1) * 50}ms"
        onclick={() => onsend(suggestion)}
      >
        {suggestion}
      </button>
    {/each}
  </div>
{/if}

<style>
  .suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-left: calc(22px + 0.5rem);
    margin-bottom: 0.75rem;
  }

  .suggestions--followup {
    padding-left: calc(22px + 0.5rem);
    margin-top: -0.25rem;
  }

  .suggestions__toggle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-subtle);
    background: none;
    border: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .suggestions__toggle:hover {
    color: var(--fg-muted);
  }

  .suggestions__chevron {
    display: flex;
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .suggestions__chevron--open {
    transform: rotate(180deg);
  }

  .suggestions__list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-top: 0.25rem;
  }

  .suggestions__chip {
    align-self: flex-start;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 90%, var(--fg)) 0%,
      var(--bg-subtle) 100%
    );
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 0.375rem 0.75rem;
    text-align: left;
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--bg) 50%, #fff),
      0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent);
    animation: chip-in 250ms var(--ease-out) both;
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .suggestions__chip:hover {
    color: var(--fg);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
    transform: scale(1.02);
  }

  @keyframes chip-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .suggestions__chip {
      animation: none;
      transition: none;
    }

    .suggestions__chevron {
      transition: none;
    }
  }
</style>
