import os
from dataclasses import dataclass


@dataclass
class BaseConfig:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/exponat_dev")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
