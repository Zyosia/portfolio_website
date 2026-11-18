"""Application factory. Each feature contributes a router; nothing else changes to add one."""

from fastapi import FastAPI

from app.core.config import Settings, get_settings
from app.core.errors import register_error_handlers
from app.core.health import router as health_router
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware
from app.features.contact.router import router as contact_router
from app.shared.rate_limit import SlidingWindowRateLimiter


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    app = FastAPI(
        title="Portfolio API",
        version="0.1.0",
        docs_url="/api/docs" if settings.docs_enabled else None,
        redoc_url=None,
        openapi_url="/api/openapi.json" if settings.docs_enabled else None,
    )
    app.dependency_overrides[get_settings] = lambda: settings
    app.state.contact_rate_limiter = SlidingWindowRateLimiter(
        max_requests=settings.contact_rate_limit_requests,
        window_seconds=settings.contact_rate_limit_window_seconds,
    )

    app.add_middleware(RequestContextMiddleware)
    register_error_handlers(app)

    app.include_router(health_router)
    app.include_router(contact_router)
    return app


app = create_app()
