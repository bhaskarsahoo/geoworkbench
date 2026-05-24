# Refinement Guide

This is the practical map for future changes. When something needs refinement, start in the files listed here.

## Backend Refinement Map

| Change | Main Files |
| --- | --- |
| Add a database field/table | `backend/app/db/models.py`, new Alembic migration under `backend/alembic/versions/` |
| Add API response fields | Domain `schemas.py`, domain `service.py`, `frontend/src/api/types.ts` |
| Add a new endpoint | Domain `router.py`, domain `schemas.py`, domain `service.py`, `backend/app/main.py` if new router |
| Improve Excel import | `backend/app/services/excel_import.py`, `backend/app/domains/imports/service.py` |
| Add LAS import | `backend/app/domains/imports/service.py`, new parser service, `SourceFile` metadata |
| Improve validation rules | `backend/app/services/validation/borehole_validation.py` |
| Add AI suggestion type | `backend/app/domains/ai/service.py`, frontend AI panel/track |
| Add export format | `backend/app/domains/exports/service.py`, `exports/schemas.py`, `ExportPanel.tsx` |
| Add mobile form fields | `backend/app/domains/mobile/schemas.py`, `mobile/service.py`, Flutter `main.dart` |
| Change auth/OTP | `backend/app/domains/auth/service.py`, `core/config.py` |
| Change default display layout | `backend/app/domains/display_layouts/defaults.py` |

## Frontend Refinement Map

| Change | Main Files |
| --- | --- |
| Change page layout/panels | `frontend/src/App.tsx`, `frontend/src/styles.css` |
| Add API call | `frontend/src/api/client.ts`, `frontend/src/api/types.ts` |
| Change interval edit form | `App.tsx`, backend borehole schemas/service |
| Add more metadata in right panel | `App.tsx`, backend workbench response |
| Change display edit controls | `workbench/display/DisplaySettingsPanel.tsx` |
| Change shared workbench state | `workbench/display/workbenchStore.ts` |
| Change zoom/depth mapping | `workbench/core/depthScale.ts`, `LogWidget.tsx` |
| Change click/hover behavior | `workbench/core/interactions.ts`, `TrackFrame.tsx` |
| Change curve rendering/tooltip | `workbench/core/curveMath.ts`, `tracks/curve/CurveTrack.tsx` |
| Add a new track | `tracks/<new-track>/`, `LogWidget.tsx`, layout defaults, display catalog |
| Change AI panel | `workbench/ai/AiWorkflowPanel.tsx` |
| Change export panel | `workbench/exports/ExportPanel.tsx` |

## Recommended Next Refactor Sequence

These are not mandatory before the demo, but they will make the system easier to extend.

### 1. Split `App.tsx`

`App.tsx` is currently doing too much: data fetching, mutations, layout, forms, side panels, modals.

Suggested split:

```text
frontend/src/app/
  AppShell.tsx
  BoreholeSelector.tsx
  LeftPanel.tsx
  RightMetadataPanel.tsx
  modals/
    CoreImageModal.tsx
    RemarkModal.tsx
  hooks/
    useWorkbenchQueries.ts
    useWorkbenchMutations.ts
```

This will make UI refinement less risky.

### 2. Add Auth To Frontend

Backend auth exists, but the web UI does not yet have a real login screen/token storage.

Suggested sequence:

1. Add `login()` and `requestMobileOtp()` API helpers.
2. Add a `useAuthStore`.
3. Store token in memory or local storage for demo.
4. Add `Authorization` header in API client.
5. Protect main app screen behind login.

### 3. Make Suggestion Observation Explicit

The geologist can currently edit interval remarks, but suggestions do not have a dedicated observation field.

Suggested backend addition:

```text
AiSuggestion.geologist_observation
AiSuggestion.reviewed_by
AiSuggestion.reviewed_at
```

Suggested UI addition:

```text
AI panel -> selected suggestion -> observation textarea -> save
AI track marker -> click opens suggestion details
```

### 4. Improve Import Profiles

The importer can handle current PBH/CTSJ patterns, but future customer templates should be profile-driven.

Suggested direction:

- Store column mapping rules in `ImportProfile.mapping`.
- Add profile selection during source file processing.
- Record import diagnostics in `SourceImport.summary`.
- Keep raw file in `SourceFile`.

### 5. Add True LAS Import

Export exists for LAS. Import should parse:

- well header
- curve mnemonics
- units
- null value
- depth samples

Store as:

```text
Curve(source_type="las")
CurveSample(depth, value)
SourceImport(import_type="las")
```

### 6. Harden Export Readiness

Current readiness is good for demo. Production should add policy flags:

- block export if open critical suggestions exist
- require geologist observation for warnings
- require source files linked
- require latest validation after last edit
- require target template selection

### 7. Track Performance

For bigger boreholes or dense curves:

- Downsample curves for rendering.
- Keep raw samples for tooltips/export.
- Consider canvas rendering for dense tracks.
- Keep the existing track abstraction so SVG/canvas can be swapped per track.

## Rules For Future Changes

- Do not put geology workflow logic directly in React components.
- Do not put HTTP details in backend services.
- Do not add display-specific fields to core geological models unless they are truly geological data.
- Prefer new track modules over branching inside existing tracks.
- Keep validation deterministic and explainable.
- Keep AI suggestions auditable and reversible.
- Keep import/export template assumptions documented until customer formats are confirmed.

