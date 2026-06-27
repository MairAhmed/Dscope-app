from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    aws_region: str = "us-east-1"
    dynamodb_table: str = "dscope-reports"
    s3_bucket: str = "dscope-audio"
    stage: str = "local"

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache
def get_settings() -> Settings:
    return Settings()
