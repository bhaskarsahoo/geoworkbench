# Phase 1 Borehole Correction System Plan

## Aim

Build a real multi-site, multi-borehole system for borehole log correction.

The central output is:

> A corrected, reviewed, export-ready borehole log approved by the central geologist.

The system should ingest field Excel sheets, geophysical logs, core box images, and onsite mobile inputs; normalize them into a canonical project database; show them in an editable visualization workspace; surface AI-assisted suggestions; and export corrected logs to downstream formats such as Excel, CSV, LAS, and Minex-compatible import templates.

## Phase 1 Product Scope

### Users

- Site geologist or field data collector.
- Central geologist.
- Reviewer/approver.
- Project administrator.

### Input

- Excel borehole log from site.
- Geophysical logs such as gamma, resistivity, density, caliper, sonic where available.
- LAS files or CSV curve exports.
- Core box images.
- Mobile form entries, photos, notes, and uploaded files.
- Optional seismic metadata or interpreted horizons as reference data, not full seismic interpretation in Phase 1.

### Output

- Corrected borehole log.
- Audit trail of corrections and approvals.
- AI suggestion history with accept/reject/override status.
- Excel/CSV export.
- LAS export for curves and corrected depth-indexed data where appropriate.
- Minex-compatible export template after confirming the customer's actual import format.

## Core Workflow

```text
Site input
  -> file/form upload
  -> import parsing
  -> canonical normalization
  -> validation checks
  -> central web review
  -> AI suggestions
  -> geologist correction/approval
  -> corrected log version
  -> export
```

## Data Versioning Model

Treat a borehole log as a versioned interpretation, not as an overwritten spreadsheet.

Recommended states:

- `raw_import`: immutable original Excel/LAS/images/mobile entries.
- `normalized_log`: parsed canonical representation.
- `validation_results`: deterministic data quality checks.
- `ai_suggestions`: machine suggestions with evidence and confidence.
- `working_interpretation`: editable central geologist version.
- `reviewed_interpretation`: reviewed but not final.
- `approved_log`: final corrected borehole log.
- `exports`: generated files with timestamp, version, and format.

Every correction should store:

- previous value
- new value
- user
- timestamp
- reason/comment where provided
- source object
- accepted/rejected AI suggestion link if applicable

## Multi-Site Data Model

```text
Organization
  -> Project / Coal Block
    -> Site / Camp / Area
      -> Borehole
        -> Imports
        -> Lithology intervals
        -> Seam intervals
        -> Geophysical curves
        -> Recovery / RQD / geotechnical data
        -> Core box images
        -> Remarks / events
        -> AI suggestions
        -> Display layouts
        -> Corrected log versions
        -> Exports
```

## Milestone 1 - Product And Data Contracts

### Goal

Define the real system boundaries and canonical data model before production implementation.

### Tasks

- Confirm lifecycle position: onsite capture, central correction, export to mining software.
- Collect representative Excel, LAS/CSV curve, image folder, and Minex import/export examples.
- Define canonical borehole schema for collar, lithology, seam, recovery, RQD, remarks, curves, images, and source lineage.
- Define versioning and approval states.
- Define role permissions.
- Define display layout and widget configuration schema.
- Define export templates for Excel/CSV/LAS.
- Investigate customer-specific Minex import requirements.

### Output

- Approved Phase 1 requirements.
- Canonical data model.
- Import/export mapping document.
- UI layout configuration model.

## Milestone 2 - Multi-Site Platform Foundation

### Goal

Create the working backend and frontend shell for real multi-site use.

### Tasks

- Create project/site/borehole management.
- Add authentication and role-based permissions.
- Add file upload for Excel, LAS/CSV, and images.
- Store raw files in object storage.
- Store parsed data in PostgreSQL.
- Add import job queue and status tracking.
- Add source lineage for every parsed row/sample/image.
- Add audit log tables.

### Output

- Deployable web application shell.
- Multi-site/multi-borehole database.
- File upload and import status workflow.

## Milestone 3 - Import And Normalization Engine

### Goal

Convert variable site inputs into stable internal data.

### Tasks

- Build Excel importer with configurable column mapping.
- Support flexible workbook templates with required/minimal fields.
- Build LAS importer for geophysical curves.
- Support CSV curve import when LAS is unavailable.
- Add core image upload and image metadata capture.
- Add mobile-form capture model for onsite minimal entries.
- Create lithology/seam dictionary mapping.
- Preserve original values and normalized values separately.
- Generate validation checks:
  - gaps
  - overlaps
  - invalid depth ranges
  - missing lithology
  - missing seam name on coal-bearing intervals
  - recovery greater than interval thickness
  - missing or suspicious RQD
  - curve depth range mismatch
  - image depth mapping missing

