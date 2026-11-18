"""Outgoing email through the SMTP server of a transactional provider (Mailpit in dev).

The standard library `smtplib` is blocking, so each send runs in a worker thread
(`asyncio.to_thread`) and never blocks the event loop. See ADR 0004.
"""

import asyncio
import logging
import smtplib
import ssl
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

from app.core.config import Settings
from app.core.errors import EmailDeliveryError

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class OutgoingEmail:
    sender: str
    recipient: str
    subject: str
    body: str
    reply_to: str | None = None


class EmailSender(Protocol):
    """Anything able to deliver an `OutgoingEmail`; services depend on this, not on SMTP."""

    async def send(self, email: OutgoingEmail) -> None: ...


def build_message(email: OutgoingEmail) -> EmailMessage:
    message = EmailMessage()
    message["From"] = email.sender
    message["To"] = email.recipient
    message["Subject"] = email.subject
    if email.reply_to:
        message["Reply-To"] = email.reply_to
    message.set_content(email.body)
    return message


class SmtpEmailSender:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def send(self, email: OutgoingEmail) -> None:
        try:
            await asyncio.to_thread(self._send_blocking, build_message(email))
        except (smtplib.SMTPException, OSError) as exc:
            # The provider's error can contain addresses: log only its type.
            logger.error("email_delivery_failed", extra={"error_type": type(exc).__name__})
            raise EmailDeliveryError from exc

    def _send_blocking(self, message: EmailMessage) -> None:
        s = self._settings
        context = ssl.create_default_context()
        smtp: smtplib.SMTP
        if s.smtp_use_tls:
            smtp = smtplib.SMTP_SSL(
                s.smtp_host, s.smtp_port, timeout=s.smtp_timeout_seconds, context=context
            )
        else:
            smtp = smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=s.smtp_timeout_seconds)
        with smtp:
            if s.smtp_starttls:
                smtp.starttls(context=context)
            if s.smtp_username and s.smtp_password:
                smtp.login(s.smtp_username, s.smtp_password.get_secret_value())
            smtp.send_message(message)
