# Coal Mining AI Opportunity Discussion Guide

## Purpose

Use this guide to discuss how we can enter the coal mining sector with intelligent software systems.

The meeting should not be limited to the PBH-62 sample data or the current prototype. The prototype is only a conversation aid. The real objective is to understand the full coal mining lifecycle, the software and data systems they already use, and the areas where AI-assisted workflows, visualization, analytics, and data storage can improve productivity.

## Desired Outcome

By the end of the discussion, we should understand:

- Their full coal mining lifecycle from exploration to production, dispatch, monitoring, and closure.
- Which software, databases, spreadsheets, and manual workflows they use at each stage.
- Where data is generated, stored, cleaned, transferred, and lost.
- Which decisions require repeated expert judgment.
- Which workflows are slow, manual, inconsistent, or hard to audit.
- Where an intelligent workflow layer can complement existing mining software.
- Whether they need a data platform, analytics workspace, AI assistants, visualization tools, or integration layer.
- Which opportunity is strong enough for a pilot.

## Opening Positioning

Use this framing:

> We are exploring how intelligent software can support coal mining teams across geology, planning, operations, reporting, analytics, and knowledge management. We are not assuming that AI replaces domain experts or that we replace your existing mining software. We want to understand your current lifecycle and identify where AI-assisted workflows, visualization, data management, and analytics can improve productivity.

Avoid framing the meeting as:

- a demo of one borehole only
- a replacement pitch for Minex, MinePlan, Datamine, Vulcan, Surpac, GIS, ERP, or dispatch systems
- a claim that AI can automatically solve geological interpretation
- a narrow borehole logging product discussion

## Discussion Flow

Recommended agenda:

1. Understand their full coal mining lifecycle.
2. Map current software and data systems.
3. Identify productivity and decision bottlenecks.
4. Discuss intelligent workflow opportunities.
5. Discuss data/storage/integration requirements.
6. Show the prototype briefly as an example of one possible workflow.
7. Select 2-3 pilot opportunities.

## Part 1 - Full Coal Mining Lifecycle

Ask them to describe the lifecycle in their organization, not in textbook terms.

### Exploration And Resource Definition

- How do you plan exploration programs?
- What data do you use before drilling: maps, old reports, remote sensing, seismic, geophysics, nearby boreholes?
- How are boreholes planned, tracked, logged, and reviewed?
- How are core photos, lithology logs, geophysical logs, seam picks, and coal quality data connected?
- Who validates the geological data before modelling?

### Geological Modelling And Resource Estimation

- How do you correlate seams across boreholes?
- Which software do you use for geological modelling and resource estimation?
- How do you handle faults, intrusions, washouts, seam splits, seam merges, and missing seams?
- How much preparation happens before data enters the modelling software?
- How do you audit interpretation changes?

### Mine Planning

- Which teams consume the geological model?
- What data is passed to mine planners?
- Which tools are used for pit/underground design, scheduling, reserve estimation, and scenario planning?
- Where do geological uncertainty and data quality affect mine plans?
- How often does planning need updated geological information?

### Production And Operations

- What geological decisions happen during active mining?
- Do mine geologists compare actual production exposures with the model?
- Is there grade/quality control, face mapping, roof/floor monitoring, or strata control workflow?
- Are drill/blast, fleet, equipment, IoT, dispatch, and production systems connected to geology?
- What operational data would be useful if visualized with geological context?

### Coal Quality, Handling, And Dispatch

- How is coal quality sampled, tracked, predicted, and reconciled?
- Is quality linked back to seams, benches, blocks, stockpiles, and dispatch?
- What systems track stockyard, washery, rail/road dispatch, weighbridge, and customer quality?
- Where do quality mismatches or reconciliation problems occur?

### Safety, Environment, And Closure

- What geotechnical, hydrogeological, slope, subsidence, gas, fire, or strata risks are monitored?
- Do you use remote sensing, drones, LiDAR, satellite imagery, or environmental sensors?
- How are compliance reports prepared?
- What long-term monitoring data is difficult to organize or analyze?

## Part 2 - Current Software And Systems Map

The key question is:

> What do you use today, and where does the work still fall back to Excel, PDF, email, manual interpretation, or disconnected folders?

### Mining And Geology Software

Ask whether they use:

- GEOVIA Minex for coal and stratified deposits.
- Hexagon MinePlan / MineSight.
- Datamine Studio RM or related Datamine products.
- Maptek Vulcan.
- GEOVIA Surpac, Whittle, or other GEOVIA tools.
- Paradigm / Aspen SKUA-GOCAD or other subsurface modelling tools.
- Leapfrog, Micromine, Deswik, Carlson, AutoCAD, QGIS, ArcGIS.
- CoalLog, AGS, LAS tools, geophysical interpretation software.

