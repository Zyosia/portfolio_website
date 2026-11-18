"""Structured logging: JSON lines in production, readable text in development.

Log calls pass context through `extra={...}`; those fields become JSON keys. Never log
secrets or message contents (personal data).
"""

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any, override

from app.core.config import Settings

# Attributes every LogRecord has; anything else was passed through `extra`.
# `color_message` is uvicorn's ANSI-coloured duplicate of the message.
_STANDARD_ATTRS = frozenset(vars(logging.makeLogRecord({})).keys()) | {
    "message",
    "asctime",
    "color_message",
}


def _extra_fields(record: logging.LogRecord) -> dict[str, Any]:
    return {k: v for k, v in vars(record).items() if k not in _STANDARD_ATTRS}


class JsonFormatter(logging.Formatter):
    """One JSON object per line, ready for `docker logs` and log shippers."""

    @override
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            **_extra_fields(record),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


class TextFormatter(logging.Formatter):
    """Human-friendly format for local development, extras appended as key=value."""

    def __init__(self) -> None:
        super().__init__("%(asctime)s %(levelname)-8s %(name)s: %(message)s", "%H:%M:%S")

    @override
    def format(self, record: logging.LogRecord) -> str:
        line = super().format(record)
        extras = " ".join(f"{k}={v}" for k, v in _extra_fields(record).items())
        return f"{line} {extras}" if extras else line


def configure_logging(settings: Settings) -> None:
    """Route the app and uvicorn loggers to stdout with the format of the environment."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter() if settings.is_production else TextFormatter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(settings.log_level)

    # Uvicorn installs its own handlers; let its records flow to the root handler instead.
    # Its access log is replaced by our request logging middleware.
    for name in ("uvicorn", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers = []
        uvicorn_logger.propagate = True
    logging.getLogger("uvicorn.access").disabled = True
