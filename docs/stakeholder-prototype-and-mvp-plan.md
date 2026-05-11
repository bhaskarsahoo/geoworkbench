# GeoWorkbench Stakeholder Prototype and MVP Plan

## Objective

Build a strong stakeholder case around a real coal borehole workflow using the geologist-provided PBH-62 workbook and core box images.

The immediate goal is not to build the full production platform. The goal is to demonstrate that GeoWorkbench can make borehole logging, visualization, validation, review, and reporting faster and more reliable for coal geologists.

## Product Thesis

GeoWorkbench should feel like a configurable geological log workspace:

- import coal borehole data from Excel and future formats
- transform messy inputs into normalized geological records
- visualize lithology, seams, recovery, RQD, remarks, and curves as tracks
- link core box images to depth intervals
- support geologist review, correction, and notes
- prepare the same data foundation for future correlation and operational views

## Recommendation

Proceed in two layers:

1. Create a polished HTML/JavaScript stakeholder prototype first.
2. In parallel, design the implementation contracts so the prototype can evolve into the real Log Widget.

Do not jump directly into a full React/FastAPI/PostgreSQL MVP before stakeholder feedback. The risk is building too much around assumptions. The prototype should validate the workflow, terminology, visual layout, and stakeholder excitement.

However, the prototype should not be a pure mockup. It should display the actual PBH-62 workbook-derived data so feedback is grounded in a real geologist artifact.

## Milestone 1 - Data Understanding and Normalization

### Goal

Convert the geologist workbook into a normalized borehole dataset that the prototype can consume.

### Tasks

- Inspect workbook metadata and sheet structure.
- Define PBH-62 borehole identity and source metadata.
- Extract run intervals:
  - from depth
  - to depth
  - thickness
  - recovery
- Extract lithology intervals:
  - from depth
  - to depth
  - thickness
  - recovery
  - lithology code
  - color
  - structural features
  - remarks
- Extract seam intervals:
  - seam name
  - depth interval
  - associated lithology
- Extract RQD values where available.
- Build initial lithology code dictionary from observed codes.
- Preserve the raw source row for traceability.
- Export normalized JSON for the prototype.

### Testing

- Unit test workbook parsing.
- Validate interval depth math.
- Check for missing or invalid from/to depths.
- Check overlaps and gaps in lithology intervals.
- Verify final interpreted depth reaches the borehole closure depth.
- Snapshot-test normalized JSON output.

### Output

- `sample-data/pbh-62-normalized.json`
- `docs/pbh-62-data-mapping.md`

## Milestone 2 - Stakeholder Log Widget Prototype

### Goal

Create a browser-based Log Widget that renders real PBH-62 data as geological tracks.

### Tasks

- Build a single HTML/JavaScript prototype screen for PBH-62.
- Add vertical depth axis.
- Add lithology track with coal-relevant color palette.
- Add seam marker track.
- Add recovery track.
- Add RQD track.
- Add remarks/structure track.
- Add selected interval detail panel.
- Add linked core image preview panel.
- Add basic zoom and pan:
  - full borehole view
  - selected depth window
  - reset zoom
- Add track visibility toggles.
- Add track width/order settings in a simple settings panel.
- Add placeholder synthetic curve track for gamma/density until real LAS data is available.

### Testing

- Manual browser checks at common resolutions:
  - 1366 x 768
  - 1920 x 1080
  - 2560 x 1440
  - narrow/tablet-like width
- Verify depth scale alignment across all tracks.
- Verify lithology interval block heights match depth intervals.
- Verify seam markers appear at correct depths.
- Verify selected interval details match source data.
- Verify no text overlap in compact display.

### Output

- Updated prototype under `prototype/`
- Stakeholder-ready PBH-62 demo screen

## Milestone 3 - Track Configuration and Interaction

### Goal

Show that GeoWorkbench is a configurable geological workspace, not a static chart.

### Tasks

- Add show/hide controls per track.
- Add basic track reorder controls.
- Add track width controls.
- Add curve min/max settings.
- Add curve auto-scale option.
- Add context menu on tracks.
- Add context menu on intervals.
- Add actions:
  - inspect interval
  - add remark
  - mark reviewed
  - show source row
  - hide track
  - track settings
- Add visual warnings for:
  - interval gaps
  - overlaps
  - missing lithology
  - missing RQD
  - recovery greater than thickness

### Testing

- Interaction tests for settings state changes.
- Verify hidden tracks do not affect depth alignment.
- Verify warnings are deterministic from validation rules.
- Verify context menu actions open the correct panel/action.

### Output

- Configurable Log Widget prototype
- Early interaction model for production implementation

## Milestone 4 - Stakeholder Demo Package

### Goal

Create a clear demo story for geologists, technical stakeholders, and decision makers.

### Tasks

- Update demo flow around PBH-62.
- Fix architecture diagrams so they match the actual plan:
  - importer and transformation layer
  - canonical data model
  - interval/curve/asset storage
  - Log Widget visualization layer
  - future realtime/operational adapter
