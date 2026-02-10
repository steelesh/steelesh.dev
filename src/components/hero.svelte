<script lang="ts">
  import DotGrid from "$components/dot-grid.svelte";
  import { scrollReveal } from "$lib/actions/scroll-reveal";
  import portrait from "$lib/assets/mke_tool_portrait.jpg?enhanced";
</script>

<section class="hero" aria-label="Introduction">
  <DotGrid />
  <span class="hero__index" use:scrollReveal={{ delay: 50, y: 15 }}>[1]</span>
  <div class="hero__content">
    <h1 class="hero__heading" use:scrollReveal={{ delay: 100, y: 40 }}>
      I'm Steele Shreve
      <span class="hero__photo">
        <enhanced:img src={portrait} alt="Portrait of Steele Shreve" />
      </span>,
    </h1>
    <p class="hero__role" use:scrollReveal={{ delay: 300, y: 30 }}>software engineer.</p>
    <p class="hero__sub-text" use:scrollReveal={{ delay: 500, y: 20 }}>📍 Based in Chicago, IL.</p>
  </div>
  <div class="hero__scroll" aria-hidden="true">
    <span class="hero__scroll-text">Scroll</span>
    <span class="hero__scroll-line"></span>
  </div>
</section>

<style>
  .hero {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 6rem 2rem;
    position: relative;
    background: var(--dark-bg);
    overflow: hidden;
  }

  .hero__content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 48rem;
    width: 100%;
  }

  .hero__heading {
    text-wrap: balance;
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    font-family: var(--font-sans);
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  .hero__photo {
    display: inline-block;
    width: clamp(4rem, 7vw, 6rem);
    height: clamp(4rem, 7vw, 6rem);
    border-radius: 0.75rem;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 300ms ease-in-out;
  }

  .hero__photo:hover {
    transform: scale(1.75);
  }

  .hero__photo :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 15%;
  }

  .hero__role {
    font-family: var(--font-serif);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    line-height: 1.1;
    letter-spacing: 0.025em;
    margin-top: 0.25rem;
    background: linear-gradient(135deg, #e8ddd0 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero__index {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.05em;
  }

  .hero__sub-text {
    display: inline-block;
    margin-top: 3.5rem;
    font-family: var(--font-mono);
    font-size: clamp(0.6875rem, 1vw, 0.8125rem);
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.05em;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    padding: 0.45em 1.1em;
    border-radius: 100px;
  }

  .hero__scroll {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    z-index: 1;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .hero__scroll-text {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    writing-mode: vertical-rl;
  }

  .hero__scroll-line {
    display: block;
    width: 1px;
    height: 48px;
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    position: relative;
    overflow: hidden;
  }

  .hero__scroll-line::after {
    content: "";
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--accent);
    animation: scroll-line 2.5s ease-in-out infinite;
  }

  @keyframes scroll-line {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(200%);
    }
  }
</style>
