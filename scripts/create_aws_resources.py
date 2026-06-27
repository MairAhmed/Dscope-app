"""
Run once to create the DynamoDB table and S3 bucket for Dscope.

Usage:
    python scripts/create_aws_resources.py

Reads AWS_REGION, DYNAMODB_TABLE, and S3_BUCKET from backend/.env (or env vars).
"""

import os
import sys
from pathlib import Path

# Load .env from backend/
env_path = Path(__file__).parent.parent / "backend" / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

import boto3
from botocore.exceptions import ClientError

REGION = os.environ.get("AWS_REGION", "us-east-1")
TABLE  = os.environ.get("DYNAMODB_TABLE", "dscope-reports")
BUCKET = os.environ.get("S3_BUCKET", "dscope-audio")


def create_dynamodb_table():
    db = boto3.client("dynamodb", region_name=REGION)
    try:
        db.create_table(
            TableName=TABLE,
            KeySchema=[{"AttributeName": "report_id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "report_id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        print(f"[+] DynamoDB table '{TABLE}' created.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f"[~] DynamoDB table '{TABLE}' already exists.")
        else:
            raise


def create_s3_bucket():
    s3 = boto3.client("s3", region_name=REGION)
    try:
        if REGION == "us-east-1":
            s3.create_bucket(Bucket=BUCKET)
        else:
            s3.create_bucket(
                Bucket=BUCKET,
                CreateBucketConfiguration={"LocationConstraint": REGION},
            )

        # Block all public access
        s3.put_public_access_block(
            Bucket=BUCKET,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": True,
                "IgnorePublicAcls": True,
                "BlockPublicPolicy": True,
                "RestrictPublicBuckets": True,
            },
        )

        # CORS so the browser can upload audio (if using presigned URLs later)
        s3.put_bucket_cors(
            Bucket=BUCKET,
            CORSConfiguration={
                "CORSRules": [{
                    "AllowedHeaders": ["*"],
                    "AllowedMethods": ["GET", "PUT", "POST"],
                    "AllowedOrigins": ["*"],
                    "MaxAgeSeconds": 3000,
                }]
            },
        )
        print(f"[+] S3 bucket '{BUCKET}' created in {REGION}.")
    except ClientError as e:
        if e.response["Error"]["Code"] in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            print(f"[~] S3 bucket '{BUCKET}' already exists.")
        else:
            raise


if __name__ == "__main__":
    print(f"Setting up AWS resources in region '{REGION}'…\n")
    try:
        create_dynamodb_table()
        create_s3_bucket()
        print("\nDone. Copy backend/.env.example to backend/.env and fill in your credentials.")
    except Exception as exc:
        print(f"\n[!] Error: {exc}", file=sys.stderr)
        sys.exit(1)
