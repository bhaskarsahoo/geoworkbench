# PBH-62 Stakeholder Demo Walkthrough

## Demo Goal

Show that GeoWorkbench can turn a geologist-provided coal borehole workbook and core image folder into a useful review workspace.

The message is:

> GeoWorkbench helps geologists import, visualize, validate, review, annotate, and summarize borehole interpretations while keeping the geologist in control.

## Demo Screen

Open:

`prototype/pbh-62-log-widget.html`

## Walkthrough

### 1. Start With The Real Input

Explain that the source is not synthetic:

- Excel borehole log from a geologist
- 141 core box photographs
- PBH-62 / MTSE-65 context
- 604.30 m total depth

### 2. Show The Log Widget

Point out the track-based layout:

- Depth
- Lithology
- Seam
- Recovery
- RQD
- Gamma demo curve
- Density demo curve
- Remarks
- Core box references

Emphasize that each track shares the same depth axis but has its own display behavior.

### 3. Use Preset Ranges

Use the toolbar:

- Full Borehole
- Coal Seams
- Deep Section
- Zoom In
- Zoom Out

Explain historical review mode versus future runtime follow mode.

### 4. Select Intervals

Click lithology or seam intervals and show:

- depth interval
- lithology code
- normalized label
- seam label
- recovery/RQD
- structural features
- remarks
- source workbook row
- approximate core box image

This shows traceability from visualization back to the source.

### 5. Show Track Settings

Toggle tracks on/off and change widths.

Explain that production track settings will support:

- saved layouts
- curve min/max
- multiple curves per track
- lithology palettes
- correlation layouts
- wall display modes

### 6. Show Context Menus

Right-click a track or interval.

Explain future actions:

- inspect interval
- add remark
- mark reviewed
- show source row
- hide track
- edit/split/merge intervals

### 7. Show AI Workflow Tab

Explain AI as an assistant:

- summarize seam-bearing intervals
- flag validation issues
- suggest correlations
- draft report observations
- preserve geologist corrections

Avoid saying that AI replaces geological interpretation.

### 8. Show Architecture Tab

Walk through the planned system:

1. source adapters
2. transformation layer
3. PostgreSQL/Timescale-ready storage
4. Track API
5. visualization layer
6. AI-assisted workflows

Explain that Excel is only the first adapter. Later adapters can include CoalLog, AGS, LAS, image folders, and runtime feeds.

## Questions To Ask Geologists

- Does this track layout match how you review borehole logs?
- Which tracks should be visible by default?
- Which lithology colors/patterns would you expect?
- Which remarks should become visual symbols?
- Would linking core box images to intervals save review time?
- Which edits must be fastest?
- What validation warnings would you trust?
- What report output would save the most time?

## Current Prototype Limitations

- Core image linking is approximate.
- Gamma and density curves are synthetic demo curves.
- Interval editing is represented as interaction design, not persisted yet.
- Context menu actions are placeholders for workflow validation.
- No backend/database is connected yet.

## Strong Stakeholder Claim

The strongest claim to make now:

> We can turn existing coal borehole logs and core image folders into an interactive geological review workspace, then progressively add validation, reporting, correlation, and AI assistance.
