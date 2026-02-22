import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import type { ChatContext, ChatMessage } from "../types.js";

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_LENGTH = 20;
const MAX_HISTORY_CONTENT_LENGTH = 2000;

function isValidRole(role: unknown): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

function isValidHistoryItem(item: unknown): item is ChatMessage {
  if (typeof item !== "object" || item === null)
    return false;
  const obj = item as Record<string, unknown>;
  return (
    isValidRole(obj.role)
    && typeof obj.content === "string"
    && obj.content.length > 0
    && obj.content.length <= MAX_HISTORY_CONTENT_LENGTH
  );
}

export const validateChatBody = validator("json", (value) => {
  const body = value as Record<string, unknown>;

  if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
    throw new HTTPException(400, { message: "\"message\" field is required and must be a non-empty string." });
  }

  if (body.message.length > MAX_MESSAGE_LENGTH) {
    throw new HTTPException(400, { message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
  }

  const history: ChatMessage[] = [];

  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) {
      throw new HTTPException(400, { message: "\"history\" must be an array." });
    }
    if (body.history.length > MAX_HISTORY_LENGTH) {
      throw new HTTPException(400, { message: `History must contain ${MAX_HISTORY_LENGTH} items or fewer.` });
    }
    for (const item of body.history) {
      if (!isValidHistoryItem(item)) {
        throw new HTTPException(400, {
          message: "Each history item must have a valid role (\"user\" | \"assistant\") and a non-empty string content.",
        });
      }
    }
    history.push(...(body.history as ChatMessage[]));
  }

  const VALID_PAGES = new Set(["home", "post", "case-study", "project", "experience"]);
  const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  let context: ChatContext | undefined;

  if (body.context !== undefined) {
    if (typeof body.context === "object" && body.context !== null) {
      const ctx = body.context as Record<string, unknown>;
      if (typeof ctx.page === "string" && VALID_PAGES.has(ctx.page)) {
        const rawTitle = typeof ctx.title === "string" ? ctx.title.slice(0, 200) : undefined;
        const sanitizedTitle = rawTitle?.replace(/[\n\r\t]/g, " ").replace(/[[\]#]/g, "").trim();
        const rawSlug = typeof ctx.slug === "string"
          && ctx.slug.length <= 100
          && VALID_SLUG.test(ctx.slug)
          ? ctx.slug
          : undefined;
        context = {
          page: ctx.page as ChatContext["page"],
          title: sanitizedTitle || undefined,
          slug: rawSlug,
        };
      }
    }
  }

  return { message: body.message as string, history, context };
});
