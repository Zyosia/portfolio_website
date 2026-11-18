"""HTTP layer of the contact feature: parsing, dependencies and status codes only."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request

from app.core.config import Settings, get_settings
from app.features.contact.schemas import ContactRequest, ContactResponse
from app.features.contact.service import ContactMessage, ContactService
from app.shared.email import SmtpEmailSender
from app.shared.rate_limit import SlidingWindowRateLimiter

router = APIRouter(prefix="/api/v1/contact", tags=["contact"])


def get_contact_service(settings: Annotated[Settings, Depends(get_settings)]) -> ContactService:
    return ContactService(
        sender=SmtpEmailSender(settings),
        from_address=str(settings.contact_from_email),
        to_address=str(settings.contact_to_email),
    )


def get_contact_rate_limiter(request: Request) -> SlidingWindowRateLimiter:
    """One limiter per application instance, created in `create_app`."""
    limiter: SlidingWindowRateLimiter = request.app.state.contact_rate_limiter
    return limiter


def enforce_rate_limit(
    request: Request,
    limiter: Annotated[SlidingWindowRateLimiter, Depends(get_contact_rate_limiter)],
) -> None:
    # Behind Caddy, uvicorn's proxy-headers support has already replaced the peer
    # address with the real client IP from X-Forwarded-For.
    client_ip = request.client.host if request.client else "unknown"
    limiter.hit(client_ip)


@router.post(
    "",
    dependencies=[Depends(enforce_rate_limit)],
    responses={
        422: {"description": "Invalid input"},
        429: {"description": "Too many requests from this client"},
        503: {"description": "Email provider unavailable"},
    },
)
async def send_contact_message(
    payload: ContactRequest,
    service: Annotated[ContactService, Depends(get_contact_service)],
) -> ContactResponse:
    await service.submit(
        ContactMessage(
            name=payload.name,
            email=str(payload.email),
            subject=payload.subject or None,
            message=payload.message,
            honeypot=payload.website,
        )
    )
    return ContactResponse()
