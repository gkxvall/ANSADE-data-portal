import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .trim()
    .min(1)
    .default("ANSADE Statistical Data Explorer"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

type Environment = Readonly<Record<string, string | undefined>>;

export function getPublicEnv(
  environment: Environment = process.env,
): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: environment.NEXT_PUBLIC_APP_NAME,
  });
}
