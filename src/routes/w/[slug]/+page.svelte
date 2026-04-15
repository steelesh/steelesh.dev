<script lang="ts">
  import ContentPage from "$components/content-page.svelte";

  const { data } = $props();
</script>

<ContentPage
  name={data.meta.name}
  title={data.meta.title}
  subtitle={data.meta.subtitle}
  tags={data.meta.tags}
  slug={data.meta.slug}
  publishedAt={data.meta.publishedAt}
  updatedAt={data.meta.updatedAt}
  minimal={data.meta.minimal}
  content={data.content}
/>
