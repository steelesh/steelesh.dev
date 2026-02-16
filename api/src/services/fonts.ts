const CACHE_PREFIX = "https://steelesh.dev/__og-fonts__/v3";

const GOOGLE_FONTS_CSS = "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Anuphan:wght@400&display=swap";

const SAFARI_UA = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

export interface FontData {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal" | "italic";
}

let fontCache: FontData[] | null = null;

function extractTTFUrl(css: string, family: string): string | null {
  for (const block of css.split("@font-face")) {
    if (!block.includes(`'${family}'`))
      continue;
    const match = block.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/);
    if (match)
      return match[1];
  }
  return null;
}

async function fetchFontBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Font fetch failed: ${url} → ${res.status}`);
  return res.arrayBuffer();
}

export async function loadFonts(): Promise<FontData[]> {
  if (fontCache)
    return fontCache;

  const cache = await caches.open("og-fonts");
  const [serifCached, sansCached] = await Promise.all([
    cache.match(`${CACHE_PREFIX}/serif`),
    cache.match(`${CACHE_PREFIX}/sans`),
  ]);

  if (serifCached && sansCached) {
    fontCache = [
      { name: "Instrument Serif", data: await serifCached.arrayBuffer(), weight: 400, style: "normal" },
      { name: "Anuphan", data: await sansCached.arrayBuffer(), weight: 400, style: "normal" },
    ];
    return fontCache;
  }

  const cssRes = await fetch(GOOGLE_FONTS_CSS, {
    headers: { "User-Agent": SAFARI_UA },
  });
  if (!cssRes.ok)
    throw new Error(`Google Fonts CSS fetch failed: ${cssRes.status}`);

  const css = await cssRes.text();

  const serifUrl = extractTTFUrl(css, "Instrument Serif");
  const sansUrl = extractTTFUrl(css, "Anuphan");

  if (!serifUrl || !sansUrl)
    throw new Error(`Could not extract truetype font URLs. CSS preview: ${css.slice(0, 500)}`);

  const [serifData, sansData] = await Promise.all([
    fetchFontBuffer(serifUrl),
    fetchFontBuffer(sansUrl),
  ]);

  const cacheHeaders = { "Cache-Control": "public, max-age=31536000, immutable" };
  await Promise.all([
    cache.put(`${CACHE_PREFIX}/serif`, new Response(serifData.slice(0), { headers: cacheHeaders })),
    cache.put(`${CACHE_PREFIX}/sans`, new Response(sansData.slice(0), { headers: cacheHeaders })),
  ]);

  fontCache = [
    { name: "Instrument Serif", data: serifData, weight: 400, style: "normal" },
    { name: "Anuphan", data: sansData, weight: 400, style: "normal" },
  ];

  return fontCache;
}
