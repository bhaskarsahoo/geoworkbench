import type { BoreholeWorkbench, DisplayTrack } from "../../../api/types";
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

export function LithologyTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="lithology-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => {
        const interval = data.lithology_intervals.find(
          (item) => item.from_depth <= depth && item.to_depth >= depth,
        );
        return interval
          ? {
              kind: "lithology-interval",
              id: interval.id,
              depth,
              interval,
            }
          : null;
      }}
    >
      {data.lithology_intervals
        .filter((interval) => interval.to_depth >= scale.fromDepth && interval.from_depth <= scale.toDepth)
        .map((interval) => (
        <div
          className="lithology-block"
          key={interval.id}
          style={{
            ...scale.intervalToStyle(interval.from_depth, interval.to_depth),
            background: interval.display_color ?? "#64748b",
          }}
          title={`${interval.from_depth}-${interval.to_depth}m ${interval.lithology_code}`}
        >
        </div>
      ))}
    </TrackFrame>
  );
}
