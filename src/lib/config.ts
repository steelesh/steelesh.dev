import { dev } from "$app/environment";

export const title = "Steele S.";
export const description
  = "Backend Software engineer building for the web — projects, case studies, and posts on modern web development.";
export const url = dev ? "http://localhost:5173/" : "https://steelesh.dev/";
export const apiUrl = dev ? "http://localhost:8787" : "https://api.steelesh.dev";

export function ogImageUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value)
      searchParams.set(key, value);
  }
  return `${apiUrl}/og?${searchParams.toString()}`;
}
