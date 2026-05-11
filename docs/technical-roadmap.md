# Technical Roadmap

## Stage 1 — Discovery and Validation

Objective:

Validate geological workflows and define realistic MVP boundaries.

### Deliverables

- sample geological dataset review
- borehole schema definition
- workflow mapping
- UX prototype
- architectural planning
- synthetic sample datasets

### Success Criteria

- geologists understand the product vision
- workflows feel realistic
- data structures are validated
- MVP scope is stable

---

# Stage 2 — Interactive Prototype

Objective:

Build a usable interactive prototype before full production engineering.

### Features

- borehole viewer
- lithology intervals
- seam highlighting
- project dashboard
- AI assistant panel
- import wizard
- report preview

### Technology

- HTML/CSS/JavaScript initially
- migrate to React + TypeScript
- lightweight local storage

### Success Criteria

- usable by geologists
- workflow validation
- UI/UX feedback captured

---

# Stage 3 — Core Platform MVP

Objective:

Build the first real deployable application.

### Backend

- FastAPI
- PostgreSQL + PostGIS
- authentication
- import pipelines

### Frontend

- React
- Tauri desktop packaging
- Plotly-based geological visualization

### AI

- basic lithology prediction
- anomaly detection
- AI geological summaries

### Success Criteria

- real borehole data ingestion
- stable editing workflows
- usable export pipelines

---

# Stage 4 — AI Learning Layer

Objective:

Introduce correction-driven learning.

### Features

- confidence scoring
- feedback capture
- model retraining pipeline
- seam correlation learning
- project-specific adaptation

---

# Stage 5 — Enterprise Geological Platform

Future possibilities:

- collaboration
- cloud sync
- enterprise permissions
- multi-project intelligence
- integration with mine planning tools
- geological knowledge search
- advanced ML models
