import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";

import type { AppEnv } from "./types.js";

import { chat } from "./routes/chat.js";
import { health } from "./routes/health.js";
import { likes } from "./routes/likes.js";
import { og } from "./routes/og.js";
import { stats } from "./routes/stats.js";
import { views } from "./routes/views.js";

const app = new Hono<AppEnv>();

app.use("*", requestId());

app.use("*", logger((message: string) => {
  // eslint-disable-next-line no-console -- structured logging via Hono logger middleware
  console.log(JSON.stringify({ level: "info", message }));
}));

app.use("*", secureHeaders());

app.use("*", (c, next) => {
  const allowed = c.env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
  return cors({ origin: allowed })(c, next);
});

app.post(
  "/chat",
  bodyLimit({
    maxSize: 10 * 1024,
    onError: () => {
      throw new HTTPException(413, { message: "Request body must be under 10 KB." });
    },
  }),
);

app.post(
  "/chat/stream",
  bodyLimit({
    maxSize: 10 * 1024,
    onError: () => {
      throw new HTTPException(413, { message: "Request body must be under 10 KB." });
    },
  }),
);

app.post(
  "/stats/*",
  bodyLimit({
    maxSize: 10 * 1024,
    onError: () => {
      throw new HTTPException(413, { message: "Request body must be under 10 KB." });
    },
  }),
);

app.use("/chat", async (c, next) => {
  if (c.req.path === "/chat/stream")
    return next();
  return timeout(25_000, () => new HTTPException(504, { message: "The AI response took too long. Please try again." }))(c, next);
});

app.onError((err, c) => {
  const id = c.get("requestId");

  if (err instanceof HTTPException) {
    return c.json({ error: err.message, requestId: id }, err.status);
  }

  console.error(JSON.stringify({
    level: "error",
    requestId: id,
    message: err.message,
  }));

  return c.json(
    { error: "Something went wrong.", requestId: id },
    500,
  );
});

app.route("/", health);
app.route("/", chat);
app.route("/", likes);
app.route("/", og);
app.route("/", stats);
app.route("/", views);

app.notFound((c) => {
  const id = c.get("requestId");
  return c.json({ error: "Not found", requestId: id }, 404);
});

export default app;
