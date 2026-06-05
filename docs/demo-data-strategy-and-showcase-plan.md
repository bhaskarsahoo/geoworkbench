# Demo Data Strategy And Showcase Plan

Date: 5 June 2026

## Objective

Prepare a stakeholder-ready demo that shows the proposed coal borehole correction platform using controlled dummy/test data, without waiting for the stakeholders to provide a complete aligned production dataset.

The demo should make the full product vision visible:

- Mobile field capture.
- Import templates and merge.
- Depth-indexed visualization.
- Core image depth track.
- Curve selection and editing.
- Lithology patterns.
- AI/rule insights.
- Multi-borehole correlation.
- Approval and export settings.

The demo data must be realistic enough for geologists to discuss workflow, but clearly marked as synthetic/test data so nobody treats it as final interpretation.

## Research Summary

The demo should follow patterns used in well/borehole interpretation products:

- Correlation views commonly compare multiple wells/boreholes side by side with logs, markers, tops, lithology, and curve tracks.
- Commercial tools emphasize configurable display templates, manual/automatic marker picking, and editing of tops/markers in correlation views.
- Core images can be shown as depth-aligned visual evidence alongside logs.
- LAS import and digital log tracks are normal inputs for correlation and interpretation workflows.

Useful references reviewed:

- SLB Petrel Well Correlation: flexible 2D correlation canvas with logs, core images, markers, seismic/grid context, and manual/automatic well-top editing.
- DUG Insight Well Correlation View: multi-well comparison using templates to customize well log display.
- IHS/AccuMap correlation help: compare multiple wells against a reference, pick formation tops, markers, and reservoir layers.
- Maptek GeologyCore correlation help: drillhole correlation and automatic association of LAS geophysical logs to drillholes when naming matches.
- dGB/OpendTect Well Correlation Panel: 2D correlation panels with logs, markers, stratigraphy, and optional seismic backdrop.

## Demo Dataset Concept

Create one fictional coal block with 5-7 synthetic boreholes. All boreholes should be generated from the same underlying geological model so they are intentionally alignable.

Example project:

- Project: `DEMO-COAL-BLOCK`
- Area: `Synthetic Jalatap-Shardhapur Sector`
- Coordinate system: local mine grid or WGS84 placeholders.
- Boreholes:
  - `DMBH-01`
  - `DMBH-02`
  - `DMBH-03`
  - `DMBH-04`
  - `DMBH-05`
  - Optional deviation example: `DMBH-06D`

Each borehole should have:

- Borehole metadata: collar coordinates, RL, water level, total depth, drilling dates, site geologist.
- Lithology intervals.
- Seam intervals.
- Recovery and RQD intervals.
- Remarks/structural features.
- Geophysical curves in LAS format.
- Core box image strips or generated core images mapped to depth.
- Marker/formational tops.
- Intentional issues for rule/AI demo.
- Correction stages: raw field log, imported update, central corrected draft, approved final.

## Synthetic Geological Model

Use a simple but believable coal sequence that varies gently across boreholes:

- Overburden/weathered zone.
- Sandstone/siltstone alternations.
- Shale/claystone zones.
- Coal seam A.
- Interburden.
- Coal seam B with split/parting in some boreholes.
- Carbonaceous shale.
- Coal seam C, thinning or missing in one borehole.
- Basement/non-coal lower unit.

Each marker should have a regional trend:

- Seam A deepens from west to east.
- Seam B thickens toward the middle boreholes.
- Seam C is weaker/missing in one borehole.
- Fault/discontinuity shifts markers in one borehole to create a correlation discussion.

This gives the correlation display a clear story:

"The geologist can compare boreholes, pick/adjust seam markers, notice a local offset, and decide whether a marker is missing, shifted, or incorrectly logged."

## File Outputs To Generate

For each synthetic borehole:

- Excel workbook using the known descriptive lithology style.
- LAS file with raw curves.
- Core image manifest.
- Core box images.
- Mobile submission JSON fixture.
- Import profile/result JSON fixture.

Recommended generated folder:

```text
sample-data/demo-coal-block/
  boreholes/
    DMBH-01/
      DMBH-01-descriptive-log.xlsx
      DMBH-01-geophysical.las
      DMBH-01-mobile-field-submissions.json
      core-images/
      core-image-manifest.csv
    DMBH-02/
    ...
  templates/
    descriptive-lithology-template.json
    mobile-field-form-template.json
    las-curve-template.json
    export-template-minex-demo.json
  expected/
    correlation-markers.csv
    approved-export-preview.xlsx
```

## Synthetic Curve Strategy

Generate LAS curves from lithology intervals so the curves make geological sense:

- Natural gamma:
  - Low for coal and clean sandstone.
  - Higher for shale/claystone.
  - Variable for carbonaceous shale.
