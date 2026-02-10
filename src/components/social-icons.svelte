<script lang="ts">
  import { Github } from "@lucide/svelte";
</script>

<div class="socials">
  <a href="https://github.com/steelesh" aria-label="GitHub profile" target="_blank" rel="noopener noreferrer">
    <Github size={24} strokeWidth={1.5} />
  </a>
</div>

<style>
  .socials {
    display: flex;
    gap: var(--space-sm);
  }

  a {
    color: var(--fg-muted);
    transition: color var(--duration-fast) var(--ease-out);
    text-decoration: none;
  }

  a:hover {
    color: var(--fg);
  }
</style>
