/* One-time OAuth 2.0 Authorization Code flow for Brightspace Manager.
   Same paste-the-URL pattern as brightspace-admin-mcp/scripts/authorize.py:

       npm run authorize

   Opens your browser to Brightspace. After you log in and consent,
   Brightspace redirects to the registered redirect URI (default
   https://localhost:3000/callback) — the browser shows a connection error
   because nothing is listening there, but the code is already in the URL.
   Copy the FULL URL from the address bar and paste it here. */

import { exec } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

const AUTH_URL = "https://auth.brightspace.com/oauth2/auth";
const TOKEN_URL = "https://auth.brightspace.com/core/connect/token";

const DEFAULT_SCOPE = "core:*:* users:userdata:read organizations:organization:read";
const DEFAULT_REDIRECT = "https://localhost:3000/callback";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  let text = "";
  try {
    text = readFileSync(envPath, "utf8");
  } catch {
    console.error("No .env file found in the project root.");
    process.exit(1);
  }
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const clientId = env.BRIGHTSPACE_CLIENT_ID;
  const clientSecret = env.BRIGHTSPACE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("BRIGHTSPACE_CLIENT_ID and BRIGHTSPACE_CLIENT_SECRET must be set in .env.");
    process.exit(1);
  }
  const redirectUri = env.BRIGHTSPACE_REDIRECT_URI || DEFAULT_REDIRECT;
  const scope = env.BRIGHTSPACE_SCOPE || DEFAULT_SCOPE;
  const state = randomBytes(16).toString("base64url");

  const authUrl =
    AUTH_URL +
    "?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      prompt: "consent",
    }).toString();

  console.log("\nOpening your browser to Brightspace for authorization...");
  console.log("(If it doesn't open automatically, paste this URL into your browser:)\n");
  console.log(`  ${authUrl}\n`);
  if (process.platform === "win32") {
    exec(`start "" "${authUrl.replace(/&/g, "^&")}"`);
  }

  console.log("After you log in and approve access, the browser will be redirected to");
  console.log(`${redirectUri}?code=... and show a connection error — that's expected.`);
  console.log("Copy the FULL URL from the address bar and paste it below.\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const pasted = (await rl.question("Callback URL (or just the code): ")).trim();
  rl.close();

  let code = pasted;
  if (pasted.toLowerCase().startsWith("http")) {
    const url = new URL(pasted);
    code = url.searchParams.get("code") ?? "";
    const returnedState = url.searchParams.get("state") ?? "";
    if (!code) {
      console.error("No ?code= found in the URL you pasted.");
      process.exit(1);
    }
    if (returnedState && returnedState !== state) {
      console.error("State mismatch — possible CSRF or stale URL. Run the script again.");
      process.exit(1);
    }
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Token exchange failed (${response.status}): ${body.slice(0, 300)}`);
    process.exit(1);
  }

  const json = await response.json();
  const tokenFile = env.BRIGHTSPACE_TOKEN_FILE || path.join(process.cwd(), ".brightspace-tokens.json");
  writeFileSync(
    tokenFile,
    JSON.stringify(
      {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_at: Date.now() + json.expires_in * 1000,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nSuccess! Tokens saved to ${tokenFile}`);
  console.log("Brightspace Manager will now read live data. Restart the dev server if running.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
