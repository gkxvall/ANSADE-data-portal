import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@prisma/client",
              message:
                "Presentation code must use application services, never Prisma directly.",
            },
          ],
          patterns: [
            {
              group: [
                "@/infrastructure/database",
                "@/infrastructure/database/*",
              ],
              message:
                "Presentation code must not depend on database infrastructure.",
            },
            {
              group: [
                "@/infrastructure/adapters",
                "@/infrastructure/adapters/*",
              ],
              message: "Presentation code must not depend on source adapters.",
            },
          ],
        },
      ],
    },
  },
]);