- Resistivity:
  - Higher for coal and cleaner sandstone.
  - Lower for shale/claystone.
- Density:
  - Lower for coal.
  - Higher for sandstone/shale.
- Caliper:
  - Enlarged/washout zones in weak clay or fractured intervals.
- SP:
  - Deflections near permeable sandstone units.
- Inclination/azimuth:
  - Mostly vertical for normal boreholes.
  - One deviated borehole to support future deviation discussion.

Add controlled noise and missing/null segments to support validation:

- Missing gamma coverage over one interval.
- Resistivity null section.
- Density spike near a suspicious seam.
- Caliper washout warning.

## Core Image Strategy

For the demo, do not depend on real client images. Generate or compose synthetic core strips with visible lithology bands.

Each image should represent a core box/run:

- `box_number`
- `from_depth`
- `to_depth`
- `image_type = core_box`
- `captured_by`
- `captured_at`

Show two image modes:

- Thumbnail/full-image view in interval panel.
- Core image depth track: vertically stacked image strips aligned to depth.

The synthetic images should intentionally include:

- Coal band.
- Shale/clay band.
- Fractured core zone.
- Missing/broken recovery interval.
- Wrong depth tag on one image for validation demo.

## Intentional Data Quality Cases

Seed known issues so rule and AI insights have meaningful examples:

- Lithology interval gap.
- Lithology interval overlap.
- Coal-like curve response logged as shale.
- Coal interval missing seam name.
- Seam marker shifted relative to curve response.
- RQD/recovery missing in selected intervals.
- Core image depth range not matching interval run.
- LAS curve stops before borehole total depth.
- Imported Excel metadata conflicts with borehole master metadata.
- Mobile submission overlaps central corrected interval.

These should not be random; they should be scripted so the demo can tell a clean story.

## Demo Screens And Stories

### Story 1 - Landing And Borehole Selection

Show:

- Active boreholes.
- Historic boreholes.
- Display selection.
- Project settings placeholder.
- Unit/export/template settings entry points.

Message:

"This is a central workspace for many boreholes, not a single-file viewer."

### Story 2 - Mobile Field Capture

Show:

- Create/select borehole.
- Capture interval.
- Capture core image from camera.
- Upload LAS/Excel/PDF/image.
- Sync status.

Message:

"Site data can arrive continuously, and central users decide how to merge it."

### Story 3 - Import Template And Merge

Show:

- Uploaded source files.
- Excel profile.
- LAS profile.
- Core image manifest.
- Merge preview.
- Conflict list.
- Apply selected fields to correction stage.

Message:

"The system supports multiple correction steps instead of one destructive import."

### Story 4 - Visualization And Customization

Show:

- Depth log with lithology, seams, recovery, RQD, curves, remarks, AI markers.
- Add/remove/reorder/resize tracks.
- Curve selection and normalization.
- Lithology patterns.
- Core image depth track.

Message:

"The geologist can build the display needed for a specific review task."

### Story 5 - AI And Rule Insights

Show:

- Rule validation issues.
- Curve/lithology mismatch.
- Coal seam candidate interval.
- Missing RQD/recovery warnings.
- Core image mapping issue.
- AI summary with evidence.
- Accept/reject/comment.

Message:

"The assistant prioritizes review areas and explains evidence, while the geologist decides."

### Story 6 - Editing And Correction

Show:

- Edit full interval fields.
- Edit RQD/recovery/seam from track/object.
- Adjust marker/seam pick.
- Add geologist comment.
- Save draft correction.

Message:

"The corrected borehole log is owned by the geologist and fully auditable."

### Story 7 - Correlation Display

Show:

- 5 boreholes side by side.
- Align by depth or RL.
- Formation/seam marker lines.
- Curve/lithology tracks per borehole.
- Pick/edit seam marker.
- Fault/discontinuity discussion.

Message:

"This helps interpret continuity across boreholes, not just correct one borehole in isolation."

### Story 8 - Approval And Export

Show:

- Readiness checklist.
- Approval status.
- Export settings.
- Select fields/curves/depth range/stage.
- Export Excel/LAS/CSV/Minex-demo template.

Message:

"Only reviewed data should move to downstream mining/geology software."

## Demo Implementation Backlog

### Demo Milestone A - Synthetic Dataset Generator

Build a repeatable generator that creates:

- 5-7 boreholes from one synthetic geological model.
- Excel descriptive logs.
- LAS files.
- Core image manifests.
- Synthetic core strip images.
- Marker tables.
- Intentional data quality issues.

Acceptance:

- Running one script resets and regenerates the demo data.
- Seeded data is deterministic.
- Demo boreholes appear in the web landing page.

### Demo Milestone B - LAS Import And Curve Catalog

Build:

- LAS parser/importer.
- Curve metadata extraction.
- Curve statistics.
- Curve selection UI.
- Curve display settings.

Acceptance:

