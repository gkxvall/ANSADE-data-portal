import { importSampleStage3Source } from "./importer";

async function main() {
  const result = await importSampleStage3Source();

  console.info("Stage 3 import completed.");
  console.info(JSON.stringify(result.importRun, null, 2));
}

main().catch((error: unknown) => {
  console.error("Stage 3 import failed.", error);
  process.exitCode = 1;
});