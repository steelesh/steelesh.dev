import { buildFeed } from "$lib/feed";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return new Response(buildFeed().rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
