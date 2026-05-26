import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import AiSuggestion, Borehole, CorrectionAudit, LithologyInterval, ValidationIssue
from app.services.ai_provider import AiProviderUnavailable, ai_provider_status, local_chat_completion
from app.services.validation.borehole_validation import replace_validation_issues, validate_borehole


def _load_borehole(db: Session, borehole_id: int) -> Borehole:
    borehole = db.scalar(
        select(Borehole)
        .where(Borehole.id == borehole_id)
        .options(
            selectinload(Borehole.lithology_intervals),
            selectinload(Borehole.seam_intervals),
            selectinload(Borehole.curves),
            selectinload(Borehole.validation_issues),
            selectinload(Borehole.ai_suggestions),
        )
    )
    if borehole is None:
        raise ValueError("Borehole not found")
    return borehole


def _interval_by_id(borehole: Borehole, interval_id: str | None) -> LithologyInterval | None:
    if not interval_id:
        return None
    return next((item for item in borehole.lithology_intervals if item.id == interval_id), None)


def _previous_interval(borehole: Borehole, interval: LithologyInterval) -> LithologyInterval | None:
    intervals = sorted(borehole.lithology_intervals, key=lambda item: item.from_depth)
    for index, candidate in enumerate(intervals):
        if candidate.id == interval.id and index > 0:
            return intervals[index - 1]
    return None


def _suggestion_for_issue(borehole: Borehole, issue: ValidationIssue) -> dict | None:
    patch = None
    entity_id = issue.entity_id
    entity_type = issue.entity_type
    title = issue.code.replace("_", " ").title()
    action = "Review the source row and adjust the interval before approving export."
    rationale = issue.message
    confidence = 0.72
    from_depth = issue.from_depth
    to_depth = issue.to_depth

    if issue.severity == "info" and issue.code not in {
        "coal_interval_without_seam",
        "curve_depth_range_mismatch",
    }:
        return None

    if issue.code == "missing_lithology_code":
        interval = _interval_by_id(borehole, issue.entity_id)
        previous = _previous_interval(borehole, interval) if interval else None
        if previous:
            patch = {
                "lithology_code": previous.lithology_code,
                "lithology_label": previous.lithology_label,
            }
            action = f"Use previous interval lithology `{previous.lithology_code}` if source row supports it."
            confidence = 0.58
        title = "Missing lithology code"

    elif issue.code == "recovery_exceeds_interval":
        interval = _interval_by_id(borehole, issue.entity_id)
        if interval:
            thickness = round(interval.to_depth - interval.from_depth, 3)
            if thickness > 0:
                patch = {"recovery": thickness, "recovery_percent": 100}
                action = "Cap recovery to interval thickness after checking the source workbook."
                confidence = 0.82
            else:
                action = "Fix the invalid depth range first; recovery cannot be corrected safely while thickness is negative."
                confidence = 0.9
        title = "Recovery exceeds interval thickness"

    elif issue.code == "invalid_rqd":
        interval = _interval_by_id(borehole, issue.entity_id)
        if interval and interval.rqd is not None and interval.rqd > 1:
            patch = {"rqd": 1}
            action = "Cap RQD at 100% after checking whether the source value is a data entry error."
            confidence = 0.86
        title = "RQD format needs review"

    elif issue.code == "interval_overlap":
        next_id = (issue.issue_metadata or {}).get("next_interval_id")
        previous_id = (issue.issue_metadata or {}).get("previous_interval_id")
        previous = _interval_by_id(borehole, previous_id)
        current = _interval_by_id(borehole, next_id)
        entity_id = next_id
        entity_type = "lithology_interval"
        if previous and current:
            patch = {"from_depth": round(previous.to_depth, 3)}
            action = "Align the later interval start depth to the previous interval end if source rows confirm continuity."
            confidence = 0.76
        title = "Overlapping lithology intervals"

    elif issue.code == "interval_gap":
        title = "Gap in lithology coverage"
        action = "Inspect adjacent rows and add a missing interval or adjust the boundary."
        confidence = 0.68

    elif issue.code == "invalid_interval_depth":
        title = "Invalid interval depth range"
        action = "Check from-depth, thickness, and to-depth. Do not auto-apply because the source row is contradictory."
        confidence = 0.9

    elif issue.code == "coal_interval_without_seam":
        title = "Coal interval has no seam label"
        action = "Review whether this coal/carbonaceous interval should inherit a seam name or remain local/non-seam coal."
        confidence = 0.52

    elif issue.code == "curve_depth_range_mismatch":
        entity_id = None
        entity_type = "curve"
        title = "Geophysical curve coverage needs review"
        action = (
            "Treat the imported geophysical curve as partial evidence. Confirm whether the missing "
            "depth coverage is expected for this source before using it for correction."
        )
        confidence = 0.64
        from_depth = None
        to_depth = None

    return {
        "validation_issue_id": issue.id,
        "suggestion_type": issue.code,
        "title": title,
        "rationale": rationale,
        "recommended_action": action,
        "confidence": confidence,
        "from_depth": from_depth,
        "to_depth": to_depth,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "patch": patch,
        "evidence": {
            "validation_code": issue.code,
            "severity": issue.severity,
            "metadata": issue.issue_metadata or {},
            "provider_note": "Generated by deterministic validation assistant.",
        },
    }


