import "server-only";

import { existsSync } from "fs";
import { promises as fs } from "fs";
import path from "path";

/* File-backed OAuth token store, ported from brightspace-admin-mcp's pattern.
   CRITICAL: Brightspace rotates the refresh token on every refresh — the new
   token must be persisted immediately or the next refresh fails. A module
   level promise dedupes concurrent refreshes so two requests can't both
   spend the same (single-use) refresh token. */

const TOKEN_URL = "https://auth.brightspace.com/core/connect/token";

type StoredTokens = {
  access_token: string;
  refresh_token: string;
  /* epoch ms */
  expires_at: number;
};

export function getTokenFilePath() {
  return (
    process.env.BRIGHTSPACE_TOKEN_FILE || path.join(process.cwd(), ".brightspace-tokens.json")
  );
}

export function hasStoredTokens(): boolean {
  return existsSync(getTokenFilePath());
}

async function readTokens(): Promise<StoredTokens | null> {
  try {
    const raw = await fs.readFile(getTokenFilePath(), "utf8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<string> | null = null;

export async function getAccessToken(): Promise<string> {
  /* Long-lived env token wins when set (dev/test override). */
  const envToken = process.env.BRIGHTSPACE_ACCESS_TOKEN;
  if (envToken) return envToken;

  const stored = await readTokens();
  if (!stored) {
    throw new Error("No Brightspace tokens found. Run `npm run authorize` once to mint them.");
  }
  if (Date.now() < stored.expires_at - 60_000) {
    return stored.access_token;
  }

  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function refreshTokens(): Promise<string> {
  const clientId = process.env.BRIGHTSPACE_CLIENT_ID;
  const clientSecret = process.env.BRIGHTSPACE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing BRIGHTSPACE_CLIENT_ID / BRIGHTSPACE_CLIENT_SECRET for token refresh.");
  }

  /* Re-read right before refreshing in case another process already rotated. */
  const current = await readTokens();
  if (!current) {
    throw new Error("Brightspace token file disappeared. Run `npm run authorize` again.");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: current.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Brightspace token refresh failed (${response.status}). The refresh token may have been spent — run \`npm run authorize\` again.`,
    );
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const next: StoredTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000,
  };
  await fs.writeFile(getTokenFilePath(), JSON.stringify(next, null, 2), "utf8");
  return next.access_token;
}
