import pytest

from app.core.errors import RateLimitExceededError
from app.shared.rate_limit import SlidingWindowRateLimiter


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


@pytest.fixture
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture
def limiter(clock: FakeClock) -> SlidingWindowRateLimiter:
    return SlidingWindowRateLimiter(max_requests=2, window_seconds=60, clock=clock)


def test_allows_requests_up_to_the_limit(limiter: SlidingWindowRateLimiter) -> None:
    limiter.hit("1.2.3.4")
    limiter.hit("1.2.3.4")


def test_rejects_the_request_over_the_limit_with_retry_after(
    limiter: SlidingWindowRateLimiter, clock: FakeClock
) -> None:
    limiter.hit("1.2.3.4")
    clock.now += 10
    limiter.hit("1.2.3.4")

    with pytest.raises(RateLimitExceededError) as exc_info:
        limiter.hit("1.2.3.4")

    assert exc_info.value.retry_after_seconds == 50
    assert exc_info.value.headers() == {"Retry-After": "50"}


def test_limits_each_key_independently(limiter: SlidingWindowRateLimiter) -> None:
    limiter.hit("a")
    limiter.hit("a")

    limiter.hit("b")


def test_window_slides_and_frees_capacity(
    limiter: SlidingWindowRateLimiter, clock: FakeClock
) -> None:
    limiter.hit("a")
    clock.now += 30
    limiter.hit("a")
    clock.now += 31  # the first hit is now older than the window

    limiter.hit("a")
    with pytest.raises(RateLimitExceededError):
        limiter.hit("a")


def test_rejected_requests_do_not_extend_the_block(
    limiter: SlidingWindowRateLimiter, clock: FakeClock
) -> None:
    limiter.hit("a")
    limiter.hit("a")
    with pytest.raises(RateLimitExceededError):
        limiter.hit("a")

    clock.now += 60
    limiter.hit("a")


def test_expired_keys_are_forgotten(limiter: SlidingWindowRateLimiter, clock: FakeClock) -> None:
    limiter.hit("a")
    limiter.hit("b")
    clock.now += 61

    limiter.hit("c")

    assert limiter.tracked_keys == 1


@pytest.mark.parametrize(("max_requests", "window"), [(0, 60), (1, 0)])
def test_rejects_invalid_configuration(max_requests: int, window: float) -> None:
    with pytest.raises(ValueError, match="max_requests"):
        SlidingWindowRateLimiter(max_requests=max_requests, window_seconds=window)
