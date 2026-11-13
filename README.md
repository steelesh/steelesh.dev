# steelesh.dev

Personal site at [steelesh.dev](https://steelesh.dev), built with SvelteKit 3, Svelte 5, TypeScript, and mdsvex. GitHub Pages serves the static output.

## Development

Use the Node 26 LTS version in `.node-version` and the pnpm version in `package.json`. With mise installed:

```sh
mise install node@26.13.1 pnpm@12.18.0
pnpm install
pnpm dev
```

Vite prints the local URL. Draft posts appear in development. Set `VITE_SHOW_DRAFTS=false` to hide them locally.

## Checks

Install the test browsers once, and again after a Playwright upgrade:

```sh
pnpm exec playwright install chromium webkit
pnpm verify
```

`verify` runs lint, type checking, the production build, and browser tests. `pnpm test` expects an existing build. Tests start their own production preview on port 4173 and draft server on port 5174, so keep those ports free.

The suite checks light and dark themes, desktop Chromium, mobile WebKit, automated WCAG rules, metadata, draft exclusion from routes and feeds, storage failures, JavaScript-free navigation, and code copying. Writing tests use the two example drafts as fixtures. Automated checks do not establish full accessibility conformance.

Other commands:

| Command            | Purpose                                 |
| ------------------ | --------------------------------------- |
| `pnpm lint:fix`    | Apply ESLint formatting and safe fixes  |
| `pnpm check:watch` | Watch Svelte and TypeScript diagnostics |
| `pnpm build`       | Generate the site in `build/`           |
| `pnpm preview`     | Serve the production build locally      |
| `pnpm test:a11y`   | Run the production accessibility tests  |
| `pnpm audit`       | Review dependency advisories            |

## Writing

Add an `.svx` file under `src/content/writing/`, then add its metadata to `src/lib/data/content.ts`. The filename must match `slug`; the public URL is `/w/<slug>`. Use `YYYY-MM-DD` for dates. Set `draft: true` until ready to publish. `minimal: true` gives short notes a visually hidden title; longer posts display their title, subtitle, and date.

Production excludes draft routes and feed entries. Drafts are not private: source files are in the public repository and may be included in generated JavaScript chunks. Keep private writing outside this repo.

`markdown.config.ts` configures Markdown, heading links, task labels, external links, smart punctuation, and Shiki highlighting. The approved language list lives there. Code blocks have keyboard scrolling and a copy button with success and failure feedback.

The accessibility statement is `src/content/accessibility.svx`. Site metadata lives in `src/lib/config.ts`; content metadata and canonical URLs use the public origin even in local previews.

## Maintenance and deployment

SvelteKit configuration lives in `vite.config.ts`. Package subpath imports (`#lib`, `#components`, and `#styles`) are declared in `package.json`. pnpm settings and dependency build permissions live in `pnpm-workspace.yaml`.

Dependabot opens weekly package and GitHub Actions updates. Actions are pinned to full commit hashes. TypeScript stays on 6.x while SvelteKit and svelte-check require it; revisit their peer ranges before a major upgrade.

The `oxfmt>tinypool` override keeps the formatter on a patched worker pool until its dependency pin changes. Remove it once upstream resolves to tinypool 2.1.2 or newer without the override.

The full audit still reports three tooling advisories: [KaTeX](https://github.com/advisories/GHSA-238p-pmpm-9mq7) through the Markdown linter, [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249) through ESLint, and [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) through the Svelte Vite plugin. KaTeX and minimatch fixes are outside their parents' current version ranges; deepmerge has no published fix. These packages are used by local and CI tooling, not the deployed static site. Keep these findings visible with `pnpm audit`; CI rejects high and critical findings.

For routine compatible updates:

```sh
pnpm update --depth Infinity
pnpm exec playwright install chromium webkit
pnpm verify
pnpm audit
```

For a major upgrade, review the package's migration guide and peer dependencies first. Commit the changed manifest and lockfile together. Keep `.node-version` and the Node engine range aligned when updating Node.

Pull requests run lint, types, build, browser tests, and commit-message validation. Pushes to `main` run the same checks before deploying to GitHub Pages. Failed test runs upload traces and screenshots. Release Please manages version and changelog pull requests. Local Husky hooks run lint and validate conventional commit messages.

The site has no application server in production. `static/_headers` is a legacy header policy for hosts that support that format; GitHub Pages does not apply it.

## Licensing

Code is licensed under [MIT](LICENSE). Original words and images are licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Third-party assets and fonts retain their respective licenses.
