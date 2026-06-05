import type { LithologyInterval } from "../../api/types";

export type LithologyPattern = {
  code: string;
  label: string;
  className: string;
  color: string;
};

const PATTERNS: LithologyPattern[] = [
  { code: "COAL", label: "Coal", className: "pattern-coal", color: "#111827" },
  { code: "SHCOAL", label: "Shaly coal", className: "pattern-coal", color: "#1f2933" },
  { code: "CARBSHL", label: "Carbonaceous shale", className: "pattern-carbonaceous", color: "#394047" },
  { code: "CARBCLAY", label: "Carbonaceous clay", className: "pattern-carbonaceous", color: "#4b5563" },
  { code: "SH", label: "Shale", className: "pattern-shale", color: "#59666c" },
  { code: "CLAY", label: "Claystone", className: "pattern-clay", color: "#8ca0a6" },
  { code: "SS", label: "Sandstone", className: "pattern-sandstone", color: "#d4a257" },
  { code: "SSMTCG", label: "Sandstone", className: "pattern-sandstone", color: "#d4a257" },
  { code: "SLT", label: "Siltstone", className: "pattern-siltstone", color: "#b8a77a" },
  { code: "OB", label: "Overburden", className: "pattern-overburden", color: "#c6b18a" },
];

export function lithologyPattern(code: string | null | undefined): LithologyPattern {
  const normalized = (code ?? "").trim().toUpperCase();
  return (
    PATTERNS.find((pattern) => pattern.code === normalized) ?? {
      code: normalized || "UNK",
      label: normalized || "Unknown",
      className: "pattern-default",
      color: "#64748b",
    }
  );
}

export function legendForIntervals(intervals: LithologyInterval[]): LithologyPattern[] {
  const seen = new Set<string>();
  const legend: LithologyPattern[] = [];
  for (const interval of intervals) {
    const pattern = lithologyPattern(interval.lithology_code);
    if (seen.has(pattern.code)) continue;
    seen.add(pattern.code);
    legend.push(pattern);
  }
  return legend.slice(0, 8);
}
