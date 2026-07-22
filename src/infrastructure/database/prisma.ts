import "server-only";

import { PrismaClient } from "@prisma/client";

import { getServerEnv } from "@/lib/env/server";

declare global {
  // `var` is required to persist through Next.js development reloads.
  var prisma: PrismaClient | undefined;
}

getServerEnv();

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
