import type { Context, Next } from "hono";

import { HTTPException } from "hono/http-exception";

import type { AppEnv } from "../types.js";

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export function createRateLimit(options: RateLimitOptions) {
  return async (c: Context<AppEnv>, next: Next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const key = `${options.keyPrefix}:${ip}`;

    const stored = await c.env.RATE_LIMIT.get(key);

    let data: { count: number; reset: number };
    if (stored) {
      try {
        data = JSON.parse(stored);
      }
      catch {
        data = { count: 0, reset: Date.now() + options.windowMs };
      }
    }
    else {
      data = { count: 0, reset: Date.now() + options.windowMs };
    }

    if (Date.now() > data.reset) {
      data.count = 0;
      data.reset = Date.now() + options.windowMs;
    }

    const remaining = options.maxRequests - data.count;
    const resetSeconds = Math.ceil((data.reset - Date.now()) / 1000);

    if (data.count >= options.maxRequests) {
      const isDev = c.env.ENVIRONMENT === "development";

      if (isDev) {
        console.warn(`[rate-limit] Would block ${ip} — ${data.count}/${options.maxRequests} requests used, resets in ${resetSeconds}s`);
      }
      else {
        c.header("Retry-After", String(resetSeconds));
        c.header("RateLimit-Limit", String(options.maxRequests));
        c.header("RateLimit-Remaining", "0");
        c.header("RateLimit-Reset", String(Math.ceil(data.reset / 1000)));
        const minutes = Math.ceil(resetSeconds / 60);
        throw new HTTPException(429, {
          message: `Rate limit reached. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        });
      }
    }

    data.count++;
    await c.env.RATE_LIMIT.put(key, JSON.stringify(data), {
      expirationTtl: Math.ceil(options.windowMs / 1000),
    });

    c.header("RateLimit-Limit", String(options.maxRequests));
    c.header("RateLimit-Remaining", String(remaining - 1));
    c.header("RateLimit-Reset", String(Math.ceil(data.reset / 1000)));

    await next();
  };
}

export const rateLimit = createRateLimit({
  maxRequests: 20,
  windowMs: 60 * 60 * 1000,
  keyPrefix: "rate",
});

export const likesRateLimit = createRateLimit({
  maxRequests: 60,
  windowMs: 60 * 60 * 1000,
  keyPrefix: "rate-likes",
});
