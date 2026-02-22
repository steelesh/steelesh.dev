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
  category="case-study"
  publishedAt={data.meta.publishedAt}
  updatedAt={data.meta.updatedAt}
  readingTime={data.meta.readingTime}
  coverImage={data.meta.coverImage}
  coverImageAlt={data.meta.coverImageAlt}
  headerColor={data.meta.headerColor}
  headerTheme={data.meta.headerTheme}
  coverHeight={data.meta.coverHeight}
  devOnly={data.meta.devOnly}
  content={data.content}
/>
