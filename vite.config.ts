import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

import markdown from "./markdown.config.ts";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: [".svelte", ".svx"],
      preprocess: [
        markdown,
        vitePreprocess(),
      ],
      adapter: adapter({ precompress: true }),
      prerender: {
        handleUnseenRoutes({ routes, message }) {
          if (routes.some(route => route !== "/w/[slug]"))
            throw new Error(message);
        },
      },
    }),
  ],
  define: {
    app_version: JSON.stringify(pkg.version),
  },
});
