import { HTTPException } from "hono/http-exception";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 100;

export function validateSlug(slug: string): void {
  if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    throw new HTTPException(400, { message: "Invalid slug." });
  }
}

export { MAX_SLUG_LENGTH, SLUG_PATTERN };
