# Technical Roadmap

See also:

- `docs/phase-1-borehole-correction-system-plan.md` for the executable Phase 1 plan.

## Stage 1 - Discovery And Validation

Objective:

Validate borehole correction workflows and define realistic MVP boundaries for a multi-site, multi-borehole system.

### Deliverables

- representative Excel/LAS/image/mobile input review
- borehole schema definition
- workflow mapping
- UX prototype
- architectural planning
- import/export mapping, including customer-specific Minex requirements
- display layout and widget configuration model

### Success Criteria

- geologists understand the product vision
- workflows feel realistic
- data structures are validated
- MVP scope is stable
- central geologist correction workflow is validated

---

## Stage 2 - Interactive Prototype

Objective:

Build a usable interactive prototype and convert it into the reference design for the production borehole correction workspace.

### Features

- borehole correction viewer
- lithology intervals
- seam highlighting
- project/site/borehole dashboard
- AI assistant panel
- import wizard
- report preview
- configurable track/widget layouts
- core image panel
- editable interval table concept

### Technology

- HTML/CSS/JavaScript initially
- migrate to React + TypeScript
- lightweight local storage for prototype settings

### Success Criteria

- usable by geologists
- workflow validation
- UI/UX feedback captured
- display configuration model validated

---

## Stage 3 - Core Platform MVP

Objective:

Build the first real deployable multi-site application for borehole log correction and approval.

### Backend

- FastAPI
- PostgreSQL + PostGIS
- authentication and roles
- import pipelines
- object storage for source files/images/exports
- Redis plus background workers for imports, AI jobs, and exports
- WebSockets or Server-Sent Events for import status and workspace refresh

### Frontend

- React
- TypeScript
- TanStack Query for server-state caching
- D3 scale utilities plus Canvas/SVG/HTML rendering for geological tracks
- AG Grid or TanStack Table for editable interval tables
- OpenSeadragon or tile-based image viewing for large core photos if needed

### AI

- rule-based validation first
- source-linked AI summaries
- AI suggestion queue with accept/reject/override
- geophysical log/lithology mismatch flags
- AI geological summaries
- RAG over logs, reports, remarks, and image metadata
- image OCR and retrieval before image interpretation

### Success Criteria

- real borehole data ingestion
- stable editing workflows
- usable export pipelines
- corrected borehole logs can be approved and exported
- AI suggestions are traceable and overrideable

---

## Stage 4 - AI Learning Layer

Objective:

Introduce correction-driven learning after enough reviewed customer data exists.

### Features

- confidence scoring
- feedback capture
- model retraining pipeline
- seam correlation learning
- project-specific adaptation
- curve-based lithology/seam suggestions
- image similarity search
- evaluated vision models for core image triage

---

## Stage 5 - Enterprise Geological Platform

Future possibilities:

- collaboration
- cloud sync
- enterprise permissions
- multi-project intelligence
- integration with mine planning tools
- geological knowledge search
- advanced ML models
- production reconciliation
- quality analytics
- 2D/3D GIS/model review where it complements existing mine planning software
