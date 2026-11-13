<script lang="ts">
  import { Rss } from "@lucide/svelte";
  import { resolve } from "$app/paths";

  import * as config from "#lib/config.ts";
  import { content } from "#lib/data/content.ts";
  import { formatDate } from "#lib/utils.ts";

  const user = "steele";
  const domain = "steelesh.dev";
  const email = `${user}@${domain}`;

  const writing = content;

  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": config.title,
        "url": config.url,
        "description": config.description,
      },
      {
        "@type": "Person",
        "name": "Steele S.",
        "url": config.url,
        "jobTitle": "Software Developer",
      },
    ],
  })}<\/script>`;
</script>

<svelte:head>
  <title>{config.title}</title>
  <meta name="description" content={config.description} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={config.title} />
  <meta property="og:description" content={config.description} />
  <meta property="og:url" content={config.url} />
  <meta property="og:image" content={config.ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{config.title} — Software engineer" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={config.title} />
  <meta name="twitter:description" content={config.description} />
  <meta name="twitter:image" content={config.ogImage} />
  <link rel="canonical" href={config.url} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD structured data requires @html -->
  {@html jsonLd}
</svelte:head>

<div class="page">
  <h1 class="name">Steele S.</h1>
  <p>
    Software developer based in Chicago, IL. Currently building fintech infrastructure at <a href="https://usemanifest.com/" target="_blank" rel="noopener noreferrer">Manifest<span class="ext" aria-hidden="true">↗</span></a>.
  </p>

  <div class="contact">
    <p>
      <span class="prompt" aria-hidden="true">&gt;</span> Reach me at
      <a class="email-btn" href={`mailto:${email}`} aria-label={`Send email to ${email}`}>
        {email}
        <svg width="13" height="13" viewBox="0 0 31.27 31.27" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M27.338,3.713l-5.316,22.166l-8.651-5.492l9.699-11.854L9.456,17.781l-4.45-2.882L27.338,3.713 M30.285,0L0.984,14.678l8.174,5.128l3.749,11.464l4.789-5.779l5.616,3.586L30.285,0L30.285,0z" />
        </svg>
      </a>
    </p>
  </div>

  {#if writing.length > 0}
    <div class="divider">
      <a href={resolve("/feed.xml")} class="rss" aria-label="RSS feed" target="_blank" rel="noopener noreferrer"><Rss size={14} strokeWidth={2} /></a>
      <hr />
    </div>
    <ul>
      {#each writing as post (post.slug)}
        <li>
          <div class="li-row">
            <a href={resolve("/w/[slug]", { slug: post.slug })}>{post.name}</a>
            <time class="date" datetime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </div>
          <span class="desc">{post.description}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .page {
    max-width: 50rem;
    margin: 0 auto;
    padding: clamp(1.5rem, 6vh, 3rem) var(--space-md) var(--space-section);
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: var(--tracking-tight);
    margin-bottom: 1.25rem;
  }

  .name {
    font-family: var(--font-sans);
  }

  p {
    font-family: var(--font-sans);
    font-size: 1rem;
    color: var(--fg);
    margin-top: 1rem;
    margin-bottom: 0;
  }

  p:first-of-type {
    margin-top: 0;
  }

  a {
    color: var(--fg);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--duration-fast) var(--ease-out);
  }

  a:hover {
    color: var(--fg-muted);
  }

  .ext {
    font-size: 0.6em;
    margin-left: 0.1em;
    vertical-align: super;
    color: var(--fg-subtle);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 2.5rem;
  }

  .divider hr {
    flex: 1;
    border: none;
    border-top: 3px double var(--border-color);
    margin: 0;
  }

  .rss {
    display: inline-flex;
    color: var(--fg);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .rss:hover {
    color: var(--fg-muted);
  }

  ul {
    list-style: none;
    padding: 0;
    margin-top: 0;
    display: flex;
    flex-direction: column;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.75rem 0;
  }

  li a {
    font-family: var(--font-mono);
    font-size: 1rem;
    letter-spacing: 0.01em;
    text-decoration: none;
    color: var(--fg);
    font-weight: 400;
    width: fit-content;
    transition: color var(--duration-fast) var(--ease-out);
  }

  li a:hover {
    color: var(--fg-muted);
    text-decoration: none;
  }

  .li-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .date {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-subtle);
    white-space: nowrap;
  }

  .desc {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--fg-muted);
  }

  .contact {
    margin-top: 1.5rem;
  }

  .contact p {
    margin-top: 0;
  }

  .prompt {
    font-family: var(--font-mono);
    color: var(--fg-subtle);
  }

  .email-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.85em;
    color: var(--fg-muted);
    background: none;
    border: none;
    box-shadow: none;
    text-decoration: none;
    padding: 0;
    margin-left: 0.25rem;
    vertical-align: baseline;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .email-btn:hover {
    color: var(--fg);
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>
