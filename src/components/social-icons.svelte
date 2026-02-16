<script lang="ts">
  import { Github, Linkedin } from "@lucide/svelte";
</script>

{#snippet xIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="currentColor" aria-hidden="true">
    <path d="M13.808 10.469 20.88 2h-1.676l-6.142 7.353L8.158 2H2l7.418 11.12L2 22h1.676l6.486-7.765L15.842 22H22l-8.192-11.531Zm-2.296 2.748-.752-1.107L4.78 3.3h2.575l4.826 7.11.751 1.107 6.273 9.242h-2.574l-5.118-7.541Z" />
  </svg>
{/snippet}

<div class="socials">
  <a href="https://github.com/steelesh" aria-label="GitHub profile" target="_blank" rel="noopener noreferrer">
    <Github size={24} strokeWidth={1.5} />
  </a>
  <a href="https://linkedin.com/in/steelesh" aria-label="LinkedIn profile" target="_blank" rel="noopener noreferrer">
    <Linkedin size={24} strokeWidth={1.5} />
  </a>
  <a href="https://x.com/steeleshdotdev" aria-label="X profile" target="_blank" rel="noopener noreferrer">
    {@render xIcon()}
  </a>
</div>

<style>
  .socials {
    display: flex;
    gap: var(--space-sm);
  }

  a {
    color: var(--fg-muted);
    transition:
      color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
    text-decoration: none;
  }

  a:hover {
    color: var(--fg);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>
