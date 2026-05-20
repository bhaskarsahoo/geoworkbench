export type DepthScale = {
  fromDepth: number;
  toDepth: number;
  totalDepth: number;
  visibleSpan: number;
  contentHeight: number;
  topOffset: number;
  depthToY: (depth: number) => number;
  yToDepth: (y: number) => number;
  depthToContentPercent: (depth: number) => number;
  depthToPercent: (depth: number) => number;
  intervalToStyle: (fromDepth: number, toDepth: number) => { top: string; height: string };
};

export function clampDepth(depth: number, totalDepth: number): number {
  return Math.max(0, Math.min(totalDepth, depth));
}

function unclampedDepthToContentPercent(depth: number, fromDepth: number, visibleSpan: number): number {
  return ((depth - fromDepth) / visibleSpan) * 100;
}

export function createDepthScale(
  totalDepth: number,
  contentHeight: number,
  topOffset = 42,
  fromDepth = 0,
  toDepth = totalDepth,
): DepthScale {
  const drawableHeight = Math.max(1, contentHeight - topOffset);
  const safeFrom = clampDepth(Math.min(fromDepth, toDepth), totalDepth);
  const safeTo = clampDepth(Math.max(fromDepth, toDepth), totalDepth);
  const visibleSpan = Math.max(0.001, safeTo - safeFrom);
  return {
    fromDepth: safeFrom,
    toDepth: safeTo,
    totalDepth,
    visibleSpan,
    contentHeight,
    topOffset,
    depthToY: (depth) => ((clampDepth(depth, totalDepth) - safeFrom) / visibleSpan) * drawableHeight,
    yToDepth: (y) => clampDepth(safeFrom + (y / drawableHeight) * visibleSpan, totalDepth),
    depthToContentPercent: (depth) => unclampedDepthToContentPercent(depth, safeFrom, visibleSpan),
    depthToPercent: (depth) =>
      ((topOffset + ((clampDepth(depth, totalDepth) - safeFrom) / visibleSpan) * drawableHeight) /
        contentHeight) *
      100,
    intervalToStyle: (fromDepth, toDepth) => ({
      top: `${((clampDepth(fromDepth, totalDepth) - safeFrom) / visibleSpan) * drawableHeight}px`,
      height: `${Math.max(1, ((toDepth - fromDepth) / visibleSpan) * drawableHeight)}px`,
    }),
  };
}
