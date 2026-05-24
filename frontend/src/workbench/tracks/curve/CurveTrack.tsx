import { useMemo } from "react";

import type { BoreholeWorkbench, Curve, DisplayTrack } from "../../../api/types";
import { nearestSample, normalizedX, samplesForVisibleCurve } from "../../core/curveMath";
import type { DepthScale } from "../../core/depthScale";
import { TrackFrame } from "../../core/TrackFrame";
import type { TrackPointerEvent } from "../../core/trackObject";
import { useWorkbenchStore } from "../../display/workbenchStore";

type Props = {
  data: BoreholeWorkbench;
  track: DisplayTrack;
  scale: DepthScale;
  widthStyle?: number | string;
  onTrackEvent: (event: TrackPointerEvent) => void;
};

export function CurveTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  const { hoveredObject, tooltipsEnabled } = useWorkbenchStore();
  const configuredCurves = track.curves?.filter((curve) => curve.visible) ?? [];
  const curves = useMemo(
    () =>
      configuredCurves
        .map((config) => ({
          config,
          curve: data.curves.find((curve) => curve.key === config.curveKey),
        }))
        .filter((item): item is { config: (typeof configuredCurves)[number]; curve: Curve } =>
          Boolean(item.curve),
        ),
    [configuredCurves, data.curves],
  );
  const hit =
    hoveredObject?.kind === "curve-sample" && curves.some(({ curve }) => curve.key === hoveredObject.curve.key)
      ? hoveredObject
      : null;

  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="curve-track"
      onTrackEvent={onTrackEvent}
      headerDetail={
        <div className="curve-header-stack">
          {configuredCurves.map((curve) => (
            <div key={curve.curveKey} className="curve-header-row">
              <span className="curve-header-min">{formatScaleValue(curve.scale.min)}</span>
              <span className="curve-header-line">
                <i style={{ background: curve.color }} />
                <b style={{ color: curve.color }}>{curve.label}</b>
                <small>{curve.unit}</small>
              </span>
              <span className="curve-header-max">{formatScaleValue(curve.scale.max)}</span>
            </div>
          ))}
        </div>
      }
      hitTest={({ depth }) => {
        const hits = curves
          .map(({ config, curve }) => {
            const nearest = nearestSample(curve, depth);
            if (!nearest) return null;
            return {
              ...nearest,
              config,
              screenXPercent: normalizedX(nearest.sample.value, config.scale.min, config.scale.max),
              screenYPercent: scale.depthToPercent(nearest.sample.depth),
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));
        const sortedHits = hits.sort((a, b) => a.distance - b.distance);
        const best = sortedHits[0];
        return best
          ? {
              kind: "curve-sample",
              id: `${best.curve.key}:${best.sample.depth}`,
            depth: best.sample.depth,
            curve: best.curve,
            sample: best.sample,
              distance: best.distance,
              screenXPercent: best.screenXPercent,
              screenYPercent: best.screenYPercent,
              relatedSamples: sortedHits.map((hit) => ({
                curve: hit.curve,
                sample: hit.sample,
                distance: hit.distance,
                screenXPercent: hit.screenXPercent,
              })),
            }
          : null;
      }}
    >
      <svg className="curve-svg" preserveAspectRatio="none" viewBox="0 0 100 100">
        {curves.map(({ config, curve }) => (
          <polyline
            key={curve.key}
            points={samplesForVisibleCurve(curve.samples, scale.fromDepth, scale.toDepth)
              .filter(
                (sample, index) =>
                  index % 4 === 0 || sample.depth < scale.fromDepth || sample.depth > scale.toDepth,
              )
              .map(
                (sample) =>
                  `${normalizedX(sample.value, config.scale.min, config.scale.max)},${scale.depthToContentPercent(
                    sample.depth,
                  )}`,
              )
              .join(" ")}
            fill="none"
            stroke={config.color}
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {tooltipsEnabled && hit && (
        <div
          className="curve-tooltip multi"
          style={{ left: `${hit.screenXPercent}%`, top: `${hit.screenYPercent}%` }}
        >
          <b>{hit.sample.depth.toFixed(2)} m</b>
          {(hit.relatedSamples ?? [hit]).map((item) => (
            <span key={item.curve.key} className={item.curve.key === hit.curve.key ? "nearest" : ""}>
              <i style={{ background: item.curve.color }} />
              {item.curve.label}: {item.sample.value} {item.curve.unit}
            </span>
          ))}
          <small>
            nearest {hit.curve.label} · delta {hit.distance.toFixed(2)} m · {hit.curve.source_type}
          </small>
        </div>
      )}
    </TrackFrame>
  );
}

function formatScaleValue(value: number) {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/\.?0+$/, "");
}
