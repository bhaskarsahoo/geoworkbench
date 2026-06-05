import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { getWorkbench } from "../../api/client";
import type { BoreholeListItem, BoreholeWorkbench, Curve, LithologyInterval } from "../../api/types";
import { lithologyPattern } from "../core/lithologyPatterns";

type Props = {
  boreholes: BoreholeListItem[];
  initialIds: number[];
  onOpenWorkbench: (id: number) => void;
};

type AlignMode = "depth" | "rl";

type BoreholeMeta = {
  rl: number;
  x: number | null;
  y: number | null;
  waterLevel: number | null;
};

export function CorrelationWorkspace({ boreholes, initialIds, onOpenWorkbench }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds);
  const [alignMode, setAlignMode] = useState<AlignMode>("depth");
  const queries = useQueries({
    queries: selectedIds.map((id) => ({
      queryKey: ["workbench", id],
      queryFn: () => getWorkbench(id),
      enabled: selectedIds.length > 0,
    })),
  });
  const loaded = queries
    .map((query) => query.data)
    .filter((item): item is BoreholeWorkbench => Boolean(item));
  const domain = useMemo(() => correlationDomain(loaded, alignMode), [loaded, alignMode]);

  const toggleBorehole = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-7),
    );
  };

  return (
    <section className="correlation-workspace">
      <div className="correlation-toolbar">
        <div>
          <h1>Correlation Display</h1>
          <p>Side-by-side synthetic boreholes with seam markers, lithology, and gamma response.</p>
        </div>
        <div className="segmented-control">
          <button
            type="button"
            className={alignMode === "depth" ? "active" : ""}
            onClick={() => setAlignMode("depth")}
          >
            Depth
          </button>
          <button
            type="button"
            className={alignMode === "rl" ? "active" : ""}
            onClick={() => setAlignMode("rl")}
          >
            RL
          </button>
        </div>
      </div>

      <div className="correlation-selector">
        {boreholes.map((item) => (
          <label key={item.id} className={selectedIds.includes(item.id) ? "selected" : ""}>
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => toggleBorehole(item.id)}
            />
            <span>{item.code}</span>
          </label>
        ))}
      </div>

      <div className="correlation-panel">
        <div className="correlation-axis">
          {axisTicks(domain.min, domain.max).map((tick) => (
            <span key={tick} style={{ top: `${toPercent(tick, domain)}%` }}>
              {tick.toFixed(0)}
              {alignMode === "rl" ? " RL" : "m"}
            </span>
          ))}
        </div>
        <div className="correlation-columns">
          {loaded.map((data) => (
            <CorrelationColumn
              key={data.id}
              data={data}
              domain={domain}
              alignMode={alignMode}
              onOpenWorkbench={onOpenWorkbench}
            />
          ))}
          {!loaded.length && <div className="empty">Select boreholes to build a correlation display.</div>}
        </div>
      </div>
    </section>
  );
}

