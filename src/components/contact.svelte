<script lang="ts">
  import SocialIcons from "$components/social-icons.svelte";
  import { roughHighlight } from "$lib/actions/rough-highlight";
  import { scrollReveal } from "$lib/actions/scroll-reveal";

  const user = "steeleshreve11";
  const domain = "gmail.com";
  const email = `${user}@${domain}`;
</script>

<section class="contact" id="contact" aria-labelledby="contact-heading">
  <div class="contact__inner">
    <span class="section-index" use:scrollReveal={{ y: 15 }}>[4]</span>
    <h2 class="contact__heading" id="contact-heading" use:scrollReveal={{ y: 20 }}>
      <em><span use:roughHighlight={{ type: "highlight", color: "rgba(16, 185, 129, 0.12)", padding: 2 }}>Contact me.</span></em>
    </h2>
    <p class="contact__text" use:scrollReveal={{ delay: 100, y: 15 }}>
      My email is <a href="mailto:{email}">steeleshreve11 [at] gmail [dot] com</a>
    </p>
    <div class="contact__socials" use:scrollReveal={{ delay: 200, y: 15 }}>
      <SocialIcons />
    </div>
  </div>
</section>

<style>
  .contact {
    padding: var(--space-section) var(--space-md);
    padding-bottom: calc(var(--space-section) + 2rem);
    background: var(--bg);
    border-radius: 0 0 1.5rem 1.5rem;
    position: relative;
    z-index: 1;
    overflow: hidden;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.15),
      0 20px 60px rgba(0, 0, 0, 0.1);
  }

  .contact::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
    opacity: 0.7;
    pointer-events: none;
  }

  .contact__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
    position: relative;
  }

  .contact__heading {
    font-size: var(--fs-display);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-md);
  }

  .contact__heading em {
    font-style: italic;
  }

  .contact__text {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--fg-muted);
    line-height: var(--leading-body);
    max-width: 500px;
    margin-bottom: var(--space-lg);
  }

  .contact__text a {
    color: var(--fg);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .contact__text a:hover {
    color: var(--fg-muted);
  }

  @media (prefers-color-scheme: dark) {
    .contact {
      --bg: #faf8f5;
      --bg-subtle: #f0ede8;
      --bg-muted: #e8e4de;
      --fg: #333334;
      --fg-muted: #6b6560;
      --fg-subtle: #9b9590;
      --border-color: rgba(51, 51, 52, 0.12);
    }
  }
</style>
