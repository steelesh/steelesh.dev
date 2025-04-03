import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import pkg from "./package.json";

export default defineConfig({
  plugins: [enhancedImages(), sveltekit()],
  define: {
    app_version: `"${pkg.version}"`,
  },
});
