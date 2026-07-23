import { describe, expect, it } from "vitest";

import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createApiDataProvider } from "./api";
import { createMockDataProvider } from "./mock";

describe("provider boundary", () => {
  it("exposes the mock catalogue snapshot for search and listing", async () => {
    const provider = createMockDataProvider();

    const datasets = await provider.datasets.listDatasets();
    const searchResults = await provider.search.searchCatalog("démonstration");

    expect(datasets).toHaveLength(1);
    expect(searchResults.datasets).toHaveLength(1);
    expect(searchResults.categories).toHaveLength(1);
    expect(searchResults.themes).toHaveLength(1);
  });

  it("fails explicitly for the future API provider", async () => {
    const provider = createApiDataProvider();

    await expect(provider.datasets.listDatasets()).rejects.toThrow(
      /NotImplemented: the ANSADE API provider does not yet implement datasets\.listDatasets\./,
    );
  });
});
