import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..models import Report, ReportStatus, ReportUpdate
from ..services import claude, dynamo, s3, transcribe

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("", response_model=Report)
async def create_report(
    audio: UploadFile = File(...),
    patient_ref: Optional[str] = Form(None),
):
    audio_bytes = await audio.read()

    # Whisper API hard limit is 25 MB
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Recording is too large (max 25 MB). Please keep recordings under ~15 minutes.",
        )

    report = Report(patient_ref=patient_ref, status=ReportStatus.PROCESSING)

    try:
        s3_key = s3.upload_audio(audio_bytes, audio.content_type or "audio/webm")
        report.audio_s3_key = s3_key

        transcript = transcribe.transcribe(s3_key)
        report.transcript = transcript

        report.procedure_report = claude.generate_report(transcript)
        report.status = ReportStatus.COMPLETED

    except Exception as exc:
        report.status = ReportStatus.ERROR
        report.error_message = str(exc)

    report.updated_at = datetime.now(timezone.utc).isoformat()
    dynamo.save_report(report)
    return report


@router.get("", response_model=list[Report])
def list_reports():
    return dynamo.list_reports()


@router.get("/{report_id}", response_model=Report)
def get_report(report_id: str):
    report = dynamo.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/{report_id}", response_model=Report)
def update_report(report_id: str, body: ReportUpdate):
    if not dynamo.get_report(report_id):
        raise HTTPException(status_code=404, detail="Report not found")

    updates: dict = {}
    if body.patient_ref is not None:
        updates["patient_ref"] = body.patient_ref
    if body.procedure_report is not None:
        updates["procedure_report"] = json.dumps(body.procedure_report.model_dump())

    updated = dynamo.update_report_fields(report_id, updates)
    if not updated:
        raise HTTPException(status_code=500, detail="Update failed")
    return updated


@router.delete("/{report_id}")
def delete_report(report_id: str):
    report = dynamo.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.audio_s3_key:
        try:
            s3.delete_audio(report.audio_s3_key)
        except Exception:
            pass

    dynamo.delete_report(report_id)
    return {"message": "Deleted"}
