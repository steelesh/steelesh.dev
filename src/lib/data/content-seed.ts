import type { ContentItem } from "$lib/types";

const SEED_TAGS = [
  "React",
  "TypeScript",
  "Go",
  "Rust",
  "Python",
  "Docker",
  "PostgreSQL",
  "GraphQL",
  "Tailwind CSS",
  "AWS",
  "Kubernetes",
  "Svelte",
  "Node.js",
  "Deno",
  "WebAssembly",
  "Redis",
  "Firebase",
  "Prisma",
  "tRPC",
  "Astro",
];

const CATEGORIES: ContentItem["category"][] = ["project", "case-study", "post"];

interface SeedEntry {
  name: string;
  description: string;
  subtitle: string;
}

const ENTRIES: Record<ContentItem["category"], SeedEntry[]> = {
  "project": [
    { name: "Task Scheduler", description: "Distributed task scheduler with cron expressions, retries, and a real-time dashboard.", subtitle: "Building a distributed task runner with automatic retries and observability." },
    { name: "URL Shortener", description: "High-throughput URL shortener with analytics, QR code generation, and custom slugs.", subtitle: "How I built a link shortener that handles thousands of redirects per second." },
    { name: "CLI Dashboard", description: "Terminal-based dashboard for monitoring CI/CD pipelines across multiple providers.", subtitle: "A TUI tool for keeping tabs on builds without leaving the terminal." },
    { name: "Auth Gateway", description: "Centralized authentication gateway supporting OAuth 2.0, SAML, and API keys.", subtitle: "Designing a single sign-on gateway for microservice architectures." },
    { name: "Chat Server", description: "Real-time chat server with rooms, presence indicators, and message persistence.", subtitle: "Building a WebSocket chat server that scales horizontally." },
    { name: "Deploy Bot", description: "Slack bot for triggering deployments, rollbacks, and environment management.", subtitle: "Automating deployment workflows through conversational commands." },
    { name: "Log Viewer", description: "Structured log viewer with full-text search, filtering, and live tail.", subtitle: "A fast, searchable log viewer for debugging distributed systems." },
    { name: "Schema Sync", description: "Database schema migration tool with drift detection and rollback support.", subtitle: "Keeping database schemas in sync across environments without downtime." },
    { name: "Feed Reader", description: "Minimal RSS reader with offline support and keyboard-driven navigation.", subtitle: "A distraction-free feed reader built for speed." },
  ],
  "case-study": [
    { name: "Auth Architecture", description: "Deep dive into designing a token-based auth system with refresh rotation and revocation.", subtitle: "How we moved from session cookies to short-lived JWTs with zero downtime." },
    { name: "Search Pipeline", description: "End-to-end search pipeline from ingestion to relevance tuning and faceted results.", subtitle: "Building a search experience that feels instant across millions of documents." },
    { name: "Cache Strategy", description: "Multi-layer caching strategy combining CDN, Redis, and in-memory caches.", subtitle: "Reducing API latency by 90% with a tiered caching approach." },
    { name: "CI/CD Overhaul", description: "Migrating a monorepo from Jenkins to GitHub Actions with parallelized builds.", subtitle: "How we cut build times from 45 minutes to under 8." },
    { name: "Migration Plan", description: "Zero-downtime migration from a monolith to event-driven microservices.", subtitle: "Strangling a legacy monolith one bounded context at a time." },
    { name: "API Gateway", description: "Designing an API gateway with rate limiting, request transformation, and circuit breaking.", subtitle: "Centralizing cross-cutting concerns at the edge." },
    { name: "Data Pipeline", description: "Real-time data pipeline for processing clickstream events at scale.", subtitle: "From raw events to actionable analytics in under a second." },
    { name: "Load Testing", description: "Load testing strategy that caught a connection pool bottleneck before launch.", subtitle: "How synthetic traffic saved us from a production outage on day one." },
  ],
  "post": [
    { name: "Rust for TS Devs", description: "A practical introduction to Rust for developers coming from TypeScript.", subtitle: "Translating TypeScript mental models into idiomatic Rust patterns." },
    { name: "Docker Multi-Stage", description: "Using multi-stage Docker builds to ship smaller, faster container images.", subtitle: "Shrinking container images from 1.2 GB to 45 MB with multi-stage builds." },
    { name: "GraphQL vs REST", description: "When to reach for GraphQL and when REST is the simpler, better choice.", subtitle: "A pragmatic comparison based on real project trade-offs." },
    { name: "Edge Functions", description: "Running server-side logic at the edge with Cloudflare Workers and Deno Deploy.", subtitle: "What changes when your code runs in 200+ data centers." },
    { name: "Mono-repo Setup", description: "Setting up a TypeScript monorepo with workspaces, shared configs, and fast CI.", subtitle: "The tooling and conventions that make monorepos manageable." },
    { name: "Type-Safe APIs", description: "End-to-end type safety from database schema to frontend components.", subtitle: "How tRPC and Prisma eliminate an entire class of bugs." },
    { name: "Testing Strategy", description: "A layered testing strategy balancing unit, integration, and end-to-end tests.", subtitle: "Finding the right ratio of fast tests to confidence-building tests." },
    { name: "WebAssembly Primer", description: "Getting started with WebAssembly for performance-critical browser code.", subtitle: "When and how to reach for Wasm in a JavaScript-heavy codebase." },
  ],
};

const GRADIENT_PALETTE = [
  ["#1a1a2e", "#16213e"],
  ["#2d1b69", "#11052c"],
  ["#1b2838", "#0d1b2a"],
  ["#2e1a1a", "#3d1c1c"],
  ["#1a2e1a", "#0c2e0c"],
  ["#2e2a1a", "#3d351c"],
  ["#1a2e2e", "#0c2e3d"],
  ["#2e1a2e", "#3d1c3d"],
];

function seedCover(index: number): string {
  const [c1, c2] = GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
    </defs>
    <rect width="800" height="400" fill="url(#g)"/>
    <rect width="800" height="400" filter="url(#n)" opacity="0.08"/>
    <line x1="400" y1="160" x2="400" y2="240" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function seedDate(i: number): string {
  const month = ((i * 2) % 12) + 1;
  const year = i > 18 ? 2026 : 2025;
  const day = ((i * 3) % 28) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function pickTags(i: number): string[] {
  const count = 2 + (i % 3);
  const start = (i * 3) % SEED_TAGS.length;
  const tags: string[] = [];
  for (let j = 0; j < count; j++) {
    tags.push(SEED_TAGS[(start + j) % SEED_TAGS.length]);
  }
  return tags;
}

export function seedStats(slug: string): { views: number; likes: number } {
  let h = 0;
  for (const c of slug) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return { views: 50 + (Math.abs(h) % 950), likes: 2 + (Math.abs(h >> 8) % 48) };
}

export function generateSeedContent(): ContentItem[] {
  return Array.from({ length: 25 }, (_, i) => {
    const n = i + 1;
    const category = CATEGORIES[i % 3];
    const tags = pickTags(n);
    const categoryIndex = Math.floor(i / 3);
    const entries = ENTRIES[category];
    const entry = entries[categoryIndex % entries.length];

    return {
      slug: `seed-${category}-${n}`,
      name: entry.name,
      title: `${entry.name}: ${tags.slice(0, 2).join(" & ")}`,
      subtitle: entry.subtitle,
      description: entry.description,
      category,
      tags,
      publishedAt: seedDate(n),

      coverImage: seedCover(i) as any,
      coverImageAlt: `Abstract gradient for ${entry.name}`,
      devOnly: true,
    };
  });
}
