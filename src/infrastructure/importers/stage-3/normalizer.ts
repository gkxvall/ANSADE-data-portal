import type {
  Category,
  Dataset,
  DatasetMetadata,
  DatasetRevision,
  Dimension,
  DimensionValue,
  Observation,
  SourceReference,
  Theme,
} from "@/domain/entities";

import type {
  RawStage3Dimension,
  RawStage3Row,
  RawStage3Source,
  RawStage3Table,
} from "@/infrastructure/adapters/ansade-stage3";

import { sha256Checksum, stableStringify, stableUuid } from "./checksum";
import type { Stage3NormalizedImport, Stage3NormalizedTable } from "./types";

function sortKeys(
  value: Readonly<Record<string, string>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, value[key]]),
  );
}

function buildSourceReference(
  entityType: SourceReference["entityType"],
  entityId: string,
  sourceSystem: string,
  sourceScope: string,
  sourceId: string,
  sourceUpdatedAt: Date | null,
  sourcePublishedAt: Date | null,
  metadata: Readonly<Record<string, unknown>> | null,
  checksum: string | null,
  sourceUrl: string | null = null,
): SourceReference {
  return {
    id: stableUuid([sourceSystem, entityType, sourceScope, sourceId]),
    sourceSystem,
    entityType,
    entityId,
    sourceScope,
    sourceId,
    sourceUrl,
    checksum,
    sourceUpdatedAt,
    sourcePublishedAt,
    retrievedAt: sourceUpdatedAt ?? sourcePublishedAt ?? new Date(),
    metadata,
    createdAt: sourceUpdatedAt ?? sourcePublishedAt ?? new Date(),
  };
}

