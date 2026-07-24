import { importPortalData } from "./importer";

async function main() {
  const result = await importPortalData({
    baseUrl: process.env.ANSADE_PORTAL_BASE_URL,
    cookie: process.env.ANSADE_PORTAL_COOKIE || null,
    authorization: process.env.ANSADE_PORTAL_AUTHORIZATION || null,
  });

  console.info("Portal import completed.");
  console.info(JSON.stringify(result.importRun, null, 2));
}

main().catch((error: unknown) => {
  console.error("Portal import failed.", error);
  process.exitCode = 1;
});
