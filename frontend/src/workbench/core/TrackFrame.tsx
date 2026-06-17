import type { ReactNode } from "react";

import type { BoreholeWorkbench, DisplayTrack } from "../../api/types";
import type { DepthScale } from "./depthScale";
import { emptyTrackObject, type TrackObject, type TrackPointerEvent } from "./trackObject";

type Props = {
  data: BoreholeWorkbench;
  track: DisplayTrack;
  scale: DepthScale;
  children: ReactNode;
  headerDetail?: ReactNode;
  className?: string;
  widthStyle?: number | string;
  hitTest?: (args: { depth: number; localX: number; localY: number }) => TrackObject | null;
  onTrackEvent: (event: TrackPointerEvent) => void;
};

export function TrackFrame({
  data,
  track,
  scale,
  children,
  headerDetail,
  className,
  widthStyle,
  hitTest,
  onTrackEvent,
}: Props) {
  function emit(type: TrackPointerEvent["type"], event: React.MouseEvent<HTMLDivElement>) {
    const body = event.currentTarget.querySelector<HTMLElement>(".track-body");
    const bounds = (body ?? event.currentTarget).getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    const depth = scale.yToDepth(localY);
    const object = hitTest?.({ depth, localX, localY }) ?? emptyTrackObject(depth);
    onTrackEvent({
      type,
      trackId: track.id,
      trackType: track.type,
      depth,
      localX,
      localY,
      object,
      nativeEvent: event,
    });
  }

  return (
    <div
      className={`track ${className ?? ""}`}
      data-track-id={track.id}
      data-track-type={track.type}
      style={{ width: widthStyle ?? track.width }}
      onMouseMove={(event) => emit("hover", event)}
      onClick={(event) => emit("click", event)}
      onContextMenu={(event) => {
        event.preventDefault();
        emit("contextmenu", event);
      }}
    >
      <div className="track-title">
        <span className="track-title-text" title={track.title}>
          {track.title}
        </span>
        {headerDetail}
      </div>
      <div className="track-body">{children}</div>
      <span className="sr-only">{data.code}</span>
    </div>
  );
}
