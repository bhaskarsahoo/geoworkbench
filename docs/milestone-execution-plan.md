# Milestone Execution Plan

## Milestone 1 - Seeded System Foundation

Goal:

Create a runnable system foundation using existing PBH-62 data and synthetic curves while keeping import adapters flexible for future real inputs.

Scope:

- FastAPI backend.
- React/TypeScript frontend.
- Database models for projects, sites, boreholes, intervals, curves, images, and display layouts.
- Alembic migrations for database schema evolution.
- Seed script for PBH-62 normalized JSON.
- Synthetic gamma/resistivity/density curves.
- Basic editable borehole workbench.
- Curve tooltip using nearest measured point.
- Corebox full-image click from display.
- Local development dependency profile for Postgres, Redis, and object storage.

Acceptance:

- Backend health endpoint responds.
- `alembic upgrade head` creates the schema from an empty database.
- PBH-62 seed data loads.
- Frontend lists the demo borehole.
- Workbench renders lithology, seam, curve, and image tracks.
- Selecting an interval opens editable metadata.
- Saving an interval persists through the API.
- Clicking a corebox reference opens the full image.

## Milestone 2 - Import And Validation

Goal:

Replace seed-only loading with configurable import jobs.

Scope:

- Excel adapter with mapping profile.
- Excel profiling step that detects likely sheet, header rows, column mappings, closure depth, and metadata conflicts.
- Controlled experiment fixtures from clean workbooks, including known-bad validation cases and synthetic aligned curves.
- LAS/CSV curve adapter.
- Core image upload and metadata capture.
- Validation checks for gaps, overlaps, missing lithology, recovery/RQD issues, and curve depth mismatch.
- Import status events.

## Milestone 3 - Display Edit Mode

Goal:

Turn display settings into user-editable layout configuration.

Scope:

- Runtime/edit mode split. Initial implementation complete.
- Widget catalog. Initial implementation complete for depth, lithology, seam, recovery, RQD, curves, and remarks.
- Add/remove/reorder tracks. Initial implementation complete with buttons and drag/drop reorder in the settings panel.
- Per-curve show/hide and min/max scale settings. Initial implementation complete.
- Persist layout JSON. Initial implementation complete through `PATCH /api/boreholes/display-layouts/{layout_id}`.
- Admin/default reset. Initial implementation complete through `POST /api/boreholes/{borehole_id}/display-layout/reset`.

Acceptance:

- Edit mode opens a display settings panel.
- Tracks can be shown, hidden, removed, re-added, resized, and reordered.
- Available curves can be added to the curve track.
- Curve visibility and manual min/max can be changed.
- Saved settings persist after refresh.
- Reset default restores the standard borehole layout.

## Milestone 4 - AI Suggestion Workflow

Goal:

Add controlled AI assistance without agentic autonomy.

Scope:

- AI provider abstraction for disabled/local/OpenAI/Anthropic-compatible providers.
- Rule-based validation assistant. Initial implementation complete.
- Borehole summary. Initial implementation complete.
- Suggestion queue. Initial implementation complete with persisted `ai_suggestions`.
- Accept/reject/edit workflow. Initial accept/reject implementation complete; edit-before-accept remains pending.
- Source-linked explanations. Initial implementation complete using validation issue, depth range, entity id, and patch evidence.
- AI suggestion visualization track. Initial implementation complete; open suggestions now appear inside the log widget as depth-aligned markers.
- Geologist observation capture remains tied to interval editing today; a dedicated observation note per suggestion is the next refinement.

Acceptance:

- A borehole can generate deterministic assistant suggestions from validation issues.
- Suggestions show confidence, rationale, recommended action, depth, status, and optional patch.
- Patchable suggestions can be accepted and audited.
- Suggestions can be rejected.
- Assistant summary explains that this is deterministic assistance and geologist approval remains required.
- A controlled AI-test borehole is available for demo: `CTSJ-30-P-02-AI-TEST`.
- AI-test display reset includes an `AI` track that can be shown, hidden, removed, re-added, resized, and reordered like other tracks.

## Milestone 5 - Export And Demo Deployment

Goal:

Produce corrected outputs and deploy quickly on a server.

Scope:

- Export readiness checks. Initial implementation complete.
- Corrected lithology CSV export. Initial implementation complete.
- Curve CSV export. Initial implementation complete.
- LAS export where appropriate.
- Corrected lithology Excel export.
- Customer-specific Minex template after sample is supplied.
- Windows VM deployment profile with IIS and Windows Services.
- Linux VM deployment profile with Nginx and systemd.
- Direct PostgreSQL production setup, not Docker Compose.
- Backup and restore guide.

Acceptance:

- Export panel shows validation, AI suggestion, source Excel, and curve readiness.
- Central geologist can approve a clean borehole for export. Initial implementation complete.
- Boreholes with validation errors are blocked from approval. Initial implementation complete.
- User can generate corrected lithology CSV.
- User can generate corrected lithology Excel.
- User can generate curve CSV when curves are available.
- User can generate curve LAS when curves are available.
- Generated exports are stored under `runtime-data/exports/{borehole_code}`.
- Download links are available from the UI.
- Export summary keeps readiness state for audit/demo explanation.

## Mobile Field Capture Demo

Goal:

Show that onsite mobile capture can sync into the same central borehole correction workflow.

Scope:

- Mobile backend endpoints for borehole draft creation, field submissions, file uploads, and demo-copy workflow. Initial implementation complete.
- Flutter Android/iOS app scaffold. Initial implementation complete under `mobile/geoworkbench_mobile`.
- Android demo flow that creates a mobile-submitted borehole from an existing CTSJ borehole and appends a field interval.
- Mobile Excel/log/photo upload from the Flutter app to `POST /api/mobile/uploads`. Initial implementation complete.
- Local web username/password login and mobile username/OTP login. Initial implementation complete with demo users and push-provider placeholders.

Acceptance:

- `POST /api/mobile/demo-copy` creates a field-submitted borehole visible in the web workbench.
- `POST /api/mobile/field-submissions` syncs mobile interval data and updates validation state.
- `POST /api/mobile/uploads` stores mobile source files/photos through the same source-file backend.
- Android app can point to backend URL, create demo copy, and sync a field interval after Flutter CLI/platform folders are installed.
- Android app can pick and upload a field file to the backend.
- Web demo login: `geologist` / `geologist123`.
- Mobile demo login: request OTP for `field`; when push is disabled the API returns a development OTP for local testing.
