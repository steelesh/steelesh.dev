<script lang="ts">
  import Contact from "$components/contact.svelte";
  import ExperienceTimeline from "$components/experience-timeline.svelte";
  import Hero from "$components/hero.svelte";
  import Projects from "$components/projects.svelte";
  import * as config from "$lib/config";
</script>

<svelte:head>
  <title>{config.title}</title>
  <meta name="description" content={config.description} />
</svelte:head>

<Hero />
<ExperienceTimeline />
<Projects />
<Contact />
