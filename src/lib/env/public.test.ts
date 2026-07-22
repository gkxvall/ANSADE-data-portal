import { describe, expect, it } from "vitest";

import { getPublicEnv } from "./public";

describe("getPublicEnv", () => {
  it("uses the documented application name by default", () => {
    expect(getPublicEnv({}).NEXT_PUBLIC_APP_NAME).toBe(
      "ANSADE Statistical Data Explorer",
    );
  });

  it("accepts a non-empty public application name", () => {
    expect(
      getPublicEnv({ NEXT_PUBLIC_APP_NAME: "Portail ANSADE" })
        .NEXT_PUBLIC_APP_NAME,
    ).toBe("Portail ANSADE");
  });

  it("rejects an empty public application name", () => {
    expect(() => getPublicEnv({ NEXT_PUBLIC_APP_NAME: " " })).toThrow();
  });
});
