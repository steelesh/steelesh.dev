<script lang="ts">
  import SocialIcons from "$components/social-icons.svelte";
  import { scrollReveal } from "$lib/actions/scroll-reveal";

  const user = "steeleshreve11";
  const domain = "gmail.com";
  const email = `${user}@${domain}`;
</script>

<section class="contact" id="contact" aria-labelledby="contact-heading">
  <div class="contact__inner">
    <span class="section-index" use:scrollReveal={{ y: 15 }}>[4]</span>
    <h2 class="contact__heading" id="contact-heading" use:scrollReveal={{ y: 20 }}>
      <em>Contact me.</em>
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
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.15),
      0 20px 60px rgba(0, 0, 0, 0.1);
  }

  .contact__inner {
    max-width: var(--max-width-text);
    margin: 0 auto;
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
</style>
