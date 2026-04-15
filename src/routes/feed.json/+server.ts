import { buildFeed } from "$lib/feed";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return new Response(buildFeed().json1(), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
    },
  });
};