### Output

- Repeatable import pipeline.
- Canonical normalized log.
- Validation issue list per borehole.

## Milestone 4 - Editable Borehole Visualization Workspace

### Goal

Turn the prototype into a real editable web workspace.

### Tasks

- Build React/TypeScript borehole workspace.
- Render depth axis, lithology, seam, recovery, RQD, remarks/events, and curve tracks.
- Render gamma/resistivity/density curves from imported LAS/CSV.
- Support curve hover/click inspection using nearest measured point selection by default.
- Show curve tooltips with depth, curve value, unit, nearest sample depth, source file/sample, linked lithology/seam interval, and validation/AI context.
- Support a pinned crosshair cursor across tracks for selected depth.
- Add interval selection and depth metadata panel.
- Add editable interval table synchronized with visual tracks.
- Support editing:
  - lithology code/label
  - seam name
  - from/to depth with validation
  - remarks/events
  - recovery/RQD
  - reviewed status
- Save edits to backend immediately or through explicit save actions.
- Refresh visualization after save.
- Add conflict detection when another user has changed the same borehole.
- Add correction history panel.

### Output

- Central geologist can review, edit, save, and approve corrected borehole logs.

## Milestone 5 - Display Layout, Track, And Widget Settings

### Goal

Make the visualization workspace configurable instead of fixed.

### Tasks

- Define display layout schema:
  - layout name
  - owner
  - project/site/borehole scope
  - track order
  - track visibility
  - track widths
  - curve min/max/autoscale
  - widget positions
  - filters and depth ranges
- Store layout and widget settings as JSON in the database. XML export/import can be added only if customer integration requires it.
- Support two display modes:
  - `runtime`: normal review/correction mode where users inspect, edit data, and act on suggestions.
  - `edit`: display designer mode where authorized users add/remove widgets, drag/drop widgets between regions, resize panels, configure tracks, and save layouts.
- Add widget settings page or side panel for track and curve configuration.
- Add predefined layouts:
  - Field Input Review
  - Central Correction
  - Geophysical Review
  - Core Image Review
  - AI QA Review
  - Export Readiness
- Allow users to clone predefined layouts.
- Allow adding/removing widgets:
  - single value cards
  - validation issue list
  - interval metadata
  - source file details
  - core image viewer
  - curve statistics
  - AI suggestions
  - export readiness
- Save display settings per user and project.
- Add admin-managed default layouts.
- Add unit settings for display conversion where supported by curve metadata.

### Output

- Configurable workspaces that can evolve by customer and workflow.

## Modular Display Architecture

The borehole workspace should be built as a modular display engine, not as one large screen.

### Core Concepts

- `Display`: a saved workspace configuration.
- `Widget`: a panel/card/tool inside a display.
- `Track`: a depth-aligned visual column in the borehole log.
- `Layer`: a renderable item inside a track, such as one curve, lithology intervals, seam labels, or AI suggestions.
- `Interaction`: hover, click, context menu, selection, drag, edit, annotation, and crosshair behavior.
- `Data adapter`: converts API data into the shape a track/widget expects.
- `Settings schema`: JSON configuration for display, widget, track, layer, and interaction behavior.
- `Mode`: runtime mode for daily work and edit mode for layout design.

### Display Edit Mode

Edit mode should let authorized users configure the workspace without changing geological data.

Capabilities:

- Add widget from predefined widget catalog.
- Remove widget from display.
- Drag/drop widget between display regions.
- Resize widget.
- Add/remove/reorder tracks inside the Log Widget.
- Show/hide individual tracks.
- Configure track width, title, colors, and interaction behavior.
- Configure curves inside a curve track.
- Save as new layout, update existing layout, or reset to default.
- Preview layout before publishing as a project/admin default.

Runtime mode should hide layout design controls and focus on:

- inspect
- edit geological values
- accept/reject AI suggestions
- annotate
- approve
- export

### Curve Track Module

One curve track should support one or more curves sharing the same depth index.

Examples:

- Gamma only.
- Gamma + density.
- Resistivity shallow + resistivity deep.
- Raw gamma + smoothed gamma, clearly labelled.

Curve track configuration should include:

