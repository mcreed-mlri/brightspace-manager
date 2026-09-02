import "server-only";

export const DATA_MODES = ["mock", "hybrid", "live_required"] as const;
export type DataMode = (typeof DATA_MODES)[number];

export class MockDataDisabledError extends Error {
  readonly status = 503;

  constructor(context = "This view") {
    super(
      `${context} would use mock data, but APP_DATA_MODE=live_required disables all fixture fallbacks.`,
    );
    this.name = "MockDataDisabledError";
  }
}

export function getDataMode(): DataMode {
  const raw = process.env.APP_DATA_MODE?.trim();
  if (raw === "mock" || raw === "hybrid" || raw === "live_required") return raw;
  return "hybrid";
}

export function isMockDataAllowed(): boolean {
  return getDataMode() !== "live_required";
}

export function requireMockDataAllowed(context?: string): void {
  if (!isMockDataAllowed()) throw new MockDataDisabledError(context);
}

export function isMockDataDisabledError(error: unknown): error is MockDataDisabledError {
  return error instanceof MockDataDisabledError;
}

export function dataModeLabel(mode = getDataMode()): string {
  if (mode === "live_required") return "Live required";
  if (mode === "mock") return "Mock";
  return "Hybrid";
}

