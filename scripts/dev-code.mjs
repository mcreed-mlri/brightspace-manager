/* Mint a sign-in code WITHOUT sending an email — for local testing, so the
   built-in Supabase sender's ~2 emails/hour budget never gets touched.

       npm run dev-code                  → code for the first invited user
       npm run dev-code you@mlri.org     → code for a specific invited user

   Uses the admin generate_link API (service-role key from .env, server-side
   only). The printed code is a normal one-time code: paste it into the app's
   sign-in form within the expiry window. The user must already be invited. */

import { readFileSync } from "node:fs";
import path from "node:path";

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
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.",
  );
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function firstUserEmail() {
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1`, { headers });
  if (!response.ok) {
    console.error(`Could not list users (${response.status}).`);
    process.exit(1);
  }
  const body = await response.json();
  const email = body.users?.[0]?.email;
  if (!email) {
    console.error("No users found — invite someone in the Supabase dashboard first.");
    process.exit(1);
  }
  return email;
}

const email = process.argv[2] || (await firstUserEmail());

const response = await fetch(`${url}/auth/v1/admin/generate_link`, {
  method: "POST",
  headers,
  body: JSON.stringify({ type: "magiclink", email }),
});

const body = await response.json();
if (!response.ok || !body.email_otp) {
  console.error(
    `Could not generate a code for ${email} (${response.status}): ${body.msg || body.message || "unknown error"}`,
  );
  console.error("Is this email on the invite list (Authentication → Users)?");
  process.exit(1);
}

console.log(`\nSign-in code for ${email}:\n`);
console.log(`    ${body.email_otp}\n`);
console.log("Paste it into the app's sign-in form. No email was sent.");
