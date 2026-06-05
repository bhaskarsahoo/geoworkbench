# Coal Borehole Correction Platform - Product Requirements And Delivery Backlog

Date: 29 May 2026

## Purpose

This document defines the proposed product scope for a production-ready coal borehole correction platform. It is based on stakeholder discussions, prototype validation, sample Excel files, core box images, geophysical PDF logs, and the newly shared LAS file.

The intent is to move from prototype demonstration to a working product over an estimated 2-3 month implementation cycle, subject to confirmation of real input templates, expected export formats, approval workflow, and aligned sample data.

## Product Vision

Create a central AI-assisted borehole correction workspace where site data, Excel logs, geophysical curves, core images, geological interpretation, validation rules, AI insights, approval, and export are handled in one controlled workflow.

The system should help geologists:

- Capture field data from mobile in real time or in batches.
- Import Excel, LAS, PDF, and image sources using reusable templates.
- Merge multiple correction stages without losing source traceability.
- View lithology, seams, recovery, RQD, curves, core images, remarks, and AI insights on depth-indexed displays.
- Compare multiple boreholes through correlation displays.
- Edit and override interpretation values with audit history.
- Approve corrected logs.
- Export to downstream software-compatible formats.

## Guiding Principles

- Geologist remains in control; AI suggests, explains, and prioritizes but does not finalize interpretation.
- Raw source data and corrected interpretation must be stored separately.
- Every correction should be auditable.
- Import/export behavior should be template-driven, not hardcoded per file.
- Displays should be configurable by project/user.
- The system must support multiple boreholes, sites, projects, and correction stages.
- Production storage should use PostgreSQL and durable file storage.

## Core Workflow

1. Site user creates or selects borehole from mobile.
2. Site user captures interval data, runtime parameters, images, and uploads files.
3. Central system receives mobile submissions and source files.
4. Import profiling identifies template, metadata, depth ranges, curves, and conflicts.
5. Central user reviews merge preview and applies selected data into a correction stage.
6. Geologist reviews depth-indexed visualization and analytics.
7. Rules and AI generate issues, insights, summaries, and suggested review areas.
8. Geologist edits intervals, markers, curves, seams, recovery/RQD, remarks, and observations.
9. Reviewer approves corrected interpretation.
10. User exports selected data using configured export settings.

## Epic 1 - Mobile Field Capture

Goal:

Support complete field capture from mobile, including interval logging, runtime drilling/site parameters, files, and images.

Features:

- Backend-driven configurable mobile forms.
- Borehole creation with project, site, borehole code, title, state, coordinates, RL, water level, and current depth.
- Interval capture for Excel-equivalent fields: from depth, to depth, lithology code, lithology description, color, grain size, recovery, recovery percent, RQD, seam, structural features, remarks, and observations.
- Capture of runtime/site parameters as template-defined fields.
- Incremental interval sync.
- Batch sync when network is intermittent.
- Offline draft storage.
- File upload for Excel, LAS, PDF, images, and attachments.
- Camera capture for core box images and site evidence.
- Image metadata capture: borehole, box number, from depth, to depth, image type, timestamp, GPS if available, captured by.
- Visible sync/upload status, progress, retry, and error states.

Requirements:

- Mobile form schema must come from backend templates.
- Mobile submissions must not overwrite central corrected data directly.
- Each submission must be linked to borehole, user, timestamp, source device, and sync batch.
- Uploaded files must be associated with the borehole and available for central import/merge.

Acceptance:

- Site user can create a borehole and submit interval data without creating Excel.
- Site user can capture/upload core box photos and associate them with depth information.
- Central user can review mobile submissions before merging.

## Epic 2 - Import Templates, Profiling, And Merge

Goal:

Support reusable import workflows for Excel, LAS, PDF, images, and mobile data, with controlled merge into correction stages.

Features:

- Import template registry for known Excel formats.
- Excel profiling: sheet detection, header detection, column mapping, unit detection, metadata extraction, and validation summary.
- LAS import using LAS well metadata, curve definitions, null value, depth step, and curve samples.
- Geophysical PDF import as fallback when raw curve data is unavailable.
- Image import with depth mapping and image type classification.
- Merge preview showing affected intervals, curves, images, markers, and conflicts.
- Merge modes: append, replace draft, update selected fields, create correction stage, ignore conflicting fields.
- Multiple correction stages: raw, field submitted, imported, central corrected, reviewed, approved final.
- Conflict detection between mobile, Excel, LAS, image metadata, and existing corrected interpretation.
- Import audit history.

