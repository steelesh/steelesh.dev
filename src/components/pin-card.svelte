<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    href?: string;
    children?: Snippet;
  }

  const { title = "steelesh.dev", href = "https://steelesh.dev", children }: Props = $props();

  let hovered = $state(false);

  const cardTransform = $derived(
    hovered
      ? "translate(-50%, -50%) rotateX(0deg) scale(1)"
      : "translate(-50%, -50%) rotateX(40deg) scale(0.8)",
  );
</script>

<a
  class="pin"
  {href}
  target="_blank"
  rel="noopener noreferrer"
  onmouseenter={() => { hovered = true; }}
  onmouseleave={() => { hovered = false; }}
  onfocusin={() => { hovered = true; }}
  onfocusout={() => { hovered = false; }}
>
  <div class="pin__scene">
    <div class="pin__card" style:transform={cardTransform}>
      <div class="pin__card-content">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>

  <div class="pin__overlay" class:pin__overlay--hidden={hovered}>
    <div class="pin__overlay-inner">
      <div class="pin__label-wrap">
        <span class="pin__label">
          <span class="pin__label-text">{title}</span>
          <span class="pin__label-glow"></span>
        </span>
      </div>

      <div class="pin__ground">
        <div class="pin__ripple"></div>
        <div class="pin__ripple pin__ripple--2"></div>
        <div class="pin__ripple pin__ripple--3"></div>
      </div>

      <div class="pin__needle pin__needle--blur"></div>
      <div class="pin__needle pin__needle--sharp"></div>
      <div class="pin__dot pin__dot--blur"></div>
      <div class="pin__dot pin__dot--sharp"></div>
    </div>
  </div>
</a>

<style>
  .pin {
    position: relative;
    z-index: 1;
    display: inline-block;
    text-decoration: none;
    outline: none;
  }

  .pin__scene {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-top: 1rem;
    transform: translate(-50%, -50%);
    perspective: 1000px;
  }

  .pin__card {
    position: absolute;
    left: 50%;
    top: 50%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 0.75rem;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    transition: transform 700ms ease, border-color 700ms ease;
    overflow: hidden;
  }

  .pin:hover .pin__card,
  .pin:focus-within .pin__card {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .pin__card-content {
    position: relative;
    z-index: 1;
  }

  .pin__overlay {
    pointer-events: none;
    width: 24rem;
    height: 20rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: opacity 500ms ease;
  }

  .pin__overlay--hidden {
    opacity: 0;
  }

  .pin__overlay-inner {
    width: 100%;
    height: 100%;
    margin-top: -1.75rem;
    flex: none;
    position: relative;
  }

  .pin__label-wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
  }

  .pin__label {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 10;
    border-radius: 9999px;
    background: #09090b;
    padding: 0.25rem 1rem;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .pin__label-text {
    position: relative;
    z-index: 20;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: var(--font-mono);
    line-height: 1;
    padding: 0.125rem 0;
  }

  .pin__label-glow {
    position: absolute;
    bottom: 0;
    left: 1.125rem;
    height: 1px;
    width: calc(100% - 2.25rem);
    background: linear-gradient(
      to right,
      transparent,
      rgba(51, 51, 52, 0.4),
      transparent
    );
    opacity: 0.4;
  }

  .pin__ground {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-top: 1rem;
    perspective: 1000px;
    transform: rotateX(70deg) translateZ(0);
  }

  .pin__ripple {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 11.25rem;
    height: 11.25rem;
    border-radius: 50%;
    background: rgba(51, 51, 52, 0.03);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    animation: pin-ripple 8s infinite;
  }

  .pin__ripple--2 {
    animation-delay: 2.7s;
  }

  .pin__ripple--3 {
    animation-delay: 5.3s;
  }

  @keyframes pin-ripple {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
    17% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.25;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .pin__needle {
    position: absolute;
    right: 50%;
    bottom: 50%;
    width: 1px;
    height: 10rem;
    background: linear-gradient(to bottom, transparent, rgba(51, 51, 52, 0.5));
    transform: translateY(14px);
    transition: height 500ms ease;
  }

  .pin:hover .pin__needle,
  .pin:focus-within .pin__needle {
    height: 5rem;
  }

  .pin__needle--blur {
    filter: blur(2px);
  }

  .pin__dot {
    position: absolute;
    right: 50%;
    bottom: 50%;
    border-radius: 50%;
    z-index: 40;
  }

  .pin__dot--sharp {
    width: 2px;
    height: 2px;
    background: rgba(51, 51, 52, 0.7);
    transform: translate(0.5px, 14px);
  }

  .pin__dot--blur {
    width: 4px;
    height: 4px;
    background: rgba(51, 51, 52, 0.3);
    filter: blur(3px);
    transform: translate(1.5px, 14px);
  }

  @media (prefers-reduced-motion: reduce) {
    .pin__ripple {
      animation: none;
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(0.7);
    }

    .pin__card {
      transition: none;
    }

    .pin__needle {
      transition: none;
    }

    .pin__overlay {
      transition: none;
    }
  }
</style>
