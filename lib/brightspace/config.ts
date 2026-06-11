/* Brightspace configuration health — booleans only, never values.
   Ported from learning-hub lib/brightspace/config.ts, trimmed to the
   credentials this admin tool actually supports. */

export type BrightspaceAuthMode = "oauth" | "token" | "unconfigured";

export type BrightspaceConfigHealth = {
  baseUrl: boolean;
  clientId: boolean;
  clientSecret: boolean;
  accessToken: boolean;
};

export function getBrightspaceConfigHealth(): BrightspaceConfigHealth {
  return {
    baseUrl: Boolean(process.env.BRIGHTSPACE_BASE_URL),
    clientId: Boolean(process.env.BRIGHTSPACE_CLIENT_ID),
    clientSecret: Boolean(process.env.BRIGHTSPACE_CLIENT_SECRET),
    accessToken: Boolean(process.env.BRIGHTSPACE_ACCESS_TOKEN),
  };
}

/* A usable live connection needs the base URL plus some credential. The
   service-user client-credentials flow is a later milestone; today a long
   lived access token is the only way to reach the live API. */
export function getBrightspaceAuthMode(
  config: BrightspaceConfigHealth = getBrightspaceConfigHealth(),
): BrightspaceAuthMode {
  if (!config.baseUrl) return "unconfigured";
  if (config.accessToken) return "token";
  if (config.clientId && config.clientSecret) return "oauth";
  return "unconfigured";
}

export function isBrightspaceLive(): boolean {
  /* Only "token" mode can make live calls in this milestone; "oauth" means
     credentials exist but the client-credentials flow isn't built yet. */
  return getBrightspaceAuthMode() === "token";
}
