<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    caption?: string;
  }

  const { src, alt, caption }: Props = $props();
</script>

<figure class="study-image">
  <enhanced:img
    class="study-image__img"
    {src}
    {alt}
    loading="lazy"
  />
  {#if caption}
    <figcaption class="study-image__caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .study-image {
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  .study-image :global(img) {
    display: block;
    width: 100%;
    height: auto;
  }

  .study-image__caption {
    padding: 0.625rem 1rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-muted);
    letter-spacing: 0.02em;
    border-top: 1px solid var(--border-color);
    background: var(--bg-subtle);
  }
</style>
