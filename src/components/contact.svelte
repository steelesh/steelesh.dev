<script lang="ts">
  import { roughHighlight } from "$lib/actions/rough-highlight";

  const user = "steele";
  const domain = "steelesh.dev";
  const email = `${user}@${domain}`;
</script>

<section class="contact inverted-theme" id="contact" aria-labelledby="contact-heading">
  <div class="contact__inner">
    <span class="section-index" data-animate style="--y: 15px">[5]</span>
    <h2 class="contact__heading" id="contact-heading" data-animate>
      <em><span {@attach roughHighlight({ type: "highlight", color: "rgba(16, 185, 129, 0.12)", padding: 2 })}>Get in touch.</span></em>
    </h2>
    <p class="contact__text" data-animate style="--start: 100ms; --y: 15px">
      Drop me an email if you'd like.
    </p>
    <a class="contact__email" href="mailto:{email}" data-animate style="--start: 200ms; --y: 15px">
      <svg class="contact__plane" width="18" height="18" viewBox="0 0 31.27 31.27" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M27.338,3.713l-5.316,22.166l-8.651-5.492l9.699-11.854L9.456,17.781l-4.45-2.882L27.338,3.713 M30.285,0L0.984,14.678l8.174,5.128l3.749,11.464l4.789-5.779l5.616,3.586L30.285,0L30.285,0z" />
      </svg>
      <span>{email}</span>
    </a>
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

  .contact__email {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--fs-small);
    color: var(--bg);
    background: var(--fg);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: var(--space-lg);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .contact__email:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    .contact::before {
      opacity: 0.25;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .contact__email {
      transition: none;
    }
  }
</style>
