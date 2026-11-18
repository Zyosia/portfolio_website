"""Contact business logic. No FastAPI imports: unit tested with a fake email sender."""

import logging
from dataclasses import dataclass

from app.shared.email import EmailSender, OutgoingEmail

logger = logging.getLogger(__name__)

DEFAULT_SUBJECT = "New message"


@dataclass(frozen=True, slots=True)
class ContactMessage:
    name: str
    email: str
    subject: str | None
    message: str
    honeypot: str = ""

    @property
    def is_spam(self) -> bool:
        return bool(self.honeypot.strip())


class ContactService:
    def __init__(self, sender: EmailSender, from_address: str, to_address: str) -> None:
        self._sender = sender
        self._from = from_address
        self._to = to_address

    async def submit(self, contact: ContactMessage) -> None:
        """Emails the message to the site owner.

        Spam (honeypot filled) is dropped silently: answering with an error would tell
        bots how to get through.
        """
        if contact.is_spam:
            logger.info("contact_spam_dropped")
            return

        await self._sender.send(self._compose(contact))
        logger.info("contact_message_sent")

    def _compose(self, contact: ContactMessage) -> OutgoingEmail:
        subject = contact.subject or DEFAULT_SUBJECT
        body = "\n".join(
            [
                f"From: {contact.name} <{contact.email}>",
                f"Subject: {subject}",
                "",
                contact.message,
                "",
                "--",
                "Sent from the contact form of the portfolio website.",
                "Reply directly to this email to answer the sender.",
            ]
        )
        return OutgoingEmail(
            sender=self._from,
            recipient=self._to,
            subject=f"[Portfolio] {subject} - {contact.name}",
            body=body,
            reply_to=contact.email,
        )
