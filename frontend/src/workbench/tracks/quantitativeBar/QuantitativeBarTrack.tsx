import type { BoreholeWorkbench, DisplayTrack, LithologyInterval } from "../../../api/types";
import type { DepthScale } from "../../core/depthScale";
import { TrackFrame } from "../../core/TrackFrame";
import type { TrackPointerEvent } from "../../core/trackObject";

type Props = {
  data: BoreholeWorkbench;
  track: DisplayTrack;
  scale: DepthScale;
  widthStyle?: number | string;
  onTrackEvent: (event: TrackPointerEvent) => void;
};

function valueForInterval(track: DisplayTrack, interval: LithologyInterval): number | null {
  if (!track.valueField) return null;
  const raw = interval[track.valueField];
  if (raw === null || raw === undefined) return null;
  return raw * (track.valueMultiplier ?? 1);
}

export function QuantitativeBarTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  const min = track.min ?? 0;
  const max = track.max ?? 100;
  const span = Math.max(0.001, max - min);

  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="quant-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => {
        const interval = data.lithology_intervals.find(
          (item) => item.from_depth <= depth && item.to_depth >= depth,
        );
        return interval ? { kind: "lithology-interval", id: interval.id, depth, interval } : null;
      }}
    >
      {data.lithology_intervals
        .filter((interval) => interval.to_depth >= scale.fromDepth && interval.from_depth <= scale.toDepth)
        .map((interval) => {
          const value = valueForInterval(track, interval);
          if (value === null) return null;
          const width = Math.max(0, Math.min(100, ((value - min) / span) * 100));
          return (
            <div
              key={`${track.id}:${interval.id}`}
              className="quant-row"
              style={scale.intervalToStyle(interval.from_depth, interval.to_depth)}
              title={`${track.title}: ${value.toFixed(1)}${track.unit ?? ""}`}
            >
              <span style={{ width: `${width}%`, background: track.color ?? "#55b7aa" }} />
            </div>
          );
        })}
    </TrackFrame>
  );
}

