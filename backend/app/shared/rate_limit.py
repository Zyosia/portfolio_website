"""In-memory sliding-window rate limiter.

Good enough for a single API process (see ADR 0002). Several replicas would need a
shared store such as Redis behind the same interface.
"""

import math
import time
from collections import deque
from collections.abc import Callable

from app.core.errors import RateLimitExceededError

type Clock = Callable[[], float]


class SlidingWindowRateLimiter:
    """Allows at most `max_requests` hits per key within any `window_seconds` window."""

    def __init__(
        self,
        max_requests: int,
        window_seconds: float,
        clock: Clock = time.monotonic,
    ) -> None:
        if max_requests < 1 or window_seconds <= 0:
            msg = "max_requests must be >= 1 and window_seconds > 0"
            raise ValueError(msg)
        self._max_requests = max_requests
        self._window = window_seconds
        self._clock = clock
        self._hits: dict[str, deque[float]] = {}

    def hit(self, key: str) -> None:
        """Records a request for `key`, or raises `RateLimitExceededError` if over the limit."""
        now = self._clock()
        self._prune(now)
        hits = self._hits.setdefault(key, deque())
        if len(hits) >= self._max_requests:
            retry_after = math.ceil(hits[0] + self._window - now)
            raise RateLimitExceededError(retry_after_seconds=max(retry_after, 1))
        hits.append(now)

    def _prune(self, now: float) -> None:
        """Drops expired hits, and keys with none left, so memory stays bounded."""
        threshold = now - self._window
        for key in list(self._hits):
            hits = self._hits[key]
            while hits and hits[0] <= threshold:
                hits.popleft()
            if not hits:
                del self._hits[key]

    @property
    def tracked_keys(self) -> int:
        return len(self._hits)
