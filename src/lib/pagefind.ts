import type { Pagefind } from "vite-plugin-pagefind/types";

import { browser } from "$app/environment";

let pagefind: Pagefind | undefined;
let unavailable = false;

export async function getPagefind(): Promise<Pagefind | undefined> {
  if (pagefind)
    return pagefind;
  if (unavailable || !browser)
    return undefined;
  try {
    // @ts-expect-error — generated post-build
    pagefind = await import("/pagefind/pagefind.js");
    await pagefind!.init();
    return pagefind;
  }
  catch {
    unavailable = true;
    return undefined;
  }
}

export function isPagefindUnavailable() {
  return unavailable;
}
