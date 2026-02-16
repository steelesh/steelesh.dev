<script lang="ts">
  import ContentPage from "$components/content-page.svelte";

  const { data } = $props();
</script>

<ContentPage
  title="Accessibility Statement"
  subtitle="Last updated February 2026"
  tags={[]}
  slug="accessibility"
  standalone
  backHref="/"
  backLabel="Home"
  content={data.content}
/>
