from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    hf_token: str = ""
    hf_face_model_id: str = ""
    face_model_name: str = "buffalo_sc"
    face_match_threshold: float = 0.35
    adaface_enabled: bool = True
    sentry_dsn: str = Field(default="", validation_alias="ML_SENTRY_DSN")
    sentry_environment: str = Field(default="development", validation_alias="SENTRY_ENVIRONMENT")
    port: int = Field(default=8000, validation_alias="ML_PORT")


settings = Settings()
