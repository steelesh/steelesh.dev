<script>
  const version = app_version;
</script>

<footer>
  <div class="footer__inner">
    <p><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> 2025 &copy; Steele Shreve</p>
    <p><a href="https://github.com/steelesh/steelesh.dev/releases/tag/v{version}">v{version}</a></p>
  </div>
</footer>

<style>
  footer {
    padding: var(--space-lg) var(--space-md);
    padding-top: calc(var(--space-lg) + 1.5rem);
    margin-top: -1.5rem;
    background: var(--footer-bg);
  }

  .footer__inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  p {
    color: rgba(255, 255, 255, 0.35);
    font-family: var(--font-sans);
    font-size: var(--fs-xs);
    margin-bottom: 0;
  }

  a {
    text-decoration: none;
    color: rgba(255, 255, 255, 0.5);
    transition: color var(--duration-fast) var(--ease-out);
  }

  a:hover {
    color: rgba(255, 255, 255, 0.8);
  }
</style>
