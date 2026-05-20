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

type RemarkGroup = {
  depth: number;
  y: number;
  count: number;
  text: string;
  remarks: Array<{ depth: number; text: string; sourceRow: number | null }>;
};

function groupedRemarks(data: BoreholeWorkbench, scale: DepthScale): RemarkGroup[] {
  const remarkIntervals = data.lithology_intervals
    .filter((item) => item.remark && item.from_depth <= scale.toDepth && item.to_depth >= scale.fromDepth)
    .map((item) => ({
      depth: item.from_depth,
      text: item.remark ?? "",
      sourceRow: item.source_row,
    }))
    .sort((a, b) => a.depth - b.depth);

  const groups: RemarkGroup[] = [];
  const bucketPixels = 26;

  for (const remark of remarkIntervals) {
    const y = scale.depthToY(remark.depth);
    const last = groups.at(-1);
    if (last && Math.abs(last.y - y) <= bucketPixels) {
      last.count += 1;
      last.text = `${last.text}; ${remark.text}`;
      last.remarks.push(remark);
      last.depth = Math.min(last.depth, remark.depth);
      last.y = Math.min(last.y, y);
    } else {
      groups.push({ depth: remark.depth, y, count: 1, text: remark.text, remarks: [remark] });
    }
  }

  return groups;
}

export function RemarksTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  const groups = groupedRemarks(data, scale);

  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="remarks-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => {
        const y = scale.depthToY(depth);
        const group = groups.find((item) => y >= item.y && y <= item.y + 26);
        return group
          ? {
              kind: "remark-group",
              id: `remarks:${group.depth}:${group.count}`,
              depth: group.depth,
              label: group.count > 1 ? `${group.depth.toFixed(1)}m group` : group.text,
              remarks: group.remarks,
            }
          : null;
      }}
    >
      {groups.map((group) => (
        <div
          key={`${group.depth}:${group.count}`}
          className="remark-group"
          style={{ top: `${group.y}px` }}
          title={group.text}
        >
          <b>{group.count}</b>
          <span>{group.count > 1 ? `${group.depth.toFixed(1)}m group` : group.text}</span>
        </div>
      ))}
    </TrackFrame>
  );
}