Specific LAS Requirement:

The shared `CTSJ-02 P-27 COMPOSITE.las` should be supported as a first real LAS import case. It appears to be LAS 2.0 with depth from `0.0m` to `683.1m`, `0.01m` step, and curves such as SP, 16N/64N resistivity, SPR, inclination, azimuth, natural gamma, density, caliper, and sonic-style measurements.

Acceptance:

- Known Excel templates import automatically.
- Unknown Excel formats route to template mapping.
- LAS curves import with units, null handling, and metadata.
- User can merge selected sections into a chosen correction stage.

## Epic 3 - Canonical Data Model And Storage

Goal:

Store all data in a normalized, auditable structure that supports import, correction, visualization, AI, approval, and export.

Features:

- Project, site, and borehole master metadata.
- Lithology interval model.
- Recovery/RQD/seam/remarks/structural feature models.
- Curve model with source, units, null handling, sample density, and display metadata.
- Core image model with file, box, depth range, and annotations.
- Marker model for seams, formations, faults, horizons, and interpreted picks.
- Correction stage model.
- Audit model for edits, merges, approvals, exports, and AI decisions.
- Template model for mobile forms, import mappings, export mappings, display layouts, unit settings, and dictionaries.

Requirements:

- Raw source data must be immutable after import.
- Corrected interpretation must be versioned/staged.
- Every final value should be traceable to source, manual edit, merge, or AI/rule suggestion.
- PostgreSQL should be the production database.
- Original source files and derived artifacts must be retained.

Acceptance:

- User can inspect source and correction history for an interval.
- Multiple correction stages can exist for one borehole.
- Import/export templates can operate on normalized data.

## Epic 4 - Visualization Workspace And Track System

Goal:

Provide a modular depth-indexed workspace for geological interpretation and analytics.

Features:

- Display management: default display, project displays, user displays, clone display, save display, reset display.
- Runtime and edit modes.
- Widget catalog: log widget, single value widgets, import status, AI workflow, export status, notes, correlation preview.
- Log widget with configurable tracks.
- Track types: depth, lithology, seam, recovery, RQD, curve, remarks, AI markers, core image strip, formation markers, custom interval track.
- Shared track-object interaction model: hit testing, depth mapping, selection, context menu, tooltip, drag, edit hooks.
- Curve track with multiple curves, normalization per curve, curve header rows, units, color, min/max, show/hide, and tooltip.
- Core image track showing vertically stacked core images arranged by depth.
- Lithology pattern rendering.
- Per-track and per-object settings.

Requirements:

- Track interactions must distinguish depth selection, curve selection, interval selection, image selection, and marker selection.
- Track headers must be excluded from depth calculations.
- Scroll should work as depth scrolling; zoom should use explicit controls or modifier key.
- Core image track must support full image view and future annotation.

Acceptance:

- User can configure which tracks and curves appear on a display.
- User can select track objects and open relevant edit/settings actions.
- Core images can be reviewed in depth order.

## Epic 5 - Geological Editing And Correction

Goal:

Allow geologists to correct all relevant interpretation fields while preserving audit and approval control.

Features:

- Customizable interval edit form.
- Project-specific edit templates.
- Edit lithology code, description, from/to depth, color, grain size, recovery, recovery percent, RQD, seam, structural features, remarks, water/runtime fields, and observations.
- Split interval, merge intervals, adjust boundary, and clone interval.
- Edit seam intervals and formation/marker picks.
- Edit RQD, recovery, and seam directly from track/object actions.
- Edit curve metadata and display settings.
- Add observations linked to depth/interval.
- Accept/reject AI suggestions with geologist comments.
- Batch edit selected intervals.

Requirements:

- Edits must create audit records.
- Some edits may require approval depending on workflow status.
- Editing must validate gaps, overlaps, and invalid depths immediately.
- Raw source records must not be mutated by correction edits.

