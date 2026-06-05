# Coal Borehole Review Workspace Demo Script

Demo time: 28 May 2026, 11:00 AM

## Opening Position

Today we are showing a working system direction, not a final borehole interpretation. The data received so far is useful, but it is not fully aligned:

- One descriptive lithology Excel belongs to one borehole.
- Core box images are available as sample visual evidence, but not always mapped to the same borehole/depth.
- A geophysical log was received as a PDF export from another borehole, not as raw LAS/CSV curve data.

For the demo, we have intentionally brought these different inputs into one workspace to show the end-to-end capability: how the system can collect, store, visualize, validate, assist, edit, approve, and export borehole correction work once aligned site data is available.

## Demo Goal

The main message is:

This platform can become a central AI-assisted borehole correction workspace for coal geology teams. It can support field data capture, central review, geophysical correlation, rule validation, AI-generated observations, geologist override, approval, and export to downstream mining/geology software.

## Suggested Talk Track

### 1. Landing Page and Borehole Selection

Start on the landing page.

Say:

"We have separated the system into a borehole selection area and a central interpretation workspace. Today the landing page is simple, but this is where project defaults, unit settings, display preferences, active boreholes, historic boreholes, and user-specific saved displays can be managed."

Show:

- Active and historic borehole grouping.
- Default display versus saved/user display selection.
- Workflow diagram: site inputs, import templates, central display, AI review, geologist sign-off.

Key point:

"This is not only a visualization screen. The design is for a full workflow."

### 2. Central Visualization and Analytics Workspace

Open the main borehole display.

Say:

"The central geologist can view lithology, seams, RQD/recovery-style tracks, remarks, imported geophysical curves, core box preview, and AI workflow items in one depth-indexed display."

Show:

- Depth-indexed log widget.
- Lithology intervals.
- Seam markers.
- Curve track with multiple imported geophysical curves.
- Dynamic curve headers with curve names, colors, units, and normalization ranges.
- Remarks grouping to avoid overcrowding.
- Right-side interval panel.
- Core box preview and full image popup.

Key point:

"The display is built as configurable widgets and tracks. Later, every project or geologist can have different display layouts without changing the underlying data model."

### 3. Insight From Visualization

Say:

"The display helps the geologist quickly ask: where are coal intervals, where are seams, where are remarks clustered, where are geophysical curves missing or changing, and where should manual review happen?"

Show:

- Hover/click on curve track to see depth and curve values.
- Remarks grouped by depth.
- Interval panel metadata.
- AI track markers if visible.

Explain:

"Even before advanced AI, a structured depth display reduces the time spent moving between Excel, PDF, images, and separate geology tools."

### 4. Rule Validation and AI Analysis

Open the AI workflow panel.

Say:

"The first layer is deterministic rule validation. These are explainable checks such as missing seam information, suspicious interval structure, curve coverage gaps, and imported data warnings."

Then:

"The AI layer can summarize these findings, rank review areas, explain why a section needs attention, and later compare lithology against geophysical curves and core box image observations."

Show:

- AI suggestions list.
- Accept/reject behavior.
- Confidence/status.

Important positioning:

"For demo safety, most current suggestions are rule-driven and explainable. We are not asking the AI to replace the geologist. The system presents evidence and suggestions; the geologist decides."

Future AI examples to mention:

- Summarize all issues in a borehole.
- Highlight intervals where lithology and gamma/resistivity behavior disagree.
- Suggest likely correction candidates.
- Compare core box image observations with logged lithology.
- Generate shift handover notes or borehole review summaries.
- Search historical boreholes for similar patterns.

### 5. Editing and Geologist Override

Click an interval and show the edit panel.

Say:

"The central geologist can override selected interval attributes, add observations, and save the corrected interpretation. Every correction should later be audit-tracked with before/after values and reason."

Show now:

- Lithology code/label edit.
- Seam field.
- Remarks/observation save.

Explain later roadmap:

- Richer interval split/merge.
- Drag interval boundary editing.
- Curve-based pick editing.
- Core image depth mapping.
- Widget-level settings.
- Track and curve configuration.
- Display clone, undo, cancel, and user-saved display layouts.

Key point:

"The AI does not finalize the borehole. The geologist keeps authority and can accept, reject, or override."

### 6. Mobile Field Capture

Open the mobile app.

Say:

"The site geologist or logging team can create a borehole, enter structured interval data, and upload files from the field. This can be used for incremental sync or full upload depending on connectivity and site practice."

Show:

- Mobile login/demo access if needed.
- Create borehole or clone demo borehole.
- Structured field interval form.
- File upload section.

Explain:

"The backend treats mobile as a first-class input channel. Files and form submissions are linked to the borehole, so central users can review what arrived from site."

### 7. Import and Merge Workflow

Return to web workspace and open data arrival/import area.

Say:

"Uploaded Excel, LAS/curve files, geophysical PDFs, and core images are stored against the borehole. The next step is import profiling and merge. For known templates, the system can map and import automatically. For unknown templates, we will need an import-template mapping step."

Show:

- Source files associated with borehole.
- Process/merge action where available.

Clarify current demo:

"Because the files we received are from different boreholes, this demo combines them for capability demonstration. In the real implementation, borehole code, depth range, source template, and file metadata will control how data is merged."

### 8. Approval and Export

Show approval/export controls.

Say:

"Once the central geologist completes review, the borehole can move through approval and then export."

Show:

- Approval status if available.
- Excel/CSV/LAS export.

Say:

"The export layer is where we can support Minex-compatible formats, Excel/CSV, LAS, and other downstream formats depending on their current software stack."

## Questions to Ask the Geologists

- What is the current full lifecycle toolchain: field logging, Excel, Pinnacle, Minex, Paradigm, GIS, database, and reporting?
- What exact formats are available from site: Excel, CSV, LAS, DLIS, PDF exports, images, scanned reports?
- Is the geophysical log usually available as raw curve data or only as exported PDF?
- How are core box images named and depth-mapped today?
- Which fields are mandatory for a corrected borehole log?
- Which corrections are common: lithology name, depth boundary, seam pick, recovery/RQD, remarks, structural features?
- Which validations would save the most review time?
- What should require approval, and who approves?
- What export format is required for Minex or other downstream software?
- Do they need offline mobile capture at site?

## Strong Closing

"The prototype demonstrates the shape of a real production system: field capture, central storage, configurable displays, rule validation, AI-assisted insight, geologist-controlled correction, approval, and export. The next step is to receive aligned data for one complete borehole, confirm templates, and implement the first production-grade correction workflow around their real process."

