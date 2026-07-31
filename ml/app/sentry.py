import logging
from urllib.parse import urlparse

import sentry_sdk

from app.config import settings

logger = logging.getLogger(__name__)


def init_sentry() -> None:
    """Initialize Sentry if a usable DSN is configured; otherwise no-op.

    A placeholder DSN — the ``your-ml-sentry-dsn`` left in a copied .env — is truthy but
    has no URL scheme, and ``sentry_sdk.init`` raises ``BadDsn`` for it at import time.
    That crashes the service before FastAPI ever loads, so error reporting being
    misconfigured takes the whole face pipeline down. Validate before handing it over.
    """
    dsn = settings.sentry_dsn.strip()
    if not dsn:
        return
    if urlparse(dsn).scheme not in ("http", "https"):
        logger.warning("Ignoring ML_SENTRY_DSN: not a valid Sentry DSN URL. Sentry is disabled.")
        return
    sentry_sdk.init(
        dsn=dsn,
        environment=settings.sentry_environment,
        traces_sample_rate=0.2,
        send_default_pii=False,
    )