function CorrelationColumn({
  data,
  domain,
  alignMode,
  onOpenWorkbench,
}: {
  data: BoreholeWorkbench;
  domain: { min: number; max: number };
  alignMode: AlignMode;
  onOpenWorkbench: (id: number) => void;
}) {
  const meta = metadataFor(data);
  const gamma = data.curves.find((curve) => curve.key === "ngam" || curve.key === "gamma");
  const gammaPath = gamma ? curvePath(gamma, data, domain, alignMode, meta) : "";
  return (
    <article className="correlation-column">
      <header>
        <strong>{data.code}</strong>
        <span>RL {meta.rl.toFixed(1)}m</span>
        <button type="button" onClick={() => onOpenWorkbench(data.id)}>
          Open
        </button>
      </header>
      <div className="correlation-log">
        <div className="correlation-lithology">
          {data.lithology_intervals.map((interval) => {
            const pattern = lithologyPattern(interval.lithology_code);
            return (
              <div
                key={interval.id}
                className={`correlation-lith lithology-pattern ${pattern.className}`}
                style={{
                  top: `${intervalTop(interval, data, domain, alignMode, meta)}%`,
                  height: `${intervalHeight(interval, data, domain, alignMode, meta)}%`,
                  backgroundColor: interval.display_color ?? pattern.color,
                }}
                title={`${interval.from_depth}-${interval.to_depth}m ${interval.lithology_label}`}
              />
            );
          })}
        </div>
        <svg className="correlation-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
          {gammaPath && <path d={gammaPath} fill="none" stroke="#ef4444" strokeWidth="1.4" />}
        </svg>
        <div className="correlation-markers">
          {data.seam_intervals.map((seam) => {
            const y = depthY((seam.from_depth + seam.to_depth) / 2, data, domain, alignMode, meta);
            return (
              <span key={seam.id} style={{ top: `${y}%` }}>
                <b>{seam.name}</b>
              </span>
            );
          })}
          {meta.waterLevel !== null && (
            <span className="water-marker" style={{ top: `${depthY(meta.waterLevel, data, domain, alignMode, meta)}%` }}>
              <b>WL</b>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function metadataFor(data: BoreholeWorkbench): BoreholeMeta {
  const summary = data.source_imports.find((item) => item.summary?.rl_m)?.summary ?? {};
  return {
    rl: numberValue(summary.rl_m, 220),
    x: nullableNumber(summary.collar_x),
    y: nullableNumber(summary.collar_y),
    waterLevel: nullableNumber(summary.water_level_m),
  };
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function correlationDomain(items: BoreholeWorkbench[], alignMode: AlignMode): { min: number; max: number } {
  if (!items.length) return { min: 0, max: 500 };
  if (alignMode === "depth") {
    return { min: 0, max: Math.max(...items.map((item) => item.total_depth)) };
  }
  const values = items.flatMap((item) => {
    const meta = metadataFor(item);
    return [meta.rl - item.total_depth, meta.rl];
  });
  return { min: Math.floor(Math.min(...values) / 25) * 25, max: Math.ceil(Math.max(...values) / 25) * 25 };
}

function axisTicks(min: number, max: number): number[] {
  const span = Math.max(1, max - min);
  const step = span > 600 ? 100 : span > 280 ? 50 : 25;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= max; value += step) ticks.push(value);
  return ticks;
}

function toPercent(value: number, domain: { min: number; max: number }): number {
  return ((value - domain.min) / Math.max(1, domain.max - domain.min)) * 100;
}

function depthValue(depth: number, data: BoreholeWorkbench, alignMode: AlignMode, meta: BoreholeMeta): number {
  return alignMode === "rl" ? meta.rl - depth : depth;
}

function depthY(
  depth: number,
  data: BoreholeWorkbench,
  domain: { min: number; max: number },
  alignMode: AlignMode,
  meta: BoreholeMeta,
): number {
  const value = depthValue(depth, data, alignMode, meta);
  const percent = toPercent(value, domain);
  return alignMode === "rl" ? 100 - percent : percent;
}

function intervalTop(
  interval: LithologyInterval,
  data: BoreholeWorkbench,
  domain: { min: number; max: number },
  alignMode: AlignMode,
  meta: BoreholeMeta,
): number {
  return alignMode === "rl"
    ? depthY(interval.to_depth, data, domain, alignMode, meta)
    : depthY(interval.from_depth, data, domain, alignMode, meta);
}

function intervalHeight(
  interval: LithologyInterval,
  data: BoreholeWorkbench,
  domain: { min: number; max: number },
  alignMode: AlignMode,
  meta: BoreholeMeta,
): number {
  return Math.max(
    0.3,
    Math.abs(
      depthY(interval.to_depth, data, domain, alignMode, meta) -
        depthY(interval.from_depth, data, domain, alignMode, meta),
    ),
  );
}

function curvePath(
  curve: Curve,
  data: BoreholeWorkbench,
  domain: { min: number; max: number },
  alignMode: AlignMode,
  meta: BoreholeMeta,
): string {
  if (!curve.samples.length) return "";
  const values = curve.samples.map((sample) => sample.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const every = Math.max(1, Math.floor(curve.samples.length / 160));
  return curve.samples
    .filter((_, index) => index % every === 0)
    .map((sample, index) => {
      const x = 8 + ((sample.value - min) / Math.max(0.001, max - min)) * 84;
      const y = depthY(sample.depth, data, domain, alignMode, meta);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
