from pydantic import BaseModel, ConfigDict


class AiSuggestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    borehole_id: int
    validation_issue_id: int | None
    suggestion_type: str
    title: str
    rationale: str
    recommended_action: str
    confidence: float | None
    status: str
    provider: str
    from_depth: float | None
    to_depth: float | None
    entity_type: str | None
    entity_id: str | None
    patch: dict | None
    evidence: dict | None


class AiSuggestionStatusPatch(BaseModel):
    status: str


class BoreholeSummaryOut(BaseModel):
    borehole_id: int
    title: str
    summary: str
    metrics: dict
