import type { SSEStreamingApi } from "hono/streaming";

import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { HTTPException } from "hono/http-exception";

import type { ChatContext, ChatMessage } from "../types.js";

import { getAdditionalContext, getContentBody } from "./content-registry.js";
import { SYSTEM_PROMPT } from "./context.js";

const MAX_HISTORY = 10;
const SUGGESTION_PATTERN = /^\[Q\] (.+)$/;

let cachedClient: Anthropic | null = null;
let cachedKey: string | null = null;

function getClient(apiKey: string): Anthropic {
  if (cachedClient && cachedKey === apiKey)
    return cachedClient;
  cachedClient = new Anthropic({ apiKey });
  cachedKey = apiKey;
  return cachedClient;
}

function parseResponse(text: string): { reply: string; suggestions: string[] } {
  const lines = text.split("\n");
  const suggestions: string[] = [];
  const replyLines: string[] = [];

  for (const line of lines) {
    const match = line.match(SUGGESTION_PATTERN);
    if (match) {
      suggestions.push(match[1]);
    }
    else {
      replyLines.push(line);
    }
  }

  const reply = replyLines.join("\n").replace(/\n+$/, "");
  return { reply, suggestions };
}

function mapApiError(err: APIError): string {
  if (err.status === 429)
    return "The AI service is temporarily overloaded. Please try again in a moment.";
  if (err.status === 401)
    return "The AI service is misconfigured.";
  return "The AI service returned an error. Please try again.";
}

function buildMessages(message: string, history: ChatMessage[], context?: ChatContext) {
  const trimmedHistory = history.slice(-MAX_HISTORY);

  let systemPrompt = SYSTEM_PROMPT;

  const additionalContext = getAdditionalContext();
  if (additionalContext)
    systemPrompt += `\n\n## Additional Context\n\n${additionalContext}`;

  if (context?.page && context.page !== "home") {
    const pageLabel
      = context.page === "case-study"
        ? "Case Study"
        : context.page === "post"
          ? "Blog Post"
          : context.page === "project"
            ? "Project"
            : context.page === "experience"
              ? "Experience"
              : "Page";

    let pageContext = "";
    if (context.title)
      pageContext += `The user is currently viewing: [${pageLabel}] ${context.title}`;

    const body = getContentBody(context.page, context.slug);
    if (body)
      pageContext += `\n\n### Content\n\n${body}`;

    if (pageContext)
      systemPrompt += `\n\n## Current Page Context\n\n${pageContext}`;
  }

  const messages = [
    ...trimmedHistory.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  return { systemPrompt, messages };
}

export async function getChatResponse(
  apiKey: string,
  message: string,
  history: ChatMessage[] = [],
  context?: ChatContext,
): Promise<{ reply: string; suggestions: string[] }> {
  const client = getClient(apiKey);
  const { systemPrompt, messages } = buildMessages(message, history, context);

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find(b => b.type === "text");
    const raw = textBlock?.text ?? "Sorry, I couldn't generate a response.";
    return parseResponse(raw);
  }
  catch (err) {
    if (err instanceof APIError) {
      console.error(JSON.stringify({
        level: "error",
        source: "anthropic",
        status: err.status,
        message: err.message,
      }));
      throw new HTTPException(
        err.status === 429 ? 503 : err.status === 401 ? 500 : 502,
        { message: mapApiError(err) },
      );
    }
    throw err;
  }
}

export async function streamChatResponse(
  apiKey: string,
  sseStream: SSEStreamingApi,
  message: string,
  history: ChatMessage[] = [],
  context?: ChatContext,
): Promise<void> {
  const client = getClient(apiKey);
  const { systemPrompt, messages } = buildMessages(message, history, context);

  const anthropicStream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  sseStream.onAbort(() => {
    anthropicStream.controller.abort();
  });

  let fullText = "";

  try {
    anthropicStream.on("text", async (delta) => {
      fullText += delta;
      await sseStream.writeSSE({ event: "delta", data: JSON.stringify({ text: delta }) });
    });

    await anthropicStream.finalMessage();

    const { reply, suggestions } = parseResponse(fullText);
    await sseStream.writeSSE({ event: "done", data: JSON.stringify({ reply, suggestions }) });
  }
  catch (err) {
    if (sseStream.aborted)
      return;

    const errorMsg = err instanceof APIError ? mapApiError(err) : "Something went wrong.";

    if (err instanceof APIError) {
      console.error(JSON.stringify({
        level: "error",
        source: "anthropic",
        status: err.status,
        message: err.message,
      }));
    }

    await sseStream.writeSSE({ event: "error", data: JSON.stringify({ message: errorMsg }) }).catch(() => {});
  }
}
