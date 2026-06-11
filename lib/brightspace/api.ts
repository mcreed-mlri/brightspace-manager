import "server-only";

/* Server-only Brightspace (D2L Valence) fetch helper. Env-token bearer auth
   only for this milestone — the service-user client-credentials flow comes
   later. URL pattern: {base}/d2l/api/{product}/{version}{path} */

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
  const accessToken = process.env.BRIGHTSPACE_ACCESS_TOKEN;

  if (!baseUrl || !accessToken) {
    throw new Error("Missing Brightspace base URL or access token.");
  }

  return fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

/* Convenience builders for the read endpoints this app will grow into.
   Versions are configurable; never assume an endpoint version is final. */
export function lpPath(path: string) {
  return `/d2l/api/lp/${getBrightspaceLpVersion()}${path}`;
}

export function lePath(path: string) {
  return `/d2l/api/le/${getBrightspaceLeVersion()}${path}`;
}
