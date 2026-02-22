import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

import type { AppEnv } from "../types.js";

import { rateLimit } from "../middleware/rate-limit.js";
import { validateChatBody } from "../middleware/validate-chat.js";
import { getChatResponse, streamChatResponse } from "../services/chat-service.js";

const chat = new Hono<AppEnv>();

chat.post("/chat", rateLimit, validateChatBody, async (c) => {
  const { message, history, context } = c.req.valid("json");
  const { reply, suggestions } = await getChatResponse(c.env.ANTHROPIC_API_KEY, message.trim(), history, context);
  c.header("Cache-Control", "no-store");
  return c.json({ reply, suggestions });
});

chat.post("/chat/stream", rateLimit, validateChatBody, (c) => {
  const { message, history, context } = c.req.valid("json");
  return streamSSE(c, async (stream) => {
    await streamChatResponse(c.env.ANTHROPIC_API_KEY, stream, message.trim(), history, context);
  });
});

export { chat };