### Enterprise And Operational Systems

Ask whether they use:

- ERP systems.
- Fleet management or dispatch systems.
- Drill and blast systems.
- Weighbridge and dispatch systems.
- Lab/coal quality systems.
- Document management systems.
- GIS portals.
- Environmental monitoring systems.
- Custom SQL databases, Access databases, SharePoint, network folders, or Excel repositories.

### Data Flow Questions

- What is the system of record for geological data?
- Is there a central database for boreholes, seams, quality, and models?
- Which systems integrate well?
- Which systems require manual import/export?
- What file formats are common: Excel, CSV, LAS, DXF, DWG, SHP, PDF, database dumps, proprietary mining formats?
- Where is version control weak?
- Where is source traceability weak?
- Where do people duplicate data?

## Part 3 - Productivity Pain Points

Ask them to rank pain by time, risk, and business impact.

### Common Pain Areas

- Data cleanup before modelling.
- Borehole log standardization.
- Core photo retrieval and depth matching.
- Lithology and seam naming consistency.
- LAS/geophysical log integration.
- Seam correlation preparation.
- Geological report drafting.
- Resource/reserve reporting support.
- Model update tracking.
- Coal quality reconciliation.
- Production versus model reconciliation.
- Compliance and environmental reporting.
- Searching historical reports and old project data.
- Preparing management dashboards.
- Manual transfer between geology, planning, operations, and dispatch.

### Decision Questions

- Which tasks consume the most geologist time but do not require deep interpretation?
- Which decisions depend on scattered data?
- Which recurring reports are painful?
- Which errors are expensive when found late?
- Which workflows would benefit from an assistant that gathers evidence, checks data, drafts outputs, and keeps audit trails?

## Part 4 - Intelligent Workflow Opportunities

Use these themes to explore product directions.

## 1. Geological Data Platform

Opportunity:

Build a central storage and workflow system for boreholes, lithology, seams, geophysical logs, core photos, coal quality, reports, and source lineage.

Capabilities:

- Project and borehole database.
- Import from Excel, CSV, LAS, image folders, GIS, and existing mining exports.
- Canonical coal geology schema.
- Versioning and audit history.
- Lithology/seam dictionary management.
- Source traceability from dashboard/report back to original file and row.
- Role-based review and approval.

When it matters:

- They do not have a reliable geological system of record.
- Data is spread across spreadsheets, PDFs, folders, and proprietary tools.
- They need clean data before using heavy modelling/planning software.

## 2. AI Geological Assistant

Opportunity:

Create an assistant that helps geologists search, summarize, validate, and prepare outputs from their geological data.

Capabilities:

- Ask questions across boreholes, reports, logs, and quality data.
- Summarize boreholes, seams, coal-bearing zones, and structural observations.
- Find remarks such as fractures, slickensides, intrusions, washouts, coal bands, clay bands.
- Draft source-linked geological notes and report sections.
- Explain validation issues in plain language.
- Maintain citations to interval, file, row, image, report, or model source.

Guardrail:

AI should assist review and evidence gathering. Final geological interpretation remains with geologists.

## 3. Intelligent Borehole And Core Review Workspace

Opportunity:

Provide a modern visualization workspace for depth-based review.

Capabilities:

- Track-based borehole viewer.
- Lithology, seam, recovery, RQD, geophysical curves, quality samples, remarks, and images.
- Core photo linking by depth.
- Depth-based filtering and search.
- Validation issue track.
- AI suggestion track with accept/reject/correct actions.
- Export-ready reviewed dataset.

Prototype link:

`http://127.0.0.1:8000/prototype/pbh-62-log-widget.html`

Use this only as a small example of a larger intelligent workflow direction.

## 4. Seam Correlation And Stratigraphic Review Assistant

Opportunity:

Help prepare and review seam continuity across boreholes before or around existing modelling software.

Capabilities:

- Multi-borehole correlation workspace.
- Seam top/bottom comparison.
- Thickness trend visualization.
- Missing/unnamed seam flagging.
- Candidate correlation suggestions.
- Confidence and uncertainty view.
- Export to modelling tools.

Good pilot if:

- They have multiple boreholes with seam picks.
- Seam naming consistency is a recurring issue.
- Current correlation preparation is manual.

## 5. Geophysical Log Analytics

Opportunity:

Integrate LAS/geophysical logs with lithology, seam, and quality data.

Capabilities:

- Gamma, density, resistivity, sonic, caliper tracks.
- Curve normalization and QA.
- Curve/lithology mismatch detection.
- Coal seam response analysis.
- Top/base suggestion support.
- Similar curve signature search.

Data needed:

- LAS files or depth-indexed curve exports.
- Geologist-approved seam/lithology labels for supervised prediction.

