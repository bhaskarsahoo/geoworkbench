from dataclasses import dataclass, field

from app.db.models import Borehole, Curve, LithologyInterval, ValidationIssue


@dataclass
class ValidationFinding:
    code: str
    severity: str
    message: str
    from_depth: float | None = None
    to_depth: float | None = None
    entity_type: str | None = None
    entity_id: str | None = None
    metadata: dict = field(default_factory=dict)


COAL_CODES = {"COAL", "SHCOAL", "CARBSHL", "CARBSHH", "CARBCLAY"}


def validate_borehole(borehole: Borehole) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    intervals = sorted(borehole.lithology_intervals, key=lambda item: (item.from_depth, item.to_depth))

    findings.extend(validate_interval_ranges(borehole, intervals))
    findings.extend(validate_interval_coverage(borehole, intervals))
    findings.extend(validate_recovery_and_rqd(intervals))
    findings.extend(validate_seam_labels(intervals))
    findings.extend(validate_curve_ranges(borehole, borehole.curves))
    findings.extend(validate_core_image_links(intervals))
    return findings


def validate_interval_ranges(
    borehole: Borehole, intervals: list[LithologyInterval]
) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    for interval in intervals:
        if interval.from_depth < 0 or interval.to_depth > borehole.total_depth:
            findings.append(
                ValidationFinding(
                    code="interval_outside_borehole",
                    severity="error",
                    message=f"Interval {interval.id} is outside borehole depth range.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                )
            )
        if interval.to_depth <= interval.from_depth:
            findings.append(
                ValidationFinding(
                    code="invalid_interval_depth",
                    severity="error",
                    message=f"Interval {interval.id} has invalid from/to depths.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                )
            )
        if not interval.lithology_code:
            findings.append(
                ValidationFinding(
                    code="missing_lithology_code",
                    severity="error",
                    message=f"Interval {interval.id} is missing lithology code.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                )
            )
    return findings


def validate_interval_coverage(
    borehole: Borehole, intervals: list[LithologyInterval]
) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    if not intervals:
        return [
            ValidationFinding(
                code="missing_lithology_intervals",
                severity="error",
                message="No lithology intervals are available for this borehole.",
                from_depth=0,
                to_depth=borehole.total_depth,
            )
        ]

    tolerance = 0.01
    first = intervals[0]
    if first.from_depth > tolerance:
        findings.append(
            ValidationFinding(
                code="interval_gap",
                severity="warning",
                message=f"Gap from 0.00m to {first.from_depth:.2f}m before first lithology interval.",
                from_depth=0,
                to_depth=first.from_depth,
            )
        )

    for previous, current in zip(intervals, intervals[1:]):
        if current.from_depth > previous.to_depth + tolerance:
            findings.append(
                ValidationFinding(
                    code="interval_gap",
                    severity="warning",
                    message=f"Gap between intervals {previous.id} and {current.id}.",
                    from_depth=previous.to_depth,
                    to_depth=current.from_depth,
                    metadata={"previous_interval_id": previous.id, "next_interval_id": current.id},
                )
            )
        if current.from_depth < previous.to_depth - tolerance:
            findings.append(
                ValidationFinding(
                    code="interval_overlap",
                    severity="error",
                    message=f"Overlap between intervals {previous.id} and {current.id}.",
                    from_depth=current.from_depth,
                    to_depth=previous.to_depth,
                    metadata={"previous_interval_id": previous.id, "next_interval_id": current.id},
                )
            )

    last = intervals[-1]
    if last.to_depth < borehole.total_depth - tolerance:
        findings.append(
            ValidationFinding(
                code="interval_gap",
                severity="warning",
                message=f"Gap from {last.to_depth:.2f}m to final depth {borehole.total_depth:.2f}m.",
                from_depth=last.to_depth,
                to_depth=borehole.total_depth,
            )
        )
    return findings


def validate_recovery_and_rqd(intervals: list[LithologyInterval]) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    for interval in intervals:
        thickness = interval.to_depth - interval.from_depth
        if interval.recovery is not None and interval.recovery > thickness + 0.01:
            findings.append(
                ValidationFinding(
                    code="recovery_exceeds_interval",
                    severity="warning",
                    message=f"Recovery exceeds interval thickness for {interval.id}.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                    metadata={"recovery": interval.recovery, "thickness": thickness},
                )
            )
        if interval.rqd is not None and (interval.rqd < 0 or interval.rqd > 1):
            findings.append(
                ValidationFinding(
                    code="invalid_rqd",
                    severity="warning",
                    message=f"RQD value is outside 0-100% for {interval.id}.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                    metadata={"rqd": interval.rqd},
                )
            )
    return findings


def validate_seam_labels(intervals: list[LithologyInterval]) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    for interval in intervals:
        if interval.lithology_code in COAL_CODES and not interval.seam_name:
            findings.append(
                ValidationFinding(
                    code="coal_interval_without_seam",
                    severity="info",
                    message=f"Coal/carbonaceous interval {interval.id} has no seam label.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                )
            )
    return findings


def validate_curve_ranges(borehole: Borehole, curves: list[Curve]) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    for curve in curves:
        if not curve.samples:
            findings.append(
                ValidationFinding(
                    code="curve_has_no_samples",
                    severity="warning",
                    message=f"Curve {curve.label} has no samples.",
                    entity_type="curve",
                    entity_id=str(curve.id),
                )
            )
            continue
        min_depth = min(sample.depth for sample in curve.samples)
        max_depth = max(sample.depth for sample in curve.samples)
        if min_depth > 0.5 or max_depth < borehole.total_depth - 0.5:
            findings.append(
                ValidationFinding(
                    code="curve_depth_range_mismatch",
                    severity="info",
                    message=f"Curve {curve.label} does not cover the full borehole depth range.",
                    from_depth=min_depth,
                    to_depth=max_depth,
                    entity_type="curve",
                    entity_id=str(curve.id),
                    metadata={"curve_key": curve.key, "total_depth": borehole.total_depth},
                )
            )
    return findings


def validate_core_image_links(intervals: list[LithologyInterval]) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    for interval in intervals:
        if interval.image_box is None:
            findings.append(
                ValidationFinding(
                    code="missing_core_image_link",
                    severity="info",
                    message=f"Interval {interval.id} has no linked core image.",
                    from_depth=interval.from_depth,
                    to_depth=interval.to_depth,
                    entity_type="lithology_interval",
                    entity_id=interval.id,
                )
            )
    return findings


def replace_validation_issues(borehole: Borehole, findings: list[ValidationFinding]) -> None:
    borehole_id = borehole.id
    borehole.validation_issues.clear()
    for finding in findings:
        borehole.validation_issues.append(
            ValidationIssue(
                borehole_id=borehole_id,
                code=finding.code,
                severity=finding.severity,
                message=finding.message,
                from_depth=finding.from_depth,
                to_depth=finding.to_depth,
                entity_type=finding.entity_type,
                entity_id=finding.entity_id,
                status="open",
                issue_metadata=finding.metadata,
            )
        )
