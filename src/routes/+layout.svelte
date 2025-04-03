<script lang="ts">
  import { page } from "$app/state";
  import Footer from "$components/footer.svelte";
  import Header from "$components/header.svelte";
  import "$styles/reset.css";
  import "$styles/global.css";
  import "$styles/fonts.css";
  import Nav from "$components/nav.svelte";

  const { children } = $props();

  const showFullHeader = $derived(!page.url.pathname.startsWith("/p/"));
</script>

{#if showFullHeader}
  <Header />
  <Nav />
{:else}
  <Header minimal />
{/if}
<main>
  <div class="container">
    {@render children()}
  </div>
</main>
<Footer />

<style>
  main {
    flex: 1;
  }
</style>
