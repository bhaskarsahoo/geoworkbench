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

export function ImageTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  const fullStripFitHeight = 140;
  const visibleImages = data.core_images.filter(
    (image) =>
      (image.to_depth ?? image.from_depth ?? 0) >= scale.fromDepth &&
      (image.from_depth ?? image.to_depth ?? 0) <= scale.toDepth,
  );

  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="image-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => {
        const image = data.core_images.find(
          (item) =>
            (item.from_depth ?? Number.POSITIVE_INFINITY) <= depth &&
            (item.to_depth ?? Number.NEGATIVE_INFINITY) >= depth,
        );
        return image
          ? {
              kind: "core-image",
              id: `core-image:${image.box_number}`,
              depth,
              image,
            }
          : null;
      }}
    >
      {visibleImages.map((image) => {
        const fromDepth = image.from_depth ?? 0;
        const toDepth = image.to_depth ?? fromDepth + 1;
        const intervalHeight = Math.max(1, scale.depthToY(toDepth) - scale.depthToY(fromDepth));
        const canShowFullStrip = intervalHeight >= fullStripFitHeight;
        const imageClassName = canShowFullStrip ? "core-strip-img core-strip-img-full" : "core-strip-img core-strip-img-crop";
        return (
          <button
            type="button"
            className="core-strip"
            key={image.box_number}
            style={scale.intervalToStyle(fromDepth, toDepth)}
            aria-label={`Open corebox ${image.box_number}, ${fromDepth.toFixed(1)} to ${toDepth.toFixed(1)} meters`}
            title={`Open corebox ${image.box_number}`}
          >
            {image.strip_url ? (
              <img
                className={imageClassName}
                src={image.strip_url}
                alt={`Depth-arranged core strip ${image.box_number}`}
              />
            ) : (
              <CoreLaneStack imageUrl={image.url} boxNumber={image.box_number} />
            )}
          </button>
        );
      })}
    </TrackFrame>
  );
}

function CoreLaneStack({ imageUrl, boxNumber }: { imageUrl: string; boxNumber: number }) {
  return (
    <div className="core-lane-stack" aria-label={`Depth-arranged core lanes for box ${boxNumber}`}>
      {[0, 1, 2, 3].map((lane) => (
        <i key={lane}>
          <b
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `center ${lane === 0 ? "16%" : lane === 1 ? "39%" : lane === 2 ? "62%" : "84%"}`,
            }}
          />
        </i>
      ))}
    </div>
  );
}
