-- Stage 2: normalized statistical domain model.
-- Source-specific field names remain outside this schema.

CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNKNOWN');
CREATE TYPE "DimensionKind" AS ENUM ('TIME', 'GEOGRAPHY', 'INDICATOR', 'MEASURE', 'CATEGORY', 'OTHER');
CREATE TYPE "ImportRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');
CREATE TYPE "ImportIssueSeverity" AS ENUM ('WARNING', 'ERROR');
CREATE TYPE "SourceEntityType" AS ENUM ('CATEGORY', 'THEME', 'DATASET', 'DIMENSION', 'DIMENSION_VALUE', 'OBSERVATION', 'DATASET_METADATA');
CREATE TYPE "DatasetRevisionKind" AS ENUM ('CREATED', 'UPDATED', 'DEACTIVATED', 'REACTIVATED');

CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "source_system" VARCHAR(64) NOT NULL,
    "source_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_source_identity_nonempty" CHECK (length(btrim("source_system")) > 0 AND length(btrim("source_id")) > 0),
    CONSTRAINT "categories_display_order_nonnegative" CHECK ("display_order" >= 0)
);

CREATE TABLE "themes" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "source_system" VARCHAR(64) NOT NULL,
    "source_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "themes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "themes_source_identity_nonempty" CHECK (length(btrim("source_system")) > 0 AND length(btrim("source_id")) > 0),
    CONSTRAINT "themes_display_order_nonnegative" CHECK ("display_order" >= 0)
);

CREATE TABLE "datasets" (
    "id" UUID NOT NULL,
    "theme_id" UUID NOT NULL,
    "source_system" VARCHAR(64) NOT NULL,
    "source_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "source_organization" VARCHAR(255),
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'UNKNOWN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "checksum" CHAR(64),
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "datasets_source_identity_nonempty" CHECK (length(btrim("source_system")) > 0 AND length(btrim("source_id")) > 0),
    CONSTRAINT "datasets_checksum_format" CHECK ("checksum" IS NULL OR "checksum" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "dataset_metadata" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "unit" VARCHAR(255),
    "frequency" VARCHAR(100),
    "methodology" TEXT,
    "coverage" TEXT,
    "limitations" TEXT,
    "contact" VARCHAR(500),
    "language" VARCHAR(16) NOT NULL DEFAULT 'fr',
    "additional" JSONB,
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "dataset_metadata_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dataset_metadata_language_nonempty" CHECK (length(btrim("language")) > 0),
    CONSTRAINT "dataset_metadata_additional_object" CHECK ("additional" IS NULL OR jsonb_typeof("additional") = 'object')
);

CREATE TABLE "dimensions" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "source_id" VARCHAR(255) NOT NULL,
    "dimension_key" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "kind" "DimensionKind" NOT NULL DEFAULT 'OTHER',
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dimensions_identity_nonempty" CHECK (length(btrim("source_id")) > 0 AND length(btrim("dimension_key")) > 0),
    CONSTRAINT "dimensions_position_nonnegative" CHECK ("position" >= 0)
);

CREATE TABLE "dimension_values" (
    "id" UUID NOT NULL,
    "dimension_id" UUID NOT NULL,
    "source_id" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR(500) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "dimension_values_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dimension_values_identity_nonempty" CHECK (length(btrim("source_id")) > 0 AND length(btrim("code")) > 0),
    CONSTRAINT "dimension_values_position_nonnegative" CHECK ("position" >= 0)
);

CREATE TABLE "observations" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "source_id" VARCHAR(255),
    "coordinate" JSONB NOT NULL,
    "coordinate_hash" CHAR(64) NOT NULL,
    "value" DECIMAL(30,10),
    "raw_value" TEXT,
    "status" VARCHAR(100),
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "observations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "observations_coordinate_object" CHECK (jsonb_typeof("coordinate") = 'object'),
    CONSTRAINT "observations_coordinate_hash_format" CHECK ("coordinate_hash" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "observations_value_preserved" CHECK ("value" IS NOT NULL OR "raw_value" IS NOT NULL OR "status" IS NOT NULL),
    CONSTRAINT "observations_source_id_nonempty" CHECK ("source_id" IS NULL OR length(btrim("source_id")) > 0)
);

