import json
import time
import uuid

import boto3

from ..config import get_settings

# Amazon Transcribe Medical specialties. GI/endoscopy isn't its own specialty,
# so PRIMARYCARE (the general option) is the safe default.
_SPECIALTY = "PRIMARYCARE"
# A doctor narrating a procedure is dictation, not a two-party conversation.
_TYPE = "DICTATION"

_POLL_SECONDS = 3
_TIMEOUT_SECONDS = 150


def transcribe(audio_s3_key: str) -> str:
    """Transcribe an audio file already in S3 using Amazon Transcribe Medical.

    Returns the plain-text transcript. Raises on failure or timeout.
    """
    s = get_settings()
    client = boto3.client("transcribe", region_name=s.aws_region)
    s3 = boto3.client("s3", region_name=s.aws_region)

    job_name = f"dscope-{uuid.uuid4()}"
    media_uri = f"s3://{s.s3_bucket}/{audio_s3_key}"
    output_key = f"transcripts/{job_name}.json"

    client.start_medical_transcription_job(
        MedicalTranscriptionJobName=job_name,
        LanguageCode="en-US",
        MediaFormat="webm",
        Media={"MediaFileUri": media_uri},
        OutputBucketName=s.s3_bucket,
        OutputKey=output_key,
        Specialty=_SPECIALTY,
        Type=_TYPE,
    )

    deadline = time.time() + _TIMEOUT_SECONDS
    while True:
        resp = client.get_medical_transcription_job(MedicalTranscriptionJobName=job_name)
        status = resp["MedicalTranscriptionJob"]["TranscriptionJobStatus"]

        if status == "COMPLETED":
            break
        if status == "FAILED":
            reason = resp["MedicalTranscriptionJob"].get("FailureReason", "unknown")
            raise RuntimeError(f"Transcription failed: {reason}")
        if time.time() > deadline:
            raise TimeoutError("Transcription timed out")

        time.sleep(_POLL_SECONDS)

    obj = s3.get_object(Bucket=s.s3_bucket, Key=output_key)
    result = json.loads(obj["Body"].read())
    return result["results"]["transcripts"][0]["transcript"]