def generate_suggestions(db: Session, borehole_id: int) -> list[AiSuggestion]:
    borehole = _load_borehole(db, borehole_id)
    for suggestion in list(borehole.ai_suggestions):
        if suggestion.provider == "rule_based" and suggestion.status == "open":
            db.delete(suggestion)
    db.flush()

    replace_validation_issues(borehole, validate_borehole(borehole))
    db.flush()
    db.refresh(borehole)

    existing_issue_ids = {
        item.validation_issue_id for item in borehole.ai_suggestions if item.validation_issue_id is not None
    }
    curve_coverage_issues = [
        issue for issue in borehole.validation_issues if issue.code == "curve_depth_range_mismatch"
    ]
    if curve_coverage_issues:
        labels = [
            (issue.issue_metadata or {}).get("curve_label")
            or (issue.issue_metadata or {}).get("curve_key")
            or issue.message
            for issue in curve_coverage_issues
        ]
        borehole.ai_suggestions.append(
            AiSuggestion(
                borehole_id=borehole.id,
                provider="rule_based",
                validation_issue_id=curve_coverage_issues[0].id,
                suggestion_type="curve_depth_range_mismatch",
                title="Geophysical curve coverage needs review",
                rationale=(
                    f"{len(curve_coverage_issues)} imported curve(s) do not cover the full borehole "
                    "depth range."
                ),
                recommended_action=(
                    "Treat these imported geophysical curves as partial evidence. Confirm whether "
                    "the missing depth coverage is expected before using them for correction."
                ),
                confidence=0.64,
                from_depth=None,
                to_depth=None,
                entity_type="curve",
                entity_id=None,
                patch=None,
                evidence={
                    "validation_code": "curve_depth_range_mismatch",
                    "severity": "info",
                    "curves": labels,
                    "provider_note": "Grouped deterministic validation assistant finding.",
                },
            )
        )
        existing_issue_ids.update(issue.id for issue in curve_coverage_issues)
    for issue in borehole.validation_issues:
        if issue.id in existing_issue_ids:
            continue
        payload = _suggestion_for_issue(borehole, issue)
        if payload is None:
            continue
        borehole.ai_suggestions.append(AiSuggestion(borehole_id=borehole.id, provider="rule_based", **payload))

    db.add(borehole)
    db.commit()
    db.refresh(borehole)
    return sorted(
        borehole.ai_suggestions,
        key=lambda item: (
            {"open": 0, "accepted": 1, "rejected": 2}.get(item.status, 3),
            item.from_depth if item.from_depth is not None else -1,
            item.id,
        ),
    )


def update_suggestion_status(db: Session, suggestion_id: int, status: str) -> AiSuggestion:
    suggestion = db.get(AiSuggestion, suggestion_id)
    if suggestion is None:
        raise ValueError("AI suggestion not found")
    if status not in {"open", "accepted", "rejected"}:
        raise ValueError("Unsupported suggestion status")
    suggestion.status = status
    suggestion.resolved_at = datetime.now(timezone.utc) if status in {"accepted", "rejected"} else None
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


