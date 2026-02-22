<script lang="ts">
  let canvas = $state<HTMLCanvasElement>();

  $effect(() => {
    if (!canvas)
      return;

    let disposed = false;
    let animId = 0;
    let io: IntersectionObserver | undefined;
    let ro: ResizeObserver | undefined;

    function start() {
      if (disposed || !canvas)
        return;

      const ctx = canvas.getContext("2d")!;
      const DPR = devicePixelRatio;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const SPIKE_CHANCE = 0.3;
      const POINT_SPACING = 1;
      const FRAME_SKIP = 2;
      const PREDICT_OFFSET = 60;

      const s = {
        time: 0,
        frameCount: 0,
        animatedY: 0,
        points: [] as { x: number; y: number }[],
        lastX: 0,
        spikeInProgress: 0,
        spikeHeight: 0,
        valleyInProgress: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        centerY: 0,
        maxY: 0,
        minY: 0,
        mainGradient: null as CanvasGradient | null,
        predictiveGradient: null as CanvasGradient | null,
      };

      let isVisible = true;

      function resize() {
        const rect = canvas!.getBoundingClientRect();
        canvas!.width = rect.width * DPR;
        canvas!.height = rect.height * DPR;
        ctx.scale(DPR, DPR);
        s.canvasWidth = canvas!.width / DPR;
        s.canvasHeight = canvas!.height / DPR;
        s.centerY = s.canvasHeight * 0.55;
        s.maxY = s.canvasHeight - 20;
        s.minY = 40;
        s.animatedY = s.centerY;
        s.mainGradient = null;
        s.predictiveGradient = null;
      }

      function generatePoint(x: number): { x: number; y: number } {
        const wave1 = Math.sin(s.time * 0.5 + x * 0.009) * 20;
        const wave2 = Math.sin(s.time * 0.85 + x * 0.004) * 12;
        let y = s.centerY + wave1 + wave2;

        if (Math.random() < SPIKE_CHANCE) {
          s.spikeHeight = Math.random() * (s.canvasHeight * 0.32);
          s.spikeInProgress = 14;
        }
        if (s.spikeInProgress > 0) {
          y -= s.spikeHeight * (s.spikeInProgress / 14);
          s.spikeInProgress--;
        }

        if (Math.random() < 0.02) {
          s.valleyInProgress = 18;
        }
        if (s.valleyInProgress > 0) {
          y += 22 * (s.valleyInProgress / 18);
          s.valleyInProgress--;
        }

        y += (Math.random() - 0.5) * 3;
        y = Math.max(s.minY, Math.min(s.maxY, y));
        return { x, y };
      }

      function initPoints() {
        s.points = [];
        for (let x = 0; x <= s.canvasWidth + 50; x += POINT_SPACING) {
          s.points.push(generatePoint(x));
          s.lastX = x;
        }
      }

      function advancePoints() {
        s.lastX += POINT_SPACING;
        s.points.push(generatePoint(s.lastX));
        const cutoff = -50;
        let removeCount = 0;
        for (let i = 0; i < s.points.length && s.points[i].x <= cutoff; i++)
          removeCount++;
        if (removeCount > 0)
          s.points.splice(0, removeCount);
        for (let i = 0; i < s.points.length; i++)
          s.points[i].x -= POINT_SPACING;
        s.time += 0.012;
      }

      function ensureGradients() {
        if (s.mainGradient && s.predictiveGradient)
          return;
        s.mainGradient = ctx.createLinearGradient(0, 0, 0, s.canvasHeight);
        s.mainGradient.addColorStop(0, "rgba(0, 0, 0, 0.15)");
        s.mainGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        s.predictiveGradient = ctx.createLinearGradient(0, 0, 0, s.canvasHeight);
        s.predictiveGradient.addColorStop(0, "rgba(0, 0, 0, 0.04)");
        s.predictiveGradient.addColorStop(1, "rgba(0, 0, 0, 0.01)");
      }

      function drawFill(visiblePoints: { x: number; y: number }[], midX: number, midY: number) {
        ensureGradients();
        if (s.mainGradient && visiblePoints.length > 0) {
          ctx.fillStyle = s.mainGradient;
          ctx.beginPath();
          ctx.moveTo(visiblePoints[0].x, s.canvasHeight);
          for (let i = 0; i < visiblePoints.length; i++)
            ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
          ctx.lineTo(midX, midY);
          ctx.lineTo(midX, s.canvasHeight);
          ctx.closePath();
          ctx.fill();
        }
        if (s.predictiveGradient) {
          ctx.fillStyle = s.predictiveGradient;
          ctx.beginPath();
          ctx.moveTo(midX, s.canvasHeight);
          const step = 2;
          const numSteps = Math.ceil((s.canvasWidth - midX) / step);
          const predictY = s.centerY + (midY - s.centerY) - PREDICT_OFFSET;
          for (let i = 1; i <= numSteps; i++)
            ctx.lineTo(midX + i * step, predictY);
          ctx.lineTo(midX + numSteps * step, s.canvasHeight);
          ctx.closePath();
          ctx.fill();
        }
      }

      function drawSolidLine(points: { x: number; y: number }[]) {
        if (points.length === 0)
          return;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
          ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
      }

      function drawDashedLine(midX: number, midY: number) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const step = 2;
        const numSteps = Math.ceil((s.canvasWidth - midX) / step);
        const predictY = midY - PREDICT_OFFSET;
        ctx.moveTo(midX, predictY);
        for (let i = 1; i <= numSteps; i++)
          ctx.lineTo(midX + i * step, predictY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      function drawVerticalDash(midX: number, midY: number) {
        const predictY = midY - PREDICT_OFFSET;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(midX, predictY + 8);
        ctx.lineTo(midX, s.canvasHeight + 200);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      function drawDot(midX: number, midY: number) {
        ctx.beginPath();
        ctx.arc(midX, midY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fill();
      }

      function drawPulse(midX: number, midY: number) {
        const pulsePhase = performance.now() % 2000 / 1000;
        const predictY = midY - PREDICT_OFFSET;
        if (pulsePhase < 1) {
          const radius = 8 + pulsePhase * 12;
          const opacity = 0.4 * (1 - pulsePhase);
          ctx.beginPath();
          ctx.arc(midX, predictY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(midX, predictY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(midX, predictY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(midX, predictY, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fill();
      }

      function render() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx.scale(DPR, DPR);
        s.frameCount++;
        if (s.frameCount % FRAME_SKIP === 0)
          advancePoints();

        const midX = s.canvasWidth / 2;
        const points = s.points;
        const len = points.length;
        let midPoint = points[len - 1];
        const visiblePoints: { x: number; y: number }[] = [];
        for (let i = 0; i < len; i++) {
          if (points[i].x <= midX)
            visiblePoints.push(points[i]);
          if (points[i].x >= midX && midPoint === points[len - 1])
            midPoint = points[i];
        }

        const currentY = midPoint.y;
        s.animatedY += (currentY - s.animatedY) * 0.1;
        const animY = s.animatedY;

        drawDashedLine(midX, animY);
        drawFill(visiblePoints, midX, animY);
        drawSolidLine(visiblePoints);
        drawVerticalDash(midX, animY);
        drawDot(midX, animY);
        drawPulse(midX, animY);
      }

      function draw() {
        if (!isVisible) {
          animId = 0;
          return;
        }
        render();
        if (!reduced)
          animId = requestAnimationFrame(draw);
      }

      resize();
      initPoints();

      if (reduced) {
        render();
      }
      else {
        animId = requestAnimationFrame(draw);
      }

      io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !reduced && !animId)
          animId = requestAnimationFrame(draw);
      }, { rootMargin: "100px", threshold: 0.1 });
      io.observe(canvas);

      ro = new ResizeObserver(() => {
        resize();
        initPoints();
        if (reduced)
          render();
      });
      ro.observe(canvas.parentElement!);
    }

    if ("requestIdleCallback" in window) {
      const idleId = requestIdleCallback(start, { timeout: 1500 });
      return () => {
        disposed = true;
        cancelIdleCallback(idleId);
        cancelAnimationFrame(animId);
        io?.disconnect();
        ro?.disconnect();
      };
    }
    else {
      const timerId = setTimeout(start, 100);
      return () => {
        disposed = true;
        clearTimeout(timerId);
        cancelAnimationFrame(animId);
        io?.disconnect();
        ro?.disconnect();
      };
    }
  });
</script>

<div class="chart">
  <svg class="chart__dots" aria-hidden="true">
    <defs>
      <pattern id="showcase-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="6" r="1" fill="rgba(0, 0, 0, 0.08)" />
      </pattern>
      <radialGradient id="showcase-dots-fade">
        <stop offset="0%" stop-color="white" stop-opacity="1" />
        <stop offset="70%" stop-color="white" stop-opacity="0.6" />
        <stop offset="100%" stop-color="white" stop-opacity="0" />
      </radialGradient>
      <mask id="showcase-dots-mask">
        <rect width="100%" height="100%" fill="url(#showcase-dots-fade)" />
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#showcase-dots)" mask="url(#showcase-dots-mask)" />
  </svg>
  <canvas bind:this={canvas} class="chart__canvas" aria-hidden="true"></canvas>
</div>

<style>
  .chart {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
  }

  .chart__dots {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .chart__canvas {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .chart {
      aspect-ratio: 4 / 3;
    }
  }
</style>
