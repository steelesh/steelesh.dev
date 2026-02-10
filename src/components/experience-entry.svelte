<script lang="ts">
  import type { Experience } from "$lib/types";

  import { ExternalLink } from "@lucide/svelte";
  import { techLinks } from "$lib/data/tech-links";

  type Props = {
    experience: Experience;
  };

  const { experience }: Props = $props();

  const isCurrent = $derived(experience.period.includes("Present"));
</script>

<div class="entry" data-entry>
  <div class="entry__date">
    <span class="entry__period">{experience.period}</span>
  </div>
  <div class="entry__line">
    <span class="entry__dot" class:entry__dot--current={isCurrent}></span>
  </div>
  <div class="entry__content">
    <h3 class="entry__title">{experience.title}</h3>
    <p class="entry__company" data-period="{experience.period} · ">
      <a class="entry__company-link" href={experience.companyUrl} target="_blank" rel="noopener noreferrer">
        {experience.company}
        <ExternalLink size={11} strokeWidth={2} />
      </a>
      {#if experience.location}
        <span class="entry__location">· {experience.location}</span>
      {/if}
    </p>
    <p class="entry__description">{experience.description}</p>
    {#if experience.tags?.length}
      <div class="entry__tags">
        {#each experience.tags as tag}
          {@const link = techLinks[tag]}
          {#if link}
            <a class="entry__tag" href={link} target="_blank" rel="noopener noreferrer">
              {tag}
              <ExternalLink size={10} strokeWidth={2} />
            </a>
          {:else}
            <span class="entry__tag">{tag}</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .entry {
    display: grid;
    grid-template-columns: 120px 24px 1fr;
    gap: 0 var(--space-sm);
  }

  .entry__date {
    text-align: right;
    padding-top: 0.3rem;
    opacity: calc(0.2 + var(--focus, 1) * 0.8);
    transition: opacity 150ms ease-out;
  }

  .entry__period {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-subtle);
    letter-spacing: var(--tracking-wide);
  }

  .entry__line {
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
  }

  .entry:last-child .entry__line::before {
    bottom: unset;
    height: 12px;
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
    transition: opacity 150ms ease-out;
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
    padding-bottom: clamp(3rem, 8vh, 5rem);
    opacity: calc(0.2 + var(--focus, 1) * 0.8);
    transform: scale(calc(0.9 + var(--focus, 1) * 0.1));
    transform-origin: left top;
    transition: opacity 150ms ease-out, transform 150ms ease-out;
  }

  .entry:last-child .entry__content {
    padding-bottom: 0;
  }

  .entry__title {
    font-size: var(--fs-h1);
    line-height: var(--leading-snug);
    margin-bottom: 0.25rem;
  }

  .entry__company {
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
    margin-bottom: 0.5rem;
  }

  .entry__company-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--fg-muted);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
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
    color: var(--fg-subtle);
  }

  .entry__description {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg-muted);
    line-height: var(--leading-body);
  }

  .entry__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-top: 0.6rem;
  }

  .entry__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-subtle);
    background: var(--bg-subtle);
    padding: 0.2rem 0.6rem;
    border-radius: 2px;
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  a.entry__tag:hover {
    color: var(--fg);
  }

  .entry__tag :global(svg) {
    opacity: 0;
    transform: translateX(-2px);
    transition:
      opacity 200ms ease,
      transform 200ms ease;
    flex-shrink: 0;
  }

  a.entry__tag:hover :global(svg) {
    opacity: 1;
    transform: translateX(0);
  }

  @media (max-width: 640px) {
    .entry {
      grid-template-columns: 16px 1fr;
    }

    .entry__date {
      display: none;
    }

    .entry__line {
      grid-column: 1;
    }

    .entry__content {
      grid-column: 2;
    }

    .entry__company::before {
      content: attr(data-period);
    }
  }
</style>