- Shared LAS and synthetic LAS files import successfully.
- User can select curves for display.

### Demo Milestone C - Core Image Depth Track

Build:

- Core image track renderer.
- Depth-aligned image stacking.
- Click-to-full-image.
- Missing/overlap warning.

Acceptance:

- Core images appear as a depth track.
- Clicking opens full image.

### Demo Milestone D - Display Customization Refinement

Build:

- Resize widgets by dragging.
- Move widgets directly on grid.
- Compact widget collection icons.
- Track settings dialog.
- Curve settings dialog.
- Display clone/cancel/undo polish.

Acceptance:

- Demo user can customize a display without touching code.

### Demo Milestone E - Full Interval Editing

Build:

- Dynamic edit form from template.
- Edit RQD/recovery/seam/remarks/lithology.
- Audit save.
- Validation refresh.

Acceptance:

- Demo user can correct a staged issue and see validation/AI update.

### Demo Milestone F - AI/Rules Showcase

Build:

- Rule pack for scripted demo cases.
- Curve-derived coal candidate logic.
- Lithology/curve disagreement logic.
- AI summary prompt using evidence bundle.

Acceptance:

- Demo has 6-10 useful insights, not repeated generic cards.

### Demo Milestone G - Correlation Display

Build:

- Multi-borehole side-by-side view.
- Depth/RL alignment toggle.
- Seam/formation marker lines.
- Marker edit/save.
- Save correlation display.

Acceptance:

- User can select 5 boreholes and discuss seam continuity.

### Demo Milestone H - Import Merge And Export Settings

Build:

- Merge preview for synthetic sources.
- Correction stage selector.
- Export settings screen.
- Export selected fields/curves/stage.

Acceptance:

- User can demonstrate staged correction and configured export.

## Technical Approach

### Data Generation

Use Python for deterministic fixture generation:

- Easier Excel/LAS/image generation.
- Same language as backend.
- Can write directly to seed/import services.

Suggested modules:

- `scripts/demo_data/geology_model.py`
- `scripts/demo_data/generate_intervals.py`
- `scripts/demo_data/generate_curves.py`
- `scripts/demo_data/generate_core_images.py`
- `scripts/demo_data/export_excel.py`
- `scripts/demo_data/export_las.py`
- `scripts/demo_data/seed_demo_block.py`

### UI Scope

Keep the demo UI production-shaped but avoid overbuilding:

- Correlation display can be a dedicated route/workspace.
- Core image depth track should be functional but can use generated images.
- Import/merge can operate on known synthetic templates first.
- Export settings can support a few concrete options first.

### AI Scope

Use deterministic rules for the demo-critical insights. Add LLM only for:

- Summary.
- Explanation wording.
- Review checklist.
- Suggested next action.

This avoids unstable AI behavior during the demo while still showing AI-assisted workflow.

## Demo Readiness Checklist

- Fresh demo database can be regenerated.
- Landing page shows synthetic active boreholes.
- Mobile app can submit one synthetic interval and one image.
- Import page shows Excel/LAS/image sources.
- Merge preview has at least three meaningful conflicts.
- Workbench shows lithology patterns, curves, RQD/recovery/seams, core images, and AI markers.
- AI panel has useful non-duplicated insights.
- Full interval edit form works.
- Correlation display shows 5 boreholes and marker continuity.
- Export settings generate at least Excel and LAS.
- Demo script explains that data is synthetic and designed to exercise workflow.

## Recommended Immediate Next Steps

1. Build the synthetic data generator and seed 5 boreholes.
2. Implement LAS import from the shared LAS plus generated LAS.
3. Add core image depth track.
4. Add correlation display foundation.
5. Improve display customization interactions.
6. Add full interval edit template.
7. Add AI/rule scripted insight pack.
8. Add export settings screen.

## Current Demo Seed Command

The synthetic block can now be regenerated locally with:

```powershell
cd backend
.\.venv\Scripts\python.exe scripts\seed_synthetic_coal_block.py
```

This creates the `DEMO-COAL-BLOCK` project with five boreholes:

- `DMBH-01`: clean reference / central correction scenario.
- `DMBH-02`: mobile incremental capture scenario.
- `DMBH-03`: Excel/import conflict scenario.
- `DMBH-04`: curve coverage and lithology/curve review scenario.
- `DMBH-05`: fault-offset / correlation discussion scenario.

Generated files are written under:

```text
sample-data/demo-coal-block/boreholes/
MTSE-65(PBH 62)/demo-coal-block/
```

The web demo now includes:

- Synthetic boreholes on the landing page.
- Depth log with a core-image track.
- Corebox lane extraction preview: each full tray image is rendered as four cropped horizontal lanes stacked vertically in depth order, while preserving click-through to the original tray image.
- Generated LAS-style curves in the curve track.
- A first correlation display using the synthetic borehole set.
