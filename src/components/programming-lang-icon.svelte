<script lang="ts">
  import { programmingLanguages } from "$lib/data/programming-languages";

  const { language } = $props();
  const languageIcon = programmingLanguages.find(lang => lang.name === language);
</script>

<span class="icon">
  {#if languageIcon}
    <a href={languageIcon.link} rel="noreferrer" aria-label={languageIcon.name}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <span>{@html languageIcon.svg}</span>
      <span>{languageIcon.name}</span>
    </a>
  {:else}
    <span>Language not found</span>
  {/if}
</span>

<style>
  .icon {
    margin: 0.1rem;
    padding: 0.1rem 0.25rem;
    background-color: var(--bg-badge);
    border-radius: 0.375rem;
    cursor: pointer;
    backdrop-filter: blur(4px);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .icon:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
  }

  span {
    font-size: var(--fs-xs);
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    color: var(--fg);
  }

  a {
    text-decoration: none;
    color: inherit;

  }

  a span {
    user-select: none;
  }
</style>
