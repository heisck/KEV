import sentry_sdk

from app.config import settings


def init_sentry() -> None:
    """Initialize Sentry if a valid HTTP/HTTPS DSN is configured; otherwise no-op."""
    dsn = settings.sentry_dsn.strip() if settings.sentry_dsn else ""
    if not dsn or not (dsn.startswith("http://") or dsn.startswith("https://")):
        return
    sentry_sdk.init(
        dsn=dsn,
        environment=settings.sentry_environment,
        traces_sample_rate=0.2,
        send_default_pii=False,
    )
