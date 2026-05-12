# AI-Assisted Coal Geology Use Cases

## Purpose

This note gives a practical view of how AI assistance can help coal geologists without replacing geological judgment.

GeoWorkbench should position AI as:

> A review, search, validation, summarization, and suggestion layer around geological work.

The geologist remains responsible for interpretation, approval, and final reporting.

## Coal Geology Context

Coal geology workflows often involve:

- drilling boreholes
- photographing and logging recovered core
- recording lithology intervals
- identifying coal and carbonaceous intervals
- naming and correlating seams between boreholes
- recording recovery, RQD, structures, remarks, and quality samples
- using geophysical logs where available
- preparing summaries, reports, and section/correlation datasets

CoalLog is a useful reference point because it standardizes coal borehole logging data, dictionaries, plotting patterns, lithology, geotechnical, drilling, and quality fields. Geophysical logs are also widely used in coal exploration and mine geology to support coal bed thickness, depth, correlation, geotechnical characterization, and sometimes coal quality estimation.

## Use Case 1 - Borehole Log Summarization

### Problem

Geologists spend time reading long logs and preparing repetitive summaries.

### AI Assistance

The assistant can summarize a borehole:

- total depth
- major lithology zones
- coal-bearing intervals
- named seams
- notable structural remarks
- low recovery or low RQD zones
- intervals requiring review

### Prototype Example

For PBH-62:

- summarize named seams
- list coal/carbonaceous intervals
- identify intervals with remarks such as fractured, slickenside, coal band, calcite, mica lamination

### Value

Faster first-pass understanding and easier stakeholder communication.

## Use Case 2 - Geological Search Over Logs

### Problem

Important observations are buried in Excel sheets, scanned logs, and remarks.

### AI Assistance

Natural-language search:

- "Show all coal intervals."
- "Where are slickensides recorded?"
- "Find intervals with coal band remarks."
- "Which seams occur below 500 m?"
- "Show intervals with low RQD."
- "Find carbonaceous shale near named seams."

### Value

Turns geological logs into searchable operational knowledge.

## Use Case 3 - Data Validation and QA Assistant

### Problem

Borehole logs can contain gaps, overlaps, inconsistent lithology codes, missing recovery, invalid depth ranges, or inconsistent seam naming.

### AI Assistance

The system can flag:

- interval overlaps
- missing depth coverage
- recovery greater than drilled interval
- unknown lithology codes
- missing seam names on coal-bearing intervals
- suspicious thin or duplicate seam labels
- inconsistent remarks or code usage

The AI assistant can explain the issue in plain language and suggest what the geologist should inspect.

### Value

Improves consistency before reports, exports, and correlation work.

## Use Case 4 - Lithology Code Normalization

### Problem

Coal logs often contain shorthand codes and local naming practices.

### AI Assistance

The system can help map codes to standard labels:

- `COAL` -> Coal
- `SHCOAL` -> Shaly Coal
- `CARBSHL` -> Carbonaceous Shale
- `SSMTCG` -> Sandstone category, pending geologist-approved dictionary

AI can suggest mappings, but the project geologist should approve the dictionary.

### Value

Cleaner data, better visualization, easier cross-project comparison.

## Use Case 5 - Seam Review Assistant

### Problem

Coal seam identification and naming can be repetitive and sensitive. Thin coal/carbonaceous zones may need careful review.

### AI Assistance

The assistant can:

- list all named seams
- group seam-bearing intervals
- highlight unnamed coal/carbonaceous intervals
- compare seam depth and thickness between boreholes later
- flag possible seam split, merge, or discontinuity candidates

### Value

Helps geologists focus review effort on seam decisions.

## Use Case 6 - Core Image Review Support

### Problem

Core photos are useful evidence, but they are often stored separately from the log.

### AI Assistance

Near-term:

- link intervals to core box images
- show photo evidence beside the logged interval
- let geologists add depth-tied notes

Future:

- OCR box/depth labels
- detect coal-looking dark intervals
- detect broken core/fracture zones
- compare visual core appearance with logged lithology

### Value

Reduces switching between files and makes review more evidence-driven.

## Use Case 7 - Remarks and Structural Event Assistant

### Problem

Remarks such as mica lamination, fractures, slickensides, calcite, coal bands, and clay patches are important but hard to scan across hundreds of rows.

### AI Assistance

The assistant can:

- classify remarks into event types
- group crowded remarks by depth
- summarize structural features by depth zone
- flag geotechnically relevant terms
- generate a report-ready observation list

