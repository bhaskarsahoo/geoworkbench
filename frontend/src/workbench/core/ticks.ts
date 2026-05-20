const NICE_STEPS = [1, 2, 5, 10];

export type DepthTick = {
  depth: number;
  label: string;
  major: boolean;
};

function niceStep(rawStep: number): number {
  if (rawStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(rawStep));
  const magnitude = 10 ** exponent;
  const normalized = rawStep / magnitude;
  const step = NICE_STEPS.find((candidate) => normalized <= candidate) ?? 10;
  return step * magnitude;
}

function formatDepth(depth: number, step: number): string {
  if (step < 1) return `${depth.toFixed(2)}m`;
  if (step < 10) return `${depth.toFixed(1)}m`;
  return `${Math.round(depth)}m`;
}

export function generateDepthTicks(args: {
  fromDepth: number;
  toDepth: number;
  targetPixelSpacing: number;
  pixelsPerMeter: number;
}): DepthTick[] {
  const span = Math.max(0.001, args.toDepth - args.fromDepth);
  const rawStep = args.targetPixelSpacing / Math.max(0.001, args.pixelsPerMeter);
  const minorStep = niceStep(rawStep);
  const majorStep = minorStep * 5;
  const first = Math.ceil(args.fromDepth / minorStep) * minorStep;
  const ticks: DepthTick[] = [];

  for (let depth = first; depth <= args.toDepth + minorStep / 2; depth += minorStep) {
    const roundedDepth = Number(depth.toFixed(4));
    const major = Math.abs((roundedDepth / majorStep) - Math.round(roundedDepth / majorStep)) < 0.0001;
    ticks.push({
      depth: roundedDepth,
      label: formatDepth(roundedDepth, minorStep),
      major,
    });
    if (ticks.length > span * 10 + 1000) break;
  }

  return ticks;
}