Acceptance:

- Geologist can correct all configured interval fields.
- System records who changed what, when, and why.
- Validation state updates after edit.

## Epic 6 - Rules And AI-Assisted Geological Insights

Goal:

Generate explainable review insights from lithology, curves, core images, remarks, and historical patterns.

Features:

- Deterministic validation rules:
  - Gaps and overlaps.
  - Missing lithology, seam, recovery, or RQD values.
  - Invalid depth ranges.
  - Curve coverage mismatch.
  - Missing core image mapping.
  - Imported metadata conflict.
- Curve-derived insights:
  - Gamma/resistivity/density anomalies.
  - Coal seam candidate zones.
  - Lithology and curve disagreement.
  - Missing/noisy/null curve intervals.
  - Caliper washout or borehole quality warnings.
  - Inclination/azimuth/deviation review flags.
- Cross-source insights:
  - Excel lithology versus LAS curve behavior.
  - Core image versus lithology description.
  - Remarks clustering and review hot spots.
  - Recovery/RQD versus fractured remarks.
- AI assistant:
  - Borehole summary.
  - Issue prioritization.
  - Suggested review intervals.
  - Evidence-based explanation.
  - Natural-language query over borehole data.
  - Draft correction note or approval summary.
- Future AI:
  - Vision-assisted core image classification.
  - Historical similarity search.
  - ML-supported seam/formation candidate prediction after enough labeled data exists.

Requirements:

- Rules must be deterministic, testable, and explainable.
- AI must cite evidence: interval, curve, image, source file, and rule result.
- AI must not auto-change approved interpretation.
- Model training should be deferred until sufficient labeled customer/project data exists.

Acceptance:

- User can generate insights for a borehole.
- Each insight shows evidence and recommended action.
- User can accept, reject, or comment on insight.

## Epic 7 - Multi-Borehole Correlation Display

Goal:

Support geological correlation across multiple boreholes using seams, formations, markers, curves, and lithology.

Research Questions:

- Should correlation align by depth, ground level, reduced level/RL, formation top, seam marker, or custom datum?
- Which markers matter most: seams, formations, coal bands, faults, water level, weathering zone, casing, geophysical picks?
- Is deviation/trajectory required now or future?
- What do they currently use in Minex/Pinnacle/other tools?

Features:

- Multi-borehole panel with each borehole as a vertical column/log.
- Shared scale and datum options.
- Formation/seam marker lines across boreholes.
- Curve/lithology/marker tracks per borehole.
- Correlation line drawing/editing.
- Marker pick table.
- Save correlation displays.
- Export correlation marker table.

Requirements:

- Correlation must use normalized marker and borehole metadata.
- Display must support configurable datum and depth/RL conversion.
- It must not assume all boreholes have identical data availability.
- Markers must be editable and auditable.

Acceptance:

- User can select multiple boreholes and view logs side by side.
- User can align by depth or RL.
- User can view and edit formation/seam markers.

## Epic 8 - Export Configuration

Goal:

Allow users to configure what data is exported and in which downstream-compatible format.

Features:

- Export settings screen.
- Format selection: Excel, CSV, LAS, Minex-compatible template, marker table, image manifest.
- Field selection for intervals, metadata, curves, markers, images, and audit fields.
- Unit settings and output precision.
- Depth range selection.
- Correction stage selection.
- Export template registry.
- Export preview and validation.
- Export job history and download links.

Requirements:

- Export must respect approval rules.
- Export templates must be versioned.
- Export output must include stage/source metadata where appropriate.
- LAS export must preserve curve metadata and null handling.

Acceptance:

- User can choose format, fields, curves, depth range, and correction stage.
- Export history shows who exported what and when.

## Epic 9 - Approval And Workflow Governance

Goal:

Separate data arrival, central correction, AI review, approval, and export into clear workflow states and screens.

Features:

- Workflow states: draft, field submitted, import pending, merge review, central correction, ready for approval, approved, exported, reopened.
- Role-based actions: field user, central geologist, reviewer, admin.
- Approval checklist.
- Validation blockers and warnings.
- Approval comments and rejection reasons.
- Reopen approved borehole with reason.
- Separate workflow areas for data arrival, interpretation, AI review, approval, and export.