### Value

Makes unstructured geology notes useful for review and reporting.

## Use Case 8 - Geophysical Log Interpretation Support

### Problem

When LAS/geophysical logs are available, geologists must compare curves with lithology and seams.

### AI Assistance

The assistant can:

- align curves with lithology intervals
- help identify coal seam tops and bases
- flag curve anomalies
- compare density/gamma/resistivity behavior near seams
- suggest intervals where logged lithology and curve response disagree

### Value

Better integrated geological and geophysical review.

## Use Case 8a - Predictive Lithology and Seam Classification

### Problem

Manual lithology logging and seam picking are interpretation-heavy and can vary between geologists, projects, and local conventions.

### Predictive AI Assistance

When enough labelled data is available, machine learning models can suggest:

- likely lithology class at a depth interval
- likely coal or carbonaceous interval
- possible seam top and bottom
- probability that a coal interval belongs to a known seam
- confidence score for each suggestion

Possible model inputs:

- gamma ray
- density
- resistivity
- sonic
- caliper
- depth
- neighboring lithology intervals
- previous and next interval labels
- seam thickness
- local stratigraphic position
- nearby borehole patterns

Useful model types:

- gradient boosting models such as XGBoost, LightGBM, CatBoost
- Random Forest for early baselines
- sequence models later if large depth-indexed datasets are available

### Value

This moves beyond RAG. The model is not just searching logs; it is learning patterns between depth-indexed measurements and geologist-approved interpretations.

### Important Guardrail

The output should be displayed as a suggestion track, not as final geology:

- predicted label
- confidence
- source curves/features
- explanation
- accept/reject/correct action

## Use Case 8b - Core Image Pattern Recognition

### Problem

Core photos contain visual information that is not always easy to search or compare at scale.

### Computer Vision Assistance

With enough labelled core images, computer vision can help detect or classify:

- coal/dark carbonaceous zones
- sandstone/shale/claystone visual texture classes
- broken core zones
- fractured intervals
- possible slickenside surfaces
- visible coal bands or streaks
- poor recovery or missing core sections
- box labels and depth markings through OCR

Possible model approaches:

- OCR for handwritten/printed depth labels
- image segmentation for core vs tray/background
- classification of cropped core intervals
- object detection for fractures, broken zones, labels, markers
- image embedding search for visually similar intervals

### Value

This can help geologists review core photos faster and compare image evidence against logged lithology.

### Data Needed

For real predictive image AI, we need more than photos:

- exact depth range per core box
- core row/slot geometry
- labelled examples from geologists
- mapping between image regions and logged intervals
- enough examples across lithologies and lighting conditions

For the current PBH-62 prototype, image AI should be presented as a future capability, not as something already solved.

## Use Case 8c - Anomaly Detection

An anomaly is not automatically an error. In geology it often means:

> Something differs from the expected pattern and deserves geologist attention.

### Data Quality Anomalies

These can be detected immediately from structured logs:

- interval gaps
- overlapping intervals
- negative or zero thickness
- recovery greater than drilled thickness
- missing lithology code
- unknown lithology code
- missing seam name on coal-bearing interval
- duplicate or inconsistent seam label
- RQD missing where expected

These are rule-based anomalies and do not require ML.

### Geological Pattern Anomalies

These become useful once multiple boreholes or historical project data are available:

- unexpected coal interval where neighboring boreholes do not show coal
- seam thickness much higher or lower than nearby boreholes
- sudden seam depth shift compared with local trend
- missing expected seam
- repeated thin coal/carbonaceous bands outside expected zone
- unusual lithology sequence compared with local stratigraphy
- dolerite/intrusive interval disrupting expected coal sequence

These can start as statistical rules and later become ML-based pattern detection.

### Geophysical Log Anomalies

When curve data is available:

- gamma/density response does not match logged lithology
- density suggests coal but lithology is not logged as coal
- gamma spike or drop outside expected range
- curve washout/caliper issue affecting interpretation
- abrupt curve change without corresponding lithology boundary
- duplicate or flatlined sensor values

These can be detected by thresholds, curve-shape rules, and later supervised/unsupervised ML.

### Image Anomalies

When core images are registered to depth:

- photo appears to show dark coal-like material but log does not mark coal
- broken/fractured core not reflected in remarks/RQD
- missing core or disturbed core not reflected in recovery notes
- depth label/box sequence mismatch
- image color/texture differs sharply from logged lithology

These require computer vision plus good image-depth mapping.

### Operational Runtime Anomalies

