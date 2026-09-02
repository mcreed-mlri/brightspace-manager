import { beforeEach, describe, expect, it } from "vitest";

import {
  dataModeLabel,
  getDataMode,
  isMockDataAllowed,
  MockDataDisabledError,
  requireMockDataAllowed,
} from "@/lib/data/mode";
import { mockResult } from "@/lib/data/envelope";

const ORIGINAL_ENV = process.env;

describe("data mode", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.APP_DATA_MODE;
  });

  it("defaults to hybrid mode", () => {
    expect(getDataMode()).toBe("hybrid");
    expect(dataModeLabel()).toBe("Hybrid");
    expect(isMockDataAllowed()).toBe(true);
  });

  it("allows fixture envelopes outside live-required mode", () => {
    process.env.APP_DATA_MODE = "mock";

    expect(mockResult(["demo"], "Demo view")).toMatchObject({
      data: ["demo"],
      source: "mock",
    });
  });

  it("blocks fixture envelopes in live-required mode", () => {
    process.env.APP_DATA_MODE = "live_required";

    expect(isMockDataAllowed()).toBe(false);
    expect(() => requireMockDataAllowed("Course Inventory")).toThrow(MockDataDisabledError);
    expect(() => mockResult([], "Course Inventory")).toThrow(
      "Course Inventory would use mock data",
    );
    expect(dataModeLabel()).toBe("Live required");
  });

  it("falls back to hybrid for invalid env values", () => {
    process.env.APP_DATA_MODE = "pilot";

    expect(getDataMode()).toBe("hybrid");
  });
});
