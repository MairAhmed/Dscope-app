from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


class ReportStatus(str, Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"


class ProcedureReport(BaseModel):
    procedure_type: Optional[str] = None
    procedure_date: Optional[str] = None
    indication: Optional[str] = None
    sedation_medications: Optional[str] = None
    technique: Optional[str] = None
    findings: Optional[str] = None
    impression: Optional[str] = None
    recommendations: Optional[str] = None
    complications: Optional[str] = None
    quality_indicators: Optional[str] = None
    additional_notes: Optional[str] = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Report(BaseModel):
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_ref: Optional[str] = None
    created_at: str = Field(default_factory=_now)
    updated_at: str = Field(default_factory=_now)
    audio_s3_key: Optional[str] = None
    transcript: Optional[str] = None
    procedure_report: Optional[ProcedureReport] = None
    status: ReportStatus = ReportStatus.PROCESSING
    error_message: Optional[str] = None


class ReportUpdate(BaseModel):
    patient_ref: Optional[str] = None
    procedure_report: Optional[ProcedureReport] = None
