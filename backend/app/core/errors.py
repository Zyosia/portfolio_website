"""Domain exceptions and their single mapping to HTTP responses.

Services raise subclasses of `AppError` and never deal with HTTP. Every error response
has the shape `{"error": {"code": "...", "message": "..."}}`, and internal details never
reach the client.
"""

import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base class of expected, client-facing errors."""

    status_code: HTTPStatus = HTTPStatus.INTERNAL_SERVER_ERROR
    code: str = "internal_error"
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)
        self.message = message or self.message

    def headers(self) -> dict[str, str] | None:
        """Extra response headers (e.g. `Retry-After`)."""
        return None


class RateLimitExceededError(AppError):
    status_code = HTTPStatus.TOO_MANY_REQUESTS
    code = "rate_limited"
    message = "Too many requests. Please try again later."

    def __init__(self, retry_after_seconds: int) -> None:
        super().__init__()
        self.retry_after_seconds = retry_after_seconds

    def headers(self) -> dict[str, str]:
        return {"Retry-After": str(self.retry_after_seconds)}


class EmailDeliveryError(AppError):
    status_code = HTTPStatus.SERVICE_UNAVAILABLE
    code = "email_unavailable"
    message = "The message could not be sent right now. Please try again later."


def error_body(code: str, message: str) -> dict[str, dict[str, str]]:
    return {"error": {"code": code, "message": message}}


def _http_status_code(status: int) -> str:
    try:
        return HTTPStatus(status).phrase.lower().replace(" ", "_")
    except ValueError:
        return "http_error"


async def _handle_app_error(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, AppError)  # noqa: S101 - guaranteed by the registration below
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(exc.code, exc.message),
        headers=exc.headers(),
    )


async def _handle_validation_error(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)  # noqa: S101
    fields = sorted({".".join(str(p) for p in err["loc"][1:]) for err in exc.errors()} - {""})
    message = "Invalid request." + (f" Check: {', '.join(fields)}." if fields else "")
    return JSONResponse(
        status_code=HTTPStatus.UNPROCESSABLE_CONTENT,
        content=error_body("validation_error", message),
    )


async def _handle_http_exception(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StarletteHTTPException)  # noqa: S101
    message = exc.detail if isinstance(exc.detail, str) else HTTPStatus(exc.status_code).phrase
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(_http_status_code(exc.status_code), message),
        headers=exc.headers,
    )


async def _handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    # Handlers run outside the `except` block, so the exception is passed explicitly.
    logger.error(
        "unhandled_error",
        exc_info=exc,
        extra={"path": request.url.path, "error_type": type(exc).__name__},
    )
    return JSONResponse(
        status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
        content=error_body(AppError.code, AppError.message),
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _handle_app_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(StarletteHTTPException, _handle_http_exception)
    app.add_exception_handler(Exception, _handle_unexpected_error)
