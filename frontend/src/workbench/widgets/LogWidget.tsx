import { type CSSProperties, useState } from "react";

import type { BoreholeWorkbench } from "../../api/types";
import { createDepthScale } from "../core/depthScale";
import { handleTrackPointerEvent } from "../core/interactions";
import type { TrackPointerEvent } from "../core/trackObject";
import { useWorkbenchStore } from "../display/workbenchStore";
import { AiSuggestionsTrack } from "../tracks/aiSuggestions/AiSuggestionsTrack";
import { CurveTrack } from "../tracks/curve/CurveTrack";
import { DepthTrack } from "../tracks/depth/DepthTrack";
import { LithologyTrack } from "../tracks/lithology/LithologyTrack";
import { QuantitativeBarTrack } from "../tracks/quantitativeBar/QuantitativeBarTrack";
import { RemarksTrack } from "../tracks/remarks/RemarksTrack";
import { SeamTrack } from "../tracks/seam/SeamTrack";

type Props = {
  data: BoreholeWorkbench;
};

export function LogWidget({ data }: Props) {
  const store = useWorkbenchStore();
  const {
    selectedDepth,
    contextMenu,
    setContextMenu,
    depthWindow,
    setDepthWindow,
    tooltipsEnabled,
    setTooltipsEnabled,
  } = store;
  const [rubberBand, setRubberBand] = useState<{
    startY: number;
    currentY: number;
    startDepth: number;
    currentDepth: number;
  } | null>(null);
  const tracks = data.layout?.settings.widgets?.["log-widget"]?.tracks ?? [];
  const visibleTracks = tracks.filter((track) => track.visible && track.type !== "images");
  const maxVisibleCurves = Math.max(
    0,
    ...visibleTracks
      .filter((track) => track.type === "curve")
      .map((track) => track.curves?.filter((curve) => curve.visible).length ?? 0),
  );
  const headerHeight = Math.max(88, 46 + maxVisibleCurves * 14);
  const height = Math.max(720, data.total_depth * 1.35);
  const scale = createDepthScale(
    data.total_depth,
    height,
    headerHeight,
    depthWindow?.fromDepth ?? 0,
    depthWindow?.toDepth ?? data.total_depth,
  );
  const totalConfiguredWidth = visibleTracks.reduce((sum, track) => sum + track.width, 0);
  const widthForTrack = (trackWidth: number) =>
    totalConfiguredWidth > 0 ? `${(trackWidth / totalConfiguredWidth) * 100}%` : `${100 / visibleTracks.length}%`;
  const onTrackEvent = (event: TrackPointerEvent) => handleTrackPointerEvent(event, store);
  const applyZoom = (centerDepth: number, factor: number) => {
    const span = scale.visibleSpan;
    const nextSpan = Math.max(2, Math.min(data.total_depth, span * factor));
    const ratio = (centerDepth - scale.fromDepth) / span;
    let fromDepth = centerDepth - nextSpan * ratio;
    let toDepth = fromDepth + nextSpan;
    if (fromDepth < 0) {
      fromDepth = 0;
      toDepth = nextSpan;
    }
    if (toDepth > data.total_depth) {
      toDepth = data.total_depth;
      fromDepth = data.total_depth - nextSpan;
    }
    setDepthWindow({ fromDepth, toDepth });
  };

  return (
    <div className="log-widget">
      <div className="log-header">
        <div>
          <h1>{data.title}</h1>
          <p>
            {data.code} · {data.state ?? "Unknown state"} · {data.total_depth} m ·{" "}
            {data.source_workbook}
          </p>
        </div>
        <span className="status-pill">Seeded demo data</span>
      </div>
      <div className="track-scroll">
        <div
          className="track-row"
          style={
            {
              height,
              "--track-header-height": `${headerHeight}px`,
            } as CSSProperties
          }
          onMouseDown={(event) => {
            if (event.button !== 0) return;
            if ((event.target as HTMLElement).closest(".track-title")) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            const y = event.clientY - bounds.top - scale.topOffset;
            setRubberBand({
              startY: y,
              currentY: y,
              startDepth: scale.yToDepth(y),
              currentDepth: scale.yToDepth(y),
            });
          }}
          onMouseMove={(event) => {
            if (!rubberBand) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            const y = event.clientY - bounds.top - scale.topOffset;
            setRubberBand({
              ...rubberBand,
              currentY: y,
              currentDepth: scale.yToDepth(y),
            });
          }}
          onMouseUp={() => {
            if (!rubberBand) return;
            const fromDepth = Math.min(rubberBand.startDepth, rubberBand.currentDepth);
            const toDepth = Math.max(rubberBand.startDepth, rubberBand.currentDepth);
            if (toDepth - fromDepth >= 1) {
              setDepthWindow({ fromDepth, toDepth });
            }
            setRubberBand(null);
          }}
          onMouseLeave={() => setRubberBand(null)}
          onWheel={(event) => {
            if (!event.altKey && !event.ctrlKey) return;
            event.preventDefault();
            const bounds = event.currentTarget.getBoundingClientRect();
            const y = event.clientY - bounds.top - scale.topOffset;
            const centerDepth = scale.yToDepth(y);
            applyZoom(centerDepth, event.deltaY < 0 ? 0.75 : 1.35);
          }}
        >
          {visibleTracks.map((track) => {
            if (track.type === "depthAxis") {
              return (
                <DepthTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            if (track.type === "lithology") {
              return (
                <LithologyTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            if (track.type === "seam") {
              return (
                <SeamTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            if (track.type === "curve") {
              return (
                <CurveTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            if (track.type === "quantitativeBar") {
              return (
                <QuantitativeBarTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            if (track.type === "remarks") {
              return (
                <RemarksTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            if (track.type === "aiSuggestions") {
              return (
                <AiSuggestionsTrack
                  key={track.id}
                  data={data}
                  track={track}
                  scale={scale}
                  widthStyle={widthForTrack(track.width)}
                  onTrackEvent={onTrackEvent}
                />
              );
            }
            return (
              <div key={track.id} className="track" style={{ width: widthForTrack(track.width) }}>
                <div className="track-title">{track.title}</div>
              </div>
            );
          })}
          {selectedDepth !== null && (
            <div
              className="crosshair"
              style={{ top: `${scale.topOffset + scale.depthToY(selectedDepth)}px` }}
            />
          )}
          {rubberBand && (
            <div
              className="rubber-band"
              style={{
                top: Math.min(rubberBand.startY, rubberBand.currentY) + scale.topOffset,
                height: Math.abs(rubberBand.currentY - rubberBand.startY),
              }}
            >
              <span>
                {Math.min(rubberBand.startDepth, rubberBand.currentDepth).toFixed(2)}m -{" "}
                {Math.max(rubberBand.startDepth, rubberBand.currentDepth).toFixed(2)}m
              </span>
            </div>
          )}
          {contextMenu && (
            <div className="track-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
              <strong>{contextMenu.trackType}</strong>
              <span>{contextMenu.depth.toFixed(2)} m</span>
              <span>{contextMenu.object.kind}</span>
              <button type="button" onClick={() => applyZoom(contextMenu.depth, 0.6)}>
                Zoom in here
              </button>
              <button type="button" onClick={() => applyZoom(contextMenu.depth, 1.6)}>
                Zoom out here
              </button>
              <button type="button" onClick={() => setDepthWindow(null)}>
                Full depth
              </button>
              <button
                type="button"
                onClick={() => {
                  setTooltipsEnabled(!tooltipsEnabled);
                  setContextMenu(null);
                }}
              >
                {tooltipsEnabled ? "Disable tooltips" : "Enable tooltips"}
              </button>
              <button type="button" onClick={() => setContextMenu(null)}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
      {depthWindow && (
        <div className="zoom-reset">
          <span>
            Zoom {depthWindow.fromDepth.toFixed(2)}m - {depthWindow.toDepth.toFixed(2)}m
          </span>
          <button type="button" onClick={() => setDepthWindow(null)}>
            Full depth
          </button>
        </div>
      )}
    </div>
  );
}
