<script lang="ts">
  const { minimal } = $props();
</script>

<div>
  <h1>Steele S.</h1>
  <p class={`${minimal ? "minimal" : ""}`}>builds things</p>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
  }
  h1 {
    font-size: var(--fs-lg);
    margin-bottom: var(--spacing-xs);
  }
  p {
    color: var(--fg-muted);
    font-size: var(--fs-sm);
    margin-bottom: var(--spacing-xs);
  }
  p.minimal {
    margin-bottom: 0;
  }
</style>
