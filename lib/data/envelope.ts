import "server-only";

import { requireMockDataAllowed } from "@/lib/data/mode";
import type { DataResult } from "@/types/domain";

export function mockResult<T>(data: T, context?: string): DataResult<T> {
  requireMockDataAllowed(context);
  return { data, source: "mock", fetchedAt: new Date().toISOString() };
}

export function liveResult<T>(data: T): DataResult<T> {
  return { data, source: "live", fetchedAt: new Date().toISOString() };
}
