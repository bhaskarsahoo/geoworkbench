# GeoWorkbench Demo Content For Geologist Discussion

## Demo Positioning

GeoWorkbench is an AI-assisted borehole correction and interpretation workspace for coal geology teams.

The goal is not to replace geological judgement. The goal is to bring field inputs, Excel logs, geophysical curves, corebox images, validation rules, AI suggestions, and export workflows into one review environment where the central geologist remains fully in control.

## Suggested Opening

Today we want to show an early working direction, not a finished mining package.

The prototype demonstrates how a central geologist could review borehole information from multiple sources in a single depth-indexed workspace. We have combined descriptive lithology, interval metadata, corebox references, remarks, validation findings, AI suggestions, and geophysical curve evidence in one display.

The real objective of this meeting is to understand your current workflow: which tools you use, which files you receive from site, where time is lost, and where intelligent assistance would be most useful.

## What The Current Demo Shows

### 1. Depth-Based Borehole Display

The main log widget shows multiple tracks aligned to the same depth axis:

- lithology intervals from Excel
- seam markers
- recovery and RQD style quantitative tracks
- grouped remarks
- AI suggestion markers
- geophysical curves digitized from a Pinnacle composite PDF
- interval metadata and corebox preview in the side panel

This gives the geologist one place to inspect a depth interval without jumping across Excel, images, PDF exports, and notes.

### 2. Configurable Multi-Curve Track

The curve track can show multiple curves in the same track real estate using independent normalization:

- Natural Gamma
- Density
- Resistivity
- SP
- SPR
- Caliper / Inclination composite

Each curve has its own scale, color, unit, visibility, and header row. This is important because curve values may have very different ranges, but the geologist still needs to compare them at the same depth.

### 3. Click, Hover, Context Menu, Zoom, And Scroll

The display supports interaction patterns expected in a professional log viewer:

- click lithology/depth to inspect interval metadata
- hover curve to inspect curve values at a depth
- right-click for context actions
- enable or disable tooltips from the context menu
- scroll normally through the depth range
- zoom intentionally using modifier + mouse wheel
- rubber-band depth zoom

These are early interaction patterns, but the architecture is modular so more track-specific behavior can be added later.

### 4. Corebox And Interval Review

When an interval is selected, the side panel can show:

- interval depth
- lithology code and label
- seam name
- recovery and RQD
- structural features
- remarks
- source row
- corebox preview where available

The geologist can use this panel to compare the interpreted interval with supporting evidence.

### 5. AI-Assisted Suggestions

The AI track and AI workflow panel are meant to show review assistance, not automatic decisions.

Examples:

- coal interval without seam label
- curve coverage mismatch
- gaps or overlaps in future imported logs
- inconsistent recovery/RQD values
- possible boundary review when curves and lithology disagree
- summary of important review points for the borehole

The assistant presents evidence and a recommended action. The geologist accepts, rejects, or manually edits.

## How A Geologist Could Use This

### Step 1: Receive Or Upload Site Inputs

Inputs may come from:

- site Excel sheet
- mobile field forms
- corebox image uploads
- geophysical logs such as LAS/CSV
- fallback PDF exports when raw geophysical data is unavailable

The system stores these as source files and source imports with provenance.

### Step 2: Open The Borehole Review Display

The central geologist opens the borehole and sees all available evidence aligned by depth.

Instead of reviewing Excel, PDF, and images separately, the geologist can move depth-by-depth through the display.

### Step 3: Inspect Suggested Issues

The AI track highlights depth-specific review points. The AI panel shows broader observations and suggestions.

For example:

> This coal/carbonaceous interval has no seam label. Review whether it should inherit a seam name or remain a local/non-seam coal interval.

### Step 4: Override Or Save Interpretation

The geologist remains the authority.

They can:

- edit lithology code
- edit lithology label
- add or change seam name
- add remarks or interpretation comments
- accept an AI suggestion
- reject an AI suggestion
- keep the original value

Every correction should be saved with audit history:

- who changed it
- when it changed
- previous value
- new value
- optional reason/comment

This is important for governance and final sign-off.

### Step 5: Export The Corrected Log

Once review is complete, the corrected borehole log can be exported.

Current export directions:

- Excel/CSV corrected lithology
- LAS style curve export
- future Minex-compatible format once the expected import template is confirmed

## Important Demo Message

Use this phrasing:

> The system does not decide the final geology. It reduces the mechanical work around collecting, aligning, validating, visualizing, and explaining evidence so that the geologist can make faster and better documented decisions.

## What We Need To Learn From Geologists

Ask these questions during the demo:

- Which software do you use for borehole logging and correction today?
- Do you use Minex, Pinnacle, Paradigm, Surpac, AutoCAD, Excel, or other tools?
- What is the normal lifecycle from field logging to corrected final log?
- Which file formats do you receive from site?
- Do you usually receive raw LAS/CSV geophysical logs or only plotted PDFs?
- How are corebox photos named and mapped to depths?
- Which corrections are most common?
- Which validations would you trust the system to flag?
- Which interpretations must always remain manual?
- What export format would make this immediately useful?

## Future Capabilities To Discuss

### Near Term

- robust Excel template profiling
- mobile capture for field forms and file uploads
- LAS/CSV geophysical log import
- display editor with saved layouts
- curve/track settings
- validation rules
- AI-assisted suggestions
- corrected log export
- audit trail and approval workflow

### Medium Term

- geophysical curve and lithology mismatch detection
- seam boundary review suggestions
- corebox image viewer linked to intervals
- comment/interpretation layer for central geologist
- borehole comparison
- seam correlation workspace
- project-level dashboards
- reusable display templates per project/client

### Longer Term

- corebox image analysis for fracture/lithology cues
- RAG over historical borehole reports and geological notes
- coal quality prediction where lab data is available
- roof/floor and geotechnical risk indicators
- seam continuity analytics
- basin or block-level geological intelligence
- enterprise geological knowledge search

## Corebox AI Positioning

Corebox AI should be positioned carefully.

We can start with assistive image workflows:

- organize and view corebox images by depth
- compare images with lithology intervals
- allow geologist annotations
- use vision models for possible fracture or visual cue detection

But reliable automated lithology interpretation from images will require good datasets, domain validation, and staged evaluation. It should be presented as a future capability, not a guaranteed first-phase feature.

## Geophysical PDF Positioning

The SPNG PDF demonstrates a fallback import path.

The system can digitize vector curves from a Pinnacle composite PDF, but this should be treated as review evidence. In production, raw LAS/CSV/DLIS would be preferred because it is more accurate and auditable.

This is a useful discussion point:

> If raw geophysical logs are available, we should import those directly. If only plotted PDFs are available, we can still extract approximate evidence for visual review, with clear QA warnings.

## Closing Statement

This prototype shows the direction of an operational coal borehole correction workspace:

- centralize multi-source borehole evidence
- visualize it in a geologist-friendly display
- flag issues and suggestions
- let the geologist override and save interpretation
- keep audit history
- export corrected logs into downstream mining systems

The next step is to align this with their real file templates, correction workflow, and target export system.
