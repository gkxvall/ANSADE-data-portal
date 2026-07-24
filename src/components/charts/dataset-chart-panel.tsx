"use client";

import { useMemo } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DatasetExplorerChartModel,
  DatasetExplorerChartType,
  DatasetExplorerDimensionOption,
} from "@/application/datasets/explorer";

const chartColors = ["#1d6b63", "#b08a4b", "#173d3d", "#7c9d8d", "#d7a84f"];

function formatTooltipValue(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("fr-FR");
  }

  return String(value ?? "");
}

function formatLegendText(value: string) {
  return value;
}

export function DatasetChartPanel({
  chartType,
  chartModel,
  dimensionOptions,
  xDimensionKey,
  seriesDimensionKey,
  onChartTypeChange,
  onXDimensionChange,
  onSeriesDimensionChange,
  onToggleFilter,
  onExportSvg,
  onExportPng,
}: {
  readonly chartType: DatasetExplorerChartType;
  readonly chartModel: DatasetExplorerChartModel;
  readonly dimensionOptions: readonly DatasetExplorerDimensionOption[];
  readonly xDimensionKey: string;
  readonly seriesDimensionKey: string | null;
  readonly onChartTypeChange: (chartType: DatasetExplorerChartType) => void;
  readonly onXDimensionChange: (dimensionKey: string) => void;
  readonly onSeriesDimensionChange: (dimensionKey: string | null) => void;
  readonly onToggleFilter: (dimensionKey: string, value: string) => void;
  readonly onExportSvg: () => void;
  readonly onExportPng: () => void;
}) {
  const allPoints = useMemo(
    () => chartModel.series.flatMap((series) => series.points),
    [chartModel.series],
  );

  const chartData = useMemo(() => {
    const labels = Array.from(
      new Set(allPoints.map((point) => point.label)),
    ).sort((left, right) => left.localeCompare(right, "fr"));

    return labels.map((label) => {
      const row: Record<string, string | number> = { label };
      for (const series of chartModel.series) {
        row[series.name] =
          series.points.find((point) => point.label === label)?.value ?? 0;
      }
      return row;
    });
  }, [allPoints, chartModel.series]);

  const pieData = useMemo(
    () =>
      chartData.map((row) => ({
        label: String(row.label),
        value: chartModel.series.reduce(
          (sum, series) => sum + Number(row[series.name] ?? 0),
          0,
        ),
      })),
    [chartData, chartModel.series],
  );

  return (
    <section className="rounded-[1.5rem] border border-sand-100 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Visualisations
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Graphiques et comparaison
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-sand-200 bg-white px-3 py-2 text-xs font-semibold"
            onClick={onExportSvg}
            type="button"
          >
            Export SVG
          </button>
          <button
            className="rounded-full border border-sand-200 bg-white px-3 py-2 text-xs font-semibold"
            onClick={onExportPng}
            type="button"
          >
            Export PNG
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-navy-800">
          Type
          <select
            className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-normal"
            value={chartType}
            onChange={(event) => onChartTypeChange(event.target.value as DatasetExplorerChartType)}
          >
            <option value="bar">Barres</option>
            <option value="line">Ligne</option>
            <option value="area">Aire</option>
            <option value="pie">Camembert</option>
            <option value="scatter">Nuage</option>
            <option value="kpi">KPI</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-navy-800">
          Axe X
          <select
            className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-normal"
            value={xDimensionKey}
            onChange={(event) => onXDimensionChange(event.target.value)}
          >
            {dimensionOptions.map((dimension) => (
              <option key={dimension.key} value={dimension.key}>
                {dimension.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-navy-800">
          Série
          <select
            className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-normal"
            value={seriesDimensionKey ?? ""}
            onChange={(event) =>
              onSeriesDimensionChange(event.target.value === "" ? null : event.target.value)
            }
          >
            <option value="">Aucune</option>
            {dimensionOptions.map((dimension) => (
              <option key={dimension.key} value={dimension.key}>
                {dimension.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-sand-100 bg-sand-50 px-3 py-2.5 text-xs text-navy-600">
          <p className="font-semibold text-navy-900">Valeur</p>
          <p className="mt-1">Valeur numérique importée</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-sand-100 bg-sand-50 p-4">
        {!chartModel.available ? (
          <div className="text-navy-600 text-sm">{chartModel.reason}</div>
        ) : chartType === "kpi" ? (
          <KpiCards chartData={chartData} />
        ) : (
          <div className="h-[20rem]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => value.toLocaleString("fr-FR")} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend formatter={formatLegendText} />
                  {chartModel.series.map((series, index) => (
                    <Line
                      key={series.name}
                      type="monotone"
                      dataKey={series.name}
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth={2.5}
                    />
                  ))}
                </LineChart>
              ) : chartType === "area" ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => value.toLocaleString("fr-FR")} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend formatter={formatLegendText} />
                  {chartModel.series.map((series, index) => (
                    <Area
                      key={series.name}
                      type="monotone"
                      dataKey={series.name}
                      stroke={chartColors[index % chartColors.length]}
                      fill={chartColors[index % chartColors.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                </AreaChart>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend formatter={formatLegendText} />
                  <Pie data={pieData} dataKey="value" nameKey="label" outerRadius={120} paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : chartType === "scatter" ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => value.toLocaleString("fr-FR")} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Scatter
                    data={chartData.map((point) => ({
                      x: Number(point.label),
                      y: point.value,
                    }))}
                    fill={chartColors[2]}
                  />
                </ScatterChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => value.toLocaleString("fr-FR")} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend formatter={formatLegendText} />
                  {chartModel.series.map((series, index) => (
                    <Bar
                      key={series.name}
                      dataKey={series.name}
                      fill={chartColors[index % chartColors.length]}
                      radius={[8, 8, 0, 0]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2 text-xs text-navy-500 sm:grid-cols-2 xl:grid-cols-3">
        {chartModel.series.map((series) => (
          <button
            key={series.name}
            className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-left"
            onClick={() => onToggleFilter(xDimensionKey, series.points[0]?.label ?? "")}
            type="button"
          >
            <span className="font-semibold text-navy-900">{series.name}</span>
            <span className="ml-2">{series.points.length} points</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function KpiCards({
  chartData,
}: {
  readonly chartData: readonly Record<string, string | number>[];
}) {
  const total = chartData.reduce(
    (sum, entry) => sum + Object.entries(entry).reduce((rowSum, [key, value]) => {
      if (key === "label") return rowSum;
      return rowSum + Number(value ?? 0);
    }, 0),
    0,
  );
  const count = chartData.length;
  const average = count > 0 ? total / count : 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <MetricCard label="Total" value={total.toLocaleString("fr-FR")} />
      <MetricCard label="Moyenne" value={average.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} />
      <MetricCard label="Observations" value={count.toLocaleString("fr-FR")} />
    </div>
  );
}

function MetricCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[1rem] bg-white p-4 shadow-sm">
      <p className="text-navy-500 text-xs font-semibold tracking-[0.14em] uppercase">{label}</p>
      <p className="text-navy-900 mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
