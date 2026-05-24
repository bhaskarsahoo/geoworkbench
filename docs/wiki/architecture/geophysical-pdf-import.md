# Geophysical PDF Import

This note covers the current Pinnacle composite PDF pathway used for `SPNG-05-Composite.pdf`.

## What The PDF Contains

The SPNG-05 file is a plotted composite log export, not raw LAS data. It still contains useful machine-readable content:

- header text for well, field, location, date, depth range, and logging services
- depth labels embedded every 2 m
- vector curve paths drawn by color and track position
- scale anchors for the plotted curves

The current parser profiles the file and digitizes the plotted vectors into depth-indexed curve samples.

## Imported Curves

| Curve | Source In PDF | Unit | Confidence |
| --- | --- | --- | --- |
| Natural Gamma | NGAM | API-GR | Medium |
| Spontaneous Potential | SP | mV | Medium |
| Density | DENS | g/cc | Medium |
| Resistivity | RES | ohm | Medium |
| Single Point Resistance | SPR | ohm | Medium |
| Caliper / Inclination Composite | CALP / INCL | mixed | Low |

Caliper and inclination are currently imported as one composite evidence curve because this export draws them with the same visible color/style. Raw LAS/CSV should split them cleanly.

## Production Guidance

For production, request raw geophysical data whenever possible:

- LAS for depth-indexed wireline curves
- CSV when the contractor exports tabular curves
- DLIS/LIS if the logging vendor provides native logging files
- PDF only as a fallback or demo/evidence import

PDF digitization is useful for discussion and assistive interpretation, but it should be QA-reviewed before final correction/export.

## Correction Workflow

```text
Excel lithology/core log
  + corebox photos
  + geophysical curves from LAS/CSV/PDF
  -> validation and curve/lithology rules
  -> AI-assisted explanation and evidence summary
  -> geologist accepts, edits, or rejects
  -> corrected borehole log export
```

Example assistive checks:

- Low gamma and low density can support likely coal intervals.
- Sharp gamma/density/resistivity changes can suggest interval boundary review.
- Caliper washout can warn that density/resistivity evidence may be less reliable.
- Corebox image evidence can be shown beside the same depth interval for human review.

The system should present these as suggestions with evidence, not automatic corrections.

## Current Demo Command

Run this from the backend folder so `backend/.env` is loaded:

```powershell
cd backend
python scripts\import_spng_pdf_geophysical_log.py
```

The command creates or updates borehole `SPNG-05`, stores digitized curves in PostgreSQL, records a `geophysical_pdf` source import, and writes QA artifacts under:

```text
runtime-data/geophysical-pdf/SPNG-05/
```
