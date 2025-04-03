<script lang="ts">
  import { onNavigate } from "$app/navigation";
  import { page } from "$app/state";

  const isActive = (path: string) => page.url.pathname === path;

  onNavigate(() => {
    if (!document.startViewTransition)
      return;

    return new Promise((fulfill) => {
      document.startViewTransition(() => {
        fulfill();
      });
    });
  });
</script>

<nav>
  <div class="container">
    <ul>
      <li class={isActive("/") ? "active" : ""}><a href="/">Home</a></li>
      <li class={isActive("/p") ? "active" : ""}><a href="/p">More</a></li>
    </ul>
  </div>
</nav>

<style>
  nav {
    margin: 2rem 0;
  }
  li {
    color: var(--fg-muted);
  }
  li.active {
    color: var(--fg);
    position: relative;
    font-weight: 700;
  }
  .active::after {
    content: '•';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1rem;
    color: var(--accent);
    view-transition-name: indicator;
  }
  ul {
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 0;
    list-style: none;
    display: flex;
    gap: 1rem;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
</style>
