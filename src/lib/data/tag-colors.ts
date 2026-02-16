const tagColors: Record<string, { hue: number; sat: number }> = {
  "Spring Boot": { hue: 120, sat: 55 },
  "AWS": { hue: 35, sat: 80 },
  "TypeScript": { hue: 215, sat: 70 },
  "React": { hue: 195, sat: 80 },
  "CSS": { hue: 240, sat: 60 },
  ".NET": { hue: 265, sat: 55 },
  "WordPress": { hue: 205, sat: 50 },
  "Adobe Creative Cloud": { hue: 0, sat: 70 },
  "Next.js": { hue: 0, sat: 0 },
  "MySQL": { hue: 200, sat: 60 },
  "Redis": { hue: 5, sat: 65 },
  "Azure": { hue: 210, sat: 75 },
  "Go": { hue: 190, sat: 65 },
  "Ollama": { hue: 0, sat: 0 },
  "Cloudflare Workers": { hue: 38, sat: 90 },
  "Hono": { hue: 25, sat: 75 },
  "SvelteKit": { hue: 15, sat: 85 },
  "macOS": { hue: 210, sat: 10 },
  "Productivity": { hue: 160, sat: 50 },
  "Markdown": { hue: 0, sat: 0 },
};

export function getTagColor(tag: string): { hue: number; sat: number } {
  if (tagColors[tag])
    return tagColors[tag];
  let hash = 0;
  for (const ch of tag) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return { hue: Math.abs(hash) % 360, sat: 45 };
}
