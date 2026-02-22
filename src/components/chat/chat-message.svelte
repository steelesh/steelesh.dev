<script lang="ts" module>
  import { marked } from "marked";

  marked.use({
    gfm: true,
    breaks: true,
    renderer: {
      link({ href, text }) {
        const sanitizedHref = href.replace(/["`]/g, "");
        if (!/^https?:\/\//i.test(sanitizedHref))
          return text;
        return `<a href="${sanitizedHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      },
      html() {
        return "";
      },
    },
  });
</script>

<script lang="ts">
  import { BotMessageSquare, Check, Copy, RotateCcw, TriangleAlert } from "@lucide/svelte";

  interface Props {
    role: "user" | "assistant";
    content: string;
    error?: string;
    streaming?: boolean;
    loading?: boolean;
    onretry?: () => void;
  }

  const { role, content, error, streaming = false, loading = false, onretry }: Props = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  let renderedHtml = $state("");
  let latestContent = "";
  let lastRenderTime = 0;
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;

  const RENDER_INTERVAL_MS = 80;

  $effect(() => {
    return () => {
      clearTimeout(copyTimer);
      if (throttleTimer)
        clearTimeout(throttleTimer);
    };
  });

  function renderMarkdown(text: string) {
    renderedHtml = marked.parse(text, { async: false }) as string;
  }

  $effect(() => {
    if (role !== "assistant")
      return;

    latestContent = content;

    if (!streaming) {
      if (throttleTimer) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      renderMarkdown(content);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastRenderTime;

    if (elapsed >= RENDER_INTERVAL_MS) {
      lastRenderTime = now;
      renderMarkdown(content);
    }
    else if (!throttleTimer) {
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        lastRenderTime = Date.now();
        renderMarkdown(latestContent);
      }, RENDER_INTERVAL_MS - elapsed);
    }
  });

  async function copyText() {
    try {
      await navigator.clipboard.writeText(content);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copied = false;
      }, 1500);
    }
    catch {}
  }
</script>

<div class="message" class:message--user={role === "user"} class:message--assistant={role === "assistant"}>
  {#if role === "assistant"}
    <span class="message__avatar" aria-hidden="true">
      <BotMessageSquare size={12} strokeWidth={2} />
    </span>
  {/if}
  <div class="message__body">
    {#if role === "assistant"}
      {#if loading && !content}
        <div class="message__text message__typing">
          <span class="message__dot"></span>
          <span class="message__dot"></span>
          <span class="message__dot"></span>
        </div>
      {:else if content}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- Sanitized: raw HTML stripped, hrefs sanitized in marked renderer -->
        <div class="message__text message__markdown" class:is-streaming={streaming}>{@html renderedHtml}</div>
      {/if}
      {#if error}
        <div class="message__text message__error">
          <TriangleAlert size={14} strokeWidth={2} />
          <span>{error}</span>
        </div>
      {/if}
      {#if onretry}
        <button class="message__retry" onclick={onretry}>
          <RotateCcw size={12} strokeWidth={2} />
          <span>Retry</span>
        </button>
      {/if}
    {:else}
      <p class="message__text">{content}</p>
    {/if}
    {#if role === "assistant" && !streaming && !error}
      <button
        class="message__copy"
        class:message__copy--copied={copied}
        onclick={copyText}
        aria-label={copied ? "Copied" : "Copy response"}
      >
        {#if copied}
          <Check size={12} strokeWidth={2} />
        {:else}
          <Copy size={12} strokeWidth={2} />
        {/if}
      </button>
    {/if}
  </div>
</div>

<style>
  .message {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    animation: message-in 250ms var(--ease-out) both;
  }

  .message--user {
    justify-content: flex-end;
  }

  .message--assistant {
    justify-content: flex-start;
    align-items: flex-start;
  }

  .message__avatar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-top: 0.25rem;
    border-radius: 6px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--fg) 8%, var(--bg-subtle)) 0%,
      var(--bg-subtle) 100%
    );
    border: 1px solid var(--border-color);
    color: var(--fg-muted);
  }

  .message__body {
    max-width: 82%;
    position: relative;
  }

  .message__text {
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    line-height: var(--leading-body);
    word-break: break-word;
  }

  .message--user .message__text {
    background: linear-gradient(
      135deg,
      #007aff 0%,
      #0063d1 100%
    );
    color: #fff;
    border-bottom-right-radius: 0.25rem;
    box-shadow:
      0 1px 3px color-mix(in srgb, #007aff 20%, transparent),
      inset 0 1px 0 color-mix(in srgb, #fff 10%, transparent);
  }

  .message--assistant .message__text {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 60%, var(--bg-subtle)) 0%,
      var(--bg-subtle) 100%
    );
    color: var(--fg);
    border: 1px solid var(--border-color);
    border-bottom-left-radius: 0.25rem;
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--bg) 50%, transparent);
  }

  .message__markdown :global(p) {
    margin: 0;
  }

  .message__markdown :global(p + p) {
    margin-top: 0.5em;
  }

  .message__markdown :global(ul),
  .message__markdown :global(ol) {
    margin: 0.4em 0;
    padding-left: 1.25em;
  }

  .message__markdown :global(li) {
    margin: 0.15em 0;
  }

  .message__markdown :global(strong) {
    font-weight: 600;
  }

  .message__markdown :global(code) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    padding: 0.1em 0.35em;
    border-radius: 4px;
    background: color-mix(in srgb, var(--fg) 8%, transparent);
  }

  .message__markdown :global(pre) {
    margin: 0.4em 0;
    padding: 0.5em 0.6em;
    border-radius: 6px;
    background: color-mix(in srgb, var(--fg) 6%, transparent);
    overflow-x: auto;
  }

  .message__markdown :global(pre code) {
    padding: 0;
    background: none;
  }

  .message__markdown :global(a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .message__markdown :global(blockquote) {
    margin: 0.4em 0;
    padding-left: 0.6em;
    border-left: 2px solid var(--border-color);
    color: var(--fg-muted);
  }

  .message__error {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: color-mix(in srgb, #e45858 8%, var(--bg-subtle));
    border: 1px solid color-mix(in srgb, #e45858 20%, var(--border-color));
    border-bottom-left-radius: 0.25rem;
    color: color-mix(in srgb, #e45858 70%, var(--fg));
  }

  .message__error :global(svg) {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .message__retry {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .message__retry:hover {
    color: var(--fg);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  .is-streaming :global(:last-child)::after {
    content: "";
    display: inline-block;
    width: 2px;
    height: 0.9em;
    margin-left: 1px;
    vertical-align: text-bottom;
    background: var(--fg-muted);
    animation: cursor-blink 1s step-end infinite;
  }

  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .message__copy {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-top: 0.25rem;
    border: none;
    background: none;
    color: var(--fg-subtle);
    border-radius: 4px;
    opacity: 0;
    transition:
      opacity var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .message:hover .message__copy {
    opacity: 1;
  }

  .message__copy:hover {
    color: var(--fg-muted);
  }

  .message__copy--copied {
    opacity: 1;
    color: var(--success);
  }

  .message__copy--copied:hover {
    color: var(--success);
  }

  .message__typing {
    display: inline-flex;
    gap: 0.3rem;
    align-items: center;
  }

  .message__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--fg-subtle);
    animation: typing-pulse 1.4s ease-in-out infinite;
  }

  .message__dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .message__dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-pulse {
    0%,
    60%,
    100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-2px);
    }
  }

  @keyframes message-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .message {
      animation: none;
    }

    .message__dot {
      animation: none;
    }

    .is-streaming :global(:last-child)::after {
      animation: none;
    }

    .message__retry {
      transition: none;
    }

    .message__copy {
      transition: none;
    }
  }
</style>
