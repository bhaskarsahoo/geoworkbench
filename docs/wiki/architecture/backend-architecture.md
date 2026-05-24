# Backend Architecture

The backend is a FastAPI application organized by business domain. The important idea is:

```text
HTTP router -> Pydantic schema -> domain service -> SQLAlchemy models -> PostgreSQL
```

Routers should stay thin. They translate HTTP requests and errors. Services contain workflow logic. Models define the persistent data shape.

## Entry Point

| File | Purpose |
| --- | --- |
| `backend/app/main.py` | Creates the FastAPI app and mounts all domain routers under `/api`. |
| `backend/app/core/config.py` | Reads environment settings such as database URL, upload/export roots, AI provider, auth, and OTP settings. |
| `backend/app/db/session.py` | Creates the SQLAlchemy engine/session factory. |
| `backend/alembic/` | Database migrations. Production schema changes should go here first. |

## Domain Layout

Each backend domain follows the same pattern:

```text
backend/app/domains/<domain>/
  router.py   -> HTTP endpoints
  schemas.py  -> request/response DTOs
  service.py  -> business logic
```

Current domains:

| Domain | Responsibility |
| --- | --- |
| `boreholes` | Workbench loading, interval edits, layout updates, validation trigger, export approval. |
| `imports` | Source file registration/upload, import profile listing, parsing uploaded files into boreholes. |
| `validation` | Validation endpoint for running deterministic checks. |
| `ai` | AI summaries, suggestion generation, accept/reject suggestion workflow. |
| `exports` | Export readiness, corrected lithology CSV/XLSX, curve CSV/LAS, download links. |
| `mobile` | Mobile borehole draft/demo copy, mobile field submissions, mobile file upload. |
| `auth` | Local demo user store, web password login, mobile OTP login. |

## Database Model Map

The canonical model file is `backend/app/db/models.py`.

```text
Project
  -> Site
    -> Borehole
      -> LithologyInterval
      -> SeamInterval
      -> Curve
        -> CurveSample
      -> CoreImage
      -> DisplayLayout
      -> ValidationIssue
      -> AiSuggestion
      -> SourceImport
      -> SourceFile
      -> FieldSubmission
      -> ExportJob

User
  -> AuthSession
MobileOtp

CorrectionAudit
ImportProfile
```

## Core Entities

| Entity | What It Means |
| --- | --- |
| `Project` | A coal block/project grouping. |
| `Site` | A site under a project. |
| `Borehole` | Main workbench object. Owns intervals, curves, images, files, suggestions, exports. |
| `LithologyInterval` | Correctable geological interval from Excel/mobile/import. |
| `SeamInterval` | Coal seam marker/interval display data. |
| `Curve` / `CurveSample` | Gamma, resistivity, density, or future geophysical curves. |
| `CoreImage` | Corebox image metadata mapped to depth intervals. |
| `DisplayLayout` | JSON settings for widgets, tracks, curves, widths, visibility. |
| `ValidationIssue` | Deterministic quality issue found by rules. |
| `AiSuggestion` | Actionable review suggestion derived from rules and optionally explained by an LLM. |
| `SourceFile` | Uploaded/registered Excel, LAS, images, or other field files. |
| `FieldSubmission` | Mobile form/upload submission record. |
| `ExportJob` | Generated CSV/XLSX/LAS output and audit summary. |
| `CorrectionAudit` | Tracks interval edits and workflow approval. |

## Request Flow Examples

### Workbench Load

```text
GET /api/boreholes/{id}/workbench
  -> boreholes/router.py
  -> boreholes/service.py:get_workbench()
  -> SQLAlchemy eager loads Borehole and child collections
  -> schemas.py returns BoreholeWorkbench response
  -> React renders LogWidget and side panels
```

### Interval Correction

```text
PATCH /api/boreholes/intervals/{interval_id}
  -> service loads LithologyInterval
  -> saves before_values
  -> updates editable fields
  -> writes CorrectionAudit
  -> reruns validation for the borehole
  -> returns updated interval
```

### Mobile Field Sync

```text
POST /api/mobile/field-submissions
  -> mobile service stores FieldSubmission
  -> if apply_to_log is true, appends intervals to Borehole
  -> updates total/current depth if needed
  -> reruns validation
  -> central web workbench sees the new borehole state
```

### AI Suggestion Generation

```text
POST /api/ai/boreholes/{id}/suggestions/generate
  -> validation issues are converted into deterministic suggestions
  -> optional local OpenAI-compatible model improves wording
  -> suggestions are persisted as AiSuggestion rows
  -> frontend shows them in AI panel and AI depth track
```

### Export

```text
POST /api/boreholes/{id}/approve-export
  -> blocks if validation errors exist
  -> marks workflow_status as approved_for_export

POST /api/exports/boreholes/{id}/jobs
  -> exports/service.py generates requested file
  -> stores file under runtime-data/exports/{borehole_code}
  -> records ExportJob
```

## Important Services

| File | Responsibility |
| --- | --- |
| `backend/app/services/excel_import.py` | Profiles/imports PBH and CTSJ style Excel workbooks into normalized borehole data. |
| `backend/app/services/validation/borehole_validation.py` | Deterministic validation rules for gaps, overlaps, missing lithology, recovery/RQD, and curve depth coverage. |
| `backend/app/services/ai_provider.py` | Provider abstraction for disabled, rule-based, and local OpenAI-compatible AI. |
| `backend/app/domains/display_layouts/defaults.py` | Default log widget track/layout configuration. |

## Design Rules

- Add schema changes through Alembic migrations.
- Keep HTTP-specific code in routers.
- Keep business workflows in services.
- Keep database persistence in SQLAlchemy models and services.
- Use deterministic validation as the source of truth; AI explains and suggests, but geologist approval decides.
- Store uploaded/generated files on disk or object storage, but keep metadata in `SourceFile` and `ExportJob`.

