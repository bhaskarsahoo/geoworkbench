import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import type { Curve, DisplayGridItem, DisplayLayout, DisplayTrack, DisplayWidget } from "../../api/types";
import {
  createTrackId,
  createWidgetId,
  defaultGridItem,
  defaultScaleForCurve,
  normalizeDisplayLayout,
  TRACK_CATALOG,
  widgetLabel,
  WIDGET_CATALOG,
} from "./displayEditorModel";

type Props = {
  open: boolean;
  layout: DisplayLayout | null;
  availableCurves: Curve[];
  saving: boolean;
  resetting: boolean;
  onSave: (layout: DisplayLayout) => void;
  onReset: () => void;
  onClose: () => void;
};

const SINGLE_VALUE_METRICS = [
  { value: "total_depth", label: "Total depth" },
  { value: "interval_count", label: "Lithology intervals" },
  { value: "curve_count", label: "Curves" },
  { value: "corebox_count", label: "Corebox images" },
];

type GridGesture = {
  type: "move" | "resize";
  widgetId: string;
  startClientX: number;
  startClientY: number;
  startItem: DisplayGridItem;
};

export function DisplayEditorDialog({
  open,
  layout,
  availableCurves,
  saving,
  resetting,
  onSave,
  onReset,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<DisplayLayout | null>(null);
  const [history, setHistory] = useState<DisplayLayout[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState("log-widget");
  const [settingsWidgetId, setSettingsWidgetId] = useState<string | null>(null);
  const [gesture, setGesture] = useState<GridGesture | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && layout) {
      const normalized = normalizeDisplayLayout(layout, availableCurves);
      setDraft(normalized);
      setHistory([]);
      setSelectedWidgetId(normalized.settings.widgets?.["log-widget"] ? "log-widget" : "");
      setSettingsWidgetId(null);
    }
  }, [availableCurves, layout, open]);

  const widgets = draft?.settings.widgets ?? {};
  const gridItems = draft?.settings.grid?.items ?? [];
  const selectedWidget = selectedWidgetId ? widgets[selectedWidgetId] : null;
  const settingsWidget = settingsWidgetId ? widgets[settingsWidgetId] : null;
  const existingWidgetIds = useMemo(() => new Set(Object.keys(widgets)), [widgets]);

  useEffect(() => {
    if (!gesture) return;
    const handlePointerMove = (event: PointerEvent) => {
      setDraft((current) => {
        if (!current?.settings.grid) return current;
        const bounds = gridRef.current?.getBoundingClientRect();
        const columns = current.settings.grid.columns;
        const rowHeight = current.settings.grid.rowHeight;
        const gap = 8;
        const cellWidth = bounds ? Math.max(1, (bounds.width - gap * (columns - 1)) / columns) : 80;
        const dx = Math.round((event.clientX - gesture.startClientX) / (cellWidth + gap));
        const dy = Math.round((event.clientY - gesture.startClientY) / (rowHeight + gap));
        const next = structuredClone(current);
        next.settings.grid!.items = next.settings.grid!.items.map((item) => {
          if (item.widgetId !== gesture.widgetId) return item;
          if (gesture.type === "move") {
            return clampGridItem(
              { ...item, x: gesture.startItem.x + dx, y: gesture.startItem.y + dy },
              columns,
            );
          }
          return clampGridItem(
            { ...item, w: gesture.startItem.w + dx, h: gesture.startItem.h + dy },
            columns,
          );
        });
        return next;
      });
    };
    const handlePointerUp = () => setGesture(null);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gesture]);

  if (!open) return null;

  if (!layout || !draft) {
    return (
      <div className="display-modal-backdrop">
        <div className="display-modal">
          <div className="display-modal-header">
            <strong>Display Editor</strong>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="display-modal-empty">No display layout is available for this borehole.</div>
        </div>
      </div>
    );
  }

  const updateDraft = (updater: (current: DisplayLayout) => DisplayLayout) => {
    setDraft((current) => {
      if (!current) return current;
      setHistory((items) => [...items, structuredClone(current)]);
      return updater(structuredClone(current));
    });
  };

  const addWidget = (type: string) => {
    const item = WIDGET_CATALOG.find((candidate) => candidate.type === type);
    if (!item) return;
    updateDraft((current) => {
      const next = normalizeDisplayLayout(current, availableCurves);
      const id = createWidgetId(type, new Set(Object.keys(next.settings.widgets ?? {})));
      next.settings.widgets![id] = item.create(availableCurves, existingWidgetIds);
      next.settings.grid!.items.push(defaultGridItem(id, next.settings.grid!.items.length));
      setSelectedWidgetId(id);
      return next;
    });
  };

  const removeWidget = (widgetId: string) => {
    if (Object.keys(widgets).length <= 1) return;
    updateDraft((current) => {
      delete current.settings.widgets?.[widgetId];
      current.settings.grid!.items = current.settings.grid!.items.filter((item) => item.widgetId !== widgetId);
      if (selectedWidgetId === widgetId) {
        setSelectedWidgetId(current.settings.grid!.items[0]?.widgetId ?? "");
      }
      if (settingsWidgetId === widgetId) {
        setSettingsWidgetId(null);
      }
      return current;
    });
  };

  const cloneWidget = (widgetId: string) => {
    const widget = widgets[widgetId];
    if (!widget) return;
    updateDraft((current) => {
      const existingIds = new Set(Object.keys(current.settings.widgets ?? {}));
      const id = createWidgetId(`${widget.type}-copy`, existingIds);
      current.settings.widgets![id] = {
        ...structuredClone(widget),
        title: `${widget.title} Copy`,
        sourceWidgetId: widgetId,
      };
      current.settings.grid!.items.push(defaultGridItem(id, current.settings.grid!.items.length));
      setSelectedWidgetId(id);
      return current;
    });
  };

  const updateGridItem = (widgetId: string, patch: Partial<DisplayGridItem>) => {
    updateDraft((current) => {
      current.settings.grid!.items = current.settings.grid!.items.map((item) =>
        item.widgetId === widgetId ? clampGridItem({ ...item, ...patch }) : item,
      );
      return current;
    });
  };

  const updateWidget = (widgetId: string, updater: (widget: DisplayWidget) => DisplayWidget) => {
    updateDraft((current) => {
      const widget = current.settings.widgets?.[widgetId];
      if (!widget) return current;
      current.settings.widgets![widgetId] = updater(structuredClone(widget));
      return current;
    });
  };

  const startGridGesture = (
    type: GridGesture["type"],
    widgetId: string,
    item: DisplayGridItem,
    event: ReactPointerEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draft) return;
    setHistory((items) => [...items, structuredClone(draft)]);
    setSelectedWidgetId(widgetId);
    setGesture({
      type,
      widgetId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startItem: structuredClone(item),
    });
  };

  const undo = () => {
    setHistory((items) => {
      const previous = items.at(-1);
      if (!previous) return items;
      setDraft(previous);
      return items.slice(0, -1);
    });
  };

  const cancel = () => {
    setDraft(normalizeDisplayLayout(layout, availableCurves));
    setHistory([]);
    onClose();
  };

  return (
    <div className="display-modal-backdrop">
      <div className="display-modal">
        <div className="display-modal-header">
          <div>
            <strong>Display Editor</strong>
            <span>{draft.name}</span>
          </div>
          <div className="display-modal-actions">
            <button type="button" disabled={!history.length || saving} onClick={undo}>
              Undo
            </button>
            <button type="button" disabled={resetting || saving} onClick={onReset}>
              {resetting ? "Resetting..." : "Reset default"}
            </button>
            <button type="button" disabled={saving} onClick={cancel}>
              Cancel
            </button>
            <button type="button" disabled={saving} onClick={() => onSave(draft)}>
              {saving ? "Saving..." : "Save display"}
            </button>
          </div>
        </div>

        <div className="display-editor-shell">
          <aside className="widget-collection">
            <h2>Widgets</h2>
            <div className="widget-palette">
            {WIDGET_CATALOG.map((item) => (
              <button
                key={item.type}
                type="button"
                title={item.label}
                aria-label={`Add ${item.label}`}
                onClick={() => addWidget(item.type)}
              >
                <strong>{item.icon}</strong>
              </button>
            ))}
            </div>
          </aside>

          <section className="display-canvas-panel">
            <div
              ref={gridRef}
              className="display-grid-canvas"
              style={{ gridTemplateColumns: `repeat(${draft.settings.grid?.columns ?? 12}, 1fr)` }}
            >
              {gridItems.map((item) => {
                const widget = widgets[item.widgetId];
                if (!widget) return null;
                return (
                  <div
                    key={item.widgetId}
                    role="button"
                    tabIndex={0}
                    className={`display-widget-tile ${selectedWidgetId === item.widgetId ? "selected" : ""}`}
                    style={{
                      gridColumn: `${item.x + 1} / span ${item.w}`,
                      gridRow: `${item.y + 1} / span ${item.h}`,
                    }}
                    onClick={() => setSelectedWidgetId(item.widgetId)}
                    onPointerDown={(event) => startGridGesture("move", item.widgetId, item, event)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setSelectedWidgetId(item.widgetId);
                      setSettingsWidgetId(item.widgetId);
                    }}
                  >
                    <span>{widget.type}</span>
                    <strong>{widgetLabel(widget)}</strong>
                    <small>
                      x{item.x} y{item.y} w{item.w} h{item.h}
                    </small>
                    <button
                      type="button"
                      className="display-widget-resize"
                      title="Resize widget"
                      aria-label={`Resize ${widget.title}`}
                      onPointerDown={(event) => startGridGesture("resize", item.widgetId, item, event)}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="widget-inspector">
            <h2>Display Settings</h2>
            <label>
              Display name
              <input
                value={draft.name}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Columns
              <input
                type="number"
                min="4"
                max="24"
                value={draft.settings.grid?.columns ?? 12}
                onChange={(event) =>
                  updateDraft((current) => {
                    current.settings.grid!.columns = Number(event.target.value);
                    return current;
                  })
                }
              />
            </label>

            <h2>Selected Widget</h2>
            {selectedWidget && (
              <WidgetInspector
                widgetId={selectedWidgetId}
                widget={selectedWidget}
                gridItem={gridItems.find((item) => item.widgetId === selectedWidgetId) ?? null}
                availableCurves={availableCurves}
                onOpenSettings={() => setSettingsWidgetId(selectedWidgetId)}
                onClone={() => cloneWidget(selectedWidgetId)}
                onRemove={() => removeWidget(selectedWidgetId)}
                onUpdateGrid={(patch) => updateGridItem(selectedWidgetId, patch)}
                onUpdateWidget={(updater) => updateWidget(selectedWidgetId, updater)}
              />
            )}
          </aside>
        </div>

        {settingsWidget && (
          <WidgetSettingsDialog
            widgetId={settingsWidgetId!}
            widget={settingsWidget}
            availableCurves={availableCurves}
            onClose={() => setSettingsWidgetId(null)}
            onUpdateWidget={(updater) => updateWidget(settingsWidgetId!, updater)}
          />
        )}
      </div>
    </div>
  );
}

function WidgetInspector({
  widgetId,
  widget,
  gridItem,
  availableCurves,
  onOpenSettings,
  onClone,
  onRemove,
  onUpdateGrid,
  onUpdateWidget,
}: {
  widgetId: string;
  widget: DisplayWidget;
  gridItem: DisplayGridItem | null;
  availableCurves: Curve[];
  onOpenSettings: () => void;
  onClone: () => void;
  onRemove: () => void;
  onUpdateGrid: (patch: Partial<DisplayGridItem>) => void;
  onUpdateWidget: (updater: (widget: DisplayWidget) => DisplayWidget) => void;
}) {
  return (
    <div className="widget-settings-form">
      <small>{widgetId}</small>
      <label>
        Title
        <input value={widget.title} onChange={(event) => onUpdateWidget((item) => ({ ...item, title: event.target.value }))} />
      </label>
      {widget.type === "singleValue" && (
        <label>
          Metric
          <select
            value={widget.metric ?? "total_depth"}
            onChange={(event) => onUpdateWidget((item) => ({ ...item, metric: event.target.value }))}
          >
            {SINGLE_VALUE_METRICS.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {gridItem && (
        <div className="grid-fieldset">
          {(["x", "y", "w", "h"] as const).map((field) => (
            <label key={field}>
              {field.toUpperCase()}
              <input
                type="number"
                min={field === "w" || field === "h" ? 1 : 0}
                max={field === "w" ? 12 : 30}
                value={gridItem[field]}
                onChange={(event) => onUpdateGrid({ [field]: Number(event.target.value) })}
              />
            </label>
          ))}
        </div>
      )}
      <div className="widget-action-row">
        <button type="button" onClick={onOpenSettings}>
          Widget settings
        </button>
        <button type="button" onClick={onClone}>
          Clone
        </button>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
      {widget.type === "logWidget" && (
        <small>{availableCurves.length} geophysical curve(s) are available for curve tracks.</small>
      )}
    </div>
  );
}

function WidgetSettingsDialog({
  widgetId,
  widget,
  availableCurves,
  onClose,
  onUpdateWidget,
}: {
  widgetId: string;
  widget: DisplayWidget;
  availableCurves: Curve[];
  onClose: () => void;
  onUpdateWidget: (updater: (widget: DisplayWidget) => DisplayWidget) => void;
}) {
  return (
    <div className="widget-settings-modal" role="dialog" aria-modal="true">
      <div className="image-modal-header">
        <strong>{widget.title} Settings</strong>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="widget-settings-body">
        <label>
          Widget title
          <input value={widget.title} onChange={(event) => onUpdateWidget((item) => ({ ...item, title: event.target.value }))} />
        </label>
        {widget.type === "logWidget" ? (
          <LogWidgetSettings widget={widget} availableCurves={availableCurves} onUpdateWidget={onUpdateWidget} />
        ) : (
          <div className="settings-note">
            {widgetId} stores widget-level settings in display JSON. Specialized controls can be added here as each widget matures.
          </div>
        )}
      </div>
    </div>
  );
}

function LogWidgetSettings({
  widget,
  availableCurves,
  onUpdateWidget,
}: {
  widget: DisplayWidget;
  availableCurves: Curve[];
  onUpdateWidget: (updater: (widget: DisplayWidget) => DisplayWidget) => void;
}) {
  const tracks = widget.tracks ?? [];
  const existingTrackIds = new Set(tracks.map((track) => track.id));

  const updateTracks = (updater: (tracks: DisplayTrack[]) => DisplayTrack[]) => {
    onUpdateWidget((item) => ({ ...item, tracks: updater(item.tracks ?? []) }));
  };

  return (
    <div className="log-widget-settings">
      <section className="track-editor">
        <strong>Add Track</strong>
        <div className="catalog-actions">
          {TRACK_CATALOG.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                updateTracks((items) => {
                  const id = createTrackId(item.id, new Set(items.map((track) => track.id)));
                  return [...items, { ...item.create(availableCurves, existingTrackIds), id }];
                })
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {tracks.map((track, index) => (
        <TrackSettings
          key={track.id}
          track={track}
          index={index}
          tracks={tracks}
          availableCurves={availableCurves}
          onUpdateTracks={updateTracks}
        />
      ))}
    </div>
  );
}

function TrackSettings({
  track,
  index,
  tracks,
  availableCurves,
  onUpdateTracks,
}: {
  track: DisplayTrack;
  index: number;
  tracks: DisplayTrack[];
  availableCurves: Curve[];
  onUpdateTracks: (updater: (tracks: DisplayTrack[]) => DisplayTrack[]) => void;
}) {
  const missingCurves =
    track.type === "curve"
      ? availableCurves.filter((curve) => !track.curves?.some((item) => item.curveKey === curve.key))
      : [];

  const patchTrack = (patch: Partial<DisplayTrack>) => {
    onUpdateTracks((items) => items.map((item) => (item.id === track.id ? { ...item, ...patch } : item)));
  };

  return (
    <section className="track-editor">
      <div className="track-editor-head">
        <label>
          <input type="checkbox" checked={track.visible} onChange={(event) => patchTrack({ visible: event.target.checked })} />
          <span>{track.title}</span>
        </label>
        <div>
          <button type="button" disabled={index === 0} onClick={() => onUpdateTracks((items) => moveItem(items, index, index - 1))}>
            Up
          </button>
          <button
            type="button"
            disabled={index === tracks.length - 1}
            onClick={() => onUpdateTracks((items) => moveItem(items, index, index + 1))}
          >
            Down
          </button>
          <button type="button" disabled={tracks.length <= 1} onClick={() => onUpdateTracks((items) => items.filter((item) => item.id !== track.id))}>
            Remove
          </button>
        </div>
      </div>

      <div className="track-settings-grid">
        <label>
          Title
          <input value={track.title} onChange={(event) => patchTrack({ title: event.target.value })} />
        </label>
        <label>
          Width
          <input type="number" min="40" max="600" value={track.width} onChange={(event) => patchTrack({ width: Number(event.target.value) })} />
        </label>
      </div>

      {track.type === "curve" && (
        <div className="curve-settings-list">
          <strong>Curves From Geophysical Logs</strong>
          <div className="catalog-actions">
            {missingCurves.map((curve) => (
              <button
                key={curve.key}
                type="button"
                onClick={() =>
                  patchTrack({
                    curves: [
                      ...(track.curves ?? []),
                      {
                        curveKey: curve.key,
                        label: curve.label,
                        unit: curve.unit,
                        color: curve.color,
                        visible: true,
                        scale: defaultScaleForCurve(curve),
                      },
                    ],
                  })
                }
              >
                Add {curve.label}
              </button>
            ))}
          </div>
          {track.curves?.map((curve) => (
            <div key={curve.curveKey} className="curve-editor">
              <label>
                <input
                  type="checkbox"
                  checked={curve.visible}
                  onChange={(event) =>
                    patchTrack({
                      curves: track.curves?.map((item) =>
                        item.curveKey === curve.curveKey ? { ...item, visible: event.target.checked } : item,
                      ),
                    })
                  }
                />
                <span style={{ color: curve.color }}>{curve.label}</span>
              </label>
              <div className="curve-scale-grid">
                <label>
                  Min
                  <input
                    type="number"
                    value={curve.scale.min}
                    onChange={(event) =>
                      patchTrack({
                        curves: track.curves?.map((item) =>
                          item.curveKey === curve.curveKey
                            ? { ...item, scale: { ...item.scale, min: Number(event.target.value), mode: "manual" } }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Max
                  <input
                    type="number"
                    value={curve.scale.max}
                    onChange={(event) =>
                      patchTrack({
                        curves: track.curves?.map((item) =>
                          item.curveKey === curve.curveKey
                            ? { ...item, scale: { ...item.scale, max: Number(event.target.value), mode: "manual" } }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Color
                  <input
                    type="color"
                    value={curve.color}
                    onChange={(event) =>
                      patchTrack({
                        curves: track.curves?.map((item) =>
                          item.curveKey === curve.curveKey ? { ...item, color: event.target.value } : item,
                        ),
                      })
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => patchTrack({ curves: track.curves?.filter((item) => item.curveKey !== curve.curveKey) })}
              >
                Remove curve
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function moveItem<T>(items: T[], index: number, target: number) {
  const next = [...items];
  if (target < 0 || target >= next.length || target === index) return next;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function clampGridItem(item: DisplayGridItem, columns = 12): DisplayGridItem {
  const width = Math.max(1, Math.min(columns, item.w));
  return {
    ...item,
    w: width,
    x: Math.max(0, Math.min(columns - width, item.x)),
    y: Math.max(0, Math.min(30, item.y)),
    h: Math.max(1, Math.min(12, item.h)),
  };
}
