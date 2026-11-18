import json
import logging
import sys

import pytest

from app.core.logging import JsonFormatter, TextFormatter, configure_logging
from tests.conftest import make_settings


def _record(message: str, **extra: object) -> logging.LogRecord:
    record = logging.LogRecord("app.test", logging.INFO, __file__, 1, message, None, None)
    for key, value in extra.items():
        setattr(record, key, value)
    return record


def test_json_formatter_outputs_one_object_with_extras() -> None:
    line = JsonFormatter().format(_record("request", path="/api/health", status=200))

    payload = json.loads(line)
    assert payload["message"] == "request"
    assert payload["level"] == "INFO"
    assert payload["logger"] == "app.test"
    assert payload["path"] == "/api/health"
    assert payload["status"] == 200
    assert payload["timestamp"].endswith("+00:00")


def test_json_formatter_includes_exceptions() -> None:
    try:
        raise RuntimeError("boom")
    except RuntimeError:
        record = _record("failed")
        record.exc_info = sys.exc_info()

    payload = json.loads(JsonFormatter().format(record))
    assert "RuntimeError: boom" in payload["exception"]


def test_text_formatter_appends_extras() -> None:
    line = TextFormatter().format(_record("request", status=200))

    assert line.endswith("app.test: request status=200")


@pytest.mark.parametrize(
    ("app_env", "formatter"), [("production", JsonFormatter), ("development", TextFormatter)]
)
def test_configure_logging_picks_the_format_of_the_environment(
    app_env: str, formatter: type[logging.Formatter]
) -> None:
    configure_logging(make_settings(app_env=app_env, log_level="WARNING"))

    root = logging.getLogger()
    assert isinstance(root.handlers[0].formatter, formatter)
    assert root.level == logging.WARNING
    assert logging.getLogger("uvicorn.access").disabled is True
