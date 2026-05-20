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
- LAS/CSV curve adapter.
- Core image upload and metadata capture.
- Validation checks for gaps, overlaps, missing lithology, recovery/RQD issues, and curve depth mismatch.
- Import status events.

## Milestone 3 - Display Edit Mode

Goal:

Turn display settings into user-editable layout configuration.

Scope:

- Runtime/edit mode split.
- Widget catalog.
- Add/remove/reorder tracks.
- Per-curve show/hide, min/max, autoscale/manual settings.
- Persist layout JSON.
- Admin defaults and cloned user layouts.

## Milestone 4 - AI Suggestion Workflow

Goal:

Add controlled AI assistance without agentic autonomy.

Scope:

- AI provider abstraction for disabled/local/OpenAI/Anthropic-compatible providers.
- Rule-based validation assistant.
- Borehole summary.
- Suggestion queue.
- Accept/reject/edit workflow.
- Source-linked explanations.

## Milestone 5 - Export And Demo Deployment

Goal:

Produce corrected outputs and deploy quickly on a server.

Scope:

- Excel/CSV exports.
- LAS export where appropriate.
- Customer-specific Minex template after sample is supplied.
- Windows VM deployment profile with IIS and Windows Services.
- Linux VM deployment profile with Nginx and systemd.
- Direct PostgreSQL production setup, not Docker Compose.
- Backup and restore guide.