```json
{
  "trackType": "curve",
  "title": "Gamma / Density",
  "depthMode": "measured_depth",
  "curves": [
    {
      "curveId": "gamma",
      "label": "Gamma",
      "unit": "API",
      "color": "#d97706",
      "lineWidth": 1.5,
      "visible": true,
      "scale": {
        "mode": "manual",
        "min": 0,
        "max": 150,
        "displayMin": 0,
        "displayMax": 100
      },
      "normalization": {
        "enabled": true,
        "method": "linear-track-scale",
        "sourceMin": 0,
        "sourceMax": 150,
        "trackMin": 0,
        "trackMax": 100
      },
      "unit": {
        "sourceUnit": "API",
        "displayUnit": "API",
        "conversion": null
      },
      "interaction": {
        "nearestPoint": true,
        "showTooltip": true,
        "pinOnClick": true
      }
    }
  ],
  "header": {
    "showMinMax": true,
    "showUnits": true,
    "showSourceStatus": true
  }
}
```

Curve interaction requirements:

- Hover should show a lightweight tooltip.
- Click should pin the selected depth/value and update the side metadata panel.
- Selection should use nearest measured sample by default.
- Tooltip should disclose nearest sample depth and distance from clicked depth.
- Interpolation should not be default. If added later, it must be explicit and labelled as interpolated.
- A vertical crosshair should align the selected depth across lithology, seam, curve, image, and AI tracks.
- Track header should show curve name, unit, display min/max, autoscale/manual status, and source availability.
- Widget settings should allow show/hide per curve within a multi-curve track.
- Widget settings should allow changing per-curve color, line width, min/max, autoscale/manual mode, and display unit where conversion is supported.

Curve rendering requirements:

- Use raw samples for point selection.
- Downsample only for drawing, not for inspection metadata.
- Preserve original imported curve data separately from normalized/display-scaled values.
- Support manual min/max and autoscale.
- Normalize each curve independently for display when multiple curves with different value ranges share the same track real estate.
- Keep tooltip values in source units or explicitly selected display units, not in normalized screen units.
- Support future display transforms such as reverse scale, log scale, smoothing, moving average, or z-score, but keep raw measured values available.

### Unit Settings

Unit handling should be designed now, even if Phase 1 uses mostly depth tracks.

Requirements:

- Store source unit from LAS/CSV/import metadata.
- Store display unit per curve or project preference where conversion is valid.
- Keep source value and display value distinguishable.
- Unit conversion should be explicit and auditable for exported data.
- Depth unit conversion may be needed later: meters/feet.
- Curve unit conversion may be needed depending on supplied logs.

Timezone is not a major Phase 1 display concern because the main log workspace is depth-indexed, not time-indexed. Still, store timestamps with timezone for imports, edits, approvals, mobile captures, and audit events.

### Depth And Deviation Model

Phase 1 should use measured depth as the primary vertical display axis.

Future-ready depth concepts:

- `measured_depth` or `MD`: distance along the drilled borehole path.
- `true_vertical_depth` or `TVD`: vertical depth below reference elevation, calculated from deviation survey where available.
- `hole_depth`: current drilled hole depth or total drilled depth, mostly relevant for drilling/runtime workflows.
- `bit_depth`: current drill bit depth, mostly relevant for live drilling or rig telemetry workflows.
- `driller_depth` and `logger_depth`: may differ slightly because drilling string and wireline measurements can differ.

Deviation survey support:

- Store survey stations by measured depth.
- Fields should include inclination/deviation angle and azimuth.
- Calculate TVD, northing/easting offset, and borehole trace if enough survey data is provided.
- Support future deviation tracks or widgets showing inclination, azimuth, dogleg severity, TVD, and horizontal displacement.

Phase 1 UI recommendation:

- Keep measured-depth log tracks as default.
- Add schema support for deviation survey data.
- Add a simple deviation data table if supplied.
- Defer full deviation track display and 3D borehole trace until they provide deviated/horizontal borehole requirements.

### Other Track Modules

Lithology track:

- interval blocks
- color/pattern mapping
- edit/split/merge actions
- source row and original value access

Seam track:

- seam labels
- thickness display
- missing/unnamed seam flags
- correlation-ready export metadata

Remarks/events track:

- grouped crowded remarks
- symbols for configured event types
- click to inspect all events at depth

Image track/widget:

- depth-linked thumbnail
- click to full corebox image viewer
- image metadata and annotations

AI suggestion track:

