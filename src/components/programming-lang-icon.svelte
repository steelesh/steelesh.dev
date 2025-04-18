<script lang="ts">
  import { programmingLanguages } from "$lib/data/programming-languages";

  const { language } = $props();
  const languageIcon = programmingLanguages.find(lang => lang.name === language);

  let isDarkMode = false;

  if (typeof window !== "undefined") {
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      isDarkMode = event.matches;
    });
  }

  function getBackgroundColor(langName: string) {
    const colorMap = {
      Go: isDarkMode ? "#00526A" : "#E6F5FF",
      Python: isDarkMode ? "#306998" : "#F0F3F9",
      Svelte: isDarkMode ? "#4A2D2B" : "#FFF1F0",
      Java: isDarkMode ? "#1E3A5F" : "#F5F6FA",
      CSharp: isDarkMode ? "#3E2E42" : "#F3E5F5",
      TypeScript: isDarkMode ? "#1A365D" : "#EFF6FC",
    };

    return colorMap[langName as keyof typeof colorMap];
  }

  function getTextColor(langName: string) {
    const colorMap = {
      Go: isDarkMode ? "#FFFFFF" : "#00ADD8",
      Python: isDarkMode ? "#FFD43B" : "#3776AB",
      Svelte: isDarkMode ? "#FF3E00" : "#FF3E00",
      Java: isDarkMode ? "#EA2D2E" : "#007396",
      CSharp: isDarkMode ? "#FFFFFF" : "#9B4F96",
      TypeScript: isDarkMode ? "#007ACC" : "#007ACC",
    };

    return colorMap[langName as keyof typeof colorMap];
  }
</script>

{#if languageIcon}
  <span
    class="icon"
    style="
      background-color: {getBackgroundColor(languageIcon.name)};
        color: {getTextColor(languageIcon.name)};
    "
  >
    <a href={languageIcon.link} rel="noreferrer" aria-label={languageIcon.name}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <span>{@html languageIcon.svg}</span>
      <span>{languageIcon.name}</span>
    </a>
  </span>
{:else}
  <span>Language not found</span>
{/if}

<style>
  .icon {
    margin: 0.1rem;
    padding: 0.1rem 0.25rem;
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
  }

  a {
    text-decoration: none;
    color: inherit;

  }

  a span {
    user-select: none;
  }
</style>
