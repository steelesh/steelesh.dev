<script lang="ts">
  import ContentPage from "$components/content-page.svelte";

  const { data } = $props();
</script>

<ContentPage
  title="Colophon"
  subtitle="How this site is made"
  tags={[]}
  slug="colophon"
  standalone
  backHref="/"
  backLabel="Home"
  content={data.content}
/>