- suggestion markers by depth
- suggestion type, confidence, evidence, accept/reject/edit status
- link to correction history after action

Single-value widgets:

- total depth
- validation issue count
- reviewed percentage
- import status
- export readiness
- selected depth metadata

## Codebase Organization Recommendation

The production code should be organized around domains and reusable modules.

Suggested frontend structure:

```text
frontend/
  src/
    app/
      routes/
      providers/
      layout/
    api/
      client.ts
      queries/
      mutations/
    domains/
      projects/
      sites/
      boreholes/
      imports/
      exports/
      ai-suggestions/
      users/
    workbench/
      display/
        display-schema.ts
        display-store.ts
        DisplayRenderer.tsx
      tracks/
        curve/
        lithology/
        seam/
        remarks/
        images/
        ai-suggestions/
        depth-axis/
      widgets/
        metadata/
        validation/
        corebox-viewer/
        interval-table/
        export-readiness/
      interactions/
        crosshair/
        selection/
        context-menu/
        tooltips/
      rendering/
        scales/
        canvas/
        svg-overlays/
    shared/
      components/
      hooks/
      utils/
      types/
```

Suggested backend structure:

```text
backend/
  app/
    api/
      routes/
      dependencies/
    core/
      config.py
      security.py
      logging.py
    domains/
      projects/
      sites/
      boreholes/
      intervals/
      curves/
      images/
      imports/
      exports/
      ai_suggestions/
      display_layouts/
      audit/
    services/
      validation/
      normalization/
      ai/
      search/
      storage/
    workers/
      import_jobs/
      export_jobs/
      ocr_jobs/
      ai_jobs/
    db/
      models/
      migrations/
      repositories/
    tests/
```

Folder principles:

- Keep geology domain logic out of UI components.
- Keep rendering code separate from API/data-fetching code.
- Keep raw imported data, normalized data, display settings, and corrected interpretation as separate concepts.
- Use shared JSON schemas or generated TypeScript types from OpenAPI where possible.
- Write track modules so new track types can be added without rewriting the whole workbench.

## Milestone 6 - AI-Assisted Correction Workflow

### Goal

Provide useful AI assistance without requiring large training datasets.

### Tasks

- Add deterministic validation assistant for rule-based issues.
- Add AI summary assistant:
  - borehole summary
  - coal-bearing intervals
  - seam summary
  - low recovery/RQD zones
  - key remarks/events
- Add AI suggestion queue:
  - lithology normalization suggestions
  - possible missing seam labels
  - curve/log mismatch flags
  - suspicious interval boundaries
  - report-ready observations
- Add accept/reject/edit controls for every suggestion.
- Store suggestion status and geologist feedback.
- Show suggestions as a track and as a side-panel queue.
- Add source-linked reasoning: depth, source file, row/sample, curve segment, image reference where available.

### Output

- Central geologist can keep, override, or reject AI suggestions with traceability.

## Milestone 7 - Core Box Image Workflow

### Goal

Make core images operationally useful before attempting hard image interpretation.

### Tasks

- Upload and organize core box images per borehole.
- Store image metadata:
  - borehole
  - box number
  - from depth
  - to depth
  - capture user/date
  - notes
  - source filename
- Link depth intervals to images.
- Add image viewer synchronized with selected depth.
- Open full corebox image when the user clicks an image preview, image track item, or depth-linked image reference from the display.
- Support zoom, pan, rotate if needed, fit-to-screen, full-resolution view, and side-by-side interval metadata while viewing the full corebox image.
- Add manual image annotation.
- Add optional OCR for box labels and depth text.
- Add image search by borehole, box, depth, lithology, seam, and remarks.
- Experiment with visual embeddings for similar-image retrieval after enough labelled examples exist.

### Out Of Scope For Phase 1

- Reliable automatic lithology classification from core photos.
- Reliable fracture/slickenside detection without labelled training/evaluation data.
- Fine-tuning a vision model on small unvalidated image sets.

### Output

- Core photos become searchable and depth-linked evidence for correction.

## Milestone 8 - Export And Integration

### Goal

Generate usable corrected outputs for downstream systems.

### Tasks

- Export corrected lithology/seam log to Excel.
- Export interval tables to CSV.
- Export curve data to LAS where appropriate.
- Export validation and correction history report.
- Build customer-specific Minex import template after format confirmation.
- Add export version history.
- Add export readiness checks.

### Output

- Approved logs can be delivered to the customer's existing software workflow.

