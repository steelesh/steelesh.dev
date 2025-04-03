<script>
  import { goto } from "$app/navigation";

  const { text = "cd .." } = $props();
</script>

<button type="button" aria-label="Back" onclick={() => goto("/p")}>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
    <path fill="var(--fg-muted)" d="M17.71 16.29L9.42 8H15a1 1 0 0 0 0-2H7.05a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1H7a1 1 0 0 0 1-1V9.45l8.26 8.26a1 1 0 0 0 1.42 0a1 1 0 0 0 .03-1.42" />
  </svg>
  <span>{text}</span>
</button>

<style>
  button {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  span {
    font-size: var(--font-size-xs);
    color: var(--fg-muted);
  }
</style>
