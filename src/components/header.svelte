<script lang="ts">
  import Avatar from "$components/avatar.svelte";
  import Logo from "$components/logo.svelte";
  import PersonalInfoContent from "$components/personal-info-content.svelte";

  const { minimal = false } = $props();
</script>

<header>
  <div class={`container ${minimal ? "minimal" : ""}`}>
    {#if minimal}
      <Logo />
    {:else}
      <Avatar />
    {/if}
    <PersonalInfoContent {minimal} />
  </div>
</header>

<style>
  header {
    margin-top: 6rem;
  }
  .container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .container.minimal {
    gap: 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }
  @media (max-width: 1200px) {
    header {
      margin-top: 4rem;
    }
  }
  @media (max-width: 768px) {
    header {
      margin-top: 3rem;
    }
  }
  @media (max-width: 480px) {
    header {
      margin-top: 2rem;
    }
  }
</style>