## Recommended Technology Stack

Prefer actively maintained open-source components with strong documentation, easy replacement paths, and no lock-in around proprietary mining formats.

### Frontend

- React + TypeScript.
- TanStack Query for API caching and server-state synchronization.
- Zustand or Redux Toolkit for local UI/layout state.
- D3 scale utilities for depth and curve mapping.
- Canvas or WebGL for dense geophysical curves.
- SVG/HTML overlays for intervals, labels, selections, context menus, and annotations.
- TanStack Table for lightweight open-source editable tables.
- AG Grid Community only if we need heavier spreadsheet-like editing, filtering, pinned columns, range selection, or large grid ergonomics.
- OpenSeadragon or a tile-based image viewer if core photos are very large.
- MapLibre or Leaflet later for site/borehole maps.

### Backend

- FastAPI with Python for import, validation, AI orchestration, and scientific/geological processing.
- PostgreSQL + PostGIS for project, borehole, interval, spatial, correction, and audit data.
- Object storage for Excel, LAS, images, reports, and exports. Use S3-compatible storage in production; local MinIO is suitable for development/on-prem.
- Redis for caching, job coordination, and realtime notifications.
- Celery/RQ/Arq/Dramatiq for background import, AI, image OCR, and export jobs.
- WebSockets or Server-Sent Events for import status, auto-refresh, and suggestion updates.

### AI

- Start with rule-based validation plus LLM-assisted summaries and explanations.
- Use retrieval over project documents, logs, and metadata for the assistant.
- Use embeddings for text search and later image similarity search.
- Keep model provider abstract so deployment can use hosted models, local LLMs, or customer-approved on-prem models.
- Do not plan model training in Phase 1 except small classical ML experiments on curves if labelled data exists.

## Open-Source Stack Suitability Check

| Area | Recommended Choice | Why |
|---|---|---|
| Web app | React + TypeScript | Mature ecosystem, strong hiring pool, works well for complex configurable workspaces. |
| Server-state cache | TanStack Query | Officially focused on fetching, caching, synchronizing, and updating server state in web apps. |
| Local UI/layout state | Zustand | Small, simple state store for display layout, selected interval, panel state, and user workspace state. |
| Geological track rendering | D3 scales + Canvas/SVG/HTML | D3 is excellent for scale math; Canvas handles dense curves; SVG/HTML stays ergonomic for labels and interactions. |
| Standard dashboards | Apache ECharts or Plotly.js | Both are open-source and capable; prefer ECharts for dashboard widgets, Plotly for scientific exploratory charts if needed. |
| Editable interval table | TanStack Table first, AG Grid Community when needed | TanStack Table is lighter and headless; AG Grid Community has stronger grid UX for heavy editing. |
| Full corebox image viewer | OpenSeadragon | Open-source zoomable image viewer with overlay/plugin ecosystem, good fit for high-resolution corebox photos. |
| Maps/GIS | MapLibre GL JS | Open-source map rendering with active docs; useful later for sites, collars, lease boundaries, roads, and GIS layers. |
| Large geospatial/3D later | deck.gl | Open-source WebGL/WebGPU visualization for large datasets; defer until GIS/model review becomes a priority. |
| API backend | FastAPI | Actively released, Python-native, OpenAPI docs by default, good fit for import/AI/scientific processing. |
| Database | PostgreSQL + PostGIS | Strong open-source relational/spatial base; PostgreSQL has current active releases and PostGIS is the standard spatial extension. |
| File/object storage | S3-compatible storage | Use AWS S3/Azure-compatible service in cloud, or MinIO/Ceph/Garage style storage on-prem after license/deployment review. |
| Background jobs | Celery + Redis/RabbitMQ | Mature Python task queue for imports, OCR, AI jobs, and exports. |
| Cache/realtime signals | Redis + WebSockets/SSE | Good for import progress, workspace refresh, and lightweight notifications. |
| Search/RAG | PostgreSQL full-text + pgvector first | Keeps Phase 1 simple; can move to OpenSearch/Qdrant later if retrieval volume grows. |

## Corebox Full Image Interaction

Required behavior:

- In the depth display, core image preview, interval details, and image references must be clickable.
- Click opens the full corebox image in a focused viewer.
- Viewer should support zoom, pan, fit-to-width, fit-to-screen, next/previous corebox, and close.
- Viewer should preserve borehole/depth context: borehole ID, box number, approximate or exact depth range, selected interval, lithology, seam, remarks, and source filename.
- If image-depth registration exists, highlight the approximate interval region on the image. If exact registration does not exist, clearly mark the link as approximate.
- User should be able to add image notes or annotations tied to borehole/depth/image.

