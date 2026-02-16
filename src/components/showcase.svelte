<script lang="ts">
  import PinCard from "$components/pin-card.svelte";
  import ShowcaseChart from "$components/showcase-chart.svelte";
  import { scrollProgress } from "$lib/actions/scroll-progress";
  import degreesPreview from "$lib/assets/showcase/183degrees-preview.png?enhanced";
  import manifestPreview from "$lib/assets/showcase/manifest-preview.png?enhanced";
  import twohatPreview from "$lib/assets/showcase/twohat-preview.png?enhanced";

  const backendText
    = "I build modern backend systems with a strong focus on security, performance, and maintainability.";
  const backendWords = backendText.split(" ");

  const frontendText
    = "I deliver solid user-facing experiences that drive real results. I build with quality and high attention to detail.";
  const frontendWords = frontendText.split(" ");

  const techText = "These are the tools I'm most proficient in and often reach for when building something new.";
  const techWords = techText.split(" ");

  const items = [
    { title: "usemanifest.com", href: "https://usemanifest.com", image: manifestPreview, alt: "Manifest landing page preview" },
    { title: "twohat.com", href: "https://twohat.com", image: twohatPreview, alt: "Two Hat landing page preview" },
    { title: "183degrees.com", href: "https://183degrees.com", image: degreesPreview, alt: "183 Degrees landing page preview" },
  ];

  let current = $state(0);
  let activeScene = $state(0);
  let generation = $state(0);

  function advance() {
    current = (current + 1) % items.length;
  }

  function goTo(index: number) {
    current = index;
    generation++;
  }

  $effect(() => {
    void generation;
    const id = setInterval(advance, 3500);
    return () => clearInterval(id);
  });

  function trackScene(el: HTMLElement) {
    let raf = 0;
    function sync() {
      const p = Number.parseFloat(el.style.getPropertyValue("--progress") || "0");
      if (p < 0.33)
        activeScene = 0;
      else if (p < 0.66)
        activeScene = 1;
      else
        activeScene = 2;
      raf = requestAnimationFrame(sync);
    }
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }
</script>

<svg class="showcase__filters" aria-hidden="true">
  <defs>
    <filter id="metallic-engrave" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0" in="SourceGraphic" result="gray" />
      <feComponentTransfer in="gray" result="silver">
        <feFuncR type="linear" slope="0.45" intercept="0.28" />
        <feFuncG type="linear" slope="0.45" intercept="0.28" />
        <feFuncB type="linear" slope="0.42" intercept="0.31" />
      </feComponentTransfer>
    </filter>
  </defs>
</svg>

