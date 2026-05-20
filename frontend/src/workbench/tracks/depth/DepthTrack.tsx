import type { BoreholeWorkbench, DisplayTrack } from "../../../api/types";
import type { DepthScale } from "../../core/depthScale";
import { TrackFrame } from "../../core/TrackFrame";
import type { TrackPointerEvent } from "../../core/trackObject";
import { generateDepthTicks } from "../../core/ticks";

type Props = {
  data: BoreholeWorkbench;
  track: DisplayTrack;
  scale: DepthScale;
  widthStyle?: number | string;
  onTrackEvent: (event: TrackPointerEvent) => void;
};

export function DepthTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  const pixelsPerMeter = (scale.contentHeight - scale.topOffset) / scale.visibleSpan;
  const ticks = generateDepthTicks({
    fromDepth: scale.fromDepth,
    toDepth: scale.toDepth,
    targetPixelSpacing: 42,
    pixelsPerMeter,
  });

  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="depth-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => ({ kind: "depth", id: `depth:${depth.toFixed(2)}`, depth })}
    >
      {ticks.map((tick) => {
        return (
          <div
            key={tick.depth}
            className={`depth-mark ${tick.major ? "major" : "minor"}`}
            style={{ top: `${scale.depthToY(tick.depth)}px` }}
          >
            {tick.label}
          </div>
        );
      })}
    </TrackFrame>
  );
}
