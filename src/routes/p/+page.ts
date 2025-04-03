import type { Post } from "$lib/types";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("api/p");
  const posts: Post[] = await res.json();

  return { posts };
};
