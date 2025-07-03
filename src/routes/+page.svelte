<script>
  import ProgrammingLangIcon from "$components/programming-lang-icon.svelte";
  import * as config from "$lib/config";
</script>

<svelte:head>
  <title>{config.title}</title>
  <meta name="description" content={config.description} />
</svelte:head>

<article>
  <p>A software developer. Based in the USA. Previous homebases include Cincinnati (OH) and Milwaukee (WI).</p>
  <p>Mainly focused on the web. Enjoys working with <ProgrammingLangIcon language="Go" /> and <ProgrammingLangIcon language="Svelte" />.</p>
  <h2>Experience</h2>
  <p>Currently a Frontend Developer Intern @ <a href="https://usemanifest.com/" rel="noopener noreferrer nofollow" target="_blank">Manifest</a>. Previously gained enterprise application development and UI/UX design experience through internships at <a href="https://www.milwaukeetool.com/" rel="noreferrer" aria-label="Milwaukee Tool">Milwaukee Tool</a> and <a href="https://183degrees.com/" rel="noreferrer" aria-label="183 Degrees">183 Degrees</a>.</p>
  <p>Received Bachelor of Information Technology at the University of Cincinnati (2025).</p>
  <h2>Connect</h2>
  <p>Reach me at <a href="mailto:steele@steelesh.dev" aria-label="Email me">steele@steelesh.dev</a></p>
</article>

<style>
  h2 {
    font-size: var(--fs-lg);
  }
  a {
    text-decoration: none;
    color: var(--fg);
    border-bottom: 1px solid var(--bg-muted);
    font-weight: 500;
    transition: border-color 0.2s ease-in-out;
  }
  a:hover {
    border-bottom: 1px solid var(--fg-muted);
  }
</style>
