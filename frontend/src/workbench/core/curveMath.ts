import type { Curve, CurveSample } from "../../api/types";

export type NearestCurveSample = {
  curve: Curve;
  sample: CurveSample;
  distance: number;
};

export function nearestSample(curve: Curve, depth: number): NearestCurveSample | null {
  if (curve.samples.length === 0) return null;
  let best = curve.samples[0];
  let distance = Math.abs(best.depth - depth);
  for (const sample of curve.samples) {
    const nextDistance = Math.abs(sample.depth - depth);
    if (nextDistance < distance) {
      best = sample;
      distance = nextDistance;
    }
  }
  return { curve, sample: best, distance };
}

export function normalizedX(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function samplesForVisibleCurve(
  samples: CurveSample[],
  fromDepth: number,
  toDepth: number,
): CurveSample[] {
  const sorted = [...samples].sort((a, b) => a.depth - b.depth);
  const visible = sorted.filter((sample) => sample.depth >= fromDepth && sample.depth <= toDepth);
  const before = [...sorted].reverse().find((sample) => sample.depth < fromDepth);
  const after = sorted.find((sample) => sample.depth > toDepth);
  return [before, ...visible, after].filter((sample): sample is CurveSample => Boolean(sample));
}
