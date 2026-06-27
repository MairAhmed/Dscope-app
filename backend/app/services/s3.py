import uuid

import boto3

from ..config import get_settings


def _client():
    s = get_settings()
    return boto3.client("s3", region_name=s.aws_region)


def upload_audio(data: bytes, content_type: str = "audio/webm") -> str:
    s = get_settings()
    key = f"recordings/{uuid.uuid4()}.webm"
    _client().put_object(
        Bucket=s.s3_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    return key


def get_audio_bytes(key: str) -> bytes:
    s = get_settings()
    resp = _client().get_object(Bucket=s.s3_bucket, Key=key)
    return resp["Body"].read()


def delete_audio(key: str) -> None:
    s = get_settings()
    _client().delete_object(Bucket=s.s3_bucket, Key=key)
