import { transformerMetaHighlight, transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight } from "@shikijs/transformers";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { toString } from "hast-util-to-string";
import { mdsvex } from "mdsvex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import remarkFootnotes from "remark-footnotes";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import { createHighlighter } from "shiki";
import { visit } from "unist-util-visit";

function rehypeTaskListLabel() {
  return (tree) => {
    visit(tree, "element", (node, _index, parent) => {
      if (
        node.tagName === "input"
        && node.properties?.type === "checkbox"
        && parent?.tagName === "li"
      ) {
        const label = toString(parent).trim() || "Task item";
        node.properties["aria-label"] = label;
      }
    });
  };
}

const highlighter = await createHighlighter({
  themes: ["vesper"],
  langs: [
    "typescript",
    "javascript",
    "jsx",
    "tsx",
    "html",
    "css",
    "json",
    "yaml",
    "bash",
    "sql",
    "go",
    "rust",
    "python",
    "svelte",
    "markdown",
    "text",
  ],
});

const config = {
  extensions: [".svelte", ".svx"],
  preprocess: [
    mdsvex({
      extensions: [".svx"],
      remarkPlugins: [
        remarkGfm,
        [remarkFootnotes, { inlineNotes: true }],
        [remarkSmartypants, { dashes: "oldschool" }],
      ],
      rehypePlugins: [
        rehypeTaskListLabel,
        rehypeSlug,
        [rehypeAutolinkHeadings, {
          behavior: "prepend",
          properties: { class: "heading-anchor", ariaHidden: "true", tabIndex: -1 },
          content: { type: "text", value: "#" },
        }],
        [rehypeExternalLinks, {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
          content: { type: "element", tagName: "span", properties: { class: "sr-only" }, children: [{ type: "text", value: " (opens in new tab)" }] },
          contentProperties: { class: "external-link-indicator" },
        }],
      ],
      highlight: {
        highlighter: async (code, lang, meta) => {
          let html = highlighter.codeToHtml(code, {
            lang: lang || "text",
            themes: { light: "vesper", dark: "vesper" },
            defaultColor: false,
            meta: meta ? { __raw: meta } : undefined,
            transformers: [
              transformerNotationDiff(),
              transformerNotationHighlight(),
              transformerNotationFocus(),
              transformerNotationErrorLevel(),
              transformerMetaHighlight(),
            ],
          });
          html = html
            .replace(/tabindex="0"/g, "")
            .replace(/\{/g, "&#123;")
            .replace(/\}/g, "&#125;");
          const regionLabel = lang ? `${lang} code` : "code";
          html = html.replace(/<pre /, `<pre tabindex="0" role="region" aria-label="${regionLabel}" `);
          const label = lang
            ? `<span class="code-block__lang">${lang}</span>`
            : "";
          const copyBtn = `<button class="code-block__copy" aria-label="Copy code"><svg class="code-block__copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="code-block__check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button>`;
          return `<div class="code-block">${label}${copyBtn}<!-- svelte-ignore a11y_no_noninteractive_tabindex -->${html}</div>`;
        },
      },
    }),
    vitePreprocess(),
  ],
  kit: {
    adapter: adapter({
      precompress: true,
    }),
    prerender: {
      handleUnseenRoutes: "warn",
    },
    alias: {
      $components: "src/components",
      $styles: "src/styles",
      $lib: "src/lib",
    },
  },
};

export default config;
