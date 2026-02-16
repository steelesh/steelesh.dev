<script lang="ts">
  import { Rss } from "@lucide/svelte";
  import SocialIcons from "$components/social-icons.svelte";

  const version = app_version;
</script>

<footer>
  <div class="footer__inner">
    <div class="footer__left">
      <p><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> {new Date().getFullYear()} &copy; Steele S.</p>
      <p>
        <a href="/accessibility">Accessibility</a>
        <span class="footer__sep" aria-hidden="true">&middot;</span>
        <a href="/colophon">Colophon</a>
        <span class="footer__sep" aria-hidden="true">&middot;</span>
        <a href="https://github.com/steelesh/steelesh.dev" target="_blank" rel="noopener noreferrer">Source</a>
        <span class="footer__sep" aria-hidden="true">&middot;</span>
        <a href="https://github.com/steelesh/steelesh.dev/releases/tag/v{version}">v{version}</a>
        <span class="footer__sep" aria-hidden="true">&middot;</span>
        <a href="/feed.xml" class="footer__rss" aria-label="RSS feed"><Rss size={14} strokeWidth={2} /></a>
      </p>
    </div>
    <div class="footer__socials">
      <SocialIcons />
    </div>
  </div>
</footer>

<style>
  footer {
    padding: var(--space-xl) var(--space-md);
    padding-top: calc(var(--space-xl) + 1.5rem);
    margin-top: -1.5rem;
    background: var(--footer-bg);
  }

  .footer__inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
  }

  .footer__socials :global(.socials) {
    gap: var(--space-sm);
  }

  .footer__socials :global(a) {
    color: var(--footer-fg-muted, rgba(255, 255, 255, 0.55));
    transition:
      color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .footer__socials :global(a:hover) {
    color: var(--footer-fg, rgba(255, 255, 255, 0.8));
  }

  .footer__socials :global(svg) {
    width: 18px;
    height: 18px;
  }

  .footer__left {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  p {
    color: var(--footer-fg-subtle, rgba(255, 255, 255, 0.55));
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    margin-bottom: 0;
  }

  a {
    text-decoration: none;
    color: var(--footer-fg-muted, rgba(255, 255, 255, 0.55));
    transition: color var(--duration-fast) var(--ease-out);
  }

  a:hover {
    color: var(--footer-fg, rgba(255, 255, 255, 0.8));
  }

  .footer__sep {
    color: var(--footer-fg-subtle, rgba(255, 255, 255, 0.55));
    margin: 0 0.75rem;
    opacity: 0.5;
  }

  .footer__rss {
    display: inline-flex;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    footer {
      padding-bottom: calc(var(--space-xl) + 2rem);
    }

    .footer__inner {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a,
    .footer__socials :global(a) {
      transition: none;
    }
  }
</style>
