# MVP Scope

## MVP Objective

Create a usable borehole log correction and review system that supports:

- multi-site and multi-borehole data management
- Excel, LAS/CSV geophysical log, image, and mobile input ingestion
- editable depth-based geological visualization
- central geologist correction and approval
- AI-assisted validation, suggestions, summaries, and export readiness checks
- corrected borehole log export

The MVP does not need advanced image AI or model training initially. It should be useful with deterministic validation, strong visualization, editable workflows, and source-linked AI assistance.

## Primary Workflow

1. Site user uploads or captures borehole input.
2. System imports Excel, LAS/CSV curves, images, and form metadata.
3. System normalizes source data into a canonical borehole record.
4. System runs validation and AI-assisted review suggestions.
5. Central geologist opens the visualization workspace.
6. Central geologist edits, accepts, rejects, or overrides suggestions.
7. System stores correction history and approved log version.
8. System exports corrected logs to Excel/CSV/LAS and customer-specific Minex import templates.

## Core MVP Modules

### 1. Data Import And Capture Module

Supported formats:

- Excel
- CSV
- LAS
- image folders
- mobile forms/files

Input categories:

- borehole collar data
- interval lithology
- geophysical logs
- seam information
- coal quality
- core box images
- source files and field notes

### 2. Borehole Correction Workspace

Features:

- lithology columns
- geophysical curves
- zoom and pan
- editable visual intervals
- editable synchronized interval table
- seam highlighting
- depth metadata panel
- core image panel
- correction history
- review/approval status

### 3. Display Layout And Widget Settings

Features:

- predefined displays
- cloned custom displays
- runtime mode for normal geological review/correction
- edit mode for authorized layout design
- widget add/remove/drag/drop/resize in edit mode
- add/remove/reorder/resize tracks
- modular track types for curves, lithology, seams, remarks, images, AI suggestions, and depth axis
- multi-curve track support for curves sharing the same depth index
- per-curve show/hide settings within a track
- per-curve display normalization so different value ranges can share one track
- curve tooltip and pinned selection using nearest measured point
- track header configuration for curve min/max, units, autoscale/manual status, and source status
- curve min/max/autoscale settings
- configurable single-value widgets
- saved layouts per user/project/workflow
- JSON-based display/widget/track settings persisted in the database
- unit settings for display conversions where valid
- measured-depth first model, with future support for TVD/deviation survey data

### 4. Data Validation Module

Checks:

- missing intervals
- overlapping intervals
- invalid depth ranges
- inconsistent naming
- seam continuity issues
- curve depth range mismatch
- missing image depth mapping

### 5. AI Suggestion Layer

Initial AI features:

- source-linked borehole summaries
- lithology normalization suggestions
- seam label review suggestions
- geophysical curve/log mismatch flags
- data anomaly explanations
- draft report generation
- export readiness assistant

### 6. Geological Assistant

Natural-language assistant for:

- summaries
- geological observations
- querying datasets
- report drafting
- explaining corrections and validation issues
- finding depth intervals, remarks, core images, and curve anomalies

### 7. Export And Reporting

Exports:

- CSV
- Excel
- LAS where appropriate
- PDF summaries
- validation/correction history
- customer-specific Minex import template after format confirmation

## Non-Goals for MVP

Do not initially build:

- advanced 3D geological modeling
- mine planning systems
- real-time drilling systems
- enterprise deployment complexity
- highly customized ML training infrastructure
- reliable automatic core image lithology/fracture interpretation
- full seismic interpretation workflows

## Success Criteria

The MVP succeeds if geologists say:

- this saves time
- this improves consistency
- this reduces repetitive work
- this is easier than current workflows
- this could become part of daily work
- this produces a trustworthy corrected borehole log
- this can feed their existing mining software workflow