## 6. Coal Quality Analytics

Opportunity:

Connect coal quality data to seams, boreholes, blocks, stockpiles, and dispatch.

Capabilities:

- Ash, moisture, volatile matter, fixed carbon, sulfur, GCV dashboards.
- Quality trend by seam/block/depth/location.
- Outlier detection.
- Quality reconciliation across sample, model, production, stockpile, and dispatch.
- Blend planning decision support.
- Report-ready quality summaries.

Good pilot if:

- Quality data exists but is hard to link to geology and dispatch.
- Management wants analytics dashboards.

## 7. Production Reconciliation Workspace

Opportunity:

Compare planned geology and quality against actual production.

Capabilities:

- Model versus mined reconciliation.
- Seam exposure and production tracking.
- Coal/overburden variance dashboards.
- Quality variance from expected values.
- Production event timeline linked with geology.
- Learning loop back to geological model.

Good pilot if:

- They have operational production data and geological model outputs.
- There is business pressure around variance, quality, or planning accuracy.

## 8. Mine Planning Intelligence Layer

Opportunity:

Complement mine planning tools with AI-supported scenario explanation, data preparation, and decision dashboards.

Capabilities:

- Summarize plan assumptions.
- Compare scenarios.
- Surface geological risks affecting plans.
- Track model updates and plan impacts.
- Generate planning review packs.
- Connect geology, planning, production, and quality evidence.

Positioning:

Do not replace mine planning engines. Complement them with workflow, analytics, explanation, and integration.

## 9. Remote Sensing, Drone, And GIS Analytics

Opportunity:

Use spatial intelligence for monitoring, planning context, and compliance.

Capabilities:

- Satellite/drone change detection.
- Land disturbance and rehabilitation tracking.
- Stockpile volume estimation from drone/LiDAR.
- Slope, dump, subsidence, or water monitoring dashboards.
- GIS layer integration with mine boundaries, villages, forest, roads, leases, and infrastructure.

Good pilot if:

- They already collect drone/satellite/GIS data but analysis is fragmented.

## 10. Knowledge Management And Report Intelligence

Opportunity:

Create an institutional memory system across reports, boreholes, maps, models, meeting notes, and decisions.

Capabilities:

- Search historical geological reports.
- Extract facts, tables, assumptions, and conclusions.
- Compare old and new interpretations.
- Build project knowledge graph.
- Answer questions with citations.
- Draft management summaries and technical notes.

Good pilot if:

- Historical knowledge is locked in PDFs and people.
- New teams struggle to understand previous decisions.

## 11. Safety And Geotechnical Intelligence

Opportunity:

Support geotechnical review and risk visibility.

Capabilities:

- RQD/recovery/fracture dashboards.
- Roof/floor condition summaries.
- Structural feature search.
- Slope or strata monitoring data integration.
- Hazard observation reports.
- Early anomaly detection from sensor data if available.

Guardrail:

Safety-critical decisions require strict validation, expert review, and clear responsibility boundaries.

## 12. Executive And Operational Analytics Workspace

Opportunity:

Create dashboards that integrate geology, planning, production, quality, dispatch, and compliance.

Capabilities:

- Project status dashboards.
- Exploration progress.
- Borehole completion and data quality.
- Resource/reserve summary views.
- Production versus plan.
- Coal quality and dispatch quality.
- Environmental/compliance status.
- AI-generated weekly/monthly management briefs.

Good pilot if:

- Leadership lacks a single view across systems.
- Reports are manually compiled from many teams.

## Part 5 - Data And Storage Architecture Discussion

Ask whether they have a trusted data foundation. If not, storage may be a major opportunity.

### Questions

- Where is master data stored today?
- Who owns geological, quality, production, and planning data?
- Is there a central database or only files?
- Are source files preserved?
- Are edits audited?
- Can users see who changed an interpretation?
- Can outputs be reproduced later?
- Is data accessible through APIs?
- Are there restrictions around cloud, on-premises, or air-gapped deployments?

### Possible Architecture

- PostgreSQL/PostGIS for project, borehole, seam, quality, spatial, and workflow data.
- Object storage for core photos, LAS files, PDFs, reports, and model exports.
- TimescaleDB or similar time/depth-series storage for dense curves, sensors, and operational feeds.
- Search/vector index for reports, remarks, images, and knowledge assistant workflows.
- Integration adapters for mining software, GIS, ERP, dispatch, and file-based exchange.
- Audit layer for interpretation changes and AI suggestions.

## Part 6 - How We Complement Existing Software

Use this matrix during discussion.

