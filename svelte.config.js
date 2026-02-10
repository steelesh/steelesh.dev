import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: [vitePreprocess()],
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
