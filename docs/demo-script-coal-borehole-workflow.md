# Coal Borehole Workflow Demo Script

## Demo Positioning

We should open with a clear separation:

> We have separated two things in this demo. First, we show the received stakeholder data as-is: Excel, corebox images, and geophysical PDF/LAS-style curves. Second, because the received files are not all aligned to one same borehole group, we created a controlled synthetic coal block to demonstrate the requested correlation workflow.

This keeps the demo honest while still showing the target product capability.

## 1. Dashboard And Borehole Selection

Show the landing page.

Value to explain:

- Central place to manage active and historic boreholes.
- Can later hold project defaults, unit settings, timezone, and user preferences.
- Supports different displays for different workflows.

Mention:

- Real received boreholes are available separately.
- Synthetic coal block is only for demonstrating correlation.

## 2. Received Data Workbench

Open a received borehole such as `PBH-62`.

Show:

- Lithology track
- Remarks
- RQD/recovery
- Curves
- Core image preview and full image click
- Interval details/edit panel
- AI track and AI workflow panel

Value to explain:

- The central geologist can review one borehole in a single workspace.
- Site data, Excel intervals, curve data, images, remarks, and metadata are brought together.
- AI/rules can flag issues, but the geologist remains in control.
- Geologist can edit or override interval interpretation and save corrections.

## 3. Import Center

Open `Import Center`.

Show:

- Upload/register source file
- Template registry
- Source queue
- Parsed imports
- Mobile submissions

Value to explain:

- Import is not just file upload; it is a controlled data arrival pipeline.
- Supports Excel, LAS, PDF/geophysical exports, corebox images, and mobile forms.
- Template-based import allows different Excel shapes and field forms.
- Merge step prevents blind overwrite.
- Source files remain stored for provenance.

Suggested explanation:

> For production, import templates will be refined against your actual Excel/mobile form formats. If the site sends partial interval data, Excel corrections, LAS logs, and corebox images separately, the backend stores them as source arrivals and merges them into the borehole under review.

## 4. Corebox Image Handling

Show the current core image preview/full image behavior.

Then explain:

> What you shared are tray/box images where core pieces lie in multiple lanes. To create a true depth-stacked core track, we need a processing step.

Processing options:

- Best input: image per box/tray with box number, from-depth, to-depth, lane order, and scale.
- Better capture protocol: mobile/site upload includes box number, depth range, lane order, and scale.
- Processing required:
  - detect tray/lane boundaries
  - crop each lane
  - order lanes by depth
  - stitch into vertical depth strip
  - store both original image and processed strip
  - allow geologist to confirm/adjust mapping

Value to explain:

- Original images remain stored and auditable.
- Processed depth-strip becomes useful in the log widget.
- AI/vision can assist segmentation, but geologist confirmation is important.
- We should not claim automatic core interpretation until we get more corebox datasets.

Suggested explanation:

> We can support storage and viewing immediately. The depth-stacked core track needs either a capture protocol or an AI/computer-vision processing workflow so tray lanes can be converted into depth order reliably.

## 5. AI, Rules, And Insights

Show AI workflow and AI track.

Value to explain:

- Rules provide deterministic validation.
- AI can generate summaries and explain issues.
- AI suggestions are review items, not automatic changes.
- Geologist can accept, reject, or override suggestions.

Practical examples:

- Missing seam labels
- Curve coverage gaps
- Lithology/curve mismatch
- Depth interval issues
- Missing metadata
- Future: curve-based boundary suggestions, corebox image observations, correlation insights

## 6. Correlation Display

Open `Correlation` from the menu.

First show `Received Data Comparison`.

Suggested explanation:

> This uses the real received boreholes, but since the files are not necessarily from the same correlated block, this is a data availability comparison, not geological correlation.

Value:

- Shows what each borehole has or misses.
- Helps discuss required inputs for real correlation.

Then switch to `Synthetic Coal Block`.

Show:

- Multi-borehole side-by-side view
- Depth vs RL toggle
- Gamma curve
- Seam markers
- AI insights popup
- Seam continuity table
- Draft note / mark reviewed

Value:

- Geologist can compare seam continuity across boreholes.
- RL view uses collar elevation minus depth, not relative depth.
- AI/rules can highlight missing markers, thickness variation, and curve evidence gaps.
- Geologist can record interpretation notes.

Suggested explanation:

> To run this on your real block, we need boreholes from the same area with collar coordinates, collar RL, seam naming/marker convention, and preferably consistent curves.

## 7. Export Center

Open `Export Center`.

Show:

- Format selection
- Depth range
- Include/exclude sections
- Readiness checks
- Approval
- Export history/download

Value to explain:

- Corrected log can be exported in a controlled format.
- Can support Excel/CSV/LAS today and Minex-compatible templates as a next refinement.
- Export is governed by readiness checks and approval.
- Users can decide what sections go out: lithology, seams, curves, remarks, audit, and AI review.

## 8. Display Management

Briefly show `Manage Display`.

Value to explain:

- Workspaces are configurable.
- Widgets/tracks can be changed.
- Future product should support a display library:
  - received data review
  - correction workspace
  - correlation workspace
  - export review
  - user-specific saved layouts

Keep this short unless stakeholders ask for details.

## 9. Mobile App Preview

End by saying mobile is the next focus.

Value message:

> Mobile will be the site data capture layer. It should support borehole creation, interval forms, corebox photos via camera, file uploads, offline/online sync, and backend merge into central review.

Planned mobile flow:

- Login with username/OTP
- Select/create borehole
- Capture interval data
- Add corebox photo
- Attach Excel/LAS/PDF if available
- Sync to backend
- Central geologist sees it in Import Center
- Merge into workbench
- Review/edit/export

## Key Stakeholder Questions

Ask:

- What exact Excel templates will site and central teams use?
- Will mobile replace Excel entry or supplement it?
- Can they provide same-borehole Excel + LAS + corebox images?
- Can they provide collar coordinates and RL for boreholes?
- Do they have deviation surveys?
- What software export format is most important first: Minex, LAS, CSV, or Excel?
- How do they name seams/markers today?
- Should corrections be multi-step: site draft, central review, senior approval?
- For corebox images, can capture include box number, depth range, lane order, and scale?

## Closing Message

> We are not just building a visualization screen. The value is an end-to-end borehole correction workflow: collect data from site, import with templates, store source evidence, review in a central workspace, use AI/rules for attention and insights, allow geologist override, approve, and export to downstream mining software.