<section class="showcase" id="showcase" aria-label="About and skills">
  <div class="showcase__track">
    <div class="showcase__sticky" {@attach scrollProgress} {@attach trackScene}>
      <div class="showcase__inner">
        <span class="section-index showcase__index">[3]</span>

        <div class="showcase__scene showcase__scene--backend" style:pointer-events={activeScene === 0 ? "auto" : "none"}>
          <div class="showcase__scene-left">
            <p class="showcase__reveal" aria-label={backendText}>
              <!-- eslint-disable-next-line svelte/no-useless-mustaches -- preserves whitespace between word spans -->
              {#each backendWords as word, i}<span class="showcase__word" style="--i: {i / backendWords.length}" aria-hidden="true">{word}</span>{" "}{/each}
            </p>
          </div>
          <div class="showcase__scene-right">
            <ShowcaseChart />
          </div>
        </div>

        <div class="showcase__scene showcase__scene--frontend" style:pointer-events={activeScene === 1 ? "auto" : "none"}>
          <div class="showcase__scene-right showcase__scene-right--sites">
            <PinCard title={items[current].title} href={items[current].href}>
              {#snippet children()}
                {#each items as item, i}
                  <div class="showcase__pin-preview" class:showcase__pin-preview--active={i === current}>
                    <enhanced:img src={item.image} alt={item.alt} />
                  </div>
                {/each}
              {/snippet}
            </PinCard>
            <div class="showcase__tracker" role="tablist" aria-label="Carousel progress">
              {#each items as item, i}
                <button
                  class="showcase__tracker-segment"
                  role="tab"
                  aria-selected={i === current}
                  aria-label="{item.title} ({i + 1} of {items.length})"
                  onclick={() => goTo(i)}
                >
                  {#key i === current ? current : null}
                    <span
                      class="showcase__tracker-fill"
                      class:showcase__tracker-fill--running={i === current}
                    ></span>
                  {/key}
                </button>
              {/each}
            </div>
          </div>
          <div class="showcase__scene-left">
            <p class="showcase__reveal" aria-label={frontendText}>
              <!-- eslint-disable-next-line svelte/no-useless-mustaches -- preserves whitespace between word spans -->
              {#each frontendWords as word, i}<span class="showcase__word showcase__word--frontend" style="--i: {i / frontendWords.length}" aria-hidden="true">{word}</span>{" "}{/each}
            </p>
          </div>
        </div>

        <div class="showcase__scene showcase__scene--tech" style:pointer-events={activeScene === 2 ? "auto" : "none"}>
          <p class="showcase__tech-text showcase__reveal" aria-label={techText}>
            <!-- eslint-disable-next-line svelte/no-useless-mustaches -- preserves whitespace between word spans -->
            {#each techWords as word, i}<span class="showcase__word showcase__word--tech" style="--i: {i / techWords.length}" aria-hidden="true">{word}</span>{" "}{/each}
          </p>
          <div class="showcase__tech-icons" aria-hidden="true">
            <div class="showcase__keycap">
              <img src="/icons/tech/java.svg" alt="" width="44" height="44" class="showcase__icon" />
            </div>
            <div class="showcase__keycap">
              <img src="/icons/tech/typescript.svg" alt="" width="44" height="44" class="showcase__icon" />
            </div>
            <div class="showcase__keycap">
              <img src="/icons/tech/swift.svg" alt="" width="44" height="44" class="showcase__icon" />
            </div>
            <div class="showcase__keycap">
              <img src="/icons/tech/docker.svg" alt="" width="44" height="44" class="showcase__icon" />
            </div>
            <div class="showcase__keycap">
              <img src="/icons/tech/aws.svg" alt="" width="44" height="44" class="showcase__icon" />
            </div>
            <div class="showcase__keycap">
              <img src="/icons/tech/go.svg" alt="" width="44" height="44" class="showcase__icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .showcase__filters {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }

  .showcase {
    --bg: #faf8f5;
    --bg-subtle: #f0ede8;
    --bg-muted: #e8e4de;
    --fg: #333334;
    --fg-muted: #6b6560;
    --fg-subtle: #9b9590;
    --border-color: rgba(51, 51, 52, 0.12);
    --showcase-bg: #fff;
    background: var(--showcase-bg);
    color: var(--fg);
    position: relative;
  }

  .showcase__track {
    height: 400vh;
  }

  .showcase__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }

  .showcase__inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--space-md);
    width: 100%;
    height: 100%;
    position: relative;
  }

  .showcase__index {
    color: var(--fg-subtle);
    position: absolute;
    top: var(--space-section);
    left: var(--space-md);
    z-index: 1;
  }

  .showcase__scene {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    align-items: center;
    align-content: center;
    gap: var(--space-xl);
    will-change: opacity, transform;
    padding: 0 var(--space-md);
  }

  .showcase__scene--backend {
    --exit: clamp(0, (0.33 - var(--progress, 0)) * 20, 1);
    --scene: var(--exit);
    --scene-progress: clamp(0, var(--progress, 0) * 3, 1);
    opacity: var(--scene);
    transform: translateY(calc((1 - var(--exit)) * -20px));
  }

  .showcase__scene--frontend {
    --enter: clamp(0, (var(--progress, 0) - 0.33) * 20, 1);
    --exit: clamp(0, (0.66 - var(--progress, 0)) * 20, 1);
    --scene: min(var(--enter), var(--exit));
    --scene-progress: clamp(0, (var(--progress, 0) - 0.33) * 3, 1);
    opacity: var(--scene);
    transform: translateY(
      calc((1 - var(--enter)) * 20px + (1 - var(--exit)) * -20px)
    );
  }

  .showcase__scene--tech {
    --enter: clamp(0, (var(--progress, 0) - 0.66) * 20, 1);
    --scene: var(--enter);
    --scene-progress: clamp(0, (var(--progress, 0) - 0.66) * 3, 1);
    opacity: var(--scene);
    transform: translateY(calc((1 - var(--enter)) * 20px));
    grid-template-columns: 1fr;
    text-align: center;
    justify-items: center;
  }

  .showcase__reveal {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem);
    line-height: 1.35;
    text-wrap: balance;
    max-width: 38ch;
  }

  .showcase__word {
    --reveal: clamp(0, (var(--scene-progress, 0) * 1.6 - var(--i)) * 4, 1);
    color: color-mix(in oklab, var(--fg) calc(var(--reveal) * 100%), var(--bg-muted));
  }

  .showcase__word--tech {
    --reveal: clamp(0, (var(--scene-progress, 0) * 1.6 - var(--i)) * 4, 1);
  }

  .showcase__scene-left {
    display: flex;
    align-items: center;
  }

  .showcase__scene-right {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .showcase__tech-text {
    font-size: var(--fs-display);
    line-height: 1.3;
    max-width: var(--max-width-text);
    margin-bottom: var(--space-xl);
  }

  .showcase__tech-icons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: clamp(0.75rem, 2vw, var(--space-md));
  }

  .showcase__keycap {
    --keycap-size: clamp(68px, 11vw, 96px);
    --keycap-radius: clamp(10px, 1.5vw, 14px);
    width: var(--keycap-size);
    height: var(--keycap-size);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #ffffff, #f7f7f7 50%, #f0f0f0);
    border-radius: var(--keycap-radius);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-bottom-color: rgba(0, 0, 0, 0.08);
    border-right-color: rgba(0, 0, 0, 0.04);
    box-shadow:
      inset 1px 1px 2px rgba(255, 255, 255, 0.7),
      inset -1px -1px 3px rgba(0, 0, 0, 0.06),
      0 2px 0 0 #e4e4e4,
      0 3px 1px 0 #dcdcdc,
      0 5px 8px -2px rgba(0, 0, 0, 0.1),
      0 8px 16px -4px rgba(0, 0, 0, 0.05);
    transition: transform var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }

  .showcase__keycap:nth-child(1) { --stagger: 0; }
  .showcase__keycap:nth-child(2) { --stagger: 1; }
  .showcase__keycap:nth-child(3) { --stagger: 2; }
  .showcase__keycap:nth-child(4) { --stagger: 3; }
  .showcase__keycap:nth-child(5) { --stagger: 4; }
  .showcase__keycap:nth-child(6) { --stagger: 5; }

  .showcase__keycap:hover {
    transform: translateY(2px);
    box-shadow:
      inset 1px 1px 2px rgba(255, 255, 255, 0.5),
      inset -1px -2px 4px rgba(0, 0, 0, 0.08),
      0 1px 0 0 #e4e4e4,
      0 1px 2px 0 rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .showcase__keycap:hover .showcase__icon {
    filter: url(#metallic-engrave) brightness(1.08)
      drop-shadow(-0.5px -0.5px 0 rgba(255, 255, 255, 0.7))
      drop-shadow(0.5px 0.5px 0.5px rgba(0, 0, 0, 0.15))
      drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06));
  }

  .showcase__icon {
    width: clamp(32px, 5vw, 44px);
    height: clamp(32px, 5vw, 44px);
    filter: url(#metallic-engrave)
      drop-shadow(-0.5px -0.5px 0 rgba(255, 255, 255, 0.9))
      drop-shadow(0.5px 0.5px 0.5px rgba(0, 0, 0, 0.2))
      drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
    transition: filter var(--duration-fast) var(--ease-out);
  }

  .showcase__scene-right--sites {
    flex-direction: column;
  }

  .showcase__tracker {
    display: flex;
    gap: 6px;
    width: clamp(18rem, 36vw, 30rem);
    margin-top: var(--space-sm);
  }

  .showcase__tracker-segment {
    flex: 1;
    height: 20px;
    background: none;
    border-radius: 0;
    position: relative;
    overflow: hidden;
    border: none;
    padding: 0;
    cursor: pointer;
    appearance: none;
  }

  .showcase__tracker-segment::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.09);
    border-radius: 99px;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .showcase__tracker-segment:hover::before {
    background: rgba(0, 0, 0, 0.15);
  }

  .showcase__tracker-segment:focus-visible {
    outline: 2px solid var(--fg-muted);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .showcase__tracker-fill {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    transform: translateY(-50%) scaleX(0);
    transform-origin: left;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 99px;
    z-index: 1;
  }

  .showcase__tracker-fill--running {
    animation: tracker-fill 3.5s linear forwards;
  }

  @keyframes tracker-fill {
    from { transform: translateY(-50%) scaleX(0); }
    to { transform: translateY(-50%) scaleX(1); }
  }

  .showcase__scene-right--sites :global(.pin__overlay) {
    width: 30rem;
    height: 24rem;
  }

  .showcase__scene-right--sites :global(.pin__ripple) {
    width: 8rem;
    height: 8rem;
    opacity: 0.5;
  }

  .showcase__pin-preview {
    width: clamp(18rem, 36vw, 30rem);
    aspect-ratio: 8 / 5;
    border-radius: 0.5rem;
    overflow: hidden;
    line-height: 0;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }

  .showcase__pin-preview:not(.showcase__pin-preview--active) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .showcase__pin-preview--active {
    opacity: 1;
  }

  .showcase__pin-preview :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 1024px) and (min-width: 641px) {
    .showcase__scene {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
    }

    .showcase__scene--tech {
      grid-template-columns: 1fr;
    }

    .showcase__scene-right--sites :global(.pin__overlay) {
      width: 22rem;
      height: 18rem;
    }

    .showcase__pin-preview {
      width: clamp(14rem, 32vw, 22rem);
    }

    .showcase__tracker {
      width: clamp(14rem, 32vw, 22rem);
    }
  }

  @media (max-width: 640px) {
    .showcase__scene {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
    }

    .showcase__scene-left {
      order: -1;
    }

    .showcase__reveal {
      max-width: none;
    }

    .showcase__word {
      color: var(--fg);
    }

    .showcase__scene-right--sites :global(.pin__overlay) {
      width: min(20rem, calc(100vw - 2rem));
      height: min(16rem, calc(80vw - 2rem));
    }

    .showcase__scene-right--sites :global(.pin__overlay-inner) {
      margin-top: 0;
    }

    .showcase__pin-preview {
      width: min(16rem, calc(100vw - 4rem));
    }

    .showcase__tracker {
      width: min(16rem, calc(100vw - 4rem));
    }

    .showcase__tech-icons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      justify-items: center;
      max-width: 20rem;
      margin: 0 auto;
    }

    .showcase__keycap {
      --keycap-size: clamp(56px, 20vw, 80px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .showcase__track {
      height: auto;
    }

    .showcase__sticky {
      position: relative;
      height: auto;
      padding: var(--space-section) 0;
    }

    .showcase__scene {
      position: relative;
      opacity: 1;
      transform: none;
    }

    .showcase__word {
      color: var(--fg);
    }

    .showcase__keycap {
      transition: none;
    }

    .showcase__icon {
      transition: none;
    }

    .showcase__pin-preview {
      transition: none;
    }

    .showcase__tracker-fill--running {
      animation: none;
      transform: translateY(-50%) scaleX(1);
    }
  }
</style>
