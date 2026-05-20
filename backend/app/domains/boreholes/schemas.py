from pydantic import BaseModel, ConfigDict


class BoreholeListItem(BaseModel):
    id: int
    code: str
    title: str
    total_depth: float
    site_code: str
    project_code: str


class LithologyIntervalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_row: int | None
    from_depth: float
    to_depth: float
    lithology_code: str
    lithology_label: str
    display_color: str | None
    logged_color: str | None
    seam_name: str | None
    recovery: float | None
    recovery_percent: float | None
    rqd: float | None
    structural_features: str | None
    remark: str | None
    image_box: int | None
    image_file: str | None


class LithologyIntervalPatch(BaseModel):
    lithology_code: str | None = None
    lithology_label: str | None = None
    seam_name: str | None = None
    remark: str | None = None
    from_depth: float | None = None
    to_depth: float | None = None
    recovery: float | None = None
    recovery_percent: float | None = None
    rqd: float | None = None


class SeamIntervalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_row: int | None
    name: str
    from_depth: float
    to_depth: float
    thickness: float | None
    lithology_code: str | None
    lithology_label: str | None
    image_box: int | None


class CurveSampleOut(BaseModel):
    depth: float
    value: float


class CurveOut(BaseModel):
    id: int
    key: str
    label: str
    unit: str
    source_type: str
    color: str
    samples: list[CurveSampleOut]


class CoreImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    box_number: int
    name: str
    file_path: str
    from_depth: float | None
    to_depth: float | None
    url: str


class DisplayLayoutOut(BaseModel):
    id: int
    name: str
    mode: str
    settings: dict


class BoreholeWorkbenchOut(BaseModel):
    id: int
    code: str
    title: str
    state: str | None
    total_depth: float
    closure_note: str | None
    source_workbook: str | None
    source_sheet: str | None
    lithology_intervals: list[LithologyIntervalOut]
    seam_intervals: list[SeamIntervalOut]
    curves: list[CurveOut]
    core_images: list[CoreImageOut]
    layout: DisplayLayoutOut | None
    validation_issues: list[dict]

