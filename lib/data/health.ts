import "server-only";

import { brightspaceApiFetch, lpPath } from "@/lib/brightspace/api";
import { getBrightspaceAuthMode } from "@/lib/brightspace/config";
import { hasStoredTokens } from "@/lib/brightspace/tokens";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { HealthStatus } from "@/types/domain";

/* Health checks return status + mode + a short human detail line.
   They never include env values or response bodies. */

export async function checkBrightspaceHealth(): Promise<HealthStatus> {
  const checkedAt = new Date().toISOString();
  const mode = getBrightspaceAuthMode();

  if (mode === "unconfigured") {
    return {
      service: "brightspace",
      status: "unconfigured",
      mode,
      detail: "No Brightspace credentials set. Running in mock mode.",
      checkedAt,
    };
  }

  if (mode === "oauth" && !hasStoredTokens()) {
    return {
      service: "brightspace",
      status: "unconfigured",
      mode,
      detail:
        "OAuth client is configured but no tokens are minted yet. Run `npm run authorize` once.",
      checkedAt,
    };
  }

  try {
    const response = await brightspaceApiFetch(lpPath("/users/whoami"));
    if (!response.ok) {
      return {
        service: "brightspace",
        status: "error",
        mode,
        detail: `Brightspace API responded ${response.status} to whoami.`,
        checkedAt,
      };
    }
    return {
      service: "brightspace",
      status: "ok",
      mode,
      detail: "Authenticated against the live Brightspace API.",
      checkedAt,
    };
  } catch {
    return {
      service: "brightspace",
      status: "error",
      mode,
      detail: "Could not reach the Brightspace API.",
      checkedAt,
    };
  }
}

export async function checkSupabaseHealth(): Promise<HealthStatus> {
  const checkedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return {
      service: "supabase",
      status: "unconfigured",
      mode: "service-role",
      detail: "No Supabase credentials set. Running in mock mode.",
      checkedAt,
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("learning_items").select("id,title").limit(1);
    if (error) {
      return {
        service: "supabase",
        status: "error",
        mode: "service-role",
        detail: `Supabase query failed: ${error.message}`,
        checkedAt,
      };
    }
    return {
      service: "supabase",
      status: "ok",
      mode: "service-role",
      detail: "Connected to Supabase (learning_items reachable).",
      checkedAt,
    };
  } catch {
    return {
      service: "supabase",
      status: "error",
      mode: "service-role",
      detail: "Could not reach Supabase.",
      checkedAt,
    };
  }
}