Implementation recommendation:

- Use a modal or right-side expanded panel for Phase 1.
- Use OpenSeadragon when images are large enough that browser-native image zoom feels poor.
- Generate image thumbnails server-side during upload.
- Store original image, thumbnail, and optional tiled/Deep Zoom derivative if performance demands it.

## Documentation And Wiki Requirements

Good documentation will improve stakeholder confidence and make the system easier to adopt.

Maintain a wiki-style documentation set with:

- Product overview.
- User roles and permissions.
- Site data capture manual.
- Central geologist correction workflow.
- Display layout and widget configuration manual.
- Track configuration reference.
- Curve import and curve display guide.
- Corebox image upload, linking, and full-view guide.
- AI suggestion review manual.
- Export guide for Excel/CSV/LAS/Minex templates.
- Admin setup guide.
- Architecture overview.
- Data model reference.
- API reference from OpenAPI.
- Deployment guide for local/on-prem/cloud.
- Troubleshooting guide.

Recommended documentation location:

```text
docs/wiki/
  product-overview.md
  user-manual/
  admin-manual/
  architecture/
  data-model/
  api/
  deployment/
```

Documentation should be updated as part of each milestone, not written only at the end.

### Caching And Performance

- Cache borehole metadata and layout configuration on the client.
- Request depth-windowed track data from the backend.
- Downsample curves by visible depth range and screen resolution.
- Cache curve tiles or downsampled curve segments server-side.
- Use optimistic UI for edits, with backend validation before final approval.
- Use background jobs for heavy imports, AI analysis, and exports.

## 3D Graphics Recommendation

Do not build 3D graphics in Phase 1 unless the customer explicitly needs it for a pilot.

Phase 1 needs strong 2D depth-based visualization:

- borehole tracks
- curves
- interval editing
- image panels
- dashboards
- multi-borehole comparison later

3D can become useful later for:

- borehole collars and traces in map/3D space
- seam surfaces
- block models
- pit/underground planning context
- geological model review

Recommended later approach:

- MapLibre/Leaflet for 2D GIS first.
- Three.js or deck.gl for 3D borehole/model visualization after the core correction workflow is stable.
- Do not compete with Minex/MinePlan/Datamine/Vulcan 3D modelling in the first product.

## Core Image AI Reality Check

Public India-specific core box image datasets suitable for training coal lithology/fracture models do not appear to be readily available. Public or semi-public adjacent resources exist for GIS, geophysical logs, and some geological images, but they are not enough to train a reliable coal core interpretation model for customer operations.

Useful external references:

- Mendeley Data has a 2026 Central India CBM dataset with gamma, resistivity, density, porosity, and lab-measured gas content from eight core holes in the Sohagpur coal field: https://data.mendeley.com/datasets/34cj7ctbt4
- USGS provides GIS shapefiles for coal-bearing areas in India and Bangladesh, plus limited coal sample analyses: https://www.usgs.gov/publications/geographic-information-system-gis-representation-coal-bearing-areas-india-and
- BGS provides coal geophysical borehole log archive information, with some LAS availability for UK coal data: https://www.bgs.ac.uk/datasets/coal-authority-geophysical-borehole-logs/
- BGS OpenGeoscience includes released image collections, including borehole core photographs, useful as adjacent visual references rather than India coal training data: https://www.bgs.ac.uk/information-hub/photos-and-images/
- CoalLog provides coal borehole logging dictionaries, transfer formats, and plotting conventions that can guide schema and UI design: https://www.ausimm.com/insights-and-resources/resources/codes-and-standards/coallog/

Modern vision-language models can sometimes describe visible patterns, read labels, and help with visual triage, but fracture or lithology detection in core boxes is operationally sensitive. It needs labelled customer data, depth registration, quality control, and geologist evaluation before use as a correction suggestion.

Recommended Phase 1 image AI:

- OCR box/depth labels.
- Retrieve images by depth and metadata.
- Summarize human annotations.
- Link image evidence to log intervals.
- Optional visual similarity search as an experiment.

Recommended later image AI:

- Create a labelled core image dataset with geologist annotations.
- Evaluate commercial/open vision models on detection tasks.
- Train/fine-tune only after enough labels and quality controls exist.
- Keep outputs as suggestions, never automatic corrections.
