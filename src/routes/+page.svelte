<script lang="ts">
  import { browser } from "$app/environment";
  import Contact from "$components/contact.svelte";
  import ExperienceTimeline from "$components/experience-timeline.svelte";
  import Hero from "$components/hero.svelte";
  import Projects from "$components/projects.svelte";
  import Showcase from "$components/showcase.svelte";
  import * as config from "$lib/config";

  $effect(() => {
    if (!browser)
      return;
    document.documentElement.dataset.theme = "dark";
    return () => {
      const saved = localStorage.getItem("theme");
      document.documentElement.dataset.theme
        = saved === "light" || saved === "dark"
          ? saved
          : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };
  });

  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": config.title,
        "url": config.url,
        "description": config.description,
      },
      {
        "@type": "Person",
        "name": "Steele S.",
        "url": config.url,
        "jobTitle": "Backend Software Engineer",
        "sameAs": [
          "https://github.com/steelesh",
          "https://linkedin.com/in/steelesh",
        ],
      },
    ],
  })}<\/script>`;
</script>

<svelte:head>
  <title>{config.title}</title>
  <meta name="description" content={config.description} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={config.title} />
  <meta property="og:description" content={config.description} />
  <meta property="og:url" content={config.url} />
  <meta property="og:image" content={config.ogImageUrl({ title: config.title, subtitle: config.description })} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{config.title} — Software engineer" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={config.title} />
  <meta name="twitter:description" content={config.description} />
  <meta name="twitter:image" content={config.ogImageUrl({ title: config.title, subtitle: config.description })} />
  <link rel="canonical" href={config.url} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD structured data requires @html -->
  {@html jsonLd}
</svelte:head>

<Hero />
<ExperienceTimeline />
<Showcase />
<Projects />
<Contact />
