<script lang="ts">
  import type { ChatContext, ChatMessage as ChatMessageType } from "$lib/types";

  import { ArrowUp, FileText, RotateCcw, Square, X } from "@lucide/svelte";
  import { streamChatMessage } from "$lib/api";
  import { getGreeting, getSuggestions } from "$lib/data/chat-suggestions";
  import { MediaQuery } from "svelte/reactivity";

  import ChatMessage from "./chat-message.svelte";
  import ChatSuggestions from "./chat-suggestions.svelte";

  interface Props {
    title?: string;
    context?: ChatContext;
    messages: ChatMessageType[];
    onclose: () => void;
    onclear?: () => void;
  }

  let { title = "Ask AI", context, messages = $bindable(), onclose, onclear }: Props = $props();
  let input = $state("");
  let isLoading = $state(false);
  let isStreaming = $state(false);
  let messagesEl = $state<HTMLDivElement>();
  let panelEl = $state<HTMLDivElement>();
  let inputEl = $state<HTMLInputElement>();
  let abortController: AbortController | null = null;
  let userScrolledUp = false;
  let scrollRafId: number | null = null;
  let isResizing = $state(false);

  let resizeCleanup: (() => void) | null = null;

  const MIN_W = 320;
  const MIN_H = 400;
  const MAX_W = 640;
  const MAX_H = 800;

  const hasUserMessage = $derived(messages.some(m => m.role === "user"));
  const canClear = $derived(messages.length > 1);
  const initialSuggestions = $derived(getSuggestions(context));
  const contextLabel = $derived.by(() => {
    if (!context || context.page === "home")
      return undefined;
    return context.title;
  });

  const isDesktop = new MediaQuery("min-width: 769px");

  $effect(() => {
    if (isDesktop.current)
      inputEl?.focus();
  });

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (messagesEl)
        messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function scheduleScroll() {
    if (userScrolledUp || scrollRafId)
      return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null;
      if (messagesEl && !userScrolledUp)
        messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function handleMessagesScroll() {
    if (!isStreaming)
      return;
    const el = messagesEl!;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledUp = !isNearBottom;
  }

  function handleClose() {
    abortController?.abort();
    onclose();
  }

  function handleClear() {
    abortController?.abort();
    abortController = null;
    isLoading = false;
    isStreaming = false;
    userScrolledUp = false;
    input = "";
    if (onclear) {
      onclear();
    }
    else {
      messages.length = 0;
      messages.push({ role: "assistant", content: getGreeting(context) });
    }
    requestAnimationFrame(() => inputEl?.focus());
  }

  function handleStop() {
    abortController?.abort();
  }

  function retryLast() {
    const lastUserIndex = messages.findLastIndex(m => m.role === "user");
    if (lastUserIndex === -1)
      return;
    const text = messages[lastUserIndex].content;
    messages.pop();
    messages.splice(lastUserIndex, 1);
    sendMessage(text);
  }

  function fillInput(text: string) {
    input = text;
    requestAnimationFrame(() => {
      inputEl?.focus();
      inputEl?.setSelectionRange(text.length, text.length);
    });
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading)
      return;

    input = "";
    messages.push({ role: "user", content: text.trim() });
    scrollToBottom();

    isLoading = true;
    isStreaming = false;
    userScrolledUp = false;
    abortController = new AbortController();

    const assistantIndex = messages.length;
    messages.push({ role: "assistant", content: "" });

    try {
      const history = messages.slice(1, -2);
      await streamChatMessage(
        text.trim(),
        history,
        {
          onDelta(chunk) {
            if (!isStreaming)
              isStreaming = true;
            messages[assistantIndex].content += chunk;
            scheduleScroll();
          },
          onDone({ reply, suggestions }) {
            messages[assistantIndex].content = reply;
            messages[assistantIndex].suggestions = suggestions;
            isStreaming = false;
          },
          onError(msg, opts) {
            if (messages[assistantIndex].content) {
              messages[assistantIndex].error = "Connection interrupted.";
            }
            else if (opts?.status === 429 && opts.retryAfter) {
              const minutes = Math.ceil(opts.retryAfter / 60);
              messages[assistantIndex].error = `Rate limit reached. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
            }
            else {
              messages[assistantIndex].error = msg;
            }
            isStreaming = false;
          },
        },
        abortController.signal,
        context,
      );
    }
    catch {
      if (!messages[assistantIndex].content)
        messages[assistantIndex].error = "Something went wrong. Try again.";
    }
    finally {
      abortController = null;
      isLoading = false;
      isStreaming = false;
      scrollToBottom();
    }
  }

  async function send() {
    await sendMessage(input);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  $effect(() => {
    return () => resizeCleanup?.();
  });

  function startResize(e: PointerEvent) {
    e.preventDefault();
    isResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelEl!.offsetWidth;
    const startH = panelEl!.offsetHeight;

    function onMove(ev: PointerEvent) {
      const dw = Math.round(startX - ev.clientX);
      const dh = Math.round(startY - ev.clientY);
      panelEl!.style.width = `${Math.min(MAX_W, Math.max(MIN_W, startW + dw))}px`;
      panelEl!.style.height = `${Math.min(MAX_H, Math.max(MIN_H, startH + dh))}px`;
    }

    function onUp() {
      isResizing = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      resizeCleanup = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    resizeCleanup = onUp;
  }

  function handlePanelKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  }
</script>

<div class="panel noise-overlay" class:panel--resizing={isResizing} bind:this={panelEl} role="dialog" aria-label="Chat with AI assistant" tabindex="-1" onkeydown={handlePanelKeydown} style="--noise-opacity: 0.15">
  <div class="panel__resize" aria-hidden="true" onpointerdown={startResize}>
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <line x1="0" y1="8" x2="8" y2="0" />
      <line x1="0" y1="4" x2="4" y2="0" />
    </svg>
  </div>
  <header class="panel__header">
    <h3 class="panel__title">{title}</h3>
    <div class="panel__actions">
      {#if canClear}
        <button class="panel__action" onclick={handleClear} aria-label="Clear chat">
          <RotateCcw size={14} strokeWidth={2} />
        </button>
      {/if}
      <button class="panel__action" onclick={handleClose} aria-label="Close chat">
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  </header>

  {#if contextLabel}
    <div class="panel__context">
      <FileText size={11} strokeWidth={2} />
      <span class="panel__context-label">Reading: {contextLabel}</span>
    </div>
  {/if}

  <div class="panel__messages" bind:this={messagesEl} role="log" aria-live="polite" aria-label="Chat messages" data-lenis-prevent onscroll={handleMessagesScroll}>
    {#each messages as message, i}
      <ChatMessage
        role={message.role}
        content={message.content}
        error={message.error}
        streaming={isStreaming && i === messages.length - 1 && message.role === "assistant"}
        loading={isLoading && !isStreaming && i === messages.length - 1 && message.role === "assistant"}
        onretry={message.error && i === messages.length - 1 ? retryLast : undefined}
      />
      {#if message.role === "assistant" && message.suggestions?.length && i === messages.length - 1 && !isLoading}
        <ChatSuggestions suggestions={message.suggestions} onsend={fillInput} variant="followup" />
      {/if}
    {/each}
    {#if !hasUserMessage && !isLoading && !input.trim()}
      <ChatSuggestions suggestions={initialSuggestions} onsend={fillInput} />
    {/if}
  </div>

  <div class="panel__footer">
    <p class="panel__disclaimer">AI-generated responses may not be fully accurate.</p>

    <form class="panel__input" onsubmit={(e) => {
      e.preventDefault();
      send();
    }}>
      <input
        type="text"
        class="panel__field"
        placeholder="Ask a question..."
        aria-label="Type your message"
        maxlength={500}
        bind:this={inputEl}
        bind:value={input}
        onkeydown={handleKeydown}
      />
      {#if isLoading}
        <button
          type="button"
          class="panel__stop"
          onclick={handleStop}
          aria-label="Stop generating"
        >
          <Square size={12} strokeWidth={0} fill="currentColor" />
        </button>
      {:else}
        <button
          type="submit"
          class="panel__send"
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      {/if}
    </form>
  </div>
</div>

<style>
  .panel {
    width: 520px;
    height: 520px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 92%, var(--fg)) 0%,
      var(--bg) 100%
    );
    border: 1px solid var(--border-color);
    border-radius: 1rem;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 24px 64px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 color-mix(in srgb, var(--bg) 80%, #fff);
    overflow: hidden;
    position: relative;
  }

  .panel--resizing {
    user-select: none;
  }

  .panel__resize {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    z-index: 10;
    cursor: nwse-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .panel:hover .panel__resize,
  .panel--resizing .panel__resize {
    opacity: 0.35;
  }

  .panel:hover .panel__resize:hover,
  .panel--resizing .panel__resize:hover {
    opacity: 0.6;
  }

  .panel__resize svg {
    width: 8px;
    height: 8px;
  }

  .panel__resize line {
    stroke: var(--fg-muted);
    stroke-width: 1.25;
  }

  .panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.75rem 0.75rem 1rem;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 85%, var(--fg)) 0%,
      color-mix(in srgb, var(--bg) 95%, var(--fg)) 100%
    );
    border-bottom: 1px solid var(--border-color);
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--fg) 3%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--bg) 60%, #fff);
    position: relative;
    z-index: 1;
  }

  .panel__title {
    font-family: var(--font-mono);
    font-size: var(--fs-xs);
    font-weight: 500;
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-muted);
  }

  .panel__actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .panel__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid var(--border-color);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 90%, var(--fg)) 0%,
      var(--bg) 100%
    );
    color: var(--fg-subtle);
    border-radius: 6px;
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--fg) 5%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--bg) 50%, #fff);
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .panel__action:hover {
    color: var(--fg);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  .panel__context {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 1rem;
    border-bottom: 1px solid var(--border-color);
    background: color-mix(in srgb, var(--bg) 94%, var(--fg));
    color: var(--fg-subtle);
    position: relative;
    z-index: 1;
  }

  .panel__context :global(svg) {
    flex-shrink: 0;
    opacity: 0.6;
  }

  .panel__context-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .panel__messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem;
    position: relative;
    z-index: 1;
  }

  .panel__footer {
    position: relative;
    z-index: 1;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 95%, var(--fg)) 0%,
      color-mix(in srgb, var(--bg) 88%, var(--fg)) 100%
    );
  }

  .panel__disclaimer {
    padding: 0.5rem 1rem 0;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.01em;
    color: var(--fg-subtle);
    text-align: center;
  }

  .panel__input {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem 0.75rem;
  }

  .panel__field {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    background: linear-gradient(
      180deg,
      var(--bg) 0%,
      color-mix(in srgb, var(--bg) 97%, var(--fg)) 100%
    );
    color: var(--fg);
    font-family: var(--font-sans);
    font-size: var(--fs-small);
    outline: none;
    box-shadow:
      inset 0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent),
      0 1px 0 color-mix(in srgb, var(--bg) 50%, #fff);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }

  .panel__field::placeholder {
    color: var(--fg-subtle);
  }

  .panel__field:focus {
    border-color: color-mix(in srgb, var(--fg) 25%, var(--border-color));
  }

  .panel__send {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid color-mix(in srgb, var(--success) 25%, var(--border-color));
    border-radius: 50%;
    background: linear-gradient(
      180deg,
      var(--success) 0%,
      var(--success-dark) 100%
    );
    color: #fff;
    flex-shrink: 0;
    box-shadow:
      0 1px 3px color-mix(in srgb, var(--success) 20%, transparent),
      inset 0 1px 0 color-mix(in srgb, #fff 12%, transparent);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
  }

  .panel__send:hover:not(:disabled) {
    transform: scale(1.08);
    background: linear-gradient(
      180deg,
      #43a878 0%,
      var(--success) 100%
    );
    box-shadow:
      0 2px 6px color-mix(in srgb, var(--success) 25%, transparent),
      inset 0 1px 0 color-mix(in srgb, #fff 15%, transparent);
  }

  .panel__send:disabled {
    opacity: 0.3;
  }

  .panel__stop {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--border-color);
    border-radius: 50%;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg) 90%, var(--fg)) 0%,
      var(--bg) 100%
    );
    color: var(--fg-muted);
    flex-shrink: 0;
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--fg) 5%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--bg) 50%, #fff);
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .panel__stop:hover {
    color: var(--fg);
    border-color: color-mix(in srgb, var(--fg) 20%, var(--border-color));
  }

  @media (prefers-reduced-motion: reduce) {
    .panel__resize,
    .panel__action,
    .panel__field,
    .panel__send,
    .panel__stop {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .panel {
      --noise-opacity: 0.08;
    }

    .panel__field {
      font-size: 1rem; /* 16px — prevents iOS Safari auto-zoom */
    }
  }

  @media (max-width: 480px) {
    .panel {
      width: calc(100vw - 2rem);
      height: calc(100svh - 6rem);
      max-height: 520px;
    }

    .panel__resize {
      display: none;
    }
  }
</style>
