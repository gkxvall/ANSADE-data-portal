import { Prisma, PrismaClient } from "@prisma/client";

import { developmentFixture as fixture } from "./fixtures/development";

const prisma = new PrismaClient();

async function seedDevelopmentFixture() {
  await prisma.$transaction(async (transaction) => {
    await transaction.importRun.upsert({
      where: { id: fixture.importRun.id },
      update: fixture.importRun,
      create: {
        ...fixture.importRun,
        sourceSystem: fixture.sourceSystem,
      },
    });

    await transaction.category.upsert({
      where: { id: fixture.category.id },
      update: fixture.category,
      create: {
        ...fixture.category,
        sourceSystem: fixture.sourceSystem,
      },
    });

    await transaction.theme.upsert({
      where: { id: fixture.theme.id },
      update: fixture.theme,
      create: {
        ...fixture.theme,
        categoryId: fixture.category.id,
        sourceSystem: fixture.sourceSystem,
      },
    });

    await transaction.dataset.upsert({
      where: { id: fixture.dataset.id },
      update: fixture.dataset,
      create: {
        ...fixture.dataset,
        themeId: fixture.theme.id,
        sourceSystem: fixture.sourceSystem,
      },
    });

    await transaction.datasetMetadata.upsert({
      where: { datasetId: fixture.dataset.id },
      update: fixture.metadata,
      create: {
        ...fixture.metadata,
        datasetId: fixture.dataset.id,
      },
    });

    await transaction.dimension.upsert({
      where: { id: fixture.dimension.id },
      update: fixture.dimension,
      create: {
        ...fixture.dimension,
        datasetId: fixture.dataset.id,
      },
    });

    await transaction.dimensionValue.upsert({
      where: { id: fixture.dimensionValue.id },
      update: fixture.dimensionValue,
      create: {
        ...fixture.dimensionValue,
        dimensionId: fixture.dimension.id,
      },
    });

    await transaction.observation.upsert({
      where: { id: fixture.observation.id },
      update: {
        ...fixture.observation,
        value: new Prisma.Decimal(fixture.observation.value),
      },
      create: {
        ...fixture.observation,
        datasetId: fixture.dataset.id,
        value: new Prisma.Decimal(fixture.observation.value),
      },
    });

    await transaction.observationDimensionValue.upsert({
      where: {
        observationId_dimensionId: {
          observationId: fixture.observation.id,
          dimensionId: fixture.dimension.id,
        },
      },
      update: { dimensionValueId: fixture.dimensionValue.id },
      create: {
        observationId: fixture.observation.id,
        dimensionId: fixture.dimension.id,
        dimensionValueId: fixture.dimensionValue.id,
      },
    });

    await transaction.sourceReference.upsert({
      where: {
        sourceSystem_entityType_sourceScope_sourceId: {
          sourceSystem: fixture.sourceSystem,
          entityType: fixture.sourceReference.entityType,
          sourceScope: fixture.sourceReference.sourceScope,
          sourceId: fixture.sourceReference.sourceId,
        },
      },
      update: fixture.sourceReference,
      create: {
        ...fixture.sourceReference,
        sourceSystem: fixture.sourceSystem,
        datasetId: fixture.dataset.id,
      },
    });

    await transaction.importIssue.upsert({
      where: { id: fixture.importIssue.id },
      update: fixture.importIssue,
      create: {
        ...fixture.importIssue,
        importRunId: fixture.importRun.id,
        datasetId: fixture.dataset.id,
      },
    });

    await transaction.datasetRevision.upsert({
      where: {
        datasetId_revision: {
          datasetId: fixture.dataset.id,
          revision: fixture.revision.revision,
        },
      },
      update: fixture.revision,
      create: {
        ...fixture.revision,
        datasetId: fixture.dataset.id,
        importRunId: fixture.importRun.id,
      },
    });
  });
}

seedDevelopmentFixture()
  .then(async () => {
    console.info(`Seeded ${fixture.marker}.`);
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Development fixture seed failed.", error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
