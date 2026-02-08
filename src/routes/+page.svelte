<script>
  import * as config from "$lib/config";
</script>

<svelte:head>
  <title>{config.title}</title>
  <meta name="description" content={config.description} />
</svelte:head>

<article>
  <p>Currently a Software Engineer @ <a href="https://usemanifest.com/" rel="noopener noreferrer nofollow" target="_blank">Manifest</a>. Based in Chicago, IL.</p>
  <p>Mainly focused on the web. Enjoys working with Java and TypeScript.</p>
  <h2>Experience</h2>
  <p>Gained web development and product design experience through internships at <a href="https://www.milwaukeetool.com/" rel="noreferrer" aria-label="Milwaukee Tool">Milwaukee Tool</a> and <a href="https://183degrees.com/" rel="noreferrer" aria-label="183 Degrees">183 Degrees</a>.</p>
  <p>Received Bachelor of Information Technology at the University of Cincinnati (2025).</p>
  <h2>Connect</h2>
  <p>Reach me at <a href="mailto:steeleshreve11@gmail.com" aria-label="Email me">steeleshreve11@gmail.com</a></p>
</article>

<style>
  h2 {
    font-size: var(--fs-lg);
  }
  a {
    color: #2563eb;
  }
  a:visited {
    color: #2563eb;
  }
  @media (prefers-color-scheme: dark) {
    a,
    a:visited {
      color: #60a5fa;
    }
  }
</style>
