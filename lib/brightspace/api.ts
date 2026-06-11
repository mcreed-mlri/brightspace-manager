import "server-only";

import { getAccessToken } from "@/lib/brightspace/tokens";

/* Server-only Brightspace (D2L Valence) fetch helper. Auth comes from the
   file-backed OAuth token store (rotating refresh), or a long-lived env
   token override. URL pattern: {base}/d2l/api/{product}/{version}{path} */

export function getBrightspaceBaseUrl() {
  return process.env.BRIGHTSPACE_BASE_URL;
}

export function getBrightspaceLpVersion() {
  return process.env.BRIGHTSPACE_LP_VERSION || "1.49";
}

export function getBrightspaceLeVersion() {
  return process.env.BRIGHTSPACE_LE_VERSION || "1.82";
}

export async function brightspaceApiFetch(path: string) {
  const baseUrl = getBrightspaceBaseUrl();
  if (!baseUrl) {
    throw new Error("Missing BRIGHTSPACE_BASE_URL.");
  }
  const accessToken = await getAccessToken();

  return fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

type PagedResultSet<T> = {
  PagingInfo?: { Bookmark?: string; HasMoreItems?: boolean };
  Items: T[];
};

/* Bookmark-based PagedResultSet pagination (capped, like the admin MCP). */
export async function brightspacePagedGet<T>(basePath: string, maxPages = 50): Promise<T[]> {
  const items: T[] = [];
  let bookmark: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const separator = basePath.includes("?") ? "&" : "?";
    const url = bookmark
      ? `${basePath}${separator}bookmark=${encodeURIComponent(bookmark)}`
      : basePath;
    const response = await brightspaceApiFetch(url);
    if (!response.ok) {
      throw new Error(`Brightspace API responded ${response.status} for ${basePath}.`);
    }
    const json = (await response.json()) as PagedResultSet<T>;
    items.push(...json.Items);
    if (!json.PagingInfo?.HasMoreItems || !json.PagingInfo.Bookmark) break;
    bookmark = json.PagingInfo.Bookmark;
  }

  return items;
}

/* Convenience builders for the read endpoints this app will grow into.
   Versions are configurable; never assume an endpoint version is final. */
export function lpPath(path: string) {
  return `/d2l/api/lp/${getBrightspaceLpVersion()}${path}`;
}

export function lePath(path: string) {
  return `/d2l/api/le/${getBrightspaceLeVersion()}${path}`;
}