function parseNumericValue(
  rawValue: string | null,
  numericValue: number | null,
): number | null {
  if (numericValue !== null) {
    return numericValue;
  }

  if (rawValue === null) {
    return null;
  }

  const cleaned = rawValue
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(/%$/, "")
    .replace(",", ".");
  const parsed = Number(cleaned.replace(/[^0-9+\-.]/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function dimensionSourceScope(
  datasetSourceId: string,
  dimensionSourceId: string,
): string {
  return `${datasetSourceId}:${dimensionSourceId}`;
}

function tableIsSelectable(table: RawStage3Table): boolean {
  return table.publiee || table.selectionnee;
}

function normalizeDimension(
  dataset: Dataset,
  table: RawStage3Table,
  dimension: RawStage3Dimension,
  sourceSystem: string,
  importedAt: Date,
): {
  dimension: Dimension;
  values: readonly DimensionValue[];
  references: readonly SourceReference[];
} {
  const dimensionId = stableUuid([
    sourceSystem,
    "DIMENSION",
    dataset.sourceId,
    dimension.id_dimension,
  ]);

  const normalizedDimension: Dimension = {
    id: dimensionId,
    datasetId: dataset.id,
    sourceId: dimension.id_dimension,
    key: dimension.code_dimension,
    label: dimension.libelle_dimension,
    kind: dimension.type_dimension,
    position: table.dimensions.findIndex(
      (candidate) => candidate.id_dimension === dimension.id_dimension,
    ),
    isRequired: dimension.obligatoire,
    sourceUpdatedAt: dimension.source_updated_at,
    sourcePublishedAt: dimension.source_published_at,
    createdAt: importedAt,
    updatedAt: importedAt,
  };

  const values = dimension.valeurs.map((value, index) => {
    const valueId = stableUuid([
      sourceSystem,
      "DIMENSION_VALUE",
      dataset.sourceId,
      dimension.id_dimension,
      value.id_valeur,
    ]);

    return {
      id: valueId,
      dimensionId,
      sourceId: value.id_valeur,
      code: value.code_valeur,
      label: value.libelle_valeur,
      position: value.ordre_affichage ?? index,
      isActive: true,
      sourceUpdatedAt: value.source_updated_at,
      sourcePublishedAt: value.source_published_at,
      createdAt: importedAt,
      updatedAt: importedAt,
    } satisfies DimensionValue;
  });

  const references = [
    buildSourceReference(
      "DIMENSION",
      dimensionId,
      sourceSystem,
      dataset.sourceId,
      dimension.id_dimension,
      dimension.source_updated_at,
      dimension.source_published_at,
      {
        datasetSourceId: dataset.sourceId,
        dimensionKey: dimension.code_dimension,
      },
      null,
    ),
    ...values.map((value) =>
      buildSourceReference(
        "DIMENSION_VALUE",
        value.id,
        sourceSystem,
        dimensionSourceScope(dataset.sourceId, dimension.id_dimension),
        value.sourceId,
        value.sourceUpdatedAt,
        value.sourcePublishedAt,
        { dimensionKey: dimension.code_dimension, code: value.code },
        null,
      ),
    ),
  ];

  return { dimension: normalizedDimension, values, references };
}

function normalizeTable(
  source: RawStage3Source,
  table: RawStage3Table,
  importedAt: Date,
): Stage3NormalizedTable {
  const categoryRecord = source.categories.find((category) =>
    source.themes.some(
      (theme) =>
        theme.id_categorie === category.id_categorie &&
        theme.id_theme === table.id_theme,
    ),
  );

  const themeRecord = source.themes.find(
    (theme) => theme.id_theme === table.id_theme,
  );

  if (!categoryRecord || !themeRecord) {
    throw new Error(`Table ${table.id_table} is missing its category or theme`);
  }

  const sourceSystem = source.source_system;
  const categoryId = stableUuid([
    sourceSystem,
    "CATEGORY",
    categoryRecord.id_categorie,
  ]);
  const themeId = stableUuid([sourceSystem, "THEME", themeRecord.id_theme]);
  const datasetId = stableUuid([sourceSystem, "DATASET", table.id_table]);
  const metadataId = stableUuid([
    sourceSystem,
    "DATASET_METADATA",
    table.id_table,
  ]);

  const category: Category = {
    id: categoryId,
    sourceSystem,
    sourceId: categoryRecord.id_categorie,
    name: categoryRecord.nom_cat,
    slug: categoryRecord.id_categorie,
    displayOrder: categoryRecord.ordre_affichage,
    isActive: true,
    sourceUpdatedAt: categoryRecord.source_updated_at,
    sourcePublishedAt: categoryRecord.source_published_at,
    createdAt: importedAt,
    updatedAt: importedAt,
  };

  const theme: Theme = {
    id: themeId,
    categoryId,
    sourceSystem,
    sourceId: themeRecord.id_theme,
    name: themeRecord.nom_theme,
    slug: themeRecord.id_theme,
    displayOrder: themeRecord.ordre_affichage,
    isActive: true,
    sourceUpdatedAt: themeRecord.source_updated_at,
    sourcePublishedAt: themeRecord.source_published_at,
    createdAt: importedAt,
    updatedAt: importedAt,
  };

  const dataset: Dataset = {
    id: datasetId,
    themeId,
    sourceSystem,
    sourceId: table.id_table,
    title: table.nom_table,
    slug: table.id_table,
    description: table.description,
    sourceOrganization: table.organisme_source,
    publicationStatus: table.statut_publication,
    isActive: true,
    checksum: null,
    sourceUpdatedAt: table.source_updated_at,
    sourcePublishedAt: table.source_published_at,
    createdAt: importedAt,
    updatedAt: importedAt,
  };

  const metadata: DatasetMetadata = {
    id: metadataId,
    datasetId,
    unit: table.resume_metadonnees?.unite
      ? String(table.resume_metadonnees.unite)
      : null,
    frequency: table.resume_metadonnees?.frequence
      ? String(table.resume_metadonnees.frequence)
      : null,
    methodology: null,
    coverage: null,
    limitations: null,
    contact: null,
    language: "fr",
    additional: table.resume_metadonnees,
    sourceUpdatedAt: table.source_updated_at,
    sourcePublishedAt: table.source_published_at,
    createdAt: importedAt,
    updatedAt: importedAt,
  };

  const dimensionResults = table.dimensions.map((dimension) =>
    normalizeDimension(dataset, table, dimension, sourceSystem, importedAt),
  );

  const dimensions = dimensionResults.map((result) => result.dimension);
  const dimensionValues = dimensionResults.flatMap((result) => result.values);
  const references = [
    buildSourceReference(
      "CATEGORY",
      categoryId,
      sourceSystem,
      "global",
      category.sourceId,
      category.sourceUpdatedAt,
      category.sourcePublishedAt,
      { name: category.name },
      null,
    ),
    buildSourceReference(
      "THEME",
      themeId,
      sourceSystem,
      "global",
      theme.sourceId,
      theme.sourceUpdatedAt,
      theme.sourcePublishedAt,
      { name: theme.name, categorySourceId: category.sourceId },
      null,
    ),
    buildSourceReference(
      "DATASET",
      datasetId,
      sourceSystem,
      "global",
      dataset.sourceId,
      dataset.sourceUpdatedAt,
      dataset.sourcePublishedAt,
      { title: dataset.title, publicationStatus: dataset.publicationStatus },
      null,
    ),
    buildSourceReference(
      "DATASET_METADATA",
      metadataId,
      sourceSystem,
      dataset.sourceId,
      `${table.id_table}:metadata`,
      metadata.sourceUpdatedAt,
      metadata.sourcePublishedAt,
      table.resume_metadonnees,
      null,
    ),
    ...dimensionResults.flatMap((result) => result.references),
  ];

  const observations: Observation[] = [];
  const issues: Array<Stage3NormalizedImport["issues"][number]> = [];

  for (const row of table.lignes) {
    const orderedDimensions = dimensions.map((dimension) => ({
      dimension,
      rawCoordinate: row.coordonnees[dimension.key],
    }));

    const missingDimension = orderedDimensions.find(
      (entry) => entry.rawCoordinate === undefined,
    );
    if (missingDimension) {
      issues.push({
        id: stableUuid([
          sourceSystem,
          "IMPORT_ISSUE",
          table.id_table,
          row.id_ligne,
          "missing-dimension",
        ]),
        importRunId: "pending-import-run",
        datasetId,
        severity: "ERROR",
        code: "MISSING_DIMENSION_COORDINATE",
        message: `Row ${row.id_ligne} is missing coordinate ${missingDimension.dimension.key}`,
        sourceEntityType: "OBSERVATION",
        sourceId: row.id_ligne,
        details: {
          tableSourceId: table.id_table,
          missingKey: missingDimension.dimension.key,
        },
        createdAt: importedAt,
      });
      continue;
    }

    const dimensionValueIds: string[] = [];
    const coordinate: Record<string, string> = {};

    let rowIsValid = true;
    for (const entry of orderedDimensions) {
      const value = dimensionResults
        .flatMap((result) => result.values)
        .find(
          (candidate) =>
            candidate.dimensionId === entry.dimension.id &&
            candidate.code === entry.rawCoordinate,
        );

      if (!value) {
        issues.push({
          id: stableUuid([
            sourceSystem,
            "IMPORT_ISSUE",
            table.id_table,
            row.id_ligne,
            entry.dimension.key,
          ]),
          importRunId: "pending-import-run",
          datasetId,
          severity: "ERROR",
          code: "UNKNOWN_DIMENSION_VALUE",
          message: `Row ${row.id_ligne} references unknown value ${String(entry.rawCoordinate)} for ${entry.dimension.key}`,
          sourceEntityType: "OBSERVATION",
          sourceId: row.id_ligne,
          details: {
            tableSourceId: table.id_table,
            dimensionKey: entry.dimension.key,
            coordinate: entry.rawCoordinate,
          },
          createdAt: importedAt,
        });
        rowIsValid = false;
        break;
      }

      coordinate[entry.dimension.key] = entry.rawCoordinate;
      dimensionValueIds.push(value.id);
    }

    if (!rowIsValid) {
      continue;
    }

    const normalizedCoordinate = sortKeys(coordinate);
    const coordinateHash = sha256Checksum(normalizedCoordinate);
    const rawValue = row.valeur_brute;
    const parsedValue = parseNumericValue(rawValue, row.valeur_numerique);

    observations.push({
      id: stableUuid([
        sourceSystem,
        "OBSERVATION",
        dataset.sourceId,
        row.id_ligne,
        coordinateHash,
      ]),
      datasetId,
      sourceId: row.id_ligne,
      coordinate: normalizedCoordinate,
      coordinateHash,
      value: parsedValue,
      rawValue,
      status: row.statut,
      dimensionValueIds,
      sourceUpdatedAt: row.source_updated_at,
      sourcePublishedAt: row.source_published_at,
      createdAt: importedAt,
      updatedAt: importedAt,
    });
  }

  const revisionSnapshot = {
    category: { sourceId: category.sourceId, name: category.name },
    theme: { sourceId: theme.sourceId, name: theme.name },
    dataset: { sourceId: dataset.sourceId, title: dataset.title },
    metadata: metadata.additional,
    dimensions: dimensions.map((dimension) => ({
      sourceId: dimension.sourceId,
      key: dimension.key,
      label: dimension.label,
      kind: dimension.kind,
      values: dimensionValues
        .filter((value) => value.dimensionId === dimension.id)
        .map((value) => ({
          sourceId: value.sourceId,
          code: value.code,
          label: value.label,
        })),
    })),
    observations: observations.map((observation) => ({
      sourceId: observation.sourceId,
      coordinate: observation.coordinate,
      coordinateHash: observation.coordinateHash,
      value: observation.value,
      rawValue: observation.rawValue,
      status: observation.status,
    })),
  };

  return {
    category,
    theme,
    dataset: { ...dataset, checksum: sha256Checksum(revisionSnapshot) },
    metadata,
    dimensions,
    dimensionValues,
    observations,
    sourceReferences: references,
    revisionSnapshot,
    revisionChecksum: sha256Checksum(revisionSnapshot),
  };
}

export function normalizeStage3Import(
  source: RawStage3Source,
  startedAt: Date,
): Stage3NormalizedImport {
  const tables = source.tables.filter(tableIsSelectable);
  const normalizedTables = tables.map((table) =>
    normalizeTable(source, table, startedAt),
  );

  const categories = normalizedTables.map((table) => table.category);
  const themes = normalizedTables.map((table) => table.theme);
  const datasets = normalizedTables.map((table) => ({
    ...table.dataset,
    checksum: table.revisionChecksum,
  }));
  const metadata = normalizedTables.map((table) => table.metadata);
  const dimensions = normalizedTables.flatMap((table) => table.dimensions);
  const dimensionValues = normalizedTables.flatMap(
    (table) => table.dimensionValues,
  );
  const observations = normalizedTables.flatMap((table) => table.observations);
  const sourceReferences = normalizedTables.flatMap(
    (table) => table.sourceReferences,
  );

  const revisions = normalizedTables.map((table, index) => ({
    id: stableUuid([
      source.source_system,
      "DATASET_REVISION",
      table.dataset.sourceId,
      table.revisionChecksum,
    ]),
    datasetId: table.dataset.id,
    importRunId: null,
    revision: 1,
    kind: "CREATED" as const,
    checksum: table.revisionChecksum,
    snapshot: table.revisionSnapshot,
    sourceUpdatedAt: source.source_updated_at,
    createdAt: startedAt,
  }));

  const issues = normalizedTables.flatMap((table, index) =>
    table.observations.length === 0
      ? [
          {
            id: stableUuid([
              source.source_system,
              "IMPORT_ISSUE",
              table.dataset.sourceId,
              String(index),
            ]),
            importRunId: "pending-import-run",
            datasetId: table.dataset.id,
            severity: "WARNING" as const,
            code: "EMPTY_TABLE",
            message: `Table ${table.dataset.sourceId} produced no observations after normalization.`,
            sourceEntityType: "DATASET" as const,
            sourceId: table.dataset.sourceId,
            details: { tableSourceId: table.dataset.sourceId },
            createdAt: startedAt,
          },
        ]
      : [],
  );

  const recordsCreated =
    categories.length +
    themes.length +
    datasets.length +
    metadata.length +
    dimensions.length +
    dimensionValues.length +
    observations.length +
    sourceReferences.length +
    revisions.length +
    issues.length;

  return {
    sourceSystem: source.source_system,
    sourceChecksum: sha256Checksum(source),
    startedAt,
    importedAt: startedAt,
    categories,
    themes,
    datasets,
    metadata,
    dimensions,
    dimensionValues,
    observations,
    sourceReferences,
    revisions,
    issues,
    summary: {
      sourceSystem: source.source_system,
      importedTables: tables.length,
      skippedTables: source.tables.length - tables.length,
      importedObservations: observations.length,
      issues: issues.length,
      recordsCreated,
      recordsUpdated: 0,
      recordsFailed: issues.length,
    },
  };
}

export function normalizeStage3RawSource(
  source: RawStage3Source,
  startedAt: Date,
): Stage3NormalizedImport {
  return normalizeStage3Import(source, startedAt);
}
