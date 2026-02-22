<script lang="ts">
  import type { Experience } from "$lib/types";

  import { ExternalLink } from "@lucide/svelte";

  interface Props {
    experience: Experience;
    interactive?: boolean;
  }

  const { experience, interactive = true }: Props = $props();

  const isCurrent = $derived(experience.period.includes("Present"));

  function activateEntry(node: EventTarget | null) {
    (node as HTMLElement)?.closest("[data-entry]")?.dispatchEvent(
      new CustomEvent("entryactivate", { bubbles: true }),
    );
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="entry"
  class:entry--interactive={interactive}
  data-entry
  onclick={interactive
    ? (e) => {
      if (!(e.target as HTMLElement).closest("a, button"))
        activateEntry(e.currentTarget);
    }
    : undefined}
>
  <div class="entry__line">
    <span class="entry__dot" class:entry__dot--current={isCurrent}></span>
  </div>
  <span class="entry__period">{#if isCurrent}{experience.period.replace(" Present", "")} <strong class="entry__present">Present</strong>{:else}{experience.period}{/if}</span>
  <div class="entry__content">
    <h3 class="entry__title">
      {#if interactive}
        <button class="entry__activate" type="button" onclick={e => activateEntry(e.currentTarget)}>
          {experience.title}
        </button>
      {:else}
        {experience.title}
      {/if}
    </h3>
    <p class="entry__company">
      <a class="entry__company-link" href={experience.companyUrl} target="_blank" rel="noopener noreferrer">
        {experience.company}
        <ExternalLink size={11} strokeWidth={2} />
      </a>
      {#if experience.location}
        <span class="entry__location">· {experience.location}</span>
      {/if}
    </p>
    <p class="entry__description">{experience.description}</p>
  </div>
</div>

<style>
  .entry {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: 0 var(--space-sm);
    position: relative;
  }

  .entry--interactive {
    cursor: pointer;
  }

  .entry__period {
    grid-column: 2;
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  @media (min-width: 1100px) {
    .entry__period {
      position: absolute;
      right: calc(100% + 2.5rem);
      top: -1.1rem;
      margin-bottom: 0;
      white-space: nowrap;
      text-align: right;
    }
  }

  .entry__line {
    grid-column: 1;
    grid-row: 1 / -1;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .entry__line::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--border-color);
    opacity: calc(0.4 + var(--passed, 0) * 0.6);
    transition: opacity 400ms var(--ease-out);
  }

  .entry:last-child .entry__line::before {
    bottom: unset;
    height: 12px;
  }

  .entry:only-child .entry__line::before {
    display: none;
  }

  .entry__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--fg-muted);
    margin-top: 0.45rem;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    opacity: calc(0.25 + var(--focus, 1) * 0.75);
    transform: scale(calc(1 + var(--passed, 0) * 0.25));
    transition:
      opacity 150ms ease-out,
      transform 400ms var(--ease-out);
  }

  .entry__dot--current {
    background: var(--current);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    animation: pulse-dot 2.5s ease-in-out infinite;
    opacity: 1;
  }

  @keyframes pulse-dot {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
  }

  .entry__content {
    grid-column: 2;
    padding-bottom: clamp(3rem, 8vh, 5rem);
    opacity: calc(0.2 + var(--focus, 1) * 0.8);
    transform: scale(calc(0.9 + var(--focus, 1) * 0.1));
    transform-origin: left top;
    transition: opacity 150ms ease-out, transform 150ms ease-out;
  }

  .entry:last-child .entry__content {
    padding-bottom: 0;
  }

  .entry__present {
    font-weight: 600;
  }

  .entry__title {
    font-size: var(--fs-h1);
    line-height: var(--leading-snug);
    margin-bottom: 0.25rem;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .entry__activate {
    all: unset;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .entry__activate:focus-visible {
    outline: 2px solid var(--fg-muted);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .entry__company {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    margin-bottom: 0.75rem;
  }

  .entry__company-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--fg-muted);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    padding: 0.5rem 0;
    margin: -0.5rem 0;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .entry__company-link:hover {
    color: var(--fg);
  }

  .entry__company-link :global(svg) {
    opacity: 0.5;
    flex-shrink: 0;
    transition: opacity 200ms ease;
  }

  .entry__company-link:hover :global(svg) {
    opacity: 1;
  }

  .entry__location {
    color: var(--fg-muted);
  }

  .entry__description {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg);
    line-height: var(--leading-body);
    white-space: pre-line;
  }

  @media (prefers-reduced-motion: reduce) {
    .entry__line::before,
    .entry__dot,
    .entry__content,
    .entry__title,
    .entry__company-link,
    .entry__company-link :global(svg) {
      transition: none;
    }

    .entry__dot--current {
      animation: none;
    }
  }

  @media (max-width: 768px) {
    .entry {
      grid-template-columns: 16px 1fr;
    }

    .entry__line {
      grid-column: 1;
    }

    .entry__line {
      grid-row: 1 / span 3;
    }

    .entry__content {
      grid-column: 2;
    }
  }
</style>
