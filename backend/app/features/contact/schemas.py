"""Request/response models of the contact endpoint.

These limits are the source of truth; the frontend mirrors them for UX only
(frontend/src/lib/contact-validation.ts).
"""

from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field

NAME_MAX_LENGTH = 100
SUBJECT_MAX_LENGTH = 150
MESSAGE_MIN_LENGTH = 10
MESSAGE_MAX_LENGTH = 5000


def _single_line(value: str) -> str:
    """Values used in email headers must not contain line breaks (header injection)."""
    if any(char in value for char in "\r\n"):
        msg = "must be a single line"
        raise ValueError(msg)
    return value


SingleLine = Annotated[str, AfterValidator(_single_line)]


class ContactRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: SingleLine = Field(min_length=1, max_length=NAME_MAX_LENGTH)
    email: EmailStr = Field(max_length=254)
    subject: SingleLine | None = Field(default=None, max_length=SUBJECT_MAX_LENGTH)
    message: str = Field(min_length=MESSAGE_MIN_LENGTH, max_length=MESSAGE_MAX_LENGTH)
    # Honeypot: hidden from humans in the form, so only bots fill it in.
    website: str = Field(default="", max_length=200)


class ContactResponse(BaseModel):
    status: Literal["sent"] = "sent"
