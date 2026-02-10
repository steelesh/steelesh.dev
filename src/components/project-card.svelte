<script lang="ts">
  import type { Project } from "$lib/types";

  import { ExternalLink } from "@lucide/svelte";
  import { scrollReveal } from "$lib/actions/scroll-reveal";
  import { techLinks } from "$lib/data/tech-links";

  type Props = {
    project: Project;
    index?: number;
  };

  const { project, index = 0 }: Props = $props();
</script>

<div class="card" use:scrollReveal={{ delay: index * 80, y: 15 }}>
  <h3 class="card__name">{project.name}</h3>
  <p class="card__description">{project.description}</p>
  <div class="card__tags">
    {#each project.tags as tag}
      {@const link = techLinks[tag]}
      {#if link}
        <a class="card__tag" href={link} target="_blank" rel="noopener noreferrer">
          {tag}
          <ExternalLink size={10} strokeWidth={2} />
        </a>
      {:else}
        <span class="card__tag">{tag}</span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .card {
    padding: var(--space-lg) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card:last-child {
    border-bottom: none;
  }

  .card__name {
    font-size: var(--fs-h2);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-snug);
    margin-bottom: 0.35rem;
    color: var(--dark-fg);
  }

  .card__description {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: rgba(255, 255, 255, 0.6);
    line-height: var(--leading-body);
    margin-bottom: var(--space-sm);
  }

  .card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .card__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.08);
    padding: 0.2rem 0.6rem;
    border-radius: 2px;
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  a.card__tag:hover {
    color: #ffffff;
  }

  .card__tag :global(svg) {
    opacity: 0;
    transform: translateX(-2px);
    transition:
      opacity 200ms ease,
      transform 200ms ease;
    flex-shrink: 0;
  }

  a.card__tag:hover :global(svg) {
    opacity: 1;
    transform: translateX(0);
  }
</style>
