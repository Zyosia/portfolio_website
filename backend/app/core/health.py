"""Liveness endpoint used by Docker healthchecks and the post-deploy check."""

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


@router.get("/api/health")
async def health() -> HealthResponse:
    return HealthResponse()
