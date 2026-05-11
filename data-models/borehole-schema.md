# Borehole Data Schema

## Purpose

This document defines the initial normalized schema for borehole and geological interval data inside GeoWorkbench.

The schema should support:

- exploration workflows
- lithology interpretation
- seam correlation
- geophysical logs
- coal quality analytics
- AI-assisted interpretation

## Borehole Collar Table

| Field | Type | Description |
|---|---|---|
| borehole_id | string | Unique borehole identifier |
| project_name | string | Project or block name |
| latitude | float | Latitude |
| longitude | float | Longitude |
| elevation_rl | float | Reduced level/elevation |
| total_depth | float | Final borehole depth |
| drilling_date | datetime | Drilling completion date |
| drilling_type | string | Core/RC/etc |

## Lithology Interval Table

| Field | Type | Description |
|---|---|---|
| interval_id | string | Unique interval ID |
| borehole_id | string | Parent borehole |
| from_depth | float | Start depth |
| to_depth | float | End depth |
| lithology | string | Standardized lithology |
| remarks | text | Geological notes |
| interpreted_by | string | Geologist name |
| confidence_score | float | AI confidence if predicted |

## Seam Table

| Field | Type | Description |
|---|---|---|
| seam_id | string | Seam identifier |
| borehole_id | string | Parent borehole |
| seam_name | string | Coal seam name |
| from_depth | float | Seam start |
| to_depth | float | Seam end |
| seam_thickness | float | Thickness |
| ash | float | Ash percentage |
| moisture | float | Moisture percentage |
| gcv | float | Gross calorific value |

## Geophysical Log Table

| Field | Type | Description |
|---|---|---|
| log_id | string | Unique log ID |
| borehole_id | string | Parent borehole |
| depth | float | Measurement depth |
| gamma_ray | float | Gamma ray value |
| density | float | Density value |
| resistivity | float | Resistivity value |
| sonic | float | Sonic log value |

## AI Interpretation Table

| Field | Type | Description |
|---|---|---|
| prediction_id | string | Prediction identifier |
| borehole_id | string | Borehole |
| model_name | string | ML model used |
| predicted_lithology | string | Predicted label |
| confidence | float | Confidence score |
| geologist_override | string | Human correction |
| feedback_timestamp | datetime | Correction time |

## Design Principles

- Human corrections must always be preserved
- Raw source data should remain immutable
- Geological naming normalization should happen in derived layers
- AI predictions must remain explainable and reviewable
- All schemas should support future enterprise scaling
