<script lang="ts">
  import ProjectCard from "$components/project-card.svelte";
  import { roughHighlight } from "$lib/actions/rough-highlight";
  import { scrollReveal } from "$lib/actions/scroll-reveal";
  import { projects } from "$lib/data/projects";
</script>

<section class="projects" id="projects" aria-labelledby="projects-heading">
  <div class="projects__inner">
    <span class="section-index projects__index" use:scrollReveal={{ y: 15 }}>[3]</span>
    <h2 class="projects__heading" id="projects-heading" use:scrollReveal={{ y: 20 }}>
      <span use:roughHighlight>Side projects</span>
    </h2>
    <div class="projects__list">
      {#each projects as project, i}
        <ProjectCard {project} index={i} />
      {/each}
    </div>
  </div>
</section>

<style>
  .projects {
    padding: var(--space-section) var(--space-md);
    background: var(--dark-bg);
    color: var(--dark-fg);
  }

  .projects__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
  }

  .projects__heading {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-lg);
    color: #ffffff;
  }

  .projects__index {
    color: rgba(255, 255, 255, 0.4);
  }
</style>
