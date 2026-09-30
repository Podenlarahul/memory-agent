import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH_ROOT = BASE_DIR / ".env"
ENV_PATH_LOCAL = Path(__file__).resolve().parent / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(ENV_PATH_ROOT), str(ENV_PATH_LOCAL), ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    HINDSIGHT_BASE_URL: str = "https://api.hindsight.vectorize.io"
    HINDSIGHT_API_KEY: str = ""
    HINDSIGHT_BANK_ID: str = "SupportMind"
    
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    JWT_SECRET: str = "supportmind-secure-jwt-secret-token-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    ADMIN_EMAIL: str = "admin@supportmind.ai"
    ADMIN_PASSWORD: str = "admin123"

settings = Settings()

def get_masked_key(key: Optional[str]) -> str:
    """Safely mask API key for diagnostics without exposing secrets."""
    if not key:
        return "[NOT SET]"
    if len(key) <= 8:
        return "***"
    return f"{key[:4]}...{key[-4:]}"
