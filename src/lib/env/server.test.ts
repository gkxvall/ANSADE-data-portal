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

  it("requires an API base URL when the API provider is selected", () => {
    expect(() =>
      getServerEnv({
        DATA_SOURCE: "api",
      }),
    ).toThrow();
  });

  it("accepts the future API provider configuration", () => {
    const result = getServerEnv({
      DATA_SOURCE: "api",
      ANSADE_API_BASE_URL: "https://api.portail.ansade.mr/api",
    });

    expect(result.DATA_SOURCE).toBe("api");
    expect(result.ANSADE_API_BASE_URL).toBe(
      "https://api.portail.ansade.mr/api",
    );
  });
});
