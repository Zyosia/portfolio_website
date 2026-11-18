# 0004. Backend building blocks without extra dependencies

- **Status**: Accepted
- **Date**: 2026-11-18

## Context

The contact feature needs async email delivery, per-IP rate limiting and structured logs.
Each has a popular third-party library (`aiosmtplib`, `slowapi`, `structlog`), but the stack
in `CLAUDE.md` deliberately limits dependencies, and the traffic of a personal site is tiny.

## Decision

- **Email**: the standard library `smtplib` + `email.message.EmailMessage`, executed with
  `asyncio.to_thread` so the event loop is never blocked. `SmtpEmailSender` implements an
  `EmailSender` protocol; services depend on the protocol only.
- **Rate limiting**: an in-memory sliding-window limiter (`app/shared/rate_limit.py`), one
  instance per app, keyed by client IP. Uvicorn runs with `--proxy-headers` so the IP is the
  real client IP forwarded by Caddy; the API is unreachable except through Caddy.
- **Logging**: the standard `logging` module with a small JSON formatter (production) and a
  text formatter (development). Context is passed through `extra`. A pure ASGI middleware
  adds an `X-Request-ID` and writes one access line per request.
- **Errors**: services raise `AppError` subclasses; one module maps them to HTTP responses with
  the `{"error": {"code", "message"}}` shape. Unexpected errors are logged with their traceback
  and returned as a generic 500.

## Alternatives considered

- **aiosmtplib**: native async SMTP. Preferable if email volume grows or the thread pool ever
  becomes a bottleneck; the `EmailSender` protocol makes the swap local to one class.
- **slowapi / Redis-backed limiter**: needed only with several API replicas.
- **structlog**: nicer API, but stdlib logging plus a formatter covers the need.

## Consequences

- Zero extra runtime dependencies beyond FastAPI and pydantic-settings.
- Rate-limit state is lost on restart and is per process: acceptable for a contact form.
- The future chatbot (streaming LLM calls) will be natively async through the provider SDK;
  it does not depend on these choices.
