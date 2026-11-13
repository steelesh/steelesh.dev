<script lang="ts">
  import ContentPage from "#components/content-page.svelte";

  const { data } = $props();
</script>

<ContentPage
  title="Accessibility Statement"
  subtitle="Accessibility on this site and how to report a problem."
  tags={[]}
  slug="accessibility"
  standalone
  backLabel="Home"
  content={data.content}
/>
