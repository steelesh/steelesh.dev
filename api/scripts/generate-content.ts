import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const API = resolve(import.meta.dirname, "..");
const OUTPUT = join(API, "src/services/content-registry.ts");

const CATEGORY_DIRS: Record<string, string> = {
  "project": "projects",
  "case-study": "case-studies",
  "post": "posts",
};

function stripForAI(raw: string): string {
  return (
    raw
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^\[\^\d+\]:.*$/gm, "")
      .replace(/\[\^\d+\]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function readSvxEntries(): [string, string][] {
  const entries: [string, string][] = [];

  for (const [category, dir] of Object.entries(CATEGORY_DIRS)) {
    const fullDir = join(ROOT, "src/content", dir);
    if (!existsSync(fullDir))
      continue;

    const files = readdirSync(fullDir).filter(f => f.endsWith(".svx"));
    for (const file of files) {
      const slug = basename(file, ".svx");
      const raw = readFileSync(join(fullDir, file), "utf-8");
      entries.push([`${category}:${slug}`, stripForAI(raw)]);
    }
  }

  return entries;
}

function readExperienceSlugs(): Set<string> {
  const file = join(ROOT, "src/lib/data/experience.ts");
  const raw = readFileSync(file, "utf-8");
  const matches = [...raw.matchAll(/slug:\s*"([^"]+)"/g)];
  return new Set(matches.map(m => m[1]));
}

function readExperienceEntries(validSlugs: Set<string>): [string, string][] {
  const dir = join(API, "knowledge/experience");
  if (!existsSync(dir))
    return [];

  const entries: [string, string][] = [];
  const files = readdirSync(dir).filter(f => f.endsWith(".md"));

  for (const file of files) {
    const slug = basename(file, ".md");
    if (!validSlugs.has(slug)) {
      console.warn(`Skipping ${file} — no matching slug in experience.ts`);
      continue;
    }
    const content = readFileSync(join(dir, file), "utf-8").trim();
    if (content) {
      entries.push([`experience:${slug}`, content]);
    }
  }

  return entries;
}

function readAdditionalContext(): string {
  const dir = join(API, "knowledge/context");
  if (!existsSync(dir))
    return "";

  const files = readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .sort();

  if (files.length === 0)
    return "";

  const sections: string[] = [];
  for (const file of files) {
    const content = readFileSync(join(dir, file), "utf-8").trim();
    if (content) {
      sections.push(content);
    }
  }

  return sections.join("\n\n");
}

const svxEntries = readSvxEntries();
const experienceSlugs = readExperienceSlugs();
const experienceEntries = readExperienceEntries(experienceSlugs);
const additionalContext = readAdditionalContext();

const allEntries = [...svxEntries, ...experienceEntries].sort(([a], [b]) =>
  a.localeCompare(b),
);

const mapLines = allEntries
  .map(([key, value]) => `  [${JSON.stringify(key)}, ${JSON.stringify(value)}],`)
  .join("\n");

const output = `const CONTENT_MAP = new Map<string, string>([
${mapLines}
]);

const ADDITIONAL_CONTEXT = ${JSON.stringify(additionalContext)};

export function getContentBody(page: string, slug?: string): string | undefined {
  if (!slug)
    return undefined;
  return CONTENT_MAP.get(\`\${page}:\${slug}\`);
}

export function getAdditionalContext(): string {
  return ADDITIONAL_CONTEXT;
}
`;

writeFileSync(OUTPUT, output);

// eslint-disable-next-line no-console
console.log(
  `Generated ${OUTPUT} — ${allEntries.length} entries, ${additionalContext ? "with" : "no"} additional context`,
);
