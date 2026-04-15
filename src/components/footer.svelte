<script lang="ts">
  const version = app_version;

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme")
      ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }
</script>

<footer>
  <div class="footer__inner">
    <p><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> {new Date().getFullYear()} &copy; Steele S.</p>
    <p>
      <a href="/accessibility">Accessibility</a>
      <span class="footer__sep" aria-hidden="true">&middot;</span>
      <a href="https://github.com/ss0923/steelesh.dev" target="_blank" rel="noopener noreferrer">Source</a>
      <span class="footer__sep" aria-hidden="true">&middot;</span>
      <a href="https://github.com/ss0923/steelesh.dev/releases/tag/v{version}">v{version}</a>
      <span class="footer__sep" aria-hidden="true">&middot;</span>
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18V4a8 8 0 1 1 0 16Z" />
        </svg>
      </button>
    </p>
  </div>
</footer>

<style>
  footer {
    padding: var(--space-lg) var(--space-md);
    border-top: 1px solid var(--border-color);
  }

  .footer__inner {
    max-width: 50rem;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
  }

  p {
    color: var(--fg-subtle);
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    margin-bottom: 0;
  }

  a {
    text-decoration: none;
    color: var(--fg-subtle);
    transition: color var(--duration-fast) var(--ease-out);
  }

  a:hover {
    color: var(--fg-muted);
  }

  .footer__sep {
    color: var(--fg-subtle);
    margin: 0 0.5rem;
    opacity: 0.5;
  }

  .theme-toggle {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    color: var(--fg-subtle);
    vertical-align: middle;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .theme-toggle:hover {
    color: var(--fg-muted);
  }

  @media (max-width: 768px) {
    .footer__inner {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>
