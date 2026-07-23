"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DatasetCatalogueItem } from "@/domain/repositories";

const STORAGE_KEY = "ansade-recent-datasets";

function readHistory(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(slugs: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, 5)));
}

export function RecentlyViewedDatasets({
  datasets,
  currentDatasetSlug,
}: {
  readonly datasets: readonly DatasetCatalogueItem[];
  readonly currentDatasetSlug?: string;
}) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const nextHistory = readHistory();

    if (currentDatasetSlug && !nextHistory.includes(currentDatasetSlug)) {
      nextHistory.unshift(currentDatasetSlug);
      writeHistory(nextHistory);
    } else if (currentDatasetSlug) {
      const withoutCurrent = nextHistory.filter((slug) => slug !== currentDatasetSlug);
      withoutCurrent.unshift(currentDatasetSlug);
      writeHistory(withoutCurrent);
    }

    setHistory(readHistory());
  }, [currentDatasetSlug]);

  const recentDatasets = useMemo(() => {
    const slugOrder = history.length > 0 ? history : readHistory();
    return slugOrder
      .map((slug) => datasets.find((dataset) => dataset.slug === slug))
      .filter((dataset): dataset is DatasetCatalogueItem => Boolean(dataset));
  }, [datasets, history]);

  if (recentDatasets.length === 0) {
    return (
      <div className="rounded-card border-navy-100 bg-white p-5 text-sm text-navy-500 shadow-card border">
        Aucun jeu de données consulté récemment.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {recentDatasets.map((dataset) => (
        <Link
          key={dataset.id}
          href={`/datasets/${dataset.slug}`}
          className="rounded-card border-navy-100 shadow-card block border bg-white p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            {dataset.categoryName}
          </p>
          <h3 className="text-navy-900 mt-2 text-base font-semibold">
            {dataset.title}
          </h3>
          <p className="text-navy-500 mt-2 text-sm leading-6">
            {dataset.themeName}
          </p>
        </Link>
      ))}
    </div>
  );
}
