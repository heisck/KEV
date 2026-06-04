import sentry_sdk

from app.config import settings


def init_sentry() -> None:
    """Initialize Sentry if a DSN is configured; otherwise no-op."""
    if not settings.sentry_dsn:
        return
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.sentry_environment,
        traces_sample_rate=0.2,
        send_default_pii=False,
    )
