import "server-only";

import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);
const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const serverEnvSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          value.startsWith("postgresql://") ||
          value.startsWith("postgres://"),
        "DATABASE_URL must use the postgresql:// or postgres:// protocol",
      ),
    DATA_SOURCE: z.enum(["postgres", "api"]).default("postgres"),
    ANSADE_API_BASE_URL: optionalUrl,
    ANSADE_API_TOKEN: optionalSecret,
  })
  .superRefine((value, context) => {
    if (value.DATA_SOURCE === "postgres" && !value.DATABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL is required when DATA_SOURCE=postgres",
        path: ["DATABASE_URL"],
      });
    }

    if (value.DATA_SOURCE === "api" && !value.ANSADE_API_BASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ANSADE_API_BASE_URL is required when DATA_SOURCE=api",
        path: ["ANSADE_API_BASE_URL"],
      });
    }
  })
  .strict();

export type ServerEnv = z.infer<typeof serverEnvSchema>;

type Environment = Readonly<Record<string, string | undefined>>;

export function getServerEnv(
  environment: Environment = process.env,
): ServerEnv {
  return serverEnvSchema.parse({
    DATABASE_URL: environment.DATABASE_URL,
    DATA_SOURCE: environment.DATA_SOURCE,
    ANSADE_API_BASE_URL: environment.ANSADE_API_BASE_URL,
    ANSADE_API_TOKEN: environment.ANSADE_API_TOKEN,
  });
}
