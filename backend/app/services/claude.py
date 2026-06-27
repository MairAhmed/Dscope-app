import json
from datetime import date

import anthropic

from ..config import get_settings
from ..models import ProcedureReport

# Report generation runs on Claude Opus 4.8 — Anthropic's most capable model.
MODEL = "claude-opus-4-8"

_SYSTEM = (
    "You are a medical documentation assistant specializing in gastrointestinal "
    "endoscopy procedures. Extract structured procedure-report data from a physician's "
    "verbal description. Use clinical language appropriate for a procedure note. "
    "If a field was not mentioned, return null for it — never invent findings."
)

# All fields are nullable strings. Structured outputs requires every property in
# `required` and additionalProperties:false, so nullability is expressed via type unions.
_FIELDS = {
    "procedure_type": "Type of endoscopy (e.g. Colonoscopy, Upper GI Endoscopy/EGD, Flexible Sigmoidoscopy, ERCP)",
    "procedure_date": "Date mentioned, or today's date (YYYY-MM-DD) if not stated",
    "indication": "Clinical indication / reason for the procedure",
    "sedation_medications": "Sedation agents and doses administered",
    "technique": "Technical aspects — scope introduction, landmarks reached, accessories used",
    "findings": "All observed findings: mucosa, polyps (size/location/morphology), diverticula, lesions, hemorrhoids, etc.",
    "impression": "Overall diagnostic impression or assessment",
    "recommendations": "Follow-up plan, biopsy tracking, next procedure timing, medications",
    "complications": "Any complications; use 'None' if none mentioned",
    "quality_indicators": "Prep quality (Boston Bowel Prep Scale), withdrawal time, cecal intubation confirmed, etc.",
    "additional_notes": "Any other clinically relevant information",
}

_SCHEMA = {
    "type": "object",
    "properties": {
        name: {"type": ["string", "null"], "description": desc}
        for name, desc in _FIELDS.items()
    },
    "required": list(_FIELDS.keys()),
    "additionalProperties": False,
}


def generate_report(transcript: str) -> ProcedureReport:
    s = get_settings()
    client = anthropic.Anthropic(api_key=s.anthropic_api_key)

    prompt = (
        f"Today's date is {date.today().isoformat()}.\n\n"
        f"Extract the procedure report from this physician's verbal description:\n\n"
        f"{transcript}"
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
        output_config={"format": {"type": "json_schema", "schema": _SCHEMA}},
    )

    text = next(b.text for b in response.content if b.type == "text")
    data = json.loads(text)
    return ProcedureReport(**data)
