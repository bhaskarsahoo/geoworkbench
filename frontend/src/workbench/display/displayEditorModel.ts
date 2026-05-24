import type { Curve, DisplayGridItem, DisplayLayout, DisplayTrack, DisplayWidget } from "../../api/types";

export type WidgetCatalogItem = {
  type: string;
  label: string;
  description: string;
  create: (availableCurves: Curve[], existingIds: Set<string>) => DisplayWidget;
};

export type TrackCatalogItem = {
  id: string;
  label: string;
  create: (availableCurves: Curve[], existingIds: Set<string>) => DisplayTrack;
};

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: "singleValue",
    label: "Single Value",
    description: "Compact KPI such as depth, interval count, curve count, or corebox count.",
    create: () => ({
      type: "singleValue",
      title: "Total Depth",
      metric: "total_depth",
      settings: { unit: "m" },
    }),
  },
  {
    type: "logWidget",
    label: "Log Widget",
    description: "Depth-indexed borehole visualization with configurable tracks and curves.",
    create: (availableCurves) => ({
      type: "logWidget",
      title: "Borehole Log",
      tracks: defaultTracks(availableCurves),
      settings: { virtualRange: "full-depth", visibleRange: "interactive" },
    }),
  },
  {
    type: "aiWorkflow",
    label: "AI Workflow",
    description: "Suggestion queue and assistant summary for central review.",
    create: () => ({ type: "aiWorkflow", title: "AI Workflow", settings: { showSummary: true } }),
  },
  {
    type: "intervalDetails",
    label: "Interval Details",
    description: "Selected-depth metadata, corebox preview, and geologist correction form.",
    create: () => ({ type: "intervalDetails", title: "Depth Metadata", settings: { editable: true } }),
  },
  {
    type: "exportPanel",
    label: "Export",
    description: "Approval checks and corrected-log export controls.",
    create: () => ({ type: "exportPanel", title: "Export", settings: { showReadiness: true } }),
  },
  {
    type: "validationPanel",
    label: "Validation",
    description: "Validation counts and issue list.",
    create: () => ({ type: "validationPanel", title: "Validation", settings: { maxIssues: 8 } }),
  },
  {
    type: "dataArrival",
    label: "Data Arrival",
    description: "Source file uploads, processing, and import actions.",
    create: () => ({ type: "dataArrival", title: "Data Arrival", settings: { allowUpload: true } }),
  },
];

export const TRACK_CATALOG: TrackCatalogItem[] = [
  {
    id: "depth",
    label: "Depth",
    create: () => ({ id: "depth", type: "depthAxis", title: "Depth", visible: true, width: 70 }),
  },
  {
    id: "lithology",
    label: "Lithology",
    create: () => ({
      id: "lithology",
      type: "lithology",
      title: "Lithology",
      visible: true,
      width: 180,
    }),
  },
  {
    id: "seam",
    label: "Seam",
    create: () => ({ id: "seam", type: "seam", title: "Seam", visible: true, width: 90 }),
  },
  {
    id: "recovery",
    label: "Recovery",
    create: () => ({
      id: "recovery",
      type: "quantitativeBar",
      title: "Recovery",
      visible: true,
      width: 110,
      valueField: "recovery_percent",
      unit: "%",
      min: 0,
      max: 100,
      color: "#55b7aa",
    }),
  },
  {
    id: "rqd",
    label: "RQD",
    create: () => ({
      id: "rqd",
      type: "quantitativeBar",
      title: "RQD",
      visible: true,
      width: 100,
      valueField: "rqd",
      unit: "%",
      min: 0,
      max: 100,
      valueMultiplier: 100,
      color: "#55b7aa",
    }),
  },
  {
    id: "curves",
    label: "Curve Track",
    create: (availableCurves) => ({
      id: "curves",
      type: "curve",
      title: "Curves",
      visible: true,
      width: 260,
      curves: availableCurves.slice(0, 3).map((curve) => ({
        curveKey: curve.key,
        label: curve.label,
        unit: curve.unit,
        color: curve.color,
        visible: true,
        scale: defaultScaleForCurve(curve),
      })),
    }),
  },
  {
    id: "remarks",
    label: "Remarks",
    create: () => ({ id: "remarks", type: "remarks", title: "Remarks", visible: true, width: 220 }),
  },
  {
    id: "ai-suggestions",
    label: "AI Suggestions",
    create: () => ({
      id: "ai-suggestions",
      type: "aiSuggestions",
      title: "AI",
      visible: true,
      width: 120,
    }),
  },
];

