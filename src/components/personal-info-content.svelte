<script lang="ts">
  import SocialIcons from "$components/social-icons.svelte";

  const { minimal } = $props();
</script>

<div>
  <h1>Steele S.</h1>
  <p class={`${minimal ? "minimal" : ""}`}> Software Developer</p>
  <SocialIcons {minimal} />
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
