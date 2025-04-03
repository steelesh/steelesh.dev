<script>
  import { formatDate } from "$lib/utils";

  export let data;
</script>

<article>
  {#if data.posts.length > 0}
    <h2>More content</h2>
    <ul>
      {#each data.posts as post}
        <li>
          <a href={`p/${post.slug}`}>{post.title}</a>
          <p>{formatDate(post.date)}</p>
          <p>{post.description}</p>
        </li>
      {/each}
    </ul>
  {:else}
    <p>Nothing here yet.</p>
  {/if}
</article>
