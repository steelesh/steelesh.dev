<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const chars = " \u00B7.:~-=+*#%@";
    const fontSize = 10;
    const cellW = 7;
    const cellH = 14;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sprites: HTMLCanvasElement[] = [];
    for (const ch of chars) {
      const sc = document.createElement("canvas");
      sc.width = Math.ceil(cellW * dpr);
      sc.height = Math.ceil(cellH * dpr);
      const sctx = sc.getContext("2d")!;
      sctx.scale(dpr, dpr);
      sctx.font = `${fontSize}px "SF Mono","Fira Code",monospace`;
      sctx.textBaseline = "top";
      sctx.fillStyle = "rgb(240, 237, 232)";
      sctx.fillText(ch, 0, 1);
      sprites.push(sc);
    }

    let w = 0;
    let h = 0;
    let animId = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    function draw(timestamp: number) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const t = reduced ? 0 : timestamp * 0.001;
      const cols = Math.ceil(w / cellW);
      const rows = Math.ceil(h / cellH);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const nx = col / cols;
          const ny = row / rows;

          const wave1 = Math.sin(nx * 8 + ny * 2 + t * 0.6);
          const wave2 = Math.sin(ny * 6 - t * 0.4 + nx * 1.5);
          const wave3 = Math.sin((nx + ny) * 4 + t * 0.3) * 0.5;
          const v = wave1 * 0.5 + wave2 * 0.35 + wave3;

          const norm = Math.max(0, Math.min(1, (v + 1.35) / 2.7));
          const idx = Math.floor(norm * (chars.length - 1));
          if (idx === 0)
            continue;

          ctx.globalAlpha = 0.03 + norm * 0.09;
          ctx.drawImage(sprites[idx], col * cellW, row * cellH, cellW, cellH);
        }
      }

      if (!reduced) {
        animId = requestAnimationFrame(draw);
      }
    }

    resize();

    if (reduced) {
      draw(0);
    }
    else {
      animId = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced)
        draw(0);
    });
    ro.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  });
</script>

<canvas bind:this={canvas} class="wave" aria-hidden="true"></canvas>

<style>
  .wave {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    user-select: none;
    z-index: 0;
  }
</style>
