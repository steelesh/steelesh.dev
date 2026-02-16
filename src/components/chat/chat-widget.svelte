<script lang="ts">
  import type { ChatContext, ChatMessage } from "$lib/types";
  import type { Component } from "svelte";

  import { BotMessageSquare } from "@lucide/svelte";
  import { page } from "$app/state";
  import { getGreeting } from "$lib/data/chat-suggestions";
  import { getContentBySlug } from "$lib/data/content";

  let ChatPanel = $state<Component<any> | null>(null);
  let panelLoading = $state(false);

  async function loadPanel() {
    if (ChatPanel || panelLoading)
      return;
    panelLoading = true;
    const mod = await import("./chat-panel.svelte");
    ChatPanel = mod.default;
    panelLoading = false;
  }

  let widgetEl = $state<HTMLDivElement>();
  let isOpen = $state(false);
  let contextOverride = $state<Partial<ChatContext> | undefined>(undefined);
  const label = "Ask AI";

  let messages = $state<ChatMessage[]>([]);

  const urlContext: ChatContext = $derived.by(() => {
    const path = page.url.pathname;
    const segments = path.split("/").filter(Boolean);

    if (segments[0] === "posts" && segments[1]) {
      const item = getContentBySlug("post", segments[1]);
      return { page: "post" as const, title: item?.title, slug: segments[1] };
    }
    if (segments[0] === "case-studies" && segments[1]) {
      const item = getContentBySlug("case-study", segments[1]);
      return { page: "case-study" as const, title: item?.title, slug: segments[1] };
    }
    if (segments[0] === "projects" && segments[1]) {
      const item = getContentBySlug("project", segments[1]);
      return { page: "project" as const, title: item?.title, slug: segments[1] };
    }
    return { page: "home" as const };
  });

  const context: ChatContext = $derived(
    contextOverride ? { ...urlContext, ...contextOverride } as ChatContext : urlContext,
  );

  function isSameContext(current: ChatContext, incoming: Partial<ChatContext>): boolean {
    return current.page === incoming.page && current.slug === incoming.slug;
  }

  function seedGreeting() {
    if (!messages.some(m => m.role === "user")) {
      messages.length = 0;
      messages.push({ role: "assistant", content: getGreeting(context) });
    }
  }

  async function toggle() {
    if (!isOpen)
      await loadPanel();
    isOpen = !isOpen;
    if (isOpen) {
      seedGreeting();
    }
  }

  $effect(() => {
    document.documentElement.classList.toggle("chat-open", isOpen);
    return () => document.documentElement.classList.remove("chat-open");
  });

  $effect(() => {
    if (!isOpen)
      return;
    function onClickOutside(e: PointerEvent) {
      if (widgetEl && !widgetEl.contains(e.target as Node)) {
        isOpen = false;
      }
    }
    document.addEventListener("pointerdown", onClickOutside);
    return () => document.removeEventListener("pointerdown", onClickOutside);
  });

  $effect(() => {
    async function handler(e: Event) {
      await loadPanel();
      const detail = (e as CustomEvent).detail as { context?: Partial<ChatContext> } | undefined;
      if (detail?.context) {
        if (!isSameContext(context, detail.context)) {
          contextOverride = detail.context;
          messages.length = 0;
        }
        if (!isOpen) {
          isOpen = true;
        }
        seedGreeting();
      }
      else {
        toggle();
      }
    }
    window.addEventListener("openchat", handler);
    return () => window.removeEventListener("openchat", handler);
  });
</script>

<div class="chat-widget" bind:this={widgetEl}>
  {#if isOpen && ChatPanel}
    <div class="chat-widget__panel">
      <svelte:boundary onerror={e => console.error("[chat]", e)}>
        <ChatPanel title={label} {context} bind:messages onclose={() => {
          isOpen = false;
        }} onclear={() => {
          contextOverride = undefined;
          messages.length = 0;
          messages.push({ role: "assistant", content: getGreeting(urlContext) });
        }} />
        {#snippet failed(_error, reset)}
          <div class="chat-widget__error">
            <p>Chat encountered an error.</p>
            <button onclick={reset}>Retry</button>
          </div>
        {/snippet}
      </svelte:boundary>
    </div>
  {/if}

  <button
    class="chat-widget__trigger"
    class:chat-widget__trigger--open={isOpen}
    onclick={toggle}
    aria-label={isOpen ? "Close chat" : label}
    aria-expanded={isOpen}
  >
    <BotMessageSquare size={18} strokeWidth={2} />
    <span class="chat-widget__label">{label}</span>
  </button>
</div>

<style>
  .chat-widget {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .chat-widget__panel {
    animation: panel-in 300ms var(--ease-out) both;
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .chat-widget__trigger {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0;
    padding: 0.625rem;
    border: 1.5px solid transparent;
    border-radius: 100px;
    background:
      linear-gradient(var(--bg), var(--bg)) padding-box,
      linear-gradient(
        90deg,
        var(--rainbow-1),
        var(--rainbow-5),
        var(--rainbow-3),
        var(--rainbow-4),
        var(--rainbow-2),
        var(--rainbow-1)
      ) border-box;
    background-size: 100% 100%, 200% 100%;
    animation: rainbow-shift 12s linear infinite;
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.02em;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .chat-widget__trigger::before {
    content: "";
    position: absolute;
    bottom: -30%;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 40%;
    background: linear-gradient(
      90deg,
      var(--rainbow-1),
      var(--rainbow-5),
      var(--rainbow-3),
      var(--rainbow-4),
      var(--rainbow-2),
      var(--rainbow-1)
    );
    background-size: 200% 100%;
    animation: rainbow-shift 12s linear infinite;
    filter: blur(10px);
    opacity: 0.15;
    z-index: -1;
    pointer-events: none;
    border-radius: 100px;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .chat-widget__trigger:hover {
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    transform: scale(1.03);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 8px 24px rgba(0, 0, 0, 0.06);
  }

  .chat-widget__trigger:hover::before {
    opacity: 0.3;
  }

  .chat-widget__trigger--open {
    background: var(--bg-subtle);
    border-color: var(--border-color);
    animation: none;
  }

  .chat-widget__trigger--open::before {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .chat-widget__trigger,
    .chat-widget__trigger::before {
      animation: none;
    }
  }

  .chat-widget__label {
    white-space: nowrap;
    overflow: hidden;
    max-width: 0;
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .chat-widget__trigger:hover .chat-widget__label {
    max-width: 6rem;
    opacity: 1;
  }

  @media (max-width: 480px) {
    .chat-widget {
      bottom: 1rem;
      right: 1rem;
    }

    .chat-widget__trigger {
      gap: 0.5rem;
      padding: 0.625rem 1rem;
    }

    .chat-widget__label {
      max-width: 6rem;
      opacity: 1;
    }
  }

  .chat-widget__error {
    padding: 1.5rem;
    text-align: center;
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    color: var(--fg-muted);
  }

  .chat-widget__error button {
    margin-top: 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    color: var(--fg-subtle);
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 0.25rem 0.75rem;
  }
</style>