CREATE TABLE "observation_dimension_values" (
    "observation_id" UUID NOT NULL,
    "dimension_id" UUID NOT NULL,
    "dimension_value_id" UUID NOT NULL,
    CONSTRAINT "observation_dimension_values_pkey" PRIMARY KEY ("observation_id", "dimension_id")
);

CREATE TABLE "source_references" (
    "id" UUID NOT NULL,
    "source_system" VARCHAR(64) NOT NULL,
    "entity_type" "SourceEntityType" NOT NULL,
    "source_scope" VARCHAR(255) NOT NULL DEFAULT 'global',
    "source_id" VARCHAR(255) NOT NULL,
    "source_url" TEXT,
    "checksum" CHAR(64),
    "source_updated_at" TIMESTAMPTZ(3),
    "source_published_at" TIMESTAMPTZ(3),
    "retrieved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "category_id" UUID,
    "theme_id" UUID,
    "dataset_id" UUID,
    "dimension_id" UUID,
    "dimension_value_id" UUID,
    "observation_id" UUID,
    "dataset_metadata_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "source_references_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "source_references_identity_nonempty" CHECK (length(btrim("source_system")) > 0 AND length(btrim("source_scope")) > 0 AND length(btrim("source_id")) > 0),
    CONSTRAINT "source_references_checksum_format" CHECK ("checksum" IS NULL OR "checksum" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "source_references_metadata_object" CHECK ("metadata" IS NULL OR jsonb_typeof("metadata") = 'object'),
    CONSTRAINT "source_references_one_entity" CHECK (num_nonnulls("category_id", "theme_id", "dataset_id", "dimension_id", "dimension_value_id", "observation_id", "dataset_metadata_id") = 1),
    CONSTRAINT "source_references_entity_type_matches" CHECK (
      ("entity_type" = 'CATEGORY' AND "category_id" IS NOT NULL) OR
      ("entity_type" = 'THEME' AND "theme_id" IS NOT NULL) OR
      ("entity_type" = 'DATASET' AND "dataset_id" IS NOT NULL) OR
      ("entity_type" = 'DIMENSION' AND "dimension_id" IS NOT NULL) OR
      ("entity_type" = 'DIMENSION_VALUE' AND "dimension_value_id" IS NOT NULL) OR
      ("entity_type" = 'OBSERVATION' AND "observation_id" IS NOT NULL) OR
      ("entity_type" = 'DATASET_METADATA' AND "dataset_metadata_id" IS NOT NULL)
    )
);

CREATE TABLE "import_runs" (
    "id" UUID NOT NULL,
    "source_system" VARCHAR(64) NOT NULL,
    "status" "ImportRunStatus" NOT NULL DEFAULT 'RUNNING',
    "strict_mode" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(3),
    "categories_seen" INTEGER NOT NULL DEFAULT 0,
    "themes_seen" INTEGER NOT NULL DEFAULT 0,
    "datasets_seen" INTEGER NOT NULL DEFAULT 0,
    "observations_seen" INTEGER NOT NULL DEFAULT 0,
    "records_created" INTEGER NOT NULL DEFAULT 0,
    "records_updated" INTEGER NOT NULL DEFAULT 0,
    "records_failed" INTEGER NOT NULL DEFAULT 0,
    "source_checksum" CHAR(64),
    "summary" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "import_runs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "import_runs_source_system_nonempty" CHECK (length(btrim("source_system")) > 0),
    CONSTRAINT "import_runs_counts_nonnegative" CHECK ("categories_seen" >= 0 AND "themes_seen" >= 0 AND "datasets_seen" >= 0 AND "observations_seen" >= 0 AND "records_created" >= 0 AND "records_updated" >= 0 AND "records_failed" >= 0),
    CONSTRAINT "import_runs_timestamps_valid" CHECK ("finished_at" IS NULL OR "finished_at" >= "started_at"),
    CONSTRAINT "import_runs_state_valid" CHECK (("status" = 'RUNNING' AND "finished_at" IS NULL) OR ("status" <> 'RUNNING' AND "finished_at" IS NOT NULL)),
    CONSTRAINT "import_runs_checksum_format" CHECK ("source_checksum" IS NULL OR "source_checksum" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "import_runs_summary_object" CHECK ("summary" IS NULL OR jsonb_typeof("summary") = 'object')
);

CREATE TABLE "import_issues" (
    "id" UUID NOT NULL,
    "import_run_id" UUID NOT NULL,
    "dataset_id" UUID,
    "severity" "ImportIssueSeverity" NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "source_entity_type" "SourceEntityType",
    "source_id" VARCHAR(255),
    "details" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_issues_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "import_issues_code_nonempty" CHECK (length(btrim("code")) > 0),
    CONSTRAINT "import_issues_details_object" CHECK ("details" IS NULL OR jsonb_typeof("details") = 'object')
);

CREATE TABLE "dataset_revisions" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "import_run_id" UUID,
    "revision" INTEGER NOT NULL,
    "kind" "DatasetRevisionKind" NOT NULL,
    "checksum" CHAR(64) NOT NULL,
    "snapshot" JSONB NOT NULL,
    "source_updated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dataset_revisions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dataset_revisions_revision_positive" CHECK ("revision" > 0),
    CONSTRAINT "dataset_revisions_checksum_format" CHECK ("checksum" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "dataset_revisions_snapshot_object" CHECK (jsonb_typeof("snapshot") = 'object')
);

CREATE INDEX "categories_display_order_idx" ON "categories"("display_order");
CREATE UNIQUE INDEX "categories_source_identity_key" ON "categories"("source_system", "source_id");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

CREATE INDEX "themes_category_order_idx" ON "themes"("category_id", "display_order");
CREATE UNIQUE INDEX "themes_source_identity_key" ON "themes"("source_system", "source_id");
CREATE UNIQUE INDEX "themes_category_slug_key" ON "themes"("category_id", "slug");

CREATE INDEX "datasets_theme_id_idx" ON "datasets"("theme_id");
CREATE INDEX "datasets_source_id_idx" ON "datasets"("source_id");
CREATE INDEX "datasets_source_updated_at_idx" ON "datasets"("source_updated_at");
CREATE INDEX "datasets_publication_active_idx" ON "datasets"("publication_status", "is_active");
CREATE UNIQUE INDEX "datasets_source_identity_key" ON "datasets"("source_system", "source_id");
CREATE UNIQUE INDEX "datasets_theme_slug_key" ON "datasets"("theme_id", "slug");

CREATE UNIQUE INDEX "dataset_metadata_dataset_id_key" ON "dataset_metadata"("dataset_id");

CREATE INDEX "dimensions_dataset_position_idx" ON "dimensions"("dataset_id", "position");
CREATE UNIQUE INDEX "dimensions_dataset_source_id_key" ON "dimensions"("dataset_id", "source_id");
CREATE UNIQUE INDEX "dimensions_dataset_key_key" ON "dimensions"("dataset_id", "dimension_key");

CREATE INDEX "dimension_values_dimension_position_idx" ON "dimension_values"("dimension_id", "position");
CREATE UNIQUE INDEX "dimension_values_id_dimension_id_key" ON "dimension_values"("id", "dimension_id");
CREATE UNIQUE INDEX "dimension_values_dimension_source_id_key" ON "dimension_values"("dimension_id", "source_id");
CREATE UNIQUE INDEX "dimension_values_dimension_code_key" ON "dimension_values"("dimension_id", "code");

CREATE INDEX "observations_dataset_id_idx" ON "observations"("dataset_id");
CREATE INDEX "observations_dataset_status_idx" ON "observations"("dataset_id", "status");
CREATE UNIQUE INDEX "observations_dataset_coordinate_hash_key" ON "observations"("dataset_id", "coordinate_hash");
CREATE UNIQUE INDEX "observations_dataset_source_id_key" ON "observations"("dataset_id", "source_id");

CREATE INDEX "observation_dimension_values_value_observation_idx" ON "observation_dimension_values"("dimension_value_id", "observation_id");
CREATE INDEX "observation_dimension_values_dimension_idx" ON "observation_dimension_values"("dimension_id");
CREATE UNIQUE INDEX "observation_dimension_values_observation_value_key" ON "observation_dimension_values"("observation_id", "dimension_value_id");

CREATE INDEX "source_references_category_id_idx" ON "source_references"("category_id");
CREATE INDEX "source_references_theme_id_idx" ON "source_references"("theme_id");
CREATE INDEX "source_references_dataset_id_idx" ON "source_references"("dataset_id");
CREATE INDEX "source_references_dimension_id_idx" ON "source_references"("dimension_id");
CREATE INDEX "source_references_dimension_value_id_idx" ON "source_references"("dimension_value_id");
CREATE INDEX "source_references_observation_id_idx" ON "source_references"("observation_id");
CREATE INDEX "source_references_dataset_metadata_id_idx" ON "source_references"("dataset_metadata_id");
CREATE UNIQUE INDEX "source_references_identity_key" ON "source_references"("source_system", "entity_type", "source_scope", "source_id");

CREATE INDEX "import_runs_source_started_at_idx" ON "import_runs"("source_system", "started_at" DESC);
CREATE INDEX "import_runs_status_started_at_idx" ON "import_runs"("status", "started_at" DESC);
CREATE INDEX "import_issues_run_severity_idx" ON "import_issues"("import_run_id", "severity");
CREATE INDEX "import_issues_dataset_id_idx" ON "import_issues"("dataset_id");

CREATE INDEX "dataset_revisions_import_run_id_idx" ON "dataset_revisions"("import_run_id");
CREATE INDEX "dataset_revisions_dataset_created_at_idx" ON "dataset_revisions"("dataset_id", "created_at" DESC);
CREATE UNIQUE INDEX "dataset_revisions_dataset_revision_key" ON "dataset_revisions"("dataset_id", "revision");
CREATE UNIQUE INDEX "dataset_revisions_dataset_checksum_key" ON "dataset_revisions"("dataset_id", "checksum");

ALTER TABLE "themes" ADD CONSTRAINT "themes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dataset_metadata" ADD CONSTRAINT "dataset_metadata_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dimensions" ADD CONSTRAINT "dimensions_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dimension_values" ADD CONSTRAINT "dimension_values_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observations" ADD CONSTRAINT "observations_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "observation_dimension_values" ADD CONSTRAINT "observation_dimension_values_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "observations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observation_dimension_values" ADD CONSTRAINT "observation_dimension_values_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "observation_dimension_values" ADD CONSTRAINT "observation_dimension_values_dimension_value_id_dimension__fkey" FOREIGN KEY ("dimension_value_id", "dimension_id") REFERENCES "dimension_values"("id", "dimension_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "source_references" ADD CONSTRAINT "source_references_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_dimension_value_id_fkey" FOREIGN KEY ("dimension_value_id") REFERENCES "dimension_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "observations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_dataset_metadata_id_fkey" FOREIGN KEY ("dataset_metadata_id") REFERENCES "dataset_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_import_run_id_fkey" FOREIGN KEY ("import_run_id") REFERENCES "import_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "dataset_revisions" ADD CONSTRAINT "dataset_revisions_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dataset_revisions" ADD CONSTRAINT "dataset_revisions_import_run_id_fkey" FOREIGN KEY ("import_run_id") REFERENCES "import_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
