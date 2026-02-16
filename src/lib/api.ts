import type { ChatContext } from "$lib/types";

import { apiUrl as API_BASE } from "$lib/config";

const STREAM_TIMEOUT_MS = 60_000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: (data: { reply: string; suggestions: string[] }) => void;
  onError: (message: string, opts?: { status?: number; retryAfter?: number }) => void;
}

export async function streamChatMessage(
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  context?: ChatContext,
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const body: Record<string, unknown> = { message, history };
    if (context)
      body.context = context;

    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const detail = (errBody as { error?: string })?.error || `Request failed (${response.status})`;
      const retryAfter = response.headers.get("Retry-After");
      callbacks.onError(detail, {
        status: response.status,
        retryAfter: retryAfter ? Number(retryAfter) : undefined,
      });
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        let eventType = "";
        let dataStr = "";

        for (const line of block.split("\n")) {
          if (line.startsWith("event: "))
            eventType = line.slice(7);
          else if (line.startsWith("data: "))
            dataStr = line.slice(6);
        }

        if (eventType && dataStr) {
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(dataStr);
          }
          catch {
            callbacks.onError("Received malformed data from server.");
            continue;
          }
          if (eventType === "delta")
            callbacks.onDelta(data.text as string);
          else if (eventType === "done")
            callbacks.onDone(data as unknown as { reply: string; suggestions: string[] });
          else if (eventType === "error")
            callbacks.onError(data.message as string);
        }

        boundary = buffer.indexOf("\n\n");
      }
    }
  }
  catch (err) {
    if (err instanceof DOMException && err.name === "AbortError")
      return;
    callbacks.onError("Connection lost. Please try again.");
  }
  finally {
    clearTimeout(timeoutId);
  }
}

export async function getStatsBatch(
  slugs: string[],
): Promise<Record<string, { views: number; likes: number }>> {
  if (slugs.length === 0)
    return {};
  try {
    const response = await fetch(`${API_BASE}/stats/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    });
    if (!response.ok)
      throw new Error(`${response.status}`);
    const data = await response.json() as { stats: Record<string, { views: number; likes: number }> };
    return data.stats;
  }
  catch (err) {
    if (err instanceof TypeError)
      return {};
    const result: Record<string, { views: number; likes: number }> = {};
    const results = await Promise.allSettled(
      slugs.map(async (slug) => {
        const [v, l] = await Promise.all([getViewCount(slug), getLikeCount(slug)]);
        return { slug, views: v.count, likes: l.count };
      }),
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        result[r.value.slug] = { views: r.value.views, likes: r.value.likes };
      }
    }
    return result;
  }
}

export async function getLikeCount(slug: string): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE}/likes/${slug}`);
  if (!response.ok)
    return { count: 0 };
  return response.json().catch(() => ({ count: 0 })) as Promise<{ count: number }>;
}

export async function postLike(slug: string): Promise<{ count: number; liked: boolean }> {
  const response = await fetch(`${API_BASE}/likes/${slug}`, { method: "POST" });
  if (!response.ok)
    return { count: 0, liked: false };
  return response.json().catch(() => ({ count: 0, liked: false })) as Promise<{ count: number; liked: boolean }>;
}

export async function recordView(slug: string): Promise<void> {
  fetch(`${API_BASE}/views/${slug}`, { method: "POST" }).catch(() => {});
}

export async function getViewCount(slug: string): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE}/views/${slug}`);
  if (!response.ok)
    return { count: 0 };
  return response.json().catch(() => ({ count: 0 })) as Promise<{ count: number }>;
}
