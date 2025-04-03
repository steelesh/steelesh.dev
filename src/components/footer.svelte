<script>
  const version = app_version;
</script>

<footer>
  <div class="container">
    <div class="content">
      <p><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 2025 &copy; Steele Shreve</p>
      <p><a href="https://github.com/steelesh/steelesh.dev/releases/tag/v{version}">v{version}</a></p>
    </div>
  </div>
</footer>

<style>
  footer {
    padding: 0.75rem 0;
    border-top: 1px solid var(--bg-muted);
  }
  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  p {
    color: var(--fg-muted);
    font-size: var(--fs-xs);
    margin-bottom: 0;
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
