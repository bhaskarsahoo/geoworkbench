import type { BoreholeWorkbench, DisplayTrack } from "../../../api/types";
import type { DepthScale } from "../../core/depthScale";
import { TrackFrame } from "../../core/TrackFrame";
import { emptyTrackObject, type TrackPointerEvent } from "../../core/trackObject";
import { useWorkbenchStore } from "../../display/workbenchStore";

type Props = {
  data: BoreholeWorkbench;
  track: DisplayTrack;
  scale: DepthScale;
  widthStyle?: number | string;
  onTrackEvent: (event: TrackPointerEvent) => void;
};

export function AiSuggestionsTrack({ data, track, scale, widthStyle, onTrackEvent }: Props) {
  const openSuggestions = data.ai_suggestions.filter(
    (suggestion) =>
      suggestion.status === "open" &&
      suggestion.from_depth !== null &&
      suggestion.from_depth <= scale.toDepth &&
      (suggestion.to_depth ?? suggestion.from_depth) >= scale.fromDepth,
  );

  return (
    <TrackFrame
      data={data}
      track={track}
      scale={scale}
      widthStyle={widthStyle}
      className="ai-track"
      onTrackEvent={onTrackEvent}
      hitTest={({ depth }) => {
        const suggestion = openSuggestions.find((item) => {
          const from = item.from_depth ?? depth;
          const to = item.to_depth ?? from;
          return depth >= from - 0.3 && depth <= to + 0.3;
        });
        return suggestion
          ? {
              ...emptyTrackObject(suggestion.from_depth ?? depth),
              id: `ai:${suggestion.id}`,
              label: suggestion.title,
              data: suggestion,
            }
          : null;
      }}
    >
      {openSuggestions.map((suggestion) => {
        const from = suggestion.from_depth ?? 0;
        const to = suggestion.to_depth ?? from + 0.25;
        return (
          <button
            type="button"
            key={suggestion.id}
            className={`ai-marker ${suggestion.suggestion_type}`}
            style={scale.intervalToStyle(from, Math.max(to, from + 0.2))}
            title={suggestion.title}
            onClick={(event) => {
              event.stopPropagation();
              useWorkbenchStore.getState().setSelectedDepth(from);
            }}
          >
            <span>{suggestion.suggestion_type.replaceAll("_", " ")}</span>
          </button>
        );
      })}
    </TrackFrame>
  );
}