If live drilling or sensor feeds are later available:

- sudden change in rate of penetration
- unusual torque or vibration
- depth/time mismatch
- sensor dropout
- drilling response inconsistent with expected lithology
- live curve behavior suggesting an unexpected boundary

These are future runtime use cases and should not be part of the first MVP promise.

## Use Case 8d - Similarity and Pattern Matching

### Problem

Geologists often reason by comparing patterns:

- "This sequence looks like the interval above Seam II."
- "This borehole resembles the western boreholes."
- "This core photo looks similar to a fractured zone we saw earlier."

### AI Assistance

Pattern matching can help find:

- similar lithology sequences
- similar seam packages
- similar curve signatures
- similar core image textures
- boreholes with comparable coal-bearing intervals

Techniques:

- sequence similarity over lithology intervals
- dynamic time warping or depth-window similarity for curves
- embeddings for remarks/report text
- image embeddings for visually similar core crops
- clustering of borehole intervals

### Value

This is an advanced and valuable AI layer because it helps geologists find analogues, not just search exact keywords.

## Use Case 9 - Report Drafting

### Problem

Reporting is repetitive and often involves copying interval observations into narrative form.

### AI Assistance

The assistant can draft:

- borehole summary
- seam summary
- geological observations
- data quality notes
- review checklist
- export notes

The output must remain editable and source-linked.

### Value

Saves reporting time while preserving geologist control.

## Use Case 10 - Correlation Preparation

### Problem

Seam correlation between boreholes requires clean intervals, consistent seam names, and comparable displays.

### AI Assistance

The assistant can:

- prepare clean seam tables
- identify candidate seam matches
- flag inconsistent seam labels
- summarize depth/thickness trends
- create a review list for multi-borehole correlation

### Value

Prepares the path from single-borehole review to correlation workspace.

## Use Case 11 - Knowledge Assistant Across Projects

### Problem

Historical geological knowledge is scattered across logs, reports, spreadsheets, and people.

### AI Assistance

The assistant can answer:

- "Have we seen this lithology sequence before?"
- "Which previous boreholes had similar coal bands?"
- "Where were slickensides reported?"
- "What did the last report say about Seam II?"

### Value

Creates a geological memory layer over time.

## Use Case 12 - Future Operational Runtime Assistant

### Problem

If runtime drilling or sensor feeds become available, teams may need live monitoring and later historical review.

### AI Assistance

Future workflows:

- follow current depth/time
- flag live anomalies
- compare current drilling behavior with expected lithology
- support historical playback
- backplot parameters such as ROP versus depth or curve versus curve

### Value

Keeps GeoWorkbench open to operational use cases without making realtime a first MVP dependency.

## Suggested Stakeholder Pitch

Use this language:

> We are not trying to automate geology. We are building a geological workbench that organizes borehole data, links evidence, validates intervals, visualizes logs, and gives the geologist an assistant for search, review, summarization, reporting, and future correlation.

## What To Demonstrate First

For the PBH-62 prototype, the best first AI-assisted story is:

1. Import the real workbook.
2. Show lithology, seams, recovery, RQD, remarks, and core photos.
3. Ask the assistant to summarize the borehole.
4. Ask it to list coal-bearing intervals.
5. Ask it to find structural remarks.
6. Ask it to draft a short geological observation.
7. Show that every statement links back to intervals/source rows.

## Guardrails

AI suggestions should always show:

- source interval
- source row/file
- confidence or uncertainty where relevant
- whether it is imported, inferred, or geologist-approved
- accept/reject/correct action

Never hide the distinction between real data and AI-generated interpretation.

## References

- CoalLog standard includes data entry sheets, dictionaries, transfer formats, lithology/geotechnical/quality data, and standard plotting patterns for coal borehole data: https://www.ausimm.com/insights-and-resources/resources/codes-and-standards/coallog/
- USGS notes that coal exploration programs rely on coal-oriented geophysical logs for coal bed thickness, depth, and correlation, supplementing core holes and drilling logs: https://pubs.usgs.gov/circ/c891/geophysical.htm
- CSIRO mining geoscience describes borehole logging data analysis for geotechnical characterization in open cut and longwall coal mining, and coal seam top prediction through imaging-while-drilling: https://research.csiro.au/msci/our-research/geophysics/
- A review of geophysical logs in coal mining describes use cases including seam identification/correlation, geotechnical rock mass characterization, automated log interpretation, rock strength estimation, and coal quality estimation: https://www.mdpi.com/2079-9276/9/2/11/htm