def accept_suggestion(db: Session, suggestion_id: int) -> AiSuggestion:
    suggestion = db.get(AiSuggestion, suggestion_id)
    if suggestion is None:
        raise ValueError("AI suggestion not found")
    if suggestion.patch and suggestion.entity_type == "lithology_interval" and suggestion.entity_id:
        interval = db.get(LithologyInterval, suggestion.entity_id)
        if interval is not None:
            before_values = {field: getattr(interval, field) for field in suggestion.patch}
            for field, value in suggestion.patch.items():
                setattr(interval, field, value)
            after_values = {field: getattr(interval, field) for field in suggestion.patch}
            db.add(
                CorrectionAudit(
                    borehole_id=suggestion.borehole_id,
                    interval_id=interval.id,
                    entity_type="lithology_interval",
                    changed_by="ai-suggestion-review",
                    change_reason=f"Accepted suggestion {suggestion.id}",
                    before_values=before_values,
                    after_values=after_values,
                )
            )
            db.add(interval)
    suggestion.status = "accepted"
    suggestion.resolved_at = datetime.now(timezone.utc)
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


def summarize_borehole(db: Session, borehole_id: int) -> dict:
    borehole = _load_borehole(db, borehole_id)
    intervals = borehole.lithology_intervals
    coal = [item for item in intervals if "COAL" in (item.lithology_code or "")]
    warnings = [item for item in borehole.validation_issues if item.severity in {"error", "warning"}]
    top_codes: dict[str, int] = {}
    for interval in intervals:
        code = interval.lithology_code or "UNKNOWN"
        top_codes[code] = top_codes.get(code, 0) + 1
    common = sorted(top_codes.items(), key=lambda item: item[1], reverse=True)[:5]
    deterministic_summary = (
        f"{borehole.code} covers {borehole.total_depth:.1f}m with {len(intervals)} lithology intervals. "
        f"Coal/carbonaceous intervals appear in {len(coal)} rows. "
        f"Current validation has {len(warnings)} error/warning items requiring review before export. "
        "The assistant is using deterministic rules only; final interpretation remains with the geologist."
    )
    summary = deterministic_summary
    provider = ai_provider_status()
    if provider.get("enabled") and provider.get("reachable"):
        prompt = {
            "borehole": {
                "code": borehole.code,
                "title": borehole.title,
                "total_depth": borehole.total_depth,
                "lithology_intervals": len(intervals),
                "seam_intervals": len(borehole.seam_intervals),
                "curves": len(borehole.curves),
            },
            "top_lithology_codes": common,
            "validation_error_warning_count": len(warnings),
            "open_suggestion_count": len([item for item in borehole.ai_suggestions if item.status == "open"]),
            "important_rule_findings": [
                {
                    "code": item.code,
                    "severity": item.severity,
                    "message": item.message,
                    "from_depth": item.from_depth,
                    "to_depth": item.to_depth,
                }
                for item in warnings[:6]
            ],
        }
        try:
            ai_text = local_chat_completion(
                [
                    {
                        "role": "system",
                        "content": (
                            "You are a cautious coal geology workflow assistant. "
                            "Use only the provided JSON. Do not invent geology. "
                            "Write only the final answer as 4-6 concise bullets with actionable review guidance. "
                            "Do not include reasoning, analysis, or preamble. "
                            "Always say that the geologist must approve corrections."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            "Create actionable insights for central geologist review from this borehole JSON:\n"
                            + json.dumps(prompt, ensure_ascii=True)
                        ),
                    },
                ],
                max_tokens=800,
                temperature=0.15,
            )
            if ai_text:
                summary = ai_text
                provider["used_for_summary"] = True
            else:
                provider["used_for_summary"] = False
                provider["summary_error"] = "AI provider returned an empty final response."
        except AiProviderUnavailable as exc:
            provider["used_for_summary"] = False
            provider["summary_error"] = str(exc)
    return {
        "borehole_id": borehole.id,
        "title": borehole.title,
        "summary": summary,
        "metrics": {
            "total_depth": borehole.total_depth,
            "lithology_intervals": len(intervals),
            "seam_intervals": len(borehole.seam_intervals),
            "curves": len(borehole.curves),
            "coal_interval_count": len(coal),
            "validation_error_warning_count": len(warnings),
            "top_lithology_codes": common,
            "deterministic_summary": deterministic_summary,
            "ai_provider": provider,
        },
    }


def provider_status() -> dict:
    return ai_provider_status()
