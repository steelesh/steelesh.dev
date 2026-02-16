<script lang="ts">
  import DotGrid from "$components/dot-grid.svelte";
  import portrait from "$lib/assets/hero-portrait.jpg?enhanced";
</script>

<section class="hero" id="hero" aria-label="Introduction">
  <DotGrid />
  <span class="hero__index" data-animate style="--start: 50ms; --y: 15px">[1]</span>
  <div class="hero__content">
    <div class="hero__photo hero__photo--mobile" data-animate style="--start: 50ms; --y: 30px">
      <enhanced:img src={portrait} alt="Portrait of Steele" />
    </div>
    <h1 class="hero__heading" data-animate style="--start: 100ms; --y: 40px">
      Hi, I'm Steele
      <span class="hero__photo hero__photo--desktop">
        <enhanced:img src={portrait} alt="Portrait of Steele" />
      </span><span class="hero__comma">,</span>
    </h1>
    <p class="hero__role" data-animate style="--start: 300ms; --y: 30px">Software Engineer.</p>
    <p class="hero__sub-text" data-animate style="--start: 500ms">Based in Chicago, IL.</p>
  </div>
  <div class="hero__scroll" data-animate style="--start: 700ms; --y: 10px" aria-hidden="true">
    <span class="hero__scroll-text">Scroll</span>
    <span class="hero__scroll-line"></span>
  </div>
</section>

<style>
  .hero {
    --selection-bg: rgba(255, 255, 255, 0.1);
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
    font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--dark-fg);
  }

  .hero__photo {
    border-radius: 0.75rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .hero__photo :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 15%;
  }

  .hero__photo--desktop {
    display: inline-block;
    width: clamp(5rem, 8vw, 7.5rem);
    height: clamp(5rem, 8vw, 7.5rem);
    transition: transform 300ms ease-in-out;
  }

  .hero__photo--desktop:hover {
    transform: scale(1.75);
  }

  .hero__photo--mobile {
    display: none;
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

  @media (max-width: 768px) {
    .hero__photo--desktop {
      display: none;
    }

    .hero__photo--mobile {
      display: block;
      width: 6.5rem;
      height: 6.5rem;
      margin: 0 auto 1.5rem;
    }

    .hero__heading {
      display: block;
    }

    .hero__role {
      margin-top: 0;
    }
  }

  .hero__index {
    position: absolute;
    top: var(--space-section);
    left: 1.5rem;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: rgba(255, 255, 255, 0.58);
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
    padding: 0.45em 1.1em;
    border-radius: 100px;
    position: relative;
    z-index: 0;
    overflow: hidden;
  }

  .hero__sub-text::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300%;
    aspect-ratio: 1;
    background: conic-gradient(
      from 180deg,
      transparent 0deg,
      color-mix(in srgb, var(--accent) 15%, transparent) 60deg,
      color-mix(in srgb, var(--accent) 35%, transparent) 90deg,
      color-mix(in srgb, var(--accent) 15%, transparent) 120deg,
      transparent 180deg
    );
    animation: shimmer-border 6s linear infinite;
    z-index: -2;
  }

  .hero__sub-text::after {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.85);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    z-index: -1;
  }

  @keyframes shimmer-border {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
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

  @media (prefers-reduced-motion: reduce) {
    .hero__sub-text::before {
      animation: none;
    }

    .hero__scroll-line::after {
      animation: none;
    }

    .hero__photo--desktop {
      transition: none;
    }
  }
</style>
