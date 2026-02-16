import type { RequestIdVariables } from "hono/request-id";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  page: "home" | "post" | "case-study" | "project" | "experience";
  title?: string;
  slug?: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: ChatContext;
}

export interface ChatResponse {
  reply: string;
  suggestions: string[];
}

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: string;
  RATE_LIMIT: KVNamespace;
  DB: D1Database;
  IP_HASH_SALT: string;
}

export interface AppEnv {
  Bindings: Env;
  Variables: RequestIdVariables;
}
