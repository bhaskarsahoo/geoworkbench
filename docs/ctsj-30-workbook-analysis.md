# CTSJ-30 Workbook Analysis

Source workbook:

- `DESCRIPTIVE LITHOLOGY CTSJ-30 (P-02) Running.xlsx`
- Main sheet: `Sheet1`
- Empty/unused sheet: `Sheet2`

This workbook is from the same broad descriptive lithology logging family as the PBH-62 workbook, but it is not the same template. The importer should therefore be profile-driven and should detect header rows/columns instead of assuming the PBH-62 `abcd` sheet layout.

## Borehole Metadata

Observed header values:

| Field | Cell/value |
| --- | --- |
| Borehole number | `B3 = CTSJ-30(P-02)` |
| Block | `B4 = SARADHAPUR-JALATAP` |
| Company/title | `A1 = M/S CENTURIAN EXPLORATION & MINING SERVICES` |
| Report title | `A2 = DESCRIPTIVE LOG` |
| Header depth text | `M5 = RUNNING AT 189.00Mm` |
| Water level | `L6 = WATER LEVEL : .` |
| Closure row | `A595 = BOERHOLE CLOSED AT THE DEPTH OF 525.00m` |

Important import note: the header says the borehole is running at 189m, but the tail row says it is closed at 525m. The importer should prefer the explicit closure/depth summary row when present, and should keep both source values in import diagnostics.

## Table Layout

CTSJ table starts at row 9. Header rows are rows 7 and 8.

| Canonical field | CTSJ column | PBH-62 equivalent |
| --- | --- | --- |
| drilling run from | A | A |
| drilling run to | B | B |
| drilling run length | C | C |
| drilling run recovery | D | D |
| drilling run recovery percent | E | not present |
| lithology from depth | F | E |
| lithology thickness | G | F |
| lithology recovery | H | G |
| lithology code/description | I | H |
| grain size | J | not present |
| colour | K | I |
| raw RQD piece lengths | L | not present |
| RQD percent | M | M, but PBH stores fractional values |
| structural/sedimentary features | N | J |
| core dip | O | K |
| seam | P | L |
| remarks | Q | N |

## Data Volume And Completeness

CTSJ has 585 valid lithology intervals from 0m to 525m. There were no simple gaps or overlaps when calculating `from + thickness` across the interval rows.

Observed field counts in rows 9-594:

| Field | Non-empty count |
| --- | ---: |
| drilling run rows | 177 |
| lithology intervals | 585 |
| lithology recovery | 585 |
| grain size | 136 |
| colour | 224 |
| raw RQD lengths | 218 |
| RQD percent | 77 |
| structural/sedimentary features | 164 |
| core dip | 8 |
| seam | 307 |
| remarks | 8 |

The workbook has many formula/blank future rows after the closure row. Parser logic should stop at the closure row or at the last meaningful lithology interval, not at the worksheet's physical `max_row`.

## Lithology Dictionary Differences

PBH-62 uses compact geology codes such as `SSMTCG`, `SSFTMG`, `CARBSHL`, `SHCOAL`, and `COAL`.

CTSJ uses more readable labels and mixed abbreviations such as:

- `COAL`
- `SANDSTONE`
- `SHALE`
- `CARB SHALE`
- `SH COAL`
- `SANDY SHALE`
- `SHALY SANDSTONE`
- `ISH>SST`
- `ISST>SH`

Importer implication: the lithology dictionary should support both exact codes and aliases. Unknown spelling variants should be preserved as source text and flagged for geologist review rather than silently converted. Examples observed in CTSJ include `INTERCLATION`, `CONGLOMERATIC CANDSTONE`, and `SANDY SAHLE`.

## RQD Difference

PBH-62 stores RQD as a fractional value in column M despite the header saying percent. Example values are around `0.72`.

CTSJ stores:

- raw RQD piece-length entries in column L, for example `15,17,17,15`
- RQD percent in column M, for example `54`

Importer implication: canonical data should separate `rqd_piece_lengths` from `rqd_percent`, and normalize display values to percent. The source unit/format should be stored in source metadata.

## Similarity To PBH-62

Both workbooks contain the same core operational concepts:

- borehole identity and block/project header
- drilling run intervals
- lithology intervals using depth and thickness
- recovery
- lithology description/code
- colour
- structural features
- seam markers
- RQD
- remarks
- closure/depth summary text

This confirms that the current canonical model is in the right direction.

## Differences That Matter For The Importer

1. Sheet naming differs: PBH uses `abcd`; CTSJ uses `Sheet1`.
2. Header row differs: PBH data starts at row 12; CTSJ data starts at row 9.
3. Lithology columns shift: PBH lithology starts at E/H; CTSJ starts at F/I.
4. CTSJ has extra columns for drilling recovery percent, grain size, raw RQD lengths, and explicit RQD percent.
5. CTSJ seam values are much more frequent and can repeat over many rows.
6. CTSJ remarks are sparse; many operational observations are in structural/sedimentary features.
7. CTSJ has a stale/running header and a later closure row, so metadata needs conflict detection.
8. CTSJ has formula-filled blank rows after the real data area, so import termination must be content-aware.

## Recommended Parser Refinement

For Milestone 2 refinement or early Milestone 3, add an Excel import profiling step:

1. Detect likely lithology sheets by searching for header text such as `DESCRIPTIVE LOG`, `DRILLING RUN`, `LITHOLOGY`, and `DESCRIPTION AS PER CORE RECOVERY`.
2. Detect the header row pair and map columns by header labels rather than fixed letters.
3. Extract borehole metadata from header cells, but also scan all text cells for closure/depth statements.
4. Stop table parsing at the closure row or after repeated formula-only/zero rows.
5. Preserve source row, source sheet, source cell mapping, and formula/value diagnostics.
6. Normalize lithology and RQD through dictionaries with an "unknown/review needed" state.

This keeps the system realistic for multiple site templates while still allowing customer-specific import profiles when they standardize their Excel sheets.

## Implementation Note

The backend now has a shared profiler/import path in `backend/app/services/excel_import.py`.

Supported initial templates:

- `pbh_descriptive_v1`
- `ctsj_descriptive_v1`

The profiler is exposed through source-file processing for `.xlsx`/`.xlsm` files and through the local script:

```powershell
python backend\scripts\profile_and_import_excel_workbooks.py
```

The script imports PBH as `PBH-62-XLSX` to avoid colliding with the original seeded `PBH-62`, and imports CTSJ as `CTSJ-30-P-02`.
