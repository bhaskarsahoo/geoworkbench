# PBH-62 Data Mapping

## Source

The PBH-62 prototype dataset is extracted from:

- Workbook: `DOC-20260510-WA0000..xlsx`
- Sheet: `abcd`
- Core images: `MTSE-65(PBH 62)/*.jpg`

The workbook is a formatted coal borehole logging sheet. It is not a database export, so the importer preserves source row references for traceability.

## Borehole Metadata

| Field | Source | Notes |
|---|---|---|
| borehole id | inferred from image annotations/folder context | `PBH-62` |
| project code | inferred from folder context | `MTSE-65` |
| state | workbook header | Madhya Pradesh |
| total depth | closure note | 604.30 m |
| closure note | row 329 | borehole closure text |

## Workbook Column Mapping

| Workbook Area | Columns | GeoWorkbench Output |
|---|---|---|
| Run Depth | A-D | `runIntervals` |
| Lithology depth | E-G | lithology interval depth/recovery fields |
| Lithology | H | `lithologyCode`, normalized label/color |
| Color | I | `loggedColor` |
| Structural features/Others | J | `structuralFeatures`, also surfaced as remarks/events |
| Core Dip | K | `coreDip` |
| Seam Name | L | `seamIntervals` |
| RQD (%) | M | `rqd` |
| Remarks | N | `remark`, also surfaced as remarks/events |

## Normalized Dataset

Generated files:

- `sample-data/pbh-62-normalized.json`
- `sample-data/pbh-62-normalized.js`

The JavaScript file is used by the static HTML prototype so it can run directly in a browser without a server.

Current extracted summary:

| Dataset Item | Count |
|---|---:|
| run intervals | 209 |
| lithology intervals | 316 |
| seam intervals | 19 |
| remark/structure events | 180 |
| core images | 141 |

## Lithology Normalization

The workbook uses geology shorthand codes such as:

- `SSMTCG`
- `SSFTMG`
- `SSMG`
- `COAL`
- `SHCOAL`
- `CARBSHL`
- `DOLERITE`
- `SHALE`

The prototype maps these into display labels and colors. This mapping is intentionally conservative. A geologist should review the code dictionary before the production MVP.

## Core Image Linking

The prototype links intervals to core images approximately by distributing ordered box images across total borehole depth.

This is good enough for a stakeholder prototype, but production should store exact box metadata:

- box number
- from depth
- to depth
- image filename
- capture date/user
- notes/OCR confidence

Exact core image registration will make image review, reporting, and future image AI much more credible.

## Generated Curve Tracks

The current prototype includes synthetic gamma and density curves to demonstrate track behavior.

These are not real geophysical measurements. When LAS or geophysical log files are available, they should be imported as depth-indexed curve data.

## Traceability

Every extracted interval includes:

- source workbook row
- source workbook name
- source sheet name

This is important because geologists must be able to understand where a displayed interval or AI suggestion came from.
