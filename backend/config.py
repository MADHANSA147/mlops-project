"""
Application configuration loaded from environment variables / .env file.
Uses pydantic-settings for automatic type coercion and validation.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration – every setting mirrors a .env variable."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── MongoDB ──────────────────────────────────────────────────
    mongodb_url: str = "mongodb://localhost:27017"
    db_name: str = "aipi_db"

    # ── JWT ──────────────────────────────────────────────────────
    jwt_secret: str = "change-me-to-a-long-random-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # ── Reddit API ───────────────────────────────────────────────
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "AIPI/1.0"
    reddit_subreddits: str = "news,worldnews,technology,politics,science,business"

    # ── MLflow ───────────────────────────────────────────────────
    mlflow_tracking_uri: str = "./mlruns"

    # ── Model ────────────────────────────────────────────────────
    model_path: str = "./ml/artifacts"

    # ── Scheduler ────────────────────────────────────────────────
    scheduler_interval_minutes: int = 5

    # ── CORS ─────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:4173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def subreddit_list(self) -> list[str]:
        return [s.strip() for s in self.reddit_subreddits.split(",") if s.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached singleton – import and call this wherever config is needed."""
    return Settings()
