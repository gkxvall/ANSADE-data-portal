import "server-only";

import type { ServerEnv } from "@/lib/env/server";
import { getServerEnv } from "@/lib/env/server";

import { createApiDataProvider } from "./api";
import { createMockDataProvider } from "./mock";
import { createPostgresDataProvider } from "./postgres";
import type { DataProvider, ProviderName } from "./types";

async function loadPostgresProvider() {
  const { prisma } = await import("@/infrastructure/database/prisma");
  return createPostgresDataProvider(prisma);
}

export function createDataProviderFromEnv(
  environment: ServerEnv,
): Promise<DataProvider> {
  switch (environment.DATA_SOURCE as ProviderName) {
    case "api":
      return Promise.resolve(createApiDataProvider());
    case "mock":
      return Promise.resolve(createMockDataProvider());
    case "postgres":
    default:
      return loadPostgresProvider();
  }
}

export async function getDataProvider(
  environment = process.env,
): Promise<DataProvider> {
  return createDataProviderFromEnv(getServerEnv(environment));
}

export {
  createApiDataProvider,
  createMockDataProvider,
  createPostgresDataProvider,
};
export type { DataProvider, ProviderName };
