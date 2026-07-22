import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getServerEnv } from "./server";

describe("getServerEnv", () => {
  it("accepts a PostgreSQL connection and defaults to the postgres provider", () => {
    const result = getServerEnv({
      DATABASE_URL: "postgresql://user:password@localhost:5432/ansade",
    });

    expect(result.DATA_SOURCE).toBe("postgres");
    expect(result.ANSADE_API_BASE_URL).toBeUndefined();
  });

  it("rejects a missing database connection", () => {
    expect(() => getServerEnv({})).toThrow();
  });

  it("rejects non-PostgreSQL connection strings", () => {
    expect(() =>
      getServerEnv({ DATABASE_URL: "mysql://localhost/ansade" }),
    ).toThrow();
  });

  it("does not accept an API provider before its implementation stage", () => {
    expect(() =>
      getServerEnv({
        DATABASE_URL: "postgresql://user:password@localhost:5432/ansade",
        DATA_SOURCE: "api",
      }),
    ).toThrow();
  });
});
