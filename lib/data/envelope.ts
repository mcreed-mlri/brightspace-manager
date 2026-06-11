import "server-only";

import type { DataResult } from "@/types/domain";

export function mockResult<T>(data: T): DataResult<T> {
  return { data, source: "mock", fetchedAt: new Date().toISOString() };
}

export function liveResult<T>(data: T): DataResult<T> {
  return { data, source: "live", fetchedAt: new Date().toISOString() };
}
