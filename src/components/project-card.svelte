<script lang="ts">
  import type { Project } from "$lib/types";

  import { ExternalLink } from "@lucide/svelte";
  import { scrollReveal } from "$lib/actions/scroll-reveal";
  import { tagColors } from "$lib/data/tag-colors";
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
      {@const color = tagColors[tag]}
      {@const style = color ? `--tag-h: ${color.hue}; --tag-s: ${color.sat}%` : ""}
      {#if link}
        <a class="card__tag" {style} href={link} target="_blank" rel="noopener noreferrer">
          {tag}
          <ExternalLink size={10} strokeWidth={2} />
        </a>
      {:else}
        <span class="card__tag" {style}>{tag}</span>
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
    --tag-h: 0;
    --tag-s: 0%;
    display: inline-flex;
    align-items: center;
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: hsl(var(--tag-h) var(--tag-s) 75%);
    background: linear-gradient(
      135deg,
      hsla(var(--tag-h), var(--tag-s), 50%, 0.15) 0%,
      hsla(var(--tag-h), var(--tag-s), 40%, 0.08) 100%
    );
    border: 1px solid hsla(var(--tag-h), var(--tag-s), 60%, 0.18);
    box-shadow:
      inset 0 1px 0 hsla(var(--tag-h), var(--tag-s), 80%, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.15);
    padding: 0.2rem 0.6rem;
    border-radius: 100px;
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  a.card__tag:hover {
    color: hsl(var(--tag-h) var(--tag-s) 90%);
  }

  .card__tag :global(svg) {
    width: 0;
    opacity: 0;
    overflow: hidden;
    flex-shrink: 0;
    transition:
      width 200ms ease,
      margin-left 200ms ease,
      opacity 200ms ease;
  }

  a.card__tag:hover :global(svg) {
    width: 10px;
    margin-left: 0.3rem;
    opacity: 1;
  }
</style>
