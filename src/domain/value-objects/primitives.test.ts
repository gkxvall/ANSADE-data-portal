import { describe, expect, it } from "vitest";

import { checksumSchema, slugSchema, sourceIdSchema } from "./primitives";

describe("domain primitives", () => {
  it("accepts normalized slugs and rejects presentation labels", () => {
    expect(slugSchema.parse("population-active")).toBe("population-active");
    expect(() => slugSchema.parse("Population active")).toThrow();
  });

  it("requires non-empty source identifiers", () => {
    expect(sourceIdSchema.parse("source-table-17")).toBe("source-table-17");
    expect(() => sourceIdSchema.parse("   ")).toThrow();
  });

  it("accepts only lowercase SHA-256 digests", () => {
    expect(checksumSchema.parse("a".repeat(64))).toBe("a".repeat(64));
    expect(() => checksumSchema.parse("A".repeat(64))).toThrow();
    expect(() => checksumSchema.parse("a".repeat(63))).toThrow();
  });
});