- Prepare demo script:
  - import borehole log
  - view PBH-62 tracks
  - inspect coal seams
  - inspect recovery/RQD/remarks
  - link core box image to interval
  - show AI-style summary
  - show configurable tracks
- Prepare questions for geologists:
  - Are these tracks useful?
  - Which track is missing?
  - Are lithology colors/patterns acceptable?
  - How do they currently review core images?
  - What edits must be fastest?
  - What report output saves the most time?

### Testing

- Dry-run the demo.
- Verify prototype loads without setup friction.
- Verify all demo clicks are deterministic.
- Verify stakeholder flow can be completed in under 10 minutes.

### Output

- Updated `docs/mvp-demo-flow.md`
- Fixed `.drawio` diagrams
- Stakeholder demo checklist

## Milestone 5 - End-to-End MVP Plumbing

### Goal

Build the first implementation skeleton that proves data can flow from import to storage to visualization.

### Tasks

- Create backend project skeleton.
- Create frontend project skeleton.
- Add PostgreSQL schema for:
  - projects
  - boreholes
  - intervals
  - curves
  - assets
  - remarks
  - track layouts
  - source imports
- Add importer service for PBH-62 workbook.
- Add normalized Track API:
  - intervals by borehole and depth range
  - curves by borehole and depth range
  - assets by borehole and depth range
  - validation issues by borehole
- Add frontend Log Widget shell.
- Render PBH-62 from API data.
- Save and load track layout configuration.

### Testing

- Parser unit tests.
- API integration tests.
- Database migration tests.
- Frontend rendering tests for track layout.
- Playwright smoke test:
  - open PBH-62
  - verify tracks visible
  - select interval
  - toggle track
  - zoom depth range

### Output

- First production-grade plumbing from real workbook to visual display

## Milestone 6 - Production Log Widget Foundation

### Goal

Turn the prototype viewer into the reusable visualization foundation for MVP and future correlation.

### Tasks

- Implement track registry:
  - depth
  - lithology
  - seam
  - recovery
  - RQD
  - curve
  - remarks
  - image
  - AI suggestions
- Use D3 scales for depth and curve scaling.
- Use Canvas for dense curve rendering.
- Use SVG/HTML overlay for intervals, labels, selections, and menus.
- Support high-DPI rendering.
- Support responsive display modes:
  - compact
  - standard
  - wide
  - wall/review
- Add historical mode and future live/follow mode state model.
- Add saved layouts:
  - Field Review
  - Geophysical Review
  - Correlation Review
  - Wall Display

### Testing

- Visual regression tests for display modes.
- Pixel-density rendering checks.
- Zoom/pan state tests.
- Track alignment tests.
- Curve min/max scale tests.
- Performance test with large synthetic curve datasets.

### Output

- Reusable production Log Widget

## Milestone 7 - Correlation-Ready Workspace

### Goal

Prepare the visualization model for multi-borehole comparison and seam correlation.

### Tasks

- Add multi-log layout.
- Synchronize depth zoom/pan across boreholes.
- Share lithology palette and seam colors across logs.
- Add seam correlation line overlay.
- Add selected seam focus mode.
- Add side-by-side borehole comparison.
- Add correlation notes.

### Testing

- Multi-borehole layout tests.
- Synchronized zoom/pan tests.
- Seam marker alignment tests.
- Correlation line rendering tests.

### Output

- First correlation workspace prototype

## Milestone 8 - Future Operational Runtime Adapter

### Goal

Keep the architecture ready for operational/realtime feeds without making it part of the first MVP.

### Tasks

- Define depth/time sample model.
- Define stream adapter interface.
- Define live viewport mode:
  - follow latest depth
  - follow latest time
  - pause to historical mode
  - resume live
- Add synthetic stream simulator.
- Add append-only curve updates.
- Add backplot view concept:
  - curve vs curve
  - ROP vs depth
  - recovery/RQD vs depth

### Testing

- Stream simulator tests.
- Live/historical viewport state tests.
- Append performance tests.
- Backplot scale tests.

### Output

- Runtime-ready architecture without overcommitting to sensor integration

## Testing Principles

- Test data transformation separately from visualization.
- Keep parser tests tied to real workbook examples.
- Validate geological interval rules before rendering.
- Use visual regression for the Log Widget because layout bugs are product bugs.
- Use Playwright for user flows, not just unit tests.
- Keep source traceability from visual interval back to workbook row.
- Use synthetic high-volume curve data for performance testing before real LAS/runtime data arrives.

## Stakeholder Feedback Strategy

The first feedback session should not ask whether people like AI. It should ask whether this improves their daily geology workflow.

Recommended demo questions:

- Does the PBH-62 log display match how you think about the borehole?
- Which tracks would you want visible by default?
- Which remarks/features should become symbols?
- Which edits need to be fastest?
- Would linking core box images to depth intervals save review time?
- What validation warnings would you trust?
- What report output would save the most time?
- Where would this fit into your current process?

## Decision Point

After Milestone 4, decide whether to:

- continue improving prototype for more stakeholder validation, or
- begin Milestone 5 production plumbing.

The decision should be based on whether geologists confirm that the workflow, tracks, terminology, and visual interaction model are credible.
