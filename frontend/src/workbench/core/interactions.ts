import type { TrackPointerEvent } from "./trackObject";
import type { WorkbenchActions } from "../display/workbenchStore";

export function handleTrackPointerEvent(event: TrackPointerEvent, actions: WorkbenchActions) {
  if (event.type === "hover") {
    if (event.object.kind === "curve-sample") {
      actions.setHoveredObject(event.object);
    }
    return;
  }

  if (event.type === "click") {
    if (event.object.kind === "depth") {
      actions.setSelectedDepth(event.object.depth);
      return;
    }
    if (event.object.kind === "lithology-interval") {
      actions.setSelectedDepth(event.object.depth);
      actions.setSelectedInterval(event.object.interval);
      return;
    }
    if (event.object.kind === "curve-sample") {
      actions.setHoveredObject(event.object);
      return;
    }
    if (event.object.kind === "core-image") {
      actions.setSelectedImage(event.object.image);
      return;
    }
    if (event.object.kind === "remark-group") {
      actions.setSelectedRemarkGroup(event.object);
      return;
    }
    if (event.object.kind === "ai-suggestion-group") {
      actions.setSelectedDepth(event.object.depth);
      actions.setSelectedAiSuggestion(event.object.suggestions[0] ?? null);
      return;
    }
  }

  if (event.type === "contextmenu") {
    actions.setContextMenu({
      trackId: event.trackId,
      trackType: event.trackType,
      depth: event.depth,
      object: event.object,
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
  }
}
