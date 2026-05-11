# ML Architecture

## Philosophy

The ML system should support:

- explainable predictions
- human corrections
- local adaptation
- gradual learning
- modular experimentation

The initial platform should avoid overengineering.

---

# Initial ML Strategy

## Structured Geological Data First

Initial focus should be tabular geological data:

- lithology intervals
- geophysical logs
- seam thickness
- coal quality
- depth relationships

Recommended initial models:

- XGBoost
- LightGBM
- CatBoost
- Random Forest

These models work extremely well for structured geological datasets.

---

# Initial Prediction Tasks

## 1. Lithology Classification

Input:

- gamma ray
- density
- resistivity
- sonic
- depth windows

Output:

- sandstone
- shale
- coal
- clay
- carbonaceous shale

---

## 2. Seam Correlation Suggestions

Input:

- seam depths
- thickness
- lithology transitions
- neighboring boreholes

Output:

- probable seam continuity
- confidence score

---

## 3. Coal Quality Estimation

Input:

- seam depth
- geophysical logs
- nearby assays

Output:

- ash
- moisture
- GCV estimates

---

# Human Feedback Loop

This is the most important long-term capability.

Workflow:

1. AI predicts lithology
2. Geologist edits prediction
3. Correction stored
4. Retraining dataset updated
5. Future models improve locally

This creates customer-specific geological intelligence.

---

# Future ML Expansion

## Image Models

Potential future use cases:

- core image interpretation
- fracture detection
- RQD estimation
- core box classification

Potential technologies:

- CNNs
- Vision Transformers

---

# Geological Knowledge Layer

Future architecture:

- vector database
- geological report embeddings
- retrieval augmented generation
- geological memory system

Potential use cases:

- historical seam search
- anomaly explanations
- exploration report retrieval

---

# Explainability Requirements

All predictions should support:

- confidence scores
- input visibility
- feature importance
- human override
- audit trails

Trust is essential in geological workflows.
