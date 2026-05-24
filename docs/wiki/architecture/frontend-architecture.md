# Frontend Architecture

The frontend is a React/TypeScript workbench. It has three layers:

```text
API client/types -> App orchestration/state -> reusable workbench visualization components
```

The most important UI is the borehole log widget. It is designed like a lightweight well-log visualization engine, with shared depth scaling, track renderers, typed hit testing, and centralized interaction behavior.

## Entry Points

| File | Purpose |
| --- | --- |
| `frontend/src/main.tsx` | React application bootstrap. |
| `frontend/src/App.tsx` | Main application composition, queries, mutations, panels, selected borehole. |
| `frontend/src/api/client.ts` | All HTTP calls to the FastAPI backend. |
| `frontend/src/api/types.ts` | TypeScript DTOs matching backend API responses. |
| `frontend/src/styles.css` | Current application styling. |

## Main Screen Structure

`App.tsx` lays out three working regions:

```text
Topbar
  -> borehole selector
  -> runtime/edit display mode

Left panel
  -> metrics
  -> display settings
  -> validation
  -> AI workflow
  -> export
  -> data arrival/import files

Center
  -> LogWidget

Right panel
  -> selected interval metadata
  -> corebox preview/full image
  -> editable geologist correction form
```

## Data Fetching

The frontend uses TanStack Query.

| Query/Mutation | Backend Endpoint |
| --- | --- |
| `listBoreholes()` | `GET /api/boreholes` |
| `getWorkbench(id)` | `GET /api/boreholes/{id}/workbench` |
| `updateInterval()` | `PATCH /api/boreholes/intervals/{interval_id}` |
| `runValidation()` | `POST /api/boreholes/{id}/validate` |
| `generateAiSuggestions()` | `POST /api/ai/boreholes/{id}/suggestions/generate` |
| `acceptAiSuggestion()` | `POST /api/ai/suggestions/{id}/accept` |
| `updateAiSuggestionStatus()` | `PATCH /api/ai/suggestions/{id}` |
| `getExportReadiness()` | `GET /api/exports/boreholes/{id}/readiness` |
| `createExportJob()` | `POST /api/exports/boreholes/{id}/jobs` |
| `uploadSourceFile()` | `POST /api/imports/source-files/upload` |
| `processSourceFile()` | `POST /api/imports/source-files/{id}/process` |
| `importSourceFileAsBorehole()` | `POST /api/imports/source-files/{id}/import-borehole` |

After successful mutations, `App.tsx` invalidates the relevant query keys so the workbench reloads fresh server state.

## Workbench Visualization Folder

```text
frontend/src/workbench/
  core/       -> shared visualization math and interaction primitives
  display/    -> display settings and Zustand workbench store
  tracks/     -> one renderer per track type
  widgets/    -> composed widgets, currently LogWidget
  ai/         -> AI panel
  exports/    -> export panel
```

## Workbench Core

| File | Responsibility |
| --- | --- |
| `depthScale.ts` | Maps depth to Y, Y to depth, and intervals to CSS positions. |
| `ticks.ts` | Generates nice depth ticks for zoom levels. |
| `curveMath.ts` | Curve point normalization, visible/boundary sample selection, nearest sample search. |
| `TrackFrame.tsx` | Shared wrapper for track title, body, hover/click/context-menu, hit-test dispatch. |
| `trackObject.ts` | Typed objects returned by hit testing: interval, seam, curve sample, remark group, core image, empty. |
| `interactions.ts` | Central application behavior for clicks, hover, context menu. |

## Track Model

Every track follows this shape:

```text
TrackFrame
  -> receives BoreholeWorkbench, DisplayTrack, DepthScale
  -> renders track body
  -> implements hitTest(depth, localX, localY)
  -> returns TrackObject
  -> central handler decides what the click/hover means
```

Current track renderers:

| Track | File | Purpose |
| --- | --- | --- |
| Depth | `tracks/depth/DepthTrack.tsx` | Depth ticks and depth-axis hit testing. |
| Lithology | `tracks/lithology/LithologyTrack.tsx` | Colored lithology intervals. |
| Seam | `tracks/seam/SeamTrack.tsx` | Coal seam markers. |
| Recovery/RQD | `tracks/quantitativeBar/QuantitativeBarTrack.tsx` | Quantitative interval bar tracks. |
| Curves | `tracks/curve/CurveTrack.tsx` | Multi-curve normalized curve rendering and tooltips. |
| Remarks | `tracks/remarks/RemarksTrack.tsx` | Grouped remarks to avoid clutter. |
| AI Suggestions | `tracks/aiSuggestions/AiSuggestionsTrack.tsx` | Depth-aligned suggestion markers. |
| Images | `tracks/images/ImageTrack.tsx` | Available for image interval rendering; current UX mainly uses right-panel corebox preview. |

## State

`frontend/src/workbench/display/workbenchStore.ts` is the lightweight UI store.

It holds:

- runtime/edit mode
- selected depth
- selected lithology interval
- hovered track object
- selected corebox image
- selected remark group
- context menu state
- current visible depth window

Server data still lives in TanStack Query. The store is only for UI interaction state.

## Display Settings

Display settings are persisted as JSON in `DisplayLayout.settings`.

The current shape is:

```text
settings.widgets["log-widget"].tracks[]
```

Each track config has:

- `id`
- `type`
- `title`
- `visible`
- `width`
- optional curve configs
- optional quantitative field config

`DisplaySettingsPanel.tsx` lets the user show/hide, add/remove, resize, and reorder tracks. `LogWidget.tsx` uses the saved layout to decide which track components to render.

## Adding A New Track

1. Add config defaults in `backend/app/domains/display_layouts/defaults.py`.
2. Add the TypeScript rendering component under `frontend/src/workbench/tracks/<track>/`.
3. Wrap it in `TrackFrame`.
4. Use `DepthScale`; do not write separate depth math.
5. Add a `hitTest`.
6. Add the renderer switch in `LogWidget.tsx`.
7. Add the track to `DisplaySettingsPanel.tsx` catalog if users should be able to re-add it.
8. Add behavior to `interactions.ts` only if click/hover/context-menu should do something new.

## Refinement Hotspots

| Need | Start Here |
| --- | --- |
| Improve visual display | `LogWidget.tsx`, track components, `styles.css` |
| Change click/hover behavior | `core/interactions.ts`, `TrackFrame.tsx`, track `hitTest` |
| Improve curve rendering | `core/curveMath.ts`, `tracks/curve/CurveTrack.tsx` |
| Improve display settings | `display/DisplaySettingsPanel.tsx`, backend layout defaults |
| Add side-panel metadata | `App.tsx` right panel and backend workbench schema |
| Add AI workflow UI | `workbench/ai/AiWorkflowPanel.tsx`, `tracks/aiSuggestions` |
| Add export controls | `workbench/exports/ExportPanel.tsx` |