export function normalizeDisplayLayout(layout: DisplayLayout, availableCurves: Curve[]): DisplayLayout {
  const draft = structuredClone(layout);
  draft.settings.schemaVersion = draft.settings.schemaVersion ?? 2;
  draft.settings.mode = draft.settings.mode ?? "runtime";
  draft.settings.widgets = draft.settings.widgets ?? {};
  if (!draft.settings.grid) {
    draft.settings.widgets = {
      ...defaultRuntimeWidgets(availableCurves),
      ...draft.settings.widgets,
    };
  } else if (!draft.settings.widgets["log-widget"]) {
    draft.settings.widgets["log-widget"] = createCatalogWidget("logWidget", availableCurves);
  }
  draft.settings.widgets["log-widget"].tracks =
    draft.settings.widgets["log-widget"].tracks ?? defaultTracks(availableCurves);
  draft.settings.regions = draft.settings.regions ?? {
    left: ["validation-panel", "ai-workflow"],
    center: ["log-widget"],
    right: ["interval-details", "export-panel"],
  };
  draft.settings.grid = draft.settings.grid ?? {
    columns: 12,
    rowHeight: 72,
    items: defaultRuntimeGridItems(),
  };
  const gridIds = new Set(draft.settings.grid.items.map((item) => item.widgetId));
  for (const widgetId of Object.keys(draft.settings.widgets)) {
    if (!gridIds.has(widgetId)) {
      draft.settings.grid.items.push(defaultGridItem(widgetId, draft.settings.grid.items.length));
    }
  }
  draft.settings.grid.items = draft.settings.grid.items.filter(
    (item) => Boolean(draft.settings.widgets?.[item.widgetId]),
  );
  return draft;
}

export function defaultRuntimeWidgets(availableCurves: Curve[]): Record<string, DisplayWidget> {
  return {
    "total-depth": {
      type: "singleValue",
      title: "Total Depth",
      metric: "total_depth",
      settings: { unit: "m" },
    },
    "interval-count": {
      type: "singleValue",
      title: "Intervals",
      metric: "interval_count",
    },
    "curve-count": {
      type: "singleValue",
      title: "Curves",
      metric: "curve_count",
    },
    "corebox-count": {
      type: "singleValue",
      title: "Coreboxes",
      metric: "corebox_count",
    },
    "validation-panel": createCatalogWidget("validationPanel", availableCurves),
    "ai-workflow": createCatalogWidget("aiWorkflow", availableCurves),
    "log-widget": createCatalogWidget("logWidget", availableCurves),
    "interval-details": createCatalogWidget("intervalDetails", availableCurves),
    "export-panel": createCatalogWidget("exportPanel", availableCurves),
    "data-arrival": createCatalogWidget("dataArrival", availableCurves),
  };
}

export function defaultRuntimeGridItems(): DisplayGridItem[] {
  return [
    { widgetId: "total-depth", x: 0, y: 0, w: 2, h: 1 },
    { widgetId: "interval-count", x: 2, y: 0, w: 2, h: 1 },
    { widgetId: "curve-count", x: 4, y: 0, w: 2, h: 1 },
    { widgetId: "corebox-count", x: 6, y: 0, w: 2, h: 1 },
    { widgetId: "validation-panel", x: 0, y: 1, w: 2, h: 4 },
    { widgetId: "ai-workflow", x: 0, y: 5, w: 2, h: 4 },
    { widgetId: "log-widget", x: 2, y: 1, w: 7, h: 8 },
    { widgetId: "interval-details", x: 9, y: 1, w: 3, h: 6 },
    { widgetId: "export-panel", x: 9, y: 7, w: 3, h: 3 },
    { widgetId: "data-arrival", x: 0, y: 9, w: 12, h: 3 },
  ];
}

export function defaultScaleForCurve(curve: Curve) {
  const values = curve.samples.map((sample) => sample.value);
  if (!values.length) {
    return { mode: "manual", min: 0, max: 100 };
  }
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  return { mode: "manual", min, max: max <= min ? min + 1 : max };
}

export function createWidgetId(type: string, existingIds: Set<string>) {
  const base = type.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`).replace(/^-/, "");
  let index = 1;
  let id = base;
  while (existingIds.has(id)) {
    index += 1;
    id = `${base}-${index}`;
  }
  return id;
}

export function createTrackId(baseId: string, existingIds: Set<string>) {
  let index = 1;
  let id = baseId;
  while (existingIds.has(id)) {
    index += 1;
    id = `${baseId}-${index}`;
  }
  return id;
}

export function defaultTracks(availableCurves: Curve[]): DisplayTrack[] {
  return TRACK_CATALOG.map((item) => item.create(availableCurves, new Set()));
}

function createCatalogWidget(type: string, availableCurves: Curve[]) {
  return WIDGET_CATALOG.find((item) => item.type === type)!.create(availableCurves, new Set());
}

function defaultGridItems(widgetIds: string[]) {
  return widgetIds.map((widgetId, index) => defaultGridItem(widgetId, index));
}

export function defaultGridItem(widgetId: string, index: number): DisplayGridItem {
  if (widgetId === "log-widget") {
    return { widgetId, x: 3, y: 0, w: 6, h: 8 };
  }
  return { widgetId, x: (index % 3) * 4, y: Math.floor(index / 3) * 3, w: 3, h: 2 };
}

export function widgetLabel(widget: DisplayWidget) {
  if (widget.type === "singleValue") return `${widget.title} (${widget.metric ?? "metric"})`;
  return widget.title;
}
