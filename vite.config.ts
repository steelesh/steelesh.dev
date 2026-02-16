import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { pagefind } from "vite-plugin-pagefind";

import pkg from "./package.json";

export default defineConfig({
  plugins: [enhancedImages(), sveltekit(), pagefind({ assetsDirectory: "static" })],
  define: {
    app_version: `"${pkg.version}"`,
  },
});
