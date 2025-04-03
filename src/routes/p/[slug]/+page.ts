import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export async function entries() {
  const paths = import.meta.glob("/src/p/*.md", { eager: true });
  return Object.keys(paths).map(path => ({
    slug: path.split("/").at(-1)?.replace(".md", "") || "",
  }));
}

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`../../../p/${params.slug}.md`);

    return {
      content: post.default,
      meta: post.metadata,
    };
  }
  catch {
    throw error(404, `Post not found: ${params.slug}`);
  }
};
