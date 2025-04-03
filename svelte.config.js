import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

/** @type {import("mdsvex").mdsvexOptions} */
const mdsvexOptions = {
  extensions: [".md"],
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".md", ".svelte"],
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  kit: {
    adapter: adapter({
      precompress: true,
    }),
    alias: {
      $components: "src/components",
      $styles: "src/styles",
      $lib: "src/lib",
    },
  },
};

export default config;