| If they use... | We can complement with... |
|---|---|
| Minex / MinePlan / Datamine / Vulcan | Data preparation, validation, AI search, reports, integration dashboards, pre-modelling review, post-model analytics |
| GIS / AutoCAD | Spatial data organization, map-linked reports, remote sensing analytics, project dashboards |
| Excel-heavy workflows | Central database, import validation, standardized dictionaries, review workflows, automated reports |
| ERP / dispatch / fleet systems | Mining analytics layer, production-quality reconciliation, management dashboards |
| Document repositories | AI knowledge assistant, report extraction, searchable project memory |
| No strong system of record | Coal geology data platform and workflow workspace |

## Part 7 - Prototype Usage In The Meeting

Use the current prototype as proof that we understand depth-based geological workflows, not as the main topic.

Say:

> This is one small example of the kind of intelligent workspace we can build. The bigger question is which workflows across your lifecycle deserve this kind of visualization, data management, AI assistance, and analytics.

Show briefly:

- Track visualization.
- Interval selection and source traceability.
- Core photo linking.
- Track configuration.
- AI workflow tab.

Then ask:

- Where else in your lifecycle would this kind of workspace be useful?
- What should the next intelligent workspace be: correlation, quality analytics, production reconciliation, planning review, or knowledge search?

## Part 8 - Pilot Opportunity Shortlist

Use the discussion to select one practical pilot.

### Pilot A - Coal Geology Data Platform

Best when data is scattered.

Scope:

- Import multiple boreholes.
- Store lithology, seams, recovery, RQD, remarks, core images, LAS, quality.
- Add validation, source traceability, and review workflow.

### Pilot B - AI Geological Assistant

Best when reports and logs are hard to search.

Scope:

- Search logs, reports, remarks, seam data.
- Generate source-linked summaries.
- Draft report sections.
- Flag data issues.

### Pilot C - Seam Correlation Review Workspace

Best when multi-borehole seam review is painful.

Scope:

- Load 10-50 boreholes.
- Visualize seam packages.
- Flag inconsistencies.
- Prepare export tables.

### Pilot D - Coal Quality Analytics

Best when quality drives business decisions.

Scope:

- Link quality to boreholes/seams/blocks/dispatch.
- Build dashboards.
- Detect outliers and reconciliation issues.

### Pilot E - Production And Quality Reconciliation

Best when mine operations are active and variance matters.

Scope:

- Compare plan/model versus actual production.
- Track quality variance.
- Build management dashboards.

### Pilot F - Mining Knowledge Assistant

Best when historical reports and decisions are scattered.

Scope:

- Ingest approved reports and documents.
- Search with citations.
- Extract assumptions and decisions.
- Generate management briefs.

## Data To Request For Opportunity Assessment

Ask for approved/anonymized samples depending on the selected pilot.

- Current workflow diagrams or process descriptions.
- List of software used by role and lifecycle stage.
- Example input and output files.
- Borehole logs and collar data.
- LAS/geophysical logs.
- Core image folders and depth mappings.
- Seam correlation tables.
- Coal quality tables.
- Resource/model export examples.
- Mine planning outputs.
- Production and dispatch summaries.
- Existing report templates.
- Historical reports and PDFs.
- GIS layers.
- Dashboard/report examples leadership currently uses.

## Prioritization Questions

Use these to pick the right entry point.

- Which workflow, if improved, saves the most expert time?
- Which workflow, if improved, reduces the most business risk?
- Which data is available now?
- Which team is willing to pilot?
- Which result can be demonstrated in 4-8 weeks?
- Which output would management immediately understand?
- Which integration is essential and which can wait?

## Recommended Close

End with concrete next steps:

- Confirm lifecycle stages and current software map.
- Select top three opportunity areas.
- Choose one pilot candidate.
- Identify data required for the pilot.
- Identify geologist, planner, operations, and IT stakeholders.
- Agree success metrics: time saved, error reduction, faster reporting, better visibility, improved reconciliation, or better decision support.

## Vendor Landscape Notes

Use these as context, not as replacement targets.

- GEOVIA Minex is positioned for coal and stratified deposits: https://www.3ds.com/fileadmin/PRODUCTS-SERVICES/GEOVIA/PDF/New_Branding/3DS-GEOVIA-Minex_Brochure.pdf
- Hexagon MinePlan Resource Geo covers geology data management, QA/QC, modelling, block modelling, reserve estimation, and related workflows: https://hexagon.com/products/hxgn-mineplan-resource-geo
- Datamine Studio RM is positioned for geological modelling, geostatistics, resource estimation, and evaluation: https://docs.dataminesoftware.com/StudioRM/
- Maptek Vulcan covers 3D mine planning, geological modelling, mine design, and stratigraphic mine workflows: https://www.maptek.com/products/vulcan/
- Aspen SKUA is a broader subsurface geological modelling platform; clarify whether stakeholders mean this when they say Paradigm: https://www.aspentech.com/en/products/sse/aspen-skua
