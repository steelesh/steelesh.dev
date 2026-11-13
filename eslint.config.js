import antfu from "@antfu/eslint-config";

export default antfu({
  svelte: true,
  pnpm: false,
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
  ignores: [".pnpm-store/*"],
}, {
  rules: {
    "node/prefer-global/process": "off",
    "node/no-process-env": "error",
    "ts/no-redeclare": "off",
    "ts/consistent-type-definitions": ["error", "interface"],
    "no-console": ["warn"],
    "antfu/no-top-level-await": ["off"],
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
        ignore: ["README.md"],
      },
    ],
  },
}, {
  files: ["**/*.{js,ts,jsx,tsx,mjs,cjs,svelte}"],
  rules: {
    "perfectionist/sort-imports": [
      "error",
      {
        tsconfig: { rootDir: "." },
      },
    ],
  },
});