Requirements:

- Approval must be explicit.
- Export can be blocked until approval depending on project settings.
- Approval/rejection/reopen must be audited.
- UI should avoid putting every workflow action into one crowded display.

Acceptance:

- Borehole can move through defined workflow states.
- Reviewer can approve or reject with comments.
- Export readiness reflects approval and validation state.

## Epic 10 - Lithology Dictionary And Patterns

Goal:

Render lithology using project-configurable geological colors, patterns, and legends.

Features:

- Lithology dictionary.
- Color and pattern mapping by lithology code.
- Pattern library for coal, sandstone, shale, clay, siltstone, mixed lithology, fractured zones.
- Legend widget.
- Pattern density/scale settings.
- Import mapping from Excel lithology codes to dictionary entries.
- User override for display color/pattern.

Requirements:

- Patterns must remain legible during zoom.
- Lithology track must avoid crowded text.
- Dictionary must be project configurable.

Acceptance:

- Lithology intervals render with configured colors/patterns.
- Legend explains active lithology symbols.

## Epic 11 - Curve Governance And Curve Editing

Goal:

Manage geophysical curves as data assets with metadata, quality, display configuration, and analytics support.

Features:

- Curve catalog per borehole.
- Curve metadata edit: label, unit, type, source, color, min/max, normalization, null value, sample interval.
- Curve selection per track.
- Curve quality flags.
- Curve resampling for display performance.
- Preserve raw samples and derived/resampled samples.
- Curve import preview and statistics.
- Curve-derived marker picking.

Requirements:

- Raw curve data must remain immutable after import.
- Display curve settings must be separate from source curve values.
- Large LAS files must render efficiently.

Acceptance:

- User can import LAS and choose curves for display.
- User can edit curve display settings without changing raw data.
- Curve tooltip and AI insights use source metadata correctly.

## Epic 12 - Platform, Security, And Operations

Goal:

Prepare the system for controlled production deployment and customer rollout.

Features:

- PostgreSQL schema and migrations.
- Durable file storage for source and derived files.
- Username/password web login.
- Mobile OTP login with push notification provider configuration.
- Role-based permissions.
- Windows VM deployment with IIS/reverse proxy and Windows services.
- Backup/restore.
- Audit logs.
- Environment-based settings.
- Demo/test data reset utilities.

Requirements:

- Production should use direct PostgreSQL.
- Services must restart cleanly after reboot.
- Logs and uploads must be stored outside code directories.
- Demo and production data must be separable.

Acceptance:

- System can be deployed to a server using documented steps.
- Admin can reset demo/test data without deleting product configuration.
- User actions are authenticated and auditable.

## Delivery Roadmap

### Month 1 - Foundation And Data Lifecycle

- Canonical data model refinement.
- Workflow states and approval separation.
- LAS import for the shared LAS file.
- Excel import template registry and profiling.
- Mobile form schema driven by backend templates.
- Full interval edit form.
- Import source storage and merge preview foundation.

### Month 2 - Visualization, Merge, And Export

- Selective merge from mobile/Excel/LAS/image sources.
- Core image depth track.
- Curve catalog and curve settings.
- Lithology dictionary and pattern rendering.
- Export settings and configurable export templates.
- Separate workspaces for data arrival, interpretation, AI review, approval, and export.

### Month 3 - AI Insights, Correlation, And Hardening

- Curve-derived geological insights.
- Lithology/curve disagreement detection.
- AI borehole summary and review recommendations.
- Multi-borehole correlation display foundation.
- Approval workflow hardening.
- Deployment, backup, role-based security, and operational readiness.

## Open Questions For Stakeholders

- Can they provide one complete aligned borehole package: Excel, LAS, core images, metadata, expected corrected output?
- What are the official Excel templates and mandatory fields?
- What export formats are required for Minex, Pinnacle, or other downstream tools?
- Should correlation align by depth, RL, seam marker, formation top, or configurable datum?
- What approval roles and steps are required?
- Which validations are most valuable for daily geology work?
- How are core box images named, captured, and depth-mapped today?
- Which fields should be editable at interval, track, curve, marker, and borehole level?

