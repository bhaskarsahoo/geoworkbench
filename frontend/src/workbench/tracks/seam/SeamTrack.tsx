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

export function SeamTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="seam-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => {
        const seam = data.seam_intervals.find(
          (item) => item.from_depth <= depth && item.to_depth >= depth,
        );
        return seam ? { kind: "seam-interval", id: seam.id, depth, seam } : null;
      }}
    >
      {data.seam_intervals
        .filter((seam) => seam.to_depth >= scale.fromDepth && seam.from_depth <= scale.toDepth)
        .map((seam) => (
        <div
          className="seam-marker"
          key={seam.id}
          style={{
            ...scale.intervalToStyle(seam.from_depth, seam.to_depth),
            minHeight: "4px",
          }}
          title={`${seam.name}: ${seam.from_depth}-${seam.to_depth}m`}
        >
          {seam.name}
        </div>
      ))}
    </TrackFrame>
  );
}
