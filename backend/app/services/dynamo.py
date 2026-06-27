import json
from datetime import datetime, timezone

import boto3

from ..config import get_settings
from ..models import Report


def _get_table():
    s = get_settings()
    db = boto3.resource("dynamodb", region_name=s.aws_region)
    return db.Table(s.dynamodb_table)


def _deserialize(item: dict) -> Report:
    if item.get("procedure_report") and isinstance(item["procedure_report"], str):
        item["procedure_report"] = json.loads(item["procedure_report"])
    return Report(**item)


def save_report(report: Report) -> None:
    table = _get_table()
    item = report.model_dump()
    if item.get("procedure_report") is not None:
        item["procedure_report"] = json.dumps(item["procedure_report"])
    table.put_item(Item=item)


def get_report(report_id: str) -> Report | None:
    table = _get_table()
    resp = table.get_item(Key={"report_id": report_id})
    item = resp.get("Item")
    return _deserialize(item) if item else None


def list_reports() -> list[Report]:
    table = _get_table()
    reports: list[Report] = []

    # DynamoDB scan paginates via LastEvaluatedKey — iterate until exhausted
    kwargs: dict = {}
    while True:
        resp = table.scan(**kwargs)
        reports.extend(_deserialize(item) for item in resp.get("Items", []))
        last = resp.get("LastEvaluatedKey")
        if not last:
            break
        kwargs["ExclusiveStartKey"] = last

    return sorted(reports, key=lambda r: r.created_at, reverse=True)


def update_report_fields(report_id: str, updates: dict) -> Report | None:
    table = _get_table()
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    names, values, parts = {}, {}, []
    for key, value in updates.items():
        alias = f"#k_{key}"
        names[alias] = key
        values[f":v_{key}"] = value
        parts.append(f"{alias} = :v_{key}")

    resp = table.update_item(
        Key={"report_id": report_id},
        UpdateExpression="SET " + ", ".join(parts),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )
    item = resp.get("Attributes")
    return _deserialize(item) if item else None


def delete_report(report_id: str) -> None:
    _get_table().delete_item(Key={"report_id": report_id})
