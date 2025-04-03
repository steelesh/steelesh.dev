<script>
  import BackButton from "$components/back-button.svelte";

  export let data;
</script>

<pre>
  {JSON.stringify(data, null, 2)}
</pre>

<BackButton />
<article>
</article>
